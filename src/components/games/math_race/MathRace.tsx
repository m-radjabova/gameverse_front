import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaCrown,
  FaPlay,
  FaPlus,
  FaRedo,
  FaRobot,
  FaTrash,
  FaStar,
  FaBolt,
  FaFire,
  FaShieldAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaFlagCheckered,
  FaUserGraduate,
  FaBookOpen,
  FaMagic,
  FaListOl,
  FaEdit,
  FaGavel,
  FaTrophy,
  FaMedal,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import { GiRaceCar, GiCheckeredFlag } from "react-icons/gi";
import Confetti from "react-confetti-boom";
import { fetchGameQuestionsByTeacher, saveGameQuestions } from "../../../hooks/useGameQuestions";
import useContextPro from "../../../hooks/useContextPro";
import { generateMathRaceQuestions } from "./ai";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useFinishApplause } from "../../../hooks/useFinishApplause";
import { useGameResultSubmission } from "../../../hooks/useGameResultSubmission";
import { useGameStartCountdown } from "../../../hooks/useGameStartCountdown";

import trackImg from "../../../assets/new_road.png";
import carBlue from "../../../assets/car_blue.png";
import carBlack from "../../../assets/dark_car.png";
import carSound from "../../../assets/sounds/car_sound.mp3";

import sfxCorrect from "../../../assets/sounds/ding.m4a";
import sfxWrong from "../../../assets/sounds/wrong.mp3";
import sfxNitro from "../../../assets/sounds/whoosh.m4a";
import sfxFinish from "../../../assets/sounds/applause.mp3";

import { BASE_MOVE_AMOUNT, DEFAULT_QUESTIONS, MATH_RACE_GAME_KEY, MATH_RACE_RESULT_KEY, RACE_TRACK_LENGTH, ROUND_TIME, TIME_BONUS_MULTIPLIER } from "./constants";
import type { Difficulty, MathQuestion, Phase, Player, PlayerId, PlayerStats, QuestionDraft } from "./types";
import { clamp, createDefaultStats, nitroBonusFromStreak, shuffleArray, wrongPenalty } from "./utils";
import { GRADE_RANGE_OPTIONS, type GradeRange } from "../../../utils/aiGeneration";

const AI_QUESTION_COUNT_OPTIONS = [2, 4, 6, 8, 10, 15, 20] as const;
const AI_DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Oson" },
  { value: "medium", label: "O'rtacha" },
  { value: "hard", label: "Qiyin" },
  { value: "mixed", label: "Aralash" },
] as const;

