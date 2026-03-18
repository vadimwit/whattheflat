import { NOTES, CHORD_TYPES } from './theory'

// ─── Parse helper (self-contained, mirrors voicings.js) ───────────────────────
export function parseChord(name) {
  if (!name) return null
  const FLAT = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B']
  let rest = name
  let root = rest.length > 1 && (rest[1] === '#' || rest[1] === 'b')
    ? (rest = rest.slice(2), name.slice(0, 2))
    : (rest = rest.slice(1), name.slice(0, 1))
  let rootPc = NOTES.indexOf(root)
  if (rootPc === -1) rootPc = FLAT.indexOf(root)
  if (rootPc === -1) return null
  const suffixMap = {
    '': 'maj', 'm': 'min', 'min': 'min', 'maj': 'maj',
    '7': 'dom7', 'maj7': 'maj7', 'm7': 'min7', 'min7': 'min7',
    'dim': 'dim', 'dim7': 'dim7', 'm7b5': 'half_dim', 'ø': 'half_dim',
    'aug': 'aug', '+': 'aug',
    'sus4': 'sus4', 'sus2': 'sus2',
    '6': 'maj6', 'm6': 'min6', 'add9': 'add9',
  }
  return { rootPc, type: suffixMap[rest] ?? 'maj' }
}

function chordName(rootPc, type) {
  return NOTES[rootPc] + (CHORD_TYPES[type]?.suffix ?? '')
}

// ─── Famous progressions ──────────────────────────────────────────────────────
// degrees[] — semitone offsets from tonic
// qualities[] — chord type keys (CHORD_TYPES) for each degree
// mode — the mode this progression is naturally written in
// styleVariations — how genre players re-harmonise these chords

