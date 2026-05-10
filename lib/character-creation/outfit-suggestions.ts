const CLASS_BASE: Record<string, string[]> = {
  barbaro: [
    "peles de urso e couro batido",
    "couraça de placas de osso",
    "vestes tribais com runas pintadas",
    "armadura de couro cru com cicatrizes",
  ],
  bardo: [
    "casaco bordado com mangas largas",
    "túnica de seda com cinto trabalhado",
    "roupas coloridas de viajante com capa esvoaçante",
    "trajes de palco em tons rubros e dourados",
  ],
  bruxo: [
    "manto encapuzado com símbolos do patrono",
    "robe escuro com bordas ardentes",
    "couro negro com pingentes ocultistas",
    "veste sombria com runas pulsantes",
  ],
  clerigo: [
    "vestes sacerdotais com símbolo sagrado no peito",
    "armadura média com tabardo religioso",
    "manto branco e dourado com colar sagrado",
    "túnica cerimonial com bordados litúrgicos",
  ],
  druida: [
    "vestes de fibra natural com folhas costuradas",
    "armadura de couro adornada com galhos",
    "manto de musgo com colar de contas",
    "roupa de viagem com peles e flores secas",
  ],
  feiticeiro: [
    "robe rasgado com marcas mágicas brilhando",
    "manto adornado de runas latentes",
    "vestes esfarrapadas com cristais incrustados",
    "túnica com véu fino e símbolos arcanos",
  ],
  guerreiro: [
    "armadura de placas envelhecida",
    "cota de malha com tabardo da unidade",
    "armadura de talas reforçada",
    "couraça com manto pesado e capa",
  ],
  ladino: [
    "couro batido escuro com capuz",
    "trajes ágeis em tons de carvão",
    "armadura leve com correias para adagas escondidas",
    "couro acinzentado com manto curto",
  ],
  mago: [
    "robe acadêmico com bordados estelares",
    "túnica longa com cinto de pergaminhos",
    "vestes eruditas com bolsos para componentes",
    "manto azul-marinho com runas prateadas",
  ],
  monge: [
    "vestes monásticas simples sem calçado",
    "túnica leve amarrada na cintura",
    "trajes marciais com faixa colorida",
    "roupa simples de tecido cru",
  ],
  paladino: [
    "armadura de placas brilhante com manto sagrado",
    "cota de malha cerimonial com tabardo da ordem",
    "couraça polida com capa branca",
    "armadura de talas com sigilo divino no peito",
  ],
  patrulheiro: [
    "manto verde-musgo com couro batido",
    "vestes de caçador com capa de viagem",
    "armadura de couro com peles de animal",
    "roupa de explorador com aljava cruzada",
  ],
};

const BACKGROUND_TWIST: Record<string, string> = {
  acolito: "com símbolo religioso visível no peito",
  "artesao-guilda": "com medalhão da guilda na cintura",
  artista: "com fitas e adornos coloridos no traje",
  charlatao: "com detalhes ostensivos demais para um aventureiro comum",
  criminoso: "com correias para esconder lâminas e bolsas internas",
  eremita: "com aparência desgastada e simples demais",
  forasteiro: "com totens de osso e couros tribais costurados",
  "heroi-povo": "com remendos honestos e um lenço da aldeia",
  marinheiro: "com cordas náuticas e tatuagens de mar visíveis",
  nobre: "com bordados finos e brasão familiar discreto",
  orfao: "com remendos urbanos e marcas das ruas",
  sabio: "com bolsos cheios de pergaminhos e tinteiros",
  soldado: "com brasão da legião desbotado e cicatrizes de batalha",
};

const BACKGROUND_ALT: Record<string, string> = {
  acolito: "abençoado por óleos sagrados e correntes finas",
  "artesao-guilda": "marcado pelas ferramentas presas ao cinto",
  artista: "decorado com adereços teatrais e máscara discreta",
  charlatao: "ajustado para esconder bolsos secretos",
  criminoso: "tingido de fuligem para se misturar nas sombras",
  eremita: "manchado de musgo e poeira de cavernas",
  forasteiro: "adaptado ao clima selvagem com peles cruas",
  "heroi-povo": "costurado pela própria mãe com lã da fazenda",
  marinheiro: "encharcado de sal e remendado com lona",
  nobre: "com tecido importado e fivela dourada",
  orfao: "improvisado com retalhos roubados de mercados",
  sabio: "com manchas de tinta e um pergaminho preso ao cinto",
  soldado: "endurecido pela campanha e pela poeira do front",
};

export function getOutfitSuggestions(
  classId: string,
  backgroundId: string,
): string[] {
  const baseList = CLASS_BASE[classId] ?? [
    "trajes de aventura padrão",
    "roupa de viagem desgastada",
    "vestimenta de couro simples",
    "trajes funcionais de campanha",
  ];
  const twist = BACKGROUND_TWIST[backgroundId] ?? "com detalhes pessoais sutis";
  const alt = BACKGROUND_ALT[backgroundId] ?? "personalizado pela jornada";

  return [
    `${baseList[0]} ${twist}`,
    `${baseList[1]} ${alt}`,
    `${baseList[2]} ${twist}`,
    `${baseList[3]} ${alt}`,
  ];
}
