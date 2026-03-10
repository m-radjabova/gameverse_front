import { useEffect, useMemo, useState } from "react";
import { 
  FaBackspace, FaPlay, FaPlus, FaRedo, 
  FaTrophy, FaUsers, FaBolt, FaStar, FaCrown,
  FaCheckCircle, FaTimesCircle, FaClock, FaMagic, FaRocket
} from "react-icons/fa";
import { GiBattleGear, GiTeamIdea, GiSwordsEmblem } from "react-icons/gi";
import { RiFlashlightFill } from "react-icons/ri";
import { TbAlt } from "react-icons/tb";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../shared/useGameStartCountdown";

type Phase = "setup" | "play" | "round" | "finish";
type TeamId = 0 | 1;
  
type Puzzle = {
  answer: string;
  category: string;
};

type DraftPuzzle = {
  answer: string;
  category: string;
};

const ROUND_SECONDS = 30;
const TOTAL_ROUNDS = 8;
const ROUND_BASE_POINT = 200;
const TIMER_BONUS = 6;
const WRONG_TRY_PENALTY = 20;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const emptyDraft: DraftPuzzle = { answer: "", category: "Teacher" };

const BUILTIN_PUZZLES: Puzzle[] = [
  { answer: "OLMA", category: "Meva" },
  { answer: "ANOR", category: "Meva" },
  { answer: "MAKTAB", category: "Ta'lim" },
  { answer: "USTOZ", category: "Ta'lim" },
  { answer: "DAFTAR", category: "Maktab" },
  { answer: "KITOB", category: "Maktab" },
  { answer: "DOSTLIK", category: "Qadriyat" },
  { answer: "GALABA", category: "Natija" },
  { answer: "JAMOA", category: "Sport" },
  { answer: "BILIM", category: "O'qish" },
  { answer: "ZEHN", category: "Ko'nikma" },
  { answer: "TOPSHIRIQ", category: "Dars" },
];

