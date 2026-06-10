"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "./AuthContext";

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  // 1. Load guest wishlist from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("elanora_wishlist");
      if (local && !user) {
        setWishlistItems(JSON.parse(local));
      }
    }
  }, [user]);

  // 2. Sync real-time with Firebase Firestore for authenticated users
  useEffect(() => {
    if (!user) return;

    const wishlistDocRef = doc(db, "wishlist", user.uid);
    console.log("Current User:", auth.currentUser);
    console.log("Subscribing (onSnapshot) to collection: wishlist");
    console.log("UID:", user.uid);
    const unsubscribe = onSnapshot(wishlistDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWishlistItems(data.items || []);
      } else {
        // Create matching empty/merged entry
        const local = localStorage.getItem("elanora_wishlist");
        const initialItems = local ? JSON.parse(local) : [];
        console.log("Current User:", auth.currentUser);
        console.log("Writing collection: wishlist");
        console.log("UID:", user.uid);
        setDoc(wishlistDocRef, { items: initialItems });
      }
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Save helper
  const saveWishlist = async (newItems: WishlistItem[]) => {
    setWishlistItems(newItems);
    if (typeof window !== "undefined") {
      localStorage.setItem("elanora_wishlist", JSON.stringify(newItems));
    }
    if (user) {
      try {
        const wishlistDocRef = doc(db, "wishlist", user.uid);
        console.log("Current User:", auth.currentUser);
        console.log("Writing collection: wishlist");
        console.log("UID:", user.uid);
        await setDoc(wishlistDocRef, { items: newItems });
      } catch (error) {
        console.error("Error updating wishlist in Firebase:", error);
      }
    }
  };

  const toggleWishlist = (item: WishlistItem) => {
    const exists = wishlistItems.some((i) => i.productId === item.productId);
    let updated: WishlistItem[];

    if (exists) {
      updated = wishlistItems.filter((i) => i.productId !== item.productId);
    } else {
      updated = [...wishlistItems, item];
    }
    saveWishlist(updated);
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((i) => i.productId === productId);
  };

  const clearWishlist = () => {
    saveWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        toggleWishlist,
        isInWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
