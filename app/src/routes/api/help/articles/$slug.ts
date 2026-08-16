import { createFileRoute } from "@tanstack/react-router";

import { findArticle } from "../../../../content/help-articles";
import { errorJson, json } from "../../../../lib/auth.server";

export const Route = createFileRoute("/api/help/articles/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const article = findArticle(params.slug);
        if (!article) return errorJson(404, "not_found", "No help article with that slug.");
        return json({ ok: true, article });
      },
    },
  },
});
