import { useState } from 'react'
import { toRomanNumeral, CHORD_TYPES, NOTES } from '../lib/theory'
import {
  findSimilarProgressions,
  getChordSubstitutions,
  progressionInKey,
  styleVariationInKey,
  parseChord,
} from '../lib/education'

// ─── Session Snapshot ─────────────────────────────────────────────────────────
function SessionSnapshot({ keyInfo, detectedProgression, chordHistory }) {
  const { root, mode, confidence } = keyInfo ?? {}
  const uniqueChords = [...new Set(chordHistory)]
  const totalPlayed  = chordHistory.length

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-surface border border-border rounded-xl">
      <div className="flex flex-col gap-1 min-w-[120px]">
        <p className="text-[11px] uppercase tracking-wider text-gray-600">Key</p>
        {root ? (
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-accent">{root}</span>
            <span className="text-sm text-gray-400 capitalize">{mode}</span>
            {confidence && <span className="text-xs text-gray-600">{Math.round(confidence * 100)}%</span>}
          </div>
        ) : (
          <span className="text-gray-600 text-sm">Detecting…</span>
        )}
      </div>

      <div className="w-px bg-border shrink-0" />

      <div className="flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-wider text-gray-600">Detected Loop</p>
        {detectedProgression?.length ? (
          <div className="flex flex-wrap gap-1">
            {detectedProgression.map((chord, i) => (
              <span key={i} className="px-2 py-0.5 bg-accent/10 border border-accent/30 rounded text-xs font-bold text-accent">
                {chord}
                {root && <span className="text-amber-400/70 ml-1 font-normal text-[10px]">
                  {toRomanNumeral(chord, root, mode)}
                </span>}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-600 text-sm">None yet — keep playing!</span>
        )}
      </div>

      <div className="w-px bg-border shrink-0" />

      <div className="flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-wider text-gray-600">Session</p>
        <p className="text-sm text-gray-300">
          <span className="font-bold text-white">{totalPlayed}</span> chords &nbsp;·&nbsp;
          <span className="font-bold text-white">{uniqueChords.length}</span> unique
        </p>
        {uniqueChords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {uniqueChords.slice(0, 10).map(c => (
              <span key={c} className="text-[10px] text-gray-500 bg-border px-1.5 py-0.5 rounded">{c}</span>
            ))}
            {uniqueChords.length > 10 && <span className="text-[10px] text-gray-600">+{uniqueChords.length - 10}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Similar Progressions ─────────────────────────────────────────────────────
function SimilarProgressions({ similar, keyInfo, onChordClick }) {
  const [expanded, setExpanded] = useState(null)
  if (!similar.length) return (
    <p className="text-gray-600 text-sm text-center py-4">
      Play more chords and lock a key to find similar famous progressions.
    </p>
  )

  return (
    <div className="flex flex-col gap-3">
      {similar.map(prog => {
        const isOpen = expanded === prog.id
        const chordsInKey = keyInfo?.root ? progressionInKey(prog, keyInfo.root) : []

        return (
          <div key={prog.id}
            className="border border-border rounded-xl overflow-hidden hover:border-accent/30 transition-colors">

            {/* Header row */}
            <button
              onClick={() => setExpanded(isOpen ? null : prog.id)}
              className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white text-sm">{prog.name}</span>
                  {prog.genre.map(g => (
                    <span key={g} className="px-1.5 py-0.5 bg-accent/10 border border-accent/20 rounded text-[10px] text-accent">{g}</span>
                  ))}
                  <span className="text-[11px] text-gray-500 font-mono">{prog.pattern}</span>
                  <span className="ml-auto text-xs text-gray-600">{Math.round(prog.score * 100)}% match</span>
                </div>
                {/* Chords in current key */}
                {chordsInKey.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {chordsInKey.map((c, i) => (
                      <button key={i}
                        onClick={e => { e.stopPropagation(); onChordClick?.(c) }}
                        className="px-2 py-0.5 bg-surface border border-border hover:border-accent/50 rounded text-xs font-bold text-gray-200 hover:text-accent transition-colors"
                        title={`See voicings for ${c}`}
                      >
                        {c}
                      </button>
                    ))}
                    <span className="text-[10px] text-gray-600 self-center ml-1">in {keyInfo.root} {keyInfo.mode}</span>
                  </div>
                )}
              </div>
              <span className="text-gray-600 shrink-0 text-sm mt-0.5">{isOpen ? '▲' : '▼'}</span>
            </button>

            {/* Expanded detail */}
            {isOpen && (
              <div className="border-t border-border px-4 py-4 flex flex-col gap-4">
                <p className="text-sm text-gray-400">{prog.description}</p>
                {prog.tip && (
                  <p className="text-xs text-amber-400/80">
                    <span className="text-amber-400 font-semibold">Insight:</span> {prog.tip}
                  </p>
                )}

                {/* Song examples */}
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gray-600 mb-2">Famous examples</p>
                  <div className="flex flex-wrap gap-1.5">
                    {prog.songs.map(s => (
                      <span key={s} className="px-2 py-1 bg-surface border border-border rounded-lg text-xs text-gray-400">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Style variations */}
                {prog.styleVariations.length > 0 && (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-gray-600 mb-2">Style variations</p>
                    <div className="flex flex-col gap-2">
                      {prog.styleVariations.map(sv => {
                        const svChords = keyInfo?.root ? styleVariationInKey(sv, prog, keyInfo.root) : []
                        return (
                          <div key={sv.label} className="flex items-start gap-3 p-2 bg-surface rounded-lg border border-border">
                            <span className="text-xs font-bold text-accent shrink-0 w-16">{sv.label}</span>
                            <div className="flex flex-col gap-1 min-w-0">
                              <span className="text-xs text-gray-500 font-mono">{sv.pattern}</span>
                              {svChords.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                  {svChords.map((c, i) => (
                                    <button key={i}
                                      onClick={() => onChordClick?.(c)}
                                      className="px-1.5 py-0.5 bg-accent/10 border border-accent/20 hover:border-accent rounded text-[11px] font-bold text-accent/90 hover:text-accent transition-colors"
                                      title={`See voicings for ${c}`}
                                    >
                                      {c}
                                    </button>
                                  ))}
                                  <span className="text-[10px] text-gray-600 self-center ml-1">in {keyInfo.root}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Play It Differently ──────────────────────────────────────────────────────
function PlayDifferently({ progression, onChordClick }) {
  if (!progression?.length) return (
    <p className="text-gray-600 text-sm text-center py-4">
      Keep playing — a repeating progression will appear here with substitution ideas.
    </p>
  )

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-gray-500">
        Tap any substitution to see how to play it. These are harmonic replacements — same role, different colour.
      </p>
      {progression.map(chord => {
        const subs = getChordSubstitutions(chord)
        return (
          <div key={chord} className="flex flex-wrap items-start gap-3 p-3 bg-surface border border-border rounded-xl">
            {/* Original chord */}
            <button
              onClick={() => onChordClick?.(chord)}
              className="px-3 py-1.5 bg-accent text-white font-black rounded-lg text-sm shrink-0 hover:bg-purple-600 transition-colors"
              title="See voicings"
            >
              {chord}
            </button>

            <span className="text-gray-700 self-center">→</span>

            {/* Substitutions */}
            <div className="flex flex-wrap gap-2">
              {subs.map(sub => (
                <div key={sub.chord} className="relative group">
                  <button
                    onClick={() => onChordClick?.(sub.chord)}
                    className="px-2.5 py-1.5 bg-panel border border-border hover:border-accent/50 hover:text-accent rounded-lg text-sm font-bold text-gray-300 transition-all"
                  >
                    {sub.chord}
                  </button>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 px-2 py-1.5 bg-gray-900 border border-border rounded-lg text-[11px] text-gray-300 leading-snug opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                    {sub.tip}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
      <p className="text-[11px] text-gray-700 text-center">
        Hover substitutions to see what they change · click to see voicings
      </p>
    </div>
  )
}

// ─── Chord Variation Ideas ────────────────────────────────────────────────────
const VARIATION_ROWS = [
  {
    label: '7th Upgrade',
    desc: 'Add 7ths throughout — jazz and soul texture',
    typeMap: { maj: 'maj7', min: 'min7', dom7: 'dom7', maj7: 'maj7', min7: 'min7', dim: 'dim7', add9: 'maj7', sus2: 'sus2', sus4: 'sus4', aug: 'aug', half_dim: 'half_dim', maj6: 'maj6', min6: 'min6' },
  },
  {
    label: 'Sus2 Wash',
    desc: 'Replace triads with sus2 — ambient and spacious',
    typeMap: { maj: 'sus2', min: 'sus2', dom7: 'sus4', maj7: 'sus2', min7: 'sus2', add9: 'sus2', dim: 'dim', aug: 'aug', sus4: 'sus4', sus2: 'sus2', half_dim: 'half_dim', maj6: 'sus2', min6: 'sus2' },
  },
  {
    label: 'Add9 Modern',
    desc: 'Add9 on majors, m7 on minors — indie and neo-soul',
    typeMap: { maj: 'add9', min: 'min7', dom7: 'dom7', maj7: 'add9', min7: 'min7', add9: 'add9', sus2: 'sus2', sus4: 'sus4', dim: 'dim', aug: 'aug', half_dim: 'half_dim', maj6: 'add9', min6: 'min7' },
  },
  {
    label: 'Blues Dominant',
    desc: 'All chords → dom7 — instant 12-bar blues energy',
    typeMap: { maj: 'dom7', min: 'dom7', dom7: 'dom7', maj7: 'dom7', min7: 'dom7', add9: 'dom7', sus2: 'dom7', sus4: 'dom7', dim: 'dim7', aug: 'aug', half_dim: 'dom7', maj6: 'dom7', min6: 'dom7' },
  },
]

function ProgressionVariationIdeas({ progression, onChordClick }) {
  if (!progression?.length) return (
    <p className="text-gray-600 text-sm text-center py-4">
      Keep playing — your progression will appear here.
    </p>
  )

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-gray-500">
        Your progression re-harmonised four ways. Click any chord to open its voicing explorer.
      </p>
      {VARIATION_ROWS.map(row => {
        const transformed = progression.map(chord => {
          const p = parseChord(chord)
          if (!p) return chord
          const newType = row.typeMap[p.type] ?? p.type
          return NOTES[p.rootPc] + (CHORD_TYPES[newType]?.suffix ?? '')
        })
        return (
          <div key={row.label} className="p-3 bg-surface border border-border rounded-xl">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-xs font-bold text-accent">{row.label}</span>
              <span className="text-[11px] text-gray-500">{row.desc}</span>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {progression.map((orig, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-600">{orig}</span>
                  <span className="text-gray-700 text-xs">→</span>
                  <button
                    onClick={() => onChordClick?.(transformed[i])}
                    className="px-2.5 py-1 bg-panel border border-border hover:border-accent/50 hover:text-accent rounded-lg font-bold text-sm text-gray-200 transition-all"
                  >
                    {transformed[i]}
                  </button>
                  {i < progression.length - 1 && <span className="text-gray-700">·</span>}
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function EducationPanel({ chordHistory, keyInfo, detectedProgression, onChordClick }) {
  const [open, setOpen] = useState(false)
  const [section, setSection] = useState('similar')

  // Use detected progression if available, else last 4 unique chords from history
  const workingProgression = detectedProgression?.length
    ? detectedProgression
    : [...new Set([...chordHistory].reverse())].reverse().slice(-4)

  const similar = findSimilarProgressions(workingProgression, keyInfo)

  return (
    <div className="mb-3 bg-panel border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-all"
      >
        <div className="flex items-center gap-3">
          <span>EDUCATION</span>
          {similar.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-accent/20 border border-accent/30 rounded text-accent">
              {similar.length} match{similar.length !== 1 ? 'es' : ''}
            </span>
          )}
        </div>
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-border">

          {/* Section nav */}
          <div className="flex gap-1 px-4 pt-4 pb-0 border-b border-border overflow-x-auto">
            {[
              { key: 'snapshot',  label: '📊 Session' },
              { key: 'similar',   label: `🎵 Similar Progressions${similar.length ? ` (${similar.length})` : ''}` },
              { key: 'play',      label: '🎨 Play Differently' },
              { key: 'variations',label: '🔀 Progression Variations' },
            ].map(s => (
              <button key={s.key}
                onClick={() => setSection(s.key)}
                className={`px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-all shrink-0 ${
                  section === s.key
                    ? 'border-accent text-accent'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}>
                {s.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {section === 'snapshot'   && (
              <SessionSnapshot
                keyInfo={keyInfo}
                detectedProgression={detectedProgression}
                chordHistory={chordHistory}
              />
            )}
            {section === 'similar'    && (
              <SimilarProgressions
                similar={similar}
                keyInfo={keyInfo}
                onChordClick={onChordClick}
              />
            )}
            {section === 'play'       && (
              <PlayDifferently
                progression={workingProgression}
                onChordClick={onChordClick}
              />
            )}
            {section === 'variations' && (
              <ProgressionVariationIdeas
                progression={workingProgression}
                onChordClick={onChordClick}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
