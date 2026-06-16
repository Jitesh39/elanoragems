"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import Link from "next/link";
import {
  Mail,
  User,
  MessageSquare,
  Send,
  Building,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  MapPin
} from "lucide-react";

export default function ContactPage() {
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Email format validation
  const validateEmail = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setErrorMsg(null);

    // Basic Validation
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrorMsg("All fields are required.");
      return;
    }

    if (!validateEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://formspree.io/f/mlgkvnpb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message
        })
      });

      if (response.ok) {
        setSuccess(true);
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        const resData = await response.json();
        setErrorMsg(resData.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Formspree submission error:", err);
      setErrorMsg("Failed to connect to the server. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full font-sans">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-6">
          <Link href="/" className="hover:text-secondary transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-600 font-bold">Contact Support</span>
        </nav>

        {/* Header */}
        <div className="border-b border-zinc-150 pb-6 mb-10">
          <span className="text-secondary text-xs font-bold uppercase tracking-widest block mb-1">
            Get In Touch
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary">
            Contact Support
          </h1>
          <p className="text-zinc-500 text-xs sm:text-sm mt-2">
            Have a question or request? Send us a message and our support team will respond shortly.
          </p>
        </div>

        {/* Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Support Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#F8F4F0] border border-[#D4AF37]/15 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-36 h-36 rounded-full bg-[#D4AF37]/5 blur-2xl pointer-events-none" />

              <h2 className="font-serif text-xl font-bold text-primary pb-3 border-b border-zinc-200">
                Support Information
              </h2>

              <div className="space-y-4">
                {/* Brand */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-zinc-150 flex items-center justify-center text-secondary shrink-0">
                    <Building size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Business Name</h3>
                    <p className="text-primary font-bold text-sm sm:text-base">ElanoraGems</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-zinc-150 flex items-center justify-center text-secondary shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address</h3>
                    <a
                      href="mailto:gemselanora@gmail.com"
                      className="text-primary hover:text-secondary font-bold text-sm sm:text-base transition-colors"
                    >
                      gemselanora@gmail.com
                    </a>
                  </div>
                </div>

                {/* Support Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-zinc-150 flex items-center justify-center text-secondary shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Support Hours</h3>
                    <p className="text-zinc-600 font-semibold text-xs sm:text-sm leading-relaxed normal-case">
                      Monday to Saturday: 10:00 AM – 6:00 PM IST<br />
                      Closed on Sundays & Public Holidays
                    </p>
                  </div>
                </div>

                {/* Origin */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-zinc-150 flex items-center justify-center text-secondary shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Location</h3>
                    <p className="text-zinc-600 font-semibold text-xs sm:text-sm normal-case">
                      Mumbai, Maharashtra, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Note */}
            <div className="border border-zinc-200 rounded-3xl p-6 text-center bg-white shadow-sm space-y-2">
              <p className="text-xs font-semibold text-[#0F2F6B]">Reverse Pickups & Exchanges</p>
              <p className="text-zinc-500 text-[11px] leading-relaxed normal-case">
                Looking to return or exchange your order? Please check our{" "}
                <Link href="/policies/refund" className="text-secondary hover:underline font-bold">
                  Refund Policy
                </Link>{" "}
                or head to your account details to initiate reverse logistics.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <h2 className="font-serif text-xl font-bold text-primary mb-6 flex items-center gap-2">
              Send Us a Message
            </h2>

            {/* Feedback Alerts */}
            {success && (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm mb-6 animate-fade-in font-medium">
                <CheckCircle className="shrink-0 text-emerald-500 mt-0.5" size={18} />
                <span>Thank you! Your message has been sent successfully.</span>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm mb-6 animate-fade-in font-medium">
                <AlertCircle className="shrink-0 text-rose-500 mt-0.5" size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <User size={12} className="text-secondary" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all bg-zinc-50/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <Mail size={12} className="text-secondary" /> Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all bg-zinc-50/50"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  placeholder="What is this regarding?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all bg-zinc-50/50"
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <MessageSquare size={12} className="text-secondary" /> Message
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all bg-zinc-50/50 resize-none leading-relaxed"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0F2F6B] hover:bg-blue-900 text-white font-bold uppercase tracking-wider text-xs sm:text-sm py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
