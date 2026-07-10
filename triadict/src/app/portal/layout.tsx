"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { 
  LayoutDashboard, 
  FolderKanban, 
  FileText, 
  HeadphonesIcon,
  Settings,
  LogOut,
  Bell,
  Menu,
  X
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

const isDev = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')
const demoUser = { id: 'demo', email: 'client@example.com' } as User

const navLinks = [
  { href: "/portal/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/portal/project", label: "Project", icon: FolderKanban },
  { href: "/portal/invoices", label: "Invoices", icon: FileText },
  { href: "/portal/support", label: "Support", icon: HeadphonesIcon },
]

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      if (isDev) {
        setUser(demoUser)
        setLoading(false)
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      
      if (!user) {
        router.push("/auth/login?redirect=/portal")
      }
    }
    getUser()
  }, [supabase, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-coral border-t-transparent rounded-full animate-spin"></div>
          <span className="text-mute text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Skip to content */}
      <a 
        href="#main" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-ink focus:text-paper focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to content
      </a>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-paper border-b border-hairline z-50">
        <div className="h-full flex items-center justify-between px-4 md:px-8">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden w-10 h-10 flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/portal/dashboard" className="flex items-center gap-3">
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.25"
                className="text-coral"
              >
                <line x1="12" y1="5.5" x2="5.5" y2="17.5"/>
                <line x1="12" y1="5.5" x2="18.5" y2="17.5"/>
                <line x1="6" y1="18" x2="18" y2="18"/>
                <circle cx="12" cy="5.5" r="1.6" fill="currentColor"/>
                <circle cx="5.5" cy="18" r="1.6" fill="currentColor"/>
                <circle cx="18.5" cy="18" r="1.6" fill="currentColor"/>
              </svg>
              <span className="font-display text-lg tracking-tight">Portal</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Portal">
            {navLinks.map((link) => {
              const isActive = link.href === "/portal" 
                ? pathname === "/portal" 
                : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors
                    ${isActive 
                      ? "bg-coral/10 text-coral font-medium" 
                      : "text-mute hover:text-ink hover:bg-paper2"
                    }
                  `}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 flex items-center justify-center text-mute hover:text-ink transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-coral rounded-full"></span>
            </button>
            <div className="hidden md:flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-coral/10 flex items-center justify-center">
                <span className="text-coral text-sm font-medium">
                  {user.email?.charAt(0).toUpperCase() || "C"}
                </span>
              </div>
              <button 
                onClick={handleSignOut}
                className="text-sm text-mute hover:text-ink transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside className={`
        lg:hidden fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-paper border-r border-hairline z-40
        transition-transform duration-300
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <nav className="p-4 space-y-1">
          {navLinks.map((link) => {
            const isActive = link.href === "/portal" 
              ? pathname === "/portal" 
              : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors
                  ${isActive 
                    ? "bg-coral/10 text-coral font-medium" 
                    : "text-mute hover:text-ink hover:bg-paper2"
                  }
                `}
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main 
        id="main"
        className="pt-16 min-h-screen"
      >
        <div className="p-6 md:p-8 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}