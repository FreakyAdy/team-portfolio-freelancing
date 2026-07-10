"use server"

import { createClient } from "@/lib/supabase/server"
import type { Template, CreateTemplateInput, UpdateTemplateInput } from "@/types/database"

export async function listTemplates(params?: {
  category?: string
  search?: string
  is_active?: boolean
}): Promise<Template[]> {
  try {
    const supabase = await createClient()
    let query = supabase.from("templates").select("*").order("created_at", { ascending: false })

    if (params?.category) query = query.eq("category", params.category)
    if (params?.is_active !== undefined) query = query.eq("is_active", params.is_active)
    if (params?.search) query = query.or(`name.ilike.%${params.search}%,category.ilike.%${params.search}%`)

    const { data, error } = await query
    if (error) return []
    return data as Template[]
  } catch {
    return []
  }
}

export async function getTemplate(id: string): Promise<Template | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("templates").select("*").eq("id", id).single()
    if (error) return null
    return data as Template
  } catch {
    return null
  }
}

export async function createTemplate(input: CreateTemplateInput): Promise<Template | { error: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { data, error } = await supabase.from("templates").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      name: input.name,
      category: input.category,
      content_md: input.content_md,
      merge_fields: input.merge_fields || [],
      locked_sections: input.locked_sections || [],
      is_active: input.is_active ?? true,
      version: 1,
      created_by: user.id,
    }).select().single()

    if (error) return { error: error.message }
    return data as Template
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create template" }
  }
}

export async function updateTemplate(input: UpdateTemplateInput): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { id, ...updates } = input

    const { error } = await supabase.from("templates").update(updates).eq("id", id)
    if (error) return { error: error.message }

    await supabase.from("events").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      name: "template_updated",
      payload: { template_id: id },
    })

    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update template" }
  }
}

export async function deleteTemplate(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("templates").delete().eq("id", id)
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete template" }
  }
}
