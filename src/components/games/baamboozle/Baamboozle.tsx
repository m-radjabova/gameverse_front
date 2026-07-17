import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  FaCheck,
  FaRobot,
  FaFire,
  FaPlus,
  FaRedo,
  FaTimes,
  FaTrash,
  FaEdit,
  FaCrown,
  FaDice,
  FaStar,
  FaBolt,
  FaGem,
  FaCog,
  FaUsers,
  FaQuestionCircle,
  FaArrowRight,
  FaSkull,
  FaExchangeAlt,
  FaMagic,
  FaBrain,
  FaLayerGroup,
  FaGamepad,
  FaRocket,
  FaBomb,
  FaLightbulb,
  FaHandPointer,
  FaCheckDouble,
  FaEye,
} from "react-icons/fa";
import { GiSwapBag, GiPodiumWinner, GiPodiumSecond, GiPodiumThird } from "react-icons/gi";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti-boom";
import { fetchGameQuestionsByTeacher, saveGameQuestions } from "../../../hooks/useGameQuestions";
import useContextPro from "../../../hooks/useContextPro";
import { generateBaamboozleQuestions } from "./ai";
import { DEFAULT_QUESTION_BANK } from "./data";
import { GRADE_RANGE_OPTIONS, type GradeRange } from "../../../utils/aiGeneration";

export type QuestionBankItem = {
  question: string;
  answer: string;
};

type TileType = "question" | "burn" | "swap" | "steal" | "double";
type Phase = "setup" | "play";

type Tile = {
  id: number;
  number: number;
  points: number;
  type: TileType;
  question?: string;
  answer?: string;
  opened: boolean;
};

type Team = {
  id: string;
  name: string;
  score: number;
  color: string;
  avatar: string;
};

const STEAL_AMOUNTS = [5, 10, 15];
const BAAMBOOZLE_GAME_KEY = "baamboozle";
const AI_QUESTION_COUNT_OPTIONS = [4, 8, 12, 16, 24] as const;
const AI_DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Oson" },
  { value: "medium", label: "O'rta" },
  { value: "hard", label: "Qiyin" },
  { value: "mixed", label: "Aralash" },
] as const;

const TEAM_AVATARS = ["🦁", "🐯", "🐘", "🦊", "🐼", "🐨"];
const TEAM_COLORS = [
  { primary: "from-blue-500 to-cyan-500", text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", glow: "shadow-blue-500/50" },
  { primary: "from-green-500 to-emerald-500", text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", glow: "shadow-green-500/50" },
  { primary: "from-purple-500 to-pink-500", text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", glow: "shadow-purple-500/50" },
];

const shuffle = <T,>(arr: T[]) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const getGridCols = (boardSize: 16 | 24) => (boardSize === 16 ? 4 : 6);
const getSpecialCount = (boardSize: 16 | 24) => (boardSize === 16 ? 4 : 6);

const buildTiles = (questionBank: QuestionBankItem[], boardSize: 16 | 24): Tile[] => {
  const source = questionBank.length > 0 ? questionBank : DEFAULT_QUESTION_BANK;
  const cols = getGridCols(boardSize);
  const indexes = Array.from({ length: boardSize }, (_, i) => i);
  const specialIndexes = new Set(shuffle(indexes).slice(0, getSpecialCount(boardSize)));
  const specialPool: TileType[] = ["burn", "swap", "steal", "double"];
  const shuffledQuestions = shuffle(source);

  return Array.from({ length: boardSize }, (_, idx) => {
    const number = idx + 1;
    const row = Math.floor(idx / cols);
    const points = (row + 1) * 100;

    if (specialIndexes.has(idx)) {
      return {
        id: number,
        number,
        points,
        type: specialPool[idx % specialPool.length],
        opened: false,
      };
    }

    const q = shuffledQuestions[idx % shuffledQuestions.length];
    return {
      id: number,
      number,
      points,
      type: "question",
      question: q.question,
      answer: q.answer,
      opened: false,
    };
  });
};

interface BaamboozleProps {
  initialQuestions?: QuestionBankItem[];
}

// ─── Optimized Animated Score (uses requestAnimationFrame) ─────────────────
const AnimatedScore = ({ value }: { value: number }) => {
  const displayedRef = useRef(value);
  const [displayed, setDisplayed] = useState(value);

  useEffect(() => {
    const prev = displayedRef.current;
    if (prev === value) return;

    const diff = value - prev;
    const duration = 300;
    const startTime = performance.now();
    const startVal = prev;

    let rafId: number;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(startVal + diff * progress);
      displayedRef.current = current;
      setDisplayed(current);
      if (progress < 1) rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  return <span>{displayed}</span>;
};

// ─── CSS-based Floating Particles (no JS animation loops) ──────────────────
const ParticleStyles = () => (
  <style>{`
    @keyframes float-up {
      0% { transform: translateY(0) scale(0); opacity: 0; }
      20% { opacity: 0.8; }
      100% { transform: translateY(-250px) scale(1); opacity: 0; }
    }
    @keyframes orb-pulse {
      0%, 100% { transform: scale(1); opacity: 0.08; }
      50% { transform: scale(1.15); opacity: 0.18; }
    }
    @keyframes orb-pulse-2 {
      0%, 100% { transform: scale(1.15); opacity: 0.06; }
      50% { transform: scale(1); opacity: 0.14; }
    }
    @keyframes orb-pulse-3 {
      0%, 100% { transform: scale(1); opacity: 0.04; }
      50% { transform: scale(1.3); opacity: 0.10; }
    }
    @keyframes dice-rotate {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(5deg); }
      75% { transform: rotate(-5deg); }
    }
    @keyframes shine-sweep {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(250, 204, 21, 0.3);
      animation: float-up 4s ease-out infinite;
    }
    .game-btn {
      transition: all 0.15s ease;
    }
    .game-btn:active {
      transform: scale(0.97);
    }
    .tile-btn {
      transition: all 0.15s ease;
    }
    .tile-btn:not(:disabled):hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 10px 25px -5px rgba(250, 204, 21, 0.2);
    }
    .tile-btn:not(:disabled):active {
      transform: scale(0.95);
    }
    .pulse-ring {
      animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    @keyframes ping {
      75%, 100% { transform: scale(1.5); opacity: 0; }
    }
  `}</style>
);

// ─── CSS Particles ─────────────────────────────────────────────────────────
const FloatingParticles = () => {
  const particles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      left: `${(i * 8.3 + 3) % 100}%`,
      animationDelay: `${(i * 0.7) % 5}s`,
      animationDuration: `${3 + (i % 3) * 1.5}s`,
    }))
  , []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{ left: p.left, animationDelay: p.animationDelay, animationDuration: p.animationDuration }}
        />
      ))}
    </div>
  );
};

