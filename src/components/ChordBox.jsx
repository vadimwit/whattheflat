// SVG chord diagram — 6 strings × 5 visible frets
// Props:
//   frets[]   — [s6…s1]: fret number or 'x' (muted)
//   fingers[] — [s6…s1]: finger 1-4, 0 = open/barre indicator
//   barre     — { fret, fromStr, toStr } or null
//   baseFret  — which fret number is at the top of the diagram (1 = standard)
//   label     — caption below the box

const STRINGS  = 6
const ROWS     = 5          // visible frets
const SX       = 32         // left margin (open/mute indicators)
const SY       = 28         // top margin (nut / baseFret label)
const GX       = 26         // gap between strings
const GY       = 22         // gap between frets
const DOT_R    = 9          // dot radius
const W        = SX + GX * (STRINGS - 1) + 24   // total width
const H        = SY + GY * ROWS + 20            // total height

function strX(s) { return SX + (STRINGS - 1 - s) * GX }  // s=0 is s6 (low E, leftmost)
function fretY(f) { return SY + f * GY }                  // f=0 is above first fret, f=1…5 are fret centers

export default function ChordBox({ frets, fingers, barre, baseFret = 1, label }) {
  const isOpen = baseFret === 1

  // Map fret numbers to diagram row (0-indexed from top)
  function toRow(absF) {
    return absF - baseFret + 1   // fret at baseFret → row 1 (center of first fret)
  }

  // Barre bar: draw a rounded rect across strings
  function renderBarre() {
    if (!barre) return null
    const row = toRow(barre.fret)
    if (row < 1 || row > ROWS) return null
    const x1 = strX(STRINGS - barre.toStr)    // toStr is highest string number = leftmost
    const x2 = strX(STRINGS - barre.fromStr)  // fromStr is lowest string number = rightmost
    const cy = fretY(row) - GY / 2
    return (
      <rect
        key="barre"
        x={x1 - DOT_R}
        y={cy - DOT_R}
        width={x2 - x1 + DOT_R * 2}
        height={DOT_R * 2}
        rx={DOT_R}
        fill="#a855f7"
        opacity={0.9}
      />
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">

        {/* ── Nut or baseFret indicator ── */}
        {isOpen ? (
          <rect x={SX - 2} y={SY - 4} width={GX * (STRINGS - 1) + 4} height={4} rx={2} fill="#e5e7eb" />
        ) : (
          <text x={SX - 6} y={SY + GY * 0.5} textAnchor="end" dominantBaseline="middle"
            fill="#9ca3af" fontSize={10} fontFamily="monospace">
            {baseFret}
          </text>
        )}

        {/* ── Fret lines ── */}
        {Array.from({ length: ROWS + 1 }, (_, i) => (
          <line key={`fl${i}`}
            x1={SX} y1={fretY(i) - GY / 2}
            x2={SX + GX * (STRINGS - 1)} y2={fretY(i) - GY / 2}
            stroke="#374151" strokeWidth={i === 0 && isOpen ? 3 : 1}
          />
        ))}

        {/* ── String lines ── */}
        {Array.from({ length: STRINGS }, (_, s) => (
          <line key={`sl${s}`}
            x1={strX(s)} y1={SY - GY / 2}
            x2={strX(s)} y2={fretY(ROWS) - GY / 2}
            stroke="#4b5563" strokeWidth={1}
          />
        ))}

        {/* ── Barre ── */}
        {renderBarre()}

        {/* ── Dots + open/mute indicators ── */}
        {frets.map((f, s) => {
          const cx = strX(STRINGS - 1 - s)
          if (f === 'x') {
            return (
              <text key={`m${s}`} x={cx} y={SY - GY / 2 - 7}
                textAnchor="middle" fill="#6b7280" fontSize={12} fontWeight="bold">
                ×
              </text>
            )
          }
          if (f === 0) {
            return (
              <circle key={`o${s}`} cx={cx} cy={SY - GY / 2 - 7}
                r={5} fill="none" stroke="#6b7280" strokeWidth={1.5} />
            )
          }
          const row = toRow(f)
          if (row < 1 || row > ROWS) return null
          const cy = fretY(row) - GY / 2
          const finger = fingers?.[s] ?? 0
          return (
            <g key={`d${s}`}>
              <circle cx={cx} cy={cy} r={DOT_R} fill="#a855f7" />
              {finger > 0 && (
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                  fill="white" fontSize={9} fontWeight="bold">
                  {finger}
                </text>
              )}
            </g>
          )
        })}

        {/* ── String name labels ── */}
        {['e','B','G','D','A','E'].map((n, i) => (
          <text key={`sn${i}`}
            x={strX(i)} y={H - 4}
            textAnchor="middle" fill="#4b5563" fontSize={8}>
            {n}
          </text>
        ))}

      </svg>

      {label && (
        <p className="text-[11px] text-gray-400 text-center leading-tight max-w-[120px]">{label}</p>
      )}
    </div>
  )
}
