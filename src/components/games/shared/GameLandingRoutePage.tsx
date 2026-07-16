import type { IconType } from "react-icons";
import { FaBolt, FaClock, FaCrown, FaLayerGroup, FaStar, FaTrophy, FaUsers } from "react-icons/fa6";
import { gameCards } from "../../../pages/games/data";
import GameLandingPage, { type GameLandingPageConfig, type GameLandingTheme } from "./GameLandingPage";

type GameCard = {
  id: string;
  title: string;
  description: string;
  path: string;
  image: string;
  players: string;
  level: string;
  badge: string;
  time: string;
  points: string;
  category: string;
  mainIcon: IconType;
  icon: IconType;
  levelIcon: IconType;
  badgeIcon: IconType;
  categoryIcon: IconType;
  shadowColor: string;
};

const themes: Record<string, GameLandingTheme> = {
  amber: {
    accent: "from-amber-400 via-orange-500 to-red-500",
    accentSoft: "from-amber-100 via-orange-100 to-rose-100",
    page: "bg-[linear-gradient(135deg,#17110a_0%,#25150b_48%,#210c12_100%)]",
    panel: "bg-[linear-gradient(145deg,rgba(255,220,166,0.12),rgba(255,255,255,0.035))]",
    border: "border-amber-200/15",
    text: "text-amber-200",
    mutedText: "text-orange-50/72",
    glow: "via-amber-300",
  },
  yellow: {
    accent: "from-yellow-400 via-orange-500 to-red-500",
    accentSoft: "from-yellow-100 via-orange-100 to-red-100",
    page: "bg-[linear-gradient(135deg,#161207_0%,#24170a_48%,#260b11_100%)]",
    panel: "bg-[linear-gradient(145deg,rgba(255,230,147,0.12),rgba(255,255,255,0.035))]",
    border: "border-yellow-200/15",
    text: "text-yellow-200",
    mutedText: "text-yellow-50/72",
    glow: "via-yellow-300",
  },
  green: {
    accent: "from-emerald-400 via-teal-500 to-cyan-500",
    accentSoft: "from-emerald-100 via-teal-100 to-cyan-100",
    page: "bg-[linear-gradient(135deg,#061714_0%,#09201e_50%,#071927_100%)]",
    panel: "bg-[linear-gradient(145deg,rgba(134,239,172,0.11),rgba(255,255,255,0.035))]",
    border: "border-emerald-200/14",
    text: "text-emerald-200",
    mutedText: "text-emerald-50/70",
    glow: "via-emerald-300",
  },
  blue: {
    accent: "from-sky-400 via-blue-500 to-indigo-500",
    accentSoft: "from-sky-100 via-blue-100 to-indigo-100",
    page: "bg-[linear-gradient(135deg,#071426_0%,#0a1930_50%,#101332_100%)]",
    panel: "bg-[linear-gradient(145deg,rgba(125,211,252,0.11),rgba(255,255,255,0.035))]",
    border: "border-sky-200/14",
    text: "text-sky-200",
    mutedText: "text-sky-50/70",
    glow: "via-sky-300",
  },
  cyan: {
    accent: "from-cyan-400 via-sky-500 to-blue-500",
    accentSoft: "from-cyan-100 via-sky-100 to-blue-100",
    page: "bg-[linear-gradient(135deg,#06151d_0%,#09212d_50%,#0b1730_100%)]",
    panel: "bg-[linear-gradient(145deg,rgba(103,232,249,0.11),rgba(255,255,255,0.035))]",
    border: "border-cyan-200/14",
    text: "text-cyan-200",
    mutedText: "text-cyan-50/70",
    glow: "via-cyan-300",
  },
  indigo: {
    accent: "from-indigo-500 via-purple-500 to-fuchsia-500",
    accentSoft: "from-indigo-100 via-purple-100 to-fuchsia-100",
    page: "bg-[linear-gradient(135deg,#0e102b_0%,#1b1640_50%,#23113d_100%)]",
    panel: "bg-[linear-gradient(145deg,rgba(199,210,254,0.11),rgba(255,255,255,0.035))]",
    border: "border-indigo-200/14",
    text: "text-indigo-200",
    mutedText: "text-indigo-50/72",
    glow: "via-indigo-300",
  },
  purple: {
    accent: "from-violet-400 via-fuchsia-500 to-pink-500",
    accentSoft: "from-violet-100 via-fuchsia-100 to-pink-100",
    page: "bg-[linear-gradient(135deg,#130b26_0%,#211238_50%,#2b102d_100%)]",
    panel: "bg-[linear-gradient(145deg,rgba(216,180,254,0.11),rgba(255,255,255,0.035))]",
    border: "border-violet-200/14",
    text: "text-violet-200",
    mutedText: "text-violet-50/72",
    glow: "via-violet-300",
  },
  pink: {
    accent: "from-pink-400 via-rose-500 to-fuchsia-500",
    accentSoft: "from-pink-100 via-rose-100 to-fuchsia-100",
    page: "bg-[linear-gradient(135deg,#21101f_0%,#321225_50%,#24102f_100%)]",
    panel: "bg-[linear-gradient(145deg,rgba(251,207,232,0.11),rgba(255,255,255,0.035))]",
    border: "border-pink-200/14",
    text: "text-pink-200",
    mutedText: "text-pink-50/72",
    glow: "via-pink-300",
  },
};

const fallbackTheme = themes.blue;

