import Link from "next/link";

type Props = {
  currentStep: number;
  totalSteps?: number;
  stepLabels?: string[];
  title?: string;
  backHref?: string;
  backLabel?: string;
};

const STEP_LABELS = [
  "Identidade",
  "Raça",
  "Classe",
  "Atributos",
  "Antecedente",
  "Equipamento",
  "Magias",
  "Revisão",
];

export function StepIndicator({
  currentStep,
  totalSteps,
  stepLabels = STEP_LABELS,
  title = "Novo personagem",
  backHref = "/hub",
  backLabel = "← Hub",
}: Props) {
  const total = totalSteps ?? stepLabels.length;
  const labels = stepLabels.slice(0, total);
  const currentLabel = stepLabels[currentStep - 1] ?? "";

  return (
    <div className="select-none space-y-4">
      {/* Top row: back link + wizard title */}
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-text-dim/60 hover:text-arcana-gold transition-colors"
        >
          {backLabel}
        </Link>
        <span className="font-cinzel text-[10px] uppercase tracking-[0.35em] text-arcana-text-dim/40">
          {title}
        </span>
      </div>

      {/* Current step name */}
      <div className="space-y-0.5">
        <p className="font-cinzel text-[9px] uppercase tracking-[0.45em] text-arcana-text-dim/50">
          Etapa {currentStep} de {total}
        </p>
        <h2
          className="font-cinzel uppercase tracking-[0.22em] text-arcana-gold-bright leading-none"
          style={{ fontSize: "clamp(1.4rem, 2.2vw, 1.85rem)" }}
        >
          {currentLabel}
        </h2>
      </div>

      {/* Segmented progress bar */}
      <div className="flex items-center gap-0.5">
        {labels.map((label, idx) => {
          const step = idx + 1;
          const isDone = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <div
              key={label}
              title={label}
              className="relative flex-1 h-[3px] rounded-full overflow-hidden transition-all duration-500"
              style={{
                background: isDone || isCurrent
                  ? "transparent"
                  : "rgba(42,42,66,0.6)",
              }}
            >
              {/* Filled portion */}
              {(isDone || isCurrent) && (
                <div
                  className="absolute inset-0 rounded-full transition-all duration-700"
                  style={{
                    background: isDone
                      ? "var(--color-arcana-gold)"
                      : "linear-gradient(90deg, var(--color-arcana-gold), var(--color-arcana-gold-bright))",
                    opacity: isDone ? 0.55 : 1,
                    boxShadow: isCurrent
                      ? "0 0 8px rgba(201,168,76,0.7), 0 0 2px rgba(201,168,76,0.9)"
                      : "none",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step labels — desktop only, below bar */}
      <div className="hidden lg:flex items-start gap-0.5">
        {labels.map((label, idx) => {
          const step = idx + 1;
          const isDone = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <div key={label} className="flex-1 overflow-hidden">
              <span
                className={[
                  "block font-cinzel text-[8px] uppercase tracking-[0.12em] whitespace-nowrap truncate transition-all duration-300",
                  isCurrent
                    ? "text-arcana-gold"
                    : isDone
                      ? "text-arcana-text-dim/50"
                      : "text-arcana-border/40",
                ].join(" ")}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
