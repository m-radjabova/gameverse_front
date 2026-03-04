import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/home/Home";
import AuthLayout from "./layout/AuthLayout";
import MainLayout from "./layout/MainLayout";
import AdminLayout from "./layout/AdminLayout";
import HelloAdmin from "./pages/admin/HelloAdmin";
import useContextPro from "./hooks/useContextPro";
import LoginForm from "./pages/login/Login";
import Register from "./pages/login/Register";
import Games from "./pages/games/Games";
import QuizBattlePage from "./components/games/quiz_battle/QuizBattlePage";
import TreasureHuntPage from "./components/games/treasure_hunt/TreasureHuntPage";
import MemoryRushPage from "./components/games/memory_rush/MemoryRushPage";
import SiteLoader from "./components/main/SiteLoader";
import ClassicArcadePage from "./components/games/classic_arcade/ClassicArcadePage";
import WordBattlePage from "./components/games/word_battle/WordBattlePage";
import GameLayout from "./layout/GameLayout";
import FlagBattlePage from "./components/games/flag_battle/FlagBattlePage";
import WheelOfFortunePage from "./components/games/wheel_of_fortune/WheelOfFortunePage";
import WordSearchPuzzlePage from "./components/games/word_search_puzzle/WordSearchPuzzlePage";
import Profile from "./components/profile/Profile";
import OceanWordFishingPage from "./components/games/ocean_word_fishing/OceanWordFishingPage";
import MathRacePage from "./components/games/math_race/MathRacePage";
import BaamboozlePage from "./components/games/baamboozle/BaamboozlePage";
import FindDifferentColorPage from "./components/games/find_color/FindDifferentColorPage";
import NotFoundPage from "./components/NotFoundPage";
import BingoPage from "./components/games/bingo/BingoPage";
import WordChainPage from "./components/games/word_chain/WordChainPage";
import MemoryChainArenaPage from "./components/games/memory_chain_arena/MemoryChainArenaPage";
import JumanjiPage from "./components/games/jumanji/JumanjiPage";
import MiniPuzzlePage from "./components/games/mini_puzzle/MiniPuzzlePage";
import MagicSquarePage from "./components/games/magic_square/MagicSquarePage";
import ReverseThinkingPage from "./components/games/reverse_thinking/ReverseThinkingPage";
import HangmanPage from "./components/games/hangman/HangmanPage";
import MillionairePage from "./components/games/millionaire/MillionairePage";
function App() {
  const { state: { isLoading } } = useContextPro();

  if (isLoading) return <SiteLoader />;

  return (
    <Routes>
      <Route path="/home" element={<Home />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HelloAdmin />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <GameLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/games" element={<Games />} />
        <Route path="/games/quiz-battle" element={<QuizBattlePage />} />
        <Route path="/games/treasure-hunt" element={<TreasureHuntPage />} />
        <Route path="/games/memory-rush" element={<MemoryRushPage />} />
        <Route path="/games/classic-arcade" element={<ClassicArcadePage />} />
        <Route path="/games/word-battle" element={<WordBattlePage />} />
        <Route path="/games/flag-battle" element={<FlagBattlePage />} />
        <Route path="/games/wheel-of-fortune" element={<WheelOfFortunePage />} />
        <Route path="/games/word-search" element={<WordSearchPuzzlePage />} />
        <Route path="/games/ocean-word-fishing" element={<OceanWordFishingPage />} />
        <Route path="/games/math-race" element={<MathRacePage />} />
        <Route path="/games/baamboozle" element={<BaamboozlePage />} />
        <Route path="/games/find-color" element={<FindDifferentColorPage />} />
        <Route path="/games/bingo" element={<BingoPage />} />
        <Route path="/games/word-chain" element={<WordChainPage />} />
        <Route path="/games/memory-chain" element={<MemoryChainArenaPage />} />
        <Route path="/games/jumanji" element={<JumanjiPage />} />
        <Route path="/games/mini-puzzle" element={<MiniPuzzlePage />} />
        <Route path="/games/magic-square" element={<MagicSquarePage />} />
        <Route path="/games/reverse-thinking" element={<ReverseThinkingPage />} />
        <Route path="/games/hangman" element={<HangmanPage />} />4
        <Route path="/games/millionaire" element={<MillionairePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;