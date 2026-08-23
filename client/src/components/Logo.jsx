// IH Academy — official hexagon navy logo.
// Self-contained inline SVG so it renders identically on light and dark
// surfaces. A thin neutral ring keeps the navy fill legible on the dark
// dashboard sidebar.
export default function Logo({ className = 'h-8 w-8', title = 'IH Academy' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ihLogoHex" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="55%" stopColor="#16335c" />
          <stop offset="100%" stopColor="#0b1f3f" />
        </linearGradient>
      </defs>
      <path
        d="M32 3 L57 17 L57 47 L32 61 L7 47 L7 17 Z"
        fill="url(#ihLogoHex)"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="1.5"
      />
      <text
        x="32"
        y="41"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        fontSize="24"
        fontWeight="800"
        fill="#ffffff"
        letterSpacing="1"
      >
        IH
      </text>
    </svg>
  )
}
