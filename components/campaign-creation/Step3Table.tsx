"use client";

import type { CampaignWizardData } from "@/app/campaigns/new/CampaignWizard";
import { SACRAMENTO_META } from "@/lib/rulesets/sacramento/meta";
import {
  SACRAMENTO_THEMES,
  SACRAMENTO_TONES,
  SESSION_ZERO_SUGGESTIONS,
} from "@/lib/rulesets/sacramento/themes";
import { Chip, TagListEditor } from "./TagInputs";

type Props = {
  data: CampaignWizardData;
  onUpdate: (partial: Partial<CampaignWizardData>) => void;
};

const labelClass =
  "font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-text-dim";
const hintClass = "font-crimson text-xs italic text-arcana-text-dim/50";

function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1">
      <p className={labelClass}>{children}</p>
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-sm border border-arcana-border bg-arcana-surface px-4 py-3 text-left transition-colors hover:border-arcana-gold/40"
    >
      <span>
        <span className="block font-cinzel text-[10px] uppercase tracking-[0.25em] text-arcana-text">
          {label}
        </span>
        {hint && <span className={`mt-0.5 block ${hintClass}`}>{hint}</span>}
      </span>
      <span
        className={[
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-arcana-gold" : "bg-arcana-border",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-0.5 h-4 w-4 rounded-full bg-arcana-bg transition-all",
            checked ? "left-[18px]" : "left-0.5",
          ].join(" ")}
        />
      </span>
    </button>
  );
}

export function Step3Table({ data, onUpdate }: Props) {
  return (
    <div className="space-y-9 max-w-2xl">
      {/* Jogadores */}
      <div className="space-y-3">
        <SectionTitle hint="O link de convite é gerado junto com a campanha e aparece na próxima fase.">
          Tamanho do bando
        </SectionTitle>
        <div className="flex items-center gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onUpdate({ maxPlayers: n })}
              aria-pressed={data.maxPlayers === n}
              className={[
                "h-10 w-10 rounded-sm border font-cinzel text-sm transition-all",
                data.maxPlayers === n
                  ? "border-arcana-gold bg-arcana-gold/10 text-arcana-gold shadow-[0_0_12px_rgba(201,168,76,0.25)]"
                  : "border-arcana-border text-arcana-text-dim hover:border-arcana-gold/40",
              ].join(" ")}
            >
              {n}
            </button>
          ))}
        </div>
        <p className={hintClass}>Máximo de jogadores na mesa (além do Juiz).</p>
      </div>

      {/* Tom */}
      <div className="space-y-3">
        <SectionTitle>Tom da história</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {SACRAMENTO_TONES.map((tone) => (
            <Chip
              key={tone.id}
              active={data.tone === tone.id}
              onClick={() =>
                onUpdate({ tone: data.tone === tone.id ? null : tone.id })
              }
              title={tone.descricao}
            >
              {tone.nome}
            </Chip>
          ))}
        </div>
      </div>

      {/* Temas */}
      <div className="space-y-3">
        <SectionTitle hint="Escolha os fios que a campanha vai puxar — sem bônus mecânico, só direção narrativa.">
          Temas
        </SectionTitle>
        <div className="flex flex-wrap gap-2">
          {SACRAMENTO_THEMES.map((theme) => (
            <Chip
              key={theme.id}
              active={data.themes.includes(theme.id)}
              onClick={() =>
                onUpdate({
                  themes: data.themes.includes(theme.id)
                    ? data.themes.filter((t) => t !== theme.id)
                    : [...data.themes, theme.id],
                })
              }
              title={theme.descricao}
            >
              {theme.nome}
            </Chip>
          ))}
        </div>
      </div>

      {/* Época */}
      <div className="space-y-2">
        <SectionTitle>Época</SectionTitle>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={data.epoch}
            onChange={(e) => onUpdate({ epoch: Number(e.target.value) })}
            className="arcana-input w-28 font-crimson text-base"
          />
          {data.epoch !== SACRAMENTO_META.defaults.epoca && (
            <span className="border border-arcana-gold/40 px-2 py-1 font-cinzel text-[8px] uppercase tracking-[0.25em] text-arcana-gold/80">
              Versão da mesa
            </span>
          )}
        </div>
        <p className={hintClass}>
          O presente editorial do cenário é {SACRAMENTO_META.defaults.epoca}. Outra
          época é permitida, registrada como versão da sua mesa.
        </p>
      </div>

      {/* Sessão zero */}
      <div className="space-y-5 rounded-sm border border-arcana-border-dim bg-arcana-surface/60 p-5">
        <div>
          <p className="font-cinzel text-xs uppercase tracking-[0.3em] text-arcana-gold">
            Sessão zero — jogo seguro
          </p>
          <p className={`mt-1 ${hintClass}`}>
            O livro recomenda combinar limites antes de jogar (pp. 16, 47, 125–127).
            Estes acordos ficam visíveis para a mesa e podem ser editados depois.
          </p>
        </div>

        <div className="space-y-2">
          <SectionTitle hint="Assuntos excluídos da ficção da mesa.">Linhas</SectionTitle>
          <TagListEditor
            values={data.lines}
            suggestions={SESSION_ZERO_SUGGESTIONS.linhas}
            placeholder="Adicionar linha própria..."
            onChange={(lines) => onUpdate({ lines })}
          />
        </div>

        <div className="space-y-2">
          <SectionTitle hint="Podem existir, mas em segundo plano, sem detalhes.">
            Véus
          </SectionTitle>
          <TagListEditor
            values={data.veils}
            suggestions={SESSION_ZERO_SUGGESTIONS.veus}
            placeholder="Adicionar véu próprio..."
            onChange={(veils) => onUpdate({ veils })}
          />
        </div>

        <Toggle
          checked={data.xCard}
          onChange={(xCard) => onUpdate({ xCard })}
          label="Cartão X"
          hint="Sinal de desconforto que encerra a cena imediatamente, sem debate."
        />
      </div>

      {/* Configurações da mesa */}
      <div className="space-y-3">
        <SectionTitle>Mesa</SectionTitle>
        <Toggle
          checked={data.allowNewChars}
          onChange={(allowNewChars) => onUpdate({ allowNewChars })}
          label="Permitir novos personagens"
          hint="Jogadores podem criar personagens depois da campanha iniciada."
        />
        <Toggle
          checked={data.aiAssistant}
          onChange={(aiAssistant) => onUpdate({ aiAssistant })}
          label="Assistente de IA do Juiz"
          hint="Sugestões de história no hub e no painel — nada vira fato sem você aplicar."
        />
      </div>
    </div>
  );
}
