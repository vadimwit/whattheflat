// 2-octave mini piano keyboard showing technique notes
// Props:
//   rootPc  — root pitch class 0-11
//   lh      — array of semitone intervals above root (left hand, shown in blue)
//   rh      — array of semitone intervals above root (right hand, shown in purple)

const OCTAVES = 2
const WW = 22    // white key width
const WH = 60    // white key height
const BW = 14    // black key width
const BH = 38    // black key height

// White key pitch classes within an octave, in order
const WHITE_PCS = [0, 2, 4, 5, 7, 9, 11]  // C D E F G A B
const WHITE_NAMES = ['C','D','E','F','G','A','B']
// Black key offsets (x position relative to white key 0) and pitch classes
const BLACK_OFFSETS = [
  { pc: 1,  afterWhite: 0 },  // C#
  { pc: 3,  afterWhite: 1 },  // D#
  { pc: 6,  afterWhite: 3 },  // F#
  { pc: 8,  afterWhite: 4 },  // G#
  { pc: 10, afterWhite: 5 },  // A#
]

const TOTAL_WHITES = WHITE_PCS.length * OCTAVES  // 14
const SVG_W = WW * TOTAL_WHITES + 2
const SVG_H = WH + 24

function noteColor(interval) {
  // interval < 12 → first octave (root region), ≥12 → second octave
  return interval < 12 ? '#a855f7' : '#c084fc'
}

function handLabel(hand) {
  return hand === 'L' ? 'LH' : 'RH'
}

export default function MiniPiano({ rootPc, lh = [], rh = [] }) {
  // Build a set of highlighted notes: pc → { hand, interval }
  // We span 2 octaves (semitones 0…23 above root), mapped to absolute pitch classes
  const highlights = new Map()  // absIdx → { color, label }

  function addNotes(intervals, hand) {
    for (const iv of intervals) {
      const octave = Math.floor(iv / 12)
      const pc = (rootPc + iv) % 12
      const absIdx = octave * 12 + pc  // unique index per octave slot
      highlights.set(`${octave}-${pc}`, { color: hand === 'L' ? '#3b82f6' : '#a855f7', label: handLabel(hand) })
    }
  }
  addNotes(lh, 'L')
  addNotes(rh, 'R')

  function isHighlighted(octave, pc) {
    return highlights.get(`${octave}-${pc}`)
  }

  // White keys
  const whites = []
  for (let oct = 0; oct < OCTAVES; oct++) {
    for (let wi = 0; wi < WHITE_PCS.length; wi++) {
      const pc = WHITE_PCS[wi]
      const absWi = oct * WHITE_PCS.length + wi
      const x = absWi * WW + 1
      const hl = isHighlighted(oct, pc)
      whites.push({ x, pc, oct, wi, absWi, hl, name: WHITE_NAMES[wi] + (oct + 4) })
    }
  }

  // Black keys
  const blacks = []
  for (let oct = 0; oct < OCTAVES; oct++) {
    for (const { pc, afterWhite } of BLACK_OFFSETS) {
      const absWi = oct * WHITE_PCS.length + afterWhite
      const x = absWi * WW + WW - BW / 2
      const hl = isHighlighted(oct, pc)
      blacks.push({ x, pc, oct, hl })
    }
  }

  return (
    <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="overflow-visible">
      {/* White keys */}
      {whites.map(({ x, hl, name, absWi }) => (
        <g key={`w${absWi}`}>
          <rect
            x={x} y={1} width={WW - 1} height={WH}
            rx={2}
            fill={hl ? hl.color : '#f5f5f5'}
            stroke="#374151"
            strokeWidth={0.5}
          />
          {hl && (
            <text x={x + (WW - 1) / 2} y={WH - 8}
              textAnchor="middle" fill="white" fontSize={7} fontWeight="bold">
              {hl.label}
            </text>
          )}
        </g>
      ))}

      {/* Black keys */}
      {blacks.map(({ x, pc, oct, hl }, i) => (
        <g key={`b${oct}-${pc}`}>
          <rect
            x={x} y={1} width={BW} height={BH}
            rx={2}
            fill={hl ? hl.color : '#1f2937'}
            stroke="#111827"
            strokeWidth={0.5}
          />
          {hl && (
            <text x={x + BW / 2} y={BH - 5}
              textAnchor="middle" fill="white" fontSize={6} fontWeight="bold">
              {hl.label}
            </text>
          )}
        </g>
      ))}

      {/* Root label at bottom */}
      {whites.map(({ x, pc, oct, name, absWi }) => {
        const isRoot = pc === rootPc && oct === 0
        if (!isRoot) return null
        return (
          <text key={`lbl${absWi}`} x={x + (WW - 1) / 2} y={WH + 14}
            textAnchor="middle" fill="#a855f7" fontSize={8} fontWeight="bold">
            R
          </text>
        )
      })}
    </svg>
  )
}
