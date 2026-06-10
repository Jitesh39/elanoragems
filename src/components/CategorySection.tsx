"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const CATEGORIES = [
  { name: "Rings", slug: "rings", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80" },
  { name: "Earrings", slug: "earrings", image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=400&q=80" },
  { name: "Necklaces", slug: "necklaces", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80" },
  { name: "Bracelets", slug: "bracelets", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80" },
  { name: "Anklets", slug: "anklets", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80" },
  { name: "Pendants", slug: "pendants", image: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400&q=80" },
  { name: "Toe Rings", slug: "toe-rings", image: "https://images.unsplash.com/photo-1543294001-f7cbfe92237e?w=400&q=80" },
  { name: "Kada", slug: "kada", image: "https://images.unsplash.com/photo-1611085583191-a3b1a30a5a40?w=400&q=80" },
  { name: "Gift Sets", slug: "gift-sets", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80" }
];

export const CategorySection: React.FC = () => {
  return (
    <section className="py-12 bg-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        {/* <div className="text-center md:text-left mb-8 flex flex-col md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-secondary text-xs font-bold tracking-widest uppercase">Shop By Category</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary mt-1">Curated Collections</h2>
          </div>
          <Link 
            href="/collections" 
            className="text-xs font-bold text-zinc-500 hover:text-secondary uppercase tracking-wider mt-2 md:mt-0 underline decoration-secondary decoration-2 underline-offset-4"
          >
            Shop All Collections
          </Link>
        </div> */}

        {/* Categories Horizontal Scroll */}
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-2 no-scrollbar scroll-smooth snap-x">
          {CATEGORIES.map((cat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              className="flex-shrink-0 w-32 sm:w-40 snap-start group"
            >
              <Link href={`/collections?category=${cat.slug}`}>
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-sm border border-zinc-100 bg-accent/40 mb-3 transition-transform duration-300 group-hover:shadow-md">
                  {/* Category Image */}
                  <img
                    src={cat.image}
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
