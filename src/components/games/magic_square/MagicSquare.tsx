import { useState, useEffect, useRef } from "react";
import Confetti from "react-confetti-boom";
import {
  FaUsers,
  FaRedo,
  FaPlay,
  FaTimesCircle,
  FaClock,
  FaCrown,
  FaVolumeUp,
  FaVolumeMute,
  FaMagic,
} from "react-icons/fa";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../shared/useGameStartCountdown";

type Team = {
  id: number;
  name: string;
  color: string;
  avatar: string;
  score: number;
  isActive: boolean;
  completedPuzzles: number;
  timeLeft: number;
  grid: (string | null)[][];
};

type Phase = "teacher" | "game" | "result" | "finish";

const TEAM_AVATARS = ["🦉", "🦜"];
const TEAM_COLORS = [
  { primary: "from-orange-400 to-amber-400", text: "text-orange-300", bg: "bg-orange-500/10", border: "border-orange-500/30" },
  { primary: "from-teal-400 to-cyan-400", text: "text-teal-300", bg: "bg-teal-500/10", border: "border-teal-500/30" },
];

const COLORS = [
  { id: 1, name: "Qizil", emoji: "\u{1F534}", color: "bg-red-500", border: "border-red-600", glow: "shadow-red-500/50", text: "text-red-500" },
  { id: 2, name: "Ko'k", emoji: "\u{1F535}", color: "bg-blue-500", border: "border-blue-600", glow: "shadow-blue-500/50", text: "text-blue-500" },
  { id: 3, name: "Sariq", emoji: "\u{1F7E1}", color: "bg-yellow-500", border: "border-yellow-600", glow: "shadow-yellow-500/50", text: "text-yellow-500" },
];

