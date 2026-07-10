// Database types for Triadict Studio

export type OrganizationType = 'studio' | 'client'
export type PersonRole = 'admin' | 'engineer' | 'designer' | 'strategist' | 'client_owner' | 'client_stakeholder'
export type DealStage = 'researching' | 'qualified' | 'outreach_ready' | 'contacted' | 'replied' | 'positive_reply' | 'discovery_scheduled' | 'discovery_complete' | 'scoping' | 'proposal_sent' | 'negotiation' | 'verbal_yes' | 'won' | 'lost' | 'nurture'
export type TaskStatus = 'backlog' | 'ready' | 'in_progress' | 'internal_review' | 'client_review' | 'blocked' | 'done'
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low'
export type MeetingType = 'discovery' | 'scope' | 'proposal' | 'kickoff' | 'project_review' | 'client_feedback' | 'retainer_review' | 'internal_review' | 'retrospective'
export type ClientStatus = 'active' | 'onboarding' | 'at_risk' | 'churned'
export type ClientHealth = 'green' | 'yellow' | 'red'
export type HealthStatus = 'green' | 'yellow' | 'red'
export type ProjectStatus = 'onboarding' | 'active' | 'on_hold' | 'completed' | 'cancelled'
export type ProjectPhase = 'discovery' | 'design' | 'build' | 'qa' | 'launch' | 'handover'
export type ApprovalType = 'design' | 'content' | 'scope' | 'final' | 'launch'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested'
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
export type InvoiceType = 'advance' | 'milestone' | 'final' | 'retainer' | 'change_order'
export type PaymentStatus = 'pending' | 'cleared' | 'failed' | 'refunded'
export type PaymentMethod = 'stripe' | 'wise' | 'bank' | 'manual'
export type FeedbackPriority = 'critical' | 'high' | 'medium' | 'low'
export type FeedbackStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'wont_fix' | 'out_of_scope'
export type TicketCategory = 'bug' | 'content_change' | 'support' | 'enhancement' | 'new_scope' | 'emergency'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TicketStatus = 'submitted' | 'triaged' | 'in_progress' | 'resolved' | 'closed'

export interface Organization {
  id: string
  name: string
  slug: string
  type: OrganizationType
  settings: Record<string, unknown>
  created_at: string
}

export interface Person {
  id: string
  org_id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: PersonRole
  supabase_user_id: string | null
  created_at: string
}

export interface Deal {
  id: string
  org_id: string
  lead_id: string | null
  name: string
  stage: DealStage
  value_cents: number
  currency: string
  probability: number
  source: string | null
  next_action: string | null
  next_action_at: string | null
  last_contact_at: string | null
  services_interested: string[]
  strongest_problem: string | null
  personalization_angle: string | null
  notes: string | null
  primary_contact_id: string | null
  expected_close_date: string | null
  assigned_to: string | null
  lost_reason: string | null
  created_at: string
  updated_at: string
  assignee?: Person
  lead?: Lead
  primary_contact?: Person
}

export interface Task {
  id: string
  org_id: string
  project_id: string | null
  client_org_id: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  work_type: string | null
  phase: string | null
  assignee_id: string | null
  reviewer_id: string | null
  due_date: string | null
  estimated_effort_hours: number | null
  actual_effort_hours: number | null
  blocked: boolean
  blocker_description: string | null
  waiting_on: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  assignee?: Person
  reviewer?: Person
  project?: Project
}

export interface Meeting {
  id: string
  org_id: string
  company_id: string | null
  opportunity_id: string | null
  project_id: string | null
  title: string
  type: MeetingType
  owner_id: string | null
  meeting_date: string
  duration_minutes: number | null
  attendees: Record<string, unknown>[]
  objective: string | null
  notes: string | null
  decisions: string | null
  next_steps: string | null
  follow_up_date: string | null
  created_at: string
  updated_at: string
  owner?: Person
}

export interface Client {
  id: string
  org_id: string
  primary_contact_id: string | null
  account_owner_id: string | null
  status: ClientStatus
  client_since: string | null
  communication_preference: string | null
  health: ClientHealth
  expansion_potential: string | null
  notes: string | null
  created_at: string
  updated_at: string
  organization?: Organization
  primary_contact?: Person
  account_owner?: Person
}

