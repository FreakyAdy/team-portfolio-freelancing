const STORAGE_KEY = "triadict_demo_user"

interface DemoUser {
  name: string
  email: string
}

const DEMO_CREDENTIALS = {
  email: "Aditya",
  password: "12324",
  user: { name: "Aditya", email: "Aditya" },
}

export function demoLogin(email: string, password: string): { user: DemoUser | null; error: string | null } {
  if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_CREDENTIALS.user))
    return { user: DEMO_CREDENTIALS.user, error: null }
  }
  return { user: null, error: "Invalid credentials" }
}

export function demoSignup(name: string, email: string, password: string): { success: boolean; error: string | null } {
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" }
  }
  const existing = localStorage.getItem("triadict_demo_users")
  const users: Array<{ name: string; email: string; password: string }> = existing ? JSON.parse(existing) : []
  if (users.some((u) => u.email === email)) {
    return { success: false, error: "Account already exists" }
  }
  users.push({ name, email, password })
  localStorage.setItem("triadict_demo_users", JSON.stringify(users))
  return { success: true, error: null }
}

export function demoGetUser(): DemoUser | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as DemoUser
  } catch {
    return null
  }
}

export function demoLogout(): void {
  localStorage.removeItem(STORAGE_KEY)
}
