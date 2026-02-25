import { useState } from "react"
import { Github, Moon, Sun, SunMoon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAppearance } from "@/hooks/use-appearance"
import type { Appearance } from "@/hooks/use-appearance"

const modes: Appearance[] = ["light", "dark", "system"]

const appearanceConfig = {
  light: { label: "Light", Icon: Sun },
  dark: { label: "Dark", Icon: Moon },
  system: { label: "System", Icon: SunMoon },
} as const

const repoUrl =
  "https://github.com/thomasklemm/rails-inertia-react-personal-crm"

export function NavTheme() {
  const { appearance, updateAppearance } = useAppearance()
  const { state, isMobile } = useSidebar()
  const [tooltipOpen, setTooltipOpen] = useState(false)

  const { Icon } = appearanceConfig[appearance]

  const cycleAppearance = () => {
    const idx = modes.indexOf(appearance)
    updateAppearance(modes[(idx + 1) % modes.length])
  }

  if (state === "collapsed" && !isMobile) {
    return (
      <>
        <SidebarMenuItem>
          <Tooltip open={tooltipOpen}>
            <TooltipTrigger asChild>
              <SidebarMenuButton
                onMouseEnter={() => setTooltipOpen(true)}
                onMouseLeave={() => setTooltipOpen(false)}
                onClick={cycleAppearance}
                className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
              >
                <Icon className="h-4 w-4" />
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right">Change Appearance</TooltipContent>
          </Tooltip>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMenuButton
                asChild
                className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
              >
                <a href={repoUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" />
                </a>
              </SidebarMenuButton>
            </TooltipTrigger>
            <TooltipContent side="right">Repository</TooltipContent>
          </Tooltip>
        </SidebarMenuItem>
      </>
    )
  }

  return (
    <SidebarMenuItem>
      <div className="flex h-8 items-center justify-between px-2">
        <div className="flex items-center gap-0.5 rounded-md bg-black/10 p-0.5 dark:bg-white/10">
          {modes.map((mode) => {
            const { Icon: ModeIcon, label: modeLabel } = appearanceConfig[mode]
            return (
              <Tooltip key={mode}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => updateAppearance(mode)}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded transition-colors",
                      appearance === mode
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <ModeIcon className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{modeLabel}</TooltipContent>
              </Tooltip>
            )
          })}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground flex h-6 w-6 items-center justify-center rounded transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
            </a>
          </TooltipTrigger>
          <TooltipContent>Repository</TooltipContent>
        </Tooltip>
      </div>
    </SidebarMenuItem>
  )
}
