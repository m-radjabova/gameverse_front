
import { useCallback, useEffect, useRef, useState } from "react";
import Confetti from "react-confetti-boom";
import {
  FaArrowRotateRight,
  FaBolt,
  FaCalculator,
  FaClock,
  FaDeleteLeft,
  FaFlagCheckered,
  FaPlay,
  FaPlus,
  FaRobot,
  FaTrophy,
  FaTrash,
  FaUsers,
} from "react-icons/fa6";
import { GiRopeCoil } from "react-icons/gi";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useFinishApplause } from "../../../hooks/useFinishApplause";
import { useGameResultSubmission } from "../../../hooks/useGameResultSubmission";
import { useGameStartCountdown } from "../../../hooks/useGameStartCountdown";
import tugOfWarArenaImage from "../../../assets/tug_of_war.png";
import tugOfWarBgImage from "./tug_of_war_bg.png";
import tugOfWarMusic from "./tug_of_war_music.m4a";
import { GRADE_RANGE_OPTIONS, type GradeRange } from "../../../utils/aiGeneration";
import { generateTugOfWarProblems } from "./ai";
import useContextPro from "../../../hooks/useContextPro";
import useGameQuestions from "../../../hooks/useGameQuestions";

type Phase = "teacher" | "play" | "finish";
type Operation = "+" | "-" | "x" | "÷";
type Difficulty = "easy" | "medium" | "hard";

type TeamState = {
  id: "left" | "right";
  name: string;
  score: number;
  answer: string;
  correctAnswers: number;
  wrongAnswers: number;
  streak: number;
  lastResult: "correct" | "wrong" | null;
};

type Problem = {
  id: string;
  prompt: string;
  answer: number;
  level: Difficulty;
};

type TeacherDraft = {
  prompt: string;
  answer: string;
  level: Difficulty;
};

const TUG_OF_WAR_GAME_KEY = "tug-of-war";
const TUG_OF_WAR_RESULT_KEY = "tug-of-war-results";
const ROUND_DURATION = 180;
const WIN_THRESHOLD = 12;
const ROPE_STEP = 1;
const AI_QUESTION_COUNT_OPTIONS = [2, 4, 6, 8, 10, 12] as const;
const AI_DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Oson" },
  { value: "medium", label: "O'rtacha" },
  { value: "hard", label: "Qiyin" },
  { value: "mixed", label: "Aralash" },
] as const;
const keypadValues = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "GO"] as const;

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildProblem(index: number): Problem {
  const difficulty = index < 4 ? "easy" : index < 8 ? "medium" : "hard";
  const id = `generated-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`;

  if (difficulty === "easy") {
    const a = randomInt(2, 14);
    const b = randomInt(1, 9);
    const op: Operation = Math.random() > 0.5 ? "+" : "-";
    if (op === "-") {
      const top = Math.max(a, b);
      const bottom = Math.min(a, b);
      return { id, prompt: `${top} - ${bottom} = ?`, answer: top - bottom, level: difficulty };
    }
    return { id, prompt: `${a} + ${b} = ?`, answer: a + b, level: difficulty };
  }

  if (difficulty === "medium") {
    if (Math.random() > 0.5) {
      const a = randomInt(3, 12);
      const b = randomInt(2, 9);
      return { id, prompt: `${a} x ${b} = ?`, answer: a * b, level: difficulty };
    }

    const divisor = randomInt(2, 10);
    const quotient = randomInt(2, 10);
    return { id, prompt: `${divisor * quotient} ÷ ${divisor} = ?`, answer: quotient, level: difficulty };
  }

  const mode = randomInt(0, 2);
  if (mode === 0) {
    const a = randomInt(12, 40);
    const b = randomInt(4, 18);
    return { id, prompt: `${a} + ${b} = ?`, answer: a + b, level: difficulty };
  }
  if (mode === 1) {
    const a = randomInt(6, 14);
    const b = randomInt(6, 14);
    return { id, prompt: `${a} x ${b} = ?`, answer: a * b, level: difficulty };
  }
  const divisor = randomInt(3, 12);
  const quotient = randomInt(4, 12);
  return { id, prompt: `${divisor * quotient} ÷ ${divisor} = ?`, answer: quotient, level: difficulty };
}

function createProblems(count: number) {
  return Array.from({ length: count }, (_, index) => buildProblem(index));
}

