// Simulated card checkout used at enrollment and on the enrollment detail
// page. No real charge occurs; the API validates shape (Luhn/expiry/CVC).
import { useState } from "react";

import { api, money, RequestError, type Enrollment } from "../lib/client-api";
import { Field, FormError, SubmitButton, TextInput } from "./forms";

export function PaymentForm({
  enrollment,
  onPaid,
}: {
  enrollment: Enrollment;
  onPaid: (updated: Enrollment) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const [expMonth, expYear] = String(form.get("expiry") ?? "")
      .split("/")
      .map((s) => Number(s.trim()));
    try {
      const response = await api<{ ok: boolean; enrollment: Enrollment }>(
        `/api/enrollments/${enrollment.id}/pay`,
        {
          method: "POST",
          body: JSON.stringify({
            cardNumber: String(form.get("cardNumber") ?? ""),
            expMonth,
            expYear,
            cvc: String(form.get("cvc") ?? ""),
            nameOnCard: String(form.get("nameOnCard") ?? ""),
          }),
        },
      );
      onPaid(response.enrollment);
    } catch (e) {
      setError(e instanceof RequestError ? e.message : "Payment failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-xl bg-sagesoft px-4 py-3 text-sm text-pine">
        <p className="font-semibold">Simulated checkout</p>
        <p className="mt-0.5">
          This demo validates but never charges a card. Try 4242 4242 4242 4242 with any future expiry.
        </p>
      </div>
      <FormError message={error} />
      <Field label="Name on card">
        <TextInput name="nameOnCard" autoComplete="cc-name" required />
      </Field>
      <Field label="Card number">
        <TextInput name="cardNumber" inputMode="numeric" autoComplete="cc-number" required placeholder="4242 4242 4242 4242" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Expiry (MM/YY)">
          <TextInput name="expiry" autoComplete="cc-exp" required placeholder="12/28" pattern="\d{1,2}\s*/\s*\d{2,4}" />
        </Field>
        <Field label="CVC">
          <TextInput name="cvc" inputMode="numeric" autoComplete="cc-csc" required placeholder="123" maxLength={4} />
        </Field>
      </div>
      <SubmitButton busy={busy}>Pay {money(enrollment.monthlyPremium)} & activate</SubmitButton>
    </form>
  );
}
