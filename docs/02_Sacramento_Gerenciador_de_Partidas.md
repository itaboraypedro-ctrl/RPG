# Sacramento RPG — Especificação do gerenciador de partidas

> Documento 2 de 2 para implementação com Claude Code. Versão 1.0, 19/09/2026.
> Fonte exclusiva de regras: **Sacramento RPG, 1ª edição, dezembro de 2024**, PDF fornecido `pdfcoffee.com_sacramento-rpg-livro-basico-pdf-free.pdf`, 274 páginas físicas.
> Identificador da fonte (SHA-256): `18c35bd339eea79856a644eb6f604cef7c9804a717efed068beea3e290b0ff00`.
> Referências usam **paginação impressa**. Página física do PDF = página impressa + 2.
> Leia também `01_Sacramento_Criador_de_Personagens.md`, que contém as fórmulas de PJ, as 30 habilidades, as seis trilhas, a progressão, montarias e os catálogos de equipamento.

## 1. Instrução ao Claude Code e limites de autoridade

Implementar uma área para o **Juiz** preparar campanhas, criar histórias e seus elementos, acompanhar consequências e conduzir sessões. O livro não descreve uma aventura obrigatória com roteiro fechado. O sistema deve oferecer estrutura e referência, preservando a decisão do Juiz, a agência dos jogadores e as restrições mecânicas.

Este documento separa:

- **LIVRO:** mecânicas e parâmetros expressos, aplicados pelo perfil padrão.
- **LIVRE:** conteúdo narrativo original compatível com a campanha, sem benefício mecânico automático.
- **JUIZ:** decisão contextual expressamente admitida, incluindo testes e resolução ficcional.
- **LACUNA:** ausência/contradição do PDF que exige decisão local, não uma regra inventada pela IA.
- **PRODUTO:** desenho de dados, UX, auditoria e validação propostos para a plataforma.
- **REGRA DE MESA:** alteração deliberada das regras, identificada e versionada.

O Juiz pode arbitrar, aceitar soluções criativas sem teste e adaptar regras com o grupo (pp. 68, 117–118). O software deve mostrar a diferença entre **“permitido pelo texto”**, **“decisão do Juiz”** e **“alteração da mesa”**. Não exigir que cada cena cumpra um modelo narrativo obrigatório. Não inventar balanceamento, economia, magias ou fórmulas de outro RPG.

**PRODUTO:** usar o Documento 1 como catálogo compartilhado, não como uma segunda cópia divergente. Para uma IA de preparação, carregar ambos no contexto, além do estado autorizado da campanha; não depender de a IA recuperar regras por memória.

## 2. O que o Juiz pode criar e o que precisa respeitar

| Elemento | Liberdade permitida | Restrições/limites |
|---|---|---|
| História/campanha | Objetivo, duração, mistérios, ganchos, antagonistas, soluções e desfechos | Agência dos PJs e limites acordados; sem roteiro inevitável |
| Cenas | Lugar, participantes, atmosfera, objetos e oportunidades | Descrição não decide pensamentos/ações dos PJs (p. 116) |
| Desafios | Social, exploração, perseguição, investigação, combate, dilema | Não exigir teste se solução plausível remove o risco (pp. 68–74) |
| Teste contextual | Quando pedir, qual Antecedente/Atributo e NA apropriado | Fórmula do subsistema, custo e consequências; NA padrão 6 |
| NPC | Nome, objetivo, aparência, vínculos, profissão, agenda, lealdade | Fórmulas de NPC; NdC 1–6; tipo comum/especial; exceções publicadas |
| Vilão | Motivações, ameaças, aliados e planos | Habilidades de vilão exclusivas de NPC; custos/gatilhos |
| Redenção | Modelos ou trilha própria; oportunidades na campanha | Seis passos iniciais; final por último; exceções e recompensas |
| Lugares novos | Povoados, fazendas, covis, salões, rotas e paisagens | Coerência com a proposta; distinguir criação do cânone |
| Equipamentos | Aparência, materiais e usos narrativos | Efeitos/preços/capacidade do catálogo; dados novos são arbitragem |
| Perigos | Armadilhas, circunstâncias, ameaças ambientais | Fórmulas existentes; não fabricar dano por metro ou doença numericamente definida |
| Bando/base | Nome, aparência, localização, NPCs e suas histórias | Custos/níveis, papéis únicos, serviços, cartas, prazos |
| XP | Perguntas e ritmo podem mudar | Alteração da lista depende da concordância de todos (p. 49) |
| Encontros | Quantos inimigos e qual contexto | Livro não oferece calculadora de encontro “equilibrado” por nível |
| Cultura e crença | Cultos, tradição, lendas e rumores | Não converter crença em magia jogável automaticamente |

## 3. Estrutura de preparação da campanha

**PRODUTO**, fundamentado nas funções do Juiz das pp. 114–125.

### 3.1 Campanha

Campos sugeridos:

- Nome, descrição, Juiz, participantes, status e versão do conjunto de regras.
- Época e estado inicial do mundo; padrão editorial do cenário: **1880**.
- Premissa, objetivo comum do bando, temas, tom e escopo geográfico.
- Acordos da sessão zero, linhas, véus e canal para acionar interrupção de cena.
- PJs vinculados, suas trilhas, vínculos, objetivos e oportunidades de protagonismo.
- Facções, locais, NPCs, relações, ameaças, missões e acontecimentos persistentes.
- Calendário ficcional, sessões e anotações; não confundir data real e data do jogo.
- Decisões de interpretação, alterações de mesa e divergências deliberadas do cenário.

### 3.2 Cenas e missões

```text
Cena
  lugar, momento, participantes, descrição pública
  fatos verdadeiros, rumores, segredos do Juiz
  elementos interativos, pistas perceptíveis e antecipação de perigo
  problema atual e interesses dos NPCs
  possíveis consequências, sem solução obrigatória
  testes possíveis (não automaticamente exigidos)
  referências de regras, estado e eventos ocorridos

Missão
  proponente, objetivo, envolvidos, local, motivo
  recompensa monetária/objeto/serviço quando existir
  prazo ficcional se houver fonte ou decisão do Juiz
  evidências de progresso e critérios de conclusão
  vínculo com redenção, base ou facção
  consequências do sucesso, fracasso e abandono
```

Não tornar todos os campos obrigatórios para iniciar uma cena. Uma missão comum não herda o prazo de uma semana das missões de NPC da Base: aquele prazo é específico do subsistema.

### 3.3 Regras para geração assistida de história

Se houver IA na área do Juiz, impor estes requisitos de produto:

1. Toda proposta mecânica deve referenciar regra/página ou assumir rótulo de decisão proposta.
2. Criar situações abertas, sem controlar escolhas dos PJs nem decretar resultados de testes futuros.
3. Conectar oportunidades às forças e trilhas dos personagens, alternando tipos de desafio (pp. 123–125).
4. Incluir saídas plausíveis além de matar todos; negociação pode continuar no combate (p. 78).
5. Antecipar perigos por indícios: marcas, ruídos, circunstâncias e comportamento (p. 74).
6. Não ocultar informação observável útil só para forçar uma rolagem ou a solução imaginada pelo Juiz (p. 68).
7. Tratar NPCs como participantes da história, sem invulnerabilidade por serem “importantes” (p. 119).
8. Respeitar precedentes da mesa; mostrar quando nova decisão contradiz decisão anterior (p. 118).
9. Não converter uma sugestão gerada em fato ocorrido até o Juiz confirmá-la.
10. Não conceder dinheiro, XP, habilidade, Sina, item ou progresso de redenção só porque uma descrição foi gerada.
11. Não revelar segredos do mundo em recapitulações para jogadores sem autorização de visibilidade.

## 4. Sessão zero e jogo seguro

**LIVRO — pp. 16, 47, 123, 125–127.** O livro recomenda conversar antes do jogo sobre expectativas, logística, temas e comportamento. Todos participam; o Juiz tem responsabilidade especial de sustentar o acordo.

- **Linhas:** assuntos excluídos da ficção da mesa.
- **Véus:** assuntos que podem existir, mas sem exposição detalhada, em segundo plano.
- **Cartão X:** sinal de desconforto que encerra a cena imediatamente, sem debate ou exigência de justificativa.
- **Questionário anônimo:** alternativa sugerida para recolher preferências/limites.

**PRODUTO:** acordos editáveis e visíveis à mesa; botão de interrupção acessível; modo de recolher limites sem identificação quando de fato suportado. Não prometer anonimato se o backend expõe autoria. Não penalizar personagem por interrupção fora da ficção. Não tratar o bem-estar do grupo como teste de Coragem.

## 5. Cenário: referência para criar histórias compatíveis

### 5.1 Premissas

**LIVRO — pp. 14, 68, 129–135.** Faroeste fictício inspirado em Minas Gerais, com conflitos humanos, desigualdade, violência, sobrevivência e redenção. Geografia própria: desertos, neves, litoral e selvas coexistem. Belo Horizonte possui litoral, porto, fábricas, bondes e tecnologia que não devem ser “corrigidos” pela geografia/história brasileiras.

Estrangeiro e Oriente são regiões abertas para origens e referências; não correspondem a uma lista obrigatória de países reais. O texto admite anacronismos tecnológicos próprios; usar catálogo e cenário, não proibições baseadas apenas em 1880 real. As pp. 252–253 contextualizam o Velho Oeste histórico, mas não substituem a cronologia fictícia.

Não existe sistema de magia, raça fantástica ou ressurreição como feitiço. Cartas de Sina e Presenças são mecânicas do jogo; lendas, religião e rumores não demonstram automaticamente a existência literal de deuses/demônios.

### 5.2 Âncoras cronológicas do mundo padrão — pp. 131–132

| Ano | Marco |
|---:|---|
| 400 | Fundação de Maria da Fé |
| 420 | Ocupação dos platôs pelos Celestes |
| 420–1510 | Ocupação do País por diversos povos originários |
| 1510 | Primeiros navios do Estrangeiro |
| 1531 | Primeiras cidades do Leste; Tupaciguara |
| 1564 | Exploradores atravessam a Serra da Saudade |
| 1610 | Vila de Desemboque |
| 1693 | Sacramento |
| 1715 | Santo Ozório |
| 1730 | Independência do País |
| 1741 | Belo Horizonte |
| 1775 | Araguari |
| 1800 | Presídio Sepulcro |
| 1803 | Revolução Industrial no Estrangeiro |
| 1810 | Abertura do porto de Belo Horizonte |
| 1829–1830 | Imigração do Oriente; Bairro Oriental em BH |
| 1832 | Joaquim José mata o Presidente; vice assume; Guerra do Carvão |
| 1835 | Fim da guerra; redução do preço das terras do Oeste |
| 1836–1837 | Gangue do Nero com Zói de Gato; fundação de Bom Fim |
| 1840 | Abertura do Bom de Gole |
| 1843 | Nascimento de Golia no Circo do Sol |
| 1845 | Terror causado pelo Degolador |
| 1850 | Peste na Vila de Desemboque |
| 1856–1857 | Nero mata a esposa de Horácio; Zói de Gato deixa a gangue |
| 1858–1859 | Surgem Sagrados e sete Bispos; cabeça do Degolador exposta |
| 1860–1862 | Pesadelo mata o pai de Cristina; Presidente assassinado; Fivela de Cobra surge |
| 1870 | Bispa expulsa os Celestes |
| 1876 | Formação dos Pavio Curto e derrota dos Sagrados |
| 1878 | Surgem Novos Sagrados |
| 1880 | Presente de referência |

