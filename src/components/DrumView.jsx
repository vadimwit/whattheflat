import { useRef, useEffect } from 'react'

// Map a frequency (Hz) to a bin index in the 256-bin log spectrum (40–4000 Hz)
function freqToBin(freq) {
  return Math.round(255 * Math.log(freq / 40) / Math.log(4000 / 40))
}

function bandMax(spectrum, lo, hi) {
  if (!spectrum) return 0
  const a = freqToBin(lo)
  const b = Math.min(freqToBin(hi), spectrum.length - 1)
  let max = 0
  for (let i = a; i <= b; i++) if (spectrum[i] > max) max = spectrum[i]
  return max
}

const BANDS = [
  { label: 'Kick',     lo: 40,   hi: 120,  color: '#ef4444' },
  { label: 'Snare',    lo: 120,  hi: 300,  color: '#f59e0b' },
  { label: 'Mid',      lo: 300,  hi: 1000, color: '#22c55e' },
  { label: 'Presence', lo: 1000, hi: 4000, color: '#60a5fa' },
]

const TIMELINE_MS = 4000   // onset timeline window
const RMS_HISTORY = 180    // ~3s at 60fps

export default function DrumView({ waveform, bpm }) {
  const rmsHistRef    = useRef([])
  const beatCanvasRef = useRef(null)
  const rmsCanvasRef  = useRef(null)

  const spectrum = waveform?.spectrum ?? null
  const bandLevels = BANDS.map(b => bandMax(spectrum, b.lo, b.hi))

  // Accumulate RMS history
  useEffect(() => {
    if (waveform == null) return
    const h = rmsHistRef.current
    h.push(Math.min(waveform.rms * 10, 1))
    if (h.length > RMS_HISTORY) h.shift()
  }, [waveform])

  // Draw onset / beat timeline
  useEffect(() => {
    const canvas = beatCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height

    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, W, H)

    const onsets = waveform?.onsets ?? []
    const now = performance.now()

    // Beat grid aligned to the most recent onset
    if (bpm) {
      const beatMs = 60000 / bpm
      const numBeats = Math.ceil(TIMELINE_MS / beatMs) + 1
      const latest = onsets[onsets.length - 1]
      const phase = latest != null ? (now - latest) % beatMs : 0
      for (let b = 0; b <= numBeats; b++) {
        const ageMs = b * beatMs - phase
        if (ageMs < 0 || ageMs > TIMELINE_MS) continue
        const x = W * (1 - ageMs / TIMELINE_MS)
        ctx.strokeStyle = 'rgba(255,255,255,0.07)'
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
    }

    // Onset dots + vertical tails
    const recent = onsets.filter(t => now - t <= TIMELINE_MS)
    for (const t of recent) {
      const age = now - t
      const x = W * (1 - age / TIMELINE_MS)
      const alpha = Math.pow(1 - age / TIMELINE_MS, 0.4)
      ctx.strokeStyle = `rgba(168,85,247,${(alpha * 0.35).toFixed(2)})`
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      ctx.fillStyle = `rgba(168,85,247,${alpha.toFixed(2)})`
      ctx.beginPath(); ctx.arc(x, H / 2, 5, 0, Math.PI * 2); ctx.fill()
    }

    // "Now" edge
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(W - 1, 0); ctx.lineTo(W - 1, H); ctx.stroke()
  }, [waveform, bpm])

  // Draw RMS envelope
  useEffect(() => {
    const canvas = rmsCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const h = rmsHistRef.current

    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, W, H)
    if (h.length < 2) return

    const barW = W / RMS_HISTORY
    for (let i = 0; i < h.length; i++) {
      const x = W * (i / RMS_HISTORY)
      const barH = h[i] * H
      const v = Math.round(h[i] * 160 + 60)
      ctx.fillStyle = `rgb(${v},30,${v})`
      ctx.fillRect(x, H - barH, Math.max(barW - 0.5, 1), barH)
    }
  }, [waveform])

  const noData = !waveform

  return (
    <div className="space-y-5">

      {/* Band meters */}
      <div>
        <p className="text-xs text-gray-600 font-mono uppercase tracking-widest mb-2">Frequency Bands</p>
        <div className="flex gap-3" style={{ height: 96 }}>
          {BANDS.map((b, i) => (
            <div key={b.label} className="flex flex-col items-center gap-1 flex-1">
              <div className="flex-1 w-full bg-gray-900 rounded-sm relative overflow-hidden">
                {noData ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] text-gray-700 font-mono">—</span>
                  </div>
                ) : (
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-sm"
                    style={{
                      height: `${bandLevels[i] * 100}%`,
                      backgroundColor: b.color,
                      transition: 'height 60ms linear',
                    }}
                  />
                )}
              </div>
              <span className="text-[10px] font-mono text-gray-500 uppercase">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Onset timeline */}
      <div>
        <p className="text-xs text-gray-600 font-mono uppercase tracking-widest mb-2">
          Onset Timeline{bpm ? ` · ${bpm} BPM` : ''}
          <span className="ml-2 text-gray-700 normal-case">← 4 seconds</span>
        </p>
        <canvas
          ref={beatCanvasRef}
          width={800}
          height={56}
          className="w-full rounded"
          style={{ height: 56 }}
        />
        {noData && (
          <p className="text-xs text-gray-700 font-mono mt-1 text-center">Start listening to see hits</p>
        )}
      </div>

      {/* Volume envelope */}
      <div>
        <p className="text-xs text-gray-600 font-mono uppercase tracking-widest mb-2">
          Volume Envelope
          <span className="ml-2 text-gray-700 normal-case">← ~3 seconds</span>
        </p>
        <canvas
          ref={rmsCanvasRef}
          width={800}
          height={56}
          className="w-full rounded"
          style={{ height: 56 }}
        />
      </div>

    </div>
  )
}
