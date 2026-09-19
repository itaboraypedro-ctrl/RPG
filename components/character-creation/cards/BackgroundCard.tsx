"use client";

type BackgroundMinimal = {
  id: string;
  name: string;
  skills: string[];
  visualDetail: string;
  feature: string;
};

type Props = {
  background: BackgroundMinimal;
  selected: boolean;
  onSelect: (backgroundId: string) => void;
};

export function BackgroundCard({ background, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(background.id)}
      className={[
        "arcana-list-item w-full text-left px-4 py-3 transition-all duration-150",
        selected
          ? "arcana-item-selected arcana-item-selected-glow"
          : "arcana-item-idle",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={[
            "font-cinzel text-sm uppercase tracking-[0.18em] transition-colors duration-150",
            selected ? "text-arcana-gold-bright" : "text-arcana-text-dim",
          ].join(" ")}
        >
          {background.name}
        </span>
        {background.feature && (
          <span
            className={[
              "font-cinzel text-[9px] tracking-[0.1em] uppercase shrink-0 transition-colors duration-150",
              selected ? "text-arcana-gold/60" : "text-arcana-text-muted",
            ].join(" ")}
          >
            {background.feature}
          </span>
        )}
      </div>
      {background.skills.length > 0 && (
        <p
          className={[
            "mt-0.5 font-crimson text-[11px] transition-colors duration-150",
            selected ? "text-arcana-text-dim" : "text-arcana-text-muted",
          ].join(" ")}
        >
          {background.skills.join(", ")}
        </p>
      )}
    </button>
  );
}
