# PROMPT — Claude Code: Geração de Documentação D&D RPG

## Contexto

Você vai gerar **17 arquivos Markdown** de documentação completa das regras do D&D 5e.
Esses arquivos são a fonte de verdade para um sistema de RPG em desenvolvimento (Next.js + Supabase).

**Arquivos disponíveis nesta pasta:**
- `DnD_BasicRules_2018.pdf` — fonte primária (180 páginas)
- `SPEC_RPG_DOCS.md` — especificação completa de cada arquivo a gerar

---

## Sua Missão

Gerar todos os 17 MDs com profundidade total, sem omissão, seguindo o SPEC exatamente.

---

## Passo 0: Setup Inicial (rodar uma vez)

```bash
# Instalar dependências de leitura de PDF
pip install pdfplumber pypdf --break-system-packages --quiet

# Criar estrutura de pastas
mkdir -p docs/dnd-rules/part1-character-creation
mkdir -p docs/dnd-rules/part2-playing-the-game
mkdir -p docs/dnd-rules/part3-magic
mkdir -p docs/dnd-rules/part4-dm-tools
mkdir -p docs/dnd-rules/appendices

# Extrair texto completo do PDF preservando layout
pdftotext -layout DnD_BasicRules_2018.pdf /tmp/dnd_full.txt
echo "PDF extraído: $(wc -l < /tmp/dnd_full.txt) linhas"
```

---

## Passo 1: Ler o SPEC completo

Antes de qualquer coisa, leia o `SPEC_RPG_DOCS.md` na íntegra. Ele define:
- Qual faixa de páginas do PDF corresponde a cada MD
- O conteúdo obrigatório de cada arquivo
- Os formatos e templates a usar
- As regras de qualidade

---

## Passo 2: Extrair e processar cada capítulo

Use este script Python para extrair o texto de cada faixa de páginas:

```python
import subprocess

def extract_pages(pdf_path, start_page, end_page, output_file):
    """Extrai páginas específicas do PDF como texto."""
    subprocess.run([
        'pdftotext', '-layout',
        '-f', str(start_page),
        '-l', str(end_page),
        pdf_path,
        output_file
    ])
    with open(output_file, 'r') as f:
        return f.read()

# Mapa de capítulos → páginas do PDF
CHAPTERS = {
    '01-character-creation-steps': (7, 11),
    '02-races': (12, 20),
    '03-classes': (21, 33),
    '04-backgrounds': (34, 43),
    '05-equipment': (44, 56),
    '06-customization': (57, 58),
    '07-ability-scores': (59, 64),
    '08-adventuring': (65, 70),
    '09-combat': (71, 79),
    '10-spellcasting-rules': (81, 84),
    '11-spells': (85, 107),
    '12-monsters': (109, 163),
    '13-encounter-building': (164, 166),
    '14-magic-items': (167, 169),
    'appendix-a-conditions': (170, 171),
    'appendix-b-gods': (172, 173),
    'appendix-c-factions': (174, 176),
}

# Para cada capítulo, extrair e salvar o texto bruto
for chapter, (start, end) in CHAPTERS.items():
    text = extract_pages('DnD_BasicRules_2018.pdf', start, end, f'/tmp/{chapter}_raw.txt')
    print(f"✓ {chapter}: {len(text):,} chars extraídos (págs {start}-{end})")
```

---

## Passo 3: Geração dos MDs — Ordem e Destinos

Gere nesta ordem (do mais simples ao mais complexo):

| # | Arquivo | Destino | Páginas | Estimativa |
|---|---------|---------|---------|------------|
| 1 | appendix-a-conditions.md | `appendices/` | 170–171 | Pequeno |
| 2 | appendix-c-factions.md | `appendices/` | 174–176 | Pequeno |
| 3 | appendix-b-gods.md | `appendices/` | 172–173 | Pequeno |
| 4 | 06-customization.md | `part1-character-creation/` | 57–58 | Pequeno |
| 5 | 13-encounter-building.md | `part4-dm-tools/` | 164–166 | Médio |
| 6 | 10-spellcasting-rules.md | `part3-magic/` | 81–84 | Médio |
| 7 | 14-magic-items.md | `part4-dm-tools/` | 167–169 | Médio |
| 8 | 08-adventuring.md | `part2-playing-the-game/` | 65–70 | Médio |
| 9 | 07-ability-scores.md | `part2-playing-the-game/` | 59–64 | Médio |
| 10 | 01-character-creation-steps.md | `part1-character-creation/` | 7–11 | Médio |
| 11 | 02-races.md | `part1-character-creation/` | 12–20 | Grande |
| 12 | 04-backgrounds.md | `part1-character-creation/` | 34–43 | Grande |
| 13 | 09-combat.md | `part2-playing-the-game/` | 71–79 | Grande |
| 14 | 05-equipment.md | `part1-character-creation/` | 44–56 | Grande |
| 15 | 03-classes.md | `part1-character-creation/` | 21–33 | Grande |
| 16 | 11-spells.md | `part3-magic/` | 85–107 | Muito Grande |
| 17 | 12-monsters.md | `part4-dm-tools/` | 109–163 | Muito Grande |

