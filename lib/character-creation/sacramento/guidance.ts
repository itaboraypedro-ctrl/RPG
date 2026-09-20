// Guias "Como funciona" do wizard de personagem — para quem nunca jogou RPG.
// Mesmo formato SectionGuide do Hub de História (components/campaign-creation/Explainer).

import type { SectionGuide } from "@/lib/rulesets/sacramento/guidance";

export const PLAYER_GUIDES: Record<
  | "tracos"
  | "elementos"
  | "atributos"
  | "habilidades"
  | "montaria"
  | "compras"
  | "revisao",
  SectionGuide
> = {
  tracos: {
    oQueE: "A aparência do seu personagem: corpo, idade e estilo de roupa.",
    paraQueServe:
      "É o retrato que todo mundo vê na mesa. Só visual — nenhuma escolha aqui deixa o personagem mais forte ou mais fraco.",
    naPratica: [
      "Dê um nome (pode ser apelido de rua ou nome de batismo).",
      "Ajuste os traços e veja o retrato mudar na hora.",
      "Escolha um kit de roupa que combine com quem ele é.",
    ],
  },
  elementos: {
    oQueE: "Quem o seu personagem é: de onde veio, do que vive e o que deixou para trás.",
    paraQueServe:
      "Esses elementos alimentam a história e dão ganchos para o Juiz. História não dá bônus: um passado rico não vira dinheiro nem arma na ficha.",
    naPratica: [
      "Use os atalhos prontos ou escreva com suas palavras — vale tudo que caiba num faroeste.",
      "A Trilha de Redenção é o mais importante: o problema do passado que ele quer resolver.",
      "Na dúvida, escolha um modelo pronto de trilha; dá para personalizar depois.",
    ],
    paginas: "23, 42–46",
  },
  atributos: {
    oQueE: "Os números do personagem: 4 atributos e 8 antecedentes (as perícias do jogo).",
    paraQueServe:
      "Atributos definem vida, movimento e ações no combate. Antecedentes são somados ao dado quando você tenta algo arriscado (atirar, negociar, notar perigo).",
    naPratica: [
      "Distribua 4 pontos entre Físico, Velocidade, Intelecto e Coragem (pode deixar em 0).",
      "Intelecto dá pontos extras de antecedente — cada antecedente aceita até 2 no nível 1.",
      "Os valores derivados (vida, defesa, movimentos) calculam sozinhos no painel.",
    ],
    paginas: "25–33",
  },
  habilidades: {
    oQueE: "Truques especiais do personagem — 15 de combate e 15 de profissão.",
    paraQueServe:
      "São o que ele faz melhor que todo mundo: atirar duas vezes, curar no meio do tiroteio, blefar no carteado.",
    naPratica: [
      "Escolha 2 no nível 1, em qualquer combinação (duas de combate, duas de profissão ou uma de cada).",
      "Só Parrudeza pode ser pega mais de uma vez (+2 de vida cada).",
      "Leia o resumo de cada uma — não existe escolha errada, existe estilo de jogo.",
    ],
    paginas: "34–40",
  },
  montaria: {
    oQueE: "O animal que você acabou de comprar no estábulo, com ficha própria.",
    paraQueServe:
      "Transporte, carga (+15 espaços) e corridas. A Fidelidade cresce com o cuidado ao longo da campanha.",
    naPratica: [
      "Dê um nome e uma aparência — montaria com nome dura mais, dizem os tropeiros.",
      "Distribua 3 pontos entre Potência (corrida) e Resistência (vida do animal).",
      "Esta etapa só aparece porque há um animal no alforje; sem compra, resolve-se na mesa.",
    ],
    paginas: "50–51, 55",
  },
  compras: {
    oQueE: "O enxoval inicial: $200 para comprar tudo — roupas, armas, munição e mantimentos.",
    paraQueServe:
      "É todo o patrimônio de partida. O que sobrar vira o dinheiro do personagem na campanha.",
    naPratica: [
      "A primeira compra usa o preço máximo da tabela, sem barganha — regra do livro.",
      "Roupa vestida e arma no coldre não ocupam mochila; o resto gasta os 10 espaços.",
      "Comprou cavalo ou mula no estábulo? A etapa de montaria abre na sequência.",
      "Não precisa comprar tudo agora: sobrar dinheiro é estratégia, não erro.",
    ],
    paginas: "52–65",
  },
  revisao: {
    oQueE: "A conferência final — e onde a história do personagem ganha vida.",
    paraQueServe:
      "Gere a biografia com IA (ou escreva você mesmo), ajuste ponto a ponto e confira os números antes de criar.",
    naPratica: [
      "Gere a história com IA e refaça qualquer seção quantas vezes quiser — nada vira poder ou item.",
      "Confira ficha, alforje e trilha de redenção; o saldo dos $200 vira seu dinheiro.",
      "Clique em Criar personagem e bem-vindo ao Oeste.",
    ],
  },
};
