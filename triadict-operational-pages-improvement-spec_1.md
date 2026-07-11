# Triadict Studio — Operational Pages Improvement Spec

**Scope of this document:** Studio Dashboard, Deals, Clients, Projects, Invoices, Payments, Templates, Knowledge Base, Settings, and the entire Client Portal (Dashboard, Project, Invoices, Support). This is the "how the studio actually runs" half of the app — not the marketing site, not auth.

**Excluded on purpose:** `/` marketing page, `/auth/*`. They're noted only where they leak into the operational side (e.g. pricing numbers that invoices inherit).

**How to use this:** It's written so you — or an agentic coding tool — can work through it one section at a time. Each recommendation names the page, states the gap, and states the concrete change. Part C is the shared data model — read it first, since most page-level recommendations depend on fields defined there.

**Current build constraints (read before implementing anything below):**
- **Solo-operated.** Triadict is currently run by one person. Ignore any "team" framing in this doc or the source docs where it implies role separation, approval-by-someone-else, or multi-person hand-offs — anywhere a recommendation says "a team member confirms X" or similar, read that as "you confirm X." Nothing below requires multiple user accounts or role permissions to work.
- **No Supabase connected yet.** It's coming later. Every schema addition in Part C is the *target shape* for once it's wired up — not a requirement to have a live DB now. Build and wire up the actual page/flow logic now against local or mock data, the same way the app already handles demo auth (`localStorage`, hardcoded fixtures). When Supabase is connected, these shapes map straight in; nothing in this doc needs to be redesigned for that later, just re-pointed at real tables.
- **Real authentication is deferred.** Keep using the existing demo-mode login for now. Don't build real auth as part of any of this.
- **Real payment processing is deferred.** Stripe/live checkout comes later. Payments stay exactly as they work today — manually recorded (the existing Record Payment modal) — even where a recommendation below talks about payment schedules or gates. Those are about *tracking and status*, not about actually moving money yet. This is called out again inline wherever it's relevant (D6, D9, D12).
- **Exception — Templates page image/PDF uploads (new, below in D7) don't need to wait.** They can be saved locally now (no Supabase required) and migrated to real file storage later.

---

## Part A — Things that are just wrong, not just missing

These aren't "nice to have" improvements — they're places where the current build (per `PAGES.md`) contradicts the actual business (per the context doc), or contradicts itself.

| # | Issue | Where | Fix |
|---|---|---|---|
| A1 | Deal pipeline has no gate for **payment before production**. The context doc is explicit: *"No production work should begin before: scope is agreed, agreement is signed, SOW is approved, required initial payment is received."* The current 14 stages go `Signed → Won → Kickoff Scheduled → In Progress` with no stage that represents "signed but unpaid," so nothing stops a deal from being marked Won/Kickoff before money has moved. | Deals pipeline | See Part F — pipeline realignment. |
| A2 | There is no **Statement of Work** as its own object. The real workflow lists Agreement, Statement of Work, and Invoice as three separate deliverables at the closing stage. The current Deal Detail only has Proposals and Contracts tabs — SOW has nowhere to live. | Deal Detail | Add SOW as either a third document type in Contracts, or its own tab (recommended — see Part D). |
| A3 | Invoices are flat, single documents. The business's own payment terms are **installment-based** (50/50 or 40/30/30), but there's no data model for a payment schedule — each invoice is independent with no relationship to a plan. | Invoices, Deal Finance tab | Add `payment_schedules` (Part C) and generate invoices from it. |
| A4 | Client intake ("2-step wizard") doesn't capture the two things that actually differentiate Triadict's premium positioning: **existing digital assets** (domain age, current CMS, SEO sensitivity) and **which of the 10 service categories** the lead is interested in. Right now it just captures generic CRM fields (industry, budget range, timeline) that any template CRM would have. | Client intake | Add fields — see Part D, Clients. |
| A5 | "Total Invested" on the Portal Dashboard and "Value" on Client Detail are single blended numbers. The business model depends on separating **one-time project revenue** from **monthly recurring revenue (MRR)** — that's the whole "website → systems → recurring relationship" thesis in the context doc. A single lifetime total hides whether a client is actually becoming a recurring relationship. | Portal Dashboard, Client Detail | Split into one-time vs. recurring — see Part C/D. |
| A6 | Login password field is `type="text"`, not `type="password"` — this is fine for now since it's demo-mode and real authentication is already planned for later, not an active problem. Flagged only so it isn't forgotten once real auth work starts. | Auth (adjacent) | No action needed now — resolves naturally when real auth is built. |
| A7 | The 6 Studio Dashboard metric "change" values (+12%, +8%, +25%, etc.) are cosmetic — there's no month-over-month comparison logic implied anywhere else in the spec (no historical snapshots table). Either build the comparison for real or don't imply false precision. | Studio Dashboard | See Part C — needs a `metrics_snapshots` table or the deltas should be removed. |
| A8 | Marketing-page pricing (`$800` Single / `$1,500` Suite) is the *old* positioning. The context doc's realistic direction starts at `$2,000–$5,000` for a standard custom site and goes up from there. This matters here because **Templates → "Monthly Invoice" default template and any invoice line-item defaults should not be seeded with $800/$1,500 assumptions.** Out of scope to redesign the marketing page itself, but flag it so invoice/proposal templates aren't quietly anchored to abandoned pricing. | Templates, Invoices (seed data only) | Re-seed default template line items against the pricing table in Part B, not the marketing page. |

