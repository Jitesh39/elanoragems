"use client";

import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  Clock,
  IndianRupee,
  Users,
  TrendingUp
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    activeOrders: 0,
    revenue: 0,
    totalUsers: 0,
    activeProducts: 0,
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [productsMap, setProductsMap] = useState<Record<string, string>>({});
  const [topCategory, setTopCategory] = useState({
    name: "N/A",
    percentage: 0
  });

  useEffect(() => {
    // 1. Live Orders Listener
    const ordersRef = collection(db, "orders");
    const unsubscribeOrders = onSnapshot(ordersRef, (snapshot) => {
      const ordersData: any[] = [];
      snapshot.forEach(doc => {
        ordersData.push({ id: doc.id, ...doc.data() });
      });

      // Sort by date descending
      ordersData.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return dateB - dateA;
      });

      setOrders(ordersData);
      setRecentOrders(ordersData.slice(0, 5));
    });

    // 2. Live Products Listener
    const productsRef = collection(db, "products");
    const unsubscribeProducts = onSnapshot(productsRef, (snapshot) => {
      const pMap: Record<string, string> = {};
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.category) {
          pMap[doc.id] = data.category;
        }
      });
      setProductsMap(pMap);
      setStats(prev => ({
        ...prev,
        totalProducts: snapshot.size,
        activeProducts: snapshot.size
      }));
    });

    // 3. Live Users Listener
    const usersRef = collection(db, "users");
    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
      setStats(prev => ({ ...prev, totalUsers: snapshot.size }));
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
      unsubscribeUsers();
    };
  }, []);

  // Compute stats and top categories from live orders and products
  useEffect(() => {
    let totalRevenue = 0;
    let activeOrdersCount = 0;
    const categorySales: Record<string, number> = {};
    let totalSoldItems = 0;

    orders.forEach(order => {
      // Revenue calculation: paymentStatus === "Paid", not cancelled
      const isPaid = order.paymentStatus === "Paid";
      const isCancelled = order.orderStatus?.toLowerCase() === "cancelled" || order.status?.toLowerCase() === "cancelled";

      if (isPaid && !isCancelled) {
        totalRevenue += Number(order.totalAmount) || Number(order.total) || 0;
      }

      // Active Orders count: orderStatus not in Delivered, Cancelled
      const orderStatus = (order.orderStatus || order.status || "Pending").toLowerCase();
      if (orderStatus !== "delivered" && orderStatus !== "cancelled") {
        activeOrdersCount++;
      }

      // Top category calculation (completed/paid orders)
      if (isPaid && !isCancelled) {
        const productsList = order.products || order.items || [];
        productsList.forEach((item: any) => {
          const productId = item.productId || item.id || "";
          const qty = Number(item.quantity) || 0;
          const rawCategory = item.category || productsMap[productId] || "Other";

          let catFormatted = rawCategory;
          if (rawCategory === "rings" || rawCategory === "ring") catFormatted = "Rings";
          else if (rawCategory === "necklaces" || rawCategory === "necklace") catFormatted = "Necklaces";
          else if (rawCategory === "bracelets" || rawCategory === "bracelet") catFormatted = "Bracelets";
          else if (rawCategory === "earrings" || rawCategory === "earring") catFormatted = "Earrings";
          else if (rawCategory === "pendants" || rawCategory === "pendant") catFormatted = "Pendants";
          else {
            catFormatted = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
          }

          categorySales[catFormatted] = (categorySales[catFormatted] || 0) + qty;
          totalSoldItems += qty;
        });
      }
    });

    let bestCategory = "N/A";
    let bestSalesCount = 0;
    let bestPercentage = 0;

    Object.entries(categorySales).forEach(([cat, count]) => {
      if (count > bestSalesCount) {
        bestSalesCount = count;
        bestCategory = cat;
      }
    });

    if (totalSoldItems > 0 && bestSalesCount > 0) {
      bestPercentage = Math.round((bestSalesCount / totalSoldItems) * 100);
    }

    setStats(prev => ({
      ...prev,
      revenue: totalRevenue,
      activeOrders: activeOrdersCount,
      totalOrders: orders.length
    }));

    setTopCategory({
      name: bestCategory,
      percentage: bestPercentage
    });
  }, [orders, productsMap]);

  const statCards = [
    { title: "Total Products", value: stats.totalProducts, icon: Package, color: "bg-blue-50 text-blue-600" },
    { title: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "bg-purple-50 text-purple-600" },
    { title: "Active Orders", value: stats.activeOrders, icon: Clock, color: "bg-amber-50 text-amber-600" },
    { title: "Total Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "bg-emerald-50 text-emerald-600" },
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-indigo-50 text-indigo-600" },
  ];

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

  const formatDate = (createdAt: any) => {
    if (!createdAt) return "N/A";
    const date = createdAt.toMillis ? new Date(createdAt.toMillis()) : new Date(createdAt);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="space-y-8 pb-8">

      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F2F6B]">Dashboard Overview</h1>
        <p className="text-zinc-500 mt-1">Welcome back to your store's control center.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100 flex items-center justify-between hover:shadow-md transition-shadow group">
              <div>
                <p className="text-sm font-semibold text-zinc-500 mb-1">{card.title}</p>
                <h3 className="text-3xl font-bold text-[#0F2F6B]">{card.value}</h3>
              </div>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#0F2F6B]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-[#D4AF37] hover:text-[#AA7C11]">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50/50 text-zinc-500 border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recentOrders.length > 0 ? recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#0F2F6B]">{order.orderId || order.orderNumber || order.id}</td>
                    <td className="px-6 py-4">{order.customerName || order.shippingAddress?.fullName || order.customerEmail || "Guest"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getPaymentStatusColor(order.paymentStatus || "Pending")}`}>
                        {order.paymentStatus || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">₹{(order.totalAmount || order.total || 0).toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 text-zinc-500">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No recent orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Growth Insights */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 space-y-6">
          <h2 className="text-lg font-bold text-[#0F2F6B]">Growth Insights</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Package size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase">Live Inventory</p>
                  <p className="font-bold text-[#0F2F6B]">You have {stats.totalProducts} active products</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase">Active Orders</p>
                  <p className="font-bold text-[#0F2F6B]">You have {stats.activeOrders} active orders</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-[#0F2F6B] to-blue-900 rounded-xl text-white mt-4 shadow-md">
              <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Top Category</p>
              <h4 className="text-xl font-bold mb-2">{topCategory.name}</h4>
              <p className="text-sm text-blue-100">Contributes to {topCategory.percentage}% of total sales.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
