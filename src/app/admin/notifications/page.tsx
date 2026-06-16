"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDocs,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  Trash2,
  Clock,
  ChevronRight,
  AlertTriangle,
  ShoppingBag,
  UserPlus,
  CreditCard,
  CheckCircle,
  XCircle,
  Inbox
} from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "order" | "inventory" | "user" | "payment">("all");
  const router = useRouter();

  useEffect(() => {
    const notifRef = collection(db, "notifications");
    const q = query(notifRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(docSnap => {
        data.push({ id: docSnap.id, ...docSnap.data() });
      });
      setNotifications(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Error listening to notifications:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getEmojiAndStyle = (notif: any) => {
    const titleLower = (notif.title || "").toLowerCase();
    const type = notif.type;

    if (type === "order") {
      if (titleLower.includes("cancel")) {
        return {
          emoji: "❌",
          icon: <XCircle size={18} className="text-red-500 animate-pulse-subtle" />,
          bg: "bg-red-50 border-red-100 text-red-500",
          titleColor: "text-red-950"
        };
      }
      return {
        emoji: "🛒",
        icon: <ShoppingBag size={18} className="text-[#0F2F6B]" />,
        bg: "bg-blue-50 border-blue-100 text-[#0F2F6B]",
        titleColor: "text-[#0F2F6B]"
      };
    }
    if (type === "user") {
      return {
        emoji: "👤",
        icon: <UserPlus size={18} className="text-emerald-600" />,
        bg: "bg-emerald-50 border-emerald-100 text-emerald-600",
        titleColor: "text-emerald-950"
      };
    }
    if (type === "inventory") {
      if (titleLower.includes("out of stock") || titleLower.includes("zero")) {
        return {
          emoji: "❌",
          icon: <XCircle size={18} className="text-rose-600" />,
          bg: "bg-rose-50 border-rose-100 text-rose-600",
          titleColor: "text-rose-950"
        };
      }
      return {
        emoji: "⚠",
        icon: <AlertTriangle size={18} className="text-amber-600" />,
        bg: "bg-amber-50 border-amber-100 text-amber-600",
        titleColor: "text-amber-950"
      };
    }
    if (type === "payment") {
      return {
        emoji: "💳",
        icon: <CreditCard size={18} className="text-[#D4AF37]" />,
        bg: "bg-amber-50/50 border-amber-100/50 text-[#D4AF37]",
        titleColor: "text-zinc-900"
      };
    }
    return {
      emoji: "🔔",
      icon: <Bell size={18} className="text-zinc-500" />,
      bg: "bg-zinc-50 border-zinc-100 text-zinc-500",
      titleColor: "text-zinc-950"
    };
  };

  const getNotificationTime = (notif: any) => {
    if (!notif.createdAt) return "Just now";

    const date = notif.createdAt.toMillis
      ? new Date(notif.createdAt.toMillis())
      : new Date(notif.createdAt);

    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    }

    const days = Math.floor(hours / 24);
    return days === 1 ? "1 day ago" : `${days} days ago`;
  };

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await updateDoc(doc(db, "notifications", id), { isRead: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const markAllRead = async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.isRead);
      if (unreadNotifs.length === 0) return;

      const batch = writeBatch(db);
      unreadNotifs.forEach(notif => {
        batch.update(doc(db, "notifications", notif.id), { isRead: true });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  const clearAllNotifications = async () => {
    if (notifications.length === 0) return;
    if (!window.confirm("Are you sure you want to clear all notifications permanently?")) return;

    try {
      const batch = writeBatch(db);
      notifications.forEach(notif => {
        batch.delete(doc(db, "notifications", notif.id));
      });
      await batch.commit();
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };

  const handleCardClick = async (notif: any) => {
    // 1. Mark as read if unread
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }

    // 2. Perform redirect based on Quick Action types
    if (notif.referenceId) {
      const type = notif.type;
      if (type === "order") {
        router.push(`/admin/orders?orderId=${notif.referenceId}`);
      } else if (type === "user") {
        router.push(`/admin/users?search=${notif.referenceId}`);
      } else if (type === "inventory") {
        router.push(`/admin/products?productId=${notif.referenceId}`);
      }
    }
  };

  // Filter logic
  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === "unread") return !notif.isRead;
    if (activeTab === "all") return true;
    return notif.type === activeTab;
  });

  const unreadTotal = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#0F2F6B] to-[#1e468f] p-6 sm:p-8 rounded-3xl text-white shadow-md relative overflow-hidden">
        {/* Background Design Accent */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-wide">System Notifications</h1>
            {unreadTotal > 0 && (
              <span className="bg-[#D4AF37] text-[#0F2F6B] font-bold text-xs px-2.5 py-1 rounded-full animate-pulse-subtle">
                {unreadTotal} New
              </span>
            )}
          </div>
          <p className="text-blue-100 text-xs sm:text-sm max-w-md">
            Manage real-time logs, orders checkout, inventory updates, and subscriber accounts.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap gap-2.5 z-10 shrink-0">
          <button
            onClick={markAllRead}
            disabled={unreadTotal === 0}
            className="text-xs font-semibold text-white bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2 transition-all duration-200"
          >
            <Check size={14} /> Mark all read
          </button>
          <button
            onClick={clearAllNotifications}
            disabled={notifications.length === 0}
            className="text-xs font-semibold text-rose-100 hover:text-white bg-rose-500/10 hover:bg-rose-500/35 disabled:opacity-40 disabled:hover:bg-rose-500/10 px-4 py-2.5 rounded-xl border border-rose-500/10 flex items-center gap-2 transition-all duration-200"
          >
            <Trash2 size={14} /> Clear all
          </button>
        </div>
      </div>

      {/* Tabs Filter Section */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none border-b border-zinc-100">
        {[
          { id: "all", label: "All Logs", count: notifications.length },
          { id: "unread", label: "Unread", count: unreadTotal, highlight: true },
          { id: "order", label: "Orders", count: notifications.filter(n => n.type === "order").length },
          { id: "inventory", label: "Inventory", count: notifications.filter(n => n.type === "inventory").length },
          { id: "user", label: "Users", count: notifications.filter(n => n.type === "user").length },
          { id: "payment", label: "Payments", count: notifications.filter(n => n.type === "payment").length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${activeTab === tab.id
                ? "bg-[#0F2F6B] text-white shadow-sm"
                : tab.highlight && tab.count > 0
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-white text-zinc-500 hover:bg-zinc-50 border border-zinc-100"
              }`}
          >
            {tab.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id
                ? "bg-white/20 text-white"
                : tab.highlight && tab.count > 0
                  ? "bg-red-200 text-red-700 font-bold"
                  : "bg-zinc-100 text-zinc-600"
              }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main List Container */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-zinc-400 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-[#0F2F6B] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold">Streaming live updates...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {filteredNotifications.map((notif) => {
              const { emoji, icon, bg, titleColor } = getEmojiAndStyle(notif);
              return (
                <div
                  key={notif.id}
                  onClick={() => handleCardClick(notif)}
                  className={`p-5 flex gap-4 transition-all duration-200 cursor-pointer group hover:bg-[#F8F9FC] ${!notif.isRead
                      ? "bg-[#0F2F6B]/[0.02] border-l-4 border-l-[#D4AF37]"
                      : "border-l-4 border-l-transparent"
                    }`}
                >
                  {/* Category Visual Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-zinc-100/50 ${bg} group-hover:scale-105 transition-transform`}>
                    {icon}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3 className={`font-bold text-sm flex items-center gap-1.5 ${titleColor}`}>
                        <span>{emoji}</span>
                        <span>{notif.title}</span>
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0"></span>
                        )}
                      </h3>
                      <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium whitespace-nowrap">
                        <Clock size={11} />
                        {getNotificationTime(notif)}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Quick Action Prompt */}
                    {notif.referenceId && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-bold text-[#0F2F6B] mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        Go to Details <ChevronRight size={14} className="mt-0.5" />
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-start gap-1 shrink-0 self-center">
                    {!notif.isRead && (
                      <button
                        onClick={(e) => markAsRead(notif.id, e)}
                        title="Mark as Read"
                        className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={(e) => deleteNotification(notif.id, e)}
                      title="Delete Notification"
                      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-300 mb-4">
              <Inbox size={28} />
            </div>
            <p className="font-serif font-bold text-lg text-[#0F2F6B]">No notifications right now.</p>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {activeTab === "unread"
                ? "You've read all alerts! Great job."
                : "You're all caught up with store activities!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
