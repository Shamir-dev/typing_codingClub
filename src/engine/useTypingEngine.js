import { useState, useRef, useCallback, useEffect } from 'react'
import { diffChars, CHAR_STATUS } from './diff'
import { calculateWPM, calculateAccuracy } from './timing'

const IDLE_PAUSE_MS = 5000
const SAMPLE_INTERVAL_MS = 1000

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
  const wpmHistoryRef = useRef([])

  // First-attempt correctness per character position, recorded once
  // and never overwritten — this is what makes accuracy "correct on
  // first try" (MonkeyType/TypeRacer style) instead of measuring only
  // the final, possibly-corrected result.
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

  // Samples instantaneous WPM roughly once a second, used to draw the
  // consistency graph on the results screen.
  useEffect(() => {
    if (startedAt && !finishedAt && !isPaused) {
      sampleRef.current = setInterval(() => {
        const now = Date.now()
        const elapsed = now - startedAt
        const correctSoFar = [...firstAttemptRef.current.values()].filter(Boolean).length
        wpmHistoryRef.current.push({
          t: Math.round(elapsed / 1000),
          wpm: calculateWPM(correctSoFar, elapsed),
        })
      }, SAMPLE_INTERVAL_MS)
      return () => clearInterval(sampleRef.current)
    }
  }, [startedAt, finishedAt, isPaused])

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
    pausedAtRef.current = null
    lastActivityRef.current = Date.now()
    setIsPaused(false)
  }, [isPaused])

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
        setTyped((prev) => prev.slice(0, -1))
        return
      }

      if (key === 'Tab') {
        setTyped((prev) => {
          let idx = prev.length
          let insertion = ''
          while (idx < targetCode.length && targetCode[idx] === ' ') {
            recordFirstAttempt(idx, true)
            insertion += ' '
            idx++
          }
          if (insertion.length === 0) {
            recordFirstAttempt(prev.length, targetCode[prev.length] === ' ')
            insertion = ' '
          }
          return prev + insertion
        })
        return
      }

      setTyped((prev) => {
        const nextIndex = prev.length
        if (nextIndex >= targetCode.length) return prev

        const isCorrect = key === targetCode[nextIndex]
        recordFirstAttempt(nextIndex, isCorrect)
        if (!isCorrect) {
          mistakeLog.current.push({ index: nextIndex, expected: targetCode[nextIndex], got: key })
        }
        return prev + key
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
    lastActivityRef.current = null
    pausedAtRef.current = null
  }, [])

  const correctCharCount = typed.split('').filter((c, i) => c === targetCode[i]).length
  const charStatuses = diffChars(targetCode, typed)
  const wpm = calculateWPM(correctCharCount, elapsedMs)

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
    handleKeystroke,
    resume,
    reset,
  }
}

export { CHAR_STATUS }