---

## Part B — Business context, condensed to what these pages need to know

Full detail lives in the context doc; this is the subset that should actually influence UI and data model decisions.

### B1. Who the client actually is
Triadict is early-stage (solo-operated for now, no recurring revenue yet, first serious international lead). The flagship prospect — Eve Olasov — is the template for the kind of client this system needs to handle well: an established operator with **multiple legacy websites** (~23–25 years old domains), strong existing SEO equity she is protective of, technical enough to fix her own Core Web Vitals issues, and evaluating **three separate projects** under one relationship, with varying creative freedom and varying SEO risk per project. The app's data model should assume "one client, multiple websites, multiple projects, mixed risk levels" as the normal case — not "one client, one website."

### B2. Service categories (10) — deals, invoices, and clients all need to reference these
| # | Category | Typical pricing |
|---|---|---|
| 1 | Websites & web engineering (custom, redesign, legacy modernization, SEO-sensitive redesign/migration, landing pages, CWV/performance, custom dashboards/apps) | $800 (landing page) – $25,000+ (custom app) |
| 2 | Monthly website optimization (Care / Performance & SEO Protection / Continuous Optimization / Growth Partnership) | $250–$4,000+/mo |
| 3 | AI website agents & chatbots | $1,000–$15,000+ setup, $200–$4,000+/mo |
| 4 | AI email systems | $1,500–$15,000+ setup, $300–$3,000+/mo |
| 5 | Lead response & qualification systems | $2,000–$20,000+ setup, $300–$5,000+/mo |
| 6 | CRM & workflow automation | $1,000–$25,000+ setup, $200–$1,500/mo |
| 7 | WhatsApp/SMS automation | $1,000–$20,000+ setup, $200–$5,000+/mo |
| 8 | Appointment & follow-up systems | $1,000–$7,000 setup, $200–$1,500/mo |
| 9 | Internal AI knowledge systems | $3,000–$50,000+ |
| 10 | Custom business dashboards | $2,500–$40,000+, $300–$2,000+/mo hosting/support |

Current priority order (this should drive what the Deals filter/sort defaults to, and what Knowledge Base articles exist): **1 → website redesigns → SEO-sensitive redesigns → legacy modernization → monthly optimization** now; lead-response/CRM/AI agents/email automation next stage; advanced AI/internal knowledge/complex platforms later stage. Triadict explicitly does not want to sell everything at once — the app shouldn't present all 10 categories as equally "active" in current-stage views.

### B3. The real agency workflow (33 steps, condensed to what matters for pipeline design)

```
FIND LEADS → RESEARCH & QUALIFY → PERSONALIZED OUTREACH → FOLLOW-UP → REPLY
  → QUALIFY OPPORTUNITY → SCHEDULE DISCOVERY → DISCOVERY MEETING
  → DOCUMENT REQUIREMENTS → DISCUSS COMMERCIAL EXPECTATIONS → INTERNAL SCOPE REVIEW
  → CREATE SCOPE → CREATE PROPOSAL → NEGOTIATION → AGREEMENT → STATEMENT OF WORK
  → INVOICE → INITIAL PAYMENT → CLIENT ONBOARDING → KICKOFF → PROJECT DELIVERY
  → APPROVAL GATES → INTERNAL QA → CLIENT REVIEW → FINAL APPROVAL → FINAL PAYMENT
  → LAUNCH → POST-LAUNCH MONITORING → HANDOVER → FEEDBACK & TESTIMONIAL
  → MONTHLY RECURRING SERVICE → ADDITIONAL SYSTEMS & SERVICES → REFERRALS & EXPANSION
```

