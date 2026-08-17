import { createFileRoute } from "@tanstack/react-router";

import { errorJson, json, requireDb, requireUser } from "../../../lib/auth.server";

export const Route = createFileRoute("/api/profile/phone")({
  server: {
    handlers: {
      PUT: async ({ request }) => {
        const auth = await requireUser(request, "profile:write");
        if ("response" in auth) return auth.response;
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return errorJson(400, "invalid_json", "Request body must be JSON.");
        }
        const raw = String(body.phone ?? "");
        const digits = raw.replace(/\D/g, "");
        if (digits.length !== 10 && !(digits.length === 11 && digits.startsWith("1")))
          return errorJson(400, "invalid_phone", "Enter a valid 10-digit US phone number.");
        const ten = digits.slice(-10);
        const formatted = `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`;

        await requireDb()
          .prepare("UPDATE users SET phone = ?1 WHERE id = ?2")
          .bind(formatted, auth.user.id)
          .run();
        return json({ ok: true, phone: formatted });
      },
    },
  },
});
