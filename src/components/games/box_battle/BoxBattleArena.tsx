import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import BoxBattle3DScene, { type FighterMode, type ImpactFx } from './BoxBattle3DScene'
import useBoxBattleAudio from './UseBoxBattleAudio'

type Difficulty = 'Oson' | "O'rta" | 'Qiyin'
type Side = 'left' | 'right'
type Winner = Side | 'draw'
type Phase = 'ready' | 'countdown' | 'fight' | 'round-end' | 'finished'

export type TeacherBoxQuestion = {
  prompt: string
  answer: string
  /** Ustozning o'z variantlari (bo'lsa, shular ishlatiladi) */
  options?: string[]
}

type BoxQuestion = {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
}

const DEFAULT_QUESTIONS: TeacherBoxQuestion[] = [
  { prompt: '7 + 8 nechaga teng?', answer: '15', options: ['14', '15', '16', '17'] },
  { prompt: "O'zbekiston poytaxti qaysi shahar?", answer: 'Toshkent', options: ['Samarqand', 'Buxoro', 'Toshkent', 'Xiva'] },
  { prompt: 'Bir haftada necha kun bor?', answer: '7', options: ['5', '6', '7', '8'] },
  { prompt: '9 × 6 nechaga teng?', answer: '54', options: ['48', '54', '56', '63'] },
  { prompt: 'Quyosh tizimidagi eng katta sayyora qaysi?', answer: 'Yupiter', options: ['Mars', 'Yer', 'Yupiter', 'Venera'] },
  { prompt: 'Suv necha darajada muzlaydi?', answer: '0°C', options: ['0°C', '10°C', '50°C', '100°C'] },
  { prompt: 'Uchburchakning nechta tomoni bor?', answer: '3', options: ['2', '3', '4', '5'] },
  { prompt: '100 ning yarmi qancha?', answer: '50', options: ['25', '40', '50', '75'] },
  { prompt: 'Yerning tabiiy yo‘ldoshi nima?', answer: 'Oy', options: ['Quyosh', 'Oy', 'Mars', 'Yulduz'] },
  { prompt: 'Bir yilda necha oy bor?', answer: '12', options: ['10', '11', '12', '13'] },
]

type TeamState = {
  hp: number
  score: number
  hits: number
  correct: number
  wrong: number
  combo: number
  bestCombo: number
  note: string
  status: 'ready' | 'correct' | 'wrong' | 'hit' | 'ko'
  selectedChoice: number | null
}

type DifficultyConfig = {
  roundSeconds: number
  baseScore: number
  speedScore: number
  comboBonus: number
  baseDamage: number
  roundGapMs: number
}

type BoxBattleArenaProps = {
  gameTitle: string
  gameTone: string
  leftTeamName?: string
  rightTeamName?: string
  initialDifficulty?: Difficulty
  teacherQuestions?: TeacherBoxQuestion[]
  setupPath?: string
}

type Banner = { id: number; text: string; tone: 'count' | 'round' | 'ko' | 'info' }
type Popup = { id: number; side: Side; text: string; tone: 'damage' | 'score' }

const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  Oson: { roundSeconds: 16, baseScore: 80, speedScore: 3, comboBonus: 8, baseDamage: 13, roundGapMs: 1700 },
  "O'rta": { roundSeconds: 13, baseScore: 96, speedScore: 4, comboBonus: 11, baseDamage: 16, roundGapMs: 1600 },
  Qiyin: { roundSeconds: 10, baseScore: 112, speedScore: 5, comboBonus: 14, baseDamage: 20, roundGapMs: 1500 },
}

/** Zarba qo'l tegadigan paytgacha kechikish (hujum animatsiyasiga moslab sozlang) */
const CONTACT_DELAY_MS = 330
const COUNTDOWN_STEP_MS = 750

const KEY_CODES: Record<Side, string[]> = {
  left: ['KeyA', 'KeyS', 'KeyD', 'KeyF'],
  right: ['KeyJ', 'KeyK', 'KeyL', 'Semicolon'],
}
const KEY_LABELS: Record<Side, string[]> = {
  left: ['A', 'S', 'D', 'F'],
  right: ['J', 'K', 'L', ';'],
}

