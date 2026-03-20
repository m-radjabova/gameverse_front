import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaEdit,
  FaCrown,
  FaMedal,
  FaPlus,
  FaSpinner,
  FaStar,
  FaTrash,
  FaUserMinus,
  FaUsers,
  FaRocket,
  FaVolumeUp,
  FaVolumeMute,
  FaSmile,
  FaGrinStars,
  FaLaugh,
  FaSurprise,
  FaAngry,
  FaFrown,
  FaMeh,
  FaSmileBeam,
  FaGrinHearts,
  FaGrinWink,
  FaDizzy,
  FaGrinTongue,
  FaKissWinkHeart
} from "react-icons/fa";
import {
  GiPodiumWinner,
  GiSpinningWheel,
  GiPartyPopper,
  GiHummingbird,
  GiButterfly,
  GiDragonfly
} from "react-icons/gi";
import { MdQuiz, MdTimer, MdOutlineEmojiEvents, MdClose } from "react-icons/md";
import { BsLightningChargeFill, BsFlower1, BsFlower2, BsFlower3 } from "react-icons/bs";
import { RiHeart2Fill, RiHeart3Fill, RiStarSmileFill } from "react-icons/ri";
import Confetti from "react-confetti-boom";

import { fetchGameQuestions, saveGameQuestions } from "../../../hooks/useGameQuestions";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../../../hooks/useGameStartCountdown";
import { useFinishApplause } from "../../../hooks/useFinishApplause";

import {
  EMPTY_OPTIONS,
  SAMPLE_QUESTIONS,
  WHEEL_OF_FORTUNE_GAME_KEY
} from "./constants";
import type { Phase, Question, Student } from "./types";
import { normalizeQuestions, shuffle } from "./utils";
import StudentWheel from "./StudentWheel";

const STUDENT_EMOJIS = [
  { icon: FaSmile, color: "text-yellow-400", bg: "from-yellow-400 to-orange-400" },
  { icon: FaGrinStars, color: "text-blue-400", bg: "from-blue-400 to-cyan-400" },
  { icon: FaLaugh, color: "text-green-400", bg: "from-green-400 to-emerald-400" },
  { icon: FaSurprise, color: "text-purple-400", bg: "from-purple-400 to-pink-400" },
  { icon: FaAngry, color: "text-red-400", bg: "from-red-400 to-rose-400" },
  { icon: FaFrown, color: "text-indigo-400", bg: "from-indigo-400 to-blue-400" },
  { icon: FaMeh, color: "text-teal-400", bg: "from-teal-400 to-cyan-400" },
  { icon: FaSmileBeam, color: "text-amber-400", bg: "from-amber-400 to-yellow-400" },
  { icon: FaGrinHearts, color: "text-pink-400", bg: "from-pink-400 to-rose-400" },
  { icon: FaGrinWink, color: "text-lime-400", bg: "from-lime-400 to-green-400" },
  { icon: FaDizzy, color: "text-violet-400", bg: "from-violet-400 to-purple-400" },
  { icon: FaGrinTongue, color: "text-orange-400", bg: "from-orange-400 to-red-400" },
  { icon: FaKissWinkHeart, color: "text-fuchsia-400", bg: "from-fuchsia-400 to-pink-400" },
  { icon: GiHummingbird, color: "text-cyan-400", bg: "from-cyan-400 to-blue-400" },
  { icon: GiButterfly, color: "text-pink-400", bg: "from-pink-400 to-purple-400" },
  { icon: GiDragonfly, color: "text-emerald-400", bg: "from-emerald-400 to-teal-400" },
  { icon: BsFlower1, color: "text-rose-400", bg: "from-rose-400 to-pink-400" },
  { icon: BsFlower2, color: "text-purple-400", bg: "from-purple-400 to-violet-400" },
  { icon: BsFlower3, color: "text-indigo-400", bg: "from-indigo-400 to-blue-400" },
  { icon: RiHeart2Fill, color: "text-red-400", bg: "from-red-400 to-rose-400" },
  { icon: RiHeart3Fill, color: "text-pink-400", bg: "from-pink-400 to-fuchsia-400" },
  { icon: RiStarSmileFill, color: "text-yellow-400", bg: "from-yellow-400 to-amber-400" },
];

