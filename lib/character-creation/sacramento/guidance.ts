// Guias "Como funciona" do wizard de personagem — para quem nunca jogou RPG.
// Mesmo formato SectionGuide do Hub de História (components/campaign-creation/Explainer).

import type { SectionGuide } from "@/lib/rulesets/sacramento/guidance";

export const PLAYER_GUIDES: Record<
  "tracos" | "elementos" | "historia" | "atributos" | "habilidades" | "montaria" | "revisao",
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
  historia: {
    oQueE: "A biografia do personagem, escrita por você ou pela IA a partir dos elementos.",
    paraQueServe:
      "Vira o dossiê que o Juiz usa para criar cenas sob medida. Você aprova tudo antes de valer.",
    naPratica: [
      "Gere com IA e ajuste só o que quiser, ou escreva cada parte você mesmo.",
      "Pode refazer uma seção específica ou a história inteira quantas vezes quiser.",
      "Nada da história vira item, dinheiro ou poder — isso vem das regras.",
    ],
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
    oQueE: "O cavalo (ou mula) do personagem, com ficha própria.",
    paraQueServe:
      "Transporte, carga e corridas. A Fidelidade cresce com o cuidado ao longo da campanha.",
    naPratica: [
      "Distribua 3 pontos entre Potência (corrida) e Resistência (vida do animal).",
      "O livro não dá cavalo de graça: marque se vai comprar com seus $200 ou combinar com o Juiz.",
      "Sem pressa — dá para pular e resolver a montaria na mesa.",
    ],
    paginas: "50–51, 55",
  },
  revisao: {
    oQueE: "O resumo final de tudo: retrato, história e ficha.",
    paraQueServe: "Última conferência antes de criar. Depois, ajustes finos acontecem com o Juiz na campanha.",
    naPratica: [
      "Confira nome, números e a trilha de redenção.",
      "Os $200 iniciais e as compras acontecem na mesa, com o catálogo do livro.",
      "Clique em Criar personagem e bem-vindo ao Oeste.",
    ],
  },
};
