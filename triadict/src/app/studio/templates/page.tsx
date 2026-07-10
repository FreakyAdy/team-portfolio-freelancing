"use client"

import { useState } from "react"
import { Search, Grid3X3, List, Plus, Eye, FileText } from "lucide-react"
import Link from "next/link"

const templates = [
  { id: 1, name: "Single Page", description: "Perfect for solo professionals", pages: 1, price: 800, uses: 0 },
  { id: 2, name: "Multi-Page Editorial", description: "For brands that need depth", pages: 5, price: 1500, uses: 0 },
  { id: 3, name: "Portfolio", description: "Showcase creative work", pages: 3, price: 1200, uses: 0 },
]

export default function TemplatesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

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
          <button className="flex items-center gap-2 px-4 py-2 bg-coral text-white text-sm rounded-lg hover:bg-coral/90 transition-colors">
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="bg-paper border border-hairline rounded-xl p-5 hover:border-coral/30 transition-colors group">
            <div className="w-10 h-10 rounded-lg bg-coral/10 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 text-coral" />
            </div>
            <h3 className="font-display text-lg tracking-tight mb-1">{template.name}</h3>
            <p className="text-sm text-mute mb-4">{template.description}</p>
            <div className="flex items-center justify-between text-xs text-mute border-t border-hairline pt-4">
              <span>{template.pages} page{template.pages > 1 ? "s" : ""}</span>
              <span className="font-medium text-ink">${template.price.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
