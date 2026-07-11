# Triadict Studio — Pages & Navigation Documentation

> Complete reference for every page, feature, data point, and navigation path in the Triadict Studio web app.

---

## Architecture Overview

| Aspect | Detail |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Styling** | Tailwind CSS v4 |
| **Database** | Supabase (PostgreSQL + Auth + Realtime) |
| **Deployment** | Netlify (from repo root, `base = "triadict"`) |
| **Auth** | Demo mode (localStorage) in dev; Supabase in production |
| **Demo credentials** | `Aditya` / `12324` |
| **Two user areas** | Studio (`/studio/*`) — the team's CRM dashboard; Portal (`/portal/*`) — the client's view |

### Auth Flow

1. User visits `/auth/login` or `/auth/signup`
2. In dev mode (`isDev = true` when Supabase URL contains `your-project`), forms use `demoLogin()` / `demoSignup()` from `src/lib/auth/demo.ts`
3. Demo auth stores user object in `localStorage` under key `triadict_demo_user`
4. Studio and Portal layouts call `demoGetUser()` — if null, redirect to `/auth/login`
5. Sign out calls `demoLogout()` which clears localStorage and redirects to `/`
6. In production, Supabase handles auth; Netlify Identity can also be used

### Dev vs Production

| Behavior | Dev (demo mode) | Production |
|---|---|---|
| Login | localStorage demo account | Supabase email/password |
| Signup | Creates localStorage user | Creates Supabase user |
| Data | Mock data (hardcoded) | Supabase database |
| Auth check | `demoGetUser()` | `supabase.auth.getUser()` |
| Logout | Clears localStorage | `supabase.auth.signOut()` |

---

## Global Navigation

### Marketing Nav (desktop)

Visible on the marketing page (`/`). Top-right, fixed position.

| Element | Link | Notes |
|---|---|---|
| Home | `/` | — |
| Work | `/#work` | Scrolls to case studies section |
| Process | `/#process` | Scrolls to process section |
| Pricing | `/#pricing` | Scrolls to pricing section |
| Team | `/#team` | Scrolls to team section |
| Dashboards ▾ | — | Dropdown menu (desktop only) |
| ↳ Studio Login | `/auth/login?redirect=/studio/dashboard` | Second item in dropdown |
| ↳ Client Portal | `/auth/login?redirect=/portal/dashboard` | First item in dropdown |
| Start a project → | `/#contact` | Primary CTA button, coral bg |

**Dashboards dropdown** (desktop): Shows on hover/click. Two items with descriptions:
- "For our team" → `/auth/login?redirect=/studio/dashboard`
- "For clients" → `/auth/login?redirect=/portal/dashboard`

### Marketing Nav (mobile)

Hamburger menu. Same links as desktop plus:
- **Dashboards** section at the bottom with two links:
  - "Studio Login" → `/auth/login?redirect=/studio/dashboard`
  - "Client Portal" → `/auth/login?redirect=/portal/dashboard`

### Marketing Footer

Four columns:
1. **Triadic** — Logo, tagline, location (Pune, India)
2. **Navigation** — Home, Work, Process, Pricing, Team
3. **Services** — Pricing, FAQ, Contact
4. **Connect** — Email (hello@triadic.studio), LinkedIn, Instagram, WhatsApp

Bottom: Copyright 2026, "Made with purpose in Pune, India"

### Studio Sidebar

Left sidebar, always visible on all `/studio/*` pages. Dark theme.

**Logo area** (top): Triadic logo + "Studio" label

**Navigation sections:**

| Section | Icon | Link | Children |
|---|---|---|---|
| Dashboard | LayoutDashboard | `/studio/dashboard` | — |
| **Sales** | TrendingUp | — | Deals (`/studio/deals`) |
| **Delivery** | Briefcase | — | Projects (`/studio/projects`), Clients (`/studio/clients`) |
| **Finance** | DollarSign | — | Invoices (`/studio/invoices`), Payments (`/studio/payments`) |
| **Resources** | BookOpen | — | Templates (`/studio/templates`), Knowledge (`/studio/knowledge`) |
| **Settings** | Settings | `/studio/settings` | — |

**User menu** (bottom): Shows user avatar (or fallback initials), name, email. Click to sign out.

**Mobile**: Sidebar becomes a top nav bar with hamburger menu toggle.

### Portal Header

Horizontal header bar, always visible on all `/portal/*` pages.

