# SPEC_CHARACTER_CREATION_WIZARD.md
## Arcana — Wizard de Criação Progressiva (Estilo Videogame)
**Inspiração:** Skyrim, Elden Ring, Baldur's Gate 3 — boneco em base, depois vai sendo vestido
**Objetivo:** Jogador vê o personagem nascer e evoluir em tempo real, escolha por escolha

---

## 1. PRINCÍPIO CENTRAL

**A imagem NUNCA está vazia.** Desde a primeira escolha, o jogador vê seu personagem na tela. Cada nova decisão **adiciona camada visual** ao boneco.

### Linha do tempo do que aparece na tela:
```
Etapa 1 → Silhueta neutra (placeholder)
Etapa 2 → Corpo do personagem (raça/sexo) em roupa íntima
Etapa 3 → + traje básico da classe (sem armadura ainda)
Etapa 4 → (sem mudança visual)
Etapa 5 → + detalhes do antecedente (cicatriz, marca, acessório)
Etapa 6 → + armadura/roupa customizada + arma
Etapa 7 → + foco mágico (se conjurador)
Etapa 8 → personagem completo
```

---

## 2. LAYOUT GERAL DO WIZARD

Tela dividida em 2 colunas no desktop, 1 no mobile com toggle:

```
┌─────────────────────────────────┬─────────────────────────┐
│                                 │                         │
│   FORMULÁRIO DA ETAPA           │   PREVIEW DO BONECO     │
│   (input fields, escolhas)      │   (imagem gerada)       │
│                                 │                         │
│   ━━━━━━━━━━━━━━                │   [imagem do char]      │
│   Etapa 2 de 8                  │                         │
│   Raça                          │   "Eldrin, Elfo"        │
│                                 │                         │
│   [Anão] [Elfo] [Halfling]...   │   Última atualização:   │
│                                 │   etapa 2 — Raça        │
│                                 │                         │
│   [← Voltar]    [Próximo →]     │   [🔄 Regerar imagem]   │
└─────────────────────────────────┴─────────────────────────┘
```

**Mobile:** botão sticky "Ver personagem" abre overlay com a imagem.

---

## 3. ETAPAS DETALHADAS

### **ETAPA 1 — Identidade Básica** (sem imagem ainda)
**Input:**
- Nome do personagem
- Sexo (Masculino / Feminino / Andrógino)
- Idade (slider: Jovem / Adulto / Maduro / Ancião)

**Visual da preview:**
Silhueta cinza neutra com texto "Aguardando sua escolha de raça..."

**Sem chamada de API.** Custo: $0

---

### **ETAPA 2 — Raça** 🎨 PRIMEIRA GERAÇÃO
**Input:**
- Grid de cards das 9 raças
- Click expande sub-raças (Anão da Colina/Montanha, Elfo Alto/Floresta/Drow, etc.)

**Visual da preview — gera AUTOMATICAMENTE ao escolher:**
Prompt enviado ao ChatGPT/DALL-E:
```
[sex] [age] [race] character, [racial features],
wearing only basic undergarments (simple cloth tunic and shorts),
neutral standing pose, plain dark background,
fantasy illustration style, full body shot,
[face: based on uploaded photo OR randomly generated]
```

**Exemplos:**
- Anão da Montanha + Masc + Adulto:
  > "male adult dwarf character, stocky build, long braided red beard, ruddy skin, wearing only a simple linen undershirt and brown shorts, neutral pose, dark plain background, fantasy art style, full body"

- Elfa da Floresta + Fem + Jovem:
  > "young female wood elf character, slender, pointed ears, almond-shaped green eyes, copper hair in a braid, wearing only basic cloth chemise, neutral pose, dark plain background, fantasy art style, full body"

**Característica chave:** o boneco está **em roupa íntima/base** — pronto pra receber roupas e armaduras nas próximas etapas.

**API call:** 1 imagem gerada (~10s, ~$0.04)

**Cache:** se o jogador volta e troca a raça, regera. Se mantém, não regera.

