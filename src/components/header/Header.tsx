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
      label: "Teacher Panel",
      to: "/teacher-panel",
      icon: <FaGraduationCap className="text-sm" />,
      visible: canOpenTeacherPanel,
    },
    {
      label: "Admin Panel",
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
              ? "border-[#ff6b8a]/18 bg-[#1e1e2f]/80"
              : "border-[#f1d9d6] bg-white/75"
          }`}
        >
          <div
            onClick={() => navigate("/")}
            className="group flex cursor-pointer items-center gap-3"
          >
            <div
              className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border shadow-[0_8px_20px_rgba(224,124,142,0.18)] transition-transform duration-300 group-hover:scale-105 ${
                isDark
                  ? "border-[#ff6b8a]/20 bg-gradient-to-br from-[#25253a] via-[#1e1e2f] to-[#141423]"
                  : "border-[#f0d9d6] bg-gradient-to-br from-[#fff8f7] via-[#f7ebe0] to-[#eec5c7]"
              }`}
            >
              <span className="absolute left-[10px] top-[11px] h-3.5 w-3.5 rounded-full bg-[#ff6b8a]" />
              <span className="absolute right-[10px] top-[11px] h-3 w-3 rounded-full bg-[#ff8ca6]" />
              <span className={`absolute bottom-[10px] left-[12px] h-3 w-3 rounded-full ${isDark ? "bg-[#2c3246]" : "bg-[#e3bab6]"}`} />
              <span className={`absolute bottom-[10px] right-[11px] h-3.5 w-3.5 rounded-full ${isDark ? "bg-[#a1a1aa]" : "bg-[#a66466]"}`} />
              <span className="absolute h-2.5 w-2.5 rounded-full bg-white shadow" />
            </div>

            <div className="leading-tight">
              <h1 className={`text-lg font-black tracking-tight sm:text-xl ${isDark ? "text-[#f1f1f1]" : "text-[#7b4f53]"}`}>
                GAMEVERSE
              </h1>
              <p className={`text-[10px] font-bold uppercase tracking-[0.25em] ${isDark ? "text-[#a1a1aa]" : "text-[#d98a95]"}`}>
                Learn • Play • Grow
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
                      ? "bg-[#ff6b8a] text-white shadow-[0_8px_20px_rgba(255,107,138,0.35)]"
                      : isDark
                        ? "text-[#f1f1f1] hover:bg-[#25253a] hover:text-[#ff6b8a]"
                        : "text-[#8a6166] hover:bg-[#f9eeee] hover:text-[#a66466]"
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
                  ? "border-[#ff6b8a]/20 bg-[#25253a] text-[#ff8ca6] hover:bg-[#2e2e45]"
                  : "border-[#f0d9d6] bg-white text-[#d45c7d] hover:bg-[#fff4f3]"
              }`}
              aria-label="Open favourites"
            >
              <FaHeart className="text-sm" />
              {favoriteCount > 0 ? (
                <span className="absolute -right-1 -top-1 min-w-[20px] rounded-full bg-gradient-to-r from-[#ff6b8a] to-[#ff4f74] px-1.5 py-0.5 text-[10px] font-black text-white shadow-lg">
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
                    ? "border-[#ff6b8a]/20 bg-[#25253a] text-[#ff6b8a] hover:bg-[#2e2e45]"
                    : "border-[#f0d9d6] bg-white text-[#a66466] hover:bg-[#fff4f3]"
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
                    ? "border-[#ff6b8a]/18 bg-gradient-to-r from-[#25253a] to-[#1e1e2f] hover:bg-[#25253a]"
                    : "border-[#f0d9d6] bg-gradient-to-r from-white to-[#fff7f6] hover:bg-white"
                }`}
              >
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#f7ebe0] via-[#ed97a0] to-[#e07c8e] opacity-60 blur-sm" />
                  <div className={`relative h-11 w-11 overflow-hidden rounded-full border-2 shadow ${isDark ? "border-[#1e1e2f] bg-[#ff6b8a]" : "border-white bg-[#e07c8e]"}`}>
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
                  <p className={`truncate text-sm font-extrabold ${isDark ? "text-[#f1f1f1]" : "text-[#7b4f53]"}`}>
                    {userDisplayName}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.18em] ${isDark ? "text-[#a1a1aa]" : "text-[#d98a95]"}`}>
                    {primaryRoleLabel}
                  </p>
                </div>

                <FaChevronRight className={`${isDark ? "text-[#a1a1aa]" : "text-[#a66466]"}`} />
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="hidden rounded-full bg-[#ff6b8a] px-6 py-3 text-sm font-bold tracking-wide text-white shadow-[0_12px_24px_rgba(255,107,138,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff4f74] sm:inline-flex"
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
                  ? "border-[#ff6b8a]/18 bg-[#25253a] text-[#f1f1f1] hover:bg-[#2e2e45]"
                  : "border-[#f0d9d6] bg-white text-[#a66466] hover:bg-[#fff4f3]"
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
              ? "border-[#ff6b8a]/18 bg-[#1e1e2f]/95"
              : "border-[#f0d9d6] bg-white/90"
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
                      ? "bg-[#25253a] text-[#f1f1f1]"
                      : "bg-[#fff5f4] text-[#7b4f53]"
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
                    ? "bg-[#25253a] text-[#f1f1f1]"
                    : "bg-[#fff5f4] text-[#7b4f53]"
                }`}
              >
                <span className="flex items-center">
                  <FaHeart className="mr-2 text-[13px] text-[#ff6b8a]" />
                  Favourite Games
                </span>
                <span className="rounded-full bg-[#ff6b8a] px-2 py-0.5 text-[10px] font-black text-white">
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
                        ? "bg-[#ff6b8a] text-white"
                        : isDark
                          ? "text-[#f1f1f1] hover:bg-[#25253a]"
                          : "text-[#7b4f53] hover:bg-[#fbefee]"
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
                      ? "bg-[#25253a] text-[#f1f1f1]"
                      : "bg-[#fff5f4] text-[#7b4f53]"
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
                  className="mt-2 flex items-center justify-center rounded-2xl bg-[#ff6b8a] px-4 py-3 text-sm font-bold text-white transition-all hover:bg-[#ff4f74]"
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
                ? "border-[#ff6b8a]/18 bg-[#111827]/98"
                : "border-[#f0d9d6] bg-white/98"
            } ${isUserPanelOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <div className={`flex items-center justify-between border-b px-5 py-5 ${isDark ? "border-[#2b3146]" : "border-[#f4d9d7]"}`}>
              <div>
                <p className={`text-xs font-bold uppercase tracking-[0.24em] ${isDark ? "text-[#a1a1aa]" : "text-[#d98a95]"}`}>
                  Account Menu
                </p>
                <h3 className={`mt-2 text-xl font-black ${isDark ? "text-[#f1f1f1]" : "text-[#7b4f53]"}`}>
                  GAMEVERSE
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUserPanelOpen(false)}
                className={`flex cursor-pointer h-10 w-10 items-center justify-center rounded-full border transition-all ${
                  isDark
                    ? "border-[#2b3146] bg-[#1e1e2f] text-[#f1f1f1] hover:bg-[#25253a]"
                    : "border-[#f0d9d6] bg-white text-[#7b4f53] hover:bg-[#fff4f3]"
                }`}
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6">
              <div className={`rounded-[28px] border p-4 shadow-[0_18px_40px_rgba(166,100,102,0.12)] ${
                isDark
                  ? "border-[#ff6b8a]/18 bg-gradient-to-br from-[#1e1e2f] to-[#171c2a]"
                  : "border-[#f0d9d6] bg-gradient-to-br from-white to-[#fff4f3]"
              }`}>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#ff8ca6] to-[#ff4f74] opacity-60 blur-sm" />
                    <div className={`relative h-16 w-16 overflow-hidden rounded-full border-2 ${isDark ? "border-[#1e1e2f]" : "border-white"}`}>
                      {userAvatarUrl && !hasAvatarError ? (
                        <img
                          src={userAvatarUrl}
                          alt={userDisplayName}
                          className="h-full w-full object-cover"
                          onError={() => setHasAvatarError(true)}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[#ff6b8a] text-lg font-black text-white">
                          {userInitial}
                        </div>
                      )}
                    </div>
                    <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 bg-emerald-400 ${isDark ? "border-[#1e1e2f]" : "border-white"}`} />
                  </div>

                  <div className="min-w-0">
                    <p className={`truncate text-lg font-black ${isDark ? "text-[#f1f1f1]" : "text-[#7b4f53]"}`}>
                      {userDisplayName}
                    </p>
                    <p className={`mt-1 text-[11px] font-bold uppercase tracking-[0.22em] ${isDark ? "text-[#a1a1aa]" : "text-[#d98a95]"}`}>
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
                            ? "border-[#ff6b8a]/30 bg-[#ff6b8a] text-white"
                            : isDark
                              ? "border-[#2b3146] bg-[#1a1a28] text-[#f1f1f1] hover:bg-[#25253a]"
                              : "border-[#f0d9d6] bg-white text-[#7b4f53] hover:bg-[#fff5f4]"
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

            <div className={`border-t p-5 ${isDark ? "border-[#2b3146]" : "border-[#f4d9d7]"}`}>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex cursor-pointer w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#ff6b8a] to-[#ff4f74] px-4 py-4 text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-70"
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
