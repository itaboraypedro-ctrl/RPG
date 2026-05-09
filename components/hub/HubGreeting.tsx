"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/lib/types";

type Props = {
  profile: Profile;
  hasActiveGame: boolean;
  pendingInvitesCount: number;
};

function periodFromHour(hour: number): "manha" | "tarde" | "noite" {
  if (hour >= 5 && hour < 12) return "manha";
  if (hour >= 12 && hour < 18) return "tarde";
  return "noite";
}

const PERIOD_LABEL = {
  manha: "Bom dia",
  tarde: "Boa tarde",
  noite: "Boa noite",
} as const;

export function HubGreeting({
  profile,
  hasActiveGame,
  pendingInvitesCount,
}: Props) {
  const [greeting, setGreeting] = useState<string | null>(null);

  useEffect(() => {
    setGreeting(PERIOD_LABEL[periodFromHour(new Date().getHours())]);
  }, []);

  const subline = hasActiveGame
    ? "Você tem uma partida em andamento."
    : pendingInvitesCount > 0
      ? `Você tem ${pendingInvitesCount} convite${pendingInvitesCount === 1 ? "" : "s"} novo${pendingInvitesCount === 1 ? "" : "s"}.`
      : "Pronto para uma nova aventura?";

  return (
    <section className="px-4 pt-10 pb-6 sm:px-8 sm:pt-14 sm:pb-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-cinzel text-3xl font-light tracking-[0.18em] text-arcana-text sm:text-4xl">
          {greeting ? `${greeting}, ${profile.display_name}.` : `Olá, ${profile.display_name}.`}
        </h1>
        <p className="mt-3 font-crimson text-base italic text-arcana-text-dim sm:text-lg">
          {subline}
        </p>
      </div>
    </section>
  );
}