export interface Lead {
  id: string
  org_id: string
  icp_profile_id: string | null
  company_name: string
  domain: string | null
  website_url: string | null
  location_city: string | null
  location_country: string | null
  estimated_revenue: string | null
  employee_count: string | null
  tech_stack: string[]
  source: string
  status: 'new' | 'enriching' | 'scored' | 'qualified' | 'disqualified' | 'nurture'
  score: number
  score_breakdown: Record<string, number>
  research_brief: Record<string, unknown> | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  org_id: string
  client_org_id: string
  deal_id: string | null
  name: string
  type: 'standard_site' | 'premium_site' | 'redesign' | 'legacy_modernization' | 'seo_migration' | 'performance' | 'dashboard' | 'automation'
  status: ProjectStatus
  phase: ProjectPhase
  description: string | null
  health: HealthStatus
  risk_level: string | null
  scope_summary: string | null
  current_blocker: string | null
  next_milestone: string | null
  contract_value_cents: number
  assigned_to: string | null
  reviewer_id: string | null
  start_date: string | null
  target_launch_date: string | null
  actual_launch_date: string | null
  project_manager_id: string | null
  created_at: string
  updated_at: string
  // Joined data
  client?: Organization
  project_manager?: Person
  phases?: ProjectPhaseItem[]
  deal?: Deal
  tasks?: Task[]
}

export interface ProjectPhaseItem {
  id: string
  project_id: string
  template_id: string | null
  name: string
  order_index: number
  status: 'pending' | 'active' | 'in_review' | 'approved' | 'blocked'
  started_at: string | null
  approved_at: string | null
  approved_by: string | null
  deliverables: Deliverable[]
  created_at: string
}

export interface Deliverable {
  name: string
  description: string
  file_id: string | null
  status: 'pending' | 'in_progress' | 'complete'
}

export interface Approval {
  id: string
  project_id: string
  phase_id: string | null
  type: ApprovalType
  title: string
  description: string | null
  status: ApprovalStatus
  requested_at: string
  responded_at: string | null
  responded_by: string | null
  feedback: string | null
  version: number
  created_at: string
}

export interface FeedbackItem {
  id: string
  project_id: string
  phase_id: string | null
  page_component: string
  screenshot_url: string | null
  comment: string
  priority: FeedbackPriority
  revision_round: number
  status: FeedbackStatus
  submitted_by: string | null
  assigned_to: string | null
  resolved_at: string | null
  created_at: string
}

export interface ChangeOrder {
  id: string
  project_id: string
  request_id: string | null
  reason: string
  scope_description: string | null
  cost_impact_cents: number | null
  timeline_impact_days: number | null
  status: 'pending' | 'approved' | 'rejected' | 'superseded'
  approved_at: string | null
  approved_by: string | null
  invoice_id: string | null
  created_at: string
}

export interface Proposal {
  id: string
  deal_id: string
  template_id: string | null
  version: number
  status: 'draft' | 'internal_review' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'
  content_md: string
  merge_data: Record<string, unknown>
  pricing: PricingOptions | null
  sent_at: string | null
  viewed_at: string | null
  expires_at: string | null
  created_by: string | null
  created_at: string
}

export interface PricingOptions {
  options: PricingOption[]
  selected: string | null
  calculator_inputs: Record<string, number>
}

export interface PricingOption {
  id: string
  name: string
  description: string
  price_cents: number
  features: string[]
}

export interface Contract {
  id: string
  deal_id: string
  proposal_id: string | null
  template_id: string | null
  status: 'draft' | 'internal_review' | 'sent_for_signature' | 'signed' | 'expired'
  content_md: string
  merge_data: Record<string, unknown>
  esignature_id: string | null
  signed_at: string | null
  signed_by: SignatureRecord[]
  created_at: string
}

export interface SignatureRecord {
  person_id: string
  role: string
  signed_at: string
  ip: string
}

export interface SowDocument {
  id: string
  contract_id: string
  template_id: string | null
  version: number
  content_md: string
  merge_data: Record<string, unknown>
  status: 'draft' | 'approved' | 'active' | 'completed' | 'amended'
  approved_at: string | null
  approved_by: string | null
  created_at: string
}

export interface Invoice {
  id: string
  org_id: string
  client_org_id: string
  project_id: string | null
  deal_id: string | null
  number: string
  status: InvoiceStatus
  type: InvoiceType
  amount_cents: number
  currency: string
  due_date: string | null
  paid_at: string | null
  stripe_invoice_id: string | null
  line_items: InvoiceLineItem[]
  sent_at: string | null
  created_at: string
}

export interface InvoiceLineItem {
  description: string
  quantity: number
  unit_price_cents: number
  amount_cents: number
}

export interface Payment {
  id: string
  invoice_id: string
  amount_cents: number
  currency: string
  method: PaymentMethod | null
  reference: string | null
  status: PaymentStatus
  received_at: string | null
  created_at: string
}

export interface ClientOnboarding {
  id: string
  project_id: string
  module: 'brand' | 'content' | 'access' | 'stakeholders' | 'communication'
  status: 'pending' | 'in_progress' | 'submitted' | 'validated' | 'complete'
  required: boolean
  due_date: string | null
  submitted_data: Record<string, unknown> | null
  validated_by: string | null
  validated_at: string | null
  created_at: string
}

export interface SupportTicket {
  id: string
  project_id: string
  client_org_id: string
  title: string
  description: string | null
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  submitted_by: string
  assigned_to: string | null
  submitted_at: string
  resolved_at: string | null
}

