import { useState, useRef, useEffect, useCallback } from 'react'

const MODEL = 'claude-sonnet-4-6'
const API_URL = 'https://api.anthropic.com/v1/messages'
const LS_KEY = 'wtf_teacher_key'

// ── System prompt — rebuilt with live session context on every request ────────
function buildSystemPrompt({ keyInfo, currentChord, bpm, chordHistory }) {
  const keyStr   = keyInfo   ? `${keyInfo.root} ${keyInfo.mode}` : 'not detected yet'
  const chordStr = currentChord?.name ?? 'none detected'
  const bpmStr   = bpm       ? `${Math.round(bpm)} BPM` : 'not detected'
  const histStr  = chordHistory?.length
    ? chordHistory.map(c => c.name).join(' → ')
    : 'none yet'

  return `You are an expert music teacher and session musician embedded in JamBuddy, a real-time chord and key detection app for guitarists and keyboard players at live jam sessions.

LIVE SESSION CONTEXT (updated in real time):
• Detected key: ${keyStr}
• Current chord: ${chordStr}
• BPM: ${bpmStr}
• Recent chord history: ${histStr}

YOUR ROLE:
- Explain chords, scales, and music theory in plain, friendly language
- Suggest what to practice based on the current key and chord progression
- Teach playing techniques: fretting, strumming patterns, chord voicings, fingerpicking
- Help musicians understand WHY things sound the way they do
- Suggest progressions that work with whatever the user is currently playing
- Adjust depth to the user — explain basics if they seem new, go deep if they ask for it
- Point out interesting connections: "that Dm7 works here because it's the ii chord in C major"

STYLE:
- Keep responses focused and practical — this is a live jam, not a classroom
- Use plain text, not markdown. Short paragraphs. Bullet points with "-" are fine.
- If someone asks about the current chord or key, use the live context above
- Max ~150 words unless someone asks for a deep dive`
}

// ── Quick-action chips ────────────────────────────────────────────────────────
const CHIPS = [
  { label: 'What should I practice?',    msg: 'Based on what I\'m playing right now, what\'s the most useful thing I could practice?' },
  { label: 'Explain current chord',       msg: 'Explain the current chord I\'m playing — what it is, why it sounds the way it does, and where it tends to appear.' },
  { label: 'Scales that work here',       msg: 'What scales work over the current key and chord? Which notes sound best to improvise with?' },
  { label: 'Suggest a progression',       msg: 'Suggest a chord progression that fits the current key. Give me something interesting to try.' },
  { label: 'Technique tip',              msg: 'Give me one technique tip — something I can work on in the next few minutes to sound better.' },
  { label: 'Why does this sound good?',  msg: 'Looking at my recent chord history, why do these chords sound good together? What\'s the music theory behind it?' },
]

