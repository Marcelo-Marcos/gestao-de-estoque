---
name: database-design
description: Modelagem e operação de banco de dados relacional (PostgreSQL, Supabase) — schema, chaves, normalização, migrations, índices, transações, Row Level Security e performance de query. Use SEMPRE que o usuário falar em tabela, schema, modelagem, migration, SQL, query lenta, relacionamento entre entidades, "salvar os dados", Supabase ou Postgres — e também antes de escrever qualquer feature que persista dados, mesmo que ele só tenha descrito a tela.
---

# Banco de dados (PostgreSQL / Supabase)

O schema é a decisão mais cara de reverter no projeto. Código se reescreve em uma tarde; migrar dados de produção com usuários ativos, não. Gaste tempo aqui antes de gastar em tela.

## Modele em três passos

1. **Liste os substantivos do domínio.** Usuário, carta, deck, partida, jogada. Cada substantivo com identidade própria vira tabela.
2. **Escreva a cardinalidade em português.** "Um usuário tem muitos decks; um deck tem muitas cartas e uma carta está em muitos decks." Relação muitos-para-muitos sempre vira tabela de junção (`deck_cards`).
3. **Escreva as perguntas que o app vai fazer.** "Quais decks do usuário X?", "Qual o histórico das últimas 20 partidas?". O schema precisa responder cada uma sem gambiarra. Se uma pergunta exige varrer tudo e filtrar na aplicação, o modelo está errado.

## Convenções que evitam retrabalho

- Tabelas no plural e em snake_case: `deck_cards`.
- Chave primária `id uuid default gen_random_uuid()` — UUID evita colisão em sync offline e não vaza volume de negócio como um id sequencial faz.
- `created_at timestamptz not null default now()` e `updated_at timestamptz` em toda tabela. Sempre `timestamptz`, nunca `timestamp` sem fuso.
- Dinheiro em `numeric(12,2)` ou centavos em `bigint`. **Nunca** `float` — arredondamento binário perde dinheiro de verdade.
- Estados fechados em `enum` do Postgres ou coluna `text` + `check`. String livre para status vira "ativo", "Ativo", "ATIVO" no mesmo banco em três meses.
- `not null` é o padrão; permitir nulo é uma decisão que precisa de justificativa. Nulo espalhado é bug futuro.

## Integridade no banco, não só no código

Foreign keys com `on delete` explícito (`cascade` para dependente real, `restrict` para proteger). Constraints `unique` e `check` no banco. A aplicação não é a única coisa que escreve — você vai rodar script manual, e o banco é a última linha de defesa.

```sql
create table decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);
```

## Migrations

Toda mudança de schema é um arquivo de migration versionado no git. Nunca altere schema pelo painel gráfico em produção — o ambiente local sai de sincronia e ninguém sabe mais qual é a verdade.

Migration segura em produção acontece em etapas (expand → migrate → contract):

1. Adicione a coluna nova como nullable.
2. Faça a aplicação escrever nas duas.
3. Preencha os dados antigos em lote.
4. Só então torne obrigatória e remova a antiga.

Rename direto de coluna com app rodando causa downtime. Toda migration deve ter caminho de volta pensado antes de rodar.

## Índices

Regra prática: indexe **toda foreign key** e toda coluna que aparece em `where`, `join` ou `order by` de query frequente. Índice acelera leitura e desacelera escrita — não indexe tudo.

Para descobrir o problema real, use `explain analyze`. Sinais de alerta: `Seq Scan` em tabela grande, `rows` estimado muito diferente do real.

Índice composto obedece ordem: `(user_id, created_at)` serve para filtrar por usuário e ordenar por data; `(created_at, user_id)` não serve para a mesma query.

## Transações

Toda operação com múltiplas escritas relacionadas roda em transação. Debitar de um lado e creditar do outro fora de transação é como se perde dado que ninguém consegue reconstruir. Mantenha a transação curta — nunca com chamada de rede ou de API de IA dentro dela.

## Row Level Security (Supabase)

Se o cliente fala direto com o banco via `anon key`, RLS é a **única** coisa entre o dado de um usuário e outro.

- Ative RLS em toda tabela: `alter table decks enable row level security;`
- Uma política por operação (`select`, `insert`, `update`, `delete`), sempre amarrando `auth.uid()`.
- Teste a política tentando ler o dado de outro usuário. Política não testada é política que não existe.

```sql
create policy "dono lê seus decks"
  on decks for select
  using (auth.uid() = user_id);
```

Atenção: tabela sem RLS ativado + `anon key` no cliente = banco público. Verifique isso antes de qualquer deploy.

## Antes de dar por pronto

- [ ] Toda FK indexada e com `on delete` explícito
- [ ] Nada de `float` para dinheiro, nada de `timestamp` sem fuso
- [ ] RLS ativado e testado em todas as tabelas expostas
- [ ] Migrations versionadas, com caminho de volta
- [ ] As queries principais rodam com índice (`explain analyze` conferido)
- [ ] Backup/restauração testados pelo menos uma vez
