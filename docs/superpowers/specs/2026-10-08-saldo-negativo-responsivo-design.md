# Saldo negativo responsivo nos cards de resumo

## Contexto

O `SummaryCard` exibe rótulo e valor na mesma linha dentro de uma grade de duas colunas no mobile. Quando `Saldo disponível` contém um valor negativo grande, alguns navegadores móveis quebram a string monetária após o sinal negativo, deixando o sinal isolado acima dos números.

## Decisão

No mobile, o card passa a organizar rótulo e valor verticalmente. A partir do breakpoint `sm`, preserva o layout horizontal atual. O valor monetário deve permanecer em uma única linha, usar algarismos tabulares e uma fonte fluida dentro da escala visual existente.

Não haverá truncamento, rolagem horizontal nem alteração na formatação monetária ou no cálculo do saldo.

## Implementação

- Alterar somente a apresentação compartilhada em `src/features/dashboard/components/summary-card.tsx`.
- Usar layout vertical e alinhamento inicial no mobile; restaurar linha e alinhamento central a partir de `sm`.
- Aplicar `min-w-0` ao contêiner flexível e `whitespace-nowrap` ao valor.
- Aplicar `tabular-nums` ao valor para estabilidade visual.
- Usar tamanho fluido limitado, sem reduzir o texto abaixo de um tamanho legível.
- Preservar cores, bordas, espaçamentos, semântica e o tom negativo existentes.

## Validação

- Testar valores positivos e negativos grandes.
- Validar visualmente em 320 px, 360 px e 375 px.
- Confirmar que o sinal negativo permanece na mesma linha do valor.
- Confirmar ausência de overflow horizontal e corte de conteúdo.
- Confirmar que o layout horizontal existente permanece a partir de `sm`.
- Executar lint e build do frontend.

## Fora do escopo

- Alterar cálculos financeiros ou `Intl.NumberFormat`.
- Redesenhar os cards ou a grade do dashboard.
- Truncar, abreviar ou ocultar valores monetários.
- Alterar outros componentes que exibem moeda.
