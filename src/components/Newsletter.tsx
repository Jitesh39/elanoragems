"use client";

import React, { useState } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ToastProps {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ type, message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl border ${type === "success"
        ? "bg-emerald-950/95 border-emerald-500/30 text-emerald-200"
        : "bg-red-950/95 border-red-500/30 text-red-200"
        } backdrop-blur-md max-w-sm`}
    >
      {type === "success" ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
      )}
      <p className="text-sm font-medium leading-relaxed">{message}</p>
      <button
        onClick={onClose}
        className="ml-auto text-xs opacity-60 hover:opacity-100 font-bold px-1.5 py-0.5 rounded cursor-pointer"
      >
        ✕
      </button>
    </motion.div>
  );
};

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailClean = email.trim().toLowerCase();
    if (!emailClean) return;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailClean)) {
      setToast({
        type: "error",
        message: "Please enter a valid email address.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check for duplicate subscriptions
      const subscribersRef = collection(db, "subscribers");
      const q = query(subscribersRef, where("email", "==", emailClean));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Find if any is active
        const hasActive = querySnapshot.docs.some(doc => doc.data().status === "active");
        if (hasActive) {
          setToast({
            type: "error",
            message: "This email is already subscribed.",
          });
          setIsLoading(false);
          return;
        } else {
          // If they subscribed before but were inactive, we can activate them again
          const docId = querySnapshot.docs[0].id;
          const { doc, updateDoc } = await import("firebase/firestore");
          // Just update status to active
          await updateDoc(doc(db, "subscribers", docId), {
            status: "active",
            subscribedAt: serverTimestamp(),
          });
        }
      } else {
        // Create new subscriber doc
        await addDoc(subscribersRef, {
          email: emailClean,
          subscribedAt: serverTimestamp(),
          status: "active",
        });
      }

      setToast({
        type: "success",
        message: "Thank you for subscribing to ElanoraGems.",
      });
      setEmail("");
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      setToast({
        type: "error",
        message: "Something went wrong. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative w-full bg-primary text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-white/10 overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">

        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wide text-white">
          Stay in the Loop
        </h2>

        <p className="font-sans text-xs sm:text-sm text-zinc-300 max-w-lg mx-auto leading-relaxed">
          Get updates on new collections, exclusive offers, and latest jewellery launches.
        </p>

        <form onSubmit={handleSubscribe} className="max-w-md mx-auto pt-2">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-center">
            <input
              required
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-5 py-3 bg-white/5 border border-white/15 text-white placeholder-zinc-400 rounded-full focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-xs font-sans"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-secondary hover:bg-secondary-hover text-primary font-bold uppercase tracking-wider text-[10px] px-6 py-3 rounded-full transition-all duration-300 whitespace-nowrap shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Subscribing...
                </>
              ) : (
                "Subscribe"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Floating Animated Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Newsletter;
