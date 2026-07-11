"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

const Hero3D = dynamic(() => import("./hero3d"), { ssr: false })

/* �"��"��"� marquee data �"��"��"� */
const marqueeWords = [
  "Editorial", "Restrained", "Fixed-Price", "Two\u00a0Weeks", "Three\u00a0Hands", "No\u00a0Templates",
]

/* �"��"��"� process steps �"��"��"� */
const processSteps = [
  { num: "01 / Discovery", title: "A 30-minute call.", desc: "You talk, we listen. Brand, audience, the thing your last designer didn\u2019t understand. We take notes.", time: "Day 0" },
  { num: "02 / Quote", title: "Fixed, in 48 hours.", desc: "One number. Scope attached. The price doesn\u2019t move unless you ask for something new \u2014 and even then, you see the delta first.", time: "Day 2" },
  { num: "03 / Design", title: "One week. Two rounds.", desc: "You see the homepage first, in Figma. We revise twice. We almost never need a third \u2014 but if we do, it\u2019s on us.", time: "Days 3\u20139" },
  { num: "04 / Build", title: "One week. You watch it grow.", desc: "A staging URL you can refresh. Daily progress. Comments answered in a working day, every time.", time: "Days 10\u201316" },
  { num: "05 / Ship", title: "Live, with handoff docs.", desc: "We push to your domain. We hand you a one-page guide for updates. First month of small tweaks is free.", time: "Day 17" },
]

/* �"��"��"� team �"��"��"� */
const teamMembers = [
  {
    name: "Aditya Suryavanshi",
    role: "Strategy & Client Lead \u00b7 Full-Stack & Management",
    bio: "Handles strategy and the client side of every project. Owns the brief, the timeline, and the build. The engineer at the keyboard at midnight if the deploy slips, and the person you\u2019ll hear from first.",
    quote: "\u201cMost projects don\u2019t fail on the build. They fail on the brief.\u201d",
    tag: "AS \u00b7 01",
    mono: "A\u00b7S",
    portraitBg: "#0E0E10",
    portraitColor: "#F8F6F2",
    tagColor: "text-coral",
    dotColor: "text-coral",
    monoPv: false,
    linkedin: "https://www.linkedin.com/in/aditya-suryavanshi-1b5608376/",
    link2: { label: "Portfolio \u2197", href: "https://freakyady.netlify.app" },
    delay: undefined,
  },
  {
    name: "Shreeshant Bokade",
    role: "Frontend Lead \u00b7 Design & UI",
    bio: "Designs the pages, then builds the front end. Argues for one more pass on the typography. The reason these don\u2019t look like a template.",
    quote: "\u201cA site without a point of view is just a brochure with hyperlinks.\u201d",
    tag: "SB \u00b7 02",
    mono: "S\u00b7B",
    portraitBg: "#E85A2F",
    portraitColor: "#F8F6F2",
    tagColor: "text-paper/80",
    dotColor: "text-ink",
    monoPv: false,
    linkedin: "https://www.linkedin.com/in/shreeshant-bokade/",
    link2: { label: "Email", href: "mailto:shr.mail.box@gmail.com" },
    delay: "100",
  },
  {
    name: "Prajwal Valekar",
    role: "Backend & Hosting \u00b7 Infrastructure",
    bio: "Owns the back end and the boring infrastructure. The reason your site stays up at 3 a.m. and the deploy pipeline doesn\u2019t break on Friday.",
    quote: "\u201cHosting isn\u2019t a feature. It\u2019s the floor everything else stands on.\u201d",
    tag: "PV \u00b7 03",
    mono: "P\u00b7V",
    portraitBg: "#FAF7F1",
    portraitColor: "#0A0A0A",
    tagColor: "text-mute",
    dotColor: "text-coral",
    monoPv: true,
    linkedin: "https://www.linkedin.com/in/prajwal-valekar/",
    link2: { label: "Email", href: "mailto:prajwalvalekar08@gmail.com" },
    delay: "200",
  },
]

/* �"��"��"� pricing �"��"��"� */
const pricingTiers = [
  {
    name: "Essentials",
    price: "$800 \u2013 $1,500 USD",
    desc: "One-page sites and focused brochures. For solo professionals who need one beautiful page that does its job \u2014 fast, clean, accessibility-first.",
    clients: ["Solo realtors", "Therapists", "Coaches", "Personal brands"],
  },
  {
    name: "Standard",
    price: "$1,500 \u2013 $3,000 USD",
    desc: "Multi-page editorial sites with depth. Case studies, blog systems, lead capture, schema markup \u2014 everything a small business needs to look like a serious one.",
    clients: ["Boutique services", "Small studios", "Consultants", "Real-estate teams"],
  },
  {
    name: "Bespoke",
    price: "$3,000+ USD",
    desc: "Custom briefs that don\u2019t fit a range. Complex scope, specific integrations, multi-language sites, or ongoing partnerships. Quoted case-by-case.",
    clients: ["Established brands", "Multi-stakeholder briefs", "Long-term retainers"],
  },
]

