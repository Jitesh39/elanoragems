import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import nodemailer from "nodemailer";

function generateEmailHtml(product: any, productUrl: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Arrival at ElanoraGems</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F4F0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F4F0; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 47, 107, 0.05); border: 1px solid rgba(212, 175, 55, 0.15);" border="0" cellspacing="0" cellpadding="0">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0F2F6B; padding: 35px 20px; text-align: center;">
              <h1 style="color: #ffffff; font-family: Georgia, serif; font-size: 28px; margin: 0; letter-spacing: 2px; font-weight: bold;">
                Elanora<span style="color: #D4AF37; font-family: sans-serif; font-weight: normal;">Gems</span>
              </h1>
              <p style="color: #D4AF37; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin: 6px 0 0 0; font-weight: bold;">
                Premium Luxury Jewellery
              </p>
            </td>
          </tr>
          
          <!-- Product Banner Image -->
          ${
            product.image
              ? `
          <tr>
            <td style="padding: 0;">
              <img src="${product.image}" alt="${product.name}" style="width: 100%; max-height: 400px; object-fit: cover; display: block; margin: 0 auto;" />
            </td>
          </tr>
          `
              : ""
          }

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; color: #1E1E1E; line-height: 1.6; margin: 0 0 20px 0;">
                Hello,
              </p>
              <p style="font-size: 16px; color: #1E1E1E; line-height: 1.6; margin: 0 0 30px 0;">
                A new jewellery piece has just arrived at ElanoraGems.
              </p>
              
              <!-- Product Card -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F4F0; border-radius: 12px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #D4AF37;">
                <tr>
                  <td>
                    <h2 style="font-family: Georgia, serif; font-size: 22px; color: #0F2F6B; margin: 0 0 10px 0; font-weight: bold;">
                      ${product.name}
                    </h2>
                    <p style="font-size: 20px; font-weight: bold; color: #0F2F6B; margin: 0 0 15px 0;">
                      Price: <span style="color: #D4AF37;">₹${Number(product.price).toLocaleString("en-IN")}</span>
                    </p>
                    <p style="font-size: 14px; color: #71717A; margin: 0 0 8px 0; line-height: 1.4;">
                      <strong>Category:</strong> ${product.category}
                    </p>
                    <p style="font-size: 14px; color: #1E1E1E; line-height: 1.5; margin: 0;">
                      <strong>Description:</strong> ${product.description}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-top: 10px; padding-bottom: 15px;">
                    <a href="${productUrl}" target="_blank" style="background-color: #0F2F6B; color: #ffffff; text-decoration: none; padding: 16px 36px; font-size: 13px; font-weight: bold; border-radius: 30px; display: inline-block; letter-spacing: 1.5px; text-transform: uppercase; box-shadow: 0 4px 12px rgba(15, 47, 107, 0.25);">
                      Shop Now
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td style="background-color: #F8F4F0; padding: 30px 20px; text-align: center; border-top: 1px solid rgba(15, 47, 107, 0.05);">
              <p style="font-size: 13px; color: #71717A; margin: 0 0 8px 0;">
                Thank you for being part of ElanoraGems.
              </p>
              <p style="font-size: 13px; font-weight: bold; color: #0F2F6B; margin: 0 0 20px 0;">
                Team ElanoraGems
              </p>
              <p style="font-size: 10px; color: #A1A1AA; line-height: 1.5; margin: 0;">
                You are receiving this email because you subscribed to updates from ElanoraGems.<br/>
                If you wish to unsubscribe, please contact us or update your preferences.
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
    const { product } = await req.json();

    if (!product || !product.name) {
      return NextResponse.json({ error: "Product information is required." }, { status: 400 });
    }

    // 1. Fetch all active subscribers
    const subscribersRef = collection(db, "subscribers");
    const q = query(subscribersRef, where("status", "==", "active"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json({
        success: true,
        message: "No active subscribers to notify.",
        count: 0,
      });
    }

    const recipientEmails = snapshot.docs.map((doc) => doc.data().email as string).filter(Boolean);

    // Get origin to form the product URL
    const origin = req.nextUrl.origin || "https://elanoragems.in";
    const productUrl = `${origin}/product/${product.slug || ""}`;

    const subject = `✨ New Arrival at ElanoraGems — ${product.name}`;
    const emailHtml = generateEmailHtml(product, productUrl);

    // Check configuration
    const hasSmtp =
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD;
    const hasResend = process.env.RESEND_API_KEY;

    let mode = "mock";
    let sentCount = 0;

    if (hasSmtp) {
      mode = "smtp";
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      // Send to each subscriber in parallel
      const emailPromises = recipientEmails.map((email) => {
        return transporter.sendMail({
          from: process.env.SMTP_FROM || `"ElanoraGems" <${process.env.SMTP_USER}>`,
          to: email,
          subject: subject,
          html: emailHtml,
        });
      });

      const results = await Promise.allSettled(emailPromises);
      sentCount = results.filter((r) => r.status === "fulfilled").length;
    } else if (hasResend) {
      mode = "resend";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "ElanoraGems <onboarding@resend.dev>",
          to: recipientEmails,
          subject: subject,
          html: emailHtml,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Resend API failed: ${errText}`);
      }
      sentCount = recipientEmails.length;
    } else {
      // Mock mode
      console.log("==================================================");
      console.log(`[MOCK EMAIL BROADCAST] Subject: ${subject}`);
      console.log(`[RECIPIENTS] Sending to: ${recipientEmails.join(", ")}`);
      console.log(`[PRODUCT URL] ${productUrl}`);
      console.log("------------------ EMAIL HTML ------------------");
      console.log(emailHtml);
      console.log("==================================================");
      sentCount = recipientEmails.length;
    }

    return NextResponse.json({
      success: true,
      mode,
      totalRecipients: recipientEmails.length,
      sentCount,
      message: `Successfully broadcasted to ${sentCount} subscribers.`,
    });
  } catch (error: any) {
    console.error("Error sending newsletter notifications:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send newsletter notifications." },
      { status: 500 }
    );
  }
}
