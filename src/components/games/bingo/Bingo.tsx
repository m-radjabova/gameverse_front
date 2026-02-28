import { useEffect, useMemo, useRef, useState } from "react";
import Confetti from "react-confetti-boom";
import {
  FaUsers,
  FaStar,
  FaTrophy,
  FaRedo,
  FaCheckCircle,
  FaPlay,
  FaChild,
  FaPlus,
  FaTrash,
  FaArrowLeft,
  FaPen,
  FaBolt,
  FaCrown,
  FaExchangeAlt,
  FaMagic,
  FaStopwatch,
} from "react-icons/fa";
import { GiPartyPopper } from "react-icons/gi";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../shared/useGameStartCountdown";

type Difficulty = "easy" | "medium" | "hard";
type BonusType = "none" | "double" | "joker" | "swap";

type BingoCell = {
  id: string;
  text: string;
  emoji: string;
  found: boolean;

  // Kim topdi (finder) — faol o‘quvchi
  foundBy?: string;

  // Kimga mos keldi (matched) — katakdagi “mos kelgan” o‘quvchi
  matchedTo?: string;

  // Qo‘shimchalar
  difficulty: Difficulty;
  bonus: BonusType;

  // UI
  lastMarkedAt?: number;
};

type Student = {
  id: string;
  name: string;

  // “Eng faol” — topganlari / ball
  foundCount: number;
  points: number;

  // “Eng mashhur” — nechta katakka mos kelgani
  matchedCount: number;
};

// ====== Default bingo kataklari (difficulty va bonus keyin random beriladi) ======
const DEFAULT_BINGO_CATEGORIES: Omit<BingoCell, "difficulty" | "bonus">[] = [
  { id: "1", text: "DOVON QILA OLADIGAN", emoji: "🤸", found: false },
  { id: "2", text: "SIZGA O'XSHASH RANG YOQADIGAN", emoji: "🎨", found: false },
  { id: "3", text: "SIZGA O'XSHASH MEVA YOQADIGAN", emoji: "🍎", found: false },
  { id: "4", text: "OPASI BOR", emoji: "👧", found: false },
  { id: "5", text: "KO'ZOYNAK TAQADIGAN", emoji: "👓", found: false },
  { id: "6", text: "RAQSGA TUSHISHNI YAXSHI KO'RADIGAN", emoji: "💃", found: false },
  { id: "7", text: "O'RGIMCHAKDAN QO'RQADIGAN", emoji: "🕷️", found: false },
  { id: "8", text: "CHOLG'U ASBOBIDA CHALA OLADIGAN", emoji: "🎸", found: false },
  { id: "9", text: "MAKTABGA PIYODA KELADIGAN", emoji: "🚶", found: false },
  { id: "10", text: "SHIRINLIKLARNI YAXSHI KO'RADIGAN", emoji: "🍫", found: false },
  { id: "11", text: "SIZ BILAN BIR OYDA TUG'ILGAN", emoji: "🎂", found: false },
  { id: "12", text: "CHAP QO'L ISHLATADIGAN", emoji: "✋", found: false },
  { id: "13", text: "SUZISHNI YAXSHI KO'RADIGAN", emoji: "🏊", found: false },
  { id: "14", text: "UY HAYVONI BOR", emoji: "🐶", found: false },
  { id: "15", text: "VELOSIPED MINISHNI YAXSHI KO'RADIGAN", emoji: "🚲", found: false },
  { id: "16", text: "ERTAKLARNI YAXSHI KO'RADIGAN", emoji: "📖", found: false },
];

const MISSIONS = [
  "Ikki o‘quvchi bir-biriga 1 ta kompliment aytsin 😊",
  "Bitta o‘quvchi o‘zini 3 ta so‘z bilan tariflasin ✨",
  "3 kishilik ‘5 soniya raqs’ challenge 💃🕺",
  "Kimdir sevimli mevasini aytsin va nega yoqishini tushuntirsin 🍎",
  "Bitta o‘quvchi 1 ta qiziq fakt aytsin 🤓",
  "2 kishi ‘tanishuv’ savoli bersin: ‘Sening sevimli o‘yining?’ 🎮",
];

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pickRandomIds(ids: string[], count: number) {
  return shuffle(ids).slice(0, Math.min(count, ids.length));
}

function difficultyBasePoints(d: Difficulty) {
  if (d === "easy") return 1;
  if (d === "medium") return 2;
  return 3;
}

