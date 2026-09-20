"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  /** Data URL da selfie confirmada (ou null). */
  selfie: string | null;
  onSelfie: (dataUrl: string | null) => void;
};

const CARD_STYLE = {
  background: "rgba(27,27,42,0.72)",
  border: "1px solid rgba(255,255,255,0.08)",
} as const;

/** Lado do quadrado capturado — suficiente para o gpt-image-1 ler o rosto. */
const CAPTURE_SIZE = 768;

// Assets do estúdio do retratista — a tela degrada com elegância se ainda não existirem.
const FOTOGRAFO_IMG = "/story/fotografo/fotografo.webp";
const ESTUDIO_IMG = "/story/fotografo/estudio.webp";
const IRIS_IMG = "/story/fotografo/iris.png";

export default function StepSelfie({ selfie, onSelfie }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const flashTimerRef = useRef<number | null>(null);
  const [cameraOk, setCameraOk] = useState<boolean | null>(null);
  const [cameraErro, setCameraErro] = useState<string | null>(null);
  const [disparando, setDisparando] = useState(false);
  const [temFotografo, setTemFotografo] = useState(true);
  const [temEstudio, setTemEstudio] = useState(true);
  const [temIris, setTemIris] = useState(true);

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
    } catch {
      setCameraOk(false);
      setCameraErro(
        "Não conseguimos acessar a câmera. Libere o acesso no navegador ou envie uma foto abaixo.",
      );
    }
  }, []);

  // Sem selfie confirmada → câmera ligada; ao sair da etapa, desliga.
  // A câmera é um sistema externo: os setState acontecem nas continuações async.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!selfie) void ligarCamera();
    return pararCamera;
  }, [selfie, ligarCamera, pararCamera]);

  useEffect(
    () => () => {
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current);
    },
    [],
  );

  const entregarFoto = (dataUrl: string) => {
    // O disparo cênico (íris + flash) fecha antes da foto aparecer.
    setDisparando(true);
    flashTimerRef.current = window.setTimeout(() => {
      pararCamera();
      onSelfie(dataUrl);
      setDisparando(false);
    }, 650);
  };

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
    entregarFoto(canvas.toDataURL("image/jpeg", 0.88));
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
            Centralize o rosto no círculo, com boa luz de frente. A foto serve só para pintar seus
            retratos — ela não fica salva.
          </p>
        </div>
      </div>

      {/* O estúdio: cenário + câmera de círculo */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8"
        style={{ border: "1px solid rgba(209,171,85,0.25)" }}
      >
        {/* Cenário do estúdio ao fundo */}
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
        {/* Escurece o cenário para o círculo dominar a cena */}
        <div aria-hidden className="absolute inset-0" style={{ background: "rgba(11,11,20,0.62)" }} />

        <div className="relative mx-auto w-full max-w-sm aspect-square">
          {selfie ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selfie}
              alt="Sua selfie capturada"
              className="selfie-revelada h-full w-full rounded-full object-cover"
              style={{
                border: "2px solid var(--color-arcana-gold)",
                boxShadow: "0 0 40px rgba(209,171,85,0.3)",
              }}
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full rounded-full object-cover -scale-x-100"
                style={{ background: "rgba(11,11,20,0.85)" }}
              />
              {/* Aro da lente + máscara fora do círculo */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  border: "3px solid rgba(209,171,85,0.8)",
                  boxShadow:
                    "0 0 0 6px rgba(28,18,6,0.85), 0 0 0 8px rgba(209,171,85,0.35), 0 0 0 9999px rgba(11,11,20,0.45), inset 0 0 60px rgba(11,11,20,0.55)",
                }}
              />
              {/* Marcações de lente antiga */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(0deg, transparent 48.8%, rgba(209,171,85,0.4) 49.2%, rgba(209,171,85,0.4) 50.8%, transparent 51.2%) no-repeat 50% 0/2px 14px, linear-gradient(0deg, transparent 48.8%, rgba(209,171,85,0.4) 49.2%, rgba(209,171,85,0.4) 50.8%, transparent 51.2%) no-repeat 50% 100%/2px 14px",
                }}
              />
              <p className="pointer-events-none absolute inset-x-0 bottom-6 text-center font-cinzel text-[10px] uppercase tracking-[0.25em] text-arcana-gold-bright drop-shadow">
                Centralize o rosto no círculo
              </p>
              {/* Disparo: íris fecha + flash de magnésio */}
              {disparando && (
                <>
                  {temIris ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={IRIS_IMG}
                      alt=""
                      aria-hidden
                      className="iris-fechando pointer-events-none absolute inset-0 h-full w-full rounded-full object-cover"
                      onError={() => setTemIris(false)}
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="iris-fechando pointer-events-none absolute inset-0 rounded-full"
                      style={{ boxShadow: "inset 0 0 0 200px rgba(11,11,20,0.95)" }}
                    />
                  )}
                  <div aria-hidden className="flash-magnesio pointer-events-none fixed inset-0 z-40" />
                </>
              )}
            </>
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
                cameraOk === true && !disparando ? "arcana-btn-primary" : "arcana-btn-primary-disabled"
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
        .iris-fechando {
          animation: irisFecha 0.55s cubic-bezier(0.7, 0, 0.84, 0) both;
          transform-origin: center;
        }
        .flash-magnesio {
          background: radial-gradient(ellipse at center, #fff8e7 0%, rgba(255, 248, 231, 0.85) 45%, transparent 100%);
          animation: flashPop 0.65s ease-out both;
        }
        .selfie-revelada {
          animation: selfieRevela 0.6s ease-out both;
        }
        @keyframes irisFecha {
          0% {
            transform: scale(2.6) rotate(0deg);
            opacity: 0;
          }
          35% {
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(35deg);
            opacity: 1;
          }
        }
        @keyframes flashPop {
          0% {
            opacity: 0;
          }
          55% {
            opacity: 0;
          }
          65% {
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
          .iris-fechando,
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
