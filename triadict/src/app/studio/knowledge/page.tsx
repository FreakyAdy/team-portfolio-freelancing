"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  Plus, Search, MoreHorizontal, BookOpen, FileText, Lightbulb,
  AlertCircle, ArrowUpRight, Tag, Pencil, Trash2
} from "lucide-react"
import { listArticles, createArticle, updateArticle, deleteArticle, getArticleCategories, seedArticles } from "@/lib/db/knowledge"
import type { KnowledgeArticle } from "@/types/database"
import { Modal } from "@/components/ui/Modal"
import { TextField } from "@/components/ui/TextField"
import { SelectField } from "@/components/ui/SelectField"

const categoryIcons: Record<string, React.ElementType> = {
  process: BookOpen,
  standard: FileText,
  lesson: Lightbulb,
  technical_pattern: AlertCircle,
  sales_objection: AlertCircle,
  pricing_decision: FileText,
  postmortem: AlertCircle,
}

const categoryColors: Record<string, string> = {
  process: "text-coral",
  standard: "text-inkblue",
  lesson: "text-gold",
  technical_pattern: "text-forest",
  sales_objection: "text-coral",
  pricing_decision: "text-mute",
  postmortem: "text-red-500",
}

export default function KnowledgePage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [categories, setCategories] = useState<{ id: string; label: string; color: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editTarget, setEditTarget] = useState<KnowledgeArticle | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeArticle | null>(null)
  const [formData, setFormData] = useState({ title: "", category: "process" as KnowledgeArticle['category'], content_md: "", tags: "", status: "draft" as KnowledgeArticle['status'] })

  const loadData = useCallback(async () => {
    setLoading(true)
    await seedArticles()
    const [arts, cats] = await Promise.all([
      listArticles({ search: searchQuery || undefined, category: activeCategory === "all" ? undefined : activeCategory }),
      getArticleCategories(),
    ])
    setArticles(arts)
    setCategories(cats)
    setLoading(false)
  }, [searchQuery, activeCategory])

  useEffect(() => { loadData() }, [loadData])

  const resetForm = () => setFormData({ title: "", category: "process", content_md: "", tags: "", status: "draft" })

  const handleCreate = async () => {
    if (!formData.title) return
    const result = await createArticle({
      title: formData.title,
      category: formData.category,
      content_md: formData.content_md,
      tags: formData.tags ? formData.tags.split(",").map(s => s.trim()) : [],
      status: formData.status,
    })
    if ("error" in result) { alert(result.error); return }
    setShowCreateModal(false)
    resetForm()
    loadData()
  }

  const handleEdit = async () => {
    if (!editTarget || !formData.title) return
    const result = await updateArticle({
      id: editTarget.id,
      title: formData.title,
      category: formData.category,
      content_md: formData.content_md,
      tags: formData.tags ? formData.tags.split(",").map(s => s.trim()) : [],
      status: formData.status,
    })
    if (result.error) { alert(result.error); return }
    setEditTarget(null)
    resetForm()
    loadData()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const result = await deleteArticle(deleteTarget.id)
    if (result.error) { alert(result.error); return }
    setDeleteTarget(null)
    loadData()
  }

  const openEdit = (a: KnowledgeArticle) => {
    setEditTarget(a)
    setFormData({
      title: a.title,
      category: a.category,
      content_md: a.content_md,
      tags: (a.tags || []).join(", "),
      status: a.status,
    })
  }

  const getCategoryIcon = (category: string) => {
    const Icon = categoryIcons[category] || FileText
    return <Icon className={`w-5 h-5 ${categoryColors[category] || "text-mute"}`} />
  }

  const authorName = (article: KnowledgeArticle) => {
    const author = (article as unknown as { author?: { full_name?: string } }).author
    return author?.full_name || "Unknown"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight text-ink">Knowledge Base</h1>
          <p className="text-mute font-sans mt-2">{articles.length} articles · Processes, standards, and lessons</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-paper border border-hairline rounded-lg p-1">
            <button onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-sm font-sans rounded-md transition-colors ${viewMode === "list" ? "bg-ink text-paper" : "text-mute hover:text-ink"}`}>List</button>
            <button onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-sm font-sans rounded-md transition-colors ${viewMode === "grid" ? "bg-ink text-paper" : "text-mute hover:text-ink"}`}>Grid</button>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 text-sm font-sans bg-ink text-paper rounded-lg hover:bg-charcoal transition-colors">
            <Plus className="w-4 h-4 mr-2 inline" />New Article
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
          <input type="text" placeholder="Search articles..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-paper border border-hairline rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button onClick={() => setActiveCategory("all")}
            className={`px-3 py-2 text-sm font-sans rounded-lg transition-colors whitespace-nowrap ${activeCategory === "all" ? "bg-ink text-paper" : "bg-paper border border-hairline text-mute hover:text-ink"}`}>All</button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-2 text-sm font-sans rounded-lg transition-colors whitespace-nowrap ${activeCategory === cat.id ? "bg-ink text-paper" : "bg-paper border border-hairline text-mute hover:text-ink"}`}>{cat.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-mute text-sm py-12">Loading...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-mute/30 mx-auto mb-4" />
          <h3 className="font-display text-xl text-ink mb-2">No articles found</h3>
          <p className="text-mute font-sans mb-4">Try adjusting your search or filters</p>
          <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 text-sm font-sans bg-ink text-paper rounded-lg hover:bg-charcoal transition-colors">
            <Plus className="w-4 h-4 mr-2 inline" />New Article
          </button>
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-4">
          {articles.map(article => (
            <div key={article.id} className="bg-paper border border-hairline rounded-xl p-6 hover:border-coral/30 transition-colors group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-paper2 flex items-center justify-center flex-shrink-0">
                    {getCategoryIcon(article.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-sans font-medium text-ink text-lg truncate">{article.title}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                        article.status === "published" ? "bg-forest/10 text-forest" : "bg-gold/10 text-gold"
                      }`}>
                        {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-mute font-sans mb-2 line-clamp-2">{article.content_md.slice(0, 200)}</p>
                    <div className="flex items-center gap-4 text-xs text-mute">
                      <span>By {authorName(article)}</span>
                      {article.published_at && (
                        <span>Published {new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      )}
                      <span>Updated {new Date(article.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(article)} className="p-1.5 text-mute hover:text-ink hover:bg-paper2 rounded-lg transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(article)} className="p-1.5 text-mute hover:text-coral hover:bg-coral/5 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-hairline">
                  <Tag className="w-3 h-3 text-mute" />
                  {article.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-paper2 rounded text-xs text-mute">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map(article => (
            <div key={article.id} className="bg-paper border border-hairline rounded-xl p-5 hover:border-coral/30 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-paper2 flex items-center justify-center">
                  {getCategoryIcon(article.category)}
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  article.status === "published" ? "bg-forest/10 text-forest" : "bg-gold/10 text-gold"
                }`}>
                  {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                </span>
              </div>
              <h3 className="font-sans font-medium text-ink mb-2 truncate">{article.title}</h3>
              <p className="text-sm text-mute mb-4 line-clamp-2">{article.content_md.slice(0, 150)}</p>
              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  {article.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-paper2 rounded text-xs text-mute">{tag}</span>
                  ))}
                  {article.tags.length > 2 && <span className="text-xs text-mute">+{article.tags.length - 2}</span>}
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-mute">
                <span>By {authorName(article)}</span>
                <span>{article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "Draft"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showCreateModal} onClose={() => { setShowCreateModal(false); resetForm() }} title="New Article">
        <div className="space-y-4">
          <TextField label="Title" value={formData.title} onChange={(v) => setFormData({ ...formData, title: v })} required />
          <SelectField label="Category" value={formData.category} onChange={(v) => setFormData({ ...formData, category: v as KnowledgeArticle['category'] })}
            options={categories.map(c => ({ value: c.id, label: c.label }))} />
          <SelectField label="Status" value={formData.status} onChange={(v) => setFormData({ ...formData, status: v as KnowledgeArticle['status'] })}
            options={[{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" }]} />
          <TextField label="Content (Markdown)" value={formData.content_md} onChange={(v) => setFormData({ ...formData, content_md: v })} multiline />
          <TextField label="Tags (comma-separated)" value={formData.tags} onChange={(v) => setFormData({ ...formData, tags: v })} placeholder="process, design, workflow" />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setShowCreateModal(false); resetForm() }} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={!formData.title} className="px-4 py-2 bg-ink text-paper text-sm rounded-lg hover:bg-ink/90 transition-colors disabled:opacity-50">Create</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!editTarget} onClose={() => { setEditTarget(null); resetForm() }} title="Edit Article">
        <div className="space-y-4">
          <TextField label="Title" value={formData.title} onChange={(v) => setFormData({ ...formData, title: v })} required />
          <SelectField label="Category" value={formData.category} onChange={(v) => setFormData({ ...formData, category: v as KnowledgeArticle['category'] })}
            options={categories.map(c => ({ value: c.id, label: c.label }))} />
          <SelectField label="Status" value={formData.status} onChange={(v) => setFormData({ ...formData, status: v as KnowledgeArticle['status'] })}
            options={[{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }, { value: "archived", label: "Archived" }]} />
          <TextField label="Content (Markdown)" value={formData.content_md} onChange={(v) => setFormData({ ...formData, content_md: v })} multiline />
          <TextField label="Tags (comma-separated)" value={formData.tags} onChange={(v) => setFormData({ ...formData, tags: v })} placeholder="process, design, workflow" />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setEditTarget(null); resetForm() }} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Cancel</button>
            <button onClick={handleEdit} disabled={!formData.title} className="px-4 py-2 bg-ink text-paper text-sm rounded-lg hover:bg-ink/90 transition-colors disabled:opacity-50">Save</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Article" size="sm">
        <p className="text-sm text-mute mb-6">Are you sure you want to delete <strong className="text-ink">{deleteTarget?.title}</strong>? This cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 bg-coral text-white text-sm rounded-lg hover:bg-coral/90 transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  )
}
