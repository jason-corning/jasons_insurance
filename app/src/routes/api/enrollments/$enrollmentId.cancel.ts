import { createFileRoute } from "@tanstack/react-router";

import { errorJson, json, requireDb, requireUser } from "../../../lib/auth.server";
import { enrollmentToJson, getEnrollment } from "../../../lib/enrollments.server";

export const Route = createFileRoute("/api/enrollments/$enrollmentId/cancel")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const auth = await requireUser(request);
        if ("response" in auth) return auth.response;
        const id = Number(params.enrollmentId);
        if (!Number.isInteger(id) || id <= 0) return errorJson(400, "invalid_id", "Enrollment id must be a positive integer.");

        let reason = "";
        try {
          const body = (await request.json()) as Record<string, unknown>;
          reason = String(body.reason ?? "").slice(0, 500);
        } catch {
          // body optional
        }

        const row = await getEnrollment(id, auth.user.id);
        if (!row) return errorJson(404, "not_found", "No enrollment with that id on your account.");
        if (row.status === "cancelled" || row.status === "terminated")
          return errorJson(409, "already_cancelled", "This enrollment is already cancelled.");

        await requireDb()
          .prepare(
            "UPDATE enrollments SET status = 'cancelled', cancelled_at = datetime('now'), cancel_reason = ?2 WHERE id = ?1",
          )
          .bind(id, reason || null)
          .run();

        const updated = await getEnrollment(id, auth.user.id);
        return json({ ok: true, enrollment: updated ? enrollmentToJson(updated) : null });
      },
    },
  },
});
