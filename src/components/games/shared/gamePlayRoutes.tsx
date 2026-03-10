import { MdQuiz, MdGames, MdNumbers, MdPalette } from "react-icons/md";
import { FaFlag, FaSearch, FaFish, FaEye, FaDice, FaSkull } from "react-icons/fa";
import { GiTreasureMap, GiSpinningWheel, GiBrain, GiJungle, GiChessKnight, GiCardRandom, GiThink, GiPuzzle, GiChainLightning, GiMoneyStack, GiMagnifyingGlass } from "react-icons/gi";
import { RiBubbleChartFill } from "react-icons/ri";
import type { IconType } from "react-icons";
import type { ReactNode } from "react";
import QuizBattle from "../quiz_battle/QuizBattle";
import TreasureHunt from "../treasure_hunt/TreasureHunt";
import MemoryRush from "../memory_rush/MemoryRush";
import ClassicArcade from "../classic_arcade/ClassicArcade";
import WordBattle from "../word_battle/WordBattle";
import FlagBattle from "../flag_battle/FlagBattle";
import WheelOfFortune from "../wheel_of_fortune/WheelOfFortune";
import WordSearchPuzzle from "../word_search_puzzle/WordSearchPuzzle";
import OceanWordFishing from "../ocean_word_fishing/OceanWordFishing";
import MathRace from "../math_race/MathRace";
import Baamboozle from "../baamboozle/Baamboozle";
import FindDifferentColor from "../find_color/FindDifferentColor";
import Bingo from "../bingo/Bingo";
import WordChain from "../word_chain/WordChain";
import MemoryChainArena from "../memory_chain_arena/MemoryChainArena";
import Jumanji from "../jumanji/Jumanji";
import MiniPuzzle from "../mini_puzzle/MiniPuzzle";
import MagicSquare from "../magic_square/MagicSquare";
import ReverseThinking from "../reverse_thinking/ReverseThinking";
import Hangman from "../hangman/Hangman";
import Millionaire from "../millionaire/Millionaire";
import Pictionary from "../pictionary/Pictionary";
import TruthDetector from "../truth_detector/TruthDetector";

type GamePlayRoute = {
  path: string;
  backTo: string;
  title: string;
  subtitle: string;
  gameKey: string;
  colorClassName: string;
  icon: IconType;
  element: ReactNode;
};

