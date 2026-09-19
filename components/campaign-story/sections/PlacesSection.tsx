"use client";

import { useRef, useState } from "react";
import type { CampaignElement } from "@/lib/types";
import type { CampaignPlaceData } from "@/lib/rulesets/sacramento/types";
import { SACRAMENTO_PLACES } from "@/lib/rulesets/sacramento/places";
import {
  deleteCampaignImage,
  uploadCampaignImage,
} from "@/app/campaigns/[id]/story/actions";
import { SECTION_GUIDES } from "@/lib/rulesets/sacramento/guidance";
import type { StoryHubApi } from "../StoryHub";
import { ImageSlot } from "../ImageSlot";
import { WorldMap } from "../WorldMap";
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
  const [placingId, setPlacingId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const placingElement = placingId ? elements.find((el) => el.id === placingId) : null;

  // Pinos: lugares da campanha já posicionados no mapa pelo Juiz.
  const pins = elements
    .map((el) => ({ el, data: el.data as CampaignPlaceData }))
    .filter(({ data }) => data.mapa)
    .map(({ el, data }) => ({
      id: el.id,
      nome: data.nome,
      x: data.mapa!.x,
      y: data.mapa!.y,
      descricao: data.descricao,
    }));

  const startPlacing = (elementId: string) => {
    setPlacingId(elementId);
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  async function placePin(x: number, y: number) {
    const el = elements.find((e) => e.id === placingId);
    setPlacingId(null);
    if (!el) return;
    const data = el.data as CampaignPlaceData;
    await api.patchElement(el.id, {
      data: { ...data, mapa: { x, y } } as unknown as Record<string, unknown>,
    });
  }

  async function removePin(elementId: string) {
    const el = elements.find((e) => e.id === elementId);
    if (!el) return;
    const data = el.data as CampaignPlaceData;
    await api.patchElement(el.id, {
      data: { ...data, mapa: undefined } as unknown as Record<string, unknown>,
    });
  }

  const canonIdsInCampaign = new Set(
    elements
      .map((el) => (el.data as CampaignPlaceData).canonId)
      .filter((id): id is string => Boolean(id)),
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
      imagem: place.imagem,
    };
    await api.addElement("place", "gm_only", data as unknown as Record<string, unknown>);
    setBusy(null);
  }

  return (
    <div className="max-w-4xl space-y-8">
      <SectionHeader
        guide={SECTION_GUIDES.places}
        imageSrc="/story/headers/lugares.webp"
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

      {/* Mapa do Oeste — navegação estilo Google Maps sobre o mapa oficial */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-cinzel text-[10px] uppercase tracking-[0.35em] text-arcana-gold">
            Mapa do Oeste
          </p>
          <p className={hintClass}>
            Arraste para navegar, use a roda ou a pinça para aproximar; clique num
            lugar para ver e adicionar.
          </p>
        </div>
        <div ref={mapRef}>
          <WorldMap
            addedIds={canonIdsInCampaign}
            busyId={busy}
            onAdd={(id) => void addCanon(id)}
            pins={pins}
            placingLabel={
              placingElement ? (placingElement.data as CampaignPlaceData).nome : null
            }
            onPlacePin={(x, y) => void placePin(x, y)}
            onCancelPlacing={() => setPlacingId(null)}
            onRemovePin={(id) => void removePin(id)}
          />
        </div>
        <p className={hintClass}>
          A Trincheira do Carvão não aparece no mapa oficial — encontre-a na galeria
          do cânone abaixo.
        </p>
      </div>

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
              <PlaceCard
                key={el.id}
                element={el}
                api={api}
                onStartPlacing={() => startPlacing(el.id)}
              />
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
                  "overflow-hidden rounded-xl border transition-all",
                  added
                    ? "border-arcana-gold/50 bg-arcana-gold/5"
                    : "border-arcana-border bg-arcana-surface/50",
                ].join(" ")}
              >
                {place.imagem && (
                  <div className="relative h-32">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={place.imagem}
                      alt={place.nome}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(11,11,20,0.1), transparent 40%, rgba(11,11,20,0.55))",
                      }}
                    />
                  </div>
                )}
                <div className="p-4">
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Artes canônicas vivem em public/; só URLs do bucket devem ir ao storage. */
function isStorageImage(url: string) {
  return url.includes("/object/public/");
}

