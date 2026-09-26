# Sacramento — prompts da ficha e dos popups da mesa

Cole **um prompt por vez** no ChatGPT. Salve com o nome indicado em `public/story/uso/` (mesma pasta dos prompts de itens). Todos em **1024×1024**.

**Como os popups funcionam:** quando o Juiz dá dinheiro, cura ou dano, o celular do jogador mostra a peça saltando na tela (escala + giro + tremor), com o **estouro** tingido atrás e o valor escrito em código (`+$10`, `−2 V`, `+1 D`). Uma causa de dano serve para Vida e para Dor — só muda a cor. A placa com o nome reaproveita `public/story/escritorio/placa.webp`.

Dicas: fundo com xadrez desenhado → peça *"refaça com fundo realmente transparente"*. *"Editar a imagem anterior"* vai na mesma conversa, logo depois da peça-base.

## A · Ficha: Vida e Dor (o app repete cada peça)

### 1. `ficha/vida-cheia.png`

Uso: Um por ponto de Vida (6, 8…). Substitui a barra verde.

```text
Ex-voto mineiro em forma de coração, de prata e latão envelhecidos, com esmalte vinho #5c241d no centro e pequenas chamas cinzeladas no topo, como os corações votivos das igrejas barrocas de Minas. Vista frontal, centralizado, ocupando 88% da tela, simétrico. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único, vista frontal, luz de estúdio quente vinda da esquerda-superior.
Identificador do arquivo (não escrever na arte): ficha/vida-cheia.png
```

### 2. `ficha/vida-perdida.png`

Uso: Pontos de Vida perdidos.

```text
Editar a imagem anterior (vida-cheia.png) mantendo forma, tamanho e posição idênticos: agora o coração está APAGADO — metal escurecido e oxidado, esmalte opaco e rachado ao meio, sem brilho. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único, vista frontal, luz de estúdio quente vinda da esquerda-superior.
Identificador do arquivo (não escrever na arte): ficha/vida-perdida.png
```

### 3. `ficha/dor-vazia.png`

Uso: Os 6 círculos de Dor (livro: o círculo riscado é dano).

```text
Um círculo desenhado à mão com pena e nanquim sépia sobre um pequeno recorte redondo de papel pergaminho envelhecido #ead9b8, traço irregular e vivo. Vista frontal, centralizado, ocupando 85% da tela. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único, vista frontal, luz de estúdio quente vinda da esquerda-superior.
Identificador do arquivo (não escrever na arte): ficha/dor-vazia.png
```

### 4. `ficha/dor-riscada.png`

Uso: Círculo de Dor marcado.

```text
Editar a imagem anterior (dor-vazia.png) mantendo forma, tamanho e posição idênticos: o círculo agora está RISCADO com um X forte de tinta vermelho-sangue escorrida, traço nervoso e rápido. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único, vista frontal, luz de estúdio quente vinda da esquerda-superior.
Identificador do arquivo (não escrever na arte): ficha/dor-riscada.png
```

## B · Fundo universal de popup

### 5. `popups/estouro.png`

Uso: Atrás de TODO popup, tingido: ouro, verde, vermelho, âmbar.

```text
Estouro de tinta a óleo: mancha radial irregular com respingos e pinceladas saindo do centro para fora, em tom NEUTRO cinza-claro quase branco (o app vai tingir por código), centro mais denso, bordas que se desfazem em respingos. Centralizado, ocupando 90% da tela. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): emblema de popup de jogo — peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único e dramático, levemente em 3/4, silhueta forte e legível mesmo em 150 pixels, contraste alto, luz de recorte (rim light) dourada no contorno, sem chão.
Identificador do arquivo (não escrever na arte): popups/estouro.png
```

## C · Dinheiro recebido (quanto maior o valor, maior a peça)

### 6. `popups/dinheiro-moeda.png`

Uso: Até $5.

```text
Uma única moeda de ouro/latão de réis antiga, girando no ar vista em leve ângulo, borda serrilhada, face com efígie gasta e ilegível, brilho quente. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): emblema de popup de jogo — peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único e dramático, levemente em 3/4, silhueta forte e legível mesmo em 150 pixels, contraste alto, luz de recorte (rim light) dourada no contorno, sem chão.
Identificador do arquivo (não escrever na arte): popups/dinheiro-moeda.png
```

### 7. `popups/dinheiro-moedas.png`

Uso: $6 a $25.

```text
Um punhado de moedas de réis de ouro, prata e cobre caindo e se espalhando no ar, umas sobre as outras, brilho quente. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): emblema de popup de jogo — peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único e dramático, levemente em 3/4, silhueta forte e legível mesmo em 150 pixels, contraste alto, luz de recorte (rim light) dourada no contorno, sem chão.
Identificador do arquivo (não escrever na arte): popups/dinheiro-moedas.png
```

### 8. `popups/dinheiro-notas.png`

