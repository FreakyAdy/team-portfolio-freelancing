# TRIADICT STUDIO OPERATING SYSTEMS — BUILD PLAN (UPDATED)

## Scope: Core Systems Only

**Building NOW:**
- Next.js 14 project with marketing site migration
- Supabase backend (database, auth, storage, realtime)
- Studio Dashboard (internal command center for 3 team members)
- Client Portal (client-facing project view)
- Deals/Pipeline management
- Projects/Delivery management with phase tracking
- Invoices/Payments
- Client onboarding
- Approvals/Feedback system
- QA/Launch gates
- Template registry
- File management
- Knowledge base

**DEFERRED (later phases):**
- Lead enrichment system
- Website intelligence
- Commercial opportunity intelligence
- Lead scoring algorithms
- Outreach sequences & reply detection
- AI prompt registry & evaluations
- Automation orchestrator & reliability
- Lead response automation
- AI inbox & email automation
- CRM automation workflows
- Appointment booking system
- AI website agents
- Advanced business dashboards
- Client automation audits

---

## Architecture: Single Next.js 14 App with Route Groups

```
app/
├── (marketing)/          # Existing marketing site → Next.js pages
│   ├── layout.tsx        # Marketing layout (nav, footer, fonts, grain)
│   ├── page.tsx          # Home (hero, pitch, manifesto, process, pricing, contact)
│   ├── work/
│   │   ├── page.tsx      # Case study grid
│   │   └── [slug]/
│   │       └── page.tsx  # Case study detail
│   ├── team/page.tsx
│   ├── pricing/page.tsx
│   ├── contact/page.tsx
│   └── globals.css       # Custom CSS variables, animations
│
├── (studio)/             # INTERNAL - Triadict team only
│   ├── layout.tsx        # Auth guard, sidebar nav, top bar
│   ├── dashboard/        # Studio Command Center
│   │   └── page.tsx      # Overview: pipeline, cash, capacity, project health
│   ├── deals/            # Sales Pipeline
│   │   ├── page.tsx      # Kanban: qualified → discovery → proposal → negotiation → won
│   │   └── [id]/         # Deal detail: requirements, proposal, contract
│   ├── projects/         # Delivery Control
│   │   ├── page.tsx      # All projects, health, capacity
│   │   └── [id]/         # Project workspace: phases, approvals, feedback, QA, launch
│   ├── clients/          # Client Management
│   │   ├── page.tsx      # Client list, health scores, MRR
│   │   └── [id]/         # Client 360: projects, invoices, support
│   ├── finance/          # Commercial Engine
│   │   ├── invoices/
│   │   ├── payments/
│   │   └── retainers/
│   ├── templates/        # Template Registry
│   │   ├── page.tsx
│   │   └── [id]/editor.tsx
│   ├── knowledge/        # Studio Knowledge Base
│   └── settings/
│       ├── team/
│       └── integrations/
│
├── (portal)/             # CLIENT-FACING - Client Portal
│   ├── layout.tsx        # Auth guard, client-branded header
│   ├── page.tsx          # Portal home: status, next milestone, my tasks, files
│   ├── project/[id]/     # Project view: timeline, approvals, feedback, files
│   ├── invoices/         # Own invoices, payment status
│   └── support/          # Submit/track support tickets
│
├── api/                  # API Routes
│   ├── auth/             # Supabase auth callbacks
│   └── webhooks/         # Stripe, form submissions
│
├── lib/
│   ├── supabase/         # Server & browser clients
│   ├── auth/             # Server auth helpers, middleware
│   ├── db/               # Database types, queries (Zod validated)
│   ├── email/            # Transactional email (Resend)
│   ├── storage/          # File upload helpers
│   └── utils/
│
├── components/
│   ├── ui/               # Shadcn/UI base components
│   ├── marketing/        # Hero, Pitch, CaseCard, ProcessRow, PricingRange, TeamCard, FAQ, ContactForm
│   ├── studio/           # DataTable, Kanban, PipelineChart, MetricCard, ApprovalGate, FeedbackThread
│   ├── portal/           # ClientPortalLayout, MilestoneTimeline, ApprovalCard, FileDropzone
│   └── forms/            # FormField, Select, Textarea, FileUpload, DatePicker
│
├── hooks/
│   ├── useAuth.ts
│   ├── useRealtime.ts    # Supabase realtime subscriptions
│   └── useDebounce.ts
│
└── types/                # Shared TypeScript types (generated from Supabase)
```

