import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaClock,
  FaHome,
  FaMedal,
  FaPalette,
  FaPlay,
  FaRedo,
  FaTimes,
  FaTrophy,
  FaUser,
  FaCrown,
  FaStar,
  FaEye,
} from "react-icons/fa";
import {GiLevelFour } from "react-icons/gi";
import { MdTimer } from "react-icons/md";
import { useFinishApplause } from "../../../hooks/useFinishApplause";
import useGameLeaderboard, {
  submitGameResult,
} from "../../../hooks/useGameLeaderboard";
import type { GameLeaderboardEntry } from "../../../types/types";

type RoundState = {
  count: number;
  columns: number;
  oddIndex: number;
  baseColor: string;
  oddColor: string;
};

type EndReason = "time" | "wrong";

const GRID_SEQUENCE = [
  4, 9, 9, 16, 16, 25, 25, 36, 36, 49, 49, 64, 64, 64, 64, 81, 81, 81, 100,
  100, 100, 100,
];

const START_TIME = 20;
const SCORE_PER_HIT = 10;
const BONUS_TIME_PER_HIT = 2;
const BEST_SCORE_KEY = "edu_study_find_color_best_score";
const FIND_COLOR_GAME_KEY = "find-color";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getMetadataNumber(entry: GameLeaderboardEntry, key: string) {
  const value = entry.metadata && typeof entry.metadata === "object"
    ? entry.metadata[key]
    : undefined;

  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getGridCount(level: number) {
  const index = clamp(level - 1, 0, GRID_SEQUENCE.length - 1);
  return GRID_SEQUENCE[index];
}

function getRound(level: number): RoundState {
  const count = getGridCount(level);
  const columns = Math.round(Math.sqrt(count));
  const oddIndex = Math.floor(Math.random() * count);

  const hue = Math.floor(Math.random() * 360);
  const saturation = 58 + Math.floor(Math.random() * 20);
  const lightness = 42 + Math.floor(Math.random() * 12);
  const delta = clamp(18 - Math.floor(level * 0.65), 3, 18);
  const oddLightness = clamp(
    lightness + (Math.random() > 0.5 ? delta : -delta),
    15,
    84
  );

  return {
    count,
    columns,
    oddIndex,
    baseColor: `hsl(${hue} ${saturation}% ${lightness}%)`,
    oddColor: `hsl(${hue} ${saturation}% ${oddLightness}%)`,
  };
}

function FindDifferentColor() {
  const submissionFingerprintRef = useRef<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [nameError, setNameError] = useState(false);

  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const raw = window.localStorage.getItem(BEST_SCORE_KEY);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  });
  const [timeLeft, setTimeLeft] = useState(START_TIME);
  const [elapsed, setElapsed] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  useFinishApplause(isGameOver);
  const [endReason, setEndReason] = useState<EndReason>("time");
  const [selectedWrongIndex, setSelectedWrongIndex] = useState<number | null>(
    null
  );
  const [roundSeed, setRoundSeed] = useState(0);
  const [hitPulse, setHitPulse] = useState(false);
  const [shakeBoard, setShakeBoard] = useState(false);
  const [isClickLocked, setIsClickLocked] = useState(false);
  const [round, setRound] = useState<RoundState>(() => getRound(1));
  const { entries, loading, reload } = useGameLeaderboard(FIND_COLOR_GAME_KEY, 20);

  const progressPercent = useMemo(
    () => (timeLeft / START_TIME) * 100,
    [timeLeft]
  );

  const leaderboard = useMemo(() => entries.slice(0, 10), [entries]);
  const currentPlayerName = playerName.trim();
  const currentPlayerRank = useMemo(
    () =>
      currentPlayerName
        ? leaderboard.findIndex(
            (entry) => entry.participant_name.trim().toLowerCase() === currentPlayerName.toLowerCase(),
          ) + 1
        : 0,
    [currentPlayerName, leaderboard],
  );

  useEffect(() => {
    if (isGameOver || !hasStarted) return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [hasStarted, isGameOver]);

  useEffect(() => {
    if (timeLeft === 0 && !isGameOver && hasStarted) {
      setEndReason("time");
      setIsGameOver(true);
    }
  }, [timeLeft, isGameOver, hasStarted]);


  useEffect(() => {
    if (!isGameOver && hasStarted) {
      setRound(getRound(level));
      setRoundSeed((prev) => prev + 1);
      setSelectedWrongIndex(null);
      setIsClickLocked(false);
    }
  }, [level, isGameOver, hasStarted]);

  useEffect(() => {
    if (!isGameOver || !currentPlayerName) {
      submissionFingerprintRef.current = null;
      return;
    }

    const fingerprint = JSON.stringify({
      name: currentPlayerName,
      score,
      level,
      elapsed,
      reason: endReason,
    });

    if (submissionFingerprintRef.current === fingerprint) {
      return;
    }

    submissionFingerprintRef.current = fingerprint;

    void (async () => {
      const saved = await submitGameResult(FIND_COLOR_GAME_KEY, {
        participant_name: currentPlayerName,
        participant_mode: "1 o'yinchi",
        score,
        metadata: {
          level,
          elapsed_seconds: elapsed,
          end_reason: endReason,
        },
      });

      if (saved) {
        void reload();
      }
    })();
  }, [currentPlayerName, elapsed, endReason, isGameOver, level, reload, score]);

  const start = () => {
    if (playerName.trim().length < 2) {
      setNameError(true);
      return;
    }
    setNameError(false);
    setHasStarted(true);
  };

  const restart = () => {
    setLevel(1);
    setScore(0);
    setTimeLeft(START_TIME);
    setElapsed(0);
    setIsGameOver(false);
    setEndReason("time");
    setSelectedWrongIndex(null);
    setHitPulse(false);
    setShakeBoard(false);
    setIsClickLocked(false);
    setRound(getRound(1));
    setRoundSeed((prev) => prev + 1);
    setHasStarted(true);
  };

  const onTileClick = (index: number) => {
    if (isGameOver || !hasStarted || isClickLocked) return;
    setIsClickLocked(true);

    if (index !== round.oddIndex) {
      setSelectedWrongIndex(index);
      setShakeBoard(true);
      window.setTimeout(() => setShakeBoard(false), 360);
      setEndReason("wrong");
      setIsGameOver(true);
      return;
    }

    setHitPulse(true);
    window.setTimeout(() => setHitPulse(false), 260);

    setScore((prev) => {
      const next = prev + SCORE_PER_HIT;
      if (next > bestScore) {
        setBestScore(next);
        window.localStorage.setItem(BEST_SCORE_KEY, String(next));
      }
      return next;
    });

    setTimeLeft((prev) => prev + BONUS_TIME_PER_HIT);
    setLevel((prev) => prev + 1);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] animate-pulse-slow rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] animate-pulse-slower rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-indigo-500/10 blur-3xl" />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-cyan-400/20 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-5 py-2.5 border border-cyan-500/30 backdrop-blur-sm">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-400/30" />
              <FaPalette className="relative text-cyan-400 text-xl" />
            </div>
            <span className="text-sm font-black tracking-wider text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text">
              NEON FOCUS MODE
            </span>
          </div>

          <div className="flex gap-3">
            <Link
              to="/games"
              className="group relative overflow-hidden rounded-xl bg-slate-800/80 px-5 py-2.5 text-sm font-bold text-slate-200 border border-slate-700/50 transition-all hover:border-cyan-500/30"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                <FaHome className="text-cyan-400" />
                O'yinlar
              </span>
            </Link>
            <button
              onClick={restart}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2.5 text-sm font-extrabold text-white transition-all hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
              <span className="relative flex items-center gap-2">
                <FaRedo />
                Restart
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
          {/* Main Game Area */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-800/50 to-indigo-800/50 p-5 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Daraja</p>
                  <div className="flex items-end justify-between">
                    <p className="text-4xl font-black text-cyan-400">{level}</p>
                    <GiLevelFour className="text-2xl text-cyan-400/50" />
                  </div>
                  <div className="mt-2 h-1 w-full rounded-full bg-slate-700 overflow-hidden">
                    <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400" />
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-800/50 to-indigo-800/50 p-5 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Ball</p>
                  <div className="flex items-end justify-between">
                    <p className="text-4xl font-black text-cyan-400">{score}</p>
                    <FaStar className="text-2xl text-yellow-400/50" />
                  </div>
                  <div className="mt-2 h-1 w-full rounded-full bg-slate-700 overflow-hidden">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-400" />
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-800/50 to-indigo-800/50 p-5 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Rekord</p>
                  <div className="flex items-end justify-between">
                    <p className="text-4xl font-black text-amber-400">{bestScore}</p>
                    <FaCrown className="text-2xl text-amber-400/50" />
                  </div>
                  <div className="mt-2 h-1 w-full rounded-full bg-slate-700 overflow-hidden">
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Game Board */}
            {!hasStarted ? (
              <div className="rounded-3xl border-2 border-cyan-500/30 bg-gradient-to-br from-slate-800/90 to-indigo-800/90 p-8 backdrop-blur-sm">
                <div className="max-w-md mx-auto text-center">
                  <div className="relative mb-6 inline-block">
                    <div className="absolute inset-0 rounded-full bg-cyan-400/30" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto">
                      <FaUser className="text-3xl text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black text-white mb-2">O'yinga kirish</h3>
                  <p className="text-slate-400 mb-6">Reytingda qatnashish uchun ismingizni kiriting</p>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={playerName}
                        onChange={(e) => {
                          setPlayerName(e.target.value);
                          if (nameError && e.target.value.trim().length >= 2) {
                            setNameError(false);
                          }
                        }}
                        placeholder="Ismingiz..."
                        className="w-full bg-slate-900/80 border-2 border-cyan-500/30 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors"
                      />
                      <FaUser className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    </div>
                    
                    {nameError && (
                      <p className="text-sm font-semibold text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
                        Kamida 2 ta harf kiriting!
                      </p>
                    )}
                    
                    <button
                      onClick={start}
                      className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4 text-lg font-extrabold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                      <span className="relative flex items-center justify-center gap-3">
                        <FaPlay />
                        O'YINNI BOSHLASH
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Timer and Progress */}
                <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-800/50 to-indigo-800/50 p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${timeLeft <= 7 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                      <p className="text-sm font-semibold text-slate-300">Farqli rangni toping</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MdTimer className="text-cyan-400" />
                      <span className={`text-xl font-black ${timeLeft <= 7 ? 'text-red-400' : 'text-cyan-400'}`}>
                        {timeLeft}s
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                      style={{ width: `${Math.max(0, progressPercent)}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                    </div>
                  </div>
                </div>

                {/* Color Grid */}
                <div
                  className={`relative rounded-3xl border-2 border-cyan-500/30 bg-gradient-to-br from-slate-800/90 to-indigo-800/90 p-6 backdrop-blur-sm transition-all ${
                    hitPulse ? "ring-4 ring-cyan-400/30" : ""
                     } ${shakeBoard ? "animate-shake" : ""} ${
                    isClickLocked && !isGameOver ? "pointer-events-none" : ""
                  }`}
                 >
                  <div
                    className="grid gap-3 select-none"
                    style={{
                      gridTemplateColumns: `repeat(${round.columns}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: round.count }, (_, index) => (
                      <button
                        key={`tile-${level}-${roundSeed}-${index}`}
                        onClick={() => onTileClick(index)}
                        disabled={isClickLocked || isGameOver}
                        className={`
                          group relative aspect-square rounded-xl border-2 transition-all duration-200
                          hover:scale-105 hover:shadow-2xl active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
                          ${isGameOver && endReason === "wrong" && index === round.oddIndex
                            ? "ring-4 ring-green-500 border-green-500"
                            : ""
                          }
                          ${isGameOver && endReason === "wrong" && selectedWrongIndex === index
                            ? "ring-4 ring-red-500 border-red-500"
                            : ""
                          }
                          ${!isGameOver && "hover:border-white/40"}
                        `}
                        style={{
                          background: index === round.oddIndex ? round.oddColor : round.baseColor,
                          borderColor: 'rgba(255,255,255,0.1)',
                        }}
                      >
                        {/* <span className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/5 transition-colors" />
                        
                        <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" /> */}
                      </button>
                    ))}
                  </div>

                  {/* Game Over Modal */}
                  {isGameOver && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center rounded-3xl bg-slate-950/80 p-4 backdrop-blur-md">
                      <div className="w-full max-w-md animate-modal-in">
                        <div className="rounded-3xl border-2 border-cyan-500/30 bg-gradient-to-br from-slate-800 to-indigo-800 p-6 text-center shadow-2xl">
                          <div className="relative mb-4 inline-block">
                            <div className="absolute inset-0 rounded-full bg-cyan-400/30" />
                            <div className={`relative flex h-24 w-24 items-center justify-center rounded-full mx-auto ${
                              endReason === "wrong" ? "bg-red-500" : "bg-amber-500"
                            }`}>
                              {endReason === "wrong" ? (
                                <FaTimes className="text-4xl text-white" />
                              ) : (
                                <FaClock className="text-4xl text-white" />
                              )}
                            </div>
                          </div>

                          <h3 className="text-3xl font-black text-white mb-2">
                            {endReason === "wrong" ? "XATO RANG!" : "VAQT TUGADI!"}
                          </h3>
                          
                          <p className="text-5xl font-black text-cyan-400 mb-4">{score}</p>
                          
                          {endReason === "wrong" && (
                            <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                              <p className="text-sm font-bold text-green-400">
                                To'g'ri katak #{round.oddIndex + 1}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                Qator: {Math.floor(round.oddIndex / round.columns) + 1}, 
                                Ustun: {(round.oddIndex % round.columns) + 1}
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="bg-slate-900/80 rounded-xl p-3">
                              <p className="text-2xl font-black text-cyan-400">{level}</p>
                              <p className="text-xs text-slate-400">Daraja</p>
                            </div>
                            <div className="bg-slate-900/80 rounded-xl p-3">
                              <p className="text-2xl font-black text-cyan-400">{score}</p>
                              <p className="text-xs text-slate-400">Ball</p>
                            </div>
                            <div className="bg-slate-900/80 rounded-xl p-3">
                              <p className="text-2xl font-black text-cyan-400">{elapsed}s</p>
                              <p className="text-xs text-slate-400">Vaqt</p>
                            </div>
                          </div>

                          <button
                            onClick={restart}
                            className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-lg font-extrabold text-white mb-3 hover:scale-[1.02] transition-all"
                          >
                            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                            <span className="relative flex items-center justify-center gap-2">
                              <FaRedo />
                              QAYTADAN BOSHLASH
                            </span>
                          </button>

                          <Link
                            to="/games"
                            className="block cursor-pointer w-full rounded-xl border-2 border-slate-700 bg-slate-900/50 px-5 py-3 text-lg font-bold text-slate-300 hover:bg-slate-800/50 transition-all"
                          >
                            <FaHome className="inline mr-2" />
                            Asosiy sahifa
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Leaderboard Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-3xl border-2 border-cyan-500/30 bg-gradient-to-br from-slate-800/90 to-indigo-800/90 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-amber-400/30" />
                  <FaTrophy className="relative text-2xl text-amber-400" />
                </div>
                <h3 className="text-lg font-black text-white">GLOBAL REYTING</h3>
              </div>

              <p className="text-sm text-slate-400 mb-6">
                Eng yaxshi natijalar va rekordlar
              </p>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {loading ? (
                  <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 text-sm text-slate-400">
                    Leaderboard yuklanmoqda...
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 text-sm text-slate-400">
                    Hozircha natijalar yo'q. Birinchi rekordni o'rnating.
                  </div>
                ) : leaderboard.map((item, index) => {
                  const itemLevel = getMetadataNumber(item, "level");
                  const elapsedSeconds = getMetadataNumber(item, "elapsed_seconds");
                  const isCurrentPlayer =
                    currentPlayerName.length > 0 &&
                    item.participant_name.trim().toLowerCase() === currentPlayerName.toLowerCase();

                  return (
                  <div
                    key={item.id}
                    className={`group relative overflow-hidden rounded-xl p-4 transition-all hover:scale-[1.02] ${
                      index === 0
                        ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30'
                        : index === 1
                        ? 'bg-gradient-to-r from-slate-500/20 to-slate-400/20 border border-slate-500/30'
                        : index === 2
                        ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30'
                        : isCurrentPlayer
                        ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30'
                        : 'bg-slate-900/50 border border-slate-700'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    
                    <div className="relative flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-black ${
                        index === 0
                          ? 'bg-amber-500 text-white'
                          : index === 1
                          ? 'bg-slate-400 text-slate-900'
                          : index === 2
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}>
                        {index < 3 ? <FaMedal /> : index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <p className="text-sm font-black text-white">{item.participant_name}</p>
                        <p className="text-xs text-slate-400">
                          Daraja {itemLevel ?? "?"}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xl font-black text-cyan-400">{item.score}</p>
                        <p className="text-xs text-slate-400">
                          {elapsedSeconds !== null ? `${elapsedSeconds}s` : "vaqt yo'q"}
                        </p>
                      </div>
                    </div>
                  </div>
                )})}
              </div>

              {/* Current Player Stats */}
              {hasStarted && playerName && (
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
                  <p className="text-xs text-slate-400 mb-1">Sizning natijangiz</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-cyan-400" />
                      <span className="text-sm font-bold text-white">{playerName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {currentPlayerRank > 0 ? (
                        <span className="text-sm text-slate-400">#{currentPlayerRank}</span>
                      ) : null}
                      <span className="text-sm text-slate-400">Ball:</span>
                      <span className="text-lg font-black text-cyan-400">{score}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-800/50 to-indigo-800/50 p-4 backdrop-blur-sm">
              <h4 className="text-sm font-bold text-cyan-400 mb-3 flex items-center gap-2">
                <FaEye />
                Tez maslahatlar
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Har bir to'g'ri javob +{SCORE_PER_HIT} ball</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Har to'g'ri javob +{BONUS_TIME_PER_HIT} soniya vaqt</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Daraja oshgan sari ranglar farqi kamayadi</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

    
    </div>
  );
}

export default FindDifferentColor;

