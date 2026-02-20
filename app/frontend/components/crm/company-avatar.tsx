import type { Company } from "@/types"

const COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-amber-500",
  "bg-indigo-500",
  "bg-rose-500",
  "bg-cyan-500",
]

function colorForName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

interface CompanyAvatarProps {
  company: Pick<Company, "name">
  size?: "sm" | "md" | "lg"
}

export function CompanyAvatar({ company, size = "md" }: CompanyAvatarProps) {
  const initial = company.name[0].toUpperCase()
  const color = colorForName(company.name)

  const sizeClasses = {
    sm: "size-7 text-xs",
    md: "size-9 text-sm",
    lg: "size-12 text-base",
  }

  return (
    <div
      className={`${sizeClasses[size]} ${color} flex shrink-0 items-center justify-center rounded-lg font-semibold text-white`}
    >
      {initial}
    </div>
  )
}
