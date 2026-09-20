// Catálogo de compras da criação — fonte: docs/01 §9 (LIVRO pp. 52–65).
// Preços são o MÁXIMO da tabela: a primeira compra usa o preço máximo, sem
// barganha (p. 52). Espaço null = travessão da tabela (pequenos itens não
// ocupam espaço — lacuna C05, resolvida como 0 na criação).
// "Não se vende" (canhão, metralhadora) fica fora. Preços invertidos no
// original (óleo de lanterna, vinho) normalizados por interpretação registrada.

import type { CompraItem } from "./types";

export type CategoriaItem =
  | "armas"
  | "municao"
  | "protecoes"
  | "animais"
  | "mercearia"
  | "vestuario"
  | "armazem"
  | "farmacia";

/** Suporte de porte de arma (p. 53): fora da mochila, não ocupa espaço. */
export type SuporteArma = "coldre" | "bandoleira" | "bainha";

export interface ItemCatalogo {
  id: string;
  nome: string;
  categoria: CategoriaItem;
  /** Preço máximo da tabela, em réis. */
  preco: number;
  /** Espaço guardado na mochila; null = não especificado (conta 0). */
  espaco: number | null;
  /** Arma que pode ficar pronta num suporte. */
  suporte?: SuporteArma;
  /** Peça de roupa/proteção: a primeira unidade vai vestida (0 espaço). */
  vestivel?: boolean;
  nota?: string;
}

export const CATEGORIAS: { id: CategoriaItem; nome: string }[] = [
  { id: "armas", nome: "Armas" },
  { id: "municao", nome: "Munição e suportes" },
  { id: "protecoes", nome: "Proteções" },
  { id: "animais", nome: "Animais e transporte" },
  { id: "vestuario", nome: "Vestuário" },
  { id: "mercearia", nome: "Mercearia" },
  { id: "armazem", nome: "Armazém" },
  { id: "farmacia", nome: "Farmácia" },
];

