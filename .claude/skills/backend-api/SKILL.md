---
name: backend-api
description: Padrões para construir APIs e serviços de back-end (Node/TypeScript, Edge Functions, serverless) — camadas, contratos, validação, autenticação, tratamento de erros, jobs e segurança. Use SEMPRE que o usuário mencionar API, endpoint, rota, servidor, autenticação, login, webhook, integração, pagamento, "salvar no servidor" ou qualquer lógica que não pode rodar no navegador — mesmo que ele não diga "back-end".
---

# Back-end (API e serviços)

Assuma o papel de quem vai ser acordado às 3h da manhã quando isso quebrar. Escreva pensando em: dá para descobrir o que aconteceu só pelos logs?

## A regra que resolve 80% dos problemas

**O cliente é hostil.** Não porque o usuário é mau, mas porque qualquer pessoa pode chamar sua API com qualquer payload. Toda entrada é não confiável até ser validada. Toda regra de negócio validada no front-end deve ser validada de novo no servidor. Se o front impede jogar uma carta inválida, o servidor também impede — senão alguém joga pelo console.

## Camadas

Três camadas, sem exceção, mesmo em projeto pequeno:

```
route/handler   → traduz HTTP: parse, valida entrada, chama serviço, formata resposta
service         → regra de negócio pura, não sabe o que é HTTP
repository      → acesso a dados, única camada que fala SQL/ORM
```

O teste: se você trocasse HTTP por WebSocket, só a camada de rota mudaria. Handler com SQL dentro é dívida técnica imediata.

## Contratos de API

Defina o contrato antes de implementar. Um schema (Zod no TS) serve como validação, documentação e tipo ao mesmo tempo:

```ts
const CreateDeckInput = z.object({
  name: z.string().min(1).max(40),
  cardIds: z.array(z.string().uuid()).min(20).max(40),
});
type CreateDeckInput = z.infer<typeof CreateDeckInput>;
```

Convenções:

- Recursos no plural: `/decks`, `/decks/:id/cards`.
- Verbo é o método HTTP, não a URL. `POST /decks`, não `POST /createDeck`.
- Status corretos: `200` ok, `201` criado, `400` entrada inválida, `401` não autenticado, `403` autenticado mas sem permissão, `404` não existe, `409` conflito de estado, `422` semanticamente inválido, `429` rate limit, `500` culpa sua.
- Erro sempre no mesmo formato:

```json
{ "error": { "code": "DECK_TOO_SMALL", "message": "Um deck precisa de 20 cartas ou mais." } }
```

`code` é para o cliente ramificar; `message` é para humano. Nunca vaze stack trace, SQL ou nome de tabela na resposta.

## Autenticação e autorização

São coisas diferentes: **autenticação** = quem é você; **autorização** = o que você pode fazer. A maioria das falhas de segurança em app de indie dev é autorização esquecida.

- Autenticação: use um provedor pronto (Supabase Auth, Auth0, Clerk). Não implemente hash de senha, reset de senha e sessão do zero — o custo de errar é alto e o ganho é zero.
- Autorização: em **todo** endpoint que toca dado de usuário, verifique explicitamente que o recurso pertence a quem pediu. `WHERE id = $1 AND user_id = $2`, nunca só `WHERE id = $1`.
- Segredos em variável de ambiente, nunca no repositório. `service_role key` só no servidor — se ela aparece em código de cliente, o banco inteiro está exposto.
- Rate limit em qualquer rota pública, especialmente login, cadastro e qualquer coisa que chame IA paga.

## Erros e observabilidade

- Distinga erro **esperado** (validação, saldo insuficiente) de **inesperado** (banco fora do ar). Esperado vira resposta 4xx sem alarme; inesperado vira log de nível `error` + 500 genérico.
- Log estruturado (JSON) com `requestId`, `userId`, rota e duração. Log em texto solto não serve para investigar nada.
- Nunca logue senha, token, CPF ou cartão.
- Toda operação que muda dinheiro ou estado crítico precisa ser **idempotente**: aceite uma `Idempotency-Key` e retorne o mesmo resultado se a chamada repetir. Rede mobile faz retry sozinha.

## Trabalho assíncrono

Se uma requisição leva mais de ~2 segundos (envio de e-mail, geração de imagem, chamada de LLM, relatório), não faça na requisição. Enfileire e responda `202` com um id de acompanhamento. Retry com backoff exponencial e um limite de tentativas — retry infinito derruba o serviço e a conta.

## Integração com LLM no back-end

Quando o app chama modelos de IA:

- A chave **nunca** vai para o cliente. Sempre um proxy no servidor.
- Trate resposta de modelo como entrada não confiável: valide o JSON com schema antes de usar.
- Defina timeout e teto de tokens; sem isso, o custo é ilimitado.
- Faça cache do que for determinístico. Prompt igual, resposta igual, dinheiro economizado.

## Checklist antes de considerar pronto

- [ ] Toda entrada validada por schema no servidor
- [ ] Toda query filtra por dono do recurso
- [ ] Nenhum segredo no código versionado
- [ ] Erros retornam formato padronizado e sem detalhes internos
- [ ] Rate limit nas rotas públicas
- [ ] Logs permitem reconstruir uma requisição que falhou
