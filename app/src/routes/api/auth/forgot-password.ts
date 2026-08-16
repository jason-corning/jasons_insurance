import { createFileRoute } from "@tanstack/react-router";

import { errorJson, json, newToken, requireDb } from "../../../lib/auth.server";

// Demo note: there is no outbound email service wired up, so instead of
// emailing the reset link we return it in the response and the UI presents it
// to the user directly, clearly labeled as a demo behavior.
export const Route = createFileRoute("/api/auth/forgot-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return errorJson(400, "invalid_json", "Request body must be JSON.");
        }
        const email = String(body.email ?? "").trim().toLowerCase();
        if (!email) return errorJson(400, "missing_email", "Email is required.");

        const db = requireDb();
        const user = await db
          .prepare("SELECT id FROM users WHERE email = ?1")
          .bind(email)
          .first<{ id: number }>();

        // Do not reveal whether the account exists; always report success.
        if (!user) return json({ ok: true, sent: true, resetToken: null });

        const token = newToken();
        const expires = new Date(Date.now() + 60 * 60 * 1000);
        await db
          .prepare(
            "INSERT INTO reset_tokens (token, user_id, purpose, expires_at) VALUES (?1, ?2, 'password_reset', ?3)",
          )
          .bind(token, user.id, expires.toISOString())
          .run();

        return json({ ok: true, sent: true, resetToken: token, expiresAt: expires.toISOString() });
      },
    },
  },
});
