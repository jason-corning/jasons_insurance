import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Page, PageHeading, Spinner } from "../components/site";
import {
  api,
  money,
  STATUS_LABELS,
  STATUS_STYLES,
  useCurrentUser,
  type Enrollment,
} from "../lib/client-api";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data, isLoading } = useQuery({
    queryKey: ["enrollments"],
    queryFn: () => api<{ ok: boolean; enrollments: Enrollment[] }>("/api/enrollments"),
    enabled: !!user,
  });

  if (userLoading)
    return (
      <Page>
        <Spinner />
      </Page>
    );

  if (!user)
    return (
      <Page>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">Sign in to see your dashboard</h1>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/login" search={{ redirect: "/dashboard" }} className="rounded-full bg-pine px-6 py-3 font-semibold text-ivory transition hover:bg-pinedeep">
              Sign in
            </Link>
            <Link to="/register" className="rounded-full border-2 border-pine/20 px-6 py-3 font-semibold text-pine transition hover:border-pine hover:bg-sagesoft">
              Create account
            </Link>
          </div>
        </div>
      </Page>
    );

  const enrollments = data?.enrollments ?? [];
  const pendingCount = enrollments.filter((e) => e.status === "pending_payment").length;

  return (
    <Page>
      <PageHeading
        eyebrow="Dashboard"
        title={`Welcome back, ${user.firstName}`}
        lede="Your coverage, payments, and account details in one place."
      />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[1.6fr_1fr]">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-ink">Your enrollments</h2>
            <Link to="/shop" className="text-sm font-semibold text-pine hover:underline">
              + Shop for a plan
            </Link>
          </div>
          {pendingCount > 0 && (
            <p className="mt-3 rounded-xl border border-clay/30 bg-claysoft px-4 py-3 text-sm font-medium text-clay">
              {pendingCount === 1 ? "One enrollment is" : `${pendingCount} enrollments are`} waiting on a first
              premium payment: coverage isn't active until it's paid.
            </p>
          )}
          {isLoading ? (
            <Spinner />
          ) : enrollments.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-dashed border-sage bg-paper p-10 text-center">
              <p className="font-display text-lg font-semibold text-ink">No enrollments yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-ink/60">
                Browse the marketplace and enroll in a health or dental plan; it takes about five minutes.
              </p>
              <Link to="/shop" className="mt-5 inline-block rounded-full bg-pine px-6 py-3 font-semibold text-ivory transition hover:bg-pinedeep">
                Shop plans
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {enrollments.map((enrollment) => (
                <Link
                  key={enrollment.id}
                  to="/enrollments/$enrollmentId"
                  params={{ enrollmentId: String(enrollment.id) }}
                  className="block rounded-3xl border border-sage/60 bg-ivory p-6 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pine/10"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                        {enrollment.carrier} · {enrollment.planType} · #{enrollment.id}
                      </p>
                      <h3 className="mt-1 font-display text-lg font-semibold text-ink">{enrollment.planName}</h3>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[enrollment.status] ?? "bg-paper text-ink/60"}`}>
                      {STATUS_LABELS[enrollment.status] ?? enrollment.status}
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div>
                      <dt className="text-ink/50">Effective</dt>
                      <dd className="font-semibold text-ink">{enrollment.effectiveDate}</dd>
                    </div>
                    <div>
                      <dt className="text-ink/50">Premium</dt>
                      <dd className="font-semibold text-ink">{money(enrollment.monthlyPremium)}/mo</dd>
                    </div>
                    <div>
                      <dt className="text-ink/50">Members</dt>
                      <dd className="font-semibold text-ink">{enrollment.members}</dd>
                    </div>
                    <div>
                      <dt className="text-ink/50">Tier</dt>
                      <dd className="font-semibold text-ink">{enrollment.tier}</dd>
                    </div>
                  </dl>
                </Link>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-sage/60 bg-paper p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Account</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink/50">Username</dt>
                <dd className="font-medium text-ink">{user.username}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink/50">Email</dt>
                <dd className="truncate font-medium text-ink">{user.email}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink/50">Phone</dt>
                <dd className="font-medium text-ink">{user.phone ?? "Not set"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink/50">Mailing address</dt>
                <dd className="text-right font-medium text-ink">
                  {user.address.street ? `${user.address.street}, ${user.address.city}` : "Not set"}
                </dd>
              </div>
            </dl>
            <Link to="/account" className="mt-4 inline-block rounded-full border-2 border-pine/20 px-5 py-2 text-sm font-semibold text-pine transition hover:border-pine hover:bg-sagesoft">
              Manage account
            </Link>
          </div>

          <div className="rounded-3xl border border-sage/60 bg-ivory p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Quick help</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {[
                ["/help/check-enrollment-status", "What do the statuses mean?"],
                ["/help/cancel-enrollment", "How do I cancel?"],
                ["/help/reinstate-enrollment", "Reinstating cancelled coverage"],
                ["/faqs", "Marketplace FAQs"],
                ["/brokers", "Talk to a licensed broker"],
              ].map(([href, label]) => (
                <li key={href}>
                  {href.startsWith("/help/") ? (
                    <Link to="/help/$slug" params={{ slug: href.replace("/help/", "") }} className="text-pine hover:underline">
                      {label}
                    </Link>
                  ) : (
                    <Link to={href} className="text-pine hover:underline">
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </Page>
  );
}
