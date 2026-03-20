import { useState, useEffect, useRef, useMemo } from "react";
import Confetti from "react-confetti-boom";
import {
  FaDice,
  FaUsers,
  FaRedo,
  FaTimesCircle,
  FaClock,
  FaCrown,
  FaVolumeUp,
  FaVolumeMute,
  FaStar,
  FaRobot,
} from "react-icons/fa";
import { GiJungle } from "react-icons/gi";
import diceSound from "../../../assets/sounds/roll_dice.mp3";
import correctSound from "../../../assets/sounds/correct.m4a";
import wrongSound from "../../../assets/sounds/wrong.mp3";
import winSound from "../../../assets/sounds/applause.mp3";
import jumanjiSound from "../../../assets/sounds/jumanji_sound.m4a";
import { fetchGameQuestions, saveGameQuestions } from "../../../hooks/useGameQuestions";
import { useFinishApplause } from "../../../hooks/useFinishApplause";
import { generateJumanjiQuestions } from "./ai";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../../../hooks/useGameStartCountdown";
import type { Phase, Question, ScoreAnnouncement, Team, Tile } from "./types";
import {
  DICE_ROLL_STEPS,
  DICE_ROLL_TICK_MS,
  MOVE_FINISH_BUFFER_MS,
  MOVE_STEP_DURATION_MS,
  SUBJECTS,
  TEAM_AVATARS,
  TEAM_COLORS,
  TEAM_MEDALLIONS,
  TEAM_TITLES,
  createTiles,
} from "./constants/gameData";
import {
  BOARD_STACK_OFFSETS,
  BOARD_TOKEN_NUDGE_X,
  BOARD_TOKEN_NUDGE_Y,
  BOARD_TOKEN_SIZE,
  JUMANJI_MAP_IMAGE,
  createRoadPoints,
} from "./constants/board";
import { DEFAULT_QUESTIONS } from "./constants/questions";
import RealisticDice from "./components/RealisticDice";

const JUMANJI_GAME_KEY = "jumanji";
const AI_QUESTION_COUNT_OPTIONS = [4, 8, 12, 16, 20, 24] as const;
const AI_DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Oson" },
  { value: "medium", label: "O'rtacha" },
  { value: "hard", label: "Qiyin" },
  { value: "mixed", label: "Aralash" },
] as const;
const AI_SUBJECT_OPTIONS = ["Aralash fanlar", ...SUBJECTS] as const;

