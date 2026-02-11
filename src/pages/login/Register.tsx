import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  FiMail,
  FiLock,
  FiUser,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiUserPlus,
} from "react-icons/fi";
import { toast } from "react-toastify";
import apiClient from "../../apiClient/apiClient";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../utils/error";
import { FaStar } from "react-icons/fa";

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

type SendVerifyResponse = { ok: boolean };

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
  const email = watch("email");
  const username = watch("username");

  // Password strength checker (o'zgartirmadim)
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { strength: 0, label: "", color: "", textColor: "" };
    let strength = 0;
    if (pass.length >= 6) strength += 1;
    if (pass.match(/[a-z]/)) strength += 1;
    if (pass.match(/[A-Z]/)) strength += 1;
    if (pass.match(/[0-9]/)) strength += 1;
    if (pass.match(/[^a-zA-Z0-9]/)) strength += 1;

    const levels = [
      { label: "Weak", color: "bg-red-500", textColor: "text-red-500" },
      { label: "Fair", color: "bg-orange-500", textColor: "text-orange-500" },
      { label: "Good", color: "bg-yellow-500", textColor: "text-yellow-500" },
      { label: "Strong", color: "bg-teal-500", textColor: "text-teal-500" },
      {
        label: "Very Strong",
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
      toast.error("🔐 Passwords do not match", {
        style: {
          borderRadius: "12px",
          background: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fecaca",
        },
      });
      return;
    }

    try {
      const created = await apiClient.post<CreateUserResponse>("/users/", {
        username: data.username,
        email: data.email,
        password: data.password,
      });

      try {
        await apiClient.post("/mail/send-verify", {
          email: created.data.email,
        });

        toast.success("📩 Verification link has been sent to your email!", {
          icon: <FaStar />,
          style: {
            borderRadius: "16px",
            background: "linear-gradient(135deg, #14b8a6 0%, #10b981 100%)",
            color: "#fff",
            fontWeight: 500,
            boxShadow: "0 10px 25px rgba(20, 184, 166, 0.3)",
          },
        });
      } catch (mailErr) {
        toast.warning(
          "Account created, but verification email could not be sent. You can resend it from the login page.",
          { autoClose: 6000 },
        );
        console.error("send-verify error:", mailErr);
      }

      reset();

      // 3) ✅ Check email page ga yuboramiz
      navigate("/check-email", { state: { email: created.data.email } });
    } catch (error: unknown) {
      const status = isAxiosError(error) ? error.response?.status : undefined;

      const message = isAxiosError(error)
        ? (error.response?.data as any)?.detail ||
          (error.response?.data as any)?.message ||
          (error.response?.data as any)?.error ||
          "Registration failed. Please try again."
        : "Registration failed. Please try again.";

      if (status === 409) {
        toast.error("📧 This email is already registered", {
          style: {
            borderRadius: "12px",
            background: "#fff3cd",
            color: "#856404",
            border: "1px solid #ffeeba",
          },
        });
      } else {
        toast.error(getErrorMessage(error) || message);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-4 animate-fade-in">
        <h2 className="text-2xl mt-2 font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
          Create Account
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Register qiling — keyin emailingizga tasdiqlash linki yuboriladi.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Username */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <FiUser className="w-4 h-4 text-teal-500" />
            Username
          </label>

          <div
            className={`relative group transition-all duration-300 ${isFocused.username ? "scale-[1.02]" : ""}`}
          >
            <div
              className={`
                absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-emerald-500 
                rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500
                ${errors.username ? "!opacity-50 from-red-400 to-rose-500" : ""}
                ${isFocused.username ? "opacity-30" : ""}
              `}
            />
            <div className="relative">
              <input
                type="text"
                placeholder="johndoe"
                className={`
                  w-full px-5 py-4 bg-white/80 backdrop-blur-sm border-2 rounded-2xl text-sm
                  transition-all duration-300 placeholder:text-slate-400 focus:outline-none focus:ring-4
                  ${
                    errors.username
                      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                      : "border-teal-200 focus:border-teal-500 focus:ring-teal-100"
                  }
                `}
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: "Only letters, numbers and underscore",
                  },
                })}
                onFocus={() => setIsFocused((p) => ({ ...p, username: true }))}
                onBlur={() => setIsFocused((p) => ({ ...p, username: false }))}
              />
              {username && !errors.username && (
                <FiCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
              )}
            </div>
          </div>

          {errors.username && (
            <p className="text-xs text-red-500 mt-1 ml-1 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full" />
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <FiMail className="w-4 h-4 text-teal-500" />
            Email Address
          </label>

          <div
            className={`relative group transition-all duration-300 ${isFocused.email ? "scale-[1.02]" : ""}`}
          >
            <div
              className={`
                absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-emerald-500 
                rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500
                ${errors.email ? "!opacity-50 from-red-400 to-rose-500" : ""}
                ${isFocused.email ? "opacity-30" : ""}
              `}
            />
            <div className="relative">
              <input
                type="email"
                placeholder="hello@example.com"
                className={`
                  w-full px-5 py-4 bg-white/80 backdrop-blur-sm border-2 rounded-2xl text-sm
                  transition-all duration-300 placeholder:text-slate-400 focus:outline-none focus:ring-4
                  ${
                    errors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                      : "border-teal-200 focus:border-teal-500 focus:ring-teal-100"
                  }
                `}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Please enter a valid email",
                  },
                })}
                onFocus={() => setIsFocused((p) => ({ ...p, email: true }))}
                onBlur={() => setIsFocused((p) => ({ ...p, email: false }))}
              />
              {email && !errors.email && (
                <FiCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
              )}
            </div>
          </div>

          {errors.email && (
            <p className="text-xs text-red-500 mt-1 ml-1 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <FiLock className="w-4 h-4 text-teal-500" />
            Password
          </label>

          <div
            className={`relative group transition-all duration-300 ${isFocused.password ? "scale-[1.02]" : ""}`}
          >
            <div
              className={`
                absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-emerald-500 
                rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500
                ${errors.password ? "!opacity-50 from-red-400 to-rose-500" : ""}
                ${isFocused.password ? "opacity-30" : ""}
              `}
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                className={`
                  w-full px-5 py-4 bg-white/80 backdrop-blur-sm border-2 rounded-2xl text-sm
                  transition-all duration-300 placeholder:text-slate-400 focus:outline-none focus:ring-4 pr-14
                  ${
                    errors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                      : "border-teal-200 focus:border-teal-500 focus:ring-teal-100"
                  }
                `}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                onFocus={() => setIsFocused((p) => ({ ...p, password: true }))}
                onBlur={() => setIsFocused((p) => ({ ...p, password: false }))}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-500 transition-colors duration-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <FiEye className="w-5 h-5" />
                ) : (
                  <FiEyeOff className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Strength (o'zgartirmadim) */}
          {password && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all duration-500 rounded-full`}
                    style={{
                      width: `${(passwordStrength.strength / 5) * 100}%`,
                    }}
                  />
                </div>
                <span
                  className={`text-xs font-medium ${passwordStrength.textColor}`}
                >
                  {passwordStrength.label}
                </span>
              </div>
            </div>
          )}

          {errors.password && (
            <p className="text-xs text-red-500 mt-1 ml-1 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <FiLock className="w-4 h-4 text-teal-500" />
            Confirm Password
          </label>

          <div
            className={`relative group transition-all duration-300 ${isFocused.confirmPassword ? "scale-[1.02]" : ""}`}
          >
            <div
              className={`
                absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-emerald-500 
                rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500
                ${errors.confirmPassword ? "!opacity-50 from-red-400 to-rose-500" : ""}
                ${isFocused.confirmPassword ? "opacity-30" : ""}
              `}
            />
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your password"
                className={`
                  w-full px-5 py-4 bg-white/80 backdrop-blur-sm border-2 rounded-2xl text-sm
                  transition-all duration-300 placeholder:text-slate-400 focus:outline-none focus:ring-4 pr-14
                  ${
                    errors.confirmPassword
                      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                      : "border-teal-200 focus:border-teal-500 focus:ring-teal-100"
                  }
                `}
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                onFocus={() =>
                  setIsFocused((p) => ({ ...p, confirmPassword: true }))
                }
                onBlur={() =>
                  setIsFocused((p) => ({ ...p, confirmPassword: false }))
                }
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-500 transition-colors duration-200"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <FiEye className="w-5 h-5" />
                ) : (
                  <FiEyeOff className="w-5 h-5" />
                )}
              </button>

              {watch("confirmPassword") &&
                watch("confirmPassword") === password && (
                  <FiCheckCircle className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                )}
            </div>
          </div>

          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1 ml-1 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full" />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            relative w-full py-4 px-6 rounded-2xl mt-6
            bg-gradient-to-r from-teal-500 to-emerald-500
            text-white font-semibold text-sm
            transform transition-all duration-300
            hover:shadow-xl hover:shadow-teal-200/50
            hover:scale-[1.02] active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:scale-100 disabled:hover:shadow-none
            overflow-hidden group
          `}
        >
          <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <FiUserPlus className="w-5 h-5" />
                <span>Create Account</span>
              </>
            )}
          </span>
        </button>
      </form>
    </div>
  );
}

export default Register;
