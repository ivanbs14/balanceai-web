# FEAT-003 Dashboard Shell e Mocks Design

## Contexto

A `FEAT-003` cria a base visual e de dados locais da dashboard web descrita em `balance-doc/features/ready/FEAT-003-dashboard-shell-e-mocks.md`. Essa base precisa respeitar a referencia de `dados/stitch_controle_financeiro_mensal/` e servir como contrato inicial para as subfeatures `FEAT-004` a `FEAT-008`.

O projeto web ja existe em `balance-web/` como um app Next.js com App Router, mas ainda esta no estado inicial do template. Nesta etapa nao ha integracao com backend, autenticacao ou CRUD real.

## Objetivo

Entregar uma pagina base da dashboard que:

- renderiza inteiramente a partir de uma unica fonte local de mocks;
- permite alternar entre pelo menos duas competencias mockadas;
- propaga a competencia ativa para todos os blocos visiveis;
- estabelece um contrato TypeScript unico para os dados da dashboard;
- reproduz o shell visual principal da referencia, com placeholders funcionais de layout.

## Fora de escopo

- navegacao real entre abas superiores;
- integracao com API;
- persistencia;
- formularios reais;
- criacao, edicao ou exclusao de itens.

## Decisoes de design

### Roteamento

A feature sera implementada apenas na rota raiz do App Router, em `src/app/page.tsx`.

As abas superiores `Dashboard`, `Custos Fixos`, `Cartao`, `Investimentos` e `Categorias` serao apenas visuais. Nao havera rotas adicionais ou `Link` funcional nesta etapa.

### Fonte de verdade

Toda a tela sera alimentada por um unico dataset local exportado por `src/features/dashboard/mock-data.ts`.

Esse dataset sera indexado por competencia. A tela mantera apenas um estado local com a competencia ativa e selecionara o objeto de dados correspondente. Nenhum bloco tera fonte propria de dados ou estado derivado do mes.

### Boundary cliente

Como a troca de competencia depende de interacao local, a composicao principal da dashboard sera um componente cliente. O arquivo `src/app/page.tsx` pode delegar a composicao para um componente como `DashboardPage` em `src/features/dashboard/components/`.

O objetivo e limitar o estado ao menor boundary possivel, sem criar store global.

## Estrutura proposta

```text
src/
  app/
    page.tsx
  features/
    dashboard/
      components/
        dashboard-page.tsx
        dashboard-shell.tsx
        month-selector.tsx
        summary-card.tsx
        ledger-table-card.tsx
        breakdown-list-card.tsx
        category-card.tsx
      mock-data.ts
      types.ts
```

## Contrato local de dados

O contrato local precisa cobrir toda a superficie visual da tela sem depender de contratos de backend ainda nao fechados.

### Tipos principais

```ts
type MonthId = string;

type CurrencyAmount = number;

type SummaryMetrics = {
  totalExpenses: CurrencyAmount;
  balance: CurrencyAmount;
};

type FixedCostItem = {
  id: string;
  name: string;
  paymentType: string;
  paid: boolean;
  amount: CurrencyAmount;
};

type CreditCardItem = {
  id: string;
  name: string;
  paymentType: string;
  installmentLabel: string;
  amount: CurrencyAmount;
};

type BreakdownItem = {
  id: string;
  label: string;
  amount: CurrencyAmount;
};

type CategorySpendItem = {
  id: string;
  label: string;
  percentage: number;
  colorToken: string;
};

type DashboardMonthData = {
  id: MonthId;
  label: string;
  summary: SummaryMetrics;
  fixedCosts: FixedCostItem[];
  creditCard: CreditCardItem[];
  income: BreakdownItem[];
  expenses: BreakdownItem[];
  investments: BreakdownItem[];
  categories: CategorySpendItem[];
};
```

### Regras do contrato

- valores monetarios serao armazenados como `number` e formatados apenas na camada de apresentacao;
- cada bloco recebe apenas os dados necessarios por props;
- totais laterais podem ser derivados em tempo de render a partir das listas ou vir materializados no mock se isso simplificar a leitura;
- o contrato deve permanecer local ao frontend e sem nomes acoplados a payloads do backend.

## Dataset mockado

O dataset tera no minimo duas competencias, por exemplo `janeiro-2026` e `fevereiro-2026`, com valores distintos o suficiente para validar visualmente a troca de contexto.

Cada competencia deve conter:

- resumo com total de gastos e saldo;
- lista de custos fixos;
- lista de cartao de credito;
- lista de entradas;
- lista de saidas;
- lista de investimentos;
- lista de categorias com percentual.

