import Link from "next/link";
import { getClassColor } from "@/lib/character-colors";
import type { Character } from "@/lib/types";

type CharacterWithSession = Character & {
  session?: { id: string; status: string; title: string } | null;
};

type Props = {
  character: CharacterWithSession;
  featured?: boolean;
};

const CONTINUE_STATUSES = new Set(["lobby", "active", "paused"]);

export function CharacterCard({ character, featured = false }: Props) {
  const classColor = getClassColor(character.class);
  const hpPercent = character.max_hp
    ? Math.max(
        0,
        Math.min(100, Math.round((character.hp / character.max_hp) * 100)),
      )
    : 0;

  const canContinue =
    character.session && CONTINUE_STATUSES.has(character.session.status);
  const ctaLabel = canContinue ? "Continuar partida" : "Selecionar partida";
  const ctaHref = canContinue
    ? `/play/${character.session!.id}`
    : `/play/characters/select?character=${character.id}`;

  const initial =
    character.name.trim().charAt(0).toUpperCase() ||
    character.class.charAt(0).toUpperCase() ||
    "?";

  return (
    <article
      className={`relative flex h-[300px] w-[220px] shrink-0 snap-start flex-col items-center border bg-arcana-surface p-5 transition-all duration-300 md:h-[380px] md:w-[280px] md:p-6 ${
        featured
          ? "scale-100 border-arcana-gold/60 opacity-100 shadow-[0_0_30px_rgba(201,168,76,0.2)] md:scale-[1.04]"
          : "border-arcana-border opacity-90 hover:opacity-100"
      }`}
      style={{ borderTopColor: classColor, borderTopWidth: 2 }}
    >
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full bg-arcana-bg ring-2 md:h-[120px] md:w-[120px]"
        style={{
          boxShadow: `0 0 18px ${classColor}55`,
          color: classColor,
        }}
      >
        {character.avatar_url ? (
          <span
            className="block h-full w-full rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url(${character.avatar_url})` }}
            aria-hidden="true"
          />
        ) : (
          <span className="font-cinzel text-3xl md:text-4xl" aria-hidden="true">
            {initial}
          </span>
        )}
      </div>

      <h3 className="mt-4 text-center font-cinzel text-base tracking-[0.15em] text-arcana-text md:mt-5 md:text-lg">
        {character.name}
      </h3>
      <p
        className="mt-1 font-crimson text-xs uppercase tracking-[0.2em] md:text-sm"
        style={{ color: classColor }}
      >
        {character.class} · Nível {character.level}
      </p>
      {character.race && (
        <p className="mt-0.5 font-crimson text-xs text-arcana-text-dim md:text-sm">
          {character.race}
        </p>
      )}

      <div className="mt-auto w-full">
        <div className="mb-1 flex items-center justify-between font-cinzel text-[10px] uppercase tracking-[0.25em] text-arcana-text-dim">
          <span>HP</span>
          <span className="font-crimson text-xs normal-case tracking-normal text-arcana-text">
            {character.hp}/{character.max_hp}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden bg-arcana-border">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${hpPercent}%`,
              backgroundColor: hpPercent > 30 ? "#4ecb8a" : "#e05050",
            }}
          />
        </div>

        <Link
          href={ctaHref}
          className="mt-4 flex w-full items-center justify-center bg-gradient-to-br from-arcana-gold to-arcana-gold-bright px-4 py-2.5 font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-bg transition-all duration-300 hover:shadow-[0_0_24px_rgba(201,168,76,0.5)] md:text-[11px]"
        >
          {ctaLabel}
        </Link>
      </div>
    </article>
  );
}
