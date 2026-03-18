// ─── Guitar voicing shapes ────────────────────────────────────────────────────
// Open string pitches (standard tuning): E A D G B e
const OPEN = [4, 9, 2, 7, 11, 4]  // pitch class per string [s6 … s1]

// Barre shape: offsets[] are fret distances from the root fret, per string [s6…s1].
// 'x' = muted.  rootStr = 1-indexed string that holds the root (6=low E, 5=A…).
// Open shape: frets[] are absolute fret numbers (0=open, 'x'=muted) for a specific root key.

const GUITAR_SHAPES = {
  maj: [
    { label: 'E Barre',     type: 'barre', rootStr: 6, offsets: [0,2,2,1,0,0], fingers: [1,3,4,2,1,1], barre: { fromStr: 1, toStr: 6, fo: 0 } },
    { label: 'A Barre',     type: 'barre', rootStr: 5, offsets: ['x',0,2,2,2,0], fingers: [0,1,3,4,2,1], barre: { fromStr: 1, toStr: 5, fo: 0 } },
    { label: 'D Shape',     type: 'barre', rootStr: 4, offsets: ['x','x',0,2,3,2], fingers: [0,0,1,3,4,2] },
    { label: 'G Shape',     type: 'barre', rootStr: 6, offsets: [0,-1,-3,-3,-3,0], fingers: [4,3,1,1,1,4] },
    { label: 'Open E',      type: 'open',  onlyRoot: 4,  frets: [0,2,2,1,0,0], fingers: [0,2,3,1,0,0] },
    { label: 'Open A',      type: 'open',  onlyRoot: 9,  frets: ['x',0,2,2,2,0], fingers: [0,0,1,2,3,0] },
    { label: 'Open G',      type: 'open',  onlyRoot: 7,  frets: [3,2,0,0,0,3], fingers: [2,1,0,0,0,3] },
    { label: 'Open C',      type: 'open',  onlyRoot: 0,  frets: ['x',3,2,0,1,0], fingers: [0,3,2,0,1,0] },
    { label: 'Open D',      type: 'open',  onlyRoot: 2,  frets: ['x','x',0,2,3,2], fingers: [0,0,0,1,3,2] },
  ],
  min: [
    { label: 'E Barre',     type: 'barre', rootStr: 6, offsets: [0,2,2,0,0,0], fingers: [1,3,4,1,1,1], barre: { fromStr: 1, toStr: 6, fo: 0 } },
    { label: 'A Barre',     type: 'barre', rootStr: 5, offsets: ['x',0,2,2,1,0], fingers: [0,1,3,4,2,1], barre: { fromStr: 1, toStr: 5, fo: 0 } },
    { label: 'D Shape',     type: 'barre', rootStr: 4, offsets: ['x','x',0,2,3,1], fingers: [0,0,1,3,4,2] },
    { label: 'Open Em',     type: 'open',  onlyRoot: 4,  frets: [0,2,2,0,0,0], fingers: [0,2,3,0,0,0] },
    { label: 'Open Am',     type: 'open',  onlyRoot: 9,  frets: ['x',0,2,2,1,0], fingers: [0,0,2,3,1,0] },
    { label: 'Open Dm',     type: 'open',  onlyRoot: 2,  frets: ['x','x',0,2,3,1], fingers: [0,0,0,2,3,1] },
  ],
  dom7: [
    { label: 'E7 Barre',    type: 'barre', rootStr: 6, offsets: [0,2,0,1,0,0], fingers: [1,3,0,2,1,1], barre: { fromStr: 1, toStr: 6, fo: 0 } },
    { label: 'A7 Barre',    type: 'barre', rootStr: 5, offsets: ['x',0,2,0,2,0], fingers: [0,1,2,0,3,0] },
    { label: 'D Shape',     type: 'barre', rootStr: 4, offsets: ['x','x',0,2,1,2], fingers: [0,0,1,3,2,4] },
    { label: 'Open E7',     type: 'open',  onlyRoot: 4,  frets: [0,2,0,1,0,0], fingers: [0,2,0,1,0,0] },
    { label: 'Open A7',     type: 'open',  onlyRoot: 9,  frets: ['x',0,2,0,2,0], fingers: [0,0,2,0,3,0] },
    { label: 'Open G7',     type: 'open',  onlyRoot: 7,  frets: [3,2,0,0,0,1], fingers: [3,2,0,0,0,1] },
    { label: 'Open D7',     type: 'open',  onlyRoot: 2,  frets: ['x','x',0,2,1,2], fingers: [0,0,0,2,1,3] },
    { label: 'Open B7',     type: 'open',  onlyRoot: 11, frets: ['x',2,1,2,0,2], fingers: [0,2,1,3,0,4] },
  ],
  maj7: [
    { label: 'E Barre',     type: 'barre', rootStr: 6, offsets: [0,2,1,1,0,0], fingers: [1,3,2,2,1,1], barre: { fromStr: 1, toStr: 6, fo: 0 } },
    { label: 'A Barre',     type: 'barre', rootStr: 5, offsets: ['x',0,2,1,2,0], fingers: [0,1,3,2,4,1], barre: { fromStr: 1, toStr: 2, fo: 0 } },
    { label: 'D Shape',     type: 'barre', rootStr: 4, offsets: ['x','x',0,2,2,2], fingers: [0,0,1,2,3,4], barre: { fromStr: 1, toStr: 3, fo: 2 } },
    { label: 'Open Cmaj7',  type: 'open',  onlyRoot: 0,  frets: ['x',3,2,0,0,0], fingers: [0,3,2,0,0,0] },
    { label: 'Open Amaj7',  type: 'open',  onlyRoot: 9,  frets: ['x',0,2,1,2,0], fingers: [0,0,2,1,3,0] },
    { label: 'Open Emaj7',  type: 'open',  onlyRoot: 4,  frets: [0,2,1,1,0,0], fingers: [0,2,1,1,0,0] },
  ],
  min7: [
    { label: 'E Barre',     type: 'barre', rootStr: 6, offsets: [0,2,0,0,0,0], fingers: [1,3,1,1,1,1], barre: { fromStr: 1, toStr: 6, fo: 0 } },
    { label: 'A Barre',     type: 'barre', rootStr: 5, offsets: ['x',0,2,0,1,0], fingers: [0,1,3,1,2,1], barre: { fromStr: 1, toStr: 5, fo: 0 } },
    { label: 'D Shape',     type: 'barre', rootStr: 4, offsets: ['x','x',0,2,1,1], fingers: [0,0,1,3,2,2] },
    { label: 'Open Em7',    type: 'open',  onlyRoot: 4,  frets: [0,2,0,0,0,0], fingers: [0,2,0,0,0,0] },
    { label: 'Open Am7',    type: 'open',  onlyRoot: 9,  frets: ['x',0,2,0,1,0], fingers: [0,0,2,0,1,0] },
    { label: 'Open Dm7',    type: 'open',  onlyRoot: 2,  frets: ['x','x',0,2,1,1], fingers: [0,0,0,3,1,2] },
  ],
  dim: [
    { label: 'A Barre',     type: 'barre', rootStr: 5, offsets: ['x',0,1,2,1,'x'], fingers: [0,1,2,4,3,0] },
    { label: 'Compact',     type: 'barre', rootStr: 4, offsets: ['x','x',0,1,3,1], fingers: [0,0,1,2,4,3] },
  ],
  dim7: [
    { label: 'Movable Box', type: 'barre', rootStr: 5, offsets: ['x',0,1,2,1,2], fingers: [0,1,2,4,3,4] },
    { label: 'Compact',     type: 'barre', rootStr: 4, offsets: ['x','x',0,1,0,1], fingers: [0,0,1,2,3,4] },
  ],
  aug: [
    { label: 'E Barre',     type: 'barre', rootStr: 6, offsets: [0,3,2,1,1,0], fingers: [1,4,3,2,2,1] },
    { label: 'Compact',     type: 'barre', rootStr: 5, offsets: ['x',0,3,2,2,'x'], fingers: [0,1,4,2,3,0] },
  ],
  sus4: [
    { label: 'E Barre',     type: 'barre', rootStr: 6, offsets: [0,2,2,2,0,0], fingers: [1,2,3,4,1,1], barre: { fromStr: 1, toStr: 6, fo: 0 } },
    { label: 'A Barre',     type: 'barre', rootStr: 5, offsets: ['x',0,2,2,3,0], fingers: [0,1,2,3,4,0] },
    { label: 'D Shape',     type: 'barre', rootStr: 4, offsets: ['x','x',0,2,3,3], fingers: [0,0,1,2,3,4] },
    { label: 'Open Asus4',  type: 'open',  onlyRoot: 9,  frets: ['x',0,2,2,3,0], fingers: [0,0,1,2,4,0] },
    { label: 'Open Dsus4',  type: 'open',  onlyRoot: 2,  frets: ['x','x',0,2,3,3], fingers: [0,0,0,1,2,3] },
  ],
  sus2: [
    { label: 'E Barre',     type: 'barre', rootStr: 6, offsets: [0,2,4,4,0,0], fingers: [1,2,4,4,1,1], barre: { fromStr: 1, toStr: 6, fo: 0 } },
    { label: 'A Barre',     type: 'barre', rootStr: 5, offsets: ['x',0,2,4,0,0], fingers: [0,1,2,4,1,1], barre: { fromStr: 1, toStr: 2, fo: 0 } },
    { label: 'D Shape',     type: 'barre', rootStr: 4, offsets: ['x','x',0,2,3,0], fingers: [0,0,1,2,3,0] },
    { label: 'Open Asus2',  type: 'open',  onlyRoot: 9,  frets: ['x',0,2,2,0,0], fingers: [0,0,1,2,0,0] },
    { label: 'Open Dsus2',  type: 'open',  onlyRoot: 2,  frets: ['x','x',0,2,3,0], fingers: [0,0,0,1,3,0] },
  ],
  half_dim: [
    { label: 'A Barre',     type: 'barre', rootStr: 5, offsets: ['x',0,1,0,1,'x'], fingers: [0,1,2,0,3,0] },
    { label: 'E Barre',     type: 'barre', rootStr: 6, offsets: [0,1,2,0,0,'x'], fingers: [1,2,3,1,1,0], barre: { fromStr: 2, toStr: 6, fo: 0 } },
  ],
  maj6: [
    { label: 'E Barre',     type: 'barre', rootStr: 6, offsets: [0,2,2,1,2,0], fingers: [1,3,4,2,4,1], barre: { fromStr: 1, toStr: 6, fo: 0 } },
    { label: 'A Barre',     type: 'barre', rootStr: 5, offsets: ['x',0,2,2,2,2], fingers: [0,1,2,3,4,4], barre: { fromStr: 1, toStr: 2, fo: 2 } },
  ],
  min6: [
    { label: 'E Barre',     type: 'barre', rootStr: 6, offsets: [0,2,2,0,2,0], fingers: [1,3,4,1,4,1], barre: { fromStr: 1, toStr: 6, fo: 0 } },
  ],
  add9: [
    { label: 'E Barre',     type: 'barre', rootStr: 6, offsets: [0,2,4,1,0,2], fingers: [1,2,4,3,1,1], barre: { fromStr: 1, toStr: 6, fo: 0 } },
    { label: 'Open Cadd9',  type: 'open',  onlyRoot: 0,  frets: ['x',3,2,0,3,0], fingers: [0,3,2,0,4,0] },
    { label: 'Open Gadd9',  type: 'open',  onlyRoot: 7,  frets: [3,2,0,2,3,3], fingers: [2,1,0,3,4,4] },
    { label: 'Open Dadd9',  type: 'open',  onlyRoot: 2,  frets: ['x','x',0,2,3,0], fingers: [0,0,0,1,3,0] },
  ],
}

