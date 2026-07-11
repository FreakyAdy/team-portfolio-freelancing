"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Grid3X3, List, Plus, FileText, Pencil, Trash2 } from "lucide-react"
import { listTemplates, createTemplate, updateTemplate, deleteTemplate } from "@/lib/db/templates"
import type { Template } from "@/types/database"
import { Modal } from "@/components/ui/Modal"
import { TextField } from "@/components/ui/TextField"
import { SelectField } from "@/components/ui/SelectField"

const templateCategories = [
  { value: "proposal", label: "Proposal" },
  { value: "contract", label: "Contract" },
  { value: "sow", label: "Statement of Work" },
  { value: "monthly_report", label: "Monthly Report" },
  { value: "case_study", label: "Case Study" },
  { value: "invoice", label: "Invoice" },
  { value: "brief", label: "Creative Brief" },
  { value: "checklist", label: "Checklist" },
  { value: "email", label: "Email" },
  { value: "other", label: "Other" },
]

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editTarget, setEditTarget] = useState<Template | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null)
  const [formData, setFormData] = useState({ name: "", category: "proposal", content_md: "", merge_fields: "" })
  const [attachments, setAttachments] = useState<{ file_type: "image" | "pdf"; file_name: string }[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    const data = await listTemplates({ search: searchQuery || undefined })
    setTemplates(data)
    setLoading(false)
  }, [searchQuery])

  useEffect(() => { loadData() }, [loadData])

  const handleCreate = async () => {
    if (!formData.name) return
    const result = await createTemplate({
      name: formData.name,
      category: formData.category,
      content_md: formData.content_md,
      merge_fields: formData.merge_fields ? formData.merge_fields.split(",").map(s => s.trim()) : [],
    })
    if ("error" in result) { alert(result.error); return }
    setShowCreateModal(false)
    setFormData({ name: "", category: "proposal", content_md: "", merge_fields: "" })
    loadData()
  }

  const handleEdit = async () => {
    if (!editTarget || !formData.name) return
    const result = await updateTemplate({
      id: editTarget.id,
      name: formData.name,
      category: formData.category,
      content_md: formData.content_md,
      merge_fields: formData.merge_fields ? formData.merge_fields.split(",").map(s => s.trim()) : [],
    })
    if (result.error) { alert(result.error); return }
    setEditTarget(null)
    setFormData({ name: "", category: "proposal", content_md: "", merge_fields: "" })
    loadData()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const result = await deleteTemplate(deleteTarget.id)
    if (result.error) { alert(result.error); return }
    setDeleteTarget(null)
    loadData()
  }

  const openEdit = (t: Template) => {
    setEditTarget(t)
    setFormData({
      name: t.name,
      category: t.category,
      content_md: t.content_md,
      merge_fields: (t.merge_fields || []).join(", "),
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display tracking-tight">Templates</h1>
          <p className="text-mute text-sm mt-1">Reusable project templates</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-hairline rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${viewMode === "grid" ? "bg-paper2 text-ink" : "text-mute hover:text-ink"}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${viewMode === "list" ? "bg-paper2 text-ink" : "text-mute hover:text-ink"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-coral text-white text-sm rounded-lg hover:bg-coral/90 transition-colors">
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-paper border border-hairline rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
        />
      </div>

      {loading ? (
        <div className="text-center text-mute text-sm py-12">Loading...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-mute/30 mx-auto mb-4" />
          <p className="text-mute text-sm">No templates yet</p>
          <button onClick={() => setShowCreateModal(true)} className="mt-4 px-4 py-2 bg-ink text-paper text-sm rounded-lg hover:bg-ink/90 transition-colors">
            Create your first template
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="group bg-paper border border-hairline rounded-xl p-5 hover:border-coral/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-coral" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(template)} className="p-1.5 text-mute hover:text-ink hover:bg-paper2 rounded-lg transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteTarget(template)} className="p-1.5 text-mute hover:text-coral hover:bg-coral/5 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="font-display text-lg tracking-tight mb-1">{template.name}</h3>
              <span className="inline-block px-2 py-0.5 bg-paper2 rounded text-xs text-mute mb-3">{template.category}</span>
              {template.content_md && (
                <p className="text-sm text-mute line-clamp-2">{template.content_md.slice(0, 120)}</p>
              )}
              <div className="flex items-center justify-between text-xs text-mute border-t border-hairline pt-3 mt-3">
                <span>v{template.version}</span>
                <span className={`${template.is_active ? "text-forest" : "text-mute"}`}>{template.is_active ? "Active" : "Inactive"}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((template) => (
            <div key={template.id} className="flex items-center justify-between p-4 bg-paper border border-hairline rounded-xl hover:border-coral/30 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-coral/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-coral" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">{template.name}</h3>
                  <span className="text-xs text-mute">{template.category} · v{template.version}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(template)} className="p-1.5 text-mute hover:text-ink hover:bg-paper2 rounded-lg transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeleteTarget(template)} className="p-1.5 text-mute hover:text-coral hover:bg-coral/5 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Template">
        <div className="space-y-4">
          <TextField label="Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} required />
          <SelectField label="Category" value={formData.category} onChange={(v) => setFormData({ ...formData, category: v })} options={templateCategories} />
          <TextField label="Content (Markdown)" value={formData.content_md} onChange={(v) => setFormData({ ...formData, content_md: v })} multiline />
          <TextField label="Merge Fields (comma-separated)" value={formData.merge_fields} onChange={(v) => setFormData({ ...formData, merge_fields: v })} placeholder="client_name, project_name, amount" />
          <div>
            <label className="block text-sm font-medium mb-1.5">Attachments</label>
            <div className="border border-dashed border-hairline rounded-lg p-4 text-center">
              <p className="text-xs text-mute mb-2">Drag files here or click to upload</p>
              <p className="text-[10px] text-mute">Supports images (PNG, JPG, WebP) and PDFs. Max 10MB each.</p>
            </div>
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachments.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-paper2 rounded text-xs">
                    <span className="text-ink">{a.file_name}</span>
                    <span className="text-mute">{a.file_type}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setShowCreateModal(false); setAttachments([]) }} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={!formData.name} className="px-4 py-2 bg-ink text-paper text-sm rounded-lg hover:bg-ink/90 transition-colors disabled:opacity-50">Create</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Template">
        <div className="space-y-4">
          <TextField label="Name" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} required />
          <SelectField label="Category" value={formData.category} onChange={(v) => setFormData({ ...formData, category: v })} options={templateCategories} />
          <TextField label="Content (Markdown)" value={formData.content_md} onChange={(v) => setFormData({ ...formData, content_md: v })} multiline />
          <TextField label="Merge Fields (comma-separated)" value={formData.merge_fields} onChange={(v) => setFormData({ ...formData, merge_fields: v })} placeholder="client_name, project_name, amount" />
          <div>
            <label className="block text-sm font-medium mb-1.5">Attachments</label>
            <div className="border border-dashed border-hairline rounded-lg p-4 text-center">
              <p className="text-xs text-mute mb-2">Drag files here or click to upload</p>
              <p className="text-[10px] text-mute">Supports images (PNG, JPG, WebP) and PDFs. Max 10MB each.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setEditTarget(null)} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Cancel</button>
            <button onClick={handleEdit} disabled={!formData.name} className="px-4 py-2 bg-ink text-paper text-sm rounded-lg hover:bg-ink/90 transition-colors disabled:opacity-50">Save</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Template" size="sm">
        <p className="text-sm text-mute mb-6">Are you sure you want to delete <strong className="text-ink">{deleteTarget?.name}</strong>? This cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-coral text-white text-sm rounded-lg hover:bg-coral/90 transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  )
}
