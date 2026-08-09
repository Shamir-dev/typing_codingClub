// Compares what the user has typed so far against the target code,
// character by character. Returns a status per character so the UI
// can render "correct / incorrect / pending / current" without
// knowing anything about how the comparison works.

export const CHAR_STATUS = {
  PENDING: 'pending',
  CORRECT: 'correct',
  INCORRECT: 'incorrect',
  CURRENT: 'current',
}

export function diffChars(target, typed) {
  const result = new Array(target.length)

  for (let i = 0; i < target.length; i++) {
    if (i < typed.length) {
      result[i] = typed[i] === target[i] ? CHAR_STATUS.CORRECT : CHAR_STATUS.INCORRECT
    } else if (i === typed.length) {
      result[i] = CHAR_STATUS.CURRENT
    } else {
      result[i] = CHAR_STATUS.PENDING
    }
  }

  return result
}

// Total mistakes made, including ones the user has since corrected.
// Accuracy should reflect real errors, not just the final clean state.
export function countMistakes(mistakeLog) {
  return mistakeLog.length
}
