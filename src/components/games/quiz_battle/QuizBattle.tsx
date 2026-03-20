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
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { getGameSessionConfig } from "../../../hooks/gameSession";
import { useGameResultSubmission } from "../../../hooks/useGameResultSubmission";
import { useGameStartCountdown } from "../../../hooks/useGameStartCountdown";
import { useFinishApplause } from "../../../hooks/useFinishApplause";
import useContextPro from "../../../hooks/useContextPro";
import useGameQuestions from "../../../hooks/useGameQuestions";

import { BASE_POINTS, createEmptyDraft, QUIZ_BATTLE_GAME_KEY, QUIZ_BATTLE_RESULT_KEY, SECONDS_PER_QUESTION, STREAK_BONUS } from "./constants";
import type { Phase, Question, QuestionDraft, TeamId } from "./types";

function getDefaultTeamNames(isSinglePlayer: boolean, singlePlayerName: string): [string, string] {
  return [isSinglePlayer ? singlePlayerName : "YULDUZLAR", "CHAQQONLAR"];
}

function QuizBattle() {
  const session = getGameSessionConfig("quiz-battle");
  const {
    state: { user },
  } = useContextPro();
  const { loadQuestions } = useGameQuestions<Question>({ teacherId: user?.id });
  const isSinglePlayer = session?.participantCount === 1;
  const singlePlayerName =
    session?.participantLabels[0]?.trim() &&
    !/^O'YINCHI\s+\d+$/i.test(session.participantLabels[0])
      ? session.participantLabels[0]
      : user?.username?.trim() || "O'YINCHI 1";
  const finishViewRef = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<Phase>("question-setup");
  useFinishApplause(phase === "finish");
  const [teamNames, setTeamNames] = useState<[string, string]>([
    isSinglePlayer ? singlePlayerName : "⚔️ YULDUZLAR",
    "🛡️ CHAQQONLAR",
  ]);
  const [nameError, setNameError] = useState("");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [draft, setDraft] = useState<QuestionDraft>(createEmptyDraft());
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [questionError, setQuestionError] = useState("");

  const [current, setCurrent] = useState(0);
  const [answeringTeam, setAnsweringTeam] = useState<TeamId | null>(null);
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
  
  const winner = useMemo(() => {
    if (isSinglePlayer) return 0;
    if (scores[0] === scores[1]) return null;
    return scores[0] > scores[1] ? 0 : 1;
  }, [isSinglePlayer, scores]);
  useGameResultSubmission(
    phase === "finish",
    QUIZ_BATTLE_RESULT_KEY,
    isSinglePlayer
      ? [
          {
            participant_name: teamNames[0],
            participant_mode: "1 o'yinchi",
            score: scores[0],
            metadata: { questions: questions.length },
          },
        ]
      : [
          {
            participant_name: teamNames[0],
            participant_mode: "2 jamoa",
            score: scores[0],
            metadata: { questions: questions.length, winner: winner === 0 },
          },
          {
            participant_name: teamNames[1],
            participant_mode: "2 jamoa",
            score: scores[1],
            metadata: { questions: questions.length, winner: winner === 1 },
          },
        ]
  );

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
    setAnsweringTeam(null);
    setDoublePoints(Math.random() < 0.25);
  }, [current, phase]);

  useEffect(() => {
    if (phase !== "finish") return;
    finishViewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase]);

  useEffect(() => {
    if (phase === "play" || phase === "finish") return;
    setTeamNames((prev) => {
      const defaults = getDefaultTeamNames(isSinglePlayer, singlePlayerName);
      const firstName = prev[0].trim() ? prev[0] : defaults[0];
      const secondName = isSinglePlayer ? defaults[1] : prev[1].trim() ? prev[1] : defaults[1];
      return [firstName, secondName];
    });
  }, [isSinglePlayer, phase, singlePlayerName]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const remoteQuestions = await loadQuestions(QUIZ_BATTLE_GAME_KEY, {
        teacherScoped: Boolean(
          user?.id && user.roles?.some((role : string) => role === "teacher" || role === "admin"),
        ),
      });
      if (!alive) return;
      if (remoteQuestions && remoteQuestions.length > 0) {
        setQuestions(remoteQuestions);
      }
    })();
    return () => {
      alive = false;
    };
  }, [loadQuestions, user?.id, user?.roles]);

  useEffect(() => {
    if (phase !== "play") return;
    if (questions.length < 2) {
      setPhase("question-setup");
      setQuestionError("Savollar topilmadi. Kamida 2 ta savol bo'lishi kerak.");
      return;
    }
    if (!questions[current]) {
      setCurrent(0);
    }
  }, [current, phase, questions]);

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
    if (!a || (!isSinglePlayer && !b)) {
      setNameError(isSinglePlayer ? "O'yinchi nomini kiriting." : "Ikkala guruh nomini ham kiriting.");
      return;
    }
    if (!isSinglePlayer && a.toLowerCase() === b.toLowerCase()) {
      setNameError("Guruh nomlari bir xil bo'lmasligi kerak.");
      return;
    }

    setTeamNames([a, isSinglePlayer ? teamNames[1] : b]);
    setNameError("");
    setCurrent(0);
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
    setCurrent((v) => v + 1);
  };

  const onAnswer = (idx: number, teamId?: TeamId) => {
    if (phase !== "play" || locked || !question) return;
    const responder: TeamId = isSinglePlayer ? 0 : (teamId ?? 0);
    setLocked(true);
    setSelected(idx);
    setAnsweringTeam(responder);
    const correct = idx === question.answerIndex;
    if (correct) {
      const streakBonus = streak[responder] * STREAK_BONUS;
      const gain = (BASE_POINTS + streakBonus) * (doublePoints ? 2 : 1);
      setScores((prev) => {
        const n: [number, number] = [...prev] as [number, number];
        n[responder] += gain;
        return n;
      });
      setStreak((prev) => {
        const n: [number, number] = [...prev] as [number, number];
        n[responder] += 1;
        return n;
      });
      setToast(`✅ To'g'ri! +${gain} ball ${doublePoints ? 'x2 BONUS!' : ''}`);
    } else {
      setStreak((prev) => {
        const n: [number, number] = [...prev] as [number, number];
        n[responder] = 0;
        return n;
      });
      setToast(`❌ Xato! Javob: ${question.options[question.answerIndex]}`);
    }

    window.setTimeout(goNext, 1200);
  };

  const resetRound = () => {
    setCurrent(0);
    setScores([0, 0]);
    setStreak([0, 0]);
    setTimeLeft(SECONDS_PER_QUESTION);
    setLocked(false);
    setSelected(null);
    setAnsweringTeam(null);
    setDoublePoints(false);
    setPhase("team-setup");
    setToast("🔄 Yangi o'yin boshlandi!");
  };

  const resetEverything = () => {
    resetQuestionDraft();
    setQuestionError("");
    setNameError("");
    setCurrent(0);
    setScores([0, 0]);
    setStreak([0, 0]);
    setTimeLeft(SECONDS_PER_QUESTION);
    setLocked(false);
    setSelected(null);
    setAnsweringTeam(null);
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
                {isSinglePlayer ? "O'YINCHIGA O'TISH" : "GURUHLARGA O'TISH"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Team Setup Phase */}
      {phase === "team-setup" && (
        <div className="relative transform-gpu overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 p-8 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10" />
          
          <h3 className="relative mb-6 text-center text-2xl font-black text-white">
            {isSinglePlayer ? "O'YINCHI NOMINI KIRITING" : "GURUH NOMLARINI KIRITING"}
          </h3>
          
          <div className={`relative grid gap-6 ${isSinglePlayer ? "md:grid-cols-1" : "md:grid-cols-2"}`}>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-yellow-400">
                {isSinglePlayer ? "🎮 O'YINCHI" : "⚔️ 1-GURUH"}
              </label>
              <input
                value={teamNames[0]}
                onChange={(e) => setTeamNames([e.target.value, teamNames[1]])}
                className={fieldClass}
                placeholder={isSinglePlayer ? "O'YINCHI 1" : "YULDUZLAR"}
              />
            </div>
            
            {!isSinglePlayer && (
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
            )}
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
          <div className={`grid gap-4 ${isSinglePlayer ? "md:grid-cols-1" : "md:grid-cols-2"}`}>
            {(isSinglePlayer ? [0] : [0, 1]).map((i) => {
              const active = isSinglePlayer ? true : answeringTeam === i;
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
                        {isSinglePlayer ? "🎮 O'YINCHI" : i === 0 ? '⚔️ 1-GURUH' : '🛡️ 2-GURUH'}
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
              {isSinglePlayer ? (
                <>O'yinchi: <span className="font-bold text-yellow-400">{teamNames[0]}</span></>
              ) : answeringTeam !== null ? (
                <>Birinchi bosgan: <span className="font-bold text-yellow-400">{teamNames[answeringTeam]}</span></>
              ) : (
                <>Tezroq bosing: <span className="font-bold text-yellow-400">kim birinchi javob tanlasa, ball o'shanga yoziladi</span></>
              )}
            </p>

            {/* Options */}
            {isSinglePlayer ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {question.options.map((option, idx) => {
                  const isSelected = selected === idx;
                  const isCorrect = idx === question.answerIndex;
                  const reveal = locked && selected !== null;

                  let stateClass = "border-yellow-500/30 bg-yellow-950/30 hover:bg-yellow-900/40";
                  if (reveal && isCorrect) {
                    stateClass = "border-emerald-500/50 bg-emerald-500/20";
                  } else if (reveal && isSelected && !isCorrect) {
                    stateClass = "border-rose-500/50 bg-rose-500/20";
                  } else if (isSelected) {
                    stateClass = "border-yellow-400 bg-yellow-500/30";
                  }

                  return (
                    <button
                      key={`${option}-${idx}`}
                      onClick={() => onAnswer(idx, 0)}
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
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {[0, 1].map((teamId) => {
                  const isResponder = answeringTeam === teamId;
                  const panelTone =
                    teamId === 0
                      ? "border-yellow-500/30 from-yellow-900/25 to-orange-900/15"
                      : "border-orange-500/30 from-orange-900/25 to-red-900/15";

                  return (
                    <div
                      key={teamId}
                      className={`rounded-2xl border bg-gradient-to-br p-4 ${panelTone} ${
                        isResponder ? "ring-2 ring-yellow-300/40" : ""
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className={`text-xs font-black uppercase tracking-[0.22em] ${teamId === 0 ? "text-yellow-400" : "text-orange-400"}`}>
                            {teamId === 0 ? "1-guruh javob kartasi" : "2-guruh javob kartasi"}
                          </p>
                          <p className="mt-1 text-lg font-black text-white">{teamNames[teamId as TeamId]}</p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-black/15 px-3 py-1 text-[11px] text-white/55">
                          {locked ? (isResponder ? "Javob berdi" : "Kutmoqda") : "Bosishga tayyor"}
                        </span>
                      </div>

                      <div className="grid gap-3">
                        {question.options.map((option, idx) => {
                          const isSelected = isResponder && selected === idx;
                          const isCorrect = idx === question.answerIndex;
                          const reveal = locked && selected !== null;
                          const disabledForOtherTeam = locked && answeringTeam !== teamId;

                          let stateClass = "border-white/10 bg-black/15 hover:bg-white/10";
                          if (reveal && isCorrect) {
                            stateClass = "border-emerald-500/50 bg-emerald-500/20";
                          } else if (reveal && isSelected && !isCorrect) {
                            stateClass = "border-rose-500/50 bg-rose-500/20";
                          } else if (isSelected) {
                            stateClass = "border-yellow-400 bg-yellow-500/20";
                          } else if (disabledForOtherTeam) {
                            stateClass = "border-white/8 bg-black/10 opacity-60";
                          }

                          return (
                            <button
                              key={`${teamId}-${option}-${idx}`}
                              onClick={() => onAnswer(idx, teamId as TeamId)}
                              disabled={locked}
                              className={`group relative overflow-hidden rounded-xl border-2 p-4 text-left font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100 ${stateClass}`}
                            >
                              <span className="relative flex items-center justify-between gap-3">
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
                  );
                })}
              </div>
            )}
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

      {phase === "play" && !question && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-white">
          <h3 className="text-xl font-black">Savol topilmadi</h3>
          <p className="mt-2 text-sm text-rose-100/80">
            2 kishilik rejim uchun savollar yuklanmagan yoki savol indeksi noto'g'ri bo'lib qoldi.
          </p>
          <button
            onClick={resetEverything}
            className="mt-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 font-black text-white transition-all hover:scale-105 active:scale-95"
          >
            QAYTADAN BOSHLASH
          </button>
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
              <div className="absolute inset-0 rounded-full bg-yellow-400/30" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">
                <FaCrown className="text-4xl text-white" />
              </div>
            </div>
          </div>
          
          <h2 className="relative mb-4 text-4xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            {isSinglePlayer ? `${teamNames[0]} NATIJASI` : winner === null ? "DURRANG!" : `${teamNames[winner]} G'OLIB!`}
          </h2>
          
          <div className="relative mx-auto mb-8 max-w-md rounded-xl border border-yellow-500/30 bg-yellow-950/30 p-6">
            <div className={`grid gap-4 ${isSinglePlayer ? "grid-cols-1" : "grid-cols-2"}`}>
              <div className="text-center">
                <p className="text-yellow-400 font-bold">{isSinglePlayer ? "🎮 O'YINCHI" : "⚔️ 1-GURUH"}</p>
                <p className="text-2xl font-black text-white">{teamNames[0]}</p>
                <p className="text-3xl font-black text-yellow-400 mt-2">{scores[0]}</p>
              </div>
              {!isSinglePlayer && (
              <div className="text-center">
                <p className="text-orange-400 font-bold">🛡️ 2-GURUH</p>
                <p className="text-2xl font-black text-white">{teamNames[1]}</p>
                <p className="text-3xl font-black text-orange-400 mt-2">{scores[1]}</p>
              </div>
              )}
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
