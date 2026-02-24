import { useEffect, useMemo, useRef, useState } from "react";
import {FaCrown, FaMedal, FaPlay, FaRedo, FaBolt, FaArrowLeft, FaArrowRight,FaLayerGroup, FaHeart, FaRegHeart
} from "react-icons/fa";
import { GiBrain, GiAchievement } from "react-icons/gi";
import { MdRefresh} from "react-icons/md";
import Confetti from "react-confetti-boom";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../shared/useGameStartCountdown";

type Difficulty = "easy" | "normal" | "hard";
type Phase = "setup" | "preview" | "play" | "finish";
type PlayerId = 0 | 1;

type CardItem = {
  id: string;
  pairId: string;
  label: string; 
};

const PREVIEW_SECONDS = 3;
const TURN_TIME_LIMIT_SECONDS = 0;
const GAME_TIME_LIMIT_SECONDS = 8 * 60;

const DIFFICULTY_SIZES: Record<Difficulty, number> = {
  easy: 12,
  normal: 16,
  hard: 20,
};

const DIFFICULTY_GAME_TIME_SECONDS: Record<Difficulty, number> = {
  easy: 160,
  normal: 200,
  hard: 240,
};

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(total: number) {
  const s = Math.max(0, total);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

const PAIRS_POOL: Array<{ pairId: string; a: string; b: string }> = [
  { pairId: "p1", a: "🍎", b: "🍎" },
  { pairId: "p2", a: "🐱", b: "🐱" },
  { pairId: "p3", a: "🚗", b: "🚗" },
  { pairId: "p4", a: "🏀", b: "🏀" },
  { pairId: "p5", a: "📘", b: "📘" },
  { pairId: "p6", a: "🎵", b: "🎵" },
  { pairId: "p7", a: "🌞", b: "🌞" },
  { pairId: "p8", a: "🧩", b: "🧩" },
  { pairId: "p9", a: "🧪", b: "🧪" },
  { pairId: "p10", a: "🗺️", b: "🗺️" },
  { pairId: "p11", a: "🌳", b: "🌳" },
  { pairId: "p12", a: "🏫", b: "🏫" },
  { pairId: "p13", a: "⏳", b: "⏳" },
  { pairId: "p14", a: "💡", b: "💡" },
  { pairId: "p15", a: "🏹", b: "🏹" },
  { pairId: "p16", a: "🦋", b: "🦋" }
];

function buildDeck(totalCards: number) {
  const pairsNeeded = Math.floor(totalCards / 2);
  const selectedPairs = shuffle(PAIRS_POOL).slice(0, pairsNeeded);

  const cards: CardItem[] = [];
  selectedPairs.forEach((p) => {
    cards.push({ id: `${p.pairId}-a-${Math.random().toString(16).slice(2)}`, pairId: p.pairId, label: p.a });
    cards.push({ id: `${p.pairId}-b-${Math.random().toString(16).slice(2)}`, pairId: p.pairId, label: p.b });
  });

  return shuffle(cards);
}

type CardState = {
  isFaceUp: boolean;
  isMatched: boolean;
  shake: boolean;
};

function DiffButton({ active, onClick, label, color }: { active: boolean; onClick: () => void; label: string; color: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl px-4 py-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
        active 
          ? `bg-gradient-to-r ${color} text-white shadow-lg` 
          : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'
      }`}
    >
      <span className="relative z-10">{label}</span>
      {active && (
        <span className="absolute inset-0 bg-white/20 animate-pulse" />
      )}
    </button>
  );
}

export default function MemoryRush() {
  const finishViewRef = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");

  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [playerNames, setPlayerNames] = useState<[string, string]>(["⚔️ YULDUZ", "🛡️ SHAMS"]);
  const [nameError, setNameError] = useState("");

  const [deck, setDeck] = useState<CardItem[]>([]);
  const [cardState, setCardState] = useState<CardState[]>([]);

  const [active, setActive] = useState<PlayerId>(0);
  const [pairs, setPairs] = useState<[number, number]>([0, 0]);
  const [streak, setStreak] = useState<[number, number]>([0, 0]);
  const [lives, setLives] = useState<[number, number]>([5, 5]);

  const [firstPick, setFirstPick] = useState<number | null>(null);
  const [secondPick, setSecondPick] = useState<number | null>(null);
  const [lockInput, setLockInput] = useState(false);

  const [previewLeft, setPreviewLeft] = useState(PREVIEW_SECONDS);
  const [gameTimeLeft, setGameTimeLeft] = useState(GAME_TIME_LIMIT_SECONDS);

  const [turnTimeLeft, setTurnTimeLeft] = useState(TURN_TIME_LIMIT_SECONDS);
  const [toast, setToast] = useState<string | null>(null);
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();

  const totalCards = DIFFICULTY_SIZES[difficulty];
  const gameTimeLimit = DIFFICULTY_GAME_TIME_SECONDS[difficulty];
  const totalPairs = Math.floor(totalCards / 2);

  const gridClass = useMemo(() => {
    if (difficulty === "easy") return "grid-cols-3 sm:grid-cols-4";
    if (difficulty === "normal") return "grid-cols-4";
    return "grid-cols-4 sm:grid-cols-5";
  }, [difficulty]);

  const progressPct = useMemo(() => {
    const done = pairs[0] + pairs[1];
    return Math.round((done / Math.max(1, totalPairs)) * 100);
  }, [pairs, totalPairs]);

  const score = useMemo(() => {
    const base = (pairs[0] + pairs[1]) * 120;
    const combo = streak[0] * 25 + streak[1] * 25;
    const timeBonus = Math.round(gameTimeLeft * 2);
    return base + combo + timeBonus;
  }, [pairs, streak, gameTimeLeft]);

  const currentPlayer = playerNames[active];

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1300);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (phase !== "play") return;
    if (gameTimeLeft <= 0) {
      finishGame();
      return;
    }
    const t = window.setTimeout(() => setGameTimeLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, gameTimeLeft]);

  useEffect(() => {
    if (phase !== "play") return;
    if (TURN_TIME_LIMIT_SECONDS <= 0) return;
    if (lockInput) return;

    if (turnTimeLeft <= 0) {
      setToast("⏳ Navbat almashdi!");
      switchTurn(true);
      return;
    }
    const t = window.setTimeout(() => setTurnTimeLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, turnTimeLeft, lockInput]);

  useEffect(() => {
    if (phase !== "preview") return;
    if (previewLeft <= 0) {
      setCardState((prev) => prev.map((c) => ({ ...c, isFaceUp: false, shake: false })));
      setPhase("play");
      setLockInput(false);
      return;
    }
    const t = window.setTimeout(() => setPreviewLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, previewLeft]);

  useEffect(() => {
    if (phase !== "finish") return;
    finishViewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase]);

  const initGame = () => {
    const a = playerNames[0].trim() || "⚔️ YULDUZ";
    const b = playerNames[1].trim() || "🛡️ SHAMS";
    if (!a || !b) {
      setNameError("Ikkala o'yinchi nomini kiriting!");
      return;
    }
    if (a.toLowerCase() === b.toLowerCase()) {
      setNameError("Nomlar bir xil bo'lmasligi kerak!");
      return;
    }
    
    setPlayerNames([a, b]);
    setNameError("");

    const newDeck = buildDeck(totalCards);
    setDeck(newDeck);
    setCardState(newDeck.map(() => ({ isFaceUp: true, isMatched: false, shake: false })));

    setActive(0);
    setPairs([0, 0]);
    setStreak([0, 0]);
    setLives([5, 5]);
    setFirstPick(null);
    setSecondPick(null);
    setLockInput(true);

    setPreviewLeft(PREVIEW_SECONDS);
    setGameTimeLeft(gameTimeLimit);
    setTurnTimeLeft(TURN_TIME_LIMIT_SECONDS);

    setToast("👀 3 soniya yodlab oling!");
    setPhase("preview");
  };

  const handleInitGame = () => runStartCountdown(initGame);

  const finishGame = () => {
    setPhase("finish");
    setLockInput(true);
  };

  const restart = () => {
    setPhase("setup");
    setToast(null);
  };

  const resetBoard = () => {
    initGame();
  };

  const switchTurn = (forced = false) => {
    setFirstPick(null);
    setSecondPick(null);

    setCardState((prev) =>
      prev.map((c) => (c.isMatched ? c : { ...c, isFaceUp: false, shake: false }))
    );

    setActive((p) => (p === 0 ? 1 : 0));
    if (forced) {
      setStreak((prev) => {
        const n: [number, number] = [...prev] as [number, number];
        n[active] = 0;
        return n;
      });
      
      // Lose a life for timeout
      setLives((prev) => {
        const n: [number, number] = [...prev] as [number, number];
        n[active] = Math.max(0, n[active] - 1);
        return n;
      });
    }
    if (TURN_TIME_LIMIT_SECONDS > 0) setTurnTimeLeft(TURN_TIME_LIMIT_SECONDS);
  };

  const onPick = (idx: number) => {
    if (phase !== "play") return;
    if (lockInput) return;

    const st = cardState[idx];
    if (!st) return;
    if (st.isMatched) return;
    if (st.isFaceUp) return;

    setCardState((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], isFaceUp: true, shake: false };
      return next;
    });

    if (firstPick === null) {
      setFirstPick(idx);
      return;
    }

    if (secondPick === null) {
      setSecondPick(idx);
      setLockInput(true);

      const a = firstPick;
      const b = idx;

      const match = deck[a].pairId === deck[b].pairId;

      window.setTimeout(() => {
        if (match) {
          setCardState((prev) => {
            const next = [...prev];
            next[a] = { ...next[a], isMatched: true, shake: false };
            next[b] = { ...next[b], isMatched: true, shake: false };
            return next;
          });

          setPairs((prev) => {
            const n: [number, number] = [...prev] as [number, number];
            n[active] += 1;
            return n;
          });
          setStreak((prev) => {
            const n: [number, number] = [...prev] as [number, number];
            n[active] += 1;
            return n;
          });

          setToast(`✅ ${currentPlayer} juft topdi!`);

          setFirstPick(null);
          setSecondPick(null);
          setLockInput(false);

          const willBeDone = pairs[0] + pairs[1] + 1 >= totalPairs;
          if (willBeDone) {
            window.setTimeout(() => finishGame(), 500);
          }
          return;
        }

        setCardState((prev) => {
          const next = [...prev];
          next[a] = { ...next[a], shake: true };
          next[b] = { ...next[b], shake: true };
          return next;
        });

        setToast(`❌ Juft emas — ${currentPlayer} xato!`);
        setStreak((prev) => {
          const n: [number, number] = [...prev] as [number, number];
          n[active] = 0;
          return n;
        });
        
        // Lose a life for wrong match
        setLives((prev) => {
          const n: [number, number] = [...prev] as [number, number];
          n[active] = Math.max(0, n[active] - 1);
          return n;
        });

        window.setTimeout(() => {
          setCardState((prev) => {
            const next = [...prev];
            next[a] = { ...next[a], isFaceUp: false, shake: false };
            next[b] = { ...next[b], isFaceUp: false, shake: false };
            return next;
          });

          setFirstPick(null);
          setSecondPick(null);
          setLockInput(false);

          setActive((p) => (p === 0 ? 1 : 0));
          if (TURN_TIME_LIMIT_SECONDS > 0) setTurnTimeLeft(TURN_TIME_LIMIT_SECONDS);
        }, 250);
      }, 650);
    }
  };

  const winner = useMemo(() => {
    if (pairs[0] === pairs[1]) return null;
    return pairs[0] > pairs[1] ? 0 : 1;
  }, [pairs]);

  const winnerText = useMemo(() => {
    if (winner === null) return "Durrang 🤝";
    return `${playerNames[winner]} g'olib! 🏆`;
  }, [winner, playerNames]);

  const finalScore = useMemo(() => {
    const timeBonus = Math.round(gameTimeLeft * 2);
    return (pairs[0] + pairs[1]) * 120 + (streak[0] + streak[1]) * 25 + timeBonus;
  }, [pairs, streak, gameTimeLeft]);

  const rank = useMemo(() => {
    if (finalScore >= 1200) return { label: "Afsonaviy", icon: <FaCrown className="text-yellow-300" /> };
    if (finalScore >= 900) return { label: "Zo'r", icon: <FaMedal className="text-yellow-300" /> };
    if (finalScore >= 700) return { label: "Yaxshi", icon: <GiBrain className="text-emerald-300" /> };
    return { label: "Boshlovchi", icon: <FaBolt className="text-blue-300" /> };
  }, [finalScore]);

  return (
    <div className="relative text-white">
      <div ref={finishViewRef} />
      {phase === "finish" && (
        <Confetti
          mode="boom"
          particleCount={100}
          effectCount={1}
          x={0.5}
          y={0.35}
          colors={["#10b981", "#14b8a6", "#06b6d4", "#fde68a", "#86efac"]}
        />
      )}

      <div className="mx-auto w-full">
        {/* Toast Notification */}
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50">
          {toast && (
            <div className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-white font-bold shadow-2xl animate-bounce backdrop-blur-sm">
              {toast}
            </div>
          )}
        </div>

        {phase === "setup" && (
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Settings */}
            <div className="relative transform-gpu overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 p-6 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10" />
              
              <h3 className="relative mb-6 flex items-center gap-2 text-lg font-black text-white">
                <FaLayerGroup className="text-emerald-400" />
                O'YIN SOZLAMALARI
              </h3>

              <div className="relative space-y-4">
                {/* Player Names */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                      <FaArrowLeft />
                      1-O'YINCHI
                    </label>
                    <input
                      value={playerNames[0]}
                      onChange={(e) => setPlayerNames([e.target.value, playerNames[1]])}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-emerald-400 focus:outline-none"
                      placeholder="⚔️ YULDUZ"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-teal-400">
                      <FaArrowRight />
                      2-O'YINCHI
                    </label>
                    <input
                      value={playerNames[1]}
                      onChange={(e) => setPlayerNames([playerNames[0], e.target.value])}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-teal-400 focus:outline-none"
                      placeholder="🛡️ SHAMS"
                    />
                  </div>
                </div>

                {nameError && (
                  <div className="rounded-xl bg-rose-500/20 p-3 text-rose-300 border border-rose-500/30">
                    ⚠️ {nameError}
                  </div>
                )}

                {/* Difficulty */}
                <div className="space-y-3">
                  <p className="text-sm font-bold text-white/70">QIYINLIK DARAJASI</p>
                  <div className="flex flex-wrap gap-2">
                    <DiffButton 
                      active={difficulty === "easy"} 
                      onClick={() => setDifficulty("easy")} 
                      label="BOSHLANG'ICH (12)"
                      color="from-emerald-500 to-teal-500"
                    />
                    <DiffButton 
                      active={difficulty === "normal"} 
                      onClick={() => setDifficulty("normal")} 
                      label="O'RTA (16)"
                      color="from-teal-500 to-cyan-500"
                    />
                    <DiffButton 
                      active={difficulty === "hard"} 
                      onClick={() => setDifficulty("hard")} 
                      label="PROFESSIONAL (20)"
                      color="from-cyan-500 to-emerald-500"
                    />
                  </div>
                </div>

                {/* Game Info */}
                <div className="rounded-xl bg-white/5 p-4 border border-white/10">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Preview vaqti</p>
                      <p className="text-lg font-black text-white">{PREVIEW_SECONDS}s</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">O'yin vaqti</p>
                      <p className="text-lg font-black text-white">{formatTime(gameTimeLimit)}</p>
                    </div>
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={handleInitGame}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-4 font-black text-white text-lg shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                  <span className="relative flex items-center justify-center gap-3">
                    <FaPlay />
                    O'YINNI BOSHLASH
                  </span>
                </button>
              </div>
            </div>

            {/* Rules */}
            <div className="relative transform-gpu overflow-hidden rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-900/30 to-cyan-900/30 p-6 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10" />
              
              <h3 className="relative mb-6 flex items-center gap-2 text-lg font-black text-white">
                <GiAchievement className="text-teal-400" />
                O'YIN QOIDALARI
              </h3>

              <div className="relative space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-sm">1</span>
                      <span className="text-sm text-gray-300">Har navbatda <b className="text-white">2 ta karta</b> ochiladi</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-sm">2</span>
                      <span className="text-sm text-gray-300">✅ <b className="text-white">Juft topilsa:</b> ochiq qoladi va yana shu o'yinchi yuradi</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-sm">3</span>
                      <span className="text-sm text-gray-300">❌ <b className="text-white">Juft topilmasa:</b> navbat almashadi va 1 hayot kamayadi</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-sm">4</span>
                      <span className="text-sm text-gray-300"><b className="text-white">Combo:</b> ketma-ket topilgan juftlar uchun bonus ball</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <p className="text-sm text-emerald-300">
                    <b className="text-white">Ball hisoblash:</b> Har bir juft = 120 ball, Combo = +25 ball, Vaqt bonusi = qolgan vaqt × 2
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-white/60">
                  <FaHeart className="text-rose-400" />
                  <span>Har bir o'yinchi 5 ta hayot bilan boshlaydi</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {(phase === "preview" || phase === "play") && (
          <div className="space-y-6">
            {/* HUD */}
            <div className="grid gap-4 md:grid-cols-4">
              {/* Time */}
              <div className="relative transform-gpu overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 p-4 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10" />
                <p className="relative text-xs font-bold text-emerald-400">⏰ VAQT</p>
                <p className="relative text-2xl font-black text-white">{formatTime(gameTimeLeft)}</p>
                <div className="relative mt-2 h-1.5 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" style={{ width: `${(gameTimeLeft / gameTimeLimit) * 100}%` }} />
                </div>
              </div>

              {/* Progress */}
              <div className="relative transform-gpu overflow-hidden rounded-xl border border-teal-500/20 bg-gradient-to-br from-teal-900/30 to-cyan-900/30 p-4 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10" />
                <p className="relative text-xs font-bold text-teal-400">📊 PROGRESS</p>
                <p className="relative text-2xl font-black text-white">{pairs[0] + pairs[1]}/{totalPairs}</p>
                <div className="relative mt-2 h-1.5 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-400" style={{ width: `${progressPct}%` }} />
                </div>
              </div>

              {/* Current Player */}
              <div className="relative transform-gpu overflow-hidden rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-900/30 to-emerald-900/30 p-4 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10" />
                <p className="relative text-xs font-bold text-cyan-400">🎮 NAVBAT</p>
                <p className="relative text-xl font-black text-white truncate">{currentPlayer}</p>
                {phase === "preview" && (
                  <div className="relative mt-1 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-300 inline-block">
                    👀 Preview: {previewLeft}s
                  </div>
                )}
              </div>

              {/* Score */}
              <div className="relative transform-gpu overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/30 to-cyan-900/30 p-4 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10" />
                <p className="relative text-xs font-bold text-emerald-400">🏆 BALL</p>
                <p className="relative text-2xl font-black text-white">{score}</p>
                <p className="relative text-xs text-gray-400 mt-1">Combo: {streak[0] + streak[1]}x</p>
              </div>
            </div>

            {/* Players */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Player 1 */}
              <div className={`relative transform-gpu overflow-hidden rounded-xl border-2 p-6 backdrop-blur-xl transition-all ${
                active === 0 
                  ? 'border-emerald-400/50 bg-emerald-900/40 scale-105' 
                  : 'border-white/10 bg-white/5'
              }`}>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10" />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500">
                      <FaArrowLeft className="text-xl text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-400">⚔️ 1-O'YINCHI</p>
                      <p className="text-lg font-black text-white">{playerNames[0]}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-emerald-400">{pairs[0]}</p>
                    <p className="text-xs text-gray-400">juft</p>
                  </div>
                </div>
                
                <div className="relative mt-4 flex items-center justify-between">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      i < lives[0] 
                        ? <FaHeart key={i} className="text-rose-400 animate-pulse" />
                        : <FaRegHeart key={i} className="text-gray-600" />
                    ))}
                  </div>
                  {streak[0] > 0 && (
                    <div className="flex items-center gap-1 text-yellow-300">
                      <FaBolt />
                      <span className="text-sm font-bold">{streak[0]}x Combo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Player 2 */}
              <div className={`relative transform-gpu overflow-hidden rounded-xl border-2 p-6 backdrop-blur-xl transition-all ${
                active === 1 
                  ? 'border-teal-400/50 bg-teal-900/40 scale-105' 
                  : 'border-white/10 bg-white/5'
              }`}>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10" />
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500">
                      <FaArrowRight className="text-xl text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-teal-400">🛡️ 2-O'YINCHI</p>
                      <p className="text-lg font-black text-white">{playerNames[1]}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-teal-400">{pairs[1]}</p>
                    <p className="text-xs text-gray-400">juft</p>
                  </div>
                </div>
                
                <div className="relative mt-4 flex items-center justify-between">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      i < lives[1] 
                        ? <FaHeart key={i} className="text-rose-400 animate-pulse" />
                        : <FaRegHeart key={i} className="text-gray-600" />
                    ))}
                  </div>
                  {streak[1] > 0 && (
                    <div className="flex items-center gap-1 text-yellow-300">
                      <FaBolt />
                      <span className="text-sm font-bold">{streak[1]}x Combo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Board */}
            <div className={`grid gap-2 sm:gap-3 ${gridClass}`}>
              {deck.map((card, idx) => {
                const st = cardState[idx];
                const faceUp = st?.isFaceUp || phase === "preview";
                const matched = st?.isMatched;
                const shake = st?.shake;

                if (matched) {
                  return (
                    <div
                      key={card.id}
                      className="relative aspect-square rounded-xl sm:rounded-2xl border-2 border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center"
                    >
                      <span className="text-4xl drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)] sm:text-5xl md:text-6xl opacity-50">
                        {card.label}
                      </span>
                    </div>
                  );
                }

                return (
                  <button
                    key={card.id}
                    onClick={() => onPick(idx)}
                    disabled={phase !== "play" || lockInput}
                    className="relative aspect-square rounded-xl sm:rounded-2xl"
                    style={{ perspective: "1000px" }}
                  >
                    <div
                      className={`absolute inset-0 rounded-xl sm:rounded-2xl transition-all duration-500 ${
                        shake ? "animate-shake" : ""
                      }`}
                      style={{
                        transformStyle: "preserve-3d",
                        transform: faceUp ? "rotateY(180deg)" : "rotateY(0deg)",
                      }}
                    >
                      {/* Back */}
                      <div
                        className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-900/70 to-teal-900/70 shadow-lg backdrop-blur-sm flex items-center justify-center"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <div className="text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-black/25">
                            <GiBrain className="text-2xl text-emerald-400" />
                          </div>
                          <div className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                            Memory
                          </div>
                        </div>
                      </div>

                      {/* Front */}
                      <div
                        className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-emerald-400/30 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 shadow-lg flex items-center justify-center backdrop-blur-sm"
                        style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
                      >
                        <span className="text-4xl drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)] sm:text-5xl md:text-6xl">
                          {card.label}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <button
                onClick={resetBoard}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3 font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
              >
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                <span className="relative flex items-center gap-3">
                  <MdRefresh />
                  QAYTA BOSHLASH
                </span>
              </button>
              <button
                onClick={finishGame}
                className="group relative overflow-hidden rounded-xl bg-white/10 px-8 py-3 font-bold text-white border border-white/20 transition-all hover:bg-white/20"
              >
                <span className="relative flex items-center gap-2">
                  <FaCrown />
                  YAKUNLASH
                </span>
              </button>
            </div>
          </div>
        )}

        {phase === "finish" && (
          <div className="relative transform-gpu overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/30 via-teal-900/30 to-cyan-900/30 p-8 backdrop-blur-xl text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10" />
            
            <div className="relative mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-yellow-400/30" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500">
                  <FaCrown className="text-4xl text-white" />
                </div>
              </div>
            </div>
            
            <h2 className="relative mb-4 text-4xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              {winnerText}
            </h2>
            
            <div className="relative mx-auto mb-8 max-w-md rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-emerald-400 font-bold">{playerNames[0]}</p>
                  <p className="text-3xl font-black text-white">{pairs[0]}</p>
                  <p className="text-xs text-gray-400">juft</p>
                </div>
                <div className="text-center">
                  <p className="text-teal-400 font-bold">{playerNames[1]}</p>
                  <p className="text-3xl font-black text-white">{pairs[1]}</p>
                  <p className="text-xs text-gray-400">juft</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Umumiy ball</span>
                  <span className="text-2xl font-black text-yellow-300">{finalScore}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-400">Daraja</span>
                  <span className="flex items-center gap-2 text-lg font-bold text-white">
                    {rank.icon}
                    {rank.label}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="relative flex justify-center gap-4">
              <button
                onClick={resetBoard}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
              >
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                <span className="relative flex items-center gap-2">
                  <FaPlay />
                  QAYTA O'YNA
                </span>
              </button>
              
              <button
                onClick={restart}
                className="group relative overflow-hidden rounded-xl bg-white/10 px-6 py-3 font-bold text-white border border-white/20 transition-all hover:bg-white/20"
              >
                <span className="relative flex items-center gap-2">
                  <FaRedo />
                  BOSH SAHIFA
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
