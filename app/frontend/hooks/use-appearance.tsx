import { useCallback, useEffect, useState } from "react"

export type Appearance = "light" | "dark" | "system"

const prefersDark = () => {
  if (typeof window === "undefined") {
    return false
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

const applyTheme = (appearance: Appearance) => {
  const isDark =
    appearance === "dark" || (appearance === "system" && prefersDark())

  document.documentElement.classList.toggle("dark", isDark)
  document.documentElement.style.colorScheme = isDark ? "dark" : "light"
}

const mediaQuery = () => {
  if (typeof window === "undefined") {
    return null
  }

  return window.matchMedia("(prefers-color-scheme: dark)")
}

const handleSystemThemeChange = () => {
  const currentAppearance = localStorage.getItem("appearance") as Appearance
  applyTheme(currentAppearance ?? "system")
}

export function initializeTheme() {
  const savedAppearance =
    (localStorage.getItem("appearance") as Appearance) || "system"

  applyTheme(savedAppearance)

  mediaQuery()?.addEventListener("change", handleSystemThemeChange)
}

export function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>(() => {
    if (typeof window === "undefined") return "system"
    const saved = localStorage.getItem("appearance") as Appearance | null
    return saved ?? "system"
  })

  const updateAppearance = useCallback((mode: Appearance) => {
    setAppearance(mode)
    if (mode === "system") {
      localStorage.removeItem("appearance")
    } else {
      localStorage.setItem("appearance", mode)
    }
    applyTheme(mode)
    document.dispatchEvent(
      new CustomEvent("appearance-changed", { detail: mode }),
    )
  }, [])

  useEffect(() => {
    applyTheme(appearance)

    function onAppearanceChanged(e: Event) {
      setAppearance((e as CustomEvent<Appearance>).detail)
    }

    document.addEventListener("appearance-changed", onAppearanceChanged)

    // Do NOT remove the prefers-color-scheme listener here — it is owned by
    // initializeTheme() and must stay active for the lifetime of the app.
    return () => {
      document.removeEventListener("appearance-changed", onAppearanceChanged)
    }
  }, [appearance])

  return { appearance, updateAppearance } as const
}
