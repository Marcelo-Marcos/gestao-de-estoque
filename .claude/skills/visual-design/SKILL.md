---
name: visual-design
description: Direção estética e identidade visual — escolha de paleta, tipografia, personalidade, composição, ilustração/ícones e como fugir da aparência genérica de template. Use SEMPRE que o usuário pedir landing page, identidade, tema, "deixa mais bonito", "parece genérico", escolha de fontes ou cores, capa, apresentação ou a cara de um produto — antes de gerar qualquer CSS.
---

# Design visual — direção estética

Enquanto `ui-system` cuida de *como implementar* e `ux-flows` de *como funciona*, aqui a pergunta é: **como isso deve parecer, e por quê**. Sem direção declarada, o resultado é o default de todo mundo.

## Escreva a direção antes de escrever CSS

Produza um plano curto (10 linhas bastam) e valide com o usuário antes de codar:

```
Assunto: card game de batalha estratégica, PT-BR, mobile
Público: jogador de 18-35 que já joga Hearthstone/Slay the Spire
Sentimento em 3 palavras: tático, sombrio, artesanal
Referência do mundo do assunto: cartas de tarô impressas, mesa de madeira, fichas
Paleta: fundo carvão #0e0f13 / superfície #191b22 / texto #e8e9ee / dourado envelhecido #c8a24a / vermelho de dano #d2493f
Tipografia: display com serifa condensada para nomes de carta; sans neutra para números e UI
Layout: verticalidade de carta, margens generosas, moldura como elemento estrutural
Assinatura: a moldura da carta com desgaste sutil — o elemento pelo qual o app é lembrado
```

O item mais importante é a **assinatura**: uma coisa memorável. Um produto sem assinatura é esquecido mesmo quando está correto.

## Puxe do mundo do assunto

Design distintivo vem do domínio, não de uma biblioteca de UI. Um app de contabilidade pode pegar de papel-moeda, carimbo, livro-razão. Um card game pega de baralho, madeira, metal, iluminação de mesa. Pergunte: quais materiais, objetos e vocabulário existem no mundo desse produto? Traduza um deles em cor, textura, forma ou tipografia.

## Evite o "cheiro de IA"

Estas combinações aparecem em todo lugar e denunciam ausência de escolha:

- Fundo creme (#F4F1EA) + serifa de alto contraste + acento terracota (~#D97757).
- Preto quase puro + um único verde-limão ácido.
- Gradiente roxo-azul + glassmorphism + card com sombra difusa.
- Ícones de linha genéricos + emoji como ilustração + numeração 01/02/03 em conteúdo que não é sequência.
- Três colunas iguais de "features" com ícone-título-parágrafo.

Nenhuma é proibida — mas só use se for uma escolha justificada pelo briefing, não o caminho de menor esforço. Se o usuário pediu explicitamente um desses visuais, faça exatamente o que ele pediu.

## Tipografia carrega a personalidade

- Duas famílias resolvem quase tudo: uma **display** com caráter (usada com moderação, em títulos e momentos-chave) e uma **body** neutra e legível. Uma terceira, monoespaçada, só se houver dado/número.
- Fonte de sistema é escolha legítima e rápida; fonte característica é o que mais muda a percepção com menos esforço.
- Escala com saltos claros (12/14/16/20/28/40). Tamanhos próximos demais parecem erro, não hierarquia.
- Corpo de texto: 16px mínimo no mobile, altura de linha 1.5, largura de 60–75 caracteres.
- Título grande pede `letter-spacing` levemente negativo; texto pequeno em caixa alta pede espaçamento positivo.

## Cor

- Comece por uma cor de acento e um neutro. Palette de 5–6 valores nomeados basta.
- Neutro não é cinza puro: puxe levemente para o matiz do acento e tudo parece coerente.
- 60/30/10: dominante neutra, secundária de suporte, acento em 10% da tela. Acento em todo lugar deixa de ser acento.
- Reserve vermelho/verde para significado (erro, sucesso). Se o acento da marca é vermelho, escolha outro tom para erro.
- Escolha uma direção de luz e mantenha em todas as sombras. Sombras vindas de lados diferentes é o detalhe que faz parecer amador.

## Composição

- Uma grade e uma escala de espaço. Alinhamento consistente é o que mais separa profissional de improvisado.
- Estabeleça uma ordem de leitura clara: onde o olho pousa primeiro, segundo, terceiro. Se você não consegue dizer, o usuário também não.
- Densidade combina com o uso: jogo e dashboard suportam densidade; landing page precisa de ar.
- Ao terminar, remova um elemento. Quase sempre melhora.

## Imagens e ícones

- Um conjunto de ícones só, com peso de traço igual ao da tipografia.
- Nada de misturar ilustração 3D, flat e foto na mesma tela.
- Não use imagem de banco genérica (pessoas sorrindo em escritório) — mata a credibilidade mais rápido que não ter imagem.
- Placeholder deve ser uma forma neutra do próprio sistema, não um "lorem picsum" colorido.

## Autocrítica antes de entregar

- [ ] Se eu tirasse o logo, dá para reconhecer que é este produto?
- [ ] Cada escolha (cor, fonte, forma) tem uma razão ligada ao assunto?
- [ ] Existe exatamente um elemento memorável?
- [ ] Isso poderia ser a landing page de qualquer SaaS? Se sim, refaça a direção.
- [ ] Continua legível em tela pequena e em brilho baixo?
