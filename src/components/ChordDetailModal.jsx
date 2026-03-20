import { useState, useEffect } from 'react'
import ChordBox from './ChordBox'
import MiniPiano from './MiniPiano'
import { getGuitarVoicings, getPianoTechniques, parseChord } from '../lib/voicings'
import { CHORD_TYPES, NOTES, getChordsInKey, toRomanNumeral, getSuggestedProgressions } from '../lib/theory'
import { FAMOUS_PROGRESSIONS, progressionInKey, getChordSubstitutions, CHORD_PLAYBOOK } from '../lib/education'

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

// ─── Theory tab ───────────────────────────────────────────────────────────────

const CHORD_THEORY = {
  maj: {
    name: 'Major',
    formula: 'Root  +  Major 3rd (4 semitones)  +  Perfect 5th (7 semitones)',
    vibe: 'Bright, happy, resolved. The most "complete" sound in Western music.',
    beginner: 'Major chords are the foundation of almost every song you know. They feel stable and uplifting — like a musical full stop.',
    tension: 'Low — very stable',
    color: 'text-yellow-400',
  },
  min: {
    name: 'Minor',
    formula: 'Root  +  Minor 3rd (3 semitones)  +  Perfect 5th (7 semitones)',
    vibe: 'Dark, melancholic, introspective. The 3rd is lowered by just one semitone — that one note changes everything.',
    beginner: 'One note separates major from minor. Minor chords carry emotion and depth — sadness, mystery, tension.',
    tension: 'Low-medium — stable but moody',
    color: 'text-blue-400',
  },
  dom7: {
    name: 'Dominant 7th',
    formula: 'Major triad  +  Minor 7th (10 semitones)',
    vibe: 'Tense, bluesy, urgent. Wants desperately to resolve to a chord a 5th lower.',
    beginner: 'The 7th chord is the engine of blues and jazz. It creates tension that begs to resolve — like holding your breath. Play G7 then C to feel it.',
    tension: 'High — strongly pulls to resolution',
    color: 'text-red-400',
  },
  maj7: {
    name: 'Major 7th',
    formula: 'Major triad  +  Major 7th (11 semitones)',
    vibe: 'Dreamy, lush, sophisticated. Jazz-infused warmth without the tension of a dominant 7th.',
    beginner: 'The major 7th is the note just below the octave. Adding it to a major chord gives you that smooth jazz-bossa nova sound — think "Autumn Leaves".',
    tension: 'Very low — ethereal and floating',
    color: 'text-purple-400',
  },
  min7: {
    name: 'Minor 7th',
    formula: 'Minor triad  +  Minor 7th (10 semitones)',
    vibe: 'Smooth, soulful, relaxed. Darker than major 7th but less tense than a dominant 7th.',
    beginner: 'Minor 7ths are everywhere in soul, R&B, and jazz. They\'re minor chords with added warmth — moody but not harsh.',
    tension: 'Low-medium — smooth and flowing',
    color: 'text-indigo-400',
  },
  dim: {
    name: 'Diminished',
    formula: 'Root  +  Minor 3rd (3 semitones)  +  Diminished 5th (6 semitones)',
    vibe: 'Dark, tense, unstable. The flattened 5th creates a tritone interval — historically called "diabolus in musica" (the devil in music).',
    beginner: 'Diminished chords are passing chords — they create maximum tension so the next chord feels like a huge relief. Like a musical cliffhanger.',
    tension: 'Very high — wants to resolve immediately',
    color: 'text-orange-400',
  },
  dim7: {
    name: 'Diminished 7th',
    formula: 'Diminished triad  +  Diminished 7th (9 semitones) — fully symmetric, all minor 3rds',
    vibe: 'Extremely tense and dramatic. Used in horror film scores and dramatic classical passages.',
    beginner: 'All four notes are equally spaced (all minor 3rds apart), making it the most symmetrical and unstable chord. Classic "villain arrives" sound.',
    tension: 'Extreme — maximum instability',
    color: 'text-red-600',
  },
  half_dim: {
    name: 'Half-Diminished (m7♭5)',
    formula: 'Diminished triad  +  Minor 7th (10 semitones)',
    vibe: 'Dark and tense but with slightly more resolution than full dim7. The "ii" chord in minor ii–V–i jazz progressions.',
    beginner: 'Half-diminished sits between a minor 7th and a fully diminished chord. It\'s the moody jazz workhorse — think the intro to "Autumn Leaves".',
    tension: 'High — tense but musical',
    color: 'text-orange-500',
  },
  aug: {
    name: 'Augmented',
    formula: 'Root  +  Major 3rd (4 semitones)  +  Augmented 5th (8 semitones) — all major 3rds',
    vibe: 'Eerie, floating, dreamlike. The raised 5th creates instability that can resolve either up or down.',
    beginner: 'Augmented chords sound like something is about to happen. They\'re often used as a passing chord between major and minor — the 5th feels like it\'s "reaching" upward.',
    tension: 'High — ambiguous direction',
    color: 'text-emerald-400',
  },
  sus4: {
    name: 'Suspended 4th',
    formula: 'Root  +  Perfect 4th (5 semitones)  +  Perfect 5th (7 semitones)',
    vibe: 'Open, unresolved, expectant. The 3rd is replaced by a 4th — neither major nor minor, just floating.',
    beginner: '"Sus" means suspended — the 3rd is suspended in mid-air. It wants to drop down to a major or minor chord. Classic rock move: sus4 → major.',
    tension: 'Medium — pleasant tension, easy on the ear',
    color: 'text-cyan-400',
  },
  sus2: {
    name: 'Suspended 2nd',
    formula: 'Root  +  Major 2nd (2 semitones)  +  Perfect 5th (7 semitones)',
    vibe: 'Airy, spacious, ambiguous. Like sus4 but lighter — the 2nd sits high above the root.',
    beginner: 'Sus2 is a favourite of modern pop and ambient music. Without a 3rd, it has no major/minor quality — it just floats. Think Sting, U2, Coldplay.',
    tension: 'Low-medium — open and spacious',
    color: 'text-teal-400',
  },
  maj6: {
    name: 'Major 6th',
    formula: 'Major triad  +  Major 6th (9 semitones)',
    vibe: 'Sweet, vintage, nostalgic. The 6th adds a note from the scale without the tension of a 7th.',
    beginner: "The 6th is a colour tone that sweetens a major chord. Common in jazz, bossa nova, and 50s pop — \"Misty\" and \"Fly Me To The Moon\" territory.",
    tension: 'Very low — sweeter than major triad',
    color: 'text-amber-300',
  },
  min6: {
    name: 'Minor 6th',
    formula: 'Minor triad  +  Major 6th (9 semitones)',
    vibe: 'Bittersweet, exotic, dramatic. A major 6th over a minor chord creates a striking contrast.',
    beginner: 'Minor 6ths have a flamenco/tango feel. The bright 6th sitting on top of a dark minor chord creates a sophisticated tension — think Django Reinhardt.',
    tension: 'Medium — intriguing contrast',
    color: 'text-amber-400',
  },
  add9: {
    name: 'Add 9',
    formula: 'Major triad  +  Major 9th (14 semitones = octave + 2)',
    vibe: 'Open, modern, slightly epic. The 9th adds colour without the smoothness of a 7th.',
    beginner: 'Add9 is the chord of modern rock and pop. Unlike maj9 (which also has a 7th), add9 keeps things clean and direct. Coldplay, Radiohead, and U2 love it.',
    tension: 'Very low — bright and open',
    color: 'text-lime-400',
  },
}

