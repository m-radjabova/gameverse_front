import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Confetti from "react-confetti-boom";
import {
  FaBookOpen,
  FaCrown,
  FaDice,
  FaFlagCheckered,
  FaShieldHalved,
  FaStar,
  FaTrophy,
  FaVolumeHigh,
  FaVolumeXmark,
} from "react-icons/fa6";
import applauseSound from "../../../assets/sounds/applause.mp3";
import correctSound from "../../../assets/sounds/correct.m4a";
import jumanjiSound from "../../../assets/sounds/jumanji_sound.m4a";
import diceSound from "../../../assets/sounds/roll_dice.mp3";
import wrongSound from "../../../assets/sounds/wrong.mp3";
import redStatue from "./statues/red-statue.png";
import blueStatue from "./statues/blue-statue.png";
import greenStatue from "./statues/green-statue.png";
import yellowStatue from "./statues/yellow-statue.png";
import { fetchGameQuestionsByTeacher } from "../../../hooks/useGameQuestions";
import useContextPro from "../../../hooks/useContextPro";
import { useFinishApplause } from "../../../hooks/useFinishApplause";
import GameStartCountdownOverlay from "../shared/GameStartCountdownOverlay";
import { useGameStartCountdown } from "../../../hooks/useGameStartCountdown";
import { DEFAULT_QUESTIONS } from "./constants/questions";
import { getGameQuestionDifficulty } from "../../../hooks/gameSession";
import { filterGameQuestionsByDifficulty } from "../../../utils/gameQuestionDifficulty";
import RealisticDice from "./components/RealisticDice";
import type { Question } from "./types";
import "./jumanji.css";

type PlayerColor = "red" | "blue" | "green" | "yellow";
type Stage = "question" | "answer" | "roll" | "moving" | "effect";
type TileType =
  | "start"
  | "question"
  | "bonus"
  | "minus"
  | "forward"
  | "backward"
  | "skip"
  | "shield"
  | "swap"
  | "double"
  | "mystery"
  | "finish";

type Player = {
  id: number;
  name: string;
  color: PlayerColor;
  position: number;
  score: number;
  skipTurns: number;
  shield: boolean;
  doubleDice: boolean;
  correct: number;
  bonuses: number;
  lucky: number;
};

type Tile = { id: number; type: TileType; label?: string };
type BoardPoint = { x: number; y: number };

const COLORS: Record<PlayerColor, { main: string; dark: string; light: string; label: string }> = {
  red: { main: "#ef493f", dark: "#731d18", light: "#ff9b82", label: "QIZIL" },
  blue: { main: "#258bd2", dark: "#0a436d", light: "#79d4ff", label: "KO'K" },
  green: { main: "#65ad25", dark: "#2c5b12", light: "#b7ed5c", label: "YASHIL" },
  yellow: { main: "#f4bd24", dark: "#805d08", light: "#ffe273", label: "SARIQ" },
};

const STATUES: Record<PlayerColor, string> = {
  red: redStatue,
  blue: blueStatue,
  green: greenStatue,
  yellow: yellowStatue,
};

const DEFAULT_PLAYERS: Player[] = [
  { id: 1, name: "Ali", color: "red", position: 0, score: 0, skipTurns: 0, shield: false, doubleDice: false, correct: 0, bonuses: 0, lucky: 0 },
  { id: 2, name: "Kamol", color: "blue", position: 0, score: 0, skipTurns: 0, shield: false, doubleDice: false, correct: 0, bonuses: 0, lucky: 0 },
  { id: 3, name: "Mirfayz", color: "green", position: 0, score: 0, skipTurns: 0, shield: false, doubleDice: false, correct: 0, bonuses: 0, lucky: 0 },
  { id: 4, name: "Malika", color: "yellow", position: 0, score: 0, skipTurns: 0, shield: false, doubleDice: false, correct: 0, bonuses: 0, lucky: 0 },
];

const TILE_TYPES: TileType[] = [
  "start", "question", "bonus", "question", "minus", "question",
  "forward", "question", "mystery", "question", "shield", "question",
  "backward", "question", "bonus", "question", "swap", "question",
  "minus", "question", "double", "question", "mystery", "question",
  "skip", "question", "bonus", "question", "minus", "question",
  "forward", "shield", "swap", "question", "mystery", "finish",
];

const BOARD_TILES: Tile[] = TILE_TYPES.map((type, id) => ({ id, type }));

const TILE_META: Record<TileType, { symbol: string; short: string; className: string; title: string }> = {
  start: { symbol: "⚑", short: "START", className: "start", title: "Boshlanish" },
  question: { symbol: "★", short: "", className: "question", title: "Oddiy katak" },
  bonus: { symbol: "+200", short: "", className: "bonus", title: "+200 ball" },
  minus: { symbol: "☠", short: "-100", className: "minus", title: "Xavfli katak" },
  forward: { symbol: "»", short: "+3", className: "forward", title: "+3 katak" },
  backward: { symbol: "«", short: "-2", className: "backward", title: "-2 katak" },
  skip: { symbol: "⌛", short: "", className: "skip", title: "1 navbat dam" },
  shield: { symbol: "◆", short: "", className: "shield", title: "Himoya" },
  swap: { symbol: "↔", short: "", className: "swap", title: "Joy almashish" },
  double: { symbol: "×2", short: "", className: "double", title: "Keyingi zar ×2" },
  mystery: { symbol: "?", short: "", className: "mystery", title: "Sirli katak" },
  finish: { symbol: "♛", short: "FINISH", className: "finish", title: "Jumanji ibodatxonasi" },
};