export const FAMOUS_PROGRESSIONS = [
  {
    id: 'axis',
    name: 'Axis Progression',
    pattern: 'I – V – vi – IV',
    degrees: [0, 7, 9, 5],
    qualities: ['maj', 'maj', 'min', 'maj'],
    mode: 'major',
    genre: ['Pop', 'Rock'],
    songs: ['Let It Be — Beatles', 'With or Without You — U2', 'Someone Like You — Adele', "Don't Stop Believin' — Journey", 'Wonderwall — Oasis', 'Demons — Imagine Dragons'],
    description: 'The defining progression of modern pop. Works in every genre and tempo.',
    tip: 'Try starting on the vi instead — suddenly it feels darker and more yearning.',
    styleVariations: [
      { label: 'Jazz',    pattern: 'Imaj7 – V7 – vim7 – IVmaj7',  qualities: ['maj7','dom7','min7','maj7'] },
      { label: 'Soul',    pattern: 'Imaj9 – V9 – vim9 – IVmaj9',   qualities: ['maj7','dom7','min7','maj7'] },
      { label: 'Blues',   pattern: 'I7 – V7 – vi7 – IV7',           qualities: ['dom7','dom7','dom7','dom7'] },
      { label: 'Ambient', pattern: 'Isus2 – Vsus2 – vim7 – IVadd9', qualities: ['sus2','sus2','min7','add9'] },
    ],
  },
  {
    id: 'fifties',
    name: '50s / Doo-Wop',
    pattern: 'I – vi – IV – V',
    degrees: [0, 9, 5, 7],
    qualities: ['maj', 'min', 'maj', 'maj'],
    mode: 'major',
    genre: ['Pop', 'Doo-Wop', 'Rock'],
    songs: ['Stand By Me — Ben E. King', 'Earth Angel', 'Blue Moon', 'Unchained Melody', 'Every Breath You Take — Police'],
    description: 'The doo-wop backbone. Sweet, nostalgic, universally singable and timeless.',
    tip: "The vi chord is the emotional pivot — it's the same root as in the Axis, just a different order.",
    styleVariations: [
      { label: 'Jazz',   pattern: 'Imaj7 – vim7 – IVmaj7 – V7',    qualities: ['maj7','min7','maj7','dom7'] },
      { label: 'Soul',   pattern: 'I6 – vim7 – IV – V7sus4',        qualities: ['maj6','min7','maj','sus4'] },
      { label: 'Funk',   pattern: 'Imaj9 – vim9 – IV9 – V9',        qualities: ['maj7','min7','dom7','dom7'] },
    ],
  },
  {
    id: 'canon',
    name: 'Canon / Pachelbel',
    pattern: 'I – V – vi – iii – IV – I – IV – V',
    degrees: [0, 7, 9, 4, 5, 0, 5, 7],
    qualities: ['maj','maj','min','min','maj','maj','maj','maj'],
    mode: 'major',
    genre: ['Classical', 'Pop', 'Rock'],
    songs: ['Canon in D — Pachelbel', 'Basket Case — Green Day', 'Go West — Pet Shop Boys', 'Graduation — Vitamin C'],
    description: 'Baroque timelessness. The descending bass line creates inevitable forward motion.',
    tip: 'The iii chord is the secret ingredient — it bridges vi and IV with aristocratic weight.',
    styleVariations: [
      { label: 'Rock',    pattern: 'Power chords all the way down', qualities: [] },
      { label: 'Neo-soul',pattern: 'Imaj9 – V9 – vim9 – iiim7 – IVmaj9', qualities: ['maj7','dom7','min7','min7','maj7'] },
    ],
  },
  {
    id: 'two_five_one',
    name: 'ii – V – I (Jazz)',
    pattern: 'iim7 – V7 – Imaj7',
    degrees: [2, 7, 0],
    qualities: ['min7', 'dom7', 'maj7'],
    mode: 'major',
    genre: ['Jazz', 'Bossa Nova'],
    songs: ['Autumn Leaves', 'All The Things You Are', 'Fly Me To The Moon', 'The Girl From Ipanema', 'Misty'],
    description: 'The bedrock of jazz harmony. The tritone in V7 resolves to I with beautiful tension.',
    tip: 'The ii chord pre-resolves the V — together they create an inevitable pull to the I.',
    styleVariations: [
      { label: 'Bossa',   pattern: 'iim7 – V7(9) – Imaj9',          qualities: ['min7','dom7','maj7'] },
      { label: 'Bebop',   pattern: 'iim7 – V7(♭9) – Imaj7(#11)',    qualities: ['min7','dom7','maj7'] },
      { label: 'Modal',   pattern: 'im7 – IV7 (Dorian vamp)',        qualities: ['min7','dom7'] },
    ],
  },
  {
    id: 'blues_12',
    name: '12-Bar Blues',
    pattern: 'I – I – I – I – IV – IV – I – I – V – IV – I – V',
    degrees: [0, 0, 0, 0, 5, 5, 0, 0, 7, 5, 0, 7],
    qualities: ['dom7','dom7','dom7','dom7','dom7','dom7','dom7','dom7','dom7','dom7','dom7','dom7'],
    mode: 'major',
    genre: ['Blues', 'Rock', 'Jazz'],
    songs: ['Johnny B. Goode — Chuck Berry', 'Pride & Joy — SRV', 'Crossroads — Robert Johnson', 'Hound Dog', 'Folsom Prison Blues — Cash'],
    description: 'The foundation of rock and blues. Master this and you can jam with anyone on Earth.',
    tip: 'All three chords are dominant 7ths — that dissonance is what makes blues feel so restless.',
    styleVariations: [
      { label: 'Shuffle',  pattern: 'I7 – IV7 – V7 with shuffle rhythm', qualities: ['dom7','dom7','dom7'] },
      { label: 'Jazz',     pattern: 'Imaj7 – IV7 – iim7 – V7 quick changes', qualities: ['maj7','dom7','min7','dom7'] },
      { label: 'Minor',    pattern: 'im7 – ivm7 – vm7 (minor blues)',   qualities: ['min7','min7','min7'] },
    ],
  },
  {
    id: 'andalusian',
    name: 'Andalusian Cadence',
    pattern: 'i – ♭VII – ♭VI – V',
    degrees: [0, 10, 8, 7],
    qualities: ['min', 'maj', 'maj', 'maj'],
    mode: 'minor',
    genre: ['Flamenco', 'Rock', 'Classical'],
    songs: ['Stairway to Heaven intro — Led Zeppelin', 'Hit the Road Jack', 'Sultans of Swing — Dire Straits', 'White Christmas'],
    description: 'Descending bass line creates unstoppable forward motion. Timeless, dramatic, inevitable.',
    tip: 'The final V chord (major) is the harmonic surprise in a minor context — forces resolution.',
    styleVariations: [
      { label: 'Flamenco', pattern: 'im – ♭VII – ♭VI – V7',          qualities: ['min','maj','maj','dom7'] },
      { label: 'Rock',     pattern: 'im5 – ♭VII5 – ♭VI5 – V5 (power)', qualities: ['min','maj','maj','maj'] },
      { label: 'Jazz',     pattern: 'im(maj7) – ♭VIImaj7 – ♭VImaj7 – V7(#9)', qualities: ['min7','maj7','maj7','dom7'] },
    ],
  },
  {
    id: 'minor_anthem',
    name: 'Minor Anthem',
    pattern: 'i – ♭VI – ♭III – ♭VII',
    degrees: [0, 8, 3, 10],
    qualities: ['min', 'maj', 'maj', 'maj'],
    mode: 'minor',
    genre: ['Rock', 'Pop', 'Metal'],
    songs: ['Numb — Linkin Park', 'In The End — Linkin Park', 'Boulevard of Broken Dreams — Green Day', 'Creep — Radiohead', 'Smells Like Teen Spirit — Nirvana'],
    description: 'The anthem of angst. Powerful, relentless, emotionally direct.',
    tip: 'Every chord is major except the tonic — the contrast makes the i feel even more desperate.',
    styleVariations: [
      { label: 'Stripped', pattern: 'im7 – ♭VImaj7 – ♭IIImaj7 – ♭VIImaj7', qualities: ['min7','maj7','maj7','maj7'] },
      { label: 'Epic',     pattern: 'im – ♭VI – ♭III – ♭VII with sus2 variants', qualities: ['min','maj','maj','maj'] },
    ],
  },
  {
    id: 'minor_oscillate',
    name: 'Minor Oscillation',
    pattern: 'i – ♭VII – ♭VI – ♭VII',
    degrees: [0, 10, 8, 10],
    qualities: ['min', 'maj', 'maj', 'maj'],
    mode: 'minor',
    genre: ['Rock', 'Folk', 'Pop'],
    songs: ['All Along the Watchtower — Dylan/Hendrix', "Knockin' on Heaven's Door — Dylan", 'Pumped Up Kicks — Foster the People', 'Africa — Toto'],
    description: 'The ♭VII oscillates back and forth — creates hypnotic looping energy.',
    tip: 'Works as a 2-bar vamp (i – ♭VII) or a full 4-bar loop. The ♭VI adds breathing room.',
    styleVariations: [
      { label: 'Folk',  pattern: 'im – ♭VII – ♭VI – ♭VII fingerpicked', qualities: ['min','maj','maj','maj'] },
      { label: 'Rock',  pattern: 'im – ♭VII – ♭VI power chords',        qualities: ['min','maj','maj','maj'] },
    ],
  },
  {
    id: 'mixolydian',
    name: 'Mixolydian Rock',
    pattern: 'I – ♭VII – IV',
    degrees: [0, 10, 5],
    qualities: ['maj', 'maj', 'maj'],
    mode: 'major',
    genre: ['Rock', 'Folk', 'Celtic'],
    songs: ['Sweet Home Alabama — Lynyrd Skynyrd', 'La Grange — ZZ Top', 'Werewolves of London — Warren Zevon', 'Norwegian Wood — Beatles'],
    description: 'The ♭VII chord defines Mixolydian mode. Swagger and swagger only.',
    tip: 'In standard major, the VII is diminished. Flattening it to ♭VII gives you a major chord — that shift is everything.',
    styleVariations: [
      { label: 'Celtic',   pattern: 'I – ♭VII – IV – I alternating',   qualities: ['maj','maj','maj','maj'] },
      { label: 'Funk',     pattern: 'I9 – ♭VII9 – IV9 dominant 9ths',  qualities: ['dom7','dom7','dom7'] },
    ],
  },
  {
    id: 'dorian_vamp',
    name: 'Dorian Vamp',
    pattern: 'i – IV',
    degrees: [0, 5],
    qualities: ['min', 'maj'],
    mode: 'minor',
    genre: ['Rock', 'Jazz', 'Funk'],
    songs: ['Oye Como Va — Santana', 'So What — Miles Davis', 'Scarborough Fair', 'Eleanor Rigby verse — Beatles', 'Mad World — Tears for Fears'],
    description: 'The major IV over a minor i chord signals Dorian mode. Smooth, open, sophisticated.',
    tip: 'Natural minor would have a minor iv. The major IV is Dorian\'s signature — it feels both sad and groovy.',
    styleVariations: [
      { label: 'Jazz',  pattern: 'im7 – IV7 (comp beneath a soloist)',    qualities: ['min7','dom7'] },
      { label: 'Funk',  pattern: 'im9 – IV13 (layered synth and guitar)', qualities: ['min7','dom7'] },
      { label: 'Rock',  pattern: 'im – IV – im – IV (guitar riff)',        qualities: ['min','maj'] },
    ],
  },
  {
    id: 'jazz_turnaround',
    name: 'Jazz Turnaround',
    pattern: 'I – vi – ii – V',
    degrees: [0, 9, 2, 7],
    qualities: ['maj7', 'min7', 'min7', 'dom7'],
    mode: 'major',
    genre: ['Jazz', 'Swing'],
    songs: ['I Got Rhythm — Gershwin', 'Rhythm Changes', 'How High the Moon', 'countless jazz standards'],
    description: 'The jazz turnaround — loops back to the top of the form with elegant inevitability.',
    tip: 'Each chord resolves down a fifth to the next. That chain of fifths is what makes jazz sound "right".',
    styleVariations: [
      { label: 'Bebop',   pattern: 'Imaj7 – vim7 – iim7 – V7(♭9)',    qualities: ['maj7','min7','min7','dom7'] },
      { label: 'Tritone', pattern: 'Imaj7 – ♭III7 – iim7 – ♭II7 (tritone subs)', qualities: ['maj7','dom7','min7','dom7'] },
    ],
  },
  {
    id: 'phrygian',
    name: 'Phrygian Tension',
    pattern: 'i – ♭II',
    degrees: [0, 1],
    qualities: ['min', 'maj'],
    mode: 'minor',
    genre: ['Flamenco', 'Metal', 'Film'],
    songs: ['Game of Thrones theme', 'Spanish flamenco standards', 'heavy metal riffs', 'El Tango de Roxanne'],
    description: 'The ♭II (Neapolitan) chord creates extreme tension. Spanish fire and metal darkness.',
    tip: 'Just two chords — the half-step relationship between roots is what makes it feel so tense.',
    styleVariations: [
      { label: 'Flamenco', pattern: 'im – ♭II – im with fast strumming', qualities: ['min','maj','min'] },
      { label: 'Metal',    pattern: 'im5 – ♭II5 power chord riff',       qualities: ['min','maj'] },
    ],
  },
  {
    id: 'minor_pop',
    name: 'Sad Pop Minor',
    pattern: 'vi – IV – I – V',
    degrees: [9, 5, 0, 7],
    qualities: ['min', 'maj', 'maj', 'maj'],
    mode: 'major',
    genre: ['Pop', 'Rock', 'Indie'],
    songs: ['Zombie — Cranberries', 'Torn — Natalie Imbruglia', 'Apologize — Timbaland', 'Fix You — Coldplay'],
    description: 'Same chords as the Axis — just starting on the vi. Instantly feels darker and more yearning.',
    tip: 'Which chord you start on changes everything emotionally. This is the Axis heard through minor eyes.',
    styleVariations: [
      { label: 'Soul',   pattern: 'vim7 – IVmaj7 – Imaj7 – V9',        qualities: ['min7','maj7','maj7','dom7'] },
      { label: 'Indie',  pattern: 'vim7 – IVadd9 – Iadd9 – Vsus4',     qualities: ['min7','add9','add9','sus4'] },
    ],
  },
  {
    id: 'lydian_float',
    name: 'Lydian Float',
    pattern: 'I – II',
    degrees: [0, 2],
    qualities: ['maj', 'maj'],
    mode: 'major',
    genre: ['Film', 'Jazz', 'Pop'],
    songs: ['The Simpsons theme', 'Joe Satriani — Flying in a Blue Dream', 'many John Williams cues', 'Man or Muppet'],
    description: 'The raised ♯4 in Lydian makes the II chord major instead of minor. Dreamy, floating, magical.',
    tip: 'In normal major, the II chord is minor. Making it major (Lydian) lifts the whole progression off the ground.',
    styleVariations: [
      { label: 'Film',   pattern: 'Imaj7 – IImaj7 slowly held',         qualities: ['maj7','maj7'] },
      { label: 'Jazz',   pattern: 'Imaj7(#11) — the Lydian 7th chord',  qualities: ['maj7','maj7'] },
    ],
  },
  {
    id: 'sensitive',
    name: 'Sensitive Oscillation',
    pattern: 'vi – V – IV – V',
    degrees: [9, 7, 5, 7],
    qualities: ['min', 'maj', 'maj', 'maj'],
    mode: 'major',
    genre: ['Pop', 'Indie'],
    songs: ['Mad World — Tears for Fears', 'Every Breath You Take — Police', 'Losing My Religion — REM'],
    description: 'Oscillates between vi and IV through V. Aching, introspective, perpetually unresolved.',
    tip: 'The V never quite resolves to I — it keeps bouncing back to the IV or vi. That suspension is the emotion.',
    styleVariations: [
      { label: 'Indie',  pattern: 'vim7 – Vsus4 – IVadd9 – V',         qualities: ['min7','sus4','add9','maj'] },
    ],
  },
]

