import { useState, useCallback } from 'react'

const STORAGE_KEY = 'typing-club-attempts'
const MAX_STORED = 500 // soft cap so localStorage doesn't grow unbounded

function loadAttempts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
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

// One row per completed attempt. Schema is deliberately flat and
// generic (not typing-club-specific field names like "bestWpm") so it
// maps directly onto a DB table or analytics event later: lessonId,
// language, difficulty, wpm, accuracy, timeMs, isPerfect, completedAt.
export function useAttemptsLog() {
  const [attempts, setAttempts] = useState(loadAttempts)

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

  const attemptsForLanguage = useCallback(
    (language) => attempts.filter((a) => a.language === language),
    [attempts]
  )

  return { attempts, logAttempt, attemptsForLanguage }
}
