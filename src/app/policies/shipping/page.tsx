import React from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_SHIPPING } from "@/lib/defaultPolicies";
import PolicyPageLayout from "@/components/PolicyPageLayout";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shipping Policy | ElanoraGems",
  description: "Learn about processing times, standard domestic delivery schedules, shipping charges, and tracking methods at ElanoraGems.",
  keywords: "shipping policy, delivery times, tracking link, free shipping, domestic delivery, ElanoraGems shipping",
};

export default async function ShippingPolicyPage() {
  let policyData = DEFAULT_SHIPPING;

  try {
    const docRef = doc(db, "policies", "shipping");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.sections) {
        policyData = data as any;
      }
    }
  } catch (error) {
    console.error("Error fetching shipping policy from Firestore:", error);
  }

  return (
    <PolicyPageLayout
      policyId="shipping"
      title="Shipping Policy"
      data={policyData}
    />
  );
}
