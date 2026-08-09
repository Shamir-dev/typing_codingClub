// Splits target code + its parallel char-status array into lines, so
// the Gutter (line numbers) and TypingPane (code render) stay in sync
// without either one re-deriving the split independently.
export function splitIntoLines(target, charStatuses) {
  const lines = []
  let currentLine = { chars: [], statuses: [] }

  for (let i = 0; i < target.length; i++) {
    if (target[i] === '\n') {
      lines.push(currentLine)
      currentLine = { chars: [], statuses: [] }
    } else {
      currentLine.chars.push(target[i])
      currentLine.statuses.push(charStatuses[i])
    }
  }
  lines.push(currentLine)
  return lines
}

export function currentLineIndex(typed) {
  return typed.split('\n').length - 1
}
