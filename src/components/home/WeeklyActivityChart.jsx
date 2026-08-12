import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Buckets real attempts (any language, including English) into the
// last 7 calendar days by their actual completedAt timestamp. No
// synthetic/placeholder data — a day with zero attempts is genuinely 0.
function buildWeekData(attempts) {
  const days = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    d.setHours(0, 0, 0, 0)
    days.push({ date: d, label: DAY_LABELS[d.getDay()], count: 0 })
  }

  for (const a of attempts) {
    const attemptDate = new Date(a.completedAt)
    attemptDate.setHours(0, 0, 0, 0)
    const bucket = days.find((d) => d.date.getTime() === attemptDate.getTime())
    if (bucket) bucket.count += 1
  }

  return days.map((d) => ({ label: d.label, tests: d.count }))
}

export default function WeeklyActivityChart({ attempts }) {
  const data = buildWeekData(attempts)
  const total = data.reduce((sum, d) => sum + d.tests, 0)

  if (total === 0) return null

  return (
    <div className="bg-panel border border-line rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-mono uppercase tracking-widest text-text-faint">Last 7 Days</p>
        <span className="text-[11px] font-mono text-text-faint">{total} tests</span>
      </div>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="weekFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent-purple)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-accent-purple)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--color-text-faint)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-panel)',
                border: '1px solid var(--color-line)',
                borderRadius: 6,
                fontSize: 12,
              }}
              formatter={(value) => [value, 'tests']}
            />
            <Area type="monotone" dataKey="tests" stroke="var(--color-accent-purple)" strokeWidth={2} fill="url(#weekFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}