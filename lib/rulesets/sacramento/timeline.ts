// Âncoras cronológicas do mundo padrão (Doc 2 §5.2, pp. 131–132) e
// calendário do Bom de Gole (Doc 2 §5.4, p. 149).
// Referência para o calendário ficcional da campanha; presente editorial: 1880.
// Lacunas de lore conhecidas (Guerra do Carvão "recente", porto de BH) são do
// próprio livro — não bloquear criação por essas tensões.

import type { TimelineAnchor } from "./types";

export const SACRAMENTO_TIMELINE: TimelineAnchor[] = [
  { ano: "400", marco: "Fundação de Maria da Fé" },
  { ano: "420", marco: "Ocupação dos platôs pelos Celestes" },
  { ano: "420–1510", marco: "Ocupação do País por diversos povos originários" },
  { ano: "1510", marco: "Primeiros navios do Estrangeiro" },
  { ano: "1531", marco: "Primeiras cidades do Leste; Tupaciguara" },
  { ano: "1564", marco: "Exploradores atravessam a Serra da Saudade" },
  { ano: "1610", marco: "Vila de Desemboque" },
  { ano: "1693", marco: "Sacramento" },
  { ano: "1715", marco: "Santo Ozório" },
  { ano: "1730", marco: "Independência do País" },
  { ano: "1741", marco: "Belo Horizonte" },
  { ano: "1775", marco: "Araguari" },
  { ano: "1800", marco: "Presídio Sepulcro" },
  { ano: "1803", marco: "Revolução Industrial no Estrangeiro" },
  { ano: "1810", marco: "Abertura do porto de Belo Horizonte" },
  { ano: "1829–1830", marco: "Imigração do Oriente; Bairro Oriental em BH" },
  { ano: "1832", marco: "Joaquim José mata o Presidente; vice assume; Guerra do Carvão" },
  { ano: "1835", marco: "Fim da guerra; redução do preço das terras do Oeste" },
  { ano: "1836–1837", marco: "Gangue do Nero com Zói de Gato; fundação de Bom Fim" },
  { ano: "1840", marco: "Abertura do Bom de Gole" },
  { ano: "1843", marco: "Nascimento de Golia no Circo do Sol" },
  { ano: "1845", marco: "Terror causado pelo Degolador" },
  { ano: "1850", marco: "Peste na Vila de Desemboque" },
  { ano: "1856–1857", marco: "Nero mata a esposa de Horácio; Zói de Gato deixa a gangue" },
  { ano: "1858–1859", marco: "Surgem Sagrados e sete Bispos; cabeça do Degolador exposta" },
  { ano: "1860–1862", marco: "Pesadelo mata o pai de Cristina; Presidente assassinado; Fivela de Cobra surge" },
  { ano: "1870", marco: "Bispa expulsa os Celestes" },
  { ano: "1876", marco: "Formação dos Pavio Curto e derrota dos Sagrados" },
  { ano: "1878", marco: "Surgem Novos Sagrados" },
  { ano: "1880", marco: "Presente de referência" },
];

// Eventos de ambientação, sem recompensa mecânica automática (p. 149).
export const BOM_DE_GOLE_CALENDAR: { mes: string; evento: string }[] = [
  { mes: "Janeiro", evento: "Festa da Chuva e do Ano Bom" },
  { mes: "Fevereiro", evento: "Festival de Música e da Felicidade" },
  { mes: "Março", evento: "Festival da Cenoura e da Orquídea" },
  { mes: "Abril", evento: "Rodeio Dois-Irmão" },
  { mes: "Maio", evento: "Festivão da Abóbora e do Pinhão" },
  { mes: "Junho", evento: "Festa do Bumba-Quem-Quer" },
  { mes: "Julho", evento: "Mês do Aniversário do Alface" },
  { mes: "Agosto", evento: "Feriado do Mês Prolongado" },
  { mes: "Setembro", evento: "Festival de Música da Felicidade 2" },
  { mes: "Outubro", evento: "Comemoração da Cerveja e da Salsicha" },
  { mes: "Novembro", evento: "Festa da Inovação da Lavoura" },
  { mes: "Dezembro", evento: "Festa dos Miguel" },
];
