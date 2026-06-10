"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const OCCASIONS = [
  { 
    title: "Party Wear", 
    slug: "party", 
    image: "https://images.unsplash.com/photo-1549068106-b024baf5068d?w=600&q=80",
    subtitle: "Turn heads at any night out"
  },
  { 
    title: "Festive Wear", 
    slug: "festive", 
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80",
    subtitle: "Celebrate traditions in style"
  },
  { 
    title: "Everyday Wear", 
    slug: "everyday", 
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80",
    subtitle: "Add elegance to your daily routine"
  },
  { 
    title: "Office Wear", 
    slug: "office", 
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&q=80",
    subtitle: "Subtle statements for work"
  },
  { 
    title: "Wedding Collection", 
    slug: "wedding", 
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80",
    subtitle: "Sacred ornaments for your special day"
  },
  { 
    title: "Gift Collection", 
    slug: "gift", 
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80",
    subtitle: "Timeless tokens of love"
  }
];

export const OccasionSection: React.FC = () => {
  return (
    <section className="py-16 bg-accent/30 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-secondary text-xs font-bold tracking-widest uppercase">Shop By Occasion</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mt-1">Designed For Every Moment</h2>
          <p className="text-zinc-500 text-xs sm:text-sm max-w-md mx-auto mt-2 normal-case">Find the perfect balance of premium craftsmanship tailored for life&apos;s celebrated milestones.</p>
        </div>

        {/* Occasion Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {OCCASIONS.map((occ, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              className="relative rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] bg-white group shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <Link href={`/collections?occasion=${occ.slug}`} className="block h-full w-full relative">
                {/* Image with hover zoom */}
                <img 
                  src={occ.image} 
                  alt={occ.title} 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Dark subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:via-black/40 transition-colors duration-300" />

                {/* Content Panel (Bottom Aligned) */}
                <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end text-white z-20">
                  <span className="text-secondary text-[10px] font-bold uppercase tracking-wider mb-1">
                    {occ.subtitle}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-wide">
                    {occ.title}
                  </h3>
                  
                  {/* Shop Now CTA */}
                  <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span 
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white hover:text-secondary group/btn transition-colors"
                    >
                      Shop Collection 
                      <ArrowUpRight size={14} className="transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </span>
                  </div>
                </div>

                {/* Border glow effect on card hover */}
                <div className="absolute inset-0 border border-transparent group-hover:border-secondary/30 rounded-2xl pointer-events-none transition-colors duration-500 z-30" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default OccasionSection;
