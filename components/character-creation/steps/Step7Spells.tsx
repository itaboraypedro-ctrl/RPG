"use client";

import { useEffect, useMemo, useState } from "react";
import type { CharacterCreationData } from "@/lib/character-creation/types";
import { CLASSES } from "@/lib/character-creation/class-data";

type Props = {
  data: Partial<CharacterCreationData>;
  onUpdate: (partial: Partial<CharacterCreationData>) => void;
  onNext: () => void;
  onBack: () => void;
};

type SpellSummary = {
  slug: string;
  name: string;
  school: string;
  range: string;
  concentration: boolean;
  level: number;
};

type Open5eSpell = {
  slug?: string;
  name?: string;
  school?: string;
  range?: string;
  concentration?: string | boolean;
  level_int?: number;
};

type Open5eResponse = {
  results?: Open5eSpell[];
};

const CLASS_EN: Record<string, string> = {
  bardo: "Bard",
  bruxo: "Warlock",
  clerigo: "Cleric",
  druida: "Druid",
  feiticeiro: "Sorcerer",
  mago: "Wizard",
  paladino: "Paladin",
  patrulheiro: "Ranger",
};

const CANTRIP_COUNT: Record<string, number> = {
  bardo: 2,
  bruxo: 2,
  clerigo: 3,
  druida: 2,
  feiticeiro: 4,
  mago: 3,
  paladino: 0,
  patrulheiro: 0,
};

const SPELL_COUNT_LEVEL_1: Record<string, number> = {
  bardo: 4,
  bruxo: 2,
  clerigo: 0,
  druida: 0,
  feiticeiro: 2,
  mago: 6,
  paladino: 0,
  patrulheiro: 0,
};

