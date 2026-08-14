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
//
// Per-lesson entry shape:
// {
//   completed: boolean,
//   attempts: number,
//   bestWpm: number,
//   bestAccuracy: number,        // regular typing lesson, 0-100
//   lastAccuracy: number,
//   completedAt: number,
//   blind: {
//     pro:     { bestAccuracy: number, attempts: number } | undefined,
//     learner: { bestAccuracy: number, attempts: number } | undefined,
//   } | undefined
// }
//
// blind.pro / blind.learner being undefined means "not attempted" —
// distinct from a 0% attempt, so the UI can tell "Not Unlocked" /
// "Available" apart from an actual failed attempt.
export function useProgress() {
  const [progress, setProgress] = useState(loadProgress)

  const recordCompletion = useCallback((lessonId, { wpm, accuracy }) => {
    setProgress((prev) => {
      const existing = prev[lessonId]
      const isBestWpm = !existing || wpm > existing.bestWpm
      const isBestAccuracy = !existing || accuracy > (existing.bestAccuracy ?? 0)
      const next = {
        ...prev,
        [lessonId]: {
          ...existing,
          completed: true,
          attempts: (existing?.attempts || 0) + 1,
          bestWpm: isBestWpm ? wpm : existing.bestWpm,
          bestAccuracy: isBestAccuracy ? accuracy : existing.bestAccuracy,
          lastAccuracy: accuracy,
          completedAt: Date.now(),
        },
      }
      saveProgress(next)
      return next
    })
  }, [])

  // mode is 'pro' | 'learner'. Blind attempts are gated in the UI on
  // `completed` being true for this lessonId — this recorder doesn't
  // enforce that itself, callers (BlindTest.jsx) should only invoke it
  // once the regular lesson is already completed.
  const recordBlindAttempt = useCallback((lessonId, mode, accuracy) => {
    setProgress((prev) => {
      const existing = prev[lessonId]
      const existingBlind = existing?.blind ?? {}
      const existingModeEntry = existingBlind[mode]
      const bestAccuracy = Math.max(existingModeEntry?.bestAccuracy ?? 0, accuracy)
      const attempts = (existingModeEntry?.attempts ?? 0) + 1

      const next = {
        ...prev,
        [lessonId]: {
          ...existing,
          blind: {
            ...existingBlind,
            [mode]: { bestAccuracy, attempts, lastAccuracy: accuracy, lastAttemptAt: Date.now() },
          },
        },
      }
      saveProgress(next)
      return next
    })
  }, [])

  const getLessonProgress = useCallback((lessonId) => progress[lessonId], [progress])

  return { progress, recordCompletion, recordBlindAttempt, getLessonProgress }
}

// ---- Star band helpers (shared with StarRating / LessonCard) ----
// Regular lesson stars: WPM-driven per confirmed spec. Accuracy is still
// tracked/displayed but no longer decides the star count directly.
export function getLessonStarRating(wpm) {
  if (wpm > 40) return { stars: 5, passed: true }
  if (wpm > 35) return { stars: 4, passed: true }
  if (wpm > 25) return { stars: 3, passed: true }
  return { stars: 2, passed: true } // any completed attempt below the wpm bands
}

// Blind test bands (pro & learner share the same bands).
export function getBlindStarRating(accuracy) {
  if (accuracy < 80) return { stars: 1, passed: false }
  if (accuracy < 90) return { stars: 2, passed: false }
  if (accuracy < 95) return { stars: 3, passed: true }
  if (accuracy < 97) return { stars: 4, passed: true }
  return { stars: 5, passed: true }
}

export function getLessonStarDisplay(progressEntry) {
  if (!progressEntry?.completed || progressEntry?.bestWpm == null) {
    return { attempted: false, accuracy: null, wpm: null, stars: 0, passed: false }
  }
  const { stars, passed } = getLessonStarRating(progressEntry.bestWpm)
  return { attempted: true, accuracy: progressEntry.bestAccuracy, wpm: progressEntry.bestWpm, stars, passed }
}

// unlocked: gated purely on the regular lesson being completed —
// per spec this is a lesson-availability gate, not an accuracy check.
export function getBlindModeDisplay(progressEntry, mode) {
  const isUnlocked = !!progressEntry?.completed
  const modeEntry = progressEntry?.blind?.[mode]

  if (!isUnlocked) {
    return { unlocked: false, attempted: false, accuracy: null, stars: 0, passed: false }
  }
  if (!modeEntry) {
    return { unlocked: true, attempted: false, accuracy: null, stars: 0, passed: false }
  }
  const { stars, passed } = getBlindStarRating(modeEntry.bestAccuracy)
  return { unlocked: true, attempted: true, accuracy: modeEntry.bestAccuracy, stars, passed }
}