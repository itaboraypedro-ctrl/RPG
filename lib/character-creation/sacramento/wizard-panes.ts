// Micro-etapas do wizard no MOBILE: o personagem fica sempre em cena e a
// gaveta inferior mostra uma fatia curta de cada etapa por vez. No desktop
// (foco undefined) cada etapa renderiza inteira, como sempre.

export type WizardPane = {
  id: string;
  titulo: string;
  /** Controles compactos flutuam SOBRE a cena quase cheia (sem gaveta). */
  overlay?: boolean;
};

export const WIZARD_PANES: Record<string, WizardPane[]> = {
  tracos: [
    { id: "nome", titulo: "Nome & apresentação", overlay: true },
    { id: "pele", titulo: "Tom de pele", overlay: true },
    { id: "corpo", titulo: "Porte & idade", overlay: true },
    { id: "kit", titulo: "Estilo de roupa" },
  ],
  elementos: [
    { id: "conceito", titulo: "Conceito" },
    { id: "origem", titulo: "Origem" },
    { id: "ocupacao", titulo: "Ocupação" },
    { id: "familia", titulo: "Família" },
    { id: "passado", titulo: "Passado" },
    { id: "faccao", titulo: "Facções" },
    { id: "vinculos", titulo: "Vínculos" },
    { id: "redencao", titulo: "Trilha de Redenção" },
  ],
  atributos: [
    { id: "nivel", titulo: "Nível inicial", overlay: true },
    { id: "atributos", titulo: "Atributos" },
    { id: "antecedentes", titulo: "Antecedentes" },
  ],
  habilidades: [
    { id: "combate", titulo: "Combate" },
    { id: "profissao", titulo: "Profissão" },
  ],
};
