import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";

const MODEL = "claude-sonnet-4-6";
const MAX_PROMPT_CHARS = 2000;

const SYSTEM_PROMPT = `Você é um assistente especializado em RPG de mesa. Dado um prompt do Mestre, gere um template completo de aventura em JSON. Responda APENAS com o JSON, sem markdown, sem explicações.

Diretrizes:
- "description" deve ter no máximo 200 caracteres
- "synopsis" deve ter 2 a 4 parágrafos
- "acts" deve ter de 3 a 7 itens
- "npcs" deve ter de 3 a 10 itens
- "locations" deve ter de 3 a 8 itens
- "music_cues" deve ter de 3 a 6 itens`;

const TEMPLATE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    genre: {
      type: "string",
      enum: ["fantasy", "sci-fi", "horror", "western", "modern", "custom"],
    },
    description: { type: "string" },
    tags: { type: "array", items: { type: "string" } },
    content: {
      type: "object",
      properties: {
        synopsis: { type: "string" },
        acts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
            },
            required: ["title", "description"],
            additionalProperties: false,
          },
        },
        npcs: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              role: { type: "string" },
              motivation: { type: "string" },
            },
            required: ["name", "role", "motivation"],
            additionalProperties: false,
          },
        },
        locations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              atmosphere: { type: "string" },
            },
            required: ["name", "description", "atmosphere"],
            additionalProperties: false,
          },
        },
        music_cues: {
          type: "array",
          items: {
            type: "object",
            properties: {
              scene: { type: "string" },
              suggestion: { type: "string" },
            },
            required: ["scene", "suggestion"],
            additionalProperties: false,
          },
        },
      },
      required: ["synopsis", "acts", "npcs", "locations", "music_cues"],
      additionalProperties: false,
    },
  },
  required: ["title", "genre", "description", "tags", "content"],
  additionalProperties: false,
} as const;

export async function POST(request: Request) {
  const profileResult = await getProfile();
  if (!profileResult) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (profileResult.profile.role !== "gm" && profileResult.profile.role !== "admin") {
    return NextResponse.json({ error: "Permissão insuficiente" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const prompt =
    typeof body === "object" && body !== null && "prompt" in body
      ? (body as { prompt: unknown }).prompt
      : null;

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json({ error: "Prompt obrigatório" }, { status: 400 });
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return NextResponse.json(
      { error: `Prompt muito longo (máx ${MAX_PROMPT_CHARS} caracteres)` },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data: aiRequest, error: insertError } = await admin
    .from("ai_requests")
    .insert({
      requested_by: profileResult.user.id,
      type: "scene_description",
      prompt,
      model: MODEL,
      status: "pending",
    })
    .select("id")
    .single<{ id: string }>();

  if (insertError || !aiRequest) {
    return NextResponse.json({ error: "Falha ao registrar requisição" }, { status: 500 });
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 8192,
      thinking: { type: "disabled" },
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: TEMPLATE_SCHEMA },
      },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const parsed = response.parsed_output;
    if (!parsed) {
      throw new Error("IA não retornou JSON válido");
    }

    const tokensUsed =
      (response.usage.input_tokens ?? 0) + (response.usage.output_tokens ?? 0);

    await admin
      .from("ai_requests")
      .update({
        status: "completed",
        response: JSON.stringify(parsed),
        tokens_used: tokensUsed,
        completed_at: new Date().toISOString(),
      })
      .eq("id", aiRequest.id);

    return NextResponse.json(parsed);
  } catch (error) {
    await admin
      .from("ai_requests")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", aiRequest.id);

    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Limite de requisições atingido. Tente novamente em instantes." },
        { status: 429 }
      );
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: "Erro na chamada à IA" },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "Erro inesperado" }, { status: 500 });
  }
}
