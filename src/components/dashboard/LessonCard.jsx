import { Sparkles, Flame, Trophy, CheckCircle2 } from 'lucide-react'

const DIFFICULTY_META = {
  easy: { icon: Sparkles, color: 'var(--color-correct)' },
  medium: { icon: Flame, color: '#e0983d' },
  hard: { icon: Trophy, color: 'var(--color-incorrect)' },
}

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

      {done && (
        <span className="absolute top-3 right-3.5 text-correct">
          <CheckCircle2 size={18} strokeWidth={2.5} />
        </span>
      )}

      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mt-4"
        style={{ backgroundColor: `${meta.color}1f` }}
      >
        <Icon size={26} color={meta.color} strokeWidth={2} />
      </div>

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
