import {
  FaDice,
  FaUsers,
  FaTrophy,
  FaCrown,
  FaStar,
  FaTree,
} from "react-icons/fa";
import {
  GiJungle,
  GiGiant,
  GiPotionBall,
  GiAchievement,
  GiPodium,
  GiSpinningWheel,
  GiChest,
  GiSnake,
} from "react-icons/gi";
import { MdTimer } from "react-icons/md";
import img from "../../../assets/jumanji_board.png"
import GameFeedbackPanel from "../shared/GameFeedbackPanel";
import GamePagePlayButton from "../shared/GamePagePlayButton";

function JumanjiPage() {
  const JumanjiImg = img; 
  const gameStats = [
    {
      icon: <FaUsers className="text-2xl text-white" />,
      label: "JAMOALAR",
      value: "4 ta",
      color: "from-amber-500 to-yellow-500",
    },
    {
      icon: <MdTimer className="text-2xl text-white" />,
      label: "DAVOMIYLIK",
      value: "10-15 daqiqa",
      color: "from-yellow-500 to-amber-600",
    },
    {
      icon: <FaDice className="text-2xl text-white" />,
      label: "KATAKLAR",
      value: "Dinamik",
      color: "from-amber-600 to-orange-500",
    },
    {
      icon: <FaTrophy className="text-2xl text-white" />,
      label: "MAKSIMUM",
      value: "500+ ball",
      color: "from-orange-500 to-amber-500",
    },
  ];

  const tileTypes = [
    {
      icon: <FaStar className="text-2xl" />,
      title: "Savol",
      desc: "Fan savollari, 4 variant",
      color: "from-amber-500 to-yellow-500",
      bgIcon: FaStar,
      stats: "50%",
    },
    {
      icon: <GiChest className="text-2xl" />,
      title: "Bonus",
      desc: "Qo'shimcha ball",
      color: "from-green-500 to-emerald-500",
      bgIcon: FaStar,
      stats: "15%",
    },
    {
      icon: <GiSnake className="text-2xl" />,
      title: "Tuzoq",
      desc: "Ball yo'qotish",
      color: "from-red-500 to-rose-500",
      bgIcon: FaTree,
      stats: "15%",
    },
    {
      icon: <GiPotionBall className="text-2xl" />,
      title: "Mini Challenge",
      desc: "Maxsus topshiriq",
      color: "from-purple-500 to-pink-500",
      bgIcon: GiSpinningWheel,
      stats: "10%",
    },
    {
      icon: <GiGiant className="text-2xl" />,
      title: "Boss",
      desc: "Katta mukofot",
      color: "from-yellow-500 to-amber-500",
      bgIcon: FaCrown,
      stats: "10%",
    },
  ];

  const subjects = [
    { name: "Matematika", icon: "🧮", color: "from-blue-500 to-cyan-500" },
    { name: "Tarix", icon: "🏺", color: "from-amber-500 to-orange-500" },
    { name: "Geografiya", icon: "🌍", color: "from-green-500 to-emerald-500" },
    { name: "Kimyo", icon: "🧪", color: "from-purple-500 to-pink-500" },
    { name: "Ingliz tili", icon: "🇬🇧", color: "from-red-500 to-rose-500" },
    { name: "Informatika", icon: "💻", color: "from-cyan-500 to-blue-500" },
  ];

  const gameRules = [
    { text: "Kubik tashlab, jungle bo'ylab sayohat qiling", icon: "🎲" },
    { text: "Juft tashlasangiz, yana bir marta tashlash huquqi", icon: "🔁" },
    { text: "Marraga birinchi yetgan jamoa g'olib", icon: "🏆" },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-amber-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse-slower rounded-full bg-yellow-600/20 blur-3xl" />
        
        {/* Jungle Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, #f59e0b 2px, transparent 2px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating Jungle Elements */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl opacity-10 animate-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 20}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              {["🌿", "🐍", "🌴", "🗿", "🔥", "🪙", "🦁", "🎯"][i % 8]}
            </div>
          ))}
        </div>

        {/* Vintage Paper Texture */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 xl:px-10">
        {/* Hero Section */}
        <div className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-900/40 via-yellow-900/40 to-amber-900/40 p-6 backdrop-blur-xl shadow-2xl md:p-8 lg:p-10">
          {/* Animated Gradient Border */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/30 via-yellow-500/30 to-amber-500/30" />
          </div>

          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 h-20 w-20 border-l-4 border-t-4 border-amber-500/30 rounded-tl-3xl" />
          <div className="absolute top-0 right-0 h-20 w-20 border-r-4 border-t-4 border-amber-500/30 rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 h-20 w-20 border-l-4 border-b-4 border-amber-500/30 rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 h-20 w-20 border-r-4 border-b-4 border-amber-500/30 rounded-br-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 px-4 py-2 border border-amber-500/30">
                <GiJungle className="text-amber-400 animate-pulse" />
                <span className="text-sm font-black text-transparent bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 bg-clip-text">
                  JUMANJI
                </span>
                <div className="ml-2 flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-5xl font-black md:text-6xl lg:text-7xl">
                <span className="relative inline-block">
                  <span className="absolute  bg-gradient-to-r from-yellow-500/30 to-amber-500/30 blur-2xl" />
                  <span className="relative bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-300 bg-clip-text text-transparent">
                    Jumanji
                  </span>
                </span>
              </h1>

              {/* Description */}
              <div className="relative max-w-xl rounded-xl bg-amber-950/30 p-4 border border-amber-500/30 backdrop-blur-sm">
                <p className="text-base text-amber-200/80 md:text-lg leading-relaxed">
                  Jungle bo'ylab sayohat qiling, kubik tashlang va savollarga javob bering. 
                  Marraga birinchi yetgan jamoa g'olib bo'ladi!
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {gameStats.map((stat, index) => (
                  <div
                    key={index}
                    className="group/stat relative transform-gpu overflow-hidden rounded-xl border border-amber-500/20 bg-amber-950/30 p-4 backdrop-blur-sm transition-all hover:scale-105 hover:bg-amber-900/40"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover/stat:opacity-20 transition-opacity`} />
                    <div className="relative">
                      <div className={`mb-2 inline-flex rounded-lg bg-gradient-to-r ${stat.color} p-2.5 shadow-lg`}>
                        {stat.icon}
                      </div>
                      <p className="text-xs font-bold text-amber-300/70">{stat.label}</p>
                      <p className="text-sm font-black text-white mt-1">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Game Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {gameRules.map((rule, index) => (
                  <div key={index} className="text-center p-2 bg-amber-950/30 rounded-xl border border-amber-500/30">
                    <span className="text-2xl mb-1 block">{rule.icon}</span>
                    <p className="text-xs text-amber-200/70">{rule.text}</p>
                  </div>
                ))}
              </div>
            <GamePagePlayButton
                to="/games/jumanji/play"
                colorClassName="from-amber-500 to-yellow-500"
                className="pt-2"
              />
            </div>

            {/* Right Content - Jungle Preview */}
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-8 -left-8 text-6xl rotate-12 animate-float">🌴</div>
              <div className="absolute -bottom-8 -right-8 text-6xl -rotate-12 animate-float-delayed">🐍</div>

              {/* Preview Board */}
              <div className="relative transform-gpu overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-900/50 to-yellow-900/50 p-6 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-amber-950/80 via-transparent to-transparent z-10" />
                
                <img
                  src={JumanjiImg}
                  alt="Jumanji Board"
                  className="relative z-0 h-[360px] w-full rounded-lg border border-amber-500/20 object-cover md:h-[440px] lg:h-[520px]"
                />

                {/* Overlay Badge */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-black/50 backdrop-blur-md px-4 py-2 border border-amber-500/30">
                    <FaDice className="text-amber-400 text-lg animate-bounce" />
                    <span className="text-sm font-black text-white">DINAMIK KATAK - 4 JAMOA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tile Types */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
            <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
              KATAK TURLARI
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {tileTypes.map((tile, index) => (
              <div
                key={index}
                className="group relative transform-gpu overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-yellow-950/30 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-amber-400/30"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${tile.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                
                <div className="relative text-center">
                  <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${tile.color} text-white shadow-lg`}>
                    {tile.icon}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{tile.title}</h3>
                  <p className="text-xs text-amber-200/70 mb-2">{tile.desc}</p>
                  <span className="text-xs font-bold text-amber-400">{tile.stats}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
            <span className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
              FANLAR
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {subjects.map((subject, index) => (
              <div
                key={index}
                className="group relative transform-gpu overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-950/30 to-yellow-950/30 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl text-center"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${subject.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="relative">
                  <span className="text-3xl mb-2 block">{subject.icon}</span>
                  <h3 className="text-sm font-bold text-white">{subject.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Component Container */}
        <div className="relative">
          <GameFeedbackPanel gameKey="jumanji" />
        </div>

        {/* Footer */}
        <div className="relative mt-10 flex justify-center items-center gap-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

          <div className="flex gap-4 text-4xl text-amber-600/30">
            <GiAchievement
              className="hover:text-amber-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <GiPodium
              className="hover:text-amber-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <FaTrophy
              className="hover:text-amber-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
            <GiSpinningWheel
              className="hover:text-amber-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.6s" }}
            />
            <FaCrown
              className="hover:text-amber-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.8s" }}
            />
          </div>

          <div className="h-px w-12 bg-gradient-to-r from-amber-500/30 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default JumanjiPage;



