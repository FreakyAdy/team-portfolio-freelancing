## TRIADICT STUDIO

Agency Operating Workflow — V2

Automation-Ready Client Lifecycle Acquire·Convert·Close·Deliver·Approve·Retain·Expand

Updated for Triadict's current three-person operating reality: every lifecycle step now includes the assets that must exist, the automation that should be added, the human approval point, and the workflow trigger.

Design principle: automate handoffs, data movement, reminders, document generation, QA and reporting. Keep humans in control of positioning, qualification, pricing, scope, legal acceptance, client communication and final approvals.

## WHAT CHANGED IN V2

The original workflow had a strong client lifecycle but mostly described what the team should do. V2 turns it into an operating system: reusable templates, system prerequisites, automation triggers, status gates and client-facing infrastructure.

<table border="1"><tr><td>Layer</td><td>Added in V2</td></tr><tr><td>System of record</td><td>One CRM/project database with canonical client, lead, deal, project, invoice and approval states.</td></tr><tr><td>Template library</td><td>Proposal, SOW, agreement, invoice, welcome, kickoff, QA, change order, handover, testimonial and retainer assets.</td></tr><tr><td>Client portal</td><td>Created automatically after payment; contains status, milestones, files, approvals, feedback and links.</td></tr><tr><td>Claude layer</td><td>Research, drafting, extraction, summarization and classification with structured outputs and human review.</td></tr><tr><td>Automation layer</td><td>Event-driven workflows for handoffs, reminders, document creation, alerts and status changes.</td></tr><tr><td>Quality gates</td><td>No stage advances until its explicit prerequisites are satisfied.</td></tr><tr><td>Observability</td><td>Automation logs, failed-run alerts, ownership, retries and manual fallback paths.</td></tr></table>

## NON-NEGOTIABLE ARCHITECTURE

Use one source of truth. Claude and every automation should read from and write back to structured records instead of separate spreadsheets, inbox memory and duplicated documents. Every automation needs: trigger, owner, inputs, outputs, retry behavior, failure alert, audit log and manual fallback.

<div align="center">

# FOUNDATIONAL SYSTEMS TO BUILD FIRST

</div>

These are prerequisites for the workflow. Building automations before these foundations will create brittle workflows and duplicated data.

<table border="1"><tr><td>Priority</td><td>System/asset</td><td>Minimum viable version</td></tr><tr><td>P0</td><td>Studio CRM/Operating Database</td><td>Lead, company, contact, deal, project, stage, next action, owner, value, source, documents, invoices, approvals.</td></tr><tr><td>P0</td><td>Template Library</td><td>Version-controlled master templates with locked legal/commercial sections and merge fields.</td></tr><tr><td>P0</td><td>Automation Orchestrator</td><td>Central workflows for triggers, retries, logging, alerts and manual reruns.</td></tr><tr><td>P0</td><td>Client Portal Template</td><td>Overview, timeline, tasks, files, feedback, approvals, invoices, meeting notes and support.</td></tr><tr><td>P0</td><td>Credential&amp;Access Process</td><td>Secure collection, least-privilege access, expiry/revocation checklist; never store secrets in ordinary forms.</td></tr><tr><td>P0</td><td>Studio File Structure</td><td>Standard folders and naming:00_Admin,01_Discovery,02_Scope,03_Design,04_Build,05_QA,06_Launch,07_Handover.</td></tr><tr><td>P1</td><td>Claude Prompt+Schema Library</td><td>Prompts for research, qualification, discovery extraction, proposal drafting, feedback clustering and retrospectives.</td></tr><tr><td>P1</td><td>Monitoring&amp;Alerting</td><td>Automation failures, overdue client actions, uptime, forms, performance,404s and payment status.</td></tr><tr><td>P1</td><td>Website Conversion Update</td><td>Align public positioning/pricing with boutique web+ digital systems direction; add stronger proof, process and qualified enquiry flow.</td></tr><tr><td>P1</td><td>Internal Dashboard</td><td>Pipeline, response SLA, proposal value, close rate, active capacity, receivables, project health and recurring revenue.</td></tr></table>

Find the right leads and open the conversation

## 01

## Find Leads

## GOAL

Find businesses where a better website or digital system creates enough value to justify paying Triadict.

CORE EXECUTION

