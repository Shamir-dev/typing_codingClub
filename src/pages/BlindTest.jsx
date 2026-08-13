import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, Eye, RotateCcw, Trophy, Zap } from 'lucide-react'
import { LESSONS_BY_LANGUAGE } from '../content/allLessons'
import { getLanguage } from '../content/languages'
import { getBlindStatus } from '../engine/blindTest'
import { formatTime } from '../engine/timing'

const MODES = { pro: { label: 'Pro Mode', budget: 1, description: 'Perfect recall required. Zero mistakes allowed.' }, learner: { label: 'Learner Mode', budget: 2, description: 'Learning mode. Up to 2 mistakes allowed.' } }

// Language icon mapping
const LANGUAGE_ICONS = {
  javascript: '📘',
  python: '🐍',
  cpp: '⚙️',
  java: '☕',
  c: '🔤',
  html: '🏷️',
  css: '🎨',
  react: '⚛️',
}

export default function BlindTest() {
  const { languageId, lessonId, mode } = useParams()
  const navigate = useNavigate()
  const { logBlindAttempt } = useOutletContext()
  const lesson = (LESSONS_BY_LANGUAGE[languageId] || []).find((item) => item.id === lessonId)
  const language = getLanguage(languageId)
  const [typed, setTyped] = useState('')
  const [errors, setErrors] = useState(0)
  const [failed, setFailed] = useState(false)
  const [passed, setPassed] = useState(false)
  const [showApproach, setShowApproach] = useState(true)
  const [showWalkthrough, setShowWalkthrough] = useState(true)
  const [showCode, setShowCode] = useState(false)
  const startedAt = useRef(null)
  const previousValid = useRef(true)
  const inputRef = useRef(null)
  const resultsRef = useRef(null)

  const status = useMemo(() => lesson && getBlindStatus(lesson.code, typed, languageId), [lesson, typed, languageId])
  if (!lesson || !language) return <Navigate to={`/${languageId}`} replace />
  
  // Use mode from URL as source of truth, show selection screen only if mode is missing
  const showModeSelection = !mode
  const finalConfig = mode ? MODES[mode] : null
  
  // If mode is in URL but not valid, redirect
  if (mode && !finalConfig) return <Navigate to={`/${languageId}`} replace />
  
  // Show mode selection screen if no mode in URL
  if (showModeSelection) {
    return (
      <div className="flex-1 overflow-auto bg-gradient-to-br from-base via-panel to-base">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
          {/* Breadcrumb */}
          <button onClick={() => navigate(`/${languageId}/lesson/${lessonId}/review`)} className="mb-6 flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors">
            <ArrowLeft size={16} /> Back to review
          </button>
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{LANGUAGE_ICONS[languageId] || '💻'}</span>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-accent-purple mb-1">typing club</p>
                <h1 className="text-3xl font-bold text-text">{lesson.title}</h1>
              </div>
            </div>
            <p className="text-text-muted ml-12">Choose your difficulty level for this blind test</p>
          </div>

          {/* Mode Selection Cards */}
          <div className="grid gap-5 sm:grid-cols-2 max-w-2xl">
            {Object.entries(MODES).map(([modeKey, modeConfig]) => (
              <button
                key={modeKey}
                onClick={() => navigate(`/${languageId}/lesson/${lessonId}/blind/${modeKey}`)}
                className="group relative rounded-2xl border border-line bg-panel-raised p-8 text-left transition-all duration-300 hover:border-accent-purple hover:bg-panel hover:shadow-lg hover:shadow-accent-purple/10"
              >
                {/* Gradient accent line */}
                <div className="absolute top-0 left-0 h-1 w-12 rounded-t-2xl bg-gradient-to-r from-accent-purple to-accent-blue group-hover:w-20 transition-all duration-300"></div>
                
                <div className="mb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-purple/10 mb-4">
                    <Zap size={14} className="text-accent-purple" />
                    <span className="text-xs font-semibold text-accent-purple uppercase">{modeConfig.budget === 1 ? 'Pro' : 'Learner'}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-text mb-3">{modeConfig.label}</h2>
                  <p className="text-sm text-text-muted leading-relaxed">{modeConfig.description}</p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-line/50">
                  <div>
                    <p className="text-xs text-text-faint mb-1">Error Budget</p>
                    <p className="text-lg font-bold text-text">{modeConfig.budget}</p>
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

  // Reset all state when mode changes
  useEffect(() => {
    setTyped('')
    setErrors(0)
    setFailed(false)
    setPassed(false)
    setShowCode(false)
    setShowApproach(true)
    setShowWalkthrough(true)
    startedAt.current = null
    previousValid.current = true
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [mode])

  function reset() {
    setTyped(''); setErrors(0); setFailed(false); setPassed(false); startedAt.current = null; previousValid.current = true; setShowCode(false); setShowApproach(true); setShowWalkthrough(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function handleChange(event) {
    if (failed || passed) return
    if (!startedAt.current) startedAt.current = Date.now()
    const next = event.target.value
    
    const nextStatus = getBlindStatus(lesson.code, next, languageId)
    
    let nextErrors = errors
    for (let i = typed.length; i < next.length; i++) {
      if (i >= lesson.code.length || next[i] !== lesson.code[i]) {
        nextErrors++
      }
    }
    
    previousValid.current = nextStatus.isPrefix
    setTyped(next)
    if (nextErrors !== errors) {
      setErrors(nextErrors)
    }
    
    if (nextErrors > finalConfig.budget) {
      setFailed(true)
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
      return
    }
    
    if (nextStatus.isComplete) {
      const elapsed = Date.now() - startedAt.current
      setPassed(true)
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
      logBlindAttempt({ lessonId, language: languageId, difficulty: lesson.difficulty, mode: `blind-${mode}`, outcome: nextErrors === 0 && mode === 'pro' ? 'perfect-pro' : `${mode}-cleared`, wpm: Math.round((next.length / 5) / (elapsed / 60000)), accuracy: 100, formatting: nextStatus.formatting, mistakes: nextErrors, timeMs: elapsed, isPerfect: nextErrors === 0 })
    }
  }
  
  function handleKeyDown(event) {
    if (event.key === 'Tab' && !failed && !passed) {
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
      
      const nextStatus = getBlindStatus(lesson.code, newText, languageId)
      let nextErrors = errors
      for (let i = typed.length; i < newText.length; i++) {
        if (i >= lesson.code.length || newText[i] !== lesson.code[i]) {
          nextErrors++
        }
      }
      
      if (nextErrors !== errors) {
        setErrors(nextErrors)
      }
      
      if (!startedAt.current) startedAt.current = Date.now()
      
      if (nextErrors > finalConfig.budget) {
        setFailed(true)
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
        return
      }
      
      if (nextStatus.isComplete) {
        const elapsed = Date.now() - startedAt.current
        setPassed(true)
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
        logBlindAttempt({ lessonId, language: languageId, difficulty: lesson.difficulty, mode: `blind-${mode}`, outcome: nextErrors === 0 && mode === 'pro' ? 'perfect-pro' : `${mode}-cleared`, wpm: Math.round((newText.length / 5) / (elapsed / 60000)), accuracy: 100, formatting: nextStatus.formatting, mistakes: nextErrors, timeMs: elapsed, isPerfect: nextErrors === 0 })
      }
    }
  }

  const elapsed = startedAt.current ? Date.now() - startedAt.current : 0
  
  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-base via-panel/5 to-base">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <button onClick={() => navigate(`/${languageId}/lesson/${lessonId}/review`)} className="flex items-center gap-1.5 text-text-muted hover:text-text transition-colors">
            <ArrowLeft size={16} />
            Back
          </button>
          <span className="text-text-faint">/</span>
          <span className="text-text-muted">{language.name}</span>
          <span className="text-text-faint">/</span>
          <span className="text-text-muted">{lesson.title}</span>
          <span className="text-text-faint">/</span>
          <span className="text-accent-purple font-semibold">Blind Test</span>
        </div>

        {/* Header with Language Badge */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <div className="text-4xl">{LANGUAGE_ICONS[languageId] || '💻'}</div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-accent-purple mb-1">Blind Test</p>
                <h1 className="text-3xl font-bold text-text">{lesson.title}</h1>
              </div>
            </div>
            <p className="text-sm text-text-muted ml-16">Retype the solution from memory</p>
          </div>
          
          {/* Error Budget Badge */}
          <div className="rounded-xl border border-line bg-panel-raised px-5 py-3 text-right">
            <p className="text-xs text-text-faint font-mono uppercase tracking-wider mb-1">Error Budget</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold" style={{ color: errors > finalConfig.budget / 2 ? 'var(--color-incorrect)' : 'var(--color-correct)' }}>{errors}</span>
              <span className="text-text-muted">/</span>
              <span className="text-lg text-text-muted">{finalConfig.budget}</span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Lessons Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Approach Section */}
            <div className="rounded-xl border border-line bg-panel-raised overflow-hidden">
              <button
                onClick={() => setShowApproach(!showApproach)}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-panel-raised/50 transition-colors border-b border-line/50"
              >
                {showApproach ? <ChevronDown size={16} className="text-accent-purple" /> : <ChevronRight size={16} className="text-text-muted" />}
                <BookOpen size={16} className="text-accent-purple" />
                <span className="font-semibold text-sm text-text">Approach</span>
              </button>
              {showApproach && (
                <div className="p-4 bg-panel space-y-2 animate-pop-in">
                  <ol className="space-y-2">
                    {lesson.approach?.steps?.map((step, i) => (
                      <li key={i} className="text-xs text-text-muted leading-relaxed">
                        <span className="font-semibold text-accent-purple mr-2">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Walkthrough Section (Learner Only) */}
            {mode === 'learner' && (
              <div className="rounded-xl border border-line bg-panel-raised overflow-hidden">
                <button
                  onClick={() => setShowWalkthrough(!showWalkthrough)}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-panel-raised/50 transition-colors border-b border-line/50"
                >
                  {showWalkthrough ? <ChevronDown size={16} className="text-accent-purple" /> : <ChevronRight size={16} className="text-text-muted" />}
                  <BookOpen size={16} className="text-accent-purple" />
                  <span className="font-semibold text-sm text-text">Walkthrough</span>
                </button>
                {showWalkthrough && (
                  <div className="p-4 bg-panel space-y-2 animate-pop-in">
                    <ol className="space-y-2">
                      {lesson.review?.walkthroughSteps?.map((step, i) => (
                        <li key={i} className="text-xs text-text-muted leading-relaxed">
                          <span className="font-semibold text-accent-purple mr-2">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* View Code Section (Learner Only) */}
            {mode === 'learner' && (
              <div className="rounded-xl border border-line bg-panel-raised overflow-hidden">
                <button
                  onClick={() => setShowCode(!showCode)}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-panel-raised/50 transition-colors border-b border-line/50"
                >
                  {showCode ? <ChevronDown size={16} className="text-accent-purple" /> : <ChevronRight size={16} className="text-text-muted" />}
                  <Eye size={16} className="text-accent-purple" />
                  <span className="font-semibold text-sm text-text">View Code</span>
                </button>
                {showCode && (
                  <div className="p-4 bg-panel animate-pop-in">
                    <pre className="max-h-64 overflow-auto text-xs font-mono text-text-muted leading-5 whitespace-pre-wrap break-words">
                      {lesson.code}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main Editor Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Stats Row */}
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-32 rounded-lg border border-line bg-panel-raised px-4 py-3">
                <p className="text-xs text-text-faint font-mono uppercase tracking-wider mb-1">Status</p>
                <p className={`font-semibold ${status.isPrefix ? 'text-correct' : 'text-incorrect'}`}>
                  {status.isPrefix ? '✓ On track' : '✗ Mistake'}
                </p>
              </div>
              <div className="flex-1 min-w-32 rounded-lg border border-line bg-panel-raised px-4 py-3">
                <p className="text-xs text-text-faint font-mono uppercase tracking-wider mb-1">Time</p>
                <p className="font-mono font-semibold text-text">{formatTime(elapsed)}</p>
              </div>
              <div className="flex-1 min-w-32 rounded-lg border border-line bg-panel-raised px-4 py-3">
                <p className="text-xs text-text-faint font-mono uppercase tracking-wider mb-1">Formatting</p>
                <p className="font-semibold text-text">{status.formatting}%</p>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              ref={inputRef}
              spellCheck="false"
              value={typed}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={failed || passed}
              placeholder="Start typing from memory…"
              className={`${failed || passed ? 'min-h-[180px]' : 'min-h-[400px]'} w-full resize-none rounded-xl border-2 bg-panel p-6 font-mono text-sm leading-7 text-text outline-none transition-all ${
                status.isPrefix ? 'border-line/50 focus:border-accent-purple' : 'border-incorrect/50 focus:border-incorrect'
              }`}
            />

            {/* Results Section */}
            {(failed || passed) && (
              <div
                ref={resultsRef}
                className={`rounded-xl border-2 p-6 animate-pop-in transition-all ${
                  passed ? 'border-correct/30 bg-correct/5' : 'border-incorrect/30 bg-incorrect/5'
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl">
                    {passed ? '🎉' : '⚠️'}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-text mb-1">
                      {passed
                        ? errors === 0 && mode === 'pro'
                          ? '🏆 Perfect Pro!'
                          : `${finalConfig.label} Cleared!`
                        : 'Test Ended'}
                    </p>
                    <p className="text-sm text-text-muted">
                      {passed
                        ? `Exact code tokens matched. Formatting: ${status.formatting}%`
                        : `You used ${errors} mistake${errors !== 1 ? 's' : ''}. Allowed: ${finalConfig.budget}`}
                    </p>
                  </div>
                </div>

                {!passed && errors > 0 && (
                  <div className="mb-4 pt-4 border-t border-current border-opacity-20">
                    <p className="text-sm font-semibold text-text mb-1">Mistakes Made:</p>
                    <p className="text-sm text-text-muted">{errors} character{errors !== 1 ? 's' : ''} were typed incorrectly. Review and try again!</p>
                  </div>
                )}

                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent-purple/20 px-4 py-2.5 text-sm font-semibold text-accent-purple hover:bg-accent-purple/30 transition-colors"
                >
                  <RotateCcw size={16} />
                  Retry Blind Test
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
