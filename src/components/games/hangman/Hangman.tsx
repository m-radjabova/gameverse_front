import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaLightbulb,
  FaRedo,
  FaExchangeAlt,
  FaClock,
  FaCrown,
  FaMagic,
  FaPlay,
  FaUsers,
} from "react-icons/fa";
import {GiSwordsEmblem } from "react-icons/gi";
import pencilDrawSound from "../../../assets/sounds/pencil_draw.m4a";

type Team = "A" | "B";
type Phase = "setup" | "play" | "roundEnd";
type GuessedCounts = Record<string, number>;

const MAX_WRONG = 6;

function normalizeWord(input: string) {
  const cleaned = input
    .trim()
    .toUpperCase()
    .replace(/[^\p{L}\s'-]/gu, "");
  return cleaned.replace(/\s+/g, " ");
}

function isLetter(ch: string) {
  return /^\p{L}$/u.test(ch);
}

function buildAlphabet(word: string) {
  const lettersInWord = Array.from(new Set(Array.from(word).filter(isLetter)));
  const AtoZ = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  const extra = lettersInWord.filter((l) => !AtoZ.includes(l));
  return [...AtoZ, ...extra];
}

function HangmanSVG({
  wrong,
  animateStep,
}: {
  wrong: number;
  animateStep: number | null;
}) {
  const show = (n: number) => wrong >= n;
  const drawStyle = (length: number, animate: boolean) =>
    animate
      ? {
          strokeDasharray: length,
          strokeDashoffset: length,
          animation: "hangman-draw 320ms ease-out forwards",
        }
      : undefined;
  const drawPath = (step: number) => {
    switch (step) {
      case 1:
        return "M 250 77 a 28 28 0 1 0 0 56 a 28 28 0 1 0 0 -56";
      case 2:
        return "M 250 133 L 250 200";
      case 3:
        return "M 250 155 L 210 175";
      case 4:
        return "M 250 155 L 290 175";
      case 5:
        return "M 250 200 L 220 240";
      case 6:
        return "M 250 200 L 280 240";
      default:
        return "";
    }
  };

  return (
    <svg viewBox="0 0 360 280" className="w-full h-full drop-shadow-xl">
      <style>{`@keyframes hangman-draw { to { stroke-dashoffset: 0; } }`}</style>
      <line x1="30" y1="255" x2="330" y2="255" stroke="#5D4A36" strokeWidth="8" strokeLinecap="round" />
      <line x1="90" y1="255" x2="90" y2="35" stroke="#5D4A36" strokeWidth="8" strokeLinecap="round" />
      <line x1="90" y1="35" x2="250" y2="35" stroke="#5D4A36" strokeWidth="8" strokeLinecap="round" />
      <line x1="250" y1="35" x2="250" y2="70" stroke="#5D4A36" strokeWidth="8" strokeLinecap="round" />

      {show(1) && (
        <circle
          cx="250"
          cy="105"
          r="28"
          fill="none"
          stroke="#2C1810"
          strokeWidth="8"
          className="drop-shadow-md"
          style={drawStyle(2 * Math.PI * 28, animateStep === 1)}
        />
      )}
      {show(2) && (
        <line
          x1="250"
          y1="133"
          x2="250"
          y2="200"
          stroke="#2C1810"
          strokeWidth="8"
          style={drawStyle(67, animateStep === 2)}
        />
      )}
      {show(3) && (
        <line
          x1="250"
          y1="155"
          x2="210"
          y2="175"
          stroke="#2C1810"
          strokeWidth="8"
          style={drawStyle(Math.hypot(40, 20), animateStep === 3)}
        />
      )}
      {show(4) && (
        <line
          x1="250"
          y1="155"
          x2="290"
          y2="175"
          stroke="#2C1810"
          strokeWidth="8"
          style={drawStyle(Math.hypot(40, 20), animateStep === 4)}
        />
      )}
      {show(5) && (
        <line
          x1="250"
          y1="200"
          x2="220"
          y2="240"
          stroke="#2C1810"
          strokeWidth="8"
          style={drawStyle(50, animateStep === 5)}
        />
      )}
      {show(6) && (
        <line
          x1="250"
          y1="200"
          x2="280"
          y2="240"
          stroke="#2C1810"
          strokeWidth="8"
          style={drawStyle(50, animateStep === 6)}
        />
      )}

      {animateStep && (
        <>
          <path id="hangman-pencil-path" d={drawPath(animateStep)} fill="none" stroke="none" />
          <g filter="drop-shadow(0 1px 1px rgba(0,0,0,0.35))">
            <rect x="-12" y="-3.1" width="22" height="6.2" rx="2.2" fill="#f59e0b" />
            <rect x="8.5" y="-3.1" width="3.8" height="6.2" rx="1.1" fill="#fcd34d" />
            <polygon points="-12,-3.1 -17.5,0 -12,3.1" fill="#b45309" />
            <polygon points="-17.5,0 -19.2,1 -19.2,-1" fill="#1f2937" />
            <animateMotion dur="0.32s" rotate="auto" fill="freeze">
              <mpath href="#hangman-pencil-path" />
            </animateMotion>
          </g>
        </>
      )}
    </svg>
  );
}

function BigButton({
  children,
  onClick,
  variant = "solid",
  disabled,
  icon,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "solid" | "outline" | "danger" | "success";
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  const variants = {
    solid: "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 shadow-lg",
    outline: "bg-white border-2 border-amber-200 text-amber-800 hover:bg-amber-50",
    danger: "bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 shadow-lg",
    success: "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        relative group overflow-hidden
        px-6 py-4 rounded-2xl text-lg md:text-xl font-black
        transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 hover:shadow-2xl'}
        ${variants[variant]}
      `}
    >
      <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      <span className="relative flex items-center justify-center gap-2">
        {icon && <span className="text-xl">{icon}</span>}
        {children}
      </span>
    </button>
  );
}

function WordSlots({
  word,
  guessedCounts,
  revealAll,
}: {
  word: string;
  guessedCounts: GuessedCounts;
  revealAll: boolean;
}) {
  const seenByLetter: Record<string, number> = {};

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {Array.from(word).map((ch, idx) => {
        let visible = revealAll || !isLetter(ch);
        if (isLetter(ch)) {
          const seenBefore = seenByLetter[ch] ?? 0;
          seenByLetter[ch] = seenBefore + 1;
          const openedCount = guessedCounts[ch] ?? 0;
          visible = revealAll || openedCount > seenBefore;
        }
        return (
          <div
            key={idx}
            className={`
              w-12 h-16 md:w-16 md:h-20 rounded-2xl border-2 flex items-center justify-center 
              text-2xl md:text-4xl font-bold transition-all duration-300
              ${visible 
                ? 'bg-gradient-to-br from-amber-100 to-orange-100 border-amber-400 text-amber-800 shadow-lg scale-105' 
                : 'bg-amber-50 border-amber-200 text-amber-300'
              }
            `}
          >
            {visible ? ch : '?'}
          </div>
        );
      })}
    </div>
  );
}

function Hangman() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [setter, setSetter] = useState<Team>("A");
  const [guesser, setGuesser] = useState<Team>("B");

  const [secretWord, setSecretWord] = useState("");
  const [hint, setHint] = useState("");

  const [inputWord, setInputWord] = useState("");
  const [inputHint, setInputHint] = useState("");

  const [guessedCounts, setGuessedCounts] = useState<GuessedCounts>({});
  const [wrong, setWrong] = useState(0);
  const [drawnSteps, setDrawnSteps] = useState(0);

  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);

  const [message, setMessage] = useState("");
  const [revealPressed, setRevealPressed] = useState(false);
  const [timerOn, setTimerOn] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [hintAnimation, setHintAnimation] = useState(false);
  const [animateStep, setAnimateStep] = useState<number | null>(null);
  const wrongRef = useRef(0);
  const drawnStepsRef = useRef(0);
  const pencilAudioRef = useRef<HTMLAudioElement | null>(null);

  const normalizedSecret = useMemo(() => normalizeWord(secretWord), [secretWord]);
  const alphabet = useMemo(() => buildAlphabet(normalizedSecret || inputWord.toUpperCase()), [
    normalizedSecret,
    inputWord,
  ]);

  const letterTargetCounts = useMemo(() => {
    const counts: GuessedCounts = {};
    for (const ch of Array.from(normalizedSecret)) {
      if (!isLetter(ch)) continue;
      counts[ch] = (counts[ch] ?? 0) + 1;
    }
    return counts;
  }, [normalizedSecret]);

  const totalLetters = useMemo(() => {
    return Array.from(normalizedSecret).filter(isLetter).length;
  }, [normalizedSecret]);

  const guessedCorrectCount = useMemo(() => {
    return Object.entries(letterTargetCounts).reduce((acc, [letter, target]) => {
      const opened = guessedCounts[letter] ?? 0;
      return acc + Math.min(opened, target);
    }, 0);
  }, [letterTargetCounts, guessedCounts]);

  const isWin = totalLetters > 0 && guessedCorrectCount === totalLetters;
  const isLose = wrong >= MAX_WRONG;

  useEffect(() => {
    wrongRef.current = wrong;
  }, [wrong]);

  useEffect(() => {
    drawnStepsRef.current = drawnSteps;
  }, [drawnSteps]);

  useEffect(() => {
    pencilAudioRef.current = new Audio(pencilDrawSound);
    pencilAudioRef.current.volume = 0.9;
    return () => {
      if (pencilAudioRef.current) {
        pencilAudioRef.current.pause();
        pencilAudioRef.current = null;
      }
    };
  }, []);

  const playPencilDraw = () => {
    const audio = pencilAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };

  const addDrawSteps = (count: number) => {
    const delayMs = 330;
    for (let i = 0; i < count; i++) {
      window.setTimeout(() => {
        if (drawnStepsRef.current >= MAX_WRONG) return;
        const next = drawnStepsRef.current + 1;
        drawnStepsRef.current = next;
        setDrawnSteps(next);
        setAnimateStep(next);
        playPencilDraw();
        window.setTimeout(
          () => setAnimateStep((cur) => (cur === next ? null : cur)),
          360,
        );
      }, i * delayMs);
    }
  };

  useEffect(() => {
    if (phase !== "play" || !timerOn) return;
    if (secondsLeft <= 0) return;

    const t = window.setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearInterval(t);
  }, [phase, timerOn, secondsLeft]);

  useEffect(() => {
    if (phase !== "play" || !timerOn) return;
    if (secondsLeft > 0) return;
    setWrong((prev) => Math.min(MAX_WRONG, prev + 1));
    setSecondsLeft(60);
    setMessage("⏳ Vaqt tugadi! -1 jon");
  }, [secondsLeft, phase, timerOn]);

  useEffect(() => {
    if (phase !== "play") return;
    if (isWin) {
      setMessage(`🎉 ${guesser} JAMOA SO‘ZNI TOPDI!`);
      if (guesser === "A") setScoreA((v) => v + 1);
      else setScoreB((v) => v + 1);
      setPhase("roundEnd");
    } else if (isLose) {
      setMessage(`💀 ${guesser} JAMOA YUTQAZDI! So‘z: ${normalizedSecret}`);
      if (setter === "A") setScoreA((v) => v + 1);
      else setScoreB((v) => v + 1);
      setPhase("roundEnd");
    }
  }, [isWin, isLose, phase, guesser, setter, normalizedSecret]);

  function startRound() {
    const w = normalizeWord(inputWord);
    if (!w || Array.from(w).filter(isLetter).length < 2) {
      setMessage("❌ So‘z kiriting (kamida 2 ta harf)");
      return;
    }
    setSecretWord(w);
    setHint(inputHint.trim());
    setGuessedCounts({});
    setWrong(0);
    wrongRef.current = 0;
    setDrawnSteps(0);
    drawnStepsRef.current = 0;
    setAnimateStep(null);
    setMessage(`🎮 RAUND BOSHLANDI! ${guesser} JAMOA TOPADI`);
    setSecondsLeft(60);
    setPhase("play");
    setInputWord("");
    setInputHint("");
  }

  function guessLetter(letter: string) {
    if (phase !== "play") return;
    if (isWin || isLose) return;

    const L = letter.toUpperCase();
    if (!isLetter(L)) return;
    const targetCount = letterTargetCounts[L] ?? 0;
    const currentCount = guessedCounts[L] ?? 0;
    const maxPress = targetCount > 0 ? targetCount : 1;
    if (currentCount >= maxPress) return;

    setGuessedCounts((prev) => ({ ...prev, [L]: (prev[L] ?? 0) + 1 }));

    if (!normalizedSecret.includes(L)) {
      setWrong((prev) => {
        const next = Math.min(MAX_WRONG, prev + 1);
        setMessage(`❌ '${L}' harfi yo‘q! (${MAX_WRONG - next} jon qoldi)`);
        return next;
      });
    } else {
      addDrawSteps(1);
      setMessage(`✅ '${L}' harfi bor!`);
    }
  }

  function giveHint() {
    const remainingPool = Object.entries(letterTargetCounts).flatMap(([letter, target]) => {
      const opened = guessedCounts[letter] ?? 0;
      const remain = Math.max(0, target - opened);
      return Array.from({ length: remain }, () => letter);
    });
    if (!remainingPool.length) {
      setMessage("⚠️ Barcha harflar ochilgan!");
      return;
    }
    
    const pick = remainingPool[Math.floor(Math.random() * remainingPool.length)];
    setGuessedCounts((prev) => ({ ...prev, [pick]: (prev[pick] ?? 0) + 1 }));
    setWrong((prev) => Math.min(MAX_WRONG, prev + 1));
    setHintAnimation(true);
    setTimeout(() => setHintAnimation(false), 1000);
    setMessage(`💡 HINT: "${pick}" harfi ochildi! (-1 jon)`);
  }

  function giveSuperHint() {
    if (wrong >= MAX_WRONG - 2) {
      setMessage("⚠️ Super hint uchun jon yetarli emas!");
      return;
    }

    const remainingPool = Object.entries(letterTargetCounts).flatMap(([letter, target]) => {
      const opened = guessedCounts[letter] ?? 0;
      const remain = Math.max(0, target - opened);
      return Array.from({ length: remain }, () => letter);
    });
    if (!remainingPool.length) {
      setMessage("⚠️ Barcha harflar ochilgan!");
      return;
    }
    
    const shuffled = [...remainingPool].sort(() => Math.random() - 0.5);
    const picks = shuffled.slice(0, Math.min(2, remainingPool.length));
    
    picks.forEach(pick => {
      setGuessedCounts((prev) => ({ ...prev, [pick]: (prev[pick] ?? 0) + 1 }));
    });
    
    setWrong((prev) => Math.min(MAX_WRONG, prev + 2));
    setMessage(`🔮 SUPER HINT: ${picks.join(', ')} harflari ochildi! (-2 jon)`);
  }

  function nextRoundSwap() {
    const nextSetter: Team = setter === "A" ? "B" : "A";
    const nextGuesser: Team = guesser === "A" ? "B" : "A";
    setSetter(nextSetter);
    setGuesser(nextGuesser);
    setSecretWord("");
    setHint("");
    setGuessedCounts({});
    setWrong(0);
    wrongRef.current = 0;
    setDrawnSteps(0);
    drawnStepsRef.current = 0;
    setAnimateStep(null);
    setRevealPressed(false);
    setSecondsLeft(60);
    setMessage("");
    setPhase("setup");
  }

  function resetAll() {
    setPhase("setup");
    setSetter("A");
    setGuesser("B");
    setSecretWord("");
    setHint("");
    setGuessedCounts({});
    setWrong(0);
    wrongRef.current = 0;
    setDrawnSteps(0);
    drawnStepsRef.current = 0;
    setAnimateStep(null);
    setRevealPressed(false);
    setTimerOn(false);
    setSecondsLeft(60);
    setMessage("");
    setScoreA(0);
    setScoreB(0);
    setInputWord("");
    setInputHint("");
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (phase !== "play") return;
      const k = e.key.toUpperCase();
      if (k.length === 1 && isLetter(k)) {
        e.preventDefault();
        guessLetter(k);
      }
      if (e.key === " " && phase === "play") {
        e.preventDefault();
        setRevealPressed(true);
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === " ") setRevealPressed(false);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [phase, guessedCounts, normalizedSecret, wrong, letterTargetCounts]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 p-4 md:p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] animate-pulse rounded-full bg-amber-400/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] animate-pulse rounded-full bg-orange-400/5 blur-3xl delay-1000" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FaUsers className="text-3xl text-amber-700" />
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                A → B TEAM
              </h1>
            </div>
            <div className="flex items-center gap-3 text-sm text-amber-700">
              <span className="font-bold px-3 py-1 bg-amber-200/50 rounded-full">A TEAM</span>
              <span className="text-amber-500">VS</span>
              <span className="font-bold px-3 py-1 bg-orange-200/50 rounded-full">B TEAM</span>
              <span className="text-amber-400">•</span>
              <span className="font-bold">{MAX_WRONG - wrong} / {MAX_WRONG} JON</span>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="px-4 py-3 rounded-xl bg-white/80 backdrop-blur-sm border border-amber-200 shadow-lg">
              <div className="text-xs text-amber-600">Score</div>
              <div className="text-xl font-bold flex items-center gap-2">
                <span className="text-amber-700">A: {scoreA}</span>
                <span className="text-amber-300">|</span>
                <span className="text-orange-700">B: {scoreB}</span>
              </div>
            </div>

            <BigButton
              variant="outline"
              onClick={() => setTimerOn(!timerOn)}
              icon={<FaClock />}
            >
              Timer {timerOn ? 'ON' : 'OFF'}
            </BigButton>

            <BigButton
              variant="outline"
              onClick={resetAll}
              icon={<FaRedo />}
            >
              Reset
            </BigButton>
          </div>
        </div>

        {/* Timer */}
        {timerOn && phase === "play" && (
          <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center shadow-lg">
            <span className="font-bold text-xl">{secondsLeft}s</span>
          </div>
        )}

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Hangman */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-amber-200 p-6 shadow-xl">
            <div className="aspect-[4/3] bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-4">
              <HangmanSVG wrong={drawnSteps} animateStep={animateStep} />
            </div>

            {/* Status */}
            <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
              <div className="text-sm text-amber-600 font-bold">STATUS</div>
              <div className={`mt-1 font-bold text-lg ${
                message.includes('✅') ? 'text-green-600' :
                message.includes('❌') ? 'text-red-600' :
                message.includes('💡') ? 'text-purple-600' :
                message.includes('🎉') ? 'text-green-600' :
                message.includes('💀') ? 'text-red-600' :
                'text-amber-800'
              }`}>
                {message || "—"}
              </div>
              
              {hint && phase !== "setup" && (
                <div className="mt-3 p-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl border border-amber-300">
                  <span className="font-bold text-amber-700">💡 HINT:</span>
                  <span className="ml-2 text-amber-800">{hint}</span>
                </div>
              )}

              {/* Reveal Word */}
              {(phase === "play" || phase === "roundEnd") && normalizedSecret && (
                <div className="mt-4">
                  <button
                    onMouseDown={() => setRevealPressed(true)}
                    onMouseUp={() => setRevealPressed(false)}
                    onMouseLeave={() => setRevealPressed(false)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg"
                  >
                    HOLD TO REVEAL WORD
                  </button>

                  {revealPressed && (
                    <div className="mt-3 p-4 bg-white border-2 border-amber-300 rounded-xl text-2xl font-bold text-center text-amber-800 shadow-xl">
                      {normalizedSecret}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Game Controls */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-amber-200 p-6 shadow-xl">
            {phase === "setup" && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl shadow-lg">
                  <div className="font-bold text-lg flex items-center gap-2">
                    <GiSwordsEmblem className="text-2xl" />
                    {setter} TEAM SO‘Z YASHIRADI
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-bold text-amber-700 mb-2">SO‘Z</label>
                    <input
                      type="password"
                      value={inputWord}
                      onChange={(e) => setInputWord(e.target.value)}
                      placeholder="Masalan: ELEPHANT"
                      className="w-full p-4 rounded-xl border-2 border-amber-200 focus:border-amber-400 outline-none bg-white/90 text-amber-800 placeholder-amber-300 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-amber-700 mb-2">HINT (ixtiyoriy)</label>
                    <input
                      type="text"
                      value={inputHint}
                      onChange={(e) => setInputHint(e.target.value)}
                      placeholder="Masalan: hayvon"
                      className="w-full p-4 rounded-xl border-2 border-amber-200 focus:border-amber-400 outline-none bg-white/90 text-amber-800 placeholder-amber-300"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <BigButton
                    variant="solid"
                    onClick={startRound}
                    icon={<FaPlay />}
                  >
                    START
                  </BigButton>
                  
                  <BigButton
                    variant="outline"
                    onClick={() => {
                      setSetter(setter === "A" ? "B" : "A");
                      setGuesser(guesser === "A" ? "B" : "A");
                    }}
                    icon={<FaExchangeAlt />}
                  >
                    SWAP
                  </BigButton>
                </div>
              </div>
            )}

            {phase === "play" && (
              <div className="space-y-4">
                <WordSlots word={normalizedSecret} guessedCounts={guessedCounts} revealAll={false} />

                {/* Hint Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <BigButton
                    variant="outline"
                    onClick={giveHint}
                    disabled={wrong >= MAX_WRONG - 1}
                    icon={<FaLightbulb />}
                  >
                    HINT (-1 JON)
                  </BigButton>
                  
                  <BigButton
                    variant="outline"
                    onClick={giveSuperHint}
                    disabled={wrong >= MAX_WRONG - 2}
                    icon={<FaMagic />}
                  >
                    SUPER (-2 JON)
                  </BigButton>
                </div>

                {/* Alphabet Grid */}
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-amber-800">HARFLAR</span>
                    <span className="text-sm text-amber-600">{Object.values(guessedCounts).reduce((a, b) => a + b, 0)} / 26 tanlandi</span>
                  </div>

                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                    {alphabet.map((l) => {
                      const targetCount = letterTargetCounts[l] ?? 0;
                      const pressedCount = guessedCounts[l] ?? 0;
                      const maxPress = targetCount > 0 ? targetCount : 1;
                      const used = pressedCount > 0;
                      const correct = targetCount > 0;
                      const complete = pressedCount >= maxPress;
                      return (
                        <button
                          key={l}
                          onClick={() => guessLetter(l)}
                          disabled={complete}
                          className={`
                            h-14 rounded-xl font-bold text-lg transition-all
                            ${used 
                              ? complete && correct
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md scale-105'
                                : correct
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                                : 'bg-gradient-to-r from-red-500 to-red-600 text-white line-through shadow-md'
                              : 'bg-white border-2 border-amber-200 hover:border-amber-400 hover:scale-110 hover:shadow-lg text-amber-800'
                            }
                          `}
                        >
                          {l}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Lives Indicator */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl border border-amber-300">
                  <span className="font-bold text-amber-800">QOLGAN JON:</span>
                  <div className="flex gap-1">
                    {[...Array(MAX_WRONG)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          i < wrong
                            ? 'bg-red-500 text-white'
                            : 'bg-green-500 text-white'
                        }`}
                      >
                        {i < wrong ? '✗' : '✓'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {phase === "roundEnd" && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-2xl shadow-lg">
                  <div className="font-bold text-lg flex items-center gap-2">
                    <FaCrown className="text-2xl" />
                    RAUND TUGADI
                  </div>
                  <div className="mt-1">{message}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <BigButton
                    variant="solid"
                    onClick={nextRoundSwap}
                    icon={<FaExchangeAlt />}
                  >
                    NEXT ROUND
                  </BigButton>
                  
                  <BigButton
                    variant="outline"
                    onClick={() => {
                      setSecretWord("");
                      setHint("");
                      setGuessedCounts({});
                      setWrong(0);
                      wrongRef.current = 0;
                      setDrawnSteps(0);
                      drawnStepsRef.current = 0;
                      setAnimateStep(null);
                      setRevealPressed(false);
                      setSecondsLeft(60);
                      setMessage("");
                      setPhase("setup");
                    }}
                    icon={<FaRedo />}
                  >
                    REPLAY
                  </BigButton>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100/80 backdrop-blur-sm rounded-full border border-amber-200">
            <GiSwordsEmblem className="text-amber-600" />
            <span className="text-sm font-bold text-amber-700">A TEAM vs B TEAM · {MAX_WRONG} JON</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hangman;