- Run location $ \rightarrow $ business finder $ \rightarrow $ website audit $ \rightarrow $ shortlist.

- Prioritize buying power, commercial value, trigger signals, technical problems and real financial impact.

- Research each shortlisted business deeply before outreach.

- BUILD BEFORE / PREREQUISITES

- Lead scoring rubric and ICP scorecard

- Claude research prompt + structured JSON output schema

- Website audit checklist

- Lead database / CRM stages and deduplication rules

- Do-not-contact / suppression list

- AUTOMATE/AUGMENT

- Automate enrichment, technology detection, site-health checks, trigger-signal collection and first-pass scoring.

- Use Claude to produce a research brief, commercial hypothesis and evidence-backed personalization angles.

- Require human approval before a lead becomes outreach-ready.

AUTOMATION FLOW

Lead record created $ \rightarrow $ enrichment $ \rightarrow $ AI score $ \rightarrow $ human review $ \rightarrow $ approved prospect queue

02

## Send Personalized Outreach

GOAL

Start a conversation, not sell the entire project.

CORE EXECUTION

- Reference one concrete observation and one relevant opportunity.

- Keep first touch to 3-5 sentences with one clear question.

- Follow up 3-5 times over 2-3 weeks; each touch adds value.

- BUILD BEFORE / PREREQUISITES

- Outreach message templates by scenario

- Follow-up sequence library

- Personalization QA checklist

- Demo/audit mini-brief template

- Sending-domain and mailbox setup

- AUTOMATE/AUGMENT

- Claude drafts first-touch and follow-ups from the approved research brief.

- Sequence engine schedules touches, pauses on reply and logs every event.

- Human reviews all first-touch messages until quality is proven.

AUTOMATION FLOW

Approved lead → draft → human approval → send → follow-up sequence → reply detection

## 03

## Turn Interest into Real Opportunity

## GOAL

Keep momentum and understand what the prospect actually wants.

CORE EXECUTION

- Reply within 2-4 hours.

- Ask one smart follow-up question; keep focus on their problem.

- Move toward a discovery call rather than sending a generic portfolio.

- BUILD BEFORE / PREREQUISITES

- Reply acknowledgement templates

- Lead-response SLA

- Conversation summary template

- CRM reply-status rules

- AUTOMATE/AUGMENT

- Detect replies automatically, classify intent and urgency, and alert the owner.

- Claude drafts a suggested reply and updates the lead summary.

- Create an overdue-response alert before the SLA is breached.

AUTOMATION FLOW

Reply detected $ \rightarrow $ classify $ \rightarrow $ alert $ \rightarrow $ suggested response $ \rightarrow $ human send $ \rightarrow $ CRM updated

04

## Qualify the Opportunity

GOAL

Confirm the lead is worth pursuing before significant time is invested.

CORE EXECUTION

- Assess budget signal, authority, need and timeline.

- Identify the decision-maker early.

- Exit weak opportunities gracefully.

- BUILD BEFORE / PREREQUISITES

- Qualification scorecard

- Disqualification reasons

- Budget-question library

- Graceful exit / nurture templates

- AUTOMATE/AUGMENT

- Claude extracts BANT-style signals from email and call notes.

- CRM calculates qualification score and routes to qualified, nurture or closed-lost.

- Create reminders only for genuine next actions.

AUTOMATION FLOW

Conversation data → AI extraction → score → human decision → route

GOAL

Understand the client's situation fully before proposing anything.

CORE EXECUTION

- Offer two times or a scheduling link.

- Prepare 6-10 project-specific questions.

- Send a written summary within 24 hours.

- BUILD BEFORE / PREREQUISITES

- Discovery question bank

- Meeting agenda template

- Pre-call research brief

- Discovery notes template

- Follow-up summary template

- AUTOMATE/AUGMENT

- Booking creates calendar event, meeting folder, CRM activity and pre-call task automatically.

- Claude generates project-specific questions from lead history.

- Transcript is summarized into goals, risks, constraints, stakeholders and next steps.

AUTOMATION FLOW

Qualified → booking → auto-prep pack → call → transcript → structured summary → follow-up

## 06

## Create and Present the Proposal

GOAL

Present a clear, value-anchored solution reflecting the client's specific problem.

CORE EXECUTION

