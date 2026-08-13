import { useMemo, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useSettings } from '../../hooks/useSettings'
import { useProgress } from '../../hooks/useProgress'
import { useAttemptsLog } from '../../hooks/useAttemptsLog'
import { AVAILABLE_LANGUAGE_IDS } from '../../content/allLessons'
import { Bell, Flame } from 'lucide-react'
import { formatStreakRange, getStreakSummary } from '../../engine/streaks'

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme, soundMode, setSoundMode, cursorStyle, setCursorStyle } = useSettings()
  const { progress, recordCompletion } = useProgress()
  const { attempts, attemptsForLanguage, logAttempt } = useAttemptsLog()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showStreaks, setShowStreaks] = useState(false)
  const streaks = useMemo(() => getStreakSummary(attempts), [attempts])

  const firstSegment = location.pathname.split('/')[1]
  const activeLanguageId = AVAILABLE_LANGUAGE_IDS.includes(firstSegment) ? firstSegment : null
  const isResultsActive = location.pathname === '/results'
  const isEnglishActive = location.pathname === '/english'

  return (
    <div className="h-screen w-screen bg-base text-text overflow-hidden p-3">
      <div className="h-full flex gap-3">
        <Sidebar
          activeLanguageId={activeLanguageId}
          onSelectLanguage={(id) => navigate(`/${id}`)}
          onGoHome={() => navigate('/')}
          onGoResults={() => navigate('/results')}
          isResultsActive={isResultsActive}
          onGoEnglish={() => navigate('/english')}
          isEnglishActive={isEnglishActive}
          theme={theme}
          onToggleTheme={toggleTheme}
          soundMode={soundMode}
          onSetSoundMode={setSoundMode}
          cursorStyle={cursorStyle}
          onSetCursorStyle={setCursorStyle}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
        />

        <main className="relative flex-1 h-full min-w-0 overflow-hidden rounded-[24px] border border-line bg-panel/30 backdrop-blur-sm">
          <div className="absolute right-5 top-4 z-20 flex items-center gap-3">
            <button
              onClick={() => setShowStreaks((value) => !value)}
              aria-expanded={showStreaks}
              className="hidden sm:flex items-center gap-2 rounded-xl border border-line bg-panel-raised/80 px-3 py-2 text-left shadow-sm hover:border-accent-purple/60 transition-colors"
            >
              <Flame size={22} className="text-orange-400 fill-orange-400/20" />
              <div className="leading-tight"><div className="text-sm font-semibold text-text">{streaks.current}</div><div className="text-[10px] text-text-faint">Day streak</div></div>
            </button>
            {showStreaks && (
              <div className="absolute right-0 top-[52px] z-30 w-72 rounded-xl border border-line bg-panel p-4 shadow-2xl animate-pop-in">
                <div className="mb-3 flex items-center justify-between"><span className="text-sm font-semibold text-text">Streak history</span><span className="text-xs font-mono text-orange-400">{streaks.current} days active</span></div>
                {streaks.longest.length ? <ol className="space-y-3">
                  {streaks.longest.map((streak, index) => <li key={`${streak.start.getTime()}-${streak.end.getTime()}`} className="flex items-start gap-3 text-xs">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-accent-purple/15 font-mono text-accent-purple">{index + 1}</span>
                    <div><p className="font-semibold text-text">{streak.days} day streak</p><p className="mt-0.5 text-text-faint">{formatStreakRange(streak.start, streak.end)}</p></div>
                  </li>)}
                </ol> : <p className="text-xs leading-relaxed text-text-muted">Complete a lesson or English test to start your first streak.</p>}
              </div>
            )}
            <button title="Notifications" className="relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-panel-raised/80 text-text-muted hover:text-text transition-colors">
              <Bell size={18} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent-purple" />
            </button>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-panel-raised text-sm font-semibold text-accent-purple">PC</div>
          </div>

          <div className="h-full overflow-hidden">
            <Outlet context={{ progress, recordCompletion, attempts, attemptsForLanguage, logAttempt, soundMode, cursorStyle }} />
          </div>
        </main>
      </div>
    </div>
  )
}
