import { createFileRoute } from "@tanstack/react-router";

import { json, requireDb } from "../../../lib/auth.server";

type BrokerRow = {
  id: number;
  name: string;
  agency: string;
  license_no: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  languages: string;
  specialties: string;
};

export const Route = createFileRoute("/api/brokers/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const q = url.searchParams.get("q")?.trim() ?? "";
        const zip = url.searchParams.get("zip")?.trim() ?? "";
        const specialty = url.searchParams.get("specialty")?.trim() ?? "";

        const where: string[] = [];
        const binds: unknown[] = [];
        if (q) {
          binds.push(`%${q.toLowerCase()}%`);
          where.push(
            `(lower(name) LIKE ?${binds.length} OR lower(agency) LIKE ?${binds.length} OR lower(city) LIKE ?${binds.length} OR lower(languages) LIKE ?${binds.length})`,
          );
        }
        if (zip) {
          binds.push(`${zip.slice(0, 3)}%`);
          where.push(`zip LIKE ?${binds.length}`);
        }
        if (specialty === "health" || specialty === "dental") {
          binds.push(`%${specialty}%`);
          where.push(`specialties LIKE ?${binds.length}`);
        }

        const sql = `SELECT * FROM brokers ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY name`;
        const rows = await requireDb().prepare(sql).bind(...binds).all<BrokerRow>();
        return json({
          ok: true,
          brokers: (rows.results ?? []).map((b) => ({
            id: b.id,
            name: b.name,
            agency: b.agency,
            licenseNo: b.license_no,
            city: b.city,
            state: b.state,
            zip: b.zip,
            phone: b.phone,
            email: b.email,
            languages: b.languages.split(",").map((s) => s.trim()),
            specialties: b.specialties.split(",").map((s) => s.trim()),
          })),
        });
      },
    },
  },
});
