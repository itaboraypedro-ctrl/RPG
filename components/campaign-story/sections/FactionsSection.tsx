"use client";

import { useState } from "react";
import type { CampaignElement } from "@/lib/types";
import type { CampaignFactionData } from "@/lib/rulesets/sacramento/types";
import { SACRAMENTO_FACTIONS } from "@/lib/rulesets/sacramento/factions";
import type { StoryHubApi } from "../StoryHub";
import {
  ElementCard,
  EmptyHint,
  Field,
  GhostButton,
  GoldButton,
  OriginBadge,
  PageRef,
  SectionHeader,
  TextArea,
  TextField,
  VisibilityBadge,
  hintClass,
} from "../ui";

// Fundo de plaqueta dos brasões — casa com o fundo escuro pintado nas artes.
const EMBLEM_BG =
  "radial-gradient(circle at 50% 44%, #191632 0%, #0d0d1a 58%, #0b0b14 100%)";

export function FactionsSection({ api }: { api: StoryHubApi }) {
  const elements = api.elementsOf("faction");
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>(SACRAMENTO_FACTIONS[0].id);

  const selectedFaction =
    SACRAMENTO_FACTIONS.find((f) => f.id === selectedId) ?? SACRAMENTO_FACTIONS[0];

  const canonIds = new Set(
    elements.map((el) => (el.data as CampaignFactionData).canonId).filter(Boolean),
  );

  async function addCanon(factionId: string) {
    const faction = SACRAMENTO_FACTIONS.find((f) => f.id === factionId);
    if (!faction || canonIds.has(faction.id)) return;
    setBusy(factionId);
    const data: CampaignFactionData = {
      nome: faction.nome,
      origem: "canon",
      canonId: faction.id,
      resumo: faction.resumo,
      paginas: faction.paginas,
      emblema: faction.emblema,
    };
    await api.addElement("faction", "gm_only", data as unknown as Record<string, unknown>);
    setBusy(null);
  }

  return (
    <div className="max-w-5xl space-y-8">
      <SectionHeader
        imageSrc="/story/headers/faccoes.webp"
        title="Facções & Ameaças"
        description="Gangues, cultos e forças da lei que movem a campanha. Templates canônicos trazem a composição publicada (tipos e NdC) — quantidades em cena, armas e objetivos são sempre do Juiz."
        action={
          <GoldButton onClick={() => setCreating((v) => !v)}>
            {creating ? "Fechar" : "+ Facção própria"}
          </GoldButton>
        }
      />

      {creating && <NewFactionForm api={api} onDone={() => setCreating(false)} />}

      <div className="space-y-3">
        <p className="font-cinzel text-[10px] uppercase tracking-[0.35em] text-arcana-gold">
          Na campanha
        </p>
        {elements.length === 0 ? (
          <EmptyHint>Nenhuma facção ainda. Escolha um template canônico ou crie a sua.</EmptyHint>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {elements.map((el) => (
              <FactionCard key={el.id} element={el} api={api} />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <p className="font-cinzel text-[10px] uppercase tracking-[0.35em] text-arcana-gold">
          Templates canônicos (pp. 258–266)
        </p>

        {/* Parede de brasões */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SACRAMENTO_FACTIONS.map((faction) => {
            const added = canonIds.has(faction.id);
            const isSelected = selectedId === faction.id;
            return (
              <button
                key={faction.id}
                type="button"
                onClick={() => setSelectedId(faction.id)}
                aria-pressed={isSelected}
                className={[
                  "group relative overflow-hidden rounded-sm border text-left transition-all duration-200",
                  isSelected
                    ? "border-arcana-gold"
                    : "border-arcana-border-dim hover:border-arcana-gold/50",
                ].join(" ")}
                style={
                  isSelected
                    ? { boxShadow: "0 0 22px rgba(209,171,85,0.25), inset 0 1px 0 rgba(255,255,255,0.05)" }
                    : undefined
                }
              >
                <div className="relative aspect-square" style={{ background: EMBLEM_BG }}>
                  {faction.emblema && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={faction.emblema}
                      alt={faction.nome}
                      loading="lazy"
                      className={[
                        "absolute inset-0 h-full w-full object-cover transition-transform duration-300",
                        isSelected ? "scale-[1.04]" : "group-hover:scale-[1.05]",
                      ].join(" ")}
                    />
                  )}
                  {/* Brilho de tocha no hover */}
                  <div
                    aria-hidden
                    className={[
                      "pointer-events-none absolute inset-0 transition-opacity duration-300",
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-70",
                    ].join(" ")}
                    style={{
                      background:
                        "radial-gradient(circle at 50% 40%, rgba(209,171,85,0.16), transparent 62%)",
                    }}
                  />
                  {added && (
                    <span
                      aria-hidden
                      className="absolute -right-px -top-px h-7 w-7"
                      style={{ background: "linear-gradient(225deg, #d1ab55 50%, transparent 50%)" }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="absolute right-[2px] top-[2px] h-3 w-3"
                        fill="none"
                        stroke="#1c1206"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 12.5l5 5L20 6.5" />
                      </svg>
                    </span>
                  )}
                </div>
                <div
                  className={[
                    "border-t px-2 py-2 text-center transition-colors",
                    isSelected
                      ? "border-arcana-gold/40 bg-arcana-gold/[0.08]"
                      : "border-arcana-border-dim bg-arcana-surface/70",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "block truncate font-cinzel text-[10px] uppercase tracking-[0.14em]",
                      isSelected ? "font-bold text-arcana-gold-bright" : "text-arcana-text",
                    ].join(" ")}
                  >
                    {faction.nome}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dossiê da facção selecionada */}
        <div className="overflow-hidden rounded-sm border border-arcana-gold/30 bg-arcana-surface/60 sm:flex">
          <div
            className="relative mx-auto aspect-square w-full max-w-72 shrink-0 sm:mx-0 sm:w-72 sm:max-w-none"
            style={{ background: EMBLEM_BG }}
          >
            {selectedFaction.emblema && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedFaction.emblema}
                alt={selectedFaction.nome}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-3 border-t border-arcana-border-dim p-5 sm:border-l sm:border-t-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="arcana-heading text-xl tracking-[0.14em]">
                  {selectedFaction.nome}
                </h3>
                <div className="arcana-heading-bar w-32" />
              </div>
              <div className="flex items-center gap-2">
                <span className="border border-arcana-border/60 px-1.5 py-0.5 font-cinzel text-[9px] uppercase tracking-[0.2em] text-arcana-text-dim">
                  {selectedFaction.categoria === "lei" ? "Lei" : "Gangue"}
                </span>
                <PageRef paginas={selectedFaction.paginas} />
              </div>
            </div>

            <p className="font-crimson text-sm italic text-arcana-text-dim">
              {selectedFaction.resumo}
            </p>

            <table className="w-full">
              <tbody>
                {selectedFaction.membros.map((m) => (
                  <tr key={m.papel} className="align-top">
                    <td className="whitespace-nowrap pr-3 py-1 font-cinzel text-[10px] uppercase tracking-[0.12em] text-arcana-text">
                      {m.papel}
                    </td>
                    <td className="whitespace-nowrap pr-3 py-1 font-crimson text-xs text-arcana-text-dim">
                      {m.tipo} · NdC {m.ndc}
                    </td>
                    <td className="py-1 font-crimson text-xs text-arcana-text-dim">
                      {[
                        ...m.habilidades,
                        ...(m.habilidadesPendentes ?? []).map(
                          (h) => `${h} (sem verbete — decisão do Juiz)`,
                        ),
                      ].join(", ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-1">
              {canonIds.has(selectedFaction.id) ? (
                <span className="font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-gold">
                  ✓ Na campanha
                </span>
              ) : (
                <GoldButton
                  onClick={() => addCanon(selectedFaction.id)}
                  disabled={busy === selectedFaction.id}
                >
                  {busy === selectedFaction.id ? "Adicionando..." : "Adicionar à campanha"}
                </GoldButton>
              )}
            </div>
          </div>
        </div>

        <p className={hintClass}>
          &ldquo;Dedo Furioso&rdquo; e &ldquo;Artes Marciais&rdquo; aparecem em fichas publicadas mas
          não têm verbete entre as 30 habilidades — ficam registradas como pendência
          para decisão do Juiz, nunca oferecidas a personagens de jogador.
        </p>
      </div>
    </div>
  );
}

function NewFactionForm({ api, onDone }: { api: StoryHubApi; onDone: () => void }) {
  const [nome, setNome] = useState("");
  const [resumo, setResumo] = useState("");
  const [agenda, setAgenda] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (nome.trim().length < 2 || saving) return;
    setSaving(true);
    const data: CampaignFactionData = {
      nome: nome.trim(),
      origem: "campanha",
      resumo: resumo.trim() || undefined,
      agenda: agenda.trim() || undefined,
    };
    const created = await api.addElement(
      "faction",
      "gm_only",
      data as unknown as Record<string, unknown>,
    );
    setSaving(false);
    if (created) onDone();
  }

  return (
    <div className="space-y-4 rounded-sm border border-arcana-gold/30 bg-arcana-surface p-5">
      <p className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold">
        Nova facção da campanha
      </p>
      <Field label="Nome">
        <TextField value={nome} onChange={(e) => setNome(e.target.value)} maxLength={120} autoFocus />
      </Field>
      <Field label="Resumo">
        <TextArea value={resumo} onChange={(e) => setResumo(e.target.value)} rows={2} maxLength={1000} />
      </Field>
      <Field label="Agenda / ameaça" hint="O que a facção quer e o que faz enquanto o bando não age.">
        <TextArea value={agenda} onChange={(e) => setAgenda(e.target.value)} rows={2} maxLength={1000} />
      </Field>
      <div className="flex justify-end gap-3">
        <GhostButton onClick={onDone}>Cancelar</GhostButton>
        <GoldButton onClick={submit} disabled={nome.trim().length < 2 || saving}>
          {saving ? "Criando..." : "Criar facção"}
        </GoldButton>
      </div>
    </div>
  );
}

function FactionCard({ element, api }: { element: CampaignElement; api: StoryHubApi }) {
  const data = element.data as CampaignFactionData;
  const [editing, setEditing] = useState(false);
  const [agenda, setAgenda] = useState(data.agenda ?? "");
  const [ameaca, setAmeaca] = useState(data.ameaca ?? "");
  const [notas, setNotas] = useState(data.notasDoJuiz ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await api.patchElement(element.id, {
      data: {
        ...data,
        agenda: agenda.trim() || undefined,
        ameaca: ameaca.trim() || undefined,
        notasDoJuiz: notas.trim() || undefined,
      } as unknown as Record<string, unknown>,
    });
    setSaving(false);
    setEditing(false);
  }

  return (
    <ElementCard>
      {/* Plaqueta do brasão — sangra até as bordas da carta */}
      {data.emblema && (
        <div
          className="relative -mx-4 -mt-4 mb-3 h-48 overflow-hidden rounded-t-[3px] border-b border-arcana-border-dim"
          style={{ background: EMBLEM_BG }}
        >
          {/* O próprio brasão, ampliado e desfocado, forra a faixa inteira */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.emblema}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-150 object-cover opacity-60 blur-2xl saturate-125"
          />
          {/* Medalhão nítido por cima, bordas laterais fundidas por máscara */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.emblema}
            alt={data.nome}
            loading="lazy"
            className="absolute left-1/2 top-1/2 h-full -translate-x-1/2 -translate-y-1/2"
            style={{
              maskImage:
                "linear-gradient(90deg, transparent 0%, black 20%, black 80%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0%, black 20%, black 80%, transparent 100%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(209,171,85,0.10), transparent 60%)",
              boxShadow: "inset 0 -16px 26px rgba(11,11,20,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <h3 className="truncate font-cinzel text-sm uppercase tracking-[0.15em] text-arcana-gold-bright">
            {data.nome}
          </h3>
          <OriginBadge origem={data.origem} />
        </div>
        <PageRef paginas={data.paginas} />
      </div>

      {!editing ? (
        <>
          {data.resumo && (
            <p className="mt-2 font-crimson text-sm text-arcana-text-dim">{data.resumo}</p>
          )}
          {data.agenda && (
            <p className="mt-1 font-crimson text-xs text-arcana-text-dim">
              <span className="font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-gold">Agenda · </span>
              {data.agenda}
            </p>
          )}
          {data.ameaca && (
            <p className="mt-1 font-crimson text-xs text-arcana-text-dim">
              <span className="font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-gold">Ameaça · </span>
              {data.ameaca}
            </p>
          )}
          {data.notasDoJuiz && (
            <p className="mt-2 border-l-2 border-red-900/50 pl-2 font-crimson text-xs italic text-red-200/90">
              🔒 {data.notasDoJuiz}
            </p>
          )}
        </>
      ) : (
        <div className="mt-3 space-y-3">
          <Field label="Agenda">
            <TextArea value={agenda} onChange={(e) => setAgenda(e.target.value)} rows={2} maxLength={1000} />
          </Field>
          <Field label="Ameaça em curso">
            <TextArea value={ameaca} onChange={(e) => setAmeaca(e.target.value)} rows={2} maxLength={1000} />
          </Field>
          <Field label="Notas do Juiz">
            <TextArea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} maxLength={1000} />
          </Field>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <VisibilityBadge
          visibility={element.visibility}
          onToggle={() =>
            api.patchElement(element.id, {
              visibility: element.visibility === "gm_only" ? "public" : "gm_only",
            })
          }
        />
        <div className="flex gap-2">
          {editing ? (
            <>
              <GhostButton onClick={() => setEditing(false)}>Cancelar</GhostButton>
              <GhostButton onClick={save} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </GhostButton>
            </>
          ) : (
            <>
              <GhostButton onClick={() => setEditing(true)}>Editar</GhostButton>
              <GhostButton danger onClick={() => api.removeElement(element.id)}>
                Remover
              </GhostButton>
            </>
          )}
        </div>
      </div>
    </ElementCard>
  );
}
