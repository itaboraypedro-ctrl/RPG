# Sacramento — prompts das peças interativas de itens

Cole **um prompt por vez** no ChatGPT (geração de imagem). Salve com o nome indicado em `public/story/uso/` — depois eu converto para webp, redimensiono e meço as posições (centro das câmaras, dos canos, da janela do pente) para encaixar as balas.

**Princípio:** a arte vem VAZIA e as peças se repetem. Uma base de bala serve para todos os calibres; o app posiciona, gira, repete e conta. Slot da barra, agulha, ponteiros e brilhos são código.

Dicas:
- Se o fundo vier com xadrez desenhado ou cor, peça: *"refaça com fundo realmente transparente (PNG com alfa)"*.
- Efeitos (seção D) são de propósito em fundo preto: no app o preto some.
- Confira contagens exatas (6 câmaras, 2 canos) antes de salvar.
- *"Editar a imagem anterior"* vai **na mesma conversa**, logo depois da peça-base.

## A · Peças-base de munição (servem para TODAS as armas)

### 1. `municao/culote.png` — 1024×1024

Uso: Uma peça para todos os calibres: o app só muda o tamanho. Vai dentro do tambor, dos canos, e na caixa vista de cima.

```text
Base (culote) de um cartucho vista EXATAMENTE de frente: disco de latão com aro, espoleta de cobre intacta e redonda no centro. Latão com pátina, reflexo quente. Círculo perfeito, centralizado, ocupando 90% da tela. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes: objeto único, luz de estúdio quente vinda da esquerda-superior, sombras azul-petróleo, metal envelhecido e oleado, latão fosco, couro escuro gasto. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d — dourado só como acento. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera.
Identificador do arquivo (não escrever na arte): municao/culote.png
```

### 2. `municao/culote-deflagrado.png` — 1024×1024

Uso: Opcional: sem ela, o app escurece a peça anterior por código.

```text
Editar a imagem anterior (culote.png) mantendo forma, tamanho e posição idênticos: agora é a cápsula JÁ DISPARADA — espoleta amassada pelo cão com marca de percussão, latão mais escuro e fuliginoso, leve resíduo de pólvora queimada na borda. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes: objeto único, luz de estúdio quente vinda da esquerda-superior, sombras azul-petróleo, metal envelhecido e oleado, latão fosco, couro escuro gasto. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d — dourado só como acento. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera.
Identificador do arquivo (não escrever na arte): municao/culote-deflagrado.png
```

### 3. `municao/bala-revolver.png` — 1024×1536

Uso: Vista lateral: pente das pistolas, alças do cinturão.

```text
Um único cartucho de revólver visto EXATAMENTE de lado, em PÉ (ponta de chumbo para cima, base de latão para baixo), centralizado, ocupando 80% da altura. Latão com pátina, ponta de chumbo cinza fosco. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1536 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes: objeto único, luz de estúdio quente vinda da esquerda-superior, sombras azul-petróleo, metal envelhecido e oleado, latão fosco, couro escuro gasto. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d — dourado só como acento. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera.
Identificador do arquivo (não escrever na arte): municao/bala-revolver.png
```

### 4. `municao/cartucho-espingarda.png` — 1024×1536

Uso: Vista lateral: alças da bandoleira, recarga das espingardas.

```text
Um único cartucho de espingarda antigo visto EXATAMENTE de lado, em pé: corpo cilíndrico de papelão vinho-escuro #5c241d gasto, base alta de latão embaixo, topo dobrado em estrela. Centralizado, ocupando 80% da altura. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1536 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes: objeto único, luz de estúdio quente vinda da esquerda-superior, sombras azul-petróleo, metal envelhecido e oleado, latão fosco, couro escuro gasto. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d — dourado só como acento. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera.
Identificador do arquivo (não escrever na arte): municao/cartucho-espingarda.png
```

### 5. `municao/cartucho-fuzil.png` — 1024×1536

Uso: Vista lateral: tubo do fuzil/carabina, alças da bandoleira.

```text
Um único cartucho de fuzil antigo visto EXATAMENTE de lado, em pé: estojo de latão longo com gargalo estreitado e projétil de chumbo pontudo. Centralizado, ocupando 85% da altura. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1536 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes: objeto único, luz de estúdio quente vinda da esquerda-superior, sombras azul-petróleo, metal envelhecido e oleado, latão fosco, couro escuro gasto. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d — dourado só como acento. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera.
Identificador do arquivo (não escrever na arte): municao/cartucho-fuzil.png
```

## B · Mecanismos das armas (vazios — o app coloca as balas)

### 6. `armas/tambor.png` — 1024×1024

Uso: Revólver e magnum.