| Element | Link | Notes |
|---|---|---|
| Triadic logo | `/portal/dashboard` | Left side |
| Dashboard | `/portal/dashboard` | — |
| Project | `/portal/project` | — |
| Invoices | `/portal/invoices` | — |
| Support | `/portal/support` | — |
| User avatar ▾ | — | Right side, dropdown with name, email, sign out |

---

## Marketing Page (`/`)

Route: `/`  
Component: `src/app/(marketing)/page.tsx`  
Layout: `src/app/(marketing)/layout.tsx` (includes `<CustomCursor />`)

### Section 1: Navigation/Header
See **Global Navigation > Marketing Nav** above.

### Section 2: Hero
- **Headline**: "Websites that look like you took it seriously."
- **Sub-headline**: "Editorial brochure sites for solo professionals and boutique brands. Fixed price, 2–3 weeks, no surprises."
- **Two CTAs**:
  - "See our work" → `/#work` (outlined button)
  - "Start a project →" → `/#contact` (coral filled button)
- **Background**: Subtle animated grain texture overlay

### Section 3: Pricing
- **Headline**: "Transparent pricing. No surprises."
- **Sub-headline**: "Two packages designed for solo professionals. Fixed price, fixed timeline."
- **Two cards**:

| Card | Price | For | Features |
|---|---|---|---|
| The Single | $800 | Solo professionals | 1-page site, custom design, mobile-perfect, contact form, domain + hosting setup, 2-week turnaround, 1 revision round |
| The Suite | $1,500 | Brands needing depth | Up to 5 pages, everything in The Single, blog/case study system, basic SEO, lead capture, 3-week turnaround, 2 revision rounds |

- **Footer note**: "Custom scope? Email us — we quote anything over $1,500 case-by-case."
- **Two CTAs per card**: "Start with The Single →" / "Start with The Suite →" → `/#contact`

### Section 4: Process
- **Headline**: "How we work."
- **Sub-headline**: "Five steps. No surprises. You know exactly what's happening at every stage."
- **5 steps**:

| # | Step | Timeframe | Description |
|---|---|---|---|
| 01 | Discovery call | 30 minutes | You talk, we listen. We'll ask about your business, your audience, and what you need. |
| 02 | Fixed quote | 48 hours | A detailed proposal with a fixed price. No hourly surprises. |
| 03 | Design | 1 week | We create the visual design. Two rounds of revisions included. |
| 04 | Build | 1 week | We bring the design to life. You see it grow. |
| 05 | Ship | Day of launch | Live on your domain. Handoff docs included. |

- **CTA**: "Ready to start? →" → `/#contact`

### Section 5: Team
- **Headline**: "The team behind the work."
- **Sub-headline**: "Three specialists. No account managers. You work directly with the people building your site."
- **3 team members**:

| Name | Role | Bio | Links |
|---|---|---|---|
| Aditya Suryavanshi | Lead Engineer | Reinforcement learning enthusiast. Top 800 / 72,000+ at Meta × PyTorch OpenEnv Hackathon. Builds the systems behind every site we ship. | LinkedIn, Portfolio |
| Shreeshant Bokade | Design Lead | Shapes how brands look, feel, and read. Focused on editorial design systems and brand identity. | LinkedIn |
| Prajwal Valekar | Strategy & Copy | Turns vague briefs into sharp positioning. Writes the words that make people click "Start a project." | LinkedIn |

- **Avatars**: Each has a colored gradient circle with initials as fallback (A, S, P)

### Section 6: Services
- **Headline**: "What we build."
- **Sub-headline**: "Focused, editorial websites for people who refuse to look generic."
- **6 services**:

| # | Service | Description |
|---|---|---|
| 01 | Custom Websites | Bespoke editorial sites built from scratch. No templates. No shortcuts. |
| 02 | Landing Pages | High-converting single pages for launches, products, or campaigns. |
| 03 | Portfolio Sites | Showcase your work with editorial flair. For creatives and professionals. |
| 04 | Brand Identity | Logo systems, color palettes, typography, and brand guidelines. |
| 05 | Content Strategy | Messaging, copywriting, and content architecture that converts. |
| 06 | SEO & Analytics | Technical SEO, performance optimization, and analytics setup. |

- **CTA**: "Discuss your project →" → `/#contact`

### Section 7: Case Studies
- **Headline**: "Selected work."
- **Sub-headline**: "Real projects. Real results. Every site we build tells a story."
- **3 spec projects**:

