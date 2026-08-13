// Consistency is derived from the coefficient of variation of the raw,
// per-second WPM samples. It is shared by the result graph and attempt log.
export function consistencyScore(wpmHistory) {
  const samples = (wpmHistory || []).map((sample) => sample.raw).filter((value) => value > 0)
  if (samples.length < 3) return 100

  const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length
  if (mean === 0) return 100

  const variance = samples.reduce((sum, value) => sum + (value - mean) ** 2, 0) / samples.length
  const raw = 100 - (Math.sqrt(variance) / mean) * 100

  return Math.max(0, Math.round(raw))
}
