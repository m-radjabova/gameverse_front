import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaPlay, FaPlus, FaRedo, FaTrash, FaTrophy, FaForward, FaBackward, FaCrown, FaEdit, FaRobot
} from "react-icons/fa";
import Confetti from "react-confetti-boom";
import { 
  GiBrain, GiPuzzle, GiAchievement, GiLightBulb, GiShield, GiSwordman 
} from "react-icons/gi";
import { 
  MdSkipNext, } from "react-icons/md";
import { fetchGameQuestions, saveGameQuestions } from "../../../hooks/useGameQuestions";
import { generateClassicArcadeChallenges } from "./ai";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../../../hooks/useGameStartCountdown";
import { useFinishApplause } from "../../../hooks/useFinishApplause";
import { useGameParticipantMode } from "../../../hooks/useGameParticipantMode";
import { useGameResultSubmission } from "../../../hooks/useGameResultSubmission";

type Phase = "teacher" | "teams" | "play" | "finish";
type Mini = "math" | "pattern" | "odd";
type TeamId = 0 | 1;

type MathRound = { q: string; options: number[]; answer: number };
type PatternRound = { prompt: string[]; options: string[]; answer: string; revealMs: number };
type OddRound = { prompt: string; options: [string, string, string, string]; correctIndex: number; reason: string };
type Draft = { prompt: string; options: [string, string, string, string]; correctIndex: number; reason: string };

const SESSION_SECONDS = 8 * 60;
const ROUND_SECONDS = 20;
const TOTAL_ROUNDS = 15;
const BASE_GAIN = 120;
const STREAK_GAIN = 25;
const WRONG_PENALTY = 40;
const SKIP_PENALTY = 25;
const SHAPES = ["🔵", "🟢", "🟡", "🔴", "🟣", "🟠", "⚪", "⬛"];
const EMPTY_DRAFT: Draft = { prompt: "", options: ["", "", "", ""], correctIndex: 0, reason: "" };
const CLASSIC_ARCADE_GAME_KEY = "classic_arcade";
const AI_CHALLENGE_COUNT_OPTIONS = [1, 3, 5, 8, 10, 15] as const;
const AI_DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Oson" },
  { value: "medium", label: "O'rta" },
  { value: "hard", label: "Qiyin" },
  { value: "mixed", label: "Aralash" },
] as const;
const BUILTIN_ODD: OddRound[] = [
  { prompt: "Qaysi biri meva emas?", options: ["Olma", "Nok", "Uzum", "Mashina"], correctIndex: 3, reason: "Mashina meva emas." },
  { prompt: "Qaysi biri toq son?", options: ["2", "4", "6", "9"], correctIndex: 3, reason: "9 toq son." },
  { prompt: "Qaysi shahar O'zbekistonda emas?", options: ["Toshkent", "Samarqand", "Buxoro", "London"], correctIndex: 3, reason: "London O'zbekistonda emas." },
];

const r = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const sh = <T,>(arr: T[]) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const tf = (s: number) => `${String(Math.floor(Math.max(0, s) / 60)).padStart(2, "0")}:${String(Math.max(0, s) % 60).padStart(2, "0")}`;

const buildMath = (): MathRound => {
  const a = r(6, 25); const b = r(6, 25); const ops = ["+", "-", "×"] as const; const op = ops[r(0, 2)];
  const answer = op === "+" ? a + b : op === "-" ? a - b : a * b;
  const wrongs = new Set<number>(); while (wrongs.size < 3) { wrongs.add(answer + r(-12, 12)); wrongs.delete(answer); }
  return { q: `${a} ${op} ${b} = ?`, options: sh([answer, ...Array.from(wrongs)]).slice(0, 4), answer };
};
const buildPattern = (): PatternRound => {
  const seq = Array.from({ length: r(4, 6) }, () => SHAPES[r(0, SHAPES.length - 1)]); const answer = seq.join(" ");
  const decoys = new Set<string>(); while (decoys.size < 3) { const c = [...seq]; c[r(0, c.length - 1)] = SHAPES[r(0, SHAPES.length - 1)]; const d = c.join(" "); if (d !== answer) decoys.add(d); }
  return { prompt: seq, options: sh([answer, ...Array.from(decoys)]), answer, revealMs: 1100 };
};
const buildOdd = (teacher: OddRound[]): OddRound => (teacher.length ? [...teacher, ...BUILTIN_ODD] : BUILTIN_ODD)[r(0, (teacher.length ? teacher.length + BUILTIN_ODD.length : BUILTIN_ODD.length) - 1)];

