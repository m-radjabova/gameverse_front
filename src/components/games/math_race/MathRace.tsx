import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaCrown,
  FaPlay,
  FaPlus,
  FaRedo,
  FaTrash,
  FaStar,
  FaBolt,
  FaFire,
  FaShieldAlt,
  FaClock
} from "react-icons/fa";
import { GiRaceCar, GiCheckeredFlag } from "react-icons/gi";
import Confetti from "react-confetti-boom";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../shared/useGameStartCountdown";

import trackImg from "../../../assets/track-road.jpg";
import carBlue from "../../../assets/blue-car-removebg-preview.png";
import carBlack from "../../../assets/black-car-removebg-preview.png";
import carSound from "../../../assets/sounds/car_sound.mp3";

import sfxCorrect from "../../../assets/sounds/ding.m4a";
import sfxWrong from "../../../assets/sounds/wrong.m4a";
import sfxNitro from "../../../assets/sounds/whoosh.m4a";
import sfxFinish from "../../../assets/sounds/tada.mp3";

type Phase = "teacher" | "play" | "finish";
type PlayerId = 0 | 1;
type Difficulty = "easy" | "medium" | "hard";

type Player = {
  id: PlayerId;
  name: string;
  position: number;
};

type MathQuestion = {
  id: string;
  question: string;
  answer: number;
  difficulty: Difficulty;
  points: number;
};

type QuestionDraft = {
  question: string;
  answer: string;
  difficulty: Difficulty;
  points: number;
};

type PlayerStats = {
  streak: number;
  bestStreak: number;
  correct: number;
  wrong: number;
  used5050: boolean;
  usedTime: boolean;
  shieldCharges: number;
  shieldArmed: boolean;
  reducedOptions: number[] | null;
};

const RACE_TRACK_LENGTH = 100;
const BASE_MOVE_AMOUNT = 10;
const TIME_BONUS_MULTIPLIER = 0.3;
const ROUND_TIME = 15;

const DEFAULT_QUESTIONS: MathQuestion[] = [
  { id: "1", question: "5 + 3 = ?", answer: 8, difficulty: "easy", points: 10 },
  { id: "2", question: "12 - 7 = ?", answer: 5, difficulty: "easy", points: 10 },
  { id: "3", question: "4 × 3 = ?", answer: 12, difficulty: "easy", points: 10 },
  { id: "4", question: "15 ÷ 3 = ?", answer: 5, difficulty: "easy", points: 10 },
  { id: "5", question: "9 + 6 = ?", answer: 15, difficulty: "easy", points: 10 },
  { id: "6", question: "18 - 9 = ?", answer: 9, difficulty: "medium", points: 15 },
  { id: "7", question: "7 × 6 = ?", answer: 42, difficulty: "medium", points: 15 },
  { id: "8", question: "24 ÷ 4 = ?", answer: 6, difficulty: "medium", points: 15 },
  { id: "9", question: "13 + 18 = ?", answer: 31, difficulty: "medium", points: 15 },
  { id: "10", question: "45 - 17 = ?", answer: 28, difficulty: "medium", points: 15 },
  { id: "11", question: "16 × 3 = ?", answer: 48, difficulty: "hard", points: 20 },
  { id: "12", question: "56 ÷ 7 = ?", answer: 8, difficulty: "hard", points: 20 },
  { id: "13", question: "84 - 39 = ?", answer: 45, difficulty: "hard", points: 20 },
  { id: "14", question: "12 × 12 = ?", answer: 144, difficulty: "hard", points: 20 },
  { id: "15", question: "125 ÷ 5 = ?", answer: 25, difficulty: "hard", points: 20 },
];

