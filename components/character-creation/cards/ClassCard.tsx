"use client";

type ClassMinimal = {
  id: string;
  name: string;
  hitDie: 6 | 8 | 10 | 12;
  primaryAbility: string;
  vibe: string;
};

type Props = {
  classData: ClassMinimal;
  selected: boolean;
  onSelect: (classId: string) => void;
};

export function ClassCard({ classData, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(classData.id)}
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
          {classData.name}
        </span>
        <span
          className={[
            "font-cinzel text-[9px] tracking-[0.15em] transition-colors duration-150 shrink-0",
            selected ? "text-arcana-gold/70" : "text-arcana-text-muted",
          ].join(" ")}
        >
          d{classData.hitDie}
        </span>
      </div>
    </button>
  );
}
