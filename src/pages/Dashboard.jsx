import LessonList from '../components/dashboard/LessonList'
import ResultsLog from '../components/dashboard/ResultsLog'

export default function Dashboard({ language, lessons, progress, attempts, onSelectLesson }) {
  const completedCount = lessons.filter((l) => progress?.[l.id]?.completed).length
  const lessonsById = Object.fromEntries(lessons.map((l) => [l.id, l]))

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display font-semibold text-2xl text-text">{language.name}</h2>
          <span className="text-xs font-mono text-text-faint uppercase">
            {language.trackType === 'dsa' ? 'DSA track' : 'Practice track'}
          </span>
        </div>
        <p className="text-sm text-text-muted mt-1">
          {completedCount} / {lessons.length} lessons completed
        </p>
      </div>

      <ResultsLog attempts={attempts} lessonsById={lessonsById} accent={language.accent} />

      <LessonList
        lessons={lessons}
        accent={language.accent}
        progress={progress}
        onSelectLesson={onSelectLesson}
      />
    </div>
  )
}
