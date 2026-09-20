"use client";

import { HowItWorks } from "@/components/campaign-creation/Explainer";
import { PLAYER_GUIDES } from "@/lib/character-creation/sacramento/guidance";
import {
  CONCEITOS_SUGERIDOS,
  FAMILIA_PRESETS,
  OCUPACOES_SUGERIDAS,
  ORIGENS_ABERTAS,
  PASSADO_PRESETS,
  RELACOES_FACCAO_SUGERIDAS,
  SACRAMENTO_FACTIONS,
  SACRAMENTO_PLACES,
  TRILHAS_REDENCAO,
} from "@/lib/character-creation/sacramento/story-data";
import {
  ELEMENTOS_VAZIOS,
  type ElementosHistoria,
  type SacramentoCreationData,
} from "@/lib/character-creation/sacramento/types";

type Props = {
  data: Partial<SacramentoCreationData>;
  onUpdate: (partial: Partial<SacramentoCreationData>) => void;
};

const LABEL = "font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-text-dim";
const HELPER = "font-crimson text-xs italic text-arcana-text-dim";
/** Fundo dos brasões — cor medida nos PNGs originais (FactionsSection). */
const EMBLEM_BG = "#090a11";

function CornerCheck({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={[
        "absolute -right-px -top-px z-10 h-7 w-7 rounded-tr-xl transition-opacity duration-150",
        active ? "opacity-100" : "opacity-0",
      ].join(" ")}
      style={{ background: "linear-gradient(225deg, #d1ab55 50%, transparent 50%)" }}
    >
      <svg
        viewBox="0 0 24 24"
        className="absolute right-[3px] top-[3px] h-3 w-3"
        fill="none"
        stroke="#1c1206"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 12.5l5 5L20 6.5" />
      </svg>
    </span>
  );
}

