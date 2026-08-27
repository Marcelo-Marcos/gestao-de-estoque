---
name: ux-flows
description: Desenho de experiência antes do código — mapeamento de fluxo, redução de fricção, onboarding, estados vazios e de erro, microcopy, hierarquia de decisão e heurísticas de usabilidade. Use SEMPRE que o usuário for planejar uma feature nova, descrever o que o produto "deve fazer", pedir cadastro/login/checkout/onboarding, ou disser que usuários estão desistindo, confusos ou abandonando a tela — antes de discutir componentes ou código.
---

# UX — fluxo e comportamento

UX é decidido **antes** do código. Uma tela bonita para um fluxo errado continua sendo um fluxo errado. Quando o pedido é "faça a tela X", a primeira pergunta é: qual trabalho o usuário está tentando terminar?

## Mapeie o fluxo antes de qualquer arquivo

Escreva o caminho em texto, do gatilho até o resultado:

```
Gatilho: quer montar um deck para jogar com o amigo
1. Abre "Meus decks"           → estado vazio precisa convidar à ação
2. Toca "Criar deck"
3. Escolhe cartas               → precisa filtrar e ver custo total
4. Salva                        → validação: mínimo de 20 cartas
Sucesso: deck aparece na lista, pronto para partida
Falhas possíveis: deck incompleto, nome repetido, sem conexão
```

Esse mapa expõe telas esquecidas (estado vazio, erro de rede) e revela passos desnecessários. Sempre pergunte de cada passo: **é possível eliminar isso?** O melhor passo é o que não existe.

## Princípios que decidem discussões

- **Reconhecer é mais fácil que lembrar.** Mostre opções em vez de exigir que o usuário digite um código que memorizou.
- **Defaults são a decisão mais poderosa do produto.** A maioria não muda o padrão. O padrão deve ser o certo para o caso comum.
- **Peça informação no momento em que ela é necessária**, não tudo no cadastro. Cada campo no formulário inicial derruba conversão.
- **Feedback imediato.** Ação sem resposta visível em ~100ms parece quebrada. Acima de 1s, mostre progresso.
- **Prevenir erro > mensagem de erro.** Desabilite datas impossíveis em vez de reclamar depois. Valide no campo, ao sair dele, não só ao submeter.
- **Reversibilidade em vez de confirmação.** "Desfazer" depois da ação é melhor que "Tem certeza?" antes — exceto em ação destrutiva e irreversível.
- **Uma decisão principal por tela.** Duas ações com o mesmo peso visual = usuário parado.

## Onboarding

O objetivo não é explicar o produto: é levar a pessoa ao primeiro momento de valor o mais rápido possível.

- Identifique o **primeiro momento de valor** (para um card game: jogar uma partida, não criar conta). Adie tudo que não leva até lá.
- Permita usar antes de cadastrar sempre que possível; peça conta na hora de salvar o progresso — aí o usuário tem motivo.
- Tutorial que interrompe é pior que tutorial contextual. Ensine no momento do uso, uma coisa por vez.
- Estado vazio bem feito é o melhor onboarding: explique o que aquilo vai virar e ofereça a ação, ou dê um exemplo pré-preenchido.

## Microcopy

O texto é parte da interface. Regras:

- Botão descreve o resultado: "Salvar deck", não "Enviar" ou "OK".
- O nome da ação é o mesmo do começo ao fim: botão "Publicar" → mensagem "Publicado".
- Erro diz **o que aconteceu e como resolver**, sem culpar e sem jargão. Ruim: "Erro 422: validação falhou." Bom: "Seu deck precisa de pelo menos 20 cartas. Faltam 6."
- Nomeie pelo que o usuário controla, não pela implementação: "Notificações", não "Configuração de webhook".
- Frases curtas, voz ativa, sem "por favor" decorativo.

## Formulários (onde mais se perde usuário)

- Uma coluna. Rótulo acima do campo.
- Só campos essenciais; marque os opcionais, não os obrigatórios (se quase tudo é obrigatório, marcar todos é ruído).
- Tipo de teclado correto no mobile (`inputmode="numeric"`, `type="email"`).
- Erros ao lado do campo, não em um bloco no topo.
- Nunca limpe o formulário depois de um erro. Perder o que foi digitado é a fricção mais irritante que existe.

## Revisão de fluxo (checklist)

Passe qualquer feature por isto antes de implementar:

- [ ] Qual é o passo que dá para eliminar?
- [ ] O que acontece na primeira vez (sem nenhum dado)?
- [ ] O que acontece quando falha ou fica offline?
- [ ] Dá para desfazer?
- [ ] O usuário sabe onde está e como voltar?
- [ ] Quantos toques até o valor principal? Dá para fazer em menos?
- [ ] O que essa tela pede que poderia ser inferido pelo sistema?

## Como testar sem orçamento

Cinco pessoas encontram a maior parte dos problemas graves. Dê a tarefa ("monte um deck e comece uma partida") sem explicar nada e **fique calado**. Onde a pessoa hesita é onde está o problema — a hesitação vale mais que a opinião dela. Anote o que fizeram, não o que disseram que fariam.
