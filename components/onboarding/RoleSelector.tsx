"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Role = "gm" | "player";

const OPTIONS: {
  role: Role;
  icon: string;
  title: string;
  description: string;
  cta: string;
}[] = [
  {
    role: "gm",
    icon: "⚔️",
    title: "Mestre",
    description:
      "Crie e conduza suas aventuras. Controle a mesa, a história e o destino dos jogadores.",
    cta: "Ser Mestre",
  },
  {
    role: "player",
    icon: "🎭",
    title: "Jogador",
    description:
      "Entre em aventuras criadas por outros mestres. Crie seus personagens e viva a história.",
    cta: "Ser Jogador",
  },
];

export function RoleSelector() {
  const router = useRouter();
  const [pending, setPending] = useState<Role | null>(null);

  function pickRole(role: Role) {
    if (pending) return;
    setPending(role);
    router.push(`/register?step=2&role=${role}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-cinzel text-2xl tracking-[0.18em] text-arcana-text sm:text-3xl">
          Como você quer começar?
        </h2>
        <p className="mt-2 font-crimson text-base text-arcana-text-dim">
          Escolha seu papel. Pode mudar depois.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {OPTIONS.map((opt) => {
          const isPending = pending === opt.role;
          return (
            <button
              key={opt.role}
              type="button"
              onClick={() => pickRole(opt.role)}
              disabled={pending !== null}
              className={`group relative flex flex-col items-start gap-4 border p-6 text-left transition-all duration-300 sm:p-7 ${
                isPending
                  ? "border-arcana-gold bg-arcana-gold/10 shadow-[0_0_30px_rgba(201,168,76,0.4)]"
                  : "border-arcana-border bg-arcana-surface/60 hover:border-arcana-gold/60 hover:bg-arcana-surface hover:shadow-[0_0_24px_rgba(201,168,76,0.2)]"
              } ${pending && !isPending ? "opacity-40" : ""} disabled:cursor-not-allowed`}
            >
              <span
                className="text-4xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:text-5xl"
                aria-hidden="true"
              >
                {opt.icon}
              </span>
              <h3 className="font-cinzel text-xl tracking-[0.2em] text-arcana-text sm:text-2xl">
                {opt.title}
              </h3>
              <p className="font-crimson text-sm leading-relaxed text-arcana-text-dim sm:text-base">
                {opt.description}
              </p>
              <span
                className={`mt-2 inline-flex items-center border px-5 py-2 font-cinzel text-[11px] uppercase tracking-[0.3em] transition-colors ${
                  isPending
                    ? "border-arcana-gold bg-arcana-gold text-arcana-bg"
                    : "border-arcana-gold/50 text-arcana-gold group-hover:border-arcana-gold group-hover:bg-arcana-gold group-hover:text-arcana-bg"
                }`}
              >
                {isPending ? "Carregando..." : opt.cta}
              </span>
            </button>
          );
        })}
      </div>

      <p className="font-crimson text-sm text-arcana-text-dim">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="text-arcana-gold transition-colors hover:text-arcana-gold-bright"
        >
          Entrar →
        </Link>
      </p>
    </div>
  );
}
