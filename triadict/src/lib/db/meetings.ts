"use server"

import { createClient } from "@/lib/supabase/server"
import type { Meeting, CreateMeetingInput } from "@/types/database"

export async function listMeetings(params?: {
  company_id?: string
  project_id?: string
  type?: string
}): Promise<Meeting[]> {
  try {
    const supabase = await createClient()
    let query = supabase.from("meetings").select(`
      *,
      owner:people!meetings_owner_id_fkey (*)
    `).order("meeting_date", { ascending: false })

    if (params?.company_id) query = query.eq("company_id", params.company_id)
    if (params?.project_id) query = query.eq("project_id", params.project_id)
    if (params?.type && params.type !== "all") query = query.eq("type", params.type)

    const { data, error } = await query
    if (error) return []
    return data as unknown as Meeting[]
  } catch {
    return []
  }
}

export async function createMeeting(input: CreateMeetingInput): Promise<Meeting | { error: string }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("meetings").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      company_id: input.company_id || null,
      opportunity_id: input.opportunity_id || null,
      project_id: input.project_id || null,
      title: input.title,
      type: input.type,
      owner_id: input.owner_id || null,
      meeting_date: input.meeting_date,
      duration_minutes: input.duration_minutes || null,
      objective: input.objective || null,
      notes: input.notes || null,
      decisions: input.decisions || null,
      next_steps: input.next_steps || null,
      follow_up_date: input.follow_up_date || null,
    }).select().single()

    if (error) return { error: error.message }

    await supabase.from("events").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      name: "meeting_created",
      payload: { meeting_id: data.id, title: data.title, type: data.type },
    })

    return data as unknown as Meeting
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create meeting" }
  }
}

export async function getUpcomingMeetings(limit: number = 5) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("meetings")
      .select("*, owner:people!meetings_owner_id_fkey (*)")
      .gte("meeting_date", new Date().toISOString())
      .order("meeting_date", { ascending: true })
      .limit(limit)

    if (error) return []
    return data as unknown as Meeting[]
  } catch {
    return []
  }
}
