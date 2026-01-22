
import { Link, useNavigate } from "react-router-dom";

import useContextPro from "../../hooks/useContextPro";
import { useForm } from "react-hook-form";

type LoginFormValues = {
  username: string;
  password: string;
};

export default function Login() {
  const ctx = useContextPro();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { username: "", password: "" },
  });

  if (!ctx) return null;

  const { login, state } = ctx;

  const onSubmit = async (data: LoginFormValues) => {
    await login(data.username, data.password);

    const savedUser = localStorage.getItem("user");
    const role = savedUser ? JSON.parse(savedUser)?.role : null;

    if (role === "admin") {
        navigate("/admin", { replace: true });
    } else {
        navigate("/home", { replace: true });
    }
    };


  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">
            Please sign in to your account
          </p>

          {state.error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
              {state.error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Username
              </label>
              <input
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your username"
                {...register("username", {
                  required: "Username is required",
                  minLength: { value: 3, message: "Minimum 3 characters" },
                })}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 4, message: "Minimum 4 characters" },
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={state.isLoading}
              className="w-full rounded-xl bg-indigo-600 text-white font-semibold py-2.5 hover:bg-indigo-700 disabled:opacity-70"
            >
              {state.isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-4 text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link
              className="font-semibold text-indigo-600 hover:text-indigo-700"
              to="/signup"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
