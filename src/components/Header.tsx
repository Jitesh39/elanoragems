"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Percent,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

// Simple mock products for instant search demonstration
const SEARCH_PRODUCTS = [
  { id: "1", name: "Premium Sterling Silver Ring", slug: "premium-sterling-silver-ring", category: "rings", price: 1299, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&q=80" },
  { id: "2", name: "Royal Gold Plated Necklace", slug: "royal-gold-plated-necklace", category: "necklaces", price: 2499, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&q=80" },
  { id: "3", name: "Elegant Rose Gold Bracelet", slug: "elegant-rose-gold-bracelet", category: "bracelets", price: 1899, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&q=80" },
  { id: "4", name: "Oxidized Silver Jhumkas", slug: "oxidized-silver-jhumkas", category: "earrings", price: 899, image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=300&q=80" },
  { id: "5", name: "Solitaire Engagement Ring", slug: "solitaire-engagement-ring", category: "rings", price: 4999, image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=300&q=80" }
];

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cartCount, setCartOpen } = useCart();
  const { wishlistItems } = useWishlist();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof SEARCH_PRODUCTS>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Account dropdown state
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  // Mobile drawer state
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const [mobileActiveAccordion, setMobileActiveAccordion] = useState<string | null>(null);
  // Announcement bar slide state
  const announcements = ["✨ Free Shipping on Orders Above ₹999", "🎁 Flat 10% Off! Use Coupon Code: ELANORA10", "💎 Luxury Velvet Gift Box Free with Every Order"];
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  // Hide announcement on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setShowAnnouncement(false);
      } else {
        setShowAnnouncement(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on page changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle Search Query filtering
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
    } else {
      const filtered = SEARCH_PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      router.push(`/collections?search=${encodeURIComponent(searchQuery)}`);
      setSearchFocused(false);
    }
  };

  const handleSuggestionClick = (slug: string) => {
    setSearchQuery("");
    setSearchFocused(false);
    router.push(`/product/${slug}`);
  };

  // Accordion toggle for mobile menu
  const toggleMobileAccordion = (title: string) => {
    setMobileActiveAccordion(mobileActiveAccordion === title ? null : title);
  };

  return (
    <>
      {/* Announcement Bar */}
      <motion.div
        className="bg-primary text-white text-xs py-2 overflow-hidden flex items-center justify-center font-medium tracking-wider z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={showAnnouncement ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {announcements[currentAnnouncementIndex]}
      </motion.div>

      {/* Header */}
      <header className="w-full z-40 sticky top-0 bg-white shadow-sm transition-all duration-300">
        {/* Main Header Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">

          {/* Left: Mobile Menu Toggle & Logo */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-dark hover:text-secondary transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Menu"
            >
              <Menu size={24} />
            </button>

            <Link href="/" className="flex items-center gap-1 select-none">
              <span className="font-serif text-2xl font-bold tracking-wider text-primary">
                Elanora<span className="text-secondary font-medium font-sans">Gems</span>
              </span>
            </Link>
          </div>

          {/* Center: Search Bar */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-lg relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Search premium jewellery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full pl-4 pr-10 py-2 border border-zinc-200 rounded-full text-sm outline-none focus:border-secondary transition-all"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-secondary">
                <Search size={18} />
              </button>
            </form>

            {/* Search Suggestion Dropdown */}
            <AnimatePresence>
              {searchFocused && (searchQuery.trim() !== "" || searchResults.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-zinc-100 max-h-80 overflow-y-auto z-50 p-2"
                >
                  {searchResults.length > 0 ? (
                    <div>
                      <div className="text-xs font-semibold text-zinc-400 px-3 py-1 uppercase tracking-wider">Suggested Products</div>
                      {searchResults.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSuggestionClick(p.slug)}
                          className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer transition-colors"
                        >
                          <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-md border border-zinc-100" />
                          <div className="flex-1 text-sm font-medium text-dark truncate">{p.name}</div>
                          <div className="text-sm font-semibold text-secondary">₹{p.price}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-zinc-500">
                      No results for &quot;{searchQuery}&quot;
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Search Toggle for Mobile */}
            <button className="md:hidden text-dark hover:text-secondary transition-colors" onClick={() => setSearchFocused(!searchFocused)}>
              <Search size={22} />
            </button>

            {/* Profile Dropdown */}
            <div ref={accountRef} className="relative">
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="text-dark hover:text-secondary transition-colors flex items-center gap-1 py-1"
                aria-label="User Account"
              >
                <User size={22} />
                <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider text-zinc-600 max-w-[80px] truncate">
                  {user ? user.displayName.split(" ")[0] : "Login"}
                </span>
              </button>

              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-zinc-100 rounded-md shadow-lg py-1 z-50 text-sm"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-zinc-100 font-medium text-dark">
                          Hi, {user.displayName}
                        </div>
                        {user.role === "admin" && (
                          <Link href="/admin" className="block px-4 py-2 text-primary hover:bg-accent hover:text-secondary font-medium">
                            Admin Dashboard
                          </Link>
                        )}
                        <Link href="/account" className="block px-4 py-2 text-zinc-700 hover:bg-accent">
                          My Account
                        </Link>
                        <Link href="/account?tab=orders" className="block px-4 py-2 text-zinc-700 hover:bg-accent">
                          My Orders
                        </Link>
                        <Link href="/wishlist" className="block px-4 py-2 text-zinc-700 hover:bg-accent">
                          My Wishlist
                        </Link>
                        <button
                          onClick={async () => {
                            await logout();
                            setAccountOpen(false);
                          }}
                          className="w-full text-left block px-4 py-2 text-red-600 hover:bg-red-50 border-t border-zinc-100"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" className="block px-4 py-2 text-zinc-700 hover:bg-accent font-medium">
                          Log In
                        </Link>
                        <Link href="/login?tab=signup" className="block px-4 py-2 text-zinc-700 hover:bg-accent">
                          Sign Up
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist Link */}
            <Link href="/wishlist" className="text-dark hover:text-secondary transition-colors relative py-1" aria-label="Wishlist">
              <Heart size={22} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-secondary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setCartOpen(true)}
              className="text-dark hover:text-secondary transition-colors relative py-1 cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input Row */}
        {searchFocused && (
          <div className="md:hidden bg-zinc-50 border-t border-zinc-100 p-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-zinc-200 rounded-full bg-white text-sm outline-none"
                autoFocus
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                <Search size={18} />
              </button>
            </form>
          </div>
        )}

        {/* Desktop Mega Navigation Bar */}
        <nav className="hidden lg:block border-t border-zinc-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex items-center justify-center gap-10 text-[16px] font-medium tracking-normal text-[#2b2b2b] py-3 bg-white">

              {/* Shop by Category Mega Menu */}
              <li className="group relative py-2 cursor-pointer">
                <span className="flex items-center gap-1 hover:text-secondary transition-colors">
                  Shop by Category <ChevronDown size={12} className="text-zinc-400 group-hover:text-secondary transition-colors" />
                </span>
                {/* Mega Menu Drawer */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-[800px] bg-white border border-zinc-100 shadow-2xl rounded-b-lg p-6 grid grid-cols-4 gap-6 opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                  <div className="col-span-1">
                    <h4 className="font-serif text-secondary text-xs font-bold tracking-widest border-b border-zinc-100 pb-2 mb-3">Popular Categories</h4>
                    <ul className="space-y-2 text-xs font-medium text-zinc-600 capitalize">
                      <li><Link href="/collections?category=rings" className="hover:text-primary transition-colors">Rings</Link></li>
                      <li><Link href="/collections?category=earrings" className="hover:text-primary transition-colors">Earrings</Link></li>
                      <li><Link href="/collections?category=necklaces" className="hover:text-primary transition-colors">Necklaces</Link></li>
                      <li><Link href="/collections?category=bracelets" className="hover:text-primary transition-colors">Bracelets</Link></li>
                      <li><Link href="/collections?category=anklets" className="hover:text-primary transition-colors">Anklets</Link></li>
                    </ul>
                  </div>
                  <div className="col-span-1">
                    <h4 className="font-serif text-secondary text-xs font-bold tracking-widest border-b border-zinc-100 pb-2 mb-3">Speciality Products</h4>
                    <ul className="space-y-2 text-xs font-medium text-zinc-600 capitalize">
                      <li><Link href="/collections?category=pendants" className="hover:text-primary transition-colors">Pendants</Link></li>
                      <li><Link href="/collections?category=toe-rings" className="hover:text-primary transition-colors">Toe Rings</Link></li>
                      <li><Link href="/collections?category=kada" className="hover:text-primary transition-colors">Kada</Link></li>
                    </ul>
                  </div>
                  <div className="col-span-1">
                    <h4 className="font-serif text-secondary text-xs font-bold tracking-widest border-b border-zinc-100 pb-2 mb-3">Occasions</h4>
                    <ul className="space-y-2 text-xs font-medium text-zinc-600 capitalize">
                      <li><Link href="/collections?occasion=wedding" className="hover:text-primary transition-colors">Wedding Wear</Link></li>
                      <li><Link href="/collections?occasion=festive" className="hover:text-primary transition-colors">Festive Wear</Link></li>
                      <li><Link href="/collections?occasion=office" className="hover:text-primary transition-colors">Office Wear</Link></li>
                      <li><Link href="/collections?occasion=party" className="hover:text-primary transition-colors">Party wear</Link></li>
                    </ul>
                  </div>
                  <div className="col-span-1 bg-accent p-4 rounded-lg flex flex-col justify-between">
                    <div>
                      <h5 className="font-serif text-primary text-sm font-bold">Bridal Collection</h5>
                      <p className="text-[10px] text-zinc-500 normal-case mt-1">Exquisite handcrafted silver masterworks styled for your special day.</p>
                    </div>
                    <Link href="/collections?occasion=wedding" className="text-secondary text-xs font-bold flex items-center gap-1 mt-4 hover:underline">
                      Shop Now <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </li>

              {/* Bestseller */}
              <li className="group relative py-2 cursor-pointer">
                <span className="flex items-center gap-1 hover:text-secondary transition-colors">
                  Bestseller <ChevronDown size={12} className="text-zinc-400 group-hover:text-secondary transition-colors" />
                </span>
                <div className="absolute top-full left-0 w-48 bg-white border border-zinc-100 shadow-xl rounded-b-lg p-3 opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                  <ul className="space-y-2 text-xs font-semibold text-zinc-600">
                    <li><Link href="/bestsellers" className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">All Bestsellers</Link></li>
                    <li><Link href="/collections?category=rings&sort=bestseller" className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">Bestselling Rings</Link></li>
                    <li><Link href="/collections?category=earrings&sort=bestseller" className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">Bestselling Earrings</Link></li>
                    <li><Link href="/collections?category=necklaces&sort=bestseller" className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">Bestselling Necklaces</Link></li>
                  </ul>
                </div>
              </li>

              {/* New Arrival */}
              <li className="py-2">
                <Link href="/new-arrivals" className="hover:text-secondary transition-colors">
                  New Arrival
                </Link>
              </li>

              {/* Shop By Women */}
              <li className="group relative py-2 cursor-pointer">
                <span className="flex items-center gap-1 hover:text-secondary transition-colors">
                  Shop By Women <ChevronDown size={12} className="text-zinc-400 group-hover:text-secondary transition-colors" />
                </span>
                <div className="absolute top-full left-0 w-48 bg-white border border-zinc-100 shadow-xl rounded-b-lg p-3 opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                  <ul className="space-y-2 text-xs font-semibold text-zinc-600">
                    <li><Link href="/collections?color=sterling-silver" className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">Sterling Silver</Link></li>
                    <li><Link href="/collections?color=gold-plated" className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">Gold Plated</Link></li>
                    <li><Link href="/collections?color=rose-gold" className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">Rose Gold</Link></li>
                    <li><Link href="/collections?color=oxidised-silver" className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">Oxidised Silver</Link></li>
                  </ul>
                </div>
              </li>

              {/* Shop By Men */}
              <li className="group relative py-2 cursor-pointer">
                <span className="flex items-center gap-1 hover:text-secondary transition-colors">
                  Shop By Men <ChevronDown size={12} className="text-zinc-400 group-hover:text-secondary transition-colors" />
                </span>
                <div className="absolute top-full left-0 w-48 bg-white border border-zinc-100 shadow-xl rounded-b-lg p-3 opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                  <ul className="space-y-2 text-xs font-semibold text-zinc-600">
                    <li><Link href="/collections?gender=men&category=rings" className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">Men Rings</Link></li>
                    <li><Link href="/collections?gender=men&category=kada" className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">Men Kada</Link></li>
                    <li><Link href="/collections?gender=men&category=necklaces" className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">Men Chains</Link></li>
                  </ul>
                </div>
              </li>

              {/* Shop By Kids */}
              <li className="group relative py-2 cursor-pointer">
                <span className="flex items-center gap-1 hover:text-secondary transition-colors">
                  Shop By Kids <ChevronDown size={12} className="text-zinc-400 group-hover:text-secondary transition-colors" />
                </span>
                <div className="absolute top-full left-0 w-48 bg-white border border-zinc-100 shadow-xl rounded-b-lg p-3 opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                  <ul className="space-y-2 text-xs font-semibold text-zinc-600">
                    <li><Link href="/collections?gender=kids&category=earrings" className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">Kids Earrings</Link></li>
                    <li><Link href="/collections?gender=kids&category=bracelets" className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">Kids Bracelets</Link></li>
                    <li><Link href="/collections?gender=kids&category=pendants" className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">Kids Pendants</Link></li>
                  </ul>
                </div>
              </li>

              {/* Explore Elanora */}
              <li className="group relative py-2 cursor-pointer">
                <span className="flex items-center gap-1 hover:text-secondary transition-colors">
                  Explore Elanora <ChevronDown size={12} className="text-zinc-400 group-hover:text-secondary transition-colors" />
                </span>
                <div className="absolute top-full right-0 w-48 bg-white border border-zinc-100 shadow-xl rounded-b-lg p-3 opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                  <ul className="space-y-2 text-xs font-semibold text-zinc-600">
                    <li><Link href="/about" className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">Our Story</Link></li>
                    <li><Link href="/craftsmanship" className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">Craftsmanship</Link></li>
                    <li><Link href="/virtual-try-on" className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">Virtual Try-On</Link></li>
                    <li><Link href="/stores" className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">Store Locator</Link></li>
                  </ul>
                </div>
              </li>

            </ul>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Navigation Backdrop & Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />
            {/* Menu Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 left-0 max-w-xs w-full bg-white z-50 shadow-2xl flex flex-col p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
                <span className="font-serif text-lg font-bold tracking-wider text-primary">
                  Elanora<span className="text-secondary font-medium font-sans">Gems</span>
                </span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-dark hover:text-secondary">
                  <X size={24} />
                </button>
              </div>

              {/* Navigation list */}
              <div className="flex-1 space-y-4 text-[16px] font-medium text-[#2b2b2b] normal-case">
                {/* Shop by Category Accordion */}
                <div>
                  <button
                    onClick={() => toggleMobileAccordion("category")}
                    className="w-full flex items-center justify-between py-2 text-left hover:text-secondary transition-colors"
                  >
                    <span>Shop by Category</span>
                    <ChevronDown size={16} className={`transform transition-transform text-zinc-400 ${mobileActiveAccordion === "category" ? "rotate-180" : ""}`} />
                  </button>
                  {mobileActiveAccordion === "category" && (
                    <div className="pl-4 mt-1 space-y-1 text-sm font-normal text-zinc-500 capitalize">
                      <Link href="/collections?category=rings" className="block py-1.5 hover:text-secondary transition-colors">Rings</Link>
                      <Link href="/collections?category=earrings" className="block py-1.5 hover:text-secondary transition-colors">Earrings</Link>
                      <Link href="/collections?category=necklaces" className="block py-1.5 hover:text-secondary transition-colors">Necklaces</Link>
                      <Link href="/collections?category=bracelets" className="block py-1.5 hover:text-secondary transition-colors">Bracelets</Link>
                      <Link href="/collections?category=anklets" className="block py-1.5 hover:text-secondary transition-colors">Anklets</Link>
                      <Link href="/collections?category=pendants" className="block py-1.5 hover:text-secondary transition-colors">Pendants</Link>
                      <Link href="/collections?category=toe-rings" className="block py-1.5 hover:text-secondary transition-colors">Toe Rings</Link>
                      <Link href="/collections?category=kada" className="block py-1.5 hover:text-secondary transition-colors">Kada</Link>
                      <Link href="/collections?category=gift-sets" className="block py-1.5 hover:text-secondary transition-colors">Gift Sets</Link>
                    </div>
                  )}
                </div>

                {/* Bestseller Accordion */}
                <div>
                  <button
                    onClick={() => toggleMobileAccordion("bestseller")}
                    className="w-full flex items-center justify-between py-2 text-left hover:text-secondary transition-colors"
                  >
                    <span>Bestseller</span>
                    <ChevronDown size={16} className={`transform transition-transform text-zinc-400 ${mobileActiveAccordion === "bestseller" ? "rotate-180" : ""}`} />
                  </button>
                  {mobileActiveAccordion === "bestseller" && (
                    <div className="pl-4 mt-1 space-y-1 text-sm font-normal text-zinc-500">
                      <Link href="/bestsellers" className="block py-1.5 hover:text-secondary transition-colors">All Bestsellers</Link>
                      <Link href="/collections?category=rings&sort=bestseller" className="block py-1.5 hover:text-secondary transition-colors">Bestselling Rings</Link>
                      <Link href="/collections?category=earrings&sort=bestseller" className="block py-1.5 hover:text-secondary transition-colors">Bestselling Earrings</Link>
                      <Link href="/collections?category=necklaces&sort=bestseller" className="block py-1.5 hover:text-secondary transition-colors">Bestselling Necklaces</Link>
                    </div>
                  )}
                </div>

                {/* New Arrival */}
                <Link href="/new-arrivals" className="block py-2 hover:text-secondary transition-colors">New Arrival</Link>

                {/* Shop By Women Accordion */}
                <div>
                  <button
                    onClick={() => toggleMobileAccordion("women")}
                    className="w-full flex items-center justify-between py-2 text-left hover:text-secondary transition-colors"
                  >
                    <span>Shop By Women</span>
                    <ChevronDown size={16} className={`transform transition-transform text-zinc-400 ${mobileActiveAccordion === "women" ? "rotate-180" : ""}`} />
                  </button>
                  {mobileActiveAccordion === "women" && (
                    <div className="pl-4 mt-1 space-y-1 text-sm font-normal text-zinc-500">
                      <Link href="/collections?color=sterling-silver" className="block py-1.5 hover:text-secondary transition-colors">Sterling Silver</Link>
                      <Link href="/collections?color=gold-plated" className="block py-1.5 hover:text-secondary transition-colors">Gold Plated</Link>
                      <Link href="/collections?color=rose-gold" className="block py-1.5 hover:text-secondary transition-colors">Rose Gold</Link>
                      <Link href="/collections?color=oxidised-silver" className="block py-1.5 hover:text-secondary transition-colors">Oxidised Silver</Link>
                    </div>
                  )}
                </div>

                {/* Shop By Men Accordion */}
                <div>
                  <button
                    onClick={() => toggleMobileAccordion("men")}
                    className="w-full flex items-center justify-between py-2 text-left hover:text-secondary transition-colors"
                  >
                    <span>Shop By Men</span>
                    <ChevronDown size={16} className={`transform transition-transform text-zinc-400 ${mobileActiveAccordion === "men" ? "rotate-180" : ""}`} />
                  </button>
                  {mobileActiveAccordion === "men" && (
                    <div className="pl-4 mt-1 space-y-1 text-sm font-normal text-zinc-500">
                      <Link href="/collections?gender=men&category=rings" className="block py-1.5 hover:text-secondary transition-colors">Men Rings</Link>
                      <Link href="/collections?gender=men&category=kada" className="block py-1.5 hover:text-secondary transition-colors">Men Kada</Link>
                      <Link href="/collections?gender=men&category=necklaces" className="block py-1.5 hover:text-secondary transition-colors">Men Chains</Link>
                    </div>
                  )}
                </div>

                {/* Shop By Kids Accordion */}
                <div>
                  <button
                    onClick={() => toggleMobileAccordion("kids")}
                    className="w-full flex items-center justify-between py-2 text-left hover:text-secondary transition-colors"
                  >
                    <span>Shop By Kids</span>
                    <ChevronDown size={16} className={`transform transition-transform text-zinc-400 ${mobileActiveAccordion === "kids" ? "rotate-180" : ""}`} />
                  </button>
                  {mobileActiveAccordion === "kids" && (
                    <div className="pl-4 mt-1 space-y-1 text-sm font-normal text-zinc-500">
                      <Link href="/collections?gender=kids&category=earrings" className="block py-1.5 hover:text-secondary transition-colors">Kids Earrings</Link>
                      <Link href="/collections?gender=kids&category=bracelets" className="block py-1.5 hover:text-secondary transition-colors">Kids Bracelets</Link>
                      <Link href="/collections?gender=kids&category=pendants" className="block py-1.5 hover:text-secondary transition-colors">Kids Pendants</Link>
                    </div>
                  )}
                </div>

                {/* Divine & Gifting Accordion */}
                <div>
                  <button
                    onClick={() => toggleMobileAccordion("gifting")}
                    className="w-full flex items-center justify-between py-2 text-left hover:text-secondary transition-colors"
                  >
                    <span>Divine & Gifting</span>
                    <ChevronDown size={16} className={`transform transition-transform text-zinc-400 ${mobileActiveAccordion === "gifting" ? "rotate-180" : ""}`} />
                  </button>
                  {mobileActiveAccordion === "gifting" && (
                    <div className="pl-4 mt-1 space-y-1 text-sm font-normal text-zinc-500">
                      <Link href="/collections?category=gift-sets" className="block py-1.5 hover:text-secondary transition-colors">Gift Sets</Link>
                      <Link href="/collections?price=999" className="block py-1.5 hover:text-secondary transition-colors">Gifts under ₹999</Link>
                      <Link href="/collections?price=1999" className="block py-1.5 hover:text-secondary transition-colors">Gifts under ₹1999</Link>
                      <Link href="/collections?price=2999" className="block py-1.5 hover:text-secondary transition-colors">Gifts under ₹2999</Link>
                    </div>
                  )}
                </div>

                {/* Explore Elanora Accordion */}
                <div>
                  <button
                    onClick={() => toggleMobileAccordion("explore")}
                    className="w-full flex items-center justify-between py-2 text-left hover:text-secondary transition-colors"
                  >
                    <span>Explore Elanora</span>
                    <ChevronDown size={16} className={`transform transition-transform text-zinc-400 ${mobileActiveAccordion === "explore" ? "rotate-180" : ""}`} />
                  </button>
                  {mobileActiveAccordion === "explore" && (
                    <div className="pl-4 mt-1 space-y-1 text-sm font-normal text-zinc-500">
                      <Link href="/about" className="block py-1.5 hover:text-secondary transition-colors">Our Story</Link>
                      <Link href="/craftsmanship" className="block py-1.5 hover:text-secondary transition-colors">Craftsmanship</Link>
                      <Link href="/virtual-try-on" className="block py-1.5 hover:text-secondary transition-colors">Virtual Try-On</Link>
                      <Link href="/stores" className="block py-1.5 hover:text-secondary transition-colors">Store Locator</Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Profile Footer */}
              <div className="border-t border-zinc-100 pt-6 mt-6">
                {user ? (
                  <div className="space-y-3">
                    <div className="text-zinc-600 text-xs font-semibold">Logged in as: {user.displayName}</div>
                    <Link href="/account" className="block py-2 text-sm text-zinc-700 font-semibold hover:text-secondary">My Account</Link>
                    <button
                      onClick={async () => {
                        await logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-center py-2 bg-zinc-100 text-sm text-red-600 font-semibold rounded-md hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="block w-full text-center py-3 bg-primary text-white text-xs font-bold tracking-wider rounded-md hover:bg-primary-hover uppercase transition-colors">
                    Login / Sign Up
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