**LACUNAS de lore:** a Guerra do Carvão é chamada recente, apesar da cronologia 1832–1835; há falas e descrições locais que não se alinham perfeitamente. A história de BH descreve porto anterior ao marco de abertura da linha do tempo. Não montar um corretor histórico que bloqueie criação por tais tensões. Preservar fonte e decisão quando isso afetar a aventura.

### 5.3 Lugares e limites de uso

Esta tabela é um **guia de referência condensado**, não uma reprodução integral de todos os habitantes e segredos do capítulo 4. A plataforma pode criar lugares/figuras próprios; se importar outro detalhe canônico não listado aqui, consultar a página correspondente em vez de inventá-lo.

| Lugar | Características úteis | Conflitos/elementos canônicos | Páginas |
|---|---|---|---|
| Tupaciguara | Café, pecuária, moinhos, vida comunitária, recuperação após violência | Fazendas Esperança, Vasconcelos e Domingues; rivalidade entre famílias; Bar do Tião; sobreviventes dos Pavio Curto | 136–141 |
| Bom Fim | Chuva, lama, produção agrícola, turismo/festas | Salão Bom de Gole; estátua de Ismael; Marcia Miguel e Conselho de Hoteleiros; Ditinho e Tonho do Arame; disputa por universidade/Hotel Versailles | 142–151 |
| Belo Horizonte | Fronteira industrial e litorânea, porto, bondes, desigualdade e corrupção | Casa da Moeda, hospitais, prefeitura, estação, Cidade-Oriental, Comando das Seis Balas; forças da lei e capital | 152–167 |
| Sacramento | Ruínas incendiadas, vegetação retomando edifícios | Antigos Sagrados derrotados; novos Bispos Hermes, Abreu e Aranha reorganizam poder | 168–181 |
| Celestes/antiga Varginha | Platôs, Floresta do Céu, povo de tradições próprias | Expulsão pela Bispa e reconstrução; origem e presente divino tratados como mistérios/crenças | 182–189 |
| Araguari | Mineração de carvão, chuva, luto, “cidade das viúvas” | Guerra, doença, Circo do Sol e exploração | 190–197 |
| Serra da Saudade, povoado | Pequena vila fria de cerca de 40 pessoas | Ocupação por Fivela de Cobra e sobreviventes deslocados | 198–201 |
| Vila de Desemboque | Cidade arruinada pela peste, com bens abandonados | Coveiro, risco de contágio, origem de Hermes/Apolo; Ité nas redondezas | 202–207 |
| Maria da Fé | Vale frio, lago congelado, caça/pesca, cultura comunitária | Maria da Fé também é título da anciã; Stella é a 14ª; trocas locais sem moeda, comércio externo monetário; localização e chá de visitantes envoltos em mistério | 208–219 |
| Araçuaí | Cidade de pedra no Deserto de Mucuri, calor, comércio e artesanato | Feira da Barganha a cada três meses, banco, ferrovias e produtos raros | 220–227 |
| Santo Ozório | Litoral turístico, hotéis, pesca e arquipélago | Hotel Rubro, Ilha de Sepulcro, farol desativado, histórias não resolvidas | 228–233 |
| Floresta do Cipó | Vegetação densa, baixa visibilidade, fauna e trilhas | Curupira; Kaapuã; histórias cuja verdade pode caber ao Juiz | 234–239 |
| Sertão de Fungos | Ambiente **úmido**, charcos, névoa e toxinas | Gangue do Cogumelo, chá e alucinações; Akor | 240–243 |
| Serra da Saudade, cordilheira | Montanhas, lagos, frio, ferrovias e fauna | Distinguir da vila homônima; Yakecan | 244–245 |
| Deserto de Mucuri/Ravina Vermelha | Deserto, cânion e ecossistemas diferentes | Vestígios de exploração, templo e inscrição “UMBASA”; Katuan | 246–249 |
| Trincheira do Carvão | Restos da guerra e terra devastada | Valas, mortos, memória do conflito e convento isolado | 250–251 |

**Segredos do Juiz:** podem incluir verdade por trás do culto criado por Czar, a trajetória de Hermes/Apolo, a identidade pública encenada de Adalberto Luz, origem da peste e planos de facções. Não publicar todos como conhecimento comum dos jogadores.

**Divergências de lore a preservar:** Bom de Gole tem descrições de propriedade/gestão diferentes entre pp. 147–151; setores do porto/polícia de BH variam entre descrições e p. 265; Companhia Fronteiriça do País aparece como Companhia Ferroviária do País na p. 266. Usar IDs estáveis e aliases, sem inventar duas companhias por essa variação.

Mudar história passada/cânone é possível na campanha, mas deve aparecer como **versão da mesa**. Criar um novo povoado não exige alegar que ele já existia no livro.

### 5.4 Calendário do Bom de Gole — p. 149

| Mês | Evento |
|---|---|
| Janeiro | Festa da Chuva e do Ano Bom |
| Fevereiro | Festival de Música e da Felicidade |
| Março | Festival da Cenoura e da Orquídea |
| Abril | Rodeio Dois-Irmão |
| Maio | Festivão da Abóbora e do Pinhão |
| Junho | Festa do Bumba-Quem-Quer |
| Julho | Mês do Aniversário do Alface |
| Agosto | Feriado do Mês Prolongado |
| Setembro | Festival de Música da Felicidade 2 |
| Outubro | Comemoração da Cerveja e da Salsicha |
| Novembro | Festa da Inovação da Lavoura |
| Dezembro | Festa dos Miguel |

Esses eventos são ambientação e oportunidades, sem recompensa mecânica automática.

## 6. Testes fora do combate

**LIVRO — pp. 19–21, 68–74.** O Juiz pede testes quando há incerteza/risco relevante. Jogador pode propor abordagem e justificar outro Antecedente. Criatividade plausível pode resolver sem rolagem.

| Tipo | Cálculo/procedimento | Resultado |
|---|---|---|
| Antecedente | `1d6 + Antecedente + modificadores` | Sucesso se total ≥ NA, padrão 6 |
| Resistência | `1d6 + Atributo + modificadores` | Sucesso se total ≥ NA, padrão 6 |
| Contra | Cada participante rola com o Antecedente escolhido pelo Juiz | Maior total vence; empate não definido |
| Sorte com dado | 1d6 | Par = sim; ímpar = não |
| Sorte com carta | Sacar carta | Preta = sim; vermelha = não |

Agir para conseguir algo tende a usar Antecedente; reagir a influência externa tende a usar Atributo. Não somar Atributo e Antecedente juntos por padrão. A corrida montada é uma exceção própria: `1d6 + Potência da montaria + Montaria do PJ` (p. 50).

Um 1 natural falha automaticamente em ataques e nos testes de NPC descritos na p. 96. **Não generalizar para todo teste comum de PJ**, pois o livro não o manda em pp. 70–74. Críticos de Violência têm procedimento separado. Sucesso/fracasso narrativo é descrito pelo Juiz/jogadores, não reduzido a mensagens genéricas.

### 6.1 Forçar rolagem — p. 71

Após falha, o PJ pode optar por forçar **uma única vez por teste**. Não pode ser obrigado pelo Juiz.

```text
precondicoes: houve falha; ainda nao foi forcado; nao e combate
NA_novo = NA_anterior - 1
rolar novamente
sempre aplicar uma consequencia negativa coerente com a situacao
se falhar: somar consequencias da falha e da aposta arriscada
```

Permitido em Testes Contra (p. 72), mas nesses a redução de NA não tem aplicação óbvia, pois vence o maior total; a mesa deve definir essa interação. **Proibido forçar no combate**, mesmo que o teste use Antecedente. Gastar Sina para refazer teste é outro mecanismo.

### 6.2 Melhor de dois dados

Habilidades autorizam dois dados em contextos específicos. Registrar ambos e qual foi selecionado; somar o modificador ao escolhido. Não somar os dados. A interação com confirmação de crítico e fontes simultâneas precisa de política transparente quando não explicitada.

## 7. Combate: estado, cartas, turnos e recursos

**LIVRO — pp. 76–89.** Permitir teatro da mente ou mapa. Um grid de 1,5 m aparece no exemplo da p. 89; não tornar o mapa obrigatório.

**PRODUTO:** estados sugeridos `preparacao → iniciativa → rodada/turno → encerrado`; fim por rendição, fuga, incapacidade ou causa ficcional, não só eliminação total.

### 7.1 Iniciativa — pp. 78–79

- Cada PJ saca uma carta, acrescida das fontes específicas de cartas adicionais, e escolhe uma quando tiver opções.
- Ordem decrescente: **A > K > Q > J > 10 > 9 > … > 2**.
- Empate PJ/PJ: jogadores decidem. Empate PJ/NPC: **NPC age antes**.
- O Juiz pode sacar por grupo de NPCs, por exemplo agrupados por NdC, em vez de cada indivíduo.
- Não há nova compra automática a cada rodada; o livro descreve iniciativa do combate.
- Naipe não desempata a iniciativa por regra geral.

Para ativar o benefício de A/K/Q/J, o personagem **descarta a carta e vai para o fim da iniciativa**, sendo o último. Pode descartar no saque inicial ou no fim do próprio turno, sem consumir ação. Se mantiver a posição, não recebe o bônus. Bônus valem **apenas para aquele combate**.

| Carta descartada | Benefício |
|---|---|
| A | +1 nos Testes de Violência |
| K | +1 AC |
| Q | +1 M |
| J | +1 V |

O V temporário do Valete não é Dor. Destino de vários personagens no fim da fila, momento exato de concessão/remoção do V e uso de descartes por NPCs não têm todos os detalhes definidos; registrar arbitragem, evitando ativar repetidamente a mesma carta.

### 7.2 Turnos e rodadas — pp. 79–80

```text
PJ: AC_base = 1 + Coragem; M_base = 1 + Velocidade
NPC: reserva unica de acoes, conforme NdC/tipo
rodada ≈ 10 segundos; um turno por participante/grupo na ordem
nova rodada restaura os recursos do turno, considerando efeitos ativos
```

Não converter livremente AC em M ou vice-versa para PJs. Habilidades como Punhos do Oriente criam exceções. NPCs usam uma reserva única de ações para as duas funções (pp. 96, 254).

### 7.3 Ações e movimento

| Ação | Custo/procedimento | Fonte |
|---|---|---|
| Atirar | 1 AC por disparo, salvo arma/habilidade; 1d6 + Violência contra Defesa | p. 81 |
| Lutar corpo a corpo | 1 AC por golpe; Violência contra Defesa | p. 81 |
| Mirar | Gastar 2 AC para +1 em Violência naquele disparo; máximo +1; não gastar mais de 1 M no turno | p. 81 |
| Recarregar | Custo da arma; igual para recarregar 1 bala ou carga inteira | p. 82 |
| Recuperar arma/munição da mochila | 2 AC, além da interação de recarga pertinente | p. 53 |
| Arremessar bomba | 1 M + 1 AC; Violência **NA 7** | p. 82 |
| Laçar | Montaria do atacante contra Velocidade do alvo; alvo sem cobertura; até 6 m | p. 82 |
| Andar/correr | 1 M = 3 m | p. 85 |
| Deslocar montado | 1 M = 10 m | p. 50 |
| Entrar em cobertura | 1 M | p. 85 |
| Sair de cobertura | 1 M | p. 85 |
| Fugir | Todas as AC e M; teste Suor a pé ou Montaria montado, salvo solução criativa | p. 85 |
| Outras ações | Custo de AC/M decidido em consenso, palavra final do Juiz | p. 82 |

