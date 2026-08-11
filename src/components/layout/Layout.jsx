import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useSettings } from '../../hooks/useSettings'
import { useProgress } from '../../hooks/useProgress'
import { useAttemptsLog } from '../../hooks/useAttemptsLog'
import { AVAILABLE_LANGUAGE_IDS } from '../../content/allLessons'

export default function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme, soundMode, setSoundMode } = useSettings()
  const { progress, recordCompletion } = useProgress()
  const { attempts, attemptsForLanguage, logAttempt } = useAttemptsLog()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const firstSegment = location.pathname.split('/')[1]
  const activeLanguageId = AVAILABLE_LANGUAGE_IDS.includes(firstSegment) ? firstSegment : null
  const isResultsActive = location.pathname === '/results'

  return (
    <div className="h-screen w-screen flex bg-base text-text">
      <Sidebar
        activeLanguageId={activeLanguageId}
        onSelectLanguage={(id) => navigate(`/${id}`)}
        onGoHome={() => navigate('/')}
        onGoResults={() => navigate('/results')}
        isResultsActive={isResultsActive}
        theme={theme}
        onToggleTheme={toggleTheme}
        soundMode={soundMode}
        onSetSoundMode={setSoundMode}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
      />

      <main className="flex-1 h-full overflow-hidden flex flex-col">
        <Outlet context={{ progress, recordCompletion, attempts, attemptsForLanguage, logAttempt, soundMode }} />
      </main>
    </div>
  )
}