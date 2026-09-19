"use client";

import { useState } from "react";
import type { Character } from "@/lib/types";
import {
  modifierOf,
  proficiencyBonusOf,
  skillsMetaOf,
  statsOf,
} from "@/components/characters/types";
import { PlayerHpBar } from "./PlayerHpBar";
import { PlayerBottomSheet } from "./PlayerBottomSheet";
import {
  commitCharacterField,
  commitStatsField,
  effortOf,
  hpStatusOf,
} from "./sheet-utils";

const CONDITION_DESCRIPTIONS: Record<string, string> = {
  Cego: "Falha em testes que requerem visão. Ataques contra você têm vantagem; seus ataques têm desvantagem.",
  Caído: "Movimento limitado a se levantar. Ataques corpo-a-corpo contra você têm vantagem; ataques à distância, desvantagem.",
  Enfeitiçado: "Não pode atacar o conjurador. O conjurador tem vantagem em testes sociais.",
  Envenenado: "Desvantagem em ataques e testes de habilidade.",
  Paralisado: "Incapacitado. Ataques têm vantagem; corpo-a-corpo a 1.5m são acertos críticos automáticos.",
  Petrificado: "Transformado em sólido. Resistência a todo dano. Imune a veneno e doença.",
  Atordoado: "Incapacitado, fala balbuciante. Ataques têm vantagem.",
  Inconsciente: "Incapacitado, deita no chão. Ataques têm vantagem; corpo-a-corpo a 1.5m são críticos.",
  Invisível: "Invisível ao olho nu. Ataques contra você têm desvantagem; seus ataques têm vantagem.",
  Surdo: "Falha em testes que requerem audição.",
  Amedrontado: "Desvantagem em testes enquanto a fonte do medo estiver visível. Não pode se aproximar dela.",
  Agarrado: "Velocidade 0. Termina se a fonte for incapacitada.",
  Restrito: "Velocidade 0. Ataques contra você têm vantagem; seus ataques têm desvantagem; desvantagem em DES.",
  Incapacitado: "Não pode tomar ações ou reações.",
};

const CONDITION_COLOR: Record<string, string> = {
  envenenado: "bg-emerald-500 text-emerald-950",
  atordoado: "bg-amber-400 text-amber-950",
  paralisado: "bg-amber-500 text-amber-950",
  amedrontado: "bg-purple-500 text-white",
  enfeitiçado: "bg-pink-400 text-pink-950",
  inconsciente: "bg-red-500 text-white",
  cego: "bg-zinc-500 text-white",
  surdo: "bg-zinc-500 text-white",
};

type Props = {
  character: Character;
  editable: boolean;
  onError: (message: string | null) => void;
};

