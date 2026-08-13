import { Flame } from 'lucide-react'
import { useState, useEffect } from 'react'

const DAILY_GOAL_MS = 25 * 60 * 1000

function isToday(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()
}

export default function DailyGoal({ attempts }) {
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Update every second for real-time progress
  useEffect(() => {
    const interval = setInterval(() => setRefreshKey(k => k + 1), 1000)
    return () => clearInterval(interval)
  }, [])
  
  const practicedMs = attempts.filter((attempt) => isToday(attempt.completedAt)).reduce((sum, attempt) => sum + (attempt.timeMs || 0), 0)
  const progressPercent = Math.round((practicedMs / DAILY_GOAL_MS) * 100)
  const displayPercent = progressPercent > 100 ? progressPercent : Math.min(100, progressPercent)
  const minutes = Math.floor(practicedMs / 60000)
  const seconds = Math.floor((practicedMs % 60000) / 1000)
  const circlePercent = Math.min(100, progressPercent)

  return (
    <div className="bg-panel border border-line rounded-xl p-6 shadow-[0_14px_34px_-26px_rgba(0,0,0,.9)]">
      <p className="text-xs font-mono uppercase tracking-widest text-text-faint mb-1">Daily Goal</p>
      <div className="mt-4 flex items-center gap-5">
        <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(var(--color-accent-purple) ${circlePercent * 3.6}deg, var(--color-panel-raised) 0deg)` }}>
          <div className="grid h-24 w-24 place-items-center rounded-full bg-panel">
            <div className="text-center">
              <span className="font-display text-3xl font-bold text-text block leading-none">{displayPercent}%</span>
              <span className="text-[10px] text-text-faint font-mono mt-1 block">completed</span>
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs text-text-faint font-mono uppercase tracking-wide mb-2">Typing time today</p>
          <p className="text-2xl font-display font-bold text-text mb-1">{minutes}:{seconds.toString().padStart(2, '0')}</p>
          <p className="text-sm text-text-muted font-mono mb-4">Goal: 25 min</p>
          <p className={`flex items-center gap-1.5 text-xs font-semibold ${
            progressPercent >= 100 ? 'text-correct' : 'text-orange-400'
          }`}>
            {progressPercent >= 100 ? '🎉 Goal Reached!' : 'Keep it up!'} 
            <Flame size={14} />
          </p>
        </div>
      </div>
    </div>
  )
}
