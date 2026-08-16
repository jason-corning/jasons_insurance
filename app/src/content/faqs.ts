// Consumer FAQs sourced from the PY2026 consumer eligibility, enrollment,
// and support policies document.

export type Faq = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

export const FAQ_CATEGORIES: string[] = [
  "Getting Started & Eligibility",
  "Shopping & Enrollment",
  "Payments & Billing",
  "Cancellation & Termination",
  "Reinstatement",
  "Special Enrollment Periods & Life Changes",
  "Documents & Verification",
  "Brokers & Assistance",
  "Taxes & Forms (1095-A)",
  "Appeals",
];

export const FAQS: Faq[] = [
  {
    id: "who-can-buy",
    category: "Getting Started & Eligibility",
    question: "Who can buy a health plan through the marketplace?",
    answer: "You can enroll in a marketplace health plan if you meet three requirements: you're a U.S. citizen, U.S. national, or lawfully present non-citizen; you're not incarcerated (unless you're being held while charges are pending); and you live in the state. These same rules apply whether or not you get financial help, and they also apply to stand-alone dental plans. If you don't have a physical address, you can apply using the address of a local shelter, social services office, or a friend or family member's home, or you can call the marketplace contact center and verbally attest that you live in the state without a physical address.",
  },
  {
    id: "non-citizen-coverage",
    category: "Getting Started & Eligibility",
    question: "I'm not a U.S. citizen. Can I get coverage?",
    answer: "Many non-citizens qualify as \"lawfully present\" and can enroll, including green card holders, refugees, people granted or applying for asylum, people with Temporary Protected Status or DACA, victims of trafficking, and many others with valid immigration statuses or work authorization. Asylum applicants qualify only if they have employment authorization or are under 14 with a pending application. If you're a lawfully present immigrant who was denied Medicaid because of your immigration status, you may qualify for marketplace financial help even if your income is below 100% of the federal poverty level. Eligibility is also determined person by person, not for the whole household: children who are U.S. citizens can qualify for coverage and financial assistance even if their parents are not eligible, as long as the household files taxes.",
  },
  {
    id: "child-on-plan-until-26",
    category: "Getting Started & Eligibility",
    question: "How long can my child stay on my plan?",
    answer: "Dependents can stay on your health plan until they turn 26, specifically through December 31 of the year they turn 26, after which they're removed and can enroll in their own plan. One important note about tax credits: when a dependent turns 24, their tax-dependent status automatically drops at the end of their birthday month, so they lose the subsidy under your application (though they can stay on the plan at full price until 26). A dependent who is 26 or older and can't enroll in their own plan because of a physical or developmental disability may remain on the household plan.",
  },
  {
    id: "qualify-financial-help",
    category: "Getting Started & Eligibility",
    question: "Do I qualify for financial help with my premiums?",
    answer: "You may qualify for a premium tax credit if your household income is generally between 100% and 400% of the federal poverty level, you file taxes as single or married filing jointly, and you aren't eligible for affordable employer coverage or government programs like Medicare or most Medicaid. If you also pick a silver plan and your income is at or below 250% of the poverty level, you can get cost-sharing reductions that lower your deductibles and copays. The application will calculate exactly what you qualify for based on your household size and projected income.",
  },
  {
    id: "oe-window",
    category: "Shopping & Enrollment",
    question: "When is Open Enrollment?",
    answer: "Open Enrollment generally runs from November 1 through January 15 each year. For 2026 coverage, it runs November 1, 2025 through January 15, 2026. Outside this window, you need a Special Enrollment Period triggered by a qualifying life event to enroll or change plans.",
  },
  {
    id: "oe-coverage-start",
    category: "Shopping & Enrollment",
    question: "When will my coverage start if I enroll during Open Enrollment, and can I still change my mind?",
    answer: "If you enroll between November 1 and December 16, your coverage starts January 1. If you enroll between December 17 and January 15, your coverage starts February 1. During Open Enrollment you can enroll, switch plans, or cancel freely until your plan is \"effectuated,\" which happens when you pay your first premium. After you've paid and your coverage is in effect, you can't change plans or add or remove a dependent unless you have a qualifying life event, such as a birth or adoption.",
  },
  {
    id: "dental-with-health-plan",
    category: "Shopping & Enrollment",
    question: "Do I have to buy dental coverage with my health plan?",
    answer: "No. Households with children aren't required to buy health plans with embedded pediatric dental or child-only dental plans. Stand-alone dental plans can also be purchased without a health plan, except when you enroll through certain enrollment-partner platforms; in that case you can buy dental separately through a certified agent, the marketplace's own portal, or another partner that offers dental.",
  },
  {
    id: "auto-renewal",
    category: "Shopping & Enrollment",
    question: "Will my plan renew automatically each year?",
    answer: "Yes, in most cases the marketplace automatically renews your coverage for the next year if you remain eligible and agreed to auto-renewal (you can opt out at any time). If you lose subsidy eligibility, you're still renewed into the same or a corresponding plan without the subsidy. If your insurer leaves the marketplace, you'll be automatically moved to a \"crosswalked\" plan with similar coverage, metal tier, and cost from another insurer. To have updated financial assistance in place for January 1, submit your updated information by December 16; after that date, changes take effect February 1.",
  },
  {
    id: "binder-payment",
    category: "Payments & Billing",
    question: "What is a binder payment and when is it due?",
    answer: "The binder payment is your first month's premium, and your coverage does not take effect until you pay it. Your insurance company sets the deadline, which must be no earlier than your coverage start date and no later than 30 calendar days after it. If you miss the deadline, your policy is cancelled and you won't be enrolled, and insurers are not allowed to grant grace periods for binder payments.",
  },
  {
    id: "premium-due-dates",
    category: "Payments & Billing",
    question: "When are my monthly premium payments due?",
    answer: "After your first (binder) payment, ongoing premiums are due by the last day of the month before each coverage month. For example, your June premium is due by May 31. If your insurer doesn't receive payment by the 30th day of the coverage month, a grace period begins.",
  },
  {
    id: "missed-payment-grace-period",
    category: "Payments & Billing",
    question: "What happens if I miss a premium payment?",
    answer: "You get a grace period before your coverage can be terminated. If you receive advance premium tax credits (APTC), your grace period is three consecutive months starting with the month of non-payment. If you don't receive APTC, the grace period is 30 days (31 days for small group plans). Note that partial payments don't extend a grace period, and the three-month grace period only applies if you're actually taking the tax credit in advance, not if you chose to claim it at tax time instead.",
  },
  {
    id: "grace-period-claims",
    category: "Payments & Billing",
    question: "Will my medical bills be covered during a grace period?",
    answer: "If you receive tax credits, your insurer must pay all appropriate claims for services in the first month of the grace period; those can never be taken back. Claims from the second and third months may be held (\"pended\"), and if your coverage is ultimately terminated for non-payment, it ends retroactively on the last day of the first grace month and those pended claims may be denied. Any premiums you paid for coverage beyond that termination date are refunded.",
  },
  {
    id: "reenroll-after-nonpayment",
    category: "Payments & Billing",
    question: "I was previously terminated for non-payment. Can I re-enroll?",
    answer: "Yes, but your insurance company may require you to arrange repayment of unpaid premiums from up to 12 months before your new policy starts. The insurer may extend your binder payment deadline while you make payments on the past-due amount, and it can terminate your new coverage if you don't complete the repayment arrangement. One helpful exception: if your grace period expires on or before December 31 and you actively re-select the same insurer's coverage during Open Enrollment for a January 1 start, the insurer generally must effectuate the new coverage under guaranteed availability rules, subject to a binder payment.",
  },
  {
    id: "cancelled-vs-terminated",
    category: "Cancellation & Termination",
    question: "What's the difference between my plan being cancelled and terminated?",
    answer: "A cancellation happens when you never make your binder (first) payment by the deadline; your plan simply never takes effect. A termination happens when you had active coverage but stopped paying premiums and your grace period ran out. Insurers must notify you in either case and report the change to the marketplace within 48 hours.",
  },
  {
    id: "how-to-cancel-coverage",
    category: "Cancellation & Termination",
    question: "How do I cancel my coverage, and when does it end?",
    answer: "You can voluntarily disenroll and choose an end date at the end of the current month, the next month, or the month after that. Coverage always ends on the last day of a month; the only exception is death, where coverage ends one day after the date of death. You can end your health plan without ending your dental plan. Note that if you move out of state, you're required to disenroll; if you report the move afterward and request retroactive disenrollment, coverage ends on the last day of the month in which you reported the move.",
  },
  {
    id: "unauthorized-enrollment",
    category: "Cancellation & Termination",
    question: "Someone enrolled me in a plan I never asked for. Can it be removed?",
    answer: "Yes. The marketplace allows retroactive cancellation for unauthorized enrollments and unauthorized plan switches. You'll generally qualify if things like these are true: you never claimed your marketplace account, you had no contact with the marketplace or insurer other than your complaint, your account shows multiple unexplained agent changes, mail was returned as undeliverable or the address on file isn't yours, or you deny enrolling even though the insurer shows claims activity. Contact the marketplace as soon as you discover the enrollment.",
  },
  {
    id: "retroactive-disenrollment-other-coverage",
    category: "Cancellation & Termination",
    question: "I have other coverage now (like a job plan or Medicaid). Can my marketplace plan be ended retroactively?",
    answer: "In limited cases, yes. If you gained Medicaid or children's health program coverage, retroactive disenrollment can go back up to 60 days before the date you report it. For Medicare overlaps, the retroactive window is at most six months from your request or the day before your Medicare started, whichever is earlier. For other duplicate coverage or general errors, retroactive disenrollment is allowed if you make the request within 14 days of the termination date you want; otherwise coverage typically ends at the end of the month you report.",
  },
  {
    id: "get-coverage-back",
    category: "Reinstatement",
    question: "My coverage was terminated. Can I get it back?",
    answer: "Start by contacting your insurance company; reinstatement requests go to them first. Insurers can reinstate coverage for non-payment situations or their own errors, as long as your termination date is within the last 90 days. If it's been more than 90 days, the insurer must submit your request to the marketplace for review and approval. Keep in mind the marketplace won't reinstate coverage without a documented error or exceptional circumstance, such as a consumer or system error, a natural disaster, or domestic abuse. If your reinstatement request is denied, that denial is a decision you can formally appeal with the marketplace.",
  },
  {
    id: "subsidy-cut-redetermination",
    category: "Reinstatement",
    question: "My subsidy was cut off during a redetermination and my plan ended. What can I do?",
    answer: "If you temporarily lose financial eligibility during a redetermination and your enrollment is terminated, act quickly: if you contact your insurance company within the same month the loss occurred, the insurer may reinstate your coverage without any gap.",
  },
  {
    id: "missed-open-enrollment",
    category: "Special Enrollment Periods & Life Changes",
    question: "I missed Open Enrollment. Can I still get coverage this year?",
    answer: "Only if you experience a qualifying life event, such as losing other health coverage, getting married, having or adopting a baby, or moving. In most cases you have 60 days from the event to report it, verify it, and enroll in a plan. Without a qualifying event, you'll need to wait for the next Open Enrollment. Also note that once you enroll through a Special Enrollment Period, it closes; you can't switch plans again until the next Open Enrollment or a new qualifying event.",
  },
  {
    id: "new-baby-coverage",
    category: "Special Enrollment Periods & Life Changes",
    question: "I just had a baby (or adopted a child). When does coverage start?",
    answer: "Birth, adoption, and court-appointed guardianship of a child all qualify you for a Special Enrollment Period, even if the child qualifies for other coverage like the children's health insurance program. For events like birth, adoption, marriage, and divorce, the new coverage is effective on the date of the event itself. Your updated tax credit is effective the first of the month of the reported event. Note that adult dependents can only be added to your plan if they have their own qualifying event.",
  },
  {
    id: "losing-job-coverage",
    category: "Special Enrollment Periods & Life Changes",
    question: "I'm losing my job-based coverage soon. When should I act?",
    answer: "You can report a known upcoming loss of coverage up to 60 days in advance, and you have 60 days after the loss as well. If you enroll before your old coverage ends, your new plan starts the first of the month after you enroll, even if the old coverage hasn't ended yet, which helps you avoid a gap. Loss of COBRA coverage, or your employer ceasing to contribute to it, also qualifies.",
  },
  {
    id: "lost-medicaid-chip",
    category: "Special Enrollment Periods & Life Changes",
    question: "I lost Medicaid or my child lost CHIP coverage. Do special rules apply?",
    answer: "Yes, the window is longer. You get a 90-day Special Enrollment Period for loss of Medicaid or children's health program coverage, and you can report the loss up to 90 days before or after it happens. If you were referred to Medicaid during Open Enrollment but denied after it ended, you get a 60-day enrollment window.",
  },
  {
    id: "sep-coverage-start",
    category: "Special Enrollment Periods & Life Changes",
    question: "When will my coverage start if I enroll through a Special Enrollment Period?",
    answer: "It depends on the event. For marriage, divorce, birth, or adoption, coverage is effective on the date of the event. For most other events, like moving, immigration status changes, or losing certain coverage, coverage starts the first of the month after the event. For exceptional circumstances like natural disasters or plan display errors, the date is set case by case. If you report multiple events at once, your plan is effective as of the earliest applicable date.",
  },
  {
    id: "non-qualifying-life-changes",
    category: "Special Enrollment Periods & Life Changes",
    question: "What life changes do NOT qualify me for a Special Enrollment Period?",
    answer: "Common examples include: voluntarily dropping your coverage, losing eligibility for a plan you were never enrolled in (e.g., losing a job whose insurance you'd declined), an income change that doesn't change your eligibility, being terminated from other coverage for non-payment or fraud, becoming pregnant (though birth does qualify), a death in the family that doesn't cause anyone to lose coverage, and losing coverage or subsidies because you didn't respond to a document request in time. Aging out of a pediatric dental plan also does not trigger a Special Enrollment Period.",
  },
  {
    id: "prove-qualifying-event",
    category: "Special Enrollment Periods & Life Changes",
    question: "Do I need to prove my qualifying life event?",
    answer: "Usually yes. The marketplace runs a verification check (called an SVI) to confirm your event, and you may be asked for documents like a coverage termination letter, marriage certificate, or divorce papers. One important exception: for domestic violence situations, the marketplace requires no proof and accepts your self-attestation. Students losing school coverage need a Certificate of Creditable Coverage, the previous year's transcripts, and a letter from the university, and can use that Special Enrollment Period once per academic year.",
  },
  {
    id: "data-matching-issue",
    category: "Documents & Verification",
    question: "I got a notice saying there's a \"data matching issue\" with my application. What does that mean?",
    answer: "It means information you provided couldn't be confirmed against electronic data sources, and the marketplace needs documents from you. You generally have 90 days from the date of the notice to submit the requested documentation. If you don't respond in time, your enrollment or financial assistance can be revoked or recalculated based on available data, after a 5-day processing window for any mailed documents. If you can't access any of the documents listed on your notice, contact the marketplace first; after an insufficient submission or a lack of acceptable documents, you may be able to submit a \"Letter of Explanation\" self-attestation form from the marketplace website instead.",
  },
  {
    id: "citizenship-documents",
    category: "Documents & Verification",
    question: "What documents prove my citizenship or immigration status?",
    answer: "A single document works if it's one of these: a U.S. passport or passport card, Certificate of Naturalization, Certificate of U.S. Citizenship, a state-enhanced driver's license or state-issued Real ID, tribal enrollment documentation, or a resident alien card. A U.S. birth certificate alone is not enough; it must be paired with a second identity document such as a driver's license, school ID, military card, or voter registration card. For immigration status, common documents include a green card (I-551), employment authorization card (I-766), I-94 record, or foreign passport.",
  },
  {
    id: "income-verification",
    category: "Documents & Verification",
    question: "What can I use to verify my income?",
    answer: "Common documents include W-2s or 1099s, recent pay stubs, your federal or state 1040 tax return, unemployment benefit letters, a self-employment ledger (Schedule C or E), bank statements showing regular deposits, Social Security benefit letters, or statements from an accountant. The marketplace also checks electronic sources like current income services, prior-year IRS data, and state labor department records. You'll be asked for documents if your reported income differs from electronic records by more than 50% or by more than $12,000.",
  },
  {
    id: "periodic-data-matching",
    category: "Documents & Verification",
    question: "Why is the marketplace asking for documents when I didn't change anything?",
    answer: "The marketplace is required to periodically re-check data for consumers receiving financial help. For example, it checks Medicare enrollment twice a year to prevent duplicate benefits. If a check finds different information, you'll get a notice and have 30 days to respond with verification. If you don't respond, your eligibility is updated using the data the marketplace found at the end of the month in which the 30-day window expires.",
  },
  {
    id: "agent-navigator-counselor",
    category: "Brokers & Assistance",
    question: "What's the difference between an agent, a navigator, and an application counselor?",
    answer: "Certified agents are state-licensed insurance professionals, certified by the marketplace and paid by commission, who can help you compare plans, advise you, and enroll you. Navigators and certified application counselors are certified to help you understand your options and fill out applications, largely in person, but they are legally prohibited from recommending a specific plan or enrolling you directly, and they must provide fair, accurate, and impartial information. All of these services are available to consumers at no cost.",
  },
  {
    id: "language-disability-help",
    category: "Brokers & Assistance",
    question: "Is help available in my language or for a disability?",
    answer: "Yes. Enrollment platforms and the marketplace contact center provide support in English and Spanish, plus a free telephone translation line covering at least 150 languages and free written translations. Accessibility support includes TTY (dial 711), large print and braille notices, help reading notices, and, for escalated needs, braille translations, video relay, and cued speech or tactile interpreters. These services are provided at no cost.",
  },
  {
    id: "form-1095a",
    category: "Taxes & Forms (1095-A)",
    question: "What is Form 1095-A and will I get one?",
    answer: "Form 1095-A is the annual Health Insurance Marketplace Statement used to file your federal taxes and reconcile any premium tax credits. The marketplace sends it to all consumers who were enrolled in a qualified health plan, after the coverage year ends. If you were enrolled only in a catastrophic plan or a dental-only plan, you will not receive a 1095-A.",
  },
  {
    id: "tax-credit-reconciliation",
    category: "Taxes & Forms (1095-A)",
    question: "Do I have to do anything at tax time if I got premium tax credits?",
    answer: "Yes. Anyone who receives advance premium tax credits is expected to reconcile their taxes each year, using the 1095-A. If it turns out you received more credit than you were eligible for (for example, your income was higher than projected, or an appeal found you ineligible), you'll be required to pay back some or all of the credit when you file your federal return.",
  },
  {
    id: "tax-credits-dental",
    category: "Taxes & Forms (1095-A)",
    question: "Can tax credits be used for dental plans?",
    answer: "Only in a limited way. Tax credits must first be applied to your health plan premium; any remaining amount can then go toward a pediatric dental plan or the pediatric portion of a stand-alone dental plan. Tax credits cannot be applied to dental premiums for anyone over age 19.",
  },
  {
    id: "appeal-deadline",
    category: "Appeals",
    question: "I disagree with my eligibility decision. How long do I have to appeal?",
    answer: "You have 90 days from the date of your Eligibility Determination Notice to file an appeal, or 95 days if the issue involves citizenship or immigration status. If you miss the deadline, you can still request an appeal and ask for a \"good cause\" extension by explaining why you missed it and providing verification.",
  },
  {
    id: "appealable-decisions",
    category: "Appeals",
    question: "What kinds of decisions can I appeal?",
    answer: "You can appeal marketplace eligibility decisions such as: being found ineligible for tax credits, cost-sharing reductions, a Special Enrollment Period, or a health/dental plan; a tax credit amount that seems wrong; a plan cancellation or termination by the marketplace; a denied reinstatement request; a coverage effective date you want changed; or an untimely determination or notice. You cannot appeal things like your insurer's claim denials (those go through the insurer's own appeal process), refund disputes with your insurer, wanting an earlier coverage end date, or owing back tax credits at tax filing.",
  },
  {
    id: "expedited-appeal",
    category: "Appeals",
    question: "Can I get a faster appeal decision in an emergency?",
    answer: "Yes. If waiting for a standard decision could seriously jeopardize your life, health, or ability to attain, maintain, or regain maximum function, for example if you're hospitalized or urgently need medication, you can request an expedited appeal. Indicate the expedited request and your explanation directly on the appeal request form.",
  },
  {
    id: "coverage-during-appeal",
    category: "Appeals",
    question: "Will I keep my coverage while my appeal is pending?",
    answer: "Yes, you can continue receiving your health coverage, tax credits, and cost-sharing reductions as currently determined while your appeal is in progress. Be aware, though, that if the appeal decides you weren't eligible for the full amount of tax credit you received during the appeal, you may be responsible for those costs, including repayment through your federal tax return.",
  },
  {
    id: "file-appeal-and-dismissal",
    category: "Appeals",
    question: "How do I file an appeal, and what if my appeal gets dismissed?",
    answer: "Submit a completed Consumer Appeal Request Form through your enrollment partner account, your certified agent, a navigator or application counselor, the consumer portal, or by mail to the marketplace contact center. You may represent yourself or appoint an authorized representative, such as a friend, relative, attorney, agent, navigator, counselor, or other trusted person, by signing and submitting the authorization documentation. An appeal can be dismissed if you withdraw it, fail to appear at a scheduled hearing without good cause, or pass away (though an estate representative can continue it). If your appeal is dismissed, you have 30 days from the dismissal notice to submit a written good-cause request to have the dismissal vacated.",
  },
];
