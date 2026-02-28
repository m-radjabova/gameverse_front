import {
  FaChild,
  FaSmile,
  FaStar,
  FaTrophy,
  FaUsers,
  FaHeart,
  FaGamepad,
  FaLaugh,
  FaRocket,
} from "react-icons/fa";
import {
  GiPartyPopper,
  GiAchievement,
  GiPodium,
  GiSpinningWheel,
  GiConversation,
} from "react-icons/gi";
import { MdChildCare, MdSchool } from "react-icons/md";
import {RiEmotionHappyFill } from "react-icons/ri";
import Bingo from "./Bingo";
import GameFeedbackPanel from "../shared/GameFeedbackPanel";

function BingoPage() {
  const tanishuvImg = "https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const gameStats = [
    {
      icon: <FaChild className="text-2xl text-white" />,
      label: "ISHTIROKCHILAR",
      value: "2-30 kishi",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      icon: <GiConversation className="text-2xl text-white" />,
      label: "SAVOLLAR",
      value: "16 ta",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: <MdChildCare className="text-2xl text-white" />,
      label: "YOSHI",
      value: "6-12 yosh",
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-500/10",
    },
    {
      icon: <FaTrophy className="text-2xl text-white" />,
      label: "MUKOFOT",
      value: "Bingo!",
      color: "from-pink-500 to-yellow-500",
      bgColor: "bg-pink-500/10",
    },
  ];

  const features = [
    {
      icon: GiConversation,
      title: "Do'stlashish",
      desc: "Bolalar bir-birlari bilan suhbatlashib, yangi do'stlar orttiradi",
      color: "from-yellow-500 to-orange-500",
      bgIcon: FaLaugh,
      stats: "30+ o'quvchi",
    },
    {
      icon: MdSchool,
      title: "Sinf jamoasi",
      desc: "Sinfdoshlar haqida qiziqarli ma'lumotlar to'plash",
      color: "from-orange-500 to-red-500",
      bgIcon: FaUsers,
      stats: "16 katak",
    },
    {
      icon: GiPartyPopper,
      title: "Bingo!",
      desc: "Birinchi bo'lib barcha kataklarni to'ldirgan g'olib",
      color: "from-red-500 to-pink-500",
      bgIcon: FaStar,
      stats: "G'olibga sovrin",
    },
  ];

  const bingoLevels = [
    {
      level: "BOSHLANG'ICH",
      age: "6-7 yosh",
      time: "10-15 min",
      icon: FaSmile,
      color: "from-green-500 to-emerald-500",
      progress: 25,
      emoji: "🌱",
    },
    {
      level: "O'RTA",
      age: "8-9 yosh",
      time: "8-12 min",
      icon: FaStar,
      color: "from-yellow-500 to-amber-500",
      progress: 50,
      emoji: "⭐",
    },
    {
      level: "TAJRIBALI",
      age: "10-12 yosh",
      time: "5-8 min",
      icon: FaRocket,
      color: "from-orange-500 to-red-500",
      progress: 75,
      emoji: "🚀",
    },
  ];

  const sampleQuestions = [
    { text: "DOVON QILA OLADIGAN", emoji: "🤸", color: "bg-yellow-400" },
    { text: "KO'ZOYNAK TAQADIGAN", emoji: "👓", color: "bg-blue-400" },
    { text: "RAQSGA TUSHISHNI YAXSHI KO'RADIGAN", emoji: "💃", color: "bg-pink-400" },
    { text: "UY HAYVONI BOR", emoji: "🐶", color: "bg-green-400" },
    { text: "SUZISHNI YAXSHI KO'RADIGAN", emoji: "🏊", color: "bg-cyan-400" },
    { text: "SHIRINLIKLARNI YAXSHI KO'RADIGAN", emoji: "🍫", color: "bg-amber-400" },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 dark:from-yellow-950 dark:via-orange-950 dark:to-pink-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse-slow rounded-full bg-yellow-300/20 blur-3xl dark:bg-yellow-600/20" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse-slower rounded-full bg-orange-300/20 blur-3xl dark:bg-orange-600/20" />
        <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-pink-300/10 blur-3xl dark:bg-pink-600/10" />

        {/* Floating Kids Icons */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl opacity-10 animate-float dark:opacity-5"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 20}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              {["🧒", "👧", "🧸", "🎈", "🍭", "🎨", "📚", "⚽"][i % 8]}
            </div>
          ))}
        </div>

        {/* Smiley Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f59e0b' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='5'/%3E%3Ccircle cx='15' cy='15' r='3'/%3E%3Ccircle cx='45' cy='45' r='4'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 xl:px-10">
        {/* Hero Section */}
        <div className="group relative mb-8 transform-gpu overflow-hidden rounded-3xl border-2 border-yellow-400/30 bg-gradient-to-br from-yellow-100/80 via-orange-100/80 to-pink-100/80 dark:from-yellow-900/80 dark:via-orange-900/80 dark:to-pink-900/80 p-6 shadow-2xl backdrop-blur-sm md:p-8 lg:p-10">
          {/* Playful Border */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-pink-400/30" />
          </div>

          {/* Corner Decorations with Kids Theme */}
          <div className="absolute top-0 left-0 text-4xl opacity-30 animate-bounce">🧒</div>
          <div className="absolute top-0 right-0 text-4xl opacity-30 animate-bounce delay-100">👧</div>
          <div className="absolute bottom-0 left-0 text-4xl opacity-30 animate-bounce delay-200">🧸</div>
          <div className="absolute bottom-0 right-0 text-4xl opacity-30 animate-bounce delay-300">🎈</div>

          <div className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Game Badge */}
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 blur-xl rounded-full animate-pulse" />
                <div className="relative flex items-center gap-3 rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-800 dark:to-orange-800 px-5 py-2 border-2 border-yellow-400/50 shadow-xl">
                  <GiPartyPopper className="text-yellow-500 dark:text-yellow-300 text-xl animate-bounce" />
                  <span className="text-sm font-black tracking-wider text-transparent bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-300 dark:to-orange-300 bg-clip-text">
                    TANISHUV BINGO
                  </span>
                  <div className="flex gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-yellow-500" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="relative">
                <h1 className="text-5xl font-black leading-tight md:text-6xl lg:text-7xl">
                  <span className="relative inline-block">
                    <span className="absolute -inset-2 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 blur-2xl" />
                    <span className="relative bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-300 dark:to-orange-300 bg-clip-text text-transparent">
                      Keling,
                    </span>
                  </span>
                  <br />
                  <span className="relative inline-block mt-2">
                    <span className="absolute -inset-2 bg-gradient-to-r from-orange-400/30 to-pink-400/30 blur-2xl" />
                    <span className="relative bg-gradient-to-r from-orange-600 to-pink-600 dark:from-orange-300 dark:to-pink-300 bg-clip-text text-transparent">
                      tanishamiz!
                    </span>
                  </span>
                </h1>

                {/* Decorative Line */}
                <div className="relative mt-4 h-1 w-32 overflow-hidden rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400">
                  <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                </div>
              </div>

              {/* Description */}
              <div className="relative max-w-xl rounded-xl bg-white/50 dark:bg-slate-800/50 p-4 border-2 border-yellow-400/30 backdrop-blur-sm">
                <p className="text-base text-gray-700 dark:text-gray-200 md:text-lg leading-relaxed">
                  Sinfdoshlaring bilan suhbatlash, ular haqida qiziqarli ma'lumotlar top 
                  va birinchi bo'lib BINGO qil! Bu o'yin do'stlashishga yordam beradi.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {gameStats.map((stat, index) => (
                  <div
                    key={index}
                    className="group/stat relative transform-gpu overflow-hidden rounded-xl border-2 border-yellow-400/30 bg-white/50 dark:bg-slate-800/50 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl"
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
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-wider">
                        {stat.label}
                      </p>
                      <p className="text-sm font-black text-gray-800 dark:text-white mt-1">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Kids Image */}
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-8 -left-8 text-6xl rotate-12 animate-bounce">🧸</div>
              <div className="absolute -bottom-8 -right-8 text-6xl -rotate-12 animate-bounce delay-200">🎈</div>

              {/* Main Image */}
              <div className="relative transform-gpu overflow-hidden rounded-2xl border-4 border-yellow-400/30 shadow-2xl transition-all duration-500 hover:scale-[1.02] group-hover:border-yellow-400/50">
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-100/50 via-transparent to-transparent dark:from-yellow-900/50 z-10" />

                <img
                  src={tanishuvImg}
                  alt="Kids playing together"
                  className="h-[300px] w-full object-cover md:h-[400px] lg:h-[450px] transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay Badge */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                  <div className="inline-flex items-center gap-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2 border-2 border-yellow-400/50 shadow-xl">
                    <GiPartyPopper className="text-yellow-500 text-lg" />
                    <span className="text-sm font-black text-gray-800 dark:text-white tracking-wider">
                      DO'STLIK O'YINI
                    </span>
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                      <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse delay-150" />
                      <span className="h-2 w-2 rounded-full bg-pink-400 animate-pulse delay-300" />
                    </div>
                  </div>
                </div>

                {/* Floating Badges */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  <div className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 px-3 py-1.5 text-xs font-bold text-white shadow-xl border border-yellow-200">
                    <span className="flex items-center gap-1">
                      <FaChild /> 2-30 bola
                    </span>
                  </div>
                  <div className="rounded-full bg-gradient-to-r from-orange-400 to-pink-400 px-3 py-1.5 text-xs font-bold text-white shadow-xl border border-orange-200">
                    16 KATAK
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
              className="group relative transform-gpu overflow-hidden rounded-2xl border-2 border-yellow-400/30 bg-white/50 dark:bg-slate-800/50 p-6 backdrop-blur-sm transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:border-yellow-400/50"
            >
              {/* Animated Background */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700"
                style={{
                  backgroundImage: `radial-gradient(circle at ${30 + index * 20}% ${40 + index * 10}%, #f59e0b 0%, transparent 50%)`,
                }}
              />

              {/* Corner Decorations */}
              <div className="absolute top-2 left-2 h-6 w-6 border-l-2 border-t-2 border-yellow-400/50 group-hover:border-yellow-300 transition-colors" />
              <div className="absolute top-2 right-2 h-6 w-6 border-r-2 border-t-2 border-yellow-400/50 group-hover:border-yellow-300 transition-colors" />
              <div className="absolute bottom-2 left-2 h-6 w-6 border-l-2 border-b-2 border-yellow-400/50 group-hover:border-yellow-300 transition-colors" />
              <div className="absolute bottom-2 right-2 h-6 w-6 border-r-2 border-b-2 border-yellow-400/50 group-hover:border-yellow-300 transition-colors" />

              {/* Decorative Icon */}
              <feature.bgIcon className="absolute right-4 top-4 text-5xl text-yellow-500/20 group-hover:text-yellow-500/30 transition-all group-hover:scale-110 group-hover:rotate-12" />

              {/* Icon */}
              <div
                className={`relative mb-5 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl`}
              >
                <feature.icon className="text-2xl" />
                <div className="absolute inset-0 rounded-xl bg-white/20 blur-md group-hover:blur-xl transition-all" />
              </div>

              {/* Content */}
              <h3 className="relative mb-2 text-xl font-black text-gray-800 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-600 group-hover:to-orange-600 group-hover:bg-clip-text transition-all">
                {feature.title}
              </h3>
              <p className="relative mb-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.desc}
              </p>

              {/* Stats Bar */}
              <div className="relative flex items-center gap-2">
                <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">{feature.stats}</span>
                <div className="h-1.5 flex-1 rounded-full bg-yellow-200 dark:bg-yellow-900/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${feature.color} transition-all duration-500 group-hover:animate-pulse`}
                    style={{ width: "85%" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sample Questions Preview */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6 flex items-center gap-3">
            <span className="bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
              QIZIQARLI SAVOLLAR
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-yellow-400/30 to-transparent" />
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {sampleQuestions.map((q, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl border-2 border-yellow-400/30 bg-white dark:bg-slate-800 p-3 text-center transition-all hover:scale-105 hover:shadow-xl"
              >
                <div className={`absolute inset-0 ${q.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className="relative text-4xl mb-2 animate-bounce group-hover:animate-none">{q.emoji}</div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 line-clamp-2">{q.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Game Levels */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {bingoLevels.map((level, index) => (
            <div
              key={index}
              className="group relative transform-gpu overflow-hidden rounded-2xl border-2 border-yellow-400/30 bg-white/50 dark:bg-slate-800/50 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-yellow-400/50 hover:shadow-2xl"
            >
              {/* Level Emoji Background */}
              <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">
                {level.emoji}
              </div>

              {/* Icon */}
              <div className="relative mb-4 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-yellow-400/30" />
                  <div
                    className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r ${level.color} text-white text-2xl shadow-2xl border-2 border-white/30`}
                  >
                    <level.icon />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h4 className="relative mb-2 text-center text-lg font-black text-gray-800 dark:text-white tracking-wider">
                {level.level}
              </h4>

              {/* Details */}
              <div className="relative mb-4 space-y-1 text-center text-sm">
                <p className="text-gray-600 dark:text-gray-300">{level.age}</p>
                <p className="text-gray-500 dark:text-gray-400">{level.time}</p>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 rounded-full bg-yellow-200 dark:bg-yellow-900/50 overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${level.color} transition-all duration-1000`}
                  style={{ width: `${level.progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Game Component Container */}
        <div className="relative">
          {/* Decorative Border */}
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/30 via-orange-400/30 to-pink-400/30 rounded-3xl blur-xl" />

          {/* Main Container */}
          <div className="relative transform-gpu overflow-hidden rounded-3xl border-2 border-yellow-400/30 bg-white/80 dark:bg-slate-900/80 p-6 shadow-2xl backdrop-blur-sm md:p-8">
            {/* Kids Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, #f59e0b 0px, #f59e0b 2px, transparent 2px, transparent 10px)`,
              }}
            />

            {/* Header */}
            <div className="relative mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-yellow-400/30 pb-4">
              <div className="flex items-center gap-4">
                {/* Icon with Glow */}
                <div className="relative">
                  <div className="absolute -inset-1 animate-pulse rounded-xl bg-yellow-500/50 blur" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 shadow-2xl border-2 border-white/30">
                    <GiPartyPopper className="text-3xl text-white" />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-wider flex items-center gap-2">
                    Tanishuv Bingo
                    <span className="text-sm font-normal text-yellow-500/70">🧒👧</span>
                  </h2>
                  <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <RiEmotionHappyFill className="text-yellow-500" />
                    Do'stlashish va o'yin orqali tanishish
                  </p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2">
                <div className="flex items-center gap-2 rounded-full bg-yellow-100 dark:bg-yellow-900/50 px-4 py-2 border-2 border-yellow-400/30">
                  <FaChild className="text-yellow-500 text-sm" />
                  <span className="text-xs font-bold text-gray-700 dark:text-white">Bolalar uchun</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-yellow-100 dark:bg-yellow-900/50 px-4 py-2 border-2 border-yellow-400/30">
                  <FaGamepad className="text-orange-500 text-sm" />
                  <span className="text-xs font-bold text-gray-700 dark:text-white">16 katak</span>
                </div>
              </div>
            </div>

            {/* TanishuvBingo Component */}
            <div className="relative">
              <Bingo />
            </div>
            <GameFeedbackPanel gameKey="bingo" />
          </div>
        </div>

        {/* Footer */}
        <div className="relative mt-12 flex justify-center items-center gap-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />

          <div className="flex gap-4 text-4xl text-yellow-500/30">
            <GiAchievement
              className="hover:text-yellow-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <GiPodium
              className="hover:text-yellow-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <FaTrophy
              className="hover:text-yellow-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
            <GiSpinningWheel
              className="hover:text-yellow-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.6s" }}
            />
            <FaHeart
              className="hover:text-yellow-500/50 transition-colors animate-bounce"
              style={{ animationDelay: "0.8s" }}
            />
          </div>

          <div className="h-px w-12 bg-gradient-to-r from-yellow-400/30 via-transparent to-transparent" />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        @keyframes pulse-slower {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

export default BingoPage;