| Project | Client | Tags | Summary |
|---|---|---|---|
| The Hartley House | Spec — Solo realtor | Real estate, Editorial, Brand | An editorial site for a Nashville solo realtor. Story-led homepage, dedicated neighborhood guides, a calm contact flow that doesn't feel like a lead form. |
| Quiet Practice | Spec — Therapist | Therapy, Editorial, Brand | Warm, restrained site for a fictional solo therapist. Built around trust signals, not stock photos. |
| North & Co. | Spec — Executive coach | Coaching, Editorial, Conversion | An editorial coaching site for a fictional leadership consultant. Case-study-driven, no fluff. |

- Each card shows: title, client, summary, tags, "View case study →"
- **CTA below**: "Want to see more? Let's talk →" → `/#contact`

### Section 8: Testimonials
- **Headline**: "What clients say."
- **Sub-headline**: "Real feedback from real people."
- **3 testimonials**:

| Quote | Author | Role | Company |
|---|---|---|---|
| "They turned our vague ideas into a website that actually converts. The process was clear, fast, and professional." | Sarah Mitchell | Founder | Hartley House Realty |
| "Finally, a team that understands that a website is a business tool, not an art project." | James Chen | CEO | Vertex Consulting |
| "The fixed pricing model sold us. No surprises, no hidden costs. Just great work delivered on time." | Priya Sharma | Director | Bloom Wellness Studio |

- **CTA**: "Join our clients →" → `/#contact`

### Section 9: FAQ
- **Headline**: "Frequently asked questions."
- **Sub-headline**: "Everything you need to know before we start."
- **6 questions**:

| Question | Answer |
|---|---|
| Why fixed price? | Because hourly billing punishes you for our learning curve. Fixed price means we eat the risk if we underestimate. |
| Do you handle hosting? | Yes. We set up Vercel or Netlify hosting and walk you through transferring it to your own account, or we manage it for $15/mo. |
| What if I need changes after launch? | First month of small tweaks is free. After that, $50/hour or a $400 monthly retainer for ongoing changes. |
| Do you build e-commerce? | No. We focus on brochure-style sites — service businesses, portfolios, personal brands. For Shopify or complex e-commerce, we'll point you to people who do it well. |
| Why is your team in India? | Because we deliver Pentagram-tier work at a third of US agency prices. Our async-first process means time zones are a feature, not a bug — you sleep, we ship. |
| What if I hate the design? | Two free revision rounds are baked in. After that, additional rounds are $100 each. We almost never need them. |

- **CTA**: "Still have questions? Let's talk →" → `/#contact`

### Section 10: Contact
- **Headline**: "Start a project."
- **Sub-headline**: "Tell us about your business and what you need. We'll get back to you within 24 hours."
- **Form fields**:
  - Name (text, required)
  - Email (email, required)
  - Current website (text, optional)
  - What you need (textarea, required)
- **Submit button**: "Send message →"
- **Secondary contact**: "Or email us directly at hello@triadic.studio"

### Section 11: CTA
- **Headline**: "Ready to build something great?"
- **Sub-headline**: "Let's create a website that makes your competitors jealous."
- **Two CTAs**:
  - "Start a project →" → `/#contact`
  - "See our work" → `/#work`

### Section 12: Footer
See **Global Navigation > Marketing Footer** above.

### Section 13: Custom Cursor
- Component: `src/components/ui/CustomCursor.tsx`
- Large coral circle that follows mouse on desktop
- Scales up when hovering over interactive elements
- Hidden on mobile/touch devices

---

## Auth Pages

### Login (`/auth/login`)

Route: `/auth/login`  
Component: `src/app/auth/login/page.tsx`

**Form fields:**
| Field | Type | Required | Notes |
|---|---|---|---|
| Email | email | Yes | In dev mode: accepts any string (not validated as email) |
| Password | text | Yes | Input type is `text` (not `password`) for demo convenience |

**Behavior:**
- In dev mode (`isDev = true`): calls `demoLogin()` from `src/lib/auth/demo.ts`
  - Validates against hardcoded demo account (username: `Aditya`, password: `12324`)
  - Stores user object in `localStorage` under `triadict_demo_user`
  - On success: redirects to `searchParams.redirect` or `/studio/dashboard`
- In production: calls `supabase.auth.signInWithPassword()`
  - On success: redirects to `searchParams.redirect` or `/studio/dashboard`