export default function MathRace() {
  const {
    state: { user, isLoading: isUserLoading },
  } = useContextPro();
  const skipInitialRemoteSaveRef = useRef(true);
  const [phase, setPhase] = useState<Phase>("teacher");
  useFinishApplause(phase === "finish");
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
  const [aiTopic, setAiTopic] = useState("");
  const [aiGradeRange, setAiGradeRange] = useState<GradeRange>("none");
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(6);
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("medium");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [remoteLoaded, setRemoteLoaded] = useState(false);

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
  const hasGeminiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY?.trim());

  useEffect(() => {
    if (isUserLoading) return;

    let alive = true;
    (async () => {
      if (!user?.id) {
        setQuestions(DEFAULT_QUESTIONS);
        setRemoteLoaded(true);
        return;
      }

      const remoteQuestions = await fetchGameQuestionsByTeacher<MathQuestion>(MATH_RACE_GAME_KEY, user.id);
      if (!alive) return;
      if (remoteQuestions && remoteQuestions.length > 0) {
        setQuestions(remoteQuestions);
      } else {
        setQuestions(DEFAULT_QUESTIONS);
      }
      setRemoteLoaded(true);
    })();

    return () => {
      alive = false;
    };
  }, [isUserLoading, user?.id]);

  useEffect(() => {
    if (!remoteLoaded) return;
    if (skipInitialRemoteSaveRef.current) {
      skipInitialRemoteSaveRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      if (!user?.id) return;
      void saveGameQuestions<MathQuestion>(MATH_RACE_GAME_KEY, questions, user.id);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [questions, remoteLoaded, user?.id]);

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
  useGameResultSubmission(phase === "finish", MATH_RACE_RESULT_KEY, players.map((player) => ({
    participant_name: player.name,
    participant_mode: `${players.length} o'yinchi`,
    score: Math.round(player.position),
    metadata: {
      winner: winner === player.id,
      track_length: RACE_TRACK_LENGTH,
      stars,
      medal,
    },
  })));

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
    if (!user?.id) {
      setDraftError("Iltimos, avval ro'yxatdan o'ting. Keyin savol qo'shishingiz mumkin.");
      return;
    }

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

  const generateAiQuestions = async () => {
    if (isGeneratingAi) return;
    if (!user?.id) {
      setDraftError("Iltimos, avval ro'yxatdan o'ting. Keyin AI bilan savol qo'shishingiz mumkin.");
      return;
    }

    setDraftError("");
    setIsGeneratingAi(true);

    try {
      const generated = await generateMathRaceQuestions({
        topic: aiTopic,
        count: aiQuestionCount,
        difficulty: aiDifficulty,
        gradeRange: aiGradeRange,
      });
      setQuestions((prev) => [
        ...prev,
        ...generated.map((item, index) => ({
          ...item,
          id: `ai-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        })),
      ]);
      showToast(`${generated.length} ta AI misol yuklandi`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI misollar yaratib bo'lmadi.";
      setDraftError(message);
    } finally {
      setIsGeneratingAi(false);
    }
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* Animated background particles */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-yellow-500/5 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      {/* Toast */}
      <div className="fixed left-1/2 top-6 z-[100] -translate-x-1/2 pointer-events-none">
        {toast && (
          <div className="animate-slideDown rounded-2xl border border-yellow-400/50 bg-gradient-to-r from-slate-900/95 to-slate-800/95 px-6 py-3 text-sm font-bold text-white shadow-2xl backdrop-blur-xl shadow-yellow-500/20">
            <div className="flex items-center gap-2">
              <span className="text-lg">{toast.match(/^.{1,2}/)?.[0]}</span>
              <span>{toast.replace(/^.{1,2}\s*/, "")}</span>
            </div>
          </div>
        )}
      </div>

      {phase === "finish" && winner !== null && (
        <Confetti mode="boom" particleCount={200} effectCount={2} x={0.5} y={0.35}
          colors={["#fbbf24", "#f59e0b", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899"]} />
      )}

      {/* ===== TEACHER PANEL ===== */}
      {phase === "teacher" && (
        <div className="relative z-10 mx-auto max-w-5xl p-4 md:p-6 animate-fadeIn">
          {/* Header */}
          <div className="group mb-6 overflow-hidden rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-rose-500/10 p-6 backdrop-blur-sm shadow-xl shadow-yellow-500/10 transition-all hover:shadow-yellow-500/20">
            <div className="flex items-center gap-5">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 opacity-30 blur-md" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/40">
                  <GiRaceCar className="text-3xl text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                  MATH <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">RACE</span>
                </h1>
                <p className="flex items-center gap-2 text-sm text-yellow-300/70">
                  <FaFlagCheckered className="text-yellow-400" />
                  Matematik poyga o'yini • 2 o'yinchi
                </p>
              </div>
              <div className="hidden items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 sm:flex">
                <FaBookOpen className="text-yellow-400" />
                <span className="text-sm font-bold text-yellow-300">{questions.length} ta savol</span>
              </div>
            </div>
          </div>

          {/* Player Names */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            {[0, 1].map((pid) => (
              <div key={pid} className={`group rounded-2xl border p-5 transition-all hover:shadow-lg ${pid === 0 ? "border-slate-500/30 bg-gradient-to-br from-slate-800/80 to-slate-900/80 hover:border-slate-400/50 hover:shadow-slate-500/20" : "border-blue-500/30 bg-gradient-to-br from-blue-900/30 to-slate-900/80 hover:border-blue-400/50 hover:shadow-blue-500/20"}`}>
                <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full ${pid === 0 ? "bg-slate-500" : "bg-blue-500"}`}>
                    <span className="h-2 w-2 rounded-full bg-white/80" />
                  </span>
                  {pid === 0 ? "1-O'yinchi (Qora)" : "2-O'yinchi (Ko'k)"}
                </label>
                <div className="relative">
                  <FaUserGraduate className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${pid === 0 ? "text-slate-400" : "text-blue-400"}`} />
                  <input
                    value={players[pid].name}
                    onChange={(e) => updatePlayerName(pid as PlayerId, e.target.value)}
                    className={`w-full rounded-xl border py-3 pl-10 pr-4 font-bold text-white outline-none transition-all focus:ring-2 ${pid === 0 ? "border-slate-600 bg-slate-900/70 focus:border-slate-400 focus:ring-slate-400/30 placeholder:text-slate-500" : "border-blue-600/50 bg-blue-950/50 focus:border-blue-400 focus:ring-blue-400/30 placeholder:text-blue-400/50"}`}
                    placeholder={`O'yinchi ${pid + 1} ismi`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Add Question Section */}
          <div className="mb-6 overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-slate-800/60 to-slate-900/60 shadow-xl">
            {/* Section tabs */}
            <div className="flex border-b border-yellow-500/10">
              <div className="flex items-center gap-2 border-b-2 border-yellow-400 px-5 py-3">
                <FaPlus className="text-yellow-400" />
                <span className="text-sm font-bold uppercase tracking-wider text-yellow-400">Yangi Savol</span>
              </div>
            </div>

            <div className="p-5">
              {/* AI Generation */}
              <div className="mb-5 overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 to-blue-950/30">
                <div className="flex items-center gap-3 border-b border-cyan-500/20 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
                    <FaRobot className="text-sm text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-cyan-300">AI Misol Generatsiyasi</p>
                    <p className="text-[10px] text-cyan-400/60">Sun'iy intellekt yordamida misol yaratish</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <textarea
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="col-span-full rounded-xl border border-cyan-500/30 bg-slate-900/70 px-4 py-3 text-white outline-none placeholder-cyan-300/50 transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                      placeholder="Mavzu: qo'shish-ayirish, kasrlar, foizlar, geometriya..."
                      rows={2}
                    />
                    <select
                      value={aiGradeRange}
                      onChange={(e) => setAiGradeRange(e.target.value as GradeRange)}
                      className="rounded-xl border border-cyan-500/30 bg-slate-900/70 px-4 py-3 text-white outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    >
                      {GRADE_RANGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="bg-slate-950">
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <select
                      value={aiQuestionCount}
                      onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                      className="rounded-xl border border-cyan-500/30 bg-slate-900/70 px-4 py-3 text-white outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    >
                      {AI_QUESTION_COUNT_OPTIONS.map((count) => (
                        <option key={count} value={count} className="bg-slate-950">
                          {count} ta misol
                        </option>
                      ))}
                    </select>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value as "easy" | "medium" | "hard" | "mixed")}
                      className="rounded-xl border border-cyan-500/30 bg-slate-900/70 px-4 py-3 text-white outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    >
                      {AI_DIFFICULTY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="bg-slate-950">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => void generateAiQuestions()}
                    disabled={!hasGeminiKey || isGeneratingAi}
                    className="group relative mt-4 w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-[1.01] hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="relative flex items-center justify-center gap-2">
                      {isGeneratingAi ? (
                        <>
                          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          {aiQuestionCount} ta yaratilmoqda...
                        </>
                      ) : (
                        <>
                          <FaMagic />
                          AI bilan {aiQuestionCount} ta yaratish
                        </>
                      )}
                    </span>
                  </button>
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-cyan-100/60">
                    <FaInfoCircle className="text-cyan-400" />
                    AI yangi matematik misollar yaratadi. Mavzu va sinf oralig'i berilsa misollar shu darajaga moslashadi.
                  </p>
                </div>
              </div>

              {/* Manual Question Form */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="relative sm:col-span-2">
                  <FaEdit className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-yellow-400/70" />
                  <input
                    value={draftQuestion.question}
                    onChange={(e) => setDraftQuestion({ ...draftQuestion, question: e.target.value })}
                    className="w-full rounded-xl border border-slate-600 bg-slate-900/70 py-3 pl-10 pr-4 text-white outline-none transition-all focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20 placeholder:text-slate-500"
                    placeholder="Savol (masalan: 5 + 3 = ?)"
                  />
                </div>
                <div className="relative">
                  <FaGavel className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-yellow-400/70" />
                  <input
                    value={draftQuestion.answer}
                    onChange={(e) => setDraftQuestion({ ...draftQuestion, answer: e.target.value })}
                    className="w-full rounded-xl border border-slate-600 bg-slate-900/70 py-3 pl-10 pr-4 text-white outline-none transition-all focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20 placeholder:text-slate-500"
                    placeholder="To'g'ri javob (son)" type="number"
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <select
                  value={draftQuestion.difficulty}
                  onChange={(e) => setDraftQuestion({ ...draftQuestion, difficulty: e.target.value as Difficulty })}
                  className="flex-1 rounded-xl border border-slate-600 bg-slate-900/70 px-4 py-3 text-white outline-none transition-all focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20"
                >
                  <option value="easy">🌟 Oson</option>
                  <option value="medium">⚡ O'rtacha</option>
                  <option value="hard">🔥 Qiyin</option>
                </select>
                <div className="relative w-28">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-yellow-400">+</span>
                  <input
                    value={draftQuestion.points}
                    onChange={(e) => setDraftQuestion({ ...draftQuestion, points: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-600 bg-slate-900/70 py-3 pl-8 pr-4 text-white outline-none transition-all focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/20"
                    placeholder="Ball" type="number"
                  />
                </div>
                <button onClick={addQuestion}
                  className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-[1.02] hover:shadow-orange-500/50 sm:flex-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative flex items-center justify-center gap-2">
                    <FaPlus />
                    Qo'shish
                  </span>
                </button>
              </div>
              {draftError && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5">
                  <FaExclamationTriangle className="text-rose-400 shrink-0" />
                  <p className="text-sm font-medium text-rose-400">{draftError}</p>
                </div>
              )}
            </div>
          </div>

          {/* Questions List */}
          <div className="mb-6 overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/40 to-slate-900/40 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-700/50 px-5 py-3">
              <div className="flex items-center gap-2">
                <FaListOl className="text-slate-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                  Savollar ro'yxati
                </h3>
              </div>
              <span className="rounded-full border border-slate-600 bg-slate-800 px-3 py-0.5 text-xs font-bold text-slate-300">
                {questions.length} ta
              </span>
            </div>
            <div className="max-h-60 space-y-2 overflow-y-auto p-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                  <FaBookOpen className="mb-2 text-3xl opacity-50" />
                  <p className="text-sm font-medium">Hali savollar yo'q</p>
                  <p className="text-xs">Yuqoridagi form orqali savol qo'shing</p>
                </div>
              ) : (
                questions.map((q, idx) => (
                  <div key={q.id} className="group flex items-center justify-between rounded-xl border border-slate-700/40 bg-slate-900/50 px-4 py-3 transition-all hover:border-slate-600/60 hover:bg-slate-900/80">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-slate-400">
                        {idx + 1}
                      </span>
                      <span className="truncate text-sm font-medium text-white">{q.question}</span>
                      <span className={`hidden shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold sm:flex ${getDifficultyColor(q.difficulty)}`}>
                        {getDifficultyIcon(q.difficulty)} {q.difficulty === "easy" ? "Oson" : q.difficulty === "medium" ? "O'rtacha" : "Qiyin"}
                      </span>
                      <span className="shrink-0 rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-bold text-yellow-400">
                        +{q.points}
                      </span>
                    </div>
                    <button onClick={() => removeQuestion(q.id)}
                      className="ml-2 shrink-0 rounded-lg p-2 text-slate-500 transition-all hover:bg-rose-500/20 hover:text-rose-400 group-hover:opacity-100 opacity-60">
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Start Button */}
          {questions.length >= 2 && (
            <div className="text-center animate-bounceIn">
              <button onClick={handleStartGame}
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 px-12 py-4 text-xl font-black text-white shadow-2xl shadow-orange-500/40 transition-all hover:scale-[1.03] hover:shadow-orange-500/60 active:scale-[0.98]">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center gap-3">
                  <FaPlay className="text-lg" />
                  POYGANI BOSHLASH
                  <GiRaceCar className="text-2xl" />
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== PLAY PHASE ===== */}
      {phase === "play" && (
        <div
          className={`flex min-h-[70dvh] flex-col overflow-hidden lg:h-screen ${screenShake ? "animate-shake" : ""}`}
        >
          {/* ── TOP BAR ── */}
          <div className="relative z-30 flex shrink-0 items-center gap-3 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-indigo-950/95 px-4 py-3 shadow-lg shadow-black/50 backdrop-blur-md border-b border-slate-800">
            <div className="flex items-center gap-2">
              {/* Question counter */}
              <div className="rounded-xl border border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 px-3 py-1.5 text-center shadow-inner">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Savol</p>
                <p className="text-base font-black text-white leading-tight">{currentQuestionIndex + 1}/{activeQuestions.length}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex-1">
              <div className="h-3 rounded-full bg-slate-800 overflow-hidden shadow-inner">
                <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 transition-all duration-500 ease-out relative"
                  style={{ width: `${progress}%` }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>

            {/* Timer */}
            <div className="relative flex h-14 w-14 items-center justify-center shrink-0">
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="17" fill="none" stroke="#1e293b" strokeWidth="4" />
                <circle cx="20" cy="20" r="17" fill="none" stroke={timerColor} strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 17}`}
                  strokeDashoffset={`${2 * Math.PI * 17 * (1 - timerPct / 100)}`}
                  strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }} />
              </svg>
              <div className="relative flex flex-col items-center">
                <span className={`text-sm font-black leading-none ${timeLeft <= 5 ? "text-red-400" : "text-white"}`}>
                  {timeLeft}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">soniya</span>
              </div>
            </div>

            <button onClick={resetGame}
              className="group shrink-0 rounded-xl border border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 p-2.5 text-slate-400 shadow-lg transition-all hover:border-slate-600 hover:bg-slate-700 hover:text-white active:scale-95">
              <FaRedo size={14} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>

          {/* ── TRACK AREA ── */}
          <div
            ref={trackRef}
            className="relative shrink-0 overflow-hidden"
            style={{
              height: typeof window !== "undefined" && window.innerWidth < 640 ? "300px" : "420px",
              backgroundImage: `url(${trackImg})`,
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Dark overlay for contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />

            {/* Track lane markings */}
            <div className="absolute inset-0 z-10">
              {/* Lane dividers */}
              <div className="absolute left-0 right-0" style={{ top: "25%" }}>
                <div className="h-[2px] mx-4" style={{ background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 20px, transparent 20px, transparent 40px)" }} />
              </div>
              <div className="absolute left-0 right-0" style={{ top: "50%" }}>
                <div className="h-[2px] mx-4" style={{ background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 20px, transparent 20px, transparent 40px)" }} />
              </div>
              <div className="absolute left-0 right-0" style={{ top: "75%" }}>
                <div className="h-[2px] mx-4" style={{ background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 20px, transparent 20px, transparent 40px)" }} />
              </div>
            </div>

            {/* START line */}
            <div className="absolute top-0 bottom-0 z-20 flex items-center" style={{ left: `${TRACK_PADDING_LEFT - 2}px` }}>
              <div className="h-full w-1 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/50" />
              <div className="absolute -left-1 top-2 rounded-r-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 py-1 text-[10px] font-black text-white shadow-lg">
                START
              </div>
            </div>

            {/* FINISH line */}
            <div className="absolute top-0 bottom-0 z-20 flex items-center" style={{ left: `${trackWidth - TRACK_PADDING_RIGHT}px` }}>
              <div className="h-full w-1.5 bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-400 shadow-lg shadow-yellow-500/50" />
              <div className="absolute -right-1 top-2 rounded-l-full bg-gradient-to-l from-yellow-600 to-yellow-500 px-3 py-1 text-[10px] font-black text-white shadow-lg flex items-center gap-1">
                <GiCheckeredFlag /> FINISH
              </div>
            </div>

            {/* Distance markers */}
            {[25, 50, 75].map((pct) => (
              <div key={pct} className="absolute z-10 bottom-2" style={{ left: `${TRACK_PADDING_LEFT + ((trackWidth - TRACK_PADDING_LEFT - TRACK_PADDING_RIGHT) * pct) / 100}px` }}>
                <div className="flex flex-col items-center">
                  <div className="h-3 w-[1px] bg-white/20" />
                  <span className="text-[8px] font-bold text-white/30">{pct}%</span>
                </div>
              </div>
            ))}

            {/* ── PLAYER 0 CAR (top lane) ── */}
            {trackWidth > 0 && (() => {
              const player = players[0];
              const x = getCarX(player.position);
              const nitro = nitroFxPlayer === 0;
              return (
                <div
                  className="absolute z-30 transition-all duration-700 ease-out"
                  style={{ left: `${x}px`, top: "30%", transform: "translateY(-50%)" }}
                >
                  {nitro && (
                    <div className="absolute -right-10 -top-2 flex gap-1">
                      <span className="text-orange-400 text-2xl animate-bounce" style={{ animationDelay: "0ms" }}>🔥</span>
                      <span className="text-orange-400 text-xl animate-bounce" style={{ animationDelay: "100ms" }}>🔥</span>
                      <span className="text-orange-400 text-lg animate-bounce" style={{ animationDelay: "200ms" }}>🔥</span>
                    </div>
                  )}
                  {/* Speed lines when moving */}
                  {player.position > 0 && (
                    <div className="absolute -left-16 top-1/2 -translate-y-1/2 flex gap-0.5">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-0.5 bg-white/30 rounded-full animate-pulse" style={{ width: `${8 + i * 4}px`, animationDelay: `${i * 100}ms` }} />
                      ))}
                    </div>
                  )}
                  <img src={carBlack} alt={player.name} draggable={false}
                    className="h-24 w-auto select-none drop-shadow-2xl transition-transform duration-300 hover:scale-105"
                    style={{ transform: "rotate(0deg)", filter: "brightness(1.15)" }}
                  />
                  {/* Label below car */}
                  <div className="mt-1 flex items-center justify-center gap-1.5">
                    <span className="rounded-full bg-black/80 px-2.5 py-0.5 text-[12px] font-bold text-white border border-slate-600/50 shadow-lg backdrop-blur-sm">
                      {player.name}
                    </span>
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[12px] font-black text-emerald-300 shadow-lg backdrop-blur-sm">
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
                  style={{ left: `${x}px`, top: "70%", transform: "translateY(-50%)" }}
                >
                  {nitro && (
                    <div className="absolute -right-10 -top-2 flex gap-1">
                      <span className="text-blue-400 text-2xl animate-bounce" style={{ animationDelay: "0ms" }}>💨</span>
                      <span className="text-blue-400 text-xl animate-bounce" style={{ animationDelay: "100ms" }}>💨</span>
                      <span className="text-blue-400 text-lg animate-bounce" style={{ animationDelay: "200ms" }}>💨</span>
                    </div>
                  )}
                  {/* Speed lines when moving */}
                  {player.position > 0 && (
                    <div className="absolute -left-16 top-1/2 -translate-y-1/2 flex gap-0.5">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-0.5 bg-white/30 rounded-full animate-pulse" style={{ width: `${8 + i * 4}px`, animationDelay: `${i * 100}ms` }} />
                      ))}
                    </div>
                  )}
                  <img src={carBlue} alt={player.name} draggable={false}
                    className="h-24 w-auto select-none drop-shadow-2xl transition-transform duration-300 hover:scale-105"
                    style={{ transform: "rotate(0deg)", filter: "brightness(1.15)" }}
                  />
                  <div className="mt-1 flex items-center justify-center gap-1.5">
                    <span className="rounded-full bg-black/80 px-2.5 py-0.5 text-[12px] font-bold text-white border border-blue-500/50 shadow-lg backdrop-blur-sm">
                      {player.name}
                    </span>
                    <span className="rounded-full bg-blue-500/20 border border-blue-500/40 px-2.5 py-0.5 text-[12px] font-black text-blue-300 shadow-lg backdrop-blur-sm">
                      {Math.round(player.position)}%
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ── QUESTION DISPLAY ── */}
          {currentQuestion && (
            <div className="shrink-0 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 px-4 py-3 border-y border-slate-800 backdrop-blur-sm text-center">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-800/80 to-slate-900/80 px-6 py-3 shadow-xl">
                <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${getDifficultyColor(currentQuestion.difficulty)}`}>
                  {getDifficultyIcon(currentQuestion.difficulty)}
                  {currentQuestion.difficulty === "easy" ? "OSON" : currentQuestion.difficulty === "medium" ? "O'RTACHA" : "QIYIN"}
                </span>
                <span className="text-2xl font-black text-white md:text-3xl">{currentQuestion.question}</span>
                <span className="rounded-full border border-yellow-500/30 bg-gradient-to-b from-yellow-500/10 to-yellow-600/10 px-3 py-1 text-sm font-bold text-yellow-300 shadow-inner">
                  +{currentQuestion.points}
                </span>
              </div>
            </div>
          )}

          {/* ── ANSWER RESULT BANNER ── */}
          {answerResult && (
            <div className={`shrink-0 py-2 text-center text-sm font-bold transition-all duration-300 ${
              answerResult.correct 
                ? "bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-emerald-500/20 text-emerald-300 border-b border-emerald-500/20" 
                : "bg-gradient-to-r from-rose-500/20 via-rose-500/10 to-rose-500/20 text-rose-300 border-b border-rose-500/20"
            }`}>
              <div className="flex items-center justify-center gap-2">
                {answerResult.correct ? <FaCheckCircle className="text-emerald-400" /> : <FaTimesCircle className="text-rose-400" />}
                {answerResult.message}
              </div>
            </div>
          )}

          {/* ── PLAYER PANELS ── */}
          <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
            {/* Player 0 Panel */}
            <div className="flex flex-1 flex-col border-b-2 border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-4 lg:border-b-0 lg:border-r-2">
              {/* Player header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="h-3 w-3 rounded-full bg-slate-500 ring-2 ring-slate-400 ring-offset-2 ring-offset-slate-900" />
                  </div>
                  <span className="font-black text-white">{players[0].name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-emerald-300 font-bold flex items-center gap-1">
                    <FaCheckCircle className="text-[10px]" />{stats[0].correct}
                  </span>
                  <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-rose-300 font-bold flex items-center gap-1">
                    <FaTimesCircle className="text-[10px]" />{stats[0].wrong}
                  </span>
                </div>
              </div>

              {/* Combo + Power-ups */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-purple-300 font-bold flex items-center gap-1">
                    🔥{stats[0].streak} combo
                  </span>
                  {stats[0].shieldArmed && (
                    <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-cyan-300 font-bold animate-pulse flex items-center gap-1">
                      <FaShieldAlt className="text-[10px]" /> ARMED
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => activate5050(0)} disabled={locked || stats[0].used5050}
                    title="50/50" className="group relative h-9 w-9 rounded-xl border border-purple-500/30 bg-gradient-to-b from-purple-600/20 to-purple-800/20 text-purple-300 hover:from-purple-600/40 hover:to-purple-800/40 disabled:opacity-40 transition-all text-xs font-bold active:scale-90">
                    <span className="group-hover:scale-110 transition-transform inline-block">½</span>
                  </button>
                  <button onClick={() => activatePlusTime(0)} disabled={locked || stats[0].usedTime}
                    title="+3 sekund" className="group relative h-9 w-9 rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-600/20 to-amber-800/20 text-amber-300 hover:from-amber-600/40 hover:to-amber-800/40 disabled:opacity-40 transition-all active:scale-90">
                    <FaClock size={12} className="mx-auto group-hover:scale-110 transition-transform" />
                  </button>
                  <button onClick={() => activateShield(0)} disabled={locked || stats[0].shieldCharges <= 0 || stats[0].shieldArmed}
                    title="Shield" className="group relative h-9 w-9 rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-600/20 to-cyan-800/20 text-cyan-300 hover:from-cyan-600/40 hover:to-cyan-800/40 disabled:opacity-40 transition-all active:scale-90">
                    <FaShieldAlt size={12} className="mx-auto group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Answer buttons */}
              <div className="grid flex-1 grid-cols-2 gap-2.5">
                {optionsFor(0).map((option, idx) => (
                  <button key={`p0-${idx}`}
                    onClick={() => !locked && handleAnswer(0, option)}
                    disabled={locked}
                    className="group relative overflow-hidden rounded-xl border-2 border-purple-600/30 bg-gradient-to-b from-purple-600/50 to-purple-800/60 px-2 py-4 text-lg font-black text-white shadow-lg transition-all hover:from-purple-500/60 hover:to-purple-700/70 hover:border-purple-400/50 hover:shadow-purple-500/20 disabled:opacity-50 disabled:scale-100 active:scale-95 sm:text-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative">{option}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Player 1 Panel */}
            <div className="flex flex-1 flex-col bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-4">
              {/* Player header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="h-3 w-3 rounded-full bg-blue-500 ring-2 ring-blue-300 ring-offset-2 ring-offset-slate-900" />
                  </div>
                  <span className="font-black text-white">{players[1].name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-emerald-300 font-bold flex items-center gap-1">
                    <FaCheckCircle className="text-[10px]" />{stats[1].correct}
                  </span>
                  <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-rose-300 font-bold flex items-center gap-1">
                    <FaTimesCircle className="text-[10px]" />{stats[1].wrong}
                  </span>
                </div>
              </div>

              {/* Combo + Power-ups */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 text-blue-300 font-bold flex items-center gap-1">
                    🔥{stats[1].streak} combo
                  </span>
                  {stats[1].shieldArmed && (
                    <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-cyan-300 font-bold animate-pulse flex items-center gap-1">
                      <FaShieldAlt className="text-[10px]" /> ARMED
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => activate5050(1)} disabled={locked || stats[1].used5050}
                    title="50/50" className="group relative h-9 w-9 rounded-xl border border-blue-500/30 bg-gradient-to-b from-blue-600/20 to-blue-800/20 text-blue-300 hover:from-blue-600/40 hover:to-blue-800/40 disabled:opacity-40 transition-all text-xs font-bold active:scale-90">
                    <span className="group-hover:scale-110 transition-transform inline-block">½</span>
                  </button>
                  <button onClick={() => activatePlusTime(1)} disabled={locked || stats[1].usedTime}
                    title="+3 sekund" className="group relative h-9 w-9 rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-600/20 to-amber-800/20 text-amber-300 hover:from-amber-600/40 hover:to-amber-800/40 disabled:opacity-40 transition-all active:scale-90">
                    <FaClock size={12} className="mx-auto group-hover:scale-110 transition-transform" />
                  </button>
                  <button onClick={() => activateShield(1)} disabled={locked || stats[1].shieldCharges <= 0 || stats[1].shieldArmed}
                    title="Shield" className="group relative h-9 w-9 rounded-xl border border-cyan-500/30 bg-gradient-to-b from-cyan-600/20 to-cyan-800/20 text-cyan-300 hover:from-cyan-600/40 hover:to-cyan-800/40 disabled:opacity-40 transition-all active:scale-90">
                    <FaShieldAlt size={12} className="mx-auto group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Answer buttons */}
              <div className="grid flex-1 grid-cols-2 gap-2.5">
                {optionsFor(1).map((option, idx) => (
                  <button key={`p1-${idx}`}
                    onClick={() => !locked && handleAnswer(1, option)}
                    disabled={locked}
                    className="group relative overflow-hidden rounded-xl border-2 border-blue-600/30 bg-gradient-to-b from-blue-600/50 to-blue-800/60 px-2 py-4 text-lg font-black text-white shadow-lg transition-all hover:from-blue-500/60 hover:to-blue-700/70 hover:border-blue-400/50 hover:shadow-blue-500/20 disabled:opacity-50 disabled:scale-100 active:scale-95 sm:text-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative">{option}</span>
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
          <div className="w-full max-w-lg animate-scaleIn">
            <div className="rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 p-8 text-center shadow-2xl shadow-yellow-500/10">
              {/* Trophy */}
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-yellow-400/20" />
                  <div className="absolute inset-0 animate-pulse rounded-full bg-yellow-400/10" style={{ animationDelay: "0.5s" }} />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl shadow-orange-500/40">
                    <FaCrown className="text-5xl text-white animate-bounce" style={{ animationDuration: "2s" }} />
                  </div>
                </div>
              </div>

              <h2 className="mb-3 text-4xl font-black text-white">
                {winner !== null ? (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    {players[winner].name} G'OLIB!
                  </span>
                ) : (
                  "DURANG!"
                )}
              </h2>

              {/* Stars */}
              <div className="mb-4 flex justify-center gap-3">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={`text-4xl transition-all duration-500 ${i < stars ? "opacity-100 scale-110 animate-bounce" : "opacity-20 grayscale"}`}
                    style={{ animationDelay: `${i * 0.3}s` }}>
                    ⭐
                  </span>
                ))}
              </div>

              {medal && (
                <div className="mb-6 inline-block rounded-xl border border-yellow-500/30 bg-gradient-to-b from-yellow-500/10 to-yellow-600/10 px-5 py-2 text-lg font-black text-yellow-300 shadow-lg">
                  <div className="flex items-center gap-2">
                    <FaMedal className="text-yellow-400" />
                    {medal}
                  </div>
                </div>
              )}

              {/* Player stats */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                {players.map((player) => {
                  const s = stats[player.id];
                  const isWinner = winner === player.id;
                  return (
                    <div key={player.id} className={`rounded-2xl border p-5 transition-all ${
                      isWinner 
                        ? "border-yellow-500/40 bg-gradient-to-br from-yellow-500/15 to-orange-500/10 shadow-lg shadow-yellow-500/20" 
                        : "border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-900/50"
                    }`}>
                      {isWinner && (
                        <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-3 py-0.5 text-xs font-bold text-yellow-400">
                          <FaTrophy /> G'OLIB
                        </div>
                      )}
                      <p className="font-black text-white text-lg">{player.name}</p>
                      <p className="text-4xl font-black text-white mt-1">{Math.round(player.position)}%</p>
                      <div className="mt-3 flex flex-wrap gap-1.5 justify-center text-xs">
                        <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-emerald-300 font-bold flex items-center gap-1">
                          <FaCheckCircle className="text-[10px]" /> {s.correct}
                        </span>
                        <span className="rounded-full bg-rose-500/20 border border-rose-500/30 px-2.5 py-0.5 text-rose-300 font-bold flex items-center gap-1">
                          <FaTimesCircle className="text-[10px]" /> {s.wrong}
                        </span>
                        <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-2.5 py-0.5 text-purple-300 font-bold flex items-center gap-1">
                          🔥 {s.bestStreak}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row justify-center">
                <button onClick={resetGame}
                  className="group relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-3.5 text-lg font-black text-white shadow-xl shadow-orange-500/30 hover:scale-105 transition-all active:scale-95">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative flex items-center justify-center gap-2">
                    <FaRedo className="group-hover:rotate-180 transition-transform duration-500" />
                    Qayta O'ynash
                  </span>
                </button>
                <button onClick={() => (window.location.href = "/games")}
                  className="group flex-1 rounded-2xl border border-slate-600 bg-gradient-to-b from-slate-800 to-slate-900 px-8 py-3.5 text-lg font-bold text-white hover:from-slate-700 hover:to-slate-800 transition-all active:scale-95 shadow-xl">
                  <span className="flex items-center justify-center gap-2">
                    <FaArrowLeft />
                    O'yinlar
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />

      {/* Custom keyframes for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-bounceIn { animation: bounceIn 0.6s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.5s ease-out; }
        .animate-shake { animation: shake 0.26s ease-in-out; }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
}