"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Search, Plus, MoreHorizontal, Building2, ArrowRight } from "lucide-react"
import { listClients, addClient } from "@/lib/db/clients"
import { createCompany } from "@/lib/db/companies"
import { createContact } from "@/lib/db/contacts"
import { listTeamMembers } from "@/lib/db/contacts"
import { Modal } from "@/components/ui/Modal"
import { EmptyState } from "@/components/ui/EmptyState"
import { LoadingState } from "@/components/ui/LoadingState"
import { TextField } from "@/components/ui/TextField"
import { SelectField } from "@/components/ui/SelectField"
import type { Client, Organization } from "@/types/database"

export default function ClientsPage() {
  const [clients, setClients] = useState<(Client & { organization?: Organization })[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [teamOptions, setTeamOptions] = useState<{ value: string; label: string }[]>([])
  const [step, setStep] = useState<"company" | "contact" | "digital_assets">("company")

  const [companyForm, setCompanyForm] = useState({ name: "", website: "", country: "", city: "" })
  const [contactForm, setContactForm] = useState({ full_name: "", email: "" })
  const [digitalAssetsForm, setDigitalAssetsForm] = useState({
    domains: "" as string,
    current_cms: "",
    hosting: "",
    seo_sensitivity: "" as "" | "greenfield" | "low" | "medium" | "high" | "very_high" | "rebuild_with_migration",
    service_interests: [] as string[],
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    const [clientsData, team] = await Promise.all([
      listClients(),
      listTeamMembers(),
    ])
    setClients(clientsData)
    setTeamOptions(team.map(t => ({ value: t.id, label: t.full_name || t.email })))
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCreate = async () => {
    const company = await createCompany({ name: companyForm.name, website: companyForm.website, country: companyForm.country, city: companyForm.city })
    if ("error" in company) { alert(company.error); return }

    if (contactForm.full_name && contactForm.email) {
      await createContact({ org_id: company.id, email: contactForm.email, full_name: contactForm.full_name })
    }

    const result = await addClient({ org_id: company.id })
    if ("error" in result) { alert(result.error); return }

    setShowCreateModal(false)
    setCompanyForm({ name: "", website: "", country: "", city: "" })
    setContactForm({ full_name: "", email: "" })
    setDigitalAssetsForm({ domains: "", current_cms: "", hosting: "", seo_sensitivity: "", service_interests: [] })
    setStep("company")
    loadData()
  }

  if (loading) return <LoadingState />

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display tracking-tight">Clients</h1>
          <p className="text-mute text-sm mt-1">{clients.length} total clients</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-coral text-white text-sm rounded-lg hover:bg-coral/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No clients yet"
          description="Add your first client to start managing projects and revenue."
          actionLabel="Add Client"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="bg-paper border border-hairline rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hairline">
                <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Client</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id as string} className="border-b border-hairline last:border-0 hover:bg-paper2/50 transition-colors cursor-pointer">
                  <td className="px-5 py-4" colSpan={1}>
                    <Link href={`/studio/clients/${client.id}`} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-coral/10 flex items-center justify-center">
                          <span className="text-coral text-sm font-medium">
                            {((client.organization as Organization)?.name || "?").charAt(0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium group-hover:text-coral transition-colors">{(client.organization as Organization)?.name || "—"}</span>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className={`inline-flex items-center gap-1 text-xs ${
                              client.status === "active" ? "text-forest" : 
                              client.status === "onboarding" ? "text-inkblue" :
                              client.status === "at_risk" ? "text-coral" : "text-mute"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                client.status === "active" ? "bg-forest" :
                                client.status === "onboarding" ? "bg-inkblue" :
                                client.status === "at_risk" ? "bg-coral" : "bg-mute"
                              }`} />
                              {client.status as string}
                            </span>
                            <span className={`text-xs ${
                              client.health === "green" ? "text-forest" :
                              client.health === "yellow" ? "text-gold" : "text-coral"
                            }`}>
                              {client.health as string}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-mute">
                          {client.client_since ? new Date(client.client_since as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                        </span>
                        <ArrowRight className="w-4 h-4 text-mute opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add Client" size="lg">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setStep("company")}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${step === "company" ? "bg-ink text-paper" : "bg-paper2 text-mute"}`}
            >
              1. Company
            </button>
            <div className="w-6 h-px bg-hairline" />
            <button
              onClick={() => setStep("contact")}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${step === "contact" ? "bg-ink text-paper" : "bg-paper2 text-mute"}`}
            >
              2. Contact
            </button>
            <div className="w-6 h-px bg-hairline" />
            <button
              onClick={() => setStep("digital_assets")}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${step === "digital_assets" ? "bg-ink text-paper" : "bg-paper2 text-mute"}`}
            >
              3. Digital Assets
            </button>
          </div>

          {step === "company" && (
            <div className="space-y-4">
              <TextField label="Company Name" value={companyForm.name} onChange={(v) => setCompanyForm({ ...companyForm, name: v })} required />
              <TextField label="Website" value={companyForm.website} onChange={(v) => setCompanyForm({ ...companyForm, website: v })} placeholder="https://" />
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Country" value={companyForm.country} onChange={(v) => setCompanyForm({ ...companyForm, country: v })} />
                <TextField label="City" value={companyForm.city} onChange={(v) => setCompanyForm({ ...companyForm, city: v })} />
              </div>
              <div className="flex justify-end">
                <button onClick={() => setStep("contact")} disabled={!companyForm.name} className="px-4 py-2 text-sm bg-ink text-paper rounded-lg hover:bg-charcoal transition-colors disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          )}

          {step === "contact" && (
            <div className="space-y-4">
              <p className="text-xs text-mute">Optional: Add a primary contact for this company.</p>
              <TextField label="Full Name" value={contactForm.full_name} onChange={(v) => setContactForm({ ...contactForm, full_name: v })} />
              <TextField label="Email" value={contactForm.email} onChange={(v) => setContactForm({ ...contactForm, email: v })} type="email" />
              <div className="flex justify-between pt-2">
                <button onClick={() => setStep("company")} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Back</button>
                <button onClick={() => setStep("digital_assets")} className="px-4 py-2 text-sm bg-ink text-paper rounded-lg hover:bg-charcoal transition-colors">
                  Next
                </button>
              </div>
            </div>
          )}

          {step === "digital_assets" && (
            <div className="space-y-4">
              <p className="text-xs text-mute">Optional: Capture current digital assets and services they need.</p>
              <TextField label="Current Website Domains" value={digitalAssetsForm.domains} onChange={(v) => setDigitalAssetsForm({ ...digitalAssetsForm, domains: v })} placeholder="e.g. example.com, example2.com" />
              <div className="grid grid-cols-2 gap-4">
                <TextField label="Current CMS" value={digitalAssetsForm.current_cms} onChange={(v) => setDigitalAssetsForm({ ...digitalAssetsForm, current_cms: v })} placeholder="e.g. WordPress, Squarespace" />
                <TextField label="Hosting" value={digitalAssetsForm.hosting} onChange={(v) => setDigitalAssetsForm({ ...digitalAssetsForm, hosting: v })} placeholder="e.g. GoDaddy, AWS" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">SEO Sensitivity</label>
                <select
                  value={digitalAssetsForm.seo_sensitivity}
                  onChange={(e) => setDigitalAssetsForm({ ...digitalAssetsForm, seo_sensitivity: e.target.value as typeof digitalAssetsForm.seo_sensitivity })}
                  className="w-full h-10 px-3 bg-paper border border-hairline rounded-lg text-sm focus:outline-none focus:border-coral transition-colors"
                >
                  <option value="">Select (optional)</option>
                  <option value="greenfield">Greenfield — No existing SEO</option>
                  <option value="low">Low — Minimal organic traffic</option>
                  <option value="medium">Medium — Some organic traffic to preserve</option>
                  <option value="high">High — Significant organic traffic</option>
                  <option value="very_high">Very High — Primary lead channel</option>
                  <option value="rebuild_with_migration">Rebuild with Migration Required</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Services Interested In</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Websites", "Monthly Optimization", "AI Agents", "AI Email", "Lead Response", "CRM Automation", "WhatsApp/SMS", "Appointment Systems", "AI Knowledge", "Custom Dashboards"].map(service => (
                    <label key={service} className="flex items-center gap-2 p-2 border border-hairline rounded-lg hover:border-coral/30 transition-colors cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={digitalAssetsForm.service_interests.includes(service)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setDigitalAssetsForm({ ...digitalAssetsForm, service_interests: [...digitalAssetsForm.service_interests, service] })
                          } else {
                            setDigitalAssetsForm({ ...digitalAssetsForm, service_interests: digitalAssetsForm.service_interests.filter(s => s !== service) })
                          }
                        }}
                        className="w-3 h-3 accent-coral"
                      />
                      {service}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <button onClick={() => setStep("contact")} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Back</button>
                <button onClick={handleCreate} disabled={!companyForm.name} className="px-4 py-2 text-sm bg-ink text-paper rounded-lg hover:bg-charcoal transition-colors disabled:opacity-50">
                  Create Client
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
