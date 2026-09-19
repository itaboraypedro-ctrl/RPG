"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  AbilityKey,
  CharacterCreationData,
  Sex,
  StatBlock,
} from "@/lib/character-creation/types";
import { CLASSES } from "@/lib/character-creation/class-data";
import { RACES } from "@/lib/character-creation/race-data";
import { BACKGROUNDS } from "@/lib/character-creation/background-data";
import { createCharacter, type CreateCharacterPayload } from "@/app/play/characters/new/actions";

type Props = {
  data: CharacterCreationData;
  triggerRef: React.MutableRefObject<(() => void) | null>;
  onSavingChange: (saving: boolean) => void;
};

const SEX_LABEL: Record<Sex, string> = {
  male: "Masculino",
  female: "Feminino",
  androgynous: "Andrógino",
};

const ABILITY_LABEL: Record<AbilityKey, string> = {
  str: "FOR",
  dex: "DES",
  con: "CON",
  int: "INT",
  wis: "SAB",
  cha: "CAR",
};

const ABILITY_ORDER: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

function mod(value: number): number {
  return Math.floor((value - 10) / 2);
}

function fmtMod(m: number): string {
  return m >= 0 ? `+${m}` : `${m}`;
}

export default function Step8Review({ data, triggerRef, onSavingChange }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const race = useMemo(() => RACES.find((r) => r.id === data.raceId), [data.raceId]);
  const subrace = useMemo(
    () => race?.subraces.find((s) => s.id === data.subraceId),
    [race, data.subraceId]
  );
  const classData = useMemo(
    () => CLASSES.find((c) => c.id === data.classId),
    [data.classId]
  );
  const background = useMemo(
    () => BACKGROUNDS.find((b) => b.id === data.backgroundId),
    [data.backgroundId]
  );

  const stats: StatBlock = data.stats ?? { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

  const racialBonuses: Record<AbilityKey, number> = useMemo(() => {
    const base: Record<AbilityKey, number> = {
      str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0,
    };
    if (race?.abilityBonus) {
      for (const k of ABILITY_ORDER) {
        base[k] += race.abilityBonus[k] ?? 0;
      }
    }
    if (subrace?.abilityBonus) {
      for (const k of ABILITY_ORDER) {
        base[k] += subrace.abilityBonus[k] ?? 0;
      }
    }
    return base;
  }, [race, subrace]);

  const totals: Record<AbilityKey, number> = useMemo(() => {
    const out: Record<AbilityKey, number> = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    for (const k of ABILITY_ORDER) {
      out[k] = (stats[k] ?? 10) + (racialBonuses[k] ?? 0);
    }
    return out;
  }, [stats, racialBonuses]);

  const conTotal = totals.con;
  const dexTotal = totals.dex;
  const hitDie = classData?.hitDie ?? 8;
  const maxHp = hitDie + mod(conTotal);
  const ac = 10 + mod(dexTotal);
  const initiative = mod(dexTotal);
  const speed = race?.speed ?? 9;

  const inventoryItems: string[] = useMemo(() => {
    const items: string[] = [];
    if (classData) {
      const choices = data.equipmentChoices ?? {};
      for (const ch of classData.startingEquipmentChoices) {
        const pickedId = choices[ch.id];
        if (!pickedId) continue;
        const opt = ch.options.find((o) => o.id === pickedId);
        if (opt) items.push(...opt.items);
      }
    }
    if (background) {
      items.push(...background.equipment);
    }
    return items;
  }, [classData, background, data.equipmentChoices]);

  const inventoryPayload: Record<string, unknown>[] = useMemo(
    () => inventoryItems.map((name, idx) => ({ id: `item-${idx}`, name, quantity: 1 })),
    [inventoryItems]
  );

  const cantripCount = (data.cantripIds ?? []).length;
  const level1Count = (data.level1SpellIds ?? []).length;

  const handleCreate = async () => {
    if (isSaving) return;
    if (!race || !classData || !background) {
      setError("Dados incompletos.");
      return;
    }
    if (!data.name || !data.sex || !data.age || !data.stats) {
      setError("Dados de identidade incompletos.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const traits: string[] = [
        ...(race.traits ?? []),
        ...((subrace?.traits) ?? []),
      ];

      const payload: CreateCharacterPayload = {
        name: data.name,
        sex: data.sex,
        age: data.age,
        raceId: race.id,
        subraceId: subrace?.id,
        raceName: race.name + (subrace ? ` (${subrace.name})` : ""),
        classId: classData.id,
        className: classData.name,
        hitDie: classData.hitDie,
        raceSpeed: race.speed,
        stats: data.stats,
        backgroundId: background.id,
        backgroundName: background.name,
        personality: data.personality,
        raceTraits: traits,
        classFeatures: [],
        inventory: inventoryPayload,
        spellIds: [...(data.cantripIds ?? []), ...(data.level1SpellIds ?? [])],
        outfitDescription: data.outfitDescription,
        weaponDescription: data.weaponDescription,
        focusDescription: data.focusDescription,
        avatarUrl: data.currentImageUrl ?? null,
        avatarHistory: data.imageHistory ?? [],
        referencePhotoUrl: undefined,
        appearanceDescription: undefined,
        level: 1,
        goldFromBackground: background.gold,
      };

      const result = await createCharacter(payload);
      if (result && result.ok === false) {
        setError(result.error);
        setIsSaving(false);
      }
    } catch (err) {
      const e = err as { digest?: string; message?: string };
      if (typeof e.digest === "string" && e.digest.startsWith("NEXT_REDIRECT")) {
        throw err;
      }
      setError(e.message ?? "Falha ao criar personagem.");
      setIsSaving(false);
    }
  };

  // Sync saving state to parent
  useEffect(() => {
    onSavingChange(isSaving);
  }, [isSaving, onSavingChange]);

  // Expose handleCreate to parent footer via ref
  const handleCreateRef = useRef(handleCreate);
  useEffect(() => {
    handleCreateRef.current = handleCreate;
  });
  useEffect(() => {
    triggerRef.current = () => { void handleCreateRef.current(); };
    return () => { triggerRef.current = null; };
  }, [triggerRef]);

  if (!race || !classData || !background) {
    return (
      <div className="flex flex-col gap-4 py-12 text-center">
        <p className="font-crimson italic text-arcana-text-dim">
          Dados incompletos. Volte e preencha todos os passos.
        </p>
      </div>
    );
  }

  const subtitleParts = [race.name + (subrace ? ` (${subrace.name})` : ""), classData.name];

  return (
    <div className="space-y-6">
      <p className="font-crimson text-arcana-text-dim">
        Revise sua ficha antes de selar o destino.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Esquerda: ficha */}
        <div className="flex flex-col gap-5">
          {/* Identidade */}
          <section className="rounded-sm border border-arcana-border/50 bg-arcana-surface/40 p-4">
            <h3 className="font-cinzel text-sm uppercase tracking-[0.3em] text-arcana-gold mb-3">
              Identidade
            </h3>
            <p className="font-cinzel text-xl text-arcana-text">{data.name}</p>
            <p className="font-crimson text-sm text-arcana-text-dim">
              {data.sex ? SEX_LABEL[data.sex] : ""} · {data.age ? `${data.age} anos` : ""}
            </p>
            <p className="mt-2 font-crimson text-sm text-arcana-text">
              {race.name}
              {subrace ? ` (${subrace.name})` : ""}
            </p>
            <p className="font-crimson text-sm text-arcana-text">
              {classData.name} · Nível 1
            </p>
            <p className="font-crimson text-sm text-arcana-text-dim italic">
              {background.name}
            </p>
          </section>

          {/* Atributos */}
          <section className="rounded-sm border border-arcana-border/50 bg-arcana-surface/40 p-4">
            <h3 className="font-cinzel text-sm uppercase tracking-[0.3em] text-arcana-gold mb-3">
              Atributos
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ABILITY_ORDER.map((k) => {
                const base = stats[k] ?? 10;
                const bonus = racialBonuses[k] ?? 0;
                const total = totals[k];
                return (
                  <div
                    key={k}
                    className="rounded border border-arcana-border bg-arcana-bg/40 p-2 text-center"
                  >
                    <p className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold">
                      {ABILITY_LABEL[k]}
                    </p>
                    <p className="font-cinzel text-lg text-arcana-text">{total}</p>
                    <p className="font-crimson text-[10px] text-arcana-text-dim">
                      {base}
                      {bonus !== 0 ? ` (${fmtMod(bonus)} racial)` : ""}
                    </p>
                    <p className="font-cinzel text-xs text-arcana-gold">{fmtMod(mod(total))}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Combate */}
          <section className="rounded-sm border border-arcana-border/50 bg-arcana-surface/40 p-4">
            <h3 className="font-cinzel text-sm uppercase tracking-[0.3em] text-arcana-gold mb-3">
              Combate
            </h3>
            <dl className="grid grid-cols-2 gap-y-2 font-crimson text-sm">
              <dt className="text-arcana-text-dim">PV máximo</dt>
              <dd className="text-arcana-text text-right">{maxHp}</dd>
              <dt className="text-arcana-text-dim">CA</dt>
              <dd className="text-arcana-text text-right">{ac}</dd>
              <dt className="text-arcana-text-dim">Iniciativa</dt>
              <dd className="text-arcana-text text-right">{fmtMod(initiative)}</dd>
              <dt className="text-arcana-text-dim">Deslocamento</dt>
              <dd className="text-arcana-text text-right">{speed}m</dd>
            </dl>
          </section>

          {/* Proficiências */}
          <section className="rounded-sm border border-arcana-border/50 bg-arcana-surface/40 p-4">
            <h3 className="font-cinzel text-sm uppercase tracking-[0.3em] text-arcana-gold mb-3">
              Proficiências
            </h3>
            <div className="space-y-2 font-crimson text-sm">
              <div>
                <p className="text-arcana-text-dim">Resistências</p>
                <p className="text-arcana-text">
                  {classData.savingThrows.map((s) => ABILITY_LABEL[s]).join(", ")}
                </p>
              </div>
              <div>
                <p className="text-arcana-text-dim">Perícias</p>
                <p className="text-arcana-text">{background.skills.join(", ")}</p>
              </div>
              <div>
                <p className="text-arcana-text-dim">Armaduras</p>
                <p className="text-arcana-text">
                  {classData.armorProficiency.length > 0
                    ? classData.armorProficiency.join(", ")
                    : "Nenhuma"}
                </p>
              </div>
              <div>
                <p className="text-arcana-text-dim">Armas</p>
                <p className="text-arcana-text">
                  {classData.weaponProficiency.join(", ")}
                </p>
              </div>
            </div>
          </section>

          {/* Inventário */}
          <section className="rounded-sm border border-arcana-border/50 bg-arcana-surface/40 p-4">
            <h3 className="font-cinzel text-sm uppercase tracking-[0.3em] text-arcana-gold mb-3">
              Inventário
            </h3>
            {inventoryItems.length === 0 ? (
              <p className="font-crimson italic text-arcana-text-dim text-sm">
                Nenhum item.
              </p>
            ) : (
              <ul className="space-y-1 font-crimson text-sm text-arcana-text">
                {inventoryItems.map((it, idx) => (
                  <li key={`${it}-${idx}`}>· {it}</li>
                ))}
              </ul>
            )}
            <p className="mt-3 font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold">
              Ouro: {background.gold} po
            </p>
          </section>

          {/* Magias */}
          {classData.isSpellcaster ? (
            <section className="rounded-sm border border-arcana-border/50 bg-arcana-surface/40 p-4">
              <h3 className="font-cinzel text-sm uppercase tracking-[0.3em] text-arcana-gold mb-3">
                Magias
              </h3>
              <p className="font-crimson text-sm text-arcana-text">
                Truques selecionados: <span className="text-arcana-gold">{cantripCount}</span>
              </p>
              <p className="font-crimson text-sm text-arcana-text">
                Magias 1° nível: <span className="text-arcana-gold">{level1Count}</span>
              </p>
            </section>
          ) : null}
        </div>

        {/* Direita: avatar */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-md border border-arcana-gold/40 bg-arcana-surface">
            {data.currentImageUrl ? (
              <Image
                src={data.currentImageUrl}
                alt={`Retrato de ${data.name}`}
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="font-crimson italic text-arcana-text-dim text-sm text-center px-4">
                  Sem retrato gerado.
                </p>
              </div>
            )}
          </div>
          <div className="text-center">
            <h3 className="font-cinzel text-2xl text-arcana-text">{data.name}</h3>
            <p className="mt-1 font-cinzel uppercase tracking-[0.2em] text-arcana-gold/70 text-xs">
              {subtitleParts.join(" · ")} · Nível 1
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-center font-crimson italic text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