---

## Passo 4: Processo de Geração por Arquivo

Para cada arquivo, execute este ciclo:

### 4.1 — Leia o texto bruto
```bash
cat /tmp/[chapter]_raw.txt
```

### 4.2 — Leia a spec do capítulo no SPEC_RPG_DOCS.md
Identifique:
- Conteúdo obrigatório listado
- Formato especial de templates
- Tabelas que precisam ser recriadas

### 4.3 — Gere o MD

**Para arquivos pequenos/médios:** gere direto em um único bloco.

**Para arquivos grandes (classes, spells, monsters):** use esta estratégia de chunking:

```python
# Exemplo para 12-monsters.md (54 páginas)
# Gere em 3 partes:
# Parte A (págs 109-120): Regras de Stat Blocks + primeiros monstros (A-C)
# Parte B (págs 121-145): Monstros D-O
# Parte C (págs 146-163): Monstros P-Z + NPCs

# Ao final, concatene:
with open('docs/dnd-rules/part4-dm-tools/12-monsters.md', 'w') as out:
    for part in ['part_a', 'part_b', 'part_c']:
        with open(f'/tmp/monsters_{part}.md', 'r') as f:
            out.write(f.read())
            out.write('\n\n')
```

### 4.4 — Verifique o output

Após gerar cada arquivo, execute:

```bash
# Verificar se o arquivo foi criado e tem conteúdo substancial
wc -l docs/dnd-rules/[caminho]/[arquivo].md

# Verificar se o frontmatter está presente
head -10 docs/dnd-rules/[caminho]/[arquivo].md

# Verificar se tabelas foram geradas (não devem ter linhas com \t)
grep -c "|" docs/dnd-rules/[caminho]/[arquivo].md
```

**Thresholds mínimos de linhas por arquivo:**
```
01-character-creation-steps.md  → mínimo 200 linhas
02-races.md                     → mínimo 500 linhas
03-classes.md                   → mínimo 800 linhas
04-backgrounds.md               → mínimo 600 linhas
05-equipment.md                 → mínimo 500 linhas
06-customization.md             → mínimo 100 linhas
07-ability-scores.md            → mínimo 300 linhas
08-adventuring.md               → mínimo 250 linhas
09-combat.md                    → mínimo 400 linhas
10-spellcasting-rules.md        → mínimo 200 linhas
11-spells.md                    → mínimo 1500 linhas
12-monsters.md                  → mínimo 3000 linhas
13-encounter-building.md        → mínimo 150 linhas
14-magic-items.md               → mínimo 200 linhas
appendix-a-conditions.md        → mínimo 100 linhas
appendix-b-gods.md              → mínimo 150 linhas
appendix-c-factions.md          → mínimo 100 linhas
```

---

## Passo 5: Checklist de Qualidade por Arquivo

Antes de marcar um arquivo como completo, confirme:

