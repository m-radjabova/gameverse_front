import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBolt,
  FaCheckCircle,
  FaCrown,
  FaEdit,
  FaLightbulb,
  FaMapMarkedAlt,
  FaPlus,
  FaRedo,
  FaShip,
  FaTimesCircle,
  FaTrash
} from "react-icons/fa";
import { GiTreasureMap, GiAnchor, GiPirateFlag } from "react-icons/gi";
import { MdOutlineTimer } from "react-icons/md";
import { IoMdNuclear } from "react-icons/io";
import Confetti from "react-confetti-boom";
import { fetchGameQuestions, saveGameQuestions } from "../../../apiClient/gameQuestions";
import { generateTreasureHuntRiddles } from "./ai";
import useContextPro from "../../../hooks/useContextPro";
import { hasAnyRole } from "../../../utils/roles";
import pirateOrchestra from "../../../assets/sounds/pirate_orchestra.m4a";
import { TREASURE_RIDDLES } from "./data/riddles";
import type { Riddle } from "./types";
import { useGameStartCountdown } from "../shared/useGameStartCountdown";

type Phase = "intro" | "play" | "finish";
type RiddleDraft = {
  title: string;
  story: string;
  question: string;
  options: [string, string, string, string];
  answerIndex: number;
  hint: string;
  reward: string;
};

const TREASURE_HUNT_GAME_KEY = "treasure_hunt";
const SECONDS_TOTAL = 12 * 60;
const SECONDS_PER_QUESTION = 45;
const HINT_PENALTY = 40;
const WRONG_PENALTY = 25;
const STEP_SCORE_REQUIREMENT = 95;
const AI_GENERATE_OPTIONS = [1, 3, 5, 10, 20] as const;
const AI_DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Oson" },
  { value: "medium", label: "O'rta" },
  { value: "hard", label: "Qiyin" },
  { value: "mixed", label: "Aralash" },
] as const;
const EMPTY_DRAFT: RiddleDraft = {
  title: "", story: "", question: "",
  options: ["", "", "", ""],
  answerIndex: 0, hint: "", reward: "120",
};

const randomizeRiddles = (riddles: Riddle[]) => [...riddles].sort(() => Math.random() - 0.5);
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

