"use server"

import { createClient } from "@/lib/supabase/server"

export async function getDashboardMetrics() {
  try {
    const supabase = await createClient()

    const { data: deals } = await supabase.from("deals").select("*")
    const { data: projects } = await supabase.from("projects").select("*")
    const { data: invoices } = await supabase.from("invoices").select("*")
    const { data: payments } = await supabase.from("payments").select("*")
    const { data: tasks } = await supabase.from("tasks").select("*")

    const pipelineValue = (deals || []).reduce((s, d) => s + d.value_cents, 0)
    const activeProjects = (projects || []).filter(p => ["onboarding", "active"].includes(p.status)).length
    const outstandingInvoices = (invoices || []).filter(i => ["sent", "viewed", "draft"].includes(i.status)).length
    const overdueInvoices = (invoices || []).filter(i => i.status === "overdue").length
    const totalCollected = (payments || []).filter(p => p.status === "cleared").reduce((s, p) => s + p.amount_cents, 0)
    const outstandingCents = (invoices || []).filter(i => ["sent", "viewed", "draft"].includes(i.status)).reduce((s, i) => s + i.amount_cents, 0)
    const overdueTasks = (tasks || []).filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done").length
    const blockedTasks = (tasks || []).filter(t => t.blocked).length
    const wonDeals = (deals || []).filter(d => d.stage === "won").length
    const totalDeals = (deals || []).length

    return {
      pipeline_value_cents: pipelineValue,
      pipeline_count: (deals || []).length,
      active_projects: activeProjects,
      total_projects: (projects || []).length,
      outstanding_cents: outstandingCents,
      overdue_invoices: overdueInvoices,
      total_collected_cents: totalCollected,
      won_deals: wonDeals,
      total_deals: totalDeals,
      win_rate: totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0,
      overdue_tasks: overdueTasks,
      blocked_tasks: blockedTasks,
    }
  } catch {
    return {
      pipeline_value_cents: 0, pipeline_count: 0, active_projects: 0, total_projects: 0,
      outstanding_cents: 0, overdue_invoices: 0, total_collected_cents: 0,
      won_deals: 0, total_deals: 0, win_rate: 0, overdue_tasks: 0, blocked_tasks: 0,
    }
  }
}

export async function getRevenueByMonth() {
  try {
    const supabase = await createClient()
    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("status", "cleared")
      .order("received_at", { ascending: true })

    if (error || !payments) return []

    const byMonth: Record<string, number> = {}
    for (const p of payments) {
      if (!p.received_at) continue
      const key = p.received_at.substring(0, 7)
      byMonth[key] = (byMonth[key] || 0) + p.amount_cents
    }

    return Object.entries(byMonth).map(([month, amount]) => ({
      month,
      amount_cents: amount,
    }))
  } catch {
    return []
  }
}

export async function getPipelineByStage() {
  try {
    const supabase = await createClient()
    const { data: deals, error } = await supabase.from("deals").select("*")
    if (error || !deals) return []

    const stages = ["researching", "qualified", "outreach_ready", "contacted", "replied", "positive_reply",
      "discovery_scheduled", "discovery_complete", "scoping", "proposal_sent", "negotiation", "verbal_yes", "won"]

    return stages.map(stage => ({
      stage,
      count: deals.filter(d => d.stage === stage).length,
      value_cents: deals.filter(d => d.stage === stage).reduce((s, d) => s + d.value_cents, 0),
    }))
  } catch {
    return []
  }
}
