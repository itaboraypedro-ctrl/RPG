"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase";
import type { Profile, Role } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  role: Role | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(
    async (uid: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .single<Profile>();
      setProfile(data ?? null);
    },
    [supabase]
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      const {
        data: { user: initialUser },
      } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(initialUser);
      if (initialUser) await loadProfile(initialUser.id);
      if (mounted) setIsLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        loadProfile(nextUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, loadProfile]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }, [supabase, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      role: profile?.role ?? null,
      isLoading,
      signOut,
    }),
    [user, profile, isLoading, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
