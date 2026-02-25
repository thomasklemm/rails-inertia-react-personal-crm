import { useState } from "react"
import { Moon, Sun, SunMoon } from "lucide-react"

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

export function NavTheme() {
  const { appearance, updateAppearance } = useAppearance()
  const { state } = useSidebar()
  const [tooltipOpen, setTooltipOpen] = useState(false)

  const { Icon } = appearanceConfig[appearance]

  const cycleAppearance = () => {
    const idx = modes.indexOf(appearance)
    updateAppearance(modes[(idx + 1) % modes.length])
  }

  if (state === "collapsed") {
    return (
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
    )
  }

  return (
    <SidebarMenuItem>
      <div className="flex h-8 items-center px-2">
        <span className="flex-1 text-sm text-neutral-600 dark:text-neutral-300">
          Appearance
        </span>
        <div className="flex gap-0.5 rounded-md border p-0.5">
          {modes.map((mode) => {
            const { Icon: ModeIcon, label: modeLabel } = appearanceConfig[mode]
            return (
              <button
                key={mode}
                onClick={() => updateAppearance(mode)}
                title={modeLabel}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded transition-colors",
                  appearance === mode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <ModeIcon className="h-3.5 w-3.5" />
              </button>
            )
          })}
        </div>
      </div>
    </SidebarMenuItem>
  )
}
