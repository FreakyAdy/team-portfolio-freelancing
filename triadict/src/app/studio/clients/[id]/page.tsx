"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Building2, Users, FolderKanban, DollarSign,
  MoreHorizontal, AlertCircle, Edit3, ExternalLink,
} from "lucide-react"
import { getClient, updateClient, addClient } from "@/lib/db/clients"
import { listContacts } from "@/lib/db/contacts"
import { listProjects } from "@/lib/db/projects"
import { listInvoices } from "@/lib/db/invoices"
import { listPayments } from "@/lib/db/payments"
import { Modal } from "@/components/ui/Modal"
import { LoadingState } from "@/components/ui/LoadingState"
import { TextField } from "@/components/ui/TextField"
import { SelectField } from "@/components/ui/SelectField"
import type { Client, ClientStatus, ClientHealth, Organization as OrgType, Person, Project, Invoice, Payment } from "@/types/database"

const tabs = [
  { id: "overview", label: "Overview", icon: Building2 },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "financials", label: "Financials", icon: DollarSign },
]

const statusColors: Record<string, string> = {
  active: "bg-forest/10 text-forest",
  onboarding: "bg-inkblue/10 text-inkblue",
  at_risk: "bg-coral/10 text-coral",
  churned: "bg-mute/10 text-mute",
}

const healthColors: Record<string, string> = {
  green: "bg-forest/10 text-forest",
  yellow: "bg-gold/10 text-gold",
  red: "bg-coral/10 text-coral",
}

function InfoRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-hairline last:border-0">
      <span className="text-sm text-mute">{label}</span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-coral hover:text-coral/80 flex items-center gap-1">
          {value} <ExternalLink className="w-3 h-3" />
        </a>
      ) : (
        <span className="text-sm text-ink font-medium">{value}</span>
      )}
    </div>
  )
}

