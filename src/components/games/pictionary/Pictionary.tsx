import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  FaBrush,
  FaCheck,
  FaClock,
  FaEraser,
  FaTrash,
  FaUsers,
  FaTimes,
  FaCopy,
  FaShare,
  FaVolumeUp,
  FaVolumeMute,
  FaUndo
} from "react-icons/fa";
import { GiPaintBrush } from "react-icons/gi";
import { MdOutlineContentCopy } from "react-icons/md";
import { IoMdMore } from "react-icons/io";
import GamePlayView from "../shared/GamePlayView";

// ==================== TYPES ====================
type Team = "A" | "B";
type Phase = "lobby" | "preview" | "play" | "roundEnd";
type Difficulty = "easy" | "medium" | "hard";
// type PlayerRole = "drawer" | "guesser" | "spectator";

interface Player {
  id: string;
  name: string;
  team: Team | null;
  isReady: boolean;
  isOnline: boolean;
  avatar?: string;
}

interface WordItem {
  word: string;
  topic: string;
  difficulty: Difficulty;
  used?: boolean;
}

interface Point {
  x: number;
  y: number;
}

interface DrawData {
  type: "draw" | "clear" | "undo";
  points?: Point[];
  color?: string;
  size?: number;
  eraser?: boolean;
}

// ==================== CONSTANTS ====================
const DEFAULT_BANK: WordItem[] = [
  { word: "OLMA", topic: "Mevalar", difficulty: "easy" },
  { word: "BANAN", topic: "Mevalar", difficulty: "easy" },
  { word: "APELSIN", topic: "Mevalar", difficulty: "easy" },
  { word: "UZUM", topic: "Mevalar", difficulty: "easy" },
  { word: "QULUPNAY", topic: "Mevalar", difficulty: "easy" },
  { word: "AVTOMOBIL", topic: "Transport", difficulty: "easy" },
  { word: "VELOSIPED", topic: "Transport", difficulty: "easy" },
  { word: "SAMOLYOT", topic: "Transport", difficulty: "medium" },
  { word: "KEM A", topic: "Transport", difficulty: "medium" },
  { word: "TELEFON", topic: "Texnologiya", difficulty: "easy" },
  { word: "KOMPYUTER", topic: "Texnologiya", difficulty: "medium" },
  { word: "TELEVIZOR", topic: "Texnologiya", difficulty: "medium" },
  { word: "IT", topic: "Hayvonlar", difficulty: "easy" },
  { word: "MUSHUK", topic: "Hayvonlar", difficulty: "easy" },
  { word: "FIL", topic: "Hayvonlar", difficulty: "medium" },
  { word: "JIRAF A", topic: "Hayvonlar", difficulty: "hard" },
  { word: "PITS A", topic: "Taomlar", difficulty: "easy" },
  { word: "GAMBURGER", topic: "Taomlar", difficulty: "easy" },
  { word: "MAKARON", topic: "Taomlar", difficulty: "medium" },
];

const COLOR_PALETTE = [
  "#000000", "#ffffff", "#ef4444", "#f59e0b", 
  "#22c55e", "#3b82f6", "#a855f7", "#ec4899"
];

// ==================== HELPERS ====================
function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// function normalizeWord(value: string): string {
//   return value.trim().toUpperCase().replace(/\s+/g, " ");
// }

