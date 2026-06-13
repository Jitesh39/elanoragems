"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductCard } from "@/components/ProductCard";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function BestsellersPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsRef = collection(db, "products");
    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const prods: any[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() });
      });
      setProducts(prods);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const bestsellers = products
    .filter((p) => p.isBestseller === true)
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
        <div className="border-b border-zinc-200 pb-5 mb-8">
          <span className="text-secondary text-xs font-bold uppercase tracking-widest">Timeless Ornaments</span>
          <h1 className="font-serif text-3xl font-bold text-primary mt-1">Our Bestselling Jewellery</h1>
          <p className="text-zinc-500 text-xs sm:text-sm mt-1">The most loved, highly-coveted designs in our collection currently.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 border-2 border-secondary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-serif text-sm font-semibold tracking-widest text-zinc-500 uppercase">Loading Ornaments...</p>
          </div>
        ) : bestsellers.length === 0 ? (
          <div className="text-center py-20 text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            No bestseller products found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
