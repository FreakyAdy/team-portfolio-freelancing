"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  TrendingUp
} from "lucide-react"
import { listDeals, createDeal, updateDealStage, updateDeal, getPipelineSummary } from "@/lib/db/deals"
import { listCompanies } from "@/lib/db/companies"
import { listTeamMembers } from "@/lib/db/contacts"
import { Modal } from "@/components/ui/Modal"
import { EmptyState } from "@/components/ui/EmptyState"
import { LoadingState } from "@/components/ui/LoadingState"
import { TextField } from "@/components/ui/TextField"
import { SelectField } from "@/components/ui/SelectField"
import type { Deal, CreateDealInput } from "@/types/database"

const stages = [
  { id: "researching", label: "Researching", color: "bg-mute/10", textColor: "text-mute" },
  { id: "qualified", label: "Qualified", color: "bg-mute/10", textColor: "text-mute" },
  { id: "outreach_ready", label: "Outreach Ready", color: "bg-inkblue/10", textColor: "text-inkblue" },
  { id: "contacted", label: "Contacted", color: "bg-inkblue/10", textColor: "text-inkblue" },
  { id: "replied", label: "Replied", color: "bg-gold/10", textColor: "text-gold" },
  { id: "positive_reply", label: "Positive Reply", color: "bg-gold/10", textColor: "text-gold" },
  { id: "discovery_scheduled", label: "Discovery", color: "bg-gold/10", textColor: "text-gold" },
  { id: "scoping", label: "Scoping", color: "bg-coral/10", textColor: "text-coral" },
  { id: "proposal_sent", label: "Proposal", color: "bg-coral/10", textColor: "text-coral" },
  { id: "negotiation", label: "Negotiation", color: "bg-coral/10", textColor: "text-coral" },
  { id: "verbal_yes", label: "Verbal Yes", color: "bg-forest/10", textColor: "text-forest" },
  { id: "won", label: "Won", color: "bg-forest/10", textColor: "text-forest" },
  { id: "lost", label: "Lost", color: "bg-red-500/10", textColor: "text-red-500" },
  { id: "nurture", label: "Nurture", color: "bg-mute/10", textColor: "text-mute" },
]

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [summary, setSummary] = useState<{ total: number; totalValue: number; weighted: number; avg: number; winRate: number; wonCount: number; byStage: { stage: string; count: number; value: number }[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [companyOptions, setCompanyOptions] = useState<{ value: string; label: string }[]>([])
  const [teamOptions, setTeamOptions] = useState<{ value: string; label: string }[]>([])
  const [dealMenuOpen, setDealMenuOpen] = useState<string | null>(null)

  const [formData, setFormData] = useState<CreateDealInput>({
    name: "", value_cents: 0, probability: 50,
    source: "", assigned_to: "", notes: "",
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    const [dealsData, summaryData, companies, team] = await Promise.all([
      listDeals({ stage: activeFilter, search: searchQuery }),
      getPipelineSummary(),
      listCompanies(),
      listTeamMembers(),
    ])
    setDeals(dealsData)
    setSummary(summaryData)
    setCompanyOptions(companies.map(c => ({ value: c.id, label: c.name })))
    setTeamOptions(team.map(t => ({ value: t.id, label: t.full_name || t.email })))
    setLoading(false)
  }, [activeFilter, searchQuery])

  useEffect(() => { loadData() }, [loadData])

  const handleCreate = async () => {
    const result = await createDeal(formData)
    if ("error" in result) {
      alert(result.error)
      return
    }
    setShowCreateModal(false)
    setFormData({ name: "", value_cents: 0, probability: 50 })
    loadData()
  }

  const handleStageChange = async (dealId: string, newStage: string) => {
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
            {stages.filter(s => !["lost", "nurture"].includes(s.id)).map(stage => {
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
                      <div key={deal.id} className="bg-paper border border-hairline rounded-lg p-3 hover:border-coral/30 transition-colors cursor-pointer group relative">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-sans font-medium text-ink text-sm group-hover:text-coral transition-colors">
                            {deal.name}
                          </h3>
                          <div className="relative">
                            <button
                              onClick={() => setDealMenuOpen(dealMenuOpen === deal.id ? null : deal.id)}
                              className="opacity-0 group-hover:opacity-100 text-mute hover:text-ink transition-all p-0.5"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {dealMenuOpen === deal.id && (
                              <div className="absolute right-0 top-full mt-1 w-44 bg-paper border border-hairline rounded-lg shadow-lg z-10 py-1 max-h-60 overflow-y-auto">
                                {stages.map(s => (
                                  <button
                                    key={s.id}
                                    onClick={() => handleStageChange(deal.id, s.id)}
                                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-paper2 transition-colors ${s.id === deal.stage ? "font-medium text-ink" : "text-mute"}`}
                                  >
                                    Move to {s.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-mute mb-3">{deal.notes?.slice(0, 60) || "—"}</p>
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
                        </div>
                        {deal.assignee && (
                          <div className="mt-3 pt-3 border-t border-hairline">
                            <p className="text-xs text-mute truncate">{deal.assignee.full_name}</p>
                          </div>
                        )}
                      </div>
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

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Deal">
        <div className="space-y-4">
          <TextField label="Deal Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} required />
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
