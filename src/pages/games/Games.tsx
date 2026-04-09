import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaLock,
  FaRegHeart,
  FaStar,
  FaCrown,
  FaUsers,
  FaHome,
  FaGamepad,
  FaTrophy,
  FaFire,
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

type Game = typeof gameCards[number];

function Games() {
  const navigate = useNavigate();
  const isDarkMode = useHomeTheme();
  const [activeCategory, setActiveCategory] = useState("Barchasi");
  const [likedGames, setLikedGames] = useState<string[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [lastPlayedGameId, setLastPlayedGameId] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
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

    const handleMouseMove = (e : MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
  const totalPages = Math.max(1, Math.ceil(filteredGames.length / itemsPerPage));
  const paginatedGames = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredGames.slice(start, start + itemsPerPage);
  }, [currentPage, filteredGames]);
  const totalGames = gameCards.length;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Har bir karta uchun gradient va iconBg ni saqlab qolamiz
  const getCardGradient = (game: Game) => {
    return game.gradient || 'from-purple-500 to-pink-500';
  };

  const handleLikeToggle = (gameId: string) => {
    setLikedGames(toggleFavoriteGame(gameId));
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

  const particlePalette = isDarkMode
    ? ["#59b9e6", "#ffd15d", "#f8fafc"]
    : ["#59b9e6", "#ffd15d", "#ffffff"];

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
        {[...Array(showAmbientEffects ? 100 : 28)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float-particle"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${
                particlePalette[i % particlePalette.length]
              } 0%, transparent 70%)`,
              boxShadow: `0 0 ${Math.random() * 20 + 10}px ${
                particlePalette[i % particlePalette.length]
              }`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
              opacity: isDarkMode ? 0.16 + Math.random() * 0.24 : 0.12 + Math.random() * 0.18,
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

        {/* Statistik ma'lumotlar */}
        <div className="mb-10 flex justify-center sm:mb-12">
          <div className="relative group w-full max-w-6xl">
            <div className="absolute inset-0 rounded-[28px] bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
            <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-[var(--games-surface)] px-4 py-5 shadow-[0_18px_50px_var(--games-shadow)] backdrop-blur-xl sm:px-6 lg:px-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10 xl:gap-16">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4 lg:flex-1 lg:justify-start lg:gap-6">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-yellow-400 blur-md " />
                    <FaGamepad className="relative text-xl text-yellow-400" />
                  </div>
                  <span className="text-sm font-semibold text-[var(--games-text)]">
                    <span className="text-yellow-400">{totalGames}</span> ta o'yin
                  </span>
                </div>
                
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-green-400 blur-md" />
                    <FaUsers className="relative text-xl text-green-400" />
                  </div>
                  <span className="text-sm font-semibold text-[var(--games-text)]">
                    <span className="text-green-400">5k+</span> foydalanuvchi
                  </span>
                </div>
                
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-blue-400 blur-md " />
                    <FaFire className="relative text-xl text-blue-400" />
                  </div>
                  <span className="text-sm font-semibold text-[var(--games-text)]">
                    <span className="text-blue-400">24/7</span> jonli
                  </span>
                </div>
              </div>

                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-3 lg:ml-auto lg:shrink-0 lg:justify-end">

                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="group inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[var(--games-surface-soft)] text-[var(--games-text)] transition hover:-translate-x-0.5 hover:border-[var(--games-border-strong)] hover:bg-[var(--games-surface)] disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label="Oldingi sahifa"
                    >
                      <FaChevronLeft className="text-sm transition-transform group-hover:-translate-x-0.5" />
                    </button>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {Array.from({ length: totalPages }, (_, index) => {
                        const page = index + 1;
                        const active = page === currentPage;
                        return (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`relative h-10 min-w-10 cursor-pointer overflow-hidden rounded-full border px-3 text-xs font-black transition-all duration-300 sm:h-11 sm:min-w-11 sm:px-4 sm:text-sm ${
                              active
                                ? "border-pink-300/40 bg-gradient-to-r from-purple-500/95 via-fuchsia-500/95 to-pink-500/95 text-white shadow-[0_14px_28px_rgba(217,70,239,0.28)]"
                                : "border-white/15 bg-[var(--games-surface-soft)] text-[var(--games-text-soft)] hover:-translate-y-0.5 hover:border-[var(--games-border-strong)] hover:bg-[var(--games-surface)] hover:text-[var(--games-text)]"
                            }`}
                          >
                            {active && (
                              <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.22),transparent)]" />
                            )}
                            <span className="relative">{page}</span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="group inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[var(--games-surface-soft)] text-[var(--games-text)] transition hover:translate-x-0.5 hover:border-[var(--games-border-strong)] hover:bg-[var(--games-surface)] disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label="Keyingi sahifa"
                    >
                      <FaChevronRight className="text-sm transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* O'yin kartochkalari */}
        <div className="relative z-10 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:gap-7">
          {paginatedGames.map((game, index) => {
            const isHovered = hoveredCard === game.id;
            const delay = index * 0.1;
            const cardGradient = getCardGradient(game);
            const isLiked = likedGames.includes(game.id);
            const isLastPlayed = lastPlayedGameId === game.id;

            return (
              <div
                key={game.id}
                className={`group relative transform-gpu transition-all duration-700 ${showAmbientEffects ? "hover:scale-[1.03] hover:-translate-y-3" : ""} ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                }`}
                style={{ transitionDelay: `${delay}s` }}
                onMouseEnter={() => setHoveredCard(game.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Karta gradienti - bu qatlam icon ustida emas */}
                <div className={`absolute -inset-0.5 rounded-[30px] bg-gradient-to-r ${cardGradient} blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-50`} />
                <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),transparent_48%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                
                {/* Asosiy karta */}
                <div
                  className={`relative w-full overflow-hidden rounded-3xl border-2 transition-all duration-500 ${
                    game.available
                      ? `border-white/15 bg-[var(--games-card-shell)] shadow-[0_18px_42px_var(--games-card-shadow)] hover:border-[var(--games-border-strong)] hover:shadow-[0_26px_68px_var(--games-card-shadow-hover)] ${game.borderGlow || ''}`
                      : 'cursor-not-allowed border-[var(--games-border)] bg-[var(--games-surface)] backdrop-blur-xl'
                  }`}
                >
                  {/* Rasm qismi */}
                  <div className="relative z-10 h-56 w-full overflow-hidden sm:h-64">
                    <img
                      src={game.image}
                      alt={game.title}
                      className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? "from-black/80 via-black/20" : "from-slate-950/55 via-slate-900/10"} to-transparent`} />
                    
                    {/* Neon chiziqlar */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent " />
                    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent " />

                    {/* Badge */}
                    <div className="absolute left-4 top-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur-md " />
                        <div className="relative flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400/95 to-teal-500/95 px-3.5 py-2 text-[11px] font-bold text-white shadow-xl">
                          <game.badgeIcon className="text-sm" />
                          <span>{game.badge}</span>
                        </div>
                      </div>
                    </div>

                    {isLastPlayed ? (
                      <div className="absolute left-4 top-16">
                        <div className="rounded-full border border-cyan-200/40 bg-slate-950/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100 backdrop-blur-md">
                          So'nggi o'ynalgan
                        </div>
                      </div>
                    ) : null}

                    {/* Level */}
                    <div className="absolute right-4 top-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-black rounded-full blur-md" />
                        <div className="relative flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3.5 py-2 text-[11px] font-semibold text-white backdrop-blur-md">
                          <game.levelIcon className="text-yellow-300" />
                          <span>{game.level}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleLikeToggle(game.id);
                      }}
                      className={`absolute right-4 bottom-4 z-50 inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-md transition-all ${
                        isLiked
                          ? "border-rose-200/60 bg-white text-[#ff5f87] shadow-[0_0_25px_rgba(255,95,135,0.35)]"
                          : "border-white/20 bg-black/45 text-white hover:bg-black/60"
                      }`}
                    >
                      {isLiked ? <FaHeart className="text-[12px]" /> : <FaRegHeart className="text-[12px]" />}
                      {isLiked ? "Favourite" : "Like"}
                    </button>

                    {/* O'yin iconkasi - endi bu gradient ustida va ko'rinadi */}
                    <div className="absolute bottom-4 left-6 z-50">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${cardGradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                        <div
                          className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${game.iconBg} text-white shadow-2xl border border-white/20 transform transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 sm:h-16 sm:w-16`}
                        >
                          <game.icon className="text-2xl sm:text-3xl" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kontent qismi */}
                  <div className="relative z-0 overflow-hidden border-t border-white/10 bg-[var(--games-card-surface)] p-4 pt-5 sm:p-6 sm:pt-6">
                    <div className={`pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${cardGradient} opacity-90`} />
                    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${cardGradient} opacity-[0.08]`} />
                    <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-white/60 dark:bg-white/10" />
                    <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/30 blur-3xl" />
                    <div className="relative">
                    <h3 className="mb-2 flex items-start gap-2 text-xl font-black leading-tight tracking-[-0.02em] text-[var(--games-card-text)] sm:text-[1.65rem]">
                      {game.title}
                      {game.available && (
                        <FaBolt className="mt-1 shrink-0 text-yellow-400" />
                      )}
                    </h3>

                    <p className="mb-5 line-clamp-2 min-h-[44px] text-sm leading-6 text-[var(--games-card-text-soft)] sm:min-h-[48px]">{game.description}</p>

                    {/* Ma'lumotlar gridi */}
                    <div className="mb-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <div className="relative group/item">
                        <div className={`absolute inset-0 bg-gradient-to-r ${cardGradient} rounded-xl blur-md opacity-0 group-hover/item:opacity-30 transition-opacity`} />
                        <div className="relative flex items-center gap-2 rounded-2xl border border-[var(--games-chip-border)] bg-[var(--games-chip-bg)] px-3 py-3 shadow-[0_10px_24px_var(--games-chip-shadow)] backdrop-blur-sm">
                          <FaUsers className="text-sm text-[var(--games-card-text-soft)]" />
                          <span className="text-xs font-semibold text-[var(--games-card-text)]">{game.players}</span>
                        </div>
                      </div>
                      
                      <div className="relative group/item">
                        <div className={`absolute inset-0 bg-gradient-to-r ${cardGradient} rounded-xl blur-md opacity-0 group-hover/item:opacity-30 transition-opacity`} />
                        <div className="relative flex items-center gap-2 rounded-2xl border border-[var(--games-chip-border)] bg-[var(--games-chip-bg)] px-3 py-3 shadow-[0_10px_24px_var(--games-chip-shadow)] backdrop-blur-sm">
                          <IoMdTimer className="text-sm text-[var(--games-card-text-soft)]" />
                          <span className="text-xs font-semibold text-[var(--games-card-text)]">{game.time}</span>
                        </div>
                      </div>
                      
                      <div className="relative group/item">
                        <div className={`absolute inset-0 bg-gradient-to-r ${cardGradient} rounded-xl blur-md opacity-0 group-hover/item:opacity-30 transition-opacity`} />
                        <div className="relative flex items-center gap-2 rounded-2xl border border-[var(--games-chip-border)] bg-[var(--games-chip-bg)] px-3 py-3 shadow-[0_10px_24px_var(--games-chip-shadow)] backdrop-blur-sm">
                          <FaTrophy className="text-sm text-yellow-300" />
                          <span className="text-xs font-semibold text-[var(--games-card-text)]">{game.points}</span>
                        </div>
                      </div>
                      
                      <div className="relative group/item">
                        <div className={`absolute inset-0 bg-gradient-to-r ${cardGradient} rounded-xl blur-md opacity-0 group-hover/item:opacity-30 transition-opacity`} />
                        <div className="relative flex items-center gap-2 rounded-2xl border border-[var(--games-chip-border)] bg-[var(--games-chip-bg)] px-3 py-3 shadow-[0_10px_24px_var(--games-chip-shadow)] backdrop-blur-sm">
                          <game.categoryIcon className={`text-sm ${game.iconColor}`} />
                          <span className="text-xs font-semibold text-[var(--games-card-text)]">{game.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* O'ynash tugmasi */}
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-r ${cardGradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-70 transition-opacity`} />
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          if (game.available) navigate(game.path);
                        }}
                        disabled={!game.available}
                        className={`relative w-full overflow-hidden rounded-2xl border transition-all duration-500 ${
                          game.available
                            ? `group/btn cursor-pointer border-white/20 bg-[var(--games-button-bg)] shadow-[0_18px_35px_var(--games-button-shadow)] hover:scale-[1.01] hover:shadow-[0_24px_50px_var(--games-button-shadow-hover)] active:scale-[0.99]`
                            : 'cursor-not-allowed border-gray-600/50 bg-gray-700/50'
                        }`}
                      >
                        {game.available && (
                          <div className={`absolute inset-0 bg-gradient-to-r ${cardGradient} opacity-95`} />
                        )}
                        <div className="px-4 py-3.5 sm:px-6 sm:py-4">
                          <span className="relative z-10 flex items-center justify-center gap-2.5 text-sm font-bold tracking-[0.06em] text-white">
                            {game.available ? (
                              <>
                                <game.mainIcon className="text-base" />
                                <span>O'YNASH</span>
                                <FaArrowRight className="text-sm transition-transform group-hover/btn:translate-x-2" />
                              </>
                            ) : (
                              <>
                                <FaLock className="text-sm" />
                                <span>TEZ KUNDA</span>
                              </>
                            )}
                          </span>
                        </div>

                        {/* Animatsion chiziq */}
                        {game.available && (
                          <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                        )}
                      </button>
                    </div>
                    </div>
                  </div>

                  {/* Hover effektlari */}
                  {isHovered && game.available && (
                    <>
                      <div className={`absolute top-0 left-0 w-20 h-20 bg-gradient-to-r ${cardGradient} rounded-full blur-3xl opacity-30`} />
                      <div className={`absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-r ${cardGradient} rounded-full blur-3xl opacity-30`} />
                    </>
                  )}
                </div>
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
