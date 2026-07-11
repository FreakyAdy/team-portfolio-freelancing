-- ============================================================
-- TRIADICT STUDIO — COMBINED SQL MIGRATION
-- Run this ONE TIME in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- WAVE 1: OPERATING SPINE
-- ============================================

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  type text check (type in ('studio', 'client')) not null,
  settings jsonb default '{}',
  created_at timestamptz default now()
);

create table people (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text check (role in ('admin', 'engineer', 'designer', 'strategist', 'client_owner', 'client_stakeholder')) not null,
  supabase_user_id uuid unique,
  created_at timestamptz default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  actor_id uuid references people(id),
  org_id uuid references organizations(id),
  payload jsonb not null default '{}',
  created_at timestamptz default now()
);
create index idx_events_org on events(org_id, created_at desc);
create index idx_events_name on events(name);

create table templates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  category text not null,
  name text not null,
  version int default 1,
  content_md text not null,
  merge_fields jsonb default '[]',
  locked_sections text[] default '{}',
  is_active boolean default true,
  created_by uuid references people(id),
  created_at timestamptz default now()
);

create table files (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  project_id uuid,
  uploaded_by uuid references people(id),
  path text not null,
  name text not null,
  mime_type text,
  size_bytes bigint,
  category text check (category in ('brand', 'content', 'design', 'code', 'legal', 'deliverable', 'signed')),
  created_at timestamptz default now()
);

-- ============================================
-- WAVE 4: SALES ENGINE
-- ============================================

