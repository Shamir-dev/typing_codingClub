import { EASY_WORDS, MEDIUM_WORDS, HARD_WORDS } from '../content/englishWords'

const POOLS = { easy: EASY_WORDS, medium: MEDIUM_WORDS, hard: HARD_WORDS }
const BUFFER_WPM = 90 // generous typing-speed assumption so a timed test never runs out of words before time's up

// mode: 'time' — generates a deliberately oversized word pool; the
//   engine cuts the test off at timeSec regardless of how much got typed.
// mode: 'words' — generates exactly wordCount words; the test ends
//   when they're all typed, how ever long that takes (existing behavior).
export function generateEnglishTest({ difficulty = 'easy', mode = 'time', timeSec = 60, wordCount = 40 }) {
  const pool = POOLS[difficulty] || EASY_WORDS

  const count =
    mode === 'time'
      ? Math.max(20, Math.ceil((timeSec / 60) * BUFFER_WPM))
      : Math.max(5, wordCount || 40)

  const words = []
  for (let i = 0; i < count; i++) {
    words.push(pool[Math.floor(Math.random() * pool.length)])
  }

  // No manual line breaks — a fixed words-per-line count fights against
  // the container's actual width, leaving ragged empty space on wide
  // screens. TypingPane's wrap mode uses CSS pre-wrap, which reflows
  // naturally at whatever width the container actually has.
  const softTargetSec = Math.round((count * 6) / (250 / 60))

  return {
    text: words.join(' '),
    mode,
    timeLimitSec: mode === 'time' ? timeSec : null,
    displayTargetSec: mode === 'time' ? timeSec : softTargetSec,
    wordCount: count,
  }
}