"use server"

import { createClient } from "@/lib/supabase/server"
import type { KnowledgeArticle, CreateKnowledgeInput, UpdateKnowledgeInput } from "@/types/database"

export async function listArticles(params?: {
  category?: string
  status?: string
  search?: string
  author_id?: string
}): Promise<KnowledgeArticle[]> {
  try {
    const supabase = await createClient()
    let query = supabase.from("knowledge_articles").select(`
      *,
      author:people!knowledge_articles_author_id_fkey (id, full_name)
    `).order("updated_at", { ascending: false })

    if (params?.category && params.category !== "all") query = query.eq("category", params.category)
    if (params?.status && params.status !== "all") query = query.eq("status", params.status)
    if (params?.search) {
      query = query.or(`title.ilike.%${params.search}%,content_md.ilike.%${params.search}%`)
    }

    const { data, error } = await query
    if (error) return []
    return data as unknown as KnowledgeArticle[]
  } catch {
    return []
  }
}

export async function getArticle(id: string): Promise<KnowledgeArticle | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("knowledge_articles")
      .select("*, author:people!knowledge_articles_author_id_fkey (id, full_name)")
      .eq("id", id)
      .single()
    if (error) return null
    return data as unknown as KnowledgeArticle
  } catch {
    return null
  }
}

export async function createArticle(input: CreateKnowledgeInput): Promise<KnowledgeArticle | { error: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const insertData: Record<string, unknown> = {
      org_id: "00000000-0000-0000-0000-000000000001",
      title: input.title,
      category: input.category,
      content_md: input.content_md,
      tags: input.tags || [],
      status: input.status || "draft",
      author_id: user.id,
    }

    if (input.status === "published") insertData.published_at = new Date().toISOString()

    const { data, error } = await supabase.from("knowledge_articles").insert(insertData).select().single()
    if (error) return { error: error.message }
    return data as KnowledgeArticle
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create article" }
  }
}

export async function updateArticle(input: UpdateKnowledgeInput): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { id, ...updates } = input

    const updateData: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() }
    if (updates.status === "published") updateData.published_at = new Date().toISOString()

    const { error } = await supabase.from("knowledge_articles").update(updateData).eq("id", id)
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update article" }
  }
}

export async function deleteArticle(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("knowledge_articles").delete().eq("id", id)
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete article" }
  }
}

