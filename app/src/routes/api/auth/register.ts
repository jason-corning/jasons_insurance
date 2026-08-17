import { createFileRoute } from "@tanstack/react-router";

import {
  ACCESS_TTL_SECONDS,
  errorJson,
  hashPassword,
  issueTokenPair,
  jsonWithCookies,
  publicUser,
  requireDb,
  tokenCookies,
  TOKEN_SCOPE,
  type SessionUser,
} from "../../../lib/auth.server";

const USERNAME_RE = /^[a-zA-Z0-9._-]{3,32}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Route = createFileRoute("/api/auth/register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return errorJson(400, "invalid_json", "Request body must be JSON.");
        }
        const username = String(body.username ?? "").trim();
        const email = String(body.email ?? "").trim().toLowerCase();
        const password = String(body.password ?? "");
        const firstName = String(body.firstName ?? "").trim();
        const lastName = String(body.lastName ?? "").trim();
        const dateOfBirth = body.dateOfBirth ? String(body.dateOfBirth) : null;

        if (!USERNAME_RE.test(username))
          return errorJson(400, "invalid_username", "Username must be 3-32 characters (letters, numbers, dots, dashes).");
        if (!EMAIL_RE.test(email)) return errorJson(400, "invalid_email", "Enter a valid email address.");
        if (password.length < 8)
          return errorJson(400, "weak_password", "Password must be at least 8 characters.");
        if (!firstName || !lastName)
          return errorJson(400, "missing_name", "First and last name are required.");

        const db = requireDb();
        const existing = await db
          .prepare("SELECT id, username, email FROM users WHERE username = ?1 OR email = ?2")
          .bind(username, email)
          .first<{ id: number; username: string; email: string }>();
        if (existing) {
          const which = existing.email === email ? "email" : "username";
          return errorJson(409, `${which}_taken`, `An account with that ${which} already exists.`);
        }

        const passwordHash = await hashPassword(password);
        const inserted = await db
          .prepare(
            `INSERT INTO users (username, email, password_hash, first_name, last_name, date_of_birth)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6) RETURNING id`,
          )
          .bind(username, email, passwordHash, firstName, lastName, dateOfBirth)
          .first<{ id: number }>();
        if (!inserted) return errorJson(500, "create_failed", "Could not create the account.");

        const pair = await issueTokenPair(inserted.id);
        const user = await db
          .prepare("SELECT * FROM users WHERE id = ?1")
          .bind(inserted.id)
          .first<SessionUser>();
        return jsonWithCookies(
          {
            ok: true,
            user: user ? publicUser(user) : null,
            access_token: pair.accessToken,
            token_type: "Bearer",
            expires_in: ACCESS_TTL_SECONDS,
            refresh_token: pair.refreshToken,
            scope: TOKEN_SCOPE,
          },
          201,
          tokenCookies(pair),
        );
      },
    },
  },
});
