"use client";

type RaceMinimal = {
  id: string;
  name: string;
  subraces: { id: string; name: string; abilityBonus: Record<string, number> }[];
  abilityBonus: Record<string, number>;
  speed: number;
  size: "small" | "medium";
  traits?: string[];
};

type Props = {
  race: RaceMinimal;
  selected: boolean;
  onSelect: (raceId: string) => void;
};

const ABILITY_PT: Record<string, string> = {
  str: "FOR", dex: "DES", con: "CON", int: "INT", wis: "SAB", cha: "CAR",
};

export function RaceCard({ race, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(race.id)}
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
          {race.name}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {Object.entries(race.abilityBonus).map(([key, value]) => (
            <span
              key={key}
              className={[
                "font-cinzel text-[9px] tracking-[0.1em] transition-colors duration-150",
                selected ? "text-arcana-gold/80" : "text-arcana-text-muted",
              ].join(" ")}
            >
              {value >= 0 ? "+" : ""}{value}{ABILITY_PT[key] ?? key.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
