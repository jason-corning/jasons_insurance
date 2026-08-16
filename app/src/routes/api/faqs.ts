import { createFileRoute } from "@tanstack/react-router";

import { FAQ_CATEGORIES, FAQS } from "../../content/faqs";
import { json } from "../../lib/auth.server";

export const Route = createFileRoute("/api/faqs")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const category = url.searchParams.get("category");
        const q = url.searchParams.get("q")?.toLowerCase().trim();
        let faqs = FAQS;
        if (category) faqs = faqs.filter((f) => f.category === category);
        if (q)
          faqs = faqs.filter(
            (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q),
          );
        return json({ ok: true, categories: FAQ_CATEGORIES, faqs });
      },
    },
  },
});
