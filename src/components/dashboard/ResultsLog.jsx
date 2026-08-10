import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatTime } from '../../engine/timing'
import { getLanguage } from '../../content/languages'

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50]

function formatDate(ms) {
  const d = new Date(ms)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

export default function ResultsLog({ attempts, lessonsById, accent, showLanguage = false }) {
  const [pageSize, setPageSize] = useState(15)
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(attempts.length / pageSize))
  const clampedPage = Math.min(page, totalPages)
  const pageItems = useMemo(() => {
    const start = (clampedPage - 1) * pageSize
    return attempts.slice(start, start + pageSize)
  }, [attempts, clampedPage, pageSize])

  if (attempts.length === 0) return null

  function goToPage(p) {
    setPage(Math.min(Math.max(1, p), totalPages))
  }

  // Small window of page numbers around the current page, so this
  // doesn't render 40 buttons once there's real history.
  const pageWindow = []
  for (let p = Math.max(1, clampedPage - 1); p <= Math.min(totalPages, clampedPage + 1); p++) {
    pageWindow.push(p)
  }

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
            {pageItems.map((a) => (
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

      <div className="px-4 py-2.5 border-t border-line flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5 text-text-faint">
          <span>show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
            className="bg-panel-raised border border-line rounded px-1.5 py-0.5 text-text-muted"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <span>per page</span>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(clampedPage - 1)}
              disabled={clampedPage === 1}
              className="p-1 rounded text-text-faint hover:text-text hover:bg-panel-raised disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft size={14} />
            </button>

            {pageWindow[0] > 1 && <span className="text-text-faint px-1">…</span>}
            {pageWindow.map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`w-6 h-6 rounded transition-colors ${
                  p === clampedPage ? 'bg-panel-raised text-text' : 'text-text-faint hover:text-text'
                }`}
              >
                {p}
              </button>
            ))}
            {pageWindow[pageWindow.length - 1] < totalPages && <span className="text-text-faint px-1">…</span>}

            <button
              onClick={() => goToPage(clampedPage + 1)}
              disabled={clampedPage === totalPages}
              className="p-1 rounded text-text-faint hover:text-text hover:bg-panel-raised disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}