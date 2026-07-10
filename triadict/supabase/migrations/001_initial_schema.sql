-- Triadict Studio Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- WAVE 1: OPERATING SPINE
-- ============================================

-- Organizations (studio + clients)
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  type text check (type in ('studio', 'client')) not null,
  settings jsonb default '{}',
  created_at timestamptz default now()
);

-- People (team + client contacts)
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

-- Events (canonical event log)
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

-- Templates (versioned with merge fields)
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

-- Files (project assets)
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

-- Leads
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

-- Deals (pipeline)
create table deals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  lead_id uuid references leads(id),
  name text not null,
  stage text default 'qualified' check (stage in ('qualified', 'discovery', 'proposal', 'negotiation', 'won', 'lost')),
  value_cents int default 0,
  currency text default 'USD',
  probability int default 50,
  expected_close_date date,
  assigned_to uuid references people(id),
  lost_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Proposals
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

-- Contracts
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

-- Projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  client_org_id uuid references organizations(id),
  deal_id uuid references deals(id),
  name text not null,
  type text check (type in ('standard_site', 'premium_site', 'redesign', 'legacy_modernization', 'seo_migration', 'performance', 'dashboard', 'automation')),
  status text default 'onboarding' check (status in ('onboarding', 'active', 'on_hold', 'completed', 'cancelled')),
  phase text default 'discovery' check (phase in ('discovery', 'design', 'build', 'qa', 'launch', 'handover')),
  start_date date,
  target_launch_date date,
  actual_launch_date date,
  project_manager_id uuid references people(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Project phases
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

-- Approvals
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

-- Feedback items
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

-- Change orders
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

-- Invoices
create table invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  client_org_id uuid references organizations(id),
  project_id uuid references projects(id),
  deal_id uuid references deals(id),
  number text unique not null,
  status text default 'draft' check (status in ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled')),
  type text check (type in ('advance', 'milestone', 'final', 'retainer', 'change_order')),
  amount_cents int not null,
  currency text default 'USD',
  due_date date,
  paid_at timestamptz,
  stripe_invoice_id text,
  line_items jsonb not null default '[]',
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- Payments
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
-- WAVE 6: CLIENT ONBOARDING
-- ============================================

-- Client onboarding
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

-- ============================================
-- WAVE 8: QUALITY & LAUNCH
-- ============================================

-- QA checklists
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

-- Launch gates
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

-- Knowledge articles
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
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
alter table organizations enable row level security;
alter table people enable row level security;
alter table events enable row level security;
alter table templates enable row level security;
alter table files enable row level security;
alter table leads enable row level security;
alter table deals enable row level security;
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
alter table qa_checklists enable row level security;
alter table launch_gates enable row level security;
alter table knowledge_articles enable row level security;
alter table support_tickets enable row level security;

-- ============================================
-- SEED DATA
-- ============================================

-- Create Triadict studio organization
insert into organizations (id, name, slug, type, settings) values
  ('00000000-0000-0000-0000-000000000001', 'Triadict Studio', 'triadict', 'studio', '{"location": "Pune, India", "email": "hello@triadic.studio", "phone": "+91 826 299 6104"}');

-- Create team members
insert into people (id, org_id, email, full_name, role, supabase_user_id) values
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'urban.void.69@gmail.com', 'Aditya Suryavanshi', 'admin', null),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'shr.mail.box@gmail.com', 'Shreeshant Bokade', 'designer', null),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'prajwalvalekar08@gmail.com', 'Prajwal Valekar', 'strategist', null);

-- Create sample project templates
insert into templates (org_id, category, name, content_md, merge_fields, locked_sections) values
  ('00000000-0000-0000-0000-000000000001', 'proposal', 'Standard Website Proposal', 
   '# {{project_name}} Proposal\n\n## The Brief\n{{brief}}\n\n## Our Approach\n{{approach}}\n\n## Scope\n{{scope}}\n\n## Timeline\n{{timeline}}\n\n## Investment\n{{pricing}}\n\n## Next Steps\n{{next_steps}}',
   '["project_name", "brief", "approach", "scope", "timeline", "pricing", "next_steps"]',
   '["pricing"]'),
  ('00000000-0000-0000-0000-000000000001', 'sow', 'Standard SOW',
   '# Statement of Work\n\n## Project: {{project_name}}\n\n## Deliverables\n{{deliverables}}\n\n## Timeline\n{{timeline}}\n\n## Exclusions\n{{exclusions}}\n\n## Revision Policy\n{{revisions}}\n\n## Acceptance Criteria\n{{acceptance}}',
   '["project_name", "deliverables", "timeline", "exclusions", "revisions", "acceptance"]',
   '["revisions"]');