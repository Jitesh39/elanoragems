"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "./ProductCard";
import { collection, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

const TABS = [
  { id: "women", name: "Women Collection" },
  { id: "men", name: "Men Collection" },
  { id: "kids", name: "Kids Collection" }
];

export const Bestsellers: React.FC = () => {
  const [activeTab, setActiveTab] = useState("women");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAnyBestsellers, setHasAnyBestsellers] = useState(true);

  // Check if there are any bestsellers at all in the database to conditionally render section
  useEffect(() => {
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("isBestseller", "==", true), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHasAnyBestsellers(!snapshot.empty);
    }, (error) => {
      console.error("Error checking bestsellers existence:", error);
    });
    return () => unsubscribe();
  }, []);

  // Fetch bestsellers for active tab
  useEffect(() => {
    setLoading(true);
    const productsRef = collection(db, "products");
    const q = query(
      productsRef,
      where("isBestseller", "==", true),
      where("gender", "==", activeTab),
      orderBy("createdAt", "desc"),
      limit(8)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods: any[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() });
      });
      // Fallback sort
      prods.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setProducts(prods);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bestsellers with orderBy (possible missing index):", error);
      // Fallback query without orderBy to prevent app crash if composite index isn't ready/created yet
      const fallbackQ = query(
        productsRef,
        where("isBestseller", "==", true),
        where("gender", "==", activeTab)
      );
      onSnapshot(fallbackQ, (fallbackSnapshot) => {
        const prods: any[] = [];
        fallbackSnapshot.forEach((doc) => {
          prods.push({ id: doc.id, ...doc.data() });
        });
        prods.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setProducts(prods.slice(0, 8));
        setLoading(false);
      }, (fallbackError) => {
        console.error("Fallback query failed:", fallbackError);
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, [activeTab]);

  const filteredProducts = products;

  if (loading) {
    return (
      <section className="py-16 bg-accent/20 w-full animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-secondary text-xs font-bold tracking-widest uppercase">Our Bestsellers</span>
            <div className="h-8 bg-zinc-200 rounded w-1/3 mx-auto mt-2" />
          </div>
          <div className="flex justify-center mb-12 gap-4 max-w-md mx-auto">
            {TABS.map((tab) => (
              <div key={tab.id} className="h-8 bg-zinc-200 rounded flex-1" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-zinc-200 rounded-2xl aspect-[3/4]" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // If no bestseller products exist in the database, hide the section
  if (!hasAnyBestsellers) {
    return null;
  }

  return (
    <section className="py-16 bg-accent/20 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8">
          <span className="text-secondary text-xs font-bold tracking-widest uppercase">Our Bestsellers</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mt-1">Timeless Favourites</h2>
        </div>

        {/* Tab Buttons Row */}
        <div className="flex justify-center border-b border-zinc-200 mb-12 max-w-md mx-auto relative">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 pb-4 text-xs font-bold uppercase tracking-wider text-center transition-colors cursor-pointer ${isActive ? "text-primary" : "text-zinc-400 hover:text-zinc-600"
                  }`}
              >
                {tab.name}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-secondary z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Products Display (with transition on activeTab change) */}
        <div className="min-h-[350px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
            >
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                  No bestseller products in this collection currently
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Explore CTA */}
        <div className="text-center mt-12">
          <Link
            href="/bestsellers"
            className="btn-premium btn-primary text-xs tracking-widest"
          >
            Shop Bestseller Collection
          </Link>
        </div>
      </div>
    </section>
  );
};
export default Bestsellers;
