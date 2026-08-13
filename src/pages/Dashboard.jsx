import { useState } from 'react'
import { useParams, useNavigate, useOutletContext, Navigate } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import LessonList from '../components/dashboard/LessonList'
import ResultsLog from '../components/dashboard/ResultsLog'
import { getLanguage } from '../content/languages'
import { LESSONS_BY_LANGUAGE, AVAILABLE_LANGUAGE_IDS } from '../content/allLessons'

export default function Dashboard() {
  const { languageId } = useParams()
  const navigate = useNavigate()
  const { progress, attemptsForLanguage, blindAttemptsForLanguage } = useOutletContext()
  const [showResults, setShowResults] = useState(false)
  const [showBlindResults, setShowBlindResults] = useState(false)

  if (!AVAILABLE_LANGUAGE_IDS.includes(languageId)) {
    return <Navigate to="/" replace />
  }

  const language = getLanguage(languageId)
  const lessons = LESSONS_BY_LANGUAGE[languageId] || []
  const attempts = attemptsForLanguage(languageId)
  const blindAttempts = blindAttemptsForLanguage(languageId)
  const completedCount = lessons.filter((l) => progress?.[l.id]?.completed).length
  const lessonsById = Object.fromEntries(lessons.map((l) => [l.id, l]))

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-5 py-6 sm:px-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-baseline gap-3">
          <h2 className="font-display font-semibold text-3xl text-text">{language.name}</h2>
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

        {blindAttempts.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setShowBlindResults((v) => !v)}
              className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-text-muted font-display font-medium hover:text-text transition-colors mb-3"
            >
              {showBlindResults ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              View Blind Test Results
            </button>

            {showBlindResults && (
              <div className="animate-pop-in">
                <ResultsLog attempts={blindAttempts} lessonsById={lessonsById} accent={language.accent} />
              </div>
            )}
          </div>
        )}

        <LessonList
          lessons={lessons}
          accent={language.accent}
          progress={progress}
          onSelectLesson={(lesson) => navigate(`/${languageId}/lesson/${lesson.id}`)}
        />
      </div>
    </div>
  )
}
