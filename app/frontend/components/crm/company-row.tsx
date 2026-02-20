import { ExternalLink, Users } from "lucide-react"

import { companyPath } from "@/routes"
import type { Company } from "@/types"

interface CompanyRowProps {
  company: Company
}

export function CompanyRow({ company }: CompanyRowProps) {
  return (
    <a
      href={companyPath(company.id)}
      className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground">
        {company.name[0].toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{company.name}</p>
        {company.website && (
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <ExternalLink className="size-3" />
            {company.website.replace(/^https?:\/\//, "")}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
        <Users className="size-4" />
        <span>{company.contacts_count ?? 0}</span>
      </div>
    </a>
  )
}
