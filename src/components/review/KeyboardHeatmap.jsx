import { KEYBOARD_ROWS } from '../../content/keyboardLayout'

function heatClass(incorrect) {
  return incorrect > 0 ? 'bg-yellow-500/40 border-yellow-400/70' : 'bg-panel-raised border-line'
}

function keyLabel(key) {
  return key.label || key.base || key.id
}

export function getKeyboardKeyLabel(keyId) {
  const key = KEYBOARD_ROWS.flat().find((entry) => entry.id === keyId)
  return key ? keyLabel(key) : keyId
}

export default function KeyboardHeatmap({ data }) {
  return (
    <div className="overflow-x-auto pb-2" aria-label="Keyboard mistake heatmap">
      <div className="min-w-[680px] space-y-1">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1.5">
            {row.map((key) => {
              const counts = data[key.id] || { correct: 0, incorrect: 0 }
              const widthClass = key.wide === 'space' ? 'flex-[5]' : key.wide ? 'flex-[1.7]' : 'flex-1'
              return (
                <button
                  key={key.id}
                  type="button"
                  className={`group relative h-10 min-w-9 ${widthClass} rounded-lg border px-1.5 py-1 text-left transition-colors ${heatClass(counts.incorrect)}`}
                  aria-label={`${keyLabel(key)}. Correct: ${counts.correct}. Incorrect: ${counts.incorrect}.`}
                >
                  <span className="block text-[9px] leading-none text-text-faint">
                    {key.shifted || ''}
                  </span>
                  <span className="block text-center font-mono text-xs font-semibold text-text">
                    {key.label || key.base}
                  </span>
                  <span className={`pointer-events-none absolute left-1/2 z-20 hidden w-36 -translate-x-1/2 rounded-md border border-line bg-panel px-2.5 py-2 text-left text-[11px] text-text shadow-xl group-hover:block group-focus:block ${rowIndex === 0 ? 'top-full mt-2' : 'bottom-full mb-2'}`}>
                    <span className="block font-semibold">Key: {keyLabel(key)}</span>
                    <span className="block text-text-muted">Correct: {counts.correct}</span>
                    <span className="block text-text-muted">Incorrect: {counts.incorrect}</span>
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}