**Links:**
- "Forgot password?" → `#` (disabled — hidden in dev mode)
- "Sign up" → `/auth/signup`
- "Back to home" → `/` (top-left)

**Error handling:** Displays error message in red alert box below form.

### Signup (`/auth/signup`)

Route: `/auth/signup`  
Component: `src/app/auth/signup/page.tsx`

**Form fields:**
| Field | Type | Required | Notes |
|---|---|---|---|
| Full name | text | Yes | — |
| Email | email | Yes | — |
| Password | password | Yes | Min 6 characters |
| Confirm password | password | Yes | Must match password |

**Behavior:**
- In dev mode: calls `demoSignup()` → stores user in localStorage → redirects to `/auth/login`
- In production: calls `supabase.auth.signUp()` → shows "check your email" message

**Links:**
- "Already have an account? Sign in" → `/auth/login`
- "Back to home" → `/`

---

## Studio Dashboard (`/studio/dashboard`)

Route: `/studio/dashboard`  
Component: `src/app/studio/dashboard/page.tsx`  
Auth: Required (redirects to `/auth/login` if not logged in)

**6 Metric Cards:**

| Metric | Value | Change | Icon | Color |
|---|---|---|---|---|
| Active Deals | 3 | +12% from last month | TrendingUp | Blue |
| Revenue | $14,800 | +8% from last month | DollarSign | Green |
| Projects | 2 | +25% from last month | Briefcase | Purple |
| Clients | 15 | +7% from last month | Users | Coral |
| Tasks Due | 8 | Due this week | CalendarClock | Yellow |
| Completion Rate | 92% | +3% from last month | Target | Teal |

**4 Panels:**

| Panel | Content |
|---|---|
| Deals Pipeline | Last 3 deals with stage badges, value, client name |
| Active Projects | Last 3 projects with progress bars, status badges |
| Tasks Due Today | 3 tasks with priority dots (High=red, Medium=yellow, Low=green), assigned avatar |
| Recent Activity | 3 activity items with type icons, descriptions, relative timestamps |

**Quick Actions:**
- New Deal → `/studio/deals?new=true`
- New Project → `/studio/projects?new=true`
- New Invoice → `/studio/invoices?new=true`
- New Client → `/studio/clients?new=true`

---

## Studio — Sales Pipeline

### Deals List (`/studio/deals`)

Route: `/studio/deals`  
Component: `src/app/studio/deals/page.tsx`

**Top bar:**
- Search input (searches deal name, client name)
- Filter dropdown: All, Active (open stages), Closed (won/lost/cancelled)
- View toggle: List | Kanban
- "+ New Deal" button

**List View columns:**
| Column | Description |
|---|---|
| Deal | Name + description preview |
| Client | Client name |
| Value | Formatted value (e.g., "$1,200") |
| Stage | Colored badge (14 possible stages) |
| Priority | Low / Medium / High / Urgent |
| Due | Due date or "— |

**List View row actions:**
- Click row → `/studio/deals/[id]`
- "..." menu: Edit, View, Change stage (submenu), Delete

**Kanban View:**
- Horizontal scrolling columns for each stage
- Cards show: name, value, priority dot, due date
- Drag-and-drop between stages

**14 Deal Stages:**

| # | Stage | Badge Color |
|---|---|---|
| 0 | Lead | Slate |
| 1 | Contacted | Blue |
| 2 | Qualified | Indigo |
| 3 | Proposal Sent | Purple |
| 4 | Negotiation | Pink |
| 5 | Verbal Commit | Teal |
| 6 | Contract Sent | Cyan |
| 7 | Awaiting Signature | Sky |
| 8 | Signed | Green |
| 9 | Won | Emerald |
| 10 | Kickoff Scheduled | Amber |
| 11 | In Progress | Orange |
| 12 | Delivered | Violet |
| 13 | Lost | Red |
| 14 | Cancelled | Gray |

**Stage progress dots:** At bottom, shows 14 dots indicating current position in pipeline.

**New Deal Modal** (when `?new=true`): 
- Fields: Deal name, Client (select existing), Value ($), Stage (select), Priority (Low/Medium/High/Urgent), Due date, Description (textarea)
- Save → creates deal, redirects to `/studio/deals/[id]`

### Deal Detail (`/studio/deals/[id]`)

Route: `/studio/deals/[id]`  
Component: `src/app/studio/deals/[id]/page.tsx`

**Header:** Back button, deal name, client name, "Save & Close" button

**4 action buttons below header:**
- Move to next stage
- Send proposal
- Add contact
- Schedule meeting

