import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import LessonList from '../components/dashboard/LessonList'
import ResultsLog from '../components/dashboard/ResultsLog'

export default function Dashboard({ language, lessons, progress, attempts, onSelectLesson }) {
  const [showResults, setShowResults] = useState(false)
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

      {attempts.length > 0 && (
        <div className="mb-8">
          <button
            onClick={() => setShowResults((v) => !v)}
            className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-text-muted font-display font-medium hover:text-text transition-colors mb-3"
          >
            {showResults ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            View Test Results
          </button>

          {showResults && (
            <div className="animate-pop-in">
              <ResultsLog attempts={attempts} lessonsById={lessonsById} accent={language.accent} />
            </div>
          )}
        </div>
      )}

      <LessonList
        lessons={lessons}
        accent={language.accent}
        progress={progress}
        onSelectLesson={onSelectLesson}
      />
    </div>
  )
}