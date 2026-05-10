"use client";

import { useState } from "react";

type Props = {
  formContent: React.ReactNode;
  previewContent: React.ReactNode;
};

export function WizardLayout({ formContent, previewContent }: Props) {
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");

  return (
    <div className="min-h-dvh bg-arcana-bg text-arcana-text">
      {/* Mobile tab toggle */}
      <div className="lg:hidden sticky top-0 z-20 bg-arcana-bg/95 backdrop-blur border-b border-arcana-gold/20 px-4 py-3">
        <div className="flex bg-arcana-surface border border-arcana-border rounded-lg p-1">
          <button
            type="button"
            onClick={() => setMobileTab("form")}
            className={`flex-1 py-2 text-xs font-cinzel uppercase tracking-[0.2em] rounded transition-colors ${
              mobileTab === "form"
                ? "bg-arcana-gold text-arcana-bg"
                : "text-arcana-text-dim hover:text-arcana-text"
            }`}
          >
            Formulário
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`flex-1 py-2 text-xs font-cinzel uppercase tracking-[0.2em] rounded transition-colors ${
              mobileTab === "preview"
                ? "bg-arcana-gold text-arcana-bg"
                : "text-arcana-text-dim hover:text-arcana-text"
            }`}
          >
            Personagem
          </button>
        </div>
      </div>

      {/* Mobile content */}
      <div className="lg:hidden px-4 sm:px-6 py-6">
        {mobileTab === "form" ? (
          <div className="min-h-[calc(100dvh-8rem)]">{formContent}</div>
        ) : (
          <div className="min-h-[calc(100dvh-8rem)]">{previewContent}</div>
        )}
      </div>

      {/* Desktop: 55/45 grid */}
      <div className="hidden lg:grid lg:grid-cols-[55fr_45fr]">
        <div className="px-10 py-6 border-r border-arcana-gold/20">
          {formContent}
        </div>
        <div className="relative">
          <div className="sticky top-0 h-screen overflow-y-auto px-10 py-6">
            {previewContent}
          </div>
        </div>
      </div>
    </div>
  );
}
