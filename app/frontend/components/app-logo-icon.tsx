import type { SVGAttributes } from "react"

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Background — matches the app's primary amber */}
      <rect width="120" height="120" rx="27" fill="oklch(0.58 0.178 50)" />

      {/* Head */}
      <circle cx="60" cy="38" r="19" fill="white" />

      {/* Shoulders */}
      <path d="M 12 108 A 48 48 0 0 1 108 108" fill="white" />
    </svg>
  )
}