// ─── Chord substitution options ───────────────────────────────────────────────
// For each chord type: array of { type, label, tip } suggestions
export const CHORD_SUBSTITUTIONS = {
  maj: [
    { type: 'maj7',  tip: 'Add the major 7th — dreamy jazz colour' },
    { type: 'add9',  tip: 'Add the 9th — modern, open, Coldplay-ish' },
    { type: 'maj6',  tip: 'Add major 6th — vintage Django jazz sweetness' },
    { type: 'sus2',  tip: 'Replace 3rd with 2nd — airy and ambiguous' },
    { type: 'sus4',  tip: 'Suspend then resolve — creates rhythmic motion' },
  ],
  min: [
    { type: 'min7',  tip: 'Add the minor 7th — smooth soul and jazz' },
    { type: 'add9',  tip: 'Add 9th over minor — bittersweet modern ache (Radiohead)' },
    { type: 'min6',  tip: 'Add major 6th over minor — flamenco and tango colour' },
    { type: 'sus2',  tip: 'Remove 3rd entirely — ambiguous and floating' },
    { type: 'half_dim', tip: 'Flatten the 5th — half-diminished, much darker' },
  ],
  dom7: [
    { type: 'maj7',  tip: 'Raise the 7th — softer, much less tension' },
    { type: 'min7',  tip: 'Lower the 3rd too — darkens the dominant' },
    { type: 'sus4',  tip: 'Replace 3rd with 4th — funky unresolved suspension' },
    { type: 'dim7',  tip: 'Diminished substitute — extreme tension before resolution' },
  ],
  maj7: [
    { type: 'maj',   tip: 'Simplify — strip back to triad, rawer feel' },
    { type: 'add9',  tip: 'Drop 7th, add 9th — brighter and more open' },
    { type: 'maj6',  tip: 'Swap 7th for 6th — retro jazz, less ethereal' },
    { type: 'dom7',  tip: 'Flatten 7th — suddenly bluesy with tension' },
  ],
  min7: [
    { type: 'min',   tip: 'Strip back — rawer, more aggressive feel' },
    { type: 'half_dim', tip: 'Flatten the 5th — half-dim, darker and more tense' },
    { type: 'min6',  tip: 'Add major 6th — sophisticated jazz minor colour' },
    { type: 'dom7',  tip: 'Make it dominant — strong pull to resolve' },
  ],
  dim: [
    { type: 'dim7',     tip: 'Add dim7 — fully symmetric, equally unstable' },
    { type: 'half_dim', tip: 'Half-dim — softer, more melodic tension' },
    { type: 'min',      tip: 'Simplify to minor — much less dissonant' },
  ],
  dim7: [
    { type: 'dim',      tip: 'Remove 7th — triad version, slightly less tense' },
    { type: 'half_dim', tip: 'Raise one note to half-dim — softer resolution' },
    { type: 'min7',     tip: 'Raise ♭5 — from dark to smooth in one note' },
  ],
  aug: [
    { type: 'maj',  tip: 'Resolve the aug5 down to 5 — release the tension' },
    { type: 'dom7', tip: 'Add ♭7 over aug — double tension before a big resolution' },
  ],
  sus4: [
    { type: 'maj',  tip: 'Resolve — drop the 4th to the 3rd (classic sus → maj)' },
    { type: 'sus2', tip: 'Switch suspension — from 4th to 2nd, different feel' },
    { type: 'dom7', tip: 'Add ♭7 too — 7sus4, funky and unresolved' },
  ],
  sus2: [
    { type: 'maj',  tip: 'Fill in the 3rd — resolve the suspension clearly' },
    { type: 'sus4', tip: 'Swap 2nd for 4th — different flavour of openness' },
    { type: 'add9', tip: 'Add the 3rd back — sus2 becomes a richer add9' },
  ],
  half_dim: [
    { type: 'dim7', tip: 'Add dim7 — more symmetric and tense' },
    { type: 'min7', tip: 'Raise the ♭5 to 5 — suddenly much smoother' },
    { type: 'min',  tip: 'Strip back — simple minor triad' },
  ],
  maj6: [
    { type: 'maj7', tip: 'Swap 6th for 7th — more modern jazz, more ethereal' },
    { type: 'add9', tip: 'Replace 6th with 9th — brighter, contemporary feel' },
  ],
  min6: [
    { type: 'min7',     tip: 'Swap 6th for 7th — smoother, less exotic' },
    { type: 'half_dim', tip: 'Enharmonic trick — min6 and half-dim share notes' },
  ],
  add9: [
    { type: 'maj7', tip: 'Add the 7th — full maj9 sound, very lush' },
    { type: 'sus2', tip: 'Remove the 3rd — purely suspended' },
    { type: 'maj',  tip: 'Strip the 9th — clean triad' },
  ],
}

