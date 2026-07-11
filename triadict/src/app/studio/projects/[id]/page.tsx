"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, FolderKanban, Building2, Target, ClipboardList,
  MoreHorizontal, AlertCircle, AlertTriangle, Calendar, DollarSign, User,
  CheckCircle2, XCircle, Plus, ChevronDown,
} from "lucide-react"
import { getProject, updateProject, updateProjectPhase, deleteProject } from "@/lib/db/projects"
import { listTasks, createTask, updateTask } from "@/lib/db/tasks"
import { listTeamMembers } from "@/lib/db/contacts"
import { Modal } from "@/components/ui/Modal"
import { LoadingState } from "@/components/ui/LoadingState"
import { TextField } from "@/components/ui/TextField"
import { SelectField } from "@/components/ui/SelectField"
import type { Project, Task, Organization as OrgType, Person, CreateTaskInput } from "@/types/database"

const phases = [
  { id: "discovery", label: "Discovery" },
  { id: "design", label: "Design" },
  { id: "build", label: "Build" },
  { id: "qa", label: "QA" },
  { id: "launch", label: "Launch" },
]

const statusColors: Record<string, string> = {
  onboarding: "bg-inkblue/10 text-inkblue",
  active: "bg-forest/10 text-forest",
  on_hold: "bg-gold/10 text-gold",
  completed: "bg-mute/10 text-mute",
  cancelled: "bg-red-500/10 text-red-500",
}

const taskStatusColors: Record<string, string> = {
  backlog: "bg-mute/10 text-mute",
  ready: "bg-inkblue/10 text-inkblue",
  in_progress: "bg-gold/10 text-gold",
  internal_review: "bg-coral/10 text-coral",
  client_review: "bg-coral/10 text-coral",
  blocked: "bg-red-500/10 text-red-500",
  done: "bg-forest/10 text-forest",
}

