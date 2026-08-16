import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { Markdown } from "../components/markdown";
import { Page } from "../components/site";
import { findArticle, HELP_ARTICLES } from "../content/help-articles";

export const Route = createFileRoute("/help/$slug")({
  loader: ({ params }) => {
    const article = findArticle(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: `${loaderData.article.title} · Jason's Insurance Help` }] : [],
  }),
  component: HelpArticlePage,
});

function HelpArticlePage() {
  const { article } = Route.useLoaderData();
  const related = HELP_ARTICLES.filter((a) => a.category === article.category && a.slug !== article.slug).slice(0, 3);

  return (
    <Page>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav className="text-sm text-ink/50" aria-label="Breadcrumb">
          <Link to="/help" className="text-pine hover:underline">
            Help center
          </Link>{" "}
          / <span>{article.category}</span>
        </nav>
        <h1 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">{article.title}</h1>
        <p className="mt-2 text-sm text-ink/50">
          {article.category} · {article.minutes} min read
        </p>
        <div className="mt-8 rounded-3xl border border-sage/50 bg-ivory p-7 sm:p-9">
          <Markdown body={article.body} />
        </div>

        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="font-display text-lg font-semibold text-pine">Related articles</h2>
            <ul className="mt-3 space-y-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link to="/help/$slug" params={{ slug: r.slug }} className="text-ink/75 underline decoration-sage underline-offset-2 hover:text-pine">
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Page>
  );
}
