"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Volume2, VolumeX } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";

const Instagram = ({ size = 24 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
import { FreeMode } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";

const REELS = [
  {
    id: "reel-1",
    creator: "@aditi_sharma",
    cover: "https://images.unsplash.com/photo-1549068106-b024baf5068d?w=400&q=80",
    video: "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0542d87e12c0c16b50b122f3e8f813c&profile_id=165&oauth2_token_id=57447761"
  },
  {
    id: "reel-2",
    creator: "@priya_patel",
    cover: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&q=80",
    video: "https://player.vimeo.com/external/435674703.sd.mp4?s=7fdf7f1f0a2e7e3e78e63b6d2e67dfa818451197&profile_id=165&oauth2_token_id=57447761"
  },
  {
    id: "reel-3",
    creator: "@sneha_reddy",
    cover: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80",
    video: "https://player.vimeo.com/external/538570388.sd.mp4?s=d940656a8fb48395ec1df61f71dfb37c68b75ec9&profile_id=165&oauth2_token_id=57447761"
  },
  {
    id: "reel-4",
    creator: "@riya_sen",
    cover: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&q=80",
    video: "https://player.vimeo.com/external/554988960.sd.mp4?s=452eb8c15db6453d7f1b218f2f275e7a90f1d533&profile_id=165&oauth2_token_id=57447761"
  }
];

export const CreatorReels: React.FC = () => {
  const [activeReelVideo, setActiveReelVideo] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);

  return (
    <section className="py-16 bg-white w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-secondary text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-1">
            <Instagram size={14} /> Elanora Muse
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mt-1">Creator Reels</h2>
          <p className="text-zinc-500 text-xs sm:text-sm max-w-md mx-auto mt-2 normal-case">See how our beautiful community styles ElanoraGems for their everyday elegance.</p>
        </div>

        {/* Reels Horizontal Slider */}
        <div className="pt-2">
          <Swiper
            modules={[FreeMode]}
            spaceBetween={20}
            slidesPerView={1.3}
            freeMode={true}
            breakpoints={{
              480: { slidesPerView: 2.2 },
              768: { slidesPerView: 3.2 },
              1024: { slidesPerView: 4 }
            }}
            className="w-full"
          >
            {REELS.map((reel) => (
              <SwiperSlide key={reel.id}>
                <motion.div
                  whileHover={{ y: -6 }}
                  onClick={() => setActiveReelVideo(reel.video)}
                  className="relative aspect-[9/16] w-full rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 group bg-zinc-100"
                >
                  {/* Cover Image */}
                  <img
                    src={reel.cover}
                    alt={reel.creator}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Play Icon Container */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/35 backdrop-blur-md border border-white/50 flex items-center justify-center text-white transform scale-90 group-hover:scale-100 group-hover:bg-secondary transition-all duration-300">
                      <Play size={20} className="fill-white translate-x-[1px]" />
                    </div>
                  </div>

                  {/* Bottom Creator Info */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-white">
                    <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                      <Instagram size={12} />
                    </div>
                    <span className="text-xs font-semibold tracking-wider">{reel.creator}</span>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Video Lightbox Modal */}
      <AnimatePresence>
        {activeReelVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            {/* Close trigger overlay */}
            <div className="absolute inset-0" onClick={() => setActiveReelVideo(null)} />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-sm w-full aspect-[9/16] bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 z-10"
            >
              {/* HTML5 Autoplay Loop video */}
              <video
                src={activeReelVideo}
                autoPlay
                loop
                playsInline
                muted={muted}
                className="w-full h-full object-cover"
              />

              {/* Close Button */}
              <button
                onClick={() => setActiveReelVideo(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/55 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-colors cursor-pointer"
                aria-label="Close video"
              >
                <X size={16} />
              </button>

              {/* Mute/Unmute Toggle */}
              <button
                onClick={() => setMuted(!muted)}
                className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-black/55 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-colors cursor-pointer"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
export default CreatorReels;