export interface QaChecklist {
  id: string
  project_id: string
  phase_id: string | null
  template_id: string | null
  items: QaChecklistItem[]
  overall_status: 'pending' | 'in_progress' | 'passed' | 'failed'
  completed_at: string | null
  created_at: string
}

export interface QaChecklistItem {
  id: string
  category: string
  description: string
  status: 'pending' | 'pass' | 'fail' | 'na'
  tested_by: string | null
  tested_at: string | null
  evidence_url: string | null
}

export interface LaunchGate {
  id: string
  project_id: string
  qa_passed: boolean
  client_approved: boolean
  payment_cleared: boolean
  rollback_ready: boolean
  dns_verified: boolean
  ssl_verified: boolean
  analytics_verified: boolean
  forms_verified: boolean
  status: 'pending' | 'ready' | 'launched' | 'rolled_back'
  launched_at: string | null
  launched_by: string | null
  rollback_reason: string | null
  created_at: string
}

export interface Template {
  id: string
  org_id: string
  category: string
  name: string
  version: number
  content_md: string
  merge_fields: string[]
  locked_sections: string[]
  is_active: boolean
  created_by: string | null
  created_at: string
}

export interface KnowledgeArticle {
  id: string
  org_id: string
  category: 'process' | 'standard' | 'lesson' | 'technical_pattern' | 'sales_objection' | 'pricing_decision' | 'postmortem'
  title: string
  content_md: string
  tags: string[]
  author_id: string | null
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  name: string
  actor_id: string | null
  org_id: string | null
  payload: Record<string, unknown>
  created_at: string
}

export interface FileRecord {
  id: string
  org_id: string
  project_id: string | null
  uploaded_by: string | null
  path: string
  name: string
  mime_type: string | null
  size_bytes: number | null
  category: 'brand' | 'content' | 'design' | 'code' | 'legal' | 'deliverable' | 'signed' | null
  created_at: string
}

// Dashboard aggregated types
export interface DashboardMetrics {
  total_deals: number
  total_pipeline_value: number
  deals_won: number
  deals_lost: number
  close_rate: number
  active_projects: number
  total_revenue: number
  outstanding_invoices: number
  overdue_invoices: number
  mrr: number
}

export interface PipelineStageMetrics {
  stage: DealStage
  count: number
  value: number
}

export interface ProjectHealthItem {
  project_id: string
  project_name: string
  client_name: string
  phase: ProjectPhase
  status: ProjectStatus
  days_remaining: number | null
  approvals_pending: number
  feedback_open: number
  health: HealthStatus
}

// Form types
export interface CreateDealInput {
  name: string
  lead_id?: string
  value_cents: number
  probability: number
  source?: string
  services_interested?: string[]
  strongest_problem?: string
  personalization_angle?: string
  notes?: string
  primary_contact_id?: string
  expected_close_date?: string
  assigned_to?: string
}

export interface UpdateDealStageInput {
  id: string
  stage: DealStage
}

export interface CreateProjectInput {
  name: string
  client_org_id: string
  deal_id?: string
  type: Project['type']
  description?: string
  contract_value_cents?: number
  start_date?: string
  target_launch_date?: string
  project_manager_id?: string
  assigned_to?: string
  reviewer_id?: string
}

export interface CreateTaskInput {
  title: string
  project_id?: string
  client_org_id?: string
  description?: string
  priority?: TaskPriority
  work_type?: string
  assignee_id?: string
  reviewer_id?: string
  due_date?: string
  estimated_effort_hours?: number
}

export interface UpdateTaskInput {
  id: string
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignee_id?: string
  reviewer_id?: string
  due_date?: string | null
  estimated_effort_hours?: number
  actual_effort_hours?: number
  blocked?: boolean
  blocker_description?: string
  waiting_on?: string
}

export interface CreateMeetingInput {
  title: string
  type: MeetingType
  company_id?: string
  opportunity_id?: string
  project_id?: string
  owner_id?: string
  meeting_date: string
  duration_minutes?: number
  objective?: string
  notes?: string
  decisions?: string
  next_steps?: string
  follow_up_date?: string
}

export interface CreateInvoiceInput {
  client_org_id: string
  project_id?: string
  deal_id?: string
  type: InvoiceType
  amount_cents: number
  due_date?: string
  line_items: InvoiceLineItem[]
}

export interface CreatePaymentInput {
  invoice_id: string
  amount_cents: number
  method?: PaymentMethod
  reference?: string
  received_at?: string
}

export interface CreateClientInput {
  org_id: string
  primary_contact_id?: string
  account_owner_id?: string
  client_since?: string
  communication_preference?: string
  notes?: string
}

export interface CreateTicketInput {
  project_id: string
  title: string
  description?: string
  category: TicketCategory
  priority: TicketPriority
}