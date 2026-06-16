"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createNotification } from "@/lib/notifications";
import { Search, Filter, Eye, Download, X, Calendar, User, Phone, Mail, CreditCard, ShieldCheck } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Selected Order for Detail Drawer
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    const ordersRef = collection(db, "orders");
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
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
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Auto-open order details drawer if orderId is in URL query parameters
  useEffect(() => {
    if (orders.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const orderIdParam = params.get("orderId");
      if (orderIdParam) {
        const found = orders.find(o => o.id === orderIdParam || o.orderId === orderIdParam || o.orderNumber === orderIdParam);
        if (found) {
          setSelectedOrder(found);
        }
      }
    }
  }, [orders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { 
        status: newStatus,
        orderStatus: newStatus
      });

      if (newStatus === "Cancelled") {
        try {
          await createNotification({
            type: "order",
            title: "Order Cancelled",
            message: `Order #${orderId} was cancelled.`,
            referenceId: orderId
          });
        } catch (notifErr) {
          console.error("Failed to create cancellation notification:", notifErr);
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newPaymentStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { 
        paymentStatus: newPaymentStatus
      });
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  const getOrderDate = (order: any) => {
    if (!order.createdAt) return null;
    return order.createdAt.toMillis ? new Date(order.createdAt.toMillis()) : new Date(order.createdAt);
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

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "failed": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

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

  // Filter Logic (combining all filters)
  const filteredOrders = orders.filter(o => {
    // 1. Search term
    const orderId = (o.orderId || o.orderNumber || o.id || "").toLowerCase();
    const customerName = (o.customerName || o.shippingAddress?.fullName || "").toLowerCase();
    const customerEmail = (o.userEmail || o.customerEmail || "").toLowerCase();
    const customerPhone = (o.customerPhone || o.shippingAddress?.phone || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = 
      orderId.includes(search) ||
      customerName.includes(search) ||
      customerEmail.includes(search) ||
      customerPhone.includes(search);

    if (!matchesSearch) return false;

    // 2. Order Status Filter
    const oStatus = o.orderStatus || o.status || "Pending";
    if (statusFilter !== "All" && oStatus.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }

    // 3. Payment Status Filter
    const pStatus = o.paymentStatus || "Pending";
    if (paymentFilter !== "All" && pStatus.toLowerCase() !== paymentFilter.toLowerCase()) {
      return false;
    }

    // 4. Date Range Filter
    const oDate = getOrderDate(o);
    if (!oDate && dateFilter !== "All") return false;

    if (oDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const orderTime = oDate.getTime();

      if (dateFilter === "Today") {
        const startOfToday = today.getTime();
        const endOfToday = today.getTime() + 24 * 60 * 60 * 1000;
        if (orderTime < startOfToday || orderTime >= endOfToday) return false;
      } else if (dateFilter === "Last 7 Days") {
        const sevenDaysAgo = today.getTime() - 7 * 24 * 60 * 60 * 1000;
        if (orderTime < sevenDaysAgo) return false;
      } else if (dateFilter === "Last 30 Days") {
        const thirtyDaysAgo = today.getTime() - 30 * 24 * 60 * 60 * 1000;
        if (orderTime < thirtyDaysAgo) return false;
      } else if (dateFilter === "This Month") {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
        if (orderTime < startOfMonth) return false;
      } else if (dateFilter === "Custom Range") {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (orderTime < start.getTime()) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (orderTime > end.getTime()) return false;
        }
      }
    }

    return true;
  });

  // Export CSV Function
  const exportToCSV = () => {
    const headers = [
      "Order ID",
      "Customer Name",
      "Customer Email",
      "Phone",
      "Total Amount",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Date"
    ];

    const rows = filteredOrders.map(o => {
      const orderId = o.orderId || o.orderNumber || o.id || "";
      const customerName = o.customerName || o.shippingAddress?.fullName || "";
      const customerEmail = o.userEmail || o.customerEmail || "Guest";
      const phone = o.customerPhone || o.shippingAddress?.phone || "";
      const totalAmount = o.totalAmount || o.total || 0;
      const paymentMethod = o.paymentMethod || "COD";
      const paymentStatus = o.paymentStatus || "Pending";
      const orderStatus = o.orderStatus || o.status || "Pending";
      const orderDate = o.createdAt
        ? new Date(o.createdAt.toMillis ? o.createdAt.toMillis() : o.createdAt).toLocaleString("en-IN")
        : "N/A";

      return [
        `"${orderId.replace(/"/g, '""')}"`,
        `"${customerName.replace(/"/g, '""')}"`,
        `"${customerEmail.replace(/"/g, '""')}"`,
        `"${phone.replace(/"/g, '""')}"`,
        totalAmount,
        `"${paymentMethod.replace(/"/g, '""')}"`,
        `"${paymentStatus.replace(/"/g, '""')}"`,
        `"${orderStatus.replace(/"/g, '""')}"`,
        `"${orderDate.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const filename = `orders-export-${yyyy}-${mm}-${dd}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2F6B]">Orders</h1>
          <p className="text-zinc-500 mt-1">Manage and track customer orders.</p>
        </div>
        <button
          onClick={exportToCSV}
          className="bg-white border border-zinc-200 text-zinc-600 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-zinc-50 transition-colors shadow-sm cursor-pointer"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        {/* Table Toolbar / Filters */}
        <div className="p-5 border-b border-zinc-100 flex flex-col gap-4 bg-zinc-50/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="Search ID, Customer, Email, Phone..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]"
              />
            </div>

            {/* Filter Inputs Grid */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex flex-col min-w-[120px]">
                <span className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Order Status</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-600 focus:outline-none focus:border-[#0F2F6B]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex flex-col min-w-[120px]">
                <span className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Payment Status</span>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-600 focus:outline-none focus:border-[#0F2F6B]"
                >
                  <option value="All">All Payments</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>

              <div className="flex flex-col min-w-[120px]">
                <span className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Date Range</span>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-600 focus:outline-none focus:border-[#0F2F6B]"
                >
                  <option value="All">All Time</option>
                  <option value="Today">Today</option>
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="This Month">This Month</option>
                  <option value="Custom Range">Custom Range</option>
                </select>
              </div>
            </div>
          </div>

          {/* Custom Date Picker Inputs */}
          {dateFilter === "Custom Range" && (
            <div className="flex items-center gap-3 p-3 bg-white border border-zinc-100 rounded-xl animate-fadeIn w-fit">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-semibold uppercase">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-600 focus:outline-none focus:border-[#0F2F6B]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-semibold uppercase">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-600 focus:outline-none focus:border-[#0F2F6B]"
                />
              </div>
            </div>
          )}
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
                  <td className="px-6 py-4 font-bold text-[#0F2F6B]">{order.orderId || order.orderNumber || order.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-zinc-700">{order.customerName || order.shippingAddress?.fullName || order.customerEmail || "Guest"}</p>
                    {(order.userEmail || order.customerEmail) && <p className="text-xs text-zinc-400">{order.userEmail || order.customerEmail}</p>}
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-zinc-700">{order.paymentMethod || "COD"}</p>
                    {order.razorpayPaymentId && (
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">{order.razorpayPaymentId.slice(0, 15)}...</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold uppercase tracking-wider rounded-lg px-2.5 py-1 border ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus || "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#0F2F6B]">₹{(order.totalAmount ?? order.total ?? 0).toLocaleString("en-IN")}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.orderStatus || order.status || "Pending"}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`text-xs font-bold uppercase tracking-wider rounded-lg px-2 py-1 border focus:outline-none cursor-pointer appearance-none ${getStatusColor(order.orderStatus || order.status)}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-zinc-400 hover:text-[#0F2F6B] hover:bg-zinc-100 rounded-lg transition-colors inline-flex cursor-pointer"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-zinc-500">No orders found matching the filter rules.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Drawer Overlay for Order Details */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-sm transition-opacity flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between animate-slideIn">
            
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#0F2F6B]">Order Details</h3>
                <p className="text-xs text-zinc-400 font-semibold uppercase mt-0.5">{selectedOrder.orderId || selectedOrder.orderNumber || selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Status Controls */}
              <div className="grid grid-cols-2 gap-4 bg-[#0F2F6B]/5 border border-[#0F2F6B]/10 rounded-2xl p-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Update Order Status</label>
                  <select
                    value={selectedOrder.orderStatus || selectedOrder.status || "Pending"}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      await handleStatusChange(selectedOrder.id, newStatus);
                      setSelectedOrder((prev: any) => ({ ...prev, orderStatus: newStatus, status: newStatus }));
                    }}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold uppercase tracking-wider text-[#0F2F6B] focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Update Payment Status</label>
                  <select
                    value={selectedOrder.paymentStatus || "Pending"}
                    onChange={async (e) => {
                      const newPaymentStatus = e.target.value;
                      await handlePaymentStatusChange(selectedOrder.id, newPaymentStatus);
                      setSelectedOrder((prev: any) => ({ ...prev, paymentStatus: newPaymentStatus }));
                    }}
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold uppercase tracking-wider text-[#0F2F6B] focus:outline-none"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>

              {/* Section 1: Order Information */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase text-zinc-400 tracking-wider">Order Information</h4>
                <div className="grid grid-cols-2 gap-y-3 text-xs bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-bold uppercase">Order Placed</span>
                    <span className="font-semibold text-zinc-700">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt.toMillis ? selectedOrder.createdAt.toMillis() : selectedOrder.createdAt).toLocaleString("en-IN") : "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-bold uppercase">Payment Method</span>
                    <span className="font-semibold text-zinc-700">{selectedOrder.paymentMethod || "COD"}</span>
                  </div>
                  {selectedOrder.razorpayPaymentId && (
                    <div className="col-span-2">
                      <span className="text-[10px] text-zinc-400 block font-bold uppercase">Transaction ID</span>
                      <span className="font-mono text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded text-[10px] inline-block mt-0.5">{selectedOrder.razorpayPaymentId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Customer Information */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase text-zinc-400 tracking-wider">Customer Information</h4>
                <div className="grid grid-cols-2 gap-y-3 text-xs bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-bold uppercase">Customer Name</span>
                    <span className="font-semibold text-zinc-700">{selectedOrder.customerName || selectedOrder.shippingAddress?.fullName || "Guest"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-bold uppercase">Customer Email</span>
                    <span className="font-semibold text-zinc-700 truncate block max-w-[200px]">{selectedOrder.userEmail || selectedOrder.customerEmail || "Guest"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-zinc-400 block font-bold uppercase">Phone Contact</span>
                    <span className="font-semibold text-zinc-700">{selectedOrder.customerPhone || selectedOrder.shippingAddress?.phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Shipping Address */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase text-zinc-400 tracking-wider">Shipping Destination</h4>
                <div className="text-xs bg-zinc-50 p-4 rounded-xl border border-zinc-100 space-y-1">
                  <p className="font-bold text-[#0F2F6B]">{selectedOrder.shippingAddress?.fullName || selectedOrder.customerName || "Recipient"}</p>
                  <p className="text-zinc-600 font-medium normal-case">{selectedOrder.shippingAddress?.street || ""}</p>
                  <p className="text-zinc-600 font-medium normal-case">
                    {selectedOrder.shippingAddress?.city || ""}, {selectedOrder.shippingAddress?.state || ""} - {selectedOrder.shippingAddress?.zipCode || ""}
                  </p>
                  {selectedOrder.shippingAddress?.phone && <p className="text-zinc-400 font-bold mt-2">Phone: +91 {selectedOrder.shippingAddress.phone}</p>}
                </div>
              </div>

              {/* Section 4: Products Ordered */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase text-zinc-400 tracking-wider">Products Ordered</h4>
                <div className="border border-zinc-100 rounded-2xl overflow-hidden divide-y divide-zinc-100">
                  {(selectedOrder.products || selectedOrder.items || []).map((item: any, index: number) => (
                    <div key={index} className="p-4 flex items-center gap-4 text-xs bg-white hover:bg-zinc-50 transition-colors">
                      <img
                        src={item.productImage || item.image || "/placeholder.png"}
                        alt={item.productName || item.name || "Product"}
                        className="w-12 h-12 object-cover rounded-lg border border-zinc-100 bg-accent"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-primary truncate">{item.productName || item.name || "Premium Ornament"}</p>
                        {item.material && <p className="text-[9px] text-zinc-400 font-bold uppercase mt-0.5">{item.material}</p>}
                        <p className="text-zinc-500 font-semibold mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculations Summary */}
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-xs space-y-2.5">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{(selectedOrder.subtotal || 0).toLocaleString()}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-₹{(selectedOrder.discount || 0).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-500">
                  <span>Shipping Fee</span>
                  <span className="font-semibold">{(selectedOrder.shippingFee || selectedOrder.shipping || 0) > 0 ? `₹${(selectedOrder.shippingFee || selectedOrder.shipping).toLocaleString()}` : "FREE"}</span>
                </div>
                {selectedOrder.codCharge > 0 && (
                  <div className="flex justify-between text-zinc-500">
                    <span>COD Charge</span>
                    <span className="font-semibold">₹{selectedOrder.codCharge.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-bold text-[#0F2F6B] pt-2 border-t border-zinc-200">
                  <span>Total Amount</span>
                  <span className="font-serif text-base text-[#D4AF37]">₹{(selectedOrder.totalAmount || selectedOrder.total || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Section 5: Timeline */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase text-zinc-400 tracking-wider">Order Timeline</h4>
                <div className="relative pl-6 border-l border-zinc-200 space-y-4 text-xs py-1">
                  <div className="relative">
                    <span className="absolute -left-[30px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm flex items-center justify-center text-[8px] text-white">✓</span>
                    <p className="font-bold text-zinc-700">Order Placed & Verified</p>
                    <p className="text-[10px] text-zinc-400">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt.toMillis ? selectedOrder.createdAt.toMillis() : selectedOrder.createdAt).toLocaleString("en-IN") : "N/A"}</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[30px] top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm flex items-center justify-center text-[8px] text-white">⚡</span>
                    <p className="font-bold text-zinc-700">Current Status: {selectedOrder.orderStatus || selectedOrder.status || "Pending"}</p>
                    <p className="text-[10px] text-zinc-400">Manage status via status controls above.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex gap-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-3 bg-white border border-zinc-200 text-zinc-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-100 transition-colors shadow-sm animate-fadeIn"
              >
                Close Details
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