**LACUNAS:** Mirar não diz com precisão se as duas AC incluem o disparo ou são preparatórias; Laçar está entre ações de combate, mas não explicita número de AC. Permitir decisão antes da automação desses custos. O livro não fornece alcance numérico para todo golpe corpo a corpo nem dano desarmado-base inequívoco.

**Laçado:** não faz Movimentos nem AC comuns; pode tentar escapar com Suor ou Roubo. NA, custo e frequência dessas tentativas não são fixados. Chamego impõe −1 a quem tenta se soltar. Não inventar que todo laço funciona como dano da Boleadeira.

### 7.4 Ataques e Tudo ou Nada

Um ataque acerta se `1d6 + Violência + modificadores ≥ Defesa`. **1 natural falha**, mesmo com bônus altos. NPC usa NdC no lugar de Violência.

**Tudo ou Nada (p. 81):** opcionalmente resolver os tiros desejados com uma única rolagem. Se acertar, **+1 V de dano por tiro**; se falhar, todos erram. Contabilizar cada projétil e respeitar cadência/recargas. Não estender a golpes corpo a corpo. Múltiplos alvos com Defesas diferentes e interação com críticos não têm procedimento completo: deixar a mesa resolver o caso.

### 7.5 Cobertura e surpresa — pp. 26, 85, 89

| Estado | Defesa a partir de base 5 | Ataque a partir dessa posição |
|---|---:|---|
| Sem cobertura | 5 | Sem penalidade de cobertura |
| Parcial | 6 | Sem penalidade |
| Completa | 7 | −1 em Violência para atirar |
| Surpreendido | 3 | Duração/recomposição definida conforme a situação |

Cobertura completa significa pouca exposição, **não imunidade**. Boca na Botija evita a redução por surpresa. Fúria dos Aflitos modifica Defesa; a Presença da Enfermeira pode elevá-la a 8 com cobertura no próximo combate. Não impor um teto global 7 ignorando essas exceções.

Quando um estado fixo como surpresa coincide com bônus/penalidades de Defesa, não escolher ordem de aplicação sem decisão registrada.

### 7.6 Explosivos e armamento de área — pp. 54, 58–59, 82

- Explosivo/molotov: raio **1,5 m**; canhão: **3 m**; metralhadora: alvos em linha, inclusive aliados.
- Bomba: Violência NA 7. Falha comum: não explode, pela p. 82.
- Ao sair **1 natural** no arremesso de bomba, não usar tabela comum de crítico. Aplicar evento de explosão no usuário e teste de Velocidade para escapar.
- A p. 54 diz que a bomba explode na mão se falhar na resistência; a p. 82 descreve a explosão acontecendo e resistência para evitar seu dano. O efeito sobre terceiros é ambíguo: pedir decisão.
- Fogo no Céu protege de explodir os próprios miolos pela falha crítica específica, não dos demais explosivos.
- Custo de “recarga” da dinamite de **3 AC** na p. 58 conflita com arremesso **1 AC + 1 M**; não cobrar ambos automaticamente.
- Dano de metralhadora é descrito por AC e M, mas o exemplo de **2 AC + 2 M = 6 V** não corresponde à soma simples multiplicada por 3. Exigir fórmula escolhida pelo Juiz, sem assumir 12 V.
- Canhão usa Violência NA 7, não Defesa; falha comum erra 3 m em direção aleatória; falha crítica atinge aliado/arredores. Não inventar tabela obrigatória de direção.
- Proteções improvisadas não reduzem explosão.

Custos, munições e danos de cada arma estão no Documento 1. Não duplicar valores conflitantes em outro catálogo.

## 8. Críticos

**LIVRO — p. 84.** Em Teste de Violência, 6 natural exige outro dado: se sair 6 novamente, acerto crítico. Com 1 natural, outro 1 confirma falha crítica. O segundo dado é confirmação, não soma ao ataque. Confirmado o crítico, rolar 1d6 na tabela pertinente.

| d6 | Acerto crítico |
|---:|---|
| 1 | Mortal: +2 V “no seu turno” |
| 2 | Alvo perde o próximo turno |
| 3 | Alvo não pode mais atirar com aquela arma |
| 4 | +1 em Violência para o atacante até fim do combate |
| 5 | +1 M no turno do atacante até fim do combate |
| 6 | Alvo foge e promete vingança |

| d6 | Falha crítica |
|---:|---|
| 1 | Ataque atinge aliado ou inocente |
| 2 | Arma quebra; se for luta desarmada, dano anulado |
| 3 | Inimigos ganham +1 nos testes contra o atacante até fim do combate |
| 4 | Atacante sofre −1 no ataque contra inimigos até fim do combate |
| 5 | Atacante perde o próximo turno para se recompor |
| 6 | Atacante cai e perde duas ações de qualquer tipo para levantar |

**LACUNAS:** “Mortal” não esclarece se +2 V vale por golpe ou uma vez no turno; “Desarmar” não define reparo/recuperação; sequência exata de dano com fuga crítica não é fixada. Não converter acerto crítico em dano dobrado. Não tratar um único 6 como crítico confirmado. Não estender crítico a todo teste do jogo.

## 9. Dano, dor, morte e recuperação

Convenções: `V` = Vida; `D` = Dor; `AC` = Ação de Combate; `M` = Movimento.

### 9.1 Dor — pp. 86–87

Dor tem **6 círculos**. Ao riscar o sexto:

1. Riscar **1 V**.
2. Rolar 1d6 na tabela de consequências.
3. Apagar os seis D para recomeçar o ciclo.

Não chamar esse ciclo de morte automática ou inconsciência universal. O livro não diz que todo personagem com seis D desmaia. Fogo e venenos possuem regras específicas.

| d6 | Consequência de Dor |
|---:|---|
| 1 | Atordoamento: −1 AC na próxima rodada/turno afetado |
| 2 | Queda: gastar 1 M para levantar |
| 3 | Distração: não atacar o mesmo alvo no próximo ataque |
| 4 | Sangramento: **1 D por turno até fim do combate** |
| 5 | Intimidação: afastar-se do atacante na próxima rodada |
| 6 | Desorientação: −1 em Violência no próximo turno |

**Atenção:** Sangramento desta tabela causa **Dor**, não Vida. Danos mistos devem manter ambos os canais.

**LACUNA:** sobra de Dor quando um golpe ultrapassa o sexto círculo e empilhamento de consequências repetidas não são detalhados. Implementação sugerida é registrar dano inteiro e processar ciclos com resto, mas somente como interpretação escolhida, não regra textual inequívoca.

### 9.2 Vida e Teste de Morte — p. 87

Quando todos os V são riscados:

- Aplicar Livramento se elegível e ainda não usado no combate: recupera 2 V e cai.
- Na resolução ordinária, rolar **1d6 sem somar Físico**.
- **1 ou 6:** sobrevive; gastar **1 M + 1 AC**, recuperar **3 V** e retornar.
- **2, 3, 4 ou 5:** morre.
- Só é possível fazer **um Teste de Morte no mesmo combate**. Se já o fez e zerar novamente, não ganha outro teste.
- Pode gastar Sina para evitar o Teste, ainda pagar ações e receber consequência permanente aleatória.

| d6 | Consequência da Sina usada para evitar morte |
|---:|---|
| 1 | −1 Intelecto permanente |
| 2 | Perde todos os equipamentos durante inconsciência |
| 3 | Nenhuma consequência adicional |
| 4 | Perde a montaria durante inconsciência |
| 5 | −1 V máximo permanente |
| 6 | −1 em Atributo escolhido pelo jogador |

A p. 95 permite reanimar até uma rodada após a morte; a p. 87 descreve evitar a morte com Sina. A interação com morte definitiva/repetição e custos ausentes precisa de política. Não implementar ressurreição ilimitada. Não aplicar automaticamente o tratamento de PJ a todo NPC morto sem considerar Sina do Juiz e a arbitragem.

**Outras lacunas:** pagamento quando não restam ações no turno, piso de Atributo após lesão, redução de Vida máxima abaixo da atual, sequência Livramento/Sina/Teste e recuperação fora do próprio turno. Representar estados pendentes para o Juiz resolver, sem escolher perda de ficha silenciosamente.

### 9.3 Descanso e tratamento — pp. 31, 88

| Situação | Cura |
|---|---|
| 24 h de descanso | Todos os D e 2 V |
| 24 h com cuidado médico | Todos os D e 3 V |
| Tratamento arriscado com Medicina: sucesso | +2 V à recuperação |
| Tratamento arriscado: falha | Nenhum V recuperado pelo paciente; Dor recupera |
| Unguento/pomada | +1 V pela regra geral, respeitando produto específico |

Medicina com pontos permite cuidados ordinários sem teste; teste é exigido para o tratamento arriscado. Não acumular descanso comum e descanso médico como 2+3. Não multiplicar frascos para cura ilimitada sem regra. Não Vai Doer Nadinha possui bônus específico no Documento 1.

Na Fase de Bando, duração aproximada de três dias e serviços têm regras próprias; o livro não determina exatamente a ordem/acúmulo com três recuperações diárias. Registrar política de descanso da base.

Proteção: reduzir Vida aplicável até seu limite de dano; manter penalidade mesmo depois de quebrar, até retirar. Armas, remédios e efeitos de cura em combate estão descritos integralmente no Documento 1.

## 10. Perigos e outras regras

**LIVRO — pp. 90–93.** Não converter todo perigo em combate. O Juiz escolhe contexto e pode permitir prevenção criativa.

### 10.1 Enforcamento — p. 90

Estabelecer iniciativa para a tentativa de salvamento. Ao a corda esticar, **3 V**; a cada rodada subsequente, **2 V**. Ao zerar Vida, morte **sem Teste de Morte**. A interação com Sina/Livramento não recebe exceção expressa nesse verbete: pedir arbitragem, sem substituir a proibição por teste ordinário automático.

### 10.2 Armadilhas — p. 91

O Juiz descreve sinais antecipados e pode pedir Atenção. Mesmo após falha, pode permitir Resistência apropriada para evitar o perigo. O dano é definido pela armadilha/ficção: **3 D** é o exemplo da colmeia, não dano universal de armadilha. Não obrigar duas rolagens quando o perigo já foi evitado por uma boa solução.

### 10.3 Afogamento — p. 91

Água calma normalmente dispensa teste. Em água perigosa/profunda/revolta, usar Suor. Se falhar, retém o ar por **Físico + 1 rodadas**. Se não for salvo, perde **3 V por rodada subsequente**. O texto não remove explicitamente o Teste de Morte como faz no enforcamento.

### 10.4 Fogo — p. 92

| Exposição por rodada | Dano |
|---|---:|
| Pequena, como tocha/pequena área | 1 D |
| Média, como fogueira/forno | 2 D |
| Grande, como sala em chamas | 3 D |

Ao completar os seis D, aplicar o ciclo de Dor e fazer teste de **Físico** para não desmaiar nas chamas. O NA não é específico, portanto usar padrão 6 salvo decisão contextual.

### 10.5 Venenos — p. 92

1. Ao ser exposto, Físico contra NA do veneno.
2. Sucesso: evita o efeito relevante.
3. Falha: aplicar efeitos; pode ser tratado com Medicina contra o mesmo NA.
4. Veneno não tratado é eliminado pelo organismo em **1d6 dias**, se a vítima sobreviver.

