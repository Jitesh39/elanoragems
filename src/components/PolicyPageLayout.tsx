import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { PolicyData } from "@/lib/defaultPolicies";
import Link from "next/link";
import { Shield, Clock, FileText } from "lucide-react";

interface PolicyPageLayoutProps {
  policyId: string;
  title: string;
  data: PolicyData;
}

export default function PolicyPageLayout({ policyId, title, data }: PolicyPageLayoutProps) {
  const returnWindow = data.returnWindow || 15;

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-6">
          <Link href="/" className="hover:text-secondary transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-400">Policies</span>
          <span>/</span>
          <span className="text-zinc-600 font-bold">{title}</span>
        </nav>

        {/* Hero Header */}
        <div className="relative overflow-hidden bg-[#F8F4F0] rounded-3xl p-6 sm:p-10 mb-10 border border-[#D4AF37]/15">
          <div className="absolute top-0 right-0 transform translate-x-10 -translate-y-10 w-48 h-48 rounded-full bg-[#D4AF37]/5 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest block mb-2">
                Store Policy & Guidelines
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary flex items-center gap-3">
                <Shield className="text-[#D4AF37] shrink-0" size={28} />
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 bg-white border border-zinc-200 px-4 py-2 rounded-xl w-fit shrink-0">
              <Clock size={14} className="text-[#D4AF37]" />
              <span>Last Updated: {data.lastUpdated}</span>
            </div>
          </div>
        </div>

        {/* Grid Content */}
        <div className="lg:grid lg:grid-cols-4 lg:gap-12 items-start font-sans">
          {/* Left Column: Quick Navigation Index (Desktop Only) */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-28 space-y-4">
            <div className="border border-zinc-100 rounded-2xl p-5 bg-zinc-50/50">
              <h3 className="font-serif text-primary font-bold text-sm uppercase tracking-wider mb-4 border-b border-zinc-200 pb-2 flex items-center gap-2">
                <FileText size={16} className="text-[#D4AF37]" />
                Contents
              </h3>
              <ul className="space-y-3">
                {data.sections.map((section, idx) => (
                  <li key={idx}>
                    <a
                      href={`#section-${idx}`}
                      className="block text-xs font-semibold text-zinc-500 hover:text-[#D4AF37] transition-colors hover:translate-x-1 duration-200 transform"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Right Column: Policy Content */}
          <article className="lg:col-span-3 space-y-10">
            {data.sections.map((section, idx) => {
              // Parse {returnWindow} in content dynamically if it's the refund policy
              let processedContent = section.content;
              if (policyId === "refund") {
                processedContent = processedContent.replace(/{returnWindow}/g, String(returnWindow));
              }

              return (
                <section key={idx} id={`section-${idx}`} className="scroll-mt-32 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-[#D4AF37] rounded-full shrink-0" />
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-primary">
                      {section.title}
                    </h2>
                  </div>
                  <div className="text-zinc-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line border-l border-zinc-100 pl-4 py-1 normal-case font-normal">
                    {processedContent}
                  </div>
                </section>
              );
            })}
          </article>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  );
}
