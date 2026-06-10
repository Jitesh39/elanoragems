"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  ShoppingBag, 
  Star, 
  ChevronRight, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Maximize2, 
  X,
  MessageSquare
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductCard } from "@/components/ProductCard";
import { MOCK_PRODUCTS } from "@/lib/mockData";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Find product by slug
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug) || MOCK_PRODUCTS[0];

  // Gallery States
  const [activeImage, setActiveImage] = useState(product.image);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: "none" });
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  // Selector States
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "One Size");
  const [quantity, setQuantity] = useState(1);

  // Review System States
  const [reviews, setReviews] = useState([
    { id: 1, author: "Aishwarya R.", rating: 5, date: "2026-05-18", comment: "Absolutely stunning! The packaging was so premium, and the silver ring shines so brightly. Recommending to everyone!" },
    { id: 2, author: "Rahul K.", rating: 4, date: "2026-05-24", comment: "Bought this as a gift for my wife. She loves it. The size guide was very accurate." }
  ]);
  const [newAuthor, setNewAuthor] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Update active image when product changes
  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      setSelectedSize(product.sizes?.[0] || "One Size");
      setQuantity(1);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <Header />
        <div className="text-center py-20 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Product Not Found
        </div>
        <Footer />
      </div>
    );
  }

  // Magnifier Zoom Calculation on Hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      display: "block",
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${activeImage})`,
      backgroundSize: "220%"
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: "none" });
  };

  // Add to Cart Trigger
  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      size: selectedSize,
      material: product.material || "Sterling Silver",
      quantity: quantity
    });
  };

  // Buy Now Trigger
  const handleBuyNow = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      size: selectedSize,
      material: product.material || "Sterling Silver",
      quantity: quantity
    });
    router.push("/checkout");
  };

  // Handle Review Submission
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAuthor.trim() === "" || newComment.trim() === "") return;

    const newReview = {
      id: Date.now(),
      author: newAuthor,
      rating: newRating,
      date: new Date().toISOString().split("T")[0],
      comment: newComment
    };

    setReviews([newReview, ...reviews]);
    setNewAuthor("");
    setNewComment("");
    setNewRating(5);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 4000);
  };

  // Filter Related Products
  const relatedProducts = MOCK_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  // SEO Product Schema
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": [product.image, product.hoverImage].filter(Boolean),
    "description": product.description,
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "url": `https://elanoragems.com/product/${product.slug}`,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": "2027-12-31",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": reviews.length + 10
    }
  };

  return (
    <>
      {/* Dynamic structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <div className="min-h-screen bg-white flex flex-col justify-between">
        <Header />

        {/* Main Product Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-8 overflow-x-auto whitespace-nowrap py-1">
            <Link href="/" className="hover:text-secondary uppercase">Home</Link>
            <ChevronRight size={12} />
            <Link href="/collections" className="hover:text-secondary uppercase">Shop</Link>
            <ChevronRight size={12} />
            <span className="text-zinc-500 uppercase">{product.category}</span>
            <ChevronRight size={12} />
            <span className="text-primary truncate uppercase max-w-[200px]">{product.name}</span>
          </nav>

          {/* Product Grid Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
            
            {/* Left: Interactive Image Gallery (5 cols) */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Main Photo Container */}
              <div 
                className="relative aspect-square w-full rounded-2xl overflow-hidden border border-zinc-100 bg-accent/20 cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {/* Hover zoom magnifier layer */}
                <div 
                  className="absolute inset-0 pointer-events-none z-10 border border-secondary/10" 
                  style={{ 
                    ...zoomStyle, 
                    backgroundRepeat: "no-repeat"
                  }} 
                />

                {/* Main Image */}
                <img 
                  src={activeImage} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />

                {/* Lightbox Trigger Icon */}
                <button
                  onClick={() => setFullscreenOpen(true)}
                  className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-zinc-600 hover:text-secondary transition-colors z-20 cursor-pointer"
                  aria-label="Fullscreen view"
                >
                  <Maximize2 size={16} />
                </button>
              </div>

              {/* Thumbnails Row */}
              <div className="flex gap-3 overflow-x-auto pb-1">
                {[product.image, product.hoverImage].filter(Boolean).map((img, index) => {
                  const isActive = activeImage === img;
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveImage(img!)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border bg-accent/20 transition-all ${
                        isActive ? "border-secondary scale-[0.98] ring-1 ring-secondary" : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Right: Product Details Panel (7 cols) */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div className="space-y-5">
                
                {/* Meta details */}
                <div className="space-y-1">
                  <span className="text-secondary text-xs font-bold uppercase tracking-widest">{product.material || "Premium Silver"}</span>
                  <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-primary leading-tight">
                    {product.name}
                  </h1>
                </div>

                {/* Ratings & Price */}
                <div className="flex flex-wrap items-center gap-4 border-b border-zinc-100 pb-4">
                  <div className="flex items-center gap-1">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          className={i < Math.floor(product.rating) ? "fill-amber-400" : "text-zinc-200"} 
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-zinc-500">
                      {product.rating} ({reviews.length} Reviews)
                    </span>
                  </div>

                  <div className="h-4 w-[1px] bg-zinc-200" />

                  <div className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                    In Stock & Ready to Ship
                  </div>
                </div>

                {/* Price Display */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-primary">₹{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-lg text-zinc-400 line-through font-medium">₹{product.originalPrice}</span>
                    )}
                    {product.originalPrice && (
                      <span className="text-sm font-bold text-secondary">
                        ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF)
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 font-bold">Price inclusive of all taxes. Free shipping on orders above ₹999.</p>
                </div>

                {/* Product Description */}
                <p className="text-sm text-zinc-600 leading-relaxed normal-case">
                  {product.description}
                </p>

                {/* Size Selector */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      <span>Select Size</span>
                      <a href="#" className="text-secondary hover:underline text-[10px]">Size Guide</a>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {product.sizes.map((size) => {
                        const isSelected = selectedSize === size;
                        return (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 border rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isSelected 
                                ? "border-primary bg-primary text-white shadow-sm" 
                                : "border-zinc-200 hover:border-zinc-400 text-zinc-600"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="space-y-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block">Quantity</span>
                  <div className="flex items-center border border-zinc-200 rounded-lg w-32 justify-between p-1 bg-white">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded hover:bg-zinc-50 flex items-center justify-center font-bold text-zinc-500"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-dark">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded hover:bg-zinc-50 flex items-center justify-center font-bold text-zinc-500"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>

              {/* Action Buttons Panel */}
              <div className="space-y-4 pt-8 lg:pt-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Add To Cart */}
                  <button
                    onClick={handleAddToCart}
                    className="py-4 bg-white border border-primary text-primary hover:bg-zinc-50 font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ShoppingBag size={16} />
                    Add To Cart
                  </button>

                  {/* Buy Now */}
                  <button
                    onClick={handleBuyNow}
                    className="py-4 bg-primary hover:bg-primary-hover text-white font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    Buy It Now
                  </button>
                </div>

                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    image: product.image
                  })}
                  className="w-full py-3 bg-accent text-zinc-700 hover:text-secondary rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Heart size={14} className={isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""} />
                  {isInWishlist(product.id) ? "Remove From Wishlist" : "Add To Wishlist"}
                </button>

                {/* Assurances Banner */}
                <div className="grid grid-cols-3 gap-3 bg-zinc-50 border border-zinc-100 rounded-xl p-3.5 text-center text-[9px] font-bold text-zinc-500 uppercase tracking-wide">
                  <div className="flex flex-col items-center gap-1.5">
                    <Truck size={16} className="text-secondary" />
                    <span>Free Shipping &gt; ₹999</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 border-x border-zinc-200 px-1">
                    <RotateCcw size={16} className="text-secondary" />
                    <span>14 Days Returns</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <ShieldCheck size={16} className="text-secondary" />
                    <span>100% Certified Silver</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Technical Specifications Tab Panel */}
          <section className="mb-16 border-t border-zinc-100 pt-10">
            <h3 className="font-serif text-xl font-bold text-primary mb-6">Specifications &amp; Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-zinc-600 bg-accent/40 rounded-2xl p-6 md:p-8">
              
              <div className="space-y-4">
                <div className="flex justify-between border-b border-zinc-200/50 pb-2">
                  <span className="font-bold text-zinc-400 uppercase text-xs">Metal Finish</span>
                  <span className="font-semibold text-primary">{product.material || "Sterling Silver"}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200/50 pb-2">
                  <span className="font-bold text-zinc-400 uppercase text-xs">Stone details</span>
                  <span className="font-semibold text-primary">High-Grade Swiss Cubic Zirconia</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200/50 pb-2">
                  <span className="font-bold text-zinc-400 uppercase text-xs">Category type</span>
                  <span className="font-semibold text-primary capitalize">{product.category}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between border-b border-zinc-200/50 pb-2">
                  <span className="font-bold text-zinc-400 uppercase text-xs">Purity Certify</span>
                  <span className="font-semibold text-primary">BIS Hallmarked Or Equivalent</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200/50 pb-2">
                  <span className="font-bold text-zinc-400 uppercase text-xs">Weight (average)</span>
                  <span className="font-semibold text-primary">4.20 Grams</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200/50 pb-2">
                  <span className="font-bold text-zinc-400 uppercase text-xs">Care instructions</span>
                  <span className="font-semibold text-primary">Store in airtight pouch, avoid water</span>
                </div>
              </div>

            </div>
          </section>

          {/* Reviews Rating Center */}
          <section className="mb-16 border-t border-zinc-100 pt-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Write Review Form (5 cols) */}
              <div className="lg:col-span-5 bg-zinc-50 border border-zinc-100 rounded-2xl p-6 h-fit">
                <h4 className="font-serif text-lg font-bold text-primary mb-4">Write a Review</h4>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Aditi Sharma"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs outline-none focus:border-secondary transition-all"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Rating Star</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star size={20} className={star <= newRating ? "fill-amber-400" : "text-zinc-200"} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Your Comment</label>
                    <textarea
                      placeholder="Share details of your experience with ElanoraGems..."
                      rows={4}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs outline-none focus:border-secondary transition-all resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-[10px] font-bold uppercase tracking-widest rounded-lg cursor-pointer"
                  >
                    Submit Review
                  </button>

                  {reviewSuccess && (
                    <p className="text-green-700 text-xs font-semibold text-center mt-2">
                      🎉 Review submitted successfully! Thank you for your review.
                    </p>
                  )}
                </form>
              </div>

              {/* Reviews List Panel (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <h4 className="font-serif text-lg font-bold text-primary flex items-center gap-1.5 mb-6">
                  <MessageSquare size={18} className="text-secondary" /> Customer Feedback
                </h4>

                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 border border-zinc-100 rounded-2xl bg-white space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-dark">{rev.author}</span>
                        <span className="text-[10px] text-zinc-400 font-semibold">{rev.date}</span>
                      </div>
                      
                      {/* stars */}
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={10} 
                            className={i < rev.rating ? "fill-amber-400" : "text-zinc-200"} 
                          />
                        ))}
                      </div>

                      <p className="text-xs text-zinc-600 leading-relaxed normal-case">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <section className="border-t border-zinc-100 pt-10">
              <h3 className="font-serif text-xl font-bold text-primary mb-6 text-center md:text-left">You May Also Love</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

        </main>

        <Footer />
        <CartDrawer />
      </div>

      {/* Fullscreen Image Lightbox Modal */}
      <AnimatePresence>
        {fullscreenOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4"
          >
            {/* Close trigger overlay */}
            <div className="absolute inset-0" onClick={() => setFullscreenOpen(false)} />

            {/* Modal Body */}
            <div className="relative max-w-4xl w-full h-full max-h-[80vh] flex items-center justify-center z-10">
              <img 
                src={activeImage} 
                alt={product.name} 
                className="max-w-full max-h-full object-contain rounded-lg"
              />

              {/* Close Button */}
              <button
                onClick={() => setFullscreenOpen(false)}
                className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close fullscreen"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
