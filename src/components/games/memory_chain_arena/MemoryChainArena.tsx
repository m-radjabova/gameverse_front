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
import GameLeaderboardPanel from "../shared/GameLeaderboardPanel";
import { useGameStartCountdown } from "../../../hooks/useGameStartCountdown";
import { useFinishApplause } from "../../../hooks/useFinishApplause";
import { useGameResultSubmission } from "../../../hooks/useGameResultSubmission";
import { useGameParticipantMode } from "../../../hooks/useGameParticipantMode";

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
  { id: 0, icon: FaAppleAlt, label: "Olma", tone: "from-cyan-500 to-sky-500" },
  { id: 1, icon: FaStar, label: "Yulduz", tone: "from-blue-500 to-indigo-500" },
  { id: 2, icon: FaPuzzlePiece, label: "Puzzle", tone: "from-indigo-500 to-violet-500" },
  { id: 3, icon: FaMusic, label: "Musiqa", tone: "from-sky-500 to-cyan-500" },
  { id: 4, icon: FaBullseye, label: "Nishon", tone: "from-violet-500 to-fuchsia-500" },
  { id: 5, icon: FaRocket, label: "Raketa", tone: "from-blue-600 to-cyan-500" },
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
  gameTone = "from-cyan-500 to-blue-500",
  leftTeamName = "1-Jamoa",
  rightTeamName = "2-Jamoa",
  initialDifficulty = "O'rta",
}: MemoryChainArenaProps) {
  const { isSinglePlayer, primaryName, secondaryName, modeLabel } = useGameParticipantMode({
    gameId: "memory-chain",
    fallbackPrimaryName: leftTeamName,
    fallbackSecondaryName: rightTeamName,
    singleModeLabel: "1 o'yinchi",
    multiModeLabel: "2 jamoa",
  });
  const config = DIFFICULTY_CONFIG[initialDifficulty];
  const totalRounds = config.rounds;
  const leftLabel = primaryName.trim() || leftTeamName.trim() || "1-Jamoa";
  const rightLabel = secondaryName.trim() || rightTeamName.trim() || "2-Jamoa";
  const statusIntro = isSinglePlayer
    ? "Start tugmasini bosing, zanjirni eslab qoling va yakka tartibda rekord qo'ying."
    : "Start tugmasini bosing, zanjirni eslab qoling va tez toping.";

  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<Phase>("ready");
  useFinishApplause(phase === "finished");
  const [leftTeam, setLeftTeam] = useState<TeamState>(() => createTeamState(config.inputSeconds));
  const [rightTeam, setRightTeam] = useState<TeamState>(() => createTeamState(config.inputSeconds));
  const [leftSequence, setLeftSequence] = useState<number[]>([]);
  const [rightSequence, setRightSequence] = useState<number[]>([]);
  const [leftFlash, setLeftFlash] = useState<number | null>(null);
  const [rightFlash, setRightFlash] = useState<number | null>(null);
  const [statusText, setStatusText] = useState(statusIntro);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();

  const currentLength = config.startLength + round - 1;
  const progressRounds = phase === "ready" ? 0 : phase === "finished" ? totalRounds : Math.max(0, round - 1);
  const progressPercent = Math.round((progressRounds / totalRounds) * 100);
  const roundLabel = `${round}/${totalRounds}`;
  const visibleSides: Side[] = isSinglePlayer ? ["left"] : ["left", "right"];

  useGameResultSubmission(
    phase === "finished",
    "memory-chain",
    isSinglePlayer
      ? [
          {
            participant_name: leftLabel,
            participant_mode: modeLabel,
            score: leftTeam.score,
            metadata: {
              rounds: totalRounds,
              roundsWon: leftTeam.roundsWon,
              bestStreak: leftTeam.bestStreak,
              difficulty: initialDifficulty,
            },
          },
        ]
      : [
          {
            participant_name: leftLabel,
            participant_mode: modeLabel,
            score: leftTeam.score,
            metadata: {
              rounds: totalRounds,
              roundsWon: leftTeam.roundsWon,
              bestStreak: leftTeam.bestStreak,
              difficulty: initialDifficulty,
            },
          },
          {
            participant_name: rightLabel,
            participant_mode: modeLabel,
            score: rightTeam.score,
            metadata: {
              rounds: totalRounds,
              roundsWon: rightTeam.roundsWon,
              bestStreak: rightTeam.bestStreak,
              difficulty: initialDifficulty,
            },
          },
        ],
  );

  const resolveWinner = useCallback((): Winner => {
    if (isSinglePlayer) return "left";
    if (leftTeam.score > rightTeam.score) return "left";
    if (rightTeam.score > leftTeam.score) return "right";
    if (leftTeam.roundsWon > rightTeam.roundsWon) return "left";
    if (rightTeam.roundsWon > leftTeam.roundsWon) return "right";
    return "draw";
  }, [isSinglePlayer, leftTeam.score, rightTeam.score, leftTeam.roundsWon, rightTeam.roundsWon]);

  useEffect(() => {
    setStatusText(statusIntro);
  }, [statusIntro]);

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
      setStatusText(
        isSinglePlayer
          ? `${nextRound}-raund: ${leftLabel}, zanjirni eslab qoling.`
          : `${nextRound}-raund: zanjirni eslab qoling.`,
      );
    },
    [config.startLength, config.inputSeconds, isSinglePlayer, leftLabel],
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
    setStatusText(statusIntro);
  };

  const evaluatePress = (side: Side, padId: number) => {
    if (phase !== "input") return;
    if (leftTeam.status === "correct" || (!isSinglePlayer && rightTeam.status === "correct")) return;

    if (side === "left") {
      if (leftTeam.status !== "waiting") return;
      const expected = leftSequence[leftTeam.input.length];

      if (padId !== expected) {
        setLeftTeam((prev) => ({ ...prev, status: "wrong", streak: 0 }));
        setStatusText(
          isSinglePlayer
            ? `${leftLabel} xato bosdi. Keyingi raundga o'tiladi.`
            : `${leftLabel} xato bosdi. Raund yakunini kuting.`,
        );
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

    if (isSinglePlayer) return;
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
        setStatusText(
          isSinglePlayer
            ? `Raund ${roundLabel}: ${leftLabel}, ketma-ketlikni qaytaring.`
            : `Raund ${roundLabel}: ${leftLabel} va ${rightLabel}, ketma-ketlikni qaytaring.`,
        );
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
  }, [phase, leftSequence, rightSequence, config.showStepMs, config.gapMs, roundLabel, leftLabel, rightLabel, isSinglePlayer]);

  useEffect(() => {
    if (phase !== "input") return;

    const timer = window.setInterval(() => {
      setLeftTeam((prev) => {
        if (prev.status !== "waiting") return prev;
        if (prev.timeLeft <= 1) return { ...prev, timeLeft: 0, status: "timeout", streak: 0 };
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
      if (isSinglePlayer) return;
      setRightTeam((prev) => {
        if (prev.status !== "waiting") return prev;
        if (prev.timeLeft <= 1) return { ...prev, timeLeft: 0, status: "timeout", streak: 0 };
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [phase, isSinglePlayer]);

  useEffect(() => {
    if (phase !== "input") return;
    const someoneCorrect = leftTeam.status === "correct" || (!isSinglePlayer && rightTeam.status === "correct");
    const bothResolved = isSinglePlayer
      ? leftTeam.status !== "waiting"
      : leftTeam.status !== "waiting" && rightTeam.status !== "waiting";
    if (!someoneCorrect && !bothResolved) return;

    setPhase("result");
    if (leftTeam.status === "correct") {
      setStatusText(
        isSinglePlayer
          ? `${leftLabel} raundni muvaffaqiyatli yakunladi.`
          : `${leftLabel} birinchi bo'lib to'g'ri topdi va raundni yutdi.`,
      );
      return;
    }
    if (!isSinglePlayer && rightTeam.status === "correct") {
      setStatusText(`${rightLabel} birinchi bo'lib to'g'ri topdi va raundni yutdi.`);
      return;
    }
    setStatusText(
      isSinglePlayer
        ? `${leftLabel} bu raundda topa olmadi. Keyingi zanjirga o'tiladi.`
        : "Ikkala jamoa ham topa olmadi. Keyingi zanjirga o'tiladi.",
    );
  }, [phase, leftTeam.status, rightTeam.status, leftLabel, rightLabel, isSinglePlayer]);

  useEffect(() => {
    if (phase !== "result") return;

    const timer = window.setTimeout(() => {
      if (round >= totalRounds) {
        const resolved = resolveWinner();
        setWinner(resolved);
        setShowWinnerModal(true);
        setPhase("finished");

        if (isSinglePlayer) {
          setStatusText(`${leftLabel} o'yinni ${leftTeam.score} ball bilan yakunladi.`);
          setShowConfetti(true);
          return;
        }
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
  }, [phase, round, totalRounds, resolveWinner, leftLabel, rightLabel, openRound, config.nextRoundMs, isSinglePlayer, leftTeam.score]);

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
    <div className="mt-3 flex flex-wrap gap-2">
      {Array.from({ length: currentLength }, (_, index) => {
        const filled = index < teamInputLength;
        return (
          <span
            key={`dot-${index}`}
            className={`h-3 w-8 rounded-full transition ${filled ? "bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.85)]" : "bg-slate-300 dark:bg-slate-700"}`}
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
    <article className={`relative overflow-hidden rounded-3xl border-2 p-4 lg:p-5 backdrop-blur-xl shadow-xl ${borderTone}`}>
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-300/25 blur-2xl dark:bg-white/5" />
      <div className="relative flex items-center justify-between gap-2">
        <h3 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white sm:text-3xl">{title}</h3>
        <span className={`rounded-full bg-gradient-to-r px-4 py-1.5 text-sm font-extrabold text-white ${accentTone}`}>{team.score} ball</span>
      </div>
      <p className="mt-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
        Raund yutgan: {team.roundsWon} | Combo: {team.streak} | Best: {team.bestStreak}
      </p>

      <div className="mt-3 rounded-2xl border border-cyan-300/30 bg-white/70 p-3 dark:border-white/10 dark:bg-slate-900/60">
        <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
          <span>Zanjir uzunligi: {currentLength}</span>
          <span>{phase === "input" ? `${team.timeLeft}s` : "Tayyor"}</span>
        </div>
        {renderDots(team.input.length)}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5 lg:gap-3">
        {PAD_ITEMS.map((pad) => {
          const Icon = pad.icon;
          const isFlashing = flash === pad.id;
          return (
            <button
              key={`${side}-${pad.id}`}
              type="button"
              onClick={() => evaluatePress(side, pad.id)}
              disabled={roundLocked || team.status !== "waiting"}
              className={`group relative overflow-hidden rounded-2xl border px-2 py-3 text-center transition sm:px-3 sm:py-4 lg:py-5 ${
                isFlashing
                  ? `scale-[1.03] border-transparent bg-gradient-to-br text-white shadow-[0_0_24px_rgba(59,130,246,0.45)] ${pad.tone}`
                  : "border-cyan-300/30 bg-white/80 text-slate-700 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200"
              } ${roundLocked || team.status !== "waiting" ? "cursor-not-allowed opacity-70" : "hover:-translate-y-0.5 hover:border-cyan-400/80 hover:shadow-lg"}`}
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200/70 text-lg shadow-inner dark:bg-black/20 sm:h-12 sm:w-12 sm:text-xl lg:h-14 lg:w-14 lg:text-2xl">
                <Icon />
              </div>
              <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.14em] sm:text-xs">{pad.label}</p>
            </button>
          );
        })}
      </div>

      <p
        className={`mt-3 rounded-xl border px-3 py-2.5 text-xs font-extrabold sm:text-sm ${
          team.status === "correct"
            ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-200"
            : team.status === "wrong"
              ? "border-rose-400/50 bg-rose-500/20 text-rose-200"
              : team.status === "timeout"
                ? "border-amber-400/50 bg-amber-500/20 text-amber-200"
                : "border-cyan-300/30 bg-cyan-50/80 text-cyan-800 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-300"
        }`}
      >
        Holat: {team.status === "waiting" ? "Javob kiritilmoqda" : team.status === "correct" ? "To'g'ri" : team.status === "wrong" ? "Xato" : "Vaqt tugadi"}
      </p>
    </article>
  );

  return (
    <section className="relative overflow-hidden rounded-3xl border-2 border-cyan-400/30 bg-gradient-to-br from-white/90 via-cyan-50/80 to-blue-50/90 p-4 shadow-2xl sm:p-5 lg:p-6 dark:from-slate-900/85 dark:via-slate-900/90 dark:to-indigo-950/85">
      {showConfetti ? (
        <Confetti mode="boom" particleCount={140} effectCount={1} x={0.5} y={0.35} colors={["#06b6d4", "#3b82f6", "#6366f1", "#22d3ee", "#ec4899"]} />
      ) : null}

      <div className="absolute -left-20 top-12 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute -right-16 bottom-10 h-56 w-56 rounded-full bg-blue-400/20 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-100/80 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-cyan-700 sm:text-xs dark:bg-cyan-400/10 dark:text-cyan-200">
            <GiBrain className="text-cyan-500 dark:text-cyan-300" /> Memory Chain Protocol
          </p>
          <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">{gameTitle} Arena</h2>
          <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
            {isSinglePlayer
              ? "Yakka tartib rejimi: zanjirni eslab qoling, combo qiling va leaderboardga chiqing."
              : "Ikki jamoali duel: tugmalar yirik, ranglar aniq, katta ekranlarga mos."}
          </p>
        </div>
      </div>

      <div className="relative mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-cyan-300/35 bg-white/70 px-4 py-3 backdrop-blur dark:border-white/15 dark:bg-white/5">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">Raund</p>
          <p className="mt-1 text-3xl font-black text-slate-900 dark:text-white">{roundLabel}</p>
        </div>
        <div className="rounded-2xl border border-cyan-300/35 bg-white/70 px-4 py-3 backdrop-blur dark:border-white/15 dark:bg-white/5">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">Daraja</p>
          <p className="mt-1 text-base font-extrabold text-cyan-700 dark:text-cyan-200">{initialDifficulty}</p>
        </div>
        <div className="rounded-2xl border border-cyan-300/35 bg-white/70 px-4 py-3 backdrop-blur dark:border-white/15 dark:bg-white/5">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">Rejim</p>
          <p className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">{modeLabel}</p>
        </div>
        <div className="rounded-2xl border border-cyan-300/35 bg-white/70 px-4 py-3 backdrop-blur dark:border-white/15 dark:bg-white/5">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">{leftLabel}</p>
          <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">{leftTeam.score} ball</p>
        </div>
        {!isSinglePlayer ? (
          <div className="rounded-2xl border border-cyan-300/35 bg-white/70 px-4 py-3 backdrop-blur dark:border-white/15 dark:bg-white/5">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">{rightLabel}</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">{rightTeam.score} ball</p>
          </div>
        ) : null}
        <div className="rounded-2xl border border-cyan-300/35 bg-white/70 px-4 py-3 backdrop-blur dark:border-white/15 dark:bg-white/5">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">Uzunlik</p>
          <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">{currentLength} belgi</p>
        </div>
      </div>

      <div className="relative mt-4 rounded-2xl border border-cyan-300/35 bg-white/70 p-4 dark:border-white/15 dark:bg-slate-950/40">
        <div className="flex items-center justify-between gap-3 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
          <span>Progress: {progressPercent}%</span>
          <span>
            Holat: {phase === "ready" ? "Tayyor" : phase === "preview" ? "Ko'rsatish" : phase === "input" ? "Javob" : phase === "result" ? "Natija" : "Tugadi"}
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-cyan-100 dark:bg-slate-800">
          <div className={`h-full rounded-full bg-gradient-to-r shadow-[0_0_12px_rgba(34,211,238,0.9)] ${gameTone}`} style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className={`relative mt-4 grid gap-4 ${isSinglePlayer ? "xl:grid-cols-1" : "xl:grid-cols-2"}`}>
        {renderTeamPanel("left", leftLabel, leftTeam, leftFlash, "border-cyan-400/45 bg-cyan-100/55 dark:bg-cyan-500/8", gameTone)}
        {!isSinglePlayer
          ? renderTeamPanel("right", rightLabel, rightTeam, rightFlash, "border-indigo-400/45 bg-indigo-100/55 dark:bg-indigo-500/8", "from-indigo-500 to-blue-500")
          : null}
      </div>

      <div className="relative mt-5 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={handleStartMatch}
          className={`rounded-xl bg-gradient-to-r px-5 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-white shadow-lg transition hover:-translate-y-0.5 sm:text-sm ${gameTone}`}
        >
          {phase === "ready" || phase === "finished" ? "O'yinni boshlash" : "Qayta start"}
        </button>
        <button
          type="button"
          onClick={resetMatch}
          className="rounded-xl border border-cyan-300/40 bg-white/80 px-5 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-800 transition hover:bg-cyan-50 sm:text-sm dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
        >
          Nolga tushir
        </button>
      </div>

      <div className={`relative mt-4 rounded-2xl border px-4 py-3 text-sm font-extrabold sm:text-base ${phase === "finished" ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-100" : "border-cyan-400/40 bg-cyan-100/85 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-100"}`}>
        {statusText}
      </div>

      {isSinglePlayer ? (
        <GameLeaderboardPanel
          gameKey="memory-chain"
          title="Memory Chain Solo Leaderboard"
        />
      ) : null}

      {showWinnerModal ? (
        <div className="fixed inset-0 z-[95] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-cyan-300/35 bg-[linear-gradient(160deg,#020617,#111827,#1e1b4b)] p-5 shadow-2xl sm:p-6">
            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-500/30 blur-3xl" />
            <div className="absolute -bottom-16 -left-14 h-44 w-44 rounded-full bg-fuchsia-500/25 blur-3xl" />

            <div className="relative">
              <p className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-500/20 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-200">
                Xotira zanjiri yakunlandi
              </p>
              <h3 className="mt-3 text-4xl font-black text-white sm:text-5xl">
                {isSinglePlayer
                  ? `${winnerLabel} natijasi`
                  : winnerLabel === "Durang"
                    ? "Durang natija"
                    : `G'olib: ${winnerLabel}`}
              </h3>
              <p className="mt-1 text-base font-bold text-slate-300">
                {isSinglePlayer
                  ? `${winnerLabel} eng yuqori xotira seriyasini ko'rsatdi.`
                  : winnerLabel === "Durang"
                    ? "Ikkala jamoa ham teng natija ko'rsatdi."
                    : `${winnerLabel} eng kuchli xotira natijasini ko'rsatdi.`}
              </p>

              <div className={`mt-4 grid gap-3 ${isSinglePlayer ? "sm:grid-cols-1" : "sm:grid-cols-2"}`}>
                <div className="rounded-2xl border border-white/15 bg-white/5 p-3 text-center">
                  <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-400">{leftLabel}</p>
                  <p className="mt-1 text-2xl font-extrabold text-white">{leftTeam.score}</p>
                  <p className="text-sm font-bold text-slate-300">{leftTeam.roundsWon} raund | combo {leftTeam.bestStreak}</p>
                </div>
                {!isSinglePlayer ? (
                  <div className="rounded-2xl border border-white/15 bg-white/5 p-3 text-center">
                    <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-slate-400">{rightLabel}</p>
                    <p className="mt-1 text-2xl font-extrabold text-white">{rightTeam.score}</p>
                    <p className="text-sm font-bold text-slate-300">{rightTeam.roundsWon} raund | combo {rightTeam.bestStreak}</p>
                  </div>
                ) : null}
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
                  className={`rounded-xl bg-gradient-to-r px-4 py-2 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 ${gameTone}`}
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

