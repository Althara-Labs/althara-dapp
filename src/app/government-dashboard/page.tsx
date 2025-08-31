"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";


export default function GovernmentDashboard() {
  const router = useRouter();


  useEffect(() => {
    // Redirect to government settings
    router.push("/government-settings");
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Government Settings...</p>
      </div>
    </div>
  );
}
