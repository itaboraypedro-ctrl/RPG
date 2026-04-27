import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { CharacterWizard } from "@/components/characters/CharacterWizard";

export default async function NewCharacterPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login?redirect=/play/characters/new");

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[640px] flex-col gap-4 bg-zinc-950 px-4 py-6 text-zinc-100">
      <Link href="/play" className="text-xs text-zinc-500 hover:text-zinc-300">
        ← Voltar
      </Link>
      <h1 className="text-lg font-bold tracking-tight">Novo personagem</h1>
      <CharacterWizard />
    </div>
  );
}
