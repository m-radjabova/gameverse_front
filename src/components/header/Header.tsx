import { useState } from "react";
import {
  FaUser,
  FaGamepad,
  FaTrophy,
  FaEnvelope,
  FaSignOutAlt,
} from "react-icons/fa";
import { MdStars } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import useContextPro from "../../hooks/useContextPro";
import { logoutRequest } from "../../utils/auth";
import { toMediaUrl } from "../../utils";


type HeaderProps = {
  active?: "O'yinlar" | "Haqida" | "Izohlar" | "Bog'lanish";
  onNavClick?: (section: string) => void;
};

function Header({ active = "O'yinlar", onNavClick }: HeaderProps) {
  const {
    state: { user },
    dispatch,
  } = useContextPro();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    {
      label: "O'yinlar",
      icon: <FaGamepad className="mr-1.5" />,
      href: "#games",
    },
    { label: "Haqida", icon: <MdStars className="mr-1.5" />, href: "#about" },
    {
      label: "Izohlar",
      icon: <FaTrophy className="mr-1.5" />,
      href: "#comments",
    },
    {
      label: "Bog'lanish",
      icon: <FaEnvelope className="mr-1.5" />,
      href: "#contact",
    },
  ] as const;

  const navigate = useNavigate();

  const scrollToSection = (href: string) => {
    if (!href.startsWith("#")) return;
    const targetId = href.slice(1);
    const target = document.getElementById(targetId);
    if (!target) return;

    const headerOffset = 96;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: targetPosition, behavior: "smooth" });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutRequest();
    } finally {
      dispatch({ type: "LOGOUT" });
      setIsLoggingOut(false);
      navigate("/login");
    }
  };

  return (
    <header
      className={`section-reveal fixed top-0 left-0 right-0 z-50 mx-auto flex w-full items-center justify-between px-6 py-5 
        backdrop-blur-sm bg-[#d42d73]/90 `}
    >
      {/* Logo */}
      <div onClick={() => navigate("/")} className=" flex items-center gap-3 group cursor-pointer">
        <div className="relative h-12 w-12 transform transition-transform group-hover:scale-110">
          <span className="absolute left-[2px] top-[2px] h-3 w-8 rounded-[2px] bg-white shadow-lg" />
          <span className="absolute left-[2px] top-[22px] h-3 w-3 rounded-full bg-white shadow-lg" />
          <span className="absolute left-[19px] top-[22px] h-3 w-3 rounded-[2px] bg-white/90 shadow-lg" />
        </div>
        <span className="text-xl font-black text-white tracking-tight">
          GAMEVERSE
        </span>
      </div>

      {/* Navigation */}
      <nav className="hidden items-center gap-8 md:flex">
        {navItems.map((item) => {
          const isActive = active === item.label;
          return (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                if (onNavClick) {
                  onNavClick(item.label);
                  return;
                }
                scrollToSection(item.href);
              }}
              className={`
                flex items-center px-3 py-2 text-sm font-bold tracking-wide transition-all duration-300
                ${
                  isActive
                    ? "text-white bg-white/20 rounded-full"
                    : "text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                }
              `}
            >
              {item.icon}
              {item.label}
            </a>
          );
        })}

        {user && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-bold tracking-wide transition-all duration-300 ${
                isActive
                  ? "text-white bg-white/20 rounded-full"
                  : "text-white/70 hover:text-white hover:bg-white/10 rounded-full"
              }`
            }
          >
            <FaUser className="mr-1.5" />
            Profile
          </NavLink>
        )}
      </nav>

      {user ? (
        <div className="flex items-center gap-3">
          <div className="group relative flex items-center gap-3 rounded-2xl border border-white/25 bg-white/10 px-3 py-2 backdrop-blur-lg shadow-[0_10px_25px_rgba(0,0,0,0.25)]">
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#ffe24d] via-[#ffb347] to-[#ffd966] blur-[1px]" />
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/40 bg-[#b0134d]">
                {user.avatar ? (
                  <img
                    src={user.avatar ? toMediaUrl(user.avatar) : undefined}
                    alt={user.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-black text-white">
                    {user.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border border-white bg-emerald-400" />
            </div>
            <div className="hidden min-w-[120px] sm:block">
              <p className="truncate text-sm font-extrabold tracking-wide text-white">
                {user.username}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ffe24d]">
                {user.roles?.[0] || "student"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition-all hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-70"
            aria-label="Logout"
          >
            <FaSignOutAlt className="text-sm" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="group relative overflow-hidden rounded-full border-2 border-[#ffe24d] bg-gradient-to-b from-[#ffd966] to-[#ffb347] px-8 py-3 text-sm font-black tracking-[0.15em] text-[#1a1a1a] shadow-[0_10px_0_0_rgba(230,126,34,0.95),0_15px_25px_rgba(0,0,0,0.3)] transition-all hover:translate-y-1 hover:shadow-[0_8px_0_0_rgba(230,126,34,0.95),0_12px_20px_rgba(0,0,0,0.25)] active:translate-y-2 active:shadow-[0_6px_0_0_rgba(230,126,34,0.95)]"
        >
          <span className="relative z-10 flex items-center gap-2">
            <FaUser className="text-sm" />
            RO'YXATDAN O'TISH
          </span>
          <span className="absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-500 group-hover:translate-x-0" />
        </button>
      )}
    </header>
  );
}

export default Header;
