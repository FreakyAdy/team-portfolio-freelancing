"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { 
  FolderKanban, 
  FileText, 
  HeadphonesIcon,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react"
import { getProject } from "@/lib/db/projects"
import { listInvoices } from "@/lib/db/invoices"
import { listTasks } from "@/lib/db/tasks"
import { listEvents } from "@/lib/db/events"
import { LoadingState } from "@/components/ui/LoadingState"
import { EmptyState } from "@/components/ui/EmptyState"

export default function PortalDashboard() {
  const [project, setProject] = useState<{ name: string; phase: string; status: string; target_launch_date: string | null } | null>(null)
  const [invoices, setInvoices] = useState<{ id: string; number: string; amount_cents: number; status: string; due_date: string | null }[]>([])
  const [taskSummary, setTaskSummary] = useState({ total: 0, completed: 0 })
  const [recentActivity, setRecentActivity] = useState<{ name: string; created_at: string }[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [inv, tasks, events] = await Promise.all([
        listInvoices(),
        listTasks({ status: "all" }),
        listEvents({ limit: 5 }),
      ])

      setInvoices(inv)
      setTaskSummary({
        total: tasks.length,
        completed: tasks.filter(t => t.status === "done").length,
      })
      setRecentActivity(events.slice(0, 5))

      const projects = await import("@/lib/db/projects").then(m => m.listProjects())
      if (projects.length > 0) {
        setProject(projects[0])
      }
    } catch {
      // Graceful
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  if (loading) return <LoadingState />

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight text-ink">Dashboard</h1>
        <p className="text-mute text-sm mt-1">
          {project ? `Welcome to your project dashboard` : "Your project overview"}
        </p>
      </div>

      {project ? (
        <div className="bg-paper border border-hairline rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-display text-xl tracking-tight">{project.name}</h2>
              <p className="text-sm text-mute mt-1">
                Phase: <span className="text-ink font-medium">{project.phase.charAt(0).toUpperCase() + project.phase.slice(1)}</span>
                {project.target_launch_date && ` · Target launch: ${new Date(project.target_launch_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
              </p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
              project.status === "active" ? "bg-forest/10 text-forest" :
              project.status === "onboarding" ? "bg-inkblue/10 text-inkblue" :
              "bg-mute/10 text-mute"
            }`}>
              {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-paper border border-hairline rounded-xl p-6">
          <p className="text-mute text-sm">No active projects yet. Your studio will add you to a project soon.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/portal/invoices" className="bg-paper border border-hairline rounded-xl p-5 hover:border-coral/30 transition-colors group">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-5 h-5 text-coral" />
            <h3 className="font-sans font-medium">Invoices</h3>
          </div>
          <p className="text-sm text-mute">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""}</p>
          {invoices.filter(i => i.status === "sent" || i.status === "overdue").length > 0 && (
            <p className="text-xs text-coral mt-1">{invoices.filter(i => i.status === "sent" || i.status === "overdue").length} pending</p>
          )}
        </Link>

        <Link href="/portal/support" className="bg-paper border border-hairline rounded-xl p-5 hover:border-coral/30 transition-colors group">
          <div className="flex items-center gap-3 mb-3">
            <HeadphonesIcon className="w-5 h-5 text-coral" />
            <h3 className="font-sans font-medium">Support</h3>
          </div>
          <p className="text-sm text-mute">Submit a ticket or request</p>
        </Link>
      </div>

      {invoices.length > 0 && (
        <div className="bg-paper border border-hairline rounded-xl p-6">
          <h2 className="font-display text-xl tracking-tight mb-4">Recent Invoices</h2>
          <div className="space-y-3">
            {invoices.slice(0, 3).map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-3 bg-paper2 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{inv.number}</p>
                  <p className="text-xs text-mute">{inv.due_date ? `Due ${new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : "No due date"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">${(inv.amount_cents / 100).toLocaleString()}</p>
                  <span className={`text-xs ${
                    inv.status === "paid" ? "text-forest" :
                    inv.status === "overdue" ? "text-coral" : "text-mute"
                  }`}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentActivity.length > 0 && (
        <div className="bg-paper border border-hairline rounded-xl p-6">
          <h2 className="font-display text-xl tracking-tight mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((event, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <div className="w-2 h-2 rounded-full bg-coral/50 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-ink">{event.name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</p>
                  <p className="text-xs text-mute">{new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
