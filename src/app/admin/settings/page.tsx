"use client";

import React, { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Save, Store, Mail, Phone, MapPin, Percent, Link as LinkIcon, Search, LayoutTemplate } from "lucide-react";
import { HeroSectionManager } from "@/components/admin/HeroSectionManager";
import { InfluencerManager } from "@/components/admin/InfluencerManager";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"store" | "site">("store");

  const [settings, setSettings] = useState({
    storeName: "ElanoraGems",
    contactEmail: "contact@elanoragems.com",
    whatsappNumber: "+91 9876543210",
    address: "123 Jewelry Lane, Mumbai, India",
    shippingCharge: 100,
    gstPercent: 3,
    instagram: "https://instagram.com/elanoragems",
    facebook: "https://facebook.com/elanoragems",
    seoTitle: "ElanoraGems | Luxury Handcrafted Jewelry",
    seoDescription: "Discover timeless elegance with ElanoraGems. Shop our exclusive collection of rings, necklaces, and earrings."
  });
  const [isSaving, setIsSaving] = useState(false);

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
      [name]: name === 'shippingCharge' || name === 'gstPercent' ? Number(value) : value 
    }));
  };

  const handleSave = async () => {
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
            className="bg-[#0F2F6B] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save size={20} className="text-[#D4AF37]" />
            {isSaving ? "Saving..." : "Save Store Settings"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200">
        <button
          onClick={() => setActiveTab("store")}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "store" ? "border-[#0F2F6B] text-[#0F2F6B]" : "border-transparent text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <Store size={18} /> Store Settings
        </button>
        <button
          onClick={() => setActiveTab("site")}
          className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "site" ? "border-[#0F2F6B] text-[#0F2F6B]" : "border-transparent text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <LayoutTemplate size={18} /> Site Configuration
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

          {/* E-commerce Configurations */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
              <Percent size={20} className="text-[#0F2F6B]" />
              <h2 className="text-lg font-bold text-[#0F2F6B]">Store Config</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Flat Shipping (₹)</label>
                <input type="number" name="shippingCharge" value={settings.shippingCharge} onChange={handleChange} className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">GST (%)</label>
                <input type="number" name="gstPercent" value={settings.gstPercent} onChange={handleChange} className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]" />
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Instagram URL</label>
                <input type="url" name="instagram" value={settings.instagram} onChange={handleChange} className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Facebook URL</label>
                <input type="url" name="facebook" value={settings.facebook} onChange={handleChange} className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]" />
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

        </div>
      )}

    </div>
  );
}
