import { lazy, type ReactNode } from "react";

const QuizBattle = lazy(() => import("../quiz_battle/QuizBattle"));
const TreasureHunt = lazy(() => import("../treasure_hunt/TreasureHunt"));
const MemoryRush = lazy(() => import("../memory_rush/MemoryRush"));
const ClassicArcade = lazy(() => import("../classic_arcade/ClassicArcade"));
const WordBattle = lazy(() => import("../word_battle/WordBattle"));
const FlagBattle = lazy(() => import("../flag_battle/FlagBattle"));
const WheelOfFortune = lazy(() => import("../wheel_of_fortune/WheelOfFortune"));
const WordSearchPuzzle = lazy(() => import("../word_search_puzzle/WordSearchPuzzle"));
const OceanWordFishing = lazy(() => import("../ocean_word_fishing/OceanWordFishing"));
const MathRace = lazy(() => import("../math_race/MathRace"));
const Baamboozle = lazy(() => import("../baamboozle/Baamboozle"));
const FindDifferentColor = lazy(() => import("../find_color/FindDifferentColor"));
const Bingo = lazy(() => import("../bingo/Bingo"));
const WordChain = lazy(() => import("../word_chain/WordChain"));
const MemoryChainArena = lazy(() => import("../memory_chain_arena/MemoryChainArena"));
const Jumanji = lazy(() => import("../jumanji/Jumanji"));
const MiniPuzzle = lazy(() => import("../mini_puzzle/MiniPuzzle"));
const ReverseThinking = lazy(() => import("../reverse_thinking/ReverseThinking"));
const Hangman = lazy(() => import("../hangman/Hangman"));
const Millionaire = lazy(() => import("../millionaire/Millionaire"));
const TruthDetector = lazy(() => import("../truth_detector/TruthDetector"));
const MathChickGame = lazy(() => import("../math_chick_game/MathChickGame"));
const IQGame = lazy(() => import("../iq_game/IQGame"));
const PlantVRGame = lazy(() => import("../plant_vr"));
const TugOfWar = lazy(() => import("../tug_of_war/TugOfWar"));
const VirtualZoo = lazy(() => import("../virtual_zoo"));
const FrogPondPage = lazy(() => import("../frog-pond/FrogPondPage"));
const PizzaMaster = lazy(() => import("../pizza_master/PizzaMaster"));

type GamePlayRoute = {
  path: string;
  colorClassName: string;
  element: ReactNode;
};

export const gamePlayRoutes: GamePlayRoute[] = [
  {
    path: "/games/pizza-master/play",
    colorClassName: "from-red-500 via-orange-500 to-yellow-400",
    element: <PizzaMaster />,
  },
  {
    path: "/games/quiz-battle/play",
    colorClassName: "from-yellow-500 via-orange-500 to-red-500",
    element: <QuizBattle />,
  },
  {
    path: "/games/treasure-hunt/play",
    colorClassName: "from-amber-500 via-orange-500 to-yellow-600",
    element: <TreasureHunt />,
  },
  {
    path: "/games/memory-rush/play",
    colorClassName: "from-emerald-500 via-teal-500 to-cyan-500",
    element: <MemoryRush />,
  },
  {
    path: "/games/classic-arcade/play",
    colorClassName: "from-fuchsia-500 via-rose-500 to-orange-500",
    element: <ClassicArcade />,
  },
  {
    path: "/games/word-battle/play",
    colorClassName: "from-cyan-500 via-purple-500 to-pink-500",
    element: <WordBattle />,
  },
  {
    path: "/games/flag-battle/play",
    colorClassName: "from-blue-500 via-cyan-500 to-teal-500",
    element: <FlagBattle />,
  },
  {
    path: "/games/wheel-of-fortune/play",
    colorClassName: "from-purple-500 via-pink-500 to-rose-500",
    element: <WheelOfFortune />,
  },
  {
    path: "/games/word-search/play",
    colorClassName: "from-emerald-500 via-teal-500 to-cyan-500",
    element: <WordSearchPuzzle />,
  },
  {
    path: "/games/ocean-word-fishing/play",
    colorClassName: "from-blue-500 via-cyan-500 to-sky-500",
    element: <OceanWordFishing />,
  },
  {
    path: "/games/math-race/play",
    colorClassName: "from-yellow-500 via-orange-500 to-red-500",
    element: <MathRace />,
  },
  {
    path: "/games/tug-of-war/play",
    colorClassName: "from-blue-500 via-slate-700 to-orange-500",
    element: <TugOfWar />,
  },
  {
    path: "/games/frog-pond/play",
    colorClassName: "from-emerald-500 via-sky-500 to-yellow-400",
    element: <FrogPondPage />,
  },
  {
    path: "/games/math-chick/play",
    colorClassName: "from-[#3b82f6] via-[#7c3aed] to-[#ec4899]",
    element: <MathChickGame />,
  },
  {
    path: "/games/baamboozle/play",
    colorClassName: "from-yellow-500 via-orange-500 to-red-500",
    element: <Baamboozle />,
  },
  {
    path: "/games/find-color/play",
    colorClassName: "from-cyan-500 via-blue-500 to-indigo-500",
    element: <FindDifferentColor />,
  },
  {
    path: "/games/bingo/play",
    colorClassName: "from-indigo-500 via-purple-500 to-fuchsia-500",
    element: <Bingo />,
  },
  {
    path: "/games/word-chain/play",
    colorClassName: "from-violet-500 via-purple-500 to-fuchsia-500",
    element: <WordChain />,
  },
  {
    path: "/games/memory-chain/play",
    colorClassName: "from-sky-500 via-cyan-500 to-blue-500",
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
    colorClassName: "from-amber-500 via-yellow-500 to-orange-500",
    element: <Jumanji />,
  },
  {
    path: "/games/mini-puzzle/play",
    colorClassName: "from-pink-500 via-rose-500 to-fuchsia-500",
    element: <MiniPuzzle />,
  },
  {
    path: "/games/reverse-thinking/play",
    colorClassName: "from-green-500 via-emerald-500 to-teal-500",
    element: <ReverseThinking />,
  },
  {
    path: "/games/hangman/play",
    colorClassName: "from-amber-500 via-orange-500 to-red-500",
    element: <Hangman />,
  },
  {
    path: "/games/millionaire/play",
    colorClassName: "from-yellow-500 via-amber-500 to-orange-500",
    element: <Millionaire />,
  },
  {
    path: "/games/truth-detector/play",
    colorClassName: "from-indigo-500 via-purple-500 to-blue-500",
    element: <TruthDetector />,
  },
  {
    path: "/games/iq-game/play",
    colorClassName: "from-sky-500 via-cyan-500 to-violet-500",
    element: <IQGame />,
  },
  {
    path: "/games/plant-vr/play",
    colorClassName: "from-emerald-400 via-lime-300 to-amber-200",
    element: <PlantVRGame />,
  },
  {
    path: "/games/virtual-zoo-vr/play",
    colorClassName: "from-emerald-400 via-lime-300 to-sky-200",
    element: <VirtualZoo />,
  },
];
