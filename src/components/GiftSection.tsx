"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const BUDGETS = [
  {
    title: "Under ₹999",
    link: "/collections?price=999"
  },
  {
    title: "Under ₹1999",
    link: "/collections?price=1999"
  },
  {
    title: "Under ₹2999",
    link: "/collections?price=2999"
  },
  {
    title: "Premium Gifts",
    link: "/collections?price=premium"
  }
];

export const GiftSection: React.FC = () => {
  return (
    <section
      className="relative py-20 bg-cover bg-center bg-no-repeat w-full overflow-hidden"
      style={{ backgroundImage: "url('/thoughtful_gifts_bg.png')" }}
    >
      {/* Light Overlay to enhance readability while preserving background */}
      <div className="absolute inset-0 bg-white/10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#8b2d48] tracking-wide">
            Thoughtful Pieces
          </h2>
          <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#8b2d48]/75 uppercase block mt-2">
            Across Every Budget
          </span>
        </div>

        {/* Gift Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {BUDGETS.map((budget, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              className="group cursor-pointer relative"
            >
              <Link href={budget.link} className="block w-full">
                <div className="relative bg-gradient-to-tr from-[#d48c9e]/85 to-[#f2ccd5]/85 p-8 rounded-2xl border border-white/20 flex flex-col items-center justify-center text-center gap-5 aspect-[4/3] sm:aspect-square hover:shadow-xl hover:scale-[1.02] transition-all duration-300 shadow-md">

                  <h3 className="text-white font-serif text-xl sm:text-2xl font-bold leading-tight">
                    {budget.title}
                  </h3>

                  <span className="px-6 py-2.5 bg-white text-[#0f2f6b] text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm hover:shadow-md transition-all">
                    Shop Now
                  </span>

                  {/* Cute SVG Bow Ribbon on the last card */}
                  {idx === 3 && (
                    <svg viewBox="0 0 100 100" className="absolute -right-3 -bottom-3 w-16 h-16 text-white/40 fill-current opacity-85 pointer-events-none transform rotate-12">
                      {/* Left Loop */}
                      <path d="M 50,45 C 30,25 20,40 35,55 C 45,65 50,45 50,45 Z" />
                      {/* Right Loop */}
                      <path d="M 50,45 C 70,25 80,40 65,55 C 55,65 50,45 50,45 Z" />
                      {/* Left Tail */}
                      <path d="M 45,50 C 40,65 30,85 35,90 C 40,92 48,70 48,55 Z" />
                      {/* Right Tail */}
                      <path d="M 55,50 C 60,65 70,85 65,90 C 60,92 52,70 52,55 Z" />
                      {/* Center Knot */}
                      <circle cx="50" cy="48" r="6" className="text-white/60" />
                    </svg>
                  )}
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
