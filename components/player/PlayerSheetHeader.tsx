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
  "Caído":
    "Movimento limitado a se levantar. Ataques corpo-a-corpo contra você têm vantagem; ataques à distância, desvantagem.",
  Enfeitiçado:
    "Não pode atacar o conjurador. O conjurador tem vantagem em testes sociais.",
  Envenenado: "Desvantagem em ataques e testes de habilidade.",
  Paralisado:
    "Incapacitado. Ataques têm vantagem; corpo-a-corpo a 1.5m são acertos críticos automáticos.",
  Petrificado:
    "Transformado em sólido. Resistência a todo dano. Imune a veneno e doença.",
  Atordoado: "Incapacitado, fala balbuciante. Ataques têm vantagem.",
  Inconsciente:
    "Incapacitado, deita no chão. Ataques têm vantagem; corpo-a-corpo a 1.5m são críticos.",
  "Invisível":
    "Invisível ao olho nu. Ataques contra você têm desvantagem; seus ataques têm vantagem.",
  Surdo: "Falha em testes que requerem audição.",
  Amedrontado:
    "Desvantagem em testes enquanto a fonte do medo estiver visível. Não pode se aproximar dela.",
  Agarrado: "Velocidade 0. Termina se a fonte for incapacitada.",
  Restrito:
    "Velocidade 0. Ataques contra você têm vantagem; seus ataques têm desvantagem; desvantagem em DES.",
  Incapacitado: "Não pode tomar ações ou reações.",
};

const CONDITION_DOT_COLOR: Record<string, string> = {
  envenenado: "bg-rpg-green",
  atordoado: "bg-rpg-gold",
  paralisado: "bg-amber-400",
  amedrontado: "bg-rpg-purple",
  enfeitiçado: "bg-pink-400",
  inconsciente: "bg-rpg-red",
  cego: "bg-zinc-500",
  surdo: "bg-zinc-500",
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

  const avatarBorder =
    character.hp === 0
      ? "border-rpg-red"
      : hpPct < 30
        ? "border-rpg-red"
        : hpPct < 60
          ? "border-amber-500"
          : "border-rpg-green";

  const visibleConditions = character.conditions.slice(0, 5);
  const extraConditions = character.conditions.length - visibleConditions.length;

  async function commitHp(value: number) {
    const { error } = await commitCharacterField(character.id, { hp: value });
    onError(error);
  }

  async function commitEffort(value: number) {
    const { error } = await commitStatsField(
      character.id,
      character.stats as Record<string, unknown>,
      "esforco",
      value
    );
    onError(error);
  }

  async function commitTempHp(value: number) {
    const { error } = await commitCharacterField(character.id, { temp_hp: value });
    onError(error);
  }

  return (
    <header className="flex flex-col gap-3 border-b border-rpg-border bg-rpg-surface px-4 pb-4 pt-3">
      <div className="flex flex-col items-center gap-0.5 text-center">
        <h1
          className="text-xl font-semibold leading-tight text-rpg-text"
          style={{ fontFamily: "var(--font-rpg-numbers)" }}
        >
          {character.name}
        </h1>
        <p
          className="text-[11px] uppercase tracking-[0.2em] text-rpg-text-dim"
          style={{ fontFamily: "var(--font-rpg-hud)" }}
        >
          {character.class || "—"} · Nv.{character.level} · {character.race || "—"}
        </p>
        {(meta.alignment || meta.background) && (
          <p className="text-[10px] italic text-rpg-text-dim">
            {[meta.alignment, meta.background].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      <div className="relative mx-auto h-[120px] w-[120px]">
        {character.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={character.avatar_url}
            alt={character.name}
            className={`h-full w-full rounded-full border-4 object-cover transition-colors duration-300 ${avatarBorder} ${
              hpStatus.pulse ? "animate-pulse" : ""
            }`}
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center rounded-full border-4 bg-rpg-bg text-4xl text-rpg-text transition-colors duration-300 ${avatarBorder} ${
              hpStatus.pulse ? "animate-pulse" : ""
            }`}
            style={{ fontFamily: "var(--font-rpg-numbers)" }}
          >
            {initial}
          </div>
        )}

        {character.conditions.length > 0 && (
          <div className="absolute -right-1 -top-1 flex max-w-[120px] flex-wrap justify-end gap-1">
            {visibleConditions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setConditionOpen(c)}
                title={c}
                className={`h-3 w-3 rounded-full border border-rpg-bg shadow ${
                  CONDITION_DOT_COLOR[c.toLowerCase()] ?? "bg-amber-400"
                }`}
                aria-label={`Ver condição: ${c}`}
              />
            ))}
            {extraConditions > 0 && (
              <span
                className="rounded-full border border-rpg-bg bg-rpg-surface px-1 text-[9px] font-bold text-rpg-text"
                style={{ fontFamily: "var(--font-rpg-hud)" }}
              >
                +{extraConditions}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        <QuickStat label="CA" value={String(character.ac)} />
        <QuickStat label="Inic." value={fmtMod(initiative)} />
        <QuickStat label="Vel" value={`${character.speed}m`} />
        <QuickStat label="Prof" value={fmtMod(profBonus)} />
      </div>

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

      <div className="flex items-center gap-2 text-[10px] text-rpg-text-dim">
        <span
          className="uppercase tracking-[0.2em]"
          style={{ fontFamily: "var(--font-rpg-hud)" }}
        >
          Temp HP
        </span>
        <input
          key={`temp-${character.temp_hp}`}
          type="number"
          inputMode="numeric"
          min={0}
          defaultValue={character.temp_hp}
          disabled={!editable}
          onBlur={(e) => commitTempHp(Math.max(0, Number(e.target.value) || 0))}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
          }}
          className="w-12 rounded-md border border-rpg-border bg-rpg-bg px-1 py-0.5 text-center tabular-nums text-rpg-text disabled:opacity-50"
          style={{ fontFamily: "var(--font-rpg-numbers)" }}
        />
      </div>

      <PlayerHpBar
        kind="effort"
        label="Esforço"
        current={effort.current}
        max={Math.max(effort.max, effort.current, 0)}
        disabled={!editable || effort.max === 0}
        onCommit={commitEffort}
      />

      <PlayerBottomSheet
        open={conditionOpen !== null}
        onClose={() => setConditionOpen(null)}
        title={conditionOpen ?? undefined}
        subtitle="Condição"
        accent="gold"
      >
        <p className="text-sm leading-relaxed text-rpg-text">
          {conditionOpen
            ? (CONDITION_DESCRIPTIONS[conditionOpen] ??
              "Sem descrição registrada.")
            : ""}
        </p>
        <p className="mt-3 text-[11px] text-rpg-text-dim">
          O Mestre adicionou esta condição. Pergunte-lhe sobre o efeito atual.
        </p>
      </PlayerBottomSheet>
    </header>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-md border border-rpg-border bg-rpg-bg py-2">
      <span
        className="text-[9px] uppercase tracking-[0.2em] text-rpg-text-dim"
        style={{ fontFamily: "var(--font-rpg-hud)" }}
      >
        {label}
      </span>
      <span
        className="text-base tabular-nums text-rpg-blue"
        style={{ fontFamily: "var(--font-rpg-numbers)" }}
      >
        {value}
      </span>
    </div>
  );
}

function fmtMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}
