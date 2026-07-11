"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, HeadphonesIcon, AlertCircle } from "lucide-react"
import { listProjects } from "@/lib/db/projects"
import { Modal } from "@/components/ui/Modal"
import { LoadingState } from "@/components/ui/LoadingState"
import { EmptyState } from "@/components/ui/EmptyState"
import { TextField } from "@/components/ui/TextField"
import { SelectField } from "@/components/ui/SelectField"

const categories = [
  { value: "bug", label: "Bug Report" },
  { value: "content_change", label: "Content Change" },
  { value: "support", label: "Support Request" },
  { value: "enhancement", label: "Enhancement" },
  { value: "new_scope", label: "New Scope" },
]

const statusColors: Record<string, string> = {
  submitted: "bg-mute/10 text-mute",
  triaged: "bg-inkblue/10 text-inkblue",
  in_progress: "bg-gold/10 text-gold",
  resolved: "bg-forest/10 text-forest",
  closed: "bg-mute/10 text-mute",
}

export default function PortalSupportPage() {
  const [tickets, setTickets] = useState<{ id: string; title: string; category: string; status: string; priority: string; submitted_at: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({ title: "", description: "", category: "support", priority: "medium" })

  const loadData = useCallback(async () => {
    setLoading(true)
    setTickets([])
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCreate = async () => {
    setShowCreateModal(false)
    setFormData({ title: "", description: "", category: "support", priority: "medium" })
    loadData()
  }

  if (loading) return <LoadingState />

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight text-ink">Support</h1>
          <p className="text-mute text-sm mt-1">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-ink text-paper text-sm rounded-lg hover:bg-charcoal transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      <div className="bg-paper border border-hairline rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-sans font-medium text-ink">Support Capacity</h3>
            <p className="text-xs text-mute mt-0.5">Included with your retainer plan</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-display text-ink">5 / 10</p>
            <p className="text-xs text-mute">tickets this month</p>
          </div>
        </div>
        <div className="mt-3 h-1.5 bg-hairline rounded-full overflow-hidden">
          <div className="h-full bg-forest rounded-full" style={{ width: "50%" }} />
        </div>
      </div>

      {tickets.length === 0 ? (
        <EmptyState
          icon={HeadphonesIcon}
          title="No tickets yet"
          description="Submit a support ticket and we'll get back to you."
          actionLabel="New Ticket"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="space-y-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-paper border border-hairline rounded-xl p-5 hover:border-coral/30 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-sans font-medium text-ink">{ticket.title}</h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[ticket.status] || "bg-mute/10 text-mute"}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-mute">{categories.find(c => c.value === ticket.category)?.label || ticket.category}</span>
                <span className="text-mute">·</span>
                <span className="text-xs text-mute">{new Date(ticket.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Support Ticket">
        <div className="space-y-4">
          <TextField label="Title" value={formData.title} onChange={(v) => setFormData({ ...formData, title: v })} required />
          <TextField label="Description" value={formData.description} onChange={(v) => setFormData({ ...formData, description: v })} multiline />
          <SelectField label="Category" value={formData.category} onChange={(v) => setFormData({ ...formData, category: v })} options={categories} />
          <SelectField label="Priority" value={formData.priority} onChange={(v) => setFormData({ ...formData, priority: v })} options={[
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
            { value: "urgent", label: "Urgent" },
          ]} />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={!formData.title} className="px-4 py-2 text-sm bg-ink text-paper rounded-lg hover:bg-charcoal transition-colors disabled:opacity-50">
              Submit Ticket
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
