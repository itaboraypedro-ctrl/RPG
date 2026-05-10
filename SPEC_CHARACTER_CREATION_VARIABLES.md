# SPEC_CHARACTER_CREATION_VARIABLES.md
## Arcana — Mapeamento Completo de Variáveis para Criação de Personagem
**Fonte:** Livro do Jogador D&D 5e (PT-BR) — pasta `/mnt/user-data/uploads/`
**Objetivo:** Listar todos os grupos de variáveis que um personagem possui, separar em **3 categorias de uso** (visual, mecânica, inventário) e propor o fluxo do wizard.

---

## 1. AS 3 CATEGORIAS DE VARIÁVEIS

Toda variável do personagem cai em UMA dessas categorias. Isso resolve a confusão de "o que é visual, o que é estatística, o que é item":

### 🎨 VISUAL — vai para o prompt do ChatGPT (gera imagem)
Variáveis que **mudam a aparência** do personagem na arte. Vão direto para o prompt que gera a imagem no ChatGPT.

### ⚙️ MECÂNICA — vai para a ficha (números, regras, traços)
Variáveis que **afetam o jogo** mas não aparecem na arte. São os números da ficha: pontos de vida, atributos, perícias, magias conhecidas. Aparecem no painel de status, nunca no avatar.

### 🎒 INVENTÁRIO — itens que ele carrega
**Objetos físicos** que o personagem possui. Podem ou não estar visíveis na arte (depende de estar equipado). Ficam na grade de inventário 6×5 + slots de equipamento que você já tem.

---

## 2. MAPEAMENTO COMPLETO DAS VARIÁVEIS

### 2.1 IDENTIDADE BÁSICA
| Variável | Categoria | Onde vai |
|---|---|---|
| Nome | 🎨 + ⚙️ | Topo da ficha |
| Sexo | 🎨 | Prompt: "male/female warrior..." |
| Idade | 🎨 | Prompt: "young/middle-aged/old" |
| Altura | ⚙️ | Ficha (regra: 1,42m + 6d10cm para humano, etc.) |
| Peso | ⚙️ | Ficha |
| Tendência (Lawful Good, Chaotic Neutral, etc.) | ⚙️ | Ficha |

### 2.2 RAÇA — `🎨 + ⚙️ + 🎒`
Cada raça tem 3 facetas:

**Visual (vai pro ChatGPT):**
- Aparência física (pele, cabelo, traços faciais — varia por raça)
- Tamanho (Pequeno/Médio)
- Marcadores raciais (barba para anão macho, orelhas pontudas para elfo, escamas para draconato, chifres para tiefling)

**Mecânica (vai pra ficha):**
- Aprimoramento de valor de habilidade (+2 Força para Anão da Montanha, etc.)
- Deslocamento base (7,5m para anões; 9m para humanos/elfos)
- Idiomas conhecidos (Comum + Anão, Comum + Élfico, etc.)
- Traços raciais especiais (Visão no Escuro, Resistência Anã, Ancestralidade Dracônica, Sortudo Halfling, etc.)

**Inventário (algumas raças dão item inicial):**
- Não aplicável diretamente (raça não dá itens, mas DEFINE proficiências de armas — Anões podem usar machados de batalha mesmo sem ser guerreiro, por exemplo).

**As 9 raças do PHB:**
1. **Anão** (sub-raças: da Colina, da Montanha)
2. **Elfo** (sub-raças: Alto, da Floresta, Drow)
3. **Halfling** (sub-raças: Pés-leves, Robusto)
4. **Humano** (variantes: padrão, alternativo)
5. **Draconato** (10 ancestralidades dracônicas — cor da escama)
6. **Gnomo** (sub-raças: da Floresta, das Rochas)
7. **Meio-Elfo**
8. **Meio-Orc**
9. **Tiefling**

### 2.3 CLASSE — `🎨 + ⚙️ + 🎒`
A classe é o que **mais define visual e mecânica juntos**.

