# CLAUDE.md

## Studio
```ts
const studio = {
  name: "Triadic",                          // working name — change if team picks another
  tagline: "Editorial websites for people who refuse to look generic.",
  positioning: "We design and build brochure-style websites for solo professionals, boutique services, and small brands — fast, beautiful, and fixed-price.",
  pricing: { min: 800, max: 1500, currency: "USD", model: "fixed-price, 2–3 week turnaround" },
  targetClient: "Solo realtors, coaches, consultants, therapists, photographers, boutique service businesses",
  location: "Pune, India · serving clients globally",
  contact: {
    email: "hello@triadic.studio",          // placeholder — swap with real
    primary_phone: "+91 826 299 6104",
  },
};
```

## Team
```ts
const team = [
  {
    name: "Aditya Suryavanshi",
    role: "Lead Engineer · AI/ML + Full-Stack",
    bio: "Reinforcement learning enthusiast. Top 800 / 72,000+ at Meta × PyTorch OpenEnv Hackathon. Builds the systems behind every site we ship.",
    email: "urban.void.69@gmail.com",
    phone: "+91 826 299 6104",
    linkedin: "https://linkedin.com/in/aditya-suryavanshi",
    portfolio: "https://freakyady.netlify.app",
    avatar: "/team/aditya.jpg",
  },
  {
    name: "Shreeshant Bokade",
    role: "[TBD — fill in]",
    bio: "[TBD]",
    email: "[TBD]",
    phone: "[TBD]",
    linkedin: "[TBD]",
    avatar: "/team/shreeshant.jpg",
  },
  {
    name: "Prajwal Valekar",
    role: "[TBD — fill in]",
    bio: "[TBD]",
    email: "[TBD]",
    phone: "[TBD]",
    linkedin: "[TBD]",
    avatar: "/team/prajwal.jpg",
  },
];
```
**Action item:** Fill in Shreeshant and Prajwal's roles, bios, and links before first deploy. Roles to consider: *Design Lead · Frontend Lead · Client Strategy · Brand & Copy*. Each person owns one discipline so the studio reads like specialists, not a friend group.

---

## Project

Build the **studio's marketing website** — the single asset that converts cold outreach into paid clients. This is not a developer portfolio. This is a **sales tool** for a 3-person freelance studio targeting the $800–1500 brochure-site market.

**Stack:** Next.js · React · TypeScript · TailwindCSS · Framer Motion · GSAP · Lenis · (optional: light Three.js for hero only)

**Design language:** Editorial. Magazine-style. Confident typography. Warm but precise. NOT a "futuristic 3D dev portfolio" — that scares off coaches, realtors, and small business owners. Think *Pentagram studio site* meets *Linear's marketing pages* meets *a really good architect's portfolio*. Restrained motion, beautiful type, generous white space.

**Palette:**
- BG: `#F8F6F2` (warm off-white) OR `#0E0E10` (deep charcoal) — pick one, commit
- Ink: `#0A0A0A`
- Accent: `#E85A2F` (warm coral) OR `#3D5AFE` (electric ink blue) — pick one
- Mute: `#6B6B6B`
- Hairline: `#E5E0D8` (warm) / `#1A1A1D` (dark)

**Typography pair:**
- Display: `Fraunces` or `Editorial New` or `Instrument Serif` (one of these, not all)
- Body: `Inter` or `Söhne` or `Geist` (one of these)
- Mono: `JetBrains Mono` for code/tech accents only

---

## Sections & Content

### 1. Hero
- One sentence headline. Confident. Not clever.
  > *"Websites that look like you took it seriously."*
  > *or* — *"We build the websites your competitors wish they had."*
- Sub-line (one sentence): what you do + who for + price hint.
  > *"Editorial brochure sites for solo professionals and boutique brands. Fixed price, 2–3 weeks, no surprises."*
- Two CTAs: `See work →` and `Start a project →`
- **Subtle motion only:** A single animated element — a hairline that draws across the headline on load, or a tiny floating geometric mark. No 3D scene. No particles. No neon.

### 2. The Pitch (one screen, three lines)
Three short statements, each one a column or stacked row:
- **Fixed price.** No hourly surprises. You see the number before you commit.
- **2–3 weeks.** Not 2–3 months. We build small, focused sites that ship.
- **Built by three people.** Not a freelancer juggling 8 clients. Not an agency burying you in account managers.

