"use server"

import { createClient } from "@/lib/supabase/server"
import type { Project, CreateProjectInput } from "@/types/database"

export async function listProjects(params?: {
  status?: string
  phase?: string
  search?: string
}): Promise<Project[]> {
  try {
    const supabase = await createClient()
    let query = supabase.from("projects").select(`
      *,
      client:organizations!projects_client_org_id_fkey (*),
      project_manager:people!projects_project_manager_id_fkey (*)
    `).order("created_at", { ascending: false })

    if (params?.status && params.status !== "all") {
      query = params.status === "active"
        ? query.in("status", ["onboarding", "active"])
        : query.eq("status", params.status)
    }
    if (params?.phase && params.phase !== "all") {
      query = query.eq("phase", params.phase)
    }
    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`)
    }

    const { data, error } = await query
    if (error) return []
    return data as unknown as Project[]
  } catch {
    return []
  }
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("projects").select(`
      *,
      client:organizations!projects_client_org_id_fkey (*),
      project_manager:people!projects_project_manager_id_fkey (*),
      deal:deals (*)
    `).eq("id", id).single()
    if (error) return null
    return data as unknown as Project
  } catch {
    return null
  }
}

export async function createProject(input: CreateProjectInput): Promise<Project | { error: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { data, error } = await supabase.from("projects").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      client_org_id: input.client_org_id,
      deal_id: input.deal_id || null,
      name: input.name,
      type: input.type,
      description: input.description || null,
      contract_value_cents: input.contract_value_cents || 0,
      status: "onboarding",
      phase: "discovery",
      start_date: input.start_date || null,
      target_launch_date: input.target_launch_date || null,
      project_manager_id: input.project_manager_id || null,
      assigned_to: input.assigned_to || null,
      reviewer_id: input.reviewer_id || null,
    }).select().single()

    if (error) return { error: error.message }

    await supabase.from("events").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      name: "project_created",
      payload: { project_id: data.id, project_name: data.name },
    })

    return data as unknown as Project
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create project" }
  }
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("projects").update({
      ...updates,
      updated_at: new Date().toISOString(),
    }).eq("id", id)
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update project" }
  }
}

export async function deleteProject(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("projects").delete().eq("id", id)
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete project" }
  }
}

export async function updateProjectPhase(id: string, phase: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("projects").update({
      phase,
      updated_at: new Date().toISOString(),
    }).eq("id", id)
    if (error) return { error: error.message }

    await supabase.from("events").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      name: "project_phase_changed",
      payload: { project_id: id, new_phase: phase },
    })

    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update phase" }
  }
}
