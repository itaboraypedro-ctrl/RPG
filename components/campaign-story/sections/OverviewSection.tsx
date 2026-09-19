"use client";

import { useState } from "react";
import type { CampaignConfig } from "@/lib/types";
import type { StoryHubApi } from "../StoryHub";
import { SACRAMENTO_META } from "@/lib/rulesets/sacramento/meta";
import { SESSION_ZERO_SUGGESTIONS } from "@/lib/rulesets/sacramento/themes";
import { Chip, TagListEditor } from "@/components/campaign-creation/TagInputs";
import { ToneMeter } from "@/components/campaign-creation/ToneMeter";
import { ThemeGrid } from "@/components/campaign-creation/ThemeGrid";
import { EpochPanel } from "@/components/campaign-creation/EpochPanel";
import { AiAssist } from "../AiAssist";
import {
  Field,
  GoldButton,
  SaveState,
  SectionHeader,
  TextArea,
  hintClass,
} from "../ui";

export function OverviewSection({ api }: { api: StoryHubApi }) {
  const [draft, setDraft] = useState<CampaignConfig>(api.config);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

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

      <div className="space-y-6">
        <Field label="Tom" hint="A intensidade da campanha — arraste o cursor no espectro.">
          <ToneMeter
            value={draft.tone ?? null}
            onChange={(tone) => update({ tone: tone ?? undefined })}
          />
        </Field>

        <Field
          label="Temas"
          hint="Os fios que a campanha vai puxar — sem bônus mecânico, só direção narrativa."
        >
          <ThemeGrid
            selected={draft.themes ?? []}
            onChange={(themes) => update({ themes })}
          />
        </Field>
      </div>

      {/* Época, data ficcional e cronologia — painel único */}
      <EpochPanel
        epoch={draft.epoch ?? SACRAMENTO_META.defaults.epoca}
        onEpochChange={(epoch) => update({ epoch })}
        fictionalDate={draft.fictional_date}
        onFictionalDateChange={(fictional_date) => update({ fictional_date })}
      />

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
