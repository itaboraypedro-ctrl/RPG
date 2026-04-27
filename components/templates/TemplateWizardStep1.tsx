"use client";

import { useState } from "react";
import type { Genre } from "@/lib/types";
import type { DraftSetter, TemplateDraft } from "./TemplateWizard";

const GENRES: { value: Genre; label: string }[] = [
  { value: "fantasy", label: "Fantasia" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "horror", label: "Horror" },
  { value: "western", label: "Western" },
  { value: "modern", label: "Moderno" },
  { value: "custom", label: "Outro" },
];

export function TemplateWizardStep1({
  draft,
  setDraft,
}: {
  draft: TemplateDraft;
  setDraft: DraftSetter;
}) {
  const [tagInput, setTagInput] = useState("");

  function addTag() {
    const value = tagInput.trim();
    if (!value || draft.tags.includes(value)) {
      setTagInput("");
      return;
    }
    setDraft((d) => ({ ...d, tags: [...d.tags, value] }));
    setTagInput("");
  }

  function removeTag(tag: string) {
    setDraft((d) => ({ ...d, tags: d.tags.filter((t) => t !== tag) }));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm text-zinc-400">
          Título <span className="text-red-400">*</span>
        </label>
        <input
          id="title"
          type="text"
          required
          maxLength={200}
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="genre" className="text-sm text-zinc-400">
          Gênero
        </label>
        <select
          id="genre"
          value={draft.genre}
          onChange={(e) =>
            setDraft((d) => ({ ...d, genre: e.target.value as Genre }))
          }
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        >
          {GENRES.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm text-zinc-400">
          Descrição curta
        </label>
        <textarea
          id="description"
          rows={3}
          maxLength={2000}
          value={draft.description}
          onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tags" className="text-sm text-zinc-400">
          Tags
        </label>
        <div className="flex flex-wrap gap-1.5">
          {draft.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => removeTag(tag)}
              className="flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-200 hover:bg-zinc-700"
            >
              {tag}
              <span className="text-zinc-500">×</span>
            </button>
          ))}
        </div>
        <input
          id="tags"
          type="text"
          placeholder="Pressione Enter para adicionar"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag();
            }
          }}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>
    </div>
  );
}
