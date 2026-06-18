"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
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
import { collection, onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Simple mock products for instant search demonstration
// Instantly suggested products are loaded from Firestore dynamically

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cartCount, setCartOpen } = useCart();
  const { wishlistItems } = useWishlist();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fetch Categories & Products for suggestions
  useEffect(() => {
    // Categories
    const unsubCats = onSnapshot(collection(db, "categories"), (snapshot) => {
      const cats: any[] = [];
      snapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() });
      });
      // Sort by displayOrder
      cats.sort((a, b) => {
        const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 9999;
        const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 9999;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || "").localeCompare(b.name || "");
      });
      const activeCats = cats.filter(c => c.isActive !== false);
      setDbCategories(activeCats);
    });

    // Products
    const unsubProds = onSnapshot(collection(db, "products"), (snapshot) => {
      const prods: any[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() });
      });
      setDbProducts(prods);
    });

    return () => {
      unsubCats();
      unsubProds();
    };
  }, []);



  // Helper to count products dynamically for a category
  const getProductCount = (categorySlugOrId: string) => {
    if (!categorySlugOrId) return 0;
    const cleanSlug = categorySlugOrId.toLowerCase().trim();
    return dbProducts.filter((p) => {
      const pCat = p.category?.toLowerCase()?.trim();
      return pCat === cleanSlug;
    }).length;
  };

  // Mobile drawer state
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [logoError, setLogoError] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const [mobileActiveAccordion, setMobileActiveAccordion] = useState<string | null>(null);

  // Dynamic Announcement Bar State
  const [announcementSettings, setAnnouncementSettings] = useState<{
    enabled: boolean;
    backgroundColor: string;
    textColor: string;
    announcements: { id: string; message: string; link: string }[];
  } | null>(null);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);

  // Fetch dynamic announcement settings
  useEffect(() => {
    const docRef = doc(db, "siteSettings", "announcementBar");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let list = data.announcements ?? [];
        // Backward-compatibility: if legacy fields exist and list is empty
        if (list.length === 0 && data.message) {
          list = [{
            id: "legacy-1",
            message: data.message,
            link: data.link || ""
          }];
        }
        setAnnouncementSettings({
          enabled: data.enabled ?? false,
          backgroundColor: data.backgroundColor ?? "#163a7d",
          textColor: data.textColor ?? "#ffffff",
          announcements: list,
        });
      } else {
        setAnnouncementSettings(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Cycle announcements if multiple items exist
  useEffect(() => {
    if (!announcementSettings || announcementSettings.announcements.length <= 1) {
      setCurrentAnnouncementIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setCurrentAnnouncementIndex((prev) => (prev + 1) % announcementSettings.announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [announcementSettings]);

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

  const getActiveLink = () => {
    if (!announcementSettings || announcementSettings.announcements.length === 0) return null;
    const current = announcementSettings.announcements[currentAnnouncementIndex] || announcementSettings.announcements[0];
    return current?.link || null;
  };

  const renderAnnouncementContent = () => {
    if (!announcementSettings || announcementSettings.announcements.length === 0) return null;
    const current = announcementSettings.announcements[currentAnnouncementIndex] || announcementSettings.announcements[0];
    if (!current) return null;

    return (
      <div className="w-full flex justify-center items-center h-4 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={current.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-center w-full truncate px-4 absolute"
          >
            {current.message}
          </motion.span>
        </AnimatePresence>
      </div>
    );
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
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
      const filtered = dbProducts.filter((p) =>
        (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setSearchResults(filtered.slice(0, 5));
    }
  }, [searchQuery, dbProducts]);

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
      {showAnnouncement && announcementSettings?.enabled && announcementSettings?.announcements && announcementSettings.announcements.length > 0 && (
        <motion.div
          style={{
            backgroundColor: announcementSettings.backgroundColor,
            color: announcementSettings.textColor
          }}
          className="text-xs py-2 overflow-hidden flex items-center justify-center font-medium tracking-wider z-50 select-none"
          initial={{ y: -100, opacity: 0 }}
          animate={showAnnouncement ? { y: 0, opacity: 1 } : { y: -100, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {getActiveLink() ? (
            <Link href={getActiveLink()!} className="w-full flex items-center justify-center hover:opacity-90 transition-opacity">
              {renderAnnouncementContent()}
            </Link>
          ) : (
            renderAnnouncementContent()
          )}
        </motion.div>
      )}      {/* Header */}
      <header className="w-full z-40 sticky top-0 bg-white shadow-sm transition-all duration-300 border-b border-zinc-100">
        {/* Main Header Area */}
        <div className="mobile-header max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[75px] md:min-h-[110px] flex items-center justify-between relative gap-4">

          {/* Left Menu: Hamburger menu for mobile/tablet */}
          <div className="flex-shrink-0 lg:hidden">
            <button
              className="text-dark hover:text-[#0F2F6B] transition-colors p-1 cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Menu"
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Logo Container */}
          <div className="logo-wrapper min-h-[75px] md:min-h-[110px] pt-[10px] pb-[10px]">
            <Link href="/" className="flex items-center justify-center select-none">
              {!logoError ? (
                <Image
                  src="/logo.png"
                  alt="ElanoraGems Luxury Jewellery"
                  width={180}
                  height={90}
                  className="object-contain"
                  priority
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="font-serif text-lg md:text-2xl font-bold tracking-wider text-[#0F2F6B]">
                  Elanora<span className="text-secondary font-medium font-sans">Gems</span>
                </span>
              )}
            </Link>
          </div>

          {/* Center Column: Search Bar (Desktop only) */}
          <div ref={searchContainerRef} className="hidden lg:flex flex-1 justify-center max-w-[620px] relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative shadow-sm hover:shadow-md transition-shadow duration-300 rounded-full">
              <input
                type="text"
                placeholder="Search premium jewellery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                className="w-full pl-6 pr-12 py-3 border border-zinc-200 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-full text-sm outline-none bg-white transition-all text-[#1E1E1E]"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#D4AF37] transition-colors cursor-pointer">
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
                  className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-zinc-150 max-h-80 overflow-y-auto z-50 p-3"
                >
                  {searchResults.length > 0 ? (
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-zinc-400 px-3 py-1.5 uppercase tracking-wider">Suggested Products</div>
                      {searchResults.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => handleSuggestionClick(p.slug)}
                          className="flex items-center gap-3 p-2 hover:bg-accent rounded-xl cursor-pointer transition-colors"
                        >
                          <img src={p.images?.[0] || p.image || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100&q=80"} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-zinc-100" />
                          <div className="flex-1 text-sm font-semibold text-[#1E1E1E] truncate">{p.name}</div>
                          <div className="text-sm font-bold text-secondary">₹{p.price}</div>
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

          {/* Right Column: Actions (Desktop and Mobile) */}
          <div className="header-actions flex items-center gap-3 md:gap-5 shrink-0 z-10">
            {/* Search Toggle for Mobile */}
            <button
              className="lg:hidden text-dark hover:text-[#D4AF37] transition-colors p-1 cursor-pointer"
              onClick={() => setSearchFocused(!searchFocused)}
              aria-label="Search Toggle"
            >
              <Search size={22} />
            </button>

            {/* Profile Link */}
            <Link
              href={user ? "/account" : "/login"}
              className="text-dark hover:text-[#D4AF37] transition-colors p-1 flex items-center justify-center cursor-pointer"
              aria-label="User Account"
            >
              <User size={22} />
            </Link>

            {/* Wishlist Link (Desktop/Tablet only) */}
            <Link
              href="/wishlist"
              className="hidden sm:block text-dark hover:text-[#D4AF37] transition-colors p-1 relative cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart size={22} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-secondary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setCartOpen(true)}
              className="text-dark hover:text-[#D4AF37] transition-colors p-1 relative cursor-pointer"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input Row */}
        {searchFocused && (
          <div className="lg:hidden bg-zinc-50 border-t border-zinc-100 p-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-zinc-200 rounded-full bg-white text-sm outline-none"
                autoFocus
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 cursor-pointer">
                <Search size={18} />
              </button>
            </form>
          </div>
        )}

        {/* Desktop Navigation Bar */}
        <nav className="hidden lg:block border-t border-zinc-100 bg-white relative h-[60px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
            <ul className="flex items-center justify-center gap-10 text-[15px] font-medium tracking-wide text-[#2b2b2b] h-full">

              {/* Shop by Category Dropdown */}
              <li className="group relative py-2 cursor-pointer h-full flex items-center">
                <span className="flex items-center gap-1 hover:text-[#D4AF37] transition-colors relative py-1.5">
                  Shop by Category <ChevronDown size={12} className="text-zinc-400 group-hover:text-[#D4AF37] transition-colors" />
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
                </span>
                <div className="absolute top-full left-0 w-52 bg-white border border-zinc-100 shadow-xl rounded-b-lg p-3 opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                  <ul className="space-y-2 text-xs font-semibold text-zinc-600">
                    {dbCategories.length === 0 ? (
                      <li className="p-2 text-zinc-400 italic text-center">No Categories Available</li>
                    ) : (
                      <>
                        {dbCategories.map((cat) => (
                          <li key={cat.id}>
                            <Link href={`/collections/${cat.slug || cat.id}`} className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors capitalize">
                              {cat.name}
                            </Link>
                          </li>
                        ))}
                        <li className="border-t border-zinc-100 mt-1 pt-1">
                          <Link href="/collections" className="block p-2 text-secondary hover:bg-accent hover:text-primary rounded-md transition-colors font-bold uppercase tracking-wider text-[10px]">
                            View All Categories
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </li>

              {/* Bestseller */}
              <li className="group relative py-2 cursor-pointer h-full flex items-center">
                <span className="flex items-center gap-1 hover:text-[#D4AF37] transition-colors relative py-1.5">
                  Bestseller <ChevronDown size={12} className="text-zinc-400 group-hover:text-[#D4AF37] transition-colors" />
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
                </span>
                <div className="absolute top-full left-0 w-48 bg-white border border-zinc-100 shadow-xl rounded-b-lg p-3 opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                  <ul className="space-y-2 text-xs font-semibold text-zinc-600">
                    <li><Link href="/bestsellers" className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">All Bestsellers</Link></li>
                    {dbCategories.slice(0, 3).map((cat) => (
                      <li key={cat.id}>
                        <Link href={`/collections/${cat.slug || cat.id}?sort=bestseller`} className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">
                          Bestselling {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>

              {/* New Arrival */}
              <li className="h-full flex items-center">
                <Link href="/new-arrivals" className="hover:text-[#D4AF37] transition-colors relative py-1.5 group">
                  New Arrival
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </li>

              {/* Shop By Women */}
              <li className="group relative py-2 cursor-pointer h-full flex items-center">
                <span className="flex items-center gap-1 hover:text-[#D4AF37] transition-colors relative py-1.5">
                  Shop By Women <ChevronDown size={12} className="text-zinc-400 group-hover:text-[#D4AF37] transition-colors" />
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
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
              <li className="group relative py-2 cursor-pointer h-full flex items-center">
                <span className="flex items-center gap-1 hover:text-[#D4AF37] transition-colors relative py-1.5">
                  Shop By Men <ChevronDown size={12} className="text-zinc-400 group-hover:text-[#D4AF37] transition-colors" />
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
                </span>
                <div className="absolute top-full left-0 w-48 bg-white border border-zinc-100 shadow-xl rounded-b-lg p-3 opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                  <ul className="space-y-2 text-xs font-semibold text-zinc-600">
                    {dbCategories.slice(0, 5).map((cat) => (
                      <li key={cat.id}>
                        <Link href={`/collections/${cat.slug || cat.id}?gender=men`} className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">
                          Men {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>

              {/* Shop By Kids */}
              <li className="group relative py-2 cursor-pointer h-full flex items-center">
                <span className="flex items-center gap-1 hover:text-[#D4AF37] transition-colors relative py-1.5">
                  Shop By Kids <ChevronDown size={12} className="text-zinc-400 group-hover:text-[#D4AF37] transition-colors" />
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
                </span>
                <div className="absolute top-full left-0 w-48 bg-white border border-zinc-100 shadow-xl rounded-b-lg p-3 opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                  <ul className="space-y-2 text-xs font-semibold text-zinc-600">
                    {dbCategories.slice(0, 5).map((cat) => (
                      <li key={cat.id}>
                        <Link href={`/collections/${cat.slug || cat.id}?gender=kids`} className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">
                          Kids {cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>

              {/* Explore Elanora */}
              <li className="group relative py-2 cursor-pointer h-full flex items-center">
                <span className="flex items-center gap-1 hover:text-[#D4AF37] transition-colors relative py-1.5">
                  Explore Elanora <ChevronDown size={12} className="text-zinc-400 group-hover:text-[#D4AF37] transition-colors" />
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
                </span>
                <div className="absolute top-full right-0 w-48 bg-white border border-zinc-100 shadow-xl rounded-b-lg p-3 opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                  <ul className="space-y-2 text-xs font-semibold text-zinc-600">
                    <li><Link href="/about" className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">Our Story</Link></li>
                    <li><Link href="/contact" className="block p-2 hover:bg-accent hover:text-primary rounded-md transition-colors">Contact Us</Link></li>
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
                <Link href="/" className="flex items-center select-none" onClick={() => setMobileMenuOpen(false)}>
                  {!logoError ? (
                    <Image
                      src="/logo.png"
                      alt="ElanoraGems Luxury Jewellery"
                      width={150}
                      height={40}
                      className="h-[40px] w-auto object-contain"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <span className="font-serif text-lg font-bold tracking-wider text-primary">
                      Elanora<span className="text-secondary font-medium font-sans">Gems</span>
                    </span>
                  )}
                </Link>
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
                    <div className="pl-2 mt-2 space-y-2.5">
                      {dbCategories.length === 0 ? (
                        <div className="text-xs text-zinc-400 italic py-2">No Categories Available</div>
                      ) : (
                        dbCategories.map((cat) => {
                          const productCount = getProductCount(cat.slug || cat.id);
                          return (
                            <Link
                              key={cat.id}
                              href={`/collections/${cat.slug || cat.id}`}
                              className="flex items-center gap-3 p-2 hover:bg-accent rounded-xl border border-zinc-100/50 hover:border-secondary/20 transition-all"
                            >
                              <img
                                src={cat.imageUrl || cat.image || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100&q=80"}
                                alt={cat.name}
                                className="w-10 h-10 object-cover rounded-lg border border-zinc-150"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-primary uppercase tracking-wide truncate">{cat.name}</div>
                                <div className="text-[9px] text-zinc-400 font-semibold mt-0.5">{productCount} Items</div>
                              </div>
                              <ArrowRight size={12} className="text-zinc-400 animate-pulse" />
                            </Link>
                          );
                        })
                      )}
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
                      <Link href="/bestsellers" className="block py-1.5 hover:text-secondary transition-colors font-medium">All Bestsellers</Link>
                      {dbCategories.slice(0, 3).map((cat) => (
                        <Link key={cat.id} href={`/collections/${cat.slug || cat.id}?sort=bestseller`} className="block py-1.5 hover:text-secondary transition-colors font-medium capitalize">
                          Bestselling {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* New Arrival */}
                <Link href="/new-arrivals" className="block py-2 hover:text-secondary transition-colors font-medium">New Arrival</Link>

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
                      {dbCategories.slice(0, 5).map((cat) => (
                        <Link key={cat.id} href={`/collections/${cat.slug || cat.id}?gender=men`} className="block py-1.5 hover:text-secondary transition-colors font-medium capitalize">
                          Men {cat.name}
                        </Link>
                      ))}
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
                      {dbCategories.slice(0, 5).map((cat) => (
                        <Link key={cat.id} href={`/collections/${cat.slug || cat.id}?gender=kids`} className="block py-1.5 hover:text-secondary transition-colors font-medium capitalize">
                          Kids {cat.name}
                        </Link>
                      ))}
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
                      <Link href="/contact" className="block py-1.5 hover:text-secondary transition-colors">Contact Us</Link>
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