// ─── Piano techniques ─────────────────────────────────────────────────────────
// Each technique has intervals for left hand (LH) and right hand (RH) in semitones above root.
// Negative values go one octave below root. Labels appear on the keys.

export const PIANO_TECHNIQUES = {
  maj: [
    {
      name: 'Full Chord',
      desc: 'Classic voicing — root in left, triad in right',
      tip: 'Anchor the root alone in your left hand, lock into the rhythm, let right hand sing.',
      lh: [0],
      rh: [0, 4, 7],
    },
    {
      name: 'Root + 5th',
      desc: 'Open, powerful — ambiguous major/minor quality',
      tip: 'Stack octave + fifth in left hand. Works over major or minor — great for tense moments.',
      lh: [0, 7],
      rh: [0, 4, 7, 12],
    },
    {
      name: 'Root + Octave',
      desc: 'Thunderous low end — fills space in a band',
      tip: 'Octave doubles in left hand, full chord in right. Huge sound in lower registers.',
      lh: [0, 12],
      rh: [4, 7, 12],
    },
    {
      name: 'Spread Voicing',
      desc: 'Wide, orchestral — two octaves apart',
      tip: 'Split the chord wide: 5th in left, 3rd + 5th above the octave in right. Very cinematic.',
      lh: [0, 7],
      rh: [12, 16, 19],
    },
    {
      name: 'Suspended Approach',
      desc: 'Play sus4 → resolve to major — creates motion',
      tip: 'Hit sus4 (replace 3rd with 4th) then release to the major 3rd. Works great in slow ballads.',
      lh: [0],
      rh: [0, 5, 7],
    },
  ],
  min: [
    {
      name: 'Full Chord',
      desc: 'Classic minor voicing — dark and rich',
      tip: 'The minor 3rd is everything. Let it ring — do not rush to resolve.',
      lh: [0],
      rh: [0, 3, 7],
    },
    {
      name: 'Root + 5th',
      desc: 'Open ambiguity — dramatic without the sadness',
      tip: 'Power chord in both hands. Hides the minor quality — use when you want tension without gloom.',
      lh: [0, 7],
      rh: [0, 7, 12],
    },
    {
      name: 'Root + Octave',
      desc: 'Deep anchor — gives bass player space',
      tip: 'Octave in left only. Right hand plays the minor chord high up for contrast.',
      lh: [0, 12],
      rh: [3, 7, 12],
    },
    {
      name: 'Spread Minor',
      desc: 'Atmospheric and wide — film score territory',
      tip: 'Wide spacing on minor chords feels melancholic and vast. Popular in ambient and cinematic styles.',
      lh: [0, 7],
      rh: [12, 15, 19],
    },
    {
      name: 'Minor + Add9',
      desc: 'Add the 9th (2nd) — aching, bittersweet quality',
      tip: 'Replace or add the 9th to minor. Radiohead, Portishead, modern soul — this interval is gold.',
      lh: [0],
      rh: [0, 3, 7, 14],
    },
  ],
  dom7: [
    {
      name: 'Full Dom7',
      desc: 'Classic dominant — loaded with tension',
      tip: 'The tritone between the 3rd and ♭7th creates all the tension. Let it ring before resolving.',
      lh: [0],
      rh: [0, 4, 7, 10],
    },
    {
      name: 'Shell Voicing (1-3-♭7)',
      desc: 'Skip the 5th — lean, jazz-approved',
      tip: 'Root + major 3rd + ♭7th. The tritone is intact, 5th is redundant. Classic jazz comp technique.',
      lh: [0],
      rh: [4, 10],
    },
    {
      name: 'Rootless Voicing',
      desc: 'Advanced comping — let bass hold the root',
      tip: 'No root in your hands at all. 3rd in left, upper structure in right. Very sophisticated sound.',
      lh: [4],
      rh: [7, 10, 14],
    },
    {
      name: 'Blues Stomp',
      desc: 'Root + 5th left, add ♭7 right — R&B classic',
      tip: 'Left hand pumps root-5th pattern, right hand stabs the dominant 7th chord. Classic gospel/blues.',
      lh: [0, 7],
      rh: [0, 4, 10],
    },
    {
      name: 'Tritone Sub',
      desc: 'Replace with the chord a tritone away',
      tip: 'G7 can be replaced with Db7 — they share the same tritone (F and B). Mind-bending jazz move.',
      lh: [6],
      rh: [10, 14, 16],
    },
  ],
  maj7: [
    {
      name: 'Full Maj7',
      desc: 'Dreamy, floating — jazz and bossa nova',
      tip: 'The major 7th creates a luminous, slightly unresolved quality. Do not over-play it — let it breathe.',
      lh: [0],
      rh: [0, 4, 7, 11],
    },
    {
      name: 'Shell (1-3-7)',
      desc: 'Root + 3rd + maj7 — lush and clean',
      tip: 'Skip the 5th. The major 7th directly above the root defines the chord without clutter.',
      lh: [0],
      rh: [4, 11],
    },
    {
      name: 'Spread Maj7',
      desc: 'Maj7 in left hand — wide, orchestral texture',
      tip: 'Place the 7th below the root (or an octave down). Creates a spacious, choir-like sound.',
      lh: [0, 11],
      rh: [12, 16, 19],
    },
    {
      name: 'Add9 Variation',
      desc: 'Add the 9th for extra colour',
      tip: 'Maj9 territory. Remove the root in the right hand, add the 9th (D for Cmaj9). Very smooth.',
      lh: [0],
      rh: [4, 7, 11, 14],
    },
  ],
  min7: [
    {
      name: 'Full Min7',
      desc: 'Smooth and mellow — soul and jazz workhorse',
      tip: 'The minor 7th chord is the most versatile in jazz. Comp behind everything with this.',
      lh: [0],
      rh: [0, 3, 7, 10],
    },
    {
      name: 'Shell (1-♭3-♭7)',
      desc: 'Just the 3rd and 7th in right — spacious',
      tip: 'Root in left, minor 3rd + minor 7th in right. Leaves maximum space for the soloist.',
      lh: [0],
      rh: [3, 10],
    },
    {
      name: 'Rootless Min7',
      desc: 'No root — upper structure only',
      tip: '♭3rd in left, build up from there. Very advanced jazz voicing — trust the bass player.',
      lh: [3],
      rh: [10, 14, 15],
    },
    {
      name: 'Spread Atmospheric',
      desc: 'Wide voicing — ambient and cinematic',
      tip: 'Minor 7ths voiced wide feel endless. Great for intro sections or building tension.',
      lh: [0, 7],
      rh: [10, 15, 19],
    },
  ],
  dim: [
    {
      name: 'Full Diminished',
      desc: 'All three tones — tense and unstable',
      tip: 'Always wants to resolve. Use as a passing chord between diatonic chords.',
      lh: [0],
      rh: [0, 3, 6],
    },
    {
      name: 'Octave + Dim',
      desc: 'Root octave in left — more weight',
      tip: 'Dim triads are thin — doubling the root in left hand adds body.',
      lh: [0, 12],
      rh: [3, 6, 12],
    },
  ],
  dim7: [
    {
      name: 'Full Dim7',
      desc: 'Symmetrical — repeats every 3 frets',
      tip: 'Any note in a dim7 chord can be the root. It modulates effortlessly. Horror/drama gold.',
      lh: [0],
      rh: [0, 3, 6, 9],
    },
    {
      name: 'Arpeggiated',
      desc: 'Roll the notes — tension without crash',
      tip: 'Roll from bottom to top quickly. Dim7 arpeggios feel like falling — use before a big resolve.',
      lh: [0, 3],
      rh: [6, 9, 12],
    },
  ],
  aug: [
    {
      name: 'Full Augmented',
      desc: 'Dreamy, unresolved — whole-tone territory',
      tip: 'Aug chords are symmetrical like dim7 — every inversion sounds the same. Very otherworldly.',
      lh: [0],
      rh: [0, 4, 8],
    },
    {
      name: 'Spread Aug',
      desc: 'Wide voicing — maximises the instability',
      tip: 'Spread over two octaves. The raised 5th wants to resolve up — let the listener feel the pull.',
      lh: [0, 8],
      rh: [12, 16, 20],
    },
  ],
  sus4: [
    {
      name: 'Full Sus4',
      desc: 'Suspended — neither major nor minor',
      tip: 'Ambiguous and open. Resolve down to the major 3rd for instant satisfaction.',
      lh: [0],
      rh: [0, 5, 7],
    },
    {
      name: 'Sus4 → Major',
      desc: 'Play sus4 then resolve — creates motion',
      tip: 'Hit sus4 on the beat, release to major on the off-beat. The oldest trick in the book.',
      lh: [0],
      rh: [5, 7, 12],
    },
    {
      name: 'Root + 5th + Sus',
      desc: 'Power chord with the fourth on top',
      tip: 'Very rock and dramatic. The sus4 on top gives it an anthemic, U2-esque quality.',
      lh: [0, 7],
      rh: [7, 12, 17],
    },
  ],
  sus2: [
    {
      name: 'Full Sus2',
      desc: 'Open, airy — the 2nd instead of 3rd',
      tip: 'Sus2 chords feel free and unanchored. Great for intros and ambient sections.',
      lh: [0],
      rh: [0, 2, 7],
    },
    {
      name: 'Spread Sus2',
      desc: 'Wide and spacious — very ambient',
      tip: 'The 2nd voiced wide feels like an open landscape. Sigur Rós territory.',
      lh: [0, 7],
      rh: [12, 14, 19],
    },
  ],
  half_dim: [
    {
      name: 'Full m7♭5',
      desc: 'Half-diminished — minor 7th with flat 5',
      tip: 'The ii chord in minor keys (e.g. Bø in C minor). Tense but smoother than full diminished.',
      lh: [0],
      rh: [0, 3, 6, 10],
    },
    {
      name: 'Shell (1-♭3-♭7)',
      desc: 'Skip the flat 5 — cleaner jazz comp',
      tip: 'The ♭5 is optional in jazz. Root + minor 3rd + minor 7th is clean and functional.',
      lh: [0],
      rh: [3, 10],
    },
  ],
  maj6: [
    {
      name: 'Full Maj6',
      desc: 'Major with added 6th — vintage jazz sound',
      tip: 'Maj6 and min7 are inversions of each other. Interchangeable in many jazz contexts.',
      lh: [0],
      rh: [0, 4, 7, 9],
    },
    {
      name: 'Shell (1-3-6)',
      desc: 'Clean and retro — skip the 5th',
      tip: 'The 6th adds sweetness without too much colour. Django Reinhardt loved this voicing.',
      lh: [0],
      rh: [4, 9],
    },
  ],
  min6: [
    {
      name: 'Full Min6',
      desc: 'Minor with major 6th — exotic and dark',
      tip: 'The major 6th over a minor triad is a flamenco and tango staple. Very striking colour.',
      lh: [0],
      rh: [0, 3, 7, 9],
    },
    {
      name: 'Shell (1-♭3-6)',
      desc: 'Tense and colourful — the ♭3+6 tension',
      tip: 'The minor 3rd + major 6th interval is the characteristic clash of min6. Lean into it.',
      lh: [0],
      rh: [3, 9],
    },
  ],
  add9: [
    {
      name: 'Full Add9',
      desc: 'Major chord + 9th — no 7th, stays bright',
      tip: 'The 9th adds colour without the jazz sophistication of maj9. Feels modern and open.',
      lh: [0],
      rh: [0, 4, 7, 14],
    },
    {
      name: 'No Root Add9',
      desc: 'Skip root in right — 3rd + 9th float',
      tip: 'Root in left, right hand plays 3rd + 5th + 9th. Airy and modern — Radiohead / Coldplay territory.',
      lh: [0],
      rh: [4, 7, 14],
    },
    {
      name: 'Sus2-style',
      desc: 'Add9 voiced as sus2 clusters',
      tip: 'Place the 9th close to the root (2nd instead of 9th). Creates a shimmering cluster effect.',
      lh: [0, 7],
      rh: [2, 4, 7],
    },
  ],
}

