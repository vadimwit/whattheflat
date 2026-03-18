import { useState, useEffect } from 'react'
import ChordBox from './ChordBox'
import MiniPiano from './MiniPiano'
import { getGuitarVoicings, getPianoTechniques, parseChord } from '../lib/voicings'
import { CHORD_TYPES, NOTES, getChordsInKey, toRomanNumeral, getSuggestedProgressions } from '../lib/theory'
import { FAMOUS_PROGRESSIONS, progressionInKey, parseChord as parseChordEd } from '../lib/education'

const CHORD_SUFFIX_OPTIONS = [
  { key: 'maj',      label: 'Major' },
  { key: 'min',      label: 'Minor' },
  { key: 'dom7',     label: '7' },
  { key: 'maj7',     label: 'maj7' },
  { key: 'min7',     label: 'm7' },
  { key: 'dim',      label: 'dim' },
  { key: 'dim7',     label: 'dim7' },
  { key: 'half_dim', label: 'm7♭5' },
  { key: 'aug',      label: 'aug' },
  { key: 'sus4',     label: 'sus4' },
  { key: 'sus2',     label: 'sus2' },
  { key: 'maj6',     label: '6' },
  { key: 'min6',     label: 'm6' },
  { key: 'add9',     label: 'add9' },
]

function chordDisplayName(root, typeKey) {
  const type = CHORD_TYPES[typeKey]
  if (!type) return root
  return root + type.suffix
}

