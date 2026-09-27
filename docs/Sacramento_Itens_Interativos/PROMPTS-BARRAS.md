# Sacramento — prompts das barras de Vida e Dor

Substituem os corações e os círculos da ficha por **uma barra de progresso** com ícone na ponta, que se desgasta conforme o personagem apanha (referência enviada pelo usuário, refeita no estilo pintado do app).

Salve em `public/story/uso/barras/`. Todos em **1536×1024**.

**Como funciona no app:**
- A moldura vem com o **canal vazio** e o preenchimento é código: proporção exata (5/8), escorre ao tomar dano e mostra um rastro claro do pedaço perdido.
- O ícone da ponta reaproveita o coração de ex-voto (Vida) e o círculo de nanquim (Dor) que já estão no app.
- A Dor ganha 6 marcas de divisão em código (os 6 círculos do livro).
- Os estados de desgaste são **edições da mesma imagem**: mande as da Vida em sequência **na mesma conversa**, e as da Dor em outra conversa, também em sequência.

Dica: se o canal vier pintado por dentro, peça *"o retângulo interno x=300–1440, y=462–562 precisa ser totalmente transparente"*.

## A · Barra de Vida — moldura de ferro que racha conforme a Vida cai

### 1. `barras/vida-0.png`

Uso: Vida entre 76% e 100%.

```text
GEOMETRIA OBRIGATÓRIA (o app desenha o preenchimento por baixo, então as posições precisam ser exatas): imagem 1536×1024 com FUNDO 100% TRANSPARENTE (PNG com canal alfa). A barra é horizontal, reta, vista exatamente de frente, sem perspectiva, ocupando a faixa central: da esquerda x=60 até a direita x=1476, de cima y=400 até embaixo y=624. Na ponta ESQUERDA, um ENCAIXE CIRCULAR VAZIO (furo transparente) centrado em x=172, y=512, com diâmetro de 190 px, onde o app vai colocar um ícone. O CANAL interno da barra é um retângulo VAZADO E TRANSPARENTE de x=300 até x=1440 e de y=462 até y=562, com bordas internas retas e limpas — nada pintado dentro dele. Todo o resto da imagem (acima de y=400, abaixo de y=624) fica transparente. Aparência: moldura de ferro fundido escuro com cantoneiras e filetes de latão envelhecido #d1ab55, pequenos rebites ao longo da borda, acabamento barroco mineiro discreto; o aro do encaixe circular é de latão com raios cinzelados, como a moldura de um ex-voto. Peça inteira, íntegra, apenas gasta pelo uso. Formato exato 1536×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones já existentes do app. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. Luz quente vinda da esquerda-superior. PROIBIDO: texto, letras, números, marcas, logotipos, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, pixel art.
Identificador do arquivo (não escrever na arte): barras/vida-0.png
```

### 2. `barras/vida-1.png`

Uso: Vida entre 51% e 75%.

```text
Editar a imagem anterior mantendo EXATAMENTE a mesma forma geral, o mesmo tamanho, a mesma posição, o mesmo encaixe circular vazio e o MESMO CANAL TRANSPARENTE nas mesmas coordenadas (x=300–1440, y=462–562). Não mover, não redimensionar, não pintar dentro do canal nem dentro do encaixe. Mudança pedida: a moldura agora está ARRANHADA e amassada: riscos fundos no ferro, latão fosco com oxidação esverdeada nas quinas, um rebite faltando. Formato exato 1536×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones já existentes do app. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. Luz quente vinda da esquerda-superior. PROIBIDO: texto, letras, números, marcas, logotipos, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, pixel art.
Identificador do arquivo (não escrever na arte): barras/vida-1.png
```

### 3. `barras/vida-2.png`

Uso: Vida entre 26% e 50%.

