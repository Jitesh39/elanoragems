"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

const Facebook = ({ size = 24 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = ({ size = 24 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Twitter = ({ size = 24 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

export const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-white pt-16 pb-8 border-t border-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

        {/* Column 1: Brand Info */}
        <div className="space-y-4">
          <Link href="/" className="inline-block">
            <span className="font-serif text-2xl font-bold tracking-wider text-white">
              Elanora<span className="text-secondary font-medium font-sans">Gems</span>
            </span>
          </Link>
          <p className="text-xs text-zinc-300 leading-relaxed normal-case">
            Exquisite jewelry hand-crafted in 92.5% sterling silver and 18K gold plating. Designed to celebrate your everyday stories and sacred celebrations.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a href="#" className="w-8 h-8 rounded-full border border-white/20 hover:border-secondary hover:text-secondary flex items-center justify-center transition-colors text-zinc-300">
              <Facebook size={14} />
            </a>
            <a href="#" className="w-8 h-8 rounded-full border border-white/20 hover:border-secondary hover:text-secondary flex items-center justify-center transition-colors text-zinc-300">
              <Instagram size={14} />
            </a>
            <a href="#" className="w-8 h-8 rounded-full border border-white/20 hover:border-secondary hover:text-secondary flex items-center justify-center transition-colors text-zinc-300">
              <Twitter size={14} />
            </a>
          </div>
        </div>

        {/* Column 2: Shop Links */}
        <div>
          <h4 className="font-serif text-secondary text-sm font-bold tracking-widest uppercase mb-4">Shop Collections</h4>
          <ul className="space-y-2.5 text-xs text-zinc-300 font-medium">
            <li><Link href="/collections?category=rings" className="hover:text-secondary transition-colors">Silver Rings</Link></li>
            <li><Link href="/collections?category=earrings" className="hover:text-secondary transition-colors">Exquisite Earrings</Link></li>
            <li><Link href="/collections?category=necklaces" className="hover:text-secondary transition-colors">Gold Plated Necklaces</Link></li>
            <li><Link href="/collections?category=bracelets" className="hover:text-secondary transition-colors">Bracelets & Anklets</Link></li>
            <li><Link href="/collections?category=gift-sets" className="hover:text-secondary transition-colors">Gift Box Sets</Link></li>
          </ul>
        </div>

        {/* Column 3: Customer Care */}
        <div>
          <h4 className="font-serif text-secondary text-sm font-bold tracking-widest uppercase mb-4">Customer Care</h4>
          <ul className="space-y-2.5 text-xs text-zinc-300 font-medium">
            <li><Link href="/faq" className="hover:text-secondary transition-colors">FAQs</Link></li>
            <li><Link href="/track-order" className="hover:text-secondary transition-colors">Track Your Order</Link></li>
            <li><Link href="/returns" className="hover:text-secondary transition-colors">Easy Returns & Exchanges</Link></li>
            <li><Link href="/shipping" className="hover:text-secondary transition-colors">Shipping Information</Link></li>
            <li><Link href="/contact" className="hover:text-secondary transition-colors">Contact Support</Link></li>
          </ul>
        </div>

        {/* Column 4: Policies */}
        <div>
          <h4 className="font-serif text-secondary text-sm font-bold tracking-widest uppercase mb-4">Our Policies</h4>
          <ul className="space-y-2.5 text-xs text-zinc-300 font-medium">
            <li><Link href="/policies/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
            <li><Link href="/policies/terms" className="hover:text-secondary transition-colors">Terms of Service</Link></li>
            <li><Link href="/policies/refund" className="hover:text-secondary transition-colors">Refund & Return Policy</Link></li>
            <li><Link href="/policies/shipping" className="hover:text-secondary transition-colors">Shipping Policy</Link></li>
            <li><Link href="/policies/terms-of-use" className="hover:text-secondary transition-colors">Terms of Use</Link></li>
          </ul>
        </div>

        {/* Column 5: Store Information */}
        <div className="space-y-3">
          <h4 className="font-serif text-secondary text-sm font-bold tracking-widest uppercase mb-4">Contact Us</h4>
          <div className="flex gap-2 text-xs text-zinc-300">
            <MapPin size={16} className="text-secondary flex-shrink-0" />
            <span></span>
          </div>
          <div className="flex gap-2 text-xs text-zinc-300">
            <Phone size={16} className="text-secondary flex-shrink-0" />
            <span>+91 950781</span>
          </div>
          <div className="flex gap-2 text-xs text-zinc-300">
            <Mail size={16} className="text-secondary flex-shrink-0" />
            <span>gemselanora@gmail.com</span>
          </div>
        </div>

      </div>

      {/* Footer Bottom Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-secondary" />
          <span>100% Safe & Secure Checkout. Trusted by over 10,000+ customers.</span>
        </div>
        <div>
          &copy; {new Date().getFullYear()} ElanoraGems . All rights reserved.
        </div>
      </div>
    </footer>
  );
};
export default Footer;