| Veneno | NA | Efeito |
|---|---:|---|
| Cobra | 7 | −1 M, mínimo 0; 1 V por rodada |
| Mistura de toxinas | 6 | Necessidade imediata de evacuar; 1 V por rodada |
| Cicuta selvagem | 7 | −1 AC, mínimo 0; 1 V por rodada |
| Sonífero | 7 | −1 em Atenção e Violência; dormir em 2 rodadas |
| Cogumelos alucinógenos | 7 | −1 em Violência; resultados 1 e 2 entram na falha crítica |
| Aranha | 7 | 2 D por rodada |

Não confundir **por rodada**, **por turno** das Balas Envenenadas e **por ação** de Sabugos e Peçonhas. A confirmação de crítico sob cogumelos não está detalhada. Repetição periódica de resistência, quantidade de doses, frequência de Medicina e “Veneno Mortal” de outros verbetes não são completados por esta tabela; não inventar equivalências.

### 10.6 Quedas — p. 92

Exemplos: queda de cavalo **1 D**; segundo andar **2 D**; rolar morro abaixo **3 D**. Precipício pode ser mortal conforme a ficção. O livro recomenda essas referências, **não uma fórmula por metro**.

### 10.7 Bebedeira — p. 93

Quando o Juiz pedir, fazer resistência de Físico, aumentando o NA em **+1 por dose**. A base exata de contagem das doses não é exemplificada; vincular ao NA padrão e à decisão do Juiz.

- Sucesso: até o dia seguinte, **+1 carta de iniciativa, −1 em Violência, +1 M**.
- Falha: desmaia; no dia seguinte acorda de ressaca e sem recordar tudo. Rolar **um d6 por coluna**, independentemente.

| d6 | O que fez | Com quem | Onde acordou |
|---:|---|---|---|
| 1 | Fez amizade | Padre | Chão do salão |
| 2 | Brigou a socos | Vaca | Caixão no cemitério |
| 3 | Casou-se | Coveiro | Cela |
| 4 | Perdeu aposta | Inimigo | Mato |
| 5 | Roubou algo | Interesse amoroso | Porão |
| 6 | Contou segredos | Árvore/planta | Chiqueiro/curral |

Resultados absurdos são sementes narrativas para interpretação, sempre subordinadas aos limites da mesa. Não criar penalidade adicional de ressaca que o livro não quantifica.

### 10.8 Peste de Desemboque — p. 204

Quem entra sem proteção adequada para boca, nariz, pele e feridas deve testar **Físico** para não contrair a peste. Água local é perigosa. O livro descreve sintomas e possível morte, **mas não fornece tabela de progressão, incubação, dano por dia ou cura garantida**. Usar NA padrão 6 onde não alterado pelo Juiz e registrar a condução narrativa da doença. Não importar mecânicas de veneno como se fossem uma regra específica da peste.

### 10.9 Viagem, fome, frio e sede

O livro admite resistências de Físico para esses perigos (p. 73), mas não estabelece quilometragem diária, consumo obrigatório por hora, níveis de exaustão ou tabela climática. O gerenciador pode ter calendário e recursos, porém esses números são **decisões de campanha**, não regras oficiais. Distância tática de 10 m/M não é velocidade diária da montaria.

## 11. Cartas de Sina e fechamento da sessão

**LIVRO — pp. 42, 49, 87, 94–95.** Sina é recurso narrativo mediado pelo Juiz. Preservar **valor e naipe**, pois a mesma carta pode importar no duelo. Se a carta física for temporariamente devolvida ao baralho para outro uso, o direito à Sina permanece e depois retorna a mesma carta.

### 11.1 Ganho

Cada PJ pode ter **no máximo duas Cartas de Sina por sessão**, conforme a redação do livro. O Juiz decide concessões por façanhas arriscadas, contribuição à redenção, atos não egoístas, criatividade, proteção de inocentes e conduta relacionada à trilha. Cumprir passo da trilha também concede Sina.

**LACUNA:** “ter no máximo duas por sessão” pode significar limite simultâneo de posse ou limite de recebimentos na sessão. Guardar **ambos os contadores** e pedir política da mesa. Não presumir reposição infinita ao gastar, nem descartar carta automaticamente sem política entre sessões.

### 11.2 Uso

- Refazer teste falho próprio **ou de aliado**.
- Reanimar morto até **uma rodada após a morte**.
- Trocar cartas no duelo.
- Receber **+1 XP** ao fim da sessão por Sina não utilizada, conforme interpretação conjunta com a p. 49.

Sempre que um PJ usa uma Sina, **o Juiz recebe uma Sina** para seus NPCs, inclusive em duelos. O texto não determina com clareza se é a mesma carta ou outro saque, o limite do Juiz e o tratamento das cartas comunitárias: registrar política.

Refazer teste com Sina **não é Forçar Rolagem**: não aplicar automaticamente NA−1 e consequência negativa. Não aumentar o número de trocas do duelo além do permitido por possuir Sina.

### 11.3 XP e encerramento

Usar as cinco perguntas e a tabela de níveis do Documento 1. Guardar dinheiro no começo/fim da sessão para a pergunta financeira; não comparar com o valor de bens ou recompensa pela cabeça.

**Duplicidade potencial de XP:** terminar com Sina já é a quinta pergunta de XP (p. 49), e a p. 95 menciona +1 XP de Sina. Não somar dois ou três XP por isso automaticamente. Política sugerida: **um único +1 pelo critério de Sina restante**, independentemente de ter uma ou duas, até decisão diferente do grupo. Identificar como interpretação.

Fechar sessão deve ser idempotente: XP, Fidelidade, Sina, benefícios e avanços não podem ser lançados duas vezes por repetição da requisição.

## 12. NPCs: criação, estatísticas e autoridade

**LIVRO — pp. 96–97, 254–255.** Um NPC não é construído com os quatro atributos e os oito antecedentes de um PJ. Sua estatística central é **Nível de Canalhice, NdC**, inteiro de **1 a 6**. NdC não significa obrigatoriamente caráter maligno.

| Condição | Comum | Especial |
|---|---|---|
| Dor | 6 | 6 |
| Vida | `3 × NdC` | `6 × NdC` |
| Defesa base | 5 | 5 |
| Testes/ataques | `1d6 + NdC` | `1d6 + NdC` |
| Reserva de ações/turno | `NdC + 1` | `NdC + 3` |
| Dano | Arma/ataque utilizado | Arma/ataque utilizado |

Ações de NPC podem servir para movimentar ou combater. Resultado natural 1 falha nos testes descritos para NPCs. Não aplicar pontos de Coragem/Velocidade ou multiplicar dano por NdC sem habilidade.

| NdC | Vida comum | Ações comum | Vida especial | Ações especial | Habilidades no modelo especial |
|---:|---:|---:|---:|---:|---:|
| 1 | 3 | 2 | 6 | 4 | 1 |
| 2 | 6 | 3 | 12 | 5 | 1 |
| 3 | 9 | 4 | 18 | 6 | 2 |
| 4 | 12 | 5 | 24 | 7 | 2 |
| 5 | 15 | 6 | 30 | 8 | 4 |
| 6 | 18 | 7 | 36 | 9 | 5 |

NPC especial pode ter habilidades de PJ ou de vilão, conforme cabimento; as de vilão são exclusivas de vilões NPC (p. 255). Um aliado especial não precisa ser um vilão só por usar fórmula especial.

**Conflito interno:** algumas fichas publicadas têm mais ou menos habilidades do que a tabela de criação. Preservar **fichas publicadas como templates específicos com fonte**, sem apagar habilidades ou preencher vagas automaticamente. NPC novo usa o modelo geral, salvo regra de mesa. Os Novos Bispos possuem **uma habilidade extra expressa** (p. 264).

Para habilidades de PJ em NPC, o livro não dá equivalência universal entre nível/NdC e Físico/atributos ausentes. **Não substituir todo Atributo por NdC por conta própria.** Se o efeito precisa desses valores, o Juiz deve definir parâmetros de execução da habilidade.

### 12.1 Informações narrativas do NPC

**PRODUTO:** nome, apelido, origem, ocupação, descrição, desejo, medo, segredo, vínculos, atitude, facção, localização, recursos e agenda. Esses campos não concedem bônus além da ficha. Figura narrativa sem confronto previsto pode permanecer sem ficha numérica até necessário.

### 12.2 Gerador de NPC — pp. 119–120

Sacar **uma carta por coluna**: nome, sobrenome, atividade e característica. A reação é determinada pelo **naipe da última carta**. É ferramenta de inspiração, não regra de criação obrigatória.

| Carta | Nome | Sobrenome | Atividade | Característica |
|---|---|---|---|---|
| 2 | Valentina | Santana | Almofadinha | Cicatriz marcante |
| 3 | Marquinhos | Fernandes | Bandido | Sotaque carregado |
| 4 | Mariquita | Camargo | Cozinheiro | Tique nervoso |
| 5 | Bento/Bentinho | Araújo | Letrado | Item curioso |
| 6 | Maria | Silva | Médico | Piadista |
| 7 | Ana Rosa | Santos | Alfaiate | Nariz quebrado |
| 8 | Leôncio | Prado | Aposentado | Muito forte |
| 9 | Joana | Mentes | Militar | Pouco perspicaz |
| 10 | João | Batista | Xerife | Voz melodiosa |
| J | Marília | Azevedo | Músico | Elegante |
| Q | Luan | Reis | Gigolô | Mau hálito |
| K | Castela | Moraes | Minerador | Tapa-olho |
| A | Enzo | Pereira | Fazendeiro | Mau cheiro |

Reação: **paus hostil; ouros indiferente; espadas amigável; copas muito amigável**. Aparência “muito forte” não aumenta NdC automaticamente. Não acrescentar uma quinta compra só para reação.

## 13. Nove habilidades exclusivas de vilão

**LIVRO — pp. 255–257.** Não disponíveis no criador de PJ.

| Habilidade | Gatilho/custo/efeito | Fonte |
|---|---|---|
| Ameaça Covarde | Revelar ameaça a inocentes **antes da iniciativa**, no início do combate. Se o vilão for atacado, a tragédia é ativada **após uma rodada**. O mecanismo ficcional e a possibilidade de impedi-la cabem à cena. | p. 256 |
| Balas Envenenadas | Alvo atingido faz Físico; se falhar, além do dano da arma perde **1 V por turno**. NA específico não informado; usar padrão quando apropriado. | p. 256 |
| Escudo Humano | Em lugar com pessoas, gastar **1 ação** para usar vítima como escudo. Ataque à distância que “não supere” Defesa atinge a vítima, com possibilidade de morte. Empate e chance de morte não são quantificados. | p. 256 |
| Espora Afiada | Montado, melhor(2d6) para galopar, fugir, saltar ou controlar; cada uso causa **1 D à montaria**. | p. 256 |
| Fuga Infeliz | Com **menos de metade da Vida**, gastar todas as ações para escapar. Próximo PJ na iniciativa testa **Velocidade NA 8** para impedir. Exatamente metade não cumpre o gatilho. | p. 257 |
| Mestre Arsenal | Arsenal de **1d6+1 armas pesadas** operadas por capangas **NdC 2**. Vilão gasta o turno; testes de acerto são dos capangas, usando seus NdCs. Quantidade exata de operadores não definida. | p. 257 |
| Olho Morto | Ignorar bônus de cobertura ao atacar, desde que o vilão não use ações para se mover e não esteja em cobertura. | p. 257 |
| Roubo de Sina | Durante duelo, escolher uma carta do oponente e usá-la como própria. Se perder mesmo assim, o vilão **morre imediatamente**. Limite de ativações e visibilidade da carta não especificados. | p. 257 |
| Supremacia | **Uma vez por combate**, pagar ações para um aliado interceptar igual quantidade de ataques: 1 ação por ataque. Se aliado morrer, não continua protegendo. Janela reativa e alocação entre aliados não totalmente definidas. | p. 257 |

