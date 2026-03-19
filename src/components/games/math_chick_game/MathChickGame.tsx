import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Confetti from "react-confetti-boom";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useFinishApplause } from "../../../hooks/useFinishApplause";
import { useGameStartCountdown } from "../../../hooks/useGameStartCountdown";
import useGameQuestions from "../../../hooks/useGameQuestions";
import { useMeQuery } from "../../../hooks/useProfile";
import { generateGeminiJson, type GameDifficulty } from "../../../apiClient/gemini";
import cuteChickenSprite from "../../../assets/cute_chicken.svg";
import mathChickGameSound from "../../../assets/sounds/math_chick_game.m4a";
import wrongSound from "../../../assets/sounds/wrong.mp3";
import finishSound from "../../../assets/sounds/applause.mp3";
import { getAccessToken } from "../../../utils/auth";

type Difficulty = "easy" | "medium" | "hard" | "mixed";
type PlayerId = "A" | "B";
type FeedbackState = "idle" | "correct" | "wrong";
type Phase = "setup" | "game" | "finish";

type Problem = {
  question: string;
  answer: number;
  options: number[];
};

type ExplosionParticle = {
  angle: number;
  speed: number;
  size: number;
  life: number;
  color: string;
};

type ExplosionBurst = {
  player: PlayerId;
  startTime: number;
  duration: number;
  flashDuration: number;
  text: string;
  particles: ExplosionParticle[];
};

type TeacherDraft = {
  question: string;
  answer: string;
  wrongAnswers: string;
};

type PlayerMap<T> = Record<PlayerId, T>;

type ChickPalette = {
  shadow: string;
  badge: string;
  badgeGlow: string;
  badgeText: string;
};

