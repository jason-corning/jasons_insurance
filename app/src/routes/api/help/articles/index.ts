import { createFileRoute } from "@tanstack/react-router";

import { HELP_ARTICLES } from "../../../../content/help-articles";
import { json } from "../../../../lib/auth.server";

export const Route = createFileRoute("/api/help/articles/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const category = url.searchParams.get("category");
        const articles = HELP_ARTICLES.filter((a) => !category || a.category === category).map(
          ({ slug, category: cat, title, summary, minutes }) => ({ slug, category: cat, title, summary, minutes }),
        );
        return json({ ok: true, articles });
      },
    },
  },
});
