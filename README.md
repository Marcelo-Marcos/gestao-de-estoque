# Gestão de Validades

Ferramenta complementar ao ERP para controlar **validade de produtos** — recurso que o
ERP atual da empresa não oferece. Importa planilhas de saldo e saída do ERP, casa os
produtos pelo código, e sinaliza o que está vencido ou perto de vencer.

## Estado atual

Em construção. Front-end primeiro, regras de negócio depois.

| Etapa | Situação |
|---|---|
| Autenticação (login, recuperação de senha) | pronta, com dados simulados |
| Cadastro de produtos | a fazer |
| Importação de planilha do ERP | a fazer |
| Painel de validades e alertas | a fazer |
| Leitura de código de barras pela câmera | a fazer |

> **Sem back-end ainda.** `src/features/auth/api.ts` resolve tudo em memória para permitir
> validar as telas. Quando o servidor existir, só esse arquivo muda.

## Rodando

```bash
npm install
npm run dev
```

Contas de teste: `admin@belatintas.com.br` ou `operador@belatintas.com.br`, senha `senha123`.

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção em `dist/` |
| `npm run lint` | checagem de tipos |

## Estrutura

Organizada por **feature**, não por tipo de arquivo. Uma feature nunca importa de dentro
de outra — só do `index.ts` dela ou de `shared/`.

```
src/
  app/          rotas, guarda de sessão
  features/
    auth/       login, recuperação de senha, sessão
  shared/
    ui/         design system (Button, TextField, Alert, Logo)
    lib/        helpers puros, sem React
  styles/       tokens.css (vocabulário visual) + global.css
```

## Decisões de design

**A faixa de validade** é a assinatura visual do produto: uma barra que traduz dias
restantes em cor. Aparece no logo e vai se repetir nos cards e linhas de produto, de
modo que a cor sempre signifique a mesma coisa em qualquer tela.

| Cor | Significado |
|---|---|
| vermelho `--expired` | já passou da data |
| âmbar `--warning` | dentro do prazo de alerta |
| verde `--ok` | gira antes de vencer |
| cinza `--unknown` | sem data cadastrada |

Essas cores carregam significado de negócio e não devem ser reusadas como decoração.
Todo valor de cor, espaço e tipografia vem de `src/styles/tokens.css` — nada de valor
mágico solto no CSS.

### Autenticação

- A mensagem de erro é a mesma para e-mail inexistente e senha errada, e a recuperação
  confirma o envio mesmo quando a conta não existe. Revelar a diferença transformaria as
  telas em uma forma de descobrir quais e-mails estão cadastrados.
- O formulário nunca é limpo depois de um erro.
- "Manter conectado" vem ligado: é uso interno e diário.
