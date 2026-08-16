import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Page, PageHeading } from "../components/site";
import { FAQ_CATEGORIES, FAQS } from "../content/faqs";

export const Route = createFileRoute("/faqs")({
  component: Faqs,
});

function Faqs() {
  const [category, setCategory] = useState<string>("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.toLowerCase().trim();
    return FAQS.filter(
      (f) =>
        (!category || f.category === category) &&
        (!query || f.question.toLowerCase().includes(query) || f.answer.toLowerCase().includes(query)),
    );
  }, [category, q]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof FAQS>();
    for (const faq of filtered) {
      const list = map.get(faq.category) ?? [];
      list.push(faq);
      map.set(faq.category, list);
    }
    return map;
  }, [filtered]);

  return (
    <Page>
      <PageHeading
        eyebrow="Support"
        title="Frequently asked questions"
        lede="Answers drawn from the marketplace's PY2026 consumer eligibility, enrollment, and support policies: real rules, real deadlines."
      />
      <div className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the FAQs"
            className="w-full max-w-sm rounded-full border border-sage/70 bg-ivory px-5 py-2.5 text-sm text-ink outline-none focus:border-pine focus:ring-2 focus:ring-sage"
            aria-label="Search FAQs"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-full border border-sage/70 bg-ivory px-4 py-2.5 text-sm font-medium text-ink"
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {FAQ_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span className="text-sm text-ink/50">
            {filtered.length} of {FAQS.length} questions
          </span>
        </div>

        {filtered.length === 0 ? (
          <p className="py-16 text-center text-ink/60">No questions match that search.</p>
        ) : (
          Array.from(grouped.entries()).map(([cat, faqs]) => (
            <section key={cat} className="mt-10">
              <h2 className="font-display text-xl font-semibold text-pine">{cat}</h2>
              <div className="mt-3 divide-y divide-sage/40 rounded-2xl border border-sage/50 bg-ivory">
                {faqs.map((faq) => {
                  const isOpen = open === faq.id;
                  return (
                    <div key={faq.id}>
                      <button
                        onClick={() => setOpen(isOpen ? null : faq.id)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-paper"
                        aria-expanded={isOpen}
                      >
                        <span className="font-semibold text-ink">{faq.question}</span>
                        <span
                          aria-hidden
                          className={`grid size-7 shrink-0 place-items-center rounded-full bg-sagesoft text-pine transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                        >
                          +
                        </span>
                      </button>
                      {isOpen && (
                        <p className="px-5 pb-5 leading-relaxed text-ink/75">{faq.answer}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </Page>
  );
}
