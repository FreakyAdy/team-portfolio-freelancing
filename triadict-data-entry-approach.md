# Triadict Studio — Data Entry Approach

**What this is:** a companion to `triadict-operational-pages-improvement-spec.md`, focused on one specific question that doc didn't answer head-on: **how should data actually get typed into this system, by one person, without it becoming a chore — and what should each entry point capture so the rest of the app (dashboard, gates, invoices, portal) has something real to work with?**

The previous doc covers page-by-page features. This one covers the forms themselves — the modals, wizards, and quick-adds where information first enters the system.

---

## Part 1 — What's wrong with the current entry pattern

Reading `PAGES.md`'s modals side by side (New Deal, New Project, Client wizard, Add Task, Record Payment, New Template), a few patterns repeat:

1. **Every form assumes a small team.** New Project has a "Team members" multi-select. Add Task has an "Assignee" select. Deal Overview has an "assigned team member" field. For one person, each of these is a dropdown you open, search your own name in, and click — every single time, on every deal, project, and task. That's pure friction with no payoff right now.
2. **Nothing is generated from anything else.** There's no documented "New Invoice" modal at all in `PAGES.md` — invoices appear to be typed from scratch (client, amount, line items) even when they clearly belong to a Deal that already has a value, a client, and (per the previous spec) a payment schedule. Same pattern risk applies to Projects: a Won deal already knows the client, the budget, the description — nothing says a New Project pre-fills from it.
3. **Every field is flat and equally weighted.** The Client wizard's Step 2 has one long list — Industry, Business Type, Project Type, Budget Range, Timeline, How they found us, Notes — with no distinction between "need this to move forward" and "nice to have later." For a fast-moving solo operator, that reads as one big form to get through before you can save, when in reality most of it can wait.
4. **Nothing reflects the actual business judgment calls.** None of the current forms have a field for service category, technical/SEO risk, or the digital-asset detail (domain age, CMS, hosting) that's specifically what makes Triadict's premium positioning real — covered in the previous doc's Part A4/D3, restated here because it's a data-entry problem as much as a data-model problem.

---

## Part 2 — The approach: capture fast now, capture fully later

Two tiers, everywhere a new record gets created:

**Quick Add** — the absolute minimum needed to create the record and move on. Used when you're on a call, replying to an email, or logging something in passing. Should take under 15 seconds.

**Full Detail** — everything else, filled in on the record's own detail page, whenever there's actually time to sit with it (after the discovery call, during scoping, etc.) — not forced upfront.

This isn't a new UI framework — it's mostly about **trimming what's required in the "New X" modals down to the true minimum**, and moving everything else to be optional fields on the detail page instead of blocking fields in the creation modal. Concretely:

| Entity | Quick Add (modal, required) | Full Detail (detail page, fill in over time) |
|---|---|---|
| Lead / Deal | Deal name, Client (existing or type-to-create new), rough value, source | Stage, priority, service category, technical/SEO risk, due date, description, payment gate checklist |
| Client | Name, one contact method (email or phone) | Company, job title, industry, business type, budget range, timeline, how found, service interest, digital assets (websites), notes |
| Project | Auto-created from a Won deal (see Part 3) — no blank "New Project" needed in the normal case | Team members *(skip — see Part 3 note)*, tasks, workstreams |
| Task | Title, which project | Description, priority, due date, tags — assignee defaults to you, not a picker |
| Invoice | Generated from a payment schedule (see Part 3) — manual only for genuine one-offs | Line-item detail, notes |
| Template | Name, type | Description, content, attachments |

The point isn't "fewer fields exist" — it's "fewer fields block you from hitting save." Everything in the right-hand column is still there, just not gatekeeping the record's creation.

---

## Part 3 — Capture once, reuse everywhere

This is the single biggest change worth making: **stop re-typing things the system already knows.**

- **New Deal → Client field:** should support typing a new client inline (name + one contact method) without leaving the modal, instead of forcing a trip to `/studio/clients` first. Most CRMs get this backwards by making Client creation a prerequisite; it should be the exception, not the gate.
- **Deal → Project handoff:** the moment a deal reaches "Won — Kickoff" (per the previous doc's Part F pipeline), a project should be *offered* (one click, not a blank form) pre-filled with: client, name (defaulted from deal name), description, budget (from deal value), service category, technical/SEO risk, and default workstreams chosen by service category (see Part 4). You're editing a pre-filled draft, not starting from zero.
- **Deal/Project → Invoice:** once a payment schedule exists on a deal or project (per the previous doc's Part C/E), invoices should generate *from* the schedule — client, amount, and due date already set, invoice type already tagged (Deposit/Milestone/Final) — rather than a blank "New Invoice" form asking you to re-enter numbers that already live on the schedule. Keep a manual "Ad-hoc invoice" option for genuine one-offs (e.g. a small out-of-scope fix), but that should be the exception path, clearly labeled, not the default one.
- **Client's digital assets → Project:** once a client has websites logged (domain, CMS, SEO sensitivity — previous doc's D3), a new project for that client should let you pick which existing website it applies to, instead of re-describing the site each time.
- **Payment recorded → Payment Gate:** recording a payment against a Deposit invoice should flip the linked deal's payment-gate checklist automatically (previous doc's D6) — not a separate manual toggle on top of the payment record.

