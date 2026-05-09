"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

const EMBERS = Array.from({ length: 12 }, (_, i) => ({
  left: `${(i * 8.3 + 4) % 100}%`,
  delay: `${(i * 1.1) % 9}s`,
  duration: `${11 + (i % 5)}s`,
  size: 1 + (i % 3),
}));

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    let raf = 0;

    const apply = () => {
      raf = 0;
      const sy = window.scrollY;
      const { x, y } = mouseRef.current;

      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(0, ${
          sy * 0.25
        }px, 0) scale(1.08)`;
      }
      if (auraRef.current) {
        auraRef.current.style.setProperty("--mx", `${x * 18}px`);
        auraRef.current.style.setProperty("--my", `${sy * 0.5 + y * 8}px`);
      }
      if (characterRef.current) {
        const vh = window.innerHeight || 1;
        const progress = Math.min(Math.max(sy / vh, 0), 1);
        const scale = 1 + progress * 0.05;
        characterRef.current.style.transform = `translate3d(0, 0, 0) scale(${scale})`;
      }
      if (titleRef.current) {
        titleRef.current.style.transform = `translate3d(${-x * 5}px, ${
          -sy * 0.2 - y * 4
        }px, 0)`;
      }
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(apply);
    };

    const onScroll = () => schedule();
    const onMove = (e: MouseEvent) => {
      if (isCoarsePointer) return;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseRef.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      schedule();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    apply();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-arcana-bg"
    >
      {/* Camada 1 — Background com blur e brightness reduzido (depth of field) */}
      <div
        ref={bgRef}
        className="absolute inset-0 will-change-transform"
        style={{ transform: "scale(1.08)" }}
      >
        <Image
          src="/landing/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="arcana-fade-in object-cover object-center"
          style={{ animationDuration: "1.6s" }}
        />
      </div>

      {/* Camada 2 — Mist atmosférico drift */}
      <div className="arcana-mist" aria-hidden="true" />

      {/* Camada 3 — Fade no topo para contraste com navbar */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(10,10,15,0.5) 0%, rgba(10,10,15,0.05) 22%, rgba(10,10,15,0) 40%)",
        }}
        aria-hidden="true"
      />

      {/* Camada 3b — Fade denso na base que se funde com a próxima seção */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[35] h-[55%]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(10,10,15,0) 0%, rgba(10,10,15,0.35) 35%, rgba(10,10,15,0.7) 60%, rgba(10,10,15,0.92) 82%, #0a0a0f 100%)",
        }}
        aria-hidden="true"
      />

      {/* Camada 4 — Aura pulsante atrás do personagem */}
      <div
        ref={auraRef}
        className="pointer-events-none absolute inset-0 z-10"
        aria-hidden="true"
        style={{
          transform:
            "translate3d(var(--mx, 0px), var(--my, 0px), 0)",
          willChange: "transform",
        }}
      >
        <div
          className="arcana-aura"
          style={{ left: "50%", top: "62%" }}
        />
      </div>

      {/* Camada 5 — Brasas subindo */}
      <div
        className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
        aria-hidden="true"
      >
        {EMBERS.map((e, i) => (
          <span
            key={i}
            className="arcana-ember"
            style={{
              left: e.left,
              width: `${e.size}px`,
              height: `${e.size}px`,
              animationDelay: e.delay,
              animationDuration: e.duration,
            }}
          />
        ))}
      </div>

      {/* Camada 6 — Título minimalista (atrás do personagem) */}
      <div
        ref={titleRef}
        className="pointer-events-none absolute inset-x-0 top-[20%] z-20 flex flex-col items-center px-6 text-center will-change-transform"
      >
        <h1
          className="arcana-title-reveal font-cinzel text-5xl font-light tracking-[0.4em] text-arcana-text drop-shadow-[0_4px_24px_rgba(0,0,0,1)] sm:text-6xl sm:tracking-[0.5em] md:text-7xl lg:text-[7rem] lg:tracking-[0.55em]"
          style={{ animationDelay: "0.6s" }}
        >
          ARCANA
        </h1>
      </div>

      {/* Camada 7 — Personagem PNG (frente, idle + parallax) */}
      <div
        ref={characterRef}
        className="pointer-events-none absolute inset-0 z-30 will-change-transform"
      >
        <div
          className="arcana-rise-in relative h-full w-full"
          style={{ animationDelay: "0.3s" }}
        >
          <Image
            src="/landing/hero.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="select-none object-cover object-center"
            style={{
              filter:
                "drop-shadow(0 18px 36px rgba(0,0,0,0.85)) drop-shadow(0 0 60px rgba(240,204,106,0.15))",
            }}
          />
        </div>
      </div>

      {/* Camada 8 — Tagline + CTAs minimalistas */}
      <div className="absolute inset-x-0 bottom-0 z-40 flex flex-col items-center px-6 pb-20 text-center sm:pb-24">
        <p
          className="arcana-fade-in font-crimson text-base italic text-arcana-text drop-shadow-[0_2px_14px_rgba(0,0,0,1)] sm:text-lg md:text-xl"
          style={{ animationDelay: "1.3s" }}
        >
          Onde histórias ganham vida.
        </p>

        <div
          className="arcana-fade-in mt-10 flex flex-col items-center gap-5 sm:flex-row sm:gap-8"
          style={{ animationDelay: "1.6s" }}
        >
          <Link
            href="/register"
            className="border border-arcana-gold/50 px-9 py-3 font-cinzel text-[11px] uppercase tracking-[0.4em] text-arcana-gold transition-all duration-300 hover:border-arcana-gold hover:bg-arcana-gold hover:text-arcana-bg"
          >
            Jogar agora
          </Link>
          <a
            href="#como-funciona"
            className="font-cinzel text-[11px] uppercase tracking-[0.4em] text-arcana-text-dim transition-colors duration-300 hover:text-arcana-gold"
          >
            Saiba mais ↓
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#como-funciona"
        aria-label="Rolar para Como Funciona"
        className="arcana-fade-in absolute bottom-6 left-1/2 z-50 -translate-x-1/2 text-arcana-gold/70 transition-colors hover:text-arcana-gold"
        style={{ animationDelay: "2.0s" }}
      >
        <span className="arcana-bounce block font-cinzel text-xl leading-none">
          ∨
        </span>
      </a>
    </section>
  );
}
