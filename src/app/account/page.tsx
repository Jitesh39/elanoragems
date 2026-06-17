"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  MapPinOff,
  Sparkles,
  Edit3,
  AlertCircle
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { CustomerRoute } from "@/components/CustomerRoute";
import { useCart } from "@/context/CartContext";
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";

// Toast component for notifications
const Toast = ({ type, message, onClose }: { type: "success" | "error"; message: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl border ${type === "success"
        ? "bg-emerald-950/95 border-emerald-500/30 text-emerald-200"
        : "bg-red-950/95 border-red-500/30 text-red-200"
        } backdrop-blur-md max-w-sm`}
    >
      {type === "success" ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
      )}
      <p className="text-sm font-medium leading-relaxed">{message}</p>
      <button onClick={onClose} className="ml-auto text-xs opacity-60 hover:opacity-100 font-bold px-1.5 py-0.5 rounded cursor-pointer">
        ✕
      </button>
    </motion.div>
  );
};

function AccountDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, logout } = useAuth();
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Tab State: "profile" | "orders" | "wishlist" | "addresses" | "settings"
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Default address fields
  const [recipientName, setRecipientName] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressLoading, setAddressLoading] = useState(true);
  const [defaultAddress, setDefaultAddress] = useState<any>(null);

  // Phone Validation Errors
  const [primaryPhoneError, setPrimaryPhoneError] = useState("");
  const [alternatePhoneError, setAlternatePhoneError] = useState("");

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Sync tab with URL queries if available (e.g. ?tab=orders)
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) setActiveTab(tabParam);
  }, [searchParams]);

  // Protect Route: Redirect guest if not logged in and auth check completes
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Fetch real-time Default Address from Firestore
  useEffect(() => {
    if (!user?.uid) {
      setAddressLoading(false);
      return;
    }

    const addressRef = doc(db, "users", user.uid, "addresses", "default");
    const unsubscribe = onSnapshot(addressRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDefaultAddress(data);
        // Pre-fill editable states if they exist
        setRecipientName(data.recipientName || "");
        setPrimaryPhone(data.primaryPhone || "");
        setAlternatePhone(data.alternatePhone || "");
        setStreetAddress(data.streetAddress || "");
        setCity(data.city || "");
        setState(data.state || "");
        setPincode(data.pincode || "");
      } else {
        setDefaultAddress(null);
      }
      setAddressLoading(false);
    }, (error) => {
      console.error("Error fetching default address:", error);
      setAddressLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Fetch real orders from Firestore
  useEffect(() => {
    if (!user?.uid) return;

    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders: any[] = [];
      snapshot.forEach((doc) => {
        fetchedOrders.push({ id: doc.id, ...doc.data() });
      });

      // Sort by date/createdAt descending
      fetchedOrders.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return dateB - dateA;
      });

      setOrders(fetchedOrders);
      setOrdersLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setOrdersLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const validatePhoneNumber = (number: string) => {
    const regex = /^[6-9][0-9]{9}$/;
    return regex.test(number);
  };

  const handlePrimaryPhoneChange = (val: string) => {
    setPrimaryPhone(val);
    if (val && !validatePhoneNumber(val)) {
      setPrimaryPhoneError("Please enter a valid 10-digit mobile number");
    } else {
      setPrimaryPhoneError("");
    }
  };

  const handleAlternatePhoneChange = (val: string) => {
    setAlternatePhone(val);
    if (val && !validatePhoneNumber(val)) {
      setAlternatePhoneError("Please enter a valid 10-digit mobile number");
    } else {
      setAlternatePhoneError("");
    }
  };

  const isFormValid = useMemo(() => {
    return (
      recipientName.trim() !== "" &&
      streetAddress.trim() !== "" &&
      city.trim() !== "" &&
      state.trim() !== "" &&
      pincode.trim() !== "" &&
      validatePhoneNumber(primaryPhone) &&
      validatePhoneNumber(alternatePhone)
    );
  }, [recipientName, primaryPhone, alternatePhone, streetAddress, city, state, pincode]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !user?.uid) return;

    setIsSavingAddress(true);
    try {
      const addressRef = doc(db, "users", user.uid, "addresses", "default");
      await setDoc(addressRef, {
        recipientName: recipientName.trim(),
        primaryPhone: primaryPhone.trim(),
        alternatePhone: alternatePhone.trim(),
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        isDefault: true,
        updatedAt: serverTimestamp()
      });

      setToast({ type: "success", message: "Address updated successfully" });
    } catch (err) {
      console.error("Error saving address:", err);
      setToast({ type: "error", message: "Failed to update address. Please try again." });
    } finally {
      setIsSavingAddress(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-accent/20 flex flex-col justify-between">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">

        {/* Banner Section */}
        <div className="bg-primary rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row md:items-center md:justify-between justify-center gap-6 mb-10 shadow-lg border border-secondary/15 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full translate-x-20 -translate-y-20 pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold">Hello, {user.displayName}</h1>
            <p className="text-zinc-300 text-xs sm:text-sm font-medium normal-case">Manage your orders, profile details, wishlist, and shipping addresses.</p>
          </div>

          <button
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            className="flex-shrink-0 self-start md:self-auto px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer relative z-10"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>

        {/* Dashboard Panels Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Sidebar Navigation (3 cols) */}
          <aside className="lg:col-span-3 space-y-2">
            <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-4 flex flex-col gap-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full py-3 px-4 rounded-xl text-left text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all cursor-pointer ${activeTab === "profile" ? "bg-primary text-white" : "text-zinc-500 hover:bg-accent"
                  }`}
              >
                <User size={16} className={activeTab === "profile" ? "text-secondary" : ""} />
                Profile Details
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full py-3 px-4 rounded-xl text-left text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all cursor-pointer ${activeTab === "orders" ? "bg-primary text-white" : "text-zinc-500 hover:bg-accent"
                  }`}
              >
                <ShoppingBag size={16} className={activeTab === "orders" ? "text-secondary" : ""} />
                My Orders
              </button>

              <button
                onClick={() => setActiveTab("wishlist")}
                className={`w-full py-3 px-4 rounded-xl text-left text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all cursor-pointer ${activeTab === "wishlist" ? "bg-primary text-white" : "text-zinc-500 hover:bg-accent"
                  }`}
              >
                <Heart size={16} className={activeTab === "wishlist" ? "text-secondary" : ""} />
                My Wishlist
              </button>

              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full py-3 px-4 rounded-xl text-left text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-all cursor-pointer ${activeTab === "addresses" ? "bg-primary text-white" : "text-zinc-500 hover:bg-accent"
                  }`}
              >
                <MapPin size={16} className={activeTab === "addresses" ? "text-secondary" : ""} />
                Shipping Addresses
              </button>
            </div>
          </aside>

          {/* Right Main Content Panels (9 cols) */}
          <section className="lg:col-span-9 bg-white border border-zinc-100 rounded-3xl shadow-sm p-6 sm:p-8 min-h-[400px]">

            {/* 1. Profile Panel */}
            {activeTab === "profile" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="font-serif text-xl font-bold text-primary">Profile Details</h2>
                  <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">Manage your personal credentials</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-sans">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block">Full Name</span>
                    <span className="font-semibold text-primary block mt-1 text-base">{user.displayName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block">Email Address</span>
                    <span className="font-semibold text-primary block mt-1 text-base">{user.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block">Contact Number</span>
                    <span className="font-semibold text-primary block mt-1 text-base">
                      {addressLoading ? "Loading..." : (defaultAddress ? defaultAddress.primaryPhone : "No contact number saved")}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Default Address</span>
                      <button
                        onClick={() => setActiveTab("addresses")}
                        className="p-1 text-zinc-400 hover:text-secondary rounded hover:bg-zinc-100 transition-colors cursor-pointer"
                        title="Edit Address"
                      >
                        <Edit3 size={12} />
                      </button>
                    </div>
                    <div className="font-semibold text-primary block mt-1 text-base leading-relaxed whitespace-pre-line">
                      {addressLoading ? (
                        "Loading..."
                      ) : defaultAddress ? (
                        `${defaultAddress.recipientName}
                        ${defaultAddress.streetAddress},
                        ${defaultAddress.city}, ${defaultAddress.state} - ${defaultAddress.pincode}`
                      ) : (
                        "No default address saved"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Orders Panel */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="font-serif text-xl font-bold text-primary">My Orders</h2>
                  <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">Track your shopping history</p>
                </div>

                <div className="space-y-4">
                  {ordersLoading ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-zinc-500 text-xs font-semibold">Loading orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 space-y-2">
                      <ShoppingBag size={48} className="text-zinc-200 mx-auto" />
                      <p className="font-serif text-sm font-semibold text-zinc-400">You haven't placed any orders yet</p>
                      <p className="text-xs text-zinc-400 max-w-xs mx-auto">Once you check out, your purchase history will appear here.</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="border border-zinc-100 rounded-2xl p-5 hover:shadow-sm transition-shadow space-y-4">

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between justify-center gap-2 border-b border-zinc-100 pb-3">
                          <div>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Order ID</span>
                            <span className="font-bold text-primary text-sm">{order.orderNumber || order.orderId || order.id}</span>
                            {order.paymentMethod && (
                              <span className="text-[9px] text-zinc-400 font-bold block mt-0.5">
                                Method: {order.paymentMethod} {order.razorpayPaymentId ? `(${order.razorpayPaymentId})` : ""}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-6">
                            <div>
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Order Date</span>
                              <span className="font-semibold text-zinc-600 text-xs">
                                {order.createdAt ? new Date(order.createdAt.toMillis ? order.createdAt.toMillis() : order.createdAt).toLocaleDateString() : "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total Amount</span>
                              <span className="font-bold text-secondary text-xs">₹{(order.totalAmount || order.total || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Mapped Products list with Images */}
                        <div className="divide-y divide-zinc-100">
                          {(order.products || order.items || []).map((item: any, index: number) => (
                            <div key={index} className="py-3 flex items-center gap-4 text-xs first:pt-0 last:pb-0">
                              {/* Product Image */}
                              <div className="w-14 h-14 rounded-xl bg-zinc-50 border border-zinc-100 overflow-hidden flex-shrink-0">
                                <img
                                  src={item.productImage || item.image || "/placeholder.png"}
                                  alt={item.productName || item.name || "Product"}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-primary truncate text-sm">{item.productName || item.name || "Premium Ornament"}</p>
                                {item.material && <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">{item.material}</p>}
                                <p className="text-zinc-500 font-medium mt-1">Qty: {item.quantity}</p>
                              </div>
                              {/* Item Total Price */}
                              <div className="text-right">
                                <span className="font-bold text-primary text-sm">₹{(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Status indicators */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-zinc-100 gap-2 text-xs">
                          <span className="text-zinc-500 font-medium normal-case">
                            Shipping Address: {order.shippingAddress ? `${order.shippingAddress.fullName || ""}, ${order.shippingAddress.street || ""}, ${order.shippingAddress.city || ""}` : (order.address || "N/A")}
                          </span>
                          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            {/* Payment Status */}
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${order.paymentStatus === "Paid"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : order.paymentStatus === "Failed"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                              Payment: {order.paymentStatus || "Pending"}
                            </span>

                            {/* Order Status */}
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${order.orderStatus === "Confirmed" || order.status === "Confirmed"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : order.orderStatus === "delivered" || order.status === "delivered"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : order.orderStatus === "cancelled" || order.status === "cancelled"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}>
                              Order: {order.orderStatus || order.status || "Processing"}
                            </span>
                          </div>
                        </div>

                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 3. Wishlist Panel */}
            {activeTab === "wishlist" && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="font-serif text-xl font-bold text-primary">My Wishlist</h2>
                  <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">Your luxury favorites collection</p>
                </div>

                {wishlistItems.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <Heart size={48} className="text-zinc-200 mx-auto" />
                    <p className="font-serif text-sm font-semibold text-zinc-400">Your wishlist is currently empty</p>
                    <p className="text-xs text-zinc-400 max-w-xs mx-auto">Explore our collections and tap the heart icon on items you love.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => (
                      <div key={item.productId} className="border border-zinc-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between group">

                        {/* Remove from wishlist */}
                        <button
                          onClick={() => toggleWishlist(item)}
                          className="absolute top-2 right-2 z-10 w-7 h-7 bg-white rounded-full flex items-center justify-center text-red-500 hover:scale-105 transition-transform shadow-sm"
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>

                        <div className="aspect-square bg-zinc-50 relative overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>

                        <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between bg-white">
                          <div>
                            <h4 className="text-xs font-semibold text-dark truncate leading-tight">{item.name}</h4>
                            <div className="flex items-baseline gap-1.5 mt-1">
                              <span className="text-xs font-bold text-primary">₹{item.price}</span>
                              {item.originalPrice && (
                                <span className="text-[10px] text-zinc-400 line-through">₹{item.originalPrice}</span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => addToCart({
                              productId: item.productId,
                              name: item.name,
                              price: item.price,
                              originalPrice: item.originalPrice,
                              image: item.image,
                              material: "Sterling Silver"
                            })}
                            className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-[9px] font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ShoppingBag size={11} className="text-secondary" /> Add To Cart
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Address Book Panel */}
            {activeTab === "addresses" && (
              <div className="space-y-6 animate-fadeIn">

                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="font-serif text-xl font-bold text-primary">Shipping Address</h2>
                  <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">Manage your default delivery destination</p>
                </div>

                {addressLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Loading address details...</p>
                  </div>
                ) : (
                  <form onSubmit={handleSaveAddress} className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 font-sans">

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Recipient Name *</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs outline-none focus:border-secondary transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Primary Mobile Number *</label>
                      <input
                        type="text"
                        placeholder="9876543210"
                        value={primaryPhone}
                        onChange={(e) => handlePrimaryPhoneChange(e.target.value)}
                        className={`w-full bg-white border ${primaryPhoneError ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 focus:border-secondary'} rounded-xl p-3 text-xs outline-none transition-colors`}
                        required
                      />
                      {primaryPhoneError && <p className="text-red-500 text-[10px] font-semibold mt-1">{primaryPhoneError}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Alternate Mobile Number *</label>
                      <input
                        type="text"
                        placeholder="9876543210"
                        value={alternatePhone}
                        onChange={(e) => handleAlternatePhoneChange(e.target.value)}
                        className={`w-full bg-white border ${alternatePhoneError ? 'border-red-500 focus:border-red-500' : 'border-zinc-200 focus:border-secondary'} rounded-xl p-3 text-xs outline-none transition-colors`}
                        required
                      />
                      {alternatePhoneError && <p className="text-red-500 text-[10px] font-semibold mt-1">{alternatePhoneError}</p>}
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Street / Apartment Address *</label>
                      <input
                        type="text"
                        placeholder="Flat No, Building Name, Street Name"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs outline-none focus:border-secondary transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">City *</label>
                      <input
                        type="text"
                        placeholder="Ahmedabad"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs outline-none focus:border-secondary transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">State *</label>
                      <input
                        type="text"
                        placeholder="Gujarat"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs outline-none focus:border-secondary transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Pincode *</label>
                      <input
                        type="text"
                        placeholder="380015"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-xs outline-none focus:border-secondary transition-colors"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2 pt-2 flex items-center justify-end">
                      <button
                        type="submit"
                        disabled={!isFormValid || isSavingAddress}
                        className="px-6 py-3 bg-secondary hover:bg-[#b8962f] disabled:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0"
                      >
                        {isSavingAddress ? "Saving..." : (defaultAddress ? "Update Address" : "Save Address")}
                      </button>
                    </div>

                  </form>
                )}

              </div>
            )}


          </section>
        </div>
      </main>

      <Footer />
      <CartDrawer />

      {/* Floating notifications */}
      <AnimatePresence>
        {toast && (
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AccountDashboardPage() {
  return (
    <CustomerRoute>
      <Suspense fallback={
        <div className="min-h-screen bg-white flex flex-col justify-between">
          <Header />
          <div className="flex-grow flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-2 border-secondary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-serif text-sm font-semibold tracking-widest text-zinc-500 uppercase">Loading Account Profile...</p>
          </div>
          <Footer />
        </div>
      }>
        <AccountDashboardContent />
      </Suspense>
    </CustomerRoute>
  );
}
