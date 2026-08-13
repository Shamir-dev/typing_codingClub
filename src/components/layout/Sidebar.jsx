import {
  Home, Keyboard, VolumeX, X, PanelLeftOpen, ListChecks, Type,
  Braces, FileCode2, Hash, Coffee, Cpu, Palette, Atom,
} from 'lucide-react'
import { LANGUAGES } from '../../content/languages'
import { AVAILABLE_LANGUAGE_IDS } from '../../content/allLessons'

const SOUND_MODES = [
  { id: 'off', label: 'off', icon: VolumeX },
  { id: 'mechanical', label: 'P.Corn', icon: Keyboard },
  { id: 'typewriter', label: 'T.Wr', icon: Keyboard },
  { id: 'recorded-mechanical', label: 'real', icon: Keyboard },
]

const CURSOR_STYLES = [
  { id: 'line', label: 'line', glyph: '│' },
  { id: 'block', label: 'block', glyph: '▉' },
  { id: 'underline', label: 'under', glyph: '_' },
]

// Small per-language icon, not just a color dot — gives the nav real
// hierarchy at a glance instead of a row of identical rows.
const LANGUAGE_ICONS = {
  javascript: Braces,
  python: FileCode2,
  cpp: Hash,
  java: Coffee,
  c: Cpu,
  html: FileCode2,
  css: Palette,
  react: Atom,
}

export default function Sidebar({
  activeLanguageId,
  onSelectLanguage,
  onGoHome,
  onGoResults,
  isResultsActive,
  onGoEnglish,
  isEnglishActive,
  theme,
  onToggleTheme,
  soundMode,
  onSetSoundMode,
  cursorStyle,
  onSetCursorStyle,
  collapsed,
  onToggleCollapsed,
}) {
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
    <aside className="app-sidebar w-[270px] shrink-0 border border-line bg-panel/90 h-full flex flex-col rounded-[22px] shadow-[0_14px_32px_-18px_rgba(15,23,42,0.9)] backdrop-blur-sm">
      <div className="px-5 py-3 border-b border-line flex items-center gap-2">
        <button
          onClick={onGoHome}
          className="flex-1 text-left hover:opacity-80 transition-opacity flex items-center gap-2.5"
        >
          <div className="w-11 h-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/logo.png" alt="Logo" className="max-w-full max-h-full object-contain" />
          </div>

          <div>
            <h1 className="font-display font-semibold text-[17px] tracking-tight text-text leading-none">
              ProCoder<span className="text-text-faint ">/Club</span>
            </h1>
            <p className="text-[12px] text-text-faint mt-1 tracking-wide">practice/learn/improve</p>
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

      <nav className="flex-1 overflow-y-auto py-3">
        <p className="px-5 text-[13px] font-semibold uppercase tracking-widest text-text-faint mb-2">Learn</p>
        {LANGUAGES.map((lang) => {
          const isAvailable = AVAILABLE_LANGUAGE_IDS.includes(lang.id)
          const isActive = lang.id === activeLanguageId
          return (
            <button
              key={lang.id}
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelectLanguage(lang.id)}
              style={isActive ? {
                borderColor: `color-mix(in srgb, ${lang.accent} 45%, transparent)`,
                backgroundColor: `color-mix(in srgb, ${lang.accent} 10%, transparent)`,
              } : undefined}
              className={`mx-3 w-[calc(100%-1.5rem)] flex items-center gap-3 px-3 py-2.5 text-left border rounded-lg transition-all duration-200
                ${isActive ? 'text-text font-bold shadow-[0_6px_18px_-10px_rgba(139,92,246,.7)]' : 'border-transparent text-text-muted hover:text-text hover:bg-panel-raised/60'}
                ${!isAvailable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="h-6 w-6 shrink-0 overflow-hidden rounded-md bg-panel-raised p-1">
                <img src={lang.iconUrl} alt={lang.name} className="h-full w-full object-contain" />
              </div>
              <span className="font-mono text-[15px] font-bold tracking-wide">{lang.name}</span>
              {!isAvailable && <span className="ml-auto text-[11px] text-text-faint font-medium">soon</span>}
            </button>
          )
        })}

        <p className="mx-5 pt-5 border-t border-line px-0 text-[13px] font-semibold uppercase tracking-widest text-text-faint mb-2 mt-5">Track</p>
        <button
          onClick={onGoResults}
          style={isResultsActive ? { borderColor: 'color-mix(in srgb, var(--color-accent-blue) 45%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-accent-blue) 10%, transparent)' } : undefined}
          className={`mx-3 w-[calc(100%-1.5rem)] flex items-center gap-3 px-3 py-2.5 text-[15px] text-left border rounded-lg transition-all duration-200
            ${isResultsActive ? 'text-text font-bold' : 'border-transparent text-text-muted hover:text-text hover:bg-panel-raised/60'}`}
        >
          <ListChecks size={15} className="shrink-0" style={isResultsActive ? { color: 'var(--color-accent-blue)' } : undefined} />
          <span className="font-mono font-bold">Test Results</span>
        </button>
        <button
          onClick={onGoEnglish}
          style={isEnglishActive ? { borderColor: 'color-mix(in srgb, var(--color-accent-purple) 45%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-accent-purple) 10%, transparent)' } : undefined}
          className={`mx-3 w-[calc(100%-1.5rem)] flex items-center gap-3 px-3 py-2.5 text-[15px] text-left border rounded-lg transition-all duration-200
            ${isEnglishActive ? 'text-text font-bold' : 'border-transparent text-text-muted hover:text-text hover:bg-panel-raised/60'}`}
        >
          <Type size={15} className="shrink-0" style={isEnglishActive ? { color: 'var(--color-accent-purple)' } : undefined} />
          <span className="font-mono font-bold">English Practice</span>
        </button>
      </nav>

      <div className="border-t border-line px-4 py-7 space-y-2">
        <button
          onClick={onToggleTheme}
          title="Toggle light / dark theme"
          className="w-full text-[11px] font-mono text-text-muted hover:text-text border border-line rounded-md py-1.5 transition-colors hover:border-text-faint"
        >
          {theme === 'dark' ? '🌙 dark theme' : '☀️ light theme'}
        </button>

        <div className="flex border border-line rounded-md overflow-hidden">
          {SOUND_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onSetSoundMode(mode.id)}
              title={mode.id === 'off' ? 'No sound' : mode.id === 'mechanical' ? 'Mechanical keyboard' : 'Typewriter'}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-mono transition-colors
                ${soundMode === mode.id ? 'bg-panel-raised text-text' : 'text-text-faint hover:text-text-muted'}`}
            >
              <mode.icon size={12} />
              {mode.label}
            </button>
          ))}
        </div>

        <div className="flex border border-line rounded-md overflow-hidden">
          {CURSOR_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => onSetCursorStyle(style.id)}
              title={`${style.label} cursor`}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] font-mono transition-colors
                ${cursorStyle === style.id ? 'bg-panel-raised text-text' : 'text-text-faint hover:text-text-muted'}`}
            >
              <span className="text-[12px]">{style.glyph}</span>
              {style.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
