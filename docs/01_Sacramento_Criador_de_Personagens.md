# Sacramento RPG — Especificação do criador de personagens

> Documento 1 de 2 para implementação com Claude Code. Versão 1.0, 19/09/2026.
> Fonte exclusiva de regras: **Sacramento RPG, 1ª edição, dezembro de 2024**, PDF fornecido `pdfcoffee.com_sacramento-rpg-livro-basico-pdf-free.pdf`, 274 páginas físicas.
> Identificador da fonte (SHA-256): `18c35bd339eea79856a644eb6f604cef7c9804a717efed068beea3e290b0ff00`.
> Todas as referências `p.`/`pp.` indicam a **página impressa**. Neste arquivo, página física do PDF = página impressa + 2. Exemplo: p. 35 do livro = página 37 do PDF.
> Documento complementar: `02_Sacramento_Gerenciador_de_Partidas.md`. Leia ambos antes de implementar os serviços compartilhados.

## 1. Contrato para o Claude Code

Construir a área em que um jogador cria, revisa e envia um personagem para uma campanha de Sacramento. Implementar as regras deste documento como dados e validadores reutilizáveis pelo gerenciador. Não importar regras de D&D, Tormenta, O Som das Seis, pôquer convencional ou outras edições.

O objetivo é preservar **a mecânica do livro e a liberdade narrativa prevista por ele**. Não transformar exemplos de profissão, aparência, história, origem ou redenção em listas fechadas.

### 1.1 Classificação normativa

| Rótulo | Significado | Comportamento do sistema |
|---|---|---|
| LIVRO | Regra expressamente apresentada no PDF | Aplicar no perfil padrão |
| LIVRE | Criação narrativa permitida | Campo aberto; sem bônus implícitos |
| JUIZ | Escolha/arbitragem atribuída ao mestre | Registrar decisão e contexto |
| LACUNA | Informação ausente, contraditória ou insuficiente | Exibir a dúvida; não inventar regra |
| PRODUTO | Proposta técnica deste documento | Pode adaptar a arquitetura sem mudar a mecânica |
| REGRA DE MESA | Alteração deliberada da mecânica | Separar do livro, identificar autor e campanha |

As pp. 68 e 117–118 reconhecem a arbitragem e a adaptação pelo grupo. Isso não autoriza o software a alterar números silenciosamente. Deve existir um perfil **Livro** e, opcionalmente, um perfil **Livro + decisões da mesa**. Uma ficha fora da regra padrão não deve aparecer como validada pelo livro.

### 1.2 O que não criar

- Classes, raças jogáveis com bônus, alinhamentos, magias, mana, perícias extras, distribuição por rolagem de atributos, vantagem por origem ou equipamento gratuito: nada disso compõe o criador padrão deste PDF.
- Limite de 2 nos Atributos: o limite de 2 do nível 1 é dos **Antecedentes**.
- Obrigação de escolher uma habilidade de cada categoria: escolhem-se duas das 30, em qualquer combinação.
- Cura completa automática ao subir de nível, XP por abate ou aumento automático de Defesa por nível: não estão previstos.
- Pontos, dinheiro, itens e habilidades concedidos só porque aparecem na biografia.
- Proibir um conceito porque ele não está nos exemplos da p. 23.

## 2. Fluxo proposto e dados da ficha

**PRODUTO:** etapas sugeridas: campanha → identidade/conceito → atributos → antecedentes → habilidades → redenção → montaria → compras/inventário → revisão/envio. Permitir voltar e redistribuir escolhas enquanto a ficha for rascunho; recalcular todas as dependências.

| Grupo | Campos |
|---|---|
| Identificação | ID, campanha, jogador responsável, nome, conceito, retrato opcional, descrição, origem, biografia, vínculos |
| Progressão | nível, XP, histórico de ganhos, aumentos de atributos/antecedentes, habilidades adquiridas, redenções concluídas |
| Atributos | Físico, Velocidade, Intelecto, Coragem |
| Antecedentes | Atenção, Medicina, Montaria, Negócios, Roubo, Suor, Tradição, Violência |
| Condições | vida máxima, vida riscada, dor riscada, Defesa base, movimentos base, ações de combate base |
| Habilidades | catálogo, multiplicidade de Parrudeza, origem de cada aquisição, condições de funcionamento |
| Redenção | modelo ou própria, premissa, passos, ordem especial, progresso, NPCs e vínculos |
| Economia | saldo, compras, preços aplicados, origem dos recursos, recompensa pela cabeça |
| Inventário | item/variante, quantidade, local de armazenamento, espaço, estado, munição e recarga |
| Montaria | nome, descrição, aquisição, Potência, Resistência, Fidelidade, vida e dor |
| Campanha | cartas de Sina, condições temporárias, lesões permanentes, aprovações/decisões aplicáveis |

Nome/retrato/biografia são identidade narrativa, não fontes de atributos. O PDF não impõe uma idade mínima numérica, uma tabela de alturas, sexo ou profissão com modificadores. Não inventar essas validações. O conceito é uma descrição curta de quem o PJ é e do que faz (p. 23).

### 2.1 Contexto ficcional

O padrão é faroeste fictício à mineira: humanos, armas, conflitos sociais, sobrevivência e redenção. O livro rejeita classes de fantasia, elfos, anões, dragões, magia, vampiros, zumbis e demônios como elementos do sistema (pp. 14, 68). Crenças, lendas, cultos e alucinações existem na ficção, mas não conferem poderes automaticamente. As Presenças do duelo são uma mecânica específica, não uma autorização para criar magias.

Origens podem incluir cidades do Oeste, povos originários, Estrangeiro e Oriente. A geografia não é a do Brasil real; não validar local de nascimento com mapas reais (pp. 14, 131–132). Um personagem pode acreditar no sobrenatural sem receber efeitos sobrenaturais.

Limites combinados pelo grupo prevalecem sobre justificativas do tipo “meu personagem faria isso” (pp. 16, 47, 125–127). O criador pode mostrar o acordo da campanha e permitir vínculos narrativos privados ao Juiz.

## 3. Condições iniciais e atributos

**LIVRO — pp. 25–30, ficha p. 270.**

| Recurso inicial | Valor antes dos atributos |
|---|---:|
| Círculos de Vida | 6 |
| Círculos de Dor | 6 |
| Defesa | 5 |
| Movimentos por turno | 1 |
| Ações de Combate por turno | 1 |
| Pontos para Atributos | 4 |
| Pontos-base para Antecedentes | 4 |

Distribuir **exatamente 4 pontos** entre os quatro Atributos. Atributos podem ficar em 0. **PRODUTO:** representar os pontos de criação por inteiros não negativos; não existe teto individual menor que o orçamento total declarado pelo livro.

| Atributo | Efeito por ponto | Usos de resistência |
|---|---|---|
| Físico | +1 Vida máxima | Organismo, veneno, doença, temperatura, drogas e ferimentos |
| Velocidade | +1 Movimento por turno | Reflexos, esquiva de perigos e explosões |
| Intelecto | +1 ponto para distribuir em Antecedentes | Memória, percepção de mentira e influências mentais pertinentes |
| Coragem | +1 Ação de Combate por turno | Medo, intimidação, estresse e força de vontade |

```text
soma(atributos_de_criacao) = 4
vida_maxima_nivel_1 = 6 + fisico + 2 * quantidade_de_parrudeza
capacidade_dor = 6
movimentos_base = 1 + velocidade
acoes_combate_base = 1 + coragem
defesa_base = 5
orcamento_antecedentes_nivel_1 = 4 + intelecto
```