const FALLBACK_CANTRIPS: Record<string, SpellSummary[]> = {
  bardo: [
    { slug: "fb-vicious-mockery", name: "Escárnio Atroz", school: "Encantamento", range: "18 metros", concentration: false, level: 0 },
    { slug: "fb-mage-hand", name: "Mão Mágica", school: "Conjuração", range: "9 metros", concentration: false, level: 0 },
    { slug: "fb-light", name: "Luz", school: "Evocação", range: "Toque", concentration: false, level: 0 },
    { slug: "fb-prestidigitation", name: "Prestidigitação", school: "Transmutação", range: "3 metros", concentration: false, level: 0 },
    { slug: "fb-dancing-lights", name: "Luzes Dançantes", school: "Evocação", range: "36 metros", concentration: true, level: 0 },
  ],
  bruxo: [
    { slug: "fb-eldritch-blast", name: "Rajada Mística", school: "Evocação", range: "36 metros", concentration: false, level: 0 },
    { slug: "fb-chill-touch", name: "Toque Gélido", school: "Necromancia", range: "36 metros", concentration: false, level: 0 },
    { slug: "fb-mage-hand", name: "Mão Mágica", school: "Conjuração", range: "9 metros", concentration: false, level: 0 },
    { slug: "fb-prestidigitation", name: "Prestidigitação", school: "Transmutação", range: "3 metros", concentration: false, level: 0 },
    { slug: "fb-poison-spray", name: "Spray Venenoso", school: "Conjuração", range: "3 metros", concentration: false, level: 0 },
  ],
  clerigo: [
    { slug: "fb-sacred-flame", name: "Chama Sagrada", school: "Evocação", range: "18 metros", concentration: false, level: 0 },
    { slug: "fb-guidance", name: "Orientação", school: "Adivinhação", range: "Toque", concentration: true, level: 0 },
    { slug: "fb-light", name: "Luz", school: "Evocação", range: "Toque", concentration: false, level: 0 },
    { slug: "fb-spare-the-dying", name: "Estabilizar", school: "Necromancia", range: "Toque", concentration: false, level: 0 },
    { slug: "fb-thaumaturgy", name: "Taumaturgia", school: "Transmutação", range: "9 metros", concentration: false, level: 0 },
  ],
  druida: [
    { slug: "fb-druidcraft", name: "Druidismo", school: "Transmutação", range: "9 metros", concentration: false, level: 0 },
    { slug: "fb-produce-flame", name: "Produzir Chamas", school: "Conjuração", range: "Pessoal", concentration: false, level: 0 },
    { slug: "fb-shillelagh", name: "Porrete Mágico", school: "Transmutação", range: "Toque", concentration: false, level: 0 },
    { slug: "fb-thorn-whip", name: "Chicote Espinhoso", school: "Transmutação", range: "9 metros", concentration: false, level: 0 },
    { slug: "fb-guidance", name: "Orientação", school: "Adivinhação", range: "Toque", concentration: true, level: 0 },
  ],
  feiticeiro: [
    { slug: "fb-fire-bolt", name: "Raio de Fogo", school: "Evocação", range: "36 metros", concentration: false, level: 0 },
    { slug: "fb-light", name: "Luz", school: "Evocação", range: "Toque", concentration: false, level: 0 },
    { slug: "fb-prestidigitation", name: "Prestidigitação", school: "Transmutação", range: "3 metros", concentration: false, level: 0 },
    { slug: "fb-mage-hand", name: "Mão Mágica", school: "Conjuração", range: "9 metros", concentration: false, level: 0 },
    { slug: "fb-ray-of-frost", name: "Raio de Gelo", school: "Evocação", range: "18 metros", concentration: false, level: 0 },
  ],
  mago: [
    { slug: "fb-fire-bolt", name: "Raio de Fogo", school: "Evocação", range: "36 metros", concentration: false, level: 0 },
    { slug: "fb-mage-hand", name: "Mão Mágica", school: "Conjuração", range: "9 metros", concentration: false, level: 0 },
    { slug: "fb-prestidigitation", name: "Prestidigitação", school: "Transmutação", range: "3 metros", concentration: false, level: 0 },
    { slug: "fb-ray-of-frost", name: "Raio de Gelo", school: "Evocação", range: "18 metros", concentration: false, level: 0 },
    { slug: "fb-light", name: "Luz", school: "Evocação", range: "Toque", concentration: false, level: 0 },
  ],
  paladino: [],
  patrulheiro: [],
};

