import { useEffect, useMemo, useState } from "react";
import Confetti from "react-confetti-boom";
import { 
  FaCheckCircle, FaPlay, FaPlus, FaRedo, FaTrash, FaUsers, 
  FaBolt, FaSyncAlt,
  FaQuestion, FaCheck, FaTimes, FaDice,
  FaEye
} from "react-icons/fa";
import { GiCardJoker, GiJigsawPiece} from "react-icons/gi";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../../../hooks/useGameStartCountdown";
import { useFinishApplause } from "../../../hooks/useFinishApplause";
import { SAMPLE_16_LINES } from "./data";
import type { BingoCell, BonusType, CellInputRow, CellType, Difficulty, Student } from "./types";
import {
  LINES_4x4,
  basePointsByDifficulty,
  createEmptyRows,
  defaultCorrectByType,
  parseCards,
  parseTextToRows,
  rowsToText,
  withBonusesAndDifficulty,
} from "./utils";

function Bingo() {
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();
  const [phase, setPhase] = useState<"teacher" | "game">("teacher");
  const [inputRows, setInputRows] = useState<CellInputRow[]>(() => createEmptyRows());
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudentName, setNewStudentName] = useState("");
  const [cells, setCells] = useState<BingoCell[]>([]);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [selectedJokerStudentId, setSelectedJokerStudentId] = useState("");
  const [jokerConfirmCellId, setJokerConfirmCellId] = useState<string | null>(null);
  const [jokerCredits, setJokerCredits] = useState(0);
  const [jokerActive, setJokerActive] = useState(false);
  const [swapMode, setSwapMode] = useState(false);
  const [swapFirstCellId, setSwapFirstCellId] = useState<string | null>(null);
  const [lineSet, setLineSet] = useState<Set<string>>(new Set());
  const [completedLines, setCompletedLines] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  useFinishApplause(gameOver);
  const [showConfetti, setShowConfetti] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [turboActive, setTurboActive] = useState(false);
  const [turboEndsAt, setTurboEndsAt] = useState<number | null>(null);
  const [turboStarted, setTurboStarted] = useState(false);

  const inputText = useMemo(() => rowsToText(inputRows), [inputRows]);
  const parsedLive = useMemo(() => parseCards(inputText), [inputText]);
  const canStart = parsedLive.cells.length === 16 && parsedLive.errors.length === 0;
  const foundCount = useMemo(() => cells.filter((c) => c.found).length, [cells]);
  const selectedCell = useMemo(() => cells.find((c) => c.id === selectedCellId) ?? null, [cells, selectedCellId]);
  const topStudent = useMemo(() => students.length ? [...students].sort((a, b) => b.points - a.points)[0] : null, [students]);
  const turboSecondsLeft = useMemo(() => {
    if (!turboActive || !turboEndsAt) return 0;
    return Math.max(0, Math.ceil((turboEndsAt - Date.now()) / 1000));
  }, [turboActive, turboEndsAt, toast]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);
  
  useEffect(() => {
    if (!turboActive || !turboEndsAt) return;
    const timer = window.setInterval(() => {
      if (Date.now() >= turboEndsAt) {
        setTurboActive(false);
        setTurboEndsAt(null);
        setToast("⚡ Turbo yakunlandi.");
      } else {
        setToast((prev) => prev);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [turboActive, turboEndsAt]);
  
  useEffect(() => {
    if (gameOver) return;
    if (foundCount >= 12 && !turboStarted) {
      setTurboActive(true);
      setTurboEndsAt(Date.now() + 3 * 60 * 1000);
      setTurboStarted(true);
      setToast("⚡ Turbo yoqildi: 3 daqiqa davomida x2 ball!");
    }
  }, [foundCount, turboStarted, gameOver]);

  const showToastMessage = (m: string) => setToast(m);
  const updateInputRow = (index: number, patch: Partial<CellInputRow>) => {
    setInputRows((prev) => prev.map((row, i) => i === index ? { ...row, ...patch } : row));
  };
  
  const addStudent = () => {
    const name = newStudentName.trim();
    if (!name) return showToastMessage("O'quvchi ismini kiriting.");
    if (students.some((s) => s.name.toLowerCase() === name.toLowerCase())) return showToastMessage("Bu ism ro'yxatda bor.");
    setStudents((prev) => [...prev, { id: `student-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name, points: 0, foundCount: 0 }]);
    setNewStudentName("");
  };
  
  const removeStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    if (selectedStudentId === id) setSelectedStudentId("");
    if (selectedJokerStudentId === id) setSelectedJokerStudentId("");
  };
  
  const validateInput = () => {
    const result = parseCards(inputText);
    const errors = [...result.errors];
    if (result.cells.length !== 16) errors.push(`Jami 16 ta katak bo'lishi shart. Hozir: ${result.cells.length} ta valid qator.`);
    setValidationErrors(errors);
    if (!errors.length) showToastMessage("✅ Barcha 16 katak to'g'ri formatda.");
  };
  
  const resetTeacherForm = () => {
    setInputRows(createEmptyRows()); setValidationErrors([]); setCells([]); setPhase("teacher");
    setSelectedCellId(null); setSelectedStudentId(""); setSelectedJokerStudentId("");
    setJokerConfirmCellId(null); setJokerCredits(0); setJokerActive(false);
    setSwapMode(false); setSwapFirstCellId(null); setLineSet(new Set()); setCompletedLines(0);
    setTotalScore(0); setGameOver(false); setShowConfetti(false); setTurboActive(false);
    setTurboEndsAt(null); setTurboStarted(false);
  };
  
  const startGameCore = () => {
    const result = parseCards(inputText);
    const errors = [...result.errors];
    if (result.cells.length !== 16) errors.push(`Jami 16 ta katak bo'lishi shart. Hozir: ${result.cells.length} ta valid qator.`);
    setValidationErrors(errors);
    if (errors.length) return showToastMessage("❌ Avval xatolarni tuzating.");
    setCells(withBonusesAndDifficulty(result.cells));
    setPhase("game");
    setSelectedCellId(null); setSelectedStudentId(""); setSelectedJokerStudentId("");
    setJokerConfirmCellId(null); setJokerCredits(0); setJokerActive(false);
    setSwapMode(false); setSwapFirstCellId(null); setLineSet(new Set()); setCompletedLines(0);
    setTotalScore(0); setGameOver(false); setShowConfetti(false); setTurboActive(false);
    setTurboEndsAt(null); setTurboStarted(false);
    showToastMessage("🎮 O'yin boshlandi!");
  };
  
  const handleStartGame = () => {
    if (!canStart) {
      validateInput();
      return showToastMessage("❌ O'yinni boshlash uchun 16 ta to'g'ri qator kiriting.");
    }
    runStartCountdown(startGameCore);
  };
  
  const computePoints = (cell: BingoCell, half: boolean) => {
    const full = basePointsByDifficulty(cell.difficulty) * (turboActive ? 2 : 1) * (cell.bonus === "double" ? 2 : 1);
    return half ? Math.max(1, Math.floor(full / 2)) : full;
  };
  
  const updateLineState = (nextCells: BingoCell[]) => {
    const nextSet = new Set(lineSet);
    let newly = 0;
    LINES_4x4.forEach((line, i) => {
      const key = `L${i}`;
      if (nextSet.has(key)) return;
      if (line.every((pos) => nextCells[pos]?.found)) {
        nextSet.add(key);
        newly += 1;
      }
    });
    if (newly > 0) {
      setLineSet(nextSet);
      setCompletedLines(nextSet.size);
      showToastMessage("🎯 Bingo chizig'i yopildi!");
    }
    return nextSet;
  };
  
  const checkEndGame = (nextCells: BingoCell[], nextLineSet: Set<string>) => {
    if (nextCells.every((c) => c.found) || nextLineSet.size >= 3) {
      setGameOver(true);
      setShowConfetti(true);
      setToast("🎉 O'yin tugadi!");
      return true;
    }
    return false;
  };
  
  const applyCorrectAnswer = (cellId: string, half: boolean, studentId?: string) => {
    const target = cells.find((c) => c.id === cellId);
    if (!target || target.found) return;
    const points = computePoints(target, half);
    const studentName = studentId ? students.find((s) => s.id === studentId)?.name : undefined;
    setCells((prev) => {
      const next = prev.map((c) => c.id === cellId ? { ...c, found: true, wrong: false, foundBy: studentName, lastMarkedAt: Date.now() } : c);
      const nextSet = updateLineState(next);
      checkEndGame(next, nextSet);
      return next;
    });
    setTotalScore((prev) => prev + points);
    if (studentId) {
      setStudents((prev) => prev.map((s) => s.id === studentId ? { ...s, points: s.points + points, foundCount: s.foundCount + 1 } : s));
    }
    if (target.bonus === "joker") {
      setJokerCredits((prev) => prev + 1);
      showToastMessage(`✅ To'g'ri! +${points} ball. 🃏 Joker +1`);
    } else if (target.bonus === "swap") {
      setSwapMode(true);
      setSwapFirstCellId(null);
      showToastMessage(`✅ To'g'ri! +${points} ball. 🔁 Swap yoqildi.`);
    } else {
      showToastMessage(`✅ To'g'ri! +${points} ball`);
    }
  };

  const markWrongAnswer = (cellId: string) => {
    setCells((prev) =>
      prev.map((c) =>
        c.id === cellId && !c.found
          ? { ...c, wrong: true, lastMarkedAt: Date.now() }
          : c,
      ),
    );
  };
  
  const handleAnswer = (answer: "A" | "B" | "C" | boolean | "task_done") => {
    if (!selectedCell || gameOver) return;
    setAnswerError(null);
    if (selectedCell.type === "task") {
      applyCorrectAnswer(selectedCell.id, false, selectedStudentId || undefined);
      setSelectedCellId(null); setSelectedStudentId("");
      return;
    }
    if (selectedCell.type === "quiz") {
      if (selectedCell.correct !== answer) {
        markWrongAnswer(selectedCell.id);
        setAnswerError(`Xato. To'g'ri javob: ${selectedCell.correct}`);
        return showToastMessage("❌ Noto'g'ri. Qayta urinib ko'ring");
      }
      applyCorrectAnswer(selectedCell.id, false, selectedStudentId || undefined);
      setSelectedCellId(null); setSelectedStudentId("");
      return;
    }
    if (selectedCell.correct !== (answer === true)) {
      markWrongAnswer(selectedCell.id);
      setAnswerError(`Xato. To'g'ri javob: ${selectedCell.correct ? "To'g'ri" : "Noto'g'ri"}`);
      return showToastMessage("❌ Noto'g'ri. Qayta urinib ko'ring");
    }
    applyCorrectAnswer(selectedCell.id, false, selectedStudentId || undefined);
    setSelectedCellId(null); setSelectedStudentId("");
  };
  
  const handleCellClick = (cell: BingoCell) => {
    if (gameOver || cell.found) return;
    if (swapMode) {
      if (cell.found) return showToastMessage("❌ Swap uchun topilmagan katak tanlang.");
      if (!swapFirstCellId) {
        setSwapFirstCellId(cell.id);
        return showToastMessage("🔁 Endi ikkinchi katakni tanlang.");
      }
      if (swapFirstCellId === cell.id) return showToastMessage("❌ Boshqa katak tanlang.");
      setCells((prev) => {
        const a = prev.findIndex((c) => c.id === swapFirstCellId);
        const b = prev.findIndex((c) => c.id === cell.id);
        if (a === -1 || b === -1) return prev;
        const next = [...prev];
        [next[a], next[b]] = [next[b], next[a]];
        return next;
      });
      setSwapMode(false);
      setSwapFirstCellId(null);
      return showToastMessage("✅ Swap bajarildi.");
    }
    if (jokerActive) {
      if (cell.type === "task") return showToastMessage("🃏 Joker faqat quiz/tf kataklari uchun.");
      setJokerConfirmCellId(cell.id);
      return;
    }
    setSelectedCellId(cell.id);
    setAnswerError(null);
    setSelectedStudentId("");
  };
  
  const activateJoker = () => {
    if (jokerCredits <= 0) return;
    setJokerActive((prev) => !prev);
    setJokerConfirmCellId(null);
    setSelectedJokerStudentId("");
    if (!jokerActive) showToastMessage("🃏 Joker yoqildi. Endi quiz/tf katakni tanlang.");
  };
  
  const confirmJokerUse = () => {
    if (!jokerConfirmCellId || jokerCredits <= 0) return;
    setJokerCredits((prev) => Math.max(0, prev - 1));
    applyCorrectAnswer(jokerConfirmCellId, true, selectedJokerStudentId || undefined);
    setJokerActive(false);
    setJokerConfirmCellId(null);
    setSelectedJokerStudentId("");
  };
  
  const cancelJokerUse = () => {
    setJokerConfirmCellId(null);
    setSelectedJokerStudentId("");
  };
  
  const resetGame = () => {
    setPhase("teacher"); setCells([]); setSelectedCellId(null); setSelectedStudentId("");
    setAnswerError(null);
    setSelectedJokerStudentId(""); setJokerConfirmCellId(null); setJokerCredits(0);
    setJokerActive(false); setSwapMode(false); setSwapFirstCellId(null); setLineSet(new Set());
    setCompletedLines(0); setTotalScore(0); setGameOver(false); setShowConfetti(false);
    setTurboActive(false); setTurboEndsAt(null); setTurboStarted(false);
  };
  
  const bonusBadge = (bonus: BonusType) => {
    if (bonus === "double") return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] font-bold"><FaBolt className="text-[8px]" /> x2</span>;
    if (bonus === "joker") return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold"><GiCardJoker className="text-[8px]" /> JOKER</span>;
    if (bonus === "swap") return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[10px] font-bold"><FaSyncAlt className="text-[8px]" /> SWAP</span>;
    return null;
  };
  
  const difficultyBadge = (difficulty: Difficulty) => {
    if (difficulty === "easy") return <span className="px-2 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] font-bold">OSON</span>;
    if (difficulty === "medium") return <span className="px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-[10px] font-bold">O'RTA</span>;
    return <span className="px-2 py-1 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold">QIYIN</span>;
  };
  
  const typeIcon = (type: CellType) => {
    if (type === "quiz") return <FaQuestion className="text-indigo-300" />;
    if (type === "tf") return <FaCheck className="text-green-300" />;
    return <FaDice className="text-orange-300" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-3 sm:p-4 md:p-8">
      {showConfetti && <Confetti mode="fall" particleCount={140} shapeSize={14} colors={['#818cf8', '#c084fc', '#f9a8d4', '#34d399', '#fbbf24']} />}
      
      <div className="max-w-7xl mx-auto">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed left-1/2 top-3 z-50 w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-white/30 bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-center text-sm font-bold text-white shadow-xl animate-bounce sm:left-auto sm:right-4 sm:top-4 sm:w-auto sm:translate-x-0 sm:rounded-xl sm:py-3">
            {toast}
          </div>
        )}

        {phase === "teacher" ? (
          /* ========== O'QITUVCHI PANELI ========== */
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6">
            {/* Left Panel - Input */}
            <div className="rounded-2xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-800/50 to-purple-800/50 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-indigo-500/30">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-indigo-500/30" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500">
                    <GiJigsawPiece className="text-white text-lg" />
                  </div>
                </div>
                <h2 className="text-xl font-black text-white">KATAK KIRITISH</h2>
              </div>

              <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1 sm:max-h-[560px]">
                {inputRows.map((row, index) => (
                  <div key={index} className="rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-3">
                    <div className="mb-2 text-xs font-bold text-indigo-200">Katak #{index + 1}</div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                      <input
                        type="text"
                        value={row.emoji}
                        onChange={(e) => updateInputRow(index, { emoji: e.target.value })}
                        placeholder="Emoji"
                        className="md:col-span-2 px-3 py-2 rounded-lg border border-indigo-500/30 bg-indigo-900/60 text-white text-sm focus:border-indigo-400 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={row.title}
                        onChange={(e) => updateInputRow(index, { title: e.target.value })}
                        placeholder="Sarlavha"
                        className="md:col-span-4 px-3 py-2 rounded-lg border border-indigo-500/30 bg-indigo-900/60 text-white text-sm focus:border-indigo-400 focus:outline-none"
                      />
                      <select
                        value={row.type}
                        onChange={(e) => {
                          const nextType = e.target.value as CellType;
                          updateInputRow(index, {
                            type: nextType,
                            correct: defaultCorrectByType(nextType),
                            optionA: "",
                            optionB: "",
                            optionC: "",
                          });
                        }}
                        className="md:col-span-3 px-3 py-2 rounded-lg border border-indigo-500/30 bg-indigo-900/60 text-white text-sm focus:border-indigo-400 focus:outline-none"
                      >
                        <option value="quiz">quiz</option>
                        <option value="tf">tf</option>
                        <option value="task">task</option>
                      </select>
                      {row.type === "quiz" && (
                        <select
                          value={row.correct || "A"}
                          onChange={(e) => updateInputRow(index, { correct: e.target.value })}
                          className="md:col-span-3 px-3 py-2 rounded-lg border border-indigo-500/30 bg-indigo-900/60 text-white text-sm focus:border-indigo-400 focus:outline-none"
                        >
                          <option value="A">To'g'ri javob: A</option>
                          <option value="B">To'g'ri javob: B</option>
                          <option value="C">To'g'ri javob: C</option>
                        </select>
                      )}
                      {row.type === "tf" && (
                        <select
                          value={row.correct || "true"}
                          onChange={(e) => updateInputRow(index, { correct: e.target.value })}
                          className="md:col-span-3 px-3 py-2 rounded-lg border border-indigo-500/30 bg-indigo-900/60 text-white text-sm focus:border-indigo-400 focus:outline-none"
                        >
                          <option value="true">To'g'ri</option>
                          <option value="false">Noto'g'ri</option>
                        </select>
                      )}
                      {row.type === "task" && (
                        <div className="md:col-span-3 px-3 py-2 rounded-lg border border-indigo-500/30 bg-indigo-900/30 text-indigo-200 text-sm">
                          `task` uchun correct kerak emas
                        </div>
                      )}
                      <input
                        type="text"
                        value={row.prompt}
                        onChange={(e) => updateInputRow(index, { prompt: e.target.value })}
                        placeholder="Savol yoki topshiriq"
                        className="md:col-span-12 px-3 py-2 rounded-lg border border-indigo-500/30 bg-indigo-900/60 text-white text-sm focus:border-indigo-400 focus:outline-none"
                      />
                      {row.type === "quiz" && (
                        <>
                          <input
                            type="text"
                            value={row.optionA}
                            onChange={(e) => updateInputRow(index, { optionA: e.target.value })}
                            placeholder="Variant A"
                            className="md:col-span-4 px-3 py-2 rounded-lg border border-indigo-500/30 bg-indigo-900/60 text-white text-sm focus:border-indigo-400 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={row.optionB}
                            onChange={(e) => updateInputRow(index, { optionB: e.target.value })}
                            placeholder="Variant B"
                            className="md:col-span-4 px-3 py-2 rounded-lg border border-indigo-500/30 bg-indigo-900/60 text-white text-sm focus:border-indigo-400 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={row.optionC}
                            onChange={(e) => updateInputRow(index, { optionC: e.target.value })}
                            placeholder="Variant C"
                            className="md:col-span-4 px-3 py-2 rounded-lg border border-indigo-500/30 bg-indigo-900/60 text-white text-sm focus:border-indigo-400 focus:outline-none"
                          />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => { setInputRows(parseTextToRows(SAMPLE_16_LINES)); setValidationErrors([]); }} className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm border border-white/20 shadow-lg flex items-center gap-2">
                  <FaDice /> Namuna
                </button>
                <button onClick={validateInput} className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-sm border border-white/20 shadow-lg flex items-center gap-2">
                  <FaCheck /> Tekshirish
                </button>
                <button onClick={handleStartGame} disabled={!canStart} className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-bold text-sm border border-white/20 shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <FaPlay /> Boshlash
                </button>
                <button onClick={resetTeacherForm} className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm border border-white/20 shadow-lg flex items-center gap-2">
                  <FaTrash /> Tozalash
                </button>
              </div>

              <div className="mt-3 text-sm text-indigo-200">Valid qatorlar: <b className="text-white">{parsedLive.cells.length}</b> / 16</div>

              {!!validationErrors.length && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                  <h3 className="text-sm font-black text-red-300 mb-2">Xatolar</h3>
                  <ul className="space-y-1 text-sm text-red-200 list-disc ml-5">
                    {validationErrors.map((error) => <li key={error}>{error}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Panel - Preview & Students */}
            <div className="space-y-6">
              {/* Live Preview */}
              <div className="rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-800/50 to-pink-800/50 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <FaEye className="text-purple-300" /> 4x4 PREVIEW
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 16 }).map((_, index) => {
                    const cell = parsedLive.cells[index];
                    return (
                      <div key={index} className="rounded-xl min-h-[90px] border-2 border-purple-500/30 bg-gradient-to-br from-purple-900/50 to-pink-900/50 p-2 flex flex-col items-center justify-center text-center">
                        {cell ? (
                          <>
                            <div className="text-3xl mb-1">{cell.emoji}</div>
                            <div className="text-[11px] font-bold text-white leading-tight">{cell.title}</div>
                            <div className="text-[8px] text-purple-300 mt-1">{cell.type}</div>
                          </>
                        ) : (
                          <div className="text-xs text-purple-400/50">Bo'sh</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Students Panel */}
              <div className="rounded-2xl border-2 border-pink-500/30 bg-gradient-to-br from-pink-800/50 to-rose-800/50 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <FaUsers className="text-pink-300" /> O'QUVCHILAR
                </h3>
                <div className="mb-4 flex gap-2">
                  <input 
                    type="text" 
                    value={newStudentName} 
                    onChange={(e) => setNewStudentName(e.target.value)} 
                    placeholder="O'quvchi ismi" 
                    className="flex-1 px-3 py-2 rounded-lg border-2 border-pink-500/30 bg-pink-950/50 text-white placeholder-pink-300/50 focus:border-pink-400 focus:outline-none"
                  />
                  <button onClick={addStudent} className="px-3 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white border border-white/20 shadow-lg">
                    <FaPlus />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {students.length === 0 && <span className="text-xs text-pink-300/50">Ro'yxat bo'sh</span>}
                  {students.map((student) => (
                    <div key={student.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-600/30 to-rose-600/30 border border-pink-500/30 text-sm">
                      <span className="font-semibold text-white">{student.name}</span>
                      <span className="text-xs text-pink-300">({student.points})</span>
                      <button onClick={() => removeStudent(student.id)} className="text-rose-300 hover:text-rose-200">
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========== O'YIN JARAYONI ========== */
          <>
            {/* Stats Panel */}
            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-6">
              <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 border-2 border-indigo-400/30 p-4 shadow-xl">
                <p className="text-xs text-indigo-200 mb-1">Topilgan</p>
                <p className="font-black text-2xl text-white">{foundCount} / 16</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 border-2 border-purple-400/30 p-4 shadow-xl">
                <p className="text-xs text-purple-200 mb-1">Chiziqlar</p>
                <p className="font-black text-2xl text-white">{completedLines} / 3</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-pink-600 to-rose-600 border-2 border-pink-400/30 p-4 shadow-xl">
                <p className="text-xs text-pink-200 mb-1">Umumiy ball</p>
                <p className="font-black text-2xl text-white">{totalScore}</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-yellow-600 to-amber-600 border-2 border-yellow-400/30 p-4 shadow-xl">
                <p className="text-xs text-yellow-200 mb-1">Turbo</p>
                <p className="font-black text-2xl text-white">{turboActive ? `${turboSecondsLeft}s` : 'O\'chiq'}</p>
                {turboActive && <FaBolt className="absolute top-2 right-2 text-yellow-300 animate-pulse" />}
              </div>
              <div className="rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 border-2 border-purple-400/30 p-4 shadow-xl">
                <p className="text-xs text-purple-200 mb-1">Joker</p>
                <button 
                  onClick={activateJoker} 
                  disabled={jokerCredits <= 0 || gameOver} 
                  className="mt-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold text-sm border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <GiCardJoker /> Joker: {jokerCredits}
                </button>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 border-2 border-green-400/30 p-4 shadow-xl">
                <p className="text-xs text-green-200 mb-1">Lider</p>
                <p className="font-black text-lg text-white truncate">{topStudent ? `${topStudent.name} (${topStudent.points})` : '—'}</p>
              </div>
            </div>

            {/* Active Mode Indicators */}
            {jokerActive && (
              <div className="mb-3 rounded-xl border-2 border-purple-500/30 bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-3 text-sm font-bold text-purple-300 flex items-center gap-2">
                <GiCardJoker className="text-xl" /> Joker yoqilgan: quiz/tf katakni tanlang.
              </div>
            )}
            {swapMode && (
              <div className="mb-3 rounded-xl border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-600/20 to-green-600/20 p-3 text-sm font-bold text-emerald-300 flex items-center gap-2">
                <FaSyncAlt className="text-xl" /> Swap yoqildi: 2 ta topilmagan katakni tanlang
              </div>
            )}

            {/* Bingo Grid */}
              <div className="rounded-2xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 p-3 shadow-2xl backdrop-blur-xl sm:p-6">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
                {cells.map((cell) => (
                  <button 
                    key={cell.id} 
                    onClick={() => handleCellClick(cell)} 
                    disabled={cell.found || gameOver} 
                    className={`relative min-h-[118px] rounded-xl border-2 p-2.5 text-left transition-all group sm:min-h-[140px] sm:p-3
                      ${cell.found 
                        ? "bg-gradient-to-br from-emerald-600 to-green-600 border-emerald-400 text-white cursor-not-allowed" 
                        : cell.wrong
                          ? "bg-gradient-to-br from-red-700 to-rose-700 border-red-400 text-white cursor-pointer shadow-lg"
                          : "bg-gradient-to-br from-indigo-800/80 to-purple-800/80 hover:from-indigo-700 hover:to-purple-700 border-indigo-500/50 hover:border-indigo-400 cursor-pointer shadow-lg hover:shadow-2xl"
                      }
                      ${cell.lastMarkedAt && Date.now() - cell.lastMarkedAt < 1500 ? "animate-pulse ring-4 ring-white/30" : ""}
                    `}
                  >
                    {cell.found && <FaCheckCircle className="absolute top-2 right-2 text-white text-lg" />}
                    {!cell.found && cell.wrong && <FaTimes className="absolute top-2 right-2 text-white text-lg" />}
                    
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="text-3xl">{cell.emoji}</div>
                      <div className="flex flex-col items-end gap-1">
                        {difficultyBadge(cell.difficulty)}
                        {bonusBadge(cell.bonus)}
                      </div>
                    </div>
                    
                    <div className="mb-1 text-xs font-black leading-tight text-white sm:text-sm">{cell.title}</div>
                    <div className="flex items-center gap-1 text-indigo-300 text-xs">
                      {typeIcon(cell.type)}
                      <span>{cell.type === "quiz" ? "Test" : cell.type === "tf" ? "To'g'ri/Noto'g'ri" : "Topshiriq"}</span>
                    </div>
                    
                    {cell.found && cell.foundBy && (
                      <div className="mt-2 text-xs bg-white/20 rounded-md px-2 py-1 text-white">
                        Javob berdi: {cell.foundBy}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Modal */}
            {selectedCell && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                <div className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-900 to-purple-900 p-4 shadow-2xl sm:p-6">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="flex items-center gap-2 text-xl font-black text-white sm:text-2xl">
                        <span>{selectedCell.emoji}</span>
                        <span>{selectedCell.title}</span>
                      </h3>
                      <p className="mt-2 text-base text-indigo-200 sm:text-lg">{selectedCell.prompt}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {difficultyBadge(selectedCell.difficulty)}
                      {bonusBadge(selectedCell.bonus)}
                    </div>
                  </div>

                  {students.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-indigo-200 mb-2">Kim javob berdi?</label>
                      <select 
                        value={selectedStudentId} 
                        onChange={(e) => setSelectedStudentId(e.target.value)} 
                        className="w-full px-4 py-2 rounded-lg border-2 border-indigo-500/30 bg-indigo-950/50 text-white focus:border-indigo-400 focus:outline-none"
                      >
                        <option value="">Tanlanmagan</option>
                        {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
                      </select>
                    </div>
                  )}

                  {answerError && (
                    <div className="mb-4 rounded-lg border border-red-400/40 bg-red-500/15 px-3 py-2 text-sm font-semibold text-red-200">
                      {answerError}
                    </div>
                  )}

                  {selectedCell.type === "quiz" && selectedCell.options && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <button onClick={() => handleAnswer("A")} className="rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold p-4 border border-white/20 shadow-lg transition-all hover:scale-105">
                        <div className="text-xs opacity-80 mb-1">A</div>
                        <div>{selectedCell.options.A}</div>
                      </button>
                      <button onClick={() => handleAnswer("B")} className="rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold p-4 border border-white/20 shadow-lg transition-all hover:scale-105">
                        <div className="text-xs opacity-80 mb-1">B</div>
                        <div>{selectedCell.options.B}</div>
                      </button>
                      <button onClick={() => handleAnswer("C")} className="rounded-xl bg-gradient-to-br from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold p-4 border border-white/20 shadow-lg transition-all hover:scale-105">
                        <div className="text-xs opacity-80 mb-1">C</div>
                        <div>{selectedCell.options.C}</div>
                      </button>
                    </div>
                  )}

                  {selectedCell.type === "tf" && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button onClick={() => handleAnswer(true)} className="rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold p-4 border border-white/20 shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
                        <FaCheck /> To'g'ri
                      </button>
                      <button onClick={() => handleAnswer(false)} className="rounded-xl bg-gradient-to-br from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold p-4 border border-white/20 shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2">
                        <FaTimes /> Noto'g'ri
                      </button>
                    </div>
                  )}

                  {selectedCell.type === "task" && (
                    <button onClick={() => handleAnswer("task_done")} className="w-full rounded-xl bg-gradient-to-br from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-bold p-4 border border-white/20 shadow-lg transition-all hover:scale-105">
                      Bajarildi ✅
                    </button>
                  )}

                  <button onClick={() => { setSelectedCellId(null); setSelectedStudentId(""); setAnswerError(null); }} className="mt-4 w-full rounded-xl bg-gradient-to-br from-gray-600 to-slate-600 hover:from-gray-500 hover:to-slate-500 text-white font-bold p-3 border border-white/20 shadow-lg">
                    Yopish
                  </button>
                </div>
              </div>
            )}

            {/* Joker Confirm Modal */}
            {jokerConfirmCellId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-2xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-900 to-pink-900 p-4 shadow-2xl sm:p-5">
                  <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
                    <GiCardJoker className="text-2xl" /> Jokerni ishlatish
                  </h3>
                  <p className="text-purple-200 mb-4">Bu katak joker bilan yopiladi va yarim ball beriladi.</p>
                  
                  {students.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-purple-200 mb-2">Kim javob berdi?</label>
                      <select 
                        value={selectedJokerStudentId} 
                        onChange={(e) => setSelectedJokerStudentId(e.target.value)} 
                        className="w-full px-4 py-2 rounded-lg border-2 border-purple-500/30 bg-purple-950/50 text-white focus:border-purple-400 focus:outline-none"
                      >
                        <option value="">Tanlanmagan</option>
                        {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button onClick={confirmJokerUse} className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2 border border-white/20">
                      Tasdiqlash
                    </button>
                    <button onClick={cancelJokerUse} className="rounded-lg bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-500 hover:to-slate-500 text-white font-bold py-2 border border-white/20">
                      Bekor qilish
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Game Over Panel */}
            {gameOver && (
              <div className="mt-5 rounded-2xl border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-600/20 to-amber-600/20 p-6 text-center backdrop-blur-sm">
                <h3 className="text-3xl font-black text-transparent bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text mb-3">
                  🎉 O'YIN TUGADI! 🎉
                </h3>
                <p className="text-xl text-white mb-2">Umumiy ball: {totalScore}</p>
                {topStudent && <p className="text-lg text-yellow-300 mb-4">Eng faol: {topStudent.name} ({topStudent.points} ball)</p>}
                <button onClick={resetGame} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-bold border border-white/20 shadow-lg">
                  <FaRedo /> Yangi o'yin
                </button>
              </div>
            )}

            {/* Back to Teacher Panel */}
            {!gameOver && (
              <div className="mt-4">
                <button onClick={resetGame} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-bold border border-white/20 shadow-lg">
                  <FaPlay /> O'qituvchi paneliga qaytish
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />
    </div>
  );
}

export default Bingo;

