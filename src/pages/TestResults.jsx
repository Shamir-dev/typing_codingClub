import ResultsLog from '../components/dashboard/ResultsLog'

export default function TestResults({ attempts, lessonsById }) {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="font-display font-semibold text-2xl text-text">Test Results</h2>
        <p className="text-sm text-text-muted mt-1">
          Every completed lesson across all languages, most recent first.
        </p>
      </div>

      <ResultsLog attempts={attempts} lessonsById={lessonsById} accent="var(--color-js)" showLanguage />
    </div>
  )
}