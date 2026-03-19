import { useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
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
import ReverseThinkingPage from "./components/games/reverse_thinking/ReverseThinkingPage";
import HangmanPage from "./components/games/hangman/HangmanPage";
import MillionairePage from "./components/games/millionaire/MillionairePage";
import PictionaryPage from "./components/games/pictionary/PictionaryPage";
import TruthDetectorPage from "./components/games/truth_detector/TruthDetectorPage";
import GamePlayView from "./components/games/shared/GamePlayView";
import { gamePlayRoutes } from "./components/games/shared/gamePlayRoutes";
import MathChickGamePage from "./components/games/math_chick_game/MathChickGamePage";
import TeacherQuestionPanel from "./pages/teacher/TeacherQuestionPanel";
import TeacherLayout from "./layout/TeacherLayout";
import IQGamePage from "./components/games/iq_game/IQGamePage";
import FavoritesPage from "./pages/favorites/FavoritesPage";

function App() {
  const {
    state: { isLoading },
  } = useContextPro();
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);
  const [isGamesRouteLoading, setIsGamesRouteLoading] = useState(false);

  useEffect(() => {
    const isEnteringGamesPage =
      location.pathname === "/games" && previousPathRef.current !== "/games";

    previousPathRef.current = location.pathname;

    if (!isEnteringGamesPage) {
      setIsGamesRouteLoading(false);
      return;
    }

    setIsGamesRouteLoading(true);

    const timer = window.setTimeout(() => {
      setIsGamesRouteLoading(false);
    }, 900);

    return () => {
      window.clearTimeout(timer);
    };
  }, [location.pathname]);

  if (isLoading || isGamesRouteLoading) return <SiteLoader />;

  return (
    <Routes>
      <Route path="/" element={<Home />} />

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
        <Route index path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/favorites" element={<FavoritesPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute roles={["teacher", "admin"]}>
            <TeacherLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/teacher-panel" element={<TeacherQuestionPanel />} />
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
        <Route
          path="/games/ocean-word-fishing"
          element={<OceanWordFishingPage />}
        />
        <Route path="/games/math-race" element={<MathRacePage />} />
        <Route path="/games/baamboozle" element={<BaamboozlePage />} />
        <Route path="/games/find-color" element={<FindDifferentColorPage />} />
        <Route path="/games/bingo" element={<BingoPage />} />
        <Route path="/games/word-chain" element={<WordChainPage />} />
        <Route path="/games/memory-chain" element={<MemoryChainArenaPage />} />
        <Route path="/games/jumanji" element={<JumanjiPage />} />
        <Route path="/games/mini-puzzle" element={<MiniPuzzlePage />} />
        <Route path="/games/reverse-thinking" element={<ReverseThinkingPage />} />
        <Route path="/games/hangman" element={<HangmanPage />} />
        <Route path="/games/millionaire" element={<MillionairePage />} />
        <Route path="/games/pictionary" element={<PictionaryPage />} />
        <Route path="/games/truth-detector" element={<TruthDetectorPage />} />
        <Route path="/games/math-chick" element={<MathChickGamePage />} />
        <Route path="/games/iq-game" element={<IQGamePage />} />
        {gamePlayRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <GamePlayView colorClassName={route.colorClassName}>
                {route.element}
              </GamePlayView>
            }
          />
        ))}
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
