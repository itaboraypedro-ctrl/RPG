"use client";

// Primitivos de UI compartilhados pelas seções do Hub de História.

export const labelClass =
  "font-cinzel text-[10px] uppercase tracking-[0.28em] text-arcana-gold/90";
export const hintClass = "font-crimson text-[13px] italic text-arcana-text-dim";

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
  imageSrc,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  /** Banner pintado da seção (faixa 4:1, título sobreposto no scrim escuro). */
  imageSrc?: string;
}) {
  if (!imageSrc) {
    return (
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl space-y-1.5">
          <div>
            <h2 className="arcana-heading text-2xl tracking-[0.14em]">{title}</h2>
            <div className="arcana-heading-bar w-40" />
          </div>
          <p className="font-crimson text-sm italic text-arcana-text-dim">{description}</p>
        </div>
        {action}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative h-28 overflow-hidden rounded-xl border border-arcana-border-dim sm:h-36">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* Scrim: garante o contraste do título sobre a pintura */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(11,11,20,0.86), rgba(11,11,20,0.45) 45%, rgba(11,11,20,0.12)), linear-gradient(0deg, rgba(11,11,20,0.75), transparent 45%)",
          }}
        />
        <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-5">
          <h2
            className="arcana-heading text-2xl tracking-[0.14em]"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
          >
            {title}
          </h2>
          <div className="arcana-heading-bar w-40" />
        </div>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="max-w-2xl font-crimson text-sm italic text-arcana-text-dim">
          {description}
        </p>
        {action}
      </div>
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
      className={danger ? "arcana-btn-danger arcana-btn-sm" : "arcana-btn-ghost arcana-btn-sm"}
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
  if (disabled) {
    return (
      <button type="button" disabled className="arcana-btn-disabled arcana-btn-sm">
        {children}
      </button>
    );
  }
  return (
    <button type="button" onClick={onClick} className="arcana-btn-primary arcana-btn-sm">
      {children}
    </button>
  );
}

export function OriginBadge({ origem }: { origem: "canon" | "campanha" }) {
  return (
    <span
      className={[
        "rounded-full border px-1.5 py-0.5 font-cinzel text-[9px] uppercase tracking-[0.2em]",
        origem === "canon"
          ? "border-arcana-gold/40 text-arcana-gold"
          : "border-arcana-border text-arcana-text-dim",
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
        "rounded-full border px-1.5 py-0.5 font-cinzel text-[9px] uppercase tracking-[0.2em] transition-colors",
        isSecret
          ? "border-red-900/60 text-red-300"
          : "border-emerald-900/60 text-emerald-300",
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
    <span className="font-crimson text-[11px] italic text-arcana-text-muted">{text}</span>
  );
}

export function ElementCard({ children }: { children: React.ReactNode }) {
  return <div className="arcana-card p-4">{children}</div>;
}

export function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-arcana-border/50 px-4 py-6 text-center font-crimson text-sm italic text-arcana-text-dim">
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
        "font-cinzel text-[10px] uppercase tracking-[0.25em]",
        state === "saving" && "text-arcana-text-dim",
        state === "saved" && "text-emerald-300",
        state === "error" && "text-red-300",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {state === "saving" ? "Salvando..." : state === "saved" ? "Salvo" : "Erro ao salvar"}
    </span>
  );
}
