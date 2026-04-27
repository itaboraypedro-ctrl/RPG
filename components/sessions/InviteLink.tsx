"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

const NOOP = () => () => {};

export function InviteLink({ inviteCode }: { inviteCode: string }) {
  const url = useSyncExternalStore(
    NOOP,
    useCallback(
      () => `${window.location.origin}/join/${inviteCode}`,
      [inviteCode]
    ),
    () => ""
  );
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API can fail in some contexts; degrade silently
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-3">
      <p className="text-xs uppercase tracking-wide text-zinc-500">Link de convite</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded bg-zinc-950 px-2 py-1.5 text-xs text-zinc-300">
          {url || "..."}
        </code>
        <button
          type="button"
          onClick={copy}
          disabled={!url}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {copied ? "Copiado!" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
