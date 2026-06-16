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
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState({
    razorpayKeyId: "",
    razorpayEnabled: false
  });
  const [deliveryConfig, setDeliveryConfig] = useState({
    shippingFee: 99,
    codCharge: 49,
    freeDeliveryThreshold: 999,
    enableCOD: true,
    enableFreeShipping: true,
    deliveryMessage: "Free shipping on orders above ₹999"
  });

  useEffect(() => {
    const docRef = doc(db, "settings", "storeConfig");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPaymentConfig({
          razorpayKeyId: data.razorpayKeyId || "",
          razorpayEnabled: data.razorpayEnabled || false
        });
      }
    });

    const deliveryRef = doc(db, "settings", "store");
    const unsubscribeDelivery = onSnapshot(deliveryRef, (docSnap) => {
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

    return () => {
      unsubscribe();
      unsubscribeDelivery();
    };
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Payment Method: Default to razorpay online
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

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

  // Coupon deduction
  const discountAmount = appliedCoupon === "ELANORA10" || appliedCoupon === "SHIMMER10"
    ? Math.round(cartSubtotal * 0.10)
    : 0;

  // Dynamic Shipping calculations
  const isFreeShippingEligible = deliveryConfig.enableFreeShipping && (cartSubtotal - discountAmount) >= deliveryConfig.freeDeliveryThreshold;
  const shippingFee = cartSubtotal === 0 ? 0 : (isFreeShippingEligible ? 0 : deliveryConfig.shippingFee);

  // COD Charge
  const codChargeApplied = paymentMethod === "cod" ? deliveryConfig.codCharge : 0;

  const finalTotal = cartSubtotal - discountAmount + shippingFee + codChargeApplied;

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

  const handleCreateOrder = async () => {
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
      setIsProcessingPayment(true);
      try {
        // Find selected address details
        const address = newAddressForm
          ? {
            name: shipName,
            phone: shipPhone,
            street: shipStreet,
            city: shipCity,
            state: shipState,
            zipCode: shipZip,
          }
          : user?.addresses.find((a) => a.id === selectedAddressId);

        if (!address) {
          alert("Shipping address is required.");
          setIsProcessingPayment(false);
          return;
        }

        if (paymentMethod === "cod") {
          // 1. Create COD order on the backend
          const response = await fetch("/api/create-cod-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              items: cartItems.map(item => ({ productId: item.productId, quantity: item.quantity, material: item.material || "" })),
              couponCode: appliedCoupon,
              shippingAddress: {
                fullName: address.name || "",
                phone: address.phone || "",
                street: address.street || "",
                city: address.city || "",
                state: address.state || "",
                zipCode: address.zipCode || "",
              },
              userId: user?.uid || "guest",
              customerEmail: user?.email || "Guest",
              customerName: address.name || user?.displayName || "Guest"
            })
          });

          if (!response.ok) {
            const errData = await response.json();
            alert(errData.message || "Failed to place COD order.");
            setIsProcessingPayment(false);
            return;
          }

          const result = await response.json();
          clearCart();
          router.push(`/checkout/success?orderNumber=${result.orderNumber}&total=${finalTotal}`);
          return;
        }

        // Check if Razorpay is enabled
        if (!paymentConfig.razorpayEnabled) {
          alert("Online payment is currently disabled. Please contact the administrator.");
          setIsProcessingPayment(false);
          return;
        }

        // Load Razorpay script
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          alert("Failed to load Razorpay payment window. Please check your internet connection.");
          setIsProcessingPayment(false);
          return;
        }

        // 1. Create order on the backend
        const orderRes = await fetch("/api/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            items: cartItems.map(item => ({ id: item.productId, quantity: item.quantity })),
            couponCode: appliedCoupon
          })
        });

        if (!orderRes.ok) {
          const errData = await orderRes.json();
          alert(errData.message || "Failed to initiate payment transaction.");
          setIsProcessingPayment(false);
          return;
        }

        const razorpayOrder = await orderRes.json();

        // 2. Open Razorpay Checkout overlay popup
        const options = {
          key: paymentConfig.razorpayKeyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "ElanoraGems",
          description: "Purchase Premium Luxury Jewellery",
          image: "https://elanoragems.in/logo.png",
          order_id: razorpayOrder.orderId,
          handler: async function (response: any) {
            try {
              // 3. Verify signature on the backend
              const verifyRes = await fetch("/api/verify-payment", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  orderData: {
                    userId: user?.uid || "guest",
                    customerEmail: user?.email || "Guest",
                    customerName: address?.name || user?.displayName || "Guest",
                    shippingAddress: {
                      fullName: address?.name || "",
                      phone: address?.phone || "",
                      street: address?.street || "",
                      city: address?.city || "",
                      state: address?.state || "",
                      zipCode: address?.zipCode || "",
                    },
                    items: cartItems.map((item) => ({
                      productId: item.productId,
                      name: item.name,
                      price: item.price,
                      quantity: item.quantity,
                      image: item.image,
                      material: item.material || ""
                    })),
                    subtotal: cartSubtotal,
                    discount: discountAmount,
                    shippingFee: shippingFee,
                    totalAmount: finalTotal,
                    paymentMethod: "Razorpay",
                    couponApplied: appliedCoupon || null
                  }
                })
              });

              if (verifyRes.ok) {
                const result = await verifyRes.json();
                clearCart();
                router.push(`/checkout/success?orderNumber=${result.orderNumber}&total=${finalTotal}`);
              } else {
                const err = await verifyRes.json();
                alert(err.message || "Payment signature verification failed.");
              }
            } catch (err) {
              console.error("Signature verification error:", err);
              alert("Signature verification error. Please try again.");
            } finally {
              setIsProcessingPayment(false);
            }
          },
          prefill: {
            name: address?.name || user?.displayName || "",
            email: user?.email || "",
            contact: address?.phone || ""
          },
          theme: {
            color: "#0F2F6B"
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (error) {
        console.error("Error creating payment transaction:", error);
        alert("Payment initialization error. Please try again.");
        setIsProcessingPayment(false);
      }
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
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? "bg-primary text-white" : "bg-zinc-200 text-zinc-600"
              }`}>1</span>
            <span>Cart</span>
          </button>
          <ChevronRight size={14} />

          <button
            disabled={step < 2}
            onClick={() => setStep(2)}
            className={`flex items-center gap-1.5 transition-colors ${step >= 2 ? "text-primary font-bold" : "cursor-not-allowed"}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? "bg-primary text-white" : "bg-zinc-200 text-zinc-600"
              }`}>2</span>
            <span>Address</span>
          </button>
          <ChevronRight size={14} />

          <button
            disabled={step < 3}
            onClick={() => setStep(3)}
            className={`flex items-center gap-1.5 transition-colors ${step >= 3 ? "text-primary font-bold" : "cursor-not-allowed"}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? "bg-primary text-white" : "bg-zinc-200 text-zinc-600"
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
                          className={`p-4 border rounded-2xl cursor-pointer transition-all ${selectedAddressId === addr.id
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
                  <h2 className="font-serif text-xl font-bold text-primary">Choose Payment Method</h2>
                  <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">Select your preferred payment method</p>
                </div>

                {/* Selector Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod("razorpay")}
                    className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-28 cursor-pointer transition-all ${paymentMethod === "razorpay"
                      ? "border-secondary bg-accent/20 ring-1 ring-secondary"
                      : "border-zinc-200 hover:border-zinc-300"
                      }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold text-xs text-primary uppercase tracking-wider">Pay Online</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "razorpay" ? "border-secondary bg-secondary" : "border-zinc-300"
                        }`}>
                        {paymentMethod === "razorpay" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-primary">Credit/Debit Card, UPI</h4>
                      <p className="text-[10px] text-zinc-400 mt-1 font-medium">UPI, Netbanking, Cards & popular wallets</p>
                    </div>
                  </button>

                  {deliveryConfig.enableCOD && (
                    <button
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-28 cursor-pointer transition-all ${paymentMethod === "cod"
                        ? "border-secondary bg-accent/20 ring-1 ring-secondary"
                        : "border-zinc-200 hover:border-zinc-300"
                        }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-bold text-xs text-primary uppercase tracking-wider">Cash On Delivery</span>
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "cod" ? "border-secondary bg-secondary" : "border-zinc-300"
                          }`}>
                          {paymentMethod === "cod" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-serif text-sm font-bold text-primary">Cash On Delivery (COD)</h4>
                        <p className="text-[10px] text-zinc-400 mt-1 font-medium">Pay with cash at your doorstep (+₹{deliveryConfig.codCharge})</p>
                      </div>
                    </button>
                  )}
                </div>

                {/* Razorpay specifics if selected */}
                {paymentMethod === "razorpay" && (
                  <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-[10px] text-zinc-400 font-bold uppercase tracking-wide flex items-center justify-center gap-2 animate-fadeIn">
                    <ShieldCheck size={16} className="text-[#0F2F6B]" />
                    <span>Secure Payment Powered by Razorpay</span>
                  </div>
                )}

                {/* COD specifics if selected */}
                {paymentMethod === "cod" && (
                  <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-[10px] text-zinc-400 font-bold uppercase tracking-wide flex items-center justify-center gap-2 animate-fadeIn">
                    <Truck size={16} className="text-secondary" />
                    <span>Pay with cash or UPI at the time of delivery</span>
                  </div>
                )}

                <div className="pt-6 flex justify-between">
                  <button onClick={() => setStep(2)} className="inline-flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-secondary uppercase">
                    <ChevronLeft size={16} /> Back to Address
                  </button>
                  <button
                    onClick={handleCreateOrder}
                    disabled={isProcessingPayment}
                    className="px-8 py-3 bg-secondary hover:bg-secondary-hover text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessingPayment ? "Processing..." : paymentMethod === "cod" ? `Place Order via COD (₹${finalTotal})` : `Pay Securely with Razorpay (₹${finalTotal})`}
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
              {paymentMethod === "cod" && (
                <div className="flex justify-between text-primary">
                  <span>COD Charge</span>
                  <span className="font-semibold">₹{deliveryConfig.codCharge}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-primary">
              <span>Estimated Total</span>
              <span className="font-serif text-base text-secondary">₹{finalTotal}</span>
            </div>

            {/* Free Shipping Alert message */}
            <div className={`flex items-center gap-1.5 text-[9px] font-bold rounded p-2 uppercase tracking-wide ${shippingFee === 0 ? "text-green-700 bg-green-50" : "text-secondary bg-amber-50"
              }`}>
              <Truck size={14} />
              {shippingFee === 0 ? (
                <span>✅ You qualify for FREE Shipping</span>
              ) : (
                <span>Add ₹{deliveryConfig.freeDeliveryThreshold - (cartSubtotal - discountAmount)} more for FREE Shipping</span>
              )}
            </div>
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
