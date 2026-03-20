import { useRef, useEffect, useState, useCallback } from 'react'

const STYLE = {
  empty:     { border: 'border-border',    bg: 'bg-surface',       icon: '●', iconColor: 'text-gray-700' },
  recording: { border: 'border-red-500',   bg: 'bg-red-950/20',    icon: '⏺', iconColor: 'text-red-400'  },
  trimming:  { border: 'border-amber-400', bg: 'bg-amber-950/20',  icon: '✂', iconColor: 'text-amber-400'},
  playing:   { border: 'border-accent',    bg: 'bg-accent/10',     icon: '▶', iconColor: 'text-accent'   },
  muted:     { border: 'border-border',    bg: 'bg-surface',       icon: '⏸', iconColor: 'text-gray-500' },
}

const LABEL = {
  empty:     'tap to rec',
  recording: 'tap to stop',
  trimming:  'trimming…',
  playing:   'tap to mute',
  muted:     'tap to play',
}

export default function LoopSlot({ slot, slotIdx, audioCtxRef, masterStartRef, masterLenRef, onClick, onRetrim, onDelete, onVolumeChange }) {
  const progressRef = useRef(null)
  const rafRef      = useRef(null)
  const [showVol,   setShowVol]   = useState(false)
  const [holdTimer, setHoldTimer] = useState(null)
  const [deleting,  setDeleting]  = useState(false)

  const { status, recordingDuration, volume, originalBuffer } = slot
  const style = STYLE[status] ?? STYLE.empty
  const isActive = status === 'playing' || status === 'muted'

  // ── Progress bar via rAF ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive) {
      if (progressRef.current) progressRef.current.style.width = '0%'
      return
    }
    function tick() {
      const ctx    = audioCtxRef.current
      const mStart = masterStartRef.current
      const mLen   = masterLenRef.current
      if (ctx && mStart !== null && mLen && progressRef.current) {
        const pos = ((ctx.currentTime - mStart) % mLen) / mLen * 100
        progressRef.current.style.width = `${pos}%`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [isActive, audioCtxRef, masterStartRef, masterLenRef])

  // ── Long-press to delete ──────────────────────────────────────────────────
  const onPointerDown = useCallback((e) => {
    e.preventDefault()
    const t = setTimeout(() => setDeleting(true), 500)
    setHoldTimer(t)
  }, [])

  const onPointerUp = useCallback(() => {
    if (holdTimer) { clearTimeout(holdTimer); setHoldTimer(null) }
    if (!deleting) onClick(slotIdx)
  }, [holdTimer, deleting, onClick, slotIdx])

  const onPointerLeave = useCallback(() => {
    if (holdTimer) { clearTimeout(holdTimer); setHoldTimer(null) }
  }, [holdTimer])

  const confirmDelete = useCallback(() => {
    setDeleting(false)
    onDelete(slotIdx)
  }, [onDelete, slotIdx])

  return (
    <div className="flex flex-col items-center gap-1 select-none relative">

      {/* Delete confirmation overlay (long-press) */}
      {deleting && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-1 rounded-xl bg-black/90 border border-red-500">
          <button
            className="text-[10px] font-bold text-red-400 px-2 py-0.5 rounded bg-red-900/50 hover:bg-red-900"
            onClick={confirmDelete}
          >
            Delete
          </button>
          <button
            className="text-[10px] text-gray-500 hover:text-gray-300"
            onClick={() => setDeleting(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Quick clear button — visible on non-empty slots */}
      {status !== 'empty' && !deleting && (
        <button
          className="absolute -top-1.5 -right-1.5 z-10 w-4 h-4 rounded-full bg-gray-800 border border-border text-gray-500 hover:bg-red-900/60 hover:text-red-400 hover:border-red-700 text-[9px] leading-none flex items-center justify-center transition-colors"
          onClick={(e) => { e.stopPropagation(); onDelete(slotIdx) }}
          title="Clear slot"
        >
          ×
        </button>
      )}

      {/* Main button */}
      <button
        className={`relative w-[76px] h-[54px] rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${style.bg} ${style.border} ${status === 'recording' ? 'animate-pulse' : ''}`}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
      >
        <span className={`text-lg leading-none ${style.iconColor}`}>
          {style.icon}
        </span>
        <span className={`text-[9px] font-bold uppercase tracking-widest leading-none ${style.iconColor} opacity-70`}>
          {status === 'recording'
            ? `${(recordingDuration ?? 0).toFixed(1)}s`
            : `Loop ${slotIdx + 1}`}
        </span>

        {/* Progress bar */}
        {isActive && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-border">
            <div
              ref={progressRef}
              className="h-full bg-accent"
              style={{ width: '0%', transition: 'none' }}
            />
          </div>
        )}
      </button>

      {/* Controls row (playing/muted only) */}
      {isActive && (
        <div className="flex items-center gap-1.5">
          {/* Volume toggle */}
          <button
            className={`text-[11px] transition-colors ${showVol ? 'text-accent' : 'text-gray-600 hover:text-gray-400'}`}
            onClick={() => setShowVol(v => !v)}
            title="Volume"
          >
            🔊
          </button>
          {showVol && (
            <input
              type="range" min={0} max={1} step={0.05}
              value={volume}
              onChange={e => onVolumeChange(slotIdx, parseFloat(e.target.value))}
              className="w-12 h-1 cursor-pointer accent-purple-500"
            />
          )}
          {/* Re-trim button — only when original recording exists */}
          {originalBuffer && (
            <button
              className="text-[11px] text-gray-600 hover:text-amber-400 transition-colors"
              onClick={() => onRetrim(slotIdx)}
              title="Re-trim this loop"
            >
              ✂
            </button>
          )}
        </div>
      )}

      {/* Status label */}
      <span className={`text-[9px] uppercase tracking-wider leading-none ${style.iconColor} opacity-50`}>
        {LABEL[status] ?? ''}
      </span>
    </div>
  )
}