Aplicar efeitos temporários e equipamento **depois** dos valores base. Velocidade não aumenta a Defesa. Dor não aumenta com Físico. Iniciativa não é uma rolagem nem um valor derivado de Velocidade: usa cartas durante a partida (pp. 26, 78).

O tamanho descomunal de Golia é um conceito humano narrativo, não uma raça ou um pacote de bônus (pp. 24, 29, 33).

## 4. Antecedentes

**LIVRO — pp. 30–33.** Distribuir `4 + Intelecto` pontos. No **nível 1**, cada Antecedente comporta **0, 1 ou 2** pontos. O PDF não fornece um teto geral para níveis posteriores; não perpetuar o teto de criação como se fosse regra de campanha.

| ID sugerido | Antecedente | Abrangência narrativa |
|---|---|---|
| atencao | Atenção | Notar detalhes, emboscadas, passagens, armadilhas e objetos fora de lugar |
| medicina | Medicina | Tratar pessoas/animais, avaliar doença/veneno e procedimentos de cura |
| montaria | Montaria | Cavalgar, lidar com animais de montaria/pastoreio, laçar e adestrar |
| negocios | Negócios | Convencer, mentir, vender, seduzir, manipular e negociar |
| roubo | Roubo | Furtividade, furtar, esconder, trapacear e subterfúgios |
| suor | Suor | Nadar, correr, saltar, escalar, carregar, empurrar e ofícios manuais |
| tradicao | Tradição | Cultura, regiões, plantas, animais e conhecimento aprendido ou vivido |
| violencia | Violência | Atirar, lutar, estratégias de combate e conhecimento de ferimentos |

As origens acima são explicações e exemplos, não pré-requisitos de profissão. Dois PJs com os mesmos pontos podem ter histórias inteiramente diferentes. O Juiz escolhe o Antecedente pertinente e pode aceitar uma justificativa para outro (pp. 30, 70).

Medicina com pelo menos 1 ponto permite cuidados no descanso sem exigir o teste comum; a tentativa de **tratamento arriscado** tem regra própria no gerenciador (pp. 31, 88).

**LACUNA:** p. 72 sugere resolver situações sem Antecedente por criatividade, mas não estabelece de maneira inequívoca uma proibição universal de rolar com valor 0; pp. 69 e 81 descrevem baixa chance e fórmula de ataque. Não bloquear toda rolagem com valor 0 a partir apenas do título dessa seção. Disponibilizar arbitragem contextual no gerenciador.

## 5. Catálogo completo das 30 habilidades de PJ

**LIVRO — pp. 34–40.** Escolher **duas aquisições** no nível 1. Podem ser duas de combate, duas de profissão ou uma de cada. Só **Parrudeza** autoriza explicitamente repetição. Como implementação conservadora do perfil Livro, impedir duplicatas das outras; não somar automaticamente efeitos idênticos.

Convenções nas tabelas: `V` = Círculo de Vida; `D` = Círculo de Dor; `AC` = Ação de Combate; `M` = Movimento. **Danos V e D são canais distintos.** `melhor(2d6)` significa rolar dois dados e selecionar o maior, nunca somá-los. Faixas `1–2 / 3–5 / 6` preservam os marcos 1, 3 e 6 do livro.

### 5.1 Combate — 15 habilidades

| Habilidade | Regra operacional | Referência |
|---|---|---|
| Armas da Natureza | Com armas rústicas/rudimentares, adicionar **Físico V** ao dano. A classificação da arma depende do material/construção e da ficção. | p. 35 |
| Ataque Sacana | Ataque surpresa com faca, navalha ou lâmina oculta: dano **adicional** de **1 / 2 / 3 V**, por faixa. Derringer tem autorização específica para aproveitar a habilidade. | pp. 35, 58 |
| Briga de Bar | Arma improvisada pequena/média causa **3 D**; grande causa **1 V**, com **−1 no Teste de Violência**. Tamanho e objeto são arbitrados. | p. 35 |
| Coldre de Sabão | Sacar **duas cartas de iniciativa** e escolher uma, maior ou menor conforme estratégia. | p. 35 |
| Dedo Quente | **+1 em Violência com revólver**. Contra alvo **sem cobertura**, acrescentar **1 / 2 / 3 V** ao dano. O bônus de teste não depende de o alvo estar descoberto. | p. 35 |
| Fúria dos Aflitos | No combate, **−1 Defesa** e **+3 D** no dano dos ataques corpo a corpo. Não converter em +3 V. | p. 36 |
| Gatilho Furioso | Com revólver, gastar **1 AC + 1 M** para efetuar **dois tiros**. Repetível enquanto houver recursos e munição; a recarga mantém seu custo. | p. 36 |
| Livramento | Na primeira vez em que todos os V forem riscados no combate, cair e **recuperar 2 V**. Se cair outra vez no mesmo combate, aplicar Teste de Morte normalmente. | p. 36 |
| Marretada | Ataques **desarmados** recebem **+Físico D**. Não se aplica a qualquer arma corpo a corpo. O dano desarmado-base não é quantificado claramente pelo PDF; registrar a decisão pertinente. | p. 36 |
| Parrudeza | **+2 V máximos** por aquisição. **Pode ser escolhida várias vezes**, consumindo uma escolha a cada vez. | p. 36 |
| Punhos do Oriente | Permite usar **Movimentos para realizar ataques desarmados**. Cada movimento gasto deixa de estar disponível para deslocamento. | p. 36 |
| Quebra-Ossos | Custo **1 M + 1 AC**. Escolher imobilizar ou aplicar o dano da tabela: **1 V + 1 D / 1 V + 2 D / 2 V + 3 D**. A tabela diz “dano do golpe”, não bônus adicional. O procedimento completo de imobilização não está definido; não inventar teste oposto/duração. | p. 37 |
| Sorte dos Covardes | Só funciona com **Intelecto ≤1 e Violência ≤2**, também nos níveis posteriores. Sacar uma carta no início do combate; efeito dura o combate: **paus +2 AC; copas +2 V; espadas +2 M; ouros +1 em Violência**. Se valores excederem os limites, manter a aquisição, mas marcá-la inativa. | p. 37 |
| Valei-me | Fabricar explosivo: **Tradição NA 7**. No combate, custo adicional de **2 AC + 1 M por explosivo**. Dano fabricado: **2 / 3 / 4 V**. Fabricar não é arremessar: são operações diferentes. | p. 37 |
| Zói de Gavião | **+1 em Violência com fuzil ou arco longo**; estando em posição vantajosa, adicionar **1 / 2 / 3 V** ao disparo. O Juiz define posição vantajosa. Não aplicar a qualquer arma de distância. | p. 37 |

**Divergência:** o exemplo de Quebra-Ossos da p. 83 gasta duas AC depois dos movimentos; a descrição normativa da p. 37 exige 1 AC + 1 M. Preferir a descrição da habilidade, mantendo a divergência registrada.

### 5.2 Profissão — 15 habilidades

