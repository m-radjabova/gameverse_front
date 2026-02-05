import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import apiClient from "../../apiClient/apiClient";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";

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

function RegisterForm() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormInputs>();

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const password = watch("password");

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await apiClient.post<CreateUserResponse>("/users/", {
        username: data.username,
        email: data.email,
        password: data.password,
      });

      toast.success("🎉 Registration successful!");
      reset();
      navigate("/login");
    } catch (error: unknown) {
      const status = isAxiosError(error) ? error.response?.status : undefined;

      const message = isAxiosError(error)
        ? (error.response?.data as any)?.message ||
          (error.response?.data as any)?.error ||
          "Registration failed. Please try again."
        : "Registration failed. Please try again.";

      if (status === 409) {
        toast.error("This email is already registered.");
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
      {/* EMAIL */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Email Address
        </label>
        <input
          type="email"
          placeholder="Enter your email"
          className="mt-2 w-full rounded-full border border-teal-300 px-5 py-3 text-sm outline-none focus:border-teal-500"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Invalid email address",
            },
          })}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* USERNAME */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Username
        </label>
        <input
          type="text"
          placeholder="Enter your username"
          className="mt-2 w-full rounded-full border border-teal-300 px-5 py-3 text-sm outline-none focus:border-teal-500"
          {...register("username", {
            required: "Username is required",
            minLength: {
              value: 3,
              message: "Username must be at least 3 characters",
            },
          })}
        />
        {errors.username && (
          <p className="mt-1 text-xs text-red-500">
            {errors.username.message}
          </p>
        )}
      </div>

      {/* PASSWORD */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Password
        </label>
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
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* CONFIRM PASSWORD */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Confirm Password
        </label>
        <div className="relative mt-2">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm your password"
            className="w-full rounded-full border border-teal-300 px-5 py-3 pr-12 text-sm outline-none focus:border-teal-500"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          >
            {showConfirm ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-500">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-full rounded-full bg-teal-500 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 active:scale-[0.99] disabled:opacity-60"
      >
        {isSubmitting ? "Creating account..." : "Register"}
      </button>
    </form>
  );
}

export default RegisterForm;
