import { createFileRoute } from "@tanstack/react-router";

import { Page, PageHeading } from "../components/site";

export const Route = createFileRoute("/api-docs")({
  component: ApiDocs,
});

type Endpoint = {
  method: "GET" | "POST" | "PUT";
  path: string;
  auth: boolean;
  scope?: string;
  summary: string;
  request?: string;
  response: string;
  errors?: string;
};

type ApiGroup = { name: string; blurb: string; endpoints: Endpoint[] };

const API_GROUPS: ApiGroup[] = [
  {
    name: "Authentication (OAuth 2.0)",
    blurb:
      "A complete OAuth 2.0 authorization server (RFC 6749/6750/7009/7636). Auth URL: /oauth/authorize (authorization-code flow with consent screen; PKCE S256 mandatory for public clients). Token URL: /api/oauth/token (authorization_code, password, and refresh_token grants). Access tokens live 15 minutes; refresh tokens live 14 days and rotate on every use (replaying one revokes the whole session family). Scopes: profile:read, profile:write, enrollments:read, enrollments:write — enforced per endpoint; first-party sign-in receives all four. Registered demo clients: demo-partner (public, PKCE — used by the /oauth-playground page) and demo-confidential (confidential; demo Client Secret: demo-secret-12345, sent via HTTP Basic or body — a documented test credential, like the 4242 test card). Redirect URIs are pinned per client.",
    endpoints: [
      {
        method: "GET",
        path: "/oauth/authorize?response_type=code&client_id=…&redirect_uri=…&scope=…&state=…&code_challenge=…&code_challenge_method=S256",
        auth: false,
        summary:
          "The Auth URL. Sends the user to sign-in (if needed) then a consent screen listing the requested scopes. Approval redirects to the registered redirect_uri with ?code=…&state=… (codes are single-use, 60-second lifetime); denial redirects with ?error=access_denied. Try it live at /oauth-playground.",
        response: `302-style redirect back to redirect_uri with code+state (or error)`,
        errors: "invalid_client | invalid_redirect_uri | unsupported_response_type | invalid_scope | pkce_required",
      },
      {
        method: "POST",
        path: "/api/oauth/token",
        auth: false,
        summary:
          "The Token URL. grant_type=authorization_code exchanges a code from the Auth URL (public clients: client_id + code_verifier for PKCE; confidential clients: Client ID + Client Secret via HTTP Basic or body). grant_type=password signs in first-party with username/email + password. grant_type=refresh_token rotates a refresh token (body, or cookie for browser clients). Accepts form-encoded or JSON.",
        request: `grant_type=authorization_code&code=ac_…&redirect_uri=…&client_id=demo-partner&code_verifier=…   |   grant_type=password&username=jane.doe&password=…`,
        response: `200 { "access_token": "at_…", "token_type": "Bearer", "expires_in": 900, "refresh_token": "rt_…", "scope": "profile:read enrollments:read" }`,
        errors: "400 invalid_request | invalid_grant | invalid_scope | unsupported_grant_type · 401 invalid_client (RFC 6749 error shape)",
      },
      {
        method: "POST",
        path: "/api/oauth/revoke",
        auth: false,
        summary:
          "OAuth 2.0 revocation (RFC 7009). Revokes the given token's whole family (access + refresh) and clears the auth cookies. Unknown tokens still return 200 per the RFC.",
        request: `{ "token": "rt_… or at_…" }  (optional for browser clients; cookies are used as fallback)`,
        response: `200 { "ok": true } + cleared cookies`,
      },
      {
        method: "GET",
        path: "/api/oauth/authorize-info?client_id=…&redirect_uri=…&response_type=code&scope=…",
        auth: false,
        summary:
          "Consent-screen backing API (used by the /oauth/authorize page): validates an authorization request and describes the client and the requested scopes. Third-party clients don't call this directly.",
        response: `200 { "ok": true, "authenticated": bool, "clientName", "clientId", "scopes": [{ "scope", "description" }] }`,
        errors: "400 invalid_client | invalid_redirect_uri | unsupported_response_type | invalid_scope | pkce_required",
      },
      {
        method: "POST",
        path: "/api/oauth/approve",
        auth: true,
        summary:
          "Consent decision (used by the /oauth/authorize page): the signed-in user approves or denies the request. Approval mints the single-use authorization code and returns the redirect URL; denial returns the error redirect.",
        request: `{ "client_id", "redirect_uri", "scope", "state", "code_challenge", "code_challenge_method", "decision": "approve" | "deny" }`,
        response: `200 { "ok": true, "redirect": "https://client.example/cb?code=ac_…&state=…" }`,
        errors: "400 invalid_client | invalid_redirect_uri | invalid_scope | pkce_required · 401 unauthorized",
      },
      {
        method: "POST",
        path: "/api/auth/register",
        auth: false,
        summary: "Create a new account. Issues an OAuth token pair immediately (same shape as the password grant) plus the user profile.",
        request: `{ "username": "jane.doe", "email": "jane@example.com", "password": "min 8 chars", "firstName": "Jane", "lastName": "Doe", "dateOfBirth": "1990-01-15" }`,
        response: `201 { "ok": true, "user": { …profile }, "access_token": "at_…", "token_type": "Bearer", "expires_in": 900, "refresh_token": "rt_…" } + Set-Cookie`,
        errors: "400 invalid_username | invalid_email | weak_password | missing_name · 409 username_taken | email_taken",
      },
      {
        method: "POST",
        path: "/api/auth/login",
        auth: false,
        summary: "Convenience wrapper around the OAuth password grant for the site's login form: same tokens as /api/oauth/token, plus the user profile.",
        request: `{ "identifier": "jane.doe or jane@example.com", "password": "…" }`,
        response: `200 { "ok": true, "user": { …profile }, "access_token": "at_…", "token_type": "Bearer", "expires_in": 900, "refresh_token": "rt_…" } + Set-Cookie`,
        errors: "400 missing_fields · 401 bad_credentials",
      },
      {
        method: "POST",
        path: "/api/auth/logout",
        auth: true,
        summary: "Alias for OAuth revocation: revokes the current token family and clears the auth cookies.",
        response: `200 { "ok": true } + cleared cookies`,
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
        scope: "enrollments:read",
        summary: "List your enrollments, newest first.",
        response: `200 { "ok": true, "enrollments": [ { …enrollment } ] }`,
      },
      {
        method: "POST",
        path: "/api/enrollments",
        auth: true,
        scope: "enrollments:write",
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
        scope: "enrollments:read",
        summary: "Enrollment status + payment history, any time.",
        response: `200 { "ok": true, "enrollment": { …enrollment }, "payments": [ { "amount", "kind", "cardBrand", "cardLast4", "status", "paidAt" } ] }`,
        errors: "404 not_found",
      },
      {
        method: "POST",
        path: "/api/enrollments/:id/pay",
        auth: true,
        scope: "enrollments:write",
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
        scope: "enrollments:write",
        summary: "Cancel an enrollment (optional reason). Timestamp recorded.",
        request: `{ "reason": "optional, ≤500 chars" }`,
        response: `200 { "ok": true, "enrollment": { status: "cancelled", … } }`,
        errors: "409 already_cancelled",
      },
      {
        method: "POST",
        path: "/api/enrollments/:id/reinstate",
        auth: true,
        scope: "enrollments:write",
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
        scope: "profile:read",
        summary: "Full profile: identity, address, phone, communication preferences.",
        response: `200 { "ok": true, "profile": { …profile } }`,
      },
      {
        method: "PUT",
        path: "/api/profile/address",
        auth: true,
        scope: "profile:write",
        summary: "Update the mailing address.",
        request: `{ "street": "12 Oak Ln", "city": "Riverton", "state": "CA", "zip": "94012" }`,
        response: `200 { "ok": true, "address": { … } }`,
        errors: "400 invalid_street | invalid_city | invalid_state | invalid_zip",
      },
      {
        method: "PUT",
        path: "/api/profile/phone",
        auth: true,
        scope: "profile:write",
        summary: "Update the phone number (10-digit US; normalized server-side).",
        request: `{ "phone": "555 123 4567" }`,
        response: `200 { "ok": true, "phone": "(555) 123-4567" }`,
        errors: "400 invalid_phone",
      },
      {
        method: "PUT",
        path: "/api/profile/preferences",
        auth: true,
        scope: "profile:write",
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
      {
        method: "POST",
        path: "/api/contact",
        auth: false,
        summary: "Submit a support message. Stored for the support team; linked to the account when signed in.",
        request: `{ "name": "Jane Doe", "email": "jane@example.com", "subject": "Question about my enrollment", "message": "…" }`,
        response: `201 { "ok": true, "ticketId": 1 }`,
        errors: "400 missing_name | invalid_email | missing_subject | message_too_short",
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
            <strong className="text-ink">Auth model: OAuth 2.0.</strong> Endpoints marked{" "}
            <span className="rounded-full bg-pine px-2 py-0.5 text-xs font-semibold text-ivory">auth</span> require an
            access token from <code className="rounded bg-ivory px-1.5 py-0.5 text-xs">POST /api/oauth/token</code>,
            sent as <code className="rounded bg-ivory px-1.5 py-0.5 text-xs">Authorization: Bearer at_…</code> (API
            clients) or carried automatically by the httpOnly cookies set at sign-in (browsers). Access tokens live 15
            minutes; refresh with <code className="rounded bg-ivory px-1.5 py-0.5 text-xs">grant_type=refresh_token</code>{" "}
            (tokens rotate on every refresh). Non-OAuth endpoints report errors as{" "}
            <code className="rounded bg-ivory px-1.5 py-0.5 text-xs">{`{ "ok": false, "error": { "code", "message" } }`}</code>;
            the two OAuth endpoints use the RFC 6749 <code className="rounded bg-ivory px-1.5 py-0.5 text-xs">{`{ "error", "error_description" }`}</code>{" "}
            shape. Payments are simulated; no real charges occur anywhere in this API.
          </p>
        </div>

        {/* OAuth quickstart */}
        <div className="mt-6 rounded-2xl border border-sage/50 bg-ivory p-5">
          <h2 className="font-display text-lg font-semibold text-ink">OAuth 2.0 quickstart (third-party client)</h2>
          <p className="mt-1 text-sm text-ink/60">
            The three-step authorization-code flow, using the registered public client. See it running live
            on the <a href="/oauth-playground" className="font-medium text-pine underline">OAuth playground</a>.
          </p>
          <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm text-ink/80">
            <li>
              Send the user to the <strong>Auth URL</strong> with a PKCE challenge:
              <pre className="mt-1.5 overflow-x-auto rounded-xl bg-pinedeep p-3 text-xs leading-relaxed text-sage">
{`GET /oauth/authorize?response_type=code&client_id=demo-partner
    &redirect_uri=https://jasons-insurance.vercel.app/oauth-playground
    &scope=profile:read enrollments:read&state=<random>
    &code_challenge=<base64url(sha256(verifier))>&code_challenge_method=S256`}
              </pre>
            </li>
            <li>
              After consent, exchange the returned code at the <strong>Token URL</strong>:
              <pre className="mt-1.5 overflow-x-auto rounded-xl bg-pinedeep p-3 text-xs leading-relaxed text-sage">
{`curl -X POST https://jasons-insurance.vercel.app/api/oauth/token \\
  -d "grant_type=authorization_code&code=ac_...&client_id=demo-partner \\
      &redirect_uri=https://jasons-insurance.vercel.app/oauth-playground&code_verifier=<verifier>"

# confidential client instead authenticates with its secret:
curl -u demo-confidential:demo-secret-12345 -X POST .../api/oauth/token \\
  -d "grant_type=authorization_code&code=ac_...&redirect_uri=..."`}
              </pre>
            </li>
            <li>
              Call the APIs with the access token (scopes enforced per endpoint):
              <pre className="mt-1.5 overflow-x-auto rounded-xl bg-pinedeep p-3 text-xs leading-relaxed text-sage">
{`curl -H "Authorization: Bearer at_..." https://jasons-insurance.vercel.app/api/enrollments`}
              </pre>
            </li>
          </ol>
        </div>

        {/* Endpoint index */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-sage/50">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-paper text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-2.5">Method</th>
                <th className="px-4 py-2.5">Endpoint</th>
                <th className="px-4 py-2.5">Auth</th>
                <th className="px-4 py-2.5">Scope</th>
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
                  <td className="px-4 py-2 text-xs">{e.auth ? "Bearer" : "Public"}</td>
                  <td className="px-4 py-2 font-mono text-xs text-ink/60">{e.scope ?? "-"}</td>
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
                      <span className="rounded-full bg-pine px-2.5 py-0.5 text-xs font-semibold text-ivory">Bearer auth</span>
                    )}
                    {endpoint.scope && (
                      <span className="rounded-full bg-sagesoft px-2.5 py-0.5 font-mono text-xs font-semibold text-leaf">
                        scope: {endpoint.scope}
                      </span>
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
