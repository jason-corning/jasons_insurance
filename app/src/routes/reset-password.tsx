import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AuthCard, Field, FormError, SubmitButton, TextInput } from "../components/forms";
import { Page } from "../components/site";
import { api, RequestError } from "../lib/client-api";

type ResetSearch = { token?: string };

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): ResetSearch => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password !== String(form.get("confirm") ?? "")) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await api("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token: String(form.get("token") ?? token ?? ""), password }),
      });
      navigate({ to: "/login" });
    } catch (e) {
      setError(e instanceof RequestError ? e.message : "Reset failed. The link may have expired.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <AuthCard title="Choose a new password" lede="Reset links are valid for 1 hour and can be used once.">
        <form onSubmit={onSubmit} className="space-y-4">
          <FormError message={error} />
          {!token && (
            <Field label="Reset token" hint="Paste the token from your reset link.">
              <TextInput name="token" required />
            </Field>
          )}
          <Field label="New password" hint="At least 8 characters.">
            <TextInput name="password" type="password" autoComplete="new-password" required minLength={8} />
          </Field>
          <Field label="Confirm new password">
            <TextInput name="confirm" type="password" autoComplete="new-password" required minLength={8} />
          </Field>
          <SubmitButton busy={busy}>Set new password</SubmitButton>
        </form>
        <p className="mt-5 border-t border-sage/40 pt-4 text-sm text-ink/60">
          <Link to="/login" className="font-medium text-pine hover:underline">
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    </Page>
  );
}
