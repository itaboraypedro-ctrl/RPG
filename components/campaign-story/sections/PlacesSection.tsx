"use client";

import { useState } from "react";
import type { CampaignElement } from "@/lib/types";
import type { CampaignPlaceData } from "@/lib/rulesets/sacramento/types";
import { SACRAMENTO_PLACES } from "@/lib/rulesets/sacramento/places";
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

export function PlacesSection({ api }: { api: StoryHubApi }) {
  const elements = api.elementsOf("place");
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const canonIdsInCampaign = new Set(
    elements
      .map((el) => (el.data as CampaignPlaceData).canonId)
      .filter(Boolean),
  );

  async function addCanon(placeId: string) {
    const place = SACRAMENTO_PLACES.find((p) => p.id === placeId);
    if (!place || canonIdsInCampaign.has(place.id)) return;
    setBusy(placeId);
    const data: CampaignPlaceData = {
      nome: place.nome,
      origem: "canon",
      canonId: place.id,
      descricao: place.caracteristicas,
      conflitos: place.conflitos,
      paginas: place.paginas,
    };
    await api.addElement("place", "gm_only", data as unknown as Record<string, unknown>);
    setBusy(null);
  }

  return (
    <div className="max-w-4xl space-y-8">
      <SectionHeader
        title="Lugares"
        description="Onde a campanha acontece. Adicione lugares do cânone (com referência de página) ou crie os seus — criações da campanha nunca alegam página do livro."
        action={
          <GoldButton onClick={() => setCreating((v) => !v)}>
            {creating ? "Fechar" : "+ Lugar próprio"}
          </GoldButton>
        }
      />

      {creating && (
        <NewPlaceForm
          api={api}
          onDone={() => setCreating(false)}
        />
      )}

      {/* Lugares na campanha */}
      <div className="space-y-3">
        <p className="font-cinzel text-[10px] uppercase tracking-[0.35em] text-arcana-gold">
          Na campanha
        </p>
        {elements.length === 0 ? (
          <EmptyHint>
            Nenhum lugar ainda. Escolha no cânone abaixo ou crie um lugar próprio.
          </EmptyHint>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {elements.map((el) => (
              <PlaceCard key={el.id} element={el} api={api} />
            ))}
          </div>
        )}
      </div>

      {/* Galeria canônica */}
      <div className="space-y-3">
        <p className="font-cinzel text-[10px] uppercase tracking-[0.35em] text-arcana-gold">
          Cânone do Oeste (Doc. cap. 4 — guia condensado)
        </p>
        <p className={hintClass}>
          Para importar detalhes além deste resumo, consulte a página indicada no
          livro em vez de inventar o dado como canônico.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {SACRAMENTO_PLACES.map((place) => {
            const added = canonIdsInCampaign.has(place.id);
            return (
              <div
                key={place.id}
                className={[
                  "rounded-sm border p-4 transition-all",
                  added
                    ? "border-arcana-gold/50 bg-arcana-gold/5"
                    : "border-arcana-border bg-arcana-surface/50",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-cinzel text-sm uppercase tracking-[0.15em] text-arcana-text">
                    {place.nome}
                  </h3>
                  <PageRef paginas={place.paginas} />
                </div>
                <p className="mt-1.5 font-crimson text-sm text-arcana-text-dim">
                  {place.caracteristicas}
                </p>
                <p className="mt-1 font-crimson text-xs italic text-arcana-text-dim">
                  {place.conflitos}
                </p>
                <div className="mt-3">
                  {added ? (
                    <span className="font-cinzel text-[10px] uppercase tracking-[0.25em] text-arcana-gold">
                      ✓ Na campanha
                    </span>
                  ) : (
                    <GhostButton
                      onClick={() => addCanon(place.id)}
                      disabled={busy === place.id}
                    >
                      {busy === place.id ? "Adicionando..." : "Adicionar"}
                    </GhostButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NewPlaceForm({ api, onDone }: { api: StoryHubApi; onDone: () => void }) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [conflitos, setConflitos] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (nome.trim().length < 2 || saving) return;
    setSaving(true);
    const data: CampaignPlaceData = {
      nome: nome.trim(),
      origem: "campanha",
      descricao: descricao.trim() || undefined,
      conflitos: conflitos.trim() || undefined,
    };
    const created = await api.addElement(
      "place",
      "gm_only",
      data as unknown as Record<string, unknown>,
    );
    setSaving(false);
    if (created) onDone();
  }

  return (
    <div className="space-y-4 rounded-sm border border-arcana-gold/30 bg-arcana-surface p-5">
      <p className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold">
        Novo lugar da campanha
      </p>
      <Field label="Nome">
        <TextField value={nome} onChange={(e) => setNome(e.target.value)} maxLength={120} autoFocus />
      </Field>
      <Field label="Descrição">
        <TextArea value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={2000} />
      </Field>
      <Field label="Conflitos e ganchos">
        <TextArea value={conflitos} onChange={(e) => setConflitos(e.target.value)} rows={2} maxLength={1000} />
      </Field>
      <div className="flex justify-end gap-3">
        <GhostButton onClick={onDone}>Cancelar</GhostButton>
        <GoldButton onClick={submit} disabled={nome.trim().length < 2 || saving}>
          {saving ? "Criando..." : "Criar lugar"}
        </GoldButton>
      </div>
    </div>
  );
}

function PlaceCard({ element, api }: { element: CampaignElement; api: StoryHubApi }) {
  const data = element.data as CampaignPlaceData;
  const [editing, setEditing] = useState(false);
  const [notas, setNotas] = useState(data.notasDoJuiz ?? "");
  const [descricao, setDescricao] = useState(data.descricao ?? "");
  const [conflitos, setConflitos] = useState(data.conflitos ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await api.patchElement(element.id, {
      data: {
        ...data,
        descricao: descricao.trim() || undefined,
        conflitos: conflitos.trim() || undefined,
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
          {data.descricao && (
            <p className="mt-2 font-crimson text-sm text-arcana-text-dim">{data.descricao}</p>
          )}
          {data.conflitos && (
            <p className="mt-1 font-crimson text-xs italic text-arcana-text-dim">
              {data.conflitos}
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
          <Field label="Descrição">
            <TextArea value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={2000} />
          </Field>
          <Field label="Conflitos e ganchos">
            <TextArea value={conflitos} onChange={(e) => setConflitos(e.target.value)} rows={2} maxLength={1000} />
          </Field>
          <Field label="Notas do Juiz" hint="Só aparecem para você enquanto o elemento for 🔒.">
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
