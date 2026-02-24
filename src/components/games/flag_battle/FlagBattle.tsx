import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaBolt,
  FaCheckCircle,
  FaCrown,
  FaFlag,
  FaForward,
  FaGlobe,
  FaPause,
  FaPlay,
  FaRedo,
  FaStar,
  FaTimesCircle,
} from "react-icons/fa";
import { GiEarthAfricaEurope, GiEarthAmerica, GiEarthAsiaOceania } from "react-icons/gi";
import { RiShieldFill, RiSwordFill } from "react-icons/ri";
import Confetti from "react-confetti-boom";
import correctSfx from "../../../assets/sounds/correct.m4a";
import wrongSfx from "../../../assets/sounds/wrong.m4a";
import { FLAG_QUESTIONS, type FlagQuestion } from "./data";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../shared/useGameStartCountdown";

type TeamId = 0 | 1;
type Phase = "setup" | "play" | "round" | "finish";

type TeamAnswer = {
  team0: string | null;
  team1: string | null;
  team0Time: number | null;
  team1Time: number | null;
};

const ROUND_SECONDS = 20;
const BASE_POINTS = 100;
const TIME_BONUS = 5;
const STREAK_BONUS = 15;
const WRONG_PENALTY = 30;

const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

type ContinentFilter =
  | "ALL"
  | "Osiyo"
  | "Yevropa"
  | "Afrika"
  | "Shimoliy Amerika"
  | "Janubiy Amerika"
  | "Okeaniya";

type DifficultyFilter = "ALL" | "easy" | "medium" | "hard";
type RoundCount = 10 | 15 | 20;

