-- Triadict Studio - Tasks & Meetings
-- Adds task management and meeting tracking

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
-- CLIENTS (profile extension for organizations)
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
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- Update deals table with extended pipeline stages
-- ============================================
alter table deals drop constraint if exists deals_stage_check;
alter table deals add constraint deals_stage_check 
  check (stage in ('researching', 'qualified', 'outreach_ready', 'contacted', 'replied', 'positive_reply', 'discovery_scheduled', 'discovery_complete', 'scoping', 'proposal_sent', 'negotiation', 'verbal_yes', 'won', 'lost', 'nurture'));

-- Add new columns to deals
alter table deals add column if not exists source text;
alter table deals add column if not exists next_action text;
alter table deals add column if not exists next_action_at date;
alter table deals add column if not exists last_contact_at timestamptz;
alter table deals add column if not exists services_interested text[] default '{}';
alter table deals add column if not exists strongest_problem text;
alter table deals add column if not exists personalization_angle text;
alter table deals add column if not exists notes text;

-- Add contact relationship to deals
alter table deals add column if not exists primary_contact_id uuid references people(id);

-- Add new columns to projects
alter table projects add column if not exists description text;
alter table projects add column if not exists health text default 'green' check (health in ('green', 'yellow', 'red'));
alter table projects add column if not exists risk_level text default 'low' check (risk_level in ('low', 'medium', 'high', 'critical'));
alter table projects add column if not exists scope_summary text;
alter table projects add column if not exists current_blocker text;
alter table projects add column if not exists next_milestone text;
alter table projects add column if not exists contract_value_cents int default 0;
alter table projects add column if not exists assigned_to uuid references people(id);
alter table projects add column if not exists reviewer_id uuid references people(id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table tasks enable row level security;
alter table meetings enable row level security;
alter table clients enable row level security;
