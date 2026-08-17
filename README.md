# Jason's Insurance

A health & dental insurance marketplace demo: shop and compare plans, enroll and pay
(simulated), manage coverage (cancel / reinstate), help center, FAQs sourced from the
PY2026 consumer eligibility & enrollment policies, and a documented REST API behind a
full OAuth 2.0 authorization server.

**Live site:** https://jasons-insurance.vercel.app
**API docs:** https://jasons-insurance.vercel.app/api-docs
**OAuth playground:** https://jasons-insurance.vercel.app/oauth-playground

## Stack

- React 19 + TanStack Start (SSR), Tailwind v4 — deployed to Vercel via nitro (`preset: "vercel"`)
- Neon Postgres (schema + seed bootstrap in `app/src/lib/db.server.ts`)
- OAuth 2.0 auth server: authorization-code + PKCE, password and refresh_token grants,
  rotating refresh tokens with reuse detection, per-endpoint scopes
  (`profile:read|write`, `enrollments:read|write`), registered-client table
- App code lives in [`app/`](app/)

## Develop & deploy

```bash
cd app
bun install
vercel env pull        # brings DATABASE_URL etc. into .env.local (never committed)
bun run dev            # local dev
bun vite build         # build (.vercel/output)
vercel deploy --prebuilt --prod --yes
```

## OAuth quick reference

- Auth URL: `/oauth/authorize` (consent screen; PKCE S256 required for public clients)
- Token URL: `/api/oauth/token` (grants: `authorization_code`, `password`, `refresh_token`)
- Revocation: `/api/oauth/revoke`
- Registered clients live in the `oauth_clients` table (secrets stored as SHA-256 hashes;
  see the seed block in `app/src/lib/db.server.ts`)

Payments are simulated (test card `4242 4242 4242 4242`); password-reset links and
username reminders are shown in-page instead of emailed. All plans, carriers, and
brokers are fictional.
