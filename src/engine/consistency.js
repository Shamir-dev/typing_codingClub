// Consistency = coefficient of variation of per-second RAW wpm samples
// (every keystroke, mistakes included) — matches MonkeyType's actual
// approach rather than a per-keystroke approximation. Shared between
// the results-screen graph and anywhere else (like the attempts log)
// that needs the same number, so the two never drift apart.
export function consistencyScore(wpmHistory) {
  const samples = (wpmHistory || []).map((s) => s.raw).filter((v) => v > 0)
  if (samples.length < 3) return 100

  const mean = samples.reduce((a, b) => a + b, 0) / samples.length
  if (mean === 0) return 100
  const variance = samples.reduce((sum, v) => sum + (v - mean) ** 2, 0) / samples.length
  const stddev = Math.sqrt(variance)
  return Math.max(0, Math.round(100 - (stddev / mean) * 100))
}