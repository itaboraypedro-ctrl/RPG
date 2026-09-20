"use client";

import { useEffect, useRef, useState } from "react";
import {
  createSacramentoCharacter,
  type CreateSacramentoPayload,
} from "@/app/play/characters/new/actions";
import {
  APRESENTACOES,
  FAIXAS_ETARIAS,
  TIPOS_FISICOS,
  TONS_DE_PELE,
} from "@/lib/character-creation/sacramento/bases";
import { faccaoById } from "@/lib/character-creation/sacramento/story-data";
import {
  ELEMENTOS_VAZIOS,
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

export default function Step6Revisao({ data, triggerRef, onSavingChange, onSaved }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (saving) return;
    const { name, base, historia, elementos } = data;
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
        customizacoes: data.customizacoes ?? [],
        avatarUrl: data.currentImageUrl ?? null,
        avatarHistory: data.imageHistory ?? [],
        rosto: data.rosto ?? null,
        elementos: elementos ?? ELEMENTOS_VAZIOS,
        historia,
        historiaModo: data.historiaModo ?? "manual",
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
  const faccao = faccaoById(elementos.faccaoId);

  const tracos = base
    ? [
        APRESENTACOES.find((a) => a.id === base.apresentacao)?.label,
        TONS_DE_PELE.find((t) => t.id === base.tomDePele)?.label,
        FAIXAS_ETARIAS.find((f) => f.id === base.faixaEtaria)?.label,
        TIPOS_FISICOS.find((t) => t.id === base.tipoFisico)?.label,
      ].filter(Boolean)
    : [];

  return (
    <div className="space-y-6 max-w-2xl">
      <p className="font-crimson text-sm italic text-arcana-text-dim">
        Última olhada antes de cravar o nome no Oeste. Visual e história são
        identidade narrativa — atributos, antecedentes e compras vêm depois, com
        as regras do livro e o Juiz.
      </p>

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
          {(data.customizacoes?.length ?? 0) > 0 && (
            <p className="font-crimson text-sm text-arcana-text-dim">
              {data.customizacoes?.length}{" "}
              {data.customizacoes?.length === 1 ? "ajuste aplicado" : "ajustes aplicados"} ao retrato
              {data.rosto?.aplicado
                ? data.rosto.modo === "foto"
                  ? " · rosto a partir da sua foto"
                  : " · rosto descrito por você"
                : ""}
            </p>
          )}
        </div>
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
            {faccao && faccao.id !== "nenhuma" && (
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
