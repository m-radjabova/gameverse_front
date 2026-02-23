import { useEffect, useMemo, useState } from 'react';
import Confetti from 'react-confetti-boom';
import {
  FaRedo,
  FaTrophy,
  FaUsers,
  FaDice,
  FaBolt,
  FaClock,
  FaArrowRight,
} from 'react-icons/fa';
import { GiPodium, GiAchievement } from 'react-icons/gi';
import GameStartCountdownOverlay from '../shared/GameStartCountdownOverlay';

type TileType = 'question' | 'bonus' | 'penalty' | 'steal' | 'double';

type QuestionBankItem = {
  question: string;
  answer: string;
};

type Tile = {
  id: number;
  points: number;
  type: TileType;
  question?: string;
  answer?: string;
  opened: boolean;
};

const BOARD_SIZE = 25;
const BASE_POINTS = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500];

const QUESTION_BANK: QuestionBankItem[] = [
  { question: "O'zbekiston poytaxti qaysi shahar?", answer: 'Toshkent' },
  { question: "5 x 9 nechiga teng?", answer: '45' },
  { question: "Suvning kimyoviy formulasi?", answer: 'H2O' },
  { question: 'Quyosh qaysi tomondan chiqadi?', answer: 'Sharq' },
  { question: "Alisher Navoiy kim bo'lgan?", answer: 'Shoir' },
  { question: 'Yer nechta qit\'adan iborat?', answer: '7' },
  { question: "10 ning kvadrati nechiga teng?", answer: '100' },
  { question: "Kompyuterda ma'lumot qayerda saqlanadi?", answer: 'Xotira' },
  { question: 'Odam tanasidagi eng katta a\'zo?', answer: 'Teri' },
  { question: 'Qaysi sayyora Qizil sayyora deyiladi?', answer: 'Mars' },
  { question: "O'zbek tilida nechta unli harf bor?", answer: '6' },
  { question: '12 / 3 nechiga teng?', answer: '4' },
  { question: 'Eng katta okean?', answer: 'Tinch okeani' },
  { question: "Davlat ramzlari nechta asosiy turga bo'linadi?", answer: '3' },
  { question: 'Qaysi faslda barglar to\'kiladi?', answer: 'Kuz' },
  { question: "HTML nimaning qisqartmasi?", answer: 'HyperText Markup Language' },
  { question: 'Elektr toki birligi?', answer: 'Amper' },
  { question: 'Yomg\'ir yog\'ish jarayoni nima bilan bog\'liq?', answer: 'Suv aylanishi' },
  { question: "Sinfdagi darsni olib boruvchi shaxs?", answer: "O'qituvchi" },
  { question: '9 + 8 nechiga teng?', answer: '17' },
];

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const buildTiles = (): Tile[] => {
  const pointsPool = Array.from({ length: BOARD_SIZE }, (_, idx) => BASE_POINTS[idx % BASE_POINTS.length]);
  const questions = shuffle(QUESTION_BANK);

  const specialTypes: TileType[] = ['bonus', 'penalty', 'steal', 'double'];
  const specialIndexes = new Set(shuffle(Array.from({ length: BOARD_SIZE }, (_, i) => i)).slice(0, 4));

  return pointsPool.map((points, idx) => {
    if (specialIndexes.has(idx)) {
      return {
        id: idx + 1,
        points,
        type: specialTypes[(idx + points) % specialTypes.length],
        opened: false,
      };
    }

    const q = questions[idx % questions.length];
    return {
      id: idx + 1,
      points,
      type: 'question',
      question: q.question,
      answer: q.answer,
      opened: false,
    };
  });
};

