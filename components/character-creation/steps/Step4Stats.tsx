"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  triggerRef: React.MutableRefObject<(() => void) | null>;
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
  if (score <= 8) return 0;
  let total = 0;
  for (let s = 9; s <= score; s++) {
    total += s <= 13 ? 1 : 2;
  }
  return total;
}

function nextCost(score: number): number {
  const target = score + 1;
  return target <= 13 ? 1 : 2;
}

function getRaceAbilityBonus(
  raceId: string | undefined,
  subraceId: string | undefined,
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

function pointBuyBarWidth(score: number): number {
  return Math.round(((score - 8) / 7) * 100);
}

export default function Step4Stats({ data, onUpdate, onNext, triggerRef }: Props) {
  const [method, setMethod] = useState<StatMethod>(data.statMethod ?? "array");
  const [arrayAssign, setArrayAssign] = useState<Partial<Record<AbilityKey, number>>>({});
  const [pendingArrayKey, setPendingArrayKey] = useState<AbilityKey | null>(null);
  const [pointBuyStats, setPointBuyStats] = useState<StatBlock>(() => ({
    str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8,
  }));
  const [rolledValues, setRolledValues] = useState<number[]>([]);
  const [rollAssign, setRollAssign] = useState<Partial<Record<AbilityKey, number>>>({});
  const [pendingRollKey, setPendingRollKey] = useState<AbilityKey | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const raceBonus = useMemo(
    () => getRaceAbilityBonus(data.raceId, data.subraceId),
    [data.raceId, data.subraceId],
  );

  const klass = useMemo(() => CLASSES.find((c) => c.id === data.classId), [data.classId]);
  const hitDie = klass?.hitDie ?? 8;

  const pointsRemaining = useMemo(() => {
    let used = 0;
    for (const key of ABILITY_ORDER) used += pointBuyCost(pointBuyStats[key]);
    return POINT_BUY_TOTAL - used;
  }, [pointBuyStats]);

  const currentStats: Partial<StatBlock> = useMemo(() => {
    if (method === "array") return arrayAssign;
    if (method === "pointbuy") return pointBuyStats;
    return rollAssign;
  }, [method, arrayAssign, pointBuyStats, rollAssign]);

  const allAssigned = ABILITY_ORDER.every((k) => typeof currentStats[k] === "number");
  const isValid =
    allAssigned &&
    (method !== "pointbuy" || pointsRemaining === 0) &&
    (method !== "roll" || rolledValues.length === 6);

  const conTotal = (currentStats.con ?? 8) + (raceBonus.con ?? 0);
  const hp = hitDie + mod(conTotal);

  // Commit stats and navigate
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

  // Expose handleNext to parent footer via ref
  const handleNextRef = useRef(handleNext);
  useEffect(() => {
    handleNextRef.current = handleNext;
  });
  useEffect(() => {
    triggerRef.current = () => handleNextRef.current();
    return () => { triggerRef.current = null; };
  }, [triggerRef]);

  // ---- Array helpers ----
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

  const handleArrayChipClick = (value: number) => {
    if (!pendingArrayKey) return;
    const used = arrayUsedCounts[value] ?? 0;
    const total = arrayPoolCounts[value] ?? 0;
    const isCurrent = arrayAssign[pendingArrayKey] === value;
    if (!isCurrent && used >= total) return;
    setArrayAssign((prev) => ({ ...prev, [pendingArrayKey]: value }));
    setPendingArrayKey(null);
  };

  const handleArrayAbilityClick = (key: AbilityKey) => {
    setPendingArrayKey((cur) => (cur === key ? null : key));
  };

  const clearArrayAbility = (key: AbilityKey, e: React.MouseEvent) => {
    e.stopPropagation();
    setArrayAssign((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setPendingArrayKey(null);
  };

  // ---- Point buy helpers ----
  const incPointBuy = (key: AbilityKey) => {
    const current = pointBuyStats[key];
    if (current >= 15) return;
    if (nextCost(current) > pointsRemaining) return;
    setPointBuyStats((prev) => ({ ...prev, [key]: current + 1 }));
  };

  const decPointBuy = (key: AbilityKey) => {
    const current = pointBuyStats[key];
    if (current <= 8) return;
    setPointBuyStats((prev) => ({ ...prev, [key]: current - 1 }));
  };

  // ---- Roll helpers ----
  const rollAll = () => {
    setIsRolling(true);
    setTimeout(() => {
      const values = Array.from({ length: 6 }, () => rollFourD6DropLowest());
      setRolledValues(values);
      setRollAssign({});
      setPendingRollKey(null);
      setIsRolling(false);
    }, 400);
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

  const handleRollChipClick = (value: number) => {
    if (!pendingRollKey) return;
    const used = rollUsedCounts[value] ?? 0;
    const total = rollPoolCounts[value] ?? 0;
    const isCurrent = rollAssign[pendingRollKey] === value;
    if (!isCurrent && used >= total) return;
    setRollAssign((prev) => ({ ...prev, [pendingRollKey]: value }));
    setPendingRollKey(null);
  };

  const handleRollAbilityClick = (key: AbilityKey) => {
    setPendingRollKey((cur) => (cur === key ? null : key));
  };

  const clearRollAbility = (key: AbilityKey, e: React.MouseEvent) => {
    e.stopPropagation();
    setRollAssign((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setPendingRollKey(null);
  };

  const getArrayChipAvailable = (value: number) => {
    const used = arrayUsedCounts[value] ?? 0;
    const total = arrayPoolCounts[value] ?? 0;
    return used < total;
  };

  const getRollChipAvailable = (value: number) => {
    const used = rollUsedCounts[value] ?? 0;
    const total = rollPoolCounts[value] ?? 0;
    return used < total;
  };

  const methods: { key: StatMethod; label: string; desc: string }[] = [
    { key: "array", label: "Array Padrão", desc: "Valores fixos pré-definidos" },
    { key: "pointbuy", label: "Compra de Pontos", desc: "27 pontos para distribuir" },
    { key: "roll", label: "Rolagem", desc: "4d6, descarta o menor" },
  ];

  return (
    <div className="space-y-6">

      {/* Method selector */}
      <div className="grid grid-cols-3 gap-2">
        {methods.map((m) => {
          const active = method === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setMethod(m.key)}
              className={[
                "flex flex-col gap-0.5 px-3 py-3 rounded-sm border text-left transition-all duration-150",
                active
                  ? "arcana-stat-chip-active text-arcana-gold-bright"
                  : "border-arcana-border-dim bg-arcana-surface text-arcana-text-dim hover:border-arcana-border hover:text-arcana-text",
              ].join(" ")}
            >
              <span className="font-cinzel text-xs uppercase tracking-[0.15em] block">
                {m.label}
              </span>
              <span className={["font-crimson text-[11px]", active ? "text-arcana-text-dim" : "text-arcana-text-muted"].join(" ")}>
                {m.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* ---- ARRAY PADRÃO ---- */}
      {method === "array" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="font-cinzel text-[9px] uppercase tracking-[0.35em] text-arcana-text-dim">
              Clique em um atributo, depois no valor a atribuir
            </p>
            <div className="flex gap-2 flex-wrap">
              {STANDARD_ARRAY.map((value, i) => {
                const available = getArrayChipAvailable(value);
                return (
                  <button
                    key={`${value}-${i}`}
                    type="button"
                    onClick={() => handleArrayChipClick(value)}
                    disabled={!pendingArrayKey || !available}
                    className={[
                      "w-12 h-12 rounded-sm font-cinzel text-lg transition-all duration-150",
                      !available
                        ? "arcana-pool-chip-used line-through cursor-default"
                        : pendingArrayKey
                          ? "arcana-pool-chip-pending cursor-pointer"
                          : "arcana-pool-chip cursor-default",
                    ].join(" ")}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            {ABILITY_ORDER.map((key) => {
              const value = arrayAssign[key];
              const bonus = raceBonus[key] ?? 0;
              const total = (value ?? 0) + bonus;
              const m = mod(total);
              const isPending = pendingArrayKey === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleArrayAbilityClick(key)}
                  className={[
                    "w-full flex items-center gap-3 px-4 py-3 rounded-sm border transition-all duration-150",
                    isPending
                      ? "border-arcana-gold bg-arcana-gold/10 ring-1 ring-arcana-gold/30 shadow-[0_0_16px_rgba(201,168,76,0.12)]"
                      : value !== undefined
                        ? "arcana-stat-chip hover:border-arcana-border"
                        : "border-arcana-border-dim bg-arcana-surface hover:border-arcana-border",
                  ].join(" ")}
                >
                  <div className="w-16 shrink-0 text-left">
                    <span className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold block">
                      {ABILITY_LABEL[key]}
                    </span>
                    <span className="font-crimson text-[11px] text-arcana-text-dim">
                      {ABILITY_FULL[key]}
                    </span>
                  </div>

                  <div className="flex-1 flex items-center gap-3">
                    <span className={[
                      "font-cinzel text-2xl w-8 text-center transition-colors",
                      value !== undefined ? "text-arcana-text" : "text-arcana-border/40",
                    ].join(" ")}>
                      {value ?? "—"}
                    </span>
                    {bonus !== 0 && (
                      <span className="font-cinzel text-xs text-emerald-400">
                        +{bonus} racial
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={[
                      "font-cinzel text-base w-8 text-center",
                      m >= 0 ? "text-arcana-gold" : "text-arcana-text-dim",
                    ].join(" ")}>
                      {value !== undefined ? formatMod(m) : "—"}
                    </span>
                    {value !== undefined && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => clearArrayAbility(key, e)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            clearArrayAbility(key, e as unknown as React.MouseEvent);
                          }
                        }}
                        className="font-cinzel text-arcana-border/60 hover:text-arcana-text-dim text-sm px-1"
                        aria-label="Remover valor"
                      >
                        ×
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ---- POINT BUY ---- */}
      {method === "pointbuy" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-cinzel text-[9px] uppercase tracking-[0.35em] text-arcana-text-dim">
                Pontos restantes
              </p>
              <p className={[
                "font-cinzel text-xl",
                pointsRemaining === 0 ? "text-arcana-gold" : "text-arcana-gold-bright",
              ].join(" ")}>
                {pointsRemaining}
                <span className="font-crimson text-xs text-arcana-text-dim ml-1">
                  / {POINT_BUY_TOTAL}
                </span>
              </p>
            </div>
            <div className="h-1 w-full rounded-full bg-arcana-surface-3 overflow-hidden">
              <div
                className="h-full bg-arcana-gold transition-all duration-300 shadow-[0_0_8px_rgba(201,168,76,0.4)]"
                style={{ width: `${((POINT_BUY_TOTAL - pointsRemaining) / POINT_BUY_TOTAL) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            {ABILITY_ORDER.map((key) => {
              const value = pointBuyStats[key];
              const bonus = raceBonus[key] ?? 0;
              const total = value + bonus;
              const m = mod(total);
              const canInc = value < 15 && nextCost(value) <= pointsRemaining;
              const canDec = value > 8;

              return (
                <div
                  key={key}
                  className="flex items-center gap-3 px-4 py-3 rounded-sm arcana-stat-chip"
                >
                  <div className="w-16 shrink-0">
                    <span className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold block">
                      {ABILITY_LABEL[key]}
                    </span>
                    <span className="font-crimson text-[11px] text-arcana-text-dim">
                      {ABILITY_FULL[key]}
                    </span>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="h-1.5 w-full rounded-full bg-arcana-surface-3 overflow-hidden">
                      <div
                        className="h-full bg-arcana-gold rounded-full transition-all duration-200 shadow-[0_0_6px_rgba(201,168,76,0.4)]"
                        style={{ width: `${pointBuyBarWidth(value)}%` }}
                      />
                    </div>
                    <div className="flex justify-between font-cinzel text-[9px] text-arcana-text-dim/50">
                      <span>8</span>
                      <span>15</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => decPointBuy(key)}
                      disabled={!canDec}
                      className={[
                        "h-8 w-8 rounded-sm border font-cinzel text-base transition-colors",
                        canDec
                          ? "border-arcana-border bg-arcana-surface-2 text-arcana-text hover:border-arcana-gold/60 hover:text-arcana-gold"
                          : "border-arcana-border-dim bg-arcana-surface text-arcana-text-muted cursor-not-allowed",
                      ].join(" ")}
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
                      className={[
                        "h-8 w-8 rounded-sm border font-cinzel text-base transition-colors",
                        canInc
                          ? "border-arcana-border bg-arcana-surface-2 text-arcana-text hover:border-arcana-gold/60 hover:text-arcana-gold"
                          : "border-arcana-border-dim bg-arcana-surface text-arcana-text-muted cursor-not-allowed",
                      ].join(" ")}
                    >
                      +
                    </button>
                    {bonus !== 0 && (
                      <span className="font-cinzel text-xs text-emerald-400 w-12 text-right">
                        +{bonus}
                      </span>
                    )}
                    <span className={[
                      "font-cinzel text-base w-8 text-right",
                      m >= 0 ? "text-arcana-gold" : "text-arcana-text-dim",
                    ].join(" ")}>
                      {formatMod(m)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---- ROLL ---- */}
      {method === "roll" && (
        <div className="space-y-4">
          <div className="space-y-3">
            <button
              type="button"
              onClick={rollAll}
              disabled={isRolling}
              className={[
                "w-full py-4 rounded-sm border font-cinzel uppercase tracking-[0.3em] text-sm transition-all duration-200",
                isRolling
                  ? "border-arcana-gold/30 text-arcana-gold/50 cursor-not-allowed"
                  : rolledValues.length === 0
                    ? "border-arcana-gold bg-arcana-gold/10 text-arcana-gold-bright hover:bg-arcana-gold/20"
                    : "border-arcana-border/60 text-arcana-text-dim hover:border-arcana-gold/40 hover:text-arcana-text",
              ].join(" ")}
            >
              {isRolling
                ? "Rolando..."
                : rolledValues.length === 0
                  ? "Rolar atributos"
                  : "Rolar novamente"}
            </button>

            {rolledValues.length > 0 && (
              <div className="space-y-2">
                <p className="font-cinzel text-[9px] uppercase tracking-[0.35em] text-arcana-text-dim">
                  {pendingRollKey
                    ? `Atribuindo a ${ABILITY_FULL[pendingRollKey]} — escolha um valor`
                    : "Clique em um atributo, depois no valor"}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {rolledValues.map((value, i) => {
                    const available = getRollChipAvailable(value);
                    return (
                      <button
                        key={`roll-${value}-${i}`}
                        type="button"
                        onClick={() => handleRollChipClick(value)}
                        disabled={!pendingRollKey || !available}
                        className={[
                          "w-12 h-12 rounded-sm border font-cinzel text-lg transition-all duration-150",
                          !available
                            ? "border-arcana-border/20 text-arcana-text-dim/30 line-through cursor-default"
                            : pendingRollKey
                              ? "border-arcana-gold bg-arcana-gold/15 text-arcana-gold-bright cursor-pointer hover:bg-arcana-gold/25 scale-105"
                              : "border-arcana-border/60 text-arcana-text cursor-default",
                        ].join(" ")}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {rolledValues.length > 0 && (
            <div className="space-y-2">
              {ABILITY_ORDER.map((key) => {
                const value = rollAssign[key];
                const bonus = raceBonus[key] ?? 0;
                const total = (value ?? 0) + bonus;
                const m = mod(total);
                const isPending = pendingRollKey === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleRollAbilityClick(key)}
                    className={[
                      "w-full flex items-center gap-3 px-4 py-3 rounded-sm border transition-all duration-150",
                      isPending
                        ? "border-arcana-gold bg-arcana-gold/8 ring-1 ring-arcana-gold/40"
                        : value !== undefined
                          ? "border-arcana-border/60 bg-arcana-surface/60 hover:border-arcana-gold/30"
                          : "border-arcana-border/40 bg-arcana-surface/30 hover:border-arcana-gold/30",
                    ].join(" ")}
                  >
                    <div className="w-16 shrink-0 text-left">
                      <span className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold block">
                        {ABILITY_LABEL[key]}
                      </span>
                      <span className="font-crimson text-[11px] text-arcana-text-dim">
                        {ABILITY_FULL[key]}
                      </span>
                    </div>

                    <div className="flex-1 flex items-center gap-3">
                      <span className={[
                        "font-cinzel text-2xl w-8 text-center",
                        value !== undefined ? "text-arcana-text" : "text-arcana-border/40",
                      ].join(" ")}>
                        {value ?? "—"}
                      </span>
                      {bonus !== 0 && (
                        <span className="font-cinzel text-xs text-emerald-400">
                          +{bonus} racial
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={[
                        "font-cinzel text-base w-8 text-center",
                        m >= 0 ? "text-arcana-gold" : "text-arcana-text-dim",
                      ].join(" ")}>
                        {value !== undefined ? formatMod(m) : "—"}
                      </span>
                      {value !== undefined && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => clearRollAbility(key, e)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              clearRollAbility(key, e as unknown as React.MouseEvent);
                            }
                          }}
                          className="font-cinzel text-arcana-border/60 hover:text-arcana-text-dim text-sm px-1"
                          aria-label="Remover valor"
                        >
                          ×
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {rolledValues.length === 0 && (
            <p className="font-crimson text-sm text-arcana-text-dim italic">
              Role os dados para revelar seus seis atributos base.
            </p>
          )}
        </div>
      )}

      {/* HP summary */}
      <div className="flex items-center justify-between rounded-sm arcana-stat-chip px-4 py-3">
        <div>
          <p className="font-cinzel text-[9px] uppercase tracking-[0.35em] text-arcana-text-dim">
            Pontos de vida no nível 1
          </p>
          <p className="font-crimson text-xs text-arcana-text-dim mt-0.5">
            d{hitDie} + mod CON ({formatMod(mod(conTotal))})
          </p>
        </div>
        <span className="font-cinzel text-3xl text-arcana-gold-bright">{hp}</span>
      </div>
    </div>
  );
}
