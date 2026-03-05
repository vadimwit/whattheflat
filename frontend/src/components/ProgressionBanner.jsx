import { useRef, useEffect } from 'react'
import { toRomanNumeral } from '../lib/theory'

// Sizes for the chord trail (oldest → current)
const TRAIL_SIZES = [
  'text-lg opacity-20',
  'text-xl opacity-30',
  'text-2xl opacity-45',
  'text-3xl opacity-60',
  'text-4xl opacity-80',
]
const CURRENT_SIZE = 'text-7xl opacity-100'

function findLoopPosition(chordHistory, progression) {
  if (!progression?.length || !chordHistory.length) return -1
  const len = progression.length
  // Walk backwards through the progression to find where current chord sits
  for (let p = len - 1; p >= 0; p--) {
    if (progression[p] !== chordHistory[chordHistory.length - 1]) continue
    let match = true
    for (let i = 1; i < Math.min(p + 1, chordHistory.length); i++) {
      if (progression[p - i] !== chordHistory[chordHistory.length - 1 - i]) {
        match = false; break
      }
    }
    if (match) return p
  }
  return progression.indexOf(chordHistory[chordHistory.length - 1])
}

export default function ProgressionBanner({ chordHistory, keyInfo, detectedProgression }) {
  const { root, mode } = keyInfo ?? {}

  // Show up to 5 previous chords + current
  const trail   = chordHistory.slice(-6, -1)  // up to 5 previous
  const current = chordHistory[chordHistory.length - 1]

  // Flash the current chord when it changes
  const currentRef = useRef(null)
  const prevChord  = useRef(null)
  useEffect(() => {
    if (current && current !== prevChord.current && currentRef.current) {
      currentRef.current.animate(
        [{ opacity: 0, transform: 'translateY(8px) scale(0.9)' },
         { opacity: 1, transform: 'translateY(0)   scale(1)' }],
        { duration: 220, easing: 'ease-out', fill: 'forwards' }
      )
      prevChord.current = current
    }
  }, [current])

  const loopPos = findLoopPosition(chordHistory, detectedProgression)

  if (!chordHistory.length) {
    return (
      <div className="bg-panel border border-border rounded-2xl p-6 mb-4 flex items-center justify-center h-36">
        <p className="text-gray-600 text-lg">Start listening to detect chords…</p>
      </div>
    )
  }

  return (
    <div className="bg-panel border border-border rounded-2xl p-6 mb-4">
      {/* ── Chord trail ── */}
      <div className="flex items-end gap-3 overflow-x-auto pb-1 min-h-[96px]">
        {trail.map((chord, i) => {
          const sizeClass = TRAIL_SIZES[Math.max(0, i - (trail.length - TRAIL_SIZES.length))]
          const rn = root ? toRomanNumeral(chord, root, mode) : ''
          return (
            <div key={`${chord}-${i}`} className={`flex flex-col items-center shrink-0 transition-all duration-300 ${sizeClass}`}>
              <span className="font-bold text-gray-300 leading-none">{chord}</span>
              <span className="text-xs text-gray-600 mt-1">{rn}</span>
            </div>
          )
        })}

        {/* Arrow between trail and current */}
        {trail.length > 0 && (
          <span className="text-gray-600 text-2xl mb-2 shrink-0">›</span>
        )}

        {/* Current chord — BIG */}
        {current && (
          <div ref={currentRef} className={`flex flex-col items-center shrink-0 ${CURRENT_SIZE}`}>
            <span className="font-black text-accent leading-none tracking-tight">{current}</span>
            <span className="text-base text-amber-400 mt-1 font-semibold">
              {root ? toRomanNumeral(current, root, mode) : ''}
            </span>
          </div>
        )}
      </div>

      {/* ── Detected loop ── */}
      {detectedProgression && (
        <div className="mt-5 pt-4 border-t border-border">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
            ♻ Detected loop
          </p>
          <div className="flex gap-2 flex-wrap">
            {detectedProgression.map((chord, i) => {
              const isActive = i === loopPos
              const rn = root ? toRomanNumeral(chord, root, mode) : chord
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center px-4 py-2 rounded-xl border transition-all duration-200 ${
                    isActive
                      ? 'bg-accent/20 border-accent shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                      : 'bg-border border-border'
                  }`}
                >
                  <span className={`text-2xl font-bold leading-none ${isActive ? 'text-accent' : 'text-gray-200'}`}>
                    {chord}
                  </span>
                  <span className={`text-xs mt-1 font-semibold ${isActive ? 'text-amber-400' : 'text-gray-500'}`}>
                    {rn}
                  </span>
                </div>
              )
            })}
            <div className="flex items-center text-gray-600 text-sm pl-1">
              → loop
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
