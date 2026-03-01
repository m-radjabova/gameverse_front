import { useState, useEffect, useRef } from "react";
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
} from "react-icons/fa";
import { GiJungle } from "react-icons/gi";
import diceSound from "../../../assets/sounds/roll_dice.mp3";
import correctSound from "../../../assets/sounds/correct.m4a";
import wrongSound from "../../../assets/sounds/wrong.m4a";
import winSound from "../../../assets/sounds/tada.mp3";
import jumanjiSound from "../../../assets/sounds/jumanji_sound.m4a";
import jumanjiBoardImage from "../../../assets/Jumanji-board.png";
import fireMedallion from "../../../assets/fire_medallion_transparent-Photoroom.png";
import leafMedallion from "../../../assets/leaf_medallion_transparent-Photoroom.png";
import maskMedallion from "../../../assets/mask_medallion_transparent-Photoroom.png";
import snakeMedallion from "../../../assets/snake_medallion_transparent-Photoroom.png";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../shared/useGameStartCountdown";

type Team = {
  id: number;
  name: string;
  color: string;
  avatar: string;
  position: number;
  score: number;
  isActive: boolean;
};

type Question = {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
};

type TileType = "question" | "bonus" | "trap" | "challenge" | "boss";

type Tile = {
  id: number;
  type: TileType;
  icon: string;
  color: string;
  name: string;
};

type Phase = "setup" | "game" | "question" | "result" | "finish";

