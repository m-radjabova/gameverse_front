import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaLock,
  FaStar,
  FaCrown,
  FaUsers,
  FaHome,
  FaGamepad,
  FaTrophy,
} from "react-icons/fa";
import {
  GiPuzzle,
  GiSwordsEmblem,
  GiAchievement,
  GiPodium,
  GiJoystick,
} from "react-icons/gi";
import { IoMdTimer } from "react-icons/io";
import { MdSportsEsports } from "react-icons/md";
import { gameCards } from "./data";

function Games() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("Barchasi");

  const categories = useMemo(
    () => ["Barchasi", ...Array.from(new Set(gameCards.map((game) => game.category)))],
    [],
  );

  const filteredGames = useMemo(
    () =>
      activeCategory === "Barchasi"
        ? gameCards
        : gameCards.filter((game) => game.category === activeCategory),
    [activeCategory],
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#0a0618] via-[#1a0f2a] to-[#0f1a2a] [&_button]:cursor-pointer [&_button]:transition-all [&_button]:duration-200 [&_button:hover]:brightness-110 [&_button:disabled]:cursor-not-allowed">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] animate-pulse rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] animate-pulse rounded-full bg-pink-600/20 blur-3xl delay-1000" />
        <div className="absolute top-1/3 left-1/3 h-[500px] w-[500px] animate-pulse rounded-full bg-blue-600/10 blur-3xl delay-500" />

        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1.5 w-1.5 rounded-full bg-white/20 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
              opacity: 0.1 + Math.random() * 0.3,
            }}
          />
        ))}

        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 2px, transparent 0)",
            backgroundSize: "50px 50px",
          }}
        />

        <MdSportsEsports className="absolute left-[5%] top-[15%] animate-float text-8xl text-white/5" />
        <GiPuzzle className="absolute right-[8%] bottom-[20%] animate-float-delayed text-7xl text-white/5" />
        <FaTrophy className="absolute left-[15%] bottom-[10%] animate-float-slow text-7xl text-white/5" />
        <GiSwordsEmblem className="absolute right-[12%] top-[25%] animate-float text-8xl text-white/5" />
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-4 py-6 md:px-6 md:py-8 lg:px-8 xl:px-10">
        <button
          onClick={() => navigate("/home")}
          className="group relative mb-8 inline-flex items-center gap-3 rounded-2xl bg-white/5 px-5 py-3 text-sm font-bold text-white/90 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
        >
          <FaHome className="text-base transition-transform group-hover:-translate-x-1" />
          <span>Asosiy Sahifa</span>
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <div className="relative mb-12 text-center">
          <div className="relative inline-block">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black">
              <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent drop-shadow-2xl">
                O'YINLAR MASKANI
              </span>
            </h1>

            <div className="absolute -top-6 -right-6">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-yellow-400/30" />
                <FaStar className="relative text-3xl text-yellow-400 animate-spin-slow" />
              </div>
            </div>
            <div className="absolute -bottom-4 -left-8">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-pink-400/30" />
                <FaCrown className="relative text-3xl text-pink-400 animate-bounce-slow" />
              </div>
            </div>
          </div>

          <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
            Eng qiziqarli o'yinlar, ajoyib sarguzashtlar va cheksiz zavq sizni kutmoqda!
          </p>

          <div className="mt-8 flex justify-center gap-2">
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
            <div className="h-1 w-24 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500"></div>
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          {categories.map((category) => {
            const isActive = activeCategory === category;

            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-2xl border px-4 py-2 text-sm font-bold transition-all ${
                  isActive
                    ? "border-yellow-400/70 bg-yellow-400/20 text-yellow-200"
                    : "border-white/20 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
          {filteredGames.map((game) => {
            return (
              <div
                key={game.id}
                className="group relative transform-gpu transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2"
              >
                <div
                  className={`absolute -inset-1 rounded-3xl bg-gradient-to-r ${game.gradient} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500`}
                />

                <div
                  role="button"
                  tabIndex={game.available ? 0 : -1}
                  aria-disabled={!game.available}
                  onClick={() => game.available && navigate(game.path)}
                  onKeyDown={(event) => {
                    if (!game.available) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(game.path);
                    }
                  }}
                  className={`relative w-full overflow-hidden rounded-3xl border-2 transition-all duration-300 ${
                    game.available
                      ? `${game.bgPattern} border-white/20 hover:border-white/40 ${game.borderGlow}`
                      : "border-white/10 bg-gray-800/50 cursor-not-allowed"
                  }`}
                >
                  <div className="relative h-48 w-full overflow-hidden sm:h-56">
                    <img
                      src={game.image}
                      alt={game.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute left-3 top-3">
                      <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                        <game.badgeIcon className="text-xs" />
                        <span>{game.badge}</span>
                      </div>
                    </div>

                    <div className="absolute right-3 top-3">
                      <div className="flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-white border border-white/20">
                        <game.levelIcon className="text-yellow-300" />
                        <span>{game.level}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pointer-events-none absolute left-4 top-[calc(12rem-1.75rem)] z-20 sm:top-[calc(14rem-1.75rem)]">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${game.iconBg} text-white shadow-xl border-2 border-white/30 transform transition-transform group-hover:scale-110 group-hover:rotate-6`}
                    >
                      <game.icon className="text-2xl" />
                    </div>
                  </div>

                  <div className="p-5 pt-10">
                    <h3 className="mb-1 text-xl font-black text-white">{game.title}</h3>

                    <p className="mb-4 text-sm text-white/70 line-clamp-2">{game.description}</p>

                    <div className="mb-5 grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2 border border-white/10">
                        <FaUsers className="text-sm text-white/60" />
                        <span className="text-xs font-bold text-white/80">{game.players}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2 border border-white/10">
                        <IoMdTimer className="text-sm text-white/60" />
                        <span className="text-xs font-bold text-white/80">{game.time}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2 border border-white/10">
                        <FaTrophy className="text-sm text-yellow-300" />
                        <span className="text-xs font-bold text-white/80">{game.points}</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2 border border-white/10">
                        <game.categoryIcon className={`text-sm ${game.iconColor}`} />
                        <span className="text-xs font-bold text-white/80">{game.category}</span>
                      </div>
                    </div>

                    <div
                      className={`relative w-full overflow-hidden rounded-2xl border-2 transition-all ${
                        game.available
                          ? "border-yellow-400/50 bg-gradient-to-r from-yellow-500 to-orange-500 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                          : "border-gray-600 bg-gray-700/50 cursor-not-allowed"
                      }`}
                    >
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          if (game.available) navigate(game.path);
                        }}
                        disabled={!game.available}
                        className="w-full px-6 py-3"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-3 text-sm font-black text-white">
                          {game.available ? (
                            <>
                              <game.mainIcon className="text-base" />
                              <span>O'YNASH</span>
                              <FaArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
                            </>
                          ) : (
                            <>
                              <FaLock className="text-sm" />
                              <span>TEZ KUNDA</span>
                            </>
                          )}
                        </span>
                      </button>

                      {game.available && (
                        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                      )}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        <div className="relative mt-16 flex justify-center gap-8 text-white/20">
          <GiAchievement className="text-4xl animate-bounce" style={{ animationDelay: "0s" }} />
          <GiPodium className="text-4xl animate-bounce" style={{ animationDelay: "0.2s" }} />
          <FaTrophy className="text-4xl animate-bounce" style={{ animationDelay: "0.4s" }} />
          <FaGamepad className="text-4xl animate-bounce" style={{ animationDelay: "0.6s" }} />
          <GiJoystick className="text-4xl animate-bounce" style={{ animationDelay: "0.8s" }} />
        </div>
      </div>
    </div>
  );
}

export default Games;
