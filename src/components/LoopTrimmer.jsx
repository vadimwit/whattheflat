import { useRef, useState, useEffect, useCallback } from 'react'

function fmtMs(sec) {
  return `${(sec * 1000).toFixed(0)}ms`
}

function fmtSec(sec) {
  return sec < 10 ? `${sec.toFixed(2)}s` : `${sec.toFixed(1)}s`
}

export default function LoopTrimmer({ slot, slotIdx, bpm, audioCtxRef, onCommit, onCancel }) {
  const canvasRef    = useRef(null)
  const containerRef = useRef(null)
  const previewRef   = useRef(null)   // AudioBufferSourceNode for preview

  const [trimStart, setTrimStart] = useState(slot.trimStart)
  const [trimEnd,   setTrimEnd]   = useState(slot.trimEnd)
  const [previewing, setPreviewing] = useState(false)

  // Refs so drag closures always have current values
  const trimStartRef = useRef(trimStart)
  const trimEndRef   = useRef(trimEnd)
  useEffect(() => { trimStartRef.current = trimStart }, [trimStart])
  useEffect(() => { trimEndRef.current   = trimEnd   }, [trimEnd])

  const duration    = slot.audioBuffer?.duration ?? 0
  const startSec    = trimStart * duration
  const endSec      = trimEnd   * duration
  const selectedSec = endSec - startSec

  // Beat grid info — visual reference only, no snapping
  const beatSec = bpm ? 60 / bpm : null
  const barSec  = beatSec ? beatSec * 4 : null

  // Stop preview when handles change
  useEffect(() => {
    if (previewing) stopPreview()
  }, [trimStart, trimEnd]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPreview()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function stopPreview() {
    try { previewRef.current?.stop() } catch {}
    previewRef.current = null
    setPreviewing(false)
  }

  function togglePreview() {
    if (previewing) { stopPreview(); return }
    const ctx = audioCtxRef?.current
    const buf = slot.audioBuffer
    if (!ctx || !buf) return

    // Resume context if suspended
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})

    const sr          = buf.sampleRate
    const startSample = Math.floor(trimStartRef.current * buf.length)
    const endSample   = Math.ceil(trimEndRef.current   * buf.length)
    const len         = Math.max(1, endSample - startSample)
    const data        = buf.getChannelData(0).slice(startSample, endSample)

    const previewBuf  = ctx.createBuffer(1, len, sr)
    previewBuf.copyToChannel(data, 0)

    const node = ctx.createBufferSource()
    node.buffer    = previewBuf
    node.loop      = true
    node.loopStart = 0
    node.loopEnd   = len / sr
    node.connect(ctx.destination)
    node.start()
    node.onended = () => { previewRef.current = null; setPreviewing(false) }

    previewRef.current = node
    setPreviewing(true)
  }

  // Snap end handle to N bars from current start
  function snapBars(n) {
    if (!barSec || !duration) return
    const newEnd = Math.min(1, trimStartRef.current + (n * barSec) / duration)
    setTrimEnd(newEnd)
    trimEndRef.current = newEnd
    draw()
  }

  // ── Canvas draw ─────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !slot.waveform) return
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0) return
    const dpr = window.devicePixelRatio ?? 1
    canvas.width  = rect.width  * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    const W  = rect.width
    const H  = rect.height
    const wf = slot.waveform
    const N  = wf.length
    const ts = trimStartRef.current
    const te = trimEndRef.current

    // Background
    ctx.fillStyle = '#0f0f0f'
    ctx.fillRect(0, 0, W, H)

    // Dim regions outside selection
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(0, 0, ts * W, H)
    ctx.fillRect(te * W, 0, W - te * W, H)

    // Beat grid — visual only, beat lines then bar lines (bars on top)
    if (beatSec && duration) {
      // Beat lines
      ctx.strokeStyle = 'rgba(255,255,255,0.10)'
      ctx.lineWidth   = 1
      for (let t = 0; t <= duration; t += beatSec) {
        const isBar = barSec ? (t % barSec) < beatSec * 0.4 : false
        if (!isBar) {
          const x = (t / duration) * W
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
        }
      }
      // Bar lines (brighter, thicker)
      if (barSec) {
        ctx.strokeStyle = 'rgba(168,85,247,0.55)'
        ctx.lineWidth   = 1.5
        for (let t = 0; t <= duration; t += barSec) {
          const x = (t / duration) * W
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
          // Bar number label
          const barNum = Math.round(t / barSec)
          if (barNum > 0) {
            ctx.fillStyle = 'rgba(168,85,247,0.5)'
            ctx.font = `${9 * dpr / dpr}px monospace`
            ctx.fillText(`${barNum}`, x + 3, 10)
          }
        }
      }
    }

    // Waveform bars
    const mid = H / 2
    for (let i = 0; i < N; i++) {
      const x     = (i / N) * W
      const barW  = Math.max(1, W / N - 0.5)
      const inSel = (i / N) >= ts && (i / N) <= te
      ctx.fillStyle = inSel ? '#a855f7' : '#3b0764'
      const h = wf[i] * mid * 0.88
      ctx.fillRect(x, mid - h, barW, h * 2)
    }

    // Handle lines
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth   = 2
    ctx.beginPath(); ctx.moveTo(ts * W, 0); ctx.lineTo(ts * W, H); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(te * W, 0); ctx.lineTo(te * W, H); ctx.stroke()
  }, [slot.waveform, beatSec, barSec, duration])

  useEffect(() => { draw() }, [draw, trimStart, trimEnd])
  useEffect(() => {
    const id = requestAnimationFrame(() => draw())
    return () => cancelAnimationFrame(id)
  }, [draw])

  // ── Pointer → fraction ──────────────────────────────────────────────────────
  function fracFromClientX(clientX) {
    const el = containerRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }

  // ── Drag handles — free movement, no snapping ───────────────────────────────
  function handleMouseDown(handle) {
    return (e) => {
      e.preventDefault()
      function onMove(ev) {
        const raw = fracFromClientX(ev.clientX)
        if (handle === 'start') {
          const c = Math.max(0, Math.min(raw, trimEndRef.current - 0.01))
          setTrimStart(c); trimStartRef.current = c
        } else {
          const c = Math.max(trimStartRef.current + 0.01, Math.min(1, raw))
          setTrimEnd(c); trimEndRef.current = c
        }
        draw()
      }
      function onUp() {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    }
  }

  // Click canvas to move nearest handle
  function handleCanvasClick(e) {
    if (e.target !== canvasRef.current) return
    const raw = fracFromClientX(e.clientX)
    if (Math.abs(raw - trimStart) <= Math.abs(raw - trimEnd)) {
      const c = Math.max(0, Math.min(raw, trimEndRef.current - 0.01))
      setTrimStart(c); trimStartRef.current = c
    } else {
      const c = Math.max(trimStartRef.current + 0.01, Math.min(1, raw))
      setTrimEnd(c); trimEndRef.current = c
    }
    draw()
  }

  return (
    <div className="border-t border-border">
      {/* Header row */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="text-[11px] uppercase tracking-wider text-gray-500">
          Trim — Loop {slotIdx + 1}
        </span>
        <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
          <span className="text-gray-600">{fmtMs(startSec)} → {fmtMs(endSec)}</span>
          <span className="text-accent font-semibold">{fmtSec(selectedSec)}</span>
        </div>
      </div>

      {/* Waveform + handles */}
      <div
        ref={containerRef}
        className="relative mx-4 h-20 rounded-lg overflow-visible cursor-crosshair select-none"
        onClick={handleCanvasClick}
      >
        <canvas ref={canvasRef} className="w-full h-full block rounded-lg" />

        {/* Left handle */}
        <div
          className="absolute top-0 bottom-0 w-5 -translate-x-1/2 cursor-ew-resize flex items-center justify-center group z-10"
          style={{ left: `${trimStart * 100}%` }}
          onMouseDown={handleMouseDown('start')}
          onClick={e => e.stopPropagation()}
        >
          <div className="w-0.5 h-full bg-accent/70 group-hover:bg-accent group-hover:w-1 transition-all" />
          <div className="absolute w-3.5 h-3.5 rounded-full bg-accent border-2 border-white/20 shadow-lg top-1/2 -translate-y-1/2" />
          <div className="absolute bottom-full mb-1 text-[9px] font-mono text-accent bg-panel border border-border rounded px-1 py-0.5 whitespace-nowrap pointer-events-none">
            {fmtMs(startSec)}
          </div>
        </div>

        {/* Right handle */}
        <div
          className="absolute top-0 bottom-0 w-5 -translate-x-1/2 cursor-ew-resize flex items-center justify-center group z-10"
          style={{ left: `${trimEnd * 100}%` }}
          onMouseDown={handleMouseDown('end')}
          onClick={e => e.stopPropagation()}
        >
          <div className="w-0.5 h-full bg-accent/70 group-hover:bg-accent group-hover:w-1 transition-all" />
          <div className="absolute w-3.5 h-3.5 rounded-full bg-accent border-2 border-white/20 shadow-lg top-1/2 -translate-y-1/2" />
          <div className="absolute bottom-full mb-1 text-[9px] font-mono text-accent bg-panel border border-border rounded px-1 py-0.5 whitespace-nowrap pointer-events-none">
            {fmtMs(endSec)}
          </div>
        </div>
      </div>

      {/* Toolbar: preview + bar snap + hint */}
      <div className="flex items-center gap-2 px-4 pt-2 pb-1 flex-wrap">
        {/* Preview play/stop */}
        <button
          onClick={togglePreview}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
            previewing
              ? 'bg-accent/20 border-accent text-accent'
              : 'bg-surface border-border text-gray-400 hover:text-white hover:border-gray-500'
          }`}
          title="Preview loop selection"
        >
          {previewing
            ? <><span>⏹</span><span>Stop</span></>
            : <><span>▶</span><span>Preview</span></>
          }
        </button>

        {/* Bar snap buttons — only if BPM is set */}
        {barSec && duration && (
          <div className="flex items-center gap-1 ml-1">
            <span className="text-[10px] text-gray-600 uppercase tracking-wider mr-0.5">snap end →</span>
            {[1, 2, 4].map(n => {
              const endFrac = trimStart + (n * barSec) / duration
              const fits    = endFrac <= 1.02
              return (
                <button
                  key={n}
                  onClick={() => snapBars(n)}
                  disabled={!fits}
                  className="px-2 py-0.5 rounded border border-border text-[10px] text-gray-400 hover:text-accent hover:border-accent/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title={`Set end to ${n} bar${n > 1 ? 's' : ''} from start`}
                >
                  {n} bar{n > 1 ? 's' : ''}
                </button>
              )
            })}
          </div>
        )}

        <span className="ml-auto text-[10px] text-gray-700">
          {bpm ? `${bpm} BPM grid` : 'no BPM — trim freely'}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 px-4 pb-3">
        <button
          onClick={() => { stopPreview(); onCommit(slotIdx, trimStart, trimEnd) }}
          className="px-5 py-1.5 bg-accent text-white text-sm font-bold rounded-lg hover:bg-accent/80 transition-colors"
        >
          Set Loop ▶
        </button>
        <button
          onClick={() => { stopPreview(); onCommit(slotIdx, 0, 1) }}
          className="px-4 py-1.5 bg-surface border border-border text-gray-400 text-sm rounded-lg hover:text-white hover:border-gray-500 transition-colors"
          title="Use the full recording without trimming"
        >
          Use Full
        </button>
        <button
          onClick={() => { stopPreview(); onCancel(slotIdx) }}
          className="px-4 py-1.5 bg-surface border border-border text-gray-500 text-sm rounded-lg hover:text-red-400 hover:border-red-800 transition-colors ml-auto"
        >
          Re-record
        </button>
      </div>
    </div>
  )
}
