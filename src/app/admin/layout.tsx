"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AdminRoute } from "@/components/AdminRoute";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  LayoutDashboard,
  PackageSearch,
  Tags,
  ShoppingCart,

  TicketPercent,
  Users,
  Bell,
  LineChart,
  Settings,
  Store,
  LogOut,
  Menu,
  X,
  MessageSquare,
  FileText,
  Mail
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setIsProfileLoading(true);
        const docRef = doc(db, "users", firebaseUser.uid);
        const unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfileUser(docSnap.data());
          } else {
            setProfileUser(null);
          }
          setIsProfileLoading(false);
        }, (error) => {
          console.error("Error loading user profile:", error);
          setIsProfileLoading(false);
        });
        return () => unsubscribeDoc();
      } else {
        setProfileUser(null);
        setIsProfileLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const q = query(collection(db, "notifications"), where("isRead", "==", false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });
    return () => unsubscribe();
  }, []);
  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Manage Products", href: "/admin/products", icon: PackageSearch },
    { name: "Manage Reviews", href: "/admin/reviews", icon: MessageSquare },
    { name: "Categories", href: "/admin/categories", icon: Tags },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },

    { name: "Coupons", href: "/admin/coupons", icon: TicketPercent },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Subscribers", href: "/admin/subscribers", icon: Mail },
    { name: "Notifications", href: "/admin/notifications", icon: Bell },
    { name: "Analytics", href: "/admin/analytics", icon: LineChart },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-[#F8F9FC] font-sans flex text-[#0F2F6B]">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-zinc-100 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            }`}
        >
          {/* Logo Area */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-zinc-100">
            <Link href="/admin" className="flex items-center select-none">
              {!logoError ? (
                <Image
                  src="/logo.png"
                  alt="ElanoraGems Admin"
                  width={150}
                  height={50}
                  className="h-[45px] md:h-[50px] w-auto object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="font-serif text-2xl font-bold text-[#0F2F6B] tracking-wide">
                  Elanora<span className="text-[#D4AF37]">Admin</span>
                </span>
              )}
            </Link>
            <button className="lg:hidden text-zinc-500 hover:text-[#0F2F6B]" onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                    ? "bg-[#0F2F6B] text-white shadow-md shadow-[#0F2F6B]/20"
                    : "text-zinc-500 hover:bg-[#F8F9FC] hover:text-[#0F2F6B]"
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} className={`transition-colors ${isActive ? "text-[#D4AF37]" : "text-zinc-400 group-hover:text-[#0F2F6B]"}`} />
                  <span className="font-semibold text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-zinc-100 space-y-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:bg-[#F8F9FC] hover:text-[#0F2F6B] transition-all duration-200 group"
            >
              <Store size={20} className="text-zinc-400 group-hover:text-[#0F2F6B]" />
              <span className="font-semibold text-sm">View Store</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-semibold text-sm">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Top Header */}
          <header className="h-20 bg-white border-b border-zinc-100 flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden p-2 text-zinc-500 hover:text-[#0F2F6B] hover:bg-zinc-50 rounded-lg transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
              {/* Optional Search Bar here in future */}
            </div>

            {/* Right Side Header Items */}
            <div className="flex items-center gap-6">
              <Link
                href="/admin/notifications"
                className="relative p-2 text-zinc-400 hover:text-[#0F2F6B] transition-colors rounded-full hover:bg-zinc-50 animate-pulse-subtle"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white px-1">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <div className="h-8 w-px bg-zinc-200 hidden sm:block"></div>

              {/* Admin Profile Dropdown Trigger */}
              <div className="flex items-center gap-3 cursor-pointer group">
                {isProfileLoading ? (
                  <>
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-sm font-bold text-zinc-400 animate-pulse">
                        Loading...
                      </span>
                      <span className="text-[10px] font-bold tracking-widest text-zinc-300 uppercase bg-zinc-100 px-2 py-0.5 rounded-full mt-0.5">
                        &nbsp;
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-zinc-200 animate-pulse border-2 border-zinc-300 shadow-sm shrink-0" />
                  </>
                ) : (
                  <>
                    <div className="hidden sm:flex flex-col items-end">
                      {/* Display dynamic name */}
                      <span className="text-sm font-bold text-[#0F2F6B]">
                        {profileUser ? (profileUser.name || profileUser.displayName || "User") : "User"}
                      </span>
                      {/* Role badge */}
                      <span className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase bg-[#D4AF37]/10 px-2 py-0.5 rounded-full mt-0.5">
                        {(profileUser?.role || "Customer").toUpperCase()}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#0F2B5B] text-white flex items-center justify-center font-bold text-lg border-2 border-[#D4AF37] group-hover:scale-105 transition-transform shadow-sm shrink-0">
                      {(profileUser?.name || profileUser?.displayName || "User").charAt(0).toUpperCase()}
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Main Page Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>

        </div>
      </div>
    </AdminRoute>
  );
}
