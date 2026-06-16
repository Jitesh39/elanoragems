"use client";

import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  defaultPoliciesMap,
  PolicyData,
  FAQData,
  PolicySection,
  FAQSection,
  FAQItem
} from "@/lib/defaultPolicies";
import {
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Settings
} from "lucide-react";

type TabId = "faq" | "privacy" | "terms" | "refund" | "shipping" | "terms-of-use";

interface TabOption {
  id: TabId;
  label: string;
}

const TABS: TabOption[] = [
  { id: "faq", label: "FAQ" },
  { id: "privacy", label: "Privacy Policy" },
  { id: "terms", label: "Terms & Conditions" },
  { id: "refund", label: "Refund Policy" },
  { id: "shipping", label: "Shipping Policy" },
  { id: "terms-of-use", label: "Terms of Use" }
];

export default function AdminPoliciesCMS() {
  const [activeTab, setActiveTab] = useState<TabId>("faq");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [lastUpdated, setLastUpdated] = useState("");
  const [policySections, setPolicySections] = useState<PolicySection[]>([]);
  const [faqSections, setFaqSections] = useState<FAQSection[]>([]);
  const [returnWindow, setReturnWindow] = useState<number>(15);

  // Fetch current policy or FAQ details
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setMessage(null);
      try {
        const docRef = doc(db, "policies", activeTab);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setLastUpdated(data.lastUpdated || "");
          if (activeTab === "faq") {
            setFaqSections(data.sections || []);
          } else {
            setPolicySections(data.sections || []);
            if (activeTab === "refund") {
              setReturnWindow(data.returnWindow ?? 15);
            }
          }
        } else {
          // Initialize with static default fallback data
          const fallback = defaultPoliciesMap[activeTab];
          setLastUpdated(fallback.lastUpdated);
          if (activeTab === "faq") {
            setFaqSections((fallback as FAQData).sections);
          } else {
            setPolicySections((fallback as PolicyData).sections);
            if (activeTab === "refund") {
              setReturnWindow((fallback as PolicyData).returnWindow ?? 15);
            }
          }
        }
      } catch (error) {
        console.error("Error loading CMS data:", error);
        setMessage({ type: "error", text: "Failed to load data from database." });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [activeTab]);

  // Toast auto-clear
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const docRef = doc(db, "policies", activeTab);
      let saveData: any = {
        lastUpdated,
        updatedAt: new Date().toISOString()
      };

      if (activeTab === "faq") {
        saveData.sections = faqSections;
      } else {
        saveData.sections = policySections;
        if (activeTab === "refund") {
          saveData.returnWindow = Number(returnWindow);
        }
      }

      await setDoc(docRef, saveData);
      setMessage({ type: "success", text: "Changes saved and published successfully!" });
    } catch (error) {
      console.error("Error saving CMS data:", error);
      setMessage({ type: "error", text: "Failed to publish changes. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  // Section Helpers for standard Policies
  const updatePolicySectionTitle = (index: number, val: string) => {
    const updated = [...policySections];
    updated[index].title = val;
    setPolicySections(updated);
  };

  const updatePolicySectionContent = (index: number, val: string) => {
    const updated = [...policySections];
    updated[index].content = val;
    setPolicySections(updated);
  };

  const addPolicySection = () => {
    setPolicySections([...policySections, { title: "New Section Title", content: "Enter content here..." }]);
  };

  const deletePolicySection = (index: number) => {
    if (confirm("Are you sure you want to delete this section?")) {
      setPolicySections(policySections.filter((_, i) => i !== index));
    }
  };

  const movePolicySection = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === policySections.length - 1) return;

    const updated = [...policySections];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setPolicySections(updated);
  };

  // Section Helpers for FAQ
  const updateFaqSectionTitle = (sIndex: number, val: string) => {
    const updated = [...faqSections];
    updated[sIndex].title = val;
    setFaqSections(updated);
  };

  const addFaqSection = () => {
    setFaqSections([...faqSections, { title: "New FAQ Category", items: [] }]);
  };

  const deleteFaqSection = (sIndex: number) => {
    if (confirm("Are you sure you want to delete this entire FAQ category and all its questions?")) {
      setFaqSections(faqSections.filter((_, i) => i !== sIndex));
    }
  };

  const moveFaqSection = (sIndex: number, direction: "up" | "down") => {
    if (direction === "up" && sIndex === 0) return;
    if (direction === "down" && sIndex === faqSections.length - 1) return;

    const updated = [...faqSections];
    const targetIdx = direction === "up" ? sIndex - 1 : sIndex + 1;
    const temp = updated[sIndex];
    updated[sIndex] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFaqSections(updated);
  };

  // FAQ Items Helpers
  const updateFaqItemQuestion = (sIndex: number, iIndex: number, val: string) => {
    const updated = [...faqSections];
    updated[sIndex].items[iIndex].question = val;
    setFaqSections(updated);
  };

  const updateFaqItemAnswer = (sIndex: number, iIndex: number, val: string) => {
    const updated = [...faqSections];
    updated[sIndex].items[iIndex].answer = val;
    setFaqSections(updated);
  };

  const addFaqItem = (sIndex: number) => {
    const updated = [...faqSections];
    updated[sIndex].items.push({ question: "New Question?", answer: "New Answer text..." });
    setFaqSections(updated);
  };

  const deleteFaqItem = (sIndex: number, iIndex: number) => {
    const updated = [...faqSections];
    updated[sIndex].items = updated[sIndex].items.filter((_, i) => i !== iIndex);
    setFaqSections(updated);
  };

  const moveFaqItem = (sIndex: number, iIndex: number, direction: "up" | "down") => {
    const items = faqSections[sIndex].items;
    if (direction === "up" && iIndex === 0) return;
    if (direction === "down" && iIndex === items.length - 1) return;

    const updatedItems = [...items];
    const targetIdx = direction === "up" ? iIndex - 1 : iIndex + 1;
    const temp = updatedItems[iIndex];
    updatedItems[iIndex] = updatedItems[targetIdx];
    updatedItems[targetIdx] = temp;

    const updatedSections = [...faqSections];
    updatedSections[sIndex].items = updatedItems;
    setFaqSections(updatedSections);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-zinc-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2F6B]">Policies & FAQ CMS</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage the content, FAQ answers, and legal guidelines displayed on the customer-facing website.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading || saving}
          className="bg-[#0F2F6B] hover:bg-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 shrink-0 cursor-pointer"
        >
          <Save size={16} />
          {saving ? "Saving Changes..." : "Publish Changes"}
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex overflow-x-auto border-b border-zinc-200 pb-px scrollbar-hide gap-1 bg-white p-1 rounded-xl shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#0F2F6B] text-white shadow-sm"
                : "text-zinc-500 hover:text-[#0F2F6B] hover:bg-[#F8F9FC]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Message feedback */}
      {message && (
        <div
          className={`flex items-start gap-3 p-4 rounded-xl border text-sm transition-all animate-fade-in ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="shrink-0 text-emerald-500" size={18} />
          ) : (
            <AlertCircle className="shrink-0 text-rose-500" size={18} />
          )}
          <span className="font-semibold">{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-zinc-100 rounded-2xl shadow-sm">
          <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Loading Configuration...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase block mb-1.5 flex items-center gap-1.5">
                <Calendar size={14} className="text-[#D4AF37]" /> Last Updated Date
              </label>
              <input
                type="text"
                required
                placeholder="e.g., June 16, 2026"
                value={lastUpdated}
                onChange={(e) => setLastUpdated(e.target.value)}
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none transition-all"
              />
              <p className="text-[10px] text-zinc-400 mt-1">This will show at the top of the policy page.</p>
            </div>

            {activeTab === "refund" && (
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1.5 flex items-center gap-1.5">
                  <Settings size={14} className="text-[#D4AF37]" /> Return Window (Days)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={365}
                  value={returnWindow}
                  onChange={(e) => setReturnWindow(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none transition-all"
                />
                <p className="text-[10px] text-zinc-400 mt-1">
                  Adjusts the eligibility timeline text dynamically using the {`{returnWindow}`} placeholder.
                </p>
              </div>
            )}
          </div>

          {/* Section Editors */}
          {activeTab === "faq" ? (
            /* FAQ CMS SECTION */
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-serif font-bold text-[#0F2F6B]">FAQ Categories</h3>
                <button
                  type="button"
                  onClick={addFaqSection}
                  className="bg-[#0F2F6B]/10 hover:bg-[#0F2F6B]/20 text-[#0F2F6B] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus size={14} /> Add Category
                </button>
              </div>

              {faqSections.length === 0 ? (
                <div className="text-center py-12 bg-white border border-dashed border-zinc-300 rounded-2xl text-zinc-500 text-sm">
                  No FAQ categories created yet. Click &quot;Add Category&quot; to begin.
                </div>
              ) : (
                <div className="space-y-6">
                  {faqSections.map((section, sIdx) => (
                    <div
                      key={sIdx}
                      className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4 relative"
                    >
                      {/* Section Controller */}
                      <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center border-b border-zinc-100 pb-3">
                        <div className="flex-grow">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                            Category Title
                          </label>
                          <input
                            type="text"
                            required
                            value={section.title}
                            onChange={(e) => updateFaqSectionTitle(sIdx, e.target.value)}
                            className="w-full font-serif font-bold text-primary text-base border-b border-dashed border-zinc-300 focus:border-secondary outline-none pb-0.5 bg-transparent"
                          />
                        </div>
                        <div className="flex items-center gap-1 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => moveFaqSection(sIdx, "up")}
                            disabled={sIdx === 0}
                            className="p-1.5 text-zinc-400 hover:text-[#0F2F6B] disabled:opacity-30 rounded hover:bg-zinc-50 cursor-pointer"
                            title="Move Category Up"
                          >
                            <ArrowUp size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveFaqSection(sIdx, "down")}
                            disabled={sIdx === faqSections.length - 1}
                            className="p-1.5 text-zinc-400 hover:text-[#0F2F6B] disabled:opacity-30 rounded hover:bg-zinc-50 cursor-pointer"
                            title="Move Category Down"
                          >
                            <ArrowDown size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteFaqSection(sIdx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Items (Questions / Answers) inside this section */}
                      <div className="space-y-4 pl-0 sm:pl-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                            <HelpCircle size={14} className="text-secondary" /> Questions ({section.items?.length || 0})
                          </h4>
                          <button
                            type="button"
                            onClick={() => addFaqItem(sIdx)}
                            className="border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 text-secondary text-[11px] font-bold px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Plus size={12} /> Add Q&A Item
                          </button>
                        </div>

                        {(!section.items || section.items.length === 0) ? (
                          <div className="text-center py-6 bg-zinc-50/50 rounded-xl text-zinc-400 text-xs border border-dashed border-zinc-200">
                            No questions added to this category.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {section.items.map((item, iIdx) => (
                              <div
                                key={iIdx}
                                className="bg-zinc-50 border border-zinc-150 rounded-xl p-4 space-y-3 relative group"
                              >
                                <div className="flex justify-between items-start gap-4">
                                  <div className="flex-grow space-y-3">
                                    {/* Question Input */}
                                    <div>
                                      <input
                                        type="text"
                                        required
                                        placeholder="Question text?"
                                        value={item.question}
                                        onChange={(e) => updateFaqItemQuestion(sIdx, iIdx, e.target.value)}
                                        className="w-full font-bold text-sm text-[#0F2F6B] bg-transparent border-b border-zinc-200 focus:border-[#0F2F6B] outline-none pb-0.5"
                                      />
                                    </div>
                                    {/* Answer Textarea */}
                                    <div>
                                      <textarea
                                        required
                                        rows={2}
                                        placeholder="Answer text..."
                                        value={item.answer}
                                        onChange={(e) => updateFaqItemAnswer(sIdx, iIdx, e.target.value)}
                                        className="w-full text-xs text-zinc-600 bg-white border border-zinc-200 rounded-lg p-2 focus:border-[#0F2F6B] outline-none resize-y"
                                      />
                                    </div>
                                  </div>
                                  {/* Actions */}
                                  <div className="flex flex-col gap-1 items-center shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => moveFaqItem(sIdx, iIdx, "up")}
                                      disabled={iIdx === 0}
                                      className="p-1 text-zinc-400 hover:text-[#0F2F6B] disabled:opacity-30 rounded hover:bg-white cursor-pointer"
                                    >
                                      <ArrowUp size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => moveFaqItem(sIdx, iIdx, "down")}
                                      disabled={iIdx === section.items.length - 1}
                                      className="p-1 text-zinc-400 hover:text-[#0F2F6B] disabled:opacity-30 rounded hover:bg-white cursor-pointer"
                                    >
                                      <ArrowDown size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => deleteFaqItem(sIdx, iIdx)}
                                      className="p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer mt-1"
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
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* STANDARD POLICIES CMS SECTION */
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-serif font-bold text-[#0F2F6B]">Policy Sections</h3>
                <button
                  type="button"
                  onClick={addPolicySection}
                  className="bg-[#0F2F6B]/10 hover:bg-[#0F2F6B]/20 text-[#0F2F6B] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus size={14} /> Add Section
                </button>
              </div>

              {policySections.length === 0 ? (
                <div className="text-center py-12 bg-white border border-dashed border-zinc-300 rounded-2xl text-zinc-500 text-sm">
                  No policy sections added yet. Click &quot;Add Section&quot; to begin.
                </div>
              ) : (
                <div className="space-y-4">
                  {policySections.map((section, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4"
                    >
                      <div className="flex justify-between items-center gap-3 border-b border-zinc-100 pb-2">
                        <div className="flex-grow">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                            Section Heading
                          </label>
                          <input
                            type="text"
                            required
                            value={section.title}
                            onChange={(e) => updatePolicySectionTitle(idx, e.target.value)}
                            className="w-full font-serif font-bold text-primary text-base border-b border-dashed border-zinc-200 focus:border-secondary outline-none pb-0.5"
                          />
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => movePolicySection(idx, "up")}
                            disabled={idx === 0}
                            className="p-1.5 text-zinc-400 hover:text-[#0F2F6B] disabled:opacity-30 rounded hover:bg-zinc-50 cursor-pointer"
                            title="Move Section Up"
                          >
                            <ArrowUp size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => movePolicySection(idx, "down")}
                            disabled={idx === policySections.length - 1}
                            className="p-1.5 text-zinc-400 hover:text-[#0F2F6B] disabled:opacity-30 rounded hover:bg-zinc-50 cursor-pointer"
                            title="Move Section Down"
                          >
                            <ArrowDown size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deletePolicySection(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                            title="Delete Section"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                          Section Body Content
                        </label>
                        <textarea
                          required
                          rows={5}
                          value={section.content}
                          onChange={(e) => updatePolicySectionContent(idx, e.target.value)}
                          className="w-full text-xs text-zinc-700 bg-zinc-50/50 border border-zinc-200 rounded-xl p-3 focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none resize-y leading-relaxed"
                          placeholder={
                            activeTab === "refund"
                              ? "Note: you can use {returnWindow} to display the custom Return Window number dynamically in this text."
                              : "Enter content here..."
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Form Bottom Save */}
          <div className="flex justify-end border-t border-zinc-200 pt-6">
            <button
              type="submit"
              disabled={loading || saving}
              className="bg-[#0F2F6B] hover:bg-blue-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Save size={18} />
              {saving ? "Saving Changes..." : "Publish Policies"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