// ==================== MAIN COMPONENT ====================
function Pictionary() {
  // ==================== ROOM STATE ====================
  const [roomCode, setRoomCode] = useState(generateRoomCode);
  const [players, setPlayers] = useState<Player[]>([
    { 
      id: "host-1", 
      name: "Siz", 
      team: null, 
      isReady: true, 
      isOnline: true,
      avatar: "👑"
    },
  ]);
  const [currentPlayerId] = useState("host-1");
  
  // ==================== GAME STATE ====================
  const [phase, setPhase] = useState<Phase>("lobby");
  const [teams, setTeams] = useState({
    A: { name: "Ko'klar jamoasi", score: 0, players: [] as Player[] },
    B: { name: "Qizillar jamoasi", score: 0, players: [] as Player[] },
  });
  
  const [bank, setBank] = useState<WordItem[]>(() => 
    DEFAULT_BANK.map(item => ({ ...item, used: false }))
  );
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [currentDrawer, setCurrentDrawer] = useState<Player | null>(null);
  const [roundNumber, setRoundNumber] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [roundTime] = useState(60);
  const [message, setMessage] = useState("Xonaga qo'shiling va o'yinni boshlang");
  
  // ==================== UI STATE ====================
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [showWord, setShowWord] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // ==================== CANVAS STATE ====================
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState("#000000");
  const [isEraser, setIsEraser] = useState(false);
  const [drawHistory, setDrawHistory] = useState<DrawData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // ==================== COMPUTED ====================
  const currentPlayer = players.find(p => p.id === currentPlayerId)!;
  const isDrawer = currentDrawer?.id === currentPlayerId;
  const isGuesser = !isDrawer && currentDrawer !== null;
  const canDraw = phase === "play" && isDrawer;
  
  const teamAScore = teams.A.score;
  const teamBScore = teams.B.score;
  const leaderTeam = teamAScore === teamBScore ? null : teamAScore > teamBScore ? "A" : "B";

  // ==================== CANVAS SETUP ====================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvasni to'g'ri sozlash
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      
      // Historyni qayta chizish
      redrawFromHistory();
    };

    ctxRef.current = ctx;
    resizeCanvas();
    
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    if (!ctxRef.current) return;
    ctxRef.current.strokeStyle = isEraser ? "#FFFFFF" : brushColor;
    ctxRef.current.lineWidth = brushSize;
  }, [brushColor, brushSize, isEraser]);

  // ==================== TIMER ====================
  useEffect(() => {
    if (phase !== "play" || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleRoundEnd("timeout");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  // ==================== DRAWING FUNCTIONS ====================
  const redrawFromHistory = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // History bo'yicha qayta chizish
    drawHistory.slice(0, historyIndex + 1).forEach(data => {
      if (data.type === "clear") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else if (data.type === "draw" && data.points && data.points.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = data.color || "#000000";
        ctx.lineWidth = data.size || 5;
        ctx.globalCompositeOperation = data.eraser ? "destination-out" : "source-over";
        
        ctx.moveTo(data.points[0].x, data.points[0].y);
        for (let i = 1; i < data.points.length; i++) {
          ctx.lineTo(data.points[i].x, data.points[i].y);
        }
        ctx.stroke();
      }
    });
    
    ctx.globalCompositeOperation = "source-over";
  }, [drawHistory, historyIndex]);

  const getCanvasCoordinates = (e: React.PointerEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.PointerEvent) => {
    if (!canDraw) return;
    
    e.preventDefault();
    setIsDrawing(true);
    
    const point = getCanvasCoordinates(e);
    if (!point) return;
    
    const ctx = ctxRef.current;
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  };

  const draw = (e: React.PointerEvent) => {
    if (!canDraw || !isDrawing) return;
    
    e.preventDefault();
    
    const point = getCanvasCoordinates(e);
    if (!point) return;
    
    const ctx = ctxRef.current;
    if (!ctx) return;
    
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    
    // Bu yerga WebSocket orqali boshqa o'yinchilarga jo'natish kerak
    // sendDrawData({ type: "draw", points: [point] });
  };

  const stopDrawing = () => {
    if (!canDraw) return;
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Historyga qo'shish
    const newHistory = [...drawHistory.slice(0, historyIndex + 1), { type: "clear" as const }];
    setDrawHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // WebSocket orqali jo'natish
    // sendDrawData({ type: "clear" });
  };

  const undoLast = () => {
    if (historyIndex >= 0) {
      setHistoryIndex(prev => prev - 1);
      redrawFromHistory();
      
      // WebSocket orqali jo'natish
      // sendDrawData({ type: "undo" });
    }
  };

  // ==================== GAME FUNCTIONS ====================
  const handleJoinTeam = (team: Team) => {
    setPlayers(prev => 
      prev.map(p => 
        p.id === currentPlayerId 
          ? { ...p, team, isReady: true }
          : p
      )
    );
    
    setTeams(prev => ({
      ...prev,
      [team]: {
        ...prev[team],
        players: [...prev[team].players, currentPlayer],
      },
    }));
  };

  const startGame = () => {
    // Jamoalarni tekshirish
    if (teams.A.players.length === 0 || teams.B.players.length === 0) {
      setMessage("❌ Ikkala jamoada ham o'yinchi bo'lishi kerak!");
      return;
    }
    
    // Birinchi chizuvchini tanlash (A jamoasidan)
    const firstDrawer = teams.A.players[0];
    setCurrentDrawer(firstDrawer);
    
    // Birinchi so'zni tanlash
    const availableWords = bank.filter(w => !w.used);
    if (availableWords.length === 0) {
      setMessage("❌ So'zlar tugadi!");
      return;
    }
    
    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    setCurrentWord(randomWord);
    
    setPhase("preview");
    setTimeLeft(roundTime);
    setMessage(`${firstDrawer.name} chizadi. Tayyormisiz?`);
  };

  const startDrawingPhase = () => {
    setPhase("play");
    setShowWord(false);
    setMessage(`${currentDrawer?.name} chizmoqda...`);
  };

  const handleRoundEnd = (result: "correct" | "skip" | "timeout") => {
    // Ballarni yangilash
    if (result === "correct" && currentDrawer) {
      const guesserTeam = currentDrawer.team === "A" ? "B" : "A";
      setTeams(prev => ({
        ...prev,
        [guesserTeam]: {
          ...prev[guesserTeam],
          score: prev[guesserTeam].score + 1,
        },
      }));
    }
    
    // So'zni ishlatilgan deb belgilash
    if (currentWord) {
      setBank(prev => 
        prev.map(w => 
          w.word === currentWord.word ? { ...w, used: true } : w
        )
      );
    }
    
    setPhase("roundEnd");
  };

  const nextRound = () => {
    // Keyingi chizuvchini tanlash (boshqa jamoadan)
    const nextTeam = currentDrawer?.team === "A" ? "B" : "A";
    const teamPlayers = teams[nextTeam].players;
    const currentIndex = teamPlayers.findIndex(p => p.id === currentDrawer?.id);
    const nextDrawer = teamPlayers[(currentIndex + 1) % teamPlayers.length];
    
    setCurrentDrawer(nextDrawer);
    
    // Yangi so'z tanlash
    const availableWords = bank.filter(w => !w.used);
    if (availableWords.length > 0) {
      const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
      setCurrentWord(randomWord);
    }
    
    setRoundNumber(prev => prev + 1);
    setPhase("preview");
    setTimeLeft(roundTime);
    clearCanvas();
    setDrawHistory([]);
    setHistoryIndex(-1);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setMessage("✅ Xona kodi nusxalandi!");
    setTimeout(() => setMessage(""), 2000);
  };

  // ==================== RENDER ====================
  return (
    <GamePlayView
      title="Pictionary Online"
      subtitle="Real-time multiplayer drawing game"
      gameKey="pictionary-online"
      backTo="/games/pictionary"
      icon={GiPaintBrush}
      colorClassName="from-indigo-600 via-purple-600 to-pink-600"
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-4">
        {/* ===== TOP BAR ===== */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-2xl bg-black/30 px-4 py-2 backdrop-blur-sm">
              <span className="text-sm text-white/60">Xona:</span>
              <span className="font-mono text-2xl font-black text-white">{roomCode}</span>
              <button
                onClick={copyRoomCode}
                className="ml-2 rounded-xl bg-white/10 p-2 hover:bg-white/20"
              >
                <MdOutlineContentCopy className="text-white" />
              </button>
            </div>
            
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 font-bold text-white"
            >
              <FaShare />
              Taklif qilish
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSoundOn(prev => !prev)}
              className="rounded-2xl bg-white/10 p-3 text-white hover:bg-white/20"
            >
              {isSoundOn ? <FaVolumeUp /> : <FaVolumeMute />}
            </button>
            
            <button
              onClick={() => setShowSettings(true)}
              className="rounded-2xl bg-white/10 p-3 text-white hover:bg-white/20"
            >
              <IoMdMore />
            </button>
          </div>
        </div>

        {/* ===== INVITE MODAL ===== */}
        {showInvite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-900 p-6">
              <h3 className="mb-4 text-2xl font-black text-white">Do'stlaringizni taklif qiling</h3>
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/game/pictionary?room=${roomCode}`}
                  readOnly
                  className="flex-1 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white"
                />
                <button
                  onClick={copyRoomCode}
                  className="rounded-2xl bg-blue-500 px-4 py-3 font-bold text-white"
                >
                  <FaCopy />
                </button>
              </div>
              <button
                onClick={() => setShowInvite(false)}
                className="w-full rounded-2xl bg-white/10 py-3 font-bold text-white hover:bg-white/20"
              >
                Yopish
              </button>
            </div>
          </div>
        )}

        {/* ===== MAIN GRID ===== */}
        <div className="grid gap-6 xl:grid-cols-[1fr,300px]">
          {/* ===== LEFT SIDE ===== */}
          <div className="space-y-6">
            {/* Teams */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Team A */}
              <div className="relative rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-5 backdrop-blur-sm">
                {leaderTeam === "A" && (
                  <div className="absolute -top-3 right-4 rounded-full bg-yellow-500 px-4 py-1 text-sm font-black text-black">
                    👑 LIDER
                  </div>
                )}
                <div className="mb-3 flex items-center justify-between">
                  <div className="inline-block rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-1 text-sm font-black text-white">
                    JAMOA A
                  </div>
                  <span className="text-3xl font-black text-white">{teams.A.score}</span>
                </div>
                <input
                  value={teams.A.name}
                  onChange={(e) => setTeams(prev => ({
                    ...prev,
                    A: { ...prev.A, name: e.target.value }
                  }))}
                  className="mb-3 w-full rounded-2xl border border-white/20 bg-black/30 px-4 py-2 text-white"
                />
                <div className="space-y-2">
                  {teams.A.players.map(player => (
                    <div key={player.id} className="flex items-center gap-2 rounded-xl bg-white/10 p-2">
                      <span className="text-2xl">{player.avatar || "👤"}</span>
                      <span className="font-bold text-white">{player.name}</span>
                      {player.id === currentDrawer?.id && (
                        <span className="ml-auto rounded-full bg-yellow-500 px-2 py-1 text-xs text-black">
                          🎨 Chizadi
                        </span>
                      )}
                    </div>
                  ))}
                  {currentPlayer.team !== "A" && phase === "lobby" && (
                    <button
                      onClick={() => handleJoinTeam("A")}
                      className="w-full rounded-2xl border border-blue-500/50 py-2 text-blue-300 hover:bg-blue-500/20"
                    >
                      + Qo'shilish
                    </button>
                  )}
                </div>
              </div>

              {/* Team B */}
              <div className="relative rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-orange-500/10 p-5 backdrop-blur-sm">
                {leaderTeam === "B" && (
                  <div className="absolute -top-3 right-4 rounded-full bg-yellow-500 px-4 py-1 text-sm font-black text-black">
                    👑 LIDER
                  </div>
                )}
                <div className="mb-3 flex items-center justify-between">
                  <div className="inline-block rounded-full bg-gradient-to-r from-rose-600 to-orange-500 px-4 py-1 text-sm font-black text-white">
                    JAMOA B
                  </div>
                  <span className="text-3xl font-black text-white">{teams.B.score}</span>
                </div>
                <input
                  value={teams.B.name}
                  onChange={(e) => setTeams(prev => ({
                    ...prev,
                    B: { ...prev.B, name: e.target.value }
                  }))}
                  className="mb-3 w-full rounded-2xl border border-white/20 bg-black/30 px-4 py-2 text-white"
                />
                <div className="space-y-2">
                  {teams.B.players.map(player => (
                    <div key={player.id} className="flex items-center gap-2 rounded-xl bg-white/10 p-2">
                      <span className="text-2xl">{player.avatar || "👤"}</span>
                      <span className="font-bold text-white">{player.name}</span>
                      {player.id === currentDrawer?.id && (
                        <span className="ml-auto rounded-full bg-yellow-500 px-2 py-1 text-xs text-black">
                          🎨 Chizadi
                        </span>
                      )}
                    </div>
                  ))}
                  {currentPlayer.team !== "B" && phase === "lobby" && (
                    <button
                      onClick={() => handleJoinTeam("B")}
                      className="w-full rounded-2xl border border-rose-500/50 py-2 text-rose-300 hover:bg-rose-500/20"
                    >
                      + Qo'shilish
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Canvas Area */}
            <div className="rounded-3xl border border-white/15 bg-black/40 p-5 backdrop-blur-sm">
              {/* Canvas Toolbar */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_PALETTE.map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setBrushColor(color);
                        setIsEraser(false);
                      }}
                      className={`h-8 w-8 rounded-full border-2 transition ${
                        brushColor === color && !isEraser
                          ? "scale-110 border-white"
                          : "border-white/20"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  
                  <button
                    onClick={() => setIsEraser(prev => !prev)}
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold ${
                      isEraser
                        ? "bg-white text-black"
                        : "border border-white/20 bg-white/10 text-white"
                    }`}
                  >
                    <FaEraser />
                    O'chirg'ich
                  </button>
                  
                  <button
                    onClick={clearCanvas}
                    disabled={!canDraw}
                    className="rounded-full border border-white/20 bg-white/10 p-2 text-white disabled:opacity-50"
                  >
                    <FaTrash />
                  </button>
                  
                  <button
                    onClick={undoLast}
                    disabled={!canDraw || historyIndex < 0}
                    className="rounded-full border border-white/20 bg-white/10 p-2 text-white disabled:opacity-50"
                  >
                    <FaUndo />
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <FaBrush className="text-white/60" />
                  <input
                    type="range"
                    min="2"
                    max="20"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-24 accent-blue-500"
                    disabled={!canDraw}
                  />
                  <span className="text-sm font-bold text-white">{brushSize}px</span>
                </div>
              </div>

              {/* Canvas */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border-4 border-white/20 bg-white">
                <canvas
                  ref={canvasRef}
                  className="h-full w-full touch-none"
                  onPointerDown={startDrawing}
                  onPointerMove={draw}
                  onPointerUp={stopDrawing}
                  onPointerLeave={stopDrawing}
                  style={{ cursor: canDraw ? "crosshair" : "default" }}
                />
                
                {/* Overlays */}
                {phase === "preview" && isDrawer && currentWord && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="mb-4 text-6xl">🎨</div>
                      <div className="mb-2 text-sm text-white/60">Siz chizasiz:</div>
                      <div className="text-5xl font-black text-white">{currentWord.word}</div>
                      <div className="mt-4 text-white/60">
                        {currentWord.topic} · {currentWord.difficulty === "easy" ? "Oson" : 
                          currentWord.difficulty === "medium" ? "Oʻrta" : "Qiyin"}
                      </div>
                      <button
                        onClick={startDrawingPhase}
                        className="mt-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-4 text-xl font-black text-white"
                      >
                        Boshlash
                      </button>
                    </div>
                  </div>
                )}

                {phase === "play" && !isDrawer && currentWord && (
                  <div className="absolute top-4 right-4 rounded-full bg-black/50 px-4 py-2 backdrop-blur-sm">
                    <span className="text-sm text-white/60">So'z: </span>
                    <span className="font-mono text-xl font-black text-white">•••••</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ===== RIGHT SIDE - CHAT & INFO ===== */}
          <div className="space-y-6">
            {/* Game Info Card */}
            <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-black text-white">Raund #{roundNumber}</h3>
                <div className="flex items-center gap-2 rounded-full bg-black/30 px-3 py-1">
                  <FaClock className="text-white/60" />
                  <span className="font-mono text-xl font-black text-white">{timeLeft}s</span>
                </div>
              </div>
              
              {currentDrawer && (
                <div className="mb-4 rounded-2xl bg-white/10 p-4">
                  <div className="text-sm text-white/60">Hozir chizadi:</div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{currentDrawer.avatar || "🎨"}</span>
                    <div>
                      <div className="text-xl font-black text-white">{currentDrawer.name}</div>
                      <div className="text-sm text-white/60">
                        {currentDrawer.team === "A" ? teams.A.name : teams.B.name}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Game Controls */}
              {phase === "lobby" && (
                <button
                  onClick={startGame}
                  className="w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 py-4 text-xl font-black text-white"
                >
                  🚀 O'yinni boshlash
                </button>
              )}
              
              {phase === "play" && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleRoundEnd("correct")}
                    className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 py-3 font-bold text-white"
                  >
                    <FaCheck className="mx-auto mb-1" />
                    To'g'ri
                  </button>
                  <button
                    onClick={() => handleRoundEnd("skip")}
                    className="rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 py-3 font-bold text-white"
                  >
                    <FaTimes className="mx-auto mb-1" />
                    O'tkazib yuborish
                  </button>
                </div>
              )}
              
              {phase === "roundEnd" && (
                <button
                  onClick={nextRound}
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 py-4 text-xl font-black text-white"
                >
                  Keyingi raund ➡️
                </button>
              )}
            </div>

            {/* Players Card */}
            <div className="rounded-3xl border border-white/15 bg-black/40 p-5 backdrop-blur-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
                <FaUsers />
                O'yinchilar ({players.length})
              </h3>
              <div className="space-y-2">
                {players.map(player => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-3 rounded-xl p-2 ${
                      player.id === currentDrawer?.id ? "bg-yellow-500/20" : "bg-white/5"
                    }`}
                  >
                    <span className="text-2xl">{player.avatar || "👤"}</span>
                    <div className="flex-1">
                      <div className="font-bold text-white">
                        {player.name}
                        {player.id === currentPlayerId && " (Siz)"}
                      </div>
                      <div className="text-xs text-white/60">
                        {player.team ? (
                          player.team === "A" ? teams.A.name : teams.B.name
                        ) : (
                          "Jamoa tanlanmagan"
                        )}
                      </div>
                    </div>
                    {player.isOnline && (
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Message Card */}
            <div className="rounded-3xl border border-white/15 bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-5 backdrop-blur-sm">
              <p className="text-center text-white">{message}</p>
            </div>
          </div>
        </div>
      </div>
    </GamePlayView>
  );
}

export default Pictionary;