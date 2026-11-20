import { useCallback, useEffect, useRef, useState } from 'react'

type WebkitWindow = typeof window & { webkitAudioContext?: typeof AudioContext }

/**
 * Box Battle ovozlari: fon musiqa, zarba, qo'ng'iroq, g'olib fanfari,
 * to'g'ri/xato javob signali va ovozni o'chirish (mute).
 */
export default function useBoxBattleAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const punchRef = useRef<HTMLAudioElement | null>(null)
  const bgmRef = useRef<HTMLAudioElement | null>(null)
  const mutedRef = useRef(false)
  const [muted, setMuted] = useState(false)

  const getCtx = useCallback(() => {
    if (typeof window === 'undefined') return null
    const Ctx = window.AudioContext || (window as WebkitWindow).webkitAudioContext
    if (!Ctx) return null
    if (!audioCtxRef.current) audioCtxRef.current = new Ctx()
    if (audioCtxRef.current.state === 'suspended') void audioCtxRef.current.resume().catch(() => {})
    return audioCtxRef.current
  }, [])

  useEffect(() => {
    const punch = new Audio('/audio/mixkit-punch-with-boxing-gloves-2053.wav')
    punch.preload = 'auto'
    punch.volume = 0.95
    punchRef.current = punch

    const bgm = new Audio('/audio/orqa%20fon.mp3')
    bgm.preload = 'auto'
    bgm.loop = true
    bgm.volume = 0.4
    bgmRef.current = bgm

    return () => {
      bgm.pause()
      punch.pause()
      bgmRef.current = null
      punchRef.current = null
      void audioCtxRef.current?.close().catch(() => {})
      audioCtxRef.current = null
    }
  }, [])

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current
    setMuted(mutedRef.current)
    if (bgmRef.current) bgmRef.current.muted = mutedRef.current
  }, [])

  const playBgm = useCallback(() => {
    const bgm = bgmRef.current
    if (!bgm) return
    bgm.muted = mutedRef.current
    bgm.currentTime = 0
    void bgm.play().catch(() => {})
  }, [])

  const stopBgm = useCallback(() => {
    const bgm = bgmRef.current
    if (!bgm) return
    bgm.pause()
    bgm.currentTime = 0
  }, [])

  const beep = useCallback(
    (freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.09, slideTo?: number) => {
      if (mutedRef.current) return
      const ctx = getCtx()
      if (!ctx) return
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, now)
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + dur)
      g.gain.setValueAtTime(0.0001, now)
      g.gain.exponentialRampToValueAtTime(gain, now + 0.015)
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
      osc.connect(g)
      g.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + dur + 0.03)
    },
    [getCtx],
  )

  const playBell = useCallback(() => {
    beep(730, 0.6, 'triangle', 0.1, 520)
    beep(1180, 0.4, 'sine', 0.05, 820)
  }, [beep])

  const playCountdown = useCallback((final = false) => {
    beep(final ? 880 : 520, final ? 0.35 : 0.15, 'square', 0.05)
  }, [beep])

  const playWrong = useCallback(() => beep(190, 0.28, 'sawtooth', 0.07, 110), [beep])

  const playTick = useCallback(() => beep(1000, 0.06, 'square', 0.03), [beep])

  const playPunch = useCallback(() => {
    if (mutedRef.current) return
    const sample = punchRef.current
    if (sample) {
      try {
        sample.currentTime = 0
        void sample.play().catch(() => {})
        return
      } catch {
        // sample ishlamasa pastdagi synth chaladi
      }
    }
    beep(135, 0.18, 'triangle', 0.18, 58)
  }, [beep])

  const playHit = useCallback(() => {
    beep(210, 0.28, 'sawtooth', 0.06, 95)
  }, [beep])

  const playFanfare = useCallback(() => {
    const notes = [
      { f: 523.25, s: 0, d: 0.16 },
      { f: 659.25, s: 0.2, d: 0.16 },
      { f: 783.99, s: 0.38, d: 0.22 },
      { f: 1046.5, s: 0.64, d: 0.56 },
    ]
    notes.forEach(({ f, s, d }) => window.setTimeout(() => beep(f, d, 'triangle', 0.1), s * 1000))
  }, [beep])

  return { muted, toggleMute, playBgm, stopBgm, playBell, playCountdown, playWrong, playTick, playPunch, playHit, playFanfare }
}