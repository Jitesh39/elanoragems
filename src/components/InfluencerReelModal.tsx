"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import 'swiper/css';
import 'swiper/css/navigation';
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
// Instagram SVG icon
const Instagram = ({ size = 24, className }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);


export const InfluencerReelModal = ({
  reels,
  currentReel,
  setCurrentReel,
  setCurrentVideo,
  onClose,
}: {
  reels: any[];
  currentReel: any;
  setCurrentReel: (reel: any) => void;
  setCurrentVideo: (url: string | null) => void;
  onClose: () => void;
}) => {
  const [taggedProducts, setTaggedProducts] = useState<any[]>([]);

  // Load tagged products when reel changes
  useEffect(() => {
    const loadProducts = async () => {
      if (!currentReel?.taggedProductIds?.length) {
        setTaggedProducts([]);
        return;
      }
      const ids = currentReel.taggedProductIds;
      // Since Firestore doesn't allow direct where on __name__, use getDocs for each ID
      const promises = ids.map((id: string) => getDoc(doc(db, "products", id)));
      const snapshots = await Promise.all(promises);
      const prods = snapshots.map(snap => ({ id: snap.id, ...snap.data() }));
      setTaggedProducts(prods);
    };
    loadProducts();
  }, [currentReel]);

  const currentIndex = reels.findIndex(r => r.id === currentReel.id);

  const goPrev = () => {
    const prevIdx = (currentIndex - 1 + reels.length) % reels.length;
    const prevReel = reels[prevIdx];
    setCurrentReel(prevReel);
    setCurrentVideo(prevReel.videoUrl);
  };
  const goNext = () => {
    const nextIdx = (currentIndex + 1) % reels.length;
    const nextReel = reels[nextIdx];
    setCurrentReel(nextReel);
    setCurrentVideo(nextReel.videoUrl);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      {/* Background overlay to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 z-10"
      >
        {/* Video */}
        <video
          src={currentReel.videoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="w-full max-h-[90vh] max-w-[420px] object-contain"
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/55 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          aria-label="Close video"
        >
          <X size={20} />
        </button>

        {/* Reel Info */}
        <div className="p-4 text-white">
          <h3 className="text-xl font-bold">{currentReel.title}</h3>
          <p className="flex items-center mt-2">
            <Instagram size={16} className="mr-2" />
            {currentReel.instagram}
          </p>
        </div>

        {/* Navigation Arrows inside modal */}
        {reels.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 hover:bg-white transition-colors"
            >
              <ArrowLeft size={20} className="text-[#0F2F6B]" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 hover:bg-white transition-colors"
            >
              <ArrowRight size={20} className="text-[#0F2F6B]" />
            </button>
          </>
        )}

        {/* Tagged Products Carousel */}
        {taggedProducts.length > 0 && (
          <div className="p-4 bg-zinc-900">
            <h4 className="text-lg font-semibold text-white mb-4">Featured Products</h4>
            <Swiper
              modules={[Navigation]}
              spaceBetween={12}
              slidesPerView={3}
              navigation
              breakpoints={{
                480: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {taggedProducts.map((product) => (
                <SwiperSlide key={product.id}>
                  <div className="bg-white rounded-xl p-3 shadow-sm flex flex-col h-full">
                    <img
                      src={product.images?.[0] || product.image || "https://via.placeholder.com/300"}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                    <p className="font-bold text-[#0F2F6B] flex-1">{product.name}</p>
                    <p className="text-sm text-zinc-600 mb-2">₹{product.price?.toLocaleString()}</p>
                    <a
                      href={`/product/${product.slug || product.id}`}
                      className="mt-auto text-center bg-[#0F2F6B] text-white px-4 py-2 rounded-md hover:bg-blue-900 transition"
                    >
                      Shop Now
                    </a>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default InfluencerReelModal;
