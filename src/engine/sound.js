// Synthesized keystroke feedback via Web Audio — not a recording of an
// actual keyboard. Being upfront about that: a genuinely "exact" high
// quality mechanical-keyboard sample would mean shipping a licensed
// audio asset, which isn't something to embed without a real license.
// This synthesizes two distinct profiles instead, built from layered
// noise + tone rather than a single beep, which reads as far more
// physical than a plain oscillator blip.
let ctx = null

function getContext() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return null
    ctx = new AudioCtx()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// Short burst of filtered white noise — this is what makes a click
// sound like a physical impact instead of a synth blip.
function noiseBurst(audioCtx, { duration, filterFreq, filterQ, gain, startTime }) {
  const bufferSize = Math.max(1, Math.floor(audioCtx.sampleRate * duration))
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) // decay envelope baked into the noise itself
  }

  const source = audioCtx.createBufferSource()
  source.buffer = buffer

  const filter = audioCtx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = filterFreq
  filter.Q.value = filterQ

  const gainNode = audioCtx.createGain()
  gainNode.gain.setValueAtTime(gain, startTime)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  source.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(audioCtx.destination)
  source.start(startTime)
}

// Low "thock" body resonance under the click transient.
function thockTone(audioCtx, { freq, duration, gain, startTime }) {
  const osc = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, startTime)
  osc.frequency.exponentialRampToValueAtTime(freq * 0.6, startTime + duration)
  gainNode.gain.setValueAtTime(gain, startTime)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
  osc.connect(gainNode)
  gainNode.connect(audioCtx.destination)
  osc.start(startTime)
  osc.stop(startTime + duration)
}

export function playMechanicalClick() {
  const audioCtx = getContext()
  if (!audioCtx) return
  const now = audioCtx.currentTime
  // Sharp high-frequency click transient (the "tactile switch" snap)...
  noiseBurst(audioCtx, { duration: 0.018, filterFreq: 3800, filterQ: 1.2, gain: 0.5, startTime: now })
  // ...plus a low body resonance underneath it (the "thock").
  thockTone(audioCtx, { freq: 180, duration: 0.05, gain: 0.14, startTime: now })
}

export function playTypewriterClick() {
  const audioCtx = getContext()
  if (!audioCtx) return
  const now = audioCtx.currentTime
  // Typewriters are harder-edged and more metallic than a switch click.
  noiseBurst(audioCtx, { duration: 0.012, filterFreq: 5200, filterQ: 2.2, gain: 0.55, startTime: now })
  thockTone(audioCtx, { freq: 320, duration: 0.03, gain: 0.1, startTime: now })
}

// A little bonus detail: real typewriters ding + swish on carriage
// return. Only fires for the typewriter profile, only on Enter.
export function playTypewriterReturn() {
  const audioCtx = getContext()
  if (!audioCtx) return
  const now = audioCtx.currentTime
  const osc = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(2200, now)
  gainNode.gain.setValueAtTime(0.12, now)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)
  osc.connect(gainNode)
  gainNode.connect(audioCtx.destination)
  osc.start(now)
  osc.stop(now + 0.25)
  noiseBurst(audioCtx, { duration: 0.15, filterFreq: 1200, filterQ: 0.8, gain: 0.2, startTime: now + 0.02 })
}

export function playKeySound(mode, key) {
  if (mode === 'off') return
  if (mode === 'typewriter') {
    if (key === '\n') playTypewriterReturn()
    else playTypewriterClick()
    return
  }
  if (mode === 'mechanical') playMechanicalClick()
}
