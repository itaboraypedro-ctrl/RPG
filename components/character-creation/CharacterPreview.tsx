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
    <div className="w-full max-w-md mx-auto">
      {/* Top controls (regenerate) */}
      {showRegenerate && !isGenerating && onRegenerate ? (
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={onRegenerate}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-cinzel uppercase tracking-[0.2em] border border-arcana-gold/40 text-arcana-gold hover:bg-arcana-gold hover:text-arcana-bg transition-colors rounded"
          >
            <span aria-hidden>🔄</span> Regerar
          </button>
        </div>
      ) : null}

      {/* Card */}
      <div className="relative aspect-[3/4] w-full overflow-hidden border border-arcana-border bg-arcana-surface rounded-md">
        {isGenerating ? (
          <div className="absolute inset-0 p-2">
            <PreviewSkeleton />
          </div>
        ) : imageUrl ? (
          <div
            key={imageUrl}
            className="absolute inset-0 character-preview-fade"
          >
            <Image
              src={imageUrl}
              alt={characterName ? `Retrato de ${characterName}` : "Personagem"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <svg
              viewBox="0 0 300 400"
              className="h-3/4 w-auto opacity-50"
              aria-hidden="true"
            >
              <g fill="rgba(122,106,85,0.35)">
                <circle cx="150" cy="90" r="40" />
                <rect x="138" y="125" width="24" height="20" />
                <path d="M 95 145 L 205 145 L 215 250 L 85 250 Z" />
                <path d="M 95 145 L 70 235 L 82 240 L 100 160 Z" />
                <path d="M 205 145 L 230 235 L 218 240 L 200 160 Z" />
                <path d="M 95 250 L 110 380 L 140 380 L 145 250 Z" />
                <path d="M 205 250 L 190 380 L 160 380 L 155 250 Z" />
              </g>
            </svg>
            <p className="font-cinzel italic text-arcana-text-dim text-sm">
              Aguardando sua escolha de raça...
            </p>
          </div>
        )}

        {/* History arrows */}
        {hasHistory && !isGenerating ? (
          <>
            <button
              type="button"
              onClick={() => onNavigateHistory("prev")}
              disabled={!canPrev}
              aria-label="Imagem anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full border border-arcana-gold/40 bg-arcana-bg/70 text-arcana-gold flex items-center justify-center hover:bg-arcana-gold hover:text-arcana-bg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span aria-hidden>‹</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateHistory("next")}
              disabled={!canNext}
              aria-label="Próxima imagem"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full border border-arcana-gold/40 bg-arcana-bg/70 text-arcana-gold flex items-center justify-center hover:bg-arcana-gold hover:text-arcana-bg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span aria-hidden>›</span>
            </button>
          </>
        ) : null}
      </div>

      {/* Footer / name + subtitle */}
      {(characterName || subtitle) && (
        <div className="mt-4 text-center">
          {characterName ? (
            <h3
              className="font-cinzel text-arcana-text"
              style={{ fontSize: "1.5rem" }}
            >
              {characterName}
            </h3>
          ) : null}
          {subtitle ? (
            <p className="mt-1 font-cinzel uppercase tracking-[0.2em] text-arcana-gold/70 text-xs">
              {subtitle}
            </p>
          ) : null}
        </div>
      )}

      <style jsx>{`
        @keyframes characterPreviewFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .character-preview-fade {
          animation: characterPreviewFadeIn 600ms ease-out forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .character-preview-fade {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