| Habilidade | Regra operacional | Referência |
|---|---|---|
| Às na Manga | Em **testes envolvendo jogos de cartas**, usar melhor(2d6). Não significa ganhar cartas adicionais no duelo. | p. 38 |
| Boca na Botija | Melhor(2d6) em Atenção; a Defesa não diminui por surpresa antes do combate. | p. 38 |
| Canção da Emoção | **Uma vez por sessão**; gastar **2 AC por PJ e por benefício**. Benefícios desbloqueados: nível 1, +1 M; nível 3, +1 AC; nível 4, +1 Violência; nível 6, +3 V temporários. Pode conceder benefícios adicionais desbloqueados pagando por cada um. Instrumento e performance integram a ficção. Duração dos bônus não é explicitada em detalhe. | p. 38 |
| Chamego | Melhor(2d6) para laçar; **−1 nos testes de quem tenta se soltar do laço**. | p. 39 |
| Cuspe e Cola | Curar em combate, junto do paciente: **2 AC por V curado**. Limite anunciado de **usos por combate: 1 / 2 / 4**. O texto não define inequivocamente se um uso pode curar múltiplos V; pedir decisão da mesa antes da automação desse limite. | p. 39 |
| Fogo no Céu | Melhor(2d6) em testes envolvendo explosivos; elimina o risco de o explosivo atingir o próprio usuário por falha crítica. Não concede imunidade a explosões em geral. | p. 39 |
| Fumaça na Água | Melhor(2d6) em Roubo para furtar, esconder-se ou mover-se silenciosamente. | p. 39 |
| Galope Certeiro | Melhor(2d6) em Montaria quando sobre o próprio cavalo; ignora a penalidade de montarias não familiares. O valor dessa penalidade não é informado. | p. 39 |
| Não Vai Doer Nadinha | Melhor(2d6) em Medicina e **cura adicional de 1 / 2 / 4 V**. A aplicação a fontes de cura que não envolvem Medicina não é delimitada; não somar a toda cura automática. | p. 39 |
| Natural da Natureza | Melhor(2d6) em Suor; dispensa testes para achar plantas, ervas medicinais/comestíveis e abrigo em território selvagem/inóspito. | p. 40 |
| Sabiá Imperatriz | Melhor(2d6) em Negócios. | p. 40 |
| Sabugos e Peçonhas | Produz venenos que causam **1 D por ação do alvo envenenado**, até cura, resistência ou inconsciência. Não substituir “ação” por “rodada”. Criação, NA, relação com venenos comuns e inclusão de movimentos exigem arbitragem onde não especificados. | p. 40 |
| Salve-se Quem Puder | Melhor(2d6) em testes para escapar/fugir; **+1 M exclusivo para fuga**. Não vira um movimento livre permanente. | p. 40 |
| Sorrisão, Chapéu na Mão | Comprar itens **comuns** com **25% de desconto** e vender por **25% a mais**, conforme preços do catálogo. Não se aplica a itens especiais/raros. A primeira compra tem instrução própria de preço máximo, sem barganha; ver §9. | p. 40 |
| Zói de Coruja | Melhor(2d6) em Tradição **para recordar conhecimento**. Não estender a todo teste de Tradição sem essa condição. | p. 40 |

### 5.3 Regras de implementação das habilidades

**PRODUTO:** cada habilidade precisa ter `id`, `nome`, `categoria`, `paginas`, `repetivel`, `requisitos`, `gatilhos`, `custos`, `efeitos`, `limite_de_uso`, `faixas_de_nivel` e `lacunas`. Efeitos condicionais devem exigir contexto, por exemplo `alvo_sem_cobertura`.

Não conceder a PJs as nove habilidades exclusivas de vilão das pp. 255–257. Não apresentar como novas habilidades jogáveis “Artes Marciais” ou “Dedo Furioso”: aparecem em fichas de NPCs, mas não têm verbetes próprios nas 30 habilidades. Ver catálogo e divergências no Documento 2.

O livro não fornece uma regra geral de acumulação de duas fontes de melhor(2d6). Não transformar duas fontes em 3d6, +2, ou repetição infinita. Também não presumir que bônus de mesma origem possam ser comprados duas vezes.

## 6. Redenção: campos livres e estrutura obrigatória

**LIVRO — pp. 42–46.** A trilha representa um problema pessoal do passado e o percurso para enfrentá-lo. Cada trilha começa com **6 passos**. Os passos podem ser realizados fora de ordem, **exceto o último, que precisa ser o último**. Cada passo cumprido concede uma Carta de Sina, sujeita à mediação/limites de Sina (p. 95).

Completar a redenção concede, independentemente do nível:

- **+1 aquisição de habilidade**;
- **+2 V máximos**;
- **+1 carta sacada na iniciativa**, escolhendo a melhor.

**PRODUTO:** conceder os três benefícios uma única vez por conclusão registrada; impedir duplicação por recarregar página. A possibilidade narrativa de iniciar outra jornada aparece na p. 46, mas o acúmulo indefinido dos mesmos benefícios não é esclarecido. Registrar política de campanha para redenções subsequentes.

A quantidade de passos pode mudar **durante a campanha** pela Presença do Faroleiro em duelos (p. 111); portanto, exigir seis na criação não significa exigir seis para sempre.

### 6.1 Seis modelos do livro

Os resumos abaixo preservam os critérios mecânicos. Nomes, pessoas, bens e motivos entre exemplos são preenchíveis pelo jogador, em acordo com o Juiz. Não substituir critérios como “três vezes” por progresso arbitrário.

| Trilha | Premissa | Passos 1 a 6 | Fonte |
|---|---|---|---|
| Fuga | Escapou de prisão/grupo e é procurado | 1. Usar a condição de procurado em favor da gangue. 2. Causar problemas à gangue **ao menos três vezes** por ser procurado. 3. Sacrificar algo/alguém importante pela liberdade. 4. Livrar-se do pior caçador que o persegue. 5. Juntar o dinheiro para a recompensa. 6. Encerrar a condição de procurado pagando ou tratando com autoridades. | p. 44 |
| Vingança | Vingar uma perda causada por alguém | 1. Causar problemas à gangue **ao menos três vezes** por vingança. 2. Encontrar e ajudar a última vítima do alvo. 3. Ir ao último lugar em que o alvo foi visto. 4. Resolver outro problema causado pelo alvo. 5. Encontrar seu paradeiro e desafiar para duelo. 6. Vencer o duelo e concluir a vingança. | p. 44 |
| Dívida | Quitar dívida com figura poderosa | 1. Esconder dinheiro da gangue para pagar. 2. Causar problemas à gangue **ao menos três vezes** pela dívida. 3. Encontrar trabalho muito lucrativo e especialmente arriscado. 4. Juntar metade do valor ou conseguir desconto. 5. Roubar/enganar alguém amado para obter dinheiro. 6. Pagar a dívida. | p. 44 |
| Remorso | Reparar um crime contra pessoas importantes | 1. Adotar uma abstinência/conduta punitiva. 2. Causar problemas à gangue **ao menos três vezes** pelo remorso. 3. Reencontrar vítimas e prestar serviço importante. 4. Encontrar forma de compensação. 5. Sacrificar posses, vida atual ou vínculo para obter perdão. 6. Expiar o remorso. | p. 45 |
| Recomeço | Recuperar antiga honra/reputação | 1. Fazer façanha que demonstre utilidade à gangue. 2. Encontrar alguém que recorde sua reputação. 3. Aprender **ao menos duas novas habilidades**. 4. Causar problemas à gangue **ao menos três vezes** pela busca. 5. Repetir **duas façanhas** comparáveis às antigas. 6. Recuperar honra, glória e fama. | p. 45 |
| Ambição | Tornar-se o maior/melhor em algo | 1. Encontrar **três rivais** para competir/enfrentar. 2. Causar problemas à gangue **ao menos três vezes** por ambição. 3. Fazer **ao menos três grandes nomes** conhecerem sua reputação. 4. Perder alguém importante pela ambição: **não pode ser o primeiro passo**. 5. Fazer amizade com alguém de mesma ambição. 6. Vencer o confronto decisivo e alcançar a ambição. | p. 45 |

