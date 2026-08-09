import { useState, useCallback } from 'react'

const STORAGE_KEY = 'typing-club-progress'

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveProgress(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage unavailable (private browsing, quota, etc). Progress
    // just won't persist this session — not fatal to the typing flow.
  }
}

// Progress is stored client-side only for now. Shape is deliberately
// flat and keyed by lesson id so it maps directly onto a future
// `user_progress` table (lessonId, wpm, accuracy, completedAt) once
// a backend exists — this schema doesn't need to change, only where
// it lives.
export function useProgress() {
  const [progress, setProgress] = useState(loadProgress)

  const recordCompletion = useCallback((lessonId, { wpm, accuracy }) => {
    setProgress((prev) => {
      const existing = prev[lessonId]
      const isBest = !existing || wpm > existing.bestWpm
      const next = {
        ...prev,
        [lessonId]: {
          completed: true,
          attempts: (existing?.attempts || 0) + 1,
          bestWpm: isBest ? wpm : existing.bestWpm,
          lastAccuracy: accuracy,
          completedAt: Date.now(),
        },
      }
      saveProgress(next)
      return next
    })
  }, [])

  const getLessonProgress = useCallback((lessonId) => progress[lessonId], [progress])

  return { progress, recordCompletion, getLessonProgress }
}
