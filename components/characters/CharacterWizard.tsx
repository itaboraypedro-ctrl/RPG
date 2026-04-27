"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  ALIGNMENTS,
  type CharacterAbility,
  type CharacterAppearance,
  type CharacterSkillsMeta,
  type CharacterSpell,
  type CharacterStatBlock,
  DEFAULT_SPELL_SLOTS,
  DEFAULT_STATS,
  type SpellSlotsState,
} from "./types";
import { CharacterWizardStep1 } from "./CharacterWizardStep1";
import { CharacterWizardStep2 } from "./CharacterWizardStep2";
import { CharacterWizardStep3 } from "./CharacterWizardStep3";
import { CharacterWizardStep4 } from "./CharacterWizardStep4";

export type CharacterDraft = {
  name: string;
  race: string;
  class: string;
  level: number;
  background: string;
  alignment: (typeof ALIGNMENTS)[number] | "";
  stats: CharacterStatBlock;
  hp: number;
  max_hp: number;
  ac: number;
  speed: number;
  proficient: string[];
  abilities: CharacterAbility[];
  spells: CharacterSpell[];
  spell_slots: SpellSlotsState;
  appearance: CharacterAppearance;
  avatar_url: string | null;
  backstory: string;
};

export const EMPTY_DRAFT: CharacterDraft = {
  name: "",
  race: "",
  class: "",
  level: 1,
  background: "",
  alignment: "",
  stats: { ...DEFAULT_STATS },
  hp: 10,
  max_hp: 10,
  ac: 10,
  speed: 30,
  proficient: [],
  abilities: [],
  spells: [],
  spell_slots: {
    total: [...DEFAULT_SPELL_SLOTS.total],
    used: [...DEFAULT_SPELL_SLOTS.used],
  },
  appearance: {},
  avatar_url: null,
  backstory: "",
};

const STEPS = [
  { num: 1, label: "Identidade" },
  { num: 2, label: "Atributos" },
  { num: 3, label: "Poderes" },
  { num: 4, label: "Avatar" },
] as const;

export function CharacterWizard({ initial }: { initial?: CharacterDraft }) {
  const router = useRouter();
  const [draft, setDraft] = useState<CharacterDraft>(initial ?? EMPTY_DRAFT);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function canAdvanceFrom1() {
    return draft.name.trim().length > 0;
  }

  async function save() {
    if (!canAdvanceFrom1()) {
      setError("Nome é obrigatório.");
      setStep(1);
      return;
    }
    setError(null);
    setSaving(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Sessão expirada.");
      setSaving(false);
      return;
    }

    const skillsMeta: CharacterSkillsMeta = {
      proficient: draft.proficient,
      abilities: draft.abilities,
      background: draft.background,
      alignment: draft.alignment || undefined,
      spell_slots: draft.spell_slots,
      appearance: draft.appearance,
    };

    const { data, error: insertError } = await supabase
      .from("characters")
      .insert({
        owner_id: user.id,
        session_id: null,
        name: draft.name.trim(),
        class: draft.class,
        race: draft.race,
        level: draft.level,
        hp: draft.hp,
        max_hp: draft.max_hp,
        ac: draft.ac,
        speed: draft.speed,
        stats: draft.stats,
        skills: skillsMeta,
        spells: draft.spells,
        backstory: draft.backstory,
        avatar_url: draft.avatar_url,
      })
      .select("id")
      .single<{ id: string }>();

    if (insertError || !data) {
      setError(insertError?.message ?? "Falha ao salvar.");
      setSaving(false);
      return;
    }

    router.push(`/play`);
    router.refresh();
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <nav className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (s.num === 1 || canAdvanceFrom1()) setStep(s.num as 1 | 2 | 3 | 4);
              }}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                step === s.num
                  ? "bg-emerald-600 text-white"
                  : step > s.num
                    ? "bg-emerald-900/50 text-emerald-400"
                    : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {s.num}
            </button>
            <span
              className={`text-xs ${step === s.num ? "text-zinc-100" : "text-zinc-500"}`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className="ml-1 h-px flex-1 bg-zinc-800" />
            )}
          </div>
        ))}
      </nav>

      {step === 1 && <CharacterWizardStep1 draft={draft} setDraft={setDraft} />}
      {step === 2 && <CharacterWizardStep2 draft={draft} setDraft={setDraft} />}
      {step === 3 && <CharacterWizardStep3 draft={draft} setDraft={setDraft} />}
      {step === 4 && <CharacterWizardStep4 draft={draft} setDraft={setDraft} />}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="mt-auto flex gap-2">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4)}
            className="flex-1 rounded-md bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-700"
          >
            Voltar
          </button>
        )}
        {step < 4 && (
          <button
            type="button"
            onClick={() => {
              if (step === 1 && !canAdvanceFrom1()) {
                setError("Nome é obrigatório.");
                return;
              }
              setError(null);
              setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
            }}
            className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Próximo
          </button>
        )}
        {step === 4 && (
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Criar personagem"}
          </button>
        )}
      </div>
    </div>
  );
}

export type DraftSetter = React.Dispatch<React.SetStateAction<CharacterDraft>>;
