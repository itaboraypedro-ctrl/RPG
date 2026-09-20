// Dados narrativos do cenário para a parte de história do wizard.
// Tudo aqui é sugestão aberta, nunca lista fechada (docs/01 §1 — LIVRE):
// o livro proíbe transformar exemplos em validação obrigatória.

/** Origens sugeridas — lugares canônicos do Oeste + categorias abertas (docs/02 §5.2–5.3). */
export const ORIGENS_SUGERIDAS: string[] = [
  "Tupaciguara",
  "Bom Fim",
  "Belo Horizonte",
  "Sacramento",
  "Araguari",
  "Vila de Desemboque",
  "Maria da Fé",
  "Araçuaí",
  "Santo Ozório",
  "Serra da Saudade",
  "Povos originários",
  "Estrangeiro",
  "Oriente",
];

export const OCUPACOES_SUGERIDAS: string[] = [
  "Pistoleiro de aluguel",
  "Vaqueiro",
  "Médica de fronteira",
  "Jogador de cartas",
  "Ferreiro",
  "Caçadora de recompensas",
  "Padre errante",
  "Mineradora",
  "Músico de salão",
  "Ex-soldado da Guerra do Carvão",
];

export interface FaccaoCenario {
  id: string;
  nome: string;
  descricao: string;
}

/**
 * Facções do mundo (docs/02 §14). Em Sacramento não existe "facção jogável":
 * a relação do personagem com elas é puramente narrativa.
 */
export const FACCOES: FaccaoCenario[] = [
  {
    id: "nenhuma",
    nome: "Nenhuma",
    descricao: "Sem laço relevante com facções do Oeste.",
  },
  {
    id: "curupira",
    nome: "Gangue do Curupira",
    descricao: "Emboscadas e silêncio na Floresta do Cipó.",
  },
  {
    id: "bandoleira-escarlate",
    nome: "Bandoleira Escarlate",
    descricao: "Bandidagem de vermelho, liderada pelo Escarlate.",
  },
  {
    id: "seis-balas",
    nome: "Seis Balas",
    descricao: "Crime organizado com comando em Belo Horizonte.",
  },
  {
    id: "cogumelo",
    nome: "Gangue do Cogumelo",
    descricao: "Chá, alucinações e devoção no Sertão de Fungos.",
  },
  {
    id: "novos-sagrados",
    nome: "Novos Sagrados",
    descricao: "Culto reorganizado nas ruínas de Sacramento pelos novos Bispos.",
  },
  {
    id: "lei",
    nome: "Forças da lei",
    descricao: "Polícia de BH, xerifes da Defesa Nacional ou Boinas Brancas.",
  },
  {
    id: "outra",
    nome: "Outra",
    descricao: "Um bando, família ou organização criada por você.",
  },
];

export const RELACOES_FACCAO_SUGERIDAS: string[] = [
  "Ex-membro",
  "Inimigo jurado",
  "Devedor",
  "Informante",
  "Família envolvida",
  "Sobrevivente de um ataque",
];

export interface TrilhaRedencao {
  id: string;
  nome: string;
  premissa: string;
  /** Resumo dos 6 passos do modelo (docs/01 §6.1) — o último é sempre o encerramento. */
  passos: string[];
}

export const TRILHAS_REDENCAO: TrilhaRedencao[] = [
  {
    id: "fuga",
    nome: "Fuga",
    premissa: "Escapou de uma prisão ou grupo e é procurado.",
    passos: [
      "Usar a condição de procurado em favor da gangue",
      "Causar problemas à gangue ao menos três vezes por ser procurado",
      "Sacrificar algo ou alguém importante pela liberdade",
      "Livrar-se do pior caçador que o persegue",
      "Juntar o dinheiro para a recompensa",
      "Encerrar a condição de procurado pagando ou tratando com autoridades",
    ],
  },
  {
    id: "vinganca",
    nome: "Vingança",
    premissa: "Vingar uma perda causada por alguém.",
    passos: [
      "Causar problemas à gangue ao menos três vezes por vingança",
      "Encontrar e ajudar a última vítima do alvo",
      "Ir ao último lugar em que o alvo foi visto",
      "Resolver outro problema causado pelo alvo",
      "Encontrar seu paradeiro e desafiar para duelo",
      "Vencer o duelo e concluir a vingança",
    ],
  },
  {
    id: "divida",
    nome: "Dívida",
    premissa: "Quitar uma dívida com uma figura poderosa.",
    passos: [
      "Esconder dinheiro da gangue para pagar",
      "Causar problemas à gangue ao menos três vezes pela dívida",
      "Encontrar trabalho muito lucrativo e especialmente arriscado",
      "Juntar metade do valor ou conseguir desconto",
      "Roubar ou enganar alguém amado para obter dinheiro",
      "Pagar a dívida",
    ],
  },
  {
    id: "remorso",
    nome: "Remorso",
    premissa: "Reparar um crime cometido contra pessoas importantes.",
    passos: [
      "Adotar uma abstinência ou conduta punitiva",
      "Causar problemas à gangue ao menos três vezes pelo remorso",
      "Reencontrar vítimas e prestar um serviço importante",
      "Encontrar uma forma de compensação",
      "Sacrificar posses, vida atual ou vínculo para obter perdão",
      "Expiar o remorso",
    ],
  },
  {
    id: "recomeco",
    nome: "Recomeço",
    premissa: "Recuperar a antiga honra e reputação.",
    passos: [
      "Fazer uma façanha que demonstre utilidade à gangue",
      "Encontrar alguém que recorde sua reputação",
      "Aprender ao menos duas novas habilidades",
      "Causar problemas à gangue ao menos três vezes pela busca",
      "Repetir duas façanhas comparáveis às antigas",
      "Recuperar honra, glória e fama",
    ],
  },
  {
    id: "ambicao",
    nome: "Ambição",
    premissa: "Tornar-se o maior ou melhor em algo.",
    passos: [
      "Encontrar três rivais para competir ou enfrentar",
      "Causar problemas à gangue ao menos três vezes por ambição",
      "Fazer ao menos três grandes nomes conhecerem sua reputação",
      "Perder alguém importante pela ambição (não pode ser o primeiro passo)",
      "Fazer amizade com alguém de mesma ambição",
      "Vencer o confronto decisivo e alcançar a ambição",
    ],
  },
  {
    id: "propria",
    nome: "Trilha própria",
    premissa: "Um problema pessoal só seu, com percurso combinado com o Juiz.",
    passos: [],
  },
];

export function trilhaById(id: string): TrilhaRedencao | undefined {
  return TRILHAS_REDENCAO.find((t) => t.id === id);
}

export function faccaoById(id: string): FaccaoCenario | undefined {
  return FACCOES.find((f) => f.id === id);
}

/** Sugestões rápidas para a personalização visual (estilo faroeste do cenário). */
export const ESTILOS_SUGERIDOS: string[] = [
  "Roupa de vaqueiro surrada, chapéu de couro e lenço vermelho no pescoço",
  "Sobretudo escuro de pistoleiro, cinturão de balas e botas com esporas",
  "Vestido de gala vinho com luvas e broche de prata",
  "Poncho listrado, sombrero e barba por fazer",
  "Terno de jogador com colete bordado e cartola",
  "Batina preta empoeirada com rosário de contas",
  "Macacão de mineração, luvas grossas e lamparina no cinto",
  "Cabelo longo trançado, casaco de pele e arco às costas",
];
