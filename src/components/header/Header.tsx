import { useEffect, useState } from "react";
import {
  FaBars,
  FaChevronRight,
  FaEnvelope,
  FaGamepad,
  FaGraduationCap,
  FaHeart,
  FaMoon,
  FaSignOutAlt,
  FaSun,
  FaTimes,
  FaTrophy,
  FaUser,
  FaUserShield,
} from "react-icons/fa";
import { MdStars } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import bunnyLogo from "../../assets/bunny.png";
import useContextPro from "../../hooks/useContextPro";
import { toMediaUrl } from "../../utils";
import { getFavoriteGameIds, subscribeFavoriteGames } from "../../utils/gameFavorites";
import { logoutRequest } from "../../utils/auth";
import { hasAnyRole } from "../../utils/roles";

type HeaderProps = {
  active?: "O'yinlar" | "Haqida" | "Izohlar" | "Bog'lanish";
  isDark?: boolean;
  onNavClick?: (section: string) => void;
  onThemeToggle?: () => void;
};

function getUserDisplayName(username?: string | null) {
  const value = username?.trim();
  return value || "User";
}

function getUserInitial(username?: string | null) {
  return getUserDisplayName(username).charAt(0).toUpperCase();
}

function getPrimaryRoleLabel(roles?: string[] | null) {
  const normalized = (roles ?? []).map((role) => role.toLowerCase());
  if (normalized.includes("admin")) return "ADMIN";
  if (normalized.includes("teacher")) return "TEACHER";
  if (normalized.includes("user") || normalized.includes("student")) return "STUDENT";
  return "STUDENT";
}

