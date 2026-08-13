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
      className={`card-lift group relative bg-panel border rounded-xl p-4 flex flex-col gap-3 text-left animate-pop-in
        ${!isAvailable ? 'opacity-50 cursor-not-allowed border-line' : 'cursor-pointer'}`}
    >
      {!isAvailable && (
        <span className="absolute top-4 right-4 text-text-faint">
          <Lock size={14} />
        </span>
      )}

      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line bg-panel-raised p-2">
          <img src={lang.iconUrl} alt={lang.name} className="h-full w-full object-contain" />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-display font-bold text-text">{lang.name}</div>
          <div className="text-[12px] font-mono text-text-faint">
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
            <span className="text-[12px] font-mono text-text-faint">{progressPct}%</span>
            <span
              className="text-[13px] font-mono font-medium flex items-center gap-1 group-hover:gap-1.5 transition-all"
              style={{ color: lang.accent }}
            >
              Continue <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </>
      )}
    </button>
  )
}
