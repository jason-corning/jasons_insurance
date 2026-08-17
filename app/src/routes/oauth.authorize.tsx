import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { FormError } from "../components/forms";
import { Page, Spinner } from "../components/site";
import { api, RequestError } from "../lib/client-api";

// The OAuth 2.0 authorization endpoint ("Auth URL"): third-party clients send
// users here with response_type=code&client_id=…&redirect_uri=…&scope=…
// (&state, &code_challenge for PKCE). Signed-in users see a consent screen;
// approval redirects back to the client with a single-use code.
type AuthorizeSearch = {
  response_type?: string;
  client_id?: string;
  redirect_uri?: string;
  scope?: string;
  state?: string;
  code_challenge?: string;
  code_challenge_method?: string;
};

export const Route = createFileRoute("/oauth/authorize")({
  validateSearch: (search: Record<string, unknown>): AuthorizeSearch => ({
    response_type: typeof search.response_type === "string" ? search.response_type : undefined,
    client_id: typeof search.client_id === "string" ? search.client_id : undefined,
    redirect_uri: typeof search.redirect_uri === "string" ? search.redirect_uri : undefined,
    scope: typeof search.scope === "string" ? search.scope : undefined,
    state: typeof search.state === "string" ? search.state : undefined,
    code_challenge: typeof search.code_challenge === "string" ? search.code_challenge : undefined,
    code_challenge_method:
      typeof search.code_challenge_method === "string" ? search.code_challenge_method : undefined,
  }),
  head: () => ({ meta: [{ title: "Authorize access · Jason's Insurance" }] }),
  component: Authorize,
});

type AuthorizeInfo = {
  ok: boolean;
  authenticated: boolean;
  firstName: string | null;
  clientName: string;
  clientId: string;
  scopes: { scope: string; description: string }[];
};

function Authorize() {
  const search = Route.useSearch();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) if (value) params.set(key, value);

  const { data, isLoading, error: loadError } = useQuery({
    queryKey: ["authorize-info", params.toString()],
    queryFn: () => api<AuthorizeInfo>(`/api/oauth/authorize-info?${params.toString()}`),
    retry: false,
  });

  async function decide(decision: "approve" | "deny") {
    setBusy(true);
    setError(null);
    try {
      const response = await api<{ ok: boolean; redirect: string }>("/api/oauth/approve", {
        method: "POST",
        body: JSON.stringify({
          client_id: search.client_id,
          redirect_uri: search.redirect_uri,
          scope: search.scope,
          state: search.state,
          code_challenge: search.code_challenge,
          code_challenge_method: search.code_challenge_method,
          decision,
        }),
      });
      window.location.href = response.redirect;
    } catch (e) {
      setError(e instanceof RequestError ? e.message : "Authorization failed. Please try again.");
      setBusy(false);
    }
  }

  const selfPath =
    typeof window === "undefined" ? "/oauth/authorize" : window.location.pathname + window.location.search;

  return (
    <Page>
      <div className="mx-auto w-full max-w-md px-4 py-14">
        <div className="rounded-3xl border border-sage/60 bg-ivory p-8 shadow-xl shadow-pine/5">
          {isLoading ? (
            <Spinner />
          ) : loadError || !data ? (
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink">Invalid authorization request</h1>
              <p className="mt-3 text-sm text-ink/70">
                {loadError instanceof RequestError
                  ? loadError.message
                  : "The client, redirect URI, or scope in this request is not valid."}
              </p>
            </div>
          ) : !data.authenticated ? (
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink">Sign in to continue</h1>
              <p className="mt-3 text-sm text-ink/70">
                <strong className="text-ink">{data.clientName}</strong> wants to access your Jason's
                Insurance account. Sign in first, then review what it's asking for.
              </p>
              <Link
                to="/login"
                search={{ redirect: selfPath }}
                className="mt-5 block w-full rounded-2xl bg-pine px-6 py-3.5 text-center font-semibold text-ivory transition hover:bg-pinedeep"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-leaf">Authorization request</p>
              <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
                {data.clientName} wants access
              </h1>
              <p className="mt-2 text-sm text-ink/60">
                Signed in as <strong className="text-ink">{data.firstName}</strong>. Approving lets{" "}
                <strong className="text-ink">{data.clientName}</strong> ({data.clientId}):
              </p>
              <ul className="mt-4 space-y-2">
                {data.scopes.map((entry) => (
                  <li key={entry.scope} className="flex items-start gap-3 rounded-xl border border-sage/50 bg-paper px-4 py-3">
                    <span aria-hidden className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-leaf text-xs font-bold text-ivory">
                      ✓
                    </span>
                    <span>
                      <span className="block text-sm text-ink/85">{entry.description}</span>
                      <code className="text-xs text-ink/45">{entry.scope}</code>
                    </span>
                  </li>
                ))}
              </ul>
              <FormError message={error} />
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => decide("deny")}
                  disabled={busy}
                  className="rounded-2xl border-2 border-sage px-6 py-3 font-semibold text-ink/70 transition hover:border-clay hover:text-clay disabled:opacity-60"
                >
                  Deny
                </button>
                <button
                  onClick={() => decide("approve")}
                  disabled={busy}
                  className="rounded-2xl bg-pine px-6 py-3 font-semibold text-ivory transition hover:bg-pinedeep disabled:opacity-60"
                >
                  {busy ? "One moment…" : "Approve"}
                </button>
              </div>
              <p className="mt-4 text-center text-xs text-ink/50">
                You can revoke this access any time (tokens expire in 15 minutes; refresh access ends when
                revoked).
              </p>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
