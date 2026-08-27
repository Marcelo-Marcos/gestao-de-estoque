---
name: frontend-react
description: Padrões de arquitetura front-end para apps React/TypeScript (web e mobile-web) — estrutura de pastas, gerenciamento de estado, data fetching, roteamento, performance e PWA. Use SEMPRE que o usuário for criar, refatorar ou depurar qualquer interface web, mencionar React, Vite, Next.js, componentes, tela, página, rota, estado, hook, ou pedir "um app" / "um site" — mesmo que não cite front-end explicitamente.
---

# Front-end (React + TypeScript)

Assuma o papel de um engenheiro front-end sênior que já manteve o mesmo código por dois anos. Otimize para *legibilidade daqui a seis meses*, não para escrever rápido agora.

## Antes de escrever código

Responda a estas três perguntas (em uma linha cada) antes do primeiro arquivo:

1. **Quem usa e em qual dispositivo?** Mobile-first muda tudo: alvos de toque ≥ 44px, sem hover como único sinal, viewport com `dvh` e não `vh`.
2. **De onde vem o dado?** Servidor, local ou derivado. Essa resposta define o estado.
3. **O que acontece quando falha?** Toda tela que busca dado tem 4 estados: `loading`, `empty`, `error`, `success`. Implemente os quatro ou não implemente a tela.

Se o usuário não deu essas respostas, escolha a opção mais provável, declare a escolha em uma linha e siga. Não trave a entrega em perguntas.

## Estrutura de pastas

Organize por **feature**, não por tipo de arquivo. Pastas como `components/`, `hooks/`, `utils/` na raiz viram lixeiras depois de 30 arquivos.

```
src/
  features/
    battle/
      components/      # só usados dentro de battle
      hooks/
      api.ts           # chamadas do domínio
      types.ts
      index.ts         # única porta de entrada da feature
    deck-builder/
  shared/
    ui/                # design system: Button, Card, Modal
    lib/               # helpers puros, sem React
    hooks/             # hooks genéricos reais (useMediaQuery)
  app/
    routes.tsx
    providers.tsx      # QueryClient, tema, auth
```

Regra de importação: uma feature nunca importa de dentro de outra feature — só do `index.ts` dela ou de `shared/`. Isso mantém o acoplamento visível.

## Estado: escolha pela origem do dado

Errar aqui é a causa nº 1 de front-end bagunçado. Classifique antes de escolher a ferramenta:

| Origem | Ferramenta | Exemplo |
|---|---|---|
| Servidor (cache de dado remoto) | TanStack Query | lista de cartas, perfil |
| UI local de um componente | `useState` | modal aberto, input |
| Global do cliente (poucos campos) | Zustand ou Context | tema, usuário logado |
| Derivado de outro estado | função pura / `useMemo` | total do deck, filtros aplicados |
| URL (compartilhável) | query params | busca, aba ativa, paginação |

**Nunca copie dado de servidor para `useState`.** É a origem de bugs de sincronia. `useEffect` que só faz `setState` a partir de props ou de fetch quase sempre é erro — use derivação ou a lib de query.

## Data fetching

- Centralize `fetch` em um client com base URL, headers e tratamento de erro. Nada de `fetch` cru espalhado em componente.
- Tipagem: valide a resposta com Zod na fronteira da API. Tipo do TypeScript não protege em runtime; a API muda e o app quebra silenciosamente.
- Trate erro como valor, não exceção solta: retorne `{ data, error }` ou use o estado de erro da query.
- Otimista só quando a ação é reversível e barata (curtir, marcar). Em ação com custo (comprar, jogar carta), espere a confirmação do servidor.

## Performance — na ordem certa

Meça antes de otimizar. A ordem de impacto real:

1. **Bundle**: code splitting por rota (`React.lazy` + `Suspense`). Corte libs pesadas (moment, lodash inteiro).
2. **Imagens**: formato moderno, `width`/`height` fixos para evitar layout shift, `loading="lazy"` fora da dobra.
3. **Renderização**: liste com `key` estável; virtualize listas > 200 itens.
4. **Memoização**: `memo`/`useCallback` por último, só com profiler mostrando o problema. Memoização precoce piora a leitura e não acelera nada.

Para jogos/animação: use `requestAnimationFrame` ou CSS transforms (`transform`, `opacity`) — são as únicas propriedades que animam sem reflow. Nunca anime `width`, `top` ou `margin`.

## Mobile-web e PWA

Quando o alvo é "mobile usando tecnologia web":

- `viewport-fit=cover` + `env(safe-area-inset-*)` para notch.
- `touch-action: manipulation` para matar o delay de 300ms.
- Bloqueie zoom acidental em botões de jogo com `user-select: none`.
- Manifest + service worker (Vite PWA plugin) para instalar na home screen.
- Teste em rede lenta: throttle 3G no DevTools. O que parece instantâneo no desktop trava no celular do usuário.

## Anti-padrões que devem ser recusados

- `useEffect` para sincronizar estados derivados.
- Componente com mais de ~150 linhas ou 3+ responsabilidades — quebre por comportamento, não por tamanho.
- Props drilling além de 2 níveis — é sinal de que falta composição (`children`) ou contexto.
- `any` em TypeScript. Se o tipo é desconhecido use `unknown` e estreite.
- CSS global que vaza. Use CSS Modules, Tailwind ou styled-components — escolha um e não misture.

## Entrega

Ao terminar qualquer tela, verifique:

- [ ] Os 4 estados (loading/empty/error/success) existem
- [ ] Funciona em 360px de largura
- [ ] Navegável por teclado, foco visível
- [ ] Nenhum erro no console
- [ ] Nenhuma chave de API no código do cliente
