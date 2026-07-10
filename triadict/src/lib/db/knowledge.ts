"use server"

import { createClient } from "@/lib/supabase/server"
import type { KnowledgeArticle, CreateKnowledgeInput, UpdateKnowledgeInput } from "@/types/database"

export async function listArticles(params?: {
  category?: string
  status?: string
  search?: string
  author_id?: string
}): Promise<KnowledgeArticle[]> {
  try {
    const supabase = await createClient()
    let query = supabase.from("knowledge_articles").select(`
      *,
      author:people!knowledge_articles_author_id_fkey (id, full_name)
    `).order("updated_at", { ascending: false })

    if (params?.category && params.category !== "all") query = query.eq("category", params.category)
    if (params?.status && params.status !== "all") query = query.eq("status", params.status)
    if (params?.search) {
      query = query.or(`title.ilike.%${params.search}%,content_md.ilike.%${params.search}%`)
    }

    const { data, error } = await query
    if (error) return []
    return data as unknown as KnowledgeArticle[]
  } catch {
    return []
  }
}

export async function getArticle(id: string): Promise<KnowledgeArticle | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("knowledge_articles")
      .select("*, author:people!knowledge_articles_author_id_fkey (id, full_name)")
      .eq("id", id)
      .single()
    if (error) return null
    return data as unknown as KnowledgeArticle
  } catch {
    return null
  }
}

export async function createArticle(input: CreateKnowledgeInput): Promise<KnowledgeArticle | { error: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Not authenticated" }

    const insertData: Record<string, unknown> = {
      org_id: "00000000-0000-0000-0000-000000000001",
      title: input.title,
      category: input.category,
      content_md: input.content_md,
      tags: input.tags || [],
      status: input.status || "draft",
      author_id: user.id,
    }

    if (input.status === "published") insertData.published_at = new Date().toISOString()

    const { data, error } = await supabase.from("knowledge_articles").insert(insertData).select().single()
    if (error) return { error: error.message }
    return data as KnowledgeArticle
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create article" }
  }
}

export async function updateArticle(input: UpdateKnowledgeInput): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { id, ...updates } = input

    const updateData: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() }
    if (updates.status === "published") updateData.published_at = new Date().toISOString()

    const { error } = await supabase.from("knowledge_articles").update(updateData).eq("id", id)
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update article" }
  }
}

export async function deleteArticle(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from("knowledge_articles").delete().eq("id", id)
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete article" }
  }
}

export async function getArticleCategories() {
  return [
    { id: "process", label: "Process", color: "text-coral" },
    { id: "standard", label: "Standard", color: "text-inkblue" },
    { id: "lesson", label: "Lesson Learned", color: "text-gold" },
    { id: "technical_pattern", label: "Technical Pattern", color: "text-forest" },
    { id: "sales_objection", label: "Sales Objection", color: "text-coral" },
    { id: "pricing_decision", label: "Pricing Decision", color: "text-mute" },
    { id: "postmortem", label: "Postmortem", color: "text-red-500" },
  ]
}
