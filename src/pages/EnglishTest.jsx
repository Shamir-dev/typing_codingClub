import { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Type, ChevronDown, ChevronRight } from 'lucide-react'
import TypingPane from '../components/typing/TypingPane'
import StatusBar from '../components/layout/StatusBar'
import ConsistencyGraph from '../components/review/ConsistencyGraph'
import ResultsLog from '../components/dashboard/ResultsLog'
import { formatTime } from '../engine/timing'
import { formatChar, summarizeMistakes } from '../engine/mistakeSummary'
import { useTypingEngine } from '../engine/useTypingEngine'
import { generateEnglishTest } from '../engine/generateEnglishTest'

const TIERS = [
  { id: 'easy', label: 'Easy', accent: 'var(--color-correct)' },
  { id: 'medium', label: 'Medium', accent: '#e0983d' },
  { id: 'hard', label: 'Hard', accent: 'var(--color-incorrect)' },
]
const TIME_PRESETS = [15, 30, 60, 120]
const WORD_PRESETS = [25, 50, 100]

// Only attempts that represent real practice get logged — a 15s or
// 20-word test isn't meaningful progress data and would just clutter
// the results table.
const MIN_LOG_TIME_MS = 60000
const MIN_LOG_WORDS = 50

const ENGLISH_LESSON_TITLES = {
  'english-easy': { title: 'English (Easy)' },
  'english-medium': { title: 'English (Medium)' },
  'english-hard': { title: 'English (Hard)' },
}

