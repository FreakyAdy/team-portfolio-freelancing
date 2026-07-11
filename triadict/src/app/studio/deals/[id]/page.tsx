"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Building2, Target, MessageSquare, Search, BookOpen,
  Activity, MoreHorizontal, Calendar, DollarSign, Clock, AlertCircle,
  CheckCircle2, XCircle, User, TrendingUp, Edit3, Save, X,
  Plus, ChevronDown, FileText, Layers, HelpCircle, Lightbulb, Eye
} from "lucide-react"
import { getDeal, updateDeal, updateDealStage, getDealEvents, markDealWon, markDealLost, deleteDeal, listWorkstreams, createWorkstream, updateWorkstream, deleteWorkstream } from "@/lib/db/deals"
import { listTeamMembers } from "@/lib/db/contacts"
import { Modal } from "@/components/ui/Modal"
import { LoadingState } from "@/components/ui/LoadingState"
import { TextField } from "@/components/ui/TextField"
import { SelectField } from "@/components/ui/SelectField"
import type { Deal, UpdateDealInput, Workstream, ServiceCategory, TechnicalRisk, SeoRisk } from "@/types/database"

const tabs = [
  { id: "overview", label: "Overview", icon: Building2 },
  { id: "research", label: "Research", icon: Lightbulb },
  { id: "workstreams", label: "Workstreams", icon: Layers },
  { id: "opportunity", label: "Problem & Opportunity", icon: Target },
  { id: "communication", label: "Communication", icon: MessageSquare },
  { id: "discovery", label: "Discovery", icon: Search },
  { id: "scoping", label: "Scoping", icon: BookOpen },
  { id: "activity", label: "Activity", icon: Activity },
]

const stages = [
  { id: "lead", label: "Lead" },
  { id: "researching", label: "Researching" },
  { id: "outreach_ready", label: "Outreach Sent" },
  { id: "engaged", label: "Engaged" },
  { id: "discovery_scheduled", label: "Discovery Scheduled" },
  { id: "discovery_completed", label: "Discovery Completed" },
  { id: "scoping", label: "Scoping" },
  { id: "proposal_sent", label: "Proposal Sent" },
  { id: "negotiation", label: "Negotiation" },
  { id: "agreement_sent", label: "Agreement Sent" },
  { id: "awaiting_initial_payment", label: "Awaiting Payment" },
  { id: "won_kickoff", label: "Won — Kickoff" },
  { id: "lost", label: "Lost" },
  { id: "cancelled", label: "Cancelled" },
]
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

