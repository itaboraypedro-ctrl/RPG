"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  /** Data URL da selfie confirmada (ou null). */
  selfie: string | null;
  onSelfie: (dataUrl: string | null) => void;
  /** Nome do personagem — o retratista chama pelo nome na recepção. */
  characterName?: string;
};

const CARD_STYLE = {
  background: "rgba(27,27,42,0.72)",
  border: "1px solid rgba(255,255,255,0.08)",
} as const;

/** Lado do quadrado capturado — suficiente para o gpt-image-1 ler o rosto. */
const CAPTURE_SIZE = 768;

const FOTOGRAFO_IMG = "/story/fotografo/fotografo.webp";
const ESTUDIO_IMG = "/story/fotografo/estudio.webp";
/** Obturador real em 5 quadros: 0 = aberto, 4 = fechado. */
const IRIS_FRAMES = [0, 1, 2, 3, 4].map(
  (i) => `/story/fotografo/iris-${String(i).padStart(2, "0")}.webp`,
);
/** O vídeo vive sob a abertura interna do aro da íris (13% de margem → 74% de diâmetro). */
const LENTE_BOX = { top: "13%", left: "13%", width: "74%", height: "74%" } as const;

export default function StepSelfie({ selfie, onSelfie, characterName }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const irisTimerRef = useRef<number | null>(null);
  const irisFrameRef = useRef(4);
  // O retratista recebe o forasteiro ANTES de a lente aparecer — e a câmera
  // só pede permissão depois que o jogador topa.
  const [fase, setFase] = useState<"apresentacao" | "camera">("apresentacao");
  const [cameraOk, setCameraOk] = useState<boolean | null>(null);
  const [cameraErro, setCameraErro] = useState<string | null>(null);
  const [irisFrame, setIrisFrame] = useState(4);
  const [flashAtivo, setFlashAtivo] = useState(false);
  const [disparando, setDisparando] = useState(false);
  const [temFotografo, setTemFotografo] = useState(true);
  const [temEstudio, setTemEstudio] = useState(true);
  const [temIris, setTemIris] = useState(true);

  // ---- Íris: animação quadro a quadro (0 aberta ↔ 4 fechada) ----
  const animarIris = useCallback((para: number, msPorQuadro: number, aoTerminar?: () => void) => {
    if (irisTimerRef.current) window.clearTimeout(irisTimerRef.current);
    const reduzMovimento =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzMovimento) {
      irisFrameRef.current = para;
      setIrisFrame(para);
      aoTerminar?.();
      return;
    }
    const passo = () => {
      const atual = irisFrameRef.current;
      if (atual === para) {
        aoTerminar?.();
        return;
      }
      const proximo = atual + (para > atual ? 1 : -1);
      irisFrameRef.current = proximo;
      setIrisFrame(proximo);
      irisTimerRef.current = window.setTimeout(passo, msPorQuadro);
    };
    passo();
  }, []);

  // Pré-carrega os quadros para a animação não piscar.
  useEffect(() => {
    IRIS_FRAMES.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  useEffect(
    () => () => {
      if (irisTimerRef.current) window.clearTimeout(irisTimerRef.current);
    },
    [],
  );

  const pararCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const ligarCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setCameraOk(true);
      setCameraErro(null);
      // Câmera autorizada → o obturador se abre.
      animarIris(0, 110);
    } catch {
      setCameraOk(false);
      setCameraErro(
        "Não conseguimos acessar a câmera. Libere o acesso no navegador ou envie uma foto abaixo.",
      );
    }
  }, [animarIris]);

  // Câmera só liga depois da recepção do retratista; ao sair da etapa, desliga.
  // A câmera é um sistema externo: os setState acontecem nas continuações async.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!selfie && fase === "camera") void ligarCamera();
    return pararCamera;
  }, [selfie, fase, ligarCamera, pararCamera]);

  const capturar = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || disparando) return;
    const lado = Math.min(video.videoWidth, video.videoHeight);
    const canvas = document.createElement("canvas");
    canvas.width = CAPTURE_SIZE;
    canvas.height = CAPTURE_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Recorte central quadrado, desespelhado (a prévia é espelhada, a foto não deve ser).
    ctx.translate(CAPTURE_SIZE, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(
      video,
      (video.videoWidth - lado) / 2,
      (video.videoHeight - lado) / 2,
      lado,
      lado,
      0,
      0,
      CAPTURE_SIZE,
      CAPTURE_SIZE,
    );
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
    // Disparo cênico: obturador fecha rápido, flash de magnésio, e a foto se revela.
    setDisparando(true);
    animarIris(4, 55, () => {
      setFlashAtivo(true);
      window.setTimeout(() => {
        pararCamera();
        onSelfie(dataUrl);
        setDisparando(false);
        setFlashAtivo(false);
      }, 420);
    });
  };

  const receberArquivo = (file: File | undefined) => {
    if (!file || !/^image\/(png|jpeg|webp)$/.test(file.type)) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const lado = Math.min(img.width, img.height);
        const canvas = document.createElement("canvas");
        canvas.width = CAPTURE_SIZE;
        canvas.height = CAPTURE_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(
          img,
          (img.width - lado) / 2,
          (img.height - lado) / 2,
          lado,
          lado,
          0,
          0,
          CAPTURE_SIZE,
          CAPTURE_SIZE,
        );
        pararCamera();
        onSelfie(canvas.toDataURL("image/jpeg", 0.88));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const aroAberto = IRIS_FRAMES[0];
  const quadroAtual = IRIS_FRAMES[irisFrame];

  // ── Recepção: o retratista aprova o freguês antes de a lente aparecer ──
  if (!selfie && fase === "apresentacao") {
    return (
      <div className="max-w-2xl">
        <div
          className="arcana-rise-in relative overflow-hidden rounded-2xl p-6 sm:p-10"
          style={{ border: "1px solid rgba(209,171,85,0.25)" }}
        >
          {temEstudio ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ESTUDIO_IMG} alt="" aria-hidden
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => setTemEstudio(false)} />
          ) : (
            <div aria-hidden className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, #14141f 0%, #0b0b14 100%)" }} />
          )}
          <div aria-hidden className="absolute inset-0" style={{ background: "rgba(11,11,20,0.68)" }} />

          <div className="relative flex flex-col items-center gap-4 text-center">
            {temFotografo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={FOTOGRAFO_IMG} alt="O retratista de Sacramento"
                className="h-36 w-36 rounded-2xl object-cover"
                style={{
                  border: "1px solid rgba(209,171,85,0.55)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 24px rgba(209,171,85,0.18)",
                }}
                onError={() => setTemFotografo(false)} />
            ) : (
              <div className="flex h-36 w-36 items-center justify-center rounded-2xl font-cinzel text-5xl text-arcana-gold-bright"
                style={{ background: "var(--color-arcana-surface-3)" }} aria-hidden>
                R
              </div>
            )}
            <p className="font-cinzel text-[10px] uppercase tracking-[0.35em] text-arcana-gold">
              O retratista
            </p>
            <p className="font-crimson text-xl text-arcana-text leading-snug max-w-md">
              &ldquo;Ora… então {characterName?.trim() ? `você é ${characterName.trim()}` : "é você o tal forasteiro"}.
              Gostei da sua figura. Mas lenda nenhuma roda o Oeste sem retrato — fique firme,
              que eu preciso de uma fotografia sua agora.&rdquo;
            </p>
            <p className="font-crimson text-sm italic text-arcana-text-dim">
              Leva um instante: rosto na lente, boa luz de frente, cara séria.
            </p>
            <button type="button" onClick={() => setFase("camera")} className="arcana-btn-primary">
              Estou pronto
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* O retratista recebe o forasteiro */}
      <div className="rounded-2xl p-5 flex items-start gap-4" style={CARD_STYLE}>
        <div
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl"
          style={{ border: "1px solid rgba(209,171,85,0.45)" }}
        >
          {temFotografo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={FOTOGRAFO_IMG}
              alt="O retratista de Sacramento"
              className="h-full w-full object-cover"
              onError={() => setTemFotografo(false)}
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center font-cinzel text-2xl text-arcana-gold-bright"
              style={{ background: "var(--color-arcana-surface-3)" }}
              aria-hidden
            >
              R
            </div>
          )}
        </div>
        <div className="min-w-0 space-y-1">
          <p className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold">
            O retratista
          </p>
          <p className="font-crimson text-lg text-arcana-text leading-snug">
            &ldquo;Firme aí, forasteiro. Olho na lente, queixo erguido — e nada de sorrir. Retrato
            de respeito se tira com cara de poucos amigos.&rdquo;
          </p>
          <p className="font-crimson text-sm italic text-arcana-text-dim">
            Centralize o rosto na lente, com boa luz de frente. A foto serve só para pintar seus
            retratos — ela não fica salva.
          </p>
        </div>
      </div>

      {/* O estúdio: cenário + lente com obturador real */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{ border: "1px solid rgba(209,171,85,0.25)" }}
      >
        {temEstudio ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ESTUDIO_IMG}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setTemEstudio(false)}
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 30%, rgba(209,171,85,0.12), transparent 60%), linear-gradient(180deg, #14141f 0%, #0b0b14 100%)",
            }}
          />
        )}
        {/* Meia-luz para a lente dominar a cena */}
        <div aria-hidden className="absolute inset-0" style={{ background: "rgba(11,11,20,0.5)" }} />

        <div className="relative mx-auto w-full max-w-sm aspect-square">
          {selfie ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selfie}
                alt="Sua selfie capturada"
                className="selfie-revelada absolute rounded-full object-cover"
                style={LENTE_BOX}
              />
              {temIris && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={aroAberto}
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                  onError={() => setTemIris(false)}
                />
              )}
            </>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute rounded-full object-cover -scale-x-100"
                style={{ ...LENTE_BOX, background: "rgba(11,11,20,0.85)" }}
              />
              {temIris ? (
                // Obturador real: fechado ao chegar, abre com a câmera, fecha no disparo.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={quadroAtual}
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                  onError={() => setTemIris(false)}
                />
              ) : (
                <div
                  aria-hidden
                  className="pointer-events-none absolute rounded-full"
                  style={{
                    ...LENTE_BOX,
                    border: "3px solid rgba(209,171,85,0.8)",
                    boxShadow:
                      "0 0 0 6px rgba(28,18,6,0.85), 0 0 0 8px rgba(209,171,85,0.35), inset 0 0 60px rgba(11,11,20,0.55)",
                  }}
                />
              )}
              <p className="pointer-events-none absolute inset-x-0 -bottom-1 text-center font-cinzel text-[10px] uppercase tracking-[0.25em] text-arcana-gold-bright drop-shadow">
                Centralize o rosto na lente
              </p>
            </>
          )}
          {flashAtivo && (
            <div aria-hidden className="flash-magnesio pointer-events-none fixed inset-0 z-40" />
          )}
        </div>

        {cameraErro && !selfie && (
          <p
            className="relative mt-4 text-center font-crimson text-sm italic text-arcana-danger"
            role="alert"
          >
            {cameraErro}
          </p>
        )}

        <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
          {selfie ? (
            <button type="button" onClick={() => onSelfie(null)} className="arcana-btn-ghost">
              Tirar outra
            </button>
          ) : (
            <button
              type="button"
              onClick={capturar}
              disabled={cameraOk !== true || disparando}
              className={
                cameraOk === true && !disparando
                  ? "arcana-btn-primary"
                  : "arcana-btn-primary-disabled"
              }
            >
              {disparando ? "…" : "Tirar o retrato"}
            </button>
          )}
          <label className="arcana-btn-ghost arcana-btn-sm cursor-pointer">
            Enviar uma foto
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              capture="user"
              className="hidden"
              onChange={(e) => receberArquivo(e.target.files?.[0])}
            />
          </label>
        </div>

        {selfie && (
          <p className="relative mt-4 text-center font-crimson text-base text-arcana-text">
            &ldquo;Boa pose. Agora siga — seus retratos ficam prontos enquanto você faz as
            compras.&rdquo;
          </p>
        )}
      </div>

      <style jsx>{`
        .flash-magnesio {
          background: radial-gradient(
            ellipse at center,
            #fff8e7 0%,
            rgba(255, 248, 231, 0.85) 45%,
            transparent 100%
          );
          animation: flashPop 0.42s ease-out both;
        }
        .selfie-revelada {
          animation: selfieRevela 0.6s ease-out both;
        }
        @keyframes flashPop {
          0% {
            opacity: 0;
          }
          18% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        @keyframes selfieRevela {
          0% {
            opacity: 0;
            transform: scale(1.06);
            filter: sepia(0.6) brightness(1.4);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: none;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .flash-magnesio,
          .selfie-revelada {
            animation: none;
          }
          .flash-magnesio {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
