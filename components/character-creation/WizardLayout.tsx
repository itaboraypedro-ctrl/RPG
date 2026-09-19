"use client";

import { useState } from "react";

type Props = {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
  previewContent: React.ReactNode;
  formTabLabel?: string;
  previewTabLabel?: string;
};

export function WizardLayout({
  header,
  footer,
  children,
  previewContent,
  formTabLabel = "Criação",
  previewTabLabel = "Retrato",
}: Props) {
  const [mobileTab, setMobileTab] = useState<"form" | "preview">("form");

  return (
    <div className="arcana-scene h-dvh text-arcana-text overflow-hidden">
      {/* Mobile layout */}
      <div className="lg:hidden h-full flex flex-col">
        {/* Mobile tab toggle */}
        <div
          className="arcana-glass-edge shrink-0 z-20 border-b border-arcana-border-dim px-4 py-3"
        >
          <div className="flex rounded-xl overflow-hidden border border-arcana-border-dim">
            <button
              type="button"
              onClick={() => setMobileTab("form")}
              className={[
                "flex-1 py-2.5 font-cinzel text-[10px] uppercase tracking-[0.25em] transition-all",
                mobileTab === "form"
                  ? "bg-arcana-gold text-arcana-bg"
                  : "text-arcana-text-dim hover:text-arcana-text",
              ].join(" ")}
            >
              {formTabLabel}
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("preview")}
              className={[
                "flex-1 py-2.5 font-cinzel text-[10px] uppercase tracking-[0.25em] transition-all border-l border-arcana-border-dim",
                mobileTab === "preview"
                  ? "bg-arcana-gold text-arcana-bg"
                  : "text-arcana-text-dim hover:text-arcana-text",
              ].join(" ")}
            >
              {previewTabLabel}
            </button>
          </div>
        </div>

        {mobileTab === "form" ? (
          <>
            {/* Mobile header */}
            <div className="shrink-0 px-4 pt-5 pb-4 border-b border-arcana-border-dim">
              {header}
            </div>
            {/* Mobile scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 py-5">
              {children}
            </div>
            {/* Mobile footer */}
            <div
              className="arcana-glass-edge shrink-0 px-4 py-4 border-t border-arcana-border-dim"
            >
              {footer}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-8 flex items-center justify-center">
            {previewContent}
          </div>
        )}
      </div>

      {/* Desktop: 60/40 */}
      <div className="hidden lg:flex h-dvh">
        {/* Form side — fixed header + scrollable body + fixed footer */}
        <div className="flex-[60] flex flex-col border-r border-arcana-border-dim">
          {/* Fixed header */}
          <div className="shrink-0 px-12 pt-8 pb-6 border-b border-arcana-border-dim">
            {header}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-12 py-6">
            {children}
          </div>

          {/* Fixed footer */}
          <div
            className="arcana-glass-edge shrink-0 px-12 py-5 border-t border-arcana-border-dim"
          >
            {footer}
          </div>
        </div>

        {/* Portrait side */}
        <div
          className="flex-[40] relative"
          style={{
            background: "linear-gradient(160deg, var(--color-arcana-surface) 0%, var(--color-arcana-bg) 60%)",
          }}
        >
          {/* Noise grain overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "200px 200px",
            }}
          />
          <div className="h-full flex items-center justify-center px-8 py-8 overflow-y-auto">
            {previewContent}
          </div>
        </div>
      </div>
    </div>
  );
}
