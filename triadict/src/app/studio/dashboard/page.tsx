"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { 
  TrendingUp, 
  FolderKanban, 
  FileText, 
  DollarSign,
  ArrowUpRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
} from "lucide-react"
import { getDashboardMetrics, getRevenueByMonth, getPipelineByStage } from "@/lib/db/dashboard"
import { listDeals } from "@/lib/db/deals"
import { listProjects } from "@/lib/db/projects"
import { listTasks } from "@/lib/db/tasks"
import { listEvents } from "@/lib/db/events"
import { LoadingState } from "@/components/ui/LoadingState"
import type { Deal } from "@/types/database"

interface Metric {
  label: string
  value: string
  change: string
  trend: string
  icon: React.ElementType
  color: string
}

export default function StudioDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [recentDeals, setRecentDeals] = useState<{ id: string; name: string; stage: string; value_cents: number; payment_gate_status: Deal["payment_gate_status"] }[]>([])
  const [allDeals, setAllDeals] = useState<Deal[]>([])
  const [activeProjects, setActiveProjects] = useState<{ id: string; name: string; phase: string; progress: number }[]>([])
  const [upcomingTasks, setUpcomingTasks] = useState<{ id: string; title: string; due_date: string | null; priority: string }[]>([])
  const [recentActivity, setRecentActivity] = useState<{ name: string; created_at: string }[]>([])
  const [attentionDeals, setAttentionDeals] = useState<{ id: string; name: string; stage: string; next_action: string | null; next_action_at: string | null }[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [dash, deals, projects, tasks, events] = await Promise.all([
        getDashboardMetrics(),
        listDeals(),
        listProjects({ status: "active" }),
        listTasks({ status: "all" }),
        listEvents({ limit: 10 }),
      ])

      const mrr = (dash as Record<string, unknown>).monthly_recurring_cents ? `$${((dash as Record<string, number>).monthly_recurring_cents / 100).toLocaleString()}` : "$0"

      setMetrics([
        {
          label: "Active Deals",
          value: `${dash.pipeline_count}`,
          change: `${dash.active_projects} projects`,
          trend: "up",
          icon: TrendingUp,
          color: "text-coral"
        },
        {
          label: "Active Projects",
          value: `${dash.active_projects}`,
          change: `${dash.total_projects} total`,
          trend: "neutral",
          icon: FolderKanban,
          color: "text-forest"
        },
        {
          label: "Overdue Invoices",
          value: `${dash.overdue_invoices}`,
          change: `$${(dash.outstanding_cents / 100).toLocaleString()} outstanding`,
          trend: "warning",
          icon: AlertCircle,
          color: "text-gold"
        },
        {
          label: "MRR",
          value: mrr,
          change: `${dash.win_rate}% win rate`,
          trend: "up",
          icon: DollarSign,
          color: "text-inkblue"
        }
      ])

      setRecentDeals(deals.slice(0, 5).map(d => ({
        id: d.id, name: d.name,
        stage: d.stage,
        value_cents: d.value_cents,
        payment_gate_status: d.payment_gate_status,
      })))
      setAllDeals(deals)

      setActiveProjects(projects.slice(0, 5).map(p => ({
        id: p.id, name: p.name,
        phase: p.phase,
        progress: 0,
      })))

      const now = new Date()
      const overdue = deals.filter(d =>
        d.next_action_at && new Date(d.next_action_at) < now &&
        !["won_kickoff", "won", "lost", "cancelled"].includes(d.stage)
      ).slice(0, 5)
      setAttentionDeals(overdue)

      const allTasks = await listTasks({ status: "all" })
      const sorted = allTasks
        .filter(t => t.status !== "done")
        .sort((a, b) => {
          if (!a.due_date) return 1
          if (!b.due_date) return -1
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        })
        .slice(0, 5)
      setUpcomingTasks(sorted)

      setRecentActivity(events.slice(0, 8))
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      lead: "bg-mute/10 text-mute",
      researching: "bg-mute/10 text-mute",
      outreach_ready: "bg-inkblue/10 text-inkblue",
      engaged: "bg-inkblue/10 text-inkblue",
      discovery_scheduled: "bg-gold/10 text-gold",
      discovery_completed: "bg-gold/10 text-gold",
      scoping: "bg-coral/10 text-coral",
      proposal_sent: "bg-coral/10 text-coral",
      negotiation: "bg-coral/10 text-coral",
      agreement_sent: "bg-forest/10 text-forest",
      awaiting_initial_payment: "bg-gold/10 text-gold",
      won_kickoff: "bg-forest/10 text-forest",
      won: "bg-forest/10 text-forest",
      lost: "bg-red-500/10 text-red-500",
      cancelled: "bg-mute/10 text-mute",
    }
    return colors[stage] || "bg-mute/10 text-mute"
  }

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      discovery: "bg-inkblue/10 text-inkblue",
      design: "bg-coral/10 text-coral",
      build: "bg-gold/10 text-gold",
      internal_qa: "bg-forest/10 text-forest",
      client_review: "bg-inkblue/10 text-inkblue",
      post_launch_monitoring: "bg-mute/10 text-mute",
      launch: "bg-mute/10 text-mute"
    }
    return colors[phase] || "bg-mute/10 text-mute"
  }

  if (loading) return <LoadingState />

  return (
    <div className="space-y-8">
      {attentionDeals.length > 0 && (
        <div className="bg-coral/5 border border-coral/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-coral" />
            <h2 className="font-sans font-medium text-sm text-coral">Attention Required</h2>
          </div>
          <div className="space-y-2">
            {attentionDeals.map(deal => (
              <Link key={deal.id} href={`/studio/deals/${deal.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-coral/5 transition-colors group">
                <span className="text-sm text-ink group-hover:text-coral transition-colors">{deal.name}</span>
                {deal.next_action && <span className="text-xs text-mute">{deal.next_action}</span>}
                <span className="text-xs text-coral ml-auto">
                  Overdue: {new Date(deal.next_action_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {allDeals.filter(d => {
        const gate = d.payment_gate_status
        return gate && (
          !gate.scope_agreed || !gate.agreement_signed || !gate.sow_approved || !gate.initial_payment_received
        ) && !["won_kickoff", "won", "lost", "cancelled"].includes(d.stage)
      }).length > 0 && (
        <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-gold" />
            <h2 className="font-sans font-medium text-sm text-gold">Payment Gate Blockers</h2>
          </div>
          <div className="space-y-2">
            {allDeals.filter(d => {
              const gate = d.payment_gate_status
              return gate && (
                !gate.scope_agreed || !gate.agreement_signed || !gate.sow_approved || !gate.initial_payment_received
              ) && !["won_kickoff", "won", "lost", "cancelled"].includes(d.stage)
            }).slice(0, 5).map(deal => {
              const gate = deal.payment_gate_status!
              const blockers: string[] = []
              if (!gate.scope_agreed) blockers.push("Scope")
              if (!gate.agreement_signed) blockers.push("Agreement")
              if (!gate.sow_approved) blockers.push("SOW")
              if (!gate.initial_payment_received) blockers.push("Payment")
              return (
                <Link key={deal.id} href={`/studio/deals/${deal.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gold/5 transition-colors group">
                  <span className="text-sm text-ink group-hover:text-gold transition-colors">{deal.name}</span>
                  <span className="text-xs text-mute">Missing: {blockers.join(", ")}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex items-end justify-between">
        <div>
          <p className="text-mute text-sm font-sans mb-1">{getGreeting()}</p>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight text-ink">
            Dashboard
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link 
            href="/studio/deals"
            className="px-4 py-2 text-sm font-sans text-mute hover:text-ink hover:bg-paper2 rounded-lg transition-colors"
          >
            View Pipeline
          </Link>
          <Link 
            href="/studio/projects"
            className="px-4 py-2 text-sm font-sans bg-ink text-paper rounded-lg hover:bg-charcoal transition-colors"
          >
            <Plus className="w-4 h-4 mr-2 inline" />
            New Project
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div 
            key={metric.label}
            className="bg-paper border border-hairline rounded-xl p-5 hover:border-coral/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-mute text-sm font-sans">{metric.label}</span>
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-display text-ink">{metric.value}</span>
              <span className="text-xs font-sans text-mute">{metric.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-paper border border-hairline rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl text-ink">Active Projects</h2>
            <Link 
              href="/studio/projects"
              className="text-sm font-sans text-coral hover:text-coral/80 flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          {activeProjects.length > 0 ? (
            <div className="space-y-4">
              {activeProjects.map((project) => (
                <div 
                  key={project.id}
                  className="flex items-center justify-between p-4 bg-paper2 rounded-lg hover:bg-hairline/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-ink/5 flex items-center justify-center">
                      <FolderKanban className="w-5 h-5 text-ink" />
                    </div>
                    <div>
                      <h3 className="font-sans font-medium text-ink">{project.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPhaseColor(project.phase)}`}>
                        {project.phase.charAt(0).toUpperCase() + project.phase.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-mute text-center py-8">No active projects</p>
          )}
        </div>

        <div className="bg-paper border border-hairline rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl text-ink">Pipeline</h2>
            <Link 
              href="/studio/deals"
              className="text-sm font-sans text-coral hover:text-coral/80 flex items-center gap-1"
            >
              View all <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          {recentDeals.length > 0 ? (
            <div className="space-y-3">
              {recentDeals.map((deal) => (
                <div 
                  key={deal.id}
                  className="p-3 bg-paper2 rounded-lg hover:bg-hairline/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-sans font-medium text-ink text-sm">{deal.name}</h3>
                    <span className="text-sm font-sans text-ink">${(deal.value_cents / 100).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStageColor(deal.stage)}`}>
                      {deal.stage.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-mute text-center py-8">No deals in pipeline</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          href="/studio/deals"
          className="flex items-center gap-4 p-4 bg-paper border border-hairline rounded-xl hover:border-coral/30 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center group-hover:bg-coral/20 transition-colors">
            <TrendingUp className="w-6 h-6 text-coral" />
          </div>
          <div>
            <h3 className="font-sans font-medium text-ink">View Pipeline</h3>
            <p className="text-sm text-mute">{metrics[0]?.value || "$0"} in pipeline</p>
          </div>
        </Link>
        <Link 
          href="/studio/invoices"
          className="flex items-center gap-4 p-4 bg-paper border border-hairline rounded-xl hover:border-gold/30 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
            <FileText className="w-6 h-6 text-gold" />
          </div>
          <div>
            <h3 className="font-sans font-medium text-ink">Send Invoice</h3>
            <p className="text-sm text-mute">{metrics[2]?.value || "$0"} outstanding</p>
          </div>
        </Link>
        <Link 
          href="/studio/knowledge"
          className="flex items-center gap-4 p-4 bg-paper border border-hairline rounded-xl hover:border-inkblue/30 transition-colors group"
        >
          <div className="w-12 h-12 rounded-xl bg-inkblue/10 flex items-center justify-center group-hover:bg-inkblue/20 transition-colors">
            <CheckCircle2 className="w-6 h-6 text-inkblue" />
          </div>
          <div>
            <h3 className="font-sans font-medium text-ink">Knowledge Base</h3>
            <p className="text-sm text-mute">Processes & playbooks</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-paper border border-hairline rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl text-ink">Upcoming Tasks</h2>
            <button className="text-sm font-sans text-coral hover:text-coral/80">
              View all
            </button>
          </div>
          {upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 p-3 bg-paper2 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === "critical" || task.priority === "high" ? "bg-coral" : 
                    task.priority === "medium" ? "bg-gold" : "bg-inkblue"
                  }`} />
                  <div className="flex-1">
                    <p className="font-sans text-sm text-ink">{task.title}</p>
                    <p className="text-xs text-mute">
                      {task.due_date ? `Due ${new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : "No due date"}
                    </p>
                  </div>
                  {task.due_date && new Date(task.due_date) < new Date() && (
                    <AlertCircle className="w-4 h-4 text-coral" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-mute text-center py-8">No upcoming tasks</p>
          )}
        </div>

        <div className="bg-paper border border-hairline rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl text-ink">Recent Activity</h2>
          </div>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((event, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="w-2 h-2 rounded-full bg-coral/50 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">
                      {event.name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-xs text-mute">
                      {new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-mute text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  )
}
