/**
 * Mock data for dev mode (when Supabase isn't configured).
 * Returns Eve Olasov + her company so the pipeline isn't empty.
 */

import type { Organization, Person, Deal, Workstream, Client, ClientWebsite } from "@/types/database"

const now = new Date().toISOString()

/* ── Company ── */
const eveCompany: Organization = {
  id: "eve-olasov-company-001",
  name: "Eve Olasov Real Estate",
  slug: "eve-olasov-real-estate",
  type: "client",
  settings: {
    industry: "Real Estate",
    country: "USA",
    city: "Charleston, South Carolina",
    website: null,
    business_type: "Real Estate Professional / Brokerage Owner",
    notes: "Long-established Charleston real estate professional and brokerage owner. Multiple legacy websites with decades of SEO history. Previous television programming background. Unique 1.5% listing proposition.",
  },
  created_at: now,
}

/* ── Contact ── */
const eveContact: Person = {
  id: "eve-olasov-contact-001",
  org_id: eveCompany.id,
  email: "eve@olasov.com",
  full_name: "Eve Olasov",
  role: "client_stakeholder",
  avatar_url: null,
  supabase_user_id: null,
  created_at: now,
}

/* ── Workstreams (3 websites) ── */
const eveWorkstreams: Workstream[] = [
  {
    id: "eve-ws-1",
    deal_id: "eve-olasov-deal-001",
    label: "Website 1",
    description: "Primary website. Creative freedom: High. SEO sensitivity: Medium to High.",
    creative_freedom: "high",
    seo_sensitivity: "medium_high",
    scope_notes: null,
    status: "needs_discovery",
    estimated_price_cents: null,
    sort_order: 0,
    created_at: now,
    updated_at: now,
  },
  {
    id: "eve-ws-2",
    deal_id: "eve-olasov-deal-001",
    label: "Website 2",
    description: "Secondary website. Creative freedom: Limited. SEO sensitivity: High. Legacy risk: High.",
    creative_freedom: "limited",
    seo_sensitivity: "high",
    scope_notes: null,
    status: "needs_discovery",
    estimated_price_cents: null,
    sort_order: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: "eve-ws-3",
    deal_id: "eve-olasov-deal-001",
    label: "Website 3",
    description: "Tertiary website. Creative freedom: Limited. SEO sensitivity: High. Legacy risk: High.",
    creative_freedom: "limited",
    seo_sensitivity: "high",
    scope_notes: null,
    status: "needs_discovery",
    estimated_price_cents: null,
    sort_order: 2,
    created_at: now,
    updated_at: now,
  },
]

