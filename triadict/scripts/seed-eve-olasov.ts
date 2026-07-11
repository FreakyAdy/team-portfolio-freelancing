/**
 * Seed script: Eve Olasov – Multi-Site Website Modernization
 *
 * Run after Supabase is connected:
 *   npx tsx scripts/seed-eve-olasov.ts
 *
 * Or import and call seedEveOlasov() from a server action / API route.
 */

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const ORG_ID = "00000000-0000-0000-0000-000000000001" // Triadict org

export async function seedEveOlasov() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  console.log("Seeding Eve Olasov opportunity...")

  // 1. Create company
  const { data: company, error: companyErr } = await supabase
    .from("organizations")
    .upsert({
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
    })
    .select()
    .single()

  if (companyErr) {
    console.error("Company error:", companyErr.message)
    return { error: companyErr.message }
  }
  console.log("  Company created:", company.id)

  // 2. Create primary contact
  const { data: contact, error: contactErr } = await supabase
    .from("people")
    .upsert({
      org_id: company.id,
      email: "eve@olasov.com", // placeholder — update with real email
      full_name: "Eve Olasov",
      role: "client_stakeholder",
    })
    .select()
    .single()

  if (contactErr) {
    console.error("Contact error:", contactErr.message)
    return { error: contactErr.message }
  }
  console.log("  Contact created:", contact.id)

  // 3. Create deal
  const { data: deal, error: dealErr } = await supabase
    .from("deals")
    .upsert({
      org_id: ORG_ID,
      name: "Eve Olasov – Multi-Site Website Modernization",
      stage: "discovery_scheduled",
      value_cents: 0, // TBD after discovery
      probability: 70,
      currency: "USD",

      // Prospect info
      company_name: "Eve Olasov Real Estate",
      industry: "Real Estate",
      country: "USA",
      timezone: "America/New_York",
      contact_email: "eve@olasov.com",

      // Source
      source: "Personalized Cold Outreach",
      source_detail: "Research-based outreach with custom website demo. Relationship developed through multiple email conversations.",
      how_it_started: "Triadict researched Eve's business, built a custom demo, and sent a highly personalized outreach email. She responded positively and confirmed intent to use Triadict's services.",

      // Business context
      business_description: "Long-established Charleston real estate professional and brokerage owner. Strong business reputation, excellent market credibility, previous television programming background. Unique 1.5% listing proposition. Digital presence does not currently communicate the strength of the business as effectively as it could.",
      current_situation: "Multiple legacy websites built with HTML5/Dreamweaver. Client maintains content personally. Sites contain valuable SEO history accumulated over decades. Recently improved CLS from ~0.22 to 0.001 herself. Understands Core Web Vitals. Technically above-average client.",

      // Services & problems
      services_interested: ["websites"],
      strongest_problem: "Multiple legacy websites need modernization without damaging decades of SEO equity. Digital presence doesn't match business strength.",
      personalization_angle: "Research-based outreach with custom demo. Appreciates technical expertise. Technically engaged client who understands Core Web Vitals.",

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
      discovery_notes: "DISCOVERY CHECKLIST:\n\n- [ ] Understand purpose of each website\n- [ ] Identify priority website\n- [ ] Understand current workflow\n- [ ] Review hosting\n- [ ] Review domains\n- [ ] Review DNS\n- [ ] Review Search Console\n- [ ] Review Analytics\n- [ ] Review ranking-sensitive pages\n- [ ] Review content structure\n- [ ] Review forms\n- [ ] Review integrations\n- [ ] Review branding constraints\n- [ ] Understand desired redesign freedom\n- [ ] Determine launch priorities\n- [ ] Determine budget expectations\n- [ ] Determine timeline\n\nNEXT ACTIONS:\n- Schedule discovery meeting\n- Map all three websites\n- Perform technical audit\n- Perform SEO audit\n- Separate scopes\n- Estimate complexity\n- Create proposal\n- Finalize pricing\n- Present proposal",

      // Known technical context
      technical_constraints: "HTML5, Dreamweaver, client-maintained content. Must preserve SEO equity across all domains. Legacy hosting. Unknown integrations.",
      seo_risks: "High — decades of SEO history on each site. Any migration must be carefully planned to preserve rankings. Client is very protective of SEO equity.",
      known_concerns: "SEO preservation during migration. Content migration complexity. Unknown hosting/integration dependencies. Large unknown scope across 3 sites.",

      // Commercial
      commercial_expectations: "Not discussed with client yet. Internal estimate TBD after discovery. No proposal sent, no contract signed, no invoice sent, no payment received.",

      // Payment gate (nothing checked yet)
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

      // Service classification
      service_category: "websites",
      technical_risk: "high",
      seo_risk: "high",

      // Notes
      notes: "POTENTIAL FLAGSHIP INTERNATIONAL CLIENT.\n\nShould become the first complete case study for Triadict.\n\nMust avoid overscoping. Must avoid SEO liability.\n\nRecommend phased implementation.\n\nStrong recurring revenue potential after launch.\n\nRisks: legacy websites, SEO-sensitive redesign, large unknown scope, multiple websites, potential content migration, unknown integrations/hosting/CMS/workflow.\n\nFuture expansion: website optimization retainer, CWV monitoring, technical SEO monitoring, analytics reporting, landing pages, UX improvements, AI chatbot, lead qualification AI, CRM automation, email automation, custom dashboard, workflow automation.",
    })
    .select()
    .single()

  if (dealErr) {
    console.error("Deal error:", dealErr.message)
    return { error: dealErr.message }
  }
  console.log("  Deal created:", deal.id)

  // 4. Create 3 workstreams for the 3 websites
  const workstreams = [
    {
      deal_id: deal.id,
      label: "Website 1",
      description: "Primary website — needs discovery. Creative freedom: High. SEO sensitivity: Medium to High.",
      creative_freedom: "high",
      seo_sensitivity: "medium_high",
      status: "needs_discovery" as const,
      sort_order: 0,
    },
    {
      deal_id: deal.id,
      label: "Website 2",
      description: "Secondary website — needs discovery. Creative freedom: Limited. SEO sensitivity: High. Legacy risk: High.",
      creative_freedom: "limited",
      seo_sensitivity: "high",
      status: "needs_discovery" as const,
      sort_order: 1,
    },
    {
      deal_id: deal.id,
      label: "Website 3",
      description: "Tertiary website — needs discovery. Creative freedom: Limited. SEO sensitivity: High. Legacy risk: High.",
      creative_freedom: "limited",
      seo_sensitivity: "high",
      status: "needs_discovery" as const,
      sort_order: 2,
    },
  ]

  for (const ws of workstreams) {
    const { error: wsErr } = await supabase.from("workstreams").upsert(ws)
    if (wsErr) console.error(`  Workstream ${ws.label} error:`, wsErr.message)
    else console.log(`  Workstream created: ${ws.label}`)
  }

  // 5. Create client websites
  const websites = [
    {
      client_id: company.id,
      domain: "olasov.com", // placeholder
      approx_domain_age: "20+ years",
      current_cms: "HTML5 / Dreamweaver",
      hosting: "Unknown",
      seo_sensitivity: "high",
      notes: "Primary site. High creative freedom. Medium to high SEO sensitivity.",
    },
    {
      client_id: company.id,
      domain: "olasov-realestate.com", // placeholder
      approx_domain_age: "15+ years",
      current_cms: "HTML5 / Dreamweaver",
      hosting: "Unknown",
      seo_sensitivity: "high",
      notes: "Secondary site. Limited creative freedom. High SEO sensitivity. High legacy risk.",
    },
    {
      client_id: company.id,
      domain: "eveolasov.com", // placeholder
      approx_domain_age: "15+ years",
      current_cms: "HTML5 / Dreamweaver",
      hosting: "Unknown",
      seo_sensitivity: "high",
      notes: "Tertiary site. Limited creative freedom. High SEO sensitivity. High legacy risk.",
    },
  ]

  for (const site of websites) {
    const { error: siteErr } = await supabase.from("client_websites").upsert(site)
    if (siteErr) console.error(`  Website ${site.domain} error:`, siteErr.message)
    else console.log(`  Website created: ${site.domain}`)
  }

  console.log("\nEve Olasov seed complete.")
  return { dealId: deal.id, companyId: company.id, contactId: contact.id }
}

// CLI entry point
if (require.main === module) {
  seedEveOlasov()
    .then((r) => {
      if (r?.error) process.exit(1)
      process.exit(0)
    })
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
}
