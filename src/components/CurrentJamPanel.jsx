import { useState } from 'react'
import ChordBox from './ChordBox'
import RiffDiagram from './RiffDiagram'
import { getGuitarVoicings, parseChord } from '../lib/voicings'
import { CHORD_TYPES, NOTES, toRomanNumeral } from '../lib/theory'
import { findSimilarProgressions, progressionInKey } from '../lib/education'

// ─── Scale ideas per mode ─────────────────────────────────────────────────────
const SCALE_IDEAS = {
  major: [
    { name: 'Major Pentatonic', intervals: '1–2–3–5–6',         scaleIntervals: [0,2,4,7,9],          desc: 'Safe and bright. Everything you play will land. Start on the root, end on the root.' },
    { name: 'Mixolydian',       intervals: '1–2–3–4–5–6–♭7',    scaleIntervals: [0,2,4,5,7,9,10],     desc: 'Major with a bluesy ♭7. The defining sound of classic rock — Sweet Home Alabama lives here.' },
    { name: 'Lydian',           intervals: '1–2–3–♯4–5–6–7',    scaleIntervals: [0,2,4,6,7,9,11],     desc: 'Dreamy and floating. The ♯4 is the magic note — use it on long sustained notes for instant wonder.' },
  ],
  minor: [
    { name: 'Minor Pentatonic', intervals: '1–♭3–4–5–♭7',       scaleIntervals: [0,3,5,7,10],         desc: 'The blues box. Bends on ♭3 and slides to 5 are gold. Start here every time.' },
    { name: 'Natural Minor',    intervals: '1–2–♭3–4–5–♭6–♭7',  scaleIntervals: [0,2,3,5,7,8,10],     desc: 'Full Aeolian scale. Melodic and dark. The ♭6 gives it a cinematic quality.' },
    { name: 'Dorian',           intervals: '1–2–♭3–4–5–6–♭7',   scaleIntervals: [0,2,3,5,7,9,10],     desc: "Minor with a raised 6th — smooth and soulful. Santana's go-to. That major 6th is everything." },
  ],
  dorian: [
    { name: 'Dorian Mode',      intervals: '1–2–♭3–4–5–6–♭7',   scaleIntervals: [0,2,3,5,7,9,10],     desc: "The raised 6th over minor is the colour. Mix freely with minor pentatonic and touch that 6th note." },
    { name: 'Minor Pentatonic', intervals: '1–♭3–4–5–♭7',       scaleIntervals: [0,3,5,7,10],         desc: 'Safe backbone in Dorian. You can ignore the 6th — or highlight it for that Dorian sparkle.' },
    { name: 'Blues Scale',      intervals: '1–♭3–4–♭5–5–♭7',    scaleIntervals: [0,3,5,6,7,10],       desc: 'Add the ♭5 passing tone through the 5 — that slide is the essence of blues expression.' },
  ],
  mixolydian: [
    { name: 'Mixolydian Mode',  intervals: '1–2–3–4–5–6–♭7',    scaleIntervals: [0,2,4,5,7,9,10],     desc: 'The ♭7 is your signature note. Hit it and slide down — instant swagger.' },
    { name: 'Major Pentatonic', intervals: '1–2–3–5–6',         scaleIntervals: [0,2,4,7,9],          desc: 'Works beautifully over the I chord. Clean and reliable when you need to land safely.' },
    { name: 'Blues Scale',      intervals: '1–♭3–3–4–5–♭7',     scaleIntervals: [0,3,4,5,7,10],       desc: 'The hybrid blues scale. Bend the ♭3 up to the 3 — that tension and release is everything.' },
  ],
  phrygian: [
    { name: 'Phrygian Mode',    intervals: '1–♭2–♭3–4–5–♭6–♭7', scaleIntervals: [0,1,3,5,7,8,10],     desc: 'That ♭2 is the spine-chilling note. Lean on it. Spanish fire and metal darkness in one scale.' },
    { name: 'Phrygian Dominant',intervals: '1–♭2–3–4–5–♭6–♭7',  scaleIntervals: [0,1,4,5,7,8,10],     desc: 'Raise the ♭3 to a major 3rd. Flamenco and Middle-Eastern intensity. Dramatic every time.' },
    { name: 'Minor Pentatonic', intervals: '1–♭3–4–5–♭7',       scaleIntervals: [0,3,5,7,10],         desc: 'Avoid the ♭2 and play safe pentatonic runs — then hit the ♭2 as a surprise.' },
  ],
  lydian: [
    { name: 'Lydian Mode',      intervals: '1–2–3–♯4–5–6–7',    scaleIntervals: [0,2,4,6,7,9,11],     desc: 'Float on the ♯4. John Williams writes entire film scores in Lydian. Sustain everything.' },
    { name: 'Major Pentatonic', intervals: '1–2–3–5–6',         scaleIntervals: [0,2,4,7,9],          desc: 'The reliable base. Use Lydian mode sparingly on top for colour.' },
    { name: 'Lydian Dominant',  intervals: '1–2–3–♯4–5–6–♭7',   scaleIntervals: [0,2,4,6,7,9,10],     desc: 'Lydian with a ♭7 — the jazz/fusion ♯4 chord sound. Herbie Hancock territory.' },
  ],
}

