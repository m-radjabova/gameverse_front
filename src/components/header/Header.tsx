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
  Divider,
} from "@mui/material";
import apiClient from "../../apiClient/apiClient";
import type { User } from "../../types/types";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { clearAuthStorage, logoutRequest } from "../../utils/auth";
import { toMediaUrl } from "../../utils";

function Header() {
  const {
    state: { user },
    dispatch,
  } = useContextPro();
  // const API_URL = import.meta.env.VITE_API_URL;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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
  }, [location.pathname]);

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

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-white/90 hover:text-white transition-all duration-300 font-medium relative pb-1 ${
      isActive ? "text-white" : ""
    } hover:opacity-100 group`;

  // const avatarSrc = useMemo(() => {
  //   if (!user?.avatar) return "";
  //   if (user.avatar.startsWith("http")) return user.avatar;
  //   return `${API_URL}${user.avatar}`;
  // }, [user]);
  // const displayName = useMemo(() => {
  //   return (user as any)?.username || (user as any)?.name || "User";
  // }, [user]);

  // const avatarFallback = (user?.username?.[0] || "U").toUpperCase();

  return (
    <header className="w-full bg-gradient-to-r from-teal-500 to-teal-600 shadow-lg sticky top-0 z-50 border-b border-white/10 backdrop-blur">
      <div className="mx-auto max-w-8xl px-6">
        <div className="h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="logo" className="h-10 w-auto transition-transform duration-300 hover:scale-105" />
          </div>

          <nav className="hidden md:block">
            <ul className="flex items-center gap-10">
              <li>
                <NavLink to="/home" className={linkClass}>
                  <span className="relative">
                    Home
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white/70 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/courses" className={linkClass}>
                  <span className="relative">
                    Courses
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white/70 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/careers" className={linkClass}>
                  <span className="relative">
                    Careers
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white/70 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/blog" className={linkClass}>
                  <span className="relative">
                    Blog
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white/70 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className={linkClass}>
                  <span className="relative">
                    About Us
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white/70 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* ✅ RIGHT SIDE */}
          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="h-10 px-6 rounded-full bg-white text-teal-600 font-semibold hover:bg-white/90 transition-all duration-300 shadow-md hover-lift"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="h-10 px-6 rounded-full bg-white/25 text-white font-semibold hover:bg-white/40 transition-all duration-300 border border-white/30 backdrop-blur-sm hover-lift"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <Box
                  onClick={handleMenuOpen}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                    cursor: "pointer",
                    userSelect: "none",
                    backgroundColor: "transparent",
                    borderRadius: "999px",
                    px: 1.6,
                    py: 0.9,

                    "&:hover": {
                      boxShadow: "0 10px 24px rgba(0,0,0,0.10)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Avatar
                    src={user.avatar ? toMediaUrl(user.avatar) : undefined}
                    alt={user.username}
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: "#e5e7eb",
                      border: "2px solid #f3f4f6",
                      "& img": { objectFit: "cover" },
                    }}
                  >
                    {(user.username?.[0] || "U").toUpperCase()}
                  </Avatar>

                  <Typography
                    sx={{
                      color: "#fcfcfd",
                      fontWeight: 600,
                      fontSize: 16,
                      lineHeight: 1,
                      pr: 0.3,
                    }}
                  >
                    {user.username}
                  </Typography>

                  <Typography
                    sx={{
                      color: "#fcfcfc",
                      mt: "1px",
                    }}
                  >
                    <MdOutlineKeyboardArrowDown size={24} />
                  </Typography>
                </Box>

                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      borderRadius: 2,
                      minWidth: 190,
                      overflow: "hidden",
                      boxShadow: "0 16px 40px rgba(15, 23, 42, 0.2)",
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      navigate("/profile");
                    }}
                    sx={{
                      fontWeight: 600,
                      "&:hover": {
                        bgcolor: "rgba(20, 184, 166, 0.08)",
                      },
                    }}
                  >
                    Profile
                  </MenuItem>

                  {
                    user.roles.includes("admin") && (
                      <MenuItem
                        onClick={() => {
                          handleMenuClose();
                          navigate("/admin");
                        }}
                        sx={{
                          fontWeight: 600,
                          "&:hover": {
                            bgcolor: "rgba(20, 184, 166, 0.08)",
                          },
                        }}
                      >
                        Admin
                      </MenuItem>
                    )
                  }


                  <Divider />

                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      color: "#d32f2f",
                      fontWeight: 700,
                      "&:hover": { bgcolor: "rgba(239, 68, 68, 0.08)" },
                    }}
                  >
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
