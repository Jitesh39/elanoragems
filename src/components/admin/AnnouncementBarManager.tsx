"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Save, AlertCircle, CheckCircle, Loader2, Sparkles, Paintbrush, Link as LinkIcon, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

interface AnnouncementItem {
  id: string;
  message: string;
  link: string;
}

export function AnnouncementBarManager() {
  const [enabled, setEnabled] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#163a7d");
  const [textColor, setTextColor] = useState("#ffffff");
  const [marquee, setMarquee] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Live Preview state for cycling announcements
  const [previewIndex, setPreviewIndex] = useState(0);

  // Load existing announcement settings from Firestore
  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      setFeedback(null);
      try {
        const docRef = doc(db, "siteSettings", "announcementBar");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setEnabled(data.enabled ?? false);
          setBackgroundColor(data.backgroundColor ?? "#163a7d");
          setTextColor(data.textColor ?? "#ffffff");
          setMarquee(data.marquee ?? false);

          let list: AnnouncementItem[] = data.announcements ?? [];
          // Backward-compatibility: if legacy fields exist and list is empty
          if (list.length === 0 && data.message) {
            list = [{
              id: "legacy-1",
              message: data.message,
              link: data.link || ""
            }];
          }
          setAnnouncements(list);
        }
      } catch (error) {
        console.error("Error loading announcement settings:", error);
        setFeedback({ type: "error", text: "Failed to load announcement bar settings." });
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, []);

  // Timer to cycle announcements in preview if marquee is disabled
  useEffect(() => {
    if (marquee || announcements.length <= 1) {
      setPreviewIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [announcements.length, marquee]);

  // Auto-clear feedback notification
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Helper functions for list manipulation
  const addAnnouncement = () => {
    setAnnouncements((prev) => [
      ...prev,
      { id: Date.now().toString(), message: "", link: "" }
    ]);
  };

  const removeAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((item) => item.id !== id));
  };

  const updateAnnouncement = (id: string, field: "message" | "link", val: string) => {
    setAnnouncements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const moveAnnouncement = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === announcements.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...announcements];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setAnnouncements(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    // Validation
    if (enabled) {
      if (announcements.length === 0) {
        setFeedback({ type: "error", text: "At least one announcement is required when the announcement bar is enabled." });
        setIsSaving(false);
        return;
      }
      const hasEmptyMessage = announcements.some((item) => !item.message.trim());
      if (hasEmptyMessage) {
        setFeedback({ type: "error", text: "All announcements must have a non-empty message when enabled." });
        setIsSaving(false);
        return;
      }
    }

    try {
      const docRef = doc(db, "siteSettings", "announcementBar");
      await setDoc(docRef, {
        enabled,
        backgroundColor,
        textColor,
        marquee,
        announcements: announcements.map((item) => ({
          id: item.id,
          message: item.message.trim(),
          link: item.link.trim() || null
        })),
        updatedAt: serverTimestamp()
      });

      setFeedback({ type: "success", text: "Announcement bar settings saved successfully!" });
    } catch (error) {
      console.error("Error saving announcement settings:", error);
      setFeedback({ type: "error", text: "Failed to save settings. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  // Preview content text generator
  const getPreviewText = () => {
    const activeList = announcements.filter((a) => a.message.trim());
    if (activeList.length === 0) return "✨ Enter a message in the fields to preview";

    if (marquee) {
      return activeList.map((a) => a.message).join("     •     ");
    }

    const currentItem = activeList[previewIndex] || activeList[0];
    return currentItem ? currentItem.message : "";
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-zinc-100 pb-4 gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0F2F6B] flex items-center gap-2">
            <Sparkles className="text-[#D4AF37]" size={20} />
            Announcement Bar Settings
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Configure promotions and updates shown at the absolute top of the storefront.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading || isSaving}
          className="bg-[#0F2F6B] hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 shrink-0 cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Settings
            </>
          )}
        </button>
      </div>

      {/* Message Feedback */}
      {feedback && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border text-sm transition-all animate-fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle className="shrink-0 text-emerald-500" size={18} />
          ) : (
            <AlertCircle className="shrink-0 text-rose-500" size={18} />
          )}
          <span className="font-semibold">{feedback.text}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Loading settings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Form */}
          <div className="space-y-6 lg:col-span-7">
            {/* Toggle Enable & Style Picker Group */}
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200/60">
                <div>
                  <label className="font-bold text-sm text-[#0F2F6B] block">Enable Announcement Bar</label>
                  <span className="text-xs text-zinc-500">Show or hide the announcement bar across the store.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEnabled(!enabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    enabled ? "bg-[#0F2F6B]" : "bg-zinc-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Color Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase block mb-1.5 flex items-center gap-1.5">
                    <Paintbrush size={14} className="text-zinc-400" />
                    Background Color
                  </label>
                  <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-1 bg-white">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-10 h-10 border border-zinc-200 rounded-lg cursor-pointer p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={backgroundColor.toUpperCase()}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-full text-sm font-semibold text-zinc-700 outline-none uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase block mb-1.5 flex items-center gap-1.5">
                    <Paintbrush size={14} className="text-zinc-400" />
                    Text Color
                  </label>
                  <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-1 bg-white">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-10 h-10 border border-zinc-200 rounded-lg cursor-pointer p-0 bg-transparent shrink-0"
                    />
                    <input
                      type="text"
                      value={textColor.toUpperCase()}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full text-sm font-semibold text-zinc-700 outline-none uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Toggle Marquee */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-200/60">
                <div>
                  <label className="font-bold text-sm text-[#0F2F6B] block">Auto Scroll / Marquee</label>
                  <span className="text-xs text-zinc-500">Animate text from right to left smoothly.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMarquee(!marquee)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    marquee ? "bg-[#0F2F6B]" : "bg-zinc-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      marquee ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* List Manager Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-serif font-bold text-sm text-[#0F2F6B]">Announcements List</h3>
                <button
                  type="button"
                  onClick={addAnnouncement}
                  className="bg-[#0F2F6B]/10 hover:bg-[#0F2F6B]/20 text-[#0F2F6B] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus size={14} /> Add Announcement
                </button>
              </div>

              {announcements.length === 0 ? (
                <div className="text-center py-12 bg-white border border-dashed border-zinc-300 rounded-2xl text-zinc-500 text-sm">
                  No announcements created. Click &quot;Add Announcement&quot; to begin.
                </div>
              ) : (
                <div className="space-y-3">
                  {announcements.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm space-y-3 relative group"
                    >
                      <div className="flex gap-4 items-start">
                        <div className="flex-grow space-y-3">
                          {/* Announcement text input */}
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                              Announcement message
                            </label>
                            <input
                              type="text"
                              required={enabled}
                              value={item.message}
                              onChange={(e) => updateAnnouncement(item.id, "message", e.target.value)}
                              placeholder="e.g. 🎁 Flat 10% Off! Use Code: ELANORA10"
                              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#0F2F6B] outline-none"
                            />
                          </div>

                          {/* Link URL input */}
                          <div>
                            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1 flex items-center gap-1">
                              <LinkIcon size={10} /> Link URL (Optional)
                            </label>
                            <input
                              type="text"
                              value={item.link}
                              onChange={(e) => updateAnnouncement(item.id, "link", e.target.value)}
                              placeholder="e.g. /collections/all-jewelry"
                              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#0F2F6B] outline-none"
                            />
                          </div>
                        </div>

                        {/* List Actions */}
                        <div className="flex flex-col gap-1 items-center shrink-0">
                          <button
                            type="button"
                            onClick={() => moveAnnouncement(index, "up")}
                            disabled={index === 0}
                            className="p-1.5 text-zinc-400 hover:text-[#0F2F6B] disabled:opacity-30 rounded hover:bg-zinc-50 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveAnnouncement(index, "down")}
                            disabled={index === announcements.length - 1}
                            className="p-1.5 text-zinc-400 hover:text-[#0F2F6B] disabled:opacity-30 rounded hover:bg-zinc-50 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeAnnouncement(item.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded cursor-pointer mt-1"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Admin Live Preview */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Live Preview</h3>
            <div className="border border-zinc-200 rounded-2xl p-6 bg-zinc-50 flex flex-col justify-center min-h-[160px] shadow-inner relative overflow-hidden">
              <span className="absolute top-3 left-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Storefront Preview</span>

              {/* Simulated Announcement Bar */}
              <div className="w-full border border-zinc-200/50 rounded-lg overflow-hidden shadow-sm">
                {enabled ? (
                  <div
                    style={{ backgroundColor: backgroundColor, color: textColor }}
                    className="text-xs py-2.5 px-4 overflow-hidden relative flex items-center justify-center font-medium tracking-wider select-none min-h-[36px]"
                  >
                    {marquee ? (
                      <div className="w-full overflow-hidden whitespace-nowrap">
                        <span className="animate-marquee inline-block pl-[100%] pr-4">
                          {getPreviewText()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-center w-full truncate px-4 animate-fade-in key={previewIndex}">
                        {getPreviewText()}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="bg-zinc-200 text-zinc-400 py-3 text-center text-xs font-semibold italic">
                    Announcement Bar is currently Hidden
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-500">
                  <span>Interactive Preview Actions:</span>
                  {announcements.length > 1 && !marquee && (
                    <span className="text-primary font-bold">
                      Cycling {previewIndex + 1} of {announcements.length}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">
                  {marquee
                    ? "Marquee scrolling combines all active announcements separated by a dot."
                    : "In static mode, the bar fades through each announcement every 4 seconds."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