create table leads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  company_name text not null,
  domain text,
  website_url text,
  location_city text,
  location_country text,
  estimated_revenue text,
  employee_count text,
  tech_stack text[] default '{}',
  source text,
  status text default 'new' check (status in ('new', 'enriching', 'scored', 'qualified', 'disqualified', 'nurture')),
  score int default 0,
  score_breakdown jsonb default '{}',
  research_brief jsonb,
  assigned_to uuid references people(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- WAVE 5: COMMERCIAL ENGINE
-- ============================================

-- Deals (pipeline) — with FULL 15-stage pipeline from TypeScript types
create table deals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  lead_id uuid references leads(id),
  name text not null,
  stage text default 'researching' check (stage in (
    'lead', 'researching', 'outreach_ready', 'engaged',
    'discovery_scheduled', 'discovery_completed', 'scoping',
    'proposal_sent', 'negotiation', 'agreement_sent',
    'awaiting_initial_payment', 'won_kickoff', 'won', 'lost', 'cancelled'
  )),
  value_cents int default 0,
  currency text default 'USD',
  probability int default 50,
  expected_close_date date,
  assigned_to uuid references people(id),
  lost_reason text,

  -- Prospect info
  company_name text,
  website text,
  contact_email text,
  contact_phone text,
  country text,
  timezone text,
  industry text,
  lead_source text,
  business_description text,
  current_situation text,
  problem_evidence text,
  commercial_opportunity text,
  trigger_event text,
  known_concerns text,
  recommended_service text,

  -- Relationship
  source text,
  source_detail text,
  how_it_started text,
  relationship_context text,
  client_technical_sophistication text,

  -- Assessment (1-10 scores)
  business_value int,
  buying_power int,
  problem_severity int,
  urgency int,
  fit_score int,
  opportunity_score int,

  -- Discovery
  discovery_status text check (discovery_status in ('not_started', 'scheduled', 'in_progress', 'complete')),
  discovery_date timestamptz,
  discovery_notes text,
  business_objective text,
  why_now text,
  current_problem text,
  desired_outcome text,
  success_criteria text,
  technical_constraints text,
  seo_risks text,
  client_timeline text,
  commercial_expectations text,
  unknowns text,
  discovery_decision_brief text,
  discovery_next_step text,

  -- Scoping
  proposed_deliverables text,
  in_scope text,
  out_of_scope text,
  assumptions text,
  client_dependencies text,
  technical_unknowns text,
  technical_risks text,
  seo_migration_risks text,

  -- Internal pricing
  estimated_complexity text check (estimated_complexity in ('low', 'medium', 'high', 'very_high')),
  estimated_internal_effort_hours numeric(8,1),
  contingency_percentage int,
  minimum_acceptable_price_cents int,
  recommended_price_cents int,
  internal_estimate_cents int,
  proposed_price_cents int,
  agreed_price_cents int,
  payment_structure text,

  -- Service & risk
  service_category text check (service_category in (
    'websites', 'monthly_optimization', 'ai_agents', 'ai_email',
    'lead_response', 'crm_automation', 'whatsapp_sms',
    'appointment_systems', 'ai_knowledge', 'custom_dashboards'
  )),
  technical_risk text check (technical_risk in (
    'clean_slate', 'mild_legacy', 'deep_legacy', 'cms_only',
    'platform_lock', 'migration_required'
  )),
  seo_risk text check (seo_risk in (
    'greenfield', 'low', 'medium', 'high', 'very_high', 'rebuild_with_migration'
  )),

  -- Payment gate
  payment_gate_status jsonb default '{}',

  -- Contact
  primary_contact_id uuid references people(id),

  -- Actions
  next_action text,
  next_action_at timestamptz,
  last_contact_at timestamptz,
  services_interested text[] default '{}',
  strongest_problem text,
  personalization_angle text,
  notes text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Workstreams (per-deal sub-scopes)
create table workstreams (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references deals(id) on delete cascade,
  label text not null,
  description text,
  creative_freedom text,
  seo_sensitivity text,
  scope_notes text,
  status text not null default 'needs_discovery'
    check (status in ('needs_discovery','discovering','scoped','ready_to_price','priced','agreed')),
  estimated_price_cents integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_workstreams_deal_id on workstreams(deal_id);

create table proposals (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  template_id uuid references templates(id),
  version int default 1,
  status text default 'draft' check (status in ('draft', 'internal_review', 'sent', 'viewed', 'accepted', 'rejected', 'expired')),
  content_md text not null,
  merge_data jsonb default '{}',
  pricing jsonb,
  sent_at timestamptz,
  viewed_at timestamptz,
  expires_at timestamptz,
  created_by uuid references people(id),
  created_at timestamptz default now()
);

create table contracts (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  proposal_id uuid references proposals(id),
  template_id uuid references templates(id),
  status text default 'draft' check (status in ('draft', 'internal_review', 'sent_for_signature', 'signed', 'expired')),
  content_md text not null,
  merge_data jsonb default '{}',
  esignature_id text,
  signed_at timestamptz,
  signed_by jsonb default '[]',
  created_at timestamptz default now()
);

-- ============================================
-- WAVE 6: CLIENT EXPERIENCE
-- ============================================

create table projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  client_org_id uuid references organizations(id),
  deal_id uuid references deals(id),
  name text not null,
  type text check (type in ('website', 'standard_site', 'premium_site', 'redesign', 'legacy_modernization', 'seo_migration', 'performance', 'dashboard', 'automation')),
  service_category text,
  status text default 'onboarding' check (status in ('onboarding', 'active', 'internal_qa', 'client_review', 'on_hold', 'post_launch_monitoring', 'completed', 'cancelled')),
  phase text default 'discovery' check (phase in ('discovery', 'design', 'build', 'qa', 'launch', 'handover')),
  start_date date,
  target_launch_date date,
  actual_launch_date date,
  project_manager_id uuid references people(id),
  description text,
  health text default 'green' check (health in ('green', 'yellow', 'red')),
  risk_level text default 'low' check (risk_level in ('low', 'medium', 'high', 'critical')),
  scope_summary text,
  current_blocker text,
  next_milestone text,
  contract_value_cents int default 0,
  assigned_to uuid references people(id),
  reviewer_id uuid references people(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table project_phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  order_index int not null,
  status text default 'pending' check (status in ('pending', 'active', 'in_review', 'approved', 'blocked')),
  started_at timestamptz,
  approved_at timestamptz,
  approved_by uuid references people(id),
  deliverables jsonb default '[]',
  created_at timestamptz default now()
);

create table approvals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  phase_id uuid references project_phases(id),
  type text check (type in ('design', 'content', 'scope', 'final', 'launch')),
  title text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'changes_requested')),
  requested_at timestamptz default now(),
  responded_at timestamptz,
  responded_by uuid references people(id),
  feedback text,
  version int default 1,
  created_at timestamptz default now()
);

create table feedback_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  phase_id uuid references project_phases(id),
  page_component text not null,
  screenshot_url text,
  comment text not null,
  priority text default 'medium' check (priority in ('critical', 'high', 'medium', 'low')),
  revision_round int default 1,
  status text default 'open' check (status in ('open', 'acknowledged', 'in_progress', 'resolved', 'wont_fix', 'out_of_scope')),
  submitted_by uuid references people(id),
  assigned_to uuid references people(id),
  resolved_at timestamptz,
  created_at timestamptz default now()
);

create table change_orders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  request_id uuid references feedback_items(id),
  reason text not null,
  scope_description text,
  cost_impact_cents int,
  timeline_impact_days int,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'superseded')),
  approved_at timestamptz,
  approved_by uuid references people(id),
  invoice_id uuid,
  created_at timestamptz default now()
);

-- ============================================
-- WAVE 5: FINANCE
-- ============================================

