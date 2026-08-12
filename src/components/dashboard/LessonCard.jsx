import { Sparkles, Flame, Trophy, Check } from 'lucide-react'

const DIFFICULTY_META = {
  easy: { icon: Sparkles, color: 'var(--color-correct)' },
  medium: { icon: Flame, color: '#e0983d' },
  hard: { icon: Trophy, color: 'var(--color-incorrect)' },
}

const COMPLETE_GOLD = '#f0b429'

export default function LessonCard({ lesson, number, accent, progress, onClick }) {
  const meta = DIFFICULTY_META[lesson.difficulty] || DIFFICULTY_META.easy
  const Icon = meta.icon
  const done = progress?.completed

  return (
    <button
      onClick={onClick}
      className="card-lift relative bg-panel border border-line rounded-2xl p-4 text-left flex flex-col items-center gap-2 w-full"
      style={{ boxShadow: '0 2px 8px -4px rgba(0,0,0,0.12)' }}
    >
      <span className="absolute top-3 left-3.5 text-lg font-display font-bold text-text-faint">
        {number}
      </span>

      {done ? (
        // Completion is the primary signal on this card once earned —
        // a large, unmistakable gold badge at center reads at a glance
        // across a full grid, rather than a small corner tick a user
        // has to look for.
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mt-4 shadow-md ring-4"
          style={{ backgroundColor: COMPLETE_GOLD, '--tw-ring-color': `${COMPLETE_GOLD}30` }}
        >
          <Check size={38} color="#ffffff" strokeWidth={3.5} />
        </div>
      ) : (
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mt-4 border-2 shadow-sm"
          style={{ backgroundColor: `${meta.color}22`, borderColor: `${meta.color}55` }}
        >
          <Icon size={36} color={meta.color} strokeWidth={2.25} />
        </div>
      )}

      <span className="text-xs font-medium text-text text-center leading-snug mt-1">
        {lesson.title}
      </span>

      {done ? (
        <span className="text-[11px] font-mono text-correct">{progress.bestWpm} wpm</span>
      ) : (
        <span className="text-[11px] font-mono text-text-faint">{lesson.timeTargetSec}s</span>
      )}
    </button>
  )
}