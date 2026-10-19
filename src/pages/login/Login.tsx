import { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiZap,
  FiShield,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import {
  FaRocket,
  FaGraduationCap,
  FaStar,
  FaPlay,
  FaTrophy,
} from "react-icons/fa";
import { GiPlanetCore } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";

import useContextPro from "../../hooks/useContextPro";
import apiClient from "../../apiClient/apiClient";
import type { User } from "../../types/types";
import { getErrorMessage } from "../../utils/error";
import { setTokens } from "../../utils/auth";

import loginImg from "../../assets/loginImg.webp";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import useHomeTheme from "../../hooks/useHomeTheme";

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer" | string;
};

function LoginForm() {
  const { dispatch } = useContextPro();
  const navigate = useNavigate();
  const isDarkMode = useHomeTheme();

  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  const completeAuth = async (accessToken: string, refreshToken?: string) => {
    setTokens(accessToken, refreshToken);

    const me = await apiClient.get<User>("/users/me");
    const currentUser = me.data;

    dispatch({ type: "SET_USER", payload: currentUser });

    if (currentUser?.roles?.length) {
      localStorage.setItem("role", currentUser.roles.join(","));
    } else {
      localStorage.removeItem("role");
    }

    navigate("/", { replace: true });
  };

  const onSubmit = async (data: FieldValues) => {
    try {
      const res = await apiClient.post<LoginResponse>("/auth/login", {
        email: data.email,
        password: data.password,
      });

      await completeAuth(res.data.access_token, res.data.refresh_token);

      toast.success("Xush kelibsiz! 🎉");
    } catch (error: unknown) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      const message = getErrorMessage(error);

      if (status === 401) {
        toast.error(message || "Email yoki parol noto'g'ri");
      } else if (status === 404) {
        toast.error("Akkaunt topilmadi");
      } else {
        toast.error(message);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await apiClient.post<LoginResponse>("/auth/google", {
        id_token: idToken,
      });

      await completeAuth(res.data.access_token, res.data.refresh_token);

      toast.success("Google orqali kirdingiz!");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div
      data-home-theme={isDarkMode ? "dark" : "light"}
      className="auth-theme fixed inset-0 h-screen w-full overflow-hidden bg-[var(--panel-page-base)]"
    >
      {/* ===== Split Layout ===== */}
      <div className="flex h-full w-full">
        {/* ===== LEFT SIDE - IMAGE SHOWCASE ===== */}
        <div className="relative hidden lg:block lg:w-1/2 h-full overflow-hidden">
          {/* Ken Burns background image */}
          <img
            src={loginImg}
            alt="Login illustration"
            className="login-ken-burns absolute inset-0 w-full h-full object-cover"
          />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#22356f]/80 via-[#1d2f63]/40 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

          {/* Animated glow blobs */}
          <div className="login-blob login-blob-1" />
          <div className="login-blob login-blob-2" />
          <div className="login-blob login-blob-3" />

          {/* Floating particles */}
          <div className="login-particle login-particle-1">✦</div>
          <div className="login-particle login-particle-2">✦</div>
          <div className="login-particle login-particle-3">●</div>
          <div className="login-particle login-particle-4">✦</div>
          <div className="login-particle login-particle-5">●</div>

          {/* Top-left brand badge */}
          <div className="absolute top-8 left-8 flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-white/40 blur-lg" />
              <div className="relative w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-2xl shadow-lg">
                <GiPlanetCore className="text-[#ffd966]" />
              </div>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight tracking-wide">
                Gameverse
              </p>
              <p className="text-white/60 text-[11px] tracking-widest uppercase">
                Learn • Play • Grow
              </p>
            </div>
          </div>

          {/* Floating stat cards (glassmorphism) */}
          <div className="login-glass-card login-glass-card-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#59b9e6] to-[#2d8fd1] flex items-center justify-center text-white shadow-lg">
              <FaTrophy />
            </div>
            <div>
              <p className="text-white text-xl font-bold leading-none">50+</p>
              <p className="text-white/60 text-[11px] mt-1">O'yinlar</p>
            </div>
          </div>
          <div className="login-glass-card login-glass-card-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center text-white shadow-lg">
              <FiZap />
            </div>
            <div>
              <p className="text-white text-xl font-bold leading-none">100%</p>
              <p className="text-white/60 text-[11px] mt-1">Interaktiv</p>
            </div>
          </div>

          {/* Bottom content */}
          <div className="absolute bottom-10 left-10 right-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1 text-[#ffd966]">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-xs login-star" />
                ))}
              </div>
              <span className="text-white/70 text-xs">4.9/5 reyting</span>
            </div>

            <h2 className="login-gradient-text text-3xl font-extrabold leading-tight mb-3">
              O'yin orqali o'rganing
            </h2>

            <p className="text-white/70 text-sm max-w-md leading-relaxed mb-5">
              Gameverse — 50+ ta interaktiv o'yin bilan bilim olishni qiziqarli
              va samarali jarayonga aylantiradigan zamonaviy ta'lim platformasi.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#59b9e6] to-[#2d8fd1] flex items-center justify-center">
                  <FaGraduationCap className="text-white text-xs" />
                </div>
                <span className="text-white/80 text-xs">Maktablar uchun</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ffd15d] to-[#ff9d42] flex items-center justify-center">
                  <FaPlay className="text-white text-xs ml-0.5" />
                </div>
                <span className="text-white/80 text-xs">Barcha fanlar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#a855f7] to-[#7c3aed] flex items-center justify-center">
                  <FiShield className="text-white text-xs" />
                </div>
                <span className="text-white/80 text-xs">Xavfsiz muhit</span>
              </div>
            </div>
          </div>

          {/* Decorative bottom fade */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        </div>

        {/* ===== RIGHT SIDE - FORM ===== */}
        <div className="relative w-full lg:w-1/2 h-full overflow-y-auto bg-[image:var(--panel-page-bg)]">
          {/* Soft decorative blobs */}
          <div className="login-form-blob login-form-blob-1" />
          <div className="login-form-blob login-form-blob-2" />

          <div className="relative min-h-full flex items-center justify-center p-6 lg:p-10">
            <div className="w-full max-w-md login-form-card">
              {/* Logo & Header */}
              <div className="text-center mb-9">
                <div className="inline-flex items-center justify-center gap-2 mb-5">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-xl login-logo-glow bg-[var(--panel-accent)]" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--panel-accent)] to-[var(--panel-accent-strong)] flex items-center justify-center shadow-xl transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                      <GiPlanetCore className="text-white text-4xl" />
                    </div>
                  </div>
                  <FaRocket className="text-3xl text-[var(--panel-accent-strong)] login-rocket" />
                </div>

                <h1 className="login-heading-gradient text-4xl font-extrabold mb-3">
                  Xush kelibsiz! 🚀
                </h1>

                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="h-px w-10 bg-gradient-to-r from-transparent to-[var(--panel-accent)]" />
                  <div className="w-2 h-2 rotate-45 bg-[var(--panel-accent)] login-diamond" />
                  <div className="h-px w-10 bg-gradient-to-l from-transparent to-[var(--panel-accent)]" />
                </div>

                <p className="text-sm text-[var(--panel-text-soft)]">
                  Hisobingizga kirish uchun ma'lumotlaringizni kiriting
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-1.5 login-field">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--panel-text)]">
                    Email
                  </label>
                  <div className="relative group">
                    <div className="login-input-icon">
                      <FiMail className="text-base" />
                    </div>
                    <input
                      type="email"
                      {...register("email", {
                        required: "Email talab qilinadi",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Noto'g'ri email format",
                        },
                      })}
                      className="login-input w-full rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] pl-16 pr-4 py-3.5 text-sm text-[var(--panel-text)] placeholder:text-[var(--panel-muted)] outline-none focus:border-[var(--panel-accent)] focus:shadow-[0_0_0_4px_var(--panel-focus-ring)] transition-all"
                      placeholder="siz@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="login-error flex items-center gap-1.5 text-xs text-rose-500">
                      <span className="w-1 h-1 rounded-full bg-rose-500" />
                      {errors.email.message as string}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1.5 login-field">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--panel-text)]">
                      Parol
                    </label>
                  </div>
                  <div className="relative group">
                    <div className="login-input-icon">
                      <FiLock className="text-base" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("password", {
                        required: "Parol talab qilinadi",
                        minLength: {
                          value: 6,
                          message: "Kamida 6 belgi",
                        },
                      })}
                      className="login-input w-full rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] pl-16 pr-12 py-3.5 text-sm text-[var(--panel-text)] placeholder:text-[var(--panel-muted)] outline-none focus:border-[var(--panel-accent)] focus:shadow-[0_0_0_4px_var(--panel-focus-ring)] transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--panel-muted)] hover:text-[var(--panel-accent)] transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="login-error flex items-center gap-1.5 text-xs text-rose-500">
                      <span className="w-1 h-1 rounded-full bg-rose-500" />
                      {errors.password.message as string}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="login-submit group relative w-full overflow-hidden rounded-2xl py-4 text-sm font-bold text-white shadow-xl hover:-translate-y-0.5 hover:shadow-2xl transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                  style={{ backgroundImage: "var(--panel-accent-gradient)" }}
                >
                  {/* Shine sweep effect */}
                  <span className="login-shine" />
                  <span className="relative flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Kirish...</span>
                      </>
                    ) : (
                      <>
                        <span>Kirish</span>
                        <FiArrowRight className="text-sm group-hover:translate-x-1.5 transition-transform duration-300" />
                      </>
                    )}
                  </span>
                </button>

                {/* Divider */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dashed border-[var(--panel-border)]"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="login-divider-badge px-4 py-1 bg-[var(--panel-page-base)] text-[11px] font-medium text-[var(--panel-muted)] rounded-full border border-[var(--panel-border)]">
                      yoki
                    </span>
                  </div>
                </div>

                {/* Google Login */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="login-google group relative w-full overflow-hidden rounded-2xl border-2 border-[var(--panel-border)] bg-[var(--panel-surface)] py-3.5 text-sm font-semibold text-[var(--panel-text)] hover:bg-[var(--panel-surface-strong)] hover:-translate-y-0.5 hover:border-[var(--panel-accent)] transition-all disabled:opacity-70"
                >
                  <span className="flex items-center justify-center gap-2.5">
                    {isGoogleLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[var(--panel-text)] border-t-transparent rounded-full animate-spin" />
                        <span>Bog'lanmoqda...</span>
                      </>
                    ) : (
                      <>
                        <FcGoogle className="text-xl login-google-logo" />
                        <span>Google orqali kirish</span>
                      </>
                    )}
                  </span>
                </button>

                {/* Sign Up Link */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <span className="text-xs text-[var(--panel-muted)]">
                    Hisobingiz yo'qmi?
                  </span>
                  <button
                    onClick={() => navigate("/register")}
                    className="group flex items-center gap-1 text-xs font-bold text-[var(--panel-accent)] hover:text-[var(--panel-accent-strong)] transition-all"
                  >
                    <span className="group-hover:underline underline-offset-2">
                      Ro'yxatdan o'tish
                    </span>
                    <FiArrowRight className="text-[10px] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Custom Animations & Styles ===== */}
      <style>{`
        /* Ken Burns effect */
        @keyframes login-ken-burns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.12) translate(-1.5%, -1.5%); }
        }
        .login-ken-burns {
          animation: login-ken-burns 20s ease-in-out infinite alternate;
        }

        /* Floating glow blobs (left image side) */
        @keyframes login-blob-float {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.35; }
          50% { transform: translate(20px, -30px) scale(1.15); opacity: 0.5; }
        }
        .login-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(60px);
          pointer-events: none;
        }
        .login-blob-1 {
          width: 200px; height: 200px;
          top: 15%; left: -50px;
          background: rgba(89, 185, 230, 0.55);
          animation: login-blob-float 9s ease-in-out infinite;
        }
        .login-blob-2 {
          width: 160px; height: 160px;
          bottom: 25%; right: -30px;
          background: rgba(255, 209, 93, 0.45);
          animation: login-blob-float 11s ease-in-out infinite reverse;
        }
        .login-blob-3 {
          width: 90px; height: 90px;
          top: 45%; right: 15%;
          background: rgba(168, 85, 247, 0.4);
          animation: login-blob-float 7s ease-in-out infinite;
          animation-delay: 1.5s;
        }

        /* Floating particles */
        @keyframes login-particle-rise {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          15% { opacity: 0.8; }
          85% { opacity: 0.8; }
          100% { transform: translateY(-90vh) rotate(360deg); opacity: 0; }
        }
        .login-particle {
          position: absolute;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          pointer-events: none;
          animation: login-particle-rise 10s linear infinite;
        }
        .login-particle-1 { left: 12%; bottom: 20%; animation-delay: 0s; font-size: 16px; }
        .login-particle-2 { left: 30%; bottom: 35%; animation-delay: 3s; font-size: 12px; }
        .login-particle-3 { left: 55%; bottom: 15%; animation-delay: 5s; font-size: 14px; color: rgba(255, 209, 93, 0.8); }
        .login-particle-4 { left: 75%; bottom: 25%; animation-delay: 7s; font-size: 11px; }
        .login-particle-5 { left: 88%; bottom: 40%; animation-delay: 2s; font-size: 13px; color: rgba(89, 185, 230, 0.8); }

        /* Glassmorphism stat cards */
        @keyframes login-glass-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .login-glass-card {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 16px;
          padding: 12px 18px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
          animation: login-glass-float 6s ease-in-out infinite;
        }
        .login-glass-card-1 { top: 20%; right: 8%; animation-delay: 0s; }
        .login-glass-card-2 { top: 42%; left: 6%; animation-delay: 1.5s; }
        .login-glass-card-3 { bottom: 30%; right: 12%; animation-delay: 3s; }

        /* Star pulse */
        @keyframes login-star-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        .login-star { animation: login-star-pulse 2s ease-in-out infinite; }
        .login-star:nth-child(2) { animation-delay: 0.3s; }
        .login-star:nth-child(3) { animation-delay: 0.6s; }
        .login-star:nth-child(4) { animation-delay: 0.9s; }
        .login-star:nth-child(5) { animation-delay: 1.2s; }

        /* Gradient text */
        .login-gradient-text {
          background: linear-gradient(90deg, #ffffff 0%, #ffd966 50%, #59b9e6 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: login-text-shimmer 6s linear infinite;
        }
        @keyframes login-text-shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        /* Soft blobs on form side */
        @keyframes login-form-blob-move {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.2); }
        }
        .login-form-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(70px);
          pointer-events: none;
        }
        .login-form-blob-1 {
          width: 250px; height: 250px;
          top: -80px; right: -80px;
          background: var(--panel-icon-soft);
          animation: login-form-blob-move 12s ease-in-out infinite;
        }
        .login-form-blob-2 {
          width: 200px; height: 200px;
          bottom: -60px; left: -60px;
          background: rgba(255, 209, 93, 0.14);
          animation: login-form-blob-move 14s ease-in-out infinite reverse;
        }

        /* Form card entrance */
        @keyframes login-card-in {
          0% { opacity: 0; transform: translateY(30px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .login-form-card {
          animation: login-card-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        /* Field stagger entrance */
        @keyframes login-field-in {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .login-field {
          animation: login-field-in 0.6s ease-out both;
        }
        .login-field:nth-of-type(1) { animation-delay: 0.15s; }
        .login-field:nth-of-type(2) { animation-delay: 0.25s; }
        .login-field:nth-of-type(3) { animation-delay: 0.4s; }
        .login-field:nth-of-type(4) { animation-delay: 0.55s; }

        /* Logo glow pulse */
        @keyframes login-logo-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.25); }
        }
        .login-logo-glow { animation: login-logo-glow 3s ease-in-out infinite; }

        /* Rocket float */
        @keyframes login-rocket-float {
          0%, 100% { transform: translateY(0) rotate(-4deg); }
          50% { transform: translateY(-8px) rotate(4deg); }
        }
        .login-rocket { animation: login-rocket-float 3.5s ease-in-out infinite; }

        /* Heading gradient */
        .login-heading-gradient {
          background: linear-gradient(135deg, var(--panel-text) 0%, var(--panel-accent) 50%, var(--panel-accent-strong) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        /* Diamond pulse */
        @keyframes login-diamond-pulse {
          0%, 100% { transform: rotate(45deg) scale(1); opacity: 1; }
          50% { transform: rotate(45deg) scale(1.4); opacity: 0.6; }
        }
        .login-diamond { animation: login-diamond-pulse 2.5s ease-in-out infinite; }

        /* Input icon styling */
        .login-input-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--panel-icon-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--panel-accent);
          transition: all 0.3s ease;
          pointer-events: none;
        }
        .login-input:focus ~ .login-input-icon,
        .group:focus-within .login-input-icon {
          background: var(--panel-accent);
          color: white;
          transform: translateY(-50%) scale(1.05);
        }
        .login-input-icon { transition: all 0.3s ease; }

        /* Error message slide */
        @keyframes login-error-in {
          0% { opacity: 0; transform: translateX(-6px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .login-error { animation: login-error-in 0.25s ease-out; }

        /* Submit button shine sweep */
        @keyframes login-shine-sweep {
          0% { transform: translateX(-120%) skewX(-20deg); }
          100% { transform: translateX(220%) skewX(-20deg); }
        }
        .login-shine {
          position: absolute;
          top: 0;
          left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
          transform: translateX(-120%) skewX(-20deg);
          pointer-events: none;
        }
        .login-submit:hover .login-shine {
          animation: login-shine-sweep 0.9s ease-in-out;
        }

        /* Divider badge */
        .login-divider-badge {
          backdrop-filter: blur(4px);
          letter-spacing: 0.05em;
        }

        /* Google logo spin on hover */
        .login-google:hover .login-google-logo {
          transform: rotate(10deg) scale(1.1);
        }
        .login-google-logo {
          transition: transform 0.3s ease;
        }

        /* Shield pulse */
        @keyframes login-shield-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        .login-shield { animation: login-shield-pulse 3s ease-in-out infinite; }

        /* Reduce motion */
        @media (prefers-reduced-motion: reduce) {
          .login-ken-burns,
          .login-blob,
          .login-particle,
          .login-glass-card,
          .login-star,
          .login-gradient-text,
          .login-form-blob,
          .login-logo-glow,
          .login-rocket,
          .login-diamond,
          .login-shield {
            animation: none !important;
          }
          .login-form-card,
          .login-field {
            animation-duration: 0.01s !important;
          }
        }
      `}</style>
    </div>
  );
}

export default LoginForm;