- Offer standard and premium options where useful.

- Structure: situation, solution, scope, timeline, investment, next steps.

- Present live; scope changes change price.

- BUILD BEFORE / PREREQUISITES

- Proposal master template

- Pricing calculator

- Scope library by service

- Risk multiplier rules

- Proposal QA checklist

- AUTOMATE/AUGMENT

- Claude converts approved discovery data into a proposal draft using locked sections and variables.

- Pricing calculator suggests a range; founders approve final commercial terms.

- Proposal status, expiry and follow-up dates sync to CRM.

AUTOMATION FLOW

Discovery approved $ \rightarrow $ scope draft $ \rightarrow $ internal review $ \rightarrow $ pricing $ \rightarrow $ proposal generation $ \rightarrow $ presentation

## 07

## Finalize Agreement and SOW

## GOAL

Establish legal, commercial and scope boundaries before work begins.

CORE EXECUTION

- Agreement covers payment, revisions, IP, confidentiality, termination, dispute process and liability cap.

- SOW defines deliverables, exclusions, timeline, revisions and sign-off.

- Send Agreement + SOW together; invoice only after signature.

- BUILD BEFORE / PREREQUISITES

- Master Services Agreement template

- SOW templates by project type

- Change-order template

- Data-processing / AI addendum when relevant

- E-signature account and folder convention

- AUTOMATE/AUGMENT

- Merge approved proposal fields into SOW and agreement variables.

- E-signature completion changes CRM status automatically and triggers invoice preparation.

- Store immutable signed copies in the client portal.

AUTOMATION FLOW

Proposal accepted $ \rightarrow $ document generation $ \rightarrow $ internal check $ \rightarrow $ e-sign $ \rightarrow $ signed status

08

## Secure Advance Payment

GOAL

Collect the upfront payment before production starts.

CORE EXECUTION

- Under $5k: 50/50. Larger or riskier: 40/30/30.

- Confirm funds have cleared before starting.

- Activate project only after signature, SOW approval and payment.

- BUILD BEFORE / PREREQUISITES

- Invoice template

- Invoice numbering convention

- Payment schedule rules

- Wise/bank payment instructions

- Overdue reminder templates

- AUTOMATE/AUGMENT

- Generate invoice from signed commercial data; never retype totals manually.

- Payment webhook or manual confirmation updates project status and triggers onboarding.

- Automated reminders at due date +5 and +10 business days, with human escalation.

AUTOMATION FLOW

Signed $ \rightarrow $ invoice $ \rightarrow $ payment pending $ \rightarrow $ cleared $ \rightarrow $ project activation

## 09

## Client Onboarding

## GOAL

Collect everything required to start and set expectations.

CORE EXECUTION

- Collect brand, content, access, analytics, hosting and codebase information.

- Define communication and feedback norms.

- Create the shared tracker and invite the client.

- BUILD BEFORE / PREREQUISITES

- Universal onboarding form

- Project-specific intake modules

- Credential-sharing instructions

- Access checklist

- Communication policy

- Client portal template

- AUTOMATE/AUGMENT

- Payment clearance creates the client portal from a template.

- Send a conditional onboarding form based on project type.

- Track missing assets and send reminders; credentials should go through a secure password-sharing method, not plain forms. AUTOMATION FLOW

Payment cleared $ \rightarrow $ portal created $ \rightarrow $ intake sent $ \rightarrow $ assets tracked $ \rightarrow $ readiness gate

## 10

## Send Welcome Message

GOAL

Confirm the project is live and set a professional tone.

CORE EXECUTION

- Send within 24 hours of payment clearance.

- Explain first week, next contact point, tracker location and communication channel.

- Link signed documents and project tracker.

- BUILD BEFORE / PREREQUISITES

- Welcome email template

- First-week timeline block

- Contact / escalation block

- Portal quick-start guide

- AUTOMATE/AUGMENT

- Generate a personalized welcome message from project data.

- Send only after the portal and onboarding form exist so every link is valid.

- Log delivery and client acknowledgement.

AUTOMATION FLOW

Project active → validate links → personalize → send → log

## Run the Kickoff

## GOAL

Align on vision, timeline, responsibilities and definition of done.

CORE EXECUTION

- Hold within first 3 days.