// ─── Tile Icon Map ─────────────────────────────────────────────────────────
const getTileIcon = (type: TileType) => {
  switch (type) {
    case "burn": return <FaFire />;
    case "swap": return <GiSwapBag />;
    case "steal": return <FaBolt />;
    case "double": return <FaGem />;
    default: return <FaStar />;
  }
};

const getTileColor = (type: TileType) => {
  switch (type) {
    case "burn": return { from: "from-red-500", to: "to-orange-500", border: "border-red-400", text: "text-red-300", bg: "bg-red-500/20" };
    case "swap": return { from: "from-green-500", to: "to-emerald-500", border: "border-green-400", text: "text-green-300", bg: "bg-green-500/20" };
    case "steal": return { from: "from-purple-500", to: "to-pink-500", border: "border-purple-400", text: "text-purple-300", bg: "bg-purple-500/20" };
    case "double": return { from: "from-blue-500", to: "to-cyan-500", border: "border-blue-400", text: "text-blue-300", bg: "bg-blue-500/20" };
    default: return { from: "from-yellow-500", to: "to-amber-500", border: "border-yellow-400", text: "text-yellow-300", bg: "bg-yellow-500/20" };
  }
};

const TILE_GRADIENTS = [
  "from-amber-400 via-yellow-400 to-orange-400",
  "from-yellow-400 via-amber-400 to-orange-400",
  "from-orange-400 via-amber-400 to-yellow-400",
  "from-amber-500 via-yellow-500 to-orange-500",
];

const getTileGradient = (tile: Tile, index: number) => {
  if (tile.opened) return "bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 text-gray-500";
  return `bg-gradient-to-br ${TILE_GRADIENTS[index % TILE_GRADIENTS.length]} border-yellow-400/50 text-white`;
};

