"use client";

import { useState } from "react";
import type { CampaignElement } from "@/lib/types";
import type { CampaignNpcData } from "@/lib/rulesets/sacramento/types";
import {
  formatCard,
  generateNpc,
  type GeneratedNpc,
} from "@/lib/rulesets/sacramento/generators";
import { deriveNpcStats, type Ndc, type NpcTipo } from "@/lib/rulesets/sacramento/npc-stats";
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
  hintClass,
  labelClass,
} from "../ui";

const EMPTY_NPC: CampaignNpcData = { nome: "", origem: "campanha" };

export function NpcsSection({ api }: { api: StoryHubApi }) {
  const elements = api.elementsOf("npc");
  const [draft, setDraft] = useState<CampaignNpcData | null>(null);
  const [lastDraw, setLastDraw] = useState<GeneratedNpc | null>(null);

  function drawNpc() {
    const gen = generateNpc();
    setLastDraw(gen);
    setDraft({
      nome: `${gen.nome} ${gen.sobrenome}`,
      origem: "campanha",
      ocupacao: gen.atividade,
      descricao: gen.caracteristica,
      atitude: gen.reacao,
      cartasGeradas: gen.cartas,
    });
  }

  return (
    <div className="max-w-4xl space-y-8">
      <SectionHeader
        imageSrc="/story/headers/npcs.webp"
        title="NPCs"
        description="Figuras da campanha. Campos narrativos não concedem bônus; a ficha mecânica (NdC) é opcional e calculada pelas fórmulas do livro. Sem confronto previsto, um NPC pode viver sem ficha."
        action={
          <div className="flex gap-2">
            <GhostButton onClick={drawNpc}>🂠 Sacar cartas</GhostButton>
            <GoldButton onClick={() => setDraft(draft ? null : EMPTY_NPC)}>
              {draft ? "Fechar" : "+ NPC"}
            </GoldButton>
          </div>
        }
      />

      {lastDraw && draft && (
        <div className="arcana-gilded rounded-xl px-4 py-3">
          <p className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold">
            Gerador do livro (pp. 119–120) — uma carta por coluna, reação pelo naipe da última
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 font-crimson text-sm text-arcana-text-dim">
            <CardSeed label="Nome" card={formatCard(lastDraw.cartas.nome)} value={lastDraw.nome} />
            <CardSeed label="Sobrenome" card={formatCard(lastDraw.cartas.sobrenome)} value={lastDraw.sobrenome} />
            <CardSeed label="Atividade" card={formatCard(lastDraw.cartas.atividade)} value={lastDraw.atividade} />
            <CardSeed label="Característica" card={formatCard(lastDraw.cartas.caracteristica)} value={lastDraw.caracteristica} />
            <CardSeed label="Reação" card={formatCard(lastDraw.cartas.caracteristica)} value={lastDraw.reacao} />
          </div>
        </div>
      )}

      {draft && (
        <NpcForm
          initial={draft}
          onCancel={() => {
            setDraft(null);
            setLastDraw(null);
          }}
          onSave={async (data) => {
            const created = await api.addElement(
              "npc",
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
        <EmptyHint>
          Nenhum NPC ainda. Crie do zero ou saque quatro cartas para uma semente do livro.
        </EmptyHint>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {elements.map((el) => (
            <NpcCard key={el.id} element={el} api={api} />
          ))}
        </div>
      )}

      {api.aiEnabled && (
        <AiAssist
          sessionId={api.sessionId}
          section="npc"
          title="Propostas de NPCs com IA"
          onApply={async (p) => {
            const data: CampaignNpcData = {
              nome: p.nome || p.titulo,
              origem: "campanha",
              ocupacao: p.ocupacao,
              descricao: p.descricao,
              desejo: p.desejo,
              medo: p.medo,
              segredo: p.segredo,
              agenda: p.agenda,
            };
            const created = await api.addElement(
              "npc",
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

function CardSeed({ label, card, value }: { label: string; card: string; value: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-text-dim">
        {label}
      </span>
      <span className="rounded-xl border border-arcana-border bg-arcana-bg px-1.5 py-0.5 font-cinzel text-[10px] text-arcana-gold">
        {card}
      </span>
      <span className="text-arcana-text">{value}</span>
    </span>
  );
}

function NpcForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: CampaignNpcData;
  onCancel: () => void;
  onSave: (data: CampaignNpcData) => Promise<void>;
}) {
  const [data, setData] = useState<CampaignNpcData>(initial);
  const [hasFicha, setHasFicha] = useState(Boolean(initial.ficha));
  const [saving, setSaving] = useState(false);

  const update = (partial: Partial<CampaignNpcData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  const ficha = data.ficha ?? { tipo: "comum" as NpcTipo, ndc: 2 as Ndc };
  const derived = deriveNpcStats(ficha.tipo, ficha.ndc);

  async function submit() {
    if (data.nome.trim().length < 2 || saving) return;
    setSaving(true);
    const clean: CampaignNpcData = {
      ...data,
      nome: data.nome.trim(),
      ficha: hasFicha ? ficha : undefined,
    };
    await onSave(clean);
    setSaving(false);
  }

  return (
    <div className="space-y-4 rounded-xl border border-arcana-gold/30 bg-arcana-surface p-5">
      <p className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold">
        {initial.nome ? "NPC" : "Novo NPC"}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nome">
          <TextField value={data.nome} onChange={(e) => update({ nome: e.target.value })} maxLength={120} autoFocus />
        </Field>
        <Field label="Apelido">
          <TextField value={data.apelido ?? ""} onChange={(e) => update({ apelido: e.target.value })} maxLength={80} />
        </Field>
        <Field label="Ocupação">
          <TextField value={data.ocupacao ?? ""} onChange={(e) => update({ ocupacao: e.target.value })} maxLength={120} />
        </Field>
        <Field label="Atitude / reação">
          <TextField value={data.atitude ?? ""} onChange={(e) => update({ atitude: e.target.value })} maxLength={120} placeholder="Hostil, indiferente, amigável..." />
        </Field>
        <Field label="Facção">
          <TextField value={data.faccao ?? ""} onChange={(e) => update({ faccao: e.target.value })} maxLength={120} />
        </Field>
        <Field label="Localização">
          <TextField value={data.localizacao ?? ""} onChange={(e) => update({ localizacao: e.target.value })} maxLength={120} />
        </Field>
      </div>

      <Field label="Descrição">
        <TextArea value={data.descricao ?? ""} onChange={(e) => update({ descricao: e.target.value })} rows={2} maxLength={1000} />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Desejo">
          <TextArea value={data.desejo ?? ""} onChange={(e) => update({ desejo: e.target.value })} rows={2} maxLength={500} />
        </Field>
        <Field label="Medo">
          <TextArea value={data.medo ?? ""} onChange={(e) => update({ medo: e.target.value })} rows={2} maxLength={500} />
        </Field>
      </div>

      <Field label="Vínculos">
        <TextArea value={data.vinculos ?? ""} onChange={(e) => update({ vinculos: e.target.value })} rows={2} maxLength={1000} />
      </Field>
      <Field label="Agenda" hint="O que o NPC faz enquanto o bando não interfere.">
        <TextArea value={data.agenda ?? ""} onChange={(e) => update({ agenda: e.target.value })} rows={2} maxLength={1000} />
      </Field>
      <Field
        label="🔒 Segredo"
        hint="Se este NPC for tornado visível aos jogadores, o segredo vai junto — segredos pesados ficam melhor na seção Segredos do Juiz."
      >
        <TextArea value={data.segredo ?? ""} onChange={(e) => update({ segredo: e.target.value })} rows={2} maxLength={1000} />
      </Field>

      {/* Ficha mecânica opcional */}
      <div className="rounded-xl border border-arcana-border-dim bg-arcana-bg/60 p-4">
        <button
          type="button"
          onClick={() => setHasFicha((v) => !v)}
          className="flex w-full items-center justify-between"
        >
          <span className={labelClass}>Ficha mecânica (NdC) — opcional</span>
          <span className="font-cinzel text-xs text-arcana-text-dim">{hasFicha ? "−" : "+"}</span>
        </button>
        {hasFicha && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <Field label="Tipo">
                <div className="flex gap-2">
                  {(["comum", "especial"] as NpcTipo[]).map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => update({ ficha: { ...ficha, tipo } })}
                      className={[
                        "px-3 py-1.5 font-cinzel text-[10px] uppercase tracking-[0.2em]",
                        ficha.tipo === tipo ? "arcana-chip-active" : "arcana-chip",
                      ].join(" ")}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="NdC">
                <div className="flex gap-1.5">
                  {([1, 2, 3, 4, 5, 6] as Ndc[]).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => update({ ficha: { ...ficha, ndc: n } })}
                      className={[
                        "h-9 w-9 font-cinzel text-sm",
                        ficha.ndc === n ? "arcana-chip-active" : "arcana-chip",
                      ].join(" ")}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div className="arcana-gilded flex flex-wrap gap-4 rounded-xl px-4 py-3">
              <DerivedStat label="Vida" value={derived.vida} />
              <DerivedStat label="Dor" value={derived.dor} />
              <DerivedStat label="Defesa" value={derived.defesa} />
              <DerivedStat label="Ações" value={derived.acoes} />
              <DerivedStat label="Teste" value={`1d6+${derived.testeBonus}`} />
              {derived.habilidadesModelo > 0 && (
                <DerivedStat label="Habilidades" value={derived.habilidadesModelo} />
              )}
            </div>
            <p className={hintClass}>
              Fórmulas do livro (pp. 96–97): comum vida 3×NdC / ações NdC+1; especial vida
              6×NdC / ações NdC+3. A reserva de ações serve para mover e combater; 1 natural
              falha. Habilidades de vilão são exclusivas de NPC.
            </p>
            <Field label="Habilidades da ficha" hint="Separadas por vírgula, conforme o modelo ou template publicado.">
              <TextField
                value={(ficha.habilidades ?? []).join(", ")}
                onChange={(e) =>
                  update({
                    ficha: {
                      ...ficha,
                      habilidades: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    },
                  })
                }
                placeholder="Ex.: Dedo Quente, Escudo Humano"
              />
            </Field>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <GhostButton onClick={onCancel}>Cancelar</GhostButton>
        <GoldButton onClick={submit} disabled={data.nome.trim().length < 2 || saving}>
          {saving ? "Salvando..." : "Salvar NPC"}
        </GoldButton>
      </div>
    </div>
  );
}

function DerivedStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="text-center">
      <p className="font-cinzel text-[10px] uppercase tracking-[0.25em] text-arcana-text-dim">
        {label}
      </p>
      <p className="font-cinzel text-lg text-arcana-gold-bright">{value}</p>
    </div>
  );
}

function NpcCard({ element, api }: { element: CampaignElement; api: StoryHubApi }) {
  const data = element.data as CampaignNpcData;
  const [editing, setEditing] = useState(false);
  const derived = data.ficha ? deriveNpcStats(data.ficha.tipo, data.ficha.ndc) : null;

  if (editing) {
    return (
      <div className="md:col-span-2">
        <NpcForm
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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-cinzel text-sm uppercase tracking-[0.15em] text-arcana-gold-bright">
            {data.nome}
            {data.apelido && (
              <span className="ml-2 font-crimson text-xs normal-case italic tracking-normal text-arcana-text-dim">
                &ldquo;{data.apelido}&rdquo;
              </span>
            )}
          </h3>
          <p className="mt-0.5 font-crimson text-xs text-arcana-text-dim">
            {[data.ocupacao, data.faccao, data.localizacao].filter(Boolean).join(" · ")}
          </p>
        </div>
        {derived && data.ficha && (
          <span className="shrink-0 rounded-xl border border-arcana-border px-2 py-1 font-cinzel text-[10px] uppercase tracking-[0.15em] text-arcana-text-dim">
            {data.ficha.tipo} {data.ficha.ndc} · V{derived.vida} · A{derived.acoes}
          </span>
        )}
      </div>

      {data.descricao && (
        <p className="mt-2 font-crimson text-sm text-arcana-text-dim line-clamp-2">{data.descricao}</p>
      )}
      {(data.desejo || data.medo) && (
        <p className="mt-1 font-crimson text-xs italic text-arcana-text-dim">
          {data.desejo && <>Quer: {data.desejo}</>}
          {data.desejo && data.medo && " · "}
          {data.medo && <>Teme: {data.medo}</>}
        </p>
      )}
      {data.segredo && (
        <p className="mt-2 border-l-2 border-red-900/50 pl-2 font-crimson text-xs italic text-red-200/90 line-clamp-2">
          🔒 {data.segredo}
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