// ── Simple text renderer (bold + line breaks) ─────────────────────────────────
function MessageText({ text }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />
        // Bold: **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/)
        return (
          <p key={i} className="leading-relaxed">
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j} className="text-white font-semibold">{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        )
      })}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MusicTeacher({ keyInfo, currentChord, bpm, chordHistory }) {
  const [open,       setOpen]       = useState(false)
  const [apiKey,     setApiKey]     = useState(() => localStorage.getItem(LS_KEY) ?? '')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [messages,   setMessages]   = useState([])      // [{role, content}]
  const [input,      setInput]      = useState('')
  const [loading,    setLoading]    = useState(false)
  const [streaming,  setStreaming]  = useState('')      // partial response being streamed
  const [error,      setError]      = useState(null)

  const scrollRef    = useRef(null)
  const inputRef     = useRef(null)
  const abortRef     = useRef(null)

  // Always scroll to bottom on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, streaming])

  // Focus input when panel opens
  useEffect(() => {
    if (open && apiKey && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open, apiKey])

  function saveKey(k) {
    setApiKey(k)
    localStorage.setItem(LS_KEY, k)
  }

  function clearKey() {
    setApiKey('')
    localStorage.removeItem(LS_KEY)
    setShowKeyInput(true)
  }

  const sendMessage = useCallback(async (userText) => {
    if (!userText.trim() || loading || !apiKey) return

    setError(null)
    const userMsg = { role: 'user', content: userText.trim() }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    setStreaming('')

    const context = { keyInfo, currentChord, bpm, chordHistory }

    try {
      const ctrl = new AbortController()
      abortRef.current = ctrl

      const res = await fetch(API_URL, {
        method: 'POST',
        signal: ctrl.signal,
        headers: {
          'x-api-key':                              apiKey,
          'anthropic-version':                      '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'content-type':                           'application/json',
        },
        body: JSON.stringify({
          model:      MODEL,
          max_tokens: 1024,
          stream:     true,
          system:     buildSystemPrompt(context),
          messages:   nextMessages,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error?.message ?? `API error ${res.status}`)
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]' || !data) continue
          try {
            const ev = JSON.parse(data)
            if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
              full += ev.delta.text
              setStreaming(full)
            }
          } catch {}
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: full }])
      setStreaming('')
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message)
      }
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [messages, loading, apiKey, keyInfo, currentChord, bpm, chordHistory])

  function stopGeneration() {
    abortRef.current?.abort()
    if (streaming) {
      setMessages(prev => [...prev, { role: 'assistant', content: streaming }])
      setStreaming('')
    }
    setLoading(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const hasKey = apiKey.trim().length > 0

  // Dot: purple when API key set, gray otherwise
  const dotClass = hasKey ? 'bg-accent' : 'bg-gray-700'

  return (
    <div className="mb-3 bg-panel border border-border rounded-xl overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-400">
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-2 hover:text-gray-200 transition-colors text-left"
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${dotClass}`} />
          <span>MUSIC TEACHER</span>
          <span className="text-[11px] text-gray-600">AI · Claude</span>
        </button>
        <div className="flex items-center gap-2">
          {/* Key indicator */}
          <button
            onClick={() => setShowKeyInput(v => !v)}
            className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors px-1.5 py-0.5 rounded border border-transparent hover:border-border"
            title={hasKey ? 'API key set — click to change' : 'Set API key'}
          >
            {hasKey ? '🔑 key set' : '🔑 add key'}
          </button>
          <button
            onClick={() => setOpen(v => !v)}
            className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {open
                ? <polyline points="2,8 6,4 10,8" />
                : <polyline points="2,4 6,8 10,4" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      {open && (
        <div className="border-t border-border">

          {/* API key input (shown when no key or user wants to change) */}
          {(!hasKey || showKeyInput) && (
            <div className="px-4 py-3 bg-surface/50 border-b border-border">
              <p className="text-xs text-gray-500 mb-2">
                Enter your <a className="text-accent underline" href="https://console.anthropic.com/keys" target="_blank" rel="noreferrer">Anthropic API key</a> to enable the music teacher. Stored locally on your device only.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="flex-1 px-2.5 py-1.5 bg-surface border border-border rounded-lg text-xs text-gray-300 focus:outline-none focus:border-accent font-mono"
                />
                <button
                  onClick={() => { saveKey(apiKey); setShowKeyInput(false) }}
                  disabled={!apiKey.trim()}
                  className="px-3 py-1.5 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-40"
                >
                  Save
                </button>
                {hasKey && (
                  <button
                    onClick={() => setShowKeyInput(false)}
                    className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

          {hasKey && (
            <>
              {/* Live session context strip */}
              <div className="flex items-center gap-3 px-4 py-2 border-b border-border text-[10px] font-mono">
                <span className="text-gray-600 uppercase tracking-wider">Now:</span>
                {keyInfo ? (
                  <span className="text-accent">{keyInfo.root} {keyInfo.mode}</span>
                ) : (
                  <span className="text-gray-700">no key</span>
                )}
                <span className="text-gray-800">·</span>
                {currentChord ? (
                  <span className="text-white">{currentChord.name}</span>
                ) : (
                  <span className="text-gray-700">no chord</span>
                )}
                <span className="text-gray-800">·</span>
                <span className="text-gray-500">{bpm ? `${Math.round(bpm)} bpm` : '— bpm'}</span>
                {messages.length > 0 && (
                  <button
                    onClick={() => { setMessages([]); setError(null) }}
                    className="ml-auto text-gray-700 hover:text-gray-400 transition-colors"
                    title="Clear conversation"
                  >
                    clear chat
                  </button>
                )}
              </div>

              {/* Chat messages */}
              {messages.length > 0 || streaming ? (
                <div
                  ref={scrollRef}
                  className="max-h-72 overflow-y-auto px-4 py-3 space-y-3 text-xs"
                >
                  {messages.map((m, i) => (
                    <div key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
                      {m.role === 'user' ? (
                        <div className="max-w-[80%] bg-accent/20 border border-accent/30 rounded-xl rounded-tr-sm px-3 py-2 text-gray-200">
                          {m.content}
                        </div>
                      ) : (
                        <div className="text-gray-300 leading-relaxed">
                          <MessageText text={m.content} />
                        </div>
                      )}
                    </div>
                  ))}
                  {streaming && (
                    <div className="text-gray-300 text-xs leading-relaxed">
                      <MessageText text={streaming} />
                      <span className="inline-block w-1.5 h-3.5 bg-accent/70 animate-pulse ml-0.5 align-middle" />
                    </div>
                  )}
                  {error && (
                    <div className="text-red-400 text-xs bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">
                      {error}
                    </div>
                  )}
                </div>
              ) : (
                /* Quick-action chips (shown when no chat history yet) */
                <div className="px-4 py-3">
                  <p className="text-[10px] text-gray-700 mb-2 uppercase tracking-wider">Ask something</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CHIPS.map(chip => (
                      <button
                        key={chip.label}
                        onClick={() => sendMessage(chip.msg)}
                        className="px-2.5 py-1 bg-surface border border-border rounded-full text-[10px] text-gray-400 hover:text-white hover:border-accent/50 hover:bg-accent/10 transition-all"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input row */}
              <div className="px-4 py-3 border-t border-border flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about music theory, technique, or what to play…"
                  rows={1}
                  className="flex-1 px-3 py-2 bg-surface border border-border rounded-xl text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-accent resize-none leading-relaxed"
                  style={{ maxHeight: '80px', overflowY: 'auto' }}
                />
                {loading ? (
                  <button
                    onClick={stopGeneration}
                    className="px-3 py-2 bg-surface border border-border text-gray-500 hover:text-red-400 hover:border-red-800 text-xs rounded-xl transition-colors shrink-0"
                    title="Stop"
                  >
                    ⏹
                  </button>
                ) : (
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim()}
                    className="px-3 py-2 bg-accent text-white text-xs font-bold rounded-xl hover:bg-accent/80 transition-colors disabled:opacity-40 shrink-0"
                  >
                    Send
                  </button>
                )}
              </div>

              {/* Quick chips after first message */}
              {messages.length > 0 && (
                <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                  {CHIPS.slice(0, 4).map(chip => (
                    <button
                      key={chip.label}
                      onClick={() => sendMessage(chip.msg)}
                      disabled={loading}
                      className="px-2 py-0.5 bg-surface border border-border rounded-full text-[9px] text-gray-600 hover:text-gray-300 hover:border-accent/30 transition-all disabled:opacity-30"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
