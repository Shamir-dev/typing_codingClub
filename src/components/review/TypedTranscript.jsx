import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

export default function TypedTranscript({ targetCode, typed, mistakes, open, onToggle }) {
  const [internalExpanded, setInternalExpanded] = useState(false)

  // Controlled if `open` is passed, otherwise falls back to its own state
  const expanded = open !== undefined ? open : internalExpanded
  const toggle = onToggle || (() => setInternalExpanded((v) => !v))

  const mistakesByIndex = new Map()
  for (const m of mistakes || []) {
    mistakesByIndex.set(m.index, m.got)
  }

  return (
    <section>
      <button
        onClick={toggle}
        className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-text-muted font-display font-medium hover:text-text transition-colors"
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        What You Typed
      </button>

      {expanded && (
        <div className="mt-3 bg-panel-raised border border-line rounded-md p-4 animate-pop-in">
          <pre className="font-mono text-sm leading-loose whitespace-pre-wrap break-words pb-2">
            {typed.split('').map((char, i) => {
              const expected = targetCode[i]
              const wasWrong = mistakesByIndex.has(i)
              const isCorrectNow = char === expected
              const display = char === ' ' ? '\u00A0' : char

              if (!wasWrong) {
                return <span key={i}>{display}</span>
              }

              const color = isCorrectNow ? 'text-[#e8b800]' : 'text-incorrect'

              return (
                <span key={i} className="relative inline-block">
                  <span className={`${color} underline decoration-2 underline-offset-4`}>{display}</span>
                  <span
                    className={`absolute left-0 top-full text-[9px] leading-none ${color}/70 whitespace-nowrap pointer-events-none`}
                  >
                    {mistakesByIndex.get(i) === ' ' ? '\u00A0' : mistakesByIndex.get(i)}
                  </span>
                </span>
              )
            })}
          </pre>
          <p className="text-[11px] text-text-faint mt-3">
            <span className="text-[#e8b800]">Yellow</span> = mistyped then corrected ·{' '}
            <span className="text-incorrect">Red</span> = mistyped and left uncorrected · small letter below = what you actually typed
          </p>
        </div>
      )}
    </section>
  )
}