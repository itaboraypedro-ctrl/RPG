"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addInvites, removeInvite } from "@/app/campaigns/[id]/story/actions";
import type {
  PartyCharacter,
  PartyMember,
  PartyMemberStatus,
} from "@/lib/types";
import type { StoryHubApi } from "../StoryHub";
import { parseEmails } from "@/components/campaign-creation/EmailListEditor";
import { CharacterDossier } from "../CharacterDossier";
import { WeavePanel } from "../WeavePanel";
import { RegrasMesaPanel } from "../RegrasMesaPanel";
import type { LimitesCriacao } from "@/lib/character-creation/sacramento/rules";
import {
  EmptyHint,
  GhostButton,
  GoldButton,
  SectionHeader,
  hintClass,
  labelClass,
} from "../ui";

const STATUS: Record<PartyMemberStatus, { label: string; className: string }> =
  {
    "aguardando-conta": {
      label: "Aguardando cadastro",
      className: "border-arcana-border text-arcana-text",
    },
    criando: {
      label: "Criando personagem",
      className: "border-amber-400/60 text-amber-200",
    },
    pronto: {
      label: "✓ Pronto",
      className: "border-emerald-400/60 text-emerald-200",
    },
  };

export function PartySection({
  api,
  party,
  invitesReady,
  regras,
}: {
  api: StoryHubApi;
  party: PartyMember[];
  invitesReady: boolean;
  regras: LimitesCriacao;
}) {
  const [aba, setAba] = useState<"bando" | "regras" | "ia">("bando");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rascunho, setRascunho] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [dossie, setDossie] = useState<{
    character: PartyCharacter;
    player: string;
  } | null>(null);

  const prontos = party.filter((m) => m.status === "pronto").length;
  const personagens = party.reduce((n, m) => n + m.characters.length, 0);

  // Um clique só: separa os e-mails colados e já grava os convites.
  function convidar() {
    const { validos, invalidos } = parseEmails(rascunho);
    if (validos.length === 0) {
      setErro(invalidos.length > 0 ? `Não parece e-mail: ${invalidos.join(", ")}` : null);
      return;
    }
    setErro(null);
    startTransition(async () => {
      const r = await addInvites(api.sessionId, validos);
      if (!r.ok) {
        setErro(r.error);
        return;
      }
      setRascunho(invalidos.join(" "));
      if (invalidos.length > 0) setErro(`Convites salvos. Não parece e-mail: ${invalidos.join(", ")}`);
      router.refresh();
    });
  }

  function retirar(m: PartyMember) {
    const quem = m.email ?? m.displayName ?? "este jogador";
    if (!window.confirm(`Retirar o convite de ${quem}?`)) return;
    startTransition(async () => {
      const r = await removeInvite(api.sessionId, {
        inviteId: m.inviteId,
        playerId: m.characters.length === 0 ? m.playerId : null,
      });
      if (!r.ok) setErro(r.error);
      router.refresh();
    });
  }

  return (
    <div className="max-w-4xl space-y-8">
      <SectionHeader
        title="Jogadores"
        description="Convide pelo e-mail, acompanhe quem já está pronto, abra o dossiê de cada personagem e defina as regras de criação da mesa."
      />

      <nav className="flex flex-wrap gap-2" aria-label="Seções de jogadores">
        {(
          [
            ["bando", `Bando · ${prontos}/${party.length} prontos`],
            ["regras", "Regras da mesa"],
            ...(api.aiEnabled ? [["ia", "✦ Tecer com IA"]] : []),
          ] as [typeof aba, string][]
        ).map(([id, rotulo]) => (
          <button
            key={id}
            type="button"
            onClick={() => setAba(id)}
            aria-pressed={aba === id}
            className={[
              "rounded-xl px-4 py-2 font-cinzel text-[11px] uppercase tracking-[0.2em] transition-all",
              aba === id
                ? "bg-arcana-gold font-bold text-arcana-bg"
                : "border border-arcana-border text-arcana-text hover:border-arcana-gold/60",
            ].join(" ")}
          >
            {rotulo}
          </button>
        ))}
      </nav>

      {aba === "regras" && (
        <RegrasMesaPanel sessionId={api.sessionId} initial={regras} />
      )}

      {aba === "ia" && (
        <WeavePanel
          sessionId={api.sessionId}
          readyCount={personagens}
          onApplied={api.ingest}
        />
      )}

      {aba === "bando" && (
        <>
          {!invitesReady && (
            <p className="rounded-xl border border-red-400/50 bg-red-950/40 px-4 py-3 font-crimson text-base text-red-200">
              Convites por e-mail indisponíveis — rode a migration
              008_campaign_invites.sql no SQL Editor do Supabase.
            </p>
          )}

          {/* Placar */}
          <div className="flex flex-wrap gap-3">
            <div className="arcana-card px-4 py-3">
              <p className={labelClass}>Prontos</p>
              <p className="font-cinzel text-2xl text-arcana-gold-bright">
                {prontos}/{party.length}
              </p>
            </div>
            <div className="arcana-card px-4 py-3">
              <p className={labelClass}>Personagens</p>
              <p className="font-cinzel text-2xl text-arcana-text">
                {personagens}
              </p>
            </div>
          </div>

          {/* Convidar */}
          <div className="space-y-3">
            <p className={labelClass}>Convidar por e-mail</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                inputMode="email"
                autoComplete="off"
                value={rascunho}
                onChange={(e) => setRascunho(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    convidar();
                  }
                }}
                placeholder="jogador@email.com — cole vários separados por vírgula"
                className="arcana-input min-w-0 flex-1 font-crimson text-sm"
              />
              <GoldButton onClick={convidar} disabled={pending || !rascunho.trim()}>
                {pending ? "Convidando…" : "Convidar"}
              </GoldButton>
            </div>
            <p className={hintClass}>
              Nenhum e-mail é disparado: avise o jogador para criar conta com esse endereço — o
              convite aparece no Hub dele.
            </p>
            {erro && (
              <p className="font-crimson text-sm italic text-red-300">{erro}</p>
            )}
          </div>

          {/* Lista */}
          {party.length === 0 ? (
            <EmptyHint>Ninguém convidado ainda.</EmptyHint>
          ) : (
            <ul className="space-y-3">
              {party.map((m) => {
                const st = STATUS[m.status];
                const nomeJogador = m.displayName ?? m.email ?? "Jogador";
                return (
                  <li key={m.key} className="arcana-card space-y-3 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className={
                            m.displayName
                              ? "truncate font-cinzel text-sm tracking-[0.1em] text-arcana-text"
                              : "truncate font-crimson text-base text-arcana-text"
                          }
                        >
                          {nomeJogador}
                        </p>
                        {m.email && m.displayName && (
                          <p className="truncate font-crimson text-sm text-arcana-text-dim">
                            {m.email}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 font-cinzel text-[10px] uppercase tracking-[0.18em] ${st.className}`}
                        >
                          {st.label}
                        </span>
                        {(m.inviteId || m.characters.length === 0) && (
                          <GhostButton
                            danger
                            onClick={() => retirar(m)}
                            disabled={pending}
                          >
                            Retirar
                          </GhostButton>
                        )}
                      </div>
                    </div>

                    {m.characters.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {m.characters.map((c) => {
                          const retrato =
                            c.visual?.imagens?.close ?? c.avatar_url;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() =>
                                setDossie({ character: c, player: nomeJogador })
                              }
                              className="flex items-center gap-3 rounded-xl border border-arcana-gold/40 bg-arcana-surface px-3 py-2 text-left transition-all hover:border-arcana-gold hover:shadow-[0_0_16px_rgba(201,168,76,0.25)]"
                            >
                              {retrato ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={retrato}
                                  alt=""
                                  className="h-14 w-11 rounded-lg object-cover object-top"
                                />
                              ) : (
                                <span className="flex h-14 w-11 items-center justify-center rounded-lg border border-arcana-border font-cinzel text-arcana-gold">
                                  {c.name.charAt(0)}
                                </span>
                              )}
                              <span>
                                <span className="block font-cinzel text-sm tracking-[0.08em] text-arcana-gold-bright">
                                  {c.name}
                                </span>
                                <span className="block font-crimson text-sm text-arcana-text">
                                  Nível {c.level} · abrir dossiê →
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {dossie && (
        <CharacterDossier
          character={dossie.character}
          playerName={dossie.player}
          onClose={() => setDossie(null)}
        />
      )}
    </div>
  );
}
