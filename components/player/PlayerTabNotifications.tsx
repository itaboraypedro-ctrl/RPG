"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import type { Notification, NotificationType } from "@/lib/types";

type Props = {
  notifications: Notification[];
  onRead: (id: string) => void;
};

const TYPE_CLASS: Record<NotificationType, string> = {
  info: "bg-sky-900/50 text-sky-300",
  warning: "bg-amber-900/50 text-amber-300",
  combat: "bg-red-900/50 text-red-300",
  item: "bg-yellow-900/50 text-yellow-300",
  level_up: "bg-violet-900/50 text-violet-300 animate-pulse",
  custom: "bg-zinc-800 text-zinc-300",
};

const TYPE_LABEL: Record<NotificationType, string> = {
  info: "Aviso",
  warning: "Atenção",
  combat: "Combate",
  item: "Item",
  level_up: "Level up",
  custom: "Outro",
};

export function PlayerTabNotifications({ notifications, onRead }: Props) {
  const [error, setError] = useState<string | null>(null);

  async function markRead(n: Notification) {
    if (n.read) return;
    onRead(n.id);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", n.id);
    if (updateError) setError(updateError.message);
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
        <span className="text-3xl">🔔</span>
        <p className="text-sm text-zinc-400">Sem notificações.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {notifications.map((n) => {
        const time = new Date(n.created_at).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return (
          <button
            key={n.id}
            type="button"
            onClick={() => markRead(n)}
            className={`flex flex-col gap-1 rounded-md border bg-zinc-900 p-3 text-left transition-colors ${
              n.read
                ? "border-zinc-800 opacity-70"
                : "border-emerald-700 hover:bg-zinc-800"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${TYPE_CLASS[n.type]}`}
                >
                  {TYPE_LABEL[n.type]}
                </span>
                <span className="text-sm font-medium text-zinc-100">{n.title}</span>
              </div>
              <span className="text-[10px] text-zinc-500">{time}</span>
            </div>
            {n.message && (
              <p className="text-xs text-zinc-300">{n.message}</p>
            )}
            {!n.read && (
              <span className="text-[10px] uppercase tracking-wide text-emerald-400">
                Não lida — toque para marcar como lida
              </span>
            )}
          </button>
        );
      })}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
