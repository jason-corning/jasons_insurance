import { createFileRoute } from "@tanstack/react-router";

import { json, requireDb } from "../../../lib/auth.server";

export type PlanRow = {
  id: number;
  plan_type: string;
  tier: string;
  name: string;
  carrier: string;
  monthly_premium: number;
  deductible: number;
  oop_max: number;
  network: string;
  hsa_eligible: number;
  features: string;
  description: string;
};

export function planToJson(row: PlanRow) {
  let features: string[] = [];
  try {
    features = JSON.parse(row.features) as string[];
  } catch {
    features = [];
  }
  return {
    id: row.id,
    planType: row.plan_type,
    tier: row.tier,
    name: row.name,
    carrier: row.carrier,
    monthlyPremium: row.monthly_premium,
    deductible: row.deductible,
    outOfPocketMax: row.oop_max,
    network: row.network,
    hsaEligible: !!row.hsa_eligible,
    features,
    description: row.description,
  };
}

export const Route = createFileRoute("/api/plans/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const type = url.searchParams.get("type"); // health | dental
        const tier = url.searchParams.get("tier");
        const carrier = url.searchParams.get("carrier");
        const maxPremium = Number(url.searchParams.get("maxPremium") ?? "");

        const where: string[] = [];
        const binds: unknown[] = [];
        if (type === "health" || type === "dental") {
          binds.push(type);
          where.push(`plan_type = ?${binds.length}`);
        }
        if (tier) {
          binds.push(tier);
          where.push(`tier = ?${binds.length}`);
        }
        if (carrier) {
          binds.push(carrier);
          where.push(`carrier = ?${binds.length}`);
        }
        if (Number.isFinite(maxPremium) && maxPremium > 0) {
          binds.push(maxPremium);
          where.push(`monthly_premium <= ?${binds.length}`);
        }

        const sql = `SELECT * FROM plans ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY plan_type, monthly_premium`;
        const rows = await requireDb().prepare(sql).bind(...binds).all<PlanRow>();
        return json({ ok: true, plans: (rows.results ?? []).map(planToJson) });
      },
    },
  },
});