function GuitarTab({ chordName }) {
  const voicings = getGuitarVoicings(chordName)
  if (!voicings.length) {
    return <p className="text-gray-500 text-sm text-center py-8">No guitar voicings found for {chordName}.</p>
  }
  return (
    <div>
      <p className="text-xs text-gray-500 mb-4">
        Click any voicing to learn it. Purple = chord tones. Finger numbers inside dots (1=index, 4=pinky).
        Barre chords show the fret number on the left.
      </p>
      <div className="flex flex-wrap gap-6 justify-start">
        {voicings.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-surface border border-border hover:border-accent/40 transition-colors">
            <ChordBox
              frets={v.frets}
              fingers={v.fingers}
              barre={v.barre}
              baseFret={v.baseFret}
            />
            <p className="text-[11px] text-gray-400 text-center mt-1 max-w-[120px] leading-tight">{v.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 rounded-lg bg-surface border border-border">
        <p className="text-xs text-gray-500">
          <span className="text-accent font-semibold">Pro tip:</span> Learn the E-shape and A-shape barres first
          — they cover all 12 roots. Then add open voicings for the keys you play in most.
          High-fret voicings (above fret 7) work great as jazz comping shapes in a band mix.
        </p>
      </div>
    </div>
  )
}

function PianoTab({ chordName }) {
  const parsed = parseChord(chordName)
  const techniques = getPianoTechniques(chordName)
  const rootPc = parsed?.rootPc ?? 0

  if (!techniques.length) {
    return <p className="text-gray-500 text-sm text-center py-8">No piano techniques for {chordName}.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-gray-500">
        <span className="text-blue-400 font-semibold">Blue = Left hand</span> &nbsp;·&nbsp;
        <span className="text-accent font-semibold">Purple = Right hand</span> &nbsp;·&nbsp;
        R marks the root.
      </p>
      {techniques.map((t, i) => (
        <div key={i} className="p-4 rounded-xl bg-surface border border-border hover:border-accent/30 transition-colors">
          <div className="flex flex-col lg:flex-row gap-4 items-start">
            <div className="shrink-0 overflow-x-auto">
              <MiniPiano rootPc={rootPc} lh={t.lh} rh={t.rh} />
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <h3 className="font-bold text-white text-sm">{t.name}</h3>
              <p className="text-gray-400 text-xs">{t.desc}</p>
              <p className="text-xs text-amber-400/80 mt-1">
                <span className="text-amber-400 font-semibold">Tip:</span> {t.tip}
              </p>
              <div className="flex gap-3 mt-1 text-xs text-gray-600">
                {t.lh.length > 0 && (
                  <span className="text-blue-400">LH: {t.lh.map(iv => {
                    const n = NOTES[(rootPc + iv) % 12]
                    return iv === 0 ? `${n} (root)` : n
                  }).join(', ')}</span>
                )}
                {t.rh.length > 0 && (
                  <span className="text-accent">RH: {t.rh.map(iv => {
                    const n = NOTES[(rootPc + iv) % 12]
                    return n
                  }).join(', ')}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ChordQuickPick({ label, chords, active, keyInfo, onSelect }) {
  if (!chords.length) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] text-gray-600 uppercase tracking-wider shrink-0 w-20">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {chords.map(chord => {
          const rn = keyInfo?.root ? toRomanNumeral(chord, keyInfo.root, keyInfo.mode) : ''
          return (
            <button key={chord}
              onClick={() => onSelect(chord)}
              className={`flex flex-col items-center px-2.5 py-1 rounded-lg border text-xs font-bold transition-all ${
                active === chord
                  ? 'bg-accent border-accent text-white'
                  : 'bg-surface border-border text-gray-300 hover:border-accent/50 hover:text-white'
              }`}>
              <span>{chord}</span>
              {rn && <span className="text-[9px] font-normal opacity-60 leading-none">{rn}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Progressions sub-tab ─────────────────────────────────────────────────────
// Determine whether a chord type is major-ish or minor-ish for matching
const MAJOR_TYPES = new Set(['maj','maj7','maj6','add9','sus4','sus2','aug','dom7'])
const MINOR_TYPES = new Set(['min','min7','min6','half_dim','dim','dim7'])

function isMajorType(t) { return MAJOR_TYPES.has(t) }
function isMinorType(t) { return MINOR_TYPES.has(t) }

function ProgressionsSubTab({ chordName, onChordClick }) {
  const parsed = parseChord(chordName)
  if (!parsed) return null
  const { rootPc, type } = parsed
  const root = NOTES[rootPc]

  // Famous progressions where this chord can be the tonic (degree 0)
  const isMajor = isMajorType(type)
  const isMinor = isMinorType(type)
  const tonicProgs = FAMOUS_PROGRESSIONS.filter(p => {
    const q0 = p.qualities[0]
    if (isMajor && isMajorType(q0)) return true
    if (isMinor && isMinorType(q0)) return true
    return false
  })

  // Genre-based suggestions from theory.js
  const genreProgs = getSuggestedProgressions(root, isMajor ? 'major' : 'minor')

  // Roles this chord plays in other keys
  const ROLES = []
  for (let keyPc = 0; keyPc < 12; keyPc++) {
    for (const mode of ['major', 'minor']) {
      const diatonicChords = getChordsInKey(NOTES[keyPc], mode)
      const idx = diatonicChords.indexOf(chordName)
      if (idx !== -1) {
        const rn = toRomanNumeral(chordName, NOTES[keyPc], mode)
        ROLES.push({ keyRoot: NOTES[keyPc], mode, rn, diatonicChords })
        break
      }
    }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Famous progressions starting from this chord ── */}
      <div>
        <p className="text-[11px] uppercase tracking-wider text-gray-600 mb-3">
          Famous progressions — {chordName} as tonic
        </p>
        {tonicProgs.length === 0 && (
          <p className="text-gray-600 text-sm">No exact matches — try a major or minor chord.</p>
        )}
        <div className="flex flex-col gap-3">
          {tonicProgs.slice(0, 6).map(prog => {
            const chordsHere = progressionInKey(prog, root)
            return (
              <div key={prog.id} className="p-3 bg-surface border border-border rounded-xl hover:border-accent/30 transition-colors">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="font-bold text-white text-sm">{prog.name}</span>
                  <span className="text-[10px] font-mono text-gray-500">{prog.pattern}</span>
                  {prog.genre.map(g => (
                    <span key={g} className="px-1.5 py-0.5 bg-accent/10 border border-accent/20 rounded text-[10px] text-accent">{g}</span>
                  ))}
                </div>
                {/* Chord sequence */}
                <div className="flex flex-wrap gap-1.5 items-center mb-2">
                  {chordsHere.map((c, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <button
                        onClick={() => onChordClick?.(c)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-sm border transition-all ${
                          i === 0
                            ? 'bg-accent border-accent text-white'
                            : 'bg-panel border-border text-gray-200 hover:border-accent/50 hover:text-accent'
                        }`}
                        title={`Voicings for ${c}`}
                      >
                        {c}
                      </button>
                      {i < chordsHere.length - 1 && <span className="text-gray-700 text-xs">→</span>}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 leading-snug">{prog.description}</p>
                {prog.songs[0] && (
                  <p className="text-[11px] text-gray-600 mt-1">e.g. {prog.songs.slice(0, 3).join(' · ')}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Genre-based next-chord suggestions ── */}
      {genreProgs.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wider text-gray-600 mb-3">
            Genre suggestions — starting from {chordName}
          </p>
          <div className="flex flex-col gap-2">
            {genreProgs.slice(0, 6).map((prog, pi) => (
              <div key={pi} className="flex items-center gap-2 p-2 bg-surface border border-border rounded-lg flex-wrap">
                <span className="text-[10px] font-bold text-gray-500 w-14 shrink-0">{prog.genre}</span>
                <div className="flex gap-1.5 flex-wrap items-center">
                  {prog.chords.map((c, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <button
                        onClick={() => onChordClick?.(c)}
                        className="px-2 py-0.5 bg-panel border border-border hover:border-accent/50 rounded text-xs font-bold text-gray-200 hover:text-accent transition-all"
                        title={`Voicings for ${c}`}
                      >
                        {c}
                      </button>
                      {i < prog.chords.length - 1 && <span className="text-gray-700 text-[10px]">→</span>}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] text-gray-600 font-mono ml-1">{prog.rn?.join(' – ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Roles this chord plays ── */}
      {ROLES.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wider text-gray-600 mb-3">
            {chordName} appears in these keys
          </p>
          <div className="flex flex-wrap gap-2">
            {ROLES.slice(0, 8).map(({ keyRoot, mode, rn, diatonicChords }) => (
              <div key={`${keyRoot}-${mode}`}
                className="px-3 py-2 bg-surface border border-border rounded-xl text-xs flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white">{keyRoot}</span>
                  <span className="text-gray-500 capitalize">{mode}</span>
                  <span className="text-amber-400 font-bold">{rn}</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {diatonicChords.map((c, i) => (
                    <button key={i}
                      onClick={() => onChordClick?.(c)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                        c === chordName
                          ? 'bg-accent text-white'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Explore tab ──────────────────────────────────────────────────────────────
function ExploreTab({ initialChord, keyInfo, chordHistory }) {
  const parsed = parseChord(initialChord)
  const [root, setRoot]       = useState(parsed ? NOTES[parsed.rootPc] : 'C')
  const [typeKey, setTypeKey] = useState(parsed?.type ?? 'maj')
  const [subTab, setSubTab]   = useState('guitar')
  const [active, setActive]   = useState(initialChord ?? '')

  const chordName = chordDisplayName(root, typeKey)

  function selectChord(chord) {
    setActive(chord)
    const p = parseChord(chord)
    if (p) { setRoot(NOTES[p.rootPc]); setTypeKey(p.type) }
  }

  const recentChords = [...new Set([...(chordHistory ?? [])].reverse())].slice(0, 12)
  const keyChords = keyInfo?.root ? getChordsInKey(keyInfo.root, keyInfo.mode ?? 'major') : []

  return (
    <div className="flex flex-col gap-4">

      {/* ── Contextual quick-picks ── */}
      {(recentChords.length > 0 || keyChords.length > 0) && (
        <div className="flex flex-col gap-3 p-3 bg-surface border border-border rounded-xl">
          <ChordQuickPick label="History" chords={recentChords} active={active} keyInfo={keyInfo} onSelect={selectChord} />
          {keyChords.length > 0 && (
            <>
              {recentChords.length > 0 && <div className="h-px bg-border" />}
              <ChordQuickPick
                label={`${keyInfo.root} ${keyInfo.mode ?? ''}`}
                chords={keyChords} active={active} keyInfo={keyInfo} onSelect={selectChord}
              />
            </>
          )}
        </div>
      )}

      {/* ── Manual picker ── */}
      <div className="flex flex-wrap gap-2 items-center p-3 bg-surface border border-border rounded-xl">
        <span className="text-xs text-gray-500 shrink-0">Root:</span>
        <div className="flex flex-wrap gap-1">
          {NOTES.map(n => (
            <button key={n}
              onClick={() => { setRoot(n); setActive('') }}
              className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                root === n ? 'bg-accent text-white' : 'bg-border text-gray-400 hover:text-white'
              }`}>
              {n}
            </button>
          ))}
        </div>
        <div className="w-px h-4 bg-border shrink-0" />
        <span className="text-xs text-gray-500 shrink-0">Type:</span>
        <div className="relative">
          <select
            value={typeKey}
            onChange={e => { setTypeKey(e.target.value); setActive('') }}
            className="appearance-none bg-panel border border-border rounded-lg pl-2 pr-6 py-1 text-xs text-gray-200 cursor-pointer focus:outline-none focus:border-accent"
          >
            {CHORD_SUFFIX_OPTIONS.map(o => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">▾</span>
        </div>
        <div className="ml-auto text-xl font-black text-accent">{chordName}</div>
      </div>

      {/* ── Sub-tabs ── */}
      <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 overflow-x-auto">
        {[
          { key: 'guitar',       label: '🎸 Guitar' },
          { key: 'piano',        label: '🎹 Piano' },
          { key: 'progressions', label: '🎵 Progressions' },
        ].map(t => (
          <button key={t.key}
            onClick={() => setSubTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              subTab === t.key ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'guitar'       && <GuitarTab chordName={chordName} />}
      {subTab === 'piano'        && <PianoTab  chordName={chordName} />}
      {subTab === 'progressions' && <ProgressionsSubTab chordName={chordName} onChordClick={c => selectChord(c)} />}
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function ChordDetailModal({ chord, onClose, keyInfo, chordHistory }) {
  const [tab, setTab] = useState('guitar')

  // Reset tab when chord changes
  useEffect(() => { setTab('guitar') }, [chord])

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!chord) return null

  const parsed = parseChord(chord)
  const typeName = parsed ? (CHORD_SUFFIX_OPTIONS.find(o => o.key === parsed.type)?.label ?? parsed.type) : ''

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-3xl bg-panel border border-border rounded-2xl shadow-2xl mt-8 mb-8">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-3xl font-black text-accent leading-none">{chord}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{typeName} chord · tap a voicing to study it</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white transition-colors text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 px-6 pt-4">
          {[
            { key: 'guitar',  label: '🎸 Guitar Voicings' },
            { key: 'piano',   label: '🎹 Piano Techniques' },
            { key: 'explore', label: '🔍 Explore Any Chord' },
          ].map(t => (
            <button key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-t-xl text-sm font-semibold transition-all border-b-2 ${
                tab === t.key
                  ? 'text-accent border-accent bg-accent/10'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {tab === 'guitar'  && <GuitarTab chordName={chord} />}
          {tab === 'piano'   && <PianoTab  chordName={chord} />}
          {tab === 'explore' && <ExploreTab initialChord={chord} keyInfo={keyInfo} chordHistory={chordHistory} />}
        </div>

      </div>
    </div>
  )
}
