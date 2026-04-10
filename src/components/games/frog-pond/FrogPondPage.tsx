import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  buildStageOneQuestions,
  buildStageThreeQuestions,
  buildStageTwoQuestions,
  type FrogQuizQuestion,
} from './frogQuizQuestions'
import frogSprite from './images/green_frog_jumping_wild_animal_toad_top_view_isolated_white_background.svg'
import lilyPadSprite from './images/lotus_leaf.png'
import pondBackground from './images/pond_frog_bg.png'
import frogPondMusic from './Children_s_Music_Children_s_Music_Happy_Upbeat_Music_Instrume.m4a'
import useContextPro from '../../../hooks/useContextPro'
import { useGameResultSubmission } from '../../../hooks/useGameResultSubmission'
import { fetchGameQuestions, fetchGameQuestionsByTeacher } from '../../../hooks/useGameQuestions'

type GameStatus = 'idle' | 'question' | 'jumping' | 'sinking' | 'feedback' | 'won' | 'lost'
type GameMode = 'solo' | 'team' | 'ai'
type FrogId = 'frogA' | 'frogB'
type AiDifficulty = 'easy' | 'medium' | 'hard'

type ActiveQuestion = {
  frogId: FrogId
  levelIndex: number
  padIndex: number
  questionIndex: number
  question: FrogQuizQuestion
}

type Position = {
  left: number
  top: number
}

type CompletedJump = {
  levelIndex: number
  padIndex: number
}

type FrogState = {
  completedJumps: CompletedJump[]
  seenQuestionKeysByLevel: string[][]
}

type FeedbackState = {
  frogId: FrogId
  tone: 'correct' | 'wrong' | 'timeout'
  title: string
  description: string
}

type StageWinState = Record<FrogId, number>
type StageFinishOrderState = Record<FrogId, number | null>
type SubjectStats = {
  correct: number
  wrong: number
  total: number
}

type SubjectPerformanceState = Record<string, SubjectStats>
type FrogPondTeacherQuestion = {
  id?: string
  subject?: string
  question?: string
  options?: string[]
  variants?: string[]
  answer?: string
  answerIndex?: number
  correctAnswer?: string
  stage?: number
}

const LEVEL_COUNT = 7
const STAGE_COUNT = 3
const QUESTION_SECONDS = 20
const FROG_POND_GAME_KEY = 'frog-pond'

const columnPositions = [10, 18.5, 27, 35.5, 44, 52.5, 61]
const lanePositions = [18, 34, 50, 66, 82]
const mobileColumnPositions = [14, 27, 40, 53, 66, 79, 92]
const mobileLanePositions = [18, 35, 52, 69, 86]

function buildRowLayouts(columns: number[], lanes: number[]) {
  return columns.map((left) => lanes.map((top) => ({ left, top })))
}

const frogStartPosition: Position = {
  left: 3.1,
  top: 58,
}

const TEAM_START_VERTICAL_OFFSET = 6.1
const SHARED_PAD_VERTICAL_OFFSET = 5.8
const PAD_CENTER_OFFSET_X = 0
const PAD_CENTER_OFFSET_Y = 0

const pageClassName =
  'relative min-h-[100dvh] overflow-hidden bg-[#6aabdb] bg-cover bg-center text-[#f7fff6] [--frog-pond-hud-safe-top:82px] max-[900px]:[--frog-pond-hud-safe-top:92px] max-[430px]:[--frog-pond-hud-safe-top:88px]'
const shellClassName = 'relative z-[2] min-h-[100dvh] w-full box-border p-2 max-[900px]:p-2.5 max-[430px]:p-2'
const sidePanelClassName =
  'pointer-events-none absolute right-3 top-[126px] z-[9] flex min-h-0 w-[390px] items-start justify-end max-[900px]:relative max-[900px]:inset-auto max-[900px]:z-[1] max-[900px]:w-[min(620px,100%)] max-[900px]:justify-center'
const playfieldClassName =
  'relative h-[calc(100dvh-16px)] w-full overflow-hidden rounded-[8px] border border-white/20 bg-transparent shadow-[0_22px_50px_rgba(36,79,108,0.22),inset_0_0_0_1px_rgba(255,255,255,0.08)] max-[900px]:h-auto max-[900px]:w-[min(92vw,86vh)] max-[900px]:aspect-[0.92] max-[430px]:h-[calc(100dvh-16px)] max-[430px]:w-full max-[430px]:aspect-auto max-[430px]:overflow-x-auto max-[430px]:overflow-y-hidden max-[430px]:[-webkit-overflow-scrolling:touch] max-[430px]:[scroll-snap-type:x_proximity]'
const boardScrollClassName =
  'relative h-full w-full max-[430px]:overflow-x-auto max-[430px]:overflow-y-hidden max-[430px]:pt-[92px] max-[430px]:[-webkit-overflow-scrolling:touch]'
const boardClassName = 'relative h-full w-full min-w-full max-[430px]:h-full max-[430px]:w-[1080px] max-[430px]:min-w-[1080px] max-[430px]:[scroll-snap-align:start]'
const boardHudClassName =
  'pointer-events-none absolute left-4 right-4 top-2.5 z-[5] flex flex-wrap items-center justify-evenly gap-3.5 max-[430px]:left-3.5 max-[430px]:right-3.5 max-[430px]:gap-2'
const boardPillClassName =
  'flex min-h-[84px] min-w-[88px] flex-col items-center justify-center rounded-full border border-white/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.30),rgba(255,255,255,0.18)),rgba(98,177,232,0.50)] px-3.5 py-2 text-center shadow-[0_16px_30px_rgba(51,88,112,0.24),inset_0_1px_0_rgba(255,255,255,0.24)] backdrop-blur-[14px] max-[430px]:min-h-[76px] max-[430px]:min-w-32 max-[430px]:px-3'
const pillLabelClassName = 'block w-full text-center text-[10px] font-normal uppercase leading-none tracking-[0.12em] text-white'
const pillValueClassName = 'mt-1 block w-full text-center text-base font-bold text-white [text-shadow:0_2px_12px_rgba(35,83,120,0.26)]'
const pillSmallClassName = 'mt-1 block w-full max-w-[24ch] text-center text-[8px] leading-[1.3] text-[#f8fdff]/95'
const modalBackdropClassName = 'relative z-10 grid w-full place-items-start justify-items-stretch bg-transparent pointer-events-auto max-[900px]:justify-items-center'
const modalClassName =
  'pointer-events-auto mt-[132px] flex min-h-[500px] w-full max-w-[390px] flex-col rounded-[8px] border border-[#caf8ef]/20 bg-[radial-gradient(circle_at_top_right,rgba(120,255,212,0.16),transparent_24%),linear-gradient(180deg,rgba(10,44,48,0.96),rgba(3,18,24,0.98))] px-[22px] py-5 shadow-[0_36px_90px_rgba(2,14,22,0.42)] max-[900px]:mt-[116px]'
const subjectClassName =
  'inline-flex items-center gap-2 rounded-full border border-[#caf8ef]/15 bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.16em]'
const noteClassName = 'mt-4 text-sm text-[#e4fff4]/75'
const questionClassName = 'mt-4 flex min-h-[4.2em] items-center text-[clamp(20px,2vw,28px)] font-bold leading-[1.15]'
const answerButtonClassName =
  'flex min-w-0 cursor-pointer items-start gap-3.5 overflow-hidden rounded-[8px] border border-[#caf8ef]/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] px-[18px] py-4 text-left font-bold text-[#f7fff6] shadow-[0_16px_22px_rgba(2,14,22,0.14)] transition hover:-translate-y-0.5 hover:border-[#9affc3]/35 hover:shadow-[0_18px_28px_rgba(2,14,22,0.22)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-[0_16px_22px_rgba(2,14,22,0.14)] disabled:hover:translate-y-0'
const overlayClassName = 'absolute inset-0 z-10 grid place-items-center bg-[#030c13]/55 backdrop-blur-[10px]'
const overlayCardBaseClassName =
  'w-[min(680px,calc(100%-28px))] rounded-[8px] border border-[#caf8ef]/20 px-7 py-[30px] text-center shadow-[0_36px_80px_rgba(2,14,22,0.42)]'
const modeCardClassName =
  'cursor-pointer rounded-[8px] border border-[#caf8ef]/20 bg-[radial-gradient(circle_at_top_right,rgba(135,255,205,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-[22px] text-left text-[#f7fff6] shadow-[0_22px_42px_rgba(2,14,22,0.18)] transition hover:-translate-y-1 hover:border-[#b8ffca]/35 hover:shadow-[0_26px_50px_rgba(2,14,22,0.24)]'