// ─── Compute chord names for a famous progression in a given key ──────────────
export function progressionInKey(famousProg, keyRoot) {
  const rootPc = NOTES.indexOf(keyRoot)
  if (rootPc === -1) return []
  return famousProg.degrees.map((d, i) => {
    const pc = (rootPc + d) % 12
    const type = famousProg.qualities[i] ?? 'maj'
    return chordName(pc, type)
  })
}

// Style variation chords in a given key
export function styleVariationInKey(styleVar, famousProg, keyRoot) {
  if (!styleVar.qualities?.length) return []
  const rootPc = NOTES.indexOf(keyRoot)
  if (rootPc === -1) return []
  return famousProg.degrees.slice(0, styleVar.qualities.length).map((d, i) => {
    const pc = (rootPc + d) % 12
    return chordName(pc, styleVar.qualities[i] ?? 'maj')
  })
}

// ─── Similarity matching ──────────────────────────────────────────────────────
export function findSimilarProgressions(detectedChords, keyInfo) {
  if (!detectedChords?.length || !keyInfo?.root) return []
  const rootPc = NOTES.indexOf(keyInfo.root)
  if (rootPc === -1) return []

  // Convert detected chords to semitone offsets from key root
  const detectedPcs = detectedChords
    .map(c => { const p = parseChord(c); return p ? (p.rootPc - rootPc + 12) % 12 : null })
    .filter(v => v !== null)
  if (!detectedPcs.length) return []

  const detectedSet = new Set(detectedPcs)
  const results = []

  for (const prog of FAMOUS_PROGRESSIONS) {
    const progPcs = prog.degrees.map(d => d % 12)
    const progSet = new Set(progPcs)

    // Rotation match: does detected sequence appear in famous prog (as cyclic rotation)?
    let rotScore = 0
    const compareLen = Math.min(detectedPcs.length, progPcs.length)
    for (let rot = 0; rot < progPcs.length; rot++) {
      let hits = 0
      for (let i = 0; i < compareLen; i++) {
        if (detectedPcs[i] === progPcs[(rot + i) % progPcs.length]) hits++
      }
      rotScore = Math.max(rotScore, hits / compareLen)
    }

    // Jaccard similarity (chord-set overlap regardless of order)
    const inter = [...detectedSet].filter(d => progSet.has(d)).length
    const union = new Set([...detectedSet, ...progSet]).size
    const jaccardScore = inter / union

    const score = Math.max(rotScore, jaccardScore * 0.8)
    if (score >= 0.35) results.push({ ...prog, score })
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 4)
}

// ─── Substitutions for a chord name ──────────────────────────────────────────
export function getChordSubstitutions(chordName) {
  const p = parseChord(chordName)
  if (!p) return []
  const subs = CHORD_SUBSTITUTIONS[p.type] ?? []
  return subs.map(sub => ({
    ...sub,
    chord: NOTES[p.rootPc] + (CHORD_TYPES[sub.type]?.suffix ?? ''),
  }))
}