function shuffleArray<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

function createProblemQueue(source: Problem[], count: number) {
  if (source.length === 0) {
    return createProblems(count);
  }

  const queue: Problem[] = [];
  while (queue.length < count) {
    queue.push(...shuffleArray(source));
  }

  return queue.slice(0, count);
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function getWinner(teams: TeamState[]) {
  if (teams[0].score === teams[1].score) {
    return null;
  }
  return teams[0].score > teams[1].score ? teams[0] : teams[1];
}

function getHandTouchThreshold(totalRounds: number) {
  return Math.max(6, Math.ceil(totalRounds * 0.75));
}

function getLineTouchWinner(ropePosition: number, handTouchThreshold: number) {
  if (ropePosition >= handTouchThreshold) {
    return "left";
  }
  if (ropePosition <= -handTouchThreshold) {
    return "right";
  }
  return null;
}

function TugOfWar() {
  const skipInitialRemoteSaveRef = useRef(true);
  const tugMusicRef = useRef<HTMLAudioElement | null>(null);
  const {
    state: { user },
  } = useContextPro();
  const { loadQuestions, saveQuestionsForGame } = useGameQuestions<Problem>({ teacherId: user?.id });
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();
  const [phase, setPhase] = useState<Phase>("teacher");
  const [totalRounds, setTotalRounds] = useState(12);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [ropePosition, setRopePosition] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [winnerId, setWinnerId] = useState<"left" | "right" | "draw" | null>(null);
  const [arenaImpactSide, setArenaImpactSide] = useState<"left" | "right" | null>(null);
  const initialProblem = buildProblem(0);
  const [currentProblems, setCurrentProblems] = useState<Record<"left" | "right", Problem>>({
    left: initialProblem,
    right: initialProblem,
  });
  const [problemQueue, setProblemQueue] = useState<Problem[]>(() => createProblems(16));
  const [queueIndex, setQueueIndex] = useState(1);
  const [questionBank, setQuestionBank] = useState<Problem[]>([]);
  const [teacherDraft, setTeacherDraft] = useState<TeacherDraft>({
    prompt: "",
    answer: "",
    level: "medium",
  });
  const [teacherMessage, setTeacherMessage] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [aiGradeRange, setAiGradeRange] = useState<GradeRange>("none");
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(4);
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("medium");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const [teams, setTeams] = useState<TeamState[]>([
    {
      id: "left",
      name: "Ko'k jamoa",
      score: 0,
      answer: "",
      correctAnswers: 0,
      wrongAnswers: 0,
      streak: 0,
      lastResult: null,
    },
    {
      id: "right",
      name: "Qizil jamoa",
      score: 0,
      answer: "",
      correctAnswers: 0,
      wrongAnswers: 0,
      streak: 0,
      lastResult: null,
    },
  ]);
  const hasGeminiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY?.trim());
  const handTouchThreshold = getHandTouchThreshold(totalRounds);

  const stopTugMusic = useCallback(() => {
    if (!tugMusicRef.current) return;
    tugMusicRef.current.pause();
    tugMusicRef.current.currentTime = 0;
  }, []);

  const playTugMusic = useCallback(() => {
    if (!tugMusicRef.current && typeof Audio !== "undefined") {
      tugMusicRef.current = new Audio(tugOfWarMusic);
      tugMusicRef.current.loop = true;
      tugMusicRef.current.volume = 0.42;
    }

    if (!tugMusicRef.current) return;
    tugMusicRef.current.currentTime = 0;
    void tugMusicRef.current.play().catch(() => undefined);
  }, []);

  const finishGame = useCallback((forcedWinner?: "left" | "right" | "draw") => {
    setPhase("finish");
    setShowConfetti(true);
    const nextWinner =
      forcedWinner ??
      (getLineTouchWinner(ropePosition, handTouchThreshold) ?? getWinner(teams)?.id ?? "draw");
    setWinnerId(nextWinner);
  }, [handTouchThreshold, ropePosition, teams]);

  useEffect(() => {
    if (typeof Audio === "undefined") return;

    const audio = new Audio(tugOfWarMusic);
    audio.loop = true;
    audio.volume = 0.42;
    tugMusicRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
      tugMusicRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (phase === "finish" || phase === "teacher") {
      stopTugMusic();
    }
  }, [phase, stopTugMusic]);

  useFinishApplause(phase === "finish");
  useGameResultSubmission(
    phase === "finish",
    TUG_OF_WAR_RESULT_KEY,
    teams.map((team) => ({
      participant_name: team.name,
      participant_mode: "2 jamoa",
      score: team.score,
      metadata: {
        winner: winnerId === team.id,
        correct_answers: team.correctAnswers,
        wrong_answers: team.wrongAnswers,
        streak: team.streak,
      },
    })),
  );

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!user?.id) {
        setRemoteLoaded(true);
        return;
      }

      const remoteQuestions = await loadQuestions(TUG_OF_WAR_GAME_KEY, {
        force: true,
        teacherScoped: true,
      });
      if (!alive) return;
      if (remoteQuestions.length > 0) {
        setQuestionBank(remoteQuestions);
        setTeacherMessage("Saqlangan savollar yuklandi.");
      }
      setRemoteLoaded(true);
    })();

    return () => {
      alive = false;
    };
  }, [loadQuestions, user?.id]);

  useEffect(() => {
    if (!remoteLoaded) return;
    if (skipInitialRemoteSaveRef.current) {
      skipInitialRemoteSaveRef.current = false;
      return;
    }

    if (!user?.id) {
      return;
    }

    const timer = window.setTimeout(() => {
      void saveQuestionsForGame(TUG_OF_WAR_GAME_KEY, questionBank, true);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [questionBank, remoteLoaded, saveQuestionsForGame, user?.id]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!arenaImpactSide) return;
    const timer = window.setTimeout(() => setArenaImpactSide(null), 260);
    return () => window.clearTimeout(timer);
  }, [arenaImpactSide]);

  useEffect(() => {
    if (phase !== "play") return;
    if (timeLeft <= 0) {
      finishGame();
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [finishGame, phase, timeLeft]);

  function pushToast(message: string) {
    setToast(message);
  }

  function takeNextProblem(nextIndex: number) {
    if (nextIndex >= problemQueue.length) {
      const extra = questionBank.length > 0 ? createProblemQueue(questionBank, 12) : createProblems(12);
      setProblemQueue((prev) => [...prev, ...extra]);
      return extra[0];
    }
    return problemQueue[nextIndex];
  }

  function startGameNow() {
    const freshQueue =
      questionBank.length > 0
        ? createProblemQueue(questionBank, Math.max(16, totalRounds * 2 + 4))
        : createProblems(Math.max(16, totalRounds * 2 + 4));
    setProblemQueue(freshQueue);
    setQueueIndex(1);
    setCurrentProblems({ left: freshQueue[0], right: freshQueue[0] });
    setTeams((prev) =>
      prev.map((team) => ({
        ...team,
        score: 0,
        answer: "",
        correctAnswers: 0,
        wrongAnswers: 0,
        streak: 0,
        lastResult: null,
      })),
    );
    setTimeLeft(ROUND_DURATION);
    setRopePosition(0);
    setWinnerId(null);
    setShowConfetti(false);
    setPhase("play");
    playTugMusic();
    pushToast("Arqon tortish boshlandi");
  }

  function handleStartGame() {
    setTeacherMessage("");
    runStartCountdown(startGameNow);
  }

  function setTeamName(teamId: "left" | "right", name: string) {
    setTeams((prev) => prev.map((team) => (team.id === teamId ? { ...team, name } : team)));
  }

  function addTeacherProblem() {
    if (!user?.id) {
      setTeacherMessage("Backendga saqlash uchun teacher akkaunt bilan login qiling.");
      return;
    }

    const prompt = teacherDraft.prompt.trim();
    const answer = Number(teacherDraft.answer);

    if (!prompt || !Number.isFinite(answer)) {
      setTeacherMessage("Savol va to'g'ri javobni to'ldiring.");
      return;
    }

    const nextProblem: Problem = {
      id: `teacher-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      prompt,
      answer,
      level: teacherDraft.level,
    };

    setQuestionBank((prev) => [...prev, nextProblem]);
    setTeacherDraft({ prompt: "", answer: "", level: "medium" });
    setTeacherMessage("Savol qo'shildi va saqlashga yuborildi.");
  }

  function removeTeacherProblem(problemId: string) {
    if (!user?.id) {
      setTeacherMessage("Backendga saqlash uchun teacher akkaunt bilan login qiling.");
      return;
    }

    setQuestionBank((prev) => prev.filter((problem) => problem.id !== problemId));
    setTeacherMessage("Savol o'chirildi.");
  }

  async function handleGenerateAiProblems() {
    if (isGeneratingAi) return;

    if (!user?.id) {
      setTeacherMessage("AI savollarni backendga saqlash uchun teacher akkaunt bilan login qiling.");
      return;
    }

    setTeacherMessage("");
    setIsGeneratingAi(true);

    try {
      const generated = await generateTugOfWarProblems({
        topic: aiTopic,
        count: aiQuestionCount,
        difficulty: aiDifficulty,
        gradeRange: aiGradeRange,
      });

      const stamped = generated.map((problem, index) => ({
        ...problem,
        id: `ai-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      }));

      setQuestionBank((prev) => [...prev, ...stamped]);
      setTeacherMessage(`AI bilan ${stamped.length} ta savol qo'shildi.`);
    } catch (error) {
      setTeacherMessage(error instanceof Error ? error.message : "AI savollarini yaratib bo'lmadi.");
    } finally {
      setIsGeneratingAi(false);
    }
  }

  function updateAnswer(teamId: "left" | "right", value: string) {
    setTeams((prev) =>
      prev.map((team) => {
        if (team.id !== teamId) return team;
        if (value === "C") {
          return { ...team, answer: "" };
        }
        if (value === "GO") {
          return team;
        }
        if (team.answer.length >= 4) return team;
        return { ...team, answer: `${team.answer}${value}` };
      }),
    );
  }

  function backspace(teamId: "left" | "right") {
    setTeams((prev) =>
      prev.map((team) => (team.id === teamId ? { ...team, answer: team.answer.slice(0, -1) } : team)),
    );
  }

  function submitAnswer(teamId: "left" | "right") {
    if (phase !== "play") return;

    const team = teams.find((item) => item.id === teamId);
    if (!team || !team.answer) {
      pushToast("Avval javob kiriting");
      return;
    }

    const problem = currentProblems[teamId];
    const numericAnswer = Number(team.answer);
    const isCorrect = numericAnswer === problem.answer;
    const ropeDelta = isCorrect ? (teamId === "left" ? ROPE_STEP : -ROPE_STEP) : 0;
    const nextRopePosition = Math.max(-WIN_THRESHOLD, Math.min(WIN_THRESHOLD, ropePosition + ropeDelta));
    const nextProblemIndex = queueIndex;

    if (isCorrect) {
      const replacementProblem = takeNextProblem(nextProblemIndex);
      setQueueIndex((prev) => prev + 1);
      setCurrentProblems((prev) => ({ ...prev, [teamId]: replacementProblem }));
      setRopePosition(nextRopePosition);
    }

    setTeams((prev) =>
      prev.map((item) => {
        if (item.id === teamId) {
          return {
            ...item,
            score: item.score + (isCorrect ? 1 : 0),
            answer: "",
            correctAnswers: item.correctAnswers + (isCorrect ? 1 : 0),
            wrongAnswers: item.wrongAnswers + (isCorrect ? 0 : 1),
            streak: isCorrect ? item.streak + 1 : 0,
            lastResult: isCorrect ? "correct" : "wrong",
          };
        }

        return item;
      }),
    );

    pushToast(isCorrect ? `${team.name} arqonni tortdi` : `${team.name} imkoniyatni boy berdi`);
    if (isCorrect) {
      setArenaImpactSide(teamId);
    }

    if (isCorrect) {
      const teamScore = team.score + 1;
      if (teamScore >= totalRounds || getLineTouchWinner(nextRopePosition, handTouchThreshold)) {
        finishGame(teamId);
        return;
      }
    }
  }

  function resetGame() {
    stopTugMusic();
    setPhase("teacher");
    setShowConfetti(false);
    setWinnerId(null);
    setTimeLeft(ROUND_DURATION);
    setRopePosition(0);
    setQueueIndex(1);
    const resetProblem = buildProblem(0);
    setCurrentProblems({ left: resetProblem, right: resetProblem });
    setTeams((prev) =>
      prev.map((team, index) => ({
        ...team,
        name: index === 0 ? "Ko'k jamoa" : "Qizil jamoa",
        score: 0,
        answer: "",
        correctAnswers: 0,
        wrongAnswers: 0,
        streak: 0,
        lastResult: null,
      })),
    );
  }

  const winnerTeam = winnerId === "draw" || !winnerId ? null : teams.find((team) => team.id === winnerId) ?? null;
  const leftTeam = teams[0];
  const rightTeam = teams[1];
  const arenaShiftX = (-ropePosition / WIN_THRESHOLD) * 70;
  const arenaImpactOffset =
    arenaImpactSide === "left" ? 12 : arenaImpactSide === "right" ? -12 : 0;

  function renderTeamPanel(team: TeamState, index: number) {
    const problem = currentProblems[team.id];
    const teamColor =
      index === 0
        ? {
            panel: "from-blue-700 to-indigo-800",
            soft: "from-blue-500/12 to-cyan-400/10",
            text: "text-blue-200",
            border: "border-blue-400/25",
            button: "from-blue-500 to-cyan-500",
          }
        : {
            panel: "from-red-600 to-orange-700",
            soft: "from-orange-500/12 to-rose-400/10",
            text: "text-orange-200",
            border: "border-orange-400/25",
            button: "from-orange-500 to-rose-500",
          };

    return (
      <div
        key={team.id}
        className={`rounded-[32px] border ${teamColor.border} bg-slate-950/45 p-4 shadow-[0_20px_60px_rgba(2,6,23,0.28)] backdrop-blur-xl md:p-5`}
      >
        <div className={`rounded-[26px] bg-gradient-to-r ${teamColor.panel} px-5 py-5 text-white shadow-xl`}>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-white/70">{team.name}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <h2 className="text-3xl font-black">{problem.prompt}</h2>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-[0.18em]">
              {problem.level}
            </span>
          </div>
        </div>

        <div className={`mt-4 rounded-[24px] border ${teamColor.border} bg-gradient-to-br ${teamColor.soft} p-4`}>
          <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-4 text-center shadow-inner shadow-black/20">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">Javob</p>
            <div className="mt-2 min-h-[40px] text-3xl font-black tracking-[0.2em] text-white">
              {team.answer || "_"}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {keypadValues.map((value) => {
              const isGo = value === "GO";
              const isClear = value === "C";
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    if (phase === "finish") return;
                    if (isGo) {
                      submitAnswer(team.id);
                      return;
                    }
                    updateAnswer(team.id, value);
                  }}
                  className={`rounded-[22px] px-4 py-4 text-xl font-black shadow-sm transition hover:scale-[1.02] ${
                    isGo
                      ? `bg-gradient-to-r ${teamColor.button} text-white`
                      : isClear
                        ? "bg-[#f7685b] text-white"
                        : "border border-white/10 bg-slate-900/70 text-slate-100"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => backspace(team.id)}
              className="flex-1 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm font-black text-slate-100"
            >
              <span className="inline-flex items-center gap-2">
                <FaDeleteLeft />
                O'chirish
              </span>
            </button>
            <button
              type="button"
              onClick={() => submitAnswer(team.id)}
              className={`flex-1 rounded-2xl bg-gradient-to-r ${teamColor.button} px-4 py-3 text-sm font-black text-white shadow-lg`}
            >
              Tasdiqlash
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/65 p-4 text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Ball</p>
            <p className={`mt-2 text-2xl font-black ${teamColor.text}`}>{team.score}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/65 p-4 text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">To'g'ri</p>
            <p className="mt-2 text-2xl font-black text-emerald-400">{team.correctAnswers}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/65 p-4 text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Xato</p>
            <p className="mt-2 text-2xl font-black text-rose-400">{team.wrongAnswers}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0b1020] via-[#16213d] to-[#3a1f1a] text-white">
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-50">
          <Confetti mode="boom" particleCount={220} effectCount={2} x={0.5} y={0.25} />
        </div>
      )}

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-12 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute -right-24 bottom-16 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(226,232,240,0.14) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {toast && (
        <div className="fixed left-1/2 top-5 z-50 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2">
          <div className="rounded-full border border-white/10 bg-slate-900/85 px-5 py-3 text-center text-sm font-bold text-slate-100 shadow-xl backdrop-blur-md">
            {toast}
          </div>
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-[1720px] px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6">
        <div className="mb-4 flex flex-col gap-3 rounded-[28px] border border-white/10 bg-slate-950/45 p-4 shadow-[0_20px_60px_rgba(2,6,23,0.28)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.26em] text-slate-400">Tug Of War</p>
            <h1 className="mt-1 text-2xl font-black text-white md:text-3xl">Jamoaviy matematik arqon tortish</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="rounded-xl bg-blue-500/15 p-2 text-blue-300">
                <FaClock />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Timer</p>
                <p className="text-sm font-black text-white">{formatTime(timeLeft)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="rounded-xl bg-orange-500/15 p-2 text-orange-300">
                <GiRopeCoil />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Goal</p>
                <p className="text-sm font-black text-white">{totalRounds} ball yoki qo'l chiziqqa tegishi</p>
              </div>
            </div>
          </div>
        </div>

        {phase === "teacher" && (
          <div>
            <div className="rounded-[30px] border border-white/10 bg-slate-950/45 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.28)] backdrop-blur-xl md:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-orange-500 p-3 text-white shadow-lg">
                  <FaUsers />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Teacher Panel</h2>
                  <p className="text-sm text-slate-300">Jamoa nomlari, AI generator va custom savollar shu yerdan boshqariladi.</p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {teams.map((team, index) => (
                      <div
                        key={team.id}
                        className={`rounded-[28px] border p-5 ${
                          index === 0
                            ? "border-blue-400/25 bg-gradient-to-br from-blue-500/10 to-cyan-400/10"
                            : "border-orange-400/25 bg-gradient-to-br from-orange-500/10 to-rose-400/10"
                        }`}
                      >
                        <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-slate-300">Jamoa {index + 1}</p>
                        <input
                          value={team.name}
                          onChange={(event) => setTeamName(team.id, event.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-base font-bold text-white outline-none ring-0 placeholder:text-slate-500 focus:border-white/20"
                          placeholder={index === 0 ? "Ko'k jamoa" : "Qizil jamoa"}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[28px] border border-cyan-400/20 bg-cyan-500/8 p-5">
                    <div className="mb-4 flex items-center gap-2 text-cyan-200">
                      <FaRobot />
                      <p className="text-sm font-black uppercase tracking-[0.18em]">AI Savol Generator</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <textarea
                        value={aiTopic}
                        onChange={(event) => setAiTopic(event.target.value)}
                        className="min-h-24 rounded-2xl border border-cyan-400/20 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 sm:col-span-2"
                        placeholder="Mavzu: qo'shish-ayirish, ko'paytirish, bo'lish, kasrlar..."
                      />
                      <select
                        value={aiGradeRange}
                        onChange={(event) => setAiGradeRange(event.target.value as GradeRange)}
                        className="rounded-2xl border border-cyan-400/20 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none"
                      >
                        {GRADE_RANGE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value} className="bg-slate-950">
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={aiDifficulty}
                        onChange={(event) => setAiDifficulty(event.target.value as "easy" | "medium" | "hard" | "mixed")}
                        className="rounded-2xl border border-cyan-400/20 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none"
                      >
                        {AI_DIFFICULTY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value} className="bg-slate-950">
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className="flex flex-wrap gap-2 sm:col-span-2">
                        {AI_QUESTION_COUNT_OPTIONS.map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => setAiQuestionCount(count)}
                            className={`rounded-full px-4 py-2 text-xs font-black transition ${
                              aiQuestionCount === count
                                ? "bg-cyan-400 text-slate-950"
                                : "border border-white/10 bg-slate-900/70 text-slate-200"
                            }`}
                          >
                            {count} ta
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleGenerateAiProblems()}
                      disabled={!hasGeminiKey || isGeneratingAi}
                      className="mt-4 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isGeneratingAi ? `${aiQuestionCount} ta yaratilmoqda...` : `AI bilan ${aiQuestionCount} ta savol qo'shish`}
                    </button>
                    <p className="mt-3 text-xs leading-5 text-cyan-100/75">
                      AI yaratgan misollar hozirgi savollar bankiga qo'shiladi. Mavzu va sinf oralig'i berilsa, ular shu darajaga moslashadi.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                    <div className="mb-4 flex items-center gap-2 text-slate-100">
                      <FaPlus />
                      <p className="text-sm font-black uppercase tracking-[0.18em]">Custom Savol Qo'shish</p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        value={teacherDraft.prompt}
                        onChange={(event) => setTeacherDraft((prev) => ({ ...prev, prompt: event.target.value }))}
                        className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 sm:col-span-2"
                        placeholder="Savol (masalan: 24 ÷ 6 = ?)"
                      />
                      <input
                        value={teacherDraft.answer}
                        onChange={(event) => setTeacherDraft((prev) => ({ ...prev, answer: event.target.value }))}
                        className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                        placeholder="To'g'ri javob"
                        type="number"
                      />
                      <select
                        value={teacherDraft.level}
                        onChange={(event) => setTeacherDraft((prev) => ({ ...prev, level: event.target.value as Difficulty }))}
                        className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none"
                      >
                        <option value="easy" className="bg-slate-950">Oson</option>
                        <option value="medium" className="bg-slate-950">O'rtacha</option>
                        <option value="hard" className="bg-slate-950">Qiyin</option>
                      </select>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={addTeacherProblem}
                        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:scale-[1.01]"
                      >
                        <FaPlus />
                        Savol qo'shish
                      </button>
                      <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm font-bold text-slate-200">
                        Savollar soni: {questionBank.length}
                      </div>
                    </div>

                    <p
                      className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                        teacherMessage
                          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                          : "border-white/10 bg-slate-900/60 text-slate-300"
                      }`}
                    >
                      {teacherMessage || "O'qituvchi shu joydan savol qo'shishi, AI bilan yaratishi va keyin o'yinni boshlashi mumkin."}
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-200">Savollar Banki</p>
                      <span className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1 text-xs font-black text-slate-300">
                        {questionBank.length} ta
                      </span>
                    </div>

                    <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
                      {questionBank.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 px-4 py-6 text-center text-sm text-slate-400">
                          Hozircha custom savol yo'q. Xohlasangiz AI bilan yarating yoki qo'lda qo'shing.
                        </div>
                      ) : (
                        questionBank.map((problem, index) => (
                          <div key={problem.id} className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3">
                            <div className="min-w-0">
                              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">#{index + 1} • {problem.level}</p>
                              <p className="mt-1 text-sm font-bold text-white">{problem.prompt}</p>
                              <p className="mt-1 text-xs text-slate-400">Javob: {problem.answer}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeTeacherProblem(problem.id)}
                              className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-2 text-rose-300 transition hover:bg-rose-500/20"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-slate-400">Round limit</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[8, 12, 16].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setTotalRounds(value)}
                        className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                          totalRounds === value
                            ? "bg-gradient-to-r from-blue-600 to-orange-500 text-white shadow-lg"
                            : "border border-white/10 bg-slate-900/70 text-slate-100"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { icon: FaCalculator, title: "Matematika", desc: "Qo'shish, ayirish, ko'paytirish va bo'lish" },
                      { icon: FaBolt, title: "Tezlik", desc: "Har ikki jamoa bir vaqtda javob beradi" },
                      { icon: FaFlagCheckered, title: "Maqsad", desc: "Arqonni o'z tomonga tortib ustunlik olish" },
                    ].map((item) => (
                      <div key={item.title} className="rounded-3xl border border-white/10 bg-slate-900/65 p-4">
                        <div className="mb-3 inline-flex rounded-2xl bg-white/10 p-3 text-slate-100">
                          <item.icon />
                        </div>
                        <h3 className="text-sm font-black text-white">{item.title}</h3>
                        <p className="mt-2 text-xs leading-5 text-slate-300">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartGame}
                className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 via-slate-700 to-orange-500 px-6 py-4 text-sm font-black text-white shadow-[0_18px_45px_rgba(37,99,235,0.28)] transition hover:scale-[1.01]"
              >
                <FaPlay />
                O'yinni boshlash
              </button>
            </div>
          </div>
        )}

        {phase !== "teacher" && (
          <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr_1fr]">
            {renderTeamPanel(leftTeam, 0)}

            <div className="rounded-[32px] border border-white/10 bg-slate-950/45 p-4 shadow-[0_20px_60px_rgba(2,6,23,0.28)] backdrop-blur-xl md:p-5 xl:order-none">
              <div className="text-center">
                <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-slate-200 shadow-sm">
                  <FaClock className="text-slate-300" />
                  {formatTime(timeLeft)}
                </div>
                <h2 className="mt-5 text-3xl font-black text-white md:text-4xl">Jamoaviy musobaqa</h2>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <span className="rounded-full bg-blue-700 px-4 py-2 text-sm font-black text-white">
                    {teams[0].name}: {teams[0].score} ball
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="rounded-full bg-red-600 px-4 py-2 text-sm font-black text-white">
                    {teams[1].name}: {teams[1].score} ball
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-5">
                <div
                  className="relative h-[340px] overflow-hidden rounded-[28px] bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${tugOfWarBgImage})` }}
                >
                  <div className="pointer-events-none absolute left-1/2 top-4 bottom-4 z-10 w-px -translate-x-1/2 border-l-2 border-dashed border-slate-300" />
                  <img
                    src={tugOfWarArenaImage}
                    alt="Tug of war arena"
                    className="absolute left-1/2 top-[90%] z-0 max-h-[82%] w-[92%] max-w-[92%] -translate-y-1/2 object-contain transition-transform duration-500 ease-out"
                    style={{
                      transform: `translate(calc(-50% + ${arenaShiftX + arenaImpactOffset}px), -50%)`,
                    }}
                  />
                </div>

                <p className="mt-5 text-center text-lg font-medium text-slate-300">
                  Arqonni tortish uchun savollarga to'g'ri javob bering
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={resetGame}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-3 text-sm font-black text-slate-100"
                >
                  <FaArrowRotateRight />
                  Qayta sozlash
                </button>
              </div>
            </div>

            {renderTeamPanel(rightTeam, 1)}
          </div>
        )}

        {phase === "finish" && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
            <div className="relative max-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-auto rounded-[32px] border border-white/15 bg-gradient-to-br from-[#1f2f4a] via-[#21324d] to-[#43291f] p-6 text-center shadow-[0_24px_70px_rgba(15,23,42,0.4)] md:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(249,115,22,0.16),transparent_28%)]" />

              <div className="relative flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-yellow-400/25 blur-md" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-xl shadow-orange-500/30">
                    <FaTrophy className="text-4xl text-white" />
                  </div>
                </div>
              </div>

              <div className="relative mt-6">
                <p className="text-xs font-black uppercase tracking-[0.26em] text-slate-300/80">Final result</p>
                <h2 className="mt-2 text-4xl font-black text-white md:text-5xl">
                  {winnerId === "draw" ? "DURRANG!" : `${winnerTeam?.name ?? "Jamoa"} G'OLIB!`}
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-200/80 md:text-base">
                  {winnerId === "draw"
                    ? "Vaqt tugadi va ikki jamoa teng natija bilan o'yinni yakunladi."
                    : "To'g'ri javoblar seriyasi arqonni o'z tomonga tortib, yakuniy g'alabani olib keldi."}
                </p>
              </div>

              <div className="relative mx-auto mt-8 max-w-3xl rounded-[28px] border border-white/10 bg-black/20 p-4 backdrop-blur-md md:p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {teams.map((team, index) => (
                    <div
                      key={team.id}
                      className={`rounded-[24px] border p-5 text-left ${
                        index === 0
                          ? "border-blue-400/30 bg-blue-500/10"
                          : "border-orange-400/30 bg-orange-500/10"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-300/70">Jamoa</p>
                          <h3 className="mt-1 text-2xl font-black text-white">{team.name}</h3>
                        </div>
                        {winnerId === team.id && (
                          <div className="rounded-full border border-yellow-300/30 bg-yellow-400/15 px-4 py-2 text-sm font-black text-yellow-200">
                            G'olib
                          </div>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300/70">Ball</p>
                          <p className="mt-2 text-2xl font-black text-white">{team.score}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300/70">To'g'ri</p>
                          <p className="mt-2 text-2xl font-black text-emerald-300">{team.correctAnswers}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-center">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300/70">Xato</p>
                          <p className="mt-2 text-2xl font-black text-rose-300">{team.wrongAnswers}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mt-8 flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={resetGame}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-orange-500 px-6 py-3 text-sm font-black text-white shadow-xl shadow-orange-500/20 transition hover:scale-[1.02]"
                >
                  <FaArrowRotateRight />
                  Qayta o'ynash
                </button>
                <button
                  type="button"
                  onClick={() => setPhase("teacher")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-6 py-3 text-sm font-black text-white/90 backdrop-blur-sm transition hover:bg-white/15"
                >
                  <FaUsers />
                  Sozlamalar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />
    </div>
  );
}

export default TugOfWar;