function createBoardPoints(): BoardPoint[] {
  // 36 ta katak 5 ta keng qatorga taqsimlanadi. Birinchi qatorda 8 ta,
  // qolganlarida 7 tadan katak bor; shu sabab START chapda, FINISH o'ngda.
  const rowCounts = [8, 7, 7, 7, 7];
  const rowY = [605, 470, 335, 200, 65];
  const left = 76;
  const right = 884;

  return rowCounts.flatMap((count, rowIndex) => {
    const points = Array.from({ length: count }, (_, columnIndex) => ({
      x: left + (right - left) * (columnIndex / (count - 1)),
      y: rowY[rowIndex] + Math.sin(columnIndex * 1.4 + rowIndex) * 5,
    }));
    return rowIndex % 2 === 0 ? points : points.reverse();
  });
}

const BOARD_POINTS = createBoardPoints();

const Pawn = memo(function Pawn({ color, size = 46 }: { color: PlayerColor; size?: number }) {
  return (
    <span
      className={`jumanji-pawn statue-${color}`}
      style={{ width: size, height: size * 1.72 }}
      aria-hidden="true"
    >
      <img src={STATUES[color]} alt="" draggable={false} decoding="async" />
    </span>
  );
});

const JungleBackdrop = memo(function JungleBackdrop() {
  return (
    <svg className="jumanji-jungle-svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="jungleSky" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#041c18"/><stop offset="1" stopColor="#071108"/></linearGradient>
        <radialGradient id="moonGlow"><stop stopColor="#86c98b" stopOpacity=".25"/><stop offset="1" stopColor="#133522" stopOpacity="0"/></radialGradient>
        <linearGradient id="mist" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#96d8ad" stopOpacity="0"/><stop offset=".5" stopColor="#96d8ad" stopOpacity=".14"/><stop offset="1" stopColor="#96d8ad" stopOpacity="0"/></linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#jungleSky)" />
      <circle cx="790" cy="180" r="330" fill="url(#moonGlow)" />
      <g opacity=".13" fill="#b7f3c5"><path d="m690 0 170 0 280 800H510Z"/><path d="m1120 0 90 0 170 670H930Z"/></g>
      <path d="M0 340q280-70 510 6t480-5 610 12" fill="none" stroke="url(#mist)" strokeWidth="95" opacity=".65"/>
      <g fill="#0c3522" opacity=".95">
        {Array.from({ length: 18 }, (_, i) => <path key={i} d={`M${i * 95 - 30} 0q55 80 10 190q-40-85-92-108q75 5 112-82Z`} />)}
      </g>
      <g fill="none" stroke="#17603a" strokeWidth="10" opacity=".45">
        <path d="M0 230q190 80 360-90t340 30 330-40 570 80"/><path d="M100 0q30 210 190 330t-50 390"/><path d="M1450 0q-50 210-210 300t40 410"/>
      </g>
      <g fill="#0a2a19"><path d="M0 720q170-160 340 0t330-20 350 20 580-70v350H0Z"/></g>
      <g fill="#1d5130" opacity=".8">
        {Array.from({ length: 22 }, (_, i) => <ellipse key={i} cx={(i * 197) % 1600} cy={720 + (i % 4) * 72} rx="95" ry="24" transform={`rotate(${i % 2 ? -25 : 25} ${(i * 197) % 1600} ${720 + (i % 4) * 72})`} />)}
      </g>
      <g fill="#b6ee91" opacity=".55">
        {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={(i * 313 + 80) % 1600} cy={120 + ((i * 137) % 690)} r={i % 3 === 0 ? 2.8 : 1.5} className="jumanji-firefly" style={{ animationDelay: `${(i % 7) * -.7}s` }}/>) }
      </g>
      <g opacity=".65"><path d="M1245 236h118l-16 238h-85Z" fill="#123b29"/><path d="m1231 236 73-88 73 88Z" fill="#183f2b"/><path d="M1284 336h39v138h-39Z" fill="#030d09"/><path d="M1238 245h132M1250 285h108" stroke="#467557" strokeWidth="6"/></g>
      <path d="M117 0q85 178 18 345t58 320" fill="none" stroke="#4c311a" strokeWidth="28" opacity=".75"/><path d="M1480 0q-104 190-29 350t-66 330" fill="none" stroke="#4c311a" strokeWidth="31" opacity=".75"/>
      <path d="M720 270h160l34 72-20 92H706l-20-92Z" fill="#143b28" stroke="#32704b" strokeWidth="6" opacity=".7" />
      <path d="M745 420v-90h110v90M775 420v-45h50v45" fill="none" stroke="#56a36c" strokeWidth="8" opacity=".5" />
    </svg>
  );
});

