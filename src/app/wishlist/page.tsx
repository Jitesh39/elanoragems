"use client";

import React from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full">
        <div className="border-b border-zinc-200 pb-5 mb-8">
          <span className="text-secondary text-xs font-bold uppercase tracking-widest">My Account</span>
          <h1 className="font-serif text-3xl font-bold text-primary mt-1">My Wishlist</h1>
          <p className="text-zinc-500 text-xs sm:text-sm mt-1">Your hand-selected premium jewelry items saved for later.</p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <Heart size={48} className="text-zinc-200 mx-auto" />
            <p className="font-serif text-sm font-semibold text-zinc-400">Your wishlist is empty</p>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto mb-6">Explore our catalog and click the heart icon on any jewelry pieces you love.</p>
            <Link href="/collections" className="btn-premium btn-primary text-xs">Start Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {wishlistItems.map((item) => (
              <div key={item.productId} className="border border-zinc-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all relative flex flex-col justify-between group bg-white">
                
                {/* Remove heart toggle */}
                <button
                  onClick={() => toggleWishlist(item)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/95 flex items-center justify-center text-red-500 hover:scale-105 transition-transform shadow"
                  aria-label="Remove from Wishlist"
                >
                  <Trash2 size={14} />
                </button>

                <div className="aspect-square bg-zinc-50 overflow-hidden relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>

                <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-dark hover:text-secondary transition-colors line-clamp-1 leading-tight">{item.name}</h3>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-xs font-bold text-primary">₹{item.price}</span>
                      {item.originalPrice && (
                        <span className="text-[10px] text-zinc-400 line-through">₹{item.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart({
                      productId: item.productId,
                      name: item.name,
                      price: item.price,
                      originalPrice: item.originalPrice,
                      image: item.image,
                      material: "Sterling Silver"
                    })}
                    className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-[9px] font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <ShoppingBag size={12} className="text-secondary" /> Add To Cart
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
