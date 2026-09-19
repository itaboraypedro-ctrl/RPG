import { notFound, redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { StoryHub } from "@/components/campaign-story/StoryHub";
import type { CampaignElement, Session } from "@/lib/types";

export const metadata = { title: "Hub de História — ARCANA" };

export default async function CampaignStoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;

  const auth = await getProfile();
  if (!auth) redirect(`/login?redirect=/campaigns/${id}/story`);

  const supabase = await createClient();
  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!session) notFound();
  const typed = session as Session;
  if (typed.gm_id !== auth.user.id) redirect("/unauthorized");

  const { data: elements } = await supabase
    .from("campaign_elements")
    .select("*")
    .eq("session_id", id)
    .order("kind")
    .order("position")
    .order("created_at");

  return (
    <StoryHub
      session={typed}
      initialElements={(elements ?? []) as CampaignElement[]}
      justCreated={created === "1"}
    />
  );
}