export default function DealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dealId = params.id as string

  const [deal, setDeal] = useState<Deal | null>(null)
  const [workstreams, setWorkstreams] = useState<Workstream[]>([])
  const [events, setEvents] = useState<{ name: string; payload: Record<string, unknown>; created_at: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [showStageMenu, setShowStageMenu] = useState(false)
  const [showLostModal, setShowLostModal] = useState(false)
  const [showWonModal, setShowWonModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editField, setEditField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [lostReason, setLostReason] = useState("no_budget")
  const [lostNotes, setLostNotes] = useState("")
  const [teamOptions, setTeamOptions] = useState<{ value: string; label: string }[]>([])
  const [showWorkstreamModal, setShowWorkstreamModal] = useState(false)
  const [editWorkstream, setEditWorkstream] = useState<Workstream | null>(null)
  const [wsForm, setWsForm] = useState({ label: "", description: "", creative_freedom: "", seo_sensitivity: "" })

  const loadData = useCallback(async () => {
    setLoading(true)
    const [d, ws, ev, team] = await Promise.all([
      getDeal(dealId),
      listWorkstreams(dealId),
      getDealEvents(dealId),
      listTeamMembers(),
    ])
    setDeal(d)
    setWorkstreams(ws)
    setEvents(ev)
    setTeamOptions(team.map(t => ({ value: t.id, label: t.full_name || t.email })))
    setLoading(false)
  }, [dealId])

  useEffect(() => { loadData() }, [loadData])

  const handleStageChange = async (newStage: string) => {
    await updateDealStage({ id: dealId, stage: newStage as Deal["stage"] })
    setShowStageMenu(false)
    loadData()
  }

  const handleMarkWon = async () => {
    await markDealWon(dealId)
    setShowWonModal(false)
    loadData()
  }

  const handleMarkLost = async () => {
    await markDealLost(dealId, lostReason, lostNotes)
    setShowLostModal(false)
    loadData()
  }

  const handleDelete = async () => {
    await deleteDeal(dealId)
    router.push("/studio/deals")
  }

  const handleCreateWorkstream = async () => {
    if (!wsForm.label) return
    const result = await createWorkstream({ deal_id: dealId, ...wsForm })
    if ("error" in result) { alert(result.error); return }
    setShowWorkstreamModal(false)
    setWsForm({ label: "", description: "", creative_freedom: "", seo_sensitivity: "" })
    loadData()
  }

  const handleUpdateWorkstream = async () => {
    if (!editWorkstream || !wsForm.label) return
    const result = await updateWorkstream({ id: editWorkstream.id, ...wsForm })
    if (result.error) { alert(result.error); return }
    setEditWorkstream(null)
    setWsForm({ label: "", description: "", creative_freedom: "", seo_sensitivity: "" })
    loadData()
  }

  const handleDeleteWorkstream = async (id: string) => {
    const result = await deleteWorkstream(id)
    if (result.error) { alert(result.error); return }
    loadData()
  }

  const handleSaveField = async (field: string, value: unknown) => {
    await updateDeal(dealId, { [field]: value })
    setEditField(null)
    loadData()
  }

  const startEdit = (field: string, currentValue: string | null) => {
    setEditField(field)
    setEditValue(currentValue || "")
  }

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      lead: "bg-mute/10 text-mute",
      researching: "bg-mute/10 text-mute",
      outreach_ready: "bg-inkblue/10 text-inkblue",
      engaged: "bg-inkblue/10 text-inkblue",
      discovery_scheduled: "bg-gold/10 text-gold",
      discovery_completed: "bg-gold/10 text-gold",
      scoping: "bg-coral/10 text-coral",
      proposal_sent: "bg-coral/10 text-coral",
      negotiation: "bg-coral/10 text-coral",
      agreement_sent: "bg-forest/10 text-forest",
      awaiting_initial_payment: "bg-gold/10 text-gold",
      won_kickoff: "bg-forest/10 text-forest",
      won: "bg-forest/10 text-forest",
      lost: "bg-red-500/10 text-red-500",
      cancelled: "bg-mute/10 text-mute",
    }
    return colors[stage] || "bg-mute/10 text-mute"
  }

  if (loading) return <LoadingState />
  if (!deal) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <AlertCircle className="w-12 h-12 text-mute mx-auto mb-4" />
        <h2 className="font-display text-xl text-ink mb-2">Deal not found</h2>
        <p className="text-mute text-sm mb-6">This deal doesn't exist or has been deleted.</p>
        <Link href="/studio/deals" className="text-sm text-coral hover:text-coral/80">Back to Pipeline</Link>
      </div>
    )
  }

  const currentStageIndex = stages.findIndex(s => s.id === deal.stage)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-mute">
        <Link href="/studio/deals" className="hover:text-ink transition-colors">Pipeline</Link>
        <span>/</span>
        <span className="text-ink font-medium truncate">{deal.name}</span>
      </div>

      {/* Header */}
      <div className="bg-paper border border-hairline rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Link href="/studio/deals" className="p-2 text-mute hover:text-ink hover:bg-paper2 rounded-lg transition-colors mt-1">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-display text-3xl tracking-tight text-ink">{deal.name}</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${getStageColor(deal.stage)}`}>
                  {stages.find(s => s.id === deal.stage)?.label || deal.stage}
                </span>
              </div>
              <p className="text-mute text-sm flex items-center gap-2">
                {deal.company_name && <span>{deal.company_name}</span>}
                {deal.company_name && deal.value_cents > 0 && <span>·</span>}
                {deal.value_cents > 0 && <span>${(deal.value_cents / 100).toLocaleString()}</span>}
                {deal.value_cents > 0 && deal.probability && <span>·</span>}
                {deal.probability ? <span>{deal.probability}%</span> : null}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowStageMenu(!showStageMenu)}
                className="px-3 py-1.5 text-sm border border-hairline rounded-lg hover:bg-paper2 transition-colors flex items-center gap-1"
              >
                Change Stage <ChevronDown className="w-3 h-3" />
              </button>
              {showStageMenu && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-paper border border-hairline rounded-lg shadow-lg z-10 py-1 max-h-64 overflow-y-auto">
                  {stages.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleStageChange(s.id)}
                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-paper2 transition-colors ${s.id === deal.stage ? "font-medium text-ink" : "text-mute"}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {deal.stage !== "won" && deal.stage !== "lost" && (
              <>
                <button onClick={() => setShowWonModal(true)} className="px-3 py-1.5 text-sm bg-forest text-white rounded-lg hover:bg-forest/90 transition-colors flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Won
                </button>
                <button onClick={() => setShowLostModal(true)} className="px-3 py-1.5 text-sm border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500/5 transition-colors flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Lost
                </button>
              </>
            )}
            <div className="relative group">
              <button className="p-2 text-mute hover:text-ink hover:bg-paper2 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-40 bg-paper border border-hairline rounded-lg shadow-lg z-10 py-1 hidden group-hover:block">
                <button onClick={() => setShowDeleteModal(true)} className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-paper2 transition-colors">
                  Delete Deal
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stage progress */}
        <div className="mt-6 flex items-center gap-1">
          {stages.filter(s => !["won_kickoff", "won", "lost", "cancelled"].includes(s.id)).map((stage, idx) => (
            <div key={stage.id} className="flex-1">
              <div className={`h-1.5 rounded-full ${idx < currentStageIndex ? "bg-forest" : idx === currentStageIndex ? "bg-coral" : "bg-hairline"}`} />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-mute font-mono uppercase tracking-wider">Lead</span>
          <span className="text-[10px] text-mute font-mono uppercase tracking-wider">Awaiting Payment</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-hairline overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-sans border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-coral text-ink font-medium"
                : "border-transparent text-mute hover:text-ink hover:border-hairline"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="bg-paper border border-hairline rounded-xl p-6">
              <h2 className="font-display text-lg tracking-tight text-ink mb-4">Basic Information</h2>
              <div className="space-y-4">
                <InfoRow label="Deal Name" value={deal.name} />
                <InfoRow label="Company" value={deal.company_name || "—"} />
                <InfoRow label="Website" value={deal.website || "—"} />
                <InfoRow label="Industry" value={deal.industry || "—"} />
                <InfoRow label="Country" value={deal.country || "—"} />
                <InfoRow label="Timezone" value={deal.timezone || "—"} />
                <InfoRow label="Service Category" value={deal.service_category?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "—"} />
                <InfoRow label="Technical Risk" value={deal.technical_risk?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "—"} />
                <InfoRow label="SEO Risk" value={deal.seo_risk?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "—"} />
                <InfoRow label="Lead Source" value={deal.lead_source || deal.source || "—"} />
              </div>
            </div>

            {/* Commercial Info */}
            <div className="bg-paper border border-hairline rounded-xl p-6">
              <h2 className="font-display text-lg tracking-tight text-ink mb-4">Commercial</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-hairline">
                  <span className="text-sm text-mute">Estimated Value</span>
                  <EditableField
                    field="value_cents"
                    display={`$${(deal.value_cents / 100).toLocaleString()}`}
                    editField={editField}
                    editValue={editValue}
                    onStart={() => startEdit("value_cents", String(deal.value_cents))}
                    onSave={() => handleSaveField("value_cents", parseInt(editValue) || 0)}
                    onCancel={() => setEditField(null)}
                    onEditChange={setEditValue}
                    type="number"
                  />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-hairline">
                  <span className="text-sm text-mute">Probability</span>
                  <EditableField
                    field="probability"
                    display={`${deal.probability}%`}
                    editField={editField}
                    editValue={editValue}
                    onStart={() => startEdit("probability", String(deal.probability))}
                    onSave={() => handleSaveField("probability", parseInt(editValue) || 0)}
                    onCancel={() => setEditField(null)}
                    onEditChange={setEditValue}
                    type="number"
                  />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-hairline">
                  <span className="text-sm text-mute">Weighted Value</span>
                  <span className="text-sm font-medium text-ink">${((deal.value_cents * deal.probability / 100) / 100).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-hairline">
                  <span className="text-sm text-mute">Expected Close</span>
                  <EditableField
                    field="expected_close_date"
                    display={deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                    editField={editField}
                    editValue={editValue}
                    onStart={() => startEdit("expected_close_date", deal.expected_close_date || "")}
                    onSave={() => handleSaveField("expected_close_date", editValue || null)}
                    onCancel={() => setEditField(null)}
                    onEditChange={setEditValue}
                    type="date"
                  />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-hairline">
                  <span className="text-sm text-mute">Currency</span>
                  <span className="text-sm font-medium text-ink">{deal.currency || "USD"}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-mute">Owner</span>
                  <span className="text-sm font-medium text-ink flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-mute" />
                    {deal.assignee?.full_name || "Unassigned"}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-paper border border-hairline rounded-xl p-6">
              <h2 className="font-display text-lg tracking-tight text-ink mb-4">Contact</h2>
              <div className="space-y-4">
                <InfoRow label="Contact Email" value={deal.contact_email || "—"} />
                <InfoRow label="Contact Phone" value={deal.contact_phone || "—"} />
                <InfoRow label="Source" value={deal.source || "—"} />
                <InfoRow label="Next Action" value={deal.next_action || "—"} />
                <InfoRow label="Next Action Date" value={deal.next_action_at ? new Date(deal.next_action_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "—"} />
                <InfoRow label="Last Contact" value={deal.last_contact_at ? new Date(deal.last_contact_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "—"} />
              </div>
            </div>

            {/* Qualification */}
            <div className="bg-paper border border-hairline rounded-xl p-6">
              <h2 className="font-display text-lg tracking-tight text-ink mb-4">Qualification</h2>
              {deal.business_value || deal.buying_power || deal.problem_severity || deal.urgency || deal.fit_score || deal.opportunity_score ? (
                <div className="space-y-4">
                  {deal.business_value != null && <ScoreRow label="Business Value" score={deal.business_value} />}
                  {deal.buying_power != null && <ScoreRow label="Buying Power" score={deal.buying_power} />}
                  {deal.problem_severity != null && <ScoreRow label="Problem Severity" score={deal.problem_severity} />}
                  {deal.urgency != null && <ScoreRow label="Urgency" score={deal.urgency} />}
                  {deal.fit_score != null && <ScoreRow label="Fit" score={deal.fit_score} />}
                  {deal.opportunity_score != null && (
                    <div className="pt-2 border-t border-hairline">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-ink">Overall Score</span>
                        <span className={`text-lg font-display ${
                          deal.opportunity_score >= 4 ? "text-forest" : deal.opportunity_score >= 2.5 ? "text-gold" : "text-coral"
                        }`}>
                          {deal.opportunity_score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-mute">No qualification data yet.</p>
              )}
            </div>

            {/* Payment Gate Checklist */}
            <div className="bg-paper border border-hairline rounded-xl p-6">
              <h2 className="font-display text-lg tracking-tight text-ink mb-4">Payment Gate</h2>
              {deal.payment_gate_status ? (
                <div className="space-y-3">
                  {[
                    { key: "scope_agreed", label: "Scope Agreed", ts: deal.payment_gate_status.scope_agreed_at },
                    { key: "agreement_signed", label: "Agreement Signed", ts: deal.payment_gate_status.agreement_signed_at },
                    { key: "sow_approved", label: "SOW Approved", ts: deal.payment_gate_status.sow_approved_at },
                    { key: "initial_payment_received", label: "Initial Payment Received", ts: deal.payment_gate_status.initial_payment_received_at },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-2 border-b border-hairline last:border-0">
                      <div className="flex items-center gap-2">
                        {item.ts ? (
                          <CheckCircle2 className="w-4 h-4 text-forest" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-hairline" />
                        )}
                        <span className={`text-sm ${item.ts ? "text-ink font-medium" : "text-mute"}`}>{item.label}</span>
                      </div>
                      {item.ts && (
                        <span className="text-xs text-mute">
                          {new Date(item.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-mute">No payment gate data yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "research" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-paper border border-hairline rounded-xl p-6">
              <h2 className="font-display text-lg tracking-tight text-ink mb-4">How It Started</h2>
              <TextAreaField label="Origin story" value={deal.how_it_started} field="how_it_started" onSave={handleSaveField} />
              <div className="mt-4 space-y-4">
                <InfoRow label="Source" value={deal.source || "—"} />
                <InfoRow label="Source Detail" value={deal.source_detail || "—"} />
                <InfoRow label="Lead Source" value={deal.lead_source || "—"} />
              </div>
            </div>
            <div className="bg-paper border border-hairline rounded-xl p-6">
              <h2 className="font-display text-lg tracking-tight text-ink mb-4">Relationship Context</h2>
              <TextAreaField label="Relationship history" value={deal.relationship_context} field="relationship_context" onSave={handleSaveField} />
              <div className="mt-4">
                <InfoRow label="Client Technical Sophistication" value={deal.client_technical_sophistication || "—"} />
              </div>
            </div>
          </div>
          <div className="bg-paper border border-hairline rounded-xl p-6">
            <h2 className="font-display text-lg tracking-tight text-ink mb-4">Research Notes</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TextAreaField label="Personalization angle" value={deal.personalization_angle} field="personalization_angle" onSave={handleSaveField} />
              <TextAreaField label="Business context" value={deal.business_description} field="business_description" onSave={handleSaveField} />
              <TextAreaField label="Current situation" value={deal.current_situation} field="current_situation" onSave={handleSaveField} />
              <TextAreaField label="Known concerns" value={deal.known_concerns} field="known_concerns" onSave={handleSaveField} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "workstreams" && (
        <div className="space-y-6">
          <div className="bg-paper border border-hairline rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg tracking-tight text-ink">Workstreams</h2>
              <button onClick={() => { setWsForm({ label: "", description: "", creative_freedom: "", seo_sensitivity: "" }); setShowWorkstreamModal(true) }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-ink text-paper rounded-lg hover:bg-ink/90 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Workstream
              </button>
            </div>
            {workstreams.length === 0 ? (
              <p className="text-sm text-mute text-center py-8">No workstreams defined yet. Add potential project scopes within this deal.</p>
            ) : (
              <div className="space-y-4">
                {workstreams.map((ws) => (
                  <div key={ws.id} className="border border-hairline rounded-xl p-5 hover:border-coral/30 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-coral/10 flex items-center justify-center">
                          <Layers className="w-4 h-4 text-coral" />
                        </div>
                        <div>
                          <h3 className="font-medium text-ink">{ws.label}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            ws.status === "agreed" ? "bg-forest/10 text-forest" :
                            ws.status === "priced" || ws.status === "ready_to_price" ? "bg-coral/10 text-coral" :
                            ws.status === "scoped" ? "bg-inkblue/10 text-inkblue" :
                            ws.status === "discovering" ? "bg-gold/10 text-gold" :
                            "bg-mute/10 text-mute"
                          }`}>
                            {ws.status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditWorkstream(ws); setWsForm({ label: ws.label, description: ws.description || "", creative_freedom: ws.creative_freedom || "", seo_sensitivity: ws.seo_sensitivity || "" }) }} className="p-1.5 text-mute hover:text-ink hover:bg-paper2 rounded-lg transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteWorkstream(ws.id)} className="p-1.5 text-mute hover:text-coral hover:bg-coral/5 rounded-lg transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {ws.description && <p className="text-sm text-mute mb-3">{ws.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-mute">
                      {ws.creative_freedom && <span>Creative freedom: <strong className="text-ink">{ws.creative_freedom}</strong></span>}
                      {ws.seo_sensitivity && <span>SEO sensitivity: <strong className="text-ink">{ws.seo_sensitivity}</strong></span>}
                      {ws.estimated_price_cents != null && <span>Est: <strong className="text-ink">${(ws.estimated_price_cents / 100).toLocaleString()}</strong></span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "opportunity" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-paper border border-hairline rounded-xl p-6">
            <h2 className="font-display text-lg tracking-tight text-ink mb-4">Business Context</h2>
            <div className="space-y-4">
              <TextAreaField label="What they do" value={deal.business_description} field="business_description" onSave={handleSaveField} />
              <TextAreaField label="Current situation" value={deal.current_situation} field="current_situation" onSave={handleSaveField} />
              <TextAreaField label="Strongest problem" value={deal.strongest_problem} field="strongest_problem" onSave={handleSaveField} />
              <TextAreaField label="Why it matters" value={deal.problem_evidence} field="problem_evidence" onSave={handleSaveField} />
            </div>
          </div>
          <div className="bg-paper border border-hairline rounded-xl p-6">
            <h2 className="font-display text-lg tracking-tight text-ink mb-4">Opportunity</h2>
            <div className="space-y-4">
              <TextAreaField label="Commercial opportunity" value={deal.commercial_opportunity} field="commercial_opportunity" onSave={handleSaveField} />
              <TextAreaField label="Personalization angle" value={deal.personalization_angle} field="personalization_angle" onSave={handleSaveField} />
              <TextAreaField label="Recommended service" value={deal.recommended_service} field="recommended_service" onSave={handleSaveField} />
              <TextAreaField label="Trigger event" value={deal.trigger_event} field="trigger_event" onSave={handleSaveField} />
              <TextAreaField label="Known concerns" value={deal.known_concerns} field="known_concerns" onSave={handleSaveField} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "communication" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-paper border border-hairline rounded-xl p-6">
            <h2 className="font-display text-lg tracking-tight text-ink mb-4">Next Actions</h2>
            <div className="space-y-4">
              <TextAreaField label="Next action" value={deal.next_action} field="next_action" onSave={handleSaveField} />
              <div className="flex items-center justify-between py-2 border-b border-hairline">
                <span className="text-sm text-mute">Next action date</span>
                <EditableField
                  field="next_action_at"
                  display={deal.next_action_at ? new Date(deal.next_action_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                  editField={editField}
                  editValue={editValue}
                  onStart={() => startEdit("next_action_at", deal.next_action_at || "")}
                  onSave={() => handleSaveField("next_action_at", editValue || null)}
                  onCancel={() => setEditField(null)}
                  onEditChange={setEditValue}
                  type="date"
                />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-hairline">
                <span className="text-sm text-mute">Last contact</span>
                <EditableField
                  field="last_contact_at"
                  display={deal.last_contact_at ? new Date(deal.last_contact_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "—"}
                  editField={editField}
                  editValue={editValue}
                  onStart={() => startEdit("last_contact_at", deal.last_contact_at || "")}
                  onSave={() => handleSaveField("last_contact_at", editValue || null)}
                  onCancel={() => setEditField(null)}
                  onEditChange={setEditValue}
                  type="date"
                />
              </div>
            </div>
          </div>
          <div className="bg-paper border border-hairline rounded-xl p-6">
            <h2 className="font-display text-lg tracking-tight text-ink mb-4">Communication Notes</h2>
            <TextAreaField label="Notes" value={deal.notes} field="notes" onSave={handleSaveField} />
          </div>
        </div>
      )}

      {activeTab === "discovery" && (
        <div className="space-y-6">
          <div className="bg-paper border border-hairline rounded-xl p-6">
            <h2 className="font-display text-lg tracking-tight text-ink mb-4">Discovery Status</h2>
            <div className="flex items-center gap-3 mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                deal.discovery_status === "complete" ? "bg-forest/10 text-forest" :
                deal.discovery_status === "in_progress" ? "bg-gold/10 text-gold" :
                deal.discovery_status === "scheduled" ? "bg-inkblue/10 text-inkblue" :
                "bg-mute/10 text-mute"
              }`}>
                {deal.discovery_status?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "Not Started"}
              </span>
              {deal.discovery_date && (
                <span className="text-xs text-mute">Held: {new Date(deal.discovery_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <TextAreaField label="Business objective" value={deal.business_objective} field="business_objective" onSave={handleSaveField} />
                <TextAreaField label="Why now" value={deal.why_now} field="why_now" onSave={handleSaveField} />
                <TextAreaField label="Current problem" value={deal.current_problem} field="current_problem" onSave={handleSaveField} />
                <TextAreaField label="Desired outcome" value={deal.desired_outcome} field="desired_outcome" onSave={handleSaveField} />
                <TextAreaField label="Success criteria" value={deal.success_criteria} field="success_criteria" onSave={handleSaveField} />
              </div>
              <div className="space-y-4">
                <TextAreaField label="Technical constraints" value={deal.technical_constraints} field="technical_constraints" onSave={handleSaveField} />
                <TextAreaField label="SEO risks" value={deal.seo_risks} field="seo_risks" onSave={handleSaveField} />
                <TextAreaField label="Client timeline" value={deal.client_timeline} field="client_timeline" onSave={handleSaveField} />
                <TextAreaField label="Commercial expectations" value={deal.commercial_expectations} field="commercial_expectations" onSave={handleSaveField} />
                <TextAreaField label="Unknowns" value={deal.unknowns} field="unknowns" onSave={handleSaveField} />
              </div>
            </div>
          </div>

          {/* Discovery Decision Brief */}
          <div className="bg-paper border border-hairline rounded-xl p-6">
            <h2 className="font-display text-lg tracking-tight text-ink mb-4">Discovery Decision Brief</h2>
            <div className="space-y-4">
              <TextAreaField label="Decision brief" value={deal.discovery_decision_brief} field="discovery_decision_brief" onSave={handleSaveField} />
              <div className="flex items-center justify-between py-2 border-b border-hairline">
                <span className="text-sm text-mute">Recommended next step</span>
                <span className="text-sm font-medium text-ink">
                  {deal.discovery_next_step?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-paper border border-hairline rounded-xl p-6">
            <h2 className="font-display text-lg tracking-tight text-ink mb-4">Discovery Notes</h2>
            <TextAreaField label="Notes" value={deal.discovery_notes} field="discovery_notes" onSave={handleSaveField} />
          </div>
        </div>
      )}

      {activeTab === "scoping" && (
        <div className="space-y-6">
          <div className="bg-paper border border-hairline rounded-xl p-6">
            <h2 className="font-display text-lg tracking-tight text-ink mb-4">Scope</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <TextAreaField label="Proposed deliverables" value={deal.proposed_deliverables} field="proposed_deliverables" onSave={handleSaveField} />
                <TextAreaField label="In scope" value={deal.in_scope} field="in_scope" onSave={handleSaveField} />
                <TextAreaField label="Out of scope" value={deal.out_of_scope} field="out_of_scope" onSave={handleSaveField} />
              </div>
              <div className="space-y-4">
                <TextAreaField label="Assumptions" value={deal.assumptions} field="assumptions" onSave={handleSaveField} />
                <TextAreaField label="Client dependencies" value={deal.client_dependencies} field="client_dependencies" onSave={handleSaveField} />
                <TextAreaField label="Technical unknowns" value={deal.technical_unknowns} field="technical_unknowns" onSave={handleSaveField} />
                <TextAreaField label="Technical risks" value={deal.technical_risks} field="technical_risks" onSave={handleSaveField} />
                <TextAreaField label="SEO / Migration risks" value={deal.seo_migration_risks} field="seo_migration_risks" onSave={handleSaveField} />
              </div>
            </div>
          </div>

          <div className="bg-paper border border-hairline rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-display text-lg tracking-tight text-ink">Internal Pricing</h2>
              <span className="text-[10px] font-mono uppercase tracking-wider bg-coral/10 text-coral px-2 py-0.5 rounded">Internal Only</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-hairline">
                  <span className="text-sm text-mute">Complexity</span>
                  <span className="text-sm font-medium text-ink">
                    {deal.estimated_complexity ? deal.estimated_complexity.charAt(0).toUpperCase() + deal.estimated_complexity.slice(1) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-hairline">
                  <span className="text-sm text-mute">Est. internal effort</span>
                  <span className="text-sm font-medium text-ink">
                    {deal.estimated_internal_effort_hours ? `${deal.estimated_internal_effort_hours}h` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-hairline">
                  <span className="text-sm text-mute">Contingency</span>
                  <span className="text-sm font-medium text-ink">
                    {deal.contingency_percentage ? `${deal.contingency_percentage}%` : "—"}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-hairline">
                  <span className="text-sm text-mute flex items-center gap-1">
                    Internal estimate <span className="text-[10px] font-mono text-coral">(not quoted)</span>
                  </span>
                  <span className="text-sm font-medium text-ink">
                    {deal.internal_estimate_cents != null ? `$${(deal.internal_estimate_cents / 100).toLocaleString()}` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-hairline">
                  <span className="text-sm text-mute flex items-center gap-1">
                    Min acceptable price <span className="text-[10px] font-mono text-mute">(floor)</span>
                  </span>
                  <span className="text-sm font-medium text-ink">
                    {deal.minimum_acceptable_price_cents != null ? `$${(deal.minimum_acceptable_price_cents / 100).toLocaleString()}` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-hairline">
                  <span className="text-sm text-mute flex items-center gap-1">
                    Recommended price <span className="text-[10px] font-mono text-mute">(target)</span>
                  </span>
                  <span className="text-sm font-medium text-ink">
                    {deal.recommended_price_cents != null ? `$${(deal.recommended_price_cents / 100).toLocaleString()}` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-hairline">
                  <span className="text-sm text-mute flex items-center gap-1">
                    Proposed price <span className="text-[10px] font-mono text-mute">(to client)</span>
                  </span>
                  <span className="text-sm font-medium text-ink">
                    {deal.proposed_price_cents != null ? `$${(deal.proposed_price_cents / 100).toLocaleString()}` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-hairline">
                  <span className="text-sm text-mute flex items-center gap-1">
                    Agreed price <span className="text-[10px] font-mono text-mute">(signed)</span>
                  </span>
                  <span className="text-sm font-medium text-ink">
                    {deal.agreed_price_cents != null ? `$${(deal.agreed_price_cents / 100).toLocaleString()}` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-mute">Payment structure</span>
                  <span className="text-sm font-medium text-ink">{deal.payment_structure || "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="bg-paper border border-hairline rounded-xl p-6">
          <h2 className="font-display text-lg tracking-tight text-ink mb-4">Activity Timeline</h2>
          {events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event, i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b border-hairline last:border-0">
                  <div className="w-2 h-2 rounded-full bg-coral/50 mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-ink font-medium">
                      {event.name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-xs text-mute">
                      {new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-mute text-center py-8">No activity recorded yet.</p>
          )}
        </div>
      )}

      {/* Workstream Modal */}
      <Modal open={showWorkstreamModal || !!editWorkstream} onClose={() => { setShowWorkstreamModal(false); setEditWorkstream(null) }} title={editWorkstream ? "Edit Workstream" : "Add Workstream"}>
        <div className="space-y-4">
          <TextField label="Label" value={wsForm.label} onChange={(v) => setWsForm({ ...wsForm, label: v })} required placeholder="e.g. Site A — Higher Creative Freedom" />
          <TextField label="Description" value={wsForm.description} onChange={(v) => setWsForm({ ...wsForm, description: v })} multiline placeholder="Brief description of this workstream's scope" />
          <TextField label="Creative Freedom" value={wsForm.creative_freedom} onChange={(v) => setWsForm({ ...wsForm, creative_freedom: v })} placeholder="Relatively High / More Limited" />
          <TextField label="SEO Sensitivity" value={wsForm.seo_sensitivity} onChange={(v) => setWsForm({ ...wsForm, seo_sensitivity: v })} placeholder="High / To Assess / Low" />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setShowWorkstreamModal(false); setEditWorkstream(null) }} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Cancel</button>
            <button onClick={editWorkstream ? handleUpdateWorkstream : handleCreateWorkstream} disabled={!wsForm.label} className="px-4 py-2 bg-ink text-paper text-sm rounded-lg hover:bg-ink/90 transition-colors disabled:opacity-50">
              {editWorkstream ? "Save" : "Add"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Lost Modal */}
      <Modal open={showLostModal} onClose={() => setShowLostModal(false)} title="Mark Deal Lost">
        <div className="space-y-4">
          <SelectField label="Reason" value={lostReason} onChange={setLostReason} options={lostReasons} />
          <TextField label="Notes (optional)" value={lostNotes} onChange={setLostNotes} multiline />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowLostModal(false)} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Cancel</button>
            <button onClick={handleMarkLost} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              Mark Lost
            </button>
          </div>
        </div>
      </Modal>

      {/* Won Modal */}
      <Modal open={showWonModal} onClose={() => setShowWonModal(false)} title="Mark Deal Won">
        <div className="space-y-4">
          <p className="text-sm text-mute">Mark this deal as won. You can convert to a client and create a project from the deals pipeline view.</p>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowWonModal(false)} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Cancel</button>
            <button onClick={handleMarkWon} className="px-4 py-2 text-sm bg-forest text-white rounded-lg hover:bg-forest/90 transition-colors">
              Mark Won
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Deal">
        <div className="space-y-4">
          <p className="text-sm text-mute">Are you sure you want to delete this deal? This action cannot be undone.</p>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Cancel</button>
            <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-hairline last:border-0">
      <span className="text-sm text-mute">{label}</span>
      <span className="text-sm font-medium text-ink text-right max-w-[60%] truncate">{value}</span>
    </div>
  )
}

function ScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-mute">{label}</span>
        <span className="text-sm font-medium text-ink">{score.toFixed(1)} / 5</span>
      </div>
      <div className="h-1.5 bg-hairline rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${score >= 4 ? "bg-forest" : score >= 2.5 ? "bg-gold" : "bg-coral"}`} style={{ width: `${(score / 5) * 100}%` }} />
      </div>
    </div>
  )
}

function EditableField({
  field, display, editField, editValue, onStart, onSave, onCancel, onEditChange, type,
}: {
  field: string; display: string; editField: string | null; editValue: string
  onStart: () => void; onSave: () => void; onCancel: () => void; onEditChange: (v: string) => void
  type?: string
}) {
  if (editField === field) {
    return (
      <div className="flex items-center gap-1">
        <input
          type={type || "text"}
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          className="w-32 h-8 px-2 text-sm bg-paper border border-hairline rounded focus:outline-none focus:border-coral text-right"
          autoFocus
          onKeyDown={(e) => { if (e.key === "Enter") onSave(); if (e.key === "Escape") onCancel() }}
        />
        <button onClick={onSave} className="p-1 text-forest hover:bg-forest/10 rounded"><Save className="w-3.5 h-3.5" /></button>
        <button onClick={onCancel} className="p-1 text-mute hover:bg-paper2 rounded"><X className="w-3.5 h-3.5" /></button>
      </div>
    )
  }
  return (
    <button onClick={onStart} className="text-sm font-medium text-ink hover:text-coral flex items-center gap-1 group">
      {display}
      <Edit3 className="w-3 h-3 text-mute opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}

function TextAreaField({ label, value, field, onSave }: { label: string; value: string | null; field: string; onSave: (field: string, value: unknown) => void }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(value || "")

  const handleSave = () => {
    onSave(field, text || null)
    setEditing(false)
  }

  if (editing) {
    return (
      <div>
        <label className="block text-xs text-mute mb-1">{label}</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-24 px-3 py-2 text-sm bg-paper border border-hairline rounded-lg focus:outline-none focus:border-coral transition-colors resize-none"
          autoFocus
        />
        <div className="flex gap-2 mt-1">
          <button onClick={handleSave} className="text-xs text-forest hover:underline">Save</button>
          <button onClick={() => setEditing(false)} className="text-xs text-mute hover:underline">Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-mute">{label}</span>
        <button onClick={() => { setText(value || ""); setEditing(true) }} className="text-xs text-mute hover:text-coral opacity-0 hover:opacity-100 transition-opacity">
          <Edit3 className="w-3 h-3" />
        </button>
      </div>
      <p className="text-sm text-ink whitespace-pre-wrap">{value || "—"}</p>
    </div>
  )
}
