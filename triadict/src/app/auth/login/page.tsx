"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/studio"
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <div className="bg-paper border border-hairline rounded-xl p-8">
      <h1 className="font-display text-2xl text-ink mb-2">Welcome back</h1>
      <p className="text-mute font-sans mb-6">Sign in to your account</p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-sans text-ink mb-2">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-paper border border-hairline rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-sans text-ink mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-paper border border-hairline rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4 rounded border-hairline text-coral focus:ring-coral/30" />
            <span className="text-sm font-sans text-mute">Remember me</span>
          </label>
          <Link href="/auth/forgot-password" className="text-sm font-sans text-coral hover:text-coral/80 transition-colors">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 text-sm font-sans bg-ink text-paper rounded-lg hover:bg-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-paper border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <svg 
              width="24" 
              height="24" 
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
            <span className="font-display text-2xl tracking-tight">Triadict</span>
          </Link>
        </div>

        <Suspense fallback={
          <div className="bg-paper border border-hairline rounded-xl p-8 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-coral border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <LoginForm />
        </Suspense>

        {/* Footer */}
        <p className="text-center text-sm text-mute font-sans mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-coral hover:text-coral/80 transition-colors">
            Sign up
          </Link>
        </p>

        {/* Dev bypass */}
        <div className="mt-4 p-4 bg-paper2 border border-hairline rounded-lg">
          <p className="text-xs font-mono text-mute mb-3 uppercase tracking-wider">Dev Mode — Quick Access</p>
          <div className="space-y-2">
            <Link 
              href="/studio/dashboard" 
              className="block w-full px-4 py-2.5 bg-ink text-paper text-sm text-center rounded-lg hover:bg-charcoal transition-colors"
            >
              Studio Dashboard
            </Link>
            <Link 
              href="/portal/dashboard" 
              className="block w-full px-4 py-2.5 border border-hairline text-sm text-center rounded-lg hover:bg-paper2 transition-colors"
            >
              Client Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}