/* ── Deal ── */
const eveDeal: Deal = {
  id: "eve-olasov-deal-001",
  org_id: "00000000-0000-0000-0000-000000000001",
  lead_id: null,
  name: "Eve Olasov – Multi-Site Website Modernization",
  stage: "discovery_scheduled",
  value_cents: 0,
  currency: "USD",
  probability: 70,
  source: "Personalized Cold Outreach",
  next_action: "Schedule discovery meeting",
  next_action_at: null,
  last_contact_at: now,
  services_interested: ["websites"],
  strongest_problem: "Multiple legacy websites need modernization without damaging decades of SEO equity.",
  personalization_angle: "Research-based outreach with custom demo. Appreciates technical expertise.",
  notes: "POTENTIAL FLAGSHIP INTERNATIONAL CLIENT.\n\nShould become the first complete case study for Triadict.\n\nMust avoid overscoping. Must avoid SEO liability.\n\nRecommend phased implementation.\n\nStrong recurring revenue potential after launch.\n\nRisks: legacy websites, SEO-sensitive redesign, large unknown scope, multiple websites, potential content migration, unknown integrations/hosting/CMS/workflow.\n\nFuture expansion: website optimization retainer, CWV monitoring, technical SEO monitoring, analytics reporting, landing pages, UX improvements, AI chatbot, lead qualification AI, CRM automation, email automation, custom dashboard, workflow automation.",
  primary_contact_id: eveContact.id,
  expected_close_date: null,
  assigned_to: null,
  lost_reason: null,

  // Prospect info
  company_name: "Eve Olasov Real Estate",
  website: null,
  contact_email: "eve@olasov.com",
  contact_phone: null,
  country: "USA",
  timezone: "America/New_York",
  industry: "Real Estate",
  lead_source: "Personalized Cold Outreach",
  business_description: "Long-established Charleston real estate professional and brokerage owner. Strong business reputation, excellent market credibility, previous television programming background. Unique 1.5% listing proposition. Digital presence does not currently communicate the strength of the business as effectively as it could.",
  current_situation: "Multiple legacy websites built with HTML5/Dreamweaver. Client maintains content personally. Sites contain valuable SEO history accumulated over decades. Recently improved CLS from ~0.22 to 0.001 herself. Understands Core Web Vitals. Technically above-average client.",
  problem_evidence: null,
  commercial_opportunity: null,
  trigger_event: null,
  known_concerns: "SEO preservation during migration. Content migration complexity. Unknown hosting/integration dependencies. Large unknown scope across 3 sites.",
  recommended_service: null,

  // Relationship
  source_detail: "Research-based outreach with custom website demo. Relationship developed through multiple email conversations.",
  how_it_started: "Triadict researched Eve's business, built a custom demo, and sent a highly personalized outreach email. She responded positively and confirmed intent to use Triadict's services.",
  relationship_context: "Positive. Professional. High trust. Responsive. Technically engaged. Interested in working together.",

  // Assessment
  client_technical_sophistication: "Above average — maintains sites herself in Dreamweaver, understands Core Web Vitals, improved CLS from 0.22 to 0.001 independently",
  business_value: 9,
  buying_power: 8,
  problem_severity: 7,
  urgency: 6,
  fit_score: 9,
  opportunity_score: 8,

  // Discovery
  discovery_status: "scheduled",
  discovery_date: null,
  discovery_notes: "DISCOVERY CHECKLIST:\n\n- [ ] Understand purpose of each website\n- [ ] Identify priority website\n- [ ] Understand current workflow\n- [ ] Review hosting\n- [ ] Review domains\n- [ ] Review DNS\n- [ ] Review Search Console\n- [ ] Review Analytics\n- [ ] Review ranking-sensitive pages\n- [ ] Review content structure\n- [ ] Review forms\n- [ ] Review integrations\n- [ ] Review branding constraints\n- [ ] Understand desired redesign freedom\n- [ ] Determine launch priorities\n- [ ] Determine budget expectations\n- [ ] Determine timeline\n\nNEXT ACTIONS:\n- Schedule discovery meeting\n- Map all three websites\n- Perform technical audit\n- Perform SEO audit\n- Separate scopes\n- Estimate complexity\n- Create proposal\n- Finalize pricing\n- Present proposal",
  business_objective: null,
  why_now: null,
  current_problem: null,
  desired_outcome: null,
  success_criteria: null,
  technical_constraints: "HTML5, Dreamweaver, client-maintained content. Must preserve SEO equity across all domains. Legacy hosting. Unknown integrations.",
  seo_risks: "High — decades of SEO history on each site. Any migration must be carefully planned to preserve rankings. Client is very protective of SEO equity.",
  client_timeline: null,
  commercial_expectations: "Not discussed with client yet. Internal estimate TBD after discovery.",
  unknowns: "Hosting details, DNS setup, Search Console access, Analytics access, full integrations list, content volume per site, branding constraints, budget expectations, timeline preferences.",
  discovery_decision_brief: null,
  discovery_next_step: null,

  // Scoping
  proposed_deliverables: null,
  in_scope: null,
  out_of_scope: null,
  assumptions: null,
  client_dependencies: null,
  technical_unknowns: "Hosting provider, DNS configuration, email hosting, third-party integrations, analytics setup, Search Console verification, content management workflow details.",
  technical_risks: "High — legacy HTML5/Dreamweaver sites with decades of SEO history. Migration must be carefully phased to avoid ranking losses.",
  seo_migration_risks: "Very high — any URL changes, content moves, or technical stack changes could impact established rankings. Requires detailed SEO audit before any work begins.",
  estimated_complexity: "high",
  estimated_internal_effort_hours: null,
  contingency_percentage: null,
  minimum_acceptable_price_cents: null,
  recommended_price_cents: null,
  internal_estimate_cents: null,
  proposed_price_cents: null,
  agreed_price_cents: null,
  payment_structure: null,

  // Service & risk
  service_category: "websites",
  technical_risk: "high",
  seo_risk: "high",

  // Payment gate
  payment_gate_status: {
    scope_agreed: false,
    agreement_signed: false,
    sow_approved: false,
    initial_payment_received: false,
    scope_agreed_at: null,
    agreement_signed_at: null,
    sow_approved_at: null,
    initial_payment_received_at: null,
  },

  created_at: now,
  updated_at: now,

  // Joined relations (empty for mock — detail page can use direct refs)
  assignee: undefined,
  lead: undefined,
  primary_contact: eveContact,
  workstreams: eveWorkstreams,
}

/* ── Client record ── */
const eveClient: Client & { organization?: Organization } = {
  id: "eve-olasov-client-001",
  org_id: "00000000-0000-0000-0000-000000000001",
  primary_contact_id: eveContact.id,
  account_owner_id: null,
  status: "active",
  client_since: now,
  communication_preference: "email",
  health: "green",
  expansion_potential: "high — 3 websites + ongoing optimization + AI systems",
  notes: "Potential flagship international client. Strong recurring revenue potential after launch.",
  service_interest: ["websites"],
  lifetime_value_one_time: 0,
  lifetime_value_recurring: 0,
  created_at: now,
  updated_at: now,
  organization: eveCompany,
  primary_contact: eveContact,
}

/* ── Client websites ── */
const eveWebsites: ClientWebsite[] = [
  {
    id: "eve-site-1",
    client_id: eveClient.id,
    domain: "olasov.com",
    approx_domain_age: "20+ years",
    current_cms: "HTML5 / Dreamweaver",
    hosting: "Unknown",
    seo_sensitivity: "high",
    notes: "Primary site. High creative freedom. Medium to high SEO sensitivity.",
    created_at: now,
  },
  {
    id: "eve-site-2",
    client_id: eveClient.id,
    domain: "olasov-realestate.com",
    approx_domain_age: "15+ years",
    current_cms: "HTML5 / Dreamweaver",
    hosting: "Unknown",
    seo_sensitivity: "high",
    notes: "Secondary site. Limited creative freedom. High SEO sensitivity. High legacy risk.",
    created_at: now,
  },
  {
    id: "eve-site-3",
    client_id: eveClient.id,
    domain: "eveolasov.com",
    approx_domain_age: "15+ years",
    current_cms: "HTML5 / Dreamweaver",
    hosting: "Unknown",
    seo_sensitivity: "high",
    notes: "Tertiary site. Limited creative freedom. High SEO sensitivity. High legacy risk.",
    created_at: now,
  },
]

/* ── Exports ── */

export const mockOrganizations: Organization[] = [eveCompany]
export const mockPeople: Person[] = [eveContact]
export const mockDeals: Deal[] = [eveDeal]
export const mockWorkstreams: Workstream[] = eveWorkstreams
export const mockClients: (Client & { organization?: Organization })[] = [eveClient]
export const mockWebsites: ClientWebsite[] = eveWebsites