Uso: $26 a $150.

```text
Maço de cédulas antigas de papel amarrotado amarradas com barbante, estampas ornamentais sem nenhuma letra ou número legível, tons pergaminho e verde-musgo desbotado, uma moeda por cima. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): emblema de popup de jogo — peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único e dramático, levemente em 3/4, silhueta forte e legível mesmo em 150 pixels, contraste alto, luz de recorte (rim light) dourada no contorno, sem chão.
Identificador do arquivo (não escrever na arte): popups/dinheiro-notas.png
```

### 9. `popups/dinheiro-saco.png`

Uso: $151 a $1.000.

```text
Saco de lona grosso amarrado com corda, estufado de dinheiro, boca entreaberta com moedas de ouro transbordando e algumas caindo. Sem nenhuma marca, letra ou símbolo pintado no saco. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): emblema de popup de jogo — peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único e dramático, levemente em 3/4, silhueta forte e legível mesmo em 150 pixels, contraste alto, luz de recorte (rim light) dourada no contorno, sem chão.
Identificador do arquivo (não escrever na arte): popups/dinheiro-saco.png
```

### 10. `popups/dinheiro-barra.png`

Uso: Acima de $1.000.

```text
Duas barras de ouro fundido rústicas empilhadas, bordas irregulares de fundição, superfície sem nenhuma inscrição, brilho dourado intenso com reflexo quente. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): emblema de popup de jogo — peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único e dramático, levemente em 3/4, silhueta forte e legível mesmo em 150 pixels, contraste alto, luz de recorte (rim light) dourada no contorno, sem chão.
Identificador do arquivo (não escrever na arte): popups/dinheiro-barra.png
```

## D · Vida recebida (cura)

### 11. `popups/cura-atadura.png`

Uso: Cura dada pelo Juiz / primeiros socorros.

```text
Rolo de atadura de linho branco-creme desenrolando no ar, com uma pequena mancha antiga e um frasco de unguento de vidro âmbar ao lado. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): emblema de popup de jogo — peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único e dramático, levemente em 3/4, silhueta forte e legível mesmo em 150 pixels, contraste alto, luz de recorte (rim light) dourada no contorno, sem chão.
Identificador do arquivo (não escrever na arte): popups/cura-atadura.png
```

### 12. `popups/cura-descanso.png`

Uso: Descanso comum e com médico.

```text
Pequena fogueira de acampamento acesa com uma caneca de latão fumegante e um chapéu de couro repousado ao lado. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): emblema de popup de jogo — peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único e dramático, levemente em 3/4, silhueta forte e legível mesmo em 150 pixels, contraste alto, luz de recorte (rim light) dourada no contorno, sem chão.
Identificador do arquivo (não escrever na arte): popups/cura-descanso.png
```

## E · Causas de dano (servem para Vida E para Dor)

### 13. `popups/dano-soco.png`

Uso: Soco, briga.

```text
Punho cerrado com soqueira de couro gasto e nós dos dedos esfolados, avançando na direção de quem olha, linhas de impacto pintadas ao redor. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): emblema de popup de jogo — peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único e dramático, levemente em 3/4, silhueta forte e legível mesmo em 150 pixels, contraste alto, luz de recorte (rim light) dourada no contorno, sem chão.
Identificador do arquivo (não escrever na arte): popups/dano-soco.png
```

### 14. `popups/dano-tiro.png`

Uso: Tiro de qualquer arma de fogo.

```text
Projétil de chumbo deformado atravessando o ar em alta velocidade com rastro de fumaça e fagulhas, estilhaço de impacto à frente. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): emblema de popup de jogo — peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único e dramático, levemente em 3/4, silhueta forte e legível mesmo em 150 pixels, contraste alto, luz de recorte (rim light) dourada no contorno, sem chão.
Identificador do arquivo (não escrever na arte): popups/dano-tiro.png
```

### 15. `popups/dano-faca.png`

Uso: Faca, sabre, lâmina.

```text
Faca de caça de lâmina larga cortando o ar na diagonal, rastro de movimento prateado, uma única gota vermelha escura escorrendo da ponta. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): emblema de popup de jogo — peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único e dramático, levemente em 3/4, silhueta forte e legível mesmo em 150 pixels, contraste alto, luz de recorte (rim light) dourada no contorno, sem chão.
Identificador do arquivo (não escrever na arte): popups/dano-faca.png
```

### 16. `popups/dano-pancada.png`

Uso: Pancada, coronhada, cadeira, martelo.

```text
Porrete de madeira nodosa em pleno golpe, com estilhaços de madeira e uma onda de impacto pintada no ponto de contato. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): emblema de popup de jogo — peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único e dramático, levemente em 3/4, silhueta forte e legível mesmo em 150 pixels, contraste alto, luz de recorte (rim light) dourada no contorno, sem chão.
Identificador do arquivo (não escrever na arte): popups/dano-pancada.png
```

