import React from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_TERMS } from "@/lib/defaultPolicies";
import PolicyPageLayout from "@/components/PolicyPageLayout";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Terms & Conditions | ElanoraGems",
  description: "Read the official Terms and Conditions of ElanoraGems, detailing billing, pricing, returns jurisdiction, and user agreement terms.",
  keywords: "terms and conditions, customer terms, pricing policies, legal, ElanoraGems agreement",
};

export default async function TermsConditionsPage() {
  let policyData = DEFAULT_TERMS;

  try {
    const docRef = doc(db, "policies", "terms");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.sections) {
        policyData = data as any;
      }
    }
  } catch (error) {
    console.error("Error fetching terms and conditions from Firestore:", error);
  }

  return (
    <PolicyPageLayout
      policyId="terms"
      title="Terms & Conditions"
      data={policyData}
    />
  );
}
