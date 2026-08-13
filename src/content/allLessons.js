// Auto-discovers every content/<language>/lessons.json that exists, at
// build time. Adding a new language later means dropping the file at
// content/<id>/lessons.json — nothing here or in App.jsx needs editing.
// A language with no lessons.json simply doesn't appear as available.
import { HTML_CODE_SAMPLES } from './html/codeSamples'

const modules = import.meta.glob('./*/lessons.json', { eager: true })

export const LESSONS_BY_LANGUAGE = {}
for (const path in modules) {
  const match = path.match(/^\.\/(.+)\/lessons\.json$/)
  if (match) {
    const languageId = match[1]
    const lessons = modules[path].default
    LESSONS_BY_LANGUAGE[languageId] = languageId === 'html'
      ? lessons.map((lesson) => ({ ...lesson, code: HTML_CODE_SAMPLES[lesson.id] ?? lesson.code }))
      : lessons
  }
}

export const AVAILABLE_LANGUAGE_IDS = Object.keys(LESSONS_BY_LANGUAGE).filter(
  (id) => LESSONS_BY_LANGUAGE[id]?.length > 0
)

export const ALL_LESSONS_BY_ID = Object.fromEntries(
  Object.values(LESSONS_BY_LANGUAGE).flat().map((l) => [l.id, l])
)