```text
Tambor de revólver de 6 câmaras visto EXATAMENTE de frente (eixo apontando para a câmera), aço azulado gasto com desgaste nas arestas. As 6 câmaras estão VAZIAS (furos escuros e fundos) e dispostas em hexágono perfeito: a primeira câmara exatamente às 12 horas, as demais a cada 60°. Furo do eixo no centro. Contorno externo circular com os 6 sulcos de trava entre as câmaras. Centralizado, ocupando 90% da tela, perfeitamente circular — vai girar em animação, não pode ter perspectiva. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes: objeto único, luz de estúdio quente vinda da esquerda-superior, sombras azul-petróleo, metal envelhecido e oleado, latão fosco, couro escuro gasto. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d — dourado só como acento. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera.
Identificador do arquivo (não escrever na arte): armas/tambor.png
```

### 7. `armas/culatra-aberta.png` — 1024×1024

Uso: Espingarda, cano serrado, derringer (2 canos) e garrucha (1 cano usado).

```text
Espingarda de dois canos lado a lado com a culatra aberta, vista EXATAMENTE de trás para dentro dos canos: dois furos circulares grandes, VAZIOS e escuros, lado a lado, aço gasto e madeira na parte inferior. Os dois círculos simétricos e centralizados, ocupando 80% da largura. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes: objeto único, luz de estúdio quente vinda da esquerda-superior, sombras azul-petróleo, metal envelhecido e oleado, latão fosco, couro escuro gasto. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d — dourado só como acento. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera.
Identificador do arquivo (não escrever na arte): armas/culatra-aberta.png
```

### 8. `armas/carregador.png` — 1024×1536

Uso: Pistola automática (11) e Mauser (15): o app empilha as balas na janela.

```text
Carregador (pente) de pistola antiga vazio, visto EXATAMENTE de lado, na vertical, aço escurecido com janela lateral longa mostrando o interior vazio. Centralizado, ocupando 88% da altura. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1536 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes: objeto único, luz de estúdio quente vinda da esquerda-superior, sombras azul-petróleo, metal envelhecido e oleado, latão fosco, couro escuro gasto. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d — dourado só como acento. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera.
Identificador do arquivo (não escrever na arte): armas/carregador.png
```

## C · Onde a munição fica guardada

### 9. `guarda/caixa-aberta.png` — 1024×1024

Uso: Uma caixa para os três calibres: o app arruma 12 ou 6 bases dentro em grade.

```text
Caixa de papelão de munição ABERTA vista EXATAMENTE de cima (planta), tampa aberta para trás, SEM divisórias por dentro: fundo interno liso, escuro e vazio, retangular, ocupando ~70% da caixa. Papelão pardo envelhecido com manchas de óleo. Centralizada, ocupando 90% da tela. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes: objeto único, luz de estúdio quente vinda da esquerda-superior, sombras azul-petróleo, metal envelhecido e oleado, latão fosco, couro escuro gasto. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d — dourado só como acento. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera.
Identificador do arquivo (não escrever na arte): guarda/caixa-aberta.png
```

### 10. `guarda/alca-couro.png` — 1024×1536

Uso: Repetida 36× no cinturão e 24× na bandoleira; a bala aparece saindo da alça.

```text
UMA única alça de couro escuro para cartucho, VAZIA, vista EXATAMENTE de frente e na vertical: tira de couro dobrada formando um laço com costura clara nas laterais e rebite de latão embaixo. Centralizada, ocupando 85% da altura. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1536 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes: objeto único, luz de estúdio quente vinda da esquerda-superior, sombras azul-petróleo, metal envelhecido e oleado, latão fosco, couro escuro gasto. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d — dourado só como acento. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera.
Identificador do arquivo (não escrever na arte): guarda/alca-couro.png
```

### 11. `guarda/mochila-aberta.png` — 1024×1536

Uso: O app desenha os 10 espaços lá dentro.

```text
Mochila de lona encerada e couro, ABERTA e vista de cima, com o interior escuro e amplo como um fundo vazio. Aba de couro caída para trás no topo, fivelas de latão, alças laterais. O interior escuro ocupa ~70% da área central. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1536 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes: objeto único, luz de estúdio quente vinda da esquerda-superior, sombras azul-petróleo, metal envelhecido e oleado, latão fosco, couro escuro gasto. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d — dourado só como acento. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera.
Identificador do arquivo (não escrever na arte): guarda/mochila-aberta.png
```

## D · Efeitos coringa (fundo preto, mesclar em 'screen')

### 12. `efeitos/clarao-disparo.png` — 1024×1024

Uso: Todas as armas de fogo e a explosão da dinamite.

