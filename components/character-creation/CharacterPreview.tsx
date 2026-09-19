"use client";

import Image from "next/image";
import { PreviewSkeleton } from "./PreviewSkeleton";

type Props = {
  imageUrl: string | null;
  isGenerating: boolean;
  history: string[];
  currentHistoryIndex: number;
  onRegenerate?: () => void;
  onNavigateHistory: (dir: "prev" | "next") => void;
  characterName?: string;
  characterRace?: string;
  characterClass?: string;
  showRegenerate?: boolean;
};

export function CharacterPreview({
  imageUrl,
  isGenerating,
  history,
  currentHistoryIndex,
  onRegenerate,
  onNavigateHistory,
  characterName,
  characterRace,
  characterClass,
  showRegenerate = false,
}: Props) {
  const hasHistory = history.length > 1;
  const canPrev = hasHistory && currentHistoryIndex > 0;
  const canNext = hasHistory && currentHistoryIndex < history.length - 1;
  const subtitleParts = [characterRace, characterClass].filter(Boolean);
  const subtitle = subtitleParts.join(" · ");

  return (
    <div className="w-full max-w-[300px] mx-auto space-y-5">
      {/* Portrait — triple frame */}
      <div className="relative">
        {/* Outer decorative ring */}
        <div
          className="absolute pointer-events-none z-10"
          style={{
            inset: "-8px",
            border: "1px solid rgba(201,168,76,0.12)",
            borderRadius: "2px",
          }}
        />
        {/* Mid ring */}
        <div
          className="absolute pointer-events-none z-10"
          style={{
            inset: "-4px",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: "2px",
          }}
        />
        {/* Corner ornaments */}
        {[
          { top: "-10px", left: "-10px", borderTop: "2px solid", borderLeft: "2px solid", width: "14px", height: "14px" },
          { top: "-10px", right: "-10px", borderTop: "2px solid", borderRight: "2px solid", width: "14px", height: "14px" },
          { bottom: "-10px", left: "-10px", borderBottom: "2px solid", borderLeft: "2px solid", width: "14px", height: "14px" },
          { bottom: "-10px", right: "-10px", borderBottom: "2px solid", borderRight: "2px solid", width: "14px", height: "14px" },
        ].map((style, i) => (
          <div
            key={i}
            className="absolute pointer-events-none z-20"
            style={{ ...style, borderColor: "rgba(201,168,76,0.6)" }}
          />
        ))}

        {/* Portrait card */}
        <div
          className="relative aspect-[3/4] w-full overflow-hidden rounded-xl"
          style={{
            background: "var(--color-arcana-surface)",
            border: "1px solid var(--color-arcana-border)",
            boxShadow: "0 8px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03) inset",
          }}
        >
          {isGenerating ? (
            <div className="absolute inset-0 p-2">
              <PreviewSkeleton />
            </div>
          ) : imageUrl ? (
            <div key={imageUrl} className="absolute inset-0 preview-fade">
              <Image
                src={imageUrl}
                alt={characterName ? `Retrato de ${characterName}` : "Personagem"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
              />
              {/* Bottom gradient for name legibility */}
              <div
                className="absolute bottom-0 inset-x-0 h-1/3 pointer-events-none"
                style={{ background: "linear-gradient(to top, rgba(7,7,13,0.85) 0%, transparent 100%)" }}
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8">
              <svg viewBox="0 0 160 220" className="w-20 opacity-10" aria-hidden="true">
                <g fill="var(--color-arcana-gold)">
                  <circle cx="80" cy="48" r="22" />
                  <rect x="74" y="68" width="12" height="12" />
                  <path d="M 42 80 L 118 80 L 124 148 L 36 148 Z" />
                  <path d="M 42 80 L 22 140 L 34 144 L 46 90 Z" />
                  <path d="M 118 80 L 138 140 L 126 144 L 114 90 Z" />
                  <path d="M 42 148 L 54 215 L 72 215 L 76 148 Z" />
                  <path d="M 118 148 L 106 215 L 88 215 L 84 148 Z" />
                </g>
              </svg>
              <div className="text-center space-y-1">
                <p className="font-cinzel text-[9px] uppercase tracking-[0.4em] text-arcana-text-dim/30">
                  Retrato
                </p>
                <p className="font-crimson italic text-arcana-text-dim/25 text-sm">
                  Aguardando escolha de raça
                </p>
              </div>
            </div>
          )}

          {/* History nav — inside portrait */}
          {hasHistory && !isGenerating && (
            <>
              <button
                type="button"
                onClick={() => onNavigateHistory("prev")}
                disabled={!canPrev}
                aria-label="Retrato anterior"
                className={[
                  "absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-xl backdrop-blur-sm transition-all",
                  canPrev
                    ? "border border-arcana-gold/30 bg-arcana-bg/70 text-arcana-gold hover:border-arcana-gold/60 hover:bg-arcana-bg/90"
                    : "border border-white/5 bg-arcana-bg/40 text-arcana-text-muted cursor-not-allowed",
                ].join(" ")}
              >
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5">
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => onNavigateHistory("next")}
                disabled={!canNext}
                aria-label="Próximo retrato"
                className={[
                  "absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-xl backdrop-blur-sm transition-all",
                  canNext
                    ? "border border-arcana-gold/30 bg-arcana-bg/70 text-arcana-gold hover:border-arcana-gold/60 hover:bg-arcana-bg/90"
                    : "border border-white/5 bg-arcana-bg/40 text-arcana-text-muted cursor-not-allowed",
                ].join(" ")}
              >
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 font-cinzel text-[9px] tracking-[0.2em] text-white/40">
                {currentHistoryIndex + 1} / {history.length}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Name plate */}
      {(characterName || subtitle) && (
        <div className="text-center space-y-1.5">
          {characterName && (
            <h3
              className="font-cinzel uppercase tracking-[0.2em] text-arcana-text"
              style={{ fontSize: "1.1rem" }}
            >
              {characterName}
            </h3>
          )}
          {subtitle && (
            <p className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold/60">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Regenerate — low key */}
      {showRegenerate && !isGenerating && onRegenerate && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onRegenerate}
            className="font-cinzel text-[9px] uppercase tracking-[0.35em] text-arcana-text-dim/40 hover:text-arcana-gold/60 transition-colors px-3 py-1.5 border border-transparent hover:border-arcana-gold/15 rounded-xl"
          >
            Regerar retrato
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes previewFadeIn {
          from { opacity: 0; transform: scale(1.02); }
          to { opacity: 1; transform: scale(1); }
        }
        .preview-fade {
          animation: previewFadeIn 600ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .preview-fade { animation: none; }
        }
      `}</style>
    </div>
  );
}
