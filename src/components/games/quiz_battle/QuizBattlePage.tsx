import { FaBolt, FaCrown, FaStar, FaTrophy, FaUsers } from "react-icons/fa";
import { GiAchievement, GiBrain, GiPodium } from "react-icons/gi";
import { MdQuiz, MdTimer } from "react-icons/md";
import GameLandingPage, {
  type GameLandingPageConfig,
} from "../shared/GameLandingPage";
import QuizBattleImg from "../../../assets/quiz_battle_image.png";

const quizBattleConfig: GameLandingPageConfig = {
  badge: "Quiz Battle Arena",
  badgeIcon: MdQuiz,
  title: ["Tezkor", "savollar"],
  description:
    "Tezkor savollar, qiziqarli topshiriqlar va reyting tizimi bilan bilimni sinab ko'ring. Eng bilimdon jamoa g'alaba qiladi.",
  image: QuizBattleImg,
  imageAlt: "Quiz Battle o'yini",
  playPath: "/games/quiz-battle/play",
  gameKey: "quiz-battle",
  modeSelectionEnabled: true,
  theme: {
    accent: "from-yellow-500 via-orange-500 to-red-500",
    accentSoft: "from-yellow-100 via-orange-100 to-red-100",
    page: "bg-[linear-gradient(135deg,#130b05_0%,#24120a_48%,#35100d_100%)]",
    panel: "bg-[linear-gradient(145deg,rgba(255,244,214,0.12),rgba(255,255,255,0.035))]",
    border: "border-yellow-200/14",
    text: "text-yellow-200",
    mutedText: "text-orange-50/72",
    glow: "via-yellow-300",
  },
  metrics: [
    { icon: MdTimer, label: "Davomiylik", value: "5-10 daqiqa" },
    { icon: GiBrain, label: "Tur", value: "Bilim sinovi" },
    { icon: FaUsers, label: "O'yinchilar", value: "2 jamoa" },
    { icon: FaBolt, label: "Bonus", value: "x2 ball" },
  ],
  features: [
    {
      icon: FaBolt,
      title: "Tezkor savollar",
      description: "18 soniya ichida javob bering va bonus ball oling.",
      stat: "18s",
    },
    {
      icon: GiPodium,
      title: "Reyting tizimi",
      description: "Natijalar saqlanadi va kuchli o'yinchilar ko'rinadi.",
      stat: "Top 10",
    },
    {
      icon: FaCrown,
      title: "Combo bonus",
      description: "Ketma-ket to'g'ri javoblar qo'shimcha ball beradi.",
      stat: "+25",
    },
  ],
  levels: [
    {
      icon: FaStar,
      title: "Boshlang'ich",
      detail: "Yengil savollar bilan qizib olish",
      meta: "5-7 savol",
      progress: 33,
    },
    {
      icon: GiBrain,
      title: "O'rta",
      detail: "Tezlik va bilim birga sinovdan o'tadi",
      meta: "8-12 savol",
      progress: 66,
    },
    {
      icon: FaCrown,
      title: "Professional",
      detail: "Eng tez va aniq jamoalar uchun",
      meta: "12-15 savol",
      progress: 100,
    },
  ],
  highlights: [
    { icon: FaTrophy, label: "Reyting", value: "Top natijalar" },
    { icon: FaBolt, label: "Combo", value: "Bonus ball" },
    { icon: GiAchievement, label: "Maqsad", value: "Chempionlik" },
  ],
};

export default function QuizBattlePage() {
  return <GameLandingPage config={quizBattleConfig} />;
}
