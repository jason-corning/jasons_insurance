import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { AuthCard, Field, FormError, FormSuccess, SubmitButton, TextInput } from "../components/forms";
import { Page } from "../components/site";
import { api, RequestError } from "../lib/client-api";

export const Route = createFileRoute("/forgot-username")({
  component: ForgotUsername,
});

function ForgotUsername() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ username: string | null; usernameMasked: string | null } | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await api<{ ok: boolean; username: string | null; usernameMasked: string | null }>(
        "/api/auth/forgot-username",
        { method: "POST", body: JSON.stringify({ email: String(form.get("email") ?? "") }) },
      );
      setResult(response);
    } catch (e) {
      setError(e instanceof RequestError ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <AuthCard
        title="Recover your username"
        lede="Enter the email on your account and we'll send your username reminder."
      >
        {result ? (
          <div className="space-y-4">
            <FormSuccess>
              If an account exists for that email, a username reminder has been sent to it.
            </FormSuccess>
            {result.username ? (
              <div className="rounded-xl border border-sage/60 bg-paper px-4 py-3 text-sm text-ink/70">
                <p className="font-semibold text-pine">Demo shortcut</p>
                <p className="mt-1">
                  No email service is connected in this demo, so here it is directly: your username is{" "}
                  <strong className="font-semibold text-ink">{result.username}</strong>.
                </p>
              </div>
            ) : null}
            <Link
              to="/login"
              className="block w-full rounded-2xl bg-pine px-6 py-3.5 text-center font-semibold text-ivory transition hover:bg-pinedeep"
            >
              Go to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <FormError message={error} />
            <Field label="Email">
              <TextInput name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
            </Field>
            <SubmitButton busy={busy}>Recover username</SubmitButton>
          </form>
        )}
        <p className="mt-5 border-t border-sage/40 pt-4 text-sm text-ink/60">
          Tip: you can always sign in with your email address instead.{" "}
          <Link to="/login" className="font-medium text-pine hover:underline">
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    </Page>
  );
}
