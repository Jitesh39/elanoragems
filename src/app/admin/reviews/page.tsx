"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, doc, deleteDoc, query, where, getDocs, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Trash2, Search, Star, ExternalLink, MessageSquare, Calendar, User } from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const reviewsRef = collection(db, "reviews");
    const unsubscribe = onSnapshot(reviewsRef, (snapshot) => {
      const revs: any[] = [];
      snapshot.forEach((doc) => {
        revs.push({ id: doc.id, ...doc.data() });
      });
      // Sort newest first
      revs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setReviews(revs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (review: any) => {
    if (!confirm(`Are you sure you want to delete this review by "${review.customerName}"?`)) return;

    try {
      // 1. Delete review from Firestore
      await deleteDoc(doc(db, "reviews", review.id));

      // 2. Fetch remaining reviews for the same product to recalculate stats
      const reviewsRef = collection(db, "reviews");
      const q = query(reviewsRef, where("productId", "==", review.productId));
      const snapshot = await getDocs(q);
      
      const remaining: any[] = [];
      snapshot.forEach((d) => {
        remaining.push(d.data());
      });

      const newCount = remaining.length;
      const newRating = newCount > 0
        ? parseFloat((remaining.reduce((sum, r) => sum + (r.rating || 5), 0) / newCount).toFixed(1))
        : 5.0;

      // 3. Update the product document
      const productRef = doc(db, "products", review.productId);
      await updateDoc(productRef, {
        rating: newRating,
        reviewsCount: newCount
      });

      alert("Review deleted and product rating updated successfully.");
    } catch (error) {
      console.error("Failed to delete review:", error);
      alert("Failed to delete review. Please try again.");
    }
  };

  // Filter reviews based on search query (customer name, comment, product name)
  const filteredReviews = reviews.filter((rev) =>
    (rev.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (rev.comment || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (rev.productName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F2F6B]">Customer Reviews</h1>
        <p className="text-zinc-500 mt-1">Moderate and manage reviews submitted by users across the store.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        {/* Search Toolbar */}
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input
              type="text"
              placeholder="Search by customer, comment, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]"
            />
          </div>
          <div className="text-xs text-zinc-500 font-semibold">
            Showing {filteredReviews.length} of {reviews.length} reviews
          </div>
        </div>

        {/* Reviews Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-zinc-500 border-b border-zinc-100 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Review Message</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-600">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                      Loading Reviews...
                    </div>
                  </td>
                </tr>
              ) : filteredReviews.length > 0 ? (
                filteredReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#0F2F6B]/5 text-[#0F2F6B] flex items-center justify-center font-bold text-xs uppercase">
                          {rev.customerName?.charAt(0) || "U"}
                        </div>
                        <span className="font-bold text-[#0F2F6B]">{rev.customerName || "Anonymous"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={i < (rev.rating || 0) ? "fill-amber-400" : "text-zinc-200"}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-zinc-500">({rev.rating || 0})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs break-words font-medium normal-case text-zinc-700">
                      {rev.comment}
                    </td>
                    <td className="px-6 py-4">
                      {rev.productName ? (
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-zinc-600">{rev.productName}</span>
                          {rev.productId && (
                            <Link
                              href={`/product/${rev.productId}`}
                              target="_blank"
                              className="text-secondary hover:text-[#AA7C11] transition-colors"
                              title="View product page"
                            >
                              <ExternalLink size={14} />
                            </Link>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic">Unknown Product</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-zinc-400">
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(rev)}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        title="Delete review"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 font-semibold italic">
                    {searchTerm ? "No matching reviews found." : "No customer reviews submitted yet."}
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
