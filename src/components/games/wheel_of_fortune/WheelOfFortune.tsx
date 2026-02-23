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
  FaRocket
} from "react-icons/fa";
import { GiPodiumWinner, GiSpinningWheel} from "react-icons/gi";
import { MdQuiz, MdTimer} from "react-icons/md";
import Confetti from "react-confetti-boom";
import { fetchGameQuestions, saveGameQuestions } from "../../../apiClient/gameQuestions";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../shared/useGameStartCountdown";

type Student = { id: string; name: string; score: number };
type Question = {
  id: string;
  question: string;
  options: [string, string, string, string];
  answerIndex: number;
  points: number;
  category: string;
  timeLimit: number;
};
type Phase = "setup" | "spinning" | "question" | "finish";

const SAMPLE_QUESTIONS: Question[] = [
  { id: "q1", question: "O'zbekiston poytaxti qayer?", options: ["Samarqand", "Buxoro", "Toshkent", "Xiva"], answerIndex: 2, points: 100, category: "Geografiya", timeLimit: 30 },
  { id: "q2", question: "9 ning kvadrati nechiga teng?", options: ["72", "81", "99", "91"], answerIndex: 1, points: 80, category: "Matematika", timeLimit: 25 },
  { id: "q3", question: "Eng katta okean qaysi?", options: ["Atlantika", "Tinch okeani", "Hind okeani", "Shimoliy muz"], answerIndex: 1, points: 120, category: "Geografiya", timeLimit: 35 },
  { id: "q4", question: "Qaysi hayvon 'sahro kemasi' deb ataladi?", options: ["Ot", "Sigir", "Tuya", "Eshak"], answerIndex: 2, points: 90, category: "Biologiya", timeLimit: 30 },
  { id: "q5", question: "20 + 35 - 12 = ?", options: ["43", "41", "45", "47"], answerIndex: 0, points: 70, category: "Matematika", timeLimit: 20 },
];

const WHEEL_COLORS = [
  "#3b82f6", "#14b8a6", "#22c55e", "#eab308", "#f97316", "#ef4444", "#ec4899", "#a855f7",
  "#6366f1", "#06b6d4", "#84cc16", "#f59e0b", "#f43f5e", "#d946ef", "#8b5cf6", "#0ea5e9"
];

const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
const WHEEL_OF_FORTUNE_GAME_KEY = "wheel_of_fortune";
const EMPTY_OPTIONS: [string, string, string, string] = ["", "", "", ""];

const normalizeQuestions = (items: unknown[]): Question[] =>
  items
    .map((item, idx) => {
      const row = item as Partial<Question> & { answer?: string };
      const q = (row.question || "").toString().trim();
      if (!q) return null;

      const rawOptions = Array.isArray(row.options)
        ? row.options.map((v) => String(v).trim())
        : [];
      let options: [string, string, string, string];
      let answerIndex = Number.isInteger(row.answerIndex)
        ? Number(row.answerIndex)
        : 0;

      if (rawOptions.length >= 4) {
        options = [rawOptions[0], rawOptions[1], rawOptions[2], rawOptions[3]];
      } else {
        const answer = (row.answer || "").toString().trim();
        if (!answer) return null;
        options = [answer, "Variant B", "Variant C", "Variant D"];
        answerIndex = 0;
      }

      if (answerIndex < 0 || answerIndex > 3) answerIndex = 0;

      return {
        id: row.id || `q-import-${idx}`,
        question: q,
        options,
        answerIndex,
        points: Number(row.points) || 100,
        category: (row.category || "Umumiy").toString(),
        timeLimit: Number(row.timeLimit) || 30,
      } as Question;
    })
    .filter((q): q is Question => q !== null);

