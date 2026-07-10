"use server"

import { createClient } from "@/lib/supabase/server"
import type { Invoice, CreateInvoiceInput } from "@/types/database"

export async function listInvoices(params?: {
  status?: string
  client_org_id?: string
  search?: string
}): Promise<(Invoice & { client?: { name: string } })[]> {
  try {
    const supabase = await createClient()
    let query = supabase.from("invoices").select(`
      *,
      client:organizations!invoices_client_org_id_fkey (name),
      project:projects (*)
    `).order("created_at", { ascending: false })

    if (params?.status && params.status !== "all") query = query.eq("status", params.status)
    if (params?.client_org_id) query = query.eq("client_org_id", params.client_org_id)
    if (params?.search) query = query.or(`number.ilike.%${params.search}%`)

    const { data, error } = await query
    if (error) return []
    return data as unknown as Invoice[]
  } catch {
    return []
  }
}

export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice | { error: string }> {
  try {
    const supabase = await createClient()
    const { count } = await supabase.from("invoices").select("id", { count: "exact", head: true })
    const nextNum = (count || 0) + 1
    const number = `INV-${String(nextNum).padStart(3, "0")}`

    const { data, error } = await supabase.from("invoices").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      client_org_id: input.client_org_id,
      project_id: input.project_id || null,
      deal_id: input.deal_id || null,
      type: input.type,
      number,
      amount_cents: input.amount_cents,
      status: "draft",
      due_date: input.due_date || null,
      line_items: input.line_items,
    }).select().single()

    if (error) return { error: error.message }

    await supabase.from("events").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      name: "invoice_created",
      payload: { invoice_id: data.id, invoice_number: number, amount_cents: input.amount_cents },
    })

    return data as unknown as Invoice
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create invoice" }
  }
}

export async function updateInvoiceStatus(id: string, status: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const updates: Record<string, unknown> = { status }
    if (status === "sent") updates.sent_at = new Date().toISOString()
    if (status === "paid") updates.paid_at = new Date().toISOString()

    const { error } = await supabase.from("invoices").update(updates).eq("id", id)
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update invoice" }
  }
}

export async function getInvoiceSummary() {
  try {
    const supabase = await createClient()
    const { data: invoices, error } = await supabase.from("invoices").select("*")
    if (error || !invoices) {
      return { total_cents: 0, outstanding_cents: 0, overdue_cents: 0, paid_cents: 0, count: 0, overdue_count: 0 }
    }

    const total = invoices.reduce((s, i) => s + i.amount_cents, 0)
    const paid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount_cents, 0)
    const outstanding = invoices.filter(i => ["sent", "viewed", "draft"].includes(i.status)).reduce((s, i) => s + i.amount_cents, 0)
    const overdue = invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount_cents, 0)

    return {
      total_cents: total,
      outstanding_cents: outstanding,
      overdue_cents: overdue,
      paid_cents: paid,
      count: invoices.length,
      overdue_count: invoices.filter(i => i.status === "overdue" || (i.status === "sent" && i.due_date && new Date(i.due_date) < new Date())).length,
    }
  } catch {
    return { total_cents: 0, outstanding_cents: 0, overdue_cents: 0, paid_cents: 0, count: 0, overdue_count: 0 }
  }
}