**Visual (pro ChatGPT):**
- Estética geral ("plate-armored knight", "robed mage with staff", "leather-clad rogue")
- Arma característica (machado para bárbaro, espada longa para guerreiro, varinha para mago)
- Símbolo (símbolo sagrado para clérigo/paladino, foco arcano para mago, foco druídico para druida)

**Mecânica (ficha):**
- Dado de Vida (d6 a d12)
- Pontos de Vida iniciais (máximo do dado + mod Constituição)
- Atributos primários (Força para guerreiro, Inteligência para mago)
- Proficiências em testes de resistência (2 atributos)
- Proficiências em armaduras (leves/médias/pesadas/escudos)
- Proficiências em armas (simples, marciais, ou lista específica)
- Proficiências em perícias (escolher N de uma lista)
- Características de classe (Fúria do bárbaro, Inspiração Bárdica, Conjuração de magias, Ataque Furtivo, etc.)
- Caminho/Subclasse (começa no nível 2 ou 3 dependendo da classe)

**Inventário (kit inicial — escolha entre opções):**
Cada classe tem um bloco "(a) ou (b) ou (c)" com 4-5 escolhas. Exemplo Bárbaro:
- (a) machado grande **OU** (b) qualquer arma marcial corpo-a-corpo
- (a) duas machadinhas **OU** (b) qualquer arma simples
- Pacote de Aventureiro
- 4 azagaias

**As 12 classes do PHB:**
| Classe | Dado | Atributo Principal | Estética visual |
|---|---|---|---|
| Bárbaro | d12 | Força | Selvagem, peles, machado, sem armadura ou couro |
| Bardo | d8 | Carisma | Elegante, instrumento musical, roupa colorida |
| Bruxo | d8 | Carisma | Sombrio, tomos arcanos, símbolos do patrono |
| Clérigo | d8 | Sabedoria | Armadura média, símbolo sagrado, vestes religiosas |
| Druida | d8 | Sabedoria | Naturalista, peles/folhas, cajado de madeira, sem metal |
| Feiticeiro | d6 | Carisma | Místico, marcas mágicas no corpo, pouco equipamento |
| Guerreiro | d10 | Força ou Destreza | Armadura completa, espada, escudo (clássico) |
| Ladino | d8 | Destreza | Furtivo, couro escuro, capuz, adagas, ferramentas de ladrão |
| Mago | d6 | Inteligência | Robe, varinha/cajado, grimório, barba (clássico) |
| Monge | d8 | Destreza + Sabedoria | Vestes simples, sem armadura, postura marcial |
| Paladino | d10 | Força + Carisma | Armadura pesada brilhante, símbolo sagrado, espada longa |
| Patrulheiro | d10 | Destreza + Sabedoria | Caçador, capa verde, arco, animal companheiro |

### 2.4 ATRIBUTOS — `⚙️ apenas`
Os 6 atributos clássicos. Aparecem na ficha, não na imagem.

| Atributo | O que afeta |
|---|---|
| Força (FOR) | Atletismo, dano corpo-a-corpo, capacidade de carga |
| Destreza (DES) | Iniciativa, CA, esquiva, furtividade, ataques à distância |
| Constituição (CON) | Pontos de vida, resistência |
| Inteligência (INT) | Magia arcana (mago), conhecimento, investigação |
| Sabedoria (SAB) | Magia divina (clérigo, druida, ranger), percepção, intuição |
| Carisma (CAR) | Magia pacto/inata (bardo, bruxo, feiticeiro, paladino), persuasão |

**Como definir os valores (escolher um método):**
- Compra de pontos (27 pontos para distribuir, mais simples para iniciantes)
- Array padrão (15, 14, 13, 12, 10, 8 — distribuir pelos 6 atributos)
- Rolagem (4d6 mantendo os 3 maiores, 6 vezes)

Modificador = `(atributo - 10) / 2` arredondado para baixo.

