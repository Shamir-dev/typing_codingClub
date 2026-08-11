export function formatChar(char) {
  if (char === ' ') return '␣'
  if (char === '\n') return '⏎'
  return char
}

// Groups the raw mistake log (one entry per wrong keystroke) into a
// per-character frequency summary.
export function summarizeMistakes(mistakes) {
  const byChar = new Map()
  for (const m of mistakes || []) {
    const key = m.expected
    if (!byChar.has(key)) byChar.set(key, { expected: key, count: 0, gotChars: new Map() })
    const entry = byChar.get(key)
    entry.count += 1
    entry.gotChars.set(m.got, (entry.gotChars.get(m.got) || 0) + 1)
  }
  return [...byChar.values()].sort((a, b) => b.count - a.count)
}