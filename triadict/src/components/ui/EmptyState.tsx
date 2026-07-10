"use client"

import { Plus } from "lucide-react"

interface EmptyStateProps {
  icon: React.ElementType
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-paper2 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-mute" />
      </div>
      <h3 className="font-display text-xl text-ink mb-2">{title}</h3>
      <p className="text-mute font-sans text-sm mb-6 max-w-sm mx-auto">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-sans bg-ink text-paper rounded-lg hover:bg-charcoal transition-colors"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  )
}
