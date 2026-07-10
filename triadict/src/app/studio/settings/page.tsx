"use client"

import { useState } from "react"
import { User, Bell, Palette, Link2, CreditCard, LogOut } from "lucide-react"

const settingsSections = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
    content: (
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Display name</label>
          <input type="text" defaultValue="Studio" className="w-full max-w-md h-10 px-3 bg-paper border border-hairline rounded-lg text-sm focus:outline-none focus:border-coral transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input type="email" defaultValue="studio@triadic.studio" className="w-full max-w-md h-10 px-3 bg-paper border border-hairline rounded-lg text-sm focus:outline-none focus:border-coral transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Phone</label>
          <input type="tel" defaultValue="+91 826 299 6104" className="w-full max-w-md h-10 px-3 bg-paper border border-hairline rounded-lg text-sm focus:outline-none focus:border-coral transition-colors" />
        </div>
        <button className="px-4 py-2 bg-ink text-paper text-sm rounded-lg hover:bg-ink/90 transition-colors">
          Save changes
        </button>
      </div>
    ),
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    content: (
      <div className="space-y-4">
        {["New inquiry received", "Payment confirmed", "Project status update", "Invoice overdue"].map((item) => (
          <label key={item} className="flex items-center justify-between max-w-md py-2">
            <span className="text-sm">{item}</span>
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-hairline text-coral focus:ring-coral" />
          </label>
        ))}
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
            {["Light", "Dark", "System"].map((theme) => (
              <button key={theme} className="px-4 py-2 border border-hairline rounded-lg text-sm hover:border-coral/50 transition-colors">
                {theme}
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

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile")

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display tracking-tight">Settings</h1>
        <p className="text-mute text-sm mt-1">Manage your studio preferences</p>
      </div>

      <div className="flex gap-8">
        <nav className="w-48 flex-shrink-0 space-y-1">
          {settingsSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                activeSection === section.id
                  ? "bg-coral/10 text-coral font-medium"
                  : "text-mute hover:text-ink hover:bg-paper2"
              }`}
            >
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
