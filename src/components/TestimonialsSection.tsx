"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Testimonial {
  id: string;
  name: string;
  review: string;
  rating: number;
  photoUrl: string;
  isActive?: boolean;
  displayOrder?: number;
}

export function TestimonialsSection() {
  const [activeTestimonials, setActiveTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const q = query(collection(db, "testimonials"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Testimonial[] = [];
      snapshot.forEach((doc) => {
        const docData = doc.data() as Omit<Testimonial, "id">;
        if (docData.isActive !== false) {
          data.push({ id: doc.id, ...docData } as Testimonial);
        }
      });
      data.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setActiveTestimonials(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Duplicate items if length is 2 or 3 to make circular transitions smooth
  let displayItems = [...activeTestimonials];
  if (displayItems.length === 2) {
    displayItems = [...displayItems, ...displayItems];
  } else if (displayItems.length === 3) {
    displayItems = [...displayItems, ...displayItems];
  }

  const N = displayItems.length;

  // Autoplay every 5 seconds
  useEffect(() => {
    if (isPaused || N <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, N, currentIndex]);

  if (isLoading) {
    return null; // Prevent layout shifts during load
  }

  if (activeTestimonials.length === 0) {
    return null; // Fallback: hide if no testimonials
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % N);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + N) % N);
  };

  // Swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const diff = touchStart - touchEnd;
    const swipeThreshold = 50;

    if (diff > swipeThreshold) {
      handleNext();
    } else if (diff < -swipeThreshold) {
      handlePrev();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Shortest path modulo wrap helper
  const getRelativeIndex = (idx: number, current: number, N: number) => {
    let diff = idx - current;
    while (diff < -N / 2) diff += N;
    while (diff > N / 2) diff -= N;
    return diff;
  };

  return (
    <section
      className="relative py-15 overflow-hidden w-100% select-none"
      style={{
        background: "linear-gradient(180deg, #F4F2EC 0%, #D8F0EC 50%, #38C6C6 100%)"
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-8">
          <h3 className="font-serif text-[32px] sm:text-[40px] font-medium text-[#3A3330] tracking-wide">
            Happy Customers
          </h3>
        </div>

        {/* Carousel Viewport Container */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full h-[360px] sm:h-[400px] flex items-center justify-center"
        >
          {displayItems.map((item, idx) => {
            const relativeIndex = getRelativeIndex(idx, currentIndex, N);
            const isCenter = relativeIndex === 0;
            const isLeft = relativeIndex === -1;
            const isRight = relativeIndex === 1;

            // Compute positions that mimic the exact overlapping and scaling of the mockup
            let positionClass = "opacity-0 scale-75 pointer-events-none z-0";
            if (isCenter) {
              positionClass = "opacity-100 scale-100 md:scale-105 z-20 cursor-default";
            } else if (isLeft) {
              positionClass = "opacity-0 md:opacity-50 scale-[0.88] -translate-x-[105%] lg:-translate-x-[110%] z-10 cursor-pointer pointer-events-none md:pointer-events-auto";
            } else if (isRight) {
              positionClass = "opacity-0 md:opacity-50 scale-[0.88] translate-x-[105%] lg:translate-x-[110%] z-10 cursor-pointer pointer-events-none md:pointer-events-auto";
            }

            return (
              <div
                key={idx}
                onClick={() => {
                  if (isLeft) handlePrev();
                  if (isRight) handleNext();
                }}
                className={`absolute w-[85%] max-w-[300px] sm:max-w-[340px] md:max-w-[360px] transition-all duration-500 ease-out ${positionClass}`}
              >
                {/* Testimonial Card container with soft luxury shadows and rounded-3xl corners */}
                <div className="relative bg-white border border-[#E5E0DB]/40 rounded-[36px] p-6 sm:p-8 flex flex-col items-center text-center h-[310px] sm:h-[340px] justify-between shadow-[0_12px_45px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_55px_rgba(0,0,0,0.05)] transition-all duration-500 overflow-hidden">

                  {/* Soft organic pastel decorative circles in the background corners */}
                  <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-[#FAF2F2] opacity-75 pointer-events-none z-0" />

                  {isCenter && (
                    <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-[#FAF2F2] opacity-75 pointer-events-none z-0" />
                  )}

                  {/* Profile image centered inside the card */}
                  <div className="w-[72px] h-[72px] rounded-full overflow-hidden border border-zinc-200/50 shadow-sm flex-shrink-0 flex items-center justify-center mt-2 z-10 bg-white">
                    {item.photoUrl ? (
                      <Image
                        src={item.photoUrl}
                        alt={item.name}
                        width={72}
                        height={72}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#0F2F6B]/5 flex items-center justify-center text-[#0F2F6B]">
                        <span className="font-serif font-bold text-2xl uppercase select-none">
                          {item.name ? item.name.charAt(0) : "U"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Customer Name */}
                  <h3 className="font-sans font-bold text-[#4E4744] text-[16px] sm:text-[17px] tracking-wide mt-3 z-10">
                    {item.name}
                  </h3>

                  {/* Review Text */}
                  <p className="font-sans italic text-zinc-400 text-xs sm:text-[13px] leading-relaxed px-3 sm:px-4 text-center mt-2 flex-1 flex items-center justify-center line-clamp-4 z-10">
                    "{item.review}"
                  </p>

                  {/* Stars Rating displayed at bottom */}
                  <div className="flex justify-center gap-1.5 pt-3 pb-1 z-10">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3.5 h-3.5 ${i < (item.rating || 5) ? "text-[#ECA100] fill-current" : "text-[#E5E0DB]"
                          }`}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel unified pagination and controls */}
        {activeTestimonials.length > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4">

            {/* Left Button */}
            <button
              onClick={handlePrev}
              aria-label="Previous testimonial"
              className="w-8 h-8 rounded-full border border-zinc-200/80 bg-white flex items-center justify-center text-zinc-400 hover:text-zinc-700 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Pagination dots */}
            <div className="flex items-center gap-2 px-2">
              {activeTestimonials.map((_, idx) => {
                const isActive = (currentIndex % activeTestimonials.length) === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`transition-all duration-300 cursor-pointer ${isActive
                      ? "bg-[#B02C4C] w-5 h-[5px] rounded-full"
                      : "bg-[#E5E0DB] w-1.5 h-1.5 rounded-full hover:bg-zinc-300"
                      }`}
                  />
                );
              })}
            </div>

            {/* Right Button */}
            <button
              onClick={handleNext}
              aria-label="Next testimonial"
              className="w-8 h-8 rounded-full border border-zinc-200/80 bg-white flex items-center justify-center text-zinc-400 hover:text-zinc-700 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>

          </div>
        )}

      </div>
    </section>
  );
}
