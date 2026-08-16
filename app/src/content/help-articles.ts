// Help center library: one article per customer operation. Bodies use a
// small markdown subset rendered by src/components/markdown.tsx.

export type HelpArticle = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  minutes: number;
  body: string;
};

export const HELP_CATEGORIES = [
  "Getting started",
  "Shopping & enrollment",
  "Managing your coverage",
  "Account settings",
  "Getting help",
] as const;

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: "create-an-account",
    category: "Getting started",
    title: "Create a new account",
    summary: "Set up your Jason's Insurance account so you can enroll and manage coverage.",
    minutes: 2,
    body: `You need an account to enroll in a plan, pay premiums, and manage your coverage. Browsing and comparing plans works without one.

## Steps

1. Select **Sign in** in the top-right corner, then choose **Create an account**, or go straight to the Create account page.
2. Choose a username (3-32 characters; letters, numbers, dots, and dashes).
3. Enter your email address. Each email can back only one account, and it is where password help is sent.
4. Choose a password of at least 8 characters.
5. Enter your legal first and last name as they should appear on your coverage, and optionally your date of birth.
6. Select **Create account**. You are signed in immediately and taken to your dashboard.

## Good to know

- Your username or your email both work for signing in later.
- You can add your mailing address, phone number, and communication preferences any time under **Account settings**: you'll be asked for anything still missing when you first enroll.`,
  },
  {
    slug: "sign-in-and-out",
    category: "Getting started",
    title: "Log in and log out",
    summary: "Access your account securely, and end your session when you're done.",
    minutes: 1,
    body: `## Log in

1. Select **Sign in** in the top-right corner of any page.
2. Enter your username **or** your email address.
3. Enter your password and select **Sign in**.

A successful sign-in returns you to your dashboard. Sessions last 14 days on the device you signed in from.

## Log out

1. Open the account menu in the top-right corner (it shows your first name).
2. Select **Sign out**.

Signing out ends your session on that device immediately. On a shared or public computer, always sign out when you finish.

## Trouble signing in?

- If the password isn't accepted, use [Forgot password](/forgot-password) to set a new one.
- If you can't remember your username, use [Forgot username](/forgot-username).
- After a password reset, every device is signed out and you sign in again with the new password.`,
  },
  {
    slug: "forgot-password",
    category: "Getting started",
    title: "Reset a forgotten password",
    summary: "Use your email address to set a new password.",
    minutes: 2,
    body: `## Steps

1. On the Sign in page, select **Forgot password?**
2. Enter the email address on your account and select **Send reset link**.
3. Follow the reset link. (In this demo environment no real email is sent; the link is shown to you right on the page instead, clearly labeled.)
4. Choose a new password of at least 8 characters and confirm it.
5. Sign in with your new password.

## Good to know

- Reset links expire after **1 hour** and can be used only once.
- For your security, resetting the password signs you out of every device.
- The page always says the link was sent, even for an email we don't recognize; that keeps strangers from testing which emails have accounts.`,
  },
  {
    slug: "forgot-username",
    category: "Getting started",
    title: "Recover a forgotten username",
    summary: "Look up your username with the email on your account.",
    minutes: 1,
    body: `## Steps

1. On the Sign in page, select **Forgot username?**
2. Enter the email address on your account and select **Recover username**.
3. Your username reminder is delivered to that email. (In this demo environment the reminder is shown right on the page instead.)
4. Return to the Sign in page and sign in as usual.

Remember: you can always sign in with your **email address** instead of your username; both work.`,
  },
  {
    slug: "shop-for-insurance",
    category: "Shopping & enrollment",
    title: "Shop for health and dental plans",
    summary: "Browse, filter, and compare every plan on the marketplace.",
    minutes: 3,
    body: `Jason's Insurance is a marketplace for **health** and **dental** coverage. Shopping is open to everyone; no account needed until you're ready to enroll.

## Steps

1. Select **Shop plans** from the header (or the buttons on the home page).
2. Use the **Health / Dental** toggle to pick a product line.
3. Narrow the list with the filters:
   - **Tier**: health plans come in Bronze, Silver, Gold, and Platinum; dental plans in Low and High. Higher tiers cost more per month but pay more when you get care.
   - **Carrier**: limit to a specific insurance company.
   - **Monthly budget**: hide plans above a premium you set.
4. Every card shows the monthly premium, deductible, out-of-pocket maximum, and network type. Select **View details** on any plan for the full benefit list.
5. When a plan fits, select **Enroll in this plan** on its detail page.

## Choosing a tier

- **Bronze / Low**: lowest premium, highest costs when you need care. Good if you mainly want protection from worst-case bills.
- **Silver**: balanced premium and care costs, and the only health tier eligible for cost-sharing reductions if you qualify.
- **Gold / Platinum / High**: higher premium, low costs at the doctor. Good if you or your family see providers regularly.`,
  },
  {
    slug: "enroll-and-pay",
    category: "Shopping & enrollment",
    title: "Enroll in a plan and pay your first premium",
    summary: "Turn a chosen plan into active coverage in one short flow.",
    minutes: 4,
    body: `Enrollment happens in two parts: submitting the enrollment, then paying the first month's premium (the "binder payment"). Coverage is **not active until the first payment is made**: exactly like the real marketplace.

## Steps

1. From a plan's detail page, select **Enroll in this plan**. Sign in (or create an account) if prompted.
2. Confirm your household size; premiums scale with the number of covered members.
3. Review the **coverage start date** shown. Enrollments submitted on or before the **15th of the month** start on the 1st of the next month; after the 15th they start on the 1st of the month after next.
4. Select **Submit enrollment**. Your enrollment is created with status **Pending payment**.
5. On the payment step, enter card details and select **Pay & activate**. Payments here are **simulated**: no real charge is made, and we keep only the card brand and last four digits. Use any test card number that passes a checksum, e.g. 4242 4242 4242 4242.
6. Your enrollment flips to **Active** and appears on your dashboard with a confirmation.

## If you leave before paying

The enrollment stays on your dashboard as **Pending payment**. Open it any time and select **Pay & activate** to finish. Unpaid enrollments never become active coverage.`,
  },
  {
    slug: "check-enrollment-status",
    category: "Shopping & enrollment",
    title: "Check your enrollment status",
    summary: "See where every enrollment stands, any time.",
    minutes: 1,
    body: `## Steps

1. Sign in and open your **Dashboard** from the header.
2. Every enrollment appears as a card showing its current status, coverage start date, monthly premium, and covered members.
3. Select an enrollment to see its full detail: status history, payment records, and available actions.

## What the statuses mean

- **Pending payment**: enrollment submitted, first premium not yet paid. Coverage is not in force.
- **Active**: paid and in force from the effective date shown.
- **Cancelled**: ended at your request. Can be reinstated within 60 days.
- **Terminated**: ended by the plan (for example, non-payment past a grace period).

Your status is live: any payment, cancellation, or reinstatement updates it immediately.`,
  },
  {
    slug: "your-dashboard",
    category: "Managing your coverage",
    title: "Your dashboard at a glance",
    summary: "The home base for coverage, payments, and account actions.",
    minutes: 2,
    body: `The dashboard is the first page you see after signing in. It brings together:

- **Your enrollments**: every health and dental enrollment with live status, premium, and start date, plus quick actions (pay, cancel, reinstate, view detail).
- **Payment history**: the payments recorded on each enrollment detail page.
- **Account panel**: your mailing address, phone, and communication preferences, with shortcuts to update each.
- **Shortcuts**: jump to plan shopping, the help center, FAQs, or broker search.

## Tips

- A **Pending payment** badge on any card means that coverage is waiting on its first premium; select it to finish checkout.
- The dashboard is private to your account; sign out on shared computers.`,
  },
  {
    slug: "cancel-enrollment",
    category: "Managing your coverage",
    title: "Cancel an enrollment",
    summary: "End coverage you no longer want, from your dashboard.",
    minutes: 2,
    body: `You can cancel an enrollment at any time; for example if you gained coverage elsewhere.

## Steps

1. Sign in and open your **Dashboard**.
2. Select the enrollment you want to end.
3. Select **Cancel enrollment**.
4. Optionally tell us why (it helps us improve), then confirm.
5. The status changes to **Cancelled** immediately and the cancellation date is recorded.

## What happens next

- Cancelling is **your** action; it is different from a termination initiated by the plan (for example after unpaid premiums).
- If you change your mind, you can **reinstate** the enrollment within **60 days** of cancelling; see [Reinstate an enrollment](/help/reinstate-enrollment).
- After 60 days, start a fresh enrollment from the Shop page instead.`,
  },
  {
    slug: "reinstate-enrollment",
    category: "Managing your coverage",
    title: "Reinstate a cancelled enrollment",
    summary: "Restore recently cancelled coverage without re-shopping.",
    minutes: 2,
    body: `Cancelled by mistake, or circumstances changed? Reinstatement restores the enrollment you already had; same plan, same effective date; without going through shopping and enrollment again.

## Steps

1. Sign in and open your **Dashboard**.
2. Select the cancelled enrollment.
3. Select **Reinstate enrollment** and confirm.
4. The status returns to **Active** and the reinstatement date is recorded.

## The rules

- Reinstatement is available for **60 days** after the cancellation date, mirroring how marketplace reinstatement windows work.
- Outside the window the plan can no longer restore the old enrollment; you'll be pointed to the Shop page to enroll fresh.
- Any premiums missed while cancelled are collected with your next invoice.`,
  },
  {
    slug: "update-mailing-address",
    category: "Account settings",
    title: "Update your mailing address",
    summary: "Keep plan documents and ID cards going to the right place.",
    minutes: 1,
    body: `Carriers mail ID cards, invoices, and plan notices to the address on file; keep it current, especially after a move.

## Steps

1. Sign in and open **Account settings** from the account menu (or the dashboard's account panel).
2. In the **Mailing address** card, select **Edit**.
3. Enter street, city, two-letter state, and ZIP code (5 digits, ZIP+4 accepted).
4. Select **Save address**. The change takes effect immediately.

## Good to know

- Moving can also change which plans are available to you in a real marketplace, and is a qualifying life event for special enrollment; check the FAQs under "Life changes" if you've moved.`,
  },
  {
    slug: "update-phone-number",
    category: "Account settings",
    title: "Update your phone number",
    summary: "Change the number we and your carrier use to reach you.",
    minutes: 1,
    body: `## Steps

1. Sign in and open **Account settings** from the account menu.
2. In the **Phone number** card, select **Edit**.
3. Enter your 10-digit US phone number (formatting doesn't matter; we tidy it up).
4. Select **Save phone**. The change takes effect immediately.

If you've enabled **text message** updates in your communication preferences, they go to this number.`,
  },
  {
    slug: "update-communication-preferences",
    category: "Account settings",
    title: "Update your communication preferences",
    summary: "Choose how you hear from us: email, text, mail, and paperless.",
    minutes: 2,
    body: `## Steps

1. Sign in and open **Account settings** from the account menu.
2. In the **Communication preferences** card, toggle any of:
   - **Email updates**: enrollment confirmations, payment receipts, renewal notices.
   - **Text messages**: short status alerts to your phone number on file.
   - **Postal mail**: paper copies of notices.
   - **Paperless documents**: read plan documents online instead of receiving them by mail.
3. Select **Save preferences**.

## The one rule

At least one contact channel (email, text, or mail) must stay on; carriers are required to be able to reach you about your coverage. The page will ask you to keep one enabled.`,
  },
  {
    slug: "find-a-broker",
    category: "Getting help",
    title: "Search for a licensed broker",
    summary: "Find free, licensed help choosing or managing a plan.",
    minutes: 2,
    body: `Brokers are licensed professionals who can recommend plans, help you enroll, and assist with paperwork. Their help is **free to you**: they're paid by carriers, and you pay the same premium either way.

## Steps

1. Select **Find a broker** in the header or footer.
2. Search by name, agency, city, or language, and/or filter by:
   - **ZIP code**: matches brokers serving your area.
   - **Specialty**: health, dental, or both.
3. Each result shows the broker's agency, license number, location, languages, and direct phone/email.
4. Contact the broker directly; mention you found them through Jason's Insurance.

## Good to know

- Always verify a broker's license number matches what they tell you; every listing here shows it.
- A designated broker can view your applications and help maintain them year-round, exactly like enrolling on your own; same plans, same price.`,
  },
  {
    slug: "using-the-faqs",
    category: "Getting help",
    title: "Find answers in the FAQs",
    summary: "Where the common marketplace questions live, and how they're organized.",
    minutes: 1,
    body: `The [FAQ page](/faqs) answers the questions consumers ask most, drawn from the marketplace's consumer eligibility, enrollment, and support policies; enrollment windows, payment and grace-period rules, cancellations and reinstatement, life changes, document verification, brokers, and tax forms.

## Steps

1. Select **FAQs** in the header or footer.
2. Browse by category, or use the search box to filter questions by keyword.
3. Select any question to expand its answer.

If the FAQs don't settle it, the [help center](/help) walks through every operation on this site step-by-step, and a [licensed broker](/brokers) can help with plan-specific questions.`,
  },
  {
    slug: "api-documentation",
    category: "Getting help",
    title: "Developer API documentation",
    summary: "Every public API endpoint behind this site, documented.",
    minutes: 3,
    body: `Jason's Insurance runs on a documented REST API; the same endpoints this website calls. The full reference lives on the [API docs page](/api-docs), including:

- **Auth**: register, log in/out, current session, password reset, username recovery.
- **Plans**: list and filter the health/dental catalog, fetch one plan.
- **Enrollments**: create, list, status, pay (simulated), cancel, reinstate.
- **Profile**: read profile; update address, phone, communication preferences.
- **Brokers**: search the licensed broker directory.
- **Content**: FAQs and these help articles as JSON.

Each endpoint entry documents the method, path, auth requirement, request body, and response shape. Session auth uses an httpOnly cookie set by the login/register endpoints, so a browser (or any client with a cookie jar) can exercise the whole flow.`,
  },
];

export function articlesByCategory() {
  const grouped: Record<string, HelpArticle[]> = {};
  for (const cat of HELP_CATEGORIES) grouped[cat] = [];
  for (const article of HELP_ARTICLES) {
    (grouped[article.category] ??= []).push(article);
  }
  return grouped;
}

export function findArticle(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.slug === slug);
}
