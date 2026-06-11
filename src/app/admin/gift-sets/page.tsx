"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Edit, Trash2, Search, Gift } from "lucide-react";

export default function GiftSetsPage() {
  const [giftSets, setGiftSets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Mock form state
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const giftSetsRef = collection(db, "giftSets");
    const unsubscribe = onSnapshot(giftSetsRef, (snapshot) => {
      const sets: any[] = [];
      snapshot.forEach(doc => {
        sets.push({ id: doc.id, ...doc.data() });
      });
      setGiftSets(sets);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this Gift Set?")) {
      try {
        await deleteDoc(doc(db, "giftSets", id));
      } catch (error) {
        console.error("Error deleting gift set:", error);
      }
    }
  };

  const filteredSets = giftSets.filter(g => 
    g.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2F6B]">Gift Sets</h1>
          <p className="text-zinc-500 mt-1">Manage curated jewelry gift collections.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-[#0F2F6B] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-900 transition-colors shadow-sm"
        >
          <Plus size={20} className="text-[#D4AF37]" />
          Create Gift Set
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search gift sets..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]"
            />
          </div>
        </div>

        {/* Gift Sets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-zinc-500 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Gift Set Info</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Included Items</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">Loading gift sets...</td>
                </tr>
              ) : filteredSets.length > 0 ? filteredSets.map((set) => (
                <tr key={set.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-4">
                    {set.images && set.images[0] ? (
                      <img 
                        src={set.images[0]} 
                        alt={set.name} 
                        className="w-12 h-12 rounded-lg object-cover border border-zinc-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-pink-50 flex items-center justify-center text-pink-500 border border-pink-100">
                        <Gift size={24} />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-[#0F2F6B]">{set.name}</p>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">ID: {set.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#0F2F6B]">₹{set.discountPrice?.toLocaleString() || set.price?.toLocaleString()}</span>
                    {set.discountPrice && set.price && (
                      <span className="text-xs text-zinc-400 line-through ml-2">₹{set.price?.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-zinc-600 font-medium">
                    {set.includedProducts?.length || 0} Products
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${set.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {set.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-zinc-400 hover:text-[#0F2F6B] hover:bg-zinc-100 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(set.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No gift sets found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-[#0F2F6B]">Create Gift Set</h2>
              <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-[#0F2F6B]">✕</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 text-center py-12">
              <p className="text-zinc-500">Gift Set form implementation goes here.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
