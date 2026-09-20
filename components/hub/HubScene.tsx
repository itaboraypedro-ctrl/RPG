"use client";

import Link from "next/link";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "@/components/providers/AuthProvider";
import { HubSessionCard } from "./HubSessionCard";
import { getClassColor } from "@/lib/character-colors";
import type { Character, Profile, Session, SessionPlayerStatus, SessionStatus } from "@/lib/types";

/* ── Types ── */
type CharacterWithSession = Character & {
  session?: { id: string; status: SessionStatus; title: string } | null;
};
type GmSessionRow = Session & {
  session_players?: { player_id: string; status: SessionPlayerStatus }[];
};
type PlayerInviteRow = {
  status: SessionPlayerStatus;
  session: Session & { gm: { display_name: string } | null };
};

type Props = {
  profile: Profile;
  isGm: boolean;
  hasActiveGame: boolean;
  pendingInvitesCount: number;
  characters: CharacterWithSession[];
  gmSessions: GmSessionRow[];
  playerInvites: PlayerInviteRow[];
};

/* ── Embers — mesmos dados da landing, posições determinísticas ── */
const EMBERS = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 5.7 + 3) % 100}%`,
  delay: `${(i * 1.3) % 11}s`,
  duration: `${12 + (i % 6)}s`,
  size: 1 + (i % 3),
}));

const CONTINUE_STATUSES = new Set(["lobby", "active", "paused"]);

function periodFromHour(h: number) {
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

const ROLE_LABEL: Record<string, string> = { admin: "Admin", gm: "Mestre", player: "Jogador" };

/* ─────────────────────────────────────────────────────── */
export function HubScene({ profile, isGm, hasActiveGame, pendingInvitesCount, characters, gmSessions, playerInvites }: Props) {
  const auth = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [greeting, setGreeting] = useState("");

  /* character selection */
  const [activeIdx, setActiveIdx] = useState(0);
  const activeChar = characters[activeIdx] ?? null;

  /* parallax */
  const targetP = useRef({ x: 0, y: 0 });
  const currentP = useRef({ x: 0, y: 0 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const rafP = useRef<number>(0);

  const onMouseMove = useCallback((e: MouseEvent) => {
    targetP.current = {
      x: (e.clientX / window.innerWidth - 0.5) * 2 * 18,
      y: (e.clientY / window.innerHeight - 0.5) * 2 * 10,
    };
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    function tick() {
      const t = targetP.current, c = currentP.current;
      const nx = c.x + (t.x - c.x) * 0.04;
      const ny = c.y + (t.y - c.y) * 0.04;
      currentP.current = { x: nx, y: ny };
      setParallax({ x: nx, y: ny });
      rafP.current = requestAnimationFrame(tick);
    }
    rafP.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", onMouseMove); cancelAnimationFrame(rafP.current); };
  }, [onMouseMove]);


  useEffect(() => {
    // Saudação depende do relógio do cliente — no effect para não divergir do SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGreeting(periodFromHour(new Date().getHours()));
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menuOpen]);

  const initial = profile.display_name.trim().charAt(0).toUpperCase() || "?";
  const subline = hasActiveGame
    ? "Partida em andamento."
    : pendingInvitesCount > 0
      ? `${pendingInvitesCount} convite${pendingInvitesCount > 1 ? "s" : ""} aguardando.`
      : "Pronto para uma nova aventura?";

  const heroColor = activeChar ? getClassColor(activeChar.class) : "#c9a84c";
  const heroCtaHref = activeChar
    ? (activeChar.session && CONTINUE_STATUSES.has(activeChar.session.status)
        ? `/play/${activeChar.session.id}`
        : `/play/characters/select?character=${activeChar.id}`)
    : "/play/characters/new";
  const heroCtaLabel = activeChar
    ? (activeChar.session && CONTINUE_STATUSES.has(activeChar.session.status) ? "Continuar partida" : "Selecionar partida")
    : "Criar personagem";

  return (
    <div className="relative h-dvh bg-[#07070d]" style={{ overflow: "hidden" }}>

      {/* ── Parallax BG — contido em seu próprio overflow:hidden ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0" style={{ overflow: "hidden" }}>
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translate(${parallax.x * -0.5}px,${parallax.y * -0.5}px) scale(1.08)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/landing/hero.jpg" alt="" className="h-full w-full object-cover" style={{ objectPosition: "center 30%" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(7,7,13,0.2) 0%, rgba(7,7,13,0.65) 55%, rgba(7,7,13,0.96) 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-[50%]" style={{ background: "linear-gradient(to top, #07070d 0%, rgba(7,7,13,0.7) 50%, transparent 100%)" }} />
        <div className="absolute inset-y-0 left-0 w-1/3" style={{ background: "linear-gradient(to right, rgba(7,7,13,0.7), transparent)" }} />
        <div className="absolute inset-y-0 right-0 w-1/3" style={{ background: "linear-gradient(to left, rgba(7,7,13,0.7), transparent)" }} />
      </div>
      </div>{/* fim do wrapper overflow:hidden do parallax */}

      {/* ── Mist atmosférico (mesmo da landing) ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        <div className="arcana-mist" />
      </div>

      {/* ── Aura dourada central ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]">
        <div className="arcana-aura" style={{ left: "55%", top: "45%" }} />
      </div>

      {/* ── Brasas subindo (mesmo da landing) ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        {EMBERS.map((e, i) => (
          <span key={i} className="arcana-ember" style={{ left: e.left, width: `${e.size}px`, height: `${e.size}px`, animationDelay: e.delay, animationDuration: e.duration }} />
        ))}
      </div>

      {/* ── Grain ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[2] opacity-[0.018]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "256px 256px" }}
      />

      {/* ── UI layer: flex col, locked to h-dvh ── */}
      <div className="relative z-10 flex h-dvh flex-col">

        {/* NAV — shrink-0 */}
        <header className="shrink-0 border-b border-white/[0.06]" style={{ background: "rgba(7,7,13,0.7)", backdropFilter: "blur(20px) saturate(1.4)" }}>
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3 lg:px-10">
            <Link href="/hub" className="font-cinzel text-[15px] tracking-[0.45em] text-arcana-gold transition-colors hover:text-arcana-gold-bright">
              ARCANA
            </Link>
            <div className="relative" ref={menuRef}>
              <button type="button" onClick={() => setMenuOpen(v => !v)} aria-haspopup="menu" aria-expanded={menuOpen}
                className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-all hover:bg-white/5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-cinzel text-sm text-arcana-gold ring-1 ring-arcana-gold/40"
                  style={profile.avatar_url
                    ? { backgroundImage: `url(${profile.avatar_url})`, backgroundSize: "cover", backgroundPosition: "center", color: "transparent" }
                    : { background: "rgba(201,168,76,0.1)" }}>
                  {profile.avatar_url ? "" : initial}
                </span>
                <span className="hidden flex-col items-start sm:flex">
                  <span className="font-cinzel text-sm tracking-[0.15em] text-arcana-text">{profile.display_name}</span>
                  <span className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold/60">{ROLE_LABEL[profile.role] ?? profile.role}</span>
                </span>
                <svg viewBox="0 0 12 8" className="hidden h-2 w-3 text-arcana-text-dim sm:block" fill="none">
                  <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-52 rounded-xl border border-arcana-border/60 py-1 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
                  style={{ background: "rgba(15,15,28,0.97)", backdropFilter: "blur(20px)" }}>
                  <button type="button" role="menuitem"
                    onClick={() => { setMenuOpen(false); auth?.signOut(); }}
                    className="block w-full px-4 py-3 text-left font-crimson text-sm text-red-300/80 transition-colors hover:bg-red-500/10 hover:text-red-200">
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── ZONA DE PERSONAGENS — flex-1, ocupa o espaço disponível ── */}
        <div className="relative flex-1 overflow-hidden">

          {/* Hero portrait de fundo.
              Retrato gerado na forja (URL do Storage) é um busto recortado com fundo
              transparente: entra inteiro (contain), ancorado embaixo, flutuando sobre a
              cena — nunca esticado em cover, senão só o chapéu aparece. Retratos
              estáticos antigos (quadrados com fundo pintado) mantêm o cover clássico. */}
          {activeChar?.avatar_url && (() => {
            const heroGerado = activeChar.avatar_url.startsWith("http");
            return (
              <div key={activeChar.id} className="absolute inset-0 pointer-events-none"
                style={{ animation: "heroFadeIn 500ms ease forwards" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeChar.avatar_url}
                  alt=""
                  className={heroGerado
                    ? "h-full w-full object-contain object-bottom pt-6"
                    : "h-full w-full object-cover object-top"}
                  style={heroGerado
                    ? { filter: `drop-shadow(0 12px 60px rgba(0,0,0,0.7)) drop-shadow(0 0 80px ${heroColor}26)` }
                    : undefined}
                />
                <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 60% 80% at 60% 30%, ${heroColor}18, transparent 65%)` }} />
                {/* Véu vertical mais leve no mobile — o retrato é o destaque */}
                <div className="absolute inset-0 md:hidden" style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(7,7,13,0.25) 55%, rgba(7,7,13,0.92) 100%)" }} />
                <div className="absolute inset-0 hidden md:block" style={{ background: "linear-gradient(to bottom, rgba(7,7,13,0.15) 0%, rgba(7,7,13,0.55) 60%, rgba(7,7,13,0.97) 100%)" }} />
                {/* Véu lateral só em telas largas — no mobile ele cobria o personagem inteiro */}
                <div className="absolute inset-0 hidden md:block" style={{ background: "linear-gradient(to right, rgba(7,7,13,0.6) 0%, transparent 35%, transparent 65%, rgba(7,7,13,0.6) 100%)" }} />
              </div>
            );
          })()}

          {/* Bloco inferior: info à esquerda + carrossel grudado à direita */}
          <div className="absolute bottom-0 left-0 z-10 w-full flex items-end"
            style={{ background: "linear-gradient(to top, rgba(7,7,13,0.92) 0%, rgba(7,7,13,0.5) 55%, transparent 100%)" }}>

            {/* Info do personagem */}
            <div className="shrink-0 pl-10 pr-6 pb-7">
              {greeting && (
                <p className="mb-2 font-cinzel text-[9px] uppercase tracking-[0.5em] text-arcana-gold/50">
                  {greeting}, {profile.display_name} · {subline}
                </p>
              )}

              {activeChar ? (
                <>
                  <div className="mb-3 h-px w-8" style={{ background: heroColor, boxShadow: `0 0 10px ${heroColor}` }} />
                  <h1 className="font-cinzel uppercase leading-[0.9] text-arcana-text"
                    style={{ fontSize: "clamp(1.6rem, 3vw, 3rem)", letterSpacing: "0.1em", textShadow: "0 4px 30px rgba(0,0,0,0.9)" }}>
                    {activeChar.name}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2.5">
                    <span className="font-cinzel text-xs uppercase tracking-[0.2em]" style={{ color: heroColor }}>{activeChar.class}</span>
                    <span className="text-arcana-border/50">·</span>
                    <span className="font-crimson text-sm italic text-arcana-text-dim">{activeChar.race}</span>
                    <span className="text-arcana-border/50">·</span>
                    <span className="font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-text-dim/60">Nv. {activeChar.level}</span>
                  </div>
                  <div className="mt-3 w-[180px] space-y-1">
                    <div className="flex items-center justify-between font-cinzel text-[8px] uppercase tracking-[0.3em] text-arcana-text-dim/50">
                      <span>Vida</span>
                      <span className="font-crimson text-[11px] normal-case tracking-normal text-arcana-text/80">{activeChar.hp}/{activeChar.max_hp}</span>
                    </div>
                    <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${activeChar.max_hp ? Math.round((activeChar.hp / activeChar.max_hp) * 100) : 0}%`, background: activeChar.max_hp && activeChar.hp / activeChar.max_hp > 0.3 ? "#4ecb8a" : "#e05050" }} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <Link href={heroCtaHref}
                      className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-bg px-5 py-2.5 rounded-xl transition-all hover:shadow-[0_0_24px_rgba(201,168,76,0.5)]"
                      style={{ background: `linear-gradient(135deg, ${heroColor}, #f0cc6a)` }}>
                      {heroCtaLabel}
                    </Link>
                    <Link href="/play/characters/new"
                      className="font-cinzel text-[9px] uppercase tracking-[0.3em] text-arcana-text-dim/50 transition-colors hover:text-arcana-gold">
                      + Novo
                    </Link>
                  </div>
                </>
              ) : isGm ? (
                <>
                  <h1 className="font-cinzel uppercase leading-[0.9] text-arcana-text"
                    style={{ fontSize: "clamp(1.6rem, 3vw, 2.8rem)", letterSpacing: "0.12em" }}>
                    Sua mesa<br />
                    <span className="text-arcana-gold-bright" style={{ textShadow: "0 0 50px rgba(240,204,106,0.3)" }}>te aguarda.</span>
                  </h1>
                  <p className="mt-3 max-w-sm font-crimson text-sm italic text-arcana-text-dim/70">
                    Crie uma campanha para mestrar — ou um personagem para jogar em mesas de outros mestres.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <Link href="/campaigns/new"
                      className="inline-flex font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-bg px-5 py-2.5 rounded-xl transition-all hover:shadow-[0_0_24px_rgba(201,168,76,0.5)]"
                      style={{ background: "linear-gradient(135deg, #c9a84c, #f0cc6a)" }}>
                      Criar campanha
                    </Link>
                    <Link href="/play/characters/new"
                      className="inline-flex font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold px-5 py-2.5 rounded-xl border border-arcana-gold/40 transition-all hover:border-arcana-gold hover:shadow-[0_0_18px_rgba(201,168,76,0.25)]">
                      Criar personagem
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="font-cinzel uppercase leading-[0.9] text-arcana-text"
                    style={{ fontSize: "clamp(1.6rem, 3vw, 2.8rem)", letterSpacing: "0.12em" }}>
                    Sua lenda<br />
                    <span className="text-arcana-gold-bright" style={{ textShadow: "0 0 50px rgba(240,204,106,0.3)" }}>te aguarda.</span>
                  </h1>
                  <Link href="/play/characters/new"
                    className="mt-4 inline-flex font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-bg px-5 py-2.5 rounded-xl transition-all hover:shadow-[0_0_24px_rgba(201,168,76,0.5)]"
                    style={{ background: "linear-gradient(135deg, #c9a84c, #f0cc6a)" }}>
                    Criar personagem
                  </Link>
                </>
              )}
            </div>

            {/* Carrossel grudado à direita do bloco de info */}
            {characters.length > 0 && (
              <div className="flex-1 min-w-0">
                <CharacterCarousel
                  characters={characters}
                  activeIdx={activeIdx}
                  onSelect={setActiveIdx}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── ZONA DE SESSÕES — shrink-0, compacta ── */}
        <div className="shrink-0 border-t border-arcana-border/20"
          style={{ background: "rgba(7,7,13,0.92)", backdropFilter: "blur(20px)" }}>
          <div className="px-10 py-2.5">

            {/* Tudo numa linha: label · cards · sep · label · cards */}
            <div className="flex items-center gap-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>

              {isGm && (
                <>
                  {/* Label campanhas */}
                  <span className="shrink-0 font-cinzel text-[9px] uppercase tracking-[0.4em] text-arcana-gold/50">Campanhas</span>
                  <Link href="/campaigns/new" className="shrink-0 font-cinzel text-[8px] uppercase tracking-[0.25em] text-arcana-text-dim/35 transition-colors hover:text-arcana-gold">+</Link>

                  {gmSessions.length === 0 ? (
                    <Link href="/campaigns/new"
                      className="shrink-0 font-cinzel text-[9px] uppercase tracking-[0.2em] text-arcana-gold/70 transition-colors hover:text-arcana-gold">
                      Criar primeira campanha →
                    </Link>
                  ) : (
                    gmSessions.map(s => (
                      <div key={s.id} className="shrink-0 w-[220px]">
                        <HubSessionCard variant="gm" session={s} playerCount={s.session_players?.filter(p => p.status === "joined").length ?? 0} compact />
                      </div>
                    ))
                  )}

                  {/* Separador vertical */}
                  <div className="shrink-0 mx-2 h-8 w-px bg-arcana-border/25" />
                </>
              )}

              {/* Label convites */}
              <span className="shrink-0 font-cinzel text-[9px] uppercase tracking-[0.4em] text-arcana-gold/50">Convites</span>

              {playerInvites.length === 0 ? (
                <span className="shrink-0 font-cinzel text-[9px] uppercase tracking-[0.2em] text-arcana-text-dim/30">Nenhum pendente</span>
              ) : (
                playerInvites.map(row => (
                  <div key={row.session.id} className="shrink-0 w-[220px]">
                    <HubSessionCard variant="player" session={row.session}
                      gmName={row.session.gm?.display_name ?? "Desconhecido"} inviteStatus={row.status} compact />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes heroFadeIn {
          from { opacity: 0; transform: scale(1.03) translateX(8px); }
          to   { opacity: 1; transform: scale(1)   translateX(0); }
        }
        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ─── Cinematic character carousel ─────────────────────── */
type CarouselProps = {
  characters: CharacterWithSession[];
  activeIdx: number;
  onSelect: (i: number) => void;
};

function CharacterCarousel({ characters, activeIdx, onSelect }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // keep selected card visible
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.children[activeIdx] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeIdx]);

  return (
    <div className="relative py-2">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-10 pt-4 pb-3"
        style={{
          scrollbarWidth: "none",
          scrollSnapType: "x mandatory",
          WebkitMaskImage: "linear-gradient(to right, transparent 0, black 40px, black calc(100% - 40px), transparent 100%)",
          maskImage: "linear-gradient(to right, transparent 0, black 40px, black calc(100% - 40px), transparent 100%)",
        }}
      >
        {characters.map((c, i) => {
          const dist = Math.abs(i - activeIdx);
          const isActive = i === activeIdx;
          const color = getClassColor(c.class);
          const hpPct = c.max_hp ? Math.round((c.hp / c.max_hp) * 100) : 0;

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(i)}
              style={{
                scrollSnapAlign: "center",
                animation: `cardSlideIn ${180 + i * 60}ms ease both`,
                opacity: isActive ? 1 : Math.max(0.55, 1 - dist * 0.15),
                filter: isActive ? "none" : "saturate(0.65) brightness(0.85)",
                transform: isActive
                  ? "scale(1) translateY(-6px)"
                  : `scale(${Math.max(0.88, 1 - dist * 0.05)}) translateY(0px)`,
                boxShadow: isActive
                  ? `0 0 0 1px ${color}dd, 0 0 22px ${color}40, 0 12px 32px rgba(0,0,0,0.55)`
                  : "0 0 0 1px rgba(255,255,255,0.08)",
                transition: "opacity 350ms ease, filter 350ms ease, transform 350ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 350ms ease",
              }}
              className="relative flex-shrink-0 w-[110px] rounded-xl overflow-hidden focus-visible:outline-none"
              aria-pressed={isActive}
              aria-label={`Selecionar ${c.name}`}
            >
              {/* Card portrait */}
              <div className="relative aspect-[2/3] w-full overflow-hidden">
                {c.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.avatar_url} alt="" className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center" style={{ background: `${color}18` }}>
                    <span className="font-cinzel text-4xl" style={{ color }}>{c.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}

                {/* Bottom name/class overlay */}
                <div className="absolute inset-x-0 bottom-0 p-2.5"
                  style={{ background: "linear-gradient(to top, rgba(7,7,13,0.97) 0%, rgba(7,7,13,0.7) 55%, transparent 100%)" }}>
                  <p className="font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-text leading-tight truncate">
                    {c.name}
                  </p>
                  <p className="font-crimson text-[10px] italic truncate" style={{ color }}>
                    {c.class} · {c.level}
                  </p>
                  {/* HP micro-bar */}
                  <div className="mt-1.5 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${hpPct}%`, background: hpPct > 30 ? "#4ecb8a" : "#e05050" }} />
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        {/* + New character card */}
        <Link
          href="/play/characters/new"
          style={{ scrollSnapAlign: "center", flexShrink: 0, background: "rgba(15,15,28,0.5)" }}
          className="flex w-[110px] aspect-[2/3] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-arcana-border/40 transition-all duration-300 hover:border-arcana-gold/50"
        >
          <span className="font-cinzel text-3xl text-arcana-text-dim/40 transition-colors group-hover:text-arcana-gold">+</span>
          <span className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-arcana-text-dim/40">Novo</span>
        </Link>
      </div>
    </div>
  );
}

/* ── Empty state ── */
function SectionEmpty({ text, subtext, cta }: { text: string; subtext?: string; cta?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-arcana-border/40 px-6 py-10 text-center"
      style={{ background: "rgba(15,15,28,0.4)" }}>
      <p className="font-cinzel text-sm uppercase tracking-[0.25em] text-arcana-text-dim/60">{text}</p>
      {subtext && <p className="font-crimson text-sm text-arcana-text-dim/50 max-w-xs">{subtext}</p>}
      {cta}
    </div>
  );
}