**8 Tabs:**

| Tab | Content |
|---|---|
| **Overview** | Deal summary (value, stage, priority, dates, description, tags, assigned team member), Contact person, Deal value card |
| **Contacts** | List of contacts associated with this deal. Add new contact button. Shows: name, email, phone, role, primary badge |
| **Activity** | Activity feed (calls, emails, meetings, notes). Add Activity button. Each item shows: type icon, title, description, timestamp, person |
| **Proposals** | Proposals list with status (Draft/Sent/Accepted/Rejected). Create Proposal button. Shows: title, value, status, date, actions (edit/duplicate/delete) |
| **Contracts** | Contracts list with status (Draft/Sent/Active/Expired/Cancelled). Create Contract button. Shows: title, status, value, dates, parties, actions |
| **Files** | File upload zone (drag & drop or browse). Shows uploaded files with preview, name, size, uploaded by, date, download/delete actions |
| **Finance** | Payment history, invoices, total value, received, pending, overdue amounts. Create Invoice / Record Payment buttons |
| **History** | Change log — every modification to this deal with timestamp, user, old value → new value |

---

## Studio — Client Delivery

### Projects List (`/studio/projects`)

Route: `/studio/projects`  
Component: `src/app/studio/projects/page.tsx`

**Top bar:**
- Search input
- Filter dropdown: All, Active, Planning, In Progress, Review, Completed, On Hold, Cancelled
- View toggle: List | Grid
- "+ New Project" button

**List View columns:** Project (name + description), Client, Status (colored badge), Progress (bar), Team (avatars), Due date, Actions (⋮)

**Grid View:** Cards with: colored top bar, project name, client, description, status badge, progress bar, due date, team avatars

**7 Project Statuses:**

| Status | Color |
|---|---|
| Planning | Blue |
| In Progress | Yellow |
| Review | Purple |
| Completed | Green |
| On Hold | Gray |
| Cancelled | Red |
| Archived | Gray |

**Row/Card actions:** Edit, View details, Delete

**New Project Modal** (`?new=true`): Name, Client (select), Description, Start date, Due date, Budget ($), Team members, Status

### Project Detail (`/studio/projects/[id]`)

Route: `/studio/projects/[id]`  
Component: `src/app/studio/projects/[id]/page.tsx`

**2 Tabs: Overview | Tasks**

#### Overview Tab

**4 panels:**
| Panel | Content |
|---|---|
| Project Details | Client name, dates, budget, description, team members (avatars + names) |
| Progress | Overall %, tasks breakdown (To Do / In Progress / Done), progress bar |
| Budget | Total budget, spent amount, remaining, progress bar |
| Recent Activity | Last 5 activity items with type icons, descriptions, timestamps |

**Right sidebar:**
- Quick Stats: Tasks count, Completed count, Due This Week count
- Team Members list

#### Tasks Tab

**Controls:** Add Task button, Filter by status, Filter by priority

**Kanban view** (default): 4 columns — To Do (blue), In Progress (yellow), Review (purple), Done (green). Drag-and-drop cards between columns.

**List view:** Table with columns — Task, Assignee, Priority (colored dot), Due Date, Status, Actions

**Add/Edit Task Modal:** Title, Description, Assignee (select), Priority (Low/Medium/High), Status, Due Date, Tags

**Task detail panel** (slide-out on right): Title, Description, Assignee, Priority, Status, Due Date, Created, Tags, Comments thread

### Clients List (`/studio/clients`)

Route: `/studio/clients`  
Component: `src/app/studio/clients/page.tsx`

**2-step wizard** (when no clients or clicking "Add Client"):

| Step | Fields |
|---|---|
| Step 1: Contact Details | Name (required), Email (required), Phone, Company, Job Title, Website |
| Step 2: Business Details | Industry (select from 12 options), Business Type, Project Type, Budget Range (select), Timeline (select), How they found us (select), Notes (textarea) |

**Client list:**
- Search input
- Filter dropdown: All, Individual, Company, Lead, Active Client, Past Client
- Grid/List toggle
- "+ Add Client" button

**Grid view cards:** Avatar (initials with colored bg), Name, Company (or "Individual"), Contact badge (if contact), Project count, Active Projects count, Value, Status badge

**List view columns:** Client (name + company), Type (Individual/Company), Status, Contact (badge), Projects, Value, Last Activity, Actions (⋮)

