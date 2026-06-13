"use client";

import React from "react";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";
import { CategorySection } from "@/components/CategorySection";
import { NewArrivals } from "@/components/NewArrivals";
import { Bestsellers } from "@/components/Bestsellers";
import { InfluencerSpotlight } from "@/components/InfluencerSpotlight";
import { OccasionSection } from "@/components/OccasionSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  "name": "ElanoraGems",
  "image": "https://elanoragems.in/logo.png",
  "url": "https://elanoragems.in",
  "telephone": "+919876543210",
  "priceRange": "INR",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Elanora Tower, Bandra West",
    "addressLocality": "Mumbai",
    "addressRegion": "MH",
    "postalCode": "400050",
    "addressCountry": "IN"
  }
};

export default function Home() {
  return (
    <>
      {/* Organization Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      <div className="min-h-screen bg-white flex flex-col justify-between overflow-x-hidden">
        {/* Navigation & Announcement Header */}
        <Header />

        {/* Home Sections Content */}
        <main className="flex-1 w-full">
          {/* Swiper.js Auto-Play Fade Hero Banner */}
          <HeroBanner />

          {/* Categories Horizontal Scroll Section */}
          <CategorySection />

          {/* New Arrivals 4-Column Grid Section */}
          <NewArrivals />

          {/* Bestsellers Tabbed (Women / Men / Kids) Selection Section */}
          <Bestsellers />

          {/* Instagram-Style Horizontal Reel Slider Section */}
          <InfluencerSpotlight />

          {/* Lifestyle Occasion Grid Section */}
          <OccasionSection />

          {/* Testimonials Carousel Section */}
          <TestimonialsSection />

        </main>

        {/* Global Footer & Sliding Cart Drawer */}
        <Footer />
        <CartDrawer />
      </div>
    </>
  );
}
