"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Calendar,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Filter,
} from "lucide-react"
import { listDeals, createDeal, updateDealStage, markDealLost, getPipelineSummary } from "@/lib/db/deals"
import { listCompanies } from "@/lib/db/companies"
import { listTeamMembers } from "@/lib/db/contacts"
import { convertDealToClient } from "@/lib/db/clients"
import { Modal } from "@/components/ui/Modal"
import { EmptyState } from "@/components/ui/EmptyState"
import { LoadingState } from "@/components/ui/LoadingState"
import { TextField } from "@/components/ui/TextField"
import { SelectField } from "@/components/ui/SelectField"
import type { Deal, CreateDealInput, ServiceCategory, TechnicalRisk, SeoRisk } from "@/types/database"

const lostReasons = [
  { value: "no_budget", label: "No Budget" },
  { value: "no_response", label: "No Response" },
  { value: "chose_competitor", label: "Chose Competitor" },
  { value: "timing", label: "Timing" },
  { value: "poor_fit", label: "Poor Fit" },
  { value: "project_cancelled", label: "Project Cancelled" },
  { value: "price", label: "Price" },
  { value: "other", label: "Other" },
]

const savedViews = [
  { id: "all", label: "All Deals", filter: "all" },
  { id: "active", label: "Active Pipeline", filter: "all", hide: ["won", "lost", "cancelled"] },
  { id: "follow_up_today", label: "Follow Up Today", filter: "all" },
  { id: "overdue", label: "Overdue Follow Ups", filter: "all" },
  { id: "research", label: "Research", filter: "researching" },
  { id: "outreach", label: "Outreach", filter: "outreach_ready" },
  { id: "discovery", label: "Discovery", filter: "discovery_scheduled" },
  { id: "proposals", label: "Proposals Outstanding", filter: "proposal_sent" },
  { id: "negotiations", label: "Negotiations", filter: "negotiation" },
  { id: "payment_pending", label: "Awaiting Payment", filter: "awaiting_initial_payment" },
  { id: "won", label: "Won", filter: "won" },
  { id: "lost", label: "Lost", filter: "lost" },
  { id: "cancelled", label: "Cancelled", filter: "cancelled" },
]

const stages = [
  { id: "lead", label: "Lead", color: "bg-mute/10", textColor: "text-mute" },
  { id: "researching", label: "Researching", color: "bg-mute/10", textColor: "text-mute" },
  { id: "outreach_ready", label: "Outreach Sent", color: "bg-inkblue/10", textColor: "text-inkblue" },
  { id: "engaged", label: "Engaged", color: "bg-inkblue/10", textColor: "text-inkblue" },
  { id: "discovery_scheduled", label: "Discovery Scheduled", color: "bg-gold/10", textColor: "text-gold" },
  { id: "discovery_completed", label: "Discovery Completed", color: "bg-gold/10", textColor: "text-gold" },
  { id: "scoping", label: "Scoping", color: "bg-coral/10", textColor: "text-coral" },
  { id: "proposal_sent", label: "Proposal Sent", color: "bg-coral/10", textColor: "text-coral" },
  { id: "negotiation", label: "Negotiation", color: "bg-coral/10", textColor: "text-coral" },
  { id: "agreement_sent", label: "Agreement Sent", color: "bg-forest/10", textColor: "text-forest" },
  { id: "awaiting_initial_payment", label: "Awaiting Payment", color: "bg-gold/10", textColor: "text-gold" },
  { id: "won_kickoff", label: "Won — Kickoff", color: "bg-forest/10", textColor: "text-forest" },
  { id: "lost", label: "Lost", color: "bg-red-500/10", textColor: "text-red-500" },
  { id: "cancelled", label: "Cancelled", color: "bg-mute/10", textColor: "text-mute" },
]

