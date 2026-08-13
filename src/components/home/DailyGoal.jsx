import { Flame } from 'lucide-react'

const DAILY_GOAL_MS = 25 * 60 * 1000

function isToday(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
}

export default function DailyGoal({ attempts }) {
  const practicedMs = attempts.filter((attempt) => isToday(attempt.completedAt)).reduce((sum, attempt) => sum + (attempt.timeMs || 0), 0)
  const progress = Math.min(100, Math.round((practicedMs / DAILY_GOAL_MS) * 100))
  const minutes = Math.min(25, Math.floor(practicedMs / 60000))

  return (
    <div className="bg-panel border border-line rounded-xl p-5 shadow-[0_14px_34px_-26px_rgba(0,0,0,.9)]">
      <p className="text-[11px] font-mono uppercase tracking-widest text-text-faint">Daily Goal</p>
      <div className="mt-3 flex items-center gap-4">
        <div className="grid h-[88px] w-[88px] shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(var(--color-accent-purple) ${progress * 3.6}deg, var(--color-panel-raised) 0deg)` }}>
          <div className="grid h-[70px] w-[70px] place-items-center rounded-full bg-panel">
            <span className="font-display text-xl font-semibold text-text">{progress}%</span>
          </div>
        </div>
        <div>
          <p className="text-[11px] text-text-faint">Typing time</p>
          <p className="mt-1 text-sm font-semibold text-text">{minutes} / 25 min</p>
          <p className="mt-4 flex items-center gap-1 text-[11px] text-orange-400">Keep it up! <Flame size={12} /></p>
        </div>
      </div>
    </div>
  )
}