```text
Editar a imagem anterior mantendo EXATAMENTE a mesma forma geral, o mesmo tamanho, a mesma posição, o mesmo encaixe circular vazio e o MESMO CANAL TRANSPARENTE nas mesmas coordenadas (x=300–1440, y=462–562). Não mover, não redimensionar, não pintar dentro do canal nem dentro do encaixe. Mudança pedida: a moldura agora está RACHADA: trincas escuras atravessando o ferro na metade direita, lascas faltando na borda superior, ferrugem avermelhada escorrendo das rachaduras. O canal continua transparente. Formato exato 1536×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones já existentes do app. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. Luz quente vinda da esquerda-superior. PROIBIDO: texto, letras, números, marcas, logotipos, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, pixel art.
Identificador do arquivo (não escrever na arte): barras/vida-2.png
```

### 4. `barras/vida-3.png`

Uso: Vida entre 1% e 25%.

```text
Editar a imagem anterior mantendo EXATAMENTE a mesma forma geral, o mesmo tamanho, a mesma posição, o mesmo encaixe circular vazio e o MESMO CANAL TRANSPARENTE nas mesmas coordenadas (x=300–1440, y=462–562). Não mover, não redimensionar, não pintar dentro do canal nem dentro do encaixe. Mudança pedida: a moldura agora está QUEBRADA: pedaços grandes da borda superior e inferior da metade direita arrancados (deixando buracos transparentes na moldura, mas sem invadir o canal), ferro enegrecido como se queimado, latão quase preto. Formato exato 1536×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones já existentes do app. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. Luz quente vinda da esquerda-superior. PROIBIDO: texto, letras, números, marcas, logotipos, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, pixel art.
Identificador do arquivo (não escrever na arte): barras/vida-3.png
```

### 5. `barras/vida-4.png`

Uso: Vida zerada.

```text
Editar a imagem anterior mantendo EXATAMENTE a mesma forma geral, o mesmo tamanho, a mesma posição, o mesmo encaixe circular vazio e o MESMO CANAL TRANSPARENTE nas mesmas coordenadas (x=300–1440, y=462–562). Não mover, não redimensionar, não pintar dentro do canal nem dentro do encaixe. Mudança pedida: a moldura agora está EM RUÍNAS: a metade direita praticamente despedaçada, restos de ferro retorcido e carbonizado, fuligem, uma leve camada de musgo e poeira nas frestas; a metade esquerda ainda de pé mas rachada. O encaixe circular continua vazio e no mesmo lugar. Formato exato 1536×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones já existentes do app. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. Luz quente vinda da esquerda-superior. PROIBIDO: texto, letras, números, marcas, logotipos, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, pixel art.
Identificador do arquivo (não escrever na arte): barras/vida-4.png
```

## B · Barra de Dor — tira de couro que esgarça conforme a Dor sobe

### 6. `barras/dor-0.png`

Uso: Dor 0 ou 1.

```text
GEOMETRIA OBRIGATÓRIA (o app desenha o preenchimento por baixo, então as posições precisam ser exatas): imagem 1536×1024 com FUNDO 100% TRANSPARENTE (PNG com canal alfa). A barra é horizontal, reta, vista exatamente de frente, sem perspectiva, ocupando a faixa central: da esquerda x=60 até a direita x=1476, de cima y=400 até embaixo y=624. Na ponta ESQUERDA, um ENCAIXE CIRCULAR VAZIO (furo transparente) centrado em x=172, y=512, com diâmetro de 190 px, onde o app vai colocar um ícone. O CANAL interno da barra é um retângulo VAZADO E TRANSPARENTE de x=300 até x=1440 e de y=462 até y=562, com bordas internas retas e limpas — nada pintado dentro dele. Todo o resto da imagem (acima de y=400, abaixo de y=624) fica transparente. Aparência: tira grossa de couro escuro #261318 curtido, com costura de linha clara ao longo das bordas, presa por uma fivela de latão na ponta direita; o aro do encaixe circular é de latão simples com cravos. A tira é inteira e firme. Formato exato 1536×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones já existentes do app. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. Luz quente vinda da esquerda-superior. PROIBIDO: texto, letras, números, marcas, logotipos, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, pixel art.
Identificador do arquivo (não escrever na arte): barras/dor-0.png
```

