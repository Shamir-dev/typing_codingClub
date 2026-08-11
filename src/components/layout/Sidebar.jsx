import { Home, Keyboard, VolumeX, X, PanelLeftOpen, ListChecks } from 'lucide-react'
import { LANGUAGES } from '../../content/languages'
import { AVAILABLE_LANGUAGE_IDS } from '../../content/allLessons'

const SOUND_MODES = [
  { id: 'off', label: 'off', icon: VolumeX },
  { id: 'mechanical', label: 'key', icon: Keyboard },
  { id: 'typewriter', label: 'type', icon: Keyboard },
]

export default function Sidebar({
  activeLanguageId,
  onSelectLanguage,
  onGoHome,
  onGoResults,
  isResultsActive,
  theme,
  onToggleTheme,
  soundMode,
  onSetSoundMode,
  collapsed,
  onToggleCollapsed,
}) {
  // Collapsed: render a slim rail with just a reopen button, instead of
  // unmounting the sidebar — keeps the toggle reachable regardless of
  // screen size, same pattern as the DevInsights sidebar.
  if (collapsed) {
    return (
      <div className="w-10 shrink-0 border-r border-line bg-panel h-full flex flex-col items-center pt-4">
        <button
          onClick={onToggleCollapsed}
          title="Show sidebar"
          className="text-text-faint hover:text-text p-1.5 rounded-md hover:bg-panel-raised transition-colors"
        >
          <PanelLeftOpen size={16} />
        </button>
      </div>
    )
  }

  return (
    <aside className="w-56 shrink-0 border-r border-line bg-panel h-full flex flex-col">
      <div className="px-4 py-4 border-b border-line flex items-center gap-2">
        <button
          onClick={onGoHome}
          className="flex-1 text-left hover:opacity-70 transition-opacity flex items-center gap-2"
        >
          <Home size={16} className="text-text-faint" />
          <div>
            <h1 className="font-display font-semibold text-sm tracking-wide text-text">
              typing<span className="text-text-faint">/</span>club
            </h1>
            <p className="text-[11px] text-text-faint">code typing practice</p>
          </div>
        </button>
        <button
          onClick={onToggleCollapsed}
          title="Collapse sidebar"
          className="text-text-faint hover:text-text p-1 rounded-md hover:bg-panel-raised transition-colors shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {LANGUAGES.map((lang) => {
          const isAvailable = AVAILABLE_LANGUAGE_IDS.includes(lang.id)
          const isActive = lang.id === activeLanguageId
          return (
            <button
              key={lang.id}
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelectLanguage(lang.id)}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition-all duration-150
                ${isActive ? 'bg-panel-raised text-text' : 'text-text-muted hover:text-text hover:bg-panel-raised/50'}
                ${!isAvailable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:pl-5'}`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'animate-soft-pulse' : ''}`}
                style={{ backgroundColor: lang.accent }}
              />
              <span className="font-mono">{lang.name}</span>
              {!isAvailable && (
                <span className="ml-auto text-[10px] text-text-faint">soon</span>
              )}
            </button>
          )
        })}

        <div className="mt-2 pt-2 border-t border-line mx-2">
          <button
            onClick={onGoResults}
            className={`w-full flex items-center gap-2.5 px-2 py-2 text-sm text-left rounded-md transition-all duration-150
              ${isResultsActive ? 'bg-panel-raised text-text' : 'text-text-muted hover:text-text hover:bg-panel-raised/50'}`}
          >
            <ListChecks size={14} className="shrink-0" />
            <span className="font-mono">Test Results</span>
          </button>
        </div>
      </nav>

      <div className="border-t border-line px-4 py-3 space-y-2">
        <button
          onClick={onToggleTheme}
          title="Toggle light / dark theme"
          className="w-full text-xs font-mono text-text-muted hover:text-text border border-line rounded-md py-1.5 transition-colors hover:border-text-faint"
        >
          {theme === 'dark' ? '🌙 dark theme' : '☀️ light theme'}
        </button>

        <div className="flex border border-line rounded-md overflow-hidden">
          {SOUND_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onSetSoundMode(mode.id)}
              title={mode.id === 'off' ? 'No sound' : mode.id === 'mechanical' ? 'Mechanical keyboard' : 'Typewriter'}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-mono transition-colors
                ${soundMode === mode.id ? 'bg-panel-raised text-text' : 'text-text-faint hover:text-text-muted'}`}
            >
              <mode.icon size={12} />
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}