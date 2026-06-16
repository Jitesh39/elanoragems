"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { 
  Download, Calendar, Package, ShoppingBag, Clock, IndianRupee, Users, 
  TrendingUp, AlertTriangle, CheckCircle, Mail, Sparkles, Star, ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days");
  const [isLoading, setIsLoading] = useState(true);

  // Firestore Realtime Collections
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);

  // Category mapping
  const [productsMap, setProductsMap] = useState<Record<string, string>>({});

  // Realtime Listeners
  useEffect(() => {
    // 1. Orders Listener
    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const ords: any[] = [];
      snapshot.forEach(doc => {
        ords.push({ id: doc.id, ...doc.data() });
      });
      setOrders(ords);
    });

    // 2. Products Listener
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const prods: any[] = [];
      const pMap: Record<string, string> = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        prods.push({ id: doc.id, ...data });
        if (data.category) {
          pMap[doc.id] = data.category;
        }
      });
      setProducts(prods);
      setProductsMap(pMap);
    });

    // 3. Users Listener
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usrs: any[] = [];
      snapshot.forEach(doc => {
        usrs.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usrs);
    });

    // 4. Categories Listener
    const unsubCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      const cats: any[] = [];
      snapshot.forEach(doc => {
        cats.push({ id: doc.id, ...doc.data() });
      });
      setCategories(cats);
    });

    // 5. Subscribers Listener
    const unsubSubscribers = onSnapshot(collection(db, "subscribers"), (snapshot) => {
      const subs: any[] = [];
      snapshot.forEach(doc => {
        subs.push({ id: doc.id, ...doc.data() });
      });
      setSubscribers(subs);
      setIsLoading(false);
    });

    return () => {
      unsubOrders();
      unsubProducts();
      unsubUsers();
      unsubCategories();
      unsubSubscribers();
    };
  }, []);

  const parseDate = (val: any) => {
    if (!val) return null;
    if (val.toMillis) return new Date(val.toMillis());
    if (val.seconds) return new Date(val.seconds * 1000);
    const parsed = new Date(val);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  // 1. REVENUE CALCULATIONS (paymentStatus = "Paid")
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  const startOfWeek = new Date(today);
  const dayVal = startOfWeek.getDay();
  const diffVal = startOfWeek.getDate() - dayVal + (dayVal === 0 ? -6 : 1);
  startOfWeek.setDate(diffVal);
  startOfWeek.setHours(0, 0, 0, 0);
  const weekTime = startOfWeek.getTime();

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);
  const monthTime = startOfMonth.getTime();

  let todayRevenue = 0;
  let weekRevenue = 0;
  let monthRevenue = 0;
  let lifetimeRevenue = 0;

  // 2. ORDER STATUS COUNTS
  let pendingOrders = 0;
  let confirmedOrders = 0;
  let processingOrders = 0;
  let shippedOrders = 0;
  let deliveredOrders = 0;
  let cancelledOrders = 0;

  // 3. CATEGORY REVENUE & UNITS
  const categoryRevenue: Record<string, number> = {};
  const categoryUnits: Record<string, number> = {};
  
  // 4. TOP PRODUCTS
  const productSalesMap: Record<string, { name: string; image: string; units: number; revenue: number }> = {};

  orders.forEach(order => {
    const isPaid = order.paymentStatus === "Paid";
    const isCancelled = order.orderStatus?.toLowerCase() === "cancelled" || order.status?.toLowerCase() === "cancelled";
    const orderAmt = Number(order.totalAmount) || Number(order.total) || 0;
    const orderDate = parseDate(order.createdAt);

    // Revenue Accumulation
    if (isPaid && !isCancelled) {
      lifetimeRevenue += orderAmt;
      if (orderDate) {
        const orderTime = orderDate.getTime();
        if (orderTime >= todayTime) todayRevenue += orderAmt;
        if (orderTime >= weekTime) weekRevenue += orderAmt;
        if (orderTime >= monthTime) monthRevenue += orderAmt;
      }
    }

    // Order Status Aggregates
    const status = (order.orderStatus || order.status || "Pending").toLowerCase();
    if (status === "pending") pendingOrders++;
    else if (status === "confirmed") confirmedOrders++;
    else if (status === "processing") processingOrders++;
    else if (status === "shipped") shippedOrders++;
    else if (status === "delivered") deliveredOrders++;
    else if (status === "cancelled") cancelledOrders++;

    // Category Sales and Top Products mapping (from paid/completed orders only)
    if (isPaid && !isCancelled) {
      const itemsList = order.products || order.items || [];
      itemsList.forEach((item: any) => {
        const productId = item.productId || item.id || "";
        const qty = Number(item.quantity) || 0;
        const itemPrice = Number(item.price) || 0;
        const itemTotal = itemPrice * qty;

        // Dynamic category lookup matching admin categories
        const catSlug = item.category || productsMap[productId] || "Other";
        const matchedCat = categories.find(c => c.slug === catSlug || c.id === catSlug);
        const catName = matchedCat ? matchedCat.name : (catSlug.charAt(0).toUpperCase() + catSlug.slice(1));

        categoryRevenue[catName] = (categoryRevenue[catName] || 0) + itemTotal;
        categoryUnits[catName] = (categoryUnits[catName] || 0) + qty;

        // Top product mapping
        if (productId) {
          if (!productSalesMap[productId]) {
            productSalesMap[productId] = {
              name: item.productName || item.name || "Premium Ornament",
              image: item.productImage || item.image || "/placeholder.png",
              units: 0,
              revenue: 0
            };
          }
          productSalesMap[productId].units += qty;
          productSalesMap[productId].revenue += itemTotal;
        }
      });
    }
  });

  // Calculate dynamic sales-by-category share
  const totalCategoryRev = Object.values(categoryRevenue).reduce((sum, val) => sum + val, 0);
  const categoryChartData = Object.entries(categoryRevenue).map(([name, revenue]) => ({
    name,
    value: totalCategoryRev > 0 ? Math.round((revenue / totalCategoryRev) * 100) : 0,
    revenue,
    units: categoryUnits[name] || 0
  })).sort((a, b) => b.revenue - a.revenue);

  const CATEGORY_COLORS = ['#0F2F6B', '#D4AF37', '#3b82f6', '#10b981', '#6b7280', '#ec4899', '#f59e0b', '#8b5cf6'];

  // Top Selling Category Analytics values
  let topCatName = "N/A";
  let topCatUnits = 0;
  let topCatRevenue = 0;
  let topCatPercentage = 0;

  const totalUnitsSold = Object.values(categoryUnits).reduce((sum, val) => sum + val, 0);
  Object.entries(categoryUnits).forEach(([name, units]) => {
    if (units > topCatUnits) {
      topCatUnits = units;
      topCatName = name;
      topCatRevenue = categoryRevenue[name] || 0;
    }
  });

  if (totalUnitsSold > 0 && topCatUnits > 0) {
    topCatPercentage = Math.round((topCatUnits / totalUnitsSold) * 100);
  }

  // Top Selling Products Array
  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  // 5. PRODUCT ANALYTICS
  const totalProductsCount = products.length;
  const activeProducts = products.filter(p => Number(p.stock) > 0).length;
  const outOfStockProducts = products.filter(p => Number(p.stock) <= 0).length;
  const lowStockProducts = products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5).length;

  // 6. USER ANALYTICS
  const totalUsers = users.length;
  let newUsersThisMonth = 0;
  let newUsersThisWeek = 0;

  users.forEach(u => {
    const uDate = parseDate(u.createdAt);
    if (uDate) {
      const uTime = uDate.getTime();
      if (uTime >= weekTime) newUsersThisWeek++;
      if (uTime >= monthTime) newUsersThisMonth++;
    }
  });

  // 7. SUBSCRIBER ANALYTICS
  const totalSubscribers = subscribers.length;
  let newSubscribersThisMonth = 0;

  subscribers.forEach(sub => {
    const subDate = parseDate(sub.subscribedAt);
    if (subDate && subDate.getTime() >= monthTime) {
      newSubscribersThisMonth++;
    }
  });

  // Recent 10 Orders sorted by date
  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
    const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
    return dateB - dateA;
  });
  const recentOrdersList = sortedOrders.slice(0, 10);

  // 8. TRENDS DATA FOR CHARTS
  const getTrendData = (ordersList: any[], range: string) => {
    const dataMap: Record<string, { date: string; revenue: number; orders: number; timestamp: number }> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let limitDays = 30;
    let isYear = false;

    if (range === "7days") limitDays = 7;
    else if (range === "30days") limitDays = 30;
    else if (range === "90days") limitDays = 90;
    else if (range === "year") {
      limitDays = 365;
      isYear = true;
    }

    if (!isYear) {
      for (let i = limitDays - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const dateString = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        dataMap[dateString] = { date: dateString, revenue: 0, orders: 0, timestamp: d.getTime() };
      }

      ordersList.forEach(o => {
        const isPaid = o.paymentStatus === "Paid";
        const isCancelled = o.orderStatus?.toLowerCase() === "cancelled" || o.status?.toLowerCase() === "cancelled";
        if (isPaid && !isCancelled) {
          const oDate = parseDate(o.createdAt);
          if (oDate) {
            const dateString = oDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
            if (dataMap[dateString]) {
              const amt = Number(o.totalAmount) || Number(o.total) || 0;
              dataMap[dateString].revenue += amt;
              dataMap[dateString].orders += 1;
            }
          }
        }
      });

      return Object.values(dataMap).sort((a, b) => a.timestamp - b.timestamp);
    } else {
      const monthlyMap: Record<string, { date: string; revenue: number; orders: number; monthVal: number; yearVal: number }> = {};
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const dateString = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
        monthlyMap[dateString] = {
          date: dateString,
          revenue: 0,
          orders: 0,
          monthVal: d.getMonth(),
          yearVal: d.getFullYear()
        };
      }

      ordersList.forEach(o => {
        const isPaid = o.paymentStatus === "Paid";
        const isCancelled = o.orderStatus?.toLowerCase() === "cancelled" || o.status?.toLowerCase() === "cancelled";
        if (isPaid && !isCancelled) {
          const oDate = parseDate(o.createdAt);
          if (oDate) {
            const dateString = oDate.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
            if (monthlyMap[dateString]) {
              const amt = Number(o.totalAmount) || Number(o.total) || 0;
              monthlyMap[dateString].revenue += amt;
              monthlyMap[dateString].orders += 1;
            }
          }
        }
      });

      return Object.values(monthlyMap).sort((a, b) => {
        if (a.yearVal !== b.yearVal) return a.yearVal - b.yearVal;
        return a.monthVal - b.monthVal;
      });
    }
  };

  const getUserGrowthData = (usersList: any[]) => {
    const monthlyUsers: Record<string, { month: string; users: number; monthVal: number; yearVal: number }> = {};
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = d.toLocaleDateString("en-IN", { month: "short" });
      monthlyUsers[monthStr] = {
        month: monthStr,
        users: 0,
        monthVal: d.getMonth(),
        yearVal: d.getFullYear()
      };
    }

    usersList.forEach(u => {
      const uDate = parseDate(u.createdAt);
      if (uDate) {
        const monthStr = uDate.toLocaleDateString("en-IN", { month: "short" });
        if (monthlyUsers[monthStr]) {
          monthlyUsers[monthStr].users += 1;
        }
      }
    });

    let cumulativeSum = 0;
    const sortedMonths = Object.values(monthlyUsers).sort((a, b) => {
      if (a.yearVal !== b.yearVal) return a.yearVal - b.yearVal;
      return a.monthVal - b.monthVal;
    });
    
    const firstMonthStart = new Date(sortedMonths[0].yearVal, sortedMonths[0].monthVal, 1).getTime();
    usersList.forEach(u => {
      const uDate = parseDate(u.createdAt);
      if (uDate && uDate.getTime() < firstMonthStart) {
        cumulativeSum++;
      }
    });

    return sortedMonths.map(m => {
      cumulativeSum += m.users;
      return {
        month: m.month,
        users: cumulativeSum
      };
    });
  };

  const trendData = getTrendData(orders, timeRange) as any[];
  const userGrowthData = getUserGrowthData(users);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "confirmed": return "bg-blue-100 text-blue-700 border-blue-200";
      case "processing": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "shipped": return "bg-purple-100 text-purple-700 border-purple-200";
      case "delivered": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "failed": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl shadow-sm border border-zinc-100 min-h-[400px]">
        <Clock className="w-12 h-12 text-[#0F2F6B] animate-spin mb-4" />
        <p className="text-zinc-500 font-serif text-sm font-semibold uppercase tracking-wider">Compiling Live Store Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2F6B]">Analytics & Reports</h1>
          <p className="text-zinc-500 mt-1">Detailed real-time insights powered by live database collections.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-white border border-zinc-200 rounded-xl px-3 py-2 flex items-center gap-2 flex-1 sm:flex-none">
            <Calendar size={16} className="text-zinc-400" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-sm font-semibold text-zinc-600 focus:outline-none cursor-pointer"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* 1. Revenue Analytics Cluster */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#0F2F6B] flex items-center gap-2">
          <IndianRupee size={20} className="text-[#D4AF37]" /> Revenue Performance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Today Revenue</span>
            <h3 className="text-2xl font-black text-[#0F2F6B] mt-1">₹{todayRevenue.toLocaleString("en-IN")}</h3>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">This Week Revenue</span>
            <h3 className="text-2xl font-black text-[#0F2F6B] mt-1">₹{weekRevenue.toLocaleString("en-IN")}</h3>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">This Month Revenue</span>
            <h3 className="text-2xl font-black text-[#0F2F6B] mt-1">₹{monthRevenue.toLocaleString("en-IN")}</h3>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm bg-gradient-to-br from-[#0F2F6B]/5 to-secondary/5">
            <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">Lifetime Revenue</span>
            <h3 className="text-2xl font-black text-[#0F2F6B] mt-1">₹{lifetimeRevenue.toLocaleString("en-IN")}</h3>
          </div>
        </div>
      </div>

      {/* 2. Order & Stock Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Order Status Analytics */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 space-y-4">
          <h3 className="font-bold text-sm text-[#0F2F6B] uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag size={18} className="text-[#D4AF37]" /> Order Pipelines
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide block">Total Orders</span>
              <p className="text-xl font-bold text-primary mt-1">{orders.length}</p>
            </div>
            <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-100">
              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wide block">Pending</span>
              <p className="text-xl font-bold text-amber-700 mt-1">{pendingOrders}</p>
            </div>
            <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100">
              <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wide block">Confirmed</span>
              <p className="text-xl font-bold text-blue-700 mt-1">{confirmedOrders}</p>
            </div>
            <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100">
              <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wide block">Processing</span>
              <p className="text-xl font-bold text-indigo-700 mt-1">{processingOrders}</p>
            </div>
            <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-100">
              <span className="text-[9px] font-bold text-purple-500 uppercase tracking-wide block">Shipped</span>
              <p className="text-xl font-bold text-purple-700 mt-1">{shippedOrders}</p>
            </div>
            <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100">
              <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wide block">Delivered</span>
              <p className="text-xl font-bold text-emerald-700 mt-1">{deliveredOrders}</p>
            </div>
            <div className="p-4 bg-red-50/40 rounded-xl border border-red-100 col-span-2">
              <span className="text-[9px] font-bold text-red-500 uppercase tracking-wide block">Cancelled Orders</span>
              <p className="text-xl font-bold text-red-700 mt-1">{cancelledOrders}</p>
            </div>
          </div>
        </div>

        {/* Product Inventory Analytics */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 space-y-4">
          <h3 className="font-bold text-sm text-[#0F2F6B] uppercase tracking-wider flex items-center gap-2">
            <Package size={18} className="text-[#D4AF37]" /> Stock & Inventory
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide block">Total Products</span>
              <p className="text-xl font-bold text-primary mt-1">{totalProductsCount}</p>
            </div>
            <div className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-100">
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide block">Active Products (In Stock)</span>
              <p className="text-xl font-bold text-emerald-700 mt-1">{activeProducts}</p>
            </div>
            <div className="p-4 bg-red-50/30 rounded-xl border border-red-100">
              <span className="text-[9px] font-bold text-red-600 uppercase tracking-wide block">Out Of Stock Products</span>
              <p className="text-xl font-bold text-red-700 mt-1">{outOfStockProducts}</p>
            </div>
            <div className="p-4 bg-amber-50/30 rounded-xl border border-amber-100">
              <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wide block">Low Stock Products (≤ 5)</span>
              <p className="text-xl font-bold text-amber-700 mt-1">{lowStockProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. User & Subscriber Analytics Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#0F2F6B] flex items-center gap-2">
          <Users size={20} className="text-[#D4AF37]" /> Customer Base & Growth
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
            <span className="text-[10px] font-bold text-zinc-400 uppercase block">Total Customers</span>
            <h3 className="text-2xl font-black text-primary mt-1">{totalUsers}</h3>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
            <span className="text-[10px] font-bold text-zinc-400 uppercase block">New Users (Month)</span>
            <h3 className="text-2xl font-black text-primary mt-1">+{newUsersThisMonth}</h3>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
            <span className="text-[10px] font-bold text-zinc-400 uppercase block">New Users (Week)</span>
            <h3 className="text-2xl font-black text-primary mt-1">+{newUsersThisWeek}</h3>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
            <span className="text-[10px] font-bold text-zinc-400 uppercase block">Total Subscribers</span>
            <h3 className="text-2xl font-black text-primary mt-1">{totalSubscribers}</h3>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
            <span className="text-[10px] font-bold text-zinc-400 uppercase block">New Subs (Month)</span>
            <h3 className="text-2xl font-black text-primary mt-1">+{newSubscribersThisMonth}</h3>
          </div>
        </div>
      </div>

      {/* 4. Trends Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Trend Area Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#0F2F6B]">Sales Revenue Trend</h2>
            <p className="text-sm text-zinc-500">Gross revenue generated from paid orders</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenueAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F2F6B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0F2F6B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0F2F6B" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenueAnalytics)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Trend Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#0F2F6B]">Orders Volume Trend</h2>
            <p className="text-sm text-zinc-500">Number of orders placed per day</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <Tooltip 
                  cursor={{ fill: '#f4f4f5' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="orders" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category Donut Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#0F2F6B]">Sales by Category</h2>
            <p className="text-sm text-zinc-500">Revenue share across collections</p>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="revenue"
                    stroke="none"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-zinc-400 font-semibold uppercase">No category sales registered yet.</p>
            )}
          </div>
        </div>

        {/* User Growth Line Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#0F2F6B]">User Growth Trend</h2>
            <p className="text-sm text-zinc-500">Cumulative customer registrations over time</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 5. Top selling Category Insight Banner */}
      {topCatName !== "N/A" && (
        <div className="bg-gradient-to-r from-[#0F2F6B] via-[#0D2654] to-[#1D4ED8] rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border border-[#D4AF37]/15">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles size={12} /> Top Selling Category Insight
            </span>
            <h4 className="font-serif text-2xl font-bold">{topCatName}</h4>
            <p className="text-sm text-blue-100 normal-case">
              Contributes to <strong className="text-white font-bold">{topCatPercentage}%</strong> of total ornament quantities sold.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold uppercase tracking-wider bg-black/20 p-4 rounded-2xl border border-white/10">
            <div>
              <span className="text-[9px] text-zinc-300 block font-bold">Units Sold</span>
              <span className="text-lg font-bold text-white block mt-0.5">{topCatUnits} Units</span>
            </div>
            <div>
              <span className="text-[9px] text-zinc-300 block font-bold">Revenue Generated</span>
              <span className="text-lg font-bold text-[#D4AF37] block mt-0.5">₹{topCatRevenue.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      )}

      {/* 6. Top Selling Products & Recent Orders Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top 5 Selling Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0F2F6B] uppercase tracking-wider flex items-center gap-2 mb-4">
              <Star size={18} className="text-[#D4AF37]" /> Top 5 Selling Products
            </h3>
            {topProducts.length > 0 ? (
              <div className="divide-y divide-zinc-100">
                {topProducts.map((p: any, idx: number) => (
                  <div key={idx} className="py-3 flex items-center gap-3 first:pt-0 last:pb-0">
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      className="w-12 h-12 rounded-lg object-cover border border-zinc-100 bg-accent flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-primary truncate">{p.name}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{p.units} Units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-secondary">₹{p.revenue.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 font-semibold uppercase py-8 text-center">No sales registered.</p>
            )}
          </div>
        </div>

        {/* Recent 10 Orders Table list */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-[#0F2F6B] uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag size={18} className="text-[#D4AF37]" /> Recent Orders
              </h3>
              <Link href="/admin/orders" className="text-xs font-bold text-[#D4AF37] hover:text-[#AA7C11] uppercase tracking-wider flex items-center gap-0.5">
                Manage Orders <ChevronRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50/50 text-zinc-500 border-b border-zinc-100 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Order ID</th>
                    <th className="px-5 py-3.5">Customer Name</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {recentOrdersList.length > 0 ? recentOrdersList.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-5 py-3 font-bold text-[#0F2F6B]">{order.orderId || order.orderNumber || order.id}</td>
                      <td className="px-5 py-3 font-semibold text-zinc-700">{order.customerName || order.shippingAddress?.fullName || order.customerEmail || "Guest"}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getPaymentStatusColor(order.paymentStatus || "Pending")}`}>
                          {order.paymentStatus || "Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-bold text-primary">₹{(order.totalAmount || order.total || 0).toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3 text-zinc-500 font-semibold">
                        {order.createdAt ? new Date(order.createdAt.toMillis ? order.createdAt.toMillis() : order.createdAt).toLocaleDateString("en-IN") : "N/A"}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-zinc-400 font-semibold uppercase">No recent orders registered.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