---

### **ETAPA 3 — Classe** 🎨 SEGUNDA GERAÇÃO
**Input:**
- Grid de cards das 12 classes
- Cada card mostra: ícone, dado de vida, atributo principal, vibe estética curta

**Visual da preview — REGERA com nova camada:**
Prompt acumula os dados anteriores:
```
[sex] [age] [race] [class] character, [racial features],
wearing CLASS BASIC ATTIRE: [class-specific outfit],
[class-specific aura/posture],
holding [class basic weapon],
neutral standing pose, plain dark background,
fantasy illustration style, full body shot,
[face reference from previous generation]
```

**Atire básica por classe** (definida pelo sistema):
| Classe | Atire básica nesta etapa |
|---|---|
| Bárbaro | "tribal hide vest, fur-lined boots, leather wraps" |
| Bardo | "colorful traveling clothes, simple lute on back" |
| Bruxo | "dark hooded cloak, mysterious robes" |
| Clérigo | "simple religious vestments, holy symbol pendant" |
| Druida | "natural fiber robes, leaves and wood accessories" |
| Feiticeiro | "ornate but worn robes, faint magical marks visible" |
| Guerreiro | "leather gambeson, simple soldier's tunic" |
| Ladino | "dark leather outfit, hooded cloak, hidden daggers" |
| Mago | "scholarly robes, simple cloth belt, satchel" |
| Monge | "loose-fitting monk's robes, no shoes" |
| Paladino | "white tunic with religious sigil, traveling cape" |
| Patrulheiro | "green forest cloak, leather vest, longbow on back" |

**Importante:** ainda **sem armadura completa**. A armadura vem na etapa 6, depois que ele escolhe o equipamento.

**API call:** 1 imagem gerada

---

### **ETAPA 4 — Atributos** ⚙️ SEM REGERAR
**Input:**
- 3 métodos de distribuição: Array Padrão / Compra de Pontos / Rolagem
- Sliders ou cards pra distribuir os 6 atributos

**Visual da preview:**
Não muda a imagem (atributos não afetam visual). Pode mostrar uma sutil mudança de **postura** se quiser:
- Força alta → ombros mais largos visíveis
- Destreza alta → postura mais ágil
- Mas isso é polish, não essencial.

**API call:** 0 (sem regeração)

---

### **ETAPA 5 — Antecedente** 🎨 (REGERAÇÃO OPCIONAL)
**Input:**
- 13 cards de antecedente (Acólito, Soldado, Sábio, etc.)
- Mostra: perícias extras, itens iniciais, sugestão de roleplay

**Visual da preview — REGERA com detalhes sutis:**
O antecedente adiciona **detalhes finos** ao personagem:
- Soldado → cicatriz no rosto, postura militar
- Acólito → símbolo religioso visível, expressão serena
- Criminoso → expressão astuta, marca de fugitivo
- Nobre → joia ou anel discreto
- Marinheiro → tatuagem náutica visível
- Eremita → barba/cabelo desgrenhado

Prompt acumula:
```
[anterior] + [background detail: scar / pendant / tattoo / etc.]
```

**Decisão de UX:** essa regeração é opcional pelo botão "🔄 Atualizar visual" — se o jogador quiser pular pra próxima etapa, mantém a imagem da etapa 3.

**API call:** 0 ou 1 (escolha do jogador)

---

### **ETAPA 6 — Equipamento + Customização Visual** 🎨 GERAÇÃO PRINCIPAL
**Esta é a etapa estrela.** Aqui o jogador **veste o personagem** de fato.

**Sub-etapa 6.1 — Escolhas mecânicas (kit inicial da classe)**
Aparece o sub-wizard "(a) ou (b) ou (c)" do livro:
- Bárbaro: "(a) machado grande **OU** (b) outra arma marcial corpo-a-corpo"
- Cada escolha entra no inventário

**Sub-etapa 6.2 — Customização visual (texto livre + sugestões)**
Aqui o jogador descreve como quer que fique:

