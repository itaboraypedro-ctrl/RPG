"use client";

import { useState } from "react";
import type { CampaignElement } from "@/lib/types";
import type { CampaignCalendarEventData } from "@/lib/rulesets/sacramento/types";
import { BOM_DE_GOLE_CALENDAR } from "@/lib/rulesets/sacramento/timeline";
import type { StoryHubApi } from "../StoryHub";
import {
  ElementCard,
  EmptyHint,
  Field,
  GhostButton,
  GoldButton,
  OriginBadge,
  SaveState,
  SectionHeader,
  TextArea,
  TextField,
  hintClass,
} from "../ui";

export function CalendarSection({ api }: { api: StoryHubApi }) {
  const elements = api.elementsOf("calendar_event");
  const [creating, setCreating] = useState(false);
  const [showBomDeGole, setShowBomDeGole] = useState(false);
  const [fictionalDate, setFictionalDate] = useState(api.config.fictional_date ?? "");
  const [dateState, setDateState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [busy, setBusy] = useState<string | null>(null);

  async function saveDate() {
    setDateState("saving");
    const ok = await api.saveConfig({ ...api.config, fictional_date: fictionalDate.trim() });
    setDateState(ok ? "saved" : "error");
  }

  const importedBomDeGole = new Set(
    elements
      .map((el) => el.data as CampaignCalendarEventData)
      .filter((d) => d.origem === "canon")
      .map((d) => d.titulo),
  );

  async function importEvent(mes: string, evento: string) {
    if (importedBomDeGole.has(evento)) return;
    setBusy(evento);
    const data: CampaignCalendarEventData = {
      titulo: evento,
      origem: "canon",
      quando: mes,
      descricao: "Evento do calendário do Bom de Gole — ambientação e oportunidades, sem recompensa mecânica automática.",
      paginas: [149],
    };
    await api.addElement("calendar_event", "gm_only", data as unknown as Record<string, unknown>);
    setBusy(null);
  }

  return (
    <div className="max-w-3xl space-y-8">
      <SectionHeader
        title="Calendário ficcional"
        description="Onde a campanha está no tempo do jogo e o que se aproxima. Não confundir a data real da mesa com a data do mundo."
      />

      {/* Data ficcional corrente */}
      <div className="flex flex-wrap items-end gap-3 rounded-sm border border-arcana-border-dim bg-arcana-surface/60 p-4">
        <div className="min-w-64 flex-1">
          <Field label="Data ficcional atual">
            <TextField
              value={fictionalDate}
              onChange={(e) => {
                setFictionalDate(e.target.value);
                setDateState("idle");
              }}
              maxLength={80}
              placeholder={`Ex.: 12 de março de ${api.config.epoch ?? 1880}`}
            />
          </Field>
        </div>
        <div className="flex items-center gap-3 pb-0.5">
          <SaveState state={dateState} />
          <GoldButton onClick={saveDate} disabled={dateState === "saving"}>
            Salvar data
          </GoldButton>
        </div>
      </div>

      {/* Eventos da campanha */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-cinzel text-[10px] uppercase tracking-[0.35em] text-arcana-gold">
            Eventos marcados
          </p>
          <GhostButton onClick={() => setCreating((v) => !v)}>
            {creating ? "Fechar" : "+ Evento"}
          </GhostButton>
        </div>

        {creating && <NewEventForm api={api} onDone={() => setCreating(false)} />}

        {elements.length === 0 && !creating ? (
          <EmptyHint>Nenhum evento no calendário da campanha.</EmptyHint>
        ) : (
          <div className="space-y-2">
            {elements.map((el) => (
              <EventCard key={el.id} element={el} api={api} />
            ))}
          </div>
        )}
      </div>

      {/* Calendário do Bom de Gole */}
      <div className="rounded-sm border border-arcana-border-dim bg-arcana-surface/50">
        <button
          type="button"
          onClick={() => setShowBomDeGole((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold">
            Calendário do Bom de Gole (p. 149) — importar eventos
          </span>
          <span className="font-cinzel text-xs text-arcana-text-dim">{showBomDeGole ? "−" : "+"}</span>
        </button>
        {showBomDeGole && (
          <div className="space-y-1 border-t border-arcana-border-dim px-4 py-3">
            <p className={hintClass}>
              Ambientação e oportunidades — sem recompensa mecânica automática.
            </p>
            {BOM_DE_GOLE_CALENDAR.map(({ mes, evento }) => {
              const imported = importedBomDeGole.has(evento);
              return (
                <div key={mes} className="flex items-center justify-between gap-3 py-1">
                  <p className="font-crimson text-sm text-arcana-text-dim">
                    <span className="font-cinzel text-[10px] uppercase tracking-[0.15em] text-arcana-gold">
                      {mes}
                    </span>{" "}
                    · {evento}
                  </p>
                  {imported ? (
                    <span className="shrink-0 font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-gold">
                      ✓
                    </span>
                  ) : (
                    <GhostButton onClick={() => importEvent(mes, evento)} disabled={busy === evento}>
                      {busy === evento ? "..." : "Importar"}
                    </GhostButton>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function NewEventForm({ api, onDone }: { api: StoryHubApi; onDone: () => void }) {
  const [titulo, setTitulo] = useState("");
  const [quando, setQuando] = useState("");
  const [descricao, setDescricao] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (titulo.trim().length < 2 || saving) return;
    setSaving(true);
    const data: CampaignCalendarEventData = {
      titulo: titulo.trim(),
      origem: "campanha",
      quando: quando.trim() || "A definir",
      descricao: descricao.trim() || undefined,
    };
    const created = await api.addElement(
      "calendar_event",
      "gm_only",
      data as unknown as Record<string, unknown>,
    );
    setSaving(false);
    if (created) onDone();
  }

  return (
    <div className="space-y-3 rounded-sm border border-arcana-gold/30 bg-arcana-surface p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Evento">
          <TextField value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={160} autoFocus />
        </Field>
        <Field label="Quando (data ficcional)">
          <TextField value={quando} onChange={(e) => setQuando(e.target.value)} maxLength={80} placeholder="Ex.: Lua cheia de abril" />
        </Field>
      </div>
      <Field label="Descrição">
        <TextArea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={2} maxLength={1000} />
      </Field>
      <div className="flex justify-end gap-3">
        <GhostButton onClick={onDone}>Cancelar</GhostButton>
        <GoldButton onClick={submit} disabled={titulo.trim().length < 2 || saving}>
          {saving ? "Criando..." : "Marcar evento"}
        </GoldButton>
      </div>
    </div>
  );
}

function EventCard({ element, api }: { element: CampaignElement; api: StoryHubApi }) {
  const data = element.data as CampaignCalendarEventData;
  return (
    <ElementCard>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-cinzel text-sm uppercase tracking-[0.12em] text-arcana-text">
              {data.titulo}
            </h3>
            <OriginBadge origem={data.origem} />
          </div>
          <p className="mt-0.5 font-crimson text-xs text-arcana-text-dim">
            <span className="text-arcana-gold">{data.quando}</span>
            {data.descricao && <> · {data.descricao}</>}
          </p>
        </div>
        <GhostButton danger onClick={() => api.removeElement(element.id)}>
          Remover
        </GhostButton>
      </div>
    </ElementCard>
  );
}
