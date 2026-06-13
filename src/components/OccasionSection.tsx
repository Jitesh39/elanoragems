"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 6 occasion categories with premium imagery on dark green backdrops
const OCCASIONS = [
  {
    title: "Festive Wear",
    slug: "festive",
    image: "/occasion_festive.png"
  },
  {
    title: "Birthday Gifts",
    slug: "birthday",
    image: "/occasion_birthday.png"
  },
  {
    title: "Wedding Collection",
    slug: "wedding",
    image: "/occasion_wedding.png"
  },
  {
    title: "Casual Wear",
    slug: "everyday", // maps to 'everyday' in mockData.ts to display products
    image: "/occasion_casual.png"
  },
  {
    title: "Party Wear",
    slug: "party",
    image: "/occasion_party.png"
  },
  {
    title: "Gift Collection",
    slug: "gift",
    image: "/occasion_gift.png"
  }
];

export const OccasionSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(4);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Monitor screen size to adjust the number of visible cards in the carousel (desktop vs tablet)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCards(4);
      } else {
        setVisibleCards(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = OCCASIONS.length - visibleCards;
  const safeCurrentIndex = Math.min(currentIndex, maxIndex);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const diff = touchStartX - touchEndX;
    const swipeThreshold = 50;

    if (diff > swipeThreshold) {
      // Swipe left -> Next slide
      setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
    } else if (diff < -swipeThreshold) {
      // Swipe right -> Prev slide
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <section
      className="py-8 sm:py-12 lg:py-14 w-full overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #F4F2EC 0%, #D8F0EC 50%, #38C6C6 100%)"
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 lg:mb-10"
        >
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-zinc-900 tracking-[0.15em] uppercase">
            Shop By Occasion
          </h2>
          <p className="font-serif italic text-zinc-600 text-sm sm:text-base mt-3 tracking-wide">
            Curated styles for every occasion
          </p>
        </motion.div>

        {/* 1. DESKTOP & TABLET LAYOUT (>= 768px) */}
        <div className="hidden md:flex flex-row items-end justify-between gap-6 lg:gap-8 relative min-h-[380px]">

          {/* Left Panel: Models Image (aligned to bottom, overlapping content card) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-[32%] lg:w-[30%] flex justify-start z-10 select-none pointer-events-none"
          >
            <img
              src="/occasion_models.png"
              alt="Models wearing luxury jewellery"
              className="h-[340px] lg:h-[390px] object-contain transform translate-y-4 lg:translate-y-6 -mr-8 lg:-mr-12"
            />
          </motion.div>

          {/* Right Panel: White Content Card containing Slider and button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-[68%] lg:w-[70%] bg-white rounded-[24px] shadow-xl p-6 lg:p-8 relative flex flex-col justify-between"
          >

            {/* Carousel Container */}
            <div className="relative w-full overflow-hidden px-1">

              {/* Carousel Track */}
              <div
                className="flex transition-transform duration-500 ease-out -mx-2 lg:-mx-3"
                style={{
                  transform: `translateX(-${safeCurrentIndex * (100 / visibleCards)}%)`
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {OCCASIONS.map((occ) => (
                  <div
                    key={occ.slug}
                    className="flex-shrink-0 px-2 lg:px-3"
                    style={{ width: `${100 / visibleCards}%` }}
                  >
                    <Link
                      href={`/collections?occasion=${occ.slug}`}
                      className="group block text-center cursor-pointer"
                    >
                      <div className="relative overflow-hidden rounded-[20px] aspect-[1/1] bg-zinc-100 shadow-sm transition-all duration-500 ease-out group-hover:shadow-md group-hover:-translate-y-1">
                        <img
                          src={occ.image}
                          alt={occ.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                      </div>
                      <h3 className="font-serif text-[15px] lg:text-[16px] font-medium text-zinc-800 mt-4 tracking-wide group-hover:text-teal-700 transition-colors">
                        {occ.title}
                      </h3>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Slider Navigation Arrows */}
              {safeCurrentIndex > 0 && (
                <button
                  onClick={handlePrev}
                  aria-label="Previous occasion"
                  className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-zinc-100 text-zinc-700 hover:bg-zinc-50 hover:text-teal-600 transition-all duration-300 cursor-pointer"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              {safeCurrentIndex < maxIndex && (
                <button
                  onClick={handleNext}
                  aria-label="Next occasion"
                  className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-zinc-100 text-zinc-700 hover:bg-zinc-50 hover:text-teal-600 transition-all duration-300 cursor-pointer"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>

            {/* Centered Shop Now Button inside desktop card */}
            <div className="flex justify-center mt-6">
              <Link
                href="/collections"
                className="bg-[#2cb0b0] hover:bg-[#229292] text-white font-medium px-10 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-center cursor-pointer"
              >
                Shop Now
              </Link>
            </div>

          </motion.div>
        </div>

        {/* 2. MOBILE LAYOUT (< 768px) */}
        <div className="block md:hidden">

          {/* Stacked Model Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full flex justify-center mb-4"
          >
            <img
              src="/occasion_models.png"
              alt="Models wearing luxury jewellery"
              className="h-[200px] xs:h-[240px] object-contain select-none pointer-events-none"
            />
          </motion.div>

          {/* Stacked Shop Now Button below models */}
          <div className="flex justify-center mb-6">
            <Link
              href="/collections"
              className="bg-[#2cb0b0] hover:bg-[#229292] text-white font-medium px-10 py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-center w-full sm:w-auto cursor-pointer"
            >
              Shop Now
            </Link>
          </div>

          {/* Occasion Cards: Responsive 2-column Grid displaying all 6 categories */}
          <div className="grid grid-cols-2 gap-4 xs:gap-6 px-1">
            {OCCASIONS.map((occ, idx) => (
              <motion.div
                key={occ.slug}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
              >
                <Link
                  href={`/collections?occasion=${occ.slug}`}
                  className="group block text-center cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-[20px] aspect-[1/1] bg-zinc-100 shadow-sm transition-all duration-500 ease-out group-hover:shadow-md group-hover:-translate-y-1">
                    <img
                      src={occ.image}
                      alt={occ.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  </div>
                  <h3 className="font-serif text-[15px] font-medium text-zinc-800 mt-3 tracking-wide group-hover:text-teal-700 transition-colors">
                    {occ.title}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default OccasionSection;