```text
Clarão de boca de cano de arma de pólvora negra visto de lado, explodindo da ESQUERDA para a DIREITA: núcleo branco-amarelado, pétalas laranja e faíscas, bordas que somem no preto. Origem do clarão no meio da borda esquerda. FUNDO PRETO CHAPADO #000000 (será mesclado em modo 'screen' no app — tudo que for preto some), sem cenário. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes: objeto único, luz de estúdio quente vinda da esquerda-superior, sombras azul-petróleo, metal envelhecido e oleado, latão fosco, couro escuro gasto. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d — dourado só como acento. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera.
Identificador do arquivo (não escrever na arte): efeitos/clarao-disparo.png
```

### 13. `efeitos/fumaca.png` — 1024×1024

Uso: Depois do tiro, pavio, lanterna apagando.

```text
Nuvem de fumaça de pólvora negra cinza-clara e densa, se espalhando para a direita e para cima, bordas suaves que somem no preto, sem fogo. FUNDO PRETO CHAPADO #000000 (será mesclado em modo 'screen' no app — tudo que for preto some), sem cenário. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes: objeto único, luz de estúdio quente vinda da esquerda-superior, sombras azul-petróleo, metal envelhecido e oleado, latão fosco, couro escuro gasto. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d — dourado só como acento. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera.
Identificador do arquivo (não escrever na arte): efeitos/fumaca.png
```

### 14. `efeitos/chama.png` — 1024×1536

Uso: Fósforo, isqueiro, pederneira, pavio da dinamite e dentro da lanterna.

```text
Chama pequena de palito de fósforo, vertical, formato de gota, núcleo azul na base e amarelo-laranja em cima. Sem o palito. Centralizada, ocupando 70% da altura. FUNDO PRETO CHAPADO #000000 (será mesclado em modo 'screen' no app — tudo que for preto some), sem cenário. Formato exato 1024×1536 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes: objeto único, luz de estúdio quente vinda da esquerda-superior, sombras azul-petróleo, metal envelhecido e oleado, latão fosco, couro escuro gasto. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d — dourado só como acento. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera.
Identificador do arquivo (não escrever na arte): efeitos/chama.png
```

## E · Objetos de mão

### 15. `objetos/lanterna.png` — 1024×1536

Uso: Acesa = mesma imagem + chama sobre o pavio + brilho em código.

```text
Lanterna (lampião) a óleo de ferro e vidro vista de frente, APAGADA, vidro limpo e transparente mostrando o pavio no centro. Centralizada, ocupando 85% da altura. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1536 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes: objeto único, luz de estúdio quente vinda da esquerda-superior, sombras azul-petróleo, metal envelhecido e oleado, latão fosco, couro escuro gasto. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d — dourado só como acento. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera.
Identificador do arquivo (não escrever na arte): objetos/lanterna.png
```

### 16. `objetos/bussola.png` — 1024×1024

Uso: A agulha é desenhada em código e gira pelo sensor do celular.

```text
Bússola de bolso de latão aberta vista EXATAMENTE de cima, mostrador de papel envelhecido com rosa-dos-ventos desenhada SÓ com traços e pontas (SEM letras, sem números), SEM AGULHA. Círculo perfeito centralizado ocupando 90% da tela. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes: objeto único, luz de estúdio quente vinda da esquerda-superior, sombras azul-petróleo, metal envelhecido e oleado, latão fosco, couro escuro gasto. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d — dourado só como acento. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera.
Identificador do arquivo (não escrever na arte): objetos/bussola.png
```

### 17. `objetos/relogio.png` — 1024×1024

Uso: Ponteiros em código.

```text
Relógio de bolso de latão aberto visto EXATAMENTE de frente, mostrador de esmalte creme com 12 marcações em traços (SEM números), SEM PONTEIROS. Círculo perfeito centralizado ocupando 85% da tela, argola no topo. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes: objeto único, luz de estúdio quente vinda da esquerda-superior, sombras azul-petróleo, metal envelhecido e oleado, latão fosco, couro escuro gasto. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d — dourado só como acento. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera.
Identificador do arquivo (não escrever na arte): objetos/relogio.png
```

## F · Opcional

### 18. `armas/revolver-lateral.png` — 1536×1024

Uso: Deixa a tela de tiro mais cinematográfica. Sem ela, a tela de tiro mostra o tambor.

```text
Revólver de ação simples estilo 1870 visto EXATAMENTE de perfil (lado direito), cano apontando para a DIREITA, cão armado para trás, cabo de madeira escura gasta com losangos. Arma inteira dentro da tela, ocupando 85% da largura, centralizada verticalmente, boca do cano a ~92% da largura. Sem mão segurando. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1536×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes: objeto único, luz de estúdio quente vinda da esquerda-superior, sombras azul-petróleo, metal envelhecido e oleado, latão fosco, couro escuro gasto. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d — dourado só como acento. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera.
Identificador do arquivo (não escrever na arte): armas/revolver-lateral.png
```