- Confirm goals, milestones, stakeholder roles, feedback method and hard deadlines.

- Send summary within 24 hours.

- BUILD BEFORE / PREREQUISITES

- Kickoff deck template

- RACI / stakeholder map

- Milestone plan

- Decision log

- Kickoff summary template

- AUTOMATE/AUGMENT

- Create kickoff deck and agenda from approved scope.

- Transcript becomes decisions, risks, actions and owners.

- Push actions to project tracker with due dates.

## AUTOMATION FLOW

Ready gate → kickoff → transcript → decisions/actions → client summary

GOAL

Build in structured, reviewable phases with approval gates.

CORE EXECUTION

- Use project-appropriate phases.

- Get written approval before advancing.

- Maintain change log and technical benchmarks.

- BUILD BEFORE / PREREQUISITES

- Project templates by service type

- Definition-of-done checklist per phase

- Approval form

- Change log

- SEO migration map template

- Performance benchmark sheet

- AUTOMATE/AUGMENT

- Project creation clones the correct phase template and tasks.

- CI/CD runs automated tests, Lighthouse checks and link checks at defined gates.

- Phase completion sends a review request and blocks next phase until approval.

AUTOMATION FLOW

Phase work $ \rightarrow $ automated checks $ \rightarrow $ internal review $ \rightarrow $ client approval $ \rightarrow $ next phase

## 13

## Control Feedback and Changes

GOAL

Keep feedback structured, documented and within scope.

CORE EXECUTION

- All feedback goes through the agreed channel.

- Track revision rounds.

- Anything outside SOW becomes a change order.

- BUILD BEFORE / PREREQUISITES

- Feedback form

- Revision tracker

- Scope comparison checklist

- Change-order template

- Approval / decline messages

- AUTOMATE/AUGMENT

- Centralize feedback from portal into project tasks.

- Claude clusters duplicate comments and maps requests against SOW, but a human decides scope status.

- Approved change order updates budget, timeline and task plan.

AUTOMATION FLOW

Feedback $ \rightarrow $ consolidate $ \rightarrow $ scope check $ \rightarrow $ revision or change order $ \rightarrow $ approval $ \rightarrow $ update plan

## 14

## Internal QA

## GOAL

Catch issues before the client sees them.

CORE EXECUTION

- Test browsers, devices, links, forms, speed, SEO, analytics and content.

- For legacy/SEO work, compare against pre-project benchmarks.

- Do not hand the client unfinished QA.

- BUILD BEFORE / PREREQUISITES

- Master QA checklist

- Browser/device matrix

- Form test log

- SEO checklist

- Accessibility checklist

- Security basics checklist

- Launch rollback plan

- AUTOMATE/AUGMENT

- CI runs tests, broken-link checks, Lighthouse budgets and build validation.

- Automated crawl compares staging URLs, metadata and redirects against baseline.

- Generate a QA report; require human visual and content sign-off.

AUTOMATION FLOW

Build complete $ \rightarrow $ automated QA $ \rightarrow $ human QA $ \rightarrow $ defects fixed $ \rightarrow $ QA gate passed

## 15

## Client Review and Final Approval

GOAL

Get explicit written sign-off before launch.

CORE EXECUTION

- Provide staging URL and review instructions.

- Set 3-5 business-day deadline.

- Request explicit written approval after final changes.

- BUILD BEFORE / PREREQUISITES

- Client review guide

- Final revision form

- Approval record template

- Review reminder sequence

- AUTOMATE/AUGMENT

- Portal opens a review window and records feedback centrally.

- Automated reminders run before the deadline.

- Approval is timestamped and locks the approved release candidate.

AUTOMATION FLOW

## 16

## Final Payment, Then Launch

## GOAL

Collect final payment before going live and execute a controlled launch.

## CORE EXECUTION

- Issue final invoice after written approval.

- Do not launch until payment clears.

- Verify DNS, SSL, redirects, caching, forms, analytics and sitemap.

- BUILD BEFORE / PREREQUISITES

- Final invoice template

- Launch checklist

- DNS / access checklist

- Rollback runbook

- Launch confirmation template

- AUTOMATE/AUGMENT

- Approval triggers final invoice.

- Launch gate requires approval + cleared payment + QA pass.

- Deployment pipeline runs launch checks and produces a launch record.

