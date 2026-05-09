"use client";

import Image from "next/image";
import Link from "next/link";
import { useReveal } from "./useReveal";

export function LandingCta() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="relative overflow-hidden border-y border-arcana-gold/40 bg-arcana-surface px-6 py-28 sm:py-36">
      {/* Imagem de fundo */}
      <Image
        src="/landing/hero03.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Fade discreto só nas bordas verticais para suavizar transição entre seções */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(10,10,15,0.55) 0%, rgba(10,10,15,0.1) 18%, rgba(10,10,15,0.1) 82%, rgba(10,10,15,0.55) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Sombra radial sutil atrás do texto central */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 45% at 50% 50%, rgba(10,10,15,0.45) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div
        ref={ref}
        className={`arcana-reveal ${visible ? "is-visible" : ""} relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center`}
      >
        <div className="arcana-divider mb-10">◆</div>

        <h2 className="font-cinzel text-3xl tracking-[0.15em] text-arcana-text drop-shadow-[0_2px_24px_rgba(0,0,0,1)] sm:text-4xl md:text-5xl">
          Sua próxima aventura começa aqui.
        </h2>

        <Link
          href="/register"
          className="mt-12 rounded-sm bg-gradient-to-br from-arcana-gold to-arcana-gold-bright px-10 py-4 font-cinzel text-sm uppercase tracking-[0.3em] text-arcana-bg shadow-[0_0_24px_rgba(201,168,76,0.3)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(201,168,76,0.6)]"
        >
          Criar conta grátis
        </Link>

        <p className="mt-6 font-crimson text-base text-arcana-text/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="text-arcana-gold transition-colors hover:text-arcana-gold-bright"
          >
            Entrar →
          </Link>
        </p>
      </div>
    </section>
  );
}
