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
  FaImage,
  FaUpload
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
  currentPuzzleId: string | null;
  puzzlePieces: PuzzlePiece[];
  placedPieces: number[];
  timeLeft: number;
};

type PuzzlePiece = {
  id: number;
  imageId: string;
  correctPosition: number;
  currentPosition: number;
  imageUrl: string;
  width: number;
  height: number;
  x: number;
  y: number;
};

type Puzzle = {
  id: string;
  name: string;
  imageUrl: string;
  pieces: PuzzlePiece[];
  difficulty: "easy" | "medium" | "hard";
  pieceCount: number;
};

type Phase = "teacher" | "game" | "result" | "finish";

const TEAM_AVATARS = ["🐶", "🐱"];
const TEAM_COLORS = [
  { primary: "from-pink-400 to-rose-400", text: "text-pink-300", bg: "bg-pink-500/10", border: "border-pink-500/30" },
  { primary: "from-purple-400 to-violet-400", text: "text-purple-300", bg: "bg-purple-500/10", border: "border-purple-500/30" },
];

const DIFFICULTY_CONFIG = {
  easy: { pieces: 4, gridCols: 2, gridRows: 2 },
  medium: { pieces: 6, gridCols: 2, gridRows: 3 },
  hard: { pieces: 9, gridCols: 3, gridRows: 3 },
};

