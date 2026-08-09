import { useEffect, useState } from 'react'
import { Info } from 'lucide-react'
import TypingPane from '../components/typing/TypingPane'
import StatusBar from '../components/layout/StatusBar'
import { useTypingEngine } from '../engine/useTypingEngine'

const TIPS = [
  'Use Tab to auto-fill a full run of indentation spaces at once, instead of pressing space repeatedly.',
  'Focus on consistency and staying above 97% accuracy before chasing raw WPM — speed follows naturally once accuracy is solid.',
  'Struggling with a specific symbol set (like brackets or operators)? Practice it directly with a custom typing test once that feature is available.',
]

export default function LessonTyping({ lesson, accent, soundMode, onComplete, onBack }) {
  const engine = useTypingEngine(lesson.code)
  const [showTips, setShowTips] = useState(false)

  useEffect(() => {
    if (engine.isComplete) {
      onComplete({
        wpm: engine.wpm,
        accuracy: engine.accuracy,
        timeMs: engine.elapsedMs,
        mistakes: engine.mistakes,
        wpmHistory: engine.wpmHistory,
        keystrokeIntervals: engine.keystrokeIntervals,
        isPerfect: engine.isPerfect,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.isComplete])

  const progressPct = (engine.typed.length / lesson.code.length) * 100

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 pt-6 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="text-text-faint hover:text-text text-sm transition-colors">
          ← back
        </button>
        <h2 className="font-display font-medium text-text text-sm">{lesson.title}</h2>
        <div className="ml-auto relative flex items-center gap-2">
          
          <button
            onClick={engine.reset}
            className="text-xs font-mono text-text-faint hover:text-text border border-line rounded-md px-2.5 py-1 transition-colors hover:border-text-faint"
          >
            ↺ retry
          </button>
<button
            onClick={() => setShowTips((v) => !v)}
            title="Tips"
            className="text-text-faint hover:text-text border border-line rounded-md p-1.5 transition-colors hover:border-text-faint"
          >
            <Info size={14} />
          </button>
          {showTips && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-panel border border-line rounded-lg shadow-lg p-3 z-20 animate-pop-in">
              <p className="text-xs font-display font-semibold text-text mb-2">Tips</p>
              <ul className="space-y-2">
                {TIPS.map((tip, i) => (
                  <li key={i} className="text-xs text-text-muted leading-relaxed flex gap-1.5">
                    <span className="text-text-faint shrink-0">{i + 1}.</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 pb-3 max-w-2xl">
        <p className="text-sm text-text-muted leading-relaxed">{lesson.prompt}</p>
      </div>

      <div className="flex-1 px-8 overflow-auto">
        <TypingPane
          targetCode={lesson.code}
          typed={engine.typed}
          charStatuses={engine.charStatuses}
          isPaused={engine.isPaused}
          onKeystroke={engine.handleKeystroke}
          onResume={engine.resume}
          accent={accent}
          soundMode={soundMode}
        />
      </div>

      <StatusBar
        wpm={engine.wpm}
        accuracy={engine.accuracy}
        elapsedMs={engine.elapsedMs}
        targetTimeSec={lesson.timeTargetSec}
        accent={accent}
        progressPct={progressPct}
      />
    </div>
  )
}
