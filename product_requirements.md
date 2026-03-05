# WhatTheFlat 🎸
### Product Requirements Document v0.1

> *Open-source live jam analyzer — helping musicians find the key, follow the harmony, and level up together.*

---

## 1. Vision

**WhatTheFlat** is a free, open-source web app that listens to a live jam session in real time, identifies the key and chord being played, and displays beginner-friendly guidance — scales, next chords, and simple melodic patterns — so every musician in the room can contribute, regardless of experience level.

The core belief: **jams should be inclusive**. A seasoned guitarist shouldn't have to stop to explain music theory. WhatTheFlat does it for them, silently, in real time.

---

## 2. Problem Statement

- Amateur musicians struggle to find the key when joining a jam they didn't start
- Beginners don't know which notes are "safe" to play over a chord progression
- There's no affordable, low-friction tool that bridges music theory and live performance
- Existing tools (like guitar tuners or DAWs) are either too simple or too complex

---

## 3. Target Users

| User | Description |
|---|---|
| **The Beginner** | Just started an instrument, wants to follow along without killing the vibe |
| **The Intermediate** | Knows a few scales but struggles to apply theory in real time |
| **The Jam Host** | Sets up the session and wants everyone to stay in the same key |
| **The Teacher** | Uses jams as a teaching tool, wants visual aids for students |

---

## 4. Core Features

### 4.1 Live Key Detection
- Capture audio from device microphone in real time
- Analyze incoming audio using pitch detection (e.g. YIN algorithm or ML model)
- Identify the **root note** and **mode** (major, minor, dorian, mixolydian, etc.)
- Display current detected key prominently: e.g. **"You're in A Minor"**
- Show confidence level so users understand when detection is uncertain
- Latency target: < 500ms from sound to display

### 4.2 Chord Recognition
- Detect the chord being played in real time
- Show chord name: e.g. **Am → F → C → G**
- Build a live scrolling chord history for the last 30 seconds
- Highlight the current chord in the progression

### 4.3 Chord Progression Suggestions
- Based on detected key, suggest common chord progressions that fit
- Categorize by genre/feel: Blues, Jazz, Folk, Rock, Pop
- Show the progression in Roman numeral notation (I–IV–V) AND actual chord names
- Allow user to tap/click a suggested progression to "lock it in" as a reference

### 4.4 Beginner Melody Helper
- For the detected key, show a visual **"safe notes"** panel — a highlighted instrument diagram
  - Guitar fretboard view
  - Piano keyboard view
  - Generic note list (for other instruments)
- Show the **pentatonic scale** first (most beginner-friendly), with option to expand to full scale
- Highlight notes that sound especially good over the current chord (chord tones)
- Show a simple **melodic pattern of the bar** — a looping, beginner-friendly phrase they can follow

### 4.5 Visual Jam Dashboard
- Clean, readable display meant to be seen from across a room
- Show at a glance:
  - Current key
  - Current chord
  - Next likely chord (based on progression history)
  - Safe notes to play
- Dark mode by default (stage-friendly)
- Large font, high contrast

### 4.6 AI Music Theory Assistant (Claude Integration)
- Powered by Anthropic's Claude API
- Users can ask questions like:
  - *"What's a good lick to play over this chord?"*
  - *"Why does the F chord sound tense here?"*
  - *"Give me a beginner melody in this key"*
- Claude responds in plain, non-jargon language
- Can suggest chord substitutions, extensions (7ths, 9ths), and passing chords
- All responses are **beginner-aware** — no unexplained jargon

---

## 5. MVP Scope (v0.1)

For the first open-source demo, the MVP should deliver:

- [x] Microphone capture in browser (Web Audio API)
- [x] Pitch detection → key identification
- [x] Display current key and detected chord
- [x] Show pentatonic scale for detected key (note list + basic fretboard)
- [x] 3–5 suggested chord progressions that fit the key
- [x] Claude-powered chat assistant for theory questions
- [x] Dark mode UI, mobile-friendly

**Not in MVP:**
- Multi-instrument separation
- MIDI input support
- Session recording/export
- User accounts or history
- Real-time collaboration (multiple users same session)

