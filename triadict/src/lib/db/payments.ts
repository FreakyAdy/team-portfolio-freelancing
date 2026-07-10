"use server"

import { createClient } from "@/lib/supabase/server"
import type { Payment, CreatePaymentInput, Invoice } from "@/types/database"

export type PaymentWithInvoice = Payment & { invoice?: Pick<Invoice, "id" | "number"> }

export async function listPayments(params?: {
  invoice_id?: string
  client_org_id?: string
  status?: string
}): Promise<PaymentWithInvoice[]> {
  try {
    const supabase = await createClient()
    let query = supabase.from("payments").select(`
      *,
      invoice:invoices (*)
    `).order("created_at", { ascending: false })

    if (params?.invoice_id) query = query.eq("invoice_id", params.invoice_id)
    if (params?.status && params.status !== "all") query = query.eq("status", params.status)

    const { data, error } = await query
    if (error) return []
    return data as unknown as Payment[]
  } catch {
    return []
  }
}

export async function recordPayment(input: CreatePaymentInput): Promise<Payment | { error: string }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("payments").insert({
      invoice_id: input.invoice_id,
      amount_cents: input.amount_cents,
      method: input.method || "manual",
      reference: input.reference || null,
      received_at: input.received_at || new Date().toISOString(),
      status: "cleared",
    }).select().single()

    if (error) return { error: error.message }

    await supabase.from("events").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      name: "payment_recorded",
      payload: { payment_id: data.id, invoice_id: input.invoice_id, amount_cents: input.amount_cents },
    })

    return data as Payment
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to record payment" }
  }
}

export async function getPaymentSummary() {
  try {
    const supabase = await createClient()
    const { data: payments, error } = await supabase.from("payments").select("*")
    if (error || !payments) {
      return { total_cents: 0, count: 0, cleared_count: 0, by_method: [] }
    }

    const total = payments.filter(p => p.status === "cleared").reduce((s, p) => s + p.amount_cents, 0)
    const methods = [...new Set(payments.filter(p => p.method).map(p => p.method))]

    return {
      total_cents: total,
      count: payments.length,
      cleared_count: payments.filter(p => p.status === "cleared").length,
      by_method: methods.map(m => ({
        method: m,
        total: payments.filter(p => p.method === m && p.status === "cleared").reduce((s, p) => s + p.amount_cents, 0),
        count: payments.filter(p => p.method === m).length,
      })),
    }
  } catch {
    return { total_cents: 0, count: 0, cleared_count: 0, by_method: [] }
  }
}
