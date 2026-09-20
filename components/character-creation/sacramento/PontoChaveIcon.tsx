// Ícones dos pontos-chave da lenda — mesma linguagem dos emblemas SVG das
// habilidades (HabilidadeIcon): traço 1.5, currentColor, legíveis pequenos.
// Os ids vêm da IA e variam; o glifo é escolhido por tema do rótulo/id.

type Glifo =
  | "raiva"
  | "traicao"
  | "perda"
  | "amor"
  | "segredo"
  | "familia"
  | "ambicao"
  | "medo"
  | "dinheiro"
  | "origem"
  | "rival"
  | "promessa"
  | "destino";

const GLYPHS: Record<Glifo, React.ReactNode> = {
  // Chama viva — o que queima por dentro
  raiva: (
    <>
      <path d="M12 3c2.5 3.5-1 4.5 1.5 7 1-2 3.5-1.5 3.5 1.5a5 5 0 11-10 0C7 8 11 8.5 12 3z" />
    </>
  ),
  // Punhal cravado pelas costas
  traicao: (
    <>
      <path d="M13.5 3.5L18 8l-7.5 7.5L8 13z" />
      <path d="M8 13l-1.5 4.5L11 16" />
      <path d="M16 10.5l3 3M14 12.5l2 4" />
    </>
  ),
  // Lápide na terra
  perda: (
    <>
      <path d="M7.5 19.5v-9a4.5 4.5 0 019 0v9" />
      <path d="M4.5 19.5h15" />
      <path d="M12 9v4.5M10 11h4" />
    </>
  ),
  // Coração marcado
  amor: (
    <>
      <path d="M12 19.5S5 15 5 10.5A3.6 3.6 0 0112 8a3.6 3.6 0 017 2.5c0 4.5-7 9-7 9z" />
      <path d="M9.5 11.5l1.7 1.7 3.3-3.3" />
    </>
  ),
  // Carta lacrada — o que não se conta
  segredo: (
    <>
      <rect x="4" y="6.5" width="16" height="12" rx="1.5" />
      <path d="M4.5 7.5L12 13l7.5-5.5" />
      <circle cx="12" cy="13" r="1.4" />
    </>
  ),
  // Casa distante
  familia: (
    <>
      <path d="M4.5 11.5L12 5l7.5 6.5" />
      <path d="M6.5 10v9h11v-9" />
      <path d="M10.5 19v-5h3v5" />
    </>
  ),
  // Estrela do norte — o que se persegue
  ambicao: (
    <>
      <path d="M12 3.5l1.8 5 5.2.3-4 3.3 1.4 5-4.4-2.9-4.4 2.9 1.4-5-4-3.3 5.2-.3z" />
    </>
  ),
  // Olho que assombra a noite
  medo: (
    <>
      <path d="M3.5 12S6.5 6.5 12 6.5 20.5 12 20.5 12 17.5 17.5 12 17.5 3.5 12 3.5 12z" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 3.5v1.5M6 5l1 1.3M18 5l-1 1.3" />
    </>
  ),
  // Moeda a pagar
  dinheiro: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 7.5v9M14.5 9.5c-.6-1-4.4-1.3-4.7.5-.3 1.6 1.6 1.8 2.2 2 .6.2 2.6.4 2.3 2-.3 1.8-4.1 1.5-4.8.5" />
    </>
  ),
  // Placa de encruzilhada — de onde se veio
  origem: (
    <>
      <path d="M12 4v16.5" />
      <path d="M12 6h7l1.5 1.5L19 9h-7z" />
      <path d="M12 11.5H5.5L4 13l1.5 1.5H12z" />
    </>
  ),
  // Pistolas cruzadas
  rival: (
    <>
      <path d="M4 7.5h8l1.5 1.5-1 1.5H9l-1 3H5.5l1-3H4z" />
      <path d="M20 16.5h-8l-1.5-1.5 1-1.5H15l1-3h2.5l-1 3H20z" />
    </>
  ),
  // Aperto de mão firmado
  promessa: (
    <>
      <path d="M3.5 12l4-4 4.5 1.5L16.5 6l4 4-5 6-4-1-4.5 1z" />
      <path d="M12 9.5l-3 3M14.5 11.5l-2.5 2.5" />
    </>
  ),
  // Ás de espadas — o destino na mesa
  destino: (
    <>
      <rect x="6" y="3.5" width="12" height="17" rx="1.5" />
      <path d="M12 8c1.8 2.2 3 3.2 3 4.7a1.9 1.9 0 01-2.5 1.8L13 17h-2l.5-2.5A1.9 1.9 0 019 12.7C9 11.2 10.2 10.2 12 8z" />
    </>
  ),
};

const TEMAS: [Glifo, RegExp][] = [
  ["raiva", /raiva|odio|furia|vinganca|queima|rancor/],
  ["traicao", /traic|traidor|punhal|costas|enganad/],
  ["perda", /perda|perdeu|morte|morreu|luto|tumulo|deixou para tras|ferida/],
  ["amor", /amor|paixao|coracao|amad/],
  ["segredo", /segredo|mentira|culpa|esconde|silencio|nao conta/],
  ["familia", /familia|irma|irmao|pai|mae|filho|filha|lar|casa/],
  ["ambicao", /ambicao|sonho|busca|objetivo|quer ser|melhor|gloria/],
  ["medo", /medo|assombra|pesadelo|terror|fantasma/],
  ["dinheiro", /dinheiro|divida|ouro|preco|pagar|recompensa/],
  ["origem", /origem|veio|terra|cidade|raiz|caminho|estrada/],
  ["rival", /rival|inimigo|disputa|duelo|adversario/],
  ["promessa", /promessa|juramento|acordo|pacto|palavra|redencao/],
];

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function glifoParaPonto(id: string, rotulo: string): Glifo {
  const alvo = `${normalizar(id)} ${normalizar(rotulo)}`;
  for (const [glifo, padrao] of TEMAS) {
    if (padrao.test(alvo)) return glifo;
  }
  return "destino";
}

export function PontoChaveIcon({
  id,
  rotulo,
  className,
}: {
  id: string;
  rotulo: string;
  className?: string;
}) {
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
      {GLYPHS[glifoParaPonto(id, rotulo)]}
    </svg>
  );
}