/* �"��"��"� word-reveal helper �"��"��"� */
const heroWords = [
  { text: "Websites", delay: "0.05s" },
  { text: "that", delay: "0.12s" },
  { text: "look", delay: "0.19s" },
  { text: "like", delay: "0.26s" },
  { text: "you", delay: "0.33s" },
  { text: "took", delay: "0.40s", br: true },
  { text: "it", delay: "0.47s" },
  { text: "seriously.", delay: "0.54s", italic: true, coral: true },
]

/* �"��"��"� page �"��"��"� */
export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [navScrolled, setNavScrolled] = useState(false)
  const [dashDropdownOpen, setDashDropdownOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 12)
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  /* in-view reveal + safety net */
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const revealEls = document.querySelectorAll(".reveal")
    if (prefersReduced) {
      revealEls.forEach((el) => el.classList.add("is-in"))
    } else if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in")
              io.unobserve(entry.target)
            }
          })
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
      )
      revealEls.forEach((el) => io.observe(el))
      /* safety net: reveal anything still hidden after 2.5s */
      const t = setTimeout(() => {
        revealEls.forEach((el) => el.classList.add("is-in"))
      }, 2500)
      return () => { io.disconnect(); clearTimeout(t) }
    } else {
      revealEls.forEach((el) => el.classList.add("is-in"))
    }
  }, [])

  const closeMobileMenu = () => setMobileMenuOpen(false)

  useEffect(() => {
    if (!dashDropdownOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest("[data-dash-dropdown]")) {
        setDashDropdownOpen(false)
      }
    }
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [dashDropdownOpen])

  return (
    <>
      {/* �"��"��"� SKIP LINK �"��"��"� */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-ink focus:text-paper focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to content
      </a>

      {/* �"��"��"� NAV �"��"��"� */}
      <header className={`nav-wrap${navScrolled ? " scrolled" : ""}`}>
        <div className="max-w-[1360px] mx-auto px-6 md:px-10 h-16 md:h-[76px] flex items-center justify-between">
          <a href="#top" className="flex items-center gap-3 group" aria-label="Triadict \u2014 home">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true" className="text-ink transition-colors duration-300 group-hover:text-coral">
              <line x1="12" y1="5.5" x2="5.5" y2="17.5" />
              <line x1="12" y1="5.5" x2="18.5" y2="17.5" />
              <line x1="6" y1="18" x2="18" y2="18" />
              <circle cx="12" cy="5.5" r="1.6" fill="currentColor" />
              <circle cx="5.5" cy="18" r="1.6" fill="currentColor" />
              <circle cx="18.5" cy="18" r="1.6" fill="currentColor" />
            </svg>
            <span className="font-display text-[22px] tracking-tight leading-none">Triadict</span>
            <span className="hidden md:inline font-mono text-[10px] tracking-[0.14em] uppercase text-mute ml-1">Studio</span>
          </a>

          <nav className="hidden md:flex items-center gap-9 text-[14px]" aria-label="Primary">
            <a href="#process" className="ulink text-ink/90 hover:text-ink">Process</a>
            <a href="#team" className="ulink text-ink/90 hover:text-ink">Team</a>
            <a href="#pricing" className="ulink text-ink/90 hover:text-ink">Pricing</a>
            <div className="relative" data-dash-dropdown>
              <button
                className="relative text-ink/90 hover:text-ink flex items-center gap-1.5"
                onClick={() => setDashDropdownOpen(!dashDropdownOpen)}
                aria-expanded={dashDropdownOpen}
                aria-haspopup="true"
              >
                Dashboards
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.25" className={`flex-shrink-0 transition-transform duration-200 ${dashDropdownOpen ? "rotate-180" : ""}`}>
                  <path d="M2 3.5L5 6.5L8 3.5" />
                </svg>
                <span className="absolute left-0 bottom-[-3px] w-full h-px bg-current transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right hover:origin-left" />
              </button>
              {dashDropdownOpen && (
                <div className="absolute top-full right-0 mt-3 w-52 bg-paper border border-hairline shadow-[0_8px_32px_-8px_rgba(10,10,10,0.12)] py-2 z-50">
                  <a href="/auth/login?redirect=/studio/dashboard" className="block px-4 py-2.5 text-[13.5px] text-ink/85 hover:text-ink hover:bg-paper2 transition-colors">
                    <span className="font-medium">Studio</span>
                    <span className="block text-[11px] text-mute mt-0.5">CRM & project management</span>
                  </a>
                  <a href="/auth/login?redirect=/portal/dashboard" className="block px-4 py-2.5 text-[13.5px] text-ink/85 hover:text-ink hover:bg-paper2 transition-colors">
                    <span className="font-medium">Client Portal</span>
                    <span className="block text-[11px] text-mute mt-0.5">Project status & invoices</span>
                  </a>
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <a href="#contact" className="hidden sm:inline-flex btn btn-primary text-[13.5px] py-[10px] px-4">
              Start a project
              <span className="arrow" aria-hidden="true">{"\u2192"}</span>
            </a>
            <button
              className={`ham md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] -mr-2${mobileMenuOpen ? " open" : ""}`}
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="ham-line block w-5 h-px bg-ink" />
              <span className="ham-line block w-5 h-px bg-ink" />
              <span className="ham-line block w-5 h-px bg-ink" />
            </button>
          </div>
        </div>

        {/* Mobile menu drawer */}
        <div className={`mmenu md:hidden fixed top-16 left-0 right-0 bg-paper border-b border-hairline${mobileMenuOpen ? " open" : ""}`}>
          <nav className="px-6 py-8 flex flex-col" aria-label="Mobile">
            <a href="#process" className="font-display text-[34px] tracking-tight py-2 menu-link" onClick={closeMobileMenu}>Process</a>
            <a href="#team" className="font-display text-[34px] tracking-tight py-2 menu-link" onClick={closeMobileMenu}>Team</a>
            <a href="#pricing" className="font-display text-[34px] tracking-tight py-2 menu-link" onClick={closeMobileMenu}>Pricing</a>
            <div className="border-t border-hairline my-3 pt-4">
              <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-mute mb-3">Dashboards</div>
              <a href="/auth/login?redirect=/studio/dashboard" className="font-display text-[26px] tracking-tight py-1.5 menu-link block">
                Studio
              </a>
              <a href="/auth/login?redirect=/portal/dashboard" className="font-display text-[26px] tracking-tight py-1.5 menu-link block">
                Client Portal
              </a>
            </div>
            <a href="#contact" className="btn btn-primary justify-center mt-6 menu-link" onClick={closeMobileMenu}>Start a project {"\u2192"}</a>
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-mute mt-8 flex justify-between">
              <span>Triadict \u00b7 Pune</span>
              <span>triadict.studio@gmail.com</span>
            </div>
          </nav>
        </div>
      </header>

      <main id="main">
        {/* ═══════════════════ HERO ═══════════════════ */}
        <section id="top" className="relative pt-32 md:pt-40 pb-20 md:pb-28">
          <div className="max-w-[1360px] mx-auto px-6 md:px-10">
            {/* Masthead row */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-12 md:mb-16">
              <div className="eyebrow flex items-center gap-3">
                <span>Vol. 01 \u00b7 Issue 01</span>
                <span className="text-coral">{"\u00b7"}</span>
                <span>Pune, India</span>
              </div>
            </div>

            {/* Hero grid: headline + ToC sidebar */}
            <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
              <div className="lg:col-span-9">
                <h1 className="hero-h text-ink">
                  {heroWords.map((w, i) => (
                    <span key={i}>
                      {w.br && <br className="hidden md:block" />}
                      <span className={`word${w.italic ? ` italic${w.coral ? " text-coral" : ""}` : ""}`}>
                        <span style={{ animationDelay: w.delay }}>{w.text}</span>
                      </span>{" "}
                    </span>
                  ))}
                </h1>
              </div>

              {/* ToC sidebar */}
              <aside className="lg:col-span-3 reveal" data-delay="400" aria-label="Page contents">
                <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-mute mb-3">In this issue</div>
                <a href="#process" className="toc-line"><span>I. Process</span><span>p.02</span></a>
                <a href="#team" className="toc-line"><span>II. Team</span><span>p.03</span></a>
                <a href="#pricing" className="toc-line"><span>III. Pricing</span><span>p.04</span></a>
                <a href="#contact" className="toc-line"><span>IV. Contact</span><span>p.05</span></a>
              </aside>
            </div>

            <div className="hero-rule h-px bg-ink/25 mt-10 md:mt-14 mb-10 md:mb-14" />

            {/* Sub + CTAs */}
            <div className="grid md:grid-cols-12 gap-10 md:gap-8 items-end">
              <p className="md:col-span-7 text-[18px] md:text-[21px] leading-[1.55] text-ink/85 max-w-[54ch] font-display tracking-tight reveal" data-delay="200">
                Editorial brochure sites for solo professionals and boutique brands. Fixed price. Two to three weeks.{" "}
                <span className="text-coral italic">No surprises.</span>
              </p>
              <div className="md:col-span-5 flex flex-wrap items-center gap-3 md:justify-end reveal" data-delay="300">
                <a href="#process" className="btn btn-ghost">
                  See process
                  <span className="arrow" aria-hidden="true">{"\u2192"}</span>
                </a>
                <a href="#contact" className="btn btn-primary">
                  Start a project
                  <span className="arrow" aria-hidden="true">{"\u2192"}</span>
                </a>
              </div>
            </div>

            {/* 3D Triadic */}
            <div className="hero-3d-wrap" aria-hidden="true">
              <Hero3D />
              <div className="hero-3d-label">drag {"\u00b7"} spin</div>
            </div>
          </div>

          {/* Bottom marker */}
          <div className="max-w-[1360px] mx-auto px-6 md:px-10 mt-20 md:mt-28">
            <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.14em] uppercase text-mute">
              <span className="flex items-center gap-2">
                <span className="inline-block w-6 h-px bg-mute" />
                Scroll to begin
              </span>
              <span>p. 01</span>
            </div>
          </div>
        </section>

        {/* ═══════════════════ MARQUEE ═══════════════════ */}
        <section className="border-y border-hairline bg-paper2 py-6 marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...marqueeWords, ...marqueeWords].map((word, i) => (
              <span key={i} className="contents">
                <span className="marquee-item italic text-[28px] md:text-[34px] tracking-tight">
                  {word}
                </span>
                <span className="marquee-item text-coral text-[28px] md:text-[34px]">{"\u2715"}</span>
              </span>
            ))}
          </div>
        </section>

        {/* ═══════════════════ PITCH ═══════════════════ */}
        <section className="py-20 md:py-28">
          <div className="max-w-[1360px] mx-auto px-6 md:px-10">
            <div className="chapter mb-12 md:mb-16 reveal">
              <span className="chapter-rom">I</span>
              <span>The pitch {"\u00b7"} in three lines</span>
            </div>
            <div className="grid md:grid-cols-3 gap-12 md:gap-16">
              <div className="reveal">
                <div className="font-mono text-[44px] md:text-[56px] text-coral leading-none mb-6 font-light">01</div>
                <h3 className="font-display text-[34px] md:text-[44px] leading-[1.0] tracking-[-0.025em] mb-4">
                  Fixed price.
                </h3>
                <p className="text-mute text-[16px] leading-[1.75] max-w-[34ch]">
                  No hourly surprises. You see the number before you commit. We eat the risk if we underestimate {"\u2014"} that&apos;s the deal.
                </p>
              </div>
              <div className="reveal" data-delay="100">
                <div className="font-mono text-[44px] md:text-[56px] text-coral leading-none mb-6 font-light">02</div>
                <h3 className="font-display text-[34px] md:text-[44px] leading-[1.0] tracking-[-0.025em] mb-4">
                  Two to three <span className="italic text-coral">weeks.</span>
                </h3>
                <p className="text-mute text-[16px] leading-[1.75] max-w-[34ch]">
                  Not two to three months. We build small, focused sites that ship {"\u2014"} and we ship on a calendar, not a vibe.
                </p>
              </div>
              <div className="reveal" data-delay="200">
                <div className="font-mono text-[44px] md:text-[56px] text-coral leading-none mb-6 font-light">03</div>
                <h3 className="font-display text-[34px] md:text-[44px] leading-[1.0] tracking-[-0.025em] mb-4">
                  Three people.
                </h3>
                <p className="text-mute text-[16px] leading-[1.75] max-w-[34ch]">
                  Not one freelancer juggling eight clients. Not an agency burying you in account managers. Three specialists. One project at a time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════ MANIFESTO ═══════════════════ */}
        <section id="manifesto" className="py-24 md:py-36 border-t border-hairline bg-charcoal text-paper relative overflow-hidden">
          {/* Decorative coral arc */}
          <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, #E85A2F 0%, transparent 70%)" }} aria-hidden="true" />
          <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #C9B26F 0%, transparent 70%)" }} aria-hidden="true" />

          <div className="max-w-[1360px] mx-auto px-6 md:px-10 relative">
            <div className="chapter mb-12 md:mb-16 reveal eyebrow-dark">
              <span className="chapter-rom text-gold">II</span>
              <span className="text-paper/60">Manifesto {"\u00b7"} what we believe</span>
            </div>

            <blockquote className="reveal" data-delay="100">
              <p className="manifesto-quote max-w-[22ch] md:max-w-[18ch]">
                The web doesn&apos;t need another <span className="italic text-coral">agency.</span> It needs three people who care about typography, ship on time, and pick up the <span className="italic">phone.</span>
              </p>
            </blockquote>

            <div className="grid md:grid-cols-12 gap-8 mt-16 md:mt-20 reveal" data-delay="200">
              <div className="md:col-span-7 md:col-start-6">
                <p className="text-paper/75 text-[16.5px] leading-[1.75] max-w-[58ch] mb-6">
                  We started Triadict because the cheap end of the market ships ugly templates, the expensive end ships beautiful PDFs with bloated invoices, and the middle is empty.
                </p>
                <p className="text-paper/75 text-[16.5px] leading-[1.75] max-w-[58ch] mb-10">
                  Our entire studio is built on one bet: that solo professionals will pay fair money for the kind of editorial design usually reserved for Series A startups {"\u2014"} if someone will just deliver it without the theatre.
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-px bg-coral" />
                  <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-paper/60">The studio {"\u00b7"} 2026</span>
                </div>
              </div>
            </div>

            <div className="section-foot eyebrow-dark border-t-paper/15 mt-20">
              <span>Triadict {"\u00b7"} Vol. 01</span>
              <span>p. 02 / Manifesto</span>
            </div>
          </div>
        </section>

        {/* ═══════════════════ PROCESS ═══════════════════ */}
        <section id="process" className="py-24 md:py-36 border-t border-hairline">
          <div className="max-w-[1360px] mx-auto px-6 md:px-10">
            <div className="chapter mb-10 reveal">
              <span className="chapter-rom">V</span>
              <span>Process {"\u00b7"} five steps</span>
            </div>

            <div className="grid md:grid-cols-12 gap-10 mb-14 md:mb-16">
              <h2 className="section-h md:col-span-7 max-w-[12ch] reveal">
                How a site <span className="italic text-coral">actually</span> ships.
              </h2>
              <p className="md:col-span-4 md:col-start-9 text-mute text-[16.5px] leading-[1.75] reveal" data-delay="200">
                Five steps. Two to three weeks. Two revision rounds baked in. No mystery meetings, no scope drift, no late invoices.
              </p>
            </div>

            <div className="reveal" data-delay="200">
              {processSteps.map((s) => (
                <div key={s.num} className="process-row">
                  <div className="pnum">{s.num}</div>
                  <div className="font-display text-[26px] md:text-[32px] tracking-[-0.02em] leading-tight">{s.title}</div>
                  <div className="pdesc text-mute text-[15px] leading-[1.7] max-w-[40ch]">{s.desc}</div>
                  <div className="ptime">{s.time}</div>
                </div>
              ))}
            </div>

            <div className="section-foot">
              <span>V. Process {"\u00b7"} 17 days</span>
              <span>p. 05 / Triadict</span>
            </div>
          </div>
        </section>

        {/* ═══════════════════ TEAM ═══════════════════ */}
        <section id="team" className="py-24 md:py-36 border-t border-hairline">
          <div className="max-w-[1360px] mx-auto px-6 md:px-10">
            <div className="chapter mb-10 reveal">
              <span className="chapter-rom">VI</span>
              <span>The studio {"\u00b7"} three people</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 md:mb-20">
              <h2 className="section-h max-w-[14ch] reveal">
                The three people <span className="italic text-coral">building</span> your site.
              </h2>
              <p className="text-mute max-w-[34ch] text-[15.5px] leading-[1.75] reveal" data-delay="200">
                Each of us owns one discipline. No account managers. No sub-contractors. You email us, you get us.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-10">
              {teamMembers.map((m) => (
                <article key={m.name} className="team-card reveal" data-delay={m.delay}>
                  <div
                    className="portrait"
                    style={{ background: m.portraitBg, color: m.portraitColor, border: m.portraitBg === "#FAF7F1" ? "1px solid #E5E0D8" : undefined }}
                  >
                    <div className="grain" />
                    <div className="dot-grid" />
                    <span className={`corner-tag ${m.tagColor}`}>{m.tag}</span>
                    <span className={`mono${m.monoPv ? " mono-pv" : ""}`}>
                      {m.mono.charAt(0)}
                      <span className={m.dotColor}>
                        {m.monoPv ? <span className="pv-dot">{"\u00b7"}</span> : "\u00b7"}
                      </span>
                      {m.mono.charAt(2)}
                    </span>
                  </div>
                  <div className="mt-6">
                    <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-mute mb-1">{m.role}</div>
                    <h3 className="font-display text-[28px] tracking-tight leading-tight">{m.name}</h3>
                    <p className="text-mute text-[15px] leading-[1.75] mt-2 max-w-[36ch]">{m.bio}</p>
                    <blockquote className="font-display italic text-[18px] leading-snug mt-5 pl-4 border-l-2 border-coral text-ink/85 max-w-[34ch]">
                      {m.quote}
                    </blockquote>
                    <div className="flex items-center gap-5 mt-5 text-[13.5px]">
                      <a href={m.linkedin} className="ulink text-ink" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                      <a href={m.link2.href} className="ulink text-ink" target="_blank" rel="noopener noreferrer" {...(m.link2.href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}>
                        {m.link2.label}
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="section-foot">
              <span>VI. Team {"\u00b7"} Triadict</span>
              <span>p. 06 / Triadict</span>
            </div>
          </div>
        </section>

        {/* ═══════════════════ PRICING ═══════════════════ */}
        <section id="pricing" className="py-24 md:py-36 border-t border-hairline bg-paper2">
          <div className="max-w-[1360px] mx-auto px-6 md:px-10">
            <div className="chapter mb-10 reveal">
              <span className="chapter-rom">VII</span>
              <span>Pricing {"\u00b7"} three ranges</span>
            </div>

            <div className="grid md:grid-cols-12 gap-10 mb-14 md:mb-20">
              <h2 className="section-h md:col-span-7 max-w-[14ch] reveal">
                The price is on <span className="italic text-coral">the page.</span>
              </h2>
              <p className="md:col-span-4 md:col-start-9 text-mute text-[16.5px] leading-[1.75] reveal" data-delay="200">
                No &quot;request a quote&quot; theatre. No three-tier comparison games. Our work falls in three ranges depending on scope. Every project gets a fixed quote within 48 hours of the discovery call {"\u2014"} the price doesn&apos;t move once we agree.
              </p>
            </div>

            <div className="reveal" data-delay="100">
              {pricingTiers.map((t) => (
                <div key={t.name} className="range-row">
                  <div>
                    <h3 className="range-name font-display text-[40px] md:text-[52px] tracking-[-0.025em] leading-none">{t.name}</h3>
                    <div className="font-mono text-[12px] tracking-[0.14em] uppercase text-mute mt-3">{t.price}</div>
                  </div>
                  <p className="text-ink/85 text-[16.5px] leading-[1.7] max-w-[52ch]">{t.desc}</p>
                  <ul className="space-y-1.5 font-mono text-[10.5px] tracking-[0.14em] uppercase text-mute">
                    {t.clients.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            {/* Footer line + CTA link */}
            <div className="text-center mt-16 md:mt-20">
              <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-mute">
                Every quote is fixed {"\u00b7"} No hourly {"\u00b7"} No surprises {"\u00b7"} No retainer lock-ins
              </div>
              <a href="#contact" className="inline-flex items-center gap-2 mt-8 text-[15.5px] text-ink ulink">
                Tell us about your project
                <span aria-hidden="true">{"\u2192"}</span>
              </a>
            </div>

            <div className="section-foot">
              <span>VII. Pricing {"\u00b7"} three ranges</span>
              <span>p. 07 / Triadict</span>
            </div>
          </div>
        </section>

        {/* ═══════════════════ CONTACT ═══════════════════ */}
        <section id="contact" className="py-24 md:py-36 border-t border-hairline bg-ink text-paper relative overflow-hidden">
          {/* Decorative arcs */}
          <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-[0.09]" style={{ background: "radial-gradient(circle, #E85A2F 0%, transparent 70%)" }} aria-hidden="true" />
          <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #C9B26F 0%, transparent 70%)" }} aria-hidden="true" />

          <div className="max-w-[1360px] mx-auto px-6 md:px-10 relative">
            <div className="chapter mb-12 reveal eyebrow-dark">
              <span className="chapter-rom text-gold">IX</span>
              <span className="text-paper/60">Contact {"\u00b7"} one form, four fields</span>
            </div>

            <div className="grid md:grid-cols-12 gap-10 md:gap-16">
              {/* Left column */}
              <div className="md:col-span-6 reveal">
                <h2 className="font-display text-[clamp(2.75rem,7.6vw,6.5rem)] tracking-[-0.03em] leading-[0.96] mb-8">
                  Send us your <span className="italic text-coral">worst</span> website.
                </h2>
                <p className="text-paper/70 text-[17px] leading-[1.75] max-w-[44ch] mb-10">
                  Tell us your current site (or that you don&apos;t have one). What&apos;s broken, what budget you&apos;re working with, what timeline. We reply within a working day.
                </p>

                <div className="space-y-7">
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-paper/50 mb-2">Or just email</div>
                    <a href="mailto:triadict.studio@gmail.com" className="ulink font-display text-[28px] md:text-[36px] tracking-[-0.02em]">triadict.studio@gmail.com</a>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-paper/50 mb-3">Direct {"\u00b7"} Call or WhatsApp</div>
                    <ul className="space-y-2 text-[16px]">
                      <li className="flex items-baseline justify-between gap-4">
                        <span className="text-paper/70 font-mono text-[11px] tracking-[0.14em] uppercase">Aditya</span>
                        <a href="https://wa.me/918262996104" className="ulink" target="_blank" rel="noopener noreferrer">+91 82629 96104</a>
                      </li>
                      <li className="flex items-baseline justify-between gap-4">
                        <span className="text-paper/70 font-mono text-[11px] tracking-[0.14em] uppercase">Shreeshant</span>
                        <a href="https://wa.me/918530778051" className="ulink" target="_blank" rel="noopener noreferrer">+91 85307 78051</a>
                      </li>
                      <li className="flex items-baseline justify-between gap-4">
                        <span className="text-paper/70 font-mono text-[11px] tracking-[0.14em] uppercase">Prajwal</span>
                        <a href="https://wa.me/919881909685" className="ulink" target="_blank" rel="noopener noreferrer">+91 98819 09685</a>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-6 border-t border-paper/15">
                    <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-paper/50 mb-3">Studio hours</div>
                    <div className="text-[15px] text-paper/80 leading-[1.7]">
                      Mon {"\u2014"} Fri {"\u00b7"} 10:00 {"\u2014"} 19:00 IST<br />
                      Most replies inside 6 working hours.
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form
                id="contact-form"
                className="md:col-span-6 md:col-start-7 reveal"
                data-delay="200"
                action="https://formsubmit.co/urban.void.69@gmail.com"
                method="POST"
                onSubmit={async (e) => {
                  e.preventDefault()
                  const form = e.currentTarget
                  const honey = form.elements.namedItem("_honey") as HTMLInputElement | undefined
                  if (honey?.value) return
                  const submitBtn = form.querySelector<HTMLButtonElement>("#contact-submit")
                  const status = form.querySelector<HTMLDivElement>("#contact-status")
                  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending\u2026" }
                  if (status) status.textContent = "Delivering your note to the studio\u2026"
                  try {
                    const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
                    if (res.ok) {
                      if (submitBtn) submitBtn.textContent = "Sent \u2713"
                      if (status) status.textContent = "Got it. We\u2019ll reply within one working day."
                      form.querySelectorAll("input:not([type=hidden]), textarea").forEach((f) => { ;(f as HTMLInputElement).value = "" })
                      setTimeout(() => {
                        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Send it \u2192" }
                        if (status) status.textContent = "We reply within one working day \u00b7 No newsletter, ever"
                      }, 6000)
                    } else {
                      throw new Error("fail")
                    }
                  } catch {
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Send it \u2192" }
                    if (status) status.textContent = "Something broke \u2014 please email triadict.studio@gmail.com directly."
                  }
                }}
              >
                {/* FormSubmit config */}
                <input type="hidden" name="_subject" value="New Triadict project inquiry" />
                <input type="hidden" name="_cc" value="triadict.studio@gmail.com,shr.mail.box@gmail.com,prajwalvalekar08@gmail.com" />
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_autoresponse" value="Thanks for your note \u2014 Triadict will reply within one working day. \u2014 Aditya, Shreeshant & Prajwal" />
                {/* Honeypot */}
                <input type="text" name="_honey" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

                <div className="field">
                  <input type="text" id="name" name="name" placeholder=" " required autoComplete="name" />
                  <label htmlFor="name">Name</label>
                </div>
                <div className="field mt-1">
                  <input type="email" id="email" name="email" placeholder=" " required autoComplete="email" />
                  <label htmlFor="email">Email</label>
                </div>
                <div className="field mt-1">
                  <input type="url" id="site" name="website" placeholder=" " autoComplete="url" />
                  <label htmlFor="site">Current website (optional)</label>
                </div>
                <div className="field mt-1">
                  <textarea id="brief" name="brief" rows={4} placeholder=" " required />
                  <label htmlFor="brief">What you need</label>
                </div>
                <button type="submit" id="contact-submit" className="btn mt-10 bg-coral text-paper hover:bg-paper hover:text-ink w-full justify-center">
                  Send it {"\u2192"}
                </button>
                <p id="contact-status" className="font-mono text-[10px] tracking-[0.14em] uppercase text-paper/40 mt-5 text-center">
                  We reply within one working day {"\u00b7"} No newsletter, ever
                </p>
              </form>
            </div>

            <div className="section-foot eyebrow-dark border-t-paper/15 mt-20">
              <span>IX. Contact {"\u00b7"} Triadict</span>
              <span>p. 09 / Triadict</span>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="bg-paper border-t border-hairline pt-16 md:pt-20 pb-10">
        <div className="max-w-[1360px] mx-auto px-6 md:px-10">
          {/* Big wordmark */}
          <div className="font-display tracking-[-0.04em] leading-[0.85] text-[clamp(5rem,18vw,16rem)] mb-14 md:mb-16 flex items-end gap-4">
            <span>Triadict</span>
            <span className="text-coral italic text-[clamp(2rem,6vw,5rem)] mb-3 md:mb-6">.</span>
          </div>

          <div className="grid md:grid-cols-12 gap-10 md:gap-8 pb-12 border-b border-hairline">
            <div className="md:col-span-4">
              <div className="flex items-center gap-3 mb-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="text-ink">
                  <line x1="12" y1="5.5" x2="5.5" y2="17.5" />
                  <line x1="12" y1="5.5" x2="18.5" y2="17.5" />
                  <line x1="6" y1="18" x2="18" y2="18" />
                  <circle cx="12" cy="5.5" r="1.6" fill="currentColor" />
                  <circle cx="5.5" cy="18" r="1.6" fill="currentColor" />
                  <circle cx="18.5" cy="18" r="1.6" fill="currentColor" />
                </svg>
                <span className="font-display text-[20px]">Triadict Studio</span>
              </div>
              <p className="text-mute text-[14.5px] leading-[1.75] max-w-[34ch]">
                Editorial websites for solo professionals and boutique brands. Fixed price, two to three weeks, no surprises.
              </p>
              <div className="mt-6 font-mono text-[10px] tracking-[0.14em] uppercase text-mute">
                Pune, India {"\u00b7"} Serving clients globally
              </div>
            </div>

            <div className="md:col-span-2 md:col-start-6">
              <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-mute mb-4">Studio</div>
              <ul className="space-y-2 text-[14.5px]">
                <li><a href="#process" className="ulink">Process</a></li>
                <li><a href="#team" className="ulink">Team</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-mute mb-4">Dashboards</div>
              <ul className="space-y-2 text-[14.5px]">
                <li><a href="/auth/login?redirect=/studio/dashboard" className="ulink">Studio CRM</a></li>
                <li><a href="/auth/login?redirect=/portal/dashboard" className="ulink">Client Portal</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-mute mb-4">Services</div>
              <ul className="space-y-2 text-[14.5px]">
                <li><a href="#pricing" className="ulink">Pricing</a></li>
                <li><a href="#contact" className="ulink">Start a project</a></li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-mute mb-4">Contact</div>
              <ul className="space-y-2 text-[14.5px]">
                <li><a href="mailto:triadict.studio@gmail.com" className="ulink">triadict.studio@gmail.com</a></li>
                <li><a href="https://wa.me/918262996104" className="ulink" target="_blank" rel="noopener noreferrer">+91 82629 96104</a></li>
                <li><a href="https://www.linkedin.com/in/aditya-suryavanshi-1b5608376/" className="ulink" target="_blank" rel="noopener noreferrer">LinkedIn {"\u2197"}</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-8 font-mono text-[11px] tracking-[0.14em] uppercase text-mute">
            <div>{"\u00a9"} 2026 Triadict Studio {"\u00b7"} Made in Pune</div>
            <div className="flex items-center gap-4 flex-wrap">
              <span>Vol. 01 {"\u00b7"} Issue 01</span>
              <span className="text-hairline">{"\u00b7"}</span>
              <span>Build 002</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