This single sequence spans **Deals** (up through Initial Payment), **Projects** (Client Onboarding through Handover), and **Clients/Recurring** (Feedback through Referrals). No single page currently models the full thing — that's fine, it shouldn't be one page — but every step needs to live *somewhere*, and right now several don't live anywhere (SOW, Approval Gates, Internal QA vs. Client Review as distinct steps, Post-Launch Monitoring, Handover, Testimonial capture).

### B4. Hard rules that should be enforced, not just documented
- **Payment gate:** no project may enter active production status until scope + agreement + SOW + initial payment all exist. This should be a checked condition in the UI, not tribal knowledge.
- **No unlimited anything on recurring plans:** every monthly service has a fixed scope, defined capacity, a request limit, a turnaround time, and explicit exclusions. Any "Care Plan" / "Growth Partnership" feature must show remaining capacity, not just "active/inactive."
- **Payment split:** smaller projects = 50% upfront / 50% before launch. Larger/higher-risk = 40% upfront / 30% at milestone / 30% before launch or handover. This is a real, reusable payment-schedule template, not a one-off note per invoice.
- **Fewer, better clients:** the goal is the smallest list of highest-value prospects, not lead volume. Dashboard metrics should reward pipeline *value* and *quality*, not raw counts.

---

## Part C — Shared data model additions

These aren't page features by themselves — they're the fields/tables that the Part D recommendations depend on. Written as plain schema intent, describing the target shape for **once Supabase is connected**. Until then, back these with local/mock data (same pattern as the existing demo auth) so the UI and flows can be built and used now — no need to wait for the real database to start implementing Part D.

| Entity | New field/table | Purpose |
|---|---|---|
| `deals` | `service_category` (enum, one of the 10 categories) | Lets every dashboard/report split pipeline by category instead of one undifferentiated list. |
| `deals` | `technical_risk` (Low/Medium/High) + `seo_risk` (Low/Medium/High) | Context doc lists these as explicit pricing/scoping inputs, separate from `priority`. |
| `deals` | `payment_gate_status` (Scope Agreed / Agreement Signed / SOW Approved / Initial Payment Received — each a boolean or timestamp) | Backing data for the payment-gate enforcement in B4/A1. |
| `clients` | `websites` (new child table: domain, approx. domain age, current CMS/platform, hosting, SEO sensitivity, notes) | Models "one client, multiple legacy websites" (B1) instead of assuming one site per client. |
| `clients` | `service_interest` (multi-select, the 10 categories) | Captured at intake, used for cross-sell prompts later. |
| `clients` | `lifetime_value_one_time`, `lifetime_value_recurring` (computed) | Replaces the single blended "Total Value" / "Total Invested" figure (A5). |
| `clients` | `active_plan_id` (nullable FK to a new `retainer_plans` table) | So a client can be "on" a Care/Growth Partnership plan or not. |
| new table | `retainer_plans` (client_id, tier name, monthly_amount, request_limit, requests_used_this_cycle, turnaround_sla, exclusions, renewal_date) | Backs B4's "no unlimited work" rule and Portal Support's capacity display. |
| new table | `payment_schedules` (deal_id or project_id, split type — 50/50 or 40/30/30 or custom, installment list: label, % or amount, trigger condition, linked invoice_id once generated) | Backs A3 — installment-based invoicing instead of flat one-off invoices. |
| `invoices` | `invoice_type` (Deposit / Milestone / Final / Recurring / Ad-hoc) | Distinguishes what an invoice is *for*, needed once schedules exist. |
| `invoices` | `service_category` (inherited from linked deal/project) | For revenue-by-category reporting. |
| `projects` | `approval_gates` (new child table: gate name, status — Pending/Client Review/Approved/Changes Requested, approved_by, approved_at, comment) | Backs the Approval Gates / Client Review / Final Approval steps in B3, and gives the Portal something real to show clients. |
| `projects` | `status` enum expanded (see Part D — Projects) | Current 7 statuses collapse "Internal QA" and "Client Review" into one "Review" bucket; the real workflow treats them as distinct. |
| new table | `testimonials` (project_id, client_id, quote, permission_to_publish boolean, collected_at) | Backs Feedback & Testimonial step (B3) — also the eventual bridge to the marketing page's testimonials section, without touching that page now. |
| new table | `template_attachments` (template_id, file_type — image/pdf, file_name, file_size, local_path or blob reference, uploaded_at) | Backs D7's image/PDF upload feature. **This one doesn't wait for Supabase** — it's stored locally now (local path/blob), with `local_path` swapped for a real storage URL once Supabase Storage is connected. |
| new table | `metrics_snapshots` (date, metric name, value) | Only needed if the Studio Dashboard's "+12% from last month" deltas are to be real (A7). If not built, remove the deltas instead of faking them. |

