"use client";

import { useEffect, useRef, useState } from "react";
import {
  createSacramentoCharacter,
  type CreateSacramentoPayload,
} from "@/app/play/characters/new/actions";
import { HowItWorks } from "@/components/campaign-creation/Explainer";
import { PLAYER_GUIDES } from "@/lib/character-creation/sacramento/guidance";
import {
  APRESENTACOES,
  FAIXAS_ETARIAS,
  TIPOS_FISICOS,
  TONS_DE_PELE,
} from "@/lib/character-creation/sacramento/bases";
import { kitById } from "@/lib/character-creation/sacramento/kits";
import { habilidadeById, contarParrudeza } from "@/lib/character-creation/sacramento/habilidades";
import { ANTECEDENTES, ATRIBUTOS, calcularDerivados, validarFicha } from "@/lib/character-creation/sacramento/rules";
import { resumoCompras } from "@/lib/character-creation/sacramento/catalogo";
import { faccaoById } from "@/lib/character-creation/sacramento/story-data";
import {
  ELEMENTOS_VAZIOS,
  FICHA_INICIAL,
  type SacramentoCreationData,
} from "@/lib/character-creation/sacramento/types";

type Props = {
  data: Partial<SacramentoCreationData>;
  triggerRef: React.MutableRefObject<(() => void) | null>;
  onSavingChange: (saving: boolean) => void;
  onSaved: () => void;
};

const LABEL = "font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-text-dim";
const CARD_STYLE = {
  background: "rgba(27,27,42,0.72)",
  border: "1px solid rgba(255,255,255,0.08)",
} as const;

