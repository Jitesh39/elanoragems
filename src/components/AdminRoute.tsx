"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/account");
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 border-2 border-secondary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-serif text-sm font-semibold tracking-widest text-zinc-500 uppercase">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
