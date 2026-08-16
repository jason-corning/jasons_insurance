import { createFileRoute, Link } from "@tanstack/react-router";

import { Page } from "../components/site";

export const Route = createFileRoute("/")({
  component: Home,
});

const STEPS = [
  {
    n: "01",
    title: "Shop and compare",
    body: "Browse every health and dental plan side by side. Filter by tier, carrier, and monthly budget until it fits.",
  },
  {
    n: "02",
    title: "Enroll online",
    body: "Create your account and submit an enrollment in minutes. Enroll by the 15th and coverage starts the 1st of next month.",
  },
  {
    n: "03",
    title: "Pay your first premium",
    body: "Your binder payment activates the coverage. Card checkout is built in, and every payment is recorded on your dashboard.",
  },
  {
    n: "04",
    title: "Manage it year-round",
    body: "Check status any time, update your details, cancel if life changes, and reinstate within 60 days if it changes back.",
  },
];

function Home() {
  return (
    <Page>
      {/* Hero: split editorial */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-leaf">
            Health & dental marketplace
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl lg:text-[3.4rem]">
            Coverage, chosen <span className="text-pine">carefully.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/70">
            Jason's Insurance helps you shop health and dental plans, enroll and pay online, and keep
            your coverage organized in one tidy place, like a policy folder that keeps itself.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 rounded-full bg-pine px-7 py-3.5 font-semibold text-ivory transition hover:bg-pinedeep"
            >
              Shop plans
              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link
              to="/help"
              className="inline-flex items-center gap-2 rounded-full border-2 border-pine/20 px-7 py-3.5 font-semibold text-pine transition hover:border-pine hover:bg-sagesoft"
            >
              Visit the help center
            </Link>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-sage/50 pt-6">
            {[
              ["15", "plans to compare"],
              ["2", "coverage lines"],
              ["60d", "reinstatement window"],
            ].map(([stat, label]) => (
              <div key={label}>
                <dt className="font-display text-2xl font-semibold text-pine">{stat}</dt>
                <dd className="mt-1 text-xs text-ink/60">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative">
          <div className="overflow-hidden rounded-3xl border border-sage/50 shadow-xl shadow-pine/10">
            <img
              src="/assets/hero-family.png"
              alt="A family reviewing insurance options together at their kitchen table"
              className="aspect-[16/11] w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 left-6 rounded-2xl border border-sage/50 bg-ivory px-5 py-3 shadow-lg shadow-pine/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-leaf">Enrollment status</p>
            <p className="font-display text-lg font-semibold text-pine">Active ✓</p>
          </div>
        </div>
      </section>

      {/* Plan types: folder-tab cards */}
      <section className="border-y border-sage/40 bg-paper">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-2">
          {[
            {
              type: "health",
              title: "Health plans",
              blurb:
                "Bronze through Platinum coverage from three carriers, from budget-friendly HSA plans to $0-deductible platinum.",
              tag: "10 plans · 4 metal tiers",
            },
            {
              type: "dental",
              title: "Dental plans",
              blurb:
                "Preventive-first and comprehensive dental, with 100% covered cleanings on every plan and family orthodontia options.",
              tag: "5 plans · 2 coverage levels",
            },
          ].map((card) => (
            <Link
              key={card.type}
              to="/shop"
              search={{ type: card.type }}
              className="group relative overflow-hidden rounded-3xl border border-sage/60 bg-ivory p-8 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-pine/10"
            >
              <span className="absolute right-0 top-0 rounded-bl-2xl bg-sagesoft px-4 py-1.5 text-xs font-semibold text-leaf">
                {card.tag}
              </span>
              <h2 className="mt-4 font-display text-2xl font-semibold text-ink">{card.title}</h2>
              <p className="mt-3 leading-relaxed text-ink/70">{card.blurb}</p>
              <span className="mt-6 inline-block font-semibold text-pine">
                Browse {card.type} plans
                <span className="block h-0.5 max-w-0 bg-leaf transition-all duration-300 group-hover:max-w-full" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works: ledger rows */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-leaf">How it works</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-ink">
          From shopping to covered, in four entries
        </h2>
        <div className="mt-8 divide-y divide-sage/50 border-y border-sage/50">
          {STEPS.map((step) => (
            <div key={step.n} className="grid gap-2 py-6 sm:grid-cols-[80px_240px_1fr] sm:gap-6">
              <span className="font-display text-2xl font-semibold text-sage">{step.n}</span>
              <h3 className="font-display text-lg font-semibold text-pine">{step.title}</h3>
              <p className="leading-relaxed text-ink/70">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Help + broker strip */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid items-stretch gap-6 rounded-3xl bg-pine p-8 text-ivory md:grid-cols-[1.2fr_1fr] md:p-12">
          <div className="flex flex-col justify-center">
            <h2 className="font-display text-3xl font-semibold">Never guess. Just ask.</h2>
            <p className="mt-4 max-w-lg leading-relaxed text-ivory/80">
              The help center documents every step, from creating an account to reinstating coverage.
              The FAQs answer the marketplace policy questions people actually ask. And when you'd
              rather talk to a person, licensed brokers are a search away, free of charge.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/help" className="rounded-full bg-ivory px-6 py-3 font-semibold text-pine transition hover:bg-sage">
                Help center
              </Link>
              <Link to="/faqs" className="rounded-full border border-ivory/40 px-6 py-3 font-semibold text-ivory transition hover:bg-pinedeep">
                Read the FAQs
              </Link>
              <Link to="/brokers" className="rounded-full border border-ivory/40 px-6 py-3 font-semibold text-ivory transition hover:bg-pinedeep">
                Find a broker
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl">
            <img
              src="/assets/advisor.png"
              alt="A licensed insurance advisor meeting with clients"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>
    </Page>
  );
}