**Row/Card actions:** View, Edit, Delete

**Client type badges:**
| Type | Color |
|---|---|
| Individual | Gray |
| Company | Blue |
| Lead | Yellow |
| Active Client | Green |
| Past Client | Gray |

### Client Detail (`/studio/clients/[id]`)

Route: `/studio/clients/[id]`  
Component: `src/app/studio/clients/[id]/page.tsx`

**Header:** Back button, client name + company, contact badges (email, phone, website), "Edit" button

**4 Tabs: Overview | Projects | Activity | Settings**

#### Overview Tab

**4 panels:**
| Panel | Content |
|---|---|
| Client Details | Company name, type, contact info, website |
| Business Information | Industry, business type, budget range, timeline, how found us |
| Projects | List of projects with status badges and links |
| Contact Details | Primary contact name, email, phone, role |

**Right sidebar:** Quick Stats (Total Projects, Active Projects, Total Value), Status badge

#### Projects Tab

Search + filter + grid/list toggle for client's projects. Same card/list format as main projects page but filtered to this client.

#### Activity Tab

Activity feed for this client. Add Activity button. Same format as deal activity.

#### Settings Tab

- Edit client information
- Change client status
- Delete client (danger zone, red button)

---

## Studio — Finance

### Invoices List (`/studio/invoices`)

Route: `/studio/invoices`  
Component: `src/app/studio/invoices/page.tsx`

**Top bar:**
- Search input
- Filter: All, Draft, Sent, Paid, Overdue, Cancelled
- "+ New Invoice" button

**Grid view cards:** Invoice #, Client name, Amount, Status badge, Issue date, Due date, View Invoice button

**5 Invoice Statuses:**

| Status | Color |
|---|---|
| Draft | Gray |
| Sent | Blue |
| Paid | Green |
| Overdue | Red |
| Cancelled | Gray |

### Invoice Detail (`/studio/invoices/[id]`)

Route: `/studio/invoices/[id]`  
Component: `src/app/studio/invoices/[id]/page.tsx`

**Header:** Invoice #, Status badge, Client name, "Save & Close" button

**4 action buttons:** Edit, Send, Download PDF, Record Payment

**4 Tabs:**

| Tab | Content |
|---|---|
| **Invoice Details** | Invoice #, Client, Issue date, Due date, Amount, Status, Line items (description, quantity, rate, total), Notes |
| **Activity** | Activity log for this invoice |
| **Payments** | Payment history, Record Payment button, remaining balance |
| **Preview** | Visual invoice preview (letterhead style) |

**Invoice Preview:** Full visual rendering of the invoice as it would appear when sent — includes Triadic letterhead, invoice #, dates, client details, line items table, subtotal, tax, total, payment terms, payment info.

### Payments (`/studio/payments`)

Route: `/studio/payments`  
Component: `src/app/studio/payments/page.tsx`

**Top bar:** Search, Filter (All, Pending, Completed, Failed), "+ Record Payment" button

**Summary cards (4):**
| Card | Value |
|---|---|
| Total Received | Amount with green badge |
| Pending | Amount with yellow badge |
| Failed | Amount with red badge |
| This Month | Amount with blue badge |

**Payment list:** Shows all payments with amount, client, date, invoice #, status badge (Completed/Pending/Failed), type badge (Full Payment/Partial Payment), refund badge (if applicable)

**Record Payment Modal:** Invoice (select), Amount, Date, Payment Method (select: Bank Transfer, Credit Card, Debit Card, Cash, Check, Other), Reference #, Notes

---

## Studio — Resources

### Templates (`/studio/templates`)

Route: `/studio/templates`  
Component: `src/app/studio/templates/page.tsx`

**Top bar:** Search, Category filter (All, Proposals, Contracts, Emails, Invoices, Briefs, Agreements), View toggle (Grid/List), "+ New Template" button

**6 Template Types:**

| Type | Color | Icon |
|---|---|---|
| Proposal | Blue | FileText |
| Contract | Green | Scroll |
| Email | Purple | Mail |
| Invoice | Yellow | Receipt |
| Brief | Indigo | ClipboardList |
| Agreement | Teal | Shield |

**Grid view cards:** Template name, Type badge (colored), Description, Preview (first 100 chars of content), Last updated, Actions (Use/Edit/Duplicate/Delete)

**List view:** Table with Name, Type, Status, Last Updated, Actions

**New/Edit Template Modal:** Name, Type (select), Description (textarea), Status (Draft/Active), Content (textarea — full template body)

