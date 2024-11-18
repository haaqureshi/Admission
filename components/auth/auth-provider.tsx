"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const checkTeamMembership = async (email: string) => {
    const { data: teamMembers, error } = await supabase
      .from('admission_team')
      .select('email')
      .eq('email', email)
      .single();

    if (error || !teamMembers) {
      await supabase.auth.signOut();
      toast({
        title: "Access Denied",
        description: "You are not authorized to access this application.",
        variant: "destructive",
      });
      router.push('/login');
      return false;
    }
    return true;
  };

  useEffect(() => {
    // Skip auth check for form page
    if (pathname === '/form') {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user?.email) {
        await checkTeamMembership(session.user.email);
      }
      
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user?.email) {
        if (!session.user.email.endsWith("@bsolpk.org")) {
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "Only @bsolpk.org email addresses are allowed.",
            variant: "destructive",
          });
          router.push('/login');
          return;
        }

        const isTeamMember = await checkTeamMembership(session.user.email);
        if (isTeamMember) {
          router.push("/dashboard");
        }
      } else if (pathname !== '/form') {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          hd: "bsolpk.org",
          prompt: "select_account"
        },
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const value = {
    user,
    session,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};