export default function StepRevisao({ data, triggerRef, onSavingChange, onSaved }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (saving) return;
    const { name, base, historia } = data;
    if (!name || !base || !historia) {
      setError("Faltam etapas anteriores — volte e complete o retrato e a história.");
      return;
    }
    setSaving(true);
    setError(null);
    onSavingChange(true);
    try {
      const payload: CreateSacramentoPayload = {
        name,
        base,
        kitId: data.kitId ?? "base",
        elementos: data.elementos ?? ELEMENTOS_VAZIOS,
        historia,
        historiaModo: data.historiaModo ?? "manual",
        ficha: data.ficha ?? FICHA_INICIAL,
      };
      const result = await createSacramentoCharacter(payload);
      if (result && !result.ok) {
        setError(result.error);
      } else {
        onSaved();
      }
    } catch (err) {
      if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
        onSaved();
        throw err;
      }
      setError("Não foi possível salvar o personagem. Tente novamente.");
    } finally {
      setSaving(false);
      onSavingChange(false);
    }
  };

  // Mantém o handler fresco e expõe ao footer compartilhado (padrão triggerRef).
  const handleCreateRef = useRef(handleCreate);
  useEffect(() => {
    handleCreateRef.current = handleCreate;
  });
  useEffect(() => {
    triggerRef.current = () => {
      void handleCreateRef.current();
    };
    return () => {
      triggerRef.current = null;
    };
  }, [triggerRef]);

  const base = data.base;
  const historia = data.historia;
  const elementos = data.elementos ?? ELEMENTOS_VAZIOS;
  const ficha = data.ficha ?? FICHA_INICIAL;
  const faccao = faccaoById(elementos.faccaoId);
  const kit = kitById(data.kitId ?? "base");
  const derivados = calcularDerivados(ficha, contarParrudeza(ficha.habilidades));
  const validacao = validarFicha(ficha);
  const compras = resumoCompras(ficha.compras ?? []);

  const tracos = base
    ? [
        APRESENTACOES.find((a) => a.id === base.apresentacao)?.label,
        TONS_DE_PELE.find((t) => t.id === base.tomDePele)?.label,
        FAIXAS_ETARIAS.find((f) => f.id === base.faixaEtaria)?.label,
        TIPOS_FISICOS.find((t) => t.id === base.tipoFisico)?.label,
        kit && kit.id !== "base" ? `Kit ${kit.nome}` : null,
      ].filter(Boolean)
    : [];

  const habilidadesNomes = (() => {
    const parr = contarParrudeza(ficha.habilidades);
    const outras = ficha.habilidades
      .filter((id) => id !== "parrudeza")
      .map((id) => habilidadeById(id)?.nome ?? id);
    return parr > 0 ? [...outras, `Parrudeza ×${parr}`] : outras;
  })();

  return (
    <div className="space-y-6 max-w-2xl">
      <HowItWorks guide={PLAYER_GUIDES.revisao} />

      <div className="rounded-2xl p-5 space-y-4" style={CARD_STYLE}>
        <div>
          <span className={LABEL}>Nome</span>
          <p className="font-cinzel text-xl uppercase tracking-[0.15em] text-arcana-gold-bright mt-1">
            {data.name || "—"}
          </p>
          {elementos.conceito && (
            <p className="font-crimson text-base italic text-arcana-text-dim mt-1">
              {elementos.conceito}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <span className={LABEL}>Aparência</span>
          <div className="flex flex-wrap gap-2">
            {tracos.map((t) => (
              <span key={t} className="arcana-chip pointer-events-none">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Ficha */}
      <div className="rounded-2xl p-5 space-y-4" style={CARD_STYLE}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className={LABEL}>Ficha · Nível {ficha.nivel}</span>
          <span className="font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-text-dim">
            {derivados.xp} XP · saldo ${compras.saldo}
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
          {[
            { label: "Vida", value: String(derivados.vidaMaxima) },
            { label: "Dor", value: String(derivados.capacidadeDor) },
            { label: "Defesa", value: String(derivados.defesa) },
            { label: "Movim.", value: String(derivados.movimentos) },
            { label: "Ações", value: String(derivados.acoesCombate) },
            { label: "Iniciativa", value: `${derivados.cartasIniciativa}♠` },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-cinzel text-xl text-arcana-gold-bright leading-none">{s.value}</p>
              <p className="font-cinzel text-[10px] uppercase tracking-[0.12em] text-arcana-text-dim mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className={LABEL}>Atributos</span>
            <p className="font-crimson text-base text-arcana-text-dim mt-1">
              {ATRIBUTOS.map((a) => `${a.nome} ${ficha.atributos[a.id]}`).join(" · ")}
            </p>
          </div>
          <div>
            <span className={LABEL}>Antecedentes</span>
            <p className="font-crimson text-base text-arcana-text-dim mt-1">
              {ANTECEDENTES.filter((a) => ficha.antecedentes[a.id] > 0)
                .map((a) => `${a.nome} ${ficha.antecedentes[a.id]}`)
                .join(" · ") || "—"}
            </p>
          </div>
          <div>
            <span className={LABEL}>Habilidades</span>
            <p className="font-crimson text-base text-arcana-text-dim mt-1">
              {habilidadesNomes.join(" · ") || "—"}
            </p>
          </div>
          <div>
            <span className={LABEL}>Montaria</span>
            <p className="font-crimson text-base text-arcana-text-dim mt-1">
              {ficha.montaria
                ? `${ficha.montaria.nome || "Sem nome"} · Pot ${ficha.montaria.potencia} · Res ${ficha.montaria.resistencia} · Vida ${6 + ficha.montaria.resistencia}`
                : "A resolver na mesa"}
            </p>
          </div>
          <div>
            <span className={LABEL}>Compras</span>
            <p className="font-crimson text-base text-arcana-text-dim mt-1">
              {compras.custoTotal > 0
                ? `${(ficha.compras ?? []).reduce((n, c) => n + c.quantidade, 0)} itens · $${compras.custoTotal} gastos · sobra $${compras.saldo}`
                : "Nada comprado — $200 intactos"}
            </p>
          </div>
          <div>
            <span className={LABEL}>Recompensa pela cabeça</span>
            <p className="font-crimson text-base text-arcana-text-dim mt-1">
              $0 — exceções da trilha só com o Juiz
            </p>
          </div>
        </div>
        {validacao.erros.length > 0 && (
          <div className="space-y-1">
            {validacao.erros.map((err) => (
              <p key={err} className="font-crimson text-sm italic text-arcana-danger">
                {err}
              </p>
            ))}
          </div>
        )}
      </div>

      {historia && (
        <div className="rounded-2xl p-5 space-y-4" style={CARD_STYLE}>
          <div>
            <span className={LABEL}>História</span>
            <p className="font-crimson text-lg text-arcana-text leading-relaxed mt-1">
              {historia.resumo}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className={LABEL}>Redenção</span>
              <p className="font-crimson text-base text-arcana-text-dim mt-1">
                {historia.redencao.trilhaNome} · 6 passos
              </p>
            </div>
            <div>
              <span className={LABEL}>Vínculos</span>
              <p className="font-crimson text-base text-arcana-text-dim mt-1">
                {historia.vinculos.length > 0
                  ? historia.vinculos.map((v) => v.nome).join(", ")
                  : "—"}
              </p>
            </div>
            {elementos.origem && (
              <div>
                <span className={LABEL}>Origem</span>
                <p className="font-crimson text-base text-arcana-text-dim mt-1">{elementos.origem}</p>
              </div>
            )}
            {faccao && (
              <div>
                <span className={LABEL}>Facção</span>
                <p className="font-crimson text-base text-arcana-text-dim mt-1">
                  {faccao.nome}
                  {elementos.faccaoRelacao ? ` · ${elementos.faccaoRelacao}` : ""}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="font-crimson text-sm italic text-arcana-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
