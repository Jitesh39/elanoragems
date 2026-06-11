"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Edit, Trash2, FolderTree } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Default categories if db is empty or collection doesn't exist
    const defaultCategories = [
      { id: "rings", name: "Rings", itemCount: 42, status: "Active" },
      { id: "earrings", name: "Earrings", itemCount: 38, status: "Active" },
      { id: "necklaces", name: "Necklaces", itemCount: 25, status: "Active" },
      { id: "bracelets", name: "Bracelets", itemCount: 18, status: "Active" },
      { id: "anklets", name: "Anklets", itemCount: 12, status: "Active" },
      { id: "toe-rings", name: "Toe Rings", itemCount: 8, status: "Active" },
      { id: "kada", name: "Kada", itemCount: 15, status: "Active" },
    ];

    const categoriesRef = collection(db, "categories");
    const unsubscribe = onSnapshot(categoriesRef, (snapshot) => {
      if (!snapshot.empty) {
        const cats: any[] = [];
        snapshot.forEach(doc => {
          cats.push({ id: doc.id, ...doc.data() });
        });
        setCategories(cats);
      } else {
        setCategories(defaultCategories);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2F6B]">Categories</h1>
          <p className="text-zinc-500 mt-1">Manage product categories and collections.</p>
        </div>
        <button className="bg-[#0F2F6B] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-900 transition-colors shadow-sm">
          <Plus size={20} className="text-[#D4AF37]" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50/50 text-zinc-500 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Category Name</th>
                <th className="px-6 py-4 font-semibold">Slug</th>
                <th className="px-6 py-4 font-semibold">Total Items</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">Loading categories...</td>
                </tr>
              ) : categories.length > 0 ? categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FolderTree size={20} />
                    </div>
                    <span className="font-bold text-[#0F2F6B]">{cat.name}</span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 font-mono text-xs">{cat.id}</td>
                  <td className="px-6 py-4 font-semibold text-zinc-600">{cat.itemCount || 0} products</td>
                  <td className="px-6 py-4">
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {cat.status || "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-zinc-400 hover:text-[#0F2F6B] hover:bg-zinc-100 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
