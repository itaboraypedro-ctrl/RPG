type Props = {
  step: 1 | 2;
};

export function RegisterStepIndicator({ step }: Props) {
  const states = [step >= 1, step >= 2, false] as const;
  return (
    <div className="flex items-center justify-center gap-3" aria-hidden="true">
      {states.map((filled, i) => (
        <span
          key={i}
          className={`h-2 w-2 rounded-full transition-colors ${
            filled
              ? "bg-arcana-gold shadow-[0_0_8px_rgba(201,168,76,0.6)]"
              : "bg-arcana-border"
          }`}
        />
      ))}
    </div>
  );
}
