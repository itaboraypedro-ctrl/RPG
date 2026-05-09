"use client";

import Link from "next/link";

type Props = {
  sessionTitle: string;
  characterName: string | null;
  durationMs: number;
  damageTaken: number;
  xpGained: number;
  itemsReceived: number;
};

function fmtDuration(ms: number): string {
  if (ms <= 0) return "—";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m} min`;
}

export function PlayerSummary({
  sessionTitle,
  characterName,
  durationMs,
  damageTaken,
  xpGained,
  itemsReceived,
}: Props) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[390px] animate-fadeIn flex-col items-center gap-6 bg-zinc-950 px-4 py-10 text-zinc-100">
      <header className="flex flex-col items-center gap-2 text-center">
        <span className="text-5xl">🎬</span>
        <h1 className="text-xl font-bold tracking-tight">A partida encerrou!</h1>
        <p className="text-xs text-zinc-400">{sessionTitle}</p>
      </header>

      {characterName && (
        <p className="text-sm text-zinc-300">
          Você jogou como <strong className="text-emerald-300">{characterName}</strong>
        </p>
      )}

      <section className="grid w-full grid-cols-2 gap-3">
        <Stat label="Duração" value={fmtDuration(durationMs)} />
        <Stat label="Dano sofrido" value={`${damageTaken} HP`} />
        <Stat label="XP ganho" value={`+${xpGained}`} />
        <Stat label="Itens recebidos" value={String(itemsReceived)} />
      </section>

      <Link
        href="/"
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
      >
        Voltar ao início
      </Link>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-zinc-800 bg-zinc-900 p-3">
      <span className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</span>
      <span className="text-base font-semibold text-zinc-100">{value}</span>
    </div>
  );
}
