// Site chrome: header with auth-aware account menu, page wrapper, and footer.
import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

import { useAuthActions, useCurrentUser } from "../lib/client-api";

const NAV = [
  { to: "/shop", label: "Shop plans" },
  { to: "/brokers", label: "Find a broker" },
  { to: "/help", label: "Help center" },
  { to: "/faqs", label: "FAQs" },
  { to: "/api-docs", label: "API" },
] as const;

export function Header() {
  const { data: user, isLoading } = useCurrentUser();
  const { logout } = useAuthActions();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-sage/40 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2" aria-label="Jason's Insurance home">
          <img
            src="/assets/logo-lockup.png"
            alt="Jason's Insurance"
            className="h-12 w-auto mix-blend-multiply"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink/75 transition hover:bg-sagesoft hover:text-pine"
              activeProps={{ className: "rounded-full px-4 py-2 text-sm font-semibold bg-sagesoft text-pine" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-10 w-24 animate-pulse rounded-full bg-paper" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-sage/60 bg-ivory px-4 py-2 text-sm font-semibold text-pine transition hover:bg-sagesoft"
                aria-expanded={menuOpen}
              >
                <span className="grid size-6 place-items-center rounded-full bg-pine text-xs font-bold text-ivory">
                  {user.firstName.charAt(0).toUpperCase()}
                </span>
                {user.firstName}
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden>
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-sage/50 bg-ivory shadow-lg shadow-pine/10"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <div className="border-b border-sage/40 px-4 py-3">
                    <p className="text-sm font-semibold text-ink">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate text-xs text-ink/60">{user.email}</p>
                  </div>
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-ink/80 hover:bg-sagesoft hover:text-pine">
                    Dashboard
                  </Link>
                  <Link to="/account" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm text-ink/80 hover:bg-sagesoft hover:text-pine">
                    Account settings
                  </Link>
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await logout();
                      navigate({ to: "/" });
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm text-clay hover:bg-claysoft"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-pine transition hover:bg-sagesoft">
                Sign in
              </Link>
              <Link
                to="/register"
                className="hidden rounded-full bg-pine px-4 py-2 text-sm font-semibold text-ivory transition hover:bg-pinedeep sm:block"
              >
                Create account
              </Link>
            </>
          )}
          <button
            className="grid size-10 place-items-center rounded-full border border-sage/60 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden>
              <path d="M1 1h16M1 7h16M1 13h16" stroke="#124C43" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav className="border-t border-sage/40 bg-ivory px-4 py-2 lg:hidden" aria-label="Mobile">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-sagesoft hover:text-pine"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-sage/40 bg-paper">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <img src="/assets/logo-lockup.png" alt="Jason's Insurance" className="h-12 w-auto mix-blend-multiply" />
          <p className="mt-3 text-sm leading-relaxed text-ink/60">
            A friendlier way to shop health and dental coverage, enroll online, and manage your plan year-round.
          </p>
        </div>
        <FooterColumn
          title="Shop"
          links={[
            ["/shop", "All plans"],
            ["/shop?type=health", "Health plans"],
            ["/shop?type=dental", "Dental plans"],
            ["/brokers", "Find a broker"],
          ]}
        />
        <FooterColumn
          title="Support"
          links={[
            ["/help", "Help center"],
            ["/faqs", "FAQs"],
            ["/contact", "Contact us"],
            ["/api-docs", "API documentation"],
            ["/dashboard", "My dashboard"],
          ]}
        />
        <FooterColumn
          title="Account"
          links={[
            ["/login", "Sign in"],
            ["/register", "Create account"],
            ["/forgot-password", "Forgot password"],
            ["/forgot-username", "Forgot username"],
          ]}
        />
      </div>
      <div className="border-t border-sage/40">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs leading-relaxed text-ink/50 sm:px-6">
          Jason's Insurance is a demonstration marketplace. Plans, carriers, and brokers shown are fictional, and
          payments are simulated: no real charges occur. FAQ content is adapted from PY2026 consumer eligibility,
          enrollment, and support policies.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-pine">{title}</h3>
      <ul className="mt-3 space-y-2">
        {links.map(([to, label]) => (
          <li key={to + label}>
            <Link to={to.split("?")[0]} search={to.includes("?type=") ? { type: to.split("?type=")[1] } : undefined} className="text-sm text-ink/70 hover:text-pine hover:underline">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHeading({ eyebrow, title, lede }: { eyebrow?: string; title: string; lede?: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-2 pt-10 sm:px-6">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-leaf">{eyebrow}</p>
      ) : null}
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink sm:text-4xl">{title}</h1>
      {lede ? <p className="mt-3 max-w-2xl text-ink/70">{lede}</p> : null}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="size-8 animate-spin rounded-full border-[3px] border-sage border-t-pine" aria-label="Loading" />
    </div>
  );
}
