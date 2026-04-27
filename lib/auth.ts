import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./supabase-server";
import type { Profile, Role } from "./types";

const ROLE_RANK: Record<Role, number> = {
  player: 0,
  gm: 1,
  admin: 2,
};

export async function getProfile(): Promise<{ user: User; profile: Profile } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();
  if (!profile) return null;

  return { user, profile };
}

export async function requireRole(
  role: Role | Role[]
): Promise<{ user: User; profile: Profile }> {
  const result = await getProfile();
  if (!result) redirect("/login");

  const allowed = Array.isArray(role) ? role : [role];
  const minRank = Math.min(...allowed.map((r) => ROLE_RANK[r]));
  if (ROLE_RANK[result.profile.role] < minRank) redirect("/unauthorized");

  return result;
}
