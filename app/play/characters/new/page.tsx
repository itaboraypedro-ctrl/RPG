import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/auth";
import { CharacterWizard } from "./CharacterWizard";

export default async function NewCharacterPage() {
  const auth = await getProfile();
  if (!auth) redirect("/login?redirect=/play/characters/new");

  return (
    <div className="min-h-dvh bg-arcana-bg text-arcana-text">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
        <Link
          href="/hub"
          className="inline-block font-cinzel text-[11px] uppercase tracking-[0.3em] text-arcana-text-dim transition-colors hover:text-arcana-gold"
        >
          ← Voltar para o Hub
        </Link>
        <h1 className="mt-4 font-cinzel text-2xl tracking-[0.18em] text-arcana-text sm:text-3xl">
          Novo personagem
        </h1>
        <p className="mt-2 font-crimson text-base italic text-arcana-text-dim">
          Forje sua lenda passo a passo.
        </p>
      </div>
      <CharacterWizard />
    </div>
  );
}
