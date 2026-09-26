"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { fichaMesa } from "@/lib/rulesets/sacramento/mesa";
import { numeroSessao } from "@/lib/sessoes-de-jogo";
import type { ResumoPersonagem, ResumoSessao } from "@/lib/resumo-sessao";
import { RetratoEstado } from "./pecas";

function duracao(ms: number): string {
  if (ms <= 0) return "—";
  const min = Math.round(ms / 60000);
  const h = Math.floor(min / 60);
  return h > 0 ? `${h}h ${String(min % 60).padStart(2, "0")}min` : `${min} min`;
}

const reais = (v: number) => `$${v.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`;
const sinal = (v: number, fmt: (x: number) => string = String) => (v > 0 ? `+${fmt(v)}` : v < 0 ? `−${fmt(-v)}` : fmt(0));

/** Resumo de fim de sessão (ou de campanha) do Sacramento — jogador e Juiz. */
export function ResumoDaSessao({
  sessionId,
  titulo,
  resumo,
  destaqueId,
  voltar,
  aguardarProxima = false,
}: {
  sessionId: string;
  titulo: string;
  resumo: ResumoSessao;
  destaqueId?: string;
  voltar: { href: string; rotulo: string };
  /** Jogador: volta sozinho para a mesa quando o Juiz abrir a próxima sessão. */
  aguardarProxima?: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!aguardarProxima) return;
    const supabase = createClient();
    const ch = supabase
      .channel(`resumo-${sessionId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "sessions", filter: `id=eq.${sessionId}` }, (p) => {
        const st = (p.new as { status?: string }).status;
        if (st === "active" || st === "paused") router.push(`/play/${sessionId}`);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [aguardarProxima, sessionId, router]);

  const personagens = [...resumo.personagens].sort((a, b) => (a.character.id === destaqueId ? -1 : b.character.id === destaqueId ? 1 : 0));
  const rotulo = resumo.numero != null ? `Sessão ${numeroSessao(resumo.numero)} encerrada` : "Campanha encerrada";

  return (
    <div className="arcana-scene fixed inset-0 z-40 overflow-y-auto text-arcana-text">
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
        <header className="relative overflow-hidden rounded-2xl border border-arcana-gold/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/story/sacramento/capa-larga.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(7,7,13,0.94), rgba(7,7,13,0.75) 60%, rgba(7,7,13,0.45))" }} />
          <div className="relative space-y-3 p-5 sm:p-8">
            <p className="font-cinzel text-[10px] uppercase tracking-[0.4em] text-arcana-gold">{titulo}</p>
            <h1 className="font-cinzel text-3xl font-bold uppercase tracking-[0.12em] text-arcana-gold-bright sm:text-4xl">{rotulo}</h1>
            <div className="flex flex-wrap gap-2">
              <Chip rotulo="Duração" valor={duracao(resumo.duracaoMs)} />
              {resumo.numero == null && <Chip rotulo="Sessões" valor={String(resumo.sessoesJogadas)} />}
              <Chip rotulo="Combates" valor={String(resumo.combates)} />
              <Chip rotulo="Cenas" valor={String(resumo.cenas.length)} />
            </div>
            {resumo.cenas.length > 0 && (
              <p className="font-crimson text-base text-white">Por onde o bando passou: {resumo.cenas.join(" · ")}</p>
            )}
            {aguardarProxima && (
              <p className="font-crimson text-sm text-amber-200">A mesa reabre aqui sozinha quando o Juiz começar a próxima sessão.</p>
            )}
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="arcana-heading text-xl tracking-[0.14em]">O bando</h2>
          {personagens.length === 0 ? (
            <p className="rounded-xl border border-dashed border-arcana-border p-6 text-center font-crimson text-base text-arcana-text">Nenhum personagem na mesa.</p>
          ) : (
            <ul className="grid gap-4 lg:grid-cols-2">
              {personagens.map((r) => (
                <CartaoPersonagem key={r.character.id} r={r} destaque={r.character.id === destaqueId} />
              ))}
            </ul>
          )}
        </section>

        <div className="flex justify-center pb-6">
          <Link href={voltar.href} className="arcana-btn-primary">
            {voltar.rotulo}
          </Link>
        </div>
      </div>
    </div>
  );
}

function Chip({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <span className="rounded-full border border-arcana-gold/50 bg-black/50 px-3 py-1 font-cinzel text-[11px] uppercase tracking-[0.15em] text-arcana-gold-bright">
      {rotulo}: <span className="text-white">{valor}</span>
    </span>
  );
}

function CartaoPersonagem({ r, destaque }: { r: ResumoPersonagem; destaque: boolean }) {
  const f = fichaMesa(r.character);
  const cor = (v: number) => (v > 0 ? "text-emerald-200" : v < 0 ? "text-red-300" : "text-white");
  return (
    <li className={`arcana-card space-y-3 p-4 ${destaque ? "border-arcana-gold/70" : ""}`}>
      <div className="flex gap-3">
        <RetratoEstado character={r.character} ficha={f} className="h-24 w-20 shrink-0" />
        <div className="min-w-0 flex-1 space-y-1">
          {destaque && <p className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold">Seu personagem</p>}
          <p className="truncate font-cinzel text-lg text-arcana-gold-bright">{r.character.name}</p>
          <p className="font-crimson text-sm text-arcana-text">
            Nv {f.nivel} · Vida {f.vida}/{f.vidaMax} · Dor {f.dor}/6
            {f.condicoes.length > 0 && ` · ${f.condicoes.join(", ")}`}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Stat rotulo="Dinheiro" valor={reais(r.saldo)} detalhe={sinal(r.saldoDelta, reais)} cls={cor(r.saldoDelta)} />
        <Stat rotulo="XP" valor={String(f.xp)} detalhe={sinal(r.xpDelta)} cls={cor(r.xpDelta)} />
        <Stat rotulo="Vida" valor={`−${r.danoV} / +${r.curaV}`} detalhe={`${r.dor} de Dor`} cls="text-white" />
        <Stat rotulo="Testes" valor={`${r.testes.sucesso} ✓ · ${r.testes.falha} ✗`} detalhe={`Sina ${r.sina.ganhas}↑ ${r.sina.usadas}↓`} cls="text-white" />
        <Stat rotulo="Tiros" valor={`${r.tiros.acertos}/${r.tiros.disparos} acertos`} detalhe={`${r.tiros.disparos} bala${r.tiros.disparos === 1 ? "" : "s"} gasta${r.tiros.disparos === 1 ? "" : "s"}`} cls="text-white" />
      </dl>

      {r.itens.length > 0 && (
        <div className="space-y-1">
          <p className="font-cinzel text-[10px] uppercase tracking-[0.25em] text-arcana-gold">Itens novos</p>
          <p className="font-crimson text-sm text-white">{r.itens.map((i) => `${i.quantidade}× ${i.nome}`).join(" · ")}</p>
        </div>
      )}

      <div className="space-y-1">
        <p className="font-cinzel text-[10px] uppercase tracking-[0.25em] text-arcana-gold">Principais feitos</p>
        {r.feitos.length === 0 ? (
          <p className="font-crimson text-sm text-arcana-text">Nada marcante registrado.</p>
        ) : (
          <ul className="space-y-0.5">
            {r.feitos.slice(-8).map((t, i) => (
              <li key={i} className="font-crimson text-sm text-white">• {t}</li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function Stat({ rotulo, valor, detalhe, cls }: { rotulo: string; valor: string; detalhe: string; cls: string }) {
  return (
    <div className="rounded-xl border border-arcana-border bg-black/40 p-2">
      <dt className="font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-text">{rotulo}</dt>
      <dd className="font-cinzel text-sm text-white">{valor}</dd>
      <dd className={`font-crimson text-xs ${cls}`}>{detalhe}</dd>
    </div>
  );
}
