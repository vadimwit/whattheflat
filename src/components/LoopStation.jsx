import { useState, useRef, useEffect } from 'react'
import LoopTrimmer from './LoopTrimmer'

const H_TRACK  = 56   // track canvas height px
const H_MASTER = 26   // master timeline height px

// ── Canvas draw helpers ───────────────────────────────────────────────────────

function drawGrid(canvas, totalSec, bpm) {
  const rect = canvas.getBoundingClientRect()
  if (!rect.width || !rect.height) return
  const dpr = window.devicePixelRatio ?? 1
  canvas.width  = rect.width  * dpr
  canvas.height = rect.height * dpr
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  const W = rect.width, H = rect.height

  ctx.fillStyle = '#0f0f0f'
  ctx.fillRect(0, 0, W, H)
  if (!bpm || !totalSec) return

  const beatSec = 60 / bpm
  const barSec  = beatSec * 4

  // Beat lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 1
  for (let t = beatSec; t < totalSec; t += beatSec) {
    if ((t % barSec) < beatSec * 0.4) continue
    const x = (t / totalSec) * W
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  // Bar lines + numbers
  for (let t = 0; t <= totalSec; t += barSec) {
    ctx.strokeStyle = 'rgba(168,85,247,0.45)'
    ctx.lineWidth = 1.5
    const x = (t / totalSec) * W
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
    const n = Math.round(t / barSec)
    if (n > 0) {
      ctx.fillStyle = 'rgba(168,85,247,0.55)'
      ctx.font = '9px monospace'
      ctx.textAlign = 'left'
      ctx.fillText(String(n), x + 3, H - 2)
    }
  }
}

function drawWaveform(canvas, waveform, muted) {
  const rect = canvas.getBoundingClientRect()
  if (!rect.width || !rect.height) return
  const dpr = window.devicePixelRatio ?? 1
  canvas.width  = rect.width  * dpr
  canvas.height = rect.height * dpr
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  const W = rect.width, H = rect.height

  ctx.fillStyle = '#0f0f0f'
  ctx.fillRect(0, 0, W, H)

  const N   = waveform.length
  const mid = H / 2
  for (let i = 0; i < N; i++) {
    const x    = (i / N) * W
    const barW = Math.max(1, W / N - 0.3)
    ctx.fillStyle = muted ? '#3b1f55' : '#a855f7'
    const h = waveform[i] * mid * 0.85
    ctx.fillRect(x, mid - h, barW, h * 2)
  }
}

function drawRecording(canvas, duration, bpm) {
  const rect = canvas.getBoundingClientRect()
  if (!rect.width || !rect.height) return
  const dpr = window.devicePixelRatio ?? 1
  canvas.width  = rect.width  * dpr
  canvas.height = rect.height * dpr
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  const W = rect.width, H = rect.height

  ctx.fillStyle = '#0f0f0f'
  ctx.fillRect(0, 0, W, H)

  const beatSec = bpm ? 60 / bpm : null
  const barSec  = beatSec ? beatSec * 4 : null
  const viewDur = barSec
    ? Math.max(barSec * 4, Math.ceil(duration / barSec + 1) * barSec)
    : Math.max(8, duration * 1.4)

  // Grid
  if (beatSec) {
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1
    for (let t = beatSec; t < viewDur; t += beatSec) {
      if (barSec && (t % barSec) < beatSec * 0.4) continue
      const x = (t / viewDur) * W
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
    }
    if (barSec) {
      for (let t = barSec; t <= viewDur; t += barSec) {
        ctx.strokeStyle = 'rgba(239,68,68,0.3)'
        ctx.lineWidth = 1.5
        const x = (t / viewDur) * W
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
        const n = Math.round(t / barSec)
        ctx.fillStyle = 'rgba(239,68,68,0.45)'
        ctx.font = '9px monospace'
        ctx.textAlign = 'left'
        ctx.fillText(String(n), x + 2, H - 2)
      }
    }
  }

  // Growing fill + cursor
  const fillX = (duration / viewDur) * W
  ctx.fillStyle = 'rgba(239,68,68,0.18)'
  ctx.fillRect(0, 0, fillX, H)
  ctx.strokeStyle = 'rgba(239,68,68,0.85)'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(fillX, 0); ctx.lineTo(fillX, H); ctx.stroke()

  // Counter label
  const bars  = barSec ? Math.floor(duration / barSec) + 1 : null
  const label = bars !== null
    ? `● REC   BAR ${bars}   ${duration.toFixed(1)}s  —  tap to stop`
    : `● REC   ${duration.toFixed(1)}s  —  tap to stop`
  ctx.fillStyle = 'rgba(239,68,68,0.9)'
  ctx.font = 'bold 11px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, W / 2, H / 2)
}

// ── Master Timeline ───────────────────────────────────────────────────────────

function MasterTimeline({ masterStartRef, masterLenRef, audioCtxRef, bpm, masterLen }) {
  const canvasRef   = useRef(null)
  const playheadRef = useRef(null)
  const rafRef      = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const id = requestAnimationFrame(() => drawGrid(canvas, masterLen, bpm))
    return () => cancelAnimationFrame(id)
  }, [masterLen, bpm])

  useEffect(() => {
    if (!masterLen) { cancelAnimationFrame(rafRef.current); return }
    function tick() {
      const ac  = audioCtxRef.current
      const t0  = masterStartRef.current
      const len = masterLenRef.current
      if (ac && t0 !== null && len && playheadRef.current) {
        const pos = ((ac.currentTime - t0) % len) / len
        playheadRef.current.style.left = `${pos * 100}%`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [masterLen, audioCtxRef, masterStartRef, masterLenRef])

  return (
    <div className="relative mx-4 mb-3 rounded overflow-hidden bg-surface border border-border"
         style={{ height: `${H_MASTER}px` }}>
      <canvas ref={canvasRef} className="w-full h-full block" />
      {!masterLen && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] text-gray-700">
            record first loop to set master length
          </span>
        </div>
      )}
      {masterLen && (
        <div
          ref={playheadRef}
          className="absolute top-0 bottom-0 w-px bg-white/50 pointer-events-none"
          style={{ left: '0%' }}
        />
      )}
    </div>
  )
}