function MiniPuzzle() {
  // Audio refs
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);

  // Game state
  const [phase, setPhase] = useState<Phase>("teacher");
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [teamError, setTeamError] = useState("");
  
  // Puzzles state
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  
  // Gameplay state
  const [draggedPiece, setDraggedPiece] = useState<{
    teamId: number;
    pieceId: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [winner, setWinner] = useState<Team | null>(null);
  const [roundWinner, setRoundWinner] = useState<number | null>(null);
  const [roundTimer, setRoundTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const { countdownValue, countdownVisible, runStartCountdown } =
    useGameStartCountdown();

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

    const newTeam: Team = {
      id: Date.now() + Math.random(),
      name,
      color: TEAM_COLORS[teams.length].primary,
      avatar: TEAM_AVATARS[teams.length],
      score: 0,
      isActive: teams.length === 0,
      completedPuzzles: 0,
      currentPuzzleId: null,
      puzzlePieces: [],
      placedPieces: [],
      timeLeft: 60,
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
    showToast(`🗑️ ${team?.name} o'chirildi`);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      const rawName = file.name.replace(/\.[^/.]+$/, "").trim();
      const finalName = rawName || `Rasm ${puzzles.length + 1}`;
      createPuzzle(imageUrl, finalName);
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  // Create puzzle
  const createPuzzle = (imageUrl: string, name: string) => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const pieces: PuzzlePiece[] = [];
    const pieceWidth = 300 / config.gridCols;
    const pieceHeight = 300 / config.gridRows;

    for (let row = 0; row < config.gridRows; row++) {
      for (let col = 0; col < config.gridCols; col++) {
        const position = row * config.gridCols + col;
        pieces.push({
          id: position,
          imageId: Date.now().toString(),
          correctPosition: position,
          currentPosition: position,
          imageUrl,
          width: pieceWidth,
          height: pieceHeight,
          x: col * pieceWidth,
          y: row * pieceHeight,
        });
      }
    }

    // Shuffle pieces
    const shuffledPieces = [...pieces].sort(() => Math.random() - 0.5).map((piece, index) => ({
      ...piece,
      currentPosition: index,
    }));

    const newPuzzle: Puzzle = {
      id: Date.now().toString(),
      name,
      imageUrl,
      pieces: shuffledPieces,
      difficulty,
      pieceCount: config.pieces,
    };

    setPuzzles((prev) => [...prev, newPuzzle]);
    showToast(`✅ "${name}" rasmi qo'shildi`);
  };

  // Remove puzzle
  const removePuzzle = (id: string) => {
    setPuzzles(puzzles.filter(p => p.id !== id));
    showToast("🗑️ Rasm o'chirildi");
  };

  const createTeamPieces = (puzzle: Puzzle): PuzzlePiece[] =>
    [...puzzle.pieces]
      .sort(() => Math.random() - 0.5)
      .map((piece) => ({
        ...piece,
        currentPosition: -1,
      }));

  // Start game
  const startGameNow = () => {
    const firstPuzzle = puzzles[0];

    // Reset teams
    setTeams(prev => prev.map((t, idx) => ({
      ...t,
      score: 0,
      isActive: idx === 0,
      completedPuzzles: 0,
      currentPuzzleId: firstPuzzle.id,
      puzzlePieces: createTeamPieces(firstPuzzle),
      placedPieces: [],
      timeLeft: 60,
    })));

    setCurrentPuzzleIndex(0);
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
    if (puzzles.length === 0) {
      showToast("Kamida 1 ta rasm bo'lishi kerak!");
      return;
    }
    runStartCountdown(startGameNow);
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, teamId: number, pieceId: number) => {
    if (phase !== "game") return;
    
    const team = teams.find(t => t.id === teamId);
    if (!team?.isActive) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDraggedPiece({ teamId, pieceId, offsetX, offsetY });
    e.dataTransfer.setData("text/plain", `${teamId}-${pieceId}`);
    e.dataTransfer.effectAllowed = "move";
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetPosition: number) => {
    e.preventDefault();
    
    if (!draggedPiece) return;
    if (phase !== "game") return;

    const team = teams.find(t => t.id === draggedPiece.teamId);
    if (!team?.isActive) return;

    const pieceIndex = team.puzzlePieces.findIndex(p => p.id === draggedPiece.pieceId);
    if (pieceIndex === -1) return;

    // Update piece position
    const updatedPieces = [...team.puzzlePieces];
    const occupyingIndex = updatedPieces.findIndex(
      (piece) => piece.currentPosition === targetPosition && piece.id !== draggedPiece.pieceId
    );
    if (occupyingIndex !== -1) {
      updatedPieces[occupyingIndex] = {
        ...updatedPieces[occupyingIndex],
        currentPosition: -1,
      };
    }

    updatedPieces[pieceIndex] = {
      ...updatedPieces[pieceIndex],
      currentPosition: targetPosition,
    };

    setTeams(prev => prev.map(t => 
      t.id === team.id ? { ...t, puzzlePieces: updatedPieces } : t
    ));

    // Check if puzzle is complete
    const isComplete = updatedPieces.every(p => p.currentPosition === p.correctPosition);
    if (isComplete) {
      handlePuzzleComplete(team.id);
    }

    setDraggedPiece(null);
  };

  // Handle puzzle complete
  const handlePuzzleComplete = (teamId: number) => {
    playSound("correct");
    
    const timeBonus = Math.floor(roundTimer / 10) * 5;
    const points = 50 + timeBonus;

    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          score: t.score + points,
          completedPuzzles: t.completedPuzzles + 1,
        };
      }
      return t;
    }));

    setRoundWinner(teamId);
    setGameHistory(prev => [...prev, `✅ Jamoa ${teamId + 1} rasmni yig'di! +${points} ball`]);
    showToast(`🎉 Ajoyib! +${points} ball`);

    // Move to next puzzle
    setTimeout(() => {
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
            currentPuzzleId: nextPuzzle.id,
            puzzlePieces: createTeamPieces(nextPuzzle),
            placedPieces: [],
            timeLeft: 60,
          }));
        });
      } else {
        finishGame();
      }
    }, 2000);
  };

  // Handle timeout
  const handleTimeout = () => {
    setIsTimerActive(false);
    showToast("⏰ Vaqt tugadi! Keyingi jamoa boshlaydi");
    
    setTimeout(() => {
      const nextActive = (teams.findIndex(t => t.isActive) + 1) % 2;
      setTeams(prev => prev.map((t, idx) => ({ ...t, isActive: idx === nextActive })));
      setRoundTimer(60);
      setIsTimerActive(true);
    }, 2000);
  };

  // Finish game
  const finishGame = () => {
    setIsTimerActive(false);
    playSound("win");
    setShowConfetti(true);
    
    const sorted = [...teams].sort((a, b) => b.score - a.score);
    setWinner(sorted[0]);
    setPhase("finish");
    showToast("🏆 O'yin tugadi!");
  };

  // Reset game
  const resetGame = () => {
    setPhase("teacher");
    setTeams([]);
    setPuzzles([]);
    setCurrentPuzzleIndex(0);
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

  // Render puzzle pieces for a team
  const renderTeamPuzzle = (team: Team) => {
    const currentPuzzle = puzzles[currentPuzzleIndex];
    if (!currentPuzzle) return null;

    const config = DIFFICULTY_CONFIG[difficulty];
    const gridSize = 300;

    return (
      <div className="space-y-4">
        {/* Puzzle pieces (draggable) */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-pink-50/10 rounded-xl border-2 border-pink-400/30 min-h-[150px]">
          {team.puzzlePieces.map((piece) => {
            const isPlaced = piece.currentPosition !== -1;
            if (isPlaced) return null;

            return (
              <div
                key={piece.id}
                draggable={team.isActive && !isPlaced}
                onDragStart={(e) => handleDragStart(e, team.id, piece.id)}
                className={`
                  relative cursor-move rounded-lg overflow-hidden shadow-lg
                  ${team.isActive ? 'hover:scale-105 hover:shadow-2xl' : 'opacity-50 cursor-not-allowed'}
                  transition-all duration-200
                `}
                style={{
                  width: '100%',
                  aspectRatio: '1/1',
                  backgroundImage: `url(${currentPuzzle.imageUrl})`,
                  backgroundSize: `${gridSize * (300 / piece.width)}px ${gridSize * (300 / piece.height)}px`,
                  backgroundPosition: `-${piece.x}px -${piece.y}px`,
                }}
              />
            );
          })}
        </div>

        {/* Puzzle grid (drop zones) */}
        <div 
          className="grid rounded-xl overflow-hidden border-4 border-pink-400/30 shadow-2xl"
          style={{
            gridTemplateColumns: `repeat(${config.gridCols}, 1fr)`,
            width: '300px',
            height: '300px',
            margin: '0 auto',
          }}
        >
          {Array.from({ length: config.pieces }).map((_, idx) => {
            const placedPiece = team.puzzlePieces.find(p => p.currentPosition === idx);
            
            return (
              <div
                key={idx}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, idx)}
                className={`
                  border border-pink-400/30 bg-pink-100/5
                  ${team.isActive ? 'cursor-pointer' : 'cursor-not-allowed'}
                  transition-all duration-200 hover:bg-pink-500/10
                `}
              >
                {placedPiece && (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${currentPuzzle.imageUrl})`,
                      backgroundSize: `${gridSize * (300 / placedPiece.width)}px ${gridSize * (300 / placedPiece.height)}px`,
                      backgroundPosition: `-${placedPiece.x}px -${placedPiece.y}px`,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 dark:from-pink-950 dark:via-rose-950 dark:to-pink-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-pink-300/20 blur-3xl dark:bg-pink-600/20" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse-slower rounded-full bg-rose-300/20 blur-3xl dark:bg-rose-600/20" />
        
        {/* Soft Pattern */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, #f9a8d4 2px, transparent 2px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating Hearts */}
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
              {["🌸", "✨", "💮", "🌸", "✨", "💮"][i % 6]}
            </div>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-full shadow-2xl animate-bounce backdrop-blur-sm border-2 border-pink-300">
            {toast}
          </div>
        </div>
      )}

      {/* Mute Button */}
      <button
        onClick={toggleMute}
        className="fixed top-6 right-6 z-50 p-3 bg-pink-900/50 border-2 border-pink-500/30 text-pink-300 rounded-xl hover:bg-pink-800/50 transition-all backdrop-blur-sm"
      >
        {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
      </button>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6">

        {phase === "teacher" && (
          /* ========== O'QITUVCHI PANELI ========== */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Teams Panel */}
            <div className="relative group transform-gpu overflow-hidden rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-900/40 to-rose-900/40 p-6 backdrop-blur-xl">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-pink-500/10 to-rose-500/10" />
              
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-pink-500/30">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-pink-500/30" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500">
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
                    className="flex-1 px-4 py-2 rounded-xl border border-pink-500/30 bg-pink-950/30 text-white placeholder-pink-300/50 focus:border-pink-400 focus:outline-none"
                  />
                  <button
                    onClick={addTeam}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold hover:scale-105 transition-all"
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
                    className="group relative overflow-hidden rounded-xl border border-pink-500/30 bg-pink-950/30 p-3 transition-all hover:bg-pink-900/40"
                  >
                    <div className={`absolute inset-0 pointer-events-none bg-gradient-to-r ${TEAM_COLORS[idx].primary} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{team.avatar}</span>
                        <div>
                          <p className="text-sm font-bold text-white">{team.name}</p>
                          <p className="text-xs text-pink-300/70">{idx === 0 ? "CHAP JAMOA" : "O'NG JAMOA"}</p>
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

            {/* Puzzles Panel */}
            <div className="relative group transform-gpu overflow-hidden rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-900/40 to-rose-900/40 p-6 backdrop-blur-xl">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-pink-500/10 to-rose-500/10" />
              
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-pink-500/30">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-pink-500/30" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500">
                    <FaImage className="text-white text-sm" />
                  </div>
                </div>
                <h2 className="text-xl font-black text-white">RASMLAR</h2>
              </div>

              <div className="space-y-3 mb-4">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-4 py-2 rounded-xl border border-pink-500/30 bg-pink-950/30 text-white"
                >
                  <option value="easy">Oson (4 bo'lak)</option>
                  <option value="medium">O'rtacha (6 bo'lak)</option>
                  <option value="hard">Qiyin (9 bo'lak)</option>
                </select>

                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer">
                    <div className="px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold hover:scale-[1.02] transition-all text-center">
                      <FaUpload className="inline mr-2" />
                      Rasm yuklash
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {puzzles.map((puzzle, idx) => (
                  <div key={puzzle.id} className="group relative overflow-hidden rounded-xl border border-pink-500/30 bg-pink-950/30 p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-pink-400/30">
                          <img src={puzzle.imageUrl} alt={puzzle.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{puzzle.name}</p>
                          <p className="text-xs text-pink-300/70">
                            {puzzle.pieceCount} bo'lak · {puzzle.difficulty === 'easy' ? 'Oson' : puzzle.difficulty === 'medium' ? 'O\'rtacha' : 'Qiyin'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removePuzzle(puzzle.id)}
                        className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimesCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            {teams.length === 2 && puzzles.length > 0 && (
              <div className="lg:col-span-2 text-center">
                <button
                  onClick={startGame}
                  className="px-12 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-bold text-2xl hover:scale-105 transition-all shadow-2xl border-2 border-pink-400/50"
                >
                  <FaPlay className="inline mr-2" />
                  O'YINNI BOSHLASH
                </button>
              </div>
            )}
          </div>
        )}

        {phase === "game" && (
          /* ========== O'YIN JARAYONI ========== */
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-pink-900/30 border-2 border-pink-500/30 rounded-xl px-4 py-2">
                  <p className="text-xs text-pink-300">Rasm</p>
                  <p className="text-lg font-bold text-white">{currentPuzzleIndex + 1}/{puzzles.length}</p>
                </div>
                <div className="bg-pink-900/30 border-2 border-pink-500/30 rounded-xl px-4 py-2">
                  <p className="text-xs text-pink-300">Vaqt</p>
                  <p className="text-lg font-bold text-white flex items-center gap-1">
                    <FaClock className="text-pink-400" />
                    {roundTimer}s
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-pink-300 mb-1">Hozirgi navbat</p>
                <div className="flex items-center gap-3">
                  {teams.map((team, idx) => (
                    <div
                      key={team.id}
                      className={`px-4 py-2 rounded-xl border-2 transition-all ${
                        team.isActive 
                          ? `bg-gradient-to-r ${team.color} border-white scale-105 shadow-2xl` 
                          : 'border-pink-500/30 bg-pink-900/30'
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

            {/* Teams Puzzles */}
            <div className="grid grid-cols-2 gap-8">
              {teams.map((team, idx) => (
                <div
                  key={team.id}
                  className={`
                    relative group transform-gpu overflow-hidden rounded-2xl border-2 p-6 backdrop-blur-xl
                    ${team.isActive 
                      ? `border-pink-400/50 bg-gradient-to-br ${team.color} scale-105 shadow-2xl` 
                      : 'border-pink-500/30 bg-pink-950/30'}
                  `}
                >
                  <div className={`absolute inset-0 pointer-events-none bg-gradient-to-r ${TEAM_COLORS[idx].primary} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{team.avatar}</span>
                      <div>
                        <h3 className="text-xl font-bold text-white">{team.name}</h3>
                        <p className="text-sm text-pink-300/70">{idx === 0 ? "CHAP JAMOA" : "O'NG JAMOA"}</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-2xl font-bold text-white">{team.score}</p>
                        <p className="text-xs text-pink-300">ball</p>
                      </div>
                    </div>

                    {renderTeamPuzzle(team)}
                  </div>
                </div>
              ))}
            </div>

            {/* Game History */}
            {gameHistory.length > 0 && (
              <div className="relative group transform-gpu overflow-hidden rounded-xl border border-pink-500/30 bg-pink-950/30 p-4 backdrop-blur-sm">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-pink-500/10 to-rose-500/10" />
                <p className="relative text-sm font-bold text-pink-300 mb-2">O'YIN TARIXI</p>
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
            {showConfetti && <Confetti mode="boom" particleCount={500} effectCount={1} x={0.5} y={0.3} colors={['#f9a8d4', '#f472b6', '#ec4899', '#db2777', '#be185d']} />}
            
            <div className="relative group transform-gpu overflow-hidden rounded-3xl border-2 border-pink-500/30 bg-gradient-to-br from-pink-900/80 via-rose-900/80 to-pink-900/80 p-8 backdrop-blur-xl shadow-2xl max-w-2xl w-full text-center">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-pink-500/10" />
              
              {/* Trophy */}
              <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full bg-pink-500/30" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 mx-auto">
                  <FaCrown className="text-5xl text-white" />
                </div>
              </div>

              <h2 className="relative text-4xl font-black text-transparent bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text mb-2">
                {winner.name} G'OLIB!
              </h2>
              <p className="relative text-xl text-pink-300 mb-8">
                {winner.score} ball to'pladi
              </p>

              {/* Results */}
              <div className="relative grid grid-cols-2 gap-4 mb-8">
                {teams.sort((a, b) => b.score - a.score).map((team, idx) => (
                  <div key={team.id} className="rounded-xl border border-pink-500/30 bg-pink-950/30 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{team.avatar}</span>
                      <span className="font-bold text-white">{team.name}</span>
                    </div>
                    <p className="text-2xl font-bold text-pink-400">{team.score}</p>
                    <p className="text-xs text-pink-300/70">ball</p>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="relative flex justify-center gap-4">
                <button
                  onClick={resetGame}
                  className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-bold hover:scale-105 transition-all"
                >
                  <FaRedo className="inline mr-2" />
                  QAYTA O'YNA
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl font-bold hover:scale-105 transition-all"
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

export default MiniPuzzle;
