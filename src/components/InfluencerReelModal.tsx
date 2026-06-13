"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, ArrowLeft, ArrowRight, ShoppingBag, Volume2, VolumeX, Play, Pause } from "lucide-react";
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
  const [showProducts, setShowProducts] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayStateFeedback, setShowPlayStateFeedback] = useState<"play" | "pause" | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Load tagged products when reel changes
  useEffect(() => {
    const loadProducts = async () => {
      if (!currentReel?.taggedProductIds?.length) {
        setTaggedProducts([]);
        setShowProducts(false);
        return;
      }
      const ids = currentReel.taggedProductIds;
      const promises = ids.map((id: string) => getDoc(doc(db, "products", id)));
      const snapshots = await Promise.all(promises);
      const prods = snapshots
        .filter(snap => snap.exists())
        .map(snap => ({ id: snap.id, ...snap.data() }));
      setTaggedProducts(prods);
    };
    loadProducts();
    
    // Auto play video and reset state
    setIsPlaying(true);
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

  // Toggle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowPlayStateFeedback("pause");
    } else {
      videoRef.current.play().catch(err => console.log(err));
      setIsPlaying(true);
      setShowPlayStateFeedback("play");
    }
    
    setTimeout(() => {
      setShowPlayStateFeedback(null);
    }, 600);
  };

  // Toggle mute
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent play/pause toggle
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
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
      goNext();
    } else if (diff < -swipeThreshold) {
      goPrev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none"
    >
      {/* Background click to close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Main Lightbox Frame wrapper */}
      <div className="relative flex items-center justify-center w-full h-full max-h-[85vh] sm:max-h-[88vh] md:max-h-[92vh]">
        
        {/* Navigation Arrows for desktop (drawn on the outside of video frame) */}
        {reels.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="hidden md:flex absolute -left-16 lg:-left-20 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 items-center justify-center text-white cursor-pointer transition-all hover:scale-105 active:scale-95"
              aria-label="Previous reel"
            >
              <ArrowLeft size={20} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="hidden md:flex absolute -right-16 lg:-right-20 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 items-center justify-center text-white cursor-pointer transition-all hover:scale-105 active:scale-95"
              aria-label="Next reel"
            >
              <ArrowRight size={20} />
            </button>
          </>
        )}

        {/* Video Card - exact aspect ratio & max height, centered */}
        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full h-full aspect-[9/16] bg-black rounded-[24px] overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center max-w-[440px]"
        >
          {/* Main vertical video */}
          <video
            ref={videoRef}
            src={currentReel.videoUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onClick={togglePlay}
            className="w-full h-full object-cover cursor-pointer"
          />

          {/* Elegant Close Button overlay */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/45 border border-white/10 flex items-center justify-center text-white hover:bg-black/70 hover:scale-105 transition-all z-30 cursor-pointer"
            aria-label="Close video"
          >
            <X size={18} />
          </button>

          {/* Elegant Mute Button overlay */}
          <button
            onClick={toggleMute}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/45 border border-white/10 flex items-center justify-center text-white hover:bg-black/70 hover:scale-105 transition-all z-30 cursor-pointer"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Feedback Overlay for play/pause toggles */}
          {showPlayStateFeedback && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.2, opacity: 0.8 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white"
              >
                {showPlayStateFeedback === "play" ? <Play size={24} className="fill-white" /> : <Pause size={24} className="fill-white" />}
              </motion.div>
            </div>
          )}

          {/* Bottom Info overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-5 text-white flex flex-col justify-end pointer-events-none z-10 pt-16">
            <h3 className="text-base font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate">
              {currentReel.title}
            </h3>
            
            {((currentReel.instagram && currentReel.instagram.trim() !== "") || taggedProducts.length > 0) && (
              <div className="flex items-center justify-between mt-2">
                {currentReel.instagram && currentReel.instagram.trim() !== "" ? (
                  <a
                    href={`https://www.instagram.com/${currentReel.instagram.trim().replace(/^@/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="pointer-events-auto flex items-center gap-1.5 text-white hover:text-[#D4AF37] transition-colors"
                  >
                    <Instagram size={14} className="text-[#D4AF37]" />
                    <span className="text-xs font-semibold tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      {currentReel.instagram}
                    </span>
                  </a>
                ) : (
                  <div />
                )}

                {/* Shopping bag overlay button if products are tagged */}
                {taggedProducts.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowProducts(true);
                    }}
                    className="pointer-events-auto flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#bda030] text-black font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <ShoppingBag size={12} /> Shop Look
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tagged Products Bottom Sheet Drawer */}
          {taggedProducts.length > 0 && (
            <div 
              className={`absolute inset-x-0 bottom-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-white/10 rounded-t-3xl p-5 transition-transform duration-300 pointer-events-auto ${
                showProducts ? "translate-y-0" : "translate-y-full"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                  <ShoppingBag size={14} className="text-[#D4AF37]" /> Tagged Products
                </h4>
                <button 
                  onClick={() => setShowProducts(false)} 
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Horizontal List of Products */}
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {taggedProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="flex-shrink-0 w-36 bg-zinc-900 border border-white/5 rounded-2xl p-2.5 flex flex-col justify-between"
                  >
                    <img 
                      src={product.images?.[0] || product.image || "https://via.placeholder.com/150"} 
                      alt={product.name}
                      className="w-full h-20 object-cover rounded-xl mb-2" 
                    />
                    <h5 className="text-[11px] font-bold text-white line-clamp-1">{product.name}</h5>
                    <p className="text-[10px] text-[#D4AF37] mt-0.5 mb-2 font-semibold">₹{product.price?.toLocaleString()}</p>
                    <a 
                      href={`/product/${product.slug || product.id}`} 
                      className="text-center bg-white text-black text-[9px] font-bold py-1.5 rounded-lg hover:bg-zinc-200 transition-colors cursor-pointer"
                    >
                      Shop Now
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default InfluencerReelModal;
