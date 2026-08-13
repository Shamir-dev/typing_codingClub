function dayStart(value) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function daysBetween(first, second) {
  return Math.round((dayStart(second) - dayStart(first)) / 86400000)
}

export function getStreakSummary(attempts) {
  const days = [...new Map(
    attempts.map((attempt) => {
      const date = dayStart(attempt.completedAt)
      return [dayKey(date), date]
    })
  ).values()].sort((a, b) => a - b)

  if (!days.length) return { current: 0, longest: [] }

  const streaks = []
  let start = days[0]
  let end = days[0]

  for (const date of days.slice(1)) {
    if (daysBetween(end, date) === 1) {
      end = date
      continue
    }
    streaks.push({ start, end, days: daysBetween(start, end) + 1 })
    start = date
    end = date
  }
  streaks.push({ start, end, days: daysBetween(start, end) + 1 })

  const latest = streaks.at(-1)
  const current = daysBetween(latest.end, new Date()) <= 1 ? latest.days : 0
  const longest = [...streaks]
    .sort((a, b) => b.days - a.days || b.end - a.end)
    .slice(0, 3)

  return { current, longest }
}

export function formatStreakRange(start, end) {
  const format = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  return start.getTime() === end.getTime() ? format.format(start) : `${format.format(start)} – ${format.format(end)}`
}
