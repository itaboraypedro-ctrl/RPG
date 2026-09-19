# RPG Docs Package — Geração de Regras D&D

Este pacote contém tudo que o Claude Code precisa para gerar os 17 arquivos MD
de documentação das regras D&D do seu sistema de RPG.

## O que está aqui

```
rpg-docs-package/
├── README.md                  ← você está aqui
├── PROMPT_CLAUDE_CODE.md      ← prompt principal para o Claude Code
├── SPEC_RPG_DOCS.md           ← especificação detalhada de cada MD
└── DnD_BasicRules_2018.pdf    ← (você sobe junto — fonte de dados)
```

## Como usar

### 1. Prepare a pasta

```bash
# Crie uma pasta no seu projeto
mkdir -p meu-rpg/docs-generation
cd meu-rpg/docs-generation

# Copie os 3 arquivos deste pacote
cp PROMPT_CLAUDE_CODE.md .
cp SPEC_RPG_DOCS.md .
cp DnD_BasicRules_2018.pdf .   # o PDF que você já tem
```

### 2. Abra o Claude Code

```bash
cd meu-rpg/docs-generation
claude
```

### 3. Cole este prompt de início

```
Leia o arquivo PROMPT_CLAUDE_CODE.md completamente e execute todas as 
instruções nele. Gere os 17 arquivos MD de documentação D&D seguindo 
o SPEC_RPG_DOCS.md. O PDF fonte é DnD_BasicRules_2018.pdf nesta pasta.

Comece com o setup inicial (Passo 0) e siga a ordem indicada.
Não pare até ter todos os 17 arquivos gerados e o relatório final gerado.
```

### 4. Output esperado

O Claude Code vai criar:

```
docs/dnd-rules/
├── INDEX.md
├── part1-character-creation/   (6 arquivos)
├── part2-playing-the-game/     (3 arquivos)
├── part3-magic/                (2 arquivos)
├── part4-dm-tools/             (3 arquivos)
└── appendices/                 (3 arquivos)
```

**Total:** ~17 MDs, estimativa de 8.000–12.000 linhas de documentação.

## Estimativa de Tempo

O Claude Code gera em sequência. Estimativa por arquivo:
- Pequenos (appendices, customization): 2–5 min cada
- Médios (combat, ability scores, etc.): 5–10 min cada  
- Grandes (classes, backgrounds, equipment): 10–15 min cada
- Muito grandes (spells, monsters): 15–25 min cada

**Total estimado: 2–4 horas de execução contínua.**

## Se o Claude Code parar no meio

Ele salva incrementalmente. Para retomar:

```
Verifique quais arquivos já foram gerados em docs/dnd-rules/.
Continue a partir do próximo arquivo na lista do Passo 3 do PROMPT_CLAUDE_CODE.md.
```

## Integração com seu sistema (Next.js + Supabase)

Após gerados, os MDs ficam em `docs/dnd-rules/`. Para consumir no sistema:

```typescript
// Exemplo: carregar regras de combat no Next.js
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export function getCombatRules() {
  const filePath = path.join(process.cwd(), 'docs/dnd-rules/part2-playing-the-game/09-combat.md')
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const { data: frontmatter, content } = matter(fileContent)
  return { frontmatter, content }
}
```

Para search full-text nas regras, considere indexar no Supabase com `tsvector`
ou usar um parser de Markdown + embeddings para busca semântica.