// Fallback for chord types not in the map
const GENERIC_PIANO = [
  {
    name: 'Full Chord',
    desc: 'Root in left, chord tones in right',
    tip: 'Play the chord tones in right hand while anchoring the root in the left.',
    lh: [0],
    rh: [0],  // will be replaced by computed intervals
  },
]

// ─── Compute functions ────────────────────────────────────────────────────────

// Parse a chord name like "C#m7" → { rootPc: 1, type: 'min7' }
// Mirrors the logic in theory.js parseChord
function parseChord(name) {
  if (!name) return null
  const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
  const NOTES_FLAT = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B']
  const suffixMap = {
    '': 'maj', 'm': 'min', 'min': 'min', 'maj': 'maj',
    '7': 'dom7', 'maj7': 'maj7', 'm7': 'min7', 'min7': 'min7',
    'dim': 'dim', 'dim7': 'dim7', 'm7b5': 'half_dim', 'ø': 'half_dim', 'ø7': 'half_dim',
    'aug': 'aug', '+': 'aug',
    'sus4': 'sus4', 'sus2': 'sus2',
    '6': 'maj6', 'm6': 'min6', 'min6': 'min6',
    'add9': 'add9',
  }

  let rest = name
  let root = ''
  if (rest.length > 1 && (rest[1] === '#' || rest[1] === 'b')) {
    root = rest.slice(0, 2); rest = rest.slice(2)
  } else {
    root = rest.slice(0, 1); rest = rest.slice(1)
  }

  let rootPc = NOTES.indexOf(root)
  if (rootPc === -1) rootPc = NOTES_FLAT.indexOf(root)
  if (rootPc === -1) return null

  const type = suffixMap[rest] ?? 'maj'
  return { rootPc, type }
}

