import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Field, FormError, FormSuccess, TextInput } from "../components/forms";
import { Page, PageHeading, Spinner } from "../components/site";
import { api, RequestError, useAuthActions, useCurrentUser } from "../lib/client-api";

export const Route = createFileRoute("/account")({
  component: Account,
});

function Account() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading)
    return (
      <Page>
        <Spinner />
      </Page>
    );

  if (!user)
    return (
      <Page>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">Sign in to manage your account</h1>
          <Link to="/login" search={{ redirect: "/account" }} className="mt-6 inline-block rounded-full bg-pine px-6 py-3 font-semibold text-ivory transition hover:bg-pinedeep">
            Sign in
          </Link>
        </div>
      </Page>
    );

  return (
    <Page>
      <PageHeading
        eyebrow="Account settings"
        title="Keep your details current"
        lede="Carriers use these details for ID cards, invoices, and plan notices."
      />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-2">
        <ProfileCard title="Profile" subtitle="Set when you created the account.">
          <dl className="space-y-2 text-sm">
            {[
              ["Name", `${user.firstName} ${user.lastName}`],
              ["Username", user.username],
              ["Email", user.email],
              ["Date of birth", user.dateOfBirth ?? "Not set"],
              ["Member since", user.memberSince.slice(0, 10)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-ink/50">{label}</dt>
                <dd className="font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </ProfileCard>
        <AddressCard
          initial={{
            street: user.address.street ?? "",
            city: user.address.city ?? "",
            state: user.address.state ?? "",
            zip: user.address.zip ?? "",
          }}
        />
        <PhoneCard initial={user.phone ?? ""} />
        <PreferencesCard initial={user.communicationPreferences} />
      </div>
    </Page>
  );
}

function ProfileCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-sage/60 bg-ivory p-6">
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-ink/50">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function useSave() {
  const { refresh } = useAuthActions();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  return {
    error,
    saved,
    busy,
    async run(fn: () => Promise<unknown>) {
      setBusy(true);
      setError(null);
      setSaved(false);
      try {
        await fn();
        await refresh();
        setSaved(true);
      } catch (e) {
        setError(e instanceof RequestError ? e.message : "Save failed. Please try again.");
      } finally {
        setBusy(false);
      }
    },
  };
}

function SaveButton({ busy, label }: { busy: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-ivory transition hover:bg-pinedeep disabled:opacity-60"
    >
      {busy ? "Saving…" : label}
    </button>
  );
}

function AddressCard({ initial }: { initial: { street: string; city: string; state: string; zip: string } }) {
  const save = useSave();
  return (
    <ProfileCard title="Mailing address" subtitle="Where ID cards and plan documents are sent.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          save.run(() =>
            api("/api/profile/address", {
              method: "PUT",
              body: JSON.stringify({
                street: form.get("street"),
                city: form.get("city"),
                state: form.get("state"),
                zip: form.get("zip"),
              }),
            }),
          );
        }}
      >
        <FormError message={save.error} />
        {save.saved && <FormSuccess>Address saved.</FormSuccess>}
        <Field label="Street address">
          <TextInput name="street" defaultValue={initial.street} autoComplete="street-address" required />
        </Field>
        <div className="grid grid-cols-[1.5fr_0.6fr_0.9fr] gap-3">
          <Field label="City">
            <TextInput name="city" defaultValue={initial.city} autoComplete="address-level2" required />
          </Field>
          <Field label="State">
            <TextInput name="state" defaultValue={initial.state} maxLength={2} placeholder="CA" required />
          </Field>
          <Field label="ZIP">
            <TextInput name="zip" defaultValue={initial.zip} autoComplete="postal-code" required />
          </Field>
        </div>
        <SaveButton busy={save.busy} label="Save address" />
      </form>
    </ProfileCard>
  );
}

function PhoneCard({ initial }: { initial: string }) {
  const save = useSave();
  return (
    <ProfileCard title="Phone number" subtitle="Used for text alerts if you enable them.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          save.run(() =>
            api("/api/profile/phone", {
              method: "PUT",
              body: JSON.stringify({ phone: form.get("phone") }),
            }),
          );
        }}
      >
        <FormError message={save.error} />
        {save.saved && <FormSuccess>Phone number saved.</FormSuccess>}
        <Field label="Phone" hint="10-digit US number; any format.">
          <TextInput name="phone" defaultValue={initial} type="tel" autoComplete="tel" required placeholder="(555) 123-4567" />
        </Field>
        <SaveButton busy={save.busy} label="Save phone" />
      </form>
    </ProfileCard>
  );
}

function PreferencesCard({
  initial,
}: {
  initial: { email: boolean; sms: boolean; mail: boolean; paperless: boolean };
}) {
  const save = useSave();
  const [prefs, setPrefs] = useState(initial);
  const OPTIONS: { key: keyof typeof initial; label: string; hint: string }[] = [
    { key: "email", label: "Email updates", hint: "Confirmations, receipts, renewal notices." },
    { key: "sms", label: "Text messages", hint: "Short status alerts to your phone." },
    { key: "mail", label: "Postal mail", hint: "Paper copies of notices." },
    { key: "paperless", label: "Paperless documents", hint: "Read plan documents online instead of by mail." },
  ];
  return (
    <ProfileCard title="Communication preferences" subtitle="At least one contact channel must stay on.">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          save.run(() =>
            api("/api/profile/preferences", {
              method: "PUT",
              body: JSON.stringify(prefs),
            }),
          );
        }}
      >
        <FormError message={save.error} />
        {save.saved && <FormSuccess>Preferences saved.</FormSuccess>}
        <div className="space-y-2.5">
          {OPTIONS.map((option) => (
            <label key={option.key} className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-sage/50 px-4 py-3 transition hover:bg-paper">
              <span>
                <span className="block text-sm font-semibold text-ink">{option.label}</span>
                <span className="block text-xs text-ink/50">{option.hint}</span>
              </span>
              <input
                type="checkbox"
                checked={prefs[option.key]}
                onChange={(e) => setPrefs((p) => ({ ...p, [option.key]: e.target.checked }))}
                className="mt-1 size-5 accent-pine"
              />
            </label>
          ))}
        </div>
        <SaveButton busy={save.busy} label="Save preferences" />
      </form>
    </ProfileCard>
  );
}
