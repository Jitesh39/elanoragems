import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, setDoc, collection, query, where, getDocs, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import nodemailer from "nodemailer";
import { createNotification, checkAndCreateStockAlert } from "@/lib/notifications";
import { validateCoupon } from "@/lib/coupons";

function generateConfirmationEmailHtml(orderNumber: string, orderData: any) {
  const itemsRows = orderData.products.map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #E4E4E7; font-size: 14px; color: #1E1E1E;">
        ${item.name} ${item.material ? `(${item.material})` : ""}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #E4E4E7; font-size: 14px; color: #1E1E1E; text-align: center;">
        x${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #E4E4E7; font-size: 14px; color: #1E1E1E; text-align: right; font-weight: bold;">
        ₹${(item.price * item.quantity).toLocaleString("en-IN")}
      </td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed - ElanoraGems</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F4F0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F4F0; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 47, 107, 0.05); border: 1px solid rgba(212, 175, 55, 0.15);" border="0" cellspacing="0" cellpadding="0">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0F2F6B; padding: 35px 20px; text-align: center;">
              <h1 style="color: #ffffff; font-family: Georgia, serif; font-size: 26px; margin: 0; letter-spacing: 2px;">
                Elanora<span style="color: #D4AF37; font-family: sans-serif; font-weight: normal;">Gems</span>
              </h1>
              <p style="color: #D4AF37; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin: 6px 0 0 0; font-weight: bold;">
                Order Placed (COD)
              </p>
            </td>
          </tr>

          <!-- Success Greeting -->
          <tr>
            <td style="padding: 40px 30px 20px 30px; text-align: center;">
              <div style="font-size: 40px; margin-bottom: 15px;">📦</div>
              <h2 style="font-family: Georgia, serif; font-size: 22px; color: #0F2F6B; margin: 0 0 10px 0;">Order Placed Successfully!</h2>
              <p style="font-size: 14px; color: #71717A; line-height: 1.5; margin: 0; max-width: 400px; margin: 0 auto;">
                Thank you for your purchase. Your Cash on Delivery order has been registered and is being processed.
              </p>
            </td>
          </tr>

          <!-- Order Summary Details -->
          <tr>
            <td style="padding: 20px 30px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                  <tr style="background-color: #F8F4F0;">
                    <th style="padding: 12px; font-size: 12px; font-weight: bold; color: #0F2F6B; text-align: left; text-transform: uppercase;">Ornament</th>
                    <th style="padding: 12px; font-size: 12px; font-weight: bold; color: #0F2F6B; text-align: center; text-transform: uppercase;">Qty</th>
                    <th style="padding: 12px; font-size: 12px; font-weight: bold; color: #0F2F6B; text-align: right; text-transform: uppercase;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <!-- Calculation totals -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px; line-height: 1.8; color: #52525B;">
                <tr>
                  <td style="padding: 4px 12px;">Subtotal</td>
                  <td style="padding: 4px 12px; text-align: right; font-weight: bold; color: #1E1E1E;">₹${orderData.subtotal.toLocaleString("en-IN")}</td>
                </tr>
                ${orderData.discount > 0 ? `
                <tr>
                  <td style="padding: 4px 12px; color: #15803d;">Coupon Discount</td>
                  <td style="padding: 4px 12px; text-align: right; font-weight: bold; color: #15803d;">-₹${orderData.discount.toLocaleString("en-IN")}</td>
                </tr>
                ` : ""}
                <tr>
                  <td style="padding: 4px 12px; ${!orderData.codCharge ? 'border-bottom: 1px dashed #E4E4E7; padding-bottom: 10px;' : ''}">Shipping Fee</td>
                  <td style="padding: 4px 12px; text-align: right; font-weight: bold; color: #1E1E1E; ${!orderData.codCharge ? 'border-bottom: 1px dashed #E4E4E7; padding-bottom: 10px;' : ''}">${orderData.shipping > 0 ? `₹${orderData.shipping.toLocaleString("en-IN")}` : "FREE"}</td>
                </tr>
                ${orderData.codCharge > 0 ? `
                <tr>
                  <td style="padding: 4px 12px; border-bottom: 1px dashed #E4E4E7; padding-bottom: 10px;">COD Charge</td>
                  <td style="padding: 4px 12px; text-align: right; font-weight: bold; color: #1E1E1E; border-bottom: 1px dashed #E4E4E7; padding-bottom: 10px;">₹${orderData.codCharge.toLocaleString("en-IN")}</td>
                </tr>
                ` : ""}
                <tr style="font-size: 16px; font-weight: bold;">
                  <td style="padding: 12px; color: #0F2F6B;">Total Amount</td>
                  <td style="padding: 12px; text-align: right; color: #D4AF37;">₹${orderData.total.toLocaleString("en-IN")}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Shipping and Invoice info -->
          <tr>
            <td style="padding: 20px 30px 40px 30px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F4F0; border-radius: 12px; padding: 20px; font-size: 13px; line-height: 1.5; color: #1E1E1E;">
                <tr>
                  <td width="50%" valign="top" style="padding-right: 10px;">
                    <strong style="color: #0F2F6B; display: block; margin-bottom: 6px; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Shipping Destination</strong>
                    ${orderData.shippingAddress.fullName}<br/>
                    ${orderData.shippingAddress.street}<br/>
                    ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} - ${orderData.shippingAddress.zipCode}<br/>
                    Phone: +91 ${orderData.shippingAddress.phone}
                  </td>
                  <td width="50%" valign="top" style="padding-left: 10px; border-left: 1px solid #E4E4E7;">
                    <strong style="color: #0F2F6B; display: block; margin-bottom: 6px; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Order Metadata</strong>
                    <strong>Order Number:</strong> ${orderNumber}<br/>
                    <strong>Payment Method:</strong> COD<br/>
                    <strong>Payment Status:</strong> Pending
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8F4F0; padding: 30px 20px; text-align: center; border-top: 1px solid rgba(15, 47, 107, 0.05);">
              <p style="font-size: 12px; color: #71717A; margin: 0 0 15px 0;">
                If you have any questions, please contact support at gemselanora@gmail.com
              </p>
              <p style="font-size: 11px; color: #A1A1AA; margin: 0;">
                © 2026 ElanoraGems. All rights reserved. Developed by TheStudySmith.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { items, couponCode, shippingAddress, userId, customerEmail, customerName } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0 || !shippingAddress) {
      return NextResponse.json({ message: "Invalid order parameters." }, { status: 400 });
    }

    // 1. Fetch Shipping Config from settings/store
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

    if (!deliveryConfig.enableCOD) {
      return NextResponse.json({ message: "Cash on Delivery is currently disabled." }, { status: 400 });
    }

    // 2. Fetch and Validate product prices
    let subtotal = 0;
    const resolvedItems = [];

    for (const item of items) {
      const productRef = doc(db, "products", item.productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        return NextResponse.json({ message: `Product not found: ${item.productId}` }, { status: 400 });
      }

      const productData = productSnap.data();
      const price = Number(productData.price) || 0;
      subtotal += price * item.quantity;

      resolvedItems.push({
        productId: item.productId,
        name: productData.name,
        price: price,
        quantity: item.quantity,
        image: productData.image || "",
        material: item.material || ""
      });
    }

    // 3. Validate Coupon
    let discount = 0;
    if (couponCode) {
      const validationResult = await validateCoupon(couponCode, subtotal);
      if (validationResult.isValid) {
        discount = validationResult.discount;
      } else {
        return NextResponse.json({ message: validationResult.error || "Invalid coupon code." }, { status: 400 });
      }
    }

    // 4. Calculate dynamic shipping fee
    const netSubtotal = Math.max(0, subtotal - discount);
    const isFreeShippingEligible = deliveryConfig.enableFreeShipping && netSubtotal >= deliveryConfig.freeDeliveryThreshold;
    const shippingFee = subtotal === 0 ? 0 : (isFreeShippingEligible ? 0 : deliveryConfig.shippingFee);

    // 5. Calculate final total with COD charge (GST is completely removed)
    const finalTotal = netSubtotal + shippingFee + deliveryConfig.codCharge;

    // 6. Generate Unique Order Number
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const orderNumber = `ELN-${randomSuffix}`;

    // 7. Save validated COD order to Firestore
    const finalOrderObject = {
      orderId: orderNumber,
      orderNumber: orderNumber,
      userId: userId || "guest",
      userEmail: customerEmail || "",
      customerName: customerName || shippingAddress.fullName || "",
      customerPhone: shippingAddress.phone || "",
      shippingAddress: shippingAddress,
      products: resolvedItems.map((item: any) => ({
        productId: item.productId,
        productName: item.name,
        productImage: item.image,
        quantity: item.quantity,
        price: item.price,
        // Compatibility keys:
        name: item.name,
        image: item.image,
        material: item.material || ""
      })),
      subtotal: Number(subtotal),
      shippingFee: Number(shippingFee),
      shipping: Number(shippingFee), // compatibility
      discount: Number(discount),
      codCharge: Number(deliveryConfig.codCharge),
      totalAmount: Number(finalTotal),
      total: Number(finalTotal), // compatibility
      paymentMethod: "COD",
      paymentStatus: "Pending",
      orderStatus: "Confirmed",
      couponCode: couponCode ? couponCode.trim().toUpperCase() : null,
      couponApplied: couponCode ? couponCode.trim().toUpperCase() : null,
      createdAt: serverTimestamp()
    };

    await setDoc(doc(db, "orders", orderNumber), finalOrderObject);

    // Increment coupon used count if coupon was used
    if (couponCode) {
      try {
        const cleanCoupon = couponCode.trim().toUpperCase();
        await updateDoc(doc(db, "coupons", cleanCoupon), {
          usedCount: increment(1)
        });
      } catch (err) {
        console.error("Failed to increment coupon usedCount:", err);
      }
    }

    // Decrement product stock and trigger inventory alerts
    if (finalOrderObject.products && Array.isArray(finalOrderObject.products)) {
      for (const item of finalOrderObject.products) {
        try {
          const productRef = doc(db, "products", item.productId);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            const currentStock = Number(productSnap.data().stock) || 0;
            const newStock = Math.max(0, currentStock - (Number(item.quantity) || 0));
            await updateDoc(productRef, { stock: newStock });
            
            // Check and trigger Low Stock or Out of Stock notifications
            await checkAndCreateStockAlert(item.productId, productSnap.data().name, newStock);
          }
        } catch (stockErr) {
          console.error(`Failed to update stock for product ${item.productId}:`, stockErr);
        }
      }
    }

    // Trigger NEW ORDER notification
    try {
      await createNotification({
        type: "order",
        title: `New Order #${orderNumber}`,
        message: `${finalOrderObject.customerName} placed an order for ₹${finalOrderObject.totalAmount.toLocaleString("en-IN")}.`,
        referenceId: orderNumber
      });
    } catch (notifErr) {
      console.error("Failed to create order notification:", notifErr);
    }

    // 8. Send order confirmation email
    const cleanEmail = customerEmail;
    if (cleanEmail && cleanEmail !== "Guest") {
      const subject = `Order Confirmed (COD): ${orderNumber}`;
      const emailHtml = generateConfirmationEmailHtml(orderNumber, finalOrderObject);

      // Check mail transporter setup
      const hasSmtp =
        process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASSWORD;
      const hasResend = process.env.RESEND_API_KEY;

      if (hasSmtp) {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            },
          });
          await transporter.sendMail({
            from: process.env.SMTP_FROM || `"ElanoraGems" <${process.env.SMTP_USER}>`,
            to: cleanEmail,
            subject: subject,
            html: emailHtml,
          });
        } catch (mailError) {
          console.error("Failed to send COD order email via SMTP:", mailError);
        }
      } else if (hasResend) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: process.env.RESEND_FROM || "ElanoraGems <onboarding@resend.dev>",
              to: [cleanEmail],
              subject: subject,
              html: emailHtml,
            }),
          });
        } catch (resendError) {
          console.error("Failed to send COD order email via Resend API:", resendError);
        }
      } else {
        // Mock mode log
        console.log("==================================================");
        console.log(`[MOCK COD ORDER CONFIRMATION EMAIL] Sent to: ${cleanEmail}`);
        console.log(`[ORDER NUMBER] ${orderNumber}`);
        console.log(`[TOTAL AMOUNT] ₹${finalOrderObject.total}`);
        console.log("------------------ EMAIL HTML ------------------");
        console.log(emailHtml);
        console.log("==================================================");
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber: orderNumber,
      message: "COD order placed and confirmed successfully."
    });
  } catch (error: any) {
    console.error("Error creating COD order:", error);
    return NextResponse.json(
      { message: error.message || "Failed to place COD order." },
      { status: 500 }
    );
  }
}
