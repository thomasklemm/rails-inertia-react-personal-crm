import type { Contact } from "@/types"

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

interface ContactAvatarProps {
  contact: Pick<Contact, "first_name" | "last_name">
  size?: "sm" | "md" | "lg"
}

export function ContactAvatar({ contact, size = "md" }: ContactAvatarProps) {
  const initials =
    `${contact.first_name[0]}${contact.last_name[0]}`.toUpperCase()
  const color = colorForName(contact.first_name + contact.last_name)

  const sizeClasses = {
    sm: "size-7 text-xs",
    md: "size-9 text-sm",
    lg: "size-12 text-base",
  }

  return (
    <div
      className={`${sizeClasses[size]} ${color} flex shrink-0 items-center justify-center rounded-full font-semibold text-white`}
    >
      {initials}
    </div>
  )
}
