import { createFileRoute } from "@tanstack/react-router";

import {
  clientRedirectUris,
  errorJson,
  getOauthClient,
  issueAuthCode,
  json,
  requireUser,
  resolveScopes,
} from "../../../lib/auth.server";

function withParams(base: string, params: Record<string, string>): string {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url.toString();
}

// Consent decision endpoint: the signed-in user approves or denies an
// authorization request; approval mints a single-use 60-second code.
export const Route = createFileRoute("/api/oauth/approve")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await requireUser(request);
        if ("response" in auth) return auth.response;

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return errorJson(400, "invalid_json", "Request body must be JSON.");
        }
        const clientId = String(body.client_id ?? "");
        const redirectUri = String(body.redirect_uri ?? "");
        const scope = body.scope ? String(body.scope) : null;
        const state = body.state ? String(body.state) : null;
        const codeChallenge = body.code_challenge ? String(body.code_challenge) : null;
        const codeChallengeMethod = body.code_challenge_method ? String(body.code_challenge_method) : null;
        const decision = String(body.decision ?? "");

        const client = await getOauthClient(clientId);
        if (!client) return errorJson(400, "invalid_client", "Unknown client_id.");
        if (!clientRedirectUris(client).includes(redirectUri))
          return errorJson(400, "invalid_redirect_uri", "redirect_uri is not registered for this client.");

        if (decision !== "approve") {
          return json({
            ok: true,
            redirect: withParams(redirectUri, { error: "access_denied", ...(state ? { state } : {}) }),
          });
        }

        if (!client.confidential && (!codeChallenge || codeChallengeMethod !== "S256"))
          return errorJson(400, "pkce_required", "This public client must send code_challenge (S256).");

        const scopes = resolveScopes(client, scope);
        if (scopes.length === 0)
          return errorJson(400, "invalid_scope", "No requested scope is allowed for this client.");

        const code = await issueAuthCode({
          clientId,
          userId: auth.user.id,
          redirectUri,
          scope: scopes.join(" "),
          codeChallenge,
          codeChallengeMethod,
        });
        return json({
          ok: true,
          redirect: withParams(redirectUri, { code, ...(state ? { state } : {}) }),
        });
      },
    },
  },
});
