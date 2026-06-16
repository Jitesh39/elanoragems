import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ message: "Missing x-razorpay-signature header." }, { status: 400 });
    }

    const rawBody = await req.text();

    // 1. Fetch Webhook Secret from payment_settings/config (or fall back to env)
    const paymentRef = doc(db, "payment_settings", "config");
    const paymentSnap = await getDoc(paymentRef);
    
    let webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    if (paymentSnap.exists()) {
      const data = paymentSnap.data();
      webhookSecret = data.razorpayWebhookSecret || webhookSecret;
    }

    if (!webhookSecret) {
      console.warn("Razorpay Webhook secret is not configured. Webhook verification skipped or will fail.");
    }

    // 2. Cryptographic Signature Verification
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ message: "Invalid webhook signature." }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.event;
    console.log(`[RAZORPAY WEBHOOK] Received event: ${eventType}`);

    if (eventType === "payment.captured" || eventType === "order.paid") {
      const payment = payload.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;

      if (orderId) {
        // Query order by razorpayOrderId
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("razorpayOrderId", "==", orderId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const orderDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, "orders", orderDoc.id), {
            paymentStatus: "Paid",
            orderStatus: "confirmed",
            razorpayPaymentId: paymentId
          });
          console.log(`[RAZORPAY WEBHOOK] Order ${orderDoc.id} updated to Paid.`);
        } else {
          console.warn(`[RAZORPAY WEBHOOK] No order document found matching razorpayOrderId: ${orderId}`);
        }
      }
    } else if (eventType === "payment.failed") {
      const payment = payload.payload.payment.entity;
      const orderId = payment.order_id;

      if (orderId) {
        // Query order by razorpayOrderId
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("razorpayOrderId", "==", orderId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const orderDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, "orders", orderDoc.id), {
            paymentStatus: "Failed"
          });
          console.log(`[RAZORPAY WEBHOOK] Order ${orderDoc.id} updated to Failed.`);
        }
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Error handling Razorpay Webhook:", error);
    return NextResponse.json(
      { message: error.message || "Webhook processing error." },
      { status: 500 }
    );
  }
}
