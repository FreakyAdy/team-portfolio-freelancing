"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, FileText, Building2, DollarSign, Calendar,
  MoreHorizontal, AlertCircle, CheckCircle2, XCircle, Send, Download,
  Edit3, ExternalLink,
} from "lucide-react"
import { getInvoice, updateInvoiceStatus } from "@/lib/db/invoices"
import { listPayments } from "@/lib/db/payments"
import { Modal } from "@/components/ui/Modal"
import { LoadingState } from "@/components/ui/LoadingState"
import { SelectField } from "@/components/ui/SelectField"
import type { Invoice, Payment } from "@/types/database"

const statusColors: Record<string, string> = {
  draft: "bg-mute/10 text-mute",
  sent: "bg-inkblue/10 text-inkblue",
  viewed: "bg-gold/10 text-gold",
  paid: "bg-forest/10 text-forest",
  overdue: "bg-red-500/10 text-red-500",
  cancelled: "bg-mute/10 text-mute",
}

const typeLabels: Record<string, string> = {
  advance: "Advance",
  milestone: "Milestone",
  final: "Final",
  retainer: "Retainer",
  change_order: "Change Order",
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string

  const [invoice, setInvoice] = useState<(Invoice & { client?: { name: string }; project?: { name: string; id: string } }) | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusTarget, setStatusTarget] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [inv, pays] = await Promise.all([
      getInvoice(invoiceId),
      listPayments({ invoice_id: invoiceId }),
    ])
    setInvoice(inv as (Invoice & { client?: { name: string }; project?: { name: string; id: string } }) | null)
    setPayments(pays)
    setLoading(false)
  }, [invoiceId])

  useEffect(() => { loadData() }, [loadData])

  const handleStatusChange = async (newStatus: string) => {
    await updateInvoiceStatus(invoiceId, newStatus)
    setShowStatusModal(false)
    loadData()
  }

  const handleDelete = () => {
    router.push("/studio/invoices")
  }

  if (loading) return <LoadingState />
  if (!invoice) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <AlertCircle className="w-12 h-12 text-mute mx-auto mb-4" />
        <h2 className="font-display text-xl text-ink mb-2">Invoice not found</h2>
        <p className="text-mute text-sm mb-6">This invoice doesn't exist or has been deleted.</p>
        <Link href="/studio/invoices" className="text-sm text-coral hover:text-coral/80">Back to Invoices</Link>
      </div>
    )
  }

  const totalPaid = payments.reduce((s, p) => s + p.amount_cents, 0)
  const balanceDue = invoice.amount_cents - totalPaid
  const project = invoice.project as { name: string; id: string } | undefined

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-mute">
        <Link href="/studio/invoices" className="hover:text-ink transition-colors">Invoices</Link>
        <span>/</span>
        <span className="text-ink font-medium">{invoice.number}</span>
      </div>

      <div className="bg-paper border border-hairline rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Link href="/studio/invoices" className="p-2 text-mute hover:text-ink hover:bg-paper2 rounded-lg transition-colors mt-1">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-display text-3xl tracking-tight text-ink">{invoice.number}</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${statusColors[invoice.status] || "bg-mute/10 text-mute"}`}>
                  {invoice.status}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-paper2 text-mute">
                  {typeLabels[invoice.type] || invoice.type}
                </span>
              </div>
              <p className="text-mute text-sm flex items-center gap-2">
                {invoice.client?.name && <span>{invoice.client.name}</span>}
                {invoice.client?.name && <span>·</span>}
                <span>${(invoice.amount_cents / 100).toLocaleString()}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {invoice.status === "draft" && (
              <button onClick={() => { setStatusTarget("sent"); setShowStatusModal(true) }} className="px-3 py-1.5 text-sm border border-hairline rounded-lg hover:bg-paper2 transition-colors flex items-center gap-1">
                <Send className="w-3.5 h-3.5" /> Mark Sent
              </button>
            )}
            {invoice.status === "sent" && (
              <button onClick={() => { setStatusTarget("paid"); setShowStatusModal(true) }} className="px-3 py-1.5 text-sm bg-forest text-white rounded-lg hover:bg-forest/90 transition-colors flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Paid
              </button>
            )}
            {!["paid", "cancelled"].includes(invoice.status) && (
              <button onClick={() => { setStatusTarget("cancelled"); setShowStatusModal(true) }} className="px-3 py-1.5 text-sm border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500/5 transition-colors flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Cancel
              </button>
            )}
            <div className="relative group">
              <button className="p-2 text-mute hover:text-ink hover:bg-paper2 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-40 bg-paper border border-hairline rounded-lg shadow-lg z-10 py-1 hidden group-hover:block">
                <button onClick={() => setShowDeleteModal(true)} className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-paper2 transition-colors">
                  Delete Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-paper border border-hairline rounded-xl p-6">
            <h2 className="font-display text-lg tracking-tight text-ink mb-4">Invoice Details</h2>
            <div className="space-y-3">
              <InfoRow label="Invoice Number" value={invoice.number} />
              <InfoRow label="Type" value={typeLabels[invoice.type] || invoice.type} />
              <InfoRow label="Client" value={invoice.client?.name || "—"} />
              <InfoRow label="Project" value={project?.name || "—"} href={project ? `/studio/projects/${project.id}` : undefined} />
              <InfoRow label="Due Date" value={invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "—"} />
              <InfoRow label="Created" value={new Date(invoice.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
              {invoice.sent_at && <InfoRow label="Sent" value={new Date(invoice.sent_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />}
              {invoice.paid_at && <InfoRow label="Paid" value={new Date(invoice.paid_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />}
            </div>
          </div>

          <div className="bg-paper border border-hairline rounded-xl p-6">
            <h2 className="font-display text-lg tracking-tight text-ink mb-4">Line Items</h2>
            {(!invoice.line_items || invoice.line_items.length === 0) ? (
              <p className="text-sm text-mute">No line items</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hairline">
                    <th className="text-left text-xs font-mono uppercase tracking-wider text-mute pb-2">Description</th>
                    <th className="text-right text-xs font-mono uppercase tracking-wider text-mute pb-2">Qty</th>
                    <th className="text-right text-xs font-mono uppercase tracking-wider text-mute pb-2">Unit Price</th>
                    <th className="text-right text-xs font-mono uppercase tracking-wider text-mute pb-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.line_items.map((item, i) => (
                    <tr key={i} className="border-b border-hairline last:border-0">
                      <td className="py-2 text-sm text-ink">{item.description}</td>
                      <td className="py-2 text-sm text-right text-mute">{item.quantity}</td>
                      <td className="py-2 text-sm text-right text-mute">${(item.unit_price_cents / 100).toLocaleString()}</td>
                      <td className="py-2 text-sm text-right text-ink font-medium">${(item.amount_cents / 100).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="pt-3 text-sm font-medium text-right text-ink">Total</td>
                    <td className="pt-3 text-sm font-medium text-right text-ink">${(invoice.amount_cents / 100).toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-paper border border-hairline rounded-xl p-6">
            <h2 className="font-display text-lg tracking-tight text-ink mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-hairline">
                <span className="text-sm text-mute">Amount</span>
                <span className="text-sm text-ink font-medium">${(invoice.amount_cents / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-hairline">
                <span className="text-sm text-mute">Paid</span>
                <span className="text-sm text-forest font-medium">-${(totalPaid / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-ink font-medium">Balance Due</span>
                <span className={`text-sm font-medium ${balanceDue > 0 ? "text-coral" : "text-forest"}`}>
                  ${(balanceDue / 100).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-paper border border-hairline rounded-xl p-6">
            <h2 className="font-display text-lg tracking-tight text-ink mb-4">Payments</h2>
            {payments.length === 0 ? (
              <p className="text-sm text-mute">No payments recorded</p>
            ) : (
              <div className="space-y-2">
                {payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-hairline last:border-0">
                    <div>
                      <p className="text-sm text-ink font-medium">${(p.amount_cents / 100).toLocaleString()}</p>
                      <p className="text-xs text-mute">{p.method || "—"}</p>
                    </div>
                    <span className="text-xs text-mute">
                      {p.received_at ? new Date(p.received_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "—"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={showStatusModal} onClose={() => setShowStatusModal(false)} title={`Mark as ${statusTarget}`}>
        <p className="text-sm text-mute mb-6">Change invoice status to <strong>{statusTarget}</strong>?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowStatusModal(false)} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Cancel</button>
          <button onClick={() => handleStatusChange(statusTarget)} className="px-4 py-2 text-sm bg-ink text-paper rounded-lg hover:bg-charcoal transition-colors">
            Confirm
          </button>
        </div>
      </Modal>

      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Invoice">
        <p className="text-sm text-mute mb-6">Are you sure you want to delete this invoice?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  )
}

function InfoRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-hairline last:border-0">
      <span className="text-sm text-mute">{label}</span>
      {href ? (
        <Link href={href} className="text-sm text-coral hover:text-coral/80 flex items-center gap-1">
          {value} <ExternalLink className="w-3 h-3" />
        </Link>
      ) : (
        <span className="text-sm text-ink font-medium">{value}</span>
      )}
    </div>
  )
}
