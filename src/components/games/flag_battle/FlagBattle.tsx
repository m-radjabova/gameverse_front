import { useEffect, useMemo, useRef, useState } from "react";
import { FaBolt, FaCheckCircle, FaCrown, FaFlag, FaForward, FaGlobe, FaPause, FaPlay, FaRedo, FaStar, FaTimesCircle, FaUsers } from "react-icons/fa";
import { GiEarthAfricaEurope, GiEarthAmerica, GiEarthAsiaOceania } from "react-icons/gi";
import Confetti from "react-confetti-boom";
import correctSfx from "../../../assets/sounds/correct.m4a";
import wrongSfx from "../../../assets/sounds/wrong.mp3";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { getGameSessionConfig, type ParticipantType } from "../../../hooks/gameSession";
import { useGameResultSubmission } from "../../../hooks/useGameResultSubmission";
import { useFinishApplause } from "../../../hooks/useFinishApplause";
import { useGameStartCountdown } from "../../../hooks/useGameStartCountdown";
import { FLAG_QUESTIONS, type FlagQuestion } from "./data";
import CountryBallCanvas from "./CountryBallCanvas";

type Phase = "setup" | "play" | "round" | "finish";
type ContinentFilter = "ALL" | "Osiyo" | "Yevropa" | "Afrika" | "Shimoliy Amerika" | "Janubiy Amerika" | "Okeaniya";
type DifficultyFilter = "ALL" | "easy" | "medium" | "hard";
type RoundCount = 10 | 15 | 20;
type RoundAnswers = { answers: Array<string | null>; times: Array<number | null> };

const ROUND_SECONDS = 20;
const BASE_POINTS = 100;
const TIME_BONUS = 5;
const STREAK_BONUS = 15;
const WRONG_PENALTY = 30;

