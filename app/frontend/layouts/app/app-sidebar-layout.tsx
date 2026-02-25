import type { PropsWithChildren } from "react"

import { AppContent } from "@/components/app-content"
import { AppShell } from "@/components/app-shell"
import { AppSidebar } from "@/components/app-sidebar"
import { AppSidebarHeader } from "@/components/app-sidebar-header"
import { CommandPalette } from "@/components/command-palette"
import { Toaster } from "@/components/ui/sonner"
import { useFlash } from "@/hooks/use-flash"
import type { BreadcrumbItem } from "@/types"

export default function AppSidebarLayout({
  children,
  breadcrumbs = [],
}: PropsWithChildren<{
  breadcrumbs?: BreadcrumbItem[]
}>) {
  useFlash()

  return (
    <AppShell variant="sidebar">
      <AppSidebar />
      <AppContent variant="sidebar" className="overflow-hidden">
        <AppSidebarHeader breadcrumbs={breadcrumbs} />
        {children}
      </AppContent>
      <Toaster richColors />
      <CommandPalette />
    </AppShell>
  )
}
