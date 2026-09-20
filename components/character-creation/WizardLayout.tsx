"use client";

type Props = {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
  previewContent: React.ReactNode;
  /** Cabeçalho compacto do mobile (padrão: o mesmo header do desktop). */
  mobileHeader?: React.ReactNode;
  /** Muda a cada etapa — o miolo rolável volta ao topo quando muda. */
  scrollKey?: string | number;
};

export function WizardLayout({
  header,
  footer,
  children,
  previewContent,
  mobileHeader,
  scrollKey,
}: Props) {
  return (
    <div className="arcana-scene h-dvh text-arcana-text overflow-hidden">
      {/* Mobile: o personagem SEMPRE em cena; os controles vivem numa gaveta
          inferior que mostra uma micro-etapa curta por vez. */}
      <div className="lg:hidden h-full flex flex-col">
        <div className="relative shrink-0 flex items-center justify-center px-3 pt-2 pb-1"
          style={{ height: "42dvh" }}>
          {previewContent}
        </div>
        <div
          className="relative z-10 flex-1 min-h-0 flex flex-col rounded-t-2xl border-t border-arcana-border-dim"
          style={{
            background: "rgba(13,13,22,0.92)",
            backdropFilter: "blur(20px) saturate(1.3)",
            boxShadow: "0 -14px 40px rgba(0,0,0,0.55)",
          }}
        >
          <div className="shrink-0 px-4 pt-3 pb-2 border-b border-arcana-border-dim">
            {mobileHeader ?? header}
          </div>
          <div key={scrollKey} className="flex-1 overflow-y-auto px-4 py-4">
            {children}
          </div>
          <div className="shrink-0 px-4 py-3 border-t border-arcana-border-dim">
            {footer}
          </div>
        </div>
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
          <div key={scrollKey} className="flex-1 overflow-y-auto px-12 py-6">
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
