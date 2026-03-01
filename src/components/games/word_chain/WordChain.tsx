import { useState } from "react";
import Confetti from "react-confetti-boom";
import {
  FaUsers,
  FaTrophy,
  FaRedo,
  FaPlay,
  FaCheckCircle,
  FaTrash,
  FaEraser,
  FaCrown,
  FaKeyboard,
} from "react-icons/fa";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../shared/useGameStartCountdown";

type Team = {
  id: number;
  name: string;
  score: number;
  avatar: string;
};

type Phase = "teacher" | "game" | "finish";

const ALPHABET = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");
const AVATARS = ["⚔️", "🛡️"];
const TEAM_COLORS = [
  { primary: "from-blue-600 to-cyan-500", secondary: "border-blue-500/30", text: "text-blue-400" },
  { primary: "from-emerald-600 to-green-500", secondary: "border-emerald-500/30", text: "text-emerald-400" },
];

// O'zbekcha so'zlar bazasi
const UZBEK_WORDS = [
  "OLMA", "ANOR", "UZUM", "NOK", "BEHI", "GILOS", "SHAFTOLI", "OLCHA", "LIMON", "APELSIN",
  "TARVUZ", "QOVUN", "BANAN", "KIWI", "ANANAS", "MANGO", "QULUPNAY", "MALINA", "SMORODINA",
  "SABZI", "PIYOZ", "KARTOSHKA", "POMIDOR", "BODRING", "QALAMPIR", "KARAM", "REDISKA",
  "NON", "SUT", "QAYMOQ", "PISHLOQ", "SARIYOG'", "TUXUM", "GO'SHT", "BALIQ", "TOVUQ",
  "OSH", "MANTI", "SOMSA", "SHASHLIK", "LAG'MON", "CHUCHVARA", "DIMLAMA", "KABOB",
  "CHOY", "KOFFE", "SHARBAT", "KOMPOT", "SUV", "FANTA", "PEPSI", "COLA",
  "DAFTAR", "QALAM", "RUCHKA", "CHIZG'ICH", "O'CHIRG'ICH", "QAYCHI", "ELIM", "QOG'OZ",
  "KITOB", "JURNAL", "GAZETA", "LUG'AT", "ALBOM", "MAKTAB", "SINF", "DOSKA",
  "STOL", "STUL", "DERAZA", "ESHIK", "QUYOSH", "OY", "YULDUZ", "OSMON", "BULUT",
  "DARAXT", "GUL", "O'T", "BARG", "ILDIZ", "SHOX", "MEVA", "URUG'",
  "IT", "MUSHUK", "SIGIR", "QO'Y", "ECHKI", "OT", "TUYA", "TOVUQ", "XO'ROZ", "O'RDAK",
  "BO'RI", "TULKI", "QUYON", "AYIQ", "SICHQON", "KIRPI", "OLMAXON", "KIYIK",
];

