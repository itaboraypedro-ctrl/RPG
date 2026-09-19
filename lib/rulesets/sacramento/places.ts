// Os 16 lugares do guia condensado do cenário (Doc 2 §5.3, pp. 136–251).
// Guia de referência, não reprodução integral do capítulo 4 — para importar outro
// detalhe canônico, consultar a página correspondente em vez de inventá-lo.

import type { SacramentoPlace } from "./types";

export const SACRAMENTO_PLACES: SacramentoPlace[] = [
  {
    id: "tupaciguara",
    nome: "Tupaciguara",
    caracteristicas: "Café, pecuária, moinhos, vida comunitária, recuperação após violência",
    conflitos:
      "Fazendas Esperança, Vasconcelos e Domingues; rivalidade entre famílias; Bar do Tião; sobreviventes dos Pavio Curto",
    paginas: [136, 141],
  },
  {
    id: "bom-fim",
    nome: "Bom Fim",
    caracteristicas: "Chuva, lama, produção agrícola, turismo e festas",
    conflitos:
      "Salão Bom de Gole; estátua de Ismael; Marcia Miguel e Conselho de Hoteleiros; Ditinho e Tonho do Arame; disputa por universidade/Hotel Versailles",
    paginas: [142, 151],
  },
  {
    id: "belo-horizonte",
    nome: "Belo Horizonte",
    caracteristicas: "Fronteira industrial e litorânea, porto, bondes, desigualdade e corrupção",
    conflitos:
      "Casa da Moeda, hospitais, prefeitura, estação, Cidade-Oriental, Comando das Seis Balas; forças da lei e capital",
    paginas: [152, 167],
  },
  {
    id: "sacramento-cidade",
    nome: "Sacramento",
    caracteristicas: "Ruínas incendiadas, vegetação retomando edifícios",
    conflitos:
      "Antigos Sagrados derrotados; novos Bispos Hermes, Abreu e Aranha reorganizam poder",
    paginas: [168, 181],
  },
  {
    id: "celestes",
    nome: "Celestes (antiga Varginha)",
    caracteristicas: "Platôs, Floresta do Céu, povo de tradições próprias",
    conflitos:
      "Expulsão pela Bispa e reconstrução; origem e presente divino tratados como mistérios/crenças",
    paginas: [182, 189],
  },
  {
    id: "araguari",
    nome: "Araguari",
    caracteristicas: "Mineração de carvão, chuva, luto — a “cidade das viúvas”",
    conflitos: "Guerra, doença, Circo do Sol e exploração",
    paginas: [190, 197],
  },
  {
    id: "serra-da-saudade-povoado",
    nome: "Serra da Saudade (povoado)",
    caracteristicas: "Pequena vila fria de cerca de 40 pessoas",
    conflitos: "Ocupação por Fivela de Cobra e sobreviventes deslocados",
    paginas: [198, 201],
  },
  {
    id: "vila-de-desemboque",
    nome: "Vila de Desemboque",
    caracteristicas: "Cidade arruinada pela peste, com bens abandonados",
    conflitos: "Coveiro, risco de contágio, origem de Hermes/Apolo; Ité nas redondezas",
    paginas: [202, 207],
  },
  {
    id: "maria-da-fe",
    nome: "Maria da Fé",
    caracteristicas: "Vale frio, lago congelado, caça e pesca, cultura comunitária",
    conflitos:
      "Maria da Fé também é título da anciã; Stella é a 14ª; trocas locais sem moeda, comércio externo monetário; localização e chá de visitantes envoltos em mistério",
    paginas: [208, 219],
  },
  {
    id: "aracuai",
    nome: "Araçuaí",
    caracteristicas: "Cidade de pedra no Deserto de Mucuri, calor, comércio e artesanato",
    conflitos: "Feira da Barganha a cada três meses, banco, ferrovias e produtos raros",
    paginas: [220, 227],
  },
  {
    id: "santo-ozorio",
    nome: "Santo Ozório",
    caracteristicas: "Litoral turístico, hotéis, pesca e arquipélago",
    conflitos: "Hotel Rubro, Ilha de Sepulcro, farol desativado, histórias não resolvidas",
    paginas: [228, 233],
  },
  {
    id: "floresta-do-cipo",
    nome: "Floresta do Cipó",
    caracteristicas: "Vegetação densa, baixa visibilidade, fauna e trilhas",
    conflitos: "Curupira; Kaapuã; histórias cuja verdade pode caber ao Juiz",
    paginas: [234, 239],
  },
  {
    id: "sertao-de-fungos",
    nome: "Sertão de Fungos",
    caracteristicas: "Ambiente úmido, charcos, névoa e toxinas",
    conflitos: "Gangue do Cogumelo, chá e alucinações; Akor",
    paginas: [240, 243],
  },
  {
    id: "serra-da-saudade-cordilheira",
    nome: "Serra da Saudade (cordilheira)",
    caracteristicas: "Montanhas, lagos, frio, ferrovias e fauna",
    conflitos: "Distinguir da vila homônima; Yakecan",
    paginas: [244, 245],
  },
  {
    id: "deserto-de-mucuri",
    nome: "Deserto de Mucuri / Ravina Vermelha",
    caracteristicas: "Deserto, cânion e ecossistemas diferentes",
    conflitos: "Vestígios de exploração, templo e inscrição “UMBASA”; Katuan",
    paginas: [246, 249],
  },
  {
    id: "trincheira-do-carvao",
    nome: "Trincheira do Carvão",
    caracteristicas: "Restos da guerra e terra devastada",
    conflitos: "Valas, mortos, memória do conflito e convento isolado",
    paginas: [250, 251],
  },
];
