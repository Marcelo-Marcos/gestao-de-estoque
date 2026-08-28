# Gestão de Validades — instruções do projeto

Ferramenta complementar ao ERP para controle de validade de produtos.

## Regras permanentes de interface

Valem para **toda** tela criada neste projeto, sem exceção e sem precisar ser
repetidas a cada pedido:

1. **Responsiva.** Layout íntegro de 360px a 1440px. Mobile-first: escreva o
   layout estreito primeiro. Alvo de toque mínimo de 44×44px — o sistema é
   usado no corredor da loja, com celular na mão.
2. **Dark mode é o padrão**, com tema claro disponível. Uma tela de
   configurações permitirá trocar; até ela existir, a infraestrutura de tema já
   deve estar pronta.
3. **Cores personalizáveis.** Nenhum valor de cor escrito direto no CSS de
   componente. Tudo sai dos tokens em `src/styles/tokens.css`, para que trocar
   a identidade visual seja trocar valores de token, nunca reescrever CSS.

Consequência prática: um componente novo nunca declara `#hex`, `rgb()` ou
`hsl()`. Se falta um token para o que você precisa, crie o token.

## Filtros e buscas são lembrados

Todo filtro, busca, ordenação ou aba selecionada é gravado em `localStorage`
e restaurado ao abrir o app. Quem fechou o sistema no meio de uma conferência
volta exatamente onde estava, sem refazer a seleção.

Use `usePersistedState` (em `shared/hooks/`) — ele já trata storage bloqueado e
registro corrompido. Nunca chame `localStorage` direto num componente.

Contrapartida obrigatória: um filtro restaurado precisa ser **visível e fácil de
desfazer**. Uma lista filtrada que parece a lista inteira é pior do que não
lembrar nada — mostre o que está ativo e ofereça um jeito de limpar.

## Semântica de cor de validade

Estas cores carregam significado de negócio e **não** podem ser reusadas como
decoração:

| Token | Significado |
|---|---|
| `--expired` | já passou da data |
| `--warning` | dentro do prazo de alerta |
| `--ok` | gira antes de vencer |
| `--unknown` | sem data cadastrada |

Nunca comunique estado só por cor: acompanhe ícone ou texto.

## Arquitetura

Organização por **feature**, não por tipo de arquivo. Uma feature nunca importa
de dentro de outra — só do `index.ts` dela ou de `shared/`.

```
src/
  app/        rotas, guarda de sessão, layout geral
  features/   auth/, products/ ...
  shared/     ui/ (design system), lib/ (helpers puros)
  styles/     tokens.css, global.css
```

## Tamanho de arquivo e modularização

Arquivo grande é caro de ler e de manter. Diretrizes, não dogma:

- **Componente acima de ~150 linhas** ou com 3+ responsabilidades: quebre por
  **comportamento**, não por tamanho. Um assistente de várias etapas vira uma
  etapa por arquivo, mais um hook com a máquina de estados.
- **Lógica sai do componente.** Busca de dados, validação e transformação vão
  para hooks ou funções puras; o componente cuida de desenhar.
- **Se dois lugares repetem a mesma lógica**, ela vira um módulo em `shared/`.
- Um arquivo longo por ser uma lista de dados (ícones, tokens, tabela de
  constantes) está tudo bem — o problema é lógica misturada, não linhas.

Ao terminar uma feature, olhe os arquivos que ela criou: se algum passou de
~200 linhas, provavelmente há um hook ou um subcomponente querendo sair.

## Estado do back-end

Ainda não existe. Cada feature isola o acesso a dados em seu `api.ts`, hoje
resolvido em memória. Quando o servidor existir, só esses arquivos mudam — as
telas não.

## Checagem automática dos padrões

Parte das regras acima é verificada por máquina, não por memória. `npm run
lint` roda antes de todo commit (hook em `.githooks/pre-commit`, ativado
sozinho pelo `npm install`) e falha se:

| Regra | O que reprova | Onde está configurada |
|---|---|---|
| Cor fora de token | `#hex`, `rgb()`, `hsl()` em CSS de componente | `stylelint.config.js` |
| Storage direto | `localStorage`/`sessionStorage` fora de `shared/lib/storage.ts` | `eslint.config.js` |
| Acoplamento entre features | importar `@/features/x/algo` em vez de `@/features/x` | `eslint.config.js` |
| Arquivo grande | acima de 200 linhas de código (aviso) | `eslint.config.js` |

O que **não** dá para automatizar continua valendo e depende de julgamento:
responsividade real, dark mode conferido nos dois temas, filtro restaurado
visível e fácil de desfazer, e cor nunca sendo o único sinal de estado.

Para pular a checagem numa emergência: `git commit --no-verify`.

## Comandos

```bash
npm run dev         # desenvolvimento
npm run build       # build de produção
npm run lint        # tipos + código + CSS (o que o hook roda)
npm run lint:types  # só TypeScript
npm run lint:code   # só ESLint
npm run lint:css    # só Stylelint
```
