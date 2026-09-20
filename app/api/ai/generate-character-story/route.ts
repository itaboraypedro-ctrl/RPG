import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import {
  faccaoById,
  trilhaById,
} from "@/lib/character-creation/sacramento/story-data";
import type {
  ElementosHistoria,
  HistoriaEstruturada,
  HistoriaSecao,
} from "@/lib/character-creation/sacramento/types";

export const maxDuration = 120;

const STORY_MODEL = process.env.OPENAI_STORY_MODEL ?? "gpt-5-mini";

type Action = "gerar" | "revisar-secao" | "revisar-tudo";

type RequestBody = {
  action?: Action;
  nome?: string;
  visualResumo?: string;
  elementos?: ElementosHistoria;
  historiaAtual?: HistoriaEstruturada;
  secao?: HistoriaSecao;
  feedback?: string;
};

const SECOES: HistoriaSecao[] = ["resumo", "capitulos", "familia", "vinculos", "redencao", "ganchos"];

// Regras de geração assistida — docs/02 §3.3 e docs/01 §2/§6.
const SYSTEM_PROMPT = `Você escreve histórias de personagens para o RPG Sacramento: um faroeste fictício à mineira, sem magia, sem raças fantásticas, sem elementos sobrenaturais confirmados (crenças e lendas existem, mas não conferem poderes). O presente do cenário é 1880. Escreva em português brasileiro, com tom de faroeste — seco, concreto, humano.

Regras invioláveis:
1. A história é identidade narrativa: NUNCA afirme que o personagem possui dinheiro, itens, armas especiais, propriedades ou habilidades como fato mecânico. Posses e recursos passados podem aparecer como perdidos, distantes ou incertos.
2. Crie situações abertas: NPCs com interesses, dívidas pendentes, rumores. Nunca decida resultados futuros nem controle escolhas do personagem.
3. A Trilha de Redenção tem EXATAMENTE 6 passos e o último é sempre o encerramento da jornada. Se um modelo do livro for indicado, personalize cada passo com nomes e lugares da história, mas preserve os critérios literais (ex.: "ao menos três vezes", "três rivais").
4. Se citar lugares canônicos (Tupaciguara, Bom Fim, Belo Horizonte, Sacramento, Araguari, Vila de Desemboque, Maria da Fé, Araçuaí, Santo Ozório, Serra da Saudade), respeite o que são; a geografia é fictícia, não a do Brasil real. Você também pode criar lugares menores.
5. Um passado criminoso pode existir, mas recompensa pela cabeça é decisão do Juiz — mencione como possibilidade, nunca como valor definido.
6. Ganchos são oportunidades para o Juiz: perguntas em aberto, nunca desfechos.
7. Responda SEMPRE com o JSON pedido, nada fora dele.`;

const STORY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    resumo: { type: "string", description: "2 a 3 frases que capturam quem é o personagem" },
    capitulos: {
      type: "array",
      minItems: 3,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          titulo: { type: "string" },
          texto: { type: "string", description: "1 parágrafo, 60 a 120 palavras" },
        },
        required: ["titulo", "texto"],
      },
    },
    familia: { type: "string", description: "Situação familiar em 1 parágrafo curto" },
    vinculos: {
      type: "array",
      minItems: 1,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          nome: { type: "string" },
          relacao: { type: "string" },
          detalhe: { type: "string" },
        },
        required: ["nome", "relacao", "detalhe"],
      },
    },
    redencao: {
      type: "object",
      additionalProperties: false,
      properties: {
        trilhaId: { type: "string" },
        trilhaNome: { type: "string" },
        premissa: { type: "string" },
        passos: { type: "array", minItems: 6, maxItems: 6, items: { type: "string" } },
      },
      required: ["trilhaId", "trilhaNome", "premissa", "passos"],
    },
    ganchos: {
      type: "array",
      minItems: 3,
      maxItems: 4,
      items: { type: "string", description: "Situação em aberto para o Juiz usar" },
    },
  },
  required: ["resumo", "capitulos", "familia", "vinculos", "redencao", "ganchos"],
} as const;

