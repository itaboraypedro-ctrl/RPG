import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";

const PALETTE = ["#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#c9a84c"];

function placeholderSvg(seed: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
    <rect width="400" height="600" fill="#0a0a0a"/>
    <rect x="3" y="3" width="394" height="594" fill="none" stroke="${color}" stroke-width="2" rx="8"/>
    <circle cx="200" cy="130" r="48" fill="${color}" opacity="0.85"/>
    <path d="M152 200 Q200 180 248 200 L260 360 Q230 380 200 380 Q170 380 140 360 Z" fill="${color}" opacity="0.8"/>
    <rect x="172" y="370" width="22" height="160" rx="6" fill="${color}" opacity="0.75"/>
    <rect x="206" y="370" width="22" height="160" rx="6" fill="${color}" opacity="0.75"/>
    <rect x="128" y="220" width="18" height="120" rx="6" fill="${color}" opacity="0.7"/>
    <rect x="254" y="220" width="18" height="120" rx="6" fill="${color}" opacity="0.7"/>
    <text x="200" y="585" text-anchor="middle" fill="${color}" font-family="monospace" font-size="11" opacity="0.7">${seed}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

type RequestBody = {
  prompt?: string;
  referenceImageUrl?: string;
  step?: number;
};

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

  const prompt = (body?.prompt ?? "").toString().trim();
  if (prompt.length === 0) {
    return NextResponse.json({ error: "Prompt obrigatório" }, { status: 400 });
  }

  const step = typeof body?.step === "number" ? body.step : 0;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const seed = `step-${step}`;
    const color = PALETTE[Math.abs(step) % PALETTE.length];
    return NextResponse.json({
      imageUrl: placeholderSvg(seed, color),
      placeholder: true,
    });
  }

  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
        response_format: "url",
      }),
      signal: AbortSignal.timeout(60000),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json(
      { error: "Falha na geração: timeout ou rede", detail },
      { status: 502 }
    );
  }

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json(
      { error: `Falha na geração: ${res.status}`, detail },
      { status: 502 }
    );
  }

  const data = (await res.json()) as {
    data: { url?: string; b64_json?: string }[];
  };
  const first = data.data?.[0];
  const imageUrl = first?.url
    ? first.url
    : first?.b64_json
      ? `data:image/png;base64,${first.b64_json}`
      : null;

  if (!imageUrl) {
    return NextResponse.json(
      { error: "Resposta inválida da OpenAI" },
      { status: 502 }
    );
  }

  return NextResponse.json(
    { imageUrl },
    { headers: { "Cache-Control": "private, max-age=3600" } }
  );
}
