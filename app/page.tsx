"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

export default function Home() {
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [session, router]);

  return null;
}