import { formatTime } from '../../engine/timing'
import ConsistencyGraph from './ConsistencyGraph'

function formatChar(char) {
  if (char === ' ') return '␣'
  if (char === '\n') return '⏎'
  return char
}

// Groups the raw mistake log (one entry per wrong keystroke) into a
// per-character frequency summary, so "you mistyped '>' 3 times" is
// one line instead of three separate log entries.
function summarizeMistakes(mistakes) {
  const byChar = new Map()
  for (const m of mistakes) {
    const key = m.expected
    if (!byChar.has(key)) byChar.set(key, { expected: key, count: 0, gotChars: new Set() })
    const entry = byChar.get(key)
    entry.count += 1
    entry.gotChars.add(m.got)
  }
  return [...byChar.values()].sort((a, b) => b.count - a.count)
}

export default function ReviewPanel({ lesson, wpm, accuracy, timeMs, mistakes, wpmHistory, keystrokeIntervals, accent, onRetry, onBack }) {
  const mistakeSummary = summarizeMistakes(mistakes || [])

  return (
    <div className="max-w-2xl animate-pop-in">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
        <h2 className="font-display font-semibold text-lg text-text">{lesson.title}</h2>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="flex-1 border border-line rounded-md px-4 py-3 bg-panel">
          <div className="text-xs text-text-faint font-mono uppercase tracking-wide">WPM</div>
          <div className="text-xl font-display font-semibold text-correct mt-0.5">{wpm}</div>
        </div>
        <div className="flex-1 border border-line rounded-md px-4 py-3 bg-panel">
          <div className="text-xs text-text-faint font-mono uppercase tracking-wide">Accuracy</div>
          <div className={`text-xl font-display font-semibold mt-0.5 ${accuracy < 90 ? 'text-incorrect' : 'text-correct'}`}>
            {accuracy}%
          </div>
        </div>
        <div className="flex-1 border border-line rounded-md px-4 py-3 bg-panel">
          <div className="text-xs text-text-faint font-mono uppercase tracking-wide">Time taken</div>
          <div className="text-xl font-display font-semibold text-text mt-0.5">{formatTime(timeMs || 0)}</div>
        </div>
      </div>

      <ConsistencyGraph wpmHistory={wpmHistory} keystrokeIntervals={keystrokeIntervals} accent={accent} />

      <section className="mb-6">
        <h3 className="text-xs uppercase tracking-wider text-text-muted font-display font-medium mb-2">
          Approach
        </h3>
        <p className="text-sm text-text leading-relaxed">{lesson.approach}</p>
      </section>

      <section className="mb-6">
        <h3 className="text-xs uppercase tracking-wider text-text-muted font-display font-medium mb-2">
          Walkthrough
        </h3>
        <p className="text-sm text-text leading-relaxed">{lesson.review.walkthrough}</p>
      </section>

      {mistakeSummary.length > 0 && (
        <section className="mb-6">
          <h3 className="text-xs uppercase tracking-wider text-text-muted font-display font-medium mb-2">
            Characters you mistyped
          </h3>
          <div className="flex flex-wrap gap-2">
            {mistakeSummary.map((m) => (
              <span
                key={m.expected}
                title={`typed as: ${[...m.gotChars].map(formatChar).join(', ')}`}
                className="font-mono text-xs bg-incorrect/15 text-incorrect border border-incorrect/30 rounded-md px-2 py-1 cursor-help hover:bg-incorrect/25 transition-colors"
              >
                {formatChar(m.expected)} × {m.count}
              </span>
            ))}
          </div>
          <p className="text-xs text-text-faint mt-2">Hover a chip to see what you typed instead.</p>
        </section>
      )}

      {lesson.review.commonMistakes?.length > 0 && (
        <section className="mb-8">
          <h3 className="text-xs uppercase tracking-wider text-text-muted font-display font-medium mb-2">
            Common mistakes
          </h3>
          <ul className="space-y-1.5">
            {lesson.review.commonMistakes.map((m, i) => (
              <li key={i} className="text-sm text-text-muted flex gap-2">
                <span className="text-incorrect shrink-0">×</span>
                {m}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-md text-sm font-medium bg-panel-raised text-text hover:opacity-80 transition-opacity border border-line hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          Retry lesson
        </button>
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-md text-sm font-medium text-text-muted hover:text-text transition-colors"
        >
          Back to lessons
        </button>
      </div>
    </div>
  )
}