function Header({
  active,
  isDark = false,
  onNavClick,
  onThemeToggle,
}: HeaderProps) {
  const {
    state: { user },
    dispatch,
  } = useContextPro();

  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  const [hasAvatarError, setHasAvatarError] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  const canOpenTeacherPanel = hasAnyRole(user, ["teacher", "admin"]);
  const canOpenAdminPanel = hasAnyRole(user, ["admin"]);
  const userDisplayName = getUserDisplayName(user?.username);
  const userInitial = getUserInitial(user?.username);
  const userAvatarUrl = user?.avatar ? toMediaUrl(user.avatar) : "";
  const primaryRoleLabel = getPrimaryRoleLabel(user?.roles);

  useEffect(() => {
    setHasAvatarError(false);
  }, [userAvatarUrl]);

  useEffect(() => {
    setFavoriteCount(getFavoriteGameIds().length);
    return subscribeFavoriteGames((ids) => setFavoriteCount(ids.length));
  }, []);

  const navItems = [
    {
      label: "O'yinlar",
      icon: <FaGamepad className="mr-2 text-[13px]" />,
      href: "#games",
    },
    {
      label: "Haqida",
      icon: <MdStars className="mr-2 text-[15px]" />,
      href: "#about",
    },
    {
      label: "Izohlar",
      icon: <FaTrophy className="mr-2 text-[13px]" />,
      href: "#comments",
    },
    {
      label: "Bog'lanish",
      icon: <FaEnvelope className="mr-2 text-[13px]" />,
      href: "#contact",
    },
  ] as const;

  const drawerLinks = [
    {
      label: "Profile",
      to: "/profile",
      icon: <FaUser className="text-sm" />,
      visible: !!user,
    },
    {
      label: "O'qituvchi Paneli",
      to: "/teacher-panel",
      icon: <FaGraduationCap className="text-sm" />,
      visible: canOpenTeacherPanel,
    },
    {
      label: "Admin Paneli",
      to: "/admin",
      icon: <FaUserShield className="text-sm" />,
      visible: canOpenAdminPanel,
    },
  ];

  const scrollToSection = (href: string) => {
    if (!href.startsWith("#")) return;
    const targetId = href.slice(1);
    const target = document.getElementById(targetId);
    if (!target) return;

    const headerOffset = 100;
    const targetPosition =
      target.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({ top: targetPosition, behavior: "smooth" });
    setIsMobileOpen(false);
  };

  const closePanels = () => {
    setIsMobileOpen(false);
    setIsUserPanelOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutRequest();
    } finally {
      dispatch({ type: "LOGOUT" });
      setIsLoggingOut(false);
      closePanels();
      navigate("/login");
    }
  };

  const handleNavClick = (label: string, href: string) => {
    if (onNavClick) {
      onNavClick(label);
      setIsMobileOpen(false);
      return;
    }
    scrollToSection(href);
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between rounded-[28px] border px-4 py-3 shadow-[0_12px_35px_rgba(166,100,102,0.12)] backdrop-blur-xl sm:px-6 ${
            isDark
              ? "border-[#59b9e6]/18 bg-[#121c2d]/80"
              : "border-[#d8eef7] bg-white/82"
          }`}
        >
          <div
            onClick={() => navigate("/")}
            className="group flex cursor-pointer items-center gap-2 sm:gap-2.5"
          >
            <div
              className={`relative flex h-[58px] w-[58px] items-center justify-center rounded-[22px] border shadow-[0_8px_20px_rgba(89,185,230,0.18)] transition-transform duration-300 group-hover:scale-105 sm:h-16 sm:w-16 ${
                isDark
                  ? "border-[#59b9e6]/20 bg-gradient-to-br from-[#1b2a41] via-[#121c2d] to-[#0f172a]"
                  : "border-[#d8eef7] bg-gradient-to-br from-[#f4fcff] via-[#fffdf7] to-[#fff4d8]"
              }`}
            >
              <img
                src={bunnyLogo}
                alt="Gameverse bunny logo"
                className="h-11 w-11 object-contain sm:h-12 sm:w-12"
              />
            </div>

            <div className="leading-[0.92]">
              <h1 className={`text-[1.75rem] font-black tracking-[-0.04em] sm:text-[2.15rem] ${isDark ? "text-[#f1f1f1]" : "text-[#203572]"}`}>
                GAMEVERSE
              </h1>
              <p className={`mt-1 text-[10px] font-bold uppercase tracking-[0.31em] sm:text-[11px] ${isDark ? "text-[#a1a1aa]" : "text-[#59b9e6]"}`}>
                {/* Learn • Play • Grow */}
                O‘rgan • O‘yna • Rivojlan
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => {
              const isActive = active === item.label;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.label, item.href);
                  }}
                  className={`group flex items-center rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-[#59b9e6] text-white shadow-[0_8px_20px_rgba(89,185,230,0.35)]"
                      : isDark
                        ? "text-[#f1f1f1] hover:bg-[#1b2a41] hover:text-[#7fd3ef]"
                        : "text-[#506494] hover:bg-[#eefaff] hover:text-[#59b9e6]"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/favorites")}
              className={`relative hidden h-11 w-11 items-center justify-center rounded-full border transition-all hover:-translate-y-0.5 sm:flex ${
                isDark
                  ? "border-[#59b9e6]/20 bg-[#1b2a41] text-[#7fd3ef] hover:bg-[#243652]"
                  : "border-[#d8eef7] bg-white text-[#59b9e6] hover:bg-[#f4fcff]"
              }`}
              aria-label="Open favourites"
            >
              <FaHeart className="text-sm" />
              {favoriteCount > 0 ? (
                <span className="absolute -right-1 -top-1 min-w-[20px] rounded-full bg-gradient-to-r from-[#59b9e6] to-[#ffd15d] px-1.5 py-0.5 text-[10px] font-black text-[#0f172a] shadow-lg">
                  {favoriteCount}
                </span>
              ) : null}
            </button>

            {onThemeToggle && (
              <button
                type="button"
                onClick={onThemeToggle}
                className={` cursor-pointer hidden h-11 w-11 items-center justify-center rounded-full border transition-all hover:-translate-y-0.5 sm:flex ${
                  isDark
                    ? "border-[#59b9e6]/20 bg-[#1b2a41] text-[#7fd3ef] hover:bg-[#243652]"
                    : "border-[#d8eef7] bg-white text-[#59b9e6] hover:bg-[#f4fcff]"
                }`}
                aria-label="Toggle theme"
              >
                {isDark ? <FaSun className="text-sm" /> : <FaMoon className="text-sm" />}
              </button>
            )}

            {user ? (
              <button
                type="button"
                onClick={() => setIsUserPanelOpen(true)}
                className={`hidden cursor-pointer items-center gap-3 rounded-[22px] border px-3 py-2 text-left shadow-[0_10px_25px_rgba(166,100,102,0.08)] transition-all hover:-translate-y-0.5 sm:flex ${
                  isDark
                    ? "border-[#59b9e6]/18 bg-gradient-to-r from-[#1b2a41] to-[#121c2d] hover:bg-[#1b2a41]"
                    : "border-[#d8eef7] bg-gradient-to-r from-white to-[#f4fcff] hover:bg-white"
                }`}
              >
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#d9f3ff] via-[#9ad7ef] to-[#ffd76d] opacity-70 blur-sm" />
                  <div className={`relative h-11 w-11 overflow-hidden rounded-full border-2 shadow ${isDark ? "border-[#121c2d] bg-[#59b9e6]" : "border-white bg-[#59b9e6]"}`}>
                    {userAvatarUrl && !hasAvatarError ? (
                      <img
                        src={userAvatarUrl}
                        alt={userDisplayName}
                        className="h-full w-full object-cover"
                        onError={() => setHasAvatarError(true)}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-black text-white">
                        {userInitial}
                      </div>
                    )}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 bg-emerald-400 ${isDark ? "border-[#1e1e2f]" : "border-white"}`} />
                </div>

                <div className="min-w-[148px]">
                  <p className={`truncate text-sm font-extrabold ${isDark ? "text-[#f1f1f1]" : "text-[#203572]"}`}>
                    {userDisplayName}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${isDark ? "text-[#a1a1aa]" : "text-[#59b9e6]"}`}>
                    {primaryRoleLabel}
                  </p>
                </div>

                <FaChevronRight className={`${isDark ? "text-[#a1a1aa]" : "text-[#59b9e6]"}`} />
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="hidden rounded-full bg-[#ffd15d] px-6 py-3 text-sm font-bold tracking-wide text-[#203572] shadow-[0_12px_24px_rgba(255,209,93,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ffc949] sm:inline-flex"
              >
                <span className="flex items-center gap-2">
                  <FaUser className="text-sm" />
                  Ro'yxatdan o'tish
                </span>
              </button>
            )}

            <button
              onClick={() => setIsMobileOpen((prev) => !prev)}
              className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-[0_8px_20px_rgba(166,100,102,0.08)] transition-all lg:hidden ${
                isDark
                  ? "border-[#59b9e6]/18 bg-[#1b2a41] text-[#f1f1f1] hover:bg-[#243652]"
                  : "border-[#d8eef7] bg-white text-[#59b9e6] hover:bg-[#f4fcff]"
              }`}
              aria-label="Menu"
            >
              {isMobileOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {isMobileOpen && (
          <div className={`mx-auto mt-3 max-w-7xl rounded-[26px] border p-4 shadow-[0_18px_40px_rgba(166,100,102,0.14)] backdrop-blur-xl lg:hidden ${
            isDark
              ? "border-[#59b9e6]/18 bg-[#121c2d]/95"
              : "border-[#d8eef7] bg-white/92"
          }`}>
            <div className="flex flex-col gap-2">
              {onThemeToggle && (
                <button
                  type="button"
                  onClick={() => {
                    onThemeToggle();
                    setIsMobileOpen(false);
                  }}
                  className={`flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                    isDark
                      ? "bg-[#1b2a41] text-[#f1f1f1]"
                      : "bg-[#f4fcff] text-[#203572]"
                  }`}
                >
                  {isDark ? <FaSun className="mr-2 text-[13px]" /> : <FaMoon className="mr-2 text-[13px]" />}
                  {isDark ? "Light Mode" : "Dark Mode"}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  navigate("/favorites");
                  setIsMobileOpen(false);
                }}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                  isDark
                    ? "bg-[#1b2a41] text-[#f1f1f1]"
                    : "bg-[#f4fcff] text-[#203572]"
                }`}
              >
                <span className="flex items-center">
                  <FaHeart className="mr-2 text-[13px] text-[#59b9e6]" />
                  Favourite Games
                </span>
                <span className="rounded-full bg-[#ffd15d] px-2 py-0.5 text-[10px] font-black text-[#203572]">
                  {favoriteCount}
                </span>
              </button>

              {navItems.map((item) => {
                const isActive = active === item.label;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.label, item.href);
                    }}
                    className={`flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-[#59b9e6] text-white"
                        : isDark
                          ? "text-[#f1f1f1] hover:bg-[#1b2a41]"
                          : "text-[#203572] hover:bg-[#eefaff]"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                );
              })}

              {user && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileOpen(false);
                    setIsUserPanelOpen(true);
                  }}
                  className={`mt-2 flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                    isDark
                      ? "bg-[#1b2a41] text-[#f1f1f1]"
                      : "bg-[#f4fcff] text-[#203572]"
                  }`}
                >
                  <span className="flex items-center">
                    <FaUser className="mr-2 text-[13px]" />
                    Akkaunt menyusi
                  </span>
                  <FaChevronRight className="text-xs" />
                </button>
              )}

              {!user && (
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsMobileOpen(false);
                  }}
                  className="mt-2 flex items-center justify-center rounded-2xl bg-[#ffd15d] px-4 py-3 text-sm font-bold text-[#203572] transition-all hover:bg-[#ffc949]"
                >
                  <FaUser className="mr-2" />
                  Ro'yxatdan o'tish
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {user && (
        <>
          <button
            type="button"
            aria-label="Close account panel"
            onClick={() => setIsUserPanelOpen(false)}
            className={`fixed cursor-pointer inset-0 z-[58] transition-all duration-300 ${
              isUserPanelOpen ? "pointer-events-auto bg-[#0f172a]/50 opacity-100" : "pointer-events-none opacity-0"
            }`}
          />

          <aside
            className={`fixed bottom-0 right-0 top-0 z-[59] flex w-full max-w-[360px] flex-col border-l transition-transform duration-300 ${
              isDark
                ? "border-[#59b9e6]/18 bg-[#111827]/98"
                : "border-[#d8eef7] bg-white/98"
            } ${isUserPanelOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <div className={`flex items-center justify-between border-b px-5 py-5 ${isDark ? "border-[#2b3146]" : "border-[#d8eef7]"}`}>
              <div>
                <p className={`text-xs font-bold uppercase tracking-[0.24em] ${isDark ? "text-[#a1a1aa]" : "text-[#59b9e6]"}`}>
                  Akkaunt Menyusi
                </p>
                <h3 className={`mt-2 text-xl font-black ${isDark ? "text-[#f1f1f1]" : "text-[#203572]"}`}>
                  GAMEVERSE
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUserPanelOpen(false)}
                className={`flex cursor-pointer h-10 w-10 items-center justify-center rounded-full border transition-all ${
                  isDark
                    ? "border-[#2b3146] bg-[#1e1e2f] text-[#f1f1f1] hover:bg-[#25253a]"
                    : "border-[#d8eef7] bg-white text-[#203572] hover:bg-[#f4fcff]"
                }`}
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6">
                <div className={`rounded-[28px] border p-4 shadow-[0_18px_40px_rgba(166,100,102,0.12)] ${
                  isDark
                  ? "border-[#59b9e6]/18 bg-gradient-to-br from-[#121c2d] to-[#0f172a]"
                  : "border-[#d8eef7] bg-gradient-to-br from-white to-[#f4fcff]"
              }`}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#59b9e6] via-[#9ad7ef] to-[#ffd76d] opacity-60 blur-sm" />
                    <div className={`relative h-16 w-16 overflow-hidden rounded-full border-2 ${isDark ? "border-[#1e1e2f]" : "border-white"}`}>
                      {userAvatarUrl && !hasAvatarError ? (
                        <img
                          src={userAvatarUrl}
                          alt={userDisplayName}
                          className="h-full w-full object-cover"
                          onError={() => setHasAvatarError(true)}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#59b9e6] text-lg font-black text-white">
                          {userInitial}
                        </div>
                      )}
                    </div>
                    <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 bg-emerald-400 ${isDark ? "border-[#1e1e2f]" : "border-white"}`} />
                  </div>

                  <div className="min-w-0">
                    <p className={`truncate text-lg font-black ${isDark ? "text-[#f1f1f1]" : "text-[#203572]"}`}>
                      {userDisplayName}
                    </p>
                    <p className={`mt-1 text-[11px] font-bold uppercase tracking-[0.22em] ${isDark ? "text-[#a1a1aa]" : "text-[#59b9e6]"}`}>
                      {primaryRoleLabel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {drawerLinks
                  .filter((item) => item.visible)
                  .map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsUserPanelOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between rounded-2xl border px-4 py-4 text-sm font-semibold transition-all ${
                          isActive
                            ? "border-[#59b9e6]/30 bg-[#59b9e6] text-white"
                            : isDark
                              ? "border-[#2b3146] bg-[#1a1a28] text-[#f1f1f1] hover:bg-[#1b2a41]"
                              : "border-[#d8eef7] bg-white text-[#203572] hover:bg-[#f4fcff]"
                        }`
                      }
                    >
                      <span className="flex items-center gap-3">
                        {item.icon}
                        {item.label}
                      </span>
                      <FaChevronRight className="text-xs opacity-70" />
                    </NavLink>
                  ))}
              </div>
            </div>

            <div className={`border-t p-5 ${isDark ? "border-[#2b3146]" : "border-[#d8eef7]"}`}>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex cursor-pointer w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#59b9e6] to-[#ffd15d] px-4 py-4 text-sm font-bold text-[#0f172a] transition-all hover:-translate-y-0.5 disabled:opacity-70"
              >
                <FaSignOutAlt className="text-sm" />
                Chiqish
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

export default Header;
