import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaCheck,
  FaFlagCheckered,
  FaPlus,
  FaRedo,
  FaRocket,
  FaSpinner,
  FaTimes,
  FaUserMinus,
  FaUsers,
  FaVolumeMute,
  FaVolumeUp,
} from "react-icons/fa";
import { GiPodiumWinner, GiSpinningWheel } from "react-icons/gi";
import { MdTimer } from "react-icons/md";
import Confetti from "react-confetti-boom";

import { fetchGameQuestionsByTeacher } from "../../../hooks/useGameQuestions";
import { getGameQuestionDifficulty } from "../../../hooks/gameSession";
import useContextPro from "../../../hooks/useContextPro";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../../../hooks/useGameStartCountdown";
import { useFinishApplause } from "../../../hooks/useFinishApplause";

import { SAMPLE_QUESTIONS, WHEEL_OF_FORTUNE_GAME_KEY } from "./constants";
import type { Phase, Question, Student } from "./types";
import { normalizeQuestions, shuffle } from "./utils";
import StudentWheel from "./StudentWheel";

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

/** Pause after the correct answer is shown, before the next spin. */
const NEXT_QUESTION_DELAY = 3500;

/**
 * Ball yo'q. Baraban tanlagan o'quvchi savolga javob beradi va
 * (to'g'ri yoki xato bo'lishidan qat'i nazar) o'yindan chiqadi.
 */
type Player = Student & {
  out: boolean; // barabandan chiqarilganmi
  correct: boolean | null; // javobi to'g'rimi
  order: number; // nechanchi bo'lib javob bergan (0 = hali yo'q)
};

