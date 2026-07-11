"use client"

import { useState, useEffect, useCallback } from "react"
import { FileText } from "lucide-react"
import { listInvoices } from "@/lib/db/invoices"
import { LoadingState } from "@/components/ui/LoadingState"
import { EmptyState } from "@/components/ui/EmptyState"
import type { Invoice } from "@/types/database"

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
}

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<(Invoice & { client?: { name: string } })[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const data = await listInvoices()
    setInvoices(data)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  if (loading) return <LoadingState />

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight text-ink">Invoices</h1>
        <p className="text-mute text-sm mt-1">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""}</p>
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No invoices"
          description="You don't have any invoices yet."
        />
      ) : (
        <div className="space-y-4">
          {invoices.map(inv => (
            <div key={inv.id} className="bg-paper border border-hairline rounded-xl p-5 hover:border-coral/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-sans font-medium text-ink">{inv.number}</h3>
                  <p className="text-xs text-mute mt-0.5">
                    {inv.due_date ? `Due ${new Date(inv.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : "No due date"}
                  </p>
                </div>
                <span className="text-lg font-display text-ink">${(inv.amount_cents / 100).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[inv.status] || "bg-mute/10 text-mute"}`}>
                  {inv.status}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeColors[inv.type] || "bg-mute/10 text-mute"}`}>
                  {inv.type.replace('_', ' ')}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-hairline">
                <p className="text-xs font-mono uppercase tracking-wider text-mute mb-3">Payment Schedule</p>
                <div className="flex items-center gap-2">
                  {[
                    { label: "Deposit", condition: "On agreement", paid: inv.status === "paid" },
                    { label: "Progress", condition: "Mid-project", paid: inv.status === "paid" },
                    { label: "Final", condition: "On completion", paid: false },
                  ].map((installment, i) => (
                    <div key={i} className="flex-1">
                      <div className={`h-1.5 rounded-full ${installment.paid ? "bg-forest" : i === 0 && inv.status !== "paid" ? "bg-coral" : "bg-hairline"}`} />
                      <p className={`text-[10px] mt-1 ${installment.paid ? "text-forest" : "text-mute"}`}>
                        {installment.label}
                      </p>
                      <p className="text-[10px] text-mute/60">{installment.condition}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
