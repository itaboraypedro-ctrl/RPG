"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import type { Role } from "@/lib/types";

const ROLE_RANK: Record<Role, number> = { player: 0, gm: 1, admin: 2 };

export function useRequireRole(role: Role | Role[]) {
  const { role: current, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!current) {
      router.replace("/login");
      return;
    }

    const allowed = Array.isArray(role) ? role : [role];
    const minRank = Math.min(...allowed.map((r) => ROLE_RANK[r]));
    if (ROLE_RANK[current] < minRank) {
      router.replace("/unauthorized");
    }
  }, [current, isLoading, role, router]);
}
