import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getLanguage } from '../../content/languages'
import { LESSONS_BY_LANGUAGE } from '../../content/allLessons'
import { getNextLesson } from '../../engine/lessonOrder'

export default function ContinuePracticing({ attempts }) {
  const navigate = useNavigate()

  const lastAttempt = attempts.find((a) => a.language !== 'english')
  if (!lastAttempt) return null

  const language = getLanguage(lastAttempt.language)
  const lessons = LESSONS_BY_LANGUAGE[lastAttempt.language] || []
  const lastLesson = lessons.find((l) => l.id === lastAttempt.lessonId)
  if (!language || !lastLesson) return null

  const nextLesson = getNextLesson(lessons, lastLesson.id)
  const target = nextLesson || lastLesson
  const lessonIndex = lessons.findIndex((l) => l.id === target.id) + 1

  return (
    <div className="bg-panel border border-line rounded-2xl p-5">
      <p className="text-[11px] font-mono uppercase tracking-widest text-text-faint mb-3">Continue Practicing</p>
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-display font-bold shrink-0"
          style={{ backgroundColor: `color-mix(in srgb, ${language.accent} 18%, transparent)`, color: language.accent }}
        >
          {language.shortCode}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-display font-semibold text-text truncate">
            {language.name} — {target.title}
          </div>
          <div className="text-[11px] font-mono text-text-faint">
            Lesson {lessonIndex} / {lessons.length}
          </div>
        </div>
      </div>
      <button
        onClick={() => navigate(`/${lastAttempt.language}/lesson/${target.id}`)}
        className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-[#14151a] rounded-md py-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        style={{ backgroundColor: language.accent }}
      >
        Resume <ArrowRight size={14} />
      </button>
    </div>
  )
}