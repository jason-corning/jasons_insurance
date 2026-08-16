import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Page, Spinner } from "../components/site";
import { api, money, useCurrentUser, type Plan } from "../lib/client-api";

export const Route = createFileRoute("/plans/$planId")({
  component: PlanDetail,
});

function PlanDetail() {
  const { planId } = Route.useParams();
  const { data: user } = useCurrentUser();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["plan", planId],
    queryFn: () => api<{ ok: boolean; plan: Plan }>(`/api/plans/${planId}`),
  });

  if (isLoading)
    return (
      <Page>
        <Spinner />
      </Page>
    );
  if (isError || !data)
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

  const plan = data.plan;
  return (
    <Page>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Link to="/shop" search={{ type: plan.planType }} className="text-sm font-medium text-pine hover:underline">
          ← Back to {plan.planType} plans
        </Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-leaf">
              {plan.carrier} · {plan.tier} {plan.planType} plan
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-ink">{plan.name}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/70">{plan.description}</p>

            <h2 className="mt-10 font-display text-xl font-semibold text-pine">What's covered</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 rounded-2xl border border-sage/50 bg-paper px-4 py-3">
                  <span aria-hidden className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-leaf text-xs font-bold text-ivory">
                    ✓
                  </span>
                  <span className="text-sm text-ink/80">{feature}</span>
                </li>
              ))}
            </ul>

            <h2 className="mt-10 font-display text-xl font-semibold text-pine">Cost details</h2>
            <div className="mt-4 divide-y divide-sage/40 rounded-2xl border border-sage/50">
              {[
                ["Monthly premium (one adult)", money(plan.monthlyPremium)],
                ["Annual deductible", money(plan.deductible)],
                [
                  plan.planType === "health" ? "Out-of-pocket maximum" : "Annual benefit maximum",
                  plan.outOfPocketMax > 0 ? money(plan.outOfPocketMax) : "None",
                ],
                ["Network type", plan.network],
                ["HSA eligible", plan.hsaEligible ? "Yes" : "No"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-sm text-ink/60">{label}</span>
                  <span className="font-semibold text-ink">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="h-fit rounded-3xl border border-sage/60 bg-paper p-6 lg:sticky lg:top-24">
            <p className="font-display text-4xl font-semibold text-pine">
              {money(plan.monthlyPremium)}
              <span className="font-body text-base font-normal text-ink/50"> /month</span>
            </p>
            <p className="mt-2 text-sm text-ink/60">
              Enroll on or before the 15th and coverage starts the 1st of next month.
            </p>
            <Link
              to="/enroll/$planId"
              params={{ planId: String(plan.id) }}
              className="mt-5 block w-full rounded-2xl bg-pine px-6 py-4 text-center font-semibold text-ivory transition hover:bg-pinedeep"
            >
              Enroll in this plan
            </Link>
            {!user && (
              <p className="mt-3 text-center text-xs text-ink/50">
                You'll be asked to sign in or create an account first.
              </p>
            )}
            <div className="mt-5 border-t border-sage/50 pt-4 text-sm text-ink/60">
              <p>
                Questions first? Read{" "}
                <Link to="/help/$slug" params={{ slug: "enroll-and-pay" }} className="font-medium text-pine underline">
                  how enrollment works
                </Link>{" "}
                or{" "}
                <Link to="/brokers" className="font-medium text-pine underline">
                  talk to a licensed broker
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </div>
    </Page>
  );
}
