import { useState } from 'react'
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react'
import { formatTime } from '../../engine/timing'
import ConsistencyGraph from './ConsistencyGraph'

function formatChar(char) {
  if (char === ' ') return '␣'
  if (char === '\n') return '⏎'
  return char
}

// Groups the raw mistake log into a per-character frequency summary.
function summarizeMistakes(mistakes) {
  const byChar = new Map()
  for (const m of mistakes) {
    const key = m.expected
    if (!byChar.has(key)) byChar.set(key, { expected: key, count: 0, gotChars: new Map() })
    const entry = byChar.get(key)
    entry.count += 1
    entry.gotChars.set(m.got, (entry.gotChars.get(m.got) || 0) + 1)
  }
  return [...byChar.values()].sort((a, b) => b.count - a.count)
}

export default function ReviewPanel({
  lesson,
  wpm,
  accuracy,
  timeMs,
  mistakes,
  wpmHistory,
  keystrokeIntervals,
  accent,
  onRetry,
  onBack,
}) {
  const mistakeSummary = summarizeMistakes(mistakes || [])
  const [showApproach, setShowApproach] = useState(false)
  const [showWalkthrough, setShowWalkthrough] = useState(false)

  return (
    <div className="max-w-2xl animate-pop-in">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={onBack}
          title="Back to lessons"
          className="text-text-faint hover:text-text p-1 -ml-1 rounded-md hover:bg-panel-raised transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
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

      {mistakeSummary.length > 0 && (
        <section className="mb-6">
          <h3 className="text-xs uppercase tracking-wider text-text-muted font-display font-medium mb-3 text-center">
            Characters you mistyped
          </h3>
          <div className="flex flex-wrap justify-center gap-2.5">
            {mistakeSummary.map((m) => (
              <div
                key={m.expected}
                className="font-mono bg-incorrect/10 border border-incorrect/30 rounded-lg px-3 py-2.5 min-w-[86px] text-center"
              >
                <div className="text-sm text-incorrect font-semibold">
                  {formatChar(m.expected)} × {m.count}
                </div>
                <div className="text-[10px] text-text-faint mt-1 leading-snug">
                  typed:{' '}
                  {[...m.gotChars.entries()]
                    .map(([char, n]) => `${formatChar(char)}${n > 1 ? `×${n}` : ''}`)
                    .join(', ')}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-6">
        <button
          onClick={() => setShowApproach((v) => !v)}
          className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-text-muted font-display font-medium hover:text-text transition-colors"
        >
          {showApproach ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          View Approach
        </button>

        {showApproach && (
          <div className="mt-3 bg-panel border border-line rounded-md p-4 animate-pop-in">
            <ol className="space-y-2 mb-4">
              {lesson.approach.steps.map((step, i) => (
                <li key={i} className="text-sm text-text leading-relaxed flex gap-2">
                  <span className="text-text-faint font-mono shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
            {lesson.approach.example && (
              <div className="bg-panel-raised rounded-md p-3 border border-line">
                <div className="text-[10px] uppercase tracking-wide text-text-faint font-mono mb-1">Example</div>
                <p className="text-xs text-text-muted font-mono leading-relaxed">{lesson.approach.example}</p>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="mb-8 bg-panel border border-line rounded-md p-4">
        <button
          onClick={() => setShowWalkthrough((v) => !v)}
          className="w-full flex items-center justify-between"
        >
          <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-text-muted font-display font-medium hover:text-text transition-colors">
            {showWalkthrough ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Walkthrough
          </span>
          {lesson.complexity && (
            <span className="flex gap-2 text-[11px] font-mono">
              <span className="bg-panel-raised border border-line rounded px-2 py-0.5 text-text-muted">
                time {lesson.complexity.time}
              </span>
              <span className="bg-panel-raised border border-line rounded px-2 py-0.5 text-text-muted">
                space {lesson.complexity.space}
              </span>
            </span>
          )}
        </button>

        {showWalkthrough && (
          <div className="mt-4 animate-pop-in">
            <ol className="space-y-2 mb-5">
              {lesson.review.walkthroughSteps.map((step, i) => (
                <li key={i} className="text-sm text-text leading-relaxed flex gap-2">
                  <span className="text-text-faint font-mono shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>

            {lesson.review.commonMistakes?.length > 0 && (
              <>
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
              </>
            )}
          </div>
        )}
      </section>

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