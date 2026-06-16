"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "N/A";
  const total = searchParams.get("total") || "0";

  return (
    <div className="max-w-xl mx-auto text-center space-y-8 py-16 px-4">
      {/* Animated Success Check */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto shadow-md"
      >
        {/* <CheckCircle2 size={44} className="stroke-[1.5]" /> */}
      </motion.div>

      {/* Greeting Title */}
      <div className="space-y-2">
        <span className="text-secondary text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1">
          <Sparkles size={12} /> Transaction Success
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F2F6B]">Payment Successful!</h1>
        <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto normal-case font-medium">
          Thank you for shopping with ElanoraGems. Your payment was verified successfully and your order has been placed.
        </p>
      </div>

      {/* Invoice Details Card */}
      <div className="bg-white rounded-3xl p-6 text-left border border-zinc-100 shadow-sm space-y-4 text-xs font-medium max-w-md mx-auto">
        <div className="flex justify-between border-b border-zinc-100 pb-3">
          <span className="font-bold text-zinc-400 uppercase tracking-wider">Order Number</span>
          <span className="font-bold text-primary text-sm">{orderNumber}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-100 pb-3">
          <span className="font-bold text-zinc-400 uppercase tracking-wider">Total Amount Paid</span>
          <span className="font-bold text-secondary text-sm">₹{Number(total).toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-100 pb-3">
          <span className="font-bold text-zinc-400 uppercase tracking-wider">Estimated Delivery</span>
          <span className="font-bold text-primary text-sm">3 - 5 Business Days</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold text-zinc-400 uppercase tracking-wider">Payment Status</span>
          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest">Paid</span>
        </div>
      </div>

      {/* Navigation CTA Buttons */}
      <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
        <Link
          href="/account?tab=orders"
          className="px-6 py-3.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-1.5 flex-1 cursor-pointer"
        >
          <ShoppingBag size={14} className="text-secondary" /> View Orders
        </Link>
        <Link
          href="/"
          className="px-6 py-3.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1 flex-1 cursor-pointer"
        >
          Continue Shopping <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-accent/20 flex flex-col justify-between">
      <Header />
      <Suspense fallback={
        <div className="flex-grow flex flex-col items-center justify-center py-24 bg-accent/20">
          <div className="w-12 h-12 border-2 border-secondary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-serif text-sm font-semibold tracking-widest text-zinc-500 uppercase">Processing Success Receipt...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}
