import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowRight,
  FaUsers,
  FaPhone,
  FaRandom,
  FaHome,
  FaUserPlus,
  FaCheck,
  FaTimes,
  FaTrophy,
  FaCrown,
  FaStar,
  FaShieldAlt,
  FaCoins,
  FaQuestion
} from "react-icons/fa";
import { GiMoneyStack, GiBrain } from "react-icons/gi";
import Confetti from "react-confetti-boom";
import millionaireSound from "../../../assets/sounds/millionaire_sound.m4a";
import tadaSound from "../../../assets/sounds/applause.mp3";
import { fetchGameQuestions, saveGameQuestions } from "../../../hooks/useGameQuestions";
import GameLeaderboardPanel from "../shared/GameLeaderboardPanel";
import { useFinishApplause } from "../../../hooks/useFinishApplause";
import { useGameParticipantMode } from "../../../hooks/useGameParticipantMode";
import { useGameResultSubmission } from "../../../hooks/useGameResultSubmission";
import { QUESTION_BANK } from "./data";

type OptionKey = "A" | "B" | "C" | "D";
type Difficulty = "easy" | "medium" | "hard" | "expert";

export type Question = {
  id: string;
  text: string;
  options: Record<OptionKey, string>;
  correct: OptionKey;
  difficulty: Difficulty;
  category?: string;
};

type QuestionDraft = {
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: OptionKey;
  difficulty: Difficulty;
  category: string;
};

type PlayerState = {
  id: string;
  name: string;
  totalMoney: number;
  correctAnswers: number;
  wrongAnswers: number;
  currentQuestionIndex: number;
  isActive: boolean;
  hasLost: boolean;
  safeLevel: number;
};

type ModalType = "confirm" | "result" | null;

const OPTION_KEYS: OptionKey[] = ["A", "B", "C", "D"];
const MILLIONAIRE_GAME_KEY = "millionaire";

