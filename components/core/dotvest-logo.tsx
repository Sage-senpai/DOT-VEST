interface DotVestLogoProps {
  size?: number
  className?: string
}

export function DotVestLogo({ size = 32, className = "" }: DotVestLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="dvBg" x1="0" y1="0" x2="180" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a1a2e"/>
          <stop offset="100%" stopColor="#0d0d1a"/>
        </linearGradient>
        <linearGradient id="dvBolt" x1="60" y1="30" x2="120" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff2d78"/>
          <stop offset="100%" stopColor="#00e5a0"/>
        </linearGradient>
        <linearGradient id="dvDot" x1="0" y1="0" x2="180" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff2d78"/>
          <stop offset="50%" stopColor="#e91e8c"/>
          <stop offset="100%" stopColor="#00e5a0"/>
        </linearGradient>
      </defs>
      <rect width="180" height="180" rx="40" fill="url(#dvBg)"/>
      <path d="M100 28L62 92h30L72 152l58-72H98L118 28z" fill="url(#dvBolt)" opacity="0.95"/>
      <circle cx="38" cy="40" r="10" fill="url(#dvDot)" opacity="0.8"/>
      <circle cx="142" cy="40" r="10" fill="url(#dvDot)" opacity="0.6"/>
      <circle cx="142" cy="140" r="10" fill="url(#dvDot)" opacity="0.4"/>
    </svg>
  )
}

export function DotVestLogoIcon({ size = 20, className = "" }: DotVestLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="dviBolt" x1="60" y1="30" x2="120" y2="150" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff2d78"/>
          <stop offset="100%" stopColor="#00e5a0"/>
        </linearGradient>
      </defs>
      <path d="M100 28L62 92h30L72 152l58-72H98L118 28z" fill="url(#dviBolt)"/>
      <circle cx="38" cy="40" r="10" fill="#ff2d78" opacity="0.8"/>
      <circle cx="142" cy="40" r="10" fill="#e91e8c" opacity="0.6"/>
      <circle cx="142" cy="140" r="10" fill="#00e5a0" opacity="0.4"/>
    </svg>
  )
}
