import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Razorpay from "razorpay";
import { validateCoupon } from "@/lib/coupons";

export async function POST(req: NextRequest) {
  try {
    const { items, couponCode } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "Cart items are required." }, { status: 400 });
    }

    // 1. Fetch Razorpay Configuration
    const paymentRef = doc(db, "payment_settings", "config");
    const paymentSnap = await getDoc(paymentRef);

    if (!paymentSnap.exists()) {
      return NextResponse.json({ message: "Payment configuration not found." }, { status: 500 });
    }

    const { razorpayKeyId, razorpayKeySecret, razorpayEnabled } = paymentSnap.data();

    if (!razorpayEnabled) {
      return NextResponse.json({ message: "Payment gateway is currently disabled." }, { status: 400 });
    }

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json({ message: "Payment configuration is incomplete." }, { status: 500 });
    }

    // 2. Fetch and Validate product prices from database (never trust client amounts)
    let subtotal = 0;
    const resolvedItems = [];

    for (const item of items) {
      if (!item.id || !item.quantity || item.quantity <= 0) {
        return NextResponse.json({ message: "Invalid item in cart." }, { status: 400 });
      }

      const productRef = doc(db, "products", item.id);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        return NextResponse.json({ message: `Product not found: ${item.id}` }, { status: 400 });
      }

      const productData = productSnap.data();
      const price = Number(productData.price) || 0;
      subtotal += price * item.quantity;

      resolvedItems.push({
        id: item.id,
        name: productData.name,
        price: price,
        quantity: item.quantity,
        image: productData.image || ""
      });
    }

    // 3. Validate Coupon if applied
    let discount = 0;
    if (couponCode) {
      const validationResult = await validateCoupon(couponCode, subtotal);
      if (validationResult.isValid) {
        discount = validationResult.discount;
      } else {
        return NextResponse.json({ message: validationResult.error || "Invalid coupon code." }, { status: 400 });
      }
    }

    // 4. Fetch Shipping Config from settings/store
    const deliveryRef = doc(db, "settings", "store");
    const deliverySnap = await getDoc(deliveryRef);
    let deliveryConfig = {
      shippingFee: 99,
      codCharge: 49,
      freeDeliveryThreshold: 999,
      enableCOD: true,
      enableFreeShipping: true,
      deliveryMessage: "Free shipping on orders above ₹999"
    };

    if (deliverySnap.exists()) {
      const d = deliverySnap.data();
      deliveryConfig = {
        shippingFee: d.shippingFee !== undefined ? Number(d.shippingFee) : 99,
        codCharge: d.codCharge !== undefined ? Number(d.codCharge) : 49,
        freeDeliveryThreshold: d.freeDeliveryThreshold !== undefined ? Number(d.freeDeliveryThreshold) : 999,
        enableCOD: d.enableCOD !== undefined ? Boolean(d.enableCOD) : true,
        enableFreeShipping: d.enableFreeShipping !== undefined ? Boolean(d.enableFreeShipping) : true,
        deliveryMessage: d.deliveryMessage !== undefined ? String(d.deliveryMessage) : "Free shipping on orders above ₹999",
      };
    }

    // 5. Calculate Shipping Fee dynamically
    const netSubtotal = Math.max(0, subtotal - discount);
    const isFreeShippingEligible = deliveryConfig.enableFreeShipping && netSubtotal >= deliveryConfig.freeDeliveryThreshold;
    const shippingFee = subtotal === 0 ? 0 : (isFreeShippingEligible ? 0 : deliveryConfig.shippingFee);

    // 6. Calculate Final Total (No GST)
    const finalTotal = netSubtotal + shippingFee;

    if (finalTotal <= 0) {
      return NextResponse.json({ message: "Invalid order amount." }, { status: 400 });
    }

    // 7. Initialize Razorpay SDK on server
    const rzp = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret
    });

    // 8. Create Razorpay Order
    const options = {
      amount: Math.round(finalTotal * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    };

    const rzpOrder = await rzp.orders.create(options);

    return NextResponse.json({
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { message: error.message || "Failed to initiate payment transaction." },
      { status: 500 }
    );
  }
}
