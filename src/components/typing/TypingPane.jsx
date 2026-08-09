import { useRef, useEffect } from 'react'
import Gutter from './Gutter'
import { CHAR_STATUS } from '../../engine/diff'
import { splitIntoLines, currentLineIndex } from '../../engine/lines'
import { playKeySound } from '../../engine/sound'

const STATUS_CLASS = {
  [CHAR_STATUS.CORRECT]: 'text-correct transition-colors duration-150',
  [CHAR_STATUS.INCORRECT]:
    'text-[var(--color-base)] bg-incorrect rounded-[2px] transition-colors duration-150',
  [CHAR_STATUS.PENDING]: 'text-text-muted',
}

export default function TypingPane({
  targetCode,
  typed,
  charStatuses,
  isPaused,
  onKeystroke,
  onResume,
  accent,
  soundMode,
}) {
  const containerRef = useRef(null)

  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  function handleKeyDown(e) {
    if (e.metaKey) return
    // AltGr (used to type symbols on many non-US keyboard layouts)
    // registers as ctrlKey + altKey held together. Only bail out for
    // a *real* Ctrl-only or Alt-only shortcut — otherwise AltGr-typed
    // characters get silently dropped and a lesson can never be
    // completed because that character position never matches.
    const isAltGr = e.ctrlKey && e.altKey
    if (!isAltGr && (e.ctrlKey || e.altKey)) return

    if (isPaused) {
      e.preventDefault()
      onResume()
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      onKeystroke('Tab')
      playKeySound(soundMode, 'Tab')
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      onKeystroke('\n')
      playKeySound(soundMode, '\n')
      return
    }
    if (e.key === 'Backspace') {
      e.preventDefault()
      onKeystroke('Backspace')
      playKeySound(soundMode, 'Backspace')
      return
    }
    if (e.key.length === 1) {
      e.preventDefault()
      onKeystroke(e.key)
      playKeySound(soundMode, e.key)
    }
  }

  const lines = splitIntoLines(targetCode, charStatuses)
  const activeLine = currentLineIndex(typed)

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative flex outline-none bg-panel rounded-md border border-line overflow-hidden transition-colors focus:border-[var(--pane-accent)] focus:shadow-[0_0_0_3px_var(--pane-accent-glow)]"
      style={{ '--pane-accent': accent, '--pane-accent-glow': `${accent}26` }}
    >
      {isPaused && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-base/80 backdrop-blur-[2px] animate-pop-in">
          <div className="text-center">
            <p className="text-text font-display font-medium text-sm">Paused — no typing detected</p>
            <p className="text-text-faint text-xs mt-1">press any key to resume</p>
          </div>
        </div>
      )}

      <div className="py-4">
        <Gutter lineCount={lines.length} currentLine={activeLine} />
      </div>
      <pre className="no-ligatures flex-1 py-4 pr-4 font-mono text-sm leading-6 overflow-x-auto whitespace-pre">
        {(() => {
          let charOffset = 0
          return lines.map((line, li) => {
            const lineStart = charOffset
            charOffset += line.chars.length + 1

            const trailingCaret =
              li === activeLine &&
              typed.length === lineStart + line.chars.length &&
              typed.length < targetCode.length

            return (
              <div key={li} className={li === activeLine ? 'bg-panel-raised/40 transition-colors' : ''}>
                {line.chars.length === 0 && !trailingCaret ? (
                  '\u00A0'
                ) : (
                  line.chars.map((char, ci) => {
                    const status = line.statuses[ci]
                    const isCurrent = status === CHAR_STATUS.CURRENT
                    return (
                      <span key={ci} className={`relative ${isCurrent ? 'text-text' : STATUS_CLASS[status]}`}>
                        {isCurrent && (
                          <span className="typing-caret absolute -left-px top-0 bottom-0 w-[2px] bg-cursor" />
                        )}
                        {char === ' ' ? '\u00A0' : char}
                      </span>
                    )
                  })
                )}
                {trailingCaret && (
                  <span className="typing-caret inline-block w-[2px] h-4 bg-cursor align-middle" />
                )}
              </div>
            )
          })
        })()}
      </pre>
    </div>
  )
}