const RED = "\u{1F534}";
const BLUE = "\u{1F535}";
const YELLOW = "\u{1F7E1}";
const PUZZLE_TEMPLATES = [
  {
    grid: [
      [RED, null, YELLOW],
      [YELLOW, RED, null],
      [null, YELLOW, RED],
    ],
    solution: [
      [RED, BLUE, YELLOW],
      [YELLOW, RED, BLUE],
      [BLUE, YELLOW, RED],
    ],
  },
  {
    grid: [
      [BLUE, YELLOW, null],
      [RED, null, YELLOW],
      [null, RED, BLUE],
    ],
    solution: [
      [BLUE, YELLOW, RED],
      [RED, BLUE, YELLOW],
      [YELLOW, RED, BLUE],
    ],
  },
  {
    grid: [
      [null, RED, BLUE],
      [BLUE, null, RED],
      [RED, BLUE, null],
    ],
    solution: [
      [YELLOW, RED, BLUE],
      [BLUE, YELLOW, RED],
      [RED, BLUE, YELLOW],
    ],
  },
];
function MagicSquare() {
  // Audio refs
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);

  // Game state
  const [phase, setPhase] = useState<Phase>("teacher");
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [teamError, setTeamError] = useState("");
  
  // Puzzle state
  const [puzzles] = useState(PUZZLE_TEMPLATES);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [roundWinner, setRoundWinner] = useState<number | null>(null);
  
  // Gameplay state
  const [toast, setToast] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [winner, setWinner] = useState<Team | null>(null);
  const [roundTimer, setRoundTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState<null | { title: string; subtitle?: string }>(null);
  const { countdownValue, countdownVisible, runStartCountdown } =
    useGameStartCountdown();
  const activeTeam = teams.find((t) => t.isActive);

  // Initialize audio
  useEffect(() => {
    correctAudioRef.current = new Audio("/sounds/correct.mp3");
    winAudioRef.current = new Audio("/sounds/win.mp3");

    return () => {
      [correctAudioRef, winAudioRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current = null;
        }
      });
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (!isTimerActive || phase !== "game") return;

    if (roundTimer <= 0) {
      handleTimeout();
      return;
    }

    const timer = setTimeout(() => {
      setRoundTimer(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [roundTimer, isTimerActive, phase]);

  // Play sound
  const playSound = (type: "correct" | "win") => {
    if (isMuted) return;

    const audioMap = {
      correct: correctAudioRef.current,
      win: winAudioRef.current,
    };

    const audio = audioMap[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  // Toast messages
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  // Add team
  const addTeam = () => {
    const name = newTeamName.trim();
    if (!name) {
      setTeamError("Jamoa nomini kiriting!");
      return;
    }
    if (teams.length >= 2) {
      setTeamError("2 ta jamoa yetarli!");
      return;
    }
    if (teams.some(t => t.name.toLowerCase() === name.toLowerCase())) {
      setTeamError("Bu jamoa allaqachon qo'shilgan!");
      return;
    }

    const puzzle = puzzles[0];
    const initialGrid = puzzle.grid.map(row => [...row]);

    const newTeam: Team = {
      id: Date.now() + Math.random(),
      name,
      color: TEAM_COLORS[teams.length].primary,
      avatar: TEAM_AVATARS[teams.length],
      score: 0,
      isActive: teams.length === 0,
      completedPuzzles: 0,
      timeLeft: 60,
      grid: initialGrid,
    };

    setTeams([...teams, newTeam]);
    setNewTeamName("");
    setTeamError("");
    showToast(`✅ ${name} qo'shildi`);
  };

  // Remove team
  const removeTeam = (id: number) => {
    const team = teams.find(t => t.id === id);
    setTeams(teams.filter(t => t.id !== id));
    showToast(`${team?.name} o'chirildi`);
  };

  // Start game
  const startGameNow = () => {
    // Reset teams with initial puzzle
    const puzzle = puzzles[0];
    const initialGrid = puzzle.grid.map(row => [...row]);

    setTeams(prev => prev.map((t, idx) => ({
      ...t,
      score: 0,
      isActive: idx === 0,
      completedPuzzles: 0,
      timeLeft: 60,
      grid: initialGrid.map(row => [...row]),
    })));

    setCurrentPuzzleIndex(0);
    setSelectedColor(null);
    setRoundTimer(60);
    setIsTimerActive(true);
    setPhase("game");
    showToast("🎮 O'yin boshlandi! 1-jamoa boshlaydi");
  };

  const startGame = () => {
    if (teams.length !== 2) {
      showToast("2 ta jamoa bo'lishi kerak!");
      return;
    }
    runStartCountdown(startGameNow);
  };

    // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (phase !== "game") return;

    const currentTeam = teams.find((t) => t.isActive);
    if (!currentTeam) return;

    const puzzle = puzzles[currentPuzzleIndex];
    const cell = puzzle.grid[row][col];

    if (cell !== null) {
      showToast("Bu katakni o'zgartirib bo'lmaydi!");
      return;
    }

    if (!selectedColor) {
      showToast("Avval rang tanlang!");
      return;
    }

    const nextGrid = currentTeam.grid.map((gridRow) => [...gridRow]);
    nextGrid[row][col] = selectedColor;
    const isSolved = nextGrid.every((gridRow, rIdx) =>
      gridRow.every((value, cIdx) => value === puzzle.solution[rIdx][cIdx])
    );

    setTeams((prev) =>
      prev.map((t) => {
        if (!t.isActive) return t;
        return { ...t, grid: nextGrid };
      })
    );

    if (isSolved) {
      handlePuzzleComplete(currentTeam.id);
    }
  };

  // Handle puzzle complete
  const handlePuzzleComplete = (teamId: number) => {
    playSound("correct");

    const solvedTeam = teams.find((t) => t.id === teamId);
    if (!solvedTeam) return;

    const timeBonus = Math.floor(roundTimer / 10) * 5;
    const points = 30 + timeBonus;

    setTeams((prev) =>
      prev.map((t) => {
        if (t.id === teamId) {
          return {
            ...t,
            score: t.score + points,
            completedPuzzles: t.completedPuzzles + 1,
          };
        }
        return t;
      })
    );

    setRoundWinner(teams.findIndex((t) => t.id === teamId));
    setGameHistory((prev) => [...prev, `${solvedTeam.name} sehrli kvadratni yechdi! +${points} ball`]);
    showToast(`Ajoyib! +${points} ball`);
    setOverlayMessage({
      title: "\u2705 To'g'ri!",
      subtitle: `+${points} ball (30 + bonus) - Keyingi masala tayyorlanmoqda...`,
    });
    setSelectedColor(null);

    setTimeout(() => {
      setOverlayMessage(null);
      if (currentPuzzleIndex + 1 < puzzles.length) {
        const nextPuzzleIndex = currentPuzzleIndex + 1;
        const nextPuzzle = puzzles[nextPuzzleIndex];

        setCurrentPuzzleIndex(nextPuzzleIndex);
        setRoundTimer(60);
        setRoundWinner(null);

        setTeams((prev) => {
          const activeIndex = prev.findIndex((t) => t.isActive);
          const nextActive = activeIndex === -1 ? 0 : (activeIndex + 1) % prev.length;

          return prev.map((t, idx) => ({
            ...t,
            isActive: idx === nextActive,
            grid: nextPuzzle.grid.map((gridRow) => [...gridRow]),
            timeLeft: 60,
          }));
        });
      } else {
        finishGame();
      }
    }, 1800);
  };

  // Handle timeout
  const handleTimeout = () => {
    setIsTimerActive(false);
    showToast("Vaqt tugadi! Keyingi jamoa boshlaydi");
    setOverlayMessage({
      title: "Vaqt tugadi!",
      subtitle: "Navbat keyingi jamoaga o'tdi",
    });

    setTimeout(() => {
      setOverlayMessage(null);
      const puzzle = puzzles[currentPuzzleIndex];
      setTeams((prev) => {
        const activeIndex = prev.findIndex((t) => t.isActive);
        const nextActive = activeIndex === -1 ? 0 : (activeIndex + 1) % prev.length;

        return prev.map((t, idx) => ({
          ...t,
          isActive: idx === nextActive,
          grid: idx === nextActive ? puzzle.grid.map((gridRow) => [...gridRow]) : t.grid,
        }));
      });
      setSelectedColor(null);
      setRoundTimer(60);
      setIsTimerActive(true);
    }, 1800);
  };

  // Finish game
  const finishGame = () => {
    setIsTimerActive(false);
    playSound("win");
    setShowConfetti(true);

    const sorted = [...teams].sort((a, b) => b.score - a.score);
    setWinner(sorted[0]);
    setPhase("finish");
    showToast("🏁 O'yin tugadi!");
  };

  // Reset game
  const resetGame = () => {
    setPhase("teacher");
    setTeams([]);
    setCurrentPuzzleIndex(0);
    setSelectedColor(null);
    setRoundTimer(60);
    setIsTimerActive(false);
    setShowConfetti(false);
    setGameHistory([]);
    setWinner(null);
    setRoundWinner(null);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Get color info by emoji
  const getColorInfo = (emoji: string | null) => {
    if (!emoji) return null;
    return COLORS.find((c) => c.emoji === emoji);
  };
  // Render team's grid
  const renderTeamGrid = (team: Team) => {
    return (
      <div className="grid grid-cols-3 gap-2 w-48 mx-auto">
        {team.grid.map((row, rowIdx) => 
          row.map((cell, colIdx) => {
            const colorInfo = getColorInfo(cell);
            const isEditable = puzzles[currentPuzzleIndex].grid[rowIdx][colIdx] === null;
            
            return (
              <button
                key={`${rowIdx}-${colIdx}`}
                onClick={() => handleCellClick(rowIdx, colIdx)}
                disabled={!team.isActive || !isEditable}
                title={
                  isEditable
                    ? "Bo'sh katak - shu yerga rang qo'ying"
                    : "Berilgan katak - o'zgartirib bo'lmaydi"
                }
                className={`
                  aspect-square rounded-xl text-3xl font-bold
                  transition-all duration-300
                  ${isEditable 
                    ? team.isActive 
                      ? 'hover:scale-110 hover:shadow-2xl cursor-pointer' 
                      : 'opacity-70 cursor-not-allowed'
                    : 'cursor-default'
                  }
                  ${colorInfo?.color ? colorInfo.color : 'bg-purple-100/20'}
                  ${isEditable && !cell ? 'bg-purple-100/35 border-[3px] border-dashed border-purple-300/90 text-purple-200' : ''}
                  ${roundWinner !== null && team.isActive ? 'animate-pulse ring-4 ring-green-400' : ''}
                  shadow-lg hover:shadow-xl
                `}
              >
                {isEditable && !cell ? "?" : cell}
              </button>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950 dark:via-pink-950 dark:to-purple-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-purple-300/20 blur-3xl dark:bg-purple-600/20" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse-slower rounded-full bg-pink-300/20 blur-3xl dark:bg-pink-600/20" />
        
        {/* Soft Pattern */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, #c084fc 2px, transparent 2px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating Magic Icons */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl opacity-20 animate-float dark:opacity-10"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 20}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              {["✨", "🌟", "💫", "⭐", "✨", "🌟"][i % 6]}
            </div>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-2xl animate-bounce backdrop-blur-sm border-2 border-purple-300">
            {toast}
          </div>
        </div>
      )}

      {/* Mute Button */}
      <button
        onClick={toggleMute}
        className="fixed top-6 right-6 z-50 p-3 bg-purple-900/50 border-2 border-purple-500/30 text-purple-300 rounded-xl hover:bg-purple-800/50 transition-all backdrop-blur-sm"
      >
        {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
      </button>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6">

        {phase === "teacher" && (
          /* ========== O'QITUVCHI PANELI ========== */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Teams Panel */}
            <div className="relative group transform-gpu overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/40 to-pink-900/40 p-6 backdrop-blur-xl">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
              
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-purple-500/30">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-purple-500/30" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
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
                    className="flex-1 px-4 py-2 rounded-xl border border-purple-500/30 bg-purple-950/30 text-white placeholder-purple-300/50 focus:border-purple-400 focus:outline-none"
                  />
                  <button
                    onClick={addTeam}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:scale-105 transition-all"
                  >
                    Qo'shish
                  </button>
                </div>
                {teamError && <p className="mt-2 text-sm text-red-400">{teamError}</p>}
              </div>

              <div className="space-y-3">
                {teams.map((team, idx) => (
                  <div
                    key={team.id}
                    className="group relative overflow-hidden rounded-xl border border-purple-500/30 bg-purple-950/30 p-3 transition-all hover:bg-purple-900/40"
                  >
                    <div className={`absolute inset-0 pointer-events-none bg-gradient-to-r ${TEAM_COLORS[idx].primary} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{team.avatar}</span>
                        <div>
                          <p className="text-sm font-bold text-white">{team.name}</p>
                          <p className="text-xs text-purple-300/70">{idx === 0 ? "CHAP JAMOA" : "O'NG JAMOA"}</p>
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

            {/* Info Panel */}
            <div className="relative group transform-gpu overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/40 to-pink-900/40 p-6 backdrop-blur-xl">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
              
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-purple-500/30">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-purple-500/30" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                    <FaMagic className="text-white text-sm" />
                  </div>
                </div>
                <h2 className="text-xl font-black text-white">SEHRLI KVADRAT</h2>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-950/30 rounded-xl p-4 border border-purple-500/30">
                  <h3 className="text-sm font-bold text-purple-300 mb-3">RANGLAR</h3>
                  <div className="flex justify-center gap-4">
                    {COLORS.map(color => (
                      <div key={color.id} className="text-center">
                        <div className={`w-12 h-12 rounded-full ${color.color} mx-auto mb-2 shadow-lg border-2 border-white/30`}>
                          <span className="text-2xl">{color.emoji}</span>
                        </div>
                        <p className="text-xs text-white">{color.name}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-950/30 rounded-xl p-4 border border-purple-500/30">
                  <h3 className="text-sm font-bold text-purple-300 mb-3">QOIDALAR</h3>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-center gap-2">
                      <span className="text-purple-400">•</span>
                      Har bir qator va ustunda barcha 3 rang bo'lishi kerak
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-400">•</span>
                      Hech qanday rang takrorlanmasligi kerak
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-400">•</span>
                      Jamoalar navbat bilan o'ynaydi
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-400">•</span>
                      To'g'ri yechim uchun 30 ball
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-950/30 rounded-xl p-4 border border-purple-500/30">
                  <h3 className="text-sm font-bold text-purple-300 mb-3">MISOL</h3>
                  <div className="grid grid-cols-3 gap-2 w-36 mx-auto">
                    <div className="aspect-square rounded-lg bg-red-500 flex items-center justify-center">🔴</div>
                    <div className="aspect-square rounded-lg bg-blue-500 flex items-center justify-center">🔵</div>
                    <div className="aspect-square rounded-lg bg-yellow-500 flex items-center justify-center">🟡</div>
                    <div className="aspect-square rounded-lg bg-yellow-500 flex items-center justify-center">🟡</div>
                    <div className="aspect-square rounded-lg bg-red-500 flex items-center justify-center">🔴</div>
                    <div className="aspect-square rounded-lg bg-blue-500 flex items-center justify-center">🔵</div>
                    <div className="aspect-square rounded-lg bg-purple-100/20 border-2 border-dashed border-purple-400/50 flex items-center justify-center">вќ“</div>
                    <div className="aspect-square rounded-lg bg-yellow-500 flex items-center justify-center">🟡</div>
                    <div className="aspect-square rounded-lg bg-red-500 flex items-center justify-center">🔴</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Start Button */}
            {teams.length === 2 && (
              <div className="lg:col-span-2 text-center">
                <button
                  onClick={startGame}
                  className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-2xl hover:scale-105 transition-all shadow-2xl border-2 border-purple-400/50"
                >
                  <FaPlay className="inline mr-2" />
                  SEHRLI KADRATNI BOSHLASH
                </button>
              </div>
            )}
          </div>
        )}

        {phase === "game" && (
          /* ========== O'YIN JARAYONI ========== */
          <div className="space-y-8">
            {overlayMessage && (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
                <div className="w-full max-w-xl rounded-2xl border border-purple-300/40 bg-gradient-to-br from-purple-900/90 to-pink-900/90 p-6 text-center shadow-2xl">
                  <p className="text-3xl font-black text-white">{overlayMessage.title}</p>
                  {overlayMessage.subtitle && (
                    <p className="mt-2 text-base text-purple-100">{overlayMessage.subtitle}</p>
                  )}
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-purple-900/30 border-2 border-purple-500/30 rounded-xl px-4 py-2">
                  <p className="text-xs text-purple-300">Masala</p>
                  <p className="text-lg font-bold text-white">{currentPuzzleIndex + 1}/{puzzles.length}</p>
                </div>
                <div className="bg-purple-900/30 border-2 border-purple-500/30 rounded-xl px-4 py-2">
                  <p className="text-xs text-purple-300">Vaqt</p>
                  <p className="text-lg font-bold text-white flex items-center gap-1">
                    <FaClock className="text-purple-400" />
                    {roundTimer}s
                  </p>
                </div>
              </div>

              <div className="text-center lg:text-right">
                <p className="text-sm text-purple-300 mb-1">Hozirgi navbat</p>
                <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-end">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className={`px-4 py-2 rounded-xl border-2 transition-all ${
                        team.isActive 
                          ? `bg-gradient-to-r ${team.color} border-white scale-105 shadow-2xl` 
                          : 'border-purple-500/30 bg-purple-900/30'
                      }`}
                    >
                      <span className="text-2xl mr-2">{team.avatar}</span>
                      <span className="font-bold text-white">{team.name}</span>
                      {team.isActive && (
                        <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full animate-pulse">
                          NAVBAT
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Instruction Bar */}
            <div className="grid gap-3 rounded-xl border border-purple-400/40 bg-purple-900/30 p-4 text-sm text-purple-100 backdrop-blur-sm md:grid-cols-2 xl:grid-cols-4">
              <p className="rounded-lg bg-purple-950/40 px-3 py-2">1-qadam: Rang tanlang </p>
              <p className="rounded-lg bg-purple-950/40 px-3 py-2">2-qadam: Bo&apos;sh katakka bosing (chiziqli kataklar)</p>
              <p className="rounded-lg bg-purple-950/40 px-3 py-2">Qoida: Har qator va ustunda 3 xil rang bo&apos;lsin</p>
              <p className="rounded-lg bg-purple-950/40 px-3 py-2">Taymer tugasa navbat almashadi</p>
            </div>

            {/* Status Banner */}
            <div
              className={`rounded-xl border-2 p-4 backdrop-blur-sm ${
                selectedColor
                  ? "border-emerald-400/60 bg-emerald-900/20"
                  : "border-amber-400/70 bg-amber-900/20"
              }`}
            >
              <p className="text-base font-bold text-white">
                Hozir o&apos;ynayapti: {activeTeam?.avatar ?? "\u{1F465}"} {activeTeam?.name ?? "Jamoa tanlanmagan"}
              </p>
              <p className="mt-1 text-sm text-white/90">
                Tanlangan rang: {selectedColor ?? "Tanlanmagan"}
              </p>
              {!selectedColor && (
                <p className="mt-2 text-sm font-semibold text-amber-200">
                  Rang tanlanmagan - avval rang tanlang!
                </p>
              )}
            </div>

            {/* Color Selection */}
            <div className="flex justify-center gap-6 p-4 bg-purple-900/30 rounded-xl border border-purple-500/30 backdrop-blur-sm">
              {COLORS.map(color => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.emoji)}
                  className={`
                    relative group transform transition-all duration-300
                    ${selectedColor === color.emoji ? 'scale-125 -translate-y-2' : 'hover:scale-110 hover:-translate-y-1'}
                  `}
                >
                  <div className={`w-16 h-16 rounded-full ${color.color} shadow-xl border-4 ${
                    selectedColor === color.emoji ? 'border-white scale-110' : 'border-white/30'
                  } flex items-center justify-center`}>
                    <span className="text-3xl">{color.emoji}</span>
                  </div>
                  {selectedColor === color.emoji && (
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                        Tanlangan
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Teams Grids */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {teams.map((team, idx) => (
                <div
                  key={team.id}
                  className={`
                    relative transform-gpu overflow-hidden rounded-2xl border-2 p-6 backdrop-blur-xl
                    ${team.isActive 
                      ? `border-purple-400/50 bg-gradient-to-br ${team.color} scale-105 shadow-2xl` 
                      : 'border-purple-500/30 bg-purple-950/30 opacity-80'}
                  `}
                >
                  {team.isActive && (
                    <div className={`absolute inset-0 pointer-events-none bg-gradient-to-r ${TEAM_COLORS[idx].primary} opacity-0 transition-opacity group-hover:opacity-10`} />
                  )}
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{team.avatar}</span>
                      <div>
                        <h3 className="text-xl font-bold text-white">{team.name}</h3>
                        <p className="text-sm text-purple-300/70">{idx === 0 ? "CHAP JAMOA" : "O'NG JAMOA"}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-2xl font-bold text-white">{team.score}</p>
                        <p className="text-xs text-purple-300">ball</p>
                      </div>
                    </div>

                    {renderTeamGrid(team)}

                    {/* Original puzzle reference */}
                    <div className="mt-4 text-center">
                      <p className="text-xs text-purple-300/50">
                        Berilgan kataklar: 🔴 🔵 🟡
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-4 backdrop-blur-sm">
              <p className="text-sm font-bold text-purple-200">Legend</p>
              <div className="mt-3 flex flex-col gap-3 text-sm text-white/90 md:flex-row md:items-center md:gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500 text-white">🔴</div>
                  <span>Berilgan kataklar: o&apos;zgarmaydi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border-[3px] border-dashed border-purple-300/90 bg-purple-100/35 font-bold text-purple-100">?</div>
                  <span>Chiziqli kataklar: siz to&apos;ldirasiz</span>
                </div>
              </div>
            </div>

            {/* Game History */}
            {gameHistory.length > 0 && (
              <div className="relative group transform-gpu overflow-hidden rounded-xl border border-purple-500/30 bg-purple-950/30 p-4 backdrop-blur-sm">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
                <p className="relative text-sm font-bold text-purple-300 mb-2">O'YIN TARIXI</p>
                <div className="relative space-y-1">
                  {gameHistory.slice(-3).map((item, idx) => (
                    <p key={idx} className="text-sm text-white/70">• {item}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {phase === "finish" && winner && (
          /* ========== YAKUNIY NATIJALAR ========== */
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
            {showConfetti && <Confetti mode="boom" particleCount={500} effectCount={1} x={0.5} y={0.3} colors={['#c084fc', '#e879f9', '#f0abfc', '#d8b4fe', '#c084fc']} />}
            
            <div className="relative group transform-gpu overflow-hidden rounded-3xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-900/80 via-pink-900/80 to-purple-900/80 p-8 backdrop-blur-xl shadow-2xl max-w-2xl w-full text-center">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10" />
              
              {/* Trophy */}
              <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full bg-purple-500/30" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mx-auto">
                  <FaCrown className="text-5xl text-white" />
                </div>
              </div>

              <h2 className="relative text-4xl font-black text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2">
                {winner.name} G'OLIB!
              </h2>
              <p className="relative text-xl text-purple-300 mb-8">
                {winner.score} ball to'pladi
              </p>

              {/* Results */}
              <div className="relative grid grid-cols-2 gap-4 mb-8">
                {[...teams].sort((a, b) => b.score - a.score).map((team) => (
                  <div key={team.id} className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{team.avatar}</span>
                      <span className="font-bold text-white">{team.name}</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-400">{team.score}</p>
                    <p className="text-xs text-purple-300/70">ball</p>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="relative flex justify-center gap-4">
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:scale-105 transition-all"
                >
                  <FaRedo className="inline mr-2" />
                  QAYTA O'YNA
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-all"
                >
                  <FaTimesCircle className="inline mr-2" />
                  YOPISH
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

export default MagicSquare;


