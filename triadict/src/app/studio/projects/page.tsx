"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Calendar,
  FolderKanban,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { listProjects, createProject, updateProjectPhase } from "@/lib/db/projects"
import { listCompanies } from "@/lib/db/companies"
import { listTeamMembers } from "@/lib/db/contacts"
import { listTasks } from "@/lib/db/tasks"
import { Modal } from "@/components/ui/Modal"
import { EmptyState } from "@/components/ui/EmptyState"
import { LoadingState } from "@/components/ui/LoadingState"
import { TextField } from "@/components/ui/TextField"
import { SelectField } from "@/components/ui/SelectField"
import type { Project, CreateProjectInput } from "@/types/database"

const phases = [
  { id: "discovery", label: "Discovery", color: "bg-inkblue/10 text-inkblue" },
  { id: "design", label: "Design", color: "bg-coral/10 text-coral" },
  { id: "build", label: "Build", color: "bg-gold/10 text-gold" },
  { id: "qa", label: "QA", color: "bg-forest/10 text-forest" },
  { id: "launch", label: "Launch", color: "bg-mute/10 text-mute" }
]

const statusColors: Record<string, string> = {
  onboarding: "bg-inkblue/10 text-inkblue",
  active: "bg-forest/10 text-forest",
  on_hold: "bg-gold/10 text-gold",
  completed: "bg-mute/10 text-mute",
  cancelled: "bg-red-500/10 text-red-500"
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeStatus, setActiveStatus] = useState("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [clientOptions, setClientOptions] = useState<{ value: string; label: string }[]>([])
  const [teamOptions, setTeamOptions] = useState<{ value: string; label: string }[]>([])
  const [taskCounts, setTaskCounts] = useState<Record<string, { total: number; completed: number }>>({})

  const [formData, setFormData] = useState({
    name: "", client_org_id: "", type: "standard_site",
    description: "", contract_value_cents: 0,
    project_manager_id: "", assigned_to: "",
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    const status = activeStatus === "all" ? undefined : activeStatus
    const [projectsData, companies, team] = await Promise.all([
      listProjects({ status, search: searchQuery }),
      listCompanies(),
      listTeamMembers(),
    ])
    setProjects(projectsData)
    setClientOptions(companies.filter(c => c.type === "client" || true).map(c => ({ value: c.id, label: c.name })))
    setTeamOptions(team.map(t => ({ value: t.id, label: t.full_name || t.email })))

    const counts: Record<string, { total: number; completed: number }> = {}
    for (const p of projectsData) {
      const tasks = await listTasks({ project_id: p.id })
      counts[p.id] = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === "done").length,
      }
    }
    setTaskCounts(counts)
    setLoading(false)
  }, [activeStatus, searchQuery])

  useEffect(() => { loadData() }, [loadData])

  const handleCreate = async () => {
    const result = await createProject(formData as CreateProjectInput)
    if ("error" in result) { alert(result.error); return }
    setShowCreateModal(false)
    setFormData({ name: "", client_org_id: "", type: "standard_site", description: "", contract_value_cents: 0, project_manager_id: "", assigned_to: "" })
    loadData()
  }

  const getPhaseColor = (phase: string) => {
    const phaseData = phases.find(p => p.id === phase)
    return phaseData ? phaseData.color : "bg-mute/10 text-mute"
  }

  const getStatusColor = (status: string) => {
    return statusColors[status] || "bg-mute/10 text-mute"
  }

  if (loading) return <LoadingState />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight text-ink">
            Projects
          </h1>
          <p className="text-mute font-sans mt-2">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-paper border border-hairline rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-sm font-sans rounded-md transition-colors ${
                viewMode === "list" ? "bg-ink text-paper" : "text-mute hover:text-ink"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-sm font-sans rounded-md transition-colors ${
                viewMode === "grid" ? "bg-ink text-paper" : "text-mute hover:text-ink"
              }`}
            >
              Grid
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-sm font-sans bg-ink text-paper rounded-lg hover:bg-charcoal transition-colors"
          >
            <Plus className="w-4 h-4 mr-2 inline" />
            New Project
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-paper border border-hairline rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveStatus("all")}
            className={`px-3 py-2 text-sm font-sans rounded-lg transition-colors ${
              activeStatus === "all" ? "bg-ink text-paper" : "bg-paper border border-hairline text-mute hover:text-ink"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveStatus("active")}
            className={`px-3 py-2 text-sm font-sans rounded-lg transition-colors ${
              activeStatus === "active" ? "bg-ink text-paper" : "bg-paper border border-hairline text-mute hover:text-ink"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveStatus("onboarding")}
            className={`px-3 py-2 text-sm font-sans rounded-lg transition-colors ${
              activeStatus === "onboarding" ? "bg-ink text-paper" : "bg-paper border border-hairline text-mute hover:text-ink"
            }`}
          >
            Onboarding
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start managing client work."
          actionLabel="Create Project"
          onAction={() => setShowCreateModal(true)}
        />
      ) : viewMode === "list" ? (
        <div className="space-y-4">
          {projects.map(project => {
            const counts = taskCounts[project.id] || { total: 0, completed: 0 }
            return (
              <div key={project.id} className="bg-paper border border-hairline rounded-xl p-6 hover:border-coral/30 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-ink/5 flex items-center justify-center">
                      <FolderKanban className="w-6 h-6 text-ink" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-sans font-medium text-ink text-lg">{project.name}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      <p className="text-sm text-mute font-sans">{project.client?.name || "—"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${getPhaseColor(project.phase)}`}>
                        {project.phase.charAt(0).toUpperCase() + project.phase.slice(1)}
                      </span>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-sans text-ink">{counts.completed}/{counts.total}</p>
                      <p className="text-xs text-mute">tasks</p>
                    </div>
                    {project.target_launch_date && (
                      <div className="text-center">
                        <p className="text-sm font-sans text-ink">
                          {new Date(project.target_launch_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-mute">launch</p>
                      </div>
                    )}
                    <Link href={`/studio/projects/${project.id}`} className="px-3 py-1.5 text-sm font-sans text-mute hover:text-ink hover:bg-paper2 rounded-lg transition-colors">
                      View
                    </Link>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-hairline">
                  <div className="flex items-center gap-2">
                    {phases.map((phase, index) => {
                      const phaseIndex = phases.findIndex(p => p.id === project.phase)
                      const isComplete = index < phaseIndex
                      const isCurrent = index === phaseIndex
                      return (
                        <div key={phase.id} className="flex-1">
                          <div className={`h-1 rounded-full ${isComplete ? "bg-forest" : isCurrent ? "bg-coral" : "bg-hairline"}`} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => {
            const counts = taskCounts[project.id] || { total: 0, completed: 0 }
            return (
              <div key={project.id} className="bg-paper border border-hairline rounded-xl p-5 hover:border-coral/30 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-ink/5 flex items-center justify-center">
                    <FolderKanban className="w-5 h-5 text-ink" />
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPhaseColor(project.phase)}`}>
                    {project.phase.charAt(0).toUpperCase() + project.phase.slice(1)}
                  </span>
                </div>
                <h3 className="font-sans font-medium text-ink mb-1">{project.name}</h3>
                <p className="text-sm text-mute mb-4">{project.client?.name || "—"}</p>
                <div className="flex items-center justify-between text-sm text-mute">
                  {project.target_launch_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(project.target_launch_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {counts.completed}/{counts.total}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-hairline flex items-center justify-between">
                  <Link href={`/studio/projects/${project.id}`} className="text-sm font-sans text-coral hover:text-coral/80 flex items-center gap-1">
                    View <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Project">
        <div className="space-y-4">
          <TextField label="Project Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} required />
          <SelectField
            label="Client"
            value={formData.client_org_id}
            onChange={(v) => setFormData({ ...formData, client_org_id: v })}
            options={clientOptions}
            placeholder="Select client"
            required
          />
          <SelectField
            label="Project Type"
            value={formData.type}
            onChange={(v) => setFormData({ ...formData, type: v as CreateProjectInput["type"] })}
            options={[
              { value: "standard_site", label: "Standard Site" },
              { value: "premium_site", label: "Premium Site" },
              { value: "redesign", label: "Redesign" },
              { value: "legacy_modernization", label: "Legacy Modernization" },
              { value: "seo_migration", label: "SEO Migration" },
              { value: "performance", label: "Performance" },
              { value: "dashboard", label: "Dashboard" },
              { value: "automation", label: "Automation" },
            ]}
          />
          <TextField label="Description" value={formData.description} onChange={(v) => setFormData({ ...formData, description: v })} multiline />
          <div>
            <label className="block text-sm font-medium mb-1.5">Contract Value (cents)</label>
            <input
              type="number"
              value={formData.contract_value_cents}
              onChange={(e) => setFormData({ ...formData, contract_value_cents: parseInt(e.target.value) || 0 })}
              className="w-full h-10 px-3 bg-paper border border-hairline rounded-lg text-sm focus:outline-none focus:border-coral transition-colors"
            />
            <p className="text-xs text-mute mt-1">${(formData.contract_value_cents / 100).toFixed(2)}</p>
          </div>
          <SelectField label="Project Manager" value={formData.project_manager_id} onChange={(v) => setFormData({ ...formData, project_manager_id: v })} options={teamOptions} placeholder="Select" />
          <SelectField label="Assigned To" value={formData.assigned_to} onChange={(v) => setFormData({ ...formData, assigned_to: v })} options={teamOptions} placeholder="Select" />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={!formData.name || !formData.client_org_id} className="px-4 py-2 text-sm bg-ink text-paper rounded-lg hover:bg-charcoal transition-colors disabled:opacity-50">
              Create Project
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
