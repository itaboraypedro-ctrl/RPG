type Props = {
  currentStep: number;
  totalSteps?: number;
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

export function StepIndicator({ currentStep, totalSteps = 8 }: Props) {
  const labels = STEP_LABELS.slice(0, totalSteps);
  const progressPct =
    totalSteps > 1
      ? Math.max(
          0,
          Math.min(100, ((currentStep - 1) / (totalSteps - 1)) * 100)
        )
      : 0;

  return (
    <div className="mb-6 w-full">
      <div className="relative">
        {/* Track background */}
        <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-arcana-border" />
        {/* Track filled */}
        <div
          className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-arcana-gold transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />

        <ol className="relative flex items-center justify-between">
          {labels.map((_, idx) => {
            const step = idx + 1;
            const isDone = step < currentStep;
            const isCurrent = step === currentStep;

            return (
              <li key={step} className="relative z-10 flex flex-col items-center">
                <span
                  className={[
                    "h-3 w-3 rounded-full border transition-all",
                    isDone
                      ? "bg-arcana-gold border-arcana-gold"
                      : isCurrent
                        ? "bg-arcana-gold-bright border-arcana-gold-bright animate-pulse ring-2 ring-arcana-gold-bright/40 ring-offset-2 ring-offset-arcana-bg"
                        : "bg-arcana-bg border-arcana-border",
                  ].join(" ")}
                  aria-current={isCurrent ? "step" : undefined}
                />
              </li>
            );
          })}
        </ol>
      </div>

      {/* Desktop labels */}
      <ol className="mt-3 hidden lg:flex items-start justify-between">
        {labels.map((label, idx) => {
          const step = idx + 1;
          const isDone = step < currentStep;
          const isCurrent = step === currentStep;
          return (
            <li
              key={label}
              className={[
                "flex-1 text-center font-cinzel uppercase tracking-[0.2em] text-[10px]",
                isCurrent
                  ? "text-arcana-gold-bright"
                  : isDone
                    ? "text-arcana-gold"
                    : "text-arcana-text-dim",
              ].join(" ")}
            >
              {label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
