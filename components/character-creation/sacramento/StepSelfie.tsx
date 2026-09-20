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

export default function StepSelfie({ selfie, onSelfie }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOk, setCameraOk] = useState<boolean | null>(null);
  const [cameraErro, setCameraErro] = useState<string | null>(null);

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

  const capturar = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
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
    pararCamera();
    onSelfie(canvas.toDataURL("image/jpeg", 0.88));
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
      <div className="rounded-2xl p-5 space-y-2" style={CARD_STYLE}>
        <h3 className="font-cinzel text-xs uppercase tracking-[0.25em] text-arcana-gold-bright">
          Seu rosto entra na lenda
        </h3>
        <p className="font-crimson text-base text-arcana-text-dim leading-relaxed">
          Vamos forjar o retrato oficial do seu personagem com o seu próprio rosto. Centralize o
          rosto no círculo, procure boa iluminação de frente e faça uma cara séria de faroeste.
        </p>
        <p className="font-crimson text-sm italic text-arcana-text-dim">
          A selfie é usada apenas para gerar as artes do personagem — ela não fica salva.
        </p>
      </div>

      <div className="rounded-2xl p-5 space-y-5" style={CARD_STYLE}>
        <div className="relative mx-auto w-full max-w-sm aspect-square">
          {selfie ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selfie}
              alt="Sua selfie capturada"
              className="h-full w-full rounded-full object-cover"
              style={{ border: "2px solid var(--color-arcana-gold)", boxShadow: "0 0 32px rgba(209,171,85,0.25)" }}
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full rounded-full object-cover -scale-x-100"
                style={{ background: "rgba(11,11,20,0.8)" }}
              />
              {/* Máscara: escurece fora do círculo e desenha o guia dourado */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  border: "2px dashed rgba(209,171,85,0.75)",
                  boxShadow: "0 0 0 9999px rgba(11,11,20,0.55)",
                }}
              />
              <p className="pointer-events-none absolute inset-x-0 bottom-6 text-center font-cinzel text-[10px] uppercase tracking-[0.25em] text-arcana-gold-bright drop-shadow">
                Centralize o rosto no círculo
              </p>
            </>
          )}
        </div>

        {cameraErro && !selfie && (
          <p className="font-crimson text-sm italic text-arcana-danger text-center" role="alert">
            {cameraErro}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          {selfie ? (
            <button type="button" onClick={() => onSelfie(null)} className="arcana-btn-ghost">
              Tirar outra
            </button>
          ) : (
            <button
              type="button"
              onClick={capturar}
              disabled={cameraOk !== true}
              className={cameraOk === true ? "arcana-btn-primary" : "arcana-btn-primary-disabled"}
            >
              Capturar
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
          <p className="font-crimson text-base text-arcana-text text-center">
            Boa. Agora é só forjar o retrato no botão abaixo.
          </p>
        )}
      </div>
    </div>
  );
}