function WordChain() {
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();

  // O'qituvchi paneli
  const [phase, setPhase] = useState<Phase>("teacher");
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [teamError, setTeamError] = useState("");
  
  // O'yin uchun state
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [teamWords, setTeamWords] = useState<{ [key: number]: string }>({});
  const [currentInput, setCurrentInput] = useState("");
  const [usedWords, setUsedWords] = useState<string[]>([]);
  const [lastWord, setLastWord] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameHistory, setGameHistory] = useState<string[]>([]);

  // Jamoa qo'shish
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
      score: 0,
      avatar: AVATARS[teams.length % AVATARS.length],
    };

    setTeams([...teams, newTeam]);
    setNewTeamName("");
    setTeamError("");
    showToast(`✅ ${name} qo'shildi`);
  };

  // Jamoani o'chirish
  const removeTeam = (id: number) => {
    const team = teams.find(t => t.id === id);
    setTeams(teams.filter(t => t.id !== id));
    showToast(`🗑️ ${team?.name} o'chirildi`);
  };

  // Toast xabarlar
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  // O'yinni boshlash
  const startGame = () => {
    if (teams.length < 2) {
      showToast("2 ta jamoa bo'lishi kerak!");
      return;
    }

    setTeams(teams.map(t => ({ ...t, score: 0 })));
    setCurrentTeamIndex(0);
    setTeamWords({});
    setCurrentInput("");
    setUsedWords([]);
    setLastWord("");
    setGameHistory([]);
    setPhase("game");
    showToast("🎮 O'yin boshlandi! 1-jamoa so'z yozsin");
  };

  const handleStartGame = () => runStartCountdown(startGame);

  // Harf qo'shish
  const addLetter = (letter: string) => {
    setCurrentInput(prev => prev + letter);
  };

  // Oxirgi harfni o'chirish
  const backspace = () => {
    setCurrentInput(prev => prev.slice(0, -1));
  };

  // Butun so'zni tozalash
  const clearInput = () => {
    setCurrentInput("");
  };

  // So'zni tekshirish
  const checkWord = () => {
    const word = currentInput.trim().toUpperCase();
    if (!word) {
      showToast("So'z yozing!");
      return;
    }

    const currentTeam = teams[currentTeamIndex];

    if (word.length < 2) {
      showToast("So'z kamida 2 harf bo'lishi kerak!");
      setCurrentInput("");
      return;
    }

    if (!UZBEK_WORDS.includes(word)) {
      if (!window.confirm(`"${word}" so'zi bazada yo'q. Baribir qabul qilasizmi?`)) {
        setCurrentInput("");
        return;
      }
    }

    if (usedWords.includes(word)) {
      showToast("Bu so'z avval ishlatilgan!");
      setCurrentInput("");
      return;
    }

    if (lastWord && word[0] !== lastWord[lastWord.length - 1]) {
      showToast(`So'z "${lastWord[lastWord.length - 1]}" harfi bilan boshlanishi kerak!`);
      setCurrentInput("");
      return;
    }

    const newScore = currentTeam.score + 1;
    
    setTeams(teams.map(t => 
      t.id === currentTeam.id ? { ...t, score: newScore } : t
    ));

    setTeamWords(prev => ({ ...prev, [currentTeam.id]: word }));
    setUsedWords([...usedWords, word]);
    setLastWord(word);
    setGameHistory([...gameHistory, `${currentTeam.name}: ${word}`]);
    setCurrentInput("");

    showToast(`✅ ${currentTeam.name}: "${word}" (${newScore} ball)`);

    setTimeout(() => {
      const nextIndex = (currentTeamIndex + 1) % teams.length;
      setCurrentTeamIndex(nextIndex);
    }, 1000);
  };

  // O'yinni tugatish
  const finishGame = () => {
    setShowConfetti(true);
    setPhase("finish");
    showToast("🏆 O'yin tugadi! Natijalarni ko'ring");
  };

  // O'yinni qayta boshlash
  const resetGame = () => {
    setPhase("teacher");
    setTeams([]);
    setCurrentTeamIndex(0);
    setTeamWords({});
    setCurrentInput("");
    setUsedWords([]);
    setLastWord("");
    setShowConfetti(false);
    setGameHistory([]);
  };

  // G'olibni aniqlash
  const getWinner = () => {
    if (teams.length === 0) return null;
    return [...teams].sort((a, b) => b.score - a.score)[0];
  };

  const winner = getWinner();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 py-8 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti mode="boom" particleCount={200} effectCount={1} x={0.5} y={0.3} />
        </div>
      )}

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 animate-pulse rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 animate-pulse rounded-full bg-pink-600/20 blur-3xl delay-1000" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Toast xabar */}
      {toast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-2xl animate-bounce backdrop-blur-sm">
            {toast}
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-6 py-3 rounded-2xl border border-purple-500/30 backdrop-blur-sm mb-4">
            <FaKeyboard className="text-purple-400 text-3xl animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
              SO'ZLAR BELLASHUVI
            </h1>
            <FaKeyboard className="text-pink-400 text-3xl animate-pulse delay-300" />
          </div>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            2 jamoa navbat bilan so'z yozadi. Har bir so'z oldingi so'zning oxirgi harfi bilan boshlanishi kerak!
          </p>
        </div>

        {phase === "teacher" ? (
          /* ========== O'QITUVCHI PANELI ========== */
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border-2 border-purple-500/30 p-6 backdrop-blur-sm shadow-2xl">
              {/* Panel Header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-purple-500/30">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-purple-500/30" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                    <FaUsers className="text-white text-lg" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">O'qituvchi paneli</h2>
                  <p className="text-sm text-slate-400">2 ta jamoa qo'shing va o'yinni boshlang</p>
                </div>
              </div>

              {/* Jamoa qo'shish */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Yangi jamoa qo'shish
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTeam()}
                    placeholder="Jamoa nomi..."
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-purple-500/30 bg-slate-900/50 text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
                  />
                  <button
                    onClick={addTeam}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
                  >
                    <FaUsers />
                    Qo'shish
                  </button>
                </div>
                {teamError && (
                  <p className="mt-2 text-sm text-red-400">{teamError}</p>
                )}
              </div>

              {/* Jamoalar ro'yxati */}
              <div className="mb-6">
                <h3 className="text-lg font-black text-white mb-3 flex items-center gap-2">
                  <FaUsers className="text-purple-400" />
                  Jamoalar ({teams.length}/2)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {teams.map((team, index) => (
                    <div
                      key={team.id}
                      className="group relative bg-slate-800/50 rounded-xl p-4 border-2 border-purple-500/30 hover:border-purple-400 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{team.avatar}</span>
                          <div>
                            <span className="text-sm font-bold text-white block">
                              {team.name}
                            </span>
                            <span className="text-xs text-slate-400">
                              {index === 0 ? "1-JAMOA" : "2-JAMOA"}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeTeam(team.id)}
                          className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* O'yin qoidalari */}
              <div className="mb-6 p-4 bg-purple-500/10 rounded-xl border-2 border-purple-500/30">
                <h4 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
                  <span>📖</span>
                  Qanday o'ynaladi?
                </h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">1.</span>
                    <span><b className="text-white">1-JAMOA</b> istalgan so'z yozadi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">2.</span>
                    <span><b className="text-white">2-JAMOA</b> oldingi so'zning oxirgi harfi bilan boshlanadigan so'z yozadi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">3.</span>
                    <span>Har bir to'g'ri so'z uchun <b className="text-white">1 ball</b></span>
                  </li>
                </ul>
              </div>

              {/* Boshlash tugmasi */}
              {teams.length === 2 && (
                <button
                  onClick={handleStartGame}
                  className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-lg font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
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
        ) : phase === "game" ? (
          /* ========== O'YIN JARAYONI ========== */
          <div className="space-y-6 xl:space-y-7">
            {/* Jamoalar kartalari */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {[0, 1].map((idx) => {
                const team = teams[idx];
                const isActive = currentTeamIndex === idx;
                const colors = TEAM_COLORS[idx];

                return (
                  <div
                    key={idx}
                    className={`
                      relative rounded-2xl border-2 p-5 sm:p-6 transition-all duration-300
                      ${isActive
                        ? `bg-gradient-to-r ${colors.primary} border-white/90 text-white shadow-2xl lg:scale-[1.02]`
                        : "border-slate-600 bg-slate-800/90 text-slate-100"}
                    `}
                  >
                    {isActive && (
                      <div className="absolute -top-3 right-4 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-yellow-950 shadow-lg">
                        NAVBAT
                      </div>
                    )}

                    <div className="mb-4 flex items-center gap-3">
                      <span className="text-3xl">{team?.avatar || (idx === 0 ? "⚔️" : "🛡️")}</span>
                      <div>
                        <h3 className="text-2xl font-black">{idx + 1}-JAMOA</h3>
                        <p className={isActive ? "text-lg text-white/85" : "text-lg text-slate-300"}>
                          {team?.name || `Jamoa ${idx + 1}`}
                        </p>
                      </div>
                    </div>

                    <div className="mb-3 flex items-end justify-between">
                      <span className="text-sm font-bold opacity-90">Ball</span>
                      <span className="text-4xl font-black leading-none sm:text-5xl">{team?.score || 0}</span>
                    </div>

                    {teamWords[team?.id] && (
                      <div className="mt-2 rounded-xl border border-white/20 bg-white/10 p-3 text-center">
                        <span className="text-xl font-bold tracking-wide">{teamWords[team?.id]}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Oxirgi so'z va kerakli harf */}
            {lastWord && (
              <div className="rounded-2xl border-2 border-cyan-400/30 bg-gradient-to-r from-cyan-500/15 to-indigo-500/20 p-5 text-center backdrop-blur-sm">
                <p className="mb-2 text-sm font-semibold text-slate-300">Oxirgi so'z</p>
                <p className="mb-3 text-3xl font-black text-cyan-300 sm:text-4xl">{lastWord}</p>
                <p className="text-lg text-slate-200 sm:text-xl">
                  Keyingi so'z <span className="text-2xl font-black text-yellow-300">"{lastWord[lastWord.length - 1]}"</span> harfi bilan boshlanishi kerak
                </p>
              </div>
            )}

            {/* 2 ta klaviatura */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {[0, 1].map((teamIdx) => {
                const isActive = currentTeamIndex === teamIdx;
                const colors = TEAM_COLORS[teamIdx];
                const team = teams[teamIdx];

                return (
                  <div
                    key={teamIdx}
                    className={`
                      rounded-2xl border-2 p-4 transition-all duration-300 sm:p-5 lg:p-6
                      ${
                        isActive
                          ? teamIdx === 0
                            ? "border-cyan-400/70 bg-slate-800/95 shadow-2xl shadow-cyan-900/40"
                            : "border-emerald-400/70 bg-slate-800/95 shadow-2xl shadow-emerald-900/40"
                          : "border-slate-700/60 bg-slate-800/65"
                      }
                    `}
                  >
                    <div className="mb-4 text-center">
                      <p className="mb-2 text-sm text-slate-400">
                        {teamIdx + 1}-JAMOA {team ? `- ${team.name}` : ""}
                      </p>
                      <div
                        className={`mx-auto mt-1 flex min-h-[64px] max-w-md items-center justify-center rounded-xl border px-4 py-3 text-2xl font-black sm:text-3xl ${
                          isActive
                            ? "border-cyan-300/50 bg-cyan-400/10 text-white"
                            : "border-slate-700 bg-slate-900/50 text-slate-500"
                        }`}
                      >
                        {isActive ? (currentInput || "—") : "Navbat kutmoqda"}
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-7 gap-2 sm:grid-cols-9">
                      {ALPHABET.map((letter) => (
                        <button
                          key={`${teamIdx}-${letter}`}
                          onClick={() => addLetter(letter)}
                          disabled={!isActive}
                          className={`
                            h-11 rounded-lg text-sm font-black transition-all duration-200 sm:h-12 sm:text-base
                            ${isActive
                              ? `bg-gradient-to-br ${colors.primary} text-white hover:-translate-y-0.5 hover:shadow-lg active:scale-95`
                              : "cursor-not-allowed bg-slate-700/90 text-slate-500"}
                          `}
                        >
                          {letter}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        onClick={backspace}
                        disabled={!isActive}
                        className={`
                          flex items-center justify-center gap-1.5 rounded-lg py-3 text-sm font-bold transition-all sm:text-base
                          ${isActive
                            ? "bg-orange-500 text-white shadow-md hover:bg-orange-600"
                            : "cursor-not-allowed bg-slate-700/90 text-slate-500"}
                        `}
                      >
                        <FaEraser /> 
                      </button>
                      <button
                        onClick={clearInput}
                        disabled={!isActive}
                        className={`
                          flex items-center justify-center gap-1.5 rounded-lg py-3 text-sm font-bold transition-all sm:text-base
                          ${isActive
                            ? "bg-rose-600 text-white shadow-md hover:bg-rose-700"
                            : "cursor-not-allowed bg-slate-700/90 text-slate-500"}
                        `}
                      >
                        <FaTrash />
                      </button>
                      <button
                        onClick={checkWord}
                        disabled={!isActive}
                        className={`
                          flex items-center justify-center gap-1.5 rounded-lg py-3 text-sm font-black transition-all sm:text-base
                          ${isActive
                            ? "bg-emerald-500 text-white shadow-md hover:bg-emerald-600"
                            : "cursor-not-allowed bg-slate-700/90 text-slate-500"}
                        `}
                      >
                        <FaCheckCircle /> 
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* O'yin tarixi */}
            {gameHistory.length > 0 && (
              <div className="bg-slate-800/90 rounded-xl border-2 border-purple-500/30 p-4 backdrop-blur-sm">
                <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                  <span className="text-purple-400">📝</span>
                  So'zlar tarixi
                </h3>
                <div className="flex flex-wrap gap-2">
                  {gameHistory.map((item, idx) => (
                    <span key={idx} className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* O'yinni tugatish */}
            <div className="flex justify-center">
              <button
                onClick={finishGame}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-black hover:scale-105 transition-all flex items-center gap-2 shadow-2xl"
              >
                <FaTrophy />
                O'YINNI TUGATISH
              </button>
            </div>
          </div>
        ) : (
          /* ========== YAKUNIY NATIJALAR ========== */
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border-2 border-purple-500/30 p-8 backdrop-blur-sm shadow-2xl text-center">
              {/* G'olib */}
              <div className="relative mb-8">
                <div className="absolute inset-0 rounded-full bg-yellow-500/30" />
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 mx-auto">
                  <FaCrown className="text-5xl text-white" />
                </div>
              </div>

              <h2 className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                {winner?.name} G'OLIB!
              </h2>
              <p className="text-xl text-slate-400 mb-8">
                {winner?.score} ball to'pladi
              </p>

              {/* Natijalar */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {teams.sort((a, b) => b.score - a.score).map((team, index) => (
                  <div
                    key={team.id}
                    className="p-4 bg-slate-800/50 rounded-xl border-2 border-purple-500/30"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{index === 0 ? '🥇' : '🥈'}</span>
                      <span className="font-bold text-white">{team.name}</span>
                    </div>
                    <div className="text-3xl font-bold text-purple-400">{team.score}</div>
                    <div className="text-sm text-slate-400">
                      {index === 0 ? "G'olib" : "2-o'rin"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Topilgan so'zlar */}
              {usedWords.length > 0 && (
                <div className="mb-8 p-4 bg-purple-500/10 rounded-xl border-2 border-purple-500/30">
                  <h3 className="font-bold text-purple-400 mb-3">
                    Topilgan so'zlar ({usedWords.length})
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {usedWords.map((word, idx) => (
                      <span key={idx} className="text-sm bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-purple-500/30">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tugmalar */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={resetGame}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-black hover:scale-105 transition-all flex items-center gap-2 shadow-2xl"
                >
                  <FaRedo />
                  Yangi o'yin
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />
    </div>
  );
}

export default WordChain;
