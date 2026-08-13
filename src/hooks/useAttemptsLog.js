import { useState, useCallback } from 'react'

const STORAGE_KEY = 'typing-club-attempts'
const BLIND_STORAGE_KEY = 'typing-club-blind-attempts'
const MAX_STORED = 500 // soft cap so localStorage doesn't grow unbounded

function loadAttempts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function loadBlindAttempts() {
  try {
    const raw = localStorage.getItem(BLIND_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAttempts(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // storage unavailable — attempt just won't persist this session
  }
}

function saveBlindAttempts(list) {
  try {
    localStorage.setItem(BLIND_STORAGE_KEY, JSON.stringify(list))
  } catch {
    // storage unavailable — blind attempts just won't persist this session
  }
}

// One row per completed attempt. Schema is deliberately flat and
// generic (not typing-club-specific field names like "bestWpm") so it
// maps directly onto a DB table or analytics event later: lessonId,
// language, difficulty, wpm, accuracy, timeMs, isPerfect, completedAt.
export function useAttemptsLog() {
  const [attempts, setAttempts] = useState(loadAttempts)
  const [blindAttempts, setBlindAttempts] = useState(loadBlindAttempts)

  const logAttempt = useCallback((entry) => {
    setAttempts((prev) => {
      const next = [
        {
          id: `${entry.lessonId}-${Date.now()}`,
          ...entry,
          completedAt: Date.now(),
        },
        ...prev,
      ].slice(0, MAX_STORED)
      saveAttempts(next)
      return next
    })
  }, [])

  const logBlindAttempt = useCallback((entry) => {
    setBlindAttempts((prev) => {
      const next = [
        {
          id: `${entry.lessonId}-${Date.now()}`,
          ...entry,
          completedAt: Date.now(),
        },
        ...prev,
      ].slice(0, MAX_STORED)
      saveBlindAttempts(next)
      return next
    })
  }, [])

  const attemptsForLanguage = useCallback(
    (language) => attempts.filter((a) => a.language === language),
    [attempts]
  )

  const blindAttemptsForLanguage = useCallback(
    (language) => blindAttempts.filter((a) => a.language === language),
    [blindAttempts]
  )

  return { attempts, blindAttempts, logAttempt, logBlindAttempt, attemptsForLanguage, blindAttemptsForLanguage }
}