---

## Part D — Page-by-page recommendations

### D1. Studio Dashboard (`/studio/dashboard`)

**Current:** 6 generic metric cards (Active Deals, Revenue, Projects, Clients, Tasks Due, Completion Rate) with cosmetic % deltas; 4 panels (Deals Pipeline, Active Projects, Tasks Due Today, Recent Activity).

**Gaps vs. context:** Nothing here reflects "fewer, better clients" or the payment-gate rule. A studio this early-stage needs to see risk and quality, not vanity counts.

**Recommended changes:**
- Replace/augment "Active Deals" (count) with **Pipeline Value** (sum of open deal values) and **Avg. Deal Size** trend — count alone rewards volume, which the business explicitly doesn't want.
- Add a **Payment Gate Alerts** panel: any deal/project sitting in "Won"/"Kickoff"/"In Progress" without `payment_gate_status.initial_payment_received = true`. This is the single highest-leverage addition — it operationalizes the "no production before payment" rule instead of leaving it as a written policy nobody checks.
- Add an **MRR** metric card once `retainer_plans` exists — even at $0 today, having the card ready matters, since the whole business thesis is that MRR becomes the second engine.
- Either wire up real historical deltas via `metrics_snapshots`, or drop the "+X% from last month" language until they're real.
- Break "Deals Pipeline" panel down by `service_category` if more than one category has active deals — otherwise leave as-is while there's realistically one active category (websites).

### D2. Deals (`/studio/deals`, `/studio/deals/[id]`)

**Current:** 14 generic sales-CRM stages; New Deal modal has name/client/value/stage/priority/due date/description; Deal Detail has 8 tabs (Overview, Contacts, Activity, Proposals, Contracts, Files, Finance, History).

**Gaps:** No SOW object, no payment gate, no service category, no risk fields — see A1–A2, C.

**Recommended changes:**
- Realign the 14 stages to the real workflow — full mapping in **Part F**.
- Add `service_category`, `technical_risk`, `seo_risk` to the New Deal modal and Overview tab.
- Add a **Statement of Work** section — either a third document type inside the existing Contracts tab (fastest to ship) or a dedicated tab if SOW content is meaningfully different from a contract (more correct long-term, since the workflow treats them as separate deliverables with separate approval).
- Add a **Payment Gate checklist** to the Overview tab: Scope Agreed / Agreement Signed / SOW Approved / Initial Payment Received, each togglable with a timestamp + who confirmed it. This is what the Studio Dashboard alert in D1 reads from.
- Finance tab: once `payment_schedules` exists, let a deal generate a schedule (50/50 or 40/30/30 or custom) instead of ad-hoc invoices — see D5.

### D3. Clients (`/studio/clients`, `/studio/clients/[id]`)

**Current:** 2-step intake wizard (Contact Details, Business Details); list/grid with type badges; Client Detail has Overview/Projects/Activity/Settings tabs and a "Total Projects / Active Projects / Total Value" quick-stats sidebar.

**Gaps:** No digital-asset modeling, no service-interest capture, no LTV split — see A4, A5, B1.

**Recommended changes:**
- **Intake wizard:** add a Step 3 (or fold into Step 2) for **existing digital presence** — number of existing websites, and for each: domain, approximate age, current CMS/platform (this is where "HTML5 and Dreamweaver" type detail belongs), hosting, and an SEO-sensitivity flag (Low/Medium/High). This is the single most on-brand addition given Eve's profile is the studio's reference case.
- Add **service interest** as a multi-select from the 10 categories in Step 2.
- Client Detail → Overview: add a **Websites** panel listing each domain with its risk flag, sitting alongside the existing Client Details / Business Information / Projects / Contact Details panels.
- Client Detail → sidebar Quick Stats: split "Total Value" into **One-time revenue to date** and **Monthly recurring (MRR)**, plus show `retainer_plans` status if the client is on an active plan (tier name, renewal date).
- Consider a 6th tab, **Recurring**, once `retainer_plans` exists — plan tier, capacity used this cycle, renewal date, upgrade/downgrade history. Only worth building once there's at least one real retainer client; until then this is a placeholder tab, not urgent.

