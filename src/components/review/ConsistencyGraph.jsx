import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'

// Consistency = coefficient of variation of per-second RAW wpm samples
// (every keystroke, mistakes included) — this is the actual approach
// MonkeyType uses, not an approximation built on per-keystroke timing.
// Per-keystroke intervals are far noisier (much smaller time slices),
// which is why that version read unrealistically harsh. Short lessons
// still have fewer samples than a 30-60s MonkeyType test, so scores
// will naturally have more spread run-to-run — that's a real
// consequence of sample size, not a formula bug.
function consistencyScore(wpmHistory) {
  const samples = (wpmHistory || []).map((s) => s.raw).filter((v) => v > 0)
  if (samples.length < 3) return 100

  const mean = samples.reduce((a, b) => a + b, 0) / samples.length
  if (mean === 0) return 100
  const variance = samples.reduce((sum, v) => sum + (v - mean) ** 2, 0) / samples.length
  const stddev = Math.sqrt(variance)
  return Math.max(0, Math.round(100 - (stddev / mean) * 100))
}

export default function ConsistencyGraph({ wpmHistory, accent }) {
  if (!wpmHistory || wpmHistory.length < 2) return null

  const score = consistencyScore(wpmHistory)

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs uppercase tracking-wider text-text-muted font-display font-medium">
          Consistency
        </h3>
        <span className="text-xs font-mono text-text-faint">{score}% steady</span>
      </div>
      <div className="bg-panel border border-line rounded-md h-40 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={wpmHistory} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" />
            <XAxis
              dataKey="t"
              tick={{ fontSize: 10, fill: 'var(--color-text-faint)' }}
              tickFormatter={(v) => `${v}s`}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-faint)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-panel)',
                border: '1px solid var(--color-line)',
                borderRadius: 6,
                fontSize: 12,
              }}
              labelFormatter={(v) => `${v}s`}
              formatter={(value, name) => [`${value} wpm`, name]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {/* Raw = every keystroke including mistakes, jagged like MonkeyType's grey line */}
            <Line type="monotone" dataKey="raw" name="raw" stroke="var(--color-text-faint)" strokeWidth={1.5} dot={false} />
            {/* Actual = correct characters only, the smoother accent-colored line */}
            <Line type="monotone" dataKey="actual" name="actual" stroke={accent} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
