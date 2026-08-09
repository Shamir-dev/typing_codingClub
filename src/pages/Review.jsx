import ReviewPanel from '../components/review/ReviewPanel'

export default function Review({ lesson, result, accent, onRetry, onBack }) {
  return (
    <div className="p-8">
      <ReviewPanel
        lesson={lesson}
        wpm={result.wpm}
        accuracy={result.accuracy}
        timeMs={result.timeMs}
        mistakes={result.mistakes}
        wpmHistory={result.wpmHistory}
        accent={accent}
        onRetry={onRetry}
        onBack={onBack}
      />
    </div>
  )
}
