import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import { characterImagePath } from "@/lib/character-creation/sacramento/kits";
import type { BaseVisual } from "@/lib/character-creation/sacramento/types";

// Cada chamada gera UMA imagem — o cliente dispara as três em paralelo
// (close, estados, banner) para caber no tempo de execução da plataforma.
export const maxDuration = 300;

const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";
const IMAGE_QUALITY = process.env.OPENAI_IMAGE_QUALITY ?? "high";

// Guardrail de custo: 3 imagens por forja → 4 personagens/dia por usuário.
const LIMITE_DIA_IMAGENS = 12;

type TipoImagem = "close" | "estados" | "banner";

type RequestBody = {
  tipo?: TipoImagem;
  /** Selfie como data URL (png/jpeg/webp). Usada só nesta geração — não é armazenada. */
  selfie?: string;
  base?: BaseVisual;
  kitId?: string;
  nome?: string;
};

const ESTILO =
  "Estilo de ilustração pintada de faroeste, realista e dramática, paleta terrosa quente, " +
  "coerente com um RPG de velho oeste em 1880. Sem elementos modernos, sem fantasia, sem magia.";

function promptPara(tipo: TipoImagem, nome: string): { prompt: string; size: string; transparent: boolean } {
  const identidade =
    "A primeira imagem é a fotografia real do jogador: use o ROSTO dela como o rosto do personagem, " +
    "com semelhança clara e reconhecível, traduzida para pintura (nunca colagem fotográfica). " +
    "A segunda imagem é o personagem escolhido: mantenha fielmente a roupa, chapéu, acessórios e postura dela.";
  switch (tipo) {
    case "close":
      return {
        prompt: `${identidade} Crie UM retrato de busto (peito para cima) do personagem com expressão séria e olhar firme, levemente de frente, iluminação lateral dramática de fim de tarde. ${ESTILO} Fundo TOTALMENTE transparente — apenas o personagem recortado.`,
        size: "1024x1536",
        transparent: true,
      };
    case "estados":
      return {
        prompt: `${identidade} Crie UMA prancha única com 6 retratos de meio corpo do MESMO personagem, organizados em grade de 3 colunas por 2 linhas, todos com o mesmo enquadramento. Da esquerda para a direita, de cima para baixo: 1) saudável e confiante; 2) levemente cansado, suor e poeira; 3) machucado, curativo improvisado e sujeira de sangue discreta; 4) fraco, pálido, ombros caídos; 5) quase morto, gravemente ferido, olhar vidrado; 6) morto, olhos fechados, pele acinzentada. SEM textos, números ou molduras. Fundo escuro uniforme em todas as células. ${ESTILO}`,
        size: "1536x1024",
        transparent: false,
      };
    case "banner":
      return {
        prompt: `${identidade} Crie um cartaz de PROCURADO do velho oeste: folha de papel envelhecida, amarelada, com bordas rasgadas e marcas de pregos. No topo, a palavra "PROCURADO" em tipografia clássica de western. Ao centro, o retrato do personagem como gravura desenhada à mão. Abaixo do retrato, o nome "${nome}" em letras grandes e a linha "VIVO OU MORTO". NÃO escreva nenhum valor de recompensa. Fora da folha de papel, o fundo é TOTALMENTE transparente. ${ESTILO}`,
        size: "1024x1536",
        transparent: true,
      };
  }
}

