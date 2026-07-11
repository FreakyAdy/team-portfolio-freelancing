"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Search, Upload, FileText, Trash2, Download, ChevronDown, ChevronRight, Video, Image, Mail, X } from "lucide-react"
import { listClients } from "@/lib/db/clients"
import { LoadingState } from "@/components/ui/LoadingState"
import type { Client, Organization } from "@/types/database"

interface ClientDocument {
  id: string
  name: string
  type: string
  size: number
  dataUrl: string
  category: "email" | "photo" | "video" | "other"
  uploadedAt: string
}

const categoryConfig = {
  email: { label: "Emails & Conversations", icon: Mail, accept: ".pdf,.png,.jpg,.jpeg,.webp" },
  photo: { label: "Photos & Screenshots", icon: Image, accept: ".png,.jpg,.jpeg,.webp,.gif" },
  video: { label: "Meeting Recordings", icon: Video, accept: ".mp4,.webm,.ogg,.mov" },
  other: { label: "Other Files", icon: FileText, accept: ".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp,.mp4,.webm" },
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileCategory(file: File): ClientDocument["category"] {
  if (file.type.startsWith("video/")) return "video"
  if (file.type === "application/pdf") return "email"
  if (file.type.startsWith("image/")) return "photo"
  return "other"
}

function getStorageKey(clientId: string) {
  return `client-${clientId}-documents`
}

function loadDocuments(clientId: string): ClientDocument[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(getStorageKey(clientId))
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveDocuments(clientId: string, docs: ClientDocument[]) {
  localStorage.setItem(getStorageKey(clientId), JSON.stringify(docs))
}

export default function DocumentsPage() {
  const [clients, setClients] = useState<(Client & { organization?: Organization })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedClient, setExpandedClient] = useState<string | null>(null)
  const [clientDocs, setClientDocs] = useState<Record<string, ClientDocument[]>>({})
  const [activeCategory, setActiveCategory] = useState<ClientDocument["category"]>("email")
  const fileInputRefs = useRef<Record<string, HTMLInputElement>>({})

  const loadData = useCallback(async () => {
    setLoading(true)
    const clientsData = await listClients()
    setClients(clientsData)

    const docsMap: Record<string, ClientDocument[]> = {}
    for (const client of clientsData) {
      docsMap[client.id] = loadDocuments(client.id)
    }
    setClientDocs(docsMap)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const filteredClients = clients.filter(c => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      c.organization?.name?.toLowerCase().includes(q) ||
      c.primary_contact?.full_name?.toLowerCase().includes(q) ||
      c.primary_contact?.email?.toLowerCase().includes(q)
    )
  })

  const handleUpload = useCallback((clientId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        const newDoc: ClientDocument = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: reader.result as string,
          category: getFileCategory(file),
          uploadedAt: new Date().toISOString(),
        }
        const current = clientDocs[clientId] || []
        const updated = [...current, newDoc]
        saveDocuments(clientId, updated)
        setClientDocs(prev => ({ ...prev, [clientId]: updated }))
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ""
  }, [clientDocs])

  const handleDelete = (clientId: string, docId: string) => {
    const current = clientDocs[clientId] || []
    const updated = current.filter(d => d.id !== docId)
    saveDocuments(clientId, updated)
    setClientDocs(prev => ({ ...prev, [clientId]: updated }))
  }

  const getClientDocsByCategory = (clientId: string, category: ClientDocument["category"]) => {
    return (clientDocs[clientId] || []).filter(d => d.category === category)
  }

  const getClientTotalDocs = (clientId: string) => {
    return (clientDocs[clientId] || []).length
  }

  if (loading) return <LoadingState />

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-ink mb-2">Client Documents</h1>
        <p className="text-mute">Upload emails, photos, meeting recordings, and files for each client. New clients appear automatically.</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
        <input
          type="text"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-9 pr-4 bg-paper2 border border-hairline rounded-lg text-sm focus:outline-none focus:border-coral transition-colors"
        />
      </div>

      {/* Clients */}
      <div className="space-y-3">
        {filteredClients.map(client => {
          const isExpanded = expandedClient === client.id
          const totalDocs = getClientTotalDocs(client.id)
          const docsByCategory = getClientDocsByCategory(client.id, activeCategory)

          return (
            <div key={client.id} className="bg-paper border border-hairline rounded-xl overflow-hidden">
              {/* Client header */}
              <button
                onClick={() => setExpandedClient(isExpanded ? null : client.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-paper2/50 transition-colors text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-mute flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-mute flex-shrink-0" />
                )}
                <div className="w-10 h-10 rounded-full bg-paper2 border border-hairline flex items-center justify-center flex-shrink-0">
                  <span className="font-display text-sm text-ink">
                    {(client.organization?.name || client.primary_contact?.full_name || "?")[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ink truncate">{client.organization?.name || client.primary_contact?.full_name || "Unnamed"}</p>
                  <p className="text-xs text-mute truncate">{client.primary_contact?.full_name || client.primary_contact?.email}</p>
                </div>
                {totalDocs > 0 && (
                  <span className="px-2.5 py-1 text-xs font-mono bg-paper2 border border-hairline rounded-full text-mute">
                    {totalDocs} file{totalDocs !== 1 ? "s" : ""}
                  </span>
                )}
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-hairline p-4">
                  {/* Category tabs */}
                  <div className="flex gap-1 mb-4 overflow-x-auto">
                    {(Object.keys(categoryConfig) as ClientDocument["category"][]).map(cat => {
                      const config = categoryConfig[cat]
                      const Icon = config.icon
                      const count = getClientDocsByCategory(client.id, cat).length
                      return (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg whitespace-nowrap transition-colors ${
                            activeCategory === cat
                              ? "bg-ink text-paper"
                              : "text-mute hover:text-ink hover:bg-paper2"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {config.label}
                          {count > 0 && (
                            <span className={`text-xs ${activeCategory === cat ? "text-paper/70" : "text-mute"}`}>
                              {count}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Upload area */}
                  <div className="mb-4">
                    <input
                      ref={(el) => { if (el) fileInputRefs.current[`${client.id}-${activeCategory}`] = el }}
                      type="file"
                      accept={categoryConfig[activeCategory].accept}
                      multiple
                      onChange={(e) => handleUpload(client.id, e)}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRefs.current[`${client.id}-${activeCategory}`]?.click()}
                      className="w-full p-4 border-2 border-dashed border-hairline rounded-xl hover:border-coral/40 hover:bg-coral/5 transition-colors flex items-center justify-center gap-3 text-mute hover:text-ink"
                    >
                      <Upload className="w-5 h-5" />
                      <span className="text-sm">
                        Upload {categoryConfig[activeCategory].label.toLowerCase()}
                      </span>
                    </button>
                  </div>

                  {/* File list */}
                  {docsByCategory.length === 0 ? (
                    <p className="text-sm text-mute text-center py-6">
                      No {categoryConfig[activeCategory].label.toLowerCase()} yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {docsByCategory.map(doc => (
                        <div key={doc.id} className="flex items-center gap-3 p-3 bg-paper2 rounded-lg group">
                          {/* Preview */}
                          {doc.category === "video" ? (
                            <div className="w-12 h-12 rounded-lg bg-ink/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              <video src={doc.dataUrl} className="w-full h-full object-cover" />
                            </div>
                          ) : doc.type.startsWith("image/") ? (
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-hairline/30 flex-shrink-0">
                              <img src={doc.dataUrl} alt={doc.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-coral/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-coral" />
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink truncate">{doc.name}</p>
                            <p className="text-xs text-mute">
                              {formatFileSize(doc.size)} · {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {doc.category === "video" ? (
                              <video
                                src={doc.dataUrl}
                                controls
                                className="w-32 h-20 rounded-lg object-cover"
                              />
                            ) : null}
                            <a
                              href={doc.dataUrl}
                              download={doc.name}
                              className="w-8 h-8 flex items-center justify-center text-mute hover:text-ink transition-colors rounded"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleDelete(client.id, doc.id)}
                              className="w-8 h-8 flex items-center justify-center text-mute hover:text-red-500 transition-colors rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-mute">No clients found.</p>
            <p className="text-sm text-mute mt-1">
              {searchQuery ? "Try a different search." : "Add clients on the Clients page first."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
