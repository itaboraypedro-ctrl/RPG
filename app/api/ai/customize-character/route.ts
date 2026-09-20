import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { uploadCharacterImage } from "@/lib/character-images";

// Edições do gpt-image-1 podem levar mais de um minuto.
export const maxDuration = 180;

const BASE_ID_RE =
  /^(feminino|masculino)_(muito-claro|claro|medio|escuro|muito-escuro)_(jovem-adulto|adulto|idoso)_(magro|mediano|musculoso|corpulento)$/;

const ESTILO_MAX = 600;
const FACE_PHOTO_MAX_BYTES = 8 * 1024 * 1024;

type Mode = "estilo" | "rosto-foto" | "rosto-descricao";

type RequestBody = {
  mode?: Mode;
  baseId?: string;
  currentImageUrl?: string;
  instruction?: string;
  facePhotoDataUrl?: string;
};

const STYLE_LOCK =
  "Preserve the painterly digital illustration style, the full-body framing, the neutral standing pose, " +
  "the soft studio lighting and the plain dark navy background exactly as in the input image. " +
  "Setting: fictional Brazilian western (1880s frontier), no fantasy elements, no text, no watermark.";

function buildPrompt(mode: Mode, instruction: string): string {
  switch (mode) {
    case "estilo":
      return (
        "Edit this full-body character portrait. Keep the same person: identical face, head, skin tone, " +
        "age, body type and proportions. Change only the clothing, hair and accessories as requested: " +
        `${instruction}. ${STYLE_LOCK}`
      );
    case "rosto-descricao":
      return (
        "Edit this full-body character portrait. Keep clothing, accessories, body type, skin tone, pose and " +
        `framing unchanged. Adjust only the face and head to match this description: ${instruction}. ${STYLE_LOCK}`
      );
    case "rosto-foto":
      return (
        "The first image is a full-body character portrait. The second image is a reference photo of a real " +
        "person's face. Repaint the character's face and head so the character clearly resembles the person " +
        "in the reference photo, keeping the character's clothing, accessories, body type, pose and framing " +
        `unchanged, and rendering the face in the same painterly illustration style. ${STYLE_LOCK}`
      );
  }
}

function dataUrlToBlob(dataUrl: string): Blob | null {
  const match = /^data:(image\/(?:png|jpeg|webp));base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.byteLength === 0 || bytes.byteLength > FACE_PHOTO_MAX_BYTES) return null;
  return new Blob([new Uint8Array(bytes)], { type: match[1] });
}

/** Carrega uma base local (fs em dev; fetch do próprio origin quando empacotado). */
async function loadBaseImage(baseId: string, origin: string): Promise<Blob | null> {
  const rel = `characters/bases/${baseId}.webp`;
  try {
    const bytes = await readFile(path.join(process.cwd(), "public", rel));
    return new Blob([new Uint8Array(bytes)], { type: "image/webp" });
  } catch {
    try {
      const res = await fetch(`${origin}/${rel}`, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) return null;
      return new Blob([await res.arrayBuffer()], { type: "image/webp" });
    } catch {
      return null;
    }
  }
}

/** Só aceita retratos já salvos no nosso bucket público (evita SSRF). */
async function loadCurrentImage(url: string): Promise<Blob | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;
  const allowedPrefix = `${supabaseUrl}/storage/v1/object/public/character-images/`;
  if (!url.startsWith(allowedPrefix)) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "image/png";
    return new Blob([await res.arrayBuffer()], { type });
  } catch {
    return null;
  }
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

  const mode = body.mode;
  if (mode !== "estilo" && mode !== "rosto-foto" && mode !== "rosto-descricao") {
    return NextResponse.json({ error: "Modo inválido" }, { status: 400 });
  }

  const instruction = (body.instruction ?? "").toString().trim().slice(0, ESTILO_MAX);
  if ((mode === "estilo" || mode === "rosto-descricao") && instruction.length === 0) {
    return NextResponse.json({ error: "Descreva o que deseja mudar" }, { status: 400 });
  }

  // Imagem de origem: retrato atual no bucket ou uma das 120 bases.
  const origin = new URL(request.url).origin;
  let source: Blob | null = null;
  if (body.currentImageUrl) {
    source = await loadCurrentImage(body.currentImageUrl.toString());
    if (!source) {
      return NextResponse.json({ error: "Retrato atual inválido" }, { status: 400 });
    }
  } else if (body.baseId && BASE_ID_RE.test(body.baseId)) {
    source = await loadBaseImage(body.baseId, origin);
    if (!source) {
      return NextResponse.json({ error: "Base visual não encontrada" }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "Informe a base ou o retrato atual" }, { status: 400 });
  }

  let facePhoto: Blob | null = null;
  if (mode === "rosto-foto") {
    facePhoto = body.facePhotoDataUrl ? dataUrlToBlob(body.facePhotoDataUrl) : null;
    if (!facePhoto) {
      return NextResponse.json(
        { error: "Foto do rosto inválida — use JPG, PNG ou WebP até 8MB" },
        { status: 400 },
      );
    }
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Sem chave: devolve a origem intacta para o fluxo continuar em dev.
    const fallback =
      body.currentImageUrl ?? `/characters/bases/${body.baseId}.webp`;
    return NextResponse.json({ imageUrl: fallback, placeholder: true });
  }

  const form = new FormData();
  form.append("model", "gpt-image-1");
  form.append("image[]", source, "character.webp");
  if (facePhoto) form.append("image[]", facePhoto, "face-reference.png");
  form.append("prompt", buildPrompt(mode, instruction));
  form.append("size", "1024x1536");
  form.append("quality", "medium");
  form.append("input_fidelity", "high");
  form.append("n", "1");

  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
      signal: AbortSignal.timeout(150000),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json(
      { error: "Falha na edição: timeout ou rede", detail },
      { status: 502 },
    );
  }

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json(
      { error: `Falha na edição: ${res.status}`, detail },
      { status: 502 },
    );
  }

  const data = (await res.json()) as { data?: { b64_json?: string }[] };
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) {
    return NextResponse.json({ error: "Resposta inválida da OpenAI" }, { status: 502 });
  }

  // Persiste no bucket — URLs da OpenAI seriam efêmeras.
  const upload = await uploadCharacterImage(
    profileResult.user.id,
    Buffer.from(b64, "base64"),
    "image/png",
  );
  if (!upload.ok) {
    return NextResponse.json({ error: upload.error }, { status: 500 });
  }

  return NextResponse.json({ imageUrl: upload.url });
}