function formatUZS(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const MONEY_LADDER: number[] = [
  20_000,
  50_000,
  100_000,
  200_000,
  300_000,
  500_000,
  800_000,
  1_000_000,
  1_500_000,
  2_000_000,
  3_000_000,
  5_000_000,
  8_000_000,
  10_000_000,
  15_000_000,
];

const SAFE_LEVELS = new Set<number>([4, 9, 14]);

function buildInitialNames(count: number, labels: string[]) {
  const next = Array.from({ length: Math.max(1, Math.min(5, count)) }, (_, index) => {
    const label = labels[index]?.trim();
    return label || "";
  });

  return next;
}

function difficultyForStepIndex(stepIndex: number): Difficulty {
  if (stepIndex <= 3) return "easy";
  if (stepIndex <= 7) return "medium";
  if (stepIndex <= 11) return "hard";
  return "expert";
}

function pickQuestion(
  bank: Question[],
  needed: Difficulty,
  usedIds: Set<string>
): Question | null {
  if (!bank.length) return null;

  const fallbackOrder: Difficulty[] =
    needed === "easy"
      ? ["easy", "medium", "hard", "expert"]
      : needed === "medium"
      ? ["medium", "easy", "hard", "expert"]
      : needed === "hard"
      ? ["hard", "medium", "expert", "easy"]
      : ["expert", "hard", "medium", "easy"];

  for (const d of fallbackOrder) {
    const list = bank.filter((q) => q.difficulty === d && !usedIds.has(q.id));
    if (list.length) return list[Math.floor(Math.random() * list.length)];
  }

  return bank[Math.floor(Math.random() * bank.length)];
}

function Millionaire() {
  const { session, isSinglePlayer, participantCount, primaryName, modeLabel } = useGameParticipantMode({
    gameId: "millionaire",
    fallbackPrimaryName: "O'YINCHI 1",
    fallbackSecondaryName: "O'YINCHI 2",
    singleModeLabel: "1 o'yinchi",
    multiModeLabel: "Jamoaviy",
  });
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const ladderContainerRef = useRef<HTMLDivElement | null>(null);
  const ladderItemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const skipInitialRemoteSaveRef = useRef(true);
  const [phase, setPhase] = useState<"setup" | "play" | "end">("setup");
  useFinishApplause(phase === "end");
  const [names, setNames] = useState<string[]>(() =>
    buildInitialNames(participantCount, session?.participantLabels ?? [primaryName]),
  );
  const [questionBank, setQuestionBank] = useState<Question[]>(QUESTION_BANK);
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [answeringPlayerIndex, setAnsweringPlayerIndex] = useState<number | null>(null);
  const [attemptedPlayerIds, setAttemptedPlayerIds] = useState<Set<string>>(new Set());
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<OptionKey | null>(null);
  const [reveal, setReveal] = useState(false);
  const [message, setMessage] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [winners, setWinners] = useState<PlayerState[]>([]);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [resultModal, setResultModal] = useState<{ correct: boolean; message: string } | null>(null);

  const [lifelines, setLifelines] = useState({
    fiftyFifty: true,
    phoneFriend: true,
    askAudience: true,
    switchQuestion: true,
  });
  const [disabledOptions, setDisabledOptions] = useState<OptionKey[]>([]);
  const [draftQuestion, setDraftQuestion] = useState<QuestionDraft>({
    text: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correct: "A",
    difficulty: "easy",
    category: "",
  });
  const [draftError, setDraftError] = useState("");
  const requiredPlayers = Math.max(1, Math.min(5, participantCount));

  useEffect(() => {
    bgAudioRef.current = new Audio(millionaireSound);
    bgAudioRef.current.volume = 0.35;
    bgAudioRef.current.loop = true;
    winAudioRef.current = new Audio(tadaSound);
    winAudioRef.current.volume = 0.6;

    return () => {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current.currentTime = 0;
      }
      if (winAudioRef.current) {
        winAudioRef.current.pause();
        winAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const remoteQuestions = await fetchGameQuestions<Question>(MILLIONAIRE_GAME_KEY);
      if (!alive) return;
      if (remoteQuestions && remoteQuestions.length > 0) {
        setQuestionBank(remoteQuestions);
      }
      setRemoteLoaded(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!remoteLoaded) return;
    if (skipInitialRemoteSaveRef.current) {
      skipInitialRemoteSaveRef.current = false;
      return;
    }
    const t = window.setTimeout(() => {
      void saveGameQuestions<Question>(MILLIONAIRE_GAME_KEY, questionBank);
    }, 500);
    return () => window.clearTimeout(t);
  }, [questionBank, remoteLoaded]);

  function playSfx(ref: { current: HTMLAudioElement | null }) {
    const audio = ref.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  const currentPlayer = useMemo(() => {
    return players[currentPlayerIndex] || null;
  }, [players, currentPlayerIndex]);

  useEffect(() => {
    if (phase !== "setup") return;
    setNames(buildInitialNames(requiredPlayers, session?.participantLabels ?? [primaryName]));
  }, [requiredPlayers, session, primaryName, phase]);

  useGameResultSubmission(
    phase === "end" && players.length > 0,
    "millionaire",
    players.map((player) => ({
      participant_name: player.name,
      participant_mode: modeLabel,
      score: player.totalMoney,
      metadata: {
        correctAnswers: player.correctAnswers,
        wrongAnswers: player.wrongAnswers,
        safeLevel: player.safeLevel,
      },
    })),
  );

  const currentMoneyLevel = useMemo(() => {
    if (!currentPlayer) return 0;
    return MONEY_LADDER[currentPlayer.currentQuestionIndex] || 0;
  }, [currentPlayer]);

  const safeMoney = useMemo(() => {
    if (!currentPlayer) return 0;
    if (currentPlayer.safeLevel >= 0) {
      return MONEY_LADDER[currentPlayer.safeLevel] || 0;
    }
    return 0;
  }, [currentPlayer]);

  useEffect(() => {
    if (phase !== "play" || !currentPlayer) return;

    const container = ladderContainerRef.current;
    const currentItem = ladderItemRefs.current[currentPlayer.currentQuestionIndex];
    if (!container || !currentItem) return;

    const targetTop =
      currentItem.offsetTop - container.clientHeight + currentItem.clientHeight + 24;

    container.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth",
    });
  }, [currentPlayer, phase]);

  function normalizeNames(arr: string[]) {
    let next = arr.slice(0, requiredPlayers);
    while (next.length < requiredPlayers) next.push("");
    return next;
  }

  function addTeacherQuestion() {
    const text = draftQuestion.text.trim();
    const optionA = draftQuestion.optionA.trim();
    const optionB = draftQuestion.optionB.trim();
    const optionC = draftQuestion.optionC.trim();
    const optionD = draftQuestion.optionD.trim();
    const category = draftQuestion.category.trim();

    if (!text || !optionA || !optionB || !optionC || !optionD) {
      setDraftError("Savol va barcha variantlar to'ldirilishi shart.");
      return;
    }

    const newQuestion: Question = {
      id: `teacher-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text,
      options: {
        A: optionA,
        B: optionB,
        C: optionC,
        D: optionD,
      },
      correct: draftQuestion.correct,
      difficulty: draftQuestion.difficulty,
      category: category || "Teacher",
    };

    setQuestionBank((prev) => [...prev, newQuestion]);
    setDraftQuestion({
      text: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correct: "A",
      difficulty: "easy",
      category: "",
    });
    setDraftError("");
    setMessage("✅ Savol qo'shildi va backendga saqlanadi.");
  }

  function removeTeacherQuestion(id: string) {
    setQuestionBank((prev) => prev.filter((q) => q.id !== id));
    setMessage("🗑️ Savol o'chirildi va backendga saqlanadi.");
  }

  function start() {
    const cleaned = normalizeNames(names).map((x) => x.trim()).filter(Boolean);
    if (cleaned.length < requiredPlayers) {
      setMessage(
        isSinglePlayer
          ? "❌ O'yinchi ismini kiriting."
          : `❌ Kamida ${requiredPlayers} ta o'yinchi ismi kiriting.`,
      );
      return;
    }
    
    const init: PlayerState[] = cleaned.map((name, idx) => ({
      id: `player-${idx}-${Date.now()}`,
      name,
      totalMoney: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      currentQuestionIndex: 0,
      isActive: true,
      hasLost: false,
      safeLevel: -1,
    }));
    
    setPlayers(init);
    setCurrentPlayerIndex(0);
    setAnsweringPlayerIndex(isSinglePlayer ? 0 : null);
    setAttemptedPlayerIds(new Set());
    setSelectedAnswer(null);
    setReveal(false);
    setMessage(
      isSinglePlayer
        ? `${cleaned[0]} savolga javob beradi.`
        : "👆 Savol uchun birinchi bo'lib o'yinchi tanlang.",
    );
    setShowConfetti(false);
    setWinners([]);
    setDisabledOptions([]);
    setLifelines({
      fiftyFifty: true,
      phoneFriend: true,
      askAudience: true,
      switchQuestion: true,
    });

    if (questionBank.length === 0) {
      setMessage("📚 Savollar topilmadi. Avval o'qituvchi savol qo'shsin.");
      return;
    }

    const firstQuestion = pickQuestion(questionBank, difficultyForStepIndex(0), new Set());
    if (!firstQuestion) {
      setMessage("❌ Savol tanlab bo'lmadi. Savollarni tekshiring.");
      return;
    }
    setQuestion(firstQuestion);
    setUsedQuestions(new Set([firstQuestion.id]));
    playSfx(bgAudioRef);
    setPhase("play");
  }

  function chooseAnswer(k: OptionKey) {
    if (phase !== "play" || reveal || !currentPlayer || !question || answeringPlayerIndex === null) return;
    
    setSelectedAnswer(k);
    setModalType("confirm");
  }

  function confirmAnswer() {
    if (!selectedAnswer || !question || !currentPlayer || answeringPlayerIndex === null) return;
    
    setModalType(null);
    setReveal(true);
    
    const isCorrect = selectedAnswer === question.correct;
    
    let newSafeLevel = currentPlayer.safeLevel;
    if (isCorrect && SAFE_LEVELS.has(currentPlayer.currentQuestionIndex)) {
      newSafeLevel = currentPlayer.currentQuestionIndex;
    }
    
    setPlayers(prev => prev.map(p => {
      if (p.id === currentPlayer.id) {
        const reachedTop = isCorrect && p.currentQuestionIndex >= MONEY_LADDER.length - 1;
        const nextQuestionIndex = isCorrect && !reachedTop
          ? p.currentQuestionIndex + 1
          : p.currentQuestionIndex;

        return {
          ...p,
          totalMoney: isCorrect ? p.totalMoney + currentMoneyLevel : p.totalMoney,
          correctAnswers: isCorrect ? p.correctAnswers + 1 : p.correctAnswers,
          wrongAnswers: !isCorrect ? p.wrongAnswers + 1 : p.wrongAnswers,
          currentQuestionIndex: nextQuestionIndex,
          hasLost: p.hasLost,
          isActive: reachedTop ? false : p.isActive,
          safeLevel: newSafeLevel,
        };
      }
      return p;
    }));

    if (!isCorrect) {
      setAttemptedPlayerIds((prev) => new Set(prev).add(currentPlayer.id));
    }

    setResultModal({
      correct: isCorrect,
      message: isCorrect 
        ? `✅ ${currentPlayer.name} to'g'ri javob berdi! +${formatUZS(currentMoneyLevel)} so'm`
        : `❌ ${currentPlayer.name} noto'g'ri javob berdi!`,
    });
  }

  function cancelAnswer() {
    setModalType(null);
    setSelectedAnswer(null);
  }

  function closeResultModal() {
    const wasCorrect = resultModal?.correct === true;
    const lastAnsweringPlayer = currentPlayer;
    setResultModal(null);
    setSelectedAnswer(null);
    setReveal(false);

    if (wasCorrect) {
      prepareNextRound();
      return;
    }

    const attemptedWithCurrent = new Set(attemptedPlayerIds);
    if (lastAnsweringPlayer) {
      attemptedWithCurrent.add(lastAnsweringPlayer.id);
    }

    const remainingPlayers = players.some(
      (p) => p.isActive && !p.hasLost && !attemptedWithCurrent.has(p.id)
    );

    if (remainingPlayers) {
      setAnsweringPlayerIndex(null);
      setDisabledOptions([]);
      setLifelines({
        fiftyFifty: true,
        phoneFriend: true,
        askAudience: true,
        switchQuestion: true,
      });
      setMessage("🔄 Noto'g'ri javob. Shu savol ochiq, boshqa o'yinchi javob berishi mumkin.");
      return;
    }

    setMessage("⏭️ Barcha o'yinchilar urinib bo'ldi. Keyingi savolga o'tiladi.");
    prepareNextRound();
  }

  function loadQuestionForPlayer(player: PlayerState) {
    const diff = difficultyForStepIndex(player.currentQuestionIndex);
    const q = pickQuestion(questionBank, diff, usedQuestions);
    if (!q) {
      setQuestion(null);
      setMessage("📚 Savollar yo'q. O'qituvchi savol qo'shishi kerak.");
      return;
    }
    setQuestion(q);
    setUsedQuestions(prev => new Set(prev).add(q.id));
    setAttemptedPlayerIds(new Set());
  }

  function firstActiveIndex(sourcePlayers: PlayerState[]) {
    return sourcePlayers.findIndex((p) => p.isActive && !p.hasLost);
  }

  function prepareNextRound(sourcePlayers: PlayerState[] = players) {
    const activeIndex = firstActiveIndex(sourcePlayers);
    if (activeIndex === -1) {
      endGame();
      return;
    }

    setCurrentPlayerIndex(activeIndex);
    setAnsweringPlayerIndex(isSinglePlayer ? activeIndex : null);
    setSelectedAnswer(null);
    setReveal(false);
    setMessage(
      isSinglePlayer
        ? `${sourcePlayers[activeIndex].name} savolga javob beradi.`
        : "👆 Savol uchun birinchi bo'lib o'yinchi tanlang.",
    );

    setLifelines({
      fiftyFifty: true,
      phoneFriend: true,
      askAudience: true,
      switchQuestion: true,
    });
    setDisabledOptions([]);
    loadQuestionForPlayer(sourcePlayers[activeIndex]);
  }

  function nextQuestion() {
    prepareNextRound();
  }

  function claimQuestion(playerIndex: number) {
    if (isSinglePlayer) return;
    if (phase !== "play" || answeringPlayerIndex !== null || reveal || modalType || resultModal) return;
    const player = players[playerIndex];
    if (!player || !player.isActive || player.hasLost) return;
    if (attemptedPlayerIds.has(player.id)) return;

    setCurrentPlayerIndex(playerIndex);
    setAnsweringPlayerIndex(playerIndex);
    setSelectedAnswer(null);
    setReveal(false);
    setMessage(`🎤 ${player.name} birinchi tanladi. Javob bering.`);
  }

  function useFiftyFifty() {
    if (!lifelines.fiftyFifty || !question || answeringPlayerIndex === null) return;
    
    const options: OptionKey[] = ["A", "B", "C", "D"];
    const incorrect = options.filter(opt => opt !== question.correct);
    const removeTwo = incorrect.sort(() => 0.5 - Math.random()).slice(0, 2);
    setDisabledOptions(removeTwo);
    setLifelines(prev => ({ ...prev, fiftyFifty: false }));
    setMessage("🔮 50/50 ishlatildi: ikkita noto'g'ri variant o'chirildi.");
  }

  function usePhoneFriend() {
    if (!lifelines.phoneFriend || !question || answeringPlayerIndex === null) return;
    
    const hints = [
      `📞 Do'stingiz: "Menimcha ${question.correct} javobi to'g'ri!"`,
      `📞 Do'stingiz: "${question.correct} bo'lishi mumkin, lekin ishonchim komil emas."`,
      `📞 Do'stingiz: "Men bu savolga ${question.correct} deb javob bergan bo'lardim."`,
      `📞 Do'stingiz: "O'ylaymanki, ${question.correct} to'g'ri javob."`,
    ];
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    
    setLifelines(prev => ({ ...prev, phoneFriend: false }));
    setMessage(randomHint);
  }

  function useAskAudience() {
    if (!lifelines.askAudience || !question || answeringPlayerIndex === null) return;
    
    const correctVote = Math.floor(Math.random() * 30) + 50;
    const remainingVotes = 100 - correctVote;
    
    const results = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
    };
    
    results[question.correct] = correctVote;
    
    const otherOptions = OPTION_KEYS.filter(k => k !== question.correct);
    otherOptions.forEach((opt, idx) => {
      if (idx === otherOptions.length - 1) {
        results[opt] = remainingVotes - Object.values(results).reduce((a, b) => a + b, 0);
      } else {
        results[opt] = Math.floor(Math.random() * remainingVotes / 2);
      }
    });
    
    const audienceMessage = `👥 Zal natijalari: A: ${results.A}%, B: ${results.B}%, C: ${results.C}%, D: ${results.D}%`;
    
    setLifelines(prev => ({ ...prev, askAudience: false }));
    setMessage(audienceMessage);
  }

  function useSwitchQuestion() {
    if (!lifelines.switchQuestion || !question || !currentPlayer || answeringPlayerIndex === null) return;
    
    const diff = difficultyForStepIndex(currentPlayer.currentQuestionIndex);
    const q = pickQuestion(questionBank, diff, usedQuestions);
    if (!q) {
      setMessage("❌ Yangi savol topilmadi.");
      return;
    }
    setQuestion(q);
    setUsedQuestions(prev => new Set(prev).add(q.id));
    setAttemptedPlayerIds(new Set());
    setDisabledOptions([]);
    setLifelines(prev => ({ ...prev, switchQuestion: false }));
    setMessage("🔄 Savol almashtirildi!");
  }

  function endGame() {
    const sorted = [...players].sort((a, b) => b.totalMoney - a.totalMoney);
    setWinners(sorted.slice(0, 3));
    setShowConfetti(true);
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
      bgAudioRef.current.currentTime = 0;
    }
    playSfx(winAudioRef);
    setPhase("end");
  }

  function resetAll() {
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
      bgAudioRef.current.currentTime = 0;
    }
    setPhase("setup");
    setPlayers([]);
    setCurrentPlayerIndex(0);
    setAnsweringPlayerIndex(null);
    setAttemptedPlayerIds(new Set());
    setUsedQuestions(new Set());
    setQuestion(null);
    setSelectedAnswer(null);
    setReveal(false);
    setMessage("");
    setNames(buildInitialNames(requiredPlayers, session?.participantLabels ?? [primaryName]));
    setShowConfetti(false);
    setWinners([]);
    setDisabledOptions([]);
    setLifelines({
      fiftyFifty: true,
      phoneFriend: true,
      askAudience: true,
      switchQuestion: true,
    });
  }

  function walkAway() {
    if (!currentPlayer || !currentPlayer.isActive) return;

    const updatedPlayers = players.map(p => {
      if (p.id === currentPlayer.id) {
        return {
          ...p,
          isActive: false,
        };
      }
      return p;
    });

    setPlayers(updatedPlayers);
    prepareNextRound(updatedPlayers);
  }

  const getDifficultyClass = (difficulty: Difficulty) => {
    switch(difficulty) {
      case "easy": return "bg-gradient-to-r from-green-500 to-emerald-500 border-green-400";
      case "medium": return "bg-gradient-to-r from-yellow-500 to-amber-500 border-yellow-400";
      case "hard": return "bg-gradient-to-r from-orange-500 to-red-500 border-orange-400";
      case "expert": return "bg-gradient-to-r from-red-500 to-rose-500 border-red-400";
    }
  };

  const getDifficultyIcon = (difficulty: Difficulty) => {
    switch(difficulty) {
      case "easy": return "🌟";
      case "medium": return "⭐⭐";
      case "hard": return "⭐⭐⭐";
      case "expert": return "🔥";
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0f1e] via-[#0e1a2b] to-[#0a0f1e] text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgMTBhMjAgMjAgMCAwIDEgMjAgMjAgMjAgMjAgMCAwIDEtNDAgMCAyMCAyMCAwIDAgMSAyMC0yMHoiIGZpbGw9InJnYmEoMjUxLCAxOTEsIDM2LCAwLjA1KSIgLz48L3N2Zz4=')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/5 via-transparent to-transparent" />
      </div>

      {showConfetti && (
        <Confetti 
          mode="boom" 
          particleCount={500} 
          effectCount={2} 
          x={0.5} 
          y={0.3} 
          colors={['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#10b981', '#3b82f6']} 
        />
      )}
      
      {/* Confirm Modal */}
      {modalType === "confirm" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
          <div className="max-w-md w-full bg-gradient-to-b from-[#1a2639] to-[#0f1a2f] rounded-3xl p-8 shadow-2xl border-2 border-yellow-500 animate-in zoom-in-50 duration-300">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full p-4 shadow-xl">
                <FaQuestion className="text-3xl text-white" />
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-yellow-400 mt-8 mb-6 text-center">
              JAVOBNI TASDIQLASH
            </h3>
            
            <div className="mb-8 text-center">
              <div className="text-8xl mb-4 text-yellow-400 animate-pulse">{selectedAnswer}</div>
              <p className="text-xl text-blue-200 mb-2">
                Siz <span className="text-3xl font-bold text-yellow-400 mx-2">{selectedAnswer}</span> variantini tanladingiz.
              </p>
              <p className="text-lg text-blue-300">Bu javobni qabul qilmoqchimisiz?</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={confirmAnswer}
                className="group relative py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xl hover:from-green-400 hover:to-emerald-400 transition-all border-2 border-green-400 overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                <span className="relative flex items-center justify-center gap-2">
                  <FaCheck /> HA
                </span>
              </button>
              <button
                onClick={cancelAnswer}
                className="group relative py-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold text-xl hover:from-red-400 hover:to-rose-400 transition-all border-2 border-red-400 overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                <span className="relative flex items-center justify-center gap-2">
                  <FaTimes /> YO'Q
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {resultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
          <div className={`max-w-md w-full bg-gradient-to-b from-[#1a2639] to-[#0f1a2f] rounded-3xl p-8 shadow-2xl border-2 ${resultModal.correct ? 'border-green-500' : 'border-red-500'} animate-in zoom-in-50 duration-300`}>
            <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 ${resultModal.correct ? 'bg-green-500' : 'bg-red-500'} rounded-full p-4 shadow-xl`}>
              {resultModal.correct ? (
                <FaTrophy className="text-3xl text-white" />
              ) : (
                <FaTimes className="text-3xl text-white" />
              )}
            </div>
            
            <div className="text-center mt-8">
              <div className="text-7xl mb-4">
                {resultModal.correct ? "🎉" : "😢"}
              </div>
              <h3 className={`text-3xl font-black mb-4 ${resultModal.correct ? 'text-green-400' : 'text-red-400'}`}>
                {resultModal.correct ? "TO'G'RI JAVOB!" : "NOTO'G'RI JAVOB"}
              </h3>
              <p className="text-lg text-blue-200 mb-6">{resultModal.message}</p>
              
              {!resultModal.correct && currentPlayer && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl border-2 border-blue-500">
                  <div className="flex items-center justify-center gap-2 text-sm text-blue-300 mb-2">
                    <FaShieldAlt className="text-yellow-400" />
                    <span>XAVFSIZ YUTUQ</span>
                  </div>
                  <p className="text-3xl font-bold text-yellow-400">{formatUZS(safeMoney)} so'm</p>
                </div>
              )}
              
              <button
                onClick={closeResultModal}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold text-xl hover:from-yellow-400 hover:to-amber-400 transition-all border-2 border-yellow-400"
              >
                DAVOM ETISH
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
        {/* Setup Phase */}
        {phase === "setup" && (
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block p-6 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full mb-4 shadow-2xl animate-bounce">
                <GiMoneyStack className="text-6xl text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 bg-clip-text mb-2">
                KIM MILLIONER
              </h1>
              <p className="text-2xl text-blue-300">bo'lishni xohlaydi?</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Player Setup */}
              <div className="bg-gradient-to-b from-[#1a2639] to-[#0f1a2f] rounded-3xl p-8 shadow-2xl border-2 border-yellow-500/50 hover:border-yellow-500 transition-colors">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl">
                    <FaUsers className="text-2xl text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-yellow-400">
                    {isSinglePlayer ? "O'YINCHI" : `O'YINCHILAR (${requiredPlayers} TA)`}
                  </h2>
                </div>

                <div className="mb-5 rounded-2xl border-2 border-blue-500/40 bg-blue-900/20 px-5 py-4 backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Rejim</p>
                  <p className="mt-1 text-xl font-black text-yellow-400">{isSinglePlayer ? "Solo Millionaire" : `${requiredPlayers} kishilik jamoaviy o'yin`}</p>
                </div>

                <div className="space-y-4 mb-8">
                  {normalizeNames(names).map((val, idx) => (
                    <div key={idx} className="group relative">
                      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-yellow-500 to-amber-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                      <label className="text-sm font-semibold text-blue-300 ml-2 mb-1 block">
                        <FaCrown className={`inline mr-1 ${idx === 0 ? 'text-yellow-400' : 'text-gray-400'}`} />
                        {isSinglePlayer ? "Asosiy o'yinchi" : `O'yinchi ${idx + 1}`}
                      </label>
                      <input
                        value={val}
                        onChange={(e) => {
                          const copy = [...names];
                          copy[idx] = e.target.value;
                          setNames(normalizeNames(copy));
                        }}
                        placeholder={isSinglePlayer ? "O'yinchi ismi..." : `O'yinchi ${idx + 1} ismi...`}
                        className="w-full px-6 py-4 rounded-xl border-2 border-blue-500/50 bg-blue-900/20 text-white placeholder-blue-300/50 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all text-lg backdrop-blur-sm"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={start}
                  className="group relative w-full py-5 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 text-white font-bold text-xl hover:scale-105 transition-all border-2 border-yellow-400 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                  <span className="relative flex items-center justify-center gap-3">
                    <GiMoneyStack className="text-2xl" />
                    O'YINNI BOSHLASH
                  </span>
                </button>

                {message && (
                  <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-2 border-blue-500 text-blue-300 font-bold text-center animate-pulse">
                    {message}
                  </div>
                )}
              </div>

              {/* Right Column - Teacher Questions */}
              <div className="bg-gradient-to-b from-[#1a2639] to-[#0f1a2f] rounded-3xl p-8 shadow-2xl border-2 border-yellow-500/50 hover:border-yellow-500 transition-colors">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <GiBrain className="text-2xl text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-yellow-400">O'QITUVCHI SAVOLLARI</h2>
                </div>

                <div className="space-y-4 mb-4">
                  <input
                    value={draftQuestion.text}
                    onChange={(e) => setDraftQuestion((p) => ({ ...p, text: e.target.value }))}
                    placeholder="Savol matni..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-blue-500/50 bg-blue-900/20 text-white placeholder-blue-300/50 focus:border-yellow-500 focus:outline-none"
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={draftQuestion.optionA}
                      onChange={(e) => setDraftQuestion((p) => ({ ...p, optionA: e.target.value }))}
                      placeholder="A varianti"
                      className="px-4 py-3 rounded-xl border-2 border-blue-500/50 bg-blue-900/20 text-white placeholder-blue-300/50 focus:border-yellow-500 focus:outline-none"
                    />
                    <input
                      value={draftQuestion.optionB}
                      onChange={(e) => setDraftQuestion((p) => ({ ...p, optionB: e.target.value }))}
                      placeholder="B varianti"
                      className="px-4 py-3 rounded-xl border-2 border-blue-500/50 bg-blue-900/20 text-white placeholder-blue-300/50 focus:border-yellow-500 focus:outline-none"
                    />
                    <input
                      value={draftQuestion.optionC}
                      onChange={(e) => setDraftQuestion((p) => ({ ...p, optionC: e.target.value }))}
                      placeholder="C varianti"
                      className="px-4 py-3 rounded-xl border-2 border-blue-500/50 bg-blue-900/20 text-white placeholder-blue-300/50 focus:border-yellow-500 focus:outline-none"
                    />
                    <input
                      value={draftQuestion.optionD}
                      onChange={(e) => setDraftQuestion((p) => ({ ...p, optionD: e.target.value }))}
                      placeholder="D varianti"
                      className="px-4 py-3 rounded-xl border-2 border-blue-500/50 bg-blue-900/20 text-white placeholder-blue-300/50 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <select
                      value={draftQuestion.correct}
                      onChange={(e) => setDraftQuestion((p) => ({ ...p, correct: e.target.value as OptionKey }))}
                      className="px-4 py-3 rounded-xl border-2 border-blue-500/50 bg-blue-900/20 text-white focus:border-yellow-500 focus:outline-none"
                    >
                      {OPTION_KEYS.map((k) => (
                        <option key={k} value={k}>{k} - to'g'ri</option>
                      ))}
                    </select>
                    <select
                      value={draftQuestion.difficulty}
                      onChange={(e) => setDraftQuestion((p) => ({ ...p, difficulty: e.target.value as Difficulty }))}
                      className="px-4 py-3 rounded-xl border-2 border-blue-500/50 bg-blue-900/20 text-white focus:border-yellow-500 focus:outline-none"
                    >
                      <option value="easy">🌟 Oson</option>
                      <option value="medium">⭐⭐ O'rta</option>
                      <option value="hard">⭐⭐⭐ Qiyin</option>
                      <option value="expert">🔥 Ekspert</option>
                    </select>
                    <input
                      value={draftQuestion.category}
                      onChange={(e) => setDraftQuestion((p) => ({ ...p, category: e.target.value }))}
                      placeholder="Kategoriya"
                      className="px-4 py-3 rounded-xl border-2 border-blue-500/50 bg-blue-900/20 text-white placeholder-blue-300/50 focus:border-yellow-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={addTeacherQuestion}
                  className="group relative w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold hover:from-yellow-400 hover:to-amber-400 transition-all border-2 border-yellow-400 mb-4 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                  <span className="relative flex items-center justify-center gap-2">
                    <FaUserPlus /> SAVOL QO'SHISH
                  </span>
                </button>

                {draftError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/20 border-2 border-red-500 text-red-300 text-sm font-semibold">
                    {draftError}
                  </div>
                )}

                <div className="max-h-80 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {questionBank.map((q) => (
                    <div key={q.id} className="group relative p-4 rounded-xl border-2 border-blue-500/30 bg-blue-900/10 hover:border-yellow-500/50 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold text-white ${getDifficultyClass(q.difficulty)}`}>
                              {getDifficultyIcon(q.difficulty)} {q.difficulty.toUpperCase()}
                            </span>
                            <span className="text-xs text-blue-300">{q.category || "General"}</span>
                          </div>
                          <p className="text-sm text-white font-semibold">{q.text}</p>
                        </div>
                        <button
                          onClick={() => removeTeacherQuestion(q.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold border-2 border-red-400 transition-all"
                        >
                          O'CHIRISH
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {isSinglePlayer ? (
              <div className="mt-8">
                <GameLeaderboardPanel
                  gameKey="millionaire"
                  title="Millionaire Solo Leaderboard"
                />
              </div>
            ) : null}
          </div>
        )}

        {/* Play Phase */}
        {phase === "play" && currentPlayer && (
          <div className="grid h-full grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-12">
            {/* Left Side - Money Ladder */}
            <div className="xl:col-span-2">
              <div className="rounded-2xl border-2 border-yellow-500/50 bg-gradient-to-b from-[#1a2639] to-[#0f1a2f] p-4 shadow-2xl xl:sticky xl:top-4">
                <h3 className="text-lg font-bold text-yellow-400 mb-4 text-center flex items-center justify-center gap-2">
                  <GiMoneyStack className="text-xl" />
                  PUL POG'ONASI
                </h3>
                <div
                  ref={ladderContainerRef}
                  className="space-y-2 max-h-[min(56dvh,520px)] overflow-y-auto custom-scrollbar pr-2 xl:max-h-[calc(100dvh-200px)]"
                >
                  {[...MONEY_LADDER].reverse().map((amount, idx) => {
                    const reversedIndex = MONEY_LADDER.length - 1 - idx;
                    const isCurrent = reversedIndex === currentPlayer.currentQuestionIndex;
                    const isPassed = reversedIndex < currentPlayer.currentQuestionIndex;
                    const isSafe = SAFE_LEVELS.has(reversedIndex);
                    
                    return (
                      <div
                        key={reversedIndex}
                        ref={(element) => {
                          ladderItemRefs.current[reversedIndex] = element;
                        }}
                        className={`
                          relative p-4 rounded-xl text-center transition-all border-2
                          ${isCurrent 
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-600 border-yellow-400 scale-105 shadow-xl animate-pulse' 
                            : isPassed
                            ? 'bg-gradient-to-r from-green-600/30 to-emerald-600/30 border-green-500/50 text-green-300'
                            : 'bg-blue-900/30 border-blue-500/50 text-blue-300'
                          }
                          ${isSafe && !isCurrent && !isPassed ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-purple-500/50' : ''}
                        `}
                      >
                        <div className="font-bold text-lg">{formatUZS(amount)}</div>
                        {isSafe && (
                          <div className="absolute -top-2 -right-2">
                            <FaShieldAlt className="text-purple-400 text-sm" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Center - Game Area */}
            <div className="xl:col-span-7 space-y-6">
              {/* Current Player Info */}
              <div className="relative bg-gradient-to-r from-blue-800/50 via-blue-700/50 to-blue-800/50 rounded-2xl p-6 border-2 border-yellow-500/50 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent rounded-2xl" />
                <div className="relative grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-blue-300 mb-1">HOZIRGI O'YINCHI</div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {answeringPlayerIndex === null ? (isSinglePlayer ? currentPlayer.name : "⚡ TANLANMAGAN") : currentPlayer.name}
                    </div>
                  </div>
                  <div className="text-center border-x-2 border-yellow-500/30">
                    <div className="text-sm text-blue-300 mb-1">JORIY PUL</div>
                    <div className="text-2xl font-bold text-white">
                      {answeringPlayerIndex === null && !isSinglePlayer ? "—" : formatUZS(currentMoneyLevel)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-blue-300 mb-1">XAVFSIZ YUTUQ</div>
                    <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-2">
                      <FaShieldAlt className="text-purple-400" />
                      {answeringPlayerIndex === null && !isSinglePlayer ? "—" : formatUZS(safeMoney)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lifelines */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { 
                    name: "50/50", 
                    action: useFiftyFifty, 
                    active: lifelines.fiftyFifty, 
                    icon: "50/50",
                    color: "from-blue-600 to-blue-500"
                  },
                  { 
                    name: "DO'ST", 
                    action: usePhoneFriend, 
                    active: lifelines.phoneFriend, 
                    icon: <FaPhone />,
                    color: "from-green-600 to-emerald-500"
                  },
                  { 
                    name: "ZAL", 
                    action: useAskAudience, 
                    active: lifelines.askAudience, 
                    icon: <FaUsers />,
                    color: "from-purple-600 to-pink-500"
                  },
                  { 
                    name: "ALMASHTIR", 
                    action: useSwitchQuestion, 
                    active: lifelines.switchQuestion, 
                    icon: <FaRandom />,
                    color: "from-orange-600 to-red-500"
                  },
                ].map((lifeline, idx) => {
                  const canUse = lifeline.active && answeringPlayerIndex !== null && !!question;
                  return (
                  <button
                    key={idx}
                    onClick={lifeline.action}
                    disabled={!canUse}
                    className={`
                      group relative p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all text-sm font-bold overflow-hidden
                      ${canUse
                        ? `bg-gradient-to-br ${lifeline.color} border-yellow-400 text-white hover:scale-105 hover:shadow-xl`
                        : 'bg-gray-700/30 border-gray-600 text-gray-500 opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                    <span className="relative text-2xl">{lifeline.icon}</span>
                    <span className="relative">{lifeline.name}</span>
                  </button>
                )})}
              </div>

              {/* Question Card */}
              <div className="relative bg-gradient-to-b from-[#1a2639] to-[#0f1a2f] rounded-2xl p-8 border-2 border-yellow-500/50 shadow-2xl">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgMTBhMjAgMjAgMCAwIDEgMjAgMjAgMjAgMjAgMCAwIDEtNDAgMCAyMCAyMCAwIDAgMSAyMC0yMHoiIGZpbGw9InJnYmEoMjUxLCAxOTEsIDM2LCAwLjEpIiAvPjwvc3ZnPg==')] opacity-20" />
                
                {!question ? (
                  <div className="py-16 text-center">
                    <div className="text-4xl md:text-5xl font-bold text-white mb-3">🤔 Savol kutilyapti</div>
                    <div className="text-xl text-blue-300">O'ng tomondan birinchi bo'lib o'yinchi tanlang.</div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-8">
                      <div className={`px-4 py-2 rounded-xl text-white font-bold border-2 ${getDifficultyClass(question.difficulty)}`}>
                        <span className="mr-2">{getDifficultyIcon(question.difficulty)}</span>
                        {question.difficulty.toUpperCase()}
                      </div>
                      <div className="flex items-center gap-2 text-blue-300 font-semibold">
                        <FaStar className="text-yellow-400" />
                        {question.category}
                      </div>
                    </div>

                    <div className="mb-8 text-xl font-bold leading-relaxed text-white text-center sm:text-2xl md:text-3xl">
                      {question.text}
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                      {OPTION_KEYS.map((k) => {
                        const isDisabled = disabledOptions.includes(k) || answeringPlayerIndex === null;
                        const isSelected = selectedAnswer === k;
                        
                        return (
                          <div
                            key={k}
                            onClick={() => !isDisabled && chooseAnswer(k)}
                            className={`
                              group relative rounded-xl border-2 p-4 transition-all cursor-pointer overflow-hidden sm:p-6
                              ${isDisabled
                                ? 'bg-gray-700/30 border-gray-600 opacity-50 cursor-not-allowed'
                                : isSelected
                                ? 'bg-yellow-500/20 border-yellow-500 hover:bg-yellow-500/30'
                                : 'bg-blue-900/30 border-blue-500/50 hover:border-yellow-500 hover:bg-blue-800/30 hover:scale-105'
                              }
                            `}
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/10 to-yellow-500/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                              <div className="relative flex items-center gap-3 sm:gap-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 text-lg font-bold text-white shadow-lg sm:h-12 sm:w-12 sm:text-xl">
                                {k}
                              </div>
                              <div className="text-base text-white sm:text-xl">{question.options[k]}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Message */}
              {message && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-500 text-purple-200 text-center font-semibold animate-pulse">
                  {message}
                </div>
              )}
            </div>

            {/* Right Side - Players */}
            <div className="xl:col-span-3">
              <div className="rounded-2xl border-2 border-yellow-500/50 bg-gradient-to-b from-[#1a2639] to-[#0f1a2f] p-4 shadow-2xl xl:sticky xl:top-4">
                <h3 className="text-lg font-bold text-yellow-400 mb-4 text-center flex items-center justify-center gap-2">
                  <FaUsers />
                  {isSinglePlayer ? "SOLO PROFILE" : "O'YINCHILAR"}
                </h3>
                {isSinglePlayer && currentPlayer ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border-2 border-yellow-500/60 bg-gradient-to-br from-yellow-500/15 to-amber-500/10 p-5 text-center">
                      <div className="text-sm uppercase tracking-[0.2em] text-blue-300">Asosiy o'yinchi</div>
                      <div className="mt-2 text-2xl font-black text-yellow-400">{currentPlayer.name}</div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl border border-blue-500/40 bg-blue-900/20 p-3">
                          <div className="text-blue-300">To'g'ri</div>
                          <div className="mt-1 text-xl font-bold text-white">{currentPlayer.correctAnswers}</div>
                        </div>
                        <div className="rounded-xl border border-red-500/40 bg-red-900/10 p-3">
                          <div className="text-red-300">Xato</div>
                          <div className="mt-1 text-xl font-bold text-white">{currentPlayer.wrongAnswers}</div>
                        </div>
                        <div className="rounded-xl border border-emerald-500/40 bg-emerald-900/10 p-3">
                          <div className="text-emerald-300">Yutuq</div>
                          <div className="mt-1 text-lg font-bold text-white">{formatUZS(currentPlayer.totalMoney)}</div>
                        </div>
                        <div className="rounded-xl border border-purple-500/40 bg-purple-900/10 p-3">
                          <div className="text-purple-300">Safe</div>
                          <div className="mt-1 text-lg font-bold text-white">{formatUZS(safeMoney)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                <div className="space-y-3 max-h-[min(52dvh,480px)] overflow-y-auto custom-scrollbar pr-2 xl:max-h-[calc(100dvh-300px)]">
                  {players.map((player, idx) => {
                    const alreadyAttempted = attemptedPlayerIds.has(player.id);
                    const claimDisabled =
                      answeringPlayerIndex !== null ||
                      reveal ||
                      !!resultModal ||
                      modalType !== null ||
                      alreadyAttempted;

                    return (
                    <div
                      key={player.id}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all
                        ${idx === answeringPlayerIndex
                          ? 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30 border-yellow-500 shadow-lg'
                          : player.isActive && !player.hasLost
                          ? 'bg-blue-600/20 border-blue-500/50 hover:border-blue-400'
                          : player.hasLost
                          ? 'bg-red-600/20 border-red-500/50 opacity-60'
                          : 'bg-blue-900/30 border-blue-500/30'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-lg">{player.name}</span>
                          {idx === answeringPlayerIndex && (
                            <span className="text-xs bg-yellow-500 px-2 py-1 rounded-full">🎤</span>
                          )}
                        </div>
                        <span className="text-lg font-bold text-yellow-400">{formatUZS(player.totalMoney)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-400 flex items-center gap-1">
                          <FaCheck className="text-xs" /> {player.correctAnswers}
                        </span>
                        <span className="text-red-400 flex items-center gap-1">
                          <FaTimes className="text-xs" /> {player.wrongAnswers}
                        </span>
                        {player.safeLevel >= 0 && (
                          <span className="text-purple-400">
                            <FaShieldAlt />
                          </span>
                        )}
                      </div>
                      {player.isActive && !player.hasLost && (
                        <button
                          onClick={() => claimQuestion(idx)}
                          disabled={claimDisabled}
                          className="mt-3 w-full py-2.5 rounded-xl border-2 border-yellow-400 bg-blue-800/40 text-sm font-bold text-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700/40 transition-all"
                        >
                          {idx === answeringPlayerIndex
                            ? "⚡ JAVOB BERMOQDA"
                            : alreadyAttempted
                            ? "❌ URINIB BO'LGAN"
                            : "🎯 BIRINCHI TANLAYMAN"}
                        </button>
                      )}
                    </div>
                    );
                  })}
                </div>
                )}

                {/* Control Buttons */}
                <div className="mt-4 space-y-3">
                  <button
                    onClick={walkAway}
                    disabled={reveal || answeringPlayerIndex === null}
                    className="group relative w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold hover:from-orange-500 hover:to-red-500 transition-all border-2 border-orange-400 disabled:opacity-50 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                    <span className="relative flex items-center justify-center gap-2">
                      <FaHome /> CHIQIB KETISH
                    </span>
                  </button>
                  <button
                    onClick={nextQuestion}
                    disabled={!!resultModal || modalType !== null}
                    className="group relative w-full py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold hover:from-yellow-400 hover:to-amber-500 transition-all border-2 border-yellow-400 disabled:opacity-50 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                    <span className="relative flex items-center justify-center gap-2">
                      <FaArrowRight /> YANGI SAVOL
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* End Phase */}
        {phase === "end" && (
          <div className="max-w-6xl mx-auto">
            <div className="relative bg-gradient-to-b from-[#1a2639] to-[#0f1a2f] rounded-3xl p-8 border-4 border-yellow-500 text-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgMTBhMjAgMjAgMCAwIDEgMjAgMjAgMjAgMjAgMCAwIDEtNDAgMCAyMCAyMCAwIDAgMSAyMC0yMHoiIGZpbGw9InJnYmEoMjUxLCAxOTEsIDM2LCAwLjEpIiAvPjwvc3ZnPg==')] opacity-20" />
              
              <div className="relative">
                <div className="text-8xl mb-8 animate-bounce">🏆</div>

                <h2 className="mb-8 text-3xl font-black text-transparent bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 bg-clip-text sm:text-5xl md:mb-12 md:text-7xl">
                  {isSinglePlayer ? "SOLO NATIJA" : "O'YIN TUGADI!"}
                </h2>

                {/* Winners Podium */}
                <div className={`grid grid-cols-1 gap-6 mb-12 items-end ${isSinglePlayer ? "md:grid-cols-1 max-w-md mx-auto" : "md:grid-cols-3"}`}>
                  {winners.map((player, idx) => (
                    <div
                      key={player.id}
                      className={`
                        relative p-8 rounded-2xl border-4 text-center transform transition-all hover:scale-105
                        ${idx === 0 
                          ? 'bg-gradient-to-b from-yellow-500/30 to-transparent border-yellow-500 scale-110 order-2' 
                          : idx === 1
                          ? 'bg-gradient-to-b from-gray-400/30 to-transparent border-gray-400 order-1'
                          : 'bg-gradient-to-b from-orange-500/30 to-transparent border-orange-500 order-3'
                        }
                      `}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <div className={`text-6xl ${idx === 0 ? 'animate-bounce' : ''}`}>
                          {idx === 0 ? '👑' : idx === 1 ? '🥈' : '🥉'}
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mt-8 mb-3">{player.name}</h3>
                      <p className="text-3xl font-bold text-yellow-400 mb-4 flex items-center justify-center gap-2">
                        <FaCoins />
                        {formatUZS(player.totalMoney)}
                      </p>
                      <div className="flex justify-center gap-4 text-sm">
                        <span className="text-green-400">✓ {player.correctAnswers}</span>
                        <span className="text-red-400">✗ {player.wrongAnswers}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* All Players */}
                <div className="bg-blue-900/30 rounded-xl p-6 border-2 border-blue-500 mb-8">
                  <h3 className="text-sm font-bold text-yellow-400 mb-4 flex items-center justify-center gap-2">
                    <FaUsers /> {isSinglePlayer ? "SOLO STATISTIKA" : "BARCHA O'YINCHILAR"}
                  </h3>
                  <div className={`grid gap-3 ${isSinglePlayer ? "grid-cols-1 max-w-sm mx-auto" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-5"}`}>
                    {[...players]
                      .sort((a, b) => b.totalMoney - a.totalMoney)
                      .map((player, idx) => (
                        <div key={player.id} className="bg-blue-800/30 rounded-lg p-3 text-center border-2 border-blue-500/50">
                          <div className="text-xs text-blue-300 mb-1">#{idx + 1}</div>
                          <div className="text-sm font-bold text-white truncate">{player.name}</div>
                          <div className="text-xs text-yellow-400">{formatUZS(player.totalMoney)}</div>
                        </div>
                      ))}
                  </div>
                </div>

                <button
                  onClick={resetAll}
                  className="group relative px-12 py-5 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 text-white font-bold text-2xl hover:scale-105 transition-all border-4 border-yellow-400 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                  <span className="relative flex items-center justify-center gap-3">
                    <GiMoneyStack className="text-3xl" />
                    YANGI O'YIN
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(37, 99, 235, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #fbbf24, #f59e0b);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #fcd34d, #fbbf24);
        }
      `}</style>
    </div>
  );
}

export default Millionaire;
