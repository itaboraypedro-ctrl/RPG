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

const CLASS_EMOJI: Record<string, string> = {
  barbaro: "🪓",
  bardo: "🎵",
  bruxo: "🔮",
  clerigo: "✝️",
  druida: "🌿",
  feiticeiro: "⚡",
  guerreiro: "⚔️",
  ladino: "🗡️",
  mago: "📖",
  monge: "🥋",
  paladino: "🛡️",
  patrulheiro: "🏹",
};

export function ClassCard({ classData, selected, onSelect }: Props) {
  const emoji = CLASS_EMOJI[classData.id] ?? "❖";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(classData.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(classData.id);
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
          {classData.name}
        </h3>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center px-2 py-0.5 font-cinzel tracking-[0.15em] uppercase border border-arcana-gold text-arcana-gold-bright rounded-sm text-[10px]">
          Dado de vida: d{classData.hitDie}
        </span>
      </div>

      <p className="mt-2 text-xs text-arcana-text-dim font-crimson">
        Atributo:{" "}
        <span className="text-arcana-text">{classData.primaryAbility}</span>
      </p>

      {classData.vibe ? (
        <p className="mt-3 font-crimson italic text-arcana-text-dim text-sm leading-snug">
          {classData.vibe}
        </p>
      ) : null}
    </div>
  );
}
