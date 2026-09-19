"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

const NOOP = () => () => {};

// Versão arcana do link de convite (a de components/sessions/InviteLink.tsx é zinc/dashboard).
export function InviteChip({ inviteCode }: { inviteCode: string }) {
  const url = useSyncExternalStore(
    NOOP,
    useCallback(() => `${window.location.origin}/join/${inviteCode}`, [inviteCode]),
    () => "",
  );
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard pode falhar em alguns contextos; degrada em silêncio
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      disabled={!url}
      title={url || "Link de convite"}
      className="flex items-center gap-2 rounded-xl border border-arcana-border bg-arcana-surface px-3 py-2 transition-all hover:border-arcana-gold/50 disabled:opacity-50"
    >
      <span className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-text-dim">
        Convite
      </span>
      <code className="max-w-[140px] truncate font-crimson text-xs text-arcana-text lg:max-w-[220px]">
        /join/{inviteCode}
      </code>
      <span className="font-cinzel text-[10px] uppercase tracking-[0.25em] text-arcana-gold">
        {copied ? "Copiado!" : "Copiar"}
      </span>
    </button>
  );
}