### 2.5 ANTECEDENTE — `⚙️ + 🎒` (e às vezes 🎨)
Define a história prévia do personagem, suas conexões sociais e itens iniciais extras.

**Mecânica:**
- 2 perícias treinadas extras
- 0-2 idiomas adicionais ou ferramentas
- Característica especial (ex: Acólito tem santuário disponível em qualquer templo de sua fé)
- 4 elementos de roleplay: traço de personalidade, ideal, vínculo, defeito

**Inventário:**
- Itens iniciais únicos por antecedente
- Ex: Acólito → Símbolo sagrado, livro de orações, roupas de monge, bolsa com 15 po
- Ex: Soldado → Insígnia de patente, troféu de inimigo, dados, roupas comuns, bolsa com 10 po

**Visual (parcial):**
- Em alguns casos pode influenciar a vestimenta (Nobre = roupas finas, Eremita = manto simples, Marinheiro = roupas surradas)

**Os 13 antecedentes do PHB:**
1. Acólito 2. Artesão de Guilda 3. Artista 4. Charlatão 5. Criminoso/Espião
6. Eremita 7. Forasteiro 8. Herói do Povo 9. Marinheiro 10. Nobre
11. Órfão 12. Sábio 13. Soldado

### 2.6 MAGIAS / ATAQUES — `⚙️ + 🎒` (e às vezes 🎨)
Apenas para classes conjuradoras (Bardo, Bruxo, Clérigo, Druida, Feiticeiro, Mago, Paladino do nível 2+, Patrulheiro do nível 2+).

**Mecânica (ficha):**
- Truques conhecidos (cantrips — magia de nível 0, ilimitadas)
- Magias conhecidas/preparadas (limite por classe e nível)
- Espaços de magia por nível (slots)
- CD para resistir às suas magias = 8 + bônus proficiência + mod do atributo conjurador

**Visual (algumas afetam a arte):**
- Foco arcano visível (varinha, cajado, orbe, cristal) — vai pro prompt do ChatGPT
- Marcas mágicas no corpo (feiticeiros têm linhagem dracônica visível, etc.)

**Inventário:**
- Grimório (mago) — é um item físico que vai no inventário
- Bolsa de componentes
- Foco de conjuração

### 2.7 EQUIPAMENTO INICIAL DETALHADO — `🎒 + 🎨` (se equipado)

**Tabelas mestras do livro (para o wizard usar):**

#### Armaduras (do livro, p. 147)
| Tipo | Nome | CA | Preço | Peso |
|---|---|---|---|---|
| Leve | Acolchoada | 11 + DES | 5 po | 4 kg |
| Leve | Couro | 11 + DES | 10 po | 5 kg |
| Leve | Couro Batido | 12 + DES | 45 po | 6,5 kg |
| Média | Gibão de Peles | 12 + DES (max +2) | 10 po | 6 kg |
| Média | Camisão de Malha | 13 + DES (max +2) | 30 po | 10 kg |
| Média | Brunea | 14 + DES (max +2) | 50 po | 22,5 kg |
| Média | Peitoral | 14 + DES (max +2) | 400 po | 10 kg |
| Média | Meia-Armadura | 15 + DES (max +2) | 750 po | 20 kg |
| Pesada | Cota de Anéis | 14 | 30 po | 20 kg |
| Pesada | Cota de Malha | 16 | 75 po | 27,5 kg |
| Pesada | Cota de Talas | 17 | 200 po | 30 kg |
| Pesada | Placas | 18 | 1.500 po | 32,5 kg |
| Escudo | Escudo | +2 | 10 po | 3 kg |

#### Armas (do livro, p. 151)
**Simples corpo-a-corpo:** Adaga, Azagaia, Bordão, Clava Grande, Foice Curta, Lança, Maça, Machadinha, Martelo Leve, Porrete
**Simples à distância:** Arco Curto, Besta Leve, Dardo, Funda
**Marciais corpo-a-corpo:** Alabarda, Cimitarra, Chicote, Espada Curta, Espada Grande, Espada Longa, Glaive, Lança de Montaria, Lança Longa, Maça Estrela, Machado Grande, Machado de Batalha, Malho, Mangual, Martelo de Guerra, Picareta de Guerra, Rapieira, Tridente
**Marciais à distância:** Arco Longo, Besta de Mão, Besta Pesada, Rede, Zarabatana

