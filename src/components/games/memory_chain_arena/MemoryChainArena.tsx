import { useCallback, useEffect, useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  FaAppleAlt,
  FaBullseye,
  FaMusic,
  FaPuzzlePiece,
  FaRocket,
  FaStar,
} from "react-icons/fa";
import { GiBrain } from "react-icons/gi";
import Confetti from "react-confetti-boom";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../shared/useGameStartCountdown";

type Difficulty = "Oson" | "O'rta" | "Qiyin";
type Side = "left" | "right";
type TeamStatus = "waiting" | "correct" | "wrong" | "timeout";
type Phase = "ready" | "preview" | "input" | "result" | "finished";
type Winner = Side | "draw";

type MemoryChainArenaProps = {
  gameTitle: string;
  gameTone: string;
  leftTeamName?: string;
  rightTeamName?: string;
  initialDifficulty?: Difficulty;
};

type TeamState = {
  score: number;
  roundsWon: number;
  streak: number;
  bestStreak: number;
  input: number[];
  status: TeamStatus;
  timeLeft: number;
};

type DifficultyConfig = {
  rounds: number;
  startLength: number;
  showStepMs: number;
  gapMs: number;
  inputSeconds: number;
  basePoints: number;
  speedBonusPerSecond: number;
  comboBonus: number;
  nextRoundMs: number;
};

type PadItem = {
  id: number;
  icon: IconType;
  label: string;
  tone: string;
};

const PAD_ITEMS: PadItem[] = [
  { id: 0, icon: FaAppleAlt, label: "Olma", tone: "from-rose-500 to-orange-500" },
  { id: 1, icon: FaStar, label: "Yulduz", tone: "from-amber-400 to-yellow-500" },
  { id: 2, icon: FaPuzzlePiece, label: "Puzzle", tone: "from-violet-500 to-fuchsia-500" },
  { id: 3, icon: FaMusic, label: "Musiqa", tone: "from-cyan-500 to-blue-500" },
  { id: 4, icon: FaBullseye, label: "Nishon", tone: "from-emerald-500 to-lime-500" },
  { id: 5, icon: FaRocket, label: "Raketa", tone: "from-indigo-500 to-sky-500" },
];

const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  Oson: {
    rounds: 6,
    startLength: 3,
    showStepMs: 820,
    gapMs: 180,
    inputSeconds: 30,
    basePoints: 52,
    speedBonusPerSecond: 3,
    comboBonus: 7,
    nextRoundMs: 1250,
  },
  "O'rta": {
    rounds: 8,
    startLength: 4,
    showStepMs: 700,
    gapMs: 160,
    inputSeconds: 30,
    basePoints: 64,
    speedBonusPerSecond: 4,
    comboBonus: 9,
    nextRoundMs: 1150,
  },
  Qiyin: {
    rounds: 10,
    startLength: 5,
    showStepMs: 580,
    gapMs: 140,
    inputSeconds: 30,
    basePoints: 78,
    speedBonusPerSecond: 5,
    comboBonus: 11,
    nextRoundMs: 1050,
  },
};

const createTeamState = (seconds: number): TeamState => ({
  score: 0,
  roundsWon: 0,
  streak: 0,
  bestStreak: 0,
  input: [],
  status: "waiting",
  timeLeft: seconds,
});

const generateSequence = (length: number): number[] => {
  const next: number[] = [];
  let previous = -1;

  for (let i = 0; i < length; i += 1) {
    let value = Math.floor(Math.random() * PAD_ITEMS.length);
    if (value === previous) {
      value = (value + 1 + Math.floor(Math.random() * (PAD_ITEMS.length - 1))) % PAD_ITEMS.length;
    }
    next.push(value);
    previous = value;
  }

  return next;
};

