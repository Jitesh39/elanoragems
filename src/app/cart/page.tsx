"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { validateCoupon } from "@/lib/coupons";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, Truck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CartPage() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, cartSubtotal } = useCart();
  
  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState("");

  const [deliveryConfig, setDeliveryConfig] = useState({
    shippingFee: 99,
    codCharge: 49,
    freeDeliveryThreshold: 999,
    enableCOD: true,
    enableFreeShipping: true,
    deliveryMessage: "Free shipping on orders above ₹999"
  });

  useEffect(() => {
    const deliveryRef = doc(db, "settings", "store");
    const unsubscribe = onSnapshot(deliveryRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDeliveryConfig({
          shippingFee: data.shippingFee !== undefined ? Number(data.shippingFee) : 99,
          codCharge: data.codCharge !== undefined ? Number(data.codCharge) : 49,
          freeDeliveryThreshold: data.freeDeliveryThreshold !== undefined ? Number(data.freeDeliveryThreshold) : 999,
          enableCOD: data.enableCOD !== undefined ? Boolean(data.enableCOD) : true,
          enableFreeShipping: data.enableFreeShipping !== undefined ? Boolean(data.enableFreeShipping) : true,
          deliveryMessage: data.deliveryMessage !== undefined ? String(data.deliveryMessage) : "Free shipping on orders above ₹999",
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const cleaned = couponCode.trim().toUpperCase();
    const result = await validateCoupon(cleaned, cartSubtotal);
    if (result.isValid) {
      setAppliedCoupon(cleaned);
      setDiscountAmount(result.discount);
    } else {
      setCouponError(result.error || "Invalid coupon code");
    }
  };

  // Re-validate applied coupon if subtotal changes
  useEffect(() => {
    if (appliedCoupon) {
      const revalidate = async () => {
        const result = await validateCoupon(appliedCoupon, cartSubtotal);
        if (result.isValid) {
          setDiscountAmount(result.discount);
        } else {
          setAppliedCoupon(null);
          setDiscountAmount(0);
          setCouponError(result.error || "Coupon removed due to changes in cart.");
        }
      };
      revalidate();
    }
  }, [cartSubtotal, appliedCoupon]);

  const isFreeShippingEligible = deliveryConfig.enableFreeShipping && (cartSubtotal - discountAmount) >= deliveryConfig.freeDeliveryThreshold;
  const shippingFee = cartSubtotal === 0 ? 0 : (isFreeShippingEligible ? 0 : deliveryConfig.shippingFee);
  const remainingForFreeShipping = deliveryConfig.freeDeliveryThreshold - (cartSubtotal - discountAmount);
  const progressPercent = Math.min(((cartSubtotal - discountAmount) / deliveryConfig.freeDeliveryThreshold) * 100, 100);

  const finalTotal = cartSubtotal - discountAmount + shippingFee;

  const handleCheckoutRedirect = () => {
    const couponQuery = appliedCoupon ? `?coupon=${appliedCoupon}` : "";
    router.push(`/checkout${couponQuery}`);
  };

  return (
    <div className="min-h-screen bg-accent/10 flex flex-col justify-between">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
        <div className="border-b border-zinc-200 pb-5 mb-8">
          <span className="text-secondary text-xs font-bold uppercase tracking-widest">Your Ornaments</span>
          <h1 className="font-serif text-3xl font-bold text-primary mt-1">Review Shopping Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white border border-zinc-100 rounded-3xl p-8 max-w-lg mx-auto shadow-sm space-y-4">
            <ShoppingBag size={48} className="text-zinc-200 mx-auto" />
            <p className="font-serif text-sm font-semibold text-zinc-400">Your cart is empty</p>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-6">Explore our catalog and find the perfect pieces of luxury to add to your collection.</p>
            <Link href="/collections" className="btn-premium btn-primary text-xs">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Cart Items (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Shipping progress alert */}
              <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
                  <Truck size={16} className="text-secondary" />
                  {remainingForFreeShipping > 0 ? (
                    <span>Add <span className="text-secondary">₹{remainingForFreeShipping}</span> more for FREE Shipping</span>
                  ) : (
                    <span className="text-green-700 font-bold">✅ You qualify for FREE Shipping</span>
                  )}
                </div>
                <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 border-b border-zinc-100 last:border-0 last:pb-0 first:pt-0">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl border border-zinc-100 bg-accent" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm sm:text-base font-semibold text-dark">{item.name}</h3>
                          <button onClick={() => removeFromCart(item.id)} className="text-zinc-400 hover:text-red-500 transition-colors p-0.5"><Trash2 size={16} /></button>
                        </div>
                        {(item.size || item.material) && (
                          <div className="flex gap-2 text-[10px] text-zinc-500 font-semibold uppercase mt-1">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.material && <span>• {item.material}</span>}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-zinc-200 rounded-md bg-white">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-zinc-50 text-zinc-500"><Minus size={12} /></button>
                          <span className="px-3 text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-zinc-50 text-zinc-500"><Plus size={12} /></button>
                        </div>
                        <span className="text-sm font-bold text-primary">₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Right: Calculations Summary (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="font-serif text-lg font-bold text-primary border-b border-zinc-100 pb-2">Price Details</h3>
                
                {/* Coupon Code Form */}
                {!appliedCoupon ? (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs uppercase outline-none focus:border-secondary"
                    />
                    <button type="submit" className="px-4 py-2 bg-primary text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">Apply</button>
                  </form>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 flex items-center justify-between text-xs text-green-800">
                    <span className="font-semibold">Coupon &quot;{appliedCoupon}&quot; (-₹{discountAmount})</span>
                    <button onClick={() => { setAppliedCoupon(null); setDiscountAmount(0); }} className="text-red-600 font-bold hover:underline">Remove</button>
                  </div>
                )}
                {couponError && <p className="text-red-500 text-[10px] font-semibold mt-1">{couponError}</p>}

                {/* Subtotals */}
                <div className="space-y-3 text-xs text-zinc-500 border-b border-zinc-100 pb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-primary">₹{cartSubtotal}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-700 font-semibold">
                      <span>Discount</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span className="font-semibold text-primary">{shippingFee > 0 ? `₹${shippingFee}` : "FREE"}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center text-sm font-bold text-primary">
                  <span>Estimated Total</span>
                  <span className="font-serif text-base text-secondary">₹{finalTotal}</span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckoutRedirect}
                  className="w-full py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-primary-hover transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  Proceed To Checkout <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
