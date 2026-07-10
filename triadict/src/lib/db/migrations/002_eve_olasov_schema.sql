-- Migration 002: Eve Olasov schema support
-- Adds fields for relationship tracking, pricing tiers, workstreams

-- === DEALS TABLE ADDITIONS ===

ALTER TABLE deals ADD COLUMN IF NOT EXISTS source_detail TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS how_it_started TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS relationship_context TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS client_technical_sophistication TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS internal_estimate_cents INTEGER;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS proposed_price_cents INTEGER;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS agreed_price_cents INTEGER;

-- === WORKSTREAMS TABLE ===

CREATE TABLE IF NOT EXISTS workstreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  creative_freedom TEXT,
  seo_sensitivity TEXT,
  scope_notes TEXT,
  status TEXT NOT NULL DEFAULT 'needs_discovery'
    CHECK (status IN ('needs_discovery','discovering','scoped','ready_to_price','priced','agreed')),
  estimated_price_cents INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workstreams_deal_id ON workstreams(deal_id);

-- === EVE OLASOV SEED DATA ===
-- This is real opportunity data, not demo data.
-- All values are classified per the Eve context document.

-- Note: Run this only after confirming no duplicate exists.
-- The org_id placeholder must be replaced with the actual studio org UUID.

-- INSERT INTO deals (
--   org_id, name, stage, value_cents, currency, probability,
--   source, source_detail, how_it_started, industry, country,
--   lead_source, business_description,
--   strongest_problem, personalization_angle,
--   commercial_opportunity, known_concerns,
--   internal_estimate_cents, client_technical_sophistication,
--   unknowns
-- ) VALUES (
--   'REPLACE_WITH_ORG_UUID',
--   'Eve Olasov — Multi-Site Website Opportunity',
--   'positive_reply',
--   0,                           -- $0 pipeline value (not confirmed)
--   'USD',
--   20,                          -- 20% probability (early stage)
--   'Personalized Outbound',
--   'Deep Research + Custom Demo',
--   'Triadict researched Eve''s business (1.5% listing proposition, TV background, business-story/digital-mismatch). Built a working demo. Eve responded positively to personalized outreach.',
--   'Real Estate',
--   'United States',
--   'Personalized Outbound',
--   'Long-established Charleston real-estate professional and brokerage owner. Operates multiple legacy websites with significant SEO history.',
--   'The strength of Eve''s business story, experience, and market proposition appears stronger than the way current digital experiences present them.',
--   'Her 1.5% listing proposition was a key personalization angle for outreach.',
--   'Potential for three website projects. Stronger creative freedom on one site; more SEO-sensitive execution on the other two.',
--   'Legacy websites with ~23-25 year old domains. Client is technically sophisticated (HTML5, Dreamweaver, self-publishes, fixed own CLS issue). Highly protective of existing Google rankings.',
--   800000,                      -- $8,000 internal estimate (NOT confirmed; NOT pipeline value)
--   'Above average — works with HTML5, Dreamweaver, understands CLS, personally fixed a Core Web Vitals issue, highly ranking-conscious',
--   'Exact domains, page counts, tech stack, hosting, DNS, analytics, Search Console access, ranking profile, backlink profile, organic traffic, conversion data, exact scope per site, design expectations, brand constraints, approval process, timeline, budget, payment expectations, ongoing support requirements'
-- );

-- === WORKSTREAMS SEED ===
-- Three potential scopes, all at needs_discovery

-- INSERT INTO workstreams (deal_id, label, description, creative_freedom, seo_sensitivity, status, sort_order) VALUES
-- (
--   'REPLACE_WITH_DEAL_UUID',
--   'Site A — Higher Creative Freedom',
--   'Stronger redesign opportunity. More freedom in visual direction. More room for improved positioning.',
--   'Relatively High',
--   'To Assess',
--   'needs_discovery',
--   0
-- ),
-- (
--   'REPLACE_WITH_DEAL_UUID',
--   'Site B — SEO-Sensitive',
--   'Requires more careful execution. SEO considerations, legacy history, branding considerations, preservation requirements.',
--   'More Limited',
--   'High',
--   'needs_discovery',
--   1
-- ),
-- (
--   'REPLACE_WITH_DEAL_UUID',
--   'Site C — SEO-Sensitive',
--   'Requires more careful execution. SEO considerations, legacy history, branding considerations, preservation requirements.',
--   'More Limited',
--   'High',
--   'needs_discovery',
--   2
-- );