const shuffle = <T,>(arr: T[]) => {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const createScores = (count: number, value = 0) => Array.from({ length: count }, () => value);
const createAnswers = (count: number): RoundAnswers => ({
  answers: Array.from({ length: count }, () => null),
  times: Array.from({ length: count }, () => null),
});

const getDefaultNames = (count: number, type: ParticipantType, saved: string[]) =>
  Array.from({ length: count }, (_, index) => saved[index]?.trim() || `${type === "team" ? "JAMOA" : "O'YINCHI"} ${index + 1}`);

export default function FlagBattle() {
  const sessionConfig = useMemo(() => getGameSessionConfig("flag-battle"), []);
  const participantCount = Math.min(2, Math.max(1, sessionConfig?.participantCount ?? 2));
  const participantType = sessionConfig?.participantType ?? "player";
  const participantLabel = sessionConfig?.participantLabel ?? (participantType === "team" ? "jamoa" : "o'yinchi");
  const [phase, setPhase] = useState<Phase>("setup");
  const [participantNames, setParticipantNames] = useState<string[]>(() => getDefaultNames(participantCount, participantType, sessionConfig?.participantLabels ?? []));
  const [nameError, setNameError] = useState("");
  const [continentFilter, setContinentFilter] = useState<ContinentFilter>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("ALL");
  const [roundCount, setRoundCount] = useState<RoundCount>(10);
  const [paused, setPaused] = useState(false);
  const [questions, setQuestions] = useState<FlagQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<number[]>(() => createScores(participantCount));
  const [streaks, setStreaks] = useState<number[]>(() => createScores(participantCount));
  const [bestStreaks, setBestStreaks] = useState<number[]>(() => createScores(participantCount));
  const [roundTimer, setRoundTimer] = useState(ROUND_SECONDS);
  const [locked, setLocked] = useState(false);
  const [roundWinner, setRoundWinner] = useState<number | null>(null);
  const [roundMessage, setRoundMessage] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [roundAnswers, setRoundAnswers] = useState<RoundAnswers>(() => createAnswers(participantCount));
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();
  useFinishApplause(phase === "finish");

  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const wrongAudioRef = useRef<HTMLAudioElement | null>(null);
  const roundStartTimeRef = useRef(Date.now());

  useEffect(() => {
    correctAudioRef.current = new Audio(correctSfx);
    wrongAudioRef.current = new Audio(wrongSfx);
  }, []);

  const currentQuestion = questions[currentIndex];
  const totalRounds = questions.length;
  const progressPct = Math.round(((currentIndex + 1) / Math.max(1, totalRounds)) * 100);
  const timePct = Math.round((roundTimer / ROUND_SECONDS) * 100);
  const winner = useMemo(() => {
    if (!scores.length) return null;
    const max = Math.max(...scores);
    const winners = scores.map((score, index) => ({ score, index })).filter((item) => item.score === max);
    return winners.length === 1 ? winners[0].index : null;
  }, [scores]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 1600);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (phase !== "play" || locked || paused) return;
    if (roundTimer <= 0) {
      handleRoundEnd();
      return;
    }
    const id = window.setTimeout(() => setRoundTimer((value) => value - 1), 1000);
    return () => window.clearTimeout(id);
  }, [phase, roundTimer, locked, paused]);

  useEffect(() => {
    if (phase !== "play" || locked || paused || !currentQuestion) return;
    const hasCorrect = roundAnswers.answers.some((answer) => answer === currentQuestion.country);
    const allAnswered = roundAnswers.answers.every((answer) => answer !== null);
    if (hasCorrect || allAnswered) {
      handleRoundEnd();
    }
  }, [roundAnswers, phase, locked, paused, currentQuestion]);

  useEffect(() => {
    if (phase !== "round") return;
    const id = window.setTimeout(() => nextRound(), roundWinner === null ? 2500 : 1500);
    return () => window.clearTimeout(id);
  }, [phase, roundWinner, currentIndex, totalRounds]);

  const resetRound = () => {
    setRoundAnswers(createAnswers(participantCount));
    setRoundWinner(null);
    setRoundMessage("");
    roundStartTimeRef.current = Date.now();
  };

  const playCorrect = () => {
    const audio = correctAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  const playWrong = () => {
    const audio = wrongAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  const getFilteredPool = () =>
    FLAG_QUESTIONS.filter((question) => {
      const continentOk = continentFilter === "ALL" || question.continent === continentFilter;
      const difficultyOk = difficultyFilter === "ALL" || question.difficulty === difficultyFilter;
      return continentOk && difficultyOk;
    });

  const startGame = () => {
    const trimmed = participantNames.map((name) => name.trim());
    if (trimmed.some((name) => !name)) {
      setNameError(`Har bir ${participantLabel} nomini kiriting.`);
      return;
    }
    if (new Set(trimmed.map((name) => name.toLowerCase())).size !== trimmed.length) {
      setNameError(`${participantLabel} nomlari bir xil bo'lmasin.`);
      return;
    }
    const pool = getFilteredPool();
    if (pool.length < 4) {
      setNameError("Tanlangan filter bo'yicha kamida 4 ta savol kerak.");
      return;
    }
    const rounds = Math.min(roundCount, pool.length);
    setParticipantNames(trimmed);
    setNameError("");
    setPaused(false);
    setQuestions(shuffle(pool).slice(0, rounds).map((question) => ({ ...question, options: shuffle(question.options) })));
    setCurrentIndex(0);
    setScores(createScores(participantCount));
    setStreaks(createScores(participantCount));
    setBestStreaks(createScores(participantCount));
    setRoundTimer(ROUND_SECONDS);
    setLocked(false);
    resetRound();
    setPhase("play");
    setToast("O'yin boshlandi.");
  };

  const handleStartGame = () => runStartCountdown(startGame);

  const handleNameChange = (index: number, value: string) => {
    setParticipantNames((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  const handleAnswer = (index: number, answer: string) => {
    if (phase !== "play" || locked || paused || !currentQuestion || roundAnswers.answers[index] !== null) return;
    const elapsed = (Date.now() - roundStartTimeRef.current) / 1000;
    setRoundAnswers((current) => ({
      answers: current.answers.map((item, itemIndex) => (itemIndex === index ? answer : item)),
      times: current.times.map((item, itemIndex) => (itemIndex === index ? elapsed : item)),
    }));
  };

  const awardRound = (index: number, bonusTimeSeconds: number) => {
    const gain = BASE_POINTS + Math.max(0, Math.round(ROUND_SECONDS - bonusTimeSeconds)) * TIME_BONUS + streaks[index] * STREAK_BONUS;
    setScores((current) => current.map((score, itemIndex) => (itemIndex === index ? score + gain : score)));
    setStreaks((current) => current.map((streak, itemIndex) => (itemIndex === index ? streak + 1 : 0)));
    setBestStreaks((current) => current.map((best, itemIndex) => (itemIndex === index ? Math.max(best, streaks[index] + 1) : best)));
    setRoundWinner(index);
    setRoundMessage(`${participantNames[index]} birinchi topdi: +${gain} ball`);
    setToast(`${participantNames[index]} +${gain}`);
    playCorrect();
  };

  const handleRoundEnd = () => {
    if (locked || !currentQuestion) return;
    setLocked(true);
    const correct = roundAnswers.answers.map((answer, index) => ({ answer, index, time: roundAnswers.times[index] ?? Number.POSITIVE_INFINITY }))
      .filter((item) => item.answer === currentQuestion.country)
      .sort((a, b) => a.time - b.time);
    if (correct.length > 0) {
      awardRound(correct[0].index, correct[0].time);
    } else {
      setScores((current) => current.map((score, index) => (roundAnswers.answers[index] !== null ? Math.max(0, score - WRONG_PENALTY) : score)));
      setStreaks(createScores(participantCount));
      setRoundWinner(null);
      setRoundMessage(`To'g'ri javob: ${currentQuestion.country}`);
      playWrong();
    }
    setPhase("round");
  };

  const nextRound = () => {
    if (currentIndex + 1 >= totalRounds) {
      setPhase("finish");
      return;
    }
    setCurrentIndex((value) => value + 1);
    setRoundTimer(ROUND_SECONDS);
    setLocked(false);
    setPaused(false);
    resetRound();
    setPhase("play");
  };

  const resetGame = () => {
    setPhase("setup");
    setScores(createScores(participantCount));
    setStreaks(createScores(participantCount));
    setBestStreaks(createScores(participantCount));
    setCurrentIndex(0);
    setQuestions([]);
    setRoundTimer(ROUND_SECONDS);
    setLocked(false);
    setPaused(false);
    setToast(null);
    resetRound();
  };

  const togglePause = () => {
    if (phase !== "play" || locked) return;
    setPaused((value) => !value);
    setToast((current) => (current ? current : !paused ? "PAUSE" : "RESUME"));
  };

  const getContinentIcon = (continent: string) => {
    if (continent === "Yevropa" || continent === "Afrika") return <GiEarthAfricaEurope className="text-blue-300" />;
    if (continent === "Osiyo" || continent === "Okeaniya") return <GiEarthAsiaOceania className="text-cyan-300" />;
    if (continent.includes("Amerika")) return <GiEarthAmerica className="text-emerald-300" />;
    return <FaGlobe className="text-white/60" />;
  };

  const getDifficultyStars = (difficulty: FlagQuestion["difficulty"]) => {
    const count = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
    return <div className="flex gap-1">{[0, 1, 2].map((i) => <FaStar key={i} className={i < count ? "text-yellow-400" : "text-white/20"} />)}</div>;
  };

  const participantSummary = `${participantCount} ${participantLabel}`;
  const leaderboardEntries = participantNames.map((name, index) => ({
    participant_name: name,
    participant_mode: participantSummary,
    score: scores[index] ?? 0,
    metadata: {
      best_streak: bestStreaks[index] ?? 0,
      rounds: totalRounds,
      participant_type: participantType,
    },
  }));
  useGameResultSubmission(
    phase === "finish",
    "flag-battle",
    leaderboardEntries,
  );
  const continentOptions: Array<{ value: ContinentFilter; label: string }> = [
    { value: "ALL", label: "Barchasi" }, { value: "Osiyo", label: "Osiyo" }, { value: "Yevropa", label: "Yevropa" }, { value: "Afrika", label: "Afrika" }, { value: "Shimoliy Amerika", label: "Shimoliy Amerika" }, { value: "Janubiy Amerika", label: "Janubiy Amerika" }, { value: "Okeaniya", label: "Okeaniya" },
  ];
  const difficultyOptions: Array<{ value: DifficultyFilter; label: string }> = [
    { value: "ALL", label: "Barchasi" }, { value: "easy", label: "Oson" }, { value: "medium", label: "O'rtacha" }, { value: "hard", label: "Qiyin" },
  ];

  return (
    <div className="relative text-white">
      <div className="fixed left-1/2 top-24 z-50 -translate-x-1/2 transform">{toast && <div className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-bold text-white shadow-2xl">{toast}</div>}</div>
      {phase === "finish" && winner !== null && <Confetti mode="boom" particleCount={100} effectCount={1} x={0.5} y={0.35} colors={["#3b82f6", "#06b6d4", "#f59e0b", "#10b981", "#8b5cf6"]} />}

      {phase === "setup" && (
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 p-8 backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500"><FaFlag className="text-3xl text-white" /></div>
            <div><h2 className="text-3xl font-black">FLAG BATTLE</h2><p className="text-blue-200/80">{participantSummary} uchun battle kartalari tayyorlanadi</p></div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              {participantNames.map((name, index) => (
                <div key={index} className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-blue-300"><FaUsers />{index + 1}-{participantLabel.toUpperCase()}</label>
                  <input value={name} onChange={(event) => handleNameChange(index, event.target.value)} className="w-full rounded-xl border border-blue-500/30 bg-blue-950/30 px-4 py-3 text-white outline-none focus:border-blue-400" />
                </div>
              ))}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-blue-300">QIT'A</label>
                  <select value={continentFilter} onChange={(event) => setContinentFilter(event.target.value as ContinentFilter)} className="w-full rounded-xl border border-blue-500/30 bg-blue-950/30 px-4 py-3 text-white outline-none focus:border-blue-400">
                    {continentOptions.map((option) => <option key={option.value} value={option.value} className="bg-slate-900">{option.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-cyan-300">QIYINCHILIK</label>
                  <select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value as DifficultyFilter)} className="w-full rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-4 py-3 text-white outline-none focus:border-cyan-400">
                    {difficultyOptions.map((option) => <option key={option.value} value={option.value} className="bg-slate-900">{option.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold text-emerald-300">RAUND SONI</label>
                  <select value={roundCount} onChange={(event) => setRoundCount(Number(event.target.value) as RoundCount)} className="w-full rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-white outline-none focus:border-emerald-400">
                    {[10, 15, 20].map((value) => <option key={value} value={value} className="bg-slate-900">{value} ta raund</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-500/30 bg-blue-950/30 p-4">
              <h3 className="mb-3 text-sm font-bold text-blue-300">QOIDALAR</h3>
              <ul className="space-y-2 text-sm text-blue-100/80">
                <li className="flex items-start gap-2"><FaFlag className="mt-1 text-xs text-blue-300" /><span>Har raundda bitta bayroq va bir xil variantlar chiqadi</span></li>
                <li className="flex items-start gap-2"><FaUsers className="mt-1 text-xs text-cyan-300" /><span>Nechta {participantLabel} tanlansa, shuncha javob kartasi chiqadi</span></li>
                <li className="flex items-start gap-2"><FaBolt className="mt-1 text-xs text-yellow-400" /><span>Birinchi to'g'ri javob bergan ishtirokchi ball oladi</span></li>
                <li className="flex items-start gap-2"><FaTimesCircle className="mt-1 text-xs text-rose-400" /><span>Noto'g'ri javob: -{WRONG_PENALTY} ball</span></li>
              </ul>
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">Bu rejim keyinchalik backend leaderboard bilan bog'lash uchun individual yoki jamoaviy score saqlashga tayyor.</div>
            </div>
          </div>

          {nameError && <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/20 p-3 text-rose-300">{nameError}</div>}
          <div className="mt-6 flex justify-center">
            <button onClick={handleStartGame} className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 px-10 py-4 text-lg font-black text-white transition-all hover:scale-105"><span className="flex items-center gap-3"><FaPlay />O'YINNI BOSHLASH</span></button>
          </div>
        </div>
      )}

      {phase === "play" && currentQuestion && (
        <div className="space-y-6">
          <div className={`grid gap-4 ${participantCount === 1 ? "md:grid-cols-4" : "md:grid-cols-5"}`}>
            {participantNames.map((name, index) => (
              <div key={name} className="rounded-xl border border-blue-500/20 bg-blue-950/30 p-4">
                <p className="text-xs text-blue-300">{name}</p>
                <p className="text-2xl font-black">{scores[index]}</p>
                <p className="text-xs text-blue-100/60">Streak: {streaks[index]}</p>
              </div>
            ))}
            <div className="rounded-xl border border-blue-500/20 bg-blue-950/30 p-4">
              <p className="text-xs text-blue-300">VAQT</p>
              <p className="text-2xl font-black">{roundTimer}s</p>
              <div className="mt-2 h-1.5 rounded-full bg-blue-500/20"><div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" style={{ width: `${timePct}%` }} /></div>
            </div>
            <div className="rounded-xl border border-blue-500/20 bg-blue-950/30 p-4">
              <p className="text-xs text-blue-300">PROGRESS</p>
              <p className="text-2xl font-black">{currentIndex + 1}/{totalRounds}</p>
              <div className="mt-2 h-1.5 rounded-full bg-blue-500/20"><div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-400" style={{ width: `${progressPct}%` }} /></div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/60">BOSHQARUV</p>
              <button onClick={togglePause} className={`mt-2 w-full rounded-xl px-4 py-3 font-black text-white transition-all hover:scale-[1.02] ${paused ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-yellow-500 to-orange-500"}`}><span className="flex items-center justify-center gap-2">{paused ? <FaPlay /> : <FaPause />}{paused ? "RESUME" : "PAUSE"}</span></button>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 p-8 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/20 px-3 py-1.5">{getContinentIcon(currentQuestion.continent)}<span className="text-xs font-bold text-blue-300">{currentQuestion.continent}</span></div>
              {getDifficultyStars(currentQuestion.difficulty)}
            </div>
            <div className="mb-6 flex justify-center">
            <CountryBallCanvas
              src={currentQuestion.flag}
              alt={`${currentQuestion.country} bayrog'i`}
              size={380}
              paused={paused}
              isCorrect={locked && roundWinner !== null}
            />
          </div>


            <div className={`grid gap-4 ${participantCount > 1 ? "lg:grid-cols-2" : ""}`}>
              {participantNames.map((name, index) => {
                const answer = roundAnswers.answers[index];
                const answerTime = roundAnswers.times[index];
                return (
                  <div key={name} className="rounded-2xl border border-blue-500/30 bg-blue-950/30 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-black text-blue-300">{name}</p>
                      {answerTime !== null && <span className="text-xs text-white/70">{answerTime.toFixed(1)}s</span>}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {currentQuestion.options.map((option, optionIndex) => {
                        const selected = answer === option;
                        const correct = option === currentQuestion.country;
                        return (
                          <button key={`${name}-${option}`} onClick={() => handleAnswer(index, option)} disabled={locked || paused || answer !== null} className={`rounded-xl border-2 p-3 text-left font-bold transition-all hover:scale-[1.02] disabled:hover:scale-100 ${selected ? (correct ? "border-emerald-500/50 bg-emerald-500/20" : "border-rose-500/50 bg-rose-500/20") : "border-white/20 bg-black/20 hover:bg-white/10"}`}>
                            <span className="flex items-center justify-between">
                              <span className="flex items-center gap-2"><span>{optionIndex === 0 ? "A)" : optionIndex === 1 ? "B)" : optionIndex === 2 ? "C)" : "D)"}</span><span>{option}</span></span>
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
          <div className="mb-5 flex justify-center"><div className={`flex h-24 w-24 items-center justify-center rounded-full ${roundWinner !== null ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-gradient-to-r from-blue-500 to-cyan-500"}`}>{roundWinner !== null ? <FaCrown className="text-4xl" /> : <FaFlag className="text-4xl" />}</div></div>
          <h3 className="mb-3 text-2xl font-black">{roundWinner !== null ? `${participantNames[roundWinner]} yutdi` : "Hech kim topmadi"}</h3>
          <p className="mb-6 text-blue-100/80">{roundMessage}</p>
          <div className="flex justify-center gap-4">
            <button onClick={nextRound} className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-7 py-3 font-black text-white transition-all hover:scale-105"><span className="flex items-center gap-2"><FaForward />KEYINGI RAUND</span></button>
            <button onClick={resetGame} className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-bold text-white transition-all hover:bg-white/20"><span className="flex items-center gap-2"><FaRedo />TO'XTATISH</span></button>
          </div>
        </div>
      )}

      {phase === "finish" && (
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-900/30 via-cyan-900/30 to-teal-900/30 p-8 text-center backdrop-blur-xl">
          <div className="mb-5 flex justify-center"><div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"><FaCrown className="text-4xl" /></div></div>
          <h2 className="mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-4xl font-black text-transparent">{winner === null ? "DURRANG" : `${participantNames[winner]} G'OLIB`}</h2>
          <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-blue-500/30 bg-blue-950/30 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              {participantNames.map((name, index) => (
                <div key={name} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="font-bold text-blue-300">{name}</p>
                  <p className="text-3xl font-black">{scores[index]}</p>
                  <p className="text-xs text-blue-100/60">Best streak: {bestStreaks[index]}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-blue-500/30 pt-3 text-sm text-blue-100/60">Raund: {totalRounds}</div>
          </div>
          <div className="flex justify-center gap-4">
            <button onClick={handleStartGame} className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-black text-white transition-all hover:scale-105"><span className="flex items-center gap-2"><FaPlay />QAYTA O'YNASH</span></button>
            <button onClick={resetGame} className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-bold text-white transition-all hover:bg-white/20"><span className="flex items-center gap-2"><FaRedo />BOSH SAHIFA</span></button>
          </div>
        </div>
      )}

      <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue} />
    </div>
  );
}
