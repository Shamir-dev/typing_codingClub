import { formatTime } from '../../engine/timing'

export default function StatusBar({ wpm, accuracy, elapsedMs, targetTimeSec, accent, progressPct }) {
  const overTime = elapsedMs / 1000 > targetTimeSec

  return (
    <div className="border-t border-line bg-panel">
      <div className="h-[3px] bg-line/50 overflow-hidden">
        <div
          className="h-full transition-all duration-150 ease-out"
          style={{ width: `${Math.min(progressPct, 100)}%`, backgroundColor: accent }}
        />
      </div>
      <div className="h-8 px-4 flex items-center gap-5 text-xs font-mono text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full animate-soft-pulse" style={{ backgroundColor: accent }} />
          {wpm} wpm
        </span>
        <span className={accuracy < 90 ? 'text-incorrect' : 'text-correct'}>{accuracy}% acc</span>
        <span className={overTime ? 'text-incorrect' : ''}>
          {formatTime(elapsedMs)} / target {formatTime(targetTimeSec * 1000)}
        </span>
      </div>
    </div>
  )
}
