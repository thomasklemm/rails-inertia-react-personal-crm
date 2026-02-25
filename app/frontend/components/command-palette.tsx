import { router } from "@inertiajs/react"
import {
  ActivitySquare,
  Building2,
  FilePlus,
  Github,
  LayoutDashboard,
  Moon,
  PlusCircle,
  Search,
  Settings,
  Star,
  Sun,
  SunMoon,
  TrendingUp,
  User,
  UserPlus,
  Users,
} from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { useAppearance } from "@/hooks/use-appearance"
import { CompanyTagBadge, TagBadge } from "@/components/crm/tag-badge"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
} from "@/components/ui/command"
import {
  activitiesPath,
  companiesPath,
  contactsPath,
  dashboardPath,
  dealsPath,
  newCompanyPath,
  newContactPath,
  newDealPath,
  searchPath,
  settingsProfilePath,
} from "@/routes"
import type { CompanyTag, SearchResponse, SearchResultItem, Tag } from "@/types"

// Module-level trigger so the sidebar button can open the palette without props drilling.
export function openCommandPalette() {
  document.dispatchEvent(new CustomEvent("command-palette:open"))
}

const RESULT_ICONS = {
  contact: User,
  company: Building2,
  deal: TrendingUp,
} as const

const NAV_ITEMS = [
  { title: "Dashboard", href: dashboardPath(), icon: LayoutDashboard },
  { title: "Contacts", href: contactsPath(), icon: Users },
  { title: "Companies", href: companiesPath(), icon: Building2 },
  { title: "Deals", href: dealsPath(), icon: TrendingUp },
  { title: "Activity Log", href: activitiesPath(), icon: ActivitySquare },
]

const CREATE_ITEMS = [
  { title: "New Contact", href: newContactPath(), icon: UserPlus },
  { title: "New Company", href: newCompanyPath(), icon: FilePlus },
  { title: "New Deal", href: newDealPath(), icon: PlusCircle },
]

const GITHUB_URL =
  "https://github.com/thomasklemm/rails-inertia-react-personal-crm"

