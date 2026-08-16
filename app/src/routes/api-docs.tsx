import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeading } from "../components/site";

export const Route = createFileRoute("/api-docs")({
  component: ApiDocs,
});

type Endpoint = {
  method: "GET" | "POST" | "PUT";
  path: string;
  auth: boolean;
  summary: string;
  request?: string;
  response: string;
  errors?: string;
};

type ApiGroup = { name: string; blurb: string; endpoints: Endpoint[] };

const API_GROUPS: ApiGroup[] = [
  {
    name: "Authentication",
    blurb:
      "Session auth via an httpOnly cookie (ji_session, 14-day lifetime) set by register/login and cleared by logout. All other authenticated endpoints read that cookie.",
    endpoints: [
      {
        method: "POST",
        path: "/api/auth/register",
        auth: false,
        summary: "Create a new account and start a session.",
        request: `{ "username": "jane.doe", "email": "jane@example.com", "password": "min 8 chars", "firstName": "Jane", "lastName": "Doe", "dateOfBirth": "1990-01-15" }`,
        response: `201 { "ok": true, "user": { …profile } } + Set-Cookie: ji_session`,
        errors: "400 invalid_username | invalid_email | weak_password | missing_name · 409 username_taken | email_taken",
      },
      {
        method: "POST",
        path: "/api/auth/login",
        auth: false,
        summary: "Sign in with username or email plus password.",
        request: `{ "identifier": "jane.doe or jane@example.com", "password": "…" }`,
        response: `200 { "ok": true, "user": { …profile } } + Set-Cookie: ji_session`,
        errors: "400 missing_fields · 401 bad_credentials",
      },
      {
        method: "POST",
        path: "/api/auth/logout",
        auth: true,
        summary: "End the current session and clear the cookie.",
        response: `200 { "ok": true } + Set-Cookie (expired)`,
      },
      {
        method: "GET",
        path: "/api/auth/me",
        auth: false,
        summary: "Current session's user, or null when signed out.",
        response: `200 { "ok": true, "user": { …profile } | null }`,
      },
      {
        method: "POST",
        path: "/api/auth/forgot-password",
        auth: false,
        summary: "Request a password reset link for an email (1-hour, single-use token). Demo: token returned in the response instead of emailed.",
        request: `{ "email": "jane@example.com" }`,
        response: `200 { "ok": true, "sent": true, "resetToken": "…" | null }`,
      },
      {
        method: "POST",
        path: "/api/auth/reset-password",
        auth: false,
        summary: "Set a new password with a reset token. Signs out all sessions.",
        request: `{ "token": "…", "password": "new password" }`,
        response: `200 { "ok": true }`,
        errors: "400 invalid_token | expired_token | weak_password",
      },
      {
        method: "POST",
        path: "/api/auth/forgot-username",
        auth: false,
        summary: "Recover the username for an email. Demo: username returned in the response instead of emailed.",
        request: `{ "email": "jane@example.com" }`,
        response: `200 { "ok": true, "sent": true, "username": "…" | null, "usernameMasked": "ja***oe" | null }`,
      },
    ],
  },
  {
    name: "Plans",
    blurb: "The public health and dental plan catalog. No authentication required.",
    endpoints: [
      {
        method: "GET",
        path: "/api/plans?type=&tier=&carrier=&maxPremium=",
        auth: false,
        summary: "List plans. Filters: type (health|dental), tier (Bronze…Platinum / Low|High), carrier, maxPremium.",
        response: `200 { "ok": true, "plans": [ { "id", "planType", "tier", "name", "carrier", "monthlyPremium", "deductible", "outOfPocketMax", "network", "hsaEligible", "features": [], "description" } ] }`,
      },
      {
        method: "GET",
        path: "/api/plans/:planId",
        auth: false,
        summary: "One plan by id.",
        response: `200 { "ok": true, "plan": { …plan } }`,
        errors: "404 not_found",
      },
    ],
  },
  {
    name: "Enrollments",
    blurb:
      "Create and manage the signed-in user's enrollments. Lifecycle: pending_payment → active (after payment) → cancelled → active again (if reinstated within 60 days).",
    endpoints: [
      {
        method: "GET",
        path: "/api/enrollments",
        auth: true,
        summary: "List your enrollments, newest first.",
        response: `200 { "ok": true, "enrollments": [ { …enrollment } ] }`,
      },
      {
        method: "POST",
        path: "/api/enrollments",
        auth: true,
        summary:
          "Start an enrollment (status pending_payment). Effective date follows the 15th-of-month rule; premium scales with household members (1-8).",
        request: `{ "planId": 3, "members": 2 }`,
        response: `201 { "ok": true, "enrollment": { …enrollment } }`,
        errors: "404 plan_not_found · 409 already_enrolled",
      },
      {
        method: "GET",
        path: "/api/enrollments/:id",
        auth: true,
        summary: "Enrollment status + payment history, any time.",
        response: `200 { "ok": true, "enrollment": { …enrollment }, "payments": [ { "amount", "kind", "cardBrand", "cardLast4", "status", "paidAt" } ] }`,
        errors: "404 not_found",
      },
      {
        method: "POST",
        path: "/api/enrollments/:id/pay",
        auth: true,
        summary:
          "Simulated binder payment: validates card shape (Luhn, expiry, CVC), records payment, activates coverage. Stores brand + last 4 only.",
        request: `{ "cardNumber": "4242424242424242", "expMonth": 12, "expYear": 2028, "cvc": "123", "nameOnCard": "Jane Doe" }`,
        response: `200 { "ok": true, "enrollment": { status: "active", … } }`,
        errors: "400 invalid_card | invalid_expiry | card_expired | invalid_cvc · 409 already_active | not_payable",
      },
      {
        method: "POST",
        path: "/api/enrollments/:id/cancel",
        auth: true,
        summary: "Cancel an enrollment (optional reason). Timestamp recorded.",
        request: `{ "reason": "optional, ≤500 chars" }`,
        response: `200 { "ok": true, "enrollment": { status: "cancelled", … } }`,
        errors: "409 already_cancelled",
      },
      {
        method: "POST",
        path: "/api/enrollments/:id/reinstate",
        auth: true,
        summary: "Reinstate a cancelled/terminated enrollment within 60 days of cancellation.",
        response: `200 { "ok": true, "enrollment": { status: "active", … } }`,
        errors: "409 not_cancelled | window_closed",
      },
    ],
  },
  {
    name: "Profile",
    blurb: "Read and update the signed-in user's account details.",
    endpoints: [
      {
        method: "GET",
        path: "/api/profile",
        auth: true,
        summary: "Full profile: identity, address, phone, communication preferences.",
        response: `200 { "ok": true, "profile": { …profile } }`,
      },
      {
        method: "PUT",
        path: "/api/profile/address",
        auth: true,
        summary: "Update the mailing address.",
        request: `{ "street": "12 Oak Ln", "city": "Riverton", "state": "CA", "zip": "94012" }`,
        response: `200 { "ok": true, "address": { … } }`,
        errors: "400 invalid_street | invalid_city | invalid_state | invalid_zip",
      },
      {
        method: "PUT",
        path: "/api/profile/phone",
        auth: true,
        summary: "Update the phone number (10-digit US; normalized server-side).",
        request: `{ "phone": "555 123 4567" }`,
        response: `200 { "ok": true, "phone": "(555) 123-4567" }`,
        errors: "400 invalid_phone",
      },
      {
        method: "PUT",
        path: "/api/profile/preferences",
        auth: true,
        summary: "Update communication preferences. At least one of email/sms/mail must remain true.",
        request: `{ "email": true, "sms": false, "mail": true, "paperless": true }`,
        response: `200 { "ok": true, "communicationPreferences": { … } }`,
        errors: "400 no_channel",
      },
    ],
  },
  {
    name: "Brokers & content",
    blurb: "Public directory and content endpoints.",
    endpoints: [
      {
        method: "GET",
        path: "/api/brokers?q=&zip=&specialty=",
        auth: false,
        summary: "Search licensed brokers by name/agency/city/language, ZIP area (3-digit prefix), and specialty (health|dental).",
        response: `200 { "ok": true, "brokers": [ { "name", "agency", "licenseNo", "city", "state", "zip", "phone", "email", "languages": [], "specialties": [] } ] }`,
      },
      {
        method: "GET",
        path: "/api/faqs?category=&q=",
        auth: false,
        summary: "FAQ list (sourced from the PY2026 consumer policy document), filterable by category and keyword.",
        response: `200 { "ok": true, "categories": [ … ], "faqs": [ { "id", "category", "question", "answer" } ] }`,
      },
      {
        method: "GET",
        path: "/api/help/articles?category=",
        auth: false,
        summary: "Help center article summaries.",
        response: `200 { "ok": true, "articles": [ { "slug", "category", "title", "summary", "minutes" } ] }`,
      },
      {
        method: "GET",
        path: "/api/help/articles/:slug",
        auth: false,
        summary: "One help article with its full body (markdown).",
        response: `200 { "ok": true, "article": { …article, "body" } }`,
        errors: "404 not_found",
      },
    ],
  },
];

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-sagesoft text-leaf",
  POST: "bg-[#e8eef7] text-[#2d5382]",
  PUT: "bg-claysoft text-clay",
};

