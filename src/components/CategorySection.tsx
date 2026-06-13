"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const CategorySection: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const categoriesRef = collection(db, "categories");
    const unsubscribe = onSnapshot(categoriesRef, (snapshot) => {
      const cats: any[] = [];
      snapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() });
      });
      // Sort by displayOrder
      cats.sort((a, b) => {
        const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 9999;
        const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 9999;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || "").localeCompare(b.name || "");
      });
      // Filter active categories
      const activeCats = cats.filter(c => c.isActive !== false);
      setCategories(activeCats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <section className="py-12 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-2 no-scrollbar">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="flex-shrink-0 w-32 sm:w-40 animate-pulse">
                <div className="aspect-square w-full rounded-2xl bg-zinc-100 mb-3" />
                <div className="h-4 bg-zinc-100 rounded w-2/3 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null; // Return null if firestore contains no active categories
  }

  return (
    <section className="py-12 bg-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Categories Horizontal Scroll */}
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-2 no-scrollbar scroll-smooth snap-x">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              className="flex-shrink-0 w-32 sm:w-40 snap-start group"
            >
              <Link href={`/collections?category=${cat.slug || cat.id}`}>
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-sm border border-zinc-100 bg-accent/40 mb-3 transition-transform duration-300 group-hover:shadow-md">
                  {/* Category Image */}
                  <img
                    src={cat.imageUrl || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80"}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                  {/* Subtle overlay gradient */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300" />
                </div>
                {/* Category Title */}
                <h3 className="text-center text-xs sm:text-sm font-semibold tracking-wide text-zinc-800 uppercase group-hover:text-secondary transition-colors">
                  {cat.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default CategorySection;
