import { createFileRoute } from "@tanstack/react-router";

import { errorJson, json, requireDb, requireUser } from "../../../lib/auth.server";

const STATE_RE = /^[A-Z]{2}$/;
const ZIP_RE = /^\d{5}(-\d{4})?$/;

export const Route = createFileRoute("/api/profile/address")({
  server: {
    handlers: {
      PUT: async ({ request }) => {
        const auth = await requireUser(request);
        if ("response" in auth) return auth.response;
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return errorJson(400, "invalid_json", "Request body must be JSON.");
        }
        const street = String(body.street ?? "").trim();
        const city = String(body.city ?? "").trim();
        const state = String(body.state ?? "").trim().toUpperCase();
        const zip = String(body.zip ?? "").trim();

        if (!street || street.length < 4) return errorJson(400, "invalid_street", "Enter a street address.");
        if (!city) return errorJson(400, "invalid_city", "Enter a city.");
        if (!STATE_RE.test(state)) return errorJson(400, "invalid_state", "State must be a 2-letter code (e.g. CA).");
        if (!ZIP_RE.test(zip)) return errorJson(400, "invalid_zip", "ZIP must be 5 digits (or ZIP+4).");

        await requireDb()
          .prepare(
            "UPDATE users SET address_street = ?1, address_city = ?2, address_state = ?3, address_zip = ?4 WHERE id = ?5",
          )
          .bind(street, city, state, zip, auth.user.id)
          .run();
        return json({ ok: true, address: { street, city, state, zip } });
      },
    },
  },
});
