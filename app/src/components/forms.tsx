// Shared form primitives styled to the brand.
import type { InputHTMLAttributes, ReactNode } from "react";

export function AuthCard({ title, lede, children }: { title: string; lede?: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-14">
      <div className="rounded-3xl border border-sage/60 bg-ivory p-8 shadow-xl shadow-pine/5">
        <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
        {lede ? <p className="mt-2 text-sm leading-relaxed text-ink/60">{lede}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {hint ? <span className="block text-xs text-ink/50">{hint}</span> : null}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-sage/70 bg-ivory px-4 py-2.5 text-ink outline-none transition placeholder:text-ink/35 focus:border-pine focus:ring-2 focus:ring-sage ${props.className ?? ""}`}
    />
  );
}

export function SubmitButton({ children, busy }: { children: ReactNode; busy?: boolean }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full rounded-2xl bg-pine px-6 py-3.5 font-display font-semibold text-ivory transition hover:bg-pinedeep disabled:cursor-wait disabled:opacity-60"
    >
      {busy ? "One moment…" : children}
    </button>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl border border-clay/30 bg-claysoft px-4 py-3 text-sm font-medium text-clay">
      {message}
    </p>
  );
}

export function FormSuccess({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-leaf/30 bg-sagesoft px-4 py-3 text-sm font-medium text-pine">
      {children}
    </div>
  );
}
