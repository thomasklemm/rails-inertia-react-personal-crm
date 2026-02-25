import { CalendarDays } from "lucide-react"
import { useState } from "react"

import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  isToday,
  isYesterday,
  toDateString,
  todayDateString,
  yesterdayDateString,
} from "@/lib/dates"
import { cn } from "@/lib/utils"

interface ActivityDatePickerProps {
  /** "YYYY-MM-DD" or any ISO string — only the date portion is used. */
  value: string
  onChange: (date: string) => void
}

export function ActivityDatePicker({
  value,
  onChange,
}: ActivityDatePickerProps) {
  const [open, setOpen] = useState(false)

  // Parse using local date components to avoid UTC-midnight timezone issues
  const dateKey = value.slice(0, 10)
  const [yr, mo, dy] = dateKey.split("-").map(Number)
  const selectedDate = new Date(yr, mo - 1, dy)

  function handleDaySelect(date: Date | undefined) {
    if (date) {
      onChange(toDateString(date))
      setOpen(false)
    }
  }

  function handlePreset(dateStr: string) {
    onChange(dateStr)
    setOpen(false)
  }

  const label = isToday(value)
    ? "Today"
    : isYesterday(value)
      ? "Yesterday"
      : new Date(yr, mo - 1, dy).toLocaleDateString("en", {
          month: "short",
          day: "numeric",
          ...(yr !== new Date().getFullYear() ? { year: "numeric" } : {}),
        })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
        >
          <CalendarDays className="size-3.5" />
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {/* Presets */}
        <div className="border-border flex gap-1 border-b p-2">
          <button
            type="button"
            onClick={() => handlePreset(todayDateString())}
            className={cn(
              "rounded px-3 py-1.5 text-xs font-medium transition-colors",
              isToday(value)
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => handlePreset(yesterdayDateString())}
            className={cn(
              "rounded px-3 py-1.5 text-xs font-medium transition-colors",
              isYesterday(value)
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            Yesterday
          </button>
        </div>
        {/* Calendar */}
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDaySelect}
          disabled={(date) => date > new Date()}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
