import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { FormError } from "../components/forms";
import { PaymentForm } from "../components/payment-form";
import { Page, Spinner } from "../components/site";
import {
  api,
  money,
  RequestError,
  useCurrentUser,
  type Enrollment,
  type Plan,
} from "../lib/client-api";

export const Route = createFileRoute("/enroll/$planId")({
  component: Enroll,
});

function Enroll() {
  const { planId } = Route.useParams();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const navigate = useNavigate();
  const [members, setMembers] = useState(1);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data: planData, isLoading: planLoading } = useQuery({
    queryKey: ["plan", planId],
    queryFn: () => api<{ ok: boolean; plan: Plan }>(`/api/plans/${planId}`),
  });

  if (userLoading || planLoading)
    return (
      <Page>
        <Spinner />
      </Page>
    );

  const plan = planData?.plan;
  if (!plan)
    return (
      <Page>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="font-display text-2xl text-ink">Plan not found</h1>
          <Link to="/shop" className="mt-4 inline-block font-semibold text-pine underline">
            Back to shopping
          </Link>
        </div>
      </Page>
    );

  if (!user) {
    const redirect = `/enroll/${planId}`;
    return (
      <Page>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">Sign in to enroll</h1>
          <p className="mt-3 text-ink/70">
            You're one step from enrolling in <strong className="text-ink">{plan.name}</strong>. Sign in or
            create a free account to continue.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/login"
              search={{ redirect }}
              className="rounded-full bg-pine px-6 py-3 font-semibold text-ivory transition hover:bg-pinedeep"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              search={{ redirect }}
              className="rounded-full border-2 border-pine/20 px-6 py-3 font-semibold text-pine transition hover:border-pine hover:bg-sagesoft"
            >
              Create account
            </Link>
          </div>
        </div>
      </Page>
    );
  }

  const estPremium = Math.round(plan.monthlyPremium * (1 + 0.85 * (members - 1)) * 100) / 100;

  async function submitEnrollment() {
    setBusy(true);
    setError(null);
    try {
      const response = await api<{ ok: boolean; enrollment: Enrollment }>("/api/enrollments", {
        method: "POST",
        body: JSON.stringify({ planId: Number(planId), members }),
      });
      setEnrollment(response.enrollment);
    } catch (e) {
      if (e instanceof RequestError && e.code === "already_enrolled") {
        setError("You already have an open enrollment in this plan. Manage it from your dashboard.");
      } else {
        setError(e instanceof RequestError ? e.message : "Could not start the enrollment.");
      }
    } finally {
      setBusy(false);
    }
  }

  const step = paid ? 3 : enrollment ? 2 : 1;

  return (
    <Page>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        {/* Step rail */}
        <ol className="flex items-center gap-2 text-xs font-semibold">
          {["Review", "Payment", "Confirmed"].map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <span
                className={`grid size-7 place-items-center rounded-full ${
                  step > i ? "bg-leaf text-ivory" : step === i + 1 ? "bg-pine text-ivory" : "bg-paper text-ink/40"
                }`}
              >
                {step > i + 1 ? "✓" : i + 1}
              </span>
              <span className={step === i + 1 ? "text-pine" : "text-ink/40"}>{label}</span>
              {i < 2 && <span aria-hidden className="mx-1 h-px w-8 bg-sage" />}
            </li>
          ))}
        </ol>

        {step === 1 && (
          <div className="mt-8 rounded-3xl border border-sage/60 bg-ivory p-8">
            <h1 className="font-display text-2xl font-semibold text-ink">Review your enrollment</h1>
            <div className="mt-5 divide-y divide-sage/40 rounded-2xl border border-sage/50">
              <Row label="Plan" value={`${plan.name} (${plan.tier})`} />
              <Row label="Carrier" value={plan.carrier} />
              <Row label="Coverage" value={plan.planType === "health" ? "Health" : "Dental"} />
              <Row label="Base premium" value={`${money(plan.monthlyPremium)} /month`} />
            </div>
            <div className="mt-5">
              <label className="text-sm font-semibold text-ink" htmlFor="members">
                Covered household members
              </label>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center rounded-full border border-sage/70">
                  <button
                    onClick={() => setMembers((m) => Math.max(1, m - 1))}
                    className="px-4 py-2 text-lg font-bold text-pine"
                    aria-label="Fewer members"
                  >
                    −
                  </button>
                  <span id="members" className="w-8 text-center font-display text-lg font-semibold text-ink">
                    {members}
                  </span>
                  <button
                    onClick={() => setMembers((m) => Math.min(8, m + 1))}
                    className="px-4 py-2 text-lg font-bold text-pine"
                    aria-label="More members"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-ink/60">
                  Estimated total: <strong className="text-pine">{money(estPremium)} /month</strong>
                </p>
              </div>
            </div>
            <p className="mt-5 rounded-xl bg-paper px-4 py-3 text-sm text-ink/70">
              Enrollments submitted on or before the 15th start the 1st of next month; after the 15th, the
              1st of the month after next. Coverage activates once your first premium is paid.
            </p>
            <div className="mt-5 space-y-3">
              <FormError message={error} />
              {error?.includes("dashboard") && (
                <Link to="/dashboard" className="inline-block font-semibold text-pine underline">
                  Go to dashboard
                </Link>
              )}
              <button
                onClick={submitEnrollment}
                disabled={busy}
                className="w-full rounded-2xl bg-pine px-6 py-4 font-display font-semibold text-ivory transition hover:bg-pinedeep disabled:cursor-wait disabled:opacity-60"
              >
                {busy ? "Submitting…" : "Submit enrollment"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && enrollment && (
          <div className="mt-8 rounded-3xl border border-sage/60 bg-ivory p-8">
            <h1 className="font-display text-2xl font-semibold text-ink">First premium payment</h1>
            <p className="mt-2 text-sm text-ink/60">
              Enrollment #{enrollment.id} created. Coverage begins {enrollment.effectiveDate} once this
              binder payment is made.
            </p>
            <div className="mt-5">
              <PaymentForm
                enrollment={enrollment}
                onPaid={(updated) => {
                  setEnrollment(updated);
                  setPaid(true);
                }}
              />
            </div>
            <p className="mt-4 text-center text-xs text-ink/50">
              Prefer to pay later? This enrollment is saved as Pending payment on your{" "}
              <Link to="/dashboard" className="text-pine underline">
                dashboard
              </Link>
              .
            </p>
          </div>
        )}

        {step === 3 && enrollment && (
          <div className="mt-8 rounded-3xl border border-leaf/40 bg-sagesoft p-8 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-leaf text-2xl text-ivory">✓</span>
            <h1 className="mt-4 font-display text-2xl font-semibold text-pine">You're covered!</h1>
            <p className="mx-auto mt-3 max-w-md text-ink/70">
              <strong className="text-ink">{enrollment.planName}</strong> is now active with coverage
              starting <strong className="text-ink">{enrollment.effectiveDate}</strong>. A confirmation has
              been recorded on your account.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="rounded-full bg-pine px-6 py-3 font-semibold text-ivory transition hover:bg-pinedeep"
              >
                Go to dashboard
              </button>
              <Link
                to="/enrollments/$enrollmentId"
                params={{ enrollmentId: String(enrollment.id) }}
                className="rounded-full border-2 border-pine/30 px-6 py-3 font-semibold text-pine transition hover:border-pine"
              >
                View enrollment
              </Link>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-sm text-ink/60">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}
