import { createFileRoute } from "@tanstack/react-router";

import { Page } from "../components/site";

export const Route = createFileRoute("/autoflow-discrepancy-log")({
  component: AutoflowDiscrepancyLog,
});

const articles = {
  context: "https://support.forethought.ai/hc/en-us/articles/30828322533267-Context-Variable-in-Autoflows",
  managing: "https://support.forethought.ai/hc/en-us/articles/5115655320979-Managing-Context-Variables",
  versions: "https://support.forethought.ai/hc/en-us/articles/49252411477779-Create-and-Manage-Versions-in-Autoflows",
  overview: "https://support.forethought.ai/hc/en-us/articles/4561853567763-Solve-Overview",
  policies: "https://support.forethought.ai/hc/en-us/articles/20941688187923-Examples-and-Best-Practices-to-Follow-in-Creating-Autoflows-Policies",
};

const findings = [
  {
    id: "D-01", severity: "High", title: "Agent Builder replaces Workflow Builder",
    tenant: "The left navigation and page title say “Agent Builder.” No “Workflow Builder” destination is shown.",
    help: "Context-variable and versioning setup both instruct admins to navigate to Solve > Workflow Builder.",
    impact: "A new admin following the article cannot match the documented destination to the tenant navigation.",
    evidence: ["tenant-agent-table.png", "help-context-workflow-builder.png"],
    sources: [articles.context, articles.versions, articles.overview],
  },
  {
    id: "D-02", severity: "High", title: "New Agent / Agent differs from Create New / Intent",
    tenant: "The creation control is “New Agent,” followed by “Agent” or “Subagent.”",
    help: "Context Variable in Autoflows says to click “Create New > Intent.”",
    impact: "Intent and Agent look like different objects even though they begin the same authoring task.",
    evidence: ["tenant-new-agent.png", "help-context-workflow-builder.png"], sources: [articles.context],
  },
  {
    id: "D-03", severity: "Medium", title: "Agent, Autoflow, intent, and workflow overlap",
    tenant: "The overview uses “All agents,” an “Agents” column, and type “Autoflows.” The editor says “Autoflow policy.”",
    help: "The articles alternate among workflow, Autoflow, Autoflow policy, intent, and AI Agent without a mapping table.",
    impact: "Readers cannot tell whether the terms are synonyms, containers, execution types, or legacy names.",
    evidence: ["tenant-agent-table.png", "tenant-draft-editor.png"], sources: [articles.context, articles.versions, articles.policies],
  },
  {
    id: "D-04", severity: "Medium", title: "Add context variable differs from Add Context",
    tenant: "The drawer action is “Add context variable.”", help: "Managing Context Variables instructs users to click “Add Context.”",
    impact: "The location is similar, but the exact documented CTA does not exist in the tenant.",
    evidence: ["tenant-context-multi-options.png", "help-managing-context-variables.png"], sources: [articles.managing],
  },
  {
    id: "D-05", severity: "High", title: "Multi-options differs from Multi-Select List",
    tenant: "$Ticket Tags displays type “Multi-options.”",
    help: "The documented type is “Multi-Select List,” and another article says Autoflows do not support it.",
    impact: "Admins cannot tell whether Multi-options is a rename, a ticket-only type, or the unsupported documented type.",
    evidence: ["tenant-context-multi-options.png", "help-context-workflow-builder.png"], sources: [articles.context, articles.managing],
  },
  {
    id: "D-06", severity: "High", title: "API Status Code is visible but documented as unsupported",
    tenant: "The drawer exposes $Latest API Status Code with Number type.",
    help: "Context Variable in Autoflows explicitly says API Status Code context variables are unsupported.",
    impact: "The UI does not explain whether the visible field is read-only, legacy, or supported only in certain channels.",
    evidence: ["tenant-api-status-code.png", "help-context-workflow-builder.png"], sources: [articles.context, articles.managing],
  },
  {
    id: "D-07", severity: "Medium", title: "Action Builder still reports Workflows in use",
    tenant: "Action Builder has “Workflows in use,” while the consuming destination is Agent Builder and its objects are agents.",
    help: "Help Center Workflow Builder terminology matches the Action Builder column, not the current navigation.",
    impact: "The product mixes old and current nouns, obscuring whether actions attach to workflows, agents, or Autoflows.",
    evidence: ["tenant-action-builder.png", "help-context-workflow-builder.png"], sources: [articles.context, articles.overview],
  },
  {
    id: "D-08", severity: "Medium", title: "Versioning labels depend on location",
    tenant: "A draft shows Auto-Saved, Discard draft, Preview, and Versions. The overview uses Preview Live.",
    help: "The article shows Versions > Create version, then later instructs users to click Preview Live from Workflow Builder.",
    impact: "The article and tenant mix editor-level and overview-level labels without identifying the required screen.",
    evidence: ["tenant-draft-editor.png", "help-versioning-workflow-builder.png"], sources: [articles.versions],
  },
  {
    id: "D-09", severity: "Medium", title: "Official sources conflict on API status",
    tenant: "The tenant lists $Latest API Status Code, matching the screenshot in Managing Context Variables.",
    help: "That screenshot shows the field, while Context Variable in Autoflows says API Status Code is unsupported.",
    impact: "Two official sources lead to opposite conclusions before an admin even compares them with the tenant.",
    evidence: ["help-managing-context-variables.png", "help-context-workflow-builder.png"], sources: [articles.context, articles.managing],
  },
];