const TEAM_AVATARS = ["🦁", "🐅", "🐘", "🦒"];
const TEAM_TITLES = ["AZURE", "EMERALD", "CRIMSON", "ONYX"];
const TEAM_COLORS = [
  {
    primary: "from-amber-500 to-yellow-500",
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  {
    primary: "from-red-500 to-rose-500",
    text: "text-red-300",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
  {
    primary: "from-green-500 to-emerald-500",
    text: "text-green-300",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  },
  {
    primary: "from-purple-500 to-pink-500",
    text: "text-purple-300",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
  },
];

const TEAM_MEDALLIONS = [
  fireMedallion,
  leafMedallion,
  maskMedallion,
  snakeMedallion,
];
const DICE_ROLL_TICK_MS = 120;
const DICE_ROLL_STEPS = 12;
const MOVE_STEP_DURATION_MS = 460;
const MOVE_FINISH_BUFFER_MS = 160;
const BOARD_TOKEN_SIZE = 7.74;
const BOARD_TOKEN_NUDGE_X = 0;
const BOARD_TOKEN_NUDGE_Y = -0.35;

const BOARD_STACK_OFFSETS: [number, number][] = [
  [0, 0],
  [-1.1, -1.1],
  [1.1, -1.1],
  [-1.1, 1.1],
  [1.1, 1.1],
];

const ROAD_POINTS = [
  { x: 24.5, y: 84.7 },
  { x: 29.4, y: 84.6 },
  { x: 34.4, y: 84.4 },
  { x: 39.5, y: 84.3 },
  { x: 44.8, y: 84.2 },
  { x: 50.0, y: 84.1 },
  { x: 55.2, y: 84.0 },
  { x: 60.4, y: 83.8 },
  { x: 65.5, y: 83.4 },
  { x: 70.2, y: 81.8 },
  { x: 73.1, y: 77.5 },
  { x: 71.9, y: 72.9 },
  { x: 67.8, y: 70.2 },
  { x: 62.7, y: 70.0 },
  { x: 57.5, y: 70.0 },
  { x: 52.2, y: 70.0 },
  { x: 46.9, y: 70.0 },
  { x: 41.8, y: 69.9 },
  { x: 37.4, y: 67.8 },
  { x: 34.8, y: 63.8 },
  { x: 34.2, y: 58.8 },
  { x: 35.6, y: 53.9 },
  { x: 39.1, y: 50.8 },
  { x: 44.0, y: 49.0 },
  { x: 49.1, y: 48.8 },
  { x: 54.3, y: 48.8 },
  { x: 59.5, y: 48.7 },
  { x: 64.7, y: 48.4 },
  { x: 69.6, y: 47.2 },
  { x: 74.2, y: 44.6 },
];

const TILES: Tile[] = [
  {
    id: 1,
    type: "question",
    icon: "❓",
    color: "from-amber-500 to-yellow-500",
    name: "SAVOL",
  },
  {
    id: 2,
    type: "question",
    icon: "❓",
    color: "from-amber-500 to-yellow-500",
    name: "SAVOL",
  },
  {
    id: 3,
    type: "bonus",
    icon: "🎁",
    color: "from-green-500 to-emerald-500",
    name: "BONUS",
  },
  {
    id: 4,
    type: "question",
    icon: "❓",
    color: "from-amber-500 to-yellow-500",
    name: "SAVOL",
  },
  {
    id: 5,
    type: "trap",
    icon: "🐍",
    color: "from-red-500 to-rose-500",
    name: "TUZOQ",
  },
  {
    id: 6,
    type: "question",
    icon: "❓",
    color: "from-amber-500 to-yellow-500",
    name: "SAVOL",
  },
  {
    id: 7,
    type: "challenge",
    icon: "⚡",
    color: "from-purple-500 to-pink-500",
    name: "CHALLENGE",
  },
  {
    id: 8,
    type: "question",
    icon: "❓",
    color: "from-amber-500 to-yellow-500",
    name: "SAVOL",
  },
  {
    id: 9,
    type: "question",
    icon: "❓",
    color: "from-amber-500 to-yellow-500",
    name: "SAVOL",
  },
  {
    id: 10,
    type: "bonus",
    icon: "🎁",
    color: "from-green-500 to-emerald-500",
    name: "BONUS",
  },
  {
    id: 11,
    type: "question",
    icon: "❓",
    color: "from-amber-500 to-yellow-500",
    name: "SAVOL",
  },
  {
    id: 12,
    type: "trap",
    icon: "🐍",
    color: "from-red-500 to-rose-500",
    name: "TUZOQ",
  },
  {
    id: 13,
    type: "question",
    icon: "❓",
    color: "from-amber-500 to-yellow-500",
    name: "SAVOL",
  },
  {
    id: 14,
    type: "challenge",
    icon: "⚡",
    color: "from-purple-500 to-pink-500",
    name: "CHALLENGE",
  },
  {
    id: 15,
    type: "question",
    icon: "❓",
    color: "from-amber-500 to-yellow-500",
    name: "SAVOL",
  },
  {
    id: 16,
    type: "question",
    icon: "❓",
    color: "from-amber-500 to-yellow-500",
    name: "SAVOL",
  },
  {
    id: 17,
    type: "bonus",
    icon: "🎁",
    color: "from-green-500 to-emerald-500",
    name: "BONUS",
  },
  {
    id: 18,
    type: "question",
    icon: "❓",
    color: "from-amber-500 to-yellow-500",
    name: "SAVOL",
  },
  {
    id: 19,
    type: "trap",
    icon: "🐍",
    color: "from-red-500 to-rose-500",
    name: "TUZOQ",
  },
  {
    id: 20,
    type: "question",
    icon: "❓",
    color: "from-amber-500 to-yellow-500",
    name: "SAVOL",
  },
  {
    id: 21,
    type: "boss",
    icon: "👑",
    color: "from-yellow-500 to-amber-500",
    name: "BOSS",
  },
  {
    id: 22,
    type: "question",
    icon: "❓",
    color: "from-amber-500 to-yellow-500",
    name: "SAVOL",
  },
  {
    id: 23,
    type: "challenge",
    icon: "⚡",
    color: "from-purple-500 to-pink-500",
    name: "CHALLENGE",
  },
  {
    id: 24,
    type: "question",
    icon: "❓",
    color: "from-amber-500 to-yellow-500",
    name: "SAVOL",
  },
  {
    id: 25,
    type: "bonus",
    icon: "🎁",
    color: "from-green-500 to-emerald-500",
    name: "BONUS",
  },
  {
    id: 26,
    type: "question",
    icon: "❓",
    color: "from-amber-500 to-yellow-500",
    name: "SAVOL",
  },
  {
    id: 27,
    type: "trap",
    icon: "🐍",
    color: "from-red-500 to-rose-500",
    name: "TUZOQ",
  },
  {
    id: 28,
    type: "question",
    icon: "❓",
    color: "from-amber-500 to-yellow-500",
    name: "SAVOL",
  },
  {
    id: 29,
    type: "question",
    icon: "❓",
    color: "from-amber-500 to-yellow-500",
    name: "SAVOL",
  },
  {
    id: 30,
    type: "boss",
    icon: "👑",
    color: "from-yellow-500 to-amber-500",
    name: "BOSS",
  },
];

const SUBJECTS = [
  "Matematika",
  "Tarix",
  "Geografiya",
  "Kimyo",
  "Ingliz tili",
  "Informatika",
];
const JUMANJI_MAP_IMAGE = jumanjiBoardImage;

const DEFAULT_QUESTIONS: Question[] = [
  {
    id: "1",
    subject: "Matematika",
    question: "25 + 17 = ?",
    options: ["32", "42", "52", "62"],
    correctAnswer: "42",
    difficulty: "easy",
    timeLimit: 30,
  },
  {
    id: "2",
    subject: "Geografiya",
    question: "O'zbekistonning poytaxti?",
    options: ["Samarqand", "Buxoro", "Toshkent", "Xiva"],
    correctAnswer: "Toshkent",
    difficulty: "easy",
    timeLimit: 30,
  },
  {
    id: "3",
    subject: "Tarix",
    question: "Amir Temur qachon tug'ilgan?",
    options: ["1336", "1405", "1370", "1325"],
    correctAnswer: "1336",
    difficulty: "medium",
    timeLimit: 40,
  },
  {
    id: "4",
    subject: "Kimyo",
    question: "Suvning kimyoviy formulasi?",
    options: ["H2O", "CO2", "NaCl", "O2"],
    correctAnswer: "H2O",
    difficulty: "easy",
    timeLimit: 30,
  },
];

function Jumanji() {
  // Audio refs
  const diceAudioRef = useRef<HTMLAudioElement | null>(null);
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const wrongAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  // Game state
  const [phase, setPhase] = useState<Phase>("setup");
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
  const { countdownValue, countdownVisible, runStartCountdown } =
    useGameStartCountdown();

  // Vintage paper texture
  const [paperTexture] = useState(() => (
    <div
      className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
        backgroundSize: "200px 200px",
      }}
    />
  ));

  // Initialize audio
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
      TILES.length - 1,
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

        if (newPosition >= TILES.length - 1) {
          finishGame({ ...currentTeam, position: newPosition });
          return;
        }

        const tile = TILES[newPosition];
        setCurrentTile(tile);
        handleTileAction(tile);
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
    const bonus = 15;

    setTeams((prev) =>
      prev.map((t) =>
        t.id === currentTeam.id ? { ...t, score: t.score + bonus } : t,
      ),
    );

    setGameHistory((prev) => [
      ...prev,
      `🎁 ${currentTeam.name} bonus oldi: +${bonus} ball`,
    ]);
    showToastMessage(`🎁 ${currentTeam.name} +${bonus} ball`);

    setTimeout(() => {
      checkDoubleTurn();
    }, 2000);
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
    showToastMessage(`🐍 ${currentTeam.name} -${penalty} ball`);

    setTimeout(() => {
      checkDoubleTurn();
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
    playSound("wrong");
    setShowResult(true);
    setIsCorrect(false);

    setTimeout(() => {
      checkDoubleTurn();
    }, 2000);
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

    setTimeout(() => {
      checkDoubleTurn();
    }, 2000);
  };

  // Check for double turn
  const checkDoubleTurn = () => {
    const resetQuestionState = () => {
      setPhase("game");
      setCurrentTile(null);
      setCurrentQuestion(null);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
    };

    if (diceValue % 2 === 0 && currentTile?.type !== "trap") {
      showToastMessage("🎲 Juftlik! Yana bir marta tashlash huquqi!");
      resetQuestionState(); // modalni yopadi
      return;
    }

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
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const getDisplayPosition = (team: Team) => {
    const rawPosition = visualPositions[team.id] ?? team.position;
    return rawPosition;
  };

  const getTeamsOnTile = (tileIndex: number) =>
    teams.filter((team) => getDisplayPosition(team) === tileIndex);

  const getTileRotation = (idx: number) => {
    const prev = ROAD_POINTS[Math.max(0, idx - 1)];
    const next = ROAD_POINTS[Math.min(ROAD_POINTS.length - 1, idx + 1)];
    const angle = Math.atan2(next.y - prev.y, next.x - prev.x);
    return (angle * 180) / Math.PI;
  };

  const getDicePips = (value: number) => {
    const map: Record<number, [number, number][]> = {
      1: [[50, 50]],
      2: [
        [30, 30],
        [70, 70],
      ],
      3: [
        [30, 30],
        [50, 50],
        [70, 70],
      ],
      4: [
        [30, 30],
        [30, 70],
        [70, 30],
        [70, 70],
      ],
      5: [
        [30, 30],
        [30, 70],
        [50, 50],
        [70, 30],
        [70, 70],
      ],
      6: [
        [30, 25],
        [30, 50],
        [30, 75],
        [70, 25],
        [70, 50],
        [70, 75],
      ],
    };
    return map[value] ?? map[1];
  };

  const recentScoreEvents = gameHistory
    .filter((item) => /[+-]\d+\s*ball/i.test(item))
    .slice(-5)
    .reverse();

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

  // Enhanced Keramik Kubik SVG
  const renderRealisticDice = () => {
    const pips = getDicePips(diceValue);

    return (
      <svg
        viewBox="0 0 120 120"
        className="w-24 h-24 drop-shadow-[0_16px_24px_rgba(0,0,0,0.7)] hover:scale-110 transition-all duration-300"
      >
        <defs>
          <linearGradient
            id="diceGradientTop"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#fffaf0" />
            <stop offset="40%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#f3e8d8" />
          </linearGradient>

          <linearGradient
            id="diceGradientSide"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#f9e8d4" />
            <stop offset="100%" stopColor="#e8d5c4" />
          </linearGradient>

          <filter id="diceShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
            <feOffset dx="2" dy="5" result="shadow" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.4" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id="diceShine" cx="30%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect
          x="12"
          y="12"
          width="96"
          height="96"
          rx="12"
          fill="url(#diceGradientTop)"
          stroke="#9b8874"
          strokeWidth="2.5"
          filter="url(#diceShadow)"
        />

        <polygon
          points="108,12 120,20 120,116 108,108"
          fill="url(#diceGradientSide)"
          stroke="#7a6859"
          strokeWidth="2"
        />
        <polygon
          points="12,108 20,120 116,120 108,108"
          fill="url(#diceGradientSide)"
          stroke="#7a6859"
          strokeWidth="2"
        />

        <rect
          x="12"
          y="12"
          width="96"
          height="96"
          rx="12"
          fill="url(#diceShine)"
        />

        {pips.map(([cx, cy], idx) => (
          <g key={`pip-${idx}`}>
            <circle
              cx={cx * 0.96 + 2.4}
              cy={cy * 0.96 + 2.4}
              r="4.5"
              fill="#000000"
              opacity="0.15"
            />
            <circle
              cx={cx * 0.96}
              cy={cy * 0.96}
              r="4.5"
              fill="#4a3728"
              stroke="#2d2416"
              strokeWidth="0.6"
            />
            <circle
              cx={cx * 0.96 - 1}
              cy={cy * 0.96 - 1}
              r="1.5"
              fill="#ffffff"
              opacity="0.4"
            />
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/90 via-amber-900/90 to-amber-950/90 p-6 backdrop-blur-xl shadow-2xl"
      style={{ minHeight: "100vh" }}
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
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl opacity-10 animate-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 20}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              {["🌿", "🌴", "🍃", "🌱", "🌵", "🌳"][i % 6]}
            </div>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-6 py-3 rounded-full shadow-2xl animate-bounce backdrop-blur-sm border-2 border-amber-400">
            {toast}
          </div>
        </div>
      )}

      {/* Mute Button */}
      <button
        onClick={toggleMute}
        className="fixed top-6 right-6 z-50 p-3 bg-amber-900/50 border-2 border-amber-500/30 text-amber-400 rounded-xl hover:bg-amber-800/50 transition-all backdrop-blur-sm"
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
                {questions.map((q, idx) => (
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
                  className="px-12 py-4 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl font-bold text-2xl hover:scale-105 transition-all shadow-2xl border-2 border-amber-400/50"
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
          <div className="space-y-8">
            {/* Teams Stats */}
            <div className="grid grid-cols-2 gap-6">
              {teams.map((team, idx) => (
                <div
                  key={team.id}
                  className={`relative group transform-gpu overflow-hidden rounded-xl border-2 p-5 transition-all ${
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

                  <div className="relative flex items-center gap-4 mb-3">
                    {renderPawn(team, 40)}
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {team.name}
                      </h3>
                      <p
                        className={`text-sm ${team.isActive ? "text-white/80" : "text-amber-300/70"}`}
                      >
                        {TEAM_TITLES[idx]}
                      </p>
                    </div>
                  </div>

                  <div className="relative flex justify-between items-center mb-3">
                    <span className="text-amber-300">SCORE</span>
                    <span className="text-3xl font-bold text-white">
                      {team.score}
                    </span>
                  </div>

                  <div className="relative h-2 rounded-full bg-amber-950/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all"
                      style={{
                        width: `${(getDisplayPosition(team) / (TILES.length - 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Jungle Map Board */}
            <div className="relative group transform-gpu overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-900/40 to-yellow-900/40 p-4 backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10" />

              <div className="relative w-full overflow-hidden rounded-xl">
                <div className="relative aspect-[3/2] w-full">
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
                    {teams.map((team) => {
                      const idx = getDisplayPosition(team);
                      const point = ROAD_POINTS[idx];
                      if (!point) return null;
                      const sameTileTeams = teams.filter(
                        (t) => getDisplayPosition(t) === idx,
                      );
                      const teamIndex = teams.findIndex((t) => t.id === team.id);
                      const orderedSameTileTeams = [...sameTileTeams].sort(
                        (a, b) =>
                          teams.findIndex((t) => t.id === a.id) -
                          teams.findIndex((t) => t.id === b.id),
                      );
                      const stackIdx = orderedSameTileTeams.findIndex(
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
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">
                      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-900/85 to-yellow-900/85 p-6 shadow-2xl">
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10" />

                        <div className="relative mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                          {teams.map((team) => (
                            <div
                              key={`question-score-${team.id}`}
                              className={`rounded-xl border p-3 ${
                                team.isActive
                                  ? "border-amber-400/60 bg-amber-500/20"
                                  : "border-amber-500/30 bg-amber-950/30"
                              }`}
                            >
                              <p className="truncate text-xs text-amber-200/80">
                                {team.name}
                              </p>
                              <p className="text-xl font-black text-white">
                                {team.score}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="relative mb-6 flex items-center justify-between border-b border-amber-500/30 pb-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="absolute -inset-1 rounded-full bg-amber-500/30" />
                              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-2xl">
                                {currentTile?.icon}
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-amber-300/70">
                                {currentQuestion.subject}
                              </p>
                              <h3 className="text-xl font-bold text-white">
                                {currentTile?.type === "boss"
                                  ? "BOSS CHALLENGE"
                                  : "THE QUESTION"}
                              </h3>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <FaClock className="text-amber-400 text-xl" />
                            <span className="text-2xl font-bold text-white">
                              {timeLeft}s
                            </span>
                          </div>
                        </div>

                        <h4 className="relative mb-5 text-center text-2xl font-bold text-white">
                          "{currentQuestion.question}"
                        </h4>

                        <div className="relative mb-5 grid grid-cols-1 gap-3 md:grid-cols-2">
                          {currentQuestion.options.map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleAnswer(option)}
                              disabled={showResult}
                              className={`
                                p-4 rounded-xl border-2 text-left font-bold transition-all hover:scale-[1.02]
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
                              {isCorrect
                                ? "CORRECT ANSWER!"
                                : "WRONG ANSWER!"}
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
                </div>
              </div>
            </div>

            {/* Dice and Controls */}
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {/* Realistic Dice */}
                <div
                  className={`
                    relative cursor-pointer
                    transform transition-all duration-300 hover:scale-110
                    ${isRolling ? "animate-spin" : ""}
                  `}
                  onClick={rollDice}
                >
                  {renderRealisticDice()}
                </div>

                {/* Dice Info */}
                <div className="text-amber-300">
                  <p className="text-sm font-bold">ROLL THE DICE</p>
                  <p className="text-xs opacity-70">
                    {isMoving
                      ? "FIGURE IS MOVING..."
                      : "DOUBLES GET ANOTHER TURN"}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={rollDice}
                disabled={isRolling || isMoving}
                className="px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl font-bold text-xl hover:scale-105 transition-all disabled:opacity-50 shadow-2xl border-2 border-amber-400/50"
              >
                <FaDice className="inline mr-2" />
                ROLL DICE
              </button>

              {/* Finish Game */}
              <button
                onClick={() => finishGame()}
                className="px-6 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold text-lg hover:scale-105 transition-all shadow-2xl border-2 border-red-400/50"
              >
                END GAME
              </button>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
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

            <div className="relative group flex h-full w-full flex-col justify-center transform-gpu overflow-hidden bg-gradient-to-br from-amber-900/85 via-yellow-900/80 to-amber-900/85 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-10">
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
              <div className="relative grid grid-cols-2 gap-4 mb-8">
                {teams
                  .sort((a, b) => b.score - a.score)
                  .map((team, idx) => (
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