### 6.2 Trilha própria

**LIVRE/JUIZ — p. 46.** Disponibilizar criação personalizada, sem obrigar a usar um dos seis modelos. O livro orienta:

1. Definir problema inicial e possível resolução final.
2. Incluir consequências/problemas para o PJ e a gangue.
3. Pensar em sacrifício relevante.
4. Relacionar NPCs/situações que ajudem, inclusive cobrando algo em troca.
5. Aceitar que redenção não exige final feliz.

**PRODUTO:** transformar isso em perguntas orientadoras e revisão narrativa do Juiz, não em um detector automático de “boa história”. Preservar a estrutura inicial de seis passos e o último como encerramento. Não exigir três incidentes em toda trilha própria: essa quantidade está nos modelos específicos, não na orientação geral.

## 7. Recompensa pela cabeça

**LIVRO — p. 48.** Inicialmente **0**, salvo quando a Trilha de Redenção exige uma recompensa. O valor dessa exceção não é fixado; deve ser combinado com o Juiz, e não inventado pelo criador.

Não confundir recompensa por captura com saldo ou dívida. Um passado criminoso pode fundamentar a exceção, mas não acrescentar automaticamente valores sem a decisão da campanha. O gerenciador contém a tabela completa dos 19 crimes e o controle de consequências.

## 8. Montaria

**LIVRO — pp. 50–51, 55, 271.** Permitir nome e aparência livres, respeitando a ficção. A regra não oferece pacotes estatísticos distintos para cada raça de cavalo.

Distribuir **3 pontos** entre **Potência e Resistência**. Não há teto individual adicional declarado. Usar inteiros não negativos na criação.

```text
potencia + resistencia = 3
vida_maxima_montaria = 6 + resistencia
capacidade_dor_montaria = 6
fidelidade_inicial = 0
teste_corrida = 1d6 + potencia + antecedente_montaria_do_PJ
NA_padrao_corrida = 6
deslocamento_por_movimento_montado = 10 metros
```

Não somar Resistência aos Círculos de Dor. Não aplicar a fórmula de NPC a uma montaria de PJ criada por este subsistema.

| Fidelidade | Efeito |
|---:|---|
| 0 | Montaria estranha; nenhum bônus |
| 1 | Atende pelo nome |
| 2 | +1 em Potência **ou** Resistência |
| 3 | Vem quando chamada, se estiver num raio de 500 m |
| 4 | Sem penalidades para saltar obstáculos perigosos |
| 5 | +1 em Potência **ou** Resistência |

O Juiz decide ao fim de cada sessão se a Fidelidade aumenta. Maus-tratos, abandono e negligência podem diminuí-la, inclusive causando fuga. Não é XP automático, nem aumenta obrigatoriamente a cada sessão. O livro não define como remover/reconceder aumentos de atributos quando a Fidelidade cai e sobe de novo: registrar histórico e impedir ganhos infinitos enquanto o Juiz define a política.

**LACUNA econômica:** a criação de montaria não declara que ela é gratuita; a p. 52 manda gastar $200 com tudo, e a p. 55 vende animais. Um cavalo pelo máximo da tabela custa $250. Não dar cavalo gratuito nem proibir concluir a ficha sem ele por dedução. Permitir rascunho de montaria, compra de burrico/mula ou vínculo inicial concedido pelo Juiz, com sua origem registrada.

## 9. Dinheiro, compras e inventário

**LIVRO — pp. 52–65.** O PJ começa com **$200** para comprar tudo, inclusive roupas e armas. Na primeira compra usar **o preço máximo da tabela**, **sem barganhar**. O restante é o saldo inicial. Moeda ficcional: réis; o `$` deste documento não indica reais brasileiros nem dólares.

**PRODUTO:** usar valores decimais exatos ou inteiros na menor unidade técnica de 0,01 réis, sem ponto flutuante binário. A relação ilustrativa da p. 52 com moeda real não deve gerar conversão financeira dinâmica.

**LACUNA:** Sorrisão concede desconto em compras comuns (p. 40), enquanto a p. 52 manda usar preço máximo na compra inicial. Política conservadora sugerida: máximo sem desconto inicial; registrar como interpretação confirmável pelo Juiz, não como errata oficial. Não permitir barganha livre no modo padrão.

### 9.1 Capacidades e porte

| Contêiner/local | Capacidade/regra | Fonte |
|---|---|---|
| Mochila | **10 espaços**; item pode ocupar 0,5, 1, 2 ou 3 conforme catálogo | p. 52 |
| Montaria | **15 espaços adicionais** descritos na regra geral | p. 52 |
| Bolsa de montaria | Descrita como necessária para objetos/armas no cavalo e comportando **mais 10 espaços**; relação com os 15 é ambígua | p. 55 |
| Carroça | **30 espaços** | pp. 52, 55 |
| Carro de tração animal | **20 espaços**; não é automóvel | p. 55 |
| Roupas vestidas | Não ocupam mochila | p. 52 |
| Roupas guardadas | **0,5 espaço por peça** | p. 62 |
| Armas prontas para uso | No máximo **4 armas**, em combinação de bainhas/coldres e **até 2 bandoleiras**, mais **1 faca** fora desse limite | p. 53 |
| Armas adicionais | Dentro da mochila, ocupando espaço; retirar em combate custa **2 AC** | p. 53 |
| Coldre com cinturão | 1 revólver/arma semelhante e **até 36 balas de revólver** | p. 53 |
| Bandoleira | 1 fuzil/espingarda e **24 balas** no texto; ilustração anuncia **12 projéteis** | p. 53 |
| Bainha | Faca, espada ou arma branca equivalente | p. 53 |

Armas corretamente portadas fora da mochila não ocupam seus espaços. Guardar munição na mochila usa o espaço do pacote da tabela; recuperá-la custa **2 AC**. Sem coldre/bandoleira, p. 53 descreve **2 AC para apanhar munição + 1 AC para recarregar**, enquanto a tabela da arma possui custos próprios: a relação precisa de decisão explícita, detalhada no Documento 2.

**Não transformar `—` em item gratuito.** Nos espaços, o travessão pode indicar ausência de espaço especificado; para pequenos itens a regra geral permite não ocupar espaço. Em arma grande, ausência de número não prova volume zero. Preservar `espaco_original`, `espaco_resolvido` e decisão, especialmente para lança, bainha e artigos volumosos.

A p. 52 cita facas e dinamites com 0,5 espaço e limite de quantidade, mas não fornece esses limites numéricos. A faca aparece como “coldre” na tabela. Não inventar limite de 2, 5 ou 10 unidades. Não criar mochilas infinitas equipáveis para multiplicar capacidade sem regra de mesa.

### 9.2 Armas comuns — p. 56

Danos conferidos visualmente no PDF. Valores de preço são mínimo–máximo. `—` reproduz ausência de especificação.

