
import { useEffect, useMemo, useRef, useState } from "react";
import { FaArrowLeft, FaCrown, FaMedal, FaPlay, FaPlus, FaRobot, FaTrash } from "react-icons/fa";
import { GiBroccoli, GiFruitBowl, GiPodium, GiSpinningWheel } from "react-icons/gi";
import { MdSettings, MdTimer } from "react-icons/md";
import { RiTeamFill } from "react-icons/ri";
import Confetti from "react-confetti-boom";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../shared/useGameStartCountdown";
import { generateWordSearchWords } from "./ai";
import wordSearchGameSound from "../../../assets/sounds/word_search_game_sound.m4a";

type TeamId = 0 | 1;
type Phase = "teacher" | "play" | "finish";
type CellState = { letter: string; found: boolean };
type CellPos = { row: number; col: number };
type Direction = { dr: number; dc: number };
type WordItem = { id: string; word: string; found: boolean; category: "team1" | "team2" };
type TeacherDraft = { word: string; category: "team1" | "team2" };

const GRID_SIZE = 12;
const GAME_TIME_SECONDS = 240;
const DEFAULT_TEAM1_WORDS = ["ATOM", "PLANET", "OCEAN", "DESERT", "ROBOT", "MUSIC", "LIBRARY", "POETRY"];
const DEFAULT_TEAM2_WORDS = ["PYTHON", "REACT", "SERVER", "DATABASE", "ALGORITHM", "NETWORK", "SECURITY", "MOBILE"];
const AI_WORD_COUNT_OPTIONS = [6, 8, 10, 12, 14, 16] as const;
const AI_DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Oson" },
  { value: "medium", label: "O'rtacha" },
  { value: "hard", label: "Qiyin" },
  { value: "mixed", label: "Aralash" },
] as const;
const DIRECTIONS: Direction[] = [
  { dr: -1, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: 1 },
  { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
  { dr: 1, dc: -1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 },
];

const buildDefaultWords = (words: string[], category: "team1" | "team2") =>
  words.map((word, index) => ({ id: `${category}-${index}-${Date.now()}`, word, found: false, category }));

const initializeGrid = (): CellState[][] =>
  Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({ letter: " ", found: false }))
  );

const fillEmptyCells = (grid: CellState[][]) => {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c].letter === " ") {
        grid[r][c].letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }
};

const placeWord = (grid: CellState[][], word: string, directions: Direction[]) => {
  for (let attempt = 0; attempt < 250; attempt++) {
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const startRow = Math.floor(Math.random() * GRID_SIZE);
    const startCol = Math.floor(Math.random() * GRID_SIZE);
    const endRow = startRow + direction.dr * (word.length - 1);
    const endCol = startCol + direction.dc * (word.length - 1);

    if (endRow < 0 || endRow >= GRID_SIZE || endCol < 0 || endCol >= GRID_SIZE) continue;

    let canPlace = true;
    for (let i = 0; i < word.length; i++) {
      const r = startRow + direction.dr * i;
      const c = startCol + direction.dc * i;
      const current = grid[r][c].letter;
      if (current !== " " && current !== word[i]) {
        canPlace = false;
        break;
      }
    }

    if (!canPlace) continue;

    for (let i = 0; i < word.length; i++) {
      const r = startRow + direction.dr * i;
      const c = startCol + direction.dc * i;
      grid[r][c].letter = word[i];
    }
    return true;
  }
  return false;
};

const isStraightSelection = (selected: CellPos[], row: number, col: number) => {
  if (selected.length === 0) return true;
  const last = selected[selected.length - 1];
  const dr = Math.abs(row - last.row);
  const dc = Math.abs(col - last.col);
  if (dr > 1 || dc > 1) return false;

  if (selected.length < 2) return true;
  const first = selected[0];
  const second = selected[1];
  const dirR = second.row - first.row;
  const dirC = second.col - first.col;
  return row === last.row + dirR && col === last.col + dirC;
};