const shuffle = <T,>(list: T[]) => {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const scrambleWord = (answer: string) => {
  if (answer.length < 2) return answer;
  let scrambled = answer;
  let tries = 0;
  while (scrambled === answer && tries < 10) {
    scrambled = shuffle(answer.split("")).join("");
    tries += 1;
  }
  return scrambled;
};

const sanitizeWord = (value: string) => value.toUpperCase().replace(/[^A-Z]/g, "");

export default function WordBattle() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [teamNames, setTeamNames] = useState<[string, string]>(["⚔️ 1-JAMOA", "🛡️ 2-JAMOA"]);
  const [nameError, setNameError] = useState("");
  const [deck, setDeck] = useState<Puzzle[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [roundTimer, setRoundTimer] = useState(ROUND_SECONDS);
  const [teamInput, setTeamInput] = useState<[string, string]>(["", ""]);
  const [roundMessage, setRoundMessage] = useState("");
  const [roundWinner, setRoundWinner] = useState<TeamId | null>(null);
  const [draft, setDraft] = useState<DraftPuzzle>(emptyDraft);
  const [draftError, setDraftError] = useState("");
  const [teacherPuzzles, setTeacherPuzzles] = useState<Puzzle[]>([]);
  const [activeTeam, setActiveTeam] = useState<TeamId | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();

  const currentPuzzle = deck[roundIndex];

  const scrambled = useMemo(() => {
    if (!currentPuzzle) return "";
    return scrambleWord(currentPuzzle.answer);
  }, [currentPuzzle]);

  const winner = scores[0] === scores[1] ? null : scores[0] > scores[1] ? 0 : 1;

  useEffect(() => {
    if (phase !== "play") return;
    if (roundTimer <= 0) {
      setRoundWinner(null);
      setRoundMessage(`⏰ Vaqt tugadi! To'g'ri javob: ${currentPuzzle?.answer ?? ""}`);
      setPhase("round");
      return;
    }
    const timer = window.setTimeout(() => setRoundTimer((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, roundTimer, currentPuzzle]);

  useEffect(() => {
    if (roundWinner !== null) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  }, [roundWinner]);

  const resetRoundInputs = () => {
    setTeamInput(["", ""]);
    setActiveTeam(null);
  };

  const startGame = () => {
    const left = teamNames[0].trim();
    const right = teamNames[1].trim();
    if (!left || !right) {
      setNameError("Ikkala jamoa nomini kiriting!");
      return;
    }

    const source = [...BUILTIN_PUZZLES, ...teacherPuzzles];
    if (source.length === 0) {
      setNameError("O'yin uchun kamida 1 ta so'z bo'lishi kerak!");
      return;
    }
    const nextDeck = shuffle(source).slice(0, Math.min(TOTAL_ROUNDS, source.length));
    setTeamNames([left, right]);
    setNameError("");
    setDeck(nextDeck);
    setRoundIndex(0);
    setScores([0, 0]);
    setRoundTimer(ROUND_SECONDS);
    resetRoundInputs();
    setRoundMessage("");
    setRoundWinner(null);
    setPhase("play");
  };

  const handleStartGame = () => runStartCountdown(startGame);

  const addTeacherPuzzle = () => {
    const answer = sanitizeWord(draft.answer);
    const category = draft.category.trim() || "Teacher";

    if (answer.length < 3) {
      setDraftError("So'z kamida 3 harf bo'lishi kerak!");
      return;
    }

    setTeacherPuzzles((prev) => [...prev, { answer, category }]);
    setDraft(emptyDraft);
    setDraftError("");
  };

  useEffect(() => {
    if (phase !== "round") return;
    const timer = window.setTimeout(() => {
      const nextIndex = roundIndex + 1;
      if (nextIndex >= deck.length) {
        setPhase("finish");
        return;
      }
      setRoundIndex(nextIndex);
      setRoundTimer(ROUND_SECONDS);
      resetRoundInputs();
      setRoundMessage("");
      setRoundWinner(null);
      setPhase("play");
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [phase, roundIndex, deck.length]);

  const onPickLetter = (team: TeamId, letter: string) => {
    if (phase !== "play" || !currentPuzzle) return;
    setActiveTeam(team);
    setTeamInput((prev) => {
      const next: [string, string] = [...prev] as [string, string];
      if (next[team].length >= currentPuzzle.answer.length) return prev;
      next[team] += letter;
      return next;
    });
  };

  const onBackspace = (team: TeamId) => {
    if (phase !== "play") return;
    setActiveTeam(team);
    setTeamInput((prev) => {
      const next: [string, string] = [...prev] as [string, string];
      next[team] = next[team].slice(0, -1);
      return next;
    });
  };

  const onClear = (team: TeamId) => {
    if (phase !== "play") return;
    setActiveTeam(team);
    setTeamInput((prev) => {
      const next: [string, string] = [...prev] as [string, string];
      next[team] = "";
      return next;
    });
  };

  const onSubmit = (team: TeamId) => {
    if (phase !== "play" || !currentPuzzle) return;
    const typed = teamInput[team].trim().toUpperCase();
    if (!typed) return;

    if (typed === currentPuzzle.answer) {
      const gained = ROUND_BASE_POINT + roundTimer * TIMER_BONUS;
      setScores((prev) => {
        const next: [number, number] = [...prev] as [number, number];
        next[team] += gained;
        return next;
      });
      setRoundWinner(team);
      setRoundMessage(`🎉 ${teamNames[team]} birinchi bo'lib topdi! +${gained} ball!`);
      setPhase("round");
      return;
    }

    setScores((prev) => {
      const next: [number, number] = [...prev] as [number, number];
      next[team] = Math.max(0, next[team] - WRONG_TRY_PENALTY);
      return next;
    });
    setRoundMessage(`❌ ${teamNames[team]} xato! -${WRONG_TRY_PENALTY} ball`);
    onClear(team);
  };

  const resetAll = () => {
    setPhase("setup");
    setDeck([]);
    setRoundIndex(0);
    setScores([0, 0]);
    setRoundTimer(ROUND_SECONDS);
    resetRoundInputs();
    setRoundMessage("");
    setRoundWinner(null);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-0 -right-4 h-96 w-96 animate-pulse rounded-full bg-blue-500/10 blur-3xl delay-1000" />
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-cyan-500/5 blur-3xl" />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/20 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                width: `${8 + Math.random() * 8}px`,
                height: `${8 + Math.random() * 8}px`,
                background: `hsl(${Math.random() * 360}, 80%, 60%)`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 mx-auto min-h-screen w-full p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 transform-gpu overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#1e2a3a]/90 via-[#1f3a4a]/90 to-[#1e3a4a]/90 p-5 backdrop-blur-xl shadow-2xl md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg transform hover:rotate-3 transition-transform">
                <GiBattleGear className="text-3xl text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-yellow-300 border border-yellow-300/30">
                    <FaBolt className="mr-1 inline text-yellow-300" /> LIVE
                  </span>
                  <span className="text-xs font-medium text-blue-300">#WORD_BATTLE</span>
                </div>
                <h1 className="mt-1 text-3xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent md:text-4xl">
                  TEZ YOZUV ANAGRAMMA DUELI
                </h1>
              </div>
            </div>
            <button
              onClick={resetAll}
              className="group flex items-center gap-2 rounded-2xl bg-white/5 px-5 py-3 text-sm font-bold text-white/90 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
            >
              <FaRedo className="transition-transform group-hover:rotate-180" />
              Qayta boshlash
            </button>
          </div>
        </div>

        {phase === "setup" && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Team Setup */}
            <div className="transform-gpu overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1e2a3a]/90 to-[#1f3a4a]/90 p-6 backdrop-blur-xl shadow-2xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <FaUsers className="text-xl text-white" />
                </div>
                <h2 className="text-xl font-black text-white">JAMOALAR SOZLAMASI</h2>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-blue-300">⚔️ 1-JAMOA</label>
                    <input
                      value={teamNames[0]}
                      onChange={(e) => setTeamNames([e.target.value, teamNames[1]])}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-bold text-white placeholder-white/40 backdrop-blur-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
                      placeholder="1-JAMOA nomi"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-rose-300">🛡️ 2-JAMOA</label>
                    <input
                      value={teamNames[1]}
                      onChange={(e) => setTeamNames([teamNames[0], e.target.value])}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-bold text-white placeholder-white/40 backdrop-blur-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 transition-all"
                      placeholder="2-JAMOA nomi"
                    />
                  </div>
                </div>

                {nameError && (
                  <div className="rounded-xl bg-rose-500/20 p-3 text-rose-300 border border-rose-500/30">
                    ⚠️ {nameError}
                  </div>
                )}

                <div className="rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 border border-white/10">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
                    <RiFlashlightFill className="text-yellow-300" />
                    O'YIN QOIDALARI
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      Har bir jamoa aralashtirilgan so'zni topishi kerak
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      Birinchi to'g'ri topgan jamoa ball oladi
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                      Vaqt tugaguncha javob berish mumkin
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleStartGame}
                  className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-lg font-black text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                  <span className="relative flex items-center justify-center gap-2">
                    <FaRocket className="text-xl" />
                    O'YINNI BOSHLASH
                  </span>
                </button>
              </div>
            </div>

            {/* Teacher Panel */}
            <div className="transform-gpu overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1e2a3a]/90 to-[#1f3a4a]/90 p-6 backdrop-blur-xl shadow-2xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <FaMagic className="text-xl text-white" />
                </div>
                <h2 className="text-xl font-black text-white">SO'Z QO'SHISH</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <input
                    value={draft.answer}
                    onChange={(e) => setDraft((prev) => ({ ...prev, answer: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-bold text-white placeholder-white/40 backdrop-blur-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all"
                    placeholder="SO'Z (masalan: PYTHON)"
                  />
                  <input
                    value={draft.category}
                    onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 backdrop-blur-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all"
                    placeholder="Kategoriya (ixtiyoriy)"
                  />
                </div>

                {draftError && (
                  <div className="rounded-xl bg-rose-500/20 p-3 text-rose-300 border border-rose-500/30">
                    ⚠️ {draftError}
                  </div>
                )}

                <button
                  onClick={addTeacherPuzzle}
                  className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-lg font-black text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                  <span className="relative flex items-center justify-center gap-2">
                    <FaPlus />
                    SO'Z QO'SHISH
                  </span>
                </button>

                <div className="mt-4 rounded-xl bg-white/5 p-4">
                  <p className="mb-2 text-sm font-bold text-gray-300">QO'SHILGAN SO'ZLAR:</p>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-white">{teacherPuzzles.length}</span>
                    <span className="text-sm text-gray-400">ta so'z</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(phase === "play" || phase === "round") && currentPuzzle && (
          <div className="space-y-6">
            {/* Game Header */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Round Info */}
              <div className="transform-gpu overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e2a3a]/90 to-[#1f3a4a]/90 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
                    <GiSwordsEmblem className="text-xl text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400">RAUND</p>
                    <p className="text-2xl font-black text-white">
                      {roundIndex + 1}/{deck.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timer */}
              <div className="transform-gpu overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e2a3a]/90 to-[#1f3a4a]/90 p-4 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
                    roundTimer <= 10 ? 'bg-gradient-to-br from-red-500 to-orange-500 animate-pulse' : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                  }`}>
                    <FaClock className="text-xl text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400">VAQT</p>
                    <p className={`text-2xl font-black ${
                      roundTimer <= 10 ? 'text-red-400' : 'text-white'
                    }`}>
                      {roundTimer}s
                    </p>
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="transform-gpu overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e2a3a]/90 to-[#1f3a4a]/90 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-xs font-bold text-blue-400">{teamNames[0]}</p>
                    <p className="text-2xl font-black text-blue-300">{scores[0]}</p>
                  </div>
                  <div className="text-2xl font-black text-gray-500">:</div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-rose-400">{teamNames[1]}</p>
                    <p className="text-2xl font-black text-rose-300">{scores[1]}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Puzzle Card */}
            <div className="transform-gpu overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1e2a3a]/95 to-[#1f3a4a]/95 p-8 backdrop-blur-xl shadow-2xl">
              <div className="text-center">
                <span className="inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-yellow-300 border border-yellow-300/30 mb-4">
                  <FaStar className="mr-1 inline text-yellow-300" /> {currentPuzzle.category}
                </span>
                <h2 className="text-5xl font-black tracking-[0.3em] text-white md:text-6xl lg:text-7xl animate-pulse-slow">
                  {scrambled}
                </h2>
                <p className="mt-4 text-sm text-gray-400">ARALASHTIRILGAN SO'Z</p>
              </div>
            </div>

            {/* Teams Input */}
            <div className="grid gap-6 lg:grid-cols-2">
              {[0, 1].map((id) => {
                const team = id as TeamId;
                const isWinner = roundWinner === team;
                const isActive = activeTeam === team;
                
                return (
                  <div
                    key={team}
                    className={`transform-gpu overflow-hidden rounded-3xl border-2 p-6 backdrop-blur-xl transition-all ${
                      isWinner
                        ? 'border-yellow-400/50 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 shadow-2xl shadow-yellow-500/20'
                        : isActive
                        ? 'border-blue-400/50 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 shadow-2xl'
                        : 'border-white/10 bg-gradient-to-br from-[#1e2a3a]/90 to-[#1f3a4a]/90'
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                          team === 0
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                            : 'bg-gradient-to-br from-rose-500 to-red-500'
                        }`}>
                          {team === 0 ? <GiTeamIdea className="text-2xl text-white" /> : <TbAlt className="text-2xl text-white" />}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white">{teamNames[team]}</h3>
                          <p className="text-xs text-gray-400">Ball: {scores[team]}</p>
                        </div>
                      </div>
                      {isWinner && (
                        <div className="flex items-center gap-2 rounded-full bg-yellow-400/20 px-3 py-1 text-yellow-300 border border-yellow-400/30">
                          <FaCrown />
                          <span className="text-xs font-bold">G'OLIB</span>
                        </div>
                      )}
                    </div>

                    <div className="mb-4 rounded-xl bg-black/40 p-4 text-center border border-white/10">
                      <p className="text-3xl font-black tracking-[0.3em] text-white">
                        {teamInput[team] || Array(currentPuzzle.answer.length).fill('_').join(' ')}
                      </p>
                    </div>

                    {/* Alphabet Keyboard */}
                    <div className="mb-4 grid grid-cols-7 gap-1.5">
                      {ALPHABET.map((letter) => (
                        <button
                          key={`${team}-${letter}`}
                          onClick={() => onPickLetter(team, letter)}
                          disabled={phase !== "play"}
                          className="aspect-square rounded-lg bg-white/5 text-sm font-black text-white border border-white/10 hover:bg-white/20 hover:scale-110 active:scale-95 transition-all disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          {letter}
                        </button>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => onBackspace(team)}
                        disabled={phase !== "play"}
                        className="flex items-center justify-center gap-1 rounded-xl bg-white/5 px-3 py-2 text-sm font-bold text-white border border-white/10 hover:bg-white/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        <FaBackspace />
                        <span className="hidden sm:inline">O'chir</span>
                      </button>
                      <button
                        onClick={() => onClear(team)}
                        disabled={phase !== "play"}
                        className="flex items-center justify-center gap-1 rounded-xl bg-white/5 px-3 py-2 text-sm font-bold text-white border border-white/10 hover:bg-white/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        <FaTimesCircle />
                        <span className="hidden sm:inline">Toza</span>
                      </button>
                      <button
                        onClick={() => onSubmit(team)}
                        disabled={phase !== "play"}
                        className="flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-2 text-sm font-bold text-white shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        <FaCheckCircle />
                        <span className="hidden sm:inline">Tekshir</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Round Message */}
            {roundMessage && (
              <div className="transform-gpu overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 backdrop-blur-xl">
                <p className="text-center text-lg font-bold text-white">{roundMessage}</p>
              </div>
            )}

          </div>
        )}

        {phase === "finish" && (
          <div className="transform-gpu overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1e2a3a]/95 to-[#1f3a4a]/95 p-8 backdrop-blur-xl shadow-2xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-yellow-400/30" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
                  <FaTrophy className="text-4xl text-white" />
                </div>
              </div>
            </div>

            <h2 className="mb-4 text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent md:text-5xl">
              {winner === null ? "DURANG!" : `${teamNames[winner]} G'OLIB!`}
            </h2>

            <div className="mx-auto mb-8 max-w-md rounded-2xl bg-black/40 p-6 border border-white/10">
              <div className="flex items-center justify-between text-lg font-bold">
                <span className="text-blue-400">{teamNames[0]}</span>
                <span className="text-3xl font-black text-white">{scores[0]}</span>
              </div>
              <div className="my-3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="flex items-center justify-between text-lg font-bold">
                <span className="text-rose-400">{teamNames[1]}</span>
                <span className="text-3xl font-black text-white">{scores[1]}</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleStartGame}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 text-lg font-bold text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
              >
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                <span className="relative flex items-center gap-2">
                  <FaPlay />
                  QAYTA O'YNA
                </span>
              </button>
              <button
                onClick={() => setPhase("setup")}
                className="group relative overflow-hidden rounded-2xl bg-white/10 px-6 py-3 text-lg font-bold text-white border border-white/20 transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
              >
                <span className="relative flex items-center gap-2">
                  <FaUsers />
                  SOZLAMALAR
                </span>
              </button>
            </div>
          </div>
        )}
        <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />
      </div>
    </div>
  );
}