### D4. Projects (`/studio/projects`, `/studio/projects/[id]`)

**Current:** 7 statuses (Planning, In Progress, Review, Completed, On Hold, Cancelled, Archived); Project Detail has Overview + Tasks tabs; 4 fixed workstreams (Design, Development, Content, Launch) surfaced on the Portal side too.

**Gaps:** "Review" collapses two distinct real-workflow steps (Internal QA and Client Review) into one bucket, and there's no explicit Approval Gate / Final Approval / Post-Launch Monitoring / Handover modeling — see B3, C.

**Recommended changes:**
- Split **Review** into **Internal QA** and **Client Review** as distinct statuses — they have different audiences (internal vs. client-facing) and the client-facing Portal should only ever show "Client Review," never "Internal QA."
- Add **Post-Launch Monitoring** as a status usable when a project has shipped but the client is on (or being offered) a Care/Optimization plan — this is where B2's Category 2 services actually get delivered from, and right now there's no home for that work once a project is nominally "Completed."
- Add the `approval_gates` child entity from Part C, surfaced as a checklist on the Overview tab (e.g. "Design approved," "Dev approved," "Final approval") — each gate should be clickable by the client from the Portal (see D10), not just internally.
- Add a **Handover** panel/checklist on Overview once a project reaches Launch — matches the marketing site's own promise of "handoff docs included," and gives Files tab a clear purpose at project close.
- Gate the Tasks tab's Kanban: a task shouldn't be movable into "In Progress" if the linked deal's `payment_gate_status.initial_payment_received` is false. Even a soft warning banner ("Initial payment not yet recorded for this project") is enough to operationalize the rule from B4.

### D5. Invoices (`/studio/invoices`, `/studio/invoices/[id]`)

**Current:** 5 statuses (Draft, Sent, Paid, Overdue, Cancelled); grid view; Invoice Detail has 4 tabs (Invoice Details, Activity, Payments, Preview).

**Gaps:** No installment/schedule model, no invoice type, no service category — see A3, C.

**Recommended changes:**
- Add `invoice_type` (Deposit / Milestone / Final / Recurring / Ad-hoc) — shown as a badge next to the status badge.
- Add the ability to **generate an invoice from a `payment_schedule`** — when a deal's schedule is set (50/50 or 40/30/30), each installment becomes a linked draft invoice automatically, rather than someone manually re-typing the split into a new invoice each time.
- Invoice Detail → Invoice Details tab: if the invoice belongs to a schedule, show the other installments in that schedule (paid/pending/upcoming) so nobody has to go hunting in the Deal's Finance tab to see the full picture.
- Add `service_category` to invoices (inherited) purely for reporting — lets Studio Dashboard eventually show revenue by category.
- Recurring invoices (for retainer clients, once `retainer_plans` exists): auto-generate monthly on the renewal date, type = Recurring, pre-filled from the plan's fixed scope — this is what actually makes "$250–$4,000+/mo" services operationally real instead of a pricing-page promise.

### D6. Payments (`/studio/payments`)

**Current:** 4 summary cards (Total Received, Pending, Failed, This Month); payment list with Full/Partial badges.

**Gaps:** No capacity/plan linkage, no payment-gate feed.

**Recommended changes:**
- Add a **This Month — Recurring vs. One-time** split to the summary cards once `retainer_plans` exists — same one-time/recurring separation as D3/D5, applied at the aggregate level.
- When a payment against a Deposit/Milestone invoice is recorded, automatically flip the relevant `payment_gate_status` field on the linked deal — this is what actually closes the loop from D2's checklist and D1's alert panel, so you don't have to manually toggle both places.
- **Real payment processing is deferred** — this page keeps working exactly as it does today: payments are recorded manually via the existing Record Payment modal, not captured live through a gateway. The two changes above are about what happens once a payment is *recorded* (by hand), not about wiring up Stripe. Live checkout is future work, not part of this pass.

