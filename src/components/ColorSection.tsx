"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const METALS = [
  {
    name: "Sterling Silver",
    slug: "sterling-silver",
    image: "https://images.unsplash.com/photo-1611085583191-a3b1a30a5a40?w=500&q=80",
    description: "Classic 92.5% pure silver with a brilliant reflective finish"
  },
  {
    name: "Gold Plated",
    slug: "gold-plated",
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=500&q=80",
    description: "18K warm gold layering over premium silver cores"
  },
  {
    name: "Rose Gold",
    slug: "rose-gold",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&q=80",
    description: "Blushing pink gold tones designed for romantic details"
  },
  {
    name: "Oxidised Silver",
    slug: "oxidised-silver",
    image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=500&q=80",
    description: "Antiquated, dark-etched silver with rich ethnic texture"
  }
];

export const ColorSection: React.FC = () => {
  return (
    <section className="py-16 bg-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-secondary text-xs font-bold tracking-widest uppercase">Shop By Metal</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mt-1">Luxury Metal Collections</h2>
          <p className="text-zinc-500 text-xs sm:text-sm max-w-md mx-auto mt-2 normal-case">Explore fine jewelry items categorized by their distinct metallic finishes and glows.</p>
        </div>

        {/* Metals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {METALS.map((metal, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              className="relative aspect-square w-full rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
            >
              <Link href={`/collections?color=${metal.slug}`}>
                {/* Background Image */}
                <img 
                  src={metal.image} 
                  alt={metal.name} 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 group-hover:via-black/45 transition-colors duration-300 z-10" />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white z-20">
                  <h3 className="font-serif text-xl font-bold tracking-wide group-hover:text-secondary transition-colors">
                    {metal.name}
                  </h3>
                  <p className="text-[10px] text-zinc-300 mt-1 line-clamp-2 leading-relaxed normal-case font-medium">
                    {metal.description}
                  </p>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary mt-3 inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    View Collection &rarr;
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default ColorSection;
