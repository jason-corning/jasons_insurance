import { createFileRoute } from "@tanstack/react-router";

import { errorJson, json, requireDb, requireUser } from "../../../lib/auth.server";
import { computeEffectiveDate, enrollmentToJson, type EnrollmentRow } from "../../../lib/enrollments.server";

export const Route = createFileRoute("/api/enrollments/")({
  server: {
    handlers: {
      // List the signed-in user's enrollments.
      GET: async ({ request }) => {
        const auth = await requireUser(request);
        if ("response" in auth) return auth.response;
        const rows = await requireDb()
          .prepare(
            `SELECT e.*, p.name AS plan_name, p.carrier, p.plan_type, p.tier
               FROM enrollments e JOIN plans p ON p.id = e.plan_id
              WHERE e.user_id = ?1 ORDER BY e.created_at DESC`,
          )
          .bind(auth.user.id)
          .all<EnrollmentRow>();
        return json({ ok: true, enrollments: (rows.results ?? []).map(enrollmentToJson) });
      },

      // Start an enrollment in a plan (status: pending_payment until the
      // first premium payment is made).
      POST: async ({ request }) => {
        const auth = await requireUser(request);
        if ("response" in auth) return auth.response;
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return errorJson(400, "invalid_json", "Request body must be JSON.");
        }
        const planId = Number(body.planId);
        const members = Math.min(Math.max(Number(body.members ?? 1) || 1, 1), 8);
        if (!Number.isInteger(planId) || planId <= 0)
          return errorJson(400, "invalid_plan", "planId must be a positive integer.");

        const db = requireDb();
        const plan = await db
          .prepare("SELECT id, monthly_premium, name FROM plans WHERE id = ?1")
          .bind(planId)
          .first<{ id: number; monthly_premium: number; name: string }>();
        if (!plan) return errorJson(404, "plan_not_found", "No plan with that id.");

        const duplicate = await db
          .prepare(
            `SELECT id FROM enrollments
              WHERE user_id = ?1 AND plan_id = ?2 AND status IN ('pending_payment','active')`,
          )
          .bind(auth.user.id, planId)
          .first<{ id: number }>();
        if (duplicate)
          return errorJson(409, "already_enrolled", "You already have an open enrollment in this plan.");

        const premium = Math.round(plan.monthly_premium * (1 + 0.85 * (members - 1)) * 100) / 100;
        const effectiveDate = computeEffectiveDate(new Date());
        const inserted = await db
          .prepare(
            `INSERT INTO enrollments (user_id, plan_id, status, effective_date, monthly_premium, members)
             VALUES (?1, ?2, 'pending_payment', ?3, ?4, ?5) RETURNING id`,
          )
          .bind(auth.user.id, planId, effectiveDate, premium, members)
          .first<{ id: number }>();
        if (!inserted) return errorJson(500, "create_failed", "Could not create the enrollment.");

        const row = await db
          .prepare(
            `SELECT e.*, p.name AS plan_name, p.carrier, p.plan_type, p.tier
               FROM enrollments e JOIN plans p ON p.id = e.plan_id WHERE e.id = ?1`,
          )
          .bind(inserted.id)
          .first<EnrollmentRow>();
        return json({ ok: true, enrollment: row ? enrollmentToJson(row) : null }, 201);
      },
    },
  },
});