// ─── Main Component ────────────────────────────────────────────────────────
const Baamboozle: React.FC<BaamboozleProps> = ({ initialQuestions }) => {
  const {
    state: { user, isLoading: isUserLoading },
  } = useContextPro();
  const skipInitialRemoteSaveRef = useRef(true);
  const initialQuestionsRef = useRef<QuestionBankItem[]>(initialQuestions ?? []);
  const [phase, setPhase] = useState<Phase>("setup");
  const [boardSize, setBoardSize] = useState<16 | 24>(16);
  const [teamCount, setTeamCount] = useState<2 | 3>(2);
  const [teamInputs, setTeamInputs] = useState(["Jamoa 1", "Jamoa 2", "Jamoa 3"]);

  const [questionBank, setQuestionBank] = useState<QuestionBankItem[]>(initialQuestionsRef.current);
  const [draft, setDraft] = useState<QuestionBankItem>({ question: "", answer: "" });
  const [questionError, setQuestionError] = useState("");
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [aiTopic, setAiTopic] = useState("");
  const [aiSubject, setAiSubject] = useState("");
  const [aiGradeRange, setAiGradeRange] = useState<GradeRange>("none");
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(8);
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("medium");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [remoteLoaded, setRemoteLoaded] = useState(false);

  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [statusText, setStatusText] = useState("Tayyor holat");
  const [stealTarget, setStealTarget] = useState<string>("");
  const [swapTarget, setSwapTarget] = useState<string>("");
  const [showWinner, setShowWinner] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [scoreAnimations, setScoreAnimations] = useState<{ teamId: string; points: number; type: "plus" | "minus" | "zero" }[]>([]);
  const [lastOpenedTileId, setLastOpenedTileId] = useState<number | null>(null);

  const gameFinished = useMemo(() => tiles.length > 0 && tiles.every((t) => t.opened), [tiles]);
  const currentTeam = teams[currentTeamIndex] ?? { id: "0", name: "Jamoa", score: 0, color: "", avatar: "" };
  const openedCount = tiles.filter((t) => t.opened).length;
  const hasGeminiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY?.trim());

  const leaders = useMemo(() => {
    if (!teams.length) return [];
    const maxScore = Math.max(...teams.map((t) => t.score));
    return teams.filter((t) => t.score === maxScore);
  }, [teams]);

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => b.score - a.score);
  }, [teams]);

  const tileAnimations = useMemo(() => {
    return tiles.map((_, i) => ({
      delay: i * 0.02,
    }));
  }, [tiles.length]);

  useEffect(() => {
    if (gameFinished) {
      const timer = setTimeout(() => {
        setShowWinner(true);
        setShowConfetti(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [gameFinished]);

  useEffect(() => {
    if (isUserLoading) return;

    let alive = true;
    (async () => {
      if (!user?.id) {
        if (initialQuestionsRef.current.length > 0) {
          setQuestionBank(initialQuestionsRef.current);
        }
        setRemoteLoaded(true);
        return;
      }

      const remoteQuestions = await fetchGameQuestionsByTeacher<QuestionBankItem>(BAAMBOOZLE_GAME_KEY, user.id);
      if (!alive) return;
      if (remoteQuestions && remoteQuestions.length > 0) {
        setQuestionBank(remoteQuestions);
      } else if (initialQuestionsRef.current.length > 0) {
        setQuestionBank(initialQuestionsRef.current);
      } else {
        setQuestionBank([]);
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
      void saveGameQuestions<QuestionBankItem>(BAAMBOOZLE_GAME_KEY, questionBank, user.id);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [questionBank, remoteLoaded, user?.id]);

  const addQuestion = () => {
    if (!user?.id) {
      setQuestionError("Iltimos, avval ro'yxatdan o'ting. Keyin savol qo'shishingiz mumkin.");
      return;
    }

    const question = draft.question.trim();
    const answer = draft.answer.trim();

    if (!question || !answer) {
      setQuestionError("Savol va javobni to'liq kiriting.");
      return;
    }

    if (editingQuestionIndex !== null) {
      setQuestionBank((prev) =>
        prev.map((item, index) => (index === editingQuestionIndex ? { question, answer } : item)),
      );
      setDraft({ question: "", answer: "" });
      setEditingQuestionIndex(null);
      setQuestionError("");
      return;
    }

    setQuestionBank((prev) => [...prev, { question, answer }]);
    setDraft({ question: "", answer: "" });
    setQuestionError("");
  };

  const generateWithAi = async () => {
    if (isGeneratingAi) return;
    if (!user?.id) {
      setQuestionError("Iltimos, avval ro'yxatdan o'ting. Keyin AI bilan savol qo'shishingiz mumkin.");
      return;
    }

    setQuestionError("");
    setIsGeneratingAi(true);

    try {
      const generated = await generateBaamboozleQuestions({
        subject: aiSubject,
        topic: aiTopic,
        count: aiQuestionCount,
        difficulty: aiDifficulty,
        gradeRange: aiGradeRange,
      });
      setQuestionBank((prev) => [...prev, ...generated]);
      setDraft({ question: "", answer: "" });
      setEditingQuestionIndex(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI savollar yaratib bo'lmadi.";
      setQuestionError(message);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const removeQuestion = (index: number) => {
    setEditingQuestionIndex((prev) => {
      if (prev === null) return prev;
      if (prev === index) {
        setDraft({ question: "", answer: "" });
        return null;
      }
      return prev > index ? prev - 1 : prev;
    });
    setQuestionBank((prev) => prev.filter((_, i) => i !== index));
  };

  const editQuestion = (index: number) => {
    const item = questionBank[index];
    if (!item) return;
    setEditingQuestionIndex(index);
    setDraft({ question: item.question, answer: item.answer });
    setQuestionError("");
  };

  const openGame = () => {
    if (questionBank.length < 4) {
      setQuestionError("Kamida 4 ta savol kiriting.");
      return;
    }

    const configuredTeams: Team[] = Array.from({ length: teamCount }, (_, idx) => ({
      id: String(idx + 1),
      name: teamInputs[idx].trim() || `Jamoa ${idx + 1}`,
      score: 0,
      color: TEAM_COLORS[idx % TEAM_COLORS.length].primary,
      avatar: TEAM_AVATARS[idx % TEAM_AVATARS.length],
    }));

    const nextTiles = buildTiles(questionBank, boardSize);
    setTeams(configuredTeams);
    setTiles(nextTiles);
    setCurrentTeamIndex(0);
    setSelectedTile(null);
    setShowAnswer(false);
    setShowWinner(false);
    setShowConfetti(false);
    setScoreAnimations([]);
    setLastOpenedTileId(null);
    setStatusText("🎮 O'yin boshlandi! Katak tanlang.");
    setPhase("play");
  };

  const advanceTurn = useCallback(() => {
    setCurrentTeamIndex((prev) => (teams.length ? (prev + 1) % teams.length : 0));
  }, [teams.length]);

  const markOpened = (tileId: number) => {
    setTiles((prev) => prev.map((t) => (t.id === tileId ? { ...t, opened: true } : t)));
    setLastOpenedTileId(tileId);
  };

  const openTile = (tile: Tile) => {
    if (tile.opened || selectedTile || gameFinished) return;
    setSelectedTile(tile);
    setShowAnswer(false);
    setStealTarget("");
    setSwapTarget("");
  };

  const closeTileModal = () => {
    setSelectedTile(null);
    setShowAnswer(false);
    setStealTarget("");
    setSwapTarget("");
  };

  const finishAction = (nextStatus: string) => {
    setStatusText(nextStatus);
    closeTileModal();
    setTimeout(() => {
      advanceTurn();
    }, 500);
  };

  const handleQuestionResult = (correct: boolean) => {
    if (!selectedTile || selectedTile.type !== "question") return;
    markOpened(selectedTile.id);

    if (correct) {
      const points = selectedTile.points;
      setTeams((prev) =>
        prev.map((t, idx) => (idx === currentTeamIndex ? { ...t, score: t.score + points } : t))
      );
      setScoreAnimations((prev) => [...prev, { teamId: currentTeam.id, points, type: "plus" }]);
      finishAction(`✅ ${currentTeam.name} +${points} ball oldi!`);
    } else {
      finishAction(`❌ ${currentTeam.name} javobni topa olmadi.`);
    }
  };

  const runBurn = () => {
    if (!selectedTile || selectedTile.type !== "burn") return;
    markOpened(selectedTile.id);
    const lostScore = currentTeam.score;
    setTeams((prev) => prev.map((t, idx) => (idx === currentTeamIndex ? { ...t, score: 0 } : t)));
    setScoreAnimations((prev) => [...prev, { teamId: currentTeam.id, points: lostScore, type: "zero" }]);
    finishAction(`🔥 ${currentTeam.name} ning barcha ballari kuyib ketdi!`);
  };

  const runDouble = () => {
    if (!selectedTile || selectedTile.type !== "double") return;
    const bonus = selectedTile.points * 2;
    markOpened(selectedTile.id);
    setTeams((prev) => prev.map((t, idx) => (idx === currentTeamIndex ? { ...t, score: t.score + bonus } : t)));
    setScoreAnimations((prev) => [...prev, { teamId: currentTeam.id, points: bonus, type: "plus" }]);
    finishAction(`⚡ ${currentTeam.name} DOUBLE! +${bonus} ball!`);
  };

  const runSwap = () => {
    if (!selectedTile || selectedTile.type !== "swap" || !swapTarget) return;

    const fromIndex = currentTeamIndex;
    const targetIndex = teams.findIndex((t) => t.id === swapTarget);
    if (targetIndex < 0) return;

    markOpened(selectedTile.id);
    setTeams((prev) => {
      const next = [...prev];
      const fromScore = next[fromIndex].score;
      next[fromIndex] = { ...next[fromIndex], score: next[targetIndex].score };
      next[targetIndex] = { ...next[targetIndex], score: fromScore };
      return next;
    });

    finishAction(`🔄 ${currentTeam.name} ${teams[targetIndex].name} bilan ballarni almashtirdi!`);
  };

  const runSteal = (amount: number) => {
    if (!selectedTile || selectedTile.type !== "steal" || !stealTarget) return;

    const fromIndex = teams.findIndex((t) => t.id === stealTarget);
    const toIndex = currentTeamIndex;
    if (fromIndex < 0 || fromIndex === toIndex) return;

    const targetTeam = teams[fromIndex];
    const transfer = Math.min(amount, targetTeam.score);
    markOpened(selectedTile.id);

    setTeams((prev) => {
      const next = [...prev];
      next[fromIndex] = { ...next[fromIndex], score: next[fromIndex].score - transfer };
      next[toIndex] = { ...next[toIndex], score: next[toIndex].score + transfer };
      return next;
    });

    setScoreAnimations((prev) => [
      ...prev,
      { teamId: currentTeam.id, points: transfer, type: "plus" },
      { teamId: targetTeam.id, points: transfer, type: "minus" },
    ]);

    finishAction(`💰 ${currentTeam.name} ${targetTeam.name} dan ${transfer} ball o'g'irladi!`);
  };

  const resetGame = () => {
    const nextTiles = buildTiles(questionBank, boardSize);
    setTiles(nextTiles);
    setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })));
    setCurrentTeamIndex(0);
    setSelectedTile(null);
    setShowAnswer(false);
    setShowWinner(false);
    setShowConfetti(false);
    setScoreAnimations([]);
    setLastOpenedTileId(null);
    setStatusText("🔄 O'yin qayta boshlandi!");
  };

  // ─── SETUP PHASE ─────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-slate-900 via-amber-950/80 to-slate-900 p-6 shadow-2xl md:p-8">
        <ParticleStyles />
        <FloatingParticles />

        {/* CSS Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div
            className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-3xl"
            style={{ background: "rgba(234,179,8,0.12)", animation: "orb-pulse 6s ease-in-out infinite" }}
          />
          <div
            className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full blur-3xl"
            style={{ background: "rgba(234,88,12,0.12)", animation: "orb-pulse-2 6s ease-in-out infinite" }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full blur-3xl"
            style={{ background: "rgba(217,119,6,0.08)", animation: "orb-pulse-3 8s ease-in-out infinite" }}
          />
        </div>

        <div className="relative z-10">
          {/* ── Header ── */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="absolute -inset-2 pulse-ring rounded-full bg-yellow-500/20" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 shadow-lg shadow-yellow-500/30"
                style={{ animation: "dice-rotate 3s ease-in-out infinite" }}>
                <FaDice className="text-3xl text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black text-transparent bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text">
                Baamboozle
              </h1>
              <p className="text-yellow-300/60 flex items-center gap-2">
                <FaGamepad className="text-xs" />
                2-3 jamoa · 16/24 katak · Maxsus kartalar
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* ── LEFT COLUMN: Settings + Teams ── */}
            <div className="space-y-6">
              {/* Game Settings */}
              <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-950/40 to-amber-950/40 p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <FaCog className="text-yellow-400" />
                  </div>
                  <p className="text-sm font-bold text-transparent bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text tracking-wider">
                    O'YIN SOZLAMALARI
                  </p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs text-yellow-300/60 mb-2 font-medium flex items-center gap-1">
                      <FaUsers /> Jamoalar soni
                    </label>
                    <div className="flex gap-3">
                      {[2, 3].map((n) => (
                        <button
                          key={n}
                          onClick={() => setTeamCount(n as 2 | 3)}
                          className={`game-btn flex-1 py-3.5 rounded-xl font-bold ${
                            teamCount === n
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30'
                              : 'bg-yellow-950/50 text-yellow-300/60 border border-yellow-500/20 hover:border-yellow-500/40'
                          }`}
                        >
                          {n} ta jamoa
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-yellow-300/60 mb-2 font-medium flex items-center gap-1">
                      <FaLayerGroup /> Kataklar soni
                    </label>
                    <div className="flex gap-3">
                      {[
                        { value: 16, label: "16 katak", desc: "tez" },
                        { value: 24, label: "24 katak", desc: "uzun" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setBoardSize(opt.value as 16 | 24)}
                          className={`game-btn flex-1 py-3.5 rounded-xl font-bold ${
                            boardSize === opt.value
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30'
                              : 'bg-yellow-950/50 text-yellow-300/60 border border-yellow-500/20 hover:border-yellow-500/40'
                          }`}
                        >
                          <div>{opt.label}</div>
                          <div className="text-xs opacity-70">({opt.desc})</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Names */}
              <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-950/40 to-amber-950/40 p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <FaUsers className="text-yellow-400" />
                  </div>
                  <p className="text-sm font-bold text-transparent bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text tracking-wider">
                    JAMOA NOMLARI
                  </p>
                </div>
                <div className="space-y-3">
                  {Array.from({ length: teamCount }).map((_, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-2xl">{TEAM_AVATARS[idx]}</span>
                      <input
                        value={teamInputs[idx]}
                        onChange={(e) => setTeamInputs((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))}
                        placeholder={`Jamoa ${idx + 1}`}
                        className="w-full rounded-xl border border-yellow-500/20 bg-yellow-950/50 px-4 py-3.5 text-white placeholder-yellow-300/40 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Questions ── */}
            <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-950/40 to-amber-950/40 p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <FaQuestionCircle className="text-yellow-400" />
                </div>
                <p className="text-sm font-bold text-transparent bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text tracking-wider">
                  SAVOLLAR ({questionBank.length})
                </p>
              </div>

              <div className="space-y-4">
                {/* AI Generator */}
                <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 to-blue-950/30 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FaBrain className="text-cyan-400" />
                    <p className="text-sm font-bold text-cyan-300">AI SAVOL GENERATSIYASI</p>
                  </div>
                  <div className="grid gap-2.5 md:grid-cols-2">
                    <textarea
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="Mavzu: kasrlar, hayvonlar, tarix..."
                      className="min-h-[80px] w-full rounded-xl border border-cyan-500/20 bg-slate-950/70 px-4 py-3 text-white placeholder-cyan-300/30 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all md:col-span-2 resize-none"
                    />
                    <input
                      value={aiSubject}
                      onChange={(e) => setAiSubject(e.target.value)}
                      placeholder="Fan: matematika, tarix..."
                      className="w-full rounded-xl border border-cyan-500/20 bg-slate-950/70 px-4 py-3 text-white placeholder-cyan-300/30 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    />
                    <select
                      value={aiGradeRange}
                      onChange={(e) => setAiGradeRange(e.target.value as GradeRange)}
                      className="w-full rounded-xl border border-cyan-500/20 bg-slate-950/70 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
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
                      className="w-full rounded-xl border border-cyan-500/20 bg-slate-950/70 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    >
                      {AI_QUESTION_COUNT_OPTIONS.map((count) => (
                        <option key={count} value={count} className="bg-slate-950">
                          {count} ta savol
                        </option>
                      ))}
                    </select>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value as "easy" | "medium" | "hard" | "mixed")}
                      className="w-full rounded-xl border border-cyan-500/20 bg-slate-950/70 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    >
                      {AI_DIFFICULTY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="bg-slate-950">
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => void generateWithAi()}
                      disabled={!hasGeminiKey || isGeneratingAi}
                      className="md:col-span-2 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3.5 text-white font-bold game-btn hover:from-cyan-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-cyan-500/20"
                    >
                      {isGeneratingAi ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="inline-block" style={{ animation: "dice-rotate 1s linear infinite" }}>
                            <FaRobot />
                          </span>
                          {aiQuestionCount} ta yaratilmoqda...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <FaMagic /> AI bilan {aiQuestionCount} ta yaratish
                        </span>
                      )}
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-cyan-200/60 flex items-center gap-1">
                    <FaLightbulb className="text-cyan-400" />
                    Mavzu va fanni kiriting. AI yaratgan savollar ro'yxatga qo'shiladi.
                  </p>
                </div>

                {/* Manual Question Input */}
                <div className="grid gap-2.5">
                  <input
                    value={draft.question}
                    onChange={(e) => setDraft((prev) => ({ ...prev, question: e.target.value }))}
                    placeholder="Savol matni"
                    className="w-full rounded-xl border border-yellow-500/20 bg-yellow-950/50 px-4 py-3.5 text-white placeholder-yellow-300/40 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition-all"
                  />
                  <input
                    value={draft.answer}
                    onChange={(e) => setDraft((prev) => ({ ...prev, answer: e.target.value }))}
                    placeholder="Javob"
                    className="w-full rounded-xl border border-yellow-500/20 bg-yellow-950/50 px-4 py-3.5 text-white placeholder-yellow-300/40 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition-all"
                  />
                </div>

                <button
                  onClick={addQuestion}
                  className="game-btn w-full py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold hover:from-yellow-400 hover:to-orange-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20"
                >
                  {editingQuestionIndex !== null ? <FaEdit /> : <FaPlus />}
                  {editingQuestionIndex !== null ? "SAVOLNI SAQLASH" : "SAVOL QO'SHISH"}
                </button>

                {editingQuestionIndex !== null && (
                  <button
                    onClick={() => {
                      setEditingQuestionIndex(null);
                      setDraft({ question: "", answer: "" });
                      setQuestionError("");
                    }}
                    className="game-btn w-full py-3 rounded-xl border border-yellow-500/20 bg-yellow-950/50 text-yellow-300 font-bold hover:bg-yellow-900/50 transition-all"
                  >
                    BEKOR QILISH
                  </button>
                )}

                {questionError && (
                  <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm flex items-center gap-2">
                    <FaSkull className="text-red-400" />
                    {questionError}
                  </div>
                )}

                {/* Question List */}
                <div className="max-h-64 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                  {questionBank.map((item, idx) => (
                    <div
                      key={`${item.question}-${idx}`}
                      className="group relative overflow-hidden rounded-xl border border-yellow-500/20 bg-gradient-to-r from-yellow-950/30 to-amber-950/30 p-3.5 transition-all hover:from-yellow-900/40 hover:to-amber-900/40 hover:border-yellow-500/40"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-yellow-500/60">#{idx + 1}</span>
                          </div>
                          <p className="text-sm font-bold text-white line-clamp-2">{item.question}</p>
                          <p className="text-xs text-yellow-300/60 mt-1 flex items-center gap-1">
                            <FaCheck className="text-green-400" size={10} />
                            {item.answer}
                          </p>
                        </div>
                        <div className="ml-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => editQuestion(idx)}
                            className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-all"
                          >
                            <FaEdit size={12} />
                          </button>
                          <button
                            onClick={() => removeQuestion(idx)}
                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={openGame}
                className="game-btn w-full mt-5 py-4 rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 text-white font-black text-lg hover:from-green-400 hover:via-emerald-400 hover:to-green-400 transition-all shadow-xl shadow-green-500/30 flex items-center justify-center gap-3"
              >
                <FaRocket className="text-xl" />
                O'YINNI BOSHLASH
                <FaArrowRight className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── PLAY PHASE ──────────────────────────────────────────────────────────
  return (
    <div className="relative overflow-hidden rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-slate-900 via-amber-950/80 to-slate-900 p-4 shadow-2xl md:p-6 lg:p-8">
      <ParticleStyles />
      <FloatingParticles />

      {showConfetti && (
        <Confetti mode="boom" particleCount={100} effectCount={1} x={0.5} y={0.3}
          colors={['#fbbf24', '#f59e0b', '#ef4444', '#22c55e', '#3b82f6']} />
      )}

      {/* CSS Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div
          className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-3xl"
          style={{ background: "rgba(234,179,8,0.08)", animation: "orb-pulse 6s ease-in-out infinite" }}
        />
        <div
          className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full blur-3xl"
          style={{ background: "rgba(234,88,12,0.08)", animation: "orb-pulse-2 6s ease-in-out infinite" }}
        />
      </div>

      <div className="relative z-10">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 pulse-ring rounded-full bg-yellow-500/20" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/30"
                style={{ animation: "dice-rotate 4s ease-in-out infinite" }}>
                <FaDice className="text-xl text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text">
                Baamboozle
              </h2>
              <p className="text-xs text-yellow-300/60 flex items-center gap-1">
                <FaHandPointer className="text-yellow-400" size={10} />
                Katak ochildi: {openedCount}/{boardSize}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPhase("setup")}
              className="game-btn px-4 py-2.5 rounded-xl bg-yellow-950/50 border border-yellow-500/20 text-yellow-300 hover:bg-yellow-900/50 transition-all flex items-center gap-2 text-sm"
            >
              <FaCog size={14} /> Sozlama
            </button>
            <button
              onClick={resetGame}
              className="game-btn px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold hover:from-yellow-400 hover:to-orange-400 transition-all flex items-center gap-2 text-sm shadow-lg shadow-yellow-500/20"
            >
              <FaRedo /> Qayta
            </button>
          </div>
        </div>

        {/* ── Status Bar ── */}
        <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-yellow-950/40 to-amber-950/40 border border-yellow-500/20 text-center">
          <p className="text-sm font-semibold text-yellow-300" key={statusText}>{statusText}</p>
        </div>

        {/* ── Teams ── */}
        <div className={`grid gap-4 mb-6 ${teams.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {teams.map((team, idx) => {
            const active = idx === currentTeamIndex && !gameFinished;
            const leader = leaders.some((l) => l.id === team.id);
            const scoreAnim = scoreAnimations.find((a) => a.teamId === team.id);
            return (
              <div
                key={team.id}
                className={`
                  relative overflow-hidden rounded-2xl border-2 p-5 transition-all duration-300
                  ${active
                    ? `bg-gradient-to-br ${team.color} border-yellow-400 shadow-2xl ${TEAM_COLORS[idx].glow}`
                    : 'border-yellow-500/20 bg-yellow-950/30'}
                `}
              >
                {/* Active glow - CSS only */}
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"
                    style={{ animation: "orb-pulse 2s ease-in-out infinite" }} />
                )}

                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{team.avatar}</span>
                    <div>
                      <p className="text-lg font-bold text-white">{team.name}</p>
                      <p className="text-xs text-yellow-300/60">
                        {idx === 0 ? "1-JAMOA" : idx === 1 ? "2-JAMOA" : "3-JAMOA"}
                        {active && " · Hozirgi navbat"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-yellow-300/60">Ball</span>
                    <div className="relative">
                      <span className="text-3xl font-bold text-white">
                        <AnimatedScore value={team.score} />
                      </span>
                      {scoreAnim && (
                        <span
                          className={`absolute -top-4 right-0 text-sm font-bold animate-bounce ${
                            scoreAnim.type === "plus" ? "text-green-400" :
                            scoreAnim.type === "minus" ? "text-red-400" : "text-orange-400"
                          }`}
                        >
                          {scoreAnim.type === "plus" ? `+${scoreAnim.points}` :
                           scoreAnim.type === "minus" ? `-${scoreAnim.points}` : "↺ 0"}
                        </span>
                      )}
                    </div>
                  </div>
                  {leader && !active && (
                    <div className="absolute top-2 right-2 text-yellow-500">
                      <FaCrown />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Game Board ── */}
        <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-950/30 to-amber-950/30 p-3 md:p-5 shadow-xl">
          <div className={`grid gap-2.5 md:gap-3 ${boardSize === 16 ? "grid-cols-4" : "grid-cols-4 md:grid-cols-6"}`}>
            {tiles.map((tile, index) => {
              const isLastOpened = tile.id === lastOpenedTileId;
              return (
                <button
                  key={tile.id}
                  disabled={tile.opened || Boolean(selectedTile) || gameFinished}
                  onClick={() => openTile(tile)}
                  className={`
                    tile-btn relative aspect-square rounded-xl border-2 p-2 text-center
                    ${getTileGradient(tile, index)}
                    ${!tile.opened && !selectedTile ? 'cursor-pointer' : 'cursor-default'}
                    ${isLastOpened ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-900' : ''}
                  `}
                  style={tileAnimations[index] ? { animationDelay: `${tileAnimations[index].delay}s` } : undefined}
                >
                  <div className="relative flex h-full flex-col items-center justify-center">
                    {tile.opened ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl md:text-3xl font-black opacity-50">{tile.number}</span>
                        <span className="text-lg opacity-40">{getTileIcon(tile.type)}</span>
                      </div>
                    ) : (
                      <>
                        <span className="text-3xl md:text-4xl font-black drop-shadow-lg">
                          {tile.number}
                        </span>
                        <span className="text-[10px] md:text-xs font-bold text-white/60 mt-0.5">
                          {tile.points} ball
                        </span>
                      </>
                    )}
                  </div>

                  {/* Shine effect on hover - CSS only */}
                  {!tile.opened && (
                    <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        style={{ animation: "shine-sweep 1.5s ease-in-out infinite" }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Winner Modal ── */}
        <AnimatePresence>
          {showWinner && gameFinished && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="relative max-w-lg w-full bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 rounded-3xl border-2 border-yellow-500/30 p-8 shadow-2xl text-center overflow-hidden"
              >
                <div className="absolute inset-0 overflow-hidden" aria-hidden>
                  <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-yellow-500/20 blur-3xl"
                    style={{ animation: "orb-pulse 4s ease-in-out infinite" }} />
                  <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl"
                    style={{ animation: "orb-pulse-2 4s ease-in-out infinite" }} />
                </div>

                <div className="relative">
                  <div className="text-7xl mb-4">🏆</div>

                  <h3 className="text-3xl font-black text-transparent bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text mb-1">
                    O'YIN TUGADI!
                  </h3>
                  <p className="text-yellow-300/60 text-sm mb-6">Barcha kataklar ochildi</p>

                  {/* Podium */}
                  <div className="space-y-3 mb-6">
                    {sortedTeams.map((team, idx) => {
                      const podiumIcons = [<GiPodiumWinner key="w" />, <GiPodiumSecond key="s" />, <GiPodiumThird key="t" />];
                      const podiumColors = [
                        "from-yellow-400 to-amber-400",
                        "from-gray-300 to-gray-400",
                        "from-orange-400 to-amber-500",
                      ];
                      return (
                        <div
                          key={team.id}
                          className={`flex items-center justify-between p-4 rounded-xl bg-gradient-to-r ${podiumColors[idx]} bg-opacity-10 border border-yellow-500/20`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{podiumIcons[idx]}</span>
                            <div className="text-left">
                              <p className="font-bold text-white">{team.name}</p>
                              <p className="text-xs text-yellow-300/60">{team.avatar} {idx === 0 ? "G'olib!" : idx === 1 ? "2-o'rin" : "3-o'rin"}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black text-white">{team.score}</p>
                            <p className="text-xs text-yellow-300/60">ball</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={resetGame}
                    className="game-btn w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg hover:from-yellow-400 hover:to-orange-400 transition-all shadow-xl shadow-yellow-500/30 flex items-center justify-center gap-2"
                  >
                    <FaRedo /> YANA O'YNASh
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tile Modal ── */}
        <AnimatePresence>
          {selectedTile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative max-w-2xl w-full bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 rounded-3xl border-2 border-yellow-500/30 p-6 shadow-2xl md:p-8 overflow-hidden"
              >
                <div className="absolute inset-0 overflow-hidden" aria-hidden>
                  <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-yellow-500/20 blur-3xl"
                    style={{ animation: "orb-pulse 4s ease-in-out infinite" }} />
                  <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl"
                    style={{ animation: "orb-pulse-2 4s ease-in-out infinite" }} />
                </div>

                <div className="relative">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${getTileColor(selectedTile.type).bg}`}>
                        <div className={`text-2xl ${getTileColor(selectedTile.type).text}`}>
                          {getTileIcon(selectedTile.type)}
                        </div>
                      </div>
                      <div>
                        <p className="text-xl font-black text-white">Katak #{selectedTile.number}</p>
                        <p className={`text-xs ${getTileColor(selectedTile.type).text}`}>
                          {selectedTile.type === "question" ? "Oddiy savol" :
                           selectedTile.type === "burn" ? "🔥 BAAMBOOZLE!" :
                           selectedTile.type === "double" ? "⚡ DOUBLE!" :
                           selectedTile.type === "swap" ? "🔄 ALMAShTIRISh" :
                           "⚡ O'G'IRLASh"} · {selectedTile.points} ball
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeTileModal}
                      className="game-btn p-2 rounded-lg bg-yellow-950/50 border border-yellow-500/20 text-yellow-300 hover:bg-yellow-900/50 transition-all"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {/* Question Tile */}
                  {selectedTile.type === "question" && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-yellow-500/20 bg-gradient-to-br from-yellow-950/30 to-amber-950/30 p-5">
                        <p className="text-xs text-yellow-300/60 mb-2 flex items-center gap-1">
                          <FaQuestionCircle /> Savol
                        </p>
                        <p className="text-lg md:text-xl font-bold text-white leading-relaxed">{selectedTile.question}</p>
                      </div>

                      {!showAnswer ? (
                        <button
                          onClick={() => setShowAnswer(true)}
                          className="game-btn w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold hover:from-yellow-400 hover:to-orange-400 transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2"
                        >
                          <FaEye /> Javobni ko'rsatish
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div className="rounded-xl border border-green-500/20 bg-gradient-to-br from-green-950/30 to-emerald-950/30 p-5">
                            <p className="text-xs text-green-300/60 mb-2 flex items-center gap-1">
                              <FaCheckDouble /> Javob
                            </p>
                            <p className="text-lg md:text-xl font-bold text-green-400">{selectedTile.answer}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => handleQuestionResult(true)}
                              className="game-btn py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:from-green-400 hover:to-emerald-400 transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                            >
                              <FaCheck /> To'g'ri
                            </button>
                            <button
                              onClick={() => handleQuestionResult(false)}
                              className="game-btn py-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold hover:from-red-400 hover:to-rose-400 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                            >
                              <FaTimes /> Noto'g'ri
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Burn Tile */}
                  {selectedTile.type === "burn" && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-red-500/20 bg-gradient-to-br from-red-950/30 to-orange-950/30 p-6 text-center">
                        <FaFire className="text-6xl text-red-400 mx-auto mb-4" />
                        <p className="text-2xl font-black text-red-400 mb-2">🔥 BAAMBOOZLE!</p>
                        <p className="text-white/80 text-lg">
                          {currentTeam.name} ning barcha ballari kuyib ketadi!
                        </p>
                        {currentTeam.score > 0 && (
                          <p className="text-red-300 font-bold text-xl mt-2">
                            -{currentTeam.score} ball
                          </p>
                        )}
                      </div>
                      <button
                        onClick={runBurn}
                        className="game-btn w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold hover:from-red-400 hover:to-rose-400 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                      >
                        <FaBomb /> Qo'llash
                      </button>
                    </div>
                  )}

                  {/* Double Tile */}
                  {selectedTile.type === "double" && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-950/30 to-cyan-950/30 p-6 text-center">
                        <FaGem className="text-6xl text-blue-400 mx-auto mb-4" />
                        <p className="text-2xl font-black text-blue-400 mb-2">⚡ DOUBLE BONUS!</p>
                        <p className="text-white/80 text-lg">
                          {currentTeam.name} <span className="text-blue-400 font-bold">+{selectedTile.points * 2}</span> ball oladi!
                        </p>
                        <p className="text-blue-300/60 text-sm mt-2">
                          ({selectedTile.points} × 2 = {selectedTile.points * 2})
                        </p>
                      </div>
                      <button
                        onClick={runDouble}
                        className="game-btn w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:from-blue-400 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                      >
                        <FaCheck /> Qo'llash
                      </button>
                    </div>
                  )}

                  {/* Swap Tile */}
                  {selectedTile.type === "swap" && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-green-500/20 bg-gradient-to-br from-green-950/30 to-emerald-950/30 p-5">
                        <p className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                          <GiSwapBag className="text-2xl" /> Ballarni almashtirish
                        </p>
                        <p className="text-white/80 mb-3">Qaysi jamoa bilan almashtirmoqchisiz?</p>
                      </div>

                      <div className="grid gap-2">
                        {teams
                          .filter((t) => t.id !== currentTeam.id)
                          .map((t) => (
                            <button
                              key={t.id}
                              onClick={() => setSwapTarget(t.id)}
                              className={`
                                game-btn p-4 rounded-xl border-2 text-left transition-all
                                ${swapTarget === t.id
                                  ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/20'
                                  : 'border-yellow-500/20 bg-yellow-950/30 hover:border-green-500/50'
                                }
                              `}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-bold text-white">{t.name}</p>
                                  <p className="text-sm text-yellow-300/60">{t.score} ball</p>
                                </div>
                                {swapTarget === t.id && <FaCheck className="text-green-400" />}
                              </div>
                            </button>
                          ))}
                      </div>

                      <button
                        onClick={runSwap}
                        disabled={!swapTarget}
                        className="game-btn w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:from-green-400 hover:to-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                      >
                        <FaExchangeAlt /> Almashtirish
                      </button>
                    </div>
                  )}

                  {/* Steal Tile */}
                  {selectedTile.type === "steal" && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-950/30 to-pink-950/30 p-5">
                        <p className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
                          <FaBolt className="text-2xl" /> Ball o'g'irlash
                        </p>
                        <p className="text-white/80 mb-3">Kimdan ball o'g'irlamoqchisiz?</p>
                      </div>

                      <div className="grid gap-2">
                        {teams
                          .filter((t) => t.id !== currentTeam.id)
                          .map((t) => (
                            <button
                              key={t.id}
                              onClick={() => setStealTarget(t.id)}
                              className={`
                                game-btn p-4 rounded-xl border-2 text-left transition-all
                                ${stealTarget === t.id
                                  ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20'
                                  : 'border-yellow-500/20 bg-yellow-950/30 hover:border-purple-500/50'
                                }
                              `}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-bold text-white">{t.name}</p>
                                  <p className="text-sm text-yellow-300/60">{t.score} ball</p>
                                </div>
                                {stealTarget === t.id && <FaCheck className="text-purple-400" />}
                              </div>
                            </button>
                          ))}
                      </div>

                      <p className="text-sm text-yellow-300/60 mt-2">Qancha ball olmoqchisiz?</p>
                      <div className="flex gap-2">
                        {STEAL_AMOUNTS.map((amount) => (
                          <button
                            key={amount}
                            onClick={() => runSteal(amount)}
                            disabled={!stealTarget}
                            className="game-btn flex-1 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-400 hover:to-pink-400 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20"
                          >
                            {amount}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Baamboozle;