// ── Track Row ─────────────────────────────────────────────────────────────────

function TrackRow({ slot, slotIdx, bpm, audioCtxRef, masterStartRef, masterLenRef,
                    onSlotClick, onRetrim, onDelete, onVolumeChange }) {
  const [showVol, setShowVol] = useState(false)
  const canvasRef   = useRef(null)
  const playheadRef = useRef(null)
  const rafRef      = useRef(null)

  const DOT_CLASS = {
    empty:     'bg-gray-700',
    recording: 'bg-red-500 animate-pulse',
    trimming:  'bg-amber-500',
    playing:   'bg-accent',
    muted:     'bg-gray-500',
  }
  const BORDER_CLASS = {
    empty:     'border-border',
    recording: 'border-red-800',
    trimming:  'border-amber-800/60',
    playing:   'border-accent/40',
    muted:     'border-border',
  }

  const dotClass    = DOT_CLASS[slot.status]    ?? 'bg-gray-700'
  const borderClass = BORDER_CLASS[slot.status] ?? 'border-border'

  // Draw waveform when data arrives or mute state changes
  useEffect(() => {
    if (!slot.waveform) return
    if (slot.status === 'recording' || slot.status === 'trimming') return
    const canvas = canvasRef.current
    if (!canvas) return
    const id = requestAnimationFrame(() =>
      drawWaveform(canvas, slot.waveform, slot.status === 'muted')
    )
    return () => cancelAnimationFrame(id)
  }, [slot.waveform, slot.status])

  // Draw recording progress on each duration tick
  useEffect(() => {
    if (slot.status !== 'recording') return
    const canvas = canvasRef.current
    if (!canvas) return
    drawRecording(canvas, slot.recordingDuration, bpm)
  }, [slot.recordingDuration, slot.status, bpm])

  // Playhead animation
  useEffect(() => {
    const active = slot.status === 'playing' || slot.status === 'muted'
    if (!active) {
      cancelAnimationFrame(rafRef.current)
      if (playheadRef.current) playheadRef.current.style.left = '-2px'
      return
    }
    function tick() {
      const ac  = audioCtxRef.current
      const t0  = masterStartRef.current
      const len = masterLenRef.current
      if (ac && t0 !== null && len && playheadRef.current) {
        const pos = ((ac.currentTime - t0) % len) / len
        playheadRef.current.style.left = `${pos * 100}%`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [slot.status, audioCtxRef, masterStartRef, masterLenRef])

  const isClickable = slot.status !== 'trimming'
  const isActive    = slot.status === 'playing' || slot.status === 'muted'

  return (
    <div className={`flex items-stretch border rounded-lg mb-1.5 overflow-hidden transition-colors ${borderClass}`}>

      {/* Left: tap button (state dot + track number) */}
      <button
        onClick={() => isClickable && onSlotClick(slotIdx)}
        disabled={!isClickable}
        title={
          slot.status === 'empty'     ? 'Tap to record'  :
          slot.status === 'recording' ? 'Tap to stop'    :
          slot.status === 'playing'   ? 'Tap to mute'    :
          slot.status === 'muted'     ? 'Tap to unmute'  : ''
        }
        className="flex flex-col items-center justify-center gap-1 px-3 bg-surface border-r border-border shrink-0 hover:bg-white/5 transition-colors disabled:cursor-default"
        style={{ width: '44px' }}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
        <span className="text-[10px] text-gray-600 font-mono">{slotIdx + 1}</span>
      </button>

      {/* Canvas: waveform / recording / empty */}
      <div
        className="relative flex-1 cursor-pointer"
        style={{ height: `${H_TRACK}px` }}
        onClick={() => isClickable && onSlotClick(slotIdx)}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {slot.status === 'empty' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs text-gray-700">tap to record</span>
          </div>
        )}
        {slot.status === 'trimming' && (
          <div className="absolute inset-0 flex items-center justify-center bg-amber-950/20 pointer-events-none">
            <span className="text-xs text-amber-500/60">trimming ↓</span>
          </div>
        )}

        {/* Moving playhead */}
        {isActive && (
          <div
            ref={playheadRef}
            className="absolute top-0 bottom-0 w-px bg-white/40 pointer-events-none"
            style={{ left: '-2px' }}
          />
        )}
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-1 px-2 bg-surface border-l border-border shrink-0">
        {showVol && (
          <input
            type="range"
            min={0} max={1} step={0.01}
            value={slot.volume}
            onChange={e => onVolumeChange(slotIdx, parseFloat(e.target.value))}
            className="w-14 accent-purple-500"
            title="Volume"
          />
        )}
        <button
          onClick={() => setShowVol(v => !v)}
          className={`w-7 h-7 flex items-center justify-center rounded text-base transition-colors ${
            showVol ? 'text-accent' : 'text-gray-600 hover:text-gray-300'
          }`}
          title="Volume"
        >
          {slot.status === 'muted' ? '🔇' : '🔊'}
        </button>
        {isActive && slot.originalBuffer && (
          <button
            onClick={() => onRetrim(slotIdx)}
            className="w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:text-amber-400 transition-colors text-sm"
            title="Re-trim loop"
          >
            ✂
          </button>
        )}
        <button
          onClick={() => onDelete(slotIdx)}
          className="w-7 h-7 flex items-center justify-center rounded text-gray-700 hover:text-red-400 transition-colors text-sm"
          title="Clear track"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function LoopStation({
  slots,
  bpm,
  masterLen,
  audioCtxRef,
  masterStartRef,
  masterLenRef,
  onSlotClick,
  onCommitTrim,
  onCancelRecord,
  onRetrim,
  onDelete,
  onVolumeChange,
  onAddSlot,
}) {
  const [open,    setOpen]    = useState(false)
  const [gridBpm, setGridBpm] = useState(bpm ?? '')

  // Pre-fill BPM when detection arrives
  useEffect(() => {
    if (bpm && !gridBpm) setGridBpm(bpm)
  }, [bpm]) // eslint-disable-line react-hooks/exhaustive-deps

  const gridBpmNum  = parseFloat(gridBpm) || null
  const trimmingIdx = slots.findIndex(s => s.status === 'trimming')

  const recordingCount = slots.filter(s => s.status === 'recording').length
  const playingCount   = slots.filter(s => s.status === 'playing').length

  const dotClass = recordingCount > 0
    ? 'bg-red-500 animate-pulse'
    : playingCount > 0
      ? 'bg-accent'
      : 'bg-gray-700'

  const masterLabel = (() => {
    if (!masterLen) return null
    if (gridBpmNum) {
      const bars = Math.round(masterLen / ((60 / gridBpmNum) * 4))
      return `${bars} bar${bars !== 1 ? 's' : ''} · ${masterLen.toFixed(2)}s`
    }
    return masterLen.toFixed(2) + 's'
  })()

  return (
    <div className="mb-3 bg-panel border border-border rounded-xl overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-400">
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 hover:text-gray-200 transition-colors text-left"
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
          <span>LOOP STATION</span>
          {masterLabel && (
            <span className="text-[11px] text-gray-600 font-mono">{masterLabel}</span>
          )}
          {recordingCount > 0 && (
            <span className="text-[11px] text-red-400">● rec</span>
          )}
          {playingCount > 0 && recordingCount === 0 && (
            <span className="text-[11px] text-accent">
              {playingCount} loop{playingCount !== 1 ? 's' : ''}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-surface border border-border rounded-lg px-2 py-1">
            <span className="text-[10px] text-gray-600 uppercase tracking-wider">BPM</span>
            <input
              type="number"
              min={40} max={300} step={1}
              value={gridBpm}
              onChange={e => setGridBpm(e.target.value)}
              placeholder={bpm ? String(Math.round(bpm)) : '—'}
              className="w-10 bg-transparent text-xs text-gray-300 text-center focus:outline-none focus:text-white"
              style={{ MozAppearance: 'textfield' }}
            />
          </div>
          <button
            onClick={() => setOpen(v => !v)}
            className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
            title={open ? 'Collapse' : 'Expand'}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                 stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {open
                ? <polyline points="2,8 6,4 10,8" />
                : <polyline points="2,4 6,8 10,4" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      {open && (
        <div className="border-t border-border pt-3">

          {/* Master timeline */}
          <MasterTimeline
            masterStartRef={masterStartRef}
            masterLenRef={masterLenRef}
            audioCtxRef={audioCtxRef}
            bpm={gridBpmNum}
            masterLen={masterLen}
          />

          {/* Track rows */}
          <div className="px-4">
            {slots.map((slot, i) => (
              <TrackRow
                key={i}
                slot={slot}
                slotIdx={i}
                bpm={gridBpmNum}
                audioCtxRef={audioCtxRef}
                masterStartRef={masterStartRef}
                masterLenRef={masterLenRef}
                onSlotClick={onSlotClick}
                onRetrim={onRetrim}
                onDelete={onDelete}
                onVolumeChange={onVolumeChange}
              />
            ))}
          </div>

          {/* Add track */}
          <div className="px-4 pb-3">
            <button
              onClick={onAddSlot}
              className="w-full py-1.5 rounded-lg border border-dashed border-border text-gray-700 hover:border-accent/40 hover:text-accent/60 transition-colors text-xs flex items-center justify-center gap-2"
            >
              <span className="text-base leading-none">+</span>
              <span>Add Track</span>
            </button>
          </div>

          {/* LoopTrimmer — shown below tracks when trimming */}
          {trimmingIdx !== -1 && (
            <LoopTrimmer
              slot={slots[trimmingIdx]}
              slotIdx={trimmingIdx}
              bpm={gridBpmNum}
              audioCtxRef={audioCtxRef}
              onCommit={onCommitTrim}
              onCancel={onCancelRecord}
            />
          )}
        </div>
      )}
    </div>
  )
}
