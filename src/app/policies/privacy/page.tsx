import React from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_PRIVACY } from "@/lib/defaultPolicies";
import PolicyPageLayout from "@/components/PolicyPageLayout";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Privacy Policy | ElanoraGems",
  description: "Learn how ElanoraGems collects, stores, protects, and uses your personal information and cookies when visiting our premium online store.",
  keywords: "privacy policy, data security, cookie settings, user data rights, ElanoraGems privacy",
};

export default async function PrivacyPolicyPage() {
  let policyData = DEFAULT_PRIVACY;

  try {
    const docRef = doc(db, "policies", "privacy");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.sections) {
        policyData = data as any;
      }
    }
  } catch (error) {
    console.error("Error fetching privacy policy from Firestore:", error);
  }

  return (
    <PolicyPageLayout
      policyId="privacy"
      title="Privacy Policy"
      data={policyData}
    />
  );
}
