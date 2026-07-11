"use server"

import { createClient } from "@/lib/supabase/server"
import type { Client, ClientStatus, ClientHealth, CreateClientInput, Organization, ServiceCategory } from "@/types/database"

function getDefaultWorkstreams(serviceCategory?: ServiceCategory | null): string[] {
  switch (serviceCategory) {
    case "websites":
      return ["Design", "Development", "Content", "Launch"]
    case "monthly_optimization":
      return ["Setup", "Monitoring", "Reporting"]
    case "ai_agents":
    case "ai_email":
    case "lead_response":
    case "crm_automation":
    case "whatsapp_sms":
    case "appointment_systems":
    case "ai_knowledge":
      return ["Discovery", "Build", "Integration", "Testing"]
    case "custom_dashboards":
      return ["Discovery", "Design", "Development", "Launch"]
    default:
      return ["Design", "Development", "Content", "Launch"]
  }
}

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

export async function convertDealToClient(
  dealId: string,
  options?: { createProject?: boolean; projectName?: string; sendOnboarding?: boolean; dealValue?: number; serviceCategory?: string }
): Promise<Client | { error: string }> {
  try {
    const supabase = await createClient()

    // 1. Look up the deal with its company
    const { data: deal, error: dealErr } = await supabase
      .from("deals")
      .select("*, company:companies!deals_company_id_fkey(*)")
      .eq("id", dealId)
      .single()

    if (dealErr || !deal) return { error: "Deal not found" }

    const company = deal.company as { org_id: string; name: string } | null
    if (!company?.org_id) return { error: "Deal has no associated company" }

    const orgId = company.org_id

    // 2. Check if already a client
    const existing = await supabase.from("clients").select("id").eq("org_id", orgId).maybeSingle()
    if (existing.data) return { error: "Company is already a client" }

    // 3. Create client
    const { data: client, error: clientErr } = await supabase.from("clients").insert({
      org_id: orgId,
      client_since: new Date().toISOString().split("T")[0],
      status: "active",
      health: "green",
      expansion_potential: "low",
      communication_preference: "email",
    }).select().single()

    if (clientErr) return { error: clientErr.message }

    // 4. Mark deal won
    await supabase.from("deals").update({
      stage: "won",
      probability: 100,
      updated_at: new Date().toISOString(),
    }).eq("id", dealId)

    // 5. Optionally create project
    if (options?.createProject) {
      const projectName = options.projectName || `${company.name} — Website`
      await supabase.from("projects").insert({
        org_id: "00000000-0000-0000-0000-000000000001",
        client_org_id: orgId,
        deal_id: dealId,
        name: projectName,
        type: "website",
        service_category: options.serviceCategory || deal.service_category || null,
        contract_value_cents: options.dealValue ?? deal.value_cents ?? 0,
        status: "onboarding",
        phase: "discovery",
      })

      // Create default workstreams on the deal if none exist
      const { count } = await supabase.from("workstreams")
        .select("id", { count: "exact", head: true })
        .eq("deal_id", dealId)

      if (!count) {
        const category = options.serviceCategory || deal.service_category
        const labels = getDefaultWorkstreams(category)
        const workstreams = labels.map((label, i) => ({
          deal_id: dealId,
          label,
          status: "needs_discovery" as const,
          sort_order: i,
        }))
        await supabase.from("workstreams").insert(workstreams)
      }
    }

    // 6. Log event
    await supabase.from("events").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      name: "deal_won",
      payload: { deal_id: dealId, client_org_id: orgId, options },
    })

    return client as Client
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to convert deal" }
  }
}

export async function updateClient(id: string, input: Partial<CreateClientInput & { status: ClientStatus; health: ClientHealth; notes: string }>): Promise<Client | { error: string }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("clients").update({
      ...input,
      updated_at: new Date().toISOString(),
    }).eq("id", id).select().single()

    if (error) return { error: error.message }
    return data as Client
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update client" }
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
