"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Tag,
  Percent,
  Search,
  Filter,
  Download,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Ticket,
  Calendar,
  Hash,
  Activity,
  Layers,
  ChevronDown
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  expiryDate: any; // Timestamp
  createdAt?: any;
  createdBy?: string;
}

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

export default function CouponsPage() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form states for creation
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"percentage" | "fixed">("percentage");
  const [newValue, setNewValue] = useState("");
  const [newMinPurchase, setNewMinPurchase] = useState("");
  const [newMaxDiscount, setNewMaxDiscount] = useState("");
  const [newUsageLimit, setNewUsageLimit] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show/hide creation form on mobile/tablet (toggled via button / empty state)
  const [showCreateForm, setShowCreateForm] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, expired, disabled

  // Edit modal state
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editMinPurchase, setEditMinPurchase] = useState("");
  const [editMaxDiscount, setEditMaxDiscount] = useState("");
  const [editUsageLimit, setEditUsageLimit] = useState("");
  const [editExpiry, setEditExpiry] = useState("");
  const [editActive, setEditActive] = useState(true);

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  // Firestore real-time listener
  useEffect(() => {
    const q = query(collection(db, "coupons"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Coupon[] = [];
        snapshot.forEach((docSnap) => {
          data.push({ id: docSnap.id, ...docSnap.data() } as Coupon);
        });
        setCoupons(data);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error loading coupons:", error);
        setToast({ type: "error", message: "Failed to sync coupons with database." });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Dynamic Statistics
  const stats = useMemo(() => {
    const total = coupons.length;
    let active = 0;
    let expired = 0;
    let usage = 0;
    const now = new Date();

    coupons.forEach((c) => {
      const isExpired = c.expiryDate
        ? (typeof c.expiryDate.toDate === "function" ? c.expiryDate.toDate() : new Date(c.expiryDate)) < now
        : false;

      if (c.active !== false && !isExpired) active++;
      if (isExpired) expired++;
      usage += c.usedCount || 0;
    });

    return { total, active, expired, usage };
  }, [coupons]);

  // Formatted data list based on Search and Filters
  const filteredCoupons = useMemo(() => {
    const now = new Date();
    return coupons.filter((c) => {
      const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase());

      const isExpired = c.expiryDate
        ? (typeof c.expiryDate.toDate === "function" ? c.expiryDate.toDate() : new Date(c.expiryDate)) < now
        : false;

      let status = "active";
      if (c.active === false) status = "disabled";
      else if (isExpired) status = "expired";

      const matchesFilter = filterStatus === "all" || status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [coupons, searchQuery, filterStatus]);

  // Helper to format timestamps back to HTML date strings
  const formatTimestampToDateString = (timestamp: any) => {
    if (!timestamp) return "";
    const date = typeof timestamp.toDate === "function" ? timestamp.toDate() : new Date(timestamp);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const showToastMessage = (type: "success" | "error", message: string) => {
    setToast({ type, message });
  };

  // Create Coupon
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedCode = newCode.trim().toUpperCase();
    const val = Number(newValue);
    const minP = newMinPurchase ? Number(newMinPurchase) : 0;
    const maxD = newMaxDiscount ? Number(newMaxDiscount) : 0;
    const limit = newUsageLimit ? Number(newUsageLimit) : 100;

    // Validation checks
    if (!formattedCode) {
      showToastMessage("error", "Coupon code is required.");
      return;
    }
    if (val <= 0) {
      showToastMessage("error", "Discount value must be greater than 0.");
      return;
    }
    if (!newExpiry) {
      showToastMessage("error", "Expiry date is required.");
      return;
    }
    if (minP < 0) {
      showToastMessage("error", "Minimum purchase amount must be greater than or equal to 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Uniqueness check
      const docRef = doc(db, "coupons", formattedCode);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        showToastMessage("error", `Coupon code "${formattedCode}" already exists.`);
        setIsSubmitting(false);
        return;
      }

      // Convert date to Firestore Timestamp set to end of day
      const dateObj = new Date(newExpiry);
      dateObj.setHours(23, 59, 59, 999);
      const expiryTimestamp = Timestamp.fromDate(dateObj);

      await setDoc(docRef, {
        code: formattedCode,
        type: newType,
        value: val,
        minPurchase: minP,
        maxDiscount: maxD,
        usageLimit: limit,
        usedCount: 0,
        active: true,
        expiryDate: expiryTimestamp,
        createdAt: serverTimestamp(),
        createdBy: user?.uid || "admin"
      });

      showToastMessage("success", `Coupon "${formattedCode}" created successfully!`);
      // Reset fields
      setNewCode("");
      setNewValue("");
      setNewMinPurchase("");
      setNewMaxDiscount("");
      setNewUsageLimit("");
      setNewExpiry("");
    } catch (err) {
      console.error("Error creating coupon:", err);
      showToastMessage("error", "Failed to create coupon. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (coupon: Coupon) => {
    setEditCoupon(coupon);
    setEditValue(String(coupon.value));
    setEditMinPurchase(String(coupon.minPurchase || 0));
    setEditMaxDiscount(String(coupon.maxDiscount || ""));
    setEditUsageLimit(String(coupon.usageLimit || 100));
    setEditExpiry(formatTimestampToDateString(coupon.expiryDate));
    setEditActive(coupon.active !== false);
  };

  // Edit Coupon Form Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCoupon) return;

    const val = Number(editValue);
    const minP = Number(editMinPurchase);
    const maxD = editMaxDiscount ? Number(editMaxDiscount) : 0;
    const limit = Number(editUsageLimit);

    if (val <= 0) {
      showToastMessage("error", "Discount value must be greater than 0.");
      return;
    }
    if (minP < 0) {
      showToastMessage("error", "Minimum purchase must be >= 0.");
      return;
    }
    if (!editExpiry) {
      showToastMessage("error", "Expiry date is required.");
      return;
    }

    try {
      const docRef = doc(db, "coupons", editCoupon.code);

      const dateObj = new Date(editExpiry);
      dateObj.setHours(23, 59, 59, 999);
      const expiryTimestamp = Timestamp.fromDate(dateObj);

      await updateDoc(docRef, {
        value: val,
        minPurchase: minP,
        maxDiscount: maxD,
        usageLimit: limit,
        expiryDate: expiryTimestamp,
        active: editActive
      });

      showToastMessage("success", `Coupon "${editCoupon.code}" updated successfully!`);
      setEditCoupon(null);
    } catch (err) {
      console.error("Error editing coupon:", err);
      showToastMessage("error", "Failed to update coupon.");
    }
  };

  // Confirm Delete
  const confirmDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "coupons", id));
      showToastMessage("success", `Coupon "${id}" deleted successfully!`);
    } catch (err) {
      console.error("Error deleting coupon:", err);
      showToastMessage("error", "Failed to delete coupon.");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // CSV Export
  const exportToCSV = () => {
    if (coupons.length === 0) return;
    const headers = ["Coupon Code", "Type", "Value", "Min Purchase", "Max Discount", "Usage Limit", "Used Count", "Expiry Date", "Status"];
    const rows = coupons.map((c) => {
      const isExpired = c.expiryDate
        ? (typeof c.expiryDate.toDate === "function" ? c.expiryDate.toDate() : new Date(c.expiryDate)) < new Date()
        : false;
      let status = "Active";
      if (c.active === false) status = "Disabled";
      else if (isExpired) status = "Expired";

      const expiryStr = c.expiryDate
        ? (typeof c.expiryDate.toDate === "function"
          ? c.expiryDate.toDate().toLocaleDateString("en-IN")
          : new Date(c.expiryDate).toLocaleDateString("en-IN"))
        : "No Expiry";

      return [
        c.code,
        c.type,
        c.value,
        c.minPurchase || 0,
        c.maxDiscount || 0,
        c.usageLimit || 0,
        c.usedCount || 0,
        `"${expiryStr}"`,
        status
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `coupons_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (coupon: Coupon) => {
    const isExpired = coupon.expiryDate
      ? (typeof coupon.expiryDate.toDate === "function" ? coupon.expiryDate.toDate() : new Date(coupon.expiryDate)) < new Date()
      : false;

    if (coupon.active === false) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          Disabled
        </span>
      );
    }
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Active
      </span>
    );
  };

  const scrollOrCreate = () => {
    setShowCreateForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 pb-5">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0F2F6B]">Coupon Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Configure promotional offers and track real-time coupon stats.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            disabled={coupons.length === 0}
            className="px-4 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2.5 bg-[#0F2F6B] hover:bg-blue-900 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <Plus size={16} className="text-[#D4AF37]" />
            {showCreateForm ? "Hide Form" : "Create Coupon"}
          </button>
        </div>
      </div>

      {/* Analytics stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl p-5 border border-zinc-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Ticket size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Total Coupons</span>
            <h3 className="text-2xl font-serif font-bold text-[#0F2F6B] mt-0.5">{isLoading ? "..." : stats.total}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-zinc-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Activity size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Active</span>
            <h3 className="text-2xl font-serif font-bold text-[#0F2F6B] mt-0.5">{isLoading ? "..." : stats.active}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-zinc-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Calendar size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Expired</span>
            <h3 className="text-2xl font-serif font-bold text-[#0F2F6B] mt-0.5">{isLoading ? "..." : stats.expired}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-zinc-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Total Usage</span>
            <h3 className="text-2xl font-serif font-bold text-[#0F2F6B] mt-0.5">{isLoading ? "..." : stats.usage}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Create Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              ref={formRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:col-span-4 bg-white rounded-3xl shadow-sm border border-zinc-100 p-6 overflow-hidden"
            >
              <h2 className="text-xl font-serif font-bold text-[#0F2F6B] mb-5 pb-3 border-b border-zinc-50 flex items-center gap-2">
                <Plus size={18} className="text-[#D4AF37]" /> Create Coupon
              </h2>
              <form onSubmit={handleAddCoupon} className="space-y-4 font-sans">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WELCOME20"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] uppercase font-bold text-zinc-800 placeholder-zinc-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Discount Type</label>
                    <div className="relative">
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value as any)}
                        className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] appearance-none font-semibold text-zinc-800"
                      >
                        <option value="percentage">Percentage %</option>
                        <option value="fixed">Fixed ₹</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                      {newType === "percentage" ? "Percentage %" : "Flat Value ₹"}
                    </label>
                    <input
                      type="number"
                      required
                      placeholder={newType === "percentage" ? "e.g. 10" : "e.g. 500"}
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] font-semibold text-zinc-800 placeholder-zinc-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Min Purchase (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 499"
                      value={newMinPurchase}
                      onChange={(e) => setNewMinPurchase(e.target.value)}
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] font-semibold text-zinc-800 placeholder-zinc-300"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Max Discount (₹)</label>
                    <input
                      type="number"
                      disabled={newType !== "percentage"}
                      placeholder={newType === "percentage" ? "e.g. 1000" : "N/A"}
                      value={newMaxDiscount}
                      onChange={(e) => setNewMaxDiscount(e.target.value)}
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] font-semibold text-zinc-800 placeholder-zinc-300 disabled:bg-zinc-50 disabled:text-zinc-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Usage Limit</label>
                    <input
                      type="number"
                      placeholder="e.g. 100"
                      value={newUsageLimit}
                      onChange={(e) => setNewUsageLimit(e.target.value)}
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] font-semibold text-zinc-800 placeholder-zinc-300"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Expiry Date</label>
                    <input
                      type="date"
                      required
                      value={newExpiry}
                      onChange={(e) => setNewExpiry(e.target.value)}
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] font-semibold text-zinc-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#0F2F6B] hover:bg-blue-900 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-blue-900/15 transition-all disabled:opacity-50 disabled:translate-y-0 cursor-pointer"
                >
                  <Plus size={18} className="text-[#D4AF37]" />
                  {isSubmitting ? "Creating..." : "Create Coupon"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Side: Active Coupons List */}
        <div className={`${showCreateForm ? "lg:col-span-8" : "lg:col-span-12"} transition-all`}>
          <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
            {/* Toolbar: Search, Filters */}
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/40 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input
                  type="text"
                  placeholder="Search coupons by code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-zinc-200 bg-white rounded-xl text-sm outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] font-medium"
                />
              </div>

              <div className="flex gap-2 items-center">
                <div className="flex items-center gap-1.5 text-zinc-500 font-bold text-xs uppercase shrink-0">
                  <Filter size={14} />
                  <span>Status Filter:</span>
                </div>
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-3 pr-8 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0F2F6B] appearance-none"
                  >
                    <option value="all">All Coupons</option>
                    <option value="active">Active Only</option>
                    <option value="expired">Expired Only</option>
                    <option value="disabled">Disabled Only</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Coupons Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-sans">
                <thead className="bg-zinc-50/20 text-zinc-500 border-b border-zinc-100 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Discount</th>
                    <th className="px-6 py-4">Rules (Min / Max)</th>
                    <th className="px-6 py-4">Usage (Used / Limit)</th>
                    <th className="px-6 py-4">Expiry</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">Syncing with Firestore...</span>
                      </td>
                    </tr>
                  ) : filteredCoupons.length > 0 ? (
                    filteredCoupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-zinc-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <Tag size={16} />
                            </div>
                            <span className="font-bold text-[#0F2F6B] tracking-wide text-sm">{coupon.code}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-zinc-800 flex items-center gap-1">
                            {coupon.type === "percentage" ? (
                              <>
                                <Percent size={14} className="text-[#D4AF37]" />
                                {coupon.value}%
                              </>
                            ) : (
                              `₹${coupon.value}`
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <div className="space-y-0.5">
                            <div>Min Purchase: <span className="font-semibold text-zinc-800">₹{coupon.minPurchase || 0}</span></div>
                            {coupon.type === "percentage" && (
                              <div>Max Disc: <span className="font-semibold text-zinc-800">{coupon.maxDiscount ? `₹${coupon.maxDiscount}` : "Unlimited"}</span></div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-zinc-600">
                          <div className="flex items-center gap-1.5">
                            <span className="text-zinc-800">{coupon.usedCount || 0}</span>
                            <span className="text-zinc-300">/</span>
                            <span>{coupon.usageLimit || 100}</span>
                          </div>
                          {/* usage bar */}
                          <div className="w-16 bg-zinc-100 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className="bg-[#0F2F6B] h-full rounded-full"
                              style={{ width: `${Math.min(((coupon.usedCount || 0) / (coupon.usageLimit || 100)) * 100, 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-zinc-500">
                          {coupon.expiryDate ? (
                            <span>
                              {typeof coupon.expiryDate.toDate === "function"
                                ? coupon.expiryDate.toDate().toLocaleDateString("en-IN")
                                : new Date(coupon.expiryDate).toLocaleDateString("en-IN")}
                            </span>
                          ) : (
                            "No Expiry"
                          )}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(coupon)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(coupon)}
                              className="p-2 text-zinc-400 hover:text-[#0F2F6B] hover:bg-zinc-100 rounded-lg transition-all cursor-pointer"
                              title="Edit Coupon"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(coupon.code)}
                              className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                              title="Delete Coupon"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 font-medium">
                        {searchQuery || filterStatus !== "all" ? (
                          <div className="space-y-2">
                            <AlertCircle size={36} className="text-zinc-300 mx-auto" />
                            <p>No coupons found matching your search / filter criteria.</p>
                            <button
                              onClick={() => {
                                setSearchQuery("");
                                setFilterStatus("all");
                              }}
                              className="text-xs text-primary font-bold underline uppercase"
                            >
                              Clear filters
                            </button>
                          </div>
                        ) : (
                          // Complete Empty State
                          <div className="py-10 max-w-sm mx-auto text-center space-y-4">
                            <Ticket size={48} className="text-zinc-200 mx-auto animate-bounce-subtle" />
                            <div>
                              <h3 className="font-serif text-lg font-bold text-[#0F2F6B]">No coupons created yet</h3>
                              <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                                Get started by creating your first promotional offer using the creation panel.
                              </p>
                            </div>
                            <button
                              onClick={scrollOrCreate}
                              className="px-5 py-2.5 bg-[#0F2F6B] hover:bg-blue-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Create First Coupon
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editCoupon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-zinc-100 font-sans"
            >
              <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                <h3 className="text-xl font-bold text-[#0F2F6B]">Edit Coupon - {editCoupon.code}</h3>
                <button onClick={() => setEditCoupon(null)} className="p-1.5 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer">
                  <X size={20} className="text-zinc-400" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4 mt-5">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                    Discount Value ({editCoupon.type === "percentage" ? "%" : "₹"})
                  </label>
                  <input
                    type="number"
                    required
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] font-semibold text-zinc-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Min Purchase (₹)</label>
                    <input
                      type="number"
                      required
                      value={editMinPurchase}
                      onChange={(e) => setEditMinPurchase(e.target.value)}
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] font-semibold text-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Max Discount (₹)</label>
                    <input
                      type="number"
                      disabled={editCoupon.type !== "percentage"}
                      value={editMaxDiscount}
                      onChange={(e) => setEditMaxDiscount(e.target.value)}
                      placeholder={editCoupon.type === "percentage" ? "Unlimited" : "N/A"}
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] font-semibold text-zinc-800 disabled:bg-zinc-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Usage Limit</label>
                    <input
                      type="number"
                      required
                      value={editUsageLimit}
                      onChange={(e) => setEditUsageLimit(e.target.value)}
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] font-semibold text-zinc-800"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Expiry Date</label>
                    <input
                      type="date"
                      required
                      value={editExpiry}
                      onChange={(e) => setEditExpiry(e.target.value)}
                      className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] font-semibold text-zinc-800"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-b border-zinc-50">
                  <div>
                    <span className="font-bold text-sm text-zinc-800">Coupon Active Status</span>
                    <p className="text-[10px] text-zinc-400">Instantly enable/disable coupon usage</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditActive(!editActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${editActive ? "bg-[#0F2F6B]" : "bg-zinc-300"
                      }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${editActive ? "translate-x-5" : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditCoupon(null)}
                    className="flex-1 border border-zinc-200 text-zinc-600 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#0F2F6B] hover:bg-blue-900 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/10 transition-all cursor-pointer"
                  >
                    Update Coupon
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-zinc-100 font-sans"
            >
              <h3 className="text-lg font-bold text-[#0F2F6B]">Delete Coupon</h3>
              <p className="text-zinc-500 text-sm mt-2">
                Are you sure you want to delete this coupon? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2.5 border border-zinc-200 rounded-xl text-zinc-500 hover:bg-zinc-50 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDelete(deleteConfirmId)}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating notifications */}
      <AnimatePresence>
        {toast && (
          <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
