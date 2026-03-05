# WhatTheFlat

Real-time key and chord detection for musicians. Play guitar, bass, piano, or any instrument into your microphone and WhatTheFlat will identify the key you're in, the chords you're playing, and suggest progressions. Runs fully offline as a native desktop app.

## Features

- Real-time chord detection from live audio (guitar, bass, piano, full band)
- Automatic key detection with top-3 candidate display — click to lock
- Chord history and repeating progression detection
- Roman numeral analysis relative to detected key
- Fretboard visualiser showing safe notes and chord tones
- Beginner / Advanced modes
- Manual key lock for jam sessions
- Supports borrowed/chromatic chords (e.g. D7 in A minor) in Advanced mode
- Fully offline — no internet connection required

## Tech Stack

| | |
|---|---|
| **App shell** | Electron |
| **UI** | React 18, Tailwind CSS, Vite |
| **Audio** | Web Audio API, [Pitchy](https://github.com/ianprime0509/pitchy) (McLeod pitch detection) |
| **Music theory** | Custom JS — Krumhansl-Schmuckler key detection, chroma-based chord matching |

### Dependencies (`frontend/package.json`)

**Runtime**
- `react` / `react-dom` — UI
- `pitchy` — pitch detection

**Dev / build**
- `electron` — desktop runtime
- `electron-builder` — installer packaging
- `vite` + `@vitejs/plugin-react` — bundler
- `tailwindcss` + `autoprefixer` + `postcss` — styling
- `concurrently` — run Vite + Electron together in dev

## Development

```bash
cd frontend
npm install
npm run electron:dev
```

Starts the Vite dev server and opens the Electron window simultaneously. The window connects to `localhost:5173` and supports hot reload.

## Building an Installer

Add app icons to `frontend/assets/` first:
- `icon.ico` — Windows
- `icon.icns` — macOS
- `icon.png` — Linux (256×256 minimum)

Then build:

```bash
cd frontend

# Windows installer (NSIS)
npm run electron:build:win

# macOS DMG
npm run electron:build:mac

# Linux AppImage
npm run electron:build:linux
```

Output is placed in `frontend/release/`.

## Design Tokens

All colors are defined in `frontend/tailwind.config.js` and can be referenced by name in any component.

| Token | Hex | Usage |
|---|---|---|
| `surface` | `#0f0f0f` | Page / app background |
| `panel` | `#1a1a1a` | Cards, panels, dialogs |
| `border` | `#2a2a2a` | Borders, dividers, muted backgrounds |
| `accent` | `#a855f7` | Primary interactive color (purple) |
| `amber` | `#f59e0b` | Roman numerals, secondary highlights |
| *(base text)* | `#f5f5f5` | Default body text |

Tailwind usage examples: `bg-surface`, `bg-panel`, `border-border`, `text-accent`, `bg-accent/20` (20% opacity).

## How It Works

All processing happens locally in the Electron window — no server, no network calls.

Audio is captured via the browser's Web Audio API and processed in two parallel paths:

1. **Pitch path** — 4096-sample FFT with McLeod autocorrelation for fast single-note pitch detection. Feeds the Krumhansl-Schmuckler key detection algorithm, which votes over a rolling window of 12 detections and requires 9/12 agreement before committing to a key.

2. **Chord path** — 16384-sample FFT (2.7 Hz/bin) with harmonic summation chroma extraction across 80–4000 Hz. The averaged chroma vector is matched against chord templates (major, minor, dom7, min7, dim, half-dim, aug, sus4, add9) using a weighted coverage score. Consecutive identical detections are required before a chord is committed, preventing transient false positives.

The top-3 key candidates are shown in real time as clickable chips. Locking a key in Beginner mode restricts chord matching to the 7 diatonic chords; Advanced mode allows chromatic/borrowed chords.
