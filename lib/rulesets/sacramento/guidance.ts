// Textos de orientação para mesas leigas (PRODUTO — Doc 2 §§3–5, 12–14).
// Três camadas de UX: essência visível, glossário no hover, painel "Como
// funciona" sob botão. Nada aqui cria regra: páginas só onde o doc as dá;
// sugestões de uso são orientação de produto, não cânone.

export type SectionGuide = {
  /** O que é isto — uma frase que qualquer pessoa entende. */
  oQueE: string;
  /** Por que existe / o que resolve na mesa. */
  paraQueServe: string;
  /** Passos práticos, na ordem em que um Juiz novato agiria. */
  naPratica: string[];
  /** Referências de página, quando o doc as dá. */
  paginas?: string;
};

export const SECTION_GUIDES: Record<string, SectionGuide> = {
  overview: {
    oQueE:
      "A página-mãe da campanha: premissa, objetivo do bando, tom, temas, época e os acordos da mesa, tudo num lugar só.",
    paraQueServe:
      "Alinhar todo mundo antes de jogar. O que está aqui é visível aos jogadores que entrarem — é o contrato da mesa, não o seu caderno secreto.",
    naPratica: [
      "Escreva a premissa em 2 ou 3 frases — a situação do Oeste que o bando encontra, não o final da história.",
      "Combine o objetivo comum com os jogadores; é o que impede o grupo de se dispersar na primeira sessão.",
      "Defina tom e temas arrastando e clicando — eles guiam suas escolhas de cena, sem bônus mecânico.",
      "Faça a sessão zero antes da primeira sessão de jogo: linhas, véus e Cartão X valem mais que qualquer regra.",
      "Tudo é editável depois. Campanha viva muda.",
    ],
    paginas: "funções do Juiz pp. 114–125; sessão zero pp. 16, 47, 125–127",
  },
  places: {
    oQueE:
      "O mapa vivo da campanha: os lugares onde as histórias acontecem, do cânone do livro ou criados pela sua mesa.",
    paraQueServe:
      "Um lugar bem anotado responde na hora “onde estamos e o que há de errado aqui” — as linhas de conflito de cada lugar são ganchos de história prontos.",
    naPratica: [
      "Comece com 2 ou 3 lugares, não com o mapa inteiro — adicione conforme o bando viaja.",
      "Importe do cânone: vêm com descrição, conflitos e a página do livro para consultar detalhes.",
      "Crie lugares próprios à vontade — eles ficam marcados como criação da campanha e nunca alegam página do livro.",
      "Use as notas do Juiz (🔒) para o que os jogadores ainda não sabem sobre o lugar.",
    ],
    paginas: "guia do Oeste pp. 136–251",
  },
  factions: {
    oQueE:
      "Grupos organizados com interesses próprios: gangues, cultos e as forças da lei. Cada template canônico traz a composição publicada no livro.",
    paraQueServe:
      "Facções são motores de conflito — enquanto o bando age, elas também agem. Uma campanha ganha vida quando o inimigo tem estrutura, território e agenda.",
    naPratica: [
      "Escolha 1 ou 2 facções para o início — mais que isso dilui a tensão.",
      "Leia o dossiê: a composição mostra quem são os capangas (comuns) e quem são os destaques (especiais), com o NdC de cada papel.",
      "Templates são modelos, não encontros obrigatórios: quantos aparecem em cena, com que armas e com que objetivo é sempre decisão sua.",
      "Depois de adicionar, escreva a agenda: o que a facção quer e o que faz enquanto o bando não interfere.",
    ],
    paginas: "pp. 258–266",
  },
  npcs: {
    oQueE:
      "As pessoas do mundo: aliados, vilões e todo mundo no meio. A ficha de NPC é radicalmente mais simples que a de um jogador.",
    paraQueServe:
      "Você não precisa de uma ficha completa para cada figura — precisa saber o que a pessoa quer, teme e esconde. Número só quando há confronto.",
    naPratica: [
      "Um NPC sem briga prevista pode viver só de campos narrativos — nome, desejo, medo, segredo.",
      "Quando precisar de números, escolha o NdC (1 a 6) e o tipo: comum para figurantes, especial para destaques.",
      "Campos narrativos nunca dão bônus — a mecânica mora toda no NdC.",
      "Sem inspiração? O gerador de cartas do livro sorteia nome, atividade, característica e reação.",
    ],
    paginas: "pp. 96–97, 119–120, 254–255",
  },
  scenes: {
    oQueE:
      "Situações preparadas: um lugar, um momento, quem está presente e o que está acontecendo por baixo da superfície.",
    paraQueServe:
      "Preparar cena é preparar possibilidades, não roteiro. Fatos, rumores e segredos separados evitam o erro clássico de contar tudo de uma vez.",
    naPratica: [
      "Nenhum campo é obrigatório para começar — uma linha de descrição já é uma cena.",
      "Separe o que é fato verdadeiro, o que é rumor e o que só você sabe (segredo).",
      "Anote os interesses dos NPCs presentes: cena boa é onde cada um quer uma coisa.",
      "Nunca escreva a solução — consequências possíveis, sim; desfecho obrigatório, não.",
    ],
  },
  missions: {
    oQueE:
      "Trabalhos, pedidos e encrencas com começo, meio e recompensa: quem propõe, o que quer, o que acontece se der certo ou errado.",
    paraQueServe:
      "Missões dão direção sem trilho: o bando sabe o que fazer, mas o como é sempre deles — inclusive abandonar.",
    naPratica: [
      "Preencha proponente, objetivo e motivo — recompensa e prazo só quando existirem de verdade.",
      "Anote consequências do sucesso, do fracasso E do abandono: o mundo reage às três.",
      "Travou? O gerador de três cartas do livro (p. 104) sorteia pedido, vínculo e reviravolta para você costurar.",
      "Ligue missões a facções e trilhas de redenção dos PJs — é onde a campanha vira pessoal.",
    ],
  },
  calendar: {
    oQueE:
      "O tempo do mundo do jogo: a data ficcional da campanha e os eventos que se aproximam.",
    paraQueServe:
      "Não confundir a data da mesa com a data do mundo. Prazos, festas e estações só apertam quando alguém controla o calendário.",
    naPratica: [
      "Defina a data ficcional atual (ex.: “Março de 1880”) e avance quando o tempo passar na ficção.",
      "As âncoras do mundo (pp. 131–132) dizem o que já aconteceu até sua época.",
      "As festas do Bom de Gole (p. 149) são ambientação pronta — uma por mês, sem bônus mecânico.",
      "Eventos criados aqui viram compromissos do mundo: cobre-os.",
    ],
    paginas: "pp. 131–132, 149",
  },
  secrets: {
    oQueE:
      "O bastidor da campanha: verdades por trás de cultos, identidades encenadas, planos de facções e tudo que os jogadores ainda não sabem.",
    paraQueServe:
      "Segredo anotado é segredo que não se perde entre sessões — e que não vaza: nada daqui aparece para jogadores nem em recapitulações sem você autorizar.",
    naPratica: [
      "Escreva a verdade como ela é, sem suavizar — só você lê.",
      "Um segredo bom tem gatilho: anote também o que faria os jogadores descobrirem.",
      "Quando um segredo virar público na ficção, mova a informação para a seção visível correspondente.",
    ],
  },
};

