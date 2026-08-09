import { Home, Keyboard, VolumeX } from 'lucide-react'
import { LANGUAGES } from '../../content/languages'

const SOUND_MODES = [
  { id: 'off', label: 'off', icon: VolumeX },
  { id: 'mechanical', label: 'key', icon: Keyboard },
  { id: 'typewriter', label: 'type', icon: Keyboard },
]

export default function Sidebar({
  activeLanguageId,
  onSelectLanguage,
  onGoHome,
  theme,
  onToggleTheme,
  soundMode,
  onSetSoundMode,
}) {
  return (
    <aside className="w-56 shrink-0 border-r border-line bg-panel h-full flex flex-col">
      <button
        onClick={onGoHome}
        className="px-4 py-4 border-b border-line text-left hover:bg-panel-raised/50 transition-colors flex items-center gap-2"
      >
        <Home size={16} className="text-text-faint" />
        <div>
          <h1 className="font-display font-semibold text-sm tracking-wide text-text">
            typing<span className="text-text-faint">/</span>club
          </h1>
          <p className="text-[11px] text-text-faint">code typing practice</p>
        </div>
      </button>

      <nav className="flex-1 overflow-y-auto py-2">
        {LANGUAGES.map((lang) => {
          const isActive = lang.id === activeLanguageId
          return (
            <button
              key={lang.id}
              disabled={!lang.available}
              onClick={() => lang.available && onSelectLanguage(lang.id)}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition-all duration-150
                ${isActive ? 'bg-panel-raised text-text' : 'text-text-muted hover:text-text hover:bg-panel-raised/50'}
                ${!lang.available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:pl-5'}`}
            >
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'animate-soft-pulse' : ''}`}
                style={{ backgroundColor: lang.accent }}
              />
              <span className="font-mono">{lang.name}</span>
              {!lang.available && (
                <span className="ml-auto text-[10px] text-text-faint">soon</span>
              )}
            </button>
          )
        })}
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
