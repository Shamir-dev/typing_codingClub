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

function caretTextColor(color) {
  const hex = color.replace('#', '')
  if (hex.length !== 6) return '#ffffff'
  const red = Number.parseInt(hex.slice(0, 2), 16)
  const green = Number.parseInt(hex.slice(2, 4), 16)
  const blue = Number.parseInt(hex.slice(4, 6), 16)
  return red * 0.299 + green * 0.587 + blue * 0.114 > 150 ? '#111827' : '#ffffff'
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
  caretColor = '#38bdf8',
  wrap = false,
}) {
  const containerRef = useRef(null)
  const preRef = useRef(null)
  const currentElRef = useRef(null)
  const caretElRef = useRef(null)
  const targetCaretRef = useRef(null)
  const animatedCaretRef = useRef(null)
  const rafRef = useRef(null)
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
    function measureCaret() {
      if (!currentElRef.current || !preRef.current) return null
      const el = currentElRef.current
      const pre = preRef.current
      const charRect = el.getBoundingClientRect()
      const preRect = pre.getBoundingClientRect()
      return {
        left: charRect.left - preRect.left + pre.scrollLeft,
        top: charRect.top - preRect.top + pre.scrollTop,
        width: charRect.width || 2,
        height: charRect.height,
      }
    }

    const nextCaret = measureCaret()
    if (nextCaret) {
      targetCaretRef.current = nextCaret
      setCaret(nextCaret)

      // English-test prose mode only: keep the active line within a
      // fixed 3-line window, scrolling one line at a time as the caret
      // advances — same rolling effect as MonkeyType. The active line
      // sits at row 1 (the middle), not row 0, so the just-completed
      // line stays visible above it until the next line completes.
      // el.offsetHeight (this exact line's rendered height) is used
      // directly rather than a parsed computed-style line-height,
      // which was drifting slightly and clipping a line at the edge.
      if (wrap && preRef.current) {
        const lineHeight = nextCaret.height
        const lineIndex = Math.round(nextCaret.top / lineHeight)
        preRef.current.scrollTop = Math.max(0, lineIndex - 1) * lineHeight
      }
    } else {
      targetCaretRef.current = null
      setCaret(null)
    }
  }, [typed, targetCode, wrap])

  useEffect(() => {
    let rafId
    const ease = 0.35

    function animateCaret() {
      const target = targetCaretRef.current
      const element = caretElRef.current
      if (!target || !element) {
        rafRef.current = null
        return
      }

      if (!animatedCaretRef.current) {
        animatedCaretRef.current = { left: target.left, top: target.top }
      }

      const current = animatedCaretRef.current
      const dx = target.left - current.left
      const dy = target.top - current.top
      current.left += dx * ease
      current.top += dy * ease
      const underlineOffset = cursorStyle === 'underline' ? target.height - 2 : 0
      element.style.transform = `translate(${current.left}px, ${current.top + underlineOffset}px)`

      if (Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2) {
        rafId = requestAnimationFrame(animateCaret)
        rafRef.current = rafId
      } else {
        current.left = target.left
        current.top = target.top
        element.style.transform = `translate(${target.left}px, ${target.top + underlineOffset}px)`
        rafRef.current = null
      }
    }

    if (targetCaretRef.current && caretElRef.current) {
      if (!rafRef.current) rafId = requestAnimationFrame(animateCaret)
      rafRef.current = rafId
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      if (rafRef.current === rafId) rafRef.current = null
    }
  }, [caret, cursorStyle])

  // Re-measure on resize too — wrap mode reflows when the container
  // width changes, which shifts where the current character sits.
  useEffect(() => {
    function remeasure() {
      if (currentElRef.current && preRef.current) {
        const el = currentElRef.current
        const charRect = el.getBoundingClientRect()
        const preRect = preRef.current.getBoundingClientRect()
        const nextCaret = {
          left: charRect.left - preRect.left + preRef.current.scrollLeft,
          top: charRect.top - preRect.top + preRef.current.scrollTop,
          width: charRect.width || 2,
          height: charRect.height,
        }
        targetCaretRef.current = nextCaret
        setCaret(nextCaret)
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

    if (e.ctrlKey && e.key === 'Backspace') {
      e.preventDefault()
      onKeystroke('CtrlBackspace')
      playKeySound(soundMode, 'Backspace')
      return
    }

if (!isAltGr && (e.ctrlKey || e.altKey)) return
    if (isPaused) {
      e.preventDefault()
      onResume()
      return
    }
     if (typed.length >= targetCode.length) {
      if (e.key === 'Enter') {
        e.preventDefault()
        onKeystroke('\n')
        playKeySound(soundMode, '\n')
      } else {
        e.preventDefault()
      }
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
              const blockCurrent = isCurrent && cursorStyle === 'block'
              return (
                <span
                  key={ci}
                  ref={isCurrent ? setCurrentRef : null}
                  className={`${STATUS_CLASS[status]} ${blockCurrent ? 'relative z-10' : ''}`}
                  style={blockCurrent ? { color: caretTextColor(caretColor) } : undefined}
                >
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
    backgroundColor: caretColor,
    opacity: 1,
  }
  const caretClass = cursorStyle === 'block' ? 'bg-transparent rounded-[2px]' : 'bg-transparent rounded-full'

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
                ref={caretElRef}
                className={`typing-caret pointer-events-none absolute z-0 ${caretClass}`}
                style={{ ...caretStyle, left: 0, top: 0, transform: `translate(${caret.left}px, ${caret.top}px)` }}
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
              ref={caretElRef}
              className={`typing-caret pointer-events-none absolute z-0 ${caretClass}`}
              style={{ ...caretStyle, left: 0, top: 0, transform: `translate(${caret.left}px, ${caret.top}px)` }}
            />
          )}
          {renderLines()}
        </pre>
      )}
    </div>
  )
}
