import { useState } from 'react'
import ChordBox from './ChordBox'
import MiniPiano from './MiniPiano'
import { getGuitarVoicings, getPianoTechniques, parseChord } from '../lib/voicings'
import { CHORD_TYPES, NOTES, getChordsInKey, toRomanNumeral } from '../lib/theory'
import { FAMOUS_PROGRESSIONS, progressionInKey } from '../lib/education'

const CHORD_TYPE_OPTIONS = [
  { key: 'maj',      label: 'Major'  },
  { key: 'min',      label: 'Minor'  },
  { key: 'dom7',     label: '7'      },
  { key: 'maj7',     label: 'maj7'   },
  { key: 'min7',     label: 'm7'     },
  { key: 'dim',      label: 'dim'    },
  { key: 'dim7',     label: 'dim7'   },
  { key: 'half_dim', label: 'm7♭5'   },
  { key: 'aug',      label: 'aug'    },
  { key: 'sus4',     label: 'sus4'   },
  { key: 'sus2',     label: 'sus2'   },
  { key: 'maj6',     label: '6'      },
  { key: 'min6',     label: 'm6'     },
  { key: 'add9',     label: 'add9'   },
]

const MAJOR_TYPES = new Set(['maj','maj7','maj6','add9','sus4','sus2','aug','dom7'])

