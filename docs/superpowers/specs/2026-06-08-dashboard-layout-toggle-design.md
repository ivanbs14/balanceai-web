# Dashboard Layout Toggle Design

## Contexto

A dashboard web em `balance-web` ja possui um layout responsivo funcional, com filtros de ano e mes, cards de resumo, tabelas principais e cards laterais. O pedido atual nao troca o conteudo nem a origem dos dados; ele muda a forma de organizacao visual da tela.

O usuario quer:

- um botao ao lado do nome do usuario no topo;
- esse botao deve alternar entre o layout atual e um layout inspirado na imagem anexada;
- o layout inspirado na imagem nao deve se ajustar por dispositivo;
- quando a viewport for menor que a largura necessaria, a dashboard deve usar scroll horizontal;
- a escolha do layout deve ficar salva para abrir novamente no ultimo modo utilizado.

## Objetivo

Entregar dois modos de visualizacao para a dashboard:

- `padrao`: preserva a organizacao responsiva atual;
- `grade-fixa`: reorganiza a dashboard para seguir a composicao da referencia visual, mantendo largura minima fixa e permitindo scroll horizontal no container externo.

## Fora de escopo

- alterar a semantica dos dados exibidos;
- criar nova rota para a dashboard;
- refatorar os modais existentes;
- mudar regras de negocio de filtros, cadastro, exclusao ou marcacao de pagamento;
- persistir a preferencia no backend.

## Decisoes de design

### Alternancia de layout

O toggle de layout ficara no topo da experiencia autenticada, ao lado do nome do usuario e antes do botao `Sair`.

O controle sera explicito, com rotulo textual indicando o estado atual. Exemplo de copy:

- `Layout atual`
- `Grade fixa`

O clique alterna entre os dois modos imediatamente, sem recarregar a pagina.

### Persistencia

A preferencia sera salva em `localStorage`, pois:

- e suficiente para um ajuste de preferencia puramente visual;
- evita mudancas de contrato com backend;
- funciona bem para a necessidade de lembrar o ultimo layout usado.

Chave sugerida:

```ts
const DASHBOARD_LAYOUT_STORAGE_KEY = "balance.dashboard.layout";
```

Comportamento:

1. ao carregar a sessao autenticada, o app le a preferencia salva;
2. se houver valor valido, usa esse valor;
3. se nao houver valor salvo, inicia em `padrao`;
4. toda troca de layout atualiza o estado local e grava o novo valor.

### Organizacao visual do modo `grade-fixa`

O modo `grade-fixa` segue a referencia anexada e assume uma composicao tipo ledger, com largura horizontal preservada.

Estrutura:

1. cabecalho superior com marca a esquerda, navegacao central e acoes do usuario a direita;
2. faixa de filtros com seletor de ano e meses a esquerda;
3. cards de resumo alinhados a direita nessa mesma faixa;
4. area principal com coluna larga contendo duas tabelas principais;
5. coluna lateral fixa a direita contendo entradas, saidas, investimentos e categorias.

Esse modo nao deve converter a composicao para coluna unica em telas menores. A prioridade e preservar a hierarquia visual da referencia.

### Scroll horizontal

O scroll horizontal sera aplicado em um wrapper externo da dashboard no modo `grade-fixa`.

Regras:

- o wrapper usa `overflow-x-auto`;
- o conteudo interno usa uma `min-width` fixa suficiente para manter a composicao;
- o scroll deve cobrir a dashboard como um todo, e nao gerar varios scrolls horizontais concorrentes;
- scroll vertical local dentro de tabelas existentes pode continuar apenas se ja fizer parte do comportamento atual do componente.

Valor inicial sugerido para largura minima do modo fixo:

```ts
min-width: 1680px;
```

Esse valor pode ser ajustado durante a implementacao caso a referencia fique melhor com pequena variacao, mas a regra funcional continua: preservar grade e permitir scroll horizontal.

## Arquitetura proposta

### Estado de layout na area autenticada

`AuthenticatedHome` passa a ser o boundary do estado de preferencia de layout.

Responsabilidades novas:

- ler o valor salvo no `localStorage`;
- manter `layoutMode` em estado local;
- expor o botao de toggle ao lado do nome do usuario;
- passar o modo atual para `DashboardPage`.

Tipo sugerido:

```ts
type DashboardLayoutMode = "padrao" | "grade-fixa";
```

### Propagacao para a dashboard

`DashboardPage` passa a receber:

```ts
type DashboardPageProps = {
  userId: string;
  layoutMode: DashboardLayoutMode;
};
```

`DashboardPage` continua sendo dona do estado de ano, mes, carregamento, dados e modais. O `layoutMode` influencia apenas a composicao visual.

### Shells de layout

Para evitar condicoes excessivas num unico componente, a dashboard deve separar os shells visuais.

Opcao recomendada:

- manter `DashboardShell` como shell do modo atual;
- criar `DashboardShellFixedLedger` para o novo modo inspirado na imagem;
- `DashboardPage` escolhe o shell correto e injeta os mesmos blocos de conteudo.