// Oddiy “ding/boom” (audio faylsiz) — WebAudio bilan
function playSound(kind: "ding" | "boom" | "click" | "warning") {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);

    const now = ctx.currentTime;

    const config = {
      click: { f1: 420, f2: 280, dur: 0.06, vol: 0.12 },
      ding: { f1: 660, f2: 990, dur: 0.12, vol: 0.14 },
      warning: { f1: 260, f2: 220, dur: 0.18, vol: 0.14 },
      boom: { f1: 120, f2: 60, dur: 0.25, vol: 0.18 },
    }[kind];

    o.type = "sine";
    o.frequency.setValueAtTime(config.f1, now);
    o.frequency.exponentialRampToValueAtTime(config.f2, now + config.dur);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(config.vol, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + config.dur);

    o.start(now);
    o.stop(now + config.dur + 0.02);

    setTimeout(() => ctx.close().catch(() => {}), 350);
  } catch {
    // audio ishlamasa ham o‘yin davom etadi
  }
}

// 4x4 “Bingo chiziqlari”
const LINES_4x4: number[][] = [
  // rows
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
  [12, 13, 14, 15],
  // cols
  [0, 4, 8, 12],
  [1, 5, 9, 13],
  [2, 6, 10, 14],
  [3, 7, 11, 15],
  // diagonals
  [0, 5, 10, 15],
  [3, 6, 9, 12],
];