---

## 6. Technical Architecture

### Frontend
- **Framework**: React (Vite)
- **Audio**: Web Audio API + `pitchy` or `aubio.js` for pitch detection
- **Visualizations**: `Tone.js` for music utilities, custom SVG for fretboard/keyboard
- **Styling**: Tailwind CSS
- **Hosting**: Vercel / Netlify (static deploy)

### AI Layer
- **Model**: Claude (`claude-sonnet-4-20250514`) via Anthropic API
- **Usage**:
  - Theory assistant chat
  - Chord progression generation given key + genre
  - Melody suggestion generation
- **Prompt strategy**: System prompt primes Claude as a friendly, beginner-aware music teacher

### Audio Pipeline
```
Microphone Input
    ↓
Web Audio API (AudioContext)
    ↓
Pitch Detection (YIN / pitchy)
    ↓
Note → Chord Identification
    ↓
Key Estimation (sliding window analysis)
    ↓
UI Update + Claude Context Refresh
```

### Open Source Stack
- Repo: GitHub (MIT License)
- CI: GitHub Actions
- Contributing: standard fork/PR model with CONTRIBUTING.md

---

## 7. Music Theory Engine

The core theory logic should be implemented as a standalone JS module (`@whattheflat/theory`) so it can be reused or contributed to independently.

### Required functions:
```
detectKey(noteHistory[]) → { root, mode, confidence }
getChordsInKey(root, mode) → Chord[]
getSuggestedProgressions(root, mode, genre?) → Progression[]
getPentatonicScale(root, mode) → Note[]
getFullScale(root, mode) → Note[]
getChordTones(chord) → Note[]
getBeginnerPattern(key, currentChord) → MelodicPattern
```

### Modes to support (MVP):
- Major (Ionian)
- Natural Minor (Aeolian)
- Pentatonic Major
- Pentatonic Minor

### Modes to support (v1+):
- Dorian, Mixolydian, Lydian, Phrygian
- Blues scale
- Harmonic minor

---

## 8. UX Principles

1. **Readable at distance** — primary info visible from 2 metres away
2. **Zero setup** — tap "Start Listening", grant mic permission, done
3. **Non-judgmental** — never says "wrong note", always says "try these"
4. **Progressive complexity** — beginners see pentatonic; advanced users can unlock modes, extensions, substitutions
5. **Mobile first** — works on a phone propped up on a music stand

---

## 9. Beginner Learning Path (stretch goal)

A guided progression for users who want to improve over time:

| Level | Unlocks |
|---|---|
| 🟢 Starter | Pentatonic scale, 3 safe chords |
| 🔵 Follower | Full diatonic scale, chord tones highlighted |
| 🟣 Contributor | Chord extensions (7th, 9th), passing chords |
| 🔴 Improvisor | Modal awareness, substitutions, AI-generated licks |

Progress is stored in localStorage — no account needed.

---

## 10. Open Source Contribution Areas

| Area | Skills needed |
|---|---|
| Pitch detection accuracy | DSP, audio engineering |
| Music theory engine | Music theory + JavaScript |
| Instrument diagrams | SVG, React |
| Genre-specific progressions | Music knowledge |
| Claude prompt engineering | AI, music theory |
| Accessibility (screen readers, colorblind modes) | A11y |
| Mobile app wrapper | React Native / Capacitor |
| Translation / i18n | Language + music terminology |

---

## 11. Success Metrics

- Time from opening app to understanding what key they're in: **< 10 seconds**
- % of beginner users who successfully play a note in the right key on first jam: **target 80%**
- GitHub stars at 3 months: **500+**
- Average Claude assistant response usefulness (self-reported): **> 4/5**

---

## 12. Name & Branding Notes

- **Name**: WhatTheFlat
- **Tagline**: *"Real-time key detection for real humans"*
- **Tone**: Warm, slightly cheeky, musician-coded humour
- **Logo concept**: A flat symbol (♭) with a question mark or waveform integrated
- **Color palette**: Dark background (#0f0f0f), accent in electric purple or warm amber

---

*Document maintained by the WhatTheFlat open source community. PRs welcome.*