// Fallback
const SCALE_FALLBACK = SCALE_IDEAS.major

// ─── Style variations for a progression ──────────────────────────────────────
const STYLE_VARIATIONS = [
  {
    key:     'open',
    label:   'Open & Spacious',
    desc:    'Sus2 and add9 voicings — airy, gentle. Great for quiet intros and ambient sections.',
    typeMap: { maj: 'sus2', min: 'sus2', dom7: 'sus4', maj7: 'add9', min7: 'sus2', add9: 'sus2', sus4: 'sus4', sus2: 'sus2', dim: 'dim', aug: 'aug', half_dim: 'half_dim', maj6: 'sus2', min6: 'sus2' },
    color:   'text-blue-400',
    border:  'border-blue-900/40',
  },
  {
    key:     'jazz',
    label:   'Jazz Upgrade',
    desc:    'Triads → 7ths — instant sophistication. Works at any tempo, in any band context.',
    typeMap: { maj: 'maj7', min: 'min7', dom7: 'dom7', add9: 'maj7', sus2: 'sus2', sus4: 'sus4', dim: 'dim7', aug: 'aug', half_dim: 'half_dim', maj6: 'maj6', min6: 'min6' },
    color:   'text-amber-400',
    border:  'border-amber-900/40',
  },
  {
    key:     'blues',
    label:   'Blues Stomp',
    desc:    'Everything → dom7. Gritty, raw, powerful. All three chords want to slide and bend.',
    typeMap: { maj: 'dom7', min: 'dom7', maj7: 'dom7', min7: 'dom7', add9: 'dom7', sus2: 'dom7', sus4: 'dom7', dim: 'dim7', aug: 'aug', half_dim: 'dom7', maj6: 'dom7', min6: 'dom7' },
    color:   'text-red-400',
    border:  'border-red-900/40',
  },
  {
    key:     'modern',
    label:   'Neo-Soul / Modern',
    desc:    "Add9 on majors, m7 on minors. D'Angelo, Thundercat, Childish Gambino territory.",
    typeMap: { maj: 'add9', min: 'min7', dom7: 'dom7', maj7: 'add9', min7: 'min7', add9: 'add9', sus2: 'sus2', sus4: 'sus4', dim: 'dim', aug: 'aug', half_dim: 'half_dim', maj6: 'add9', min6: 'min7' },
    color:   'text-purple-400',
    border:  'border-purple-900/40',
  },
]

// Transform a chord via a type map
function transformChord(chordStr, typeMap) {
  const p = parseChord(chordStr)
  if (!p) return chordStr
  const newType = typeMap[p.type] ?? p.type
  return NOTES[p.rootPc] + (CHORD_TYPES[newType]?.suffix ?? '')
}

// Get best voicings for a chord — prefer open shapes, then low-fret barre
function getBestVoicings(chordStr, max = 4) {
  const all = getGuitarVoicings(chordStr)
  // Sort: open shapes first (label contains "Open"), then barre
  const open  = all.filter(v => v.label.includes('Open'))
  const barre = all.filter(v => !v.label.includes('Open'))
  return [...open, ...barre].slice(0, max)
}

