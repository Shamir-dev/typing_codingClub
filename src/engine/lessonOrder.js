const DIFFICULTY_ORDER = ['easy', 'medium', 'hard']

function orderedLessons(lessons) {
  return DIFFICULTY_ORDER.flatMap((tier) => lessons.filter((l) => l.difficulty === tier))
}

export function getNextLesson(lessons, currentId) {
  const ordered = orderedLessons(lessons)
  const idx = ordered.findIndex((l) => l.id === currentId)
  if (idx === -1 || idx === ordered.length - 1) return null
  return ordered[idx + 1]
}

export function getPreviousLesson(lessons, currentId) {
  const ordered = orderedLessons(lessons)
  const idx = ordered.findIndex((l) => l.id === currentId)
  if (idx <= 0) return null
  return ordered[idx - 1]
}