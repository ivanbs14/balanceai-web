# Balance Web

Frontend web app for the Balance personal finance product. This repository currently contains:

- a login flow that talks to the Balance backend;
- a monthly dashboard shell rendered from local typed mock data;
- UI foundations built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4.

## Current Scope

The dashboard is intentionally in a transitional state:

- authentication is real from the frontend perspective and calls the backend API;
- dashboard data is still local and mock-driven;
- create, edit, delete, and persistence flows are not implemented yet.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- ESLint 9

## Requirements

- Node.js 20 or newer
- npm
- Balance backend running locally if you want to exercise login/session flows

## Local Setup

Install dependencies:

```bash
npm install
```

Create a `.env.local` file if you need to point the frontend at a non-default backend:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

If `NEXT_PUBLIC_API_URL` is omitted, the app defaults to `http://localhost:4000`.

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Docker

This repository now includes a Docker image definition for local development and production-style builds.

Build the web image directly:

```bash
docker build -t balance-web-dev ./balance-web
```

Run the frontend through the workspace compose file:

```bash
docker compose up --build web
```

Build only the web service from compose:

```bash
docker compose build web
```

Run both apps together:

```bash
docker compose up --build
```

Notes:

- The frontend container publishes `http://localhost:3000`.
- The default API target in Docker local flow is `http://localhost:4000`.
- `next.config.ts` uses `output: "standalone"` for leaner production images.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Authentication Contract

The homepage loads `AuthenticatedHome`, which:

- checks the current session with `GET /auth/me`;
- performs email/password login with `POST /auth`;
- starts Google auth via `GET /auth/google`;
- logs out with `POST /auth/logout`.

Requests are made with `credentials: "include"`, so the backend must be configured for cookie-based auth and local CORS accordingly.

## Dashboard Structure

The root route currently resolves to:

- `src/app/page.tsx`: app entrypoint
- `src/features/auth/components/authenticated-home.tsx`: auth gate
- `src/features/dashboard/components/`: dashboard UI building blocks
- `src/features/dashboard/mock-data.ts`: single local source of truth for dashboard mocks
- `src/features/dashboard/types.ts`: shared dashboard contracts

The dashboard supports switching between mocked months and recomputes visible sections from the selected month data.

## Notes

- Text in the current UI is primarily Portuguese.
- README scope reflects the repository state as of June 6, 2026.