const modeTagClassName = 'inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-[7px] text-xs font-black uppercase tracking-[0.12em]'
const primaryButtonClassName = 'cursor-pointer rounded-full bg-[linear-gradient(135deg,#f5ff8c,#61dc93)] px-6 py-3.5 font-black uppercase tracking-[0.04em] text-[#04242b] shadow-[0_18px_34px_rgba(97,220,147,0.26)]'
const secondaryButtonClassName = 'cursor-pointer rounded-full border border-[#caf8ef]/15 bg-white/10 px-6 py-3.5 font-black uppercase tracking-[0.04em] text-[#f7fff6]'

function cx(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(' ')
}

function createInitialFrogState(): FrogState {
  return {
    completedJumps: [],
    seenQuestionKeysByLevel: Array.from({ length: LEVEL_COUNT }, () => []),
  }
}

function normalizeTeacherQuestions(items: FrogPondTeacherQuestion[], stageIndex: number): FrogQuizQuestion[] {
  return items
    .filter((item) => !item.stage || item.stage === stageIndex + 1)
    .map((item) => {
      const options = (item.options ?? item.variants ?? []).filter(Boolean).slice(0, 4)
      const indexedAnswer =
        typeof item.answerIndex === 'number' && item.answerIndex >= 0 && item.answerIndex < options.length
          ? options[item.answerIndex]
          : ''
      const answer = String(item.answer ?? item.correctAnswer ?? indexedAnswer).trim()
      if (!item.question || !answer || options.length < 2) {
        return null
      }
      const finalOptions = options.includes(answer) ? options : [...options.slice(0, 3), answer]
      if (finalOptions.length !== 4) {
        return null
      }
      return {
        subject: item.subject?.trim() || 'Teacher savoli',
        question: item.question.trim(),
        options: [finalOptions[0], finalOptions[1], finalOptions[2], finalOptions[3]] as [string, string, string, string],
        answer,
      }
    })
    .filter((item): item is FrogQuizQuestion => Boolean(item))
}

function buildLevels(stageIndex: number, teacherQuestions: FrogPondTeacherQuestion[] = []) {
  const pool =
    stageIndex === 0
      ? buildStageOneQuestions()
      : stageIndex === 1
        ? buildStageTwoQuestions()
        : buildStageThreeQuestions()
  const normalizedTeacher = normalizeTeacherQuestions(teacherQuestions, stageIndex)
  const basePool = shuffleLevel(pool.flat())

  if (normalizedTeacher.length === 0) {
    return Array.from({ length: LEVEL_COUNT }, (_, levelIndex) =>
      shuffleLevel(basePool.filter((_, questionIndex) => questionIndex % LEVEL_COUNT === levelIndex)),
    )
  }

  const teacherPool = shuffleLevel(normalizedTeacher)
  const levels = Array.from({ length: LEVEL_COUNT }, () => [] as FrogQuizQuestion[])

  teacherPool.forEach((question, index) => {
    levels[index % LEVEL_COUNT].push(question)
  })

  basePool.forEach((question, index) => {
    levels[index % LEVEL_COUNT].push(question)
  })

  return levels.map((level) => shuffleLevel(level))
}

function buildQuestionKey(question: FrogQuizQuestion) {
  return `${question.subject}::${question.question}`
}

function getQuestionIndexForAttempt(level: FrogQuizQuestion[], padIndex: number, seenKeys: string[], usedQuestionKeys: string[]) {
  for (let offset = 0; offset < level.length; offset += 1) {
    const candidate = (padIndex + offset) % level.length
    const candidateKey = buildQuestionKey(level[candidate])
    if (!seenKeys.includes(candidateKey) && !usedQuestionKeys.includes(candidateKey)) {
      return candidate
    }
  }

  for (let offset = 0; offset < level.length; offset += 1) {
    const candidate = (padIndex + offset) % level.length
    const candidateKey = buildQuestionKey(level[candidate])
    if (!usedQuestionKeys.includes(candidateKey)) {
      return candidate
    }
  }

  return padIndex % level.length
}

function alignToPad(position: Position): Position {
  return {
    left: position.left + PAD_CENTER_OFFSET_X,
    top: position.top + PAD_CENTER_OFFSET_Y,
  }
}

function toPlayfieldTop(topPercent: number) {
  return `calc(var(--frog-pond-hud-safe-top) + (${topPercent} * (100% - var(--frog-pond-hud-safe-top)) / 100))`
}

function shuffleLevel(level: FrogQuizQuestion[]): FrogQuizQuestion[] {
  const next = [...level]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = next[i]
    next[i] = next[j]
    next[j] = tmp
  }
  return next
}

function padLetter(index: number) {
  return String.fromCharCode(65 + index)
}

function isCompetitiveMode(mode: GameMode | null) {
  return mode === 'team' || mode === 'ai'
}

function getFrogLabel(frogId: FrogId, mode: GameMode | null) {
  if (mode === 'ai') {
    return frogId === 'frogA' ? 'Siz' : 'AI qurbaqa'
  }
  return frogId === 'frogA' ? 'Qurbaqa A' : 'Qurbaqa B'
}

function getAiAccuracy(stage: number, level: number, difficulty: AiDifficulty) {
  if (difficulty === 'hard') {
    const hardStageBase = [0.94, 0.91, 0.88][stage] ?? 0.88
    const hardLevelPenalty = level * 0.01
    return Math.max(0.78, Math.min(0.95, hardStageBase - hardLevelPenalty))
  }

  const difficultyBoost = difficulty === 'easy' ? -0.14 : 0
  const stageBase = ([0.78, 0.66, 0.54][stage] ?? 0.6) + difficultyBoost
  const levelPenalty = level * 0.025
  return Math.max(0.34, Math.min(0.78, stageBase - levelPenalty))
}

function chooseAiAnswer(
  question: FrogQuizQuestion,
  stage: number,
  level: number,
  difficulty: AiDifficulty,
  forceCorrect = false,
) {
  if (forceCorrect) {
    return question.answer
  }

  const shouldBeCorrect = Math.random() < getAiAccuracy(stage, level, difficulty)
  if (shouldBeCorrect) {
    return question.answer
  }

  const wrongOptions = question.options.filter((option) => option !== question.answer)
  if (wrongOptions.length === 0) {
    return question.answer
  }

  return wrongOptions[Math.floor(Math.random() * wrongOptions.length)]
}

function pickAiPadIndex(options: number[], blockedIndex?: number | null) {
  const pool = options.filter((index) => index !== blockedIndex)
  const source = pool.length > 0 ? pool : options
  return source[Math.floor(Math.random() * source.length)]
}

function getAiRecommendation(stats: SubjectPerformanceState) {
  const ranked = Object.entries(stats).sort((a, b) => b[1].total - a[1].total)
  const strongest = [...ranked].sort((a, b) => (b[1].correct / Math.max(1, b[1].total)) - (a[1].correct / Math.max(1, a[1].total)))[0]
  const weakest = [...ranked].sort((a, b) => (a[1].correct / Math.max(1, a[1].total)) - (b[1].correct / Math.max(1, b[1].total)))[0]

  if (!ranked.length) {
    return 'AI hali sizni kuzatyapti. Bir nechta savoldan keyin tavsiya chiqadi.'
  }

  if (!weakest || weakest[1].total < 1) {
    return 'AI hali yetarli ma’lumot yig‘madi.'
  }

  if (strongest && strongest[0] !== weakest[0]) {
    return `${weakest[0]} faniga ko‘proq e’tibor bering. ${strongest[0]} sizning kuchli tomoningiz bo‘lib turibdi.`
  }

  return `${weakest[0]} bo‘yicha mashqni ko‘paytirish foydali bo‘ladi.`
}

function StageScoreboard({ stageWins, gameMode }: { stageWins: StageWinState; gameMode: GameMode | null }) {
  if (!isCompetitiveMode(gameMode)) {
    return null
  }

  return (
    <div className={cx(boardPillClassName, 'min-w-[280px] max-w-[280px] px-3 max-[900px]:min-w-60 max-[430px]:min-w-[190px]')}>
      <div className="grid w-full grid-cols-[minmax(52px,1fr)_auto_minmax(110px,1fr)] items-center text-center">
        <span className="flex min-w-0 items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap text-center text-[7px] font-extrabold uppercase leading-none tracking-normal text-[#effaff]/80">{getFrogLabel('frogA', gameMode)}</span>
        <strong className="m-0 flex items-center justify-center whitespace-nowrap px-1 text-center text-[15px] font-bold leading-none tracking-normal">{stageWins.frogA} : {stageWins.frogB}</strong>
        <span className="flex min-w-0 items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap text-center text-[7px] font-extrabold uppercase leading-none tracking-normal text-[#effaff]/80">{getFrogLabel('frogB', gameMode)}</span>
      </div>
    </div>
  )
}

