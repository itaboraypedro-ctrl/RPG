// Ícones minimalistas das 30 habilidades — mesma linguagem dos emblemas SVG do
// wizard de campanha (ThemeGrid): traço 1.5, currentColor, legíveis pequenos.
// Nada de pintura realista aqui: em 40px, linha limpa vence.

const GLYPHS: Record<string, React.ReactNode> = {
  // ── Combate ──
  "armas-da-natureza": (
    <>
      <path d="M5 19l7-7" />
      <path d="M10 6l8 8-4.5 1.5L10 12z" />
      <path d="M15 3.5L20.5 9" />
    </>
  ),
  "ataque-sacana": (
    <>
      <path d="M12 3l2.5 3.5L12 14l-2.5-7.5z" />
      <path d="M8.5 14.5h7" />
      <path d="M12 14.5V19" />
      <circle cx="12" cy="20.5" r="0.75" />
    </>
  ),
  "briga-de-bar": (
    <>
      <path d="M10 3h4v3.5l2 3V19a1.5 1.5 0 01-1.5 1.5h-5A1.5 1.5 0 018 19V9.5l2-3z" />
      <path d="M10.5 12.5l2 2-1.5 2.5" />
    </>
  ),
  "coldre-de-sabao": (
    <>
      <rect x="4" y="7" width="8.5" height="12.5" rx="1.5" />
      <rect x="11.5" y="4" width="8.5" height="12.5" rx="1.5" />
      <path d="M15.75 8.2c1.3 1.6 1.3 2.6 0 3-1.3-.4-1.3-1.4 0-3z" />
    </>
  ),
  "dedo-quente": (
    <>
      <path d="M3.5 8.5h13.5L21 7v4l-3.5 1.5H12l-1.5 4.5h-3l1.5-4.5H3.5z" />
      <circle cx="6.5" cy="10" r="0.75" />
    </>
  ),
  "furia-dos-aflitos": (
    <>
      <path d="M12 3c2.5 3.5-1 4.5 1.5 7 1-2 3.5-1.5 3.5 1.5a5 5 0 11-10 0C7 8 11 8.5 12 3z" />
    </>
  ),
  "gatilho-furioso": (
    <>
      <path d="M4 8h8.5a2 2 0 010 4H4z" />
      <path d="M4 14h8.5a2 2 0 010 4H4z" />
      <path d="M16.5 10h3M16.5 16h3" />
    </>
  ),
  livramento: (
    <>
      <path d="M12 19.5S5.5 15.5 5.5 11a3.4 3.4 0 016.5-1.4A3.4 3.4 0 0118.5 11c0 4.5-6.5 8.5-6.5 8.5z" />
      <path d="M12 3v2.5M9.5 4l1 1.5M14.5 4l-1 1.5" />
    </>
  ),
  marretada: (
    <>
      <path d="M6 12v-1.5a1.5 1.5 0 013 0V12M9 10.5V9a1.5 1.5 0 013 0v1.5M12 10.5v-1a1.5 1.5 0 013 0v2" />
      <path d="M6 12v3.5A4.5 4.5 0 0010.5 20h1a3.5 3.5 0 003.5-3.5v-4" />
      <path d="M6 13H4.75A1.75 1.75 0 013 11.25 1.75 1.75 0 014.75 9.5H6" />
      <path d="M18 7l2.5-2.5M18.5 11H21" />
    </>
  ),
  parrudeza: (
    <>
      <path d="M12 3l7 2.5V11c0 4.8-3.5 7.8-7 9-3.5-1.2-7-4.2-7-9V5.5z" />
      <path d="M12 8.5v6M9 11.5h6" />
    </>
  ),
  "punhos-do-oriente": (
    <>
      <rect x="3.5" y="10.5" width="6.5" height="6.5" rx="2" />
      <rect x="14" y="8.5" width="6.5" height="6.5" rx="2" />
      <path d="M10 6.5c1.5-2.5 4-2.5 5.5-.5" />
    </>
  ),
  "quebra-ossos": (
    <>
      <circle cx="7" cy="12" r="3.5" />
      <circle cx="17" cy="12" r="3.5" />
      <path d="M10.5 12h3" />
    </>
  ),
  "sorte-dos-covardes": (
    <>
      <circle cx="9.5" cy="9" r="3" />
      <circle cx="14.5" cy="9" r="3" />
      <circle cx="12" cy="13" r="3" />
      <path d="M12 16v4.5" />
    </>
  ),
  "valei-me": (
    <>
      <rect x="5.5" y="10.5" width="13" height="7" rx="2" />
      <path d="M12 10.5V8c0-2 1.5-2.5 3-3.5" />
      <path d="M16.5 2.5l1 1M18.5 4l-1.4.4" />
    </>
  ),
  "zoi-de-gaviao": (
    <>
      <circle cx="12" cy="12" r="5.5" />
      <path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3" />
      <circle cx="12" cy="12" r="0.75" />
    </>
  ),
  // ── Profissão ──
  "as-na-manga": (
    <>
      <rect x="7" y="4" width="10" height="16" rx="1.5" />
      <path d="M12 8.5c1.8 2.2 1.8 3.6 0 4-1.8-.4-1.8-1.8 0-4z" />
      <path d="M12 12.5V15" />
    </>
  ),
  "boca-na-botija": (
    <>
      <path d="M3 12s3.5-5.5 9-5.5S21 12 21 12s-3.5 5.5-9 5.5S3 12 3 12z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  "cancao-da-emocao": (
    <>
      <circle cx="7" cy="17.5" r="2.5" />
      <circle cx="17" cy="15.5" r="2.5" />
      <path d="M9.5 17.5V6.5l10-2.5v11.5" />
    </>
  ),
  chamego: (
    <>
      <circle cx="11.5" cy="9" r="5.5" />
      <path d="M15.5 13c2 1.5 1 3.5-.8 4.4-1.8.9-3.7 1.1-4.7 3.1" />
    </>
  ),
  "cuspe-e-cola": (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  "fogo-no-ceu": (
    <>
      <path d="M12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21" />
      <path d="M5.6 5.6l2.5 2.5M18.4 5.6l-2.5 2.5M5.6 18.4l2.5-2.5M18.4 18.4l-2.5-2.5" />
      <circle cx="12" cy="12" r="1.5" />
    </>
  ),
  "fumaca-na-agua": (
    <>
      <path d="M8 20.5c-3-2-2-4.5 0-5.8s2-3.2 0-4.7 0-4 2-5" />
      <path d="M15 20.5c-3-2-2-4.5 0-5.8s2-3.2 0-4.7" />
    </>
  ),
  "galope-certeiro": (
    <>
      <path d="M6.5 4.5c-2.5 3.5-2.5 8 0 11.5l1.5 3.5M17.5 4.5c2.5 3.5 2.5 8 0 11.5L16 19.5" />
      <path d="M6.5 4.5a7.5 7.5 0 0111 0" />
      <path d="M6 10h.01M18 10h.01" />
    </>
  ),
  "nao-vai-doer-nadinha": (
    <>
      <path d="M17 4l3 3M14.5 4.5l5 5" />
      <path d="M6.5 12.5l6-6 5 5-6 6h-5z" />
      <path d="M3.5 20.5l3-3" />
    </>
  ),
  "natural-da-natureza": (
    <>
      <path d="M5 19C5 9.5 12 4.5 20 4.5c0 9.5-5.5 14.5-13 14.5" />
      <path d="M5 19c3-5 6.5-8 10.5-10" />
    </>
  ),
  "sabia-imperatriz": (
    <>
      <path d="M4 14.5c4 1 7-1 8.2-4.2 0 0 1-3.3 4.3-3.3l2 2-2 1c0 5-4 8.5-9 8.5H4z" />
      <path d="M16 7.5l4.5 1-3 1.5" />
      <circle cx="14.7" cy="8.8" r="0.6" />
    </>
  ),
  "sabugos-e-peconhas": (
    <>
      <path d="M10 3h4M11.2 3v4.2L7 14a4.7 4.7 0 004.2 6.8h1.6A4.7 4.7 0 0017 14l-4.2-6.8V3" />
      <path d="M10 16.5h.01M13.5 17.5h.01M12 14h.01" />
    </>
  ),
  "salve-se-quem-puder": (
    <>
      <path d="M10 3.5h5v9c2.2 0 4 1 5 3l.8 2.5H10z" />
      <path d="M10 3.5V18" />
      <path d="M3 8.5h3.5M2.5 12.5h4M3 16.5h3.5" />
    </>
  ),
  "sorrisao-chapeu-na-mao": (
    <>
      <path d="M8.5 12.5v-4a3.5 3.5 0 017 0v4" />
      <path d="M2.5 14c3.5 2 15.5 2 19 0-2 3.2-6 4.5-9.5 4.5S4.5 17.2 2.5 14z" />
    </>
  ),
  "zoi-de-coruja": (
    <>
      <path d="M12 6.5c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5z" />
      <path d="M12 6.5V19.5" />
    </>
  ),
};

export function HabilidadeIcon({ id, className }: { id: string; className?: string }) {
  const glyph = GLYPHS[id];
  if (!glyph) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {glyph}
    </svg>
  );
}