### 3. Work / Case Studies
```ts
const projects = [
  // Until real client work lands, ship 3 spec case studies
  {
    title: "The Hartley House",         // fictional boutique realtor brand
    client: "Spec project — Solo realtor positioning",
    summary: "An editorial site for a Nashville solo realtor. Story-led homepage, dedicated neighborhood guides, a calm contact flow that doesn't feel like a lead form.",
    tags: ["Real estate", "Editorial", "Brand"],
    cover: "/work/hartley/cover.jpg",
    palette: ["#0E0E10", "#E85A2F", "#F8F6F2"],
  },
  {
    title: "Quiet Practice",
    client: "Spec project — Therapist private practice",
    summary: "Warm, restrained site for a fictional solo therapist. Built around trust signals, not stock photos.",
    tags: ["Therapy", "Editorial", "Brand"],
    cover: "/work/quiet/cover.jpg",
    palette: ["#F8F6F2", "#3D5AFE", "#0A0A0A"],
  },
  {
    title: "North & Co.",
    client: "Spec project — Executive coach",
    summary: "An editorial coaching site for a fictional leadership consultant. Case-study-driven, no fluff.",
    tags: ["Coaching", "Editorial", "Conversion"],
    cover: "/work/north/cover.jpg",
    palette: ["#0A0A0A", "#C9B26F", "#FAF7F1"],
  },
  // Replace one spec project as soon as a real client ships
];
```
- Each card: large cover image, title, one-line summary, tags
- Hover: image subtle scale (1.02), title underline draws
- Click: full case-study page

**Case study page template:**
1. Hero shot (full-bleed)
2. The brief (3 sentences)
3. The approach (3 sentences)
4. 3–5 large device mockups / screenshots
5. One pull-quote (real or written-as-if-real)
6. Outcome / what shipped (bullets)
7. CTA: "Want something like this? →"

### 4. Process (5 steps, one line each)
- `01 / Discovery call` — 30 minutes. You talk, we listen.
- `02 / Fixed quote` — Within 48 hours. Price doesn't move.
- `03 / Design` — 1 week. Two rounds of revisions, no chaos.
- `04 / Build` — 1 week. You see it grow.
- `05 / Ship` — Live, on your domain, with handoff docs.

### 5. Team
- Three large portraits (or stylized illustrated portraits if no photos yet)
- Name · role · one-sentence bio · LinkedIn link
- Subtle hover: portrait gets a slight color tint or shifts to a second image

### 6. Pricing (be honest — this kills 80% of objections)
Two simple cards:
```ts
const packages = [
  {
    name: "The Single",
    price: "$800",
    summary: "A focused one-page site. Perfect for solo professionals.",
    includes: ["Custom design (no templates)", "One-page scrolling layout", "Mobile-perfect", "Contact form", "Domain + hosting setup", "2-week turnaround"],
  },
  {
    name: "The Suite",
    price: "$1,500",
    summary: "A multi-page editorial site. For brands that need depth.",
    includes: ["Everything in The Single", "Up to 5 pages", "Blog / case study system", "Basic SEO", "Lead capture integration", "3-week turnaround"],
  },
];
```
- Add a one-liner under both: *"Custom scope? Email us — we quote anything over $1,500 case-by-case."*

### 7. Testimonials
- Even 1–2 short quotes is fine to start
- If none yet, leave the section out entirely. **Empty testimonial sections kill trust faster than no section at all.**
- Format: portrait · quote · name · role · company

### 8. FAQ (kills the last objections)
```ts
const faqs = [
  { q: "Why fixed price?", a: "Because hourly billing punishes you for our learning curve. Fixed price means we eat the risk if we underestimate." },
  { q: "Do you handle hosting?", a: "Yes. We set up Vercel or Netlify hosting and walk you through transferring it to your own account, or we manage it for $15/mo." },
  { q: "What if I need changes after launch?", a: "First month of small tweaks is free. After that, $50/hour or a $400 monthly retainer for ongoing changes." },
  { q: "Do you build e-commerce?", a: "No. We focus on brochure-style sites — service businesses, portfolios, personal brands. For Shopify or complex e-commerce, we'll point you to people who do it well." },
  { q: "Why is your team in India?", a: "Because we deliver Pentagram-tier work at a third of US agency prices. Our async-first process means time zones are a feature, not a bug — you sleep, we ship." },
  { q: "What if I hate the design?", a: "Two free revision rounds are baked in. After that, additional rounds are $100 each. We almost never need them." },
];
```

