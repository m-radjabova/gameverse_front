import {
  FaUsers,
  FaTrophy,
  FaCrown,
  FaCoins,
  FaQuestion
} from "react-icons/fa";
import {
  GiAchievement,
  GiPodium,
  GiSpinningWheel,
  GiBrain,
  GiMoneyStack,
} from "react-icons/gi";
import img from "../../../assets/millionaire_photo.jpg";
import GameFeedbackPanel from "../shared/GameFeedbackPanel";
import GamePagePlayButton from "../shared/GamePagePlayButton";

function MillionairePage() {
  const gameStats = [
    {
      icon: <FaUsers className="text-2xl text-white" />,
      label: "O'YINCHILAR",
      value: "3-5 kishi",
      color: "from-yellow-500 to-amber-500",
    },
    {
      icon: <GiMoneyStack className="text-2xl text-white" />,
      label: "MAKSIMUM YUTUQ",
      value: "15 000 000 so'm",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: <FaQuestion className="text-2xl text-white" />,
      label: "SAVOLLAR",
      value: "4 daraja",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: <FaCrown className="text-2xl text-white" />,
      label: "G'OLIB",
      value: "Eng ko'p pul",
      color: "from-red-500 to-yellow-500",
    },
  ];

  const features = [
    {
      icon: GiMoneyStack,
      title: "Pul pog'onasi",
      desc: "15 pog'onali pul ro'yxati, har bir to'g'ri javob bilan yuqoriga ko'tarilasiz",
      color: "from-yellow-500 to-amber-500",
      bgIcon: FaCoins,
      stats: "15 pog'ona",
    },
    {
      icon: GiBrain,
      title: "4 qiyinlik darajasi",
      desc: "Easy → Medium → Hard → Expert. Har bir pog'ona bilan savol qiyinlashadi",
      color: "from-amber-500 to-orange-500",
      bgIcon: FaQuestion,
      stats: "Easy, Medium, Hard, Expert",
    },
    {
      icon: FaCrown,
      title: "Safe level tizimi",
      desc: "5, 10, 15-pog'onalar xavfsiz - bu yerdan yiqilgan taqdirda ham shu yerga qaytasiz",
      color: "from-orange-500 to-red-500",
      bgIcon: FaTrophy,
      stats: "5, 10, 15",
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#020617] via-[#0b1a33] to-[#020617]">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-yellow-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse-slower rounded-full bg-amber-500/20 blur-3xl" />
        
        {/* Gold Coin Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 20px 20px, #fbbf24 2px, transparent 2px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Floating Coins */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl opacity-20 animate-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 20}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              {["💰", "🪙", "💎", "💵", "💰", "🪙"][i % 6]}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 xl:px-10">
        {/* Hero Section */}
        <div className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border-2 border-yellow-500/30 bg-gradient-to-br from-[#1e2b4f]/80 via-[#2d3a5f]/80 to-[#1e2b4f]/80 p-6 shadow-2xl backdrop-blur-sm md:p-8 lg:p-10">
          {/* Animated Border */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-500/30 via-amber-500/30 to-orange-500/30 animate-gradient" />
          </div>

          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 text-4xl opacity-30 animate-bounce">💰</div>
          <div className="absolute top-0 right-0 text-4xl opacity-30 animate-bounce delay-100">🪙</div>
          <div className="absolute bottom-0 left-0 text-4xl opacity-30 animate-bounce delay-200">💎</div>
          <div className="absolute bottom-0 right-0 text-4xl opacity-30 animate-bounce delay-300">💵</div>

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Game Badge */}
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-amber-500 blur-xl rounded-full animate-pulse" />
                <div className="relative flex items-center gap-3 rounded-full bg-gradient-to-r from-[#1e2b4f] to-[#2d3a5f] px-5 py-2 border-2 border-yellow-500/50 shadow-xl">
                  <GiMoneyStack className="text-yellow-400 text-xl animate-pulse" />
                  <span className="text-sm font-black tracking-wider text-transparent bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text">
                    MILLIONER
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="relative">
                <h1 className="text-5xl font-black leading-tight md:text-6xl lg:text-7xl">
                  <span className="relative inline-block">
                    <span className="absolute -inset-2 bg-gradient-to-r from-yellow-500/30 to-amber-500/30 blur-2xl" />
                    <span className="relative bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                      Kim millioner
                    </span>
                  </span>
                  <br />
                  <span className="relative inline-block mt-2">
                    <span className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-orange-500/30 blur-2xl" />
                    <span className="relative bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                      bo'lishni xohlaydi?
                    </span>
                  </span>
                </h1>

                {/* Decorative Line */}
                <div className="relative mt-4 h-1 w-32 overflow-hidden rounded-full bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500">
                  <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                </div>
              </div>

              {/* Description */}
              <div className="relative max-w-xl rounded-xl bg-[#1e2b4f]/50 p-4 border-2 border-yellow-500/30 backdrop-blur-sm">
                <p className="text-base text-blue-200 md:text-lg leading-relaxed">
                  3-5 o'yinchi navbat bilan savollarga javob beradi. Har bir to'g'ri javob bilan 
                  pul pog'onasida yuqoriga ko'tarilasiz. Xato javobda xavfsiz pog'onaga qaytasiz!
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {gameStats.map((stat, index) => (
                  <div
                    key={index}
                    className="group/stat relative transform-gpu overflow-hidden rounded-xl border-2 border-yellow-500/30 bg-[#1e2b4f]/50 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover/stat:opacity-20 transition-opacity duration-500`}
                    />
                    <div className="relative">
                      <div
                        className={`mb-2 inline-flex rounded-lg bg-gradient-to-r ${stat.color} p-2.5 shadow-lg`}
                      >
                        {stat.icon}
                      </div>
                      <p className="text-xs font-bold text-blue-300 tracking-wider">
                        {stat.label}
                      </p>
                      <p className="text-sm font-black text-white mt-1">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            <GamePagePlayButton
                to="/games/millionaire/play"
                colorClassName="from-yellow-500 to-orange-500"
                className="pt-2"
              />
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-8 -left-8 text-6xl rotate-12 animate-bounce">💰</div>
              <div className="absolute -bottom-8 -right-8 text-6xl -rotate-12 animate-bounce delay-200">🪙</div>

              <div className="relative transform-gpu overflow-hidden rounded-2xl border-4 border-yellow-500/40 bg-gradient-to-br from-yellow-800/40 to-amber-900/40 p-3 shadow-2xl">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-black/10 via-transparent to-yellow-300/10" />
                <img
                  src={img}
                  alt="Millionaire game preview"
                  className="relative h-[360px] w-full rounded-xl object-cover md:h-[430px] lg:h-[500px]"
                />
                <div className="absolute inset-x-6 bottom-5 z-10">
                  <div className="inline-flex items-center gap-3 rounded-2xl border border-yellow-500/50 bg-black/55 px-4 py-2 shadow-xl backdrop-blur-md">
                    <GiMoneyStack className="text-lg text-yellow-400 animate-pulse" />
                    <span className="text-sm font-black tracking-wide text-white">
                      15 POG'ONA · 4 DARAJA · SAFE 5,10,15
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative transform-gpu overflow-hidden rounded-2xl border-2 border-yellow-500/30 bg-[#1e2b4f]/50 p-6 backdrop-blur-sm transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:border-yellow-500/50"
            >
              {/* Animated Background */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700"
                style={{
                  backgroundImage: `radial-gradient(circle at ${30 + index * 20}% ${40 + index * 10}%, #fbbf24 0%, transparent 50%)`,
                }}
              />

              {/* Corner Decorations */}
              <div className="absolute top-2 left-2 h-6 w-6 border-l-2 border-t-2 border-yellow-500/50 group-hover:border-yellow-400 transition-colors" />
              <div className="absolute top-2 right-2 h-6 w-6 border-r-2 border-t-2 border-amber-500/50 group-hover:border-amber-400 transition-colors" />
              <div className="absolute bottom-2 left-2 h-6 w-6 border-l-2 border-b-2 border-orange-500/50 group-hover:border-orange-400 transition-colors" />
              <div className="absolute bottom-2 right-2 h-6 w-6 border-r-2 border-b-2 border-yellow-500/50 group-hover:border-yellow-400 transition-colors" />

              {/* Decorative Icon */}
              <feature.bgIcon className="absolute right-4 top-4 text-5xl text-yellow-500/20 group-hover:text-yellow-500/30 transition-all group-hover:scale-110 group-hover:rotate-12" />

              {/* Icon */}
              <div
                className={`relative mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl`}
              >
                <feature.icon className="text-2xl" />
              </div>

              {/* Content */}
              <h3 className="relative mb-2 text-xl font-black text-white">{feature.title}</h3>
              <p className="relative mb-4 text-sm text-blue-200">{feature.desc}</p>

              {/* Stats Bar */}
              <div className="relative flex items-center gap-2">
                <span className="text-xs font-bold text-yellow-400">{feature.stats}</span>
                <div className="h-1.5 flex-1 rounded-full bg-blue-800/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${feature.color} transition-all duration-500 group-hover:animate-pulse`}
                    style={{ width: "85%" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Difficulty Levels */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
            <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
              QIYINLIK DARAJALARI
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-yellow-500/30 to-transparent" />
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "OSON", color: "from-green-600 to-green-500", desc: "1-4 pog'onalar" },
              { name: "O'RTA", color: "from-yellow-600 to-amber-500", desc: "5-8 pog'onalar" },
              { name: "QIYIN", color: "from-orange-600 to-red-500", desc: "9-12 pog'onalar" },
              { name: "EKSPERT", color: "from-red-600 to-rose-500", desc: "13-15 pog'onalar" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative transform-gpu overflow-hidden rounded-xl border-2 border-yellow-500/30 bg-[#1e2b4f]/50 p-5 backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl text-center"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="relative">
                  <h3 className="text-lg font-black text-white mb-2">{item.name}</h3>
                  <p className="text-sm text-blue-300">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Component Container */}
        <div className="relative">
         <GameFeedbackPanel gameKey="millionaire" />
        </div>

        {/* Footer */}
        <div className="relative mt-12 flex justify-center items-center gap-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />

          <div className="flex gap-4 text-4xl text-yellow-500/30">
            <GiAchievement className="hover:text-yellow-500/50 transition-colors animate-bounce" />
            <GiPodium className="hover:text-yellow-500/50 transition-colors animate-bounce delay-100" />
            <FaTrophy className="hover:text-yellow-500/50 transition-colors animate-bounce delay-200" />
            <GiSpinningWheel className="hover:text-yellow-500/50 transition-colors animate-bounce delay-300" />
            <FaCrown className="hover:text-yellow-500/50 transition-colors animate-bounce delay-400" />
          </div>

          <div className="h-px w-12 bg-gradient-to-r from-yellow-500/30 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default MillionairePage;



