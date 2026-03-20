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
  FaBrain,
  FaPlus,
  FaTrash,
  FaEdit,
  FaSave,
} from "react-icons/fa";
import { fetchGameQuestions, saveGameQuestions } from "../../../hooks/useGameQuestions";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../../../hooks/useGameStartCountdown";
import { useGameParticipantMode } from "../../../hooks/useGameParticipantMode";
import { useGameResultSubmission } from "../../../hooks/useGameResultSubmission";
import { useFinishApplause } from "../../../hooks/useFinishApplause";
import { MORE_QUESTIONS } from "./data";

import { REVERSE_THINKING_GAME_KEY, TEAM_AVATARS, TEAM_COLORS } from "./constants";
import type { Phase, Question, Team } from "./types";

const createConfiguredTeams = (
  isSinglePlayer: boolean,
  primaryName: string,
  secondaryName: string,
): Team[] => {
  const names = isSinglePlayer ? [primaryName] : [primaryName, secondaryName];

  return names.map((name, idx) => ({
    id: Date.now() + Math.random() + idx,
    name,
    color: TEAM_COLORS[idx].primary,
    avatar: TEAM_AVATARS[idx],
    score: 0,
    isActive: idx === 0,
    streak: 0,
    timeLeft: 30,
  }));
};

function ReverseThinking() {
  const skipInitialRemoteSaveRef = useRef(true);
  const { isSinglePlayer, primaryName, secondaryName, modeLabel } = useGameParticipantMode({
    gameId: "reverse-thinking",
    fallbackPrimaryName: "1-Jamoa",
    fallbackSecondaryName: "2-Jamoa",
    singleModeLabel: "1 o'yinchi",
    multiModeLabel: "2 jamoa",
  });
  // Audio refs
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);

  // Game state
  const [phase, setPhase] = useState<Phase>("teacher");
  useFinishApplause(phase === "finish");
  const [teams, setTeams] = useState<Team[]>(() =>
    createConfiguredTeams(isSinglePlayer, primaryName, secondaryName),
  );
  const [newTeamName, setNewTeamName] = useState("");
  const [teamError, setTeamError] = useState("");
  
  // Questions state
  const [questions, setQuestions] = useState<Question[]>(MORE_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [, setRoundWinner] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [buzzedTeamId, setBuzzedTeamId] = useState<number | null>(null);
  
  // Teacher panel
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    level: 1,
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
  });
  const [questionError, setQuestionError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  
  // Gameplay state
  const [toast, setToast] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const [winner, setWinner] = useState<Team | null>(null);
  const [roundTimer, setRoundTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const { countdownValue, countdownVisible, runStartCountdown } =
    useGameStartCountdown();
  const requiredTeamCount = isSinglePlayer ? 1 : 2;

  useGameResultSubmission(
    phase === "finish" && teams.length > 0,
    "reverse-thinking",
    teams.map((team) => ({
      participant_name: team.name,
      participant_mode: modeLabel,
      score: team.score,
      metadata: {
        questions: questions.length,
        streak: team.streak,
      },
    })),
  );

  useEffect(() => {
    if (phase !== "teacher") return;
    setTeams(createConfiguredTeams(isSinglePlayer, primaryName, secondaryName));
    setTeamError("");
  }, [isSinglePlayer, primaryName, secondaryName, phase]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const remoteQuestions = await fetchGameQuestions<Question>(REVERSE_THINKING_GAME_KEY);
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
      void saveGameQuestions<Question>(REVERSE_THINKING_GAME_KEY, questions);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [questions, remoteLoaded]);

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
    if (isSinglePlayer) {
      setTeamError("1 kishilik rejimda jamoa qo'shilmaydi.");
      return;
    }
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
      streak: 0,
      timeLeft: 30,
    };

    setTeams([...teams, newTeam]);
    setNewTeamName("");
    setTeamError("");
    showToast(`✅ ${name} qo'shildi`);
  };

  // Remove team
  const removeTeam = (id: number) => {
    if (isSinglePlayer) return;
    const team = teams.find(t => t.id === id);
    setTeams(teams.filter(t => t.id !== id));
    showToast(`🗑️ ${team?.name} o'chirildi`);
  };

  // Add question
  const addQuestion = () => {
    if (!newQuestion.question) {
      setQuestionError("Savol matnini kiriting!");
      return;
    }
    if (newQuestion.options?.some(opt => !opt)) {
      setQuestionError("Barcha variantlarni to'ldiring!");
      return;
    }
    if (!newQuestion.correctAnswer) {
      setQuestionError("To'g'ri javobni tanlang!");
      return;
    }
    if (!newQuestion.explanation) {
      setQuestionError("Izohni kiriting!");
      return;
    }

    const question: Question = {
      id: editingId || Date.now().toString(),
      level: newQuestion.level as 1 | 2 | 3 | 4,
      question: newQuestion.question,
      options: newQuestion.options as string[],
      correctAnswer: newQuestion.correctAnswer,
      explanation: newQuestion.explanation,
    };

    if (editingId) {
      setQuestions(prev => prev.map(q => q.id === editingId ? question : q));
      showToast("✅ Savol yangilandi");
    } else {
      setQuestions(prev => [...prev, question]);
      showToast("✅ Savol qo'shildi");
    }

    setNewQuestion({
      level: 1,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
    });
    setEditingId(null);
    setQuestionError("");
  };

  // Remove question
  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    showToast("🗑️ Savol o'chirildi");
  };

  // Edit question
  const editQuestion = (question: Question) => {
    setNewQuestion(question);
    setEditingId(question.id);
  };

  // Start game
  const startGameNow = () => {
    // Reset teams
    setTeams(prev => prev.map((t, idx) => ({
      ...t,
      score: 0,
      isActive: isSinglePlayer ? idx === 0 : false,
      streak: 0,
      timeLeft: 30,
    })));

    setCurrentQuestionIndex(0);
    setLevel(questions[0].level);
    setSelectedAnswer(null);
    setShowResult(false);
    setRoundWinner(null);
    setBuzzedTeamId(null);
    setRoundTimer(30);
    setIsTimerActive(true);
    setPhase("game");
    showToast(
      isSinglePlayer
        ? `O'yin boshlandi! ${primaryName} boshlaydi`
        : "O'yin boshlandi! 1-jamoa boshlaydi",
    );
  };

  const startGame = () => {
    if (teams.length !== requiredTeamCount) {
      showToast(
        isSinglePlayer ? "1 ta o'yinchi bo'lishi kerak!" : "2 ta jamoa bo'lishi kerak!",
      );
      return;
    }
    if (questions.length < 5) {
      showToast("Kamida 5 ta savol bo'lishi kerak!");
      return;
    }
    runStartCountdown(startGameNow);
  };

  const prepareNextQuestion = (nextQuestionIndex: number) => {
    setCurrentQuestionIndex(nextQuestionIndex);
    setLevel(questions[nextQuestionIndex].level);
    setSelectedAnswer(null);
    setShowResult(false);
    setRoundWinner(null);
    setBuzzedTeamId(null);
    setRoundTimer(30);
    setIsTimerActive(true);
    setTeams(prev =>
      prev.map((t, idx) => ({
        ...t,
        isActive: isSinglePlayer ? idx === 0 : false,
      })),
    );
  };

  const claimAnswerTurn = (teamId: number) => {
    if (isSinglePlayer || showResult || buzzedTeamId !== null) return;

    const team = teams.find((item) => item.id === teamId);
    if (!team) return;

    setBuzzedTeamId(teamId);
    setTeams(prev => prev.map(t => ({ ...t, isActive: t.id === teamId })));
    showToast(`${team.name} birinchi bosdi`);
  };

  // Handle answer
  const handleAnswer = (answer: string) => {
    if (showResult) return;
    
    const currentTeam = isSinglePlayer
      ? teams.find(t => t.isActive)
      : teams.find(t => t.id === buzzedTeamId);
    if (!currentTeam) return;

    const currentQuestion = questions[currentQuestionIndex];
    const correct = answer === currentQuestion.correctAnswer;

    setSelectedAnswer(answer);
    setShowResult(true);
    setIsCorrect(correct);
    setIsTimerActive(false);

    if (correct) {
      playSound("correct");
      
      const timeBonus = Math.floor(roundTimer / 5) * 2;
      const streakBonus = currentTeam.streak >= 2 ? 20 : 0;
      const points = 10 + timeBonus + streakBonus;

      setTeams(prev => prev.map(t => {
        if (t.isActive) {
          const newStreak = t.streak + 1;
          return {
            ...t,
            score: t.score + points,
            streak: newStreak,
          };
        }
        return t;
      }));

      setRoundWinner(teams.findIndex(t => t.isActive));
      setGameHistory(prev => [...prev, 
        `✅ ${currentTeam.name} to'g'ri javob! +${points} ball${streakBonus ? ' (Combo!)' : ''}`
      ]);

      showToast(`🎉 ${currentTeam.name} to'g'ri javob! +${points} ball`);
    } else {
      setTeams(prev => prev.map(t => {
        if (t.isActive) {
          return {
            ...t,
            score: Math.max(0, t.score - 5),
            streak: 0,
          };
        }
        return t;
      }));

      setGameHistory(prev => [...prev, `❌ ${currentTeam.name} xato javob! -5 ball`]);
      showToast(`❌ Xato javob! -5 ball`);
    }

    // Next question
    setTimeout(() => {
      if (currentQuestionIndex + 1 < questions.length) {
        prepareNextQuestion(currentQuestionIndex + 1);
      } else {
        finishGame();
      }
    }, 3000);
  };

  // Handle timeout
  const handleTimeout = () => {
    setIsTimerActive(false);
    
    const currentTeam = isSinglePlayer
      ? teams.find(t => t.isActive)
      : teams.find(t => t.id === buzzedTeamId);

    if (!currentTeam) {
      setGameHistory(prev => [...prev, "Hech qaysi jamoa javob huquqini olmadi"]);
      showToast("Hech kim birinchi bosmadi");

      setTimeout(() => {
        if (currentQuestionIndex + 1 < questions.length) {
          prepareNextQuestion(currentQuestionIndex + 1);
        } else {
          finishGame();
        }
      }, 1500);
      return;
    }

    setTeams(prev => prev.map(t => {
      if (t.id === currentTeam.id) {
        return {
          ...t,
          score: Math.max(0, t.score - 3),
          streak: 0,
        };
      }
      return t;
    }));

    setGameHistory(prev => [...prev, `⏰ ${currentTeam.name} vaqt tugadi! -3 ball`]);
    showToast("⏰ Vaqt tugadi! -3 ball");

    setTimeout(() => {
      if (currentQuestionIndex + 1 < questions.length) {
        prepareNextQuestion(currentQuestionIndex + 1);
      } else {
        finishGame();
      }
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
    setTeams(createConfiguredTeams(isSinglePlayer, primaryName, secondaryName));
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowConfetti(false);
    setGameHistory([]);
    setWinner(null);
    setRoundWinner(null);
    setBuzzedTeamId(null);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Get level color
  const getLevelColor = (level: number) => {
    switch(level) {
      case 1: return "from-green-500 to-emerald-500";
      case 2: return "from-yellow-500 to-amber-500";
      case 3: return "from-orange-500 to-red-500";
      case 4: return "from-purple-500 to-pink-500";
      default: return "from-green-500 to-emerald-500";
    }
  };

  const getLevelName = (level: number) => {
    switch(level) {
      case 1: return "Oddiy chalg'ituvchi";
      case 2: return "Mantiqiy tuzoq";
      case 3: return "Juda tricky";
      case 4: return "Tezkor qaror";
      default: return "Noma'lum";
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 dark:from-green-950 dark:via-emerald-950 dark:to-green-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-green-300/20 blur-3xl dark:bg-green-600/20" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse-slower rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-600/20" />
        
        {/* Soft Pattern */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, #86efac 2px, transparent 2px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating Brain Icons */}
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
              {["🤔", "🧠", "💭", "🤯", "🤔", "🧠"][i % 6]}
            </div>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed left-1/2 top-20 z-50 w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 sm:top-24 sm:w-auto">
          <div className="rounded-2xl border-2 border-green-300 bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2.5 text-center text-sm text-white shadow-2xl animate-bounce backdrop-blur-sm sm:rounded-full sm:px-6 sm:py-3 sm:text-base">
            {toast}
          </div>
        </div>
      )}

      {/* Mute Button */}
      <button
        onClick={toggleMute}
        className="fixed right-3 top-3 z-50 rounded-xl border-2 border-green-500/30 bg-green-900/50 p-2.5 text-green-300 backdrop-blur-sm transition-all hover:bg-green-800/50 sm:right-6 sm:top-6 sm:p-3"
      >
        {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
      </button>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6">

        {phase === "teacher" && (
          /* ========== O'QITUVCHI PANELI ========== */
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
            {/* Teams Panel */}
            <div className="relative group transform-gpu overflow-hidden rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-900/40 to-emerald-900/40 p-4 backdrop-blur-xl sm:p-6">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-green-500/10 to-emerald-500/10" />
              
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-green-500/30">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-green-500/30" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
                    <FaUsers className="text-white text-sm" />
                  </div>
                </div>
                <h2 className="text-xl font-black text-white">JAMOALAR</h2>
              </div>

              {!isSinglePlayer ? (
                <div className="mb-4">
                  <div className="flex flex-col gap-2 sm:flex-row">
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
                      className="flex-1 px-4 py-2 rounded-xl border border-green-500/30 bg-green-950/30 text-white placeholder-green-300/50 focus:border-green-400 focus:outline-none"
                    />
                    <button
                      onClick={addTeam}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:scale-105 transition-all"
                    >
                      Qo'shish
                    </button>
                  </div>
                  {teamError && <p className="mt-2 text-sm text-red-400">{teamError}</p>}
                </div>
              ) : (
                <div className="mb-4 rounded-xl border border-green-500/30 bg-green-950/30 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-300/70">Solo rejim</p>
                  <p className="mt-1 text-lg font-black text-white">{primaryName}</p>
                  <p className="text-sm text-green-300/70">Natija leaderboardga individual hisobda saqlanadi.</p>
                </div>
              )}

              <div className="space-y-3">
                {teams.map((team, idx) => (
                  <div
                    key={team.id}
                    className="group relative overflow-hidden rounded-xl border border-green-500/30 bg-green-950/30 p-3 transition-all hover:bg-green-900/40"
                  >
                    <div className={`absolute inset-0 pointer-events-none bg-gradient-to-r ${TEAM_COLORS[idx].primary} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{team.avatar}</span>
                        <div>
                          <p className="text-sm font-bold text-white">{team.name}</p>
                          <p className="text-xs text-green-300/70">
                            {isSinglePlayer ? "YAKKA O'YINCHI" : idx === 0 ? "CHAP JAMOA" : "O'NG JAMOA"}
                          </p>
                        </div>
                      </div>
                      {!isSinglePlayer ? (
                        <button
                          onClick={() => removeTeam(team.id)}
                          className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTimesCircle size={16} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions Panel */}
            <div className="relative group transform-gpu overflow-hidden rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-900/40 to-emerald-900/40 p-4 backdrop-blur-xl sm:p-6">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-green-500/10 to-emerald-500/10" />
              
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-green-500/30">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-green-500/30" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
                    <FaBrain className="text-white text-sm" />
                  </div>
                </div>
                <h2 className="text-xl font-black text-white">SAVOLLAR</h2>
              </div>

              <div className="space-y-3 mb-4">
                <select
                  value={newQuestion.level}
                  onChange={(e) => setNewQuestion({ ...newQuestion, level: parseInt(e.target.value) as 1|2|3|4 })}
                  className="w-full px-4 py-2 rounded-xl border border-green-500/30 bg-green-950/30 text-white"
                >
                  <option value={1}>Level 1 - Oddiy chalg'ituvchi</option>
                  <option value={2}>Level 2 - Mantiqiy tuzoq</option>
                  <option value={3}>Level 3 - Juda tricky</option>
                  <option value={4}>Level 4 - Tezkor qaror</option>
                </select>

                <input
                  type="text"
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  placeholder="Savol matni..."
                  className="w-full px-4 py-2 rounded-xl border border-green-500/30 bg-green-950/30 text-white"
                />

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[0, 1, 2, 3].map(idx => (
                    <input
                      key={idx}
                      type="text"
                      value={newQuestion.options?.[idx] || ""}
                      onChange={(e) => {
                        const options = [...(newQuestion.options || ["", "", "", ""])];
                        options[idx] = e.target.value;
                        setNewQuestion({ ...newQuestion, options });
                      }}
                      placeholder={`Variant ${idx + 1}`}
                      className="px-3 py-2 rounded-xl border border-green-500/30 bg-green-950/30 text-white text-sm"
                    />
                  ))}
                </div>

                <select
                  value={newQuestion.correctAnswer}
                  onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-green-500/30 bg-green-950/30 text-white"
                >
                  <option value="">To'g'ri javobni tanlang</option>
                  {newQuestion.options?.map((opt, idx) => opt && (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>

                <textarea
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                  placeholder="Izoh..."
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl border border-green-500/30 bg-green-950/30 text-white"
                />

                {questionError && <p className="text-sm text-red-400">{questionError}</p>}

                <button
                  onClick={addQuestion}
                  className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 py-3 font-bold text-white transition-all hover:scale-[1.02]"
                >
                  {editingId ? <FaSave className="inline mr-2" /> : <FaPlus className="inline mr-2" />}
                  {editingId ? "SAQLASH" : "QO'SHISH"}
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {questions.map((q) => (
                  <div key={q.id} className="group relative overflow-hidden rounded-xl border border-green-500/30 bg-green-950/30 p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${getLevelColor(q.level)} text-white`}>
                            Level {q.level}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-white">{q.question}</p>
                        <p className="text-xs text-green-300/50 mt-1">{q.explanation.substring(0, 40)}...</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editQuestion(q)}
                          className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => removeQuestion(q.id)}
                          className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            {teams.length === requiredTeamCount && questions.length >= 5 && (
              <div className="lg:col-span-2 text-center">
                <button
                  onClick={startGame}
                  className="rounded-xl border-2 border-green-400/50 bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-lg font-bold text-white shadow-2xl transition-all hover:scale-105 sm:px-12 sm:text-2xl"
                >
                  <FaPlay className="inline mr-2" />
                  TESKARI FIKRNI BOSHLASH
                </button>
              </div>
            )}
          </div>
        )}

        {phase === "game" && (
          /* ========== O'YIN JARAYONI ========== */
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="bg-green-900/30 border-2 border-green-500/30 rounded-xl px-4 py-2">
                  <p className="text-xs text-green-300">Savol</p>
                  <p className="text-base font-bold text-white sm:text-lg">{currentQuestionIndex + 1}/{questions.length}</p>
                </div>
                <div className="bg-green-900/30 border-2 border-green-500/30 rounded-xl px-4 py-2">
                  <p className="text-xs text-green-300">Vaqt</p>
                  <p className="flex items-center gap-1 text-base font-bold text-white sm:text-lg">
                    <FaClock className="text-green-400" />
                    {roundTimer}s
                  </p>
                </div>
                <div className={`bg-gradient-to-r ${getLevelColor(level)} px-4 py-2 rounded-xl border-2 border-white/30`}>
                  <p className="text-xs text-white/80">Level {level}</p>
                  <p className="text-sm font-bold text-white">{getLevelName(level)}</p>
                </div>
                <div className="bg-green-900/30 border-2 border-green-500/30 rounded-xl px-4 py-2">
                  <p className="text-xs text-green-300">Rejim</p>
                  <p className="text-base font-bold text-white sm:text-lg">{modeLabel}</p>
                </div>
              </div>

              <div className="text-center xl:text-right">
                <p className="text-sm text-green-300 mb-1">
                  {isSinglePlayer ? "Hozirgi navbat" : "Javob huquqi"}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 xl:justify-end">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className={`px-4 py-2 rounded-xl border-2 transition-all ${
                        team.isActive 
                          ? `bg-gradient-to-r ${team.color} border-white scale-105 shadow-2xl` 
                          : 'border-green-500/30 bg-green-900/30'
                      }`}
                    >
                      <span className="text-2xl mr-2">{team.avatar}</span>
                      <span className="font-bold text-white">{team.name}</span>
                      {team.isActive && (
                        <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full animate-pulse">
                          {isSinglePlayer ? "NAVBAT" : "BIRINCHI"}
                        </span>
                      )}
                      {team.streak >= 2 && (
                        <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                          Combo x{team.streak}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="relative group transform-gpu overflow-hidden rounded-2xl border-2 border-green-500/30 bg-gradient-to-br from-green-900/40 to-emerald-900/40 p-4 backdrop-blur-xl sm:p-8">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-green-500/10 to-emerald-500/10" />
              
              <h3 className="relative mb-6 text-center text-xl font-bold text-white sm:mb-8 sm:text-2xl">
                {questions[currentQuestionIndex]?.question}
              </h3>

              {!isSinglePlayer && (
                <div className="relative mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  {teams.map((team) => {
                    const isBuzzed = buzzedTeamId === team.id;
                    const isLocked = buzzedTeamId !== null && !isBuzzed;

                    return (
                      <button
                        key={`buzzer-${team.id}`}
                        onClick={() => claimAnswerTurn(team.id)}
                        disabled={showResult || buzzedTeamId !== null}
                        className={`rounded-2xl border-2 p-4 text-left transition-all sm:p-5 ${
                          isBuzzed
                            ? "border-emerald-400 bg-emerald-500/20 shadow-[0_0_24px_rgba(74,222,128,0.35)]"
                            : isLocked
                              ? "border-green-500/20 bg-green-950/20 opacity-55"
                              : "border-green-400/35 bg-green-950/35 hover:border-green-300 hover:bg-green-900/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{team.avatar}</span>
                            <div>
                              <p className="text-lg font-black text-white">{team.name}</p>
                              <p className="text-xs text-green-200/70">
                                {isBuzzed ? "Javob huquqini oldi" : "Birinchi bo'lib bosing"}
                              </p>
                            </div>
                          </div>
                          <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-white">
                            {isBuzzed ? "TANLANDI" : "READY"}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Options */}
              <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {questions[currentQuestionIndex]?.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    disabled={showResult || (!isSinglePlayer && buzzedTeamId === null)}
                    className={`
                      rounded-xl border-2 p-4 text-left text-base font-bold transition-all hover:scale-105 sm:p-6 sm:text-lg
                      ${showResult && option === questions[currentQuestionIndex].correctAnswer
                        ? 'border-green-500 bg-green-500/20 text-green-300 shadow-[0_0_20px_#22c55e]'
                        : showResult && selectedAnswer === option
                        ? 'border-red-500 bg-red-500/20 text-red-300 shadow-[0_0_20px_#ef4444]'
                        : !isSinglePlayer && buzzedTeamId === null
                        ? 'border-green-500/20 bg-green-950/20 text-white/45'
                        : 'border-green-500/30 bg-green-950/30 text-white hover:border-green-400 hover:shadow-[0_0_15px_#4ade80]'
                      }
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {/* Explanation */}
              {showResult && (
                <div className={`mt-6 p-4 rounded-xl border-2 text-center ${
                  isCorrect ? 'border-green-500 bg-green-500/20' : 'border-red-500 bg-red-500/20'
                }`}>
                  <p className="text-white text-lg mb-2">
                    {isCorrect ? '✓ TO\'G\'RI!' : '✗ XATO!'}
                  </p>
                  <p className="text-green-200 text-sm">
                    {questions[currentQuestionIndex]?.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Teams Score */}
            <div className={`grid gap-4 ${isSinglePlayer ? "grid-cols-1" : "grid-cols-2"}`}>
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="relative group transform-gpu overflow-hidden rounded-xl border-2 p-4 backdrop-blur-xl"
                  style={{
                    borderColor: team.isActive ? '#4ade80' : '#22c55e30',
                    background: team.isActive ? 'linear-gradient(to right, #14532d40, #064e3b40)' : '#14532d20',
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{team.avatar}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{team.name}</h3>
                      <p className="text-xs text-green-300/70">Streak: {team.streak}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{team.score}</p>
                      <p className="text-xs text-green-300">ball</p>
                    </div>
                  </div>
                  <div className="h-1 w-full bg-green-900/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                      style={{ width: `${(team.score / 200) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Game History */}
            {gameHistory.length > 0 && (
              <div className="relative group transform-gpu overflow-hidden rounded-xl border border-green-500/30 bg-green-950/30 p-4 backdrop-blur-sm">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-green-500/10 to-emerald-500/10" />
                <p className="relative text-sm font-bold text-green-300 mb-2">O'YIN TARIXI</p>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            {showConfetti && <Confetti mode="boom" particleCount={500} effectCount={1} x={0.5} y={0.3} colors={['#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d']} />}
            
            <div className="relative group max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-3xl border-2 border-green-500/30 bg-gradient-to-br from-green-900/80 via-emerald-900/80 to-green-900/80 p-5 text-center shadow-2xl backdrop-blur-xl sm:p-8">
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10" />
              
              {/* Trophy */}
              <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full bg-green-500/30" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mx-auto">
                  <FaCrown className="text-5xl text-white" />
                </div>
              </div>

              <h2 className="relative mb-2 text-3xl font-black text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text sm:text-4xl">
                {isSinglePlayer ? `${winner.name} natijasi` : `${winner.name} G'OLIB!`}
              </h2>
              <p className="relative mb-8 text-lg text-green-300 sm:text-xl">
                {winner.score} ball to'pladi
              </p>

              {/* Results */}
              <div className={`relative mb-8 grid gap-4 ${isSinglePlayer ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
                {[...teams].sort((a, b) => b.score - a.score).map((team) => (
                  <div key={team.id} className="rounded-xl border border-green-500/30 bg-green-950/30 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{team.avatar}</span>
                      <span className="font-bold text-white">{team.name}</span>
                    </div>
                    <p className="text-2xl font-bold text-green-400">{team.score}</p>
                    <p className="text-xs text-green-300/70">ball</p>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="relative flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                <button
                  onClick={resetGame}
                  className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-bold text-white transition-all hover:scale-105 sm:w-auto"
                >
                  <FaRedo className="inline mr-2" />
                  QAYTA O'YNASH
                </button>
                <button
                  onClick={() => setPhase("teacher")}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-3 font-bold text-white transition-all hover:scale-105 sm:w-auto"
                >
                  <FaTimesCircle className="inline mr-2" />
                  SOZLAMALAR
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

export default ReverseThinking;


