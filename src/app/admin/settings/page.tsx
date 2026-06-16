"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Save, Store, Mail, Phone, MapPin, Link as LinkIcon, Search, LayoutTemplate, FileText } from "lucide-react";
import { HeroSectionManager } from "@/components/admin/HeroSectionManager";
import { InfluencerManager } from "@/components/admin/InfluencerManager";
import { CustomerTestimonialsManager } from "@/components/admin/CustomerTestimonialsManager";
import { PoliciesManager } from "@/components/admin/PoliciesManager";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"store" | "site" | "policies">("store");

  const [settings, setSettings] = useState({
    storeName: "ElanoraGems",
    contactEmail: "contact@elanoragems.com",
    whatsappNumber: "+91 9876543210",
    address: "123 Jewelry Lane, Mumbai, India",

    instagram: "https://instagram.com/elanoragems",
    facebook: "https://facebook.com/elanoragems",
    whatsapp: "https://wa.me/919876543210",
    seoTitle: "ElanoraGems | Luxury Handcrafted Jewelry",
    seoDescription: "Discover timeless elegance with ElanoraGems. Shop our exclusive collection of rings, necklaces, and earrings."
  });
  const [isSaving, setIsSaving] = useState(false);

  // Sync tab with URL queries if available (e.g. ?tab=policies)
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "policies") {
      setActiveTab("policies");
    } else if (tabParam === "site") {
      setActiveTab("site");
    } else {
      setActiveTab("store");
    }
  }, [searchParams]);

  const handleTabChange = (tab: "store" | "site" | "policies") => {
    setActiveTab(tab);
    // Update URL search params without triggering full reload
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    router.replace(`/admin/settings?${params.toString()}`);
  };

  useEffect(() => {
    const docRef = doc(db, "settings", "storeConfig");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    // Validation
    if (settings.facebook && !settings.facebook.trim().startsWith("https://facebook.com")) {
      alert("Facebook URL must start with https://facebook.com");
      return;
    }
    if (settings.instagram && !settings.instagram.trim().startsWith("https://instagram.com")) {
      alert("Instagram URL must start with https://instagram.com");
      return;
    }
    if (settings.whatsapp && !settings.whatsapp.trim().startsWith("https://wa.me/")) {
      alert("WhatsApp URL must start with https://wa.me/");
      return;
    }

    setIsSaving(true);
    try {
      await setDoc(doc(db, "settings", "storeConfig"), settings, { merge: true });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2F6B]">Website Control Center</h1>
          <p className="text-zinc-500 mt-1">Manage store settings and website configuration.</p>
        </div>
        {activeTab === "store" && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#0F2F6B] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Save size={20} className="text-[#D4AF37]" />
            {isSaving ? "Saving..." : "Save Store Settings"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200">
        <button
          onClick={() => handleTabChange("store")}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${activeTab === "store" ? "border-[#0F2F6B] text-[#0F2F6B]" : "border-transparent text-zinc-500 hover:text-zinc-700"
            }`}
        >
          <Store size={18} /> Store Settings
        </button>
        <button
          onClick={() => handleTabChange("site")}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${activeTab === "site" ? "border-[#0F2F6B] text-[#0F2F6B]" : "border-transparent text-zinc-500 hover:text-zinc-700"
            }`}
        >
          <LayoutTemplate size={18} /> Site Configuration
        </button>
        <button
          onClick={() => handleTabChange("policies")}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${activeTab === "policies" ? "border-[#0F2F6B] text-[#0F2F6B]" : "border-transparent text-zinc-500 hover:text-zinc-700"
            }`}
        >
          <FileText size={18} /> Policies
        </button>
      </div>

      {/* Tab 1: Store Settings */}
      {activeTab === "store" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* General Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
              <Store size={20} className="text-[#0F2F6B]" />
              <h2 className="text-lg font-bold text-[#0F2F6B]">General Info</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Store Name</label>
                <input type="text" name="storeName" value={settings.storeName} onChange={handleChange} className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Store Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input type="text" name="address" value={settings.address} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]" />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
              <Mail size={20} className="text-[#0F2F6B]" />
              <h2 className="text-lg font-bold text-[#0F2F6B]">Contact Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Support Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input type="email" name="contactEmail" value={settings.contactEmail} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">WhatsApp Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input type="text" name="whatsappNumber" value={settings.whatsappNumber} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]" />
                </div>
              </div>
            </div>
          </div>

          {/* SEO Defaults */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
              <Search size={20} className="text-[#0F2F6B]" />
              <h2 className="text-lg font-bold text-[#0F2F6B]">SEO Default Tags</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">SEO Title</label>
                <input type="text" name="seoTitle" value={settings.seoTitle} onChange={handleChange} className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">SEO Description</label>
                <textarea rows={3} name="seoDescription" value={settings.seoDescription} onChange={handleChange} className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] resize-none"></textarea>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 space-y-6 md:col-span-2">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
              <LinkIcon size={20} className="text-[#0F2F6B]" />
              <h2 className="text-lg font-bold text-[#0F2F6B]">Social Media Links</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Facebook URL</label>
                <input type="url" name="facebook" value={settings.facebook || ""} onChange={handleChange} className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]" placeholder="https://facebook.com/..." />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Instagram URL</label>
                <input type="url" name="instagram" value={settings.instagram || ""} onChange={handleChange} className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]" placeholder="https://instagram.com/..." />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">WhatsApp URL</label>
                <input type="url" name="whatsapp" value={settings.whatsapp || ""} onChange={handleChange} className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]" placeholder="https://wa.me/..." />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Site Configuration */}
      {activeTab === "site" && (
        <div className="space-y-8">

          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
            <HeroSectionManager />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
            <InfluencerManager />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
            <CustomerTestimonialsManager />
          </div>

        </div>
      )}

      {/* Tab 3: Policies */}
      {activeTab === "policies" && (
        <PoliciesManager />
      )}

    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-zinc-100 rounded-2xl shadow-sm">
        <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Loading Settings Control...</p>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