const INTERVAL_NAMES = {
  0: 'Root', 2: 'Major 2nd', 3: 'Minor 3rd', 4: 'Major 3rd',
  5: 'Perfect 4th', 6: 'Tritone (♭5)', 7: 'Perfect 5th',
  8: 'Aug 5th', 9: 'Major 6th', 10: 'Minor 7th', 11: 'Major 7th',
  14: 'Major 9th',
}

function TheoryTab({ chordName }) {
  const parsed = parseChord(chordName)
  if (!parsed) return <p className="text-gray-500 text-sm text-center py-8">Could not parse chord.</p>

  const { rootPc, type } = parsed
  const typeInfo = CHORD_TYPES[type]
  const theory = CHORD_THEORY[type]
  const subs = getChordSubstitutions(chordName)

  // Actual note names
  const noteNames = (typeInfo?.intervals ?? []).map(iv => NOTES[(rootPc + iv) % 12])

  // Roles this chord can play
  const ROLES = []
  for (let keyPc = 0; keyPc < 12; keyPc++) {
    for (const mode of ['major', 'minor']) {
      const diatonicChords = getChordsInKey(NOTES[keyPc], mode)
      const idx = diatonicChords.indexOf(chordName)
      if (idx !== -1) {
        const rn = toRomanNumeral(chordName, NOTES[keyPc], mode)
        ROLES.push({ keyRoot: NOTES[keyPc], mode, rn })
      }
    }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── What is this chord? ── */}
      <div className="p-4 bg-surface border border-border rounded-xl">
        <div className="flex items-baseline gap-3 mb-3">
          <span className={`text-lg font-black ${theory?.color ?? 'text-accent'}`}>{chordName}</span>
          <span className="text-sm text-gray-400">{theory?.name ?? type}</span>
        </div>
        {theory && (
          <>
            <p className="text-sm text-gray-200 leading-relaxed mb-2">{theory.beginner}</p>
            <p className="text-xs text-gray-500 italic leading-relaxed">{theory.vibe}</p>
          </>
        )}
      </div>

      {/* ── Notes & Formula ── */}
      <div className="p-4 bg-surface border border-border rounded-xl">
        <p className="text-[11px] uppercase tracking-wider text-gray-600 mb-3">Notes in this chord</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {(typeInfo?.intervals ?? []).map((iv, i) => (
            <div key={i} className={`flex flex-col items-center px-3 py-2 rounded-xl border ${
              i === 0 ? 'bg-accent/20 border-accent text-accent' : 'bg-panel border-border text-gray-300'
            }`}>
              <span className="text-base font-black">{noteNames[i]}</span>
              <span className="text-[10px] text-gray-500 leading-none mt-0.5">{INTERVAL_NAMES[iv] ?? `+${iv}`}</span>
            </div>
          ))}
        </div>
        {theory && (
          <div className="text-xs text-gray-600 font-mono bg-panel/50 rounded-lg px-3 py-2 border border-border">
            {theory.formula}
          </div>
        )}
        {theory && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] uppercase tracking-wider text-gray-600">Tension:</span>
            <span className="text-xs text-gray-400">{theory.tension}</span>
          </div>
        )}
      </div>

      {/* ── Chord substitutions ── */}
      {subs.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wider text-gray-600 mb-3">Colour swaps — try these instead</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {subs.map((sub, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-surface border border-border rounded-xl hover:border-accent/30 transition-colors">
                <span className="text-sm font-black text-accent shrink-0 w-16">{sub.chord}</span>
                <p className="text-xs text-gray-400 leading-snug">{sub.tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Keys this chord belongs to ── */}
      {ROLES.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wider text-gray-600 mb-3">{chordName} appears in these keys</p>
          <div className="flex flex-wrap gap-2">
            {ROLES.slice(0, 10).map(({ keyRoot, mode, rn }) => (
              <div key={`${keyRoot}-${mode}`}
                className="px-3 py-2 bg-surface border border-border rounded-xl text-xs flex items-center gap-2">
                <span className="font-bold text-white">{keyRoot}</span>
                <span className="text-gray-500 capitalize">{mode}</span>
                <span className="text-amber-400 font-bold">{rn}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-700 mt-2">
            Roman numerals show the chord's role: I/i = home, IV = subdominant, V = dominant tension, vi/♭VI = relative minor/major, etc.
          </p>
        </div>
      )}

    </div>
  )
}

// ─── Learn tab ────────────────────────────────────────────────────────────────

function LearnTab({ chordName }) {
  const parsed = parseChord(chordName)
  const playbook = parsed ? CHORD_PLAYBOOK[parsed.type] : null

  if (!playbook) {
    return <p className="text-gray-500 text-sm text-center py-8">No jam content for {chordName} yet.</p>
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Jam role ── */}
      <div className="px-4 py-3 bg-accent/10 border border-accent/20 rounded-xl">
        <p className="text-[10px] uppercase tracking-wider text-accent/60 mb-1">Your role in the jam</p>
        <p className="text-sm text-white leading-relaxed">{playbook.jamRole}</p>
      </div>

      {/* ── Voicings for jamming ── */}
      <div>
        <p className="text-[11px] uppercase tracking-wider text-gray-600 mb-2">Voicings — when to use which</p>
        <div className="flex flex-col gap-2">
          {playbook.voicings.map((v, i) => (
            <div key={i} className="flex gap-3 p-3 bg-surface border border-border rounded-xl hover:border-accent/20 transition-colors">
              <span className="text-accent font-black text-lg shrink-0 leading-none mt-0.5">{i + 1}</span>
              <div>
                <p className="text-xs font-bold text-white mb-0.5">{v.name}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{v.use}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-700 mt-2">See the Guitar tab for the actual fingerings of each shape.</p>
      </div>

      {/* ── Licks & fills ── */}
      <div>
        <p className="text-[11px] uppercase tracking-wider text-gray-600 mb-2">Licks &amp; fills</p>
        <div className="flex flex-col gap-3">
          {playbook.licks.map((l, i) => (
            <div key={i} className="p-4 bg-surface border border-border rounded-xl hover:border-accent/30 transition-colors">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <p className="text-sm font-bold text-white">{l.title}</p>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent">{l.style}</span>
              </div>
              <pre className="text-[10px] font-mono text-accent/70 bg-black/40 border border-border rounded-lg px-3 py-2 overflow-x-auto leading-relaxed whitespace-pre mb-2">{l.tab}</pre>
              <p className="text-xs text-amber-400/80">
                <span className="font-semibold text-amber-400">Key insight: </span>{l.tip}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Jam tips ── */}
      <div>
        <p className="text-[11px] uppercase tracking-wider text-gray-600 mb-2">Jam tips</p>
        <div className="flex flex-col gap-2">
          {playbook.jamTips.map((tip, i) => (
            <div key={i} className="flex gap-2.5 text-xs text-gray-300 leading-relaxed p-2.5 rounded-lg bg-surface border border-border">
              <span className="text-accent shrink-0 font-bold mt-0.5">→</span>
              <p>{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Loop station practice ── */}
      {playbook.loopPractice?.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wider text-gray-600 mb-2">Loop station practice</p>
          <div className="flex flex-col gap-2">
            {playbook.loopPractice.map((lp, i) => (
              <div key={i} className="p-3 bg-surface border border-border rounded-xl border-l-2 border-l-accent/40">
                <p className="text-xs font-bold text-white mb-1">🔁 {lp.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{lp.body}</p>
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
          { key: 'guitar', label: '🎸 Guitar' },
          { key: 'piano',  label: '🎹 Piano'  },
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

      {subTab === 'guitar' && <GuitarTab chordName={chordName} />}
      {subTab === 'piano'  && <PianoTab  chordName={chordName} />}
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function ChordDetailModal({ chord, onClose, onChordClick, keyInfo, chordHistory }) {
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
        <div className="flex gap-1 px-6 pt-4 overflow-x-auto">
          {[
            { key: 'guitar',       label: '🎸 Guitar'       },
            { key: 'piano',        label: '🎹 Piano'         },
            { key: 'theory',       label: '📚 Theory'        },
            { key: 'learn',        label: '🎓 Learn'         },
            { key: 'progressions', label: '🎵 Progressions'  },
            { key: 'explore',      label: '🔍 Explore'       },
          ].map(t => (
            <button key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-t-xl text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
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
          {tab === 'guitar'       && <GuitarTab           chordName={chord} />}
          {tab === 'piano'        && <PianoTab             chordName={chord} />}
          {tab === 'theory'       && <TheoryTab            chordName={chord} />}
          {tab === 'learn'        && <LearnTab             chordName={chord} />}
          {tab === 'progressions' && <ProgressionsSubTab   chordName={chord} onChordClick={c => { onChordClick?.(c) }} />}
          {tab === 'explore'      && <ExploreTab initialChord={chord} keyInfo={keyInfo} chordHistory={chordHistory} />}
        </div>

      </div>
    </div>
  )
}
