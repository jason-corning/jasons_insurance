import { createFileRoute } from "@tanstack/react-router";

import { currentUser, errorJson, json, requireDb } from "../../lib/auth.server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      // Submit a support message. Stored for the support team; signed-in
      // submissions are linked to the account automatically.
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return errorJson(400, "invalid_json", "Request body must be JSON.");
        }
        const name = String(body.name ?? "").trim().slice(0, 120);
        const email = String(body.email ?? "").trim().toLowerCase();
        const subject = String(body.subject ?? "").trim().slice(0, 200);
        const message = String(body.message ?? "").trim().slice(0, 4000);

        if (!name) return errorJson(400, "missing_name", "Your name is required.");
        if (!EMAIL_RE.test(email)) return errorJson(400, "invalid_email", "Enter a valid email address so we can reply.");
        if (!subject) return errorJson(400, "missing_subject", "A subject is required.");
        if (message.length < 10) return errorJson(400, "message_too_short", "Tell us a bit more (at least 10 characters).");

        const user = await currentUser(request);
        const inserted = await requireDb()
          .prepare(
            "INSERT INTO support_messages (user_id, name, email, subject, message) VALUES (?1, ?2, ?3, ?4, ?5) RETURNING id",
          )
          .bind(user?.id ?? null, name, email, subject, message)
          .first<{ id: number }>();

        return json({ ok: true, ticketId: inserted?.id ?? null }, 201);
      },
    },
  },
});