// ─── Glossário (hover/tap) ───

export type GlossaryEntry = {
  titulo: string;
  texto: string;
  paginas?: string;
};

export const GLOSSARY: Record<string, GlossaryEntry> = {
  ndc: {
    titulo: "NdC — Nível de Canalhice",
    texto:
      "A única estatística de um NPC: um número de 1 a 6. Quanto maior, mais perigoso — vida, ações por turno e testes crescem com ele. Apesar do nome, não significa que o NPC seja mau.",
    paginas: "pp. 96–97, 254–255",
  },
  "comum-especial": {
    titulo: "Comum × Especial",
    texto:
      "Comum é figurante: Vida 3×NdC, sem habilidades. Especial é destaque: Vida 6×NdC, mais ações por turno e habilidades próprias. Regra de bolso: capangas são comuns; tenentes e chefes, especiais.",
    paginas: "pp. 254–255",
  },
  linhas: {
    titulo: "Linhas",
    texto:
      "Assuntos excluídos da ficção da mesa: não acontecem nem fora de cena. Combinadas na sessão zero e válidas para todos, inclusive o Juiz.",
    paginas: "pp. 125–127",
  },
  veus: {
    titulo: "Véus",
    texto:
      "Assuntos que podem existir na história, mas ficam em segundo plano, sem detalhes em cena — a câmera corta.",
    paginas: "pp. 125–127",
  },
  "cartao-x": {
    titulo: "Cartão X",
    texto:
      "Sinal de desconforto que qualquer pessoa pode acionar: a cena encerra imediatamente, sem debate e sem precisar se justificar.",
    paginas: "pp. 125–127",
  },
  canone: {
    titulo: "Cânone × Criação da campanha",
    texto:
      "Cânone vem do livro e carrega a página de referência. Criação da campanha é da sua mesa — vale igual, mas nunca alega página do livro.",
  },
  visibilidade: {
    titulo: "🔒 Só o Juiz × 👁 Jogadores veem",
    texto:
      "Cada elemento tem visibilidade própria. O que está 🔒 nunca aparece para jogadores nem em recapitulações; um clique torna público quando a ficção revelar.",
  },
  epoca: {
    titulo: "Época",
    texto:
      "O ano em que a campanha se passa. O presente editorial do cenário é 1880; jogar em outro ano é permitido e fica registrado como versão da sua mesa.",
    paginas: "pp. 131–132",
  },
};

