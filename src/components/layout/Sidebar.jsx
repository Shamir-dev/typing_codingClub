import {
  Home, Keyboard, VolumeX, X, PanelLeftOpen, ListChecks, Type,
  Braces, FileCode2, Hash, Coffee, Cpu, Palette, Atom,
} from 'lucide-react'
import { LANGUAGES } from '../../content/languages'
import { AVAILABLE_LANGUAGE_IDS } from '../../content/allLessons'

const SOUND_MODES = [
  { id: 'off', label: 'off', icon: VolumeX },
  { id: 'mechanical', label: 'key', icon: Keyboard },
  { id: 'typewriter', label: 'type', icon: Keyboard },
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
    <aside className="w-60 shrink-0 border-r border-line bg-panel h-full flex flex-col">
      <div className="px-4 py-4 border-b border-line flex items-center gap-2">
        <button
          onClick={onGoHome}
          className="flex-1 text-left hover:opacity-80 transition-opacity flex items-center gap-2.5"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-display font-bold text-xs text-white"
            style={{ background: 'linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-purple))' }}
          >
            P
          </div>
          <div>
            <h1 className="font-display font-semibold text-sm tracking-tight text-text leading-none">
              ProCoder<span className="text-text-faint">/club</span>
            </h1>
            <p className="text-[10px] text-text-faint mt-1 tracking-wide">practice / learn / improve</p>
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
        <p className="px-4 text-[10px] font-mono uppercase tracking-widest text-text-faint mb-1.5">Learn</p>
        {LANGUAGES.map((lang) => {
          const isAvailable = AVAILABLE_LANGUAGE_IDS.includes(lang.id)
          const isActive = lang.id === activeLanguageId
          const Icon = LANGUAGE_ICONS[lang.id] || FileCode2
          return (
            <button
              key={lang.id}
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelectLanguage(lang.id)}
              style={isActive ? {
                borderColor: `color-mix(in srgb, ${lang.accent} 45%, transparent)`,
                backgroundColor: `color-mix(in srgb, ${lang.accent} 10%, transparent)`,
              } : undefined}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left border-l-2 transition-all duration-200
                ${isActive ? 'text-text font-medium' : 'border-transparent text-text-muted hover:text-text hover:bg-panel-raised/60'}
                ${!isAvailable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <Icon size={14} style={{ color: isActive ? lang.accent : undefined }} className="shrink-0" />
              <span className="font-mono">{lang.name}</span>
              {!isAvailable && <span className="ml-auto text-[10px] text-text-faint">soon</span>}
            </button>
          )
        })}

        <p className="px-4 text-[10px] font-mono uppercase tracking-widest text-text-faint mb-1.5 mt-5">Track</p>
        <button
          onClick={onGoResults}
          style={isResultsActive ? { borderColor: 'color-mix(in srgb, var(--color-accent-blue) 45%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-accent-blue) 10%, transparent)' } : undefined}
          className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left border-l-2 transition-all duration-200
            ${isResultsActive ? 'text-text font-medium' : 'border-transparent text-text-muted hover:text-text hover:bg-panel-raised/60'}`}
        >
          <ListChecks size={14} className="shrink-0" style={isResultsActive ? { color: 'var(--color-accent-blue)' } : undefined} />
          <span className="font-mono">Test Results</span>
        </button>
        <button
          onClick={onGoEnglish}
          style={isEnglishActive ? { borderColor: 'color-mix(in srgb, var(--color-accent-purple) 45%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-accent-purple) 10%, transparent)' } : undefined}
          className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left border-l-2 transition-all duration-200
            ${isEnglishActive ? 'text-text font-medium' : 'border-transparent text-text-muted hover:text-text hover:bg-panel-raised/60'}`}
        >
          <Type size={14} className="shrink-0" style={isEnglishActive ? { color: 'var(--color-accent-purple)' } : undefined} />
          <span className="font-mono">English Practice</span>
        </button>
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

        <div className="flex border border-line rounded-md overflow-hidden">
          {CURSOR_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => onSetCursorStyle(style.id)}
              title={`${style.label} cursor`}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-mono transition-colors
                ${cursorStyle === style.id ? 'bg-panel-raised text-text' : 'text-text-faint hover:text-text-muted'}`}
            >
              <span className="text-[11px]">{style.glyph}</span>
              {style.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}