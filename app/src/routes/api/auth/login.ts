import { createFileRoute } from "@tanstack/react-router";

import {
  createSession,
  errorJson,
  json,
  publicUser,
  requireDb,
  verifyPassword,
  type SessionUser,
} from "../../../lib/auth.server";

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

        const db = requireDb();
        const user = await db
          .prepare("SELECT * FROM users WHERE username = ?1 OR email = lower(?1)")
          .bind(identifier)
          .first<SessionUser & { password_hash: string }>();
        if (!user || !(await verifyPassword(password, user.password_hash)))
          return errorJson(401, "bad_credentials", "That username/email or password is incorrect.");

        const { cookie } = await createSession(user.id);
        return json({ ok: true, user: publicUser(user) }, { headers: { "set-cookie": cookie } });
      },
    },
  },
});
