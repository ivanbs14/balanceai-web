# Balance Web

Aplicação Next.js 16/React 19 do Balance. O login e o dashboard usam a API real com cookie de sessão; cartões, transações, custos fixos e investimentos têm leitura e mutação. A frente de IA está pausada. Uma rota histórica de feedback permanece no código, mas não integra o escopo ativo desta entrega.

## Nomes de commits

Escreva em inglês todos os títulos de commit e todas as sugestões de título de commit. Exemplo: `feat(web): align dashboard and authentication with TECH-004`.

## Desenvolvimento

Requer Node.js 20+, npm, a API e um PostgreSQL de desenvolvimento isolado. Configure `NEXT_PUBLIC_API_URL=http://localhost:4000` em `.env.local` se necessário. Execute `npm ci`, `npm run dev` e abra `http://localhost:3000`. Os requests usam `credentials: "include"`; configure `FRONTEND_URL` e CORS da API para a origem do browser. Para verificação local, execute `npm run lint` e `npm run build`.

## Contratos ativos

- A sessão vem de `GET /auth/me`; login local usa `POST /auth`, logout usa `POST /auth/logout`. O OAuth Google novo usa `GET /auth/google`. Uma conta local autenticada pode vincular Google após confirmar a senha em `POST /auth/google/link` e concluir o redirecionamento do provedor.
- O mês escolhido é `YYYY-MM`. Datas de lançamentos e vencimentos são datas civis `YYYY-MM-DD`; o web calcula o dia atual pelo calendário local do usuário e a API interpreta a data civil em UTC, sem deslocar a competência.
- Montantes enviados à API são strings decimais com duas casas, por exemplo `"100.00"`. O web preserva a grafia pública `/transations` e os enums atuais.
- `GET /fixed-costs?month=YYYY-MM` inclui a mensalidade projetada e informa `monthly.transactionId` quando há vínculo. O dashboard mostra a transação como fonte contábil desse pagamento, sem somar a mensalidade de novo. O usuário pode vincular uma despesa existente à mensalidade da mesma competência e desfazer o vínculo; uma transação vinculada não é excluída diretamente.
- Endpoints legados com `:userId` continuam funcionando apenas para o titular da sessão. Payload novo não precisa enviar `userId`; um valor divergente é rejeitado.

## Verificação e limites

O workflow em `.github/workflows/checks.yml` executa `npm ci`, lint e build em PR e nas branches configuradas. Os fluxos de duas contas, OAuth real, edição e vínculo no browser ainda exigem validação manual com dados fictícios. No workspace conjunto, o status e as evidências desta rodada estão em `balance-doc/features/TECH-004-EXECUCAO-2026-10-06.md`; este arquivo não é publicado automaticamente com o repositório web.

## Docker

O `Dockerfile` do web e o Compose da raiz permitem build local. Use `docker compose up --build` na raiz do workspace após configurar as variáveis locais. A execução do Docker desta rodada ainda precisa de validação em ambiente com acesso à imagem base.
