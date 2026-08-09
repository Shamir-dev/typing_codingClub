import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

// Consistency score: a rough approximation of MonkeyType's — how
// steady the WPM stayed across the session, not an exact match of
// their algorithm. 100 - (relative variation), floored at 0.
function consistencyScore(samples) {
  if (samples.length < 2) return 100
  const values = samples.map((s) => s.wpm)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  if (mean === 0) return 100
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
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
      <div className="bg-panel border border-line rounded-md h-32 p-2">
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
              formatter={(value) => [`${value} wpm`, 'speed']}
            />
            <Line type="monotone" dataKey="wpm" stroke={accent} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
