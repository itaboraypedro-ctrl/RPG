import Link from "next/link";

type Props = {
  highlight?: boolean;
};

export function CreateCharacterCard({ highlight = false }: Props) {
  return (
    <Link
      href="/play/characters/new"
      className={`group flex h-[300px] w-[220px] shrink-0 snap-start flex-col items-center justify-center gap-4 border border-dashed border-arcana-border bg-arcana-surface/40 transition-all duration-300 hover:border-arcana-gold hover:bg-arcana-surface md:h-[380px] md:w-[280px] ${
        highlight ? "border-arcana-gold/60 bg-arcana-surface" : ""
      }`}
    >
      <span
        className="font-cinzel text-6xl text-arcana-text-dim transition-colors group-hover:text-arcana-gold md:text-7xl"
        aria-hidden="true"
      >
        ╋
      </span>
      <span className="font-cinzel text-xs uppercase tracking-[0.3em] text-arcana-text-dim transition-colors group-hover:text-arcana-gold md:text-sm">
        Criar personagem
      </span>
    </Link>
  );
}
