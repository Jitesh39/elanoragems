"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PoliciesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/settings?tab=policies");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Redirecting to Settings...</p>
    </div>
  );
}
