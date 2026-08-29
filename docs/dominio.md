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

Todo registro de quebra aponta para um produto do cadastro. Por isso o cadastro
é legível por todos, e só o administrador o alimenta (ver CLAUDE.md, "Perfis de
acesso").

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

## Registro repetido do mesmo item

Ao iniciar um registro, se **já existe registro daquele item**, o usuário
precisa ser avisado — não impedido. O aviso existe para ele decidir: somar ao
registro existente, ou criar outro.

Repetição é legítima e esperada: o mesmo produto pode ter unidades **vencidas**
e unidades **danificadas**, e são perdas diferentes, com destinos diferentes.

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

## Ainda em aberto

Pontos que a especificação de cada tela precisa fechar:

- Quais são os estados de um item na tela de quebra ("ainda no estoque",
  "retirado", …) e o que faz cada um mudar.
- Se "já existe registro" considera o mesmo produto ou o mesmo produto **com o
  mesmo motivo**.
- Se registrar quebra é permitido ao operador ou só ao administrador.
- Qual a lista de motivos e se ela é fixa ou mantida pelo usuário.