## AUTOMATION FLOW

Approval $ \rightarrow $ final invoice $ \rightarrow $ payment $ \rightarrow $ launch gate $ \rightarrow $ deploy $ \rightarrow $ verify $ \rightarrow $ confirmation

## 17

## Post-Launch Monitoring

## GOAL

Catch post-launch issues quickly.

CORE EXECUTION

- Monitor for 14 days.

- Check analytics after 48 hours and SEO coverage after 7-10 days.

- Send a one-week live update.

- BUILD BEFORE / PREREQUISITES

- 14-day monitoring checklist

- Incident log

- 1-week report template

- Support boundary rules

- AUTOMATE/AUGMENT

- Uptime, form checks, 404 monitoring and performance alerts run automatically.

- Create alerts only for actionable thresholds.

- Generate a concise 1-week report from monitoring data and resolved incidents.

AUTOMATION FLOW

Launch → monitors active → alerts/incidents → 1-week report → support close

## Handover and Expansion Planning

Complete the project cleanly and identify the next real opportunity.

GOAL

CORE EXECUTION

- Deliver source files, credentials, documentation and walkthroughs.

- Explain ongoing management.

- Identify one specific business bottleneck for future work.

- BUILD BEFORE / PREREQUISITES

- Handover package template

- Credential transfer checklist

- CMS walkthrough script

- Expansion opportunity worksheet

- Project closeout checklist

- AUTOMATE/AUGMENT

- Generate a handover index from project assets.

- Portal exposes approved final files and training resources.

- Claude summarizes observed bottlenecks from discovery, delivery and support history for internal review.

Support close $ \rightarrow $ handover pack $ \rightarrow $ training $ \rightarrow $ closeout $ \rightarrow $ expansion hypothesis

GOAL

Capture proof of value and improve the process.

CORE EXECUTION

- Ask 2-4 weeks post-launch.

- Use 3 specific questions and request public-use permission.

- Document measurable results where possible.

- BUILD BEFORE / PREREQUISITES

- Testimonial request template

- Feedback form

- Case-study permission clause

- Internal retrospective template

- AUTOMATE/AUGMENT

- Schedule request based on launch date.

- Route positive responses into case-study workflow; route friction into internal improvement tasks.

- Never publish without explicit permission.

AUTOMATION FLOW

Launch + 2-4 weeks request response testimonial/case study or improvement actions

## Pitch Monthly Services

GOAL

Convert successful project relationships into recurring revenue.

CORE EXECUTION

- Introduce after the client has seen the site performing.

- Frame as protection and continuous improvement.

- Use a one-page scope with limits and exclusions.

- BUILD BEFORE / PREREQUISITES

- Monthly service one-pagers

- Monitoring report sample

- Retainer SOW template

- Capacity and request-limit rules

- 60/90-day follow-up templates

- AUTOMATE/AUGMENT

- Generate a recommendation from actual monitoring data and client needs.

- Recurring billing, monthly report generation and request-capacity tracking should be automated.

- If declined, schedule 60- and 90-day follow-ups.

AUTOMATION FLOW

Performance data $ \rightarrow $ recommendation $ \rightarrow $ proposal $ \rightarrow $ recurring agreement $ \rightarrow $ billing/reporting

21

## Introduce Additional Services

GOAL

Expand by solving the next specific business bottleneck.

## CORE EXECUTION

- Introduce one service at a time.

- Use evidence from the relationship.

- Prioritize lead response, CRM/workflow automation, AI website agents and email automation.

- BUILD BEFORE / PREREQUISITES

- Automation opportunity audit

- ROI hypothesis template

- System discovery questionnaire

- Pilot scope template

- AI risk / human-review checklist

- AUTOMATE/AUGMENT

- Claude analyzes client process notes to surface candidate bottlenecks, evidence and questions—not to auto-sell.

- Run a lightweight automation audit and estimate current manual cost / leakage.

- Create a pilot proposal only after human validation.

## AUTOMATION FLOW

Client history $ \rightarrow $ bottleneck hypothesis $ \rightarrow $ validation $ \rightarrow $ ROI case $ \rightarrow $ pilot proposal

<div align="center">

# CLAUDE-ASSISTED LEAD GENERATION SYSTEM

</div>

