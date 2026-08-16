# Jason's Insurance

Jason's Insurance is a full-stack insurance portal for comparing, enrolling in, and managing health and dental coverage. It is designed as a calm, paper-inspired advisor experience for everyday households.

The application includes:

- Health and dental plan browsing
- Plan details and enrollment flows
- Account registration and login
- A customer dashboard for managing coverage
- Enrollment payments using a simulated payment flow
- FAQs, help articles, and customer support content
- Broker and advisor information
- API routes for authentication, plans, profiles, enrollments, FAQs, and help content

## Live site

[https://jasons-insurance.vercel.app/](https://jasons-insurance.vercel.app/)

## Project structure

- `app/` — the main TanStack Start application
- `app/src/routes/` — page and API routes
- `app/src/components/` — reusable interface components
- `app/src/content/` — FAQs and help-center content
- `app/packages/` — shared workspace packages
- `.github/workflows/` — continuous integration workflow

## Local development

From the `app` directory:

```bash
bun install
bun run dev
```

Useful commands:

```bash
bun run build
bun run lint
bun run typecheck
```

The payment experience is simulated for demonstration purposes and does not connect to a live payment processor.
