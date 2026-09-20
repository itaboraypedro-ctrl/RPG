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

// Regra de ouro dos retratos: a arte do personagem NÃO muda — só o rosto entra.
const IDENTIDADE =
  "A primeira imagem é a fotografia real do jogador. A segunda imagem é o personagem escolhido. " +
  "NÃO reinterprete, NÃO repinte e NÃO redesenhe o personagem: pose, roupa, chapéu, acessórios, " +
  "cores, iluminação, estilo de pintura e fundo da segunda imagem permanecem EXATAMENTE como estão. " +
  "A ÚNICA alteração permitida é o rosto: substitua-o pelo rosto da pessoa da primeira imagem, " +
  "com semelhança clara e reconhecível, integrado ao mesmo estilo de pintura, mesma direção de luz " +
  "e mesmo tom de acabamento da segunda imagem — nunca colagem fotográfica.";

function promptPara(tipo: TipoImagem, nome: string): { prompt: string; size: string; transparent: boolean } {
  switch (tipo) {
    case "close":
      return {
        prompt: `${IDENTIDADE} Entregue um recorte em busto (do peito para cima) desse personagem com o rosto trocado, expressão séria e olhar firme. Todo o resto — roupa, estilo, cores, acabamento — idêntico à segunda imagem. Fundo TOTALMENTE transparente: apenas o personagem recortado.`,
        size: "1024x1536",
        transparent: true,
      };
    case "estados":
      return {
        prompt: `${IDENTIDADE} Entregue UMA prancha única em grade de 3 colunas por 2 linhas com 6 retratos de meio corpo desse MESMO personagem (com o rosto trocado), no MESMO estilo, roupa e acabamento da segunda imagem em todas as células. A única variação entre as células é a condição física, da esquerda para a direita, de cima para baixo: 1) saudável e confiante; 2) levemente cansado, suor e poeira; 3) machucado, curativo improvisado, sujeira discreta de sangue; 4) fraco, pálido, ombros caídos; 5) quase morto, gravemente ferido, olhar vidrado; 6) morto, olhos fechados, pele acinzentada. SEM textos, números ou molduras. Fundo escuro uniforme em todas as células.`,
        size: "1536x1024",
        transparent: false,
      };
    case "banner":
      return {
        prompt:
          `Fotografia frontal e realista de um cartaz de procurado AUTÊNTICO de 1880, como um objeto físico de época — nada com cara de arte digital ou de IA. ` +
          `Folha de papel envelhecida e amarelada pelo sol, fibras visíveis, manchas de umidade, vincos, bordas gastas e furos de prego nos cantos. ` +
          `Impressão tipográfica (letterpress) em tinta preta desbotada e levemente falhada, como prensa manual da época. TODO o cartaz é monocromático — tinta preta sobre papel sépia, nenhuma cor além do tom do papel. ` +
          `No topo, em letras grandes de madeira tipo western: "PROCURADO". Ao centro, retrato do personagem em gravura de traço preto-e-branco (estilo xilogravura de jornal antigo): o rosto é o da pessoa na primeira imagem e a roupa e o chapéu são os do personagem da segunda imagem, tudo traduzido para o traço da gravura. ` +
          `Abaixo do retrato: o nome "${nome}" em destaque, a linha "VIVO OU MORTO" e, embaixo, "RECOMPENSA: $500". ` +
          `Fora da folha de papel, o fundo é TOTALMENTE transparente.`,
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
