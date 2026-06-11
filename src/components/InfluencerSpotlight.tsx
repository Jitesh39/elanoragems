"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ArrowLeft, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, FreeMode } from "swiper/modules";
import 'swiper/css';
import 'swiper/css/navigation';
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import InfluencerReelModal from "./InfluencerReelModal";

// Instagram SVG icon
const Instagram = ({ size = 24 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export const InfluencerSpotlight: React.FC = () => {
  const [activeReelVideo, setActiveReelVideo] = useState<string | null>(null);
  const [activeReel, setActiveReel] = useState<any | null>(null);
  const [reels, setReels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Track which slide indices are currently visible for lazy video loading
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    const q = query(
      collection(db, "influencerReels"),
      where("isActive", "==", true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      // Sort in memory to avoid composite index requirement (fallback)
      data.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setReels(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleReelClick = (reel: any) => {
    setActiveReel(reel);
    setActiveReelVideo(reel.videoUrl);
  };

  const closeModal = () => {
    setActiveReelVideo(null);
    setActiveReel(null);
  };

  // Update visible indices when Swiper changes slides
  const updateVisibleIndices = (swiper: any) => {
    const start = swiper.activeIndex;
    const perView = swiper.params.slidesPerView === "auto" ? 1 : swiper.params.slidesPerView;
    const newSet = new Set<number>();
    for (let i = start; i < start + perView; i++) {
      newSet.add(i % reels.length);
    }
    setVisibleIndices(newSet);
  };

  if (isLoading || reels.length === 0) {
    return null; // hide section until data arrives
  }

  return (
    <section className="py-16 bg-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-secondary text-xs font-bold tracking-widest flex items-center justify-center gap-1">
            <Instagram size={14} /> ElanoraGems
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mt-1">Influencer Spotlight</h2>
        </div>

        {/* Reels Horizontal Slider */}
        <Swiper
          modules={[Navigation, Autoplay, FreeMode]}
          spaceBetween={20}
          slidesPerView={4}
          freeMode={false}
          navigation={{
            prevEl: '.influencer-prev',
            nextEl: '.influencer-next',
          }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={true}
          breakpoints={{
            480: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          onInit={updateVisibleIndices}
          onSlideChange={(swiper) => updateVisibleIndices(swiper)}
          className="relative w-full"
        >
          {reels.map((reel, index) => (
            <SwiperSlide key={reel.id} className="w-full">
              <motion.div
                whileHover={{ y: -6 }}
                onClick={() => handleReelClick(reel)}
                className="relative aspect-[9/16] w-full rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 group bg-zinc-900"
              >
                {/* Lazy video rendering – only render when visible */}
                {visibleIndices.has(index) ? (
                  <video
                    src={reel.videoUrl}
                    muted
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-80"
                  />
                ) : (
                  // placeholder thumbnail (blurred image) – assume `cover` field exists
                  <img
                    src={reel.cover || "https://via.placeholder.com/400x600?text=Reel"}
                    alt={reel.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Play Icon Container */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/35 backdrop-blur-md border border-white/50 flex items-center justify-center text-white transform scale-90 group-hover:scale-100 group-hover:bg-secondary transition-all duration-300">
                    <Play size={20} className="fill-white translate-x-[1px]" />
                  </div>
                </div>

                {/* Bottom Creator Info */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h4 className="text-sm font-bold truncate">{reel.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                      <Instagram size={10} />
                    </div>
                    <span className="text-xs font-semibold tracking-wider truncate">{reel.instagram}</span>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}

          {/* Navigation Arrows – show only when more reels than perView */}
          {reels.length > 1 && (
            <>
              <button className="influencer-prev absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 hover:bg-white transition-colors z-10">
                <ArrowLeft size={20} className="text-[#0F2F6B]" />
              </button>
              <button className="influencer-next absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 hover:bg-white transition-colors z-10">
                <ArrowRight size={20} className="text-[#0F2F6B]" />
              </button>
            </>
          )}
        </Swiper>

        {/* Full‑screen Modal */}
        <AnimatePresence>
          {activeReelVideo && activeReel && (
            <InfluencerReelModal
              reels={reels}
              currentReel={activeReel}
              setCurrentReel={setActiveReel}
              setCurrentVideo={setActiveReelVideo}
              onClose={closeModal}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default InfluencerSpotlight;
