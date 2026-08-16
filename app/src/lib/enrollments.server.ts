// Shared enrollment helpers: effective-date rule and row serialization.
import { requireDb } from "./auth.server";

export type EnrollmentRow = {
  id: number;
  user_id: number;
  plan_id: number;
  status: string;
  effective_date: string;
  monthly_premium: number;
  members: number;
  created_at: string;
  activated_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  reinstated_at: string | null;
  plan_name?: string;
  carrier?: string;
  plan_type?: string;
  tier?: string;
};

// 15th-of-the-month rule (mirrors the marketplace policy): enroll on or
// before the 15th → coverage starts the 1st of the next month; after the
// 15th → the 1st of the month after next.
export function computeEffectiveDate(now: Date): string {
  const monthsAhead = now.getUTCDate() <= 15 ? 1 : 2;
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthsAhead, 1));
  return d.toISOString().slice(0, 10);
}

export function enrollmentToJson(row: EnrollmentRow) {
  return {
    id: row.id,
    planId: row.plan_id,
    planName: row.plan_name ?? null,
    carrier: row.carrier ?? null,
    planType: row.plan_type ?? null,
    tier: row.tier ?? null,
    status: row.status,
    effectiveDate: row.effective_date,
    monthlyPremium: row.monthly_premium,
    members: row.members,
    createdAt: row.created_at,
    activatedAt: row.activated_at,
    cancelledAt: row.cancelled_at,
    cancelReason: row.cancel_reason,
    reinstatedAt: row.reinstated_at,
  };
}

export async function getEnrollment(id: number, userId: number): Promise<EnrollmentRow | null> {
  const row = await requireDb()
    .prepare(
      `SELECT e.*, p.name AS plan_name, p.carrier, p.plan_type, p.tier
         FROM enrollments e JOIN plans p ON p.id = e.plan_id
        WHERE e.id = ?1 AND e.user_id = ?2`,
    )
    .bind(id, userId)
    .first<EnrollmentRow>();
  return row ?? null;
}

// Reinstatement window (policy-inspired): a cancelled/terminated enrollment
// may be reinstated within 60 days of the cancellation date.
export const REINSTATEMENT_WINDOW_DAYS = 60;

export function withinReinstatementWindow(cancelledAt: string | null): boolean {
  if (!cancelledAt) return false;
  const cancelled = new Date(cancelledAt).getTime();
  return Date.now() - cancelled <= REINSTATEMENT_WINDOW_DAYS * 86_400_000;
}