export default function ClassicArcade() {
  const skipInitialRemoteSaveRef = useRef(true);
  const [phase, setPhase] = useState<Phase>("teacher");
  useFinishApplause(phase === "finish");
  const { isSinglePlayer, primaryName, secondaryName, modeLabel } = useGameParticipantMode({
    gameId: "classic-arcade",
    fallbackPrimaryName: "O'YINCHI 1",
    fallbackSecondaryName: "O'YINCHI 2",
    singleModeLabel: "1 o'yinchi",
    multiModeLabel: "2 o'yinchi",
  });
  const [teamNames, setTeamNames] = useState<[string, string]>(["⚔️ YULDUZLAR", "🛡️ CHAQQONLAR"]);
  const [nameError, setNameError] = useState("");
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [teacherRounds, setTeacherRounds] = useState<OddRound[]>([]);
  const [teacherError, setTeacherError] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [aiChallengeCount, setAiChallengeCount] = useState<number>(5);
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("medium");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [editingTeacherRoundIndex, setEditingTeacherRoundIndex] = useState<number | null>(null);
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const [sessionLeft, setSessionLeft] = useState(SESSION_SECONDS);
  const [roundLeft, setRoundLeft] = useState(ROUND_SECONDS);
  const [mini, setMini] = useState<Mini>("math");
  const prevMiniRef = useRef<Mini>("math");
  const [activeTeam, setActiveTeam] = useState<TeamId | null>(null);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [streaks, setStreaks] = useState<[number, number]>([0, 0]);
  const [bestStreaks, setBestStreaks] = useState<[number, number]>([0, 0]);
  const [roundsDone, setRoundsDone] = useState(0);
  const [locked, setLocked] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [reveal, setReveal] = useState<{ correct: boolean; detail?: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [mathRound, setMathRound] = useState<MathRound>(() => buildMath());
  const [patternRound, setPatternRound] = useState<PatternRound>(() => buildPattern());
  const [oddRound, setOddRound] = useState<OddRound>(() => buildOdd([]));
  const [patternShowing, setPatternShowing] = useState(false);
  const patternTimerRef = useRef<number | null>(null);
  const betweenTimerRef = useRef<number | null>(null);
  const confettiTimerRef = useRef<number | null>(null);
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();
  const sessionPct = useMemo(() => Math.round((sessionLeft / SESSION_SECONDS) * 100), [sessionLeft]);
  const roundPct = useMemo(() => Math.round((roundLeft / ROUND_SECONDS) * 100), [roundLeft]);
  const winner = useMemo(() => (
    isSinglePlayer ? 0 : scores[0] === scores[1] ? null : scores[0] > scores[1] ? 0 : 1
  ), [isSinglePlayer, scores]);
  const roundsLeft = useMemo(() => Math.max(0, TOTAL_ROUNDS - roundsDone), [roundsDone]);
  const teams: TeamId[] = isSinglePlayer ? [0] : [0, 1];
  const hasGeminiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY?.trim());

  useGameResultSubmission(
    phase === "finish",
    "classic-arcade",
    isSinglePlayer
      ? [
          {
            participant_name: teamNames[0],
            participant_mode: modeLabel,
            score: scores[0],
            metadata: { rounds: roundsDone, bestStreak: bestStreaks[0] },
          },
        ]
      : [
          {
            participant_name: teamNames[0],
            participant_mode: modeLabel,
            score: scores[0],
            metadata: { rounds: roundsDone, bestStreak: bestStreaks[0] },
          },
          {
            participant_name: teamNames[1],
            participant_mode: modeLabel,
            score: scores[1],
            metadata: { rounds: roundsDone, bestStreak: bestStreaks[1] },
          },
        ],
  );

  useEffect(() => { if (!toast) return; const t = window.setTimeout(() => setToast(null), 1400); return () => window.clearTimeout(t); }, [toast]);
  useEffect(() => {
    setTeamNames([primaryName, secondaryName]);
  }, [isSinglePlayer, primaryName, secondaryName]);
  useEffect(() => {
    return () => {
      if (patternTimerRef.current) window.clearTimeout(patternTimerRef.current);
      if (betweenTimerRef.current) window.clearTimeout(betweenTimerRef.current);
      if (confettiTimerRef.current) window.clearTimeout(confettiTimerRef.current);
    };
  }, []);
  useEffect(() => {
    let alive = true;
    (async () => {
      const remoteRounds = await fetchGameQuestions<OddRound>(CLASSIC_ARCADE_GAME_KEY);
      if (!alive) return;
      if (remoteRounds && remoteRounds.length > 0) {
        setTeacherRounds(remoteRounds);
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
      void saveGameQuestions<OddRound>(CLASSIC_ARCADE_GAME_KEY, teacherRounds);
    }, 500);
    return () => window.clearTimeout(t);
  }, [teacherRounds, remoteLoaded]);
  useEffect(() => { if (phase !== "play") return; if (sessionLeft <= 0) { setPhase("finish"); return; } const t = window.setTimeout(() => setSessionLeft((s) => s - 1), 1000); return () => window.clearTimeout(t); }, [phase, sessionLeft]);
  useEffect(() => { if (phase !== "play" || locked) return; if (roundLeft <= 0) { onSkip(true); return; } const t = window.setTimeout(() => setRoundLeft((s) => s - 1), 1000); return () => window.clearTimeout(t); }, [phase, roundLeft, locked]);
  useEffect(() => {
    if (!showConfetti) return;
    if (confettiTimerRef.current) window.clearTimeout(confettiTimerRef.current);
    confettiTimerRef.current = window.setTimeout(() => setShowConfetti(false), 2000);
    return () => {
      if (confettiTimerRef.current) window.clearTimeout(confettiTimerRef.current);
    };
  }, [showConfetti]);

  const resetTeacherDraft = () => {
    setDraft(EMPTY_DRAFT);
    setEditingTeacherRoundIndex(null);
    setTeacherError("");
  };

  const beginEditTeacherRound = (idx: number) => {
    const item = teacherRounds[idx];
    if (!item) return;
    setEditingTeacherRoundIndex(idx);
    setDraft({
      prompt: item.prompt,
      options: [...item.options],
      correctIndex: item.correctIndex,
      reason: item.reason,
    });
    setTeacherError("");
  };

  const addTeacherRound = () => {
    const prompt = draft.prompt.trim(); const options = draft.options.map((o) => o.trim()) as [string, string, string, string]; const reason = draft.reason.trim();
    if (!prompt) return setTeacherError("Savol kiriting.");
    if (options.some((o) => !o)) return setTeacherError("4 ta variant kiriting.");
    if (new Set(options.map((o) => o.toLowerCase())).size < 4) return setTeacherError("Variantlar turlicha bo'lsin.");

    if (editingTeacherRoundIndex !== null) {
      setTeacherRounds((prev) =>
        prev.map((item, idx) =>
          idx === editingTeacherRoundIndex
            ? { prompt, options, correctIndex: draft.correctIndex, reason: reason || `To'g'ri javob: ${options[draft.correctIndex]}` }
            : item,
        ),
      );
      resetTeacherDraft();
      setToast("Challenge yangilandi");
      return;
    }

    setTeacherRounds((p) => [...p, { prompt, options, correctIndex: draft.correctIndex, reason: reason || `To'g'ri javob: ${options[draft.correctIndex]}` }]);
    resetTeacherDraft();
  };

  const removeTeacherRound = (idx: number) => {
    setEditingTeacherRoundIndex((prev) => {
      if (prev === null) return prev;
      if (prev === idx) {
        setDraft(EMPTY_DRAFT);
        return null;
      }
      return prev > idx ? prev - 1 : prev;
    });
    setTeacherRounds((p) => p.filter((_, itemIdx) => itemIdx !== idx));
  };

  const generateAiChallenges = async () => {
    if (isGeneratingAi) return;
    setTeacherError("");
    setIsGeneratingAi(true);

    try {
      const generated = await generateClassicArcadeChallenges({
        topic: aiTopic,
        count: aiChallengeCount,
        difficulty: aiDifficulty,
      });
      setTeacherRounds((prev) => [...prev, ...generated]);
      setToast(`${generated.length} ta AI challenge qo'shildi`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI challenge yaratib bo'lmadi.";
      setTeacherError(message);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const startGame = () => {
    const a = teamNames[0].trim(); const b = teamNames[1].trim();
    if (!a || (!isSinglePlayer && !b)) return setNameError(isSinglePlayer ? "O'yinchi nomini kiriting." : "Ikkala guruh nomini kiriting.");
    if (!isSinglePlayer && a.toLowerCase() === b.toLowerCase()) return setNameError("Guruh nomlari bir xil bo'lmasin.");
    setTeamNames([a, isSinglePlayer ? secondaryName : b]); setNameError(""); setPhase("play"); setSessionLeft(SESSION_SECONDS); setScores([0, 0]); setStreaks([0, 0]); setBestStreaks([0, 0]); setRoundsDone(0); setActiveTeam(null); setLocked(false); setReveal(null); setShowConfetti(false);
    const first: Mini = (["math", "pattern", "odd"] as Mini[])[r(0, 2)]; prevMiniRef.current = first; setMini(first); setRoundLeft(ROUND_SECONDS);
    if (first === "math") setMathRound(buildMath()); if (first === "pattern") { const p = buildPattern(); setPatternRound(p); setPatternShowing(true); if (patternTimerRef.current) window.clearTimeout(patternTimerRef.current); patternTimerRef.current = window.setTimeout(() => setPatternShowing(false), p.revealMs); } if (first === "odd") setOddRound(buildOdd(teacherRounds));
  };

  const handleStartGame = () => runStartCountdown(startGame);

  const queueNextRound = () => {
    if (betweenTimerRef.current) window.clearTimeout(betweenTimerRef.current);
    betweenTimerRef.current = window.setTimeout(() => {
      if (phase !== "play") return;
      setReveal(null); setLocked(false); setRoundLeft(ROUND_SECONDS); setActiveTeam(null);
      const all: Mini[] = ["math", "pattern", "odd"]; const next = sh(all.filter((m) => m !== prevMiniRef.current))[0];
      prevMiniRef.current = next; setMini(next);
      if (next === "math") setMathRound(buildMath());
      if (next === "pattern") { const p = buildPattern(); setPatternRound(p); setPatternShowing(true); if (patternTimerRef.current) window.clearTimeout(patternTimerRef.current); patternTimerRef.current = window.setTimeout(() => setPatternShowing(false), p.revealMs); }
      if (next === "odd") setOddRound(buildOdd(teacherRounds));
    }, 900);
  };

  const settle = (team: TeamId, correct: boolean, detail?: string) => {
    const nextRoundsDone = roundsDone + 1;
    setActiveTeam(team); setLocked(true); setReveal({ correct, detail }); setRoundsDone(nextRoundsDone);
    if (correct) {
      const gain = BASE_GAIN + Math.round(roundLeft * 3) + Math.min(10, streaks[team]) * STREAK_GAIN;
      setScores((p) => { const n: [number, number] = [...p] as [number, number]; n[team] += gain; return n; });
      setStreaks((p) => { const n: [number, number] = [...p] as [number, number]; n[team] += 1; return n; });
      setBestStreaks((p) => { const n: [number, number] = [...p] as [number, number]; n[team] = Math.max(n[team], streaks[team] + 1); return n; });
      setShowConfetti(true);
      setToast(`🎉 ${teamNames[team]} +${gain}`);
    } else {
      setScores((p) => { const n: [number, number] = [...p] as [number, number]; n[team] = Math.max(0, n[team] - WRONG_PENALTY); return n; });
      setStreaks((p) => { const n: [number, number] = [...p] as [number, number]; n[team] = 0; return n; });
      setToast(`❌ ${teamNames[team]} -${WRONG_PENALTY}`);
    }
    if (nextRoundsDone >= TOTAL_ROUNDS) {
      window.setTimeout(() => setPhase("finish"), 700);
      return;
    }
    queueNextRound();
  };

  const onSkip = (auto = false) => {
    if (phase !== "play" || locked) return;
    const nextRoundsDone = roundsDone + 1;
    setLocked(true); setReveal({ correct: false, detail: auto ? "⏰ Vaqt tugadi" : "⏭️ Skip" });
    if (activeTeam !== null) {
      setScores((p) => { const n: [number, number] = [...p] as [number, number]; n[activeTeam] = Math.max(0, n[activeTeam] - SKIP_PENALTY); return n; });
      setStreaks((p) => { const n: [number, number] = [...p] as [number, number]; n[activeTeam] = 0; return n; });
      setToast(`${teamNames[activeTeam]} -${SKIP_PENALTY}`);
    }
    setRoundsDone(nextRoundsDone);
    if (nextRoundsDone >= TOTAL_ROUNDS) {
      window.setTimeout(() => setPhase("finish"), 700);
      return;
    }
    queueNextRound();
  };

  return (
    <div className="relative text-white">
      {phase === "finish" && (
        <Confetti
          mode="boom"
          particleCount={100}
          effectCount={1}
          x={0.5}
          y={0.35}
          colors={["#f472b6", "#fb7185", "#f59e0b", "#22d3ee", "#a855f7"]}
        />
      )}

      {/* Teacher Panel */}
      {phase === "teacher" && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Add Challenge */}
            <div className="relative transform-gpu overflow-hidden rounded-2xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-900/30 to-rose-900/30 p-6 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-rose-500/10" />
              <h3 className="relative mb-4 flex items-center gap-2 text-lg font-black text-white">
                <GiPuzzle className="text-fuchsia-400" />
                YANGI CHALLENGE QO'SHISH
              </h3>
              
              <div className="relative space-y-4">
                <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4">
                  <div className="mb-3 flex items-center gap-2 text-cyan-300">
                    <FaRobot />
                    <p className="text-sm font-bold">AI CHALLENGE GENERATSIYASI</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="w-full rounded-xl border border-cyan-500/30 bg-slate-950/70 px-4 py-3 text-white placeholder-cyan-300/40 focus:border-cyan-400 focus:outline-none"
                      placeholder="Mavzu: matematika, tarix, ingliz tili..."
                    />
                    <select
                      value={aiChallengeCount}
                      onChange={(e) => setAiChallengeCount(Number(e.target.value))}
                      className="w-full rounded-xl border border-cyan-500/30 bg-slate-950/70 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
                    >
                      {AI_CHALLENGE_COUNT_OPTIONS.map((count) => (
                        <option key={count} value={count} className="bg-slate-950">
                          {count} ta challenge
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
                      onClick={() => void generateAiChallenges()}
                      disabled={!hasGeminiKey || isGeneratingAi}
                      className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 font-bold text-white transition-all hover:from-cyan-400 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isGeneratingAi ? `${aiChallengeCount} ta yaratilmoqda...` : `AI bilan ${aiChallengeCount} ta qo'shish`}
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-cyan-100/70">
                    AI challenge'lar mavjud ro'yxatga qo'shiladi. "Aralash" tanlansa oson, o'rta va qiyin challenge'lar aralashtiriladi.
                  </p>
                  {!hasGeminiKey && (
                    <p className="mt-2 text-xs text-amber-300">
                      AI ishlashi uchun `.env` ichida `VITE_GEMINI_API_KEY` bo'lishi kerak.
                    </p>
                  )}
                </div>

                <input
                  value={draft.prompt}
                  onChange={(e) => setDraft((p) => ({ ...p, prompt: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 backdrop-blur-sm focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/20"
                  placeholder="Savolni kiriting..."
                />
                
                <div className="grid grid-cols-2 gap-3">
                  {draft.options.map((v, i) => (
                    <input
                      key={i}
                      value={v}
                      onChange={(e) => setDraft((p) => {
                        const n = [...p.options] as [string, string, string, string];
                        n[i] = e.target.value;
                        return { ...p, options: n };
                      })}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-fuchsia-400 focus:outline-none"
                      placeholder={`Variant ${i + 1}`}
                    />
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={draft.correctIndex}
                    onChange={(e) => setDraft((p) => ({ ...p, correctIndex: Number(e.target.value) }))}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-fuchsia-400 focus:outline-none"
                  >
                    <option value={0} className="bg-fuchsia-900">To'g'ri javob: 1</option>
                    <option value={1} className="bg-fuchsia-900">To'g'ri javob: 2</option>
                    <option value={2} className="bg-fuchsia-900">To'g'ri javob: 3</option>
                    <option value={3} className="bg-fuchsia-900">To'g'ri javob: 4</option>
                  </select>
                  
                  <input
                    value={draft.reason}
                    onChange={(e) => setDraft((p) => ({ ...p, reason: e.target.value }))}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-fuchsia-400 focus:outline-none"
                    placeholder="Izoh (ixtiyoriy)"
                  />
                </div>
                
                {teacherError && (
                  <div className="rounded-xl bg-rose-500/20 p-3 text-rose-300 border border-rose-500/30">
                    ⚠️ {teacherError}
                  </div>
                )}
                
                <button
                  onClick={addTeacherRound}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-fuchsia-500 to-rose-500 p-3 font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                  <span className="relative flex items-center justify-center gap-2">
                    {editingTeacherRoundIndex !== null ? <FaEdit /> : <FaPlus />}
                    {editingTeacherRoundIndex !== null ? "CHALLENGE SAQLASH" : "CHALLENGE QO'SHISH"}
                  </span>
                </button>
                {editingTeacherRoundIndex !== null && (
                  <button
                    onClick={resetTeacherDraft}
                    className="w-full rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 p-3 font-bold text-fuchsia-200 transition-all hover:bg-fuchsia-500/20"
                  >
                    BEKOR QILISH
                  </button>
                )}
              </div>
            </div>
            
            {/* Teacher's Challenges */}
            <div className="relative transform-gpu overflow-hidden rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-900/30 to-orange-900/30 p-6 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-orange-500/10" />
              <h3 className="relative mb-4 flex items-center gap-2 text-lg font-black text-white">
                <GiAchievement className="text-rose-400" />
                QO'SHILGAN CHALLENGELAR ({teacherRounds.length})
              </h3>
              
              <div className="relative max-h-80 space-y-3 overflow-auto pr-2">
                {teacherRounds.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
                    <p className="text-sm text-gray-400">Hozircha challenge yo'q</p>
                    <p className="text-xs text-gray-500 mt-1">Default challenge'lar ishlaydi</p>
                  </div>
                ) : (
                  teacherRounds.map((q, i) => (
                    <div
                      key={`${q.prompt}-${i}`}
                      className="group relative rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-fuchsia-500/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">{i + 1}. {q.prompt}</p>
                          <p className="mt-1 text-xs text-gray-400">
                            To'g'ri: <span className="text-fuchsia-400">{q.options[q.correctIndex]}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{q.reason}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => beginEditTeacherRound(i)}
                            className="rounded-lg bg-cyan-500/20 p-2 text-cyan-300 opacity-0 group-hover:opacity-100 transition-all hover:bg-cyan-500/30"
                            title="Tahrirlash"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => removeTeacherRound(i)}
                            className="rounded-lg bg-rose-500/20 p-2 text-rose-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/30"
                            title="O'chirish"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Continue Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setPhase("teams")}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-fuchsia-500 to-rose-500 px-8 py-4 text-lg font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
              <span className="relative flex items-center gap-3">
                <FaForward />
                GURUHLARGA O'TISH
              </span>
            </button>
          </div>
        </div>
      )}
      
      {/* Teams Setup */}
      {phase === "teams" && (
        <div className="relative transform-gpu overflow-hidden rounded-2xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-900/30 to-rose-900/30 p-8 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-rose-500/10" />
          
          <h3 className="relative mb-6 text-center text-2xl font-black text-white">{isSinglePlayer ? "O'YINCHI NOMINI KIRITING" : "GURUH NOMLARINI KIRITING"}</h3>
          
          <div className={`relative grid gap-6 ${isSinglePlayer ? "" : "md:grid-cols-2"}`}>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-fuchsia-400">
                <GiSwordman />
                1-GURUH (⚔️)
              </label>
              <input
                value={teamNames[0]}
                onChange={(e) => setTeamNames([e.target.value, teamNames[1]])}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-bold text-white placeholder-white/40 focus:border-fuchsia-400 focus:outline-none"
                placeholder={isSinglePlayer ? "Masalan: Sardor" : "Masalan: YULDUZLAR"}
              />
            </div>
            
            <div className={`${isSinglePlayer ? "hidden " : ""}space-y-2`}>
              <label className="flex items-center gap-2 text-sm font-bold text-rose-400">
                <GiShield />
                2-GURUH (🛡️)
              </label>
              <input
                value={teamNames[1]}
                onChange={(e) => setTeamNames([teamNames[0], e.target.value])}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-bold text-white placeholder-white/40 focus:border-rose-400 focus:outline-none"
                placeholder="Masalan: CHAQQONLAR"
              />
            </div>
          </div>
          
          {nameError && (
            <div className="relative mt-4 rounded-xl bg-rose-500/20 p-3 text-rose-300 border border-rose-500/30">
              ⚠️ {nameError}
            </div>
          )}
          
          <div className="relative mt-6 flex justify-center gap-4">
            <button
              onClick={() => setPhase("teacher")}
              className="group relative overflow-hidden rounded-xl bg-white/10 px-6 py-3 font-bold text-white border border-white/20 transition-all hover:bg-white/20"
            >
              <span className="relative flex items-center gap-2">
                <FaBackward />
                ORQAGA
              </span>
            </button>
            
            <button
              onClick={handleStartGame}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-fuchsia-500 to-rose-500 px-8 py-3 font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
              <span className="relative flex items-center gap-3">
                <FaPlay />
                O'YINNI BOSHLASH
              </span>
            </button>
          </div>
        </div>
      )}
      
      {/* Game Play */}
      {phase === "play" && (
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className={`grid gap-4 ${isSinglePlayer ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-4"}`}>
            <div className="relative transform-gpu overflow-hidden rounded-xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-900/30 to-rose-900/30 p-4 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-rose-500/10" />
              <p className="relative text-xs font-bold text-fuchsia-400">SESSION</p>
              <p className="relative text-2xl font-black text-white">{tf(sessionLeft)}</p>
              <div className="relative mt-2 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-rose-400" style={{ width: `${clamp(sessionPct, 0, 100)}%` }} />
              </div>
            </div>
            
            <div className="relative transform-gpu overflow-hidden rounded-xl border border-rose-500/20 bg-gradient-to-br from-rose-900/30 to-orange-900/30 p-4 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-orange-500/10" />
              <p className="relative text-xs font-bold text-rose-400">RAUND</p>
              <p className="relative text-2xl font-black text-white">{roundLeft}s</p>
              <div className="relative mt-2 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-orange-400" style={{ width: `${clamp(roundPct, 0, 100)}%` }} />
              </div>
            </div>
            
            <div className="relative transform-gpu overflow-hidden rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-900/30 to-amber-900/30 p-4 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10" />
              <p className="relative text-xs font-bold text-orange-400">NAVBAT</p>
              <p className="relative text-xl font-black text-white truncate">{activeTeam === null ? (isSinglePlayer ? teamNames[0] : "Kim birinchi bosadi?") : teamNames[activeTeam]}</p>
              <p className="relative text-xs text-gray-400 mt-1">Raund: {roundsDone}/{TOTAL_ROUNDS}</p>
            </div>
            
            <div className="relative transform-gpu overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-900/30 to-yellow-900/30 p-4 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10" />
              <p className="relative text-xs font-bold text-amber-400">QOLGAN</p>
              <p className="relative text-2xl font-black text-white">{roundsLeft}</p>
              <p className="relative text-xs text-gray-400 mt-1">ta challenge</p>
            </div>
          </div>
          
          {/* Teams Score */}
          <div className={`grid gap-4 ${isSinglePlayer ? "" : "md:grid-cols-2"}`}>
            <div className={`relative transform-gpu overflow-hidden border p-6 backdrop-blur-xl transition-all ${
              isSinglePlayer
                ? "rounded-3xl border-fuchsia-400/30 bg-gradient-to-br from-fuchsia-500/20 via-slate-950/80 to-cyan-500/20 shadow-[0_20px_80px_rgba(217,70,239,0.22)]"
                : "rounded-xl"
            } ${
              activeTeam === 0 ? 'border-fuchsia-500/50 bg-fuchsia-900/40 scale-105' : 'border-white/10 bg-white/5'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-rose-500/10" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-fuchsia-400">{isSinglePlayer ? "SOLO ARCADE" : "1-GURUH"}</p>
                  <p className={`${isSinglePlayer ? "text-3xl md:text-4xl" : "text-2xl"} font-black text-white`}>{teamNames[0]}</p>
                  {isSinglePlayer && (
                    <p className="mt-2 max-w-md text-sm text-fuchsia-100/75">
                      Har savoldan keyin challenge avtomatik yangilanadi. Tezlik va streak ko'proq ball beradi.
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className={`${isSinglePlayer ? "text-5xl md:text-6xl" : "text-3xl"} font-black text-fuchsia-400`}>{scores[0]}</p>
                  <p className="text-xs text-gray-400">Streak: {streaks[0]} | Best: {bestStreaks[0]}</p>
                </div>
              </div>
            </div>
            
            <div className={`${isSinglePlayer ? "hidden " : ""}relative transform-gpu overflow-hidden rounded-xl border p-6 backdrop-blur-xl transition-all ${
              activeTeam === 1 ? 'border-rose-500/50 bg-rose-900/40 scale-105' : 'border-white/10 bg-white/5'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-orange-500/10" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-rose-400">🛡️ 2-GURUH</p>
                  <p className="text-2xl font-black text-white">{teamNames[1]}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-rose-400">{scores[1]}</p>
                  <p className="text-xs text-gray-400">Streak: {streaks[1]} | Best: {bestStreaks[1]}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Challenge Card */}
          <div className="relative transform-gpu overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-900/30 via-rose-900/30 to-orange-900/30 p-8 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 via-rose-500/10 to-orange-500/10" />
            
            {/* Challenge Type Badge */}
            <div className="relative mb-6 flex justify-center">
              <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${
                mini === 'math' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' :
                mini === 'pattern' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                'bg-orange-500/20 text-orange-400 border border-orange-500/30'
              }`}>
                {mini === 'math' && <GiBrain />}
                {mini === 'pattern' && <GiPuzzle />}
                {mini === 'odd' && <GiLightBulb />}
                <span className="text-sm font-black uppercase">
                  {mini === 'math' && 'QUICK MATH'}
                  {mini === 'pattern' && 'PATTERN MEMORY'}
                  {mini === 'odd' && 'ODD ONE OUT'}
                </span>
              </div>
            </div>
            
            {/* Challenge Content */}
            <div className="relative text-center">
              {mini === "math" && (
                <>
                  <p className="text-4xl font-black text-white mb-6">{mathRound.q}</p>
                  <div className={`grid gap-4 ${isSinglePlayer ? "mx-auto max-w-2xl" : "lg:grid-cols-2"}`}>
                    {teams.map((team) => (
                      <div key={`math-${team}`} className={`rounded-2xl border p-4 transition-all ${activeTeam === team ? "border-fuchsia-500/50 bg-fuchsia-900/25" : "border-white/10 bg-white/5"}`}>
                        <p className={`mb-3 text-sm font-bold ${team === 0 ? "text-fuchsia-300" : "text-rose-300"}`}>{teamNames[team]}</p>
                        <div className="grid grid-cols-2 gap-3">
                          {mathRound.options.map((o, i) => (
                            <button
                              key={`${team}-${i}`}
                              onClick={() => !locked && settle(team, o === mathRound.answer)}
                              disabled={locked}
                              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 text-2xl font-bold text-white transition-all hover:scale-105 hover:bg-white/10 disabled:opacity-50 disabled:hover:scale-100"
                            >
                              <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/20 to-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <span className="relative">{o}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {mini === "pattern" && (
                <>
                  <div className="mb-6 text-6xl font-black tracking-wider">
                    {patternShowing ? (
                      patternRound.prompt.map((shape, i) => (
                        <span key={i} className="inline-block mx-1 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                          {shape}
                        </span>
                      ))
                    ) : (
                      <span className="text-4xl text-gray-500">🔒 🔒 🔒 🔒</span>
                    )}
                  </div>
                  <div className={`grid gap-4 ${isSinglePlayer ? "mx-auto max-w-3xl" : "lg:grid-cols-2"}`}>
                    {teams.map((team) => (
                      <div key={`pattern-${team}`} className={`rounded-2xl border p-4 transition-all ${activeTeam === team ? "border-rose-500/50 bg-rose-900/25" : "border-white/10 bg-white/5"}`}>
                        <p className={`mb-3 text-sm font-bold ${team === 0 ? "text-fuchsia-300" : "text-rose-300"}`}>{teamNames[team]}</p>
                        <div className="grid grid-cols-2 gap-3">
                          {patternRound.options.map((o, i) => (
                            <button
                              key={`${team}-${i}`}
                              onClick={() => !locked && settle(team, o === patternRound.answer)}
                              disabled={locked || patternShowing}
                              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 text-lg font-bold text-white transition-all hover:scale-105 hover:bg-white/10 disabled:opacity-50 disabled:hover:scale-100"
                            >
                              <span className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <span className="relative">{o}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {mini === "odd" && (
                <>
                  <p className="text-2xl font-bold text-white mb-6">{oddRound.prompt}</p>
                  <div className={`grid gap-4 ${isSinglePlayer ? "mx-auto max-w-3xl" : "lg:grid-cols-2"}`}>
                    {teams.map((team) => (
                      <div key={`odd-${team}`} className={`rounded-2xl border p-4 transition-all ${activeTeam === team ? "border-orange-500/50 bg-orange-900/25" : "border-white/10 bg-white/5"}`}>
                        <p className={`mb-3 text-sm font-bold ${team === 0 ? "text-fuchsia-300" : "text-rose-300"}`}>{teamNames[team]}</p>
                        <div className="grid grid-cols-2 gap-3">
                          {oddRound.options.map((o, i) => (
                            <button
                              key={`${team}-${i}`}
                              onClick={() => !locked && settle(team, i === oddRound.correctIndex, i === oddRound.correctIndex ? undefined : oddRound.reason)}
                              disabled={locked}
                              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 text-lg font-bold text-white transition-all hover:scale-105 hover:bg-white/10 disabled:opacity-50 disabled:hover:scale-100"
                            >
                              <span className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <span className="relative">{o}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Result Message */}
          {reveal && (
            <div className={`relative transform-gpu overflow-hidden rounded-xl border p-4 text-center backdrop-blur-xl ${
              reveal.correct ? 'border-emerald-500/30 bg-emerald-500/20' : 'border-rose-500/30 bg-rose-500/20'
            }`}>
              <p className="text-lg font-bold">
                {reveal.correct ? '✅ TO\'G\'RI!' : '❌ NOTO\'G\'RI!'}
              </p>
              {reveal.detail && (
                <p className="text-sm text-gray-300 mt-1">{reveal.detail}</p>
              )}
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-white/60">
                Keyingi savol avtomatik ochiladi
              </p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => onSkip(false)}
              disabled={locked}
              className="group relative overflow-hidden rounded-xl bg-white/10 px-6 py-3 font-bold text-white border border-white/20 transition-all hover:bg-white/20 disabled:opacity-50"
            >
              <span className="relative flex items-center gap-2">
                <MdSkipNext />
                SKIP
              </span>
            </button>
            
            <button
              onClick={() => setPhase("finish")}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-fuchsia-500 to-rose-500 px-8 py-3 font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
              <span className="relative flex items-center gap-3">
                <FaTrophy />
                YAKUNLASH
              </span>
            </button>
          </div>
        </div>
      )}
      
      {/* Finish Screen */}
      {phase === "finish" && (
        <div className="relative transform-gpu overflow-hidden rounded-2xl border border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-900/30 via-rose-900/30 to-orange-900/30 p-8 backdrop-blur-xl text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 via-rose-500/10 to-orange-500/10" />
          
          <div className="relative mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-yellow-400/30" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-500">
                <FaCrown className="text-4xl text-white" />
              </div>
            </div>
          </div>
          
          <h2 className="relative mb-4 text-4xl font-black bg-gradient-to-r from-fuchsia-400 via-rose-400 to-orange-400 bg-clip-text text-transparent">
            {isSinglePlayer ? `${teamNames[0]} natijasi` : winner === null ? "DURRANG!" : `${teamNames[winner]} G'OLIB!`}
          </h2>
          
          <div className="relative mx-auto mb-8 max-w-md rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-fuchsia-400 font-bold">{teamNames[0]}</span>
              <span className="text-2xl font-black text-white">{scores[0]}</span>
            </div>
            {!isSinglePlayer && (
              <div className="flex items-center justify-between">
                <span className="text-rose-400 font-bold">{teamNames[1]}</span>
                <span className="text-2xl font-black text-white">{scores[1]}</span>
              </div>
            )}
            <div className="mt-4 text-sm text-gray-400">
              Raundlar: {roundsDone}/{TOTAL_ROUNDS}
            </div>
          </div>
          
          <div className="relative flex justify-center gap-4">
            <button
              onClick={handleStartGame}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-fuchsia-500 to-rose-500 px-6 py-3 font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
              <span className="relative flex items-center gap-2">
                <FaPlay />
                QAYTA O'YNA
              </span>
            </button>
            
            <button
              onClick={() => setPhase("teacher")}
              className="group relative overflow-hidden rounded-xl bg-white/10 px-6 py-3 font-bold text-white border border-white/20 transition-all hover:bg-white/20"
            >
              <span className="relative flex items-center gap-2">
                <FaRedo />
                SOZLAMALAR
              </span>
            </button>
          </div>
        </div>
      )}
      
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-10%",
                width: `${8 + Math.random() * 8}px`,
                height: `${8 + Math.random() * 8}px`,
                backgroundColor: ["#f472b6", "#fb7185", "#f59e0b", "#22d3ee", "#a855f7"][i % 5],
                animationDelay: `${Math.random() * 0.4}s`,
                animationDuration: `${1.6 + Math.random() * 1.1}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="rounded-full bg-gradient-to-r from-fuchsia-600 to-rose-600 px-6 py-3 text-white font-bold shadow-2xl animate-bounce">
            {toast}
          </div>
        </div>
      )}
      <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />
    </div>
  );
}