/**
 * Returns an array of voicing objects for a given chord name.
 * Each voicing: { label, frets[6], fingers[6], barre?, baseFret }
 * frets values: number (fret) or 'x' (muted) or 0 (open)
 */
export function getGuitarVoicings(chordName) {
  const parsed = parseChord(chordName)
  if (!parsed) return []
  const { rootPc, type } = parsed
  const shapes = GUITAR_SHAPES[type] ?? GUITAR_SHAPES.maj

  const result = []

  for (const shape of shapes) {
    if (shape.type === 'open') {
      if (shape.onlyRoot !== undefined && shape.onlyRoot !== rootPc) continue
      result.push({
        label:    shape.label,
        frets:    shape.frets,
        fingers:  shape.fingers,
        barre:    null,
        baseFret: 1,
      })
      continue
    }

    // barre shape: compute rootFret on rootStr
    const strIdx = shape.rootStr - 1  // 0=s6 … 5=s1
    const openPc = OPEN[strIdx]
    let rootFret = (rootPc - openPc + 12) % 12

    // Compute absolute frets
    const frets = shape.offsets.map((off, i) => {
      if (off === 'x') return 'x'
      return rootFret + off
    })

    // Skip impossible positions
    if (frets.some(f => typeof f === 'number' && f < 0)) continue
    const maxFret = Math.max(...frets.filter(f => f !== 'x'))
    if (maxFret > 15) continue

    // baseFret: start diagram so the chord fits in 5 frets
    const minFret = Math.min(...frets.filter(f => f !== 'x' && f > 0))
    const baseFret = rootFret === 0 ? 1 : Math.max(1, minFret)

    // Compute barre position if applicable
    let barre = null
    if (shape.barre) {
      barre = {
        fret:     rootFret + shape.barre.fo,
        fromStr:  shape.barre.fromStr,
        toStr:    shape.barre.toStr,
      }
    }

    // For open-string E/A chords (rootFret=0), no barre needed
    if (rootFret === 0) barre = null

    result.push({
      label:    shape.label + (rootFret === 0 ? ' (Open)' : rootFret > 5 ? ` — Fret ${rootFret}` : ''),
      frets,
      fingers:  shape.fingers,
      barre,
      baseFret,
    })
  }

  return result
}

/**
 * Returns piano techniques for a chord name.
 * Each technique has: { name, desc, tip, lh (intervals), rh (intervals) }
 */
export function getPianoTechniques(chordName) {
  const parsed = parseChord(chordName)
  if (!parsed) return []
  const { type } = parsed
  return PIANO_TECHNIQUES[type] ?? GENERIC_PIANO
}

export { parseChord }
