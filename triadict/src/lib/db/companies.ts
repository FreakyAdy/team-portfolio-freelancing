"use server"

import { createClient } from "@/lib/supabase/server"
import type { Organization } from "@/types/database"
import { mockOrganizations } from "./mock-data"

export async function listCompanies(params?: {
  search?: string
  type?: string
}): Promise<Organization[]> {
  try {
    const supabase = await createClient()
    let query = supabase.from("organizations").select("*").order("created_at", { ascending: false })

    if (params?.type && params.type !== "all") {
      query = query.eq("type", params.type)
    } else {
      query = query.neq("slug", "triadict")
    }
    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%,slug.ilike.%${params.search}%`)
    }

    const { data, error } = await query
    if (error) return []
    return data as Organization[]
  } catch {
    let result = mockOrganizations
    if (params?.type && params.type !== "all") {
      result = result.filter(c => c.type === params.type)
    } else {
      result = result.filter(c => c.slug !== "triadict")
    }
    if (params?.search) {
      const q = params.search.toLowerCase()
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q))
    }
    return result
  }
}

export async function getCompany(id: string): Promise<Organization | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("organizations").select("*").eq("id", id).single()
    if (error) return null
    return data as Organization
  } catch {
    return mockOrganizations.find(c => c.id === id) || null
  }
}

export async function createCompany(input: {
  name: string
  slug?: string
  website?: string
  industry?: string
  country?: string
  city?: string
  notes?: string
}): Promise<Organization | { error: string }> {
  try {
    const supabase = await createClient()
    const slug = input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

    const { data, error } = await supabase.from("organizations").insert({
      name: input.name,
      slug,
      type: "client",
      settings: {
        website: input.website || null,
        industry: input.industry || null,
        country: input.country || null,
        city: input.city || null,
        notes: input.notes || null,
      },
    }).select().single()

    if (error) return { error: error.message }
    return data as Organization
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create company" }
  }
}

export async function updateCompany(id: string, updates: Partial<Organization>): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("organizations").update(updates).eq("id", id)
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update company" }
  }
}
