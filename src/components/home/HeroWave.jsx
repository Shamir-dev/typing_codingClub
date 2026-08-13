// Purely decorative — an SVG wave with a purple→blue gradient stroke
// plus a few low-opacity floating dots, sitting behind the hero copy.
// No data, no state — just texture matching the reference mockup's
// "tech dashboard" feel.
export default function HeroWave() {
  return (
    <svg
      className="absolute -top-4 right-0 w-full h-64 pointer-events-none opacity-70"
      viewBox="0 0 800 260"
      preserveAspectRatio="xMaxYMid slice"
      fill="none"
    >
      <defs>
        <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-accent-blue)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--color-accent-purple)" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-accent-purple)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--color-accent-purple)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path
        d="M 420 40 C 520 20, 560 120, 660 100 S 800 60, 800 60"
        stroke="url(#waveGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="animate-soft-pulse"
      />
      <path
        d="M 380 90 C 480 130, 580 40, 690 90 S 800 140, 800 140"
        stroke="url(#waveGradient)"
        strokeWidth="1"
        strokeOpacity="0.5"
        strokeLinecap="round"
      />

      <circle cx="470" cy="55" r="2" fill="var(--color-accent-blue)" className="animate-soft-pulse" />
      <circle cx="600" cy="105" r="2.5" fill="var(--color-accent-purple)" />
      <circle cx="700" cy="45" r="1.5" fill="var(--color-accent-blue)" />
      <circle cx="640" cy="150" r="3" fill="url(#dotGlow)" />
      <circle cx="750" cy="90" r="1.5" fill="var(--color-accent-purple)" className="animate-soft-pulse" />
    </svg>
  )
}