import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { GiPodiumWinner, GiSpinningWheel, GiPartyPopper, GiHummingbird, GiButterfly, GiDragonfly } from "react-icons/gi";
import { MdQuiz, MdTimer, MdOutlineEmojiEvents, MdClose } from "react-icons/md";
import { BsLightningChargeFill, BsFlower1, BsFlower2, BsFlower3 } from "react-icons/bs";
import { RiHeart2Fill, RiHeart3Fill, RiStarSmileFill } from "react-icons/ri";
import Confetti from "react-confetti-boom";
import { fetchGameQuestions, saveGameQuestions } from "../../../hooks/useGameQuestions";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../../../hooks/useGameStartCountdown";
import { useFinishApplause } from "../../../hooks/useFinishApplause";

import { EMPTY_OPTIONS, SAMPLE_QUESTIONS, WHEEL_COLORS, WHEEL_OF_FORTUNE_GAME_KEY } from "./constants";
import type { Phase, Question, Student } from "./types";
import { normalizeQuestions, shuffle } from "./utils";

// Student emojilari - har bir studentga o'ziga xos emoji
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
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionLocked, setQuestionLocked] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [category, setCategory] = useState("Geografiya");
  const [points, setPoints] = useState(100);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();

  const spinTimeoutRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const nextRef = useRef<number | null>(null);

  const currentQuestion = activeQuestions[currentQuestionIndex];
  const totalQuestions = activeQuestions.length || questions.length;
  const progressPct = Math.round(((currentQuestionIndex + 1) / Math.max(totalQuestions, 1)) * 100);
  const sortedStudents = useMemo(() => [...students].sort((a, b) => b.score - a.score), [students]);
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Har bir studentga emoji belgilash
  const studentEmojis = useMemo(() => {
    const emojiMap = new Map();
    students.forEach((student, index) => {
      emojiMap.set(student.id, STUDENT_EMOJIS[index % STUDENT_EMOJIS.length]);
    });
    return emojiMap;
  }, [students]);

  const wheelGradient = useMemo(() => {
    if (!students.length) return "#312e81 0deg 360deg";
    const segment = 360 / students.length;
    return students.map((_, i) => `${WHEEL_COLORS[i % WHEEL_COLORS.length]} ${i * segment}deg ${(i + 1) * segment}deg`).join(", ");
  }, [students]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(t);
  }, [toast]);

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

  useEffect(() => () => {
    if (spinTimeoutRef.current) window.clearTimeout(spinTimeoutRef.current);
    if (countdownRef.current) window.clearTimeout(countdownRef.current);
    if (nextRef.current) window.clearTimeout(nextRef.current);
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
    if (students.some((s) => s.name.toLowerCase() === name.toLowerCase())) return setStudentError("Bu ism allaqachon bor");
    setStudents((prev) => [...prev, { id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, score: 0 }]);
    setNewStudent("");
    setStudentError("");
    setToast(`✅ ${name} qo'shildi`);
  };

  const removeStudent = (id: string) => {
    const student = students.find(s => s.id === id);
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
            : item,
        ),
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
        points: points, 
        category: category, 
        timeLimit: 30 
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
    setPhase("spinning");
    setToast("🎮 O'yin boshlandi!");
  };

  const handleStartGame = () => runStartCountdown(startGame);

  const spinWheel = () => {
    if (spinning || students.length === 0 || !currentQuestion) return;
    setSpinning(true);
    const base = rotation;
    const finalRotation = base + (10 + Math.random() * 10) * 360;
    const duration = 4000;
    let startTime: number | null = null;

    const animate = (t: number) => {
      if (!startTime) startTime = t;
      const p = Math.min((t - startTime) / duration, 1);
      // Easing function for realistic slowdown
      const eased = 1 - Math.pow(1 - p, 3);
      setRotation(base + (finalRotation - base) * eased);
      
      if (p < 1) return requestAnimationFrame(animate);

      // Calculate selected student (pointer at top - 0 degrees)
      const segment = 360 / students.length;
      const normalized = ((finalRotation % 360) + 360) % 360;
      // Adjust so that top (0°) points to a student
      const pointer = (360 - normalized + 90) % 360;
      const i = Math.floor(pointer / segment) % students.length;
      const selected = students[i];

      setSpinning(false);
      setRotation(finalRotation);
      setSelectedStudentId(selected.id);
      setToast(`🎯 Baraban to'xtadi: ${selected.name}`);
      
      // Show question modal after a short delay
      spinTimeoutRef.current = window.setTimeout(() => {
        setShowQuestionModal(true);
        setPhase("question");
        setTimeLeft(currentQuestion.timeLimit);
      }, 1000);
    };

    requestAnimationFrame(animate);
  };

  const submitAnswer = (selectedOptionIndex?: number, timeout = false) => {
    if (questionLocked || !currentQuestion || !selectedStudentId) return;
    setQuestionLocked(true);
    const ok = !timeout && selectedOptionIndex === currentQuestion.answerIndex;
    if (ok) {
      setStudents((prev) => prev.map((s) => (s.id === selectedStudentId ? { ...s, score: s.score + currentQuestion.points } : s)));
      setResult({ correct: true, message: `✅ To'g'ri! +${currentQuestion.points} ball` });
    } else {
      setResult({ correct: false, message: `❌ Xato! To'g'ri javob: ${currentQuestion.options[currentQuestion.answerIndex]}` });
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
    setRotation(0);
    setTimeLeft(0);
    setQuestionLocked(false);
    setResult(null);
    setShowQuestionModal(false);
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

  // Render student emoji
  const renderStudentEmoji = (studentId: string, size: string = "text-2xl") => {
    const emoji = studentEmojis.get(studentId);
    if (!emoji) return null;
    const IconComponent = emoji.icon;
    return <IconComponent className={`${size} ${emoji.color}`} />;
  };

  return (
    <div className="relative min-h-screen text-white">
      {/* Sound Toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="fixed top-4 right-4 z-50 rounded-full bg-purple-900/50 p-3 backdrop-blur-sm border border-purple-500/30 hover:bg-purple-800/50 transition-all"
      >
        {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
      </button>

      {/* Toast Notification */}
      <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50">
        {toast && (
          <div className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-bold shadow-2xl animate-bounce backdrop-blur-sm border border-white/20">
            {toast}
          </div>
        )}
      </div>

      {/* Question Modal */}
      {showQuestionModal && phase === "question" && currentQuestion && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative max-w-2xl w-full">
            {/* Modal Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-50 animate-pulse" />
            
            {/* Modal Content */}
            <div className="relative bg-gradient-to-br from-purple-900 to-pink-900 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              {/* Decorative Header */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/10 to-transparent" />
              
              {/* Close Button */}
              <button
                onClick={nextQuestion}
                className="absolute top-4 right-4 z-10 rounded-full bg-black/30 p-2 hover:bg-black/50 transition-colors"
              >
                <MdClose className="text-2xl" />
              </button>

              {/* Student Info */}
              <div className="relative p-8 text-center border-b border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)]" />
                
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 blur-xl opacity-50 animate-pulse" />
                  <div className="relative flex items-center justify-center">
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${getStudentColor(students.findIndex(s => s.id === selectedStudent.id))} blur-md`} />
                    <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border-4 border-white/30 flex items-center justify-center shadow-2xl">
                      {renderStudentEmoji(selectedStudent.id, "text-5xl")}
                    </div>
                  </div>
                </div>

                <h2 className="text-3xl font-black text-white mb-2">{selectedStudent.name}</h2>
                <p className="text-purple-200/80">Javob berish navbati sizda!</p>
                
                {/* Timer */}
                <div className="mt-4 flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2 text-2xl font-bold text-white bg-black/30 rounded-full px-4 py-2">
                    <MdTimer className="text-yellow-400 animate-pulse" />
                    <span>{timeLeft}s</span>
                  </div>
                  <div className="w-32 h-2 rounded-full bg-purple-500/30">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-1000"
                      style={{ width: `${(timeLeft / currentQuestion.timeLimit) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Question */}
              <div className="relative p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="rounded-full bg-purple-500/30 px-3 py-1 text-sm font-bold text-purple-200 border border-purple-500/30">
                    {currentQuestion.category}
                  </span>
                  <span className="rounded-full bg-yellow-500/30 px-3 py-1 text-sm font-bold text-yellow-200 border border-yellow-500/30">
                    +{currentQuestion.points} ball
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-6">{currentQuestion.question}</h3>

                {/* Options */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => submitAnswer(idx)}
                      disabled={questionLocked}
                      className="group relative overflow-hidden rounded-xl border border-purple-500/30 bg-purple-950/30 p-4 text-left font-bold text-white transition-all hover:scale-[1.02] hover:bg-purple-900/40 hover:border-purple-400 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <span className="relative flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/30 text-sm">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        {option}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Result */}
                {result && (
                  <div className={`mt-6 rounded-xl p-4 text-center backdrop-blur-sm border ${
                    result.correct
                      ? 'bg-emerald-500/20 border-emerald-500/30'
                      : 'bg-rose-500/20 border-rose-500/30'
                  }`}>
                    <p className="text-lg font-bold">{result.message}</p>
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

      {/* Setup Phase */}
      {phase === "setup" && (
        <div className="relative transform-gpu overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/40 via-purple-800/40 to-pink-900/40 p-8 backdrop-blur-xl shadow-2xl">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,40,200,0.2),transparent_50%)]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />

          <div className="relative">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-50" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
                    <GiSpinningWheel className="text-4xl text-white animate-spin-slow" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
                    BARABAN O'YINI
                  </h1>
                  <p className="text-purple-200/70">Omadingizni sinab ko'ring va g'alaba qozoning!</p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex gap-4">
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
              {/* Students Section */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  <FaUsers className="text-purple-400" />
                  O'QUVCHILAR
                </h3>
                
                <div className="flex gap-2">
                  <input
                    value={newStudent}
                    onChange={(e) => setNewStudent(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addStudent()}
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

              {/* Questions Section */}
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
                  <div className="grid grid-cols-2 gap-2">
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
                  <div className="grid grid-cols-2 gap-2">
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
                  <div className="grid grid-cols-2 gap-2">
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
                
                <div className="max-h-80 space-y-2 overflow-auto pr-2 scrollbar-thin scrollbar-thumb-pink-500/30">
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
                          <div className="mt-2 grid grid-cols-2 gap-1">
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
            
            {/* Start Button */}
            {students.length >= 2 && questions.length >= 1 && (
              <div className="relative mt-8 flex justify-center">
                <button
                  onClick={handleStartGame}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-12 py-4 text-xl font-black text-white shadow-2xl transition-all hover:scale-105 hover:shadow-purple-500/50 active:scale-95"
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

      {/* Spinning Phase */}
      {phase === "spinning" && currentQuestion && (
        <div className="relative transform-gpu overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/40 via-purple-800/40 to-pink-900/40 p-8 backdrop-blur-xl shadow-2xl">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_70%)]" />
          
          {/* Progress */}
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
          
          {/* Main Game Area */}
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {/* Students List - Left */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-purple-200/70 mb-4 flex items-center gap-2">
                <FaUsers />
                O'QUVCHILAR
              </h4>
              {students.map((student, index) => {
                const emoji = STUDENT_EMOJIS[index % STUDENT_EMOJIS.length];
                const IconComponent = emoji.icon;
                
                return (
                  <div
                    key={student.id}
                    className={`relative group transition-all duration-300 ${
                      student.id === selectedStudentId ? 'scale-105 z-10' : ''
                    }`}
                  >
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${emoji.bg} opacity-0 group-hover:opacity-20 transition-opacity`} />
                    <div
                      className={`relative flex items-center gap-3 rounded-xl border p-3 backdrop-blur-sm transition-all ${
                        student.id === selectedStudentId
                          ? 'border-yellow-400 bg-yellow-500/20 shadow-lg shadow-yellow-500/25'
                          : 'border-purple-500/30 bg-purple-950/30'
                      }`}
                    >
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r ${emoji.bg} text-xs font-bold text-white shadow-lg`}>
                        <IconComponent className="text-lg" />
                      </div>
                      <span className="text-sm font-bold text-white flex-1 truncate">{student.name}</span>
                      <span className="text-sm font-bold text-yellow-300">{student.score}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Wheel - Center */}
            <div className="relative">
              {/* Glow Effects */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-purple-500/10 blur-2xl" />
              
              {/* Wheel Container */}
              <div className="relative w-full aspect-square">
                {/* Pointer */}
                <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400 blur-md" />
                    <div className="relative w-0 h-0 border-l-[25px] border-r-[25px] border-t-[50px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-2xl" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-yellow-400 to-transparent blur-sm" />
                </div>
                
                {/* Wheel */}
                <div
                  className="absolute inset-0 rounded-full transition-transform duration-300 overflow-hidden shadow-2xl"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 0 50px rgba(255,255,255,0.3)',
                  }}
                >
                  {/* Segments */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `conic-gradient(${wheelGradient})`,
                    }}
                  >
                    {/* Segment Dividers */}
                    <div className="absolute inset-0">
                      {students.map((_, i) => {
                        const angle = (i * 360) / students.length;
                        return (
                          <div
                            key={i}
                            className="absolute inset-0"
                            style={{
                              transform: `rotate(${angle}deg)`,
                              borderRight: '2px solid rgba(255,255,255,0.3)',
                              transformOrigin: '50% 50%',
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Student labels on wheel segments */}
                  {students.map((student, i) => {
                    const segment = 360 / students.length;
                    const angle = i * segment + segment / 2;
                    const radius = students.length <= 6 ? 68 : students.length <= 9 ? 62 : 58;
                    const emoji = studentEmojis.get(student.id) ?? STUDENT_EMOJIS[i % STUDENT_EMOJIS.length];
                    const IconComponent = emoji.icon;
                    
                    return (
                      <div
                        key={student.id}
                        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          transform: `rotate(${angle}deg) translate(0, -${radius}%) rotate(-${angle}deg)`,
                        }}
                      >
                        <div className="flex min-w-[92px] max-w-[132px] flex-col items-center gap-2">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r ${emoji.bg} border-2 border-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.35)]`}>
                            <IconComponent className="text-lg text-white" />
                          </div>
                          <div className="rounded-full border border-white/30 bg-black/65 px-3 py-1.5 text-center shadow-lg backdrop-blur-md">
                            <span className="block truncate text-[11px] font-black uppercase tracking-[0.08em] text-white">
                              {student.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Center Hub */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 blur-xl opacity-50 animate-pulse" />
                      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border-4 border-white/30 flex items-center justify-center shadow-2xl">
                        {spinning ? (
                          <FaSpinner className="text-4xl text-white animate-spin" />
                        ) : (
                          <GiSpinningWheel className="text-4xl text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Spin Button */}
              <div className="relative mt-8 flex justify-center">
                <button
                  onClick={spinWheel}
                  disabled={spinning}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 font-black text-white shadow-2xl transition-all hover:scale-105 hover:shadow-purple-500/50 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center gap-3 text-lg">
                    {spinning ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        AYLANMOQDA...
                      </>
                    ) : (
                      <>
                        <GiSpinningWheel className="text-2xl" />
                        BARABANNI AYLANTIRISH
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Next Question Preview - Right */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-purple-200/70 mb-4 flex items-center gap-2">
                <MdQuiz />
                NAVBATDAGI SAVOL
              </h4>
              <div className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-purple-500/20 px-2 py-1 text-xs text-purple-300">
                    {currentQuestion.category}
                  </span>
                  <span className="rounded-full bg-yellow-500/20 px-2 py-1 text-xs text-yellow-300">
                    +{currentQuestion.points}
                  </span>
                </div>
                <p className="text-sm font-bold text-white mb-3 line-clamp-2">{currentQuestion.question}</p>
                <div className="grid gap-1">
                  {currentQuestion.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className="text-xs p-2 rounded-lg bg-purple-900/20 border border-purple-500/20"
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finish Phase */}
      {phase === "finish" && (
        <div className="relative transform-gpu overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-rose-900/40 p-8 backdrop-blur-xl shadow-2xl text-center">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1),transparent_70%)]" />
          
          <div className="relative mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-yellow-400 blur-3xl opacity-30 animate-pulse" />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 border-4 border-white/30 shadow-2xl">
                <GiPodiumWinner className="text-5xl text-white" />
              </div>
            </div>
          </div>
          
          <h2 className="relative mb-8 text-5xl font-black bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
            O'YIN YAKUNLANDI
          </h2>
          
          {/* Podium */}
          <div className="relative mb-12 grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            {/* 2nd Place */}
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
            
            {/* 1st Place */}
            {sortedStudents[0] && (
              <div className="relative scale-110 z-10 group hover:scale-115 transition-transform">
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
            
            {/* 3rd Place */}
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
          
          {/* All Students */}
          <div className="relative mb-8 max-w-md mx-auto">
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-6 backdrop-blur-sm">
              <h3 className="text-sm font-bold text-purple-300 mb-4 flex items-center gap-2">
                <MdOutlineEmojiEvents />
                BARCHA NATIJALAR
              </h3>
              <div className="space-y-3">
                {sortedStudents.map((student) => {
                  const emoji = STUDENT_EMOJIS[students.findIndex(s => s.id === student.id) % STUDENT_EMOJIS.length];
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
          
          {/* Buttons */}
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