const THEME_ITEMS = [
  { value: "light" as const, label: "Light Mode", icon: Sun },
  { value: "dark" as const, label: "Dark Mode", icon: Moon },
  { value: "system" as const, label: "System Theme", icon: SunMoon },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResponse["results"]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { updateAppearance } = useAppearance()

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  // Custom event from sidebar button
  useEffect(() => {
    function onOpen() {
      setOpen(true)
    }
    document.addEventListener("command-palette:open", onOpen)
    return () => document.removeEventListener("command-palette:open", onOpen)
  }, [])

  // Close when Inertia finishes a navigation
  useEffect(() => {
    function onFinish() {
      setOpen(false)
    }
    document.addEventListener("inertia:finish", onFinish)
    return () => document.removeEventListener("inertia:finish", onFinish)
  }, [])

  // Debounced fetch
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${searchPath()}?q=${encodeURIComponent(query)}`,
          {
            headers: { Accept: "application/json" },
          },
        )
        const data = (await res.json()) as SearchResponse
        setResults(data.results)
      } finally {
        setLoading(false)
      }
    }, 200)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const handleSelect = useCallback((url: string) => {
    router.visit(url)
    setOpen(false)
    setQuery("")
  }, [])

  const handleExternalLink = useCallback((url: string) => {
    window.open(url, "_blank", "noopener,noreferrer")
    setOpen(false)
    setQuery("")
  }, [])

  const handleSetTheme = useCallback(
    (value: "light" | "dark" | "system") => {
      updateAppearance(value)
      setOpen(false)
      setQuery("")
    },
    [updateAppearance],
  )

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setQuery("")
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      showCloseButton={false}
      className="top-[15%] translate-y-0 sm:max-w-xl"
    >
      <CommandInput
        placeholder="Search contacts, companies, deals..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[380px]">
        {/* Nav items — always rendered so cmdk's built-in filter can match them */}
        <CommandGroup heading="Navigate">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <CommandItem
                key={item.href}
                value={item.title}
                onSelect={() => handleSelect(item.href)}
                className="flex items-center gap-3"
              >
                <div className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-md">
                  <Icon className="size-3.5" />
                </div>
                <span className="text-sm font-medium">{item.title}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        {/* Create actions */}
        <CommandGroup heading="Create">
          {CREATE_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <CommandItem
                key={item.href}
                value={item.title}
                onSelect={() => handleSelect(item.href)}
                className="flex items-center gap-3"
              >
                <div className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-md">
                  <Icon className="size-3.5" />
                </div>
                <span className="text-sm font-medium">{item.title}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        {/* Appearance */}
        <CommandGroup heading="Appearance">
          {THEME_ITEMS.map(({ value, label, icon: Icon }) => (
            <CommandItem
              key={value}
              value={label}
              onSelect={() => handleSetTheme(value)}
              className="flex items-center gap-3"
            >
              <div className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-md">
                <Icon className="size-3.5" />
              </div>
              <span className="text-sm font-medium">{label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Misc actions */}
        <CommandGroup heading="Actions">
          <CommandItem
            value="Open GitHub Repository"
            onSelect={() => handleExternalLink(GITHUB_URL)}
            className="flex items-center gap-3"
          >
            <div className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-md">
              <Github className="size-3.5" />
            </div>
            <span className="text-sm font-medium">Open GitHub Repository</span>
          </CommandItem>
          <CommandItem
            value="Open Settings"
            onSelect={() => handleSelect(settingsProfilePath())}
            className="flex items-center gap-3"
          >
            <div className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-md">
              <Settings className="size-3.5" />
            </div>
            <span className="text-sm font-medium">Open Settings</span>
          </CommandItem>
        </CommandGroup>

        {/* Server search results — value includes the query so cmdk never filters them out */}
        {query.length >= 2 && loading && (
          <CommandLoading>
            <div className="text-muted-foreground flex items-center gap-2 px-3 py-6 text-sm">
              <div className="border-muted-foreground/30 border-t-muted-foreground size-3.5 animate-spin rounded-full border-2" />
              Searching…
            </div>
          </CommandLoading>
        )}

        {query.length >= 2 &&
          results.map((group) => (
            <div key={group.group}>
              <CommandSeparator />
              <CommandGroup heading={group.group}>
                {group.items.map((item: SearchResultItem) => {
                  const Icon = RESULT_ICONS[item.type] ?? Search
                  return (
                    <CommandItem
                      key={`${item.type}-${item.id}`}
                      value={`${query} ${item.type} ${item.title}`}
                      onSelect={() => handleSelect(item.url)}
                      className="flex items-center gap-3"
                    >
                      <div className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-md">
                        <Icon className="size-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-medium">
                            {item.title}
                          </p>
                          {item.starred && (
                            <Star
                              className="shrink-0 fill-amber-400 text-amber-400"
                              style={{ width: 12, height: 12 }}
                            />
                          )}
                        </div>
                        {(item.subtitle != null ||
                          (item.tags && item.tags.length > 0)) && (
                          <div className="mt-0.5 flex items-center gap-1.5 overflow-hidden">
                            {item.subtitle && (
                              <p className="text-muted-foreground shrink-0 truncate text-xs">
                                {item.subtitle}
                              </p>
                            )}
                            {item.subtitle &&
                              item.tags &&
                              item.tags.length > 0 && (
                                <span className="text-muted-foreground/50 text-xs">
                                  ·
                                </span>
                              )}
                            {item.tags && item.tags.length > 0 && (
                              <span className="flex items-center gap-1">
                                {item.type === "contact" ? (
                                  <TagBadge tag={item.tags[0] as Tag} />
                                ) : (
                                  <CompanyTagBadge
                                    tag={item.tags[0] as CompanyTag}
                                  />
                                )}
                                {item.tags.length > 1 && (
                                  <span className="bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                                    +{item.tags.length - 1}
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </div>
          ))}

        {query.length >= 2 && !loading && (
          <CommandEmpty className="px-3 text-left">
            No results found.
          </CommandEmpty>
        )}
      </CommandList>
      <div className="text-muted-foreground border-t px-4 py-2 text-xs">
        <kbd className="bg-muted rounded px-1 py-0.5 font-mono text-xs">↑↓</kbd>{" "}
        navigate
        {" · "}
        <kbd className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
          ↵
        </kbd>{" "}
        select
        {" · "}
        <kbd className="bg-muted rounded px-1 py-0.5 font-mono text-xs">
          esc
        </kbd>{" "}
        close
      </div>
    </CommandDialog>
  )
}
