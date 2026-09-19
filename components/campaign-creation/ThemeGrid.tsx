"use client";

// Seleção de temas em cartas com emblema — multiseleção estilo "escolha de
// traços" de RPGs AAA: carta acesa em ouro quando escolhida, entalhe de
// confirmação no canto. O campo segue aberto: o Juiz pode cunhar temas próprios.

import { useState } from "react";
import { SACRAMENTO_THEMES } from "@/lib/rulesets/sacramento/themes";

type Props = {
  selected: string[];
  onChange: (themes: string[]) => void;
  /** Permite cunhar temas próprios (padrão: true). */
  allowCustom?: boolean;
};

export function ThemeGrid({ selected, onChange, allowCustom = true }: Props) {
  const [draft, setDraft] = useState("");

  const knownIds = SACRAMENTO_THEMES.map((t) => t.id);
  const custom = selected.filter((id) => !knownIds.includes(id));

  const toggle = (id: string) =>
    onChange(
      selected.includes(id)
        ? selected.filter((t) => t !== id)
        : [...selected, id],
    );

  const addCustom = () => {
    const value = draft.trim();
    if (!value) return;
    if (!selected.includes(value)) onChange([...selected, value]);
    setDraft("");
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {SACRAMENTO_THEMES.map((theme) => (
          <ThemeCard
            key={theme.id}
            active={selected.includes(theme.id)}
            nome={theme.nome}
            descricao={theme.descricao}
            icon={<ThemeIcon id={theme.id} />}
            onClick={() => toggle(theme.id)}
          />
        ))}
        {custom.map((name) => (
          <ThemeCard
            key={name}
            active
            nome={name}
            descricao="Tema cunhado pela mesa."
            icon={<ThemeIcon id="custom" />}
            onClick={() => toggle(name)}
            removable
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        {allowCustom ? (
          <div className="flex flex-1 gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom();
                }
              }}
              maxLength={40}
              placeholder="Cunhar tema próprio..."
              className="arcana-input max-w-56 flex-1 font-crimson text-sm"
            />
            <button
              type="button"
              onClick={addCustom}
              disabled={!draft.trim()}
              className={
                draft.trim()
                  ? "arcana-btn-ghost arcana-btn-sm shrink-0"
                  : "arcana-btn-disabled arcana-btn-sm shrink-0"
              }
            >
              Cunhar
            </button>
          </div>
        ) : (
          <span />
        )}
        <p className="shrink-0 font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-text-dim">
          {selected.length === 0
            ? "Nenhum tema"
            : `${selected.length} tema${selected.length > 1 ? "s" : ""}`}
        </p>
      </div>
    </div>
  );
}

