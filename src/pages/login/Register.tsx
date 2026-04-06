import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiArrowRight,
} from "react-icons/fi";
import {
  FaRocket,
  FaShieldAlt,
  FaGraduationCap,
} from "react-icons/fa";
import { GiPlanetCore} from "react-icons/gi";
import { toast } from "react-toastify";
import apiClient from "../../apiClient/apiClient";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../utils/error";
import loginImg from "../../assets/register_img.png";
import useHomeTheme from "../../hooks/useHomeTheme";

type RegisterFormInputs = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type CreateUserResponse = {
  id: string;
  username: string;
  email: string;
  roles: string[];
  created_at: string;
};

function Register() {
  const isDarkMode = useHomeTheme();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormInputs>({ mode: "onChange" });

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const password = watch("password");

  // Password strength checker
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { strength: 0, label: "", color: "", textColor: "" };
    let strength = 0;
    if (pass.length >= 6) strength += 1;
    if (pass.match(/[a-z]/)) strength += 1;
    if (pass.match(/[A-Z]/)) strength += 1;
    if (pass.match(/[0-9]/)) strength += 1;
    if (pass.match(/[^a-zA-Z0-9]/)) strength += 1;

    const levels = [
      { label: "Zaif", color: "bg-red-500", textColor: "text-red-500" },
      { label: "O'rtacha", color: "bg-orange-500", textColor: "text-orange-500" },
      { label: "Yaxshi", color: "bg-yellow-500", textColor: "text-yellow-500" },
      { label: "Kuchli", color: "bg-teal-500", textColor: "text-teal-500" },
      { label: "Juda kuchli", color: "bg-emerald-500", textColor: "text-emerald-500" },
    ];

    const idx = Math.min(strength, 4);
    return {
      strength: Math.min(strength, 5),
      label: levels[idx]?.label || "",
      color: levels[idx]?.color || "",
      textColor: levels[idx]?.textColor || "",
    };
  };

  const passwordStrength = getPasswordStrength(password || "");

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Parollar mos kelmadi");
      return;
    }

    try {
      await apiClient.post<CreateUserResponse>("/users/", {
        username: data.username,
        email: data.email,
        password: data.password,
      });

      toast.success("Hisob muvaffaqiyatli yaratildi!");

      reset();
      navigate("/login");
    } catch (error: unknown) {
      const status = isAxiosError(error) ? error.response?.status : undefined;

      if (status === 409) {
        toast.error("Bu email allaqachon ro'yxatdan o'tgan");
      } else {
        toast.error(getErrorMessage(error) || "Ro'yxatdan o'tish amalga oshmadi");
      }
    }
  };

  return (
    <div
      data-home-theme={isDarkMode ? "dark" : "light"}
      className="auth-theme fixed inset-0 h-screen w-full overflow-hidden bg-[var(--panel-page-base)]"
    >
      
      {/* Split Layout */}
      <div className="flex h-full w-full">
        {/* Right Side - Image */}
        <div className="hidden lg:block lg:w-1/2 h-full relative overflow-hidden">
          {/* Decorative overlay */}
          <div className="absolute inset-0 bg-black/10" />
          
          {/* Image Container */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-700">
              <img
                src={loginImg}
                alt="Students learning"
                className="w-full h-full object-cover"
              />
              
              {/* Image overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
              {/* Image text */}
              <div className="absolute bottom-8 left-8 text-white">
                <p className="text-sm font-light opacity-90">Ro'yxatdan o'ting</p>
                <h3 className="text-3xl font-bold"></h3>
                <div className="flex items-center gap-2 mt-2">
                  <FaGraduationCap className="text-[#ffd966]" />
                  <span className="text-xs opacity-80">O'yin uchun o'zingiz
                    xoxlagandek savollar, topshiriqlar qo'shib biling</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-2xl animate-float-soft" />
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float-slow" />
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
                  Hisob yarating
                </h1>
                <p className="text-sm text-[var(--panel-text-soft)]">
                  Platformaga qo'shiling va o'rganishni boshlang
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Username Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[var(--panel-text)]">
                    Foydalanuvchi nomi
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--panel-muted)] text-base" />
                    <input
                      type="text"
                      {...register("username", {
                        required: "Username talab qilinadi",
                        minLength: {
                          value: 3,
                          message: "Kamida 3 belgi",
                        },
                      })}
                      className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] pl-10 pr-3 py-3.5 text-sm text-[var(--panel-text)] placeholder:text-[var(--panel-muted)] outline-none focus:border-[var(--panel-accent)] focus:shadow-[0_0_0_3px_var(--panel-focus-ring)] transition-all"
                      placeholder="johndoe"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-rose-500">
                      {errors.username.message as string}
                    </p>
                  )}
                </div>

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

                  {/* Password Strength Indicator */}
                  {password && passwordStrength.label && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1 h-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              i < passwordStrength.strength
                                ? passwordStrength.color
                                : "bg-[#f0d9d6]"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-[10px] ${passwordStrength.textColor}`}>
                        {passwordStrength.label} parol
                      </p>
                    </div>
                  )}

                  {errors.password && (
                    <p className="text-xs text-rose-500">
                      {errors.password.message as string}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[var(--panel-text)]">
                    Parolni tasdiqlang
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--panel-muted)] text-base" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      {...register("confirmPassword", {
                        required: "Parolni tasdiqlang",
                        validate: (value) =>
                          value === password || "Parollar mos kelmadi",
                      })}
                      className="w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface-strong)] pl-10 pr-10 py-3.5 text-sm text-[var(--panel-text)] placeholder:text-[var(--panel-muted)] outline-none focus:border-[var(--panel-accent)] focus:shadow-[0_0_0_3px_var(--panel-focus-ring)] transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--panel-muted)] hover:text-[var(--panel-accent)] transition-colors"
                    >
                      {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-rose-500">
                      {errors.confirmPassword.message as string}
                    </p>
                  )}
                </div>
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full overflow-hidden rounded-xl py-3.5 text-sm font-medium text-white shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                  style={{ backgroundImage: "var(--panel-accent-gradient)" }}
                >
                  <span className="relative flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Ro'yxatdan o'tish...</span>
                      </>
                    ) : (
                      <>
                        <span>Ro'yxatdan o'tish</span>
                        <FiArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>

                {/* Login Link */}
                <p className="text-center text-xs text-[var(--panel-muted)]">
                  Hisobingiz bormi?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-[var(--panel-accent)] hover:text-[var(--panel-accent-strong)] font-medium hover:underline transition-all"
                  >
                    Kirish
                  </button>
                </p>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-1 text-[var(--panel-muted)] text-[10px] mt-4">
                  <FaShieldAlt className="text-[var(--panel-accent)]" />
                  <span>256-bit encryption • Secure registration</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float-soft {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        .animate-float-soft {
          animation: float-soft 3s ease-in-out infinite;
        }
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Register;