### 7. `barras/dor-1.png`

Uso: Dor 2 e 3.

```text
Editar a imagem anterior mantendo EXATAMENTE a mesma forma geral, o mesmo tamanho, a mesma posição, o mesmo encaixe circular vazio e o MESMO CANAL TRANSPARENTE nas mesmas coordenadas (x=300–1440, y=462–562). Não mover, não redimensionar, não pintar dentro do canal nem dentro do encaixe. Mudança pedida: o couro agora está GASTO: rachaduras finas na superfície, costura rompida em dois trechos, bordas esfoladas, marcas de unha e de corda. Formato exato 1536×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones já existentes do app. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. Luz quente vinda da esquerda-superior. PROIBIDO: texto, letras, números, marcas, logotipos, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, pixel art.
Identificador do arquivo (não escrever na arte): barras/dor-1.png
```

### 8. `barras/dor-2.png`

Uso: Dor 4 e 5.

```text
Editar a imagem anterior mantendo EXATAMENTE a mesma forma geral, o mesmo tamanho, a mesma posição, o mesmo encaixe circular vazio e o MESMO CANAL TRANSPARENTE nas mesmas coordenadas (x=300–1440, y=462–562). Não mover, não redimensionar, não pintar dentro do canal nem dentro do encaixe. Mudança pedida: o couro agora está ESGARÇADO: rasgos abertos nas bordas, pontos de costura soltos pendurados, trechos queimados e manchados de vermelho-escuro, a fivela torta. Formato exato 1536×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones já existentes do app. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. Luz quente vinda da esquerda-superior. PROIBIDO: texto, letras, números, marcas, logotipos, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, pixel art.
Identificador do arquivo (não escrever na arte): barras/dor-2.png
```

## C · Opcional — textura do preenchimento

### 9. `barras/preenche-vida.png`

Uso: Preenchimento da Vida (senão o app usa um degradê vinho em código).

```text
Textura horizontal emendável (repetível nas bordas esquerda e direita) de esmalte vermelho-vinho vivo, como o esmalte de um ex-voto, com brilho úmido na parte de cima e veios mais escuros. Ocupa a imagem inteira de borda a borda, 1536×1024, sem moldura, sem objetos, sem transparência. Formato exato 1536×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones já existentes do app. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. Luz quente vinda da esquerda-superior. PROIBIDO: texto, letras, números, marcas, logotipos, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, pixel art.
Identificador do arquivo (não escrever na arte): barras/preenche-vida.png
```

### 10. `barras/preenche-dor.png`

Uso: Preenchimento da Dor (senão degradê âmbar em código).

```text
Textura horizontal emendável (repetível nas bordas esquerda e direita) de brasa âmbar e vermelha, como ferro em brasa visto de perto, com veios incandescentes e fuligem. Ocupa a imagem inteira de borda a borda, 1536×1024, sem moldura, sem objetos, sem transparência. Formato exato 1536×1024 pixels, PNG, uma única imagem, sem colagem, sem painéis. ESTILO (aplicar sempre): peça de interface de jogo pintada à mão, óleo digital com pinceladas visíveis e grão fino, qualidade de concept art AAA (Red Dead Redemption 2, Hunt: Showdown), mesma linguagem dos ícones já existentes do app. Brasil, faroeste mineiro de 1880. Paleta: negro-azulado #0b0b14, couro escuro #261318, ouro velho #d1ab55, pergaminho #ead9b8, vinho seco #5c241d. Luz quente vinda da esquerda-superior. PROIBIDO: texto, letras, números, marcas, logotipos, marca d'água, moldura ao redor da imagem, cenário, elementos modernos, fotorrealismo de câmera, pixel art.
Identificador do arquivo (não escrever na arte): barras/preenche-dor.png
```
