// VoiceWaveform.tsx removed: UI work is out of scope for the current Voice Engine backend-only task.
// This file was previously added but is intentionally disabled to respect the requirement
// that no UI or composer changes should be made during backend Voice Engine work.

import { useEffect, useRef, useState } from 'react'
import { useVoiceEngine } from './voiceEngineContext'

export default function VoiceWaveform() {
  const engine = useVoiceEngine()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    function render() {
      try {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const dpr = window.devicePixelRatio || 1
        const w = canvas.clientWidth
        const h = canvas.clientHeight
        if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
          canvas.width = Math.floor(w * dpr)
          canvas.height = Math.floor(h * dpr)
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // choose analyser based on state (input during listening, output during speaking)
        const analyser = engine.isSpeaking && engine.outputAnalyser ? engine.outputAnalyser : engine.inputAnalyser
        if (!analyser) {
          // idle placeholder
          ctx.fillStyle = 'rgba(0,0,0,0.04)'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.fillStyle = 'rgba(0,0,0,0.16)'
          const mid = canvas.height / 2
          ctx.fillRect(0, mid - 1, canvas.width, 2)
        } else {
          const buf = new Uint8Array(analyser.frequencyBinCount)
          analyser.getByteTimeDomainData(buf)
          const len = buf.length
          const step = Math.max(1, Math.floor(len / canvas.width))
          ctx.fillStyle = 'rgba(0,0,0,0.04)'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.lineWidth = 1.5 * (window.devicePixelRatio || 1)
          ctx.strokeStyle = engine.isSpeaking ? '#06b6d4' : '#0b74ff'
          ctx.beginPath()
          for (let i = 0; i < canvas.width; i++) {
            const idx = Math.min(len - 1, i * step)
            const v = buf[idx] / 128.0
            const y = (v * canvas.height) / 2
            const py = canvas.height / 2 + (y - canvas.height / 2)
            if (i === 0) ctx.moveTo(i + 0.5, py)
            else ctx.lineTo(i + 0.5, py)
          }
          ctx.stroke()
        }
      } catch (err) {
        // ignore
      } finally {
        rafRef.current = requestAnimationFrame(render)
      }
    }

    if (animating) rafRef.current = requestAnimationFrame(render)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [animating, engine.isSpeaking, engine.inputAnalyser, engine.outputAnalyser])

  useEffect(() => {
    // start animating when listening or speaking
    setAnimating(engine.isListening || engine.isSpeaking || engine.isThinking)
  }, [engine.isListening, engine.isSpeaking, engine.isThinking])

  const onStart = async () => {
    try {
      await engine.startVoiceSession()
      setAnimating(true)
    } catch (err) {
      // errors exposed on engine
    }
  }
  const onEnd = async () => {
    await engine.endVoiceSession()
    setAnimating(false)
  }
  const onInterrupt = async () => { await engine.interrupt() }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 12 }}>
      <div style={{ width: 260, height: 46, background: 'transparent', borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {!engine.isConnected ? (
          <button type="button" onClick={onStart} title="Start voice session" style={{ padding: '8px 10px', borderRadius: 8, border: 'none', background: '#0b74ff', color: '#fff', cursor: 'pointer' }}>▶︎ Start</button>
        ) : (
          <>
            <button type="button" onClick={onEnd} title="End session" style={{ padding: '8px 10px', borderRadius: 8, border: 'none', background: '#e53935', color: '#fff', cursor: 'pointer' }}>■ End</button>
            <button type="button" onClick={onInterrupt} title="Interrupt" style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>Interrupt</button>
          </>
        )}
      </div>
    </div>
  )
}


