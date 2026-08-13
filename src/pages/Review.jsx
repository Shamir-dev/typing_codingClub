import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom'
import ReviewPanel from '../components/review/ReviewPanel'
import { getLanguage } from '../content/languages'
import { LESSONS_BY_LANGUAGE } from '../content/allLessons'
import { getNextLesson, getPreviousLesson } from '../engine/lessonOrder'

export default function Review() {
  const { languageId, lessonId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const result = location.state

  const lessons = LESSONS_BY_LANGUAGE[languageId] || []
  const lesson = lessons.find((l) => l.id === lessonId)
  const language = getLanguage(languageId)

  // Result only exists as router state from the completion navigation —
  // a direct load/refresh of this URL won't have it. Send back to the
  // lesson itself rather than showing a broken results screen.
  if (!lesson || !language || !result) {
    return <Navigate to={`/${languageId}/lesson/${lessonId}`} replace />
  }

  const nextLesson = getNextLesson(lessons, lesson.id)
  const previousLesson = getPreviousLesson(lessons, lesson.id)

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-5 py-6 sm:px-8 max-w-5xl mx-auto">
        <ReviewPanel
          lesson={lesson}
          wpm={result.wpm}
          accuracy={result.accuracy}
          timeMs={result.timeMs}
          mistakes={result.mistakes}
          typed={result.typed}
          targetCode={lesson.code}
          wpmHistory={result.wpmHistory}
          keystrokeIntervals={result.keystrokeIntervals}
          accent={language.accent}
          nextLesson={nextLesson}
          previousLesson={previousLesson}
          onRetry={() => navigate(`/${languageId}/lesson/${lesson.id}`)}
          onNext={() => nextLesson && navigate(`/${languageId}/lesson/${nextLesson.id}`)}
          onPrevious={() => previousLesson && navigate(`/${languageId}/lesson/${previousLesson.id}`)}
          onBack={() => navigate(`/${languageId}`)}
        />
      </div>
    </div>
  )
}