| Arma | Carga | Recarga | Preço | Dano | Espaço guardado |
|---|---:|---|---:|---|---|
| Revólver | 6 | 2 AC | 15–25 | 1 V | 1 |
| Fuzil | 5 | 2 AC | 25–40 | 3 V | 3 |
| Espingarda | 2 | 1 AC | 25–40 | 1 V longe; 2 V perto | 2 |
| Garrucha | 1 | 2 AC | 10–20 | 2 V, apenas perto | 1 |
| Zarabatana | — | — | 3–10 | 1 D + veneno | 1 |
| Estilingue | — | — | 1–5 | 2 D | 1 |
| Boleadeira | — | — | 1 | 3 D | 1 |
| Arco e flecha | — | — | 25 | 1 V | 1 |
| Faca | — | — | 1–5 | 3 D | “coldre”; regra geral: 0,5 na mochila |
| Sabre/espada | — | — | 5–25 | 1 V | “bainha” |
| Lança | — | — | 15–25 | 1 V | — |
| Machadinha | — | — | 5–10 | 1 V | 1 |
| Machado de lenha | — | — | 1–2 | 2 V | 2 |
| Martelo de mão | — | — | 5–10 | 1 V | 1 |

Preservar diferenças contraintuitivas: a faca causa **Dor** no catálogo; Ataque Sacana pode adicionar **Vida**. Não “corrigir pelo realismo”. O arco longo é mencionado em habilidade, mas não possui linha de arma separada; a equiparação com arco e flecha exige decisão.

### 9.3 Acessórios e munição — p. 56

| Item/unidade vendida | Preço | Espaço |
|---|---:|---|
| Bainha | 3–10 | — |
| Bandoleira | 5–20 | — |
| Coldre | 4–15 | — |
| Caixa de 12 balas de revólver | 3–8 | 1 |
| Caixa de 6 balas de espingarda | 7–10 | 1 |
| Caixa de 6 balas de fuzil | 6–12 | 1 |

Não há preço autônomo de flechas, dardos e munição de toda arma especial. Não dar munição ilimitada porque a carga está com travessão. Política de pacotes parcialmente vazios, fracionamento de compra e espaço proporcional depende da mesa.

### 9.4 Armas especiais — pp. 58–59

| Arma | Carga | Recarga | Preço | Dano | Espaço |
|---|---:|---|---:|---|---|
| Pistola automática | 11 | 2 AC | 1000–2000 | 1 V | 1 |
| Magnum de cano alongado | 6 | 2 AC | 2000–4000 | 2 V | 1 |
| Mauser C69 | 15 | 1 AC | 2000–4000 | 1 V | 1 |
| Carabina de repetição | 7 | 2 AC | 1000–2000 | 2 V | 2 |
| Derringer | 2 na tabela; 1 na descrição | 1 AC | 300 | 1 V | 1 |
| Espingarda de cano serrado | 2 | 2 AC | 50–150 | 3 V | 2 |
| Canhão de cavalaria | 1 | 2 turnos | Não se vende | 6 V | — |
| Metralhadora montada | — | 2 turnos | Não se vende | 3 V, com regra variável | — |
| Explosivo TNT/dinamite | — | 3 AC na tabela | 30–40 | 5 V | 0,5 |

- Pistola automática: **um tiro adicional por AC**.
- Carabina: **um tiro adicional na primeira AC do turno**, com **−1 em Violência**.
- Derringer: ocultável, aproveita Ataque Sacana. Carga pendente de decisão.
- Cano serrado: só especialista faz a modificação; pode ser usado com uma mão e levado no coldre; a redução de alcance não é numericamente definida.
- Metralhadora: turno inteiro, não pode mirar, atinge amigos e inimigos em linha, recarrega após disparar. A fórmula de dano e o exemplo divergem; não automatizar sem resolver.
- Canhão: Violência **NA 7**, área de **3 m de raio**; erro comum desvia **3 m em direção aleatória**; falha crítica atinge aliado e arredores.
- Explosivos/molotov: área de **1,5 m de raio**; arremesso e falha especial no Documento 2.
- Alcances narrativos gerais: perto/curto **9 m**, médio **30 m**, longo **90 m** (p. 54). Não atribuir alcance máximo inventado a cada arma sem dado específico.

### 9.5 Proteções improvisadas — pp. 59–60

Não aumentam Defesa. Reduzem dano de tiros e corpo a corpo até gastar a durabilidade. **Não reduzem explosões**. Os ícones da tabela indicam redução/limite em **Vida**; não presumir redução de Dor.

| Proteção | Redução V por dano aplicável | Limite total V | Preço | Penalidade enquanto vestida |
|---|---:|---:|---:|---|
| Sobretudo protetor | 1 | 2 | 50–70 | −1 AC, mínimo 1 |
| Colete de couro reforçado | 1 | 3 | 100–200 | −1 M, mínimo 1 |
| Colete de couro com madeira | 2 | 4 | 150–250 | −1 AC e −1 M, mínimo 1 de cada |
| Ombreiras de ferro | 2 | 4 | 400–500 | −2 M, mínimo 1 |
| Placas de metal | 3 | 5 | 100–400 | −2 M e −1 AC, mínimo 1 de cada |
| Panelas chumbadas | 3 | 4 | 200–400 | −1 M e −2 AC, mínimo 1 de cada |

A proteção quebrada continua penalizando até ser retirada. Manter durabilidade atual. **LACUNA:** reparos, tempo para retirar, múltiplas proteções simultâneas e acúmulo não têm procedimento completo. O sobretudo de vestuário e o sobretudo protetor não são a mesma compra mecânica.

### 9.6 Criações, animais e transporte — p. 55

| Item | Preço | Observação |
|---|---:|---|
| Apicultura | 5–10 | Produção não quantificada |
| Bode/cabra, unidade | 10–100 | — |
| Bolsa de montaria | 2–10 | Capacidade descrita: mais 10; ver divergência com 15 |
| Bovino | 10–300 | — |
| Canoa | 20–50 | Lotação/capacidade não especificadas |
| Carroça | 15–30 | 30 espaços |
| Carro | 1–25 | 20 espaços, tração animal |
| Cavalo | 1–250 | Sem relação definida entre preço e atributos |
| Curral, dia/semana | 1–2 | Cuidados, banho e alimentação; confirmar período/preço |
| Galinhas | 1–3 | — |
| Mula/burrico | 1–100 | Pode fundamentar montaria inicial comprável |
| Ovelha/cordeiro | 5 | — |
| Sela | 3–10 | Sem bônus numérico declarado |
| Suíno | 10–30 | — |

### 9.7 Mercearia — p. 61

`—` mantém o símbolo da tabela; pequenos itens podem não ocupar espaço. `máx.` é o texto de quantidade, **não** um número de espaços.

