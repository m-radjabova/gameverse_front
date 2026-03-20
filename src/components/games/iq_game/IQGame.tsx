import { useEffect, useMemo, useRef, useState } from "react";
import { FaBrain, FaCheck, FaCrown, FaHome, FaRedo, FaTimes, FaUser, FaUsers } from "react-icons/fa";
import Confetti from "react-confetti-boom";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { getGameSessionConfig } from "../../../hooks/gameSession";
import { useFinishApplause } from "../../../hooks/useFinishApplause";
import { useGameStartCountdown } from "../../../hooks/useGameStartCountdown";
import useContextPro from "../../../hooks/useContextPro";
import { IQ_QUESTIONS, type IQQuestion as Question, type QuestionType, type Difficulty } from "./questions";

type Phase = "intro" | "game" | "result";
type PlayerMode = 1 | 2;
const SESSION_PLAN = { easy: 5, medium: 10, hard: 15 } as const;
const typeAccent = { bolalar_iq: "from-sky-500 to-violet-500" } satisfies Record<QuestionType, string>;
const diffAccent = { easy: "from-emerald-500 to-green-500", medium: "from-amber-500 to-orange-500", hard: "from-rose-500 to-fuchsia-500" } satisfies Record<Difficulty, string>;
const difficultyWeight = { easy: 1, medium: 1.7, hard: 2.5 } satisfies Record<Difficulty, number>;
const AUTO_ADVANCE_DELAY = 1100;
const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};
const QUESTIONS = IQ_QUESTIONS;
const difficultyLabel = { easy: "Oson", medium: "O'rtacha", hard: "Qiyin" } satisfies Record<Difficulty, string>;
const calcIq = (weightedCorrect: number, totalWeight: number) =>
  Math.max(70, Math.min(160, Math.round(70 + (weightedCorrect / Math.max(totalWeight, 1)) * 90)));
const iqLevel = (iq: number) => (iq >= 135 ? "Daho daraja" : iq >= 125 ? "A'lo natija" : iq >= 115 ? "Juda kuchli" : iq >= 100 ? "O'rtachadan yuqori" : iq >= 90 ? "O'rtacha" : "Yana mashq qiling");
const iqGradient = (iq: number) => (iq >= 135 ? "from-fuchsia-300 via-violet-300 to-pink-300" : iq >= 125 ? "from-cyan-300 via-sky-300 to-blue-300" : iq >= 115 ? "from-emerald-300 via-green-300 to-lime-300" : iq >= 100 ? "from-amber-300 via-yellow-300 to-orange-300" : "from-orange-300 via-rose-300 to-red-300");

function VisualBoard({ question, compact = false }: { question: Question; compact?: boolean }) {
  return (
    <div className={`rounded-[2rem] border border-white/10 bg-slate-950/85 ${compact ? "p-3 lg:p-4" : "p-4 lg:p-5"}`}>
      <p className={`text-center text-xs font-bold uppercase tracking-[0.28em] text-sky-200/75 ${compact ? "mb-3" : "mb-4"}`}>Rasmli savol</p>
      <div className={`mx-auto max-w-3xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-white ${compact ? "p-2" : "p-2 lg:p-3"}`}>
        <img
          src={question.image}
          alt={question.question}
          className={`mx-auto h-auto w-full rounded-[1rem] object-contain ${compact ? "max-h-[24vh] lg:max-h-[27vh]" : "max-h-[28vh] lg:max-h-[32vh]"}`}
        />
      </div>
    </div>
  );
}

