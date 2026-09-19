"use client";

import { useState } from "react";

export function Chip({
  active,
  onClick,
  children,
  title,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={[
        "px-3 py-1.5 font-cinzel text-[10px] uppercase tracking-[0.18em]",
        active ? "arcana-chip-active" : "arcana-chip",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/** Lista editável de tags: sugestões clicáveis + entrada livre. */
export function TagListEditor({
  values,
  suggestions,
  placeholder,
  onChange,
}: {
  values: string[];
  suggestions: string[];
  placeholder: string;
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const toggle = (tag: string) =>
    onChange(
      values.includes(tag) ? values.filter((v) => v !== tag) : [...values, tag],
    );

  const addDraft = () => {
    const value = draft.trim();
    if (!value) return;
    if (!values.includes(value)) onChange([...values, value]);
    setDraft("");
  };

  const custom = values.filter((v) => !suggestions.includes(v));

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-2">
        {suggestions.map((tag) => (
          <Chip key={tag} active={values.includes(tag)} onClick={() => toggle(tag)}>
            {tag}
          </Chip>
        ))}
        {custom.map((tag) => (
          <Chip key={tag} active onClick={() => toggle(tag)} title="Remover">
            {tag} ✕
          </Chip>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addDraft();
            }
          }}
          maxLength={80}
          placeholder={placeholder}
          className="arcana-input flex-1 font-crimson text-sm"
        />
        <button
          type="button"
          onClick={addDraft}
          className="arcana-btn-ghost arcana-btn-sm shrink-0"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}
