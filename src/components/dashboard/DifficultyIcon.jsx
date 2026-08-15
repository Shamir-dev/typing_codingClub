import { Star, Zap, Flame } from 'lucide-react'

// Option 6 "Symbol/Icon Style" — exact colors from the reference sheet.
// Star = Easy, Zap (lightning) = Medium, Flame = Hard.
// Exported so any other component (borders, badges, charts) that needs
// the same difficulty color can import it instead of re-declaring it.
export const DIFFICULTY_COLORS = {
  easy: '#22C55E',
  medium: '#F59E0B',
  hard: '#EF4444',
}

const DIFFICULTY_ICONS = {
  easy: Star,
  medium: Zap,
  hard: Flame,
}

// size: pixel diameter of the circular badge. iconSize: pixel size of
// the glyph inside it (roughly 45-50% of the badge looks right).
export default function DifficultyIcon({ difficulty, size = 56, iconSize = 24 }) {
  const color = DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS.easy
  const Icon = DIFFICULTY_ICONS[difficulty] || DIFFICULTY_ICONS.easy

  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
      }}
    >
      <Icon size={iconSize} color={color} strokeWidth={2} />
    </div>
  )
}