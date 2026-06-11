"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Trash2, Tag, Percent } from "lucide-react";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState("percent");
  const [newValue, setNewValue] = useState("");
  const [newMinPurchase, setNewMinPurchase] = useState("");
  const [newExpiry, setNewExpiry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Demo coupons fallback
    const demoCoupons = [
      { id: "1", code: "WELCOME10", type: "percent", value: 10, minPurchase: 500, expiry: "2026-12-31", status: "Active" },
      { id: "2", code: "FLAT500", type: "flat", value: 500, minPurchase: 2000, expiry: "2026-08-15", status: "Active" },
    ];

    const couponsRef = collection(db, "coupons");
    const unsubscribe = onSnapshot(couponsRef, (snapshot) => {
      if (!snapshot.empty) {
        const data: any[] = [];
        snapshot.forEach(doc => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setCoupons(data);
      } else {
        setCoupons(demoCoupons);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newValue) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "coupons"), {
        code: newCode.toUpperCase(),
        type: newType,
        value: Number(newValue),
        minPurchase: newMinPurchase ? Number(newMinPurchase) : 0,
        expiry: newExpiry || null,
        createdAt: new Date(),
        status: "Active"
      });
      setNewCode("");
      setNewValue("");
      setNewMinPurchase("");
      setNewExpiry("");
    } catch (error) {
      console.error("Error adding coupon:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this coupon?")) {
      try {
        await deleteDoc(doc(db, "coupons", id));
      } catch (error) {
        console.error("Error deleting coupon:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F2F6B]">Discount Coupons</h1>
        <p className="text-zinc-500 mt-1">Create and manage promotional offers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
            <h2 className="text-lg font-bold text-[#0F2F6B] mb-4">Create Coupon</h2>
            <form onSubmit={handleAddCoupon} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER20"
                  value={newCode}
                  onChange={e => setNewCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]"
                  >
                    <option value="percent">Percentage %</option>
                    <option value="flat">Flat Amount ₹</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Value</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 20"
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Min Purchase Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 999"
                  value={newMinPurchase}
                  onChange={e => setNewMinPurchase(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={newExpiry}
                  onChange={e => setNewExpiry(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0F2F6B] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50"
              >
                <Plus size={20} className="text-[#D4AF37]" />
                {isSubmitting ? "Creating..." : "Create Coupon"}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden h-full">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
              <h2 className="text-lg font-bold text-[#0F2F6B]">Active Coupons</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-zinc-500 border-b border-zinc-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Code</th>
                    <th className="px-6 py-4 font-semibold">Discount</th>
                    <th className="px-6 py-4 font-semibold">Min Purchase</th>
                    <th className="px-6 py-4 font-semibold">Expiry</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">Loading coupons...</td>
                    </tr>
                  ) : coupons.length > 0 ? coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Tag size={16} />
                        </div>
                        <span className="font-bold text-[#0F2F6B] tracking-wide">{coupon.code}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-zinc-700">
                        {coupon.type === "percent" ? (
                          <span className="flex items-center gap-1"><Percent size={14} className="text-[#D4AF37]" /> {coupon.value}%</span>
                        ) : (
                          <span>₹{coupon.value}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-zinc-500">
                        {coupon.minPurchase ? `₹${coupon.minPurchase}` : "None"}
                      </td>
                      <td className="px-6 py-4 text-zinc-500">
                        {coupon.expiry ? new Date(coupon.expiry).toLocaleDateString() : "No Expiry"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No active coupons found.</td>
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
