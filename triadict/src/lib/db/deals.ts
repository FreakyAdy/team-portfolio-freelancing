"use server"

import { createClient } from "@/lib/supabase/server"
import type { Deal, CreateDealInput, UpdateDealInput, UpdateDealStageInput, DealStage, Workstream } from "@/types/database"
import { mockDeals, mockWorkstreams } from "./mock-data"

export async function listDeals(params?: {
  stage?: string
  search?: string
  assigned_to?: string
}): Promise<Deal[]> {
  try {
    const supabase = await createClient()
    let query = supabase.from("deals").select(`
      *,
      assignee:people!deals_assigned_to_fkey (*),
      lead:leads (*),
      workstreams:workstreams (*)
    `).order("created_at", { ascending: false })

    if (params?.stage && params.stage !== "all") {
      query = query.eq("stage", params.stage)
    }
    if (params?.assigned_to) {
      query = query.eq("assigned_to", params.assigned_to)
    }
    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%`)
    }

    const { data, error } = await query
    if (error) return []
    return data as unknown as Deal[]
  } catch {
    let result = mockDeals
    if (params?.stage && params.stage !== "all") {
      result = result.filter(d => d.stage === params.stage)
    }
    if (params?.assigned_to) {
      result = result.filter(d => d.assigned_to === params.assigned_to)
    }
    if (params?.search) {
      const q = params.search.toLowerCase()
      result = result.filter(d => d.name.toLowerCase().includes(q))
    }
    return result
  }
}

export async function getDeal(id: string): Promise<Deal | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("deals").select(`
      *,
      assignee:people!deals_assigned_to_fkey (*),
      lead:leads (*),
      workstreams:workstreams (*)
    `).eq("id", id).single()
    if (error) return null
    return data as unknown as Deal
  } catch {
    return mockDeals.find(d => d.id === id) || null
  }
}

export async function createDeal(input: CreateDealInput): Promise<Deal | { error: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { data, error } = await supabase.from("deals").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      name: input.name,
      stage: "researching",
      value_cents: input.value_cents,
      probability: input.probability,
      source: input.source || null,
      source_detail: input.source_detail || null,
      how_it_started: input.how_it_started || null,
      relationship_context: input.relationship_context || null,
      company_name: input.company_name || null,
      website: input.website || null,
      contact_email: input.contact_email || null,
      contact_phone: input.contact_phone || null,
      country: input.country || null,
      timezone: input.timezone || null,
      industry: input.industry || null,
      business_description: input.business_description || null,
      current_situation: input.current_situation || null,
      services_interested: input.services_interested || [],
      strongest_problem: input.strongest_problem || null,
      personalization_angle: input.personalization_angle || null,
      notes: input.notes || null,
      primary_contact_id: input.primary_contact_id || null,
      expected_close_date: input.expected_close_date || null,
      assigned_to: input.assigned_to || null,
    }).select().single()

    if (error) return { error: error.message }
    return data as unknown as Deal
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create deal" }
  }
}

export async function updateDealStage(input: UpdateDealStageInput): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("deals").update({
      stage: input.stage,
      updated_at: new Date().toISOString(),
    }).eq("id", input.id)

    if (error) return { error: error.message }

    await supabase.from("events").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      name: "deal_stage_changed",
      payload: { deal_id: input.id, new_stage: input.stage },
    })

    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update deal stage" }
  }
}

export async function updateDeal(id: string, updates: Partial<Deal>): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("deals").update({
      ...updates,
      updated_at: new Date().toISOString(),
    }).eq("id", id)
    if (error) return { error: error.message }

    await supabase.from("events").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      name: "deal_updated",
      payload: { deal_id: id, fields: Object.keys(updates) },
    })

    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update deal" }
  }
}

export async function updateDealFields(input: UpdateDealInput): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { id, ...fields } = input
    const { error } = await supabase.from("deals").update({
      ...fields,
      updated_at: new Date().toISOString(),
    }).eq("id", id)
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update deal" }
  }
}

export async function getDealEvents(dealId: string): Promise<{ name: string; payload: Record<string, unknown>; created_at: string }[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("events")
      .select("name, payload, created_at")
      .or(`payload->>deal_id.eq.${dealId},payload->>opportunity_id.eq.${dealId}`)
      .order("created_at", { ascending: false })
      .limit(50)
    if (error) return []
    return data
  } catch {
    return []
  }
}

export async function markDealLost(id: string, reason: string, notes?: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("deals").update({
      stage: "lost",
      lost_reason: reason,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    }).eq("id", id)
    if (error) return { error: error.message }

    await supabase.from("events").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      name: "deal_lost",
      payload: { deal_id: id, reason },
    })

    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to mark deal lost" }
  }
}

export async function markDealWon(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("deals").update({
      stage: "won",
      probability: 100,
      updated_at: new Date().toISOString(),
    }).eq("id", id)
    if (error) return { error: error.message }

    await supabase.from("events").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      name: "deal_won",
      payload: { deal_id: id },
    })

    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to mark deal won" }
  }
}

export async function deleteDeal(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("deals").delete().eq("id", id)
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete deal" }
  }
}

export async function getPipelineSummary() {
  try {
    const supabase = await createClient()
    const { data: deals, error } = await supabase.from("deals").select("*")
    if (error || !deals) return { total: 0, totalValue: 0, weighted: 0, avg: 0, winRate: 0, wonCount: 0, byStage: [] }

    const total = deals.length
    const totalValue = deals.reduce((s, d) => s + d.value_cents, 0)
    const weightedValue = deals.reduce((s, d) => s + (d.value_cents * d.probability / 100), 0)
    const wonCount = deals.filter(d => d.stage === "won").length
    const lostCount = deals.filter(d => d.stage === "lost").length
    const closedCount = wonCount + lostCount

    const stages = ["lead", "researching", "outreach_ready", "engaged", "discovery_scheduled", "discovery_completed", "scoping", "proposal_sent", "negotiation", "agreement_sent", "awaiting_initial_payment", "won_kickoff", "won", "lost", "cancelled"]
    const byStage = stages.map(stage => ({
      stage,
      count: deals.filter(d => d.stage === stage).length,
      value: deals.filter(d => d.stage === stage).reduce((s, d) => s + d.value_cents, 0),
    }))

    return {
      total,
      totalValue,
      weighted: weightedValue,
      avg: total > 0 ? Math.round(totalValue / total) : 0,
      winRate: closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 0,
      wonCount,
      byStage,
    }
  } catch {
    const deals = mockDeals
    const total = deals.length
    const totalValue = deals.reduce((s, d) => s + d.value_cents, 0)
    const weightedValue = deals.reduce((s, d) => s + (d.value_cents * d.probability / 100), 0)
    const wonCount = deals.filter(d => d.stage === "won").length
    const lostCount = deals.filter(d => d.stage === "lost").length
    const closedCount = wonCount + lostCount
    const stages = ["lead", "researching", "outreach_ready", "engaged", "discovery_scheduled", "discovery_completed", "scoping", "proposal_sent", "negotiation", "agreement_sent", "awaiting_initial_payment", "won_kickoff", "won", "lost", "cancelled"]
    const byStage = stages.map(stage => ({
      stage,
      count: deals.filter(d => d.stage === stage).length,
      value: deals.filter(d => d.stage === stage).reduce((s, d) => s + d.value_cents, 0),
    }))
    return {
      total,
      totalValue,
      weighted: weightedValue,
      avg: total > 0 ? Math.round(totalValue / total) : 0,
      winRate: closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 0,
      wonCount,
      byStage,
    }
  }
}

export async function listWorkstreams(dealId: string): Promise<Workstream[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("workstreams")
      .select("*")
      .eq("deal_id", dealId)
      .order("sort_order", { ascending: true })
    if (error) return []
    return data as Workstream[]
  } catch {
    return mockWorkstreams.filter(w => w.deal_id === dealId).sort((a, b) => a.sort_order - b.sort_order)
  }
}

export async function createWorkstream(input: {
  deal_id: string
  label: string
  description?: string
  creative_freedom?: string
  seo_sensitivity?: string
  estimated_price_cents?: number
}): Promise<Workstream | { error: string }> {
  try {
    const supabase = await createClient()
    const { count } = await supabase.from("workstreams")
      .select("id", { count: "exact", head: true })
      .eq("deal_id", input.deal_id)

    const { data, error } = await supabase.from("workstreams").insert({
      deal_id: input.deal_id,
      label: input.label,
      description: input.description || null,
      creative_freedom: input.creative_freedom || null,
      seo_sensitivity: input.seo_sensitivity || null,
      estimated_price_cents: input.estimated_price_cents || null,
      sort_order: count || 0,
    }).select().single()

    if (error) return { error: error.message }
    return data as Workstream
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create workstream" }
  }
}

export async function updateWorkstream(input: {
  id: string
  label?: string
  description?: string
  creative_freedom?: string
  seo_sensitivity?: string
  scope_notes?: string
  status?: Workstream['status']
  estimated_price_cents?: number
}): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { id, ...updates } = input
    const { error } = await supabase.from("workstreams").update({
      ...updates,
      updated_at: new Date().toISOString(),
    }).eq("id", id)
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update workstream" }
  }
}

export async function deleteWorkstream(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("workstreams").delete().eq("id", id)
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete workstream" }
  }
}