The existing location $ \rightarrow $ business finder $ \rightarrow $ website audit $ \rightarrow $ shortlist system should be upgraded from a website finder into a commercial-opportunity engine.

<table border="1"><tr><td>Stage</td><td>Automation</td><td>Human gate</td></tr><tr><td>1. Source</td><td>Find businesses by geography, niche, directories and trigger signals.</td><td>Choose target market/ICP.</td></tr><tr><td>2. Enrich</td><td>Collect website, business model, locations, team, tech, traffic proxies, hiring/expansion signals.</td><td>None unless data conflicts.</td></tr><tr><td>3. Technical audit</td><td>Check performance, mobile, forms, broken links, stack age, SEO basics and conversion friction.</td><td>Review high-impact claims.</td></tr><tr><td>4. Commercial research</td><td>Claude creates business story, likely revenue model, digital mismatch, opportunity hypothesis and evidence links.</td><td>Reject weak or speculative hypotheses.</td></tr><tr><td>5. Score</td><td>Weighted score: buying power, pain severity, timing signal, fit, access to decision-maker, differentiation potential.</td><td>Approve scoring weights.</td></tr><tr><td>6. Personalization</td><td>Claude drafts 2-3 outreach angles and optional mini-demo brief.</td><td>Select angle and approve first touch.</td></tr><tr><td>7. Sequence</td><td>Send, schedule value-add follow-ups, stop on reply, log events.</td><td>Human handles replies.</td></tr><tr><td>8. Learning loop</td><td>Track replies, meetings, proposals and wins back to source/scoring attributes.</td><td>Monthly scoring review.</td></tr></table>

## Recommended Claude output schema

company_summary·commercial_model·likely_buyer·trigger_signals[]·website_issues[]·business_impact_hypotheses[]· evidence[]·risk_flags[]·score_components·outreach_angles[]·recommended_next_action

Critical rule: Claude may synthesize and prioritize evidence, but it must not invent business facts, traffic, revenue, rankings or technical failures. Store evidence alongside every material claim.

## CLIENT PORTAL — MINIMUM VIABLE SPEC

<table border="1"><tr><td>Area</td><td>Client sees</td><td>Studio automation</td></tr><tr><td>Overview</td><td>Project status, next milestone, next action, key contacts.</td><td>Status synced from project system.</td></tr><tr><td>Timeline</td><td>Milestones, dates, dependencies and approvals.</td><td>Updates when approved change orders alter schedule.</td></tr><tr><td>Tasks/Inputs</td><td>What Triadict needs from the client, owner and due date.</td><td>Reminders and overdue escalation.</td></tr><tr><td>Files</td><td>Signed docs, approved deliverables, handover files.</td><td>Generated docs and final files published automatically.</td></tr><tr><td>Feedback</td><td>Structured feedback by phase.</td><td>Creates linked tasks and revision count.</td></tr><tr><td>Approvals</td><td>Phase, final and launch approvals.</td><td>Timestamped gate that unlocks next workflow.</td></tr><tr><td>Invoices</td><td>Invoice status and payment instructions.</td><td>Synced from billing record; no secret banking data in logs.</td></tr><tr><td>Meetings</td><td>Agenda, notes, decisions and actions.</td><td>Transcript summary published after human review.</td></tr><tr><td>Support</td><td>Post-launch issue intake and support boundary.</td><td>Routes bugs vs new scope.</td></tr></table>

## STUDIO WEBSITE UPDATE

The current public website pricing and positioning should be brought into line with the business context before scaling outreach. The site should stop implying a low-cost package ladder and instead qualify for fit, risk and business value.

- Replace low anchor pricing with service-specific starting points or a qualified enquiry path.

- Lead with the core positioning: boutique web and digital systems studio; custom work; fewer, better clients.

- Create dedicated pages for custom websites, redesigns, legacy modernization, SEO-sensitive migrations and performance engineering.

- Add a clear process page matching this operating workflow and approval-gate discipline.

- Add case-study infrastructure now, even before multiple case studies exist, so evidence can be published consistently later.

- Replace generic contact with a structured project enquiry form that feeds the CRM and qualification workflow.

- Add a privacy notice, terms, cookie/analytics handling as applicable, and a clear AI/data-processing disclosure for AI-enabled services.

