"use server"

import { createClient } from "@/lib/supabase/server"
import type { Person } from "@/types/database"

export async function listContacts(params?: {
  org_id?: string
  role?: string
  search?: string
}): Promise<Person[]> {
  try {
    const supabase = await createClient()
    let query = supabase.from("people").select("*").order("created_at", { ascending: false })

    if (params?.org_id) {
      query = query.eq("org_id", params.org_id)
    }
    if (params?.role) {
      query = query.eq("role", params.role)
    }
    if (params?.search) {
      const q = `%${params.search}%`
      query = query.or(`full_name.ilike.${q},email.ilike.${q}`)
    }

    const { data, error } = await query
    if (error) return []
    return data as Person[]
  } catch {
    return []
  }
}

export async function getContact(id: string): Promise<Person | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("people").select("*").eq("id", id).single()
    if (error) return null
    return data as Person
  } catch {
    return null
  }
}

export async function createContact(input: {
  org_id: string
  email: string
  full_name: string
  role?: string
  phone?: string
  job_title?: string
}): Promise<Person | { error: string }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("people").insert({
      org_id: input.org_id,
      email: input.email,
      full_name: input.full_name,
      role: input.role || "client_stakeholder",
    }).select().single()

    if (error) return { error: error.message }
    return data as Person
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create contact" }
  }
}

export async function updateContact(id: string, updates: Partial<Person>): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("people").update(updates).eq("id", id)
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update contact" }
  }
}

export async function listTeamMembers(): Promise<Person[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("people")
      .select("*")
      .in("role", ["admin", "engineer", "designer", "strategist"])
      .order("full_name", { ascending: true })
    if (error) return []
    return data as Person[]
  } catch {
    return []
  }
}