function MemoryChainArena({
  gameTitle,
  leftTeamName = "1-Jamoa",
  rightTeamName = "2-Jamoa",
  initialDifficulty = "O'rta",
}: MemoryChainArenaProps) {
  const config = DIFFICULTY_CONFIG[initialDifficulty];
  const totalRounds = config.rounds;
  const leftLabel = leftTeamName.trim() || "1-Jamoa";
  const rightLabel = rightTeamName.trim() || "2-Jamoa";

  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<Phase>("ready");
  const [leftTeam, setLeftTeam] = useState<TeamState>(() => createTeamState(config.inputSeconds));
  const [rightTeam, setRightTeam] = useState<TeamState>(() => createTeamState(config.inputSeconds));
  const [leftSequence, setLeftSequence] = useState<number[]>([]);
  const [rightSequence, setRightSequence] = useState<number[]>([]);
  const [leftFlash, setLeftFlash] = useState<number | null>(null);
  const [rightFlash, setRightFlash] = useState<number | null>(null);
  const [statusText, setStatusText] = useState("Start tugmasini bosing, zanjirni eslab qoling va tez toping.");
  const [winner, setWinner] = useState<Winner | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();

  const currentLength = config.startLength + round - 1;
  const progressRounds = phase === "ready" ? 0 : phase === "finished" ? totalRounds : Math.max(0, round - 1);
  const progressPercent = Math.round((progressRounds / totalRounds) * 100);
  const roundLabel = `${round}/${totalRounds}`;

  const resolveWinner = useCallback((): Winner => {
    if (leftTeam.score > rightTeam.score) return "left";
    if (rightTeam.score > leftTeam.score) return "right";
    if (leftTeam.roundsWon > rightTeam.roundsWon) return "left";
    if (rightTeam.roundsWon > leftTeam.roundsWon) return "right";
    return "draw";
  }, [leftTeam.score, rightTeam.score, leftTeam.roundsWon, rightTeam.roundsWon]);

  const openRound = useCallback(
    (nextRound: number) => {
      const length = config.startLength + nextRound - 1;
      const sharedSequence = generateSequence(length);
      setRound(nextRound);
      setLeftSequence(sharedSequence);
      setRightSequence(sharedSequence);
      setLeftFlash(null);
      setRightFlash(null);
      setLeftTeam((prev) => ({ ...prev, input: [], status: "waiting", timeLeft: config.inputSeconds }));
      setRightTeam((prev) => ({ ...prev, input: [], status: "waiting", timeLeft: config.inputSeconds }));
      setPhase("preview");
      setStatusText(`${nextRound}-raund: zanjirni eslab qoling.`);
    },
    [config.startLength, config.inputSeconds],
  );

  const startMatchNow = () => {
    setLeftTeam(createTeamState(config.inputSeconds));
    setRightTeam(createTeamState(config.inputSeconds));
    setWinner(null);
    setShowWinnerModal(false);
    setShowConfetti(false);
    openRound(1);
  };

  const handleStartMatch = () => runStartCountdown(startMatchNow);

  const resetMatch = () => {
    setRound(1);
    setPhase("ready");
    setLeftTeam(createTeamState(config.inputSeconds));
    setRightTeam(createTeamState(config.inputSeconds));
    setLeftSequence([]);
    setRightSequence([]);
    setLeftFlash(null);
    setRightFlash(null);
    setWinner(null);
    setShowWinnerModal(false);
    setShowConfetti(false);
    setStatusText("Start tugmasini bosing, zanjirni eslab qoling va tez toping.");
  };

  const evaluatePress = (side: Side, padId: number) => {
    if (phase !== "input") return;
    if (leftTeam.status === "correct" || rightTeam.status === "correct") return;

    if (side === "left") {
      if (leftTeam.status !== "waiting") return;
      const expected = leftSequence[leftTeam.input.length];

      if (padId !== expected) {
        setLeftTeam((prev) => ({ ...prev, status: "wrong", streak: 0 }));
        setStatusText(`${leftLabel} xato bosdi. Raund yakunini kuting.`);
        return;
      }

      const nextInput = [...leftTeam.input, padId];
      const isComplete = nextInput.length === leftSequence.length;

      if (!isComplete) {
        setLeftTeam((prev) => ({ ...prev, input: nextInput }));
        return;
      }

      const nextStreak = leftTeam.streak + 1;
      const speedBonus = Math.max(0, leftTeam.timeLeft * config.speedBonusPerSecond);
      const gained = config.basePoints + speedBonus + nextStreak * config.comboBonus;

      setLeftTeam((prev) => ({
        ...prev,
        input: nextInput,
        status: "correct",
        roundsWon: prev.roundsWon + 1,
        streak: nextStreak,
        bestStreak: Math.max(prev.bestStreak, nextStreak),
        score: prev.score + gained,
      }));
      setStatusText(`${leftLabel} to'g'ri tugatdi. +${gained} ball`);
      return;
    }

    if (rightTeam.status !== "waiting") return;
    const expected = rightSequence[rightTeam.input.length];

    if (padId !== expected) {
      setRightTeam((prev) => ({ ...prev, status: "wrong", streak: 0 }));
      setStatusText(`${rightLabel} xato bosdi. Raund yakunini kuting.`);
      return;
    }

    const nextInput = [...rightTeam.input, padId];
    const isComplete = nextInput.length === rightSequence.length;

    if (!isComplete) {
      setRightTeam((prev) => ({ ...prev, input: nextInput }));
      return;
    }

    const nextStreak = rightTeam.streak + 1;
    const speedBonus = Math.max(0, rightTeam.timeLeft * config.speedBonusPerSecond);
    const gained = config.basePoints + speedBonus + nextStreak * config.comboBonus;

    setRightTeam((prev) => ({
      ...prev,
      input: nextInput,
      status: "correct",
      roundsWon: prev.roundsWon + 1,
      streak: nextStreak,
      bestStreak: Math.max(prev.bestStreak, nextStreak),
      score: prev.score + gained,
    }));
    setStatusText(`${rightLabel} to'g'ri tugatdi. +${gained} ball`);
  };

  useEffect(() => {
    if (phase !== "preview") return;
    if (leftSequence.length === 0 || rightSequence.length === 0) return;

    let cancelled = false;
    const timerIds: number[] = [];
    let step = 0;
    const totalSteps = Math.min(leftSequence.length, rightSequence.length);

    const playStep = () => {
      if (cancelled) return;

      if (step >= totalSteps) {
        setLeftFlash(null);
        setRightFlash(null);
        setPhase("input");
        setStatusText(`Raund ${roundLabel}: ${leftLabel} va ${rightLabel}, ketma-ketlikni qaytaring.`);
        return;
      }

      setLeftFlash(leftSequence[step] ?? null);
      setRightFlash(rightSequence[step] ?? null);

      const hideTimer = window.setTimeout(() => {
        if (cancelled) return;
        setLeftFlash(null);
        setRightFlash(null);
        step += 1;
        const nextTimer = window.setTimeout(playStep, config.gapMs);
        timerIds.push(nextTimer);
      }, config.showStepMs);

      timerIds.push(hideTimer);
    };

    const starter = window.setTimeout(playStep, 250);
    timerIds.push(starter);

    return () => {
      cancelled = true;
      timerIds.forEach((id) => window.clearTimeout(id));
    };
  }, [phase, leftSequence, rightSequence, config.showStepMs, config.gapMs, roundLabel, leftLabel, rightLabel]);

  useEffect(() => {
    if (phase !== "input") return;

    const timer = window.setInterval(() => {
      setLeftTeam((prev) => {
        if (prev.status !== "waiting") return prev;
        if (prev.timeLeft <= 1) return { ...prev, timeLeft: 0, status: "timeout", streak: 0 };
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
      setRightTeam((prev) => {
        if (prev.status !== "waiting") return prev;
        if (prev.timeLeft <= 1) return { ...prev, timeLeft: 0, status: "timeout", streak: 0 };
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "input") return;
    const someoneCorrect = leftTeam.status === "correct" || rightTeam.status === "correct";
    const bothResolved = leftTeam.status !== "waiting" && rightTeam.status !== "waiting";
    if (!someoneCorrect && !bothResolved) return;

    setPhase("result");
    if (leftTeam.status === "correct") {
      setStatusText(`${leftLabel} birinchi bo'lib to'g'ri topdi va raundni yutdi.`);
      return;
    }
    if (rightTeam.status === "correct") {
      setStatusText(`${rightLabel} birinchi bo'lib to'g'ri topdi va raundni yutdi.`);
      return;
    }
    setStatusText("Ikkala jamoa ham topa olmadi. Keyingi zanjirga o'tiladi.");
  }, [phase, leftTeam.status, rightTeam.status, leftLabel, rightLabel]);

  useEffect(() => {
    if (phase !== "result") return;

    const timer = window.setTimeout(() => {
      if (round >= totalRounds) {
        const resolved = resolveWinner();
        setWinner(resolved);
        setShowWinnerModal(true);
        setPhase("finished");

        if (resolved === "left") {
          setStatusText(`${leftLabel} g'olib bo'ldi.`);
          setShowConfetti(true);
          return;
        }
        if (resolved === "right") {
          setStatusText(`${rightLabel} g'olib bo'ldi.`);
          setShowConfetti(true);
          return;
        }
        setStatusText("Durang natija.");
        return;
      }
      openRound(round + 1);
    }, config.nextRoundMs);

    return () => window.clearTimeout(timer);
  }, [phase, round, totalRounds, resolveWinner, leftLabel, rightLabel, openRound, config.nextRoundMs]);

  useEffect(() => {
    if (!showConfetti) return;
    const timer = window.setTimeout(() => setShowConfetti(false), 2200);
    return () => window.clearTimeout(timer);
  }, [showConfetti]);

  const winnerLabel = useMemo(() => {
    if (winner === "left") return leftLabel;
    if (winner === "right") return rightLabel;
    if (winner === "draw") return "Durang";
    return "";
  }, [winner, leftLabel, rightLabel]);

  const renderDots = (teamInputLength: number) => (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {Array.from({ length: currentLength }, (_, index) => {
        const filled = index < teamInputLength;
        return (
          <span
            key={`dot-${index}`}
            className={`h-2.5 w-6 rounded-full transition ${filled ? "bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" : "bg-slate-700"}`}
          />
        );
      })}
    </div>
  );

  const roundLocked = phase !== "input" || leftTeam.status === "correct" || rightTeam.status === "correct";

  const renderTeamPanel = (
    side: Side,
    title: string,
    team: TeamState,
    flash: number | null,
    borderTone: string,
    accentTone: string,
  ) => (
    <article className={`relative overflow-hidden rounded-3xl border p-4 backdrop-blur-xl ${borderTone}`}>
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
      <div className="relative flex items-center justify-between gap-2">
        <h3 className="text-3xl font-black tracking-tight text-white">{title}</h3>
        <span className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-extrabold text-white ${accentTone}`}>{team.score} ball</span>
      </div>
      <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-300">
        Raund yutgan: {team.roundsWon} | Combo: {team.streak} | Best: {team.bestStreak}
      </p>

      <div className="mt-3 rounded-2xl border border-white/10 bg-slate-900/60 p-3">
        <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-[0.12em] text-slate-300">
          <span>Zanjir uzunligi: {currentLength}</span>
          <span>{phase === "input" ? `${team.timeLeft}s` : "Tayyor"}</span>
        </div>
        {renderDots(team.input.length)}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {PAD_ITEMS.map((pad) => {
          const Icon = pad.icon;
          const isFlashing = flash === pad.id;
          return (
            <button
              key={`${side}-${pad.id}`}
              type="button"
              onClick={() => evaluatePress(side, pad.id)}
              disabled={roundLocked || team.status !== "waiting"}
              className={`group relative overflow-hidden rounded-2xl border px-2 py-3 text-center transition ${
                isFlashing
                  ? `scale-[1.03] border-transparent bg-gradient-to-br text-white shadow-[0_0_24px_rgba(59,130,246,0.5)] ${pad.tone}`
                  : "border-white/10 bg-slate-900/70 text-slate-200"
              } ${roundLocked || team.status !== "waiting" ? "cursor-not-allowed opacity-70" : "hover:-translate-y-0.5 hover:border-cyan-300/80"}`}
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-black/20 text-lg shadow-inner">
                <Icon />
              </div>
              <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.14em]">{pad.label}</p>
            </button>
          );
        })}
      </div>

      <p
        className={`mt-3 rounded-xl border px-3 py-2 text-xs font-extrabold ${
          team.status === "correct"
            ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-200"
            : team.status === "wrong"
              ? "border-rose-400/50 bg-rose-500/20 text-rose-200"
              : team.status === "timeout"
                ? "border-amber-400/50 bg-amber-500/20 text-amber-200"
                : "border-white/10 bg-slate-900/60 text-slate-300"
        }`}
      >
        Holat: {team.status === "waiting" ? "Javob kiritilmoqda" : team.status === "correct" ? "To'g'ri" : team.status === "wrong" ? "Xato" : "Vaqt tugadi"}
      </p>
    </article>
  );

  return (
    <section className="relative overflow-hidden rounded-3xl border border-cyan-400/25 bg-[radial-gradient(circle_at_15%_20%,rgba(6,182,212,0.18),transparent_35%),radial-gradient(circle_at_85%_80%,rgba(217,70,239,0.18),transparent_35%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#1e1b4b_100%)] p-4 shadow-[0_0_60px_rgba(34,211,238,0.14)] sm:p-5">
      {showConfetti ? (
        <Confetti mode="boom" particleCount={140} effectCount={1} x={0.5} y={0.35} colors={["#06b6d4", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7"]} />
      ) : null}

      <div className="absolute -left-20 top-12 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute -right-16 bottom-10 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-cyan-200 sm:text-xs">
            <GiBrain className="text-cyan-300" /> Memory Chain Protocol
          </p>
          <h2 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">{gameTitle} Arena</h2>
        </div>
      </div>

      <div className="relative mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-300">Raund</p>
          <p className="mt-1 text-3xl font-black text-white">{roundLabel}</p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-300">Daraja</p>
          <p className="mt-1 text-base font-extrabold text-cyan-200">{initialDifficulty}</p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-300">{leftLabel}</p>
          <p className="mt-1 text-xl font-extrabold text-white">{leftTeam.score} ball</p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-300">{rightLabel}</p>
          <p className="mt-1 text-xl font-extrabold text-white">{rightTeam.score} ball</p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-300">Uzunlik</p>
          <p className="mt-1 text-xl font-extrabold text-white">{currentLength} belgi</p>
        </div>
      </div>

      <div className="relative mt-4 rounded-2xl border border-white/15 bg-slate-950/40 p-4">
        <div className="flex items-center justify-between gap-3 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-300">
          <span>Progress: {progressPercent}%</span>
          <span>
            Holat: {phase === "ready" ? "Tayyor" : phase === "preview" ? "Ko'rsatish" : phase === "input" ? "Javob" : phase === "result" ? "Natija" : "Tugadi"}
          </span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(34,211,238,0.9)]" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="relative mt-4 grid gap-4 lg:grid-cols-2">
        {renderTeamPanel("left", leftLabel, leftTeam, leftFlash, "border-cyan-400/40 bg-cyan-500/8", "from-cyan-500 to-blue-500")}
        {renderTeamPanel("right", rightLabel, rightTeam, rightFlash, "border-fuchsia-400/35 bg-fuchsia-500/8", "from-fuchsia-500 to-rose-500")}
      </div>

      <div className="relative mt-4 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={handleStartMatch}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white shadow-lg transition hover:-translate-y-0.5 sm:text-xs"
        >
          {phase === "ready" || phase === "finished" ? "O'yinni boshlash" : "Qayta start"}
        </button>
        <button
          type="button"
          onClick={resetMatch}
          className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white transition hover:bg-white/20 sm:text-xs"
        >
          Nolga tushir
        </button>
      </div>

      <div className={`relative mt-4 rounded-2xl border px-4 py-3 text-sm font-extrabold ${phase === "finished" ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-100" : "border-cyan-400/50 bg-cyan-500/15 text-cyan-100"}`}>
        {statusText}
      </div>

      {showWinnerModal ? (
        <div className="fixed inset-0 z-[95] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-cyan-300/35 bg-[linear-gradient(160deg,#020617,#111827,#1e1b4b)] p-5 shadow-2xl sm:p-6">
            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-500/30 blur-3xl" />
            <div className="absolute -bottom-16 -left-14 h-44 w-44 rounded-full bg-fuchsia-500/25 blur-3xl" />

            <div className="relative">
              <p className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-500/20 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-200">
                Xotira zanjiri yakunlandi
              </p>
              <h3 className="mt-3 text-4xl font-black text-white sm:text-5xl">{winnerLabel === "Durang" ? "Durang natija" : `G'olib: ${winnerLabel}`}</h3>
              <p className="mt-1 text-base font-bold text-slate-300">
                {winnerLabel === "Durang" ? "Ikkala jamoa ham teng natija ko'rsatdi." : `${winnerLabel} eng kuchli xotira natijasini ko'rsatdi.`}
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/5 p-3 text-center">
                  <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-400">{leftLabel}</p>
                  <p className="mt-1 text-2xl font-extrabold text-white">{leftTeam.score}</p>
                  <p className="text-sm font-bold text-slate-300">{leftTeam.roundsWon} raund | combo {leftTeam.bestStreak}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-3 text-center">
                  <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-400">{rightLabel}</p>
                  <p className="mt-1 text-2xl font-extrabold text-white">{rightTeam.score}</p>
                  <p className="text-sm font-bold text-slate-300">{rightTeam.roundsWon} raund | combo {rightTeam.bestStreak}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWinnerModal(false)}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-white/20"
                >
                  Yopish
                </button>
                <button
                  type="button"
                  onClick={handleStartMatch}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5"
                >
                  Yangi raund
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />
    </section>
  );
}

export default MemoryChainArena;
