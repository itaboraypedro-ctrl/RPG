// Dados narrativos para a parte de história do wizard.
// Tudo aqui é sugestão aberta, nunca lista fechada (docs/01 §1 — LIVRE):
// o livro proíbe transformar exemplos em validação obrigatória.
// Lugares e facções vêm dos dados canônicos do ruleset (com as artes de public/story).

import { SACRAMENTO_PLACES } from "@/lib/rulesets/sacramento/places";
import { SACRAMENTO_FACTIONS } from "@/lib/rulesets/sacramento/factions";
import type { SacramentoFaction, SacramentoPlace } from "@/lib/rulesets/sacramento/types";

export { SACRAMENTO_PLACES, SACRAMENTO_FACTIONS };
export type { SacramentoFaction, SacramentoPlace };

/** Conceitos de exemplo (estilo p. 23) — atalhos, não classes. */
export const CONCEITOS_SUGERIDOS: string[] = [
  "Pistoleiro em busca de recomeço",
  "Ex-padre que perdeu a fé, não o rebanho",
  "Caçadora de recompensas com um nome na lista que dói",
  "Médica que trata qualquer um — por um preço justo",
  "Jogador que aposta tudo, menos a própria história",
  "Vaqueiro sem terra procurando onde pertencer",
  "Fugitiva com a recompensa na própria cabeça",
  "Ferreiro que forjou a arma errada para a pessoa errada",
];

export interface OcupacaoSugerida {
  id: string;
  nome: string;
  contexto: string;
  /** Emblema pintado em public/story/ocupacoes/<id>.webp (quando as artes chegarem). */
  emblema?: string;
}

/** Ocupações com contexto de mundo — não impactam a ficha (docs/01 §2). */
export const OCUPACOES_SUGERIDAS: OcupacaoSugerida[] = [
  { id: "pistoleiro-de-aluguel", nome: "Pistoleiro de aluguel", contexto: "Vive de escoltas, cobranças e serviços que a lei não faz" },
  { id: "vaqueiro", nome: "Vaqueiro", contexto: "Toca boiada entre fazendas; conhece cada trilha e cada tempestade" },
  { id: "medico-de-fronteira", nome: "Médico de fronteira", contexto: "Único socorro em dias de viagem — de parto a bala alojada" },
  { id: "jogador-de-cartas", nome: "Jogador de cartas", contexto: "Roda saloons vivendo do blefe e da sorte alheia" },
  { id: "ferreiro", nome: "Ferreiro", contexto: "Ferra cavalos, conserta armas e guarda segredos da cidade" },
  { id: "cacador-de-recompensas", nome: "Caçador de recompensas", contexto: "Persegue cartazes de procurado pelo Oeste — vivo ou morto" },
  { id: "padre-errante", nome: "Padre errante", contexto: "Leva missa, batismo e enterro onde não há igreja" },
  { id: "minerador", nome: "Minerador", contexto: "Arranca carvão e esperança das minas de Araguari" },
  { id: "musico-de-salao", nome: "Músico de salão", contexto: "Anima festas e funerais; ouve tudo o que ninguém devia contar" },
  { id: "ex-soldado", nome: "Ex-soldado", contexto: "Sobrou da Guerra do Carvão com cicatrizes e histórias que não conta" },
  { id: "comerciante-de-rota", nome: "Comerciante de rota", contexto: "Cruza o Oeste com mercadorias, notícias e dívidas" },
  { id: "rastreador", nome: "Rastreador", contexto: "Lê pegadas, vento e silêncio; acha quem não quer ser achado" },
];

/** Origens sem cidade canônica (docs/01 §2.1) — categorias abertas do livro. */
export interface OrigemAberta {
  id: string;
  nome: string;
  descricao: string;
}

export const ORIGENS_ABERTAS: OrigemAberta[] = [
  { id: "povos-originarios", nome: "Povos originários", descricao: "Nascido entre os povos que ocupam o País desde antes dos navios" },
  { id: "estrangeiro", nome: "Estrangeiro", descricao: "Veio de além-mar, das terras da Revolução Industrial" },
  { id: "oriente", nome: "Oriente", descricao: "Das levas que ergueram o Bairro Oriental de Belo Horizonte" },
  { id: "interior", nome: "Rancho perdido", descricao: "De um canto sem nome no mapa — só quem é de lá conhece" },
];

/** Presets de família — atalhos que preenchem o campo, sempre editáveis. */
export const FAMILIA_PRESETS: { detalhe: string; tipo: "sim" | "complicada" }[] = [
  { tipo: "sim", detalhe: "Família viva no lugar de origem, esperando notícias que nunca chegam" },
  { tipo: "sim", detalhe: "Irmãos espalhados pelo Oeste, cada um seguindo um caminho" },
  { tipo: "complicada", detalhe: "Romperam quando parti; carrego o sobrenome como um peso" },
  { tipo: "complicada", detalhe: "Metade da família não sabe que estou vivo — e é melhor assim" },
];

export const PASSADO_PRESETS: string[] = [
  "Cavalguei com uma gangue e saí sem me despedir — eles não esquecem",
  "Um trabalho deu errado e alguém inocente pagou o preço",
  "Fui acusado de um crime que não cometi; o verdadeiro culpado anda solto",
  "Devo dinheiro a gente que não perdoa atraso",
  "Sobrevivi a algo que ninguém acredita — e não conto a ninguém",
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

export function faccaoById(id: string): SacramentoFaction | undefined {
  return SACRAMENTO_FACTIONS.find((f) => f.id === id);
}

export function placeById(id: string): SacramentoPlace | undefined {
  return SACRAMENTO_PLACES.find((p) => p.id === id);
}
