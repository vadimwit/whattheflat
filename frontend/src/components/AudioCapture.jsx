import { useEffect, useRef, useCallback } from 'react'
import { PitchDetector } from 'pitchy'
import { NOTES } from '../lib/theory'

const MIN_CLARITY = 0.85
const MIN_VOLUME  = 0.01
const FFT_SIZE    = 4096   // larger = better frequency resolution
const NOISE_FLOOR = -60    // dB — ignore bins quieter than this

// Build 12-bin chroma from FFT power spectrum.
// Restricts to guitar fundamental range and applies log compression.
function computeChroma(freqData, sampleRate, fftSize) {
  const chroma = new Float32Array(12)
  const binHz  = sampleRate / fftSize

  for (let bin = 2; bin < freqData.length; bin++) {
    const freq = bin * binHz
    if (freq < 75 || freq > 1400) continue   // guitar fundamentals only
    const db = freqData[bin]
    if (db < NOISE_FLOOR) continue

    // Power (db/10) discriminates harmonics better than amplitude (db/20)
    const power = Math.pow(10, db / 10)
    const midi  = 12 * Math.log2(freq / 440) + 69
    const pc    = ((Math.round(midi) % 12) + 12) % 12
    chroma[pc] += power
  }

  // Log compression reduces dominance of very loud partials
  for (let i = 0; i < 12; i++) chroma[i] = Math.log1p(chroma[i] * 100)

  const max = Math.max(...chroma)
  if (max > 0) for (let i = 0; i < 12; i++) chroma[i] /= max

  return chroma
}

// Find the dominant pitch class in the bass range (guitar lowest notes).
// This gives us a strong root-note hint for chord matching.
function detectBassPC(freqData, sampleRate, fftSize) {
  const binHz = sampleRate / fftSize
  let maxPower = 0, bestMidi = -1

  for (let bin = 2; bin < freqData.length; bin++) {
    const freq = bin * binHz
    if (freq < 75 || freq > 350) continue
    const db = freqData[bin]
    if (db < NOISE_FLOOR) continue
    const power = Math.pow(10, db / 10)
    if (power > maxPower) {
      maxPower = power
      bestMidi = Math.round(12 * Math.log2(freq / 440) + 69)
    }
  }
  if (bestMidi < 0) return null
  return ((bestMidi % 12) + 12) % 12
}

export default function AudioCapture({ onNote, onChroma, isListening }) {
  const audioCtxRef  = useRef(null)
  const analyserRef  = useRef(null)
  const detectorRef  = useRef(null)
  const timeBufRef   = useRef(null)
  const freqBufRef   = useRef(null)
  const rafRef       = useRef(null)
  const streamRef    = useRef(null)

  const stop = useCallback(() => {
    if (rafRef.current)    cancelAnimationFrame(rafRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    if (audioCtxRef.current) audioCtxRef.current.close()
    audioCtxRef.current = null
  }, [])

  const start = useCallback(async () => {
    stop()
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream

    const ctx = new AudioContext()
    audioCtxRef.current = ctx

    const analyser = ctx.createAnalyser()
    analyser.fftSize = FFT_SIZE
    analyser.smoothingTimeConstant = 0.6   // smooth FFT over time
    analyserRef.current = analyser

    ctx.createMediaStreamSource(stream).connect(analyser)

    timeBufRef.current = new Float32Array(analyser.fftSize)
    freqBufRef.current = new Float32Array(analyser.frequencyBinCount)
    detectorRef.current = PitchDetector.forFloat32Array(analyser.fftSize)

    function tick() {
      const timeBuf = timeBufRef.current
      analyser.getFloatTimeDomainData(timeBuf)

      const rms = Math.sqrt(timeBuf.reduce((s, v) => s + v * v, 0) / timeBuf.length)
      if (rms >= MIN_VOLUME) {
        // Pitch — used for key detection
        const [freq, clarity] = detectorRef.current.findPitch(timeBuf, ctx.sampleRate)
        if (clarity >= MIN_CLARITY && freq > 60 && freq < 4200) {
          const midi       = Math.round(12 * Math.log2(freq / 440) + 69)
          const pitchClass = ((midi % 12) + 12) % 12
          onNote({ noteName: NOTES[pitchClass], pitchClass, freq, midi, clarity })
        }

        // Chroma + bass — used for chord detection
        if (onChroma) {
          const freqBuf = freqBufRef.current
          analyser.getFloatFrequencyData(freqBuf)
          const chroma = computeChroma(freqBuf, ctx.sampleRate, analyser.fftSize)
          const bassPC = detectBassPC(freqBuf, ctx.sampleRate, analyser.fftSize)
          onChroma(chroma, bassPC)
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    tick()
  }, [onNote, onChroma, stop])

  useEffect(() => {
    if (isListening) start().catch(console.error)
    else stop()
    return stop
  }, [isListening, start, stop])

  return null
}