The test for any new field going forward: **if this value already exists somewhere else in the system, this form should read it, not ask for it again.**

---

## Part 4 — Drop the multi-person fields, add the business-judgment ones

**Remove or auto-default (solo-operator cleanup):**
- "Assignee" select on tasks → defaults to you, no picker shown. If it's ever useful to reassign (e.g. you bring on a contractor for one project), that can be a small optional override on the task detail page — not a required dropdown on every single task creation.
- "Team members" multi-select on New Project → drop entirely for now, or fold into an optional "Collaborators" field on the project detail page that's empty by default.
- "Assigned team member" on Deal Overview → same treatment as tasks.

**Add (these are what actually needs to be captured to reflect the real business, per the context doc):**

*On the Deal (Full Detail, not blocking creation):*
- `service_category` — one of the 10 categories from the context doc. Drives which default workstreams a resulting project gets (see below).
- `technical_risk` / `seo_risk` — Low/Medium/High. These are explicit pricing inputs in the context doc; right now nothing captures them at all.
- Payment gate checklist — Scope Agreed / Agreement Signed / SOW Approved / Initial Payment Received (previous doc's Part C/D2).

*On the Client (Full Detail, filled in as the relationship develops — not at first contact):*
- **Digital assets / websites** — for each existing site: domain, approximate age, current CMS/platform, hosting, SEO sensitivity flag. This is the single most important addition given the studio's actual first client profile (legacy sites, protective of rankings, self-publishes on Dreamweaver). Don't ask for this on Quick Add — you won't have it from a first email. Ask for it once a discovery call has happened.
- `service_interest` — multi-select from the 10 categories, so cross-sell opportunities are visible later without re-researching the client.

*On the Project (auto-filled from the deal, editable):*
- Default workstreams by `service_category` — a plain website project keeps the current Design/Development/Content/Launch four; a Category 2 (Monthly Optimization) engagement doesn't need "Launch" at all and should default to something like Setup/Monitoring/Reporting instead; a Category 3+ (AI agent/automation) project needs its own default set (e.g. Discovery/Build/Integration/Testing). This means the "4 fixed workstream cards" from the current build shouldn't actually be fixed — they should be a sensible default for websites specifically, swapped per category.
- Approval gates (previous doc's Part C/D4) — created automatically at the same points the workstreams are.

*On the Invoice (mostly inherited, per Part 3):*
- `invoice_type` — Deposit / Milestone / Final / Recurring / Ad-hoc, inherited from the schedule it was generated from (or chosen manually for the Ad-hoc path).

*On the Template (new, per the previous doc's D7):*
- Attachments (images/PDFs), saved locally for now — genuinely additive, no dependency on anything above.

---

## Part 5 — One capture point instead of four scattered "+" buttons

The Studio Dashboard currently has four separate Quick Actions (New Deal / New Project / New Invoice / New Client), each opening its own modal. Given Part 3's "capture once" principle, three of those four stop being things you'd normally click directly:

- **New Project** — normally comes from a Won deal, not a blank dashboard button. Keep the manual option for genuine exceptions (an internal project, or a project with no sales trail), but it shouldn't be the primary path.
- **New Invoice** — normally comes from a payment schedule. Keep the manual "Ad-hoc" option, clearly secondary.
- **New Client** — still a real, common entry point (a lead arrives with no deal yet), keep as-is, Quick Add version.
- **New Deal** — still the real primary entry point for anything new coming in. Keep as-is, Quick Add version, with inline client creation per Part 3.

Net effect: the dashboard's Quick Actions become **New Deal** and **New Client** as the two fast, common actions, with Project/Invoice creation demoted to "usually happens automatically, manual option available if you go looking for it" rather than being presented as four equally-weighted buttons.

---

## Part 6 — Guardrails worth having (light, not bureaucratic)

Since this is solo-operated, these aren't approval workflows — they're just small checks so mistakes are caught by the software instead of by memory:

- A deal can't move to "Won — Kickoff" (Part F of the previous doc) without `service_category` set — otherwise the resulting project has no default workstreams to inherit.
- A project's tasks can't move to "In Progress" while the linked deal's payment gate shows `initial_payment_received = false` (previous doc's D4) — a soft warning banner is enough, not a hard block, since there could be legitimate exceptions.
- An Ad-hoc invoice (the manual exception path from Part 3) should require a one-line reason ("why isn't this from the schedule?") purely so, months later, it's obvious why that invoice doesn't match the pattern — not for anyone else's benefit, just future-you's.

---

## Part 7 — Rollout order

This is small enough to do in one pass, but if sequencing matters:

1. **Strip the multi-person fields** (assignee pickers, team-member selects) — pure subtraction, zero risk, immediate friction reduction.
2. **Split existing modals into Quick Add / Full Detail** per Part 2's table — mostly relabeling which fields are required vs. optional, not new UI.
3. **Wire the Deal → Project handoff** (Part 3) — the highest-value "stop re-typing things" change, since it's the most common handoff in the whole workflow.
4. **Add the business-judgment fields** (service category, risk, digital assets) to the relevant Full Detail pages — content addition, no new mechanics.
5. **Wire Invoice generation from payment schedules** — depends on the `payment_schedules` table from the previous doc's Part C, so naturally follows once that exists.
6. **Collapse the dashboard Quick Actions** per Part 5 — cosmetic, do last once the underlying flows actually support it.
