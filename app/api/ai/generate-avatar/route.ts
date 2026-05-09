import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";

const PALETTE = ["#7c3aed", "#0ea5e9", "#10b981", "#f59e0b"];

function placeholderSvgUrl(seed: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="#0a0a0a"/>
    <rect x="2" y="2" width="196" height="196" fill="none" stroke="${color}" stroke-width="2" rx="6"/>
    <circle cx="100" cy="78" r="32" fill="${color}" opacity="0.85"/>
    <ellipse cx="100" cy="170" rx="60" ry="40" fill="${color}" opacity="0.85"/>
    <text x="100" y="195" text-anchor="middle" fill="${color}" font-family="monospace" font-size="9" opacity="0.7">${seed}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export async function POST(request: Request) {
  const profileResult = await getProfile();
  if (!profileResult) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: { prompt?: string };
  try {
    body = (await request.json()) as { prompt?: string };
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const prompt = (body?.prompt ?? "").toString().trim();
  if (prompt.length === 0) {
    return NextResponse.json({ error: "Prompt obrigatório" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const seeds = ["var-1", "var-2", "var-3", "var-4"];
    const images = seeds.map((s, i) => placeholderSvgUrl(s, PALETTE[i % PALETTE.length]));
    return NextResponse.json({ images, placeholder: true });
  }

  const fullPrompt =
    `Professional fantasy RPG character portrait, front-facing, upper body, ` +
    `detailed armor and clothing visible, dramatic lighting, painterly style, ` +
    `dark fantasy aesthetic, high detail, no background text, no UI elements. ` +
    `Character description: ${prompt}`;

  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: fullPrompt,
      n: 4,
      size: "1024x1024",
      quality: "medium",
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json(
      { error: `Falha na geração: ${res.status}`, detail },
      { status: 502 }
    );
  }

  const data = (await res.json()) as {
    data: { b64_json?: string; url?: string }[];
  };
  const images = data.data
    .map((d) =>
      d.b64_json
        ? `data:image/png;base64,${d.b64_json}`
        : (d.url ?? null)
    )
    .filter((s): s is string => s !== null);

  return NextResponse.json({ images, placeholder: false });
}
