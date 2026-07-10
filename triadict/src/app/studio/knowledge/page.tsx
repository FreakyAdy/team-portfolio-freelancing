"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  BookOpen,
  FileText,
  Lightbulb,
  AlertCircle,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Tag
} from "lucide-react"

const categories = [
  { id: "process", label: "Process", icon: BookOpen, color: "text-coral" },
  { id: "standard", label: "Standard", icon: FileText, color: "text-inkblue" },
  { id: "lesson", label: "Lesson Learned", icon: Lightbulb, color: "text-gold" },
  { id: "technical_pattern", label: "Technical Pattern", icon: AlertCircle, color: "text-forest" },
  { id: "sales_objection", label: "Sales Objection", icon: AlertCircle, color: "text-coral" },
  { id: "pricing_decision", label: "Pricing Decision", icon: FileText, color: "text-mute" },
  { id: "postmortem", label: "Postmortem", icon: AlertCircle, color: "text-red-500" }
]

const sampleArticles = [
  {
    id: 1,
    title: "Client Onboarding Checklist",
    category: "process",
    excerpt: "Step-by-step process for onboarding new clients after contract signing.",
    tags: ["onboarding", "process", "checklist"],
    author: "Aditya",
    status: "published",
    publishedAt: "2025-07-08",
    updatedAt: "2025-07-08"
  },
  {
    id: 2,
    title: "Design Revision Policy",
    category: "standard",
    excerpt: "Standard policy for handling design revisions beyond the included rounds.",
    tags: ["design", "revisions", "policy"],
    author: "Shreeshant",
    status: "published",
    publishedAt: "2025-07-05",
    updatedAt: "2025-07-05"
  },
  {
    id: 3,
    title: "Why We Don't Do E-commerce",
    category: "sales_objection",
    excerpt: "How to explain to prospects why we focus on brochure sites, not Shopify.",
    tags: ["sales", "objection", "ecommerce"],
    author: "Prajwal",
    status: "published",
    publishedAt: "2025-07-03",
    updatedAt: "2025-07-03"
  },
  {
    id: 4,
    title: "Hartley House: Delayed Timeline",
    category: "postmortem",
    excerpt: "What caused the 3-day delay on the Hartley House project and how to prevent it.",
    tags: ["postmortem", "timeline", "delay"],
    author: "Aditya",
    status: "draft",
    publishedAt: null,
    updatedAt: "2025-07-09"
  },
  {
    id: 5,
    title: "Fixed Price vs Hourly: Talking Points",
    category: "pricing_decision",
    excerpt: "Why we use fixed pricing and how to explain the value to prospects.",
    tags: ["pricing", "fixed-price", "sales"],
    author: "Prajwal",
    status: "published",
    publishedAt: "2025-07-01",
    updatedAt: "2025-07-01"
  }
]

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  const filteredArticles = sampleArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = activeCategory === "all" || article.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category)
    return cat ? cat.color : "text-mute"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl tracking-tight text-ink">
            Knowledge Base
          </h1>
          <p className="text-mute font-sans mt-2">
            {sampleArticles.length} articles · Processes, standards, and lessons
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-paper border border-hairline rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-sm font-sans rounded-md transition-colors ${
                viewMode === "list" 
                  ? "bg-ink text-paper" 
                  : "text-mute hover:text-ink"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-sm font-sans rounded-md transition-colors ${
                viewMode === "grid" 
                  ? "bg-ink text-paper" 
                  : "text-mute hover:text-ink"
              }`}
            >
              Grid
            </button>
          </div>
          <button className="px-4 py-2 text-sm font-sans bg-ink text-paper rounded-lg hover:bg-charcoal transition-colors">
            <Plus className="w-4 h-4 mr-2 inline" />
            New Article
          </button>
        </div>
      </div>

      {/* Search and category filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-paper border border-hairline rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-2 text-sm font-sans rounded-lg transition-colors whitespace-nowrap ${
              activeCategory === "all" 
                ? "bg-ink text-paper" 
                : "bg-paper border border-hairline text-mute hover:text-ink"
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-2 text-sm font-sans rounded-lg transition-colors whitespace-nowrap ${
                activeCategory === cat.id 
                  ? "bg-ink text-paper" 
                  : "bg-paper border border-hairline text-mute hover:text-ink"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Articles list */}
      {viewMode === "list" ? (
        <div className="space-y-4">
          {filteredArticles.map(article => (
            <div 
              key={article.id}
              className="bg-paper border border-hairline rounded-xl p-6 hover:border-coral/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-paper2 flex items-center justify-center`}>
                    {article.category === "process" ? (
                      <BookOpen className={`w-5 h-5 ${getCategoryColor(article.category)}`} />
                    ) : article.category === "lesson" ? (
                      <Lightbulb className={`w-5 h-5 ${getCategoryColor(article.category)}`} />
                    ) : (
                      <FileText className={`w-5 h-5 ${getCategoryColor(article.category)}`} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-sans font-medium text-ink text-lg">{article.title}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        article.status === "published" ? "bg-forest/10 text-forest" : "bg-gold/10 text-gold"
                      }`}>
                        {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-mute font-sans mb-2">{article.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-mute">
                      <span>By {article.author}</span>
                      {article.publishedAt && (
                        <span>Published {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      )}
                      <span>Updated {new Date(article.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-mute hover:text-ink hover:bg-paper2 rounded-lg transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 text-mute hover:text-ink hover:bg-paper2 rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-hairline">
                <Tag className="w-3 h-3 text-mute" />
                {article.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-2 py-0.5 bg-paper2 rounded text-xs text-mute"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Grid view */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map(article => (
            <div 
              key={article.id}
              className="bg-paper border border-hairline rounded-xl p-5 hover:border-coral/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg bg-paper2 flex items-center justify-center`}>
                  {article.category === "process" ? (
                    <BookOpen className={`w-5 h-5 ${getCategoryColor(article.category)}`} />
                  ) : article.category === "lesson" ? (
                    <Lightbulb className={`w-5 h-5 ${getCategoryColor(article.category)}`} />
                  ) : (
                    <FileText className={`w-5 h-5 ${getCategoryColor(article.category)}`} />
                  )}
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  article.status === "published" ? "bg-forest/10 text-forest" : "bg-gold/10 text-gold"
                }`}>
                  {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                </span>
              </div>

              <h3 className="font-sans font-medium text-ink mb-2">{article.title}</h3>
              <p className="text-sm text-mute mb-4 line-clamp-2">{article.excerpt}</p>

              <div className="flex items-center gap-2 mb-4">
                {article.tags.slice(0, 2).map(tag => (
                  <span 
                    key={tag}
                    className="px-2 py-0.5 bg-paper2 rounded text-xs text-mute"
                  >
                    {tag}
                  </span>
                ))}
                {article.tags.length > 2 && (
                  <span className="text-xs text-mute">+{article.tags.length - 2}</span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-mute">
                <span>By {article.author}</span>
                <span>
                  {article.publishedAt 
                    ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : "Draft"
                  }
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-paper2 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-mute" />
          </div>
          <h3 className="font-display text-xl text-ink mb-2">No articles found</h3>
          <p className="text-mute font-sans mb-4">Try adjusting your search or filters</p>
          <button className="px-4 py-2 text-sm font-sans bg-ink text-paper rounded-lg hover:bg-charcoal transition-colors">
            <Plus className="w-4 h-4 mr-2 inline" />
            New Article
          </button>
        </div>
      )}
    </div>
  )
}