// Standard WPM formula: one "word" = 5 characters, regardless of the
// actual words in the text. This is the same convention typing-test
// sites use, which is what makes the lesson timing targets (built
// around a 45 WPM reference) comparable to what the user sees live.
const CHARS_PER_WORD = 5

export function calculateWPM(correctCharCount, elapsedMs) {
  if (elapsedMs <= 0) return 0
  const minutes = elapsedMs / 60000
  const words = correctCharCount / CHARS_PER_WORD
  return Math.round(words / minutes)
}

// Accuracy reflects the FINAL typed result against the target — not a
// running "keystrokes vs mistakes" ratio. A ratio-based score also had
// a real bug: Tab inserts several characters per single keystroke, so
// correctCharCount (character-based) could exceed totalKeystrokes
// (keystroke-based), pushing "accuracy" over 100%. Scoring off the
// final state avoids that entirely and matches what the user asked
// for: credit for what's correct at submit time, not a penalty for
// mistakes that were already corrected along the way.
export function calculateAccuracy(correctCharCount, targetLength) {
  if (targetLength <= 0) return 100
  return Math.round((correctCharCount / targetLength) * 100)
}

export function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Lets the UI show "on pace" / "behind pace" against the lesson's
// own timeTargetSec, rather than a generic WPM number in isolation.
export function paceStatus(elapsedMs, charsTyped, targetTimeSec, targetCharCount) {
  const expectedProgress = Math.min(elapsedMs / 1000 / targetTimeSec, 1)
  const actualProgress = charsTyped / targetCharCount
  if (actualProgress >= expectedProgress - 0.05) return 'on-pace'
  return 'behind'
}
