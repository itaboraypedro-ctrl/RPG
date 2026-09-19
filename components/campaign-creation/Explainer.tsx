"use client";

// Camadas de orientação para mesas leigas (SPEC v3 + Doc 2):
// - InfoTip: glossário no hover/toque — termos como NdC, linhas, véus.
// - HowItWorks: painel "Como funciona" sob botão — o que é, para que
//   serve e passos práticos de cada seção, sem poluir a tela.

import { useId, useState } from "react";
import {
  GLOSSARY,
  type GlossaryEntry,
  type SectionGuide,
} from "@/lib/rulesets/sacramento/guidance";

/** Termo com ⓘ: explica no hover (desktop) e no toque (mobile). */
export function InfoTip({ term, label }: { term: string; label?: string }) {
  const entry: GlossaryEntry | undefined = GLOSSARY[term];
  const [open, setOpen] = useState(false);
  const id = useId();
  if (!entry) return label ? <span>{label}</span> : null;

  return (
    <span
      className="relative inline-flex items-center gap-1"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {label && <span>{label}</span>}
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        aria-label={`O que é ${entry.titulo}?`}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className={[
          "flex h-4 w-4 items-center justify-center rounded-full border font-crimson text-[10px] italic leading-none transition-colors",
          open
            ? "border-arcana-gold bg-arcana-gold/15 text-arcana-gold-bright"
            : "border-arcana-border text-arcana-text-dim hover:border-arcana-gold/60 hover:text-arcana-gold",
        ].join(" ")}
      >
        i
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="arcana-panel-elevated absolute left-1/2 top-full z-40 mt-2 block w-64 -translate-x-1/2 p-3 text-left normal-case tracking-normal"
        >
          <span className="block font-cinzel text-[10px] font-bold uppercase tracking-[0.18em] text-arcana-gold">
            {entry.titulo}
          </span>
          <span className="mt-1 block font-crimson text-[13px] leading-snug text-arcana-text">
            {entry.texto}
          </span>
          {entry.paginas && (
            <span className="mt-1.5 block font-crimson text-[11px] italic text-arcana-text-dim">
              No livro: {entry.paginas}
            </span>
          )}
        </span>
      )}
    </span>
  );
}

/** Painel "Como funciona" — recolhido por padrão, um clique abre tudo. */
export function HowItWorks({ guide }: { guide: SectionGuide }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={[
          "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-cinzel text-[10px] uppercase tracking-[0.2em] transition-all",
          open
            ? "border-arcana-gold/60 bg-arcana-gold/10 text-arcana-gold-bright"
            : "border-arcana-border text-arcana-text-dim hover:border-arcana-gold/50 hover:text-arcana-gold",
        ].join(" ")}
      >
        <span aria-hidden className="font-crimson text-sm italic leading-none">
          ✦
        </span>
        {open ? "Fechar guia" : "Como funciona"}
      </button>

      {open && (
        <div className="arcana-panel mt-3 space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <GuideBlock title="O que é">
              <p className="font-crimson text-sm leading-relaxed text-arcana-text">
                {guide.oQueE}
              </p>
            </GuideBlock>
            <GuideBlock title="Para que serve">
              <p className="font-crimson text-sm leading-relaxed text-arcana-text">
                {guide.paraQueServe}
              </p>
            </GuideBlock>
          </div>
          <GuideBlock title="Na prática">
            <ol className="space-y-1.5">
              {guide.naPratica.map((passo, i) => (
                <li key={i} className="flex gap-2.5 font-crimson text-sm leading-relaxed text-arcana-text">
                  <span className="shrink-0 font-cinzel text-[11px] font-bold text-arcana-gold">
                    {i + 1}.
                  </span>
                  {passo}
                </li>
              ))}
            </ol>
          </GuideBlock>
          {guide.paginas && (
            <p className="border-t border-arcana-border-dim pt-3 font-crimson text-xs italic text-arcana-text-dim">
              No livro: {guide.paginas}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function GuideBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="font-cinzel text-[10px] font-bold uppercase tracking-[0.25em] text-arcana-gold">
        {title}
      </p>
      {children}
    </div>
  );
}