const flows = [
  "Register an account", "Reset password", "Recover a username", "Shop for an enrollment", "Knowledge retrieval",
  "Cancel an enrollment", "Reinstate an enrollment", "Search for broker", "Update mailing address",
  "Update phone number", "Update communication preferences",
];

function AutoflowDiscrepancyLog() {
  return (
    <Page>
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
        <header className="rounded-[2rem] bg-gradient-to-br from-pinedeep via-pine to-[#237a69] p-8 text-ivory shadow-xl sm:p-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sage">Implementation evidence · August 16, 2026</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-[0.98] tracking-tight sm:text-7xl">Autoflow UI discrepancy log</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ivory/85">Jason’s Insurance tenant compared with Forethought Help Center instructions. Each finding includes exact wording, impact, screenshots, and canonical article links.</p>
          <div className="mt-10 grid gap-3 sm:grid-cols-4">
            {[["9","discrepancies"],["11","draft Autoflows"],["6","API actions"],["0","stored secrets"]].map(([n,label]) => (
              <div key={label} className="rounded-2xl border border-ivory/20 bg-ivory/10 p-5"><strong className="block text-3xl">{n}</strong><span className="mt-1 block text-sm text-ivory/75">{label}</span></div>
            ))}
          </div>
        </header>

        <section className="mt-10 grid gap-5 rounded-3xl border border-sage bg-sagesoft p-7 sm:grid-cols-[1fr_2fr]">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-pine">Security boundary</p><h2 className="mt-2 font-display text-3xl font-semibold">Credentials remain runtime-only</h2></div>
          <p className="leading-relaxed text-ink/75">Passwords, reset tokens, one-time codes, payment data, and session cookies were not created as context variables. Authenticated enrollment and profile APIs require the website’s httpOnly cookie, so those policies route users to <a className="font-semibold underline" href="https://jasons-insurance.vercel.app/">jasons-insurance.vercel.app</a> instead of storing a credential in Forethought.</p>
        </section>

        <section className="mt-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-pine">Findings</p>
          <h2 className="mt-2 font-display text-4xl font-semibold">Where the product and instructions diverge</h2>
          <div className="mt-7 space-y-6">
            {findings.map((finding) => (
              <article id={finding.id} key={finding.id} className="rounded-3xl border border-sage/60 bg-ivory p-6 shadow-sm sm:p-8">
                <div className="flex items-center justify-between gap-3"><span className="font-mono text-sm font-semibold text-ink/50">{finding.id}</span><span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${finding.severity === "High" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{finding.severity}</span></div>
                <h3 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">{finding.title}</h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-sage/50 bg-paper p-5"><span className="text-xs font-bold uppercase tracking-wider text-pine">Tenant</span><p className="mt-2 text-ink/75">{finding.tenant}</p></div>
                  <div className="rounded-2xl border border-sage/50 bg-paper p-5"><span className="text-xs font-bold uppercase tracking-wider text-pine">Help Center</span><p className="mt-2 text-ink/75">{finding.help}</p></div>
                </div>
                <p className="mt-5 text-ink/65"><strong className="text-ink">Why this is confusing:</strong> {finding.impact}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {finding.evidence.map((image) => <a key={image} href={`/autoflow-evidence/${image}`} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-sage/50 bg-paper"><img src={`/autoflow-evidence/${image}`} alt={`${finding.id} screenshot evidence`} className="aspect-video w-full object-cover object-top transition hover:scale-[1.01]" /></a>)}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">{finding.sources.map((source, index) => <a key={source} href={source} target="_blank" rel="noreferrer" className="rounded-lg bg-sagesoft px-3 py-2 text-sm font-semibold text-pine underline">Source {index + 1}</a>)}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl bg-ink p-7 text-ivory sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">Tenant implementation</p>
          <h2 className="mt-2 font-display text-4xl font-semibold">Draft Autoflows created</h2>
          <p className="mt-2 text-ivory/65">Every workflow remains inactive and unpublished.</p>
          <ol className="mt-7 grid gap-2 sm:grid-cols-2">{flows.map((flow, index) => <li key={flow} className="flex items-center gap-3 rounded-xl bg-ivory/10 px-4 py-3"><span className="font-mono text-xs text-sage">{String(index + 1).padStart(2,"0")}</span><span className="flex-1">{flow}</span><span className="text-xs text-sage">Draft · Off</span></li>)}</ol>
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-ivory/15 p-5"><h3 className="font-semibold">Reusable API components</h3><p className="mt-2 text-sm text-ivory/65">List Insurance Plans, Search Brokers, Search Insurance FAQs, List Insurance Help Articles, Recover Insurance Username, and Request Password Reset.</p></div>
            <div className="rounded-2xl border border-ivory/15 p-5"><h3 className="font-semibold">Source boundary</h3><p className="mt-2 text-sm text-ivory/65">All project APIs, FAQs, help content, and secure handoffs use <a className="text-sage underline" href="https://jasons-insurance.vercel.app/">https://jasons-insurance.vercel.app/</a>.</p></div>
          </div>
        </section>
      </main>
    </Page>
  );
}
