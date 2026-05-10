"use client";

type RaceMinimal = {
  id: string;
  name: string;
  subraces: { id: string; name: string; abilityBonus: Record<string, number> }[];
  abilityBonus: Record<string, number>;
  speed: number;
  size: "small" | "medium";
};

type Props = {
  race: RaceMinimal;
  selected: boolean;
  selectedSubraceId?: string;
  onSelect: (raceId: string, subraceId?: string) => void;
};

const RACE_EMOJI: Record<string, string> = {
  anao: "🪓",
  elfo: "🏹",
  halfling: "🌾",
  humano: "👤",
  draconato: "🐉",
  gnomo: "🌟",
  "meio-elfo": "✨",
  "meio-orc": "💪",
  tiefling: "😈",
};

const ABILITY_PT: Record<string, string> = {
  str: "FOR",
  dex: "DES",
  con: "CON",
  int: "INT",
  wis: "SAB",
  cha: "CAR",
};

function bonusChips(bonus: Record<string, number>) {
  return Object.entries(bonus).map(([key, value]) => {
    const label = ABILITY_PT[key] ?? key.toUpperCase();
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value} ${label}`;
  });
}

export function RaceCard({ race, selected, selectedSubraceId, onSelect }: Props) {
  const emoji = RACE_EMOJI[race.id] ?? "❖";
  const chips = bonusChips(race.abilityBonus);
  const speedM = (race.speed * 0.3).toFixed(1).replace(".", ",");
  const sizePt = race.size === "small" ? "Pequeno" : "Médio";

  const handleCardClick = () => {
    if (race.subraces.length > 0) {
      // Select race; require explicit subrace pick
      onSelect(race.id, selectedSubraceId);
    } else {
      onSelect(race.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={[
        "border bg-arcana-surface p-5 cursor-pointer transition-all rounded-md",
        selected
          ? "border-arcana-gold shadow-[0_0_20px_rgba(201,168,76,0.3)]"
          : "border-arcana-border hover:border-arcana-gold/40",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden>
          {emoji}
        </span>
        <h3
          className="font-cinzel text-arcana-text"
          style={{ fontSize: "1.25rem" }}
        >
          {race.name}
        </h3>
      </div>

      {chips.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <span
              key={chip}
              className="px-2 py-0.5 text-[10px] font-cinzel tracking-[0.15em] uppercase border border-arcana-gold/40 text-arcana-gold rounded-sm"
            >
              {chip}
            </span>
          ))}
        </div>
      ) : null}

      <p className="mt-3 text-xs text-arcana-text-dim font-crimson">
        {speedM}m · {sizePt}
      </p>

      {selected && race.subraces.length > 0 ? (
        <div className="mt-4 pt-4 border-t border-arcana-gold/20">
          <p className="mb-2 font-cinzel uppercase tracking-[0.2em] text-[10px] text-arcana-gold/70">
            Sub-raça
          </p>
          <div
            className="flex flex-col gap-2"
            role="radiogroup"
            aria-label="Sub-raça"
          >
            {race.subraces.map((sub) => {
              const isActive = selectedSubraceId === sub.id;
              const subChips = bonusChips(sub.abilityBonus);
              return (
                <button
                  key={sub.id}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(race.id, sub.id);
                  }}
                  className={[
                    "text-left px-3 py-2 rounded border transition-colors",
                    isActive
                      ? "border-arcana-gold bg-arcana-gold/10 text-arcana-gold-bright"
                      : "border-arcana-border hover:border-arcana-gold/40 text-arcana-text",
                  ].join(" ")}
                >
                  <div className="font-cinzel text-sm">{sub.name}</div>
                  {subChips.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {subChips.map((chip) => (
                        <span
                          key={chip}
                          className="px-1.5 py-0.5 text-[9px] font-cinzel tracking-[0.15em] uppercase border border-arcana-gold/30 text-arcana-gold/80 rounded-sm"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
