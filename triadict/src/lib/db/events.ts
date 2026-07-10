"use server"

import { createClient } from "@/lib/supabase/server"
import type { Event } from "@/types/database"

export async function listEvents(params?: {
  limit?: number
  entity_type?: string
  entity_id?: string
}): Promise<Event[]> {
  try {
    const supabase = await createClient()
    let query = supabase.from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(params?.limit || 50)

    const { data, error } = await query
    if (error) return []
    return data as Event[]
  } catch {
    return []
  }
}

export async function getRecentActivity(limit: number = 10) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("events")
      .select("*, actor:people(*)")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) return []
    return data as unknown as (Event & { actor?: { full_name?: string } })[]
  } catch {
    return []
  }
}
