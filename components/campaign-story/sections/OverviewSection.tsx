"use client";

import { useState } from "react";
import type { CampaignConfig } from "@/lib/types";
import type { StoryHubApi } from "../StoryHub";
import { SACRAMENTO_META } from "@/lib/rulesets/sacramento/meta";
import { SACRAMENTO_TIMELINE } from "@/lib/rulesets/sacramento/timeline";
import {
  SACRAMENTO_THEMES,
  SACRAMENTO_TONES,
  SESSION_ZERO_SUGGESTIONS,
} from "@/lib/rulesets/sacramento/themes";
import { Chip, TagListEditor } from "@/components/campaign-creation/TagInputs";
import { AiAssist } from "../AiAssist";
import {
  Field,
  GoldButton,
  SaveState,
  SectionHeader,
  TextArea,
  TextField,
  hintClass,
} from "../ui";

export function OverviewSection({ api }: { api: StoryHubApi }) {
  const [draft, setDraft] = useState<CampaignConfig>(api.config);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showTimeline, setShowTimeline] = useState(false);

  const update = (partial: Partial<CampaignConfig>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
    setSaveState("idle");
  };
  const updateSz = (partial: Partial<NonNullable<CampaignConfig["session_zero"]>>) =>
    update({ session_zero: { ...draft.session_zero, ...partial } });

  async function save() {
    setSaveState("saving");
    const epoch = draft.epoch ?? SACRAMENTO_META.defaults.epoca;
    const ok = await api.saveConfig({
      ...draft,
      epoch,
      epoch_is_table_version: epoch !== SACRAMENTO_META.defaults.epoca,
    });
    setSaveState(ok ? "saved" : "error");
  }

  const sz = draft.session_zero ?? {};

  return (
    <div className="max-w-3xl space-y-8">
      <SectionHeader
        title="Visão geral"
        description="O macro da campanha: premissa, objetivo do bando, tom e acordos da mesa. Visível para os jogadores que entrarem — segredos ficam na seção Segredos do Juiz."
        action={
          <div className="flex items-center gap-3">
            <SaveState state={saveState} />
            <GoldButton onClick={save} disabled={saveState === "saving"}>
              Salvar
            </GoldButton>
          </div>
        }
      />

      <Field
        label="Premissa"
        hint="Do que trata a campanha — a situação do Oeste que o bando encontra."
      >
        <TextArea
          value={draft.premise ?? ""}
          onChange={(e) => update({ premise: e.target.value })}
          rows={4}
          maxLength={2000}
          placeholder="Ex.: Uma ferrovia avança sobre Tupaciguara e os Novos Sagrados enxergam nela um sinal..."
        />
      </Field>

      <Field
        label="Objetivo comum do bando"
        hint="O que une os personagens — combinado com os jogadores."
      >
        <TextArea
          value={draft.band_goal ?? ""}
          onChange={(e) => update({ band_goal: e.target.value })}
          rows={2}
          maxLength={500}
          placeholder="Ex.: Juntar dinheiro para comprar as terras da antiga fazenda e viver em paz."
        />
      </Field>

      <div className="space-y-3">
        <Field label="Tom">
          <div className="flex flex-wrap gap-2">
            {SACRAMENTO_TONES.map((tone) => (
              <Chip
                key={tone.id}
                active={draft.tone === tone.id}
                onClick={() =>
                  update({ tone: draft.tone === tone.id ? undefined : tone.id })
                }
                title={tone.descricao}
              >
                {tone.nome}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="Temas">
          <div className="flex flex-wrap gap-2">
            {SACRAMENTO_THEMES.map((theme) => {
              const active = (draft.themes ?? []).includes(theme.id);
              return (
                <Chip
                  key={theme.id}
                  active={active}
                  onClick={() =>
                    update({
                      themes: active
                        ? (draft.themes ?? []).filter((t) => t !== theme.id)
                        : [...(draft.themes ?? []), theme.id],
                    })
                  }
                  title={theme.descricao}
                >
                  {theme.nome}
                </Chip>
              );
            })}
          </div>
        </Field>
      </div>

      {/* Época + data ficcional */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Época"
          hint={`Presente editorial: ${SACRAMENTO_META.defaults.epoca}. Outra época vale como versão da mesa.`}
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={draft.epoch ?? SACRAMENTO_META.defaults.epoca}
              onChange={(e) => update({ epoch: Number(e.target.value) })}
              className="arcana-input w-28 font-crimson text-sm"
            />
            {(draft.epoch ?? SACRAMENTO_META.defaults.epoca) !==
              SACRAMENTO_META.defaults.epoca && (
              <span className="border border-arcana-gold/40 px-2 py-0.5 font-cinzel text-[9px] uppercase tracking-[0.25em] text-arcana-gold">
                Versão da mesa
              </span>
            )}
          </div>
        </Field>
        <Field
          label="Data ficcional atual"
          hint="Onde a campanha está no calendário do jogo — não confundir com a data real."
        >
          <TextField
            value={draft.fictional_date ?? ""}
            onChange={(e) => update({ fictional_date: e.target.value })}
            maxLength={80}
            placeholder={`Ex.: Março de ${draft.epoch ?? SACRAMENTO_META.defaults.epoca}`}
          />
        </Field>
      </div>

      {/* Timeline canônica de referência */}
      <div className="rounded-sm border border-arcana-border-dim bg-arcana-surface/50">
        <button
          type="button"
          onClick={() => setShowTimeline((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold">
            Cronologia do mundo (referência, pp. 131–132)
          </span>
          <span className="font-cinzel text-xs text-arcana-text-dim">
            {showTimeline ? "−" : "+"}
          </span>
        </button>
        {showTimeline && (
          <div className="max-h-72 overflow-y-auto border-t border-arcana-border-dim px-4 py-3">
            <table className="w-full">
              <tbody>
                {SACRAMENTO_TIMELINE.map((anchor) => (
                  <tr key={`${anchor.ano}-${anchor.marco}`} className="align-top">
                    <td className="whitespace-nowrap pr-4 py-1 font-cinzel text-[10px] tracking-[0.15em] text-arcana-gold">
                      {anchor.ano}
                    </td>
                    <td className="py-1 font-crimson text-sm text-arcana-text-dim">
                      {anchor.marco}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sessão zero */}
      <div className="space-y-5 rounded-sm border border-arcana-border-dim bg-arcana-surface/60 p-5">
        <div>
          <p className="font-cinzel text-xs uppercase tracking-[0.3em] text-arcana-gold">
            Sessão zero — jogo seguro
          </p>
          <p className={`mt-1 ${hintClass}`}>
            Acordos visíveis à mesa (pp. 16, 47, 125–127). Limites combinados
            prevalecem sobre &ldquo;meu personagem faria isso&rdquo;.
          </p>
        </div>

        <Field label="Linhas" hint="Assuntos excluídos da ficção da mesa.">
          <TagListEditor
            values={sz.lines ?? []}
            suggestions={SESSION_ZERO_SUGGESTIONS.linhas}
            placeholder="Adicionar linha..."
            onChange={(lines) => updateSz({ lines })}
          />
        </Field>

        <Field label="Véus" hint="Podem existir, mas em segundo plano, sem detalhes.">
          <TagListEditor
            values={sz.veils ?? []}
            suggestions={SESSION_ZERO_SUGGESTIONS.veus}
            placeholder="Adicionar véu..."
            onChange={(veils) => updateSz({ veils })}
          />
        </Field>

        <div className="flex items-center gap-3">
          <Chip
            active={sz.x_card ?? false}
            onClick={() => updateSz({ x_card: !sz.x_card })}
          >
            Cartão X {sz.x_card ? "ativo" : "inativo"}
          </Chip>
          <span className={hintClass}>
            Encerra a cena imediatamente, sem debate ou justificativa.
          </span>
        </div>

        <Field label="Outras notas do acordo">
          <TextArea
            value={sz.notes ?? ""}
            onChange={(e) => updateSz({ notes: e.target.value })}
            rows={2}
            maxLength={1000}
            placeholder="Logística, expectativas, ritmo das sessões..."
          />
        </Field>
      </div>

      {api.aiEnabled && (
        <AiAssist
          sessionId={api.sessionId}
          section="hooks"
          title="Propostas de ganchos com IA"
          onApply={async (p) => {
            const created = await api.addElement("secret_note", "gm_only", {
              titulo: `Gancho: ${p.titulo}`,
              texto: [p.texto, p.referencias && `Referências: ${p.referencias}`]
                .filter(Boolean)
                .join("\n\n"),
            });
            return created !== null;
          }}
        />
      )}
    </div>
  );
}