### 9. Contact / CTA
- One large headline: *"Start a project."* or *"Send us your worst website."*
- One short paragraph: what to include in your message (current site URL, what's broken, budget, timeline)
- A form with **only** these fields: Name · Email · Current website (optional) · What you need (textarea)
- Or: just a big email link `hello@triadic.studio` — sometimes the absence of a form is the most confident signal you can send
- WhatsApp link as secondary: `+91 826 299 6104`

### 10. Footer
- Studio name · small logo mark
- Three columns: Studio (about, work, process) · Services (pricing, FAQ) · Contact (email, WhatsApp, LinkedIn)
- Copyright year · "Made in Pune"

---

## Technical Requirements

**Scrolling:** Lenis for smooth scroll. GSAP ScrollTrigger for section pinning on case study pages only. Framer Motion for in-view reveals. Keep it subtle — this is an editorial site, not a showreel.

**Animations:**
- Entrance fades on scroll (200–400ms, `power2.out` easing)
- Headline reveals: split-by-word, staggered, 30ms apart
- Hover states: 200ms transitions on `transform` and `opacity` only
- NO parallax on every section. NO floating particles. NO 3D objects except possibly one in the hero.

**Performance budget:**
- LCP under 1.5s on 4G
- Total JS under 150KB gzipped
- Images: WebP/AVIF, lazy-loaded below fold
- Lighthouse target: 95+ on Performance, 100 on Accessibility

**SEO:**
- Title: `"Triadic — Editorial websites for solo professionals"`
- Meta description: pull the tagline
- OG image: 1200×630, branded
- Schema.org `Organization` and `Service` markup
- Semantic HTML — `<header>`, `<main>`, `<article>`, `<section>`, `<footer>`
- Keyboard navigable — tab order makes sense, focus-visible everywhere

**Accessibility (non-negotiable):**
- WCAG AA contrast on every text element
- `prefers-reduced-motion` respected — disable Lenis and entrance animations when set
- Alt text on every image
- Form labels visible or properly hidden with `sr-only`

---

## Folder Structure
```
/app                       Next.js app router pages
/components
  /ui                      Buttons, inputs, cards
  /sections                Hero, Work, Process, Team, Pricing, FAQ, Contact
  /case-study              Per-case-study reusable blocks
/hooks                     useReducedMotion, useLenis, etc.
/lib                       Constants, project data, team data
/utils                     Formatters, helpers
/public
  /work                    Case study assets
  /team                    Portraits
  /brand                   Studio logo, OG image
```

---

## Frontend Rules

**Always first:** Invoke the `frontend-design` skill before writing any frontend code, every session.

**Reference images:** If reference designs are provided, match them exactly — layout, spacing, typography, color. Use `https://placehold.co/WIDTHxHEIGHT` for placeholder images. Do not "improve" the reference. Screenshot → compare → fix → re-screenshot. Minimum 2 rounds. Stop only when no visible differences remain.

**Local server:** Always serve on localhost. Start: `node serve.mjs` (serves root at `http://localhost:3000`). Never screenshot a `file:///` URL. Don't start a second server instance if one is already running.

**Screenshots:** Puppeteer at `C:/Users/nateh/AppData/Local/Temp/puppeteer-test/`. Run: `node screenshot.mjs http://localhost:3000`. Saves to `./temporary screenshots/screenshot-N.png`. Optional label: `node screenshot.mjs http://localhost:3000 label`. After each shot, read the PNG and analyze — be specific: *"heading is 32px but reference shows ~24px"*.

**Output defaults:** Single `index.html` for initial prototypes, all styles inline. Tailwind via CDN for fast iteration. Mobile-first responsive. Move to Next.js once the design is locked.

**Brand assets:** Check `brand_assets/` first. If logos, palettes, or style guides exist, use them — no placeholders where real assets exist.

**Anti-generic guardrails:**
- **Colors:** Never default Tailwind palette (no `indigo-500`, `blue-600`, `slate-900`). Custom hex only.
- **Shadows:** Layered, color-tinted, low opacity. Never flat `shadow-md`. Example: `shadow-[0_2px_8px_-2px_rgba(232,90,47,0.15),0_8px_24px_-12px_rgba(10,10,10,0.18)]`.
- **Typography:** Pair a display serif with a clean sans. Tight tracking (`-0.03em`) on display headings. Generous line-height (`1.7`) on body. Never use `font-bold` on serifs — use `font-medium` or the serif's natural weight.
- **Gradients:** Avoid two-stop linear gradients. Use layered radial gradients + an SVG grain/noise overlay for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Easing should feel spring-like — `cubic-bezier(0.16, 1, 0.3, 1)` or GSAP's `power3.out`.
- **Interactive states:** Every clickable element needs hover, focus-visible, AND active states. No exceptions. Buttons subtly shift in y-axis on hover (`-translate-y-0.5`) and press into the page on active.
- **Images:** Add `bg-gradient-to-t from-black/40` overlay on hero images. Use `mix-blend-multiply` color tint on portraits for editorial cohesion.
- **Depth:** Three-layer z-system — `base` (content), `elevated` (cards, lifted UI), `floating` (modals, tooltips). Never put everything on one z-plane.

**Hard rules:**
- No section exists that isn't in this spec
- Don't "improve" a reference design — match it
- Never use `transition-all`
- Never use default Tailwind blue/indigo as primary
- No emojis in the actual site copy — emojis kill the editorial tone
- No "Lorem ipsum" anywhere — write real placeholder copy that matches the studio voice

---

## Voice & Copy Rules

The studio voice is:
- **Confident, not arrogant.** "We build" not "We strive to build."
- **Specific, not flowery.** "$800. 2 weeks. Done." not "Affordable solutions delivered with passion."
- **Plain English.** Never "leverage," "synergy," "solutions," "cutting-edge," "innovative."
- **Active voice.** "We ship in 2 weeks" not "Sites are shipped within a 2-week timeframe."
- **One idea per sentence.** Short. Punchy. Like a good designer's notes.

Sentence-length rhythm: short. short. then a longer one that lets the reader breathe a bit and settles the pacing. then short again.

**Words to ban from the site:**
`leverage` · `solutions` · `synergy` · `passionate` · `cutting-edge` · `innovative` · `seamless` · `robust` · `state-of-the-art` · `next-gen` · `journey` · `space` (as in "the design space")

---

## Goal

This site closes leads. Specifically: it converts the prospects we cold-pitch (solo realtors, coaches, therapists, boutique shops) from "interested" to "yes, send the contract."

A prospect should land on this site, scroll for 90 seconds, see exactly three things:
1. **These people are serious.** (Editorial design, real case studies, no template energy)
2. **The price is reasonable.** ($800–1500 stated upfront — no "request a quote" games)
3. **I can imagine working with them.** (Three faces, a clear process, a contact form that isn't 14 fields)

If a prospect doesn't email within 5 minutes of landing here, the site failed.

---

## Agent Instructions (WAT Framework)

This project runs on the **WAT architecture** — Workflows, Agents, Tools.

- **Workflows** (`workflows/`) — Markdown SOPs defining objectives, inputs, tools, outputs, and edge cases
- **Agents** — You. Orchestrate reasoning, run tools in sequence, recover from errors, ask when unclear
- **Tools** (`tools/`) — Python scripts for deterministic execution (API calls, file ops, data transforms). Credentials in `.env` only.

**How to operate:**
1. Check `tools/` before building anything new
2. On failure: read the full trace → fix → retest → update the workflow
3. Keep workflows current as you learn — don't overwrite without permission

**File layout:**
```
.tmp/           # Temporary/intermediate files (disposable)
tools/          # Deterministic Python scripts
workflows/      # Markdown SOPs
.env            # API keys (never elsewhere)
```

Deliverables go to cloud (Google Sheets, Slides, etc.). Local files are processing-only.

**Core loop:** Identify what broke → fix the tool → verify → update the workflow → move on.

---

## Open Decisions (resolve before first build session)

1. **Studio name.** "Triadic" is a placeholder. Other directions to consider: *Threefold · Trio Studio · Atelier 3 · The Tertiary · Northbound · Quietfield*. Pick one, register the .com or .studio domain, then update this file.
2. **Palette commit.** Warm off-white BG OR deep charcoal BG — pick one. Coral accent OR ink blue accent — pick one.
3. **Type pair commit.** One serif + one sans, locked. Don't ship with three font families fighting each other.
4. **Shreeshant + Prajwal roles.** Each owns one discipline. Suggested split:
   - Aditya — Lead Engineer (already locked)
   - Shreeshant — Design Lead (UI, brand, art direction)
   - Prajwal — Strategy & Copy (client comms, copywriting, project management)
   - Adjust based on actual strengths
5. **Studio email.** Buy the domain, set up `hello@[domain]` via Google Workspace or Zoho Mail before the site launches. Personal Gmail addresses in the contact section instantly drop the studio's perceived tier.