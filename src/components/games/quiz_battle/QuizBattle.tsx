import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaBolt,
  FaCheckCircle,
  FaChevronDown,
  FaCrown,
  FaEdit,
  FaPlay,
  FaPlus,
  FaRedo,
  FaRocket,
  FaTimesCircle,
  FaTrash,
  FaUsers,
} from "react-icons/fa";
import { MdQuiz} from "react-icons/md";
import Confetti from "react-confetti-boom";
import { fetchGameQuestions, saveGameQuestions } from "../../../apiClient/gameQuestions";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../shared/useGameStartCountdown";

type TeamId = 0 | 1;

type Question = {
  question: string;
  options: string[];
  answerIndex: number;
  category: string;
};

type Phase = "question-setup" | "team-setup" | "play" | "finish";

type QuestionDraft = {
  question: string;
  options: [string, string, string, string];
  answerIndex: number;
  category: string;
};

const SECONDS_PER_QUESTION = 18;
const BASE_POINTS = 10;
const STREAK_BONUS = 5;
const QUIZ_BATTLE_GAME_KEY = "quiz_battle";

const createEmptyDraft = (): QuestionDraft => ({
  question: "",
  options: ["", "", "", ""],
  answerIndex: 0,
  category: "Umumiy",
});

function QuizBattle() {
  const finishViewRef = useRef<HTMLDivElement | null>(null);
  const skipInitialRemoteSaveRef = useRef(true);
  const [phase, setPhase] = useState<Phase>("question-setup");
  const [teamNames, setTeamNames] = useState<[string, string]>(["⚔️ YULDUZLAR", "🛡️ CHAQQONLAR"]);
  const [nameError, setNameError] = useState("");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [draft, setDraft] = useState<QuestionDraft>(createEmptyDraft());
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [questionError, setQuestionError] = useState("");
  const [remoteLoaded, setRemoteLoaded] = useState(false);

  const [current, setCurrent] = useState(0);
  const [turn, setTurn] = useState<TeamId>(0);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [locked, setLocked] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [doublePoints, setDoublePoints] = useState(false);
  const [streak, setStreak] = useState<[number, number]>([0, 0]);
  const [toast, setToast] = useState<string | null>(null);
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();

  const question = questions[current];
  const progressPct = questions.length > 0 ? Math.round(((current + 1) / questions.length) * 100) : 0;
  const timePct = Math.max(0, Math.round((timeLeft / SECONDS_PER_QUESTION) * 100));
  // const maxScore = Math.max(1, questions.length * BASE_POINTS * 2);

  const winner = useMemo(() => {
    if (scores[0] === scores[1]) return null;
    return scores[0] > scores[1] ? 0 : 1;
  }, [scores]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (phase !== "play" || locked) return;
    if (timeLeft <= 0) {
      setToast("⏰ Vaqt tugadi!");
      goNext();
      return;
    }
    const t = window.setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, locked, timeLeft]);

  useEffect(() => {
    if (phase !== "play") return;
    setTimeLeft(SECONDS_PER_QUESTION);
    setLocked(false);
    setSelected(null);
    setDoublePoints(Math.random() < 0.25);
  }, [current, phase]);

  useEffect(() => {
    if (phase !== "finish") return;
    finishViewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const remoteQuestions = await fetchGameQuestions<Question>(QUIZ_BATTLE_GAME_KEY);
      if (!alive) return;
      if (remoteQuestions && remoteQuestions.length > 0) {
        setQuestions(remoteQuestions);
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
      void saveGameQuestions<Question>(QUIZ_BATTLE_GAME_KEY, questions);
    }, 500);
    return () => window.clearTimeout(t);
  }, [questions, remoteLoaded]);

  const resetQuestionDraft = () => {
    setDraft(createEmptyDraft());
    setEditingQuestionIndex(null);
    setQuestionError("");
  };

  const beginEditQuestion = (idx: number) => {
    const item = questions[idx];
    if (!item) return;
    setEditingQuestionIndex(idx);
    setDraft({
      question: item.question,
      options: [item.options[0] ?? "", item.options[1] ?? "", item.options[2] ?? "", item.options[3] ?? ""],
      answerIndex: item.answerIndex,
      category: item.category,
    });
    setQuestionError("");
  };

  const addQuestion = () => {
    const questionText = draft.question.trim();
    const categoryText = draft.category.trim();
    const cleanedOptions = draft.options.map((item) => item.trim()) as [string, string, string, string];

    if (!questionText) {
      setQuestionError("Savol matnini kiriting.");
      return;
    }
    if (!categoryText) {
      setQuestionError("Kategoriyani kiriting.");
      return;
    }
    if (cleanedOptions.some((item) => !item)) {
      setQuestionError("4 ta variantning barchasini to'ldiring.");
      return;
    }

    if (editingQuestionIndex !== null) {
      setQuestions((prev) =>
        prev.map((item, idx) =>
          idx === editingQuestionIndex
            ? {
                ...item,
                question: questionText,
                options: cleanedOptions,
                answerIndex: draft.answerIndex,
                category: categoryText,
              }
            : item,
        ),
      );
      setQuestionError("");
      resetQuestionDraft();
      setToast("Savol yangilandi!");
      return;
    }

    setQuestions((prev) => [
      ...prev,
      {
        question: questionText,
        options: cleanedOptions,
        answerIndex: draft.answerIndex,
        category: categoryText,
      },
    ]);
    setQuestionError("");
    resetQuestionDraft();
    setToast("✅ Savol qo'shildi!");
  };

  const removeQuestion = (idx: number) => {
    setEditingQuestionIndex((prev) => {
      if (prev === null) return prev;
      if (prev === idx) {
        setDraft(createEmptyDraft());
        return null;
      }
      return prev > idx ? prev - 1 : prev;
    });
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
    setToast("🗑️ Savol o'chirildi");
  };

  const goToTeamSetup = () => {
    if (questions.length < 2) {
      setQuestionError("Kamida 2 ta savol qo'shing.");
      return;
    }
    setQuestionError("");
    setPhase("team-setup");
  };

  const startGame = () => {
    if (questions.length < 2) {
      setPhase("question-setup");
      setQuestionError("Kamida 2 ta savol qo'shing.");
      return;
    }

    const a = teamNames[0].trim();
    const b = teamNames[1].trim();
    if (!a || !b) {
      setNameError("Ikkala guruh nomini ham kiriting.");
      return;
    }
    if (a.toLowerCase() === b.toLowerCase()) {
      setNameError("Guruh nomlari bir xil bo'lmasligi kerak.");
      return;
    }

    setTeamNames([a, b]);
    setNameError("");
    setCurrent(0);
    setTurn(0);
    setScores([0, 0]);
    setStreak([0, 0]);
    setTimeLeft(SECONDS_PER_QUESTION);
    setLocked(false);
    setSelected(null);
    setPhase("play");
    setToast("🎮 O'yin boshlandi!");
  };

  const handleStartGame = () => runStartCountdown(startGame);

  const goNext = () => {
    if (current + 1 >= questions.length) {
      setPhase("finish");
      setLocked(true);
      return;
    }
    setTurn((v) => (v === 0 ? 1 : 0));
    setCurrent((v) => v + 1);
  };

  const onAnswer = (idx: number) => {
    if (phase !== "play" || locked || !question) return;
    setLocked(true);
    setSelected(idx);

    const correct = idx === question.answerIndex;
    if (correct) {
      const streakBonus = streak[turn] * STREAK_BONUS;
      const gain = (BASE_POINTS + streakBonus) * (doublePoints ? 2 : 1);
      setScores((prev) => {
        const n: [number, number] = [...prev] as [number, number];
        n[turn] += gain;
        return n;
      });
      setStreak((prev) => {
        const n: [number, number] = [...prev] as [number, number];
        n[turn] += 1;
        return n;
      });
      setToast(`✅ To'g'ri! +${gain} ball ${doublePoints ? 'x2 BONUS!' : ''}`);
    } else {
      setStreak((prev) => {
        const n: [number, number] = [...prev] as [number, number];
        n[turn] = 0;
        return n;
      });
      setToast(`❌ Xato! Javob: ${question.options[question.answerIndex]}`);
    }

    window.setTimeout(goNext, 1200);
  };

  const resetRound = () => {
    setCurrent(0);
    setTurn(0);
    setScores([0, 0]);
    setStreak([0, 0]);
    setTimeLeft(SECONDS_PER_QUESTION);
    setLocked(false);
    setSelected(null);
    setDoublePoints(false);
    setPhase("team-setup");
    setToast("🔄 Yangi o'yin boshlandi!");
  };

  const resetEverything = () => {
    setQuestions([]);
    resetQuestionDraft();
    setQuestionError("");
    setNameError("");
    setCurrent(0);
    setTurn(0);
    setScores([0, 0]);
    setStreak([0, 0]);
    setTimeLeft(SECONDS_PER_QUESTION);
    setLocked(false);
    setSelected(null);
    setDoublePoints(false);
    setPhase("question-setup");
    setToast("🏠 Bosh sahifaga qaytdingiz");
  };

  const fieldClass = "w-full rounded-xl border border-yellow-500/30 bg-yellow-950/30 px-4 py-3 text-white placeholder-yellow-200/50 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20";
  const selectClass = `${fieldClass} appearance-none`;

  return (
    <div className="relative text-white">
      {/* Toast Notification */}
      <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50">
        {toast && (
          <div className="rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-3 text-white font-bold shadow-2xl animate-bounce backdrop-blur-sm">
            {toast}
          </div>
        )}
      </div>

      {/* Question Setup Phase */}
      {phase === "question-setup" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500">
              <MdQuiz className="text-xl text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">SAVOLLARNI KIRITING</h3>
              <p className="text-sm text-yellow-200/80">Kamida 2 ta savol qo'shing</p>
            </div>
          </div>

          {/* Question Form */}
          <div className="relative transform-gpu overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 p-6 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10" />
            
            <div className="relative space-y-4">
              {/* Question Input */}
              <div>
                <label className="mb-2 block text-xs font-bold text-yellow-400">SAVOL</label>
                <input
                  value={draft.question}
                  onChange={(e) => setDraft((prev) => ({ ...prev, question: e.target.value }))}
                  className={fieldClass}
                  placeholder="Savol matnini kiriting..."
                />
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-3">
                {draft.options.map((item, idx) => (
                  <div key={idx}>
                    <label className="mb-2 block text-xs font-bold text-yellow-400">VARIANT {idx + 1}</label>
                    <input
                      value={item}
                      onChange={(e) =>
                        setDraft((prev) => {
                          const next = [...prev.options] as [string, string, string, string];
                          next[idx] = e.target.value;
                          return { ...prev, options: next };
                        })
                      }
                      className={fieldClass}
                      placeholder={`Variant ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>

              {/* Category and Answer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-xs font-bold text-yellow-400">KATEGORIYA</label>
                  <input
                    value={draft.category}
                    onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
                    className={fieldClass}
                    placeholder="Masalan: Matematika"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold text-yellow-400">TO'G'RI JAVOB</label>
                  <div className="relative">
                    <select
                      value={draft.answerIndex}
                      onChange={(e) => setDraft((prev) => ({ ...prev, answerIndex: Number(e.target.value) }))}
                      className={selectClass}
                    >
                      <option value={0} className="bg-yellow-900">Variant 1</option>
                      <option value={1} className="bg-yellow-900">Variant 2</option>
                      <option value={2} className="bg-yellow-900">Variant 3</option>
                      <option value={3} className="bg-yellow-900">Variant 4</option>
                    </select>
                    <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Add Question Button */}
              <button
                onClick={addQuestion}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 p-3 font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                <span className="relative flex items-center justify-center gap-2">
                  {editingQuestionIndex !== null ? <FaEdit /> : <FaPlus />}
                  {editingQuestionIndex !== null ? "SAVOLNI SAQLASH" : "SAVOL QO'SHISH"}
                </span>
              </button>
              {editingQuestionIndex !== null && (
                <button
                  onClick={resetQuestionDraft}
                  className="w-full rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 font-bold text-yellow-200 transition-all hover:bg-yellow-500/20"
                >
                  BEKOR QILISH
                </button>
              )}

              {/* Error Message */}
              {questionError && (
                <div className="rounded-xl bg-rose-500/20 p-3 text-rose-300 border border-rose-500/30">
                  ⚠️ {questionError}
                </div>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-2 text-xs text-yellow-200/60">
                <span className="rounded-full bg-yellow-500/20 px-3 py-1">Savollar: {questions.length}</span>
                <span className="rounded-full bg-yellow-500/20 px-3 py-1">Har to'g'ri javob: +{BASE_POINTS}</span>
                <span className="rounded-full bg-yellow-500/20 px-3 py-1">Bonus raund: x2 ball</span>
              </div>
            </div>
          </div>

          {/* Questions List */}
          {questions.length > 0 && (
            <div className="space-y-3">
              {questions.map((item, idx) => (
                <div
                  key={`${item.question}-${idx}`}
                  className="relative transform-gpu overflow-hidden rounded-xl border border-yellow-500/20 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 p-4 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
                          {item.category}
                        </span>
                        <span className="text-xs text-yellow-200/60">#{idx + 1}</span>
                      </div>
                      <p className="text-sm font-bold text-white">{item.question}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.options.map((opt, optIdx) => (
                          <span
                            key={optIdx}
                            className={`text-xs px-2 py-1 rounded-full ${
                              optIdx === item.answerIndex
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-yellow-500/10 text-yellow-200/60'
                            }`}
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => beginEditQuestion(idx)}
                        className="rounded-lg bg-cyan-500/20 p-2 text-cyan-300 hover:bg-cyan-500/30 transition-all"
                        title="Tahrirlash"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => removeQuestion(idx)}
                        className="rounded-lg bg-rose-500/20 p-2 text-rose-400 hover:bg-rose-500/30 transition-all"
                        title="O'chirish"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-center gap-4">
            <button
              onClick={goToTeamSetup}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-3 font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
              <span className="relative flex items-center gap-3">
                <FaUsers />
                GURUHLARGA O'TISH
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Team Setup Phase */}
      {phase === "team-setup" && (
        <div className="relative transform-gpu overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 p-8 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10" />
          
          <h3 className="relative mb-6 text-center text-2xl font-black text-white">GURUH NOMLARINI KIRITING</h3>
          
          <div className="relative grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-yellow-400">
                ⚔️ 1-GURUH
              </label>
              <input
                value={teamNames[0]}
                onChange={(e) => setTeamNames([e.target.value, teamNames[1]])}
                className={fieldClass}
                placeholder="YULDUZLAR"
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-orange-400">
                🛡️ 2-GURUH
              </label>
              <input
                value={teamNames[1]}
                onChange={(e) => setTeamNames([teamNames[0], e.target.value])}
                className={fieldClass}
                placeholder="CHAQQONLAR"
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
              onClick={() => setPhase("question-setup")}
              className="group relative overflow-hidden rounded-xl bg-yellow-500/20 px-6 py-3 font-bold text-white border border-yellow-500/30 transition-all hover:bg-yellow-500/30"
            >
              <span className="relative flex items-center gap-2">
                <FaRedo />
                ORQAGA
              </span>
            </button>
            
            <button
              onClick={handleStartGame}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-3 font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
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

      {/* Play Phase */}
      {phase === "play" && question && (
        <div className="space-y-6">
          {/* Teams Score */}
          <div className="grid gap-4 md:grid-cols-2">
            {[0, 1].map((i) => {
              const active = turn === i;
              return (
                <div
                  key={i}
                  className={`relative transform-gpu overflow-hidden rounded-xl border-2 p-6 backdrop-blur-xl transition-all ${
                    active
                      ? i === 0
                        ? 'border-yellow-400/50 bg-yellow-900/40 scale-105'
                        : 'border-orange-400/50 bg-orange-900/40 scale-105'
                      : 'border-yellow-500/20 bg-yellow-950/30'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${i === 0 ? 'from-yellow-500/10' : 'from-orange-500/10'} to-transparent`} />
                  
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className={`text-xs font-bold ${i === 0 ? 'text-yellow-400' : 'text-orange-400'}`}>
                        {i === 0 ? '⚔️ 1-GURUH' : '🛡️ 2-GURUH'}
                      </p>
                      <p className="text-lg font-black text-white">{teamNames[i as TeamId]}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-black ${i === 0 ? 'text-yellow-400' : 'text-orange-400'}`}>
                        {scores[i as TeamId]}
                      </p>
                      <p className="text-xs text-yellow-200/60">Streak: {streak[i as TeamId]}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Bars */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative rounded-xl border border-yellow-500/20 bg-yellow-950/30 p-4">
              <p className="text-xs font-bold text-yellow-400">SAVOL PROGRESS</p>
              <p className="text-sm text-white mb-2">{current + 1}/{questions.length}</p>
              <div className="h-2 rounded-full bg-yellow-500/20">
                <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-400" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            <div className="relative rounded-xl border border-yellow-500/20 bg-yellow-950/30 p-4">
              <p className="text-xs font-bold text-yellow-400">VAQT</p>
              <p className="text-sm text-white mb-2">{timeLeft}s</p>
              <div className="h-2 rounded-full bg-yellow-500/20">
                <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-400" style={{ width: `${timePct}%` }} />
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="relative transform-gpu overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 p-6 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10" />

            {/* Category and Bonus */}
            <div className="relative flex items-center justify-between mb-4">
              <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold text-yellow-400 border border-yellow-500/30">
                {question.category}
              </span>
              {doublePoints ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1 text-xs font-black text-white animate-pulse">
                  <FaRocket />
                  BONUS x2
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold text-yellow-300">
                  <FaBolt />
                  ODDIY RAUND
                </span>
              )}
            </div>

            {/* Question */}
            <h3 className="relative mb-2 text-xl font-black text-white">{question.question}</h3>
            <p className="relative mb-4 text-sm text-yellow-200/80">
              Navbat: <span className="font-bold text-yellow-400">{teamNames[turn]}</span>
            </p>

            {/* Options */}
            <div className="grid gap-3 sm:grid-cols-2">
              {question.options.map((option, idx) => {
                const isSelected = selected === idx;
                const isCorrect = idx === question.answerIndex;
                const reveal = locked && selected !== null;

                let stateClass = 'border-yellow-500/30 bg-yellow-950/30 hover:bg-yellow-900/40';
                if (reveal && isCorrect) {
                  stateClass = 'border-emerald-500/50 bg-emerald-500/20';
                } else if (reveal && isSelected && !isCorrect) {
                  stateClass = 'border-rose-500/50 bg-rose-500/20';
                } else if (isSelected) {
                  stateClass = 'border-yellow-400 bg-yellow-500/30';
                }

                return (
                  <button
                    key={`${option}-${idx}`}
                    onClick={() => onAnswer(idx)}
                    disabled={locked}
                    className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 ${stateClass}`}
                  >
                    <span className="relative flex items-center justify-between">
                      <span>{option}</span>
                      {reveal && isCorrect && (
                        <FaCheckCircle className="text-emerald-400 text-xl" />
                      )}
                      {reveal && isSelected && !isCorrect && (
                        <FaTimesCircle className="text-rose-400 text-xl" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Finish Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setPhase("finish")}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-3 font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
              <span className="relative flex items-center gap-3">
                <FaCrown />
                YAKUNLASH
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Finish Phase */}
      {phase === "finish" && (
        <div ref={finishViewRef} className="relative transform-gpu overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-900/30 via-orange-900/30 to-red-900/30 p-8 backdrop-blur-xl text-center">
          <Confetti
            mode="boom"
            particleCount={100}
            effectCount={1}
            x={0.5}
            y={0.35}
            colors={["#f59e0b", "#f97316", "#ef4444", "#fbbf24", "#fde68a"]}
          />
          
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10" />
          
          <div className="relative mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-yellow-400/30" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">
                <FaCrown className="text-4xl text-white" />
              </div>
            </div>
          </div>
          
          <h2 className="relative mb-4 text-4xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            {winner === null ? "DURRANG!" : `${teamNames[winner]} G'OLIB!`}
          </h2>
          
          <div className="relative mx-auto mb-8 max-w-md rounded-xl border border-yellow-500/30 bg-yellow-950/30 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-yellow-400 font-bold">⚔️ 1-GURUH</p>
                <p className="text-2xl font-black text-white">{teamNames[0]}</p>
                <p className="text-3xl font-black text-yellow-400 mt-2">{scores[0]}</p>
              </div>
              <div className="text-center">
                <p className="text-orange-400 font-bold">🛡️ 2-GURUH</p>
                <p className="text-2xl font-black text-white">{teamNames[1]}</p>
                <p className="text-3xl font-black text-orange-400 mt-2">{scores[1]}</p>
              </div>
            </div>
          </div>
          
          <div className="relative flex justify-center gap-4">
            <button
              onClick={resetRound}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
              <span className="relative flex items-center gap-2">
                <FaRedo />
                YANA O'YNA
              </span>
            </button>
            
            <button
              onClick={resetEverything}
              className="group relative overflow-hidden rounded-xl bg-yellow-500/20 px-6 py-3 font-bold text-white border border-yellow-500/30 transition-all hover:bg-yellow-500/30"
            >
              <span className="relative flex items-center gap-2">
                <FaTrash />
                BOSH SAHIFA
              </span>
            </button>
          </div>
        </div>
      )}
      <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />
    </div>
  );
}

export default QuizBattle;
