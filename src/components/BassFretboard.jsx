import { getPentatonicScale, getFullScale, getChordTones, NOTES } from '../lib/theory'

// Standard bass tuning (top of diagram = highest string)
const STRINGS = [
  { label: 'G', root: 7,  thickness: 1.5 },
  { label: 'D', root: 2,  thickness: 2   },
  { label: 'A', root: 9,  thickness: 2.5 },
  { label: 'E', root: 4,  thickness: 3   },
]

const NUM_FRETS    = 13
const FRET_MARKERS = [3, 5, 7, 9]
const DOUBLE_MARKER = 12

// Layout
const NUT_X   = 40
const OPEN_X  = 18
const FRET_W  = 52
const STRING_H = 36   // wider spacing than guitar — 4 strings feel more spread
const PAD_T   = 28
const PAD_B   = 18
const BOARD_W = NUT_X + (NUM_FRETS - 1) * FRET_W + 10
const BOARD_H = PAD_T + 3 * STRING_H + PAD_B
const DOT_R   = 10

const fretX   = f  => NUT_X + (f - 0.5) * FRET_W
const stringY = si => PAD_T + si * STRING_H

function noteColor(isChordTone, isPenta, isScale, mono = false) {
  if (isChordTone) return { fill: '#a855f7', text: '#fff' }
  if (isPenta)     return mono ? { fill: '#c084fc', text: '#1e1b4b' } : { fill: '#f59e0b', text: '#000' }
  if (isScale)     return mono ? { fill: '#e9d5ff', text: '#581c87' } : { fill: '#374151', text: '#d1d5db' }
  return null
}

export default function BassFretboard({ keyInfo, currentChord, monoColor = false }) {
  const { root, mode } = keyInfo ?? {}

  if (!root) return null

  const pentaSet = new Set(getPentatonicScale(root, mode).map(n => NOTES.indexOf(n)))
  const scaleSet = new Set(getFullScale(root, mode).map(n => NOTES.indexOf(n)))
  const chordSet = currentChord
    ? new Set(getChordTones(currentChord).map(n => NOTES.indexOf(n)))
    : new Set()

  return (
    <div className="bg-panel border border-border rounded-2xl p-6">
      <p className="text-sm text-gray-500 uppercase tracking-widest mb-4">
        Bass — {root} {mode}
        {currentChord && <span className="text-amber-400 ml-2">/ {currentChord}</span>}
      </p>

      <div>
        <svg
          viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
          width="100%"
          height="auto"
          style={{ display: 'block' }}
        >
          {/* Fretboard background */}
          <rect x={NUT_X} y={PAD_T - 6} width={BOARD_W - NUT_X - 4} height={3 * STRING_H + 12}
            fill="#1a120b" rx={2} />

          {/* Position marker dots (centred between strings 1–2) */}
          {FRET_MARKERS.map(f => (
            <circle key={f}
              cx={fretX(f)} cy={PAD_T + 1.5 * STRING_H}
              r={5} fill="#3a2a1a" />
          ))}
          {/* Double dot at 12 */}
          <circle cx={fretX(DOUBLE_MARKER)} cy={PAD_T + 0.5 * STRING_H} r={5} fill="#3a2a1a" />
          <circle cx={fretX(DOUBLE_MARKER)} cy={PAD_T + 2.5 * STRING_H} r={5} fill="#3a2a1a" />

          {/* Fret lines */}
          {Array.from({ length: NUM_FRETS - 1 }, (_, i) => i + 1).map(f => (
            <line key={f}
              x1={NUT_X + f * FRET_W} y1={PAD_T - 6}
              x2={NUT_X + f * FRET_W} y2={PAD_T + 3 * STRING_H + 6}
              stroke={f === DOUBLE_MARKER ? '#888' : '#4a3a2a'}
              strokeWidth={f === DOUBLE_MARKER ? 2 : 1} />
          ))}

          {/* Nut */}
          <line x1={NUT_X} y1={PAD_T - 6} x2={NUT_X} y2={PAD_T + 3 * STRING_H + 6}
            stroke="#c0b090" strokeWidth={4} />

          {/* Strings — thicker as pitch drops */}
          {STRINGS.map((s, si) => (
            <line key={si}
              x1={OPEN_X - DOT_R - 2} y1={stringY(si)}
              x2={BOARD_W - 8}        y2={stringY(si)}
              stroke="#9ca3af"
              strokeWidth={s.thickness} />
          ))}

          {/* Fret numbers */}
          {[3, 5, 7, 9, 12].map(f => (
            <text key={f}
              x={fretX(f)} y={PAD_T - 10}
              textAnchor="middle" fontSize={10} fill="#6b7280"
            >{f}</text>
          ))}

          {/* String labels */}
          {STRINGS.map((s, si) => (
            <text key={si}
              x={6} y={stringY(si) + 4}
              textAnchor="middle" fontSize={10} fill="#6b7280"
            >{s.label}</text>
          ))}

          {/* Note dots */}
          {STRINGS.flatMap((str, si) =>
            Array.from({ length: NUM_FRETS }, (_, fi) => {
              const pc    = (str.root + fi) % 12
              const color = noteColor(chordSet.has(pc), pentaSet.has(pc), scaleSet.has(pc), monoColor)
              if (!color) return null

              const cx = fi === 0 ? OPEN_X : fretX(fi)
              const cy = stringY(si)

              return (
                <g key={`${si}-${fi}`}>
                  <circle cx={cx} cy={cy} r={DOT_R} fill={color.fill} />
                  <text
                    x={cx} y={cy + 4}
                    textAnchor="middle"
                    fontSize={9}
                    fontWeight="600"
                    fill={color.text}
                  >
                    {NOTES[pc]}
                  </text>
                </g>
              )
            })
          )}
        </svg>
      </div>

      <div className="mt-3 flex gap-5 text-xs text-gray-500">
        <span><span className="text-accent">●</span> Chord tone</span>
        <span style={{ color: monoColor ? '#c084fc' : '#f59e0b' }}>●</span><span> Pentatonic</span>
        <span style={{ color: monoColor ? '#e9d5ff' : '#6b7280' }}>●</span><span> Scale</span>
      </div>
    </div>
  )
}