Escudo Humano conflita com a regra geral de acerto em igualdade: não fazer um total igual à Defesa atingir simultaneamente vilão e vítima por acidente de implementação. Mostrar decisão específica.

## 14. Templates de facções e forças da lei

**LIVRO — pp. 258–266.** São modelos disponíveis, não encontros obrigatórios. Quantidade de integrantes em cena, armas, objetivos e posicionamento dependem do Juiz. O livro não fornece estatísticas completas de todos os indivíduos citados na ambientação.

### 14.1 Gangues

| Facção/tipo | Tipo de NPC | NdC | Habilidades publicadas | Fonte |
|---|---|---|---|---|
| Curupira: Gritos | Comum | 2–3 | Nenhuma | p. 259 |
| Curupira: Silêncios | Especial | 2–4 | Armas da Natureza; Ataque Sacana | p. 259 |
| Bandoleira Escarlate: Rosáceos | Comum | 1–3 | Nenhuma | p. 260 |
| Bandoleira Escarlate: Rubros | Comum | 4–5 | Nenhuma | p. 260 |
| Bandoleira Escarlate: Vermelhos | Especial | 1–3 | Dedo Quente; Escudo Humano | p. 260 |
| O Escarlate | Especial | 6 | Ameaça Covarde; Marretada; Mestre Arsenal; Parrudeza | p. 260 |
| Seis Balas: Correria | Comum | 2 | Nenhuma | p. 261 |
| Seis Balas: Bacana | Comum | 3 | Nenhuma | p. 261 |
| Seis Balas: Terno | Especial | 1–2 | Fuga Infeliz; Salve-se Quem Puder | p. 261 |
| Seis Balas: Continência | Especial | 1–4 | Dedo Quente; Gatilho Furioso; Zói de Gavião | p. 261 |
| Seis Balas: Gravata | Especial | 6 | Ameaça Covarde; Escudo Humano; Mestre Arsenal; Supremacia | p. 261 |
| Cabeça de Abóbora | Comum | 1–6 | Nenhuma | p. 261 |
| Rafaela Gonzaga | Especial | 5 | Coldre de Sabão; **Dedo Furioso**; Parrudeza | p. 262 |
| Leonor Gonzaga | Especial | 5 | Canção da Emoção; Livramento; Zói de Gavião | p. 262 |
| Donela Gonzaga | Especial | 5 | Às na Manga; Boca na Botija; Cuspe e Cola | p. 262 |
| Michaela Gonzaga | Especial | 5 | Ataque Sacana; Fumaça na Água; Galope Certeiro | p. 262 |
| Cogumelo: Neófitos | Comum | 2 | Nenhuma | p. 263 |
| Cogumelo: Elevados | Comum | 3 | Nenhuma | p. 263 |
| Cogumelo: Senescais | Especial | 4–6 | **Artes Marciais**; Fúria dos Aflitos | p. 263 |
| Cogumelo: Principado | Especial | 6 | Ameaça Covarde; **Artes Marciais**; Canção da Emoção; Supremacia | p. 263 |
| Novos Sagrados: seguidores | Comum | 1–6 | Nenhuma | p. 264 |
| Hermes | Especial | 6 | Balas Envenenadas; Coldre de Sabão; Dedo Quente; Livramento; Olho Morto; Roubo de Sina | p. 264 |
| Abreu | Especial | 5 | Canção da Emoção; Cuspe e Cola; Escudo Humano; Fuga Infeliz; Supremacia | p. 264 |
| Aranha | Especial | 5 | Ameaça Covarde; Boca na Botija; Chamego; Mestre Arsenal; Zói de Gavião | p. 264 |

**Nomes não resolvidos:** “Dedo Furioso” não possui verbete; pode ser confusão editorial entre Dedo Quente e Gatilho Furioso, mas isso não autoriza escolher um. “Artes Marciais” pode remeter a Punhos do Oriente, porém o mapeamento não é declarado. Manter `habilidadePendente` e permitir decisão do Juiz com fonte. Não oferecer essas entradas como uma 31ª/32ª habilidade de PJ.

**Pavio Curto (p. 258):** importante para o histórico do mundo; o grupo derrotou os Sagrados. Na narrativa padrão, Gaspar, Cristina e Zói de Gato morreram na batalha final. Sobreviventes seguem suas vidas. Não ressuscitar esses personagens automaticamente em uma campanha de 1880; uma versão alternativa da mesa deve ser identificada.

### 14.2 Lei e segurança

| Organização/papel | Tipo | NdC | Habilidades | Fonte |
|---|---|---|---|---|
| Polícia BH: cabo | Comum | 1–2 | Não especificadas | p. 265 |
| Polícia BH: sargento | Comum | 1–3 | Não especificadas | p. 265 |
| Polícia BH: tenente | Comum | 1–4 | Não especificadas | p. 265 |
| Polícia BH: capitão | Comum | 1–6 | Não especificadas | p. 265 |
| Polícia BH: coronel | Comum | 1–6 | Não especificadas | p. 265 |
| Boinas Brancas: guarda | Especial | 1–2 | Gatilho Furioso | p. 266 |
| Boinas Brancas: artilharia | Especial | 3–4 | Dedo Quente; Zói de Gavião | p. 266 |
| Defesa Nacional: representante | Comum | 1–2 | Não especificadas | p. 266 |
| Defesa Nacional: xerife | Comum | 1–3 | Não especificadas | p. 266 |
| Defesa Nacional: delegado | Comum | 1–4 | Não especificadas | p. 266 |

Xerifes específicos podem ser especiais, como **Tonho do Arame, NdC 4 especial** (p. 142). O Senhor Vasconcelos é indicado como **NdC 5 especial** (p. 141). Esses dados específicos prevalecem sobre um template genérico de ocupação. Não inventar suas habilidades ausentes apenas para completar a quota.

Boinas Brancas são força de segurança ligada às empresas ferroviárias, não uma classe de PJ. O texto de ambientação das organizações descreve política e corrupção, não uma regra que impeça criar NPC honesto.

## 15. Animais e Lendas Selvagens

### 15.1 Animais comuns — p. 267

Usar condições de **NPC comum**, com as exceções de Defesa/ataque da tabela. Capacidade de Dor continua 6. “Ataque surpresa” é descrição mecânica contextual, não automaticamente a habilidade de PJ Ataque Sacana.

| Animal | NdC | Defesa especial | Ataque/efeito |
|---|---:|---:|---|
| Ave de rapina | 2 | 6 | Bico/garras: **2 D** |
| Alce | 2 | — | Chifrada: **3 D** |
| Bisão/touro | 4 | — | Chifrada: **2 V** |
| Cachorro | 1 | — | +1 em Atenção pelo faro; mordida **3 D** |
| Coiote | 2 | — | +1 em Violência havendo mais de um; mordida **3 D** |
| Corvo | 1 | 6 | Bicada **1 D** |
| Jacaré | 4 | — | Ataque surpresa; mordida **3 V** |
| Lobo | 1 | — | +1 em Violência havendo mais de um; mordida **3 D** |
| Onça/pantera | 2 | — | Ataque surpresa; garras **1 V** |
| Raposa | 3 | — | +1 em Violência havendo mais de uma; mordida **3 D** |
| Serpente | 1 | — | Veneno: −1 M, mínimo 0; **1 V por rodada**; tratamento/resistência conforme veneno pertinente |
| Urso | 5 | 4 | Mordidas, garras e agarrão: **3 D** |

Não transformar o bônus de bando em +1 por animal adicional: a condição publicada é haver mais de um. Não trocar NdC ou tipo de dano por parecer biologicamente estranho.

### 15.2 Cinco Lendas Selvagens

Usar **NPC especial** conforme indicado nas fichas. São animais extraordinários do cenário, não raças de PJ ou montarias gratuitas.

| Lenda | Local e referência | NdC | Efeito publicado |
|---|---|---:|---|
| Ité | Coiote de Desemboque, pp. 206–207 | 5 especial | Mordida Fatal: **1 V** |
| Kaapuã | Mico-leão-dourado da Floresta do Cipó, pp. 238–239 | 4 especial | Camuflagem: **uma Ação de Combate para esconder-se e fugir** |
| Akor | Jacaré do Sertão de Fungos, p. 243 | 5 especial | Mordida Venenosa: **1 V + Veneno Mortal** |
| Yakecan | Égua da Serra da Saudade, p. 245 | 5 especial | Galope Extra: **15 m por Movimento** |
| Katuan | Touro associado à região desértica, pp. 248–249 | 6 especial | Resistência: **Defesa 8, +3 V** |

Katuan resulta em **39 V** pela base especial 36 + 3; sua Defesa 8 é exceção expressa. Não interpretar “+3 V” como dano de chifrada. Não substituir Mordida Fatal por morte instantânea: seu dano impresso é 1 V. Akor menciona “Veneno Mortal” sem definir NA/dano nessa ficha; precisa de decisão. Yakecan é descrita como indomável e nunca montada por humano; não adicioná-la à loja de cavalos de PJ como opção comum.

As fichas das lendas não listam toda a quantidade de habilidades da tabela geral de especiais. Não completar automaticamente com habilidades de vilão ou herdar todos os ataques do animal comum sem declarar adaptação.

## 16. Bando, Base e acomodações

**LIVRO — pp. 98–105.** Nome, aparência e localização são decididos em conjunto. Acampamento, casa ou outro formato não mudam os custos/benefícios por si sós.

### 16.1 Criar e evoluir

Criar Base por **150 réis**, nível 1: escolher **uma acomodação e um NPC** de um dos papéis. Criar com o Juiz nome, origem e motivação desse NPC.

A cada nível novo, escolher nova acomodação com NPC ou adicionar NPC a acomodação já existente. **Não repetir função**: não ter dois Médicos para multiplicar serviços. Existem quatro acomodações, com três funções cada: total **12 papéis**. Base vai até nível **12**. Pode avançar vários níveis se puder pagar.

| Nível da Base | Custo indicado | Notoriedade |
|---:|---:|---:|
| 1 | 150 | 1 |
| 2 | 200 | 1 |
| 3 | 270 | 2 |
| 4 | 360 | 2 |
| 5 | 480 | 3 |
| 6 | 620 | 3 |
| 7 | 780 | 4 |
| 8 | 960 | 4 |
| 9 | 1160 | 5 |
| 10 | 1380 | 5 |
| 11 | 1620 | 6 |
| 12 | 1880 | 6 |

O texto apresenta gastos para evoluir; **PRODUTO/interpretação:** cobrar o custo de cada nível adquirido, sem considerar o valor anterior como crédito. Como não há exemplo numérico de compra em sequência, manter essa interpretação registrada. Não confundir Notoriedade da Base com recompensa pela cabeça.

### 16.2 Catálogo de acomodações e serviços — p. 101

Naipes: **Descanso = paus; Arsenal = espadas; Enfermaria = copas; Laboratório = ouros**. Valor K/Q/J identifica o papel. Essa chave é usada na Fase de Bando.

A p. 100 diz que **Bônus+ acumula com o primeiro bônus** após missão resolvida. Preservar os dois campos. Alguns serviços parecem oferecer uma versão melhorada do mesmo recurso (ex.: Jagunço); não criar dois NPCs por inferência. A aplicação conjunta dos custos/quantidades nesses casos depende de interpretação explícita.

