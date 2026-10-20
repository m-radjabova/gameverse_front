import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaCrown,
  FaMedal,
  FaPlus,
  FaSpinner,
  FaStar,
  FaUserMinus,
  FaUsers,
  FaRocket,
  FaVolumeUp,
  FaVolumeMute,
  FaCheck,
  FaFire,
  FaFlagCheckered,
  FaRedo,
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
/** Time bonus: up to +50% of base points for an instant answer. */
const TIME_BONUS_RATIO = 0.5;
/** Streak bonus: +10% of base points per consecutive correct answer, up to +50%. */
const STREAK_STEP_RATIO = 0.1;
const STREAK_MAX_STEPS = 5;

type Player = Student & { streak: number; correct: number; asked: number };

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

const roundTo10 = (n: number) => Math.round(n / 10) * 10;

/** Real-game scoring: base + speed bonus + streak bonus. Wrong/timeout = 0, streak resets. */
function calcScore(
  base: number,
  timeLeft: number,
  limit: number,
  newStreak: number,
) {
  const speed = roundTo10(
    base * TIME_BONUS_RATIO * Math.max(0, Math.min(1, timeLeft / limit)),
  );
  const streak =
    Math.min(Math.max(newStreak - 1, 0), STREAK_MAX_STEPS) *
    roundTo10(base * STREAK_STEP_RATIO);
  return { base, speed, streak, total: base + speed + streak };
}

/** Make sure every student gets at least one turn: repeat the question list if it is shorter. */
function buildQueue(questions: Question[], studentCount: number) {
  const need = Math.max(studentCount, questions.length);
  const queue: Question[] = [];
  while (queue.length < need) queue.push(...shuffle(questions));
  return queue.slice(0, need);
}