export default function WheelOfFortune() {
  const skipInitialRemoteSaveRef = useRef(true);
  const [phase, setPhase] = useState<Phase>("setup");
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
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();

  const spinTimeoutRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const nextRef = useRef<number | null>(null);

  const currentQuestion = activeQuestions[currentQuestionIndex];
  const totalQuestions = activeQuestions.length || questions.length;
  const progressPct = Math.round(((currentQuestionIndex + 1) / Math.max(totalQuestions, 1)) * 100);
  const sortedStudents = useMemo(() => [...students].sort((a, b) => b.score - a.score), [students]);

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
    if (phase !== "question" || !currentQuestion || questionLocked) return;
    if (timeLeft <= 0) {
      submitAnswer(undefined, true);
      return;
    }
    countdownRef.current = window.setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => {
      if (countdownRef.current) window.clearTimeout(countdownRef.current);
    };
  }, [phase, currentQuestion, questionLocked, timeLeft]);

  const nextQuestion = () => {
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
    const finalRotation = base + (5 + Math.random() * 5) * 360 + Math.random() * 360;
    const duration = 3000;
    let startTime: number | null = null;

    const animate = (t: number) => {
      if (!startTime) startTime = t;
      const p = Math.min((t - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setRotation(base + (finalRotation - base) * eased);
      if (p < 1) return requestAnimationFrame(animate);

      const segment = 360 / students.length;
      const normalized = ((finalRotation % 360) + 360) % 360;
      const pointer = (360 - normalized) % 360;
      const i = Math.floor(pointer / segment) % students.length;
      const selected = students[i];

      setSpinning(false);
      setRotation(finalRotation);
      setSelectedStudentId(selected.id);
      setToast(`🎯 Baraban to'xtadi: ${selected.name}`);
      spinTimeoutRef.current = window.setTimeout(() => {
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
    setToast("🔄 O'yin qayta boshlandi");
  };

  const getStudentColor = (index: number) => {
    const colors = [
      "from-blue-500 to-cyan-500",
      "from-green-500 to-emerald-500",
      "from-yellow-500 to-orange-500",
      "from-purple-500 to-pink-500",
      "from-red-500 to-rose-500",
      "from-indigo-500 to-blue-500",
      "from-teal-500 to-cyan-500",
      "from-fuchsia-500 to-pink-500",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="relative text-white">
      {/* Toast Notification */}
      <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50">
        {toast && (
          <div className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-bold shadow-2xl animate-bounce backdrop-blur-sm">
            {toast}
          </div>
        )}
      </div>

      {phase === "finish" && (
        <Confetti
          mode="boom"
          particleCount={100}
          effectCount={1}
          x={0.5}
          y={0.35}
          colors={["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"]}
        />
      )}

      {/* Setup Phase */}
      {phase === "setup" && (
        <div className="relative transform-gpu overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
          
          <div className="relative mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500">
              <GiSpinningWheel className="text-3xl text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">BARABAN O'YINI</h2>
              <p className="text-purple-200/80">O'quvchilar va savollarni qo'shing</p>
            </div>
          </div>
          
          <div className="relative grid gap-6 lg:grid-cols-2">
            {/* Students Section */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <FaUsers className="text-purple-400" />
                O'QUVCHILAR
              </h3>
              
              <div className="flex gap-2">
                <input
                  value={newStudent}
                  onChange={(e) => setNewStudent(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addStudent()}
                  className="flex-1 rounded-xl border border-purple-500/30 bg-purple-950/30 px-4 py-3 text-white placeholder-purple-200/50 focus:border-purple-400 focus:outline-none"
                  placeholder="O'quvchi ismi"
                />
                <button
                  onClick={addStudent}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-white font-bold transition-all hover:scale-105"
                >
                  <FaPlus />
                </button>
              </div>
              
              {studentError && (
                <div className="rounded-xl bg-rose-500/20 p-3 text-rose-300 border border-rose-500/30">
                  ⚠️ {studentError}
                </div>
              )}
              
              <div className="max-h-64 space-y-2 overflow-auto pr-2">
                {students.map((student, index) => (
                  <div
                    key={student.id}
                    className="group relative overflow-hidden rounded-xl border border-purple-500/30 bg-purple-950/30 p-3 transition-all hover:bg-purple-900/40"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${getStudentColor(index)} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r ${getStudentColor(index)} text-xs font-bold text-white`}>
                          {index + 1}
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
                ))}
                
                {students.length === 0 && (
                  <div className="text-center py-8 text-purple-200/50">
                    <FaUsers className="mx-auto text-4xl mb-2 opacity-30" />
                    <p>Hozircha o'quvchi yo'q</p>
                  </div>
                )}
              </div>
            </div>

            {/* Questions Section */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <MdQuiz className="text-pink-400" />
                SAVOLLAR
              </h3>
              
              <div className="space-y-2">
                <input
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full rounded-xl border border-purple-500/30 bg-purple-950/30 px-4 py-3 text-white placeholder-purple-200/50 focus:border-purple-400 focus:outline-none"
                  placeholder="Savol matni"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={answerIndex}
                    onChange={(e) => setAnswerIndex(Number(e.target.value))}
                    className="rounded-xl border border-purple-500/30 bg-purple-950/30 px-4 py-3 text-white focus:border-purple-400 focus:outline-none"
                  >
                    <option value={0} className="bg-purple-900">To'g'ri: Variant 1</option>
                    <option value={1} className="bg-purple-900">To'g'ri: Variant 2</option>
                    <option value={2} className="bg-purple-900">To'g'ri: Variant 3</option>
                    <option value={3} className="bg-purple-900">To'g'ri: Variant 4</option>
                  </select>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="rounded-xl border border-purple-500/30 bg-purple-950/30 px-4 py-3 text-white focus:border-purple-400 focus:outline-none"
                  >
                    <option value="Geografiya" className="bg-purple-900">Geografiya</option>
                    <option value="Matematika" className="bg-purple-900">Matematika</option>
                    <option value="Biologiya" className="bg-purple-900">Biologiya</option>
                    <option value="Tarix" className="bg-purple-900">Tarix</option>
                    <option value="Adabiyot" className="bg-purple-900">Adabiyot</option>
                    <option value="Umumiy" className="bg-purple-900">Umumiy</option>
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
                      className="rounded-xl border border-purple-500/30 bg-purple-950/30 px-4 py-3 text-white placeholder-purple-200/50 focus:border-purple-400 focus:outline-none"
                      placeholder={`Variant ${idx + 1}`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-purple-200/70">Ball:</span>
                    <input
                      type="number"
                      value={points}
                      onChange={(e) => setPoints(Number(e.target.value))}
                      min="50"
                      max="500"
                      step="10"
                      className="w-24 rounded-xl border border-purple-500/30 bg-purple-950/30 px-3 py-2 text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={addQuestion}
                      className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-white font-bold transition-all hover:scale-105"
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
                <div className="rounded-xl bg-rose-500/20 p-3 text-rose-300 border border-rose-500/30">
                  ⚠️ {questionError}
                </div>
              )}
              
              <div className="max-h-64 space-y-2 overflow-auto pr-2">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="group relative overflow-hidden rounded-xl border border-purple-500/30 bg-purple-950/30 p-3 transition-all hover:bg-purple-900/40"
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
                                  ? "bg-emerald-500/20 text-emerald-300"
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
                          title="Tahrirlash"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => removeQuestion(q.id)}
                          className="text-rose-400 hover:text-rose-300 transition-colors"
                          title="O'chirish"
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
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-12 py-4 text-xl font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
              >
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-4">
                  <FaRocket />
                  O'YINNI BOSHLASH
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Spinning Phase */}
      {phase === "spinning" && currentQuestion && (
        <div className="relative transform-gpu overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
          
          {/* Progress */}
          <div className="relative mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-purple-200/80">Savol {currentQuestionIndex + 1}/{activeQuestions.length}</span>
              <span className="text-purple-200/80">{progressPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-purple-500/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          
          {/* Wheel */}
          <div className="relative mx-auto mb-6 w-80 h-80">
            {/* Pointer */}
            <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-4">
              <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[40px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-2xl" />
            </div>
            
            {/* Wheel */}
            <div
              className="absolute inset-0 rounded-full border-[8px] border-white/30 shadow-2xl overflow-hidden transition-transform duration-300"
              style={{
                transform: `rotate(${rotation}deg)`,
                background: `conic-gradient(${wheelGradient})`,
                boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 0 30px rgba(255,255,255,0.3)'
              }}
            >
              {/* Student Names */}
              {students.map((student, i) => {
                const segment = 360 / students.length;
                const angle = i * segment + segment / 2;
                const radius = 120;
                const x = Math.sin((angle * Math.PI) / 180) * radius;
                const y = -Math.cos((angle * Math.PI) / 180) * radius;
                
                return (
                  <div
                    key={student.id}
                    className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      transform: `translate(${x}px, ${y}px) rotate(${angle}deg)`,
                    }}
                  >
                    <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/30 whitespace-nowrap">
                      <span className="text-xs font-bold text-white">{student.name}</span>
                    </div>
                  </div>
                );
              })}
              
              {/* Center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 border-4 border-white/30 flex items-center justify-center shadow-xl">
                  {spinning ? (
                    <FaSpinner className="text-3xl text-white animate-spin" />
                  ) : (
                    <GiSpinningWheel className="text-3xl text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Students List */}
          <div className="relative mb-6 grid grid-cols-2 gap-2 max-w-md mx-auto">
            {students.map((student, index) => (
              <div
                key={student.id}
                className={`flex items-center gap-2 rounded-xl border p-2 transition-all ${
                  student.id === selectedStudentId
                    ? 'border-yellow-400/50 bg-yellow-500/20 scale-105'
                    : 'border-purple-500/30 bg-purple-950/30'
                }`}
              >
                <div className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r ${getStudentColor(index)} text-xs font-bold text-white`}>
                  {index + 1}
                </div>
                <span className="text-sm font-bold text-white flex-1 truncate">{student.name}</span>
                <span className="text-xs text-purple-200/60">{student.score}</span>
              </div>
            ))}
          </div>
          
          {/* Spin Button */}
          <div className="relative flex justify-center">
            <button
              onClick={spinWheel}
              disabled={spinning}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-3">
                {spinning ? <FaSpinner className="animate-spin" /> : <GiSpinningWheel />}
                {spinning ? "AYLANMOQDA..." : "BARABANNI AYLANTIRISH"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Question Phase */}
      {phase === "question" && currentQuestion && selectedStudentId && (
        <div className="relative transform-gpu overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
          
          {/* Header */}
          <div className="relative mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-yellow-400/30" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">
                  <FaCrown className="text-2xl text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm text-purple-200/80">Javob beradi</p>
                <p className="text-2xl font-black text-white">
                  {students.find(s => s.id === selectedStudentId)?.name}
                </p>
              </div>
            </div>
            
            {/* Timer */}
            <div className="text-right">
              <div className="flex items-center gap-2 text-3xl font-black text-white">
                <MdTimer className="text-yellow-400" />
                <span>{timeLeft}s</span>
              </div>
              <div className="mt-2 h-2 w-32 rounded-full bg-purple-500/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-1000"
                  style={{ width: `${(timeLeft / currentQuestion.timeLimit) * 100}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* Question Card */}
          <div className="relative mb-6 rounded-xl border border-purple-500/30 bg-purple-950/30 p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300">
                {currentQuestion.category}
              </span>
              <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-bold text-yellow-300">
                +{currentQuestion.points} ball
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">{currentQuestion.question}</h3>
            
            {/* Options */}
            <div className="grid gap-2 sm:grid-cols-2">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={`${currentQuestion.id}-${idx}`}
                  onClick={() => submitAnswer(idx)}
                  disabled={questionLocked}
                  className="rounded-xl border border-purple-500/30 bg-purple-950/30 px-4 py-3 text-left font-bold text-white transition-all hover:scale-[1.02] hover:bg-purple-900/40 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {/* Result */}
          {result && (
            <div className={`rounded-xl p-4 text-center ${
              result.correct
                ? 'bg-emerald-500/20 border border-emerald-500/30'
                : 'bg-rose-500/20 border border-rose-500/30'
            }`}>
              <p className="text-lg font-bold">{result.message}</p>
            </div>
          )}
        </div>
      )}

      {/* Finish Phase */}
      {phase === "finish" && (
        <div className="relative transform-gpu overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-rose-900/30 p-6 backdrop-blur-xl text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10" />
          
          <div className="relative mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-yellow-400/30" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">
                <GiPodiumWinner className="text-4xl text-white" />
              </div>
            </div>
          </div>
          
          <h2 className="relative mb-8 text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
            O'YIN YAKUNLANDI
          </h2>
          
          {/* Podium */}
          <div className="relative mb-8 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {/* 2nd Place */}
            {sortedStudents[1] && (
              <div className="relative group hover:scale-105 transition-transform">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-400 to-gray-300 rounded-2xl blur opacity-70" />
                <div className="relative bg-gradient-to-b from-gray-600 to-gray-700 rounded-2xl p-4 pt-8">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-gray-400 to-gray-300 border-4 border-white/30">
                      <FaMedal className="text-xl text-white" />
                    </div>
                  </div>
                  <p className="text-xl font-black text-white mb-1">2- O'RIN</p>
                  <p className="text-lg font-bold text-white">{sortedStudents[1].name}</p>
                  <p className="text-3xl font-black text-yellow-300">{sortedStudents[1].score}</p>
                </div>
              </div>
            )}
            
            {/* 1st Place */}
            {sortedStudents[0] && (
              <div className="relative scale-110 z-10 group hover:scale-115 transition-transform">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl blur opacity-90" />
                <div className="relative bg-gradient-to-b from-yellow-600 to-orange-600 rounded-2xl p-4 pt-8">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 border-4 border-white/30">
                      <FaCrown className="text-xl text-white" />
                    </div>
                  </div>
                  <p className="text-xl font-black text-white mb-1">1- O'RIN</p>
                  <p className="text-lg font-bold text-white">{sortedStudents[0].name}</p>
                  <p className="text-3xl font-black text-yellow-300">{sortedStudents[0].score}</p>
                </div>
              </div>
            )}
            
            {/* 3rd Place */}
            {sortedStudents[2] && (
              <div className="relative group hover:scale-105 transition-transform">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-600 to-amber-500 rounded-2xl blur opacity-70" />
                <div className="relative bg-gradient-to-b from-amber-700 to-amber-800 rounded-2xl p-4 pt-8">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-amber-600 to-amber-500 border-4 border-white/30">
                      <FaStar className="text-xl text-white" />
                    </div>
                  </div>
                  <p className="text-xl font-black text-white mb-1">3- O'RIN</p>
                  <p className="text-lg font-bold text-white">{sortedStudents[2].name}</p>
                  <p className="text-3xl font-black text-yellow-300">{sortedStudents[2].score}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* All Students */}
          <div className="relative mb-8 max-w-md mx-auto">
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-4">
              <h3 className="text-sm font-bold text-purple-300 mb-3">BARCHA NATIJALAR</h3>
              <div className="space-y-2">
                {sortedStudents.map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r ${getStudentColor(index)} text-xs font-bold text-white`}>
                        {index + 1}
                      </span>
                      <span className="text-sm font-bold text-white">{student.name}</span>
                    </div>
                    <span className="text-lg font-black text-yellow-300">{student.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="relative flex justify-center gap-4">
            <button
              onClick={resetGame}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-2">
                <GiSpinningWheel />
                QAYTA O'YNASH
              </span>
            </button>
            
            <button
              onClick={() => setPhase("setup")}
              className="group relative overflow-hidden rounded-xl bg-white/10 px-6 py-3 font-bold text-white border border-white/20 transition-all hover:bg-white/20"
            >
              <span className="relative flex items-center gap-2">
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
