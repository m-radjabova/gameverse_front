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
import ReverseThinking from "../reverse_thinking/ReverseThinking";
import Hangman from "../hangman/Hangman";
import Millionaire from "../millionaire/Millionaire";
// import Pictionary from "../pictionary/Pictionary";
import TruthDetector from "../truth_detector/TruthDetector";
import MathChickGame from "../math_chick_game/MathChickGame";
import IQGame from "../iq_game/IQGame";
import PlantVRGame from "../plant_vr";
import TugOfWar from "../tug_of_war/TugOfWar";
import VirtualZoo from "../virtual_zoo";

type GamePlayRoute = {
  path: string;
  colorClassName: string;
  element: ReactNode;
};

export const gamePlayRoutes: GamePlayRoute[] = [
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
  // {
  //   path: "/games/pictionary/play",
  //   colorClassName: "from-indigo-500 via-purple-500 to-pink-500",
  //   element: <Pictionary />,
  // },
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
