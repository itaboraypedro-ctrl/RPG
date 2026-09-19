"use client";

import { useState } from "react";
import type { Character } from "@/lib/types";
import {
  type CharacterAbility,
  skillsMetaOf,
} from "@/components/characters/types";
import { PlayerBottomSheet } from "./PlayerBottomSheet";

type Attack = {
  name: string;
  kind?: string;
  bonus?: string | number;
  damage?: string;
  description?: string;
};

type Props = {
  character: Character;
};

export function PlayerSheetTabCombat({ character }: Props) {
  const meta = skillsMetaOf(character);
  const attacks =
    ((meta as Record<string, unknown>).attacks as Attack[] | undefined) ?? [];
  const abilities = meta.abilities ?? [];
  const traits =
    ((meta as Record<string, unknown>).traits as string | undefined) ?? "";

  // from wizard: race traits and class features
  const raceTraits = character.race_traits?.traits ?? [];
  const classFeatures = character.class_features?.features ?? [];

  const [openAttack, setOpenAttack] = useState<Attack | null>(null);
  const [openAbility, setOpenAbility] = useState<CharacterAbility | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <section>
        <SectionLabel>Ataques</SectionLabel>
        {attacks.length === 0 ? (
          <EmptyState>Nenhum ataque cadastrado. Peça ao Mestre para adicionar.</EmptyState>
        ) : (
          <div className="flex flex-col gap-1.5">
            {attacks.map((a, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setOpenAttack(a)}
                className="relative flex flex-col gap-1 overflow-hidden rounded border border-zinc-800 bg-zinc-900 p-3 text-left transition-colors hover:border-blue-500/50"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-zinc-100" style={{ fontFamily: "var(--font-rpg-numbers)" }}>
                    {a.name}
                  </span>
                  {a.kind && (
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500" style={{ fontFamily: "var(--font-rpg-hud)" }}>
                      {a.kind}
                    </span>
                  )}
                </div>
                <div className="flex gap-3 text-[11px]">
                  {a.bonus !== undefined && (
                    <span className="tabular-nums text-blue-400">Bônus {fmtBonus(a.bonus)}</span>
                  )}
                  {a.damage && (
                    <span className="tabular-nums text-red-400">Dano {a.damage}</span>
                  )}
                </div>
                <div className="absolute bottom-1.5 right-2 text-[8px] uppercase tracking-widest text-zinc-700">toque</div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionLabel>Habilidades especiais</SectionLabel>
        {abilities.length === 0 ? (
          <EmptyState>Nenhuma habilidade cadastrada.</EmptyState>
        ) : (
          <div className="flex flex-col gap-1.5">
            {abilities.map((a, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setOpenAbility(a)}
                className="relative flex items-center justify-between gap-2 overflow-hidden rounded border border-zinc-800 bg-zinc-900 p-3 text-left transition-colors hover:border-amber-500/50"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
                <span className="text-sm font-semibold text-zinc-100" style={{ fontFamily: "var(--font-rpg-numbers)" }}>
                  {a.name}
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-[9px] uppercase tracking-wider ${
                    a.type === "active"
                      ? "border border-amber-500/30 bg-amber-950/30 text-amber-400"
                      : "border border-blue-500/30 bg-blue-950/30 text-blue-400"
                  }`}
                  style={{ fontFamily: "var(--font-rpg-hud)" }}
                >
                  {a.type === "active" ? "Ativa" : "Passiva"}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {traits.trim().length > 0 && (
        <section>
          <SectionLabel>Astúcia racial / Traços</SectionLabel>
          <div className="relative overflow-hidden rounded border border-zinc-800 bg-zinc-900 p-3">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-600 to-transparent" />
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{traits}</p>
          </div>
        </section>
      )}

      {raceTraits.length > 0 && (
        <section>
          <SectionLabel>Traços raciais</SectionLabel>
          <div className="flex flex-col gap-1">
            {raceTraits.map((t, i) => (
              <div key={i} className="relative overflow-hidden rounded border border-zinc-800 bg-zinc-900 px-3 py-2">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                <p className="text-sm text-zinc-300">{t}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {classFeatures.length > 0 && (
        <section>
          <SectionLabel>Features de classe</SectionLabel>
          <div className="flex flex-col gap-1.5">
            {classFeatures.map((f, i) => {
              const name = typeof f === "string" ? f : f.name;
              const desc = typeof f === "string" ? null : f.description;
              return (
                <div key={i} className="relative overflow-hidden rounded border border-amber-500/20 bg-zinc-900 px-3 py-2">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                  <p className="text-sm font-medium text-amber-300">{name}</p>
                  {desc && <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">{desc}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <PlayerBottomSheet
        open={openAttack !== null}
        onClose={() => setOpenAttack(null)}
        title={openAttack?.name}
        subtitle={openAttack?.kind ?? "Ataque"}
        accent="red"
      >
        {openAttack && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2 rounded border border-zinc-800 bg-zinc-950 p-3">
              {openAttack.bonus !== undefined && (
                <DetailRow label="Bônus" value={fmtBonus(openAttack.bonus)} />
              )}
              {openAttack.damage && (
                <DetailRow label="Dano" value={openAttack.damage} />
              )}
            </div>
            {openAttack.description && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                {openAttack.description}
              </p>
            )}
          </div>
        )}
      </PlayerBottomSheet>

      <PlayerBottomSheet
        open={openAbility !== null}
        onClose={() => setOpenAbility(null)}
        title={openAbility?.name}
        subtitle={openAbility?.type === "active" ? "Habilidade ativa" : "Habilidade passiva"}
        accent="gold"
      >
        {openAbility && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
            {openAbility.description}
          </p>
        )}
      </PlayerBottomSheet>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500" style={{ fontFamily: "var(--font-rpg-hud)" }}>
      {children}
    </h3>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-500">{children}</p>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500" style={{ fontFamily: "var(--font-rpg-hud)" }}>
        {label}
      </span>
      <span className="text-base tabular-nums text-zinc-100" style={{ fontFamily: "var(--font-rpg-numbers)" }}>
        {value}
      </span>
    </div>
  );
}

function fmtBonus(b: string | number): string {
  if (typeof b === "number") return b >= 0 ? `+${b}` : `${b}`;
  return b.startsWith("+") || b.startsWith("-") ? b : `+${b}`;
}
