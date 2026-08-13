import { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react'
import Gutter from './Gutter'
import { CHAR_STATUS } from '../../engine/diff'
import { splitIntoLines, currentLineIndex } from '../../engine/lines'
import { playKeySound } from '../../engine/sound'

const STATUS_CLASS = {
  [CHAR_STATUS.CORRECT]: 'text-correct transition-colors duration-150',
  [CHAR_STATUS.INCORRECT]:
    'text-[var(--color-base)] bg-incorrect rounded-[2px] transition-colors duration-150',
  [CHAR_STATUS.PENDING]: 'text-text-muted',
  [CHAR_STATUS.CURRENT]: 'text-text',
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
  cursorStyle = 'line',
  wrap = false,
}) {
  const containerRef = useRef(null)
  const preRef = useRef(null)
  const currentElRef = useRef(null)
  const [caret, setCaret] = useState(null)

  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  // Single overlay caret, measured off whichever span is currently
  // "current" via offsetLeft/offsetTop (relative to the position:relative
  // <pre>, so it scrolls naturally with the content). Re-measuring on
  // every typed-position change and letting CSS transition the resulting
  // left/top/width/height is what makes movement slide instead of jump —
  // the old approach mounted a brand new caret element per character,
  // which can only ever teleport.
  useLayoutEffect(() => {
    if (currentElRef.current) {
      const el = currentElRef.current
      setCaret({ left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth || 2, height: el.offsetHeight })

      // English-test prose mode only: keep the active line within a
      // fixed 3-line window, scrolling one line at a time as the caret
      // advances — same rolling effect as MonkeyType. The active line
      // sits at row 1 (the middle), not row 0, so the just-completed
      // line stays visible above it until the next line completes.
      // el.offsetHeight (this exact line's rendered height) is used
      // directly rather than a parsed computed-style line-height,
      // which was drifting slightly and clipping a line at the edge.
      if (wrap && preRef.current) {
        const lineHeight = el.offsetHeight
        const lineIndex = Math.round(el.offsetTop / lineHeight)
        preRef.current.scrollTop = Math.max(0, lineIndex - 1) * lineHeight
      }
    } else {
      setCaret(null)
    }
  }, [typed, targetCode, wrap])

  // Re-measure on resize too — wrap mode reflows when the container
  // width changes, which shifts where the current character sits.
  useEffect(() => {
    function remeasure() {
      if (currentElRef.current) {
        const el = currentElRef.current
        setCaret({ left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth || 2, height: el.offsetHeight })
      }
    }
    window.addEventListener('resize', remeasure)
    return () => window.removeEventListener('resize', remeasure)
  }, [])

  const setCurrentRef = useCallback((el) => {
    currentElRef.current = el
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

  function renderLines() {
    let charOffset = 0
    return lines.map((line, li) => {
      const lineStart = charOffset
      charOffset += line.chars.length + 1

      const trailingCaret =
        li === activeLine &&
        typed.length === lineStart + line.chars.length &&
        typed.length < targetCode.length

      return (
        <div key={li} className={!wrap && li === activeLine ? 'bg-panel-raised/40 transition-colors' : ''}>
          {line.chars.length === 0 && !trailingCaret ? (
            '\u00A0'
          ) : (
            line.chars.map((char, ci) => {
              const status = line.statuses[ci]
              const isCurrent = status === CHAR_STATUS.CURRENT
              const displayChar = char === ' ' ? (wrap ? ' ' : '\u00A0') : char
              return (
                <span key={ci} ref={isCurrent ? setCurrentRef : null} className={STATUS_CLASS[status]}>
                  {displayChar}
                </span>
              )
            })
          )}
          {trailingCaret && (
            <span ref={setCurrentRef} className="inline-block w-[1px]">
              {'\u00A0'}
            </span>
          )}
        </div>
      )
    })
  }

  const caretStyle = caret && {
    left: caret.left,
    top: cursorStyle === 'underline' ? caret.top + caret.height - 2 : caret.top,
    width: cursorStyle === 'underline' ? caret.width : cursorStyle === 'block' ? caret.width : wrap ? 3 : 2,
    height: cursorStyle === 'underline' ? 2 : caret.height,
    backgroundColor: wrap && cursorStyle !== 'block' ? '#ffd60a' : undefined,
  }
  const caretClass =
    cursorStyle === 'block'
      ? wrap
        ? 'bg-[#ffd60a]/35 rounded-[2px]'
        : 'bg-cursor/35 rounded-[2px]'
      : cursorStyle === 'underline'
      ? wrap
        ? 'bg-[#ffd60a] rounded-full'
        : 'bg-cursor rounded-full'
      : wrap
      ? 'rounded-full'
      : 'bg-cursor'

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative flex outline-none bg-panel rounded-xl border border-line overflow-hidden shadow-[0_16px_45px_-28px_rgba(0,0,0,.9)] transition-colors focus:border-[var(--pane-accent)] focus:shadow-[0_0_0_3px_var(--pane-accent-glow)]"
      style={{ '--pane-accent': accent, '--pane-accent-glow': `color-mix(in srgb, ${accent} 15%, transparent)` }}
    >
      {isPaused && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-base/80 backdrop-blur-[2px] animate-pop-in">
          <div className="text-center">
            <p className="text-text font-display font-medium text-sm">Paused — no typing detected</p>
            <p className="text-text-faint text-xs mt-1">press any key to resume</p>
          </div>
        </div>
      )}

      {!wrap && (
        <div className="py-4">
          <Gutter lineCount={lines.length} currentLine={activeLine} />
        </div>
      )}
      {wrap ? (
        <div className="flex-1 overflow-hidden h-[135px] my-4">
          <pre
            ref={preRef}
            className="no-ligatures relative font-mono text-xl leading-10 px-2 whitespace-pre-wrap break-words h-full overflow-hidden"
          >
            {caret && (
              <div
                className={`pointer-events-none absolute transition-[left,top,width,height] duration-100 ease-out ${caretClass}`}
                style={caretStyle}
              />
            )}
            {renderLines()}
          </pre>
        </div>
      ) : (
        <pre
          ref={preRef}
          className="no-ligatures relative flex-1 py-5 pr-5 font-mono text-base leading-7 overflow-x-auto whitespace-pre"
        >
          {caret && (
            <div
              className={`pointer-events-none absolute transition-[left,top,width,height] duration-100 ease-out ${caretClass}`}
              style={caretStyle}
            />
          )}
          {renderLines()}
        </pre>
      )}
    </div>
  )
}
