# Balance AI — Frontend

Aplicação web de **gestão financeira pessoal**, desenvolvida com Next.js, React e TypeScript. O Balance AI reúne visão mensal de receitas e despesas, transações, cartões e custos fixos em uma interface integrada à API do projeto.

> **Projeto de portfólio Full Stack.** Este repositório contém o frontend; o backend está em [balanceai-api](https://github.com/ivanbs14/balanceai-api).

## Funcionalidades implementadas no código

- **Autenticação:** login por e-mail e senha, início do fluxo de login com Google, consulta de sessão e logout.
- **Dashboard mensal:** consulta de dados agregados na API conforme usuário e mês selecionado.
- **Transações:** chamadas de criação, edição, exclusão e atualização do status de pagamento.
- **Cartões:** consulta e cadastro; visualização de transações vinculadas a cartões.
- **Custos fixos:** chamadas de cadastro, edição e atualização do status mensal.
- **Interface responsiva:** componentes organizados por funcionalidades, com modais e visualizações financeiras.

As integrações acima estão presentes no código-fonte. O comportamento de ponta a ponta depende da configuração e disponibilidade do backend e do banco de dados.

## Tecnologias

- **Next.js 16** (App Router), **React 19** e **TypeScript**
- **Tailwind CSS 4**, Material UI e Lucide React
- **date-fns** para operações com datas
- API REST com autenticação baseada em cookies

## Arquitetura e integração

```text
Usuário → Next.js / React → API REST (NestJS) → Prisma → PostgreSQL
                     ↕
          Sessão autenticada (cookie)
```

Organização principal:

- `src/app/`: rotas e entrada da aplicação;
- `src/features/auth/`: autenticação e gerenciamento de sessão;
- `src/features/dashboard/`: dashboard, componentes, contratos e comunicação com a API;
- `src/features/dashboard/api.ts`: funções de acesso aos endpoints financeiros.

Exemplos de chamadas utilizadas no frontend:

| Operação | Endpoint |
| --- | --- |
| Consultar sessão | `GET /auth/me` |
| Autenticar | `POST /auth` |
| Consultar dados mensais | `GET /transations/dashboard/:userId/:monthId` |
| Criar transação | `POST /transations` |
| Editar transação | `PUT /transations/:id` |
| Excluir transação | `DELETE /transations/:id` |
| Atualizar status de pagamento | `PATCH /transations/:id/payment-status` |

> A grafia `transations` segue os endpoints existentes no backend.

## Executar localmente

**Pré-requisitos:** Node.js 20+, npm e [Balance API](https://github.com/ivanbs14/balanceai-api) configurada.

```bash
git clone https://github.com/ivanbs14/balanceai-web.git
cd balanceai-web
npm install
```

Crie `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Execute:

```bash
npm run dev
```

Acesse **http://localhost:3000**. As requisições usam `credentials: "include"`, portanto o backend precisa permitir a origem do frontend e cookies nas configurações de CORS.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Ambiente de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Executa o build |
| `npm run lint` | Verificação com ESLint |

## Docker

O projeto inclui configuração para containerização; consulte os arquivos Docker/Compose do repositório e ajuste os endereços conforme seu ambiente.

## Evolução do projeto

O README anterior descrevia o dashboard como uma tela exclusivamente baseada em mocks. Essa descrição ficou **desatualizada**: a base atual possui chamadas reais à API para consulta mensal e operações financeiras. A documentação foi atualizada para refletir as integrações identificadas, sem afirmar que todos os cenários foram validados em produção.

## Projeto relacionado

- [Balance AI — API NestJS](https://github.com/ivanbs14/balanceai-api)
