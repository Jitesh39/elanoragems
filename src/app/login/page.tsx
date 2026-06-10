"use client";

import React, { useState, useEffect, use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loginEmail, registerEmail, loginGoogle, resetPassword, loading } = useAuth();

  // Tab State: "login" | "signup" | "forgot"
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot">("login");

  // Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Sync tab with URL queries if available (e.g. ?tab=signup)
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "signup") setActiveTab("signup");
  }, [searchParams]);

  // Redirect to dashboard based on role if already logged in
  useEffect(() => {
    if (user && !loading) {
      if (user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    }
  }, [user, loading, router]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setResetSent(false);
    setAuthLoading(true);

    try {
      if (activeTab === "login") {
        const u = await loginEmail(email, password);
        if (u.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/account");
        }
      } else if (activeTab === "signup") {
        const u = await registerEmail(email, password, name);
        if (u.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/account");
        }
      } else if (activeTab === "forgot") {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch (err: any) {
      console.error("Signup Error:", err);
      console.error("Error Code:", err.code);
      console.error("Error Message:", err.message);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setAuthError("Invalid email or password. Please try again.");
      } else if (err.code === "auth/email-already-in-use") {
        setAuthError("An account with this email already exists.");
      } else if (err.code === "auth/weak-password") {
        setAuthError("Password should be at least 6 characters long.");
      } else {
        setAuthError(err.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const u = await loginGoogle();
      if (u.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || "Google Authentication failed. Please try again.");
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent/20 flex flex-col justify-between">
      <Header />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="bg-white border border-zinc-100 rounded-3xl shadow-xl p-8 relative overflow-hidden">

          {/* Subtle gold decoration top corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full translate-x-10 -translate-y-10" />

          {/* Heading */}
          <div className="text-center mb-6">
            <span className="text-secondary text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1">
              <Sparkles size={12} /> ElanoraGems
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary mt-1">
              {activeTab === "login" && "Welcome Back"}
              {activeTab === "signup" && "Create Account"}
              {activeTab === "forgot" && "Reset Password"}
            </h2>
            <p className="text-zinc-400 text-xs mt-1 leading-normal normal-case">
              {activeTab === "login" && "Access your dashboard, wishlists and synced cart."}
              {activeTab === "signup" && "Join us and experience the premium luxury jewellery world."}
              {activeTab === "forgot" && "Enter your email to receive a password reset instructions."}
            </p>
          </div>

          {/* Tabs header for Login/Signup toggling */}
          {activeTab !== "forgot" && (
            <div className="flex border border-zinc-100 rounded-lg p-1 bg-zinc-50 mb-6 text-xs font-bold uppercase tracking-wider">
              <button
                onClick={() => { setActiveTab("login"); setAuthError(""); }}
                className={`flex-1 py-2 text-center rounded-md transition-colors cursor-pointer ${activeTab === "login" ? "bg-white text-primary shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                  }`}
              >
                Log In
              </button>
              <button
                onClick={() => { setActiveTab("signup"); setAuthError(""); }}
                className={`flex-1 py-2 text-center rounded-md transition-colors cursor-pointer ${activeTab === "signup" ? "bg-white text-primary shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                  }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Error alert banner */}
          <AnimatePresence>
            {authError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs font-medium flex items-start gap-2 mb-6"
              >
                <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
                <span>{authError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password Reset Sent notification */}
          {resetSent && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg text-xs font-semibold text-center mb-6">
              ✉️ We have sent a password reset link to your email address. Check your inbox.
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">

            {activeTab === "signup" && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-zinc-200 rounded-lg text-xs outline-none bg-white focus:border-secondary transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-zinc-200 rounded-lg text-xs outline-none bg-white focus:border-secondary transition-all"
                  required
                />
              </div>
            </div>

            {activeTab !== "forgot" && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Password</label>
                  {activeTab === "login" && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("forgot")}
                      className="text-secondary hover:underline text-[9px] font-bold uppercase tracking-wider"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-zinc-200 rounded-lg text-xs outline-none bg-white focus:border-secondary transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-md disabled:bg-zinc-400 cursor-pointer"
            >
              {authLoading ? (
                "Processing..."
              ) : (
                <>
                  {activeTab === "login" && "Login Now"}
                  {activeTab === "signup" && "Create Account"}
                  {activeTab === "forgot" && "Send Reset Link"}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Social Google Login Divider */}
          {activeTab !== "forgot" && (
            <div className="space-y-4 mt-6">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-zinc-100"></div>
                <span className="flex-shrink mx-4 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Or Continue With</span>
                <div className="flex-grow border-t border-zinc-100"></div>
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={authLoading}
                className="w-full py-2.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                {/* Google SVG Icon */}
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.88-2.42 2.42v2.01h3.92c2.29-2.11 3.61-5.22 3.61-8.28z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.92-2.01c-1.09.73-2.5 1.16-4.04 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v2.54C3.18 21.88 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.32 15.28A7.16 7.16 0 0 1 4.9 12c0-1.15.2-2.27.57-3.28V6.18H1.21A11.94 11.94 0 0 0 0 12c0 2.15.57 4.17 1.21 5.82l4.11-2.54z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.18 2.12 1.21 5.82l4.11 2.54c.94-2.85 3.57-4.96 6.68-4.96z"
                  />
                </svg>
                Sign In With Google
              </button>
            </div>
          )}

          {/* Toggle back to login */}
          {activeTab === "forgot" && (
            <div className="text-center mt-6">
              <button
                onClick={() => { setActiveTab("login"); setAuthError(""); }}
                className="text-xs font-bold text-secondary hover:underline uppercase tracking-wider"
              >
                Back To Login
              </button>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-accent/20 flex flex-col justify-between">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 border-2 border-secondary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-serif text-sm font-semibold tracking-widest text-zinc-500 uppercase">Loading Account Access...</p>
        </div>
        <Footer />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
