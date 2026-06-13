"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

export const HeroBanner: React.FC = () => {
  const router = useRouter();
  const [slides, setSlides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "heroSlides"),
      where("isActive", "==", true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));

      // Sort in memory to avoid Firestore composite index requirement
      data.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

      setSlides(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Motion variants for content staggered entry
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 }
    }
  };

  if (isLoading) {
    return <section className="relative w-full h-[65vh] sm:h-[80vh] md:h-[85vh] bg-zinc-100 animate-pulse" />;
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full h-[65vh] sm:h-[80vh] md:h-[85vh] bg-accent/30 overflow-hidden">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true, el: ".custom-swiper-pagination" }}
        loop={slides.length > 1}
        className="w-full h-full"
      >
        {slides.map((banner, index) => (
          <SwiperSlide key={banner.id || index} className="w-full h-full relative">
            {/* Background Image/Video overlay */}
            <div className="absolute inset-0 bg-black/35 z-10" />

            {banner.mediaType === 'video' ? (
              <video
                src={banner.mediaUrl}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover select-none"
              />
            ) : (
              <img
                src={banner.mediaUrl}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover select-none"
              />
            )}

            {/* Slider Content Wrapper */}
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false }}
                  className="max-w-xl text-white space-y-4"
                >
                  <motion.span
                    variants={itemVariants}
                    className="text-secondary text-xs sm:text-sm font-bold uppercase tracking-widest flex items-center gap-2"
                  >

                  </motion.span>

                  <motion.h1
                    variants={itemVariants}
                    className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-wide"
                  >
                    {banner.title}
                  </motion.h1>

                  <motion.p
                    variants={itemVariants}
                    className="text-zinc-200 text-sm sm:text-base md:text-lg max-w-lg leading-relaxed normal-case"
                  >
                    {banner.subtitle}
                  </motion.p>

                  <motion.div variants={itemVariants} className="pt-2">
                    <button
                      onClick={() => router.push(banner.buttonUrl || "/collections")}
                      className="px-8 py-3.5 bg-secondary text-white hover:bg-secondary-hover text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-300 transform hover:scale-[1.03] shadow-lg cursor-pointer"
                    >
                      {banner.buttonText || "Shop Now"}
                    </button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Pagination Bullets container */}
      <div className="custom-swiper-pagination absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-30" />
    </section>
  );
};
export default HeroBanner;
