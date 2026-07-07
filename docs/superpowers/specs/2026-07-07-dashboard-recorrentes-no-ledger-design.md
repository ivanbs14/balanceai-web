# Dashboard Recorrentes No Ledger Design

## Contexto

A dashboard hoje separa `Custos Fixos` de `Gastos do Mes`, embora o fluxo de cadastro recorrente ja alimente `fixed-costs` como dominio proprio. O pedido atual nao troca o backend; ele muda a leitura operacional da tela.

O usuario quer:

- remover o container `Custos Fixos`;
- mostrar itens recorrentes no container `Gastos do mes`;
- acrescentar as colunas `Recorrencia` e `Vencimento` no ledger principal.

## Decisao

Manter `fixed-costs` como fonte de dados e mutacao no backend, mas fundir sua exibicao ao ledger `Gastos do mes` no frontend.

## Escopo

- compor uma lista unica de despesas do mes com:
  - transacoes `EXPENSE`;
  - itens de `fixed-costs` projetados para a competencia ativa;
- preservar toggle de pago/pendente por origem;
- remover a secao visual `Custos Fixos`;
- exibir `Recorrencia` e `Vencimento` nas linhas recorrentes.

## Fora de escopo

- migrar o dominio `fixed-costs` para `Transation`;
- alterar endpoints do backend;
- criar edicao ou exclusao de recorrentes via ledger principal.

## Arquitetura

`mapDashboardViewModel` passa a fundir duas fontes em `monthlyExpenses`:

1. transacoes reais do mes;
2. itens recorrentes de `fixed-costs` do mes.

Cada linha do ledger passa a carregar metadados de origem:

- `transaction`
- `fixed-cost`

Isso permite que a UI continue chamando:

- `PATCH /transations/:id/payment-status` para transacao;
- `PATCH /fixed-costs/:id/monthly/:competence` para recorrente.

## Regras de rendering

- linhas recorrentes entram como `isFixed = true`;
- `Recorrencia` mostra o label derivado de `MONTHLY`, `BIMONTHLY`, `QUARTERLY`, `YEARLY`;
- `Vencimento` mostra `dueDay`;
- linhas nao recorrentes exibem `-` nessas colunas;
- acoes de editar e deletar continuam apenas para transacoes reais.

## Riscos aceitos

- o total visual de `Gastos do mes` pode divergir do resumo agregado, caso o backend nao inclua `fixed-costs` nos mesmos calculos;
- dados antigos com `transaction.isFixed = true` continuam aparecendo como despesas fixas, mesmo sem virem do recurso `fixed-costs`.
