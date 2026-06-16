"use client";

import React, { useState, useEffect, Suspense } from "react";
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
  Sparkles
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { useAuth, Address } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { CustomerRoute } from "@/components/CustomerRoute";
import { useCart } from "@/context/CartContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

function AccountDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, logout, updateAddresses } = useAuth();
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Tab State: "profile" | "orders" | "wishlist" | "addresses" | "settings"
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Address form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrZip, setAddrZip] = useState("");
  const [addrDefault, setAddrDefault] = useState(false);

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

  // Fetch real orders from Firestore
  useEffect(() => {
    if (!user?.email) return;

    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("customerEmail", "==", user.email));

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
  }, [user?.email]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-24">
          {/* Luxury Spinner Loader */}
          <div className="w-12 h-12 border-2 border-secondary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-serif text-sm font-semibold tracking-widest text-zinc-500 uppercase">Loading Account Profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Handle adding a new shipping address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAddress: Address = {
      id: Date.now().toString(),
      name: addrName,
      phone: addrPhone,
      street: addrStreet,
      city: addrCity,
      state: addrState,
      zipCode: addrZip,
      isDefault: addrDefault
    };

    let updatedAddresses = [...user.addresses];
    if (addrDefault) {
      // Unmark all other defaults
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
    }
    updatedAddresses.push(newAddress);

    try {
      await updateAddresses(updatedAddresses);
      // Reset form
      setShowAddressForm(false);
      setAddrName("");
      setAddrPhone("");
      setAddrStreet("");
      setAddrCity("");
      setAddrState("");
      setAddrZip("");
      setAddrDefault(false);
    } catch (err) {
      alert("Error adding address. Please try again.");
    }
  };

  // Handle removing a shipping address
  const handleRemoveAddress = async (id: string) => {
    const updated = user.addresses.filter((a) => a.id !== id);
    try {
      await updateAddresses(updated);
    } catch (err) {
      alert("Error removing address.");
    }
  };

  return (
    <div className="min-h-screen bg-accent/20 flex flex-col justify-between">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">

        {/* Banner Section */}
        <div className="bg-primary rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row md:items-center md:justify-between justify-center gap-6 mb-10 shadow-lg border border-secondary/15 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full translate-x-20 -translate-y-20 pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <span className="text-secondary text-xs font-bold uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={12} /> Member Dashboard
            </span>
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
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-3">
                  <h2 className="font-serif text-xl font-bold text-primary">Profile Details</h2>
                  <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">Manage your personal credentials</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block">Full Name</span>
                    <span className="font-semibold text-primary block mt-1 text-base">{user.displayName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block">Email Address</span>
                    <span className="font-semibold text-primary block mt-1 text-base">{user.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block">Account Role</span>
                    <span className="font-semibold text-primary block mt-1 text-base capitalize">{user.role}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block">Saved Addresses</span>
                    <span className="font-semibold text-primary block mt-1 text-base">{user.addresses.length} entries</span>
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
                            <span className="font-bold text-primary text-sm">{order.orderNumber || order.id}</span>
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

                        {/* Items */}
                        <div className="space-y-2">
                          {order.products && order.products.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-zinc-700">{item.name} x{item.quantity}</span>
                              <span className="font-bold text-primary">₹{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                          {order.items && !order.products && order.items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-zinc-700">{item.name} x{item.quantity}</span>
                              <span className="font-bold text-primary">₹{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        {/* Status indicators */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-zinc-100 gap-2 text-xs">
                          <span className="text-zinc-500 font-medium normal-case">
                            Shipping Address: {order.shippingAddress ? `${order.shippingAddress.street || order.shippingAddress.addressLine1 || ""}, ${order.shippingAddress.city || ""}` : (order.address || "N/A")}
                          </span>
                          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            {/* Payment Status */}
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${
                              order.paymentStatus === "Paid"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : order.paymentStatus === "Failed"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}>
                              Payment: {order.paymentStatus || "Pending"}
                            </span>

                            {/* Order Status */}
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider border ${
                              order.orderStatus === "delivered" || order.status === "delivered"
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
              <div className="space-y-6">

                <div className="border-b border-zinc-100 pb-3 flex justify-between items-center">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-primary">Shipping Addresses</h2>
                    <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">Manage delivery destinations</p>
                  </div>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="px-4 py-2 bg-secondary hover:bg-secondary-hover text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {showAddressForm ? "Cancel" : <><Plus size={14} /> Add New</>}
                  </button>
                </div>

                {/* Add Address Form overlay/panel */}
                {showAddressForm && (
                  <form onSubmit={handleAddAddress} className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Recipient Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Contact Phone</label>
                      <input
                        type="text"
                        placeholder="9876543210"
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Street / Apartment Address</label>
                      <input
                        type="text"
                        placeholder="Flat No, Building Name, Street Name"
                        value={addrStreet}
                        onChange={(e) => setAddrStreet(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">City</label>
                      <input
                        type="text"
                        placeholder="Mumbai"
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">State</label>
                      <input
                        type="text"
                        placeholder="Maharashtra"
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Pincode / ZIP</label>
                      <input
                        type="text"
                        placeholder="400050"
                        value={addrZip}
                        onChange={(e) => setAddrZip(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs outline-none"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2 sm:col-span-2 pt-2">
                      <input
                        type="checkbox"
                        id="defaultAddr"
                        checked={addrDefault}
                        onChange={(e) => setAddrDefault(e.target.checked)}
                        className="rounded accent-secondary"
                      />
                      <label htmlFor="defaultAddr" className="text-xs font-semibold text-zinc-600">Set as Default Delivery Address</label>
                    </div>

                    <div className="sm:col-span-2 pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md cursor-pointer"
                      >
                        Save Address
                      </button>
                    </div>

                  </form>
                )}

                {/* Saved addresses display */}
                {user.addresses.length === 0 ? (
                  <div className="text-center py-12 space-y-2">
                    <MapPinOff size={48} className="text-zinc-200 mx-auto" />
                    <p className="font-serif text-sm font-semibold text-zinc-400">No saved addresses</p>
                    <p className="text-xs text-zinc-400 max-w-xs mx-auto">Please add a shipping address to facilitate speedier checkout flows.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.addresses.map((a) => (
                      <div key={a.id} className="border border-zinc-100 rounded-2xl p-5 space-y-3 hover:shadow-sm relative bg-zinc-50/50">
                        {a.isDefault && (
                          <span className="absolute top-4 right-4 bg-secondary/10 border border-secondary text-secondary text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}

                        <div className="space-y-1 text-xs">
                          <p className="font-bold text-primary text-sm">{a.name}</p>
                          <p className="font-medium text-zinc-500 normal-case">{a.street}</p>
                          <p className="font-medium text-zinc-500 normal-case">{a.city}, {a.state} - {a.zipCode}</p>
                          <p className="font-bold text-zinc-400 mt-2">Phone: +91 {a.phone}</p>
                        </div>

                        <div className="flex gap-4 pt-3 border-t border-zinc-100">
                          <button
                            onClick={() => handleRemoveAddress(a.id)}
                            className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}


          </section>
        </div>
      </main>

      <Footer />
      <CartDrawer />
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
