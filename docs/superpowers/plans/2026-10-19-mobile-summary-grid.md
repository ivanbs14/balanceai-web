# Mobile Summary Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exibir os quatro cards de resumo em uma grade 2×2 no mobile e em uma linha de quatro colunas no desktop.

**Architecture:** Alterar somente as classes responsivas do contêiner que renderiza `summaryCards`. Preservar componentes, conteúdo, espaçamento e fluxo de dados existentes.

**Tech Stack:** Next.js, React, TypeScript e Tailwind CSS.

---

### Task 1: Ajustar e validar a grade de resumo

**Files:**
- Modify: `src/features/dashboard/components/dashboard-shell.tsx:28`
- Verify: `docs/superpowers/specs/2026-10-19-mobile-summary-grid-design.md`

- [x] **Step 1: Alterar a configuração responsiva**

Substituir:

```tsx
<div className="grid min-w-0 grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
```

por:

```tsx
<div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
```

- [x] **Step 2: Executar o lint**

Run: `rtk npm run lint`

Expected: comando concluído sem erros.

- [x] **Step 3: Executar o build**

Run: `rtk npm run build`

Expected: build de produção concluído sem erros.

- [x] **Step 4: Validar no navegador**

Iniciar o projeto e verificar o dashboard autenticado em uma viewport mobile e outra desktop. No mobile, os quatro cards devem ocupar duas colunas e duas linhas; no desktop, quatro colunas e uma linha.

- [x] **Step 5: Preparar entrega sem commit**

Revisar `rtk git diff --check` e `rtk git status --short`. Informar o nome de commit sugerido e aguardar autorização explícita do usuário antes de criar qualquer commit.
