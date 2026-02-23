import type { SVGAttributes } from "react"

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient
          id="crm-bg"
          x1="0"
          y1="0"
          x2="120"
          y2="120"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="120" height="120" rx="27" fill="url(#crm-bg)" />

      {/* Connecting lines — drawn first so nodes sit on top */}
      <line x1="60" y1="28" x2="26" y2="88" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeOpacity="0.45" />
      <line x1="60" y1="28" x2="94" y2="88" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeOpacity="0.45" />
      <line x1="26" y1="88" x2="94" y2="88" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeOpacity="0.45" />

      {/* You — top node, larger */}
      <circle cx="60" cy="28" r="14" fill="white" />

      {/* Contact nodes — bottom two, slightly smaller + subtler */}
      <circle cx="26" cy="88" r="11" fill="white" fillOpacity="0.85" />
      <circle cx="94" cy="88" r="11" fill="white" fillOpacity="0.85" />
    </svg>
  )
}
