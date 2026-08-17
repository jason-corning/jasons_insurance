import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Page, PageHeading } from "../components/site";

// A live third-party OAuth 2.0 client, running entirely in your browser:
// authorization-code flow with PKCE against this site's own Auth URL and
// Token URL, using the registered public client `demo-partner`.
type PlaygroundSearch = { code?: string; state?: string; error?: string };

export const Route = createFileRoute("/oauth-playground")({
  validateSearch: (search: Record<string, unknown>): PlaygroundSearch => ({
    code: typeof search.code === "string" ? search.code : undefined,
    state: typeof search.state === "string" ? search.state : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  head: () => ({ meta: [{ title: "OAuth Playground · Jason's Insurance" }] }),
  component: Playground,
});

const CLIENT_ID = "demo-partner";
const REQUESTED_SCOPE = "profile:read enrollments:read";

function randomString(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function s256(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  let binary = "";
  for (const b of new Uint8Array(digest)) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

type TokenSet = { access_token: string; token_type: string; expires_in: number; scope: string };

function Playground() {
  const { code, state, error: authError } = Route.useSearch();
  const [tokens, setTokens] = useState<TokenSet | null>(null);
  const [profile, setProfile] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<string | null>(null);
  const [writeAttempt, setWriteAttempt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exchanging, setExchanging] = useState(false);

  async function startFlow() {
    const verifier = randomString();
    const stateValue = randomString().slice(0, 16);
    sessionStorage.setItem("pkce_verifier", verifier);
    sessionStorage.setItem("oauth_state", stateValue);
    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: `${window.location.origin}/oauth-playground`,
      scope: REQUESTED_SCOPE,
      state: stateValue,
      code_challenge: await s256(verifier),
      code_challenge_method: "S256",
    });
    window.location.href = `/oauth/authorize?${params.toString()}`;
  }

  useEffect(() => {
    if (!code || tokens || exchanging) return;
    const verifier = sessionStorage.getItem("pkce_verifier");
    const expectedState = sessionStorage.getItem("oauth_state");
    if (!verifier) {
      setError("No PKCE verifier in this browser session; restart the flow.");
      return;
    }
    if (state && expectedState && state !== expectedState) {
      setError("State mismatch: possible CSRF; restart the flow.");
      return;
    }
    setExchanging(true);
    (async () => {
      try {
        const response = await fetch("/api/oauth/token", {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: `${window.location.origin}/oauth-playground`,
            client_id: CLIENT_ID,
            code_verifier: verifier,
          }).toString(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(`${data.error}: ${data.error_description}`);
        setTokens(data as TokenSet);
        sessionStorage.removeItem("pkce_verifier");
        sessionStorage.removeItem("oauth_state");

        const bearer = { Authorization: `Bearer ${(data as TokenSet).access_token}` };
        const profileResponse = await fetch("/api/profile", { headers: bearer });
        setProfile(JSON.stringify(await profileResponse.json(), null, 2));
        const enrollmentsResponse = await fetch("/api/enrollments", { headers: bearer });
        setEnrollments(JSON.stringify(await enrollmentsResponse.json(), null, 2));
        // Deliberately try a WRITE with a read-only token to show scope enforcement.
        const writeResponse = await fetch("/api/profile/phone", {
          method: "PUT",
          headers: { ...bearer, "content-type": "application/json" },
          body: JSON.stringify({ phone: "555 000 0000" }),
        });
        setWriteAttempt(`HTTP ${writeResponse.status}: ${JSON.stringify(await writeResponse.json())}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Token exchange failed.");
      } finally {
        setExchanging(false);
      }
    })();
  }, [code, state, tokens, exchanging]);

  return (
    <Page>
      <PageHeading
        eyebrow="Developers"
        title="OAuth 2.0 playground"
        lede="A live third-party client (client_id: demo-partner) running the authorization-code flow with PKCE against this site's Auth URL and Token URL."
      />
      <div className="mx-auto max-w-3xl space-y-6 px-4 pb-20 sm:px-6">
        {authError && (
          <p className="rounded-xl border border-clay/30 bg-claysoft px-4 py-3 text-sm font-medium text-clay">
            Authorization was denied ({authError}). You can start over below.
          </p>
        )}
        {error && (
          <p className="rounded-xl border border-clay/30 bg-claysoft px-4 py-3 text-sm font-medium text-clay">
            {error}
          </p>
        )}

        {!tokens ? (
          <div className="rounded-3xl border border-sage/60 bg-ivory p-7">
            <h2 className="font-display text-xl font-semibold text-ink">Step 1 — Authorize</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/70">
              This page acts as an external app. Clicking the button generates a PKCE verifier, then sends
              you to the Auth URL (<code className="rounded bg-paper px-1.5 py-0.5 text-xs">/oauth/authorize</code>)
              requesting <code className="rounded bg-paper px-1.5 py-0.5 text-xs">{REQUESTED_SCOPE}</code>. You'll
              sign in (if needed), see the consent screen, and be redirected back here with a single-use code.
            </p>
            <button
              onClick={startFlow}
              disabled={exchanging}
              className="mt-5 rounded-full bg-pine px-7 py-3.5 font-semibold text-ivory transition hover:bg-pinedeep disabled:opacity-60"
            >
              {exchanging ? "Exchanging code…" : "Authorize with Jason's Insurance"}
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-3xl border border-leaf/40 bg-sagesoft p-7">
              <h2 className="font-display text-xl font-semibold text-pine">Step 2 — Tokens received</h2>
              <p className="mt-2 text-sm text-ink/70">
                The code was exchanged at the Token URL with the PKCE verifier. No cookies involved: this
                client holds its own Bearer token.
              </p>
              <dl className="mt-4 space-y-1.5 text-sm">
                <div className="flex gap-2">
                  <dt className="shrink-0 font-semibold text-ink">access_token:</dt>
                  <dd className="break-all font-mono text-xs text-ink/70">{tokens.access_token.slice(0, 24)}…</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-semibold text-ink">token_type:</dt>
                  <dd className="text-ink/70">{tokens.token_type}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-semibold text-ink">expires_in:</dt>
                  <dd className="text-ink/70">{tokens.expires_in}s</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-semibold text-ink">scope:</dt>
                  <dd className="text-ink/70">{tokens.scope}</dd>
                </div>
              </dl>
            </div>

            <ResultCard title="GET /api/profile with the Bearer token (profile:read ✓)" body={profile} />
            <ResultCard title="GET /api/enrollments with the Bearer token (enrollments:read ✓)" body={enrollments} />
            <div className="rounded-3xl border border-clay/40 bg-ivory p-7">
              <h2 className="font-display text-lg font-semibold text-clay">
                Scope enforcement: PUT /api/profile/phone with a read-only token
              </h2>
              <p className="mt-2 text-sm text-ink/70">
                This token has no <code className="rounded bg-paper px-1.5 py-0.5 text-xs">profile:write</code> scope,
                so the API refuses the write:
              </p>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-pinedeep p-4 text-xs leading-relaxed text-sage">
                {writeAttempt ?? "…"}
              </pre>
            </div>
            <button
              onClick={() => {
                window.location.href = "/oauth-playground";
              }}
              className="rounded-full border-2 border-pine/20 px-6 py-3 font-semibold text-pine transition hover:border-pine hover:bg-sagesoft"
            >
              Start over
            </button>
          </>
        )}
      </div>
    </Page>
  );
}

function ResultCard({ title, body }: { title: string; body: string | null }) {
  return (
    <div className="rounded-3xl border border-sage/60 bg-ivory p-7">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-pinedeep p-4 text-xs leading-relaxed text-sage">
        {body ?? "…"}
      </pre>
    </div>
  );
}
