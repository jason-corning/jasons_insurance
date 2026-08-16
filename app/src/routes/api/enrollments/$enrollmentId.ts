import { createFileRoute } from "@tanstack/react-router";

import { errorJson, json, requireDb, requireUser } from "../../../lib/auth.server";
import { enrollmentToJson, getEnrollment } from "../../../lib/enrollments.server";

export const Route = createFileRoute("/api/enrollments/$enrollmentId")({
  server: {
    handlers: {
      // Enrollment status + payment history at any time.
      GET: async ({ request, params }) => {
        const auth = await requireUser(request);
        if ("response" in auth) return auth.response;
        const id = Number(params.enrollmentId);
        if (!Number.isInteger(id) || id <= 0) return errorJson(400, "invalid_id", "Enrollment id must be a positive integer.");
        const row = await getEnrollment(id, auth.user.id);
        if (!row) return errorJson(404, "not_found", "No enrollment with that id on your account.");
        const payments = await requireDb()
          .prepare(
            "SELECT id, amount, kind, card_brand, card_last4, status, paid_at FROM payments WHERE enrollment_id = ?1 ORDER BY paid_at DESC",
          )
          .bind(id)
          .all<{ id: number; amount: number; kind: string; card_brand: string; card_last4: string; status: string; paid_at: string }>();
        return json({
          ok: true,
          enrollment: enrollmentToJson(row),
          payments: (payments.results ?? []).map((p) => ({
            id: p.id,
            amount: p.amount,
            kind: p.kind,
            cardBrand: p.card_brand,
            cardLast4: p.card_last4,
            status: p.status,
            paidAt: p.paid_at,
          })),
        });
      },
    },
  },
});
