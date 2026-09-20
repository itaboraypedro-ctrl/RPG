"use client";

import Image from "next/image";
import { PreviewSkeleton } from "../PreviewSkeleton";

type Props = {
  imageUrl: string | null;
  isGenerating: boolean;
  history: string[];
  currentHistoryIndex: number;
  onNavigateHistory: (dir: "prev" | "next") => void;
  characterName?: string;
  subtitle?: string;
};

export function SacramentoPreview({
  imageUrl,
  isGenerating,
  history,
  currentHistoryIndex,
  onNavigateHistory,
  characterName,
  subtitle,
}: Props) {
  const showHistoryNav = history.length > 1 && !isGenerating;

  return (
    <div className="w-full max-w-[300px] mx-auto space-y-5">
      <div className="relative">
        {/* Anéis da moldura */}
        <div
          className="absolute -inset-2 rounded-2xl pointer-events-none"
          style={{ border: "1px solid rgba(209, 171, 85, 0.12)" }}
        />
        <div
          className="absolute -inset-1 rounded-xl pointer-events-none"
          style={{ border: "1px solid rgba(209, 171, 85, 0.2)" }}
        />

        <div
          className="relative aspect-[2/3] w-full overflow-hidden rounded-xl"
          style={{
            background: "var(--color-arcana-surface)",
            border: "1px solid var(--color-arcana-border)",
            boxShadow: "0 8px 48px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.03)",
          }}
        >
          {isGenerating ? (
            <PreviewSkeleton />
          ) : imageUrl ? (
            <div key={imageUrl} className="preview-fade absolute inset-0">
              <Image
                src={imageUrl}
                alt={characterName ? `Retrato de ${characterName}` : "Retrato do personagem"}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 300px"
                unoptimized={imageUrl.startsWith("data:")}
              />
              <div
                className="absolute inset-x-0 bottom-0 h-1/4 pointer-events-none"
                style={{
                  background: "linear-gradient(180deg, transparent, rgba(7,7,13,0.75))",
                }}
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <svg viewBox="0 0 60 90" className="w-16 opacity-20" aria-hidden>
                <circle cx="30" cy="18" r="10" fill="var(--color-arcana-gold)" />
                <path
                  d="M16 34 Q30 28 44 34 L46 62 Q30 68 14 62 Z"
                  fill="var(--color-arcana-gold)"
                />
                <rect x="22" y="64" width="6" height="22" rx="3" fill="var(--color-arcana-gold)" />
                <rect x="32" y="64" width="6" height="22" rx="3" fill="var(--color-arcana-gold)" />
              </svg>
              <p className="font-crimson text-sm italic text-arcana-text-dim">
                Escolha os traços para ver a base
              </p>
            </div>
          )}

          {showHistoryNav && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 pb-3">
              <button
                type="button"
                onClick={() => onNavigateHistory("prev")}
                disabled={currentHistoryIndex === 0}
                aria-label="Versão anterior"
                className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors disabled:opacity-30 text-arcana-text hover:text-arcana-gold-bright"
                style={{ background: "rgba(11,11,20,0.6)", border: "1px solid rgba(209,171,85,0.35)" }}
              >
                ‹
              </button>
              <span className="font-cinzel text-[10px] tracking-[0.2em] text-arcana-text">
                {currentHistoryIndex + 1} / {history.length}
              </span>
              <button
                type="button"
                onClick={() => onNavigateHistory("next")}
                disabled={currentHistoryIndex === history.length - 1}
                aria-label="Próxima versão"
                className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors disabled:opacity-30 text-arcana-text hover:text-arcana-gold-bright"
                style={{ background: "rgba(11,11,20,0.6)", border: "1px solid rgba(209,171,85,0.35)" }}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {(characterName || subtitle) && (
        <div className="text-center space-y-1">
          {characterName && (
            <h3 className="font-cinzel uppercase tracking-[0.2em] text-arcana-text text-lg">
              {characterName}
            </h3>
          )}
          {subtitle && (
            <p className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <style jsx>{`
        .preview-fade {
          animation: previewFadeIn 600ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes previewFadeIn {
          from {
            opacity: 0;
            transform: scale(1.02);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .preview-fade {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