const shuffleArray = <T,>(arr: T[]) => {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

const createDefaultStats = (): Record<PlayerId, PlayerStats> => ({
  0: { streak: 0, bestStreak: 0, correct: 0, wrong: 0, used5050: false, usedTime: false, shieldCharges: 1, shieldArmed: false, reducedOptions: null },
  1: { streak: 0, bestStreak: 0, correct: 0, wrong: 0, used5050: false, usedTime: false, shieldCharges: 1, shieldArmed: false, reducedOptions: null },
});

const wrongPenalty = (difficulty: Difficulty) => {
  if (difficulty === "easy") return 0;
  if (difficulty === "medium") return 2;
  return 4;
};

const nitroBonusFromStreak = (streakAfter: number) => {
  if (streakAfter >= 3) return 5;
  if (streakAfter >= 2) return 3;
  return 0;
};

export default function MathRace() {
  const [phase, setPhase] = useState<Phase>("teacher");
  const [players, setPlayers] = useState<Player[]>([
    { id: 0, name: "Qora", position: 0 },
    { id: 1, name: "Ko'k", position: 0 },
  ]);

  const [questions, setQuestions] = useState<MathQuestion[]>(DEFAULT_QUESTIONS);
  const [activeQuestions, setActiveQuestions] = useState<MathQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [isPlaying, setIsPlaying] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();
  const [winner, setWinner] = useState<PlayerId | null>(null);
  const [locked, setLocked] = useState(false);
  const [answerResult, setAnswerResult] = useState<{ correct: boolean; message: string } | null>(null);

  const [stats, setStats] = useState<Record<PlayerId, PlayerStats>>(createDefaultStats());
  const statsRef = useRef(stats);
  useEffect(() => { statsRef.current = stats; }, [stats]);

  const [nitroFxPlayer, setNitroFxPlayer] = useState<PlayerId | null>(null);
  const [screenShake, setScreenShake] = useState(false);

  const [stars, setStars] = useState(0);
  const [medal, setMedal] = useState<string | null>(null);

  const [draftQuestion, setDraftQuestion] = useState<QuestionDraft>({
    question: "", answer: "", difficulty: "medium", points: 15,
  });
  const [draftError, setDraftError] = useState("");

  const countdownTimerRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const playersRef = useRef<Player[]>(players);
  const activeQuestionsCountRef = useRef(0);

  const carSoundRef = useRef<HTMLAudioElement | null>(null);
  const correctRef = useRef<HTMLAudioElement | null>(null);
  const wrongRef = useRef<HTMLAudioElement | null>(null);
  const nitroRef = useRef<HTMLAudioElement | null>(null);
  const finishRef = useRef<HTMLAudioElement | null>(null);

  // Track sizing
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    if (phase !== "play" || !trackRef.current) return;
    const el = trackRef.current;
    const ro = new ResizeObserver(() => setTrackWidth(el.clientWidth));
    ro.observe(el);
    setTrackWidth(el.clientWidth);
    return () => ro.disconnect();
  }, [phase]);

  useEffect(() => { playersRef.current = players; }, [players]);
  useEffect(() => { activeQuestionsCountRef.current = activeQuestions.length; }, [activeQuestions.length]);

  useEffect(() => {
    carSoundRef.current = new Audio(carSound);
    carSoundRef.current.volume = 1;
    correctRef.current = new Audio(sfxCorrect);
    wrongRef.current = new Audio(sfxWrong);
    nitroRef.current = new Audio(sfxNitro);
    finishRef.current = new Audio(sfxFinish);
    if (correctRef.current) correctRef.current.volume = 0.7;
    if (wrongRef.current) wrongRef.current.volume = 0.7;
    if (nitroRef.current) nitroRef.current.volume = 0.75;
    if (finishRef.current) finishRef.current.volume = 0.8;
    return () => {
      [carSoundRef, correctRef, wrongRef, nitroRef, finishRef].forEach((r) => {
        if (r.current) { r.current.pause(); r.current.currentTime = 0; }
      });
    };
  }, []);

  const playSfx = (ref: React.RefObject<HTMLAudioElement | null>) => {
    const a = ref.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => {});
  };

  // Car position calculation - padding from edges
  const CAR_WIDTH = 200;
  const TRACK_PADDING_LEFT = 60;
  const TRACK_PADDING_RIGHT = 80;

  const getCarX = (posPercent: number) => {
    if (trackWidth === 0) return TRACK_PADDING_LEFT;
    const available = trackWidth - TRACK_PADDING_LEFT - TRACK_PADDING_RIGHT - CAR_WIDTH;
    return TRACK_PADDING_LEFT + (available * posPercent) / 100;
  };

  const currentQuestion = activeQuestions[currentQuestionIndex];
  const progress = activeQuestions.length > 0 ? ((currentQuestionIndex + 1) / activeQuestions.length) * 100 : 0;

  const baseOptions = useMemo(() => {
    if (!currentQuestion) return [];
    const correct = currentQuestion.answer;
    const opts = [correct];
    while (opts.length < 4) {
      let wrong: number;
      if (currentQuestion.difficulty === "easy") {
        wrong = correct + (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
      } else if (currentQuestion.difficulty === "medium") {
        wrong = correct + (Math.floor(Math.random() * 8) + 2) * (Math.random() > 0.5 ? 1 : -1);
      } else {
        wrong = correct + (Math.floor(Math.random() * 15) + 3) * (Math.random() > 0.5 ? 1 : -1);
      }
      if (wrong > 0 && !opts.includes(wrong)) opts.push(wrong);
    }
    return shuffleArray(opts);
  }, [currentQuestion]);

  const optionsFor = (playerId: PlayerId) => {
    const reduced = stats[playerId].reducedOptions;
    return reduced && reduced.length ? reduced : baseOptions;
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2000);
  };

  const triggerShake = () => {
    setScreenShake(true);
    window.setTimeout(() => setScreenShake(false), 260);
  };

  const triggerNitro = (playerId: PlayerId) => {
    setNitroFxPlayer(playerId);
    playSfx(nitroRef);
    window.setTimeout(() => setNitroFxPlayer(null), 450);
  };

  const goToNextQuestion = () => {
    setCurrentQuestionIndex((prev) => {
      const total = activeQuestionsCountRef.current;
      if (total <= 0) return 0;
      const next = prev + 1;
      if (next >= total) {
        setActiveQuestions((prevQuestions) => shuffleArray([...prevQuestions]));
        return 0;
      }
      return next;
    });
    setTimeLeft(ROUND_TIME);
    setLocked(false);
    setAnswerResult(null);
    setStats((prev) => ({
      0: { ...prev[0], reducedOptions: null },
      1: { ...prev[1], reducedOptions: null },
    }));
  };

  // Timer
  useEffect(() => {
    if (phase !== "play" || !isPlaying || locked) return;
    if (timeLeft <= 0) {
      showToast("⏰ Vaqt tugadi!");
      setLocked(true);
      setAnswerResult({ correct: false, message: "⏰ Vaqt tugadi! Keyingi savolga o'tilmoqda..." });
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = window.setTimeout(() => { goToNextQuestion(); }, 1200);
      return;
    }
    if (countdownTimerRef.current) window.clearTimeout(countdownTimerRef.current);
    countdownTimerRef.current = window.setTimeout(() => setTimeLeft((p) => p - 1), 1000);
    return () => { if (countdownTimerRef.current) window.clearTimeout(countdownTimerRef.current); };
  }, [phase, isPlaying, timeLeft, locked, currentQuestionIndex, activeQuestions.length]);

  // Finish check
  useEffect(() => {
    const winIdx = players.findIndex((p) => p.position >= RACE_TRACK_LENGTH);
    if (winIdx !== -1 && phase === "play") {
      setWinner(winIdx as PlayerId);
      setIsPlaying(false);
      setPhase("finish");
      showToast(`🏁 ${players[winIdx].name} marraga yetdi!`);
    }
  }, [players, phase]);

  // Finish rewards
  useEffect(() => {
    if (phase !== "finish") return;
    const s0 = statsRef.current[0];
    const s1 = statsRef.current[1];
    const total = s0.correct + s0.wrong + s1.correct + s1.wrong;
    const correctAll = s0.correct + s1.correct;
    const acc = total ? correctAll / total : 0;
    const diff = Math.abs(playersRef.current[0].position - playersRef.current[1].position);
    const nextStars = winner !== null && acc >= 0.75 ? 3 : winner !== null && acc >= 0.55 ? 2 : acc >= 0.45 ? 1 : 0;
    setStars(nextStars);
    const nextMedal = nextStars >= 3 && diff >= 15 ? "🥇 Gold" : nextStars >= 2 ? "🥈 Silver" : nextStars >= 1 ? "🥉 Bronze" : null;
    setMedal(nextMedal);
    playSfx(finishRef);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Teacher actions
  const addQuestion = () => {
    const question = draftQuestion.question.trim();
    const answer = parseInt(draftQuestion.answer);
    if (!question) return setDraftError("Savolni kiriting!");
    if (isNaN(answer)) return setDraftError("Javobni son ko'rinishida kiriting!");
    const newQuestion: MathQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      question, answer, difficulty: draftQuestion.difficulty, points: draftQuestion.points,
    };
    setQuestions((p) => [...p, newQuestion]);
    setDraftQuestion({ question: "", answer: "", difficulty: "medium", points: 15 });
    setDraftError("");
    showToast("✅ Savol qo'shildi");
  };

  const removeQuestion = (id: string) => {
    setQuestions((p) => p.filter((q) => q.id !== id));
    showToast("🗑️ Savol o'chirildi");
  };

  const updatePlayerName = (id: PlayerId, name: string) => {
    setPlayers((p) => p.map((x) => (x.id === id ? { ...x, name } : x)));
  };

  const startGame = () => {
    if (questions.length < 2) { setDraftError("Kamida 2 ta savol bo'lishi kerak!"); return; }
    if (countdownTimerRef.current) window.clearTimeout(countdownTimerRef.current);
    if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    setPlayers((p) => p.map((x) => ({ ...x, position: 0 })));
    const shuffled = shuffleArray([...questions]);
    setActiveQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setTimeLeft(ROUND_TIME);
    setIsPlaying(true);
    setLocked(false);
    setAnswerResult(null);
    setWinner(null);
    setPhase("play");
    setStats(createDefaultStats());
    setStars(0);
    setMedal(null);
    showToast("🏁 Poyga boshlandi!");
  };

  const handleStartGame = () => runStartCountdown(startGame);

  // Power-ups
  const activate5050 = (playerId: PlayerId) => {
    if (locked || !isPlaying || !currentQuestion) return;
    if (stats[playerId].used5050) return showToast("🎲 50/50 allaqachon ishlatilgan!");
    const correct = currentQuestion.answer;
    const wrongs = baseOptions.filter((x) => x !== correct);
    const wrong = wrongs[Math.floor(Math.random() * wrongs.length)];
    const reduced = shuffleArray([correct, wrong]);
    setStats((prev) => ({ ...prev, [playerId]: { ...prev[playerId], used5050: true, reducedOptions: reduced } }));
    showToast(`🎲 ${players[playerId].name}: 50/50!`);
  };

  const activatePlusTime = (playerId: PlayerId) => {
    if (locked || !isPlaying) return;
    if (stats[playerId].usedTime) return showToast("⏱️ +3s allaqachon ishlatilgan!");
    setStats((prev) => ({ ...prev, [playerId]: { ...prev[playerId], usedTime: true } }));
    setTimeLeft((t) => clamp(t + 3, 0, 30));
    showToast(`⏱️ ${players[playerId].name}: +3s`);
  };

  const activateShield = (playerId: PlayerId) => {
    if (locked || !isPlaying) return;
    if (stats[playerId].shieldCharges <= 0) return showToast("🛡️ Shield yo'q!");
    if (stats[playerId].shieldArmed) return showToast("🛡️ Shield allaqachon tayyor!");
    setStats((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], shieldCharges: prev[playerId].shieldCharges - 1, shieldArmed: true },
    }));
    showToast(`🛡️ ${players[playerId].name}: Shield armed!`);
  };

  // Answer handler
  const handleAnswer = (playerId: PlayerId, answer: number) => {
    if (locked || !isPlaying || !currentQuestion) return;
    if (countdownTimerRef.current) window.clearTimeout(countdownTimerRef.current);
    setLocked(true);
    const isCorrect = answer === currentQuestion.answer;
    const player = players[playerId];
    const curStats = statsRef.current[playerId];

    if (isCorrect) {
      const difficultyBonus = currentQuestion.difficulty === "hard" ? 5 : currentQuestion.difficulty === "medium" ? 3 : 1;
      const timeBonus = Math.floor(timeLeft * TIME_BONUS_MULTIPLIER);
      const streakAfter = curStats.streak + 1;
      const nitroBonus = nitroBonusFromStreak(streakAfter);
      const moveAmount = BASE_MOVE_AMOUNT + difficultyBonus + timeBonus + nitroBonus;
      setPlayers((prev) => prev.map((p) => p.id === playerId ? { ...p, position: Math.min(p.position + moveAmount, RACE_TRACK_LENGTH) } : p));
      setStats((prev) => ({
        ...prev,
        [playerId]: { ...prev[playerId], correct: prev[playerId].correct + 1, streak: streakAfter, bestStreak: Math.max(prev[playerId].bestStreak, streakAfter), shieldArmed: false, reducedOptions: null },
      }));
      playSfx(correctRef);
      if (carSoundRef.current) { carSoundRef.current.currentTime = 0; void carSoundRef.current.play().catch(() => {}); }
      if (nitroBonus > 0) triggerNitro(playerId);
      setAnswerResult({ correct: true, message: `✅ ${player.name} to'g'ri! +${moveAmount}% ${nitroBonus ? `🔥 NITRO +${nitroBonus}` : ""}` });
      showToast(`🚀 ${player.name} oldinga!`);
    } else {
      const shieldActive = curStats.shieldArmed;
      const back = shieldActive ? 0 : wrongPenalty(currentQuestion.difficulty);
      if (back > 0) {
        setPlayers((prev) => prev.map((p) => p.id === playerId ? { ...p, position: Math.max(0, p.position - back) } : p));
      }
      setStats((prev) => ({
        ...prev,
        [playerId]: { ...prev[playerId], wrong: prev[playerId].wrong + 1, streak: 0, shieldArmed: false, reducedOptions: null },
      }));
      playSfx(wrongRef);
      triggerShake();
      setAnswerResult({ correct: false, message: `❌ ${player.name} xato! To'g'ri: ${currentQuestion.answer}${shieldActive ? " 🛡️ Shield saqladi!" : back ? ` (-${back}%)` : ""}` });
      showToast(`❌ Xato! To'g'ri javob: ${currentQuestion.answer}`);
    }

    if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = window.setTimeout(() => { goToNextQuestion(); }, 1400);
  };

  const resetGame = () => {
    if (countdownTimerRef.current) window.clearTimeout(countdownTimerRef.current);
    if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    setPhase("teacher");
    setIsPlaying(false);
    setPlayers((p) => p.map((x) => ({ ...x, position: 0 })));
    setCurrentQuestionIndex(0);
    setWinner(null);
    setLocked(false);
    setAnswerResult(null);
  };

  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) window.clearTimeout(countdownTimerRef.current);
      if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    };
  }, []);

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case "easy": return "text-emerald-400 bg-emerald-500/20 border-emerald-500/40";
      case "medium": return "text-amber-400 bg-amber-500/20 border-amber-500/40";
      case "hard": return "text-rose-400 bg-rose-500/20 border-rose-500/40";
    }
  };

  const getDifficultyIcon = (difficulty: Difficulty) => {
    switch (difficulty) {
      case "easy": return <FaStar className="text-emerald-400" />;
      case "medium": return <FaBolt className="text-amber-400" />;
      case "hard": return <FaFire className="text-rose-400" />;
    }
  };

  const timerPct = (timeLeft / ROUND_TIME) * 100;
  const timerColor = timeLeft <= 5 ? "#ef4444" : timeLeft <= 10 ? "#f59e0b" : "#22c55e";

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Toast */}
      <div className="fixed left-1/2 top-6 z-[100] -translate-x-1/2 pointer-events-none">
        {toast && (
          <div className="rounded-2xl border border-yellow-400/50 bg-slate-900/95 px-6 py-3 text-sm font-bold text-white shadow-2xl backdrop-blur-xl"
            style={{ animation: "fadeInDown 0.2s ease" }}>
            {toast}
          </div>
        )}
      </div>

      {phase === "finish" && winner !== null && (
        <Confetti mode="boom" particleCount={150} effectCount={1} x={0.5} y={0.35}
          colors={["#fbbf24", "#f59e0b", "#ef4444", "#3b82f6", "#10b981"]} />
      )}

      {/* ===== TEACHER PANEL ===== */}
      {phase === "teacher" && (
        <div className="relative z-10 mx-auto max-w-5xl p-4 md:p-6">
          {/* Header */}
          <div className="mb-5 flex items-center gap-4 rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-5 backdrop-blur-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/30">
              <GiRaceCar className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">MATH RACE</h1>
              <p className="text-sm text-yellow-300/70">Matematik poyga o'yini • 2 o'yinchi</p>
            </div>
          </div>

          {/* Player Names */}
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            {[0, 1].map((pid) => (
              <div key={pid} className={`rounded-xl border p-4 ${pid === 0 ? "border-slate-500/30 bg-slate-800/60" : "border-blue-500/30 bg-blue-900/20"}`}>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">
                  {pid === 0 ? "⬛ 1-O'yinchi (Qora)" : "🔵 2-O'yinchi (Ko'k)"}
                </label>
                <input
                  value={players[pid].name}
                  onChange={(e) => updatePlayerName(pid as PlayerId, e.target.value)}
                  className={`w-full rounded-xl border px-4 py-2.5 font-bold text-white outline-none transition-all focus:ring-2 ${pid === 0 ? "border-slate-600 bg-slate-900/50 focus:border-slate-400 focus:ring-slate-400/30" : "border-blue-600/50 bg-blue-950/50 focus:border-blue-400 focus:ring-blue-400/30"}`}
                  placeholder={`O'yinchi ${pid + 1}`}
                />
              </div>
            ))}
          </div>

          {/* Add Question */}
          <div className="mb-4 rounded-xl border border-yellow-500/20 bg-slate-800/50 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-yellow-400">
              <FaPlus /> Yangi Savol Qo'shish
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={draftQuestion.question}
                onChange={(e) => setDraftQuestion({ ...draftQuestion, question: e.target.value })}
                className="rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-2.5 text-white outline-none focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                placeholder="Savol (masalan: 5 + 3 = ?)"
              />
              <input
                value={draftQuestion.answer}
                onChange={(e) => setDraftQuestion({ ...draftQuestion, answer: e.target.value })}
                className="rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-2.5 text-white outline-none focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20 transition-all"
                placeholder="To'g'ri javob (son)" type="number"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              <select
                value={draftQuestion.difficulty}
                onChange={(e) => setDraftQuestion({ ...draftQuestion, difficulty: e.target.value as Difficulty })}
                className="flex-1 rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-2.5 text-white outline-none"
              >
                <option value="easy">🌟 Oson</option>
                <option value="medium">⚡ O'rtacha</option>
                <option value="hard">🔥 Qiyin</option>
              </select>
              <input
                value={draftQuestion.points}
                onChange={(e) => setDraftQuestion({ ...draftQuestion, points: parseInt(e.target.value) || 0 })}
                className="w-28 rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-2.5 text-white outline-none"
                placeholder="Ball" type="number"
              />
              <button onClick={addQuestion}
                className="rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-2.5 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.03] hover:shadow-orange-500/50">
                <FaPlus className="mr-2 inline" />Qo'shish
              </button>
            </div>
            {draftError && <p className="mt-2 text-sm font-medium text-rose-400">{draftError}</p>}
          </div>

          {/* Questions List */}
          <div className="mb-5 rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-400">
              Savollar ro'yxati ({questions.length})
            </h3>
            <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <div key={q.id} className="flex items-center justify-between rounded-xl border border-slate-700/40 bg-slate-900/50 px-3 py-2">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="min-w-[24px] text-center text-xs font-bold text-slate-500">#{idx + 1}</span>
                    <span className="truncate text-sm font-medium text-white">{q.question}</span>
                    <span className={`hidden sm:flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold ${getDifficultyColor(q.difficulty)}`}>
                      {getDifficultyIcon(q.difficulty)} {q.difficulty}
                    </span>
                    <span className="shrink-0 text-xs font-bold text-yellow-400">+{q.points}</span>
                  </div>
                  <button onClick={() => removeQuestion(q.id)}
                    className="ml-2 shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-500/20 hover:text-rose-400">
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {questions.length >= 2 && (
            <div className="text-center">
              <button onClick={handleStartGame}
                className="rounded-2xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 px-12 py-4 text-xl font-black text-white shadow-2xl shadow-orange-500/40 transition-all hover:scale-[1.03] hover:shadow-orange-500/60">
                <FaPlay className="mr-3 inline" />POYGANI BOSHLASH
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== PLAY PHASE ===== */}
      {phase === "play" && (
        <div
          className={`flex h-screen flex-col overflow-hidden ${screenShake ? "animate-pulse" : ""}`}
          style={{ maxHeight: "100vh" }}
        >
          {/* ── TOP BAR ── */}
          <div className="relative z-30 flex shrink-0 items-center gap-3 bg-slate-950/95 px-4 py-2.5 shadow-lg shadow-black/50 backdrop-blur-md border-b border-slate-800">
            <div className="flex items-center gap-2">
              {/* Question counter */}
              <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Savol</p>
                <p className="text-base font-black text-white leading-tight">{currentQuestionIndex + 1}/{activeQuestions.length}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex-1 rounded-full bg-slate-800 h-3 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300"
                style={{ width: `${progress}%` }} />
            </div>

            {/* Timer */}
            <div className="relative flex h-12 w-12 items-center justify-center shrink-0">
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="17" fill="none" stroke="#1e293b" strokeWidth="4" />
                <circle cx="20" cy="20" r="17" fill="none" stroke={timerColor} strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 17}`}
                  strokeDashoffset={`${2 * Math.PI * 17 * (1 - timerPct / 100)}`}
                  strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }} />
              </svg>
              <span className={`relative text-xs font-black ${timeLeft <= 5 ? "text-red-400" : "text-white"}`}>
                {timeLeft}
              </span>
            </div>

            <button onClick={resetGame}
              className="shrink-0 rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-400 transition-all hover:bg-slate-700 hover:text-white">
              <FaRedo size={14} />
            </button>
          </div>

          {/* ── TRACK AREA ── Fixed height so it always shows */}
          <div
            ref={trackRef}
            className="relative shrink-0 overflow-hidden"
            style={{
              height: "320px",
              backgroundImage: `url(${trackImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Dark overlay for contrast */}
            <div className="absolute inset-0 bg-black/30" />

            {/* START line */}
            <div className="absolute top-0 bottom-0 z-20 w-1 bg-emerald-400/90" style={{ left: `${TRACK_PADDING_LEFT - 2}px` }}>
              <div className="absolute top-2 left-1 rounded-full bg-emerald-600/90 px-2 py-0.5 text-[10px] font-black text-white whitespace-nowrap">
                START
              </div>
            </div>

            {/* FINISH line */}
            <div className="absolute top-0 bottom-0 z-20 w-1.5 bg-yellow-400"
              style={{ left: `${trackWidth - TRACK_PADDING_RIGHT}px` }}>
              <div className="absolute top-2 right-1 flex items-center gap-1 rounded-full bg-yellow-600/90 px-2 py-0.5 text-[10px] font-black text-white whitespace-nowrap">
                <GiCheckeredFlag /> FINISH
              </div>
            </div>

            {/* Lane separating line */}
            <div className="absolute left-0 right-0 z-10" style={{ top: "50%" }}>
              <div className="h-[2px] bg-white/20 mx-4" />
            </div>

            {/* ── PLAYER 0 CAR (top lane) ── */}
            {trackWidth > 0 && (() => {
              const player = players[0];
              const x = getCarX(player.position);
              const nitro = nitroFxPlayer === 0;
              return (
                <div
                  className="absolute z-30 transition-all duration-700 ease-out"
                  style={{ left: `${x}px`, top: "26%", transform: "translateY(-50%)" }}
                >
                  {nitro && (
                    <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-orange-400 text-xl animate-pulse">🔥</div>
                  )}
                  <img src={carBlack} alt={player.name} draggable={false}
                    className="h-24 w-auto select-none drop-shadow-2xl"
                    style={{ transform: "scaleX(-1)", filter: "brightness(1.15)" }}
                  />
                  {/* Label below car */}
                  <div className="mt-1 flex items-center justify-center gap-1.5">
                    <span className="rounded-full bg-black/80 px-2 py-0.5 text-[12px] font-bold text-white border border-slate-600/50">
                      {player.name}
                    </span>
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[12px] font-black text-emerald-300">
                      {Math.round(player.position)}%
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* ── PLAYER 1 CAR (bottom lane) ── */}
            {trackWidth > 0 && (() => {
              const player = players[1];
              const x = getCarX(player.position);
              const nitro = nitroFxPlayer === 1;
              return (
                <div
                  className="absolute z-30 transition-all duration-700 ease-out"
                  style={{ left: `${x}px`, top: "74%", transform: "translateY(-50%)" }}
                >
                  {nitro && (
                    <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-blue-400 text-xl animate-pulse">💨</div>
                  )}
                  <img src={carBlue} alt={player.name} draggable={false}
                    className="h-24 w-auto select-none drop-shadow-2xl"
                    style={{ transform: "scaleX(-1)", filter: "brightness(1.15)" }}
                  />
                  <div className="mt-1 flex items-center justify-center gap-1.5">
                    <span className="rounded-full bg-black/80 px-2 py-0.5 text-[12px] font-bold text-white border border-blue-500/50">
                      {player.name}
                    </span>
                    <span className="rounded-full bg-blue-500/20 border border-blue-500/40 px-2 py-0.5 text-[12px] font-black text-blue-300">
                      {Math.round(player.position)}%
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ── QUESTION DISPLAY ── */}
          {currentQuestion && (
            <div className="shrink-0 bg-slate-900/90 px-4 py-2.5 border-y border-slate-800 backdrop-blur-sm text-center">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-800/80 px-5 py-2">
                <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${getDifficultyColor(currentQuestion.difficulty)}`}>
                  {getDifficultyIcon(currentQuestion.difficulty)}
                  {currentQuestion.difficulty === "easy" ? "OSON" : currentQuestion.difficulty === "medium" ? "O'RTACHA" : "QIYIN"}
                </span>
                <span className="text-2xl font-black text-white">{currentQuestion.question}</span>
                <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-sm font-bold text-yellow-300">
                  +{currentQuestion.points}
                </span>
              </div>
            </div>
          )}

          {/* ── ANSWER RESULT BANNER ── */}
          {answerResult && (
            <div className={`shrink-0 py-1.5 text-center text-sm font-bold ${answerResult.correct ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
              {answerResult.message}
            </div>
          )}

          {/* ── PLAYER PANELS ── flex-1 so they fill remaining space */}
          <div className="flex flex-1 overflow-hidden">
            {/* Player 0 Panel */}
            <div className="flex flex-1 flex-col border-r-2 border-slate-800 bg-slate-900/80 p-3">
              {/* Player header */}
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-slate-500 ring-2 ring-slate-400" />
                  <span className="font-black text-white text-sm">{players[0].name}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-emerald-300">✅{stats[0].correct}</span>
                  <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-rose-300">❌{stats[0].wrong}</span>
                </div>
              </div>

              {/* Combo + Power-ups */}
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="rounded-full bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-purple-300 font-bold">
                    🔥{stats[0].streak} combo
                  </span>
                  {stats[0].shieldArmed && (
                    <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-cyan-300 font-bold animate-pulse">
                      🛡️ ARMED
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => activate5050(0)} disabled={locked || stats[0].used5050}
                    title="50/50" className="h-8 w-8 rounded-lg border border-purple-500/30 bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 disabled:opacity-40 transition-all text-xs font-bold">
                    ½
                  </button>
                  <button onClick={() => activatePlusTime(0)} disabled={locked || stats[0].usedTime}
                    title="+3 sekund" className="h-8 w-8 rounded-lg border border-amber-500/30 bg-amber-600/20 text-amber-300 hover:bg-amber-600/40 disabled:opacity-40 transition-all">
                    <FaClock size={11} className="mx-auto" />
                  </button>
                  <button onClick={() => activateShield(0)} disabled={locked || stats[0].shieldCharges <= 0 || stats[0].shieldArmed}
                    title="Shield" className="h-8 w-8 rounded-lg border border-cyan-500/30 bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/40 disabled:opacity-40 transition-all">
                    <FaShieldAlt size={11} className="mx-auto" />
                  </button>
                </div>
              </div>

              {/* Answer buttons */}
              <div className="grid flex-1 grid-cols-2 gap-2">
                {optionsFor(0).map((option, idx) => (
                  <button key={`p0-${idx}`}
                    onClick={() => !locked && handleAnswer(0, option)}
                    disabled={locked}
                    className="rounded-xl border-2 border-purple-600/30 bg-gradient-to-b from-purple-600/50 to-purple-800/60 text-xl font-black text-white shadow-lg transition-all hover:from-purple-500/60 hover:to-purple-700/70 hover:scale-[1.02] hover:border-purple-400/50 disabled:opacity-50 disabled:scale-100 active:scale-95">
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Player 1 Panel */}
            <div className="flex flex-1 flex-col bg-slate-900/80 p-3">
              {/* Player header */}
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500 ring-2 ring-blue-300" />
                  <span className="font-black text-white text-sm">{players[1].name}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-emerald-300">✅{stats[1].correct}</span>
                  <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-rose-300">❌{stats[1].wrong}</span>
                </div>
              </div>

              {/* Combo + Power-ups */}
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-blue-300 font-bold">
                    🔥{stats[1].streak} combo
                  </span>
                  {stats[1].shieldArmed && (
                    <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-cyan-300 font-bold animate-pulse">
                      🛡️ ARMED
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => activate5050(1)} disabled={locked || stats[1].used5050}
                    title="50/50" className="h-8 w-8 rounded-lg border border-blue-500/30 bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 disabled:opacity-40 transition-all text-xs font-bold">
                    ½
                  </button>
                  <button onClick={() => activatePlusTime(1)} disabled={locked || stats[1].usedTime}
                    title="+3 sekund" className="h-8 w-8 rounded-lg border border-amber-500/30 bg-amber-600/20 text-amber-300 hover:bg-amber-600/40 disabled:opacity-40 transition-all">
                    <FaClock size={11} className="mx-auto" />
                  </button>
                  <button onClick={() => activateShield(1)} disabled={locked || stats[1].shieldCharges <= 0 || stats[1].shieldArmed}
                    title="Shield" className="h-8 w-8 rounded-lg border border-cyan-500/30 bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/40 disabled:opacity-40 transition-all">
                    <FaShieldAlt size={11} className="mx-auto" />
                  </button>
                </div>
              </div>

              {/* Answer buttons */}
              <div className="grid flex-1 grid-cols-2 gap-2">
                {optionsFor(1).map((option, idx) => (
                  <button key={`p1-${idx}`}
                    onClick={() => !locked && handleAnswer(1, option)}
                    disabled={locked}
                    className="rounded-xl border-2 border-blue-600/30 bg-gradient-to-b from-blue-600/50 to-blue-800/60 text-xl font-black text-white shadow-lg transition-all hover:from-blue-500/60 hover:to-blue-700/70 hover:scale-[1.02] hover:border-blue-400/50 disabled:opacity-50 disabled:scale-100 active:scale-95">
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== FINISH PHASE ===== */}
      {phase === "finish" && (
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-center shadow-2xl">
            {/* Trophy */}
            <div className="mb-5 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-yellow-400/20" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-xl shadow-orange-500/40">
                  <FaCrown className="text-4xl text-white" />
                </div>
              </div>
            </div>

            <h2 className="mb-2 text-4xl font-black text-white">
              {winner !== null ? `${players[winner].name} G'OLIB!` : "DURANG!"}
            </h2>

            {/* Stars */}
            <div className="mb-2 flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <span key={i} className={`text-3xl transition-all ${i < stars ? "opacity-100 scale-110" : "opacity-20 grayscale"}`}>⭐</span>
              ))}
            </div>

            {medal && (
              <div className="mb-4 inline-block rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 text-lg font-black text-yellow-300">
                {medal}
              </div>
            )}

            {/* Player stats */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              {players.map((player) => {
                const s = stats[player.id];
                const isWinner = winner === player.id;
                return (
                  <div key={player.id} className={`rounded-2xl border p-4 ${isWinner ? "border-yellow-500/40 bg-yellow-500/10" : "border-slate-700 bg-slate-800/50"}`}>
                    {isWinner && <div className="mb-1 text-xs font-bold text-yellow-400">👑 G'OLIB</div>}
                    <p className="font-black text-white">{player.name}</p>
                    <p className="text-3xl font-black text-white">{Math.round(player.position)}%</p>
                    <div className="mt-2 flex flex-wrap gap-1 justify-center text-xs">
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-emerald-300">✅ {s.correct}</span>
                      <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 text-rose-300">❌ {s.wrong}</span>
                      <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 text-purple-300">🔥 {s.bestStreak}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row justify-center">
              <button onClick={resetGame}
                className="rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-3 text-lg font-black text-white shadow-xl shadow-orange-500/30 hover:scale-105 transition-all">
                <FaRedo className="mr-2 inline" />Qayta O'ynash
              </button>
              <button onClick={() => (window.location.href = "/games")}
                className="rounded-2xl border border-slate-600 bg-slate-800 px-8 py-3 text-lg font-bold text-white hover:bg-slate-700 transition-all">
                <FaArrowLeft className="mr-2 inline" />O'yinlar
              </button>
            </div>
          </div>
        </div>
      )}

      <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />
    </div>
  );
}