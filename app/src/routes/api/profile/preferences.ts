import { createFileRoute } from "@tanstack/react-router";

import { errorJson, json, requireDb, requireUser } from "../../../lib/auth.server";

export const Route = createFileRoute("/api/profile/preferences")({
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
        const email = body.email === undefined ? !!auth.user.pref_email : !!body.email;
        const sms = body.sms === undefined ? !!auth.user.pref_sms : !!body.sms;
        const mail = body.mail === undefined ? !!auth.user.pref_mail : !!body.mail;
        const paperless = body.paperless === undefined ? !!auth.user.pref_paperless : !!body.paperless;
        if (!email && !sms && !mail)
          return errorJson(400, "no_channel", "Keep at least one contact channel (email, text, or mail) enabled.");

        await requireDb()
          .prepare(
            "UPDATE users SET pref_email = ?1, pref_sms = ?2, pref_mail = ?3, pref_paperless = ?4 WHERE id = ?5",
          )
          .bind(email ? 1 : 0, sms ? 1 : 0, mail ? 1 : 0, paperless ? 1 : 0, auth.user.id)
          .run();
        return json({ ok: true, communicationPreferences: { email, sms, mail, paperless } });
      },
    },
  },
});
