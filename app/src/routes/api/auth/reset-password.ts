import { createFileRoute } from "@tanstack/react-router";

import { errorJson, hashPassword, json, requireDb } from "../../../lib/auth.server";

export const Route = createFileRoute("/api/auth/reset-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return errorJson(400, "invalid_json", "Request body must be JSON.");
        }
        const token = String(body.token ?? "").trim();
        const password = String(body.password ?? "");
        if (!token) return errorJson(400, "missing_token", "Reset token is required.");
        if (password.length < 8)
          return errorJson(400, "weak_password", "Password must be at least 8 characters.");

        const db = requireDb();
        const row = await db
          .prepare(
            "SELECT token, user_id, used, expires_at FROM reset_tokens WHERE token = ?1 AND purpose = 'password_reset'",
          )
          .bind(token)
          .first<{ token: string; user_id: number; used: number; expires_at: string }>();
        if (!row || row.used) return errorJson(400, "invalid_token", "That reset link is invalid or was already used.");
        if (new Date(row.expires_at).getTime() < Date.now())
          return errorJson(400, "expired_token", "That reset link has expired. Request a new one.");

        const passwordHash = await hashPassword(password);
        await db.prepare("UPDATE users SET password_hash = ?1 WHERE id = ?2").bind(passwordHash, row.user_id).run();
        await db.prepare("UPDATE reset_tokens SET used = 1 WHERE token = ?1").bind(token).run();
        // Sign out all existing sessions for safety.
        await db.prepare("DELETE FROM sessions WHERE user_id = ?1").bind(row.user_id).run();

        return json({ ok: true });
      },
    },
  },
});
