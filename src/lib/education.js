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

// ─── Chord Playbook ───────────────────────────────────────────────────────────
// Jam-focused knowledge base per chord type.
// jamRole    — one sentence on this chord's role in a live jam
// voicings   — 2-3 voicings with their jam use-case (not fingering lessons)
// licks      — 2-3 fills/licks with ASCII tab, style-labelled
// jamTips    — 3 tight bullet points for live playing
// loopPractice — 1-2 concrete loop station exercises

export const CHORD_PLAYBOOK = {
  maj: {
    jamRole: 'The home chord in a major key — everything resolves here. Your job is to lock in the groove and hold the harmonic centre while others explore around you.',
    voicings: [
      { name: 'Open position', use: 'Full, resonant. Use when you\'re the only chordal instrument — fills the room. Avoid it in a dense band (too much low-end clash with bass).' },
      { name: 'Barre mid-neck (E or A shape)', use: 'Controlled and punchy. Use in a band — you\'re sitting above the bassist\'s register. Good for rock and funk comping.' },
      { name: 'Partial 4-string (strings 1–4, upper neck)', use: 'Jazz and funk comping. Stays completely out of the low end. Ideal when there\'s a keys player — you add texture without competing.' },
    ],
    licks: [
      {
        title: 'Major pentatonic walkup',
        style: 'Rock / Country',
        tab: 'e|-------------------------------5-7-|\nB|---------------------5-7-8---------|\nG|-----------4-5-7-------------------|\nD|-----4-5-7-------------------------|\nA|-5-7-------------------------------|\n  (G major pentatonic — position shift for any key)',
        tip: 'End on the root or the 3rd for a resolved feel. Use this as a fill between chord changes.',
      },
      {
        title: 'Chord tone arpeggio fill',
        style: 'Jazz / Funk',
        tab: 'e|-----5-----------|\nB|---5---8---------|\nG|-5-------7-5-----|\nD|-----------------|\n  (C major: R–3–5–high root)',
        tip: 'Highlight the 3rd and 5th — these define the chord. Avoid the root on a strong beat to keep it moving.',
      },
    ],
    jamTips: [
      'If a bassist is locking down the root, move your voicing up the neck — let them own the low end.',
      'Behind a soloist: comp short stabs on beats 2 and 4. Full strums on every beat will drown them out.',
      'Pedal point trick: hold one string on the root and let the chord move underneath — creates harmonic motion without a chord change.',
    ],
    loopPractice: [
      { title: 'Comp loop + fill swap', body: 'Record a 2-bar major chord comp (stabs on beats 2 and 4). Loop it. Improvise fills over the top using the major pentatonic — aim to respond to the rhythm, not just run scales. Swap between "comping mode" and "fill mode" every 4 bars.' },
    ],
  },

  min: {
    jamRole: 'Sets the emotional temperature of the jam. Minor chords invite exploration — soloists will look to you for the harmonic anchor. Hold it firmly and let the mood develop.',
    voicings: [
      { name: 'Open minor (Em, Am, Dm)', use: 'Resonant and sustaining. Use when the jam is sparse or acoustic — let it ring while others move around it.' },
      { name: 'Barre mid-neck', use: 'Rock and pop jams. Punchy and controlled. Roll slightly onto the index bony edge for clean barres. Palm-mute lightly for a tighter comp.' },
      { name: 'Partial upper voicing (4 strings)', use: 'Jazz-funk context. Stays completely out of the bass. Add light muting for a percussive comp that doesn\'t muddy the mix.' },
    ],
    licks: [
      {
        title: 'Minor pentatonic box 1',
        style: 'Blues / Rock',
        tab: 'e|--8-5-----------|\nB|------8-5-6-5---|\nG|------------7-5-|\nD|---------7------|\nA|----------------|\n  (A minor pentatonic at position 5)',
        tip: 'The b3 and b7 are your strongest notes over any minor chord. End phrases on one of them.',
      },
      {
        title: 'Dorian groove phrase',
        style: 'Jazz / Funk',
        tab: 'e|-------------------|\nB|-------------------|\nG|--2-4-2-4-5-4-2----|\nD|--2-4-2-4---4-2----|\nA|--0----------------|\n  (A Dorian — note the F# = natural 6th)',
        tip: 'The natural 6th (F# in Am Dorian) is what gives Santana, Stevie Wonder, and jazz-funk their brightness over a minor chord.',
      },
    ],
    jamTips: [
      'The minor pentatonic (5 notes) is the safe zone — you can\'t go wrong with it over any minor chord.',
      'On a long minor vamp, try the Dorian mode (raise the 6th by one semitone) — it shifts the feel from melancholic to funky.',
      'When the jam sits on a minor chord, play fewer chord tones and more single-note fills in the gaps — let the sustain breathe.',
    ],
    loopPractice: [
      { title: 'Minor vamp + Dorian exploration', body: 'Record a 4-bar minor chord groove with gaps (e.g. hit on beat 1, let it ring, stab again on beat 3). Loop it. Solo over it with minor pentatonic for 2 laps. Then raise the 6th by one semitone (into Dorian) on the next 2 laps. Hear the shift from dark to groove.' },
    ],
  },

  dom7: {
    jamRole: 'THE blues chord — in a 12-bar blues jam, every chord is a dom7. In jazz, it\'s the maximum-tension V chord. Either way: play with attitude and resolve with purpose.',
    voicings: [
      { name: 'Full dom7 barre', use: 'Blues rhythm guitar. Combine with the shuffle pattern — bass note then top strings alternating. This IS the sound of a blues jam.' },
      { name: 'Shell voicing (root + 3rd + b7, 3 strings only)', use: 'Jazz comping. Three notes, right in the pocket. Leaves room for piano, sax, everything — the most polite voicing you can play.' },
      { name: '9th voicing (add the 2nd on top)', use: 'R&B and blues-rock upgrade. One extra note transforms the barre into something sophisticated without changing the function.' },
    ],
    licks: [
      {
        title: 'Blues shuffle figure',
        style: 'Blues',
        tab: 'e|--------------------|\nB|--------------------|\nG|--------------------|\nD|--2-4--2-4----------|\nA|--2-4--2-4----------|\nE|--0----0------------|\n  (E7 shuffle — repeat; move to A string for A7)',
        tip: 'The shuffle feel is long-short, long-short (triplet with the middle note removed). Lock this in before speed.',
      },
      {
        title: 'Mixolydian fill',
        style: 'Jazz / Rock',
        tab: 'e|--10-8---8-10-8--7---------|\nB|---------10---------10-8---|\nG|---------------------------|\n  (G mixolydian: G A B C D E F)',
        tip: 'Mixolydian = major scale with b7. It\'s the natural scale over any dominant 7th chord — the b7 note is the defining colour.',
      },
    ],
    jamTips: [
      'In a 12-bar blues, every chord is a dom7. The notes that shift between I7, IV7, and V7 are just the 3rd and b7 — learn those for each chord and you can navigate the whole form.',
      'The b7 note is the single best note to target in a fill over a dom7. It\'s immediately recognisable as the "blues note."',
      'On the V7 (the most tense moment), one well-placed phrase hits harder than ten frantic notes. Listen to what B.B. King leaves out.',
    ],
    loopPractice: [
      { title: '12-bar blues loop', body: 'Record a 2-bar I7 chord shuffle (e.g. E7 for 2 bars). Loop it and solo using the minor pentatonic. Then add the major 3rd occasionally (in E: G#) — you\'re now mixing major and minor pentatonic, which is the blues scale. Notice how that one note shifts the whole flavour.' },
    ],
  },

  maj7: {
    jamRole: 'The sophisticated home chord of jazz, bossa nova, and soul. It floats rather than resolves — gives the jam a dreamy, suspended quality. Play it quietly and let it hang.',
    voicings: [
      { name: 'Open Cmaj7 / Amaj7 / Emaj7', use: 'Acoustic and light electric jams. Beautiful resonance. Let it ring — the maj7 note needs space to project.' },
      { name: '4-string mid-neck (no 5th)', use: 'Jazz comping. Drop the 5th — it clutters. Root, 3rd, and maj7 is more elegant and sits better under a soloist.' },
      { name: 'High-neck partial (strings 1–4)', use: 'Comping behind a vocalist. High, bright, completely out of the bass range. Keeps you from competing with anything.' },
    ],
    licks: [
      {
        title: 'Maj7 arpeggio climb',
        style: 'Jazz / Bossa',
        tab: 'e|--------9----------|\nB|------9---9--------|\nG|----9-------9------|\nD|--10-----------10--|\nA|------------------|\n  (Cmaj7: C–E–G–B)',
        tip: 'Land on the maj7 (the B over Cmaj7) — it\'s the characteristic note. Resolve it gently, don\'t snap down.',
      },
      {
        title: 'Lydian colour phrase',
        style: 'Jazz',
        tab: 'e|--9-10-12-10--9---------|\nB|----------------10-9----|\nG|----------------------9-|\n  (#4 = Lydian mode over maj7 — the raised 4th creates a dreamy, floating quality)',
        tip: 'The #4 (raised 4th) is the Lydian note — one semitone above the perfect 4th. It creates instant "floating" colour over any maj7 chord.',
      },
    ],
    jamTips: [
      'Maj7 sounds strongest quiet — dial back your volume. It\'s a listening chord that rewards the band for playing softly.',
      'In bossa nova, emphasise the bass note on beat 1 with your thumb and comp the chord on the upbeats with your fingers. No plectrum.',
      'The maj7 is one semitone below the root. If you play the root too prominently in the voicing, the 7th disappears. Favour the 3rd and 7th in your note choices.',
    ],
    loopPractice: [
      { title: 'Bossa nova comp loop', body: 'Record a 4-bar maj7 chord using bossa rhythm (bass on beat 1, chord on the "and"). Play it at half the volume you think you need. Then improvise a simple 3–4 note melody over it. Fewer notes = more space = better bossa feel.' },
    ],
  },

  min7: {
    jamRole: 'The smoothed-out minor — soul, R&B, funk, and jazz all live here. It invites groove without demanding resolution. Great for long vamps and ii chord setups in jazz.',
    voicings: [
      { name: 'Open Am7 / Em7 / Dm7', use: 'Folk, acoustic, and light jazz. Clean and resonant. Good starting point — the open strings blend naturally with the chord.' },
      { name: 'Barre mid-neck (muted)', use: 'Rock-funk. Mute slightly with your palm for a tighter, more percussive sound. Useful for rhythmic comping in a band.' },
      { name: '4-string funk stab (high position)', use: 'THE funk voicing. 4 strings, quick stab and mute. Stay high on the neck — leave the low end for the bass. This is how you comp in a funk jam.' },
    ],
    licks: [
      {
        title: 'Dorian funk phrase',
        style: 'Funk / Jazz',
        tab: 'e|---------------------|\nB|---------------------|\nG|--5-7-5-7-9-7-5------|\nD|--5-7-5-7---7-5------|\nA|--3------------------|\n  (Am Dorian: natural 6th = F# = fret 9 on G string)',
        tip: 'The natural 6th (raised from the plain minor) is the single note that turns a minor vamp into a funk groove. Target it.',
      },
      {
        title: 'Min7 arpeggio fill',
        style: 'Jazz / Soul',
        tab: 'e|------8----------|\nB|----8---8--------|\nG|--7-------7-5----|\nD|--7-----------7--|\n  (Am7: A–C–E–G)',
        tip: 'In jazz, the b7 (G over Am7) is the departure note — it creates the sense of movement to the V chord. Let it hang.',
      },
    ],
    jamTips: [
      'In a funk jam, min7 stabs go on the upbeats. The muted scratches between are as musical as the chords themselves — they hold the groove.',
      'In jazz, min7 is almost always the ii chord — expect a dom7 to follow. Your job on ii is to build tension so the V chord feels even better.',
      'On a long minor 7th vamp, the Dorian mode (natural 6th) is your key. It\'s what separates "sad minor" from "soulful groove".',
    ],
    loopPractice: [
      { title: 'Funk stab loop', body: 'Record a 2-bar pattern: stab the min7 on the "and" of each beat, leaving the beats empty. Loop it. Add a second loop layer with a single bass note on beats 1 and 3. Hear how it locks into a groove. Then try improvising single notes on top.' },
    ],
  },

  dim: {
    jamRole: 'Almost never a destination — diminished is a bridge. In a live jam, use it to glide chromatically from one chord to another a half step away. One beat, maximum drama, then move.',
    voicings: [
      { name: 'Chromatic passing shape', use: 'Move any dim shape up one fret to arrive at the next chord. This is how diminished works in practice — a one-fret slide between two stable chords.' },
      { name: 'Compact 4-string voicing', use: 'Jazz context where you want the dim colour without full 6-string weight. Cleaner in a dense mix.' },
    ],
    licks: [
      {
        title: 'Chromatic approach line',
        style: 'Jazz / Classical',
        tab: 'e|--8-9-10-----------|\nB|------10-11-12-----|\nG|---------------11--|\n  (chromatic passing: approach Cmaj7 from B dim)',
        tip: 'Each note moves up by exactly one semitone. The half-step motion is what creates the magnetic pull toward the landing chord.',
      },
      {
        title: 'Symmetric dim arpeggio',
        style: 'Jazz',
        tab: 'e|--4-7-10-----------|\nB|------10-13--------|\nG|---------12--------|\nD|--5-8--------------|\n  (B dim: B–D–F–Ab — all minor 3rds apart)',
        tip: 'Move this pattern up 3 frets and you have the same chord in a new inversion. Exploit the symmetry.',
      },
    ],
    jamTips: [
      'Use dim as a chromatic approach: going from G to Am, insert G#dim for one beat. The half-step movement makes the landing feel inevitable.',
      'In jazz, you can substitute a dim7 a half step above the V chord — it creates even more tension before the resolution.',
      'Diminished chords are brief. Never sit on one in a jam — play it quickly and move. It\'s a dramatic pivot, not a home.',
    ],
    loopPractice: [
      { title: 'Chromatic approach exercise', body: 'Record a 2-bar Am loop. On the last beat before the loop repeats, land on G#dim for just one beat before the Am hits. Loop it. Feel how the approach makes the Am feel like a release. Try with different target chords.' },
    ],
  },

  dim7: {
    jamRole: 'The most symmetric chord in music — one shape, four roots. Use it as a dramatic pivot or tension builder before any chord. In a jazz jam it\'s a secret harmonic weapon.',
    voicings: [
      { name: 'Moveable box (any position)', use: 'Move up 3 frets for each inversion — same notes, different voice. Use whichever inversion sits closest to the chord you\'re resolving to.' },
      { name: 'High-neck 4-string', use: 'Clean and tight. Good for jazz where you want the tension colour without orchestral weight. The top string carries the characteristic tritone.' },
    ],
    licks: [
      {
        title: 'Dim7 arpeggio (symmetric)',
        style: 'Jazz / Classical',
        tab: 'e|--1-4-7-10--------|\nB|----------10-13---|\nG|------1-4---------|\nD|--2-5-------------|\n  (Bdim7: all notes 3 semitones apart)',
        tip: 'Every note is an equal minor 3rd apart. Moving up 3 frets lands you on the same chord — use this to shift register dramatically.',
      },
      {
        title: 'Chromatic resolution',
        style: 'Jazz',
        tab: 'e|--1-0--|\nB|--2-1--|\nG|--1-0--|\nD|--3-2--|\nA|--3-3--|\n  Bdim7 → Cmaj7 (half-step resolution)',
        tip: 'Each voice moves by just one semitone. This is why dim7 resolves so smoothly — voice leading at its most efficient.',
      },
    ],
    jamTips: [
      'A dim7 shape a half step above your target chord creates maximum tension before resolution. Before Cmaj7, play Bdim7 for one beat — the release will feel enormous.',
      'Every dim7 is an inversion of 3 others. Learn one shape and you have 12 roots covered — just move 3 frets at a time.',
      'In a jazz jam, place dim7 on the last beat of a phrase, not the first. The tension arrives just before the new section resolves.',
    ],
    loopPractice: [
      { title: 'Resolution contrast loop', body: 'Record a 4-bar loop: 3 bars Cmaj7, then exactly 1 beat of Bdim7 on the final "and" before the loop repeats. The contrast will be striking every time. Try different dim7 → resolution pairs to hear how universally this works.' },
    ],
  },

  half_dim: {
    jamRole: 'The ii chord in minor key jazz — where the tension journey begins. When you play this in a jam, you\'re saying "we\'re heading somewhere" and everyone leans in to hear where.',
    voicings: [
      { name: 'Standard (5th-string root)', use: 'Most common voicing. The b5 on top is the characteristic tension note — let it ring clearly so everyone hears the harmonic direction.' },
      { name: 'Compact 4-string (b3–b5–b7)', use: 'Jazz comping. Root, b3, b5, b7 — tight and dark. Perfect when comping behind a soloist who needs space.' },
    ],
    licks: [
      {
        title: 'Locrian colour phrase',
        style: 'Jazz',
        tab: 'e|--7-8-10--------|\nB|--------10-8-7--|\nG|--7-8-----------|\nD|--7-------------|\n  (Bm7b5: Locrian mode — b2, b3, b5, b7)',
        tip: 'The b5 is the defining note. Feature it in your phrase — it\'s what signals "half-diminished" to every musician in the room.',
      },
      {
        title: 'ii–V–i connection line',
        style: 'Jazz',
        tab: 'e|------7-8-10----------10-9---------|\nB|----8---------8-10-12------12-10---|\nG|--9---------------------------------|\n  (Bm7b5 → E7 → Am: melodic line through the ii–V–i)',
        tip: 'This phrase flows across all three chords. That\'s the goal: melodic lines that connect chords, not stop-start at each change.',
      },
    ],
    jamTips: [
      'The m7b5 almost always precedes a dominant 7th a 4th above it. If you\'re on Bm7b5, expect E7 next. Learn to anticipate — comp toward the V before it arrives.',
      'The characteristic note is the b5. Target it in your fills — it\'s the note that makes the chord sound "yearning" rather than just dark.',
      'In jazz comping, your chord stab on the ii should feel like tension loading. Don\'t resolve early — let the V chord do that work.',
    ],
    loopPractice: [
      { title: 'Minor ii–V–i drill', body: 'Record a 4-bar loop: 2 bars Bm7b5, 1 bar E7, 1 bar Am7. Practise this in Am until it\'s automatic, then transpose to other keys. Every jazz standard is built on variations of this — knowing it in all 12 keys is the single biggest unlock in jazz.' },
    ],
  },

  aug: {
    jamRole: 'A single beat of suspended tension. Augmented chords are almost always passing — one beat before resolving. In a jam, use one to add forward harmonic motion between two stable chords.',
    voicings: [
      { name: 'Standard augmented shape (moveable)', use: 'It\'s symmetric — any inversion works. Use whichever position sits closest to where you\'re going next.' },
      { name: 'Partial 4-string', use: 'Lighter touch. Use in a sparse jam where you want the aug colour without weight. The raised 5th on top is the defining note — keep it.' },
    ],
    licks: [
      {
        title: 'Whole-tone run',
        style: 'Jazz',
        tab: 'e|--5-7-9-10-12------|\nB|-------------12----|\nG|--4-6-8------------|\n  (whole-tone scale: all major 2nds — the natural scale over augmented)',
        tip: 'Every interval is a whole step. The scale has no "home" and sounds disorienting — which is exactly the aug chord feeling. Use it briefly then land on something stable.',
      },
      {
        title: 'I → aug → IV resolution',
        style: 'Jazz / Pop',
        tab: 'e|--0---0---1--|\nB|--1---1---1--|\nG|--0---1---2--|\nD|--2---2---3--|\nA|--3---3---3--|\nE|--x---x---x--|\n  Cmaj  Caug  F',
        tip: 'The aug chord is only one note different from the major — the 5th raised by one semitone. That one note creates all the forward motion into the IV.',
      },
    ],
    jamTips: [
      'The raised 5th wants to move up by a half step — follow it. C aug → F: the G# in Caug resolves naturally to A (the 3rd of F). That voice leading is the whole point.',
      'In jazz, if you hear an aug chord, stay light and brief. One voicing, then move — it\'s a raised eyebrow, not a full statement.',
      'Augmented works as a substitute for the V chord — both create tension that resolves to I. Try it in a major key jam as an unexpected colour.',
    ],
    loopPractice: [
      { title: 'I → aug → IV loop', body: 'Record a 4-bar loop: 1.5 bars C major, 0.5 bar Caug, 2 bars F. The augmented is just a moment — practise landing cleanly on the F. Once locked in, add a melodic phrase that follows the aug note (G#) upward to A on the F chord.' },
    ],
  },

  sus4: {
    jamRole: 'Creates anticipation without committing to major or minor. In a jam, use it to build tension before a major resolution, or sustain it for a floating open feel that invites any scale.',
    voicings: [
      { name: 'Open sus4 (Dsus4, Asus4)', use: 'Ring out beautifully. Best for creating space and expectation — especially effective in acoustic and ambient jams.' },
      { name: 'Barre sus4 → major', use: 'Rock and pop jams. Use the sus4 → major resolution as a rhythmic gesture: sus4 on the upbeat, major on the downbeat. The landing feels like a musical exhale.' },
      { name: 'Open string drone + sus4 shape', use: 'Andy Summers / Sting technique. Let high E or B ring open while the fretted notes move. Lush complexity from simple shapes — works beautifully with delay.' },
    ],
    licks: [
      {
        title: 'Sus4 → major rhythmic gesture',
        style: 'Rock / Pop',
        tab: 'e|--3---2---3---2--|\nB|--3---3---3---3--|\nG|--2---2---2---2--|\nD|--0---0---0---0--|\n  (Dsus4 → D → Dsus4 → D)',
        tip: 'The 4th (that one suspended note) resolves down to the 3rd. Let the sus4 hang for a full beat before resolving — the longer the tension, the sweeter the landing.',
      },
      {
        title: 'Open drone riff',
        style: 'Ambient / Rock',
        tab: 'e|--0---0---0---0--|\nB|--5---5---3---3--|\nG|--6---6---4---4--|\nD|--7---7---5---5--|\nA|--7---7---5---5--|\nE|--5---5---3---3--|\n  (C#sus4 riff — open high E rings throughout)',
        tip: 'The open high E string is the constant — it creates the suspension as the chord changes underneath it. This is The Police\'s entire harmonic language.',
      },
    ],
    jamTips: [
      'Sus4 is most powerful just before resolving — the longer you hold it, the more satisfying the major landing. Use it on the upbeat, resolve on the downbeat.',
      'In a jam, switching to sus4 on the I chord while others keep playing instantly changes the feel without a real chord change. Subtle and powerful.',
      'Pair sus4 with a delay effect (or the loop station reverb tail) for ambient, textural comping that leaves maximum space for other musicians.',
    ],
    loopPractice: [
      { title: 'Tension-release loop', body: 'Record a 2-bar loop: 1 bar sus4, 1 bar major (e.g. Dsus4 → D). Improvise over it, emphasising the 4th over the sus4 bar and resolving to the 3rd on the major bar — your melody mirrors the exact motion of the chord. Teach your ear to hear and resolve suspension.' },
    ],
  },

  sus2: {
    jamRole: 'The neutral canvas. Sus2 removes the 3rd — it\'s neither major nor minor. In a jam, it gives any soloist total freedom and creates a floating, modern texture that never clashes.',
    voicings: [
      { name: 'Open Asus2 / Dsus2', use: 'Key voicings. Open strings ring freely and the chord floats. Best in quieter or ambient jams — don\'t fight it with a heavy strum.' },
      { name: 'Capo + open sus2 shape', use: 'Any key, same open feel. Capo up and play Dsus2 or Asus2 shapes. Constant by Sting, Coldplay, The Edge — sus2 resonance in any key.' },
    ],
    licks: [
      {
        title: 'Sus2 arpeggio (floating)',
        style: 'Ambient / Pop',
        tab: 'e|--0-----------0--|\nB|--0---0---0------|\nG|----2---2--------|\nD|------2----------|\nA|--0-----------0--|\n  (Asus2: A–B–E — root, 2nd, 5th)',
        tip: 'The 2nd (9th) is the highest note — feature it in your voicing. It\'s the note that makes the chord float.',
      },
      {
        title: 'Single note melody over sus2 drone',
        style: 'Ambient',
        tab: 'e|--0-2-3-5-3-2-0--|\nB|--0-----------0--|\nG|--2-----------2--|\nD|--2-----------2--|\nA|--0-----------0--|\n  (Asus2 held, melody on string 1)',
        tip: 'Because there\'s no 3rd in the sus2, any major or minor scale note works as a melody. Total harmonic freedom.',
      },
    ],
    jamTips: [
      'Sus2 has no 3rd — soloists can play major OR minor scales over it and neither will clash. Use it as a harmonic reset between more defined chords.',
      'In a dense jam, switching from a full major chord to a sus2 is like opening a window — everyone hears and appreciates the space.',
      'The 9th (the 2nd up an octave) is your featured note. Build your voicing so it sits on top — that\'s what gives the chord its shimmer.',
    ],
    loopPractice: [
      { title: 'Neutral canvas loop', body: 'Record a sparse 4-bar sus2 loop — just a few arpeggiated notes, played quietly. Then add a second loop layer with a single sustained melody note. Try different melody notes and notice that none of them clash. That\'s the power of the sus2 as a backdrop.' },
    ],
  },

  maj6: {
    jamRole: 'Sweetened major — used in jazz, bossa nova, and vintage pop where a plain major feels too simple. Lush and nostalgic, it sits perfectly under a vocalist or a soloist\'s upper-register lines.',
    voicings: [
      { name: 'Open C6 / A6', use: 'Classic jazz and bossa starting points. Bright and warm — good comp chord for a vocalist. The 6th sits naturally on top.' },
      { name: '4-string voicing (no 5th, 6th on top)', use: 'Jazz comping — elegant and uncluttered. Drop the 5th, feature the 6th as the top note. This is how the chord sings in a jazz context.' },
    ],
    licks: [
      {
        title: 'Maj6 arpeggio',
        style: 'Jazz / Bossa',
        tab: 'e|--5-----------|\nB|----5---------|\nG|------5-4-2---|\nD|----------4-2-|\nA|--3-----------|\n  (C6: C–E–G–A, target the 6th = A)',
        tip: 'The 6th (A over C6) is the top of the arpeggio — treat it as the melody note and let everything else support it.',
      },
      {
        title: 'Bossa comp rhythm',
        style: 'Bossa Nova',
        tab: 'Thumb (T) on bass string, fingers (f) on chord:\n  T . f . T f . f | T . f . T f . f\n  1 . + . 2 + . + | 1 . + . 2 + . +\n  (the classic João Gilberto bossa strum)',
        tip: 'The thumb bass is as important as the chord — it defines the bossa feel. Keep it locked with the kick drum if there is one.',
      },
    ],
    jamTips: [
      'Maj6 and min7 are inversions of each other — C6 and Am7 share the same four notes. This means you can substitute one for the other in many contexts.',
      'Voice the chord so the 6th sits on top — it\'s the melody note. A maj6 with the root on top just sounds like a major chord with extra notes.',
      'In bossa nova, the I chord is often maj6 (not maj7). The 6th is sweeter and less mysterious than the 7th — it resolves more completely.',
    ],
    loopPractice: [
      { title: 'Bossa ii–V–I loop', body: 'Record a 4-bar loop: 1 bar Dm7, 1 bar G7, 2 bars Cmaj6. The most common jazz cadence. Practise until each change is effortless, then improvise a simple melody that lands on the 6th of the Cmaj6 as its final note — the sweetest possible resolution.' },
    ],
  },

  min6: {
    jamRole: 'Minor with unexpected brightness — the Dorian chord. The major 6th over a minor chord creates emotional complexity: dark and light at once. Essential in flamenco, tango, jazz, and anything Dorian.',
    voicings: [
      { name: 'Open Am6 (x02212)', use: 'The classic voicing. The F# on top is the 6th — it must ring clearly. This is the chord that defines the flamenco-jazz crossover sound.' },
      { name: 'Jazz tonic min6 (4-string)', use: 'In jazz minor jams, use min6 as the tonic instead of plain minor. It sounds resolved but never bland — more sophisticated than a plain triad.' },
    ],
    licks: [
      {
        title: 'Dorian descending line',
        style: 'Jazz / Funk',
        tab: 'e|--5-3-----------|\nB|------5-3-2-----|\nG|----------4-2---|\nD|-----------4-2--|\nA|--0-------------|\n  (A Dorian descending: A G F# E D C# B A)',
        tip: 'The F# (natural 6th) is what makes this Dorian, not natural minor. Feature it — it\'s the brightness inside the darkness.',
      },
      {
        title: 'Flamenco approach (Am → Am6)',
        style: 'Flamenco / Spanish',
        tab: 'e|--0---1---0------|\nB|--1---2---1------|\nG|--2---2---2------|\nD|--2---2---2------|\nA|--0---0---0------|\n  Am  Am6  Am  (the 6th appears and disappears)',
        tip: 'Letting the Am6 appear for just one beat creates the characteristic Spanish colour — like a flash of sunlight inside the minor mood.',
      },
    ],
    jamTips: [
      'The natural 6th in a minor chord IS the Dorian mode marker. If the jam is in Dorian (minor with raised 6th), min6 is the correct tonic — play it instead of plain minor.',
      'In a jazz minor jam, use min6 as the final resting point of a phrase. It sounds more resolved than min7 (which still wants to move) but darker than a plain major.',
      'The contrast between min6 and plain minor in the same phrase is a device — use it intentionally. Go to Am, then Am6, then back. The harmonic colour shifts are micro-movements of emotion.',
    ],
    loopPractice: [
      { title: 'Dorian vamp loop', body: 'Record a 4-bar Am loop — but on bar 3, switch to Am6 instead of plain Am. Notice how the F# lifts the sound. Improvise using the Dorian scale (natural minor with raised 6th) and specifically target the F# in your phrases. That note IS the sound.' },
    ],
  },

  add9: {
    jamRole: 'The modern open chord — spacious, unambiguous, never clashes. Add9 keeps the clarity of a triad but adds one note of colour. The sound of contemporary rock, pop, and folk jams.',
    voicings: [
      { name: 'Open Cadd9 (x32033)', use: 'The quintessential modern voicing. Ring and middle fingers on 3rd fret, open G and high E ring as the 9th. Perfect for pop and acoustic jams.' },
      { name: 'G / Cadd9 (anchor fingers 3–4)', use: 'Keep ring and pinky on strings 1–2 (fret 3) for BOTH G and Cadd9. Only your first two fingers move between the chords. This anchor technique is what makes the two chords sound seamless.' },
      { name: 'High position with open string drone', use: 'Use open strings as drones while fretting the add9 shape further up. Creates lush textural layers — very effective in ambient or layered jams.' },
    ],
    licks: [
      {
        title: 'Cadd9 arpeggio (the 9th rings)',
        style: 'Pop / Folk',
        tab: 'e|--3-----------3--|\nB|----3-------3----|\nG|------0---0------|\nD|--------2--------|\nA|--3-----------3--|\n  (Cadd9: root → 3rd → 9th — let the 9th ring over the whole phrase)',
        tip: 'The 9th (D over C) is the featured note — let it ring as long as possible. It\'s the note that makes the chord feel modern and open.',
      },
      {
        title: 'Melodic fill on string 1 between stabs',
        style: 'Rock / Pop',
        tab: 'e|--3---5---3---0---3--|\nB|--3-----------3---3--|\nG|--0-----------0---0--|\nD|--2-----------2---2--|\n  (Cadd9 chord stab, melody fill, back to chord)',
        tip: 'The fill on string 1 sits over the same chord shape — you\'re comping and filling at the same time. This technique makes you sound like two guitarists.',
      },
    ],
    jamTips: [
      'The Cadd9 ↔ G movement with anchored fingers 3–4 is the single most useful two-chord pattern in modern pop guitar. Master the anchor first.',
      'Unlike maj9, add9 has no 7th — it stays clean and unambiguous in a dense mix. Great when there\'s a keys player already adding 7ths.',
      'Let the 9th ring as a pedal note in your fills. The 2nd degree of the scale — heard an octave up — sounds modern every time and never conflicts with the harmony.',
    ],
    loopPractice: [
      { title: 'Anchor pattern loop', body: 'Record a 2-bar loop alternating Cadd9 and G, using the anchor technique (fingers 3–4 never lift). When the transition is smooth, start adding single-note fills on string 1 between the chord stabs — a lick on the "and" of beat 2, back to the chord on beat 3. You\'re now comping and leading simultaneously.' },
    ],
  },
}
