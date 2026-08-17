import { createFileRoute } from "@tanstack/react-router";

import { errorJson, json, requireDb, requireUser } from "../../../lib/auth.server";
import {
  enrollmentToJson,
  getEnrollment,
  REINSTATEMENT_WINDOW_DAYS,
  withinReinstatementWindow,
} from "../../../lib/enrollments.server";

export const Route = createFileRoute("/api/enrollments/$enrollmentId/reinstate")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const auth = await requireUser(request, "enrollments:write");
        if ("response" in auth) return auth.response;
        const id = Number(params.enrollmentId);
        if (!Number.isInteger(id) || id <= 0) return errorJson(400, "invalid_id", "Enrollment id must be a positive integer.");

        const row = await getEnrollment(id, auth.user.id);
        if (!row) return errorJson(404, "not_found", "No enrollment with that id on your account.");
        if (row.status !== "cancelled" && row.status !== "terminated")
          return errorJson(409, "not_cancelled", "Only a cancelled or terminated enrollment can be reinstated.");
        if (!withinReinstatementWindow(row.cancelled_at))
          return errorJson(
            409,
            "window_closed",
            `Reinstatement is available within ${REINSTATEMENT_WINDOW_DAYS} days of cancellation. Please start a new enrollment instead.`,
          );

        // Reinstated coverage resumes as active with its original effective
        // date; any missed premiums are collected with the next invoice.
        await requireDb()
          .prepare(
            "UPDATE enrollments SET status = 'active', reinstated_at = datetime('now'), cancel_reason = NULL WHERE id = ?1",
          )
          .bind(id)
          .run();

        const updated = await getEnrollment(id, auth.user.id);
        return json({ ok: true, enrollment: updated ? enrollmentToJson(updated) : null });
      },
    },
  },
});
