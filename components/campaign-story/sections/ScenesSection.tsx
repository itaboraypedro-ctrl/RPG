"use client";

import { useState } from "react";
import type { CampaignElement } from "@/lib/types";
import type { CampaignSceneData } from "@/lib/rulesets/sacramento/types";
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
} from "../ui";

const EMPTY_SCENE: CampaignSceneData = { titulo: "" };

export function ScenesSection({ api }: { api: StoryHubApi }) {
  const elements = api.elementsOf("scene");
  const [creating, setCreating] = useState(false);

  return (
    <div className="max-w-4xl space-y-8">
      <SectionHeader
        title="Cenas"
        description="Situações preparadas: lugar, participantes, fatos, rumores e segredos. Nenhum campo é obrigatório para começar uma cena — e a descrição nunca decide os pensamentos ou as ações dos personagens."
        action={
          <GoldButton onClick={() => setCreating((v) => !v)}>
            {creating ? "Fechar" : "+ Cena"}
          </GoldButton>
        }
      />

      {creating && (
        <SceneForm
          initial={EMPTY_SCENE}
          onCancel={() => setCreating(false)}
          onSave={async (data) => {
            const created = await api.addElement(
              "scene",
              "gm_only",
              data as unknown as Record<string, unknown>,
            );
            if (created) setCreating(false);
          }}
        />
      )}

      {elements.length === 0 && !creating ? (
        <EmptyHint>Nenhuma cena preparada ainda.</EmptyHint>
      ) : (
        <div className="space-y-3">
          {elements.map((el) => (
            <SceneCard key={el.id} element={el} api={api} />
          ))}
        </div>
      )}

      {api.aiEnabled && (
        <AiAssist
          sessionId={api.sessionId}
          section="scene"
          title="Propostas de cenas com IA"
          onApply={async (p) => {
            const data: CampaignSceneData = {
              titulo: p.titulo,
              lugar: p.lugar,
              descricaoPublica: p.descricaoPublica,
              fatosVerdadeiros: p.fatosVerdadeiros,
              rumores: p.rumores,
              testesPossiveis: p.testesPossiveis,
              consequenciasPossiveis: p.consequenciasPossiveis,
            };
            const created = await api.addElement(
              "scene",
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

function SceneForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: CampaignSceneData;
  onCancel: () => void;
  onSave: (data: CampaignSceneData) => Promise<void>;
}) {
  const [data, setData] = useState<CampaignSceneData>(initial);
  const [saving, setSaving] = useState(false);

  const update = (partial: Partial<CampaignSceneData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  async function submit() {
    if (data.titulo.trim().length < 2 || saving) return;
    setSaving(true);
    await onSave({ ...data, titulo: data.titulo.trim() });
    setSaving(false);
  }

  return (
    <div className="space-y-4 rounded-sm border border-arcana-gold/30 bg-arcana-surface p-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Título">
          <TextField value={data.titulo} onChange={(e) => update({ titulo: e.target.value })} maxLength={160} autoFocus />
        </Field>
        <Field label="Lugar">
          <TextField value={data.lugar ?? ""} onChange={(e) => update({ lugar: e.target.value })} maxLength={120} />
        </Field>
        <Field label="Momento">
          <TextField value={data.momento ?? ""} onChange={(e) => update({ momento: e.target.value })} maxLength={120} placeholder="Anoitecer, durante a festa..." />
        </Field>
      </div>

      <Field label="Participantes">
        <TextField value={data.participantes ?? ""} onChange={(e) => update({ participantes: e.target.value })} maxLength={300} placeholder="NPCs presentes, facções envolvidas..." />
      </Field>

      <Field label="Descrição pública" hint="O que os jogadores percebem ao entrar na cena.">
        <TextArea value={data.descricaoPublica ?? ""} onChange={(e) => update({ descricaoPublica: e.target.value })} rows={3} maxLength={2000} />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="🔒 Fatos verdadeiros">
          <TextArea value={data.fatosVerdadeiros ?? ""} onChange={(e) => update({ fatosVerdadeiros: e.target.value })} rows={3} maxLength={2000} />
        </Field>
        <Field label="Rumores" hint="O que se diz — verdadeiro ou não.">
          <TextArea value={data.rumores ?? ""} onChange={(e) => update({ rumores: e.target.value })} rows={3} maxLength={2000} />
        </Field>
      </div>

      <Field label="🔒 Segredos do Juiz nesta cena">
        <TextArea value={data.segredosDoJuiz ?? ""} onChange={(e) => update({ segredosDoJuiz: e.target.value })} rows={2} maxLength={2000} />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Elementos interativos" hint="Objetos, passagens, oportunidades e perigos com indícios perceptíveis.">
          <TextArea value={data.elementosInterativos ?? ""} onChange={(e) => update({ elementosInterativos: e.target.value })} rows={2} maxLength={1000} />
        </Field>
        <Field label="Testes possíveis" hint="Possíveis — não automaticamente exigidos. Solução plausível pode dispensar rolagem.">
          <TextArea value={data.testesPossiveis ?? ""} onChange={(e) => update({ testesPossiveis: e.target.value })} rows={2} maxLength={1000} />
        </Field>
      </div>

      <Field label="Consequências possíveis" hint="Sem solução obrigatória — o que pode acontecer conforme as escolhas.">
        <TextArea value={data.consequenciasPossiveis ?? ""} onChange={(e) => update({ consequenciasPossiveis: e.target.value })} rows={2} maxLength={1000} />
      </Field>

      <div className="flex justify-end gap-3">
        <GhostButton onClick={onCancel}>Cancelar</GhostButton>
        <GoldButton onClick={submit} disabled={data.titulo.trim().length < 2 || saving}>
          {saving ? "Salvando..." : "Salvar cena"}
        </GoldButton>
      </div>
    </div>
  );
}

function SceneCard({ element, api }: { element: CampaignElement; api: StoryHubApi }) {
  const data = element.data as CampaignSceneData;
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);

  if (editing) {
    return (
      <SceneForm
        initial={data}
        onCancel={() => setEditing(false)}
        onSave={async (next) => {
          await api.patchElement(element.id, {
            data: next as unknown as Record<string, unknown>,
          });
          setEditing(false);
        }}
      />
    );
  }

  return (
    <ElementCard>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <h3 className="truncate font-cinzel text-sm uppercase tracking-[0.15em] text-arcana-gold-bright">
            {data.titulo}
          </h3>
          <p className="mt-0.5 font-crimson text-xs text-arcana-text-dim">
            {[data.lugar, data.momento, data.participantes].filter(Boolean).join(" · ")}
          </p>
        </div>
        <span className="shrink-0 font-cinzel text-xs text-arcana-text-dim">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-2 border-t border-arcana-border-dim pt-3">
          {data.descricaoPublica && <SceneRow label="Descrição pública" text={data.descricaoPublica} />}
          {data.fatosVerdadeiros && <SceneRow label="🔒 Fatos verdadeiros" text={data.fatosVerdadeiros} secret />}
          {data.rumores && <SceneRow label="Rumores" text={data.rumores} />}
          {data.segredosDoJuiz && <SceneRow label="🔒 Segredos" text={data.segredosDoJuiz} secret />}
          {data.elementosInterativos && <SceneRow label="Interativos" text={data.elementosInterativos} />}
          {data.testesPossiveis && <SceneRow label="Testes possíveis" text={data.testesPossiveis} />}
          {data.consequenciasPossiveis && <SceneRow label="Consequências" text={data.consequenciasPossiveis} />}
        </div>
      )}

      <div className="mt-3 flex items-center justify-end gap-2">
        <GhostButton onClick={() => setEditing(true)}>Editar</GhostButton>
        <GhostButton danger onClick={() => api.removeElement(element.id)}>
          Remover
        </GhostButton>
      </div>
    </ElementCard>
  );
}

function SceneRow({ label, text, secret }: { label: string; text: string; secret?: boolean }) {
  return (
    <div className={secret ? "border-l-2 border-red-900/50 pl-2" : ""}>
      <p className="font-cinzel text-[10px] uppercase tracking-[0.25em] text-arcana-gold">{label}</p>
      <p className={`font-crimson text-sm ${secret ? "text-red-200/90 italic" : "text-arcana-text-dim"}`}>
        {text}
      </p>
    </div>
  );
}
