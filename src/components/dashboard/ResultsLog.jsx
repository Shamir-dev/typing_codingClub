import { formatTime } from '../../engine/timing'
import { getLanguage } from '../../content/languages'

function formatDate(ms) {
  const d = new Date(ms)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export default function ResultsLog({ attempts, lessonsById, accent, limit = 10, showLanguage = false }) {
  if (attempts.length === 0) return null

  const recent = attempts.slice(0, limit)

  return (
    <div className="mb-8 bg-panel border border-line rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-line flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
        <h3 className="text-sm font-display font-semibold text-text">Recent results</h3>
        <span className="text-xs font-mono text-text-faint ml-auto">{attempts.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-text-faint font-mono uppercase tracking-wide text-left">
              <th className="px-4 py-2 font-medium">Lesson</th>
              {showLanguage && <th className="px-4 py-2 font-medium">Language</th>}
              <th className="px-4 py-2 font-medium">Difficulty</th>
              <th className="px-4 py-2 font-medium">WPM</th>
              <th className="px-4 py-2 font-medium">Accuracy</th>
              <th className="px-4 py-2 font-medium">Consistency</th>
              <th className="px-4 py-2 font-medium">Time</th>
              <th className="px-4 py-2 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((a) => (
              <tr key={a.id} className="border-t border-line hover:bg-panel-raised/50 transition-colors">
                <td className="px-4 py-2 text-text font-medium">
                  {lessonsById[a.lessonId]?.title || a.lessonId}
                </td>
                {showLanguage && (
                  <td className="px-4 py-2 text-text-muted capitalize">
                    {getLanguage(a.language)?.name || a.language}
                  </td>
                )}
                <td className="px-4 py-2 text-text-muted capitalize">{a.difficulty}</td>
                <td className="px-4 py-2 text-correct font-mono">{a.wpm}</td>
                <td className={`px-4 py-2 font-mono ${a.accuracy < 90 ? 'text-incorrect' : 'text-text-muted'}`}>
                  {a.accuracy}%
                </td>
                <td className="px-4 py-2 text-text-muted font-mono">
                  {a.consistency !== undefined ? `${a.consistency}%` : '—'}
                </td>
                <td className="px-4 py-2 text-text-muted font-mono">{formatTime(a.timeMs)}</td>
                <td className="px-4 py-2 text-text-faint font-mono">{formatDate(a.completedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}