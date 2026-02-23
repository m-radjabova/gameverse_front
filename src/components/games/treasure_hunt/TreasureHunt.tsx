import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBolt,
  FaCheckCircle,
  FaClock,
  FaCrown,
  FaEdit,
  FaGem,
  FaLightbulb,
  FaMapMarkedAlt,
  FaPlus,
  FaRedo,
  FaShip,
  FaSkull,
  FaTimesCircle,
  FaTrash
} from "react-icons/fa";
import { GiChest, GiTreasureMap, GiCompass, GiAnchor, GiPirateFlag } from "react-icons/gi";
import { MdOutlineTimer } from "react-icons/md";
import { IoMdNuclear } from "react-icons/io";
import Confetti from "react-confetti-boom";
import { fetchGameQuestions, saveGameQuestions } from "../../../apiClient/gameQuestions";
import useContextPro from "../../../hooks/useContextPro";
import { hasAnyRole } from "../../../utils/roles";
import pirateOrchestra from "../../../assets/pirate_orchestra.m4a";
import treasureMapImg from "../../../assets/map.jpg";
import { TREASURE_RIDDLES } from "./data/riddles";
import type { Riddle } from "./types";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../shared/useGameStartCountdown";

type Phase = "intro" | "play" | "finish";
type RiddleDraft = {
  title: string;
  story: string;
  question: string;
  options: [string, string, string, string];
  answerIndex: number;
  hint: string;
  reward: string;
};

const TREASURE_HUNT_GAME_KEY = "treasure_hunt";
const SECONDS_TOTAL = 12 * 60;
const SECONDS_PER_QUESTION = 45;
const HINT_PENALTY = 40;
const WRONG_PENALTY = 25;
const STEP_SCORE_REQUIREMENT = 95;
const EMPTY_DRAFT: RiddleDraft = {
  title: "",
  story: "",
  question: "",
  options: ["", "", "", ""],
  answerIndex: 0,
  hint: "",
  reward: "120",
};

