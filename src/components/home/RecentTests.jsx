import { getLanguage } from '../../content/languages'
import { ALL_LESSONS_BY_ID } from '../../content/allLessons'

export default function RecentTests({ attempts }) {
  if (attempts.length === 0) return null
  const recent = attempts.slice(0, 5)

  return (
    <div className="bg-panel border border-line rounded-xl p-5 shadow-[0_14px_34px_-26px_rgba(0,0,0,.9)]">
      <p className="text-[11px] font-mono uppercase tracking-widest text-text-faint mb-3">Recent Tests</p>
      <div className="space-y-2.5">
        {recent.map((a) => {
          const language = getLanguage(a.language)
          const title = ALL_LESSONS_BY_ID[a.lessonId]?.title || (a.language === 'english' ? `English (${a.difficulty})` : a.lessonId)
          return (
            <div key={a.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: language?.accent || 'var(--color-accent-purple)' }}
                />
                <span className="text-text-muted truncate font-mono text-xs">{title}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                <span className="text-correct">{a.wpm} wpm</span>
                <span className={a.accuracy < 90 ? 'text-incorrect' : 'text-text-faint'}>{a.accuracy}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
