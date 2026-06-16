import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_FAQ } from "@/lib/defaultPolicies";
import Link from "next/link";
import FAQClient from "./FAQClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Frequently Asked Questions | ElanoraGems",
  description: "Have questions about ordering, payments, shipping, products, or returns? Find answers in our Frequently Asked Questions section.",
  keywords: "faq, jewellery help, order tracking, returns policy, shipping time, ElanoraGems help",
};

export default async function FAQPage() {
  let faqData = DEFAULT_FAQ;

  try {
    const docRef = doc(db, "policies", "faq");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.sections) {
        faqData = data as any;
      }
    }
  } catch (error) {
    console.error("Error fetching FAQ from Firestore:", error);
  }

  // Create FAQPage JSON-LD schema for SEO rich results
  const schemaList = faqData.sections.flatMap((section) =>
    section.items.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    }))
  );

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": schemaList,
  };

  return (
    <>
      {/* FAQ Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-white flex flex-col justify-between">
        <Header />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-6">
            <Link href="/" className="hover:text-secondary transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-zinc-600">FAQ</span>
          </nav>

          {/* Header */}
          <div className="border-b border-zinc-150 pb-6 mb-10">
            <span className="text-secondary text-xs font-bold uppercase tracking-widest block mb-1">
              Customer Support
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary">
              Frequently Asked Questions
            </h1>
            <p className="text-zinc-500 text-xs sm:text-sm mt-2">
              Find instant answers to common questions about your shopping experience. Last Updated: {faqData.lastUpdated}
            </p>
          </div>

          {/* FAQ Sections with Accordions */}
          <FAQClient initialData={faqData} />
        </main>

        <Footer />
        <CartDrawer />
      </div>
    </>
  );
}