const getDifficultyQuestions = (list: Question[]) => {
  const difficulty = getGameQuestionDifficulty("wheel-of-fortune");
  return list.filter(
    (question) => !question.difficulty || question.difficulty === difficulty,
  );
};

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

  // Fair draw: `pool` = students who have NOT yet been asked in the current round.
  const [pool, setPool] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const [wheelStudents, setWheelStudents] = useState<Player[]>([]);

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
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    [
      musicRef.current,
      spinSoundRef.current,
      correctSoundRef.current,
      wrongSoundRef.current,
    ].forEach((a) => {
      if (a) a.muted = !soundEnabled;
    });
  }, [soundEnabled]);

  useEffect(() => {
    if (phase === "finish" || phase === "setup") musicRef.current?.pause();
  }, [phase]);

  const playSound = (audio: HTMLAudioElement | null, restart = true) => {
    if (!audio || !soundEnabled) return;
    if (restart) audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  };

  /* ---------------------------- derived ---------------------------- */
  const currentQuestion = activeQuestions[currentQuestionIndex];
  const sortedStudents = useMemo(
    () => [...students].sort((a, b) => b.score - a.score),
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
  const waitingCount = pool.length;

  /* ---------------------------- load questions ---------------------------- */
  
  /* ---------------------------- load teacher questions ---------------------------- */
  useEffect(() => {
    if (isUserLoading) return;

    let alive = true;

    const loadQuestions = async () => {
      try {
        // Teacher tizimga kirmagan bo'lsa, demo savollardan foydalanamiz.
        if (!user?.id) {
          if (alive) {
            setQuestions(getDifficultyQuestions(SAMPLE_QUESTIONS));
          }
          return;
        }

        const remote = await fetchGameQuestionsByTeacher<Question>(
          WHEEL_OF_FORTUNE_GAME_KEY,
          user.id,
        );

        if (!alive) return;

        // Teacher savollari mavjud bo'lsa, faqat shu savollar ishlatiladi.
        // Bo'sh bo'lsa, bo'sh ro'yxat qoladi — demo savollar qo'shilmaydi.
        const teacherQuestions = normalizeQuestions(remote ?? []);
        setQuestions(teacherQuestions);
      } catch (error) {
        console.error("Teacher savollarini yuklashda xatolik:", error);

        if (alive) {
          setQuestions([]);
        }
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

  useEffect(
    () => () => {
      [timerRef, nextRef, stopRef].forEach(
        (r) => r.current && window.clearTimeout(r.current),
      );
    },
    [],
  );

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

  // Keyboard for the teacher: Space = spin, 1-4 / A-D = answer, Enter = next
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
  }, [
    phase,
    spinning,
    questionLocked,
    currentQuestion,
    selectedStudentId,
    wheelStudents,
    timeLeft,
  ]);

  const prepareWheel = (
    poolIds: string[],
    list: Player[],
    forceRound?: number,
  ) => {
    let ids = poolIds.filter((id) => list.some((s) => s.id === id));

    let nextRound = forceRound;

    // Hamma qatnashgan bo'lsa, yangi davra boshlanadi.
    if (ids.length === 0 && list.length > 0) {
      ids = list.map((s) => s.id);

      if (forceRound === undefined) {
        nextRound = round + 1;
        setToast(`🔄 ${round + 1}-davra boshlandi — hamma yana qatnashadi`);
      }
    }

    // Barabanda har bir o'quvchi faqat bir marta ko'rsatiladi.
    // Takroriy tanlanish tasodifiy aylantirish orqali yuz beradi.
    setWheelStudents(shuffle(list));

    setPool(ids);

    if (nextRound !== undefined) {
      setRound(nextRound);
    }

    setPrizeNumber(0);
  };

  /* ---------------------------- students ---------------------------- */
  const addStudent = () => {
    // Several names at once: "Ali, Vali, Hasan" or one per line
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
        score: 0,
        streak: 0,
        correct: 0,
        asked: 0,
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
  const startGame = () => {
    const fresh = students.map((s) => ({
      ...s,
      score: 0,
      streak: 0,
      correct: 0,
      asked: 0,
    }));
    setStudents(fresh);
    setActiveQuestions(buildQueue(questions, fresh.length));
    setCurrentQuestionIndex(0);
    setSelectedStudentId(null);
    setQuestionLocked(false);
    setPickedOption(null);
    setResult(null);
    setTimeLeft(0);
    setMustSpin(false);
    setSpinning(false);
    prepareWheel(
      fresh.map((s) => s.id),
      fresh,
      1,
    );
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

    playSound(musicRef.current, true);
    runStartCountdown(startGame);
  };


  const nextQuestion = () => {
    if (nextRef.current) window.clearTimeout(nextRef.current);
    setShowWinnerOverlay(false);

    if (currentQuestionIndex + 1 >= activeQuestions.length) {
      setPhase("finish");
      return;
    }
    setCurrentQuestionIndex((v) => v + 1);
    setSelectedStudentId(null);
    setQuestionLocked(false);
    setPickedOption(null);
    setResult(null);
    setTimeLeft(0);
    prepareWheel(pool, students);
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
    playSound(spinSoundRef.current);
  };

  const handleWheelStop = () => {
    const winner = wheelStudents[prizeNumber];
    if (!winner || !currentQuestion) return;

    setMustSpin(false);
    setSpinning(false);
    setSelectedStudentId(winner.id);
    setPool((p) => p.filter((id) => id !== winner.id)); // winner leaves the pool until the next round
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

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== selectedStudentId) return s;
        if (!ok) return { ...s, streak: 0, asked: s.asked + 1 };
        const sc = calcScore(
          currentQuestion.points,
          timeLeft,
          currentQuestion.timeLimit,
          s.streak + 1,
        );
        return {
          ...s,
          score: s.score + sc.total,
          streak: s.streak + 1,
          correct: s.correct + 1,
          asked: s.asked + 1,
        };
      }),
    );

    if (ok) {
      const streakNow = (selectedStudent?.streak ?? 0) + 1;
      const sc = calcScore(
        currentQuestion.points,
        timeLeft,
        currentQuestion.timeLimit,
        streakNow,
      );
      playSound(correctSoundRef.current);
      const parts = [`asosiy ${sc.base}`];
      if (sc.speed) parts.push(`tezlik +${sc.speed}`);
      if (sc.streak) parts.push(`seriya 🔥 +${sc.streak}`);
      setResult({
        correct: true,
        message: `To'g'ri! +${sc.total} ball`,
        detail: parts.join("  ·  "),
      });
    } else {
      playSound(wrongSoundRef.current);
      setResult({
        correct: false,
        message: timeout ? "Vaqt tugadi!" : "Xato!",
        detail: `To'g'ri javob: ${currentQuestion.options[currentQuestion.answerIndex]}`,
      });
    }

    nextRef.current = window.setTimeout(
      () => nextQuestionRef.current(),
      NEXT_QUESTION_DELAY,
    );
  };

  const finishEarly = () => {
    [nextRef, stopRef].forEach(
      (r) => r.current && window.clearTimeout(r.current),
    );
    setMustSpin(false);
    setSpinning(false);
    setPhase("finish");
  };

  const resetGame = () => {
    [nextRef, stopRef].forEach(
      (r) => r.current && window.clearTimeout(r.current),
    );
    musicRef.current?.pause();
    if (musicRef.current) musicRef.current.currentTime = 0;
    setStudents((prev) =>
      prev.map((s) => ({ ...s, score: 0, streak: 0, correct: 0, asked: 0 })),
    );
    setActiveQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedStudentId(null);
    setTimeLeft(0);
    setQuestionLocked(false);
    setPickedOption(null);
    setResult(null);
    setShowWinnerOverlay(false);
    setMustSpin(false);
    setSpinning(false);
    setPool([]);
    setRound(1);
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
                    Baraban tanlaydi, o'quvchi javob beradi.
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
                  Savollar navbati:{" "}
                  <b>{Math.max(students.length, questions.length)} ta</b>
                  {questions.length < students.length &&
                    " (savollar kam bo'lgani uchun takrorlanadi, hamma o'quvchiga navbat yetadi)"}
                  .
                </p>
                <p className="mt-1 text-slate-400">
                  Barabanda bir davrada har bir o'quvchi faqat 1 marta tushadi.
                  Hamma javob bergach, yangi davra boshlanadi.
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
              Savol {currentQuestionIndex + 1}{" "}
              <span className="text-slate-400">/ {activeQuestions.length}</span>
            </div>
            <div className="h-2 min-w-[120px] flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-500"
                style={{
                  width: `${(currentQuestionIndex / activeQuestions.length) * 100}%`,
                }}
              />
            </div>
            <div className="text-sm text-slate-300">
              {round}-davra · navbat kutayotgan:{" "}
              <b className="text-white">{waitingCount}</b>
            </div>
            <button
              onClick={finishEarly}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-bold hover:bg-white/20"
            >
              <FaFlagCheckered /> Tugatish
            </button>
          </header>

          <div className="grid min-h-0 flex-1 gap-4 p-3 sm:p-5 lg:grid-cols-[300px_1fr] 2xl:grid-cols-[360px_1fr]">
            {/* Leaderboard */}
            <aside className="hidden min-h-0 flex-col rounded-2xl bg-slate-950/50 p-4 lg:flex">
              <h2 className="mb-3 text-lg font-black">Reyting</h2>
              <div className="min-h-0 flex-1 space-y-1.5 overflow-auto pr-1">
                {sortedStudents.map((s, rank) => {
                  const waiting = pool.includes(s.id);
                  const current = s.id === selectedStudentId;
                  return (
                    <div
                      key={s.id}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 transition ${
                        current
                          ? "bg-amber-400/20 ring-2 ring-amber-300"
                          : "bg-white/5"
                      } ${waiting || current ? "" : "opacity-55"}`}
                    >
                      <span className="w-5 text-center text-sm font-black text-slate-300">
                        {rank + 1}
                      </span>
                      <Avatar id={s.id} name={s.name} size="h-8 w-8 text-xs" />
                      <span className="min-w-0 flex-1 truncate font-bold">
                        {s.name}
                      </span>
                      {s.streak >= 2 && (
                        <span className="flex items-center text-xs font-black text-orange-300">
                          <FaFire />
                          {s.streak}
                        </span>
                      )}
                      {!waiting && !current && (
                        <FaCheck
                          className="text-xs text-emerald-300"
                          title="Bu davrada javob berdi"
                        />
                      )}
                      <b className="w-12 text-right tabular-nums">{s.score}</b>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Xira qator: bu davrada javob bergan o'quvchi.
              </p>
            </aside>

            {/* Stage */}
            <main className="relative flex min-h-0 flex-col items-center overflow-auto">
              {phase === "spinning" && (
                <div className="my-auto flex flex-col items-center py-2">
                  <p className="mb-5 text-center text-lg font-bold text-slate-200 sm:text-xl">
                    {spinning
                      ? "Baraban aylanmoqda…"
                      : `Barabandagi ${wheelStudents.length} ta o'quvchidan biri tanlanadi`}
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
                    <div className="text-center">
                      <div
                        className={`flex items-center gap-2 text-4xl font-black tabular-nums sm:text-5xl ${urgent ? "animate-pulse text-rose-400" : ""}`}
                      >
                        <MdTimer className="text-amber-300" />
                        {timeLeft}
                      </div>
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
                      <span className="rounded-full bg-amber-400/20 px-3 py-1 text-amber-200">
                        {currentQuestion.points} ball + tezlik bonusi
                      </span>
                      {selectedStudent.streak >= 1 && (
                        <span className="flex items-center gap-1 rounded-full bg-orange-500/20 px-3 py-1 text-orange-200">
                          <FaFire /> {selectedStudent.streak} ta ketma-ket
                          to'g'ri
                        </span>
                      )}
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
        </div>
      )}

      {/* ============================ FINISH ============================ */}
      {phase === "finish" && (
        <div className="mx-auto min-h-[100dvh] max-w-5xl p-4 sm:p-8">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-center shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="mb-4 flex justify-center">
              <div className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-slate-900 shadow-2xl">
                <GiPodiumWinner className="text-6xl" />
              </div>
            </div>
            <h2 className="mb-10 text-4xl font-black sm:text-5xl">
              O'yin yakunlandi
            </h2>

            <div className="mx-auto mb-10 grid max-w-3xl grid-cols-1 items-end gap-6 md:grid-cols-3">
              {[1, 0, 2].map((pos) => {
                const s = sortedStudents[pos];
                if (!s) return <div key={pos} />;
                const cfg = [
                  {
                    label: "1-o'rin",
                    Icon: FaCrown,
                    box: "from-amber-400 to-orange-600 md:pb-14",
                    ring: "bg-amber-300",
                  },
                  {
                    label: "2-o'rin",
                    Icon: FaMedal,
                    box: "from-slate-400 to-slate-600 md:pb-8",
                    ring: "bg-slate-300",
                  },
                  {
                    label: "3-o'rin",
                    Icon: FaStar,
                    box: "from-orange-700 to-amber-900",
                    ring: "bg-orange-400",
                  },
                ][pos];
                return (
                  <div
                    key={s.id}
                    className={`relative rounded-2xl bg-gradient-to-b ${cfg.box} px-4 pb-6 pt-12 shadow-xl`}
                  >
                    <span
                      className={`absolute -top-7 left-1/2 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full text-2xl text-slate-900 ring-4 ring-white/40 ${cfg.ring}`}
                    >
                      <cfg.Icon />
                    </span>
                    <p className="font-black">{cfg.label}</p>
                    <p className="mt-1 truncate text-xl font-bold">{s.name}</p>
                    <p className="mt-1 text-4xl font-black">{s.score}</p>
                  </div>
                );
              })}
            </div>

            <div className="mx-auto mb-8 max-w-xl rounded-2xl bg-white/5 p-5 text-left">
              <h3 className="mb-3 font-black">Barcha natijalar</h3>
              <div className="max-h-[40vh] space-y-2 overflow-auto pr-1">
                {sortedStudents.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <span className="w-6 text-center text-sm font-black text-slate-400">
                      {i + 1}
                    </span>
                    <Avatar id={s.id} name={s.name} size="h-8 w-8 text-xs" />
                    <span className="flex-1 truncate font-bold">{s.name}</span>
                    <span className="text-sm text-slate-400">
                      {s.correct}/{s.asked} to'g'ri
                    </span>
                    <b className="w-16 text-right text-xl tabular-nums text-amber-300">
                      {s.score}
                    </b>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  playSound(musicRef.current, true);
                  runStartCountdown(startGame);
                }}
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
