import React from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_REFUND } from "@/lib/defaultPolicies";
import PolicyPageLayout from "@/components/PolicyPageLayout";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Refund & Return Policy | ElanoraGems",
  description: "Check return eligibility, unboxing requirements, shipping reverse-pickups, and overall refund timelines at ElanoraGems.",
  keywords: "refund policy, returns window, damaged jewelry claim, exchange policy, ElanoraGems returns",
};

export default async function RefundPolicyPage() {
  let policyData = DEFAULT_REFUND;

  try {
    const docRef = doc(db, "policies", "refund");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.sections) {
        policyData = data as any;
      }
    }
  } catch (error) {
    console.error("Error fetching refund policy from Firestore:", error);
  }

  return (
    <PolicyPageLayout
      policyId="refund"
      title="Refund Policy"
      data={policyData}
    />
  );
}