export const gamePlayRoutes: GamePlayRoute[] = [
  {
    path: "/games/quiz-battle/play",
    backTo: "/games/quiz-battle",
    title: "Quiz Battle",
    subtitle: "Tezkor savollarni alohida o'yin sahifasida boshlang.",
    gameKey: "quiz-battle",
    colorClassName: "from-yellow-500 via-orange-500 to-red-500",
    icon: MdQuiz,
    element: <QuizBattle />,
  },
  {
    path: "/games/treasure-hunt/play",
    backTo: "/games/treasure-hunt",
    title: "Treasure Hunt",
    subtitle: "Xazina izlash sarguzashti uchun to'liq o'yin rejimi.",
    gameKey: "treasure-hunt",
    colorClassName: "from-amber-500 via-orange-500 to-yellow-600",
    icon: GiTreasureMap,
    element: <TreasureHunt />,
  },
  {
    path: "/games/memory-rush/play",
    backTo: "/games/memory-rush",
    title: "Memory Rush",
    subtitle: "Xotira mashqini alohida oynada davom ettiring.",
    gameKey: "memory-rush",
    colorClassName: "from-emerald-500 via-teal-500 to-cyan-500",
    icon: GiBrain,
    element: <MemoryRush />,
  },
  {
    path: "/games/classic-arcade/play",
    backTo: "/games/classic-arcade",
    title: "Classic Arcade",
    subtitle: "Mini challenge'lar endi alohida play sahifada.",
    gameKey: "classic-arcade",
    colorClassName: "from-fuchsia-500 via-rose-500 to-orange-500",
    icon: MdGames,
    element: <ClassicArcade />,
  },
  {
    path: "/games/word-battle/play",
    backTo: "/games/word-battle",
    title: "Word Battle",
    subtitle: "Jamoaviy so'z bellashuvini boshlang.",
    gameKey: "word-battle",
    colorClassName: "from-cyan-500 via-purple-500 to-pink-500",
    icon: RiBubbleChartFill,
    element: <WordBattle />,
  },
  {
    path: "/games/flag-battle/play",
    backTo: "/games/flag-battle",
    title: "Flag Battle",
    subtitle: "Bayroqlar bo'yicha bellashuv uchun play mode.",
    gameKey: "flag-battle",
    colorClassName: "from-blue-500 via-cyan-500 to-teal-500",
    icon: FaFlag,
    element: <FlagBattle />,
  },
  {
    path: "/games/wheel-of-fortune/play",
    backTo: "/games/wheel-of-fortune",
    title: "Wheel Of Fortune",
    subtitle: "Barabanni alohida sahifada aylantiring.",
    gameKey: "wheel-of-fortune",
    colorClassName: "from-purple-500 via-pink-500 to-rose-500",
    icon: GiSpinningWheel,
    element: <WheelOfFortune />,
  },
  {
    path: "/games/word-search/play",
    backTo: "/games/word-search",
    title: "Word Search Puzzle",
    subtitle: "So'z qidirish o'yinini alohida play sahifasida oching.",
    gameKey: "word-search",
    colorClassName: "from-emerald-500 via-teal-500 to-cyan-500",
    icon: FaSearch,
    element: <WordSearchPuzzle />,
  },
  {
    path: "/games/ocean-word-fishing/play",
    backTo: "/games/ocean-word-fishing",
    title: "Ocean Word Fishing",
    subtitle: "Baliqlar bilan so'z yig'ish rejimi.",
    gameKey: "ocean-word-fishing",
    colorClassName: "from-blue-500 via-cyan-500 to-sky-500",
    icon: FaFish,
    element: <OceanWordFishing />,
  },
  {
    path: "/games/math-race/play",
    backTo: "/games/math-race",
    title: "Math Race",
    subtitle: "Matematik poygani alohida sahifada boshlang.",
    gameKey: "math-race",
    colorClassName: "from-yellow-500 via-orange-500 to-red-500",
    icon: MdNumbers,
    element: <MathRace />,
  },
  {
    path: "/games/baamboozle/play",
    backTo: "/games/baamboozle",
    title: "Baamboozle",
    subtitle: "Savolli kataklar o'yini uchun to'liq play rejimi.",
    gameKey: "baamboozle",
    colorClassName: "from-yellow-500 via-orange-500 to-red-500",
    icon: FaDice,
    element: <Baamboozle />,
  },
  {
    path: "/games/find-color/play",
    backTo: "/games/find-color",
    title: "Find Different Color",
    subtitle: "Farqli rangni topish uchun alohida o'yin sahifasi.",
    gameKey: "find-color",
    colorClassName: "from-cyan-500 via-blue-500 to-indigo-500",
    icon: FaEye,
    element: <FindDifferentColor />,
  },
  {
    path: "/games/bingo/play",
    backTo: "/games/bingo",
    title: "Bingo",
    subtitle: "Bingo challenge endi alohida sahifada.",
    gameKey: "bingo",
    colorClassName: "from-indigo-500 via-purple-500 to-fuchsia-500",
    icon: GiCardRandom,
    element: <Bingo />,
  },
  {
    path: "/games/word-chain/play",
    backTo: "/games/word-chain",
    title: "Word Chain",
    subtitle: "So'z zanjiri uchun alohida play view.",
    gameKey: "word-chain",
    colorClassName: "from-violet-500 via-purple-500 to-fuchsia-500",
    icon: GiChainLightning,
    element: <WordChain />,
  },
  {
    path: "/games/memory-chain/play",
    backTo: "/games/memory-chain",
    title: "Memory Chain Arena",
    subtitle: "Xotira ketma-ketligi o'yinini boshlang.",
    gameKey: "memory-chain",
    colorClassName: "from-sky-500 via-cyan-500 to-blue-500",
    icon: GiChainLightning,
    element: (
      <MemoryChainArena
        gameTitle="Memory Chain"
        gameTone="from-sky-500 to-blue-500"
        leftTeamName="1-Jamoa"
        rightTeamName="2-Jamoa"
        initialDifficulty="O'rta"
      />
    ),
  },
  {
    path: "/games/jumanji/play",
    backTo: "/games/jumanji",
    title: "Jumanji",
    subtitle: "Sarguzashtli o'yinni alohida play rejimida oching.",
    gameKey: "jumanji",
    colorClassName: "from-amber-500 via-yellow-500 to-orange-500",
    icon: GiJungle,
    element: <Jumanji />,
  },
  {
    path: "/games/mini-puzzle/play",
    backTo: "/games/mini-puzzle",
    title: "Mini Puzzle",
    subtitle: "Mini puzzle'larni play sahifasida yeching.",
    gameKey: "mini-puzzle",
    colorClassName: "from-pink-500 via-rose-500 to-fuchsia-500",
    icon: GiPuzzle,
    element: <MiniPuzzle />,
  },
  {
    path: "/games/magic-square/play",
    backTo: "/games/magic-square",
    title: "Magic Square",
    subtitle: "Magic Square uchun maxsus o'yin sahifasi.",
    gameKey: "magic-square",
    colorClassName: "from-violet-500 via-purple-500 to-indigo-500",
    icon: GiChessKnight,
    element: <MagicSquare />,
  },
  {
    path: "/games/reverse-thinking/play",
    backTo: "/games/reverse-thinking",
    title: "Reverse Thinking",
    subtitle: "Teskari fikrlash bellashuvini boshlang.",
    gameKey: "reverse-thinking",
    colorClassName: "from-green-500 via-emerald-500 to-teal-500",
    icon: GiThink,
    element: <ReverseThinking />,
  },
  {
    path: "/games/hangman/play",
    backTo: "/games/hangman",
    title: "Hangman",
    subtitle: "Jamoali Hangman o'yinini alohida sahifada o'ynang.",
    gameKey: "hangman",
    colorClassName: "from-amber-500 via-orange-500 to-red-500",
    icon: FaSkull,
    element: <Hangman />,
  },
  {
    path: "/games/millionaire/play",
    backTo: "/games/millionaire",
    title: "Millionaire",
    subtitle: "Millionaire savollarini alohida sahifada boshlang.",
    gameKey: "millionaire",
    colorClassName: "from-yellow-500 via-amber-500 to-orange-500",
    icon: GiMoneyStack,
    element: <Millionaire />,
  },
  {
    path: "/games/pictionary/play",
    backTo: "/games/pictionary",
    title: "Pictionary",
    subtitle: "Rasm asosida topish o'yini uchun play mode.",
    gameKey: "pictionary",
    colorClassName: "from-indigo-500 via-purple-500 to-pink-500",
    icon: MdPalette,
    element: <Pictionary />,
  },
  {
    path: "/games/truth-detector/play",
    backTo: "/games/truth-detector",
    title: "Truth Detector",
    subtitle: "Haqiqatni topish o'yinini boshlang.",
    gameKey: "truth-detector",
    colorClassName: "from-indigo-500 via-purple-500 to-blue-500",
    icon: GiMagnifyingGlass,
    element: <TruthDetector />,
  },
];
