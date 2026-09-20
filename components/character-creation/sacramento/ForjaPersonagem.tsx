"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createSacramentoCharacter,
  type CreateSacramentoPayload,
} from "@/app/play/characters/new/actions";
import {
  ELEMENTOS_VAZIOS,
  FICHA_INICIAL,
  type ImagensGeradas,
  type SacramentoCreationData,
} from "@/lib/character-creation/sacramento/types";

type TipoImagem = "close" | "estados" | "banner";
type StatusImagem = "idle" | "gerando" | "ok" | "erro";

type Props = {
  data: Partial<SacramentoCreationData>;
  /** A forja roda no wizard (começa na selfie, durante as compras); aqui só se exibe e conclui. */
  status: Record<TipoImagem, StatusImagem>;
  erros: Partial<Record<TipoImagem, string>>;
  imagens: ImagensGeradas;
  onRetry: (tipo: TipoImagem) => void;
  /** Personagem salvo com sucesso — hora de limpar o rascunho. */
  onSaved: () => void;
  /** Jogador fechou a revelação — navegar para o Hub. */
  onExit: () => void;
  /** Fechar o overlay e voltar à revisão. */
  onCancel: () => void;
};

const TRABALHOS: { tipo: TipoImagem; rotulo: string }[] = [
  { tipo: "close", rotulo: "Retrato oficial" },
  { tipo: "estados", rotulo: "Marcas da jornada" },
  { tipo: "banner", rotulo: "Cartaz de procurado" },
];

const MENSAGENS = [
  "Revelando seu rosto ao Oeste…",
  "O retratista ajusta a luz do fim de tarde…",
  "Seis destinos sendo pintados numa prancha só…",
  "A tinta seca no papel envelhecido…",
  "Pregando o cartaz na porta do saloon…",
  "Sacramento vai conhecer seu nome…",
];

