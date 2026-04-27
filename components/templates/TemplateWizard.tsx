"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Genre } from "@/lib/types";
import { TemplateWizardStep1 } from "./TemplateWizardStep1";
import { TemplateWizardStep2 } from "./TemplateWizardStep2";
import { TemplateWizardStep3 } from "./TemplateWizardStep3";

export type TemplateDraft = {
  title: string;
  genre: Genre;
  description: string;
  tags: string[];
  cover_image_url: string;
  is_public: boolean;
  ai_generated: boolean;
  content: {
    synopsis: string;
    acts: { title: string; description: string }[];
    npcs: { name: string; role: string; motivation: string }[];
    locations: { name: string; description: string; atmosphere: string }[];
    music_cues: { scene: string; suggestion: string }[];
  };
};

export type DraftSetter = (updater: (prev: TemplateDraft) => TemplateDraft) => void;

export const EMPTY_DRAFT: TemplateDraft = {
  title: "",
  genre: "fantasy",
  description: "",
  tags: [],
  cover_image_url: "",
  is_public: false,
  ai_generated: false,
  content: {
    synopsis: "",
    acts: [],
    npcs: [],
    locations: [],
    music_cues: [],
  },
};

type Props = {
  mode: "create" | "edit";
  initial?: TemplateDraft;
  templateId?: string;
};

const STEPS = [
  { num: 1, label: "Identidade" },
  { num: 2, label: "Conteúdo" },
  { num: 3, label: "Mídia" },
] as const;

export function TemplateWizard({ mode, initial, templateId }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<TemplateDraft>(initial ?? EMPTY_DRAFT);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function canAdvanceFromStep1() {
    return draft.title.trim().length > 0;
  }

  async function save() {
    if (!canAdvanceFromStep1()) {
      setError("Título é obrigatório.");
      setStep(1);
      return;
    }
    setError(null);
    setSaving(true);

    const supabase = createClient();
    const payload = {
      title: draft.title.trim(),
      genre: draft.genre,
      description: draft.description,
      tags: draft.tags,
      cover_image_url: draft.cover_image_url || null,
      is_public: draft.is_public,
      ai_generated: draft.ai_generated,
      content: draft.content,
    };

    if (mode === "edit" && templateId) {
      const { error: updateError } = await supabase
        .from("story_templates")
        .update(payload)
        .eq("id", templateId);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
      router.push(`/dashboard/templates/${templateId}`);
      router.refresh();
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Sessão expirada. Faça login novamente.");
        setSaving(false);
        return;
      }
      const { data, error: insertError } = await supabase
        .from("story_templates")
        .insert({ ...payload, gm_id: user.id })
        .select("id")
        .single<{ id: string }>();

      if (insertError || !data) {
        setError(insertError?.message ?? "Falha ao salvar.");
        setSaving(false);
        return;
      }
      router.push(`/dashboard/templates/${data.id}`);
      router.refresh();
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <nav className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (s.num === 1 || canAdvanceFromStep1()) setStep(s.num);
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

      {step === 1 && <TemplateWizardStep1 draft={draft} setDraft={setDraft} />}
      {step === 2 && <TemplateWizardStep2 draft={draft} setDraft={setDraft} />}
      {step === 3 && <TemplateWizardStep3 draft={draft} setDraft={setDraft} />}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="mt-auto flex gap-2">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
            className="flex-1 rounded-md bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-700"
          >
            Voltar
          </button>
        )}
        {step < 3 && (
          <button
            type="button"
            onClick={() => {
              if (step === 1 && !canAdvanceFromStep1()) {
                setError("Título é obrigatório.");
                return;
              }
              setError(null);
              setStep((s) => (s + 1) as 1 | 2 | 3);
            }}
            className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Próximo
          </button>
        )}
        {step === 3 && (
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving
              ? "Salvando..."
              : mode === "edit"
                ? "Atualizar template"
                : "Salvar template"}
          </button>
        )}
      </div>
    </div>
  );
}