const tabs = [
  { id: "overview", label: "Overview", icon: Building2 },
  { id: "tasks", label: "Tasks", icon: ClipboardList },
]

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [teamOptions, setTeamOptions] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [showPhaseMenu, setShowPhaseMenu] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "medium", assignee_id: "" })

  const loadData = useCallback(async () => {
    setLoading(true)
    const [p, t, team] = await Promise.all([
      getProject(projectId),
      listTasks({ project_id: projectId }),
      listTeamMembers(),
    ])
    setProject(p)
    setTasks(t)
    setTeamOptions(team.map(m => ({ value: m.id, label: m.full_name || m.email })))
    setLoading(false)
  }, [projectId])

  useEffect(() => { loadData() }, [loadData])

  const handlePhaseChange = async (phase: string) => {
    await updateProjectPhase(projectId, phase)
    setShowPhaseMenu(false)
    loadData()
  }

  const handleStatusChange = async (status: string) => {
    await updateProject(projectId, { status } as Partial<Project>)
    setShowStatusMenu(false)
    loadData()
  }

  const handleTaskStatusChange = async (taskId: string, status: string) => {
    if (status === "in_progress" && project?.deal && !project.deal.payment_gate_status?.initial_payment_received) {
      if (!confirm("Initial payment has not been recorded for this project. Continue anyway?")) {
        return
      }
    }
    await updateTask({ id: taskId, status } as Parameters<typeof updateTask>[0])
    loadData()
  }

  const handleCreateTask = async () => {
    const result = await createTask({
      project_id: projectId,
      title: taskForm.title,
      description: taskForm.description,
      priority: taskForm.priority as CreateTaskInput["priority"],
      assignee_id: taskForm.assignee_id || undefined,
    })
    if ("error" in result) { alert(result.error); return }
    setShowTaskModal(false)
    setTaskForm({ title: "", description: "", priority: "medium", assignee_id: "" })
    loadData()
  }

  const handleDelete = async () => {
    await deleteProject(projectId)
    router.push("/studio/projects")
  }

  const getPhaseColor = (phase: string) => {
    const p = phases.find(p => p.id === phase)
    return p ? `bg-hairline` : "bg-hairline"
  }

  if (loading) return <LoadingState />
  if (!project) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <AlertCircle className="w-12 h-12 text-mute mx-auto mb-4" />
        <h2 className="font-display text-xl text-ink mb-2">Project not found</h2>
        <p className="text-mute text-sm mb-6">This project doesn't exist or has been deleted.</p>
        <Link href="/studio/projects" className="text-sm text-coral hover:text-coral/80">Back to Projects</Link>
      </div>
    )
  }

  const client = project.client as OrgType | undefined
  const pm = project.project_manager as Person | undefined
  const currentPhaseIdx = phases.findIndex(p => p.id === project.phase)
  const phaseColors = ["bg-inkblue", "bg-coral", "bg-gold", "bg-forest", "bg-mute"]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-mute">
        <Link href="/studio/projects" className="hover:text-ink transition-colors">Projects</Link>
        <span>/</span>
        <span className="text-ink font-medium truncate">{project.name}</span>
      </div>

      <div className="bg-paper border border-hairline rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Link href="/studio/projects" className="p-2 text-mute hover:text-ink hover:bg-paper2 rounded-lg transition-colors mt-1">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-display text-3xl tracking-tight text-ink">{project.name}</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${statusColors[project.status] || "bg-mute/10 text-mute"}`}>
                  {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-paper2 text-mute">
                  {project.phase.charAt(0).toUpperCase() + project.phase.slice(1)}
                </span>
              </div>
              <p className="text-mute text-sm">{client?.name || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowPhaseMenu(!showPhaseMenu)} className="px-3 py-1.5 text-sm border border-hairline rounded-lg hover:bg-paper2 transition-colors flex items-center gap-1">
                Change Phase <ChevronDown className="w-3 h-3" />
              </button>
              {showPhaseMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-paper border border-hairline rounded-lg shadow-lg z-10 py-1">
                  {phases.map(p => (
                    <button key={p.id} onClick={() => handlePhaseChange(p.id)} className={`w-full text-left px-3 py-1.5 text-sm hover:bg-paper2 transition-colors ${p.id === project.phase ? "font-medium text-ink" : "text-mute"}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={() => setShowStatusMenu(!showStatusMenu)} className="px-3 py-1.5 text-sm border border-hairline rounded-lg hover:bg-paper2 transition-colors flex items-center gap-1">
                Change Status <ChevronDown className="w-3 h-3" />
              </button>
              {showStatusMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-paper border border-hairline rounded-lg shadow-lg z-10 py-1">
                  {["onboarding", "active", "on_hold", "completed", "cancelled"].map(s => (
                    <button key={s} onClick={() => handleStatusChange(s)} className={`w-full text-left px-3 py-1.5 text-sm hover:bg-paper2 transition-colors ${s === project.status ? "font-medium text-ink" : "text-mute"}`}>
                      {s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setShowDeleteModal(true)} className="p-2 text-mute hover:text-ink hover:bg-paper2 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-1">
          {phases.map((phase, idx) => (
            <div key={phase.id} className="flex-1">
              <div className={`h-1.5 rounded-full ${idx < currentPhaseIdx ? "bg-forest" : idx === currentPhaseIdx ? "bg-coral" : "bg-hairline"}`} />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-1">
          {phases.map(p => (
            <span key={p.id} className={`text-[10px] font-mono uppercase tracking-wider ${p.id === project.phase ? "text-coral font-medium" : "text-mute"}`}>
              {p.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-1 border-b border-hairline overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-sans border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id ? "border-coral text-ink font-medium" : "border-transparent text-mute hover:text-ink hover:border-hairline"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-paper border border-hairline rounded-xl p-6">
            <h2 className="font-display text-lg tracking-tight text-ink mb-4">Project Info</h2>
            <div className="space-y-3">
              <InfoRow label="Name" value={project.name} />
              <InfoRow label="Type" value={project.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} />
              <InfoRow label="Client" value={client?.name || "—"} />
              <InfoRow label="Status" value={project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} />
              <InfoRow label="Phase" value={project.phase.charAt(0).toUpperCase() + project.phase.slice(1)} />
              <InfoRow label="Project Manager" value={pm?.full_name || pm?.email || "—"} />
              <InfoRow label="Description" value={project.description || "—"} />
            </div>
          </div>
          <div className="bg-paper border border-hairline rounded-xl p-6">
            <h2 className="font-display text-lg tracking-tight text-ink mb-4">Timeline & Value</h2>
            <div className="space-y-3">
              <InfoRow label="Contract Value" value={project.contract_value_cents > 0 ? `$${(project.contract_value_cents / 100).toLocaleString()}` : "—"} />
              <InfoRow label="Start Date" value={project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "—"} />
              <InfoRow label="Target Launch" value={project.target_launch_date ? new Date(project.target_launch_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "—"} />
              <InfoRow label="Created" value={new Date(project.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
            </div>
          </div>
          <div className="lg:col-span-2 bg-paper border border-hairline rounded-xl p-6">
            <h2 className="font-display text-lg tracking-tight text-ink mb-4">Phase Progress</h2>
            <div className="space-y-4">
              {phases.map((phase, idx) => {
                const isComplete = idx < currentPhaseIdx
                const isCurrent = idx === currentPhaseIdx
                return (
                  <div key={phase.id} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isComplete ? "bg-forest/10 text-forest" : isCurrent ? "bg-coral/10 text-coral" : "bg-paper2 text-mute"}`}>
                      {isComplete ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-medium">{idx + 1}</span>}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isComplete ? "text-forest" : isCurrent ? "text-coral" : "text-mute"}`}>{phase.label}</p>
                      {isCurrent && <p className="text-xs text-mute">Current phase</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="bg-paper border border-hairline rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-hairline flex items-center justify-between">
            <h2 className="font-display text-base tracking-tight text-ink">Tasks ({tasks.length})</h2>
            <button onClick={() => setShowTaskModal(true)} className="px-3 py-1.5 text-sm border border-hairline rounded-lg hover:bg-paper2 transition-colors flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Task
            </button>
          </div>
          {project?.deal && !project.deal.payment_gate_status?.initial_payment_received && (
            <div className="mx-5 mt-4 p-3 bg-gold/10 border border-gold/20 rounded-lg flex items-center gap-2 text-sm text-gold">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Initial payment not yet recorded — tasks can still be managed but production should wait.
            </div>
          )}
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList className="w-8 h-8 text-mute mb-3" />
              <p className="text-sm text-mute">No tasks yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-hairline">
              {tasks.map(task => (
                <div key={task.id} className="px-5 py-4 hover:bg-paper2/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleTaskStatusChange(task.id, task.status === "done" ? "backlog" : "done")}
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          task.status === "done"
                            ? "bg-forest border-forest text-white"
                            : "border-hairline hover:border-coral"
                        }`}
                      >
                        {task.status === "done" && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-sm font-medium ${task.status === "done" ? "text-mute line-through" : "text-ink"}`}>
                            {task.title}
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${taskStatusColors[task.status] || "bg-mute/10 text-mute"}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          {task.priority === "critical" && <span className="text-[10px] text-red-500 font-medium">CRITICAL</span>}
                          {task.priority === "high" && <span className="text-[10px] text-coral font-medium">HIGH</span>}
                        </div>
                        {task.description && <p className="text-xs text-mute truncate">{task.description}</p>}
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-mute">
                          {task.assignee?.full_name && <span>{task.assignee.full_name}</span>}
                          {task.due_date && <span>Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                          {task.estimated_effort_hours && <span>{task.estimated_effort_hours}h</span>}
                        </div>
                      </div>
                    </div>
                    <SelectField
                      label=""
                      value={task.status}
                      onChange={(v) => handleTaskStatusChange(task.id, v)}
                      options={[
                        { value: "backlog", label: "Backlog" },
                        { value: "ready", label: "Ready" },
                        { value: "in_progress", label: "In Progress" },
                        { value: "internal_review", label: "Internal Review" },
                        { value: "client_review", label: "Client Review" },
                        { value: "blocked", label: "Blocked" },
                        { value: "done", label: "Done" },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal open={showTaskModal} onClose={() => setShowTaskModal(false)} title="Add Task">
        <div className="space-y-4">
          <TextField label="Title" value={taskForm.title} onChange={(v) => setTaskForm({ ...taskForm, title: v })} required />
          <TextField label="Description" value={taskForm.description} onChange={(v) => setTaskForm({ ...taskForm, description: v })} multiline />
          <SelectField
            label="Priority"
            value={taskForm.priority}
            onChange={(v) => setTaskForm({ ...taskForm, priority: v })}
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "critical", label: "Critical" },
            ]}
          />
          <SelectField
            label="Assignee"
            value={taskForm.assignee_id}
            onChange={(v) => setTaskForm({ ...taskForm, assignee_id: v })}
            options={teamOptions}
            placeholder="Select"
          />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Cancel</button>
            <button onClick={handleCreateTask} disabled={!taskForm.title} className="px-4 py-2 text-sm bg-ink text-paper rounded-lg hover:bg-charcoal transition-colors disabled:opacity-50">
              Create Task
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Project">
        <p className="text-sm text-mute mb-6">Are you sure you want to delete this project?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-hairline last:border-0">
      <span className="text-sm text-mute">{label}</span>
      <span className="text-sm text-ink font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  )
}