## Backend: Supabase

- **Free tier**: 500MB DB, 1GB file storage, 50K MAU auth
- **PostgreSQL**: Full relational power
- **Row Level Security**: Client portal isolation
- **Realtime**: Live dashboard updates
- **Auth**: Magic links for clients, email/password for team

## Database Schema (Core Tables)

### Operating Spine
- **organizations**: Studio + client organizations
- **people**: Team + client contacts with roles
- **events**: Canonical event log
- **templates**: Versioned templates with merge fields
- **files**: Project assets with storage paths

### Sales Pipeline
- **deals**: Pipeline stages, value, probability, expected close
- **proposals**: Versioned proposals with pricing
- **contracts**: Master agreements with signature status
- **sow_documents**: Statements of work

### Projects & Delivery
- **projects**: Active work with type, status, phase, dates
- **project_phases**: Templated phases with deliverables
- **project_templates**: Service-specific templates
- **approvals**: Phase/content/scope/final/launch approvals
- **feedback_items**: Structured feedback with resolution
- **change_orders**: Scope/timeline/cost changes

### Commercial
- **invoices**: Advance, milestone, final, change order
- **payments**: Stripe, Wise, bank transfers
- **retainers**: Monthly service packages
- **retainer_requests**: Client requests against capacity

### Client Experience
- **client_onboarding**: Conditional intake modules
- **support_tickets**: Bug/content/support/enhancement requests

### Quality
- **qa_checklists**: Phase-specific QA testing
- **launch_gates**: Requirements for launch

### Knowledge
- **knowledge_articles**: Processes, standards, lessons

---

## Build Order (Focused)

### Phase 1: Foundation (Days 1-3)
1. Initialize Next.js 14 project
2. Install dependencies (Supabase, Shadcn/UI, Zod, React Hook Form, Recharts, Lucide)
3. Create Supabase project
4. Run database migrations (core tables)
5. Configure Supabase auth (magic links for clients, email/password for team)
6. Build Supabase client helpers (server & browser)

### Phase 2: Marketing Site Migration (Days 3-5)
1. Extract CSS from index.html → globals.css
2. Move Tailwind config to tailwind.config.ts
3. Create layout.tsx with fonts (Instrument Serif, Inter, JetBrains Mono)
4. Build marketing components: Hero, Pitch, Manifesto, Process, Team, Pricing, Contact, Footer
5. Build marketing pages: home, work, team, pricing, contact
6. Preserve animations, grain overlay, editorial design

### Phase 3: Studio Dashboard Layout (Days 5-7)
1. Build (studio) layout with auth guard
2. Create sidebar navigation
3. Build top bar with user info
4. Create dashboard page with metric cards
5. Add real-time data subscriptions

### Phase 4: Deals & Pipeline (Days 7-10)
1. Build deals list page with Kanban view
2. Create deal detail page
3. Build deal creation/edit forms
4. Add pipeline stage management
5. Track deal value and probability

### Phase 5: Projects & Delivery (Days 10-14)
1. Build projects list page
2. Create project detail page with phases
3. Build phase management (start, complete, approve)
4. Add approval gates with status tracking
5. Create feedback system
6. Build change order workflow

### Phase 6: Client Portal (Days 14-18)
1. Build (portal) layout with client auth
2. Create portal home with project status
3. Build project timeline view
4. Add file sharing interface
5. Create approval interface for clients
6. Build invoice viewing

### Phase 7: Finance & Invoicing (Days 18-21)
1. Build invoice list and detail pages
2. Create invoice generation from deal/project data
3. Add payment tracking
4. Build retainer management
5. Create basic cashflow view

### Phase 8: Templates & Knowledge (Days 21-23)
1. Build template registry UI
2. Create template editor with merge fields
3. Build knowledge base with articles
4. Add search functionality

### Phase 9: Polish & Deploy (Days 23-25)
1. Responsive design pass
2. Performance optimization
3. SEO setup
4. Deploy to Vercel
5. Configure custom domain

---

## Immediate Actions

1. **Create Next.js project** in current folder
2. **Set up Supabase** (need project URL and anon key)
3. **Run migrations** for core tables
4. **Build marketing site** from existing index.html
5. **Build studio dashboard** shell with auth
6. **Iterate** through each phase

---

*Updated: Focus on core systems, deferred automation/AI/lead gen*