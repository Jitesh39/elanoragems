"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Bell, Check, Clock, ShoppingBag, UserPlus, AlertCircle } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Default demo notifications
    const demoNotifications = [
      { id: "1", type: "order", title: "New Order #ORD-1298", message: "Aishwarya R. placed an order for ₹4,299.", time: "10 minutes ago", read: false },
      { id: "2", type: "user", title: "New User Registration", message: "Rahul K. just created an account.", time: "1 hour ago", read: false },
      { id: "3", type: "alert", title: "Low Stock Alert", message: "Sterling Silver Minimalist Ring is running low on stock (2 left).", time: "3 hours ago", read: true },
      { id: "4", type: "order", title: "Order Cancelled", message: "Order #ORD-8821 was cancelled by the customer.", time: "1 day ago", read: true },
    ];

    const notifRef = collection(db, "notifications");
    const unsubscribe = onSnapshot(notifRef, (snapshot) => {
      if (!snapshot.empty) {
        const data: any[] = [];
        snapshot.forEach(doc => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setNotifications(data);
      } else {
        setNotifications(demoNotifications);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case "order": return <ShoppingBag size={20} className="text-blue-500" />;
      case "user": return <UserPlus size={20} className="text-emerald-500" />;
      case "alert": return <AlertCircle size={20} className="text-amber-500" />;
      default: return <Bell size={20} className="text-zinc-500" />;
    }
  };

  const getIconBg = (type: string) => {
    switch(type) {
      case "order": return "bg-blue-100";
      case "user": return "bg-emerald-100";
      case "alert": return "bg-amber-100";
      default: return "bg-zinc-100";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2F6B]">Notifications</h1>
          <p className="text-zinc-500 mt-1">Stay updated with store activities.</p>
        </div>
        <button className="text-sm font-semibold text-[#D4AF37] hover:text-[#AA7C11] flex items-center gap-2">
          <Check size={16} /> Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-zinc-500">Loading notifications...</div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-6 hover:bg-zinc-50 transition-colors flex gap-4 ${!notif.read ? 'bg-blue-50/30' : ''}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getIconBg(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className={`font-bold ${!notif.read ? 'text-[#0F2F6B]' : 'text-zinc-700'}`}>
                      {notif.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-zinc-400 whitespace-nowrap shrink-0">
                      <Clock size={12} />
                      {notif.time}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-600 mt-1">{notif.message}</p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-[#D4AF37] mt-2 shrink-0"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center">
            <Bell size={48} className="text-zinc-300 mb-4" />
            <p className="font-semibold">No notifications right now.</p>
            <p className="text-sm mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}