create table invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  client_org_id uuid references organizations(id),
  project_id uuid references projects(id),
  deal_id uuid references deals(id),
  number text unique not null,
  status text default 'draft' check (status in ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled')),
  type text check (type in ('advance', 'milestone', 'final', 'retainer', 'change_order', 'ad_hoc')),
  amount_cents int not null,
  currency text default 'USD',
  due_date date,
  paid_at timestamptz,
  stripe_invoice_id text,
  line_items jsonb not null default '[]',
  sent_at timestamptz,
  adhoc_reason text,
  created_at timestamptz default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  amount_cents int not null,
  currency text default 'USD',
  method text check (method in ('stripe', 'wise', 'bank', 'manual')),
  reference text,
  status text default 'pending' check (status in ('pending', 'cleared', 'failed', 'refunded')),
  received_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================
-- CLIENTS (must come before client_websites / client_onboarding)
-- ============================================

create table clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) unique not null,
  primary_contact_id uuid references people(id),
  account_owner_id uuid references people(id),
  status text default 'active' check (status in ('active', 'onboarding', 'at_risk', 'churned')),
  client_since date,
  communication_preference text check (communication_preference in ('email', 'phone', 'whatsapp', 'async')),
  health text default 'green' check (health in ('green', 'yellow', 'red')),
  expansion_potential text default 'low' check (expansion_potential in ('low', 'medium', 'high')),
  notes text,
  service_interest text[] default '{}',
  lifetime_value_one_time int default 0,
  lifetime_value_recurring int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- CLIENT ONBOARDING
-- ============================================

create table client_onboarding (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  module text check (module in ('brand', 'content', 'access', 'stakeholders', 'communication')),
  status text default 'pending' check (status in ('pending', 'in_progress', 'submitted', 'validated', 'complete')),
  required boolean default true,
  due_date date,
  submitted_data jsonb,
  validated_by uuid references people(id),
  validated_at timestamptz,
  created_at timestamptz default now()
);

-- Client websites
create table client_websites (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  domain text not null,
  approx_domain_age text,
  current_cms text,
  hosting text,
  seo_sensitivity text,
  notes text,
  created_at timestamptz default now()
);

-- ============================================
-- WAVE 8: QUALITY & LAUNCH
-- ============================================

create table qa_checklists (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  phase_id uuid references project_phases(id),
  template_id uuid,
  items jsonb not null default '[]',
  overall_status text default 'pending' check (overall_status in ('pending', 'in_progress', 'passed', 'failed')),
  completed_at timestamptz,
  created_at timestamptz default now()
);

create table launch_gates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  qa_passed boolean default false,
  client_approved boolean default false,
  payment_cleared boolean default false,
  rollback_ready boolean default false,
  dns_verified boolean default false,
  ssl_verified boolean default false,
  analytics_verified boolean default false,
  forms_verified boolean default false,
  status text default 'pending' check (status in ('pending', 'ready', 'launched', 'rolled_back')),
  launched_at timestamptz,
  launched_by uuid references people(id),
  rollback_reason text,
  created_at timestamptz default now()
);

-- ============================================
-- WAVE 10: KNOWLEDGE BASE
-- ============================================

create table knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  category text check (category in ('process', 'standard', 'lesson', 'technical_pattern', 'sales_objection', 'pricing_decision', 'postmortem')),
  title text not null,
  content_md text not null,
  tags text[] default '{}',
  author_id uuid references people(id),
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- CLIENT PORTAL: SUPPORT TICKETS
-- ============================================

create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  client_org_id uuid references organizations(id),
  title text not null,
  description text,
  category text check (category in ('bug', 'content_change', 'support', 'enhancement', 'new_scope', 'emergency')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status text default 'submitted' check (status in ('submitted', 'triaged', 'in_progress', 'resolved', 'closed')),
  submitted_by uuid references people(id),
  assigned_to uuid references people(id),
  submitted_at timestamptz default now(),
  resolved_at timestamptz
);

-- ============================================
-- TASKS
-- ============================================

create table tasks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  project_id uuid references projects(id) on delete cascade,
  client_org_id uuid references organizations(id),
  title text not null,
  description text,
  status text default 'backlog' check (status in ('backlog', 'ready', 'in_progress', 'internal_review', 'client_review', 'blocked', 'done')),
  priority text default 'medium' check (priority in ('critical', 'high', 'medium', 'low')),
  work_type text check (work_type in ('design', 'development', 'content', 'qa', 'client_communication', 'admin', 'other')),
  phase text,
  assignee_id uuid references people(id),
  reviewer_id uuid references people(id),
  due_date date,
  estimated_effort_hours numeric(6,1),
  actual_effort_hours numeric(6,1),
  blocked boolean default false,
  blocker_description text,
  waiting_on text,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_tasks_project on tasks(project_id);
