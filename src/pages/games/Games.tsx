import { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaHeart,
  FaLock,
  FaRegHeart,
  FaStar,
  FaCrown,
  FaUsers,
  FaHome,
  FaGamepad,
  FaTrophy,
  FaBolt
} from "react-icons/fa";
import {
  GiAchievement,
  GiPodium,
  GiJoystick,
  GiDragonHead,
  GiLightningStorm,
  GiWizardStaff,
} from "react-icons/gi";
import { IoMdTimer } from "react-icons/io";
import { gameCards } from "./data";
import {
  getFavoriteGameIds,
  subscribeFavoriteGames,
  toggleFavoriteGame,
} from "../../utils/gameFavorites";
import useHomeTheme from "../../hooks/useHomeTheme";
import { readLastPlayedGame } from "../../utils/gameHistory";
import { supportsGameLeaderboard } from "../../hooks/gameSession";

type Game = typeof gameCards[number];

function Games() {
  const navigate = useNavigate();
  const isDarkMode = useHomeTheme();
  const [activeCategory, setActiveCategory] = useState("Barchasi");
  const [likedGames, setLikedGames] = useState<string[]>([]);
  const [lastPlayedGameId, setLastPlayedGameId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const mouseFrameRef = useRef<number | null>(null);
  const showAmbientEffects = typeof window !== "undefined" && window.innerWidth >= 768;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    setLikedGames(getFavoriteGameIds());
    return subscribeFavoriteGames(setLikedGames);
  }, []);

  useEffect(() => {
    setLastPlayedGameId(readLastPlayedGame().gameId);
  }, []);

  useEffect(() => {
    if (!showAmbientEffects) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (mouseFrameRef.current !== null) return;
      mouseFrameRef.current = window.requestAnimationFrame(() => {
        setMousePosition({
          x: (event.clientX / window.innerWidth) * 100,
          y: (event.clientY / window.innerHeight) * 100,
        });
        mouseFrameRef.current = null;
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseFrameRef.current !== null) {
        window.cancelAnimationFrame(mouseFrameRef.current);
      }
    };
  }, [showAmbientEffects]);

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

  // Har bir karta uchun gradient va iconBg ni saqlab qolamiz
  const getCardGradient = (game: Game) => {
    return game.gradient || 'from-purple-500 to-pink-500';
  };

  const handleLikeToggle = (gameId: string) => {
    setLikedGames(toggleFavoriteGame(gameId));
  };

  const handleGamePlay = (game: Game) => {
    if (!game.available) {
      return;
    }

    if ("externalUrl" in game && typeof game.externalUrl === "string") {
      window.location.href = game.externalUrl;
      return;
    }

    navigate(game.path);
  };

  const pageBackground = isDarkMode
    ? `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(89, 185, 230, 0.14) 0%, rgba(0, 0, 0, 0) 48%),
       radial-gradient(circle at 82% 18%, rgba(255, 209, 93, 0.10) 0%, transparent 38%),
       radial-gradient(circle at 18% 82%, rgba(89, 185, 230, 0.10) 0%, transparent 38%),
       linear-gradient(135deg, #0f172a 0%, #111827 50%, #131a2d 100%)`
    : `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(120, 207, 238, 0.20) 0%, rgba(255, 255, 255, 0) 46%),
       radial-gradient(circle at 82% 18%, rgba(255, 209, 93, 0.18) 0%, transparent 36%),
       radial-gradient(circle at 18% 82%, rgba(89, 185, 230, 0.12) 0%, transparent 36%),
       linear-gradient(135deg, #fffef9 0%, #f8fcff 48%, #fff8ef 100%)`;

  const ambientParticles = useMemo(
    () => {
      const particlePalette = isDarkMode
        ? ["#59b9e6", "#ffd15d", "#f8fafc"]
        : ["#59b9e6", "#ffd15d", "#ffffff"];
      return Array.from({ length: showAmbientEffects ? 48 : 18 }, (_, index) => {
      const color = particlePalette[index % particlePalette.length];
      return {
        id: index,
        width: `${Math.random() * 4 + 1}px`,
        height: `${Math.random() * 4 + 1}px`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        boxShadow: `0 0 ${Math.random() * 20 + 10}px ${color}`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${10 + Math.random() * 20}s`,
        opacity: isDarkMode ? 0.16 + Math.random() * 0.2 : 0.12 + Math.random() * 0.14,
      };
      });
    },
    [isDarkMode, showAmbientEffects],
  );

  return (
    <div
      data-home-theme={isDarkMode ? "dark" : "light"}
      className="games-theme relative min-h-screen w-full overflow-hidden bg-[var(--games-page-base)] text-[var(--games-text)] transition-colors duration-500"
    >
      {/* Murakkab gradient fon */}
      <div 
        className="fixed inset-0 transition-opacity duration-1000"
        style={{
          background: pageBackground,
        }}
      />

      {/* Animatsion zarralar tizimi */}
      <div className="fixed inset-0 overflow-hidden">
        {ambientParticles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-float-particle"
            style={{
              width: particle.width,
              height: particle.height,
              top: particle.top,
              left: particle.left,
              background: particle.background,
              boxShadow: particle.boxShadow,
              animationDelay: particle.animationDelay,
              animationDuration: particle.animationDuration,
              opacity: particle.opacity,
            }}
          />
        ))}
      </div>

      {/* Neon chiziqlar */}
      <div className="fixed inset-0">
        <div className="absolute top-0 left-1/4 h-full w-px bg-gradient-to-b from-transparent via-[var(--games-line-1)] to-transparent" />
        <div className="absolute top-0 left-2/4 h-full w-px bg-gradient-to-b from-transparent via-[var(--games-line-2)] to-transparent" />
        <div className="absolute top-0 left-3/4 h-full w-px bg-gradient-to-b from-transparent via-[var(--games-line-3)] to-transparent" />
        <div className="absolute top-1/4 left-0 h-px w-full bg-gradient-to-r from-transparent via-[var(--games-line-1)] to-transparent" />
        <div className="absolute top-2/4 left-0 h-px w-full bg-gradient-to-r from-transparent via-[var(--games-line-2)] to-transparent" />
        <div className="absolute top-3/4 left-0 h-px w-full bg-gradient-to-r from-transparent via-[var(--games-line-3)] to-transparent" />
      </div>

      {/* Asosiy kontent */}
      <div className={`relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 xl:px-10 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Orqaga qaytish tugmasi */}
        <button
          onClick={() => navigate("/")}
          className="group relative mb-6 inline-flex cursor-pointer items-center gap-2.5 rounded-2xl border border-white/20 bg-[var(--games-surface-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--games-text)] shadow-[0_10px_30px_var(--games-shadow)] backdrop-blur-xl transition-all duration-300 hover:border-[var(--games-border-strong)] hover:bg-[var(--games-surface)] hover:shadow-[0_0_30px_var(--games-shadow)] sm:mb-8 sm:gap-3 sm:px-6 sm:py-3 sm:hover:scale-[1.02]"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--home-accent)]/20 to-[var(--home-accent-strong)]/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
          <FaHome className="text-base transition-transform group-hover:-translate-x-1" />
          <span>Bosh sahifa</span>
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[var(--home-accent)]/50 to-[var(--home-accent-strong)]/50 blur opacity-0 transition-opacity group-hover:opacity-30" />
        </button>

        {/* Sarlavha qismi */}
        <div className="relative mb-10 text-center sm:mb-14 lg:mb-16">
          {/* 3D effektli sarlavha */}
          <div className="relative inline-block perspective-1000">
            <div className="relative">
              <h1 className="text-3xl font-black leading-[0.92] tracking-[-0.04em] sm:text-4xl md:text-6xl lg:text-7xl">
                <span className="relative inline-block">
                  <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 opacity-50 " />
                  <span className="relative bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent me-3">
                    O'YINLAR 
                  </span>
                </span>
                <span className="relative inline-block mt-[-0.3em]">
                  <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 opacity-50 " />
                  <span className="relative bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent ">
                    MASKANI
                  </span>
                </span>
              </h1>
            </div>

            {/* Animatsion yulduzlar */}
            <div className="absolute -right-3 -top-7 sm:-right-12 sm:-top-12">
              <div className="relative">
                <FaStar className="absolute text-2xl text-yellow-400 opacity-50 sm:text-4xl" />
                <FaStar className="relative text-2xl text-yellow-400 sm:text-4xl" />
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-2 sm:-bottom-8 sm:-left-12">
              <div className="relative">
                <FaCrown className="absolute text-3xl text-pink-400 opacity-50 sm:text-5xl" />
                <FaCrown className="relative text-3xl text-pink-400 sm:text-5xl" />
              </div>
            </div>
          </div>

          {/* Ta'rif */}
          <p className="mx-auto mt-5 max-w-3xl bg-gradient-to-r from-[var(--games-text)] via-[var(--games-text-soft)] to-[var(--games-text)] bg-clip-text px-2 text-sm leading-7 text-transparent sm:mt-6 sm:px-0 sm:text-lg lg:text-xl">
            Eng sara o'yinlar, ajoyib sarguzashtlar va unutilmas lahzalar sizni kutmoqda!
          </p>

          {/* Dekorativ chiziq */}
          <div className="mt-8 flex justify-center gap-2">
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            <div className="h-1 w-32 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 "></div>
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          </div>
        </div>

        {/* Kategoriya filtrlari */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2.5 sm:mb-12 sm:gap-3.5">
          {categories.map((category, index) => {
            const isActive = activeCategory === category;
            const colors = [
              'from-purple-500 to-pink-500',
              'from-blue-500 to-cyan-500',
              'from-green-500 to-emerald-500',
              'from-orange-500 to-red-500',
              'from-yellow-500 to-amber-500',
            ];
            const colorIndex = index % colors.length;

            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`group relative cursor-pointer overflow-hidden rounded-full px-4 py-2.5 text-xs font-semibold tracking-[0.02em] transition-all duration-500 sm:px-5 sm:py-3 sm:text-sm ${showAmbientEffects ? "transform hover:scale-[1.05]" : ""} ${
                  isActive
                    ? `bg-gradient-to-r ${colors[colorIndex]} text-white shadow-[0_12px_28px_var(--games-shadow-strong)]`
                    : 'border border-white/15 bg-[var(--games-surface-soft)] text-[var(--games-text-soft)] shadow-[0_8px_20px_var(--games-shadow)] hover:border-[var(--games-border-strong)] hover:bg-[var(--games-surface)] hover:text-[var(--games-text)]'
                }`}
              >
                {/* Hover effekti */}
                <div className={`absolute inset-0 bg-gradient-to-r ${colors[colorIndex]} opacity-0 group-hover:opacity-20 blur-xl transition-opacity`} />
                
                {/* Ichki glow */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                </div>

                <span className="relative z-10">{category}</span>
              </button>
            );
          })}
        </div>
        {/* O'yin kartochkalari */}
        <div className="relative z-10 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:gap-7">
          {filteredGames.map((game, index) => {
            const delay = Math.min(index, 8) * 0.06;
            const cardGradient = getCardGradient(game);
            const isLiked = likedGames.includes(game.id);
            const isLastPlayed = lastPlayedGameId === game.id;
            const hasLeaderboard = supportsGameLeaderboard(game.id, game.players);

            return (
              <div
                key={game.id}
                className={`group relative transform-gpu transition-all duration-500 ${showAmbientEffects ? "hover:-translate-y-1" : ""} ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                }`}
                style={{ transitionDelay: `${delay}s` }}
              >
                <div className={`pointer-events-none absolute -inset-px rounded-[1.8rem] bg-gradient-to-br ${cardGradient} opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-35`} />
                <article
                  className={`relative flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] border transition-[border-color,box-shadow] duration-500 ${
                    game.available
                      ? `border-[var(--games-border)] bg-[var(--games-card-shell)] shadow-[0_18px_44px_var(--games-card-shadow)] group-hover:border-[var(--games-border-strong)] group-hover:shadow-[0_28px_65px_var(--games-card-shadow-hover)] ${game.borderGlow || ''}`
                      : 'border-[var(--games-border)] bg-[var(--games-surface)] opacity-70'
                  }`}
                >
                  <div className={`relative aspect-[16/10] w-full overflow-hidden ${game.bgPattern}`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <img
                      src={game.image}
                      alt={game.title}
                      loading="lazy"
                      decoding="async"
                      className="relative h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.055]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08)_18%,rgba(2,6,23,0.22)_55%,rgba(2,6,23,0.92)_100%)]" />
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-60" />

                    <div className="absolute left-4 top-4 flex max-w-[72%] flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${cardGradient} px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-white shadow-lg`}>
                        <game.badgeIcon className="text-[10px]" />
                        {game.badge}
                      </span>
                      {isLastPlayed ? (
                        <span className="rounded-full border border-cyan-200/30 bg-cyan-300/90 px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.12em] text-slate-950 shadow-lg backdrop-blur-md">
                          Davom etish
                        </span>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleLikeToggle(game.id);
                      }}
                      className={`absolute right-4 top-4 z-10 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border shadow-lg backdrop-blur-xl transition-all hover:scale-105 active:scale-95 ${
                        isLiked
                          ? "border-rose-200/60 bg-white text-[#ff5f87]"
                          : "border-white/20 bg-slate-950/55 text-white hover:bg-slate-950/80"
                      }`}
                      aria-label={isLiked ? "Sevimlilardan olib tashlash" : "Sevimliga qo'shish"}
                    >
                      {isLiked ? <FaHeart className="text-[13px]" /> : <FaRegHeart className="text-[13px]" />}
                    </button>

                    {!game.available && <div className="absolute inset-0 z-[2] grid place-items-center bg-slate-950/60 backdrop-blur-[2px]"><span className="grid h-16 w-16 place-items-center rounded-full border border-white/20 bg-slate-950/70 text-2xl text-white shadow-2xl"><FaLock/></span></div>}

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-white/60"><game.categoryIcon className={game.iconColor}/>{game.category}</span>
                        <p className="mt-1 truncate text-sm font-black text-white">{game.level}</p>
                      </div>
                      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${game.iconBg} text-white shadow-xl ring-1 ring-white/25 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105`}>
                        <game.icon className="text-xl" />
                      </div>
                    </div>
                  </div>

                  <div className="relative flex flex-1 flex-col bg-[var(--games-card-surface)] p-5 sm:p-6">
                    <div className={`absolute inset-x-8 top-0 h-px bg-gradient-to-r ${cardGradient} opacity-45`} />
                    <div className="mb-2.5 flex items-start justify-between gap-3">
                      <h3 className="text-xl font-black leading-tight tracking-[-0.025em] text-[var(--games-card-text)] sm:text-[1.55rem]">
                        {game.title}
                      </h3>
                      <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                        {hasLeaderboard ? <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-400/10 px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-amber-500"><FaTrophy/> Leaderboard</span> : null}
                        {game.available && <span className="inline-flex items-center gap-1 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-2 py-1 text-[8px] font-black uppercase tracking-[0.1em] text-yellow-500"><FaBolt/> Live</span>}
                      </div>
                    </div>

                    <p className="line-clamp-2 min-h-[44px] text-sm leading-6 text-[var(--games-card-text-soft)]">
                      {game.description}
                    </p>

                    <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-2xl border border-[var(--games-border)] bg-[var(--games-surface-soft)] text-[var(--games-card-text-soft)]">
                      <span className="flex min-w-0 flex-col items-center gap-1.5 px-2 py-3 text-center text-[10px] font-bold"><FaUsers className="text-sm text-[var(--games-card-text)]"/><b className="max-w-full truncate">{game.players}</b></span>
                      <span className="flex min-w-0 flex-col items-center gap-1.5 border-x border-[var(--games-border)] px-2 py-3 text-center text-[10px] font-bold"><IoMdTimer className="text-base text-[var(--games-card-text)]"/><b className="max-w-full truncate">{game.time}</b></span>
                      <span className="flex min-w-0 flex-col items-center gap-1.5 px-2 py-3 text-center text-[10px] font-bold"><FaStar className="text-sm text-yellow-400"/><b className="max-w-full truncate">{game.points}</b></span>
                    </div>

                    <div className="mt-auto pt-5">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleGamePlay(game);
                        }}
                        disabled={!game.available}
                        className={`group/btn flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-sm font-black transition-all ${
                          game.available
                            ? `cursor-pointer border-white/10 bg-gradient-to-r ${cardGradient} text-white shadow-[0_14px_30px_var(--games-button-shadow)] hover:brightness-110 active:scale-[0.985]`
                            : 'cursor-not-allowed border-[var(--games-border)] bg-[var(--games-surface-soft)] text-[var(--games-card-text-soft)]'
                        }`}
                      >
                        {game.available ? (
                          <>
                            <span className="flex items-center gap-2"><game.mainIcon /> O'ynash</span>
                            <FaArrowRight className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                          </>
                        ) : (
                          <><span className="flex items-center gap-2"><FaLock /> Tez kunda</span></>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>

        {/* Footer ikonkalar */}
        <div className="relative mt-14 flex flex-wrap justify-center gap-5 text-[var(--games-icon-muted)] sm:mt-20 sm:gap-8">
          {[
            GiAchievement,
            GiPodium,
            FaTrophy,
            FaGamepad,
            GiJoystick,
            GiDragonHead,
            GiLightningStorm,
            GiWizardStaff
          ].map((Icon, index) => (
            <div key={index} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-0 group-hover:opacity-70 transition-opacity" />
              <Icon className={`relative text-4xl animate-float-particle transition-all duration-300 group-hover:text-white group-hover:scale-150 group-hover:rotate-12`} 
                style={{ animationDelay: `${index * 0.2}s` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Games;