Cada arma tem: dano (ex: 1d8 cortante), peso, propriedades (Acuidade, Alcance, Arremesso, Duas Mãos, Leve, Munição, Pesada, Versátil etc.)

#### Pacotes de equipamento (kits prontos — p. 153)
- **Pacote de Artista** (40 po) — fantasias, kit de disfarce, velas, rações
- **Pacote de Assaltante** (16 po) — esferas, sino, pé de cabra, pítons, lanterna
- **Pacote de Aventureiro** (12 po) — pé de cabra, martelo, pítons, tochas, rações
- **Pacote de Diplomata** (39 po) — baú, mapas, tinta, perfume, sabão
- **Pacote de Estudioso** (40 po) — livro, tinta, pergaminho, areia, faca
- **Pacote de Explorador** (10 po) — saco de dormir, kit de refeição, tochas, rações
- **Pacote de Sacerdote** (19 po) — velas, esmolas, incenso, vestes

---

## 3. PROPOSTA DE WIZARD — FLUXO

Wizard de **6 etapas** dividido entre VISUAL e FICHA:

### **Etapa 1 — Identidade básica** (⚙️ + base)
Nome do personagem · Sexo · Idade aproximada
→ *Nada visual ainda, só dados base.*

### **Etapa 2 — Raça** (🎨 + ⚙️)
Grid visual com cards das 9 raças. Click expande sub-raças.
**Output da etapa:**
- Race + sub-race salvos no DB
- Bônus de atributo aplicado
- Idiomas adicionados
- Traços raciais salvos (Visão no Escuro, etc.)

### **Etapa 3 — Classe** (⚙️ + 🎒 + 🎨)
Grid visual com cards das 12 classes. Mostra estética curta + arma característica.
**Output da etapa:**
- Class salva
- Dado de vida aplicado (HP máximo do d6/d8/d10/d12 + mod CON)
- Proficiências aplicadas
- **Equipamento inicial — sub-wizard de escolhas:**
  - "(a) machado grande **OU** (b) outra arma marcial corpo-a-corpo"
  - Cada escolha entra no inventário/equipamento

### **Etapa 4 — Atributos** (⚙️)
Tela com sliders ou compra de pontos.
- Método 1: Array padrão (15, 14, 13, 12, 10, 8) — distribuir
- Método 2: Compra de pontos (27 pts)
- Método 3: Rolar 4d6 (gera valores aleatórios)

### **Etapa 5 — Antecedente** (⚙️ + 🎒)
Lista dos 13 antecedentes em cards. Cada um mostra: perícias extras + itens iniciais + sugestão de roleplay.
**Output:**
- 2 perícias extras
- Itens do antecedente vão pro inventário
- 4 traços de roleplay (traço/ideal/vínculo/defeito) — preencher com sugestões ou texto livre

### **Etapa 6 — Aparência visual + ChatGPT** (🎨)
Aqui entra o **fluxo de imagem** que você descreveu:

**6.1 — Foto do rosto**
Upload de foto (opcional). Se não enviar, ChatGPT inventa um rosto baseado em raça/sexo/idade.

**6.2 — Vestimenta** (texto livre + sugestões)
Sugestões pré-prontas baseadas na classe:
- Mago → "robe azul-marinho com bordados dourados"
- Bárbaro → "peles de urso, taparrabos de couro"
- Paladino → "armadura de placas brilhante, manto branco"
Output → input de texto editável.

