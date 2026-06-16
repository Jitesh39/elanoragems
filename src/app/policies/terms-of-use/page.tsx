import React from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_TERMS_OF_USE } from "@/lib/defaultPolicies";
import PolicyPageLayout from "@/components/PolicyPageLayout";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Terms of Use | ElanoraGems",
  description: "Read the website Terms of Use for ElanoraGems, including user responsibilities, intellectual property ownership, and account security guidelines.",
  keywords: "terms of use, acceptable use, intellectual property, account security, ElanoraGems user policy",
};

export default async function TermsOfUsePage() {
  let policyData = DEFAULT_TERMS_OF_USE;

  try {
    const docRef = doc(db, "policies", "terms-of-use");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.sections) {
        policyData = data as any;
      }
    }
  } catch (error) {
    console.error("Error fetching terms of use from Firestore:", error);
  }

  return (
    <PolicyPageLayout
      policyId="terms-of-use"
      title="Terms of Use"
      data={policyData}
    />
  );
}
