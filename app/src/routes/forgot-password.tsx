import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { AuthCard, Field, FormError, FormSuccess, SubmitButton, TextInput } from "../components/forms";
import { Page } from "../components/site";
import { api, RequestError } from "../lib/client-api";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ resetToken: string | null } | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await api<{ ok: boolean; sent: boolean; resetToken: string | null }>(
        "/api/auth/forgot-password",
        { method: "POST", body: JSON.stringify({ email: String(form.get("email") ?? "") }) },
      );
      setResult({ resetToken: response.resetToken });
    } catch (e) {
      setError(e instanceof RequestError ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <AuthCard
        title="Reset your password"
        lede="Enter the email on your account and we'll send a reset link."
      >
        {result ? (
          <div className="space-y-4">
            <FormSuccess>
              If an account exists for that email, a reset link has been sent. The link expires in 1 hour.
            </FormSuccess>
            {result.resetToken ? (
              <div className="rounded-xl border border-sage/60 bg-paper px-4 py-3 text-sm text-ink/70">
                <p className="font-semibold text-pine">Demo shortcut</p>
                <p className="mt-1">
                  No email service is connected in this demo, so here is your reset link directly:
                </p>
                <Link
                  to="/reset-password"
                  search={{ token: result.resetToken }}
                  className="mt-2 inline-block break-all font-medium text-pine underline"
                >
                  Open the password reset page
                </Link>
              </div>
            ) : null}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <FormError message={error} />
            <Field label="Email">
              <TextInput name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
            </Field>
            <SubmitButton busy={busy}>Send reset link</SubmitButton>
          </form>
        )}
        <p className="mt-5 border-t border-sage/40 pt-4 text-sm text-ink/60">
          Remembered it after all?{" "}
          <Link to="/login" className="font-medium text-pine hover:underline">
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    </Page>
  );
}
