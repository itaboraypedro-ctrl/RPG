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

export function FactionsSection({ api }: { api: StoryHubApi }) {
  const elements = api.elementsOf("faction");
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

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
    };
    await api.addElement("faction", "gm_only", data as unknown as Record<string, unknown>);
    setBusy(null);
  }

  return (
    <div className="max-w-4xl space-y-8">
      <SectionHeader
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
        <p className="font-cinzel text-[10px] uppercase tracking-[0.35em] text-arcana-gold/70">
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

      <div className="space-y-3">
        <p className="font-cinzel text-[10px] uppercase tracking-[0.35em] text-arcana-gold/70">
          Templates canônicos (pp. 258–266)
        </p>
        <div className="space-y-2">
          {SACRAMENTO_FACTIONS.map((faction) => {
            const added = canonIds.has(faction.id);
            const isOpen = expanded === faction.id;
            return (
              <div
                key={faction.id}
                className={[
                  "rounded-sm border transition-all",
                  added
                    ? "border-arcana-gold/50 bg-arcana-gold/5"
                    : "border-arcana-border bg-arcana-surface/50",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : faction.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="font-cinzel text-sm uppercase tracking-[0.12em] text-arcana-text">
                      {faction.nome}
                    </span>
                    <span className="border border-arcana-border/60 px-1.5 py-0.5 font-cinzel text-[7px] uppercase tracking-[0.2em] text-arcana-text-dim/70">
                      {faction.categoria === "lei" ? "Lei" : "Gangue"}
                    </span>
                    <PageRef paginas={faction.paginas} />
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    {added ? (
                      <span className="font-cinzel text-[9px] uppercase tracking-[0.2em] text-arcana-gold">
                        ✓ Na campanha
                      </span>
                    ) : (
                      <GhostButton onClick={() => addCanon(faction.id)} disabled={busy === faction.id}>
                        {busy === faction.id ? "..." : "Adicionar"}
                      </GhostButton>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : faction.id)}
                      className="font-cinzel text-xs text-arcana-text-dim"
                    >
                      {isOpen ? "−" : "+"}
                    </button>
                  </div>
                </div>
                {isOpen && (
                  <div className="border-t border-arcana-border-dim px-4 py-3">
                    <p className="font-crimson text-sm italic text-arcana-text-dim">
                      {faction.resumo}
                    </p>
                    <table className="mt-2 w-full">
                      <tbody>
                        {faction.membros.map((m) => (
                          <tr key={m.papel} className="align-top">
                            <td className="whitespace-nowrap pr-3 py-1 font-cinzel text-[10px] uppercase tracking-[0.12em] text-arcana-text">
                              {m.papel}
                            </td>
                            <td className="whitespace-nowrap pr-3 py-1 font-crimson text-xs text-arcana-text-dim">
                              {m.tipo} · NdC {m.ndc}
                            </td>
                            <td className="py-1 font-crimson text-xs text-arcana-text-dim/70">
                              {[
                                ...m.habilidades,
                                ...(m.habilidadesPendentes ?? []).map((h) => `${h} (sem verbete — decisão do Juiz)`),
                              ].join(", ") || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
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
            <p className="mt-1 font-crimson text-xs text-arcana-text-dim/70">
              <span className="font-cinzel text-[8px] uppercase tracking-[0.2em] text-arcana-gold/60">Agenda · </span>
              {data.agenda}
            </p>
          )}
          {data.ameaca && (
            <p className="mt-1 font-crimson text-xs text-arcana-text-dim/70">
              <span className="font-cinzel text-[8px] uppercase tracking-[0.2em] text-arcana-gold/60">Ameaça · </span>
              {data.ameaca}
            </p>
          )}
          {data.notasDoJuiz && (
            <p className="mt-2 border-l-2 border-red-900/50 pl-2 font-crimson text-xs italic text-red-200/60">
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