const BaamboozleOyini = () => {
  const [teamNames, setTeamNames] = useState(['Jamoa A', 'Jamoa B']);
  const [scores, setScores] = useState([0, 0]);
  const [currentTeam, setCurrentTeam] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>(() => buildTiles());
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [statusText, setStatusText] = useState("🎮 O'yin boshlandi. Katak tanlang.");
  const [showConfetti, setShowConfetti] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [startOverlayValue, setStartOverlayValue] = useState<3 | 2 | 1 | "BOSHLANDI" | null>(null);

  const gameFinished = useMemo(() => tiles.every((tile) => tile.opened), [tiles]);

  const leaderIndex = useMemo(() => {
    if (scores[0] === scores[1]) return -1;
    return scores[0] > scores[1] ? 0 : 1;
  }, [scores]);

  const winnerLabel = useMemo(() => {
    if (!gameFinished) return '';
    if (scores[0] === scores[1]) return 'Durrang';
    return scores[0] > scores[1] ? teamNames[0] : teamNames[1];
  }, [gameFinished, scores, teamNames]);

  const hasWinner = gameFinished && winnerLabel !== 'Durrang';

  useEffect(() => {
    setStatusText("O'yin hali boshlanmadi. Boshlash tugmasini bosing.");
  }, []);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setStartOverlayValue("BOSHLANDI");
      const startTimer = setTimeout(() => {
        setStartOverlayValue(null);
        setCountdown(null);
        setGameStarted(true);
        setStatusText("O'yin boshlandi. Katak tanlang.");
      }, 500);
      return () => clearTimeout(startTimer);
    }

    setStartOverlayValue(countdown as 3 | 2 | 1);
    setStatusText(`${countdown}...`);
    const timer = setTimeout(() => {
      setCountdown((prev) => (prev === null ? null : prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const startGame = () => {
    if (gameStarted || countdown !== null || gameFinished) return;
    setSelectedTile(null);
    setShowAnswer(false);
    setCountdown(3);
  };

  const resetGame = () => {
    setScores([0, 0]);
    setCurrentTeam(0);
    setTiles(buildTiles());
    setSelectedTile(null);
    setShowAnswer(false);
    setStatusText("🔄 O'yin qayta boshlandi.");
    setShowConfetti(false);
    setStatusText("O'yin qayta tayyorlandi. Boshlash tugmasini bosing.");
    setGameStarted(false);
    setCountdown(null);
    setStartOverlayValue(null);
  };

  const openTile = (tile: Tile) => {
    if (!gameStarted || countdown !== null) return;
    if (tile.opened || selectedTile || gameFinished) return;
    if (tile.type !== 'question') {
      applySpecialTile(tile);
      return;
    }
    setSelectedTile(tile);
    setShowAnswer(false);
  };

  const closeRound = (message: string, nextTeam = true) => {
    setSelectedTile(null);
    setShowAnswer(false);
    setStatusText(message);
    if (nextTeam) {
      setCurrentTeam((prev) => (prev + 1) % teamNames.length);
    }
  };

  const applySpecialTile = (tile: Tile) => {
    setTiles((prev) => prev.map((item) => (item.id === tile.id ? { ...item, opened: true } : item)));

    setScores((prev) => {
      const next = [...prev];
      const team = currentTeam;
      if (tile.type === 'bonus') {
        next[team] += tile.points;
        closeRound(`✨ ${teamNames[team]} bonus oldi: +${tile.points}`, false);
        return next;
      }
      if (tile.type === 'penalty') {
        next[team] = Math.max(0, next[team] - tile.points);
        closeRound(`💀 ${teamNames[team]} jarima oldi: -${tile.points}`, false);
        return next;
      }
      if (tile.type === 'double') {
        next[team] += tile.points * 2;
        closeRound(`⚡ ${teamNames[team]} DOUBLE! +${tile.points * 2}`, false);
        return next;
      }
      if (tile.type === 'steal') {
        const leader = next[0] === next[1] ? -1 : next[0] > next[1] ? 0 : 1;
        if (leader !== -1 && leader !== team) {
          const transfer = Math.min(tile.points, next[leader]);
          next[leader] -= transfer;
          next[team] += transfer;
          closeRound(`🔄 ${teamNames[team]} ${transfer} ballni olib qo'ydi!`, false);
        } else {
          closeRound('😕 Steal kartasi foyda bermadi.', false);
        }
        return next;
      }
      return next;
    });
  };

  const markCorrect = () => {
    if (!selectedTile) return;
    if (selectedTile.type !== 'question') {
      applySpecialTile(selectedTile);
      return;
    }

    setTiles((prev) =>
      prev.map((item) => (item.id === selectedTile.id ? { ...item, opened: true } : item))
    );
    setScores((prev) => {
      const next = [...prev];
      next[currentTeam] += selectedTile.points;
      return next;
    });
    closeRound(`✅ ${teamNames[currentTeam]} to'g'ri javob berdi: +${selectedTile.points}`);
  };

  const markWrong = () => {
    if (!selectedTile) return;
    setTiles((prev) =>
      prev.map((item) => (item.id === selectedTile.id ? { ...item, opened: true } : item))
    );
    closeRound(`❌ ${teamNames[currentTeam]} noto'g'ri javob berdi.`);
  };

    if (hasWinner && !showConfetti) {
    setShowConfetti(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 py-8 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti mode="boom" particleCount={150} effectCount={1} x={0.5} y={0.3} />
        </div>
      )}

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 animate-pulse rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 animate-pulse rounded-full bg-purple-600/20 blur-3xl delay-1000" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 px-6 py-3 rounded-2xl border border-indigo-500/30 backdrop-blur-sm mb-4">
            <FaDice className="text-indigo-400 text-2xl animate-spin-slow" />
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Baamboozle
            </h1>
            <FaDice className="text-purple-400 text-2xl animate-spin-slow" />
          </div>
          <p className="text-lg text-indigo-200/80 max-w-2xl mx-auto">
            Katak tanlang, savolga javob bering va jamoangiz uchun eng ko'p ball to'plang.
          </p>
        </div>

        {/* Main Game Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl border border-indigo-500/30 p-4 md:p-6 backdrop-blur-sm shadow-2xl">
              {!gameStarted && (
                <div className="mb-4 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-center">
                  <p className="text-sm font-semibold text-yellow-300">
                    {countdown !== null
                      ? `O'yin ${countdown} soniyadan keyin boshlanadi...`
                      : "O'yin boshlanmagan. O'ng paneldagi Boshlash tugmasini bosing."}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-5 gap-2 md:gap-3">
                {tiles.map((tile) => {
                  return (
                    <button
                      key={tile.id}
                      type="button"
                      disabled={!gameStarted || countdown !== null || tile.opened || Boolean(selectedTile) || gameFinished}
                      onClick={() => openTile(tile)}
                      className={`
                        relative group h-16 md:h-20 rounded-xl font-extrabold text-lg md:text-xl
                        transition-all duration-300 overflow-hidden
                        ${tile.opened
                          ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700'
                          : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/30 cursor-pointer border-2 border-white/20'
                        }
                      `}
                    >
                      {/* Shine Effect */}
                      <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                      {/* Tile Content */}
                      <div className="relative z-10 flex flex-col items-center justify-center h-full">
                        {tile.opened ? (
                          <span className="text-2xl font-black">✓</span>
                        ) : (
                          <>
                            <span className="text-xs md:text-sm opacity-80">SAVOL</span>
                            <span className="font-black">{tile.points}</span>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Panel */}
            <div className="mt-6 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-xl border border-indigo-500/30 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-2 h-2 rounded-full ${gameFinished ? 'bg-yellow-400' : 'bg-green-400'} animate-pulse`} />
                <p className="text-indigo-200 font-medium">{statusText}</p>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${(tiles.filter(t => t.opened).length / BOARD_SIZE) * 100}%` }}
                />
              </div>
              <p className="text-xs text-indigo-300/70 mt-2">
                {tiles.filter(t => t.opened).length} / {BOARD_SIZE} katak ochildi
              </p>
            </div>
          </div>

          {/* Teams Panel */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-xl border border-indigo-500/30 p-5 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FaUsers className="text-indigo-400" />
                Jamoalar
              </h2>

              <div className="space-y-3">
                {teamNames.map((name, idx) => {
                  const isLeader = leaderIndex === idx && !gameFinished;
                  const isActive = currentTeam === idx && !gameFinished;

                  return (
                    <div
                      key={idx}
                      className={`
                        relative rounded-xl p-4 transition-all duration-300
                        ${isActive ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border-2 border-indigo-400' : 'bg-slate-800/50 border border-indigo-500/20'}
                        ${isLeader ? 'ring-2 ring-yellow-500/50' : ''}
                      `}
                    >
                      {/* Leader Crown */}
                      {isLeader && (
                        <div className="absolute -top-2 -right-2 text-yellow-400 animate-bounce">
                          👑
                        </div>
                      )}

                      {/* Active Indicator */}
                      {isActive && (
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-full" />
                      )}

                      <input
                        value={name}
                        onChange={(e) =>
                          setTeamNames((prev) => prev.map((team, i) => (i === idx ? e.target.value : team)))
                        }
                        className="w-full mb-2 px-3 py-2 rounded-lg bg-slate-900/80 border border-indigo-500/30 text-white placeholder-indigo-300/50 focus:border-indigo-400 focus:outline-none transition-colors"
                        placeholder={`Jamoa ${idx + 1}`}
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-blue-400' : 'bg-purple-400'} animate-pulse`} />
                          <span className="text-sm text-indigo-300">Ball</span>
                        </div>
                        <span className="text-2xl font-black text-white">{scores[idx]}</span>
                      </div>

                      {/* Score Bar */}
                      <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            idx === 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                          }`}
                          style={{
                            width: `${Math.min(100, (scores[idx] / (scores[0] + scores[1] || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Current Turn */}
              <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30">
                <p className="text-sm text-indigo-300 mb-1">Hozirgi navbat</p>
                <p className="text-lg font-bold text-white flex items-center gap-2">
                  <FaArrowRight className="text-indigo-400 animate-pulse" />
                  {gameStarted ? teamNames[currentTeam] : "Boshlanish kutilmoqda"}
                </p>
              </div>

              <button
                type="button"
                onClick={startGame}
                disabled={gameStarted || countdown !== null || gameFinished}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-lg font-bold hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-white/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FaDice />
                {countdown !== null ? `${countdown}...` : gameStarted ? "O'yin Boshlandi" : "O'yinni Boshlash"}
              </button>

              {/* Reset Button */}
              <button
                type="button"
                onClick={resetGame}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-lg font-bold hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-white/20"
              >
                <FaRedo className="animate-spin-slow" />
                Qayta Boshlash
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-xl border border-indigo-500/30 p-4 backdrop-blur-sm">
              <h3 className="text-sm font-bold text-indigo-300 mb-3">O'yin statistikasi</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <FaClock className="text-indigo-400 mx-auto mb-1" />
                  <p className="text-xs text-indigo-300">Ochilgan</p>
                  <p className="text-lg font-bold text-white">{tiles.filter(t => t.opened).length}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                  <FaBolt className="text-purple-400 mx-auto mb-1" />
                  <p className="text-xs text-indigo-300">Qolgan</p>
                  <p className="text-lg font-bold text-white">{tiles.filter(t => !t.opened).length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Modal */}
        {selectedTile && selectedTile.type === 'question' && (
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="relative w-full max-w-2xl bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl border-2 border-indigo-500/50 shadow-2xl p-8 overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500 rounded-full blur-3xl" />
              </div>

              <div className="relative">
                <h2 className="text-2xl font-bold text-white mb-4">{selectedTile.question}</h2>

                {!showAnswer ? (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAnswer(true)}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      Javobni Ko'rsat
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-indigo-500/30">
                      <p className="text-sm text-indigo-300 mb-2">Javob:</p>
                      <p className="text-2xl font-bold text-white">{selectedTile.answer}</p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={markCorrect}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:from-green-500 hover:to-emerald-500 transition-all duration-300 hover:scale-105 active:scale-95"
                      >
                        ✅ To'g'ri
                      </button>
                      <button
                        type="button"
                        onClick={markWrong}
                        className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-3 rounded-lg font-bold hover:from-red-500 hover:to-rose-500 transition-all duration-300 hover:scale-105 active:scale-95"
                      >
                        ❌ Noto'g'ri
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rules Panel */}
        <div className="mt-6 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-xl border border-indigo-500/30 p-5 backdrop-blur-sm">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <GiAchievement className="text-yellow-400" />
            Qoidalar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div className="flex items-start gap-2 text-indigo-200/80">
              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Jamoalar navbat bilan katak tanlaydi</span>
            </div>
            <div className="flex items-start gap-2 text-indigo-200/80">
              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-400" />
              <span>Bonus kartasi +{BASE_POINTS[0]} ball qo'shadi</span>
            </div>
            <div className="flex items-start gap-2 text-indigo-200/80">
              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400" />
              <span>Jarima kartasi ballni kamaytiradi</span>
            </div>
            <div className="flex items-start gap-2 text-indigo-200/80">
              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-400" />
              <span>Steal kartasi yetakchidan ball oladi</span>
            </div>
          </div>
          {leaderIndex !== -1 && !gameFinished && (
            <p className="mt-3 text-sm font-semibold text-indigo-300 flex items-center gap-2">
              <GiPodium className="text-yellow-400" />
              Hozir yetakchi: {teamNames[leaderIndex]}
            </p>
          )}
        </div>
      </div>

      {/* Winner Modal */}
      {hasWinner && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl border-2 border-yellow-500/50 shadow-2xl p-8 text-center overflow-hidden">
            {/* Confetti already shown outside */}

            {/* Decorative Background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-500 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl" />
            </div>

            <div className="relative">
              {/* Trophy Icon */}
              <div className="relative mb-4 inline-block">
                <div className="absolute inset-0 animate-ping rounded-full bg-yellow-500/30" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 mx-auto">
                  <FaTrophy className="text-3xl text-white" />
                </div>
              </div>

              {/* Winner Text */}
              <div className="text-5xl font-extrabold text-transparent bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 bg-clip-text animate-pulse mb-2">
                BOOM!
              </div>

              <h2 className="text-3xl font-bold text-white mb-2">
                Tabriklaymiz!
              </h2>

              <p className="text-xl text-indigo-200 mb-4">
                <span className="font-black text-yellow-400">{winnerLabel}</span> jamoasi g'olib!
              </p>

              {/* Final Scores */}
              <div className="flex justify-center gap-4 mb-6">
                <div className="bg-slate-800/80 rounded-lg px-4 py-2 border border-blue-500/30">
                  <p className="text-xs text-blue-400">{teamNames[0]}</p>
                  <p className="text-2xl font-bold text-white">{scores[0]}</p>
                </div>
                <div className="bg-slate-800/80 rounded-lg px-4 py-2 border border-purple-500/30">
                  <p className="text-xs text-purple-400">{teamNames[1]}</p>
                  <p className="text-2xl font-bold text-white">{scores[1]}</p>
                </div>
              </div>

              {/* Play Again Button */}
              <button
                type="button"
                onClick={resetGame}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20 shadow-xl"
              >
                <FaRedo className="animate-spin-slow" />
                Yangi O'yin
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
      <GameStartCountdownOverlay visible={startOverlayValue !== null} value={startOverlayValue} />
    </div>
  );
};

export default BaamboozleOyini;