function ApiDocs() {
  return (
    <Page>
      <PageHeading
        eyebrow="Developers"
        title="API documentation"
        lede="Every endpoint behind Jason's Insurance: the same REST API this website calls. Base URL is this site's origin; all bodies are JSON."
      />
      <div className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <div className="mt-4 rounded-2xl border border-sage/50 bg-paper p-5 text-sm leading-relaxed text-ink/75">
          <p>
            <strong className="text-ink">Auth model.</strong> Endpoints marked{" "}
            <span className="rounded-full bg-pine px-2 py-0.5 text-xs font-semibold text-ivory">auth</span> require a
            session cookie obtained from <code className="rounded bg-ivory px-1.5 py-0.5 text-xs">POST /api/auth/login</code> or{" "}
            <code className="rounded bg-ivory px-1.5 py-0.5 text-xs">/register</code>. Errors share one shape:{" "}
            <code className="rounded bg-ivory px-1.5 py-0.5 text-xs">{`{ "ok": false, "error": { "code", "message" } }`}</code>.
            Payments are simulated; no real charges occur anywhere in this API.
          </p>
        </div>

        {/* Endpoint index */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-sage/50">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-paper text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-2.5">Method</th>
                <th className="px-4 py-2.5">Endpoint</th>
                <th className="px-4 py-2.5">Auth</th>
                <th className="px-4 py-2.5">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {API_GROUPS.flatMap((g) => g.endpoints).map((e) => (
                <tr key={e.method + e.path} className="border-t border-sage/30">
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${METHOD_STYLES[e.method]}`}>{e.method}</span>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs text-ink">{e.path.split("?")[0]}</td>
                  <td className="px-4 py-2 text-xs">{e.auth ? "Required" : "Public"}</td>
                  <td className="px-4 py-2 text-xs text-ink/70">{e.summary.split(".")[0]}.</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {API_GROUPS.map((group) => (
          <section key={group.name} className="mt-12">
            <h2 className="font-display text-2xl font-semibold text-ink">{group.name}</h2>
            <p className="mt-1 max-w-2xl text-sm text-ink/60">{group.blurb}</p>
            <div className="mt-4 space-y-4">
              {group.endpoints.map((endpoint) => (
                <div key={endpoint.method + endpoint.path} className="overflow-hidden rounded-2xl border border-sage/50 bg-ivory">
                  <div className="flex flex-wrap items-center gap-3 border-b border-sage/40 bg-paper px-5 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${METHOD_STYLES[endpoint.method]}`}>
                      {endpoint.method}
                    </span>
                    <code className="break-all font-mono text-sm font-semibold text-ink">{endpoint.path}</code>
                    {endpoint.auth && (
                      <span className="rounded-full bg-pine px-2.5 py-0.5 text-xs font-semibold text-ivory">auth</span>
                    )}
                  </div>
                  <div className="space-y-3 px-5 py-4 text-sm">
                    <p className="text-ink/80">{endpoint.summary}</p>
                    {endpoint.request && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Request body</p>
                        <pre className="mt-1 overflow-x-auto rounded-xl bg-pinedeep p-3 text-xs leading-relaxed text-sage">
                          {endpoint.request}
                        </pre>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Response</p>
                      <pre className="mt-1 overflow-x-auto rounded-xl bg-pinedeep p-3 text-xs leading-relaxed text-sage">
                        {endpoint.response}
                      </pre>
                    </div>
                    {endpoint.errors && (
                      <p className="text-xs text-ink/60">
                        <strong className="text-clay">Errors:</strong> {endpoint.errors}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Page>
  );
}
