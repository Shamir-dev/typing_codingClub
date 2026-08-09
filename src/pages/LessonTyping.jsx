import { useEffect } from 'react'
import TypingPane from '../components/typing/TypingPane'
import StatusBar from '../components/layout/StatusBar'
import { useTypingEngine } from '../engine/useTypingEngine'

export default function LessonTyping({ lesson, accent, soundMode, onComplete, onBack }) {
  const engine = useTypingEngine(lesson.code)

  useEffect(() => {
    if (engine.isComplete) {
      onComplete({
        wpm: engine.wpm,
        accuracy: engine.accuracy,
        timeMs: engine.elapsedMs,
        mistakes: engine.mistakes,
        wpmHistory: engine.wpmHistory,
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
        <button
          onClick={engine.reset}
          className="ml-auto text-xs font-mono text-text-faint hover:text-text border border-line rounded-md px-2.5 py-1 transition-colors hover:border-text-faint"
        >
          ↺ retry
        </button>
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