**Default templates (6):**
1. Website Design Proposal — Proposal
2. Service Agreement — Agreement
3. Project Kickoff Email — Email
4. Monthly Invoice — Invoice
5. Creative Brief — Brief
6. Terms of Service — Contract

### Knowledge Base (`/studio/knowledge`)

Route: `/studio/knowledge`  
Component: `src/app/studio/knowledge/page.tsx`

**Top bar:** Search, Category tabs (All, Getting Started, Design, Development, SEO, Client Management), "+ New Article" button

**6 Default Articles:**

| Title | Category | Read time |
|---|---|---|
| Getting Started with Triadic Studio | Getting Started | 5 min read |
| Design Workflow Guide | Design | 8 min read |
| Project Management Best Practices | Client Management | 6 min read |
| SEO Checklist for Client Sites | SEO | 10 min read |
| Client Communication Templates | Client Management | 4 min read |
| Tech Stack Overview | Development | 7 min read |

**Article cards:** Title, Category badge, Date, Read time, "Read Article →"

---

## Studio — Settings (`/studio/settings`)

Route: `/studio/settings`  
Component: `src/app/studio/settings/page.tsx`

**4 Tabs:**

### Profile Tab
- Full name (input, prefilled)
- Email (input, prefilled)
- Phone (input, prefilled)
- Company name (input, prefilled)
- Job title (input, prefilled)
- Bio (textarea, prefilled)
- Timezone (dropdown: UTC, EST, PST, IST)
- "Save Changes" button

### Notifications Tab
- 6 toggle switches:
  - Email notifications
  - Push notifications
  - Deal updates
  - Project updates
  - Payment reminders
  - Weekly reports
- "Save Changes" button

### Appearance Tab
- Theme selector: Light / Dark
- Language: English

### Integrations Tab
- 5 services with status badges and connect/disconnect buttons:
  - Stripe (Connected)
  - Google Analytics (Not connected)
  - Slack (Connected)
  - Zapier (Not connected)
  - Calendly (Connected)

---

## Client Portal

### Portal Dashboard (`/portal/dashboard`)

Route: `/portal/dashboard`  
Component: `src/app/portal/dashboard/page.tsx`  
Auth: Required (same demo auth as studio)

**4 Metric Cards:**

| Metric | Value | Icon | Color |
|---|---|---|---|
| Active Projects | 2 | FolderOpen | Blue |
| Pending Invoices | 3 | FileText | Yellow |
| Support Tickets | 1 | MessageSquare | Red |
| Total Invested | $12,500 | DollarSign | Green |

**2 Panels:**

| Panel | Content |
|---|---|
| Recent Activity | 5 activity items with type icons (project, payment, message), descriptions, relative timestamps |
| Upcoming Milestones | 3 milestones with project name, milestone title, progress bar, due date |

**Quick Actions:** View Project, Pay Invoice, Contact Support

### Portal Project (`/portal/project`)

Route: `/portal/project`  
Component: `src/app/portal/project/page.tsx`

**Project header:** Project name ("Website Redesign"), Client name ("Demo Client"), Project dates, Status badge

**4 Workstream Cards:**

| Workstream | Status |
|---|---|
| Design | In Progress |
| Development | To Do |
| Content | In Review |
| Launch | To Do |

Each card shows: status badge, description, tasks count, completed/total

**Progress bar:** Overall project completion % with visual bar

**Tasks section:** Filter by workstream, task list with status, assignee, due date

**Recent Updates:** Activity feed for the project

### Portal Invoices (`/portal/invoices`)

Route: `/portal/invoices`  
Component: `src/app/portal/invoices/page.tsx`

**Invoice list:** Shows all invoices for this client

| Invoice | Amount | Status | Due Date | Actions |
|---|---|---|---|---|
| INV-001 | $2,500 | Paid | — | View |
| INV-002 | $3,750 | Pending | Jul 15, 2026 | View, Pay Now |
| INV-003 | $2,500 | Overdue | Jul 01, 2026 | View, Pay Now |

**Status badges:** Paid (green), Pending (yellow), Overdue (red)

**Pay Now button:** Opens payment flow (Stripe checkout or manual payment recording)

**Invoice preview panel:** Visual rendering of selected invoice

### Portal Support (`/portal/support`)

Route: `/portal/support`  
Component: `src/app/portal/support/page.tsx`

**Two sections:**

#### 1. FAQ (4 questions)

