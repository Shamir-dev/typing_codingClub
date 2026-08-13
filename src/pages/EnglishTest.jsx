import { useState, useMemo, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Type, ChevronDown, ChevronRight } from 'lucide-react'
import TypingPane from '../components/typing/TypingPane'
import StatusBar from '../components/layout/StatusBar'
import ConsistencyGraph from '../components/review/ConsistencyGraph'
import TypedTranscript from '../components/review/TypedTranscript'
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
const MEMORY_MAX_WORDS = 150
const MEMORY_MAX_REMEMBER_SEC = 300
const MEMORY_AUTO_SUBMIT_SEC = 600

function normalizeWord(word) {
  return String(word || '').trim().toLowerCase().replace(/[^a-z]/g, '')
}

function levenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0))

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      )
    }
  }

  return matrix[a.length][b.length]
}

function getMemoryWordStatus(word, originalWords) {
  const normalized = normalizeWord(word)
  const exactMatches = originalWords.filter((target) => normalizeWord(target) === normalized)
  if (exactMatches.length > 0) return 'green'

  const nearMatch = originalWords.some((target) => {
    const targetNormalized = normalizeWord(target)
    if (!targetNormalized || normalized === targetNormalized) return false
    return levenshteinDistance(normalized, targetNormalized) <= 1
  })

  if (nearMatch) return 'yellow'
  return 'red'
}

