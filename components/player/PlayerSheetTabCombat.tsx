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

  const [openAttack, setOpenAttack] = useState<Attack | null>(null);
  const [openAbility, setOpenAbility] = useState<CharacterAbility | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <section>
        <h3
          className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-rpg-text-dim"
          style={{ fontFamily: "var(--font-rpg-hud)" }}
        >
          Ataques
        </h3>
        {attacks.length === 0 ? (
          <p className="rounded-md border border-rpg-border bg-rpg-bg p-3 text-xs text-rpg-text-dim">
            Nenhum ataque cadastrado. Peça ao Mestre para adicionar.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {attacks.map((a, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setOpenAttack(a)}
                className="flex flex-col gap-1 rounded-md border border-rpg-border bg-rpg-bg p-3 text-left transition-colors hover:border-rpg-red/60"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className="text-sm font-semibold text-rpg-text"
                    style={{ fontFamily: "var(--font-rpg-numbers)" }}
                  >
                    {a.name}
                  </span>
                  {a.kind && (
                    <span
                      className="text-[10px] uppercase tracking-wider text-rpg-text-dim"
                      style={{ fontFamily: "var(--font-rpg-hud)" }}
                    >
                      {a.kind}
                    </span>
                  )}
                </div>
                <div className="flex gap-3 text-[11px]">
                  {a.bonus !== undefined && (
                    <span className="tabular-nums text-rpg-blue">
                      Bônus {fmtBonus(a.bonus)}
                    </span>
                  )}
                  {a.damage && (
                    <span className="tabular-nums text-rpg-red">
                      Dano {a.damage}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3
          className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-rpg-text-dim"
          style={{ fontFamily: "var(--font-rpg-hud)" }}
        >
          Habilidades especiais
        </h3>
        {abilities.length === 0 ? (
          <p className="rounded-md border border-rpg-border bg-rpg-bg p-3 text-xs text-rpg-text-dim">
            Nenhuma habilidade cadastrada.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {abilities.map((a, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setOpenAbility(a)}
                className="flex items-center justify-between gap-2 rounded-md border border-rpg-border bg-rpg-bg p-3 text-left transition-colors hover:border-rpg-gold/60"
              >
                <span
                  className="text-sm font-semibold text-rpg-text"
                  style={{ fontFamily: "var(--font-rpg-numbers)" }}
                >
                  {a.name}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                    a.type === "active"
                      ? "bg-rpg-gold/20 text-rpg-gold"
                      : "bg-rpg-blue/20 text-rpg-blue"
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
          <h3
            className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-rpg-text-dim"
            style={{ fontFamily: "var(--font-rpg-hud)" }}
          >
            Astúcia racial / Traços
          </h3>
          <div className="whitespace-pre-wrap rounded-md border border-rpg-border bg-rpg-bg p-3 text-sm leading-relaxed text-rpg-text">
            {traits}
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
            <div className="grid grid-cols-2 gap-2 rounded-md border border-rpg-border bg-rpg-bg p-3">
              {openAttack.bonus !== undefined && (
                <DetailRow label="Bônus" value={fmtBonus(openAttack.bonus)} />
              )}
              {openAttack.damage && (
                <DetailRow label="Dano" value={openAttack.damage} />
              )}
            </div>
            {openAttack.description && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-rpg-text">
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
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-rpg-text">
            {openAbility.description}
          </p>
        )}
      </PlayerBottomSheet>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="text-[10px] uppercase tracking-[0.2em] text-rpg-text-dim"
        style={{ fontFamily: "var(--font-rpg-hud)" }}
      >
        {label}
      </span>
      <span
        className="text-base tabular-nums text-rpg-text"
        style={{ fontFamily: "var(--font-rpg-numbers)" }}
      >
        {value}
      </span>
    </div>
  );
}

function fmtBonus(b: string | number): string {
  if (typeof b === "number") return b >= 0 ? `+${b}` : `${b}`;
  return b.startsWith("+") || b.startsWith("-") ? b : `+${b}`;
}