const BoardScenery = memo(function BoardScenery() {
  return (
    <svg className="board-scenery" viewBox="0 0 960 680" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="waterfall" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#b8f8e3" stopOpacity=".8"/><stop offset=".2" stopColor="#3ba69a"/><stop offset="1" stopColor="#073c42" stopOpacity=".25"/></linearGradient>
        <linearGradient id="rock" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#547154"/><stop offset=".45" stopColor="#263d2d"/><stop offset="1" stopColor="#101b15"/></linearGradient>
      </defs>
      <g>
        <path d="M448 218q50-31 100 0l-8 105q-44 25-86 0Z" fill="#10291e"/>
        <path d="M475 217q22-12 44 0l-4 115q-18 14-36 0Z" fill="url(#waterfall)" opacity=".86"/>
        <ellipse cx="497" cy="332" rx="65" ry="20" fill="#0a4b4b" stroke="#378e7b" strokeOpacity=".5" strokeWidth="3"/>
        <path d="M418 220 452 176l31 45m30 0 31-53 38 57" fill="url(#rock)" stroke="#18261c" strokeWidth="4"/>
      </g>
      <g transform="translate(466 375) rotate(-5)">
        <path d="M-120 10Q0-25 120 10" fill="none" stroke="#3b2614" strokeWidth="16"/>
        <path d="M-120 1Q0-34 120 1M-120 22Q0-13 120 22" fill="none" stroke="#b18448" strokeWidth="4"/>
        {[-92,-60,-28,4,36,68,100].map((x) => <path key={x} d={`M${x-11} 0  ${x+12} -5 ${x+16} 18 ${x-7} 23Z`} fill="#78502b" stroke="#2b1a0e" strokeWidth="2"/>)}
      </g>
      <g transform="translate(765 82)">
        <path d="m-67 35 67-67 67 67-12 17H-55Z" fill="#55482d" stroke="#1d1b12" strokeWidth="5"/>
        <path d="M-51 45h102v74H-51Z" fill="#3d3b27" stroke="#191b13" strokeWidth="5"/>
        <path d="M-18 119V62h36v57" fill="#06100b" stroke="#776739" strokeWidth="5"/>
        <circle cx="0" cy="18" r="13" fill="#142b1d" stroke="#9a8a4d" strokeWidth="4"/><circle cx="0" cy="18" r="4" fill="#c2db72" className="temple-eye"/>
        <path d="M-72 122h144M-59 132h118" stroke="#75643b" strokeWidth="9"/>
        <path d="M-51 48q-20-28-47-12M51 48q20-28 47-12" fill="none" stroke="#27613a" strokeWidth="6"/>
      </g>
      <g fill="url(#rock)" stroke="#142219" strokeWidth="3" opacity=".95">
        <path d="M55 185 88 139l45 10 23 55-36 31-54-12Z"/><path d="m790 508 42-45 62 13 17 54-48 35-61-11Z"/><path d="m218 317 23-34 39 8 13 40-31 22-40-8Z"/>
      </g>
      <g fill="none" stroke="#32734a" strokeWidth="5" opacity=".7"><path d="M0 98q105-15 188 61t135 3"/><path d="M960 420q-94-42-174 18t-132 10"/></g>
    </svg>
  );
});

const JumanjiLogo = memo(function JumanjiLogo() {
  return (
    <div className="jumanji-logo-wrap">
      <svg viewBox="0 0 360 112" className="jumanji-logo" role="img" aria-label="Jumanji">
        <defs>
          <linearGradient id="logoGold" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fff09a"/><stop offset=".38" stopColor="#e7a92c"/><stop offset="1" stopColor="#8c3e09"/></linearGradient>
        </defs>
        <path d="M12 18q168-30 336 0l-14 79q-154 15-308 0Z" fill="#382311" stroke="#76521f" strokeWidth="5" />
        <text x="180" y="73" textAnchor="middle" fill="url(#logoGold)" stroke="#5a2305" strokeWidth="2.2" fontSize="57" fontWeight="900" fontFamily="Georgia,serif">JUMANJI</text>
        <text x="180" y="94" textAnchor="middle" fill="#f8d666" fontSize="10" fontWeight="800" letterSpacing="2">SAVOL • ZAR • SARGUZASHT</text>
      </svg>
    </div>
  );
});

