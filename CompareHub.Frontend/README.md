# CompareHub Frontend

Next.js (App Router) frontend for CompareHub — lets a user search/compare products across their saved skincare source links. Talks to the [CompareHub backend](https://github.com/mahjabin-mim/CompareHub_backend) API.

## Prerequisites

- Node.js 20+
- The backend running locally (see the backend repo's README) — defaults to `http://localhost:5000`

## Setup

1. Copy the env template and fill it in:
   ```
   cp .env.local.example .env.local
   ```
2. Set `NEXT_PUBLIC_API_BASE_URL` in `.env.local` to your backend's URL (`http://localhost:5000` for local dev).
3. Install and run:
   ```
   npm install
   npm run dev
   ```
   Runs at `http://localhost:3000`.

## Scripts

- `npm run dev` — dev server
- `npm run build` / `npm run start` — production build / serve
- `npm run lint`
- `npm run test` / `npm run test:watch` — vitest

## Pages

- `/` — home / quick search
- `/login`, `/create-account` — auth (currently hidden from the navbar while the auth flow is unfinished; still reachable directly by URL)
- `/product-discovery`, `/product-discovery/links`

## Deployment

Hosted on Vercel, deploying automatically from `master`. `NEXT_PUBLIC_API_BASE_URL` for Production is set in Vercel → Project Settings → Environment Variables (as a **Config** value, not Secret — it's a public value baked into the client bundle). Since `NEXT_PUBLIC_*` vars are inlined at build time, changing that value requires triggering a fresh deploy (a new push, or a manual Redeploy with build cache disabled) — editing it alone does not update an already-built deployment.