**Campo: "Como seu personagem se veste?"**
Sugestões clicáveis baseadas em classe + antecedente:
- "armadura de placas brilhante com manto vermelho"
- "robe azul-marinho com bordados dourados estelares"
- "couro batido escuro, capuz puxado"

**Campo: "Detalhes adicionais"**
Texto livre: cicatrizes, joias, tatuagens, expressão, pose

**Sub-etapa 6.3 — Arma e foco**
Mostra a(s) arma(s) escolhidas em 6.1 → jogador descreve como elas são:
- "espada longa de aço com punho de couro vermelho"
- "cajado de madeira torcida com cristal azul no topo"

**Visual da preview — REGERA com tudo:**
```
[sex] [age] [race] [class] character, [racial features], [background details],
wearing [outfit description from 6.2],
[additional details from 6.2],
holding [weapon description from 6.3],
[focus item if caster — staff/wand/holy symbol description],
heroic pose, dramatic lighting,
fantasy illustration style, full body shot,
[face reference from previous]
```

**Botão "Regenerar"** — pode regerar quantas vezes quiser. Cada regeração mostra v1, v2, v3... e o jogador escolhe a melhor.

**API call:** 1 a 5 imagens (média: 2-3)

---

### **ETAPA 7 — Magias (apenas conjuradores)** ⚙️
Só aparece pra Bardo, Bruxo, Clérigo, Druida, Feiticeiro, Mago, Paladino, Patrulheiro.

**Input:**
- Grid de truques (cantrips) — escolher N
- Grid de magias de 1º nível — escolher N

**Visual:**
Não regera por padrão. Opcional: adicionar **aura mágica** sutil ao redor do personagem se quiser polish.

**API call:** 0 (ou 1 opcional)

---

### **ETAPA 8 — Revisão Final**
Tela dividida:
- **Esquerda:** ficha completa do personagem (todos os números, traços, magias, inventário)
- **Direita:** imagem final gerada na etapa 6

**Botão grande:** "Criar Personagem" → salva no DB e redireciona pro hub.

**API call:** 0

---

## 4. PRESERVAÇÃO DA APARÊNCIA ENTRE GERAÇÕES

Problema: ChatGPT/DALL-E não mantém 100% a cara entre prompts diferentes.

**Estratégias (em ordem de eficácia):**

### Opção A — Foto enviada pelo jogador (MELHOR)
Etapa 1 tem upload opcional de foto. Todas as gerações usam essa foto como referência:
```
[base prompt] + reference image: [uploaded photo URL]
```
Resultado: cara consistente em ~85-95% das gerações.

### Opção B — Descrição facial detalhada
Sistema salva uma descrição rica do rosto após a primeira geração:
```
"face: angular, high cheekbones, deep green eyes, copper hair tied back,
small scar on left brow, fair skin with light freckles"
```
Reusa em todos os prompts seguintes.

### Opção C — Image-to-image (se a API suportar)
Em vez de gerar do zero, modifica a imagem anterior. DALL-E 3 ainda não suporta isso bem, mas SDXL e MidJourney sim.

**Recomendação para MVP:** combinar A + B. Se não tem foto, usa B. Sempre salvar a descrição facial gerada na etapa 2 e reusar.

---

## 5. UX DE LOADING

A geração demora 10-30s. O jogador não pode ficar olhando uma tela em branco.

**Tela de loading:**
- Skeleton do boneco com efeito shimmer
- Texto rotativo: "Conjurando seu personagem...", "Tecendo a essência...", "O destino se manifesta..."
- Progress bar visual
- Permite continuar preenchendo a próxima etapa enquanto a imagem gera

**Race condition:** se o jogador troca de raça antes da imagem da raça anterior chegar, cancela a request anterior (AbortController).

---

## 6. CUSTOS DE API

**Cenário típico (jogador "decidido"):**
- Etapa 2: 1 geração
- Etapa 3: 1 geração
- Etapa 5: 1 geração (opcional)
- Etapa 6: 2 gerações (refinamento)
- **Total: ~5 imagens × $0.04 = $0.20 por personagem**

