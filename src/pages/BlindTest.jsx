import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, Eye, RotateCcw, Trophy, Zap } from 'lucide-react'
import { LESSONS_BY_LANGUAGE } from '../content/allLessons'
import { getLanguage } from '../content/languages'
import { getBlindStatus } from '../engine/blindTest'
import { formatTime } from '../engine/timing'
import { useProgress, getBlindStarRating } from '../hooks/useProgress'

const MODES = {
  pro: { label: 'Pro Mode', hints: false, description: 'No hints, no lookup. Pure recall.' },
  learner: { label: 'Learner Mode', hints: true, description: 'Hints and code lookup available.' },
}

const LANGUAGE_ICONS = {
  javascript: '\ud83d\udcd8', python: '\ud83d\udc0d', cpp: '\u2699\ufe0f', java: '\u2615',
  c: '\ud83d\udd24', html: '\ud83c\udff7\ufe0f', css: '\ud83c\udfa8', react: '\u269b\ufe0f',
}

export default function BlindTest() {
  const { languageId, lessonId, mode } = useParams()
  const navigate = useNavigate()
  const { logBlindAttempt } = useOutletContext()
  const { recordBlindAttempt } = useProgress()
  const lesson = (LESSONS_BY_LANGUAGE[languageId] || []).find((item) => item.id === lessonId)
  const language = getLanguage(languageId)
  const [typed, setTyped] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null) // { accuracy, stars, passed }
  const [showApproach, setShowApproach] = useState(true)
  const [showWalkthrough, setShowWalkthrough] = useState(true)
  const [showCode, setShowCode] = useState(false)
  const startedAt = useRef(null)
  const inputRef = useRef(null)
  const resultsRef = useRef(null)

  const status = useMemo(() => lesson && getBlindStatus(lesson.code, typed, languageId), [lesson, typed, languageId])
  if (!lesson || !language) return <Navigate to={`/${languageId}`} replace />

  const showModeSelection = !mode
  const finalConfig = mode ? MODES[mode] : null
  if (mode && !finalConfig) return <Navigate to={`/${languageId}`} replace />

  if (showModeSelection) {
    return (
      <div className="flex-1 overflow-auto bg-gradient-to-br from-base via-panel to-base">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
          <button onClick={() => navigate(`/${languageId}/lesson/${lessonId}/review`)} className="mb-6 flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors">
            <ArrowLeft size={16} /> Back to review
          </button>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{LANGUAGE_ICONS[languageId] || '\ud83d\udcbb'}</span>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-accent-purple mb-1">typing club</p>
                <h1 className="text-3xl font-bold text-text">{lesson.title}</h1>
              </div>
            </div>
            <p className="text-text-muted ml-12">Choose your difficulty level for this blind test</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 max-w-2xl">
            {Object.entries(MODES).map(([modeKey, modeConfig]) => (
              <button
                key={modeKey}
                onClick={() => navigate(`/${languageId}/lesson/${lessonId}/blind/${modeKey}`)}
                className="group relative rounded-2xl border border-line bg-panel-raised p-8 text-left transition-all duration-300 hover:border-accent-purple hover:bg-panel hover:shadow-lg hover:shadow-accent-purple/10"
              >
                <div className="absolute top-0 left-0 h-1 w-12 rounded-t-2xl bg-gradient-to-r from-accent-purple to-accent-blue group-hover:w-20 transition-all duration-300"></div>
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-purple/10 mb-4">
                    <Zap size={14} className="text-accent-purple" />
                    <span className="text-xs font-semibold text-accent-purple uppercase">{modeKey === 'pro' ? 'Pro' : 'Learner'}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-text mb-3">{modeConfig.label}</h2>
                  <p className="text-sm text-text-muted leading-relaxed">{modeConfig.description}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-line/50">
                  <div>
                    <p className="text-xs text-text-faint mb-1">Pass threshold</p>
                    <p className="text-lg font-bold text-text">90% accuracy</p>
                  </div>
                  <div className="text-accent-purple group-hover:translate-x-1 transition-transform">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    setTyped('')
    setSubmitted(false)
    setResult(null)
    setShowCode(false)
    setShowApproach(true)
    setShowWalkthrough(true)
    startedAt.current = null
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [mode])

  function reset() {
    setTyped(''); setSubmitted(false); setResult(null); startedAt.current = null
    setShowCode(false); setShowApproach(true); setShowWalkthrough(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  // Final accuracy = character-level match against target at submission time.
  // No mid-test failure — user can correct freely all the way to the end.
  function finalize(finalTyped) {
    const elapsed = startedAt.current ? Date.now() - startedAt.current : 0
    const finalStatus = getBlindStatus(lesson.code, finalTyped, languageId)
    const accuracy = finalStatus.formatting // char-match % from blindTest.js
    const { stars, passed } = getBlindStarRating(accuracy)

    setResult({ accuracy, stars, passed })
    setSubmitted(true)
    recordBlindAttempt(lessonId, mode, accuracy)
    logBlindAttempt({
      lessonId, language: languageId, difficulty: lesson.difficulty,
      mode: `blind-${mode}`, outcome: passed ? `${mode}-passed` : `${mode}-failed`,
      wpm: Math.round((finalTyped.length / 5) / (elapsed / 60000 || 1)),
      accuracy, stars, mistakes: null, timeMs: elapsed, isPerfect: accuracy === 100,
    })
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
  }

  function handleChange(event) {
    if (submitted) return
    if (!startedAt.current) startedAt.current = Date.now()
    const next = event.target.value
    setTyped(next)

    // Auto-submit once they've typed a length matching the target -
    // they can still be "wrong" character-wise, that's fine, accuracy
    // captures it. This just detects "done typing", not "done correctly".
    if (next.length >= lesson.code.replace(/\s+/g, '').length * 0.98) {
      const nextStatus = getBlindStatus(lesson.code, next, languageId)
      if (nextStatus.isComplete) {
        finalize(next)
      }
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Tab' && !submitted) {
      event.preventDefault()
      const textarea = inputRef.current
      if (!textarea) return
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const before = typed.substring(0, start)
      const after = typed.substring(end)

      let insertion = ''
      let idx = before.length
      while (idx < lesson.code.length && lesson.code[idx] === ' ') {
        insertion += ' '
        idx++
      }
      if (insertion.length === 0) insertion = ' '

      const newText = before + insertion + after
      setTyped(newText)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + insertion.length
      }, 0)

      if (!startedAt.current) startedAt.current = Date.now()
      const nextStatus = getBlindStatus(lesson.code, newText, languageId)
      if (nextStatus.isComplete) finalize(newText)
    }
  }

  function handleSubmit() {
    if (submitted || !typed) return
    finalize(typed)
  }

  const elapsed = startedAt.current ? Date.now() - startedAt.current : 0

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-base via-panel/5 to-base">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <div className="mb-6 flex items-center gap-2 text-sm">
          <button onClick={() => navigate(`/${languageId}/lesson/${lessonId}/review`)} className="flex items-center gap-1.5 text-text-muted hover:text-text transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <span className="text-text-faint">/</span>
          <span className="text-text-muted">{language.name}</span>
          <span className="text-text-faint">/</span>
          <span className="text-text-muted">{lesson.title}</span>
          <span className="text-text-faint">/</span>
          <span className="text-accent-purple font-semibold">Blind Test</span>
        </div>

        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="text-4xl">{LANGUAGE_ICONS[languageId] || '\ud83d\udcbb'}</div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-accent-purple mb-1">Blind Test  {finalConfig.label}</p>
                <h1 className="text-3xl font-bold text-text">{lesson.title}</h1>
              </div>
            </div>
            <p className="text-sm text-text-muted ml-16">Retype the solution from memory. Correct freely you're scored on final accuracy.</p>
          </div>

          <div className="rounded-xl border border-line bg-panel-raised px-5 py-3 text-right">
            <p className="text-xs text-text-faint font-mono uppercase tracking-wider mb-1">Formatting Match</p>
            <p className="text-2xl font-bold text-text">{status.formatting}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl border border-line bg-panel-raised overflow-hidden">
              <button onClick={() => setShowApproach(!showApproach)} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-panel-raised/50 transition-colors border-b border-line/50">
                {showApproach ? <ChevronDown size={16} className="text-accent-purple" /> : <ChevronRight size={16} className="text-text-muted" />}
                <BookOpen size={16} className="text-accent-purple" />
                <span className="font-semibold text-sm text-text">Approach</span>
              </button>
              {showApproach && (
                <div className="p-4 bg-panel space-y-2 animate-pop-in">
                  <ol className="space-y-2">
                    {lesson.approach?.steps?.map((step, i) => (
                      <li key={i} className="text-xs text-text-muted leading-relaxed">
                        <span className="font-semibold text-accent-purple mr-2">{i + 1}.</span>{step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {mode === 'learner' && (
              <div className="rounded-xl border border-line bg-panel-raised overflow-hidden">
                <button onClick={() => setShowWalkthrough(!showWalkthrough)} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-panel-raised/50 transition-colors border-b border-line/50">
                  {showWalkthrough ? <ChevronDown size={16} className="text-accent-purple" /> : <ChevronRight size={16} className="text-text-muted" />}
                  <BookOpen size={16} className="text-accent-purple" />
                  <span className="font-semibold text-sm text-text">Walkthrough</span>
                </button>
                {showWalkthrough && (
                  <div className="p-4 bg-panel space-y-2 animate-pop-in">
                    <ol className="space-y-2">
                      {lesson.review?.walkthroughSteps?.map((step, i) => (
                        <li key={i} className="text-xs text-text-muted leading-relaxed">
                          <span className="font-semibold text-accent-purple mr-2">{i + 1}.</span>{step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}

            {mode === 'learner' && (
              <div className="rounded-xl border border-line bg-panel-raised overflow-hidden">
                <button onClick={() => setShowCode(!showCode)} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-panel-raised/50 transition-colors border-b border-line/50">
                  {showCode ? <ChevronDown size={16} className="text-accent-purple" /> : <ChevronRight size={16} className="text-text-muted" />}
                  <Eye size={16} className="text-accent-purple" />
                  <span className="font-semibold text-sm text-text">View Code</span>
                </button>
                {showCode && (
                  <div className="p-4 bg-panel animate-pop-in">
                    <pre className="max-h-64 overflow-auto text-xs font-mono text-text-muted leading-5 whitespace-pre-wrap break-words">{lesson.code}</pre>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-32 rounded-lg border border-line bg-panel-raised px-4 py-3">
                <p className="text-xs text-text-faint font-mono uppercase tracking-wider mb-1">Time</p>
                <p className="font-mono font-semibold text-text">{formatTime(elapsed)}</p>
              </div>
              <div className="flex-1 min-w-32 rounded-lg border border-line bg-panel-raised px-4 py-3">
                <p className="text-xs text-text-faint font-mono uppercase tracking-wider mb-1">Live Match</p>
                <p className="font-semibold text-text">{status.formatting}%</p>
              </div>
            </div>

            <textarea
              ref={inputRef}
              spellCheck="false"
              value={typed}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={submitted}
              placeholder="Start typing from memory"
              className={`${submitted ? 'min-h-[180px]' : 'min-h-[400px]'} w-full resize-none rounded-xl border-2 bg-panel p-6 font-mono text-sm leading-7 text-text outline-none transition-all border-line/50 focus:border-accent-purple`}
            />

            {!submitted && (
              <button
                onClick={handleSubmit}
                disabled={!typed}
                className="inline-flex items-center gap-2 rounded-lg bg-accent-purple px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-purple/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Submit Attempt
              </button>
            )}

            {submitted && result && (
              <div
                ref={resultsRef}
                className={`rounded-xl border-2 p-6 animate-pop-in transition-all ${
                  result.passed ? 'border-correct/30 bg-correct/5' : 'border-incorrect/30 bg-incorrect/5'
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl">{result.passed ? '\ud83c\udf89' : '\u26a0\ufe0f'}</div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-text mb-1">
                      {result.passed ? `${finalConfig.label} Cleared!` : 'Not Cleared'}
                    </p>
                    <p className="text-sm text-text-muted">Final accuracy: {result.accuracy}%</p>
                    <div className="flex items-center gap-0.5 mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Trophy
                          key={i}
                          size={16}
                          className={i < result.stars ? (result.passed ? 'text-amber-400' : 'text-red-400') : 'text-line'}
                          fill={i < result.stars ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent-purple/20 px-4 py-2.5 text-sm font-semibold text-accent-purple hover:bg-accent-purple/30 transition-colors"
                >
                  <RotateCcw size={16} /> Retry Blind Test
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}