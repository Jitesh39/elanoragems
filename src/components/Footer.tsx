"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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

const WhatsApp = ({ size = 24 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

export const Footer: React.FC = () => {
  const [storeInfo, setStoreInfo] = useState({
    contactEmail: "Email Not Available",
    whatsappNumber: "Contact Not Available",
    address: "Location Not Available"
  });
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    whatsapp: ""
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [logoError, setLogoError] = useState(false);

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
        setSocialLinks({
          facebook: data.facebook || "",
          instagram: data.instagram || "",
          whatsapp: data.whatsapp || ""
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
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
            <div className="flex flex-col items-center md:items-start gap-3 w-full mb-4">
              <Link href="/" className="inline-block select-none mb-4">
                {!logoError ? (
                  <Image
                    src="/logo.png"
                    alt="ElanoraGems Luxury Jewellery"
                    width={160}
                    height={160}
                    className="w-[100px] md:w-[140px] lg:w-[160px] h-auto object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="font-serif text-2xl md:text-3xl font-bold tracking-wider text-white">
                    Elanora<span className="text-secondary font-medium font-sans">Gems</span>
                  </span>
                )}
              </Link>
              {!logoError && (
                <Link href="/" className="inline-block">
                  <span className="font-serif text-2xl md:text-3xl font-bold tracking-wider text-white">
                    Elanora<span className="text-secondary font-medium font-sans">Gems</span>
                  </span>
                </Link>
              )}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/20 hover:border-secondary hover:text-secondary flex items-center justify-center transition-colors text-zinc-300"
                >
                  <Facebook size={14} />
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/20 hover:border-secondary hover:text-secondary flex items-center justify-center transition-colors text-zinc-300"
                >
                  <Instagram size={14} />
                </a>
              )}
              {socialLinks.whatsapp && (
                <a
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/20 hover:border-secondary hover:text-secondary flex items-center justify-center transition-colors text-zinc-300"
                >
                  <WhatsApp size={14} />
                </a>
              )}
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
            &copy; 2026 ElanoraGems. Developed by{" "}
            <a
              href="https://www.thestudysmith.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit TheStudySmith Website"
              className="text-zinc-400 hover:text-secondary transition-colors duration-300 font-medium"
            >
              TheStudySmith
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};
export default Footer;
