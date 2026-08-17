import { createFileRoute } from "@tanstack/react-router";

import {
  clientRedirectUris,
  currentUser,
  errorJson,
  getOauthClient,
  json,
  resolveScopes,
  SCOPES,
} from "../../../lib/auth.server";

// Backing API for the consent page (/oauth/authorize): validates the
// authorization request and describes the client + requested scopes.
export const Route = createFileRoute("/api/oauth/authorize-info")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const clientId = url.searchParams.get("client_id") ?? "";
        const redirectUri = url.searchParams.get("redirect_uri") ?? "";
        const responseType = url.searchParams.get("response_type") ?? "";
        const scope = url.searchParams.get("scope");
        const codeChallenge = url.searchParams.get("code_challenge");
        const codeChallengeMethod = url.searchParams.get("code_challenge_method");

        const client = await getOauthClient(clientId);
        if (!client) return errorJson(400, "invalid_client", "Unknown client_id.");
        if (!clientRedirectUris(client).includes(redirectUri))
          return errorJson(400, "invalid_redirect_uri", "redirect_uri is not registered for this client.");
        if (responseType !== "code")
          return errorJson(400, "unsupported_response_type", "Only response_type=code is supported.");
        if (!client.confidential && (!codeChallenge || codeChallengeMethod !== "S256"))
          return errorJson(400, "pkce_required", "This public client must send code_challenge (S256).");

        const scopes = resolveScopes(client, scope);
        if (scopes.length === 0)
          return errorJson(400, "invalid_scope", "No requested scope is allowed for this client.");

        const user = await currentUser(request);
        return json({
          ok: true,
          authenticated: !!user,
          firstName: user?.first_name ?? null,
          clientName: client.name,
          clientId: client.client_id,
          scopes: scopes.map((s) => ({ scope: s, description: SCOPES[s] })),
        });
      },
    },
  },
});