const AVATAR_COLORS = [
  "bg-rose-500",
  "bg-amber-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-pink-500",
];
const OPTION_STYLES = [
  "from-sky-500 to-blue-700",
  "from-emerald-500 to-green-700",
  "from-amber-400 to-orange-600",
  "from-fuchsia-500 to-pink-700",
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

/** Har bir o'quvchiga bittadan savol: savollar kam bo'lsa takrorlanadi. */
function buildQueue(questions: Question[], studentCount: number) {
  const queue: Question[] = [];
  while (queue.length < studentCount) queue.push(...shuffle(questions));
  return queue.slice(0, studentCount);
}

const getDifficultyQuestions = (list: Question[]) => {
  const difficulty = getGameQuestionDifficulty("wheel-of-fortune");
  return list.filter(
    (question) => !question.difficulty || question.difficulty === difficulty,
  );
};

const clear = (...refs: { current: number | null }[]) =>
  refs.forEach((r) => r.current && window.clearTimeout(r.current));

/* ------------------------------------------------------------------ */

export default function WheelOfFortune() {
  const {
    state: { user, isLoading: isUserLoading },
  } = useContextPro();

  const [phase, setPhase] = useState<Phase>("setup");
  const [students, setStudents] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<Question[]>(() =>
    getDifficultyQuestions(SAMPLE_QUESTIONS),
  );

  const [newStudent, setNewStudent] = useState("");
  const [studentError, setStudentError] = useState("");

  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const [timeLeft, setTimeLeft] = useState(0);
  const [questionLocked, setQuestionLocked] = useState(false);
  const [pickedOption, setPickedOption] = useState<number | null>(null);
  const [result, setResult] = useState<{
    correct: boolean;
    message: string;
    detail?: string;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showWinnerOverlay, setShowWinnerOverlay] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useFinishApplause(phase === "finish", soundEnabled);
  const { countdownValue, countdownVisible, runStartCountdown } =
    useGameStartCountdown();

  const timerRef = useRef<number | null>(null);
  const nextRef = useRef<number | null>(null);
  const stopRef = useRef<number | null>(null);
  const nextQuestionRef = useRef<() => void>(() => undefined);

  /* ---------------------------- derived ---------------------------- */
  const currentQuestion = activeQuestions[currentQuestionIndex];

  // Barabanda faqat hali javob bermaganlar qoladi.
  const wheelStudents = useMemo(
    () => students.filter((s) => !s.out),
    [students],
  );
  const answered = useMemo(
    () => students.filter((s) => s.out).sort((a, b) => a.order - b.order),
    [students],
  );
  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const colorOf = (id: string) =>
    AVATAR_COLORS[
      Math.max(
        0,
        students.findIndex((s) => s.id === id),
      ) % AVATAR_COLORS.length
    ];

  /* ---------------------------- load teacher questions ---------------------------- */
  useEffect(() => {
    if (isUserLoading) return;

    let alive = true;

    const loadQuestions = async () => {
      try {
        // Teacher tizimga kirmagan bo'lsa, demo savollardan foydalanamiz.
        if (!user?.id) {
          if (alive) setQuestions(getDifficultyQuestions(SAMPLE_QUESTIONS));
          return;
        }

        const remote = await fetchGameQuestionsByTeacher<Question>(
          WHEEL_OF_FORTUNE_GAME_KEY,
          user.id,
        );
        if (!alive) return;

        // Teacher savollari bo'sh bo'lsa, demo savollar qo'shilmaydi.
        setQuestions(normalizeQuestions(remote ?? []));
      } catch (error) {
        console.error("Teacher savollarini yuklashda xatolik:", error);
        if (alive) setQuestions([]);
      }
    };

    void loadQuestions();

    return () => {
      alive = false;
    };
  }, [isUserLoading, user?.id]);

  /* ---------------------------- misc effects ---------------------------- */
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => () => clear(timerRef, nextRef, stopRef), []);

  // Question timer
  useEffect(() => {
    if (phase !== "question" || !currentQuestion || questionLocked) return;
    if (timeLeft <= 0) {
      submitAnswer(undefined, true);
      return;
    }
    timerRef.current = window.setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentQuestion, questionLocked, timeLeft]);

  // Keyboard: Space = spin, 1-4 / A-D = answer, Enter = next
  useEffect(() => {
    if (phase !== "spinning" && phase !== "question") return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (phase === "spinning" && (e.code === "Space" || e.key === "Enter")) {
        e.preventDefault();
        spinWheel();
      } else if (phase === "question") {
        const idx =
          "1234".indexOf(e.key) >= 0
            ? "1234".indexOf(e.key)
            : "abcd".indexOf(e.key.toLowerCase());
        if (idx >= 0) submitAnswer(idx);
        if (e.key === "Enter" && questionLocked) nextQuestionRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, spinning, questionLocked, currentQuestion, selectedStudentId]);

  /* ---------------------------- students ---------------------------- */
  const addStudent = () => {
    // Bir nechta ism: "Ali, Vali, Hasan" yoki har biri alohida qatorda
    const names = newStudent
      .split(/[\n,;]+/)
      .map((n) => n.trim())
      .filter(Boolean);
    if (names.length === 0) return setStudentError("Ism kiriting");

    const existing = new Set(students.map((s) => s.name.toLowerCase()));
    const fresh: Player[] = [];
    names.forEach((name) => {
      if (existing.has(name.toLowerCase())) return;
      existing.add(name.toLowerCase());
      fresh.push({
        id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        out: false,
        correct: null,
        order: 0,
      });
    });

    if (fresh.length === 0)
      return setStudentError("Bu ism(lar) allaqachon bor");
    setStudents((prev) => [...prev, ...fresh]);
    setNewStudent("");
    setStudentError("");
    setToast(
      fresh.length === 1
        ? `✅ ${fresh[0].name} qo'shildi`
        : `✅ ${fresh.length} ta o'quvchi qo'shildi`,
    );
  };

  const removeStudent = (id: string) =>
    setStudents((prev) => prev.filter((s) => s.id !== id));

  /* ---------------------------- game flow ---------------------------- */
  const resetRound = () => {
    setSelectedStudentId(null);
    setQuestionLocked(false);
    setPickedOption(null);
    setResult(null);
    setTimeLeft(0);
    setMustSpin(false);
    setSpinning(false);
    setShowWinnerOverlay(false);
    setPrizeNumber(0);
  };

  const startGame = () => {
    const fresh = shuffle(
      students.map((s) => ({ ...s, out: false, correct: null, order: 0 })),
    );
    setStudents(fresh);
    setActiveQuestions(buildQueue(questions, fresh.length));
    setCurrentQuestionIndex(0);
    resetRound();
    setPhase("spinning");
  };

  const handleStartGame = () => {
    if (students.length < 2) {
      return setStudentError("Kamida 2 ta o'quvchi kerak");
    }
    if (questions.length === 0) {
      return setToast(
        user?.id
          ? "Teacher hali savol qo'shmagan yoki tanlangan darajada savollar yo'q"
          : "Kamida 1 ta savol kerak",
      );
    }
    runStartCountdown(startGame);
  };

  const nextQuestion = () => {
    clear(nextRef);
    setShowWinnerOverlay(false);

    // Barabanda hech kim qolmagan bo'lsa, o'yin tugaydi.
    if (students.every((s) => s.out)) {
      setPhase("finish");
      return;
    }
    setCurrentQuestionIndex((v) => v + 1);
    resetRound();
    setPhase("spinning");
  };
  nextQuestionRef.current = nextQuestion;

  const spinWheel = () => {
    if (
      spinning ||
      phase !== "spinning" ||
      wheelStudents.length === 0 ||
      !currentQuestion
    )
      return;
    setPrizeNumber(Math.floor(Math.random() * wheelStudents.length));
    setMustSpin(true);
    setSpinning(true);
  };

  const handleWheelStop = () => {
    const winner = wheelStudents[prizeNumber];
    if (!winner || !currentQuestion) return;

    setMustSpin(false);
    setSpinning(false);
    setSelectedStudentId(winner.id);
    setShowWinnerOverlay(true);

    const limit = currentQuestion.timeLimit;
    stopRef.current = window.setTimeout(() => {
      setShowWinnerOverlay(false);
      setPhase("question");
      setTimeLeft(limit);
    }, 1500);
  };

  const submitAnswer = (optionIndex?: number, timeout = false) => {
    if (questionLocked || !currentQuestion || !selectedStudentId) return;
    setQuestionLocked(true);
    setPickedOption(optionIndex ?? null);

    const ok = !timeout && optionIndex === currentQuestion.answerIndex;

    // Javob bergan o'quvchi barabandan chiqariladi.
    setStudents((prev) => {
      const order = prev.filter((s) => s.out).length + 1;
      return prev.map((s) =>
        s.id === selectedStudentId
          ? { ...s, out: true, correct: ok, order }
          : s,
      );
    });

    setResult(
      ok
        ? { correct: true, message: "To'g'ri! 🎉" }
        : {
            correct: false,
            message: timeout ? "Vaqt tugadi!" : "Xato!",
            detail: `To'g'ri javob: ${currentQuestion.options[currentQuestion.answerIndex]}`,
          },
    );

    nextRef.current = window.setTimeout(
      () => nextQuestionRef.current(),
      NEXT_QUESTION_DELAY,
    );
  };

  const finishEarly = () => {
    clear(nextRef, stopRef);
    setMustSpin(false);
    setSpinning(false);
    setPhase("finish");
  };

  const resetGame = () => {
    clear(nextRef, stopRef);
    setStudents((prev) =>
      prev.map((s) => ({ ...s, out: false, correct: null, order: 0 })),
    );
    setActiveQuestions([]);
    setCurrentQuestionIndex(0);
    resetRound();
    setPhase("setup");
  };

  /* ---------------------------- UI pieces ---------------------------- */
  const Avatar = ({
    id,
    name,
    size = "h-9 w-9 text-sm",
  }: {
    id: string;
    name: string;
    size?: string;
  }) => (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-black text-white ${size} ${colorOf(id)}`}
    >
      {initials(name)}
    </span>
  );

  const timeRatio = currentQuestion
    ? Math.max(0, timeLeft / currentQuestion.timeLimit)
    : 0;
  const urgent = timeLeft <= 5 && phase === "question" && !questionLocked;
  const correctCount = answered.filter((s) => s.correct).length;

  return (
    <div className="relative min-h-[100dvh] text-white">
      <button
        onClick={() => setSoundEnabled((v) => !v)}
        aria-label="Ovoz"
        className="fixed right-3 top-3 z-50 rounded-full border border-white/15 bg-slate-900/70 p-3 backdrop-blur transition hover:bg-slate-800"
      >
        {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
      </button>

      {toast && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-amber-400 px-6 py-3 text-base font-extrabold text-slate-900 shadow-2xl">
          {toast}
        </div>
      )}

      {phase === "finish" && (
        <Confetti
          mode="boom"
          particleCount={150}
          effectCount={2}
          x={0.5}
          y={0.35}
          colors={[
            "#f59e0b",
            "#ec4899",
            "#10b981",
            "#3b82f6",
            "#ef4444",
            "#8b5cf6",
          ]}
        />
      )}

      {/* ============================ SETUP ============================ */}
      {phase === "setup" && (
        <div className="mx-auto min-h-[100dvh] max-w-5xl p-4 sm:p-8">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-slate-900 shadow-lg sm:h-20 sm:w-20">
                  <GiSpinningWheel className="text-5xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-black sm:text-4xl">
                    Baraban o'yini
                  </h1>
                  <p className="text-slate-300">
                    Baraban tanlaydi, o'quvchi javob beradi va o'yindan chiqadi.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="rounded-xl bg-white/5 px-5 py-2 text-center">
                  <p className="text-xs text-slate-400">O'quvchilar</p>
                  <p className="text-2xl font-black">{students.length}</p>
                </div>
                <div className="rounded-xl bg-white/5 px-5 py-2 text-center">
                  <p className="text-xs text-slate-400">Savollar</p>
                  <p className="text-2xl font-black">{questions.length}</p>
                </div>
              </div>
            </div>

            <h3 className="mb-3 mt-8 flex items-center gap-2 text-xl font-bold">
              <FaUsers className="text-amber-300" /> O'quvchilar
            </h3>

            <div className="flex gap-2">
              <input
                value={newStudent}
                onChange={(e) => setNewStudent(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addStudent()}
                className="flex-1 rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-lg text-white placeholder-slate-500 focus:border-amber-300 focus:outline-none"
                placeholder="Ism yozing yoki bir nechtasini vergul bilan: Ali, Vali, Hasan"
              />
              <button
                onClick={addStudent}
                aria-label="Qo'shish"
                className="rounded-xl bg-amber-400 px-5 text-slate-900 transition hover:bg-amber-300"
              >
                <FaPlus />
              </button>
            </div>

            {studentError && (
              <p className="mt-3 rounded-xl bg-rose-500/15 p-3 text-rose-200">
                ⚠️ {studentError}
              </p>
            )}

            <div className="mt-4 grid max-h-[42vh] grid-cols-1 gap-2 overflow-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {students.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5"
                >
                  <Avatar id={s.id} name={s.name} />
                  <span className="min-w-0 flex-1 truncate font-bold">
                    {s.name}
                  </span>
                  <button
                    onClick={() => removeStudent(s.id)}
                    aria-label="O'chirish"
                    className="text-rose-300 hover:text-rose-200"
                  >
                    <FaUserMinus />
                  </button>
                </div>
              ))}
            </div>
            {students.length === 0 && (
              <p className="py-10 text-center text-slate-400">
                Hozircha o'quvchi yo'q. Ismlarni yuqoriga yozing.
              </p>
            )}

            {students.length >= 2 && (
              <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-slate-200">
                <p>
                  Savollar soni: <b>{students.length} ta</b>
                  {questions.length > 0 &&
                    questions.length < students.length &&
                    " (savollar kam bo'lgani uchun takrorlanadi)"}
                  .
                </p>
                <p className="mt-1 text-slate-400">
                  Javob bergan o'quvchi barabandan chiqib ketadi. Hamma javob
                  bergach, o'yin tugaydi.
                </p>
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleStartGame}
                disabled={students.length < 2}
                className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-10 py-4 text-xl font-black text-slate-900 shadow-xl transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                <FaRocket /> O'yinni boshlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================ PLAY ============================ */}
      {(phase === "spinning" || phase === "question") && currentQuestion && (
        <div className="flex h-[100dvh] flex-col bg-[radial-gradient(ellipse_at_50%_35%,#2b1d6b_0%,#120d35_55%,#070a1c_100%)]">
          {/* Top bar */}
          <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-white/10 px-4 py-3 pr-16 sm:px-6">
            <div className="text-lg font-black sm:text-xl">
              Qolgan: {wheelStudents.length}{" "}
              <span className="text-slate-400">/ {students.length}</span>
            </div>
            <div className="h-2 min-w-[120px] flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-500"
                style={{
                  width: `${(answered.length / students.length) * 100}%`,
                }}
              />
            </div>
            <button
              onClick={finishEarly}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-bold hover:bg-white/20"
            >
              <FaFlagCheckered /> Tugatish
            </button>
          </header>

          {/* Stage */}
          <main className="relative flex min-h-0 flex-1 flex-col items-center overflow-auto p-3 sm:p-5">
            {phase === "spinning" && (
              <div className="my-auto flex flex-col items-center py-2">
                <p className="mb-5 text-center text-lg font-bold text-slate-200 sm:text-xl">
                  {spinning
                    ? "Baraban aylanmoqda…"
                    : `Barabanda ${wheelStudents.length} ta o'quvchi qoldi`}
                </p>
                <div className="relative">
                  <StudentWheel
                    students={wheelStudents}
                    mustSpin={mustSpin}
                    prizeNumber={prizeNumber}
                    onStopSpinning={handleWheelStop}
                  />
                  <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
                    <button
                      type="button"
                      onClick={spinWheel}
                      disabled={spinning}
                      className="pointer-events-auto grid h-24 w-24 place-items-center rounded-full border-[6px] border-white bg-gradient-to-br from-rose-500 to-rose-700 text-sm font-black shadow-[0_10px_30px_rgba(0,0,0,.5)] transition hover:scale-105 disabled:opacity-70 sm:h-32 sm:w-32 sm:text-lg"
                    >
                      {spinning ? (
                        <FaSpinner className="animate-spin text-3xl" />
                      ) : (
                        "AYLANTIRISH"
                      )}
                    </button>
                  </div>

                  {showWinnerOverlay && selectedStudent && (
                    <div className="absolute inset-0 z-20 grid place-items-center">
                      <div className="rounded-3xl border-4 border-amber-300 bg-slate-950/95 px-10 py-7 text-center shadow-2xl">
                        <Avatar
                          id={selectedStudent.id}
                          name={selectedStudent.name}
                          size="mx-auto h-20 w-20 text-3xl"
                        />
                        <b className="mt-3 block text-4xl sm:text-5xl">
                          {selectedStudent.name}
                        </b>
                        <p className="mt-1 text-amber-300">Navbat sizda!</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="mt-5 text-sm text-slate-400">
                  Bo'sh joy (Space) tugmasi ham barabanni aylantiradi.
                </p>
              </div>
            )}

            {phase === "question" && selectedStudent && (
              <div className="my-auto w-full max-w-6xl">
                {/* Who + timer */}
                <div className="flex items-center gap-4 rounded-2xl bg-slate-950/60 p-4">
                  <Avatar
                    id={selectedStudent.id}
                    name={selectedStudent.name}
                    size="h-16 w-16 text-2xl"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-300">Javob beradi</p>
                    <h2 className="truncate text-3xl font-black sm:text-4xl">
                      {selectedStudent.name}
                    </h2>
                  </div>
                  <div
                    className={`flex items-center gap-2 text-4xl font-black tabular-nums sm:text-5xl ${urgent ? "animate-pulse text-rose-400" : ""}`}
                  >
                    <MdTimer className="text-amber-300" />
                    {timeLeft}
                  </div>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-linear ${urgent ? "bg-rose-500" : "bg-amber-400"}`}
                    style={{ width: `${timeRatio * 100}%` }}
                  />
                </div>

                {/* Question */}
                <div className="mt-4 rounded-2xl bg-white/[0.06] p-5 sm:p-8">
                  <div className="mb-3 flex flex-wrap gap-2 text-sm font-bold">
                    <span className="rounded-full bg-sky-400/20 px-3 py-1 text-sky-100">
                      {currentQuestion.category}
                    </span>
                  </div>
                  <h3 className="text-3xl font-black leading-tight sm:text-4xl 2xl:text-5xl">
                    {currentQuestion.question}
                  </h3>
                </div>

                {/* Options */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {currentQuestion.options.map((option, idx) => {
                    const isRight = idx === currentQuestion.answerIndex;
                    const isPickedWrong =
                      questionLocked && idx === pickedOption && !isRight;
                    const state = !questionLocked
                      ? `bg-gradient-to-br ${OPTION_STYLES[idx]} hover:scale-[1.02]`
                      : isRight
                        ? "bg-emerald-500 ring-4 ring-white"
                        : isPickedWrong
                          ? "bg-rose-600"
                          : "bg-slate-700/60 opacity-40";
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => submitAnswer(idx)}
                        disabled={questionLocked}
                        className={`flex items-center gap-4 rounded-2xl px-5 py-5 text-left text-xl font-extrabold shadow-lg transition sm:text-2xl 2xl:py-7 2xl:text-3xl ${state}`}
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-black/25 text-xl">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="min-w-0">{option}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Result */}
                {result && (
                  <div
                    className={`mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-6 py-4 ${
                      result.correct
                        ? "bg-emerald-500/20 ring-1 ring-emerald-300"
                        : "bg-rose-500/20 ring-1 ring-rose-300"
                    }`}
                  >
                    <div>
                      <p className="text-2xl font-black">{result.message}</p>
                      {result.detail && (
                        <p className="mt-1 text-slate-200">{result.detail}</p>
                      )}
                      <p className="mt-1 text-sm text-slate-400">
                        {selectedStudent.name} o'yindan chiqdi.
                      </p>
                    </div>
                    <button
                      onClick={nextQuestion}
                      className="rounded-xl bg-white px-6 py-3 text-lg font-black text-slate-900 hover:bg-amber-200"
                    >
                      Keyingi savol
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      )}

      {/* ============================ FINISH ============================ */}
      {phase === "finish" && (
        <div className="mx-auto min-h-[100dvh] max-w-3xl p-4 sm:p-8">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-center shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="mb-4 flex justify-center">
              <div className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-slate-900 shadow-2xl">
                <GiPodiumWinner className="text-6xl" />
              </div>
            </div>
            <h2 className="mb-2 text-4xl font-black sm:text-5xl">
              O'yin yakunlandi
            </h2>
            <p className="mb-8 text-slate-300">
              {answered.length} ta o'quvchidan{" "}
              <b className="text-emerald-300">{correctCount} tasi</b> to'g'ri
              javob berdi.
            </p>

            {answered.length > 0 && (
              <div className="mx-auto mb-8 max-w-xl rounded-2xl bg-white/5 p-5 text-left">
                <h3 className="mb-3 font-black">Javoblar</h3>
                <div className="max-h-[40vh] space-y-2 overflow-auto pr-1">
                  {answered.map((s) => (
                    <div key={s.id} className="flex items-center gap-3">
                      <span className="w-6 text-center text-sm font-black text-slate-400">
                        {s.order}
                      </span>
                      <Avatar id={s.id} name={s.name} size="h-8 w-8 text-xs" />
                      <span className="flex-1 truncate font-bold">
                        {s.name}
                      </span>
                      {s.correct ? (
                        <FaCheck className="text-emerald-300" />
                      ) : (
                        <FaTimes className="text-rose-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => runStartCountdown(startGame)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-4 text-lg font-black text-slate-900 hover:scale-105"
              >
                <FaRedo /> Qayta o'ynash
              </button>
              <button
                onClick={resetGame}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-lg font-bold hover:bg-white/20"
              >
                <FaUsers /> Sozlamalarga qaytish
              </button>
            </div>
          </div>
        </div>
      )}

      <GameStartCountdownOverlay
        visible={countdownVisible}
        value={countdownValue}
      />
    </div>
  );
}