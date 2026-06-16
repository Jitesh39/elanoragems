import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Award,
  Truck,
  HeartHandshake,
  Compass,
  ArrowRight,
  Gem
} from "lucide-react";

export const metadata = {
  title: "About Us | ElanoraGems",
  description: "Learn the story behind ElanoraGems and our passion for crafting timeless, elegant, and premium quality jewellery for modern lifestyles.",
  keywords: "about us, jewellery story, premium silver jewellery, gold plated ornaments, handcrafted designs, ElanoraGems",
};

export default function AboutPage() {
  const missionItems = [
    {
      icon: Award,
      title: "Quality Craftsmanship",
      desc: "Every piece of ElanoraGems jewellery is hand-finished by master artisans, ensuring attention to detail and a high-definition premium polish."
    },
    {
      icon: Gem,
      title: "Premium Materials",
      desc: "We use only certified 92.5% sterling silver and thick 18K gold plating. Our jewellery is hypoallergenic, nickel-free, and built to last."
    },
    {
      icon: HeartHandshake,
      title: "Customer Satisfaction",
      desc: "Our priority is providing an unmatched luxury experience. We offer customized guidance and reliable support at every step of your journey."
    },
    {
      icon: ShieldCheck,
      title: "Trusted Shopping Experience",
      desc: "Enjoy safe payments, authentic materials certificates, and a transparent return policy designed for peace of mind."
    }
  ];

  const features = [
    {
      title: "Premium Quality",
      desc: "Rigorous 5-point quality checks ensure each gemstone setting, clasp, and polish is perfect before it leaves our atelier."
    },
    {
      title: "Secure Payments",
      desc: "Fully encrypted transaction gateways (Razorpay/Stripe) and Cash on Delivery option to keep your shopping 100% secure."
    },
    {
      title: "Fast Shipping",
      desc: "Express shipping options with top tier logistics partners delivering across India in 3-5 business days."
    },
    {
      title: "Customer Support",
      desc: "Dedicated support specialists available online and via email to assist with sizing, orders, and returns."
    },
    {
      title: "Curated Collections",
      desc: "Designs tailored for modern lifestyles, ranging from delicate daily-wear rings to striking statement necklaces."
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Header />

      <main className="w-full flex-grow">
        {/* Hero Section */}
        <section className="relative bg-primary text-white py-20 sm:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(212,175,55,0.15),transparent_60%)]" />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#D4AF37]/5 blur-3xl pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
            <span className="text-secondary text-xs sm:text-sm font-bold uppercase tracking-widest block animate-pulse">
              Welcome to ElanoraGems
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight">
              Crafting Timeless <span className="gold-text-gradient font-serif">Elegance</span>
            </h1>
            <p className="text-zinc-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed font-sans font-medium normal-case">
              Creating beautiful, hand-finished jewellery designed to celebrate your everyday stories, sacred celebrations, and modern lifestyles.
            </p>
            <div className="w-16 h-0.5 bg-secondary mx-auto mt-4 rounded-full" />
          </div>
        </section>

        {/* Our Story Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6 font-sans">
            <span className="text-secondary text-xs font-bold uppercase tracking-widest block">
              Our Heritage & Vision
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary leading-tight">
              Born from a Passion for Fine Artistry
            </h2>
            <div className="text-zinc-600 text-xs sm:text-sm leading-relaxed space-y-4 font-normal normal-case">
              <p>
                At ElanoraGems, we believe that jewellery is more than a simple accessory—it is an extension of your personality, a keeper of memories, and a symbol of celebrate-worthy milestones. Established with a vision to redefine luxury, we bridge the gap between premium design and affordable pricing.
              </p>
              <p>
                Every ring, necklace, and bracelet we create starts as a hand-drawn sketch, inspired by classic patterns and modern minimalism. Crafted with certified 92.5% sterling silver and layered with thick gold plating, our collections offer you the luxury look and feel without the standard retail markup.
              </p>
              <p>
                Whether you are treating yourself to a daily-wear silver ring or finding the perfect gift set for a loved one, ElanoraGems stands for timeless beauty that never goes out of style.
              </p>
            </div>
          </div>
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full aspect-square max-w-[480px] rounded-3xl overflow-hidden shadow-2xl border-4 border-accent">
              <img
                src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80"
                alt="Jeweller crafting a silver ring"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent pointer-events-none" />
            </div>
            {/* Absolute Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white border border-[#D4AF37]/25 shadow-xl p-5 rounded-2xl hidden sm:flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#0F2F6B]/5 flex items-center justify-center text-secondary">
                <Sparkles size={24} />
              </div>
              <div>
                <p className="font-serif text-[#0F2F6B] font-bold text-sm">100% Certified</p>
                <p className="text-zinc-400 text-[10px] font-semibold">92.5 Sterling Silver</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Grid Section */}
        <section className="bg-accent/40 py-16 sm:py-24 border-y border-zinc-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <span className="text-secondary text-xs font-bold uppercase tracking-widest">Our Core Pillars</span>
              <h2 className="font-serif text-3xl font-bold text-primary">Our Core Mission</h2>
              <p className="text-zinc-500 text-xs sm:text-sm max-w-lg mx-auto">
                We align our workflow around four fundamental commitments to deliver absolute excellence.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {missionItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="bg-white border border-zinc-150 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-secondary">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-serif font-bold text-[#0F2F6B] text-base">{item.title}</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed font-normal normal-case">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-secondary text-xs font-bold uppercase tracking-widest">Store Benefits</span>
            <h2 className="font-serif text-3xl font-bold text-primary">Why Choose ElanoraGems?</h2>
            <p className="text-zinc-500 text-xs sm:text-sm max-w-lg mx-auto">
              Setting standard luxury benchmarks with a customer-centric retail experience.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4 font-sans">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-5 bg-zinc-50/50 hover:bg-[#F8F4F0]/30 border border-zinc-150 hover:border-[#D4AF37]/20 rounded-2xl transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-[#0F2F6B] text-sm sm:text-base">{feature.title}</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed font-normal normal-case">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="bg-[#0F2F6B] rounded-3xl relative overflow-hidden text-center p-8 sm:p-14 text-white shadow-xl border border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(212,175,55,0.15),transparent_50%)] pointer-events-none" />
            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold">Adorn Yourself in Pure Luxury</h2>
              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-normal normal-case">
                Explore our meticulously hand-crafted collections of rings, earrings, and gift sets designed to stand the test of time.
              </p>
              <div className="pt-2">
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#bda030] text-white text-xs sm:text-sm font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:translate-y-[-1px] cursor-pointer"
                >
                  Explore Collection
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