const CANVAS_W = 1280;
const CANVAS_H = 420;
const CHICK_START_X = 96;
const CHICK_STEP = 124;
const TOTAL_STEPS = 8;
const FINISH_X = CHICK_START_X + TOTAL_STEPS * CHICK_STEP + 30;
const LANE_Y: PlayerMap<number> = { A: 152, B: 292 };
const QUESTION_PANEL_X = 370;
const QUESTION_PANEL_Y = 20;
const QUESTION_PANEL_W = 540;
const QUESTION_PANEL_H = 72;
const CHICK_SCALE = 1.18;
const ROUND_DELAY = 850;
const EXPLOSION_COLORS = ["#fef3c7", "#fde68a", "#fbbf24", "#f97316", "#ffffff"];
const MATH_CHICK_GAME_KEY = "math_chick";
const AI_COUNT_OPTIONS = [1, 3, 5, 10] as const;

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]) {
  const clone = [...arr];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function uniqueOptions(correct: number, spread: number) {
  const set = new Set<number>([correct]);
  while (set.size < 4) {
    const delta = rand(1, spread);
    const sign = Math.random() > 0.5 ? 1 : -1;
    set.add(Math.max(0, correct + delta * sign));
  }
  return shuffle([...set]);
}

function generateProblem(difficulty: Difficulty): Problem {
  const mode =
    difficulty === "mixed"
      ? (["easy", "medium", "hard"] as const)[rand(0, 2)]
      : difficulty;

  if (mode === "easy") {
    const a = rand(1, 10);
    const b = rand(1, 10);
    const isAdd = Math.random() > 0.5;
    const answer = isAdd ? a + b : Math.max(a, b) - Math.min(a, b);
    const question = isAdd
      ? `${a} + ${b} = ?`
      : `${Math.max(a, b)} - ${Math.min(a, b)} = ?`;
    return { question, answer, options: uniqueOptions(answer, 5) };
  }

  if (mode === "medium") {
    const type = rand(0, 2);
    if (type === 0) {
      const a = rand(10, 30);
      const b = rand(5, 20);
      const answer = a + b;
      return { question: `${a} + ${b} = ?`, answer, options: uniqueOptions(answer, 8) };
    }
    if (type === 1) {
      const a = rand(12, 40);
      const b = rand(4, 18);
      const answer = a - b;
      return { question: `${a} - ${b} = ?`, answer, options: uniqueOptions(answer, 8) };
    }
    const a = rand(2, 9);
    const b = rand(2, 9);
    const answer = a * b;
    return { question: `${a} x ${b} = ?`, answer, options: uniqueOptions(answer, 10) };
  }

  const type = rand(0, 3);
  if (type === 0) {
    const a = rand(20, 80);
    const b = rand(10, 45);
    const answer = a + b;
    return { question: `${a} + ${b} = ?`, answer, options: uniqueOptions(answer, 12) };
  }
  if (type === 1) {
    const a = rand(30, 90);
    const b = rand(10, 35);
    const answer = a - b;
    return { question: `${a} - ${b} = ?`, answer, options: uniqueOptions(answer, 12) };
  }
  if (type === 2) {
    const a = rand(4, 12);
    const b = rand(3, 12);
    const answer = a * b;
    return { question: `${a} x ${b} = ?`, answer, options: uniqueOptions(answer, 14) };
  }
  const divisor = rand(2, 12);
  const answer = rand(2, 12);
  const dividend = divisor * answer;
  return { question: `${dividend} / ${divisor} = ?`, answer, options: uniqueOptions(answer, 10) };
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function createExplosionBurst(player: PlayerId): ExplosionBurst {
  return {
    player,
    startTime: 0,
    duration: 720,
    flashDuration: 280,
    text: Math.random() > 0.45 ? "+10" : "\uD83D\uDCA5 BUM",
    particles: Array.from({ length: 18 }, (_, index) => ({
      angle: (Math.PI * 2 * index) / 18 + Math.random() * 0.18,
      speed: 48 + Math.random() * 88,
      size: 3 + Math.random() * 5,
      life: 0.6 + Math.random() * 0.4,
      color: EXPLOSION_COLORS[rand(0, EXPLOSION_COLORS.length - 1)],
    })),
  };
}

function drawExplosion(
  ctx: CanvasRenderingContext2D,
  burst: ExplosionBurst,
  x: number,
  y: number,
  timestamp: number,
) {
  const elapsed = timestamp - burst.startTime;
  const progress = Math.min(1, elapsed / burst.duration);
  const flashProgress = Math.min(1, elapsed / burst.flashDuration);
  const flashAlpha = 1 - flashProgress;

  if (flashAlpha > 0) {
    const flashRadius = 24 + flashProgress * 34;
    const flash = ctx.createRadialGradient(x, y - 10, 0, x, y - 10, flashRadius);
    flash.addColorStop(0, `rgba(255,255,255,${flashAlpha * 0.95})`);
    flash.addColorStop(0.3, `rgba(253,224,71,${flashAlpha * 0.65})`);
    flash.addColorStop(1, "rgba(249,115,22,0)");
    ctx.fillStyle = flash;
    ctx.beginPath();
    ctx.arc(x, y - 10, flashRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  burst.particles.forEach((particle) => {
    const particleProgress = Math.min(1, progress / particle.life);
    const distance = particle.speed * particleProgress;
    const px = x + Math.cos(particle.angle) * distance;
    const py = y - 10 + Math.sin(particle.angle) * distance - particleProgress * 14;
    const alpha = 1 - particleProgress;
    const size = particle.size * (1 - particleProgress * 0.35);

    ctx.fillStyle = particle.color;
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.beginPath();
    ctx.arc(px, py, Math.max(1.1, size), 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 1;
}

function drawFloatingScore(
  ctx: CanvasRenderingContext2D,
  burst: ExplosionBurst,
  x: number,
  y: number,
  timestamp: number,
) {
  const elapsed = timestamp - burst.startTime;
  const progress = Math.min(1, elapsed / burst.duration);
  const riseY = y - 56 - progress * 34;
  const alpha = 1 - progress;
  const scale = 0.92 + (1 - progress) * 0.18;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x + 16, riseY);
  ctx.scale(scale, scale);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(249,115,22,0.45)";
  ctx.shadowBlur = 14;
  ctx.fillStyle = "#fff7ed";
  ctx.font = "bold 24px Arial";
  ctx.fillText(burst.text, 0, 0);
  ctx.restore();
}

function drawChick(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  t: number,
  active: boolean,
  palette: ChickPalette,
  label: string,
  sprite: CanvasImageSource | null,
) {
  const phaseShift = label === "B" ? 0.75 : 0;
  const walkPhase = Math.sin(t * 4.2 + phaseShift);
  const secondaryWalk = Math.cos(t * 4.2 + phaseShift);
  const bounce = active ? Math.abs(walkPhase) * 1.4 : 0.35;
  const bodyLean = active ? walkPhase * 0.03 : 0;
  const squash = active ? 1 - Math.abs(secondaryWalk) * 0.035 : 1;

  ctx.fillStyle = palette.shadow;
  ctx.beginPath();
  ctx.ellipse(x + 8, y + 40, 34 * scale, 9.5 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(x, y + bounce);
  ctx.rotate(bodyLean);
  ctx.scale(scale * squash, scale * (2 - squash));

  if (sprite) {
    ctx.drawImage(sprite, -34, -54, 72, 78);
  } else {
    ctx.fillStyle = "#fde68a";
    ctx.beginPath();
    ctx.arc(0, -8, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.shadowColor = palette.badgeGlow;
  ctx.shadowBlur = 16;
  ctx.fillStyle = palette.badge;
  ctx.beginPath();
  ctx.roundRect(-6, -6, 21, 18, 9);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = palette.badgeText;
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 4.5, 3);
  ctx.restore();
}

function createRound(mode: Difficulty) {
  const problem = generateProblem(mode);
  return {
    problem,
    options: {
      A: shuffle(problem.options),
      B: shuffle(problem.options),
    } satisfies PlayerMap<number[]>,
  };
}

function buildTeacherProblem(draft: TeacherDraft): Problem | null {
  const question = draft.question.trim();
  const answer = Number(draft.answer.trim());

  if (!question || Number.isNaN(answer)) {
    return null;
  }

  const wrongValues = draft.wrongAnswers
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((value) => !Number.isNaN(value) && value !== answer);

  const optionSet = new Set<number>([answer, ...wrongValues]);
  if (optionSet.size < 4) {
    uniqueOptions(answer, Math.max(6, Math.abs(answer) + 4)).forEach((value) => optionSet.add(value));
  }

  return {
    question,
    answer,
    options: shuffle([...optionSet]).slice(0, 4),
  };
}

function normalizeAiDifficulty(value: unknown): "easy" | "medium" | "hard" | null {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "easy" || raw === "medium" || raw === "hard") {
    return raw;
  }
  return null;
}

async function generateMathChickAiProblems({
  topic,
  count,
  difficulty,
}: {
  topic: string;
  count: number;
  difficulty: GameDifficulty;
}): Promise<Problem[]> {
  const safeCount = Math.max(1, Math.min(10, Math.floor(count)));
  const safeTopic = topic.trim() || "boshlang'ich matematika";
  const prompt = [
    `Math Chick Game uchun ${safeCount} ta matematik savol yarating.`,
    `Mavzu: ${safeTopic}.`,
    `Qiyinlik: ${difficulty}.`,
    'Javob faqat JSON array bo\'lsin: [{"question":"12 + 8 = ?","answer":20,"options":[18,20,22,24],"difficulty":"easy"}]',
    "- Har bir elementda question, answer, options, difficulty bo'lsin.",
    "- options aniq 4 ta butun son bo'lsin.",
    "- options ichida answer ham bo'lsin.",
    "- Savollar maktab o'quvchilari uchun tushunarli bo'lsin.",
    "- Takror savollar bo'lmasin.",
    "- Matn Uzbek (Latin) tilida bo'lsin.",
  ].join("\n");

  const parsed = await generateGeminiJson(prompt);
  if (!Array.isArray(parsed)) {
    throw new Error("AI javobi ro'yxat formatida kelmadi.");
  }

  const items = parsed
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const body = item as Record<string, unknown>;
      const question = String(body.question ?? "").trim();
      const answer = Number(body.answer);
      const difficultyValue = normalizeAiDifficulty(body.difficulty) ?? "medium";
      const optionsRaw = Array.isArray(body.options) ? body.options : [];
      const optionSet = new Set<number>([answer]);

      optionsRaw.forEach((value) => {
        const numeric = Number(value);
        if (!Number.isNaN(numeric)) {
          optionSet.add(numeric);
        }
      });

      if (!question || !Number.isFinite(answer)) {
        return null;
      }

      if (optionSet.size < 4) {
        uniqueOptions(answer, difficultyValue === "easy" ? 5 : difficultyValue === "medium" ? 8 : 12).forEach(
          (value) => optionSet.add(value),
        );
      }

      return {
        question,
        answer,
        options: shuffle([...optionSet]).slice(0, 4),
      } satisfies Problem;
    })
    .filter((item): item is Problem => Boolean(item));

  if (items.length < safeCount) {
    throw new Error(`AI ${safeCount} ta emas, ${items.length} ta savol qaytardi.`);
  }

  return items.slice(0, safeCount);
}

function takeNextRound(mode: Difficulty, customProblems: Problem[]) {
  if (customProblems.length > 0) {
    const [problem, ...remaining] = customProblems;
    return {
      remaining,
      round: {
        problem,
        options: {
          A: shuffle(problem.options),
          B: shuffle(problem.options),
        } satisfies PlayerMap<number[]>,
      },
    };
  }

  return {
    remaining: customProblems,
    round: createRound(mode),
  };
}

function clampProgress(value: number) {
  return Math.max(0, Math.min(TOTAL_STEPS, value));
}

function getShortLabel(name: string, fallback: string) {
  const trimmed = name.trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, 1).toUpperCase();
}

function getTeamDisplayName(name: string, fallback: string) {
  const trimmed = name.trim();
  return trimmed || fallback;
}

export default function MathChickGame() {
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();
  const hasAuth = Boolean(getAccessToken());
  const { data: user } = useMeQuery(hasAuth);
  const {
    loadQuestions,
    saveQuestionsForGame,
    loadingByGame,
    savingByGame,
  } = useGameQuestions<Problem>({ teacherId: user?.id });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const problemRevealStartRef = useRef<number>(0);
  const roundTimerRef = useRef<number | null>(null);
  const playerProgressRef = useRef<PlayerMap<number>>({ A: 0, B: 0 });
  const winnerRef = useRef<PlayerId | null>(null);
  const lockedByRef = useRef<PlayerId | null>(null);
  const burstsRef = useRef<ExplosionBurst[]>([]);
  const customProblemsRef = useRef<Problem[]>([]);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const wrongAudioRef = useRef<HTMLAudioElement | null>(null);
  const finishAudioRef = useRef<HTMLAudioElement | null>(null);
  const loadedTeacherIdRef = useRef<string | null>(null);

  const initialRound = useMemo(() => createRound("easy"), []);

  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [phase, setPhase] = useState<Phase>("setup");
  useFinishApplause(phase === "finish");
  const [winner, setWinner] = useState<PlayerId | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentProblem, setCurrentProblem] = useState<Problem>(initialRound.problem);
  const [playerOptions, setPlayerOptions] = useState<PlayerMap<number[]>>(initialRound.options);
  const [playerScores, setPlayerScores] = useState<PlayerMap<number>>({ A: 0, B: 0 });
  const [playerProgress, setPlayerProgress] = useState<PlayerMap<number>>({ A: 0, B: 0 });
  const [selectedAnswers, setSelectedAnswers] = useState<PlayerMap<number | null>>({ A: null, B: null });
  const [feedback, setFeedback] = useState<PlayerMap<FeedbackState>>({ A: "idle", B: "idle" });
  const [roundLocked, setRoundLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState<PlayerId | null>(null);
  const [teamNames, setTeamNames] = useState<PlayerMap<string>>({ A: "Team A", B: "Team B" });
  const [teacherDraft, setTeacherDraft] = useState<TeacherDraft>({
    question: "",
    answer: "",
    wrongAnswers: "",
  });
  const [savedProblems, setSavedProblems] = useState<Problem[]>([]);
  const [customProblems, setCustomProblems] = useState<Problem[]>([]);
  const [teacherMessage, setTeacherMessage] = useState<string>("");
  const [chickSprite, setChickSprite] = useState<HTMLImageElement | null>(null);
  const [aiTopic, setAiTopic] = useState("");
  const [aiDifficulty, setAiDifficulty] = useState<GameDifficulty>("medium");
  const [aiCount, setAiCount] = useState<(typeof AI_COUNT_OPTIONS)[number]>(3);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const isLoadingSavedQuestions = loadingByGame[MATH_CHICK_GAME_KEY] ?? false;
  const isSavingSavedQuestions = savingByGame[MATH_CHICK_GAME_KEY] ?? false;

  useEffect(() => {
    playerProgressRef.current = playerProgress;
  }, [playerProgress]);

  useEffect(() => {
    customProblemsRef.current = customProblems;
  }, [customProblems]);

  useEffect(() => {
    const sprite = new Image();
    sprite.src = cuteChickenSprite;
    sprite.onload = () => setChickSprite(sprite);
  }, []);

  useEffect(() => {
    if (!hasAuth || !user?.id || loadedTeacherIdRef.current === user.id) {
      return;
    }

    loadedTeacherIdRef.current = user.id;
    void loadQuestions(MATH_CHICK_GAME_KEY, { force: true, teacherScoped: true }).then((items) => {
      setSavedProblems(items);
      setCustomProblems(items);
      customProblemsRef.current = items;
      if (items.length > 0) {
        setTeacherMessage("Saqlangan custom savollar yuklandi.");
      }
    });
  }, [hasAuth, loadQuestions, user?.id]);

  useEffect(() => {
    winnerRef.current = winner;
  }, [winner]);

  useEffect(() => {
    lockedByRef.current = lockedBy;
  }, [lockedBy]);

  useEffect(() => {
    bgAudioRef.current = new Audio(mathChickGameSound);
    bgAudioRef.current.loop = true;
    bgAudioRef.current.volume = 0.45;

    wrongAudioRef.current = new Audio(wrongSound);
    wrongAudioRef.current.volume = 0.85;

    finishAudioRef.current = new Audio(finishSound);
    finishAudioRef.current.volume = 0.9;

    return () => {
      if (roundTimerRef.current) {
        window.clearTimeout(roundTimerRef.current);
      }
      [bgAudioRef, wrongAudioRef, finishAudioRef].forEach((ref) => {
        if (!ref.current) return;
        ref.current.pause();
        ref.current.currentTime = 0;
      });
    };
  }, []);

  useEffect(() => {
    if (!showConfetti) return;
    const timer = window.setTimeout(() => setShowConfetti(false), 2200);
    return () => window.clearTimeout(timer);
  }, [showConfetti]);

  const playSfx = useCallback((ref: React.RefObject<HTMLAudioElement | null>) => {
    const audio = ref.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }, []);

  const stopAudio = useCallback((ref: React.RefObject<HTMLAudioElement | null>) => {
    const audio = ref.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  const scheduleNextRound = useCallback((mode: Difficulty) => {
    if (roundTimerRef.current) {
      window.clearTimeout(roundTimerRef.current);
    }

    roundTimerRef.current = window.setTimeout(() => {
      if (winnerRef.current) {
        return;
      }
      const next = takeNextRound(mode, customProblemsRef.current);
      customProblemsRef.current = next.remaining;
      setCustomProblems(next.remaining);
      setCurrentProblem(next.round.problem);
      setPlayerOptions(next.round.options);
      setSelectedAnswers({ A: null, B: null });
      setFeedback({ A: "idle", B: "idle" });
      setRoundLocked(false);
      setLockedBy(null);
      problemRevealStartRef.current = 0;
    }, ROUND_DELAY);
  }, []);

  const restartGame = useCallback((mode: Difficulty, seededProblems?: Problem[]) => {
    if (roundTimerRef.current) {
      window.clearTimeout(roundTimerRef.current);
    }
    const sourceProblems = seededProblems ?? customProblemsRef.current;
    const next = takeNextRound(mode, sourceProblems);
    customProblemsRef.current = next.remaining;
    setDifficulty(mode);
    setPhase("game");
    setWinner(null);
    setShowConfetti(false);
    setCustomProblems(next.remaining);
    setCurrentProblem(next.round.problem);
    setPlayerOptions(next.round.options);
    setPlayerScores({ A: 0, B: 0 });
    setPlayerProgress({ A: 0, B: 0 });
    setSelectedAnswers({ A: null, B: null });
    setFeedback({ A: "idle", B: "idle" });
    setRoundLocked(false);
    setLockedBy(null);
    playerProgressRef.current = { A: 0, B: 0 };
    winnerRef.current = null;
    lockedByRef.current = null;
    burstsRef.current = [];
    startTimeRef.current = 0;
    problemRevealStartRef.current = 0;
    stopAudio(finishAudioRef);
    if (bgAudioRef.current) {
      bgAudioRef.current.currentTime = 0;
      void bgAudioRef.current.play().catch(() => undefined);
    }
  }, [stopAudio]);

  const triggerCorrectEffect = useCallback((player: PlayerId) => {
    burstsRef.current = [...burstsRef.current, createExplosionBurst(player)];
  }, []);

  const persistCustomProblems = useCallback(
    async (nextProblems: Problem[], successMessage: string) => {
      if (!hasAuth || !user?.id) {
        setSavedProblems(nextProblems);
        setCustomProblems(nextProblems);
        customProblemsRef.current = nextProblems;
        setTeacherMessage("Backendga saqlash uchun avval tizimga kiring.");
        return false;
      }

      const ok = await saveQuestionsForGame(MATH_CHICK_GAME_KEY, nextProblems, true);
      if (!ok) {
        setTeacherMessage("Savollarni backendga saqlab bo'lmadi.");
        return false;
      }

      setSavedProblems(nextProblems);
      if (phase === "setup") {
        setCustomProblems(nextProblems);
        customProblemsRef.current = nextProblems;
      }
      setTeacherMessage(successMessage);
      return true;
    },
    [hasAuth, phase, saveQuestionsForGame, user?.id],
  );

  const handleStartGame = useCallback(() => {
    const queueSnapshot = [...savedProblems];
    setCustomProblems(queueSnapshot);
    customProblemsRef.current = queueSnapshot;
    runStartCountdown(() => restartGame(difficulty, queueSnapshot));
  }, [difficulty, restartGame, runStartCountdown, savedProblems]);

  const handleBackToSetup = useCallback(() => {
    if (roundTimerRef.current) {
      window.clearTimeout(roundTimerRef.current);
    }
    setPhase("setup");
    setWinner(null);
    setShowConfetti(false);
    setRoundLocked(false);
    setLockedBy(null);
    setSelectedAnswers({ A: null, B: null });
    setFeedback({ A: "idle", B: "idle" });
    setCustomProblems(savedProblems);
    customProblemsRef.current = savedProblems;
    burstsRef.current = [];
    stopAudio(bgAudioRef);
    stopAudio(finishAudioRef);
  }, [savedProblems, stopAudio]);

  const updateTeamName = useCallback((player: PlayerId, value: string) => {
    setTeamNames((prev) => ({
      ...prev,
      [player]: value,
    }));
  }, []);

  const addTeacherProblem = useCallback(async () => {
    const nextProblem = buildTeacherProblem(teacherDraft);
    if (!nextProblem) {
      setTeacherMessage("Savol va to'g'ri javobni to'ldiring.");
      return;
    }

    const nextProblems = [...savedProblems, nextProblem];
    const ok = await persistCustomProblems(nextProblems, "Custom savol backendga saqlandi.");
    if (!ok && hasAuth) {
      return;
    }
    setTeacherDraft({ question: "", answer: "", wrongAnswers: "" });
  }, [hasAuth, persistCustomProblems, savedProblems, teacherDraft]);

  const removeSavedProblem = useCallback(
    async (index: number) => {
      const nextProblems = savedProblems.filter((_, itemIndex) => itemIndex !== index);
      await persistCustomProblems(nextProblems, "Custom savol o'chirildi va backend yangilandi.");
    },
    [persistCustomProblems, savedProblems],
  );

  const handleGenerateAiQuestions = useCallback(async () => {
    setTeacherMessage("");
    setIsGeneratingAi(true);

    try {
      const generated = await generateMathChickAiProblems({
        topic: aiTopic,
        count: aiCount,
        difficulty: aiDifficulty,
      });
      const nextProblems = [...savedProblems, ...generated];
      const ok = await persistCustomProblems(
        nextProblems,
        `AI bilan ${generated.length} ta savol yaratildi va backendga saqlandi.`,
      );
      if (ok || !hasAuth) {
        setAiTopic("");
      }
    } catch (error) {
      setTeacherMessage(error instanceof Error ? error.message : "AI savollarini yaratib bo'lmadi.");
    } finally {
      setIsGeneratingAi(false);
    }
  }, [aiCount, aiDifficulty, aiTopic, hasAuth, persistCustomProblems, savedProblems]);

  const handleAnswer = useCallback(
    (player: PlayerId, value: number) => {
      if (phase !== "game" || winner || roundLocked) return;

      setRoundLocked(true);
      setLockedBy(player);
      setSelectedAnswers((prev) => ({ ...prev, [player]: value }));

      const isCorrect = value === currentProblem.answer;
      setFeedback({
        A: player === "A" ? (isCorrect ? "correct" : "wrong") : "idle",
        B: player === "B" ? (isCorrect ? "correct" : "wrong") : "idle",
      });

      if (isCorrect) {
        triggerCorrectEffect(player);
        const nextScores = {
          ...playerScores,
          [player]: playerScores[player] + 10,
        };
        const nextProgress = {
          ...playerProgressRef.current,
          [player]: clampProgress(playerProgressRef.current[player] + 1),
        };

        setPlayerScores(nextScores);
        setPlayerProgress(nextProgress);
        playerProgressRef.current = nextProgress;

        if (nextProgress[player] >= TOTAL_STEPS) {
          setWinner(player);
          setPhase("finish");
          setShowConfetti(true);
          setRoundLocked(true);
          setLockedBy(player);
          stopAudio(bgAudioRef);
          playSfx(finishAudioRef);
          return;
        }

        scheduleNextRound(difficulty);
        return;
      }

      const nextProgress = {
        ...playerProgressRef.current,
        [player]: clampProgress(playerProgressRef.current[player] - 1),
      };
      playSfx(wrongAudioRef);
      setPlayerProgress(nextProgress);
      playerProgressRef.current = nextProgress;
      scheduleNextRound(difficulty);
    },
    [currentProblem.answer, difficulty, phase, playSfx, playerScores, roundLocked, scheduleNextRound, stopAudio, triggerCorrectEffect, winner],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let renderProgress: PlayerMap<number> = { ...playerProgressRef.current };

    const palettes = {
      A: {
        shadow: "rgba(14,16,29,0.26)",
        badge: "#f59e0b",
        badgeGlow: "rgba(245,158,11,0.45)",
        badgeText: "#fff7ed",
      },
      B: {
        shadow: "rgba(14,16,29,0.22)",
        badge: "#0ea5e9",
        badgeGlow: "rgba(14,165,233,0.38)",
        badgeText: "#eff6ff",
      },
    } satisfies Record<PlayerId, ChickPalette>;

    const drawScene = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const t = (timestamp - startTimeRef.current) / 1000;

      burstsRef.current = burstsRef.current
        .map((burst) => (burst.startTime === 0 ? { ...burst, startTime: timestamp } : burst))
        .filter((burst) => timestamp - burst.startTime < burst.duration);

      renderProgress = {
        A: renderProgress.A + (playerProgressRef.current.A - renderProgress.A) * 0.028,
        B: renderProgress.B + (playerProgressRef.current.B - renderProgress.B) * 0.028,
      };

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      bgGrad.addColorStop(0, "#09111f");
      bgGrad.addColorStop(0.45, "#152642");
      bgGrad.addColorStop(1, "#0b1324");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      for (let i = 0; i < 10; i += 1) {
        const starX = (i * CANVAS_W) / 10 + Math.sin(t * 0.4 + i) * 18;
        const starY = 26 + Math.cos(t * 0.3 + i) * 18;
        const starOpacity = 0.25 + Math.sin(t * 1.2 + i) * 0.18;
        ctx.fillStyle = `rgba(255,255,255,${starOpacity})`;
        ctx.beginPath();
        ctx.arc(starX, starY, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      const neonSweep = 920 + Math.sin(t * 1.05) * 90;
      const lightGrad = ctx.createLinearGradient(neonSweep - 220, 0, neonSweep + 220, 0);
      lightGrad.addColorStop(0, "rgba(34,211,238,0)");
      lightGrad.addColorStop(0.5, "rgba(34,211,238,0.9)");
      lightGrad.addColorStop(1, "rgba(34,211,238,0)");
      ctx.fillStyle = lightGrad;
      ctx.fillRect(770, 0, 320, 10);

      const laneConfigs = [
        { player: "A" as const, y: LANE_Y.A, accent: "#f59e0b", glow: "rgba(245,158,11,0.25)" },
        { player: "B" as const, y: LANE_Y.B, accent: "#38bdf8", glow: "rgba(56,189,248,0.22)" },
      ];

      laneConfigs.forEach(({ player, y, accent, glow }) => {
        const laneTop = y - 48;
        const laneBottom = y + 42;

        drawRoundedRect(ctx, 58, laneTop - 8, CANVAS_W - 136, 92, 28, "rgba(255,255,255,0.04)");

        const laneGrad = ctx.createLinearGradient(0, laneTop, 0, laneBottom + 30);
        laneGrad.addColorStop(0, "rgba(38,47,79,0.95)");
        laneGrad.addColorStop(1, "rgba(22,28,51,0.98)");
        ctx.fillStyle = laneGrad;
        ctx.beginPath();
        ctx.roundRect(72, laneTop + 14, CANVAS_W - 160, 52, 24);
        ctx.fill();

        ctx.fillStyle = glow;
        ctx.fillRect(72, laneTop + 14, CANVAS_W - 160, 52);

        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 2;
        ctx.setLineDash([14, 16]);
        ctx.beginPath();
        ctx.moveTo(86, y + 40);
        ctx.lineTo(FINISH_X - 22, y + 40);
        ctx.stroke();
        ctx.setLineDash([]);

        for (let step = 1; step <= TOTAL_STEPS; step += 1) {
          const markerX = CHICK_START_X + step * CHICK_STEP;
          ctx.strokeStyle = `rgba(255,255,255,${step <= playerProgressRef.current[player] ? 0.2 : 0.08})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(markerX, laneTop + 6);
          ctx.lineTo(markerX, laneBottom + 24);
          ctx.stroke();

          ctx.fillStyle = step <= playerProgressRef.current[player] ? accent : "rgba(255,255,255,0.18)";
          ctx.beginPath();
          ctx.arc(markerX, laneTop - 8, 6.5, 0, Math.PI * 2);
          ctx.fill();
        }

        drawRoundedRect(ctx, 84, laneTop - 22, 118, 30, 14, "rgba(7,12,24,0.62)");
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          getTeamDisplayName(teamNames[player], player === "A" ? "Team A" : "Team B")
            .toUpperCase()
            .slice(0, 12),
          143,
          laneTop - 7,
        );

        drawRoundedRect(ctx, FINISH_X - 4, laneTop - 12, 28, 94, 10, "rgba(255,255,255,0.08)");
        const flagColors = ["#ffffff", accent];
        const tileSize = 12;
        for (let row = 0; row < 6; row += 1) {
          for (let col = 0; col < 2; col += 1) {
            ctx.fillStyle = flagColors[(row + col) % 2];
            ctx.fillRect(FINISH_X + col * tileSize, laneTop - 2 + row * tileSize, tileSize, tileSize);
          }
        }
      });

      drawRoundedRect(ctx, QUESTION_PANEL_X, QUESTION_PANEL_Y, QUESTION_PANEL_W, QUESTION_PANEL_H, 24, "rgba(19,27,48,0.82)");
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(QUESTION_PANEL_X, QUESTION_PANEL_Y, QUESTION_PANEL_W, QUESTION_PANEL_H, 24);
      ctx.stroke();

      if (problemRevealStartRef.current === 0) {
        problemRevealStartRef.current = timestamp;
      }
      const revealProgress = Math.min(1, (timestamp - problemRevealStartRef.current) / 360);
      const questionScale = 0.88 + revealProgress * 0.12;
      ctx.save();
      ctx.translate(QUESTION_PANEL_X + QUESTION_PANEL_W / 2, QUESTION_PANEL_Y + QUESTION_PANEL_H / 2);
      ctx.scale(questionScale, questionScale);
      ctx.fillStyle = "#dbeafe";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText("SHARED QUESTION", 0, -12);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 30px Arial";
      ctx.fillText(currentProblem.question, 0, 22);
      ctx.restore();

      const difficultyColors = {
        easy: "rgba(34,197,94,0.9)",
        medium: "rgba(59,130,246,0.9)",
        hard: "rgba(244,63,94,0.9)",
        mixed: "rgba(168,85,247,0.9)",
      } satisfies Record<Difficulty, string>;
      drawRoundedRect(ctx, 1030, 24, 176, 44, 16, difficultyColors[difficulty]);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(difficulty.toUpperCase(), 1118, 47);

      drawRoundedRect(ctx, 72, 20, 220, 62, 20, "rgba(19,27,48,0.78)");
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "left";
      ctx.fillText(roundLocked ? "FIRST CLICK LOCKED" : "FIRST CLICK WINS", 96, 46);
      ctx.fillStyle = roundLocked
        ? lockedByRef.current === "A"
          ? "#fbbf24"
          : "#7dd3fc"
        : "#94a3b8";
      ctx.font = "bold 16px Arial";
      ctx.fillText(
        roundLocked && lockedByRef.current
          ? `Round taken by Player ${lockedByRef.current}`
          : "Both players race this same problem",
        96,
        68,
      );

      const chickAX = CHICK_START_X + renderProgress.A * CHICK_STEP;
      const chickBX = CHICK_START_X + renderProgress.B * CHICK_STEP;
      const jumpOffsets: PlayerMap<number> = { A: 0, B: 0 };

      burstsRef.current.forEach((burst) => {
        const progress = Math.min(1, (timestamp - burst.startTime) / burst.duration);
        const jump = Math.sin(Math.min(1, progress * 1.2) * Math.PI) * 18 * (1 - progress * 0.2);
        jumpOffsets[burst.player] = Math.max(jumpOffsets[burst.player], jump);
      });

      const burstPositions: PlayerMap<{ x: number; y: number }> = {
        A: { x: chickAX + 14, y: LANE_Y.A - jumpOffsets.A - 18 },
        B: { x: chickBX + 14, y: LANE_Y.B - jumpOffsets.B - 18 },
      };

      burstsRef.current.forEach((burst) => {
        const pos = burstPositions[burst.player];
        drawExplosion(ctx, burst, pos.x, pos.y, timestamp);
        drawFloatingScore(ctx, burst, pos.x + 4, pos.y - 6, timestamp);
      });

      const movingA = Math.abs(playerProgressRef.current.A - renderProgress.A) > 0.015;
      const movingB = Math.abs(playerProgressRef.current.B - renderProgress.B) > 0.015;

      drawChick(
        ctx,
        chickAX,
        LANE_Y.A - jumpOffsets.A,
        CHICK_SCALE,
        t,
        movingA && phase === "game" && !winnerRef.current,
        palettes.A,
        getShortLabel(teamNames.A, "A"),
        chickSprite,
      );
      drawChick(
        ctx,
        chickBX,
        LANE_Y.B - jumpOffsets.B,
        CHICK_SCALE,
        t,
        movingB && phase === "game" && !winnerRef.current,
        palettes.B,
        getShortLabel(teamNames.B, "B"),
        chickSprite,
      );

      if (winnerRef.current) {
        const champion = winnerRef.current;
        const championX = champion === "A" ? chickAX : chickBX;
        const championY = champion === "A" ? LANE_Y.A : LANE_Y.B;
        const flare = 16 + Math.sin(t * 6) * 4;
        const crownGrad = ctx.createRadialGradient(championX, championY - 70, 6, championX, championY - 70, 34);
        crownGrad.addColorStop(0, "rgba(250,204,21,0.85)");
        crownGrad.addColorStop(1, "rgba(250,204,21,0)");
        ctx.fillStyle = crownGrad;
        ctx.beginPath();
        ctx.arc(championX, championY - 70, flare, 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(drawScene);
    };

    animationRef.current = requestAnimationFrame(drawScene);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [chickSprite, currentProblem.question, difficulty, phase, roundLocked, teamNames]);

  const categoryButton = (mode: Difficulty, label: string, accent: string) => {
    const active = difficulty === mode;
    const styles = {
      easy: active
        ? "from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30"
        : "from-slate-700 to-slate-800 text-slate-100 hover:from-emerald-500/80 hover:to-emerald-600/80",
      medium: active
        ? "from-blue-500 to-blue-600 text-white shadow-blue-500/30"
        : "from-slate-700 to-slate-800 text-slate-100 hover:from-blue-500/80 hover:to-blue-600/80",
      hard: active
        ? "from-rose-500 to-rose-600 text-white shadow-rose-500/30"
        : "from-slate-700 to-slate-800 text-slate-100 hover:from-rose-500/80 hover:to-rose-600/80",
      mixed: active
        ? "from-violet-500 to-violet-600 text-white shadow-violet-500/30"
        : "from-slate-700 to-slate-800 text-slate-100 hover:from-violet-500/80 hover:to-violet-600/80",
    } satisfies Record<Difficulty, string>;

    return (
      <button
        key={mode}
        onClick={() => setDifficulty(mode)}
        className={`rounded-2xl border border-white/10 bg-gradient-to-br px-5 py-3 text-sm font-black uppercase tracking-[0.2em] transition duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-lg ${styles[mode]}`}
      >
        <span className="mr-2">{accent}</span>
        {label}
      </button>
    );
  };

  const playerCard = (player: PlayerId) => {
    const isWarm = player === "A";
    const progress = playerProgress[player];
    const score = playerScores[player];
    const isWinner = winner === player;
    const isLocked = lockedBy === player;
    const cardBorder = isWarm ? "border-amber-400/25" : "border-cyan-400/25";
    const title = isWarm ? "text-amber-200" : "text-cyan-200";
    const value = isWarm
      ? "from-amber-300 via-yellow-300 to-orange-400"
      : "from-sky-300 via-cyan-300 to-blue-400";
    const chip = isWarm
      ? "bg-amber-500/15 text-amber-200 border-amber-300/20"
      : "bg-cyan-500/15 text-cyan-200 border-cyan-300/20";

    const displayName = getTeamDisplayName(teamNames[player], player === "A" ? "Team A" : "Team B");

    return (
      <div
        className={`rounded-3xl border ${cardBorder} bg-slate-900/70 p-5 shadow-xl shadow-black/30 backdrop-blur-sm`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className={`text-xs font-black uppercase tracking-[0.35em] ${title}`}>
              {displayName}
            </div>
            <div className="mt-2 text-sm text-slate-400">
              {isWinner
                ? "Champion"
                : isLocked
                  ? "First click secured"
                  : roundLocked
                    ? "Waiting next round"
                    : "Ready to strike"}
            </div>
          </div>
          <div className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] ${chip}`}>
            {progress}/{TOTAL_STEPS} steps
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Score</div>
            <div className={`mt-2 text-3xl font-black text-transparent bg-gradient-to-r ${value} bg-clip-text`}>
              {score}
            </div>
          </div>
          <div className="rounded-2xl bg-white/[0.04] p-4">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Progress</div>
            <div className="mt-2 text-3xl font-black text-white">{progress}</div>
          </div>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${isWarm ? "from-amber-400 to-orange-500" : "from-cyan-400 to-blue-500"} transition-all duration-500`}
            style={{ width: `${(progress / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  const answerPanel = (player: PlayerId) => {
    const isWarm = player === "A";
    const accentPanel = isWarm
      ? "border-amber-400/20 from-amber-500/10 via-slate-900/70 to-orange-500/10"
      : "border-cyan-400/20 from-cyan-500/10 via-slate-900/70 to-blue-500/10";
    const accentButton = isWarm
      ? "from-amber-400/90 to-orange-500/90 hover:shadow-amber-500/30"
      : "from-sky-400/90 to-cyan-500/90 hover:shadow-cyan-500/30";
    const options = playerOptions[player];
    const displayName = getTeamDisplayName(teamNames[player], player === "A" ? "Team A" : "Team B");

    return (
      <div className={`rounded-3xl border bg-gradient-to-br p-5 ${accentPanel}`}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className={`text-xs font-black uppercase tracking-[0.35em] ${isWarm ? "text-amber-200" : "text-cyan-200"}`}>
              {displayName}
            </div>
            <div className="mt-2 text-sm text-slate-400">
              {winner
                ? "Match finished"
                : roundLocked
                  ? lockedBy === player
                    ? "Your click decided this round"
                    : "Round locked by opponent"
                  : "Choose fast"}
            </div>
          </div>
          <div className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] ${isWarm ? "bg-amber-400/10 text-amber-100" : "bg-cyan-400/10 text-cyan-100"}`}>
            {feedback[player] === "correct"
              ? "Correct"
              : feedback[player] === "wrong"
                ? "Wrong"
                : "Live"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {options.map((option, index) => {
            const isSelected = selectedAnswers[player] === option;
            const isCorrect = option === currentProblem.answer;
            const showCorrect = roundLocked && lockedBy === player && isSelected && isCorrect;
            const showWrong = roundLocked && lockedBy === player && isSelected && !isCorrect;
            const showReveal = roundLocked && lockedBy === player && !isSelected && isCorrect;

            let classes =
              "bg-slate-800/80 text-white border-white/10 hover:bg-slate-700/90 hover:scale-[1.02]";
            if (showCorrect) {
              classes =
                "bg-gradient-to-br from-emerald-500 to-green-600 text-white border-emerald-300/40 shadow-lg shadow-emerald-500/30 scale-[1.02]";
            } else if (showWrong) {
              classes =
                "bg-gradient-to-br from-rose-500 to-red-600 text-white border-rose-300/40 shadow-lg shadow-rose-500/30";
            } else if (showReveal) {
              classes =
                "bg-emerald-500/20 text-emerald-100 border-emerald-300/30";
            } else if (!roundLocked) {
              classes = `bg-gradient-to-br ${accentButton} text-white border-white/15 shadow-lg`;
            }

            return (
              <button
                key={`${player}-${option}-${index}`}
                type="button"
                disabled={phase !== "game" || !!winner || roundLocked}
                onClick={() => handleAnswer(player, option)}
                className={`rounded-2xl border px-4 py-5 text-2xl font-black transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${classes}`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.14),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.12),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a_48%,_#020617)] p-6 text-white">
      {showConfetti && (
        <div className="pointer-events-none fixed inset-0 z-50">
          <Confetti
            mode="boom"
            particleCount={180}
            effectCount={1}
            x={0.5}
            y={0.3}
            colors={["#fbbf24", "#f59e0b", "#38bdf8", "#22c55e", "#ec4899"]}
          />
        </div>
      )}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-80px] top-24 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-[-40px] h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/8 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1360px]">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-amber-300 via-white to-cyan-300 bg-clip-text text-4xl font-black tracking-[0.08em] text-transparent md:text-5xl">
              Math Chick Game
            </h1>
          </div>
        </div>

        {phase === "setup" && (
          <>
            <div className="mb-6 rounded-[32px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-md">
              <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.35em] text-slate-500">
                    Teacher Panel
                  </div>
                  <div className="mt-2 text-xl font-black text-white">
                    Jamoa nomlari, AI va custom savollar
                  </div>
                </div>
                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-100">
                  {isLoadingSavedQuestions ? "Savollar yuklanmoqda..." : `Saqlangan custom savollar: ${savedProblems.length}`}
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[0.9fr_1.5fr]">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="rounded-3xl border border-amber-400/15 bg-amber-500/5 p-4">
                    <div className="text-xs font-black uppercase tracking-[0.3em] text-amber-200">Team A</div>
                    <input
                      type="text"
                      value={teamNames.A}
                      onChange={(event) => updateTeamName("A", event.target.value)}
                      className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-amber-300/40"
                      placeholder="Masalan: Burgutlar"
                    />
                  </label>

                  <label className="rounded-3xl border border-cyan-400/15 bg-cyan-500/5 p-4">
                    <div className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200">Team B</div>
                    <input
                      type="text"
                      value={teamNames.B}
                      onChange={(event) => updateTeamName("B", event.target.value)}
                      className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
                      placeholder="Masalan: Yulduzlar"
                    />
                  </label>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-3xl border border-cyan-400/15 bg-cyan-500/5 p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <div className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200">
                          AI Savol Generator
                        </div>
                        <div className="mt-2 text-sm text-slate-300">
                          Baamboozle dagidek mavzu, soni va qiyinlik bo'yicha savollar yaratib backendga saqlaydi.
                        </div>
                      </div>
                      <div className="rounded-full border border-cyan-300/20 bg-slate-950/50 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-100">
                        {user?.username ? `Teacher: ${user.username}` : "Login kerak"}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.9fr]">
                      <label className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                        <div className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Mavzu</div>
                        <input
                          type="text"
                          value={aiTopic}
                          onChange={(event) => setAiTopic(event.target.value)}
                          className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
                          placeholder="Masalan: ko'paytirish, kasrlar, bo'lish"
                        />
                      </label>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                          <div className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Soni</div>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {AI_COUNT_OPTIONS.map((count) => (
                              <button
                                key={count}
                                type="button"
                                onClick={() => setAiCount(count)}
                                className={`rounded-2xl border px-3 py-2 text-xs font-black uppercase tracking-[0.2em] transition ${
                                  aiCount === count
                                    ? "border-cyan-300/30 bg-cyan-400/15 text-cyan-100"
                                    : "border-white/10 bg-slate-950/70 text-slate-300"
                                }`}
                              >
                                {count} ta
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                          <div className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Qiyinlik</div>
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {(["easy", "medium", "hard", "mixed"] as const).map((mode) => (
                              <button
                                key={mode}
                                type="button"
                                onClick={() => setAiDifficulty(mode)}
                                className={`rounded-2xl border px-3 py-2 text-xs font-black uppercase tracking-[0.2em] transition ${
                                  aiDifficulty === mode
                                    ? "border-cyan-300/30 bg-cyan-400/15 text-cyan-100"
                                    : "border-white/10 bg-slate-950/70 text-slate-300"
                                }`}
                              >
                                {mode}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="text-sm text-slate-400">
                        AI ishlashi uchun `.env` ichida `VITE_GEMINI_API_KEY` bo'lishi kerak.
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleGenerateAiQuestions()}
                        disabled={isGeneratingAi || isSavingSavedQuestions}
                        className="rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-5 py-3 text-sm font-black uppercase tracking-[0.25em] text-white shadow-lg shadow-cyan-500/20 transition duration-200 hover:scale-[1.03] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isGeneratingAi ? "AI yaratmoqda..." : `AI bilan ${aiCount} ta savol qo'shish`}
                      </button>
                    </div>
                  </div>

                  <label className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Savol / Misol</div>
                    <input
                      type="text"
                      value={teacherDraft.question}
                      onChange={(event) =>
                        setTeacherDraft((prev) => ({
                          ...prev,
                          question: event.target.value,
                        }))
                      }
                      className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-white/30"
                      placeholder="Masalan: 12 + 8 = ?"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
                    <label className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">To'g'ri javob</div>
                      <input
                        type="number"
                        value={teacherDraft.answer}
                        onChange={(event) =>
                          setTeacherDraft((prev) => ({
                            ...prev,
                            answer: event.target.value,
                          }))
                        }
                        className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-white/30"
                        placeholder="20"
                      />
                    </label>

                    <label className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Noto'g'ri variantlar</div>
                      <input
                        type="text"
                        value={teacherDraft.wrongAnswers}
                        onChange={(event) =>
                          setTeacherDraft((prev) => ({
                            ...prev,
                            wrongAnswers: event.target.value,
                          }))
                        }
                        className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-white/30"
                        placeholder="18, 22, 24"
                      />
                    </label>
                  </div>

                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm text-slate-400">
                      3 ta noto'g'ri variant kiritmasangiz, o'yin qolgan variantlarni o'zi to'ldiradi.
                    </div>
                    <button
                      type="button"
                      onClick={() => void addTeacherProblem()}
                      disabled={isSavingSavedQuestions}
                      className="rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-cyan-500 px-5 py-3 text-sm font-black uppercase tracking-[0.25em] text-white shadow-lg shadow-orange-500/20 transition duration-200 hover:scale-[1.03] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSavingSavedQuestions ? "Saqlanmoqda..." : "Savol Qo'shish"}
                    </button>
                  </div>

                  <div className={`text-sm font-semibold ${
                    teacherMessage.includes("backendga saqlandi") ||
                    teacherMessage.includes("yaratildi") ||
                    teacherMessage.includes("yuklandi") ||
                    teacherMessage.includes("yangilandi")
                      ? "text-emerald-300"
                      : "text-amber-200"
                  }`}>
                    {teacherMessage || "O'qituvchi shu joydan savol qo'shishi, AI bilan yaratishi va backendga saqlashi mumkin."}
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                        Saqlangan Savollar
                      </div>
                      <div className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-xs font-bold text-slate-300">
                        {savedProblems.length} ta
                      </div>
                    </div>

                    <div className="max-h-64 space-y-2 overflow-auto pr-1">
                      {savedProblems.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/35 px-4 py-5 text-sm text-slate-400">
                          Hozircha backendda saqlangan custom savol yo'q.
                        </div>
                      ) : (
                        savedProblems.map((problem, index) => (
                          <div
                            key={`${problem.question}-${index}`}
                            className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3"
                          >
                            <div>
                              <div className="text-sm font-semibold text-white">{problem.question}</div>
                              <div className="mt-1 text-xs text-slate-400">
                                Javob: {problem.answer} | Variantlar: {problem.options.join(", ")}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => void removeSavedProblem(index)}
                              disabled={isSavingSavedQuestions}
                              className="rounded-xl border border-rose-300/20 bg-rose-500/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              O'chirish
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6 rounded-[32px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur-md">
              <div className="mb-5 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.35em] text-slate-500">
                    O'yinni Boshlash
                  </div>
                  <div className="mt-2 text-xl font-black text-white">
                    Darajani tanlang va musobaqani boshlang
                  </div>
                </div>
                <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-100">
                  Start kutilmoqda
                </div>
              </div>

              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="text-xs font-black uppercase tracking-[0.35em] text-slate-500">
                  Difficulty
                </span>
                {categoryButton("easy", "Easy", "Easy")}
                {categoryButton("medium", "Medium", "Med")}
                {categoryButton("hard", "Hard", "Hard")}
                {categoryButton("mixed", "Mixed", "Mix")}
              </div>

              <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-center">
                <div className="text-xs font-black uppercase tracking-[0.35em] text-slate-500">
                  Keyingi Savol
                </div>
                <div className="mt-3 bg-gradient-to-r from-amber-200 via-white to-cyan-200 bg-clip-text text-4xl font-black text-transparent">
                  {customProblems.length > 0 ? customProblems[0].question : currentProblem.question}
                </div>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleStartGame}
                  className="rounded-2xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 px-12 py-4 text-xl font-black text-white shadow-2xl shadow-orange-500/40 transition-all hover:scale-[1.03] hover:shadow-orange-500/60"
                >
                  O'YINNI BOSHLASH
                </button>
              </div>
            </div>
          </>
        )}

        {phase !== "setup" && (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              {playerCard("A")}
              {playerCard("B")}
            </div>

            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={handleBackToSetup}
                className="rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-3 text-sm font-black uppercase tracking-[0.25em] text-slate-100 transition hover:scale-[1.02] hover:bg-slate-800"
              >
                Teacher Panelga Qaytish
              </button>
            </div>

            <div className="relative rounded-[32px] border border-white/10 bg-slate-900/50 p-4 shadow-2xl shadow-black/30 backdrop-blur-md">
              <div className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.35em] text-slate-500">
                    Game Arena
                  </div>
                </div>
                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-100">
                  {phase === "finish" ? "Match finished" : roundLocked ? "Round locked" : "Round live"}
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0f172acc] shadow-2xl shadow-black/40">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_W}
                  height={CANVAS_H}
                  className="h-auto w-full bg-transparent"
                />
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                {answerPanel("A")}
                {answerPanel("B")}
              </div>

              {winner && phase === "finish" && (
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[32px] bg-slate-950/72 p-4 backdrop-blur-md">
                  <div className="w-full max-w-3xl rounded-3xl border border-emerald-300/30 bg-gradient-to-r from-emerald-500/15 via-slate-900/90 to-cyan-500/15 p-6 text-center shadow-xl shadow-emerald-500/10 md:p-8">
                    <div className="text-xs font-black uppercase tracking-[0.35em] text-emerald-200">
                      Match Complete
                    </div>
                    <div className="mt-3 text-4xl font-black text-white md:text-5xl">
                      {winner
                        ? `\uD83C\uDFC6 ${getTeamDisplayName(teamNames[winner], winner === "A" ? "Team A" : "Team B")} Wins!`
                        : ""}
                    </div>
                    <div className="mt-2 text-slate-300">
                      Qayta start qilib yangi poyga boshlashingiz yoki teacher panelga qaytishingiz mumkin.
                    </div>
                    <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleStartGame}
                        className="rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-cyan-500 px-6 py-3 text-sm font-black uppercase tracking-[0.25em] text-white shadow-lg shadow-cyan-500/20 transition duration-200 hover:scale-[1.03] active:scale-[0.98]"
                      >
                        Restart Match
                      </button>
                      <button
                        type="button"
                        onClick={handleBackToSetup}
                        className="rounded-2xl border border-white/10 bg-slate-900/70 px-6 py-3 text-sm font-black uppercase tracking-[0.25em] text-slate-100 transition hover:scale-[1.02] hover:bg-slate-800"
                      >
                        Teacher Panel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />
    </div>
  );
}