| Item/porção | Preço | Espaço ou anotação original |
|---|---:|---|
| Açúcar, 0,5 kg | 1–2 | 0,5 |
| Alcaçuz, doces | 0,50–1 | — |
| Atum, lata | 0,10–0,50 | 0,5 |
| Azeite, garrafa | 2 | 1 |
| Biscoitos | 0,50–1 | — |
| Carne seca, 1 kg | 1–2 | 1 |
| Café, lata | 0,50–1 | “máx. 3”; ocupação não informada |
| Cenouras, 5 | 0,05–0,25 | 1 |
| Cerveja, garrafa | 0,25–1 | 1 |
| Chocolate, barra | 1–4 | — |
| Conhaque fino, garrafa | 40–60 | 0,5 |
| Ervilhas, lata | 3–15 | 0,5 |
| Erva medicinal, 0,5 kg | 5–50 | 0,5 |
| Farinha, 0,5 kg | 1–2 | 0,5 |
| Feijão, lata | 0,50–2 | 1 |
| Folhas de chá, 0,5 kg | 1–2 | 1 |
| Fósforos, 10 | 0,05–0,10 | — |
| Jornal | 0,25 | — |
| Leite, 0,5 litro | 3–5 | 1 |
| Maçãs, 3 | 0,10 | — |
| Martelo, mercearia | 0,50–1 | 1 |
| Milho, lata | 0,10–0,50 | 0,5 |
| Mochila | 1 | — |
| Óleo de lanterna | **0,50–0,25**, invertido no original | 0,5 |
| Ovos, 6 | 1–2,50 | 0,5 |
| Paierinhos, 5 | 0,50–1 | — |
| Pinga, garrafa | 0,25–1 | 1 |
| Pão de queijo, 10 | 1–2 | 0,5 |
| Sardinha, lata | 0,10–0,25 | 0,5 |
| Sabão, barra, mercearia | 0,10–0,25 | 0,5 |
| Sopa | 0,50–2 | 0,5 |
| Queijo, 0,5 kg | 3–6 | 0,5 |
| Tabaco, 0,5 kg | 2–5 | 0,5 |
| Tábua de lavar | 1–3 | 1 |
| Tônico capilar, frasco | 10–15 | 0,5 |
| Vinho, garrafa | **10–5**, invertido no original | 1 |
| Unguento, frasco, mercearia | 5–10 | 1 |
| Uísque, garrafa | 5–10 | 1 |

Preços invertidos: preservar o original e sinalizar. Se a mesa autorizar normalizar a ordem dos extremos, usar 0,25–0,50 e 5–10, com máximos iniciais 0,50 e 10. Isso é normalização editorial registrada, não alteração silenciosa.

### 9.8 Vestuário e adornos — p. 62

Modelos, cores e aparência são livres. Cada peça de roupa **guardada** ocupa 0,5; vestida, não ocupa mochila. A tabela inclui objetos que não são estritamente peças de roupa: não usar isso para permitir qualquer volume pendurado sem limite ficcional.

| Item | Preço | Item | Preço |
|---|---:|---|---:|
| Anel, latão a diamante | 1–1500 | Lenço de pescoço | 0,50–1 |
| Avental de médico | 2–5 | Leque | 1–3 |
| Batina | 1–2 | Lingerie | 3–100 |
| Bengala | 1–2 | Luvas | 0,25–1 |
| Boina | 0,50–1 | Gargantilha | 0,50–1 |
| Bolsa de mão | 10–20 | Gravata | 1–5 |
| Botas | 5–10 | Jaqueta | 10–300 |
| Blusa de inverno | 10–30 | Óculos, vestuário | 5–25 |
| Blusa de verão | 1–5 | Macacão jeans | 0,50–3 |
| Brincos, latão a diamantes | 5–1500 | Meias | 0,10–0,25 |
| Broche, latão a prata | 2–500 | Paletó | 20–50 |
| Calça | 2–8 | Perneiras | 10–15 |
| Camisa | 2–5 | Pijamas | 1–30 |
| Camisola | 10–25 | Poncho | 1–50 |
| Cartola | 15–20 | Pulseira, lata a diamante | 2–2000 |
| Casaco | 2–15 | Saia | 1–15 |
| Ceroulas | 1–2 | Sapatos | 2–100 |
| Chapéu | 5–100 | Sobretudo, vestuário | 10–200 |
| Cinto | 1–5 | Sombrero | 5–20 |
| Colar, ferro a pérolas | 2–2500 | Suspensórios | 1–5 |
| Colete | 3–15 | Vestido, trabalho a gala | 2–150 |
| Echarpe | 1–2 | Tuxedo | 10–50 |
| Estetoscópio | 10–50 | Xale de lã | 1–2 |

Há intervalos que também representam materiais/modelos distintos. A compra inicial ainda manda usar o máximo, mas o livro não fornece subtabelas de preços por material. Não inferir preço de “chapéu simples” ou “anel de latão” sem decisão do Juiz.

### 9.9 Armazém — p. 63

| Item/porção | Preço | Espaço/anotação |
|---|---:|---|
| Acordeão/sanfona | 30–50 | 1 |
| Alicate de arame | 20–50 | 1 |
| Algemas | 2–4 | 0,5 |
| Arame, 10 m | 3–5 | 2 |
| Banjo | 50–100 | 1 |
| Baralho | 0,50–2 | — |
| Barraca | 7–12 | 1 |
| Berimbau | 1–2 | 1 |
| Binóculo | 25–40 | 0,5 |
| Brinquedo | 10–20 | 0,5 |
| Bússola | 1–5 | — |
| Cadeado | 0,50–1 | 0,5 |
| Cantil | 3–5 | — |
| Corrente, 2 m | 10–25 | 1 |
| Corda, 5 m | 1–5 | 1 |
| Dados, 3 | 0,50–1 | — |
| Detonador | 3–5 | 1 |
| Foice | 10–25 | 1 |
| Forcado | 10–25 | 1 |
| Fósforos | 0,05–0,10 | — |
| Flauta | 2–100 | 1 |
| Gaita/harmônica | 15–25 | 1 |
| Ganzá/chocalho | 5–10 | 1 |
| Gazuas, 20 | 0,50–1 | 1 |
| Graxa, pote | 1–2 | 0,5 |
| Isqueiro | 5–30 | —; “R$” é variação tipográfica no original |
| Lanterna | 5–10 | 1 |
| Linha e agulha | 0,50–1 | — |
| Lona, 2 m | 20–30 | 2 |
| Machado, armazém | 10–25 | 1 |
| Marreta | 10–25 | 1 |
| Óculos, armazém | 20–50 | 0,5 |
| Óleo, lata | 1–2 | 1 |
| Pá | 1–2 | 1 |
| Pandeiro | 60–80 | 1 |
| Panela | 3–10 | 1 |
| Pavio, 10 m | 10–15 | 2 |
| Pé de cabra | 5–10 | 1 |
| Pregos, 20 | 0,50–1 | “máx. 20”; ocupação não informada |
| Pederneira | 0,50–1 | 0,5 |
| Relógio de bolso | 25–50 | 0,5 |
| Picareta | 10–25 | 2 |
| Sabão, barra, armazém | 0,25–0,50 | “máx. 2”; ocupação não informada |
| Saco de dormir | 0,25–0,50 | 1 |
| Tesourão | 25–50 | 2 |
| Tamborim | 10–20 | 1 |
| Vara de pescar | 3–5 | 1 |
| Viola | 30–60 | 1 |
| Violão | 30–60 | 1 |
| Violino | 50–100 | 1 |
| Zabumba | 30–50 | 2 |

Martelo, machado, óculos, sabão e unguento aparecem em mais de um catálogo com valores/espaços distintos. Manter entradas ou variantes com referência própria; não mesclar escolhendo o menor preço e o menor espaço. Ferramenta sem dano descrito não herda automaticamente o dano de arma homônima: usar classificação do Juiz ou Briga de Bar quando aplicável.

### 9.10 Farmácia — pp. 64–65

O catálogo diz **0,5 espaço por frasco**. Para ervas/raízes/pastas, a embalagem é pouco especificada; preservar unidade e confirmar o espaço se necessário.

