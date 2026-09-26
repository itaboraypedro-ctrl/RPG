"use client";

import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Separa texto colado (vírgula, espaço, quebra de linha) em e-mails válidos. */
export function parseEmails(text: string): { validos: string[]; invalidos: string[] } {
  const partes = text
    .split(/[\s,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return {
    validos: [...new Set(partes.filter((p) => EMAIL_RE.test(p)))],
    invalidos: partes.filter((p) => !EMAIL_RE.test(p)),
  };
}

/** Lista de e-mails convidados: cola vários de uma vez, remove com um clique. */
export function EmailListEditor({
  values,
  onChange,
}: {
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function adicionar() {
    const { validos, invalidos } = parseEmails(draft);
    if (validos.length > 0) onChange([...new Set([...values, ...validos])]);
    setErro(invalidos.length > 0 ? `Não parece e-mail: ${invalidos.join(", ")}` : null);
    setDraft(invalidos.join(" "));
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="email"
          autoComplete="off"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              adicionar();
            }
          }}
          placeholder="jogador@email.com — cole vários separados por vírgula"
          className="arcana-input min-w-0 flex-1 font-crimson text-sm"
        />
        <button type="button" onClick={adicionar} className="arcana-btn-ghost arcana-btn-sm shrink-0">
          Convidar
        </button>
      </div>
      {erro && <p className="font-crimson text-sm italic text-red-300">{erro}</p>}
      {values.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {values.map((email) => (
            <li
              key={email}
              className="flex items-center gap-2 rounded-full border border-arcana-gold/40 bg-arcana-surface px-3 py-1"
            >
              <span className="font-crimson text-sm text-arcana-text">{email}</span>
              <button
                type="button"
                aria-label={`Remover ${email}`}
                onClick={() => onChange(values.filter((v) => v !== email))}
                className="font-cinzel text-xs text-arcana-text-dim hover:text-red-300"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
