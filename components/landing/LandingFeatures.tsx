"use client";

import Image from "next/image";
import { useReveal } from "./useReveal";

const FEATURES = [
  {
    icon: "⚔️",
    title: "Painel do Mestre",
    body: "Controle HP, iniciativa, sons e cenas em tempo real durante a partida.",
    image: "/landing/ataque-da-aranha.jpg",
  },
  {
    icon: "📜",
    title: "Fichas Inteligentes",
    body: "Fichas D&D 5e completas que atualizam automaticamente quando o GM age.",
    image: "/landing/humano.jpg",
  },
  {
    icon: "✨",
    title: "IA Integrada",
    body: "Gere histórias, NPCs e resumos de sessão com inteligência artificial.",
    image: "/landing/mago.jpg",
  },
  {
    icon: "⚡",
    title: "Multijogador Real",
    body: "Todos os jogadores veem as mudanças instantaneamente, sem recarregar.",
    image: "/landing/rei-sapo.jpg",
  },
];

export function LandingFeatures() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="relative bg-arcana-bg px-6 py-24 sm:py-32">
      <div ref={ref} className="mx-auto max-w-6xl">
        <div
          className={`arcana-reveal ${visible ? "is-visible" : ""} arcana-divider`}
        >
          ◆ Recursos ◆
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {FEATURES.map((feature, i) => (
            <article
              key={feature.title}
              className={`arcana-reveal ${visible ? "is-visible" : ""} group relative flex overflow-hidden border border-arcana-border border-l-2 border-l-arcana-gold bg-arcana-surface transition-all hover:border-arcana-gold/40 hover:border-l-arcana-gold-bright`}
              style={{ animationDelay: visible ? `${i * 120}ms` : undefined }}
            >
              {/* Imagem lateral */}
              <div className="relative w-32 shrink-0 overflow-hidden sm:w-44">
                <Image
                  src={feature.image}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 176px, 128px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-r from-arcana-surface/40 to-arcana-surface/10"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-arcana-surface to-transparent"
                  aria-hidden="true"
                />
              </div>

              {/* Conteúdo */}
              <div className="flex flex-1 items-start gap-4 p-5 sm:gap-5 sm:p-7">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-arcana-gold/30 bg-arcana-bg text-2xl shadow-[0_0_18px_rgba(201,168,76,0.15)] transition-transform group-hover:scale-110 sm:h-14 sm:w-14"
                  aria-hidden="true"
                >
                  {feature.icon}
                </div>
                <div className="flex flex-col">
                  <h3 className="font-cinzel text-base tracking-[0.15em] text-arcana-text sm:text-lg">
                    {feature.title}
                  </h3>
                  <p className="mt-2 font-crimson text-sm leading-relaxed text-arcana-text-dim sm:text-base">
                    {feature.body}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
