# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (Vite dev server + Electron window with hot reload)
npm run electron:dev

# Browser-only dev (no Electron)
npm run dev

# Build installers
npm run electron:build:win    # Windows NSIS installer → releases/
npm run electron:build:mac    # macOS DMG → releases/
npm run electron:build:linux  # Linux AppImage → releases/
```

No test suite exists. There is no lint script — no ESLint config is present.

## Architecture

**Electron shell** (`electron/main.cjs`) loads `dist/index.html` in production or `localhost:5173` in dev. The renderer process has full Web Audio API access (`sandbox: false`). `preload.cjs` uses `contextIsolation: true` with no exposed IPC — Electron is purely a window host; all logic lives in the renderer.

**Two audio pipelines run in parallel** inside `AudioCapture.jsx`:

| Path | FFT | Purpose |
|---|---|---|
| Pitch | 4096 samples (~90ms, `smoothingTimeConstant=0.0`) | McLeod pitch detection via `pitchy` → feeds key detection |
| Chord | 16384 samples (~370ms, `smoothingTimeConstant=0.5`) | Harmonic summation chroma → feeds chord detection |

The 16384 FFT gives 2.7 Hz/bin resolution, which is necessary to separate adjacent semitones on low guitar strings (~5-6 Hz apart). The chord analyser uses `computeChroma()` — a harmonic summation that folds each FFT bin back through 5 harmonics to cancel overtone contamination (prevents minor chords from reading as major).

**State and detection logic lives entirely in `App.jsx`:**

- `handleNote` (pitch callback) → accumulates `noteHistoryRef`, runs Krumhansl-Schmuckler key detection every 5 notes, votes in `keyVotesRef` (rolling window, requires strong consensus before committing)
- `handleChroma` (chord callback) → averages a ring buffer of `chromaSmooth` frames, runs a **chroma stability gate** (per-bin variance check — bails if still in transition), then matches against chord templates via `matchChordFromChroma`, votes in `chordVotesRef`
- `handleOnset` (onset callback from RMS spike detection) → builds a **tempo histogram** from pairwise inter-onset intervals, folding all intervals into 55–220 BPM range; the histogram peak drives BPM display

Both `handleNote` and `handleChroma` use `useCallback(fn, [])` (empty deps). All values they need from render scope are kept in refs synced via `useEffect` — this prevents `AudioCapture`'s `start` from recreating on every render.

**All music theory is in `src/lib/theory.js`:**

- `detectKey` / `detectTopKeys` — Krumhansl-Schmuckler correlation against major/minor profiles only (K-S cannot distinguish modes — Dorian vs natural minor look the same; user manually picks mode)
- `matchChordFromChroma` — weighted coverage score (inEnergy / (inEnergy + outEnergy×0.7)), requires root presence (`chroma[r] >= 0.08`), margin over second-best, diatonic/bass bonuses
- `MATCH_CHORD_TYPES` — the subset of chord types used in real-time detection (not all of `CHORD_TYPES`)
- `detectRepeatingProgression` — non-overlapping pattern match over last 20 chords, length 2–6

**`src/services/audioService.js`** is a self-contained tuner hook (`useAudioTuner`) used only by `Tuner.jsx`. It uses its own separate `AudioContext` with simple autocorrelation — independent from the main pitch/chord pipeline.

## Design tokens (Tailwind)

Defined in `tailwind.config.js`: `bg-surface` (#0f0f0f), `bg-panel` (#1a1a1a), `border-border` (#2a2a2a), `text-accent` / `bg-accent` (#a855f7 purple). Use these rather than raw hex in components.

## Key configuration (`DEFAULTS` in `App.jsx`)

| Key | Purpose |
|---|---|
| `chromaSmooth` | Ring buffer size (frames averaged before chord check) |
| `chordVoteThreshold` | Consecutive matching chord frames required to commit |
| `chordMinScore` | Minimum coverage score from `matchChordFromChroma` |
| `keyVoteWindow` / `keyVoteThreshold` | Rolling window size and consensus count for key lock |
| `noteHistorySize` | Max pitch-class history kept for K-S key detection |

These are exposed in `Settings.jsx` as sliders. `configRef` keeps a ref in sync so stable callbacks can read current values.

## Instrument views

`Fretboard.jsx` and `Piano.jsx` are SVG-rendered visualisers. Both accept `keyInfo`, `currentChord`, and `monoColor`. They call `getPentatonicScale`, `getFullScale`, `getChordTones` from `theory.js` and colour notes by tier: chord tone (purple `#a855f7`) > pentatonic (amber or light purple in mono) > scale (dark gray or lightest purple in mono).

## GitHub Actions

`.github/workflows/release.yml` builds Windows and macOS installers on tagged pushes (`v*`) using `softprops/action-gh-release@v2`. Build scripts use `--publish never` to prevent electron-builder's own publish step.