// ── Realistic SVG Treasure Map ──────────────────────────────────────────────
function TreasureMapSVG({ progress }: { progress: number }) {
  // const shipX = 9 + (84) * (progress / 100);
  // Path waypoints
  const pathD = "M 9,72 C 18,58 26,78 35,65 C 44,52 52,70 62,55 C 70,43 80,48 93,30";
  const pathGlowD = "M 8,73 C 18,57 27,79 36,66 C 45,53 53,69 63,55 C 72,42 82,47 94,29";

  // Compute ship position along path (approximate)
  const t = progress / 100;
  // Bezier approximation for ship position
  const pts = [
    [9,72],[18,58],[26,78],[35,65],[44,52],[52,70],[62,55],[70,43],[80,48],[93,30]
  ];
  const idx = Math.min(Math.floor(t * (pts.length - 1)), pts.length - 2);
  const frac = t * (pts.length - 1) - idx;
  const sx = pts[idx][0] + (pts[idx+1][0] - pts[idx][0]) * frac;
  const sy = pts[idx][1] + (pts[idx+1][1] - pts[idx][1]) * frac;

  return (
    <svg
      viewBox="0 0 102 90"
      className="h-full w-full"
      style={{ fontFamily: "Georgia, serif" }}
    >
      <defs>
        {/* Ocean gradient */}
        <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#1a5276" />
          <stop offset="40%" stopColor="#154360" />
          <stop offset="100%" stopColor="#0a2744" />
        </radialGradient>
        {/* Parchment gradient for land */}
        <radialGradient id="landGrad1" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#c9a96e" />
          <stop offset="60%" stopColor="#a67c3d" />
          <stop offset="100%" stopColor="#8b6914" />
        </radialGradient>
        <radialGradient id="landGrad2" cx="60%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#b8956a" />
          <stop offset="70%" stopColor="#9a7040" />
          <stop offset="100%" stopColor="#7a5510" />
        </radialGradient>
        <radialGradient id="landGrad3" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#d4aa70" />
          <stop offset="60%" stopColor="#b08040" />
          <stop offset="100%" stopColor="#8a6020" />
        </radialGradient>
        {/* Ship glow */}
        <filter id="shipGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="routeGlow">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Chest glow */}
        <filter id="chestGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Wave pattern */}
        <pattern id="waves" x="0" y="0" width="12" height="6" patternUnits="userSpaceOnUse">
          <path d="M0,3 Q3,0 6,3 Q9,6 12,3" stroke="#1a6ba0" strokeWidth="0.4" fill="none" opacity="0.4"/>
        </pattern>
        {/* Dotted path */}
        <marker id="arrowhead" markerWidth="3" markerHeight="3" refX="1.5" refY="1.5" orient="auto">
          <circle cx="1.5" cy="1.5" r="1" fill="#f59e0b" opacity="0.8"/>
        </marker>
        {/* Vignette */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="60%" stopColor="transparent"/>
          <stop offset="100%" stopColor="rgba(5,20,40,0.7)"/>
        </radialGradient>
        {/* Treasure glow radial */}
        <radialGradient id="treasureGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="shipWake" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.45"/>
          <stop offset="100%" stopColor="#dbeafe" stopOpacity="0"/>
        </radialGradient>
        {/* Shimmer animation */}
        <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.1">
            <animate attributeName="stopOpacity" values="0.05;0.25;0.05" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.2">
            <animate attributeName="stopOpacity" values="0.1;0.4;0.1" dur="3s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.05">
            <animate attributeName="stopOpacity" values="0.05;0.2;0.05" dur="3s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>
      </defs>

      {/* ── Ocean background ── */}
      <rect x="0" y="0" width="102" height="90" fill="url(#oceanGrad)" />
      <rect x="0" y="0" width="102" height="90" fill="url(#waves)" opacity="0.6"/>

      {/* Ocean texture lines */}
      {[10,20,30,40,50,60,70,80].map(y => (
        <line key={y} x1="0" y1={y} x2="102" y2={y+1} stroke="#1a6ba0" strokeWidth="0.15" opacity="0.2"/>
      ))}

      {/* ── Compass rose (background) ── */}
      <g transform="translate(88,75)" opacity="0.25">
        <circle cx="0" cy="0" r="7" stroke="#c9a96e" strokeWidth="0.4" fill="none"/>
        <circle cx="0" cy="0" r="5" stroke="#c9a96e" strokeWidth="0.2" fill="none"/>
        {[0,45,90,135,180,225,270,315].map(a => (
          <line key={a}
            x1={Math.cos((a-90)*Math.PI/180)*5} y1={Math.sin((a-90)*Math.PI/180)*5}
            x2={Math.cos((a-90)*Math.PI/180)*7} y2={Math.sin((a-90)*Math.PI/180)*7}
            stroke="#c9a96e" strokeWidth="0.3"/>
        ))}
        <polygon points="0,-5 0.8,-2 0,0 -0.8,-2" fill="#e8b84b"/>
        <polygon points="0,5 0.8,2 0,0 -0.8,2" fill="#a07830"/>
        <polygon points="5,0 2,0.8 0,0 2,-0.8" fill="#a07830"/>
        <polygon points="-5,0 -2,0.8 0,0 -2,-0.8" fill="#a07830"/>
        <text x="0" y="-6.5" textAnchor="middle" fontSize="2" fill="#e8b84b" fontWeight="bold">N</text>
      </g>

      {/* ── Main Continent (left side) ── */}
      <path d="M0,28 C7,21 16,17 23,20 C30,23 35,19 39,23 C43,27 41,36 35,42 C29,48 20,50 12,54 C6,57 2,60 0,64 Z"
        fill="url(#landGrad1)" stroke="#7a5510" strokeWidth="0.5"/>
      {/* Forest details on continent */}
      {[[8,32],[12,27],[16,24],[22,22],[26,26]].map(([x,y],i) => (
        <g key={i} transform={`translate(${x},${y})`}>
          <polygon points="0,-2.5 1.5,0.5 -1.5,0.5" fill="#2d5a27" opacity="0.8"/>
          <polygon points="0,-3.5 1,-.5 -1,-.5" fill="#3a7a32" opacity="0.9"/>
        </g>
      ))}
      {/* Mountain on continent */}
      <polygon points="6,44 10,36 14,44" fill="#8a7060" stroke="#6a5040" strokeWidth="0.3"/>
      <polygon points="9,44 13,37 17,44" fill="#9a8070" stroke="#6a5040" strokeWidth="0.3"/>
      <polygon points="10,37 13,35 16,37" fill="white" opacity="0.6"/>

      {/* ── Small island (middle) ── */}
      <ellipse cx="50" cy="67" rx="10.5" ry="6.8" fill="url(#landGrad2)" stroke="#7a5510" strokeWidth="0.4"/>
      <ellipse cx="50" cy="67" rx="8.2" ry="4.8" fill="#b08040" opacity="0.4"/>
      {/* Palm tree */}
      <line x1="50" y1="69" x2="50" y2="63" stroke="#6b4226" strokeWidth="0.6"/>
      <ellipse cx="48" cy="63" rx="3" ry="1.5" fill="#2d7a2a" opacity="0.9" transform="rotate(-20,48,63)"/>
      <ellipse cx="52" cy="63" rx="3" ry="1.5" fill="#3a8a32" opacity="0.9" transform="rotate(20,52,63)"/>
      <ellipse cx="50" cy="62" rx="2.5" ry="1.2" fill="#4a9a40" opacity="0.9"/>
      {/* Coconuts */}
      <circle cx="49" cy="64" r="0.5" fill="#8B4513"/>
      <circle cx="51" cy="64" r="0.5" fill="#8B4513"/>
      {/* Sandy beach ring */}
      <ellipse cx="50" cy="69.8" rx="11.5" ry="2.9" fill="#d4aa70" opacity="0.35"/>

      {/* ── Treasure island (right side) ── */}
      <path d="M76,16 C82,10 93,8 100,13 C107,18 107,31 101,39 C95,47 85,50 78,47 C71,44 66,35 69,25 C70,21 72,18 76,16 Z"
        fill="url(#landGrad3)" stroke="#7a5510" strokeWidth="0.5"/>
      {/* Jungle on treasure island */}
      {[[82,22],[86,18],[90,16],[94,16],[88,26]].map(([x,y],i) => (
        <g key={i} transform={`translate(${x},${y})`}>
          <polygon points="0,-3 2,1 -2,1" fill="#1a4a18" opacity="0.85"/>
          <polygon points="0,-4 1.5,-0.5 -1.5,-0.5" fill="#2a6a20" opacity="0.9"/>
        </g>
      ))}
      {/* Treasure chest glow */}
      <circle cx="90" cy="30" r="6.5" fill="url(#treasureGlow)">
        <animate attributeName="r" values="5.4;8;5.4" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
      </circle>
      {/* Treasure chest */}
      <g transform="translate(87,26)" filter="url(#chestGlow)">
        <rect x="0" y="2" width="7.5" height="4.9" rx="0.6" fill="#8B4513" stroke="#4a2000" strokeWidth="0.3"/>
        <path d="M0,2 Q3.75,-0.5 7.5,2" fill="#a05020" stroke="#4a2000" strokeWidth="0.3"/>
        <rect x="2.8" y="2.7" width="1.9" height="1.8" rx="0.3" fill="#fbbf24" stroke="#b8860b" strokeWidth="0.2"/>
        <line x1="0" y1="4.5" x2="7.5" y2="4.5" stroke="#4a2000" strokeWidth="0.2"/>
        {/* Gold spill */}
        {[[1.2,1.5],[5,1.8],[3.2,1.1],[6.1,1.4]].map(([cx,cy],i) => (
          <circle key={i} cx={cx} cy={cy} r="0.4" fill="#fbbf24" opacity="0.8"/>
        ))}
      </g>
      {/* X marks the spot */}
      <g transform="translate(86,35)" opacity="0.95">
        <line x1="0" y1="0" x2="3.7" y2="3.7" stroke="#cc0000" strokeWidth="1" strokeLinecap="round"/>
        <line x1="3.7" y1="0" x2="0" y2="3.7" stroke="#cc0000" strokeWidth="1" strokeLinecap="round"/>
      </g>

      {/* ── Decorative rocks / reefs ── */}
      {[[38,40],[40,42],[42,40]].map(([x,y],i) => (
        <ellipse key={i} cx={x} cy={y} rx="1.2" ry="0.7" fill="#556b5a" opacity="0.7"/>
      ))}
      {[[60,30],[62,28]].map(([x,y],i) => (
        <ellipse key={i} cx={x} cy={y} rx="1" ry="0.6" fill="#446b55" opacity="0.6"/>
      ))}

      {/* ── Navigation route (dashed) ── */}
      <path
        d={pathGlowD}
        stroke="#fde68a"
        strokeWidth="1.9"
        fill="none"
        opacity="0.18"
        strokeLinecap="round"
        filter="url(#routeGlow)"
      />
      {/* Completed path - bright gold */}
      <path
        d={pathD}
        stroke="#fbbf24"
        strokeWidth="0.7"
        fill="none"
        strokeDasharray="3 2"
        strokeDashoffset="0"
        opacity="0.95"
        strokeLinecap="round"
        style={{
          strokeDashoffset: `${(1 - progress / 100) * 200}`,
          clipPath: `inset(0 ${100 - progress}% 0 0)`,
        }}
      />
      {/* Remaining path - dim */}
      <path
        d={pathD}
        stroke="#c9a96e"
        strokeWidth="0.5"
        fill="none"
        strokeDasharray="2 3"
        opacity="0.35"
        strokeLinecap="round"
      />

      {/* Waypoint dots along path */}
      {[0.2, 0.4, 0.6, 0.8].map((frac, i) => {
        const fi = Math.floor(frac * (pts.length - 1));
        const ff = frac * (pts.length - 1) - fi;
        const wx = pts[fi][0] + (pts[fi+1]?.[0] - pts[fi][0]) * ff;
        const wy = pts[fi][1] + (pts[fi+1]?.[1] - pts[fi][1]) * ff;
        const passed = progress >= frac * 100;
        return (
          <g key={i}>
            <circle cx={wx} cy={wy} r="1.2" fill={passed ? "#fbbf24" : "#7a5510"} opacity={passed ? 0.9 : 0.5}/>
            {passed && <circle cx={wx} cy={wy} r="2" fill="#fbbf24" opacity="0.2"/>}
          </g>
        );
      })}

      {/* ── Vignette overlay ── */}
      <rect x="0" y="0" width="102" height="90" fill="url(#vignette)"/>

      {/* ── Ship (player marker) ── */}
      <g transform={`translate(${sx}, ${sy})`} filter="url(#shipGlow)">
        {/* Wake effect */}
        <ellipse cx="-3.6" cy="0.7" rx="4.2" ry="1.2" fill="url(#shipWake)" opacity="0.65"/>
        <ellipse cx="-2" cy="0.5" rx="2.5" ry="0.8" fill="white" opacity="0.2"/>
        {/* Ship body */}
        <path d="M-2.5,0.5 Q0,-1.5 2.5,0.5 L2,2 Q0,2.5 -2,2 Z" fill="#c8a060" stroke="#8b6914" strokeWidth="0.3"/>
        {/* Hull */}
        <path d="M-2,1.8 Q0,2.5 2,1.8 L1.5,2.5 Q0,3 -1.5,2.5 Z" fill="#8B4513"/>
        {/* Mast */}
        <line x1="0" y1="0.5" x2="0" y2="-3.5" stroke="#6b4226" strokeWidth="0.4"/>
        {/* Sail */}
        <path d="M0,-3.5 Q2.5,-2 2,-0.5 L0,0 Z" fill="white" opacity="0.95" stroke="#d4aa70" strokeWidth="0.15"/>
        <path d="M0,-3.5 Q-1.2,-2 -1.2,-0.8 L0,0 Z" fill="#e8d5a0" opacity="0.8"/>
        {/* Pirate flag */}
        <rect x="0" y="-4.2" width="2" height="1.3" fill="#1a1a1a" rx="0.1"/>
        <circle cx="0.6" cy="-3.6" r="0.35" fill="white"/>
        <line x1="0.3" y1="-3.2" x2="0.9" y2="-3.2" stroke="white" strokeWidth="0.2"/>
        {/* Glow ring */}
        <circle cx="0" cy="0.5" r="3.5" fill="none" stroke="#fbbf24" strokeWidth="0.4" opacity="0.6">
          <animate attributeName="r" values="3;4.5;3" dur="1.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <animateTransform attributeName="transform" type="rotate" values="-3 0 0.5;3 0 0.5;-3 0 0.5" dur="3.8s" repeatCount="indefinite"/>
      </g>

      {/* ── START marker ── */}
      <g transform="translate(9,72)">
        <rect x="-5" y="-3" width="10" height="6" rx="1.5" fill="#16a34a" opacity="0.9"/>
        <text x="0" y="1.2" textAnchor="middle" fontSize="2.5" fill="white" fontWeight="bold">START</text>
      </g>

      {/* ── Grid lines (map aesthetic) ── */}
      {[20,40,60,80].map(x => (
        <line key={`vg${x}`} x1={x} y1="0" x2={x} y2="90" stroke="#1a6ba0" strokeWidth="0.1" opacity="0.15"/>
      ))}
      {[20,40,60,80].map(y => (
        <line key={`hg${y}`} x1="0" y1={y} x2="102" y2={y} stroke="#1a6ba0" strokeWidth="0.1" opacity="0.15"/>
      ))}

      {/* ── Decorative border ── */}
      <rect x="0.5" y="0.5" width="101" height="89" rx="2"
        fill="none" stroke="#c9a96e" strokeWidth="1" opacity="0.5"/>
      <rect x="1.5" y="1.5" width="99" height="87" rx="1.5"
        fill="none" stroke="#8b6914" strokeWidth="0.3" opacity="0.4"/>

      {/* ── Sea monsters (decorative) ── */}
      <g transform="translate(68,62)" opacity="0.35">
        <path d="M0,0 Q2,-2 4,0 Q6,2 8,0" stroke="#1a4a6a" strokeWidth="0.8" fill="none"/>
        <circle cx="0.5" cy="-0.5" r="0.4" fill="#1a4a6a"/>
      </g>

      {/* Shimmer overlay */}
      <rect x="0" y="0" width="102" height="90" fill="url(#shimmer)" opacity="0.5"/>
    </svg>
  );
}

// pts for ship position calculation - needs to be accessible in component
// const pts: [number,number][] = [
//   [9,72],[18,58],[26,78],[35,65],[44,52],[52,70],[62,55],[70,43],[80,48],[93,30]
// ];

export default function TreasureHunt() {
  const navigate = useNavigate();
  const {
    state: { user },
  } = useContextPro();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const skipInitialRemoteSaveRef = useRef(true);

  const [phase, setPhase] = useState<Phase>("intro");
  const [questionBank, setQuestionBank] = useState<Riddle[]>(TREASURE_RIDDLES);
  const [riddles, setRiddles] = useState<Riddle[]>(() => randomizeRiddles(TREASURE_RIDDLES));
  const [draft, setDraft] = useState<RiddleDraft>(EMPTY_DRAFT);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [questionError, setQuestionError] = useState("");
  const [remoteLoaded, setRemoteLoaded] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState<number>(1);
  const [aiDifficulty, setAiDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("medium");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [pathIndex, setPathIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(SECONDS_TOTAL);
  const [questionSeconds, setQuestionSeconds] = useState(SECONDS_PER_QUESTION);
  const [locked, setLocked] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [doubleReward, setDoubleReward] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showAnswerEffect, setShowAnswerEffect] = useState(false);
  const [answerResult, setAnswerResult] = useState<"correct" | "wrong" | null>(null);
  const { countdownValue, countdownVisible, runStartCountdown } = useGameStartCountdown();

  const canManageQuestions = hasAnyRole(user, ["teacher", "admin"]);
  const hasGeminiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY?.trim());
  const current = riddles[questionIndex];
  const targetPath = Math.max(1, riddles.length - 1);
  const minScoreToWin = Math.max(900, riddles.length * STEP_SCORE_REQUIREMENT);
  const won = pathIndex >= targetPath && score >= minScoreToWin;
  // const progressPct = riddles.length > 0 ? Math.round(((questionIndex + 1) / riddles.length) * 100) : 0;
  const pathProgressPct = targetPath > 0 ? Math.round((pathIndex / targetPath) * 100) : 0;

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const remote = await fetchGameQuestions<Riddle>(TREASURE_HUNT_GAME_KEY);
      if (!alive) return;
      if (remote && remote.length > 0) {
        setQuestionBank(remote);
        setRiddles(randomizeRiddles(remote));
      }
      setRemoteLoaded(true);
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!remoteLoaded) return;
    if (skipInitialRemoteSaveRef.current) { skipInitialRemoteSaveRef.current = false; return; }
    const t = window.setTimeout(() => void saveGameQuestions<Riddle>(TREASURE_HUNT_GAME_KEY, questionBank), 500);
    return () => window.clearTimeout(t);
  }, [questionBank, remoteLoaded]);

  useEffect(() => {
    const audio = new Audio(pirateOrchestra);
    audio.loop = true; audio.volume = 0.35;
    audioRef.current = audio;
    return () => { audio.pause(); audio.currentTime = 0; audioRef.current = null; };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (phase === "play") { void audioRef.current.play().catch(() => {}); return; }
    audioRef.current.pause(); audioRef.current.currentTime = 0;
  }, [phase]);

  useEffect(() => {
    if (phase !== "play") return;
    if (secondsLeft <= 0) return setPhase("finish");
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, secondsLeft]);

  useEffect(() => {
    if (phase !== "play" || locked || questionSeconds <= 0) return;
    const t = window.setTimeout(() => setQuestionSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phase, questionSeconds, locked]);

  useEffect(() => {
    if (phase !== "play") return;
    setLocked(false); setSelected(null); setShowHint(false);
    setQuestionSeconds(SECONDS_PER_QUESTION);
    setDoubleReward(Math.random() < 0.25);
  }, [phase, questionIndex]);

  const resetDraft = () => { setDraft(EMPTY_DRAFT); setEditingIdx(null); setQuestionError(""); };

  const generateWithAi = async () => {
    if (isGeneratingAi) return;
    setQuestionError("");
    setIsGeneratingAi(true);
    try {
      const generated = await generateTreasureHuntRiddles({
        topic: aiTopic,
        count: aiCount,
        difficulty: aiDifficulty,
      });
      const generatedItems: Riddle[] = generated.map((item, index) => ({
        id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
        title: item.title,
        story: item.story,
        question: item.question,
        options: item.options,
        answerIndex: item.answerIndex,
        hint: item.hint,
        reward: item.reward,
      }));
      setQuestionBank(generatedItems);
      setRiddles(randomizeRiddles(generatedItems));
      setEditingIdx(null);
      setDraft(EMPTY_DRAFT);
      setToast(`${generatedItems.length} ta ${AI_DIFFICULTY_OPTIONS.find((item) => item.value === aiDifficulty)?.label.toLowerCase()} savol yangilandi`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI savol yaratib bo'lmadi.";
      setQuestionError(message);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const saveRiddle = () => {
    const title = draft.title.trim();
    const story = draft.story.trim();
    const question = draft.question.trim();
    const options = draft.options.map((o) => o.trim()) as [string, string, string, string];
    const hint = draft.hint.trim();
    const reward = Number(draft.reward);
    if (!title || !story || !question || !hint) return setQuestionError("Barcha maydonlarni to'ldiring.");
    if (options.some((o) => !o)) return setQuestionError("4 ta variant kiriting.");
    if (new Set(options.map((o) => o.toLowerCase())).size < 4) return setQuestionError("Variantlar turlicha bo'lsin.");
    if (!Number.isFinite(reward) || reward < 10) return setQuestionError("Mukofot kamida 10 bo'lsin.");
    const item: Riddle = {
      id: editingIdx !== null ? questionBank[editingIdx]?.id ?? `${Date.now()}` : `${Date.now()}`,
      title, story, question, options, answerIndex: draft.answerIndex, hint, reward: Math.round(reward),
    };
    if (editingIdx !== null) {
      setQuestionBank((prev) => prev.map((r, idx) => (idx === editingIdx ? item : r)));
      setToast("Savol yangilandi");
      return resetDraft();
    }
    setQuestionBank((prev) => [...prev, item]);
    setToast("Savol qo'shildi");
    resetDraft();
  };

  const start = () => {
    if (questionBank.length < 1) return setQuestionError("Kamida 1 ta savol qo'shing.");
    setRiddles(randomizeRiddles(questionBank));
    setQuestionError("");
    setPhase("play");
    setQuestionIndex(0); setPathIndex(0); setScore(0);
    setSecondsLeft(SECONDS_TOTAL); setQuestionSeconds(SECONDS_PER_QUESTION);
    setLocked(false); setSelected(null); setShowHint(false);
    setDoubleReward(Math.random() < 0.25);
  };

  const handleStart = () => runStartCountdown(start);

  const goNext = () => {
    if (questionIndex + 1 >= riddles.length) return setPhase("finish");
    setQuestionIndex((v) => v + 1);
  };

  const onAnswer = (idx: number) => {
    if (phase !== "play" || locked || !current) return;
    setLocked(true); setSelected(idx);
    const correct = idx === current.answerIndex;
    setAnswerResult(correct ? "correct" : "wrong");
    setShowAnswerEffect(true);
    if (correct) {
      const speedBonus = Math.round(clamp(questionSeconds, 0, SECONDS_PER_QUESTION) * 1.5);
      const gain = (current.reward + speedBonus) * (doubleReward ? 2 : 1);
      const nextScore = score + gain;
      setScore(nextScore);
      setPathIndex((prev) => (nextScore >= (prev + 1) * STEP_SCORE_REQUIREMENT ? Math.min(targetPath, prev + 1) : prev));
    } else {
      setScore((s) => Math.max(0, s - WRONG_PENALTY));
      setPathIndex((p) => Math.max(0, p - 1));
    }
    setTimeout(() => { setShowAnswerEffect(false); setAnswerResult(null); goNext(); }, 1200);
  };

  const grade = useMemo(() => {
    if (score >= 1300) return { name: "Afsonaviy Pirat", color: "from-amber-400 to-yellow-600", icon: FaCrown };
    if (score >= 950) return { name: "Xazina Ovchisi", color: "from-blue-400 to-cyan-600", icon: GiTreasureMap };
    if (score >= 700) return { name: "Dengiz Bo'risi", color: "from-emerald-400 to-teal-600", icon: FaShip };
    return { name: "Jake Varabey", color: "from-stone-400 to-stone-600", icon: GiPirateFlag };
  }, [score]);

  // ── Timer ring ──
  const timerPct = (questionSeconds / SECONDS_PER_QUESTION) * 100;
  const timerColor = questionSeconds <= 10 ? "#ef4444" : questionSeconds <= 20 ? "#f59e0b" : "#22c55e";

  return (
    <div
      className="relative min-h-screen text-white"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >
      {/* ── Atmospheric background ── */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#08151f] via-[#0d1f2d] to-[#060e16]" />
        {/* Animated stars */}
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
        {/* Sea bottom glow */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-amber-900/15 to-transparent" />
        {/* Fog layer */}
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(ellipse at 20% 80%, rgba(30,60,90,0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(20,50,80,0.3) 0%, transparent 50%)"
          }}
        />
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2">
          <div className="relative rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-bold text-amber-950 shadow-2xl shadow-amber-500/40">
            <div className="absolute inset-0 rounded-full bg-white/20 blur-sm" />
            <span className="relative">{toast}</span>
          </div>
        </div>
      )}

      {/* ── INTRO PHASE ── */}
      {phase === "intro" && (
        <div className="space-y-6 p-4">
          {canManageQuestions && (
            <div className="relative overflow-hidden rounded-3xl border border-amber-600/30 bg-gradient-to-br from-amber-950/60 to-stone-900/60 p-6 shadow-2xl backdrop-blur-sm">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
              <h3 className="mb-5 flex items-center gap-2 text-xl font-black tracking-wider text-amber-300">
                <GiPirateFlag className="text-2xl" />O'QITUVCHI PANELI
              </h3>
              <div className="mb-3 grid gap-2 md:grid-cols-[1fr_auto]">
                <div className="grid gap-2 md:grid-cols-[1fr_140px_140px]">
                  <input
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    className="rounded-xl border border-cyan-500/30 bg-black/40 px-4 py-3 text-cyan-100 outline-none transition-all placeholder-cyan-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                    placeholder="AI mavzusi (masalan: geografiya)"
                  />
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(Number(e.target.value))}
                    className="rounded-xl border border-cyan-500/30 bg-slate-950 px-4 py-3 text-cyan-100 outline-none focus:border-cyan-400"
                  >
                    {AI_GENERATE_OPTIONS.map((count) => (
                      <option key={count} value={count} className="bg-slate-950">
                        {count} ta savol
                      </option>
                    ))}
                  </select>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value as "easy" | "medium" | "hard" | "mixed")}
                    className="rounded-xl border border-cyan-500/30 bg-slate-950 px-4 py-3 text-cyan-100 outline-none focus:border-cyan-400"
                  >
                    {AI_DIFFICULTY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-slate-950">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => void generateWithAi()}
                  disabled={!hasGeminiKey || isGeneratingAi}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 font-bold text-slate-950 shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50 hover:shadow-cyan-500/40"
                >
                  {isGeneratingAi ? `${aiCount} ta yaratilmoqda...` : `AI bilan ${aiCount} ta yangilash`}
                </button>
              </div>
              <p className="mb-3 text-xs text-cyan-200/80">
                AI yaratganda hozirgi savollar o'chadi va o'rniga yangi {aiCount} ta {AI_DIFFICULTY_OPTIONS.find((item) => item.value === aiDifficulty)?.label.toLowerCase()} savol yoziladi.
              </p>
              {!hasGeminiKey && (
                <p className="mb-3 text-xs text-rose-300">`.env` ichida `VITE_GEMINI_API_KEY` ni to'ldiring va dev serverni qayta ishga tushiring.</p>
              )}
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { val: draft.title, ph: "📝 Sarlavha", key: "title" },
                  { val: draft.story, ph: "📖 Hikoya", key: "story" },
                ].map(({ val, ph, key }) => (
                  <input key={key} value={val}
                    onChange={(e) => setDraft((p) => ({ ...p, [key]: e.target.value }))}
                    className="rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-amber-100 outline-none transition-all placeholder-amber-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
                    placeholder={ph} />
                ))}
                <input value={draft.question}
                  onChange={(e) => setDraft((p) => ({ ...p, question: e.target.value }))}
                  className="rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-amber-100 outline-none transition-all placeholder-amber-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 md:col-span-2"
                  placeholder="❓ Savol" />
                {draft.options.map((o, i) => (
                  <input key={i} value={o}
                    onChange={(e) => setDraft((p) => {
                      const next = [...p.options] as [string,string,string,string];
                      next[i] = e.target.value;
                      return { ...p, options: next };
                    })}
                    className="rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-amber-100 outline-none transition-all placeholder-amber-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
                    placeholder={`${i + 1}-variant`} />
                ))}
                <select value={draft.answerIndex}
                  onChange={(e) => setDraft((p) => ({ ...p, answerIndex: Number(e.target.value) }))}
                  className="rounded-xl border border-amber-600/30 bg-stone-900 px-4 py-3 text-amber-100 outline-none focus:border-amber-400">
                  {[0,1,2,3].map(i => <option key={i} value={i} className="bg-stone-900">✅ To'g'ri javob: {i+1}</option>)}
                </select>
                <input value={draft.reward}
                  onChange={(e) => setDraft((p) => ({ ...p, reward: e.target.value }))}
                  className="rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-amber-100 outline-none placeholder-amber-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
                  placeholder="💰 Ball (masalan: 120)" />
                <input value={draft.hint}
                  onChange={(e) => setDraft((p) => ({ ...p, hint: e.target.value }))}
                  className="rounded-xl border border-amber-600/30 bg-black/40 px-4 py-3 text-amber-100 outline-none transition-all placeholder-amber-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 md:col-span-2"
                  placeholder="💡 Maslahat (hint)" />
              </div>
              {questionError && <p className="mt-2 text-sm text-rose-400">{questionError}</p>}
              <div className="mt-4 flex gap-3">
                <button onClick={saveRiddle}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-bold text-amber-950 shadow-lg transition-all hover:shadow-amber-500/40 hover:scale-[1.02]">
                  {editingIdx !== null ? <FaEdit /> : <FaPlus />}
                  {editingIdx !== null ? "Saqlash" : "Qo'shish"}
                </button>
                {editingIdx !== null && (
                  <button onClick={resetDraft}
                    className="rounded-xl border border-amber-500/40 px-6 py-3 font-bold text-amber-300 transition-all hover:bg-amber-500/10">
                    Bekor
                  </button>
                )}
              </div>
              <div className="mt-5 space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-widest text-amber-500">Savollar</h4>
                {questionBank.map((r, idx) => (
                  <div key={`${r.id}-${idx}`}
                    className="group flex items-center justify-between rounded-xl border border-amber-700/20 bg-black/25 px-3 py-2 transition-all hover:border-amber-600/40">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-800/50 text-xs font-bold text-amber-300">{idx + 1}</span>
                      <p className="truncate text-sm text-amber-100/80">{r.question}</p>
                    </div>
                    <div className="flex gap-2 opacity-60 transition-opacity group-hover:opacity-100">
                      <button onClick={() => { setEditingIdx(idx); setDraft({ title: r.title, story: r.story, question: r.question, options: [...r.options], answerIndex: r.answerIndex, hint: r.hint, reward: String(r.reward) }); }}
                        className="rounded-lg bg-cyan-700/30 p-2 hover:bg-cyan-600/50"><FaEdit size={12}/></button>
                      <button onClick={() => setQuestionBank((prev) => prev.filter((_, i) => i !== idx))}
                        className="rounded-lg bg-rose-700/30 p-2 hover:bg-rose-600/50"><FaTrash size={12}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hero card */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-600/30 bg-gradient-to-br from-amber-950/50 to-stone-900/50 p-8 shadow-2xl backdrop-blur-sm">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-yellow-600/10 blur-3xl" />

            {/* Decorative map preview — LARGE */}
            <div className="relative mb-6 overflow-hidden rounded-3xl border-2 border-amber-600/50 shadow-2xl shadow-amber-900/40" style={{ height: "400px" }}>
              <TreasureMapSVG progress={8} />
              {/* Bottom gradient title */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-6 pb-5 pt-12 text-center">
                <p className="text-2xl font-black tracking-[0.18em] text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
                  ☠ XAZINA OVCHILARI ☠
                </p>
                <p className="mt-1 text-xs tracking-widest text-amber-500/80">Xazinani top!</p>
              </div>
              {/* Corner badges */}
              <div className="absolute left-4 top-4 rounded-full border border-amber-600/40 bg-black/60 px-3 py-1.5 text-lg backdrop-blur-sm">🦜</div>
              <div className="absolute right-4 top-4 rounded-full border border-amber-600/40 bg-black/60 px-3 py-1.5 text-lg backdrop-blur-sm">⚓</div>
            </div>

            <div className="relative z-10 mb-6 grid gap-4 sm:grid-cols-3">
              {[
                { icon: "⚔️", title: "Qanday o'ynaladi?", text: "Har to'g'ri javob kemangizni xazinaga yaqinlashtiradi. Xato javob orqaga qaytaradi." },
                { icon: "💰", title: "Ballar", text: `To'g'ri: +ball+vaqt bonusi\nXato: -${WRONG_PENALTY} ball\nHint: -${HINT_PENALTY} ball` },
                { icon: "🏆", title: "G'alaba", text: `${minScoreToWin}+ ball yig'ib, xazinaga yeting!` },
              ].map(({ icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-amber-700/20 bg-black/30 p-4 backdrop-blur-sm">
                  <div className="mb-2 text-2xl">{icon}</div>
                  <h4 className="mb-1 font-bold text-amber-400 text-sm">{title}</h4>
                  <p className="text-xs text-amber-100/70 leading-relaxed whitespace-pre-line">{text}</p>
                </div>
              ))}
            </div>

            <button onClick={handleStart}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 py-5 text-xl font-black tracking-wider text-amber-950 shadow-2xl shadow-amber-500/30 transition-all hover:shadow-amber-500/50 hover:scale-[1.01]">
              <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
              <span className="relative flex items-center justify-center gap-4">
                <GiAnchor className="text-2xl" />
                ☠️ SARGUZASHTNI BOSHLASH ☠️
                <FaShip className="text-2xl" />
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ── PLAY PHASE ── */}
      {phase === "play" && current && (
        <div className="flex min-h-screen flex-col">
          {/* ── Top status bar ── */}
          <div className="sticky top-0 z-30 border-b border-amber-800/30 bg-slate-950/90 px-4 py-2 backdrop-blur-md shadow-lg">
            <div className="mx-auto flex max-w-7xl items-center gap-3">
              {/* Savol */}
              <div className="rounded-xl border border-amber-700/30 bg-black/50 px-3 py-1.5 text-center shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Savol</p>
                <p className="text-base font-black text-amber-300">{questionIndex+1}/{riddles.length}</p>
              </div>

              {/* Progress */}
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[10px] text-amber-700">
                  <span>Sayohat</span><span>{pathProgressPct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-yellow-400 transition-all duration-500 shadow-sm shadow-amber-500/50"
                    style={{ width: `${pathProgressPct}%` }} />
                </div>
              </div>

              {/* Score */}
              <div className="rounded-xl border border-emerald-700/30 bg-black/50 px-3 py-1.5 text-center shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Ball</p>
                <p className="text-base font-black text-emerald-300">{score}</p>
              </div>

              {/* Total timer */}
              <div className={`rounded-xl border px-3 py-1.5 text-center shrink-0 ${secondsLeft < 60 ? "border-red-700/50 bg-red-950/40" : "border-amber-700/30 bg-black/50"}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Vaqt</p>
                <p className={`text-base font-black ${secondsLeft < 60 ? "text-red-400" : "text-amber-300"}`}>{formatTime(secondsLeft)}</p>
              </div>

              {/* Question timer ring */}
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#1e2a38" strokeWidth="3"/>
                  <circle cx="18" cy="18" r="15" fill="none" stroke={timerColor} strokeWidth="3"
                    strokeDasharray={`${2*Math.PI*15}`}
                    strokeDashoffset={`${2*Math.PI*15*(1-timerPct/100)}`}
                    strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.9s linear" }}/>
                </svg>
                <span className="relative text-xs font-black text-white">{questionSeconds}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4">
            <div className="mx-auto grid max-w-7xl gap-4 xl:grid-cols-[1.45fr_1fr] xl:items-start">
              <div className="space-y-4">
                {/* ── TREASURE MAP ── */}
                <div className="relative overflow-hidden rounded-[32px] border-2 border-amber-700/50 bg-gradient-to-br from-slate-950/70 via-sky-950/40 to-amber-950/20 p-3 shadow-2xl shadow-amber-900/30">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.16),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_30%)]" />
                  <div
                    className="relative overflow-hidden rounded-[26px] border border-amber-500/30"
                    style={{ height: "min(68vh, 620px)" }}
                  >
                    <TreasureMapSVG progress={pathProgressPct} />

                    <div className="absolute left-4 top-4">
                      <div className="rounded-2xl border border-amber-600/50 bg-black/55 px-5 py-3 shadow-lg backdrop-blur-md">
                        <p className="text-[11px] font-bold tracking-[0.28em] text-amber-500/80">TREASURE HUNT</p>
                        <p className="text-lg font-black tracking-[0.16em] text-amber-300">☠ XAZINA XARITASI ☠</p>
                      </div>
                    </div>

                    <div className="absolute right-4 top-4 flex flex-wrap justify-end gap-2">
                      <div className="rounded-full border border-amber-500/40 bg-black/50 px-3 py-1.5 text-xs font-bold text-amber-200 backdrop-blur-md">
                        Sayohat: {pathProgressPct}%
                      </div>
                      <div className="rounded-full border border-emerald-500/40 bg-black/50 px-3 py-1.5 text-xs font-bold text-emerald-300 backdrop-blur-md">
                        Ball: {score}
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
                      <div className="max-w-md rounded-2xl border border-sky-400/20 bg-slate-950/55 px-4 py-3 backdrop-blur-md">
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-sky-300/80">Yo'nalish</p>
                        <p className="mt-1 text-sm text-slate-100/90">
                          Kema xazinaga yaqinlashmoqda. Har to'g'ri javob sayohatni oldinga suradi.
                        </p>
                      </div>

                      {doubleReward && (
                        <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 font-bold text-amber-950 shadow-lg text-sm">
                          <FaBolt /> BONUS x2
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setPhase("finish")}
                  className="w-full rounded-2xl border border-red-800/40 bg-red-950/40 py-3 text-sm font-bold text-red-400 backdrop-blur-sm transition-all hover:bg-red-900/50"
                >
                  <IoMdNuclear className="mr-2 inline text-base" />
                  Sarguzashtni yakunlash
                </button>
              </div>

              {/* ── Question card ── */}
              <div className="relative overflow-hidden rounded-[32px] border border-amber-700/30 bg-gradient-to-br from-amber-950/70 via-stone-950/80 to-black/80 p-5 shadow-xl backdrop-blur-sm xl:sticky xl:top-20">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-amber-500/10 to-transparent" />

                <div className="relative mb-4 flex items-center justify-between gap-3 border-b border-amber-700/20 pb-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-500/80">Joriy vazifa</p>
                    <p className="mt-1 text-lg font-black text-amber-200">Savolga javob bering va kemani oldinga suring</p>
                  </div>
                  <div className="rounded-2xl border border-amber-600/30 bg-amber-950/40 px-4 py-2 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">Qolgan vaqt</p>
                    <p className="text-2xl font-black text-white">{questionSeconds}s</p>
                  </div>
                </div>

                <div className="relative mb-4 flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex rounded-full border border-amber-700/40 bg-amber-900/50 px-3 py-1 text-sm font-bold text-amber-300">
                      {current.title}
                    </span>
                    <p className="mt-3 text-sm italic leading-relaxed text-amber-200/70">{current.story}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => { if (!locked && !showHint) { setShowHint(true); setScore((s) => Math.max(0, s - HINT_PENALTY)); } }}
                      disabled={locked || showHint}
                      className="flex items-center gap-1.5 rounded-full border border-amber-600/40 bg-amber-900/40 px-3 py-1.5 text-xs font-bold text-amber-300 transition-all hover:bg-amber-800/60 disabled:opacity-40"
                    >
                      <FaLightbulb className="text-yellow-400" /> Hint (-{HINT_PENALTY})
                    </button>
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                      <MdOutlineTimer />{questionSeconds}s
                    </div>
                  </div>
                </div>

                <h3 className="relative mb-5 text-2xl font-black leading-tight text-white md:text-3xl">
                  {current.question}
                </h3>

                {showHint && (
                  <div className="mb-4 rounded-2xl border border-amber-600/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                    💡 {current.hint}
                  </div>
                )}

                <div className="grid gap-3">
                  {current.options.map((opt, i) => {
                    const isSelected = selected === i;
                    const isCorrect = i === current.answerIndex;
                    const showResult = locked && selected !== null;
                    return (
                      <button
                        key={i}
                        onClick={() => onAnswer(i)}
                        disabled={locked}
                        className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-left font-bold transition-all min-h-[78px] ${
                          showResult && isCorrect
                            ? "border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/20 scale-[1.02]"
                          : showResult && isSelected && !isCorrect
                              ? "border-rose-400 bg-rose-500/20 shadow-lg shadow-rose-500/20"
                              : "border-amber-700/40 bg-black/30 text-amber-100 hover:border-amber-500/60 hover:bg-amber-900/30 hover:scale-[1.02]"
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <div className="relative flex items-center justify-between gap-2">
                          <span className="flex items-center gap-3">
                            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black border ${
                              showResult && isCorrect
                                ? "bg-emerald-500 border-emerald-400 text-white"
                                : showResult && isSelected && !isCorrect
                                  ? "bg-rose-500 border-rose-400 text-white"
                                  : "border-amber-600/40 bg-amber-900/40 text-amber-300"
                            }`}>{String.fromCharCode(65 + i)}</span>
                            <span className="text-base md:text-lg">{opt}</span>
                          </span>
                          {showResult && isCorrect && <FaCheckCircle className="shrink-0 text-xl text-emerald-400" />}
                          {showResult && isSelected && !isCorrect && <FaTimesCircle className="shrink-0 text-xl text-rose-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Answer flash overlay ── */}
      {showAnswerEffect && answerResult && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className={`flex h-32 w-32 items-center justify-center rounded-full border-4 text-5xl font-black shadow-2xl ${
            answerResult === "correct"
              ? "border-emerald-400 bg-emerald-500/30 text-emerald-300 shadow-emerald-500/50"
              : "border-rose-400 bg-rose-500/30 text-rose-300 shadow-rose-500/50"
          }`}>
            {answerResult === "correct" ? "✓" : "✗"}
          </div>
        </div>
      )}

      {/* ── FINISH PHASE ── */}
      {phase === "finish" && (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-600/30 bg-gradient-to-br from-amber-950/70 to-stone-900/70 p-8 text-center shadow-2xl backdrop-blur-sm">
            {won && <Confetti mode="boom" particleCount={120} effectCount={2} x={0.5} y={0.35} colors={["#fbbf24","#f59e0b","#10b981","#3b82f6"]} />}
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-yellow-600/10 blur-3xl" />

            <div className="mb-5 text-8xl drop-shadow-2xl">
              {won ? "🏆" : "☠️"}
            </div>

            {/* Mini map preview on finish */}
            <div className="mb-5 mx-auto h-32 w-full max-w-sm overflow-hidden rounded-2xl border border-amber-700/40 shadow-xl">
              <TreasureMapSVG progress={pathProgressPct} />
            </div>

            <h2 className="mb-4 text-3xl font-black tracking-wide text-amber-300">
              {won ? "🏆 XAZINA TOPILDI! 🏆" : "☠️ MAG'LUB BO'LDINGIZ ☠️"}
            </h2>

            <div className="mb-6 space-y-3">
              <p className="text-2xl font-bold">
                Ball: <span className="text-amber-400">{score}</span>
                <span className="ml-2 text-sm text-amber-700">/ {minScoreToWin} kerak</span>
              </p>
              <div className={`inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r ${grade.color} px-5 py-3 shadow-xl`}>
                <grade.icon className="text-3xl text-white" />
                <span className="text-xl font-black text-white">{grade.name}</span>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button onClick={handleStart}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-3.5 font-black text-amber-950 shadow-xl transition-all hover:scale-[1.03] hover:shadow-amber-500/40">
                <FaRedo /> Yana o'yna
              </button>
              <button onClick={() => navigate("/games")}
                className="flex items-center justify-center gap-2 rounded-2xl border border-amber-600/40 bg-black/30 px-8 py-3.5 font-bold text-amber-300 backdrop-blur-sm transition-all hover:bg-amber-900/30">
                <FaMapMarkedAlt /> O'yinlar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Countdown Overlay ── */}
      {countdownVisible && countdownValue !== null && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center" style={{ pointerEvents: "all" }}>
          {/* Dark backdrop */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          {/* Countdown content */}
          <div className="relative flex flex-col items-center gap-6">
            {/* Animated rings */}
            <div className="relative flex items-center justify-center">
              <div className="absolute h-48 w-48 rounded-full border-4 border-amber-400/20" />
              <div className="absolute h-40 w-40 rounded-full border-2 border-amber-400/40" style={{ animation: "spin 3s linear infinite" }} />
              {/* Main circle */}
              <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-amber-400 bg-gradient-to-br from-amber-900/80 to-black/80 shadow-2xl shadow-amber-500/50 backdrop-blur-md">
                <span
                  className="font-black text-amber-300"
                  style={{
                    fontSize: "72px",
                    lineHeight: 1,
                    textShadow: "0 0 30px rgba(251,191,36,0.8), 0 0 60px rgba(251,191,36,0.4)",
                    fontFamily: "Georgia, serif",
                  }}
                >
                  {countdownValue}
                </span>
              </div>
            </div>
            <div className="rounded-full border border-amber-600/40 bg-black/60 px-6 py-2 backdrop-blur-sm">
              <p className="font-black tracking-[0.2em] text-amber-400" style={{ fontSize: "14px" }}>
                ☠ BOSHLANMOQDA ☠
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