// ─── Quick-pick chip row ──────────────────────────────────────────────────────
function ChipRow({ label, chords, active, keyInfo, onSelect }) {
  if (!chords?.length) return null
  return (
    <div className="flex items-start gap-2 flex-wrap">
      <span className="text-[10px] uppercase tracking-wider text-gray-600 w-16 pt-1 shrink-0">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {chords.map(chord => {
          const rn = keyInfo?.root ? toRomanNumeral(chord, keyInfo.root, keyInfo.mode) : ''
          return (
            <button key={chord} onClick={() => onSelect(chord)}
              className={`flex flex-col items-center px-2.5 py-1 rounded-lg border text-xs font-bold transition-all ${
                active === chord
                  ? 'bg-accent border-accent text-white'
                  : 'bg-surface border-border text-gray-300 hover:border-accent/50 hover:text-accent'
              }`}>
              <span>{chord}</span>
              {rn && <span className="text-[9px] font-normal opacity-60 leading-none mt-0.5">{rn}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Guitar voicings grid ─────────────────────────────────────────────────────
function GuitarGrid({ chordName }) {
  const voicings = getGuitarVoicings(chordName)
  if (!voicings.length) return <p className="text-gray-600 text-sm py-4">No voicings for {chordName}.</p>
  return (
    <div>
      <div className="flex flex-wrap gap-4">
        {voicings.map((v, i) => (
          <div key={i} className="flex flex-col items-center p-3 rounded-xl bg-surface border border-border hover:border-accent/30 transition-colors">
            <ChordBox frets={v.frets} fingers={v.fingers} barre={v.barre} baseFret={v.baseFret} />
            <p className="text-[11px] text-gray-500 text-center mt-1 max-w-[110px] leading-tight">{v.label}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-700 mt-3">
        Purple = chord tone · finger numbers inside dots (1=index 4=pinky) · fret number on left if not starting at fret 1
      </p>
    </div>
  )
}

// ─── Piano techniques grid ────────────────────────────────────────────────────
function PianoGrid({ chordName }) {
  const parsed = parseChord(chordName)
  const techniques = getPianoTechniques(chordName)
  const rootPc = parsed?.rootPc ?? 0
  if (!techniques.length) return <p className="text-gray-600 text-sm py-4">No techniques for {chordName}.</p>
  return (
    <div className="flex flex-col gap-3">
      {techniques.map((t, i) => (
        <div key={i} className="flex flex-col lg:flex-row gap-3 p-3 bg-surface border border-border rounded-xl hover:border-accent/30 transition-colors">
          <div className="shrink-0 overflow-x-auto">
            <MiniPiano rootPc={rootPc} lh={t.lh} rh={t.rh} />
          </div>
          <div className="flex flex-col gap-1 min-w-0 justify-center">
            <p className="font-bold text-white text-sm">{t.name}</p>
            <p className="text-gray-400 text-xs">{t.desc}</p>
            <p className="text-xs text-amber-400/80 mt-0.5">
              <span className="text-amber-400 font-semibold">Tip:</span> {t.tip}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Famous progressions using this chord as tonic ───────────────────────────
function ProgressionCards({ chordName, onChordClick }) {
  const parsed = parseChord(chordName)
  if (!parsed) return null
  const { rootPc, type } = parsed
  const root = NOTES[rootPc]
  const isMajor = MAJOR_TYPES.has(type)

  const matching = FAMOUS_PROGRESSIONS.filter(p => {
    const q0 = p.qualities[0]
    return isMajor ? MAJOR_TYPES.has(q0) : !MAJOR_TYPES.has(q0)
  }).slice(0, 6)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-gray-500">
        Famous progressions with <span className="text-accent font-bold">{chordName}</span> as the tonic.
        Click any chord to see its voicings.
      </p>
      {matching.map(prog => {
        const chordsHere = progressionInKey(prog, root)
        return (
          <div key={prog.id} className="p-3 bg-surface border border-border rounded-xl">
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <span className="font-bold text-white text-sm">{prog.name}</span>
              <span className="text-[10px] font-mono text-gray-600">{prog.pattern}</span>
              {prog.genre.slice(0, 2).map(g => (
                <span key={g} className="px-1.5 py-0.5 bg-accent/10 border border-accent/20 rounded text-[10px] text-accent">{g}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 items-center mb-2">
              {chordsHere.map((c, i) => (
                <span key={i} className="flex items-center gap-1">
                  <button onClick={() => onChordClick?.(c)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-sm border transition-all ${
                      i === 0
                        ? 'bg-accent border-accent text-white'
                        : 'bg-panel border-border text-gray-200 hover:border-accent/50 hover:text-accent'
                    }`}>
                    {c}
                  </button>
                  {i < chordsHere.length - 1 && <span className="text-gray-700 text-xs">→</span>}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-600 leading-snug">{prog.description}</p>
            {prog.songs.length > 0 && (
              <p className="text-[11px] text-gray-700 mt-1">{prog.songs.slice(0, 3).join(' · ')}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────
export default function ExplorePanel({ keyInfo, chordHistory, onChordClick }) {
  const [open, setOpen] = useState(false)
  const [root, setRoot]       = useState('C')
  const [typeKey, setTypeKey] = useState('maj')
  const [view, setView]       = useState('guitar')   // guitar | piano | progressions
  const [active, setActive]   = useState('')

  const chordName = root + (CHORD_TYPES[typeKey]?.suffix ?? '')

  function selectChord(chord) {
    setActive(chord)
    const p = parseChord(chord)
    if (p) { setRoot(NOTES[p.rootPc]); setTypeKey(p.type) }
  }

  // Context-aware quick-picks
  const recentChords  = [...new Set([...(chordHistory ?? [])].reverse())].slice(0, 12)
  const keyChords     = keyInfo?.root ? getChordsInKey(keyInfo.root, keyInfo.mode ?? 'major') : []

  return (
    <div className="mb-3 bg-panel border border-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-all">
        <span>EXPLORE ANY CHORD</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-border p-4 flex flex-col gap-4">

          {/* ── Context quick-picks ── */}
          {(recentChords.length > 0 || keyChords.length > 0) && (
            <div className="flex flex-col gap-2.5 p-3 bg-surface border border-border rounded-xl">
              <ChipRow label="History" chords={recentChords} active={active} keyInfo={keyInfo} onSelect={selectChord} />
              {keyChords.length > 0 && recentChords.length > 0 && <div className="h-px bg-border" />}
              {keyChords.length > 0 && (
                <ChipRow
                  label={keyInfo.root + ' ' + (keyInfo.mode ?? '')}
                  chords={keyChords} active={active} keyInfo={keyInfo} onSelect={selectChord}
                />
              )}
            </div>
          )}

          {/* ── Manual chord picker ── */}
          <div className="flex flex-wrap gap-2 items-center p-3 bg-surface border border-border rounded-xl">
            <div className="flex flex-wrap gap-1">
              {NOTES.map(n => (
                <button key={n} onClick={() => { setRoot(n); setActive('') }}
                  className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                    root === n ? 'bg-accent text-white' : 'bg-border text-gray-400 hover:text-white'
                  }`}>
                  {n}
                </button>
              ))}
            </div>
            <div className="w-px h-5 bg-border shrink-0" />
            <div className="relative">
              <select value={typeKey} onChange={e => { setTypeKey(e.target.value); setActive('') }}
                className="appearance-none bg-panel border border-border rounded-lg pl-2 pr-6 py-1 text-xs text-gray-200 cursor-pointer focus:outline-none focus:border-accent">
                {CHORD_TYPE_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
              <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▾</span>
            </div>
            <div className="text-2xl font-black text-accent ml-2">{chordName}</div>
          </div>

          {/* ── View tabs ── */}
          <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 w-fit">
            {[
              { key: 'guitar',       label: '🎸 Guitar Voicings' },
              { key: 'piano',        label: '🎹 Piano Techniques' },
              { key: 'progressions', label: '🎵 Progressions' },
            ].map(t => (
              <button key={t.key} onClick={() => setView(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  view === t.key ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Content ── */}
          {view === 'guitar'       && <GuitarGrid       chordName={chordName} />}
          {view === 'piano'        && <PianoGrid         chordName={chordName} />}
          {view === 'progressions' && <ProgressionCards  chordName={chordName} onChordClick={c => { selectChord(c); onChordClick?.(c) }} />}

        </div>
      )}
    </div>
  )
}
