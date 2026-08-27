---
name: ui-system
description: Construção da camada de interface em código — design tokens, escala tipográfica e de espaçamento, biblioteca de componentes, estados visuais, responsividade e acessibilidade. Use SEMPRE que o usuário for criar ou ajustar componentes, botões, formulários, modais, cards, temas, dark mode, espaçamento, cores ou disser que algo "está feio", "desalinhado" ou "não parece profissional".
---

# UI — sistema de interface em código

UI é a camada de *implementação* do visual: como as decisões estéticas viram tokens, componentes e estados consistentes. (Direção estética é `visual-design`; fluxo e comportamento é `ux-flows`.)

## Comece pelos tokens, nunca pelo componente

Antes do primeiro botão, defina o vocabulário. Sem isso, o app acumula 14 tons de cinza e 9 tamanhos de fonte.

```css
:root {
  /* cor: papel semântico, não nome da cor */
  --bg: #0e0f13;
  --surface: #191b22;
  --text: #e8e9ee;
  --text-muted: #9a9db0;
  --accent: #c8a24a;
  --danger: #d2493f;
  --border: rgb(255 255 255 / 0.08);

  /* espaçamento: escala de 4px, sem valores fora dela */
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px;
  --sp-6: 24px; --sp-8: 32px; --sp-12: 48px;

  /* tipografia: escala fechada */
  --fs-xs: 12px; --fs-sm: 14px; --fs-md: 16px;
  --fs-lg: 20px; --fs-xl: 28px; --fs-2xl: 40px;

  --radius: 10px;
  --shadow-1: 0 1px 2px rgb(0 0 0 / .3);
}
```

Nomeie por **função** (`--danger`), não por aparência (`--vermelho`). Quando o tema mudar, o nome continua verdadeiro. Dark mode vira troca de valores dos mesmos tokens, não um segundo CSS.

## Hierarquia visual: as três alavancas

Quando uma tela parece amadora, quase sempre é uma destas:

1. **Espaço**: elementos relacionados ficam perto, não relacionados ficam longe. Falta de respiro é o erro mais comum. Na dúvida, dobre o espaço.
2. **Contraste e peso**: exatamente um elemento dominante por tela. Se tudo grita, nada é lido.
3. **Alinhamento**: tudo se alinha a uma grade. Um item 3px fora do eixo é percebido mesmo por quem não sabe explicar por quê.

Cor vem por último — cor não conserta hierarquia quebrada.

## Componentes

Padrão para cada componente do design system:

- **Uma responsabilidade.** `Button` renderiza um botão; ele não decide navegação nem faz fetch.
- **Variantes, não flags.** `variant="primary" | "secondary" | "ghost"` em vez de `isPrimary` + `isGhost` (que permite combinações impossíveis).
- **Composição sobre props infinitas.** Se um componente já tem 12 props, quebre em partes componíveis (`<Card><Card.Header/><Card.Body/></Card>`).
- **Encaminhe props nativas** (`...rest`, `ref`, `aria-*`) para não obrigar a reescrever o componente na primeira exceção.

Todo componente interativo precisa dos 6 estados implementados: `default`, `hover`, `active`, `focus-visible`, `disabled`, `loading`. Faltar `focus-visible` quebra o uso por teclado; faltar `loading` faz o usuário clicar duas vezes e criar registro duplicado.

## Responsividade

Mobile-first: escreva o layout de 360px primeiro e adicione breakpoints para cima. O caminho inverso produz gambiarra de `!important`.

- Prefira layout intrínseco (`flex-wrap`, `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))`) a uma pilha de media queries.
- Alvo de toque mínimo de 44×44px.
- Use `dvh` no lugar de `vh` — a barra do navegador mobile quebra `100vh`.
- Teste em 360px, 768px e 1440px antes de entregar.

## Acessibilidade (o mínimo inegociável)

Não é caridade: é o que faz a UI funcionar com teclado, leitor de tela e em tela de celular no sol.

- HTML semântico primeiro. `<button>` para ação, `<a>` para navegação. `div` clicável exige recriar teclado, foco e papel — não vale a pena.
- Contraste ≥ 4.5:1 para texto normal.
- Todo campo de formulário com `<label>` associado. Placeholder não é label.
- Foco visível sempre. Se remover o outline, coloque outro indicador.
- Nunca use só cor para comunicar estado — some ícone ou texto.
- Respeite `prefers-reduced-motion`.

## Movimento

Animação serve para explicar mudança de estado, não para enfeitar.

- Duração: 120–200ms para micro-interação, 250–400ms para transição de tela. Acima disso, a interface parece lenta.
- Anime só `transform` e `opacity`.
- Entrada e saída com curvas diferentes: `ease-out` ao aparecer, `ease-in` ao sumir.

## Checklist de entrega de UI

- [ ] Nenhum valor mágico de cor/espaço fora dos tokens
- [ ] 6 estados em todo componente interativo
- [ ] Layout íntegro em 360px e em 1440px
- [ ] Navegável só pelo teclado, com foco visível
- [ ] Contraste conferido
- [ ] Texto longo, nome curto e lista vazia testados (a UI quebra nos extremos, não no caso médio)
