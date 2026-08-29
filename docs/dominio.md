# Domínio — registros de quebra

Anotações do que o sistema precisa fazer, em construção. Serve para a
especificação de cada tela não precisar repetir o contexto.

## O que o sistema gere

A função principal é **validade**, mas o alcance é **quebra de estoque**: tudo
que sai do estoque sem ser vendido — vencido, danificado, e o que mais vier.

Vencido e danificado são a mesma coisa com causa diferente: os dois têm
produto, quantidade, data da ocorrência, quem registrou e o que aconteceu com o
item depois. Por isso o motivo é um **campo do registro**, não um tipo separado
de registro. Modelar "validade" como única forma de perda obrigaria a remendar
cada motivo novo.

## O cadastro de produtos é consultado, não duplicado

Todo registro de quebra aponta para um produto do cadastro. Só o administrador
o alimenta (ver CLAUDE.md, "Perfis de acesso") — e o motivo é mais forte do que
padronização visual: sem esse controle, "TINTA ACR FOSCA 18L", "tinta acrilica
fosca 18 litros" e "TA FOSCA 18L" viram três produtos, e o relatório passa a
mentir, porque a mesma perda aparece dividida em três.

**O operador não tem a tela do cadastro no menu.** Para ele aquilo seria um beco
sem saída: encontra o produto e não há nada a fazer ali. A busca de produto vive
**dentro do registro de quebra**, no momento em que ele precisa dela — lê o
código, o sistema mostra o produto, ele confirma e segue.

A tela continua existindo para o administrador, que é quem trabalha nela:
importar, corrigir, resolver pendências.

### Produto que ainda não existe no cadastro

O operador está no corredor com o produto na mão. Se ele não estiver no
cadastro, **o registro não pode ser bloqueado** — a perda aconteceu de qualquer
jeito, e mandar a pessoa procurar o administrador antes de registrar garante
que o registro não vai existir.

Então o registro é salvo com o produto marcado como **pendente de cadastro**, e
o operador preenche o resto do formulário normalmente.

O que fica pendente depende do que ele tinha em mãos:

| O operador tinha | Fica pendente |
|---|---|
| Código de barras (leu pela câmera) | SKU e descrição |
| SKU (leu da etiqueta de gôndola) | Código de barras |

Resolver a pendência é trabalho do administrador, no cadastro de produtos.

## Como um registro é classificado

Dois eixos separados, não uma lista única de etiquetas:

| Campo | O que responde | Exemplos |
|---|---|---|
| **Motivo** (obrigatório) | por que virou perda | vencido, danificado, avaria |
| **Origem** (opcional) | de onde veio o problema | chegou assim do CD, aconteceu na loja, fornecedor |

Um item pode ser *danificado* **e** ter chegado *assim do CD*: são coisas
diferentes. Numa lista só, as opções cresceriam por combinação ("danificado",
"danificado do CD", "vencido do CD"…) e os relatórios não separariam mais.

Separar importa por dinheiro: "quanto perdemos por avaria" é uma pergunta,
"quanto disso veio do CD" é outra — e a segunda é a que dá base para cobrar o
centro de distribuição.

## O que identifica um registro

**Produto + validade + motivo.**

A validade é o que distingue de verdade: duas unidades do mesmo produto com
validades diferentes são coisas diferentes — uma ainda se vende, a outra não.
A origem é atributo do registro, não parte da identidade.

## Registro repetido do mesmo item

Ao iniciar um registro, se já existe outro com **o mesmo produto, a mesma
validade e o mesmo motivo**, o usuário é avisado — não impedido. O aviso existe
para ele decidir: somar ao registro existente ou criar outro.

A chave importa mais do que parece. Avisando só por produto, o aviso dispararia
o tempo todo — e aviso que aparece sempre vira aviso que ninguém lê. Em poucas
semanas o operador dispensaria por hábito, inclusive quando fosse duplicidade
real.

Repetição continua legítima e esperada: o mesmo produto pode ter unidades
vencidas e unidades danificadas, ou dois lotes com validades diferentes.

## A tela de quebra

Para onde os itens são baixados depois de apontados. Ali o usuário administra
**o que ainda está no estoque** e **o que já não está** — a lista aceita itens
repetidos do mesmo produto, justamente por causa dos motivos diferentes.

## O que veio do AppSheet e não se repete aqui

O app anterior tinha tabelas que existiam para contornar limitações da
ferramenta, não porque o domínio pedia:

- **Filtro Personalizado**, que era uma tela inteira só para guardar o filtro
  escolhido. Aqui o filtro é lembrado sozinho em `localStorage` (ver CLAUDE.md,
  "Filtros e buscas são lembrados") — a tela não precisa existir.
- **TotalSituação** e **Período de dados**, que serviam para calcular
  totalizações que a ferramenta não fazia direto.

As tabelas de **cadastro manual** (motivos, situações) continuam fazendo
sentido: são dados que alguém mantém, não contorno de ferramenta.

## Riscos a desenhar junto

**Pendências acumulam.** Se o administrador não tiver uma fila visível com
contador, elas apodrecem e a base volta a ficar furada. "Produtos pendentes"
precisa ser um lugar com número na cara dele, não algo que ele lembre de
procurar.

**Dois operadores criam a mesma pendência.** Encontram o mesmo produto
desconhecido em dias diferentes. Casar por código de barras na criação evita
que o administrador resolva a mesma coisa duas vezes.

## Ainda em aberto

Pontos que a especificação de cada tela precisa fechar:

- Quais são os estados de um item na tela de quebra ("ainda no estoque",
  "retirado", …) e o que faz cada um mudar.
- A lista de motivos e a de origens: quais valores, e se são fixas no código ou
  mantidas numa tela.
- O que o aviso de registro repetido oferece: somar quantidade ao existente,
  abrir o registro existente, criar outro — quais dessas.
- Se o registro guarda foto (o app anterior tinha foto da etiqueta do lote e do
  produto) e se ela é obrigatória em algum motivo.
- De onde vêm saldo e saídas: hoje só existem na planilha do ERP, não são
  digitados.