export default function WordSearchPuzzle() {
  const [phase, setPhase] = useState<Phase>("teacher");
  const [teamNames, setTeamNames] = useState<[string, string]>(["🔵 1-GURUH", "🟢 2-GURUH"]);
  const [nameError, setNameError] = useState("");

  const [team1Words, setTeam1Words] = useState<WordItem[]>(buildDefaultWords(DEFAULT_TEAM1_WORDS, "team1"));
  const [team2Words, setTeam2Words] = useState<WordItem[]>(buildDefaultWords(DEFAULT_TEAM2_WORDS, "team2"));

  const [draft, setDraft] = useState<TeacherDraft>({ word: "", category: "team1" });
  const [draftError, setDraftError] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [aiTopic, setAiTopic] = useState("");
  const [aiWordCount, setAiWordCount] = useState<number>(8);
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("medium");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const [team1Grid, setTeam1Grid] = useState<CellState[][]>([]);
  const [team2Grid, setTeam2Grid] = useState<CellState[][]>([]);
  const [team1PlacedIds, setTeam1PlacedIds] = useState<string[]>([]);
  const [team2PlacedIds, setTeam2PlacedIds] = useState<string[]>([]);

  const [team1Selected, setTeam1Selected] = useState<CellPos[]>([]);
  const [team2Selected, setTeam2Selected] = useState<CellPos[]>([]);
  const [team1Locked, setTeam1Locked] = useState(false);
  const [team2Locked, setTeam2Locked] = useState(false);

  const [timer, setTimer] = useState(GAME_TIME_SECONDS);
  const [showWordLists, setShowWordLists] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();
  const [team1Message, setTeam1Message] = useState("");
  const [team2Message, setTeam2Message] = useState("");

  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const allWords = useMemo(() => [...team1Words, ...team2Words], [team1Words, team2Words]);
  const hasGeminiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY?.trim());
  const team1Found = useMemo(() => team1Words.filter((w) => w.found).length, [team1Words]);
  const team2Found = useMemo(() => team2Words.filter((w) => w.found).length, [team2Words]);

  const winner = useMemo(() => {
    if (team1Found === team2Found) return null;
    return team1Found > team2Found ? 0 : 1;
  }, [team1Found, team2Found]);

  const progressPct = useMemo(() => {
    const total = team1Words.length + team2Words.length;
    return Math.round(((team1Found + team2Found) / Math.max(total, 1)) * 100);
  }, [team1Found, team2Found, team1Words.length, team2Words.length]);

  const getDirectionsForDifficulty = () => {
    if (difficulty === "easy") return [{ dr: 0, dc: 1 }, { dr: 1, dc: 0 }];
    if (difficulty === "medium") {
      return [
        { dr: 0, dc: 1 }, { dr: 0, dc: -1 }, { dr: 1, dc: 0 },
        { dr: -1, dc: 0 }, { dr: 1, dc: 1 }, { dr: -1, dc: -1 },
      ];
    }
    return DIRECTIONS;
  };

  const buildPuzzle = (words: WordItem[]) => {
    const grid = initializeGrid();
    const placedIds: string[] = [];
    const directions = getDirectionsForDifficulty();
    const shuffled = [...words].sort(() => Math.random() - 0.5);

    shuffled.forEach((item) => {
      if (placeWord(grid, item.word, directions)) placedIds.push(item.id);
    });

    fillEmptyCells(grid);
    return { grid, placedIds };
  };

  const addWord = () => {
    const word = draft.word.trim().toUpperCase();
    if (!word) return setDraftError("So'z kiriting!");
    if (word.length < 3) return setDraftError("So'z kamida 3 harf bo'lishi kerak!");
    if (word.length > GRID_SIZE) return setDraftError(`So'z ${GRID_SIZE} harfdan oshmasin!`);
    if (allWords.some((w) => w.word === word)) return setDraftError("Bu so'z allaqachon bor!");

    const newWord: WordItem = {
      id: `${draft.category}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      word,
      found: false,
      category: draft.category,
    };

    if (draft.category === "team1") setTeam1Words((p) => [...p, newWord]);
    else setTeam2Words((p) => [...p, newWord]);

    setDraft((p) => ({ ...p, word: "" }));
    setDraftError("");
    setToast(`✅ ${word} qo'shildi`);
  };

  const resetToDefaults = () => {
    setTeam1Words(buildDefaultWords(DEFAULT_TEAM1_WORDS, "team1"));
    setTeam2Words(buildDefaultWords(DEFAULT_TEAM2_WORDS, "team2"));
    setToast("🔄 Default ro'yxat tiklandi");
  };

  const removeWord = (id: string, category: "team1" | "team2") => {
    if (category === "team1") setTeam1Words((p) => p.filter((w) => w.id !== id));
    else setTeam2Words((p) => p.filter((w) => w.id !== id));
    setToast("🗑️ So'z o'chirildi");
  };

  const generateWordsWithAi = async () => {
    if (isGeneratingAi) return;
    setDraftError("");
    setIsGeneratingAi(true);

    try {
      const generatedWords = await generateWordSearchWords({
        topic: aiTopic,
        count: aiWordCount,
        difficulty: aiDifficulty,
      });

      const midpoint = Math.ceil(generatedWords.length / 2);
      const team1Generated = buildDefaultWords(generatedWords.slice(0, midpoint), "team1");
      const team2Generated = buildDefaultWords(generatedWords.slice(midpoint), "team2");

      if (team1Generated.length === 0 || team2Generated.length === 0) {
        throw new Error("AI ikki guruh uchun yetarli so'z qaytarmadi.");
      }

      setTeam1Words(team1Generated);
      setTeam2Words(team2Generated);
      setToast(`🤖 ${generatedWords.length} ta AI so'z yuklandi`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI so'z yaratib bo'lmadi.";
      setDraftError(message);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const startGame = () => {
    if (!teamNames[0].trim() || !teamNames[1].trim()) return setNameError("Ikkala guruh nomini kiriting!");
    if (team1Words.length === 0 || team2Words.length === 0) return setDraftError("Har bir guruhga kamida 1 ta so'z kiriting!");

    const clean1 = team1Words.map((w) => ({ ...w, found: false }));
    const clean2 = team2Words.map((w) => ({ ...w, found: false }));

    const p1 = buildPuzzle(clean1);
    const p2 = buildPuzzle(clean2);

    setTeam1Words(clean1);
    setTeam2Words(clean2);
    setTeam1Grid(p1.grid);
    setTeam2Grid(p2.grid);
    setTeam1PlacedIds(p1.placedIds);
    setTeam2PlacedIds(p2.placedIds);

    setTeam1Selected([]);
    setTeam2Selected([]);
    setTeam1Locked(false);
    setTeam2Locked(false);
    setTeam1Message("");
    setTeam2Message("");

    setTimer(GAME_TIME_SECONDS);
    setNameError("");
    setDraftError("");
    setPhase("play");
    setToast("🎮 4 daqiqa boshlandi");
  };

  const handleStartGame = () => runStartCountdown(startGame);

  const checkSelectedWord = (teamId: TeamId): WordItem | null => {
    const selected = teamId === 0 ? team1Selected : team2Selected;
    const grid = teamId === 0 ? team1Grid : team2Grid;
    if (selected.length < 2) return null;

    const selectedWord = selected.map((c) => grid[c.row]?.[c.col]?.letter).join("");
    const reversed = selectedWord.split("").reverse().join("");

    const words = teamId === 0 ? team1Words : team2Words;
    const placed = new Set(teamId === 0 ? team1PlacedIds : team2PlacedIds);
    return words.find((w) => !w.found && placed.has(w.id) && (w.word === selectedWord || w.word === reversed)) || null;
  };

  const markCellsFound = (teamId: TeamId, cells: CellPos[]) => {
    const updater = (prev: CellState[][]) => {
      const next = prev.map((row) => row.map((cell) => ({ ...cell })));
      cells.forEach((c) => {
        if (next[c.row]?.[c.col]) next[c.row][c.col].found = true;
      });
      return next;
    };

    if (teamId === 0) setTeam1Grid(updater);
    else setTeam2Grid(updater);
  };

  const submitWord = (teamId: TeamId) => {
    if (phase !== "play") return;

    const selected = teamId === 0 ? team1Selected : team2Selected;
    if (selected.length === 0) return;

    if (teamId === 0) setTeam1Locked(true);
    else setTeam2Locked(true);

    const matched = checkSelectedWord(teamId);
    if (matched) {
      if (teamId === 0) {
        setTeam1Words((p) => p.map((w) => (w.id === matched.id ? { ...w, found: true } : w)));
        setTeam1Message(`✅ ${matched.word} topildi`);
      } else {
        setTeam2Words((p) => p.map((w) => (w.id === matched.id ? { ...w, found: true } : w)));
        setTeam2Message(`✅ ${matched.word} topildi`);
      }
      markCellsFound(teamId, selected);
      setToast(`🎉 ${teamNames[teamId]}: ${matched.word}`);
    } else {
      if (teamId === 0) setTeam1Message("❌ Noto'g'ri so'z");
      else setTeam2Message("❌ Noto'g'ri so'z");
    }

    window.setTimeout(() => {
      if (teamId === 0) {
        setTeam1Selected([]);
        setTeam1Locked(false);
      } else {
        setTeam2Selected([]);
        setTeam2Locked(false);
      }
    }, 600);
  };

  const handleCellClick = (teamId: TeamId, row: number, col: number) => {
    if (phase !== "play") return;

    const grid = teamId === 0 ? team1Grid : team2Grid;
    const selected = teamId === 0 ? team1Selected : team2Selected;
    const locked = teamId === 0 ? team1Locked : team2Locked;

    if (locked || !grid[row] || grid[row][col]?.found) return;

    const setSelected = teamId === 0 ? setTeam1Selected : setTeam2Selected;
    const isSelected = selected.some((c) => c.row === row && c.col === col);
    if (isSelected) {
      return setSelected((p) => p.filter((c) => !(c.row === row && c.col === col)));
    }

    if (!isStraightSelection(selected, row, col)) return;
    setSelected((p) => [...p, { row, col }]);
  };

  useEffect(() => {
    if (phase !== "play") return;
    if (timer <= 0) {
      setPhase("finish");
      setToast("⏰ Vaqt tugadi!");
      return;
    }

    timerRef.current = window.setTimeout(() => setTimer((p) => p - 1), 1000);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [phase, timer]);

  useEffect(() => {
    const audio = new Audio(wordSearchGameSound);
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    if (phase === "play") {
      void audioRef.current.play().catch(() => undefined);
      return;
    }

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }, [phase]);

  useEffect(() => {
    if (phase === "play" && team1Words.every((w) => w.found) && team2Words.every((w) => w.found)) {
      setPhase("finish");
      setToast("🏁 Ikkala guruh ham tugatdi!");
    }
  }, [phase, team1Words, team2Words]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const formatTimer = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

  const renderBoard = (teamId: TeamId) => {
    const name = teamNames[teamId];
    const words = teamId === 0 ? team1Words : team2Words;
    const grid = teamId === 0 ? team1Grid : team2Grid;
    const selected = teamId === 0 ? team1Selected : team2Selected;
    const locked = teamId === 0 ? team1Locked : team2Locked;
    const foundCount = teamId === 0 ? team1Found : team2Found;
    const msg = teamId === 0 ? team1Message : team2Message;

    return (
      <div className={`rounded-2xl border p-4 ${teamId === 0 ? "border-emerald-500/30 bg-emerald-950/30" : "border-teal-500/30 bg-teal-950/30"}`}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/70">{teamId === 0 ? "1-GURUH" : "2-GURUH"}</p>
            <p className="text-lg font-black text-white">{name}</p>
            <p className="text-sm text-white/70">Topilgan: {foundCount}/{words.length}</p>
          </div>
          <p className="text-3xl font-black text-yellow-300">{foundCount}</p>
        </div>

        <div className="relative overflow-x-auto pb-2">
          <div className="mx-auto grid min-w-[420px] w-fit grid-cols-12 gap-1">
            {grid.map((row, r) => row.map((cell, c) => {
              const isSel = selected.some((s) => s.row === r && s.col === c);
              return (
                <button
                  key={`${teamId}-${r}-${c}`}
                  onClick={() => handleCellClick(teamId, r, c)}
                  disabled={phase !== "play" || locked || cell.found}
                  className={`h-9 w-9 rounded-md border text-sm font-bold sm:h-10 sm:w-10 sm:text-base ${
                    cell.found
                      ? teamId === 0
                        ? "border-emerald-300 bg-emerald-500/35 text-emerald-100"
                        : "border-teal-300 bg-teal-500/35 text-teal-100"
                      : isSel
                        ? "border-yellow-300 bg-yellow-500/60 text-white"
                        : "border-white/20 bg-black/20 text-white hover:bg-white/10"
                  }`}
                >
                  {cell.letter}
                </button>
              );
            }))}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-center">
            <p className="text-xs text-white/70">Tanlangan</p>
            <p className="text-xl font-bold tracking-widest text-white">{selected.map((s) => grid[s.row]?.[s.col]?.letter).join("") || "—"}</p>
          </div>
          <button
            onClick={() => submitWord(teamId)}
            disabled={phase !== "play" || locked || selected.length === 0}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-black text-white disabled:opacity-40"
          >
            TEKSHIRISH
          </button>
        </div>

        {msg && <div className="mt-3 rounded-lg border border-white/20 bg-black/20 px-3 py-2 text-sm">{msg}</div>}

        {showWordLists && (
          <div className="mt-4">
            <p className="mb-2 text-xs font-bold text-white/70">SO'ZLAR</p>
            <div className="grid grid-cols-2 gap-1">
              {words.map((w) => (
                <div key={w.id} className={`rounded px-2 py-1 text-xs ${w.found ? "bg-emerald-500/30 text-emerald-100 line-through" : "text-white/80"}`}>
                  {w.word}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative text-white">
      <div className="fixed left-1/2 top-24 z-50 -translate-x-1/2 transform">
        {toast && <div className="animate-bounce rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 font-bold text-white shadow-2xl">{toast}</div>}
      </div>

      {phase === "finish" && winner !== null && (
        <Confetti mode="boom" particleCount={100} effectCount={1} x={0.5} y={0.35} colors={["#10b981", "#14b8a6", "#f59e0b", "#8b5cf6", "#ec4899"]} />
      )}

      {phase === "teacher" && (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 p-6 backdrop-blur-xl">
          <div className="relative mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500"><MdSettings className="text-3xl text-white" /></div>
              <div>
                <h2 className="text-3xl font-black text-white">O'QITUVCHI PANELI</h2>
                <p className="text-emerald-200/80">2 ta guruh uchun alohida so'z ro'yxati</p>
              </div>
            </div>
            <button onClick={resetToDefaults} className="rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-4 py-2 text-sm font-bold text-emerald-300">Default so'zlar</button>
          </div>

          <div className="relative grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white"><RiTeamFill className="text-emerald-400" />GURUHLAR</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-400"><GiFruitBowl />1-GURUH NOMI</label>
                    <input value={teamNames[0]} onChange={(e) => setTeamNames([e.target.value, teamNames[1]])} className="w-full rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-white" />
                  </div>
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-bold text-teal-400"><GiBroccoli />2-GURUH NOMI</label>
                    <input value={teamNames[1]} onChange={(e) => setTeamNames([teamNames[0], e.target.value])} className="w-full rounded-xl border border-teal-500/30 bg-teal-950/30 px-4 py-3 text-white" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white"><MdTimer className="text-emerald-400" />O'YIN SOZLAMALARI</h3>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-white">4:00 (240 soniya)</div>
                <div className="mt-4">
                  <label className="mb-2 block text-sm text-emerald-200/80">Qiyinlik</label>
                  <div className="flex gap-2">
                    {["easy", "medium", "hard"].map((d) => (
                      <button key={d} onClick={() => setDifficulty(d as "easy" | "medium" | "hard")} className={`flex-1 rounded-xl py-2 text-sm font-bold ${difficulty === d ? "bg-emerald-500 text-white" : "border border-emerald-500/30 bg-emerald-950/30 text-emerald-200/80"}`}>
                        {d === "easy" ? "Oson" : d === "medium" ? "O'rtacha" : "Qiyin"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white"><FaPlus className="text-emerald-400" />YANGI SO'Z QO'SHISH</h3>
                <div className="grid gap-3">
                  <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4">
                    <div className="mb-3 flex items-center gap-2 text-cyan-300">
                      <FaRobot />
                      <p className="text-sm font-bold">AI SO'Z GENERATSIYASI</p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        className="w-full rounded-xl border border-cyan-500/30 bg-slate-950/70 px-4 py-3 text-white placeholder-cyan-300/40"
                        placeholder="Mavzu: kosmos, texnologiya, hayvonlar..."
                      />
                      <select
                        value={aiWordCount}
                        onChange={(e) => setAiWordCount(Number(e.target.value))}
                        className="w-full rounded-xl border border-cyan-500/30 bg-slate-950/70 px-4 py-3 text-white"
                      >
                        {AI_WORD_COUNT_OPTIONS.map((count) => (
                          <option key={count} value={count} className="bg-slate-950">
                            {count} ta so'z
                          </option>
                        ))}
                      </select>
                      <select
                        value={aiDifficulty}
                        onChange={(e) => setAiDifficulty(e.target.value as "easy" | "medium" | "hard" | "mixed")}
                        className="w-full rounded-xl border border-cyan-500/30 bg-slate-950/70 px-4 py-3 text-white"
                      >
                        {AI_DIFFICULTY_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value} className="bg-slate-950">
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => void generateWordsWithAi()}
                        disabled={!hasGeminiKey || isGeneratingAi}
                        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 py-3 font-bold text-white disabled:opacity-50"
                      >
                        {isGeneratingAi ? `${aiWordCount} ta yaratilmoqda...` : `AI bilan ${aiWordCount} ta yaratish`}
                      </button>
                    </div>
                    <p className="mt-3 text-xs text-cyan-100/70">
                      AI yaratgan so'zlar ikki guruhga avtomatik bo'linadi. "Aralash" tanlansa oson, o'rtacha va qiyin so'zlar aralash keladi.
                    </p>
                    {!hasGeminiKey && (
                      <p className="mt-2 text-xs text-amber-300">
                        AI ishlashi uchun `.env` ichida `VITE_GEMINI_API_KEY` bo'lishi kerak.
                      </p>
                    )}
                  </div>

                  <input value={draft.word} onChange={(e) => setDraft({ ...draft, word: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addWord()} className="w-full rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-white" placeholder="So'zni kiriting" />
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setDraft({ ...draft, category: "team1" })} className={`rounded-xl py-2 text-sm font-bold ${draft.category === "team1" ? "bg-emerald-500 text-white" : "border border-emerald-500/30 bg-emerald-950/30 text-emerald-200/80"}`}>{teamNames[0]}</button>
                    <button onClick={() => setDraft({ ...draft, category: "team2" })} className={`rounded-xl py-2 text-sm font-bold ${draft.category === "team2" ? "bg-teal-500 text-white" : "border border-teal-500/30 bg-teal-950/30 text-teal-200/80"}`}>{teamNames[1]}</button>
                  </div>
                  <button onClick={addWord} className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 font-bold text-white"><FaPlus className="mr-2 inline" />SO'Z QO'SHISH</button>
                  {draftError && <p className="text-sm text-rose-300">{draftError}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3">
                  <h4 className="mb-2 text-sm font-bold text-emerald-400">{teamNames[0]} ({team1Words.length})</h4>
                  <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                    {team1Words.map((w) => <div key={w.id} className="group flex items-center justify-between"><span className="text-xs text-white">{w.word}</span><button onClick={() => removeWord(w.id, "team1")} className="text-rose-400 opacity-0 group-hover:opacity-100"><FaTrash size={12} /></button></div>)}
                  </div>
                </div>
                <div className="rounded-xl border border-teal-500/30 bg-teal-950/30 p-3">
                  <h4 className="mb-2 text-sm font-bold text-teal-400">{teamNames[1]} ({team2Words.length})</h4>
                  <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                    {team2Words.map((w) => <div key={w.id} className="group flex items-center justify-between"><span className="text-xs text-white">{w.word}</span><button onClick={() => removeWord(w.id, "team2")} className="text-rose-400 opacity-0 group-hover:opacity-100"><FaTrash size={12} /></button></div>)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {nameError && <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/20 p-3 text-rose-300">⚠️ {nameError}</div>}
          <div className="mt-8 flex justify-center"><button onClick={handleStartGame} className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-12 py-4 text-xl font-black text-white"><FaPlay className="mr-3 inline" />O'YINNI BOSHLASH</button></div>
        </div>
      )}

      {phase === "play" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4"><p className="text-xs text-emerald-400">1-GURUH</p><p className="text-lg font-bold text-white">{teamNames[0]}</p><p className="text-2xl font-black text-emerald-300">{team1Found} ta</p></div>
            <div className="rounded-xl border border-teal-500/30 bg-teal-950/30 p-4"><p className="text-xs text-teal-400">2-GURUH</p><p className="text-lg font-bold text-white">{teamNames[1]}</p><p className="text-2xl font-black text-teal-300">{team2Found} ta</p></div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-4"><p className="text-xs text-emerald-400">⏱ VAQT</p><p className="text-2xl font-black text-white">{formatTimer(timer)}</p></div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-4"><p className="text-xs text-emerald-400">📊 PROGRESS</p><p className="text-2xl font-black text-white">{progressPct}%</p></div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 p-4"><p className="text-sm text-emerald-200/80">Rejim</p><p className="text-xl font-black text-white">Ikkala guruh bir vaqtda o'ynaydi</p></div>
            <button onClick={() => setShowWordLists((p) => !p)} className="rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-4 py-3 text-emerald-300">{showWordLists ? "🙈 So'zlarni yashirish" : "👀 So'zlarni ko'rsatish"}</button>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">{renderBoard(0)}{renderBoard(1)}</div>
          <div className="flex justify-center"><button onClick={() => setPhase("finish")} className="rounded-xl border border-rose-500/30 bg-rose-500/20 px-6 py-3 text-rose-300">O'YINNI YAKUNLASH</button></div>
        </div>
      )}

      {phase === "finish" && (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/30 via-teal-900/30 to-cyan-900/30 p-8 text-center backdrop-blur-xl">
          <div className="relative mb-6 flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"><GiPodium className="text-4xl text-white" /></div></div>
          <h2 className="relative mb-8 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-4xl font-black text-transparent">O'YIN YAKUNLANDI</h2>

          <div className="relative mx-auto mb-8 grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
            {[0, 1].map((id) => {
              const isWinner = winner === id;
              const found = id === 0 ? team1Found : team2Found;
              return (
                <div key={id} className={`relative rounded-2xl p-4 pt-8 ${isWinner ? "bg-gradient-to-b from-yellow-600 to-orange-600" : "bg-gradient-to-b from-gray-600 to-gray-700"}`}>
                  <div className="absolute left-1/2 top-[-24px] -translate-x-1/2">{isWinner ? <FaCrown className="text-2xl text-yellow-200" /> : <FaMedal className="text-2xl text-slate-200" />}</div>
                  <p className="text-xl font-black text-white">{winner === null ? "TENG" : isWinner ? "1- O'RIN" : "2- O'RIN"}</p>
                  <p className="text-lg font-bold text-white">{teamNames[id as TeamId]}</p>
                  <p className="text-3xl font-black text-yellow-300">{found} ta</p>
                </div>
              );
            })}
          </div>

          <div className="relative flex justify-center gap-4">
            <button onClick={() => setPhase("teacher")} className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 font-black text-white"><GiSpinningWheel className="mr-2 inline" />QAYTA O'YNA</button>
            <button onClick={() => { window.location.href = "/games"; }} className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-bold text-white"><FaArrowLeft className="mr-2 inline" />O'YINLAR</button>
          </div>
        </div>
      )}
      <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />
    </div>
  );
}