export const CATALOGO: ItemCatalogo[] = [
  // ── Armas comuns (p. 56) ──
  { id: "revolver", nome: "Revólver", categoria: "armas", preco: 25, espaco: 1, suporte: "coldre", nota: "Dano 1V · carga 6" },
  { id: "fuzil", nome: "Fuzil", categoria: "armas", preco: 40, espaco: 3, suporte: "bandoleira", nota: "Dano 3V · carga 5" },
  { id: "espingarda", nome: "Espingarda", categoria: "armas", preco: 40, espaco: 2, suporte: "bandoleira", nota: "1V longe / 2V perto · carga 2" },
  { id: "garrucha", nome: "Garrucha", categoria: "armas", preco: 20, espaco: 1, suporte: "coldre", nota: "2V só de perto · carga 1" },
  { id: "zarabatana", nome: "Zarabatana", categoria: "armas", preco: 10, espaco: 1, nota: "1D + veneno" },
  { id: "estilingue", nome: "Estilingue", categoria: "armas", preco: 5, espaco: 1, nota: "2D" },
  { id: "boleadeira", nome: "Boleadeira", categoria: "armas", preco: 1, espaco: 1, nota: "3D" },
  { id: "arco-e-flecha", nome: "Arco e flecha", categoria: "armas", preco: 25, espaco: 1, nota: "1V" },
  { id: "faca", nome: "Faca", categoria: "armas", preco: 5, espaco: 0.5, suporte: "bainha", nota: "3D · 1 faca vai fora do limite de armas prontas" },
  { id: "sabre", nome: "Sabre / espada", categoria: "armas", preco: 25, espaco: 1, suporte: "bainha", nota: "1V" },
  { id: "lanca", nome: "Lança", categoria: "armas", preco: 25, espaco: null, nota: "1V · espaço não especificado no livro" },
  { id: "machadinha", nome: "Machadinha", categoria: "armas", preco: 10, espaco: 1, nota: "1V" },
  { id: "machado-de-lenha", nome: "Machado de lenha", categoria: "armas", preco: 2, espaco: 2, nota: "2V" },
  { id: "martelo-de-mao", nome: "Martelo de mão", categoria: "armas", preco: 10, espaco: 1, nota: "1V" },
  // ── Armas especiais vendáveis (pp. 58–59) ──
  { id: "pistola-automatica", nome: "Pistola automática", categoria: "armas", preco: 2000, espaco: 1, suporte: "coldre", nota: "1V · carga 11 · um tiro extra por ação" },
  { id: "magnum", nome: "Magnum de cano alongado", categoria: "armas", preco: 4000, espaco: 1, suporte: "coldre", nota: "2V · carga 6" },
  { id: "mauser-c69", nome: "Mauser C69", categoria: "armas", preco: 4000, espaco: 1, suporte: "coldre", nota: "1V · carga 15" },
  { id: "carabina", nome: "Carabina de repetição", categoria: "armas", preco: 2000, espaco: 2, suporte: "bandoleira", nota: "2V · carga 7" },
  { id: "derringer", nome: "Derringer", categoria: "armas", preco: 300, espaco: 1, suporte: "coldre", nota: "1V · ocultável, combina com Ataque Sacana" },
  { id: "cano-serrado", nome: "Espingarda de cano serrado", categoria: "armas", preco: 150, espaco: 2, suporte: "coldre", nota: "3V · usa uma mão, cabe no coldre" },
  { id: "dinamite", nome: "Explosivo TNT / dinamite", categoria: "armas", preco: 40, espaco: 0.5, nota: "5V em área de 1,5m" },
  // ── Munição e suportes (p. 56) ──
  { id: "coldre", nome: "Coldre", categoria: "municao", preco: 15, espaco: null, nota: "Porta 1 revólver e até 36 balas" },
  { id: "bandoleira", nome: "Bandoleira", categoria: "municao", preco: 20, espaco: null, nota: "Porta 1 fuzil/espingarda e 24 balas · máx. 2" },
  { id: "bainha", nome: "Bainha", categoria: "municao", preco: 10, espaco: null, nota: "Porta faca, espada ou lâmina equivalente" },
  { id: "balas-revolver", nome: "Caixa de 12 balas de revólver", categoria: "municao", preco: 8, espaco: 1 },
  { id: "balas-espingarda", nome: "Caixa de 6 balas de espingarda", categoria: "municao", preco: 10, espaco: 1 },
  { id: "balas-fuzil", nome: "Caixa de 6 balas de fuzil", categoria: "municao", preco: 12, espaco: 1 },
  // ── Proteções improvisadas (pp. 59–60) — vestidas; não aumentam Defesa ──
  { id: "sobretudo-protetor", nome: "Sobretudo protetor", categoria: "protecoes", preco: 70, espaco: null, vestivel: true, nota: "Reduz 1V por dano (limite 2V) · −1 Ação" },
  { id: "colete-couro", nome: "Colete de couro reforçado", categoria: "protecoes", preco: 200, espaco: null, vestivel: true, nota: "Reduz 1V (limite 3V) · −1 Movimento" },
  { id: "colete-madeira", nome: "Colete de couro com madeira", categoria: "protecoes", preco: 250, espaco: null, vestivel: true, nota: "Reduz 2V (limite 4V) · −1 Ação e −1 Mov." },
  { id: "ombreiras", nome: "Ombreiras de ferro", categoria: "protecoes", preco: 500, espaco: null, vestivel: true, nota: "Reduz 2V (limite 4V) · −2 Movimentos" },
  { id: "placas-metal", nome: "Placas de metal", categoria: "protecoes", preco: 400, espaco: null, vestivel: true, nota: "Reduz 3V (limite 5V) · −2 Mov. e −1 Ação" },
  { id: "panelas-chumbadas", nome: "Panelas chumbadas", categoria: "protecoes", preco: 400, espaco: null, vestivel: true, nota: "Reduz 3V (limite 4V) · −1 Mov. e −2 Ações" },
  // ── Animais e transporte (p. 55) ──
  { id: "cavalo", nome: "Cavalo", categoria: "animais", preco: 250, espaco: null, nota: "Acima dos $200 — a lacuna do cavalo inicial é combinada com o Juiz" },
  { id: "mula", nome: "Mula / burrico", categoria: "animais", preco: 100, espaco: null, nota: "Montaria modesta que cabe no orçamento" },
  { id: "sela", nome: "Sela", categoria: "animais", preco: 10, espaco: null },
  { id: "bolsa-montaria", nome: "Bolsa de montaria", categoria: "animais", preco: 10, espaco: null, nota: "Espaços extras no animal" },
  { id: "carroca", nome: "Carroça", categoria: "animais", preco: 30, espaco: null, nota: "30 espaços de carga" },
  { id: "carro", nome: "Carro de tração animal", categoria: "animais", preco: 25, espaco: null, nota: "20 espaços de carga" },
  { id: "canoa", nome: "Canoa", categoria: "animais", preco: 50, espaco: null },
  { id: "bovino", nome: "Bovino", categoria: "animais", preco: 300, espaco: null },
  { id: "bode", nome: "Bode / cabra", categoria: "animais", preco: 100, espaco: null },
  { id: "suino", nome: "Suíno", categoria: "animais", preco: 30, espaco: null },
  { id: "ovelha", nome: "Ovelha / cordeiro", categoria: "animais", preco: 5, espaco: null },
  { id: "galinhas", nome: "Galinhas", categoria: "animais", preco: 3, espaco: null },
  { id: "apicultura", nome: "Apicultura", categoria: "animais", preco: 10, espaco: null },
  { id: "curral", nome: "Curral (diária)", categoria: "animais", preco: 2, espaco: null, nota: "Cuidados, banho e alimentação" },
  // ── Vestuário e adornos (p. 62) — vestida não ocupa; guardada 0,5 ──
  { id: "chapeu", nome: "Chapéu", categoria: "vestuario", preco: 100, espaco: 0.5, vestivel: true },
  { id: "sombrero", nome: "Sombrero", categoria: "vestuario", preco: 20, espaco: 0.5, vestivel: true },
  { id: "boina", nome: "Boina", categoria: "vestuario", preco: 1, espaco: 0.5, vestivel: true },
  { id: "cartola", nome: "Cartola", categoria: "vestuario", preco: 20, espaco: 0.5, vestivel: true },
  { id: "camisa", nome: "Camisa", categoria: "vestuario", preco: 5, espaco: 0.5, vestivel: true },
  { id: "blusa-verao", nome: "Blusa de verão", categoria: "vestuario", preco: 5, espaco: 0.5, vestivel: true },
  { id: "blusa-inverno", nome: "Blusa de inverno", categoria: "vestuario", preco: 30, espaco: 0.5, vestivel: true },
  { id: "calca", nome: "Calça", categoria: "vestuario", preco: 8, espaco: 0.5, vestivel: true },
  { id: "saia", nome: "Saia", categoria: "vestuario", preco: 15, espaco: 0.5, vestivel: true },
  { id: "vestido", nome: "Vestido (trabalho a gala)", categoria: "vestuario", preco: 150, espaco: 0.5, vestivel: true },
  { id: "macacao", nome: "Macacão jeans", categoria: "vestuario", preco: 3, espaco: 0.5, vestivel: true },
  { id: "colete-v", nome: "Colete", categoria: "vestuario", preco: 15, espaco: 0.5, vestivel: true },
  { id: "paleto", nome: "Paletó", categoria: "vestuario", preco: 50, espaco: 0.5, vestivel: true },
  { id: "tuxedo", nome: "Tuxedo", categoria: "vestuario", preco: 50, espaco: 0.5, vestivel: true },
  { id: "casaco", nome: "Casaco", categoria: "vestuario", preco: 15, espaco: 0.5, vestivel: true },
  { id: "jaqueta", nome: "Jaqueta", categoria: "vestuario", preco: 300, espaco: 0.5, vestivel: true },
  { id: "sobretudo-v", nome: "Sobretudo (vestuário)", categoria: "vestuario", preco: 200, espaco: 0.5, vestivel: true, nota: "Não é o sobretudo protetor" },
  { id: "poncho", nome: "Poncho", categoria: "vestuario", preco: 50, espaco: 0.5, vestivel: true },
  { id: "batina", nome: "Batina", categoria: "vestuario", preco: 2, espaco: 0.5, vestivel: true },
  { id: "camisola", nome: "Camisola", categoria: "vestuario", preco: 25, espaco: 0.5, vestivel: true },
  { id: "pijamas", nome: "Pijamas", categoria: "vestuario", preco: 30, espaco: 0.5, vestivel: true },
  { id: "ceroulas", nome: "Ceroulas", categoria: "vestuario", preco: 2, espaco: 0.5, vestivel: true },
  { id: "lingerie", nome: "Lingerie", categoria: "vestuario", preco: 100, espaco: 0.5, vestivel: true },
  { id: "meias", nome: "Meias", categoria: "vestuario", preco: 0.25, espaco: 0.5, vestivel: true },
  { id: "botas", nome: "Botas", categoria: "vestuario", preco: 10, espaco: 0.5, vestivel: true },
  { id: "sapatos", nome: "Sapatos", categoria: "vestuario", preco: 100, espaco: 0.5, vestivel: true },
  { id: "perneiras", nome: "Perneiras", categoria: "vestuario", preco: 15, espaco: 0.5, vestivel: true },
  { id: "cinto", nome: "Cinto", categoria: "vestuario", preco: 5, espaco: 0.5, vestivel: true },
  { id: "suspensorios", nome: "Suspensórios", categoria: "vestuario", preco: 5, espaco: 0.5, vestivel: true },
  { id: "luvas", nome: "Luvas", categoria: "vestuario", preco: 1, espaco: 0.5, vestivel: true },
  { id: "lenco-pescoco", nome: "Lenço de pescoço", categoria: "vestuario", preco: 1, espaco: 0.5, vestivel: true },
  { id: "echarpe", nome: "Echarpe", categoria: "vestuario", preco: 2, espaco: 0.5, vestivel: true },
  { id: "xale", nome: "Xale de lã", categoria: "vestuario", preco: 2, espaco: 0.5, vestivel: true },
  { id: "gravata", nome: "Gravata", categoria: "vestuario", preco: 5, espaco: 0.5, vestivel: true },
  { id: "oculos-v", nome: "Óculos", categoria: "vestuario", preco: 25, espaco: 0.5, vestivel: true },
  { id: "anel", nome: "Anel (latão a diamante)", categoria: "vestuario", preco: 1500, espaco: null },
  { id: "brincos", nome: "Brincos (latão a diamantes)", categoria: "vestuario", preco: 1500, espaco: null },
  { id: "colar", nome: "Colar (ferro a pérolas)", categoria: "vestuario", preco: 2500, espaco: null },
  { id: "pulseira", nome: "Pulseira (lata a diamante)", categoria: "vestuario", preco: 2000, espaco: null },
  { id: "broche", nome: "Broche (latão a prata)", categoria: "vestuario", preco: 500, espaco: null },
  { id: "gargantilha", nome: "Gargantilha", categoria: "vestuario", preco: 1, espaco: null },
  { id: "bolsa-de-mao", nome: "Bolsa de mão", categoria: "vestuario", preco: 20, espaco: 0.5 },
  { id: "leque", nome: "Leque", categoria: "vestuario", preco: 3, espaco: null },
  { id: "bengala", nome: "Bengala", categoria: "vestuario", preco: 2, espaco: null },
  { id: "avental-medico", nome: "Avental de médico", categoria: "vestuario", preco: 5, espaco: 0.5, vestivel: true },
  { id: "estetoscopio", nome: "Estetoscópio", categoria: "vestuario", preco: 50, espaco: null },
  // ── Mercearia (p. 61) ──
  { id: "mochila", nome: "Mochila", categoria: "mercearia", preco: 1, espaco: null, nota: "10 espaços — a base do inventário" },
  { id: "carne-seca", nome: "Carne seca (1 kg)", categoria: "mercearia", preco: 2, espaco: 1 },
  { id: "feijao", nome: "Feijão (lata)", categoria: "mercearia", preco: 2, espaco: 1 },
  { id: "farinha", nome: "Farinha (0,5 kg)", categoria: "mercearia", preco: 2, espaco: 0.5 },
  { id: "acucar", nome: "Açúcar (0,5 kg)", categoria: "mercearia", preco: 2, espaco: 0.5 },
  { id: "cafe", nome: "Café (lata)", categoria: "mercearia", preco: 1, espaco: null },
  { id: "queijo", nome: "Queijo (0,5 kg)", categoria: "mercearia", preco: 6, espaco: 0.5 },
  { id: "ovos", nome: "Ovos (6)", categoria: "mercearia", preco: 2.5, espaco: 0.5 },
  { id: "leite", nome: "Leite (0,5 L)", categoria: "mercearia", preco: 5, espaco: 1 },
  { id: "pao-de-queijo", nome: "Pão de queijo (10)", categoria: "mercearia", preco: 2, espaco: 0.5 },
  { id: "biscoitos", nome: "Biscoitos", categoria: "mercearia", preco: 1, espaco: null },
  { id: "maras", nome: "Maçãs (3)", categoria: "mercearia", preco: 0.1, espaco: null },
  { id: "cenouras", nome: "Cenouras (5)", categoria: "mercearia", preco: 0.25, espaco: 1 },
  { id: "milho", nome: "Milho (lata)", categoria: "mercearia", preco: 0.5, espaco: 0.5 },
  { id: "ervilhas", nome: "Ervilhas (lata)", categoria: "mercearia", preco: 15, espaco: 0.5 },
  { id: "atum", nome: "Atum (lata)", categoria: "mercearia", preco: 0.5, espaco: 0.5 },
  { id: "sardinha", nome: "Sardinha (lata)", categoria: "mercearia", preco: 0.25, espaco: 0.5 },
  { id: "sopa", nome: "Sopa", categoria: "mercearia", preco: 2, espaco: 0.5 },
  { id: "azeite", nome: "Azeite (garrafa)", categoria: "mercearia", preco: 2, espaco: 1 },
  { id: "folhas-cha", nome: "Folhas de chá (0,5 kg)", categoria: "mercearia", preco: 2, espaco: 1 },
  { id: "chocolate", nome: "Chocolate (barra)", categoria: "mercearia", preco: 4, espaco: null },
  { id: "alcacuz", nome: "Alcaçuz (doces)", categoria: "mercearia", preco: 1, espaco: null },
  { id: "erva-medicinal", nome: "Erva medicinal (0,5 kg)", categoria: "mercearia", preco: 50, espaco: 0.5 },
  { id: "cerveja", nome: "Cerveja (garrafa)", categoria: "mercearia", preco: 1, espaco: 1 },
  { id: "pinga", nome: "Pinga (garrafa)", categoria: "mercearia", preco: 1, espaco: 1 },
  { id: "vinho", nome: "Vinho (garrafa)", categoria: "mercearia", preco: 10, espaco: 1 },
  { id: "uisque", nome: "Uísque (garrafa)", categoria: "mercearia", preco: 10, espaco: 1 },
  { id: "conhaque", nome: "Conhaque fino (garrafa)", categoria: "mercearia", preco: 60, espaco: 0.5 },
  { id: "tabaco", nome: "Tabaco (0,5 kg)", categoria: "mercearia", preco: 5, espaco: 0.5 },
  { id: "paierinhos", nome: "Paierinhos (5)", categoria: "mercearia", preco: 1, espaco: null },
  { id: "fosforos-mercearia", nome: "Fósforos (10)", categoria: "mercearia", preco: 0.1, espaco: null },
  { id: "oleo-lanterna", nome: "Óleo de lanterna", categoria: "mercearia", preco: 0.5, espaco: 0.5 },
  { id: "jornal", nome: "Jornal", categoria: "mercearia", preco: 0.25, espaco: null },
  { id: "sabao-mercearia", nome: "Sabão (barra)", categoria: "mercearia", preco: 0.25, espaco: 0.5 },
  { id: "tabua-lavar", nome: "Tábua de lavar", categoria: "mercearia", preco: 3, espaco: 1 },
  { id: "martelo-mercearia", nome: "Martelo (mercearia)", categoria: "mercearia", preco: 1, espaco: 1 },
  { id: "tonico-capilar", nome: "Tônico capilar (frasco)", categoria: "mercearia", preco: 15, espaco: 0.5 },
  { id: "unguento-mercearia", nome: "Unguento (frasco)", categoria: "mercearia", preco: 10, espaco: 1 },
  // ── Armazém (p. 63) ──
  { id: "cantil", nome: "Cantil", categoria: "armazem", preco: 5, espaco: null },
  { id: "corda", nome: "Corda (5 m)", categoria: "armazem", preco: 5, espaco: 1 },
  { id: "barraca", nome: "Barraca", categoria: "armazem", preco: 12, espaco: 1 },
  { id: "saco-dormir", nome: "Saco de dormir", categoria: "armazem", preco: 0.5, espaco: 1 },
  { id: "lanterna", nome: "Lanterna", categoria: "armazem", preco: 10, espaco: 1 },
  { id: "bussola", nome: "Bússola", categoria: "armazem", preco: 5, espaco: null },
  { id: "binoculo", nome: "Binóculo", categoria: "armazem", preco: 40, espaco: 0.5 },
  { id: "relogio-bolso", nome: "Relógio de bolso", categoria: "armazem", preco: 50, espaco: 0.5 },
  { id: "isqueiro", nome: "Isqueiro", categoria: "armazem", preco: 30, espaco: null },
  { id: "pederneira", nome: "Pederneira", categoria: "armazem", preco: 1, espaco: 0.5 },
  { id: "fosforos-armazem", nome: "Fósforos", categoria: "armazem", preco: 0.1, espaco: null },
  { id: "panela", nome: "Panela", categoria: "armazem", preco: 10, espaco: 1 },
  { id: "graxa", nome: "Graxa (pote)", categoria: "armazem", preco: 2, espaco: 0.5 },
  { id: "linha-agulha", nome: "Linha e agulha", categoria: "armazem", preco: 1, espaco: null },
  { id: "baralho", nome: "Baralho", categoria: "armazem", preco: 2, espaco: null },
  { id: "dados", nome: "Dados (3)", categoria: "armazem", preco: 1, espaco: null },
  { id: "gazuas", nome: "Gazuas (20)", categoria: "armazem", preco: 1, espaco: 1 },
  { id: "algemas", nome: "Algemas", categoria: "armazem", preco: 4, espaco: 0.5 },
  { id: "cadeado", nome: "Cadeado", categoria: "armazem", preco: 1, espaco: 0.5 },
  { id: "corrente", nome: "Corrente (2 m)", categoria: "armazem", preco: 25, espaco: 1 },
  { id: "arame", nome: "Arame (10 m)", categoria: "armazem", preco: 5, espaco: 2 },
  { id: "lona", nome: "Lona (2 m)", categoria: "armazem", preco: 30, espaco: 2 },
  { id: "pavio", nome: "Pavio (10 m)", categoria: "armazem", preco: 15, espaco: 2 },
  { id: "detonador", nome: "Detonador", categoria: "armazem", preco: 5, espaco: 1 },
  { id: "pe-de-cabra", nome: "Pé de cabra", categoria: "armazem", preco: 10, espaco: 1 },
  { id: "pa", nome: "Pá", categoria: "armazem", preco: 2, espaco: 1 },
  { id: "picareta", nome: "Picareta", categoria: "armazem", preco: 25, espaco: 2 },
  { id: "machado-armazem", nome: "Machado (armazém)", categoria: "armazem", preco: 25, espaco: 1 },
  { id: "marreta", nome: "Marreta", categoria: "armazem", preco: 25, espaco: 1 },
  { id: "foice", nome: "Foice", categoria: "armazem", preco: 25, espaco: 1 },
  { id: "forcado", nome: "Forcado", categoria: "armazem", preco: 25, espaco: 1 },
  { id: "alicate", nome: "Alicate de arame", categoria: "armazem", preco: 50, espaco: 1 },
  { id: "tesourao", nome: "Tesourão", categoria: "armazem", preco: 50, espaco: 2 },
  { id: "pregos", nome: "Pregos (20)", categoria: "armazem", preco: 1, espaco: null },
  { id: "oleo-lata", nome: "Óleo (lata)", categoria: "armazem", preco: 2, espaco: 1 },
  { id: "sabao-armazem", nome: "Sabão (armazém)", categoria: "armazem", preco: 0.5, espaco: null },
  { id: "oculos-armazem", nome: "Óculos (armazém)", categoria: "armazem", preco: 50, espaco: 0.5 },
  { id: "brinquedo", nome: "Brinquedo", categoria: "armazem", preco: 20, espaco: 0.5 },
  { id: "vara-pescar", nome: "Vara de pescar", categoria: "armazem", preco: 5, espaco: 1 },
  { id: "violao", nome: "Violão", categoria: "armazem", preco: 60, espaco: 1 },
  { id: "viola", nome: "Viola", categoria: "armazem", preco: 60, espaco: 1 },
  { id: "violino", nome: "Violino", categoria: "armazem", preco: 100, espaco: 1 },
  { id: "banjo", nome: "Banjo", categoria: "armazem", preco: 100, espaco: 1 },
  { id: "gaita", nome: "Gaita / harmônica", categoria: "armazem", preco: 25, espaco: 1 },
  { id: "flauta", nome: "Flauta", categoria: "armazem", preco: 100, espaco: 1 },
  { id: "acordeao", nome: "Acordeão / sanfona", categoria: "armazem", preco: 50, espaco: 1 },
  { id: "pandeiro", nome: "Pandeiro", categoria: "armazem", preco: 80, espaco: 1 },
  { id: "tamborim", nome: "Tamborim", categoria: "armazem", preco: 20, espaco: 1 },
  { id: "zabumba", nome: "Zabumba", categoria: "armazem", preco: 50, espaco: 2 },
  { id: "berimbau", nome: "Berimbau", categoria: "armazem", preco: 2, espaco: 1 },
  { id: "ganza", nome: "Ganzá / chocalho", categoria: "armazem", preco: 10, espaco: 1 },
  // ── Farmácia (pp. 64–65) — 0,5 espaço por frasco ──
  { id: "unguento-pasta", nome: "Unguento (pasta)", categoria: "farmacia", preco: 10, espaco: 0.5, nota: "Cura 1V no descanso" },
  { id: "canfora", nome: "Cânfora (pasta)", categoria: "farmacia", preco: 30, espaco: 0.5, nota: "1 Ação em combate, cura 1V" },
  { id: "adrenalina", nome: "Adrenalina (seringa)", categoria: "farmacia", preco: 500, espaco: 0.5, nota: "Recupera 3V; rebote de −1 Ação/−1 Mov." },
  { id: "morfina", nome: "Morfina (ampola)", categoria: "farmacia", preco: 100, espaco: 0.5 },
  { id: "tonico-milagroso", nome: "Tônico milagroso", categoria: "farmacia", preco: 50, espaco: 0.5, nota: "Carta preta cura 3V; vermelha envenena" },
  { id: "pomada-cavalo", nome: "Pomada de cavalo", categoria: "farmacia", preco: 10, espaco: 0.5, nota: "Montaria recupera 3V no descanso" },
  { id: "alcool", nome: "Álcool (frasco)", categoria: "farmacia", preco: 5, espaco: 0.5 },
  { id: "laxante", nome: "Laxante (frasco)", categoria: "farmacia", preco: 10, espaco: 0.5 },
  { id: "xarope", nome: "Xarope de tosse", categoria: "farmacia", preco: 5, espaco: 0.5 },
  { id: "arsenico", nome: "Arsênico (frasco)", categoria: "farmacia", preco: 4, espaco: 0.5 },
  { id: "babosa", nome: "Babosa (erva)", categoria: "farmacia", preco: 2, espaco: 0.5 },
  { id: "boldo", nome: "Boldo (erva)", categoria: "farmacia", preco: 2, espaco: 0.5 },
  { id: "cavalinha", nome: "Cavalinha (erva)", categoria: "farmacia", preco: 2, espaco: 0.5 },
  { id: "erva-doce", nome: "Erva-doce (erva)", categoria: "farmacia", preco: 2, espaco: 0.5 },
  { id: "mil-folhas", nome: "Mil-folhas (erva)", categoria: "farmacia", preco: 2, espaco: 0.5 },
  { id: "folha-salgueiro", nome: "Folha de salgueiro", categoria: "farmacia", preco: 3, espaco: 0.5 },
  { id: "gengibre", nome: "Gengibre (raiz)", categoria: "farmacia", preco: 2, espaco: 0.5 },
];

