import { useEffect, useMemo, useRef, useState } from "react";
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
} from "react-icons/fa";
import { GiSwapBag } from "react-icons/gi";
import Confetti from "react-confetti-boom";
import { fetchGameQuestions, saveGameQuestions } from "../../../hooks/useGameQuestions";
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
  { primary: "from-blue-500 to-cyan-500", text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  { primary: "from-green-500 to-emerald-500", text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
  { primary: "from-purple-500 to-pink-500", text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
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

const Baamboozle: React.FC<BaamboozleProps> = ({ initialQuestions }) => {
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

  const gameFinished = useMemo(() => tiles.length > 0 && tiles.every((t) => t.opened), [tiles]);
  const currentTeam = teams[currentTeamIndex] ?? { id: "0", name: "Jamoa", score: 0, color: "", avatar: "" };
  const openedCount = tiles.filter((t) => t.opened).length;
  const hasGeminiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY?.trim());

  const leaders = useMemo(() => {
    if (!teams.length) return [];
    const maxScore = Math.max(...teams.map((t) => t.score));
    return teams.filter((t) => t.score === maxScore);
  }, [teams]);

  useEffect(() => {
    if (gameFinished) {
      setShowWinner(true);
      setShowConfetti(true);
    }
  }, [gameFinished]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const remoteQuestions = await fetchGameQuestions<QuestionBankItem>(BAAMBOOZLE_GAME_KEY);
      if (!alive) return;
      if (remoteQuestions && remoteQuestions.length > 0) {
        setQuestionBank(remoteQuestions);
      } else if (initialQuestionsRef.current.length > 0) {
        setQuestionBank(initialQuestionsRef.current);
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

    const timer = window.setTimeout(() => {
      void saveGameQuestions<QuestionBankItem>(BAAMBOOZLE_GAME_KEY, questionBank);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [questionBank, remoteLoaded]);

  const addQuestion = () => {
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
    setStatusText("🎮 O'yin boshlandi! Katak tanlang.");
    setPhase("play");
  };

  const advanceTurn = () => {
    setCurrentTeamIndex((prev) => (teams.length ? (prev + 1) % teams.length : 0));
  };

  const markOpened = (tileId: number) => {
    setTiles((prev) => prev.map((t) => (t.id === tileId ? { ...t, opened: true } : t)));
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
      setTeams((prev) =>
        prev.map((t, idx) => (idx === currentTeamIndex ? { ...t, score: t.score + selectedTile.points } : t))
      );
      finishAction(`✅ ${currentTeam.name} +${selectedTile.points} ball oldi.`);
    } else {
      finishAction(`❌ ${currentTeam.name} javobni topa olmadi.`);
    }
  };

  const runBurn = () => {
    if (!selectedTile || selectedTile.type !== "burn") return;
    markOpened(selectedTile.id);
    setTeams((prev) => prev.map((t, idx) => (idx === currentTeamIndex ? { ...t, score: 0 } : t)));
    finishAction(`🔥 ${currentTeam.name} ning ballari kuyib ketdi!`);
  };

  const runDouble = () => {
    if (!selectedTile || selectedTile.type !== "double") return;
    const bonus = selectedTile.points * 2;
    markOpened(selectedTile.id);
    setTeams((prev) => prev.map((t, idx) => (idx === currentTeamIndex ? { ...t, score: t.score + bonus } : t)));
    finishAction(`⚡ ${currentTeam.name} DOUBLE! +${bonus} ball.`);
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

    finishAction(`🔄 ${currentTeam.name} ${teams[targetIndex].name} bilan ballarni almashtirdi.`);
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

    finishAction(`💰 ${currentTeam.name} ${targetTeam.name} dan ${transfer} ball oldi.`);
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
    setStatusText("🔄 O'yin qayta boshlandi.");
  };

  const getTileLabelNumber = (tile: Tile) => tile.number;

  const getTileIcon = (type: TileType) => {
    switch (type) {
      case "burn":
        return <FaFire />;
      case "swap":
        return <GiSwapBag />;
      case "steal":
        return <FaBolt />;
      case "double":
        return <FaGem />;
      default:
        return <FaStar />;
    }
  };

  const getTileClass = (tile: Tile) => {
    if (tile.opened) return "bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 text-gray-400";

    return "bg-gradient-to-br from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 border-yellow-400 text-white";
  };

  if (phase === "setup") {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-yellow-950/90 via-amber-950/90 to-orange-950/90 p-6 backdrop-blur-xl shadow-2xl md:p-8">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] animate-pulse rounded-full bg-yellow-600/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] animate-pulse rounded-full bg-orange-600/20 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute -inset-1 animate-ping rounded-full bg-yellow-500/30" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500">
                <FaDice className="text-2xl text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">Baamboozle Setup</h2>
              <p className="text-yellow-300/80">2-3 jamoa · 16/24 katak · Maxsus kartalar</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Game Settings */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-yellow-500/30 bg-yellow-950/30 p-5 backdrop-blur-sm">
                <p className="text-sm font-bold text-yellow-400 mb-3">⚙️ O'YIN SOZLAMALARI</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-yellow-300/70 mb-2">Jamoalar soni</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setTeamCount(2)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                          teamCount === 2
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                            : 'bg-yellow-950/50 text-yellow-300/70 border border-yellow-500/30'
                        }`}
                      >
                        2 ta jamoa
                      </button>
                      <button
                        onClick={() => setTeamCount(3)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                          teamCount === 3
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                            : 'bg-yellow-950/50 text-yellow-300/70 border border-yellow-500/30'
                        }`}
                      >
                        3 ta jamoa
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-yellow-300/70 mb-2">Kataklar soni</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setBoardSize(16)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                          boardSize === 16
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                            : 'bg-yellow-950/50 text-yellow-300/70 border border-yellow-500/30'
                        }`}
                      >
                        16 katak (tez)
                      </button>
                      <button
                        onClick={() => setBoardSize(24)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                          boardSize === 24
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                            : 'bg-yellow-950/50 text-yellow-300/70 border border-yellow-500/30'
                        }`}
                      >
                        24 katak (uzun)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Names */}
              <div className="rounded-2xl border border-yellow-500/30 bg-yellow-950/30 p-5 backdrop-blur-sm">
                <p className="text-sm font-bold text-yellow-400 mb-3">👥 JAMOA NOMLARI</p>
                <div className="space-y-3">
                  {Array.from({ length: teamCount }).map((_, idx) => (
                    <input
                      key={idx}
                      value={teamInputs[idx]}
                      onChange={(e) => setTeamInputs((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))}
                      placeholder={`Jamoa ${idx + 1}`}
                      className="w-full rounded-xl border border-yellow-500/30 bg-yellow-950/50 px-4 py-3 text-white placeholder-yellow-300/50 focus:border-yellow-400 focus:outline-none"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Questions Panel */}
            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-950/30 p-5 backdrop-blur-sm">
              <p className="text-sm font-bold text-yellow-400 mb-3">📝 SAVOLLAR</p>
              
              <div className="space-y-3">
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4">
                  <div className="mb-3 flex items-center gap-2 text-cyan-300">
                    <FaRobot />
                    <p className="text-sm font-bold">AI SAVOL GENERATSIYASI</p>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <textarea
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      placeholder="Mavzu: kasrlar, hayvonlar, tarixiy voqealar..."
                      className="min-h-[92px] w-full rounded-xl border border-cyan-500/30 bg-slate-950/70 px-4 py-3 text-white placeholder-cyan-300/40 focus:border-cyan-400 focus:outline-none md:col-span-2"
                    />
                    <input
                      value={aiSubject}
                      onChange={(e) => setAiSubject(e.target.value)}
                      placeholder="Fan: matematika, tarix, biologiya..."
                      className="w-full rounded-xl border border-cyan-500/30 bg-slate-950/70 px-4 py-3 text-white placeholder-cyan-300/40 focus:border-cyan-400 focus:outline-none"
                    />
                    <select
                      value={aiGradeRange}
                      onChange={(e) => setAiGradeRange(e.target.value as GradeRange)}
                      className="w-full rounded-xl border border-cyan-500/30 bg-slate-950/70 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
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
                      className="w-full rounded-xl border border-cyan-500/30 bg-slate-950/70 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
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
                      className="w-full rounded-xl border border-cyan-500/30 bg-slate-950/70 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
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
                      className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-white font-bold transition-all hover:from-cyan-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isGeneratingAi ? `${aiQuestionCount} ta yaratilmoqda...` : `AI bilan ${aiQuestionCount} ta yaratish`}
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-cyan-200/80">
                    Avval mavzu, keyin fan va kerak bo'lsa sinf oralig'ini tanlang. AI yaratgan savollar hozirgi Baamboozle savollariga qo'shiladi.
                  </p>
                </div>

                <div className="grid gap-2">
                  <input
                    value={draft.question}
                    onChange={(e) => setDraft((prev) => ({ ...prev, question: e.target.value }))}
                    placeholder="Savol matni"
                    className="w-full rounded-xl border border-yellow-500/30 bg-yellow-950/50 px-4 py-3 text-white placeholder-yellow-300/50 focus:border-yellow-400 focus:outline-none"
                  />
                  <input
                    value={draft.answer}
                    onChange={(e) => setDraft((prev) => ({ ...prev, answer: e.target.value }))}
                    placeholder="Javob"
                    className="w-full rounded-xl border border-yellow-500/30 bg-yellow-950/50 px-4 py-3 text-white placeholder-yellow-300/50 focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                <button
                  onClick={addQuestion}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold hover:from-yellow-400 hover:to-orange-400 transition-all flex items-center justify-center gap-2"
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
                    className="w-full py-3 rounded-xl border border-yellow-500/30 bg-yellow-950/50 text-yellow-300 font-bold hover:bg-yellow-900/50 transition-all"
                  >
                    BEKOR QILISH
                  </button>
                )}

                {questionError && (
                  <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                    {questionError}
                  </div>
                )}

                <div className="max-h-60 space-y-2 overflow-auto pr-2">
                  {questionBank.map((item, idx) => (
                    <div
                      key={`${item.question}-${idx}`}
                      className="group relative overflow-hidden rounded-xl border border-yellow-500/30 bg-yellow-950/30 p-3 transition-all hover:bg-yellow-900/40"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white line-clamp-2">{item.question}</p>
                          <p className="text-xs text-yellow-300/70 mt-1">{item.answer}</p>
                        </div>
                        <div className="ml-2 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => editQuestion(idx)}
                            className="text-cyan-300"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => removeQuestion(idx)}
                            className="text-rose-400"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={openGame}
                className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-lg hover:from-green-400 hover:to-emerald-400 transition-all shadow-xl"
              >
                O'YINNI BOSHLASH
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-yellow-500/30 bg-gradient-to-br from-yellow-950/90 via-amber-950/90 to-orange-950/90 p-6 backdrop-blur-xl shadow-2xl md:p-8">
      {showConfetti && <Confetti mode="boom" particleCount={200} effectCount={1} x={0.5} y={0.3} colors={['#fbbf24', '#f59e0b', '#ef4444', '#22c55e', '#3b82f6']} />}
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] animate-pulse rounded-full bg-yellow-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] animate-pulse rounded-full bg-orange-600/10 blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 animate-ping rounded-full bg-yellow-500/30" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500">
                <FaDice className="text-xl text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Baamboozle</h2>
              <p className="text-xs text-yellow-300/70">Katak ochildi: {openedCount}/{boardSize}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPhase("setup")}
              className="px-4 py-2 rounded-xl bg-yellow-950/50 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-900/50 transition-all"
            >
              Sozlama
            </button>
            <button
              onClick={resetGame}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold hover:from-yellow-400 hover:to-orange-400 transition-all flex items-center gap-2"
            >
              <FaRedo /> Qayta
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="mb-4 p-4 rounded-xl bg-yellow-950/30 border border-yellow-500/30 text-center">
          <p className="text-sm font-semibold text-yellow-300">{statusText}</p>
        </div>

        {/* Teams */}
        <div className={`grid gap-6 mb-6 ${teams.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {teams.map((team, idx) => {
            const active = idx === currentTeamIndex && !gameFinished;
            const leader = leaders.some((l) => l.id === team.id);
            return (
              <div
                key={team.id}
                className={`
                  relative overflow-hidden rounded-xl border-2 p-5 transition-all
                  ${active 
                    ? `bg-gradient-to-r ${team.color} border-yellow-400 scale-105 shadow-2xl` 
                    : 'border-yellow-500/30 bg-yellow-950/30'}
                `}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{team.avatar}</span>
                  <div>
                    <p className="text-lg font-bold text-white">{team.name}</p>
                    <p className="text-xs text-yellow-300/70">{idx === 0 ? "1-JAMOA" : idx === 1 ? "2-JAMOA" : "3-JAMOA"}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-yellow-300/70">Ball</span>
                  <span className="text-3xl font-bold text-white">{team.score}</span>
                </div>
                {leader && !active && (
                  <div className="absolute top-2 right-2 text-yellow-500">
                    <FaCrown />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Game Board */}
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-950/30 p-4 backdrop-blur-sm">
          <div className={`grid gap-3 ${boardSize === 16 ? "grid-cols-4" : "grid-cols-4 md:grid-cols-6"}`}>
            {tiles.map((tile) => (
              <button
                key={tile.id}
                disabled={tile.opened || Boolean(selectedTile) || gameFinished}
                onClick={() => openTile(tile)}
                className={`
                  relative cursor-pointer group aspect-square rounded-xl border-2 p-2 text-center transition-all
                  ${getTileClass(tile)}
                  ${!tile.opened && !selectedTile ? ' hover:shadow-xl' : ''}
                `}
              >
              
                <div className="relative flex h-full flex-col items-center justify-center">
                  {tile.opened ? (
                    <div className="text-2xl font-black">✓</div>
                  ) : (
                    <>
                      <p className="text-4xl font-black">{getTileLabelNumber(tile)}</p>
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Winner Modal */}
        {showWinner && gameFinished && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
            <div className="relative max-w-lg w-full bg-gradient-to-br from-yellow-950 to-orange-950 rounded-3xl border-2 border-yellow-500/30 p-8 shadow-2xl text-center">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-yellow-500/20 blur-3xl" />
                <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />
              </div>

              <div className="relative">
                <div className="text-7xl mb-4 animate-bounce">🏆</div>
                <h3 className="text-3xl font-black text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text mb-2">
                  O'YIN TUGADI!
                </h3>
                
                {leaders.length === 1 ? (
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-white">{leaders[0].name}</p>
                    <p className="text-5xl font-black text-yellow-400">{leaders[0].score}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-white">DURRANG!</p>
                    <p className="text-yellow-400">{leaders.map(t => t.name).join(" va ")}</p>
                  </div>
                )}

                <button
                  onClick={resetGame}
                  className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg hover:from-yellow-400 hover:to-orange-400 transition-all"
                >
                  YANA O'YNASh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tile Modal */}
        {selectedTile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
            <div className="relative max-w-2xl w-full bg-gradient-to-br from-yellow-950 to-orange-950 rounded-3xl border-2 border-yellow-500/30 p-6 shadow-2xl md:p-8">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-yellow-500/20 blur-3xl" />
                <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getTileIcon(selectedTile.type)}</div>
                    <p className="text-xl font-black text-white">Katak #{selectedTile.number}</p>
                  </div>
                  <button
                    onClick={closeTileModal}
                    className="px-3 py-1 rounded-lg bg-yellow-950/50 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-900/50 transition-all"
                  >
                    Yopish
                  </button>
                </div>

                {selectedTile.type === "question" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/30 p-4">
                      <p className="text-sm text-yellow-300/70 mb-1">Savol</p>
                      <p className="text-lg font-bold text-white">{selectedTile.question}</p>
                    </div>

                    {!showAnswer ? (
                      <button
                        onClick={() => setShowAnswer(true)}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold hover:from-yellow-400 hover:to-orange-400 transition-all"
                      >
                        Javobni ko'rsatish
                      </button>
                    ) : (
                      <>
                        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                          <p className="text-sm text-green-300/70 mb-1">Javob</p>
                          <p className="text-lg font-bold text-green-400">{selectedTile.answer}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleQuestionResult(true)}
                            className="py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:from-green-400 hover:to-emerald-400 transition-all"
                          >
                            <FaCheck className="inline mr-2" /> To'g'ri
                          </button>
                          <button
                            onClick={() => handleQuestionResult(false)}
                            className="py-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold hover:from-red-400 hover:to-rose-400 transition-all"
                          >
                            <FaTimes className="inline mr-2" /> Noto'g'ri
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {selectedTile.type === "burn" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
                      <FaFire className="text-5xl text-red-400 mx-auto mb-3" />
                      <p className="text-xl font-bold text-red-400 mb-2">BAAMBOOZLE!</p>
                      <p className="text-white/80">{currentTeam.name} ning barcha ballari kuyib ketadi!</p>
                    </div>
                    <button
                      onClick={runBurn}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold hover:from-red-400 hover:to-rose-400 transition-all"
                    >
                      Qo'llash
                    </button>
                  </div>
                )}

                {selectedTile.type === "double" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-6 text-center">
                      <FaGem className="text-5xl text-blue-400 mx-auto mb-3" />
                      <p className="text-xl font-bold text-blue-400 mb-2">DOUBLE BONUS!</p>
                      <p className="text-white/80">{currentTeam.name} +{selectedTile.points * 2} ball oladi!</p>
                    </div>
                    <button
                      onClick={runDouble}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:from-blue-400 hover:to-cyan-400 transition-all"
                    >
                      Qo'llash
                    </button>
                  </div>
                )}

                {selectedTile.type === "swap" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
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
                              p-4 rounded-xl border-2 text-left transition-all
                              ${swapTarget === t.id
                                ? 'border-green-500 bg-green-500/20'
                                : 'border-yellow-500/30 bg-yellow-950/30 hover:border-green-500/50'
                              }
                            `}
                          >
                            <p className="font-bold text-white">{t.name}</p>
                            <p className="text-sm text-yellow-300/70">{t.score} ball</p>
                          </button>
                        ))}
                    </div>

                    <button
                      onClick={runSwap}
                      disabled={!swapTarget}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold hover:from-green-400 hover:to-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Almashtirish
                    </button>
                  </div>
                )}

                {selectedTile.type === "steal" && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
                      <p className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
                        <FaBolt className="text-2xl" /> Ball o'g'irlash
                      </p>
                    </div>

                    <div className="grid gap-2">
                      {teams
                        .filter((t) => t.id !== currentTeam.id)
                        .map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setStealTarget(t.id)}
                            className={`
                              p-4 rounded-xl border-2 text-left transition-all
                              ${stealTarget === t.id
                                ? 'border-purple-500 bg-purple-500/20'
                                : 'border-yellow-500/30 bg-yellow-950/30 hover:border-purple-500/50'
                              }
                            `}
                          >
                            <p className="font-bold text-white">{t.name}</p>
                            <p className="text-sm text-yellow-300/70">{t.score} ball</p>
                          </button>
                        ))}
                    </div>

                    <p className="text-sm text-yellow-300/70 mt-2">Qancha ball olmoqchisiz?</p>
                    <div className="flex gap-2">
                      {STEAL_AMOUNTS.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => runSteal(amount)}
                          disabled={!stealTarget}
                          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:from-purple-400 hover:to-pink-400 transition-all disabled:opacity-50"
                        >
                          {amount}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Baamboozle;