export function PlayerSheetHeader({ character, editable, onError }: Props) {
  const [conditionOpen, setConditionOpen] = useState<string | null>(null);

  const stats = statsOf(character);
  const meta = skillsMetaOf(character);
  const initial = character.name.charAt(0).toUpperCase();
  const hpStatus = hpStatusOf(character.hp, character.max_hp);
  const hpPct = character.max_hp > 0 ? (character.hp / character.max_hp) * 100 : 0;
  const effort = effortOf(character.stats);
  const initiative = modifierOf(stats.dexterity);
  const profBonus = proficiencyBonusOf(character.level);

  const avatarRing =
    character.hp === 0 ? "ring-red-500"
    : hpPct < 30 ? "ring-red-500"
    : hpPct < 60 ? "ring-amber-500"
    : "ring-emerald-500";

  async function commitHp(value: number) {
    const { error } = await commitCharacterField(character.id, { hp: value });
    onError(error);
  }
  async function commitEffort(value: number) {
    const { error } = await commitStatsField(character.id, character.stats as Record<string, unknown>, "esforco", value);
    onError(error);
  }
  async function commitTempHp(value: number) {
    const { error } = await commitCharacterField(character.id, { temp_hp: value });
    onError(error);
  }

  return (
    <header className="shrink-0 border-b border-zinc-800 bg-zinc-900 px-4 py-3">
      {/* Top row: avatar + identity + quick stats */}
      <div className="flex items-center gap-4">

        {/* Avatar */}
        <div className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ${avatarRing} ${hpStatus.pulse ? "animate-pulse" : ""}`}>
          {character.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={character.avatar_url} alt={character.name} className="h-full w-full object-cover object-top" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-xl font-semibold text-zinc-300">
              {initial}
            </div>
          )}
        </div>

        {/* Name + class + conditions */}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold leading-tight text-zinc-100" style={{ fontFamily: "var(--font-rpg-numbers)" }}>
            {character.name}
          </h1>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-zinc-500" style={{ fontFamily: "var(--font-rpg-hud)" }}>
            {character.class || "—"} · Nv.{character.level} · {character.race || "—"}
            {(meta.alignment || meta.background) && ` · ${[meta.alignment, meta.background].filter(Boolean).join(" · ")}`}
          </p>
          {/* Condition pills */}
          {character.conditions.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {character.conditions.slice(0, 4).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setConditionOpen(c)}
                  className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide transition-opacity hover:opacity-80 ${CONDITION_COLOR[c.toLowerCase()] ?? "bg-amber-400 text-amber-950"}`}
                >
                  {c}
                </button>
              ))}
              {character.conditions.length > 4 && (
                <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-[9px] font-bold text-zinc-300">
                  +{character.conditions.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Quick stats grid */}
        <div className="hidden shrink-0 grid-cols-4 gap-1.5 sm:grid">
          <QuickStat label="CA" value={String(character.ac)} />
          <QuickStat label="Inic" value={fmtMod(initiative)} />
          <QuickStat label="Vel" value={`${character.speed}m`} />
          <QuickStat label="Prof" value={fmtMod(profBonus)} />
        </div>
      </div>

      {/* HP + Effort bars */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <PlayerHpBar
              kind="hp"
              label="HP"
              current={character.hp}
              max={character.max_hp}
              extra={character.temp_hp}
              status={{ label: hpStatus.label, color: hpStatus.color }}
              pulse={hpStatus.pulse}
              disabled={!editable}
              onCommit={commitHp}
            />
          </div>
          {/* Temp HP inline */}
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500" style={{ fontFamily: "var(--font-rpg-hud)" }}>
              Temp
            </span>
            <input
              key={`temp-${character.temp_hp}`}
              type="number"
              inputMode="numeric"
              min={0}
              defaultValue={character.temp_hp}
              disabled={!editable}
              onBlur={(e) => commitTempHp(Math.max(0, Number(e.target.value) || 0))}
              onKeyDown={(e) => { if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur(); }}
              className="w-11 rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 text-center text-xs tabular-nums text-zinc-200 focus:border-emerald-500 focus:outline-none disabled:opacity-40"
              style={{ fontFamily: "var(--font-rpg-numbers)" }}
            />
          </div>
        </div>

        {effort.max > 0 && (
          <PlayerHpBar
            kind="effort"
            label="Esforço"
            current={effort.current}
            max={Math.max(effort.max, effort.current, 0)}
            disabled={!editable || effort.max === 0}
            onCommit={commitEffort}
          />
        )}

        {/* Mobile quick stats */}
        <div className="grid grid-cols-4 gap-1 sm:hidden">
          <QuickStat label="CA" value={String(character.ac)} />
          <QuickStat label="Inic" value={fmtMod(initiative)} />
          <QuickStat label="Vel" value={`${character.speed}m`} />
          <QuickStat label="Prof" value={fmtMod(profBonus)} />
        </div>
      </div>

      {/* Condition detail sheet */}
      <PlayerBottomSheet
        open={conditionOpen !== null}
        onClose={() => setConditionOpen(null)}
        title={conditionOpen ?? undefined}
        subtitle="Condição"
        accent="gold"
      >
        <p className="text-sm leading-relaxed text-zinc-300">
          {conditionOpen ? (CONDITION_DESCRIPTIONS[conditionOpen] ?? "Sem descrição registrada.") : ""}
        </p>
        <p className="mt-3 text-[11px] text-zinc-500">
          O Mestre adicionou esta condição. Pergunte-lhe sobre o efeito atual.
        </p>
      </PlayerBottomSheet>
    </header>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded border border-zinc-800 bg-zinc-950 py-1.5">
      <span className="text-[8px] uppercase tracking-[0.2em] text-zinc-500" style={{ fontFamily: "var(--font-rpg-hud)" }}>
        {label}
      </span>
      <span className="text-sm tabular-nums text-emerald-400" style={{ fontFamily: "var(--font-rpg-numbers)" }}>
        {value}
      </span>
    </div>
  );
}

function fmtMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}
