"use client";

import { useEffect, useRef, useState } from "react";
import { CharacterCard } from "./CharacterCard";
import { CreateCharacterCard } from "./CreateCharacterCard";
import type { Character } from "@/lib/types";

type CharacterWithSession = Character & {
  session?: { id: string; status: string; title: string } | null;
};

type Props = {
  characters: CharacterWithSession[];
};

export function CharacterCarousel({ characters }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 8);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [characters.length]);

  function scrollBy(amount: number) {
    containerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  if (characters.length === 0) {
    return (
      <div className="flex justify-center px-4 sm:px-8">
        <CreateCharacterCard highlight />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Anterior"
        onClick={() => scrollBy(-320)}
        disabled={!canScrollLeft}
        className="absolute left-2 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-arcana-gold/40 bg-arcana-bg/80 font-cinzel text-2xl text-arcana-gold backdrop-blur-sm transition-all hover:border-arcana-gold hover:bg-arcana-gold hover:text-arcana-bg disabled:opacity-30 disabled:hover:bg-arcana-bg/80 disabled:hover:text-arcana-gold md:flex"
      >
        ◀
      </button>

      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto px-4 pb-2 sm:px-8 md:gap-6 md:px-16"
        style={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {characters.map((character, i) => (
          <CharacterCard
            key={character.id}
            character={character}
            featured={i === 0}
          />
        ))}
        <CreateCharacterCard />
      </div>

      <button
        type="button"
        aria-label="Próximo"
        onClick={() => scrollBy(320)}
        disabled={!canScrollRight}
        className="absolute right-2 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-arcana-gold/40 bg-arcana-bg/80 font-cinzel text-2xl text-arcana-gold backdrop-blur-sm transition-all hover:border-arcana-gold hover:bg-arcana-gold hover:text-arcana-bg disabled:opacity-30 disabled:hover:bg-arcana-bg/80 disabled:hover:text-arcana-gold md:flex"
      >
        ▶
      </button>
    </div>
  );
}
