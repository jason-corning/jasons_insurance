import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Page, PageHeading } from "../components/site";
import { articlesByCategory, HELP_ARTICLES } from "../content/help-articles";

export const Route = createFileRoute("/help/")({
  component: HelpCenter,
});

const CATEGORY_ICONS: Record<string, string> = {
  "Getting started": "🗂️",
  "Shopping & enrollment": "🛒",
  "Managing your coverage": "📋",
  "Account settings": "⚙️",
  "Getting help": "💬",
};

function HelpCenter() {
  const [q, setQ] = useState("");
  const grouped = useMemo(() => articlesByCategory(), []);

  const results = useMemo(() => {
    const query = q.toLowerCase().trim();
    if (!query) return null;
    return HELP_ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(query) ||
        a.summary.toLowerCase().includes(query) ||
        a.body.toLowerCase().includes(query),
    );
  }, [q]);

  return (
    <Page>
      <PageHeading
        eyebrow="Help center"
        title="How can we help?"
        lede="Step-by-step guides for everything you can do on Jason's Insurance: from creating an account to reinstating coverage."
      />
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search help articles (e.g. cancel, address, payment)"
          className="mt-2 w-full max-w-lg rounded-full border border-sage/70 bg-ivory px-5 py-3 text-ink outline-none focus:border-pine focus:ring-2 focus:ring-sage"
          aria-label="Search help articles"
        />

        {results ? (
          <div className="mt-8">
            <p className="text-sm text-ink/60">
              {results.length} article{results.length === 1 ? "" : "s"} match "{q}"
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((article) => (
                <ArticleCard key={article.slug} slug={article.slug} title={article.title} summary={article.summary} minutes={article.minutes} />
              ))}
            </div>
          </div>
        ) : (
          Object.entries(grouped).map(([category, articles]) =>
            articles.length === 0 ? null : (
              <section key={category} className="mt-10">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-pine">
                  <span aria-hidden>{CATEGORY_ICONS[category] ?? "📄"}</span>
                  {category}
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {articles.map((article) => (
                    <ArticleCard key={article.slug} slug={article.slug} title={article.title} summary={article.summary} minutes={article.minutes} />
                  ))}
                </div>
              </section>
            ),
          )
        )}

        <div className="mt-14 rounded-3xl bg-pine p-8 text-ivory md:flex md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Didn't find it?</h2>
            <p className="mt-1 max-w-xl text-sm text-ivory/80">
              The FAQs cover marketplace policy questions (deadlines, grace periods, life changes), and
              licensed brokers can help with plan-specific decisions.
            </p>
          </div>
          <div className="mt-4 flex gap-3 md:mt-0">
            <Link to="/faqs" className="rounded-full bg-ivory px-5 py-2.5 text-sm font-semibold text-pine transition hover:bg-sage">
              Read the FAQs
            </Link>
            <Link to="/brokers" className="rounded-full border border-ivory/40 px-5 py-2.5 text-sm font-semibold text-ivory transition hover:bg-pinedeep">
              Find a broker
            </Link>
          </div>
        </div>
      </div>
    </Page>
  );
}

function ArticleCard({ slug, title, summary, minutes }: { slug: string; title: string; summary: string; minutes: number }) {
  return (
    <Link
      to="/help/$slug"
      params={{ slug }}
      className="group flex flex-col rounded-2xl border border-sage/60 bg-ivory p-5 transition hover:-translate-y-0.5 hover:border-pine/40 hover:shadow-lg hover:shadow-pine/10"
    >
      <h3 className="font-display text-base font-semibold text-ink group-hover:text-pine">{title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink/60">{summary}</p>
      <span className="mt-3 text-xs font-semibold text-leaf">{minutes} min read →</span>
    </Link>
  );
}
