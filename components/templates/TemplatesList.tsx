"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Genre, StoryTemplate } from "@/lib/types";
import { TemplateCard } from "./TemplateCard";

const GENRES: { value: Genre | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "fantasy", label: "Fantasia" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "horror", label: "Horror" },
  { value: "western", label: "Western" },
  { value: "modern", label: "Moderno" },
  { value: "custom", label: "Outro" },
];

export function TemplatesList({ templates }: { templates: StoryTemplate[] }) {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState<Genre | "all">("all");

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (genre !== "all" && t.genre !== genre) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [templates, search, genre]);

  if (templates.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="text-4xl">📖</span>
        <p className="text-zinc-400">
          Nenhuma história ainda. Crie sua primeira aventura.
        </p>
        <Link
          href="/dashboard/templates/new"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Novo template
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <input
          type="search"
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value as Genre | "all")}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        >
          {GENRES.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          Nenhum template corresponde aos filtros.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((t) => (
            <TemplateCard key={t.id} template={t} />
          ))}
        </div>
      )}
    </div>
  );
}
