"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Search, Filter, Eye, Download } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ordersRef = collection(db, "orders");
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const ordersData: any[] = [];
      snapshot.forEach(doc => {
        ordersData.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by date descending
      ordersData.sort((a, b) => {
        const dateA = a.createdAt?.toMillis() || 0;
        const dateB = b.createdAt?.toMillis() || 0;
        return dateB - dateA;
      });

      setOrders(ordersData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "failed": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { 
        status: newStatus,
        orderStatus: newStatus
      });
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.shippingAddress?.fullName || o.customerEmail || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2F6B]">Orders</h1>
          <p className="text-zinc-500 mt-1">Manage and track customer orders.</p>
        </div>
        <button className="bg-white border border-zinc-200 text-zinc-600 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-zinc-50 transition-colors shadow-sm">
          <Download size={20} />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID or Customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 flex items-center gap-2 hover:bg-zinc-50 flex-1 sm:flex-none justify-center">
              <Filter size={16} /> Status
            </button>
            <button className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 flex items-center gap-2 hover:bg-zinc-50 flex-1 sm:flex-none justify-center">
              <Filter size={16} /> Date
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-zinc-500 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Payment Info</th>
                <th className="px-6 py-4 font-semibold">Payment Status</th>
                <th className="px-6 py-4 font-semibold">Total Amount</th>
                <th className="px-6 py-4 font-semibold">Order Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-zinc-500">Loading orders...</td>
                </tr>
              ) : filteredOrders.length > 0 ? filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-[#0F2F6B]">{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-zinc-700">{order.shippingAddress?.fullName || order.customerEmail || "Guest"}</p>
                    {order.customerEmail && <p className="text-xs text-zinc-400">{order.customerEmail}</p>}
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {order.createdAt ? new Date(order.createdAt.toMillis()).toLocaleString() : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-zinc-700">{order.paymentMethod || "COD"}</p>
                    {order.razorpayPaymentId && (
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">{order.razorpayPaymentId}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold uppercase tracking-wider rounded-lg px-2.5 py-1 border ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus || "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#0F2F6B]">₹{(order.total ?? order.totalAmount)?.toLocaleString() || 0}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status || order.orderStatus || "pending"}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-xs font-bold uppercase tracking-wider rounded-lg px-2 py-1 border focus:outline-none cursor-pointer appearance-none ${getStatusColor(order.status || order.orderStatus)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-zinc-400 hover:text-[#0F2F6B] hover:bg-zinc-100 rounded-lg transition-colors inline-flex">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-zinc-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
