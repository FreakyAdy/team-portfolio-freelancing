"use client"

import { useState, useEffect, useCallback } from "react"
import { User, Bell, Palette, Link2, CheckCircle2 } from "lucide-react"
import { getCurrentPerson, updateProfile, updateOrgSettings } from "@/lib/db/settings"
import { TextField } from "@/components/ui/TextField"

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile")
  const [profileData, setProfileData] = useState({ full_name: "", email: "", phone: "" })
  const [orgSettings, setOrgSettings] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [theme, setTheme] = useState("light")
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    "New inquiry received": true,
    "Payment confirmed": true,
    "Project status update": true,
    "Invoice overdue": false,
  })

  const loadData = useCallback(async () => {
    const person = await getCurrentPerson()
    if (person) {
      setProfileData({
        full_name: person.full_name || "",
        email: person.email || "",
        phone: (person as unknown as { phone?: string }).phone || "",
      })
      if (person.organization?.settings) {
        setOrgSettings(person.organization.settings as Record<string, unknown>)
        const orgSettingsData = person.organization.settings as Record<string, unknown>
        if (orgSettingsData.theme) setTheme(orgSettingsData.theme as string)
        if (orgSettingsData.notifications) {
          setNotifications(orgSettingsData.notifications as Record<string, boolean>)
        }
      }
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaved(false)
    const result = await updateProfile(profileData)
    if (result.error) { alert(result.error); setSaving(false); return }
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSaveNotifications = async () => {
    setSaving(true)
    const result = await updateOrgSettings({ notifications })
    if (result.error) { alert(result.error); setSaving(false); return }
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSaveTheme = async (newTheme: string) => {
    setTheme(newTheme)
    setSaving(true)
    const result = await updateOrgSettings({ theme: newTheme })
    if (result.error) { alert(result.error); setSaving(false); return }
    setSaving(false)
  }

  const settingsSections = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      content: (
        <div className="space-y-5">
          <TextField label="Display name" value={profileData.full_name} onChange={(v) => setProfileData({ ...profileData, full_name: v })} />
          <TextField label="Email" value={profileData.email} onChange={(v) => setProfileData({ ...profileData, email: v })} type="email" />
          <TextField label="Phone" value={profileData.phone} onChange={(v) => setProfileData({ ...profileData, phone: v })} type="tel" />
          <div className="flex items-center gap-3">
            <button onClick={handleSaveProfile} disabled={saving} className="px-4 py-2 bg-ink text-paper text-sm rounded-lg hover:bg-ink/90 transition-colors disabled:opacity-50">
              {saving ? "Saving..." : "Save changes"}
            </button>
            {saved && <span className="text-sm text-forest flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Saved</span>}
          </div>
        </div>
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      content: (
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between max-w-md py-2">
              <span className="text-sm">{key}</span>
              <input type="checkbox" checked={value} onChange={() => setNotifications({ ...notifications, [key]: !value })} className="w-4 h-4 rounded border-hairline text-coral focus:ring-coral" />
            </label>
          ))}
          <button onClick={handleSaveNotifications} disabled={saving} className="px-4 py-2 bg-ink text-paper text-sm rounded-lg hover:bg-ink/90 transition-colors disabled:opacity-50">
            Save preferences
          </button>
        </div>
      ),
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <div className="flex items-center gap-3">
              {["Light", "Dark", "System"].map((t) => (
                <button key={t} onClick={() => handleSaveTheme(t.toLowerCase())}
                  className={`px-4 py-2 border rounded-lg text-sm transition-colors ${theme === t.toLowerCase() ? "border-coral bg-coral/5 text-coral" : "border-hairline hover:border-coral/50"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "integrations",
      label: "Integrations",
      icon: Link2,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between max-w-md py-3 border-b border-hairline">
            <div>
              <div className="text-sm font-medium">Stripe</div>
              <div className="text-xs text-mute">Payment processing</div>
            </div>
            <button className="px-3 py-1.5 text-xs border border-hairline rounded-lg hover:bg-paper2 transition-colors">Connect</button>
          </div>
          <div className="flex items-center justify-between max-w-md py-3 border-b border-hairline">
            <div>
              <div className="text-sm font-medium">Calendly</div>
              <div className="text-xs text-mute">Discovery call scheduling</div>
            </div>
            <button className="px-3 py-1.5 text-xs border border-hairline rounded-lg hover:bg-paper2 transition-colors">Connect</button>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display tracking-tight">Settings</h1>
        <p className="text-mute text-sm mt-1">Manage your studio preferences</p>
      </div>

      <div className="flex gap-8">
        <nav className="w-48 flex-shrink-0 space-y-1">
          {settingsSections.map((section) => (
            <button key={section.id} onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${activeSection === section.id ? "bg-coral/10 text-coral font-medium" : "text-mute hover:text-ink hover:bg-paper2"}`}>
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </nav>
        <div className="flex-1 max-w-2xl">
          {settingsSections.find((s) => s.id === activeSection)?.content}
        </div>
      </div>
    </div>
  )
}
