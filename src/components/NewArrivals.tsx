"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ProductCard } from "./ProductCard";
import { MOCK_PRODUCTS } from "@/lib/mockData";

export const NewArrivals: React.FC = () => {
  // Take first 4 items as "new arrivals" for home display
  const newProducts = MOCK_PRODUCTS.slice(0, 4);

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

  return (
    <section className="py-16 bg-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-secondary text-xs font-bold tracking-widest uppercase">New Arrivals</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mt-1">Fresh Luxury Drops</h2>
          {/* <p className="text-zinc-500 text-xs sm:text-sm max-w-md mx-auto mt-2 normal-case">Be the first to explore our latest designs, hand-crafted with immaculate detail and precious metals.</p> */}
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
