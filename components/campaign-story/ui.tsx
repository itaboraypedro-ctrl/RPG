"use client";

// Primitivos de UI compartilhados pelas seções do Hub de História.

export const labelClass =
  "font-cinzel text-[9px] uppercase tracking-[0.3em] text-arcana-text-dim";
export const hintClass = "font-crimson text-xs italic text-arcana-text-dim/50";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <span className={labelClass}>{label}</span>
      {children}
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}

export function TextField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="text"
      {...props}
      className={`arcana-input w-full font-crimson text-sm ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={props.rows ?? 3}
      {...props}
      className={`arcana-input w-full font-crimson text-sm leading-relaxed resize-y ${props.className ?? ""}`}
    />
  );
}

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-2xl space-y-1">
        <h2 className="font-cinzel text-xl uppercase tracking-[0.2em] text-arcana-gold-bright">
          {title}
        </h2>
        <p className="font-crimson text-sm italic text-arcana-text-dim">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function GhostButton({
  children,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-sm border px-3 py-1.5 font-cinzel text-[9px] uppercase tracking-[0.25em] transition-all disabled:opacity-40",
        danger
          ? "border-red-900/60 text-red-300/70 hover:border-red-500/60 hover:text-red-300"
          : "border-arcana-border text-arcana-text-dim hover:border-arcana-gold/50 hover:text-arcana-gold",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function GoldButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-sm px-4 py-2 font-cinzel text-[10px] uppercase tracking-[0.25em] text-arcana-bg transition-all hover:shadow-[0_0_20px_rgba(201,168,76,0.4)] disabled:opacity-40 disabled:hover:shadow-none"
      style={{ background: "linear-gradient(135deg, #c9a84c, #f0cc6a)" }}
    >
      {children}
    </button>
  );
}

export function OriginBadge({ origem }: { origem: "canon" | "campanha" }) {
  return (
    <span
      className={[
        "border px-1.5 py-0.5 font-cinzel text-[7px] uppercase tracking-[0.2em]",
        origem === "canon"
          ? "border-arcana-gold/40 text-arcana-gold/80"
          : "border-arcana-border text-arcana-text-dim/70",
      ].join(" ")}
      title={
        origem === "canon"
          ? "Elemento canônico do livro (com páginas de referência)"
          : "Criação desta campanha — não alega página do livro"
      }
    >
      {origem === "canon" ? "Cânone" : "Criação da campanha"}
    </span>
  );
}

export function VisibilityBadge({
  visibility,
  onToggle,
}: {
  visibility: "gm_only" | "public";
  onToggle?: () => void;
}) {
  const isSecret = visibility === "gm_only";
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!onToggle}
      title={
        isSecret
          ? "Só o Juiz vê. Clique para tornar visível aos jogadores."
          : "Visível para jogadores da campanha. Clique para ocultar."
      }
      className={[
        "border px-1.5 py-0.5 font-cinzel text-[7px] uppercase tracking-[0.2em] transition-colors",
        isSecret
          ? "border-red-900/60 text-red-300/80"
          : "border-emerald-900/60 text-emerald-300/80",
        onToggle ? "hover:opacity-80 cursor-pointer" : "cursor-default",
      ].join(" ")}
    >
      {isSecret ? "🔒 Só o Juiz" : "👁 Jogadores veem"}
    </button>
  );
}

export function PageRef({ paginas }: { paginas?: number[] }) {
  if (!paginas || paginas.length === 0) return null;
  const text =
    paginas.length === 2 && paginas[1] > paginas[0] + 1
      ? `pp. ${paginas[0]}–${paginas[1]}`
      : `p. ${paginas.join(", ")}`;
  return (
    <span className="font-crimson text-[11px] italic text-arcana-text-dim/40">{text}</span>
  );
}

export function ElementCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-arcana-border bg-arcana-surface/70 p-4">
      {children}
    </div>
  );
}

export function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-sm border border-dashed border-arcana-border/50 px-4 py-6 text-center font-crimson text-sm italic text-arcana-text-dim/50">
      {children}
    </p>
  );
}

/** Indicador de salvamento com transição suave. */
export function SaveState({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "idle") return null;
  return (
    <span
      className={[
        "font-cinzel text-[8px] uppercase tracking-[0.25em]",
        state === "saving" && "text-arcana-text-dim/60",
        state === "saved" && "text-emerald-300/80",
        state === "error" && "text-red-300/80",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {state === "saving" ? "Salvando..." : state === "saved" ? "Salvo" : "Erro ao salvar"}
    </span>
  );
}
