import { Link } from "@inertiajs/react"
import {
  ActivitySquare,
  Building2,
  Github,
  LayoutDashboard,
  TrendingUp,
  Users,
} from "lucide-react"

import { NavFooter } from "@/components/nav-footer"
import { NavMain } from "@/components/nav-main"
import { NavTheme } from "@/components/nav-theme"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  activitiesPath,
  companiesPath,
  contactsPath,
  dashboardPath,
  dealsPath,
} from "@/routes"
import type { NavItem } from "@/types"

import AppLogo from "./app-logo"

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: dashboardPath(),
    icon: LayoutDashboard,
  },
  {
    title: "Contacts",
    href: contactsPath(),
    icon: Users,
  },
  {
    title: "Companies",
    href: companiesPath(),
    icon: Building2,
  },
  {
    title: "Deals",
    href: dealsPath(),
    icon: TrendingUp,
  },
  {
    title: "Activity Log",
    href: activitiesPath(),
    icon: ActivitySquare,
  },
]

const footerNavItems: NavItem[] = [
  {
    title: "Repository",
    href: "https://github.com/thomasklemm/rails-inertia-react-personal-crm",
    icon: Github,
  },
]

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="group-data-[collapsible=icon]:justify-center"
            >
              <Link href={dashboardPath()} prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={mainNavItems} />
      </SidebarContent>

      <SidebarFooter className="pb-4">
        <NavFooter items={footerNavItems} className="mt-auto">
          <NavTheme />
        </NavFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