**Cenário "indecisão" (jogador troca muito):**
- Pode chegar a 10-15 gerações = $0.40-0.60

**Otimização:**
- Cache por chave `{race}+{class}+{sex}+{age}` para preview etapa 2 e 3 (custo: $0 nas re-escolhas comuns)
- Limite no MVP: 8 regerações por personagem (depois cobra ou bloqueia)

---

## 7. ESTRUTURA NO BANCO

Adicionar à tabela `characters`:

```sql
ALTER TABLE characters ADD COLUMN background TEXT;          -- antecedente
ALTER TABLE characters ADD COLUMN subrace TEXT;             -- sub-raça
ALTER TABLE characters ADD COLUMN sex TEXT;
ALTER TABLE characters ADD COLUMN age_category TEXT;        -- young/adult/mature/elder
ALTER TABLE characters ADD COLUMN alignment TEXT;
ALTER TABLE characters ADD COLUMN personality JSONB;        -- {trait, ideal, bond, flaw}
ALTER TABLE characters ADD COLUMN race_traits JSONB;        -- traços raciais
ALTER TABLE characters ADD COLUMN class_features JSONB;     -- características de classe
ALTER TABLE characters ADD COLUMN appearance_description TEXT; -- descrição salva pra reusar nos prompts
ALTER TABLE characters ADD COLUMN reference_photo_url TEXT; -- foto enviada (se houver)
ALTER TABLE characters ADD COLUMN avatar_history JSONB;     -- array com URLs de todas as gerações pra reverter
```

---

## 8. ARQUIVOS A CRIAR/MODIFICAR

```
app/play/characters/new/
├── page.tsx                  ← refatorar wizard atual
└── steps/
    ├── Step1Identity.tsx
    ├── Step2Race.tsx
    ├── Step3Class.tsx
    ├── Step4Stats.tsx
    ├── Step5Background.tsx
    ├── Step6Equipment.tsx
    ├── Step7Spells.tsx
    └── Step8Review.tsx

components/character-creation/
├── CharacterPreview.tsx      ← coluna direita com a imagem
├── PreviewSkeleton.tsx       ← loading shimmer
├── RaceCard.tsx
├── ClassCard.tsx
├── BackgroundCard.tsx
├── StatsDistributor.tsx
└── EquipmentChooser.tsx

app/api/ai/generate-character-image/
└── route.ts                  ← endpoint que chama DALL-E/ChatGPT

lib/character-creation/
├── prompt-builder.ts         ← monta o prompt acumulativo
├── race-data.ts              ← dados das 9 raças (traços, bônus)
├── class-data.ts             ← dados das 12 classes
├── background-data.ts        ← dados dos 13 antecedentes
└── outfit-suggestions.ts     ← sugestões de vestimenta por classe+antecedente
```

---

## 9. RESUMO

**O conceito:** boneco nasce em roupa íntima, vai ganhando classe → antecedente → equipamento → arma → magia. Cada etapa adiciona uma camada visual.

**Vantagens:**
- Jogador engajado (vê resultado cedo)
- Erros corrigidos rapidamente (não preenche 8 etapas pra descobrir que escolheu errado)
- Sensação de criação real (estilo videogame AAA)
- Permite voltar e ajustar sem refazer tudo

**Trade-offs:**
- Mais chamadas de API (custo: $0.20 médio por personagem)
- Mais complexidade no estado do wizard (precisa salvar estado entre etapas)
- Latência da API (10-30s) precisa de bom UX de loading

**Ordem de implementação recomendada:**
1. Estrutura do wizard (8 etapas vazias, navegação)
2. Banco de dados (alterações na tabela)
3. Step 1 + 2 + 3 (identidade, raça, classe) com primeira geração
4. Step 4 + 5 + 7 (mecânicos)
5. Step 6 (equipamento + customização) — mais complexa
6. Step 8 (revisão final)
7. Polish: cache, loading states, preservação facial