- Instrument enquiry conversion, source attribution and form completion so lead-generation decisions are evidence-based.

<div align="center">

# MASTER TEMPLATE INVENTORY

</div>

Build these once, version them, and use merge fields. Do not create each project from scratch.

<table border="1"><tr><td>Category</td><td>Templates</td></tr><tr><td>Sales</td><td>Personalized outreach, follow-ups, reply acknowledgement, discovery invite, discovery summary, proposal follow-up, graceful exit.</td></tr><tr><td>Commercial</td><td>Proposal, pricing worksheet, scope calculator, agreement, SOW by service, change order, invoice, overdue reminder.</td></tr><tr><td>Onboarding</td><td>Welcome message, onboarding form, access checklist, communication policy, kickoff agenda/deck, kickoff summary.</td></tr><tr><td>Delivery</td><td>Project plan by service, phase approval, feedback form, revision tracker, decision log, risk log, weekly update.</td></tr><tr><td>QA/Launch</td><td>QA checklist, SEO migration map, accessibility checklist, launch checklist, rollback runbook, launch confirmation.</td></tr><tr><td>Retention</td><td>1-week report, handover package, testimonial request, case-study permission, monthly service one-pager, retainer SOW.</td></tr><tr><td>Internal</td><td>Lead scorecard, qualification scorecard, proposal review, project health review, retrospective, automation incident runbook.</td></tr></table>

## AUTOMATION SAFETY RULES

- Never let AI send first-touch outreach, quote pricing, approve scope, sign legal documents or launch production without a defined human gate.

- Never pass passwords, API keys or sensitive client credentials through Claude prompts, ordinary forms or automation logs.

- Use structured outputs and validation for AI workflows; reject malformed or unsupported outputs.

- Every workflow needs idempotency / duplicate protection so retries do not send duplicate emails, create duplicate invoices or advance stages twice.

- Log every material status change and approval with timestamp, actor and source.

- Create a dead-letter / failed-run queue and one owner who checks it daily.

- Keep a manual fallback for invoicing, document generation, client approvals and launch.

- Start with assisted automation. Move to full automation only after repeated clean runs.

<div align="center">

90-DAY IMPLEMENTATION ROADMAP

</div>

<table border="1"><tr><td>Window</td><td>Build</td><td>Definition of done</td></tr><tr><td>Days1-14</td><td>CRM schema; lifecycle stages; template inventory; invoice/SOW/agreement/welcome/kickoff templates; folder convention.</td><td>A lead can move from new→signed→paid→onboarded without ad hoc documents.</td></tr><tr><td>Days15-30</td><td>Upgrade lead-gen scoring; Claude research schema; reply detection; discovery summary; proposal draft workflow.</td><td>Every prospect has evidence, score, next action and auditable research.</td></tr><tr><td>Days31-45</td><td>Client portal template; onboarding automation; missing-asset reminders; kickoff workflow.</td><td>Payment creates a usable portal and onboarding process automatically.</td></tr><tr><td>Days46-60</td><td>Project templates; approval gates; feedback intake; revision/change-order workflow.</td><td>No phase advances without approval; scope changes are commercially controlled.</td></tr><tr><td>Days61-75</td><td>Automated QA, monitoring, launch gate and post-launch reporting.</td><td>Launch requires QA+approval+payment; monitoring starts automatically.</td></tr><tr><td>Days76-90</td><td>Retainer workflow; testimonial/case-study flow; dashboard; automation failure monitoring.</td><td>Studio can measure pipeline, project health, cash, recurring revenue and failed automations.</td></tr></table>

## BUILD ORDER FOR A THREE-PERSON STUDIO

1) templates and canonical data model $ \rightarrow $ 2) lead research and CRM $ \rightarrow $ 3) proposal/contract/invoice handoffs $ \rightarrow $ 4) portal/onboarding $ \rightarrow $ 5) delivery gates and feedback $ \rightarrow $ 6) QA/launch monitoring $ \rightarrow $ 7) retention and expansion. Do not start with flashy autonomous agents. The highest ROI is eliminating dropped handoffs, duplicated admin and missing client inputs.

This V2 intentionally keeps Triadict's original commercial direction: fewer, better international clients; high-value custom web work first; systems and automation after trust is established; recurring revenue through protection and continuous improvement.