### 17. `popups/dano-queda-cavalo.png`

Uso: Queda de cavalo.

```text
Estribo de ferro e sela de couro virada no ar, com ferradura solta e nuvem de poeira vermelha do cerrado explodindo embaixo. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): emblema de popup de jogo — peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único e dramático, levemente em 3/4, silhueta forte e legível mesmo em 150 pixels, contraste alto, luz de recorte (rim light) dourada no contorno, sem chão.
Identificador do arquivo (não escrever na arte): popups/dano-queda-cavalo.png
```

### 18. `popups/dano-queda.png`

Uso: Queda de altura, desmoronamento.

```text
Pedras e cascalho desabando com nuvem de poeira, uma bota de couro caindo junto, sensação de queda de altura. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): emblema de popup de jogo — peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único e dramático, levemente em 3/4, silhueta forte e legível mesmo em 150 pixels, contraste alto, luz de recorte (rim light) dourada no contorno, sem chão.
Identificador do arquivo (não escrever na arte): popups/dano-queda.png
```

### 19. `popups/dano-explosao.png`

Uso: Dinamite, explosão.

```text
Banana de dinamite estourando: bola de fogo laranja, lascas de papel vinho e fumaça negra se espalhando. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): emblema de popup de jogo — peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único e dramático, levemente em 3/4, silhueta forte e legível mesmo em 150 pixels, contraste alto, luz de recorte (rim light) dourada no contorno, sem chão.
Identificador do arquivo (não escrever na arte): popups/dano-explosao.png
```

### 20. `popups/dano-flecha.png`

Uso: Flecha, dardo de zarabatana.

```text
Flecha de haste de madeira com penas de ave do cerrado cravando-se na direção de quem olha, vibrando, rastro de movimento. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): emblema de popup de jogo — peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único e dramático, levemente em 3/4, silhueta forte e legível mesmo em 150 pixels, contraste alto, luz de recorte (rim light) dourada no contorno, sem chão.
Identificador do arquivo (não escrever na arte): popups/dano-flecha.png
```

### 21. `popups/dano-mordida.png`

Uso: Mordida ou ataque de animal.

```text
Cabeça de onça-pintada rugindo com presas à mostra, em 3/4, pelagem pintada com pinceladas vigorosas. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): emblema de popup de jogo — peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único e dramático, levemente em 3/4, silhueta forte e legível mesmo em 150 pixels, contraste alto, luz de recorte (rim light) dourada no contorno, sem chão.
Identificador do arquivo (não escrever na arte): popups/dano-mordida.png
```

### 22. `popups/dano-veneno.png`

Uso: Veneno, picada de cobra.

```text
Cascavel enrolada em posição de bote, boca aberta com presas e uma gota de veneno verde-amarelada na ponta. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): emblema de popup de jogo — peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único e dramático, levemente em 3/4, silhueta forte e legível mesmo em 150 pixels, contraste alto, luz de recorte (rim light) dourada no contorno, sem chão.
Identificador do arquivo (não escrever na arte): popups/dano-veneno.png
```

### 23. `popups/dano-fogo.png`

Uso: Fogo, queimadura.

```text
Labaredas vivas subindo de uma tábua de madeira em brasa, fagulhas e fumaça. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): emblema de popup de jogo — peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único e dramático, levemente em 3/4, silhueta forte e legível mesmo em 150 pixels, contraste alto, luz de recorte (rim light) dourada no contorno, sem chão.
Identificador do arquivo (não escrever na arte): popups/dano-fogo.png
```

## F · Opcional — marcos

### 24. `popups/xp.png`

Uso: XP ganho, subir de nível.

```text
Estrela de xerife de latão de seis pontas com bolinhas nas pontas, sem nenhuma gravação, girando no ar com brilho dourado intenso. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): emblema de popup de jogo — peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único e dramático, levemente em 3/4, silhueta forte e legível mesmo em 150 pixels, contraste alto, luz de recorte (rim light) dourada no contorno, sem chão.
Identificador do arquivo (não escrever na arte): popups/xp.png
```

### 25. `popups/morte.png`

Uso: Vida zerada, à beira da morte.

```text
Crânio de boi do sertão desbotado pelo sol com chifres longos, rachaduras, poeira ao redor. FUNDO 100% TRANSPARENTE (PNG com canal alfa), sem sombra no chão, sem vinheta, bordas limpas para recorte. Formato exato 1024×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): emblema de popup de jogo — peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones de itens já existentes. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. PROIBIDO: texto, letras, números, marcas, logotipos, gravuras legíveis, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, sangue exagerado ou gore. Objeto único e dramático, levemente em 3/4, silhueta forte e legível mesmo em 150 pixels, contraste alto, luz de recorte (rim light) dourada no contorno, sem chão.
Identificador do arquivo (não escrever na arte): popups/morte.png
```
