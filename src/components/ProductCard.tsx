"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  hoverImage?: string;
  rating: number;
  reviewsCount?: number;
  isBestseller?: boolean;
  category: string;
  gender?: "women" | "men" | "kids";
  occasion?: string;
  color?: string;
  description?: string;
  material?: string;
  sizes?: string[];
}

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isLiked = isInWishlist(product.id);
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      size: product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined,
      material: product.material || "Sterling Silver"
    });
  };

  return (
    <div className="relative group bg-white rounded-2xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      
      {/* Product Image Panel */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-accent/20">
        
        {/* Badges Panel */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
          {product.isBestseller && (
            <span className="bg-primary text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-sm tracking-wider">
              Bestseller
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-secondary text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-sm tracking-wider">
              {discountPercent}% Off
            </span>
          )}
        </div>

        {/* Wishlist Heart Action */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/95 hover:bg-white flex items-center justify-center text-zinc-400 hover:text-red-500 shadow transition-colors"
          aria-label="Add to Wishlist"
        >
          <Heart 
            size={16} 
            className={`transition-transform duration-300 ${isLiked ? "fill-red-500 text-red-500 scale-110" : "text-zinc-500 group-hover:scale-105"}`} 
          />
        </button>

        {/* Primary Image */}
        <img 
          src={product.image} 
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${product.hoverImage ? "group-hover:opacity-0" : ""}`}
        />

        {/* Hover Image */}
        {product.hoverImage && (
          <img 
            src={product.hoverImage} 
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-100 group-hover:scale-105"
          />
        )}

        {/* Quick Add To Cart Overlay (Sliding up from bottom on hover) */}
        <div className="absolute inset-x-0 bottom-0 p-3 z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden sm:block">
          <button
            onClick={handleAddToCart}
            className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag size={12} className="text-secondary" />
            Add To Cart
          </button>
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{product.category}</span>
          
          <Link href={`/product/${product.slug}`} className="block mt-1">
            <h3 className="text-xs sm:text-sm font-semibold text-dark hover:text-secondary transition-colors line-clamp-1 leading-tight">
              {product.name}
            </h3>
          </Link>

          {/* Rating Display */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={12} 
                  className={i < Math.floor(product.rating || 5.0) ? "fill-amber-400" : "text-zinc-200"} 
                />
              ))}
            </div>
            <span className="text-[10px] text-zinc-400 font-bold">({product.reviewsCount || 0})</span>
          </div>
        </div>

        {/* Pricing Panel */}
        <div className="flex items-end justify-between mt-4">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-bold text-primary">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-zinc-400 line-through">₹{product.originalPrice}</span>
            )}
          </div>

          {/* Quick Mobile Cart Button */}
          <button
            onClick={handleAddToCart}
            className="sm:hidden w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover shadow-md cursor-pointer"
            aria-label="Add to cart"
          >
            <ShoppingBag size={14} className="text-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ProductCard;
