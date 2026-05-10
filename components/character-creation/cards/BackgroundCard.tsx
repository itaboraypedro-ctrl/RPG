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
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(background.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(background.id);
        }
      }}
      className={[
        "border bg-arcana-surface p-5 cursor-pointer transition-all rounded-md",
        selected
          ? "border-arcana-gold shadow-[0_0_20px_rgba(201,168,76,0.3)]"
          : "border-arcana-border hover:border-arcana-gold/40",
      ].join(" ")}
    >
      <h3
        className="font-cinzel text-arcana-text"
        style={{ fontSize: "1.25rem" }}
      >
        {background.name}
      </h3>

      {background.skills.length > 0 ? (
        <p className="mt-2 text-xs text-arcana-text-dim font-crimson">
          <span className="text-arcana-text-dim">Perícias: </span>
          <span className="text-arcana-text">
            {background.skills.join(", ")}
          </span>
        </p>
      ) : null}

      {background.feature ? (
        <p className="mt-2 font-cinzel uppercase tracking-[0.2em] text-[10px] text-arcana-gold">
          {background.feature}
        </p>
      ) : null}

      {background.visualDetail ? (
        <p className="mt-3 font-crimson italic text-arcana-text-dim text-sm leading-snug">
          ✦ {background.visualDetail}
        </p>
      ) : null}
    </div>
  );
}
