import { createFileRoute } from "@tanstack/react-router";

import {
  ACCESS_TTL_SECONDS,
  errorJson,
  issueTokenPair,
  jsonWithCookies,
  publicUser,
  requireDb,
  tokenCookies,
  TOKEN_SCOPE,
  verifyPassword,
  type SessionUser,
} from "../../../lib/auth.server";

// Convenience wrapper around the OAuth password grant for the site's own
// login form: same token issuance as POST /api/oauth/token, plus the user
// profile in the response body.
export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return errorJson(400, "invalid_json", "Request body must be JSON.");
        }
        const identifier = String(body.identifier ?? body.username ?? "").trim();
        const password = String(body.password ?? "");
        if (!identifier || !password)
          return errorJson(400, "missing_fields", "Username (or email) and password are required.");

        const user = await requireDb()
          .prepare("SELECT * FROM users WHERE username = ?1 OR email = lower(?1)")
          .bind(identifier)
          .first<SessionUser & { password_hash: string }>();
        if (!user || !(await verifyPassword(password, user.password_hash)))
          return errorJson(401, "bad_credentials", "That username/email or password is incorrect.");

        const pair = await issueTokenPair(user.id);
        return jsonWithCookies(
          {
            ok: true,
            user: publicUser(user),
            access_token: pair.accessToken,
            token_type: "Bearer",
            expires_in: ACCESS_TTL_SECONDS,
            refresh_token: pair.refreshToken,
            scope: TOKEN_SCOPE,
          },
          200,
          tokenCookies(pair),
        );
      },
    },
  },
});