// ─── Guias por facção (dossiê e carta da campanha) ───

export type FactionGuide = {
  /** Quem são no mundo, numa frase que um leigo entende. */
  identidade: string;
  /** Como o Juiz usa o template na prática. */
  comoUsar: string;
  /** Ideias de uso em história — sugestões da mesa, não cânone. */
  ganchos: string[];
};

export const FACTION_GUIDES: Record<string, FactionGuide> = {
  curupira: {
    identidade:
      "Emboscadores da Floresta do Cipó: ninguém os vê chegar — primeiro somem as mulas, depois as pessoas.",
    comoUsar:
      "Use em duas camadas: os Gritos (comuns, NdC 2–3) fazem barulho e servem de isca; os Silêncios (especiais, NdC 2–4, com Armas da Natureza e Ataque Sacana) dão o bote de onde não se espera. O combate ideal contra eles começa antes do combate: pegadas, mata quieta demais, pássaros que não cantam.",
    ganchos: [
      "Uma caravana entrou na Floresta do Cipó e só as mulas saíram.",
      "Um contrato de escolta paga bem demais para um trecho curto demais.",
      "Alguém da vila jura que os Gritos avisam antes de atacar — e quer negociar.",
    ],
  },
  "bandoleira-escarlate": {
    identidade:
      "Gangue de assalto com hierarquia por cores — do lenço rosa dos novatos ao vermelho profundo do Escarlate, que ninguém viu duas vezes.",
    comoUsar:
      "A cor é o seu medidor de perigo: Rosáceos (NdC 1–3) para o primeiro contato, Rubros (NdC 4–5) quando o bando incomoda, Vermelhos (especiais) como tenentes. O Escarlate (especial, NdC 6, com Mestre Arsenal e Ameaça Covarde) é confronto de fim de arco — não o gaste numa emboscada de estrada.",
    ganchos: [
      "A diligência foi assaltada e sobrou só um lenço escarlate amarrado na boleia.",
      "Um Rosáceo arrependido quer sair da gangue — e sabe onde o próximo golpe será.",
      "O Escarlate mandou devolver o que o bando tomou. Educadamente. Uma vez.",
    ],
  },
  "seis-balas": {
    identidade:
      "O crime organizado de Belo Horizonte: do moleque de recado ao chefão de gravata, tudo tem preço e tabela na capital.",
    comoUsar:
      "É uma escada — faça o bando subir degrau por degrau: Correria e Bacana (comuns) nas ruas, Terno e Continência (especiais) nos negócios, o Gravata (especial, NdC 6) no topo, atrás de camadas de proteção e política. Antes da bala, use dívida, suborno e favor: é assim que os Seis Balas preferem vencer.",
    ganchos: [
      "A dívida de um aliado venceu — e o cobrador é educado, pontual e vem com dois Continência.",
      "Um comerciante do Bairro Oriental paga proteção para as duas partes do mesmo conflito.",
      "O Gravata quer contratar o bando. Recusar também tem preço.",
    ],
  },
  "cabeca-de-abobora": {
    identidade:
      "Bando errático de máscaras entalhadas: ninguém sabe o que querem, nem eles — o perigo é justamente não ter padrão.",
    comoUsar:
      "O template é NdC 1–6 sem hierarquia: sorteie ou escolha por cena, e mude — o mesmo grupo pode ser piada num dia e massacre no outro. Perfeitos para encontros de estrada e para quebrar a sensação de segurança: o bando nunca sabe o que vem.",
    ganchos: [
      "Atacaram um posto de troca e levaram só os espelhos.",
      "Uma abóbora entalhada apareceu na cerca da Base durante a noite.",
      "Um Cabeça de Abóbora capturado ri de tudo — e acerta cada previsão que faz.",
    ],
  },
  "irmas-gonzaga": {
    identidade:
      "Quatro irmãs, quatro estilos, um só golpe: Rafaela, Leonor, Donela e Michaela — todas NdC 5, todas especiais.",
    comoUsar:
      "Trate como um chefe em quatro corpos: cada irmã tem três habilidades próprias (Rafaela na força, Leonor na lábia, Donela na trapaça, Michaela na furtividade) e juntas cobrem as fraquezas umas das outras. Separadas, são caçáveis; juntas, são o pesadelo. A pergunta da história é sempre: como separá-las?",
    ganchos: [
      "O cofre da estação foi esvaziado durante o baile — e as quatro dançaram a noite inteira à vista de todos.",
      "Uma irmã foi presa. As outras três estão vindo, e a cidade sabe.",
      "Michaela quer trair as irmãs. Ou quer que o bando acredite nisso.",
    ],
  },
  "gangue-do-cogumelo": {
    identidade:
      "Culto do Sertão de Fungos: o chá abre a mente, a mente abre a porteira, e quem entra raramente quer sair.",
    comoUsar:
      "É horror social antes de ser combate: conversões, desaparecimentos, famílias divididas. A escada de devoção (Neófitos e Elevados comuns, Senescais e o Principado especiais) mede o quão fundo alguém caiu. Lutar no território deles é lutar também contra o charco, a névoa e as toxinas do Sertão.",
    ganchos: [
      "O filho do fazendeiro voltou do Sertão sereno, sorridente — e errado.",
      "Um carregamento de chá segue para a cidade grande. Alguém pagou para ele não chegar. Outro alguém, para chegar.",
      "Um Senescal desertou e detém o único mapa seguro para dentro do Sertão.",
    ],
  },
  "novos-sagrados": {
    identidade:
      "O culto renasceu nas ruínas de Sacramento: novos Bispos, velha fome — fé, medo e influência crescendo cidade a cidade.",
    comoUsar:
      "É ameaça de campanha, não de cena: seguidores comuns (NdC 1–6) medem o alcance da conversão; os Bispos — Hermes (NdC 6), Abreu e Aranha (NdC 5) — são antagonistas de arco, cada um com um arsenal próprio de habilidades de vilão. Use a influência antes da violência: sermões, doações, dívidas de gratidão. Quando a bala vier, já será tarde para metade da cidade.",
    ganchos: [
      "Um pregador chegou à vila distribuindo comida — e anotando nomes.",
      "As ruínas de Sacramento têm luz à noite outra vez.",
      "Um Bispo ofereceu ao bando exatamente aquilo de que cada um precisa.",
    ],
  },
  "policia-bh": {
    identidade:
      "A força da capital: cabos, sargentos, tenentes, capitães e coronéis — uma máquina grande demais para ser toda honesta ou toda podre.",
    comoUsar:
      "A patente é o NdC: cabo (1–2) até coronel (1–6), todos comuns. Use como obstáculo e como recurso — prisões, investigações, escoltas, subornos. A ambientação fala de política e corrupção, mas nada impede o delegado honesto: o contraste entre os dois é onde mora a história.",
    ganchos: [
      "Um capitão honesto pediu ajuda por fora: não sabe em quem da própria tropa confiar.",
      "O bando é procurado na capital — por um crime que ainda não cometeu.",
      "Duas patentes dão ordens contraditórias sobre o mesmo caso. Alguém paga melhor.",
    ],
  },
  "boinas-brancas": {
    identidade:
      "A segurança privada das ferrovias: onde o trilho avança, a boina branca chega antes — com contrato numa mão e carabina na outra.",
    comoUsar:
      "Aparecem onde a ferrovia tem interesse: despejos, escolta de carga, “pacificação” de vilas no caminho do trilho. São poucos e bons — guardas (especiais, NdC 1–2, Gatilho Furioso) e artilharia (especiais, NdC 3–4, Dedo Quente e Zói de Gavião). Não são exército: são cobrança com uniforme, e sempre há um contrato por trás.",
    ganchos: [
      "A ferrovia quer as terras da fazenda Esperança — e as Boinas já mediram a cerca.",
      "Um trem pagador foi assaltado; as Boinas contratam rastreadores... ou culpados.",
      "Uma vila inteira será “realocada”. O prazo vence com a chegada do bando.",
    ],
  },
  "defesa-nacional": {
    identidade:
      "A lei do interior: representantes, xerifes e delegados espalhados pelas vilas — cada um a seu modo, alguns ao modo de quem paga.",
    comoUsar:
      "É a lei local que o bando encontra em cada parada: representante (NdC 1–2), xerife (1–3), delegado (1–4), comuns por padrão. Xerifes nomeados podem ser especiais — Tonho do Arame, de Bom Fim, é NdC 4 especial. Recompensas por cabeça, julgamentos e a diferença entre a lei e o justo passam todos por aqui.",
    ganchos: [
      "Há recompensa pela cabeça de alguém do bando num mural de delegacia — e o valor subiu.",
      "O xerife da vila é justo, teimoso e está sozinho contra a gangue que chega no sábado.",
      "Um delegado comprado quer terceirizar o serviço sujo para forasteiros descartáveis.",
    ],
  },
};

