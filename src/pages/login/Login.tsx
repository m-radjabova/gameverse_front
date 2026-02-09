import { useForm, type FieldValues } from "react-hook-form";
import { FaEyeSlash, FaUserCheck } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import useContextPro from "../../hooks/useContextPro";
import apiClient from "../../apiClient/apiClient";
import type { User } from "../../types/types";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { isAxiosError } from "axios";
import { getErrorMessage } from "../../utils/error";
import { setTokens } from "../../utils/auth";

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer" | string;
};

type Props = {
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
};

function LoginForm({ showPassword, setShowPassword }: Props) {
  const { dispatch } = useContextPro();
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data: FieldValues) => {
    try {
      const res = await apiClient.post<LoginResponse>("/auth/login", {
        email: data.email,
        password: data.password,
      });

      setTokens(res.data.access_token, res.data.refresh_token);

      const me = await apiClient.get<User>("/users/me");
      const currentUser = me.data;
      dispatch({ type: "SET_USER", payload: currentUser });

      if (currentUser?.roles?.length) {
        localStorage.setItem("role", currentUser.roles.join(","));
      } else {
        localStorage.removeItem("role");
      }

      const CustomToast = () => (
        <div className="flex items-center gap-4 w-[340px] rounded-xl bg-emerald-50 px-5 py-4 text-emerald-900 border border-emerald-100 animate-toast-in">
          {/* Icon */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <FaUserCheck className="text-lg" />
          </div>

          {/* Content */}
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

      navigate("/", { replace: true });
    } catch (error: unknown) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      const message = getErrorMessage(error);

      if (status === 401) {
        toast.error("Email yoki parol noto'g'ri.");
      } else if (status === 404) {
        toast.error("Account topilmadi.");
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
      <div>
        <label className="text-sm font-medium text-slate-700">Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          className="mt-2 w-full rounded-full border border-teal-300 px-5 py-3 text-sm outline-none focus:border-teal-500"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Invalid email format",
            },
          })}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">
            {(errors.email as any).message}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Password</label>
        <div className="relative mt-2">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="w-full rounded-full border border-teal-300 px-5 py-3 pr-12 text-sm outline-none focus:border-teal-500"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>

        {errors.password && (
          <p className="mt-1 text-xs text-red-500">
            {(errors.password as any).message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-full rounded-full bg-teal-500 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 active:scale-[0.99] disabled:opacity-60"
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

export default LoginForm;
