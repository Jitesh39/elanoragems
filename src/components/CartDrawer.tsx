"use client";

import React, { useState, useEffect } from "react";
import Link from "next/navigation";
import { validateCoupon } from "@/lib/coupons";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag, Truck, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const { 
    cartItems, 
    cartOpen, 
    setCartOpen, 
    updateQuantity, 
    removeFromCart, 
    cartSubtotal 
  } = useCart();

  // Coupon state
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

  const currentDiscount = appliedCoupon ? discountAmount : 0;

  // Re-validate applied coupon if subtotal changes
  useEffect(() => {
    if (appliedCoupon) {
      const revalidate = async () => {
        const result = await validateCoupon(appliedCoupon, cartSubtotal);
        if (result.isValid) {
          setDiscountAmount(result.discount);
        } else {
          // If no longer valid (e.g. subtotal fell below minPurchase), remove it
          setAppliedCoupon(null);
          setDiscountAmount(0);
          setCouponError(result.error || "Coupon removed due to changes in cart.");
        }
      };
      revalidate();
    }
  }, [cartSubtotal, appliedCoupon]);

  // Free shipping calculations
  const isFreeShippingEligible = deliveryConfig.enableFreeShipping && (cartSubtotal - currentDiscount) >= deliveryConfig.freeDeliveryThreshold;
  const shippingFee = cartSubtotal === 0 ? 0 : (isFreeShippingEligible ? 0 : deliveryConfig.shippingFee);
  const remainingForFreeShipping = deliveryConfig.freeDeliveryThreshold - (cartSubtotal - currentDiscount);
  const progressPercent = Math.min(((cartSubtotal - currentDiscount) / deliveryConfig.freeDeliveryThreshold) * 100, 100);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const cleanedCode = couponCode.trim().toUpperCase();

    const result = await validateCoupon(cleanedCode, cartSubtotal);
    if (result.isValid) {
      setAppliedCoupon(cleanedCode);
      setDiscountAmount(result.discount);
    } else {
      setCouponError(result.error || "Invalid coupon code");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
  };

  const finalTotal = cartSubtotal - currentDiscount + shippingFee;

  const handleCheckoutRedirect = () => {
    setCartOpen(false);
    // Push the state or query containing discount details to checkout page
    const couponQuery = appliedCoupon ? `?coupon=${appliedCoupon}` : "";
    router.push(`/checkout${couponQuery}`);
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Cart Sliding Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: "easeOut" }}
            className="fixed inset-y-0 right-0 w-full sm:max-w-[450px] bg-white z-50 shadow-2xl flex flex-col h-full"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-2 text-primary">
                <ShoppingBag size={20} className="text-secondary" />
                <h3 className="font-serif text-lg font-bold">Shopping Cart</h3>
                <span className="text-xs font-semibold px-2 py-0.5 bg-zinc-200 text-zinc-700 rounded-full">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)} items
                </span>
              </div>
              <button 
                onClick={() => setCartOpen(false)} 
                className="p-1.5 rounded-full hover:bg-zinc-200 text-zinc-500 transition-colors"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Free Shipping Progress Alert */}
            {cartItems.length > 0 && (
              <div className="p-4 bg-accent/60 border-b border-zinc-100 px-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
                  <Truck size={16} className="text-secondary" />
                  {remainingForFreeShipping > 0 ? (
                    <span>
                      Add <span className="text-secondary">₹{remainingForFreeShipping}</span> more for FREE Shipping
                    </span>
                  ) : (
                    <span className="text-green-700 font-bold">✅ You qualify for FREE Shipping</span>
                  )}
                </div>
                <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-secondary h-full transition-all duration-500 ease-out" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <ShoppingBag size={64} className="text-zinc-300 mb-4 stroke-[1.5]" />
                  <p className="font-serif text-lg font-medium text-zinc-500">Your cart is empty</p>
                  <p className="text-xs text-zinc-400 mt-1 max-w-[240px]">Browse our latest collections and find your perfect piece of luxury.</p>
                  <button 
                    onClick={() => setCartOpen(false)}
                    className="mt-6 px-6 py-2.5 bg-primary text-white text-xs font-bold uppercase rounded-md tracking-wider hover:bg-primary-hover transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 border border-zinc-100 rounded-lg hover:shadow-sm transition-shadow">
                    {/* Thumbnail */}
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-20 h-20 object-cover rounded-md border border-zinc-100 bg-accent"
                    />

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-sm font-semibold text-dark leading-tight line-clamp-1">{item.name}</h4>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-zinc-400 hover:text-red-500 transition-colors p-0.5"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        {/* Options Info */}
                        {(item.size || item.material) && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.size && (
                              <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">
                                Size: {item.size}
                              </span>
                            )}
                            {item.material && (
                              <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">
                                {item.material}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Quantity Controls & Price */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-zinc-200 rounded-md">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-zinc-50 text-zinc-500"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-3 text-xs font-semibold select-none">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-zinc-50 text-zinc-500"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <div className="text-sm font-bold text-primary">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Calculator / Summary */}
            {cartItems.length > 0 && (
              <div className="border-t border-zinc-100 p-6 bg-zinc-50 space-y-4">
                {/* Coupon Code Input */}
                {!appliedCoupon ? (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                      <input
                        type="text"
                        placeholder="Apply Coupon (e.g. ELANORA10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-md text-xs outline-none bg-white uppercase"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-secondary text-white text-xs font-bold rounded-md hover:bg-secondary-hover transition-colors uppercase tracking-wider"
                    >
                      Apply
                    </button>
                  </form>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-md p-2 flex items-center justify-between text-xs text-green-800">
                    <span className="font-semibold flex items-center gap-1">
                      🎉 Coupon &quot;{appliedCoupon}&quot; Applied! (-₹{currentDiscount})
                    </span>
                    <button onClick={handleRemoveCoupon} className="text-red-600 font-bold hover:underline">
                      Remove
                    </button>
                  </div>
                )}
                {couponError && <p className="text-red-500 text-[10px] font-semibold mt-1">{couponError}</p>}

                {/* Subtotals */}
                <div className="space-y-2 text-sm text-zinc-600 border-b border-zinc-200 pb-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-dark">₹{cartSubtotal}</span>
                  </div>
                  {currentDiscount > 0 && (
                    <div className="flex justify-between text-green-700 font-medium">
                      <span>Discount</span>
                      <span>-₹{currentDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold text-dark">
                      {shippingFee > 0 ? `₹${shippingFee}` : "FREE"}
                    </span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-center text-base font-bold text-primary">
                  <span>Estimated Total</span>
                  <span className="font-serif text-lg text-secondary">₹{finalTotal}</span>
                </div>

                {/* Checkout Button */}
                <button 
                  onClick={handleCheckoutRedirect}
                  className="w-full py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  Proceed To Checkout
                </button>
                <p className="text-[10px] text-center text-zinc-400 mt-2">Fast delivery in 3-5 business days.</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default CartDrawer;
