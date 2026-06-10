"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Percent,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Check,
  Tag,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Search
} from "lucide-react";
import { Header } from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { Product } from "@/components/ProductCard";
import { AdminRoute } from "@/components/AdminRoute";

function AdminDashboardContent() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Tabs: "dashboard" | "products" | "orders" | "coupons"
  const [activeTab, setActiveTab] = useState("dashboard");

  // Products state (populated from mock data)
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);

  // Form input states
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodOrigPrice, setProdOrigPrice] = useState("");
  const [prodImage, setProdImage] = useState("");
  const [prodCategory, setProdCategory] = useState("rings");
  const [prodMaterial, setProdMaterial] = useState("Sterling Silver");
  const [prodDesc, setProdDesc] = useState("");

  // Orders State (simulating live registry)
  const [orders, setOrders] = useState([
    { id: "ORD-9281A", customer: "Aishwarya R.", email: "aishwarya@gmail.com", date: "2026-06-05", status: "delivered", total: 1299 },
    { id: "ORD-1827C", customer: "Rahul K.", email: "rahul.k@yahoo.com", date: "2026-06-09", status: "processing", total: 3498 },
    { id: "ORD-5726X", customer: "Siddharth S.", email: "siddharth@gmail.com", date: "2026-06-10", status: "shipped", total: 1899 }
  ]);

  // Coupons state
  const [coupons, setCoupons] = useState([
    { code: "ELANORA10", type: "percent", value: 10, minPurchase: 0 },
    { code: "SHIMMER10", type: "percent", value: 10, minPurchase: 0 },
    { code: "WELCOME50", type: "flat", value: 50, minPurchase: 500 }
  ]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponValue, setNewCouponValue] = useState("");

  // Initial load
  useEffect(() => {
    setProductsList(MOCK_PRODUCTS);
  }, []);

  // Removed internal loading and hasAccess checks, handled via AdminRoute guard

  // Handle adding or updating products
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) return;

    if (editingProduct) {
      // Update
      const updatedList = productsList.map((p) =>
        p.id === editingProduct.id
          ? {
            ...p,
            name: prodName,
            price: parseFloat(prodPrice),
            originalPrice: prodOrigPrice ? parseFloat(prodOrigPrice) : undefined,
            image: prodImage || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80",
            category: prodCategory,
            material: prodMaterial,
            description: prodDesc
          }
          : p
      );
      setProductsList(updatedList);
      setEditingProduct(null);
    } else {
      // Create new
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: prodName,
        slug: prodName.toLowerCase().replace(/ /g, "-"),
        price: parseFloat(prodPrice),
        originalPrice: prodOrigPrice ? parseFloat(prodOrigPrice) : undefined,
        image: prodImage || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80",
        rating: 5.0,
        reviewsCount: 0,
        isBestseller: false,
        category: prodCategory,
        material: prodMaterial,
        description: prodDesc
      };
      setProductsList([newProduct, ...productsList]);
    }

    // Reset Form
    setShowProductForm(false);
    setProdName("");
    setProdPrice("");
    setProdOrigPrice("");
    setProdImage("");
    setProdCategory("rings");
    setProdMaterial("Sterling Silver");
    setProdDesc("");
  };

  const handleEditTrigger = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdPrice(prod.price.toString());
    setProdOrigPrice(prod.originalPrice ? prod.originalPrice.toString() : "");
    setProdImage(prod.image);
    setProdCategory(prod.category);
    setProdMaterial(prod.material || "Sterling Silver");
    setProdDesc(prod.description || "");
    setShowProductForm(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProductsList(productsList.filter((p) => p.id !== id));
    }
  };

  // Handle updating order status
  const handleOrderStatusChange = (id: string, status: string) => {
    setOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  // Handle adding coupons
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponValue) return;
    const newCoupon = {
      code: newCouponCode.trim().toUpperCase(),
      type: "percent",
      value: parseInt(newCouponValue),
      minPurchase: 0
    };
    setCoupons([...coupons, newCoupon]);
    setNewCouponCode("");
    setNewCouponValue("");
  };

  return (
    <div className="min-h-screen bg-accent/20 flex flex-col justify-between">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">

        {/* Banner Title */}
        <div className="border-b border-zinc-200 pb-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between justify-center gap-4">
          <div>
            <span className="text-secondary text-xs font-bold uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={12} /> Management Portal
            </span>
            <h1 className="font-serif text-3xl font-bold text-primary mt-1">ElanoraGems Admin Dashboard</h1>
          </div>
          {/* Demo Review Bypass removed */}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 gap-6 mb-8 text-xs font-bold uppercase tracking-wider overflow-x-auto pb-1">
          <button onClick={() => { setActiveTab("dashboard"); setShowProductForm(false); }} className={`pb-3 border-b-2 transition-all cursor-pointer ${activeTab === "dashboard" ? "border-secondary text-primary" : "border-transparent text-zinc-400 hover:text-zinc-600"}`}>Analytics Overview</button>
          <button onClick={() => { setActiveTab("products"); }} className={`pb-3 border-b-2 transition-all cursor-pointer ${activeTab === "products" ? "border-secondary text-primary" : "border-transparent text-zinc-400 hover:text-zinc-600"}`}>Manage Products</button>
          <button onClick={() => { setActiveTab("orders"); setShowProductForm(false); }} className={`pb-3 border-b-2 transition-all cursor-pointer ${activeTab === "orders" ? "border-secondary text-primary" : "border-transparent text-zinc-400 hover:text-zinc-600"}`}>Manage Orders</button>
          <button onClick={() => { setActiveTab("coupons"); setShowProductForm(false); }} className={`pb-3 border-b-2 transition-all cursor-pointer ${activeTab === "coupons" ? "border-secondary text-primary" : "border-transparent text-zinc-400 hover:text-zinc-600"}`}>Manage Coupons</button>
        </div>

        {/* Tab Contents */}
        <div className="bg-white border border-zinc-100 rounded-3xl p-6 sm:p-8 shadow-sm">

          {/* 1. ANALYTICS OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-10">

              {/* Stats Widgets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Revenue */}
                <div className="border border-zinc-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-zinc-50/50 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Gross Revenue</span>
                    <h3 className="font-serif text-2xl font-bold text-primary">₹12,48,200</h3>
                    <span className="text-green-700 text-[10px] font-bold flex items-center gap-0.5"><TrendingUp size={10} /> +12% this month</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold text-lg">₹</div>
                </div>

                {/* Orders */}
                <div className="border border-zinc-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-zinc-50/50 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total Orders</span>
                    <h3 className="font-serif text-2xl font-bold text-primary">482</h3>
                    <span className="text-green-700 text-[10px] font-bold flex items-center gap-0.5"><TrendingUp size={10} /> +8% this week</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <ShoppingBag size={18} />
                  </div>
                </div>

                {/* Users */}
                <div className="border border-zinc-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-zinc-50/50 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Customers</span>
                    <h3 className="font-serif text-2xl font-bold text-primary">891</h3>
                    <span className="text-green-700 text-[10px] font-bold flex items-center gap-0.5"><TrendingUp size={10} /> +15% this month</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center">
                    <Users size={18} />
                  </div>
                </div>

                {/* Conversion Rate */}
                <div className="border border-zinc-100 rounded-2xl p-5 hover:shadow-md transition-shadow bg-zinc-50/50 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Conversion Rate</span>
                    <h3 className="font-serif text-2xl font-bold text-primary">3.4%</h3>
                    <span className="text-green-700 text-[10px] font-bold flex items-center gap-0.5"><TrendingUp size={10} /> +0.4% improvement</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-50 text-green-700 flex items-center justify-center">
                    <Percent size={16} />
                  </div>
                </div>

              </div>

              {/* Custom SVG Sales Chart */}
              <div className="border border-zinc-100 rounded-2xl p-6 bg-zinc-50/30 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                  <h4 className="font-serif text-base font-bold text-primary">Monthly Sales Volume</h4>
                  <button className="text-[10px] font-bold text-zinc-400 hover:text-secondary flex items-center gap-1 uppercase">
                    <RefreshCw size={12} /> Sync Analytics
                  </button>
                </div>

                {/* SVG Line / Bar chart representation */}
                <div className="w-full overflow-x-auto">
                  <svg className="w-full min-w-[500px] h-[220px]" viewBox="0 0 600 220">
                    {/* Horizontal gridlines */}
                    <line x1="50" y1="30" x2="550" y2="30" stroke="#f4f4f5" strokeWidth="1" />
                    <line x1="50" y1="80" x2="550" y2="80" stroke="#f4f4f5" strokeWidth="1" />
                    <line x1="50" y1="130" x2="550" y2="130" stroke="#f4f4f5" strokeWidth="1" />
                    <line x1="50" y1="180" x2="550" y2="180" stroke="#e4e4e7" strokeWidth="1" />

                    {/* Chart Bars */}
                    {/* Jan */}
                    <rect x="90" y="100" width="30" height="80" rx="3" fill="#0F2F6B" opacity="0.85" />
                    <text x="105" y="200" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#71717a">JAN</text>
                    <text x="105" y="90" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0F2F6B">₹80K</text>

                    {/* Feb */}
                    <rect x="170" y="70" width="30" height="110" rx="3" fill="#D4AF37" opacity="0.9" />
                    <text x="185" y="200" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#71717a">FEB</text>
                    <text x="185" y="60" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#AA7C11">₹110K</text>

                    {/* Mar */}
                    <rect x="250" y="85" width="30" height="95" rx="3" fill="#0F2F6B" opacity="0.85" />
                    <text x="265" y="200" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#71717a">MAR</text>
                    <text x="265" y="75" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0F2F6B">₹95K</text>

                    {/* Apr */}
                    <rect x="330" y="50" width="30" height="130" rx="3" fill="#0F2F6B" opacity="0.85" />
                    <text x="345" y="200" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#71717a">APR</text>
                    <text x="345" y="40" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0F2F6B">₹130K</text>

                    {/* May */}
                    <rect x="410" y="40" width="30" height="140" rx="3" fill="#D4AF37" opacity="0.9" />
                    <text x="425" y="200" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#71717a">MAY</text>
                    <text x="425" y="30" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#AA7C11">₹140K</text>

                    {/* Jun */}
                    <rect x="490" y="20" width="30" height="160" rx="3" fill="#0F2F6B" opacity="0.95" />
                    <text x="505" y="200" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#71717a">JUN</text>
                    <text x="505" y="10" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0F2F6B">₹160K</text>
                  </svg>
                </div>
              </div>

            </div>
          )}

          {/* 2. MANAGE PRODUCTS */}
          {activeTab === "products" && (
            <div className="space-y-6">

              <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                <h3 className="font-serif text-lg font-bold text-primary">Jewellery Catalog ({productsList.length} items)</h3>
                {!showProductForm && (
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setShowProductForm(true);
                    }}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus size={14} className="text-secondary" /> Add Product
                  </button>
                )}
              </div>

              {showProductForm ? (
                /* Add / Edit Form */
                <form onSubmit={handleProductSubmit} className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5 space-y-4 max-w-2xl">
                  <h4 className="font-serif text-sm font-bold text-primary border-b border-zinc-200 pb-2">
                    {editingProduct ? `Edit Ornament: ${editingProduct.name}` : "Add New Ornament"}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase block">Product Name</label>
                      <input type="text" placeholder="Solitaire Diamond Ring" value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs outline-none focus:border-secondary" required />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase block">Image URL</label>
                      <input type="text" placeholder="https://images.unsplash.com/..." value={prodImage} onChange={(e) => setProdImage(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs outline-none focus:border-secondary" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase block">Selling Price (₹)</label>
                      <input type="number" placeholder="2999" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs outline-none focus:border-secondary" required />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase block">Original Price (₹) [Optional]</label>
                      <input type="number" placeholder="3999" value={prodOrigPrice} onChange={(e) => setProdOrigPrice(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs outline-none focus:border-secondary" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase block">Category</label>
                      <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs outline-none focus:border-secondary">
                        <option value="rings">Rings</option>
                        <option value="earrings">Earrings</option>
                        <option value="necklaces">Necklaces</option>
                        <option value="bracelets">Bracelets</option>
                        <option value="anklets">Anklets</option>
                        <option value="pendants">Pendants</option>
                        <option value="toe-rings">Toe Rings</option>
                        <option value="kada">Kada</option>
                        <option value="gift-sets">Gift Sets</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase block">Material Finish</label>
                      <input type="text" placeholder="925 Sterling Silver" value={prodMaterial} onChange={(e) => setProdMaterial(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs outline-none focus:border-secondary" />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase block">Description</label>
                      <textarea placeholder="Describe the item's luxury look..." rows={3} value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs outline-none focus:border-secondary resize-none" />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button type="submit" className="px-6 py-2 bg-secondary text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-secondary-hover transition-all cursor-pointer">
                      {editingProduct ? "Save Changes" : "Create Product"}
                    </button>
                    <button type="button" onClick={() => { setShowProductForm(false); setEditingProduct(null); }} className="px-6 py-2 bg-zinc-200 text-zinc-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-zinc-300 transition-all cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* Products Table */
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Product Info</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Material</th>
                        <th className="pb-3">Price</th>
                        <th className="pb-3">Rating</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {productsList.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="py-4 flex items-center gap-3">
                            <img src={p.image} alt="" className="w-10 h-10 object-cover rounded-md border border-zinc-100 bg-accent/20" />
                            <div>
                              <span className="font-bold text-primary text-sm block">{p.name}</span>
                              <span className="text-[10px] text-zinc-400 font-mono block">SKU: {p.id}</span>
                            </div>
                          </td>
                          <td className="py-4 capitalize font-semibold text-zinc-600">{p.category}</td>
                          <td className="py-4 text-zinc-500 font-semibold">{p.material || "Silver"}</td>
                          <td className="py-4 font-bold text-primary">₹{p.price}</td>
                          <td className="py-4 text-amber-500 font-bold">★ {p.rating}</td>
                          <td className="py-4 text-right space-x-2">
                            <button onClick={() => handleEditTrigger(p)} className="p-1 text-zinc-400 hover:text-secondary transition-colors inline-block" title="Edit">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors inline-block" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {/* 3. MANAGE ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <h3 className="font-serif text-lg font-bold text-primary border-b border-zinc-100 pb-4">Customer Orders</h3>

              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-4 font-bold text-primary">{o.id}</td>
                        <td className="py-4">
                          <span className="font-semibold text-primary block">{o.customer}</span>
                          <span className="text-[10px] text-zinc-400 block">{o.email}</span>
                        </td>
                        <td className="py-4 text-zinc-500 font-medium">{o.date}</td>
                        <td className="py-4 font-bold text-secondary">₹{o.total}</td>
                        <td className="py-4">
                          <select
                            value={o.status}
                            onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                            className="bg-zinc-50 border border-zinc-200 rounded p-1 text-[10px] font-bold uppercase tracking-wider outline-none text-zinc-700"
                          >
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-4 text-right">
                          <button className="text-secondary text-[10px] font-bold uppercase tracking-wider hover:underline">View Invoice</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. MANAGE COUPONS */}
          {activeTab === "coupons" && (
            <div className="space-y-6">

              <div className="border-b border-zinc-100 pb-4">
                <h3 className="font-serif text-lg font-bold text-primary">Promotional Coupons</h3>
              </div>

              {/* Add Coupon Form */}
              <form onSubmit={handleAddCoupon} className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5 flex flex-wrap gap-4 items-end max-w-xl">
                <div className="flex-1 min-w-[150px] space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block">Coupon Code</label>
                  <input type="text" placeholder="e.g. GOLD20" value={newCouponCode} onChange={(e) => setNewCouponCode(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs outline-none uppercase" required />
                </div>
                <div className="flex-1 min-w-[120px] space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block">Discount Value (%)</label>
                  <input type="number" placeholder="20" value={newCouponValue} onChange={(e) => setNewCouponValue(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-xs outline-none" required />
                </div>
                <button type="submit" className="px-5 py-2 bg-secondary text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-secondary-hover transition-colors flex items-center gap-1 cursor-pointer">
                  <Plus size={14} /> Add Code
                </button>
              </form>

              {/* Coupons List */}
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Promo Code</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Value</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {coupons.map((c) => (
                      <tr key={c.code} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-4 font-bold text-primary flex items-center gap-1.5">
                          <Tag size={14} className="text-secondary" /> {c.code}
                        </td>
                        <td className="py-4 text-zinc-500 font-medium capitalize">{c.type === "percent" ? "Percentage Off" : "Flat Amount"}</td>
                        <td className="py-4 font-bold text-primary">{c.value}{c.type === "percent" ? "%" : " Rs"}</td>
                        <td className="py-4 text-right">
                          <span className="bg-green-50 border border-green-200 text-green-700 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminRoute>
      <AdminDashboardContent />
    </AdminRoute>
  );
}