// ─── Per-chord voicing strip ──────────────────────────────────────────────────
function ChordStrip({ chordStr, keyInfo, onChordClick }) {
  const voicings = getBestVoicings(chordStr, 4)
  const rn = keyInfo?.root ? toRomanNumeral(chordStr, keyInfo.root, keyInfo.mode) : ''
  return (
    <div className="flex flex-col gap-2 p-3 bg-surface border border-border rounded-xl">
      <div className="flex items-center gap-2">
        <button onClick={() => onChordClick?.(chordStr)}
          className="px-3 py-1 bg-accent/10 border border-accent/40 rounded-lg font-black text-lg text-accent hover:bg-accent/20 transition-colors">
          {chordStr}
        </button>
        {rn && <span className="text-amber-400 text-sm font-semibold">{rn}</span>}
        <span className="text-[11px] text-gray-600 ml-auto">click for all voicings</span>
      </div>
      {voicings.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {voicings.map((v, i) => (
            <div key={i} className="flex flex-col items-center">
              <ChordBox frets={v.frets} fingers={v.fingers} barre={v.barre} baseFret={v.baseFret} />
              <p className="text-[10px] text-gray-600 text-center mt-1 max-w-[100px]">{v.label}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-xs">No voicings available.</p>
      )}
    </div>
  )
}

// ─── Style variation section ──────────────────────────────────────────────────
function StyleSection({ progression, onChordClick }) {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="flex flex-col gap-2">
      {STYLE_VARIATIONS.map(style => {
        const isOpen = expanded === style.key
        const transformed = progression.map(c => transformChord(c, style.typeMap))

        return (
          <div key={style.key} className={`border rounded-xl overflow-hidden transition-colors ${style.border} hover:border-opacity-70`}>
            <button onClick={() => setExpanded(isOpen ? null : style.key)}
              className="w-full flex items-center justify-between px-4 py-3 text-left">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-sm ${style.color}`}>{style.label}</span>
                  <div className="flex gap-1">
                    {transformed.map((c, i) => (
                      <span key={i} className="text-xs font-bold text-gray-300">{c}{i < transformed.length - 1 ? ' →' : ''}</span>
                    ))}
                  </div>
                </div>
                <span className="text-[11px] text-gray-500">{style.desc}</span>
              </div>
              <span className="text-gray-600 shrink-0 ml-3">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <div className="border-t border-border/50 px-4 py-4">
                <div className="flex flex-wrap gap-4">
                  {transformed.map((c, i) => {
                    const voicings = getBestVoicings(c, 2)
                    return (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <button onClick={() => onChordClick?.(c)}
                          className="px-2 py-0.5 bg-panel border border-border hover:border-accent/50 rounded-lg font-bold text-sm text-gray-200 hover:text-accent transition-all">
                          {c}
                        </button>
                        <div className="flex gap-2">
                          {voicings.map((v, vi) => (
                            <div key={vi} className="flex flex-col items-center">
                              <ChordBox frets={v.frets} fingers={v.fingers} barre={v.barre} baseFret={v.baseFret} />
                              <p className="text-[9px] text-gray-700 text-center mt-0.5 max-w-[90px]">{v.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Similar famous progressions ─────────────────────────────────────────────
function SimilarSection({ progression, keyInfo, onChordClick }) {
  const similar = findSimilarProgressions(progression, keyInfo)
  if (!similar.length) return (
    <p className="text-gray-600 text-sm text-center py-3">Play more and lock a key — similar progressions will appear here.</p>
  )
  return (
    <div className="flex flex-col gap-2">
      {similar.slice(0, 3).map(prog => {
        const chordsHere = keyInfo?.root ? progressionInKey(prog, keyInfo.root) : []
        return (
          <div key={prog.id} className="p-3 bg-surface border border-border rounded-xl">
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <span className="font-bold text-white text-sm">{prog.name}</span>
              <span className="text-[10px] font-mono text-gray-600">{prog.pattern}</span>
              <span className="text-xs text-gray-600 ml-auto">{Math.round(prog.score * 100)}% match</span>
            </div>
            {chordsHere.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center mb-2">
                {chordsHere.map((c, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <button onClick={() => onChordClick?.(c)}
                      className={`px-2 py-0.5 rounded-lg font-bold text-xs border transition-all ${
                        i === 0 ? 'bg-accent border-accent text-white' : 'bg-panel border-border text-gray-300 hover:border-accent/50 hover:text-accent'
                      }`}>
                      {c}
                    </button>
                    {i < chordsHere.length - 1 && <span className="text-gray-700 text-xs">→</span>}
                  </span>
                ))}
                <span className="text-[10px] text-gray-600 ml-1">in {keyInfo?.root} {keyInfo?.mode}</span>
              </div>
            )}
            <p className="text-[11px] text-gray-600">{prog.songs.slice(0, 3).join(' · ')}</p>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────
export default function CurrentJamPanel({ keyInfo, chordHistory, detectedProgression, onChordClick }) {
  const [open, setOpen]   = useState(false)
  const [view, setView]   = useState('voicings')   // voicings | scales | styles | similar

  const { root, mode } = keyInfo ?? {}

  // Working progression: detected loop or last 4 unique chords
  const workingProgression = detectedProgression?.length
    ? detectedProgression
    : [...new Set([...chordHistory].reverse())].reverse().slice(-4)

  const scaleIdeas = SCALE_IDEAS[mode] ?? SCALE_FALLBACK
  const rootPc = root ? NOTES.indexOf(root) : null
  const hasSession = workingProgression.length > 0

  return (
    <div className="mb-3 bg-panel border border-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-all">
        <div className="flex items-center gap-3">
          <span>CURRENT JAM</span>
          {root && (
            <span className="text-[10px] px-2 py-0.5 bg-accent/10 border border-accent/30 rounded text-accent">
              {root} {mode} {detectedProgression?.length ? `· ${workingProgression.join(' → ')}` : ''}
            </span>
          )}
        </div>
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-border p-4 flex flex-col gap-4">

          {!hasSession ? (
            <p className="text-gray-600 text-sm text-center py-6">Start listening and play some chords — your jam will appear here.</p>
          ) : (
            <>
              {/* ── Progression summary ── */}
              <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-surface border border-border rounded-xl">
                {root ? (
                  <span className="text-accent font-bold text-sm">{root} {mode}</span>
                ) : (
                  <span className="text-gray-600 text-sm">Key detecting…</span>
                )}
                {workingProgression.length > 0 && (
                  <>
                    <span className="text-gray-700">·</span>
                    {workingProgression.map((c, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="text-gray-300 font-bold text-sm">{c}</span>
                        {root && <span className="text-amber-400/60 text-[10px]">{toRomanNumeral(c, root, mode)}</span>}
                        {i < workingProgression.length - 1 && <span className="text-gray-700">→</span>}
                      </span>
                    ))}
                  </>
                )}
              </div>

              {/* ── View tabs ── */}
              <div className="flex gap-1 bg-surface border border-border rounded-xl p-1 overflow-x-auto">
                {[
                  { key: 'voicings', label: '🎸 Open Voicings' },
                  { key: 'scales',   label: '🎵 Scales to Solo' },
                  { key: 'styles',   label: '🎨 Style Options' },
                  { key: 'similar',  label: '🔗 Similar Progressions' },
                ].map(t => (
                  <button key={t.key} onClick={() => setView(t.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      view === t.key ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── Voicings: per chord open shapes ── */}
              {view === 'voicings' && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-gray-500">
                    Best open and barre voicings for each chord in your jam. Click a chord name to see all its voicings.
                  </p>
                  {workingProgression.map(chord => (
                    <ChordStrip key={chord} chordStr={chord} keyInfo={keyInfo} onChordClick={onChordClick} />
                  ))}
                </div>
              )}

              {/* ── Scales ── */}
              {view === 'scales' && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-gray-500">
                    Scales and modes that fit {root ? `${root} ${mode}` : 'your current key'}.
                    Start with the pentatonic — add the extra notes once you feel comfortable.
                  </p>
                  {scaleIdeas.map(idea => (
                    <div key={idea.name} className="p-3 bg-surface border border-border rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-white text-sm">{idea.name}</span>
                        <span className="font-mono text-xs text-accent">{idea.intervals}</span>
                      </div>
                      {rootPc !== null && idea.scaleIntervals && (
                        <div className="mb-2 overflow-x-auto">
                          <RiffDiagram rootPc={rootPc} scaleIntervals={idea.scaleIntervals} />
                          <p className="text-[10px] text-gray-600 mt-1">
                            Purple = root · Grey = scale tone · Fret numbers above
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 leading-snug">{idea.desc}</p>
                    </div>
                  ))}
                  <p className="text-[11px] text-gray-700 text-center">
                    Pro tip: always resolve to a chord tone at the end of a phrase — ♭7 leading to root, or 3rd landing on the 1.
                  </p>
                </div>
              )}

              {/* ── Style options ── */}
              {view === 'styles' && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-gray-500">
                    Your progression re-voiced four ways. Expand any style to see the chord boxes.
                  </p>
                  <StyleSection progression={workingProgression} onChordClick={onChordClick} />
                </div>
              )}

              {/* ── Similar progressions ── */}
              {view === 'similar' && (
                <SimilarSection progression={workingProgression} keyInfo={keyInfo} onChordClick={onChordClick} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
