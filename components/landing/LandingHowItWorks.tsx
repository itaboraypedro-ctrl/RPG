"use client";

import Image from "next/image";
import { useReveal } from "./useReveal";

const STEPS = [
  {
    numeral: "I",
    title: "Crie sua história",
    body: "Monte sessões com IA ou do zero. Cenas, NPCs e ganchos prontos em minutos.",
    image: "/landing/castelo-do-mal.jpg",
  },
  {
    numeral: "II",
    title: "Convide os jogadores",
    body: "Compartilhe um link. Eles entram em segundos, sem instalar nada.",
    image: "/landing/esqueletos.jpg",
  },
  {
    numeral: "III",
    title: "Jogue ao vivo",
    body: "Painel do GM, fichas em tempo real e IA de suporte durante toda a partida.",
    image: "/landing/luta.jpg",
  },
];

export function LandingHowItWorks() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section
      id="como-funciona"
      className="relative bg-arcana-bg px-6 py-24 sm:py-32"
    >
      <div ref={ref} className="mx-auto max-w-6xl">
        <div
          className={`arcana-reveal ${visible ? "is-visible" : ""} arcana-divider`}
        >
          ◆ Como Funciona ◆
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <article
              key={step.numeral}
              className={`arcana-reveal ${visible ? "is-visible" : ""} group relative flex flex-col overflow-hidden border border-arcana-border bg-arcana-surface transition-all hover:border-arcana-gold/40`}
              style={{ animationDelay: visible ? `${i * 150}ms` : undefined }}
            >
              {/* Imagem do passo */}
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={step.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-arcana-surface via-arcana-surface/40 to-transparent"
                  aria-hidden="true"
                />
                <span
                  className="absolute bottom-3 right-4 font-cinzel text-6xl font-bold text-arcana-gold drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] transition-colors group-hover:text-arcana-gold-bright"
                  aria-hidden="true"
                >
                  {step.numeral}
                </span>
              </div>

              {/* Top border dourado */}
              <div
                className="h-0.5 w-full bg-arcana-gold"
                aria-hidden="true"
              />

              {/* Texto */}
              <div className="flex flex-1 flex-col p-8">
                <h3 className="font-cinzel text-xl tracking-[0.15em] text-arcana-text">
                  {step.title}
                </h3>
                <p className="mt-4 font-crimson text-base leading-relaxed text-arcana-text-dim">
                  {step.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
