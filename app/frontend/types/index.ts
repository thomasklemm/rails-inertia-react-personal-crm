import type { LucideIcon } from "lucide-react"

export interface Auth {
  user: User
  session: Pick<Session, "id">
}

export interface BreadcrumbItem {
  title: string
  href: string
}

export interface NavItem {
  title: string
  href: string
  icon?: LucideIcon | null
  isActive?: boolean
}

export interface FlashData {
  alert?: string
  notice?: string
}

export interface SharedProps {
  auth: Auth
}

export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  verified: boolean
  created_at: string
  updated_at: string
  [key: string]: unknown // This allows for additional properties...
}

export interface Session {
  id: string
  user_agent: string
  ip_address: string
  created_at: string
}

// ── CRM types ────────────────────────────────────────────────────────────────

export type Tag =
  | "customer"
  | "friend"
  | "investor"
  | "lead"
  | "partner"
  | "prospect"
  | "vip"
  | "vendor"

export type CompanyTag =
  | "saas"
  | "fintech"
  | "healthcare"
  | "agency"
  | "consulting"
  | "ecommerce"
  | "media"
  | "manufacturing"
  | "logistics"
  | "education"
  | "nonprofit"

export type ActivityKind = "note" | "call" | "email"

export interface Company {
  id: number
  name: string
  website: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  starred: boolean
  tags: CompanyTag[]
  contacts_count?: number
  created_at: string
  updated_at: string
}

export interface Contact {
  id: number
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  notes: string | null
  starred: boolean
  archived: boolean
  tags: Tag[]
  follow_up_at: string | null
  company: Company | null
  company_id: number | null
  created_at: string
  updated_at: string
}

export interface ActivitySubject {
  id: number
  type: "Contact" | "Company" | "Deal"
  name: string
}

export interface Activity {
  id: number
  kind: ActivityKind
  body: string
  subject: ActivitySubject
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  contacts_count: number
  companies_count: number
  activities_this_week: number
  deals_count: number
  pipeline_value: number
}

export type DealStage =
  | "lead"
  | "qualified"
  | "proposal"
  | "closed_won"
  | "closed_lost"

export interface Deal {
  id: number
  title: string
  stage: DealStage
  value: number // dollars (float, converted from value_cents server-side)
  value_cents: number
  closed_at: string | null
  notes: string | null
  contact: { id: number; first_name: string; last_name: string } | null
  company: { id: number; name: string } | null
  created_at: string
  updated_at: string
}

// ── Search types ─────────────────────────────────────────────────────────────

export interface SearchResultItem {
  id: number
  type: "contact" | "company" | "deal"
  title: string
  subtitle?: string | null
  starred?: boolean
  tags?: string[]
  url: string
}

export interface SearchResultGroup {
  group: string
  items: SearchResultItem[]
}

export interface SearchResponse {
  results: SearchResultGroup[]
}