Essa separacao reduz risco de regressao e evita que a estrutura responsiva atual fique poluida com ramificacoes de grid fixo.

## Componentes impactados

### `src/features/auth/components/authenticated-home.tsx`

Mudancas:

- adicionar estado e persistencia de `layoutMode`;
- renderizar o botao de alternancia ao lado do nome do usuario;
- manter o botao `Sair`;
- repassar `layoutMode` para `DashboardPage`.

### `src/features/dashboard/components/dashboard-page.tsx`

Mudancas:

- aceitar a prop `layoutMode`;
- selecionar qual shell visual usar;
- manter a construcao atual dos blocos de conteudo e dos handlers sem alterar fluxo funcional.

### `src/features/dashboard/components/dashboard-shell.tsx`

Mudancas:

- pode permanecer como shell do modo `padrao`, com impacto minimo;
- o novo layout fixo deve ir para um shell separado, evitando acoplamento excessivo.

### `src/features/dashboard/components/dashboard-shell-fixed-ledger.tsx`

Novo componente responsavel por:

- aplicar wrapper com `overflow-x-auto`;
- definir `min-width` da composicao fixa;
- posicionar filtros, resumos, tabelas e sidebar no arranjo da referencia;
- preservar a leitura visual sem reflow por breakpoint.

### `src/features/dashboard/components/month-selector.tsx`

No modo `grade-fixa`, o componente deve suportar melhor distribuicao horizontal. O comportamento continua o mesmo, mas o encaixe visual muda:

- meses podem ocupar uma faixa larga;
- a area deve aceitar quebra controlada apenas dentro da grade fixa, sem empilhar a dashboard inteira;
- se necessario, o shell pode conter o selector em uma coluna com largura reservada.

### Componentes de conteudo existentes

`MonthlySummary`, `LedgerTableCard`, `AccordionCard`, `BreakdownListCard` e `CategoryCard` devem ser reaproveitados. O foco da mudanca e o shell e o enquadramento visual, nao a substituicao desses blocos.

## UX detalhada

### Modo `padrao`

- mantem o comportamento atual da dashboard;
- continua responsivo;
- continua sendo o fallback inicial para usuarios sem preferencia salva.

### Modo `grade-fixa`

- preserva estrutura inspirada na imagem;
- evita colapso de colunas por breakpoint;
- centraliza a responsabilidade de scroll horizontal no wrapper externo;
- privilegia fidelidade espacial da grade sobre adaptacao por dispositivo.

### Acessibilidade

O botao de alternancia deve:

- ser um `button` nativo;
- ter rotulo textual visivel;
- expor `aria-pressed` ou copy equivalente que indique o estado atual;
- manter contraste compativel com a paleta atual.

## Fluxo de dados

1. `AuthenticatedHome` monta.
2. O componente resolve usuario autenticado.
3. Em paralelo, le a preferencia de layout salva localmente.
4. O topo renderiza nome do usuario, botao de alternancia e botao `Sair`.
5. `DashboardPage` recebe `userId` e `layoutMode`.
6. O carregamento de dados da dashboard continua igual ao atual.
7. O shell visual muda conforme `layoutMode`, sem alterar os dados apresentados.

## Tratamento de erros

- se `localStorage` estiver indisponivel ou retornar valor invalido, o app usa `padrao`;
- se houver qualquer falha de leitura da preferencia, isso nao deve bloquear a renderizacao da dashboard;
- o toggle nunca depende de backend para funcionar.

## Estrategia de implementacao

1. adicionar tipo compartilhado de `DashboardLayoutMode`;
2. implementar persistencia local em `AuthenticatedHome`;
3. adicionar botao de toggle no topo;
4. passar `layoutMode` para `DashboardPage`;
5. extrair ou criar shell fixo dedicado;
6. ajustar wrapper com `overflow-x-auto` e `min-width`;
7. validar que modais, filtros e acoes seguem funcionando nos dois modos.

## Testes e validacao

Validacoes manuais obrigatorias:

- alternar entre `padrao` e `grade-fixa` sem recarregar;
- recarregar a pagina e confirmar persistencia da ultima escolha;
- abrir em viewport desktop larga e conferir composicao fixa;
- abrir em viewport estreita e confirmar scroll horizontal no modo `grade-fixa`;
- garantir que o modo `padrao` continua responsivo;
- garantir que filtros de ano e mes continuam atualizando os mesmos dados;
- garantir que modais e acoes de exclusao e pagamento continuam acessiveis.

## Riscos

- se parte do layout atual estiver muito acoplada ao shell responsivo, a extracao do modo fixo pode exigir pequenos ajustes em componentes filhos;
- uma `min-width` mal calibrada pode gerar area excessiva ou compressao visual inadequada;
- wrappers adicionais podem interferir em sticky, overflow ou alinhamento se aplicados no nivel errado.

## Recomendacao final

Implementar a alternancia por shell separado e persistencia em `localStorage`, preservando o layout atual como modo `padrao` e introduzindo o modo `grade-fixa` como variante fiel a referencia visual, com largura minima fixa e scroll horizontal no container externo.
