import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AuthCard, Field, FormError, SubmitButton, TextInput } from "../components/forms";
import { Page } from "../components/site";
import { api, RequestError, useAuthActions } from "../lib/client-api";

type LoginSearch = { redirect?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === "string" && search.redirect.startsWith("/") ? search.redirect : undefined,
  }),
  component: Login,
});

function Login() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { refresh } = useAuthActions();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          identifier: String(form.get("identifier") ?? ""),
          password: String(form.get("password") ?? ""),
        }),
      });
      await refresh();
      navigate({ to: redirect ?? "/dashboard" });
    } catch (e) {
      setError(e instanceof RequestError ? e.message : "Sign in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <AuthCard title="Sign in" lede="Use your username or email address.">
        <form onSubmit={onSubmit} className="space-y-4">
          <FormError message={error} />
          <Field label="Username or email">
            <TextInput name="identifier" autoComplete="username" required placeholder="you@example.com" />
          </Field>
          <Field label="Password">
            <TextInput name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
          </Field>
          <SubmitButton busy={busy}>Sign in</SubmitButton>
        </form>
        <div className="mt-5 space-y-1.5 border-t border-sage/40 pt-4 text-sm text-ink/60">
          <p>
            <Link to="/forgot-password" className="font-medium text-pine hover:underline">
              Forgot password?
            </Link>{" "}
            ·{" "}
            <Link to="/forgot-username" className="font-medium text-pine hover:underline">
              Forgot username?
            </Link>
          </p>
          <p>
            New here?{" "}
            <Link to="/register" className="font-medium text-pine hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </AuthCard>
    </Page>
  );
}
