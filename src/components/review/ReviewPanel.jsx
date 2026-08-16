import { useState } from 'react'
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react'
import { formatTime } from '../../engine/timing'
import { formatChar, summarizeMistakes } from '../../engine/mistakeSummary'
import ConsistencyGraph from './ConsistencyGraph'
import TypedTranscript from './TypedTranscript'
import CompilerPanel from './CompilerPanel'

export default function ReviewPanel({
  lesson,
  wpm,
  accuracy,
  timeMs,
  mistakes,
  typed,
  targetCode,
  wpmHistory,
  keystrokeIntervals,
  accent,
  language,
  nextLesson,
  previousLesson,
  onRetry,
  onNext,
  onPrevious,
  onBack,
  onBlindTest,
}) {
  const mistakeSummary = summarizeMistakes(mistakes || [])
  const [showApproach, setShowApproach] = useState(false)
  const [showWalkthrough, setShowWalkthrough] = useState(false)
  const [showCompiler, setShowCompiler] = useState(false)

  return (
<div className="max-w-none w-full 2xl:max-w-[1600px] mx-auto animate-pop-in px-2">
<div className="flex items-center gap-2 mb-4">
  <button
    onClick={onBack}
    title="Back to lessons"
    className="text-text-faint hover:text-text p-1 -ml-1 rounded-md hover:bg-panel-raised transition-colors"
  >
    <ArrowLeft size={18} />
  </button>

  <span
    className="w-2 h-2 rounded-full"
    style={{ backgroundColor: accent }}
  />

  <div>
    <h2 className="font-display font-semibold text-lg text-text">
      {lesson.title}
    </h2>
    <p className="text-sm text-gray-500 mt-1">
      {lesson.prompt}
    </p>
  </div>
</div>


      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div className="flex-1 border border-line rounded-md px-4 py-3 bg-panel">
          <div className="text-xs text-text-faint font-mono uppercase tracking-wide ">WPM</div>
          <div className="text-3xl font-display font-semibold text-correct mt-0.5">{wpm}</div>
        </div>
        <div className="flex-1 border border-line rounded-md px-4 py-3 bg-panel">
          <div className="text-xs text-text-faint font-mono uppercase tracking-wide">Accuracy</div>
          <div className={`text-3xl font-display font-semibold mt-0.5 ${accuracy < 90 ? 'text-incorrect' : 'text-correct'}`}>
            {accuracy}%
          </div>
        </div>
        <div className="flex-1 border border-line rounded-md px-4 py-3 bg-panel">
          <div className="text-xs text-text-faint font-mono uppercase tracking-wide">Time taken</div>
          <div className="text-xl font-display font-semibold text-text mt-0.5">{formatTime(timeMs || 0)}</div>
        </div>
      </div>

      <ConsistencyGraph wpmHistory={wpmHistory} keystrokeIntervals={keystrokeIntervals} accent={accent} />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
      {mistakeSummary.length > 0 && (
        <section>
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
      <section className="rounded-xl border border-line bg-panel p-4">
        <p className="text-xs font-mono uppercase tracking-widest text-accent-purple">Blind Test</p>
        <p className="mt-2 text-sm font-semibold text-text">Retype this lesson from memory.</p>
      <p className="mt-1 text-xs leading-relaxed text-text-muted">
          Code tokens must match. Whitespace is flexible for this language.
        </p>
        <span className="mt-1.5 block text-[10px] text-[#e1b800]/80 italic">
          Strict word match can make the test tough So recommend using Learner Mode first.
        </span>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button onClick={() => onBlindTest('pro')} className="rounded-lg border border-accent-purple/40 bg-accent-purple/10 px-3 py-2.5 text-left transition-colors hover:bg-accent-purple/20"><span className="block text-sm font-semibold text-text">Pro Mode</span><span className="mt-0.5 block text-[11px] text-text-muted">No code access Only word Review </span></button>
          <button onClick={() => onBlindTest('learner')} className="rounded-lg border border-line bg-panel-raised px-3 py-2.5 text-left transition-colors hover:border-text-faint"><span className="block text-sm font-semibold text-text">Learner Mode</span><span className="mt-0.5 block text-[11px] text-text-muted">Hints + Code LookUp if needed</span></button>
        </div>
      </section>
      </div>
 <section className="mb-6 bg-panel border border-line rounded-md p-4">
  <div className="grid gap-4 sm:grid-cols-2 divide-x divide-line items-center">
    {typed && targetCode && (
      <div className="sm:pr-4">
        <TypedTranscript
          targetCode={targetCode}
          typed={typed}
          mistakes={mistakes}
          open={showApproach}
          onToggle={() => setShowApproach((v) => !v)}
        />
      </div>
    )}

    <div className="sm:pl-4">
      <button
        onClick={() => setShowApproach((v) => !v)}
        className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-text-muted font-display font-medium hover:text-text transition-colors"
      >
        {showApproach ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        View Approach
      </button>

      {showApproach && (
        <div className="mt-3 bg-panel-raised border border-line rounded-md p-4 animate-pop-in">
          <ol className="space-y-2 mb-4">
            {lesson.approach.steps.map((step, i) => (
              <li key={i} className="text-sm text-text leading-relaxed flex gap-2">
                <span className="text-text-faint font-mono shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
          {lesson.approach.example && (
            <div className="bg-panel rounded-md p-3 border border-line">
              <div className="text-[10px] uppercase tracking-wide text-text-faint font-mono mb-1">Example</div>
              <p className="text-xs text-text-muted font-mono leading-relaxed">{lesson.approach.example}</p>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
</section>
      <CompilerPanel
        language={language}
        open={showCompiler}
        onToggle={() => setShowCompiler((v) => !v)}
      />
      
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

      <div className="flex gap-3 flex-wrap">
        {previousLesson && (
          <button
            onClick={onPrevious}
            title={`Previous: ${previousLesson.title}`}
            className="px-4 py-2 rounded-md text-sm font-medium bg-panel-raised text-text hover:opacity-80 transition-opacity border border-line hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            ← Previous
          </button>
        )}
        {nextLesson ? (
          <button
            onClick={onNext}
            title="Press Enter to continue"
            className="px-4 py-2 rounded-md text-sm font-semibold text-[#14151a] hover:opacity-90 transition-opacity shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-transform"
            style={{ backgroundColor: accent }}
          >
            Next: {nextLesson.title} →
          </button>
        ) : (
          <button
            onClick={onBack}
            autoFocus
            className="px-4 py-2 rounded-md text-sm font-semibold text-[#14151a] hover:opacity-90 transition-opacity shadow-sm"
            style={{ backgroundColor: accent }}
          >
            🎉 All lessons done — back to overview
          </button>
        )}
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