### D7. Templates (`/studio/templates`)

**Current:** 6 types (Proposal, Contract, Email, Invoice, Brief, Agreement), 6 default templates.

**Gaps:** Missing document types the real workflow actually uses — see A2, A8.

**Recommended changes:**
- **Add image and PDF attachments to templates, saved locally.** Right now a template is just Name/Type/Description/Status/Content (a single textarea). Add an **Attachments** section to the New/Edit Template modal — a drag-and-drop zone (matching the pattern already used on the Deal Detail Files tab) that accepts images (`.png`/`.jpg`/`.webp`) and PDFs, with a list underneath showing filename, file size, an image thumbnail or PDF icon, and download/remove actions. Since there's no Supabase yet, save these **locally** for now (e.g. written to a local uploads directory via a Next.js API route, or held as local blobs/IndexedDB — whichever is simplest given the current stack) rather than any cloud storage bucket; move to real file storage later without changing the UI. This is genuinely useful now: attach a letterhead/logo image to Invoice templates, attach a signed reference PDF to Contract/Agreement/SOW templates, attach brand assets to Proposal templates. Template list/grid cards should show a small thumbnail or file-count badge when attachments exist.
- Add **Statement of Work** as a 7th template type (distinct from Contract/Agreement — see D2).
- Add **Monthly Report** — for retainer clients, a recurring deliverable (what the context doc's Category 2/9 services imply clients should receive: uptime/CWV summary, what was done this cycle, capacity used).
- Add **Case Study** — feeds the eventual testimonial/case-study loop (C's `testimonials` table) without needing to touch the marketing page now.
- Re-seed default line-item amounts against the Part B2 pricing table, not the old $800/$1,500 marketing figures (A8).

### D8. Knowledge Base (`/studio/knowledge`)

**Current:** 6 generic articles (Getting Started, Design Workflow, PM Best Practices, SEO Checklist, Client Communication, Tech Stack).

**Gaps:** Nothing here encodes the studio's actual, fairly unusual playbook — wide pricing ranges that depend on judgment calls, legacy-site handling, and a strict payment-gate rule that's easy to forget under client pressure.

**Recommended changes — add these articles:**
- **Pricing & Scoping Guide** — turns Part B2's wide ranges ($800–$25,000+ for websites alone) into an actual internal reference for what pushes a quote up or down (pages, integrations, migration complexity, SEO risk, responsibility accepted).
- **Discovery Call & Qualification Framework** — the "research, don't mass cold-email" philosophy from the context doc is a real differentiator; it should be written down, not tribal knowledge held by whoever landed the Eve lead.
- **Legacy Website / SEO-Safe Migration Playbook** — directly serves the flagship client profile (23–25 year old domains, protective of rankings).
- **Payment Gate Policy** — one page stating the B4 rule plainly, linked from the Deal Detail payment-gate checklist itself.
- **Retainer Plan Operating Rules** — what "no unlimited work" means in practice per tier, so whoever's fulfilling Care/Growth Partnership work has a fixed reference instead of negotiating scope ad hoc each time.

### D9. Settings → Integrations (`/studio/settings`)

**Current:** Stripe, Google Analytics, Slack, Zapier, Calendly.

**Gaps:** Nothing here supports the SEO/performance monitoring services the studio wants to sell, and nothing connects the existing lead-gen/outreach tool to this CRM.

**Recommended changes:**
- Add **Google Search Console** — directly needed for the Category 2 "technical SEO monitoring, Search Console review" service to be deliverable at all.
- Add an **uptime/performance monitor** (e.g. a CWV/uptime API) — same reasoning, backs "uptime monitoring," "Core Web Vitals monitoring," "performance regression detection."
- Add the studio's own **lead-generation/outreach system** as an integration (even if custom/internal) so qualified leads can flow into `/studio/deals` instead of being re-entered by hand — the context doc says this system already exists and works, it's just not connected to the CRM per anything in `PAGES.md`.
- Leave **Stripe** exactly as it's currently shown (connect/disconnect status badge, no live functionality behind it) — real payment processing is deferred, so there's nothing to wire up here yet.

### D10. Portal Dashboard (`/portal/dashboard`)

**Current:** 4 metric cards (Active Projects, Pending Invoices, Support Tickets, Total Invested); Recent Activity + Upcoming Milestones panels.

**Gaps:** "Total Invested" is a blended number — see A5.

**Recommended changes:**
- Split **Total Invested** into **Project investment (one-time)** and **Monthly plan (if active)** — a client on a Growth Partnership plan should see that as a distinct, ongoing line, not folded into a lifetime total.
- If the client has an active `retainer_plans` row, show it as a 5th card or a small strip: plan name, renewal date, capacity used this cycle — sets up the Portal Support capacity display in D13 and makes the recurring relationship visible to the client, reinforcing the value of staying on a plan.

### D11. Portal Project (`/portal/project`)

**Current:** 4 workstream cards (Design/Dev/Content/Launch) with status only; overall progress bar; filterable task list; activity feed.

**Gaps:** The client has no way to actually *do* the "Client Review" / "Final Approval" steps from B3 — they can only watch status change, not approve anything, even though approval is explicitly part of the real workflow and part of what "no surprises" is supposed to mean to the client.

**Recommended changes:**
- Surface the `approval_gates` entity (Part C) here: when a gate reaches "Client Review" status, show an **Approve / Request Changes** action on the relevant workstream card, with a comment field. This is the highest-value single addition to the Portal — it turns "client review" from an email exchange into something the system actually tracks, and it's the client-facing half of D4's internal gate tracking.
- Once a project reaches Launch, show a **Handover** panel (matches D4) — link to handoff docs, mirrors the "Handoff docs included" promise made on the marketing site.

### D12. Portal Invoices (`/portal/invoices`)

**Current:** Flat invoice list (Paid/Pending/Overdue) + Pay Now + preview panel.

**Gaps:** No visibility into a payment schedule — see A3.

**Recommended changes:**
- If the client's project has a `payment_schedule`, show it as a small timeline above the invoice list (e.g. "Deposit — Paid · Milestone — Due Aug 1 · Final — Not yet due") so the client can see the whole arc instead of only whichever invoices have been issued so far. This is a trust-building, "no surprises" feature that directly supports the studio's own positioning language.
- The existing "Pay Now" button stays as-is (opens whatever manual/placeholder flow it currently opens) until real payment processing is added — this section is only about making the schedule *visible*, not about taking a live payment yet.

### D13. Portal Support (`/portal/support`)

**Current:** 4-question FAQ + contact form (Name/Email/Phone/Message) + contact info card.

**Gaps:** No connection to retainer capacity — the "no unlimited support" rule (B4) is invisible to the client, which risks scope creep on exactly the plans the studio doesn't want to give away for free.

**Recommended changes:**
- If the client has an active `retainer_plans` row, show **capacity used this cycle** (e.g. "3 of 5 requests used — resets Aug 1") above the contact form, and turn submitted messages into tracked tickets with status (Open/In Progress/Resolved) rather than a fire-and-forget contact form. This is what makes the request-limit rule real to the client instead of just a line in a contract they signed once.
- Keep the FAQ as-is; it's fine.

---

## Part E — New concepts this introduces (summary)

Four ideas recur across the recommendations above and are worth naming explicitly since they'll likely become their own small features rather than one-line additions to existing pages:

1. **Payment Gate** — a checklist (Scope / Agreement / SOW / Initial Payment) that blocks production and is visible on the Deal, the Project, and as a Studio Dashboard alert.
2. **Payment Schedule** — an installment plan (50/50 or 40/30/30 or custom) that generates linked invoices and is visible to the client as a timeline, not just a list of whatever invoices happen to exist.
3. **Approval Gate** — a client-actionable checklist item (not just an internal status) that lets the client Approve / Request Changes on a workstream from the Portal.
4. **Retainer Plan** — a client-level subscription record (tier, monthly amount, capacity, request limit, renewal date) that Client Detail, Portal Dashboard, and Portal Support all read from, operationalizing the "no unlimited work" rule everywhere it matters.

None of these require a new top-level nav item — they slot into existing pages as described in Part D.

---

## Part F — Recommended deal-pipeline realignment

The current 14 stages are a generic SaaS-CRM pipeline. Recommended replacement, mapped to the real workflow from B3:

| # | Current stage | → | Recommended stage | Maps to real workflow step(s) |
|---|---|---|---|---|
| 0 | Lead | → | Lead | Find Leads |
| 1 | Contacted | → | Researching | Research & Qualify |
| 2 | Qualified | → | Outreach Sent | Personalized Outreach, Follow-Up |
| 3 | Proposal Sent | → | Engaged | Reply, Qualify Opportunity |
| 4 | Negotiation | → | Discovery Scheduled | Schedule Discovery |
| 5 | Verbal Commit | → | Discovery Completed | Discovery Meeting, Document Requirements, Discuss Commercial Expectations |
| 6 | Contract Sent | → | Scoping | Internal Scope Review, Create Scope |
| 7 | Awaiting Signature | → | Proposal Sent | Create Proposal |
| 8 | Signed | → | Negotiation | Negotiation |
| 9 | Won | → | Agreement Sent | Agreement, Statement of Work |
| 10 | Kickoff Scheduled | → | **Awaiting Initial Payment** *(new gate stage)* | Invoice, Initial Payment |
| 11 | In Progress | → | Won — Kickoff | Client Onboarding, Kickoff |
| 12 | Delivered | → | *(retire — becomes a Project status, not a Deal stage)* | Project Delivery onward |
| 13 | Lost | → | Lost | — |
| 14 | Cancelled | → | Cancelled | — |

Net effect: same 14-slot pipeline UI, but stage 10 becomes an explicit payment gate instead of jumping straight to kickoff, and "Delivered" moves out of the Deals pipeline entirely — delivery status belongs to the Project (Part D4), not the Deal, once a deal has converted. A deal's job ends at "Won — Kickoff"; everything after that is Project Detail's job.

---

## Part G — Priority roadmap

**P0 — do first (small, high-leverage, mostly UI on existing/local data — none of this needs Supabase):**
- A1/A2/D2: Payment gate checklist on Deal Overview + Studio Dashboard alert panel (D1).
- D11: Client-actionable approval on Portal Project workstreams.
- D3: Add digital-asset (websites) capture to client intake — directly relevant to the live Eve Olasov opportunity right now.
- D7: Image/PDF attachment upload on Templates, saved locally.
- Part F: pipeline stage relabeling.

**P1 — next (needs new tables, but scoped and clearly valuable):**
- C: `payment_schedules` + D5/D12 installment-based invoicing and client-facing timeline.
- C: `approval_gates` full implementation (backing D4/D11).
- D8: Knowledge Base additions (pure content, no schema work, but genuinely useful now).
- D7: Template type additions (SOW, Monthly Report, Case Study).

**P2 — later (only worth building once there's a real recurring client):**
- C: `retainer_plans` and everything downstream of it (D3 Recurring tab, D6 recurring payment split, D10 plan card, D13 capacity display).
- C: `testimonials` table.
- D9: Search Console / uptime monitor / lead-gen integration.
- A7/C: `metrics_snapshots` for real dashboard deltas.

**Note on all three tiers:** everything above can be built now against local/mock data, the same way the app already fakes auth — none of it is blocked on Supabase being connected. The one real exception is **live payment processing** (actually taking a card payment), which stays deferred everywhere it's mentioned (D6, D9, D12) regardless of tier, until that's added separately.

---

## Part H — Open questions to resolve before implementing

1. **SOW as a tab vs. a document type inside Contracts** — depends on whether Statements of Work will meaningfully differ in structure from Contracts/Agreements in practice, or whether they're close enough to share one UI with a type toggle.
2. **How the payment gate gets confirmed** — should marking "Initial Payment Received" be automatic (triggered by Payments, per D6) or require a manual confirm-click as a second check? Given the business explicitly cares about not starting work unpaid, a manual confirm-step might be the safer default even if slightly more friction — and since it's solo-operated, that friction is just you double-checking yourself, not a hand-off.
3. **Retainer plan tiers** — Part B2 gives ranges ($250–$500, $500–$1,000, $1,000–$2,000, $2,000–$4,000+), not fixed tiers. Worth deciding actual fixed tier names/prices before building `retainer_plans`, or the table risks being built around numbers that get renegotiated per client anyway.
4. **Marketing-page pricing reconciliation** — out of scope for this doc, but D5/D7 both assume invoice/template defaults should follow Part B2, not the current marketing page. That should get updated separately so the two don't drift further apart.
5. **Where local template attachments actually live** — a local uploads folder written to via a Next.js API route is the simplest option and survives page refreshes; browser-only storage (IndexedDB) works too but won't be visible outside that browser. Worth picking one before building D7's upload UI, since it affects how `template_attachments.local_path` gets populated — but it doesn't block starting on the UI itself.
