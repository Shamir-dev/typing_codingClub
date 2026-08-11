import { useOutletContext } from 'react-router-dom'
import ResultsLog from '../components/dashboard/ResultsLog'
import { ALL_LESSONS_BY_ID } from '../content/allLessons'

export default function TestResults() {
  const { attempts } = useOutletContext()

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="font-display font-semibold text-2xl text-text">Test Results</h2>
          <p className="text-sm text-text-muted mt-1">
            Every completed lesson across all languages, most recent first.
          </p>
        </div>

        <ResultsLog attempts={attempts} lessonsById={ALL_LESSONS_BY_ID} accent="var(--color-js)" showLanguage />
      </div>
    </div>
  )
}