| Carta/papel | Bônus inicial | Bônus+ após missão |
|---|---|---|
| K paus — Cozinheiro | +1 AC na **primeira rodada** do próximo combate | +1 AC no próximo combate |
| Q paus — Ordenante | Recuperar +1 V na Fase de Bando | Recuperar +2 V na fase |
| J paus — Violeiro | +1 M na **primeira rodada** do próximo combate | +1 M no próximo combate |
| K espadas — Armeiro | Recuperar metade da munição, custo **5 réis** | Melhorar arma: +1 em Violência no próximo combate, custo **20 réis** |
| Q espadas — Informante | Oferecer missão com recompensa **150 réis** | Missão com recompensa **500 réis** |
| J espadas — Jagunço | NPC **comum NdC 2** ajuda nas pelejas | NPC **comum NdC 4** |
| K copas — Cirurgião | Remover veneno **50 réis**; cabelo/barba **5 réis** | Recuperar dano permanente, **100 réis** |
| Q copas — Médico | Recuperar +2 V na fase, custo **1 unguento** | Recuperar +4 V na fase, custo **2 unguentos** |
| J copas — Veterinário | Recuperar toda Vida e Dor da montaria, custo **1 pomada de cavalo** | +1 nos Testes de Montaria por **uma semana** após visita |
| K ouros — Farmacêutico | **1 unguento**, custo **3 réis** | **3 unguentos**, 3 réis cada; **1 seringa de adrenalina**, 10 réis |
| Q ouros — Especialista em Veneno | **2 frascos** entre sonífero e intestinal | **5 frascos** entre sonífero, desarranjo intestinal, incapacitante e mortal |
| J ouros — Especialista em Bombas | **1 dinamite**, custo **10 réis** | **5 dinamites + 10 m de pavio + detonador**, custo **40 réis** |

Lacunas: “metade da munição” não especifica a base de cálculo; “dano permanente” não distingue todos os tipos; venenos do Laboratório não correspondem integralmente aos nomes da p. 92; efeitos cumulativos/custos das versões devem ser confirmados. Não equiparar mortal a cobra, ou incapacitante a cicuta, sem decisão.

### 16.3 Fase de Bando — p. 102

Cada fase ocupa **aproximadamente três dias** ficcionais. Máximo de **três fases consecutivas**. Cada jogador escolhe **um único serviço por fase**, salvo Ordenante, que beneficia o bando todo. Não tratar todos os serviços como gratuitos/passivos.

Em cada fase, sacar **uma carta por ponto de Notoriedade**:

| Carta | Consequência |
|---|---|
| A, 2, 3, 4, 5, 6 | Fase tranquila para essa carta |
| 7, 8, 9, 10 | Evento específico por valor e naipe, §16.4 |
| K, Q, J correspondente a NPC presente | NPC apresenta missão |
| K, Q, J de papel ausente | A carta vira **Sina comunitária**; sacar outra carta para resolver o acontecimento |

A missão usa a tabela de três cartas do §16.5. **Uma semana** para resolver uma missão de NPC; se saírem duas, **duas semanas**; e assim sucessivamente. Se resolvida, desbloquear Bônus+. Se prazo não cumprido, NPC abandona o Bando e a Base **perde 1 nível**.

**Três Sinas comunitárias sacadas em sequência:** Base perde **1 nível**, representando um NPC que sai por descontentamento. Não escolher qual NPC nem recalcular toda a estrutura sem registrar a consequência. A regra não esclarece se essa sequência reinicia entre fases/sessões, nem o destino das cartas já ganhas.

Sina comunitária pode ser usada por qualquer membro do Bando. Não tratá-la automaticamente como posse pessoal de cada PJ ou duplicá-la nas fichas. O uso precisa ser atômico para dois jogadores não gastarem a mesma carta.

**LACUNAS da Base:** nível mínimo após perdas, definição de intervalo para reiniciar a contagem das três fases, manutenção de acomodações vazias, nova missão de NPC já melhorado e reposição de papel perdido. Deixar decisões registradas; não remover NPC aleatório do banco de dados sem evento.

### 16.4 Os 16 eventos da Base — p. 103

| Carta | Evento/efeito |
|---|---|
| 7 copas | NPC contrai doença misteriosa; resolver ou pode morrer, com perda de 1 nível da Base |
| 7 espadas | Pessoa pede ajuda; gerar missão. Ao completar, recompensa **2d6 × 10 réis** |
| 7 ouros | Histórias de terror: Coragem; quem falhar perde **1 AC**, mínimo 0, na primeira rodada do próximo combate |
| 7 paus | Doação: cozinha e enfermaria não cobram na fase. Se essas acomodações não existirem, Bando recebe **1d6 × 10 réis** |
| 8 copas | Sortear dois NPCs: romance; ambos dão Bônus+ só nessa fase. Se só houver um NPC, nada acontece |
| 8 espadas | **2d6 animais selvagens NdC 2** invadem; enfrentar ou afugentar |
| 8 ouros | Noite de música: Intelecto; sucesso dá **+1 M** no próximo combate. Se houver Violeiro, ele fornece Bônus+ na fase |
| 8 paus | Comida estraga: Cozinheiro sem efeito na fase. Se não houver, todos perdem **1 AC**, mínimo 0, na primeira rodada do próximo combate |
| 9 copas | **2d6 bandidos** invadem; enfrentar. NdC não fixado nessa entrada |
| 9 espadas | Cavalo selvagem aparece; teste de Montaria para domar |
| 9 ouros | Tempestade: **nenhum bônus** pode ser dado nessa fase |
| 9 paus | Festa: Físico; falha exige rolar na tabela de Bebedeira; sucesso bebe com prudência |
| 10 copas | Reflexão: Bando escolhe um PJ para receber **uma Sina** |
| 10 espadas | Incêndio acidental: Ordenante sem efeito na fase; se não houver, Bando perde **1d6 × 10 réis** |
| 10 ouros | Dois NPCs brigam; jogadores podem intervir, mas escolher perdedor, inativo na fase. Com só um NPC, nada acontece |
| 10 paus | Perda de munição: Armeiro sem efeito na fase; se não houver, Bando perde **1d6 × 10 réis** |

Os NA não individualizados usam padrão 6, sujeito ao Juiz. O evento 8 espadas especifica NdC 2 mesmo para espécie cujo template comum tem outro NdC: manter a exceção do evento. Efeitos contraditórios de várias cartas, como tempestade e bônus musical, precisam de ordem/arbitragem transparente. Não refazer sorteio para “melhorar” o resultado sem decisão explícita.

### 16.5 Gerador de missões de NPC — p. 104

Sacar **três cartas**, ignorar naipes: primeira = pedido; segunda = vínculo; terceira = reviravolta. Juiz costura a combinação em uma missão coerente.

| Carta | Pedido | Pessoa/vínculo | Reviravolta |
|---|---|---|---|
| A | Encontrar | Mãe | Tornou-se xerife corrupto |
| 2 | Proteger | Irmã | Foi sequestrada por bandidos |
| 3 | Provar | Amigo de infância | Deve dinheiro a gangue |
| 4 | Resgatar | Filha | Foi presa injustamente |
| 5 | Ajudar | Pai | Adoeceu nas minas de Araguari |
| 6 | Recuperar | Mentor | Lidera gangue perigosa |
| 7 | Descobrir | Interesse romântico | Perdeu-se nos ermos |
| 8 | Investigar | Criança órfã | Tornou-se cultista fanático |
| 9 | Revelar | Filho | Abriu bar e precisa de suprimentos |
| 10 | Curar | Irmão | Quer vingança contra antigo inimigo |
| J | Defender | Cunhado | Sabe a localização de tesouro |
| Q | Capturar | Avô | Tornou-se ladrão de tumbas |
| K | Rastrear | Parceiro de bando | É magnata ferroviário rico e corrupto |

Nome/gênero/ligação gramatical podem ser adaptados na redação sem alterar a mecânica do sorteio. Não exigir coerência literal de “provar uma pessoa”; a tabela fornece sementes, não frases prontas.

## 17. Duelo

**LIVRO — pp. 106–111.** Subsistema para confrontos dramáticos de vida, honra e redenção. Não é um teste de Violência nem um combate comum. Pode envolver PJs e NPCs; o texto também admite mais de dois duelistas, mas não detalha completamente a resolução multilateral.

A p. 108 chama o modelo de “Five-Card-Draw/Pôquer Fechado”, porém descreve **duas cartas na mão e cinco comunitárias abertas**. **Implementar o procedimento do próprio livro**, não importar automaticamente regras de Five-Card Draw ou Texas Hold’em.

### 17.1 Procedimento publicado

1. Pessoa externa ao duelo atua como **Crupiê**, embaralhando.
2. Distribuir **duas cartas privadas** por duelista; NPC entrega a mão ao Juiz.
3. Colocar **cinco cartas abertas na mesa**.
4. Iniciar apostas. Antes de revelar, duelista pode manter cartas da mão ou descartá-las e usar só as da mesa; pode trocar cartas da mão por suas Sinas.
5. Duelistas podem desistir e sofrer as consequências correspondentes.
6. Sem desistência, revelar mãos; cada duelista pode substituir **até duas cartas da mesa pelas da própria mão** para formar sua melhor sequência.
7. A melhor sequência vence e representa o disparo mais rápido.

**PRODUTO/interpretação necessária:** calcular a combinação de cada duelista sobre uma **cópia lógica da mesa comum**, sem alterar as cartas comunitárias que os outros avaliam. Isso resolve a implementação concorrente, mas o texto não esclarece se a troca seria física ou apenas composição da mão. Expor essa interpretação no perfil da campanha.

### 17.2 Ranking — p. 109

Do mais forte para o mais fraco:

| Ordem | Combinação | Critério |
|---:|---|---|
| 1 | Royal flush | 10/J/Q/K/A do mesmo naipe |
| 2 | Straight flush | Cinco valores em sequência, mesmo naipe |
| 3 | Four-of-a-kind | Quatro do mesmo valor |
| 4 | Full house | Trinca e par |
| 5 | Flush | Cinco do mesmo naipe |
| 6 | Straight | Cinco valores em sequência, sem straight flush |
| 7 | Three-of-a-kind | Trinca e dois valores diferentes |
| 8 | Two-pair | Dois pares de valores distintos |
| 9 | One-pair | Um par |
| 10 | High-card | Sem combinação superior; maior carta |

Ordem de valores: **2 < 3 < … < 10 < J < Q < K < A**. O texto não autoriza expressamente Ás baixo em A/2/3/4/5, desempate por kicker, empate absoluto ou prioridade de naipe. Se usar biblioteca de pôquer, configurar decisões explícitas para esses pontos e desligar regras externas não autorizadas. A definição ilustrativa de high-card menciona naipes diferentes; não impor cinco naipes diferentes, o que seria impossível num baralho comum.

### 17.3 Apostas — p. 110

- Apostar **1 ou mais V**, ou todos os V (**all-in**).
- Adversário precisa cobrir ou aumentar; se não cobrir, está desistindo.
- Se alguém fizer all-in, outro precisa fazer all-in ou desistir, **mesmo que as Vidas sejam diferentes**.
- **Entre dois PJs**, podem apostar pontos de Atributos, um para um; adversário cobre ou aumenta.
- Quando as apostas estão cobertas, prosseguir para resolução.