function ThemeCard({
  active,
  nome,
  descricao,
  icon,
  onClick,
  removable,
}: {
  active: boolean;
  nome: string;
  descricao: string;
  icon: React.ReactNode;
  onClick: () => void;
  removable?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={removable ? "Remover tema" : descricao}
      className={[
        "group relative flex items-start gap-3 overflow-hidden rounded-sm border p-3 text-left transition-all duration-150",
        active
          ? "border-arcana-gold/70 bg-arcana-gold/[0.08]"
          : "border-arcana-border bg-arcana-surface/60 hover:border-arcana-gold/40 hover:bg-arcana-surface",
      ].join(" ")}
      style={
        active
          ? { boxShadow: "0 0 18px rgba(209,171,85,0.16), inset 0 1px 0 rgba(255,255,255,0.05)" }
          : { boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }
      }
    >
      {/* Emblema */}
      <span
        className={[
          "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border transition-colors",
          active
            ? "border-arcana-gold/60 text-arcana-gold-bright"
            : "border-arcana-border-dim text-arcana-text-dim group-hover:text-arcana-gold",
        ].join(" ")}
        style={
          active
            ? { background: "radial-gradient(circle at 50% 30%, rgba(209,171,85,0.22), rgba(209,171,85,0.04))" }
            : { background: "rgba(8,8,15,0.4)" }
        }
      >
        {icon}
      </span>

      <span className="min-w-0">
        <span
          className={[
            "block font-cinzel text-[11px] uppercase tracking-[0.16em] transition-colors",
            active ? "font-bold text-arcana-gold-bright" : "text-arcana-text",
          ].join(" ")}
        >
          {nome}
        </span>
        <span className="mt-0.5 block font-crimson text-[13px] leading-snug text-arcana-text-dim">
          {descricao}
        </span>
      </span>

      {/* Entalhe de seleção no canto */}
      <span
        aria-hidden
        className={[
          "absolute -right-px -top-px h-7 w-7 transition-opacity duration-150",
          active ? "opacity-100" : "opacity-0",
        ].join(" ")}
        style={{
          background: "linear-gradient(225deg, #d1ab55 50%, transparent 50%)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          className="absolute right-[2px] top-[2px] h-3 w-3"
          fill="none"
          stroke="#1c1206"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {removable ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 12.5l5 5L20 6.5" />
          )}
        </svg>
      </span>
    </button>
  );
}

/** Emblemas em traço fino (24×24, stroke currentColor) — um por tema. */
function ThemeIcon({ id }: { id: string }) {
  const paths: Record<string, React.ReactNode> = {
    // Sol nascendo no horizonte
    redencao: (
      <>
        <path d="M3 18h18" />
        <path d="M7.5 18a4.5 4.5 0 0 1 9 0" />
        <path d="M12 10V6.5M5.8 12.4 4 10.6M18.2 12.4 20 10.6" />
      </>
    ),
    // Lâminas cruzadas
    vinganca: (
      <>
        <path d="M5.5 4.5 19 18M18.5 4.5 5 18" />
        <path d="M4 19.5 7 18M20 19.5 17 18" />
        <path d="M4.2 6.2 7 4.8M19.8 6.2 17 4.8" />
      </>
    ),
    // Ferradura
    fuga: (
      <>
        <path d="M6.5 20v-8a5.5 5.5 0 0 1 11 0v8" />
        <path d="M5 16.5h3M16 16.5h3M5.5 12.5h2.8M15.7 12.5h2.8" />
      </>
    ),
    // Pilha de moedas
    divida: (
      <>
        <ellipse cx="12" cy="6.5" rx="6" ry="2.5" />
        <path d="M6 6.5v11c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-11" />
        <path d="M6 12c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5" />
      </>
    ),
    // Coroa
    ambicao: (
      <>
        <path d="M4.5 17.5 3 8l4.8 3.8L12 5.5l4.2 6.3L21 8l-1.5 9.5z" />
        <path d="M4.5 20h15" />
      </>
    ),
    // Cacto do sertão
    sobrevivencia: (
      <>
        <path d="M12 20.5V5.5a2 2 0 0 1 0 0" />
        <path d="M12 5.5v15M12 13c-2.6 0-3.8-1.1-3.8-3V8M12 15.5c2.6 0 3.8-1.1 3.8-3v-1.5" />
        <path d="M8 20.5h8" />
      </>
    ),
    // Balança
    "conflito-social": (
      <>
        <path d="M12 4.5v14M8 20.5h8M5.5 7h13" />
        <path d="M5.5 7 3.2 12M5.5 7l2.3 5M3.2 12a2.4 2.4 0 0 0 4.6 0" />
        <path d="M18.5 7l-2.3 5M18.5 7l2.3 5M16.2 12a2.4 2.4 0 0 0 4.6 0" />
      </>
    ),
    // Olho que espreita
    misterio: (
      <>
        <path d="M2.5 12S6.5 6 12 6s9.5 6 9.5 6-4 6-9.5 6-9.5-6-9.5-6z" />
        <circle cx="12" cy="12" r="2.6" />
      </>
    ),
    // Chapéu do Oeste
    "faroeste-classico": (
      <>
        <path d="M4 15.5c0 1.5 3.6 2.6 8 2.6s8-1.1 8-2.6c0-.8-1.1-1.4-2.6-1.8" />
        <path d="M6.6 13.7C5.1 14.1 4 14.7 4 15.5" />
        <path d="M6.6 13.7 8 8.3C8.4 6.9 10 6 12 6s3.6.9 4 2.3l1.4 5.4" />
      </>
    ),
    // Estrela — temas cunhados pela mesa
    custom: (
      <path d="M12 3.5l2.4 5.6 6.1.5-4.6 4 1.4 6L12 16.4 6.7 19.6l1.4-6-4.6-4 6.1-.5z" />
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {paths[id] ?? paths.custom}
    </svg>
  );
}