function Jumanji() {
  const skipInitialRemoteSaveRef = useRef(true);
  const [phase, setPhase] = useState<Phase>("setup");
  useFinishApplause(phase === "finish");
  // Audio refs
  const diceAudioRef = useRef<HTMLAudioElement | null>(null);
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const wrongAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  // Game state
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [teamError, setTeamError] = useState("");

  // Questions state
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    subject: "Matematika",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    difficulty: "easy",
    timeLimit: 30,
  });
  const [questionError, setQuestionError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [aiSubject, setAiSubject] = useState<string>("Aralash fanlar");
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(8);
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("medium");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [remoteLoaded, setRemoteLoaded] = useState(false);

  // Gameplay state
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [visualPositions, setVisualPositions] = useState<
    Record<number, number>
  >({});
  const [currentTile, setCurrentTile] = useState<Tile | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [gameTime, setGameTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [winner, setWinner] = useState<Team | null>(null);
  const [scoreAnnouncement, setScoreAnnouncement] =
    useState<ScoreAnnouncement | null>(null);
  const { countdownValue, countdownVisible, runStartCountdown } =
    useGameStartCountdown();
  const hasGeminiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY?.trim());

  useEffect(() => {
    let alive = true;
    (async () => {
      const remoteQuestions = await fetchGameQuestions<Question>(JUMANJI_GAME_KEY);
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

    const timer = window.setTimeout(() => {
      void saveGameQuestions<Question>(JUMANJI_GAME_KEY, questions);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [questions, remoteLoaded]);

  useEffect(() => {
    diceAudioRef.current = new Audio(diceSound);
    correctAudioRef.current = new Audio(correctSound);
    wrongAudioRef.current = new Audio(wrongSound);
    winAudioRef.current = new Audio(winSound);
    bgAudioRef.current = new Audio(jumanjiSound);
    bgAudioRef.current.loop = true;
    bgAudioRef.current.volume = 0.45;

    return () => {
      [diceAudioRef, correctAudioRef, wrongAudioRef, winAudioRef, bgAudioRef].forEach(
        (ref) => {
          if (ref.current) {
            ref.current.pause();
            ref.current = null;
          }
        },
      );
    };
  }, []);

  useEffect(() => {
    const bg = bgAudioRef.current;
    if (!bg) return;

    bg.muted = isMuted;
    const shouldPlay = phase === "game" || phase === "question";

    if (shouldPlay) {
      bg.play().catch(() => {});
      return;
    }

    bg.pause();
    bg.currentTime = 0;
  }, [phase, isMuted]);

  // Game timer
  useEffect(() => {
    if (!isTimerActive || phase !== "game") return;

    const timer = setTimeout(() => {
      setGameTime((prev) => prev + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameTime, isTimerActive, phase]);

  // Question timer
  useEffect(() => {
    if (phase !== "question" || !currentQuestion || showResult) return;

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, phase, currentQuestion, showResult]);

  // Toast messages
  const showToastMessage = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const announceScoreChange = (
    team: Team,
    points: number,
    title: string,
    detail: string,
  ) => {
    setScoreAnnouncement({
      teamId: team.id,
      teamName: team.name,
      points,
      title,
      detail,
    });
  };

  // Play sound
  const playSound = (type: "dice" | "correct" | "wrong" | "win") => {
    if (isMuted) return;

    const audioMap = {
      dice: diceAudioRef.current,
      correct: correctAudioRef.current,
      wrong: wrongAudioRef.current,
      win: winAudioRef.current,
    };

    const audio = audioMap[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  // Add team
  const addTeam = () => {
    const name = newTeamName.trim();
    if (!name) {
      setTeamError("Jamoa nomini kiriting!");
      return;
    }
    if (teams.length >= 4) {
      setTeamError("4 ta jamoa yetarli!");
      return;
    }
    if (teams.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      setTeamError("Bu jamoa allaqachon qo'shilgan!");
      return;
    }

    const newTeam: Team = {
      id: Date.now() + Math.random(),
      name,
      color: TEAM_COLORS[teams.length].primary,
      avatar: TEAM_AVATARS[teams.length],
      position: 0,
      score: 0,
      isActive: teams.length === 0,
    };

    setTeams([...teams, newTeam]);
    setNewTeamName("");
    setTeamError("");
    showToastMessage(`✅ ${name} qo'shildi`);
  };

  // Remove team
  const removeTeam = (id: number) => {
    const team = teams.find((t) => t.id === id);
    setTeams(teams.filter((t) => t.id !== id));
    showToastMessage(`🗑️ ${team?.name} o'chirildi`);
  };

  // Add question
  const addQuestion = () => {
    if (!newQuestion.question) {
      setQuestionError("Savol matnini kiriting!");
      return;
    }
    if (newQuestion.options?.some((opt) => !opt)) {
      setQuestionError("Barcha variantlarni to'ldiring!");
      return;
    }
    if (!newQuestion.correctAnswer) {
      setQuestionError("To'g'ri javobni tanlang!");
      return;
    }

    const question: Question = {
      id: editingId || Date.now().toString(),
      subject: newQuestion.subject || "Matematika",
      question: newQuestion.question,
      options: newQuestion.options as string[],
      correctAnswer: newQuestion.correctAnswer,
      difficulty: newQuestion.difficulty || "easy",
      timeLimit: newQuestion.timeLimit || 30,
    };

    if (editingId) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === editingId ? question : q)),
      );
      showToastMessage("✅ Savol yangilandi");
    } else {
      setQuestions((prev) => [...prev, question]);
      showToastMessage("✅ Savol qo'shildi");
    }

    setNewQuestion({
      subject: "Matematika",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      difficulty: "easy",
      timeLimit: 30,
    });
    setEditingId(null);
    setQuestionError("");
  };

  // Remove question
  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    showToastMessage("🗑️ Savol o'chirildi");
  };

  const generateAiQuestionBank = async () => {
    if (isGeneratingAi) return;
    setQuestionError("");
    setIsGeneratingAi(true);

    try {
      const generated = await generateJumanjiQuestions({
        subject: aiSubject,
        count: aiQuestionCount,
        difficulty: aiDifficulty,
      });
      const generatedQuestions = generated.map((item, index) => ({
          ...item,
          id: `ai-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
        }));
      setQuestions((prev) => [...prev, ...generatedQuestions]);
      setEditingId(null);
      setNewQuestion({
        subject: aiSubject === "Aralash fanlar" ? "Matematika" : aiSubject,
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        difficulty: "easy",
        timeLimit: 30,
      });
      showToastMessage(`${generated.length} ta AI savol yuklandi`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI savollar yaratib bo'lmadi.";
      setQuestionError(message);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Start game
  const startGameNow = () => {
    setTeams((prev) =>
      prev.map((t, idx) => ({
        ...t,
        position: 0,
        score: 0,
        isActive: idx === 0,
      })),
    );
    setVisualPositions(Object.fromEntries(teams.map((t) => [t.id, 0])));
    setCurrentTeamIndex(0);
    setGameTime(0);
    setIsTimerActive(true);
    setPhase("game");
    showToastMessage("🎮 O'yin boshlandi! 1-jamoa kubik tashlasin");
  };

  const startGame = () => {
    if (teams.length !== 4) {
      showToastMessage("Aynan 4 ta jamoa bo'lishi kerak!");
      return;
    }
    if (questions.length < 4) {
      showToastMessage("Kamida 4 ta savol bo'lishi kerak!");
      return;
    }
    runStartCountdown(startGameNow);
  };

  // Roll dice
  const rollDice = () => {
    if (isRolling) return;
    if (isMoving) return;
    if (phase !== "game") return;
    if (scoreAnnouncement) return;

    setIsRolling(true);
    playSound("dice");

    let rollCount = 0;
    const interval = setInterval(() => {
      const randomValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(randomValue);
      rollCount++;

      if (rollCount >= DICE_ROLL_STEPS) {
        clearInterval(interval);
        setIsRolling(false);

        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);
        moveTeam(finalValue);
      }
    }, DICE_ROLL_TICK_MS);
  };

  // Move team
  const moveTeam = (steps: number) => {
    const currentTeam = teams[currentTeamIndex];
    const newPosition = Math.min(
      currentTeam.position + steps,
      tiles.length - 1,
    );
    const totalSteps = newPosition - currentTeam.position;
    const stepDuration = MOVE_STEP_DURATION_MS;

    setIsMoving(true);
    for (let step = 1; step <= totalSteps; step++) {
      setTimeout(() => {
        setVisualPositions((prev) => ({
          ...prev,
          [currentTeam.id]: currentTeam.position + step,
        }));
      }, step * stepDuration);
    }

    setTimeout(
      () => {
        setTeams((prev) =>
          prev.map((t) =>
            t.id === currentTeam.id ? { ...t, position: newPosition } : t,
          ),
        );
        setIsMoving(false);

        setGameHistory((prev) => [
          ...prev,
          `${currentTeam.name} ${steps} tashladi, ${newPosition + 1}-katakka yetib keldi`,
        ]);

        if (newPosition >= tiles.length - 1) {
          finishGame({ ...currentTeam, position: newPosition });
          return;
        }

        const tile = tiles[newPosition];
        setCurrentTile(tile);
        handleTileAction(tile);
      },
      Math.max(1, totalSteps) * stepDuration + MOVE_FINISH_BUFFER_MS,
    );
  };

  const moveTeamByDelta = (
    currentTeam: Team,
    delta: number,
    historyEntry: string,
    onComplete: () => void,
  ) => {
    const currentPosition = currentTeam.position;
    const targetPosition = Math.min(
      tiles.length - 1,
      Math.max(0, currentPosition + delta),
    );
    const totalSteps = Math.abs(targetPosition - currentPosition);
    const direction = targetPosition >= currentPosition ? 1 : -1;
    const stepDuration = MOVE_STEP_DURATION_MS;

    setIsMoving(true);
    for (let step = 1; step <= totalSteps; step++) {
      setTimeout(() => {
        setVisualPositions((prev) => ({
          ...prev,
          [currentTeam.id]: currentPosition + step * direction,
        }));
      }, step * stepDuration);
    }

    setTimeout(
      () => {
        setTeams((prev) =>
          prev.map((t) =>
            t.id === currentTeam.id ? { ...t, position: targetPosition } : t,
          ),
        );
        setIsMoving(false);
        setGameHistory((prev) => [...prev, historyEntry]);

        if (targetPosition >= tiles.length - 1) {
          finishGame({ ...currentTeam, position: targetPosition });
          return;
        }

        onComplete();
      },
      Math.max(1, totalSteps) * stepDuration + MOVE_FINISH_BUFFER_MS,
    );
  };

  // Handle tile action
  const handleTileAction = (tile: Tile) => {
    if (tile.type === "question") {
      const randomQuestion =
        questions[Math.floor(Math.random() * questions.length)];
      setCurrentQuestion(randomQuestion);
      setTimeLeft(randomQuestion.timeLimit);
      setPhase("question");
    } else if (tile.type === "bonus") {
      handleBonus();
    } else if (tile.type === "trap") {
      handleTrap();
    } else if (tile.type === "challenge") {
      handleChallenge();
    } else if (tile.type === "boss") {
      handleBoss();
    }
  };

  // Handle bonus
  const handleBonus = () => {
    const currentTeam = teams[currentTeamIndex];
    const bonusSteps = Math.random() < 0.5 ? 2 : 5;

    announceScoreChange(
      currentTeam,
      bonusSteps,
      "BONUS QADAM",
      `Maxsus katak: +${bonusSteps} qadam oldinga`,
    );
    showToastMessage(`${currentTeam.name} bonus oldi: +${bonusSteps} qadam`);

    setTimeout(() => {
      moveTeamByDelta(
        currentTeam,
        bonusSteps,
        `${currentTeam.name} bonus oldi va +${bonusSteps} qadam oldinga yurdi`,
        advanceTurn,
      );
    }, 1200);
  };

  // Handle trap
  const handleTrap = () => {
    const currentTeam = teams[currentTeamIndex];
    const penalty = 5;

    setTeams((prev) =>
      prev.map((t) =>
        t.id === currentTeam.id
          ? { ...t, score: Math.max(0, t.score - penalty) }
          : t,
      ),
    );

    setGameHistory((prev) => [
      ...prev,
      `🐍 ${currentTeam.name} tuzoqqa tushdi: -${penalty} ball`,
    ]);
    announceScoreChange(
      currentTeam,
      -penalty,
      "TRAP JARIMA",
      "Tuzoq katagi: ball kamaydi",
    );
    showToastMessage(`🐍 ${currentTeam.name} -${penalty} ball`);

    setTimeout(() => {
      advanceTurn();
    }, 2000);
  };

  // Handle challenge
  const handleChallenge = () => {
    const randomQuestion =
      questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion({ ...randomQuestion });
    setTimeLeft(randomQuestion.timeLimit);
    setPhase("question");
  };

  // Handle boss
  const handleBoss = () => {
    const randomQuestion =
      questions[Math.floor(Math.random() * questions.length)];
    setCurrentQuestion({ ...randomQuestion });
    setTimeLeft(randomQuestion.timeLimit);
    setPhase("question");
  };

  // Handle timeout
  const handleTimeout = () => {
    const currentTeam = teams[currentTeamIndex];
    const backSteps = 3;

    playSound("wrong");
    setShowResult(true);
    setIsCorrect(false);

    setTimeout(() => {
      resetQuestionState();
      moveTeamByDelta(
        currentTeam,
        -backSteps,
        `${currentTeam.name} vaqtida javob bermadi: -${backSteps} qadam`,
        advanceTurn,
      );
    }, 1200);
  };

  // Handle answer
  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return;
    if (showResult) return;

    setSelectedAnswer(answer);
    setShowResult(true);

    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    playSound(correct ? "correct" : "wrong");

    const currentTeam = teams[currentTeamIndex];
    const timeBonus = Math.floor(timeLeft / 10) * 5;
    const points = correct ? 10 + timeBonus : -5;

    setTeams((prev) =>
      prev.map((t) =>
        t.id === currentTeam.id
          ? { ...t, score: Math.max(0, t.score + points) }
          : t,
      ),
    );

    setGameHistory((prev) => [
      ...prev,
      correct
        ? `✅ ${currentTeam.name} to'g'ri javob berdi: +${10 + timeBonus} ball`
        : `❌ ${currentTeam.name} xato javob berdi: -5 ball`,
    ]);
    announceScoreChange(
      currentTeam,
      points,
      correct ? "TO'G'RI JAVOB" : "XATO JAVOB",
      correct
        ? `Asosiy +10 va vaqt bonusi +${timeBonus}`
        : "Noto'g'ri javob uchun jarima",
    );

    setTimeout(() => {
      advanceTurn();
    }, 2000);
  };

  const resetQuestionState = () => {
    setPhase("game");
    setCurrentTile(null);
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setShowResult(false);
    setScoreAnnouncement(null);
    setTimeLeft(30);
  };

  const advanceTurn = () => {
    const nextIndex = (currentTeamIndex + 1) % teams.length;
    setCurrentTeamIndex(nextIndex);
    setTeams((prev) =>
      prev.map((t, i) => ({ ...t, isActive: i === nextIndex })),
    );
    resetQuestionState();
  };

  // Finish game
  const finishGame = (winningTeam?: Team) => {
    setIsTimerActive(false);
    playSound("win");
    setShowConfetti(true);

    if (winningTeam) {
      setWinner(winningTeam);
    } else {
      // Find winner by score
      const sorted = [...teams].sort((a, b) => b.score - a.score);
      setWinner(sorted[0]);
    }

    setPhase("finish");
  };

  // Reset game
  const resetGame = () => {
    setPhase("setup");
    setTeams([]);
    setCurrentTeamIndex(0);
    setDiceValue(1);
    setIsMoving(false);
    setVisualPositions({});
    setCurrentTile(null);
    setCurrentQuestion(null);
    setTimeLeft(30);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowConfetti(false);
    setGameHistory([]);
    setGameTime(0);
    setIsTimerActive(false);
    setWinner(null);
    setScoreAnnouncement(null);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const tiles = useMemo(() => createTiles(questions.length), [questions.length]);
  const roadPoints = useMemo(() => createRoadPoints(tiles.length), [tiles.length]);
  const specialTileIndexes = useMemo(
    () =>
      new Set(
        tiles
          .map((tile, idx) =>
            tile.type === "bonus" || tile.type === "trap" || tile.type === "challenge"
              ? idx
              : null,
          )
          .filter((idx): idx is number => idx !== null),
      ),
    [tiles],
  );

  const getDisplayPosition = (team: Team) => {
    const rawPosition = visualPositions[team.id] ?? team.position;
    return rawPosition;
  };

  const getTeamsOnTile = (tileIndex: number) =>
    teams.filter((team) => getDisplayPosition(team) === tileIndex);

  const furthestDisplayPosition = teams.reduce(
    (maxPos, team) => Math.max(maxPos, getDisplayPosition(team)),
    0,
  );


  const recentScoreEvents = gameHistory
    .filter((item) => /[+-]\d+\s*ball/i.test(item))
    .slice(-5)
    .reverse();

  const floatingJungleItems = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${15 + Math.random() * 20}s`,
        transform: `rotate(${Math.random() * 360}deg)`,
        symbol: ["🌿", "🌴", "🍃", "🌱", "🌵", "🌳"][i % 6],
      })),
    [],
  );

  // Medallion token renderer
  const renderPawn = (team: Team, size = 34) => {
    const teamIndex = teams.findIndex((t) => t.id === team.id);
    const medal = TEAM_MEDALLIONS[Math.max(0, teamIndex)] || TEAM_MEDALLIONS[0];

    return (
      <div
        className="relative rounded-full border-2 border-amber-500/50 bg-transparent shadow-xl hover:scale-110 transition-all duration-300"
        style={{ width: size, height: size }}
      >
        <img
          src={medal}
          alt={`${team.name} token`}
          className="h-full w-full object-contain rounded-full"
          draggable={false}
        />
      </div>
    );
  };


  return (
    <div
      className="relative min-h-[72dvh] overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/90 via-amber-900/90 to-amber-950/90 p-3 shadow-2xl sm:p-4 md:p-6"
    >
      {/* Animated Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-amber-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse-slower rounded-full bg-yellow-600/20 blur-3xl" />

        {/* Jungle Pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, #f59e0b 2px, transparent 2px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating Jungle Elements */}
        <div className="pointer-events-none absolute inset-0">
          {floatingJungleItems.map((item) => (
            <div
              key={item.id}
              className="absolute text-4xl opacity-10 animate-float"
              style={{
                top: item.top,
                left: item.left,
                animationDelay: item.animationDelay,
                animationDuration: item.animationDuration,
                transform: item.transform,
              }}
            >
              {item.symbol}
            </div>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed left-1/2 top-18 z-50 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 sm:top-24">
          <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-600 to-yellow-600 px-4 py-3 text-center text-white shadow-2xl sm:rounded-full sm:px-6">
            {toast}
          </div>
        </div>
      )}

      {/* Mute Button */}
      <button
        onClick={toggleMute}
        className="fixed right-3 top-3 z-50 rounded-xl border-2 border-amber-500/30 bg-amber-900/70 p-2.5 text-amber-400 transition-all hover:bg-amber-800/50 sm:right-6 sm:top-6 sm:p-3"
      >
        {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
      </button>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6">
        {phase === "setup" && (
          /* ========== O'QITUVCHI PANELI ========== */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Teams Panel */}
            <div className="relative group transform-gpu overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-900/40 to-yellow-900/40 p-6 backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10" />

              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-amber-500/30">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-amber-500/30" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-yellow-500">
                    <FaUsers className="text-white text-sm" />
                  </div>
                </div>
                <h2 className="text-xl font-black text-white">JAMOALAR</h2>
              </div>

              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTeam();
                      }
                    }}
                    placeholder="Jamoa nomi..."
                    className="flex-1 px-4 py-2 rounded-xl border border-amber-500/30 bg-amber-950/30 text-white placeholder-amber-300/50 focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    onClick={addTeam}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-bold hover:scale-105 transition-all"
                  >
                    Qo'shish
                  </button>
                </div>
                {teamError && (
                  <p className="mt-2 text-sm text-red-400">{teamError}</p>
                )}
              </div>

              <div className="space-y-3">
                {teams.map((team, idx) => (
                  <div
                    key={team.id}
                    className="group relative overflow-hidden rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 transition-all hover:bg-amber-900/40"
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${TEAM_COLORS[idx % TEAM_COLORS.length].primary} opacity-0 group-hover:opacity-10 transition-opacity`}
                    />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {renderPawn(team, 44)}
                        <div>
                          <p className="text-sm font-bold text-white">
                            {team.name}
                          </p>
                          <p className="text-xs text-amber-300/70">
                            {TEAM_TITLES[idx]}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeTeam(team.id)}
                        className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimesCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions Panel */}
            <div className="relative group transform-gpu overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-900/40 to-yellow-900/40 p-6 backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10" />

              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-amber-500/30">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-amber-500/30" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-yellow-500">
                    <FaStar className="text-white text-sm" />
                  </div>
                </div>
                <h2 className="text-xl font-black text-white">SAVOLLAR</h2>
              </div>

              <div className="space-y-3 mb-4">
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4">
                  <div className="mb-3 flex items-center gap-2 text-cyan-300">
                    <FaRobot />
                    <p className="text-sm font-bold">AI SAVOL GENERATSIYASI</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <select
                      value={aiSubject}
                      onChange={(e) => setAiSubject(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-cyan-500/30 bg-slate-950/70 text-white"
                    >
                      {AI_SUBJECT_OPTIONS.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                    <select
                      value={aiQuestionCount}
                      onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-xl border border-cyan-500/30 bg-slate-950/70 text-white"
                    >
                      {AI_QUESTION_COUNT_OPTIONS.map((count) => (
                        <option key={count} value={count}>
                          {count} ta savol
                        </option>
                      ))}
                    </select>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value as "easy" | "medium" | "hard" | "mixed")}
                      className="w-full px-4 py-2 rounded-xl border border-cyan-500/30 bg-slate-950/70 text-white"
                    >
                      {AI_DIFFICULTY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => void generateAiQuestionBank()}
                      disabled={!hasGeminiKey || isGeneratingAi}
                      className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 font-bold text-white transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isGeneratingAi ? `${aiQuestionCount} ta yaratilmoqda...` : `AI bilan ${aiQuestionCount} ta yaratish`}
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-cyan-100/75">
                    AI savollar mavjud ro'yxatga qo'shiladi. "Aralash fanlar" tanlansa bir nechta fanlardan savollar keladi, "Aralash" qiyinlik tanlansa easy, medium va hard savollar aralash bo'ladi.
                  </p>
                  {!hasGeminiKey && (
                    <p className="mt-2 text-xs text-amber-300">
                      AI ishlashi uchun `.env` ichida `VITE_GEMINI_API_KEY` bo'lishi kerak.
                    </p>
                  )}
                </div>

                <select
                  value={newQuestion.subject}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, subject: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-amber-500/30 bg-amber-950/30 text-white"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={newQuestion.question}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, question: e.target.value })
                  }
                  placeholder="Savol matni"
                  className="w-full px-4 py-2 rounded-xl border border-amber-500/30 bg-amber-950/30 text-white"
                />

                <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={newQuestion.options?.[idx] || ""}
                      onChange={(e) => {
                        const options = [
                          ...(newQuestion.options || ["", "", "", ""]),
                        ];
                        options[idx] = e.target.value;
                        setNewQuestion({ ...newQuestion, options });
                      }}
                      placeholder={`Variant ${idx + 1}`}
                      className="px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-950/30 text-white text-sm"
                    />
                  ))}
                </div>

                <select
                  value={newQuestion.correctAnswer}
                  onChange={(e) =>
                    setNewQuestion({
                      ...newQuestion,
                      correctAnswer: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-amber-500/30 bg-amber-950/30 text-white"
                >
                  <option value="">To'g'ri javob</option>
                  {newQuestion.options?.map(
                    (opt, idx) =>
                      opt && (
                        <option key={idx} value={opt}>
                          {opt}
                        </option>
                      ),
                  )}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newQuestion.difficulty}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        difficulty: e.target.value as any,
                      })
                    }
                    className="px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-950/30 text-white"
                  >
                    <option value="easy">Oson</option>
                    <option value="medium">O'rtacha</option>
                    <option value="hard">Qiyin</option>
                  </select>
                  <input
                    type="number"
                    value={newQuestion.timeLimit}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        timeLimit: parseInt(e.target.value),
                      })
                    }
                    placeholder="Vaqt (s)"
                    className="px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-950/30 text-white"
                  />
                </div>

                {questionError && (
                  <p className="text-sm text-red-400">{questionError}</p>
                )}

                <button
                  onClick={addQuestion}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-bold hover:scale-[1.02] transition-all"
                >
                  {editingId ? "SAQLASH" : "QO'SHISH"}
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className="group relative overflow-hidden rounded-xl border border-amber-500/30 bg-amber-950/30 p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-white">
                          {q.question}
                        </p>
                        <p className="text-xs text-amber-300/70 mt-1">
                          {q.subject} · {q.difficulty} · {q.timeLimit}s
                        </p>
                      </div>
                      <button
                        onClick={() => removeQuestion(q.id)}
                        className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimesCircle />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            {teams.length === 4 && questions.length >= 4 && (
              <div className="lg:col-span-2 text-center">
                <button
                  onClick={startGame}
                  className="px-12 py-4 cursor-pointer bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl font-bold text-2xl hover:scale-105 transition-all shadow-2xl border-2 border-amber-400/50"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  <GiJungle className="inline mr-2" />
                  ENTER THE JUNGLE
                </button>
              </div>
            )}
          </div>
        )}

        {(phase === "game" || phase === "question") && (
          /* ========== O'YIN JARAYONI ========== */
          <div className="space-y-6 sm:space-y-8">
            {/* Teams Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
              {teams.map((team, idx) => (
                <div
                  key={team.id}
                  className={`relative group transform-gpu overflow-hidden rounded-xl border-2 p-3 transition-all sm:p-4 lg:p-5 ${
                    team.isActive
                      ? `border-amber-400/50 bg-gradient-to-br ${TEAM_COLORS[idx].primary} scale-105 shadow-2xl`
                      : "border-amber-500/30 bg-amber-950/30"
                  }`}
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${TEAM_COLORS[idx].primary} opacity-0 group-hover:opacity-10 transition-opacity`}
                  />

                  {team.isActive && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce">
                      ACTIVE
                    </div>
                  )}

                  <div className="relative mb-2 flex items-center gap-2 sm:mb-3 sm:gap-4">
                    {renderPawn(team, 32)}
                    <div>
                      <h3 className="text-lg font-bold text-white sm:text-xl">
                        {team.name}
                      </h3>
                      <p
                        className={`text-xs sm:text-sm ${team.isActive ? "text-white/80" : "text-amber-300/70"}`}
                      >
                        {TEAM_TITLES[idx]}
                      </p>
                    </div>
                  </div>

                  <div className="relative mb-2 flex items-center justify-between sm:mb-3">
                    <span className="text-sm text-amber-300 sm:text-base">SCORE</span>
                    <span className="text-2xl font-bold text-white sm:text-3xl">
                      {team.score}
                    </span>
                  </div>

                  <div className="relative h-2 rounded-full bg-amber-950/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all"
                      style={{
                        width: `${(getDisplayPosition(team) / (tiles.length - 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Jungle Map Board */}
            <div className="relative group transform-gpu overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-900/40 to-yellow-900/40 p-3 backdrop-blur-xl sm:p-4">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10" />

              <div className="relative w-full overflow-hidden rounded-xl">
                <div className="relative aspect-[4/5] min-h-[540px] w-full sm:aspect-[3/2] sm:min-h-0">
                  <img
                    src={JUMANJI_MAP_IMAGE}
                    alt="Jumanji map"
                    className="absolute inset-0 h-full w-full object-cover opacity-90"
                    draggable={false}
                  />

                  <svg
                    viewBox="0 0 100 100"
                    className="pointer-events-none absolute inset-0 z-10 h-full w-full"
                  >
                    <defs>
                      <linearGradient id="roadBase" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3f2b1b" />
                        <stop offset="50%" stopColor="#5c4028" />
                        <stop offset="100%" stopColor="#2d1d10" />
                      </linearGradient>
                      <linearGradient id="roadGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#e3be7a" />
                        <stop offset="100%" stopColor="#bb8a49" />
                      </linearGradient>
                      <radialGradient id="tileFill" cx="35%" cy="30%" r="75%">
                        <stop offset="0%" stopColor="#fff6d8" />
                        <stop offset="55%" stopColor="#d5ae67" />
                        <stop offset="100%" stopColor="#71502c" />
                      </radialGradient>
                      <radialGradient id="bossAura" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fde68a" stopOpacity="0.65" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {roadPoints.map((point, idx) => {
                      const next = roadPoints[idx + 1];
                      if (!next) return null;

                      return (
                        <g key={`road-${idx}`}>
                          <line
                            x1={point.x}
                            y1={point.y}
                            x2={next.x}
                            y2={next.y}
                            stroke="url(#roadBase)"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            opacity="0.9"
                          />
                          <line
                            x1={point.x}
                            y1={point.y}
                            x2={next.x}
                            y2={next.y}
                            stroke="url(#roadGlow)"
                            strokeWidth="1.15"
                            strokeLinecap="round"
                            strokeDasharray="1.1 1"
                            opacity="0.85"
                          />
                        </g>
                      );
                    })}

                    {roadPoints.map((point, idx) => {
                      const next = roadPoints[idx + 1];
                      if (!next) return null;
                      if (idx >= furthestDisplayPosition) return null;

                      return (
                        <line
                          key={`progress-road-${idx}`}
                          x1={point.x}
                          y1={point.y}
                          x2={next.x}
                          y2={next.y}
                          stroke="#fcd34d"
                          strokeWidth="1.55"
                          strokeLinecap="round"
                          opacity="0.95"
                        />
                      );
                    })}

                    {roadPoints.map((point, idx) => {
                      const isBoss = idx === roadPoints.length - 1;
                      const isSpecial = specialTileIndexes.has(idx);

                      return (
                        <g key={`tile-${idx}`}>
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r={isBoss ? 3.05 : isSpecial ? 2.15 : 1.75}
                            fill="url(#tileFill)"
                            stroke="#8b5e34"
                            strokeWidth={isBoss ? 0.3 : 0.15}
                            opacity={isBoss ? 1 : 0.96}
                          />
                          <circle
                            cx={point.x - 0.18}
                            cy={point.y - 0.2}
                            r={0.28}
                            fill="#ffffff"
                            opacity="0.38"
                          />
                          <text
                            x={point.x}
                            y={point.y - 1.45}
                            textAnchor="middle"
                            fontSize="1.05"
                            fill="#fde68a"
                            fontWeight="bold"
                            opacity="0.85"
                          >
                            {idx + 1}
                          </text>
                          {isBoss && (
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r={5.2}
                              fill="url(#bossAura)"
                            />
                          )}
                        </g>
                      );
                    })}

                    {teams.map((team) => {
                      const idx = getDisplayPosition(team);
                      const point = roadPoints[idx];
                      if (!point) return null;
                      const sameTileTeams = getTeamsOnTile(idx);
                      const teamIndex = teams.findIndex((t) => t.id === team.id);
                      const stackIdx = sameTileTeams.findIndex(
                        (t) => t.id === team.id,
                      );
                      const [ox, oy] = BOARD_STACK_OFFSETS[stackIdx] ?? [0, 0];
                      const medal =
                        TEAM_MEDALLIONS[Math.max(0, teamIndex)] ||
                        TEAM_MEDALLIONS[0];

                      return (
                        <g
                          key={team.id}
                          className="token-move"
                          transform={`translate(${point.x + ox + BOARD_TOKEN_NUDGE_X} ${point.y + oy + BOARD_TOKEN_NUDGE_Y})`}
                        >
                          <image
                            href={medal}
                            x={-BOARD_TOKEN_SIZE / 2}
                            y={-BOARD_TOKEN_SIZE / 2}
                            width={BOARD_TOKEN_SIZE}
                            height={BOARD_TOKEN_SIZE}
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {phase === "question" && currentQuestion && (
                    <div className="absolute inset-0 z-20 flex items-start justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-[2px] sm:items-center sm:p-4">
                      <div className="relative my-3 w-full max-w-4xl overflow-hidden rounded-3xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-900/90 to-yellow-900/90 p-4 shadow-2xl sm:my-0 sm:p-6">
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10" />

                        <div className="relative mb-4 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
                          {teams.map((team) => (
                            <div
                              key={`question-score-${team.id}`}
                              className={`rounded-xl border p-2.5 sm:p-3 ${
                                team.isActive
                                  ? "border-amber-400/60 bg-amber-500/20"
                                  : "border-amber-500/30 bg-amber-950/30"
                              }`}
                            >
                              <p className="truncate text-xs text-amber-200/80">
                                {team.name}
                              </p>
                              <p className="text-lg font-black text-white sm:text-xl">
                                {team.score}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="relative mb-5 flex flex-col gap-3 border-b border-amber-500/30 pb-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div className="relative">
                              <div className="absolute -inset-1 rounded-full bg-amber-500/30" />
                              <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-xl sm:h-12 sm:w-12 sm:text-2xl">
                                {currentTile?.icon}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-amber-300/70 sm:text-sm">
                                {currentQuestion.subject}
                              </p>
                              <h3 className="text-lg font-bold text-white sm:text-xl">
                                {currentTile?.type === "boss"
                                  ? "BOSS CHALLENGE"
                                  : "THE QUESTION"}
                              </h3>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 self-start rounded-xl border border-amber-500/30 bg-black/15 px-3 py-2 sm:self-auto sm:gap-3">
                            <FaClock className="text-lg text-amber-400 sm:text-xl" />
                            <span className="text-xl font-bold text-white sm:text-2xl">
                              {timeLeft}s
                            </span>
                          </div>
                        </div>

                        <h4 className="relative mb-5 text-center text-2xl font-bold leading-tight text-white sm:text-3xl">
                          "{currentQuestion.question}"
                        </h4>

                        <div className="relative mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                          {currentQuestion.options.map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleAnswer(option)}
                              disabled={showResult}
                              className={`
                                rounded-xl border-2 p-4 text-left text-base font-bold transition-all hover:scale-[1.02] sm:text-lg
                                ${
                                  showResult &&
                                  option === currentQuestion.correctAnswer
                                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                                    : showResult && selectedAnswer === option
                                      ? "border-red-500 bg-red-500/20 text-red-300"
                                      : "border-amber-500/30 bg-amber-950/30 text-white hover:border-amber-400"
                                }
                              `}
                            >
                              {option}
                            </button>
                          ))}
                        </div>

                        <div className="relative grid gap-4 md:grid-cols-2">
                          {showResult && (
                            <div
                              className={`rounded-xl border-2 p-4 text-center font-bold ${
                                isCorrect
                                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                                  : "border-red-500 bg-red-500/20 text-red-300"
                              }`}
                            >
                              <p>{isCorrect ? "CORRECT ANSWER!" : "WRONG ANSWER!"}</p>
                              {scoreAnnouncement && (
                                <p className="mt-2 text-2xl font-black">
                                  {scoreAnnouncement.points >= 0 ? "+" : ""}
                                  {scoreAnnouncement.points} ball
                                </p>
                              )}
                            </div>
                          )}

                          <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-4">
                            <p className="mb-2 text-sm font-bold text-amber-300">
                              OXIRGI BALL O'ZGARISHLARI
                            </p>
                            <div className="space-y-1">
                              {gameHistory.slice(-4).map((item, idx) => (
                                <p
                                  key={`question-log-${idx}`}
                                  className="text-xs text-amber-100/80"
                                >
                                  - {item}
                                </p>
                              ))}
                              {gameHistory.length === 0 && (
                                <p className="text-xs text-amber-200/60">
                                  Hozircha o'zgarish yo'q.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {phase === "game" && scoreAnnouncement && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]">
                      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-900/85 to-yellow-900/85 p-6 shadow-2xl">
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10" />

                        <div className="relative mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                          {teams.map((team) => (
                            <div
                              key={`score-popup-${team.id}`}
                              className={`rounded-xl border p-3 ${
                                team.id === scoreAnnouncement.teamId
                                  ? "border-amber-400/70 bg-amber-500/20"
                                  : "border-amber-500/30 bg-amber-950/30"
                              }`}
                            >
                              <p className="truncate text-xs text-amber-200/80">{team.name}</p>
                              <p className="text-xl font-black text-white">{team.score}</p>
                            </div>
                          ))}
                        </div>

                        <div className="relative rounded-2xl border border-amber-400/40 bg-black/20 p-6 text-center">
                          <p className="text-sm font-bold tracking-widest text-amber-200/80">
                            {scoreAnnouncement.title}
                          </p>
                          <p
                            className={`mt-2 text-5xl font-black ${
                              scoreAnnouncement.points >= 0
                                ? "text-emerald-300"
                                : "text-red-300"
                            }`}
                          >
                            {scoreAnnouncement.teamName} {scoreAnnouncement.points >= 0 ? "+" : ""}
                            {scoreAnnouncement.points}
                          </p>
                          <p className="mt-2 text-sm text-amber-100/85">
                            {scoreAnnouncement.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Dice and Controls */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
              <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
                {/* Realistic Dice */}
                <div
                  className={`
                    relative cursor-pointer
                    transform transition-all duration-300 hover:scale-110
                    ${isRolling ? "animate-spin" : ""}
                  `}
                  onClick={rollDice}
                >
                  <RealisticDice value={diceValue} />
                </div>

                {/* Dice Info */}
                <div className="text-amber-300">
                  <p className="text-sm font-bold">ROLL THE DICE</p>
                  <p className="text-xs opacity-70">
                    {isMoving
                      ? "FIGURE IS MOVING..."
                      : "TEAMS MOVE IN ORDER"}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={rollDice}
                  disabled={isRolling || isMoving}
                  className="rounded-xl border-2 border-amber-400/50 bg-gradient-to-r from-amber-600 to-yellow-600 px-6 py-3.5 text-base font-bold text-white transition-all hover:scale-105 disabled:opacity-50 sm:px-8 sm:py-4 sm:text-xl"
                >
                  <FaDice className="mr-2 inline" />
                  ROLL DICE
                </button>

                {/* Finish Game */}
                <button
                  onClick={() => finishGame()}
                  className="rounded-xl border-2 border-red-400/50 bg-gradient-to-r from-red-600 to-rose-600 px-6 py-3.5 text-base font-bold text-white transition-all hover:scale-105 sm:text-lg"
                >
                  END GAME
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/35 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-bold text-amber-300">
                  SO'NGGI +/- BALLAR
                </p>
                <span className="text-xs text-amber-200/70">
                  oxirgi {recentScoreEvents.length} ta
                </span>
              </div>
              <div className="space-y-1">
                {recentScoreEvents.length > 0 ? (
                  recentScoreEvents.map((item, idx) => (
                    <p key={`score-event-${idx}`} className="text-sm text-white/90">
                      - {item}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-amber-200/70">
                    Hozircha +/- ball o'zgarishi yo'q.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {phase === "finish" && winner && (
          /* ========== YAKUNIY NATIJALAR ========== */
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:items-center">
            {showConfetti && (
              <Confetti
                mode="boom"
                particleCount={500}
                effectCount={1}
                x={0.5}
                y={0.3}
                colors={["#f59e0b", "#ef4444", "#22c55e", "#3b82f6"]}
              />
            )}

            <div className="relative group flex w-full max-w-5xl flex-col justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900/85 via-yellow-900/80 to-amber-900/85 p-5 text-center shadow-2xl sm:p-10">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10" />

              {/* Trophy */}
              <div className="relative mb-8">
                <div className="pointer-events-none absolute inset-0  rounded-full bg-yellow-500/30" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 mx-auto">
                  <FaCrown className="text-5xl text-white" />
                </div>
              </div>

              <h2 className="relative text-4xl font-black text-transparent bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text mb-2">
                {winner.name} WINS!
              </h2>
              <p className="relative text-xl text-amber-300 mb-8">
                {winner.score} POINTS
              </p>

              {/* Results */}
              <div className="relative mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {teams
                  .sort((a, b) => b.score - a.score)
                  .map((team) => (
                    <div
                      key={team.id}
                      className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-4"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {renderPawn(team, 28)}
                        <span className="font-bold text-white">
                          {team.name}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-amber-400">
                        {team.score}
                      </p>
                      <p className="text-xs text-amber-300/70">points</p>
                    </div>
                  ))}
              </div>

              {/* Buttons */}
              <div className="relative flex flex-wrap justify-center gap-4">
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl font-bold hover:scale-105 transition-all"
                >
                  <FaRedo className="inline mr-2" />
                  PLAY AGAIN
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold hover:scale-105 transition-all"
                >
                  <FaTimesCircle className="inline mr-2" />
                  CLOSE
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
    </div>
  );
}

export default Jumanji;

