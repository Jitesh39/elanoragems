"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ProductCard } from "./ProductCard";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const NewArrivals: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsRef = collection(db, "products");
    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const prods: any[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() });
      });
      // Sort by createdAt desc
      prods.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setProducts(prods);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white w-full animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-secondary text-xs font-bold tracking-widest uppercase">New Arrivals</span>
            <div className="h-8 bg-zinc-100 rounded w-1/3 mx-auto mt-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-zinc-100 rounded-2xl aspect-[3/4] w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const newProducts = products.slice(0, 4);

  if (newProducts.length === 0) {
    return null; // Return null if no new arrivals exist
  }

  return (
    <section className="py-16 bg-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-secondary text-xs font-bold tracking-widest uppercase">New Arrivals</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mt-1">Fresh Luxury Drops</h2>
        </div>

        {/* Product Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {newProducts.map((product) => (
            <motion.div key={product.id} variants={cardVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* Call to action button */}
        <div className="text-center mt-12">
          <Link
            href="/new-arrivals"
            className="btn-premium btn-outline text-xs tracking-widest"
          >
            View All New Arrivals
          </Link>
        </div>
      </div>
    </section>
  );
};
export default NewArrivals;