function Jumanji() {
  const { state: { user, isLoading: isUserLoading } } = useContextPro();
  const [phase, setPhase] = useState<"setup" | "game" | "finish">("setup");
  const [players, setPlayers] = useState<Player[]>(DEFAULT_PLAYERS);
  const [questions, setQuestions] = useState<Question[]>(() => filterGameQuestionsByDifficulty(DEFAULT_QUESTIONS, getGameQuestionDifficulty("jumanji")));
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [stage, setStage] = useState<Stage>("question");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerCorrect, setAnswerCorrect] = useState<boolean | null>(null);
  const [diceValue, setDiceValue] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [bonusStep, setBonusStep] = useState(0);
  const [event, setEvent] = useState<{ title: string; detail: string; tone: "good" | "bad" | "mystery" } | null>(null);
  const [swapPicker, setSwapPicker] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [muted, setMuted] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [gameSeconds, setGameSeconds] = useState(0);
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [visualPositions, setVisualPositions] = useState<Record<number, number>>({});
  const timeoutRefs = useRef<number[]>([]);
  const audio = useRef<Record<string, HTMLAudioElement | null>>({});
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();
  useFinishApplause(phase === "finish");

  const question = questions[questionIndex % questions.length] ?? DEFAULT_QUESTIONS[0];
  const activePlayer = players[currentPlayer];
  const winner = players.find((player) => player.id === winnerId) ?? null;

  const later = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timeoutRefs.current = timeoutRefs.current.filter((item) => item !== id);
      fn();
    }, delay);
    timeoutRefs.current.push(id);
  }, []);

  useEffect(() => () => timeoutRefs.current.forEach(window.clearTimeout), []);

  useEffect(() => {
    audio.current = {
      bg: new Audio(jumanjiSound), dice: new Audio(diceSound),
      correct: new Audio(correctSound), wrong: new Audio(wrongSound), win: new Audio(applauseSound),
    };
    if (audio.current.bg) { audio.current.bg.loop = true; audio.current.bg.volume = .38; }
    return () => Object.values(audio.current).forEach((item) => item?.pause());
  }, []);

  const play = useCallback((name: string) => {
    if (muted) return;
    const sound = audio.current[name];
    if (sound) { sound.currentTime = 0; void sound.play().catch(() => undefined); }
  }, [muted]);

  useEffect(() => {
    const bg = audio.current.bg;
    if (!bg) return;
    bg.muted = muted;
    if (phase === "game") void bg.play().catch(() => undefined);
    else { bg.pause(); bg.currentTime = 0; }
  }, [muted, phase]);

  useEffect(() => {
    if (isUserLoading) return;
    let alive = true;
    void (async () => {
      if (!user?.id) return;
      const remote = await fetchGameQuestionsByTeacher<Question>("jumanji", user.id);
      if (alive && remote?.length) setQuestions(filterGameQuestionsByDifficulty(remote, getGameQuestionDifficulty("jumanji")));
    })();
    return () => { alive = false; };
  }, [isUserLoading, user?.id]);

  useEffect(() => {
    if (phase !== "game") return;
    const timer = window.setInterval(() => setGameSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  const addHistory = useCallback((message: string) => {
    setHistory((items) => [...items.slice(-7), message]);
  }, []);

  const updatePlayer = useCallback((id: number, update: Partial<Player> | ((player: Player) => Partial<Player>)) => {
    setPlayers((items) => items.map((player) => player.id === id
      ? { ...player, ...(typeof update === "function" ? update(player) : update) }
      : player));
  }, []);

  const prepareQuestion = useCallback((nextPlayerIndex: number) => {
    setCurrentPlayer(nextPlayerIndex);
    setQuestionIndex((index) => (index + 1) % questions.length);
    setSelectedAnswer(null);
    setAnswerCorrect(null);
    setBonusStep(0);
    setEvent(null);
    setStage("question");
  }, [questions.length]);

  const advanceTurn = useCallback((fromIndex = currentPlayer) => {
    let next = (fromIndex + 1) % players.length;
    let guard = 0;
    while (players[next]?.skipTurns > 0 && guard < players.length) {
      const skipped = players[next];
      updatePlayer(skipped.id, { skipTurns: Math.max(0, skipped.skipTurns - 1) });
      addHistory(`⏳ ${skipped.name} bir navbatni o'tkazib yubordi`);
      next = (next + 1) % players.length;
      guard += 1;
    }
    prepareQuestion(next);
  }, [addHistory, currentPlayer, players, prepareQuestion, updatePlayer]);

  const finish = useCallback((player: Player) => {
    setWinnerId(player.id);
    setPhase("finish");
    play("win");
  }, [play]);

  const animateMove = useCallback((player: Player, target: number, done: () => void) => {
    const start = visualPositions[player.id] ?? player.position;
    const safeTarget = Math.max(0, Math.min(35, target));
    const direction = safeTarget >= start ? 1 : -1;
    const total = Math.abs(safeTarget - start);
    // Har bir katak alohida ko'rinishi uchun yurish tezligi bir xil va sokin.
    const stepDuration = 430;
    setStage("moving");
    if (!total) { done(); return; }
    for (let i = 1; i <= total; i += 1) {
      later(() => setVisualPositions((positions) => ({ ...positions, [player.id]: start + i * direction })), i * stepDuration);
    }
    later(() => {
      updatePlayer(player.id, { position: safeTarget });
      done();
    }, total * stepDuration + 260);
  }, [later, updatePlayer, visualPositions]);

  const completeEffect = useCallback((delay = 1500) => later(() => advanceTurn(), delay), [advanceTurn, later]);

  const applyNegative = useCallback((player: Player, action: () => void) => {
    if (player.shield) {
      updatePlayer(player.id, { shield: false });
      setEvent({ title: "HIMOYA ISHLADI!", detail: "Xavfli katak ta'siri bekor qilindi", tone: "good" });
      addHistory(`🛡️ ${player.name} himoya bilan xavfdan qutuldi`);
      completeEffect();
      return;
    }
    action();
  }, [addHistory, completeEffect, updatePlayer]);

  const applyTile = useCallback((player: Player, tile: Tile) => {
    setStage("effect");
    const moveAndFinish = (delta: number, message: string) => {
      const target = Math.max(0, Math.min(35, player.position + delta));
      setEvent({ title: delta > 0 ? "YO'L OCHILDI!" : "JUNGLE TUZOG'I!", detail: message, tone: delta > 0 ? "good" : "bad" });
      addHistory(`${delta > 0 ? "🚀" : "🐍"} ${player.name} ${message}`);
      animateMove(player, target, () => target === 35 ? finish({ ...player, position: 35 }) : completeEffect(1000));
    };

    switch (tile.type) {
      case "question":
      case "start":
        setEvent({ title: "XAVFSIZ KATAK", detail: "Yo'lingizni davom ettiring", tone: "good" });
        addHistory(`★ ${player.name} xavfsiz katakka tushdi`);
        completeEffect(900);
        break;
      case "bonus":
        updatePlayer(player.id, (current) => ({ score: current.score + 200, bonuses: current.bonuses + 1 }));
        setEvent({ title: "+200 BALL", detail: "Jungle xazinasi topildi!", tone: "good" });
        addHistory(`⭐ ${player.name} +200 ball oldi`);
        completeEffect();
        break;
      case "minus": {
        applyNegative(player, () => {
          const penalty = Math.floor(Math.random() * 3);
          if (penalty === 0) {
            updatePlayer(player.id, (current) => ({ score: Math.max(0, current.score - 100) }));
            setEvent({ title: "JUMANJI SIZNI SINAYAPTI!", detail: "-100 ball", tone: "bad" });
            addHistory(`☠ ${player.name} -100 ball yo'qotdi`); completeEffect();
          } else if (penalty === 1) moveAndFinish(-2, "2 katak orqaga yurdi");
          else {
            updatePlayer(player.id, { skipTurns: player.skipTurns + 1 });
            setEvent({ title: "VAQT TUZOG'I!", detail: "1 navbatni o'tkazib yuborasiz", tone: "bad" });
            addHistory(`⏳ ${player.name} keyingi navbatni o'tkazadi`); completeEffect();
          }
        });
        break;
      }
      case "forward": moveAndFinish(3, "3 katak oldinga yurdi"); break;
      case "backward": applyNegative(player, () => moveAndFinish(-2, "2 katak orqaga yurdi")); break;
      case "skip":
        applyNegative(player, () => {
          updatePlayer(player.id, { skipTurns: player.skipTurns + 1 });
          setEvent({ title: "DAM OLING", detail: "Keyingi navbat o'tkazib yuboriladi", tone: "bad" });
          addHistory(`⌛ ${player.name} 1 navbat dam oladi`); completeEffect();
        });
        break;
      case "shield":
        updatePlayer(player.id, { shield: true });
        setEvent({ title: "HIMOYA QALQONI", detail: "Keyingi minus ta'sir qilmaydi", tone: "good" });
        addHistory(`🛡️ ${player.name} himoya oldi`); completeEffect();
        break;
      case "double":
        updatePlayer(player.id, { doubleDice: true });
        setEvent({ title: "IKKI BARAVAR KUCH", detail: "Keyingi zar natijasi ×2", tone: "good" });
        addHistory(`🎲 ${player.name} keyingi zarni ×2 qiladi`); completeEffect();
        break;
      case "swap":
        setEvent({ title: "JOY ALMASHISH", detail: "Istalgan raqibni tanlang", tone: "mystery" });
        setSwapPicker(true);
        break;
      case "mystery": {
        const mystery = Math.floor(Math.random() * 6);
        updatePlayer(player.id, (current) => ({ lucky: current.lucky + 1 }));
        if (mystery === 0) {
          updatePlayer(player.id, (current) => ({ score: current.score + 300 }));
          setEvent({ title: "SIRLI XAZINA", detail: "+300 ball", tone: "mystery" }); addHistory(`❓ ${player.name} +300 ball topdi`); completeEffect();
        } else if (mystery === 1) applyNegative(player, () => {
          updatePlayer(player.id, (current) => ({ score: Math.max(0, current.score - 200) }));
          setEvent({ title: "QADIMIY LA'NAT", detail: "-200 ball", tone: "bad" }); addHistory(`❓ ${player.name} -200 ball yo'qotdi`); completeEffect();
        });
        else if (mystery === 2) moveAndFinish(3, "sirli kuch bilan 3 katak oldinga yurdi");
        else if (mystery === 3) applyNegative(player, () => moveAndFinish(-2, "sirli kuch bilan 2 katak orqaga yurdi"));
        else if (mystery === 4) {
          setEvent({ title: "YANA BIR IMKON!", detail: "Yana zar tashlaysiz", tone: "mystery" });
          addHistory(`❓ ${player.name} yana zar tashlaydi`); later(() => { setEvent(null); setStage("roll"); }, 1400);
        } else {
          setEvent({ title: "SIRLI ALMASHUV", detail: "Raqib bilan joy almashing", tone: "mystery" }); setSwapPicker(true);
        }
        break;
      }
      case "finish": finish({ ...player, position: 35 }); break;
    }
  }, [addHistory, animateMove, applyNegative, completeEffect, finish, later, updatePlayer]);

  const handleAnswer = (answer: string) => {
    if (stage !== "question") return;
    const correct = answer === question.correctAnswer;
    setSelectedAnswer(answer); setAnswerCorrect(correct); setStage("answer"); play(correct ? "correct" : "wrong");
    if (correct) {
      updatePlayer(activePlayer.id, (player) => ({ score: player.score + 100, correct: player.correct + 1 }));
      setBonusStep(1); addHistory(`✅ ${activePlayer.name} to'g'ri javob berdi: +100 ball`);
      later(() => setStage("roll"), 1250);
    } else {
      addHistory(`❌ ${activePlayer.name} noto'g'ri javob berdi`);
      later(() => advanceTurn(), 1500);
    }
  };

  const rollDice = () => {
    if (stage !== "roll" || rolling) return;
    setRolling(true); play("dice");
    let ticks = 0;
    const interval = window.setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1); ticks += 1;
      if (ticks < 10) return;
      window.clearInterval(interval);
      const rolled = Math.floor(Math.random() * 6) + 1;
      const multiplier = activePlayer.doubleDice ? 2 : 1;
      const steps = rolled * multiplier + bonusStep;
      setDiceValue(rolled); setRolling(false);
      if (activePlayer.doubleDice) updatePlayer(activePlayer.id, { doubleDice: false });
      addHistory(`🎲 ${activePlayer.name} ${rolled}${multiplier === 2 ? " ×2" : ""}${bonusStep ? " +1 bonus" : ""} = ${steps} qadam yurdi`);
      const target = Math.min(35, activePlayer.position + steps);
      animateMove(activePlayer, target, () => {
        const moved = { ...activePlayer, position: target };
        if (target === 35) finish(moved); else applyTile(moved, BOARD_TILES[target]);
      });
    }, 95);
  };

  const chooseSwap = (opponent: Player) => {
    const player = players[currentPlayer];
    const ownPosition = player.position;
    const opponentPosition = opponent.position;
    updatePlayer(player.id, { position: opponentPosition });
    updatePlayer(opponent.id, { position: ownPosition });
    setVisualPositions((positions) => ({ ...positions, [player.id]: opponentPosition, [opponent.id]: ownPosition }));
    setSwapPicker(false);
    setEvent({ title: "JOY ALMASHILDI!", detail: `${player.name} ↔ ${opponent.name}`, tone: "good" });
    addHistory(`↔ ${player.name} va ${opponent.name} joy almashdi`);
    if (opponentPosition === 35) finish({ ...player, position: 35 }); else completeEffect(1200);
  };

  const startNow = () => {
    const fresh = players.map((player) => ({ ...player, position: 0, score: 0, skipTurns: 0, shield: false, doubleDice: false, correct: 0, bonuses: 0, lucky: 0 }));
    setPlayers(fresh); setVisualPositions(Object.fromEntries(fresh.map((player) => [player.id, 0])));
    setCurrentPlayer(0); setQuestionIndex(0); setSelectedAnswer(null); setAnswerCorrect(null);
    setDiceValue(1); setBonusStep(0); setHistory(["🌿 Jumanji uyg'ondi. Sarguzasht boshlandi!"]);
    setGameSeconds(0); setWinnerId(null); setPhase("game"); setStage("question");
  };

  const resetGame = () => { setPhase("setup"); setWinnerId(null); setHistory([]); setEvent(null); setSwapPicker(false); };
  const sortedPlayers = useMemo(() => [...players].sort((a, b) => b.position - a.position || b.score - a.score), [players]);
  const stageGuide = stage === "question"
    ? { step: "1/3", title: "SAVOLGA JAVOB BERING", detail: "To'g'ri javobdan keyin zar ochiladi" }
    : stage === "answer"
      ? { step: "2/3", title: answerCorrect ? "TO'G'RI JAVOB" : "JAVOB TEKSHIRILDI", detail: answerCorrect ? "Zar tayyorlanmoqda..." : "Navbat keyingi o'yinchiga o'tadi" }
      : stage === "roll"
        ? { step: "2/3", title: "ZARNI TASHLANG", detail: bonusStep ? "+1 bonus qadam qo'shiladi" : "Yo'lga chiqishga tayyor" }
        : stage === "moving"
          ? { step: "3/3", title: "HAYKALCHA HARAKATDA", detail: "Katak effekti hozir ishlaydi" }
          : { step: "3/3", title: "JUMANJI HODISASI", detail: "Effekt yakunlanmoqda" };

  return (
    <main className="jumanji-game-shell">
      <JungleBackdrop />
      {phase === "setup" && <button className="jumanji-sound" onClick={() => setMuted((value) => !value)} aria-label={muted ? "Ovozni yoqish" : "Ovozni o'chirish"}>
        {muted ? <FaVolumeXmark /> : <FaVolumeHigh />}
      </button>}

      {phase === "setup" && (
        <section className="jumanji-setup">
          <JumanjiLogo />
          <div className="setup-scroll">
            <div className="setup-heading"><span>4</span><div><h1>O'YINCHILAR TAYYOR</h1><p>Har bir haykalchaga o'yinchi nomini kiriting</p></div></div>
            <div className="setup-players">
              {players.map((player, index) => (
                <label key={player.id} className={`setup-player ${player.color}`}>
                  <Pawn color={player.color} size={54} />
                  <span>{COLORS[player.color].label} HAYKALCHA</span>
                  <input value={player.name} maxLength={14} onChange={(e) => setPlayers((items) => items.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} />
                </label>
              ))}
            </div>
            <div className="setup-rule-flow">
              <div><b>1</b><span>SAVOL</span><small>To'g'ri javob bering</small></div><i>›</i>
              <div><b>2</b><span>ZAR</span><small>Zarni tashlang</small></div><i>›</i>
              <div><b>3</b><span>YO'L</span><small>Katak bo'ylab yuring</small></div><i>›</i>
              <div><b>4</b><span>HODISA</span><small>Effektni bajaring</small></div>
            </div>
            <div className="setup-footer"><span><FaBookOpen /> {questions.length} ta savol tayyor</span><span><FaFlagCheckered /> 36 katak</span><button disabled={players.some((p) => !p.name.trim())} onClick={() => runStartCountdown(startNow)}><FaDice /> O'YINNI BOSHLASH</button></div>
          </div>
        </section>
      )}

      {phase === "game" && (
        <div className="jumanji-game-layout">
          <header className="jumanji-topbar">
            <JumanjiLogo />
            <div className="turn-plaque"><small>NAVBAT</small><Pawn color={activePlayer.color} size={34}/><div><b>{activePlayer.name}</b><span style={{ color: COLORS[activePlayer.color].light }}>{COLORS[activePlayer.color].label}</span></div></div>
            <div className="dice-plaque"><small>ZAR</small><strong>{diceValue}</strong></div>
            <button onClick={() => setShowRules(true)}><FaBookOpen/><span>QOIDALAR</span></button>
            <button onClick={() => setMuted((value) => !value)}>{muted ? <FaVolumeXmark/> : <FaVolumeHigh/>}<span>OVOZ</span></button>
          </header>

          <aside className="players-rail">
            {players.map((player, index) => (
              <article key={player.id} className={`player-card ${player.color} ${index === currentPlayer ? "active" : ""}`}>
                <div className="rank">{index + 1}</div><Pawn color={player.color} size={48}/>
                <div className="player-copy"><strong>{player.name}</strong><span>{COLORS[player.color].label}</span><div><b>★ {player.score}</b><em>⌖ {player.position + 1}/36</em></div></div>
                <div className="player-powers">{player.shield && <FaShieldHalved title="Himoya"/>}{player.doubleDice && <b title="Keyingi zar ×2">×2</b>}{player.skipTurns > 0 && <span title="Navbat o'tkaziladi">⌛</span>}</div>
              </article>
            ))}
          </aside>

          <section className="board-panel">
            <div className="board-world">
              <BoardScenery />
              <svg viewBox="0 0 960 680" preserveAspectRatio="none" className="board-road" aria-label="36 katakli Jumanji yo'lagi">
                <defs>
                  <linearGradient id="stoneRoad" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#c89c5c"/><stop offset=".32" stopColor="#927047"/><stop offset=".68" stopColor="#6a492b"/><stop offset="1" stopColor="#332216"/></linearGradient>
                </defs>
                <polyline points={BOARD_POINTS.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#160e09" strokeOpacity=".72" strokeWidth="86" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points={BOARD_POINTS.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="url(#stoneRoad)" strokeWidth="68" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points={BOARD_POINTS.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#e1bd7e" strokeOpacity=".38" strokeWidth="3" strokeDasharray="11 9"/>
                <polyline points={BOARD_POINTS.slice(0, activePlayer.position + 1).map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={COLORS[activePlayer.color].light} strokeOpacity=".48" strokeWidth="5" strokeLinecap="round" className="road-progress"/>
                {BOARD_POINTS.map((point, index) => index % 3 === 1 ? <path key={`crack-${index}`} d={`M${point.x-18} ${point.y-9}l9 7-6 8m15-13 8 6`} fill="none" stroke="#382517" strokeOpacity=".62" strokeWidth="2"/> : null)}
              </svg>
              {BOARD_TILES.map((tile, index) => {
                const point = BOARD_POINTS[index]; const meta = TILE_META[tile.type];
                return <div key={tile.id} className={`board-tile ${meta.className}`} title={`${index + 1}. ${meta.title}`} style={{ left: `${point.x / 9.6}%`, top: `${point.y / 6.8}%` }}><span>{meta.symbol}</span>{meta.short && <small>{meta.short}</small>}<i>{index + 1}</i></div>;
              })}
              {players.map((player) => {
                const pos = visualPositions[player.id] ?? player.position; const point = BOARD_POINTS[pos];
                const same = players.filter((p) => (visualPositions[p.id] ?? p.position) === pos); const stack = same.findIndex((p) => p.id === player.id);
                return <div key={player.id} className="board-pawn" style={{ left: `${point.x / 9.6}%`, top: `${point.y / 6.8}%`, transform: `translate(calc(-50% + ${(stack - (same.length - 1) / 2) * 22}px), -78%)`, zIndex: 20 + stack }}><Pawn color={player.color} size={42}/></div>;
              })}
              <div className="board-label start-label">START</div><div className="board-label finish-label">FINISH</div>
            </div>
          </section>

          <aside className="question-rail">
            <div className="question-scroll">
            <div className={`action-guide ${stage}`} aria-live="polite"><b>{stageGuide.step}</b><div><strong>{stageGuide.title}</strong><span>{stageGuide.detail}</span></div></div>
            <div className="question-panel">
              <h2>SAVOL</h2>
              <div className="question-subject">{question.subject} · {activePlayer.name} navbati</div>
              <h3>{question.question}</h3>
              <div className="answers">
                {question.options.map((option, index) => {
                  const status = answerCorrect !== null && option === question.correctAnswer ? "correct" : answerCorrect === false && option === selectedAnswer ? "wrong" : "";
                  return <button key={option} disabled={stage !== "question"} className={status} onClick={() => handleAnswer(option)}><b>{String.fromCharCode(65 + index)}</b><span>{option}</span></button>;
                })}
              </div>
              {stage === "question" && <p className="question-hint">To'g'ri javob → +100 ball, zar va +1 bonus qadam</p>}
              {stage === "answer" && <div className={`answer-result ${answerCorrect ? "good" : "bad"}`}>{answerCorrect ? "✓ To'g'ri! +100 ball va +1 qadam" : `✕ Noto'g'ri. Javob: ${question.correctAnswer}`}</div>}
              {stage === "roll" && <button className="roll-button" onClick={rollDice} disabled={rolling}><span className={rolling ? "rolling" : ""}><RealisticDice value={diceValue}/></span><b>{rolling ? "ZAR AYLANMOQDA..." : "ZARNI TASHLASH"}</b><small>{activePlayer.doubleDice ? "Keyingi zar ×2" : bonusStep ? "+1 bonus qadam tayyor" : "Yana bir imkon"}</small></button>}
              {stage === "moving" && <div className="moving-message"><FaDice/> HAYKALCHA YO'LDA...</div>}
            </div>
            <div className="last-result"><h3>OXIRGI NATIJA</h3><p>{history.at(-1) ?? "O'yin boshlandi"}</p></div>
            </div>
          </aside>

          <section className="legend-panel"><h3>MAXSUS KATAKLAR</h3><div>{(["bonus","minus","forward","backward","skip","swap","shield","mystery","double"] as TileType[]).map((type) => <span key={type}><i className={TILE_META[type].className}>{TILE_META[type].symbol}</i>{TILE_META[type].title}</span>)}</div></section>
          <section className="history-panel"><h3>O'YIN JARAYONI</h3><div>{history.slice().reverse().map((item, index) => <p key={`${item}-${index}`}>{item}</p>)}</div></section>
        </div>
      )}

      {event && phase === "game" && <div className="event-overlay"><div className={`event-card ${event.tone}`}><span>{event.tone === "good" ? "★" : event.tone === "bad" ? "☠" : "?"}</span><h2>{event.title}</h2><p>{event.detail}</p>{swapPicker && <div className="swap-options">{players.filter((p) => p.id !== activePlayer.id).map((player) => <button key={player.id} onClick={() => chooseSwap(player)}><Pawn color={player.color} size={28}/>{player.name}<small>{player.position + 1}-katak</small></button>)}</div>}</div></div>}

      {showRules && <div className="rules-overlay" onClick={() => setShowRules(false)}><div onClick={(e) => e.stopPropagation()}><button onClick={() => setShowRules(false)}>×</button><h2>JUMANJI QOIDALARI</h2><ol><li>Navbat boshida savolga javob bering.</li><li>To'g'ri javob uchun +100 ball, zar tashlash va +1 bonus qadam olasiz.</li><li>Noto'g'ri javobda yurmaydi va navbat almashadi.</li><li>Tushgan maxsus katak effekti avtomatik ishlaydi.</li><li>36-katakka birinchi yetgan o'yinchi g'olib!</li></ol></div></div>}

      {phase === "finish" && winner && (
        <div className="victory-overlay">
          <Confetti mode="boom" particleCount={400} effectCount={1} colors={["#f7c948", "#ef493f", "#65ad25", "#258bd2"]}/>
          <div className="victory-card"><FaCrown/><p>JUMANJI YAKUNLANDI!</p><h1>{winner.name} — G'OLIB!</h1><Pawn color={winner.color} size={82}/><div className="winner-stats"><span><b>{winner.score}</b>Ball</span><span><b>{winner.correct}</b>To'g'ri javob</span><span><b>{winner.bonuses}</b>Bonuslar</span></div><h3><FaTrophy/> JUNGLE MASTER</h3><div className="results-list">{sortedPlayers.map((player, index) => <div key={player.id}><b>{index + 1}</b><Pawn color={player.color} size={26}/><span>{player.name}</span><em>{player.score} ball · {player.position + 1}/36</em></div>)}</div><button onClick={resetGame}>QAYTA O'YNASH</button></div>
        </div>
      )}

      <div className="game-clock"><FaStar/> {String(Math.floor(gameSeconds / 60)).padStart(2,"0")}:{String(gameSeconds % 60).padStart(2,"0")}</div>
      <GameStartCountdownOverlay visible={countdownVisible} value={countdownValue}/>
    </main>
  );
}

export default Jumanji;
