import { FaCrown, FaImage, FaPuzzlePiece, FaStar, FaTrophy, FaUsers } from "react-icons/fa";
import { GiAchievement, GiJigsawBox, GiJigsawPiece } from "react-icons/gi";
import { MdTimer } from "react-icons/md";
import GameLandingPage, {
  type GameLandingPageConfig,
} from "../shared/GameLandingPage";
import miniPuzzleImg from "../../../assets/mini_puzzle_image.png";

const miniPuzzleConfig: GameLandingPageConfig = {
  badge: "Rasmni yig'",
  badgeIcon: GiJigsawPiece,
  title: ["Mini", "Puzzle"],
  description:
    "Ikki jamoa rasm bo'laklarini yig'adi. Kim birinchi bo'lib to'liq rasmni hosil qilsa, o'sha jamoa yuqori ball oladi.",
  image: miniPuzzleImg,
  imageAlt: "Mini Puzzle o'yini",
  playPath: "/games/mini-puzzle/play",
  gameKey: "mini-puzzle",
  modeSelectionEnabled: true,
  theme: {
    accent: "from-pink-500 via-rose-500 to-fuchsia-500",
    accentSoft: "from-fuchsia-100 via-pink-100 to-rose-100",
    page: "bg-[linear-gradient(135deg,#120b18_0%,#231223_50%,#35131d_100%)]",
    panel: "bg-[linear-gradient(145deg,rgba(255,225,245,0.12),rgba(255,255,255,0.035))]",
    border: "border-pink-200/14",
    text: "text-pink-200",
    mutedText: "text-pink-50/72",
    glow: "via-pink-300",
  },
  metrics: [
    { icon: FaUsers, label: "Jamoalar", value: "2 ta" },
    { icon: MdTimer, label: "Davomiylik", value: "5-10 daqiqa" },
    { icon: GiJigsawBox, label: "Bo'laklar", value: "4-9 ta" },
    { icon: FaTrophy, label: "Maksimum", value: "500+ ball" },
  ],
  features: [
    {
      icon: GiJigsawPiece,
      title: "Rasmni yig'",
      description: "4, 6 yoki 9 bo'lakli puzzle rejimlari.",
      stat: "3 qiyinlik",
    },
    {
      icon: FaUsers,
      title: "2 jamoa",
      description: "Chap va o'ng jamoa navbat bilan musobaqalashadi.",
      stat: "Team play",
    },
    {
      icon: GiAchievement,
      title: "Ball tizimi",
      description: "Tezroq yig'ilgan puzzle ko'proq ball olib keladi.",
      stat: "50+ ball",
    },
  ],
  levels: [
    {
      icon: FaStar,
      title: "Oson",
      detail: "Katta bo'laklar, tez yig'iladigan rasm",
      meta: "4 bo'lak",
      progress: 33,
    },
    {
      icon: FaImage,
      title: "O'rtacha",
      detail: "Diqqat va joylashuvni aniq topish kerak",
      meta: "6 bo'lak",
      progress: 66,
    },
    {
      icon: FaCrown,
      title: "Qiyin",
      detail: "Mayda bo'laklar va kuchliroq raqobat",
      meta: "9 bo'lak",
      progress: 100,
    },
  ],
  highlights: [
    { icon: FaPuzzlePiece, label: "Puzzle", value: "4-9 bo'lak" },
    { icon: FaUsers, label: "Jamoalar", value: "2 tomon" },
    { icon: FaTrophy, label: "Maqsad", value: "500+ ball" },
  ],
};

export default function MiniPuzzlePage() {
  return <GameLandingPage config={miniPuzzleConfig} />;
}
