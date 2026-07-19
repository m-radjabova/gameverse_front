import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBolt,
  FaCheckCircle,
  FaCrown,
  FaEdit,
  FaLightbulb,
  FaMapMarkedAlt,
  FaPlus,
  FaRedo,
  FaShip,
  FaTimesCircle,
  FaTrash
} from "react-icons/fa";
import { GiTreasureMap, GiAnchor, GiPirateFlag } from "react-icons/gi";
import { MdOutlineTimer } from "react-icons/md";
import { IoMdNuclear } from "react-icons/io";
import Confetti from "react-confetti-boom";
import { fetchGameQuestionsByTeacher, saveGameQuestions } from "../../../hooks/useGameQuestions";
import { generateTreasureHuntRiddles } from "./ai";
import useContextPro from "../../../hooks/useContextPro";
import { hasAnyRole } from "../../../utils/roles";
import pirateOrchestra from "../../../assets/sounds/pirate_orchestra.m4a";
import { TREASURE_RIDDLES } from "./data/riddles";
import type { Riddle } from "./types";
import { useGameStartCountdown } from "../../../hooks/useGameStartCountdown";
import { useFinishApplause } from "../../../hooks/useFinishApplause";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { GRADE_RANGE_OPTIONS, type GradeRange } from "../../../utils/aiGeneration";
import { getGameQuestionDifficulty } from "../../../hooks/gameSession";
import { filterGameQuestionsByDifficulty } from "../../../utils/gameQuestionDifficulty";
import ExpeditionMap from "./ExpeditionMap";
import "./treasureHunt.css";

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
const SHOW_INLINE_QUESTION_EDITOR = false;
const SECONDS_TOTAL = 12 * 60;
const SECONDS_PER_QUESTION = 45;
const HINT_PENALTY = 40;
const WRONG_PENALTY = 25;
const AI_GENERATE_OPTIONS = [1, 3, 5, 10, 20] as const;
const AI_DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Oson" },
  { value: "medium", label: "O'rta" },
  { value: "hard", label: "Qiyin" },
  { value: "mixed", label: "Aralash" },
] as const;
const EMPTY_DRAFT: RiddleDraft = {
  title: "", story: "", question: "",
  options: ["", "", "", ""],
  answerIndex: 0, hint: "", reward: "120",
};

const randomizeRiddles = (riddles: Riddle[]) => [...riddles].sort(() => Math.random() - 0.5);
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

