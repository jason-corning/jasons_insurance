# Design brief — Jason's Insurance

## Design read
For everyday households comparing health and dental coverage: the register is a calm, competent
advisor's office — warm, unhurried, and precise, never salesy.

## Concept spine
"The site is a well-organized policy folder": every surface reads like a beautifully kept paper
file — labeled tabs (section eyebrows), ledger tables, stamped statuses, and a reassuring advisor
voice. Digital chrome borrows the language of good paperwork done right.

## Delivery tier
`editorial` — user picked Non-animated at intake; a functional insurance portal (auth, dashboard,
enrollment, payments) where typography, imagery and bespoke chrome carry the craft. Micro-motion
only: hover lifts on cards, soft accordion easing, status-stamp transitions.

## Locked palette
- `#FAF7F1` ivory paper — page ground (documents, not dashboards)
- `#10201C` pine ink — text; near-black with green warmth, never neutral graphite
- `#124C43` deep pine — primary brand, headers, primary actions
- `#2E7D5B` leaf — success, active statuses, secondary accents
- `#B7CDB8` sage mist — tint panels, table stripes
- `#8A4B2D` clay sienna — sparing warm counterpoint (alerts, cancelled states)
Defense: evergreen-on-ivory reads as institutional trust with organic warmth; avoids every banned
family (no graphite+orange, no near-black+neon, no beige+brass, no violet glow).

## Locked type
- Display: **Fraunces** (serif) — insurance is a promise on paper; a warm high-contrast serif
  carries institutional confidence without coldness. Serif justified by the policy-folder spine.
- Body/UI: **Figtree** (humanist sans) — clear forms, tables, and labels.

## Animation mode
Animation mode: non-animated — user picked Non-animated at intake.
Craft floor via editorial tier: bespoke generated imagery, stamped-status micro-motion,
ledger-style tables, custom CTA garments per surface.

## Section plan (home)
1. Hero — split editorial: serif claim + generated family photo plate (family: hero-family.jpg)
2. Plan types — two folder-tab cards (health / dental)
3. How it works — numbered ledger rows (shop → enroll → pay → manage)
4. Help center + broker strip — tinted panel with article links + advisor photo
5. Trust/footer band — policy-folder colophon
Families: split-editorial, tab-cards, ledger-rows, tinted-panel, colophon (5 families / 5 sections,
no repeats). Eyebrow budget: 2.

## Asset plan
- Logo lockup + shield mark (generated, nano_banana_pro) → header, favicon
- Hero family photo 16:9 (soul_2) → home hero
- Advisor/broker photo 3:2 (soul_2) → broker strip + brokers page
- OG card 3:2 (nano_banana_pro) → og_image / social
Icons: hand-drawn inline SVG set (shield, heart, tooth, ledger, stamp) in brand colors.

## CTA inventory
- "Shop plans" (hero, primary): pine pill, ivory text, arrow that slides on a paper-fold hover
- "Browse health / dental" (folder cards): folder-tab lift + underline draw
- "Enroll in this plan" (plan detail): full-width pine bar with stamped-corner hover
- "Pay & activate" (checkout): leaf-green ledger button with amount echoed in the label
- Dashboard row actions (cancel / reinstate): quiet clay / leaf text-buttons with stamp animation
- Auth submit: pine pill, full width, serif label

## Non-derivable constraints
- FAQs sourced from the PY2026 consumer eligibility/enrollment policy document
- Help center must document every customer operation; API docs page lists all endpoints
- Simulated payments only (no real processor); demo reveals reset links inline
