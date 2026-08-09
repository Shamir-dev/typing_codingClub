import { useState, useRef, useCallback, useEffect } from 'react'
import { diffChars, CHAR_STATUS } from './diff'
import { calculateAccuracy } from './timing'
import { consistencyScore } from './consistency'

const IDLE_PAUSE_MS = 5000
const SAMPLE_INTERVAL_MS = 1000

function wpmFromChars(charCount, ms) {
  if (ms <= 0) return 0
  return Math.max(0, Math.round((charCount / 5) / (ms / 60000)))
}

// Drives a single typing session against one lesson's code string.
export function useTypingEngine(targetCode) {
  const [typed, setTyped] = useState('')
  const [startedAt, setStartedAt] = useState(null)
  const [finishedAt, setFinishedAt] = useState(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const mistakeLog = useRef([])
  const tickRef = useRef(null)
  const idleCheckRef = useRef(null)
  const sampleRef = useRef(null)
  const lastActivityRef = useRef(null)
  const pausedAtRef = useRef(null)

  // { t: seconds, raw: wpm incl. mistakes this window, actual: correct-only wpm this window }
  // Per-WINDOW (instantaneous), not cumulative — a cumulative average
  // mathematically converges to a flat line over time and can never
  // show real typing jitter. This is what makes the graph look like
  // MonkeyType's fluctuating raw/actual lines instead of a smooth decay.
  const wpmHistoryRef = useRef([])
  const keystrokeIntervalsRef = useRef([])
  const lastKeystrokeTimeRef = useRef(null)

  // Live mirror of `typed`, read inside the sampling interval — the
  // interval closure is set up once per start/pause cycle and would
  // otherwise see a stale `typed` value from whenever the effect ran.
  const liveTypedRef = useRef('')
  const lastSampleAtRef = useRef(null)
  const lastSampleTypedLenRef = useRef(0)
  const lastSampleCorrectRef = useRef(0)

  const firstAttemptRef = useRef(new Map())

  const isComplete = typed.length === targetCode.length
  const isPerfect = isComplete && typed === targetCode

  useEffect(() => {
    if (startedAt && !finishedAt && !isPaused) {
      tickRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startedAt)
      }, 200)
      return () => clearInterval(tickRef.current)
    }
  }, [startedAt, finishedAt, isPaused])

  useEffect(() => {
    if (startedAt && !finishedAt && !isPaused) {
      idleCheckRef.current = setInterval(() => {
        if (Date.now() - (lastActivityRef.current || Date.now()) >= IDLE_PAUSE_MS) {
          pausedAtRef.current = Date.now()
          setIsPaused(true)
        }
      }, 500)
      return () => clearInterval(idleCheckRef.current)
    }
  }, [startedAt, finishedAt, isPaused])

  // Samples instantaneous (this-window-only) raw + actual WPM roughly
  // once a second, used to draw the results-screen consistency graph.
  useEffect(() => {
    if (startedAt && !finishedAt && !isPaused) {
      if (lastSampleAtRef.current === null) {
        lastSampleAtRef.current = startedAt
      }
      sampleRef.current = setInterval(() => {
        const now = Date.now()
        const windowMs = now - lastSampleAtRef.current
        if (windowMs <= 0) return

        const currentTyped = liveTypedRef.current
        const currentCorrect = currentTyped
          .split('')
          .filter((c, i) => c === targetCode[i]).length

        const deltaChars = currentTyped.length - lastSampleTypedLenRef.current
        const deltaCorrect = currentCorrect - lastSampleCorrectRef.current

        wpmHistoryRef.current.push({
          t: Math.round((now - startedAt) / 1000),
          raw: wpmFromChars(Math.max(0, deltaChars), windowMs),
          actual: wpmFromChars(Math.max(0, deltaCorrect), windowMs),
        })

        lastSampleAtRef.current = now
        lastSampleTypedLenRef.current = currentTyped.length
        lastSampleCorrectRef.current = currentCorrect
      }, SAMPLE_INTERVAL_MS)
      return () => clearInterval(sampleRef.current)
    }
  }, [startedAt, finishedAt, isPaused, targetCode])

  useEffect(() => {
    if (isComplete && startedAt && !finishedAt) {
      setFinishedAt(Date.now())
      setElapsedMs(Date.now() - startedAt)
      clearInterval(tickRef.current)
      clearInterval(idleCheckRef.current)
      clearInterval(sampleRef.current)
    }
  }, [isComplete, startedAt, finishedAt])

  const resume = useCallback(() => {
    if (!isPaused) return
    const idleDuration = Date.now() - (pausedAtRef.current || Date.now())
    setStartedAt((prev) => (prev !== null ? prev + idleDuration : prev))
    if (lastSampleAtRef.current !== null) lastSampleAtRef.current += idleDuration
    pausedAtRef.current = null
    lastActivityRef.current = Date.now()
    setIsPaused(false)
  }, [isPaused])

  const recordKeystrokeTiming = () => {
    const now = Date.now()
    if (lastKeystrokeTimeRef.current !== null) {
      keystrokeIntervalsRef.current.push(now - lastKeystrokeTimeRef.current)
    }
    lastKeystrokeTimeRef.current = now
  }

  const recordFirstAttempt = (index, isCorrect) => {
    if (!firstAttemptRef.current.has(index)) {
      firstAttemptRef.current.set(index, isCorrect)
    }
  }

  const handleKeystroke = useCallback(
    (key) => {
      if (finishedAt || isPaused) return

      if (!startedAt) setStartedAt(Date.now())
      lastActivityRef.current = Date.now()

      if (key === 'Backspace') {
        setTyped((prev) => {
          const next = prev.slice(0, -1)
          liveTypedRef.current = next
          return next
        })
        return
      }

      if (key === 'Tab') {
        setTyped((prev) => {
          let idx = prev.length
          let insertion = ''
          while (idx < targetCode.length && targetCode[idx] === ' ') {
            recordFirstAttempt(idx, true)
            recordKeystrokeTiming()
            insertion += ' '
            idx++
          }
          if (insertion.length === 0) {
            recordFirstAttempt(prev.length, targetCode[prev.length] === ' ')
            recordKeystrokeTiming()
            insertion = ' '
          }
          const next = prev + insertion
          liveTypedRef.current = next
          return next
        })
        return
      }

      setTyped((prev) => {
        const nextIndex = prev.length
        if (nextIndex >= targetCode.length) return prev

        const isCorrect = key === targetCode[nextIndex]
        recordFirstAttempt(nextIndex, isCorrect)
        recordKeystrokeTiming()
        if (!isCorrect) {
          mistakeLog.current.push({ index: nextIndex, expected: targetCode[nextIndex], got: key })
        }
        const next = prev + key
        liveTypedRef.current = next
        return next
      })
    },
    [targetCode, startedAt, finishedAt, isPaused]
  )

  const reset = useCallback(() => {
    setTyped('')
    setStartedAt(null)
    setFinishedAt(null)
    setElapsedMs(0)
    setIsPaused(false)
    mistakeLog.current = []
    firstAttemptRef.current = new Map()
    wpmHistoryRef.current = []
    keystrokeIntervalsRef.current = []
    lastKeystrokeTimeRef.current = null
    lastActivityRef.current = null
    pausedAtRef.current = null
    liveTypedRef.current = ''
    lastSampleAtRef.current = null
    lastSampleTypedLenRef.current = 0
    lastSampleCorrectRef.current = 0
  }, [])

  const correctCharCount = typed.split('').filter((c, i) => c === targetCode[i]).length
  const charStatuses = diffChars(targetCode, typed)
  const wpm = wpmFromChars(correctCharCount, elapsedMs)

  const firstAttemptCorrect = [...firstAttemptRef.current.values()].filter(Boolean).length
  const firstAttemptTotal = firstAttemptRef.current.size
  const accuracy = calculateAccuracy(firstAttemptCorrect, firstAttemptTotal)

  return {
    typed,
    charStatuses,
    isComplete,
    isPerfect,
    isStarted: !!startedAt,
    isPaused,
    elapsedMs,
    wpm,
    accuracy,
    mistakeCount: mistakeLog.current.length,
    mistakes: mistakeLog.current,
    wpmHistory: wpmHistoryRef.current,
    keystrokeIntervals: keystrokeIntervalsRef.current,
    consistency: consistencyScore(wpmHistoryRef.current),
    handleKeystroke,
    resume,
    reset,
  }
}

export { CHAR_STATUS }