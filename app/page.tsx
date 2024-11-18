"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const { session } = useAuth();

  useEffect(() => {
    // Allow unauthenticated access to /form
    if (pathname === '/form') {
      return;
    }

    // Handle authentication routing for other paths
    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [session, router, pathname]);

  // Return a loading state or null since this is just a router
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">Loading...</div>
    </div>
  );
}