"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: string; // unique cart item id (e.g. productId + size)
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  size?: string;
  material?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, "quantity" | "id"> & { quantity?: number }) => void;
  updateQuantity: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // 1. Initial load for guest from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const local = localStorage.getItem("elanora_cart");
      if (local && !user) {
        setCartItems(JSON.parse(local));
      }
      setIsInitialized(true);
    }
  }, [user]);

  // 2. Real-time Firebase Sync when user logged in
  useEffect(() => {
    if (!user) return;

    const cartDocRef = doc(db, "cart", user.uid);
    console.log("Current User:", auth.currentUser);
    console.log("Subscribing (onSnapshot) to collection: cart");
    console.log("UID:", user.uid);
    const unsubscribe = onSnapshot(cartDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCartItems(data.items || []);
      } else {
        // If logged in but no remote cart, push local cart to firebase (merge)
        const local = localStorage.getItem("elanora_cart");
        const initialItems = local ? JSON.parse(local) : [];
        console.log("Current User:", auth.currentUser);
        console.log("Writing collection: cart");
        console.log("UID:", user.uid);
        setDoc(cartDocRef, { items: initialItems });
      }
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Sync to local storage for guests, or push to Firebase for authenticated users
  const saveCart = async (newItems: CartItem[]) => {
    setCartItems(newItems);
    if (typeof window !== "undefined") {
      localStorage.setItem("elanora_cart", JSON.stringify(newItems));
    }
    if (user) {
      try {
        const cartDocRef = doc(db, "cart", user.uid);
        console.log("Current User:", auth.currentUser);
        console.log("Writing collection: cart");
        console.log("UID:", user.uid);
        await setDoc(cartDocRef, { items: newItems });
      } catch (error) {
        console.error("Error saving cart to Firebase:", error);
      }
    }
  };

  const addToCart = (item: Omit<CartItem, "quantity" | "id"> & { quantity?: number }) => {
    const sizeSuffix = item.size ? `-${item.size}` : "";
    const id = `${item.productId}${sizeSuffix}`;
    const qty = item.quantity || 1;

    const existingIndex = cartItems.findIndex((i) => i.id === id);
    let updatedItems = [...cartItems];

    if (existingIndex > -1) {
      updatedItems[existingIndex].quantity += qty;
    } else {
      updatedItems.push({
        ...item,
        id,
        quantity: qty
      });
    }

    saveCart(updatedItems);
    setCartOpen(true); // Open drawer on addition as requested
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    const updatedItems = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: qty } : item
    );
    saveCart(updatedItems);
  };

  const removeFromCart = (id: string) => {
    const updatedItems = cartItems.filter((item) => item.id !== id);
    saveCart(updatedItems);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartOpen,
        setCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
