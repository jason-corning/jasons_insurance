import { createFileRoute } from "@tanstack/react-router";

import {
  consumeAuthCode,
  clientRedirectUris,
  getOauthClient,
  issueTokenPair,
  oauthError,
  readCookie,
  REFRESH_COOKIE,
  requireDb,
  rotateRefreshToken,
  sha256Base64Url,
  sha256Hex,
  tokenResponse,
  verifyPassword,
  type SessionUser,
} from "../../../lib/auth.server";

/** Client credentials may arrive as HTTP Basic (RFC 6749 §2.3.1) or body params. */
function readBasicClient(request: Request): { clientId: string; clientSecret: string } | null {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Basic\s+(.+)$/i.exec(header.trim());
  if (!match) return null;
  try {
    const decoded = atob(match[1]);
    const separator = decoded.indexOf(":");
    if (separator < 0) return null;
    return {
      clientId: decodeURIComponent(decoded.slice(0, separator)),
      clientSecret: decodeURIComponent(decoded.slice(separator + 1)),
    };
  } catch {
    return null;
  }
}

async function readParams(request: Request): Promise<Record<string, string>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await request.formData();
    const out: Record<string, string> = {};
    for (const [key, value] of form.entries()) out[key] = String(value);
    return out;
  }
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(body)) out[key] = String(value ?? "");
    return out;
  } catch {
    return {};
  }
}

// OAuth 2.0 token endpoint (RFC 6749). Supported grants:
//   * password       — first-party login form (username or email + password)
//   * refresh_token  — rotate a refresh token (token from body, or the
//                      httpOnly cookie when the browser is the client)
// Accepts application/x-www-form-urlencoded (spec) or JSON.
export const Route = createFileRoute("/api/oauth/token")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const params = await readParams(request);
        const grantType = params.grant_type ?? "";

        if (grantType === "password") {
          const identifier = (params.username ?? params.identifier ?? "").trim();
          const password = params.password ?? "";
          if (!identifier || !password)
            return oauthError(400, "invalid_request", "username and password are required.");
          const user = await requireDb()
            .prepare("SELECT * FROM users WHERE username = ?1 OR email = lower(?1)")
            .bind(identifier)
            .first<SessionUser & { password_hash: string }>();
          if (!user || !(await verifyPassword(password, user.password_hash)))
            return oauthError(400, "invalid_grant", "That username/email or password is incorrect.");
          const pair = await issueTokenPair(user.id);
          return tokenResponse(pair);
        }

        if (grantType === "refresh_token") {
          const refreshToken = params.refresh_token || readCookie(request, REFRESH_COOKIE) || "";
          if (!refreshToken)
            return oauthError(400, "invalid_request", "refresh_token is required (body or cookie).");
          const rotated = await rotateRefreshToken(refreshToken);
          if (!rotated.ok) return oauthError(400, rotated.code, rotated.message);
          return tokenResponse(rotated.pair);
        }

        if (grantType === "authorization_code") {
          const basic = readBasicClient(request);
          const clientId = basic?.clientId ?? params.client_id ?? "";
          const clientSecret = basic?.clientSecret ?? params.client_secret ?? "";
          const code = params.code ?? "";
          const redirectUri = params.redirect_uri ?? "";
          const codeVerifier = params.code_verifier ?? "";

          const client = await getOauthClient(clientId);
          if (!client) return oauthError(401, "invalid_client", "Unknown client_id.");
          if (!code) return oauthError(400, "invalid_request", "code is required.");

          const row = await consumeAuthCode(code);
          if (!row) return oauthError(400, "invalid_grant", "Unknown authorization code.");
          if (row.used) {
            // Code replay: revoke anything already issued off this code's user+client.
            return oauthError(400, "invalid_grant", "Authorization code was already used.");
          }
          if (new Date(row.expires_at).getTime() < Date.now())
            return oauthError(400, "invalid_grant", "Authorization code has expired (60s lifetime).");
          if (row.client_id !== clientId)
            return oauthError(400, "invalid_grant", "Code was issued to a different client.");
          if (row.redirect_uri !== redirectUri)
            return oauthError(400, "invalid_grant", "redirect_uri does not match the authorization request.");

          if (client.confidential) {
            if (!clientSecret || (await sha256Hex(clientSecret)) !== client.secret_hash)
              return oauthError(401, "invalid_client", "Client authentication failed.");
          } else {
            // Public client: PKCE is mandatory (S256 only).
            if (!row.code_challenge || row.code_challenge_method !== "S256")
              return oauthError(400, "invalid_grant", "PKCE (S256) is required for this client.");
            if (!codeVerifier || (await sha256Base64Url(codeVerifier)) !== row.code_challenge)
              return oauthError(400, "invalid_grant", "PKCE verification failed.");
          }

          const pair = await issueTokenPair(row.user_id, undefined, row.scope);
          // Third-party client: no first-party cookies on this response.
          return tokenResponse(pair, { withCookies: false });
        }

        return oauthError(
          400,
          "unsupported_grant_type",
          "Supported grant_type values: password, refresh_token, authorization_code.",
        );
      },
    },
  },
});