// ─── Guias das etapas do wizard de campanha ───

export const WIZARD_GUIDES: Record<"modelo" | "identidade" | "mesa", SectionGuide> = {
  modelo: {
    oQueE:
      "A escolha do sistema que a campanha vai usar. O modelo traz regras, cenário e conteúdo prontos — em Sacramento, o faroeste à mineira do livro.",
    paraQueServe:
      "Com um modelo, o app já sabe as regras do jogo: vocabulário (Juiz, bando, réis), época padrão, lugares, facções e geradores vêm montados.",
    naPratica: [
      "Escolha Sacramento para usar tudo que o livro oferece, com páginas de referência em cada elemento.",
      "Não precisa conhecer as regras de cor: o app explica cada conceito onde ele aparece.",
    ],
  },
  identidade: {
    oQueE:
      "O nome e a cara da campanha — o que os jogadores verão no convite e no cartaz.",
    paraQueServe:
      "Um bom título e duas frases de descrição situam qualquer jogador antes mesmo da sessão zero.",
    naPratica: [
      "Título curto e evocativo funciona melhor que um resumo (“Poeira e Sacramento” > “Campanha de faroeste do grupo de sábado”).",
      "A descrição é pública para quem entrar — sem spoilers, só o convite à mesa.",
      "O cartaz ao lado atualiza em tempo real: é ele que dá as boas-vindas ao bando.",
    ],
  },
  mesa: {
    oQueE:
      "As regras de convivência e o clima da campanha: quantos jogam, que intensidade a história tem, que temas puxa e onde o mundo está no tempo.",
    paraQueServe:
      "É o contrato da mesa. Tom, temas e acordos de segurança não dão bônus — dão direção e confiança para todo mundo jogar.",
    naPratica: [
      "Tamanho do bando: quantos jogadores além de você (o convite é gerado ao criar).",
      "Tom é intensidade: arraste de Leve a Sombrio — dá para mudar depois.",
      "Temas são os fios da história: escolha 2 ou 3; menos é mais.",
      "Sessão zero: linhas (não acontece), véus (acontece fora de cena) e Cartão X (interrompe na hora). Combine antes da primeira sessão.",
      "Tudo desta etapa é editável no Hub de História depois de criar.",
    ],
    paginas: "sessão zero pp. 16, 47, 125–127",
  },
};
