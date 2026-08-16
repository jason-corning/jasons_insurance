import { createFileRoute } from "@tanstack/react-router";

import { errorJson, json, requireDb } from "../../../lib/auth.server";

function maskUsername(username: string): string {
  if (username.length <= 3) return `${username[0]}**`;
  return `${username.slice(0, 2)}${"*".repeat(Math.max(2, username.length - 4))}${username.slice(-2)}`;
}

// Demo note: with no outbound email service, the response includes the
// username reminder that production would send to the account's email.
export const Route = createFileRoute("/api/auth/forgot-username")({
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

        const user = await requireDb()
          .prepare("SELECT username FROM users WHERE email = ?1")
          .bind(email)
          .first<{ username: string }>();

        // Do not reveal whether the account exists; always report success.
        if (!user) return json({ ok: true, sent: true, usernameMasked: null, username: null });
        return json({
          ok: true,
          sent: true,
          usernameMasked: maskUsername(user.username),
          username: user.username,
        });
      },
    },
  },
});
