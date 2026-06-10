"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const BANNERS = [
  {
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1600&q=80",
    heading: "Crafted For Your Sacred Moments",
    subheading: "Explore premium sterling silver & gold-plated jewellery collections designed to radiate luxury.",
    cta: "Shop Now",
    link: "/collections"
  },
  {
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1600&q=80",
    heading: "Royal Heritage & Bridal Glow",
    subheading: "Handcrafted masterworks tailored for special celebrations and weddings.",
    cta: "Discover Bridal",
    link: "/collections?occasion=wedding"
  },
  {
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1600&q=80",
    heading: "Elegance in Modern Minimalism",
    subheading: "Chic, everyday wear ornaments styled for your contemporary wardrobe.",
    cta: "Explore Daily Wear",
    link: "/collections?category=necklaces"
  }
];

export const HeroBanner: React.FC = () => {
  const router = useRouter();

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

  return (
    <section className="relative w-full h-[65vh] sm:h-[80vh] md:h-[85vh] bg-accent/30 overflow-hidden">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true, el: ".custom-swiper-pagination" }}
        loop={true}
        className="w-full h-full"
      >
        {BANNERS.map((banner, index) => (
          <SwiperSlide key={index} className="w-full h-full relative">
            {/* Background Image overlay */}
            <div className="absolute inset-0 bg-black/35 z-10" />
            <img 
              src={banner.image} 
              alt={banner.heading} 
              className="absolute inset-0 w-full h-full object-cover select-none"
            />

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
                    <span className="w-8 h-[2px] bg-secondary inline-block"></span>
                    Exquisite Artistry
                  </motion.span>

                  <motion.h1 
                    variants={itemVariants}
                    className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-wide"
                  >
                    {banner.heading}
                  </motion.h1>

                  <motion.p 
                    variants={itemVariants}
                    className="text-zinc-200 text-sm sm:text-base md:text-lg max-w-lg leading-relaxed normal-case"
                  >
                    {banner.subheading}
                  </motion.p>

                  <motion.div variants={itemVariants} className="pt-2">
                    <button 
                      onClick={() => router.push(banner.link)}
                      className="px-8 py-3.5 bg-secondary text-white hover:bg-secondary-hover text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-300 transform hover:scale-[1.03] shadow-lg cursor-pointer"
                    >
                      {banner.cta}
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
