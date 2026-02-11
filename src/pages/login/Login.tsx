import { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import { 
  FiMail, FiLock, FiEye, FiEyeOff, FiLogIn , FiArrowRight 
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";

import useContextPro from "../../hooks/useContextPro";
import apiClient from "../../apiClient/apiClient";
import type { User } from "../../types/types";
import { getErrorMessage } from "../../utils/error";
import { setTokens } from "../../utils/auth";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { FaStar } from "react-icons/fa";

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer" | string;
};

type Props = {
  showPassword?: boolean;
  setShowPassword?: (value: boolean) => void;
};

function LoginForm({ showPassword, setShowPassword }: Props) {
  const { dispatch } = useContextPro();
  const navigate = useNavigate();

  const [localShowPassword, setLocalShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });

  const isShow = showPassword ?? localShowPassword;
  const setIsShow = setShowPassword ?? setLocalShowPassword;

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

      const CustomToast = () => (
        <div className="flex items-center gap-4 w-[340px] rounded-xl bg-emerald-50 px-5 py-4 text-emerald-900 border border-emerald-100 animate-toast-in">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <FaStar className="text-lg" />
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-semibold leading-tight">
              Welcome back 👋
            </h5>
            <p className="text-xs text-emerald-700 mt-1">
              You have successfully logged in
            </p>
          </div>
        </div>
      );
       toast(CustomToast, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "!bg-transparent !p-0 !shadow-none",
        progressClassName: "bg-emerald-500",
      });
    } catch (error: unknown) {
      const status = isAxiosError(error) ? error.response?.status : undefined;

      if (status === 401) {
        toast.error("🔐 Invalid email or password", {
          style: {
            borderRadius: "12px",
            background: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #fecaca",
          },
        });
      } else if (status === 404) {
        toast.error("👤 Account not found", {
          style: {
            borderRadius: "12px",
            background: "#fff3cd",
            color: "#856404",
            border: "1px solid #ffeeba",
          },
        });
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
      
      toast.success("🌈 Google login successful!", {
        icon: <FcGoogle />,
        style: {
          borderRadius: "16px",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          color: "#fff",
          boxShadow: "0 10px 25px rgba(79, 70, 229, 0.3)",
        },
      });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Form Header */}
      <div className="text-center mb-6 animate-fade-in">
        <h2 className="text-2xl mt-6 font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          Welcome Back
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Enter your credentials to access your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <FiMail className="w-4 h-4 text-teal-500" />
            Email Address
          </label>
          <div className={`
            relative group transition-all duration-300
            ${isFocused.email ? 'scale-[1.02]' : ''}
          `}>
            <div className={`
              absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-emerald-500 
              rounded-2xl blur opacity-0 group-hover:opacity-30 
              transition duration-500
              ${errors.email ? '!opacity-50 from-red-400 to-rose-500' : ''}
              ${isFocused.email ? 'opacity-30' : ''}
            `} />
            <div className="relative">
              <input
                type="email"
                placeholder="hello@example.com"
                className={`
                  w-full px-5 py-4 bg-white/80 backdrop-blur-sm
                  border-2 rounded-2xl text-sm
                  transition-all duration-300
                  placeholder:text-slate-400
                  focus:outline-none focus:ring-4
                  ${errors.email 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                    : 'border-slate-200 focus:border-teal-500 focus:ring-teal-100'
                  }
                `}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Please enter a valid email",
                  },
                })}
                onFocus={() => setIsFocused(prev => ({ ...prev, email: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, email: false }))}
              />
            </div>
          </div>
          {errors.email && (
            <p className="text-sm text-red-500 mt-2">{errors.email?.message as string | undefined}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <FiLock className="w-4 h-4 text-teal-500" />
            Password
          </label>
          <div className={`
            relative group transition-all duration-300
            ${isFocused.password ? 'scale-[1.02]' : ''}
          `}>
            <div className={`
              absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-emerald-500 
              rounded-2xl blur opacity-0 group-hover:opacity-30 
              transition duration-500
              ${errors.password ? '!opacity-50 from-red-400 to-rose-500' : ''}
              ${isFocused.password ? 'opacity-30' : ''}
            `} />
            <div className="relative">
              <input
                type={isShow ? "text" : "password"}
                placeholder="Enter your password"
                className={`
                  w-full px-5 py-4 bg-white/80 backdrop-blur-sm
                  border-2 rounded-2xl text-sm
                  transition-all duration-300
                  placeholder:text-slate-400
                  focus:outline-none focus:ring-4
                  pr-14
                  ${errors.password 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                    : 'border-slate-200 focus:border-teal-500 focus:ring-teal-100'
                  }
                `}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                onFocus={() => setIsFocused(prev => ({ ...prev, password: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, password: false }))}
              />
              <button
                type="button"
                onClick={() => setIsShow(!isShow)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 
                         hover:text-teal-500 transition-colors duration-200"
                aria-label={isShow ? "Hide password" : "Show password"}
              >
                {isShow ? <FiEye className="w-5 h-5" /> : <FiEyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 mt-2">{errors.password?.message as string | undefined}</p>
          )}
          
          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs text-slate-500 hover:text-teal-600 transition-colors 
                       flex items-center gap-1 group"
            >
              Forgot password?
              <FiArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            relative w-full py-4 px-6 rounded-2xl
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
          <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 
                         transition-transform duration-300" />
          <span className="relative flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <FiLogIn className="w-5 h-5" />
                <span>Sign In</span>
              </>
            )}
          </span>
        </button>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-gradient-to-br from-slate-50 to-white 
                           text-slate-500 font-medium">
              OR CONTINUE WITH
            </span>
          </div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-1 gap-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className={`
              relative py-3.5 px-4 rounded-xl
              bg-white border-2 border-slate-200
              text-sm font-medium text-slate-700
              transition-all duration-300
              hover:border-teal-500 hover:shadow-lg hover:shadow-teal-100
              hover:scale-[1.02] active:scale-[0.98]
              disabled:opacity-50 disabled:cursor-not-allowed
              group overflow-hidden
            `}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-teal-50 to-emerald-50 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center justify-center gap-2">
              <FcGoogle className="w-5 h-5" />
              {isGoogleLoading ? "Connecting..." : "Google"}
            </span>
          </button> 
        </div>
      </form>
    </div>
  );
}

export default LoginForm;