function Badge({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  )
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<(Client & { organization?: OrgType }) | null>(null)
  const [contacts, setContacts] = useState<Person[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [invoices, setInvoices] = useState<(Invoice & { client?: { name: string } })[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [editField, setEditField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState<{ status: ClientStatus; health: ClientHealth; notes: string }>({ status: "active", health: "green", notes: "" })
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    const c = await getClient(clientId)
    if (!c) { setLoading(false); return }
    setClient(c)

    const orgId = c.org_id
    const [contactsData, projectsData, invoicesData, paymentsData] = await Promise.all([
      listContacts({ org_id: orgId }),
      listProjects(),
      listInvoices({ client_org_id: orgId }),
      listPayments({ client_org_id: orgId }),
    ])
    setContacts(contactsData as Person[])
    setProjects(projectsData.filter(p => p.client_org_id === orgId))
    setInvoices(invoicesData)
    setPayments(paymentsData)
    setLoading(false)
  }, [clientId])

  useEffect(() => { loadData() }, [loadData])

  const handleSaveField = async (field: string, value: unknown) => {
    const result = await updateClient(clientId, { [field]: value })
    if ("error" in result) { alert(result.error); return }
    setEditField(null)
    loadData()
  }

  const handleEditClient = async () => {
    const result = await updateClient(clientId, editForm)
    if ("error" in result) { alert(result.error); return }
    setShowEditModal(false)
    loadData()
  }

  const handleDelete = async () => {
    // We don't have deleteClient yet; just go back
    router.push("/studio/clients")
  }

  const startEdit = (field: string, currentValue: string | null) => {
    setEditField(field)
    setEditValue(currentValue || "")
  }

  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.amount_cents || 0), 0)
  const totalPaid = payments.reduce((sum, p) => sum + p.amount_cents, 0)
  const totalOutstanding = totalInvoiced - totalPaid

  if (loading) return <LoadingState />
  if (!client) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <AlertCircle className="w-12 h-12 text-mute mx-auto mb-4" />
        <h2 className="font-display text-xl text-ink mb-2">Client not found</h2>
        <p className="text-mute text-sm mb-6">This client doesn't exist or has been deleted.</p>
        <Link href="/studio/clients" className="text-sm text-coral hover:text-coral/80">Back to Clients</Link>
      </div>
    )
  }

  const org = client.organization as OrgType | undefined

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-mute">
        <Link href="/studio/clients" className="hover:text-ink transition-colors">Clients</Link>
        <span>/</span>
        <span className="text-ink font-medium truncate">{org?.name || "Client"}</span>
      </div>

      <div className="bg-paper border border-hairline rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Link href="/studio/clients" className="p-2 text-mute hover:text-ink hover:bg-paper2 rounded-lg transition-colors mt-1">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-coral/10 flex items-center justify-center">
                  <span className="text-coral text-lg font-medium">{(org?.name || "?").charAt(0)}</span>
                </div>
                <div>
                  <h1 className="font-display text-3xl tracking-tight text-ink">{org?.name || "Unknown Client"}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge label={client.status} colorClass={statusColors[client.status] || "bg-mute/10 text-mute"} />
                    <Badge label={client.health} colorClass={healthColors[client.health] || "bg-mute/10 text-mute"} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditForm({ status: client.status as ClientStatus, health: client.health as ClientHealth, notes: client.notes || "" }); setShowEditModal(true) }}
              className="px-3 py-1.5 text-sm border border-hairline rounded-lg hover:bg-paper2 transition-colors flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
            <div className="relative group">
              <button className="p-2 text-mute hover:text-ink hover:bg-paper2 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-40 bg-paper border border-hairline rounded-lg shadow-lg z-10 py-1 hidden group-hover:block">
                <button onClick={() => setShowDeleteModal(true)} className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-paper2 transition-colors">
                  Delete Client
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-hairline overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-sans border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-coral text-ink font-medium"
                : "border-transparent text-mute hover:text-ink hover:border-hairline"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-paper border border-hairline rounded-xl p-6">
              <h2 className="font-display text-lg tracking-tight text-ink mb-4">Organization Info</h2>
              <div className="space-y-4">
                <InfoRow label="Name" value={org?.name || "—"} />
                <InfoRow label="Type" value={org?.type || "—"} />
              </div>
            </div>

            <div className="bg-paper border border-hairline rounded-xl p-6">
              <h2 className="font-display text-lg tracking-tight text-ink mb-4">Account Details</h2>
              <div className="space-y-4">
                <InfoRow label="Status" value={client.status} />
                <InfoRow label="Health" value={client.health} />
                <InfoRow label="Client Since" value={client.client_since ? new Date(client.client_since).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "—"} />
                <InfoRow label="Communication" value={client.communication_preference || "—"} />
                <InfoRow label="Expansion Potential" value={client.expansion_potential || "—"} />
                <InfoRow label="Account Owner" value={client.account_owner?.full_name || client.account_owner?.email || "—"} />
              </div>
            </div>
          </div>

          <div className="bg-paper border border-hairline rounded-xl p-6">
            <h2 className="font-display text-lg tracking-tight text-ink mb-4">Notes</h2>
            <EditableField
              field="notes"
              display={client.notes || "—"}
              editField={editField}
              editValue={editValue}
              multiline
              onStart={() => startEdit("notes", client.notes)}
              onSave={() => handleSaveField("notes", editValue)}
              onCancel={() => setEditField(null)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-paper border border-hairline rounded-xl p-4">
              <p className="text-xs text-mute font-sans mb-1">Total Invoiced</p>
              <p className="text-2xl font-display text-ink">${(totalInvoiced / 100).toLocaleString()}</p>
            </div>
            <div className="bg-paper border border-hairline rounded-xl p-4">
              <p className="text-xs text-mute font-sans mb-1">Total Paid</p>
              <p className="text-2xl font-display text-forest">${(totalPaid / 100).toLocaleString()}</p>
            </div>
            <div className="bg-paper border border-hairline rounded-xl p-4">
              <p className="text-xs text-mute font-sans mb-1">Outstanding</p>
              <p className={`text-2xl font-display ${totalOutstanding > 0 ? "text-coral" : "text-mute"}`}>
                ${(totalOutstanding / 100).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "contacts" && (
        <div className="bg-paper border border-hairline rounded-xl overflow-hidden">
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-8 h-8 text-mute mb-3" />
              <p className="text-sm text-mute">No contacts found for this client.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Name</th>
                  <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Email</th>
                  <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map(contact => (
                  <tr key={contact.id} className="border-b border-hairline last:border-0 hover:bg-paper2/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-inkblue/10 flex items-center justify-center">
                          <span className="text-inkblue text-sm font-medium">{(contact.full_name || "?").charAt(0)}</span>
                        </div>
                        <span className="text-sm font-medium text-ink">{contact.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <a href={`mailto:${contact.email}`} className="text-sm text-coral hover:text-coral/80">{contact.email}</a>
                    </td>
                    <td className="px-5 py-4 text-sm text-mute">{contact.role || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "projects" && (
        <div className="bg-paper border border-hairline rounded-xl overflow-hidden">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderKanban className="w-8 h-8 text-mute mb-3" />
              <p className="text-sm text-mute mb-2">No projects yet.</p>
              <Link href="/studio/projects" className="text-sm text-coral hover:text-coral/80">Create a project</Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Project</th>
                  <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Status</th>
                  <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Phase</th>
                  <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Value</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(project => (
                  <tr key={project.id} className="border-b border-hairline last:border-0 hover:bg-paper2/50 transition-colors">
                    <td className="px-5 py-4">
                      <Link href={`/studio/projects/${project.id}`} className="text-sm font-medium text-ink hover:text-coral transition-colors">
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Badge label={project.status} colorClass={project.status === "active" ? "bg-forest/10 text-forest" : project.status === "onboarding" ? "bg-inkblue/10 text-inkblue" : project.status === "completed" ? "bg-mute/10 text-mute" : "bg-coral/10 text-coral"} />
                    </td>
                    <td className="px-5 py-4 text-sm text-mute">{project.phase}</td>
                    <td className="px-5 py-4 text-sm font-medium text-ink">${(project.contract_value_cents / 100).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "financials" && (
        <div className="space-y-6">
          <div className="bg-paper border border-hairline rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-hairline">
              <h2 className="font-display text-base tracking-tight text-ink">Invoices</h2>
            </div>
            {invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-mute">No invoices yet.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hairline">
                    <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Invoice</th>
                    <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Amount</th>
                    <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Status</th>
                    <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id} className="border-b border-hairline last:border-0 hover:bg-paper2/50 transition-colors">
                      <td className="px-5 py-4 text-sm font-medium text-ink">{inv.number || inv.id.slice(0, 8)}</td>
                      <td className="px-5 py-4 text-sm text-ink">${((inv.amount_cents || 0) / 100).toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <Badge label={inv.status} colorClass={inv.status === "paid" ? "bg-forest/10 text-forest" : inv.status === "sent" ? "bg-inkblue/10 text-inkblue" : inv.status === "overdue" ? "bg-coral/10 text-coral" : "bg-mute/10 text-mute"} />
                      </td>
                      <td className="px-5 py-4 text-sm text-mute">{inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-paper border border-hairline rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-hairline">
              <h2 className="font-display text-base tracking-tight text-ink">Payments</h2>
            </div>
            {payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-mute">No payments recorded yet.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-hairline">
                    <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Date</th>
                    <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Amount</th>
                    <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Method</th>
                    <th className="text-left text-xs font-mono uppercase tracking-wider text-mute px-5 py-3">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id} className="border-b border-hairline last:border-0 hover:bg-paper2/50 transition-colors">
                      <td className="px-5 py-4 text-sm text-mute">{p.received_at ? new Date(p.received_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}</td>
                      <td className="px-5 py-4 text-sm font-medium text-forest">${(p.amount_cents / 100).toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm text-mute">{p.method || "—"}</td>
                      <td className="px-5 py-4 text-sm text-mute">{p.reference || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Client">
        <div className="space-y-4">
          <SelectField
            label="Status"
            value={editForm.status}
            onChange={(v) => setEditForm({ ...editForm, status: v as ClientStatus })}
            options={[
              { value: "active", label: "Active" },
              { value: "onboarding", label: "Onboarding" },
              { value: "at_risk", label: "At Risk" },
              { value: "churned", label: "Churned" },
            ]}
          />
          <SelectField
            label="Health"
            value={editForm.health}
            onChange={(v) => setEditForm({ ...editForm, health: v as ClientHealth })}
            options={[
              { value: "green", label: "Green" },
              { value: "yellow", label: "Yellow" },
              { value: "red", label: "Red" },
            ]}
          />
          <TextField label="Notes" value={editForm.notes} onChange={(v) => setEditForm({ ...editForm, notes: v })} multiline />
          <div className="flex justify-end gap-3 pt-2 border-t border-hairline">
            <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Cancel</button>
            <button onClick={handleEditClient} className="px-4 py-2 text-sm bg-ink text-paper rounded-lg hover:bg-charcoal transition-colors">Save</button>
          </div>
        </div>
      </Modal>

      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Client">
        <p className="text-sm text-mute mb-6">Are you sure you want to delete this client? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm text-mute hover:text-ink transition-colors">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  )
}

function EditableField({
  field, display, editField, editValue, onStart, onSave, onCancel, multiline
}: {
  field: string; display: string; editField: string | null; editValue: string;
  onStart: () => void; onSave: () => void; onCancel: () => void; multiline?: boolean
}) {
  const isEditing = editField === field
  if (isEditing) {
    return (
      <div className="flex items-start gap-2">
        {multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => { /* value is managed by parent via editValue prop; this is read-only here but we need the textarea for display */ }}
            className="flex-1 px-3 py-2 bg-paper2 border border-coral rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral/30 min-h-[80px]"
            readOnly
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => { /* same */ }}
            className="flex-1 px-3 py-2 bg-paper2 border border-coral rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coral/30"
            readOnly
          />
        )}
        <p className="text-xs text-coral mt-1">Edit via modal instead</p>
      </div>
    )
  }
  return (
    <div className="group flex items-center justify-between">
      <p className="text-sm text-ink whitespace-pre-wrap">{display}</p>
      <button onClick={onStart} className="opacity-0 group-hover:opacity-100 p-1 text-mute hover:text-ink transition-all">
        <Edit3 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
