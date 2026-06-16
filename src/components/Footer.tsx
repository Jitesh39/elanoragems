"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import { doc, onSnapshot, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Newsletter } from "./Newsletter";

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
  const [storeInfo, setStoreInfo] = useState({
    contactEmail: "Email Not Available",
    whatsappNumber: "Contact Not Available",
    address: "Location Not Available"
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    const docRef = doc(db, "settings", "storeConfig");
    const unsubscribeStore = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStoreInfo({
          contactEmail: data.contactEmail || "Email Not Available",
          whatsappNumber: data.whatsappNumber || "Contact Not Available",
          address: data.address || "Location Not Available"
        });
      }
    }, (error) => {
      console.error("Error fetching store config for footer:", error);
    });

    const categoriesRef = collection(db, "categories");
    const unsubscribeCats = onSnapshot(categoriesRef, (snapshot) => {
      const cats: any[] = [];
      snapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() });
      });
      setCategories(cats);
      setLoadingCats(false);
    }, (error) => {
      console.error("Error fetching categories for footer:", error);
      setLoadingCats(false);
    });

    return () => {
      unsubscribeStore();
      unsubscribeCats();
    };
  }, []);

  const activeCategories = categories.filter(cat => cat.isActive !== false);
  const sortedCategories = [...activeCategories]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  return (
    <>
      <Newsletter />
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

        {/* Column 2: Shop Categories */}
        <div>
          <h4 className="font-serif text-secondary text-sm font-bold tracking-widest uppercase mb-4">Shop Categories</h4>
          <ul className="space-y-2.5 text-xs text-zinc-300 font-medium">
            {loadingCats ? (
              <li className="text-zinc-500">Loading categories...</li>
            ) : sortedCategories.length > 0 ? (
              sortedCategories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug || cat.id}`} className="hover:text-secondary transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-zinc-500 italic">No categories available</li>
            )}
          </ul>
        </div>

        {/* Column 3: Customer Support */}
        <div>
          <h4 className="font-serif text-secondary text-sm font-bold tracking-widest uppercase mb-4">Customer Support</h4>
          <ul className="space-y-2.5 text-xs text-zinc-300 font-medium">
            <li><Link href="/faq" className="hover:text-secondary transition-colors">FAQ</Link></li>
            <li><Link href="/policies/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
            <li><Link href="/policies/terms" className="hover:text-secondary transition-colors">Terms & Conditions</Link></li>
            <li><Link href="/policies/refund" className="hover:text-secondary transition-colors">Refund Policy</Link></li>
            <li><Link href="/policies/shipping" className="hover:text-secondary transition-colors">Shipping Policy</Link></li>
            <li><Link href="/policies/terms-of-use" className="hover:text-secondary transition-colors">Terms of Use</Link></li>
          </ul>
        </div>

        {/* Column 4: Quick Links */}
        <div>
          <h4 className="font-serif text-secondary text-sm font-bold tracking-widest uppercase mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-xs text-zinc-300 font-medium">
            <li><Link href="/about" className="hover:text-secondary transition-colors">Our Story</Link></li>
            <li>
              <a
                href="https://shiprocket.co/tracking/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary transition-colors"
              >
                Track Your Order
              </a>
            </li>
            <li><Link href="/contact" className="hover:text-secondary transition-colors">Contact Support</Link></li>
          </ul>
        </div>

        {/* Column 5: Store Information */}
        <div className="space-y-3">
          <h4 className="font-serif text-secondary text-sm font-bold tracking-widest uppercase mb-4">Contact Us</h4>
          <div className="flex gap-2 text-xs text-zinc-300">
            <MapPin size={16} className="text-secondary flex-shrink-0" />
            {storeInfo.address !== "Location Not Available" ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeInfo.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-secondary transition-colors leading-normal"
              >
                {storeInfo.address}
              </a>
            ) : (
              <span>Location Not Available</span>
            )}
          </div>
          <div className="flex gap-2 text-xs text-zinc-300">
            <Phone size={16} className="text-secondary flex-shrink-0" />
            {storeInfo.whatsappNumber !== "Contact Not Available" ? (
              <a href={`tel:${storeInfo.whatsappNumber}`} className="hover:text-secondary transition-colors">
                {storeInfo.whatsappNumber}
              </a>
            ) : (
              <span>Contact Not Available</span>
            )}
          </div>
          <div className="flex gap-2 text-xs text-zinc-300">
            <Mail size={16} className="text-secondary flex-shrink-0" />
            {storeInfo.contactEmail !== "Email Not Available" ? (
              <a href={`mailto:${storeInfo.contactEmail}`} className="hover:text-secondary transition-colors">
                {storeInfo.contactEmail}
              </a>
            ) : (
              <span>Email Not Available</span>
            )}
          </div>
        </div>

      </div>

      {/* Footer Bottom Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10 mt-12 pt-8 text-center text-xs text-zinc-400">
        <div>
          &copy; 2026 ElanoraGems. All rights reserved.
        </div>
      </div>
      </footer>
    </>
  );
};
export default Footer;
