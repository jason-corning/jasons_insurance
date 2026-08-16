import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Page, PageHeading, Spinner } from "../components/site";
import { api, money, type Plan } from "../lib/client-api";

type ShopSearch = { type?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    type: search.type === "health" || search.type === "dental" ? search.type : undefined,
  }),
  component: Shop,
});

const HEALTH_TIERS = ["Bronze", "Silver", "Gold", "Platinum"];
const DENTAL_TIERS = ["Low", "High"];

function Shop() {
  const { type } = Route.useSearch();
  const navigate = Route.useNavigate();
  const planType = type ?? "health";
  const [tier, setTier] = useState<string>("");
  const [maxPremium, setMaxPremium] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["plans", planType, tier, maxPremium],
    queryFn: () => {
      const params = new URLSearchParams({ type: planType });
      if (tier) params.set("tier", tier);
      if (maxPremium) params.set("maxPremium", maxPremium);
      return api<{ ok: boolean; plans: Plan[] }>(`/api/plans?${params.toString()}`);
    },
  });

  const tiers = planType === "health" ? HEALTH_TIERS : DENTAL_TIERS;

  return (
    <Page>
      <PageHeading
        eyebrow="Shop"
        title={planType === "health" ? "Health plans" : "Dental plans"}
        lede="Compare every plan on the marketplace. Premiums shown are for one adult; family pricing appears at enrollment."
      />
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {/* Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-sage/50 bg-paper p-4">
          <div className="flex overflow-hidden rounded-full border border-sage/70 bg-ivory">
            {(["health", "dental"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTier("");
                  navigate({ search: { type: t } });
                }}
                className={
                  planType === t
                    ? "bg-pine px-5 py-2 text-sm font-semibold text-ivory"
                    : "px-5 py-2 text-sm font-medium text-ink/70 hover:bg-sagesoft"
                }
              >
                {t === "health" ? "Health" : "Dental"}
              </button>
            ))}
          </div>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="rounded-full border border-sage/70 bg-ivory px-4 py-2 text-sm font-medium text-ink"
            aria-label="Filter by tier"
          >
            <option value="">All tiers</option>
            {tiers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={maxPremium}
            onChange={(e) => setMaxPremium(e.target.value)}
            className="rounded-full border border-sage/70 bg-ivory px-4 py-2 text-sm font-medium text-ink"
            aria-label="Filter by monthly budget"
          >
            <option value="">Any monthly premium</option>
            <option value="50">Up to $50</option>
            <option value="350">Up to $350</option>
            <option value="450">Up to $450</option>
            <option value="600">Up to $600</option>
          </select>
          {(tier || maxPremium) && (
            <button
              onClick={() => {
                setTier("");
                setMaxPremium("");
              }}
              className="text-sm font-medium text-clay underline underline-offset-2"
            >
              Clear filters
            </button>
          )}
        </div>

        {isLoading ? (
          <Spinner />
        ) : !data || data.plans.length === 0 ? (
          <p className="py-16 text-center text-ink/60">No plans match those filters. Try widening them.</p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </div>
    </Page>
  );
}

const TIER_COLORS: Record<string, string> = {
  Bronze: "bg-claysoft text-clay",
  Silver: "bg-paper text-ink/70",
  Gold: "bg-[#f5ecd4] text-[#8a6d1d]",
  Platinum: "bg-sagesoft text-pine",
  Low: "bg-paper text-ink/70",
  High: "bg-sagesoft text-pine",
};

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div className="flex flex-col rounded-3xl border border-sage/60 bg-ivory p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-pine/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">{plan.carrier}</p>
          <h2 className="mt-1 font-display text-xl font-semibold leading-tight text-ink">{plan.name}</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TIER_COLORS[plan.tier] ?? "bg-paper text-ink/70"}`}>
          {plan.tier}
        </span>
      </div>
      <p className="mt-4 font-display text-3xl font-semibold text-pine">
        {money(plan.monthlyPremium)}
        <span className="font-body text-sm font-normal text-ink/50"> /month</span>
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-sage/40 pt-4 text-sm">
        <div>
          <dt className="text-ink/50">Deductible</dt>
          <dd className="font-semibold text-ink">{money(plan.deductible)}</dd>
        </div>
        <div>
          <dt className="text-ink/50">{plan.planType === "health" ? "Out-of-pocket max" : "Annual max"}</dt>
          <dd className="font-semibold text-ink">{plan.outOfPocketMax > 0 ? money(plan.outOfPocketMax) : "None"}</dd>
        </div>
        <div>
          <dt className="text-ink/50">Network</dt>
          <dd className="font-semibold text-ink">{plan.network}</dd>
        </div>
        <div>
          <dt className="text-ink/50">HSA eligible</dt>
          <dd className="font-semibold text-ink">{plan.hsaEligible ? "Yes" : "No"}</dd>
        </div>
      </dl>
      <Link
        to="/plans/$planId"
        params={{ planId: String(plan.id) }}
        className="mt-6 inline-block rounded-full border-2 border-pine/20 px-5 py-2.5 text-center font-semibold text-pine transition hover:border-pine hover:bg-sagesoft"
      >
        View details
      </Link>
    </div>
  );
}
