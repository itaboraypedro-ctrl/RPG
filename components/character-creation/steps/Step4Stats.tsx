"use client";

import { useMemo, useState } from "react";
import type {
  AbilityKey,
  CharacterCreationData,
  StatBlock,
} from "@/lib/character-creation/types";
import { CLASSES } from "@/lib/character-creation/class-data";
import { RACES } from "@/lib/character-creation/race-data";

type Props = {
  data: Partial<CharacterCreationData>;
  onUpdate: (partial: Partial<CharacterCreationData>) => void;
  onNext: () => void;
  onBack: () => void;
};

type StatMethod = "array" | "pointbuy" | "roll";

const ABILITY_LABEL: Record<AbilityKey, string> = {
  str: "FOR",
  dex: "DES",
  con: "CON",
  int: "INT",
  wis: "SAB",
  cha: "CAR",
};

const ABILITY_FULL: Record<AbilityKey, string> = {
  str: "Força",
  dex: "Destreza",
  con: "Constituição",
  int: "Inteligência",
  wis: "Sabedoria",
  cha: "Carisma",
};

const ABILITY_ORDER: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const;
const POINT_BUY_TOTAL = 27;

const mod = (val: number) => Math.floor((val - 10) / 2);
const formatMod = (v: number) => (v >= 0 ? `+${v}` : `${v}`);

function pointBuyCost(score: number): number {
  // cumulative cost from 8 → score
  if (score <= 8) return 0;
  let total = 0;
  for (let s = 9; s <= score; s++) {
    total += s <= 13 ? 1 : 2;
  }
  return total;
}

function nextCost(score: number): number {
  // cost to go from score → score + 1
  const target = score + 1;
  return target <= 13 ? 1 : 2;
}

function getRaceAbilityBonus(
  raceId: string | undefined,
  subraceId: string | undefined
): Partial<Record<AbilityKey, number>> {
  if (!raceId) return {};
  const race = RACES.find((r) => r.id === raceId);
  if (!race) return {};
  const merged: Partial<Record<AbilityKey, number>> = {};
  for (const k of Object.keys(race.abilityBonus) as AbilityKey[]) {
    merged[k] = (merged[k] ?? 0) + (race.abilityBonus[k] ?? 0);
  }
  if (subraceId) {
    const sub = race.subraces.find((s) => s.id === subraceId);
    if (sub) {
      for (const k of Object.keys(sub.abilityBonus) as AbilityKey[]) {
        merged[k] = (merged[k] ?? 0) + (sub.abilityBonus[k] ?? 0);
      }
    }
  }
  return merged;
}

function rollFourD6DropLowest(): number {
  const rolls = [0, 0, 0, 0].map(() => Math.floor(Math.random() * 6) + 1);
  rolls.sort((a, b) => a - b);
  return rolls[1] + rolls[2] + rolls[3];
}