**6.3 — Prompt final montado pelo sistema:**
```
[sex] [age] [race] [class] character, [appearance from race traits],
wearing [outfit description from 6.2],
holding [main weapon from inventory equipped],
[focus item if caster — staff, wand, holy symbol],
fantasy art style, cinematic lighting,
[face reference from photo if uploaded]
```

**6.4 — Geração da imagem**
ChatGPT (DALL-E ou similar) gera. Se o jogador não gostar, pode regenerar com ajustes (mantendo rosto consistente).

**6.5 — Imagem salva em `characters.avatar_url`**

### **Etapa 7 — Magias e ataques (apenas se classe conjuradora)** (⚙️ + 🎒)
Aparece só para Bardo, Bruxo, Clérigo, Druida, Feiticeiro, Mago, Paladino, Patrulheiro.

- Truques conhecidos: escolher N (varia por classe)
- Magias de 1º nível: escolher N
- Output → array de magias na ficha

### **Etapa 8 — Revisão e finalização**
Mostra ficha completa + avatar gerado. Botão "Criar personagem" salva tudo no DB.

---

## 4. ESTRUTURA NO BANCO (alinhar com `lib/types.ts`)

A tabela `characters` já tem os campos certos. Mapeamento:

```typescript
{
  // 1. Identidade
  name: string,                      // Etapa 1
  // sex e age vão em backstory (texto livre)

  // 2. Raça
  race: string,                       // "Anão" + sub-raça
  // traços raciais → guardar em skills (jsonb) ou criar campo race_traits

  // 3. Classe
  class: string,                      // "Guerreiro"
  level: number,                      // 1
  hp / max_hp / temp_hp,             // calculado de classe + CON
  // proficiências → skills jsonb

  // 4. Atributos
  stats: { str, dex, con, int, wis, cha },  // CharacterStats

  // 5. Antecedente
  // adicionar campo background?: string

  // 6. Visual
  avatar_url: string | null,         // gerada na etapa 6
  // backstory: string                  // texto da história

  // 7. Magias
  spells: [],                         // array jsonb existente

  // 8. Inventário
  inventory: [],                      // grade 6×5 + equipados
  ac: number,                         // calculado da armadura equipada
  speed: number,                      // da raça
  initiative: number,                 // mod DES
  gold: number,                       // riqueza inicial
}
```

**Possíveis campos novos a adicionar:**
- `background: string` — antecedente (Acólito, Soldado...)
- `subrace: string` — sub-raça
- `alignment: string` — tendência
- `personality: { trait, ideal, bond, flaw }` — 4 traços de roleplay
- `race_traits: jsonb` — Visão no Escuro, Sortudo, Ancestralidade Dracônica, etc.
- `class_features: jsonb` — Fúria, Inspiração Bárdica, Ataque Furtivo, etc.

---

## 5. RESUMO EXECUTIVO

**As 3 categorias claras:**
- 🎨 **VISUAL** → vai pro ChatGPT: raça (aparência), sexo, idade, classe (estética), arma equipada, foco mágico, vestimenta descrita
- ⚙️ **MECÂNICA** → fica na ficha: atributos, HP, CA, proficiências, traços raciais, características de classe, magias conhecidas, antecedente, idiomas
- 🎒 **INVENTÁRIO** → grade do personagem: armas, armaduras, escudos, focos, kits, itens do antecedente, ouro

**O wizard precisa de 8 etapas** mas pode ser comprimido em 6 visíveis (as etapas 4 e 7 podem ser sub-fluxos das anteriores).

**Para o fluxo do ChatGPT (etapa 6):** o prompt final é gerado pelo sistema combinando dados das etapas 1+2+3 (sexo, raça, classe, arma equipada) + texto livre da etapa 6.2 (vestimenta). Para preservar o rosto entre regenerações, usar a foto enviada como reference image em todas as gerações.

**Próximo passo recomendado:** criar `SPEC_CHARACTER_CREATION_WIZARD.md` que detalha cada uma das 8 etapas como UI/UX, com componentes, validações e queries do banco — mas só depois de você aprovar este mapeamento.
