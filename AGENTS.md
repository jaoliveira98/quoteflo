# AGENTS.md

## Cursor Cloud specific instructions

### Overview

QuoteFlo is a Next.js 15 (App Router, React 19) SaaS app for UK tradespeople to create and send professional quotes. It uses Supabase (PostgreSQL + Auth), Stripe (billing), Resend (email), and Twilio (SMS).

### Running services

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Next.js dev server | `npm run dev` | 3000 | Main app; requires `.env.local` with Supabase credentials |
| Storybook | `npm run storybook` | 6006 | Optional; component preview |

### Environment variables

A `.env.local` file is required in the project root with at minimum:

```
NEXT_PUBLIC_SUPABASE_URL=<supabase project url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase anon key>
```

These are injected as secrets (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). To create `.env.local` from environment variables, run:

```bash
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
EOF
```

Stripe, Resend, Twilio, and Upstash Redis are optional and degrade gracefully when absent.

### Key commands

See `package.json` scripts. Summary:

- **Dev server:** `npm run dev`
- **Lint:** `npm run lint`
- **Unit tests:** `npm run test:unit` (Vitest)
- **All tests (unit + Storybook):** `npm test` (Vitest)
- **E2E tests:** `npm run test:e2e` (Playwright — requires dev server running and `E2E_TEST_USER_EMAIL` / `E2E_TEST_USER_PASSWORD` env vars)
- **Build:** `npm run build`

### Gotchas

- The `public/` directory does not exist in the repo by default. Storybook warns about it but still works. Create it with `mkdir -p public` if needed.
- `next lint` is deprecated in Next.js 15 and will be removed in 16; the command still works and returns clean results.
- Vitest config has two test projects: `unit` (Node environment, `src/**/*.test.ts`) and `storybook` (browser/Playwright). Running `npm run test:unit` only runs unit tests; `npm test` runs both.
- E2E tests require a running Supabase instance with data and valid credentials. They will skip gracefully if `E2E_TEST_USER_EMAIL` / `E2E_TEST_USER_PASSWORD` are not set.
- The path alias `@/` maps to `src/`.
