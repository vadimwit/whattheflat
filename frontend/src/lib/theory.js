// ─── Constants ───────────────────────────────────────────────────────────────

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
export const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

const SCALES = {
  major:            [0, 2, 4, 5, 7, 9, 11],
  minor:            [0, 2, 3, 5, 7, 8, 10],
  pentatonic_major: [0, 2, 4, 7, 9],
  pentatonic_minor: [0, 3, 5, 7, 10],
}

// Krumhansl-Schmuckler key profiles
const KS_MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
const KS_MINOR = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]

const CHORD_TYPES = {
  maj:  { intervals: [0, 4, 7],       suffix: '' },
  min:  { intervals: [0, 3, 7],       suffix: 'm' },
  dom7: { intervals: [0, 4, 7, 10],   suffix: '7' },
  maj7: { intervals: [0, 4, 7, 11],   suffix: 'maj7' },
  min7: { intervals: [0, 3, 7, 10],   suffix: 'm7' },
  dim:  { intervals: [0, 3, 6],       suffix: 'dim' },
  sus4: { intervals: [0, 5, 7],       suffix: 'sus4' },
  sus2: { intervals: [0, 2, 7],       suffix: 'sus2' },
}

const PROGRESSIONS = {
  pop:   { name: 'Pop',   rn: ['I', 'V', 'vi', 'IV'],  degrees: [0, 7, 9, 5] },
  blues: { name: 'Blues', rn: ['I', 'IV', 'V'],         degrees: [0, 5, 7] },
  folk:  { name: 'Folk',  rn: ['I', 'IV', 'I', 'V'],   degrees: [0, 5, 0, 7] },
  jazz:  { name: 'Jazz',  rn: ['ii', 'V', 'I'],         degrees: [2, 7, 0] },
  rock:  { name: 'Rock',  rn: ['I', 'bVII', 'IV', 'I'], degrees: [0, 10, 5, 0] },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function noteName(semitone) {
  return NOTES[((semitone % 12) + 12) % 12]
}

function correlation(a, b) {
  const meanA = a.reduce((s, v) => s + v, 0) / a.length
  const meanB = b.reduce((s, v) => s + v, 0) / b.length
  let num = 0, denA = 0, denB = 0
  for (let i = 0; i < a.length; i++) {
    const da = a[i] - meanA, db = b[i] - meanB
    num += da * db
    denA += da * da
    denB += db * db
  }
  return num / Math.sqrt(denA * denB + 1e-10)
}

// ─── Key Detection ───────────────────────────────────────────────────────────

/**
 * detectKey(noteHistory) → { root, mode, confidence }
 * noteHistory: array of MIDI note numbers or pitch-class integers (0–11)
 */
export function detectKey(noteHistory) {
  if (!noteHistory || noteHistory.length < 4) {
    return { root: 'C', mode: 'major', confidence: 0 }
  }

  // Build pitch class frequency vector
  const freq = new Array(12).fill(0)
  for (const note of noteHistory) {
    freq[((note % 12) + 12) % 12]++
  }

  let best = { root: 'C', mode: 'major', score: -Infinity }

  for (let root = 0; root < 12; root++) {
    // Rotate profile to match root
    const rotated = [...Array(12)].map((_, i) => freq[(i + root) % 12])

    const scoreMaj = correlation(rotated, KS_MAJOR)
    const scoreMin = correlation(rotated, KS_MINOR)

    if (scoreMaj > best.score) best = { root, mode: 'major', score: scoreMaj }
    if (scoreMin > best.score) best = { root, mode: 'minor', score: scoreMin }
  }

  // Normalise confidence to 0–1
  const confidence = Math.max(0, Math.min(1, (best.score + 1) / 2))

  return { root: noteName(best.root), mode: best.mode, confidence }
}

// ─── Scale helpers ───────────────────────────────────────────────────────────

export function getFullScale(root, mode) {
  const rootIdx = NOTES.indexOf(root)
  const intervals = SCALES[mode] ?? SCALES.major
  return intervals.map(i => noteName(rootIdx + i))
}

export function getPentatonicScale(root, mode) {
  const key = mode === 'minor' ? 'pentatonic_minor' : 'pentatonic_major'
  const rootIdx = NOTES.indexOf(root)
  return SCALES[key].map(i => noteName(rootIdx + i))
}

// ─── Chord helpers ───────────────────────────────────────────────────────────

export function getChordTones(chordName) {
  // Parse e.g. "Am", "G", "Fmaj7", "Bdim"
  const match = chordName.match(/^([A-G]#?)(.*)$/)
  if (!match) return []
  const root = NOTES.indexOf(match[1])
  const suffix = match[2] || ''

  for (const [, type] of Object.entries(CHORD_TYPES)) {
    if (type.suffix === suffix) {
      return type.intervals.map(i => noteName(root + i))
    }
  }
  // Default to major triad
  return CHORD_TYPES.maj.intervals.map(i => noteName(root + i))
}

export function getChordsInKey(root, mode) {
  const rootIdx = NOTES.indexOf(root)
  const scale = SCALES[mode] ?? SCALES.major

  return scale.map((degree, i) => {
    const chordRoot = rootIdx + degree
    // Determine chord quality from scale degree
    let type
    if (mode === 'major') {
      type = [CHORD_TYPES.maj, CHORD_TYPES.min, CHORD_TYPES.min,
               CHORD_TYPES.maj, CHORD_TYPES.maj, CHORD_TYPES.min,
               CHORD_TYPES.dim][i]
    } else {
      type = [CHORD_TYPES.min, CHORD_TYPES.dim, CHORD_TYPES.maj,
               CHORD_TYPES.min, CHORD_TYPES.min, CHORD_TYPES.maj,
               CHORD_TYPES.maj][i]
    }
    return noteName(chordRoot) + type.suffix
  })
}

// ─── Progression suggestions ─────────────────────────────────────────────────

export function getSuggestedProgressions(root, mode) {
  const rootIdx = NOTES.indexOf(root)
  const scale = SCALES[mode] ?? SCALES.major
  // Chord qualities for each scale degree
  const qualities = mode === 'major'
    ? ['', 'm', 'm', '', '', 'm', 'dim']
    : ['m', 'dim', '', 'm', 'm', '', '']

  return Object.entries(PROGRESSIONS).map(([genre, prog]) => {
    const chords = prog.degrees.map(semitones => {
      const noteIdx = (rootIdx + semitones) % 12
      const name = noteName(noteIdx)
      // Find which scale degree this is to get quality
      const degreeIdx = scale.indexOf(semitones)
      const quality = degreeIdx >= 0 ? qualities[degreeIdx] : ''
      return name + quality
    })
    return { genre: prog.name, rn: prog.rn, chords }
  })
}

// ─── Chroma-based chord matching ─────────────────────────────────────────────

/**
 * matchChordFromChroma(chroma, keyInfo, bassPC?, strictDiatonic?)
 * chroma: Float32Array[12], normalised 0–1 energy per pitch class
 * bassPC: pitch class of the detected bass/root note, or null
 * strictDiatonic: if true, only considers chords in the key (beginner mode)
 */
export function matchChordFromChroma(chroma, keyInfo, bassPC = null, strictDiatonic = false) {
  if (!keyInfo?.root) return null

  const diatonic = new Set(getChordsInKey(keyInfo.root, keyInfo.mode))

  // Match triads + dominant 7ths (blues/rock/band) + sus chords (rock guitar)
  const matchTypes = [
    CHORD_TYPES.maj,
    CHORD_TYPES.min,
    CHORD_TYPES.dom7,
    CHORD_TYPES.min7,
    CHORD_TYPES.dim,
    CHORD_TYPES.sus4,
  ]
  let best = { name: null, score: -Infinity }

  for (let r = 0; r < 12; r++) {
    for (const type of matchTypes) {
      const tones = new Set(type.intervals.map(i => (r + i) % 12))
      const chordName = noteName(r) + type.suffix

      if (strictDiatonic && !diatonic.has(chordName)) continue

      let inEnergy = 0, outEnergy = 0
      for (let pc = 0; pc < 12; pc++) {
        if (pc === r) {
          // Root note is the strongest identity signal — weight it double
          inEnergy += chroma[pc] * 2
        } else if (tones.has(pc)) {
          inEnergy += chroma[pc]
        } else {
          outEnergy += chroma[pc]
        }
      }
      if (inEnergy + outEnergy < 0.05) continue

      const coverageScore = inEnergy / (inEnergy + outEnergy * 0.5)
      // Bass note matching chord root is a strong harmonic signal
      const bassBonus     = (bassPC !== null && r === bassPC) ? 0.35 : 0
      const diatonicBonus = diatonic.has(chordName) ? 0.15 : 0

      const finalScore = coverageScore + bassBonus + diatonicBonus
      if (finalScore > best.score) best = { name: chordName, score: finalScore }
    }
  }

  return best.score > 0.42 ? best.name : null
}

// ─── Roman numeral notation ───────────────────────────────────────────────────

export function toRomanNumeral(chordName, keyRoot, keyMode) {
  if (!chordName || !keyRoot) return '?'
  const match = chordName.match(/^([A-G]#?)(.*)$/)
  if (!match) return '?'
  const [, root, quality] = match
  const chordRootIdx = NOTES.indexOf(root)
  const keyRootIdx   = NOTES.indexOf(keyRoot)
  if (chordRootIdx < 0 || keyRootIdx < 0) return '?'

  const semitones = ((chordRootIdx - keyRootIdx) + 12) % 12
  const scale = SCALES[keyMode] ?? SCALES.major
  const degreeIdx = scale.indexOf(semitones)
  if (degreeIdx < 0) return '♭' + ['I','II','III','IV','V','VI','VII'][0] // chromatic

  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
  const rn = ROMAN[degreeIdx]
  const isMinor = /^m(?!aj)/.test(quality) || quality === 'dim'
  return isMinor ? rn.toLowerCase() : rn
}

// ─── Repeating progression detection ─────────────────────────────────────────

/**
 * detectRepeatingProgression(history) → chord[] or null
 * Returns the most-recently-completed repeating pattern (length 2–6).
 * Requires the pattern to appear at least twice in the last 20 chords.
 */
export function detectRepeatingProgression(history) {
  if (!history || history.length < 4) return null
  const window = history.slice(-20)

  let best = null, bestScore = 0

  for (let len = 2; len <= 6; len++) {
    if (len * 2 > window.length) break
    const candidate = window.slice(-len)
    let reps = 0
    for (let i = 0; i <= window.length - len; i++) {
      if (window.slice(i, i + len).every((c, j) => c === candidate[j])) reps++
    }
    // Score favours longer patterns that repeat more
    const score = reps * len
    if (reps >= 2 && score > bestScore) {
      bestScore = score
      best = candidate
    }
  }
  return best
}
