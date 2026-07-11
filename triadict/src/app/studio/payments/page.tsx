"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Download, CheckCircle2, Clock, AlertCircle, DollarSign, ExternalLink } from "lucide-react"
import { listPayments, recordPayment, getPaymentSummary } from "@/lib/db/payments"
import type { PaymentWithInvoice } from "@/lib/db/payments"
import type { PaymentMethod, CreatePaymentInput } from "@/types/database"
import { listInvoices } from "@/lib/db/invoices"
import { Modal } from "@/components/ui/Modal"
import { EmptyState } from "@/components/ui/EmptyState"
import { LoadingState } from "@/components/ui/LoadingState"
import { SelectField } from "@/components/ui/SelectField"
export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentWithInvoice[]>([])
  const [summary, setSummary] = useState<{ total_cents: number; count: number; cleared_count: number; by_method: { method: string | null; total: number; count: number }[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [invoiceOptions, setInvoiceOptions] = useState<{ value: string; label: string }[]>([])
  const [formData, setFormData] = useState({ invoice_id: "", amount_cents: 0, method: "manual", reference: "" })

  const loadData = useCallback(async () => {
    setLoading(true)
    const [pay, summ, invs] = await Promise.all([
      listPayments(),
      getPaymentSummary(),
      listInvoices(),
    ])
    setPayments(pay)
    setSummary(summ)
    setInvoiceOptions(invs.map(i => ({ value: i.id, label: `${i.number} — ${(i.client as { name: string } | undefined)?.name || "Unknown"} ($${(i.amount_cents / 100).toLocaleString()})` })))
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleRecord = async () => {
    const result = await recordPayment(formData as CreatePaymentInput)
    if ("error" in result) { alert(result.error); return }
    setShowRecordModal(false)
    setFormData({ invoice_id: "", amount_cents: 0, method: "manual", reference: "" })
    loadData()
  }

  const getInvoiceInfo = (payment: PaymentWithInvoice) => {
    return payment.invoice?.number || payment.invoice_id.slice(0, 8)
  }

  if (loading) return <LoadingState />

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display tracking-tight">Payments</h1>
          <p className="text-mute text-sm mt-1">Track incoming payments</p>
        </div>
        <button onClick={() => setShowRecordModal(true)} className="flex items-center gap-2 px-4 py-2 bg-ink text-paper text-sm rounded-lg hover:bg-charcoal transition-colors">
          <Download className="w-4 h-4" />
          Record Payment
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-paper border border-hairline rounded-xl p-5">
          <div className="text-xs font-mono uppercase tracking-wider text-mute mb-1">Total Collected</div>
          <div className="text-2xl font-display tracking-tight">${((summary?.total_cents || 0) / 100).toLocaleString()}</div>
          <div className="text-xs text-forest mt-1">{summary?.cleared_count || 0} cleared payments</div>
        </div>
        <div className="bg-paper border border-hairline rounded-xl p-5">
          <div className="text-xs font-mono uppercase tracking-wider text-mute mb-1">Total Payments</div>
          <div className="text-2xl font-display tracking-tight">{summary?.count || 0}</div>
          <div className="text-xs text-mute mt-1">All time</div>
        </div>
        <div className="bg-paper border border-hairline rounded-xl p-5">
          <div className="text-xs font-mono uppercase tracking-wider text-mute mb-1">Avg Payment</div>
          <div className="text-2xl font-display tracking-tight">
            ${summary && summary.count > 0 ? ((summary.total_cents / summary.count) / 100).toLocaleString() : "0"}
          </div>
        </div>
      </div>

      <div className="bg-forest/5 border border-forest/20 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-forest" />
          <p className="text-sm text-forest font-sans font-medium">Payment Gate Reminder</p>
        </div>
        <p className="text-xs text-mute mt-1">
          After recording a payment, remember to update the deal&apos;s payment gate status.
          Go to Pipeline → open the deal → Overview → Payment Gate section.
        </p>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No payments recorded"
          description="Record your first payment to start tracking finances."
          actionLabel="Record Payment"
          onAction={() => setShowRecordModal(true)}
        />
      ) : (
        <div className="bg-paper border border-hairline rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hairline">
                <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Invoice</th>
                <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Amount</th>
                <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Method</th>
                <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Status</th>
                <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-hairline last:border-0 hover:bg-paper2/50 transition-colors">
                  <td className="px-5 py-4">
                    <Link href={`/studio/invoices/${payment.invoice_id}`} className="text-sm font-medium text-coral hover:text-coral/80 flex items-center gap-1">
                      {payment.invoice?.number || payment.invoice_id.slice(0, 8)}... <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium">${(payment.amount_cents / 100).toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm text-mute">{payment.method || "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs ${
                      payment.status === "cleared" ? "text-forest" :
                      payment.status === "pending" ? "text-gold" : "text-coral"
                    }`}>
                      {payment.status === "cleared" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-mute">
                    {payment.received_at ? new Date(payment.received_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showRecordModal} onClose={() => setShowRecordModal(false)} title="Record Payment">
        <div className="space-y-4">
          <SelectField
            label="Invoice"
            value={formData.invoice_id}
            onChange={(v) => setFormData({ ...formData, invoice_id: v })}
            options={invoiceOptions}
            placeholder="Select invoice"
            required
          />
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
          <SelectField label="Method" value={formData.method} onChange={(v) => setFormData({ ...formData, method: v as PaymentMethod })} options={[
            { value: "stripe", label: "Stripe" },
            { value: "wise", label: "Wise" },
            { value: "bank", label: "Bank Transfer" },
            { value: "manual", label: "Manual" },
          ]} />
          <div>
            <label className="block text-sm font-medium mb-1.5">Reference</label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="w-full h-10 px-3 bg-paper border border-hairline rounded-lg text-sm focus:outline-none focus:border-coral transition-colors"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowRecordModal(false)} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Cancel</button>
            <button onClick={handleRecord} disabled={!formData.amount_cents || !formData.invoice_id} className="px-4 py-2 text-sm bg-ink text-paper rounded-lg hover:bg-charcoal transition-colors disabled:opacity-50">
              Record Payment
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