| Item | Preço | Efeito numérico expresso |
|---|---:|---|
| Adrenalina, seringa | 400–500 | 1 AC para aplicar, recupera 3 V; rebote descrito abaixo |
| Álcool, frasco | 3–5 | Uso narrativo, sem bônus fixo |
| Arsênico, frasco | 2–4 | Uso narrativo, sem fórmula/dose |
| Babosa, erva | 2 | Uso narrativo |
| Boldo, erva | 2 | Uso narrativo |
| Cavalinha, erva | 2 | Uso narrativo |
| Cânfora, pasta | 10–30 | 1 AC em combate, cura 1 V |
| Erva-doce, erva | 2 | Uso narrativo |
| Folha de salgueiro, erva | 3 | Uso narrativo |
| Gengibre, raiz | 2 | Uso narrativo |
| Laxante, frasco | 5–10 | Uso narrativo |
| Mil-folhas, erva | 2 | Uso narrativo |
| Morfina, ampola | 50–100 | Anestésico/analgésico na ficção; sem bônus fixo |
| Pomada de cavalo, pasta | 5–10 | Montaria recupera 3 V durante descanso |
| Tônico milagroso, frasco | 10–50 | Teste de Sorte por carta: preta cura 3 V imediatamente; vermelha não cura e envenena |
| Unguento, pasta | 5–10 | Cura 1 V aplicado durante descanso |
| Xarope de tosse, frasco | 2–5 | Uso narrativo |

Adrenalina: normalmente no fim do combate, **−1 AC e −1 M até descansar**. Doses adicionais não acumulam benefícios, mas acumulam perdas. Se perder todas as ações por isso, o PJ morre. A palavra “ações” nesse gatilho e o alcance de “não acumula efeitos” precisam de arbitragem para aplicações repetidas.

O texto de Cuspe e Cola afirma ser a única cura em combate, mas estas entradas trazem exceções explícitas. Preservar os usos dos itens; não bloqueá-los por aquela frase geral.

O próprio livro deixa a maioria dos efeitos dos remédios para **consenso e uso lógico na ficção** (p. 65). Não criar porcentagens de cura, receitas, quantidades/doses ou bônus para todos os produtos. São elementos de jogo, não orientação médica real.

### 9.11 Anúncios ilustrados

As ilustrações publicitárias também exibem produtos/preços: bandoleira $15, cinturão de balas $15, faca de caça $3 (p. 53); coldre de ombro $20, dinamite $30, item anunciado “Cura+1” $10 (p. 54); coche elegante $400 (p. 55); espingarda $40, navalha $10, Derringer $300, revólver $15 (p. 57); bule $3, câmera $3000 e anúncio “Magnum na mão” $15 (p. 61); chave inglesa $5, acordeão $30, violão $40, fuzil $25 (p. 63).

**PRODUTO:** manter anúncios separados de registros normativos. Preço ilustrado não substitui o máximo da tabela na primeira compra; o Magnum de $15 não se torna automaticamente a arma de $2000–4000. Itens sem ficha podem ser admitidos narrativamente pelo Juiz, com dados incompletos explícitos.

## 10. Evolução do personagem

**LIVRO — p. 49.** O nível padrão de criação é 1. Criar personagem em nível superior é uma configuração da campanha que deve reproduzir os ganhos históricos, não inventar um novo orçamento.

| Nível alcançado | XP indicado na tabela | Ganhos naquele nível |
|---:|---:|---|
| 1 | 0 | Valores de criação; 2 habilidades |
| 2 | 10 | +`max(Físico,1)` V; +1 ponto de Antecedente; +1 habilidade |
| 3 | 20 | +1 ponto de Atributo; +1 habilidade |
| 4 | 30 | +`max(Físico,1)` V; +1 ponto de Atributo; +1 habilidade |
| 5 | 45 | +`max(Físico,1)` V; +1 ponto de Atributo |
| 6 | 65 | +3 V; +1 ponto de Atributo; +1 habilidade |

O nível 5 **não** concede habilidade. Sem redenção, o total de aquisições até o nível 6 é **6**: duas iniciais e quatro por progressão. Aumentos de Atributo continuam ligados às suas condições derivadas.

**LACUNAS da evolução:**

1. A tabela não declara claramente se o XP é acumulado ou pago a cada nível. Recomenda-se oferecer XP acumulado com marcos 0/10/20/30/45/65 como **interpretação explicitada**, confirmável pela mesa.
2. Não esclarece a ordem entre ganhar Físico e calcular Vida nos níveis 4 e 5, nem se um aumento posterior de Físico recalcula os ganhos de Vida anteriores.
3. Não define perda retroativa de pontos de Antecedente por redução permanente de Intelecto.
4. Não fornece progressão depois do nível 6, nem teto individual global de Atributos/Antecedentes.
5. Não declara que subir de nível restaura a Vida atual.

**PRODUTO:** usar um livro-razão de concessões (`grantLedger`) com nível, Físico usado no cálculo e efeito aplicado. Não reconstituir uma ficha avançada só por `nivel * fisico`. Para aumentos de Intelecto, manter concessões de pontos separadas de alocações, permitindo revisar o impacto de perdas permanentes sem apagar a ficha.

### 10.1 XP de fim de sessão

Receber **1 XP por “sim”** às cinco perguntas da p. 49, mediadas pelo Juiz:

1. Sobreviveu ao fim da sessão?
2. Tem mais dinheiro que no início?
3. Fez algo que ajudou o bando?
4. Resolveu o problema de alguém?
5. Terminou com alguma Carta de Sina?

O grupo pode alterar/remover/adicionar perguntas **com concordância de todos**, ajustando o ritmo da campanha. Não conceder XP por inimigo morto.

A p. 95 também menciona +1 XP por Sina não usada. A relação com a quinta pergunta não é inequívoca: evitar somar duas vezes automaticamente; manter decisão explícita no Documento 2.

## 11. Modelo técnico sugerido

**Tudo nesta seção é PRODUTO, não uma exigência de stack do livro.** Adaptar aos padrões do projeto existente.

```typescript
type OrigemRegra = 'livro' | 'interpretacao' | 'regra_de_mesa';
type Situacao = 'rascunho' | 'enviado' | 'aprovado' | 'em_campanha' | 'morto' | 'arquivado';
interface Fonte { paginasImpressas: number[]; nota?: string }
interface Concessao {
  id: string;
  tipo: 'criacao' | 'nivel' | 'redencao' | 'duelo' | 'lesao' | 'mesa';
  nivel?: number;
  efeitos: Record<string, number>;
  escolhas: Record<string, unknown>;
  fonte: Fonte;
  decisaoId?: string;
}
interface PassoRedencao {
  id: string; texto: string; final: boolean; naoPodeSerPrimeiro: boolean;
  metaContagem?: number; eventos: string[];
  estado: 'pendente' | 'cumprido' | 'removido_por_presenca';
  concluidoEm?: string; cartaSinaConcedidaId?: string;
}
interface ItemPossuido {
  id: string; catalogoId: string; varianteId?: string; quantidade: number;
  local: 'vestido' | 'coldre' | 'bainha' | 'bandoleira' | 'mochila' | 'montaria' | 'carroca' | 'carro' | 'base';
  recipienteId?: string; precoPago: string; espacoResolvido?: number;
  municaoCarregada?: number; durabilidadeRestante?: number;
  fonte: Fonte; decisaoId?: string;
}
```

Manter separados: pontos-base, concessões de progressão, bônus temporários, perdas permanentes e valores derivados. `vidaRiscada` e `dorRiscada` devem ter direção clara na UI: círculo riscado é dano, não cura.