export async function seedArticles(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { count } = await supabase.from("knowledge_articles").select("*", { count: "exact", head: true })
    if (count && count > 0) return false

    const { data: { user } } = await supabase.auth.getUser()
    const authorId = user?.id || null

    const now = new Date().toISOString()
    const seedData = [
      {
        org_id: "00000000-0000-0000-0000-000000000001",
        title: "Pricing & Scoping Guide",
        category: "pricing_decision",
        content_md: `## Fixed-Price Model

We charge **$800–$1,500** for brochure-style sites. That range covers most solo professional and small brand projects.

**The Single** ($800): One-page site. Focused scope. No surprises.
**The Suite** ($1,500): Multi-page editorial. Blog system. Lead capture.

Anything above $1,500 requires a custom scope, agreed case-by-case.

## Minimum Acceptable Price

$800 floor. No exceptions. Below that, the math doesn't work — scope creep eats the margin, quality drops, and the client relationship starts negative.

## When to Go Above $1,500

- Complex CMS or blog with custom post types
- E-commerce integration (we refer out for Shopify-level complexity)
- Multi-language support
- Advanced animations or 3D work
- Tight deadlines requiring weekend work

## Contingency Rules

- Add 15% buffer on any project with unclear requirements
- Lock scope before starting — no "we'll figure it out as we go"
- If discovery reveals the project is larger than quoted, stop and re-quote before crossing $1,500

## Estimating Effort Hours

1. Break the project into design, build, content integration, and QA
2. Estimate hours for each phase
3. Multiply by $75/hour to validate against the fixed price
4. If the math doesn't work, adjust scope — not quality

## When to Walk Away

- Client wants $2,000+ of work for $800
- Scope keeps growing during the discovery call
- No clear decision-maker on the client side
- Timeline is unrealistic (3 days for a 2-week project)
- Client has been burned by cheap freelancers and expects perfection at budget prices`,
        tags: ["pricing", "scoping", "process"],
        status: "published",
        author_id: authorId,
        published_at: now,
      },
      {
        org_id: "00000000-0000-0000-0000-000000000001",
        title: "Discovery Call & Qualification Framework",
        category: "process",
        content_md: `## Call Structure (30 minutes)

**Minutes 0–5:** Introductions. Who are they, what do they do, what's the business?

**Minutes 5–15:** Their current online presence. What do they have now? What's broken? What do they wish they had?

**Minutes 15–25:** Scope and budget. What do they need? When do they need it? What have they budgeted?

**Minutes 25–30:** Next steps. If it's a fit, outline the process. If not, be honest.

## Key Questions

1. "What does your current website do well?" — Understands what they value
2. "What frustrates you about it?" — Reveals pain points
3. "What would a successful website accomplish for you?" — Gets to business goals
4. "Have you worked with a web designer before? How did it go?" — Surfaces red flags
5. "What's your budget range for this project?" — Qualifies financial fit
6. "Who makes the final decision on design and content?" — Identifies stakeholders
7. "When do you need this live?" — Sets timeline expectations

## BANT Qualification

**Budget:** Can they afford $800–$1,500? If they say "under $500" — walk. If they hesitate on $800 but seem serious, offer The Single.

**Authority:** Are you talking to the decision-maker? If not, the deal will stall. Ask: "Is there anyone else who'll need to approve the design or content?"

**Need:** Do they actually need a new site? Some people just need a landing page or a refresh. Don't oversell.

**Timeline:** Are they ready to start within 2 weeks? Projects that "start next quarter" lose momentum.

## Scoring

- Budget: Yes = 3, Stretch = 1, No = 0
- Authority: Decision-maker = 3, Influencer = 1, Nobody = 0
- Need: Clear pain = 3, Nice-to-have = 1, No real need = 0
- Timeline: Ready now = 3, Within a month = 1, No timeline = 0

**Score 10–12:** Green light. Send proposal.
**Score 6–9:** Yellow. Proceed with caution. Clarify weak areas.
**Score 0–5:** Decline. Not a fit.

## When to Decline

- Score below 6
- They've been burned by 3+ designers (pattern, not bad luck)
- They want to "see the design first before paying anything"
- Scope is clearly beyond our capability or pricing`,
        tags: ["discovery", "qualification", "sales"],
        status: "published",
        author_id: authorId,
        published_at: now,
      },
      {
        org_id: "00000000-0000-0000-0000-000000000001",
        title: "Legacy Website / SEO-Safe Migration Playbook",
        category: "technical_pattern",
        content_md: `## Pre-Migration Audit Checklist

Before touching anything, document what exists:

- [ ] Full URL inventory (sitemap, Screaming Frog crawl, or manual)
- [ ] Current organic traffic (Google Analytics, last 6 months)
- [ ] Top 10 landing pages by traffic
- [ ] Current domain authority and backlink profile
- [ ] All indexed pages (site:domain.com)
- [ ] Current page speed scores (PageSpeed Insights)
- [ ] Any active ad campaigns pointing to existing URLs

## 301 Redirect Mapping

**This is the most critical step.** Every old URL must map to a new URL.

1. Export all existing URLs (crawl or sitemap)
2. Map each old URL to its new equivalent
3. Create a redirect map: \`old-path → /new-path\`
4. Implement server-side 301 redirects (not client-side)
5. Verify every redirect returns a 301, not a 302 or 404

**Rules:**
- 1:1 mapping preferred. If a page is being removed, redirect to the closest equivalent — not the homepage.
- Preserve query parameters where possible
- Test the entire redirect map before go-live

## CMS Migration Risks

**Content:** Images, embeds, and formatting often break during CMS moves. Plan a content QA day.

**URLs:** CMS platforms (WordPress, Squarespace) generate different URL structures. Assume every URL changes.

**Metadata:** Title tags, meta descriptions, and Open Graph data may not transfer. Re-add manually.

**Forms:** Contact forms and lead capture may break. Test every form on day one.

**Analytics:** Re-add tracking codes, update goal definitions, and verify conversion tracking post-migration.

## Timeline Expectations

- **Audit & mapping:** 2–3 days
- **Build & content migration:** 1 week
- **QA & redirect testing:** 2–3 days
- **Soft launch with monitoring:** 1 week
- **Total:** 2–3 weeks minimum

## When to Bring in an SEO Specialist

- Organic traffic is a significant lead source (20%+ of traffic)
- The site has 50+ indexed pages
- Domain authority above 30
- Active backlink profile
- If in doubt, spend the $500–$1,000 on a specialist. A botched migration costs more than that in lost traffic.

**Never skip the redirect map.** A failed migration can tank organic traffic by 50–80% and take months to recover.`,
        tags: ["migration", "seo", "technical"],
        status: "published",
        author_id: authorId,
        published_at: now,
      },
      {
        org_id: "00000000-0000-0000-0000-000000000001",
        title: "Payment Gate Policy",
        category: "process",
        content_md: `## The Four Gates

No work begins until all four conditions are met:

**Gate 1: Scope Agreement**
Both parties agree on what's being built. Written scope document. No ambiguity.

**Gate 2: Agreement Signed**
Service agreement or proposal accepted. Digital signature preferred.

**Gate 3: SOW Approved**
Statement of Work with deliverables, timeline, and milestones. Signed by both sides.

**Gate 4: Initial Payment Received**
Funds in hand. Not "in transit." Not "approved by accounting." Received.

## Why This Exists

Every unpaid project that went sideways started with skipping one of these gates. "We'll send the contract later" means "we'll never send the contract." "Trust us, the check is coming" means it isn't.

## Payment Schedule

**The Single ($800):** 100% upfront.
**The Suite ($1,500):** 50% upfront, 50% on delivery.
**Custom ($1,500+):** 40% upfront, 30% at midpoint, 30% on delivery.

## Handling Delays

- Payment is late: Work pauses after 48 hours. No exceptions. Communicate clearly: "We haven't received payment. Work will resume once it clears."
- Payment is 7+ days late: Project goes on hold. A $200 restart fee applies.
- Payment is 30+ days late: Project is archived. No refund on completed work.

## Exceptions

- **Referral clients:** If a trusted client refers someone, we may flex on Gate 4 with a written promise. Rare. Documented.
- **Nonprofit/education:** 50% upfront instead of 100% for verified nonprofits. Case-by-case.

## Retainer Deposits

Monthly retainers require first month + one month deposit upfront. Billing on the 1st of each month. Work pauses on the 5th if payment hasn't cleared.

**The rule is simple: we don't work for free.** The gates protect both sides.`,
        tags: ["payment", "policy", "process"],
        status: "published",
        author_id: authorId,
        published_at: now,
      },
      {
        org_id: "00000000-0000-0000-0000-000000000001",
        title: "Retainer Operating Rules",
        category: "standard",
        content_md: `## Monthly Retainer Scope

Retainers cover ongoing design and development work, billed monthly.

**Included in the retainer:**
- Up to 10 hours of design/development per month
- Bug fixes and small content updates
- Email support (48-hour response time)
- Monthly strategy check-in (30 min)

**Not included (change orders):**
- New page builds
- Redesign of existing sections
- Third-party integrations
- Anything requiring 3+ hours of focused work

## Capacity Allocation

- Each team member handles a maximum of 3 retainer clients
- Retainer hours are tracked in 15-minute increments
- Hours don't roll over month to month
- Unused hours are forfeited — no credit

## Overages

If a client exceeds their monthly hours:
1. Notify the client immediately
2. Provide a written estimate for additional work
3. Get approval before proceeding
4. Bill overages at $75/hour
5. If overages are consistent for 2+ months, recommend upgrading the retainer

## Billing Cycle

- Invoiced on the 1st of each month
- Payment due within 7 days
- Work pauses on the 8th if payment hasn't cleared
- Late payment fee: 5% after 14 days

## Cancellation Notice

- 30 days written notice required
- Final month is prorated if mid-cycle
- We provide all source files and documentation within 5 business days of cancellation
- No penalty for cancellation — we'd rather keep clients who want to stay

## Retainer Pricing

- **Starter:** $400/month (5 hours) — content updates, small fixes
- **Growth:** $800/month (10 hours) — moderate ongoing work
- **Scale:** $1,500/month (20 hours) — active design/development partnership

**The goal is predictable revenue for us and predictable costs for them.**`,
        tags: ["retainer", "operations", "billing"],
        status: "published",
        author_id: authorId,
        published_at: now,
      },
    ]

    await supabase.from("knowledge_articles").insert(seedData)
    return true
  } catch {
    return false
  }
}

export async function getArticleCategories() {
  return [
    { id: "process", label: "Process", color: "text-coral" },
    { id: "standard", label: "Standard", color: "text-inkblue" },
    { id: "lesson", label: "Lesson Learned", color: "text-gold" },
    { id: "technical_pattern", label: "Technical Pattern", color: "text-forest" },
    { id: "sales_objection", label: "Sales Objection", color: "text-coral" },
    { id: "pricing_decision", label: "Pricing Decision", color: "text-mute" },
    { id: "postmortem", label: "Postmortem", color: "text-red-500" },
  ]
}
