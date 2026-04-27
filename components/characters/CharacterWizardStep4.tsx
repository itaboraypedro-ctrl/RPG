"use client";

import { useMemo } from "react";
import type { CharacterAppearance } from "./types";
import type { CharacterDraft, DraftSetter } from "./CharacterWizard";
import { AvatarGenerator } from "./AvatarGenerator";

function buildPrompt(a: CharacterAppearance, race: string, name: string): string {
  const parts: string[] = [];
  if (a.gender) parts.push(a.gender);
  parts.push(a.race_visual || race || "humanoid");
  if (a.hair_color) parts.push(`${a.hair_color} hair`);
  if (a.eye_color) parts.push(`${a.eye_color} eyes`);
  if (a.skin_tone) parts.push(`${a.skin_tone} skin`);
  if (a.armor_style) parts.push(`wearing ${a.armor_style}`);
  if (a.expression) parts.push(`${a.expression} expression`);
  if (a.traits) parts.push(a.traits);
  return parts.filter(Boolean).join(", ") + (name ? ` (${name})` : "");
}

export function CharacterWizardStep4({
  draft,
  setDraft,
}: {
  draft: CharacterDraft;
  setDraft: DraftSetter;
}) {
  const prompt = useMemo(
    () => buildPrompt(draft.appearance, draft.race, draft.name),
    [draft.appearance, draft.race, draft.name]
  );

  function update(patch: Partial<CharacterAppearance>) {
    setDraft((d) => ({ ...d, appearance: { ...d.appearance, ...patch } }));
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="grid grid-cols-2 gap-3">
        <Field label="Gênero" value={draft.appearance.gender ?? ""} onChange={(v) => update({ gender: v })} placeholder="ex: feminine, masculine, androgynous" />
        <Field label="Raça/espécie visual" value={draft.appearance.race_visual ?? ""} onChange={(v) => update({ race_visual: v })} placeholder="ex: elf, dwarf, tiefling" />
        <Field label="Cor de cabelo" value={draft.appearance.hair_color ?? ""} onChange={(v) => update({ hair_color: v })} />
        <Field label="Cor dos olhos" value={draft.appearance.eye_color ?? ""} onChange={(v) => update({ eye_color: v })} />
        <Field label="Tom de pele" value={draft.appearance.skin_tone ?? ""} onChange={(v) => update({ skin_tone: v })} />
        <Field label="Roupa/armadura" value={draft.appearance.armor_style ?? ""} onChange={(v) => update({ armor_style: v })} placeholder="ex: leather armor, mage robes" />
        <Field label="Expressão" value={draft.appearance.expression ?? ""} onChange={(v) => update({ expression: v })} placeholder="ex: serious, fierce, serene" />
        <Field label="Traços marcantes" value={draft.appearance.traits ?? ""} onChange={(v) => update({ traits: v })} placeholder="cicatrizes, tatuagens, etc." />
      </section>

      <section className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Prompt montado
        </h3>
        <p className="rounded bg-zinc-950 p-2 text-xs text-zinc-300">
          {prompt || "(preencha os campos acima)"}
        </p>
      </section>

      <AvatarGenerator
        prompt={prompt}
        currentAvatar={draft.avatar_url}
        onSelect={(url) => setDraft((d) => ({ ...d, avatar_url: url }))}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-zinc-400">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-xs"
      />
    </div>
  );
}
