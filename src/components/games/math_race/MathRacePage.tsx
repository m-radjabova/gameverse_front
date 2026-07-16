import {
  FaBolt,
  FaCar,
  FaCrown,
  FaFlagCheckered,
  FaGaugeHigh,
  FaRocket,
  FaStar,
  FaUsers,
} from "react-icons/fa6";
import { GiRaceCar, GiSteeringWheel } from "react-icons/gi";
import { MdNumbers, MdSpeed, MdTimer } from "react-icons/md";
import GameLandingPage, {
  type GameLandingPageConfig,
} from "../shared/GameLandingPage";
import raceImg from "../../../assets/math_race-image.png";

const mathRaceConfig: GameLandingPageConfig = {
  badge: "Math Race",
  badgeIcon: GiSteeringWheel,
  title: ["Matematik", "poyga"],
  description:
    "Ikki o'yinchi tezkor misol ishlash musobaqasida qatnashadi. Kim tez va to'g'ri javob bersa, uning mashinasi marraga yaqinlashadi.",
  image: raceImg,
  imageAlt: "Matematik poyga o'yini",
  playPath: "/games/math-race/play",
  gameKey: "math-race",
  theme: {
    accent: "from-yellow-500 via-orange-500 to-red-500",
    accentSoft: "from-amber-100 via-orange-100 to-rose-100",
    page: "bg-[linear-gradient(135deg,#07111f_0%,#121827_48%,#1d1116_100%)]",
    panel: "bg-[linear-gradient(145deg,rgba(255,255,255,0.105),rgba(255,255,255,0.035))]",
    border: "border-white/12",
    text: "text-amber-200",
    mutedText: "text-slate-200/74",
    glow: "via-orange-400",
  },
  metrics: [
    { icon: FaUsers, label: "O'yinchilar", value: "2 kishi" },
    { icon: MdTimer, label: "Davomiylik", value: "5-10 min" },
    { icon: GiRaceCar, label: "Mashinalar", value: "2 ta" },
    { icon: MdNumbers, label: "Misollar", value: "10+ ta" },
  ],
  features: [
    {
      icon: GiRaceCar,
      title: "Tezkor poyga",
      description: "Har bir to'g'ri javob mashinani oldinga suradi.",
      stat: "8% harakat",
    },
    {
      icon: MdSpeed,
      title: "Vaqt bonusi",
      description: "Tez javoblar qo'shimcha tezlik va ustunlik beradi.",
      stat: "0.2x bonus",
    },
    {
      icon: FaFlagCheckered,
      title: "Marraga yeting",
      description: "100% masofani birinchi bosib o'tgan o'yinchi yutadi.",
      stat: "100% track",
    },
  ],
  levels: [
    {
      icon: FaStar,
      title: "Oson",
      detail: "5 + 5 kabi tezkor misollar",
      meta: "20 soniya",
      progress: 33,
    },
    {
      icon: FaGaugeHigh,
      title: "O'rtacha",
      detail: "Aralash amallar va tez fikrlash",
      meta: "15 soniya",
      progress: 66,
    },
    {
      icon: FaCrown,
      title: "Qiyin",
      detail: "Murakkabroq misollar va katta raqobat",
      meta: "10 soniya",
      progress: 100,
    },
  ],
  highlights: [
    { icon: FaCar, label: "Qizil raketa", value: "280 km/h" },
    { icon: FaBolt, label: "Sariq chaqmoq", value: "275 km/h" },
    { icon: FaRocket, label: "Bonus", value: "2x tezlik" },
  ],
};

export default function MathRacePage() {
  return <GameLandingPage config={mathRaceConfig} />;
}
