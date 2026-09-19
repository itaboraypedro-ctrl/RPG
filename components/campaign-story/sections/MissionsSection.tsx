"use client";

import { useState } from "react";
import type { CampaignElement } from "@/lib/types";
import type { CampaignMissionData } from "@/lib/rulesets/sacramento/types";
import {
  formatCard,
  generateMission,
  type GeneratedMission,
} from "@/lib/rulesets/sacramento/generators";
import type { StoryHubApi } from "../StoryHub";
import { AiAssist } from "../AiAssist";
import {
  ElementCard,
  EmptyHint,
  Field,
  GhostButton,
  GoldButton,
  SectionHeader,
  TextArea,
  TextField,
  VisibilityBadge,
} from "../ui";

const EMPTY_MISSION: CampaignMissionData = { titulo: "" };

export function MissionsSection({ api }: { api: StoryHubApi }) {
  const elements = api.elementsOf("mission");
  const [draft, setDraft] = useState<CampaignMissionData | null>(null);
  const [lastDraw, setLastDraw] = useState<GeneratedMission | null>(null);

  function drawMission() {
    const gen = generateMission();
    setLastDraw(gen);
    setDraft({
      titulo: `${gen.pedido} ${gen.vinculo.toLowerCase()}`,
      objetivo: `${gen.pedido} — ${gen.vinculo.toLowerCase()} de alguém importante.`,
      motivo: `Reviravolta sorteada: ${gen.reviravolta.toLowerCase()}.`,
      cartasGeradas: gen.cartas,
    });
  }

  return (
    <div className="max-w-4xl space-y-8">
      <SectionHeader
        title="Missões"
        description="Trabalhos, pedidos e encrencas. O gerador de três cartas do livro (p. 104) sorteia pedido, vínculo e reviravolta — o Juiz costura a combinação numa missão coerente."
        action={
          <div className="flex gap-2">
            <GhostButton onClick={drawMission}>🂠 Sacar 3 cartas</GhostButton>
            <GoldButton onClick={() => setDraft(draft ? null : EMPTY_MISSION)}>
              {draft ? "Fechar" : "+ Missão"}
            </GoldButton>
          </div>
        }
      />

      {lastDraw && draft && (
        <div className="arcana-gilded rounded-sm px-4 py-3">
          <p className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold">
            Sorteio (p. 104) — naipes ignorados
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4 font-crimson text-sm text-arcana-text-dim">
            <Seed label="Pedido" card={formatCard(lastDraw.cartas.pedido)} value={lastDraw.pedido} />
            <Seed label="Vínculo" card={formatCard(lastDraw.cartas.vinculo)} value={lastDraw.vinculo} />
            <Seed label="Reviravolta" card={formatCard(lastDraw.cartas.reviravolta)} value={lastDraw.reviravolta} />
          </div>
        </div>
      )}

      {draft && (
        <MissionForm
          initial={draft}
          onCancel={() => {
            setDraft(null);
            setLastDraw(null);
          }}
          onSave={async (data) => {
            const created = await api.addElement(
              "mission",
              "gm_only",
              data as unknown as Record<string, unknown>,
            );
            if (created) {
              setDraft(null);
              setLastDraw(null);
            }
          }}
        />
      )}

      {elements.length === 0 && !draft ? (
        <EmptyHint>Nenhuma missão ainda. Crie uma ou saque três cartas.</EmptyHint>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {elements.map((el) => (
            <MissionCard key={el.id} element={el} api={api} />
          ))}
        </div>
      )}

      {api.aiEnabled && (
        <AiAssist
          sessionId={api.sessionId}
          section="mission"
          title="Propostas de missões com IA"
          onApply={async (p) => {
            const data: CampaignMissionData = {
              titulo: p.titulo,
              proponente: p.proponente,
              objetivo: p.objetivo,
              motivo: p.motivo,
              recompensa: p.recompensa,
              consequencias: p.consequencias,
            };
            const created = await api.addElement(
              "mission",
              "gm_only",
              data as unknown as Record<string, unknown>,
            );
            return created !== null;
          }}
        />
      )}
    </div>
  );
}

function Seed({ label, card, value }: { label: string; card: string; value: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-text-dim">{label}</span>
      <span className="rounded-sm border border-arcana-border bg-arcana-bg px-1.5 py-0.5 font-cinzel text-[10px] text-arcana-gold">{card}</span>
      <span className="text-arcana-text">{value}</span>
    </span>
  );
}

function MissionForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: CampaignMissionData;
  onCancel: () => void;
  onSave: (data: CampaignMissionData) => Promise<void>;
}) {
  const [data, setData] = useState<CampaignMissionData>(initial);
  const [saving, setSaving] = useState(false);

  const update = (partial: Partial<CampaignMissionData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  async function submit() {
    if (data.titulo.trim().length < 2 || saving) return;
    setSaving(true);
    await onSave({ ...data, titulo: data.titulo.trim() });
    setSaving(false);
  }

  return (
    <div className="space-y-4 rounded-sm border border-arcana-gold/30 bg-arcana-surface p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Título">
          <TextField value={data.titulo} onChange={(e) => update({ titulo: e.target.value })} maxLength={160} autoFocus />
        </Field>
        <Field label="Proponente" hint="Quem pede — NPC, facção ou circunstância.">
          <TextField value={data.proponente ?? ""} onChange={(e) => update({ proponente: e.target.value })} maxLength={120} />
        </Field>
        <Field label="Local">
          <TextField value={data.local ?? ""} onChange={(e) => update({ local: e.target.value })} maxLength={120} />
        </Field>
        <Field label="Envolvidos">
          <TextField value={data.envolvidos ?? ""} onChange={(e) => update({ envolvidos: e.target.value })} maxLength={300} />
        </Field>
      </div>

      <Field label="Objetivo">
        <TextArea value={data.objetivo ?? ""} onChange={(e) => update({ objetivo: e.target.value })} rows={2} maxLength={1000} />
      </Field>
      <Field label="Motivo / contexto">
        <TextArea value={data.motivo ?? ""} onChange={(e) => update({ motivo: e.target.value })} rows={2} maxLength={1000} />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Recompensa" hint="Dinheiro, objeto ou serviço — quando existir.">
          <TextField value={data.recompensa ?? ""} onChange={(e) => update({ recompensa: e.target.value })} maxLength={200} />
        </Field>
        <Field
          label="Prazo ficcional"
          hint="Só se houver fonte ou decisão sua — missão comum não herda o prazo de uma semana das missões da Base."
        >
          <TextField value={data.prazoFiccional ?? ""} onChange={(e) => update({ prazoFiccional: e.target.value })} maxLength={120} />
        </Field>
      </div>

      <Field label="Critérios de conclusão / evidências de progresso">
        <TextArea value={data.criteriosDeConclusao ?? ""} onChange={(e) => update({ criteriosDeConclusao: e.target.value })} rows={2} maxLength={1000} />
      </Field>
      <Field label="Vínculo" hint="Redenção de um PJ, Base ou facção, se houver.">
        <TextField value={data.vinculo ?? ""} onChange={(e) => update({ vinculo: e.target.value })} maxLength={200} />
      </Field>
      <Field label="Consequências" hint="De sucesso, fracasso e abandono.">
        <TextArea value={data.consequencias ?? ""} onChange={(e) => update({ consequencias: e.target.value })} rows={2} maxLength={1000} />
      </Field>

      <div className="flex justify-end gap-3">
        <GhostButton onClick={onCancel}>Cancelar</GhostButton>
        <GoldButton onClick={submit} disabled={data.titulo.trim().length < 2 || saving}>
          {saving ? "Salvando..." : "Salvar missão"}
        </GoldButton>
      </div>
    </div>
  );
}

function MissionCard({ element, api }: { element: CampaignElement; api: StoryHubApi }) {
  const data = element.data as CampaignMissionData;
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="md:col-span-2">
        <MissionForm
          initial={data}
          onCancel={() => setEditing(false)}
          onSave={async (next) => {
            await api.patchElement(element.id, {
              data: next as unknown as Record<string, unknown>,
            });
            setEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <ElementCard>
      <h3 className="font-cinzel text-sm uppercase tracking-[0.15em] text-arcana-gold-bright">
        {data.titulo}
      </h3>
      <p className="mt-0.5 font-crimson text-xs text-arcana-text-dim">
        {[data.proponente, data.local, data.recompensa && `Recompensa: ${data.recompensa}`]
          .filter(Boolean)
          .join(" · ")}
      </p>
      {data.objetivo && (
        <p className="mt-2 font-crimson text-sm text-arcana-text-dim line-clamp-2">{data.objetivo}</p>
      )}
      {data.consequencias && (
        <p className="mt-1 font-crimson text-xs italic text-arcana-text-dim line-clamp-2">
          {data.consequencias}
        </p>
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
          <GhostButton onClick={() => setEditing(true)}>Editar</GhostButton>
          <GhostButton danger onClick={() => api.removeElement(element.id)}>
            Remover
          </GhostButton>
        </div>
      </div>
    </ElementCard>
  );
}