export default function DealsPage() {
  const router = useRouter()
  const [deals, setDeals] = useState<Deal[]>([])
  const [summary, setSummary] = useState<{ total: number; totalValue: number; weighted: number; avg: number; winRate: number; wonCount: number; byStage: { stage: string; count: number; value: number }[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeView, setActiveView] = useState("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [companyOptions, setCompanyOptions] = useState<{ value: string; label: string }[]>([])
  const [teamOptions, setTeamOptions] = useState<{ value: string; label: string }[]>([])
  const [dealMenuOpen, setDealMenuOpen] = useState<string | null>(null)
  const [convertDeal, setConvertDeal] = useState<Deal | null>(null)
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [showLostModal, setShowLostModal] = useState(false)
  const [lostDealId, setLostDealId] = useState<string | null>(null)
  const [lostReason, setLostReason] = useState("")
  const [lostNotes, setLostNotes] = useState("")
  const [convertData, setConvertData] = useState({
    createProject: true,
    projectName: "",
    sendOnboarding: true,
  })
  const [showLostNote, setShowLostNote] = useState(false)

  const [formData, setFormData] = useState<CreateDealInput>({
    name: "", value_cents: 0, probability: 50,
    source: "", source_detail: "", how_it_started: "", assigned_to: "", notes: "",
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    const filter = activeView === "all" ? undefined : activeView
    const filterStage = savedViews.find(v => v.id === activeView)?.filter
    const hideStages = savedViews.find(v => v.id === activeView)?.hide
    const dealsData = await listDeals({ stage: filterStage !== "all" ? filterStage : undefined, search: searchQuery })
    const summaryData = await getPipelineSummary()
    const [companies, team] = await Promise.all([
      listCompanies(),
      listTeamMembers(),
    ])
    let filtered = dealsData
    if (hideStages) {
      filtered = dealsData.filter(d => !hideStages.includes(d.stage))
    }
    setDeals(filtered)
    setSummary(summaryData)
    setCompanyOptions(companies.map(c => ({ value: c.id, label: c.name })))
    setTeamOptions(team.map(t => ({ value: t.id, label: t.full_name || t.email })))
    setLoading(false)
  }, [activeView, searchQuery])

  useEffect(() => { loadData() }, [loadData])

  const handleCreate = async () => {
    const result = await createDeal(formData)
    if ("error" in result) {
      alert(result.error)
      return
    }
    setShowCreateModal(false)
    setFormData({ name: "", value_cents: 0, probability: 50, source: "", source_detail: "", how_it_started: "", assigned_to: "", notes: "", service_category: undefined, technical_risk: undefined, seo_risk: undefined })
    loadData()
  }

  const handleStageChange = async (dealId: string, newStage: string) => {
    if (newStage === "won_kickoff") {
      const deal = deals.find(d => d.id === dealId)
      if (deal) {
        setConvertDeal(deal)
        setConvertData({ createProject: true, projectName: `${deal.name} — Website`, sendOnboarding: true })
        setShowConvertModal(true)
      }
      return
    }
    if (newStage === "lost" || newStage === "cancelled") {
      setLostDealId(dealId)
      setLostReason("")
      setLostNotes("")
      setShowLostNote(false)
      setShowLostModal(true)
      return
    }
    await updateDealStage({ id: dealId, stage: newStage as Deal["stage"] })
    setDealMenuOpen(null)
    loadData()
  }

  const handleConvertToClient = async () => {
    if (!convertDeal) return
    const result = await convertDealToClient(convertDeal.id, {
      createProject: convertData.createProject,
      projectName: convertData.projectName,
      sendOnboarding: convertData.sendOnboarding,
    })
    if ("error" in result) {
      alert(result.error)
      return
    }
    setShowConvertModal(false)
    setConvertDeal(null)
    loadData()
    router.push("/studio/clients")
  }

  const handleMarkLost = async () => {
    if (!lostDealId) return
    await markDealLost(lostDealId, lostReason, lostNotes)
    setShowLostModal(false)
    setLostDealId(null)
    setLostReason("")
    setLostNotes("")
    setDealMenuOpen(null)
    loadData()
  }

  const handleMoveToStage = async (dealId: string, newStage: string) => {
    if (newStage === "won_kickoff") {
      const deal = deals.find(d => d.id === dealId)
      if (deal) {
        setConvertDeal(deal)
        setConvertData({ createProject: true, projectName: `${deal.name} — Website`, sendOnboarding: true })
        setShowConvertModal(true)
      }
      return
    }
    if (newStage === "lost" || newStage === "cancelled") {
      setLostDealId(dealId)
      setLostReason("")
      setLostNotes("")
      setShowLostNote(false)
      setShowLostModal(true)
      return
    }
    await updateDealStage({ id: dealId, stage: newStage as Deal["stage"] })
    setDealMenuOpen(null)
    loadData()
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-forest"
    if (probability >= 50) return "text-gold"
    return "text-coral"
  }

  const filteredDeals = deals

  if (loading) return <LoadingState />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight text-ink">
            Pipeline
          </h1>
          <p className="text-mute font-sans mt-2">
            {summary?.total || 0} deals · ${((summary?.totalValue || 0) / 100).toLocaleString()} total value
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 text-sm font-sans bg-ink text-paper rounded-lg hover:bg-charcoal transition-colors"
        >
          <Plus className="w-4 h-4 mr-2 inline" />
          New Deal
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
          <input
            type="text"
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-paper border border-hairline rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        <Filter className="w-4 h-4 text-mute flex-shrink-0" />
        {savedViews.map(view => {
          const isActive = activeView === view.id
          return (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`whitespace-nowrap px-3 py-1.5 text-xs font-sans rounded-full border transition-colors ${
                isActive
                  ? "bg-ink text-paper border-ink"
                  : "bg-paper text-mute border-hairline hover:text-ink hover:border-mute"
              }`}
            >
              {view.label}
            </button>
          )
        })}
      </div>

      {filteredDeals.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No deals yet"
          description="Your sales pipeline is empty. Add your first opportunity to start tracking deals."
          actionLabel="Add Deal"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {stages.map(stage => {
              const stageDeals = filteredDeals.filter(deal => deal.stage === stage.id)
              return (
                <div key={stage.id} className="min-w-[260px]">
                  <div className={`flex items-center justify-between p-3 rounded-t-xl ${stage.color}`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-sans font-medium ${stage.textColor}`}>
                        {stage.label}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${stage.textColor} bg-white/50`}>
                        {stageDeals.length}
                      </span>
                    </div>
                  </div>
                  <div className={`p-2 space-y-2 rounded-b-xl ${stage.color}/30 min-h-[120px]`}>
                    {stageDeals.map(deal => (
                      <Link
                        key={deal.id}
                        href={`/studio/deals/${deal.id}`}
                        className="block bg-paper border border-hairline rounded-lg p-3 hover:border-coral/30 transition-colors group relative"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-sans font-medium text-ink text-sm group-hover:text-coral transition-colors">
                            {deal.name}
                          </h3>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                setDealMenuOpen(dealMenuOpen === deal.id ? null : deal.id)
                              }}
                              className="opacity-0 group-hover:opacity-100 text-mute hover:text-ink transition-all p-0.5"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {dealMenuOpen === deal.id && (
                              <div className="absolute right-0 top-full mt-1 w-44 bg-paper border border-hairline rounded-lg shadow-lg z-10 py-1 max-h-60 overflow-y-auto" onClick={(e) => e.preventDefault()}>
                                {stages.map(s => (
                                  <button
                                    key={s.id}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMoveToStage(deal.id, s.id)
                                    }}
                                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-paper2 transition-colors ${s.id === deal.stage ? "font-medium text-ink" : "text-mute"}`}
                                  >
                                    {s.id === deal.stage ? "✓ " : ""}{s.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-mute mb-1 line-clamp-1">{deal.notes?.slice(0, 60) || "—"}</p>
                        {deal.source_detail && (
                          <p className="text-[10px] text-mute/60 mb-3 truncate">{deal.source_detail}</p>
                        )}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-sans font-medium text-ink">
                            ${(deal.value_cents / 100).toLocaleString()}
                          </span>
                          <span className={`text-xs font-sans font-medium ${getProbabilityColor(deal.probability)}`}>
                            {deal.probability}%
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-mute">
                          {deal.expected_close_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(deal.expected_close_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          )}
                          {deal.workstreams && deal.workstreams.length > 0 && (
                            <span className="text-[10px] text-mute/60">{deal.workstreams.length} ws</span>
                          )}
                        </div>
                        {deal.assignee && (
                          <div className="mt-3 pt-3 border-t border-hairline">
                            <p className="text-xs text-mute truncate">{deal.assignee.full_name}</p>
                          </div>
                        )}
                      </Link>
                    ))}
                    {stageDeals.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <AlertCircle className={`w-5 h-5 ${stage.textColor} mb-1`} />
                        <p className="text-xs text-mute">Empty</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-paper border border-hairline rounded-xl p-6">
            <h2 className="font-display text-xl text-ink mb-4">Pipeline Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-paper2 rounded-lg">
                <p className="text-sm text-mute font-sans mb-1">Total Pipeline</p>
                <p className="text-2xl font-display text-ink">
                  ${((summary?.totalValue || 0) / 100).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-paper2 rounded-lg">
                <p className="text-sm text-mute font-sans mb-1">Weighted Value</p>
                <p className="text-2xl font-display text-ink">
                  ${((summary?.weighted || 0) / 100).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-paper2 rounded-lg">
                <p className="text-sm text-mute font-sans mb-1">Avg Deal Size</p>
                <p className="text-2xl font-display text-ink">
                  ${((summary?.avg || 0) / 100).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-paper2 rounded-lg">
                <p className="text-sm text-mute font-sans mb-1">Win Rate</p>
                <p className="text-2xl font-display text-ink">
                  {summary?.winRate || 0}%
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      <Modal open={showConvertModal} onClose={() => { setShowConvertModal(false); setConvertDeal(null) }} title="Convert to Client">
        {convertDeal && (
          <div className="space-y-4">
            <div className="bg-forest/10 border border-forest/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-forest">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-sans font-medium">{convertDeal.name}</span>
              </div>
              <p className="text-xs text-mute mt-1">
                ${(convertDeal.value_cents / 100).toLocaleString()} · {convertDeal.probability}% probability
              </p>
            </div>

            <p className="text-sm text-mute font-sans">
              This deal is won. Create a client record and optionally start a project.
            </p>

            <label className="flex items-center gap-3 p-3 border border-hairline rounded-lg hover:border-forest/30 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={convertData.createProject}
                onChange={(e) => setConvertData({ ...convertData, createProject: e.target.checked })}
                className="w-4 h-4 accent-forest"
              />
              <div>
                <p className="text-sm font-sans text-ink font-medium">Create project</p>
                <p className="text-xs text-mute">Automatically start a project for this client</p>
              </div>
            </label>

            {convertData.createProject && (
              <TextField
                label="Project name"
                value={convertData.projectName}
                onChange={(v) => setConvertData({ ...convertData, projectName: v })}
                placeholder="e.g. Acme Co — Website"
              />
            )}

            <label className="flex items-center gap-3 p-3 border border-hairline rounded-lg hover:border-forest/30 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={convertData.sendOnboarding}
                onChange={(e) => setConvertData({ ...convertData, sendOnboarding: e.target.checked })}
                className="w-4 h-4 accent-forest"
              />
              <div>
                <p className="text-sm font-sans text-ink font-medium">Send onboarding email</p>
                <p className="text-xs text-mute">Trigger onboarding sequence for the new client</p>
              </div>
            </label>

            <div className="flex justify-end gap-3 pt-2 border-t border-hairline">
              <button
                onClick={() => { setShowConvertModal(false); setConvertDeal(null) }}
                className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConvertToClient}
                className="px-4 py-2 text-sm bg-forest text-white rounded-lg hover:bg-forest/90 transition-colors"
              >
                Convert to Client
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showLostModal} onClose={() => { setShowLostModal(false); setLostDealId(null) }} title="Mark Deal Lost">
        <div className="space-y-4">
          <p className="text-sm text-mute font-sans">
            Why did this deal fall through? This helps us understand our pipeline gaps.
          </p>
          <SelectField
            label="Lost Reason"
            value={lostReason}
            onChange={(v) => { setLostReason(v); if (v === "other") setShowLostNote(true) }}
            options={lostReasons}
            placeholder="Select a reason"
          />
          {lostReason === "other" && (
            <TextField
              label="Notes"
              value={lostNotes}
              onChange={(v) => setLostNotes(v)}
              multiline
              placeholder="What happened?"
            />
          )}
          <div className="flex justify-end gap-3 pt-2 border-t border-hairline">
            <button
              onClick={() => { setShowLostModal(false); setLostDealId(null) }}
              className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleMarkLost}
              disabled={!lostReason}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              Mark Lost
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Deal">
        <div className="space-y-4">
          <TextField label="Deal Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} required />
          <SelectField
            label="Company"
            value={formData.company_id || ""}
            onChange={(v) => setFormData({ ...formData, company_id: v })}
            options={companyOptions}
            placeholder="Select company (optional)"
          />
          <div>
            <label className="block text-sm font-medium mb-1.5">Value (cents) <span className="text-coral">*</span></label>
            <input
              type="number"
              value={formData.value_cents}
              onChange={(e) => setFormData({ ...formData, value_cents: parseInt(e.target.value) || 0 })}
              className="w-full h-10 px-3 bg-paper border border-hairline rounded-lg text-sm focus:outline-none focus:border-coral transition-colors"
            />
            <p className="text-xs text-mute mt-1">${(formData.value_cents / 100).toFixed(2)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Probability (%) <span className="text-coral">*</span></label>
            <input
              type="number"
              min={0} max={100}
              value={formData.probability}
              onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })}
              className="w-full h-10 px-3 bg-paper border border-hairline rounded-lg text-sm focus:outline-none focus:border-coral transition-colors"
            />
          </div>
          <TextField label="Source" value={formData.source || ""} onChange={(v) => setFormData({ ...formData, source: v })} placeholder="e.g. Cold email, Referral, Upwork" />
          <TextField label="Source Detail" value={formData.source_detail || ""} onChange={(v) => setFormData({ ...formData, source_detail: v })} placeholder="e.g. Deep Research + Custom Demo" />
          <div>
            <label className="block text-sm font-medium mb-1.5">Service Category</label>
            <select
              value={formData.service_category || ""}
              onChange={(e) => setFormData({ ...formData, service_category: e.target.value as ServiceCategory || undefined })}
              className="w-full h-10 px-3 bg-paper border border-hairline rounded-lg text-sm focus:outline-none focus:border-coral transition-colors"
            >
              <option value="">Select category (optional)</option>
              <option value="websites">Websites</option>
              <option value="monthly_optimization">Monthly Optimization</option>
              <option value="ai_agents">AI Agents</option>
              <option value="ai_email">AI Email</option>
              <option value="lead_response">Lead Response</option>
              <option value="crm_automation">CRM Automation</option>
              <option value="whatsapp_sms">WhatsApp/SMS</option>
              <option value="appointment_systems">Appointment Systems</option>
              <option value="ai_knowledge">AI Knowledge</option>
              <option value="custom_dashboards">Custom Dashboards</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Technical Risk</label>
            <select
              value={formData.technical_risk || ""}
              onChange={(e) => setFormData({ ...formData, technical_risk: e.target.value as TechnicalRisk || undefined })}
              className="w-full h-10 px-3 bg-paper border border-hairline rounded-lg text-sm focus:outline-none focus:border-coral transition-colors"
            >
              <option value="">Select risk (optional)</option>
              <option value="clean_slate">Clean Slate</option>
              <option value="mild_legacy">Mild Legacy</option>
              <option value="deep_legacy">Deep Legacy</option>
              <option value="cms_only">CMS Only</option>
              <option value="platform_lock">Platform Lock</option>
              <option value="migration_required">Migration Required</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">SEO Risk</label>
            <select
              value={formData.seo_risk || ""}
              onChange={(e) => setFormData({ ...formData, seo_risk: e.target.value as SeoRisk || undefined })}
              className="w-full h-10 px-3 bg-paper border border-hairline rounded-lg text-sm focus:outline-none focus:border-coral transition-colors"
            >
              <option value="">Select risk (optional)</option>
              <option value="greenfield">Greenfield</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="very_high">Very High</option>
              <option value="rebuild_with_migration">Rebuild with Migration</option>
            </select>
          </div>
          <TextField label="How It Started" value={formData.how_it_started || ""} onChange={(v) => setFormData({ ...formData, how_it_started: v })} multiline placeholder="Brief story of how this opportunity began" />
          <SelectField
            label="Assigned To"
            value={formData.assigned_to || ""}
            onChange={(v) => setFormData({ ...formData, assigned_to: v })}
            options={teamOptions}
            placeholder="Select team member"
          />
          <TextField label="Notes" value={formData.notes || ""} onChange={(v) => setFormData({ ...formData, notes: v })} multiline />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={!formData.name} className="px-4 py-2 text-sm bg-ink text-paper rounded-lg hover:bg-charcoal transition-colors disabled:opacity-50">
              Create Deal
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
