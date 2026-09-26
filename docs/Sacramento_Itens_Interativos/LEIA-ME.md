# Barra de itens interativa — plano

Barra fixa embaixo da ficha do jogador (`MesaDoJogador`), com rolagem horizontal. Cada item é um slot. Tocar no slot abre o painel do item, que mostra a mecânica dele. Item sem mecânica abre só o detalhe (nota do livro e fala de balcão).

O mapa de comportamento item a item fica em `lib/rulesets/sacramento/itens-uso.ts` (`USO_ITENS`). Os prompts de arte estão em `PROMPTS.md`.

## Ordem da barra

1. Armas prontas (coldre, bandoleira, bainha), com o selo de carga `4/6`
2. Munição (cinturão e caixas), com o selo de balas `30`
3. Remédios
4. Fogo e luz
5. Comida, bebida e fumo, com o selo de quantidade
6. Mochila (espaço usado `7,5/10`)
7. O resto (passivos)

## Análise caso a caso

| Grupo | Itens | Na barra | Arte nova |
|---|---|---|---|
| **Arma de fogo com tambor** | revólver, magnum | Tela de tiro: tambor gira, clarão, fumaça, vibração. Recarga câmara por câmara, e as cápsulas vazias saem. | tambor + culote (+ revólver de perfil, opcional) |
| **Arma de pente** | pistola automática (11), Mauser C69 (15) | Pente que esvazia de cima para baixo. A automática oferece "tiro extra" | carregador + bala de revólver |
| **Arma de canos** | espingarda, cano serrado, garrucha, derringer | Culatra abre e mostra 1–2 cartuchos | culatra aberta + culote |
| **Arma de tubo** | fuzil (5), carabina (7) | Fila de cartuchos sob o cano | cartucho de fuzil |
| **Munição** | caixas de 12 (revólver), de 6 (espingarda e fuzil) | Caixa aberta de cima, com uma bala por buraco. Conta bala por bala, não caixa | 1 caixa vazia + culote |
| **Porte** | coldre com cinturão (36), bandoleira (24) | Alças que enchem e esvaziam. É daqui que sai a recarga rápida | 1 alça de couro, repetida |
| **Dinamite** | dinamite | Segurar para acender: o pavio queima e você solta para arremessar. Gera rolagem e evento | — (ícone atual + chama) |
| **Remédios de uso imediato** | cânfora, adrenalina | "Usar" desconta 1 e aplica a cura na ficha (o jogador já pode registrar cura) | — (ícone atual) |
| **Tônico milagroso** | tônico | "Beber" tira uma carta do baralho: preta cura 3V, vermelha envenena | — (usa as cartas atuais) |
| **Remédios de descanso** | unguento, pomada de cavalo, morfina | Só mostra o efeito e desconta. O Juiz aplica | — |
| **Fogo** | fósforos (10), isqueiro, pederneira | "Riscar": chama na tela, desconta o fósforo | chama (coringa) |
| **Luz** | lanterna + óleo | Acesa ou apagada, e gasta óleo ao acender | 1 lanterna + chama |
| **Comida, bebida e fumo** | carne seca, cerveja, pinga, uísque, paieiros… | "Comer", "beber" ou "fumar" desconta 1 e registra na mesa. Sem tela própria | — |
| **Recipientes** | mochila (10), bolsa de montaria (10), carroça (30) | Abre a mochila por dentro com os espaços ocupados | mochila aberta |
| **Graça no celular** | bússola, relógio de bolso | A bússola aponta o norte pelo sensor do celular. O relógio mostra a hora | mostradores; agulha e ponteiros em código |
| **Passivos** | roupas, joias, ferramentas, instrumentos, machado, faca, sabre… | Só detalhe. Roupa mostra se está vestida ou guardada (muda o espaço) | — |

## Munição: três camadas

```
Caixa na mochila  ──(+2 AC em combate)──►  Cinturão/Bandoleira  ──(recarga da arma)──►  Tambor/pente
  balas soltas                               até 36 / 24                                 carga da arma
```

- **Tudo é contado bala a bala.** Comprar 2 caixas de revólver dá 24 balas na caixa. Nunca existe munição infinita (docs/01 §9.3).
- **Atirar:** desconta 1 da arma na mesma ação que rola `1d6 + Violência vs Defesa` (padrão 5; cobertura 6/7; surpreendido 3). Com a arma vazia, faz "clique" em seco e não rola nada. Nunca se cria bala que não existe (docs/02 GM-11: Gatilho Furioso com 1 bala dispara só 1).
- **Recarregar:** o custo em AC é o mesmo para 1 bala ou para a carga toda (p. 82). O app mostra o custo, mas não trava. No revólver, as cápsulas vazias ficam no tambor até a recarga.
- **Achar munição:** o Juiz ganha "Dar item/munição" no painel do bando. Tudo entra no registro da mesa.
- **O Juiz vê** em cada PJ: `🔫 4/6 · cinturão 18 · mochila 24`.
- **Resumo da sessão** ganha: tiros disparados, acertos e balas gastas.

## Dados (sem migration)

Tudo vive no `characters.inventory` (jsonb) que já existe:

- arma: `uid`, `local` (`coldre` | `bandoleira` | `bainha` | `mochila`), `carga`, `vazias`
- caixa de munição: `balas`
- coldre e bandoleira: `balas`

Inventários antigos são normalizados na leitura: caixa sem `balas` vira `quantidade × balasPorCaixa`.

## "Atirar de verdade" no celular

- O toque no gatilho dispara a animação (recuo, clarão, fumaça, tambor girando 60°), o som e a vibração, e ao mesmo tempo a rolagem no servidor.
- **Vibração:** o Android usa `navigator.vibrate`. **O iPhone não tem essa API.** No iOS 18+ existe um truque de haptic curto (switch nativo). Sem isso, o tiro fica só no som e no tremor da tela.
- **Som:** o ChatGPT não gera áudio. Opções: sons CC0 do freesound.org (tiro, clique seco, tambor girando, bala encaixando) ou som sintetizado no próprio app.

## Decisões adotadas (padrão — o Juiz pode mudar)

1. Calibre: magnum, automática, Mauser e derringer usam bala de revólver; carabina usa fuzil; garrucha usa espingarda.
2. Derringer: carga 2 (tabela).
3. Bandoleira: 24 balas (texto).
4. Arma comprada ou dada pelo Juiz chega **vazia**.
5. Armas que já estavam no inventário contam como **carregadas** (campo `carga` ausente = cheia).
6. Lanterna: 1 óleo de lanterna por acendimento.
