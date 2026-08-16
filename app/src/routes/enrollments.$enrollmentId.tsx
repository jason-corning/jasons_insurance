import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { FormError } from "../components/forms";
import { PaymentForm } from "../components/payment-form";
import { Page, Spinner } from "../components/site";
import {
  api,
  money,
  RequestError,
  STATUS_LABELS,
  STATUS_STYLES,
  useCurrentUser,
  type Enrollment,
  type PaymentRecord,
} from "../lib/client-api";

export const Route = createFileRoute("/enrollments/$enrollmentId")({
  component: EnrollmentDetail,
});

function EnrollmentDetail() {
  const { enrollmentId } = Route.useParams();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["enrollment", enrollmentId],
    queryFn: () =>
      api<{ ok: boolean; enrollment: Enrollment; payments: PaymentRecord[] }>(
        `/api/enrollments/${enrollmentId}`,
      ),
    enabled: !!user,
  });

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["enrollment", enrollmentId] });
    await queryClient.invalidateQueries({ queryKey: ["enrollments"] });
  }

  async function doAction(action: "cancel" | "reinstate", body?: unknown) {
    setBusy(action);
    setActionError(null);
    try {
      await api(`/api/enrollments/${enrollmentId}/${action}`, {
        method: "POST",
        body: JSON.stringify(body ?? {}),
      });
      setConfirmCancel(false);
      await refresh();
    } catch (e) {
      setActionError(e instanceof RequestError ? e.message : "Action failed. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  if (userLoading || (user && isLoading))
    return (
      <Page>
        <Spinner />
      </Page>
    );

  if (!user)
    return (
      <Page>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">Sign in to view this enrollment</h1>
          <Link
            to="/login"
            search={{ redirect: `/enrollments/${enrollmentId}` }}
            className="mt-6 inline-block rounded-full bg-pine px-6 py-3 font-semibold text-ivory transition hover:bg-pinedeep"
          >
            Sign in
          </Link>
        </div>
      </Page>
    );

  if (!data)
    return (
      <Page>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">Enrollment not found</h1>
          <Link to="/dashboard" className="mt-4 inline-block font-semibold text-pine underline">
            Back to dashboard
          </Link>
        </div>
      </Page>
    );

  const { enrollment, payments } = data;

  return (
    <Page>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link to="/dashboard" className="text-sm font-medium text-pine hover:underline">
          ← Back to dashboard
        </Link>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-leaf">
              Enrollment #{enrollment.id} · {enrollment.carrier}
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-ink">{enrollment.planName}</h1>
          </div>
          <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${STATUS_STYLES[enrollment.status] ?? "bg-paper"}`}>
            {STATUS_LABELS[enrollment.status] ?? enrollment.status}
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Coverage starts", enrollment.effectiveDate],
            ["Monthly premium", `${money(enrollment.monthlyPremium)}`],
            ["Covered members", String(enrollment.members)],
            ["Submitted", enrollment.createdAt.slice(0, 10)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-sage/60 bg-paper px-5 py-4">
              <p className="text-xs text-ink/50">{label}</p>
              <p className="mt-1 font-display text-lg font-semibold text-ink">{value}</p>
            </div>
          ))}
        </div>

        {/* Status history */}
        <div className="mt-6 rounded-2xl border border-sage/60 bg-ivory p-6">
          <h2 className="font-display text-lg font-semibold text-ink">History</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink/75">
            <li>Submitted {enrollment.createdAt.slice(0, 16).replace("T", " at ")} (UTC)</li>
            {enrollment.activatedAt && <li>Activated by first premium payment {enrollment.activatedAt.slice(0, 16).replace("T", " at ")} (UTC)</li>}
            {enrollment.cancelledAt && (
              <li>
                Cancelled {enrollment.cancelledAt.slice(0, 16).replace("T", " at ")} (UTC)
                {enrollment.cancelReason ? ` · Reason: ${enrollment.cancelReason}` : ""}
              </li>
            )}
            {enrollment.reinstatedAt && <li>Reinstated {enrollment.reinstatedAt.slice(0, 16).replace("T", " at ")} (UTC)</li>}
          </ul>
        </div>

        <FormError message={actionError} />

        {/* Actions by status */}
        {enrollment.status === "pending_payment" && (
          <div className="mt-6 rounded-3xl border border-clay/30 bg-ivory p-6">
            <h2 className="font-display text-lg font-semibold text-clay">Finish activating this coverage</h2>
            <p className="mt-1 text-sm text-ink/60">
              Your enrollment is saved but coverage isn't in force until the first premium is paid.
            </p>
            <div className="mt-4 max-w-md">
              <PaymentForm enrollment={enrollment} onPaid={refresh} />
            </div>
          </div>
        )}

        {enrollment.status === "active" && (
          <div className="mt-6 rounded-3xl border border-sage/60 bg-paper p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Manage this enrollment</h2>
            {!confirmCancel ? (
              <button
                onClick={() => setConfirmCancel(true)}
                className="mt-3 rounded-full border-2 border-clay/40 px-5 py-2.5 text-sm font-semibold text-clay transition hover:border-clay hover:bg-claysoft"
              >
                Cancel enrollment
              </button>
            ) : (
              <div className="mt-3 max-w-md space-y-3">
                <p className="text-sm text-ink/70">
                  Are you sure? You can reinstate within 60 days; after that you'd need to enroll again.
                </p>
                <input
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Reason (optional)"
                  className="w-full rounded-xl border border-sage/70 bg-ivory px-4 py-2.5 text-sm text-ink outline-none focus:border-pine"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => doAction("cancel", { reason: cancelReason })}
                    disabled={busy === "cancel"}
                    className="rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-ivory transition hover:opacity-90 disabled:opacity-60"
                  >
                    {busy === "cancel" ? "Cancelling…" : "Yes, cancel coverage"}
                  </button>
                  <button
                    onClick={() => setConfirmCancel(false)}
                    className="rounded-full border border-sage px-5 py-2.5 text-sm font-semibold text-ink/70"
                  >
                    Keep my coverage
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {(enrollment.status === "cancelled" || enrollment.status === "terminated") && (
          <div className="mt-6 rounded-3xl border border-sage/60 bg-paper p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Changed your mind?</h2>
            <p className="mt-1 text-sm text-ink/60">
              Cancelled enrollments can be reinstated within 60 days of cancellation; same plan, same
              effective date.
            </p>
            <button
              onClick={() => doAction("reinstate")}
              disabled={busy === "reinstate"}
              className="mt-3 rounded-full bg-leaf px-5 py-2.5 text-sm font-semibold text-ivory transition hover:opacity-90 disabled:opacity-60"
            >
              {busy === "reinstate" ? "Reinstating…" : "Reinstate enrollment"}
            </button>
          </div>
        )}

        {/* Payments */}
        <div className="mt-6 rounded-2xl border border-sage/60 bg-ivory p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Payments</h2>
          {payments.length === 0 ? (
            <p className="mt-2 text-sm text-ink/60">No payments recorded yet.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b border-sage/50 text-xs uppercase tracking-wide text-ink/50">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Method</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-sage/30 last:border-0">
                      <td className="py-2.5 pr-4">{p.paidAt.slice(0, 10)}</td>
                      <td className="py-2.5 pr-4 capitalize">{p.kind}</td>
                      <td className="py-2.5 pr-4">
                        {p.cardBrand} ···· {p.cardLast4}
                      </td>
                      <td className="py-2.5 pr-4 capitalize text-leaf">{p.status}</td>
                      <td className="py-2.5 text-right font-semibold">{money(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
