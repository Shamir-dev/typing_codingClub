import { Lock, ArrowRight } from 'lucide-react'

export default function LanguageCard({ lang, isAvailable, lessonCount, progressPct, onClick, delayMs }) {
  return (
    <button
      onClick={() => isAvailable && onClick()}
      disabled={!isAvailable}
      style={{
        animationDelay: `${delayMs}ms`,
        borderColor: isAvailable ? `color-mix(in srgb, ${lang.accent} 35%, var(--color-line))` : undefined,
      }}
      className={`card-lift group relative bg-panel border rounded-2xl p-5 flex flex-col gap-3 text-left animate-pop-in
        ${!isAvailable ? 'opacity-50 cursor-not-allowed border-line' : 'cursor-pointer'}`}
    >
      {!isAvailable && (
        <span className="absolute top-4 right-4 text-text-faint">
          <Lock size={14} />
        </span>
      )}

      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-display font-bold shrink-0"
          style={{ backgroundColor: `color-mix(in srgb, ${lang.accent} 18%, transparent)`, color: lang.accent }}
        >
          {lang.shortCode}
        </div>
        <div>
          <div className="text-sm font-display font-semibold text-text">{lang.name}</div>
          <div className="text-[11px] font-mono text-text-faint">
            {isAvailable ? `${lessonCount} lessons` : 'coming soon'}
          </div>
        </div>
      </div>

      {isAvailable && (
        <>
          <div className="h-1.5 rounded-full bg-panel-raised overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%`, backgroundColor: lang.accent }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-text-faint">{progressPct}%</span>
            <span className="text-xs font-mono text-text-muted flex items-center gap-1 group-hover:gap-1.5 group-hover:text-text transition-all">
              Continue <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </>
      )}
    </button>
  )
}