/** Sobe a imagem para o storage e devolve mensagem de erro ou null. */
async function uploadImage(
  api: StoryHubApi,
  file: File,
): Promise<{ url?: string; error?: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const result = await uploadCampaignImage(api.sessionId, fd);
  if (!result.ok) return { error: result.error };
  return { url: result.url };
}

function NewPlaceForm({ api, onDone }: { api: StoryHubApi; onDone: () => void }) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [conflitos, setConflitos] = useState("");
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  function pickFile(next: File | null) {
    if (image) URL.revokeObjectURL(image.preview);
    setImage(next ? { file: next, preview: URL.createObjectURL(next) } : null);
  }

  async function submit() {
    if (nome.trim().length < 2 || saving) return;
    setSaving(true);
    setImageError(null);

    let imagem: string | undefined;
    if (image) {
      const uploaded = await uploadImage(api, image.file);
      if (uploaded.error) {
        // Não bloqueia a criação do lugar — a imagem pode ser adicionada depois.
        setImageError(uploaded.error);
      }
      imagem = uploaded.url;
    }

    const data: CampaignPlaceData = {
      nome: nome.trim(),
      origem: "campanha",
      descricao: descricao.trim() || undefined,
      conflitos: conflitos.trim() || undefined,
      imagem,
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
    <div className="space-y-4 rounded-xl border border-arcana-gold/30 bg-arcana-surface p-5">
      <p className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold">
        Novo lugar da campanha
      </p>
      <Field label="Nome">
        <TextField value={nome} onChange={(e) => setNome(e.target.value)} maxLength={120} autoFocus />
      </Field>
      <Field label="Imagem" hint="Opcional — um retrato do lugar (JPG, PNG, WebP ou GIF, até 5 MB).">
        <div className="flex items-center gap-3">
          {image && (
            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-arcana-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.preview} alt="Prévia da imagem" className="h-full w-full object-cover" />
            </div>
          )}
          <label className="arcana-btn-ghost arcana-btn-sm cursor-pointer">
            {image ? "Trocar imagem" : "Escolher imagem"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {image && (
            <GhostButton onClick={() => pickFile(null)}>Remover</GhostButton>
          )}
        </div>
        {imageError && (
          <p className="font-crimson text-xs italic text-arcana-danger">{imageError}</p>
        )}
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

function PlaceCard({
  element,
  api,
  onStartPlacing,
}: {
  element: CampaignElement;
  api: StoryHubApi;
  onStartPlacing: () => void;
}) {
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

  async function handleUpload(file: File): Promise<string | null> {
    const uploaded = await uploadImage(api, file);
    if (uploaded.error || !uploaded.url) return uploaded.error ?? "Falha no envio.";
    const previous = data.imagem;
    await api.patchElement(element.id, {
      data: { ...data, imagem: uploaded.url } as unknown as Record<string, unknown>,
    });
    if (previous && isStorageImage(previous)) {
      void deleteCampaignImage(api.sessionId, previous);
    }
    return null;
  }

  async function handleRemoveImage() {
    if (!data.imagem) return;
    await api.patchElement(element.id, {
      data: { ...data, imagem: undefined } as unknown as Record<string, unknown>,
    });
    if (isStorageImage(data.imagem)) {
      void deleteCampaignImage(api.sessionId, data.imagem);
    }
  }

  return (
    <ElementCard>
      {/* Retrato do lugar — sangra até as bordas da carta */}
      <div className="-mx-4 -mt-4 mb-3 overflow-hidden rounded-t-2xl">
        <ImageSlot
          imageUrl={data.imagem}
          alt={data.nome}
          onUpload={handleUpload}
          onRemove={handleRemoveImage}
        />
      </div>

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
              <GhostButton onClick={onStartPlacing}>
                {data.mapa ? "📍 Reposicionar" : "📍 No mapa"}
              </GhostButton>
              <GhostButton onClick={() => setEditing(true)}>Editar</GhostButton>
              <GhostButton
                danger
                onClick={() => {
                  if (data.imagem && isStorageImage(data.imagem)) {
                    void deleteCampaignImage(api.sessionId, data.imagem);
                  }
                  void api.removeElement(element.id);
                }}
              >
                Remover
              </GhostButton>
            </>
          )}
        </div>
      </div>
    </ElementCard>
  );
}
