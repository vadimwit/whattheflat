import { useRef, useState, useCallback, useEffect } from 'react'

const INITIAL_SLOT_COUNT = 4

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeWaveform(audioBuffer, points = 200) {
  const data = audioBuffer.getChannelData(0)
  const step = Math.max(1, Math.floor(data.length / points))
  const out  = new Float32Array(points)
  for (let i = 0; i < points; i++) {
    let max = 0
    for (let j = 0; j < step; j++) {
      const v = Math.abs(data[i * step + j] ?? 0)
      if (v > max) max = v
    }
    out[i] = max
  }
  const peak = Math.max(...out, 0.001)
  for (let i = 0; i < points; i++) out[i] /= peak
  return out
}

function makeEmptySlot() {
  return {
    status:            'empty',   // 'empty'|'recording'|'trimming'|'playing'|'muted'
    audioBuffer:       null,
    originalBuffer:    null,      // always the full recording, never overwritten
    waveform:          null,      // Float32Array(200) for canvas display
    trimStart:         0,
    trimEnd:           1,
    volume:            0.8,
    sourceNode:        null,
    gainNode:          null,
    recordingDuration: 0,
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLoopEngine(bpm) {
  const audioCtxRef    = useRef(null)
  const masterStartRef = useRef(null)   // AudioContext timestamp of first loop start
  const masterLenRef   = useRef(null)   // master loop length in seconds
  const recorderRef    = useRef(null)   // { mr, chunks, slotIdx }
  const slotsRef       = useRef(null)
  const streamRef      = useRef(null)
  const timerRef       = useRef(null)

  const [slots, setSlots] = useState(() => {
    const s = Array.from({ length: INITIAL_SLOT_COUNT }, makeEmptySlot)
    slotsRef.current = s
    return s
  })
  const [masterLen, setMasterLen] = useState(null) // mirrors masterLenRef for display

  const updateSlot = useCallback((idx, patch) => {
    setSlots(prev => {
      const next = prev.map((s, i) => i === idx ? { ...s, ...patch } : s)
      slotsRef.current = next
      return next
    })
  }, [])

  // ── AudioContext ────────────────────────────────────────────────────────────
  const ensureCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {})
    }
    return audioCtxRef.current
  }, [])

  // ── Called by AudioCapture when mic stream is ready ─────────────────────────
  const setStream = useCallback((stream) => {
    streamRef.current = stream
    ensureCtx() // pre-warm so first record click has no AudioContext startup lag
  }, [ensureCtx])

  // ── Start recording on a slot ───────────────────────────────────────────────
  const startRecord = useCallback((slotIdx) => {
    if (recorderRef.current) return   // one at a time
    if (!streamRef.current) return

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm'

    const mr     = new MediaRecorder(streamRef.current, { mimeType })
    const chunks = []

    mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }

    mr.onstop = async () => {
      clearInterval(timerRef.current)
      timerRef.current = null
      // Guard: was this slot cancelled before onstop fired?
      if (slotsRef.current[slotIdx]?.status !== 'recording') return
      try {
        const ctx         = ensureCtx()
        const blob        = new Blob(chunks, { type: mimeType })
        const arrayBuffer = await blob.arrayBuffer()
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
        const waveform    = makeWaveform(audioBuffer)
        updateSlot(slotIdx, {
          status: 'trimming',
          audioBuffer,
          originalBuffer: audioBuffer,   // preserve forever
          waveform,
          trimStart: 0,
          trimEnd:   1,
        })
      } catch (err) {
        console.warn('[LoopEngine] decode failed:', err)
        updateSlot(slotIdx, makeEmptySlot())
      }
      recorderRef.current = null
    }

    mr.onerror = () => {
      clearInterval(timerRef.current)
      timerRef.current  = null
      recorderRef.current = null
      updateSlot(slotIdx, makeEmptySlot())
    }

    recorderRef.current = { mr, chunks, slotIdx }
    mr.start(250)
    updateSlot(slotIdx, { status: 'recording', recordingDuration: 0 })

    const t0 = Date.now()
    timerRef.current = setInterval(() => {
      updateSlot(slotIdx, { recordingDuration: (Date.now() - t0) / 1000 })
    }, 100)
  }, [ensureCtx, updateSlot])

  // ── Stop recording → triggers onstop → trimming state ──────────────────────
  const stopRecord = useCallback((slotIdx) => {
    const rec = recorderRef.current
    if (!rec || rec.slotIdx !== slotIdx) return
    if (rec.mr.state !== 'inactive') rec.mr.stop()
    clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  // ── Cancel recording (discard) ──────────────────────────────────────────────
  const cancelRecord = useCallback((slotIdx) => {
    const rec = recorderRef.current
    if (rec && rec.slotIdx === slotIdx) {
      // Prevent onstop from processing by marking slot empty first
      updateSlot(slotIdx, makeEmptySlot())
      if (rec.mr.state !== 'inactive') rec.mr.stop()
      recorderRef.current = null
    } else {
      updateSlot(slotIdx, makeEmptySlot())
    }
    clearInterval(timerRef.current)
    timerRef.current = null
  }, [updateSlot])

  // ── Commit trim and start looping ───────────────────────────────────────────
  const commitTrim = useCallback((slotIdx, trimStart, trimEnd) => {
    const ctx  = ensureCtx()
    const slot = slotsRef.current[slotIdx]
    if (!slot?.audioBuffer) return

    const fullBuf = slot.audioBuffer
    const sr      = fullBuf.sampleRate
    const startSample = Math.floor(trimStart * fullBuf.length)
    const endSample   = Math.ceil(trimEnd   * fullBuf.length)
    const rawLen      = endSample - startSample
    if (rawLen < sr * 0.2) return   // reject clips shorter than 200ms

    const rawData = fullBuf.getChannelData(0).slice(startSample, endSample)
    const rawSec  = rawLen / sr

    // Master loop length is set exactly from the first loop's trimmed region.
    // Subsequent loops are padded/trimmed to match that length.
    const isFirst   = masterLenRef.current === null
    const targetSec = isFirst ? rawSec : masterLenRef.current
    const targetLen = Math.round(targetSec * sr)

    const finalData = new Float32Array(targetLen)   // zero-padded by default
    finalData.set(rawData.slice(0, Math.min(rawLen, targetLen)))

    const finalBuf = ctx.createBuffer(1, targetLen, sr)
    finalBuf.copyToChannel(finalData, 0)

    if (isFirst) {
      masterLenRef.current = targetSec
      setMasterLen(targetSec)
    }

    const gainNode   = ctx.createGain()
    gainNode.gain.value = slot.volume
    gainNode.connect(ctx.destination)

    const sourceNode = ctx.createBufferSource()
    sourceNode.buffer    = finalBuf
    sourceNode.loop      = true
    sourceNode.loopStart = 0
    sourceNode.loopEnd   = targetSec
    sourceNode.connect(gainNode)

    // Schedule: first loop starts immediately; subsequent loops snap to the
    // next master loop boundary so they play in perfect sync.
    let startTime
    if (isFirst) {
      startTime = ctx.currentTime + 0.05
      masterStartRef.current = startTime
    } else {
      const elapsed    = ctx.currentTime - masterStartRef.current
      const loopLen    = masterLenRef.current
      const posInLoop  = elapsed % loopLen
      const remaining  = loopLen - posInLoop
      const LOOKAHEAD  = 0.05
      startTime = ctx.currentTime + (remaining > LOOKAHEAD ? remaining : remaining + loopLen)
    }
    sourceNode.start(startTime)

    updateSlot(slotIdx, {
      status:         'playing',
      audioBuffer:    finalBuf,
      originalBuffer: slot.originalBuffer ?? null,   // preserve original
      waveform:       makeWaveform(finalBuf),
      trimStart:      0,
      trimEnd:        1,
      sourceNode,
      gainNode,
    })
  }, [ensureCtx, updateSlot])

  // ── Re-trim: return a playing/muted slot back to the trimmer ────────────────
  const retrimSlot = useCallback((slotIdx) => {
    const slot = slotsRef.current[slotIdx]
    if (!slot?.originalBuffer) return

    // Stop current playback
    try { slot.sourceNode?.stop() } catch {}
    try { slot.sourceNode?.disconnect() } catch {}
    try { slot.gainNode?.disconnect() } catch {}

    // Reset master timing if no other loops remain active
    const hasOthers = slotsRef.current.some((s, i) =>
      i !== slotIdx && (s.status === 'playing' || s.status === 'muted')
    )
    if (!hasOthers) {
      masterStartRef.current = null
      masterLenRef.current   = null
      setMasterLen(null)
    }

    updateSlot(slotIdx, {
      status:      'trimming',
      audioBuffer: slot.originalBuffer,
      waveform:    makeWaveform(slot.originalBuffer),
      originalBuffer: slot.originalBuffer,
      trimStart:   0,
      trimEnd:     1,
      sourceNode:  null,
      gainNode:    null,
    })
  }, [updateSlot])

  // ── Toggle mute ─────────────────────────────────────────────────────────────
  const toggleMute = useCallback((slotIdx) => {
    const ctx  = audioCtxRef.current
    const slot = slotsRef.current[slotIdx]
    if (!slot || !ctx) return
    if (slot.status !== 'playing' && slot.status !== 'muted') return
    const muting = slot.status === 'playing'
    slot.gainNode?.gain.setTargetAtTime(muting ? 0 : slot.volume, ctx.currentTime, 0.02)
    updateSlot(slotIdx, { status: muting ? 'muted' : 'playing' })
  }, [updateSlot])

  // ── Delete slot ─────────────────────────────────────────────────────────────
  const deleteSlot = useCallback((slotIdx) => {
    const slot = slotsRef.current[slotIdx]
    if (!slot) return
    if (slot.status === 'recording') cancelRecord(slotIdx)
    try { slot.sourceNode?.stop() } catch {}
    try { slot.sourceNode?.disconnect() } catch {}
    try { slot.gainNode?.disconnect() } catch {}

    // Reset master timing when no loops remain active
    const hasOthers = slotsRef.current.some((s, i) =>
      i !== slotIdx && (s.status === 'playing' || s.status === 'muted')
    )
    if (!hasOthers) {
      masterStartRef.current = null
      masterLenRef.current   = null
      setMasterLen(null)
    }
    updateSlot(slotIdx, makeEmptySlot())
  }, [cancelRecord, updateSlot])

  // ── Volume ──────────────────────────────────────────────────────────────────
  const setVolume = useCallback((slotIdx, vol) => {
    const ctx  = audioCtxRef.current
    const slot = slotsRef.current[slotIdx]
    if (slot?.gainNode && ctx && slot.status === 'playing') {
      slot.gainNode.gain.setTargetAtTime(vol, ctx.currentTime, 0.02)
    }
    updateSlot(slotIdx, { volume: vol })
  }, [updateSlot])

  // ── Main click handler (drives the state machine) ───────────────────────────
  const handleSlotClick = useCallback((slotIdx) => {
    const slot = slotsRef.current[slotIdx]
    if (!slot) return
    switch (slot.status) {
      case 'empty':     startRecord(slotIdx); break
      case 'recording': stopRecord(slotIdx);  break
      case 'playing':
      case 'muted':     toggleMute(slotIdx);  break
      // 'trimming' is handled entirely by LoopTrimmer
    }
  }, [startRecord, stopRecord, toggleMute])

  // ── Add a new empty slot ────────────────────────────────────────────────────
  const addSlot = useCallback(() => {
    setSlots(prev => {
      const next = [...prev, makeEmptySlot()]
      slotsRef.current = next
      return next
    })
  }, [])

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      slotsRef.current?.forEach(s => {
        try { s.sourceNode?.stop() } catch {}
        try { s.sourceNode?.disconnect() } catch {}
        try { s.gainNode?.disconnect() } catch {}
      })
      try { audioCtxRef.current?.close() } catch {}
    }
  }, [])

  return {
    slots,
    masterLen,
    setStream,
    handleSlotClick,
    commitTrim,
    cancelRecord,
    retrimSlot,
    deleteSlot,
    setVolume,
    addSlot,
    audioCtxRef,
    masterStartRef,
    masterLenRef,
  }
}