const createTeam = (): TeamState => ({
  hp: 100,
  score: 0,
  hits: 0,
  correct: 0,
  wrong: 0,
  combo: 0,
  bestCombo: 0,
  note: 'Tayyor turing.',
  status: 'ready',
  selectedChoice: null,
})

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const shuffle = <T,>(items: T[]) => {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const unique = <T,>(arr: T[]) => arr.filter((x, i) => arr.indexOf(x) === i)

const GENERIC_DISTRACTORS = ["Yuqoridagilarning hech biri", "Barcha javoblar to'g'ri", "Aniq javob yo'q"]

const buildOptions = (answerRaw: string, given: string[] | undefined, pool: string[]) => {
  const answer = answerRaw.trim()

  // 1) Ustoz o'z variantlarini bergan bo'lsa — shularni ishlatamiz
  if (given && given.length >= 2) {
    const others = unique(given.map((s) => s.trim()).filter((s) => s && s !== answer))
    const options = shuffle([answer, ...shuffle(others).slice(0, 3)])
    return { options, correctIndex: options.indexOf(answer) }
  }

  // 2) Raqamli javob (butun yoki o'nli)
  const numeric = Number(answer)
  if (answer !== '' && Number.isFinite(numeric)) {
    const decimals = (answer.split('.')[1] ?? '').length
    const step = decimals > 0 ? 10 ** -decimals : 1
    const spread = Math.max(5, Math.floor(Math.abs(numeric) * 0.25))
    const set = new Set<string>([answer])
    let guard = 0
    while (set.size < 4 && guard < 80) {
      guard += 1
      const value = numeric + randomInt(-spread, spread) * step
      if (value < 0 && numeric >= 0) continue
      set.add(value.toFixed(decimals))
    }
    let fallback = 10
    while (set.size < 4) set.add(String(numeric + fallback++))
    const options = shuffle(Array.from(set))
    return { options, correctIndex: options.indexOf(answer) }
  }

  // 3) Matnli javob: boshqa savollarning javoblaridan chalg'ituvchi variantlar olamiz
  const distractors = shuffle(unique(pool.filter((p) => p && p !== answer))).slice(0, 3)
  let fill = 0
  while (distractors.length < 3) distractors.push(GENERIC_DISTRACTORS[fill++ % GENERIC_DISTRACTORS.length])
  const options = shuffle(unique([answer, ...distractors]))
  return { options, correctIndex: options.indexOf(answer) }
}

const createQuestion = (
  prompt: string,
  answer: string,
  idSeed: string,
  given?: string[],
  pool: string[] = [],
): BoxQuestion => {
  const { options, correctIndex } = buildOptions(answer, given, pool)
  return { id: `${idSeed}-${Math.random().toString(36).slice(2, 8)}`, prompt, options, correctIndex }
}

/** Ikkala jamoaga BIR XIL savol (va variantlar tartibi) beriladi — adolatli bo'lishi uchun */
const buildDeck = (teacherQuestions: TeacherBoxQuestion[]) => {
  const valid = teacherQuestions.filter((q) => q.prompt.trim() && q.answer.trim())
  const pool = valid.map((q) => q.answer.trim())
  return shuffle(valid).map((q, idx) =>
    createQuestion(q.prompt.trim(), q.answer.trim(), `teacher-${idx}`, q.options, pool),
  )
}

function BoxBattleArena({
  gameTitle,
  gameTone,
  leftTeamName = '1-Jamoa',
  rightTeamName = '2-Jamoa',
  initialDifficulty = "O'rta",
  teacherQuestions = [],
  setupPath = '/games/box-battle',
}: BoxBattleArenaProps) {
  const config = DIFFICULTY_CONFIG[initialDifficulty]
  const leftLabel = leftTeamName.trim() || '1-Jamoa'
  const rightLabel = rightTeamName.trim() || '2-Jamoa'
  const hasTeacherQuestions = teacherQuestions.some((q) => q.prompt.trim() && q.answer.trim())
  const gameQuestions = hasTeacherQuestions ? teacherQuestions : DEFAULT_QUESTIONS
  const audio = useBoxBattleAudio()
  const { playBgm, stopBgm, playBell, playCountdown, playWrong, playTick, playPunch, playHit, playFanfare } = audio

  const [questions, setQuestions] = useState<BoxQuestion[]>(() =>
    buildDeck(gameQuestions),
  )
  const [phase, setPhase] = useState<Phase>('ready')
  const [roundIndex, setRoundIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(config.roundSeconds)
  const [leftTeam, setLeftTeam] = useState<TeamState>(createTeam)
  const [rightTeam, setRightTeam] = useState<TeamState>(createTeam)
  const [roundWinner, setRoundWinner] = useState<Side | null>(null)
  const [roundMessage, setRoundMessage] = useState(
    "Boshlash tugmasini bosing. Ikkala jamoaga bir xil savol beriladi: kim to'g'ri javobni birinchi topsa, zarba beradi.",
  )
  const [attackFx, setAttackFx] = useState<{ attacker: Side | null; tick: number; hitStarted: boolean }>({
    attacker: null,
    tick: 0,
    hitStarted: false,
  })
  const [impact, setImpact] = useState<ImpactFx>({ tick: 0, side: null, power: 0.5 })
  const [popups, setPopups] = useState<Popup[]>([])
  const [banner, setBanner] = useState<Banner | null>(null)
  const [winner, setWinner] = useState<Winner | null>(null)

  // Eng so'nggi qiymatlar (setTimeout ichida eskirgan state bilan ishlamaslik uchun)
  const phaseRef = useRef<Phase>('ready')
  const questionsRef = useRef(questions)
  const roundIndexRef = useRef(0)
  const timeLeftRef = useRef(config.roundSeconds)
  const leftRef = useRef(leftTeam)
  const rightRef = useRef(rightTeam)
  const roundSettledRef = useRef(true)
  const timersRef = useRef<number[]>([])
  const idCounter = useRef(0)

  const setPhaseSync = useCallback((next: Phase) => {
    phaseRef.current = next
    setPhase(next)
  }, [])

  const patchTeam = useCallback((side: Side, fn: (prev: TeamState) => TeamState) => {
    const ref = side === 'left' ? leftRef : rightRef
    const next = fn(ref.current)
    ref.current = next
    if (side === 'left') setLeftTeam(next)
    else setRightTeam(next)
  }, [])

  const resetTeams = useCallback(() => {
    leftRef.current = createTeam()
    rightRef.current = createTeam()
    setLeftTeam(leftRef.current)
    setRightTeam(rightRef.current)
  }, [])

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id)
      fn()
    }, ms)
    timersRef.current.push(id)
    return id
  }, [])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }, [])

  const showBanner = useCallback(
    (text: string, tone: Banner['tone'], ms: number) => {
      idCounter.current += 1
      const id = idCounter.current
      setBanner({ id, text, tone })
      schedule(() => setBanner((b) => (b && b.id === id ? null : b)), ms)
    },
    [schedule],
  )

  const addPopup = useCallback(
    (side: Side, text: string, tone: Popup['tone']) => {
      idCounter.current += 1
      const id = idCounter.current
      setPopups((prev) => [...prev, { id, side, text, tone }])
      schedule(() => setPopups((prev) => prev.filter((p) => p.id !== id)), 1200)
    },
    [schedule],
  )

  const resolveMatchWinner = useCallback(
    (reason: string, winnerOverride?: Winner) => {
      const l = leftRef.current
      const r = rightRef.current
      const result: Winner =
        winnerOverride ??
        (l.hp !== r.hp
          ? l.hp > r.hp
            ? 'left'
            : 'right'
          : l.score !== r.score
            ? l.score > r.score
              ? 'left'
              : 'right'
            : l.hits !== r.hits
              ? l.hits > r.hits
                ? 'left'
                : 'right'
              : 'draw')

      setWinner(result)
      setPhaseSync('finished')
      stopBgm()
      setBanner(null)

      const noteFor = (side: Side) =>
        result === 'draw' ? 'Durang.' : result === side ? "G'olib bo'ldingiz!" : "Bu safar yutqazdingiz."
      ;(['left', 'right'] as Side[]).forEach((side) =>
        patchTeam(side, (prev) => ({
          ...prev,
          status: result === 'draw' ? 'ready' : result === side ? 'correct' : 'ko',
          note: noteFor(side),
        })),
      )
      setRoundMessage(reason)
      playFanfare()
    },
    [patchTeam, playFanfare, setPhaseSync, stopBgm],
  )

  const startRound = useCallback(
    (index: number) => {
      roundSettledRef.current = false
      roundIndexRef.current = index
      timeLeftRef.current = config.roundSeconds
      setRoundIndex(index)
      setTimeLeft(config.roundSeconds)
      setRoundWinner(null)
      setAttackFx((prev) => ({ attacker: null, tick: prev.tick + 1, hitStarted: false }))
      setPhaseSync('fight')
      ;(['left', 'right'] as Side[]).forEach((side) =>
        patchTeam(side, (prev) => ({
          ...prev,
          note: "Javobni tanlang!",
          status: prev.hp <= 0 ? 'ko' : 'ready',
          selectedChoice: null,
        })),
      )
      setRoundMessage(`${index + 1}-raund! Ikkala jamoaga bir xil savol. Kim tez topadi?`)
      playBell()
      showBanner(`${index + 1}-RAUND`, 'round', 900)
    },
    [config.roundSeconds, patchTeam, playBell, setPhaseSync, showBanner],
  )

  const goNextRoundOrFinish = useCallback(() => {
    const next = roundIndexRef.current + 1
    if (leftRef.current.hp <= 0 || rightRef.current.hp <= 0) {
      resolveMatchWinner('Nokaut!')
      return
    }
    if (next >= questionsRef.current.length) {
      resolveMatchWinner("Raundlar tugadi. Yakuniy g'olib hisoblandi.")
      return
    }
    startRound(next)
  }, [resolveMatchWinner, startRound])

  /** Hech kim zarba bermagan raund (vaqt tugadi yoki ikkalasi ham xato) */
  const finishRoundWithoutHit = useCallback(
    (message: string, bannerText: string) => {
      if (roundSettledRef.current) return
      roundSettledRef.current = true
      setPhaseSync('round-end')
      setRoundWinner(null)
      const q = questionsRef.current[roundIndexRef.current]
      const answerText = q?.options[q.correctIndex] ?? '-'
      ;(['left', 'right'] as Side[]).forEach((side) =>
        patchTeam(side, (prev) => ({
          ...prev,
          combo: 0,
          status: 'wrong',
          note: `To'g'ri javob: ${answerText}`,
        })),
      )
      setRoundMessage(`${message} To'g'ri javob: ${answerText}`)
      playWrong()
      showBanner(bannerText, 'info', 1100)
      schedule(goNextRoundOrFinish, config.roundGapMs)
    },
    [config.roundGapMs, goNextRoundOrFinish, patchTeam, playWrong, schedule, setPhaseSync, showBanner],
  )

  const applyRoundHit = useCallback(
    (winnerSide: Side) => {
      if (phaseRef.current !== 'fight' || roundSettledRef.current) return
      roundSettledRef.current = true
      setPhaseSync('round-end')
      setRoundWinner(winnerSide)

      const loserSide: Side = winnerSide === 'left' ? 'right' : 'left'
      const winnerName = winnerSide === 'left' ? leftLabel : rightLabel
      const loserName = loserSide === 'left' ? leftLabel : rightLabel
      const winnerTeam = winnerSide === 'left' ? leftRef.current : rightRef.current
      const loserTeam = loserSide === 'left' ? leftRef.current : rightRef.current

      const secondsLeft = timeLeftRef.current
      const nextCombo = winnerTeam.combo + 1
      const gain = config.baseScore + secondsLeft * config.speedScore + nextCombo * config.comboBonus
      const damage = Math.min(45, config.baseDamage + Math.floor(secondsLeft / 2) + Math.floor(nextCombo / 2))
      const isKnockout = loserTeam.hp - damage <= 0

      patchTeam(winnerSide, (prev) => ({
        ...prev,
        correct: prev.correct + 1,
        status: 'correct',
        note: `To'g'ri javob! +${gain} ball`,
      }))
      setRoundMessage(`${winnerName} birinchi bo'lib to'g'ri javob berdi va ${loserName}ga zarba tayyorlamoqda!`)
      setAttackFx((prev) => ({ attacker: winnerSide, tick: prev.tick + 1, hitStarted: false }))

      // Zarba tegadigan paytda: HP kamayadi, ovoz, effektlar
      schedule(() => {
        patchTeam(winnerSide, (prev) => ({
          ...prev,
          score: prev.score + gain,
          hits: prev.hits + 1,
          combo: nextCombo,
          bestCombo: Math.max(prev.bestCombo, nextCombo),
        }))
        patchTeam(loserSide, (prev) => {
          const hp = Math.max(0, prev.hp - damage)
          return {
            ...prev,
            hp,
            combo: 0,
            status: hp <= 0 ? 'ko' : 'hit',
            note: hp <= 0 ? 'Nokaut!' : `Zarba yedi: -${damage} HP`,
          }
        })
        setAttackFx((prev) => (prev.attacker === winnerSide ? { ...prev, hitStarted: true } : prev))
        setImpact((prev) => ({
          tick: prev.tick + 1,
          side: loserSide,
          power: isKnockout ? 1 : Math.min(0.85, 0.25 + damage / 60),
        }))
        playPunch()
        playHit()
        addPopup(loserSide, `-${damage}`, 'damage')
        addPopup(winnerSide, `+${gain}`, 'score')
        setRoundMessage(
          isKnockout
            ? `${winnerName} yakuniy zarbani berdi!`
            : `${winnerName} zarba berdi: ${loserName} -${damage} HP, ${winnerName} +${gain} ball.`,
        )
        if (isKnockout) showBanner('NOKAUT!', 'ko', 1500)
      }, CONTACT_DELAY_MS)

      // Hujumchi joyiga qaytadi
      schedule(
        () => setAttackFx((prev) => ({ attacker: null, tick: prev.tick + 1, hitStarted: false })),
        Math.min(config.roundGapMs - 80, 1000),
      )

      // Keyingi raund yoki yakun
      schedule(
        () => {
          if (isKnockout) resolveMatchWinner(`${winnerName} nokaut bilan g'alaba qozondi!`, winnerSide)
          else goNextRoundOrFinish()
        },
        isKnockout ? Math.max(config.roundGapMs, 1900) : config.roundGapMs,
      )
    },
    [
      addPopup,
      config.baseDamage,
      config.baseScore,
      config.comboBonus,
      config.roundGapMs,
      config.speedScore,
      goNextRoundOrFinish,
      leftLabel,
      patchTeam,
      playHit,
      playPunch,
      resolveMatchWinner,
      rightLabel,
      schedule,
      setPhaseSync,
      showBanner,
    ],
  )

  const handleChoice = useCallback(
    (side: Side, index: number) => {
      if (phaseRef.current !== 'fight' || roundSettledRef.current) return
      const question = questionsRef.current[roundIndexRef.current]
      if (!question || index < 0 || index >= question.options.length) return

      const team = side === 'left' ? leftRef.current : rightRef.current
      if (team.hp <= 0 || team.selectedChoice !== null) return

      if (index === question.correctIndex) {
        patchTeam(side, (prev) => ({ ...prev, selectedChoice: index }))
        applyRoundHit(side)
        return
      }

      // Xato javob
      const otherSide: Side = side === 'left' ? 'right' : 'left'
      const other = otherSide === 'left' ? leftRef.current : rightRef.current
      patchTeam(side, (prev) => ({
        ...prev,
        selectedChoice: index,
        wrong: prev.wrong + 1,
        combo: 0,
        status: 'wrong',
        note: 'Xato! Endi raqib javob beradi.',
      }))
      playWrong()

      if (other.selectedChoice !== null) {
        finishRoundWithoutHit("Ikkala jamoa ham xato javob berdi.", 'IKKALASI XATO')
        return
      }

      patchTeam(otherSide, (prev) => ({ ...prev, note: 'Raqib xato qildi: imkoniyat sizda!' }))
      setRoundMessage(
        `${side === 'left' ? leftLabel : rightLabel} xato javob berdi. ${otherSide === 'left' ? leftLabel : rightLabel}, javob bering!`,
      )
    },
    [applyRoundHit, finishRoundWithoutHit, leftLabel, patchTeam, playWrong, rightLabel],
  )

  const startGame = () => {
    clearTimers()
    playBgm()
    const deck = buildDeck(gameQuestions)
    questionsRef.current = deck
    setQuestions(deck)
    resetTeams()
    setWinner(null)
    setRoundWinner(null)
    setPopups([])
    setBanner(null)
    setImpact((prev) => ({ ...prev, side: null }))
    setAttackFx((prev) => ({ attacker: null, tick: prev.tick + 1, hitStarted: false }))
    roundIndexRef.current = 0
    setRoundIndex(0)
    timeLeftRef.current = config.roundSeconds
    setTimeLeft(config.roundSeconds)
    roundSettledRef.current = true
    setPhaseSync('countdown')
    setRoundMessage('Tayyorlaning! Jang boshlanmoqda...')

    ;['3', '2', '1'].forEach((text, i) => {
      schedule(() => {
        showBanner(text, 'count', COUNTDOWN_STEP_MS - 50)
        playCountdown(i === 2)
      }, i * COUNTDOWN_STEP_MS)
    })
    schedule(() => startRound(0), 3 * COUNTDOWN_STEP_MS)
  }

  const resetGame = () => {
    clearTimers()
    stopBgm()
    const deck = buildDeck(gameQuestions)
    questionsRef.current = deck
    setQuestions(deck)
    resetTeams()
    setPhaseSync('ready')
    roundIndexRef.current = 0
    setRoundIndex(0)
    timeLeftRef.current = config.roundSeconds
    setTimeLeft(config.roundSeconds)
    setRoundWinner(null)
    setWinner(null)
    setPopups([])
    setBanner(null)
    setImpact((prev) => ({ ...prev, side: null }))
    setAttackFx((prev) => ({ attacker: null, tick: prev.tick + 1, hitStarted: false }))
    roundSettledRef.current = true
    setRoundMessage("Boshlash tugmasini bosing. Ikkala jamoaga bir xil savol beriladi: kim to'g'ri javobni birinchi topsa, zarba beradi.")
  }

  // Raund taymeri
  useEffect(() => {
    if (phase !== 'fight') return
    const id = window.setInterval(() => {
      timeLeftRef.current = Math.max(0, timeLeftRef.current - 1)
      setTimeLeft(timeLeftRef.current)
      if (timeLeftRef.current > 0 && timeLeftRef.current <= 3) playTick()
      if (timeLeftRef.current === 0) {
        window.clearInterval(id)
        finishRoundWithoutHit('Vaqt tugadi, hech kim zarba bermadi.', 'VAQT TUGADI')
      }
    }, 1000)
    return () => window.clearInterval(id)
  }, [finishRoundWithoutHit, phase, playTick])

  // Klaviatura: chap jamoa A S D F, o'ng jamoa J K L ;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      const li = KEY_CODES.left.indexOf(e.code)
      if (li >= 0) return handleChoice('left', li)
      const ri = KEY_CODES.right.indexOf(e.code)
      if (ri >= 0) handleChoice('right', ri)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleChoice])

  useEffect(
    () => () => {
      clearTimers()
      stopBgm()
    },
    [clearTimers, stopBgm],
  )

  // ---------- Ko'rinish uchun hisoblar ----------
  const totalRounds = questions.length
  const question = questions[Math.min(roundIndex, Math.max(0, totalRounds - 1))]
  const showQuestion = phase === 'fight' || phase === 'round-end'
  const roundNumber = phase === 'ready' || phase === 'countdown' ? 0 : Math.min(roundIndex + 1, totalRounds)
  const progress = totalRounds > 0 ? Math.round((roundNumber / totalRounds) * 100) : 0
  const teacherCount = teacherQuestions.filter((q) => q.prompt.trim() && q.answer.trim()).length
  const timePercent = phase === 'fight' ? (timeLeft / config.roundSeconds) * 100 : phase === 'round-end' ? (timeLeft / config.roundSeconds) * 100 : 100
  const urgent = phase === 'fight' && timeLeft <= 4

  const modeFor = (side: Side): FighterMode => {
    const other: Side = side === 'left' ? 'right' : 'left'
    const team = side === 'left' ? leftTeam : rightTeam
    if (phase === 'finished') return winner === 'draw' || winner === null ? 'idle' : winner === side ? 'winner' : 'ko'
    if (team.hp <= 0) return 'ko'
    if (attackFx.attacker === side) return 'attack'
    if (attackFx.attacker === other && attackFx.hitStarted) return 'hit'
    return 'idle'
  }

  const winnerTeamName = winner === 'left' ? leftLabel : winner === 'right' ? rightLabel : ''
  const winnerBannerTone =
    winner === 'left'
      ? 'border-cyan-300 bg-cyan-50/95 text-cyan-950 shadow-[0_20px_50px_rgba(14,165,233,0.28)]'
      : winner === 'right'
        ? 'border-rose-300 bg-rose-50/95 text-rose-950 shadow-[0_20px_50px_rgba(244,63,94,0.26)]'
        : 'border-slate-300 bg-white/95 text-slate-900 shadow-xl'

  const bannerClass: Record<Banner['tone'], string> = {
    count: 'text-[7rem] text-white',
    round: 'text-5xl sm:text-6xl text-cyan-100',
    ko: 'text-6xl sm:text-7xl text-rose-100',
    info: 'text-4xl sm:text-5xl text-amber-100',
  }
  const bannerStroke: Record<Banner['tone'], string> = {
    count: '0 4px 0 #0e7490, 0 0 24px rgba(14,116,144,.8)',
    round: '0 4px 0 #0e7490, 0 0 24px rgba(14,116,144,.7)',
    ko: '0 4px 0 #be123c, 0 0 28px rgba(190,18,60,.85)',
    info: '0 4px 0 #b45309, 0 0 24px rgba(180,83,9,.7)',
  }

  const renderTeamPanel = (side: Side) => {
    const team = side === 'left' ? leftTeam : rightTeam
    const label = side === 'left' ? leftLabel : rightLabel
    const keys = KEY_LABELS[side]
    const tone =
      side === 'left'
        ? { border: 'border-cyan-200 bg-cyan-50/60', title: 'text-cyan-700', badge: 'bg-cyan-600 text-white', hover: 'hover:border-cyan-400 hover:bg-cyan-50' }
        : { border: 'border-fuchsia-200 bg-fuchsia-50/60', title: 'text-fuchsia-700', badge: 'bg-fuchsia-600 text-white', hover: 'hover:border-fuchsia-400 hover:bg-fuchsia-50' }
    const options = showQuestion && question ? question.options : ['—', '—', '—', '—']
    const canAnswer = phase === 'fight' && team.selectedChoice === null && team.hp > 0

    return (
      <div className={`flex h-full flex-col rounded-2xl border p-3 shadow-[0_10px_28px_rgba(15,23,42,0.12)] ${tone.border}`}>
        <div className="flex items-center justify-between gap-2">
          <p className={`text-sm font-black ${tone.title}`}>{label}</p>
          <p className="text-[11px] font-bold text-slate-500">
            Tugmalar: <span className="font-black text-slate-700">{keys.join(' ')}</span>
          </p>
        </div>

        <div className="mt-2.5 grid grid-cols-1 gap-2">
          {options.map((option, idx) => {
            const isPicked = team.selectedChoice === idx
            const isCorrect = showQuestion && question ? idx === question.correctIndex : false
            let cls = ''
            if (canAnswer) cls = `border-slate-300 bg-white text-slate-900 ${tone.hover} active:scale-[0.98]`
            else if (phase === 'round-end') cls = isCorrect ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : isPicked ? 'border-rose-300 bg-rose-50 text-rose-800' : 'border-slate-200 bg-slate-100 text-slate-400'
            else if (phase === 'fight') cls = isPicked ? 'border-rose-300 bg-rose-50 text-rose-800' : 'border-slate-200 bg-slate-100 text-slate-400'
            else cls = 'border-slate-200 bg-slate-100 text-slate-400'

            return (
              <button
                key={`${question?.id ?? 'q'}-${idx}`}
                type="button"
                onClick={() => handleChoice(side, idx)}
                disabled={!canAnswer}
                className={`flex min-h-[3.1rem] items-center gap-3 rounded-xl border-2 px-3 py-2 text-left text-base font-extrabold leading-tight transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 sm:text-lg ${cls} ${canAnswer ? '' : 'cursor-not-allowed'}`}
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-black ${canAnswer ? tone.badge : 'bg-slate-300 text-white'}`}>
                  {keys[idx]}
                </span>
                <span className="break-words">{option}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-auto pt-3">
          <p
            className={`rounded-xl border px-3 py-2 text-xs font-extrabold ${
              team.status === 'correct'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : team.status === 'wrong'
                  ? 'border-rose-300 bg-rose-50 text-rose-700'
                  : team.status === 'hit'
                    ? 'border-amber-300 bg-amber-50 text-amber-700'
                    : team.status === 'ko'
                      ? 'border-slate-400 bg-slate-200 text-slate-700'
                      : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            {team.note}
          </p>
        </div>
      </div>
    )
  }

  const hpBar = (hp: number, from: string) => (
    <div className="mt-2 h-3.5 overflow-hidden rounded-full bg-white/80 ring-1 ring-slate-200">
      <div
        className={`h-full rounded-full bg-gradient-to-r transition-[width] duration-500 ease-out ${hp <= 30 ? 'from-rose-500 to-red-600' : from}`}
        style={{ width: `${Math.max(0, Math.min(100, hp))}%` }}
      />
    </div>
  )

  return (
    <section className="relative rounded-3xl border border-white/70 bg-white/85 p-4 shadow-xl backdrop-blur-xl sm:p-6">
      <style>{`
        @keyframes bb-float{0%{opacity:0;transform:translateY(12px) scale(.6)}15%{opacity:1;transform:translateY(0) scale(1.25)}100%{opacity:0;transform:translateY(-80px) scale(1)}}
        @keyframes bb-pop{0%{opacity:0;transform:scale(.4)}18%{opacity:1;transform:scale(1.15)}75%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.08)}}
        @keyframes bb-flash{0%{opacity:.5}100%{opacity:0}}
        @media (prefers-reduced-motion: reduce){.bb-anim{animation-duration:.01ms !important}}
      `}</style>

      <div className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-56 w-56 rounded-full bg-fuchsia-200/35 blur-3xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">{gameTitle}</h2>
          <p className="mt-1 text-sm font-bold text-slate-600">
          Bir xil savolga tez va to'g'ri javob bering. Birinchi to'g'ri javob zarba beradi.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to={setupPath}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-700 transition hover:-translate-y-0.5"
          >
            {'< '}Orqaga
          </Link>
          <button
            type="button"
            onClick={audio.toggleMute}
            aria-pressed={audio.muted}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-700 transition hover:-translate-y-0.5"
          >
            {audio.muted ? "Ovoz o'chiq" : 'Ovoz yoqiq'}
          </button>
          <button
            type="button"
            onClick={resetGame}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-700 transition hover:-translate-y-0.5"
          >
            Nolga tushir
          </button>
          <button
            type="button"
            onClick={startGame}
            className={`rounded-xl bg-gradient-to-r px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${gameTone}`}
          >
            {phase === 'ready' ? "O'yinni boshlash" : 'Qayta start'}
          </button>
        </div>
      </div>


      <div className="relative mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><p className="text-xs font-extrabold text-slate-400">Raund</p><p className="mt-1 text-2xl font-black text-slate-900">{roundNumber}/{totalRounds}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><p className="text-xs font-extrabold text-slate-400">Daraja</p><p className="mt-1 text-lg font-extrabold text-slate-700">{initialDifficulty}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><p className="text-xs font-extrabold text-slate-400">Savol manbasi</p><p className="mt-1 text-lg font-extrabold text-slate-700">{hasTeacherQuestions ? 'Teacher paneli' : 'Tayyor savollar'}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><p className="text-xs font-extrabold text-slate-400">Savollar soni</p><p className="mt-1 text-lg font-extrabold text-slate-700">{hasTeacherQuestions ? teacherCount : DEFAULT_QUESTIONS.length}</p></div>
      </div>

      <div className="relative mt-4 rounded-[1.8rem] border border-slate-200 bg-white p-3 shadow-lg sm:p-4">
        <div className="rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(160deg,#f8fbff_0%,#eef8ff_52%,#fff4dd_100%)] p-3 sm:p-4">
          {/* HP */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-cyan-700">{leftLabel}</p>
                <p className="text-sm font-extrabold text-slate-700">{leftTeam.hp} HP · {leftTeam.score} ball</p>
              </div>
              {hpBar(leftTeam.hp, 'from-cyan-500 to-blue-500')}
            </div>
            <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50/60 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-fuchsia-700">{rightLabel}</p>
                <p className="text-sm font-extrabold text-slate-700">{rightTeam.hp} HP · {rightTeam.score} ball</p>
              </div>
              {hpBar(rightTeam.hp, 'from-fuchsia-500 to-rose-500')}
            </div>
          </div>

          {/* Umumiy savol — katta, uzoqdan ham o'qiladigan */}
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-extrabold text-slate-500">
                {showQuestion ? `Savol ${roundNumber}/${totalRounds}` : 'Savol'}
                {showQuestion && question ? (hasTeacherQuestions ? ' · Ustoz savoli' : ' · Tayyor savol') : ''}
              </p>
              <p className={`text-3xl font-black tabular-nums ${urgent ? 'text-rose-600' : 'text-slate-900'}`} aria-live="off">
                {phase === 'fight' || phase === 'round-end' ? `${timeLeft}s` : '--'}
              </p>
            </div>
            <p className="mt-1 min-h-[3rem] text-2xl font-black leading-tight text-slate-900 sm:text-4xl">
              {showQuestion && question ? question.prompt : phase === 'finished' ? 'O\'yin tugadi' : 'Savol raund boshlanganda chiqadi'}
            </p>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${urgent ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: `${timePercent}%` }}
              />
            </div>
          </div>

          <div className="mt-3 grid items-stretch gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)]">
            <div className="order-2 xl:order-1">{renderTeamPanel('left')}</div>

            <div className="order-1 xl:order-2">
              <div className="relative">
                {phase === 'finished' ? (
                  <div className="pointer-events-none absolute inset-x-0 -top-5 z-30 flex justify-center">
                    <div className={`min-w-[13rem] rounded-[1.6rem] border px-5 py-3 text-center backdrop-blur ${winnerBannerTone}`}>
                      <p className="text-xs font-black tracking-[0.2em]">{winner === 'draw' ? 'DURANG' : "G'OLIB!"}</p>
                      {winner !== 'draw' ? <p className="mt-1 text-lg font-black">{winnerTeamName}</p> : null}
                    </div>
                  </div>
                ) : null}

                <div className="relative h-[19rem] overflow-hidden rounded-[1.6rem] border border-slate-200 bg-[#dceefa] sm:h-[26rem]">
                  <BoxBattle3DScene
                    leftMode={modeFor('left')}
                    rightMode={modeFor('right')}
                    animationTick={attackFx.tick}
                    impact={impact}
                  />

                  {/* Zarba chaqnashi */}
                  {impact.tick > 0 ? (
                    <div
                      key={impact.tick}
                      className="bb-anim pointer-events-none absolute inset-0 bg-white"
                      style={{ animation: 'bb-flash .3s ease-out forwards', opacity: 0 }}
                    />
                  ) : null}

                  {/* Suzuvchi yozuvlar: -zarar / +ball */}
                  {popups.map((p) => (
                    <div
                      key={p.id}
                      className={`bb-anim pointer-events-none absolute z-20 font-black ${p.side === 'left' ? 'left-[14%]' : 'right-[14%]'} ${p.tone === 'damage' ? 'top-[28%] text-4xl text-rose-500 sm:text-5xl' : 'top-[14%] text-3xl text-emerald-500'}`}
                      style={{ animation: 'bb-float 1.1s ease-out forwards', textShadow: '0 2px 0 #fff, 0 0 14px rgba(255,255,255,.9)' }}
                    >
                      {p.text}
                    </div>
                  ))}

                  {/* Markaziy e'lon: 3-2-1, raund, NOKAUT */}
                  {banner ? (
                    <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
                      <p
                        key={banner.id}
                        className={`bb-anim font-black ${bannerClass[banner.tone]}`}
                        style={{ animation: 'bb-pop .85s ease-out forwards', textShadow: bannerStroke[banner.tone] }}
                      >
                        {banner.text}
                      </p>
                    </div>
                  ) : null}

                  {/* Boshlash oynasi */}
                  {phase === 'ready' ? (
                    <div className="absolute inset-0 z-30 grid place-items-center bg-slate-900/55 p-4 backdrop-blur-[2px]">
                      <div className="max-w-sm rounded-2xl bg-white p-5 text-center shadow-2xl">
                        <p className="text-xl font-black text-slate-900">Qanday o'ynaladi?</p>
                        <p className="mt-2 text-sm font-bold text-slate-600">
                          Savol ikkala jamoaga bir vaqtda chiqadi. Birinchi to'g'ri javob berganning jangchisi zarba uradi.
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm font-extrabold">
                          <div className="rounded-xl bg-cyan-50 px-2 py-2 text-cyan-800">{leftLabel}<br />{KEY_LABELS.left.join(' ')}</div>
                          <div className="rounded-xl bg-fuchsia-50 px-2 py-2 text-fuchsia-800">{rightLabel}<br />{KEY_LABELS.right.join(' ')}</div>
                        </div>
                        <p className="mt-2 text-xs font-bold text-slate-500">Yoki variantni bosing (sichqoncha / ekran).</p>
                        <button
                          type="button"
                          onClick={startGame}
                          className={`mt-4 w-full rounded-xl bg-gradient-to-r px-4 py-3 text-sm font-black text-white shadow-lg ${gameTone}`}
                        >
                          O'yinni boshlash
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="order-3">{renderTeamPanel('right')}</div>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
            <div className={`h-full rounded-full bg-gradient-to-r transition-[width] duration-500 ${gameTone}`} style={{ width: `${progress}%` }} />
          </div>

          <div
            role="status"
            className={`mt-3 rounded-2xl border px-4 py-3 text-sm font-extrabold sm:text-base ${
              roundWinner ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : phase === 'round-end' ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-cyan-200 bg-cyan-50 text-cyan-700'
            }`}
          >
            {roundMessage}
          </div>

          {phase === 'finished' ? (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-lg font-black text-slate-900">
                {winner === 'draw' ? 'Natija: durang' : `${winnerTeamName} g'olib bo'ldi`}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {([['left', leftLabel, leftTeam], ['right', rightLabel, rightTeam]] as const).map(([side, label, t]) => (
                  <div key={side} className={`rounded-xl border px-4 py-3 ${winner === side ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                    <p className="text-sm font-black text-slate-800">{label}</p>
                    <p className="mt-1 text-sm font-bold text-slate-600">
                      {t.score} ball · {t.hits} zarba · {t.correct} to'g'ri · {t.wrong} xato · eng uzun seriya {t.bestCombo} · {t.hp} HP
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={startGame}
                  className={`rounded-xl bg-gradient-to-r px-5 py-2.5 text-sm font-black text-white shadow-lg ${gameTone}`}
                >
                  Yana o'ynash
                </button>
                <Link to={setupPath} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-black text-slate-700">
                  Sozlamalarga qaytish
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default BoxBattleArena