function descreverElementos(nome: string, visualResumo: string, e: ElementosHistoria): string {
  const faccao = faccaoById(e.faccaoId);
  const trilha = trilhaById(e.redencaoTrilhaId);
  const linhas = [
    `Nome: ${nome}`,
    visualResumo ? `Aparência: ${visualResumo}` : null,
    e.conceito ? `Conceito: ${e.conceito}` : null,
    e.origem ? `Origem: ${e.origem}` : null,
    e.ocupacao ? `Ocupação: ${e.ocupacao}` : null,
    e.familia
      ? `Família: ${e.familia === "sim" ? "tem família" : e.familia === "nao" ? "não tem família viva ou presente" : "relação familiar complicada"}${e.familiaDetalhe ? ` — ${e.familiaDetalhe}` : ""}`
      : null,
    e.passadoSombrio
      ? `Passado sombrio: sim${e.passadoDetalhe ? ` — ${e.passadoDetalhe}` : ""}`
      : "Passado sombrio: nada declarado",
    faccao && faccao.id !== "nenhuma"
      ? `Relação com facção: ${faccao.nome}${e.faccaoRelacao ? ` (${e.faccaoRelacao})` : ""}`
      : null,
    e.vinculos.length > 0
      ? `Vínculos declarados: ${e.vinculos.map((v) => `${v.nome} (${v.relacao}${v.detalhe ? ` — ${v.detalhe}` : ""})`).join("; ")}`
      : null,
    trilha
      ? trilha.id === "propria"
        ? `Trilha de Redenção: própria — premissa do jogador: ${e.redencaoPremissa || "a definir a partir da história"}. Crie 6 passos seguindo a orientação do livro: problema inicial e resolução final, consequências para o personagem e a gangue, um sacrifício relevante, NPCs que ajudam cobrando algo, sem obrigação de final feliz. O sexto passo é o encerramento.`
        : `Trilha de Redenção: modelo "${trilha.nome}" — ${trilha.premissa} Passos do livro a personalizar (preserve critérios literais e a ordem; o 6º encerra): ${trilha.passos.map((p, i) => `${i + 1}. ${p}`).join(" ")}${e.redencaoPremissa ? ` Contexto do jogador: ${e.redencaoPremissa}` : ""}`
      : null,
  ];
  return linhas.filter(Boolean).join("\n");
}

function historiaPlaceholder(nome: string, e: ElementosHistoria): HistoriaEstruturada {
  const trilha = trilhaById(e.redencaoTrilhaId);
  const passos =
    trilha && trilha.passos.length === 6
      ? trilha.passos
      : [
          "Reconhecer o problema que deixou para trás",
          "Lidar com as consequências que alcançam a gangue",
          "Encontrar quem pode ajudar — e descobrir o preço",
          "Enfrentar uma perda no caminho",
          "Reunir o que falta para o acerto final",
          "Encerrar a jornada, para o bem ou para o mal",
        ];
  return {
    resumo: `${nome || "O forasteiro"}, ${e.ocupacao || "andarilho"} de ${e.origem || "origem incerta"}, cruza o Oeste carregando o que não conta a ninguém.`,
    capitulos: [
      {
        titulo: "Raízes",
        texto: `${e.origem || "Um canto esquecido do Oeste"} moldou seus primeiros anos. ${e.familiaDetalhe || "Da família, restam memórias e silêncios."}`,
      },
      {
        titulo: "A virada",
        texto: e.passadoSombrio
          ? e.passadoDetalhe || "Houve um dia em que tudo mudou — e desse dia ninguém fala."
          : `A vida de ${e.ocupacao || "trabalho duro"} ensinou o preço de cada escolha.`,
      },
      {
        titulo: "O Oeste hoje",
        texto: `Em 1880, ${nome || "o personagem"} segue em frente: ${e.conceito || "alguém em busca de um recomeço"}.`,
      },
    ],
    familia:
      e.familia === "nao"
        ? "Não há família viva ou presente — e talvez seja melhor assim."
        : e.familiaDetalhe || "A família existe, à distância de uma carta que nunca é enviada.",
    vinculos:
      e.vinculos.length > 0
        ? e.vinculos
        : [{ nome: "Alguém do passado", relacao: "conhecido", detalhe: "Sabe mais do que deveria." }],
    redencao: {
      trilhaId: trilha?.id ?? "propria",
      trilhaNome: trilha?.nome ?? "Trilha própria",
      premissa: e.redencaoPremissa || trilha?.premissa || "Um acerto de contas pendente com o próprio passado.",
      passos,
    },
    ganchos: [
      "Uma carta antiga chega com o lacre violado.",
      "Alguém na cidade reconhece seu rosto — de onde?",
      "Um nome do passado aparece num cartaz de recompensa.",
    ],
  };
}