Os valores devem ser coerentes entre si, mas nao precisam obedecer a uma regra contabilidade perfeita nesta etapa. O mais importante e dar sinais visuais claros de mudanca entre meses.

## Componentes

### `DashboardPage`

Responsavel por:

- manter o estado da competencia ativa;
- selecionar os dados correspondentes no dataset;
- passar dados derivados para os demais componentes.

### `DashboardShell`

Responsavel por:

- renderizar o topo com marca, abas visuais e acao principal;
- posicionar seletor de meses, KPIs, blocos centrais e coluna lateral;
- aplicar a estrutura responsiva principal.

### `MonthSelector`

Responsavel por:

- listar os meses disponiveis;
- destacar o mes ativo;
- trocar a competencia ativa via callback.

### `SummaryCard`

Responsavel por exibir um titulo curto e um valor monetario formatado para os KPIs `Total de Gastos` e `Saldo`.

### `LedgerTableCard`

Responsavel por renderizar cards tabulares densos para:

- `Custos Fixos`;
- `Cartao de Credito`.

O componente deve aceitar colunas e linhas suficientes para suportar placeholders de checkbox, tipo e parcelamento sem adicionar comportamento de edicao real.

### `BreakdownListCard`

Responsavel por renderizar os cards laterais de:

- `Entradas`;
- `Saidas`;
- `Investimentos`.

Cada card mostra linhas simples com total ao final.

### `CategoryCard`

Responsavel por renderizar `Gastos por Categoria` com barras horizontais e percentual visivel.

## Layout e estilo

O layout seguira a linguagem `Petal Ledger` documentada em `dados/stitch_controle_financeiro_mensal/DESIGN.md`.

### Diretrizes visuais

- fundo rosa muito claro;
- superficies brancas;
- bordas finas magenta e rosa;
- tipografia principal `Hanken Grotesk`;
- tipografia mono `JetBrains Mono` para labels e numericos curtos;
- densidade alta de informacao nas tabelas;
- ausencia de sombras pesadas.

### Desktop

- container central largo;
- cabecalho horizontal com abas visuais;
- seletor de mes logo abaixo;
- area principal dividida em coluna larga de conteudo e coluna lateral mais estreita;
- segunda linha com tabelas menores de `Custos Fixos` e `Cartao de Credito`.

### Mobile

- empilhamento em coluna unica;
- cards e tabelas ocupando 100% da largura;
- seletor de mes com quebra de linha ou rolagem horizontal leve;
- ordem de leitura preservando primeiro contexto geral, depois tabelas, depois listas laterais.

## Estado e fluxo de dados

1. A pagina inicia com a primeira competencia do dataset como ativa.
2. O `MonthSelector` dispara `onChange(monthId)`.
3. O componente pai atualiza o estado local.
4. O objeto `DashboardMonthData` ativo e recalculado.
5. Todos os blocos recebem novos props e rerenderizam com o mesmo contexto.

Nao havera memoizacao, cache remoto ou sincronizacao por URL nesta etapa.

## Tratamento de erros

Como a fonte e local e estatica, o unico erro relevante nesta etapa e uma competencia ativa nao encontrada no dataset.

Nesse caso, a tela deve fazer fallback para a primeira competencia disponivel, evitando estado quebrado.

## Testes e validacao

### Validacoes tecnicas

- `npm run lint`
- `npm run build`

### Validacoes funcionais

- a pagina carrega usando mocks locais;
- a troca entre duas competencias atualiza todos os blocos;
- nao existe dependencia de API ou auth;
- as abas superiores sao apenas visuais;
- a tela continua legivel em desktop e mobile.

### Validacao visual

Comparar a composicao geral com a referencia `screen.png`, priorizando:

- hierarquia do cabecalho;
- estilo do seletor de mes;
- distribuicao dos KPIs;
- densidade visual das tabelas;
- estrutura da coluna lateral.

## Riscos e mitigacoes

### Crescimento desordenado do mock

Mitigacao: centralizar a tipagem em `types.ts` e impedir contratos ad hoc por componente.

### Divergencia visual em relacao a referencia

Mitigacao: seguir `DESIGN.md` como fonte principal de cor, tipografia e composicao.

### Acoplamento prematuro ao backend

Mitigacao: manter nomes e estruturas focados em frontend, sem espelhar endpoints ainda nao fechados.

## Entregaveis

- pagina base da dashboard em Next.js;
- contrato local TypeScript para a dashboard;
- dataset mockado com pelo menos duas competencias;
- blocos visuais compostos e alimentados por uma unica fonte local;
- documentacao da feature atualizada com resumo final da entrega apos implementacao.
