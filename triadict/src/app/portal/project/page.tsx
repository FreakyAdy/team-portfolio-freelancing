"use client"

import { useState, useEffect, useCallback } from "react"
import { CheckCircle2, Clock, AlertCircle, FileText } from "lucide-react"
import { listProjects } from "@/lib/db/projects"
import { listTasks } from "@/lib/db/tasks"
import { listEvents } from "@/lib/db/events"
import { LoadingState } from "@/components/ui/LoadingState"
import { EmptyState } from "@/components/ui/EmptyState"

const timelinePhases = [
  { phase: "Discovery", key: "discovery" },
  { phase: "Design", key: "design" },
  { phase: "Build", key: "build" },
  { phase: "QA", key: "qa" },
  { phase: "Launch", key: "launch" },
]

export default function PortalProjectPage() {
  const [project, setProject] = useState<{ id: string; name: string; phase: string; status: string; target_launch_date: string | null } | null>(null)
  const [tasks, setTasks] = useState<{ id: string; title: string; status: string; priority: string; due_date: string | null }[]>([])
  const [activity, setActivity] = useState<{ name: string; created_at: string }[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const projects = await listProjects()
      if (projects.length > 0) {
        setProject(projects[0])
        const [ts, ev] = await Promise.all([
          listTasks({ project_id: projects[0].id }),
          listEvents({ limit: 10 }),
        ])
        setTasks(ts)
        setActivity(ev.slice(0, 5))
      }
    } catch {
      // Graceful
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  if (loading) return <LoadingState />

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState
          icon={FileText}
          title="No project yet"
          description="You haven't been assigned to a project yet."
        />
      </div>
    )
  }

  const currentPhaseIndex = timelinePhases.findIndex(p => p.key === project.phase)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl md:text-4xl tracking-tight text-ink">{project.name}</h1>
        <p className="text-mute text-sm mt-1">
          Status: {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          {project.target_launch_date && ` · Target: ${new Date(project.target_launch_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
        </p>
      </div>

      <div className="bg-paper border border-hairline rounded-xl p-6">
        <h2 className="font-display text-xl tracking-tight mb-6">Timeline</h2>
        <div className="flex items-center gap-2">
          {timelinePhases.map((phase, index) => {
            const isComplete = index < currentPhaseIndex
            const isCurrent = index === currentPhaseIndex
            return (
              <div key={phase.key} className="flex-1 text-center">
                <div className={`h-2 rounded-full mb-2 ${
                  isComplete ? "bg-forest" :
                  isCurrent ? "bg-coral" : "bg-hairline"
                }`} />
                <p className={`text-xs ${isCurrent ? "text-ink font-medium" : "text-mute"}`}>
                  {phase.phase}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {tasks.length > 0 && (
        <div className="bg-paper border border-hairline rounded-xl p-6">
          <h2 className="font-display text-xl tracking-tight mb-4">Tasks</h2>
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-4 p-3 bg-paper2 rounded-lg">
                {task.status === "done" ? (
                  <CheckCircle2 className="w-5 h-5 text-forest flex-shrink-0" />
                ) : task.status === "blocked" ? (
                  <AlertCircle className="w-5 h-5 text-coral flex-shrink-0" />
                ) : (
                  <Clock className={`w-5 h-5 flex-shrink-0 ${
                    task.priority === "high" || task.priority === "critical" ? "text-coral" : "text-mute"
                  }`} />
                )}
                <div className="flex-1">
                  <p className={`text-sm ${task.status === "done" ? "text-mute line-through" : "text-ink"}`}>
                    {task.title}
                  </p>
                  {task.due_date && (
                    <p className="text-xs text-mute">Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  task.status === "done" ? "bg-forest/10 text-forest" :
                  task.status === "in_progress" ? "bg-gold/10 text-gold" :
                  task.status === "blocked" ? "bg-red-500/10 text-red-500" :
                  "bg-mute/10 text-mute"
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activity.length > 0 && (
        <div className="bg-paper border border-hairline rounded-xl p-6">
          <h2 className="font-display text-xl tracking-tight mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {activity.map((event, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <div className="w-2 h-2 rounded-full bg-coral/50 flex-shrink-0" />
                <p className="text-sm text-ink">
                  {event.name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  <span className="text-mute ml-2">{new Date(event.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