/** Fileira de preset de frase longa — substitui os chips-pílula. */
function PresetRow({
  texto,
  active,
  onClick,
}: {
  texto: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "relative w-full rounded-xl border px-4 py-2.5 text-left transition-all duration-150",
        active
          ? "border-arcana-gold/70 bg-arcana-gold/[0.08]"
          : "border-arcana-border bg-arcana-surface/60 hover:border-arcana-gold/40 hover:bg-arcana-surface",
      ].join(" ")}
      style={
        active
          ? { boxShadow: "0 0 14px rgba(209,171,85,0.14), inset 0 1px 0 rgba(255,255,255,0.05)" }
          : { boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }
      }
    >
      <CornerCheck active={active} />
      <span
        className={[
          "block font-crimson text-[15px] leading-snug pr-5",
          active ? "text-arcana-gold-bright" : "text-arcana-text",
        ].join(" ")}
      >
        {texto}
      </span>
    </button>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { id: T; label: string }[];
  value: T | "";
  onChange: (id: T) => void;
  ariaLabel: string;
}) {
  const idx = options.findIndex((o) => o.id === value);
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="relative grid rounded-xl p-1"
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
        background: "rgba(8,8,15,0.55)",
        border: "1px solid var(--color-arcana-border)",
      }}
    >
      {idx >= 0 && (
        <span
          aria-hidden
          className="absolute top-1 bottom-1 rounded-[10px] transition-transform duration-200 ease-out"
          style={{
            left: 4,
            width: `calc(${100 / options.length}% - ${8 / options.length + 2}px)`,
            transform: `translateX(${idx * 100}%)`,
            background: "linear-gradient(180deg, rgba(209,171,85,0.28), rgba(209,171,85,0.12))",
            border: "1px solid rgba(209,171,85,0.55)",
            boxShadow: "0 0 14px rgba(209,171,85,0.18)",
          }}
        />
      )}
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={value === o.id}
          className={[
            "relative z-10 py-2.5 px-2 font-cinzel text-[11px] uppercase tracking-[0.18em] transition-colors",
            value === o.id ? "text-arcana-gold-bright" : "text-arcana-text-dim hover:text-arcana-text",
          ].join(" ")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Step2Elementos({ data, onUpdate }: Props) {
  const e = data.elementos ?? ELEMENTOS_VAZIOS;
  const set = (partial: Partial<ElementosHistoria>) =>
    onUpdate({ elementos: { ...e, ...partial } });

  const setVinculo = (i: number, campo: "nome" | "relacao", valor: string) => {
    set({ vinculos: e.vinculos.map((v, idx) => (idx === i ? { ...v, [campo]: valor } : v)) });
  };

  const origemAbertaAtiva = ORIGENS_ABERTAS.find((o) => o.nome === e.origem);
  const lugarAtivo = SACRAMENTO_PLACES.find((p) => p.nome === e.origem);
  const origemLivre = e.origem.length > 0 && !origemAbertaAtiva && !lugarAtivo;

  return (
    <div className="space-y-10 max-w-2xl">
      <HowItWorks guide={PLAYER_GUIDES.elementos} />

      {/* ── Conceito ── */}
      <section className="space-y-3">
        <div>
          <label htmlFor="el-conceito" className={LABEL}>
            Conceito
          </label>
          <p className={HELPER}>
            Uma frase que resume quem ele é e o que faz. Toque num exemplo ou escreva o seu.
          </p>
        </div>
        <input
          id="el-conceito"
          type="text"
          value={e.conceito}
          onChange={(ev) => set({ conceito: ev.target.value })}
          placeholder='Ex.: "ex-padre que perdeu a fé, não o rebanho"'
          maxLength={160}
          className="arcana-input w-full font-crimson text-lg"
        />
        <div className="grid gap-1.5 sm:grid-cols-2">
          {CONCEITOS_SUGERIDOS.map((c) => (
            <PresetRow
              key={c}
              texto={c}
              active={e.conceito === c}
              onClick={() => set({ conceito: c })}
            />
          ))}
        </div>
      </section>

      {/* ── Origem ── */}
      <section className="space-y-3">
        <div>
          <span className={LABEL}>Origem</span>
          <p className={HELPER}>De onde seu personagem veio. Escolha um lugar do Oeste ou escreva outro.</p>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {SACRAMENTO_PLACES.map((p) => {
            const active = e.origem === p.nome;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => set({ origem: p.nome })}
                aria-pressed={active}
                className={[
                  "group relative overflow-hidden rounded-xl border text-left transition-all duration-150",
                  active
                    ? "border-arcana-gold/70"
                    : "border-arcana-border hover:border-arcana-gold/40",
                ].join(" ")}
                style={active ? { boxShadow: "0 0 18px rgba(209,171,85,0.18)" } : undefined}
              >
                <CornerCheck active={active} />
                <span className="relative block h-20">
                  {p.imagem && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imagem}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  )}
                  <span
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(11,11,20,0.1), transparent 40%, rgba(11,11,20,0.78))",
                    }}
                  />
                  <span
                    className={[
                      "absolute bottom-1.5 left-2 right-2 font-cinzel text-[11px] uppercase tracking-[0.12em] leading-tight",
                      active ? "text-arcana-gold-bright" : "text-arcana-text",
                    ].join(" ")}
                    style={{ textShadow: "0 2px 6px rgba(0,0,0,0.9)" }}
                  >
                    {p.nome}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {ORIGENS_ABERTAS.map((o) => {
            const active = e.origem === o.nome;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => set({ origem: o.nome })}
                aria-pressed={active}
                title={o.descricao}
                className={[
                  "relative rounded-xl border px-3 py-2.5 text-center font-cinzel text-[10px] uppercase tracking-[0.14em] transition-all duration-150",
                  active
                    ? "border-arcana-gold/70 bg-arcana-gold/[0.08] text-arcana-gold-bright"
                    : "border-arcana-border bg-arcana-surface/60 text-arcana-text-dim hover:border-arcana-gold/40 hover:text-arcana-text",
                ].join(" ")}
              >
                <CornerCheck active={active} />
                {o.nome}
              </button>
            );
          })}
        </div>
        {(lugarAtivo || origemAbertaAtiva) && (
          <p className="font-crimson text-sm italic text-arcana-text-dim">
            {lugarAtivo ? lugarAtivo.caracteristicas : origemAbertaAtiva?.descricao}
          </p>
        )}
        <input
          type="text"
          value={origemLivre ? e.origem : ""}
          onChange={(ev) => set({ origem: ev.target.value })}
          placeholder="…ou escreva outro lugar (fazenda, vilarejo, acampamento)"
          maxLength={80}
          className="arcana-input w-full font-crimson text-base"
        />
      </section>

      {/* ── Ocupação ── */}
      <section className="space-y-3">
        <div>
          <span className={LABEL}>Ocupação</span>
          <p className={HELPER}>
            Do que ele vive. Não muda números da ficha — mas diz muito sobre a história.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {OCUPACOES_SUGERIDAS.map((o) => {
            const active = e.ocupacao === o.nome;
            return (
              <button
                key={o.nome}
                type="button"
                onClick={() => set({ ocupacao: o.nome })}
                aria-pressed={active}
                className={[
                  "relative rounded-xl border p-3 text-left transition-all duration-150",
                  active
                    ? "border-arcana-gold/70 bg-arcana-gold/[0.08]"
                    : "border-arcana-border bg-arcana-surface/60 hover:border-arcana-gold/40 hover:bg-arcana-surface",
                ].join(" ")}
                style={
                  active
                    ? { boxShadow: "0 0 18px rgba(209,171,85,0.16), inset 0 1px 0 rgba(255,255,255,0.05)" }
                    : { boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }
                }
              >
                <CornerCheck active={active} />
                <span className="flex items-start gap-3">
                  {o.emblema && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={o.emblema}
                      alt=""
                      loading="lazy"
                      className="h-11 w-11 shrink-0 rounded-xl object-cover"
                      style={{
                        background: EMBLEM_BG,
                        border: active
                          ? "1px solid rgba(209,171,85,0.6)"
                          : "1px solid var(--color-arcana-border-dim)",
                      }}
                    />
                  )}
                  <span className="min-w-0">
                    <span
                      className={[
                        "block font-cinzel text-[11px] uppercase tracking-[0.16em]",
                        active ? "font-bold text-arcana-gold-bright" : "text-arcana-text",
                      ].join(" ")}
                    >
                      {o.nome}
                    </span>
                    <span className="mt-0.5 block font-crimson text-[13px] leading-snug text-arcana-text-dim">
                      {o.contexto}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <input
          type="text"
          value={OCUPACOES_SUGERIDAS.some((o) => o.nome === e.ocupacao) ? "" : e.ocupacao}
          onChange={(ev) => set({ ocupacao: ev.target.value })}
          placeholder="…ou escreva outra ocupação"
          maxLength={80}
          className="arcana-input w-full font-crimson text-base"
        />
      </section>

      {/* ── Família ── */}
      <section className="space-y-3">
        <div>
          <span className={LABEL}>Família</span>
          <p className={HELPER}>Ter (ou não ter) família dá ao Juiz pessoas para trazer à história.</p>
        </div>
        <Segmented
          ariaLabel="Situação familiar"
          options={[
            { id: "sim", label: "Tem família" },
            { id: "complicada", label: "É complicado" },
            { id: "nao", label: "Não tem" },
          ]}
          value={e.familia}
          onChange={(id) => set({ familia: id })}
        />
        {e.familia && e.familia !== "nao" && (
          <>
            <div className="grid gap-1.5">
              {FAMILIA_PRESETS.filter((p) => p.tipo === e.familia).map((p) => (
                <PresetRow
                  key={p.detalhe}
                  texto={p.detalhe}
                  active={e.familiaDetalhe === p.detalhe}
                  onClick={() => set({ familiaDetalhe: p.detalhe })}
                />
              ))}
            </div>
            <textarea
              value={e.familiaDetalhe}
              onChange={(ev) => set({ familiaDetalhe: ev.target.value })}
              placeholder="Quem são? Onde estão? O que ficou em aberto?"
              maxLength={400}
              rows={2}
              className="arcana-input w-full font-crimson text-base resize-none"
            />
          </>
        )}
      </section>

      {/* ── Passado ── */}
      <section className="space-y-3">
        <div>
          <span className={LABEL}>Passado</span>
          <p className={HELPER}>
            Um passado sombrio rende ótimas cenas — e talvez uma recompensa pela cabeça (quem
            decide o valor é o Juiz, nunca a biografia).
          </p>
        </div>
        <Segmented
          ariaLabel="Passado do personagem"
          options={[
            { id: "limpo", label: "Nada declarado" },
            { id: "sombrio", label: "Passado sombrio" },
          ]}
          value={e.passadoSombrio ? "sombrio" : "limpo"}
          onChange={(id) => set({ passadoSombrio: id === "sombrio" })}
        />
        {e.passadoSombrio && (
          <>
            <div className="grid gap-1.5">
              {PASSADO_PRESETS.map((p) => (
                <PresetRow
                  key={p}
                  texto={p}
                  active={e.passadoDetalhe === p}
                  onClick={() => set({ passadoDetalhe: p })}
                />
              ))}
            </div>
            <textarea
              value={e.passadoDetalhe}
              onChange={(ev) => set({ passadoDetalhe: ev.target.value })}
              placeholder="O que aconteceu? Quem sabe? O que ainda o persegue?"
              maxLength={400}
              rows={2}
              className="arcana-input w-full font-crimson text-base resize-none"
            />
          </>
        )}
      </section>

      {/* ── Facções ── */}
      <section className="space-y-3">
        <div>
          <span className={LABEL}>Relação com facções do Oeste</span>
          <p className={HELPER}>
            Não existe facção jogável em Sacramento — o laço é da história: quem ele conhece,
            deve ou odeia.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
          <button
            type="button"
            onClick={() => set({ faccaoId: "nenhuma", faccaoRelacao: "" })}
            aria-pressed={e.faccaoId === "nenhuma"}
            className={[
              "relative aspect-square overflow-hidden rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-150",
              e.faccaoId === "nenhuma"
                ? "border-arcana-gold/70 bg-arcana-gold/[0.08]"
                : "border-arcana-border bg-arcana-surface/60 hover:border-arcana-gold/40",
            ].join(" ")}
          >
            <CornerCheck active={e.faccaoId === "nenhuma"} />
            <span className="text-2xl text-arcana-text-dim" aria-hidden>
              —
            </span>
            <span className="font-cinzel text-[10px] uppercase tracking-[0.12em] text-arcana-text-dim px-1 text-center">
              Nenhuma
            </span>
          </button>
          {SACRAMENTO_FACTIONS.map((f) => {
            const active = e.faccaoId === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => set({ faccaoId: f.id })}
                aria-pressed={active}
                title={`${f.nome} — ${f.resumo}`}
                className={[
                  "group relative aspect-square overflow-hidden rounded-xl border transition-all duration-150",
                  active ? "border-arcana-gold/70" : "border-arcana-border hover:border-arcana-gold/40",
                ].join(" ")}
                style={{
                  background: EMBLEM_BG,
                  ...(active ? { boxShadow: "0 0 18px rgba(209,171,85,0.22)" } : {}),
                }}
              >
                <CornerCheck active={active} />
                {f.emblema && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={f.emblema}
                    alt={f.nome}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                  />
                )}
                <span
                  aria-hidden
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(180deg, transparent 55%, rgba(9,10,17,0.85))" }}
                />
                <span
                  className={[
                    "absolute bottom-1 left-1 right-1 text-center font-cinzel text-[10px] uppercase tracking-[0.08em] leading-tight",
                    active ? "text-arcana-gold-bright" : "text-arcana-text",
                  ].join(" ")}
                  style={{ textShadow: "0 2px 6px rgba(0,0,0,0.95)" }}
                >
                  {f.nome.replace("Gangue do ", "").replace("Gangue da ", "").replace("Comando das ", "")}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => set({ faccaoId: "outra" })}
            aria-pressed={e.faccaoId === "outra"}
            className={[
              "relative aspect-square overflow-hidden rounded-xl border flex flex-col items-center justify-center gap-1 transition-all duration-150",
              e.faccaoId === "outra"
                ? "border-arcana-gold/70 bg-arcana-gold/[0.08]"
                : "border-arcana-border bg-arcana-surface/60 hover:border-arcana-gold/40",
            ].join(" ")}
          >
            <CornerCheck active={e.faccaoId === "outra"} />
            <span className="text-2xl text-arcana-gold" aria-hidden>
              ✦
            </span>
            <span className="font-cinzel text-[10px] uppercase tracking-[0.12em] text-arcana-text-dim px-1 text-center">
              Outra
            </span>
          </button>
        </div>
        {e.faccaoId !== "nenhuma" && (
          <div className="space-y-2">
            {e.faccaoId !== "outra" && (
              <p className="font-crimson text-sm italic text-arcana-text-dim">
                {SACRAMENTO_FACTIONS.find((f) => f.id === e.faccaoId)?.resumo}
              </p>
            )}
            <input
              type="text"
              value={e.faccaoRelacao}
              onChange={(ev) => set({ faccaoRelacao: ev.target.value })}
              placeholder={
                e.faccaoId === "outra"
                  ? "Descreva o bando ou organização e a relação com ele"
                  : "Qual é a relação com essa facção?"
              }
              maxLength={160}
              className="arcana-input w-full font-crimson text-base"
            />
            <div className="grid gap-1.5 sm:grid-cols-3">
              {RELACOES_FACCAO_SUGERIDAS.map((r) => (
                <PresetRow
                  key={r}
                  texto={r}
                  active={e.faccaoRelacao === r}
                  onClick={() => set({ faccaoRelacao: r })}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Vínculos ── */}
      <section className="space-y-3">
        <div>
          <span className={LABEL}>Vínculos</span>
          <p className={HELPER}>
            Pessoas que importam: um amigo, um rival, um amor, um credor. A história dá vida a
            elas.
          </p>
        </div>
        {e.vinculos.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={v.nome}
              onChange={(ev) => setVinculo(i, "nome", ev.target.value)}
              placeholder="Nome"
              maxLength={60}
              className="arcana-input flex-1 font-crimson text-base"
            />
            <input
              type="text"
              value={v.relacao}
              onChange={(ev) => setVinculo(i, "relacao", ev.target.value)}
              placeholder="Relação (irmã, mentor, rival…)"
              maxLength={60}
              className="arcana-input flex-1 font-crimson text-base"
            />
            <button
              type="button"
              onClick={() => set({ vinculos: e.vinculos.filter((_, idx) => idx !== i) })}
              aria-label={`Remover vínculo ${v.nome || i + 1}`}
              className="arcana-btn-ghost arcana-btn-sm shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
        {e.vinculos.length < 5 && (
          <button
            type="button"
            onClick={() => set({ vinculos: [...e.vinculos, { nome: "", relacao: "" }] })}
            className="arcana-btn-ghost arcana-btn-sm"
          >
            + Adicionar vínculo
          </button>
        )}
      </section>

      {/* ── Redenção ── */}
      <section className="space-y-3">
        <div>
          <span className={LABEL}>Trilha de Redenção</span>
          <p className={HELPER}>
            O problema do passado que ele carrega — o coração de um personagem de Sacramento.
            São 6 passos; o último encerra a jornada.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {TRILHAS_REDENCAO.map((t) => {
            const active = e.redencaoTrilhaId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => set({ redencaoTrilhaId: t.id })}
                aria-pressed={active}
                className={[
                  "relative rounded-xl border p-3 text-left transition-all duration-150",
                  active
                    ? "border-arcana-gold/70 bg-arcana-gold/[0.08]"
                    : "border-arcana-border bg-arcana-surface/60 hover:border-arcana-gold/40 hover:bg-arcana-surface",
                ].join(" ")}
                style={
                  active
                    ? { boxShadow: "0 0 18px rgba(209,171,85,0.16), inset 0 1px 0 rgba(255,255,255,0.05)" }
                    : { boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }
                }
              >
                <CornerCheck active={active} />
                <span
                  className={[
                    "block font-cinzel text-[11px] uppercase tracking-[0.16em]",
                    active ? "font-bold text-arcana-gold-bright" : "text-arcana-text",
                  ].join(" ")}
                >
                  {t.nome}
                </span>
                <span className="mt-0.5 block font-crimson text-[13px] leading-snug text-arcana-text-dim">
                  {t.premissa}
                </span>
              </button>
            );
          })}
        </div>
        {e.redencaoTrilhaId && (
          <textarea
            value={e.redencaoPremissa}
            onChange={(ev) => set({ redencaoPremissa: ev.target.value })}
            placeholder={
              e.redencaoTrilhaId === "propria"
                ? "Descreva o problema do passado e como imagina a resolução final"
                : "Contexto seu para essa trilha: quem, onde, por quê? (opcional)"
            }
            maxLength={400}
            rows={2}
            className="arcana-input w-full font-crimson text-base resize-none"
          />
        )}
      </section>
    </div>
  );
}
