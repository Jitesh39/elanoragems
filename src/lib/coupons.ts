import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  expiryDate: any; // Firestore Timestamp
  createdAt?: any;
  createdBy?: string;
}

/**
 * Validates a coupon code against Firestore and returns details.
 */
export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{ isValid: boolean; discount: number; error?: string; coupon?: Coupon }> {
  if (!code) {
    return { isValid: false, discount: 0, error: "Coupon code is empty." };
  }

  const cleanCode = code.trim().toUpperCase();
  try {
    const couponRef = doc(db, "coupons", cleanCode);
    const couponSnap = await getDoc(couponRef);

    if (!couponSnap.exists()) {
      return { isValid: false, discount: 0, error: "Invalid coupon code." };
    }

    const data = couponSnap.data();
    const coupon = { id: couponSnap.id, ...data } as Coupon;

    // 1. Check active status
    if (coupon.active === false) {
      return { isValid: false, discount: 0, error: "This coupon is disabled." };
    }

    // 2. Check expiry
    if (coupon.expiryDate) {
      const expiryDate = typeof coupon.expiryDate.toDate === "function"
        ? coupon.expiryDate.toDate()
        : new Date(coupon.expiryDate);

      const now = new Date();
      if (now > expiryDate) {
        return { isValid: false, discount: 0, error: "This coupon has expired." };
      }
    }

    // 3. Check usage limit
    if (coupon.usageLimit !== undefined && coupon.usedCount !== undefined) {
      if (coupon.usedCount >= coupon.usageLimit) {
        return { isValid: false, discount: 0, error: "Coupon usage limit reached." };
      }
    }

    // 4. Check minimum purchase
    const minPurchase = Number(coupon.minPurchase) || 0;
    if (subtotal < minPurchase) {
      return { isValid: false, discount: 0, error: `Minimum purchase of ₹${minPurchase} required.` };
    }

    // 5. Calculate discount
    let discount = 0;
    const value = Number(coupon.value) || 0;
    if (coupon.type === "percentage") {
      discount = Math.round(subtotal * (value / 100));
      const maxDiscount = Number(coupon.maxDiscount);
      if (maxDiscount > 0 && discount > maxDiscount) {
        discount = maxDiscount;
      }
    } else if (coupon.type === "fixed") {
      discount = value;
    }

    // Discount cannot exceed subtotal
    if (discount > subtotal) {
      discount = subtotal;
    }

    return { isValid: true, discount, coupon };
  } catch (error) {
    console.error("Error validating coupon:", error);
    return { isValid: false, discount: 0, error: "Error validating coupon code." };
  }
}