### 11.1 Estados e permissões

- Jogador edita sua ficha de rascunho; o Juiz define decisões de campanha e revisa conteúdo que dependa dele.
- Respeitar livre redistribuição durante a criação, mas recalcular orçamento e requisitos: reduzir Intelecto pode tornar antecedentes inválidos.
- Em campanha, editar por eventos de evolução/compra/cura/lesão, preservando histórico; correções administrativas podem existir com justificativa.
- Envio/revisão são escolhas de produto. Não apresentar aprovação do Juiz para cada clique como se fosse uma regra do livro.
- Segredos do cenário não devem ser incluídos nos dados retornados para o jogador só porque estão escondidos visualmente.

### 11.2 Validação em camadas

1. **Integridade:** tipos, IDs, propriedade da ficha, quantidades e moeda válidas.
2. **Livro:** soma 4 em atributos; soma `4 + Intelecto` em antecedentes; teto 2 por antecedente no nível 1; duas aquisições; requisitos; dinheiro e capacidade.
3. **Decisões pendentes:** compra/efeito que utiliza informação divergente, incluindo montaria, bandoleira e preço invertido.
4. **Ficção:** coerência de conceito, trilha e vínculos, revisada por humanos.

Bloquear apenas o que for verificavelmente inválido. Rascunhos incompletos podem ser salvos. Uma lacuna sobre metralhadora não impede concluir um PJ que não possui metralhadora.

## 12. Casos de aceitação para implementação

| ID | Entrada/ação | Resultado esperado |
|---|---|---|
| PJ-01 | Atributos 2 Físico, 1 Velocidade, 0 Intelecto, 1 Coragem | Vida 8; Dor 6; M 2; AC 2; Defesa 5; 4 pontos de Antecedente |
| PJ-02 | Atributos 0/0/4/0 | Distribuição aceita; Vida 6; M 1; AC 1; 8 pontos de Antecedente |
| PJ-03 | Qualquer Antecedente 3 no nível 1 | Impedir envio no perfil Livro |
| PJ-04 | Soma de antecedentes menor que orçamento | Permitir rascunho, informar pontos restantes |
| PJ-05 | Duas habilidades de profissão | Aceitar |
| PJ-06 | Parrudeza escolhida duas vezes | Duas escolhas consumidas; +4 Vida máxima |
| PJ-07 | Dedo Quente escolhido duas vezes | Rejeitar duplicação no perfil Livro |
| PJ-08 | Sorte dos Covardes com Intelecto 2 | Requisito não atendido; não funcionar |
| PJ-09 | PJ com Sorte dos Covardes aumenta Violência para 3 | Habilidade fica inativa; não apagar aquisição |
| PJ-10 | Revólver na primeira compra | Cobrar 25, não 15 |
| PJ-11 | Compras totalizando 201 | Saldo insuficiente; impedir aprovação padrão |
| PJ-12 | Mochila 9,5 + item de 0,5 | Aceitar; em seguida item de 0,5 excede capacidade |
| PJ-13 | 4 armas prontas + 1 faca | Aceitar se suportes válidos; quinta arma extra exige armazenamento |
| PJ-14 | Três bandoleiras equipadas | Excede limite de duas |
| PJ-15 | Sobretudo protetor | Defesa continua 5; redução/durabilidade e −1 AC mínimo 1 |
| PJ-16 | Montaria com Potência 1, Resistência 2 | Vida 8, Dor 6, Fidelidade 0, 10 m/M |
| PJ-17 | Concluir passo 6 antes dos restantes | Rejeitar, exceto modificação legítima da trilha devidamente registrada |
| PJ-18 | Ambição: passo 4 como primeira realização | Rejeitar |
| PJ-19 | Reprocessar conclusão de redenção | Não duplicar Vida, habilidade ou carta de iniciativa |
| PJ-20 | Subir para nível 5 | Vida e atributo; nenhuma habilidade por esse nível |
| PJ-21 | Biografia “sou rico e tenho um canhão” | Narrativa não concede saldo nem arma automaticamente |
| PJ-22 | Habilidade Roubo de Sina em PJ | Rejeitar no perfil Livro: exclusiva de vilão NPC |
| PJ-23 | Faca com Ataque Sacana nível 1 em surpresa | Preservar dano 3 D e adicional 1 V; não somar como 4 V |
| PJ-24 | Texto livre “ex-padre que busca redenção” | Aceitar conceito sem exigir uma classe |

## 13. Registro de lacunas do criador

Não são dificuldades de leitura: são ausências ou divergências observadas no PDF. O Documento 2 amplia as decisões de combate e campanha.

| ID | Tema e fonte | Tratamento |
|---|---|---|
| C01 | Cavalo inicial e orçamento, pp. 50, 52, 55 | Não oferecer cavalo grátis; registrar aquisição ou concessão |
| C02 | 15 espaços da montaria versus bolsa +10, pp. 52, 55 | Juiz define relação; não somar 25 sem decisão |
| C03 | Bandoleira 12 ilustrado versus 24 textual, p. 53 | Preferência sugerida pelo texto, com divergência visível |
| C04 | Limite de facas/dinamites sem quantidade, p. 52 | Não inventar teto; usar espaço e decisão contextual |
| C05 | Espaços não numéricos/ausentes, pp. 52–64 | Conservar original; resolver apenas item em uso |
| C06 | Preços invertidos e duplicatas de produto, pp. 61–64 | Variantes e normalização explícitas |
| C07 | Desconto inicial de Sorrisão, pp. 40, 52 | Máximo inicial sem desconto é interpretação sugerida |
| C08 | Derringer 1 ou 2 balas, p. 58 | Resolver capacidade antes de automatizar disparos |
| C09 | XP acumulado/custo, p. 49 | Escolha explícita de política |
| C10 | Ganho de Vida e alteração de Físico, pp. 28, 49 | Histórico de ganhos; definir ordem/retroatividade |
| C11 | Perda de Intelecto/Antecedentes, pp. 29, 87 | Não apagar distribuições automaticamente |
| C12 | Usos de Cuspe e Cola, p. 39 | Definir unidade de uso e cura por ativação |
| C13 | Duração/combinações de habilidades, pp. 35–40 | Efeito contextual; não extrapolar sem decisão |
| C14 | Queda/subida de Fidelidade, p. 51 | Evitar reaplicar concessões repetidamente |
| C15 | Habilidades sem verbete em NPCs, pp. 262–263 | Não adicionar ao catálogo de PJ |
| C16 | Equipamento/proteções acumuláveis, pp. 52–65 | Não conceder capacidade/redução infinita |
| C17 | Arco longo e penalidade montaria estranha, pp. 37, 39 | Referências sem parametrização completa |
| C18 | Repetição de redenção, pp. 43, 46 | Nova história permitida; recompensas posteriores requerem política |

## 14. Critério de conclusão da área

A área estará pronta quando conseguir criar uma ficha válida, explicar os cálculos, preservar narrativa livre, carregar todos os catálogos acima, mostrar escolhas que dependem do Juiz e enviar a mesma ficha para a partida sem duplicar regras. Os casos de aceitação são cenários propostos para o desenvolvedor verificar; **não representam testes executados em uma plataforma existente**.

O Documento 1 concentra o catálogo compartilhado de PJ e equipamento; o Documento 2 governa o uso desses dados na sessão. Ambos devem usar uma única versão de regras, sem dois conjuntos independentes de fórmulas.
