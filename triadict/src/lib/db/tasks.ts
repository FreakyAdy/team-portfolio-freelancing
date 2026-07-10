"use server"

import { createClient } from "@/lib/supabase/server"
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/database"

export async function listTasks(params?: {
  project_id?: string
  assignee_id?: string
  status?: string
  priority?: string
  search?: string
}): Promise<Task[]> {
  try {
    const supabase = await createClient()
    let query = supabase.from("tasks").select(`
      *,
      assignee:people!tasks_assignee_id_fkey (*),
      reviewer:people!tasks_reviewer_id_fkey (*)
    `).order("created_at", { ascending: false })

    if (params?.project_id) query = query.eq("project_id", params.project_id)
    if (params?.assignee_id) query = query.eq("assignee_id", params.assignee_id)
    if (params?.status && params.status !== "all") query = query.eq("status", params.status)
    if (params?.priority && params.priority !== "all") query = query.eq("priority", params.priority)
    if (params?.search) query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)

    const { data, error } = await query
    if (error) return []
    return data as unknown as Task[]
  } catch {
    return []
  }
}

export async function createTask(input: CreateTaskInput): Promise<Task | { error: string }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("tasks").insert({
      org_id: "00000000-0000-0000-0000-000000000001",
      project_id: input.project_id || null,
      client_org_id: input.client_org_id || null,
      title: input.title,
      description: input.description || null,
      priority: input.priority || "medium",
      work_type: input.work_type || null,
      assignee_id: input.assignee_id || null,
      reviewer_id: input.reviewer_id || null,
      due_date: input.due_date || null,
      estimated_effort_hours: input.estimated_effort_hours || null,
      status: "backlog",
    }).select().single()

    if (error) return { error: error.message }
    return data as unknown as Task
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create task" }
  }
}

export async function updateTask(input: UpdateTaskInput): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (input.title !== undefined) updates.title = input.title
    if (input.description !== undefined) updates.description = input.description
    if (input.status !== undefined) updates.status = input.status
    if (input.priority !== undefined) updates.priority = input.priority
    if (input.assignee_id !== undefined) updates.assignee_id = input.assignee_id
    if (input.reviewer_id !== undefined) updates.reviewer_id = input.reviewer_id
    if (input.due_date !== undefined) updates.due_date = input.due_date
    if (input.estimated_effort_hours !== undefined) updates.estimated_effort_hours = input.estimated_effort_hours
    if (input.actual_effort_hours !== undefined) updates.actual_effort_hours = input.actual_effort_hours
    if (input.blocked !== undefined) updates.blocked = input.blocked
    if (input.blocker_description !== undefined) updates.blocker_description = input.blocker_description
    if (input.waiting_on !== undefined) updates.waiting_on = input.waiting_on

    if (input.status === "done" || input.status === "in_progress") {
      if (input.status === "done") updates.completed_at = new Date().toISOString()
      if (input.status === "in_progress") updates.blocked = false
    }

    const { error } = await supabase.from("tasks").update(updates).eq("id", input.id)
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update task" }
  }
}

export async function deleteTask(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("tasks").delete().eq("id", id)
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete task" }
  }
}

export async function getTaskSummary(projectId?: string) {
  try {
    const supabase = await createClient()
    let query = supabase.from("tasks").select("*")
    if (projectId) query = query.eq("project_id", projectId)

    const { data: tasks, error } = await query
    if (error || !tasks) {
      return { total: 0, completed: 0, overdue: 0, blocked: 0, inProgress: 0, byPriority: { critical: 0, high: 0, medium: 0, low: 0 } }
    }

    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === "done").length,
      overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done").length,
      blocked: tasks.filter(t => t.blocked).length,
      inProgress: tasks.filter(t => t.status === "in_progress").length,
      byPriority: {
        critical: tasks.filter(t => t.priority === "critical").length,
        high: tasks.filter(t => t.priority === "high").length,
        medium: tasks.filter(t => t.priority === "medium").length,
        low: tasks.filter(t => t.priority === "low").length,
      },
    }
  } catch {
    return { total: 0, completed: 0, overdue: 0, blocked: 0, inProgress: 0, byPriority: { critical: 0, high: 0, medium: 0, low: 0 } }
  }
}
