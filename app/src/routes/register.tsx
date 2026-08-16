import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AuthCard, Field, FormError, SubmitButton, TextInput } from "../components/forms";
import { Page } from "../components/site";
import { api, RequestError, useAuthActions } from "../lib/client-api";

type RegisterSearch = { redirect?: string };

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>): RegisterSearch => ({
    redirect: typeof search.redirect === "string" && search.redirect.startsWith("/") ? search.redirect : undefined,
  }),
  component: Register,
});

function Register() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { refresh } = useAuthActions();
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
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: String(form.get("username") ?? ""),
          email: String(form.get("email") ?? ""),
          password,
          firstName: String(form.get("firstName") ?? ""),
          lastName: String(form.get("lastName") ?? ""),
          dateOfBirth: String(form.get("dateOfBirth") ?? "") || null,
        }),
      });
      await refresh();
      navigate({ to: redirect ?? "/dashboard" });
    } catch (e) {
      setError(e instanceof RequestError ? e.message : "Could not create the account. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <AuthCard
        title="Create your account"
        lede="An account lets you enroll in plans, pay premiums, and manage coverage."
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <FormError message={error} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <TextInput name="firstName" autoComplete="given-name" required />
            </Field>
            <Field label="Last name">
              <TextInput name="lastName" autoComplete="family-name" required />
            </Field>
          </div>
          <Field label="Username" hint="3-32 characters: letters, numbers, dots, dashes.">
            <TextInput name="username" autoComplete="username" required minLength={3} maxLength={32} />
          </Field>
          <Field label="Email">
            <TextInput name="email" type="email" autoComplete="email" required />
          </Field>
          <Field label="Date of birth" hint="Optional; used on your coverage documents.">
            <TextInput name="dateOfBirth" type="date" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Password" hint="At least 8 characters.">
              <TextInput name="password" type="password" autoComplete="new-password" required minLength={8} />
            </Field>
            <Field label="Confirm password">
              <TextInput name="confirm" type="password" autoComplete="new-password" required minLength={8} />
            </Field>
          </div>
          <SubmitButton busy={busy}>Create account</SubmitButton>
        </form>
        <p className="mt-5 border-t border-sage/40 pt-4 text-sm text-ink/60">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-pine hover:underline">
            Sign in
          </Link>
        </p>
      </AuthCard>
    </Page>
  );
}
