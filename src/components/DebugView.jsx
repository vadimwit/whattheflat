import { getScale, getChordTones, NOTES } from '../lib/theory'

// ─── SVG Piano — 2 octaves (C3–B4) ───────────────────────────────────────────
const KEY_W   = 30
const KEY_H   = 80
const BLACK_W = 18
const BLACK_H = 50
const PIANO_W = 14 * KEY_W

const WHITE_OCT = [0, 2, 4, 5, 7, 9, 11]  // pitch classes per octave
const BLACK_OCT = [
  { pc: 1, wi: 0 }, { pc: 3, wi: 1 }, { pc: 6, wi: 3 },
  { pc: 8, wi: 4 }, { pc: 10, wi: 5 },
]
const WHITE_LABELS = ['C3','D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4']

function PianoSVG({ values, keyNotes, chordNotes, keyH = KEY_H, showPct = false }) {
  const max = Math.max(...values, 0.01)
  const wKeys = []
  const bKeys = []
  for (let oct = 0; oct < 2; oct++) {
    WHITE_OCT.forEach((pc, wi) => wKeys.push({ pc, wi: oct * 7 + wi }))
    BLACK_OCT.forEach(({ pc, wi }) => bKeys.push({ pc, wi: oct * 7 + wi }))
  }
  const svgH = keyH + 6 + (showPct ? 16 : 0)

  return (
    <svg viewBox={`0 0 ${PIANO_W} ${svgH}`} width="100%" style={{ display: 'block' }}>
      {/* White keys */}
      {wKeys.map(({ pc, wi }) => {
        const energy  = values[pc] / max
        const inChord = chordNotes?.has(pc)
        const inKey   = keyNotes?.has(pc)
        const x = wi * KEY_W
        const fillColor = inChord
          ? `rgba(167,139,250,${0.12 + energy * 0.88})`
          : inKey
          ? `rgba(251,191,36,${0.1 + energy * 0.7})`
          : `rgba(180,180,190,${0.05 + energy * 0.2})`
        const pct = showPct ? Math.round(values[pc] * 100) : 0

        return (
          <g key={`w${wi}`}>
            <rect x={x+1} y={3} width={KEY_W-2} height={keyH}
              rx={3} fill="rgb(20,20,26)" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
            {energy > 0.04 && (
              <rect
                x={x+1} y={3 + keyH * (1 - Math.min(energy, 1) * 0.85)}
                width={KEY_W-2} height={keyH * Math.min(energy, 1) * 0.85}
                rx={2} fill={fillColor} />
            )}
            <text x={x + KEY_W/2} y={keyH - 4} textAnchor="middle" fontSize={8}
              fill={inKey || inChord ? 'rgba(200,200,210,0.9)' : 'rgba(90,90,100,0.8)'}>
              {WHITE_LABELS[wi]}
            </text>
            {showPct && pct > 0 && (
              <text x={x + KEY_W/2} y={keyH + 14} textAnchor="middle" fontSize={8}
                fill={inKey ? 'rgb(251,191,36)' : 'rgba(100,100,110,0.8)'}>
                {pct}%
              </text>
            )}
          </g>
        )
      })}

      {/* Black keys */}
      {bKeys.map(({ pc, wi }, i) => {
        const energy  = values[pc] / max
        const inChord = chordNotes?.has(pc)
        const inKey   = keyNotes?.has(pc)
        const x = wi * KEY_W + KEY_W - BLACK_W / 2
        const bg = inChord
          ? `rgba(139,92,246,${0.4 + energy * 0.6})`
          : inKey
          ? `rgba(180,130,0,${0.35 + energy * 0.55})`
          : `rgba(12,12,16,0.95)`

        return (
          <g key={`b${i}`}>
            <rect x={x} y={3} width={BLACK_W} height={BLACK_H}
              rx={2} fill={bg} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            <text x={x + BLACK_W/2} y={BLACK_H - 5} textAnchor="middle" fontSize={7}
              fill={inKey || inChord ? 'rgba(210,210,220,0.85)' : 'rgba(110,110,120,0.6)'}>
              {NOTES[pc]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Mini fretboard — guitar mode chroma view ─────────────────────────────────
const STRINGS = [
  { label: 'e', root: 4 },
  { label: 'B', root: 11 },
  { label: 'G', root: 7 },
  { label: 'D', root: 2 },
  { label: 'A', root: 9 },
  { label: 'E', root: 4 },
]
const MF_NUT_X  = 22
const MF_OPEN_X = 10
const MF_FRET_W = 28
const MF_STR_H  = 16
const MF_PAD_T  = 16
const MF_PAD_B  = 8
const MF_FRETS  = 13  // frets 0–12
const MF_DOT_R  = 6
const MF_W = MF_NUT_X + (MF_FRETS - 1) * MF_FRET_W + 10
const MF_H = MF_PAD_T + 5 * MF_STR_H + MF_PAD_B

const mfFretX   = f  => MF_NUT_X + (f - 0.5) * MF_FRET_W
const mfStringY = si => MF_PAD_T + si * MF_STR_H

function MiniFretboard({ values, keyNotes, chordNotes }) {
  const max = Math.max(...values, 0.01)

  return (
    <svg viewBox={`0 0 ${MF_W} ${MF_H}`} width="100%" style={{ display: 'block' }}>
      {/* Board background */}
      <rect x={MF_NUT_X} y={MF_PAD_T - 5}
        width={MF_W - MF_NUT_X - 6} height={5 * MF_STR_H + 10}
        fill="#1a120b" rx={2} />

      {/* Fret position dots */}
      {[3, 5, 7, 9].map(f => (
        <circle key={f} cx={mfFretX(f)} cy={MF_PAD_T + 2.5 * MF_STR_H} r={3} fill="#3a2a1a" />
      ))}
      <circle cx={mfFretX(12)} cy={MF_PAD_T + 1.5 * MF_STR_H} r={3} fill="#3a2a1a" />
      <circle cx={mfFretX(12)} cy={MF_PAD_T + 3.5 * MF_STR_H} r={3} fill="#3a2a1a" />

      {/* Fret lines */}
      {Array.from({ length: MF_FRETS - 1 }, (_, i) => i + 1).map(f => (
        <line key={f}
          x1={MF_NUT_X + f * MF_FRET_W} y1={MF_PAD_T - 5}
          x2={MF_NUT_X + f * MF_FRET_W} y2={MF_PAD_T + 5 * MF_STR_H + 5}
          stroke="#4a3a2a" strokeWidth={1} />
      ))}

      {/* Nut */}
      <line x1={MF_NUT_X} y1={MF_PAD_T - 5} x2={MF_NUT_X} y2={MF_PAD_T + 5 * MF_STR_H + 5}
        stroke="#c0b090" strokeWidth={3} />

      {/* Strings */}
      {STRINGS.map((_, si) => (
        <line key={si}
          x1={MF_OPEN_X - MF_DOT_R - 2} y1={mfStringY(si)}
          x2={MF_W - 6} y2={mfStringY(si)}
          stroke="#9ca3af"
          strokeWidth={si < 2 ? 0.8 : si < 4 ? 1.2 : 1.8} />
      ))}

      {/* Fret numbers */}
      {[3, 5, 7, 9, 12].map(f => (
        <text key={f} x={mfFretX(f)} y={MF_PAD_T - 5}
          textAnchor="middle" fontSize={8} fill="#6b7280">{f}</text>
      ))}

      {/* String labels */}
      {STRINGS.map((s, si) => (
        <text key={si} x={5} y={mfStringY(si) + 3.5}
          textAnchor="middle" fontSize={9} fill="#6b7280">{s.label}</text>
      ))}

      {/* Note dots — colored by energy */}
      {STRINGS.flatMap((str, si) =>
        Array.from({ length: MF_FRETS }, (_, fi) => {
          const pc      = (str.root + fi) % 12
          const energy  = values[pc] / max
          const inChord = chordNotes?.has(pc)
          const inKey   = keyNotes?.has(pc)
          if (!inChord && !inKey && energy < 0.12) return null

          const cx = fi === 0 ? MF_OPEN_X : mfFretX(fi)
          const cy = mfStringY(si)

          let fill, textFill
          if (inChord) {
            fill = `rgba(168,85,247,${0.3 + energy * 0.7})`
            textFill = '#fff'
          } else if (inKey) {
            fill = `rgba(245,158,11,${0.2 + energy * 0.75})`
            textFill = 'rgba(0,0,0,0.85)'
          } else {
            fill = `rgba(100,100,120,${energy * 0.7})`
            textFill = 'rgba(180,180,190,0.7)'
          }

          return (
            <g key={`${si}-${fi}`}>
              {energy > 0.3 && (inChord || inKey) && (
                <circle cx={cx} cy={cy} r={MF_DOT_R + 4}
                  fill={inChord ? 'rgba(168,85,247,0.25)' : 'rgba(245,158,11,0.2)'}
                  style={{ filter: 'blur(4px)' }} />
              )}
              <circle cx={cx} cy={cy} r={MF_DOT_R} fill={fill} />
              <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize={7} fontWeight="600" fill={textFill}>
                {NOTES[pc]}
              </text>
            </g>
          )
        })
      )}
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DebugView({ chroma, chordCandidates, noteAnalysis, keyInfo, currentChord, instrument = 'guitar' }) {
  const keyPCs   = new Set(keyInfo ? getScale(keyInfo.root, keyInfo.mode).map(n => NOTES.indexOf(n)) : [])
  const chordPCs = new Set(currentChord ? getChordTones(currentChord).map(n => NOTES.indexOf(n)) : [])

  const chromaArr   = chroma       ? [...chroma]       : new Array(12).fill(0)
  const histFreq    = noteAnalysis ? noteAnalysis.freq  : new Array(12).fill(0)
  const topKeys     = noteAnalysis ? noteAnalysis.topKeys : []
  const topScore    = chordCandidates[0]?.score ?? 1
  const topKeyScore = topKeys[0]?.score ?? 1

  return (
    <div className="bg-panel border border-border rounded-2xl p-4 flex flex-col gap-4">
      <p className="text-xs text-gray-500 uppercase tracking-widest shrink-0">Behind the Scenes</p>

      {/* ── Live chroma visualization (instrument-synced) ── */}
      <div>
        <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">Live chroma — what the engine hears right now</p>
        {instrument === 'guitar'
          ? <MiniFretboard values={chromaArr} keyNotes={keyPCs} chordNotes={chordPCs} />
          : <PianoSVG values={chromaArr} keyNotes={keyPCs} chordNotes={chordPCs} keyH={90} />
        }
      </div>

      {/* ── Bottom three columns ── */}
      <div className="grid grid-cols-[2fr_1.5fr_1fr] gap-5">

        {/* Col 1: Chord candidates */}
        <div>
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">Chord candidates</p>
          <div className="flex flex-col gap-1">
            {chordCandidates.length === 0 && (
              <p className="text-gray-700 text-xs">No signal detected</p>
            )}
            {chordCandidates.map((c, i) => (
              <div
                key={c.name}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${
                  i === 0 ? 'bg-accent/10 border border-accent/25' : 'border border-transparent'
                }`}
              >
                <span className="text-xs text-gray-600 w-3 shrink-0">{i + 1}</span>
                <span className={`text-sm font-bold w-14 shrink-0 ${i === 0 ? 'text-white' : 'text-gray-400'}`}>
                  {c.name}
                </span>
                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${i === 0 ? 'bg-accent' : 'bg-gray-600'}`}
                    style={{ width: `${(c.score / topScore) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right tabular-nums">{c.score.toFixed(2)}</span>
                <div className="flex gap-1 w-14 justify-end">
                  {c.diatonic  && <span className="text-[9px] px-1 rounded bg-green-900/50 text-green-400">key</span>}
                  {c.bassBonus > 0 && <span className="text-[9px] px-1 rounded bg-blue-900/50 text-blue-400">bass</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 2: Note history piano with % labels */}
        <div>
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">Note history — key evidence</p>
          <PianoSVG values={histFreq} keyNotes={keyPCs} chordNotes={chordPCs} keyH={70} showPct={true} />
        </div>

        {/* Col 3: Key candidates */}
        <div>
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">Key match scores</p>
          <div className="flex flex-col gap-1.5">
            {topKeys.length === 0 && (
              <p className="text-gray-700 text-xs">Not enough history</p>
            )}
            {topKeys.map((k, i) => (
              <div key={`${k.root}-${k.mode}`} className="flex items-center gap-2">
                <span className={`text-xs w-16 shrink-0 ${i === 0 ? 'text-white font-semibold' : 'text-gray-500'}`}>
                  {k.root} {k.mode === 'major' ? 'maj' : 'min'}
                </span>
                <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${i === 0 ? 'bg-amber-400' : 'bg-gray-600'}`}
                    style={{ width: `${Math.max(0, (k.score / topKeyScore) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-600 tabular-nums w-8 text-right">{k.score.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