function parseDataUrl(dataUrl: string): { buffer: Buffer; mime: string } | null {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) return null;
  try {
    return { buffer: Buffer.from(match[2], "base64"), mime: match[1] };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const auth = await getProfile();
  if (!auth) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const tipo = body.tipo;
  if (tipo !== "close" && tipo !== "estados" && tipo !== "banner") {
    return NextResponse.json({ error: "Tipo de imagem inválido" }, { status: 400 });
  }
  const nome = (body.nome ?? "").toString().trim().slice(0, 60) || "FORASTEIRO";
  if (!body.base || !body.selfie) {
    return NextResponse.json({ error: "Selfie e retrato base são obrigatórios" }, { status: 400 });
  }
  if (body.selfie.length > 8_000_000) {
    return NextResponse.json({ error: "Selfie grande demais" }, { status: 400 });
  }
  const selfie = parseDataUrl(body.selfie);
  if (!selfie) {
    return NextResponse.json({ error: "Selfie em formato inválido" }, { status: 400 });
  }

  // Retrato de referência (base + kit) direto dos assets estáticos.
  const referenciaPath = characterImagePath(body.base, body.kitId ?? "base");
  let referencia: Buffer;
  try {
    referencia = await readFile(path.join(process.cwd(), "public", referenciaPath));
  } catch {
    return NextResponse.json({ error: "Retrato base não encontrado" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Dev offline: segue o fluxo com o retrato estático no lugar da geração.
    return NextResponse.json({ url: referenciaPath, placeholder: true });
  }

  // ---- Guardrail de custo + auditoria (mesmo padrão da rota de história) ----
  const admin = createAdminClient();
  const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("ai_requests")
    .select("id", { count: "exact", head: true })
    .eq("requested_by", auth.user.id)
    .eq("type", "illustration")
    .gte("created_at", desde);
  if ((count ?? 0) >= LIMITE_DIA_IMAGENS) {
    return NextResponse.json(
      { error: "Limite diário de retratos gerados atingido. Tente novamente amanhã." },
      { status: 429 },
    );
  }

  const { prompt, size, transparent } = promptPara(tipo, nome.toUpperCase());

  const { data: aiRequest } = await admin
    .from("ai_requests")
    .insert({
      requested_by: auth.user.id,
      type: "illustration",
      prompt: `forja-${tipo}: ${prompt.slice(0, 3800)}`,
      model: IMAGE_MODEL,
      status: "pending",
    })
    .select("id")
    .single<{ id: string }>();
  const registrar = async (status: "completed" | "failed") => {
    if (!aiRequest) return;
    await admin
      .from("ai_requests")
      .update({ status, completed_at: new Date().toISOString() })
      .eq("id", aiRequest.id);
  };

  const form = new FormData();
  form.append("model", IMAGE_MODEL);
  form.append("prompt", prompt);
  form.append("size", size);
  form.append("quality", IMAGE_QUALITY);
  form.append("input_fidelity", "high"); // preserva o rosto da selfie
  form.append("output_format", "png");
  if (transparent) form.append("background", "transparent");
  form.append("image[]", new Blob([new Uint8Array(selfie.buffer)], { type: selfie.mime }), "selfie.png");
  form.append("image[]", new Blob([new Uint8Array(referencia)], { type: "image/webp" }), "personagem.webp");

  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal: AbortSignal.timeout(280000),
    });
  } catch (err) {
    await registrar("failed");
    const detail = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: "Falha na geração: timeout ou rede", detail }, { status: 502 });
  }

  if (!res.ok) {
    await registrar("failed");
    const detail = (await res.text()).slice(0, 600);
    return NextResponse.json({ error: `Falha na geração: ${res.status}`, detail }, { status: 502 });
  }

  const data = (await res.json()) as { data?: { b64_json?: string }[] };
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) {
    await registrar("failed");
    return NextResponse.json({ error: "Resposta inválida da OpenAI" }, { status: 502 });
  }
  const png = Buffer.from(b64, "base64");

  // Escrita só via service role — mesmo desenho do campaign-images (006/007).
  const storagePath = `${auth.user.id}/${crypto.randomUUID()}-${tipo}.png`;
  const { error: uploadError } = await admin.storage
    .from("character-images")
    .upload(storagePath, png, { contentType: "image/png", upsert: false });
  if (uploadError) {
    await registrar("failed");
    return NextResponse.json(
      { error: "Imagem gerada, mas o upload falhou", detail: uploadError.message },
      { status: 502 },
    );
  }
  await registrar("completed");
  const { data: urlData } = admin.storage.from("character-images").getPublicUrl(storagePath);
  return NextResponse.json({ url: urlData.publicUrl });
}
