# Saldo negativo responsivo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Impedir que o sinal de valores monetários negativos grandes fique isolado acima dos números nos cards de resumo em celulares.

**Architecture:** Ajustar apenas o componente visual compartilhado `SummaryCard`: empilhar rótulo e valor no mobile, preservar a linha horizontal a partir de `sm` e tornar a string monetária indivisível. Não alterar cálculo, formatação monetária nem dados.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4 e Playwright para validação visual.

---

### Task 1: Corrigir o layout responsivo do SummaryCard

**Files:**
- Modify: `src/features/dashboard/components/summary-card.tsx:13-25`

- [ ] **Step 1: Registrar o estado anterior**

Confirmar que o contêiner usa `flex items-center justify-between` em todas as larguras e que o valor não possui `whitespace-nowrap`.

- [ ] **Step 2: Aplicar a correção mínima**

Alterar as classes para:

```tsx
<div className="flex min-w-0 flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
```

Aplicar ao valor:

```tsx
"whitespace-nowrap text-[clamp(0.78rem,4vw,0.96rem)] font-semibold tabular-nums tracking-tight sm:text-[1.15rem]"
```

- [ ] **Step 3: Conferir o diff**

Run: `rtk git diff -- src/features/dashboard/components/summary-card.tsx`

Expected: somente classes de layout e tipografia do `SummaryCard` alteradas; sem mudança de cálculo, texto ou propriedades.

### Task 2: Executar validações estáticas

**Files:**
- Verify: `src/features/dashboard/components/summary-card.tsx`

- [ ] **Step 1: Executar lint**

Run: `rtk npm run lint`

Expected: exit code 0, sem novos erros.

- [ ] **Step 2: Executar build**

Run: `rtk npm run build`

Expected: exit code 0 e build Next.js concluído.

- [ ] **Step 3: Verificar whitespace do diff**

Run: `rtk git diff --check`

Expected: nenhuma saída e exit code 0.

### Task 3: Validar comportamento móvel

**Files:**
- Verify: `src/features/dashboard/components/summary-card.tsx`
- Temporary test artifact: `/private/tmp/balance-summary-responsive.spec.py`

- [ ] **Step 1: Iniciar o frontend com o helper de testes**

Run first: `rtk python3 /Users/ivanbarbosa/.agents/skills/webapp-testing/scripts/with_server.py --help`

Em seguida, usar o helper para iniciar `npm run dev` na porta 3000 e executar um script Playwright headless.

- [ ] **Step 2: Validar as larguras móveis**

O script deve abrir o dashboard nas larguras 320, 360 e 375 px, localizar o card `Saldo disponível` e verificar:

```python
assert value.evaluate("el => getComputedStyle(el).whiteSpace") == "nowrap"
assert value.bounding_box()["width"] <= card.bounding_box()["width"]
assert page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")
```

Quando autenticação/API impedir o dashboard real, renderizar um fixture temporário que reproduza exatamente as classes finais do componente e o valor `-R$ 1.234.567,89`; registrar essa limitação.

- [ ] **Step 3: Validar desktop**

Na largura 768 px, confirmar que o contêiner usa direção horizontal e que o valor continua em uma linha.

- [ ] **Step 4: Registrar evidências**

Salvar screenshots temporárias em `/private/tmp` e registrar dimensões, direção flexível, `white-space` e presença/ausência de overflow. Não adicionar screenshots ao repositório.

### Task 4: Preparar entrega sem commit

**Files:**
- Verify: `docs/superpowers/specs/2026-10-08-saldo-negativo-responsivo-design.md`
- Verify: `docs/superpowers/plans/2026-10-08-saldo-negativo-responsivo.md`
- Verify: `src/features/dashboard/components/summary-card.tsx`

- [ ] **Step 1: Revisar status e diff final**

Run: `rtk git status --short` e `rtk git diff --check`

Expected: somente os arquivos desta correção aparecem como novos/modificados, além de alterações anteriores do usuário que devem ser preservadas.

- [ ] **Step 2: Informar o commit sugerido**

Sugerir `fix: mantém saldo negativo em uma linha no mobile` e aguardar autorização explícita. Não executar `git commit` nem `git push`.
