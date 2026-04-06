import { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import {
  FaRocket,
  FaShieldAlt,
  FaGraduationCap,
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

import loginImg from "../../assets/loginImg.png";

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

      if (status === 401) {
        toast.error("Email yoki parol noto'g'ri");
      } else if (status === 404) {
        toast.error("Akkaunt topilmadi");
      } else {
        toast.error(getErrorMessage(error));
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
      
      {/* Split Layout */}
      <div className="flex h-full w-full">
        <div className="hidden lg:block lg:w-1/2 h-full relative overflow-hidden">
          {/* Decorative overlay */}
          <div className="absolute inset-0 bg-black/10" />
          
          {/* Image Container */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full  overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-700">
              {/* Sizning rasmingiz shu yerga qo'yiladi */}
              <img
                src={loginImg}
                alt="Login illustration"
                className="w-full h-full object-cover"
              />
              
              {/* Image overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              
              {/* Image text */}
              <div className="absolute bottom-8 left-8 text-white">
                <p className="text-sm font-light opacity-90">Xush kelibsiz!</p>
                <h3 className="text-3xl font-bold">Gameverse</h3>
                <div className="flex items-center gap-2 mt-2">
                  <FaGraduationCap className="text-[#ffd966]" />
                </div>
              </div>
            </div>
          </div>

        </div>
        
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-[image:var(--panel-page-bg)]">
          <div className="min-h-full flex items-center justify-center p-6 lg:p-8">
            <div className="w-full max-w-md">
              
              {/* Logo & Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center gap-2 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-md animate-pulse-soft bg-[var(--panel-accent)]" />
                    <GiPlanetCore className="relative text-5xl text-[var(--panel-accent)]" />
                  </div>
                  <FaRocket className="text-4xl text-[var(--panel-accent-strong)] animate-float-soft" />
                </div>
                <h1 className="text-3xl font-light text-[var(--panel-text)] mb-2">
                  Xush kelibsiz
                </h1>
                <p className="text-sm text-[var(--panel-text-soft)]">
                  Hisobingizga kirish uchun ma'lumotlaringizni kiriting
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[var(--panel-text)]">
                    Email
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--panel-muted)] text-base" />
                    <input
                      type="email"
                      {...register("email", {
                        required: "Email talab qilinadi",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Noto'g'ri email format",
                        },
                      })}
                      className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] pl-10 pr-3 py-3.5 text-sm text-[var(--panel-text)] placeholder:text-[var(--panel-muted)] outline-none focus:border-[var(--panel-accent)] focus:shadow-[0_0_0_3px_var(--panel-focus-ring)] transition-all"
                      placeholder="siz@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-rose-500">
                      {errors.email.message as string}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[var(--panel-text)]">
                    Parol
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--panel-muted)] text-base" />
                    <input
                      type={showPassword ? "text" : "password"}
                      {...register("password", {
                        required: "Parol talab qilinadi",
                        minLength: {
                          value: 6,
                          message: "Kamida 6 belgi",
                        },
                      })}
                      className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] pl-10 pr-10 py-3.5 text-sm text-[var(--panel-text)] placeholder:text-[var(--panel-muted)] outline-none focus:border-[var(--panel-accent)] focus:shadow-[0_0_0_3px_var(--panel-focus-ring)] transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--panel-muted)] hover:text-[var(--panel-accent)] transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-rose-500">
                      {errors.password.message as string}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-medium text-white shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70"
                  style={{ backgroundImage: "var(--panel-accent-gradient)" }}
                >
                  <span className="relative flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Kirish...</span>
                      </>
                    ) : (
                      <>
                        <span>Kirish</span>
                        <FiArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--panel-border)]"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-[var(--panel-page-base)] text-[var(--panel-muted)]">
                      yoki
                    </span>
                  </div>
                </div>

                {/* Google Login */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="group relative w-full overflow-hidden rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface)] py-3 text-sm font-medium text-[var(--panel-text)] hover:bg-[var(--panel-surface-strong)] hover:-translate-y-0.5 transition-all disabled:opacity-70"
                >
                  <span className="flex items-center justify-center gap-2">
                    {isGoogleLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[var(--panel-text)] border-t-transparent rounded-full animate-spin" />
                        <span>Bog'lanmoqda...</span>
                      </>
                    ) : (
                      <>
                        <FcGoogle className="text-lg" />
                        <span>Google orqali kirish</span>
                      </>
                    )}
                  </span>
                </button>

                {/* Sign Up Link */}
                <p className="text-center text-xs text-[var(--panel-muted)]">
                  Hisobingiz yo'qmi?{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className="text-[var(--panel-accent)] hover:text-[var(--panel-accent-strong)] font-medium hover:underline transition-all"
                  >
                    Ro'yxatdan o'tish
                  </button>
                </p>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-1 text-[var(--panel-muted)] text-[10px] mt-4">
                  <FaShieldAlt className="text-[var(--panel-accent)]" />
                  <span>256-bit encryption • Secure login</span>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LoginForm;
