"use server"

import { createClient } from "@/lib/supabase/server"
import type { Client, CreateClientInput, Organization } from "@/types/database"

export async function listClients(params?: {
  status?: string
  health?: string
  search?: string
}): Promise<(Client & { organization?: Organization })[]> {
  try {
    const supabase = await createClient()
    let query = supabase.from("clients").select(`
      *,
      organization:organizations!clients_org_id_fkey (*),
      primary_contact:people!clients_primary_contact_id_fkey (*),
      account_owner:people!clients_account_owner_id_fkey (*)
    `).order("created_at", { ascending: false })

    if (params?.status && params.status !== "all") query = query.eq("status", params.status)
    if (params?.health && params.health !== "all") query = query.eq("health", params.health)

    const { data, error } = await query
    if (error) return []
    return data as unknown as (Client & { organization?: Organization })[]
  } catch {
    return []
  }
}

export async function getClient(id: string): Promise<(Client & { organization?: Organization }) | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("clients").select(`
      *,
      organization:organizations!clients_org_id_fkey (*),
      primary_contact:people!clients_primary_contact_id_fkey (*),
      account_owner:people!clients_account_owner_id_fkey (*)
    `).eq("id", id).single()
    if (error) return null
    return data as unknown as (Client & { organization?: Organization })
  } catch {
    return null
  }
}

export async function addClient(input: CreateClientInput): Promise<Client | { error: string }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("clients").insert({
      org_id: input.org_id,
      primary_contact_id: input.primary_contact_id || null,
      account_owner_id: input.account_owner_id || null,
      client_since: input.client_since || new Date().toISOString().split("T")[0],
      communication_preference: input.communication_preference || "email",
      status: "active",
      health: "green",
      expansion_potential: "low",
      notes: input.notes || null,
    }).select().single()

    if (error) return { error: error.message }
    return data as Client
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create client" }
  }
}

export async function convertDealToClient(dealId: string, orgId: string): Promise<Client | { error: string }> {
  try {
    const supabase = await createClient()
    const existing = await supabase.from("clients").select("id").eq("org_id", orgId).maybeSingle()
    if (existing.data) return { error: "Company is already a client" }

    const { data, error } = await supabase.from("clients").insert({
      org_id: orgId,
      client_since: new Date().toISOString().split("T")[0],
      status: "active",
      health: "green",
      expansion_potential: "low",
      communication_preference: "email",
    }).select().single()

    if (error) return { error: error.message }

    await supabase.from("deals").update({ stage: "won", updated_at: new Date().toISOString() }).eq("id", dealId)
    await supabase.from("events").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      name: "deal_won",
      payload: { deal_id: dealId, client_org_id: orgId },
    })

    return data as Client
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to convert deal" }
  }
}

export async function getClientMetrics() {
  try {
    const supabase = await createClient()
    const { data: clients, error } = await supabase.from("clients").select("*")
    if (error || !clients) {
      return { total: 0, active: 0, at_risk: 0 }
    }
    return {
      total: clients.length,
      active: clients.filter(c => c.status === "active").length,
      onboarding: clients.filter(c => c.status === "onboarding").length,
      at_risk: clients.filter(c => c.status === "at_risk").length,
      churned: clients.filter(c => c.status === "churned").length,
    }
  } catch {
    return { total: 0, active: 0, at_risk: 0 }
  }
}
