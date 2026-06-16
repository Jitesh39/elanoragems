"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Mail, Search, Trash2, Users, Calendar, Loader2 } from "lucide-react";

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Subscribers from Firestore in real-time
  useEffect(() => {
    const subscribersRef = collection(db, "subscribers");
    const unsubscribe = onSnapshot(
      subscribersRef,
      (snapshot) => {
        const subs: any[] = [];
        snapshot.forEach((doc) => {
          subs.push({ id: doc.id, ...doc.data() });
        });
        // Sort by joined date (newest first)
        subs.sort((a, b) => {
          const timeA = a.subscribedAt?.seconds 
            ? a.subscribedAt.seconds * 1000 
            : new Date(a.subscribedAt || 0).getTime();
          const timeB = b.subscribedAt?.seconds 
            ? b.subscribedAt.seconds * 1000 
            : new Date(b.subscribedAt || 0).getTime();
          return timeB - timeA;
        });
        setSubscribers(subs);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching subscribers:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Delete subscriber from database
  const handleDeleteSubscriber = async (sub: any) => {
    if (confirm(`Are you sure you want to remove "${sub.email}" from the subscription list?`)) {
      try {
        await deleteDoc(doc(db, "subscribers", sub.id));
      } catch (error) {
        console.error("Error deleting subscriber:", error);
        alert("Failed to delete subscriber. Please try again.");
      }
    }
  };

  // Filter subscribers based on search term
  const filteredSubscribers = subscribers.filter((sub) =>
    sub.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper to safely format subscriber dates
  const formatDate = (subscribedAt: any) => {
    if (!subscribedAt) return "Pending...";
    try {
      if (typeof subscribedAt.toDate === "function") {
        return subscribedAt.toDate().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      const dateMs = subscribedAt.seconds ? subscribedAt.seconds * 1000 : subscribedAt;
      return new Date(dateMs).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F2F6B]">Newsletter Subscribers</h1>
        <p className="text-zinc-500 mt-1">
          Monitor your subscriber base, search emails, and manage list membership.
        </p>
      </div>

      {/* Analytics Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-[#0F2F6B]/10 flex items-center justify-center text-[#0F2F6B]">
            <Users className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Subscribers</p>
            <h3 className="text-2xl font-black text-[#0F2F6B] mt-0.5">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400 mt-1" />
              ) : (
                subscribers.length
              )}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search subscriber email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-zinc-500 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Date Joined</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#0F2F6B]" />
                      <span>Loading subscribers...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSubscribers.length > 0 ? (
                filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#0F2F6B]">{sub.email}</td>
                    <td className="px-6 py-4 text-zinc-500 font-medium">{formatDate(sub.subscribedAt)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                          sub.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {sub.status || "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteSubscriber(sub)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                        title="Delete subscriber"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                    No subscribers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
