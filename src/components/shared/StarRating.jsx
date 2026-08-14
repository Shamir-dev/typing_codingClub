import { Star } from 'lucide-react'

// Save to: src/components/shared/StarRating.jsx

// Shared accuracy -> star band logic. Exported so LessonCard and any
// future summary views compute stars identically, no duplicated bands.
export function getStarRating(accuracy) {
  if (accuracy < 80) return { stars: 1, passed: false }
  if (accuracy < 90) return { stars: 2, passed: false }
  if (accuracy < 95) return { stars: 3, passed: true }
  if (accuracy < 98) return { stars: 4, passed: true }
  return { stars: 5, passed: true }
}

// Regular (non-blind) lesson band - slightly different top edge (98 vs 97)
// per confirmed spec. Kept separate so the two systems can diverge later
// without silently affecting each other.
export function getLessonStarRating(accuracy) {
  if (accuracy < 80) return { stars: 1, passed: false }
  if (accuracy < 90) return { stars: 2, passed: false }
  if (accuracy < 95) return { stars: 3, passed: true }
  if (accuracy < 98) return { stars: 4, passed: true }
  return { stars: 5, passed: true }
}

export default function StarRating({ stars = 0, passed = true, size = 14 }) {
  const color = passed ? '#f59e0b' : '#ef4444' // amber-500 / red-500
  return (
    <div className="flex items-center gap-0.5" aria-label={`${stars} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          color={color}
          fill={i < stars ? color : 'none'}
          strokeWidth={1.75}
        />
      ))}
    </div>
  )
}