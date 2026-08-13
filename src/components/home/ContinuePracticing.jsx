import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getLanguage } from '../../content/languages'
import { LESSONS_BY_LANGUAGE } from '../../content/allLessons'
import { getNextLesson } from '../../engine/lessonOrder'

export default function ContinuePracticing({ attempts }) {
  const navigate = useNavigate()
  const lastAttempt = attempts.find((attempt) => attempt.language !== 'english')
  if (!lastAttempt) return null

  const language = getLanguage(lastAttempt.language)
  const lessons = LESSONS_BY_LANGUAGE[lastAttempt.language] || []
  const lastLesson = lessons.find((lesson) => lesson.id === lastAttempt.lessonId)
  if (!language || !lastLesson) return null

  const nextLesson = getNextLesson(lessons, lastLesson.id)
  const target = nextLesson || lastLesson
  const lessonIndex = lessons.findIndex((lesson) => lesson.id === target.id) + 1
  const completionPct = lessons.length ? Math.round((lessonIndex / lessons.length) * 100) : 0

  return (
    <div className="bg-panel border border-line rounded-xl p-5 shadow-[0_14px_34px_-26px_rgba(0,0,0,.9)]">
      <p className="text-[11px] font-mono uppercase tracking-widest text-text-faint mb-3">Continue Practicing</p>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-display font-bold shrink-0" style={{ backgroundColor: `color-mix(in srgb, ${language.accent} 18%, transparent)`, color: language.accent }}>
          {language.shortCode}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-display font-semibold text-text truncate">{language.name} — {target.title}</div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-panel-raised">
            <div className="h-full rounded-full" style={{ width: `${completionPct}%`, backgroundColor: language.accent }} />
          </div>
          <div className="mt-1.5 text-[11px] font-mono text-text-faint">Lesson {lessonIndex} / {lessons.length}</div>
        </div>
      </div>
      <button onClick={() => navigate(`/${lastAttempt.language}/lesson/${target.id}`)} className="w-full flex items-center justify-center gap-1.5 text-sm font-semibold text-[#14151a] rounded-md py-2 transition-transform hover:scale-[1.02] active:scale-[0.98]" style={{ backgroundColor: language.accent }}>
        Resume <ArrowRight size={14} />
      </button>
    </div>
  )
}
