"use client";

import React, { useState } from "react";
import { FAQData } from "@/lib/defaultPolicies";
import { ChevronDown, Search, HelpCircle, MessageSquare } from "lucide-react";

interface FAQClientProps {
  initialData: FAQData;
}

export default function FAQClient({ initialData }: FAQClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  // Track open item by category and question text to avoid index mismatch
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const toggleItem = (key: string) => {
    setActiveKey(activeKey === key ? null : key);
  };

  // Filter sections and items based on search query
  const filteredSections = initialData.sections
    .map((section) => {
      const items = section.items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { ...section, items };
    })
    .filter((section) => section.items.length > 0);

  return (
    <div className="space-y-8 font-sans">
      {/* Search Input */}
      <div className="relative mb-8 max-w-md">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border border-zinc-200 rounded-2xl text-sm outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all bg-zinc-50/50"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
      </div>

      {filteredSections.length === 0 ? (
        <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
          <HelpCircle className="mx-auto text-zinc-300 mb-3" size={36} />
          <h3 className="text-zinc-700 font-bold">No answers found</h3>
          <p className="text-zinc-400 text-xs mt-1">Try checking a different spelling or keyword.</p>
        </div>
      ) : (
        filteredSections.map((section) => (
          <div key={section.title} className="space-y-4">
            {/* Section Header */}
            <h2 className="font-serif text-lg font-bold text-primary flex items-center gap-2 border-b border-zinc-100 pb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
              {section.title}
            </h2>

            {/* Questions list */}
            <div className="space-y-3">
              {section.items.map((item) => {
                const itemKey = `${section.title}-${item.question}`;
                const isOpen = activeKey === itemKey;

                return (
                  <div
                    key={item.question}
                    className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                      isOpen
                        ? "border-[#D4AF37]/30 bg-[#F8F4F0]/30 shadow-sm"
                        : "border-zinc-200 hover:border-zinc-300 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleItem(itemKey)}
                      className="w-full flex justify-between items-center text-left p-4 sm:p-5 text-sm sm:text-base font-semibold text-primary transition-colors hover:text-secondary cursor-pointer"
                    >
                      <span className="pr-4 flex items-start gap-3">
                        <MessageSquare className="text-secondary mt-1 shrink-0" size={16} />
                        {item.question}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`text-zinc-400 shrink-0 transition-transform duration-300 ${
                          isOpen ? "transform rotate-180 text-secondary" : ""
                        }`}
                      />
                    </button>
                    {/* Collapsible Answer */}
                    <div
                      className="transition-all duration-300 ease-in-out overflow-hidden"
                      style={{
                        maxHeight: isOpen ? "1000px" : "0px",
                        opacity: isOpen ? 1 : 0,
                        borderTop: isOpen ? "1px solid #f4f4f5" : "none"
                      }}
                    >
                      <div className="p-4 sm:p-5 text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal normal-case font-outfit">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Need more help banner */}
      <div className="bg-[#0F2F6B]/5 border border-[#0F2F6B]/10 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-12">
        <div>
          <h4 className="font-serif text-primary font-bold text-base">Still have questions?</h4>
          <p className="text-zinc-500 text-xs mt-1">Our dedicated premium customer service team is always here to assist you.</p>
        </div>
        <a
          href="mailto:gemselanora@gmail.com"
          className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm shrink-0"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
