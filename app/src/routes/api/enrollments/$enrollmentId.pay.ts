import { createFileRoute } from "@tanstack/react-router";

import { errorJson, json, requireDb, requireUser } from "../../../lib/auth.server";
import { enrollmentToJson, getEnrollment } from "../../../lib/enrollments.server";

function detectBrand(cardNumber: string): string {
  if (/^4/.test(cardNumber)) return "Visa";
  if (/^5[1-5]/.test(cardNumber) || /^2[2-7]/.test(cardNumber)) return "Mastercard";
  if (/^3[47]/.test(cardNumber)) return "American Express";
  if (/^6(?:011|5)/.test(cardNumber)) return "Discover";
  return "Card";
}

function luhnValid(cardNumber: string): boolean {
  let sum = 0;
  let dbl = false;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let d = cardNumber.charCodeAt(i) - 48;
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

// SIMULATED payment processor: validates the card shape (Luhn, expiry, CVC),
// records the payment, and activates the enrollment. No real charge occurs
// and the card number is never stored — only brand + last 4.
export const Route = createFileRoute("/api/enrollments/$enrollmentId/pay")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const auth = await requireUser(request);
        if ("response" in auth) return auth.response;
        const id = Number(params.enrollmentId);
        if (!Number.isInteger(id) || id <= 0) return errorJson(400, "invalid_id", "Enrollment id must be a positive integer.");

        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return errorJson(400, "invalid_json", "Request body must be JSON.");
        }
        const cardNumber = String(body.cardNumber ?? "").replace(/[\s-]/g, "");
        const expMonth = Number(body.expMonth);
        const expYear = Number(body.expYear);
        const cvc = String(body.cvc ?? "");
        const nameOnCard = String(body.nameOnCard ?? "").trim();

        if (!/^\d{13,19}$/.test(cardNumber) || !luhnValid(cardNumber))
          return errorJson(400, "invalid_card", "That card number doesn't look valid.");
        if (!Number.isInteger(expMonth) || expMonth < 1 || expMonth > 12)
          return errorJson(400, "invalid_expiry", "Expiration month must be 1-12.");
        const fullYear = expYear < 100 ? 2000 + expYear : expYear;
        const now = new Date();
        if (!Number.isInteger(fullYear) || fullYear < now.getFullYear() || fullYear > now.getFullYear() + 20)
          return errorJson(400, "invalid_expiry", "Expiration year is invalid.");
        if (fullYear === now.getFullYear() && expMonth < now.getMonth() + 1)
          return errorJson(400, "card_expired", "That card is expired.");
        if (!/^\d{3,4}$/.test(cvc)) return errorJson(400, "invalid_cvc", "CVC must be 3-4 digits.");
        if (!nameOnCard) return errorJson(400, "missing_name", "Name on card is required.");

        const row = await getEnrollment(id, auth.user.id);
        if (!row) return errorJson(404, "not_found", "No enrollment with that id on your account.");
        if (row.status === "active") return errorJson(409, "already_active", "This enrollment is already active.");
        if (row.status !== "pending_payment")
          return errorJson(409, "not_payable", `A ${row.status} enrollment can't be paid. Reinstate it first if it was cancelled.`);

        const db = requireDb();
        await db
          .prepare(
            "INSERT INTO payments (enrollment_id, user_id, amount, kind, card_brand, card_last4) VALUES (?1, ?2, ?3, 'binder', ?4, ?5)",
          )
          .bind(id, auth.user.id, row.monthly_premium, detectBrand(cardNumber), cardNumber.slice(-4))
          .run();
        await db
          .prepare("UPDATE enrollments SET status = 'active', activated_at = datetime('now') WHERE id = ?1")
          .bind(id)
          .run();

        const updated = await getEnrollment(id, auth.user.id);
        return json({ ok: true, enrollment: updated ? enrollmentToJson(updated) : null });
      },
    },
  },
});
