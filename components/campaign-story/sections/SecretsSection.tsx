"use client";

import { useState } from "react";
import type { CampaignElement } from "@/lib/types";
import type { CampaignSecretNoteData } from "@/lib/rulesets/sacramento/types";
import type { StoryHubApi } from "../StoryHub";
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

export function SecretsSection({ api }: { api: StoryHubApi }) {
  const elements = api.elementsOf("secret_note");
  const [creating, setCreating] = useState(false);

  return (
    <div className="max-w-3xl space-y-8">
      <SectionHeader
        title="Segredos do Juiz"
        description="Bastidores da campanha: verdades por trás de cultos, identidades encenadas, planos de facções. Estas notas nunca são enviadas aos jogadores — nem aparecem em recapitulações sem sua autorização."
        action={
          <GoldButton onClick={() => setCreating((v) => !v)}>
            {creating ? "Fechar" : "+ Segredo"}
          </GoldButton>
        }
      />

      {creating && <NewSecretForm api={api} onDone={() => setCreating(false)} />}

      {elements.length === 0 && !creating ? (
        <EmptyHint>Nenhum segredo anotado. O Oeste agradece a discrição.</EmptyHint>
      ) : (
        <div className="space-y-3">
          {elements.map((el) => (
            <SecretCard key={el.id} element={el} api={api} />
          ))}
        </div>
      )}
    </div>
  );
}

function NewSecretForm({ api, onDone }: { api: StoryHubApi; onDone: () => void }) {
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (titulo.trim().length < 2 || saving) return;
    setSaving(true);
    const data: CampaignSecretNoteData = { titulo: titulo.trim(), texto: texto.trim() };
    const created = await api.addElement(
      "secret_note",
      "gm_only",
      data as unknown as Record<string, unknown>,
    );
    setSaving(false);
    if (created) onDone();
  }

  return (
    <div className="space-y-3 rounded-sm border border-red-900/40 bg-arcana-surface p-4">
      <Field label="Título">
        <TextField value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={160} autoFocus />
      </Field>
      <Field label="Segredo">
        <TextArea value={texto} onChange={(e) => setTexto(e.target.value)} rows={4} maxLength={4000} />
      </Field>
      <div className="flex justify-end gap-3">
        <GhostButton onClick={onDone}>Cancelar</GhostButton>
        <GoldButton onClick={submit} disabled={titulo.trim().length < 2 || saving}>
          {saving ? "Guardando..." : "Guardar segredo"}
        </GoldButton>
      </div>
    </div>
  );
}

function SecretCard({ element, api }: { element: CampaignElement; api: StoryHubApi }) {
  const data = element.data as CampaignSecretNoteData;
  const [editing, setEditing] = useState(false);
  const [texto, setTexto] = useState(data.texto);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await api.patchElement(element.id, {
      data: { ...data, texto: texto.trim() } as unknown as Record<string, unknown>,
    });
    setSaving(false);
    setEditing(false);
  }

  return (
    <ElementCard>
      <div className="border-l-2 border-red-900/50 pl-3">
        <h3 className="font-cinzel text-sm uppercase tracking-[0.15em] text-red-200/80">
          🔒 {data.titulo}
        </h3>
        {editing ? (
          <div className="mt-2">
            <TextArea value={texto} onChange={(e) => setTexto(e.target.value)} rows={4} maxLength={4000} />
          </div>
        ) : (
          <p className="mt-1 whitespace-pre-wrap font-crimson text-sm italic text-arcana-text-dim">
            {data.texto}
          </p>
        )}
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
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
    </ElementCard>
  );
}