function Panel({ player, playerIndex, answers, question, showExplanation, onAnswer, accent, compact = false }: { 
  player: string; 
  playerIndex: number; 
  answers: Array<number | null>; 
  question: Question; 
  showExplanation: boolean; 
  onAnswer: (playerIndex: number, optionIndex: number) => void; 
  accent: string;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-[2rem] border border-white/10 bg-gradient-to-b ${accent} ${compact ? "p-3 lg:p-4" : "p-4 lg:p-5"}`}>
      <div className={`flex items-center justify-between gap-3 ${compact ? "mb-3" : "mb-5"}`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-300">Javob paneli</p>
          <h3 className={`font-black text-white ${compact ? "mt-1 text-xl lg:text-2xl" : "mt-2 text-2xl"}`}>{player}</h3>
        </div>
        {showExplanation ? (
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] ${
            question.options[answers[playerIndex] ?? -1]?.id === question.correctAnswer 
              ? "bg-emerald-500/15 text-emerald-200" 
              : "bg-rose-500/15 text-rose-200"
          }`}>
            {question.options[answers[playerIndex] ?? -1]?.id === question.correctAnswer ? <FaCheck /> : <FaTimes />}
            {answers[playerIndex] === null ? "Javob yo'q" : question.options[answers[playerIndex]]?.id === question.correctAnswer ? "To'g'ri" : "Noto'g'ri"}
          </div>
        ) : null}
      </div>
      <div className={`grid sm:grid-cols-2 ${compact ? "gap-2.5" : "gap-3"}`}>
        {question.options.map((option, optionIndex) => { 
          const selected = answers[playerIndex] === optionIndex; 
          const correct = option.id === question.correctAnswer; 
          const disabled = showExplanation || answers[playerIndex] !== null; 
          const state = showExplanation && correct 
            ? "border-emerald-300/40 bg-emerald-500/15 text-emerald-100" 
            : showExplanation && selected 
            ? "border-rose-300/40 bg-rose-500/15 text-rose-100" 
            : selected 
            ? "border-sky-300/40 bg-sky-500/15 text-sky-100" 
            : "border-white/10 bg-slate-950/80 text-white hover:border-sky-300/30 hover:bg-sky-500/10"; 
          
          return (
            <button 
              key={`${player}-${option.id}`} 
              type="button" 
              disabled={disabled} 
              onClick={() => onAnswer(playerIndex, optionIndex)} 
              className={`rounded-2xl border text-left transition ${compact ? "p-2.5" : "p-3"} ${state}`}
            >
              <span className={`block text-xs font-bold uppercase tracking-[0.24em] text-slate-400 ${compact ? "mb-1.5" : "mb-2"}`}>
                Variant {option.id}
              </span>
              <div className={`overflow-hidden rounded-xl border border-white/10 bg-white ${compact ? "p-1.5" : "p-2"}`}>
                <img src={option.image} alt={`Variant ${option.id}`} className={`w-full object-contain ${compact ? "h-16 sm:h-20 lg:h-[5.5rem]" : "h-20 sm:h-24 lg:h-28"}`} />
              </div>
            </button>
          ); 
        })}
      </div>
    </div>
  );
}

