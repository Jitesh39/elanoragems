"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gift, ArrowRight } from "lucide-react";

const BUDGETS = [
  {
    title: "Under ₹999",
    subtitle: "Sweet and thoughtful tokens of affection",
    link: "/collections?price=999",
    bgColor: "bg-[#F0F6F6] text-[#2D5A5A] border-[#E2EDED]" // Pastel Teal
  },
  {
    title: "Under ₹1999",
    subtitle: "Perfect surprises for birthdays and milestones",
    link: "/collections?price=1999",
    bgColor: "bg-[#FBF0F3] text-[#702F43] border-[#F6E2E8]" // Pastel Rose
  },
  {
    title: "Under ₹2999",
    subtitle: "Indulgent items that express deep gratitude",
    link: "/collections?price=2999",
    bgColor: "bg-[#F3F0FA] text-[#482F70] border-[#E8E2F6]" // Pastel Lavender
  },
  {
    title: "Premium Gifts",
    subtitle: "Luxurious masterworks that define lifetimes",
    link: "/collections?price=premium",
    bgColor: "bg-[#FAF4EC] text-[#6E4E23] border-[#F4EADA]" // Pastel Amber/Gold
  }
];

export const GiftSection: React.FC = () => {
  return (
    <section className="py-16 bg-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-secondary text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-1.5">
            <Gift size={14} /> Thoughtful Gifts
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mt-1">Gifts Within Your Budget</h2>
          <p className="text-zinc-500 text-xs sm:text-sm max-w-md mx-auto mt-2 normal-case">Find an unforgettable gesture matching your budget, packaged in our signature velvet boxes.</p>
        </div>

        {/* Gift Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BUDGETS.map((budget, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              className="group"
            >
              <Link href={budget.link}>
                <div className={`h-full p-8 rounded-2xl border ${budget.bgColor} flex flex-col justify-between aspect-[4/3] sm:aspect-square hover:shadow-lg transition-shadow duration-300 relative overflow-hidden cursor-pointer`}>
                  
                  {/* Subtle Background decoration icon */}
                  <Gift 
                    size={150} 
                    className="absolute -right-8 -bottom-8 opacity-[0.03] transform group-hover:scale-110 transition-transform duration-500" 
                  />

                  <div className="space-y-2 relative z-10">
                    <h3 className="font-serif text-2xl font-bold tracking-wide">
                      {budget.title}
                    </h3>
                    <p className="text-xs opacity-80 leading-relaxed font-medium normal-case">
                      {budget.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mt-8 relative z-10">
                    <span>Explore Gifts</span>
                    <div className="w-8 h-8 rounded-full bg-white/70 group-hover:bg-white flex items-center justify-center text-dark transition-colors shadow-sm">
                      <ArrowRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default GiftSection;
