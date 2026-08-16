import { createFileRoute } from "@tanstack/react-router";

import { errorJson, json, requireDb } from "../../../lib/auth.server";
import { planToJson, type PlanRow } from "./index";

export const Route = createFileRoute("/api/plans/$planId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = Number(params.planId);
        if (!Number.isInteger(id) || id <= 0) return errorJson(400, "invalid_id", "Plan id must be a positive integer.");
        const row = await requireDb().prepare("SELECT * FROM plans WHERE id = ?1").bind(id).first<PlanRow>();
        if (!row) return errorJson(404, "not_found", "No plan with that id.");
        return json({ ok: true, plan: planToJson(row) });
      },
    },
  },
});
