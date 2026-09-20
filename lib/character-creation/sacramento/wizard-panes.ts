// Micro-etapas do wizard no MOBILE: o personagem fica sempre em cena e a
// gaveta inferior mostra uma fatia curta de cada etapa por vez. No desktop
// (foco undefined) cada etapa renderiza inteira, como sempre.

export type WizardPane = { id: string; titulo: string };

export const WIZARD_PANES: Record<string, WizardPane[]> = {
  tracos: [
    { id: "nome", titulo: "Nome & apresentação" },
    { id: "pele", titulo: "Tom de pele" },
    { id: "corpo", titulo: "Porte & idade" },
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
    { id: "nivel", titulo: "Nível inicial" },
    { id: "atributos", titulo: "Atributos" },
    { id: "antecedentes", titulo: "Antecedentes" },
  ],
  habilidades: [
    { id: "combate", titulo: "Combate" },
    { id: "profissao", titulo: "Profissão" },
  ],
};
