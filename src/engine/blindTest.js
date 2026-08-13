const FLEXIBLE_WHITESPACE_LANGUAGES = new Set(['javascript', 'cpp', 'java', 'c', 'html', 'css', 'react'])

export function comparableCode(code, languageId) {
  return FLEXIBLE_WHITESPACE_LANGUAGES.has(languageId) ? code.replace(/\s+/g, '') : code
}

export function formattingScore(target, typed) {
  if (!typed) return 0
  const length = Math.max(target.length, typed.length)
  const matching = target.split('').filter((char, index) => char === typed[index]).length
  return Math.round((matching / length) * 100)
}

export function getBlindStatus(target, typed, languageId) {
  const expected = comparableCode(target, languageId)
  const actual = comparableCode(typed, languageId)
  return {
    isPrefix: expected.startsWith(actual),
    isComplete: actual === expected,
    formatting: formattingScore(target, typed),
  }
}
