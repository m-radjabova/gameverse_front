import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowRight,
  FaUsers,
  FaPhone,
  FaRandom,
  FaHome,
  FaUserPlus,
  FaUserMinus
} from "react-icons/fa";
import { GiMoneyStack } from "react-icons/gi";
import Confetti from "react-confetti-boom";
import millionaireSound from "../../../assets/sounds/millionaire_sound.m4a";
import tadaSound from "../../../assets/sounds/tada.mp3";
import { fetchGameQuestions, saveGameQuestions } from "../../../apiClient/gameQuestions";

type OptionKey = "A" | "B" | "C" | "D";
type Difficulty = "easy" | "medium" | "hard" | "expert";

type Question = {
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

const SAFE_LEVELS = new Set<number>([4, 9, 14]); // 5, 10, 15-pog'onalar

function difficultyForStepIndex(stepIndex: number): Difficulty {
  if (stepIndex <= 3) return "easy";
  if (stepIndex <= 7) return "medium";
  if (stepIndex <= 11) return "hard";
  return "expert";
}

const QUESTION_BANK: Question[] = [
  {
    id: "e1",
    difficulty: "easy",
    category: "Vocabulary",
    text: "'Apple' so'zi nimani anglatadi?",
    options: { A: "Olma", B: "Banan", C: "Uzum", D: "Shaftoli" },
    correct: "A",
  },
  {
    id: "e2",
    difficulty: "easy",
    category: "Daily",
    text: "'Morning' qaysi vaqt?",
    options: { A: "Kechasi", B: "Tushdan keyin", C: "Ertalab", D: "Kechqurun" },
    correct: "C",
  },
  {
    id: "e3",
    difficulty: "easy",
    category: "Grammar",
    text: "I ___ a student.",
    options: { A: "am", B: "is", C: "are", D: "be" },
    correct: "A",
  },
  {
    id: "e4",
    difficulty: "easy",
    category: "Colors",
    text: "Qora rangni ingliz tilida qanday aytiladi?",
    options: { A: "Red", B: "Blue", C: "Black", D: "White" },
    correct: "C",
  },
  {
    id: "e5",
    difficulty: "easy",
    category: "Numbers",
    text: "5 + 3 = ?",
    options: { A: "7", B: "8", C: "9", D: "10" },
    correct: "B",
  },
  {
    id: "m1",
    difficulty: "medium",
    category: "Grammar",
    text: "He ___ to school every day.",
    options: { A: "go", B: "goes", C: "going", D: "gone" },
    correct: "B",
  },
  {
    id: "m2",
    difficulty: "medium",
    category: "Vocabulary",
    text: "'Big' so'zining sinonimi qaysi?",
    options: { A: "Small", B: "Large", C: "Cold", D: "Slow" },
    correct: "B",
  },
  {
    id: "m3",
    difficulty: "medium",
    category: "Grammar",
    text: "Choose the correct: 'I ___ finished my homework.'",
    options: { A: "has", B: "have", C: "having", D: "had been" },
    correct: "B",
  },
  {
    id: "m4",
    difficulty: "medium",
    category: "History",
    text: "O'zbekiston poytaxti qaysi shahar?",
    options: { A: "Samarqand", B: "Buxoro", C: "Toshkent", D: "Xiva" },
    correct: "C",
  },
  {
    id: "m5",
    difficulty: "medium",
    category: "Science",
    text: "Quyoshga eng yaqin sayyora qaysi?",
    options: { A: "Venera", B: "Merkuriy", C: "Mars", D: "Yer" },
    correct: "B",
  },
  {
    id: "h1",
    difficulty: "hard",
    category: "Grammar",
    text: "If I ___ time, I would help you.",
    options: { A: "have", B: "had", C: "will have", D: "has" },
    correct: "B",
  },
  {
    id: "h2",
    difficulty: "hard",
    category: "Vocabulary",
    text: "'Reliable' so'zi eng yaqin ma'nosi?",
    options: { A: "Ishonchli", B: "Zararli", C: "Kuchsiz", D: "Arzon" },
    correct: "A",
  },
  {
    id: "h3",
    difficulty: "hard",
    category: "Reading",
    text: "Which is closest to 'However'?",
    options: { A: "Because", B: "Therefore", C: "But", D: "And" },
    correct: "C",
  },
  {
    id: "h4",
    difficulty: "hard",
    category: "Literature",
    text: "Amir Temur qaysi yillar oralig'ida hukm qilgan?",
    options: { A: "1326-1405", B: "1336-1405", C: "1346-1405", D: "1356-1405" },
    correct: "B",
  },
  {
    id: "h5",
    difficulty: "hard",
    category: "Science",
    text: "Kislorodning kimyoviy formulasi?",
    options: { A: "O2", B: "O3", C: "O", D: "O4" },
    correct: "A",
  },
  {
    id: "x1",
    difficulty: "expert",
    category: "Grammar",
    text: "Hard: 'By the time he arrived, we ___.'",
    options: { A: "left", B: "have left", C: "had left", D: "leave" },
    correct: "C",
  },
  {
    id: "x2",
    difficulty: "expert",
    category: "Vocabulary",
    text: "'Scarce' so'zining ma'nosi?",
    options: { A: "Ko'p", B: "Kam / tanqis", C: "Tez", D: "Yangi" },
    correct: "B",
  },
  {
    id: "x3",
    difficulty: "expert",
    category: "Philosophy",
    text: "'Cogito ergo sum' degan faylasuf kim?",
    options: { A: "Aristotel", B: "Platon", C: "Dekart", D: "Kant" },
    correct: "C",
  },
  {
    id: "x4",
    difficulty: "expert",
    category: "Mathematics",
    text: "Integral hisobini ixtiro qilgan olim?",
    options: { A: "Newton", B: "Leybnits", C: "Eyler", D: "Gauss" },
    correct: "B",
  },
  {
    id: "x5",
    difficulty: "expert",
    category: "History",
    text: "Birinchi jahon urushi qachon tugagan?",
    options: { A: "1917", B: "1918", C: "1919", D: "1920" },
    correct: "B",
  },
];

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
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const skipInitialRemoteSaveRef = useRef(true);
  const [phase, setPhase] = useState<"setup" | "play" | "end">("setup");
  const [names, setNames] = useState<string[]>(["", "", ""]);
  const [questionBank, setQuestionBank] = useState<Question[]>(QUESTION_BANK);
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [answeringPlayerIndex, setAnsweringPlayerIndex] = useState<number | null>(null);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<OptionKey | null>(null);
  const [reveal, setReveal] = useState(false);
  const [message, setMessage] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [winners, setWinners] = useState<PlayerState[]>([]);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [resultModal, setResultModal] = useState<{ correct: boolean; message: string } | null>(null);

  // Lifelines
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

  function clamp3to5(arr: string[]) {
    let a = arr.slice(0, 5);
    while (a.length < 3) a.push("");
    return a;
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
    setMessage("Savol qo'shildi va backendga saqlanadi.");
  }

  function removeTeacherQuestion(id: string) {
    setQuestionBank((prev) => prev.filter((q) => q.id !== id));
    setMessage("Savol o'chirildi va backendga saqlanadi.");
  }

  function start() {
    const cleaned = clamp3to5(names).map((x) => x.trim()).filter(Boolean);
    if (cleaned.length < 3) {
      setMessage("Kamida 3 ta o'yinchi ismi kiriting.");
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
    setAnsweringPlayerIndex(null);
    setSelectedAnswer(null);
    setReveal(false);
    setMessage("Savol uchun birinchi bo'lib o'yinchi tanlang.");
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
      setMessage("Savollar topilmadi. Avval o'qituvchi savol qo'shsin.");
      return;
    }

    const firstQuestion = pickQuestion(questionBank, difficultyForStepIndex(0), new Set());
    if (!firstQuestion) {
      setMessage("Savol tanlab bo'lmadi. Savollarni tekshiring.");
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
    setResultModal(null);
    setSelectedAnswer(null);
    setReveal(false);
    prepareNextRound();
  }

  function loadQuestionForPlayer(player: PlayerState) {
    const diff = difficultyForStepIndex(player.currentQuestionIndex);
    const q = pickQuestion(questionBank, diff, usedQuestions);
    if (!q) {
      setQuestion(null);
      setMessage("Savollar yo'q. O'qituvchi savol qo'shishi kerak.");
      return;
    }
    setQuestion(q);
    setUsedQuestions(prev => new Set(prev).add(q.id));
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
    setAnsweringPlayerIndex(null);
    setSelectedAnswer(null);
    setReveal(false);
    setMessage("Savol uchun birinchi bo'lib o'yinchi tanlang.");

    // Lifelenslarni reset qilish
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
    if (phase !== "play" || answeringPlayerIndex !== null || reveal || modalType || resultModal) return;
    const player = players[playerIndex];
    if (!player || !player.isActive || player.hasLost) return;

    setCurrentPlayerIndex(playerIndex);
    setAnsweringPlayerIndex(playerIndex);
    setSelectedAnswer(null);
    setReveal(false);
    setMessage(`${player.name} birinchi tanladi. Javob bering.`);
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
    
    // Zal natijalari
    const correctVote = Math.floor(Math.random() * 30) + 50; // 50-80%
    const remainingVotes = 100 - correctVote;
    
    const results = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
    };
    
    // To'g'ri variantga ko'proq foiz berish
    results[question.correct] = correctVote;
    
    // Qolgan variantlarga taqsimlash
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
      setMessage("Yangi savol topilmadi.");
      return;
    }
    setQuestion(q);
    setUsedQuestions(prev => new Set(prev).add(q.id));
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
    setUsedQuestions(new Set());
    setQuestion(null);
    setSelectedAnswer(null);
    setReveal(false);
    setMessage("");
    setNames(["", "", ""]);
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

  function addPlayer() {
    setNames((p) => (p.length < 5 ? [...p, ""] : p));
  }

  function removePlayer() {
    setNames((p) => (p.length > 3 ? p.slice(0, -1) : p));
  }

  function walkAway() {
    if (!currentPlayer || !currentPlayer.isActive) return;

    // O'yinchining hozirgi yutug'ini saqlab, o'yindan chiqish
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
      case "easy": return "bg-gradient-to-r from-green-600 to-green-500";
      case "medium": return "bg-gradient-to-r from-yellow-600 to-amber-500";
      case "hard": return "bg-gradient-to-r from-orange-600 to-red-500";
      case "expert": return "bg-gradient-to-r from-red-600 to-rose-500";
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#020617] via-[#0b1a33] to-[#020617] text-white overflow-x-hidden">
      {showConfetti && <Confetti mode="boom" particleCount={300} effectCount={1} x={0.5} y={0.3} colors={['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#059669']} />}
      
      {/* Confirm Modal */}
      {modalType === "confirm" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-lg">
          <div className="max-w-md w-full bg-gradient-to-b from-[#1e2b4f] to-[#0f1a2f] rounded-2xl p-8 shadow-2xl border-2 border-yellow-500">
            <h3 className="text-3xl font-black text-yellow-400 mb-6 text-center">JAVOBNI TASDIQLASH</h3>
            
            <div className="mb-8 text-center">
              <div className="text-7xl mb-4 text-yellow-400">?</div>
              <p className="text-xl text-blue-200 mb-2">
                Siz <span className="text-3xl font-bold text-yellow-400 mx-2">{selectedAnswer}</span> variantini tanladingiz.
              </p>
              <p className="text-lg text-blue-300">Bu javobni qabul qilmoqchimisiz?</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={confirmAnswer}
                className="py-4 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-xl hover:from-green-500 hover:to-emerald-500 transition-all border-2 border-green-400"
              >
                ✓ HA
              </button>
              <button
                onClick={cancelAnswer}
                className="py-4 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xl hover:from-red-500 hover:to-rose-500 transition-all border-2 border-red-400"
              >
                ✕ YO'Q
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {resultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-lg">
          <div className="max-w-md w-full bg-gradient-to-b from-[#1e2b4f] to-[#0f1a2f] rounded-2xl p-8 shadow-2xl border-2 border-yellow-500">
            <div className="text-center">
              <div className="text-7xl mb-4">
                {resultModal.correct ? "🎉" : "😢"}
              </div>
              <h3 className={`text-3xl font-black mb-4 ${resultModal.correct ? 'text-green-400' : 'text-red-400'}`}>
                {resultModal.correct ? "TO'G'RI JAVOB!" : "NOTO'G'RI JAVOB"}
              </h3>
              <p className="text-lg text-blue-200 mb-6">{resultModal.message}</p>
              
              {!resultModal.correct && currentPlayer && (
                <div className="mb-6 p-4 bg-blue-900/50 rounded-lg border border-blue-500">
                  <p className="text-sm text-blue-300 mb-2">XAVFSIZ YUTUQ</p>
                  <p className="text-2xl font-bold text-yellow-400">{formatUZS(safeMoney)} so'm</p>
                </div>
              )}
              
              <button
                onClick={closeResultModal}
                className="w-full py-4 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold text-xl hover:from-yellow-400 hover:to-amber-500 transition-all border-2 border-yellow-400"
              >
                DAVOM ETISH
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Setup Phase */}
        {phase === "setup" && (
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block p-4 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full mb-4">
                <GiMoneyStack className="text-5xl text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-transparent bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text mb-2">
                KIM MILLIONER
              </h1>
              <p className="text-xl text-blue-300">bo'lishni xohlaydi?</p>
            </div>

            <div className="mb-10 grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-b from-[#1e2b4f] to-[#0f1a2f] rounded-2xl p-8 shadow-2xl border-2 border-yellow-500">
              <h2 className="text-2xl font-bold text-yellow-400 mb-8 text-center">O'YINCHILAR (3-5 TA)</h2>

              <div className="grid grid-cols-1 gap-4 mb-8">
                {clamp3to5(names).map((val, idx) => (
                  <div key={idx} className="space-y-1">
                    <label className="text-sm font-semibold text-blue-300 ml-2">
                      O'yinchi {idx + 1}
                    </label>
                    <input
                      value={val}
                      onChange={(e) => {
                        const copy = [...names];
                        copy[idx] = e.target.value;
                        setNames(clamp3to5(copy));
                      }}
                      placeholder={`O'yinchi ${idx + 1} ismi...`}
                      className="w-full px-6 py-4 rounded-lg border-2 border-blue-500 bg-blue-900/30 text-white placeholder-blue-300/50 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all text-lg"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={addPlayer}
                  disabled={names.length >= 5}
                  className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 border-2 border-blue-400"
                >
                  <FaUserPlus /> QO'SHISH
                </button>
                <button
                  onClick={removePlayer}
                  disabled={names.length <= 3}
                  className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 border-2 border-blue-400"
                >
                  <FaUserMinus /> O'CHIRISH
                </button>
                <button
                  onClick={start}
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold hover:from-yellow-400 hover:to-amber-500 transition-all border-2 border-yellow-400 flex items-center justify-center gap-2"
                >
                  <GiMoneyStack /> BOSHLASH
                </button>
              </div>

              {message && (
                <div className="p-4 rounded-lg bg-red-500/20 border-2 border-red-500 text-red-300 font-bold text-center">
                  {message}
                </div>
              )}
            </div>

            <div className="mt-6 bg-gradient-to-b from-[#1e2b4f] to-[#0f1a2f] rounded-2xl p-6 shadow-2xl border-2 border-yellow-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-yellow-400">O'QITUVCHI SAVOLLARI</h3>
                <span className="text-sm text-blue-300">Jami: {questionBank.length} ta</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input
                  value={draftQuestion.text}
                  onChange={(e) => setDraftQuestion((p) => ({ ...p, text: e.target.value }))}
                  placeholder="Savol matni..."
                  className="md:col-span-2 px-4 py-3 rounded-lg border-2 border-blue-500 bg-blue-900/30 text-white placeholder-blue-300/50 focus:border-yellow-500 focus:outline-none"
                />
                <input
                  value={draftQuestion.optionA}
                  onChange={(e) => setDraftQuestion((p) => ({ ...p, optionA: e.target.value }))}
                  placeholder="A varianti"
                  className="px-4 py-3 rounded-lg border-2 border-blue-500 bg-blue-900/30 text-white placeholder-blue-300/50 focus:border-yellow-500 focus:outline-none"
                />
                <input
                  value={draftQuestion.optionB}
                  onChange={(e) => setDraftQuestion((p) => ({ ...p, optionB: e.target.value }))}
                  placeholder="B varianti"
                  className="px-4 py-3 rounded-lg border-2 border-blue-500 bg-blue-900/30 text-white placeholder-blue-300/50 focus:border-yellow-500 focus:outline-none"
                />
                <input
                  value={draftQuestion.optionC}
                  onChange={(e) => setDraftQuestion((p) => ({ ...p, optionC: e.target.value }))}
                  placeholder="C varianti"
                  className="px-4 py-3 rounded-lg border-2 border-blue-500 bg-blue-900/30 text-white placeholder-blue-300/50 focus:border-yellow-500 focus:outline-none"
                />
                <input
                  value={draftQuestion.optionD}
                  onChange={(e) => setDraftQuestion((p) => ({ ...p, optionD: e.target.value }))}
                  placeholder="D varianti"
                  className="px-4 py-3 rounded-lg border-2 border-blue-500 bg-blue-900/30 text-white placeholder-blue-300/50 focus:border-yellow-500 focus:outline-none"
                />
                <select
                  value={draftQuestion.correct}
                  onChange={(e) => setDraftQuestion((p) => ({ ...p, correct: e.target.value as OptionKey }))}
                  className="px-4 py-3 rounded-lg border-2 border-blue-500 bg-blue-900/30 text-white focus:border-yellow-500 focus:outline-none"
                >
                  {OPTION_KEYS.map((k) => (
                    <option key={k} value={k}>{k} - to'g'ri javob</option>
                  ))}
                </select>
                <select
                  value={draftQuestion.difficulty}
                  onChange={(e) => setDraftQuestion((p) => ({ ...p, difficulty: e.target.value as Difficulty }))}
                  className="px-4 py-3 rounded-lg border-2 border-blue-500 bg-blue-900/30 text-white focus:border-yellow-500 focus:outline-none"
                >
                  <option value="easy">easy</option>
                  <option value="medium">medium</option>
                  <option value="hard">hard</option>
                  <option value="expert">expert</option>
                </select>
                <input
                  value={draftQuestion.category}
                  onChange={(e) => setDraftQuestion((p) => ({ ...p, category: e.target.value }))}
                  placeholder="Kategoriya (ixtiyoriy)"
                  className="md:col-span-2 px-4 py-3 rounded-lg border-2 border-blue-500 bg-blue-900/30 text-white placeholder-blue-300/50 focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <button
                onClick={addTeacherQuestion}
                className="w-full md:w-auto px-5 py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold hover:from-yellow-400 hover:to-amber-500 transition-all border-2 border-yellow-400"
              >
                SAVOL QO'SHISH (BACKEND)
              </button>

              {draftError && (
                <div className="mt-3 p-3 rounded-lg bg-red-500/20 border border-red-500 text-red-300 text-sm font-semibold">
                  {draftError}
                </div>
              )}

              <div className="mt-4 max-h-64 overflow-y-auto space-y-2 pr-1">
                {questionBank.map((q, idx) => (
                  <div key={q.id} className="p-3 rounded-lg border border-blue-500 bg-blue-900/20">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-blue-300 mb-1">
                          #{idx + 1} | {q.difficulty.toUpperCase()} | {q.category || "General"}
                        </div>
                        <div className="text-sm text-white font-semibold">{q.text}</div>
                      </div>
                      <button
                        onClick={() => removeTeacherQuestion(q.id)}
                        className="px-3 py-1 rounded-md bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold border border-red-400"
                      >
                        O'CHIRISH
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>
        )}

        {/* Play Phase */}
        {phase === "play" && currentPlayer && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Side - Money Ladder */}
            <div className="lg:col-span-3">
              <div className="bg-gradient-to-b from-[#1e2b4f] to-[#0f1a2f] rounded-xl p-4 border-2 border-yellow-500 sticky top-4">
                <h3 className="text-lg font-bold text-yellow-400 mb-4 text-center">PUL POG'ONASI</h3>
                <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                  {[...MONEY_LADDER].reverse().map((amount, idx) => {
                    const reversedIndex = MONEY_LADDER.length - 1 - idx;
                    const isCurrent = reversedIndex === currentPlayer.currentQuestionIndex;
                    const isPassed = reversedIndex < currentPlayer.currentQuestionIndex;
                    const isSafe = SAFE_LEVELS.has(reversedIndex);
                    
                    return (
                      <div
                        key={reversedIndex}
                        className={`
                          relative p-3 rounded-lg text-center transition-all border-2
                          ${isCurrent 
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-600 border-yellow-400 scale-105 shadow-lg' 
                            : isPassed
                            ? 'bg-green-600/30 border-green-500 text-green-300'
                            : 'bg-blue-900/30 border-blue-500 text-blue-300'
                          }
                          ${isSafe && !isCurrent && !isPassed ? 'bg-purple-600/30 border-purple-500' : ''}
                        `}
                      >
                        <div className="font-bold text-lg">{formatUZS(amount)}</div>
                        {isSafe && <div className="text-xs text-purple-300 mt-1">XAVFSIZ</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Center - Game Area */}
            <div className="lg:col-span-6 space-y-6">
              {/* Current Player Info */}
              <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-xl p-6 border-2 border-yellow-500 text-center">
                <div className="text-sm text-blue-200 mb-2">HOZIRGI O'YINCHI</div>
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {answeringPlayerIndex === null ? "TANLANMAGAN" : currentPlayer.name}
                </div>
                {answeringPlayerIndex === null && (
                  <div className="text-sm text-blue-200 mb-2">Birinchi bo'lib tanlagan o'yinchi javob beradi</div>
                )}
                <div className="flex justify-center gap-8">
                  <div>
                    <div className="text-xs text-blue-300">JORIY PUL</div>
                    <div className="text-xl font-bold text-white">
                      {answeringPlayerIndex === null ? "-" : formatUZS(currentMoneyLevel)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-blue-300">XAVFSIZ YUTUQ</div>
                    <div className="text-xl font-bold text-green-400">
                      {answeringPlayerIndex === null ? "-" : formatUZS(safeMoney)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lifelines */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: "50/50", action: useFiftyFifty, active: lifelines.fiftyFifty, icon: "50/50" },
                  { name: "DO'ST", action: usePhoneFriend, active: lifelines.phoneFriend, icon: <FaPhone /> },
                  { name: "ZAL", action: useAskAudience, active: lifelines.askAudience, icon: <FaUsers /> },
                  { name: "ALMASHTIR", action: useSwitchQuestion, active: lifelines.switchQuestion, icon: <FaRandom /> },
                ].map((lifeline, idx) => {
                  const canUse = lifeline.active && answeringPlayerIndex !== null && !!question;
                  return (
                  <button
                    key={idx}
                    onClick={lifeline.action}
                    disabled={!canUse}
                    className={`
                      p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all text-sm font-bold
                      ${canUse
                        ? 'bg-gradient-to-br from-blue-600 to-blue-500 border-yellow-400 text-white hover:from-blue-500 hover:to-blue-400 hover:scale-105'
                        : 'bg-gray-700/30 border-gray-600 text-gray-500 opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <span className="text-xl">{lifeline.icon}</span>
                    <span>{lifeline.name}</span>
                  </button>
                )})}
              </div>

              {/* Question Card */}
              <div className="bg-gradient-to-b from-[#1e2b4f] to-[#0f1a2f] rounded-xl p-8 border-2 border-yellow-500">
                {!question ? (
                  <div className="py-12 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white mb-3">Savol kutilyapti</div>
                    <div className="text-blue-300">O'ng tomondan birinchi bo'lib o'yinchi tanlang.</div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <div className={`px-4 py-2 rounded-lg text-white font-bold ${getDifficultyClass(question.difficulty)}`}>
                        {question.difficulty.toUpperCase()}
                      </div>
                      <div className="text-blue-300 font-semibold">{question.category}</div>
                    </div>

                    <div className="text-2xl md:text-3xl font-bold text-white mb-10 text-center leading-relaxed">
                      {question.text}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {OPTION_KEYS.map((k) => {
                        const isDisabled = disabledOptions.includes(k) || answeringPlayerIndex === null;
                        const isSelected = selectedAnswer === k;
                        
                        return (
                          <div
                            key={k}
                            onClick={() => !isDisabled && chooseAnswer(k)}
                            className={`
                              relative p-5 rounded-lg border-2 transition-all cursor-pointer
                              ${isDisabled
                                ? 'bg-gray-700/30 border-gray-600 opacity-50 cursor-not-allowed'
                                : isSelected
                                ? 'bg-yellow-500/20 border-yellow-500 hover:bg-yellow-500/30'
                                : 'bg-blue-900/30 border-blue-500 hover:border-yellow-500 hover:bg-blue-800/30'
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold text-lg">
                                {k}
                              </div>
                              <div className="text-lg text-white">{question.options[k]}</div>
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
                <div className="p-4 rounded-lg bg-purple-600/20 border-2 border-purple-500 text-purple-200 text-center font-semibold">
                  {message}
                </div>
              )}
            </div>

            {/* Right Side - Players */}
            <div className="lg:col-span-3">
              <div className="bg-gradient-to-b from-[#1e2b4f] to-[#0f1a2f] rounded-xl p-4 border-2 border-yellow-500 sticky top-4">
                <h3 className="text-lg font-bold text-yellow-400 mb-4 text-center">O'YINCHILAR</h3>
                <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {players.map((player, idx) => (
                    <div
                      key={player.id}
                      className={`
                        p-3 rounded-lg border-2 transition-all
                        ${idx === answeringPlayerIndex
                          ? 'bg-yellow-500/20 border-yellow-500'
                          : player.isActive && !player.hasLost
                          ? 'bg-blue-600/20 border-blue-500'
                          : player.hasLost
                          ? 'bg-red-600/20 border-red-500 opacity-60'
                          : 'bg-blue-900/30 border-blue-500'
                        }
                      `}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-white">{player.name}</span>
                        <span className="text-sm font-bold text-yellow-400">{formatUZS(player.totalMoney)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-green-400">correct {player.correctAnswers}</span>
                        <span className="text-red-400">wrong {player.wrongAnswers}</span>
                      </div>
                      {player.isActive && !player.hasLost && (
                        <button
                          onClick={() => claimQuestion(idx)}
                          disabled={answeringPlayerIndex !== null || reveal || !!resultModal || modalType !== null}
                          className="mt-2 w-full py-1.5 rounded-md border border-yellow-400 bg-blue-800/40 text-xs font-bold text-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700/40 transition-all"
                        >
                          {idx === answeringPlayerIndex ? "JAVOB BERMOQDA" : "BIRINCHI TANLAYMAN"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Control Buttons */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={walkAway}
                    disabled={reveal || answeringPlayerIndex === null}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold hover:from-orange-500 hover:to-red-500 transition-all border-2 border-orange-400 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FaHome /> CHIQIB KET
                  </button>
                  <button
                    onClick={nextQuestion}
                    disabled={!!resultModal || modalType !== null}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold hover:from-yellow-400 hover:to-amber-500 transition-all border-2 border-yellow-400 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FaArrowRight /> YANGI SAVOL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* End Phase */}
        {phase === "end" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-b from-[#1e2b4f] to-[#0f1a2f] rounded-2xl p-8 border-2 border-yellow-500 text-center">
              <div className="text-7xl mb-8">🏆</div>

              <h2 className="text-5xl font-black text-transparent bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text mb-8">
                O'YIN TUGADI!
              </h2>

              {/* Winners Podium */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {winners.map((player, idx) => (
                  <div
                    key={player.id}
                    className={`
                      relative p-6 rounded-xl border-2 text-center
                      ${idx === 0 
                        ? 'bg-gradient-to-b from-yellow-500/30 to-transparent border-yellow-500 scale-110' 
                        : idx === 1
                        ? 'bg-gradient-to-b from-gray-400/30 to-transparent border-gray-400'
                        : 'bg-gradient-to-b from-orange-500/30 to-transparent border-orange-500'
                      }
                    `}
                  >
                    <div className="text-4xl mb-2">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{player.name}</h3>
                    <p className="text-2xl font-bold text-yellow-400 mb-2">{formatUZS(player.totalMoney)}</p>
                    <p className="text-sm text-blue-300">
                      correct {player.correctAnswers} | wrong {player.wrongAnswers}
                    </p>
                  </div>
                ))}
              </div>

              {/* All Players */}
              <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500 mb-6">
                <h3 className="text-sm font-bold text-yellow-400 mb-3">BARCHA O'YINCHILAR</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {[...players]
                    .sort((a, b) => b.totalMoney - a.totalMoney)
                    .map((player, idx) => (
                      <div key={player.id} className="bg-blue-800/30 rounded-lg p-2 text-center border border-blue-500">
                        <div className="text-xs text-blue-300 mb-1">#{idx + 1}</div>
                        <div className="text-sm font-bold text-white truncate">{player.name}</div>
                        <div className="text-xs text-yellow-400">{formatUZS(player.totalMoney)}</div>
                      </div>
                    ))}
                </div>
              </div>

              <button
                onClick={resetAll}
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold text-xl hover:from-yellow-400 hover:to-amber-500 transition-all border-2 border-yellow-400"
              >
                <GiMoneyStack className="inline mr-2" /> YANGI O'YIN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Millionaire;
