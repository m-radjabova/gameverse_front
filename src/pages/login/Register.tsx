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
  FaChalkboardTeacher,
  FaBrain,
  FaGamepad,
  FaStar,
} from "react-icons/fa";
import { GiPlanetCore, GiBrain, GiTrophy, GiBookshelf } from "react-icons/gi";
import { HiOutlineAcademicCap } from "react-icons/hi";
import { toast } from "react-toastify";
import apiClient from "../../apiClient/apiClient";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../utils/error";

import registerIllustration from "../../assets/hero.png";

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
  const [isFocused, setIsFocused] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
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
      {
        label: "O'rtacha",
        color: "bg-orange-500",
        textColor: "text-orange-500",
      },
      { label: "Yaxshi", color: "bg-yellow-500", textColor: "text-yellow-500" },
      { label: "Kuchli", color: "bg-teal-500", textColor: "text-teal-500" },
      {
        label: "Juda kuchli",
        color: "bg-emerald-500",
        textColor: "text-emerald-500",
      },
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
      toast.error("Parollar mos kelmadi", {
        style: {
          borderRadius: "20px",
          background: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fecaca",
        },
      });
      return;
    }

    try {
      await apiClient.post<CreateUserResponse>("/users/", {
        username: data.username,
        email: data.email,
        password: data.password,
      });

      toast.success("Hisob muvaffaqiyatli yaratildi!", {
        icon: <FaStar className="text-[#ffd966]" />,
        style: {
          borderRadius: "20px",
          background: "linear-gradient(135deg, #d42d73, #b0134d)",
          color: "#fff",
          boxShadow: "0 10px 30px rgba(210, 45, 115, 0.3)",
        },
      });

      reset();
      navigate("/login");
    } catch (error: unknown) {
      const status = isAxiosError(error) ? error.response?.status : undefined;

      if (status === 409) {
        toast.error("Bu email allaqachon ro'yxatdan o'tgan", {
          style: {
            borderRadius: "20px",
            background: "#fff3cd",
            color: "#856404",
            border: "1px solid #ffeeba",
          },
        });
      } else {
        toast.error(
          getErrorMessage(error) || "Ro'yxatdan o'tish amalga oshmadi",
        );
      }
    }
  };
  return (
    <div className="h-screen p-20 w-screen bg-gradient-to-br from-[#d42d73] via-[#c2185b] to-[#b0134d] fixed top-0 left-0">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 ">
        {/* Floating educational icons */}
        <div className="absolute top-[5%] left-[2%]">
          <GiBookshelf className="text-7xl lg:text-8xl text-white/10" />
        </div>
        <div className="absolute top-[10%] right-[2%]">
          <HiOutlineAcademicCap className="text-8xl lg:text-9xl text-white/10" />
        </div>
        <div className="absolute bottom-[15%] left-[3%]">
          <GiBrain className="text-7xl lg:text-8xl text-white/10" />
        </div>
        <div className="absolute bottom-[10%] right-[2%]">
          <GiTrophy className="text-8xl lg:text-9xl text-[#ffd700]/20" />
        </div>

        {/* Orbital rings */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
          <div className="relative w-[600px] lg:w-[1000px] h-[600px] lg:h-[1000px]">
            <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
            <div className="absolute inset-24 lg:inset-32 border-2 border-white/15 rounded-full" />
            <div className="absolute inset-48 lg:inset-64 border border-white/20 rounded-full" />
          </div>
        </div>

        {/* Floating particles */}
        <div className="absolute top-[15%] left-[10%] w-1.5 h-1.5 bg-white/30 rounded-full " />
        <div className="absolute top-[70%] right-[15%] w-2 h-2 bg-[#ffd966]/30 rounded-full" />
        <div className="absolute bottom-[20%] left-[20%] w-1.5 h-1.5 bg-white/20 rounded-full" />
      </div>
      {/* Main Container - Full screen centered */}
      <div className="relative z-20 h-full w-full flex items-center justify-center px-4 lg:px-8">
        <div className="flex w-full max-w-9xl flex-col lg:flex-row items-center justify-center gap-4 lg:gap-12">
          {/* Left Side - Illustration & Content */}
          <div className="flex-1 max-w-lg lg:max-w-xl text-center lg:text-left mt-10">
            <div className="relative">
              {/* Floating badges */}
              <div className="absolute -top-8 -left-8 bg-white/10 backdrop-blur-lg rounded-2xl p-3 hidden lg:block">
                <div className="flex items-center gap-2">
                  <FaGraduationCap className="text-2xl text-[#ffd966]" />
                  <div>
                    <p className="text-white text-xs font-bold">50K+</p>
                    <p className="text-white/60 text-xs">O'quvchilar</p>
                  </div>
                </div>
              </div>

              {/* Main Illustration */}
              <div className="relative mb-4 lg:mb-0">
                <img
                  src={registerIllustration}
                  alt="Register illustration"
                  className="relative z-10 w-full max-w-[250px] lg:max-w-[300px] mx-auto lg:mx-0 object-contain drop-shadow-2xl"
                />
              </div>

              {/* Text Content */}
              <div className="mt-2 lg:mt-4 space-y-2">
                <h1 className="font-bebas text-4xl lg:text-6xl text-white leading-tight">
                  HOZIR RO'YXATDAN
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ffd966] to-[#ffb347]">
                    O'TING
                  </span>
                </h1>

                <p className="text-white/85 text-sm lg:text-base max-w-md mx-auto lg:mx-0 line-clamp-2-reg">
                  1000+ interaktiv mashg'ulotlar va o'yinlar sizni kutmoqda
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start mt-3">
                  <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <FaGamepad className="text-[#ffd966] text-xs" />
                    <span className="text-white text-xs">O'yinlar</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <FaBrain className="text-[#ffd966] text-xs" />
                    <span className="text-white text-xs">Interaktiv</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <FaChalkboardTeacher className="text-[#ffd966] text-xs" />
                    <span className="text-white text-xs">Moslashuvchan</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="flex-1 w-full max-w-lg lg:max-w-xl">
            <div className="group perspective-1000">
              
              {/* Main Card */}
              <div className="relative rounded-[30px] lg:rounded-[40px] bg-white/10 backdrop-blur-xl p-7 lg:p-10 shadow-2xl border border-white/20">
                {/* Inner glow */}
                <div className="absolute inset-0 rounded-[30px] lg:rounded-[40px] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_70%)]" />

                {/* Content */}
                <div className="relative">
                  {/* Logo and Title */}
                  <div className="text-center mb-4 lg:mb-6">
                    <div className="inline-flex items-center justify-center gap-1 mb-2">
                      <div className="relative">
                        <GiPlanetCore className="text-4xl lg:text-5xl text-[#ffd966]" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#ffd966] rounded-full " />
                      </div>
                      <FaRocket className="text-3xl lg:text-4xl text-[#ffb347]" />
                    </div>
                    <h2 className="font-bebas text-3xl lg:text-4xl text-white mb-1 tracking-wider">
                      RO'YXATDAN O'TISH
                    </h2>
                    <p className="text-white/70 text-sm">
                      Hisob yarating va boshlang
                    </p>
                  </div>

                  {/* Register Form */}
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-3 lg:space-y-4"
                  >
                    {/* Username Field */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-white/90">
                        Foydalanuvchi nomi
                      </label>
                      <div
                        className={`relative group/input transition-all duration-300 ${
                          isFocused.username ? "translate-y-[-1px]" : ""
                        }`}
                      >
                        <div
                          className={`pointer-events-none absolute -inset-[2px] rounded-xl bg-gradient-to-r from-[#ffd966] to-[#ffb347] transition-opacity duration-300 ${
                            isFocused.username ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        <div className="relative flex items-center">
                          <FiUser
                            className={`absolute left-3 text-sm transition-colors ${
                              isFocused.username
                                ? "text-[#b0134d]"
                                : "text-[#7b8794]"
                            }`}
                          />
                          <input
                            type="text"
                            {...register("username", {
                              required: "Username talab qilinadi",
                              minLength: {
                                value: 3,
                                message: "Kamida 3 belgi",
                              },
                            })}
                            onFocus={() =>
                              setIsFocused((prev) => ({
                                ...prev,
                                username: true,
                              }))
                            }
                            onBlur={() =>
                              setIsFocused((prev) => ({
                                ...prev,
                                username: false,
                              }))
                            }
                            autoComplete="username"
                            className="w-full rounded-xl border border-white/35 bg-white/85 pl-10 pr-3 py-3.5 text-base font-medium text-[#1f2937] placeholder:text-[#7b8794] focus:outline-none focus:border-transparent focus:ring-0 transition-all"
                            placeholder="johndoe"
                          />
                        </div>
                      </div>
                      {errors.username && (
                        <p className="text-xs text-red-400">
                          {errors.username.message as string}
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-white/90">
                        Email
                      </label>
                      <div
                        className={`relative group/input transition-all duration-300 ${
                          isFocused.email ? "translate-y-[-1px]" : ""
                        }`}
                      >
                        <div
                          className={`pointer-events-none absolute -inset-[2px] rounded-xl bg-gradient-to-r from-[#ffd966] to-[#ffb347] transition-opacity duration-300 ${
                            isFocused.email ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        <div className="relative flex items-center">
                          <FiMail
                            className={`absolute left-3 text-sm transition-colors ${
                              isFocused.email
                                ? "text-[#b0134d]"
                                : "text-[#7b8794]"
                            }`}
                          />
                          <input
                            type="email"
                            {...register("email", {
                              required: "Email talab qilinadi",
                              pattern: {
                                value:
                                  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Noto'g'ri email format",
                              },
                            })}
                            onFocus={() =>
                              setIsFocused((prev) => ({ ...prev, email: true }))
                            }
                            onBlur={() =>
                              setIsFocused((prev) => ({
                                ...prev,
                                email: false,
                              }))
                            }
                            autoComplete="email"
                            className="w-full rounded-xl border border-white/35 bg-white/85 pl-10 pr-3 py-3.5 text-base font-medium text-[#1f2937] placeholder:text-[#7b8794] focus:outline-none focus:border-transparent focus:ring-0 transition-all"
                            placeholder="siz@email.com"
                          />
                        </div>
                      </div>
                      {errors.email && (
                        <p className="text-xs text-red-400">
                          {errors.email.message as string}
                        </p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-white/90">
                        Parol
                      </label>
                      <div
                        className={`relative group/input transition-all duration-300 ${
                          isFocused.password ? "translate-y-[-1px]" : ""
                        }`}
                      >
                        <div
                          className={`pointer-events-none absolute -inset-[2px] rounded-xl bg-gradient-to-r from-[#ffd966] to-[#ffb347] transition-opacity duration-300 ${
                            isFocused.password ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        <div className="relative flex items-center">
                          <FiLock
                            className={`absolute left-3 text-sm transition-colors ${
                              isFocused.password
                                ? "text-[#b0134d]"
                                : "text-[#7b8794]"
                            }`}
                          />
                          <input
                            type={showPassword ? "text" : "password"}
                            {...register("password", {
                              required: "Parol talab qilinadi",
                              minLength: {
                                value: 6,
                                message: "Kamida 6 belgi",
                              },
                            })}
                            onFocus={() =>
                              setIsFocused((prev) => ({
                                ...prev,
                                password: true,
                              }))
                            }
                            onBlur={() =>
                              setIsFocused((prev) => ({
                                ...prev,
                                password: false,
                              }))
                            }
                            autoComplete="new-password"
                            className="w-full rounded-xl border border-white/35 bg-white/85 pl-10 pr-10 py-3.5 text-base font-medium text-[#1f2937] placeholder:text-[#7b8794] focus:outline-none focus:border-transparent focus:ring-0 transition-all"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 text-[#7b8794] hover:text-[#b0134d] transition-colors"
                          >
                            {showPassword ? (
                              <FiEyeOff size={14} />
                            ) : (
                              <FiEye size={14} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Password Strength Indicator */}
                      {password && passwordStrength.label && (
                        <div className="mt-1 space-y-1">
                          <div className="flex gap-1 h-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`flex-1 rounded-full transition-all duration-300 ${
                                  i < passwordStrength.strength
                                    ? passwordStrength.color
                                    : "bg-white/10"
                                }`}
                              />
                            ))}
                          </div>
                          <p
                            className={`text-xs ${passwordStrength.textColor}`}
                          >
                            {passwordStrength.label}
                          </p>
                        </div>
                      )}

                      {errors.password && (
                        <p className="text-xs text-red-400">
                          {errors.password.message as string}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-white/90">
                        Parolni tasdiqlang
                      </label>
                      <div
                        className={`relative group/input transition-all duration-300 ${
                          isFocused.confirmPassword ? "translate-y-[-1px]" : ""
                        }`}
                      >
                        <div
                          className={`pointer-events-none absolute -inset-[2px] rounded-xl bg-gradient-to-r from-[#ffd966] to-[#ffb347] transition-opacity duration-300 ${
                            isFocused.confirmPassword ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        <div className="relative flex items-center">
                          <FiLock
                            className={`absolute left-3 text-sm transition-colors ${
                              isFocused.confirmPassword
                                ? "text-[#b0134d]"
                                : "text-[#7b8794]"
                            }`}
                          />
                          <input
                            type={showConfirm ? "text" : "password"}
                            {...register("confirmPassword", {
                              required: "Parolni tasdiqlang",
                              validate: (value) =>
                                value === password || "Parollar mos kelmadi",
                            })}
                            onFocus={() =>
                              setIsFocused((prev) => ({
                                ...prev,
                                confirmPassword: true,
                              }))
                            }
                            onBlur={() =>
                              setIsFocused((prev) => ({
                                ...prev,
                                confirmPassword: false,
                              }))
                            }
                            autoComplete="new-password"
                            className="w-full rounded-xl border border-white/35 bg-white/85 pl-10 pr-10 py-3.5 text-base font-medium text-[#1f2937] placeholder:text-[#7b8794] focus:outline-none focus:border-transparent focus:ring-0 transition-all"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 text-[#7b8794] hover:text-[#b0134d] transition-colors"
                          >
                            {showConfirm ? (
                              <FiEyeOff size={14} />
                            ) : (
                              <FiEye size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-xs text-red-400">
                          {errors.confirmPassword.message as string}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative w-full rounded-xl bg-gradient-to-r from-[#ffd966] to-[#ffb347] py-3.5 text-base font-bold text-[#b0134d] shadow-[0_5px_0_#8a0f3b] hover:translate-y-0.5 hover:shadow-[0_4px_0_#8a0f3b] active:translate-y-1 active:shadow-[0_3px_0_#8a0f3b] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-1">
                        {isSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-[#b0134d] border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs">
                              Ro'yxatdan o'tish...
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs">RO'YXATDAN O'TISH</span>
                            <FiArrowRight className="  text-xs" />
                          </>
                        )}
                      </span>
                       </button>
                  </form>

                  {/* Login Link */}
                  <p className="mt-3 text-center text-white/60 text-xs">
                    Hisobingiz bormi?{" "}
                    <button
                      onClick={() => navigate("/login")}
                      className="text-[#ffd966] hover:text-[#ffb347] font-semibold hover:underline transition-all  inline-flex items-center gap-0.5"
                    >
                      Kirish
                      <FiArrowRight className="text-xs" />
                    </button>
                  </p>

                  {/* Security Badge */}
                  <div className="mt-2 flex items-center justify-center gap-1 text-white/40 text-xs">
                    <FaShieldAlt className="text-[#ffd966] text-xs" />
                    <span>256-bit encryption</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
