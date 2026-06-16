"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  ChevronRight, 
  Trash2, 
  Plus, 
  ChevronLeft,
  Truck,
  Sparkles,
  Award,
  ShieldCheck
} from "lucide-react";
import confetti from "canvas-confetti";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth, Address } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

// Wrap checkout content in a sub-component to safely use useSearchParams in Next.js Suspense
function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { cartItems, cartSubtotal, removeFromCart, updateQuantity, clearCart } = useCart();

  // Steps: 1: Cart, 2: Address, 3: Payment, 4: Success
  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState("");

  // Addresses
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [newAddressForm, setNewAddressForm] = useState(false);
  
  // Custom manual shipping address state
  const [shipName, setShipName] = useState("");
  const [shipPhone, setShipPhone] = useState("");
  const [shipStreet, setShipStreet] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipState, setShipState] = useState("");
  const [shipZip, setShipZip] = useState("");

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState("upi");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");

  // Pre-load coupon from URL query if exists (e.g. from Cart Drawer redirect)
  useEffect(() => {
    const couponQuery = searchParams.get("coupon");
    if (couponQuery) {
      const cleaned = couponQuery.trim().toUpperCase();
      if (cleaned === "ELANORA10" || cleaned === "SHIMMER10") {
        setAppliedCoupon(cleaned);
      }
    }
  }, [searchParams]);

  // Set default selected address from profile on load
  useEffect(() => {
    if (user && user.addresses.length > 0) {
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedAddressId(def.id);
    }
  }, [user]);

  // Trigger confetti celebration on Success screen
  useEffect(() => {
    if (step === 4) {
      confetti({
        particleCount: 180,
        spread: 90,
        origin: { y: 0.65 }
      });
    }
  }, [step]);

  // Math Calculations
  const SHIPPING_THRESHOLD = 999;
  const SHIPPING_COST = 99;

  // Coupon deduction
  const discountAmount = appliedCoupon === "ELANORA10" || appliedCoupon === "SHIMMER10" 
    ? Math.round(cartSubtotal * 0.10) 
    : 0;

  // Shipping
  const shippingFee = cartSubtotal >= SHIPPING_THRESHOLD || cartSubtotal === 0 ? 0 : SHIPPING_COST;

  // GST (Jewellery has standard 3% GST rate in India)
  const gstAmount = Math.round((cartSubtotal - discountAmount) * 0.03);

  const finalTotal = cartSubtotal - discountAmount + shippingFee + gstAmount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    const cleaned = couponCode.trim().toUpperCase();
    if (cleaned === "ELANORA10" || cleaned === "SHIMMER10") {
      setAppliedCoupon(cleaned);
    } else {
      setCouponError("Invalid coupon code");
    }
  };

  const handleCreateOrder = () => {
    // Check validation
    if (cartItems.length === 0) return;

    if (step === 2) {
      // Validate address
      if (!selectedAddressId && !shipStreet) {
        alert("Please select or enter a shipping address.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      // Payment mock & order placement
      const randomOrderId = `ELN-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(randomOrderId);
      setStep(4);
      clearCart();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
      {/* Step Progress indicators */}
      {step < 4 && (
        <div className="flex items-center justify-center gap-2 sm:gap-6 mb-10 text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-400">
          <button 
            onClick={() => setStep(1)}
            className={`flex items-center gap-1.5 transition-colors ${step >= 1 ? "text-primary font-bold" : ""}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step >= 1 ? "bg-primary text-white" : "bg-zinc-200 text-zinc-600"
            }`}>1</span>
            <span>Cart</span>
          </button>
          <ChevronRight size={14} />

          <button 
            disabled={step < 2}
            onClick={() => setStep(2)}
            className={`flex items-center gap-1.5 transition-colors ${step >= 2 ? "text-primary font-bold" : "cursor-not-allowed"}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step >= 2 ? "bg-primary text-white" : "bg-zinc-200 text-zinc-600"
            }`}>2</span>
            <span>Address</span>
          </button>
          <ChevronRight size={14} />

          <button 
            disabled={step < 3}
            onClick={() => setStep(3)}
            className={`flex items-center gap-1.5 transition-colors ${step >= 3 ? "text-primary font-bold" : "cursor-not-allowed"}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step >= 3 ? "bg-primary text-white" : "bg-zinc-200 text-zinc-600"
            }`}>3</span>
            <span>Payment</span>
          </button>
        </div>
      )}

      {/* Main grids */}
      {step < 4 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Left Panel (8 cols): Step View */}
          <div className="lg:col-span-8 bg-white border border-zinc-100 rounded-3xl shadow-sm p-6 sm:p-8">
            
            {/* Step 1: Cart Items Summary */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
                  <h2 className="font-serif text-xl font-bold text-primary">Review Cart Ornaments</h2>
                  <span className="text-zinc-400 text-xs font-semibold">{cartItems.length} items</span>
                </div>

                {cartItems.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <ShoppingBag size={48} className="text-zinc-200 mx-auto" />
                    <p className="font-serif text-sm font-semibold text-zinc-400">Your checkout cart is empty</p>
                    <Link href="/collections" className="btn-premium btn-primary text-xs">Browse Products</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 border border-zinc-100 rounded-2xl hover:shadow-sm transition-shadow">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl border border-zinc-100 bg-accent" />
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="text-xs sm:text-sm font-semibold text-dark leading-tight">{item.name}</h4>
                            <button onClick={() => removeFromCart(item.id)} className="text-zinc-400 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          {(item.size || item.material) && (
                            <div className="flex gap-2 text-[10px] text-zinc-500 font-semibold uppercase">
                              {item.size && <span>Size: {item.size}</span>}
                              {item.material && <span>• {item.material}</span>}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-zinc-200 rounded-md p-0.5 bg-white">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-0.5 hover:bg-zinc-50 text-zinc-500">-</button>
                              <span className="px-2 text-xs font-bold">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-0.5 hover:bg-zinc-50 text-zinc-500">+</button>
                            </div>
                            <span className="text-xs font-bold text-primary">₹{item.price * item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="pt-6 flex justify-between">
                      <Link href="/collections" className="inline-flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-secondary uppercase">
                        <ChevronLeft size={16} /> Add More items
                      </Link>
                      <button 
                        onClick={() => setStep(2)} 
                        className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow"
                      >
                        Proceed To Shipping
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Shipping Address selection */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
                  <h2 className="font-serif text-xl font-bold text-primary">Select Shipping Address</h2>
                  <button
                    onClick={() => setNewAddressForm(!newAddressForm)}
                    className="text-xs font-bold text-secondary hover:underline uppercase"
                  >
                    {newAddressForm ? "Select Saved" : "New Address"}
                  </button>
                </div>

                {newAddressForm ? (
                  /* Custom Address Form */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase block">Recipient Name</label>
                      <input type="text" placeholder="John Doe" value={shipName} onChange={(e) => setShipName(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs outline-none focus:border-secondary" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase block">Phone Contact</label>
                      <input type="text" placeholder="9876543210" value={shipPhone} onChange={(e) => setShipPhone(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs outline-none focus:border-secondary" />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase block">Street / Apartment Address</label>
                      <input type="text" placeholder="Flat / Building, Road Name" value={shipStreet} onChange={(e) => setShipStreet(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs outline-none focus:border-secondary" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase block">City</label>
                      <input type="text" placeholder="Mumbai" value={shipCity} onChange={(e) => setShipCity(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs outline-none focus:border-secondary" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase block">State</label>
                      <input type="text" placeholder="Maharashtra" value={shipState} onChange={(e) => setShipState(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs outline-none focus:border-secondary" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase block">Pincode</label>
                      <input type="text" placeholder="400050" value={shipZip} onChange={(e) => setShipZip(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs outline-none focus:border-secondary" />
                    </div>
                  </div>
                ) : (
                  /* List saved user addresses */
                  <div className="space-y-3">
                    {user && user.addresses.length > 0 ? (
                      user.addresses.map((addr) => (
                        <div 
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-4 border rounded-2xl cursor-pointer transition-all ${
                            selectedAddressId === addr.id 
                              ? "border-secondary bg-accent/20 ring-1 ring-secondary" 
                              : "border-zinc-100 hover:border-zinc-200"
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-primary">{addr.name}</span>
                            {addr.isDefault && <span className="text-[8px] bg-secondary/15 text-secondary font-bold uppercase tracking-widest px-2 py-0.5 rounded">Default</span>}
                          </div>
                          <p className="text-zinc-500 text-[11px] mt-1 normal-case">{addr.street}, {addr.city}, {addr.state} - {addr.zipCode}</p>
                          <p className="text-zinc-400 text-[10px] font-bold mt-2">Phone: +91 {addr.phone}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 border border-dashed border-zinc-200 rounded-2xl text-center text-xs text-zinc-400">
                        No saved addresses found. Please enter a new address above.
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-6 flex justify-between">
                  <button onClick={() => setStep(1)} className="inline-flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-secondary uppercase">
                    <ChevronLeft size={16} /> Back to Cart
                  </button>
                  <button 
                    onClick={handleCreateOrder}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow"
                  >
                    Proceed To Payment
                  </button>
                </div>

              </div>
            )}

            {/* Step 3: Payment Options selection */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="font-serif text-xl font-bold text-primary">Secure Checkout Payment</h2>
                  <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">Select preferred payment method</p>
                </div>

                <div className="space-y-3">
                  {/* UPI */}
                  <label className={`p-4 border rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === "upi" ? "border-secondary bg-accent/20 ring-1 ring-secondary" : "border-zinc-100"
                  }`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" value="upi" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} className="accent-secondary" />
                      <div>
                        <span className="text-xs font-bold text-primary uppercase block">UPI / Google Pay / PhonePe</span>
                        <span className="text-[10px] text-zinc-400 normal-case">Pay instantly using any UPI app.</span>
                      </div>
                    </div>
                    <Award size={18} className="text-secondary" />
                  </label>

                  {/* Cards */}
                  <label className={`p-4 border rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === "card" ? "border-secondary bg-accent/20 ring-1 ring-secondary" : "border-zinc-100"
                  }`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="payment" value="card" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} className="accent-secondary" />
                      <div>
                        <span className="text-xs font-bold text-primary uppercase block">Credit / Debit Card</span>
                        <span className="text-[10px] text-zinc-400 normal-case">RuPay, Visa, Mastercard cards accepted.</span>
                      </div>
                    </div>
                    <CreditCard size={18} className="text-secondary" />
                  </label>
                </div>

                {/* Simulated payment button */}
                <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-[10px] text-zinc-400 font-bold uppercase tracking-wide flex items-center gap-2">
                  <ShieldCheck size={16} className="text-green-700" />
                  <span>Secure 256-bit encryption. Razorpay gateway integrated sandbox ready.</span>
                </div>

                <div className="pt-6 flex justify-between">
                  <button onClick={() => setStep(2)} className="inline-flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-secondary uppercase">
                    <ChevronLeft size={16} /> Back to Address
                  </button>
                  <button 
                    onClick={handleCreateOrder}
                    className="px-8 py-3 bg-secondary hover:bg-secondary-hover text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg"
                  >
                    Pay ₹{finalTotal} Now
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Right Panel (4 cols): Order Summary Sidebar */}
          <div className="lg:col-span-4 bg-zinc-50 border border-zinc-100 rounded-3xl p-6 h-fit space-y-6">
            <h3 className="font-serif text-lg font-bold text-primary border-b border-zinc-200 pb-2">Order Summary</h3>
            
            {/* Promo code form */}
            {!appliedCoupon ? (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon Code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs uppercase outline-none focus:border-secondary"
                />
                <button type="submit" className="px-4 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">Apply</button>
              </form>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 flex items-center justify-between text-xs text-green-800">
                <span className="font-semibold">Coupon &quot;{appliedCoupon}&quot; (10% Off)</span>
                <button onClick={() => setAppliedCoupon(null)} className="text-red-600 font-bold hover:underline">Remove</button>
              </div>
            )}
            {couponError && <p className="text-red-500 text-[10px] font-semibold mt-1">{couponError}</p>}

            {/* Calculations */}
            <div className="space-y-3 text-xs text-zinc-500 border-b border-zinc-200 pb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-primary">₹{cartSubtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-semibold text-primary">
                  {shippingFee > 0 ? `₹${shippingFee}` : "FREE"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (3%)</span>
                <span className="font-semibold text-primary">₹{gstAmount}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-primary">
              <span>Estimated Total</span>
              <span className="font-serif text-base text-secondary">₹{finalTotal}</span>
            </div>

            {/* Shipping note */}
            {shippingFee > 0 && (
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-secondary bg-amber-50 rounded p-2 uppercase tracking-wide">
                <Truck size={14} />
                <span>Add ₹{SHIPPING_THRESHOLD - cartSubtotal} more for FREE shipping</span>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Step 4: Success confirmation screen */
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto text-center space-y-6 py-12"
        >
          <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600 mx-auto shadow-sm">
            <CheckCircle2 size={36} className="stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <span className="text-secondary text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1">
              <Sparkles size={12} /> Congratulations
            </span>
            <h2 className="font-serif text-3xl font-bold text-primary">Order Confirmed!</h2>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-sm mx-auto normal-case">
              Thank you for shopping with ElanoraGems. Your order has been registered and is being prepared for dispatch.
            </p>
          </div>

          {/* Order Info Details box */}
          <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-6 text-left space-y-4 text-xs">
            <div className="flex justify-between border-b border-zinc-200 pb-2.5">
              <span className="font-bold text-zinc-400 uppercase">Order ID</span>
              <span className="font-bold text-primary">{orderId}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 pb-2.5">
              <span className="font-bold text-zinc-400 uppercase">Total Paid</span>
              <span className="font-bold text-secondary">₹{finalTotal}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 pb-2.5">
              <span className="font-bold text-zinc-400 uppercase">Estimated Delivery</span>
              <span className="font-bold text-primary">3-5 Business Days</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-zinc-400 uppercase">Notifications Sent To</span>
              <span className="font-semibold text-zinc-600 truncate max-w-[200px]">{user ? user.email : "Your registered email"}</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/account?tab=orders" 
              className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow"
            >
              Track Orders
            </Link>
            <Link 
              href="/" 
              className="px-6 py-3 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm"
            >
              Continue Shopping
            </Link>
          </div>

        </motion.div>
      )}

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-accent/20 flex flex-col justify-between">
      <Header />
      <Suspense fallback={
        <div className="flex-grow flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 border-2 border-secondary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-serif text-sm font-semibold tracking-widest text-zinc-500 uppercase">Initializing Checkout Flow...</p>
        </div>
      }>
        <CheckoutContent />
      </Suspense>
      <Footer />
    </div>
  );
}
