"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Session, SessionSettings } from "@/lib/types";

type TemplateOption = { id: string; title: string };

type Props = {
  mode: "create" | "edit";
  session?: Session;
  templates: TemplateOption[];
};

const DEFAULT_SETTINGS: Required<SessionSettings> = {
  max_players: 6,
  allow_new_chars: true,
  xp_enabled: true,
  death_saves: true,
  ai_assistant: true,
};

export function SessionForm({ mode, session, templates }: Props) {
  const router = useRouter();

  const initialSettings: Required<SessionSettings> = {
    ...DEFAULT_SETTINGS,
    ...(session?.settings ?? {}),
  };

  const [title, setTitle] = useState(session?.title ?? "");
  const [description, setDescription] = useState(session?.description ?? "");
  const [templateId, setTemplateId] = useState(session?.template_id ?? "");
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length === 0) {
      setError("Título é obrigatório.");
      return;
    }
    setError(null);
    setSaving(true);

    const supabase = createClient();
    const payload = {
      title: title.trim(),
      description,
      template_id: templateId || null,
      settings,
    };

    if (mode === "edit" && session) {
      const { error: updateError } = await supabase
        .from("sessions")
        .update(payload)
        .eq("id", session.id);
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
      router.push(`/dashboard/sessions/${session.id}`);
      router.refresh();
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Sessão expirada.");
        setSaving(false);
        return;
      }
      const { data, error: insertError } = await supabase
        .from("sessions")
        .insert({ ...payload, gm_id: user.id })
        .select("id")
        .single<{ id: string }>();
      if (insertError || !data) {
        setError(insertError?.message ?? "Falha ao criar sessão.");
        setSaving(false);
        return;
      }
      router.push(`/dashboard/sessions/${data.id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm text-zinc-400">
          Título <span className="text-red-400">*</span>
        </label>
        <input
          id="title"
          type="text"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm text-zinc-400">
          Descrição
        </label>
        <textarea
          id="description"
          rows={3}
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="template" className="text-sm text-zinc-400">
          Template
        </label>
        <select
          id="template"
          value={templateId ?? ""}
          onChange={(e) => setTemplateId(e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        >
          <option value="">Sem template</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="flex flex-col gap-3 rounded-md border border-zinc-800 bg-zinc-900 p-3">
        <legend className="px-2 text-xs uppercase tracking-wide text-zinc-500">
          Configurações
        </legend>

        <div className="flex items-center justify-between gap-4">
          <label htmlFor="max_players" className="text-sm text-zinc-300">
            Máximo de jogadores
          </label>
          <input
            id="max_players"
            type="number"
            min={1}
            max={20}
            value={settings.max_players}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                max_players: Math.max(1, Math.min(20, Number(e.target.value) || 1)),
              }))
            }
            className="w-16 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-center text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <Toggle
          label="Permitir criar personagem na hora"
          checked={settings.allow_new_chars}
          onChange={(v) => setSettings((s) => ({ ...s, allow_new_chars: v }))}
        />
        <Toggle
          label="Sistema de XP ativo"
          checked={settings.xp_enabled}
          onChange={(v) => setSettings((s) => ({ ...s, xp_enabled: v }))}
        />
        <Toggle
          label="Death saves ativos"
          checked={settings.death_saves}
          onChange={(v) => setSettings((s) => ({ ...s, death_saves: v }))}
        />
        <Toggle
          label="Assistente de IA ativo"
          checked={settings.ai_assistant}
          onChange={(v) => setSettings((s) => ({ ...s, ai_assistant: v }))}
        />
      </fieldset>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="mt-auto rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {saving
          ? "Salvando..."
          : mode === "edit"
            ? "Atualizar sessão"
            : "Criar sessão"}
      </button>
    </form>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 text-sm text-zinc-300">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-emerald-500"
      />
    </label>
  );
}
