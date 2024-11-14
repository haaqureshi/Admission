"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/auth";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  useEffect(() => {
    if (searchParams.get('error') === 'domain') {
      toast({
        title: "Access Denied",
        description: "Only @bsolpk.org email addresses are allowed",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with Google",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 flex flex-col items-center text-center">
          <div className="w-20 h-20 relative mb-4">
            <Image
              src="/bsol-logo.png"
              alt="Blackstone Board Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Blackstone Board</CardTitle>
          <CardDescription>
            Sign in with your @bsolpk.org email to access the admission management system
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            onClick={handleLogin}
            className="w-full max-w-sm flex items-center justify-center gap-2"
          >
            <Image
              src="/google.svg"
              alt="Google Logo"
              width={20}
              height={20}
              className="mr-2"
            />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}