export async function POST(request: Request) {
  const profileResult = await getProfile();
  if (!profileResult) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const action: Action = body.action ?? "gerar";
  const nome = (body.nome ?? "").toString().trim().slice(0, 80);
  const visualResumo = (body.visualResumo ?? "").toString().trim().slice(0, 400);
  const feedback = (body.feedback ?? "").toString().trim().slice(0, 800);
  const elementos = body.elementos;

  if (!elementos || typeof elementos !== "object") {
    return NextResponse.json({ error: "Elementos da história são obrigatórios" }, { status: 400 });
  }
  if (action !== "gerar") {
    if (!body.historiaAtual) {
      return NextResponse.json({ error: "História atual é obrigatória para revisão" }, { status: 400 });
    }
    if (action === "revisar-secao" && (!body.secao || !SECOES.includes(body.secao))) {
      return NextResponse.json({ error: "Seção inválida" }, { status: 400 });
    }
    if (feedback.length === 0) {
      return NextResponse.json({ error: "Descreva o que deseja mudar" }, { status: 400 });
    }
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      historia: historiaPlaceholder(nome, elementos),
      placeholder: true,
    });
  }

  const fichaTexto = descreverElementos(nome, visualResumo, elementos);
  let userPrompt: string;
  if (action === "gerar") {
    userPrompt = `Crie a história completa deste personagem a partir dos elementos abaixo. Use tudo que o jogador declarou; onde houver silêncio, invente com coerência e moderação.\n\n${fichaTexto}`;
  } else if (action === "revisar-tudo") {
    userPrompt = `Reescreva a história deste personagem conforme o pedido do jogador, mantendo os elementos declarados.\n\nElementos:\n${fichaTexto}\n\nHistória atual:\n${JSON.stringify(body.historiaAtual)}\n\nPedido do jogador: ${feedback}`;
  } else {
    userPrompt = `Revise APENAS a seção "${body.secao}" da história abaixo conforme o pedido do jogador. Todas as outras seções devem ser devolvidas EXATAMENTE como estão, palavra por palavra.\n\nElementos:\n${fichaTexto}\n\nHistória atual:\n${JSON.stringify(body.historiaAtual)}\n\nPedido do jogador sobre a seção "${body.secao}": ${feedback}`;
  }

  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: STORY_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "historia_personagem", strict: true, schema: STORY_SCHEMA },
        },
        max_completion_tokens: 4000,
      }),
      signal: AbortSignal.timeout(100000),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json(
      { error: "Falha na geração: timeout ou rede", detail },
      { status: 502 },
    );
  }

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json(
      { error: `Falha na geração: ${res.status}`, detail },
      { status: 502 },
    );
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    return NextResponse.json({ error: "Resposta inválida da OpenAI" }, { status: 502 });
  }

  let historia: HistoriaEstruturada;
  try {
    historia = JSON.parse(content) as HistoriaEstruturada;
  } catch {
    return NextResponse.json({ error: "História gerada em formato inválido" }, { status: 502 });
  }
  if (!Array.isArray(historia.redencao?.passos) || historia.redencao.passos.length !== 6) {
    return NextResponse.json({ error: "História gerada sem os 6 passos de redenção" }, { status: 502 });
  }

  return NextResponse.json({ historia });
}
