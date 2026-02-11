import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Logo from "../../assets/studylogo.svg";
import useContextPro from "../../hooks/useContextPro";
import { useEffect, useState } from "react";

import {
  Avatar,
  Box,
  Menu,
  MenuItem,
  Typography,
  Divider
} from "@mui/material";
import apiClient from "../../apiClient/apiClient";
import type { User } from "../../types/types";
import {
  MdOutlineKeyboardArrowDown,
  MdPerson,
  MdAdminPanelSettings,
  MdHome,
  MdSchool,
  MdWork,
  MdArticle,
  MdInfo,
  MdMenu,
  MdClose,
} from "react-icons/md";
import { clearAuthStorage, logoutRequest } from "../../utils/auth";
import { toMediaUrl } from "../../utils";
import { IoIosLogOut } from "react-icons/io";

function Header() {
  const {
    state: { user },
    dispatch,
  } = useContextPro();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token || user) return;

    (async () => {
      try {
        const me = await apiClient.get<User>("/users/me");
        dispatch({ type: "SET_USER", payload: me.data });
      } catch {
        clearAuthStorage();
        dispatch({ type: "LOGOUT" });
      }
    })();
  }, [dispatch, user]);

  useEffect(() => {
    setAnchorEl(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    await logoutRequest();
    dispatch({ type: "LOGOUT" });
    handleMenuClose();
    navigate("/login");
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-white/90 hover:text-white transition-all duration-300 font-medium relative group ${
      isActive
        ? "before:absolute before:inset-x-0 before:-bottom-1 before:h-0.5 before:bg-white/90"
        : ""
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block py-3 px-4 text-lg font-medium transition-all duration-300 rounded-lg ${
      isActive
        ? "bg-white/10 text-white"
        : "text-white/90 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <>
      <header
        className="w-full bg-gradient-to-r from-teal-500 to-teal-600 shadow-lg sticky top-0 z-50 border-b border-white/10 backdrop-blur"
      >
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <div className="h-16 lg:h-20 flex items-center justify-between">
            {/* LOGO */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/home")}
            >
              <img
                src={Logo}
                alt="logo"
                className="h-10 lg:h-12 w-auto transition-all duration-500 hover:scale-105 hover:rotate-3"
              />
            </div>

            <nav className="hidden lg:block">
              <ul className="flex items-center gap-8">
                {[
                  { to: "/home", label: "Home", icon: <MdHome className="mr-2" /> },
                  { to: "/courses", label: "Courses", icon: <MdSchool className="mr-2" /> },
                  { to: "/careers", label: "Careers", icon: <MdWork className="mr-2" /> },
                  { to: "/blog", label: "Blog", icon: <MdArticle className="mr-2" /> },
                  { to: "/about", label: "About", icon: <MdInfo className="mr-2" /> },
                ].map((item) => (
                  <li key={item.to}>
                    <NavLink to={item.to} className={linkClass}>
                      <div className="flex items-center px-3 py-2 rounded-lg transition-all duration-300 hover:bg-white/10 group">
                        <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                          {item.icon}
                        </span>
                        <span className="relative">
                          {item.label}
                          <span
                            className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-500 group-hover:w-full ${
                              scrolled ? "bg-teal-500" : "bg-white"
                            }`}
                          ></span>
                        </span>
                      </div>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* RIGHT SIDE ACTIONS */}
            <div className="flex items-center gap-2 lg:gap-4">

              {!user ? (
                // UNAUTHENTICATED USER
                <>
                  <button
                    onClick={() => navigate("/login")}
                    className={`hidden lg:block px-6 py-2.5 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${
                      scrolled
                        ? "bg-teal-600 text-white hover:bg-teal-700"
                        : "bg-white text-teal-600 hover:bg-white/90"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className={`px-4 lg:px-6 py-2.5 rounded-full font-semibold transition-all duration-300 border ${
                      scrolled
                        ? "bg-teal-500 text-white border-teal-500 hover:bg-teal-600"
                        : "bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
                    }`}
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                // AUTHENTICATED USER
                <>

                  {/* USER MENU */}
                  <Box
                    onClick={handleMenuOpen}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.2,
                      cursor: "pointer",
                      userSelect: "none",
                      backgroundColor: scrolled ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.1)",
                      borderRadius: "999px",
                      px: 1.6,
                      py: 0.9,
                      backdropFilter: "blur(10px)",
                      border: scrolled ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.2)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                        backgroundColor: scrolled ? "white" : "rgba(255,255,255,0.2)",
                      },
                    }}
                  >
                    <Avatar
                      src={user.avatar ? toMediaUrl(user.avatar) : undefined}
                      alt={user.username}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: scrolled ? "#0d9488" : "#ffffff",
                        color: scrolled ? "white" : "#0d9488",
                        border: scrolled ? "2px solid #ffffff" : "2px solid #ffffff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        "& img": { objectFit: "cover" },
                      }}
                    >
                      {(user.username?.[0] || "U").toUpperCase()}
                    </Avatar>

                    <div className="hidden lg:block">
                      <Typography
                        sx={{
                          color: scrolled ? "#1e293b" : "#ffffff",
                          fontWeight: 600,
                          fontSize: 14,
                          lineHeight: 1.2,
                        }}
                      >
                        {user.username}
                      </Typography>
                      <Typography
                        sx={{
                          color: scrolled ? "#64748b" : "#e2e8f0",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      >
                        {user.email?.split("@")[0]}
                      </Typography>
                    </div>

                    <MdOutlineKeyboardArrowDown
                      className={`transition-transform duration-300 ${open ? "rotate-180" : ""} ${
                        scrolled ? "text-teal-600" : "text-white"
                      }`}
                      size={20}
                    />
                  </Box>

                  {/* USER DROPDOWN MENU */}
                  <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    PaperProps={{
                      sx: {
                        mt: 1.5,
                        borderRadius: 3,
                        minWidth: 220,
                        overflow: "hidden",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                      },
                    }}
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
                        {user.username}
                      </Typography>
                      <Typography sx={{ fontSize: 13, color: "#64748b", mt: 0.5 }}>
                        {user.email}
                      </Typography>
                    </div>

                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        navigate("/profile");
                      }}
                      sx={{
                        py: 1.5,
                        fontWeight: 600,
                        color: "#334155",
                        "&:hover": {
                          bgcolor: "rgba(20, 184, 166, 0.1)",
                          color: "#0d9488",
                        },
                      }}
                    >
                      <MdPerson className="mr-3 text-gray-500" />
                      My Profile
                    </MenuItem>

                    {user.roles.includes("admin") && (
                      <MenuItem
                        onClick={() => {
                          handleMenuClose();
                          navigate("/admin");
                        }}
                        sx={{
                          py: 1.5,
                          fontWeight: 600,
                          color: "#334155",
                          "&:hover": {
                            bgcolor: "rgba(20, 184, 166, 0.1)",
                            color: "#0d9488",
                          },
                        }}
                      >
                        <MdAdminPanelSettings className="mr-3 text-gray-500" />
                        Admin Dashboard
                      </MenuItem>
                    )}

                    <Divider sx={{ my: 1 }} />

                    <MenuItem
                      onClick={handleLogout}
                      sx={{
                        py: 1.5,
                        fontWeight: 700,
                        color: "#ef4444",
                        "&:hover": {
                          bgcolor: "rgba(239, 68, 68, 0.1)",
                        },
                      }}
                    >
                      <IoIosLogOut className="mr-3" />
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              )}

              {/* MOBILE MENU BUTTON */}
              <button
                onClick={toggleMobileMenu}
                className={`lg:hidden p-2 rounded-lg transition-colors ${
                  scrolled
                    ? "text-teal-600 hover:bg-teal-50"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {mobileMenuOpen ? <MdClose size={28} /> : <MdMenu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-gradient-to-b from-teal-600 to-emerald-700">
          <div className="p-6">

            {/* MOBILE NAV LINKS */}
            <nav>
              <ul className="space-y-2">
                {[
                  { to: "/home", label: "Home", icon: <MdHome size={24} /> },
                  { to: "/courses", label: "Courses", icon: <MdSchool size={24} /> },
                  { to: "/careers", label: "Careers", icon: <MdWork size={24} /> },
                  { to: "/blog", label: "Blog", icon: <MdArticle size={24} /> },
                  { to: "/about", label: "About Us", icon: <MdInfo size={24} /> },
                ].map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={mobileLinkClass}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-4">
                        <span className="opacity-80">{item.icon}</span>
                        {item.label}
                      </div>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* MOBILE USER INFO */}
            {user && (
              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar
                    src={user.avatar ? toMediaUrl(user.avatar) : undefined}
                    alt={user.username}
                    sx={{
                      width: 50,
                      height: 50,
                      bgcolor: "#ffffff",
                      color: "#0d9488",
                      border: "2px solid #ffffff",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    }}
                  >
                    {(user.username?.[0] || "U").toUpperCase()}
                  </Avatar>
                  <div>
                    <h3 className="text-white font-bold text-lg">{user.username}</h3>
                    <p className="text-white/70 text-sm">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
                >
                  <IoIosLogOut size={20} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Header;