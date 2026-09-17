import { CHAR_TO_KEY_ID } from '../content/keyboardLayout'

export function aggregateKeyMistakes(keystrokeLog, charToKeyId = CHAR_TO_KEY_ID) {
  const result = {}
  for (const { typedChar, correct } of keystrokeLog || []) {
    const keyId = charToKeyId[typedChar]
    if (!keyId) continue
    result[keyId] ??= { correct: 0, incorrect: 0 }
    result[keyId][correct ? 'correct' : 'incorrect']++
  }
  return result
}

export function topMistakeKeys(aggregated, n = 5) {
  return Object.entries(aggregated || {})
    .filter(([, value]) => value.incorrect > 0)
    .sort((a, b) => b[1].incorrect - a[1].incorrect)
    .slice(0, n)
    .map(([keyId, value]) => ({ keyId, incorrect: value.incorrect }))
}