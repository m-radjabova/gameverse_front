import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthLayout from "./layout/AuthLayout";
import MainLayout from "./layout/MainLayout";
import AdminLayout from "./layout/AdminLayout";
import useContextPro from "./hooks/useContextPro";
import SiteLoader from "./components/main/SiteLoader";
import GameLayout from "./layout/GameLayout";
import GamePlayView from "./components/games/shared/GamePlayView";
import { gamePlayRoutes } from "./components/games/shared/gamePlayRoutes";
import TeacherLayout from "./layout/TeacherLayout";
import ScrollToTop from "./components/ScrollToTop";
import Seo from "./components/seo/Seo";

const Home = lazy(() => import("./pages/home/Home"));
const LoginForm = lazy(() => import("./pages/login/Login"));
const Register = lazy(() => import("./pages/login/Register"));
const Games = lazy(() => import("./pages/games/Games"));
const Profile = lazy(() => import("./components/profile/Profile"));
const FavoritesPage = lazy(() => import("./pages/favorites/FavoritesPage"));
const TeacherQuestionPanel = lazy(() => import("./pages/teacher/TeacherQuestionPanel"));
const HelloAdmin = lazy(() => import("./pages/admin/HelloAdmin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/users/AdminUsers"));
const AdminFeedbacks = lazy(() => import("./pages/admin/feedbacks/AdminFeedbacks"));
const NotFoundPage = lazy(() => import("./components/NotFoundPage"));
const QuizBattlePage = lazy(() => import("./components/games/quiz_battle/QuizBattlePage"));
const TreasureHuntPage = lazy(() => import("./components/games/treasure_hunt/TreasureHuntPage"));
const MemoryRushPage = lazy(() => import("./components/games/memory_rush/MemoryRushPage"));
const ClassicArcadePage = lazy(() => import("./components/games/classic_arcade/ClassicArcadePage"));
const WordBattlePage = lazy(() => import("./components/games/word_battle/WordBattlePage"));
const FlagBattlePage = lazy(() => import("./components/games/flag_battle/FlagBattlePage"));
const WheelOfFortunePage = lazy(() => import("./components/games/wheel_of_fortune/WheelOfFortunePage"));
const WordSearchPuzzlePage = lazy(() => import("./components/games/word_search_puzzle/WordSearchPuzzlePage"));
const OceanWordFishingPage = lazy(() => import("./components/games/ocean_word_fishing/OceanWordFishingPage"));
const MathRacePage = lazy(() => import("./components/games/math_race/MathRacePage"));
const TugOfWarPage = lazy(() => import("./components/games/tug_of_war/TugOfWarPage"));
const BaamboozlePage = lazy(() => import("./components/games/baamboozle/BaamboozlePage"));
const FindDifferentColorPage = lazy(() => import("./components/games/find_color/FindDifferentColorPage"));
const BingoPage = lazy(() => import("./components/games/bingo/BingoPage"));
const WordChainPage = lazy(() => import("./components/games/word_chain/WordChainPage"));
const MemoryChainArenaPage = lazy(() => import("./components/games/memory_chain_arena/MemoryChainArenaPage"));
const JumanjiPage = lazy(() => import("./components/games/jumanji/JumanjiPage"));
const MiniPuzzlePage = lazy(() => import("./components/games/mini_puzzle/MiniPuzzlePage"));
const ReverseThinkingPage = lazy(() => import("./components/games/reverse_thinking/ReverseThinkingPage"));
const HangmanPage = lazy(() => import("./components/games/hangman/HangmanPage"));
const MillionairePage = lazy(() => import("./components/games/millionaire/MillionairePage"));
const TruthDetectorPage = lazy(() => import("./components/games/truth_detector/TruthDetectorPage"));
const MathChickGamePage = lazy(() => import("./components/games/math_chick_game/MathChickGamePage"));
const IQGamePage = lazy(() => import("./components/games/iq_game/IQGamePage"));
const FrogPondLandingPage = lazy(() => import("./components/games/frog-pond/FrogPondLandingPage"));
const PizzaMasterPage = lazy(() => import("./components/games/pizza_master/PizzaMasterPage"));
const VrGameBriefingPage = lazy(() => import("./components/games/shared/VrGameBriefingPage"));
const WorldExplorer = lazy(() => import("./components/games/world_explorer"));
const SolarSystemGame = lazy(() => import("./components/games/vr-solar-system"));

function App() {
  const {
    state: { isLoading },
  } = useContextPro();

  if (isLoading) return <SiteLoader />;

  return (
    <>
    <Seo />
    <ScrollToTop />
    <Suspense fallback={<SiteLoader />}>
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
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="feedbacks" element={<AdminFeedbacks />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
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
        element={<GameLayout />}
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
        <Route path="/games/tug-of-war" element={<TugOfWarPage />} />
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
        <Route path="/games/truth-detector" element={<TruthDetectorPage />} />
        <Route path="/games/math-chick" element={<MathChickGamePage />} />
        <Route path="/games/iq-game" element={<IQGamePage />} />
        <Route path="/games/frog-pond" element={<FrogPondLandingPage />} />
        <Route path="/games/pizza-master" element={<PizzaMasterPage />} />
        <Route
          path="/games/world-explorer"
          element={<VrGameBriefingPage gameId="world-explorer" playPath="/games/world-explorer/play" />}
        />
        <Route
          path="/games/plant-vr"
          element={<VrGameBriefingPage gameId="plant-vr" playPath="/games/plant-vr/play" />}
        />
        <Route
          path="/games/virtual-zoo-vr"
          element={<VrGameBriefingPage gameId="virtual-zoo-vr" playPath="/games/virtual-zoo-vr/play" />}
        />
        <Route
          path="/games/quyosh-tizimi-vr"
          element={<VrGameBriefingPage gameId="vr-solar-system" playPath="/games/quyosh-tizimi-vr/play" />}
        />
        <Route
          path="/games/vr-solar-system"
          element={<VrGameBriefingPage gameId="vr-solar-system" playPath="/games/quyosh-tizimi-vr/play" />}
        />
        <Route
          path="/games/world-explorer/play"
          element={
            <GamePlayView colorClassName="from-sky-500 via-blue-500 to-emerald-500">
              <WorldExplorer />
            </GamePlayView>
          }
        />
        <Route
          path="/games/quyosh-tizimi-vr/play"
          element={
            <GamePlayView colorClassName="from-cyan-500 via-blue-500 to-indigo-500">
              <SolarSystemGame />
            </GamePlayView>
          }
        />
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
    </Suspense>
    </>
  );
}

export default App;
