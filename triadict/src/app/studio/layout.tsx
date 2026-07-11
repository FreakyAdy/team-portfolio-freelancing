"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { 
  LayoutDashboard, 
  Handshake, 
  FolderKanban, 
  Users, 
  FileText, 
  Receipt, 
  Settings,
  BookOpen,
  ChevronDown,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ExternalLink
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { demoGetUser, demoLogout } from "@/lib/auth/demo"
import type { User } from "@supabase/supabase-js"

const isDev = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

const navSections: { label: string; items: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; external?: boolean }[] }[] = [
  {
    label: "Overview",
    items: [
      { href: "/studio/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/studio/deals", label: "Deals", icon: Handshake },
    ],
  },
  {
    label: "Delivery",
    items: [
      { href: "/studio/projects", label: "Projects", icon: FolderKanban },
      { href: "/studio/clients", label: "Clients", icon: Users },
      { href: "/studio/documents", label: "Documents", icon: FileText },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/studio/invoices", label: "Invoices", icon: Receipt },
      { href: "/studio/payments", label: "Payments", icon: FileText },
    ],
  },
  {
    label: "Resources",
    items: [
      { href: "/studio/templates", label: "Templates", icon: FileText },
      { href: "/studio/knowledge", label: "Knowledge", icon: BookOpen },
    ],
  },
  {
    label: "",
    items: [
      { href: "/", label: "View site", icon: ExternalLink, external: true },
    ],
  },
]

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      if (isDev) {
        const demoUser = demoGetUser()
        setUser(demoUser ? { id: 'demo', email: demoUser.email } as User : null)
        setLoading(false)
        if (!demoUser) {
          router.push("/auth/login?redirect=/studio")
        }
        return
      }
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        setLoading(false)
        
        if (!user) {
          router.push("/auth/login?redirect=/studio")
        }
      } else {
        setLoading(false)
        router.push("/auth/login?redirect=/studio")
      }
    }
    getUser()
  }, [supabase, router])

  const handleSignOut = async () => {
    if (isDev) {
      demoLogout()
      router.push("/")
      return
    }
    if (!isDev && supabase) {
      await supabase.auth.signOut()
    }
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

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-paper border-b border-hairline z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link href="/studio/dashboard" className="flex items-center gap-2">
            <img 
              src="/brand/logo.jpeg" 
              alt="Triadict" 
              className="w-6 h-6 rounded object-cover"
            />
            <span className="font-display text-lg tracking-tight">Studio</span>
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <Link 
            href="/"
            target="_blank"
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-mute hover:text-ink transition-colors rounded"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Site</span>
          </Link>
          <button className="w-10 h-10 flex items-center justify-center relative">
            <Bell className="w-5 h-5 text-mute" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-coral rounded-full"></span>
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-paper border-r border-hairline z-40 flex flex-col overflow-hidden
          transition-[width,transform] duration-300
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${sidebarOpen ? "w-60" : "w-16 max-lg:w-60"}
        `}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-3 border-b border-hairline shrink-0">
          <Link href="/studio/dashboard" className="flex items-center gap-2">
            <img 
              src="/brand/logo.jpeg" 
              alt="Triadict" 
              className="w-6 h-6 rounded-md object-cover flex-shrink-0"
            />
            {sidebarOpen && (
              <span className="font-display text-base tracking-tight">Studio</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="py-4 px-2 flex-1 overflow-y-auto min-h-0">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              {sidebarOpen && (
                <div className="px-2 mb-1.5 font-mono text-[9px] tracking-[0.14em] uppercase text-mute">
                  {section.label}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className={`
                        sidebar-link relative
                        ${isActive ? "active" : ""}
                        ${!sidebarOpen ? "justify-center px-0" : ""}
                      `}
                      title={item.label}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {sidebarOpen && <span className="truncate">{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="px-2 py-3 border-t border-hairline overflow-hidden shrink-0">
          {/* Settings */}
          <Link
            href="/studio/settings"
            className={`
              sidebar-link
              ${pathname.startsWith("/studio/settings") ? "active" : ""}
              ${!sidebarOpen ? "justify-center px-0" : ""}
            `}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Settings</span>}
          </Link>

          {/* User menu */}
          <div className={`mt-2 flex items-center gap-1.5 overflow-hidden ${!sidebarOpen ? "justify-center" : ""}`}>
            <div className="w-7 h-7 rounded-full bg-coral/10 flex items-center justify-center flex-shrink-0">
              <span className="text-coral text-xs font-medium">
                {user.email?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="text-xs font-medium truncate leading-tight">{user.email?.split("@")[0]}</div>
              </div>
            )}
            {sidebarOpen && (
              <button 
                onClick={handleSignOut}
                className="p-1 text-mute hover:text-ink transition-colors flex-shrink-0"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main 
        id="main"
        className={`
          transition-[margin] duration-300 min-h-screen min-w-0 pt-16 lg:pt-0
          ${sidebarOpen ? "lg:ml-60" : "lg:ml-16"}
        `}
      >
        {/* Top bar (desktop) */}
        <div className="hidden lg:flex h-16 border-b border-hairline items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-8 h-8 flex items-center justify-center text-mute hover:text-ink transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-64 h-9 pl-9 pr-4 bg-paper2 border border-hairline rounded-lg text-sm focus:outline-none focus:border-coral transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative w-9 h-9 flex items-center justify-center text-mute hover:text-ink transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-coral rounded-full"></span>
            </button>
            <Link 
              href="/"
              className="text-sm text-mute hover:text-ink transition-colors"
              target="_blank"
            >
              View site ↗
            </Link>
          </div>
        </div>

        {/* Page content */}
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}