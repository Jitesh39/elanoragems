"use client";

import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Package, 
  ShoppingBag, 
  Clock, 
  IndianRupee, 
  Users, 
  Gift,
  TrendingUp
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
    totalUsers: 0,
    totalGiftSets: 0,
    activeProducts: 0,
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    // This is a simplified fetching logic for demonstration
    // Ideally you would use onSnapshot for live counts or cloud functions
    
    // 1. Live Orders Listener
    const ordersRef = collection(db, "orders");
    const unsubscribeOrders = onSnapshot(ordersRef, (snapshot) => {
      let revenue = 0;
      let pendingCount = 0;
      const ordersData: any[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        revenue += data.totalAmount || 0;
        if (data.status === "pending" || data.status === "processing") pendingCount++;
        
        ordersData.push({ id: doc.id, ...data });
      });

      // Sort by date descending
      ordersData.sort((a, b) => {
        const dateA = a.createdAt?.toMillis() || 0;
        const dateB = b.createdAt?.toMillis() || 0;
        return dateB - dateA;
      });

      setStats(prev => ({ 
        ...prev, 
        totalOrders: snapshot.size,
        pendingOrders: pendingCount,
        revenue: revenue
      }));
      
      setRecentOrders(ordersData.slice(0, 5));
    });

    // 2. Live Products Listener
    const productsRef = collection(db, "products");
    const unsubscribeProducts = onSnapshot(productsRef, (snapshot) => {
      setStats(prev => ({ 
        ...prev, 
        totalProducts: snapshot.size,
        activeProducts: snapshot.size // Assuming all are active for now
      }));
    });

    // 3. Live Users Listener
    const usersRef = collection(db, "users");
    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
      setStats(prev => ({ ...prev, totalUsers: snapshot.size }));
    });

    // 4. Live Gift Sets Listener
    const giftSetsRef = collection(db, "giftSets");
    const unsubscribeGiftSets = onSnapshot(giftSetsRef, (snapshot) => {
      setStats(prev => ({ ...prev, totalGiftSets: snapshot.size }));
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
      unsubscribeUsers();
      unsubscribeGiftSets();
    };
  }, []);

  const statCards = [
    { title: "Total Products", value: stats.totalProducts, icon: Package, color: "bg-blue-50 text-blue-600" },
    { title: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "bg-purple-50 text-purple-600" },
    { title: "Pending Orders", value: stats.pendingOrders, icon: Clock, color: "bg-amber-50 text-amber-600" },
    { title: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: IndianRupee, color: "bg-emerald-50 text-emerald-600" },
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-indigo-50 text-indigo-600" },
    { title: "Gift Sets", value: stats.totalGiftSets, icon: Gift, color: "bg-pink-50 text-pink-600" },
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
            <button className="text-sm font-semibold text-[#D4AF37] hover:text-[#AA7C11]">View All</button>
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
                    <td className="px-6 py-4 font-medium text-[#0F2F6B]">{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-4">{order.shippingAddress?.fullName || order.customerEmail || "Guest"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                        {order.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">₹{order.totalAmount?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 text-zinc-500">
                      {order.createdAt ? new Date(order.createdAt.toMillis()).toLocaleDateString() : "N/A"}
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
                  <p className="font-bold text-[#0F2F6B]">You have {stats.activeProducts} active products</p>
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
                  <p className="font-bold text-[#0F2F6B]">You have {stats.pendingOrders} active orders</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl border border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                  <Gift size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase">Active Gift Sets</p>
                  <p className="font-bold text-[#0F2F6B]">You have {stats.totalGiftSets} active gift sets</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-[#0F2F6B] to-blue-900 rounded-xl text-white mt-4 shadow-md">
              <p className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-1">Top Category</p>
              <h4 className="text-xl font-bold mb-2">Bridal Jewellery</h4>
              <p className="text-sm text-blue-100">Contributes to 42% of total sales this month.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
