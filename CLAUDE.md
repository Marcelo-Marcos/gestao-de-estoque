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

## Estado do back-end

Ainda não existe. Cada feature isola o acesso a dados em seu `api.ts`, hoje
resolvido em memória. Quando o servidor existir, só esses arquivos mudam — as
telas não.

## Comandos

```bash
npm run dev     # desenvolvimento
npm run build   # build de produção
npm run lint    # checagem de tipos
```