const FALLBACK_LEVEL_1: Record<string, SpellSummary[]> = {
  bardo: [
    { slug: "fb-healing-word", name: "Palavra Curativa", school: "Evocação", range: "18 metros", concentration: false, level: 1 },
    { slug: "fb-faerie-fire", name: "Fogo das Fadas", school: "Evocação", range: "18 metros", concentration: true, level: 1 },
    { slug: "fb-charm-person", name: "Enfeitiçar Pessoas", school: "Encantamento", range: "9 metros", concentration: false, level: 1 },
    { slug: "fb-dissonant-whispers", name: "Sussurros Dissonantes", school: "Encantamento", range: "18 metros", concentration: false, level: 1 },
    { slug: "fb-thunderwave", name: "Onda Trovejante", school: "Evocação", range: "Pessoal", concentration: false, level: 1 },
  ],
  bruxo: [
    { slug: "fb-hex", name: "Azarar", school: "Encantamento", range: "27 metros", concentration: true, level: 1 },
    { slug: "fb-armor-of-agathys", name: "Armadura de Agathys", school: "Abjuração", range: "Pessoal", concentration: false, level: 1 },
    { slug: "fb-hellish-rebuke", name: "Repreensão Infernal", school: "Evocação", range: "18 metros", concentration: false, level: 1 },
    { slug: "fb-witch-bolt", name: "Raio de Bruxa", school: "Evocação", range: "9 metros", concentration: true, level: 1 },
    { slug: "fb-arms-of-hadar", name: "Braços de Hadar", school: "Conjuração", range: "Pessoal", concentration: false, level: 1 },
  ],
  clerigo: [],
  druida: [],
  feiticeiro: [
    { slug: "fb-magic-missile", name: "Mísseis Mágicos", school: "Evocação", range: "36 metros", concentration: false, level: 1 },
    { slug: "fb-shield", name: "Escudo", school: "Abjuração", range: "Pessoal", concentration: false, level: 1 },
    { slug: "fb-burning-hands", name: "Mãos Flamejantes", school: "Evocação", range: "Pessoal", concentration: false, level: 1 },
    { slug: "fb-mage-armor", name: "Armadura Arcana", school: "Abjuração", range: "Toque", concentration: false, level: 1 },
    { slug: "fb-chromatic-orb", name: "Orbe Cromático", school: "Evocação", range: "27 metros", concentration: false, level: 1 },
  ],
  mago: [
    { slug: "fb-magic-missile", name: "Mísseis Mágicos", school: "Evocação", range: "36 metros", concentration: false, level: 1 },
    { slug: "fb-shield", name: "Escudo", school: "Abjuração", range: "Pessoal", concentration: false, level: 1 },
    { slug: "fb-mage-armor", name: "Armadura Arcana", school: "Abjuração", range: "Toque", concentration: false, level: 1 },
    { slug: "fb-detect-magic", name: "Detectar Magia", school: "Adivinhação", range: "Pessoal", concentration: true, level: 1 },
    { slug: "fb-burning-hands", name: "Mãos Flamejantes", school: "Evocação", range: "Pessoal", concentration: false, level: 1 },
    { slug: "fb-sleep", name: "Sono", school: "Encantamento", range: "27 metros", concentration: false, level: 1 },
  ],
  paladino: [],
  patrulheiro: [],
};

function formatRange(raw: string | undefined): string {
  if (!raw) return "—";
  const lower = raw.toLowerCase().trim();
  if (lower === "self") return "Pessoal";
  if (lower === "touch") return "Toque";
  if (lower === "sight") return "Visão";
  if (lower === "unlimited") return "Ilimitado";
  const ftMatch = raw.match(/^(\d+)\s*(?:feet|ft)/i);
  if (ftMatch) {
    const feet = Number.parseInt(ftMatch[1] ?? "0", 10);
    if (Number.isFinite(feet) && feet > 0) {
      const meters = Math.round((feet * 0.3) * 10) / 10;
      return `${meters} metros`;
    }
  }
  return raw;
}

function isConcentration(raw: string | boolean | undefined): boolean {
  if (typeof raw === "boolean") return raw;
  if (!raw) return false;
  return /yes|true|sim|concentr/i.test(raw);
}

function mapOpen5eSpell(s: Open5eSpell, fallbackLevel: number): SpellSummary | null {
  if (!s.name || !s.slug) return null;
  return {
    slug: s.slug,
    name: s.name,
    school: s.school ?? "—",
    range: formatRange(s.range),
    concentration: isConcentration(s.concentration),
    level: typeof s.level_int === "number" ? s.level_int : fallbackLevel,
  };
}

type TabKey = "cantrips" | "level1";