function FrogCharacter({
  className = '',
  frogId,
  sprite,
  imageClassName = '',
  style,
}: {
  className?: string
  frogId: FrogId
  sprite: string
  imageClassName?: string
  style?: CSSProperties
}) {
  return (
    <div
      className={cx(
        'pointer-events-none absolute z-[4] aspect-[1/0.92] w-[clamp(74px,5.9vw,98px)] -translate-x-1/2 -translate-y-1/2 transition-[left,top,transform,filter,opacity] duration-[920ms] ease-[cubic-bezier(0.22,0.9,0.24,1)] will-change-[left,top,transform] max-[900px]:w-[clamp(74px,12vw,96px)] max-[430px]:h-28 max-[430px]:w-28',
        className,
      )}
      aria-label={getFrogLabel(frogId, null)}
      style={style}
    >
      <div className="absolute bottom-[-6%] left-1/2 h-[12%] w-[72%] -translate-x-1/2 rounded-full bg-[#284c63]/25 blur-md" />
      <img
        className={cx(
          'absolute left-1/2 top-1/2 h-[84%] w-[84%] -translate-x-1/2 -translate-y-1/2 rotate-90 select-none object-contain drop-shadow-[0_8px_14px_rgba(0,0,0,0.12)]',
          imageClassName,
        )}
        src={sprite}
        alt="Frog"
        draggable={false}
      />
    </div>
  )
}