export default function EnglishTest() {
  const { soundMode, logAttempt, attemptsForLanguage } = useOutletContext()
  const [settings, setSettings] = useState({ difficulty: 'easy', mode: 'time', timeSec: 60, wordCount: 50 })
  const [customTime, setCustomTime] = useState('')
  const [customWords, setCustomWords] = useState('')
  const [test, setTest] = useState(() => generateEnglishTest(settings))
  const [resetKey, setResetKey] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [logged, setLogged] = useState(false)

  const engine = useTypingEngine(test.text, { autoIndent: false, timeLimitSec: test.timeLimitSec })
  const accent = TIERS.find((t) => t.id === settings.difficulty)?.accent
  const englishAttempts = attemptsForLanguage('english')

  function applySettings(partial) {
    const next = { ...settings, ...partial }
    setSettings(next)
    setTest(generateEnglishTest(next))
    engine.reset()
    setResetKey((k) => k + 1)
    setLogged(false)
  }

  function retrySameTest() {
    engine.reset()
    setResetKey((k) => k + 1)
    setLogged(false)
  }

  function newTest() {
    setTest(generateEnglishTest(settings))
    engine.reset()
    setResetKey((k) => k + 1)
    setLogged(false)
  }

  // Logged once per completion, gated on the minimum-effort threshold.
  if (engine.isComplete && !logged) {
    const meetsThreshold = engine.elapsedMs >= MIN_LOG_TIME_MS || test.wordCount >= MIN_LOG_WORDS
    if (meetsThreshold) {
      logAttempt({
        lessonId: `english-${settings.difficulty}`,
        language: 'english',
        difficulty: settings.difficulty,
        wpm: engine.wpm,
        accuracy: engine.accuracy,
        consistency: engine.consistency,
        timeMs: engine.elapsedMs,
        isPerfect: engine.isPerfect,
      })
    }
    setLogged(true)
  }

  const mistakeSummary = useMemo(() => summarizeMistakes(engine.mistakes), [engine.mistakes, engine.isComplete])
  const progressPct = (engine.typed.length / test.text.length) * 100

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <Type size={22} className="text-text-faint" />
          <h2 className="font-display font-semibold text-3xl text-text">English Practice</h2>
        </div>
        <p className="text-base text-text-muted mb-6">
          Plain-word typing test — random words, no code, no indentation.
        </p>

        {englishAttempts.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowResults((v) => !v)}
              className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-text-muted font-display font-medium hover:text-text transition-colors mb-3"
            >
              {showResults ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              View Test Results
            </button>
            {showResults && (
              <div className="animate-pop-in">
                <ResultsLog attempts={englishAttempts} lessonsById={ENGLISH_LESSON_TITLES} accent="var(--color-js)" />
              </div>
            )}
          </div>
        )}

        {/* Settings row */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex border border-line rounded-lg overflow-hidden">
            {TIERS.map((tier) => (
              <button
                key={tier.id}
                onClick={() => applySettings({ difficulty: tier.id })}
                className={`px-4 py-2 text-base font-mono transition-colors ${
                  settings.difficulty === tier.id ? 'bg-panel-raised text-text' : 'text-text-muted hover:text-text'
                }`}
              >
                <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: tier.accent }} />
                {tier.label}
              </button>
            ))}
          </div>

          <div className="flex border border-line rounded-lg overflow-hidden">
            {['time', 'words'].map((m) => (
              <button
                key={m}
                onClick={() => applySettings({ mode: m })}
                className={`px-4 py-2 text-base font-mono capitalize transition-colors ${
                  settings.mode === m ? 'bg-panel-raised text-text' : 'text-text-muted hover:text-text'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {settings.mode === 'time' ? (
            <div className="flex items-center gap-1.5">
              {TIME_PRESETS.map((t) => (
                <button
                  key={t}
                  onClick={() => applySettings({ timeSec: t })}
                  className={`px-3 py-1.5 rounded-md text-sm font-mono border transition-colors ${
                    settings.timeSec === t && !customTime
                      ? 'bg-panel-raised text-text border-text-faint'
                      : 'text-text-muted border-line hover:text-text'
                  }`}
                >
                  {t}s
                </button>
              ))}
              <input
                type="number"
                placeholder="custom"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customTime) applySettings({ timeSec: Number(customTime) })
                }}
                onBlur={() => customTime && applySettings({ timeSec: Number(customTime) })}
                className="w-20 px-2 py-1.5 rounded-md text-sm font-mono border border-line bg-panel text-text placeholder:text-text-faint"
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {WORD_PRESETS.map((w) => (
                <button
                  key={w}
                  onClick={() => applySettings({ wordCount: w })}
                  className={`px-3 py-1.5 rounded-md text-sm font-mono border transition-colors ${
                    settings.wordCount === w && !customWords
                      ? 'bg-panel-raised text-text border-text-faint'
                      : 'text-text-muted border-line hover:text-text'
                  }`}
                >
                  {w}
                </button>
              ))}
              <input
                type="number"
                placeholder="custom"
                value={customWords}
                onChange={(e) => setCustomWords(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customWords) applySettings({ wordCount: Number(customWords) })
                }}
                onBlur={() => customWords && applySettings({ wordCount: Number(customWords) })}
                className="w-20 px-2 py-1.5 rounded-md text-sm font-mono border border-line bg-panel text-text placeholder:text-text-faint"
              />
            </div>
          )}

          {engine.isStarted && !engine.isComplete && (
            <button
              onClick={retrySameTest}
              className="ml-auto text-sm font-mono text-text-faint hover:text-text border border-line rounded-md px-3 py-1.5 transition-colors hover:border-text-faint"
            >
              ↺ retry
            </button>
          )}
        </div>

        {!engine.isComplete ? (
          <>
            <TypingPane
              key={resetKey}
              targetCode={test.text}
              typed={engine.typed}
              charStatuses={engine.charStatuses}
              isPaused={engine.isPaused}
              onKeystroke={engine.handleKeystroke}
              onResume={engine.resume}
              accent={accent}
              soundMode={soundMode}
              wrap
            />
            <div className="mt-3">
              <StatusBar
                wpm={engine.wpm}
                accuracy={engine.accuracy}
                elapsedMs={engine.elapsedMs}
                targetTimeSec={test.displayTargetSec}
                accent={accent}
                progressPct={progressPct}
              />
            </div>
          </>
        ) : (
          <div className="animate-pop-in">
            <div className="flex gap-3 mb-6">
              <div className="flex-1 border border-line rounded-md px-5 py-4 bg-panel">
                <div className="text-xs text-text-faint font-mono uppercase tracking-wide">WPM</div>
                <div className="text-3xl font-display font-semibold text-correct mt-0.5">{engine.wpm}</div>
              </div>
              <div className="flex-1 border border-line rounded-md px-5 py-4 bg-panel">
                <div className="text-xs text-text-faint font-mono uppercase tracking-wide">Accuracy</div>
                <div className={`text-3xl font-display font-semibold mt-0.5 ${engine.accuracy < 90 ? 'text-incorrect' : 'text-correct'}`}>
                  {engine.accuracy}%
                </div>
              </div>
              <div className="flex-1 border border-line rounded-md px-5 py-4 bg-panel">
                <div className="text-xs text-text-faint font-mono uppercase tracking-wide">Time taken</div>
                <div className="text-3xl font-display font-semibold text-text mt-0.5">{formatTime(engine.elapsedMs)}</div>
              </div>
            </div>

            <ConsistencyGraph wpmHistory={engine.wpmHistory} keystrokeIntervals={engine.keystrokeIntervals} accent={accent} />

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

            <div className="flex gap-3">
              <button
                onClick={newTest}
                autoFocus
                title="Press Enter for a new test"
                className="px-4 py-2 rounded-md text-sm font-semibold text-[#14151a] hover:opacity-90 transition-opacity shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-transform"
                style={{ backgroundColor: accent }}
              >
                New Test →
              </button>
              <button
                onClick={retrySameTest}
                className="px-4 py-2 rounded-md text-sm font-medium bg-panel-raised text-text hover:opacity-80 transition-opacity border border-line"
              >
                Retry same words
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}