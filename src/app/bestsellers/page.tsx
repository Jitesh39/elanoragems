"use client";

import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductCard } from "@/components/ProductCard";
import { MOCK_PRODUCTS } from "@/lib/mockData";

export default function BestsellersPage() {
  const products = MOCK_PRODUCTS.filter((p) => p.isBestseller);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
        <div className="border-b border-zinc-200 pb-5 mb-8">
          <span className="text-secondary text-xs font-bold uppercase tracking-widest">Timeless Ornaments</span>
          <h1 className="font-serif text-3xl font-bold text-primary mt-1">Our Bestselling Jewellery</h1>
          <p className="text-zinc-500 text-xs sm:text-sm mt-1">The most loved, highly-coveted designs in our collection currently.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