**PRODUTO:** reservar apostas, aplicar perdas/transferências só no desfecho, e impedir gastar pontos inexistentes. O texto não distingue com precisão Vida total e atual para todo caso, nem explica mistura de apostas de Vida e Atributos. Confirmar política. Não permitir aposta de Atributos contra NPC como regra padrão: autorização textual é entre dois PJs.

### 17.4 Desistência

Se um desiste e o outro não, o desistente leva um tiro, fica com **1 V e inconsciente**. Tem **−1 em Violência contra aquele duelista** até recuperar a honra de algum modo. O vencedor pode poupá-lo; nesse caso sai andando, mas mantém a penalidade de honra.

Não transformar −1 contra um adversário em penalidade global, nem removê-la automaticamente após dormir. Não confundir com os efeitos de Presença que duram o próximo combate.

### 17.5 Desfecho

Vencedor ordinário não sofre dano. Perdedor risca os V apostados. Se aposta de Atributos, vencedor recebe os pontos do perdedor e os distribui na ficha; perdedor os reduz. Recalcular efeitos derivados, preservando concessão de duelo e eventuais decisões sobre perdas.

Se Vida zerar, aplicar Teste de Morte ou Sina, considerando Presenças e efeitos especiais. Sobrevivente deve aceitar derrota e aguardar outra ocasião: não oferecer revanche automática imediatamente após cada resultado. Dano ordinário da arma não substitui a aposta nem é somado a ela sem autorização.

### 17.6 Presenças — p. 111

O texto as apresenta para **duelos entre PJs**. Não estender automaticamente a PJ versus NPC.

Gatilho: três cartas de um mesmo naipe na sequência formada com cartas de mesa/mão. Se **ambos tiverem três do mesmo naipe**, anular as presenças correspondentes; se de naipes diferentes, ambas podem ser ativadas. O texto não fecha a contagem em cinco cartas finais versus sete disponíveis, nem todas as combinações com vários naipes elegíveis. Tornar esse ponto uma decisão expressa.

| Naipe/Presença | Se portador vencer | Se portador perder |
|---|---|---|
| Espadas — Açougueiro/Morte | O perdedor faz Teste de Morte e **só 6** o mantém vivo | Seu tiro também acerta o oponente: ele fica com **1 V** e **−1 em Violência no próximo combate** |
| Copas — Enfermeira/Proteção | **+1 Defesa no próximo combate**, podendo chegar a 8 com cobertura | O tiro não é mortal, independentemente da aposta; se apostou Atributos, entrega **1 ponto a menos, mínimo 1** |
| Ouros — Fiandeira/Passado | Trocar valores de **dois Antecedentes do adversário**, excluindo Violência | Trocar valores de **dois próprios Antecedentes**; a exclusão de Violência não está escrita nesta linha |
| Paus — Faroleiro/Jornada | Eliminar um passo da própria Trilha | Acrescentar um passo à própria Trilha |

Não interpretar Fiandeira como roubo de pontos: é troca de valores entre dois campos. Não presumir que Faroleiro concluirá automaticamente o último passo e concederá todos os prêmios; escolha de passo, interação com encerramento e prêmio de Sina por passo removido não são definidos.

### 17.7 Lacunas específicas de duelo

- Empates e critérios detalhados de desempate.
- Ás baixo e quantas rodadas de apostas/reaberturas existem.
- Troca de Sina, número de usos e destino de cartas trocadas.
- Roubo de Sina: visibilidade/limite da escolha da carta.
- Mais de dois duelistas: quem recebe tiros, como cobrir apostas e como se distribuem consequências.
- Ordenação de Presenças conflitantes, por exemplo Açougueiro versus Enfermeira.
- Presenças com mais de um trio de naipes e contagem de cartas.
- Morte imediata de Roubo de Sina versus salvamentos de Sina.

**PRODUTO:** a interface pode automatizar o que está determinado e deixar resolução assistida ao Juiz para casos pendentes. Não esconder essa dependência atrás de um botão que produza resultados arbitrários.

## 18. Crimes, recompensas e economia da campanha

**LIVRO — p. 48.** PJ começa sem recompensa, exceto quando relacionada à redenção. Crimes cometidos publicamente podem aumentar a recompensa e trazer agentes/caçadores. O Juiz pode usar a tabela para NPCs também.

| Crime | Valor em réis |
|---|---:|
| Agressão | 50 |
| Agressão contra agente da lei | 100 |
| Agressão a cavalo | 20 |
| Arrombamento de cofre | 100 |
| Assalto | 100 |
| Assassinato | 400 |
| Assassinato de agente da lei | 500 |
| Assassinato de cavalo | 200 |
| Destruição de propriedade | 50 |
| Furto | 100 |
| Insulto a agente da lei | 10 |
| Incêndio | 200 |
| Roubo de cavalo | 250 |
| Roubo de diligência | 200 |
| Roubo de propriedade | 150 |
| Roubo de trem | 400 |
| Sequestro | 200 |
| Sequestro de agente da lei | 300 |
| Vandalismo | 10 |

O livro fornece referências de valores, mas não define um algoritmo universal para detecção, autoria, múltiplas vítimas, soma de categorias sobrepostas ou baixa da recompensa. **PRODUTO:** registrar ocorrência, publicidade/testemunhas, autoridade e valor aprovado pelo Juiz. Não somar automaticamente “assassinato” e “assassinato de agente” pelo mesmo fato.

Pagamento de recompensa, dívida de redenção, saldo de PJ e tesouro do Bando são contas diferentes. A lista de preços e Sorrisão está no Documento 1. Durante a campanha, preços podem ser negociados dentro da ficção; primeira compra tem regra própria. Item raro/especial não recebe desconto de Sorrisão.

Não existe regra de rentabilidade mensal para fazendas, impostos universais, inflação, salário ou tesouro por encontro. Se a campanha precisar disso, criar parâmetros de mesa identificados.

## 19. Integração com fichas, redenção e evolução

Reutilizar os dados do Documento 1:

- Dar oportunidades de redenção sem marcar passo automaticamente por semelhança de texto.
- Registrar incidentes contáveis dos modelos: três problemas ao Bando, três rivais, duas novas habilidades etc.
- Conclusão final só depois dos demais passos válidos, respeitando alterações de Faroleiro.
- Concessão de Sina por passo, +1 habilidade/+2 V/+1 carta de iniciativa por redenção concluída, sem duplicações.
- Aplicar evolução por eventos; tabelas não autorizam distribuir pontos livremente a cada sessão.
- Fidelidade da montaria depende de decisão do Juiz no fim da sessão, não de quantidade de cliques de cuidado.
- Doença, veneno, honra, bônus de Base e ferimentos devem aparecer como condições com duração/gatilho, não como alteração permanente do valor base.

## 20. Arquitetura de regras e dados sugerida

**PRODUTO:** não é imposição de tecnologia. Adaptar à plataforma existente; separar dados das regras, cálculo determinístico e narrativa.

### 20.1 Entidades mínimas

```text
RulesetVersion, RuleReference, CampaignDecision
Campaign, Membership, Session, FictionalClock
PlayerCharacter, CharacterGrant, Mount, InventoryItem
RedemptionTrail, RedemptionStep, RedemptionProgressEvent
Location, Faction, Relationship, NPC, NPCTemplate
Scene, Clue, Rumor, Secret, Mission, Threat
Encounter, Combat, Combatant, Turn, Action, Effect
Test, Roll, CriticalResolution, DamageEvent, DeathResolution
Card, DeckContext, CardDraw, SinaEntitlement, SinaUse
Duel, DuelParticipant, Bet, HandEvaluation, PresenceResolution
Band, Base, Accommodation, BaseNPC, BandPhase, BaseService, BaseEvent
LedgerEntry, CrimeEvent, Bounty
```

Não é necessário criar uma tabela SQL para cada nome; são responsabilidades lógicas. Relógios e ameaças são ferramentas de organização, sem uma regra oficial de “relógio de seis segmentos” no livro.

### 20.2 Fontes e decisões

```typescript
interface DecisaoCampanha {
  id: string;
  tema: string;
  tipo: 'arbitragem_contextual' | 'interpretacao_de_lacuna' | 'regra_de_mesa';
  paginas: number[];
  textoDaDivergencia: string;
  interpretacaoEscolhida: string;
  autorJuizId: string;
  concordanciaDoGrupo?: string; // necessária quando o livro exige, como lista de XP
  inicioVigencia: string;
  versao: number;
}
interface Efeito {
  id: string; alvoId: string; origemId: string;
  recurso: string; operacao: 'somar' | 'fixar' | 'substituir'; valor: number;
  inicio: string;
  fim: 'fim_turno' | 'proximo_turno' | 'fim_combate' | 'proximo_combate' |
       'fim_sessao' | 'proximo_dia' | 'uma_semana' | 'ate_cura' | 'permanente' | 'juiz';
  restricaoDeUso?: string;
  regraReferencia: string;
}
```

Efeitos como +1 AC na primeira rodada do próximo combate precisam de consumo/expiração explícitos, não apenas um booleano genérico `buffAtivo`.

### 20.3 Motor determinístico e papel da IA

- Dados e cartas são sorteados por serviço próprio; guardar resultados brutos. A IA não escolhe um resultado para favorecer a história.
- Validar custos antes de executar ação; lançar dano, munição e recursos de forma atômica.
- Registrar recursos gastos e resultados para explicar cada cálculo ao Juiz.
- Uma descrição narrativa pode sugerir um teste, mas só o Juiz confirma a necessidade e a abordagem.
- Interpretação de texto livre não deve aplicar dano, morte, XP ou transferência monetária sem evento confirmado.
- Permitir correções pelo Juiz, preservando registro do evento corrigido; não reescrever histórico silenciosamente.

### 20.4 Baralho digital

O livro trabalha com baralho comum, quatro naipes e valores de 2 a A; não oferece uso de curingas. **PRODUTO:** modelo padrão de 52 cartas sem curingas, com identificação de valor/naipe e contextos separados de iniciativa, sorte, duelo e base.

Como a p. 95 admite devolver a carta de Sina ao baralho mantendo o direito, separar **carta física disponível no contexto** de **direito à Sina com identidade preservada**. Não duplicar fisicamente a mesma carta dentro de uma mesma distribuição por erro de banco de dados. A regra não especifica embaralhamento/descarte entre todos os subsistemas; registrar política de reutilização em vez de prometer um único baralho global sempre consistente sem decisões adicionais.

### 20.5 Permissões e visibilidade

- Jogador acessa sua ficha e os dados públicos/autorizados da campanha.
- Juiz controla bastidores, NPCs ocultos, fatos verdadeiros e resultados não revelados.
- Mão de duelo fica privada até revelação; o servidor não deve entregar mãos adversárias ao cliente antes disso.
- Rumor, pista e fato confirmado têm estados distintos. Uma crença falsa pode ser pública, enquanto sua refutação permanece secreta.
- Acesso por link à criação de personagem deve vincular campanha e proprietário. Não permitir editar fichas de outros por trocar um ID na URL.
- Isto é desenho de produto; o livro não exige uma tecnologia de autenticação específica.

## 21. Registro consolidado de decisões pendentes

O Juiz não precisa responder a tudo antes de criar uma campanha. Resolver **somente os casos usados**, manter padrões técnicos explicitados e não interromper partes independentes do sistema.

