"use server"

import { createClient } from "@/lib/supabase/server"
import type { Person, Organization } from "@/types/database"

export async function getCurrentPerson(): Promise<(Person & { organization?: Organization }) | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from("people")
      .select("*, organization:organizations!people_org_id_fkey (*)")
      .eq("supabase_user_id", user.id)
      .single()

    if (error || !data) return null
    return data as unknown as Person & { organization?: Organization }
  } catch {
    return null
  }
}

export async function updateProfile(input: { full_name?: string; email?: string; phone?: string; avatar_url?: string }): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const updates: Record<string, unknown> = {}
    if (input.full_name) updates.full_name = input.full_name
    if (input.email) updates.email = input.email
    if (input.phone) updates.phone = input.phone
    if (input.avatar_url) updates.avatar_url = input.avatar_url

    const { error } = await supabase.from("people").update(updates).eq("supabase_user_id", user.id)
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update profile" }
  }
}

export async function updateOrgSettings(settings: Record<string, unknown>): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const { data: person } = await supabase.from("people").select("org_id").eq("supabase_user_id", user.id).single()
    if (!person) return { error: "No organization found" }

    const { data: org } = await supabase.from("organizations").select("settings").eq("id", person.org_id).single()
    const currentSettings = (org?.settings as Record<string, unknown>) || {}

    const { error } = await supabase.from("organizations").update({
      settings: { ...currentSettings, ...settings },
    }).eq("id", person.org_id)

    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update settings" }
  }
}