export default function WheelOfFortune() {
  const skipInitialRemoteSaveRef = useRef(true);

  const [phase, setPhase] = useState<Phase>("setup");
  useFinishApplause(phase === "finish");

  const [students, setStudents] = useState<Student[]>([]);
  const [questions, setQuestions] = useState<Question[]>(SAMPLE_QUESTIONS);

  const [newStudent, setNewStudent] = useState("");
  const [studentError, setStudentError] = useState("");

  const [questionText, setQuestionText] = useState("");
  const [questionOptions, setQuestionOptions] = useState<[string, string, string, string]>(EMPTY_OPTIONS);
  const [answerIndex, setAnswerIndex] = useState(0);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionError, setQuestionError] = useState("");

  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const [timeLeft, setTimeLeft] = useState(0);
  const [questionLocked, setQuestionLocked] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showWinnerOverlay, setShowWinnerOverlay] = useState(false);

  const [category, setCategory] = useState("Geografiya");
  const [points, setPoints] = useState(100);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();

  const countdownRef = useRef<number | null>(null);
  const nextRef = useRef<number | null>(null);

  const currentQuestion = activeQuestions[currentQuestionIndex];
  const totalQuestions = activeQuestions.length || questions.length;
  const progressPct = Math.round(((currentQuestionIndex + 1) / Math.max(totalQuestions, 1)) * 100);
  const sortedStudents = useMemo(() => [...students].sort((a, b) => b.score - a.score), [students]);
  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const studentEmojis = useMemo(() => {
    const emojiMap = new Map();
    students.forEach((student, index) => {
      emojiMap.set(student.id, STUDENT_EMOJIS[index % STUDENT_EMOJIS.length]);
    });
    return emojiMap;
  }, [students]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!showWinnerOverlay) return;
    const t = window.setTimeout(() => setShowWinnerOverlay(false), 1800);
    return () => window.clearTimeout(t);
  }, [showWinnerOverlay]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const remoteQuestions = await fetchGameQuestions<Question>(WHEEL_OF_FORTUNE_GAME_KEY);
      if (!alive) return;
      if (remoteQuestions && remoteQuestions.length > 0) {
        setQuestions(normalizeQuestions(remoteQuestions));
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
      void saveGameQuestions<Question>(WHEEL_OF_FORTUNE_GAME_KEY, questions);
    }, 500);

    return () => window.clearTimeout(t);
  }, [questions, remoteLoaded]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) window.clearTimeout(countdownRef.current);
      if (nextRef.current) window.clearTimeout(nextRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== "question" || !currentQuestion || questionLocked || !showQuestionModal) return;

    if (timeLeft <= 0) {
      submitAnswer(undefined, true);
      return;
    }

    countdownRef.current = window.setTimeout(() => setTimeLeft((v) => v - 1), 1000);

    return () => {
      if (countdownRef.current) window.clearTimeout(countdownRef.current);
    };
  }, [phase, currentQuestion, questionLocked, timeLeft, showQuestionModal]);

  const nextQuestion = () => {
    setShowQuestionModal(false);
    setShowWinnerOverlay(false);

    if (currentQuestionIndex + 1 >= activeQuestions.length) {
      setPhase("finish");
      return;
    }

    setCurrentQuestionIndex((v) => v + 1);
    setSelectedStudentId(null);
    setQuestionLocked(false);
    setResult(null);
    setTimeLeft(0);
    setPhase("spinning");
  };

  const addStudent = () => {
    const name = newStudent.trim();
    if (!name) return setStudentError("Ism kiriting");
    if (students.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      return setStudentError("Bu ism allaqachon bor");
    }

    setStudents((prev) => [
      ...prev,
      {
        id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        score: 0,
      },
    ]);
    setNewStudent("");
    setStudentError("");
    setToast(`✅ ${name} qo'shildi`);
  };

  const removeStudent = (id: string) => {
    const student = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    if (selectedStudentId === id) setSelectedStudentId(null);
    setToast(`🗑️ ${student?.name} o'chirildi`);
  };

  const resetQuestionForm = () => {
    setQuestionText("");
    setQuestionOptions(EMPTY_OPTIONS);
    setAnswerIndex(0);
    setCategory("Geografiya");
    setPoints(100);
    setQuestionError("");
    setEditingQuestionId(null);
  };

  const beginEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    setQuestionText(question.question);
    setQuestionOptions([...question.options] as [string, string, string, string]);
    setAnswerIndex(question.answerIndex);
    setCategory(question.category);
    setPoints(question.points);
    setQuestionError("");
  };

  const addQuestion = () => {
    const q = questionText.trim();
    const options = questionOptions.map((option) => option.trim()) as [string, string, string, string];

    if (!q) return setQuestionError("Savol matnini kiriting");
    if (options.some((option) => !option)) return setQuestionError("4 ta variantni to'ldiring");

    if (editingQuestionId) {
      setQuestions((prev) =>
        prev.map((item) =>
          item.id === editingQuestionId
            ? {
                ...item,
                question: q,
                options,
                answerIndex,
                points,
                category,
              }
            : item
        )
      );
      resetQuestionForm();
      setToast("✏️ Savol yangilandi");
      return;
    }

    setQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        question: q,
        options,
        answerIndex,
        points,
        category,
        timeLimit: 30,
      },
    ]);

    resetQuestionForm();
    setToast("✅ Savol qo'shildi");
  };

  const removeQuestion = (id: string) => {
    if (questions.length <= 1) {
      setToast("❌ Kamida 1 ta savol bo'lishi kerak");
      return;
    }

    setQuestions((prev) => prev.filter((q) => q.id !== id));
    if (editingQuestionId === id) {
      resetQuestionForm();
    }
    setToast("🗑️ Savol o'chirildi");
  };

  const startGame = () => {
    if (students.length < 2) return setStudentError("Kamida 2 ta o'quvchi kerak");
    if (questions.length < 1) return setQuestionError("Kamida 1 ta savol kerak");

    setStudents((prev) => prev.map((s) => ({ ...s, score: 0 })));
    setActiveQuestions(shuffle(questions));
    setCurrentQuestionIndex(0);
    setSelectedStudentId(null);
    setQuestionLocked(false);
    setResult(null);
    setShowQuestionModal(false);
    setTimeLeft(0);
    setMustSpin(false);
    setSpinning(false);
    setPhase("spinning");
    setToast("🎮 O'yin boshlandi!");
  };

  const handleStartGame = () => runStartCountdown(startGame);

  const spinWheel = () => {
    if (spinning || students.length === 0 || !currentQuestion) return;

    const randomIndex = Math.floor(Math.random() * students.length);
    setPrizeNumber(randomIndex);
    setMustSpin(true);
    setSpinning(true);
  };

  const handleWheelStop = () => {
    const winner = students[prizeNumber];
    if (!winner || !currentQuestion) return;

    setMustSpin(false);
    setSpinning(false);
    setSelectedStudentId(winner.id);
    setShowWinnerOverlay(true);
    setToast(`🎯 Baraban to'xtadi: ${winner.name}`);

    window.setTimeout(() => {
      setShowQuestionModal(true);
      setPhase("question");
      setTimeLeft(currentQuestion.timeLimit);
    }, 700);
  };

  const submitAnswer = (selectedOptionIndex?: number, timeout = false) => {
    if (questionLocked || !currentQuestion || !selectedStudentId) return;

    setQuestionLocked(true);

    const ok = !timeout && selectedOptionIndex === currentQuestion.answerIndex;

    if (ok) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === selectedStudentId
            ? { ...s, score: s.score + currentQuestion.points }
            : s
        )
      );
      setResult({ correct: true, message: `✅ To'g'ri! +${currentQuestion.points} ball` });
    } else {
      setResult({
        correct: false,
        message: `❌ Xato! To'g'ri javob: ${currentQuestion.options[currentQuestion.answerIndex]}`,
      });
    }

    nextRef.current = window.setTimeout(nextQuestion, 2000);
  };

  const resetGame = () => {
    setPhase("setup");
    setStudents([]);
    setQuestions(SAMPLE_QUESTIONS);
    setActiveQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedStudentId(null);
    setTimeLeft(0);
    setQuestionLocked(false);
    setResult(null);
    setShowQuestionModal(false);
    setMustSpin(false);
    setPrizeNumber(0);
    setSpinning(false);
    setToast("🔄 O'yin qayta boshlandi");
  };

  const getStudentColor = (index: number) => {
    const colors = [
      "from-blue-500 to-cyan-400",
      "from-green-500 to-emerald-400",
      "from-yellow-500 to-orange-400",
      "from-purple-500 to-pink-400",
      "from-red-500 to-rose-400",
      "from-indigo-500 to-blue-400",
      "from-teal-500 to-cyan-400",
      "from-fuchsia-500 to-pink-400",
    ];
    return colors[index % colors.length];
  };

  const renderStudentEmoji = (studentId: string, size: string = "text-2xl") => {
    const emoji = studentEmojis.get(studentId);
    if (!emoji) return null;
    const IconComponent = emoji.icon;
    return <IconComponent className={`${size} ${emoji.color}`} />;
  };

  return (
    <div className="relative min-h-screen text-white">
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="fixed right-3 top-3 z-50 rounded-full border border-purple-500/30 bg-purple-900/50 p-2.5 backdrop-blur-sm transition-all hover:bg-purple-800/50 sm:right-4 sm:top-4 sm:p-3"
      >
        {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
      </button>

      <div className="fixed left-1/2 top-20 z-50 w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 sm:top-24 sm:w-auto">
        {toast && (
          <div className="rounded-2xl border border-white/20 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2.5 text-center text-sm font-bold text-white shadow-2xl animate-bounce backdrop-blur-sm sm:rounded-full sm:px-6 sm:py-3 sm:text-base">
            {toast}
          </div>
        )}
      </div>

      {showQuestionModal && phase === "question" && currentQuestion && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[2rem]">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-fuchsia-600/60 via-violet-600/50 to-cyan-500/50 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[linear-gradient(145deg,rgba(48,16,94,0.96),rgba(86,18,87,0.94))] shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.16),transparent_30%)]" />

              <div className="relative border-b border-white/10 px-4 py-5 sm:px-8 sm:py-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div
                        className={`absolute inset-0 rounded-full bg-gradient-to-r ${getStudentColor(
                          students.findIndex((s) => s.id === selectedStudent.id)
                        )} blur-lg opacity-80`}
                      />
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-xl sm:h-20 sm:w-20">
                        {renderStudentEmoji(selectedStudent.id, "text-4xl")}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-fuchsia-200/75">
                        Savol tushdi
                      </p>
                      <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">{selectedStudent.name}</h2>
                      <p className="mt-1 text-sm text-purple-100/75">
                        Javob berish navbati shu o'quvchida.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                      <div className="flex items-center gap-2 text-xl font-black text-white">
                        <MdTimer className="text-amber-300" />
                        <span>{timeLeft}s</span>
                      </div>
                      <div className="mt-2 h-2 w-24 rounded-full bg-white/10 sm:w-28">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 transition-all duration-1000"
                          style={{ width: `${(timeLeft / currentQuestion.timeLimit) * 100}%` }}
                        />
                      </div>
                    </div>

                    {questionLocked && (
                      <button
                        onClick={nextQuestion}
                        className="rounded-2xl border border-white/15 bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                      >
                        <MdClose className="text-2xl" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative px-4 py-5 sm:px-8 sm:py-8">
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-fuchsia-400/25 bg-fuchsia-500/15 px-4 py-1.5 text-sm font-bold text-fuchsia-100">
                    {currentQuestion.category}
                  </span>
                  <span className="rounded-full border border-amber-300/25 bg-amber-400/15 px-4 py-1.5 text-sm font-bold text-amber-100">
                    +{currentQuestion.points} ball
                  </span>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 sm:rounded-[1.75rem] sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100/60">
                    Savol matni
                  </p>
                  <h3 className="mt-3 text-xl font-black leading-tight text-white sm:text-3xl">
                    {currentQuestion.question}
                  </h3>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => submitAnswer(idx)}
                      disabled={questionLocked}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))] p-3.5 text-left text-white transition-all hover:-translate-y-0.5 hover:border-fuchsia-300/40 hover:bg-white/10 disabled:cursor-default disabled:opacity-60 sm:p-4"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 via-transparent to-cyan-400/10 opacity-0 transition-opacity group-hover:opacity-100" />
                      <span className="relative flex items-start gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/12 text-sm font-black">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="pt-1 text-sm font-semibold leading-6 sm:text-base">{option}</span>
                      </span>
                    </button>
                  ))}
                </div>

                {result && (
                  <div
                    className={`mt-6 rounded-2xl border p-4 text-center backdrop-blur-sm ${
                      result.correct
                        ? "border-emerald-400/30 bg-emerald-500/15"
                        : "border-rose-400/30 bg-rose-500/15"
                    }`}
                  >
                    <p className="text-lg font-black text-white">{result.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === "finish" && (
        <Confetti
          mode="boom"
          particleCount={150}
          effectCount={2}
          x={0.5}
          y={0.35}
          colors={["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"]}
        />
      )}

      {phase === "setup" && (
        <div className="relative transform-gpu overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/40 via-purple-800/40 to-pink-900/40 p-4 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,40,200,0.2),transparent_50%)]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />

          <div className="relative">
            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4 sm:items-center sm:gap-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-50" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg sm:h-20 sm:w-20">
                    <GiSpinningWheel className="text-4xl text-white animate-spin-slow" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300 bg-clip-text text-transparent sm:text-4xl">
                    BARABAN O'YINI
                  </h1>
                  <p className="text-sm text-purple-200/70 sm:text-base">Omadingizni sinab ko'ring va g'alaba qozoning!</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
                <div className="rounded-xl bg-purple-900/30 border border-purple-500/30 px-4 py-2 text-center">
                  <p className="text-xs text-purple-200/70">O'quvchilar</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
                <div className="rounded-xl bg-pink-900/30 border border-pink-500/30 px-4 py-2 text-center">
                  <p className="text-xs text-pink-200/70">Savollar</p>
                  <p className="text-2xl font-bold">{questions.length}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  <FaUsers className="text-purple-400" />
                  O'QUVCHILAR
                </h3>

                <div className="flex gap-2">
                  <input
                    value={newStudent}
                    onChange={(e) => setNewStudent(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addStudent()}
                    className="flex-1 rounded-xl border border-purple-500/30 bg-purple-950/30 px-4 py-3 text-white placeholder-purple-200/50 focus:border-purple-400 focus:outline-none backdrop-blur-sm"
                    placeholder="O'quvchi ismini kiriting..."
                  />
                  <button
                    onClick={addStudent}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-white font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
                  >
                    <FaPlus />
                  </button>
                </div>

                {studentError && (
                  <div className="rounded-xl bg-rose-500/20 p-3 text-rose-300 border border-rose-500/30 backdrop-blur-sm">
                    ⚠️ {studentError}
                  </div>
                )}

                <div className="space-y-2 overflow-auto pr-2 scrollbar-thin scrollbar-thumb-purple-500/30">
                  {students.map((student, index) => {
                    const emoji = STUDENT_EMOJIS[index % STUDENT_EMOJIS.length];
                    const IconComponent = emoji.icon;

                    return (
                      <div
                        key={student.id}
                        className="group relative overflow-hidden rounded-xl border border-purple-500/30 bg-purple-950/30 p-3 transition-all hover:bg-purple-900/40 backdrop-blur-sm"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${emoji.bg} opacity-0 group-hover:opacity-10 transition-opacity`} />
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r ${emoji.bg} text-xs font-bold text-white shadow-lg`}>
                              <IconComponent className="text-lg" />
                            </div>
                            <span className="font-bold text-white">{student.name}</span>
                          </div>
                          <button
                            onClick={() => removeStudent(student.id)}
                            className="text-rose-400 hover:text-rose-300 transition-colors"
                          >
                            <FaUserMinus />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {students.length === 0 && (
                    <div className="text-center py-12 text-purple-200/50">
                      <FaUsers className="mx-auto text-5xl mb-3 opacity-30" />
                      <p>Hozircha o'quvchi yo'q</p>
                      <p className="text-sm mt-2">Yuqoriga ism yozib qo'shing</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  <MdQuiz className="text-pink-400" />
                  SAVOLLAR
                </h3>

                <div className="space-y-2">
                  <input
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="w-full rounded-xl border border-purple-500/30 bg-purple-950/30 px-4 py-3 text-white placeholder-purple-200/50 focus:border-purple-400 focus:outline-none backdrop-blur-sm"
                    placeholder="Savol matnini kiriting..."
                  />

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <select
                      value={answerIndex}
                      onChange={(e) => setAnswerIndex(Number(e.target.value))}
                      className="rounded-xl border border-purple-500/30 bg-purple-950/30 px-4 py-3 text-white focus:border-purple-400 focus:outline-none backdrop-blur-sm"
                    >
                      <option value={0}>✅ To'g'ri: Variant 1</option>
                      <option value={1}>✅ To'g'ri: Variant 2</option>
                      <option value={2}>✅ To'g'ri: Variant 3</option>
                      <option value={3}>✅ To'g'ri: Variant 4</option>
                    </select>

                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="rounded-xl border border-purple-500/30 bg-purple-950/30 px-4 py-3 text-white focus:border-purple-400 focus:outline-none backdrop-blur-sm"
                    >
                      <option value="Geografiya">🌍 Geografiya</option>
                      <option value="Matematika">📐 Matematika</option>
                      <option value="Biologiya">🧬 Biologiya</option>
                      <option value="Tarix">🏛️ Tarix</option>
                      <option value="Adabiyot">📚 Adabiyot</option>
                      <option value="Umumiy">🎯 Umumiy</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {questionOptions.map((option, idx) => (
                      <input
                        key={idx}
                        value={option}
                        onChange={(e) =>
                          setQuestionOptions((prev) => {
                            const next = [...prev] as [string, string, string, string];
                            next[idx] = e.target.value;
                            return next;
                          })
                        }
                        className="rounded-xl border border-purple-500/30 bg-purple-950/30 px-4 py-3 text-white placeholder-purple-200/50 focus:border-purple-400 focus:outline-none backdrop-blur-sm"
                        placeholder={`${idx + 1}-variant`}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 bg-purple-950/30 rounded-xl px-4 py-2 border border-purple-500/30">
                      <BsLightningChargeFill className="text-yellow-400" />
                      <span className="text-sm text-purple-200/70">Ball:</span>
                      <input
                        type="number"
                        value={points}
                        onChange={(e) => setPoints(Number(e.target.value))}
                        min="50"
                        max="500"
                        step="10"
                        className="w-20 bg-transparent text-white focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={addQuestion}
                        className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-white font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-pink-500/25"
                      >
                        <span className="flex items-center justify-center gap-2">
                          {editingQuestionId ? <FaEdit /> : <FaPlus />}
                          {editingQuestionId ? "SAQLASH" : "QO'SHISH"}
                        </span>
                      </button>

                      {editingQuestionId && (
                        <button
                          onClick={resetQuestionForm}
                          className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-white/20"
                        >
                          BEKOR
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {questionError && (
                  <div className="rounded-xl bg-rose-500/20 p-3 text-rose-300 border border-rose-500/30 backdrop-blur-sm">
                    ⚠️ {questionError}
                  </div>
                )}

                <div className="max-h-72 space-y-2 overflow-auto pr-2 scrollbar-thin scrollbar-thumb-pink-500/30 sm:max-h-80">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className="group relative overflow-hidden rounded-xl border border-purple-500/30 bg-purple-950/30 p-3 transition-all hover:bg-purple-900/40 backdrop-blur-sm"
                    >
                      <div className="relative flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
                              {q.category}
                            </span>
                            <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-300">
                              +{q.points}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-white line-clamp-1">{q.question}</p>
                          <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                            {q.options.map((opt, optIdx) => (
                              <span
                                key={optIdx}
                                className={`rounded-lg px-2 py-1 text-xs ${
                                  optIdx === q.answerIndex
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : "bg-purple-500/10 text-purple-200/70"
                                }`}
                              >
                                {opt}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="ml-2 flex items-center gap-2">
                          <button
                            onClick={() => beginEditQuestion(q)}
                            className="text-cyan-300 hover:text-cyan-200 transition-colors"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => removeQuestion(q.id)}
                            className="text-rose-400 hover:text-rose-300 transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {students.length >= 2 && questions.length >= 1 && (
              <div className="relative mt-8 flex justify-center">
                <button
                  onClick={handleStartGame}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 text-lg font-black text-white shadow-2xl transition-all hover:scale-105 hover:shadow-purple-500/50 active:scale-95 sm:px-12 sm:text-xl"
                >
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center gap-4">
                    <FaRocket className="group-hover:animate-bounce" />
                    O'YINNI BOSHLASH
                    <GiPartyPopper className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {phase === "spinning" && currentQuestion && (
        <div className="relative transform-gpu overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/40 via-purple-800/40 to-pink-900/40 p-4 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_75%_50%,rgba(236,72,153,0.16),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.14),transparent_45%)]" />

          <div className="relative mb-8">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-purple-200/80 flex items-center gap-2">
                <GiSpinningWheel className="animate-spin-slow" />
                Savol {currentQuestionIndex + 1}/{activeQuestions.length}
              </span>
              <span className="text-purple-200/80">{progressPct}%</span>
            </div>
            <div className="h-3 rounded-full bg-purple-500/20 backdrop-blur-sm">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 transition-all duration-300 relative overflow-hidden"
                style={{ width: `${progressPct}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-shimmer" />
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start xl:gap-8">
            <div className="space-y-5">
              <div className="rounded-[1.75rem] border border-white/10 bg-black/15 p-5 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.28em] text-cyan-100/75">
                      <FaUsers />
                      O'quvchilar
                    </h4>
                  </div>
                </div>
              </div>

              <div className="wheel-leaderboard-scroll max-h-[360px] space-y-3 overflow-auto pr-2 sm:max-h-[640px]">
                {sortedStudents.map((student, rank) => {
                  const studentIndex = students.findIndex((item) => item.id === student.id);
                  const emoji = STUDENT_EMOJIS[studentIndex % STUDENT_EMOJIS.length];
                  const IconComponent = emoji.icon;
                  const isSelected = student.id === selectedStudentId;

                  return (
                    <div
                      key={student.id}
                      className={`relative overflow-hidden rounded-[1.5rem] border p-4 transition-all ${
                        isSelected
                          ? "border-amber-300/50 bg-amber-400/10 shadow-lg shadow-amber-500/10"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${emoji.bg} opacity-[0.08]`} />
                      <div className="relative flex items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-sm font-black text-white ring-1 ring-white/10">
                          {rank + 1}
                        </div>

                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r ${emoji.bg} shadow-lg`}>
                          <IconComponent className="text-xl text-white" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-black text-white">{student.name}</p>
                          <p className="text-xs uppercase tracking-[0.2em] text-purple-100/55">
                            {isSelected ? "Savol tushgan o'quvchi" : "Navbat kutmoqda"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs uppercase tracking-[0.2em] text-purple-100/50">Ball</p>
                          <p className="text-2xl font-black text-amber-300">{student.score}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] p-4 shadow-2xl backdrop-blur-sm sm:p-6">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="mt-2 text-xl font-black text-white sm:text-2xl">
                      O'quvchini tanlash uchun aylantiring
                    </h3>
                  </div>
                </div>

                <div className="flex justify-center py-2">
                  <div className="relative">
                    <StudentWheel
                      students={students}
                      mustSpin={mustSpin}
                      prizeNumber={prizeNumber}
                      onStopSpinning={handleWheelStop}
                    />

                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3),rgba(255,255,255,0.08))] shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-md sm:h-32 sm:w-32">
                        <div className="absolute inset-2 rounded-full border border-white/10" />
                        <button
                          onClick={spinWheel}
                          disabled={spinning}
                          className="pointer-events-auto relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#fb7185,#d946ef,#38bdf8)] text-center text-[10px] font-black tracking-[0.28em] text-white shadow-[0_18px_40px_rgba(217,70,239,0.35)] transition-all hover:scale-105 disabled:cursor-default disabled:opacity-70 disabled:hover:scale-100 sm:h-24 sm:w-24 sm:text-sm"
                        >
                          {spinning ? (
                            <FaSpinner className="text-2xl animate-spin" />
                          ) : (
                            <span className="translate-x-[0.14em]">SPIN</span>
                          )}
                        </button>
                      </div>
                    </div>

                    {showWinnerOverlay && selectedStudent && (
                      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-black/20 blur-2xl" />
                        <div className="relative flex max-w-[280px] flex-col items-center rounded-[1.75rem] border border-amber-200/30 bg-[linear-gradient(135deg,rgba(255,255,255,0.24),rgba(255,255,255,0.08))] px-6 py-5 text-center shadow-2xl backdrop-blur-xl animate-fadeIn">
                          <div className="rounded-full bg-amber-300/20 px-3 py-1 text-xs font-black uppercase tracking-[0.3em] text-amber-100">
                            Tanlandi
                          </div>
                          <p className="mt-3 text-sm font-medium text-purple-100/80">
                            Savol tushadigan o'quvchi
                          </p>
                          <h4 className="mt-2 text-3xl font-black text-white">{selectedStudent.name}</h4>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-4">
                  <div className="rounded-2xl border border-white/10 bg-black/15 px-5 py-4 text-center">
                    {selectedStudent ? (
                      <p className="text-sm text-purple-100/80">
                        Oxirgi tanlangan o'quvchi:
                        <span className="ml-2 font-black text-amber-300">{selectedStudent.name}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-purple-100/65">
                        Hozircha hech kim tanlanmagan. Barabanni aylantiring.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === "finish" && (
        <div className="relative transform-gpu overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-rose-900/40 p-4 text-center shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1),transparent_70%)]" />

          <div className="relative mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-yellow-400 blur-3xl opacity-30 animate-pulse" />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 border-4 border-white/30 shadow-2xl">
                <GiPodiumWinner className="text-5xl text-white" />
              </div>
            </div>
          </div>

          <h2 className="relative mb-8 text-3xl font-black bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300 bg-clip-text text-transparent sm:text-5xl">
            O'YIN YAKUNLANDI
          </h2>

          <div className="relative mb-12 grid max-w-3xl grid-cols-1 gap-5 mx-auto md:grid-cols-3 md:gap-6">
            {sortedStudents[1] && (
              <div className="relative group hover:scale-105 transition-transform">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-400 to-gray-300 rounded-2xl blur opacity-70" />
                <div className="relative bg-gradient-to-b from-gray-600 to-gray-700 rounded-2xl p-6 pt-12">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-gray-400 to-gray-300 border-4 border-white/30 shadow-xl">
                      <FaMedal className="text-2xl text-white" />
                    </div>
                  </div>
                  <p className="text-xl font-black text-white mb-2">2-O'RIN</p>
                  <p className="text-lg font-bold text-white mb-2">{sortedStudents[1].name}</p>
                  <p className="text-3xl font-black text-yellow-300">{sortedStudents[1].score}</p>
                </div>
              </div>
            )}

            {sortedStudents[0] && (
              <div className="relative z-10 group transition-transform md:scale-110 md:hover:scale-115">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl blur opacity-90" />
                <div className="relative bg-gradient-to-b from-yellow-600 to-orange-600 rounded-2xl p-6 pt-12">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 border-4 border-white/30 shadow-xl">
                      <FaCrown className="text-2xl text-white" />
                    </div>
                  </div>
                  <p className="text-xl font-black text-white mb-2">1-O'RIN</p>
                  <p className="text-lg font-bold text-white mb-2">{sortedStudents[0].name}</p>
                  <p className="text-4xl font-black text-yellow-300">{sortedStudents[0].score}</p>
                </div>
              </div>
            )}

            {sortedStudents[2] && (
              <div className="relative group hover:scale-105 transition-transform">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-600 to-amber-500 rounded-2xl blur opacity-70" />
                <div className="relative bg-gradient-to-b from-amber-700 to-amber-800 rounded-2xl p-6 pt-12">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-amber-600 to-amber-500 border-4 border-white/30 shadow-xl">
                      <FaStar className="text-2xl text-white" />
                    </div>
                  </div>
                  <p className="text-xl font-black text-white mb-2">3-O'RIN</p>
                  <p className="text-lg font-bold text-white mb-2">{sortedStudents[2].name}</p>
                  <p className="text-3xl font-black text-yellow-300">{sortedStudents[2].score}</p>
                </div>
              </div>
            )}
          </div>

          <div className="relative mb-8 max-w-md mx-auto">
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-6 backdrop-blur-sm">
              <h3 className="text-sm font-bold text-purple-300 mb-4 flex items-center gap-2">
                <MdOutlineEmojiEvents />
                BARCHA NATIJALAR
              </h3>
              <div className="space-y-3">
                {sortedStudents.map((student) => {
                  const emoji = STUDENT_EMOJIS[students.findIndex((s) => s.id === student.id) % STUDENT_EMOJIS.length];
                  const IconComponent = emoji.icon;

                  return (
                    <div key={student.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r ${emoji.bg} text-xs font-bold text-white shadow-lg`}>
                          <IconComponent className="text-lg" />
                        </div>
                        <span className="text-sm font-bold text-white">{student.name}</span>
                      </div>
                      <span className="text-xl font-black text-yellow-300">{student.score}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="relative flex justify-center gap-4">
            <button
              onClick={resetGame}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 font-black text-white shadow-2xl transition-all hover:scale-105 hover:shadow-purple-500/50 active:scale-95"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-2 text-lg">
                <GiSpinningWheel />
                QAYTA O'YNASH
              </span>
            </button>

            <button
              onClick={() => setPhase("setup")}
              className="group relative overflow-hidden rounded-xl bg-white/10 px-8 py-4 font-bold text-white border border-white/20 transition-all hover:bg-white/20"
            >
              <span className="relative flex items-center gap-2 text-lg">
                <FaUsers />
                SOZLASH
              </span>
            </button>
          </div>
        </div>
      )}

      <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />
    </div>
  );
}
