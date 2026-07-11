"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { demoSignup } from "@/lib/auth/demo"

const isDev = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project")

export default function SignupPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    if (isDev) {
      const result = demoSignup(fullName || email, email, password)
      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }
      router.push("/auth/login?type=client")
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/portal`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess("Check your email for a confirmation link.")
    setLoading(false)
  }

  const handleGoogleSignup = async () => {
    setError("")
    setSuccess("")
    setLoading(true)

    if (isDev) {
      setError("Google sign-up is not available in demo mode")
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/portal`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 group" aria-label="Triadict — home">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true" className="text-ink transition-colors duration-300 group-hover:text-coral">
            <line x1="12" y1="5.5" x2="5.5" y2="17.5" />
            <line x1="12" y1="5.5" x2="18.5" y2="17.5" />
            <line x1="6" y1="18" x2="18" y2="18" />
            <circle cx="12" cy="5.5" r="1.6" fill="currentColor" />
            <circle cx="5.5" cy="18" r="1.6" fill="currentColor" />
            <circle cx="18.5" cy="18" r="1.6" fill="currentColor" />
          </svg>
          <span className="font-display text-2xl tracking-tight">Triadict</span>
        </Link>
      </div>

      {/* Form card */}
      <div className="bg-paper border border-hairline rounded-xl p-8">
        <h1 className="font-display text-2xl text-ink mb-1">Create account</h1>
        <p className="text-mute text-sm mb-6">
          Join as a client to manage your projects
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-forest/10 border border-forest/20 rounded-lg">
            <p className="text-sm text-forest">{success}</p>
          </div>
        )}

        {isDev && (
          <div className="mb-4 p-3 bg-gold/10 border border-gold/20 rounded-lg">
            <p className="text-xs text-gold font-medium">
              Demo mode &mdash; account stored in browser localStorage
            </p>
          </div>
        )}

        {/* Google sign-up */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-hairline rounded-lg text-sm font-medium text-ink bg-paper hover:bg-paper2 hover:border-ink/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-hairline" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-paper px-3 text-mute uppercase tracking-wider">or sign up with email</span>
          </div>
        </div>

        {/* Email/password form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm text-ink mb-2">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-paper border border-hairline rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-colors"
                placeholder="Your name"
                required
                autoComplete="name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-ink mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-paper border border-hairline rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-colors"
                placeholder="you@company.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-ink mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-paper border border-hairline rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-colors"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mute hover:text-ink transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm text-ink mb-2">Confirm password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-paper border border-hairline rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-colors"
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 text-sm font-medium bg-ink text-paper rounded-lg hover:bg-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-paper border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Create account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-mute mt-6">
        Already have an account?{" "}
        <Link
          href="/auth/login?type=client"
          className="text-coral hover:text-coral/80 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