create index idx_tasks_assignee on tasks(assignee_id);
create index idx_tasks_status on tasks(status);
create index idx_tasks_due_date on tasks(due_date);

-- ============================================
-- MEETINGS
-- ============================================

create table meetings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  company_id uuid references organizations(id),
  opportunity_id uuid references deals(id),
  project_id uuid references projects(id),
  title text not null,
  type text check (type in ('discovery', 'scope', 'proposal', 'kickoff', 'project_review', 'client_feedback', 'retainer_review', 'internal_review', 'retrospective')),
  owner_id uuid references people(id),
  meeting_date timestamptz not null,
  duration_minutes int,
  attendees jsonb default '[]',
  objective text,
  notes text,
  decisions text,
  next_steps text,
  follow_up_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_meetings_company on meetings(company_id);
create index idx_meetings_project on meetings(project_id);
create index idx_meetings_date on meetings(meeting_date);

-- ============================================
-- ROW LEVEL SECURITY (permissive for now)
-- ============================================

alter table organizations enable row level security;
alter table people enable row level security;
alter table events enable row level security;
alter table templates enable row level security;
alter table files enable row level security;
alter table leads enable row level security;
alter table deals enable row level security;
alter table workstreams enable row level security;
alter table proposals enable row level security;
alter table contracts enable row level security;
alter table projects enable row level security;
alter table project_phases enable row level security;
alter table approvals enable row level security;
alter table feedback_items enable row level security;
alter table change_orders enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;
alter table client_onboarding enable row level security;
alter table client_websites enable row level security;
alter table qa_checklists enable row level security;
alter table launch_gates enable row level security;
alter table knowledge_articles enable row level security;
alter table support_tickets enable row level security;
alter table tasks enable row level security;
alter table meetings enable row level security;
alter table clients enable row level security;

-- Permissive policies (allow all authenticated + anon for dev)
-- Replace with proper policies before going production
do $$
declare
  tbl text;
begin
  for tbl in 
    select unnest(array[
      'organizations', 'people', 'events', 'templates', 'files',
      'leads', 'deals', 'workstreams', 'proposals', 'contracts',
      'projects', 'project_phases', 'approvals', 'feedback_items',
      'change_orders', 'invoices', 'payments', 'client_onboarding',
      'client_websites', 'qa_checklists', 'launch_gates',
      'knowledge_articles', 'support_tickets', 'tasks', 'meetings', 'clients'
    ])
  loop
    execute format('
      create policy "Allow all on %I" on %I
        for all
        using (true)
        with check (true);
    ', tbl, tbl);
  end loop;
end $$;

-- ============================================
-- SEED DATA
-- ============================================

-- Triadict studio organization
insert into organizations (id, name, slug, type, settings) values
  ('00000000-0000-0000-0000-000000000001', 'Triadict Studio', 'triadict', 'studio', '{"location": "Pune, India", "email": "hello@triadic.studio", "phone": "+91 826 299 6104"}');

-- Team members
insert into people (id, org_id, email, full_name, role, supabase_user_id) values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'urban.void.69@gmail.com', 'Aditya Suryavanshi', 'admin', null),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'shr.mail.box@gmail.com', 'Shreeshant Bokade', 'designer', null),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'prajwalvalekar08@gmail.com', 'Prajwal Valekar', 'strategist', null);

-- Project templates
insert into templates (org_id, category, name, content_md, merge_fields, locked_sections) values
  ('00000000-0000-0000-0000-000000000001', 'proposal', 'Standard Website Proposal',
   '# {{project_name}} Proposal\n\n## The Brief\n{{brief}}\n\n## Our Approach\n{{approach}}\n\n## Scope\n{{scope}}\n\n## Timeline\n{{timeline}}\n\n## Investment\n{{pricing}}\n\n## Next Steps\n{{next_steps}}',
   '["project_name", "brief", "approach", "scope", "timeline", "pricing", "next_steps"]',
   '["pricing"]'),
  ('00000000-0000-0000-0000-000000000001', 'sow', 'Standard SOW',
   '# Statement of Work\n\n## Project: {{project_name}}\n\n## Deliverables\n{{deliverables}}\n\n## Timeline\n{{timeline}}\n\n## Exclusions\n{{exclusions}}\n\n## Revision Policy\n{{revisions}}\n\n## Acceptance Criteria\n{{acceptance}}',
   '["project_name", "deliverables", "timeline", "exclusions", "revisions", "acceptance"]',
   '["revisions"]');