### ✅ Estrutura
- [ ] Frontmatter YAML presente e completo (title, chapter, source, pdf_pages, part, tags)
- [ ] Header `#` único no topo
- [ ] Hierarquia de headers consistente (##, ###, ####)
- [ ] Nenhuma seção cortada ou incompleta

### ✅ Conteúdo
- [ ] Todo conteúdo obrigatório do SPEC está presente
- [ ] Todos os dados numéricos conferem com o PDF
- [ ] Nenhuma tabela do PDF foi omitida
- [ ] Sidebars e exemplos estão em blockquotes

### ✅ Tabelas
- [ ] Todas as tabelas do PDF recriadas em Markdown
- [ ] Headers corretos em todas as tabelas
- [ ] Alinhamento de colunas consistente
- [ ] Zero tabelas como texto corrido

### ✅ Especiais por tipo de arquivo
**Classes (03):**
- [ ] Tabela de progressão 1–20 para cada classe
- [ ] Nenhuma feature de nível omitida
- [ ] Subclass completa com todas as features

**Monsters (12):**
- [ ] Stat blocks com tabela de ability scores (FOR/DES/CON/INT/SAB/CAR)
- [ ] Ações formatadas como `**Nome.** *Melee/Ranged Weapon Attack:*`
- [ ] Legendary Actions separadas corretamente

**Spells (11):**
- [ ] Tempo de Conjuração, Alcance, Componentes, Duração em negrito
- [ ] "Em Níveis Superiores" quando presente
- [ ] Spell lists por classe e nível no início

---

## Passo 6: Index Final

Após gerar todos os 17 arquivos, crie o arquivo de índice:

```bash
cat > docs/dnd-rules/INDEX.md << 'EOF'
---
title: "D&D Rules Index"
source: "D&D Basic Rules 2018"
generated: "$(date +%Y-%m-%d)"
---

# D&D Basic Rules — Índice de Documentação

## Part 1: Character Creation
- [Step-by-Step Characters](part1-character-creation/01-character-creation-steps.md)
- [Races](part1-character-creation/02-races.md)
- [Classes](part1-character-creation/03-classes.md)
- [Personality & Background](part1-character-creation/04-backgrounds.md)
- [Equipment](part1-character-creation/05-equipment.md)
- [Customization Options](part1-character-creation/06-customization.md)

## Part 2: Playing the Game
- [Using Ability Scores](part2-playing-the-game/07-ability-scores.md)
- [Adventuring](part2-playing-the-game/08-adventuring.md)
- [Combat](part2-playing-the-game/09-combat.md)

## Part 3: Magic
- [Spellcasting Rules](part3-magic/10-spellcasting-rules.md)
- [Spells](part3-magic/11-spells.md)

## Part 4: DM Tools
- [Monsters](part4-dm-tools/12-monsters.md)
- [Building Combat Encounters](part4-dm-tools/13-encounter-building.md)
- [Magic Items](part4-dm-tools/14-magic-items.md)

## Appendices
- [Conditions](appendices/appendix-a-conditions.md)
- [Gods of the Multiverse](appendices/appendix-b-gods.md)
- [The Five Factions](appendices/appendix-c-factions.md)
EOF
```

---

## Passo 7: Relatório Final

Ao terminar todos os arquivos, gere um relatório:

```bash
echo "=== RELATÓRIO DE GERAÇÃO ==="
echo ""
echo "Arquivos gerados:"
find docs/dnd-rules -name "*.md" | sort | while read f; do
    lines=$(wc -l < "$f")
    size=$(wc -c < "$f")
    echo "  ✓ $f — $lines linhas / $(( size / 1024 ))KB"
done

echo ""
echo "Total de arquivos: $(find docs/dnd-rules -name '*.md' | wc -l)"
echo "Total de linhas: $(find docs/dnd-rules -name '*.md' -exec cat {} \; | wc -l)"
echo "Tamanho total: $(du -sh docs/dnd-rules/ | cut -f1)"
```

---

## Regras Críticas de Comportamento

1. **Nunca resuma.** Se o PDF tem 3 páginas de tabela de equipamentos, o MD tem a tabela completa — 100% das linhas, 100% das colunas.

2. **Nunca invente.** Se uma regra não está no PDF, não está no MD. Nada de "provavelmente é X".

3. **Não pule arquivos difíceis.** Monsters (12) e Spells (11) são os maiores e mais críticos. Se ficar sem contexto no meio, salve o parcial, continue numa nova sessão, e concatene.

4. **Dados de dice primeiro.** Para cada monstro/spell/item, a notação de dados (ex: `3d6 + 5`) vem do PDF e é copiada exatamente.

5. **Uma fonte, um arquivo.** Cada MD corresponde exatamente ao intervalo de páginas especificado. Não misture conteúdo entre capítulos.

6. **Commits incrementais.** Após cada arquivo concluído e validado, salve. Não espere ter todos os 17 para salvar.

---

## Em Caso de Problemas

**PDF com texto garbled:** Use rasterização por página:
```bash
pdftoppm -jpeg -r 150 -f [start] -l [end] DnD_BasicRules_2018.pdf /tmp/page
ls /tmp/page-*.jpg
# Depois leia visualmente as imagens geradas
```

**Arquivo muito grande para gerar de uma vez (monsters, spells):**
Divida em 3 partes, gere cada uma, concatene com Python no final.

**Tabela do PDF em duas colunas (layout de revista):**
O `pdftotext -layout` vai deixar as duas colunas na mesma linha separadas por espaços.
Use este script para limpar:
```python
import re

def clean_two_column(text):
    """Remove espaço duplo de textos em duas colunas."""
    lines = text.split('\n')
    cleaned = []
    for line in lines:
        # Detecta linhas com espaço central grande (layout de 2 colunas)
        if '                              ' in line:
            # Pega só a primeira metade (coluna esquerda)
            half = len(line) // 2
            left = line[:half].strip()
            right = line[half:].strip()
            if left:
                cleaned.append(left)
            if right:
                cleaned.append(right)
        else:
            cleaned.append(line.strip())
    return '\n'.join(cleaned)
```

---

## Começar Agora

1. Leia este arquivo completo ✓
2. Leia `SPEC_RPG_DOCS.md` completo
3. Execute o Passo 0 (setup)
4. Comece pelo arquivo #1 (`appendix-a-conditions.md`) para calibrar o processo
5. Siga a ordem da tabela do Passo 3
6. Não pare até ter os 17 arquivos gerados e validados
