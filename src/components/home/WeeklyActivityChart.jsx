import { useMemo, useState } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'

const RANGES = [
  { id: '7d', label: '7 Days', days: 7, bucket: 'day' },
  { id: '15d', label: '15 Days', days: 15, bucket: 'day' },
  { id: '1m', label: '1 Month', days: 30, bucket: 'day' },
  { id: '3m', label: '3 Months', days: 90, bucket: 'week' },
  { id: '6m', label: '6 Months', days: 183, bucket: 'month' },
  { id: '1y', label: '1 Year', days: 365, bucket: 'month' },
  { id: 'all', label: 'All Time', days: null, bucket: 'month' },
]

function startOfDay(value) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

function startOfWeek(value) {
  const date = startOfDay(value)
  date.setDate(date.getDate() - date.getDay())
  return date
}

function startOfMonth(value) {
  const date = startOfDay(value)
  date.setDate(1)
  return date
}

function getBucketStart(value, bucket) {
  if (bucket === 'week') return startOfWeek(value)
  if (bucket === 'month') return startOfMonth(value)
  return startOfDay(value)
}

function formatLabel(date, bucket) {
  if (bucket === 'month') return new Intl.DateTimeFormat(undefined, { month: 'short', year: '2-digit' }).format(date)
  if (bucket === 'week') return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date)
  return new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date)
}

function buildProgressData(attempts, range) {
  const now = startOfDay(new Date())
  const earliest = attempts.length ? startOfDay(Math.min(...attempts.map((attempt) => new Date(attempt.completedAt).getTime()))) : now
  const rangeStart = range.days ? new Date(now.getTime() - (range.days - 1) * 86400000) : earliest
  const buckets = new Map()

  for (let cursor = getBucketStart(rangeStart, range.bucket); cursor <= now;) {
    const key = cursor.getTime()
    buckets.set(key, { date: new Date(cursor), label: formatLabel(cursor, range.bucket), tests: 0, totalWpm: 0, wpm: null })
    if (range.bucket === 'month') cursor.setMonth(cursor.getMonth() + 1)
    else cursor.setDate(cursor.getDate() + (range.bucket === 'week' ? 7 : 1))
  }

  for (const attempt of attempts) {
    const attemptDate = startOfDay(attempt.completedAt)
    if (attemptDate < rangeStart || attemptDate > now) continue
    const key = getBucketStart(attemptDate, range.bucket).getTime()
    const bucket = buckets.get(key)
    if (bucket) {
      bucket.tests += 1
      bucket.totalWpm += attempt.wpm || 0
    }
  }

  return [...buckets.values()].map((bucket) => ({
    ...bucket,
    wpm: bucket.tests ? Math.round(bucket.totalWpm / bucket.tests) : null,
  }))
}

export default function WeeklyActivityChart({ attempts }) {
  const [rangeId, setRangeId] = useState('7d')
  const range = RANGES.find((item) => item.id === rangeId) || RANGES[0]
  const data = useMemo(() => buildProgressData(attempts, range), [attempts, range])
  const measured = data.filter((bucket) => bucket.wpm !== null)

  if (measured.length === 0) return null

  const firstWpm = measured[0].wpm
  const latestWpm = measured.at(-1).wpm
  const progress = firstWpm ? Math.round(((latestWpm - firstWpm) / firstWpm) * 100) : 0

  return (
    <div className="bg-panel border border-line rounded-xl p-5 shadow-[0_14px_34px_-26px_rgba(0,0,0,.9)]">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-mono uppercase tracking-widest text-text-faint">Your Progress</p>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-mono ${progress >= 0 ? 'bg-correct/15 text-correct' : 'bg-incorrect/15 text-incorrect'}`}>
            {progress >= 0 ? '+' : ''}{progress}%
          </span>
          <select
            aria-label="Progress time range"
            value={rangeId}
            onChange={(event) => setRangeId(event.target.value)}
            className="rounded-md border border-line bg-panel-raised px-2 py-1 text-[11px] font-mono text-text-muted outline-none hover:text-text focus:border-accent-purple"
          >
            {RANGES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </div>
      </div>
      <div className="h-24 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="weekFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent-purple)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-accent-purple)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" interval="preserveStartEnd" tick={{ fontSize: 10, fill: 'var(--color-text-faint)' }} axisLine={false} tickLine={false} />
            <YAxis width={24} domain={[0, 125]} ticks={[0, 25, 50, 75, 100, 125]} tick={{ fontSize: 10, fill: 'var(--color-text-faint)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--color-panel)', border: '1px solid var(--color-line)', borderRadius: 6, fontSize: 12 }}
              formatter={(value, name) => [name === 'wpm' ? `${value} WPM` : value, name === 'wpm' ? 'Average speed' : name]}
            />
            <Area connectNulls type="linear" dataKey="wpm" name="wpm" stroke="var(--color-accent-purple)" strokeWidth={2} fill="url(#weekFill)" dot={{ r: 3, fill: 'var(--color-accent-purple)', strokeWidth: 0 }} activeDot={{ r: 4 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
