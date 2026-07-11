"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Plus, Search, MoreHorizontal, FileText, ArrowRight } from "lucide-react"
import { listInvoices, createInvoice, getInvoiceSummary } from "@/lib/db/invoices"
import { listCompanies } from "@/lib/db/companies"
import { Modal } from "@/components/ui/Modal"
import { EmptyState } from "@/components/ui/EmptyState"
import { LoadingState } from "@/components/ui/LoadingState"
import { TextField } from "@/components/ui/TextField"
import { SelectField } from "@/components/ui/SelectField"
import type { Invoice, CreateInvoiceInput } from "@/types/database"

const statusColors: Record<string, string> = {
  draft: "bg-mute/10 text-mute",
  sent: "bg-inkblue/10 text-inkblue",
  viewed: "bg-gold/10 text-gold",
  paid: "bg-forest/10 text-forest",
  overdue: "bg-red-500/10 text-red-500",
  cancelled: "bg-mute/10 text-mute",
}

const typeColors: Record<string, string> = {
  advance: "bg-inkblue/10 text-inkblue",
  milestone: "bg-gold/10 text-gold",
  final: "bg-forest/10 text-forest",
  retainer: "bg-coral/10 text-coral",
  change_order: "bg-mute/10 text-mute",
  ad_hoc: "bg-coral/10 text-coral",
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<(Invoice & { client?: { name: string } })[]>([])
  const [summary, setSummary] = useState<{ total_cents: number; outstanding_cents: number; overdue_cents: number; paid_cents: number; count: number; overdue_count: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [clientOptions, setClientOptions] = useState<{ value: string; label: string }[]>([])

  const [formData, setFormData] = useState({
    client_org_id: "", type: "advance", amount_cents: 0, due_date: "", adhoc_reason: "",
    line_items: [{ description: "", quantity: 1, unit_price_cents: 0, amount_cents: 0 }],
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    const [inv, summ, companies] = await Promise.all([
      listInvoices(),
      getInvoiceSummary(),
      listCompanies(),
    ])
    setInvoices(inv)
    setSummary(summ)
    setClientOptions(companies.map(c => ({ value: c.id, label: c.name })))
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCreate = async () => {
    const result = await createInvoice(formData as CreateInvoiceInput)
    if ("error" in result) { alert(result.error); return }
    setShowCreateModal(false)
    setFormData({ client_org_id: "", type: "advance", amount_cents: 0, due_date: "", adhoc_reason: "", line_items: [{ description: "", quantity: 1, unit_price_cents: 0, amount_cents: 0 }] })
    loadData()
  }

  if (loading) return <LoadingState />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display tracking-tight">Invoices</h1>
          <p className="text-mute text-sm mt-1">{summary?.count || 0} total invoices</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-ink text-paper text-sm rounded-lg hover:bg-charcoal transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-paper border border-hairline rounded-xl p-5">
          <div className="text-xs font-mono uppercase tracking-wider text-mute mb-1">Outstanding</div>
          <div className="text-2xl font-display tracking-tight">${((summary?.outstanding_cents || 0) / 100).toLocaleString()}</div>
        </div>
        <div className="bg-paper border border-hairline rounded-xl p-5">
          <div className="text-xs font-mono uppercase tracking-wider text-mute mb-1">Overdue</div>
          <div className="text-2xl font-display tracking-tight text-coral">${((summary?.overdue_cents || 0) / 100).toLocaleString()}</div>
          <div className="text-xs text-coral mt-1">{summary?.overdue_count || 0} overdue</div>
        </div>
        <div className="bg-paper border border-hairline rounded-xl p-5">
          <div className="text-xs font-mono uppercase tracking-wider text-mute mb-1">Collected</div>
          <div className="text-2xl font-display tracking-tight text-forest">${((summary?.paid_cents || 0) / 100).toLocaleString()}</div>
        </div>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No invoices yet"
          description="Create your first invoice to start tracking payments."
          actionLabel="New Invoice"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="bg-paper border border-hairline rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hairline">
                <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-hairline last:border-0 hover:bg-paper2/50 transition-colors cursor-pointer">
                  <td className="px-5 py-4" colSpan={6}>
                    <Link href={`/studio/invoices/${inv.id}`} className="flex items-center justify-between group">
                      <div className="flex items-center gap-6 flex-1">
                        <span className="text-sm font-medium w-24 group-hover:text-coral transition-colors">{inv.number}</span>
                        <span className="text-sm text-mute w-32">{inv.client?.name || "—"}</span>
                        <span className="text-sm font-medium w-24">${(inv.amount_cents / 100).toLocaleString()}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-20 ${statusColors[inv.status] || "bg-mute/10 text-mute"}`}>
                          {inv.status}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-24 ${typeColors[inv.type] || "bg-mute/10 text-mute"}`}>
                          {inv.type.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-mute">
                          {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "—"}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-mute opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Invoice">
        <div className="space-y-4">
          <SelectField label="Client" value={formData.client_org_id} onChange={(v) => setFormData({ ...formData, client_org_id: v })} options={clientOptions} placeholder="Select client" required />
          <SelectField label="Type" value={formData.type} onChange={(v) => setFormData({ ...formData, type: v as CreateInvoiceInput["type"] })} options={[
            { value: "advance", label: "Advance" },
            { value: "milestone", label: "Milestone" },
            { value: "final", label: "Final" },
            { value: "retainer", label: "Retainer" },
            { value: "change_order", label: "Change Order" },
            { value: "ad_hoc", label: "Ad Hoc" },
          ]} />
          {formData.type === "ad_hoc" && (
            <TextField label="Why ad-hoc?" value={formData.adhoc_reason || ""} onChange={(v) => setFormData({ ...formData, adhoc_reason: v })} required placeholder="e.g. Small out-of-scope fix, rush request" />
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5">Amount (cents) <span className="text-coral">*</span></label>
            <input
              type="number"
              value={formData.amount_cents}
              onChange={(e) => setFormData({ ...formData, amount_cents: parseInt(e.target.value) || 0 })}
              className="w-full h-10 px-3 bg-paper border border-hairline rounded-lg text-sm focus:outline-none focus:border-coral transition-colors"
            />
            <p className="text-xs text-mute mt-1">${(formData.amount_cents / 100).toFixed(2)}</p>
          </div>
          <TextField label="Due Date" value={formData.due_date} onChange={(v) => setFormData({ ...formData, due_date: v })} type="date" />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={!formData.client_org_id || (formData.type === "ad_hoc" && !formData.adhoc_reason)} className="px-4 py-2 text-sm bg-ink text-paper rounded-lg hover:bg-charcoal transition-colors disabled:opacity-50">
              Create Invoice
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
