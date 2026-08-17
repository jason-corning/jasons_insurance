import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Field, FormError, SubmitButton, TextInput } from "../components/forms";
import { Page, PageHeading } from "../components/site";
import { api, RequestError, useCurrentUser } from "../lib/client-api";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact us · Jason's Insurance" }] }),
  component: Contact,
});

const SUPPORT_EMAIL = "jhcorning12@gmail.com";

function Contact() {
  const { data: user } = useCurrentUser();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ticketId, setTicketId] = useState<number | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await api<{ ok: boolean; ticketId: number | null }>("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          email: String(form.get("email") ?? ""),
          subject: String(form.get("subject") ?? ""),
          message: String(form.get("message") ?? ""),
        }),
      });
      setTicketId(response.ticketId);
    } catch (e) {
      setError(e instanceof RequestError ? e.message : "Could not send the message. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <PageHeading
        eyebrow="Support"
        title="Contact us"
        lede="Questions about a plan, an enrollment, or your account? We're happy to help."
      />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[1fr_1.3fr]">
        <aside className="space-y-5">
          <div className="rounded-3xl border border-sage/60 bg-paper p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Email support</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink/70">
              Write to us any time; we aim to reply within one business day.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=Support%20request%20-%20Jason's%20Insurance`}
              className="mt-4 inline-block rounded-full bg-pine px-6 py-3 font-semibold text-ivory transition hover:bg-pinedeep"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
          <div className="rounded-3xl border border-sage/60 bg-ivory p-6">
            <h2 className="font-display text-lg font-semibold text-ink">Faster answers</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/help" className="text-pine hover:underline">
                  Help center
                </Link>
                <span className="text-ink/60"> — step-by-step guides for every operation</span>
              </li>
              <li>
                <Link to="/faqs" className="text-pine hover:underline">
                  FAQs
                </Link>
                <span className="text-ink/60"> — marketplace policy questions and deadlines</span>
              </li>
              <li>
                <Link to="/brokers" className="text-pine hover:underline">
                  Find a broker
                </Link>
                <span className="text-ink/60"> — free licensed help choosing a plan</span>
              </li>
            </ul>
          </div>
        </aside>

        <div className="rounded-3xl border border-sage/60 bg-ivory p-7">
          {ticketId !== null ? (
            <div className="py-8 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-leaf text-2xl text-ivory">✓</span>
              <h2 className="mt-4 font-display text-2xl font-semibold text-pine">Message received</h2>
              <p className="mx-auto mt-3 max-w-sm text-ink/70">
                Thanks for reaching out. Your reference number is <strong className="text-ink">#{ticketId}</strong>.
                We'll reply to the email address you provided.
              </p>
              <Link to="/" className="mt-6 inline-block rounded-full border-2 border-pine/20 px-6 py-3 font-semibold text-pine transition hover:border-pine hover:bg-sagesoft">
                Back to home
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-xl font-semibold text-ink">Send us a message</h2>
              <form onSubmit={onSubmit} className="mt-5 space-y-4">
                <FormError message={error} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Your name">
                    <TextInput name="name" autoComplete="name" required defaultValue={user ? `${user.firstName} ${user.lastName}` : ""} />
                  </Field>
                  <Field label="Your email">
                    <TextInput name="email" type="email" autoComplete="email" required defaultValue={user?.email ?? ""} />
                  </Field>
                </div>
                <Field label="Subject">
                  <TextInput name="subject" required placeholder="e.g. Question about my enrollment" />
                </Field>
                <Field label="Message">
                  <textarea
                    name="message"
                    required
                    minLength={10}
                    rows={6}
                    className="w-full rounded-xl border border-sage/70 bg-ivory px-4 py-2.5 text-ink outline-none transition placeholder:text-ink/35 focus:border-pine focus:ring-2 focus:ring-sage"
                    placeholder="How can we help?"
                  />
                </Field>
                <SubmitButton busy={busy}>Send message</SubmitButton>
                <p className="text-center text-xs text-ink/50">
                  Signed-in messages are linked to your account so support can see your enrollments.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </Page>
  );
}
