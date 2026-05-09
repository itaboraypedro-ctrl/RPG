import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import type { Character } from "@/lib/types";
import { CharacterSelectCard } from "@/components/player/CharacterSelectCard";

export default async function SelectCharacterPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login?redirect=/play/characters/select");

  const { session: sessionId } = await searchParams;

  const supabase = await createClient();
  const { data: characters } = await supabase
    .from("characters")
    .select("*")
    .eq("owner_id", profile.user.id)
    .order("created_at", { ascending: false })
    .returns<Character[]>();

  const list = characters ?? [];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col gap-4 bg-zinc-950 px-4 py-6 text-zinc-100">
      <Link
        href={sessionId ? `/play/${sessionId}` : "/"}
        className="text-xs text-zinc-500 hover:text-zinc-300"
      >
        ← Voltar
      </Link>
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">Selecionar personagem</h1>
        <Link
          href={
            sessionId
              ? `/play/characters/new?session=${sessionId}`
              : "/play/characters/new"
          }
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
        >
          + Novo
        </Link>
      </header>

      {!sessionId && (
        <p className="rounded-md border border-amber-900/50 bg-amber-950/20 p-3 text-xs text-amber-300">
          Sessão não informada. Acesse pelo link de convite para vincular um
          personagem.
        </p>
      )}

      {list.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
          <span className="text-4xl">🧙</span>
          <p className="text-sm text-zinc-400">
            Você ainda não tem personagens.
          </p>
          <Link
            href={
              sessionId
                ? `/play/characters/new?session=${sessionId}`
                : "/play/characters/new"
            }
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Criar primeiro personagem
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {list.map((c) => (
            <CharacterSelectCard
              key={c.id}
              character={c}
              targetSessionId={sessionId ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