function Bingo() {
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();

  // ====== fazalar ======
  const [phase, setPhase] = useState<"teacher" | "game">("teacher");

  // ====== students ======
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudentName, setNewStudentName] = useState("");
  const [studentError, setStudentError] = useState("");

  // ====== game states ======
  const [bingoCells, setBingoCells] = useState<BingoCell[]>(() => initCells());
  const [bingoCount, setBingoCount] = useState(0);

  const [showConfetti, setShowConfetti] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Modal / marking
  const [selectedCell, setSelectedCell] = useState<BingoCell | null>(null);

  // Finder (kim topdi)
  const [selectedFinderId, setSelectedFinderId] = useState<string>("");
  const [finderNameTyped, setFinderNameTyped] = useState("");

  // Matched (kimga mos keldi)
  const [selectedMatchedId, setSelectedMatchedId] = useState<string>("");
  const [matchedNameTyped, setMatchedNameTyped] = useState("");

  // Timer
  const BASE_CELL_TIME = 60; // sek
  const TURBO_CELL_TIME = 30; // sek
  const [cellTimeLeft, setCellTimeLeft] = useState<number>(BASE_CELL_TIME);
  const timerRef = useRef<number | null>(null);

  // Turbo round (oxirgi 4 ta katakda 3 minut)
  const [turboActive, setTurboActive] = useState(false);
  const [turboEndsAt, setTurboEndsAt] = useState<number | null>(null);

  // Missions
  const [missionOpen, setMissionOpen] = useState(false);
  const [missionText, setMissionText] = useState<string>("");

  // Bingo lines
  const [completedLines, setCompletedLines] = useState<number>(0);
  const [lineSet, setLineSet] = useState<Set<string>>(() => new Set()); // qaysi line yopilgan

  // Game over
  const [gameOver, setGameOver] = useState(false);

  // Swap bonus mode
  const [swapMode, setSwapMode] = useState(false);
  const [swapFirstId, setSwapFirstId] = useState<string | null>(null);

  // Joker credits (topilgan “joker” kataklar soni)
  const [jokerCredits, setJokerCredits] = useState(0);

  // ====== helper: init cells ======
  function initCells(): BingoCell[] {
    const base = shuffle(DEFAULT_BINGO_CATEGORIES).map((c, idx) => {
      // difficulty random: 6 easy, 6 medium, 4 hard (mos ravishda)
      const difficulty: Difficulty =
        idx < 6 ? "easy" : idx < 12 ? "medium" : "hard";

      return {
        ...c,
        difficulty,
        bonus: "none" as BonusType,
      };
    });

    // Bonus random: 2 double, 1 joker, 1 swap
    const ids = base.map((c) => c.id);
    const doubleIds = pickRandomIds(ids, 2);
    const rest = ids.filter((id) => !doubleIds.includes(id));
    const jokerId = pickRandomIds(rest, 1)[0];
    const rest2 = rest.filter((id) => id !== jokerId);
    const swapId = pickRandomIds(rest2, 1)[0];

    return base.map((c) => {
      if (doubleIds.includes(c.id)) return { ...c, bonus: "double" };
      if (c.id === jokerId) return { ...c, bonus: "joker" };
      if (c.id === swapId) return { ...c, bonus: "swap" };
      return c;
    });
  }

  // ====== Toast ======
  const showToastMessage = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  // ====== Students: add/remove ======
  const addStudent = () => {
    const name = newStudentName.trim();
    if (!name) {
      setStudentError("O'quvchi ismini kiriting!");
      return;
    }
    if (students.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setStudentError("Bu o'quvchi allaqachon qo'shilgan!");
      return;
    }

    const newStudent: Student = {
      id: `student-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      foundCount: 0,
      points: 0,
      matchedCount: 0,
    };

    setStudents((prev) => [...prev, newStudent]);
    setNewStudentName("");
    setStudentError("");
    playSound("ding");
    showToastMessage(`✅ ${name} qo'shildi`);
  };

  const removeStudent = (id: string) => {
    const student = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    playSound("click");
    showToastMessage(`🗑️ ${student?.name} o'chirildi`);
  };

  // ====== Start game ======
  const startGame = () => {
    if (students.length < 2) {
      showToastMessage("Kamida 2 o'quvchi bo'lishi kerak!");
      playSound("warning");
      return;
    }
    setPhase("game");
    showToastMessage("🎮 O'yin boshlandi! Bolalar kataklarni topsin");
    playSound("ding");
  };

  const handleStartGame = () => runStartCountdown(startGame);

  // ====== Leaders ======
  const leaderActive = useMemo(() => {
    if (!students.length) return null;
    return [...students].sort((a, b) => b.points - a.points)[0];
  }, [students]);

  const leaderPopular = useMemo(() => {
    if (!students.length) return null;
    return [...students].sort((a, b) => b.matchedCount - a.matchedCount)[0];
  }, [students]);

  // ====== Turbo timer countdown ======
  const turboLeft = useMemo(() => {
    if (!turboActive || !turboEndsAt) return 0;
    return Math.max(0, Math.ceil((turboEndsAt - Date.now()) / 1000));
  }, [turboActive, turboEndsAt, toast]); // toast orqali re-render bo‘ladi; yengil usul

  useEffect(() => {
    if (!turboActive || !turboEndsAt) return;

    const id = window.setInterval(() => {
      const left = Math.max(0, turboEndsAt - Date.now());
      if (left <= 0) {
        setTurboActive(false);
        setTurboEndsAt(null);
        showToastMessage("⏱️ Turbo raund tugadi!");
        playSound("warning");
      } else {
        // har soniyada re-render bo‘lsin
        setToast((t) => t); // no-op trigger
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, [turboActive, turboEndsAt]);

  // ====== Mark cell click ======
  const markCell = (cell: BingoCell) => {
    if (gameOver) return;

    // swap mode ishlayotganda: 2 ta topilmagan katakni joyini almashtirish
    if (swapMode) {
      if (cell.found) {
        showToastMessage("❌ Faqat topilmagan kataklar bilan swap qilinadi");
        playSound("warning");
        return;
      }
      if (!swapFirstId) {
        setSwapFirstId(cell.id);
        showToastMessage("🔁 Endi ikkinchi katakni tanlang");
        playSound("click");
        return;
      }
      if (swapFirstId === cell.id) {
        setSwapFirstId(null);
        showToastMessage("❌ Bir xil katak tanlandi, qayta urinib ko‘ring");
        playSound("warning");
        return;
      }

      // swap positions
      setBingoCells((prev) => {
        const a = prev.findIndex((c) => c.id === swapFirstId);
        const b = prev.findIndex((c) => c.id === cell.id);
        if (a === -1 || b === -1) return prev;
        const next = [...prev];
        const tmp = next[a];
        next[a] = next[b];
        next[b] = tmp;
        return next;
      });

      setSwapMode(false);
      setSwapFirstId(null);
      showToastMessage("✅ Swap bajarildi!");
      playSound("ding");
      return;
    }

    // joker credits bo‘lsa: o‘qituvchi xohlagan katakni “joker” bilan tezroq to‘ldirishi mumkin
    // (baribir kim topdi + kimga mos keldi kiritiladi)
    if (!cell.found) {
      setSelectedCell(cell);
      setSelectedFinderId("");
      setFinderNameTyped("");
      setSelectedMatchedId("");
      setMatchedNameTyped("");

      // timer start
      stopCellTimer();
      const time = turboActive ? TURBO_CELL_TIME : BASE_CELL_TIME;
      setCellTimeLeft(time);
      startCellTimer(time);

      playSound("click");
    }
  };

  // ====== Cell timer ======
  const startCellTimer = (startFrom: number) => {
    setCellTimeLeft(startFrom);
    timerRef.current = window.setInterval(() => {
      setCellTimeLeft((t) => {
        if (t <= 1) {
          // time up
          stopCellTimer();
          setSelectedCell(null);
          playSound("warning");
          showToastMessage("⏳ Vaqt tugadi! Boshqa katakka o‘ting");
          return 0;
        }
        if (t === 11) playSound("warning"); // 10 ga yaqinlashganda
        return t - 1;
      });
    }, 1000);
  };

  const stopCellTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    // modal yopilsa timer ham to‘xtasin
    if (!selectedCell) stopCellTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCell]);

  // ====== helpers: resolve names ======
  const resolveName = (id: string, typed: string) => {
    if (id) {
      const s = students.find((x) => x.id === id);
      return s?.name || "";
    }
    return typed.trim();
  };

  // ====== Check bingo lines ======
  const checkLines = (cells: BingoCell[]) => {
    const newLineSet = new Set(lineSet);
    let newlyCompleted = 0;

    LINES_4x4.forEach((line, idx) => {
      const key = `L${idx}`;
      if (newLineSet.has(key)) return;

      const ok = line.every((pos) => cells[pos]?.found);
      if (ok) {
        newLineSet.add(key);
        newlyCompleted += 1;
      }
    });

    if (newlyCompleted > 0) {
      setLineSet(newLineSet);
      setCompletedLines(newLineSet.size);
      playSound("ding");
      showToastMessage(`🎯 Bingo chizig‘i yopildi! (+${newlyCompleted})`);
    }
  };

  // ====== Missions (har 3 ta topilganda) ======
  const maybeShowMission = (foundCountNow: number) => {
    if (foundCountNow > 0 && foundCountNow % 3 === 0) {
      const text = shuffle(MISSIONS)[0];
      setMissionText(text);
      setMissionOpen(true);
      playSound("ding");
    }
  };

  // ====== Confirm mark (finder + matched) ======
  const confirmMark = () => {
    if (!selectedCell || gameOver) return;

    const finderName = resolveName(selectedFinderId, finderNameTyped);
    const matchedName = resolveName(selectedMatchedId, matchedNameTyped);

    if (!finderName) {
      showToastMessage("Iltimos, 'Kim topdi' ismini tanlang yoki yozing!");
      playSound("warning");
      return;
    }
    if (!matchedName) {
      showToastMessage("Iltimos, 'Kimga mos keldi' ismini tanlang yoki yozing!");
      playSound("warning");
      return;
    }

    // points calc
    const base = difficultyBasePoints(selectedCell.difficulty);
    const turboMultiplier = turboActive ? 2 : 1;
    const doubleMultiplier = selectedCell.bonus === "double" ? 2 : 1;
    const points = base * turboMultiplier * doubleMultiplier;

    // update students
    setStudents((prev) =>
      prev.map((s) => {
        if (s.name === finderName) {
          return {
            ...s,
            foundCount: s.foundCount + 1,
            points: s.points + points,
          };
        }
        if (s.name === matchedName) {
          return {
            ...s,
            matchedCount: s.matchedCount + 1,
          };
        }
        return s;
      })
    );

    // mark cell
    setBingoCells((prev) => {
      const now = Date.now();
      const newCells = prev.map((c) =>
        c.id === selectedCell.id
          ? {
              ...c,
              found: true,
              foundBy: finderName,
              matchedTo: matchedName,
              lastMarkedAt: now,
            }
          : c
      );

      const foundNow = newCells.filter((c) => c.found).length;
      setBingoCount(foundNow);

      // turbo auto start at last 4 cells (found >= 12) once
      if (!turboActive && foundNow >= 12 && !gameOver) {
        setTurboActive(true);
        setTurboEndsAt(Date.now() + 180 * 1000);
        showToastMessage("⚡ TURBO RAUND boshlandi! (3 daqiqa, ball x2)");
        playSound("boom");
      }

      // missions
      maybeShowMission(foundNow);

      // lines check
      checkLines(newCells);

      // bonus effects
      if (selectedCell.bonus === "joker") {
        setJokerCredits((c) => c + 1);
        showToastMessage("🃏 Joker qo‘lga kiritildi! (1 marta yordam)");
        playSound("ding");
      }
      if (selectedCell.bonus === "swap") {
        setSwapMode(true);
        setSwapFirstId(null);
        showToastMessage("🔁 Swap bonus! 2 ta katakni tanlab joyini almashtiring");
        playSound("ding");
      }

      // end conditions:
      // 1) 3 ta chiziq yopilsa, yoki 2) 16/16 bo‘lsa, yoki 3) turbo tugab qolsa ham davom etadi (faqat bonus tugaydi)
      const linesNow = (() => {
        // hisoblash uchun vaqtinchalik:
        const tmpSet = new Set<string>(lineSet);
        LINES_4x4.forEach((line, idx) => {
          const key = `L${idx}`;
          if (tmpSet.has(key)) return;
          const ok = line.every((pos) => newCells[pos]?.found);
          if (ok) tmpSet.add(key);
        });
        return tmpSet.size;
      })();

      if (foundNow === 16 || linesNow >= 3) {
        setGameOver(true);
        setShowConfetti(true);
        playSound("boom");

        const activeWinner = (() => {
          const withMaybeNew = students.map((s) => {
            if (s.name === finderName) return { ...s, points: s.points + points };
            if (s.name === matchedName) return { ...s, matchedCount: s.matchedCount + 1 };
            return s;
          });
          return [...withMaybeNew].sort((a, b) => b.points - a.points)[0];
        })();

        showToastMessage(
          `🎉 O‘yin tugadi! Eng faol: ${activeWinner?.name || finderName}`
        );
      } else {
        showToastMessage(
          `✅ "${selectedCell.text}" — Topdi: ${finderName} (+${points}), Mos: ${matchedName} (+1)`
        );
      }

      return newCells;
    });

    stopCellTimer();
    setSelectedCell(null);
  };

  // ====== Joker usage button ======
  const useJoker = () => {
    if (jokerCredits <= 0) return;
    setJokerCredits((c) => c - 1);
    showToastMessage("🃏 Joker ishlatildi! Istalgan katakni tanlang");
    playSound("ding");
    // Joker — faqat “ruxsat” sifatida; amalda o‘qituvchi baribir katakni bosib to‘ldiradi.
    // Siz xohlasangiz, bu joyga qo‘shimcha qoidalar ham qo‘shish mumkin.
  };

  // ====== Reset game ======
  const resetGame = () => {
    setBingoCells(initCells());
    setBingoCount(0);
    setShowConfetti(false);
    setSelectedCell(null);

    setStudents((prev) =>
      prev.map((s) => ({ ...s, foundCount: 0, points: 0, matchedCount: 0 }))
    );

    setPhase("teacher");
    setCompletedLines(0);
    setLineSet(new Set());
    setGameOver(false);

    setSwapMode(false);
    setSwapFirstId(null);
    setJokerCredits(0);

    setTurboActive(false);
    setTurboEndsAt(null);

    setMissionOpen(false);
    setMissionText("");

    stopCellTimer();
    showToastMessage("🔄 O'yin qayta boshlandi");
    playSound("click");
  };

  // ====== UI tags ======
  const bonusBadge = (b: BonusType) => {
    if (b === "double")
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-white/25 text-white">
          <FaBolt /> x2
        </span>
      );
    if (b === "joker")
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-white/25 text-white">
          <FaMagic /> Joker
        </span>
      );
    if (b === "swap")
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-white/25 text-white">
          <FaExchangeAlt /> Swap
        </span>
      );
    return null;
  };

  const diffBadge = (d: Difficulty) => {
    const map: Record<Difficulty, string> = {
      easy: "🟢 Oson",
      medium: "🟡 O‘rtacha",
      hard: "🔴 Qiyin",
    };
    return (
      <span className="text-[10px] px-2 py-1 rounded-full bg-white/25 text-white">
        {map[d]}
      </span>
    );
  };

  const formatSec = (s: number) => {
    const mm = String(Math.floor(s / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 dark:from-yellow-950 dark:via-orange-950 dark:to-pink-950 py-8 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti mode="boom" particleCount={240} effectCount={1} x={0.5} y={0.3} />
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-full shadow-2xl animate-bounce">
            {toast}
          </div>
        </div>
      )}

      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-yellow-300/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-pink-300/20 blur-3xl animate-pulse delay-1000" />

        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-4xl opacity-10 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
            }}
          >
            {["🧒", "👧", "🧸", "🎈", "🎉", "⭐", "📚", "✏️"][i % 8]}
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 px-6 py-3 rounded-2xl border border-yellow-400/30 backdrop-blur-sm mb-4">
            <FaChild className="text-3xl text-yellow-500 animate-bounce" />
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              TANISHUV BINGO
            </h1>
            <FaChild className="text-3xl text-orange-500 animate-bounce delay-300" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            O'qituvchi o'quvchilarni qo'shadi, bolalar esa suhbatlashib kataklarni to'ldiradi!
          </p>
        </div>

        {phase === "teacher" ? (
          /* ========== O'QITUVCHI PANELI ========== */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl border-2 border-yellow-400/30 p-6 backdrop-blur-sm shadow-2xl">
              {/* Panel Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-yellow-400/30">
                <div className="relative">
                  <div className="absolute -inset-1 animate-ping rounded-full bg-yellow-400/30" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-400">
                    <FaPen className="text-white text-lg" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">O'qituvchi paneli</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    O'quvchilarni qo'shing va o'yinni boshlang
                  </p>
                </div>
              </div>

              {/* Add student */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Yangi o'quvchi qo'shish
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addStudent()}
                    placeholder="O'quvchi ismi..."
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-yellow-400/30 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:border-yellow-400 focus:outline-none"
                  />
                  <button
                    onClick={addStudent}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <FaPlus />
                    Qo'shish
                  </button>
                </div>
                {studentError && <p className="mt-2 text-sm text-red-500">{studentError}</p>}
              </div>

              {/* Students list */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <FaUsers className="text-yellow-500" />
                  O'quvchilar ({students.length})
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2">
                  {students.map((student, index) => (
                    <div
                      key={student.id}
                      className="group relative bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 border-2 border-yellow-400/30 hover:border-yellow-400 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-white text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="text-sm font-bold text-gray-800 dark:text-white">
                            {student.name}
                          </span>
                        </div>
                        <button
                          onClick={() => removeStudent(student.id)}
                          className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                      {(student.foundCount > 0 || student.matchedCount > 0) && (
                        <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-400">
                          Faol: {student.points} ball • Mos: {student.matchedCount}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules */}
              <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl border-2 border-yellow-400/30">
                <h4 className="font-bold text-yellow-700 dark:text-yellow-400 mb-2 flex items-center gap-2">
                  <GiPartyPopper />
                  Qanday o'ynaladi?
                </h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500">1.</span>
                    <span>
                      <b>O'qituvchi</b> o'quvchilar ismlarini ro'yxatga qo'shadi
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500">2.</span>
                    <span>
                      O'yin boshlangach bolalar suhbatlashadi va mos kataklarni topadi
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500">3.</span>
                    <span>
                      Har katakda <b>Kim topdi</b> va <b>Kimga mos keldi</b> kiritiladi
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500">4.</span>
                    <span>
                      <b>3 ta bingo chizig‘i</b> yoki <b>16 ta katak</b> — o‘yin tugaydi!
                    </span>
                  </li>
                </ul>
              </div>

              {/* Start */}
              {students.length >= 2 && (
                <button
                  onClick={handleStartGame}
                  className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4 text-lg font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                  <span className="relative flex items-center justify-center gap-3">
                    <FaPlay />
                    O'YINNI BOSHLASH
                  </span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ========== O'YIN JARAYONI ========== */
          <>
            {/* Top bar: turbo + joker + swap info */}
            <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
              <div
                className={`px-4 py-2 rounded-full font-bold text-sm border-2 ${
                  turboActive
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-white/30 animate-pulse"
                    : "bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-gray-200 border-yellow-400/30"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <FaStopwatch />
                  Turbo: {turboActive ? formatSec(turboLeft) : "—"}
                  {turboActive && <span className="ml-1">• ball x2</span>}
                </span>
              </div>

              <button
                onClick={useJoker}
                disabled={jokerCredits <= 0}
                className={`px-4 py-2 rounded-full font-bold text-sm border-2 transition-all ${
                  jokerCredits > 0
                    ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-white/30 hover:scale-105"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 border-gray-300 dark:border-gray-600 cursor-not-allowed"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <FaMagic />
                  Joker: {jokerCredits}
                </span>
              </button>

              <div
                className={`px-4 py-2 rounded-full font-bold text-sm border-2 ${
                  swapMode
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-white/30 animate-pulse"
                    : "bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-gray-200 border-yellow-400/30"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <FaExchangeAlt />
                  Swap: {swapMode ? "TANLANG" : "—"}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div className="bg-white/90 dark:bg-slate-800/90 rounded-xl border-2 border-yellow-400/30 p-4 backdrop-blur-sm">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Topilgan kataklar</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <FaStar className="text-yellow-500" />
                  {bingoCount} / 16
                </p>
              </div>

              <div className="bg-white/90 dark:bg-slate-800/90 rounded-xl border-2 border-yellow-400/30 p-4 backdrop-blur-sm">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Qolgan kataklar</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <span className="text-yellow-500">🎯</span>
                  {16 - bingoCount} ta
                </p>
              </div>

              <div className="bg-white/90 dark:bg-slate-800/90 rounded-xl border-2 border-yellow-400/30 p-4 backdrop-blur-sm">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bingo chiziqlari</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <span className="text-yellow-500">📏</span>
                  {completedLines} / 3
                </p>
              </div>

              <div className="bg-white/90 dark:bg-slate-800/90 rounded-xl border-2 border-yellow-400/30 p-4 backdrop-blur-sm">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Eng faol</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white truncate">
                  {leaderActive ? (
                    <span className="flex items-center gap-1">
                      <FaCrown className="text-yellow-500" />
                      {leaderActive.name} ({leaderActive.points})
                    </span>
                  ) : (
                    "—"
                  )}
                </p>
              </div>

              <div className="bg-white/90 dark:bg-slate-800/90 rounded-xl border-2 border-yellow-400/30 p-4 backdrop-blur-sm">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Eng mashhur</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white truncate">
                  {leaderPopular ? (
                    <span className="flex items-center gap-1">
                      <FaTrophy className="text-yellow-500" />
                      {leaderPopular.name} ({leaderPopular.matchedCount})
                    </span>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </div>

            {/* Small students chips */}
            <div className="mb-4 flex flex-wrap gap-2 justify-center">
              {students.map((student) => (
                <div
                  key={student.id}
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    leaderActive?.id === student.id
                      ? "bg-yellow-500 text-white"
                      : "bg-yellow-100 dark:bg-yellow-900/50 text-gray-700 dark:text-gray-300"
                  }`}
                  title={`Faol: ${student.points} ball | Mos: ${student.matchedCount}`}
                >
                  {student.name}{" "}
                  {(student.points > 0 || student.matchedCount > 0) &&
                    `(${student.points}⭐ / ${student.matchedCount}👤)`}
                </div>
              ))}
            </div>

            {/* Bingo Grid */}
            <div className="bg-white/90 dark:bg-slate-800/90 rounded-3xl border-2 border-yellow-400/30 p-6 backdrop-blur-sm shadow-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {bingoCells.map((cell) => {
                  const isNew = cell.lastMarkedAt && Date.now() - cell.lastMarkedAt < 2500;

                  return (
                    <button
                      key={cell.id}
                      onClick={() => markCell(cell)}
                      disabled={cell.found || gameOver}
                      className={`
                        relative rounded-xl p-4 min-h-[130px] flex flex-col items-center justify-center text-center
                        transition-all hover:scale-105 active:scale-95 border-2
                        ${cell.found
                          ? "bg-gradient-to-br from-green-500 to-emerald-500 border-green-400 cursor-not-allowed"
                          : gameOver
                          ? "bg-gray-300 dark:bg-gray-700 border-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-br from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 border-white/50 cursor-pointer"}
                        ${isNew ? "animate-pop" : ""}
                      `}
                    >
                      {cell.found && (
                        <FaCheckCircle className="absolute top-2 right-2 text-white text-xl" />
                      )}

                      {/* badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                        {diffBadge(cell.difficulty)}
                        {bonusBadge(cell.bonus)}
                      </div>

                      <div className="text-4xl mb-2">{cell.emoji}</div>
                      <p className="text-xs font-black text-white">{cell.text}</p>

                      {cell.found && (
                        <div className="mt-2 space-y-1">
                          {cell.foundBy && (
                            <p className="text-[11px] bg-white/25 rounded-full px-2 py-1 text-white">
                              ✅ Topdi: <b>{cell.foundBy}</b>
                            </p>
                          )}
                          {cell.matchedTo && (
                            <p className="text-[11px] bg-white/25 rounded-full px-2 py-1 text-white">
                              👤 Mos: <b>{cell.matchedTo}</b>
                            </p>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mark modal */}
            {selectedCell && (
              <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-yellow-400/30">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-black text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                      <span className="text-3xl">{selectedCell.emoji}</span>
                      {selectedCell.text}
                    </h3>

                    <div className="text-right">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-black text-sm ${
                          cellTimeLeft <= 10
                            ? "bg-red-500 text-white animate-pulse"
                            : "bg-yellow-100 dark:bg-yellow-900/40 text-gray-700 dark:text-gray-200"
                        }`}
                      >
                        <FaStopwatch />
                        {cellTimeLeft}s
                      </div>
                      <div className="mt-2 flex justify-end gap-2">
                        {bonusBadge(selectedCell.bonus)}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Iltimos, ikkita narsani kiriting: <b>Kim topdi</b> va <b>Kimga mos keldi</b>.
                  </p>

                  {/* Finder */}
                  <div className="mb-4 p-4 rounded-2xl border-2 border-yellow-400/30 bg-yellow-50 dark:bg-yellow-900/20">
                    <h4 className="font-black text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                      ✅ Kim topdi? (finder)
                    </h4>

                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Ro'yxatdan tanlang
                    </label>
                    <select
                      value={selectedFinderId}
                      onChange={(e) => setSelectedFinderId(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border-2 border-yellow-400/30 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:border-yellow-400 focus:outline-none"
                    >
                      <option value="">-- Tanlang --</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>

                    <div className="text-center text-xs text-gray-500 dark:text-gray-400 my-2">
                      — yoki —
                    </div>

                    <input
                      type="text"
                      value={finderNameTyped}
                      onChange={(e) => setFinderNameTyped(e.target.value)}
                      placeholder="Yangi ism yozish..."
                      className="w-full px-4 py-2 rounded-xl border-2 border-yellow-400/30 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:border-yellow-400 focus:outline-none"
                    />
                  </div>

                  {/* Matched */}
                  <div className="mb-6 p-4 rounded-2xl border-2 border-yellow-400/30 bg-orange-50 dark:bg-orange-900/20">
                    <h4 className="font-black text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                      👤 Kimga mos keldi? (matched)
                    </h4>

                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Ro'yxatdan tanlang
                    </label>
                    <select
                      value={selectedMatchedId}
                      onChange={(e) => setSelectedMatchedId(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border-2 border-yellow-400/30 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:border-yellow-400 focus:outline-none"
                    >
                      <option value="">-- Tanlang --</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>

                    <div className="text-center text-xs text-gray-500 dark:text-gray-400 my-2">
                      — yoki —
                    </div>

                    <input
                      type="text"
                      value={matchedNameTyped}
                      onChange={(e) => setMatchedNameTyped(e.target.value)}
                      placeholder="Yangi ism yozish..."
                      className="w-full px-4 py-2 rounded-xl border-2 border-yellow-400/30 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:border-yellow-400 focus:outline-none"
                    />
                  </div>

                  {/* Points preview */}
                  <div className="mb-4 text-sm text-gray-700 dark:text-gray-200">
                    <div className="inline-flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
                        Ball:{" "}
                        <b>
                          {difficultyBasePoints(selectedCell.difficulty) *
                            (turboActive ? 2 : 1) *
                            (selectedCell.bonus === "double" ? 2 : 1)}
                        </b>
                      </span>
                      {turboActive && (
                        <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40">
                          ⚡ Turbo x2
                        </span>
                      )}
                      {selectedCell.bonus === "double" && (
                        <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40">
                          <FaBolt className="inline mr-1" /> Double x2
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={confirmMark}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-black transition-colors"
                    >
                      Tasdiqlash
                    </button>
                    <button
                      onClick={() => setSelectedCell(null)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-black transition-colors"
                    >
                      Bekor qilish
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mission modal */}
            {missionOpen && (
              <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-yellow-400/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white flex items-center justify-center">
                      <GiPartyPopper size={22} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-800 dark:text-white">
                        Mini topshiriq!
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Har 3 ta katakda 1 ta mission ✨
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400/30 text-gray-800 dark:text-gray-100 font-bold">
                    {missionText}
                  </div>

                  <button
                    onClick={() => setMissionOpen(false)}
                    className="mt-4 w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-black hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    Bajarildi ✅
                  </button>
                </div>
              </div>
            )}

            {/* Back to teacher */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setPhase("teacher")}
                className="inline-flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-xl font-bold transition-all"
              >
                <FaArrowLeft />
                O'qituvchi paneliga qaytish
              </button>
            </div>

            {/* Victory */}
            {gameOver && (
              <div className="mt-6 text-center">
                <div className="inline-block bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-2xl font-black text-xl animate-bounce">
                  🎉 O'YIN TUGADI! 🎉
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  <div className="bg-white/90 dark:bg-slate-800/90 rounded-2xl p-4 border-2 border-yellow-400/30">
                    <div className="font-black text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      <FaCrown className="text-yellow-500" />
                      Eng faol
                    </div>
                    <div className="mt-2 text-lg font-black text-gray-900 dark:text-white">
                      {leaderActive?.name || "—"}{" "}
                      <span className="text-sm opacity-80">
                        ({leaderActive?.points ?? 0} ball)
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/90 dark:bg-slate-800/90 rounded-2xl p-4 border-2 border-yellow-400/30">
                    <div className="font-black text-gray-800 dark:text-white flex items-center justify-center gap-2">
                      <FaTrophy className="text-yellow-500" />
                      Eng mashhur
                    </div>
                    <div className="mt-2 text-lg font-black text-gray-900 dark:text-white">
                      {leaderPopular?.name || "—"}{" "}
                      <span className="text-sm opacity-80">
                        ({leaderPopular?.matchedCount ?? 0} mos)
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={resetGame}
                  className="mt-4 inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-black transition-all"
                >
                  <FaRedo />
                  Yangi o'yin boshlash
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }

        @keyframes pop {
          0% { transform: scale(0.9); filter: brightness(0.95); }
          60% { transform: scale(1.06); filter: brightness(1.05); }
          100% { transform: scale(1); filter: brightness(1); }
        }
        .animate-pop { animation: pop 0.5s ease-out; }
      `}</style>
    </div>
  );
}

export default Bingo;
