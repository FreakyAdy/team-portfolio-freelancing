import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Triadict — Sign in",
  description: "Access your Triadict Studio or Client portal.",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-10 h-16 md:h-[76px] border-b border-hairline">
        <Link href="/" className="inline-flex items-center gap-3 group" aria-label="Triadict — home">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true" className="text-ink transition-colors duration-300 group-hover:text-coral">
            <line x1="12" y1="5.5" x2="5.5" y2="17.5" />
            <line x1="12" y1="5.5" x2="18.5" y2="17.5" />
            <line x1="6" y1="18" x2="18" y2="18" />
            <circle cx="12" cy="5.5" r="1.6" fill="currentColor" />
            <circle cx="5.5" cy="18" r="1.6" fill="currentColor" />
            <circle cx="18.5" cy="18" r="1.6" fill="currentColor" />
          </svg>
          <span className="font-display text-[22px] tracking-tight leading-none">Triadict</span>
        </Link>
        <Link
          href="/"
          className="font-mono text-[11px] tracking-[0.14em] uppercase text-mute hover:text-ink transition-colors"
        >
          Back to site
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        {children}
      </main>

      <footer className="px-6 md:px-10 py-5 border-t border-hairline">
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.14em] uppercase text-mute">
          <span>Triadict Studio</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}