function QuizModal({
  data,
  timeLeft,
  gameMode,
  onAnswer,
}: {
  data: ActiveQuestion
  timeLeft: number
  gameMode: GameMode | null
  onAnswer: (option: string) => void
}) {
  const progress = Math.max(0, (timeLeft / QUESTION_SECONDS) * 100)
  const frogLabel = getFrogLabel(data.frogId, gameMode)
  const isAiTurn = gameMode === 'ai' && data.frogId === 'frogB'

  return (
    <div className={modalBackdropClassName}>
      <div className={modalClassName}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className={subjectClassName}>{data.question.subject}</span>
            <p className={noteClassName}>
              {frogLabel} navbati. Nilufar {padLetter(data.padIndex)} ichidagi savolga 20 soniya ichida javob bering.
            </p>
            {isAiTurn ? <p className={noteClassName}>AI qurbaqa savolni tahlil qilyapti. U har doim ham to‘g‘ri topmaydi.</p> : null}
          </div>
          <div className="w-[120px] text-right">
            <span className="text-sm text-white/80">Vaqt</span>
            <strong className="block text-3xl">{timeLeft}s</strong>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-white/10">
              <span className="block h-full rounded-full bg-[linear-gradient(90deg,#f8fe7e,#46d18e)] transition-[width] duration-200" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <h2 className={questionClassName}>{data.question.question}</h2>

        <div className="mt-[18px] grid auto-rows-[minmax(78px,auto)] grid-cols-2 gap-3 max-[900px]:grid-cols-1">
          {data.question.options.map((option, index) => (
            <button
              key={`${data.levelIndex}-${option}`}
              type="button"
              className={answerButtonClassName}
              onClick={() => onAnswer(option)}
              disabled={isAiTurn}
            >
              <span className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full border border-white/20 bg-white/10">{padLetter(index)}</span>
              <span className="min-w-0 flex-1 whitespace-normal break-words leading-[1.28] [overflow-wrap:anywhere]">{option}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function FeedbackCard({ data, gameMode }: { data: FeedbackState; gameMode: GameMode | null }) {
  return (
    <div className={modalBackdropClassName}>
      <div className={cx(modalClassName, 'min-h-0 max-w-[340px] px-[18px] py-4', data.tone === 'correct' ? 'border-[#9cffbe]/25' : 'border-[#ffafaf]/25')}>
        <span className={subjectClassName}>{getFrogLabel(data.frogId, gameMode)}</span>
        <h2 className="mt-2 min-h-0 text-[clamp(18px,1.8vw,24px)] font-bold leading-[1.12]">{data.title}</h2>
        <p className="mt-2.5 text-[13px] text-[#e4fff4]/75">{data.description}</p>
      </div>
    </div>
  )
}

function ModeOverlay({
  aiDifficulty,
  onAiDifficultyChange,
  onSelect,
}: {
  aiDifficulty: AiDifficulty
  onAiDifficultyChange: (difficulty: AiDifficulty) => void
  onSelect: (mode: GameMode) => void
}) {
  return (
    <div className={overlayClassName}>
      <div className={cx(overlayCardBaseClassName, 'w-[min(880px,calc(100%-28px))] bg-[radial-gradient(circle_at_top,rgba(139,255,214,0.18),transparent_26%),linear-gradient(180deg,rgba(9,38,45,0.97),rgba(2,15,20,0.98))]')}>
        <p className={subjectClassName}>Frog Pond Quiz</p>
        <h2 className="m-0 mt-3 text-[clamp(34px,4vw,56px)] font-bold leading-[0.96]">Qanday o‘ynaymiz?</h2>
        <p className="mx-auto mt-3 max-w-[52ch] text-[#ecfff5]/80">1 kishilik, 2 kishilik yoki AI qurbaqa bilan bellashadigan rejimlardan birini tanlang.</p>

        <div className="mt-[22px] grid grid-cols-3 gap-3.5 max-[900px]:grid-cols-1">
          <button type="button" className={modeCardClassName} onClick={() => onSelect('solo')}>
            <span className={modeTagClassName}>1 kishilik</span>
            <strong className="mt-3 block text-[26px]">Yakka sarguzasht</strong>
            <p className="m-0 mt-2.5 max-w-none text-[#ecfff5]/80">Bitta qurbaqa bilan 3 bosqich va 7 darajadan iborat yo‘lni tugating. Bosqichlar o‘tgan sari savollar qiyinlashadi.</p>
          </button>

          <button type="button" className={modeCardClassName} onClick={() => onSelect('team')}>
            <span className={modeTagClassName}>Jamoalik</span>
            <strong className="mt-3 block text-[26px]">2 qurbaqa bellashuvi</strong>
            <p className="m-0 mt-2.5 max-w-none text-[#ecfff5]/80">Yashil va qizil qurbaqa navbatma-navbat savol yechadi. Adashgan qurbaqa boshiga qaytadi, ikkinchisi davom etadi.</p>
          </button>

          <button type="button" className={modeCardClassName} onClick={() => onSelect('ai')}>
            <span className={modeTagClassName}>AI bilan</span>
            <strong className="mt-3 block text-[26px]">Siz vs AI qurbaqa</strong>
            <p className="m-0 mt-2.5 max-w-none text-[#ecfff5]/80">2 ta qurbaqa maydonga tushadi: biri siz, ikkinchisi AI. AI ba'zi savollarda xato qiladi, 3 bosqichning hammasini to‘liq o‘ynaydi.</p>
            <div className="mt-4 flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
              {([['hard', 'Kuchli']] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={cx(
                    'cursor-pointer rounded-full border border-[#caf8ef]/20 bg-white/10 px-3 py-2 text-xs font-extrabold tracking-[0.04em] text-[#f7fff6] transition hover:-translate-y-px hover:border-[#b8ffca]/35',
                    aiDifficulty === value && 'border-[#f5ff8c]/45 bg-[linear-gradient(135deg,rgba(245,255,140,0.2),rgba(97,220,147,0.24))] text-[#fffed6]',
                  )}
                  onClick={() => onAiDifficultyChange(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

function EndOverlay({
  kind,
  levelIndex,
  score,
  jumps,
  winnerFrog,
  gameMode,
  onRestart,
  onExit,
}: {
  kind: 'won' | 'lost'
  levelIndex: number
  score: number
  jumps: number
  winnerFrog?: FrogId | null
  gameMode: GameMode | null
  onRestart: () => void
  onExit: () => void
}) {
  const isWin = kind === 'won'
  const winnerLabel = winnerFrog ? getFrogLabel(winnerFrog, gameMode) : null

  return (
    <div className={overlayClassName}>
      <div className={cx(
        overlayCardBaseClassName,
        isWin
          ? 'bg-[radial-gradient(circle_at_top,rgba(255,243,138,0.18),transparent_24%),linear-gradient(180deg,rgba(11,48,43,0.97),rgba(2,17,20,0.98))]'
          : 'bg-[radial-gradient(circle_at_top,rgba(255,133,133,0.16),transparent_24%),linear-gradient(180deg,rgba(32,20,37,0.97),rgba(10,14,24,0.98))]',
      )}>
        <p className={subjectClassName}>{isWin ? 'Pond Master' : 'Splash!'}</p>
        <h2 className="m-0 mt-3 text-[clamp(34px,4vw,56px)] font-bold leading-[0.96]">{isWin ? 'Bosqichlar yakunlandi' : 'Qurbaqa suvga tushib ketdi'}</h2>
        <p className="mx-auto mt-3 max-w-[52ch] text-[#ecfff5]/80">
          {isWin
            ? gameMode === 'team'
              ? winnerLabel
                ? `Ajoyib. ${winnerLabel} oxirgi bosqichda marra chizig‘iga birinchi bo‘lib yetib, g‘olib bo‘ldi.`
                : 'Ajoyib. Ikkala qurbaqa ham barcha bosqichlarni tugatib, pond sarguzashtini birga yakunladi.'
              : gameMode === 'ai'
                ? winnerLabel === 'Siz'
                  ? 'Zo‘r. Siz AI qurbaqani ortda qoldirib, barcha 3 bosqichni muvaffaqiyatli yakunladingiz.'
                  : 'AI qurbaqa oxirgi bosqichda tezroq yetib bordi. Yana urinib uni yengib ko‘ring.'
              : 'Ajoyib. Siz nilufarlar bo‘ylab barcha darajalarni bosib o‘tib, pond sarguzashtini muvaffaqiyatli tugatdingiz.'
            : 'Savol xato bo‘ldi yoki vaqt tugadi. Yangi marshrut bilan yana urinib ko‘ring.'}
        </p>
        {isWin && isCompetitiveMode(gameMode) && winnerLabel ? <p className="mx-auto mt-3 max-w-[52ch] text-lg font-extrabold text-[#fff7a6]">{winnerLabel} g‘olib bo‘ldi.</p> : null}
        {isWin && !isCompetitiveMode(gameMode) && winnerLabel ? <p className="mx-auto mt-3 max-w-[52ch] text-lg font-extrabold text-[#fff7a6]">{winnerLabel} yutdi.</p> : null}

        <div className="mt-[22px] grid grid-cols-3 gap-3 max-[900px]:grid-cols-1">
          <div className="rounded-[8px] border border-[#caf8ef]/15 bg-white/10 p-3.5">
            <span className="text-sm text-white/80">Daraja</span>
            <strong className="mt-2 block text-2xl">{Math.min(levelIndex + 1, LEVEL_COUNT)}</strong>
          </div>
          <div className="rounded-[8px] border border-[#caf8ef]/15 bg-white/10 p-3.5">
            <span className="text-sm text-white/80">Ball</span>
            <strong className="mt-2 block text-2xl">{score}</strong>
          </div>
          <div className="rounded-[8px] border border-[#caf8ef]/15 bg-white/10 p-3.5">
            <span className="text-sm text-white/80">Sakrashlar</span>
            <strong className="mt-2 block text-2xl">{jumps}</strong>
          </div>
        </div>

        <div className="mt-[22px] flex flex-wrap justify-center gap-3">
          <button type="button" className={primaryButtonClassName} onClick={onRestart}>
            {isWin ? 'Yana o‘ynash' : 'Qayta boshlash'}
          </button>
          <button type="button" className={secondaryButtonClassName} onClick={onExit}>
            Games sahifasi
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FrogPondPage({ onBack }: { onBack?: () => void }) {
  const navigate = useNavigate()
  const {
    state: { user },
  } = useContextPro()
  const pageRef = useRef<HTMLElement | null>(null)
  const autoFullscreenTriedRef = useRef(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const pondMusicRef = useRef<HTMLAudioElement | null>(null)
  const sinkTimeoutRef = useRef<number | null>(null)
  const feedbackTimeoutRef = useRef<number | null>(null)
  const aiMoveTimeoutRef = useRef<number | null>(null)
  const aiAnswerTimeoutRef = useRef<number | null>(null)
  const preventImmediateAiMistakeRef = useRef(false)
  const [gameMode, setGameMode] = useState<GameMode | null>(null)
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>('hard')
  const [teacherQuestions, setTeacherQuestions] = useState<FrogPondTeacherQuestion[]>([])
  const [stageIndex, setStageIndex] = useState(0)
  const [levels, setLevels] = useState<FrogQuizQuestion[][]>(() => buildLevels(0))
  const [currentFrog, setCurrentFrog] = useState<FrogId>('frogA')
  const [winnerFrog, setWinnerFrog] = useState<FrogId | null>(null)
  const [status, setStatus] = useState<GameStatus>('idle')
  const [activeQuestion, setActiveQuestion] = useState<ActiveQuestion | null>(null)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS)
  const [score, setScore] = useState(0)
  const [stageWins, setStageWins] = useState<StageWinState>({ frogA: 0, frogB: 0 })
  const [stageHadMistake, setStageHadMistake] = useState(false)
  const [stageFinishOrder, setStageFinishOrder] = useState<StageFinishOrderState>({ frogA: null, frogB: null })
  const [usedQuestionKeys, setUsedQuestionKeys] = useState<string[]>([])
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformanceState>({})
  const [frogStates, setFrogStates] = useState<Record<FrogId, FrogState>>({
    frogA: createInitialFrogState(),
    frogB: createInitialFrogState(),
  })
  const [attemptedJump, setAttemptedJump] = useState<CompletedJump | null>(null)
  const [motionFrogId, setMotionFrogId] = useState<FrogId | null>(null)
  const [isMobileBoard, setIsMobileBoard] = useState(false)
  const [aiTurnRequest, setAiTurnRequest] = useState(0)
  const isAiThinking =
    gameMode === 'ai' &&
    currentFrog === 'frogB' &&
    (status === 'idle' || (status === 'question' && activeQuestion?.frogId === 'frogB'))
  const soloFinalScore = score + (status === 'won' ? 300 : 0)

  useGameResultSubmission(
    gameMode === 'solo' && (status === 'won' || status === 'lost'),
    FROG_POND_GAME_KEY,
    [
      {
        participant_name: user?.username || user?.email || 'Oquvchi',
        participant_mode: '1 o‘yinchi',
        score: soloFinalScore,
        metadata: {
          stages_completed: stageIndex + (status === 'won' ? 1 : 0),
          jumps: frogStates.frogA.completedJumps.length,
          result: status,
          is_single_player: true,
          participant_count: 1,
        },
      },
    ],
  )

  const stopPondMusic = useCallback(() => {
    if (!pondMusicRef.current) return
    pondMusicRef.current.pause()
    pondMusicRef.current.currentTime = 0
  }, [])

  const playPondMusic = useCallback(() => {
    if (!pondMusicRef.current && typeof Audio !== 'undefined') {
      pondMusicRef.current = new Audio(frogPondMusic)
      pondMusicRef.current.loop = true
      pondMusicRef.current.volume = 0.38
    }

    if (!pondMusicRef.current) return
    pondMusicRef.current.currentTime = 0
    void pondMusicRef.current.play().catch(() => undefined)
  }, [])

  useEffect(() => {
    if (typeof Audio === 'undefined') return

    const audio = new Audio(frogPondMusic)
    audio.loop = true
    audio.volume = 0.38
    pondMusicRef.current = audio

    return () => {
      audio.pause()
      audio.currentTime = 0
      pondMusicRef.current = null
    }
  }, [])

  useEffect(() => {
    if (status === 'won' || status === 'lost') {
      stopPondMusic()
    }
  }, [status, stopPondMusic])

  useEffect(() => {
    setLevels(buildLevels(stageIndex, teacherQuestions))
  }, [stageIndex, teacherQuestions])

  useEffect(() => {
    let alive = true
    const teacherScoped = Boolean(
      user?.id && user.roles?.some((role: string) => role === 'teacher' || role === 'admin'),
    )

    void (teacherScoped && user?.id
      ? fetchGameQuestionsByTeacher<FrogPondTeacherQuestion>('frog-pond', user.id)
      : fetchGameQuestions<FrogPondTeacherQuestion>('frog-pond')
    ).then((items) => {
      if (!alive || !items?.length) return
      setTeacherQuestions(items)
    })

    return () => {
      alive = false
    }
  }, [user?.id, user?.roles])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia('(max-width: 430px) and (pointer: coarse)')
    const sync = () => setIsMobileBoard(media.matches)
    sync()

    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    const requestPageFullscreen = () => {
      autoFullscreenTriedRef.current = true
      void pageRef.current?.requestFullscreen?.().catch(() => {
        autoFullscreenTriedRef.current = false
      })
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.key.toLowerCase() !== 'f') return

      const target = event.target as HTMLElement | null
      const tagName = target?.tagName?.toLowerCase()
      if (tagName === 'input' || tagName === 'textarea' || target?.isContentEditable) {
        return
      }

      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => {})
        return
      }

      requestPageFullscreen()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined' && document.fullscreenElement === pageRef.current) {
        void document.exitFullscreen().catch(() => {})
      }

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        void audioContextRef.current.close().catch(() => {})
        audioContextRef.current = null
      }
    }
  }, [])

  const activeFrogs: FrogId[] = isCompetitiveMode(gameMode) ? ['frogA', 'frogB'] : ['frogA']
  const rowLayouts = isMobileBoard
    ? buildRowLayouts(mobileColumnPositions, mobileLanePositions)
    : buildRowLayouts(columnPositions, lanePositions)
  const currentLevelIndex = frogStates[currentFrog].completedJumps.length
  const isFrogStageComplete = (frogId: FrogId) => frogStates[frogId].completedJumps.length >= LEVEL_COUNT
  const currentLilyPadSprite = lilyPadSprite
  const currentFrogSprite = frogSprite
  const effectiveAiDifficulty: AiDifficulty = 'hard'
  const aiRecommendation = getAiRecommendation(subjectPerformance)

  const getFrogPosition = (frogId: FrogId): Position => {
    const committed = frogStates[frogId].completedJumps
    const activeJump = motionFrogId === frogId && attemptedJump ? attemptedJump : null
    const lastJump = activeJump ?? committed[committed.length - 1]
    const otherFrogId: FrogId = frogId === 'frogA' ? 'frogB' : 'frogA'
    const otherCommitted = frogStates[otherFrogId].completedJumps
    const otherActiveJump = motionFrogId === otherFrogId && attemptedJump ? attemptedJump : null
    const otherLastJump = otherActiveJump ?? otherCommitted[otherCommitted.length - 1]

    if (!lastJump) {
      if (!isCompetitiveMode(gameMode)) {
        return frogStartPosition
      }
      return frogId === 'frogA'
        ? { left: frogStartPosition.left, top: frogStartPosition.top + TEAM_START_VERTICAL_OFFSET }
        : { left: frogStartPosition.left, top: frogStartPosition.top - TEAM_START_VERTICAL_OFFSET }
    }

    const pad = rowLayouts[lastJump.levelIndex][lastJump.padIndex]
    const sharesPad =
      isCompetitiveMode(gameMode) &&
      otherLastJump &&
      otherLastJump.levelIndex === lastJump.levelIndex &&
      otherLastJump.padIndex === lastJump.padIndex

    if (activeJump) {
      const jumpingPad = rowLayouts[activeJump.levelIndex][activeJump.padIndex]
      return alignToPad({ left: jumpingPad.left, top: jumpingPad.top })
    }

    if (!sharesPad) {
      return alignToPad({ left: pad.left, top: pad.top })
    }

    return frogId === 'frogA'
      ? alignToPad({ left: pad.left, top: pad.top + SHARED_PAD_VERTICAL_OFFSET })
      : alignToPad({ left: pad.left, top: pad.top - SHARED_PAD_VERTICAL_OFFSET })
  }

  const getAudioContext = () => {
    if (typeof window === 'undefined') return null
    const AudioCtx = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return null
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx()
    }
    if (audioContextRef.current.state === 'suspended') {
      void audioContextRef.current.resume()
    }
    return audioContextRef.current
  }

  const playJumpSound = () => {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.12)
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.24)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(900, now)

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.3)
  }

  const playSinkSound = () => {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.45)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(700, now)
    filter.frequency.exponentialRampToValueAtTime(240, now + 0.45)

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.52)
  }

  const clearSinkTimeout = () => {
    if (sinkTimeoutRef.current !== null) {
      window.clearTimeout(sinkTimeoutRef.current)
      sinkTimeoutRef.current = null
    }
  }

  const clearFeedbackTimeout = () => {
    if (feedbackTimeoutRef.current !== null) {
      window.clearTimeout(feedbackTimeoutRef.current)
      feedbackTimeoutRef.current = null
    }
  }

  const clearAiMoveTimeout = () => {
    if (aiMoveTimeoutRef.current !== null) {
      window.clearTimeout(aiMoveTimeoutRef.current)
      aiMoveTimeoutRef.current = null
    }
  }

  const clearAiAnswerTimeout = () => {
    if (aiAnswerTimeoutRef.current !== null) {
      window.clearTimeout(aiAnswerTimeoutRef.current)
      aiAnswerTimeoutRef.current = null
    }
  }

  const clearAiTimeouts = () => {
    clearAiMoveTimeout()
    clearAiAnswerTimeout()
  }

  const requestPageFullscreen = () => {
    if (typeof document === 'undefined') return
    if (document.fullscreenElement || autoFullscreenTriedRef.current) return
    autoFullscreenTriedRef.current = true
    void pageRef.current?.requestFullscreen?.().catch(() => {
      autoFullscreenTriedRef.current = false
    })
  }

  const exitPageFullscreen = () => {
    if (typeof document === 'undefined') return
    if (document.fullscreenElement === pageRef.current) {
      void document.exitFullscreen().catch(() => {})
    }
    autoFullscreenTriedRef.current = false
  }

  const requestAiTurn = () => {
    if (gameMode !== 'ai') return
    setAiTurnRequest((value) => value + 1)
  }

  const scheduleTurnAdvance = (callback: () => void, delay = 1050) => {
    clearFeedbackTimeout()
    feedbackTimeoutRef.current = window.setTimeout(() => {
      feedbackTimeoutRef.current = null
      callback()
    }, delay)
  }

  const startSinkSequence = (frogId: FrogId, reason: 'wrong' | 'timeout') => {
    clearSinkTimeout()
    clearFeedbackTimeout()
    clearAiTimeouts()
    setStatus('sinking')
    setMotionFrogId(frogId)
    setTimeLeft(0)
    setFeedback({
      frogId,
      tone: reason,
      title: reason === 'timeout' ? 'Vaqt tugadi' : 'Javob xato',
      description:
        reason === 'timeout'
          ? `${getFrogLabel(frogId, gameMode)} ulgurmay qoldi. Endi u boshidan boshlaydi.`
          : `${getFrogLabel(frogId, gameMode)} bu savolda adashdi. U 0-darajaga qaytadi.`,
    })
    setActiveQuestion(null)
    playSinkSound()

    sinkTimeoutRef.current = window.setTimeout(() => {
      setTimeLeft(QUESTION_SECONDS)
      setAttemptedJump(null)
      setMotionFrogId(null)
      sinkTimeoutRef.current = null
      if (gameMode === 'solo') {
        setStatus('lost')
        return
      }

      setFrogStates((prev) => ({
        ...prev,
        [frogId]: {
          ...prev[frogId],
          completedJumps: [],
        },
      }))
      if (gameMode === 'ai') {
        setStageHadMistake(true)
        if (frogId === 'frogA') {
          preventImmediateAiMistakeRef.current = true
        }
      }
      setFeedback({
        frogId,
        tone: reason,
        title: reason === 'timeout' ? 'Boshidan qaytdi' : 'Qayta urinadi',
        description: `Navbat endi ${getFrogLabel(frogId === 'frogA' ? 'frogB' : 'frogA', gameMode)} ga o‘tdi.`,
      })
      setStatus('feedback')
      setCurrentFrog(frogId === 'frogA' ? 'frogB' : 'frogA')

      scheduleTurnAdvance(() => {
        setFeedback(null)
        setStatus('idle')
        if (gameMode === 'ai' && frogId === 'frogA') {
          requestAiTurn()
        }
      }, 850)
    }, 1200)
  }

  const advanceToNextStage = () => {
    clearAiTimeouts()
    const nextStageIndex = stageIndex + 1

    if (nextStageIndex >= STAGE_COUNT) {
      setWinnerFrog(gameMode === 'solo' ? 'frogA' : null)
      setStatus('won')
      return
    }

    setStageIndex(nextStageIndex)
    setLevels(buildLevels(nextStageIndex, teacherQuestions))
    setCurrentFrog('frogA')
    setMotionFrogId(null)
    setAttemptedJump(null)
    setActiveQuestion(null)
    setTimeLeft(QUESTION_SECONDS)
    setStageHadMistake(false)
    setStageFinishOrder({ frogA: null, frogB: null })
    setUsedQuestionKeys([])
    setFrogStates({
      frogA: createInitialFrogState(),
      frogB: createInitialFrogState(),
    })
    setFeedback({
      frogId: 'frogA',
      tone: 'correct',
      title: `${nextStageIndex + 1}-bosqich boshlandi`,
      description:
        isCompetitiveMode(gameMode)
          ? 'Ikkala qurbaqa ham marra chizig‘iga yetdi. Endi yangi bosqichda davom etamiz.'
          : 'Yangi bosqichda savollar qiyinlashdi. Yo‘l davom etadi.',
    })
    setStatus('feedback')

    scheduleTurnAdvance(() => {
      setFeedback(null)
      setStatus('idle')
      if (gameMode === 'ai') {
        clearAiTimeouts()
        setAiTurnRequest(0)
      }
    }, 1200)
  }

  const finishCorrectAnswer = (frogId: FrogId, nextLevel: number) => {
    clearFeedbackTimeout()
    clearAiTimeouts()
    setMotionFrogId(null)
    const otherFrogId: FrogId = frogId === 'frogA' ? 'frogB' : 'frogA'

    const finalizeCompetitiveStage = (stageWinner: FrogId | null, description: string) => {
      const projectedWins: StageWinState = {
        frogA: stageWins.frogA + (stageWinner === 'frogA' ? 1 : 0),
        frogB: stageWins.frogB + (stageWinner === 'frogB' ? 1 : 0),
      }

      setStageWins(projectedWins)
      setFeedback({
        frogId: stageWinner ?? frogId,
        tone: 'correct',
        title: stageIndex + 1 >= STAGE_COUNT ? 'Sarguzasht yakunlandi' : `${stageIndex + 1}-bosqich yakunlandi`,
        description,
      })
      setStatus('feedback')

      scheduleTurnAdvance(() => {
        setFeedback(null)
        if (stageIndex + 1 >= STAGE_COUNT) {
          const overallWinner =
            projectedWins.frogA === projectedWins.frogB
              ? stageWinner
              : projectedWins.frogA > projectedWins.frogB
                ? 'frogA'
                : 'frogB'
          setWinnerFrog(overallWinner)
          setStatus('won')
          return
        }
        advanceToNextStage()
      }, 1200)
    }

    if (nextLevel >= LEVEL_COUNT) {
      if (isCompetitiveMode(gameMode)) {
        const otherFinished = isFrogStageComplete(otherFrogId)
        const finishRank = (stageFinishOrder.frogA !== null ? 1 : 0) + (stageFinishOrder.frogB !== null ? 1 : 0) + 1
        const nextFinishOrder: StageFinishOrderState =
          stageFinishOrder[frogId] === null
            ? { ...stageFinishOrder, [frogId]: finishRank }
            : stageFinishOrder
        const firstFinisher =
          nextFinishOrder.frogA === 1 ? 'frogA' : nextFinishOrder.frogB === 1 ? 'frogB' : frogId
        const isWaitingStage = stageIndex < STAGE_COUNT - 1 && stageHadMistake

        setStageFinishOrder(nextFinishOrder)

        if (isWaitingStage && !otherFinished) {
          const otherProgress = frogStates[otherFrogId].completedJumps.length
          const padsBehind = Math.max(0, LEVEL_COUNT - otherProgress)

          if (padsBehind <= 1) {
            setFeedback({
              frogId,
              tone: 'correct',
              title: 'Marra chizig‘iga yetdi',
              description: `${getFrogLabel(frogId, gameMode)} marraga yetdi. ${getFrogLabel(otherFrogId, gameMode)} atigi 1 barg ortda, shuning uchun kutamiz.`,
            })
            setStatus('feedback')

            scheduleTurnAdvance(() => {
              setFeedback(null)
              setCurrentFrog(otherFrogId)
              setStatus('idle')
              if (gameMode === 'ai' && otherFrogId === 'frogB') {
                requestAiTurn()
              }
            })
            return
          }

          if (padsBehind <= 2) {
            finalizeCompetitiveStage(
              firstFinisher,
              `${getFrogLabel(firstFinisher, gameMode)} birinchi bo‘lib finishga yetdi. ${getFrogLabel(otherFrogId, gameMode)} 2 ta barg ortda qolgan bo‘lsa ham keyingi bosqichga o‘tiladi.`,
            )
            return
          }

          if (padsBehind > 2) {
            finalizeCompetitiveStage(
              firstFinisher,
              `${getFrogLabel(firstFinisher, gameMode)} finishga ancha oldin yetib bordi. ${getFrogLabel(otherFrogId, gameMode)} 2 tadan ko‘p barg ortda qolgani uchun o‘yin shu yerda tugadi.`,
            )
            return
          }
        }

        if (gameMode === 'ai' && stageHadMistake && stageIndex + 1 >= STAGE_COUNT) {
          finalizeCompetitiveStage(
            firstFinisher,
            `${getFrogLabel(firstFinisher, gameMode)} xato bo‘lgan bosqichda ham birinchi bo‘lib marraga yetdi va g‘alabani oldi.`,
          )
          return
        }

        setFeedback({
          frogId,
          tone: 'correct',
          title: otherFinished ? 'Bosqich yakunlandi' : 'Marra chizig‘iga yetdi',
          description: otherFinished
            ? stageHadMistake
              ? `${getFrogLabel(firstFinisher, gameMode)} birinchi bo‘lib kelgani uchun bosqichni yutdi. Endi keyingi bosqichga o‘tamiz.`
              : 'Ikkala qurbaqa ham xatosiz marraga yetdi. Keyingi bosqichga o‘tamiz.'
            : stageHadMistake
              ? `${getFrogLabel(frogId, gameMode)} finishga yetdi. Endi ${getFrogLabel(otherFrogId, gameMode)} holatiga qarab bosqich taqdiri hal bo‘ladi.`
              : `${getFrogLabel(frogId, gameMode)} xatosiz marraga yetdi. Endi ${getFrogLabel(otherFrogId, gameMode)} ham yetib kelishi kerak.`,
        })
        setStatus('feedback')

        scheduleTurnAdvance(() => {
          setFeedback(null)

          if (otherFinished) {
            if (stageIndex + 1 >= STAGE_COUNT) {
              finalizeCompetitiveStage(
                stageHadMistake ? firstFinisher : null,
                stageHadMistake
                  ? `${getFrogLabel(firstFinisher, gameMode)} finishga birinchi yetib kelgani uchun yakuniy bosqichni yutdi.`
                  : 'Ikkala qurbaqa ham barcha bosqichlarni xatosiz yakunladi. Yakuniy hisob bo‘yicha g‘olib aniqlandi.',
              )
              return
            }
            advanceToNextStage()
            return
          }

          setCurrentFrog(otherFrogId)
          setStatus('idle')
          if (gameMode === 'ai' && otherFrogId === 'frogB') {
            requestAiTurn()
          }
        })
        return
      }

      setFeedback({
        frogId,
        tone: 'correct',
        title: 'Bosqich yakunlandi',
        description: stageIndex + 1 >= STAGE_COUNT ? 'So‘nggi bosqich ham tugadi.' : 'Keyingi bosqichga o‘tamiz.',
      })
      setStatus('feedback')

      scheduleTurnAdvance(() => {
        setFeedback(null)
        if (stageIndex + 1 >= STAGE_COUNT) {
          setWinnerFrog(frogId)
          setStatus('won')
          return
        }
        advanceToNextStage()
      })
      return
    }

    setFeedback({
      frogId,
      tone: 'correct',
      title: 'To‘g‘ri javob',
      description: `${getFrogLabel(frogId, gameMode)} keyingi qatordagi barglarga o‘tdi.`,
    })
    setStatus('feedback')

    scheduleTurnAdvance(() => {
      setFeedback(null)
      const nextFrog = isCompetitiveMode(gameMode) ? otherFrogId : 'frogA'
      setCurrentFrog(nextFrog)
      setStatus('idle')
      if (gameMode === 'ai' && nextFrog === 'frogB') {
        requestAiTurn()
      }
    })
  }

  useEffect(() => {
    if (status !== 'question' || !activeQuestion) return
    if (timeLeft <= 0) {
      startSinkSequence(activeQuestion.frogId, 'timeout')
      return
    }

    const timerId = window.setTimeout(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => window.clearTimeout(timerId)
  }, [status, activeQuestion, timeLeft])

  useEffect(() => {
    if (status !== 'jumping' || !activeQuestion) return

    const doneId = window.setTimeout(() => {
      setTimeLeft(QUESTION_SECONDS)
      setStatus('question')
    }, 950)

    return () => window.clearTimeout(doneId)
  }, [status, activeQuestion])

  useEffect(() => {
    clearAiMoveTimeout()

    if (gameMode !== 'ai' || status !== 'idle' || currentFrog !== 'frogB' || isFrogStageComplete('frogB') || aiTurnRequest === 0) {
      return
    }

    aiMoveTimeoutRef.current = window.setTimeout(() => {
      aiMoveTimeoutRef.current = null
      const aiLevelIndex = frogStates.frogB.completedJumps.length
      const playerJumpOnSameLevel = frogStates.frogA.completedJumps.find((jump) => jump.levelIndex === aiLevelIndex)
      const randomPadIndex = pickAiPadIndex(
        Array.from({ length: lanePositions.length }, (_, index) => index),
        playerJumpOnSameLevel?.padIndex ?? null,
      )
      openQuestion(randomPadIndex, 'frogB')
    }, 90 + Math.floor(Math.random() * 110))

    return () => clearAiMoveTimeout()
  }, [gameMode, status, currentFrog, frogStates, aiTurnRequest])

  useEffect(() => {
    clearAiAnswerTimeout()

    if (gameMode !== 'ai' || status !== 'question' || !activeQuestion || activeQuestion.frogId !== 'frogB') {
      return
    }

    aiAnswerTimeoutRef.current = window.setTimeout(() => {
      aiAnswerTimeoutRef.current = null
      const forceCorrect = aiDifficulty === 'hard' && preventImmediateAiMistakeRef.current
      preventImmediateAiMistakeRef.current = false
      handleAnswer(chooseAiAnswer(activeQuestion.question, stageIndex, activeQuestion.levelIndex, effectiveAiDifficulty, forceCorrect))
    }, 2000)

    return () => clearAiAnswerTimeout()
  }, [gameMode, status, activeQuestion, stageIndex, effectiveAiDifficulty])

  useEffect(() => {
    return () => clearSinkTimeout()
  }, [])

  useEffect(() => {
    return () => clearFeedbackTimeout()
  }, [])

  useEffect(() => {
    return () => clearAiTimeouts()
  }, [])

  useEffect(() => {
    if (!isCompetitiveMode(gameMode) || status !== 'idle') return

    const currentDone = isFrogStageComplete(currentFrog)
    const otherFrogId: FrogId = currentFrog === 'frogA' ? 'frogB' : 'frogA'
    const otherDone = isFrogStageComplete(otherFrogId)

    if (currentDone && !otherDone) {
      setCurrentFrog(otherFrogId)
      if (gameMode === 'ai' && otherFrogId === 'frogB') {
        requestAiTurn()
      }
    }
  }, [gameMode, status, currentFrog, frogStates])

  const openQuestion = (padIndex: number, frogId = currentFrog) => {
    if (status !== 'idle') return
    if (isCompetitiveMode(gameMode) && isFrogStageComplete(frogId)) {
      const otherFrogId: FrogId = frogId === 'frogA' ? 'frogB' : 'frogA'
      if (!isFrogStageComplete(otherFrogId)) {
        setCurrentFrog(otherFrogId)
      }
      return
    }
    const frogLevelIndex = frogStates[frogId].completedJumps.length
    const level = levels[frogLevelIndex]
    if (!level) return
    const seenQuestionKeys = frogStates[frogId].seenQuestionKeysByLevel[frogLevelIndex] ?? []
    const questionIndex = getQuestionIndexForAttempt(level, padIndex, seenQuestionKeys, usedQuestionKeys)
    const question = level[questionIndex]
    if (!question) return
    const questionKey = buildQuestionKey(question)

    playJumpSound()
    setFeedback(null)
    setMotionFrogId(frogId)
    setFrogStates((prev) => ({
      ...prev,
      [frogId]: {
        ...prev[frogId],
        seenQuestionKeysByLevel: prev[frogId].seenQuestionKeysByLevel.map((seen, index) =>
          index === frogLevelIndex && !seen.includes(questionKey) ? [...seen, questionKey] : seen,
        ),
      },
    }))
    setUsedQuestionKeys((prev) => (prev.includes(questionKey) ? prev : [...prev, questionKey]))
    setCurrentFrog(frogId)
    if (frogId === 'frogB') {
      setAiTurnRequest(0)
    }
    setActiveQuestion({ frogId, levelIndex: frogLevelIndex, padIndex, questionIndex, question })
    setAttemptedJump({ levelIndex: frogLevelIndex, padIndex })
    setStatus('jumping')
  }

  const handleAnswer = (option: string) => {
    if (!activeQuestion || status !== 'question' || !attemptedJump) return
    const isCorrect = option === activeQuestion.question.answer

    if (gameMode === 'ai' && activeQuestion.frogId === 'frogA') {
      setSubjectPerformance((prev) => {
        const current = prev[activeQuestion.question.subject] ?? { correct: 0, wrong: 0, total: 0 }
        return {
          ...prev,
          [activeQuestion.question.subject]: {
            correct: current.correct + (isCorrect ? 1 : 0),
            wrong: current.wrong + (isCorrect ? 0 : 1),
            total: current.total + 1,
          },
        }
      })
    }

    if (isCorrect) {
      setScore((prev) => prev + 100)
      const nextLevel = activeQuestion.levelIndex + 1
      setFrogStates((prev) => ({
        ...prev,
        [activeQuestion.frogId]: {
          ...prev[activeQuestion.frogId],
          completedJumps: [...prev[activeQuestion.frogId].completedJumps, attemptedJump],
        },
      }))
      setAttemptedJump(null)

      setActiveQuestion(null)
      setTimeLeft(QUESTION_SECONDS)
      finishCorrectAnswer(activeQuestion.frogId, nextLevel)
      return
    }

    startSinkSequence(activeQuestion.frogId, 'wrong')
  }

  const restart = () => {
    clearSinkTimeout()
    clearFeedbackTimeout()
    clearAiTimeouts()
    playPondMusic()
    setStageIndex(0)
    setLevels(buildLevels(0, teacherQuestions))
    setCurrentFrog('frogA')
    setWinnerFrog(null)
    setStatus('idle')
    setActiveQuestion(null)
    setFeedback(null)
    setAttemptedJump(null)
    setMotionFrogId(null)
    setTimeLeft(QUESTION_SECONDS)
    setScore(0)
    setStageWins({ frogA: 0, frogB: 0 })
    setStageHadMistake(false)
    setStageFinishOrder({ frogA: null, frogB: null })
    setUsedQuestionKeys([])
    setSubjectPerformance({})
    setAiTurnRequest(0)
    preventImmediateAiMistakeRef.current = false
    setFrogStates({
      frogA: createInitialFrogState(),
      frogB: createInitialFrogState(),
    })
  }

  const startGame = (mode: GameMode) => {
    clearSinkTimeout()
    clearFeedbackTimeout()
    clearAiTimeouts()
    requestPageFullscreen()
    playPondMusic()
    setGameMode(mode)
    setStageIndex(0)
    setLevels(buildLevels(0, teacherQuestions))
    setCurrentFrog('frogA')
    setWinnerFrog(null)
    setStatus('idle')
    setActiveQuestion(null)
    setFeedback(null)
    setAttemptedJump(null)
    setMotionFrogId(null)
    setTimeLeft(QUESTION_SECONDS)
    setScore(0)
    setStageWins({ frogA: 0, frogB: 0 })
    setStageHadMistake(false)
    setStageFinishOrder({ frogA: null, frogB: null })
    setUsedQuestionKeys([])
    setSubjectPerformance({})
    setAiTurnRequest(0)
    preventImmediateAiMistakeRef.current = false
    setFrogStates({
      frogA: createInitialFrogState(),
      frogB: createInitialFrogState(),
    })
  }

  const leaveGame = () => {
    stopPondMusic()
    clearSinkTimeout()
    clearFeedbackTimeout()
    clearAiTimeouts()
    exitPageFullscreen()
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      void audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }

    if (onBack) {
      onBack()
      return
    }

    navigate('/games')
  }

  return (
    <main
      ref={pageRef}
      className={pageClassName}
      style={{
        backgroundImage: `linear-gradient(rgba(45,128,174,0.38),rgba(45,128,174,0.38)), url(${pondBackground})`,
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_46%)] opacity-20" />

      <div className={shellClassName}>
        <aside className={sidePanelClassName}>
          {activeQuestion && status === 'question' ? (
            <QuizModal data={activeQuestion} timeLeft={timeLeft} gameMode={gameMode} onAnswer={handleAnswer} />
          ) : feedback ? (
            <FeedbackCard data={feedback} gameMode={gameMode} />
          ) : isAiThinking ? (
            <div className={modalBackdropClassName}>
              <div className={cx(modalClassName, 'min-h-0 max-w-[340px] border-[#9cffbe]/25 px-[18px] py-4')}>
                <span className={subjectClassName}>AI qurbaqa</span>
                <h2 className="mt-2 min-h-0 text-[clamp(18px,1.8vw,24px)] font-bold leading-[1.12]">AI o‘ylayapti...</h2>
                <p className="mt-2.5 text-[13px] text-[#e4fff4]/75">AI navbati boshlandi. U nilufarni tanlab, savolga javob tayyorlayapti.</p>
              </div>
            </div>
          ) : null}
        </aside>

        <section className={playfieldClassName}>
          <div className={boardScrollClassName}>
            <div className={boardClassName}>
              <div className={boardHudClassName}>
                <button
                  type="button"
                  className="pointer-events-auto inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-full border border-white/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.26),rgba(255,255,255,0.12)),rgba(40,117,176,0.46)] px-3.5 text-xs font-bold tracking-[0.04em] text-white shadow-[0_14px_28px_rgba(34,78,109,0.24),inset_0_1px_0_rgba(255,255,255,0.28)] backdrop-blur-xl transition hover:-translate-y-px hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.34),rgba(255,255,255,0.16)),rgba(47,132,197,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/85"
                  onClick={leaveGame}
                >
                  ← Orqaga
                </button>
                <div className={boardPillClassName}>
                  <span className={pillLabelClassName}>Bosqich</span>
                  <strong className={pillValueClassName}>{stageIndex + 1} / {STAGE_COUNT}</strong>
                </div>
                <StageScoreboard stageWins={stageWins} gameMode={gameMode} />
                <div className={boardPillClassName}>
                  <span className={pillLabelClassName}>Daraja</span>
                  <strong className={pillValueClassName}>{Math.min(currentLevelIndex + 1, LEVEL_COUNT)} / {LEVEL_COUNT}</strong>
                </div>
                <div className={boardPillClassName}>
                  <span className={pillLabelClassName}>Ball</span>
                  <strong className={pillValueClassName}>{score}</strong>
                </div>
                <div className={boardPillClassName}>
                  <span className={pillLabelClassName}>Navbat</span>
                  <strong className={pillValueClassName}>{gameMode ? getFrogLabel(currentFrog, gameMode) : 'Solo'}</strong>
                </div>
                {gameMode === 'ai' ? (
                  <div className={boardPillClassName}>
                    <span className={pillLabelClassName}>AI daraja</span>
                    <strong className={pillValueClassName}>Kuchli</strong>
                    <small className={pillSmallClassName}>{aiRecommendation}</small>
                  </div>
                ) : null}
                {gameMode === 'ai' ? (
                  <div className={cx(boardPillClassName, 'animate-pulse border-[#c9ffdc]/30 bg-[#6fe6aa]/25')}>
                    <span className={pillLabelClassName}>Holat</span>
                    <strong className={pillValueClassName}>{isAiThinking ? 'AI o‘ylayapti...' : 'AI kutyapti'}</strong>
                  </div>
                ) : null}
              </div>

              <div className="absolute inset-x-0 bottom-0 top-[var(--frog-pond-hud-safe-top)] z-[2]">
                {rowLayouts.map((row, rowIndex) => (
                  <div key={`row-${rowIndex}`}>
                    <span className="absolute left-[18px] z-[3] hidden text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#effaff]/70 max-[430px]:block" style={{ top: `${Math.max(4, row[0].top - 6)}%` }}>
                      Level {rowIndex + 1}
                    </span>
                    {row.map((pad, padIndex) => {
                      const isCompleted = Object.values(frogStates).some((frog) =>
                        frog.completedJumps.some((jump) => jump.levelIndex === rowIndex && jump.padIndex === padIndex),
                      )
                      const isCurrent =
                        status !== 'won' &&
                        status !== 'lost' &&
                        rowIndex === currentLevelIndex &&
                        !isFrogStageComplete(currentFrog)
                      const isLocked = rowIndex > currentLevelIndex
                      const padClass = cx(
                        'absolute grid h-[clamp(74px,5.9vw,98px)] w-[clamp(74px,5.9vw,98px)] -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center overflow-hidden rounded-full border-0 bg-[#30722c]/80 shadow-[0_14px_28px_rgba(22,56,24,0.34)] transition hover:scale-105 disabled:cursor-default max-[430px]:h-28 max-[430px]:w-28',
                        isCompleted && 'brightness-95 saturate-125',
                        isLocked && 'scale-90 opacity-45',
                      )

                      return (
                        <button
                          key={`pad-${rowIndex}-${padIndex}`}
                          type="button"
                          className={padClass}
                          style={{
                            left: `${pad.left}%`,
                            top: `${pad.top}%`,
                            animationDelay: `${(rowIndex * 5 + padIndex) * 0.12}s`,
                          }}
                          disabled={!isCurrent || status !== 'idle' || (gameMode === 'ai' && currentFrog === 'frogB')}
                          onClick={() => openQuestion(padIndex)}
                        >
                          <img
                            className={cx(
                              'pointer-events-none absolute left-1/2 top-1/2 h-[112%] w-[112%] -translate-x-1/2 -translate-y-1/2 select-none rounded-full object-cover brightness-[0.82] contrast-[1.18] saturate-[1.18] hue-rotate-[-10deg]',
                              stageIndex === 2 && 'h-[108%] w-[108%] brightness-100 contrast-100 saturate-100 mix-blend-multiply',
                            )}
                            src={currentLilyPadSprite}
                            alt=""
                            draggable={false}
                          />
                          <span className="absolute left-1/2 top-1/2 h-[92%] w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#baf5ff]/10" />
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>

              {activeFrogs.map((frogId) => {
                const frogPosition = getFrogPosition(frogId)
                const frogClass = motionFrogId === frogId
                  ? status === 'jumping'
                    ? '-translate-x-1/2 -translate-y-[58%] scale-105'
                    : status === 'sinking'
                      ? '-translate-x-1/2 -translate-y-[2%] scale-[0.82] rotate-[8deg] opacity-20 blur-[3px] saturate-75 duration-[1200ms]'
                      : ''
                  : ''

                return (
                  <FrogCharacter
                    key={frogId}
                    frogId={frogId}
                    className={frogClass}
                    sprite={currentFrogSprite}
                    imageClassName={cx(
                      frogId === 'frogB' && 'hue-rotate-[300deg] saturate-150 brightness-105',
                      stageIndex === 1 && frogId === 'frogA' && 'hue-rotate-[165deg] saturate-[1.45] brightness-105',
                      stageIndex === 1 && frogId === 'frogB' && 'hue-rotate-[18deg] saturate-[1.75] brightness-110',
                      stageIndex === 2 && frogId === 'frogA' && 'h-[94%] w-[94%] object-cover sepia hue-rotate-[170deg] saturate-[7.5] brightness-[0.7] contrast-[1.08]',
                      stageIndex === 2 && frogId === 'frogB' && 'h-[94%] w-[94%] object-cover hue-rotate-[318deg] saturate-[1.68] brightness-[0.66] contrast-[1.06]',
                    )}
                    style={{
                      left: `${frogPosition.left}%`,
                      top: toPlayfieldTop(frogPosition.top),
                    }}
                  />
                )
              })}
            </div>
          </div>
        </section>
      </div>

      {status === 'won' ? (
        <EndOverlay
          kind="won"
          levelIndex={winnerFrog ? frogStates[winnerFrog].completedJumps.length - 1 : LEVEL_COUNT - 1}
          score={score}
          jumps={winnerFrog ? frogStates[winnerFrog].completedJumps.length : activeFrogs.length * LEVEL_COUNT}
          winnerFrog={winnerFrog}
          gameMode={gameMode}
          onRestart={restart}
          onExit={leaveGame}
        />
      ) : null}

      {status === 'lost' ? (
        <EndOverlay
          kind="lost"
          levelIndex={currentLevelIndex}
          score={score}
          jumps={frogStates[currentFrog].completedJumps.length}
          gameMode={gameMode}
          onRestart={restart}
          onExit={leaveGame}
        />
      ) : null}

      {!gameMode ? <ModeOverlay aiDifficulty={aiDifficulty} onAiDifficultyChange={setAiDifficulty} onSelect={startGame} /> : null}

    </main>
  )
}