export default function ForjaPersonagem({
  data,
  status,
  erros,
  imagens,
  onRetry,
  onSaved,
  onExit,
  onCancel,
}: Props) {
  const [fase, setFase] = useState<"forja" | "salvando" | "revelacao" | "erro-salvar">("forja");
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const [mostrarFechar, setMostrarFechar] = useState(false);

  // Mensagens rotativas estilo tela de carregamento de console.
  useEffect(() => {
    if (fase !== "forja") return;
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % MENSAGENS.length), 3200);
    return () => clearInterval(t);
  }, [fase]);

  const salvar = useCallback(async () => {
    const { name, base, historia } = data;
    if (!name || !base || !historia) {
      onCancel();
      return;
    }
    setFase("salvando");
    setErroSalvar(null);
    try {
      const payload: CreateSacramentoPayload = {
        name,
        base,
        kitId: data.kitId ?? "base",
        elementos: data.elementos ?? ELEMENTOS_VAZIOS,
        historia,
        historiaModo: data.historiaModo ?? "manual",
        ficha: data.ficha ?? FICHA_INICIAL,
        imagens,
      };
      const result = await createSacramentoCharacter(payload);
      if (!result.ok) {
        setErroSalvar(result.error);
        setFase("erro-salvar");
        return;
      }
      onSaved();
      if (imagens.banner) {
        setFase("revelacao");
      } else {
        onExit();
      }
    } catch {
      setErroSalvar("Não foi possível salvar o personagem. Tente novamente.");
      setFase("erro-salvar");
    }
  }, [data, imagens, onCancel, onSaved, onExit]);

  // Todas as imagens resolvidas com sucesso → salva sozinho.
  const todasOk = TRABALHOS.every(({ tipo }) => status[tipo] === "ok");
  const algumaErro = TRABALHOS.some(({ tipo }) => status[tipo] === "erro");
  const aindaGerando = TRABALHOS.some(
    ({ tipo }) => status[tipo] === "gerando" || status[tipo] === "idle",
  );
  useEffect(() => {
    if (fase !== "forja" || !todasOk) return;
    // Pequena pausa dramática antes de cravar o registro (e mantém o setState fora do corpo do effect).
    const t = setTimeout(() => void salvar(), 400);
    return () => clearTimeout(t);
  }, [fase, todasOk, salvar]);

  // Botão de fechar só aparece depois de 2s de banner na tela.
  useEffect(() => {
    if (fase !== "revelacao") return;
    const t = setTimeout(() => setMostrarFechar(true), 2000);
    return () => clearTimeout(t);
  }, [fase]);

  return (
    <div className="arcana-scene fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-4 text-arcana-text">
      {fase === "revelacao" ? (
        <div className="relative flex h-full w-full flex-col items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagens.banner}
            alt={`Cartaz de procurado de ${data.name}`}
            className="forja-banner-reveal max-h-[80dvh] w-auto max-w-[92vw] object-contain"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 40%, rgba(11,11,20,0.65) 100%)",
            }}
          />
          {mostrarFechar && (
            <button
              type="button"
              onClick={onExit}
              className="arcana-btn-primary arcana-fade-in absolute bottom-10 z-10"
            >
              Entrar no Hub
            </button>
          )}
        </div>
      ) : (
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-2">
            <p className="font-cinzel text-[10px] uppercase tracking-[0.35em] text-arcana-gold">
              Sacramento · 1880
            </p>
            <h2 className="font-cinzel text-2xl uppercase tracking-[0.2em] text-arcana-gold-bright arcana-title-reveal">
              Forjando seu personagem
            </h2>
            <p className="font-crimson text-base italic text-arcana-text-dim min-h-6 transition-opacity">
              {fase === "salvando" ? "Cravando o nome no registro…" : MENSAGENS[msgIdx]}
            </p>
          </div>

          <div className="space-y-3 text-left">
            {TRABALHOS.map(({ tipo, rotulo }) => {
              const st = status[tipo];
              return (
                <div
                  key={tipo}
                  className="flex items-center gap-4 rounded-xl px-5 py-4"
                  style={{
                    background: "rgba(27,27,42,0.72)",
                    border:
                      st === "erro"
                        ? "1px solid rgba(224,112,95,0.5)"
                        : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span
                    aria-hidden
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-cinzel text-sm"
                    style={
                      st === "ok"
                        ? {
                            background:
                              "linear-gradient(180deg, #f0cc6a 0%, #d1ab55 55%, #bd9540 100%)",
                            color: "#1c1206",
                          }
                        : {
                            background: "var(--color-arcana-surface-3)",
                            border: "1px solid var(--color-arcana-gold-dim)",
                            color: "var(--color-arcana-gold-bright)",
                          }
                    }
                  >
                    {st === "ok" ? "✓" : st === "erro" ? "!" : <span className="forja-spinner" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-text">
                      {rotulo}
                    </p>
                    <p className="font-crimson text-sm italic text-arcana-text-dim truncate">
                      {(st === "gerando" || st === "idle") && "Em criação…"}
                      {st === "ok" && "Pronto"}
                      {st === "erro" && (erros[tipo] ?? "Falhou")}
                    </p>
                  </div>
                  {st === "erro" && (
                    <button
                      type="button"
                      onClick={() => onRetry(tipo)}
                      className="arcana-btn-ghost arcana-btn-sm shrink-0"
                    >
                      Tentar de novo
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {fase === "erro-salvar" && erroSalvar && (
            <div className="space-y-3">
              <p className="font-crimson text-sm italic text-arcana-danger" role="alert">
                {erroSalvar}
              </p>
              <button type="button" onClick={() => void salvar()} className="arcana-btn-primary">
                Salvar de novo
              </button>
            </div>
          )}

          {algumaErro && !aindaGerando && fase === "forja" && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={() => void salvar()} className="arcana-btn-primary">
                Seguir com o que deu certo
              </button>
              <button type="button" onClick={onCancel} className="arcana-btn-ghost">
                Voltar à revisão
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .forja-spinner {
          display: block;
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          border: 2px solid rgba(209, 171, 85, 0.25);
          border-top-color: #f5d478;
          animation: forjaSpin 0.9s linear infinite;
        }
        .forja-banner-reveal {
          animation: forjaReveal 1.1s cubic-bezier(0.22, 1, 0.36, 1) both;
          filter: drop-shadow(0 0 40px rgba(209, 171, 85, 0.35));
        }
        @keyframes forjaSpin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes forjaReveal {
          0% {
            opacity: 0;
            transform: scale(1.18) translateY(12px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .forja-spinner,
          .forja-banner-reveal {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
