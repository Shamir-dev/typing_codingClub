import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import { consistencyScore } from '../../engine/consistency'

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
            <Line type="natural" dataKey="raw" name="raw" stroke="var(--color-text-faint)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" dot={false} />
            {/* Actual = correct characters only, the smoother accent-colored line */}
            <Line type="natural" dataKey="actual" name="actual" stroke={accent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}