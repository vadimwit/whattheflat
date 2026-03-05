# WhatTheFlat

Real-time key and chord detection for musicians. Play guitar, bass, piano, or any instrument into your microphone and WhatTheFlat will identify the key you're in, the chords you're playing, and suggest progressions.

## Features

- Real-time chord detection from live audio
- Automatic key detection (Krumhansl-Schmuckler profiles)
- Chord history and repeating progression detection
- Roman numeral analysis relative to detected key
- Fretboard visualiser showing safe notes and chord tones
- Beginner / Advanced modes
- Manual key lock for jam sessions
- AI chat assistant for music theory questions

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Audio**: Web Audio API, [Pitchy](https://github.com/ianprime0509/pitchy) (McLeod pitch detection)
- **Backend**: Python (Claude API for chat assistant)

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser and click **Start Listening**. Allow microphone access when prompted.

### Backend (chat assistant)

```bash
pip install -r requirements.txt
python main.py
```

## How It Works

Audio is processed in two parallel paths:

1. **Pitch path** — small 4096-sample FFT with McLeod autocorrelation for fast, accurate single-note pitch detection. Feeds the key detection algorithm.
2. **Chord path** — large 16384-sample FFT (2.7 Hz/bin resolution) with harmonic summation chroma extraction. The chroma vector is matched against chord templates (major, minor, dominant 7th, sus4, diminished) to identify the current chord.

Key detection uses a rolling vote over the last 12 detections and requires 9/12 agreement before committing, keeping the display stable during transitions.