| ID | Tema | Fonte | O que não presumir |
|---|---|---|---|
| G01 | Ausência de Antecedente | 69–72, 81 | Proibição universal ou sucesso automático |
| G02 | Empate de teste Contra | 72 | Critério de desempate inventado |
| G03 | Forçar teste Contra | 71–72 | Como aplicar NA−1 quando não há NA |
| G04 | Melhor(2d6), crítico e várias fontes | 35–40, 84 | 3d6/4d6 ou crítico automático |
| G05 | Mirar | 81 | Se 2 AC incluem o disparo |
| G06 | Laço e imobilização | 37, 82 | Custo, NA de escape, duração e frequência |
| G07 | Dano desarmado-base | 36, 81 | Um valor fixo não apresentado |
| G08 | Recarga sem suporte | 53, 56, 82 | Substituir ou adicionar custo da arma sem escolha |
| G09 | Explosivos: custo e 1 natural | 54, 58, 82 | Somar custos ou fixar efeito em terceiros sem escolha |
| G10 | Metralhadora | 58–59 | Dano 3×(AC+M) como inequívoco |
| G11 | Mortal/Tudo ou Nada | 81, 84 | Escopo do dano adicional e múltiplos alvos |
| G12 | Dor excedente e efeitos repetidos | 86–87 | Descarte da sobra ou empilhamento ilimitado |
| G13 | Morte, Sina, Livramento, enforcamento | 36, 87, 90, 95 | Ressurreição universal e ilimitada |
| G14 | Sina: limite, identidade, sessão, Juiz | 95 | Limites/transferência não descritos |
| G15 | XP de Sina | 49, 95 | Contar o mesmo prêmio duas vezes |
| G16 | Efeitos temporários/empilhamento | 38–40, 78, 93, 101 | Duração única para todos os bônus |
| G17 | Doses e uso de cura | 39, 64–65, 88 | Cura repetível infinita ou morte com critério inventado |
| G18 | Atributos negativos/perdas | 87, 110 | Apagar escolhas antigas automaticamente |
| G19 | NdC versus nível/Físico em habilidades | 96–97, 255 | Equivalência universal não escrita |
| G20 | Fichas publicadas versus quantidade de habilidades | 97, 259–264 | “Corrigir” templates ao importar |
| G21 | Dedo Furioso/Artes Marciais | 262–263 | Alias automático sem decisão |
| G22 | Escudo Humano | 256 | Igualdade e chance de morte não quantificadas |
| G23 | Veneno Mortal/incapacitante/intestinais | 101, 243 | Mapeamento automático com tabela da p. 92 |
| G24 | Missões repetidas e perdas de nível da Base | 100–102 | Piso e remoção de estruturas não definidos |
| G25 | Bônus+ e serviço inicial | 100–101 | Substituir tudo ou duplicar NPC/serviço sem contexto |
| G26 | Três fases consecutivas e sequência de Sinas | 102 | Reinício da contagem não especificado |
| G27 | Descanso de três dias com serviços | 88, 101–102 | Cura multiplicada automaticamente |
| G28 | Eventos simultâneos da Base | 103 | Ordem de prioridade inventada |
| G29 | Pôquer, Ás, empate e troca de mesa | 108–109 | Regras completas de uma biblioteca externa |
| G30 | Apostas mistas e multilateralidade | 108–110 | Side pots ou distribuição de tiros importados |
| G31 | Presenças e conflitos | 111 | Contagem/ordenação sem decisão |
| G32 | Faroleiro e redenção | 42–46, 111 | Sina e prêmio automático por passo removido |
| G33 | Cronologia/geografia/propriedade de locais | 131–266 | Usar mundo real para corrigir cânone |
| G34 | Política de baralho | 78, 95, 102, 108 | Frequência obrigatória de embaralhamento inexistente |
| G35 | Bônus de iniciativa em NPC | 78–79, 96 | Dividir artificialmente sua reserva em AC e M |
| G36 | Montarias e inventário | 50–65 | Ver C01–C18 do Documento 1 |
| G37 | Recompensas criminais | 48 | Detecção automática e dupla cobrança por categorias |
| G38 | Peste, clima e jornadas | 73, 90–93, 204 | Cronogramas e dano por hora não descritos |

O registro documenta **incerteza do texto**, não erro de OCR. Ícones de Vida/Dor, naipes dos serviços/eventos e Presenças foram conferidos visualmente. Nenhuma errata externa foi aplicada.

## 22. Casos de aceitação para o desenvolvedor

Cenários propostos para validar a futura implementação; não são testes executados em um sistema existente.

| ID | Caso | Resultado esperado |
|---|---|---|
| GM-01 | Teste comum: d6=4, Antecedente=2, NA=6 | Sucesso |
| GM-02 | Teste de resistência de PJ com d6=1 e bônus suficientes | Não aplicar falha natural universal por regra de ataque |
| GM-03 | Ataque com d6=1 e NdC 6 | Falha |
| GM-04 | Forçar teste fora do combate, NA original 6 | Novo NA 5, somente uma vez, consequência negativa mesmo em sucesso |
| GM-05 | Tentar forçar em combate | Impedir; Sina continua mecanismo distinto |
| GM-06 | Empate de carta PJ/NPC | NPC primeiro |
| GM-07 | PJ saca K e mantém posição | Não recebe AC adicional |
| GM-08 | PJ descarta K na janela permitida | Vai para o fim e ganha +1 AC pelo combate; não pode reutilizar carta |
| GM-09 | Cobertura completa | Defesa base 5 vira 7 e atirar sofre −1 |
| GM-10 | Boca na Botija e surpresa | Não reduzir Defesa para 3 |
| GM-11 | Revólver com 1 bala disponível e ação de dois tiros | Não criar projétil inexistente |
| GM-12 | Bomba com 1 natural | Procedimento especial de bomba, não tabela genérica de falha crítica |
| GM-13 | Um 6 seguido de 4 na confirmação | Não é crítico confirmado |
| GM-14 | Dor riscada 5 + dano 1 D | Riscar 1 V, zerar D, sortear consequência |
| GM-15 | Sangramento da tabela de Dor | 1 D por turno, não 1 V |
| GM-16 | Vida zerada e Teste de Morte tira 1 | Sobrevive conforme custo e recuperação 3 V |
| GM-17 | Já fez Teste de Morte nesse combate e zera de novo | Sem segundo teste ordinário; encaminhar exceções registradas |
| GM-18 | Enforcamento zera Vida | Não oferecer Teste de Morte ordinário |
| GM-19 | Descanso médico de 24 h | Todos D e 3 V, não 5 V por somar dois regimes |
| GM-20 | NPC comum NdC 3 | Vida 9, Dor 6, Defesa 5, 4 ações, teste 1d6+3 |
| GM-21 | NPC especial NdC 3 | Vida 18, Dor 6, Defesa 5, 6 ações, 2 habilidades pelo modelo |
| GM-22 | Importar Hermes | NdC 6 especial, 6 habilidades pela exceção explícita |
| GM-23 | Katuan | Vida 39 e Defesa 8, não dano adicional de 3 |
| GM-24 | Dois coiotes | +1 Violência pela condição de bando, não +1 por cada integrante |
| GM-25 | Segunda função Médico na mesma Base | Impedir no perfil Livro |
| GM-26 | Base nível 5 entra em fase | Sacar 3 cartas por Notoriedade |
| GM-27 | Q paus com Ordenante presente | Gerar missão desse NPC |
| GM-28 | Q paus sem Ordenante | Sina comunitária e carta substituta |
| GM-29 | Missão de NPC expira | NPC sai e Base perde 1 nível; registrar evento |
| GM-30 | 9 ouros na fase | Tempestade bloqueia bônus da fase, sem excluir NPCs |
| GM-31 | Quarta fase seguida | Sinalizar limite de três e requerer situação de interrupção/decisão |
| GM-32 | Duelo com Vida 5 versus Vida 10, ambos all-in | Ambos podem cobrir com suas próprias Vidas; não exigir valor idêntico |
| GM-33 | Aposta de Atributo PJ versus NPC | Não autorizar como regra padrão |
| GM-34 | Desistência e adversário poupa | Manter penalidade contra aquele duelista; não aplicar tiro |
| GM-35 | Açougueiro exige Teste de Morte | Só 6 salva, não 1 |
| GM-36 | Presença Fiandeira | Trocar valores de dois campos; preservar soma dos Antecedentes |
| GM-37 | Dois jogadores tentam gastar mesma Sina comunitária | Exatamente uma operação tem sucesso |
| GM-38 | Reenviar fechamento de sessão | Não duplicar XP/Sina/Fidelidade/concessões |
| GM-39 | Gerar narrativa que revela segredo | Só Juiz recebe; resumo público preserva visibilidade |
| GM-40 | NPC gerado com profissão médico | Não herdar automaticamente pontos de Medicina de PJ |
| GM-41 | Nova cidade original | Permitida, marcada como criação da campanha, sem alegar página do livro |
| GM-42 | Player descreve solução plausível sem risco | Juiz pode resolver sem exigir rolagem |

## 23. Cobertura e consulta de fontes

| Área do livro | Como foi tratada nestes documentos |
|---|---|
| Introdução, pp. 12–21 | Proposta do mundo, papéis, terminologia, testes e limites do grupo |
| Personagens, pp. 23–47 | Documento 1: criação, condições, atributos, 8 antecedentes, 30 habilidades, 6 trilhas e trilha própria |
| Recompensas/evolução, pp. 48–49 | Tabela de 19 crimes, XP e progressão 1–6 |
| Montarias, pp. 50–51 | Documento 1: Potência, Resistência, Fidelidade e deslocamento |
| Equipamento, pp. 52–65 | Documento 1: catálogos tabulares, porte, recarga, área, proteção, remédios e anúncios separados |
| Testes, pp. 68–74 | Documento 2: fórmulas, Forçar, Contra, Resistência e Sorte |
| Combate, pp. 76–89 | Iniciativa, recursos, ataques, críticos, dor, morte e cura |
| Outras regras, pp. 90–93 | Enforcamento, armadilhas, afogamento, fogo, venenos, queda e bebedeira |
| Sina/NPC, pp. 94–97 | Recursos, limites ambíguos e fórmulas de NPC |
| Bando, pp. 98–105 | Custos 1–12, serviços, 16 eventos, missões e prazos |
| Duelo, pp. 106–111 | Procedimento próprio, ranking, apostas, desistência e 4 Presenças |
| Juiz, pp. 113–127 | Preparação aberta, arbitragem, NPCs aleatórios e jogo seguro |
| Oeste Selvagem, pp. 129–253 | Premissas, cronologia, guia regional condensado, peste, Lendas e limites do cânone; sem reproduzir toda a prosa de ambientação |
| Canalhas, pp. 254–267 | 9 habilidades de vilão, templates de facções/lei e 12 tipos de animais |
| Ficha, pp. 270–271 | Conferência de campos, fórmulas iniciais e montaria |

As referências de página permitem conferir qualquer escolha no PDF. Se for necessário importar integralmente outro NPC, estabelecimento ou história local, consultar o trecho original antes de criar dados canônicos: o guia de cenário é deliberadamente condensado. Não usar o índice remissivo como autoridade superior ao verbete; há referências imprecisas no índice.

## 24. Critério de conclusão da área

O gerenciador estará pronto quando permitir criar histórias originais sem recompensas mecânicas acidentais; aplicar regras determinísticas com origem rastreável; administrar combate, Sina, duelos, Base e progressão; preservar segredos; e pedir arbitragem somente onde a ficção ou uma lacuna do PDF realmente a exigirem.

Manter uma versão compartilhada de regras entre as duas áreas. Ficha criada e ficha em sessão devem ser o mesmo personagem, com histórico de mudanças, sem recalcular sua vida ou inventário por uma fórmula incompatível ao trocar de página.
