"use client";

import { useState } from "react";

const tabs = [
  { key: "party", label: "Party", icon: "👥" },
  { key: "combat", label: "Combate", icon: "⚔️" },
  { key: "scene", label: "Cena", icon: "🎭" },
  { key: "dice", label: "Dados", icon: "🎲" },
  { key: "notes", label: "Notas", icon: "📝" },
] as const;

type Tab = (typeof tabs)[number]["key"];

function PartyTab() {
  return (
    <div className="flex flex-1 items-center justify-center text-zinc-500">
      <p>Nenhum jogador adicionado</p>
    </div>
  );
}

function CombatTab() {
  return (
    <div className="flex flex-1 items-center justify-center text-zinc-500">
      <p>Nenhum combate ativo</p>
    </div>
  );
}

function SceneTab() {
  return (
    <div className="flex flex-1 items-center justify-center text-zinc-500">
      <p>Nenhuma cena ativa</p>
    </div>
  );
}

function DiceTab() {
  return (
    <div className="flex flex-1 items-center justify-center text-zinc-500">
      <p>Role os dados</p>
    </div>
  );
}

function NotesTab() {
  return (
    <div className="flex flex-1 items-center justify-center text-zinc-500">
      <p>Nenhuma nota salva</p>
    </div>
  );
}

const tabContent: Record<Tab, () => React.JSX.Element> = {
  party: PartyTab,
  combat: CombatTab,
  scene: SceneTab,
  dice: DiceTab,
  notes: NotesTab,
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("party");
  const ActiveContent = tabContent[activeTab];

  return (
    <div className="mx-auto flex h-dvh w-full max-w-[390px] flex-col bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <h1 className="text-lg font-bold tracking-tight">GM Controller</h1>
        <span className="rounded-full bg-emerald-900/50 px-2 py-0.5 text-xs text-emerald-400">
          Sessao ativa
        </span>
      </header>

      {/* Content */}
      <main className="flex flex-1 flex-col overflow-y-auto p-4">
        <ActiveContent />
      </main>

      {/* Bottom navigation */}
      <nav className="flex border-t border-zinc-800 bg-zinc-900">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
              activeTab === tab.key
                ? "text-emerald-400"
                : "text-zinc-500 active:text-zinc-300"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
