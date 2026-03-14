import { FaBolt, FaBrain, FaClock, FaCrown, FaStar, FaTrophy, FaUsers } from "react-icons/fa";
import { GiChicken, GiPathDistance, GiPodiumWinner, GiTwoCoins } from "react-icons/gi";
import { MdEmojiEvents, MdNumbers, MdSpeed } from "react-icons/md";
import GameFeedbackPanel from "../shared/GameFeedbackPanel";
import GamePagePlayButton from "../shared/GamePagePlayButton";
import matematik from "../../../assets/math_chick_img.png";

const mathChickGradient = "from-[#3b82f6] via-[#7c3aed] to-[#ec4899]";

export default function MathChickGamePage() {
  const gameStats = [
    { icon: FaClock, label: "DAVOMIYLIK", value: "5-10 daqiqa", color: "from-yellow-400 to-orange-400" },
    { icon: MdNumbers, label: "TUR", value: "Matematik mashq", color: "from-orange-400 to-amber-400" },
    { icon: FaUsers, label: "O'YINCHI", value: "1 o'quvchi", color: "from-amber-400 to-yellow-400" },
    { icon: FaBolt, label: "QOIDA", value: "1 xato = tugaydi", color: "from-pink-400 to-rose-400" },
  ];

  const features = [
    {
      icon: GiChicken,
      title: "Cute jo'jacha",
      desc: "To'g'ri javobdan keyin jo'jacha yo'lda oldinga yuradi.",
      color: "from-yellow-400 to-orange-400",
      bgIcon: MdSpeed,
      stats: "Walk",
    },
    {
      icon: GiTwoCoins,
      title: "Tanga misollar",
      desc: "Misollar tangada chiqadi va variantlardan javob tanlanadi.",
      color: "from-orange-400 to-amber-400",
      bgIcon: MdNumbers,
      stats: "4 variant",
    },
    {
      icon: FaBrain,
      title: "Daraja tanlash",
      desc: "Oson, O'rtacha, Qiyin va Aralash category bilan mashq qiling.",
      color: "from-fuchsia-400 to-pink-400",
      bgIcon: GiPathDistance,
      stats: "4 level",
    },
  ];

  const levels = [
    {
      level: "OSON",
      questions: "Qo'shish va ayirish",
      time: "5 min",
      icon: FaStar,
      color: "from-yellow-400 to-orange-400",
      progress: 34,
    },
    {
      level: "O'RTA",
      questions: "Ko'paytirish va bo'lish",
      time: "8 min",
      icon: FaBrain,
      color: "from-orange-400 to-amber-400",
      progress: 68,
    },
    {
      level: "PROFESSIONAL",
      questions: "Aralash va tezkor",
      time: "10 min",
      icon: FaCrown,
      color: "from-pink-400 to-rose-400",
      progress: 100,
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#07152f] via-[#0b234b] to-[#07152f]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full bg-yellow-600/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[560px] w-[560px] rounded-full bg-pink-600/15 blur-3xl" />
        <div className="absolute top-1/3 left-1/3 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />

        {[...Array(34)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white/15"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.2 + Math.random() * 0.35,
            }}
          />
        ))}

        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(250,204,21,0.05) 2px, transparent 0)",
            backgroundSize: "46px 46px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-4 py-6 md:px-6 md:py-8 lg:px-8 xl:px-10">
        <div className="group relative mb-8 overflow-hidden rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-[#16274c]/80 via-[#1b2f58]/80 to-[#132343]/80 p-6 shadow-2xl backdrop-blur-xl md:p-8 lg:p-10">
          <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-500/20 via-orange-500/15 to-pink-500/20" />
          </div>

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/15 to-orange-500/15 px-4 py-2">
                <GiChicken className="text-yellow-300" />
                <span className="text-sm font-black text-transparent bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text">
                  MATH CHICK ARENA
                </span>
                <div className="ml-2 flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </div>
              </div>

              <h1 className="text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-white via-yellow-100 to-orange-100 bg-clip-text text-transparent">
                  Matematik
                </span>
                <br />
                <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
                  jo'jacha
                </span>
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-slate-200/85 md:text-lg">
                Jo'jacha bilan yo'lda misollarni yeching, tangalarni oching va har bir to'g'ri
                javob bilan oldinga yuring. Bitta xato bo'lsa o'yin tugaydi.
              </p>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {gameStats.map((stat, index) => (
                  <div
                    key={index}
                    className="group/stat relative overflow-hidden rounded-xl border border-yellow-500/20 bg-slate-950/25 p-4 backdrop-blur-sm transition-all hover:scale-[1.02] hover:bg-slate-900/35"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 transition-opacity group-hover/stat:opacity-15`}
                    />
                    <div className="relative">
                      <div className={`mb-2 inline-flex rounded-lg bg-gradient-to-r ${stat.color} p-2`}>
                        <stat.icon className="text-lg text-white" />
                      </div>
                      <p className="text-xs font-bold text-yellow-100/65">{stat.label}</p>
                      <p className="text-sm font-black text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <GamePagePlayButton
                to="/games/math-chick/play"
                colorClassName={mathChickGradient}
                className="pt-2"
              />
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-yellow-500/25 via-orange-500/15 to-pink-500/20 blur-2xl" />

              <div className="relative overflow-hidden rounded-2xl border-2 border-yellow-500/25 shadow-2xl">
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0c1734] via-transparent to-transparent" />
                <img
                  src={matematik}
                  alt="Math Chick preview"
                  className="h-[300px] w-full object-cover md:h-[400px] lg:h-[450px]"
                />

                <div className="absolute bottom-4 left-4 z-20 inline-flex items-center gap-3 rounded-2xl border border-yellow-500/30 bg-black/40 px-4 py-2 backdrop-blur-md">
                  <GiChicken className="text-yellow-300" />
                  <span className="text-sm font-black text-white">MATH CHICK</span>
                  <div className="ml-1 flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-yellow-400" />
                    <span className="h-2 w-2 rounded-full bg-orange-400" />
                    <span className="h-2 w-2 rounded-full bg-pink-400" />
                  </div>
                </div>

                <div className="absolute right-4 top-4 z-20 flex gap-2">
                  <div className="rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 px-3 py-1 text-xs font-bold text-white">
                    4.9/5
                  </div>
                  <div className="rounded-full bg-gradient-to-r from-orange-600 to-pink-600 px-3 py-1 text-xs font-bold text-white">
                    YANGI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-[#132343]/70 to-[#1a2f57]/70 p-6 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:border-yellow-400/30"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 transition-opacity group-hover:opacity-10`} />
              <feature.bgIcon className="absolute right-2 top-2 text-4xl text-yellow-500/15 transition-all group-hover:text-yellow-300/25" />

              <div className={`relative mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-xl`}>
                <feature.icon className="text-2xl" />
              </div>

              <h3 className="relative mb-2 text-lg font-black text-white">{feature.title}</h3>
              <p className="relative mb-3 text-sm text-slate-200/80">{feature.desc}</p>

              <div className="relative flex items-center gap-2">
                <span className="text-xs font-bold text-yellow-300">{feature.stats}</span>
                <div className="h-1 flex-1 rounded-full bg-yellow-500/20">
                  <div className={`h-full rounded-full bg-gradient-to-r ${feature.color}`} style={{ width: "75%" }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {levels.map((level, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-[#132343]/70 to-[#1a2f57]/70 p-6 backdrop-blur-sm transition-all hover:border-yellow-400/30"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${level.color} opacity-0 transition-opacity group-hover:opacity-10`} />

              <level.icon className={`relative mx-auto mb-3 text-4xl bg-gradient-to-r ${level.color} bg-clip-text text-transparent`} />
              <h4 className="relative mb-2 text-center text-base font-black text-white">{level.level}</h4>
              <p className="relative mb-1 text-center text-xs text-slate-200/70">{level.questions}</p>
              <p className="relative mb-4 text-center text-xs text-slate-200/70">{level.time}</p>

              <div className="relative h-2 rounded-full bg-yellow-500/20">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${level.color}`}
                  style={{ width: `${level.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="relative">
          <GameFeedbackPanel gameKey="math-chick" />
        </div>

        <div className="relative mt-10 flex justify-center gap-6 text-5xl text-yellow-500/20 md:text-6xl">
          <MdEmojiEvents />
          <GiPodiumWinner />
          <FaTrophy />
          <FaCrown />
        </div>
      </div>
    </div>
  );
}
