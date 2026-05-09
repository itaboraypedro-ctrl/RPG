"use client";

import Image from "next/image";
import Link from "next/link";
import { useReveal } from "./useReveal";

export function LandingCta() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section className="relative flex min-h-[70vh] flex-col justify-end overflow-hidden border-y border-arcana-gold/40 bg-arcana-surface px-6 pb-12 pt-20 sm:min-h-[80vh] sm:pb-16 sm:pt-28">
      {/* Imagem de fundo */}
      <Image
        src="/landing/hero03.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Fade só nas bordas verticais — preserva o centro da imagem visível */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(10,10,15,0.55) 0%, rgba(10,10,15,0) 14%, rgba(10,10,15,0) 60%, rgba(10,10,15,0.55) 100%)",
        }}
        aria-hidden="true"
      />

      <div
        ref={ref}
        className={`arcana-reveal ${visible ? "is-visible" : ""} relative z-10 mx-auto flex max-w-2xl flex-col items-center text-center`}
      >
        <h2 className="font-cinzel text-lg tracking-[0.15em] text-arcana-text drop-shadow-[0_2px_18px_rgba(0,0,0,1)] sm:text-xl md:text-2xl">
          Sua próxima aventura começa aqui.
        </h2>

        <Link
          href="/register"
          className="mt-6 rounded-sm border border-arcana-gold bg-arcana-gold/95 px-7 py-2.5 font-cinzel text-[11px] uppercase tracking-[0.3em] text-arcana-bg shadow-[0_0_18px_rgba(201,168,76,0.35)] backdrop-blur-sm transition-all duration-300 hover:bg-arcana-gold-bright hover:shadow-[0_0_28px_rgba(201,168,76,0.55)]"
        >
          Criar conta grátis
        </Link>

        <p className="mt-4 font-crimson text-sm text-arcana-text/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
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