| Question | Answer |
|---|---|
| How do I request changes? | Use the contact form below or email us directly. |
| What's the typical response time? | We respond within 24 hours on business days. |
| How do I pay my invoice? | Click "Pay Now" on any pending invoice in the Invoices section. |
| Can I add new team members? | Contact us to add team members to your project. |

#### 2. Contact Form

| Field | Type | Required |
|---|---|---|
| Name | text | Yes |
| Email | email | Yes |
| Phone | text | No |
| Message | textarea | Yes |

**Submit button:** "Send Message"

**Contact info card:** Email, Phone, Hours (Mon-Fri, 9 AM - 6 PM IST)

---

## Navigation Map

```
ENTRY POINTS
    |
    v
[/] Marketing Page
    |
    ├── [/#work] Case Studies
    ├── [/#process] Process
    ├── [/#pricing] Pricing
    ├── [/#team] Team
    ├── [/#contact] Contact Form
    |
    ├── [Dashboards ▾]
    │   ├── [Studio Login] → /auth/login?redirect=/studio/dashboard
    │   └── [Client Portal] → /auth/login?redirect=/portal/dashboard
    |
    v
[/auth/login] ← [/auth/signup]
    |
    ├── (dev mode: demoLogin → localStorage)
    ├── (prod: supabase.auth.signInWithPassword)
    |
    ├── redirect=/studio/dashboard → [STUDIO AREA]
    └── redirect=/portal/dashboard → [PORTAL AREA]

STUDIO AREA (/studio/*)
    |
    ├── /studio/dashboard
    │   ├── → /studio/deals?new=true (New Deal)
    │   ├── → /studio/projects?new=true (New Project)
    │   ├── → /studio/invoices?new=true (New Invoice)
    │   └── → /studio/clients?new=true (New Client)
    │
    ├── /studio/deals
    │   ├── → /studio/deals/[id] (Deal Detail)
    │   └── → /studio/deals?new=true (New Deal)
    │       └── /studio/deals/[id] (after save)
    │           ├── Tab: Overview
    │           ├── Tab: Contacts
    │           ├── Tab: Activity
    │           ├── Tab: Proposals → Create/Edit Proposal
    │           ├── Tab: Contracts → Create/Edit Contract
    │           ├── Tab: Files → Upload/Download
    │           ├── Tab: Finance → Create Invoice / Record Payment
    │           └── Tab: History
    │
    ├── /studio/projects
    │   ├── → /studio/projects/[id] (Project Detail)
    │   └── → /studio/projects?new=true (New Project)
    │       └── /studio/projects/[id] (after save)
    │           ├── Tab: Overview
    │           └── Tab: Tasks → Add/Edit Task → Task Detail Panel
    │
    ├── /studio/clients
    │   ├── → /studio/clients/[id] (Client Detail)
    │   └── → /studio/clients?new=true (2-step wizard)
    │       └── /studio/clients/[id] (after save)
    │           ├── Tab: Overview
    │           ├── Tab: Projects → /studio/projects/[id]
    │           ├── Tab: Activity
    │           └── Tab: Settings
    │
    ├── /studio/invoices
    │   ├── → /studio/invoices/[id] (Invoice Detail)
    │   └── → /studio/invoices?new=true (New Invoice)
    │       └── /studio/invoices/[id] (after save)
    │           ├── Tab: Invoice Details
    │           ├── Tab: Activity
    │           ├── Tab: Payments → Record Payment
    │           └── Tab: Preview
    │
    ├── /studio/payments → Record Payment Modal
    │
    ├── /studio/templates → New/Edit Template Modal
    │
    ├── /studio/knowledge → Article View
    │
    └── /studio/settings
        ├── Tab: Profile
        ├── Tab: Notifications
        ├── Tab: Appearance
        └── Tab: Integrations

PORTAL AREA (/portal/*)
    |
    ├── /portal/dashboard
    │   ├── → /portal/project (View Project)
    │   ├── → /portal/invoices (Pay Invoice)
    │   └── → /portal/support (Contact Support)
    │
    ├── /portal/project
    │   ├── Workstream cards
    │   └── Tasks list (filterable by workstream)
    │
    ├── /portal/invoices
    │   ├── → View Invoice
    │   └── → Pay Now (payment flow)
    │
    └── /portal/support
        ├── FAQ section
        └── Contact Form → Submit message

SIGN OUT (all areas) → [/]
```

---

*Last updated: July 2026*