function generateMemoryWords({ difficulty = 'easy', count = 25 }) {
  const easyPool = ['about', 'after', 'again', 'apple', 'begin', 'black', 'build', 'carry', 'chair', 'clear', 'cloud', 'dance', 'earth', 'enter', 'field', 'fresh', 'friend', 'glass', 'green', 'happy', 'house', 'juice', 'learn', 'light', 'money', 'music', 'night', 'paper', 'peace', 'plant', 'quick', 'ready', 'river', 'salad', 'small', 'smile', 'sound', 'space', 'story', 'study', 'sweet', 'table', 'thank', 'today', 'travel', 'under', 'voice', 'water', 'white', 'world', 'young', 'garden', 'winter', 'signal', 'window', 'planet', 'rocket', 'forest']
  const mediumPool = ['ability', 'action', 'amount', 'attention', 'balance', 'benefit', 'business', 'career', 'change', 'choice', 'common', 'complex', 'culture', 'decision', 'design', 'device', 'effect', 'energy', 'family', 'feature', 'future', 'growth', 'health', 'history', 'impact', 'important', 'journey', 'language', 'lesson', 'market', 'method', 'nature', 'office', 'option', 'pattern', 'people', 'practice', 'process', 'project', 'reason', 'record', 'result', 'service', 'source', 'system', 'teacher', 'travel', 'value', 'vision', 'window', 'worker']
  const hardPool = ['accomplish', 'anticipate', 'appreciate', 'calculate', 'challenge', 'clarify', 'collaborate', 'communicate', 'concentrate', 'coordinate', 'determine', 'differentiate', 'distribute', 'efficient', 'evaluate', 'examine', 'experience', 'generate', 'identify', 'implement', 'independent', 'interpret', 'investigate', 'maintain', 'negotiate', 'organize', 'persevere', 'perspective', 'predict', 'prioritize', 'procedure', 'recognize', 'recommend', 'reliable', 'resolve', 'respond', 'significant', 'sophisticated', 'structure', 'sustain', 'technological', 'transform']

  const pools = {
    easy: easyPool,
    medium: mediumPool,
    hard: hardPool,
  }

  const wordList = []
  const totalEasy = Math.round(count * 0.5)
  const totalMedium = Math.round(count * 0.3)
  const totalHard = count - totalEasy - totalMedium

  const build = (pool, num) => Array.from({ length: num }, () => pool[Math.floor(Math.random() * pool.length)])

  wordList.push(...build(pools.easy, totalEasy))
  wordList.push(...build(pools.medium, totalMedium))
  wordList.push(...build(pools.hard, totalHard))

  for (let i = wordList.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[wordList[i], wordList[j]] = [wordList[j], wordList[i]]
  }

  return wordList.slice(0, count)
}

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
  const { soundMode, cursorStyle, logAttempt, attemptsForLanguage } = useOutletContext()
  const [settings, setSettings] = useState({ difficulty: 'easy', mode: 'time', timeSec: 60, wordCount: 50 })
  const [customTime, setCustomTime] = useState('')
  const [customWords, setCustomWords] = useState('')
  const [memoryWordCount, setMemoryWordCount] = useState(25)
  const [memoryRecallSec, setMemoryRecallSec] = useState(20)
  const [memoryWords, setMemoryWords] = useState([])
  const [memoryInput, setMemoryInput] = useState('')
  const [memoryPhase, setMemoryPhase] = useState('idle')
  const [memoryCountdown, setMemoryCountdown] = useState(20)
  const [memoryAutoTimer, setMemoryAutoTimer] = useState(MEMORY_AUTO_SUBMIT_SEC)
  const [showOriginalWords, setShowOriginalWords] = useState(false)
  const [showWordList, setShowWordList] = useState(false)
  const [memoryResult, setMemoryResult] = useState(null)
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
  // Must be an effect, not run during render — calling setState (and a
  // context function) directly in the render body is invalid and was
  // crashing this route entirely once a test completed.
  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.isComplete])

  const mistakeSummary = useMemo(() => summarizeMistakes(engine.mistakes), [engine.mistakes, engine.isComplete])
  const progressPct = (engine.typed.length / test.text.length) * 100

  function startMemoryTest() {
    const safeWordCount = Math.min(Math.max(Number(memoryWordCount) || 25, 1), MEMORY_MAX_WORDS)
    const safeRecallSec = Math.min(Math.max(Number(memoryRecallSec) || 20, 1), MEMORY_MAX_REMEMBER_SEC)
    const words = generateMemoryWords({ difficulty: settings.difficulty, count: safeWordCount })

    setMemoryWords(words)
    setMemoryInput('')
    setMemoryCountdown(safeRecallSec)
    setMemoryAutoTimer(MEMORY_AUTO_SUBMIT_SEC)
    setMemoryPhase('memorize')
    setMemoryResult(null)
    setShowOriginalWords(false)
    setShowWordList(false)
    setShowWordList(false)
  }

  function submitMemoryTest() {
    if (!memoryWords.length) return

    const typedWords = memoryInput
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.toLowerCase())

    const targetWords = memoryWords.map((word) => word.toLowerCase())
    const remaining = { ...Object.fromEntries(targetWords.map((word) => [word, (Object.fromEntries(Array.from(new Set(targetWords)).map((w) => [w, targetWords.filter((value) => value === w).length])))[word] || 0])) }

    let correctCount = 0
    typedWords.forEach((word) => {
      if (remaining[word] > 0) {
        remaining[word] -= 1
        correctCount += 1
      }
    })

    const scorePct = Math.round((correctCount / targetWords.length) * 100)

    setMemoryResult({
      correctCount,
      totalWords: targetWords.length,
      scorePct,
      typedWords,
      reviewWords: typedWords.map((word) => ({
        word,
        status: getMemoryWordStatus(word, targetWords),
      })),
    })
    setMemoryPhase('complete')
    setShowWordList(true)
  }

  useEffect(() => {
    if (memoryPhase !== 'memorize') return

    if (memoryCountdown <= 0) {
      setMemoryPhase('typing')
      return
    }

    const timer = setTimeout(() => setMemoryCountdown((prev) => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [memoryPhase, memoryCountdown])

  useEffect(() => {
    if (memoryPhase !== 'typing') return

    if (memoryAutoTimer <= 0) {
      submitMemoryTest()
      return
    }

    const timer = setTimeout(() => setMemoryAutoTimer((prev) => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [memoryPhase, memoryAutoTimer])

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-5 py-6 sm:px-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <Type size={22} className="text-text-faint" />
          <h2 className="font-display font-semibold text-3xl sm:text-4xl text-text">English Practice</h2>
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
        <div className="flex flex-wrap items-center gap-3 mb-7 rounded-xl border border-line bg-panel/55 p-3">
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
            {['time', 'words', 'memory'].map((m) => (
              <button
                key={m}
                onClick={() => applySettings({ mode: m })}
                className={`px-4 py-2 text-base font-mono capitalize transition-colors ${
                  settings.mode === m ? 'bg-panel-raised text-text' : 'text-text-muted hover:text-text'
                }`}
              >
                {m === 'memory' ? 'Memory' : m}
              </button>
            ))}
          </div>

          {settings.mode === 'memory' ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-md border border-line bg-panel px-2 py-1.5">
                <label className="text-[11px] uppercase tracking-wide text-text-faint">Words</label>
                <input
                  type="number"
                  min="1"
                  max={MEMORY_MAX_WORDS}
                  value={memoryWordCount}
                  onChange={(e) => setMemoryWordCount(Math.min(Math.max(Number(e.target.value) || 1, 1), MEMORY_MAX_WORDS))}
                  className="w-16 px-2 py-1 rounded-md text-sm font-mono border border-line bg-panel text-text placeholder:text-text-faint"
                />
              </div>
              <div className="flex items-center gap-1.5 rounded-md border border-line bg-panel px-2 py-1.5">
                <label className="text-[11px] uppercase tracking-wide text-text-faint">Remember</label>
                <input
                  type="number"
                  min="1"
                  max={MEMORY_MAX_REMEMBER_SEC}
                  value={memoryRecallSec}
                  onChange={(e) => setMemoryRecallSec(Math.min(Math.max(Number(e.target.value) || 1, 1), MEMORY_MAX_REMEMBER_SEC))}
                  className="w-16 px-2 py-1 rounded-md text-sm font-mono border border-line bg-panel text-text placeholder:text-text-faint"
                />
                <span className="text-xs text-text-muted">sec</span>
              </div>
              <button
                onClick={startMemoryTest}
                className="px-3 py-1.5 rounded-md text-sm font-mono border border-line bg-panel-raised text-text hover:border-text-faint transition-colors"
              >
                Start memory test
              </button>
            </div>
          ) : settings.mode === 'time' ? (
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

        {settings.mode === 'memory' ? (
          <div className="max-w-4xl mx-auto">
            {!memoryWords.length && memoryPhase === 'idle' && (
              <div className="rounded-xl border border-line bg-panel/55 p-6 text-center text-text-muted">
                Pick a word count and recall time, then start the memory round.
              </div>
            )}

            {memoryPhase === 'memorize' && (
              <div className="animate-pop-in">
                <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-line bg-panel/55 p-3 text-sm font-mono text-text-muted">
                  <span>Memory phase: {memoryCountdown}s remaining</span>
                  <button
                    onClick={() => setMemoryPhase('typing')}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold text-[#14151a] hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: 'var(--color-accent-purple)' }}
                  >
                    Start Test
                  </button>
                </div>
                <div className="rounded-xl border border-line bg-panel/60 p-5 text-lg leading-relaxed text-text whitespace-pre-wrap break-words">
                  {memoryWords.join(' ')}
                </div>
              </div>
            )}

            {memoryPhase === 'typing' && (
              <div className="animate-pop-in">
                <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-line bg-panel/55 p-3 text-sm font-mono text-text-muted">
                  <span>Type the remembered words</span>
                  <span>Auto-submit in {String(Math.floor(memoryAutoTimer / 60)).padStart(2, '0')}:{String(memoryAutoTimer % 60).padStart(2, '0')}</span>
                </div>
                <textarea
                  value={memoryInput}
                  onChange={(e) => setMemoryInput(e.target.value)}
                  className="w-full min-h-[180px] resize-none rounded-xl border border-line bg-panel px-4 py-3 font-mono text-base text-text outline-none placeholder:text-text-faint focus:border-text-faint"
                  placeholder="Type the words you remembered here..."
                />
                <div className="mt-4 flex items-center justify-between gap-3">
                  <button
                    onClick={submitMemoryTest}
                    className="px-4 py-2 rounded-md text-sm font-semibold text-[#14151a] hover:opacity-90 transition-opacity shadow-sm"
                    style={{ backgroundColor: 'var(--color-accent-purple)' }}
                  >
                    Submit memory test
                  </button>
                  <button
                    onClick={() => setShowOriginalWords((prev) => !prev)}
                    className="px-3 py-2 rounded-md text-xs font-mono uppercase tracking-wide text-text-faint hover:text-text border border-line transition-colors"
                  >
                    {showOriginalWords ? 'Hide word list' : 'Show word list'}
                  </button>
                </div>
                {showOriginalWords && (
                  <div className="mt-4 rounded-xl border border-line bg-panel/55 p-4">
                    <div className="mb-2 text-xs uppercase tracking-wide text-text-faint">Original word list</div>
                    <div className="font-mono text-sm text-text break-words">{memoryWords.join(' ')}</div>
                  </div>
                )}
              </div>
            )}

            {memoryPhase === 'complete' && memoryResult && (
              <div className="animate-pop-in max-w-3xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  <div className="border border-line rounded-md px-5 py-4 bg-panel">
                    <div className="text-xs text-text-faint font-mono uppercase tracking-wide">Correct</div>
                    <div className="text-3xl font-display font-semibold text-correct mt-0.5">{memoryResult.correctCount}/{memoryResult.totalWords}</div>
                  </div>
                  <div className="border border-line rounded-md px-5 py-4 bg-panel">
                    <div className="text-xs text-text-faint font-mono uppercase tracking-wide">Score</div>
                    <div className="text-3xl font-display font-semibold text-text mt-0.5">{memoryResult.scorePct}%</div>
                  </div>
                  <div className="border border-line rounded-md px-5 py-4 bg-panel">
                    <div className="text-xs text-text-faint font-mono uppercase tracking-wide">Status</div>
                    <div className="text-3xl font-display font-semibold text-text mt-0.5">{memoryResult.scorePct >= 80 ? 'Great' : memoryResult.scorePct >= 60 ? 'Good' : 'Retry'}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <button
                    onClick={() => setShowWordList((prev) => !prev)}
                    className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-muted hover:text-text transition-colors"
                  >
                    {showWordList ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    View word list
                  </button>
                </div>

                {showWordList && (
                  <div className="rounded-xl border border-line bg-panel/60 p-5 mb-6">
                    <div className="mb-3 text-xs uppercase tracking-wide text-text-faint">Word-by-word review</div>
                    <div className="flex flex-wrap gap-2 font-mono text-sm">
                      {(memoryResult.reviewWords || []).map((entry, index) => {
                        const { word, status } = entry
                        const colorClass = status === 'green'
                          ? 'border-green-500/40 bg-green-500/10 text-green-300'
                          : status === 'yellow'
                            ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300'
                            : 'border-red-500/40 bg-red-500/10 text-red-300'

                        return (
                          <span
                            key={`${word}-${index}`}
                            className={`inline-flex items-center rounded-md border px-2.5 py-1.5 ${colorClass}`}
                            title={word}
                          >
                            {word}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <button
                    onClick={() => setShowOriginalWords((prev) => !prev)}
                    className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-muted hover:text-text transition-colors"
                  >
                    {showOriginalWords ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    View original word list
                  </button>
                </div>

                {showOriginalWords && (
                  <div className="rounded-xl border border-line bg-panel/60 p-5 mb-6 font-mono text-sm text-text whitespace-pre-wrap break-words">
                    {memoryWords.join(' ')}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => startMemoryTest()}
                    className="px-4 py-2 rounded-md text-sm font-semibold text-[#14151a] hover:opacity-90 transition-opacity shadow-sm"
                    style={{ backgroundColor: 'var(--color-accent-purple)' }}
                  >
                    Retest
                  </button>
                  <button
                    onClick={() => {
                      setMemoryWords([])
                      setMemoryInput('')
                      setMemoryPhase('idle')
                      setMemoryResult(null)
                      setShowOriginalWords(false)
                    }}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-panel-raised text-text hover:opacity-80 transition-opacity border border-line"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : !engine.isComplete ? (
          <div className="max-w-4xl mx-auto">
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
              cursorStyle={cursorStyle}
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
          </div>
        ) : (
          <div className="animate-pop-in max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
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

            <TypedTranscript targetCode={test.text} typed={engine.typed} mistakes={engine.mistakes} />

            <div className="flex gap-3">
             <button
                onClick={newTest}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    newTest()
                  } else {
                    e.preventDefault()
                  }
                }}
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