export default function Step4Stats({ data, onUpdate, onNext, onBack }: Props) {
  const [method, setMethod] = useState<StatMethod>(
    data.statMethod ?? "array"
  );

  // Array Padrão state — assignment of pool values to abilities
  const [arrayAssign, setArrayAssign] = useState<
    Partial<Record<AbilityKey, number>>
  >({});

  // Point buy state
  const [pointBuyStats, setPointBuyStats] = useState<StatBlock>(() => ({
    str: 8,
    dex: 8,
    con: 8,
    int: 8,
    wis: 8,
    cha: 8,
  }));

  // Roll state
  const [rolledValues, setRolledValues] = useState<number[]>([]);
  const [rollAssign, setRollAssign] = useState<
    Partial<Record<AbilityKey, number>>
  >({});

  const raceBonus = useMemo(
    () => getRaceAbilityBonus(data.raceId, data.subraceId),
    [data.raceId, data.subraceId]
  );

  const klass = useMemo(
    () => CLASSES.find((c) => c.id === data.classId),
    [data.classId]
  );
  const hitDie = klass?.hitDie ?? 8;

  const pointsRemaining = useMemo(() => {
    let used = 0;
    for (const key of ABILITY_ORDER) {
      used += pointBuyCost(pointBuyStats[key]);
    }
    return POINT_BUY_TOTAL - used;
  }, [pointBuyStats]);

  const currentStats: Partial<StatBlock> = useMemo(() => {
    if (method === "array") return arrayAssign;
    if (method === "pointbuy") return pointBuyStats;
    return rollAssign;
  }, [method, arrayAssign, pointBuyStats, rollAssign]);

  const allAssigned = ABILITY_ORDER.every(
    (k) => typeof currentStats[k] === "number"
  );

  const isValid =
    allAssigned &&
    (method !== "pointbuy" || pointsRemaining === 0) &&
    (method !== "roll" || rolledValues.length === 6);

  const conTotal =
    (currentStats.con ?? 8) + (raceBonus.con ?? 0);
  const hp = hitDie + mod(conTotal);

  const handleNext = () => {
    if (!isValid) return;
    const finalStats: StatBlock = {
      str: currentStats.str ?? 8,
      dex: currentStats.dex ?? 8,
      con: currentStats.con ?? 8,
      int: currentStats.int ?? 8,
      wis: currentStats.wis ?? 8,
      cha: currentStats.cha ?? 8,
    };
    onUpdate({ stats: finalStats, statMethod: method });
    onNext();
  };

  // ---------- Array Padrão helpers ----------
  const arrayUsedCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const v of Object.values(arrayAssign)) {
      if (typeof v === "number") counts[v] = (counts[v] ?? 0) + 1;
    }
    return counts;
  }, [arrayAssign]);

  const arrayPoolCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const v of STANDARD_ARRAY) counts[v] = (counts[v] ?? 0) + 1;
    return counts;
  }, []);

  const setArrayValue = (key: AbilityKey, raw: string) => {
    setArrayAssign((prev) => {
      const next = { ...prev };
      if (raw === "") {
        delete next[key];
      } else {
        next[key] = Number(raw);
      }
      return next;
    });
  };

  // ---------- Point Buy helpers ----------
  const incPointBuy = (key: AbilityKey) => {
    const current = pointBuyStats[key];
    if (current >= 15) return;
    const cost = nextCost(current);
    if (cost > pointsRemaining) return;
    setPointBuyStats((prev) => ({ ...prev, [key]: current + 1 }));
  };

  const decPointBuy = (key: AbilityKey) => {
    const current = pointBuyStats[key];
    if (current <= 8) return;
    setPointBuyStats((prev) => ({ ...prev, [key]: current - 1 }));
  };

  // ---------- Roll helpers ----------
  const rollAll = () => {
    const values = [0, 0, 0, 0, 0, 0].map(() => rollFourD6DropLowest());
    setRolledValues(values);
    setRollAssign({});
  };

  const rollUsedCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const v of Object.values(rollAssign)) {
      if (typeof v === "number") counts[v] = (counts[v] ?? 0) + 1;
    }
    return counts;
  }, [rollAssign]);

  const rollPoolCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const v of rolledValues) counts[v] = (counts[v] ?? 0) + 1;
    return counts;
  }, [rolledValues]);

  const setRollValue = (key: AbilityKey, raw: string) => {
    setRollAssign((prev) => {
      const next = { ...prev };
      if (raw === "") {
        delete next[key];
      } else {
        next[key] = Number(raw);
      }
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-1 pb-4">
        <header className="space-y-1">
          <h2 className="font-cinzel text-2xl uppercase tracking-[0.25em] text-arcana-gold-bright">
            Distribua seus Atributos
          </h2>
          <p className="font-crimson text-arcana-text-dim">
            Escolha o método para definir os seis atributos do personagem.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "array", label: "Array Padrão" },
              { key: "pointbuy", label: "Compra de Pontos" },
              { key: "roll", label: "Rolagem" },
            ] as { key: StatMethod; label: string }[]
          ).map((tab) => {
            const active = method === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setMethod(tab.key)}
                className={`flex-1 min-w-[8rem] rounded-md border px-4 py-3 font-cinzel text-xs uppercase tracking-[0.2em] transition ${
                  active
                    ? "border-arcana-gold bg-arcana-gold/10 text-arcana-text"
                    : "border-arcana-border text-arcana-text-dim hover:border-arcana-gold/40"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ARRAY PADRÃO */}
        {method === "array" ? (
          <div className="space-y-3">
            <p className="font-crimson text-sm text-arcana-text-dim">
              Atribua cada um dos seis valores fixos:{" "}
              <span className="text-arcana-gold">
                {STANDARD_ARRAY.join(" · ")}
              </span>
            </p>
            <div className="space-y-3">
              {ABILITY_ORDER.map((key) => {
                const value = arrayAssign[key];
                const bonus = raceBonus[key] ?? 0;
                const total = (value ?? 0) + bonus;
                const m = mod(total);
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-3 rounded-md border border-arcana-border bg-arcana-surface/80 px-4 py-3"
                  >
                    <div className="flex flex-col">
                      <span className="font-cinzel text-sm uppercase tracking-[0.2em] text-arcana-gold">
                        {ABILITY_LABEL[key]}
                      </span>
                      <span className="font-crimson text-xs text-arcana-text-dim">
                        {ABILITY_FULL[key]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={value ?? ""}
                        onChange={(e) => setArrayValue(key, e.target.value)}
                        className="rounded-md border border-arcana-border bg-arcana-surface/80 px-3 py-2 font-cinzel text-arcana-text focus:border-arcana-gold focus:outline-none"
                      >
                        <option value="">—</option>
                        {Object.keys(arrayPoolCounts)
                          .map(Number)
                          .sort((a, b) => b - a)
                          .map((poolValue) => {
                            const used = arrayUsedCounts[poolValue] ?? 0;
                            const total = arrayPoolCounts[poolValue] ?? 0;
                            const remaining = total - used;
                            const isCurrent = value === poolValue;
                            const disabled = !isCurrent && remaining <= 0;
                            return (
                              <option
                                key={poolValue}
                                value={poolValue}
                                disabled={disabled}
                              >
                                {poolValue}
                              </option>
                            );
                          })}
                      </select>
                      {bonus !== 0 ? (
                        <span className="font-cinzel text-xs text-emerald-400">
                          +{bonus}
                        </span>
                      ) : null}
                      <span
                        className={`font-cinzel text-base ${
                          m >= 0 ? "text-arcana-gold" : "text-arcana-text-dim"
                        }`}
                      >
                        {value !== undefined ? formatMod(m) : "—"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* POINT BUY */}
        {method === "pointbuy" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-md border border-arcana-border bg-arcana-surface/80 px-4 py-3">
              <span className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-text-dim">
                Pontos restantes
              </span>
              <span className="font-cinzel text-xl text-arcana-gold-bright">
                {pointsRemaining} / {POINT_BUY_TOTAL}
              </span>
            </div>
            <div className="space-y-3">
              {ABILITY_ORDER.map((key) => {
                const value = pointBuyStats[key];
                const bonus = raceBonus[key] ?? 0;
                const total = value + bonus;
                const m = mod(total);
                const canInc =
                  value < 15 && nextCost(value) <= pointsRemaining;
                const canDec = value > 8;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-3 rounded-md border border-arcana-border bg-arcana-surface/80 px-4 py-3"
                  >
                    <div className="flex flex-col">
                      <span className="font-cinzel text-sm uppercase tracking-[0.2em] text-arcana-gold">
                        {ABILITY_LABEL[key]}
                      </span>
                      <span className="font-crimson text-xs text-arcana-text-dim">
                        {ABILITY_FULL[key]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => decPointBuy(key)}
                        disabled={!canDec}
                        className={`h-8 w-8 rounded-md border font-cinzel ${
                          canDec
                            ? "border-arcana-border text-arcana-text hover:border-arcana-gold/60"
                            : "border-arcana-border/40 text-arcana-text-dim/40 cursor-not-allowed"
                        }`}
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-cinzel text-lg text-arcana-text">
                        {value}
                      </span>
                      <button
                        type="button"
                        onClick={() => incPointBuy(key)}
                        disabled={!canInc}
                        className={`h-8 w-8 rounded-md border font-cinzel ${
                          canInc
                            ? "border-arcana-border text-arcana-text hover:border-arcana-gold/60"
                            : "border-arcana-border/40 text-arcana-text-dim/40 cursor-not-allowed"
                        }`}
                      >
                        +
                      </button>
                      {bonus !== 0 ? (
                        <span className="font-cinzel text-xs text-emerald-400">
                          +{bonus}
                        </span>
                      ) : null}
                      <span
                        className={`font-cinzel text-base ${
                          m >= 0 ? "text-arcana-gold" : "text-arcana-text-dim"
                        }`}
                      >
                        {formatMod(m)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* ROLL */}
        {method === "roll" ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={rollAll}
                className="rounded-md border border-arcana-gold bg-arcana-gold/10 px-4 py-2 font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold-bright hover:bg-arcana-gold/20"
              >
                {rolledValues.length === 0
                  ? "🎲 Rolar atributos"
                  : "🎲 Rolar novamente"}
              </button>
              {rolledValues.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {rolledValues.map((v, i) => (
                    <span
                      key={`${v}-${i}`}
                      className="rounded-md border border-arcana-border bg-arcana-surface/80 px-3 py-1 font-cinzel text-arcana-text"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {rolledValues.length > 0 ? (
              <div className="space-y-3">
                {ABILITY_ORDER.map((key) => {
                  const value = rollAssign[key];
                  const bonus = raceBonus[key] ?? 0;
                  const total = (value ?? 0) + bonus;
                  const m = mod(total);
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-3 rounded-md border border-arcana-border bg-arcana-surface/80 px-4 py-3"
                    >
                      <div className="flex flex-col">
                        <span className="font-cinzel text-sm uppercase tracking-[0.2em] text-arcana-gold">
                          {ABILITY_LABEL[key]}
                        </span>
                        <span className="font-crimson text-xs text-arcana-text-dim">
                          {ABILITY_FULL[key]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={value ?? ""}
                          onChange={(e) => setRollValue(key, e.target.value)}
                          className="rounded-md border border-arcana-border bg-arcana-surface/80 px-3 py-2 font-cinzel text-arcana-text focus:border-arcana-gold focus:outline-none"
                        >
                          <option value="">—</option>
                          {Object.keys(rollPoolCounts)
                            .map(Number)
                            .sort((a, b) => b - a)
                            .map((poolValue) => {
                              const used = rollUsedCounts[poolValue] ?? 0;
                              const total = rollPoolCounts[poolValue] ?? 0;
                              const remaining = total - used;
                              const isCurrent = value === poolValue;
                              const disabled = !isCurrent && remaining <= 0;
                              return (
                                <option
                                  key={poolValue}
                                  value={poolValue}
                                  disabled={disabled}
                                >
                                  {poolValue}
                                </option>
                              );
                            })}
                        </select>
                        {bonus !== 0 ? (
                          <span className="font-cinzel text-xs text-emerald-400">
                            +{bonus}
                          </span>
                        ) : null}
                        <span
                          className={`font-cinzel text-base ${
                            m >= 0 ? "text-arcana-gold" : "text-arcana-text-dim"
                          }`}
                        >
                          {value !== undefined ? formatMod(m) : "—"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="font-crimson text-sm text-arcana-text-dim">
                Role 6 valores (4d6, descartando o menor) e atribua cada um a
                um atributo.
              </p>
            )}
          </div>
        ) : null}

        {/* HP & resumo */}
        <div className="rounded-md border border-arcana-border bg-arcana-surface/60 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-text-dim">
              PV no Nível 1
            </span>
            <span className="font-cinzel text-xl text-arcana-gold-bright">
              {hp}
            </span>
          </div>
          <p className="mt-1 font-crimson text-xs text-arcana-text-dim">
            d{hitDie} (classe) + mod CON ({formatMod(mod(conTotal))})
          </p>
        </div>
      </div>

      {/* Ações sticky */}
      <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-arcana-border bg-arcana-bg/95 pt-4 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="font-cinzel uppercase tracking-[0.3em] px-6 py-3 rounded-md border border-arcana-border text-arcana-text-dim hover:text-arcana-text hover:border-arcana-gold/40"
        >
          ← Voltar
        </button>
        <button
          type="button"
          disabled={!isValid}
          onClick={handleNext}
          className={`font-cinzel uppercase tracking-[0.3em] px-8 py-3 rounded-md transition ${
            isValid
              ? "bg-arcana-gold text-arcana-bg hover:bg-arcana-gold-bright"
              : "bg-arcana-gold text-arcana-bg opacity-50 cursor-not-allowed"
          }`}
        >
          Próximo →
        </button>
      </div>
    </div>
  );
}