const randomizeRiddles = (riddles: Riddle[]) => [...riddles].sort(() => Math.random() - 0.5);
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export default function TreasureHunt() {
  const navigate = useNavigate();
  const {
    state: { user },
  } = useContextPro();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const skipInitialRemoteSaveRef = useRef(true);

  const [phase, setPhase] = useState<Phase>("intro");
  const [questionBank, setQuestionBank] = useState<Riddle[]>(TREASURE_RIDDLES);
  const [riddles, setRiddles] = useState<Riddle[]>(() => randomizeRiddles(TREASURE_RIDDLES));
  const [draft, setDraft] = useState<RiddleDraft>(EMPTY_DRAFT);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [questionError, setQuestionError] = useState("");
  const [remoteLoaded, setRemoteLoaded] = useState(false);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [pathIndex, setPathIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(SECONDS_TOTAL);
  const [questionSeconds, setQuestionSeconds] = useState(SECONDS_PER_QUESTION);
  const [locked, setLocked] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [doubleReward, setDoubleReward] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showAnswerEffect, setShowAnswerEffect] = useState(false);
  const [answerResult, setAnswerResult] = useState<"correct" | "wrong" | null>(null);
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();

  const canManageQuestions = hasAnyRole(user, ["teacher", "admin"]);
  const current = riddles[questionIndex];
  const targetPath = Math.max(1, riddles.length - 1);
  const minScoreToWin = Math.max(900, riddles.length * STEP_SCORE_REQUIREMENT);
  const won = pathIndex >= targetPath && score >= minScoreToWin;
  const progressPct = riddles.length > 0 ? Math.round(((questionIndex + 1) / riddles.length) * 100) : 0;
  const pathProgressPct = targetPath > 0 ? Math.round((pathIndex / targetPath) * 100) : 0;

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const remote = await fetchGameQuestions<Riddle>(TREASURE_HUNT_GAME_KEY);
      if (!alive) return;
      if (remote && remote.length > 0) {
        setQuestionBank(remote);
        setRiddles(randomizeRiddles(remote));
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
    const t = window.setTimeout(() => void saveGameQuestions<Riddle>(TREASURE_HUNT_GAME_KEY, questionBank), 500);
    return () => window.clearTimeout(t);
  }, [questionBank, remoteLoaded]);

  useEffect(() => {
    const audio = new Audio(pirateOrchestra);
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (phase === "play") {
      void audioRef.current.play().catch(() => {});
      return;
    }
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }, [phase]);

  useEffect(() => {
    if (phase !== "play") return;
    if (secondsLeft <= 0) return setPhase("finish");
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, secondsLeft]);

  useEffect(() => {
    if (phase !== "play" || locked || questionSeconds <= 0) return;
    const t = window.setTimeout(() => setQuestionSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, questionSeconds, locked]);

  useEffect(() => {
    if (phase !== "play") return;
    setLocked(false);
    setSelected(null);
    setShowHint(false);
    setQuestionSeconds(SECONDS_PER_QUESTION);
    setDoubleReward(Math.random() < 0.25);
  }, [phase, questionIndex]);

  const resetDraft = () => {
    setDraft(EMPTY_DRAFT);
    setEditingIdx(null);
    setQuestionError("");
  };

  const saveRiddle = () => {
    const title = draft.title.trim();
    const story = draft.story.trim();
    const question = draft.question.trim();
    const options = draft.options.map((o) => o.trim()) as [string, string, string, string];
    const hint = draft.hint.trim();
    const reward = Number(draft.reward);
    if (!title || !story || !question || !hint) return setQuestionError("Barcha maydonlarni to'ldiring.");
    if (options.some((o) => !o)) return setQuestionError("4 ta variant kiriting.");
    if (new Set(options.map((o) => o.toLowerCase())).size < 4) return setQuestionError("Variantlar turlicha bo'lsin.");
    if (!Number.isFinite(reward) || reward < 10) return setQuestionError("Mukofot kamida 10 bo'lsin.");

    const item: Riddle = {
      id: editingIdx !== null ? questionBank[editingIdx]?.id ?? `${Date.now()}` : `${Date.now()}`,
      title,
      story,
      question,
      options,
      answerIndex: draft.answerIndex,
      hint,
      reward: Math.round(reward),
    };
    if (editingIdx !== null) {
      setQuestionBank((prev) => prev.map((r, idx) => (idx === editingIdx ? item : r)));
      setToast("Savol yangilandi");
      return resetDraft();
    }
    setQuestionBank((prev) => [...prev, item]);
    setToast("Savol qo'shildi");
    resetDraft();
  };

  const start = () => {
    if (questionBank.length < 1) return setQuestionError("Kamida 1 ta savol qo'shing.");
    setRiddles(randomizeRiddles(questionBank));
    setQuestionError("");
    setPhase("play");
    setQuestionIndex(0);
    setPathIndex(0);
    setScore(0);
    setSecondsLeft(SECONDS_TOTAL);
    setQuestionSeconds(SECONDS_PER_QUESTION);
    setLocked(false);
    setSelected(null);
    setShowHint(false);
    setDoubleReward(Math.random() < 0.25);
  };

  const handleStart = () => runStartCountdown(start);

  const goNext = () => {
    if (questionIndex + 1 >= riddles.length) return setPhase("finish");
    setQuestionIndex((v) => v + 1);
  };

  const onAnswer = (idx: number) => {
    if (phase !== "play" || locked || !current) return;
    setLocked(true);
    setSelected(idx);
    const correct = idx === current.answerIndex;
    setAnswerResult(correct ? "correct" : "wrong");
    setShowAnswerEffect(true);
    
    if (correct) {
      const speedBonus = Math.round(clamp(questionSeconds, 0, SECONDS_PER_QUESTION) * 1.5);
      const gain = (current.reward + speedBonus) * (doubleReward ? 2 : 1);
      const nextScore = score + gain;
      setScore(nextScore);
      setPathIndex((prev) => (nextScore >= (prev + 1) * STEP_SCORE_REQUIREMENT ? Math.min(targetPath, prev + 1) : prev));
    } else {
      setScore((s) => Math.max(0, s - WRONG_PENALTY));
      setPathIndex((p) => Math.max(0, p - 1));
    }
    
    setTimeout(() => {
      setShowAnswerEffect(false);
      setAnswerResult(null);
      goNext();
    }, 1200);
  };

  const grade = useMemo(() => {
    if (score >= 1300) return { name: "Afsonaviy Pirat", color: "from-amber-400 to-yellow-600", icon: FaCrown };
    if (score >= 950) return { name: "Xazina Ovchisi", color: "from-blue-400 to-cyan-600", icon: GiTreasureMap };
    if (score >= 700) return { name: "Dengiz Bo'risi", color: "from-emerald-400 to-teal-600", icon: FaShip };
    return { name: "Sabzi Pirat", color: "from-stone-400 to-stone-600", icon: GiPirateFlag };
  }, [score]);

  return (
    <div className="relative min-h-screen text-white">
      {/* Background Effect */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f2e] via-[#1a2f3e] to-[#0d2a3a]" />
        <div className="absolute inset-0 opacity-20" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-900/20 to-transparent" />
      </div>

      
        {toast && (
          <div
            className="fixed left-1/2 top-24 z-50 -translate-x-1/2"
          >
            <div className="relative rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-bold text-white shadow-2xl">
              <div className="absolute inset-0 rounded-full bg-white/20 blur-sm" />
              <span className="relative">{toast}</span>
            </div>
          </div>
        )}
      

      
        {phase === "intro" && (
          <div
            key="intro"
            className="space-y-6"
          >
            {canManageQuestions && (
              <div
                className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-900/40 to-amber-950/40 p-6 backdrop-blur-sm"
              >
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-yellow-500/20 blur-3xl" />
                
                <h3 className="mb-6 flex items-center gap-2 text-2xl font-black text-amber-300">
                  <GiPirateFlag className="text-3xl" />
                  O'QITUVCHI PANELI
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    value={draft.title}
                    onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                    className="rounded-xl border border-amber-500/30 bg-black/30 p-3 backdrop-blur-sm transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    placeholder="📝 Sarlavha"
                  />
                  <input
                    value={draft.story}
                    onChange={(e) => setDraft((p) => ({ ...p, story: e.target.value }))}
                    className="rounded-xl border border-amber-500/30 bg-black/30 p-3 backdrop-blur-sm transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    placeholder="📖 Hikoya"
                  />
                  <input
                    value={draft.question}
                    onChange={(e) => setDraft((p) => ({ ...p, question: e.target.value }))}
                    className="rounded-xl border border-amber-500/30 bg-black/30 p-3 backdrop-blur-sm transition-all md:col-span-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    placeholder="❓ Savol"
                  />
                  {draft.options.map((o, i) => (
                    <input
                      key={i}
                      value={o}
                      onChange={(e) => setDraft((p) => { 
                        const next = [...p.options] as [string, string, string, string]; 
                        next[i] = e.target.value; 
                        return { ...p, options: next }; 
                      })}
                      className="rounded-xl border border-amber-500/30 bg-black/30 p-3 backdrop-blur-sm transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                      placeholder={`${i + 1}-variant`}
                    />
                  ))}
                  <select
                    value={draft.answerIndex}
                    onChange={(e) => setDraft((p) => ({ ...p, answerIndex: Number(e.target.value) }))}
                    className="rounded-xl border border-amber-500/30 bg-black/30 p-3 backdrop-blur-sm transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  >
                    <option value={0} className="bg-gray-900">✅ Javob: 1</option>
                    <option value={1} className="bg-gray-900">✅ Javob: 2</option>
                    <option value={2} className="bg-gray-900">✅ Javob: 3</option>
                    <option value={3} className="bg-gray-900">✅ Javob: 4</option>
                  </select>
                  <input
                    value={draft.reward}
                    onChange={(e) => setDraft((p) => ({ ...p, reward: e.target.value }))}
                    className="rounded-xl border border-amber-500/30 bg-black/30 p-3 backdrop-blur-sm transition-all focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    placeholder="💰 Ball"
                  />
                  <input
                    value={draft.hint}
                    onChange={(e) => setDraft((p) => ({ ...p, hint: e.target.value }))}
                    className="rounded-xl border border-amber-500/30 bg-black/30 p-3 backdrop-blur-sm transition-all md:col-span-2 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    placeholder="💡 Hint"
                  />
                </div>

                {questionError && (
                  <p
                    className="mt-2 text-sm text-rose-300"
                  >
                    {questionError}
                  </p>
                )}

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={saveRiddle}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-bold shadow-lg transition-all hover:shadow-amber-500/50"
                  >
                    {editingIdx !== null ? <FaEdit className="text-lg" /> : <FaPlus className="text-lg" />}
                    {editingIdx !== null ? "Saqlash" : "Qo'shish"}
                  </button>
                  {editingIdx !== null && (
                    <button
                      onClick={resetDraft}
                      className="rounded-xl border border-amber-500/50 px-6 py-3 font-bold backdrop-blur-sm transition-all hover:bg-amber-500/10"
                    >
                      Bekor
                    </button>
                  )}
                </div>

                <div className="mt-6 space-y-2">
                  <h4 className="text-lg font-bold text-amber-300">Savollar Ro'yxati</h4>
                  {questionBank.map((r, idx) => (
                    <div
                      key={`${r.id}-${idx}`}
                      className="group flex items-start justify-between rounded-xl border border-amber-500/20 bg-black/20 p-3 backdrop-blur-sm transition-all hover:border-amber-500/40 hover:bg-black/30"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/30 text-xs font-bold">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-amber-100/80 line-clamp-1">{r.question}</p>
                      </div>
                      <div className="flex gap-2 opacity-60 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => { 
                            setEditingIdx(idx); 
                            setDraft({ 
                              title: r.title, 
                              story: r.story, 
                              question: r.question, 
                              options: [...r.options], 
                              answerIndex: r.answerIndex, 
                              hint: r.hint, 
                              reward: String(r.reward) 
                            }); 
                          }}
                          className="rounded-lg bg-cyan-600/30 p-2 transition-colors hover:bg-cyan-600/50"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => setQuestionBank((prev) => prev.filter((_, i) => i !== idx))}
                          className="rounded-lg bg-rose-600/30 p-2 transition-colors hover:bg-rose-600/50"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-900/30 to-amber-950/30 p-8 backdrop-blur-sm"
            >
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-amber-500/20 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-yellow-500/20 blur-3xl" />
              
              <div className="relative z-10">
                <h3 className="mb-6 flex items-center gap-3 text-3xl font-black text-amber-300">
                  <GiTreasureMap className="text-4xl" />
                  XAZINA OVCHILARI
                </h3>
                
                <div className="mb-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-black/20 p-4 backdrop-blur-sm">
                    <h4 className="mb-2 text-lg font-bold text-amber-400">⚔️ Qanday o'ynaladi?</h4>
                    <p className="text-sm text-amber-100/80">
                      Har bir to'g'ri javob sizni xazinaga yaqinlashtiradi. 
                      Noto'g'ri javob esa orqaga qaytaradi.
                    </p>
                  </div>
                  <div className="rounded-xl bg-black/20 p-4 backdrop-blur-sm">
                    <h4 className="mb-2 text-lg font-bold text-amber-400">💰 Ballar</h4>
                    <p className="text-sm text-amber-100/80">
                      To'g'ri javob: {current?.reward || 120} ball + vaqt bonusi<br />
                      Xato javob: -{WRONG_PENALTY} ball<br />
                      Hint: -{HINT_PENALTY} ball
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleStart}
                  className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 p-4 text-xl font-black shadow-2xl transition-all hover:shadow-amber-500/50"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform group-hover:translate-y-0" />
                  <span className="relative flex items-center justify-center gap-3">
                    <GiAnchor className="text-2xl" />
                    SARGUZASHTNI BOSHLASH
                    <FaShip className="text-2xl" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === "play" && current && (
          <div
            key="play"
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-900/40 to-amber-950/40 p-4 backdrop-blur-sm"
              >
                <div className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-amber-500/20 blur-xl transition-all group-hover:scale-150" />
                <MdOutlineTimer className="mb-1 text-2xl text-amber-400" />
                <div className="text-2xl font-bold text-amber-300">{formatTime(secondsLeft)}</div>
                <div className="text-xs text-amber-100/60">Umumiy vaqt</div>
              </div>

              <div
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-900/40 to-amber-950/40 p-4 backdrop-blur-sm"
              >
                <div className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-yellow-500/20 blur-xl transition-all group-hover:scale-150" />
                <GiTreasureMap className="mb-1 text-2xl text-yellow-400" />
                <div className="text-2xl font-bold text-yellow-300">{progressPct}%</div>
                <div className="text-xs text-amber-100/60">Progress</div>
              </div>

              <div
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-900/40 to-amber-950/40 p-4 backdrop-blur-sm"
              >
                <div className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-emerald-500/20 blur-xl transition-all group-hover:scale-150" />
                <FaGem className="mb-1 text-2xl text-emerald-400" />
                <div className="text-2xl font-bold text-emerald-300">{score}</div>
                <div className="text-xs text-amber-100/60">Ball</div>
              </div>

              <div
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-900/40 to-amber-950/40 p-4 backdrop-blur-sm"
              >
                <div className="absolute -right-5 -top-5 h-16 w-16 rounded-full bg-purple-500/20 blur-xl transition-all group-hover:scale-150" />
                <FaClock className="mb-1 text-2xl text-purple-400" />
                <div className="text-2xl font-bold text-purple-300">{questionSeconds}s</div>
                <div className="text-xs text-amber-100/60">Savol vaqti</div>
              </div>
            </div>

            {/* Treasure Map */}
            <div
              className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-900/40 to-amber-950/40 p-5 backdrop-blur-sm"
            >
              <div className="mb-3 flex items-center justify-between text-sm font-bold tracking-wide">
                <span className="flex items-center gap-2 text-amber-300">
                  <GiAnchor className="text-lg" />
                  BOSHLANISH
                </span>
                <span className="rounded-full border border-amber-500/30 bg-black/30 px-4 py-1.5 text-amber-300">
                  {pathProgressPct}% Yo'l
                </span>
                <span className="flex items-center gap-2 text-amber-300">
                  XAZINA
                  <GiChest className="text-lg" />
                </span>
              </div>

              <div className="relative h-64 overflow-hidden rounded-2xl border-2 border-amber-700/50 md:h-80 lg:h-96">
                <img
                  src={treasureMapImg}
                  alt="Treasure map"
                  className="h-full w-full object-cover transition-transform duration-10000 hover:scale-110"
                />
                
                {/* Map Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-amber-950/60 via-transparent to-amber-950/30" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_60%,rgba(0,0,0,0.4)_100%)]" />
                
                {/* Animated Path */}
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
                      <stop offset={`${pathProgressPct}%`} stopColor="#f59e0b" stopOpacity="1" />
                      <stop offset={`${pathProgressPct}%`} stopColor="#f59e0b" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#92400e" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M8,30 C22,10 38,34 55,20 C69,8 81,12 92,9"
                    stroke="url(#pathGradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="4 4"
                  />
                </svg>

                {/* Start Marker */}
                <div
                  className="absolute left-[8%] top-[75%] -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="relative">
                    <div className="absolute -inset-2 rounded-full bg-emerald-500/30 blur-md" />
                    <div className="relative flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-xl">
                      <FaShip />
                      START
                    </div>
                  </div>
                </div>

                {/* Treasure Marker */}
                <div
                  className="absolute left-[92%] top-[22%] -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="relative">
                    <div className="absolute -inset-3 rounded-full bg-yellow-500/30 blur-md" />
                    <div className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 text-sm font-bold text-amber-950 shadow-xl">
                      <GiChest className="text-lg" />
                      XAZINA
                    </div>
                  </div>
                </div>

                {/* Player Marker */}
                <div
                  className="absolute top-0 h-full"
                  style={{ left: `${8 + (92 - 8) * (pathProgressPct / 100)}%` }}
                >
                  <div className="absolute top-[48%] -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="absolute -inset-3 rounded-full bg-amber-400/40 blur-lg" />
                      <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-amber-300 to-amber-500 p-2 shadow-2xl">
                        <GiCompass className="h-5 w-5 text-amber-950" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div
              className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-900/40 to-amber-950/40 p-6 backdrop-blur-sm"
            >
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl" />
              
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-amber-500/30 px-4 py-1.5 text-sm font-bold text-amber-300">
                  {current.title}
                </span>
                {doubleReward && (
                  <div
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 px-4 py-1.5 font-bold text-amber-950"
                  >
                    <FaBolt />
                    BONUS x2
                  </div>
                )}
              </div>

              <p className="mb-4 text-lg text-amber-100/90 italic">{current.story}</p>
              
              <h3 className="mb-6 text-2xl font-black text-white md:text-3xl">
                {current.question}
              </h3>

              <div className="mb-6 flex items-center gap-4">
                <button
                  onClick={() => { 
                    if (!locked && !showHint) { 
                      setShowHint(true); 
                      setScore((s) => Math.max(0, s - HINT_PENALTY)); 
                    } 
                  }}
                  disabled={locked || showHint}
                  className="group relative flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-2.5 text-sm font-bold disabled:opacity-50"
                >
                  <FaLightbulb className="text-lg transition-transform group-hover:rotate-12" />
                  Hint (-{HINT_PENALTY})
                </button>

                <div className="flex items-center gap-2 text-sm text-amber-300">
                  <MdOutlineTimer />
                  <span>{questionSeconds}s qoldi</span>
                </div>
              </div>

              
                {showHint && (
                  <div
                    className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 backdrop-blur-sm"
                  >
                    <p className="text-sm text-amber-200">💡 {current.hint}</p>
                  </div>
                )}
              

              <div className="grid gap-3 sm:grid-cols-2">
                {current.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const isCorrect = i === current.answerIndex;
                  const showResult = locked && selected !== null;
                  
                  return (
                    <button
                      key={i}
                      onClick={() => onAnswer(i)}
                      disabled={locked}
                      className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all ${
                        showResult && isCorrect
                          ? "border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/20"
                          : showResult && isSelected && !isCorrect
                          ? "border-rose-400 bg-rose-500/20 shadow-lg shadow-rose-500/20"
                          : "border-amber-500/30 bg-black/30 hover:border-amber-400/50 hover:bg-amber-500/10"
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      
                      <div className="relative flex items-center justify-between">
                        <span className="text-lg">{opt}</span>
                        {showResult && isCorrect && (
                          <div
                          >
                            <FaCheckCircle className="text-2xl text-emerald-400" />
                          </div>
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <div
                          >
                            <FaTimesCircle className="text-2xl text-rose-400" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Answer Effect Overlay */}
            
              {showAnswerEffect && answerResult && (
                <div
                  className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
                >
                  <div
                    className={`text-9xl ${
                      answerResult === "correct" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {answerResult === "correct" ? "✓" : "✗"}
                  </div>
                </div>
              )}
            

            {/* Finish Button */}
            <button
              onClick={() => setPhase("finish")}
              className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 p-4 font-bold shadow-xl transition-all hover:shadow-amber-600/50"
            >
              <IoMdNuclear className="mr-2 inline text-xl" />
              SARGUZASHTNI YAKUNLASH
            </button>
          </div>
        )}

        {phase === "finish" && (
          <div
            key="finish"
            className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-900/40 to-amber-950/40 p-8 text-center backdrop-blur-sm"
          >
            {won && <Confetti mode="boom" particleCount={100} effectCount={2} x={0.5} y={0.35} />}
            
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-yellow-500/20 blur-3xl" />
            
            <div
              className="mb-6 text-8xl"
            >
              {won ? <GiChest /> : <FaSkull />}
            </div>

            <h2 className="mb-4 text-4xl font-black text-amber-300">
              {won ? "🏆 XAZINA TOPILDI! 🏆" : "☠️ MAG'LUB BO'LDINGIZ ☠️"}
            </h2>

            <div className="mb-6 space-y-3">
              <p className="text-2xl">
                Yakuniy ball: <span className="font-bold text-amber-400">{score}</span>
              </p>
              
              <div
                className={`inline-block rounded-full bg-gradient-to-r ${grade.color} p-4`}
              >
                <grade.icon className="text-4xl text-white" />
              </div>
              
              <p className="text-xl">
                Reyting: <span className={`font-bold bg-gradient-to-r ${grade.color} bg-clip-text text-transparent`}>
                  {grade.name}
                </span>
              </p>

              {!won && (
                <p className="text-amber-200/70">
                  Kerakli minimum ball: {minScoreToWin}
                </p>
              )}
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={handleStart}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-3 font-bold shadow-xl transition-all hover:shadow-amber-500/50"
              >
                <FaRedo />
                Yana o'yna
              </button>
              
              <button
                onClick={() => navigate("/games")}
                className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/50 px-8 py-3 font-bold backdrop-blur-sm transition-all hover:bg-amber-500/10"
              >
                <FaMapMarkedAlt />
                O'yinlar
              </button>
            </div>
          </div>
        )}
      
      <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />
    </div>
  );
}
