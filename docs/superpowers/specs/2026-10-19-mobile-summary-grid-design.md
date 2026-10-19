# Grade mobile dos cards de resumo

## Objetivo

Exibir os quatro cards de resumo do dashboard em duas colunas no mobile, formando duas linhas com dois cards cada. Em telas desktop, manter os quatro cards na mesma linha.

## Alteração

No contêiner de `summaryCards` em `dashboard-shell.tsx`, usar duas colunas como configuração base e quatro colunas a partir do breakpoint `lg`.

- Mobile e tablet: `grid-cols-2`.
- Desktop (`lg` ou superior): `grid-cols-4`.
- Espaçamentos, conteúdo dos cards e demais regiões do dashboard permanecem inalterados.

## Validação

Executar as verificações automatizadas disponíveis no projeto, incluindo lint e build. Por solicitação explícita do usuário para esta demanda, validar também no navegador que o mobile apresenta uma grade 2×2 e o desktop mantém quatro cards na mesma linha.
