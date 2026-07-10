export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-coral border-t-transparent rounded-full animate-spin" />
        <span className="text-mute text-sm">Loading...</span>
      </div>
    </div>
  )
}
