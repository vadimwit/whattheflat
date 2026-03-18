// ─── Mini fretboard scale diagram ─────────────────────────────────────────────
// Shows a 6-string × 5-fret window of scale tones.
// Root notes → purple fill. Scale tones → dark grey fill.
// Strings: top = s6 (low E), bottom = s1 (high e).
// Window starts at the root fret on string 6.

const OPEN_PITCHES = [4, 9, 2, 7, 11, 4]  // E A D G B e  (s6 … s1)
const FRETS = 5

export default function RiffDiagram({ rootPc, scaleIntervals = [0, 3, 5, 7, 10] }) {
  if (rootPc === undefined || rootPc === null) return null

  // Fret window starts where the root lands on s6 (low E)
  const startFret = (rootPc - OPEN_PITCHES[0] + 12) % 12

  // Which pitch classes are in the scale?
  const scaleSet = new Set(scaleIntervals.map(i => (rootPc + i) % 12))

  // Collect dots: { s (0=s6…5=s1), f (0-4 within window), isRoot }
  const dots = []
  for (let s = 0; s < 6; s++) {
    for (let f = 0; f < FRETS; f++) {
      const pc = (OPEN_PITCHES[s] + startFret + f) % 12
      if (scaleSet.has(pc)) {
        dots.push({ s, f, isRoot: pc === rootPc })
      }
    }
  }

  // SVG layout
  const W = 152, H = 70
  const mL = 6, mT = 14, mR = 6, mB = 4
  const innerW = W - mL - mR   // 140
  const innerH = H - mT - mB   // 52

  const cellW = innerW / FRETS         // 28
  const strGap = innerH / 5           // gap between 6 strings (5 gaps)

  const sx = (f) => mL + f * cellW        // left edge of fret cell
  const cx = (f) => mL + (f + 0.5) * cellW  // centre of fret cell
  const sy = (s) => mT + s * strGap         // y of string s

  return (
    <svg width={W} height={H} className="shrink-0 overflow-visible">
      {/* Fret separators (vertical lines) */}
      {Array.from({ length: FRETS + 1 }, (_, f) => (
        <line key={f}
          x1={sx(f)} y1={mT - 2}
          x2={sx(f)} y2={H - mB}
          stroke={f === 0 ? '#555' : '#2a2a2a'}
          strokeWidth={f === 0 ? 2 : 1}
        />
      ))}

      {/* String lines (horizontal) */}
      {Array.from({ length: 6 }, (_, s) => (
        <line key={s}
          x1={mL} y1={sy(s)}
          x2={W - mR} y2={sy(s)}
          stroke="#3a3a3a"
          strokeWidth={s === 0 ? 1.5 : 1}
        />
      ))}

      {/* Fret numbers above */}
      {Array.from({ length: FRETS }, (_, f) => (
        <text key={f}
          x={cx(f)} y={9}
          textAnchor="middle" fontSize={8}
          fill={f === 0 && startFret > 0 ? '#a855f7' : '#555'}
          fontWeight={f === 0 && startFret > 0 ? 'bold' : 'normal'}>
          {startFret + f === 0 ? 'O' : startFret + f}
        </text>
      ))}

      {/* Scale dots */}
      {dots.map((d, i) => (
        <circle key={i}
          cx={cx(d.f)} cy={sy(d.s)}
          r={4.5}
          fill={d.isRoot ? '#a855f7' : '#3d3d3d'}
          stroke={d.isRoot ? '#c084fc' : '#606060'}
          strokeWidth={1}
        />
      ))}

      {/* Root labels */}
      {dots.filter(d => d.isRoot).map((d, i) => (
        <text key={i}
          x={cx(d.f)} y={sy(d.s) + 3.5}
          textAnchor="middle" fontSize={6}
          fill="white" fontWeight="bold">
          R
        </text>
      ))}
    </svg>
  )
}