export function itemById(id: string): ItemCatalogo | undefined {
  return CATALOGO.find((i) => i.id === id);
}

export interface ResumoCompras {
  custoTotal: number;
  saldo: number;
  /** Espaço a guardar na mochila após vestir roupas e portar armas. */
  espacoUsado: number;
  capacidade: number;
  armasProntas: number;
  limiteArmasProntas: number;
  avisos: string[];
}

const ORCAMENTO = 200;
const CAPACIDADE_MOCHILA = 10;
const CAPACIDADE_MONTARIA = 15;

/**
 * Resumo de custo e espaço (pp. 52–53):
 * roupas/proteções: 1ª unidade vestida (0 espaço), extras 0,5;
 * armas prontas em coldre/bandoleira/bainha compradas não ocupam mochila
 * (máx. 4 prontas + 1 faca fora do limite; máx. 2 bandoleiras);
 * o resto guarda na mochila (10) e na montaria (15), se houver.
 */
export function resumoCompras(itens: CompraItem[], temMontaria: boolean): ResumoCompras {
  let custoTotal = 0;
  let espaco = 0;
  const avisos: string[] = [];

  const qty = (id: string) => itens.find((i) => i.id === id)?.quantidade ?? 0;
  const suportes: Record<SuporteArma, number> = {
    coldre: qty("coldre"),
    bandoleira: Math.min(2, qty("bandoleira")),
    bainha: qty("bainha"),
  };
  if (qty("bandoleira") > 2) avisos.push("Máximo de 2 bandoleiras equipadas — as extras vão para a mochila.");

  let armasProntas = 0;
  let facaLivreUsada = false;
  const LIMITE_PRONTAS = 4;

  for (const { id, quantidade } of itens) {
    const item = itemById(id);
    if (!item || quantidade <= 0) continue;
    custoTotal += item.preco * quantidade;

    let guardadas = quantidade;
    if (item.vestivel) {
      guardadas = Math.max(0, quantidade - 1); // 1ª vestida
    } else if (item.suporte) {
      for (let u = 0; u < quantidade; u++) {
        if (item.id === "faca" && !facaLivreUsada) {
          facaLivreUsada = true; // 1 faca fora do limite (p. 53)
          guardadas--;
        } else if (suportes[item.suporte] > 0 && armasProntas < LIMITE_PRONTAS) {
          suportes[item.suporte]--;
          armasProntas++;
          guardadas--;
        }
      }
    }
    espaco += (item.espaco ?? 0) * guardadas;
  }

  // Bandoleiras acima do limite ocupam como item guardado (sem espaço declarado → 0).
  const capacidade = CAPACIDADE_MOCHILA + (temMontaria ? CAPACIDADE_MONTARIA : 0);
  return {
    custoTotal,
    saldo: ORCAMENTO - custoTotal,
    espacoUsado: espaco,
    capacidade,
    armasProntas: armasProntas + (facaLivreUsada ? 1 : 0),
    limiteArmasProntas: LIMITE_PRONTAS + 1,
    avisos,
  };
}