export default function FlagBattle() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [teamNames, setTeamNames] = useState<[string, string]>(["SHIMOL", "JANUB"]);
  const [nameError, setNameError] = useState("");

  const [continentFilter, setContinentFilter] = useState<ContinentFilter>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("ALL");

  const [roundCount, setRoundCount] = useState<RoundCount>(10);
  const [paused, setPaused] = useState(false);

  const [questions, setQuestions] = useState<FlagQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [streaks, setStreaks] = useState<[number, number]>([0, 0]);
  const [bestStreaks, setBestStreaks] = useState<[number, number]>([0, 0]);
  const [roundTimer, setRoundTimer] = useState(ROUND_SECONDS);
  const [locked, setLocked] = useState(false);
  const [roundWinner, setRoundWinner] = useState<TeamId | null>(null);
  const [roundMessage, setRoundMessage] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();

  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const wrongAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    correctAudioRef.current = new Audio(correctSfx);
    wrongAudioRef.current = new Audio(wrongSfx);
  }, []);

  const playCorrect = () => {
    const a = correctAudioRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => {});
  };

  const playWrong = () => {
    const a = wrongAudioRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => {});
  };

  const [teamAnswers, setTeamAnswers] = useState<TeamAnswer>({
    team0: null,
    team1: null,
    team0Time: null,
    team1Time: null,
  });

  const roundStartTimeRef = useRef<number>(Date.now());
  const currentQuestion = questions[currentIndex];
  const totalRounds = questions.length;

  const progressPct = useMemo(
    () => Math.round(((currentIndex + 1) / Math.max(1, totalRounds)) * 100),
    [currentIndex, totalRounds]
  );

  const timePct = useMemo(() => Math.round((roundTimer / ROUND_SECONDS) * 100), [roundTimer]);

  const winner = useMemo(() => (scores[0] === scores[1] ? null : scores[0] > scores[1] ? 0 : 1), [scores]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1600);
    return () => window.clearTimeout(t);
  }, [toast]);

  // вњ… TIMER: pause boвЂlsa ishlamaydi
  useEffect(() => {
    if (phase !== "play" || locked || paused) return;
    if (roundTimer <= 0) {
      handleRoundEnd();
      return;
    }
    const t = window.setTimeout(() => setRoundTimer((v) => v - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, roundTimer, locked, paused]);

  useEffect(() => {
    if (phase !== "play" || locked || paused || !currentQuestion) return;
    const team0Correct = teamAnswers.team0 === currentQuestion.country;
    const team1Correct = teamAnswers.team1 === currentQuestion.country;
    if (team0Correct || team1Correct || (teamAnswers.team0 !== null && teamAnswers.team1 !== null)) {
      handleRoundEnd();
    }
  }, [teamAnswers, phase, locked, paused, currentQuestion]);

  useEffect(() => {
    if (phase !== "round") return;
    const delay = roundWinner === null ? 2500 : 1500;
    const t = window.setTimeout(() => {
      nextRound();
    }, delay);
    return () => window.clearTimeout(t);
  }, [phase, roundWinner, currentIndex, totalRounds]);

  const resetTeamAnswers = () => {
    setTeamAnswers({ team0: null, team1: null, team0Time: null, team1Time: null });
    setRoundWinner(null);
    setRoundMessage("");
    roundStartTimeRef.current = Date.now();
  };

  const getFilteredPool = () => {
    return FLAG_QUESTIONS.filter((q) => {
      const okContinent = continentFilter === "ALL" ? true : q.continent === continentFilter;
      const okDiff = difficultyFilter === "ALL" ? true : q.difficulty === difficultyFilter;
      return okContinent && okDiff;
    });
  };

  const startGame = () => {
    const a = teamNames[0].trim();
    const b = teamNames[1].trim();
    if (!a || !b) return setNameError("Ikkala guruh nomini kiriting.");
    if (a.toLowerCase() === b.toLowerCase()) return setNameError("Guruh nomlari bir xil bo'lmasin.");

    const pool = getFilteredPool();
    if (pool.length < 4) {
      setNameError("Tanlangan filter boвЂyicha savollar juda kam. (Kamida 4 ta kerak)");
      return;
    }

    const rounds = Math.min(roundCount, pool.length);

    setTeamNames([a, b]);
    setNameError("");
    setPaused(false);

    setQuestions(
      shuffle(pool)
        .slice(0, rounds)
        .map((q) => ({ ...q, options: shuffle(q.options) }))
    );

    setCurrentIndex(0);
    setScores([0, 0]);
    setStreaks([0, 0]);
    setBestStreaks([0, 0]);
    setRoundTimer(ROUND_SECONDS);
    setLocked(false);
    resetTeamAnswers();
    setPhase("play");
    setToast("O'yin boshlandi.");
  };

  const handleStartGame = () => runStartCountdown(startGame);

  const handleTeamAnswer = (team: TeamId, answer: string) => {
    if (phase !== "play" || locked || paused || !currentQuestion) return;
    if (team === 0 && teamAnswers.team0 !== null) return;
    if (team === 1 && teamAnswers.team1 !== null) return;

    const elapsed = (Date.now() - roundStartTimeRef.current) / 1000;
    setTeamAnswers((prev) => ({
      ...prev,
      [team === 0 ? "team0" : "team1"]: answer,
      [team === 0 ? "team0Time" : "team1Time"]: elapsed,
    }));
  };

  const awardRound = (team: TeamId, bonusTimeSeconds: number) => {
    const gain =
      BASE_POINTS +
      Math.max(0, Math.round(ROUND_SECONDS - bonusTimeSeconds)) * TIME_BONUS +
      streaks[team] * STREAK_BONUS;

    setScores((prev) => {
      const next: [number, number] = [...prev] as [number, number];
      next[team] += gain;
      return next;
    });

    setStreaks((prev) => {
      const next: [number, number] = [...prev] as [number, number];
      next[team] += 1;
      next[team === 0 ? 1 : 0] = 0;
      return next;
    });

    setBestStreaks((prev) => {
      const next: [number, number] = [...prev] as [number, number];
      next[team] = Math.max(next[team], streaks[team] + 1);
      return next;
    });

    setRoundWinner(team);
    setRoundMessage(`${teamNames[team]} birinchi topdi: +${gain} ball`);
    setToast(`${teamNames[team]} +${gain}`);

    // вњ… toвЂgвЂri javob audio
    playCorrect();
  };

  const handleRoundEnd = () => {
    if (locked || !currentQuestion) return;
    setLocked(true);

    const answer0 = teamAnswers.team0;
    const answer1 = teamAnswers.team1;
    const time0 = teamAnswers.team0Time ?? Infinity;
    const time1 = teamAnswers.team1Time ?? Infinity;
    const correct0 = answer0 === currentQuestion.country;
    const correct1 = answer1 === currentQuestion.country;

    if (correct0 && correct1) {
      awardRound(time0 <= time1 ? 0 : 1, Math.min(time0, time1));
    } else if (correct0) {
      awardRound(0, time0);
    } else if (correct1) {
      awardRound(1, time1);
    } else {
      if (answer0 !== null) {
        setScores((prev) => [Math.max(0, prev[0] - WRONG_PENALTY), prev[1]]);
      }
      if (answer1 !== null) {
        setScores((prev) => [prev[0], Math.max(0, prev[1] - WRONG_PENALTY)]);
      }
      setStreaks([0, 0]);
      setRoundWinner(null);
      setRoundMessage(`To'g'ri javob: ${currentQuestion.country}`);

      // вњ… xato audio (xohlasangiz qoldiring)
      playWrong();
    }

    setPhase("round");
  };

  const nextRound = () => {
    if (currentIndex + 1 >= totalRounds) {
      setPhase("finish");
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setRoundTimer(ROUND_SECONDS);
    setLocked(false);
    setPaused(false);
    resetTeamAnswers();
    setPhase("play");
  };

  const resetGame = () => {
    setPhase("setup");
    setScores([0, 0]);
    setStreaks([0, 0]);
    setBestStreaks([0, 0]);
    setCurrentIndex(0);
    setQuestions([]);
    setRoundTimer(ROUND_SECONDS);
    setLocked(false);
    setPaused(false);
    setToast(null);
    resetTeamAnswers();
  };

  const togglePause = () => {
    if (phase !== "play" || locked) return;
    setPaused((p) => !p);
    setToast((prev) => (prev ? prev : !paused ? "PAUSE" : "RESUME"));
  };

  const getContinentIcon = (continent: string) => {
    if (continent === "Yevropa" || continent === "Afrika") return <GiEarthAfricaEurope className="text-blue-300" />;
    if (continent === "Osiyo" || continent === "Okeaniya") return <GiEarthAsiaOceania className="text-cyan-300" />;
    if (continent.includes("Amerika")) return <GiEarthAmerica className="text-emerald-300" />;
    return <FaGlobe className="text-white/60" />;
  };

  const getDifficultyStars = (difficulty: FlagQuestion["difficulty"]) => {
    const count = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
    return (
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <FaStar key={i} className={i < count ? "text-yellow-400" : "text-white/20"} />
        ))}
      </div>
    );
  };

  type ContinentOption = { value: ContinentFilter; label: string };
  type DifficultyOption = { value: DifficultyFilter; label: string };

  const continentOptions: ContinentOption[] = [
    { value: "ALL", label: "Barchasi" },
    { value: "Osiyo", label: "Osiyo" },
    { value: "Yevropa", label: "Yevropa" },
    { value: "Afrika", label: "Afrika" },
    { value: "Shimoliy Amerika", label: "Shimoliy Amerika" },
    { value: "Janubiy Amerika", label: "Janubiy Amerika" },
    { value: "Okeaniya", label: "Okeaniya" },
  ];

  const difficultyOptions: DifficultyOption[] = [
    { value: "ALL", label: "Barchasi" },
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ];

  const roundCountOptions: RoundCount[] = [10, 15, 20];

  return (
    <div className="relative text-white">
      <div className="fixed left-1/2 top-24 z-50 -translate-x-1/2 transform">
        {toast && <div className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-bold text-white shadow-2xl">{toast}</div>}
      </div>

      {phase === "finish" && winner !== null && (
        <Confetti
          mode="boom"
          particleCount={100}
          effectCount={1}
          x={0.5}
          y={0.35}
          colors={["#3b82f6", "#06b6d4", "#f59e0b", "#10b981", "#8b5cf6"]}
        />
      )}

      {phase === "setup" && (
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 p-8 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500">
              <FaFlag className="text-3xl text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black">FLAG BATTLE</h2>
              <p className="text-blue-200/80">2 guruh, birinchi to'g'ri javob ball oladi</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-blue-300"><RiSwordFill /> 1-GURUH</label>
                <input
                  value={teamNames[0]}
                  onChange={(e) => setTeamNames([e.target.value, teamNames[1]])}
                  className="w-full rounded-xl border border-blue-500/30 bg-blue-950/30 px-4 py-3 text-white outline-none focus:border-blue-400"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-cyan-300"><RiShieldFill /> 2-GURUH</label>
                <input
                  value={teamNames[1]}
                  onChange={(e) => setTeamNames([teamNames[0], e.target.value])}
                  className="w-full rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </div>

              {/* вњ… FILTERS + ROUND COUNT */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-blue-300">QIT'A (CONTINENT)</label>
                  <select
                    value={continentFilter}
                    onChange={(e) => setContinentFilter(e.target.value as ContinentFilter)}
                    className="w-full rounded-xl border border-blue-500/30 bg-blue-950/30 px-4 py-3 text-white outline-none focus:border-blue-400"
                  >
                    {continentOptions.map((o) => (
                      <option key={o.value} value={o.value} className="bg-slate-900">
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-cyan-300">QIYINCHILIK (DIFFICULTY)</label>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value as DifficultyFilter)}
                    className="w-full rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  >
                    {difficultyOptions.map((o) => (
                      <option key={o.value} value={o.value} className="bg-slate-900">
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold text-emerald-300">RAUND SONI</label>
                  <select
                    value={roundCount}
                    onChange={(e) => setRoundCount(Number(e.target.value) as RoundCount)}
                    className="w-full rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-white outline-none focus:border-emerald-400"
                  >
                    {roundCountOptions.map((v) => (
                      <option key={v} value={v} className="bg-slate-900">
                        {v} ta raund
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-500/30 bg-blue-950/30 p-4">
              <h3 className="mb-3 text-sm font-bold text-blue-300">QOIDALAR</h3>
              <ul className="space-y-2 text-sm text-blue-100/80">
                <li className="flex items-start gap-2"><FaFlag className="mt-1 text-xs text-blue-300" /><span>Har raundda bitta bayroq chiqadi</span></li>
                <li className="flex items-start gap-2"><FaBolt className="mt-1 text-xs text-yellow-400" /><span>Qaysi guruh birinchi to'g'ri topsa o'sha ball oladi</span></li>
                <li className="flex items-start gap-2"><FaTimesCircle className="mt-1 text-xs text-rose-400" /><span>Noto'g'ri javob: -{WRONG_PENALTY} ball</span></li>
              </ul>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
                Filter bo'yicha savollar kam bo'lsa, o'yinda avtomatik raund sonini kamaytiradi.
              </div>
            </div>
          </div>

          {nameError && <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/20 p-3 text-rose-300">{nameError}</div>}

          <div className="mt-6 flex justify-center">
            <button onClick={handleStartGame} className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-10 py-4 text-lg font-black text-white transition-all hover:scale-105">
              <span className="flex items-center gap-3"><FaPlay /> O'YINNI BOSHLASH</span>
            </button>
          </div>
        </div>
      )}

      {phase === "play" && currentQuestion && (
        <div className="space-y-6">
          {/* вњ… top info + pause button */}
          <div className="grid gap-4 md:grid-cols-5">
            <div className="rounded-xl border border-blue-500/20 bg-blue-950/30 p-4">
              <p className="text-xs text-blue-300">{teamNames[0]}</p>
              <p className="text-2xl font-black">{scores[0]}</p>
              <p className="text-xs text-blue-100/60">Streak: {streaks[0]}</p>
            </div>

            <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/30 p-4">
              <p className="text-xs text-cyan-300">{teamNames[1]}</p>
              <p className="text-2xl font-black">{scores[1]}</p>
              <p className="text-xs text-cyan-100/60">Streak: {streaks[1]}</p>
            </div>

            <div className="rounded-xl border border-blue-500/20 bg-blue-950/30 p-4">
              <p className="text-xs text-blue-300">VAQT</p>
              <p className="text-2xl font-black">{roundTimer}s</p>
              <div className="mt-2 h-1.5 rounded-full bg-blue-500/20">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" style={{ width: `${timePct}%` }} />
              </div>
            </div>

            <div className="rounded-xl border border-blue-500/20 bg-blue-950/30 p-4">
              <p className="text-xs text-blue-300">PROGRESS</p>
              <p className="text-2xl font-black">{currentIndex + 1}/{totalRounds}</p>
              <div className="mt-2 h-1.5 rounded-full bg-blue-500/20">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/60">BOSHQARUV</p>
              <button
                onClick={togglePause}
                className={`mt-2 w-full rounded-xl px-4 py-3 font-black text-white transition-all hover:scale-[1.02] ${
                  paused ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-yellow-500 to-orange-500"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  {paused ? <FaPlay /> : <FaPause />}
                  {paused ? "RESUME" : "PAUSE"}
                </span>
              </button>

              {paused && <div className="mt-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-2 text-xs text-yellow-200">
                Pause holatda javob berib bo'lmaydi.
              </div>}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/20 px-3 py-1.5">
                {getContinentIcon(currentQuestion.continent)}
                <span className="text-xs font-bold text-blue-300">{currentQuestion.continent}</span>
              </div>
              {getDifficultyStars(currentQuestion.difficulty)}
            </div>

            <div className="mb-6 flex justify-center">
              <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/5 p-2 shadow-2xl">
                <img
                  src={currentQuestion.flag}
                  alt={`${currentQuestion.country} bayrog'i`}
                  className="h-40 w-64 rounded-xl object-cover sm:h-48 sm:w-80"
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {[0, 1].map((team) => {
                const teamId = team as TeamId;
                const teamAnswer = teamId === 0 ? teamAnswers.team0 : teamAnswers.team1;
                const teamAnswerTime = teamId === 0 ? teamAnswers.team0Time : teamAnswers.team1Time;

                return (
                  <div
                    key={teamId}
                    className={`rounded-2xl border p-4 ${teamId === 0 ? "border-blue-500/30 bg-blue-950/30" : "border-cyan-500/30 bg-cyan-950/30"}`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className={`font-black ${teamId === 0 ? "text-blue-300" : "text-cyan-300"}`}>{teamNames[teamId]}</p>
                      {teamAnswerTime !== null && <span className="text-xs text-white/70">{teamAnswerTime.toFixed(1)}s</span>}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {currentQuestion.options.map((option, idx) => {
                        const selected = teamAnswer === option;
                        const correct = option === currentQuestion.country;
                        return (
                          <button
                            key={`${teamId}-${option}`}
                            onClick={() => handleTeamAnswer(teamId, option)}
                            disabled={locked || paused || teamAnswer !== null}
                            className={`rounded-xl border-2 p-3 text-left font-bold transition-all hover:scale-[1.02] disabled:hover:scale-100 ${
                              selected
                                ? (correct ? "border-emerald-500/50 bg-emerald-500/20" : "border-rose-500/50 bg-rose-500/20")
                                : "border-white/20 bg-black/20 hover:bg-white/10"
                            }`}
                          >
                            <span className="flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <span>{idx === 0 ? "A" : idx === 1 ? "B" : idx === 2 ? "C" : "D"}</span>
                                <span>{option}</span>
                              </span>
                              {selected && (correct ? <FaCheckCircle className="text-emerald-400" /> : <FaTimesCircle className="text-rose-400" />)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

       {phase === "round" && (
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 p-8 text-center backdrop-blur-xl">
          <div className="mb-5 flex justify-center">
            <div className={`flex h-24 w-24 items-center justify-center rounded-full ${roundWinner !== null ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-gradient-to-r from-blue-500 to-cyan-500"}`}>
              {roundWinner !== null ? <FaCrown className="text-4xl" /> : <FaFlag className="text-4xl" />}
            </div>
          </div>
          <h3 className="mb-3 text-2xl font-black">{roundWinner !== null ? `${teamNames[roundWinner]} yutdi` : "Hech kim topmadi"}</h3>
          <p className="mb-6 text-blue-100/80">{roundMessage}</p>
          <div className="flex justify-center gap-4">
            <button onClick={nextRound} className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-7 py-3 font-black text-white transition-all hover:scale-105">
              <span className="flex items-center gap-2"><FaForward /> KEYINGI RAUND</span>
            </button>
            <button onClick={resetGame} className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-bold text-white transition-all hover:bg-white/20">
              <span className="flex items-center gap-2"><FaRedo /> TO'XTATISH</span>
            </button>
          </div>
        </div>
      )}

      {phase === "finish" && (
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-900/30 via-cyan-900/30 to-teal-900/30 p-8 text-center backdrop-blur-xl">
          <div className="mb-5 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">
              <FaCrown className="text-4xl" />
            </div>
          </div>
          <h2 className="mb-4 text-4xl font-black text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text">
            {winner === null ? "DURRANG" : `${teamNames[winner]} G'OLIB`}
          </h2>
          <div className="mx-auto mb-8 max-w-md rounded-xl border border-blue-500/30 bg-blue-950/30 p-6">
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="font-bold text-blue-300">{teamNames[0]}</p>
                <p className="text-3xl font-black">{scores[0]}</p>
                <p className="text-xs text-blue-100/60">Best streak: {bestStreaks[0]}</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-cyan-300">{teamNames[1]}</p>
                <p className="text-3xl font-black">{scores[1]}</p>
                <p className="text-xs text-cyan-100/60">Best streak: {bestStreaks[1]}</p>
              </div>
            </div>
            <div className="border-t border-blue-500/30 pt-3 text-sm text-blue-100/60">Raund: {totalRounds}</div>
          </div>
          <div className="flex justify-center gap-4">
            <button onClick={handleStartGame} className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-black text-white transition-all hover:scale-105">
              <span className="flex items-center gap-2"><FaPlay /> QAYTA O'YNASH</span>
            </button>
            <button onClick={resetGame} className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-bold text-white transition-all hover:bg-white/20">
              <span className="flex items-center gap-2"><FaRedo /> BOSH SAHIFA</span>
            </button>
          </div>
        </div>
      )}
      <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />
    </div>
  );
}