function IQGame() {
  const { state: { user } } = useContextPro();
  const session = getGameSessionConfig("iq-game");
  const sessionDefaultsAppliedRef = useRef(false);
  const registeredName = user?.username?.trim() || "O'YINCHI 1";
  const [phase, setPhase] = useState<Phase>("intro");
  useFinishApplause(phase === "result");
  const [playerMode, setPlayerMode] = useState<PlayerMode>(1);
  const [playerNames, setPlayerNames] = useState<[string, string]>([registeredName, "O'YINCHI 2"]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [weightedScores, setWeightedScores] = useState<[number, number]>([0, 0]);
  const [answers, setAnswers] = useState<Array<number | null>>([null, null]);
  const [showExplanation, setShowExplanation] = useState(false);
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();

  useEffect(() => { 
    if (phase === "intro" && playerMode === 1) {
      setPlayerNames((prev) => [registeredName, prev[1]]); 
    }
  }, [phase, playerMode, registeredName]);
  
  const activePlayers = useMemo(() => playerNames.slice(0, playerMode), [playerMode, playerNames]);
  const currentQuestion = questions[currentIndex];
  const availablePool = useMemo(
    () => ({
      easy: QUESTIONS.filter((question) => question.difficulty === "easy").length,
      medium: QUESTIONS.filter((question) => question.difficulty === "medium").length,
      hard: QUESTIONS.filter((question) => question.difficulty === "hard").length,
    }),
    [],
  );
  const totalWeight = useMemo(
    () => questions.reduce((sum, question) => sum + difficultyWeight[question.difficulty], 0),
    [questions],
  );
  const iqScores = activePlayers.map((_, index) => calcIq(weightedScores[index] ?? 0, totalWeight));
  const topScore = Math.max(...scores.slice(0, playerMode), 0);
  const winners = activePlayers.filter((_, index) => scores[index] === topScore);
  const progress = Math.round(((currentIndex + 1) / Math.max(questions.length, 1)) * 100);

  useEffect(() => {
    if (phase !== "game" || !showExplanation) return;
    const timeout = window.setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= questions.length) {
        setPhase("result");
        return;
      }
      setCurrentIndex(nextIndex);
      setAnswers([null, null]);
      setShowExplanation(false);
    }, AUTO_ADVANCE_DELAY);
    return () => window.clearTimeout(timeout);
  }, [currentIndex, phase, questions.length, showExplanation]);

  const setName = (index: number, value: string) => {
    setPlayerNames((prev) => { 
      const next: [string, string] = [...prev] as [string, string]; 
      next[index] = value.trimStart().slice(0, 18) || (index === 0 ? registeredName : `O'YINCHI ${index + 1}`); 
      return next; 
    });
  };
  
  const startGame = (mode: PlayerMode) => {
    const selected = (["easy", "medium", "hard"] as Difficulty[])
      .flatMap((difficulty) =>
        shuffle(QUESTIONS.filter((question) => question.difficulty === difficulty))
          .slice(0, SESSION_PLAN[difficulty])
          .map((question) => ({ ...question, options: shuffle(question.options) })),
      );
    setPlayerMode(mode);
    setQuestions(selected);
    setCurrentIndex(0);
    setScores([0, 0]);
    setWeightedScores([0, 0]);
    setAnswers([null, null]);
    setShowExplanation(false);
    setPhase("game");
  };

  const handleStartGame = (mode: PlayerMode) => {
    runStartCountdown(() => startGame(mode));
  };
  
  const answer = (playerIndex: number, optionIndex: number) => { 
    if (!currentQuestion || showExplanation || answers[playerIndex] !== null) return; 
    const nextAnswers = [...answers]; 
    nextAnswers[playerIndex] = optionIndex; 
    setAnswers(nextAnswers); 
    if (currentQuestion.options[optionIndex]?.id === currentQuestion.correctAnswer) {
      setScores((prev) => { 
        const next: [number, number] = [...prev] as [number, number]; 
        next[playerIndex] += 1; 
        return next; 
      });
      setWeightedScores((prev) => {
        const next: [number, number] = [...prev] as [number, number];
        next[playerIndex] += difficultyWeight[currentQuestion.difficulty];
        return next;
      });
    }
    if (playerMode === 1 || nextAnswers.slice(0, playerMode).every((item) => item !== null)) {
      setShowExplanation(true); 
    }
  };

  useEffect(() => {
    if (phase !== "intro") return;
    if (sessionDefaultsAppliedRef.current) return;

    const mode = session?.participantCount === 2 ? 2 : 1;
    const labels = session?.participantLabels?.length
      ? [
          session.participantLabels[0] || registeredName,
          session.participantLabels[1] || "O'YINCHI 2",
        ]
      : [registeredName, "O'YINCHI 2"];

    sessionDefaultsAppliedRef.current = true;
    setPlayerMode(mode);
    setPlayerNames(labels as [string, string]);
  }, [phase, session?.participantCount, session?.participantLabels, registeredName]);

  if (phase === "intro") {
    return (
      <>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 md:p-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-sky-300/20 bg-sky-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.32em] text-sky-100">
            <FaBrain />IQ Maydoni
          </div>
          <h2 className="mt-6 text-4xl font-black leading-tight text-white md:text-5xl">
            Rangli animatsion IQ o'yini.
            <span className="block bg-gradient-to-r from-sky-300 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
              5 oson, keyin tobora qiyinlashadigan challenge.
            </span>
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Bir kishilik rejimda ro'yxatdan o'tgan foydalanuvchi o'ynaydi. Ikki kishilik rejimda esa ikkala ismni ham o'zgartirish mumkin. 
            Session ichida savollar bosqichma-bosqich qiyinlashib boradi va hammasi rasmli animatsion SVG ko'rinishida chiqadi.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <button 
              type="button" 
              onClick={() => setPlayerMode(1)} 
              className={`rounded-[1.75rem] border p-6 text-left transition ${
                playerMode === 1 ? "border-sky-300/40 bg-sky-500/15" : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="mb-4 flex items-center gap-3 text-2xl font-black text-white">
                <FaUser className="text-sky-300" />1 kishilik
              </div>
              <p className="text-sm text-slate-300">Ro'yxatdan o'tgan foydalanuvchi avtomatik qatnashadi.</p>
            </button>
            <button 
              type="button" 
              onClick={() => setPlayerMode(2)} 
              className={`rounded-[1.75rem] border p-6 text-left transition ${
                playerMode === 2 ? "border-violet-300/40 bg-violet-500/15" : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="mb-4 flex items-center gap-3 text-2xl font-black text-white">
                <FaUsers className="text-violet-300" />2 kishilik
              </div>
              <p className="text-sm text-slate-300">Savol markazda chiqadi, ikki tomonda alohida javob panellari bo'ladi.</p>
            </button>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <label className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-slate-400">1-o'yinchi</span>
              <input 
                value={playerNames[0]} 
                onChange={(event) => setName(0, event.target.value)} 
                disabled={playerMode === 1} 
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none disabled:opacity-70" 
              />
            </label>
            <label className={`rounded-3xl border p-4 ${
              playerMode === 2 ? "border-white/10 bg-white/5" : "border-white/5 bg-transparent opacity-50"
            }`}>
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.28em] text-slate-400">2-o'yinchi</span>
              <input 
                value={playerNames[1]} 
                onChange={(event) => setName(1, event.target.value)} 
                disabled={playerMode !== 2} 
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none disabled:opacity-70" 
              />
            </label>
          </div>
          <button 
            type="button" 
            onClick={() => handleStartGame(playerMode)} 
            className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-violet-500 px-7 py-4 text-sm font-black uppercase tracking-[0.2em] text-white"
          >
            <FaBrain />O'yinni boshlash
          </button>
        </div>
        <div className="space-y-4">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-400">O'yin rejasi</p>
            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <p>1. Faqat boshida 5 ta oson savol keladi.</p>
              <p>2. Keyingi bloklarda savollar tezroq murakkablashadi.</p>
              <p>3. Oxirgi savollar kuchliroq mantiq va pattern tahlilini talab qiladi.</p>
              <p>4. Javob tanlangach o'yin avtomatik keyingi savolga o'tadi.</p>
            </div>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-400">Savollar bazasi</p>
            <p className="mt-4 text-base leading-7 text-slate-300">
              {QUESTIONS.length} ta unikal rasmli savol lokal SVG bazadan yuklanadi.
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Jami: {availablePool.easy} oson, {availablePool.medium} o'rtacha, {availablePool.hard} qiyin savol.
            </p>
          </div>
        </div>
      </div>
      <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />
      </>
    );
  }

  if (phase === "game" && currentQuestion) {
    return (
      <>
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-950/80 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className={`rounded-full bg-gradient-to-r px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-white ${typeAccent[currentQuestion.type]}`}>
              IQ test
            </div>
            <div className={`rounded-full bg-gradient-to-r px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-white ${diffAccent[currentQuestion.difficulty]}`}>
              {difficultyLabel[currentQuestion.difficulty]}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {activePlayers.map((player, index) => (
              <div key={player} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{player}</p>
                <p className="mt-2 text-2xl font-black text-white">{scores[index]}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid gap-4">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-4 lg:p-5">
            <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-[0.28em] text-slate-300">
              <span>Savol {currentIndex + 1} / {questions.length}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-violet-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        
        {playerMode === 2 ? (
          <div className="grid gap-4 xl:grid-cols-[minmax(260px,1fr)_minmax(0,1.25fr)_minmax(260px,1fr)]">
            <Panel 
              player={activePlayers[0]} 
              playerIndex={0} 
              answers={answers} 
              question={currentQuestion} 
              showExplanation={showExplanation} 
              onAnswer={answer} 
              accent="from-sky-500/10 to-transparent" 
            />
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
              <div className="mb-5 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-400">Asosiy savol</p>
                <h2 className="mt-3 text-2xl font-black leading-tight text-white md:text-3xl">{currentQuestion.question}</h2>
              </div>
              <VisualBoard question={currentQuestion} />
              {showExplanation ? (
                <div className="mt-5 rounded-[1.75rem] border border-sky-300/20 bg-sky-500/10 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-200">Natija</p>
                  <p className="mt-3 text-base leading-7 text-slate-200">
                    To'g'ri javob: <span className="font-black">{currentQuestion.correctAnswer}</span>
                  </p>
                  <p className="mt-4 text-sm text-sky-100/80">Keyingi savol avtomatik ochiladi.</p>
                </div>
              ) : null}
            </div>
            <Panel 
              player={activePlayers[1]} 
              playerIndex={1} 
              answers={answers} 
              question={currentQuestion} 
              showExplanation={showExplanation} 
              onAnswer={answer} 
              accent="from-violet-500/10 to-transparent" 
            />
          </div>
        ) : (
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-3 lg:p-4">
            <div className="grid gap-3 xl:grid-cols-[minmax(0,1.08fr)_minmax(330px,0.92fr)] xl:items-start">
              <div className="rounded-[2rem] border border-white/10 bg-slate-950/65 p-3 lg:p-4">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.32em] text-slate-400">{activePlayers[0]}</p>
                  <h2 className="mt-2 text-xl font-black leading-tight text-white md:text-2xl xl:text-[1.8rem]">{currentQuestion.question}</h2>
                </div>
                <div className="mt-3 lg:mt-4">
                  <VisualBoard question={currentQuestion} compact />
                </div>
              </div>
              <Panel 
                player={activePlayers[0]} 
                playerIndex={0} 
                answers={answers} 
                question={currentQuestion} 
                showExplanation={showExplanation} 
                onAnswer={answer} 
                accent="from-sky-500/10 to-transparent"
                compact
              />
            </div>
            {showExplanation ? (
              <div className="mt-4 rounded-[1.75rem] border border-sky-300/20 bg-sky-500/10 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-200">Natija</p>
                <p className="mt-2 text-sm leading-6 text-slate-200 lg:text-base">
                  To'g'ri javob: <span className="font-black">{currentQuestion.correctAnswer}</span>
                </p>
                <p className="mt-2 text-sm text-sky-100/80">Keyingi savol avtomatik ochiladi.</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
      <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />
      </>
    );
  }

  return (
    <>
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 md:p-8">
      {iqScores.some((value) => value >= 135) ? (
        <Confetti mode="boom" effectCount={1} particleCount={160} x={0.5} y={0.28} />
      ) : null}
      <div className="text-center">
        <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/20 to-yellow-500/20 text-4xl text-amber-300">
          <FaCrown />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.32em] text-slate-400">Yakuniy natija</p>
        <h2 className="mt-3 text-4xl font-black text-white md:text-5xl">IQ test yakunlandi</h2>
        <p className="mt-4 text-base text-slate-300">
          {playerMode === 1 
            ? `${activePlayers[0]} testni tugatdi.` 
            : winners.length === 1 
            ? `${winners[0]} bu raundda ustun keldi.` 
            : "Ikki o'yinchi teng natija ko'rsatdi."}
        </p>
      </div>
      
      <div className={`mt-8 grid gap-5 ${playerMode === 2 ? "lg:grid-cols-2" : ""}`}>
        {activePlayers.map((player, index) => { 
          const accuracy = questions.length ? Math.round(((scores[index] ?? 0) / questions.length) * 100) : 0; 
          const iq = iqScores[index]; 
          return (
            <div key={player} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">O'yinchi natijasi</p>
                  <p className="mt-2 text-3xl font-black text-white">{player}</p>
                </div>
                {playerMode === 2 && scores[index] === topScore ? (
                  <span className="rounded-full bg-amber-400/15 px-3 py-2 text-sm font-bold text-amber-200">Eng yuqori ball</span>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-sm text-slate-400">To'g'ri javoblar</p>
                  <p className="mt-2 text-3xl font-black text-white">{scores[index]} / {questions.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-sm text-slate-400">Aniqlik</p>
                  <p className="mt-2 text-3xl font-black text-white">{accuracy}%</p>
                </div>
              </div>
              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5 text-center">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Taxminiy IQ</p>
                <div className={`mt-3 bg-gradient-to-r ${iqGradient(iq)} bg-clip-text text-6xl font-black text-transparent`}>
                  {iq}
                </div>
                <p className="mt-2 text-lg font-semibold text-white">{iqLevel(iq)}</p>
                <p className="mt-2 text-sm text-slate-400">
                  Qiyinlik balli: {weightedScores[index].toFixed(1)} / {totalWeight.toFixed(1)}
                </p>
              </div>
            </div>
          ); 
        })}
      </div>
      
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <button 
          type="button" 
          onClick={() => handleStartGame(playerMode)} 
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-violet-500 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white"
        >
          <FaRedo />Qayta o'ynash
        </button>
        <button 
          type="button" 
          onClick={() => setPhase("intro")} 
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white"
        >
          <FaHome />Menyuga qaytish
        </button>
      </div>
    </div>
    <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />
    </>
  );
}

export default IQGame;