export default function Step7Spells({ data, onUpdate, onNext, onBack }: Props) {
  const classData = useMemo(
    () => CLASSES.find((c) => c.id === data.classId),
    [data.classId]
  );

  const isSpellcaster = Boolean(classData?.isSpellcaster);
  const classId = classData?.id ?? "";
  const classNameEn = CLASS_EN[classId] ?? "";

  const cantripLimit = CANTRIP_COUNT[classId] ?? 0;
  const level1Limit = SPELL_COUNT_LEVEL_1[classId] ?? 0;

  const [tab, setTab] = useState<TabKey>(cantripLimit > 0 ? "cantrips" : "level1");
  const [cantrips, setCantrips] = useState<SpellSummary[]>([]);
  const [level1, setLevel1] = useState<SpellSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCantrips = data.cantripIds ?? [];
  const selectedLevel1 = data.level1SpellIds ?? [];

  // Auto-skip se classe não conjura
  useEffect(() => {
    if (!classData) return;
    if (!isSpellcaster) {
      const t = setTimeout(() => onNext(), 600);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [classData, isSpellcaster, onNext]);

  // Fetch Open5e spells
  useEffect(() => {
    if (!isSpellcaster || !classNameEn) return;

    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [r0, r1] = await Promise.all([
          fetch(
            `https://api.open5e.com/v1/spells/?level=0&dnd_class=${encodeURIComponent(classNameEn)}&limit=50`,
            { signal: controller.signal }
          ),
          fetch(
            `https://api.open5e.com/v1/spells/?level=1&dnd_class=${encodeURIComponent(classNameEn)}&limit=80`,
            { signal: controller.signal }
          ),
        ]);

        if (!r0.ok || !r1.ok) {
          throw new Error("Falha ao buscar magias");
        }

        const j0 = (await r0.json()) as Open5eResponse;
        const j1 = (await r1.json()) as Open5eResponse;

        const c = (j0.results ?? [])
          .map((s) => mapOpen5eSpell(s, 0))
          .filter((s): s is SpellSummary => s !== null);
        const l1 = (j1.results ?? [])
          .map((s) => mapOpen5eSpell(s, 1))
          .filter((s): s is SpellSummary => s !== null);

        if (cancelled) return;

        if (c.length === 0 && l1.length === 0) {
          setCantrips(FALLBACK_CANTRIPS[classId] ?? []);
          setLevel1(FALLBACK_LEVEL_1[classId] ?? []);
        } else {
          setCantrips(c.length > 0 ? c : (FALLBACK_CANTRIPS[classId] ?? []));
          setLevel1(l1.length > 0 ? l1 : (FALLBACK_LEVEL_1[classId] ?? []));
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        if (cancelled) return;
        setError("Não foi possível carregar magias da API. Usando lista básica.");
        setCantrips(FALLBACK_CANTRIPS[classId] ?? []);
        setLevel1(FALLBACK_LEVEL_1[classId] ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [classId, classNameEn, isSpellcaster]);

  const toggleSpell = (slug: string, kind: TabKey) => {
    if (kind === "cantrips") {
      const isSelected = selectedCantrips.includes(slug);
      let next: string[];
      if (isSelected) {
        next = selectedCantrips.filter((s) => s !== slug);
      } else {
        if (selectedCantrips.length >= cantripLimit) return;
        next = [...selectedCantrips, slug];
      }
      onUpdate({ cantripIds: next });
    } else {
      const isSelected = selectedLevel1.includes(slug);
      let next: string[];
      if (isSelected) {
        next = selectedLevel1.filter((s) => s !== slug);
      } else {
        if (selectedLevel1.length >= level1Limit) return;
        next = [...selectedLevel1, slug];
      }
      onUpdate({ level1SpellIds: next });
    }
  };

  const canNext =
    isSpellcaster &&
    selectedCantrips.length >= cantripLimit &&
    selectedLevel1.length >= level1Limit;

  if (!classData) {
    return (
      <div className="flex flex-col gap-4">
        <p className="font-crimson text-arcana-text-dim">Classe não selecionada.</p>
        <button
          type="button"
          onClick={onBack}
          className="self-start font-cinzel text-xs uppercase tracking-[0.3em] text-arcana-text-dim hover:text-arcana-gold"
        >
          ← Voltar
        </button>
      </div>
    );
  }

  if (!isSpellcaster) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div
          aria-hidden
          className="h-10 w-10 animate-spin rounded-full border-2 border-arcana-gold/30 border-t-arcana-gold"
        />
        <p className="font-cinzel italic text-arcana-text-dim">
          Sua classe não conjura magias — pulando...
        </p>
      </div>
    );
  }

  const list = tab === "cantrips" ? cantrips : level1;
  const selectedList = tab === "cantrips" ? selectedCantrips : selectedLevel1;
  const limit = tab === "cantrips" ? cantripLimit : level1Limit;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-1 pb-4">
        <header className="space-y-1">
          <h2 className="font-cinzel text-2xl uppercase tracking-[0.25em] text-arcana-gold-bright">
            Magias
          </h2>
          <p className="font-crimson text-arcana-text-dim">
            Escolha seus truques e magias de 1° nível.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 rounded-lg border border-arcana-border bg-arcana-surface p-1">
          {cantripLimit > 0 ? (
            <button
              type="button"
              onClick={() => setTab("cantrips")}
              className={`flex-1 rounded px-3 py-2 font-cinzel text-xs uppercase tracking-[0.2em] transition-colors ${
                tab === "cantrips"
                  ? "bg-arcana-gold text-arcana-bg"
                  : "text-arcana-text-dim hover:text-arcana-text"
              }`}
            >
              Truques
            </button>
          ) : null}
          {level1Limit > 0 ? (
            <button
              type="button"
              onClick={() => setTab("level1")}
              className={`flex-1 rounded px-3 py-2 font-cinzel text-xs uppercase tracking-[0.2em] transition-colors ${
                tab === "level1"
                  ? "bg-arcana-gold text-arcana-bg"
                  : "text-arcana-text-dim hover:text-arcana-text"
              }`}
            >
              Magias 1° Nível
            </button>
          ) : null}
        </div>

        {/* Counter */}
        <p className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold">
          {selectedList.length} / {limit} selecionados
        </p>

        {error ? (
          <p className="font-crimson italic text-arcana-text-dim">{error}</p>
        ) : null}

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <div
              aria-hidden
              className="h-10 w-10 animate-spin rounded-full border-2 border-arcana-gold/30 border-t-arcana-gold"
            />
            <p className="font-cinzel italic text-arcana-text-dim">
              Invocando o grimório...
            </p>
          </div>
        ) : list.length === 0 ? (
          <p className="font-crimson italic text-arcana-text-dim">
            {tab === "cantrips"
              ? "Sua classe não escolhe truques desta forma."
              : "Sua classe prepara magias de 1° nível em vez de escolher."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {list.map((spell) => {
              const isSelected = selectedList.includes(spell.slug);
              const canSelectMore = selectedList.length < limit;
              const disabled = !isSelected && !canSelectMore;
              return (
                <button
                  key={spell.slug}
                  type="button"
                  onClick={() => toggleSpell(spell.slug, tab)}
                  disabled={disabled}
                  className={`flex flex-col gap-1 rounded-md border p-3 text-left transition ${
                    isSelected
                      ? "border-arcana-gold bg-arcana-gold/10"
                      : disabled
                        ? "border-arcana-border bg-arcana-surface opacity-40 cursor-not-allowed"
                        : "border-arcana-border bg-arcana-surface hover:border-arcana-gold/40"
                  }`}
                >
                  <span className="font-cinzel text-sm text-arcana-text">
                    {spell.name}
                  </span>
                  <span className="font-crimson text-xs italic text-arcana-text-dim">
                    {spell.school}
                  </span>
                  <span className="font-crimson text-xs text-arcana-text-dim">
                    {spell.range}
                    {spell.concentration ? (
                      <span title="Concentração" className="ml-1" aria-label="Concentração">
                        ⏱
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="sticky bottom-0 flex justify-between gap-3 border-t border-arcana-border bg-arcana-bg/95 pt-4 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="font-cinzel uppercase tracking-[0.3em] px-6 py-3 rounded-md text-arcana-text-dim hover:text-arcana-gold transition"
        >
          ← Voltar
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={onNext}
          className={`font-cinzel uppercase tracking-[0.3em] px-8 py-3 rounded-md transition ${
            canNext
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
