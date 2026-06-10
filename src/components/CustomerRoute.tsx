"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const CustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "customer") {
        router.push("/admin");
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "customer") {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 border-2 border-secondary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-serif text-sm font-semibold tracking-widest text-zinc-500 uppercase">Verifying Account Access...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
};
