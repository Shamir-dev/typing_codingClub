import { EASY_WORDS, MEDIUM_WORDS, HARD_WORDS } from '../content/englishWords'

const POOLS = { easy: EASY_WORDS, medium: MEDIUM_WORDS, hard: HARD_WORDS }
const WORD_COUNT = { easy: 40, medium: 70, hard: 90 }
const TIME_TARGET_SEC = { easy: 60, medium: 120, hard: 180 }
const WORDS_PER_LINE = 9

// Generates a fresh random test: picks WORD_COUNT words (with
// replacement, same as MonkeyType-style pools) from the difficulty's
// word list, wraps them into lines for display, and joins with '\n' so
// the existing line-based typing engine works unchanged. TypingPane's
// `wrap` mode handles the actual visual re-wrap within the container,
// so WORDS_PER_LINE just needs to be "long enough that lines rarely
// need re-wrapping," not pixel-exact.
export function generateEnglishTest(difficulty) {
  const pool = POOLS[difficulty] || EASY_WORDS
  const count = WORD_COUNT[difficulty] || 40

  const words = []
  for (let i = 0; i < count; i++) {
    words.push(pool[Math.floor(Math.random() * pool.length)])
  }

  const lines = []
  for (let i = 0; i < words.length; i += WORDS_PER_LINE) {
    lines.push(words.slice(i, i + WORDS_PER_LINE).join(' '))
  }

  return {
    text: lines.join('\n'),
    timeTargetSec: TIME_TARGET_SEC[difficulty] || 60,
    wordCount: count,
  }
}