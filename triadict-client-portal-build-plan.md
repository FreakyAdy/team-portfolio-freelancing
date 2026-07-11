# Triadict Studio — Client Portal Build Plan

**Correcting the assumption from the earlier docs:** those treated the Portal (`/portal/*`) as already built and just needing improvements. That's wrong — what you actually have right now is your side (the client dashboard, `/studio/*`, which you're already using), and **the Portal doesn't exist yet.** This doc plans building it, not improving it.

Read the earlier docs' Portal sections (`triadict-operational-pages-improvement-spec.md` Parts D10–D13, and `triadict-shared-workspace-plan.md` in full) as **the target feature list for this build**, not as incremental tweaks to something running. This doc is about sequencing and one requirement you called out specifically: **you, the dev, need to be able to see exactly what a client sees — without needing a separate client login to do it.**

---

## Part 1 — The one requirement that shapes everything else

You have one account, one login, one dashboard right now. The Portal is a second, separate experience meant for clients — but you're the one building it, testing it, and you'll want to check it constantly while it doesn't have real clients using it yet (and even after it does). So the Portal can't be "something you can only see by logging in as a client" — it needs a built-in way for *you* to look at it as-is, from inside your own session.

**Recommended mechanism: a Preview link from the client dashboard, not a second login.**

- On Client Detail (your side), add a **"View Portal →"** button.
- Clicking it opens the Portal, scoped to that client's data, inside a session that's still fundamentally *you* — not a separate demo account you have to remember credentials for.
- A persistent banner across the top of the Portal in this mode: **"Previewing as [Client Name] — you're viewing this as they would see it."** So there's never ambiguity about which mode you're in.
- In preview mode, actions that would normally do something real to the client's account — submitting a support ticket, clicking Pay Now — should either be disabled with a small note ("disabled in preview") or clearly simulated, so you don't accidentally create a real ticket you then have to notice and close out.

This is cheap to build precisely *because* there's no real auth yet (per the earlier constraints doc) — right now, "who is the current portal user" is just local state anyway. Build the preview mechanism as the same underlying switch that decides whose data the Portal renders, and it costs almost nothing extra now versus retrofitting it once real auth exists later, where it would need an actual permission check (impersonation done properly) instead of just a local flag.

---

## Part 2 — What the Portal needs to actually contain (the build target)

Structure follows what's already documented as the plan, folding in the earlier docs' recommendations directly rather than as a separate "improve later" pass:

### Portal shell
- Header/nav: Dashboard, Project, Invoices, Support — as already laid out.
- Auth: same demo-mode pattern the client dashboard already uses (`demoLogin`/`demoGetUser`) — don't build real per-client auth yet, per the earlier constraints doc. One demo client account is enough to build and test against; the Preview mechanism from Part 1 covers your own need to check different clients' views without needing one demo login per client.

### Portal Dashboard
- The 4 metric cards as documented (Active Projects, Pending Invoices, Support Tickets, Total Invested) — but build "Total Invested" split from the start as **one-time vs. recurring** (previous doc's D10), since retrofitting a blended number later is more work than just not blending it now.
- Recent Activity panel reads from the **Shared-visibility updates** (shared-workspace doc, Part 3a) rather than its own separate mock feed — build the visibility flag on activity entries on your side first (it's small), then Portal's panel is just "the same table, filtered."
- Upcoming Milestones panel as documented.

### Portal Project
- Workstream cards, progress bar, task list as documented.
- **Approval actions** on workstreams (shared-workspace doc, Part 3c) — this is worth having from day one rather than added later, since "client can approve a phase" is one of the more distinctive, on-brand features (matches the "no surprises" positioning) and isn't much extra work once workstreams already exist.
- **Files section** — genuinely new, not in the original Portal spec at all. Reads Shared-flagged files from the Project (shared-workspace doc, Part 3b).
- Recent Updates feed — same Shared-visibility table as the Dashboard panel.

### Portal Invoices
- Invoice list + status badges as documented.
- **Payment schedule timeline** above the list once payment schedules exist on your side (operational-pages doc, Part C/D12) — build the list first, add the schedule view once that data exists.
- Pay Now button stays a placeholder/manual flow — real payment processing is deferred, per the earlier constraints doc. Don't build live checkout as part of this.

### Portal Support
- FAQ as documented — pure content, build as-is.
- Contact form → should create a trackable ticket (status: Open/In Progress/Resolved) rather than a fire-and-forget message, so there's something for you to actually manage on your side, not just an email that lands somewhere.
- Capacity display ("3 of 5 requests used") only once a client has an active retainer plan — realistically nothing to show yet with the current pipeline, so this can wait without blocking the rest of Support from shipping.

---

## Part 3 — Build order

1. **Portal shell + auth** (reuse existing demo pattern) + **Preview link from Client Detail** (Part 1). Do these together — there's no point building any Portal page before you have a way to look at it without friction.
2. **Portal Dashboard** — the four metrics, split one-time/recurring from the start.
3. **Portal Project** — workstreams and tasks first (read-only view of what already exists on your side for that client's project), then layer in Approval actions once the underlying Approval Gates concept exists on your side.
4. **Portal Invoices** — list first, schedule timeline once payment schedules exist.
5. **Portal Support** — FAQ + ticket-style form. Capacity display later, once there's an actual retainer client to show it for.
6. **Shared updates/files feed + comment thread** — these touch both sides at once (your Project Detail needs the visibility toggle, Portal needs to read the same table), so they naturally happen once steps 3–4 give you real project data to attach them to.

Everything here builds against local/mock data, same as the rest of the app right now — nothing is blocked on Supabase, real auth, or real payments (all still deferred, per the earlier constraints doc).

---

## Part 4 — One thing to flag for later, not now

The Preview mechanism in Part 1 is safe today because it's just you, and everything's local/demo data — there's no real risk of one client seeing another client's preview session. Once real auth and real clients exist, "view as client" needs to become a proper server-side permission check (you're an authenticated admin viewing scoped client data, not a shared local flag) rather than the lightweight version built here. Worth a one-line reminder in whatever tracks technical debt, so it doesn't quietly ship as-is once real clients are on the system.
