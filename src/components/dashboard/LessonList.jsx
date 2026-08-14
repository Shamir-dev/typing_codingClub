import LessonCard from './LessonCard'

const DIFFICULTY_ORDER = ['easy', 'medium', 'hard']
const DIFFICULTY_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard / Master' }
const DIFFICULTY_COLOR = { easy: 'var(--color-correct)', medium: '#e0983d', hard: 'var(--color-incorrect)' }

export default function LessonList({ lessons, accent, progress, onSelectLesson }) {
  let globalNumber = 0

  return (
    <div>
      {DIFFICULTY_ORDER.map((tier) => {
        const tierLessons = lessons.filter((l) => l.difficulty === tier)
        if (tierLessons.length === 0) return null

        return (
          <div key={tier} className="mb-8">
            <div className="flex items-center gap-2 mb-3 px-1">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: DIFFICULTY_COLOR[tier] }}
              />
              <h3 className="text-sm font-display font-semibold text-text">
                {DIFFICULTY_LABEL[tier]}
              </h3>
              <span className="text-text-faint text-xs font-mono">{tierLessons.length}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 items-start">
              {tierLessons.map((lesson) => {
                globalNumber += 1
                return (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    number={globalNumber}
                    accent={accent}
                    progressEntry={progress?.[lesson.id]}
                    onClick={() => onSelectLesson(lesson)}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}