const themeKeyByGameId: Record<string, keyof typeof themes> = {
  jumanji: "amber",
  "frog-pond": "green",
  "treasure-hunt": "amber",
  "tug-of-war": "blue",
  baamboozle: "yellow",
  "memory-rush": "green",
  "word-battle": "purple",
  "classic-arcade": "purple",
  "flag-battle": "cyan",
  "wheel-of-fortune": "purple",
  "word-search": "green",
  "ocean-word-fishing": "blue",
  "find-color": "cyan",
  bingo: "indigo",
  "sozlar-zanjiri": "purple",
  "memory-chain": "cyan",
  "reverse-thinking": "green",
  hangman: "amber",
  millionaire: "yellow",
  pictionary: "indigo",
  "truth-detector": "indigo",
  "math-chick": "purple",
  "iq-game": "blue",
};

const playAccentByGameId: Record<string, string> = {
  jumanji: "from-amber-500 via-yellow-500 to-orange-500",
  "frog-pond": "from-emerald-500 via-sky-500 to-yellow-400",
  "treasure-hunt": "from-amber-500 via-orange-500 to-yellow-600",
  "tug-of-war": "from-blue-500 via-slate-700 to-orange-500",
  baamboozle: "from-yellow-500 via-orange-500 to-red-500",
  "memory-rush": "from-emerald-500 via-teal-500 to-cyan-500",
  "word-battle": "from-cyan-500 via-purple-500 to-pink-500",
  "classic-arcade": "from-fuchsia-500 via-rose-500 to-orange-500",
  "flag-battle": "from-blue-500 via-cyan-500 to-teal-500",
  "wheel-of-fortune": "from-purple-500 via-pink-500 to-rose-500",
  "word-search": "from-emerald-500 via-teal-500 to-cyan-500",
  "ocean-word-fishing": "from-blue-500 via-cyan-500 to-sky-500",
  "find-color": "from-cyan-500 via-blue-500 to-indigo-500",
  bingo: "from-indigo-500 via-purple-500 to-fuchsia-500",
  "sozlar-zanjiri": "from-violet-500 via-purple-500 to-fuchsia-500",
  "memory-chain": "from-sky-500 via-cyan-500 to-blue-500",
  "reverse-thinking": "from-green-500 via-emerald-500 to-teal-500",
  hangman: "from-amber-500 via-orange-500 to-red-500",
  millionaire: "from-yellow-500 via-amber-500 to-orange-500",
  pictionary: "from-indigo-500 via-purple-500 to-pink-500",
  "truth-detector": "from-indigo-500 via-purple-500 to-blue-500",
  "math-chick": "from-[#3b82f6] via-[#7c3aed] to-[#ec4899]",
  "iq-game": "from-sky-500 via-cyan-500 to-violet-500",
};

function splitTitle(title: string): [string, string] {
  const words = title.trim().split(/\s+/);
  if (words.length < 2) return [title, "o'yini"];
  const splitIndex = Math.ceil(words.length / 2);
  return [words.slice(0, splitIndex).join(" "), words.slice(splitIndex).join(" ")];
}

function createConfig(game: GameCard): GameLandingPageConfig {
  const baseTheme = themes[themeKeyByGameId[game.id] ?? game.shadowColor] ?? fallbackTheme;
  const theme = {
    ...baseTheme,
    accent: playAccentByGameId[game.id] ?? baseTheme.accent,
  };

  return {
    badge: game.badge,
    badgeIcon: game.badgeIcon,
    title: splitTitle(game.title),
    description: game.description,
    image: game.image,
    imageAlt: `${game.title} o'yini`,
    playPath: `${game.path}/play`,
    gameKey: game.id,
    modeSelectionEnabled: true,
    theme,
    metrics: [
      { icon: FaUsers, label: "O'yinchilar", value: game.players },
      { icon: FaClock, label: "Davomiylik", value: game.time },
      { icon: game.categoryIcon, label: "Yo'nalish", value: game.category },
      { icon: FaTrophy, label: "Mukofot", value: game.points },
    ],
    features: [
      {
        icon: game.mainIcon,
        title: `${game.category} sinovi`,
        description: "Qiziqarli topshiriqlar orqali ko'nikmalaringizni amalda sinab ko'ring.",
        stat: "Faol o'yin",
      },
      {
        icon: game.icon,
        title: "Tezkor jarayon",
        description: "Har bir raund diqqat, tezlik va aniq qaror qabul qilishni talab qiladi.",
        stat: game.time,
      },
      {
        icon: FaBolt,
        title: "Natija va ball",
        description: "Harakatlaringiz yakuniy natijaga ta'sir qiladi va rekord sari olib boradi.",
        stat: game.points,
      },
    ],
    levels: [
      {
        icon: game.levelIcon,
        title: "Boshlang'ich",
        detail: "Qoidalarni tushunib, o'yin ritmiga kiring.",
        meta: "Yengil start",
        progress: 34,
      },
      {
        icon: game.icon,
        title: "Raqobat",
        detail: "Tezlik va aniqlikni birgalikda sinang.",
        meta: game.level,
        progress: 67,
      },
      {
        icon: FaCrown,
        title: "Ustoz",
        detail: "Eng yuqori natija uchun barcha imkoniyatdan foydalaning.",
        meta: "Rekord rejimi",
        progress: 100,
      },
    ],
    highlights: [
      { icon: game.mainIcon, label: "Yo'nalish", value: game.category },
      { icon: FaLayerGroup, label: "Daraja", value: game.level },
      { icon: FaStar, label: "Mukofot", value: game.points },
    ],
  };
}

export default function GameLandingRoutePage({ gamePath }: { gamePath: string }) {
  const game = gameCards.find((item) => item.path === gamePath) as GameCard | undefined;

  if (!game) return null;

  return <GameLandingPage config={createConfig(game)} />;
}