const buildLocalFallbackRiddles = (count: number): Riddle[] =>
  Array.from({ length: count }, (_, index) => {
    const source = TREASURE_RIDDLES[index % TREASURE_RIDDLES.length] ?? TREASURE_RIDDLES[0];

    return {
      id: `${Date.now()}-fallback-${index}`,
      title: source.title,
      story: source.story,
      question: source.question,
      options: [...source.options] as [string, string, string, string],
      answerIndex: source.answerIndex,
      hint: source.hint,
      reward: source.reward,
    };
  });
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export default function TreasureHunt() {
  const navigate = useNavigate();
  const {
    state: { user, isLoading: isUserLoading },
  } = useContextPro();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mapScrollRef = useRef<HTMLDivElement | null>(null);
  const skipInitialRemoteSaveRef = useRef(true);
  const answerHandlerRef = useRef<(index: number) => void>(() => undefined);

  const [phase, setPhase] = useState<Phase>("intro");
  useFinishApplause(phase === "finish");
  const [questionBank, setQuestionBank] = useState<Riddle[]>(TREASURE_RIDDLES);
  const [riddles, setRiddles] = useState<Riddle[]>(() => randomizeRiddles(TREASURE_RIDDLES));
  const [draft, setDraft] = useState<RiddleDraft>(EMPTY_DRAFT);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [questionError, setQuestionError] = useState("");
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiGradeRange, setAiGradeRange] = useState<GradeRange>("none");
  const [aiCount, setAiCount] = useState<number>(1);
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("medium");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [pathIndex, setPathIndex] = useState(0);
  const [keysFound, setKeysFound] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
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
  const [answerMessage, setAnswerMessage] = useState("");
  const [questionPanelOpen, setQuestionPanelOpen] = useState(true);
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();

  const canManageQuestions = hasAnyRole(user, ["teacher", "admin"]);
  const hasGeminiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY?.trim());
  const current = riddles[questionIndex];
  const targetPath = Math.max(1, riddles.length);
  const keysNeeded = Math.max(1, Math.ceil(riddles.length * 0.6));
  const won = keysFound >= keysNeeded;
  // const progressPct = riddles.length > 0 ? Math.round(((questionIndex + 1) / riddles.length) * 100) : 0;
  const pathProgressPct = targetPath > 0 ? Math.round((pathIndex / targetPath) * 100) : 0;

  useEffect(() => {
    const map = mapScrollRef.current;
    if (phase !== "play" || !map) return;
    const maxScroll = Math.max(0, map.scrollHeight - map.clientHeight);
    map.scrollTo({ top: maxScroll * (pathProgressPct / 100), behavior: "smooth" });
  }, [phase, pathProgressPct]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (isUserLoading) return;

    let alive = true;
    (async () => {
      if (!user?.id) {
        const defaults = filterGameQuestionsByDifficulty(TREASURE_RIDDLES, getGameQuestionDifficulty("treasure-hunt"));
        setQuestionBank(defaults);
        setRiddles(randomizeRiddles(defaults));
        setRemoteLoaded(true);
        return;
      }

      const remote = await fetchGameQuestionsByTeacher<Riddle>(TREASURE_HUNT_GAME_KEY, user.id);
      if (!alive) return;
      if (remote && remote.length > 0) {
        const selected = filterGameQuestionsByDifficulty(remote, getGameQuestionDifficulty("treasure-hunt"));
        setQuestionBank(selected);
        setRiddles(randomizeRiddles(selected));
      } else {
        const defaults = filterGameQuestionsByDifficulty(TREASURE_RIDDLES, getGameQuestionDifficulty("treasure-hunt"));
        setQuestionBank(defaults);
        setRiddles(randomizeRiddles(defaults));
      }
      setRemoteLoaded(true);
    })();
    return () => { alive = false; };
  }, [isUserLoading, user?.id]);

  useEffect(() => {
    if (!remoteLoaded) return;
    if (skipInitialRemoteSaveRef.current) { skipInitialRemoteSaveRef.current = false; return; }
    const t = window.setTimeout(() => {
      if (!user?.id) return;
      void saveGameQuestions<Riddle>(TREASURE_HUNT_GAME_KEY, questionBank, user.id);
    }, 500);
    return () => window.clearTimeout(t);
  }, [questionBank, remoteLoaded, user?.id]);

  useEffect(() => {
    const audio = new Audio(pirateOrchestra);
    audio.preload = "none";
    audio.loop = true; audio.volume = 0.35;
    audioRef.current = audio;
    return () => { audio.pause(); audio.currentTime = 0; audioRef.current = null; };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (phase === "play") { void audioRef.current.play().catch(() => {}); return; }
    audioRef.current.pause(); audioRef.current.currentTime = 0;
  }, [phase]);

  useEffect(() => {
    if (phase !== "play") return;
    if (secondsLeft <= 0) return setPhase("finish");
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, secondsLeft]);

  useEffect(() => {
    if (phase !== "play") return;
    setLocked(false); setSelected(null); setShowHint(false);
    setQuestionPanelOpen(true);
    setQuestionSeconds(SECONDS_PER_QUESTION);
    setDoubleReward(Math.random() < 0.25);
  }, [phase, questionIndex]);

  const resetDraft = () => { setDraft(EMPTY_DRAFT); setEditingIdx(null); setQuestionError(""); };

  const generateWithAi = async () => {
    if (isGeneratingAi) return;
    if (!user?.id) {
      setQuestionError("Iltimos, avval ro'yxatdan o'ting. Keyin AI bilan savol qo'shishingiz mumkin.");
      return;
    }

    setQuestionError("");
    setIsGeneratingAi(true);
    try {
      const generated = await generateTreasureHuntRiddles({
        topic: aiTopic,
        count: aiCount,
        difficulty: aiDifficulty,
        gradeRange: aiGradeRange,
      });
      const generatedItems: Riddle[] = generated.map((item, index) => ({
        id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
        title: item.title,
        story: item.story,
        question: item.question,
        options: item.options,
        answerIndex: item.answerIndex,
        hint: item.hint,
        reward: item.reward,
      }));
      setQuestionBank((prev) => {
        const nextItems = [...prev, ...generatedItems];
        setRiddles(randomizeRiddles(nextItems));
        return nextItems;
      });
      setEditingIdx(null);
      setDraft(EMPTY_DRAFT);
      setToast(`${generatedItems.length} ta ${AI_DIFFICULTY_OPTIONS.find((item) => item.value === aiDifficulty)?.label.toLowerCase()} savol qo'shildi`);
    } catch {
      const fallbackItems = buildLocalFallbackRiddles(aiCount);
      setQuestionBank((prev) => {
        const nextItems = [...prev, ...fallbackItems];
        setRiddles(randomizeRiddles(nextItems));
        return nextItems;
      });
      setEditingIdx(null);
      setDraft(EMPTY_DRAFT);
      setToast(`${fallbackItems.length} ta savol qo'shildi`);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const saveRiddle = () => {
    if (!user?.id) {
      setQuestionError("Iltimos, avval ro'yxatdan o'ting. Keyin savol qo'shishingiz mumkin.");
      return;
    }

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
      title, story, question, options, answerIndex: draft.answerIndex, hint, reward: Math.round(reward),
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
    setQuestionIndex(0); setPathIndex(0); setScore(0); setKeysFound(0);
    setStreak(0); setBestStreak(0); setAnswerMessage("");
    setSecondsLeft(SECONDS_TOTAL); setQuestionSeconds(SECONDS_PER_QUESTION);
    setLocked(false); setSelected(null); setShowHint(false);
    setDoubleReward(Math.random() < 0.25);
  };

  const handleStart = () => runStartCountdown(start);

  const goNext = () => {
    if (questionIndex + 1 >= riddles.length) return setPhase("finish");
    setQuestionIndex((v) => v + 1);
  };

  const onAnswer = (idx: number) => {
    if (phase !== "play" || locked || !current) return;
    setLocked(true); setSelected(idx);
    const correct = idx === current.answerIndex;
    setAnswerResult(correct ? "correct" : "wrong");
    setShowAnswerEffect(true);
    if (correct) {
      const speedBonus = Math.round(clamp(questionSeconds, 0, SECONDS_PER_QUESTION) * 1.5);
      const nextStreak = streak + 1;
      const streakBonus = Math.min(100, Math.max(0, nextStreak - 1) * 20);
      const gain = (current.reward + speedBonus + streakBonus) * (doubleReward ? 2 : 1);
      const nextScore = score + gain;
      setScore(nextScore);
      setKeysFound((value) => value + 1);
      setStreak(nextStreak);
      setBestStreak((value) => Math.max(value, nextStreak));
      setAnswerMessage(`To'g'ri! ${current.options[current.answerIndex]}. +${gain} ball${streakBonus ? `, seriya bonusi +${streakBonus}` : ""}`);
    } else {
      setScore((s) => Math.max(0, s - WRONG_PENALTY));
      setStreak(0);
      setAnswerMessage(idx < 0
        ? `Vaqt tugadi. To'g'ri javob: ${current.options[current.answerIndex]}`
        : `To'g'ri javob: ${current.options[current.answerIndex]}. ${current.hint}`);
    }
    setPathIndex((value) => Math.min(targetPath, value + 1));
    setTimeout(() => { setShowAnswerEffect(false); setAnswerResult(null); setAnswerMessage(""); goNext(); }, 1900);
  };
  answerHandlerRef.current = onAnswer;

  useEffect(() => {
    if (phase !== "play") return;
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setQuestionPanelOpen((value) => !value);
        return;
      }
      if (locked || !questionPanelOpen || event.repeat) return;
      const shortcuts: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 };
      const answerIndex = shortcuts[event.key.toLowerCase()];
      if (answerIndex === undefined) return;
      event.preventDefault();
      answerHandlerRef.current(answerIndex);
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [locked, phase, questionPanelOpen]);

  useEffect(() => {
    if (phase !== "play" || locked) return;
    if (questionSeconds <= 0) {
      answerHandlerRef.current(-1);
      return;
    }
    const timer = window.setTimeout(() => setQuestionSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, questionSeconds, locked]);

  const grade = useMemo(() => {
    if (score >= 1300) return { name: "Afsonaviy Pirat", color: "from-amber-400 to-yellow-600", icon: FaCrown };
    if (score >= 950) return { name: "Xazina Ovchisi", color: "from-blue-400 to-cyan-600", icon: GiTreasureMap };
    if (score >= 700) return { name: "Dengiz Bo'risi", color: "from-emerald-400 to-teal-600", icon: FaShip };
    return { name: "Jake Varabey", color: "from-stone-400 to-stone-600", icon: GiPirateFlag };
  }, [score]);
  const backgroundStars = useMemo(
    () => Array.from({ length: 18 }, (_, index) => ({
      id: index,
      size: Math.random() * 2 + 1,
      left: Math.random() * 100,
      top: Math.random() * 60,
      opacity: Math.random() * 0.45 + 0.1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 3,
    })),
    []
  );

  // -- Timer ring --
  const timerPct = (questionSeconds / SECONDS_PER_QUESTION) * 100;
  const timerColor = questionSeconds <= 10 ? "#ef4444" : questionSeconds <= 20 ? "#f59e0b" : "#22c55e";
  return (
    <div
      className="relative min-h-screen text-white"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      {/* -- Atmospheric background -- */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#08151f] via-[#0d1f2d] to-[#060e16]" />
        {backgroundStars.map((star) => (
          <div key={star.id} className="absolute rounded-full bg-white"
            style={{
              width: star.size,
              height: star.size,
              left: `${star.left}%`,
              top: `${star.top}%`,
              opacity: star.opacity,
              animation: `pulse ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
        {/* Sea bottom glow */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-amber-900/15 to-transparent" />
        {/* Fog layer */}
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(ellipse at 20% 80%, rgba(30,60,90,0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(20,50,80,0.3) 0%, transparent 50%)"
          }}
        />
      </div>

      {/* -- Toast -- */}
      {toast && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2">
          <div className="relative rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-bold text-amber-950 shadow-2xl shadow-amber-500/40">
            <div className="absolute inset-0 rounded-full bg-white/20 blur-sm" />
            <span className="relative">{toast}</span>
          </div>
        </div>
      )}

      {/* -- INTRO PHASE -- */}
      {phase === "intro" && (
        <div className="space-y-6 p-4">
          {/* Hero card */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-600/30 bg-gradient-to-br from-amber-950/50 to-stone-900/50 p-8 shadow-2xl backdrop-blur-sm">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-yellow-600/10 blur-3xl" />
            <div className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px] xl:items-start">
              <div className="space-y-6">
                <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border-2 border-amber-500/50 shadow-2xl shadow-cyan-950/60">
                  <ExpeditionMap progress={5} keysFound={0} totalKeys={keysNeeded} compact />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-6 pb-5 pt-12 text-center">
                    <p className="text-2xl font-black tracking-[0.18em] text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
                      🏴‍☠️ BUYUK XAZINA EKSPEDITSIYASI
                    </p>
                    <p className="mt-1 text-xs tracking-widest text-amber-300/80">10 bekat • 4 sirli hudud • bitta afsonaviy sandiq</p>
                  </div>
                  <div className="absolute left-4 top-4 rounded-full border border-amber-600/40 bg-black/60 px-3 py-1.5 text-lg backdrop-blur-sm">🏴‍☠️</div>
                  <div className="absolute right-4 top-4 rounded-full border border-amber-600/40 bg-black/60 px-3 py-1.5 text-lg backdrop-blur-sm">🗺️</div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: "🧭", title: "Katta ekspeditsiya", text: "Har savoldan keyin yangi bekat, orol yoki dengiz siri ochiladi." },
                { icon: "🔑", title: "Bilim kalitlari", text: `To'g'ri javob kalit beradi. ${keysNeeded} ta kalit sandiqni ochadi. Ketma-ket javoblar bonus beradi.` },
                { icon: "🌍", title: "Foydali bilim", text: "Geografiya, tabiat, tarix, matematika va fazo bo'yicha qiziqarli savollar." },
              ].map(({ icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-amber-700/20 bg-black/30 p-4 backdrop-blur-sm">
                  <div className="mb-2 text-2xl">{icon}</div>
                  <h4 className="mb-1 font-bold text-amber-400 text-sm">{title}</h4>
                  <p className="text-xs text-amber-100/70 leading-relaxed whitespace-pre-line">{text}</p>
                </div>
              ))}
                </div>
              </div>

              <div className="relative rounded-3xl border border-amber-500/25 bg-black/25 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-sm xl:sticky xl:top-6">
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-amber-500/75">Sarguzashtga tayyor</p>
                <h3 className="mt-3 text-3xl font-black leading-tight text-amber-100">
                  Dengizlarni kesib o'ting, bilim kalitlarini yig'ing
                </h3>
                <p className="mt-3 text-sm leading-7 text-amber-100/70">
                  Har bir to'g'ri javob yangi hududni ochadi. Tez va ketma-ket javob bersangiz, ko'proq ball hamda kapitan unvonlarini qo'lga kiritasiz.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-amber-700/25 bg-amber-950/30 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-500/75">Savollar</p>
                    <p className="mt-2 text-2xl font-black text-amber-200">{questionBank.length}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-700/25 bg-amber-950/30 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-amber-500/75">Kerakli kalit</p>
                    <p className="mt-2 text-2xl font-black text-amber-200">🔑 {keysNeeded}</p>
                  </div>
                </div>

                <button onClick={handleStart}
                  className="group relative mt-6 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 py-5 text-xl font-black tracking-wider text-amber-950 shadow-2xl shadow-amber-500/30 transition-all hover:scale-[1.01] hover:shadow-amber-500/50">
                  <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
                  <span className="relative flex items-center justify-center gap-4">
                    <GiAnchor className="text-2xl" />
                    SARGUZASHTNI BOSHLASH
                    <FaShip className="text-2xl" />
                  </span>
                </button>
              </div>
            </div>
          </div>

          {canManageQuestions && SHOW_INLINE_QUESTION_EDITOR && (
            <div className="relative overflow-hidden rounded-3xl border border-amber-600/30 bg-gradient-to-br from-amber-950/60 to-stone-900/60 p-6 shadow-2xl backdrop-blur-sm">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-black tracking-wider text-amber-300">
                    <GiPirateFlag className="text-2xl" />O'QITUVCHI PANELI
                  </h3>
                  <p className="mt-1 text-sm text-amber-100/65">Savol qo'shish va tahrirlash paneli pastga ko'chirildi, shuning uchun start qismi yuqorida qulayroq ko'rinadi.</p>
                </div>
                <div className="rounded-2xl border border-amber-600/25 bg-black/20 px-4 py-2 text-sm text-amber-200/80">
                  Jami savollar: <span className="font-black text-amber-300">{questionBank.length}</span>
                </div>
              </div>
              <div className="mb-3 grid gap-2 md:grid-cols-[1fr_auto]">
                <div className="grid gap-2 md:grid-cols-[1fr_140px_140px]">
                  <textarea
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    rows={4}
                    className="rounded-xl border border-cyan-500/30 bg-black/40 px-4 py-3 text-cyan-100 outline-none transition-all placeholder-cyan-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                    placeholder="Mavzu: geografiya, hayvonlar, tarixiy kashfiyotlar..."
                  />
                  <select
                    value={aiGradeRange}
                    onChange={(e) => setAiGradeRange(e.target.value as GradeRange)}
                    className="rounded-xl border border-cyan-500/30 bg-slate-950 px-4 py-3 text-cyan-100 outline-none focus:border-cyan-400"
                  >
                    {GRADE_RANGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-slate-950">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    className="rounded-xl border border-cyan-500/30 bg-slate-950 px-4 py-3 text-cyan-100 outline-none focus:border-cyan-400"
                  >
                    {AI_GENERATE_OPTIONS.map((count) => (
                      <option key={count} value={count} className="bg-slate-950">
                        {count} ta savol
                      </option>
                    ))}
                  </select>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value as "easy" | "medium" | "hard" | "mixed")}
                    className="rounded-xl border border-cyan-500/30 bg-slate-950 px-4 py-3 text-cyan-100 outline-none focus:border-cyan-400"
                  >
                    {AI_DIFFICULTY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-slate-950">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => void generateWithAi()}
                  disabled={!hasGeminiKey || isGeneratingAi}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 font-bold text-slate-950 shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50 hover:shadow-cyan-500/40"
                >
                  {isGeneratingAi ? `${aiCount} ta yaratilmoqda...` : `AI bilan ${aiCount} ta qo'shish`}
                </button>
              </div>
              <p className="mb-3 text-xs text-cyan-200/80">
                AI yaratganda yangi {aiCount} ta {AI_DIFFICULTY_OPTIONS.find((item) => item.value === aiDifficulty)?.label.toLowerCase()} savol hozirgi ro'yxatga qo'shiladi va tanlangan sinf oralig'iga moslashadi.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { val: draft.title, ph: "🏴‍☠️ Sarlavha", key: "title" },
                  { val: draft.story, ph: "📜 Hikoya", key: "story" },
                ].map(({ val, ph, key }) => (
                  <input key={key} value={val}
                    onChange={(e) => setDraft((p) => ({ ...p, [key]: e.target.value }))}
                    className="rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-amber-100 outline-none transition-all placeholder-amber-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
                    placeholder={ph} />
                ))}
                <input value={draft.question}
                  onChange={(e) => setDraft((p) => ({ ...p, question: e.target.value }))}
                  className="rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-amber-100 outline-none transition-all placeholder-amber-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 md:col-span-2"
                  placeholder="? Savol" />
                {draft.options.map((o, i) => (
                  <input key={i} value={o}
                    onChange={(e) => setDraft((p) => {
                      const next = [...p.options] as [string,string,string,string];
                      next[i] = e.target.value;
                      return { ...p, options: next };
                    })}
                    className="rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-amber-100 outline-none transition-all placeholder-amber-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
                    placeholder={`${i + 1}-variant`} />
                ))}
                <select value={draft.answerIndex}
                  onChange={(e) => setDraft((p) => ({ ...p, answerIndex: Number(e.target.value) }))}
                  className="rounded-xl border border-amber-600/30 bg-stone-900 px-4 py-3 text-amber-100 outline-none focus:border-amber-400">
                  {[0,1,2,3].map(i => <option key={i} value={i} className="bg-stone-900">? To'g'ri javob: {i+1}</option>)}
                </select>
                <input value={draft.reward}
                  onChange={(e) => setDraft((p) => ({ ...p, reward: e.target.value }))}
                  className="rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-amber-100 outline-none placeholder-amber-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
                  placeholder="💰 Ball (masalan: 120)" />
                <input value={draft.hint}
                  onChange={(e) => setDraft((p) => ({ ...p, hint: e.target.value }))}
                  className="rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-amber-100 outline-none transition-all placeholder-amber-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 md:col-span-2"
                  placeholder="💡 Maslahat (hint)" />
              </div>
              {questionError && <p className="mt-2 text-sm text-rose-400">{questionError}</p>}
              <div className="mt-4 flex gap-3">
                <button onClick={saveRiddle}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-bold text-amber-950 shadow-lg transition-all hover:shadow-amber-500/40 hover:scale-[1.02]">
                  {editingIdx !== null ? <FaEdit /> : <FaPlus />}
                  {editingIdx !== null ? "Saqlash" : "Qo'shish"}
                </button>
                {editingIdx !== null && (
                  <button onClick={resetDraft}
                    className="rounded-xl border border-amber-500/40 px-6 py-3 font-bold text-amber-300 transition-all hover:bg-amber-500/10">
                    Bekor
                  </button>
                )}
              </div>
              <div className="mt-5 space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-widest text-amber-500">Savollar</h4>
                {questionBank.map((r, idx) => (
                  <div key={`${r.id}-${idx}`}
                    className="group flex items-center justify-between rounded-xl border border-amber-700/20 bg-black/25 px-3 py-2 transition-all hover:border-amber-600/40">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-800/50 text-xs font-bold text-amber-300">{idx + 1}</span>
                      <p className="truncate text-sm text-amber-100/80">{r.question}</p>
                    </div>
                    <div className="flex gap-2 opacity-60 transition-opacity group-hover:opacity-100">
                      <button onClick={() => { setEditingIdx(idx); setDraft({ title: r.title, story: r.story, question: r.question, options: [...r.options], answerIndex: r.answerIndex, hint: r.hint, reward: String(r.reward) }); }}
                        className="rounded-lg bg-cyan-700/30 p-2 hover:bg-cyan-600/50"><FaEdit size={12}/></button>
                      <button onClick={() => setQuestionBank((prev) => prev.filter((_, i) => i !== idx))}
                        className="rounded-lg bg-rose-700/30 p-2 hover:bg-rose-600/50"><FaTrash size={12}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* -- PLAY PHASE -- */}
      {phase === "play" && current && (
        <div className="flex min-h-[72dvh] flex-col">
          {/* -- Top status bar -- */}
          <div className="sticky top-0 z-30 border-b border-amber-800/30 bg-slate-950/90 px-3 py-2 backdrop-blur-md shadow-lg sm:px-4">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 sm:gap-3">
              {/* Savol */}
              <div className="rounded-xl border border-amber-700/30 bg-black/50 px-3 py-1.5 text-center shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Savol</p>
                <p className="text-base font-black text-amber-300">{questionIndex+1}/{riddles.length}</p>
              </div>

              {/* Progress */}
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[10px] text-amber-700">
                  <span>Sayohat</span><span>{pathProgressPct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-500 shadow-sm shadow-amber-500/50"
                    style={{ width: `${pathProgressPct}%` }} />
                </div>
              </div>

              {/* Score */}
              <div className="rounded-xl border border-emerald-700/30 bg-black/50 px-3 py-1.5 text-center shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Ball</p>
                <p className="text-base font-black text-emerald-300">{score}</p>
              </div>

              <div className="rounded-xl border border-yellow-500/35 bg-yellow-950/35 px-3 py-1.5 text-center shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-500">Kalitlar</p>
                <p className="text-base font-black text-yellow-200">🔑 {keysFound}/{keysNeeded}</p>
              </div>

              <div className="hidden rounded-xl border border-orange-500/35 bg-orange-950/30 px-3 py-1.5 text-center sm:block shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Seriya</p>
                <p className="text-base font-black text-orange-200">🔥 {streak}</p>
              </div>

              {/* Total timer */}
              <div className={`rounded-xl border px-3 py-1.5 text-center shrink-0 ${secondsLeft < 60 ? "border-red-700/50 bg-red-950/40" : "border-amber-700/30 bg-black/50"}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Vaqt</p>
                <p className={`text-base font-black ${secondsLeft < 60 ? "text-red-400" : "text-amber-300"}`}>{formatTime(secondsLeft)}</p>
              </div>

              {/* Question timer ring */}
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#1e2a38" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15" fill="none" stroke={timerColor} strokeWidth="3"
                    strokeDasharray={`${2*Math.PI*15}`}
                    strokeDashoffset={`${2*Math.PI*15*(1-timerPct/100)}`}
                    strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.9s linear" }}/>
                </svg>
                <span className="relative text-xs font-black text-white">{questionSeconds}</span>
              </div>
            </div>
          </div>

          <div className="treasure-play-canvas relative flex-1 overflow-hidden">
            <div className="relative h-full">
              <div className="h-full">
                {/* -- TREASURE MAP -- */}
                <div className="relative h-full overflow-hidden border-y border-amber-700/40 bg-slate-950 shadow-2xl shadow-amber-900/30">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_30%)]" />
                  <div ref={mapScrollRef} className="treasure-map-scroll relative h-[calc(100dvh-76px)] w-full overflow-auto scroll-smooth">
                    <ExpeditionMap progress={pathProgressPct} keysFound={keysFound} totalKeys={keysNeeded} />

                    <div className="absolute left-4 top-4">
                      <div className="rounded-2xl border border-amber-600/50 bg-black/55 px-5 py-3 shadow-lg backdrop-blur-md sm:px-6 sm:py-4">
                        <p className="text-[11px] font-bold tracking-[0.28em] text-cyan-300/80">BUYUK EKSPEDITSIYA</p>
                        <p className="text-lg font-black tracking-[0.12em] text-amber-200 sm:text-2xl">🗺️ KAPITAN XARITASI</p>
                      </div>
                    </div>

                    <div className="absolute right-4 top-4 flex flex-wrap justify-end gap-2">
                      <div className="rounded-full border border-amber-500/40 bg-black/50 px-3 py-1.5 text-xs font-bold text-amber-200 backdrop-blur-md">
                        Sayohat: {pathProgressPct}%
                      </div>
                      <div className="rounded-full border border-emerald-500/40 bg-black/50 px-3 py-1.5 text-xs font-bold text-emerald-300 backdrop-blur-md">
                        Ball: {score}
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 flex max-w-xl flex-wrap items-end justify-between gap-3">
                      <div className="max-w-xl rounded-2xl border border-sky-400/20 bg-slate-950/55 px-4 py-3 backdrop-blur-md sm:px-5 sm:py-4">
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-300/80">Joriy missiya • {current.title}</p>
                        <p className="mt-1 text-sm text-slate-100/90 sm:text-base">
                          {keysFound >= keysNeeded
                            ? "Sandiq uchun yetarli kalit yig'ildi — endi xazina oroliga yetib boring!"
                            : `Sandiqni ochish uchun yana ${keysNeeded - keysFound} ta bilim kaliti kerak.`}
                        </p>
                      </div>

                      {doubleReward && (
                        <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 font-bold text-amber-950 shadow-lg text-sm">
                          <FaBolt /> BONUS x2
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setPhase("finish")}
                  className="treasure-end-button fixed bottom-5 left-5 z-40 rounded-2xl border border-red-800/50 bg-red-950/80 px-5 py-3 text-xs font-bold text-red-300 shadow-xl backdrop-blur-md transition-all hover:bg-red-900/90"
                >
                  <IoMdNuclear className="mr-2 inline text-base" />
                  Sarguzashtni yakunlash
                </button>
              </div>

              {/* -- Question card -- */}
              <div className={`treasure-question-overlay fixed right-5 top-[86px] z-40 max-h-[calc(100dvh-110px)] w-[min(520px,calc(100vw-40px))] overflow-y-auto rounded-[28px] border border-amber-500/40 bg-gradient-to-br from-amber-950/90 via-stone-950/95 to-black/95 p-4 shadow-2xl shadow-black/70 backdrop-blur-xl sm:p-5 ${questionPanelOpen ? "" : "is-collapsed"}`}>
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-amber-500/10 to-transparent" />
                <button
                  type="button"
                  onClick={() => setQuestionPanelOpen(false)}
                  className="treasure-question-close"
                  aria-label="Savol panelini yopish"
                >
                  × <span>Xaritani ko'rish</span>
                </button>

                <div className="treasure-question-intro relative mb-3 flex flex-col gap-2 border-b border-amber-700/20 pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-500/80">Joriy vazifa</p>
                    <p className="mt-1 text-lg font-black text-amber-200">Savolga javob bering va kemani oldinga suring</p>
                  </div>
                  <div className="rounded-2xl border border-amber-600/30 bg-amber-950/40 px-4 py-2 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Qolgan vaqt</p>
                    <p className="text-2xl font-black text-white">{questionSeconds}s</p>
                  </div>
                </div>

                <div className="relative mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="inline-flex rounded-full border border-amber-700/40 bg-amber-900/50 px-3 py-1 text-sm font-bold text-amber-300">
                      {current.title}
                    </span>
                    <p className="treasure-question-story mt-2 text-sm italic leading-relaxed text-amber-200/70">{current.story}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => { if (!locked && !showHint) { setShowHint(true); setScore((s) => Math.max(0, s - HINT_PENALTY)); } }}
                      disabled={locked || showHint}
                      className="flex items-center gap-1.5 rounded-full border border-amber-600/40 bg-amber-900/40 px-3 py-1.5 text-xs font-bold text-amber-300 transition-all hover:bg-amber-800/60 disabled:opacity-40"
                    >
                      <FaLightbulb className="text-yellow-400" /> Hint (-{HINT_PENALTY})
                    </button>
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                      <MdOutlineTimer />{questionSeconds}s
                    </div>
                  </div>
                </div>

                <h3 className="treasure-question-title relative mb-4 text-xl font-black leading-tight text-white sm:text-2xl">
                  {current.question}
                </h3>

                {showHint && (
                  <div className="mb-4 rounded-2xl border border-amber-600/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                    💡 {current.hint}
                  </div>
                )}

                <div className="treasure-options-grid grid gap-2.5">
                  {current.options.map((opt, i) => {
                    const isSelected = selected === i;
                    const isCorrect = i === current.answerIndex;
                    const showResult = locked;
                    return (
                      <button
                        key={i}
                        onClick={() => onAnswer(i)}
                        disabled={locked}
                        className={`treasure-option group relative min-h-[68px] overflow-hidden rounded-2xl border-2 p-3 text-left font-bold transition-all ${
                          showResult && isCorrect
                            ? "border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/20 scale-[1.02]"
                          : showResult && isSelected && !isCorrect
                              ? "border-rose-400 bg-rose-500/20 shadow-lg shadow-rose-500/20"
                              : "border-amber-700/40 bg-black/30 text-amber-100 hover:border-amber-500/60 hover:bg-amber-900/30 hover:scale-[1.02]"
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <div className="relative flex items-center justify-between gap-2">
                          <span className="flex items-center gap-3">
                            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black border ${
                              showResult && isCorrect
                                ? "bg-emerald-500 border-emerald-400 text-white"
                                : showResult && isSelected && !isCorrect
                                  ? "bg-rose-500 border-rose-400 text-white"
                                  : "border-amber-600/40 bg-amber-900/40 text-amber-300"
                            }`}>{String.fromCharCode(65 + i)}</span>
                            <span className="text-base">{opt}</span>
                          </span>
                          {showResult && isCorrect && <FaCheckCircle className="shrink-0 text-xl text-emerald-400" />}
                          {showResult && isSelected && !isCorrect && <FaTimesCircle className="shrink-0 text-xl text-rose-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {locked && answerMessage && (
                  <div className={`treasure-answer-in mt-4 rounded-2xl border px-4 py-3 ${answerResult === "correct" ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-100" : "border-rose-400/50 bg-rose-500/15 text-rose-100"}`}>
                    <p className="font-black">{answerResult === "correct" ? "🔑 Bilim kaliti topildi!" : "📖 Yodda saqlang"}</p>
                    <p className="mt-1 text-sm leading-relaxed opacity-90">{answerMessage}</p>
                  </div>
                )}
              </div>
              {!questionPanelOpen && (
                <button
                  type="button"
                  onClick={() => setQuestionPanelOpen(true)}
                  className="treasure-question-open fixed right-5 top-[98px] z-40"
                >
                  <span>❓</span>
                  Savolni ochish
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -- Answer flash overlay -- */}
      {showAnswerEffect && answerResult && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className={`flex h-32 w-32 items-center justify-center rounded-full border-4 text-5xl font-black shadow-2xl ${
            answerResult === "correct"
              ? "border-emerald-400 bg-emerald-500/30 text-emerald-300 shadow-emerald-500/50"
              : "border-rose-400 bg-rose-500/30 text-rose-300 shadow-rose-500/50"
          }`}>
            {answerResult === "correct" ? "✓" : "✕"}
          </div>
        </div>
      )}

      {/* -- FINISH PHASE -- */}
      {phase === "finish" && (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-600/30 bg-gradient-to-br from-amber-950/70 to-stone-900/70 p-8 text-center shadow-2xl backdrop-blur-sm">
            {won && <Confetti mode="boom" particleCount={120} effectCount={2} x={0.5} y={0.35} colors={["#fbbf24","#f59e0b","#10b981","#3b82f6"]} />}
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-yellow-600/10 blur-3xl" />

            <div className="mb-5 text-8xl drop-shadow-2xl">
              {won ? "🏆" : "🧭"}
            </div>

            {/* Mini map preview on finish */}
            <div className="mb-5 mx-auto h-32 w-full max-w-sm overflow-hidden rounded-2xl border border-amber-700/40 shadow-xl">
              <ExpeditionMap progress={100} keysFound={keysFound} totalKeys={keysNeeded} compact />
            </div>

            <h2 className="mb-4 text-3xl font-black tracking-wide text-amber-300">
              {won ? "🏆 XAZINA TOPILDI!" : "🧭 EKSPEDITSIYA YAKUNLANDI"}
            </h2>

            <div className="mb-6 space-y-3">
              <p className="text-2xl font-bold">
                Ball: <span className="text-amber-400">{score}</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-yellow-500/25 bg-yellow-950/30 p-3">
                  <p className="text-xs uppercase tracking-widest text-yellow-500">Kalitlar</p>
                  <p className="mt-1 text-xl font-black text-yellow-200">🔑 {keysFound}/{keysNeeded}</p>
                </div>
                <div className="rounded-2xl border border-orange-500/25 bg-orange-950/30 p-3">
                  <p className="text-xs uppercase tracking-widest text-orange-400">Eng yaxshi seriya</p>
                  <p className="mt-1 text-xl font-black text-orange-200">🔥 {bestStreak}</p>
                </div>
              </div>
              {!won && <p className="text-sm leading-relaxed text-amber-100/70">Xazinani ochish uchun {keysNeeded - keysFound} ta kalit yetmadi. Yana urinib, yangi bilimlarni mustahkamlang!</p>}
              <div className={`inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r ${grade.color} px-5 py-3 shadow-xl`}>
                <grade.icon className="text-3xl text-white" />
                <span className="text-xl font-black text-white">{grade.name}</span>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button onClick={handleStart}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-3.5 font-black text-amber-950 shadow-xl transition-all hover:scale-[1.03] hover:shadow-amber-500/40">
                <FaRedo /> Yana o'ynash
              </button>
              <button onClick={() => navigate("/games")}
                className="flex items-center justify-center gap-2 rounded-2xl border border-amber-600/40 bg-black/30 px-8 py-3.5 font-bold text-amber-300 backdrop-blur-sm transition-all hover:bg-amber-900/30">
                <FaMapMarkedAlt /> O'yinlar
              </button>
            </div>
          </div>
        </div>
      )}

      <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />
    </div>
  );
}
